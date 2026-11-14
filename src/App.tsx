import { useMemo, useState } from 'react';
import { firebaseConfigured } from './firebase/client';
import { useAuth } from './firebase/useAuth';
import { OnboardingGate, useProfileConditions } from './firebase/OnboardingGate';
import { guideSteps, inStep, foodGuidance, conditionSummary } from './domain/mealGuidance';
import { categoryProgress } from './domain/categoryProgress';
import { categorySuggestions } from './domain/portionSuggestions';

type Page = 'home' | 'foods' | 'builder' | 'history' | 'insights' | 'settings';
type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
type Category = 'Protein' | 'Grain' | 'Vegetable' | 'Fruit' | 'Dairy';
type Nutrition = { kcal: number; protein: number; carbs: number; fibre: number; fat: number };
type Food = { id: string; name: string; subtitle: string; category: Category; values: Nutrition };
type Item = { id: string; grams: number; edited?: boolean };
type Entry = { id: number; meal: MealType; date: string; items: Item[]; totals: Nutrition };

const foods: Food[] = [
  { id: 'rice', name: 'Cooked white rice', subtitle: 'Cooked • sample data', category: 'Grain', values: { kcal: 130, protein: 2.7, carbs: 28.2, fibre: 0.4, fat: 0.3 } },
  { id: 'roti', name: 'Whole-wheat roti', subtitle: 'Prepared • sample data', category: 'Grain', values: { kcal: 297, protein: 9.6, carbs: 46.4, fibre: 7.1, fat: 8.1 } },
  { id: 'dal', name: 'Cooked toor dal', subtitle: 'Cooked • sample data', category: 'Protein', values: { kcal: 116, protein: 7.2, carbs: 20.3, fibre: 5.8, fat: 0.4 } },
  { id: 'egg', name: 'Boiled egg', subtitle: 'Prepared • sample data', category: 'Protein', values: { kcal: 155, protein: 12.6, carbs: 1.1, fibre: 0, fat: 10.6 } },
  { id: 'chicken', name: 'Cooked chicken breast', subtitle: 'Cooked • sample data', category: 'Protein', values: { kcal: 165, protein: 31, carbs: 0, fibre: 0, fat: 3.6 } },
  { id: 'curd', name: 'Plain curd', subtitle: 'Ready to eat • sample data', category: 'Dairy', values: { kcal: 61, protein: 3.5, carbs: 4.7, fibre: 0, fat: 3.3 } },
  { id: 'spinach', name: 'Cooked spinach', subtitle: 'Cooked • sample data', category: 'Vegetable', values: { kcal: 23, protein: 3, carbs: 3.8, fibre: 2.4, fat: 0.3 } },
  { id: 'carrot', name: 'Raw carrot', subtitle: 'Raw • sample data', category: 'Vegetable', values: { kcal: 41, protein: 0.9, carbs: 9.6, fibre: 2.8, fat: 0.2 } },
  { id: 'banana', name: 'Banana', subtitle: 'Raw • sample data', category: 'Fruit', values: { kcal: 89, protein: 1.1, carbs: 22.8, fibre: 2.6, fat: 0.3 } },
  { id: 'apple', name: 'Apple', subtitle: 'Raw • sample data', category: 'Fruit', values: { kcal: 52, protein: 0.3, carbs: 13.8, fibre: 2.4, fat: 0.2 } },
];
const lookup = new Map(foods.map(food => [food.id, food]));
const zero: Nutrition = { kcal: 0, protein: 0, carbs: 0, fibre: 0, fat: 0 };
const categories = ['All', 'Protein', 'Grain', 'Vegetable', 'Fruit', 'Dairy'] as const;
const pages: { key: Page; label: string; symbol: string }[] = [
  { key: 'home', label: 'Home', symbol: '⌂' },
  { key: 'foods', label: 'Foods', symbol: '◈' },
  { key: 'builder', label: 'Meal builder', symbol: '⊞' },
  { key: 'history', label: 'History', symbol: '◷' },
  { key: 'insights', label: 'Insights', symbol: '▥' },
  { key: 'settings', label: 'Settings', symbol: '⚙' },
];
const today = () => new Date().toLocaleDateString('en-CA');
const format = (n: number, decimals = 1) => Number(n.toFixed(decimals)).toLocaleString('en-US', { maximumFractionDigits: decimals });
function totals(items: Item[]): Nutrition {
  return items.reduce((total, item) => {
    const f = lookup.get(item.id);
    if (!f) return total;
    const ratio = item.grams / 100;
    return {
      kcal: total.kcal + f.values.kcal * ratio,
      protein: total.protein + f.values.protein * ratio,
      carbs: total.carbs + f.values.carbs * ratio,
      fibre: total.fibre + f.values.fibre * ratio,
      fat: total.fat + f.values.fat * ratio,
    };
  }, { ...zero });
}
function NutritionStrip({ value }: { value: Nutrition }) {
  return <div className="nutrient-strip" aria-label="Nutrition totals">
    <div><strong>{format(value.kcal, 0)}</strong><span>kcal</span></div>
    <div><strong>{format(value.protein)} g</strong><span>Protein</span></div>
    <div><strong>{format(value.carbs)} g</strong><span>Carbs</span></div>
    <div><strong>{format(value.fibre)} g</strong><span>Fibre</span></div>
  </div>;
}

