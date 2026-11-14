import { after, before, test } from 'node:test';
import { readFileSync } from 'node:fs';
import {
  initializeTestEnvironment, assertFails, assertSucceeds,
} from '@firebase/rules-unit-testing';
import {
  collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where, serverTimestamp,
} from 'firebase/firestore';

let env;
const user = (uid) => env.authenticatedContext(uid).firestore();
const anon = () => env.unauthenticatedContext().firestore();
const food = (db, id) => doc(db, 'foodCatalog', id);
const family = (db, id) => doc(db, 'families', id);
const plan = (db, id, entry='p1') => doc(db, 'families', id, 'mealPlans', entry);
const member = (db, id, uid) => doc(db, 'families', id, 'members', uid);
const account = (db, uid) => doc(db, 'users', uid);
const privateProfile = (db, uid) => doc(db, 'users', uid, 'private', 'onboarding');

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-plate-planner',
    firestore: {
      host: '127.0.0.1', port: 8080,
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(food(db, 'rice'), { isActive: true, name: 'Test rice' });
    await setDoc(food(db, 'hidden'), { isActive: false, name: 'Hidden food' });
    await setDoc(family(db, 'alpha'), { displayName: 'Alpha' });
    await setDoc(family(db, 'beta'), { displayName: 'Beta' });
    await setDoc(member(db, 'alpha', 'adminA'), { status: 'active', role: 'admin' });
    await setDoc(member(db, 'alpha', 'userA'), { status: 'active', role: 'user' });
    await setDoc(member(db, 'alpha', 'revokedUserA'), { status: 'revoked', role: 'user' });
    await setDoc(member(db, 'beta', 'adminB'), { status: 'active', role: 'admin' });
    await setDoc(plan(db, 'alpha'), { localDate: '2026-01-01', plannedTotals: {} });
    await setDoc(plan(db, 'beta'), { localDate: '2026-01-01', plannedTotals: {} });
  });
});
after(async () => {
  if (env) await env.cleanup();
});

test('new sign-ins may create only their own default user record', async () => {
  const stamp = { role: 'user', uid: 'newUser', createdAt: (await import('firebase/firestore')).serverTimestamp() };
  await assertSucceeds(setDoc(account(user('newUser'), 'newUser'), stamp));
  const stored = await assertSucceeds(getDoc(account(user('newUser'), 'newUser')));
  if (stored.data().role !== 'user') throw new Error('Account role must be user');
  await assertFails(setDoc(account(user('attacker'), 'victim'), { role: 'user', uid: 'victim', createdAt: (await import('firebase/firestore')).serverTimestamp() }));
  await assertFails(setDoc(account(user('elevate'), 'elevate'), { role: 'admin', uid: 'elevate', createdAt: (await import('firebase/firestore')).serverTimestamp() }));
  await assertFails(updateDoc(account(user('newUser'), 'newUser'), { role: 'admin' }));
  await assertFails(deleteDoc(account(user('newUser'), 'newUser')));
  await assertFails(getDoc(account(user('stranger'), 'newUser')));
});

