import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider } from './client';

type AuthState = {
  user: User | null;
  pending: boolean;
  error: string | null;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null, pending: Boolean(auth), error: null,
  });

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(
      auth,
      user => setState({ user, pending: false, error: null }),
      error => setState({ user: null, pending: false, error: error.message }),
    );
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
