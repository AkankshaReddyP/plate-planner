import { useState } from 'react';
import { firebaseConfigured } from './firebase/client';
import { useAuth } from './firebase/useAuth';

export default function App() {
  const [grams, setGrams] = useState(100);
  const { user, pending, error, login, logout } = useAuth();

  return <main>
    <h1>Plate Planner</h1>
    <p>Family nutrition planner — project scaffold</p>
    <aside>Demo only. No medically validated food data or cloud storage is enabled.</aside>
    {firebaseConfigured
      ? <section aria-label="Account">
          {pending ? <p>Checking sign-in…</p>
            : user
              ? <><p>Signed in as {user.displayName || user.email || 'Google user'}. Family access has not been provisioned yet.</p>
                  <button type="button" onClick={() => void logout()}>Sign out</button></>
              : <button type="button" onClick={() => void login()}>Sign in with Google</button>}
          {error && <p role="alert">Authentication error: {error}</p>}
        </section>
      : <p>Firebase sign-in is not configured for this build.</p>}
    <label htmlFor="grams">Demo portion (grams)</label>
    <input id="grams" type="number" min="0" value={grams}
      onChange={e => setGrams(Math.max(0, Number(e.target.value) || 0))}/>
    <p>Selected portion: {grams} g</p>
  </main>;
}
