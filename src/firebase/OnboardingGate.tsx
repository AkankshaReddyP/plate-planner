import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { doc, getDocFromServer, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './client';

const conditionOptions = ['Diabetes', 'High blood pressure', 'Arthritis', 'Thyroid condition', 'Other', 'None', 'Prefer not to share'] as const;
type Condition = typeof conditionOptions[number];
type Screen = 'checking' | 'form' | 'ready' | 'error';
const exclusive = new Set<Condition>(['None', 'Prefer not to share']);

function isValidNumber(value: string, min: number, max: number) {
  const n = Number(value);
  return value.trim() !== '' && Number.isFinite(n) && n >= min && n <= max;
}

export function OnboardingGate({ user, logout, children }: { user: User; logout: () => Promise<void>; children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('checking');
  const [error, setError] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    async function check() {
      if (!db) {
        if (active) { setError('Firestore is not configured.'); setScreen('error'); }
        return;
      }
      setScreen('checking');
      setError('');
      try {
        const ref = doc(db, 'users', user.uid, 'private', 'onboarding');
        const record = await getDocFromServer(ref);
        if (active) {
          const data = record.data();
          // Only a complete, valid stored profile unlocks the experience.
          const valid = !!data
            && typeof data.heightCm === 'number' && data.heightCm >= 50 && data.heightCm <= 250
            && typeof data.weightKg === 'number' && data.weightKg >= 20 && data.weightKg <= 400
            && Array.isArray(data.healthConditions) && data.healthConditions.length > 0
            && data.healthConditions.every((c: unknown) => conditionOptions.includes(c as Condition));
          setScreen(valid ? 'ready' : 'form');
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to check your profile.');
          setScreen('error');
        }
      }
    }
    void check();
    return () => { active = false; };
  }, [user.uid, attempt]);

  function toggleCondition(value: Condition) {
    setConditions(current => {
      if (current.includes(value)) return current.filter(c => c !== value);
      if (exclusive.has(value)) return [value];
      return [...current.filter(c => !exclusive.has(c)), value];
    });
  }

  async function complete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !db) return;
    if (!isValidNumber(height, 50, 250) || !isValidNumber(weight, 20, 400) || !conditions.length) {
      setError('Please enter a valid height and weight, and choose a health-condition response.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await setDoc(doc(db, 'users', user.uid, 'private', 'onboarding'), {
        heightCm: Number(height),
        weightKg: Number(weight),
        healthConditions: conditions,
        updatedAt: serverTimestamp(),
      });
      setScreen('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (screen === 'ready') return <>{children}</>;

  return <main className="onboarding-shell">
    <header className="onboarding-header"><div className="login-brand"><span className="login-brand-mark">✳</span><span>Plate Planner</span></div><button type="button" className="secondary" onClick={() => void logout()}>Log out</button></header>
    <section className="onboarding-card">
      {screen === 'checking' ? <div role="status"><p className="eyebrow">YOUR ACCOUNT</p><h1>Getting your space ready…</h1><p>Checking your saved profile.</p></div> :
      screen === 'error' ? <div><p className="eyebrow">ACCOUNT SETUP</p><h1>We couldn't load your profile</h1><p role="alert" className="error-message">{error}</p><button type="button" className="primary" onClick={() => setAttempt(a => a + 1)}>Try again</button></div> :
      <>
        <p className="eyebrow">ONE-TIME SETUP</p><h1>Let's get to know you.</h1>
        <p>Complete your profile to use Plate Planner. We'll ask again at sign-in until it's saved.</p>
        <form onSubmit={event => void complete(event)} className="onboarding-form">
          <div className="onboarding-fields">
            <label htmlFor="height-cm">Height (cm)<input id="height-cm" type="number" min="50" max="250" step="0.1" inputMode="decimal" required value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 170" /></label>
            <label htmlFor="weight-kg">Weight (kg)<input id="weight-kg" type="number" min="20" max="400" step="0.1" inputMode="decimal" required value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 70" /></label>
          </div>
          <fieldset className="condition-fieldset"><legend>Health conditions</legend><p>Select any that apply. Choose “None” or “Prefer not to share” if appropriate. No diagnosis is assumed.</p>
            <div className="condition-options">{conditionOptions.map(value =>
              <label key={value} className={'condition-option ' + (conditions.includes(value) ? 'chosen' : '')}>
                <input type="checkbox" checked={conditions.includes(value)} onChange={() => toggleCondition(value)} />
                <span>{value}</span>
              </label>
            )}</div>
          </fieldset>
          {error && <p className="error-message" role="alert">{error}</p>}
          <button className="primary full" type="submit" disabled={saving}>{saving ? 'Saving your profile…' : 'Save profile and continue →'}</button>
          <p className="fine-print">Your information is stored in your private Firestore profile and is not shared with other users. These answers help organize the app; they are not a medical assessment.</p>
        </form>
      </>}
    </section>
  </main>;
}