test('unauthenticated users cannot read reference foods or family records', async () => {
  await assertFails(getDoc(food(anon(), 'rice')));
  await assertFails(getDoc(family(anon(), 'alpha')));
});
test('signed-in users read active food but not inactive food', async () => {
  await assertSucceeds(getDoc(food(user('stranger'), 'rice')));
  await assertFails(getDoc(food(user('stranger'), 'hidden')));
  await assertSucceeds(getDocs(query(collection(user('stranger'), 'foodCatalog'), where('isActive', '==', true))));
  await assertFails(getDocs(collection(user('stranger'), 'foodCatalog')));
});
test('members can read their family only', async () => {
  await assertSucceeds(getDoc(family(user('userA'), 'alpha')));
  await assertSucceeds(getDoc(plan(user('userA'), 'alpha')));
  await assertFails(getDoc(family(user('userA'), 'beta')));
  await assertFails(getDoc(plan(user('userA'), 'beta')));
  await assertFails(getDoc(plan(user('adminB'), 'alpha')));
  await assertFails(getDoc(family(user('stranger'), 'alpha')));
});
test('revoked members cannot access records', async () => {
  await assertFails(getDoc(plan(user('revokedUserA'), 'alpha')));
});
test('users can see own membership, not everyone else', async () => {
  await assertSucceeds(getDoc(member(user('userA'), 'alpha', 'userA')));
  await assertFails(getDoc(member(user('userA'), 'alpha', 'adminA')));
  await assertSucceeds(getDoc(member(user('adminA'), 'alpha', 'userA')));
});
test('no client can create food or elevate membership', async () => {
  await assertFails(setDoc(food(user('adminA'), 'fake'), { isActive: true }));
  await assertFails(setDoc(member(user('adminA'), 'alpha', 'stranger'), { role: 'admin', status: 'active' }));
  await assertFails(updateDoc(member(user('userA'), 'alpha', 'userA'), { role: 'admin' }));
  await assertFails(deleteDoc(member(user('adminA'), 'alpha', 'userA')));
});
test('all client writes of family health data remain blocked', async () => {
  await assertFails(setDoc(plan(user('adminA'), 'alpha', 'new'), { localDate: '2026-01-02' }));
  await assertFails(updateDoc(plan(user('adminA'), 'alpha'), { localDate: '2026-01-03' }));
  await assertFails(deleteDoc(plan(user('adminA'), 'alpha')));
});

test('new user can save and update only their own private onboarding', async () => {
  const db = user('newProfile');
  const input = { heightCm: 172, weightKg: 71.5, healthConditions: ['None'], updatedAt: serverTimestamp() };
  await assertSucceeds(setDoc(privateProfile(db, 'newProfile'), input));
  const result = await assertSucceeds(getDoc(privateProfile(db, 'newProfile')));
  if (result.data()?.heightCm !== 172) throw new Error('Missing onboarding height');
  await assertSucceeds(updateDoc(privateProfile(db, 'newProfile'), {
    weightKg: 72, updatedAt: serverTimestamp(),
  }));
  await assertFails(deleteDoc(privateProfile(db, 'newProfile')));
});

test('private health data cannot be accessed by other accounts, even family admins', async () => {
  await assertFails(getDoc(privateProfile(user('stranger'), 'newProfile')));
  await assertFails(getDoc(privateProfile(user('adminA'), 'newProfile')));
  await assertFails(setDoc(privateProfile(user('stranger'), 'newProfile'), {
    heightCm: 171, weightKg: 70, healthConditions: ['None'], updatedAt: serverTimestamp(),
  }));
  await assertFails(getDocs(collection(user('newProfile'), 'users', 'newProfile', 'private')));
});

test('onboarding rejects invalid measurements, unknown fields and inconsistent conditions', async () => {
  const db = user('invalidProfile');
  const base = { heightCm: 170, weightKg: 70, healthConditions: ['None'], updatedAt: serverTimestamp() };
  await assertFails(setDoc(privateProfile(db, 'invalidProfile'), { ...base, heightCm: 0 }));
  await assertFails(setDoc(privateProfile(db, 'invalidProfile'), { ...base, weightKg: 999 }));
  await assertFails(setDoc(privateProfile(db, 'invalidProfile'), { ...base, healthConditions: [] }));
  await assertFails(setDoc(privateProfile(db, 'invalidProfile'), { ...base, healthConditions: ['Diabetes', 'None'] }));
  await assertFails(setDoc(privateProfile(db, 'invalidProfile'), { ...base, healthConditions: ['made-up'] }));
  await assertFails(setDoc(privateProfile(db, 'invalidProfile'), { ...base, role: 'admin' }));
  await assertFails(setDoc(privateProfile(db, 'invalidProfile'), {
    heightCm: 170, weightKg: 70, healthConditions: ['None'], updatedAt: new Date(),
  }));
});
