import { after, before, test } from 'node:test';
import { readFileSync } from 'node:fs';
import {
  initializeTestEnvironment, assertFails, assertSucceeds,
} from '@firebase/rules-unit-testing';
import {
  collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where,
} from 'firebase/firestore';

let env;
const user = (uid) => env.authenticatedContext(uid).firestore();
const anon = () => env.unauthenticatedContext().firestore();
const food = (db, id) => doc(db, 'foodCatalog', id);
const family = (db, id) => doc(db, 'families', id);
const plan = (db, id, entry='p1') => doc(db, 'families', id, 'mealPlans', entry);
const member = (db, id, uid) => doc(db, 'families', id, 'members', uid);

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
    await setDoc(member(db, 'alpha', 'ownerA'), { status: 'active', role: 'owner' });
    await setDoc(member(db, 'alpha', 'helperA'), { status: 'active', role: 'helper' });
    await setDoc(member(db, 'alpha', 'revokedA'), { status: 'revoked', role: 'helper' });
    await setDoc(member(db, 'beta', 'ownerB'), { status: 'active', role: 'owner' });
    await setDoc(plan(db, 'alpha'), { localDate: '2026-01-01', plannedTotals: {} });
    await setDoc(plan(db, 'beta'), { localDate: '2026-01-01', plannedTotals: {} });
  });
});
after(async () => {
  if (env) await env.cleanup();
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
  await assertSucceeds(getDoc(family(user('helperA'), 'alpha')));
  await assertSucceeds(getDoc(plan(user('helperA'), 'alpha')));
  await assertFails(getDoc(family(user('helperA'), 'beta')));
  await assertFails(getDoc(plan(user('helperA'), 'beta')));
  await assertFails(getDoc(plan(user('ownerB'), 'alpha')));
  await assertFails(getDoc(family(user('stranger'), 'alpha')));
});
test('revoked members cannot access records', async () => {
  await assertFails(getDoc(plan(user('revokedA'), 'alpha')));
});
test('helpers can see own membership, not everyone else', async () => {
  await assertSucceeds(getDoc(member(user('helperA'), 'alpha', 'helperA')));
  await assertFails(getDoc(member(user('helperA'), 'alpha', 'ownerA')));
  await assertSucceeds(getDoc(member(user('ownerA'), 'alpha', 'helperA')));
});
test('no client can create food or elevate membership', async () => {
  await assertFails(setDoc(food(user('ownerA'), 'fake'), { isActive: true }));
  await assertFails(setDoc(member(user('ownerA'), 'alpha', 'stranger'), { role: 'owner', status: 'active' }));
  await assertFails(updateDoc(member(user('helperA'), 'alpha', 'helperA'), { role: 'owner' }));
  await assertFails(deleteDoc(member(user('ownerA'), 'alpha', 'helperA')));
});
test('all client writes of family health data remain blocked', async () => {
  await assertFails(setDoc(plan(user('ownerA'), 'alpha', 'new'), { localDate: '2026-01-02' }));
  await assertFails(updateDoc(plan(user('ownerA'), 'alpha'), { localDate: '2026-01-03' }));
  await assertFails(deleteDoc(plan(user('ownerA'), 'alpha')));
});