function SignedInApp({ user, logout }: { user: { displayName: string | null; email: string | null }; logout: () => Promise<void> }) {
  const [page, setPage] = useState<Page>('home');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const [meal, setMeal] = useState<MealType>('Lunch');
  const [mealDate, setMealDate] = useState(today);
  const [selected, setSelected] = useState<Item[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [notice, setNotice] = useState('');
  const [guideStep, setGuideStep] = useState(0);
  const [showAllChoices, setShowAllChoices] = useState(false);
  const conditions = useProfileConditions();
  const filteredFoods = useMemo(() => foods.filter(f =>
    (category === 'All' || f.category === category) &&
    (f.name + ' ' + f.subtitle + ' ' + f.category).toLowerCase().includes(query.toLowerCase().trim())
  ), [category, query]);
  const calculated = useMemo(() => totals(selected), [selected]);
  const dayEntries = entries.filter(e => e.date === mealDate);
  const dayNutrition = totals(dayEntries.flatMap(e => e.items));
  const savedNutrition = totals(entries.flatMap(e => e.items));
  const mealProgress = useMemo(() => categoryProgress(selected, foods), [selected]);
  const recommended = useMemo(() => categorySuggestions(selected.map(i => i.id), foods), [selected]);
  const currentGuide = guideSteps[guideStep];
  const stepFoods = foods.filter(f => inStep(f, currentGuide.key))
    .sort((a, b) => foodGuidance(a, conditions).priority - foodGuidance(b, conditions).priority);
  const guidedChoices = showAllChoices ? stepFoods : stepFoods.filter(f => foodGuidance(f, conditions).priority < 3);
  const stepSelected = selected.some(i => inStep(lookup.get(i.id)!, currentGuide.key) && i.grams > 0);

  function navigate(next: Page) { setPage(next); setNotice(''); window.scrollTo?.(0, 0); }
  function addFood(id: string) {
    if (!lookup.has(id)) return;
    setSelected(current => {
      if (current.some(item => item.id === id)) return current;
      const ids = [...current.map(item => item.id), id];
      const suggestions = categorySuggestions(ids, foods);
      return [
        ...current.map(item => item.edited ? item : {
          ...item, grams: suggestions.get(item.id)?.grams ?? item.grams,
        }),
        { id, grams: suggestions.get(id)?.grams ?? 100, edited: false },
      ];
    });
    setNotice(`${lookup.get(id)?.name ?? 'Food'} added with an editable sample portion`);
  }
  function removeFood(id: string) {
    setSelected(current => {
      const remaining = current.filter(item => item.id !== id);
      const suggestions = categorySuggestions(remaining.map(item => item.id), foods);
      return remaining.map(item => item.edited ? item : {
        ...item, grams: suggestions.get(item.id)?.grams ?? item.grams,
      });
    });
  }
  function setGrams(id: string, grams: number) {
    setSelected(items => items.map(i => i.id === id ? { ...i, grams: Number.isFinite(grams) ? Math.min(2000, Math.max(0, grams)) : 0, edited: true } : i));
  }
  function resetToSuggestion(id: string) {
    setSelected(items => {
      const portions = categorySuggestions(items.map(item => item.id), foods);
      return items.map(item => item.id === id ? {
        ...item, grams: portions.get(id)?.grams ?? item.grams, edited: false,
      } : item);
    });
  }
  function saveDemo() {
    if (!selected.length || !selected.some(i => i.grams > 0)) return;
    const items = selected.filter(i => i.grams > 0).map(i => ({ ...i }));
    setEntries(current => [{ id: Date.now(), meal, date: mealDate, items, totals: totals(items) }, ...current]);
    setSelected([]);
    setGuideStep(0);
    setNotice('Added to this browser session. Nothing was saved to Firestore.');
    setPage('history');
  }
  function repeatEntry(entry: Entry) {
    setSelected(entry.items.map(i => ({ ...i })));
    setMeal(entry.meal);
    setMealDate(entry.date);
    setGuideStep(0);
    setNotice('Meal copied into the builder. Edit the portions before adding it.');
    setPage('builder');
  }

  return <div className="app-layout">
    <aside className="sidebar" aria-label="Main navigation">
      <div className="brand"><div className="brand-mark">✳</div><div><strong>Plate Planner</strong><small>Eat thoughtfully, every day</small></div></div>
      <p className="nav-caption">YOUR SPACE</p>
      <nav>{pages.map(p => <button key={p.key} className={'nav-item ' + (page === p.key ? 'active' : '')} type="button" aria-current={page === p.key ? 'page' : undefined} onClick={() => navigate(p.key)}><span aria-hidden="true">{p.symbol}</span>{p.label}</button>)}</nav>
      <div className="sidebar-bottom"><div className="status-dot" /> Demo experience <small>Meals remain in this browser session</small></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="mobile-brand">✳ <strong>Plate Planner</strong></div><span className="topbar-subtitle">Your nutrition companion</span><details className="profile-menu"><summary className="avatar" aria-label="Open profile menu" title={user.email || 'Your account'}>{user.displayName?.charAt(0).toUpperCase() || 'G'}</summary><div className="profile-dropdown"><div className="profile-identity"><strong>{user.displayName || 'Google user'}</strong>{user.email && <small>{user.email}</small>}</div><button className="profile-logout" type="button" onClick={() => void logout()}>Log out</button></div></details></header>
      <main className="content">
        {notice && <div className="notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}

        {page === 'home' && <>
          <div className="hero"><div><p className="eyebrow">YOUR DAILY OVERVIEW</p><h1>Small choices.<br /><em>Better days.</em></h1><p>Explore foods, build a balanced plate, and understand your meal portions—one step at a time.</p><button type="button" className="primary" onClick={() => navigate('builder')}>Build a meal <span>→</span></button></div><div className="hero-art" aria-hidden="true"><span className="plate">🥗</span><span className="orbit orbit-one">🥕</span><span className="orbit orbit-two">🍋</span><span className="orbit orbit-three">🥦</span></div></div>
          <div className="section-heading"><div><p className="eyebrow">QUICK GLANCE</p><h2>Today at a glance</h2></div><span className="muted">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>
          <div className="summary-grid"><article className="mini-card"><span className="card-icon green">◷</span><span className="stat-big">{entries.filter(e => e.date === today()).length}</span><strong>Demo meals logged</strong><small>In this browser session</small></article><article className="mini-card"><span className="card-icon orange">◈</span><span className="stat-big">{format(totals(entries.filter(e => e.date === today()).flatMap(e => e.items)).kcal, 0)}</span><strong>Demo kcal logged</strong><small>Calculated from sample foods</small></article><article className="mini-card"><span className="card-icon purple">✳</span><span className="stat-big">{foods.length}</span><strong>Foods to explore</strong><small>Sample reference foods</small></article></div>
          <div className="two-col"><article className="panel"><div className="panel-heading"><div><p className="eyebrow">GET STARTED</p><h3>Explore your food library</h3></div><span className="round-icon">↗</span></div><p>Search everyday foods, compare portions, and add ingredients to a new meal.</p><button className="text-action" type="button" onClick={() => navigate('foods')}>Browse foods →</button></article><article className="panel"><div className="panel-heading"><div><p className="eyebrow">KEEP TRACK</p><h3>Your recent meals</h3></div><span className="round-icon">◷</span></div>{entries.length ? <><p>{entries[0].meal} · {entries[0].items.length} foods · {format(entries[0].totals.kcal, 0)} kcal</p><button className="text-action" type="button" onClick={() => navigate('history')}>View history →</button></> : <><p>Meals you add in the builder will appear here for this session.</p><button className="text-action" type="button" onClick={() => navigate('builder')}>Create your first meal →</button></>}</article></div>
        </>}

        {page === 'foods' && <>
          <div className="page-heading"><p className="eyebrow">REFERENCE LIBRARY</p><h1>Explore foods</h1><p>Get to know what goes on your plate. Nutrients shown per 100 g.</p></div>
          <div className="toolbar"><label className="searchbox"><span aria-hidden="true">⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search rice, dal, fruit..." aria-label="Search foods" /></label><span className="muted">{filteredFoods.length} results</span></div>
          <div className="chips" aria-label="Food categories">{categories.map(c => <button type="button" key={c} aria-pressed={category === c} className={'chip ' + (category === c ? 'selected' : '')} onClick={() => setCategory(c)}>{c}</button>)}</div>
          <div className="food-grid">{filteredFoods.map(f => <article className="food-card" key={f.id}><div className="food-card-top"><span className="food-symbol">{f.category === 'Fruit' ? '🍎' : f.category === 'Vegetable' ? '🥬' : f.category === 'Protein' ? '🥚' : f.category === 'Dairy' ? '🥛' : '🍚'}</span><span className="category-label">{f.category}</span></div><h3>{f.name}</h3><p>{f.subtitle}</p><div className="food-macros"><span><strong>{format(f.values.kcal, 0)}</strong> kcal</span><span><strong>{format(f.values.protein)}</strong> g protein</span></div><button type="button" className="secondary full" onClick={() => { addFood(f.id); navigate('builder'); }}>+ Add to meal</button></article>)}</div>
          {!filteredFoods.length && <div className="empty-state">No matching foods. Try a different category or search term.</div>}
        </>}

        {page === 'builder' && <>
          <div className="page-heading"><p className="eyebrow">YOUR PLATE</p><h1>Build your meal</h1><p>Pick foods, adjust grams, and see your estimated nutrition update instantly.</p></div>
          <div className="two-col builder-layout"><div>
            <article className="panel">
              <div className="panel-heading"><h3>Meal details</h3></div>
              <div className="form-row"><label>Meal type<select value={meal} onChange={e => setMeal(e.target.value as MealType)}><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></select></label><label>Date<input type="date" value={mealDate} onChange={e => setMealDate(e.target.value)} /></label></div>
            </article>
            <article className="panel guided-panel">
              <p className="eyebrow">GUIDED FOOD SELECTION</p>
              <div className="meal-progress" aria-label="Guided meal completion">
                <div className="meal-progress-head">
                  <strong>Build your plate</strong>
                  <span aria-live="polite">{mealProgress.percent}% complete</span>
                </div>
                <div className="meal-progress-track" role="progressbar" aria-label="Food category completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={mealProgress.percent} aria-valuetext={`${mealProgress.completed} of ${mealProgress.total} food groups selected`}>
                  <div className="meal-progress-fill" style={{ width: mealProgress.percent + '%' }} />
                </div>
                <p className="meal-progress-caption">{mealProgress.completed} of {mealProgress.total} food groups selected. Each group counts once, regardless of quantity.</p>
              </div>
              <div className="guide-steps" aria-label="Meal selection order">
                {guideSteps.map((step, index) => <button key={step.key} type="button" className={'guide-step ' + (guideStep === index ? 'current' : '') + (mealProgress.checked[index] ? ' complete' : '')} aria-current={guideStep === index ? 'step' : undefined} onClick={() => {setGuideStep(index);setShowAllChoices(false);}}><strong>{mealProgress.checked[index] ? '✓' : index + 1}</strong><span>{step.title}</span></button>)}
              </div>
              <h3>{currentGuide.title}</h3><p>{currentGuide.hint} Food sequence is optional and does not replace balanced nutrition.</p>
              {conditionSummary(conditions).map(t => <p key={t} className="guide-note">{t}</p>)}
              <div className="guided-foods">
                {guidedChoices.map(f => <div className="guided-food" key={f.id}>
                  <div><strong>{f.name}</strong><small>{format(f.values.carbs)} g carbs · {format(f.values.fibre)} g fibre per 100 g</small><small className="suggested-portion">Suggested if added: {categorySuggestions([...selected.map(i => i.id), f.id], foods).get(f.id)?.grams ?? 100} g</small>
                    {foodGuidance(f, conditions).note && <small className="guidance-label">{foodGuidance(f, conditions).note}</small>}</div>
                  <button type="button" className="secondary" onClick={() => addFood(f.id)}>{selected.some(i => i.id === f.id) ? 'Added ✓' : '+ Add'}</button>
                </div>)}
              </div>
              {stepFoods.length > guidedChoices.length && <button type="button" className="text-action" onClick={() => setShowAllChoices(true)}>Show all food options (with guidance)</button>}
              <div className="guide-actions"><button type="button" className="secondary" disabled={guideStep === 0} onClick={() => setGuideStep(i => Math.max(0, i - 1))}>← Previous</button>
                {guideStep < 2 && <button type="button" className="primary" onClick={() => { setGuideStep(i => Math.min(2, i + 1)); setShowAllChoices(false);}}>{stepSelected ? 'Next step →' : 'Skip / next →'}</button>}</div>
            </article>
            <article className="panel"><div className="panel-heading"><div><h3>Foods on your plate</h3><p>{selected.length} selected</p></div><button type="button" className="text-action" onClick={() => navigate('foods')}>+ Browse foods</button></div>
              <p className="fine-print">Starting quantities are illustrative and automatically share the food-group step when you add multiple foods. Manually edited amounts are preserved. This is not an individualized medical portion recommendation.</p>
              {selected.length ? <div className="selected-list">{selected.map(i => { const f = lookup.get(i.id); if (!f) return null;return <div className="selected-row" key={i.id}><div><strong>{f.name}</strong><small>{format(f.values.kcal * i.grams / 100, 0)} kcal estimated</small><small className="suggested-portion">Suggested starting amount: {recommended.get(i.id)?.grams ?? 100} g{ i.edited ? ' · customized' : ' · applied'}</small><button type="button" className="text-action portion-reset" onClick={() => resetToSuggestion(i.id)}>Use suggested amount</button></div><div className="amount-control"><label className="sr-only" htmlFor={'portion-' + i.id}>Grams of {f.name}</label><input id={'portion-' + i.id} type="number" min="0" max="2000" step="10" value={i.grams} onChange={e => setGrams(i.id, Number(e.target.value))} /><span>g</span><button type="button" onClick={() => removeFood(i.id)} aria-label={'Remove ' + f.name}>×</button></div></div>; })}</div> : <div className="empty-state"><span className="empty-art">🥙</span><strong>Start with a food you enjoy</strong><p>Add foods from the library to begin building your meal.</p><button className="secondary" type="button" onClick={() => navigate('foods')}>Browse foods</button></div>}
            </article></div>
            <div><article className="panel summary-panel"><p className="eyebrow">LIVE ESTIMATE</p><h3>Meal nutrition</h3><NutritionStrip value={calculated} /><div className="total-line"><span>Fat</span><strong>{format(calculated.fat)} g</strong></div><div className="total-line"><span>Items</span><strong>{selected.length}</strong></div><button className="primary full" type="button" onClick={saveDemo} disabled={!selected.some(i => i.grams > 0)}>Add to demo history →</button><p className="fine-print">Sample values. This action only saves in your browser's current session. It does not record actual consumption or save to the cloud.</p></article></div>
          </div>
        </>}

        {page === 'history' && <>
          <div className="page-heading"><p className="eyebrow">YOUR JOURNEY</p><h1>Meal history</h1><p>Meals added during this browser session. These are demos, not verified consumption records.</p></div>
          {entries.length ? <div className="history-list">{entries.map(entry => <article className="panel history-entry" key={entry.id}><div><span className="eyebrow">{entry.date} · {entry.meal}</span><h3>{entry.items.map(i => lookup.get(i.id)?.name).filter(Boolean).join(', ')}</h3><p>{entry.items.map(i => `${lookup.get(i.id)?.name}: ${format(i.grams, 0)} g`).join(' • ')}</p></div><div className="history-end"><strong>{format(entry.totals.kcal, 0)} kcal</strong><button type="button" className="secondary" onClick={() => repeatEntry(entry)}>Edit as new meal</button><button type="button" className="text-action danger" onClick={() => setEntries(list => list.filter(e => e.id !== entry.id))}>Remove</button></div></article>)}</div> : <div className="empty-state tall"><span className="empty-art">📔</span><h3>No demo meals yet</h3><p>Build a meal and add it to this session to see it here.</p><button className="primary" type="button" onClick={() => navigate('builder')}>Build a meal →</button></div>}
        </>}

        {page === 'insights' && <>
          <div className="page-heading"><p className="eyebrow">YOUR PROGRESS</p><h1>Nutrition insights</h1><p>Simple summaries of meals added during this session—not medical guidance.</p></div>
          <div className="summary-grid"><article className="mini-card"><span className="card-icon green">◷</span><span className="stat-big">{entries.length}</span><strong>Demo entries</strong><small>Not persisted</small></article><article className="mini-card"><span className="card-icon orange">◈</span><span className="stat-big">{format(savedNutrition.kcal, 0)}</span><strong>Total sample kcal</strong><small>Across current session</small></article><article className="mini-card"><span className="card-icon purple">✳</span><span className="stat-big">{format(savedNutrition.protein)}</span><strong>Protein (g)</strong><small>Across current session</small></article></div>
          <article className="panel"><h3>Selected date breakdown</h3><label className="date-inline">Choose date<input type="date" value={mealDate} onChange={e => setMealDate(e.target.value)} /></label><NutritionStrip value={dayNutrition}/><p className="fine-print">{dayEntries.length} demo meal{dayEntries.length === 1 ? '' : 's'} on this date. Unlogged meals are unknown, not zero intake.</p></article>
        </>}

        {page === 'settings' && <>
          <div className="page-heading"><p className="eyebrow">YOUR ACCOUNT</p><h1>Settings</h1><p>Manage your sign-in and learn how this preview handles data.</p></div>
          <article className="panel account-panel"><h3>Google account</h3><p><strong>{user.displayName || 'Google user'}</strong><br />{user.email}</p><p className="fine-print">New accounts are created with the User role. Family access must be granted separately.</p><button type="button" className="secondary" onClick={() => void logout()}>Sign out</button></article>
          <article className="panel"><h3>Preview data</h3><p>Meals added here exist only in React memory. Refreshing or closing the page clears them. No food selections, meal plans, or history are uploaded to Firestore.</p><button type="button" className="secondary danger" onClick={() => { setEntries([]); setSelected([]); setNotice('Demo meals cleared from this session.'); }}>Clear demo meals</button></article>
        </>}
      </main>
      <nav className="bottom-nav" aria-label="Mobile navigation">{pages.filter(p => p.key !== 'insights').map(p => <button key={p.key} type="button" className={page === p.key ? 'active' : ''} aria-label={p.label} aria-current={page === p.key ? 'page' : undefined} onClick={() => navigate(p.key)}><span aria-hidden="true">{p.symbol}</span><small>{p.key === 'builder' ? 'Build' : p.label}</small></button>)}</nav>
    </div>
  </div>;
}

/** No user content or demo actions mount until authentication and account registration complete. */
export default function App() {
  const { user, pending, error, login, logout } = useAuth();

  if (!firebaseConfigured) {
    return <AuthLanding error="Sign-in is not configured for this build. Please contact the Plate Planner administrator." busy={false} login={login} configured={false} />;
  }
  if (pending) {
    return <AuthLanding error={null} busy login={login} configured />;
  }
  if (!user) {
    return <AuthLanding error={error} busy={false} login={login} configured />;
  }
  // Component unmount on logout discards browser-only meal state.
  return <OnboardingGate key={user.uid} user={user} logout={logout}><SignedInApp user={user} logout={logout} /></OnboardingGate>;
}

function AuthLanding({ error, busy, login, configured }: { error: string | null; busy: boolean; configured: boolean; login: () => Promise<void> }) {
  return <main className="login-layout">
    <section className="login-brand-panel" aria-label="Plate Planner introduction">
      <div className="login-brand"><span className="login-brand-mark">✳</span><span>Plate Planner</span></div>
      <div className="login-brand-content">
        <p className="eyebrow">NOURISH YOUR EVERYDAY</p>
        <h1>Good food.<br /><em>Good living.</em></h1>
        <p>Explore foods, plan meals and make each portion count — all in one thoughtful place.</p>
        <div className="login-illustration" aria-hidden="true">🥗</div>
      </div>
      <p className="login-brand-footer">A little planning goes a long way.</p>
    </section>
    <section className="login-auth-panel" aria-label="Sign in">
      <div className="login-card">
        <span className="login-welcome-icon" aria-hidden="true">✳</span>
        <p className="eyebrow">WELCOME TO PLATE PLANNER</p>
        <h2>Sign in to get started</h2>
        <p className="login-help">Your nutrition planning space starts with a secure Google account.</p>
        <button className="google-login" type="button" onClick={() => void login()} disabled={busy || !configured}>
          <svg viewBox="0 0 48 48" width="21" height="21" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.29 5.48-4.85 7.18l7.73 6C44.33 38.03 46.98 31.9 46.98 24.55z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-3-.76-4.59s.28-3.14.76-4.59l-7.98-6.2C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.92-2.13 15.82-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.09 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {busy ? 'Checking your account…' : 'Continue with Google'}
        </button>
        {busy && <p className="login-status" role="status">Verifying your account securely…</p>}
        {error && <p className="error-message login-error" role="alert">{error}</p>}
        <div className="login-divider"><span>PRIVATE BY DESIGN</span></div>
        <p className="login-privacy">You must sign in to use Plate Planner. New accounts begin with the User role; private family data requires separate authorization.</p>
      </div>
      <p className="login-copyright">Plate Planner · Your everyday nutrition companion</p>
    </section>
  </main>;
}
