import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './client';

type AuthState = {
  user: User | null;
  pending: boolean;
  error: string | null;
};

/** A new authenticated account may create only its own `role: user` record.
 * Existing roles are never overwritten by the client.
 * Family membership is separate and is NOT granted here.
 */
async function ensureAccount(user: User): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const ref = doc(db, 'users', user.uid);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    try {
      await setDoc(ref, { uid: user.uid, role: 'user', createdAt: serverTimestamp() });
    } catch (error) {
      // Parallel sign-ins/tabs may create the account first. Never replace an existing role.
      const current = await getDoc(ref);
      if (!current.exists()) throw error;
    }
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null, pending: Boolean(auth), error: null,
  });

  useEffect(() => {
    if (!auth) return;
    let active = true;
    let authRevision = 0;
    const unsubscribe = onAuthStateChanged(auth, async nextUser => {
      const revision = ++authRevision;
      if (!nextUser) {
        if (active) setState({ user: null, pending: false, error: null });
        return;
      }
      if (active) setState({ user: null, pending: true, error: null });
      try {
        await ensureAccount(nextUser);
        if (active && revision === authRevision) {
          setState({ user: nextUser, pending: false, error: null });
        }
      } catch (error) {
        // Firebase sign-in alone isn't enough: block application access if
        // Firestore registration/verification has not succeeded.
        if (active && revision === authRevision) {
          setState({
            user: null,
            pending: false,
            error: error instanceof Error ? `Account setup: ${error.message}` : 'Account setup failed.',
          });
        }
      }
    }, error => {
      if (active) setState({ user: null, pending: false, error: error.message });
    });
    return () => { active = false; authRevision++; unsubscribe(); };
  }, []);

  async function login() {
    if (!auth) return;
    try {
      setState(prev => ({ ...prev, error: null }));
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Sign-in failed.',
      }));
    }
  }

  async function logout() {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Sign-out failed.',
      }));
    }
  }
  return { ...state, login, logout };
}
