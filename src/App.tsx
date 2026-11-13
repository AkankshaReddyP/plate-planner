import { useMemo, useState } from 'react';
import { firebaseConfigured } from './firebase/client';
import { useAuth } from './firebase/useAuth';

type Page = 'home' | 'foods' | 'builder' | 'history' | 'insights' | 'settings';
type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
type Category = 'Protein' | 'Grain' | 'Vegetable' | 'Fruit' | 'Dairy';
type Nutrition = { kcal: number; protein: number; carbs: number; fibre: number; fat: number };
type Food = { id: string; name: string; subtitle: string; category: Category; values: Nutrition };
type Item = { id: string; grams: number };
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

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const [meal, setMeal] = useState<MealType>('Lunch');
  const [mealDate, setMealDate] = useState(today);
  const [selected, setSelected] = useState<Item[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [notice, setNotice] = useState('');
  const { user, pending, error, login, logout } = useAuth();
  const filteredFoods = useMemo(() => foods.filter(f =>
    (category === 'All' || f.category === category) &&
    (f.name + ' ' + f.subtitle + ' ' + f.category).toLowerCase().includes(query.toLowerCase().trim())
  ), [category, query]);
  const calculated = useMemo(() => totals(selected), [selected]);
  const dayEntries = entries.filter(e => e.date === mealDate);
  const dayNutrition = totals(dayEntries.flatMap(e => e.items));
  const savedNutrition = totals(entries.flatMap(e => e.items));

  function navigate(next: Page) { setPage(next); setNotice(''); window.scrollTo?.(0, 0); }
  function addFood(id: string) {
    setSelected(current => current.some(item => item.id === id) ? current : [...current, { id, grams: 100 }]);
    setNotice(`${lookup.get(id)?.name ?? 'Food'} added to your meal`);
  }
  function setGrams(id: string, grams: number) {
    setSelected(items => items.map(i => i.id === id ? { ...i, grams: Number.isFinite(grams) ? Math.min(2000, Math.max(0, grams)) : 0 } : i));
  }
  function saveDemo() {
    if (!selected.length || !selected.some(i => i.grams > 0)) return;
    const items = selected.filter(i => i.grams > 0).map(i => ({ ...i }));
    setEntries(current => [{ id: Date.now(), meal, date: mealDate, items, totals: totals(items) }, ...current]);
    setSelected([]);
    setNotice('Added to this browser session. Nothing was saved to Firestore.');
    setPage('history');
  }
  function repeatEntry(entry: Entry) {
    setSelected(entry.items.map(i => ({ ...i })));
    setMeal(entry.meal);
    setMealDate(entry.date);
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
      <header className="topbar"><div className="mobile-brand">✳ <strong>Plate Planner</strong></div><span className="topbar-subtitle">Your nutrition companion</span><div className="avatar" title={user?.email || 'Guest'}>{user?.displayName?.charAt(0).toUpperCase() || 'G'}</div></header>
      <main className="content">
        <div className="preview-banner"><span className="preview-pill">INTERACTIVE PREVIEW</span><span>Sample nutrition values only. Plans are stored in memory during this session—not in Firestore.</span></div>
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
            <article className="panel"><div className="panel-heading"><div><h3>Foods on your plate</h3><p>{selected.length} selected</p></div><button type="button" className="text-action" onClick={() => navigate('foods')}>+ Browse foods</button></div>
              {selected.length ? <div className="selected-list">{selected.map(i => { const f = lookup.get(i.id); if (!f) return null;return <div className="selected-row" key={i.id}><div><strong>{f.name}</strong><small>{format(f.values.kcal * i.grams / 100, 0)} kcal estimated</small></div><div className="amount-control"><label className="sr-only" htmlFor={'portion-' + i.id}>Grams of {f.name}</label><input id={'portion-' + i.id} type="number" min="0" max="2000" step="10" value={i.grams} onChange={e => setGrams(i.id, Number(e.target.value))} /><span>g</span><button type="button" onClick={() => setSelected(items => items.filter(x => x.id !== i.id))} aria-label={'Remove ' + f.name}>×</button></div></div>; })}</div> : <div className="empty-state"><span className="empty-art">🥙</span><strong>Start with a food you enjoy</strong><p>Add foods from the library to begin building your meal.</p><button className="secondary" type="button" onClick={() => navigate('foods')}>Browse foods</button></div>}
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
          <article className="panel account-panel"><h3>Google account</h3>{!firebaseConfigured ? <p>Firebase is not configured for this build.</p> : pending ? <p>Checking sign-in…</p> : user ? <><p><strong>{user.displayName || 'Google user'}</strong><br />{user.email}</p><p className="fine-print">New accounts are created with the User role. Family access must be granted separately.</p><button type="button" className="secondary" onClick={() => void logout()}>Sign out</button></> : <><p>Sign in to register a User account.</p><button className="primary" type="button" onClick={() => void login()}>Sign in with Google</button></>}{error && <p className="error-message" role="alert">Authentication error: {error}</p>}</article>
          <article className="panel"><h3>Preview data</h3><p>Meals added here exist only in React memory. Refreshing or closing the page clears them. No food selections, meal plans, or history are uploaded to Firestore.</p><button type="button" className="secondary danger" onClick={() => { setEntries([]); setSelected([]); setNotice('Demo meals cleared from this session.'); }}>Clear demo meals</button></article>
        </>}
      </main>
      <nav className="bottom-nav" aria-label="Mobile navigation">{pages.filter(p => p.key !== 'insights').map(p => <button key={p.key} type="button" className={page === p.key ? 'active' : ''} aria-label={p.label} aria-current={page === p.key ? 'page' : undefined} onClick={() => navigate(p.key)}><span aria-hidden="true">{p.symbol}</span><small>{p.key === 'builder' ? 'Build' : p.label}</small></button>)}</nav>
    </div>
  </div>;
}
