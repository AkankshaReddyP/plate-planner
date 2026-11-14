import { useMemo, useState } from 'react';
import { firebaseConfigured } from './firebase/client';
import { useFoodCatalog, type CatalogFood } from './domain/foodCatalog';
import { fibreCoverage, fibreMethod } from './domain/fibreQuality';
import { useAuth } from './firebase/useAuth';
import { OnboardingGate, useProfileConditions } from './firebase/OnboardingGate';
import { guideSteps, inStep, foodGuidance, conditionSummary } from './domain/mealGuidance';
import { categoryProgress } from './domain/categoryProgress';
import { countToGrams, countUnitFor, suggestedCount, foodQuantityLabel, foodEmoji } from './domain/foodPortions';
import { EXAMPLE_MEAL_TARGETS, suggestWholeMealPortions, nutrientKeys, nutrientLabels, nutrientUnits, type NutrientKey, type NutritionTargets } from './domain/wholeMealPortions';

type Page = 'home' | 'foods' | 'builder' | 'history' | 'insights' | 'settings';
type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
type Nutrition = { kcal: number; protein: number; carbs: number; fibre: number; fat: number };
type Food = CatalogFood;
type Item = { id: string; grams: number; edited?: boolean };
type Entry = { id: number; meal: MealType; date: string; items: Item[]; totals: Nutrition };

const zero: Nutrition = { kcal: 0, protein: 0, carbs: 0, fibre: 0, fat: 0 };
const categories = ['All', 'Protein', 'Grain', 'Vegetable', 'Fruit', 'Dairy'] as const;
const foodGroups = ['All', 'Legumes', 'Soy', 'Dairy protein', 'Eggs', 'Meat', 'Seafood', 'Nuts & seeds', 'Curry', 'Pappu', 'Chutney', 'Roti', 'Ragi', 'Quinoa', 'Millet', 'Tiffin'] as const;
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
function totals(items: Item[], lookup: Map<string, Food>): Nutrition {
  return items.reduce((total, item) => {
    const f = lookup.get(item.id);
    if (!f || f.nutritionStatus === 'pending') return total;
    const ratio = item.grams / 100;
    return {
      kcal: total.kcal + f.values.kcal * ratio,
      protein: total.protein + f.values.protein * ratio,
      carbs: total.carbs + f.values.carbs * ratio,
      fibre: total.fibre + (fibreMethod(f) === 'total' ? f.values.fibre * ratio : 0),
      fat: total.fat + f.values.fat * ratio,
    };
  }, { ...zero });
}
function NutritionStrip({ value, fibreComplete = true }: { value: Nutrition; fibreComplete?: boolean }) {
  return <div className="nutrient-strip" aria-label="Nutrition totals">
    <div><strong>{format(value.kcal, 0)}</strong><span>kcal</span></div>
    <div><strong>{format(value.protein)} g</strong><span>Protein</span></div>
    <div><strong>{format(value.carbs)} g</strong><span>Carbs</span></div>
    <div><strong>{fibreComplete ? format(value.fibre) + ' g' : '—'}</strong><span>Fibre</span></div>
  </div>;
}

function SignedInApp({ user, logout }: { user: { displayName: string | null; email: string | null }; logout: () => Promise<void> }) {
  const { foods, loading: foodsLoading, error: foodsError } = useFoodCatalog();
  const lookup = useMemo(() => new Map(foods.map(f => [f.id, f])), [foods]);
  const usableFoods = useMemo(() => foods.filter(f => f.nutritionStatus !== 'pending'), [foods]);
  const [page, setPage] = useState<Page>('home');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const [foodGroup, setFoodGroup] = useState<(typeof foodGroups)[number]>('All');
  const [meal, setMeal] = useState<MealType>('Lunch');
  const [mealDate, setMealDate] = useState(today);
  const [selected, setSelected] = useState<Item[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [notice, setNotice] = useState('');
  const [guideStep, setGuideStep] = useState(0);
  const [showAllChoices, setShowAllChoices] = useState(false);
  const [mealTargets, setMealTargets] = useState<NutritionTargets>({ ...EXAMPLE_MEAL_TARGETS });
  const conditions = useProfileConditions();
  const filteredFoods = useMemo(() => foods.filter(f =>
    (category === 'All' || f.category === category) &&
    (foodGroup === 'All' || f.foodGroup === foodGroup) &&
    (f.name + ' ' + f.subtitle + ' ' + f.category + ' ' + f.cuisine + ' ' + (f.foodGroup ?? '') + ' ' + f.aliases.join(' ')).toLowerCase().includes(query.toLowerCase().trim())
  ), [category, foodGroup, query]);
  const calculated = useMemo(() => totals(selected, lookup), [selected, lookup]);
  const selectedFibreCoverage = useMemo(() => fibreCoverage(selected, foods), [selected, foods]);
  const dayEntries = entries.filter(e => e.date === mealDate);
  const dayItems = dayEntries.flatMap(e => e.items);
  const dayNutrition = totals(dayItems, lookup);
  const dayFibreCoverage = fibreCoverage(dayItems, foods);
  const savedItems = entries.flatMap(e => e.items);
  const savedNutrition = totals(savedItems, lookup);

  const mealProgress = useMemo(() => categoryProgress(selected, usableFoods), [selected, usableFoods]);
  const recommendedPortions = useMemo(() => suggestWholeMealPortions(selected, usableFoods, mealTargets), [selected, usableFoods, mealTargets]);
  const currentGuide = guideSteps[guideStep];
  const stepFoods = usableFoods.filter(f => inStep(f, currentGuide.key))
    .sort((a, b) => foodGuidance(a, conditions).priority - foodGuidance(b, conditions).priority);
  const guidedChoices = showAllChoices ? stepFoods : stepFoods.filter(f => foodGuidance(f, conditions).priority < 3);

  function navigate(next: Page) { setPage(next); setNotice(''); window.scrollTo?.(0, 0); }
  function applySuggestedPortions(items: Item[], goals = mealTargets): Item[] {
    const suggestions = suggestWholeMealPortions(items, usableFoods, goals);
    return items.map(item => item.edited ? item : {
      ...item, grams: countUnitFor(item.id)
        ? (countToGrams(item.id, suggestedCount(item.id, suggestions.get(item.id) ?? item.grams) ?? 1) ?? item.grams)
        : suggestions.get(item.id) ?? item.grams,
    });
  }
  function addFood(id: string) {
    if (!lookup.has(id) || lookup.get(id)?.nutritionStatus === 'pending') return;
    setSelected(current => {
      if (current.some(item => item.id === id)) return current;
      const next: Item[] = [...current, { id, grams: 100, edited: false }];
      return applySuggestedPortions(next);
    });
    setNotice(`${lookup.get(id)?.name ?? 'Food'} added with a whole-meal portion suggestion`);
  }
  function removeFood(id: string) {
    setSelected(current => applySuggestedPortions(current.filter(item => item.id !== id)));
  }
  function setGrams(id: string, grams: number) {
    setSelected(current => applySuggestedPortions(current.map(item =>
      item.id === id ? {
        ...item, grams: Number.isFinite(grams) ? Math.min(2000, Math.max(0, grams)) : 0, edited: true,
      } : item)));
  }
  function setCount(id: string, count: number) {
    const grams = countToGrams(id, count);
    if (grams === null) return;
    setGrams(id, grams);
  }
  function changeMealTarget(key: NutrientKey, value: number) {
    const maximum: NutritionTargets = { kcal: 2500, protein: 150, carbs: 300, fat: 120, fibre: 40 };
    const target = Number.isFinite(value) ? Math.min(maximum[key], Math.max(1, value)) : EXAMPLE_MEAL_TARGETS[key];
    const goals = { ...mealTargets, [key]: target };
    setMealTargets(goals);
    setSelected(current => applySuggestedPortions(current, goals));
  }
  function saveDemo() {
    if (!selected.length || !selected.some(i => i.grams > 0)) return;
    const items = selected.filter(i => i.grams > 0).map(i => ({ ...i }));
    setEntries(current => [{ id: Date.now(), meal, date: mealDate, items, totals: totals(items, lookup) }, ...current]);
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
          <div className="summary-grid"><article className="mini-card"><span className="card-icon green">◷</span><span className="stat-big">{entries.filter(e => e.date === today()).length}</span><strong>Demo meals logged</strong><small>In this browser session</small></article><article className="mini-card"><span className="card-icon orange">◈</span><span className="stat-big">{format(totals(entries.filter(e => e.date === today()).flatMap(e => e.items), lookup).kcal, 0)}</span><strong>Demo kcal logged</strong><small>Calculated from sample foods</small></article><article className="mini-card"><span className="card-icon purple">✳</span><span className="stat-big">{foods.length}</span><strong>Foods to explore</strong><small>Live Firestore catalog</small></article></div>
          <div className="two-col"><article className="panel"><div className="panel-heading"><div><p className="eyebrow">GET STARTED</p><h3>Explore your food library</h3></div><span className="round-icon">↗</span></div><p>Search everyday foods, compare portions, and add ingredients to a new meal.</p><button className="text-action" type="button" onClick={() => navigate('foods')}>Browse foods →</button></article><article className="panel"><div className="panel-heading"><div><p className="eyebrow">KEEP TRACK</p><h3>Your recent meals</h3></div><span className="round-icon">◷</span></div>{entries.length ? <><p>{entries[0].meal} · {entries[0].items.length} foods · {format(entries[0].totals.kcal, 0)} kcal</p><button className="text-action" type="button" onClick={() => navigate('history')}>View history →</button></> : <><p>Meals you add in the builder will appear here for this session.</p><button className="text-action" type="button" onClick={() => navigate('builder')}>Create your first meal →</button></>}</article></div>
        </>}

        {page === 'foods' && <>
          <div className="page-heading"><p className="eyebrow">REFERENCE LIBRARY</p><h1>Explore foods</h1><p>Get to know what goes on your plate. Nutrients shown per 100 g.</p></div>
          <div className="toolbar"><label className="searchbox"><span aria-hidden="true">⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search chana, dal, tofu, eggs, fish..." aria-label="Search foods" /></label><span className="muted">{filteredFoods.length} results</span></div>
          <div className="chips" aria-label="Food categories">{categories.map(c => <button type="button" key={c} aria-pressed={category === c} className={'chip ' + (category === c ? 'selected' : '')} onClick={() => setCategory(c)}>{c}</button>)}</div>
          <div className="food-group-filter"><span className="food-group-label">Explore dishes</span><div className="chips" aria-label="Dish types">{foodGroups.map(g => <button type="button" key={g} aria-pressed={foodGroup === g} className={'chip ' + (foodGroup === g ? 'selected' : '')} onClick={() => setFoodGroup(g)}>{g}</button>)}</div></div>
          {foodsLoading && <p role="status">Loading food catalog…</p>}{foodsError && <p role="alert" className="error-message">{foodsError}</p>}
          <div className="food-grid">{filteredFoods.map(f => <article className="food-card" key={f.id}><div className="food-card-top"><span className="food-symbol">{f.category === 'Fruit' ? '🍎' : f.category === 'Vegetable' ? '🥬' : f.category === 'Protein' ? '🥚' : f.category === 'Dairy' ? '🥛' : '🍚'}</span><span className="category-label">{f.category}</span></div><h3>{f.name}</h3><p>{f.subtitle}</p>{f.nutritionSource && <a className="food-source-link" href={f.nutritionSource.url} target="_blank" rel="noreferrer">Research source ↗</a>}{f.reportedFibreG !== undefined && <p className="fine-print">Source-reported fibre: {format(f.reportedFibreG)} g/100g (method not confirmed)</p>}{f.crudeFibreG !== undefined && <p className="fine-print">Crude fibre: {format(f.crudeFibreG)} g/100g (not total dietary fibre)</p>}<div className="food-macros">{f.nutritionStatus === 'pending' ? <span><strong>Nutrition pending</strong></span> : <><span><strong>{format(f.values.kcal, 0)}</strong> kcal</span><span><strong>{format(f.values.protein)}</strong> g protein</span></>}</div><button type="button" className="secondary full" disabled={f.nutritionStatus === 'pending'} onClick={() => { addFood(f.id); navigate('builder'); }}>{f.nutritionStatus === 'pending' ? 'Nutrition verification needed' : '+ Add to meal'}</button></article>)}</div>
          {!foodsLoading && !filteredFoods.length && <div className="empty-state">{foods.length === 0 ? 'No active foods found. Seed the catalog from the trusted deployment workflow.' : 'No matching foods. Try another category or search term.'}</div>}
        </>}

        {page === 'builder' && <>
          <div className="compact-builder-heading">
            <div><p className="eyebrow">YOUR PLATE</p><h1>Build a meal</h1></div>
            <div className="compact-meal-controls">
              <label className="sr-only" htmlFor="compact-meal-type">Meal type</label>
              <select id="compact-meal-type" value={meal} onChange={e => setMeal(e.target.value as MealType)}><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></select>
              <label className="sr-only" htmlFor="compact-meal-date">Meal date</label>
              <input id="compact-meal-date" type="date" value={mealDate} onChange={e => setMealDate(e.target.value)} />
            </div>
          </div>
          <div className="compact-builder-grid">
            <section className="panel compact-picker" aria-label="Select meal foods">
              <div className="compact-nutrient-goals">
                <div className="compact-goals-heading"><strong>Nutrition for this meal</strong><span>Example targets · adjustable</span></div>
                <div className="compact-nutrient-grid">
                  {nutrientKeys.map(key => <div className="compact-nutrient-card" key={key}>
                    <label htmlFor={'nutrient-target-' + key}>{nutrientLabels[key]} <span>target</span></label>
                    <div className="compact-nutrient-value"><strong>{key === 'fibre' && !selectedFibreCoverage.complete ? '—' : format(calculated[key], key === 'kcal' ? 0 : 1)}</strong><span>/</span>
                      <input id={'nutrient-target-' + key} type="number" step={key === 'kcal' ? '25' : '1'} min="1"
                        value={mealTargets[key]} onChange={e => changeMealTarget(key, Number(e.target.value))}
                        aria-label={nutrientLabels[key] + ' example target'}/><span>{nutrientUnits[key]}</span></div>
                    <div className="compact-mini-track"><div style={{width: (key === 'fibre' && !selectedFibreCoverage.complete ? 0 : Math.min(100, calculated[key] / mealTargets[key] * 100)) + '%'}}/></div>
                  </div>)}
                </div>
                <p className="compact-goals-caption">These are illustrative meal references, not individualized nutrition requirements. Fibre is compared only when every selected food has documented total dietary fibre. Crude or unknown fibre is never treated as zero or used to optimize portions.</p>
              </div>
              <div className="compact-progress-head"><strong>Food selection</strong><span aria-live="polite">{mealProgress.percent}% complete</span></div>
              <div className="meal-progress-track" role="progressbar" aria-label="Food group selection progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={mealProgress.percent} aria-valuetext={`${mealProgress.completed} of 3 food groups selected`}>
                <div className="meal-progress-fill" style={{ width: mealProgress.percent + '%' }} />
              </div>
              <div className="compact-step-tabs" aria-label="Food selection steps">
                {guideSteps.map((step, index) => <button key={step.key} type="button" className={'compact-step ' + (guideStep === index ? 'active' : '')} aria-current={guideStep === index ? 'step' : undefined} onClick={() => {setGuideStep(index);setShowAllChoices(false);}}><span className="compact-step-number">{mealProgress.checked[index] ? '✓' : index + 1}</span><span>{index === 0 ? 'Fibre' : index === 1 ? 'Protein' : 'Carbs'}</span></button>)}
              </div>
              <div className="compact-step-intro">
                <div><p className="eyebrow">STEP {guideStep + 1} OF 3</p><h2>{currentGuide.title}</h2></div>
                <span className="compact-step-hint">{selected.filter(i => { const f = lookup.get(i.id);return !!f && inStep(f, currentGuide.key);}).length} selected</span>
              </div>
              {foodsLoading && <p role="status">Loading foods…</p>}
              {foodsError && <p role="alert" className="error-message">{foodsError}</p>}
              {!foodsLoading && stepFoods.length === 0 && <p className="fine-print">No foods with usable nutrient information are available in this step yet. New South Indian dishes appear in the catalog while their nutrition data is reviewed.</p>}
              <div className="visual-food-grid" aria-label={currentGuide.title}>
                {guidedChoices.map(f => {
                  const chosen = selected.find(i => i.id === f.id);
                  const suggestedGrams = chosen
                    ? recommendedPortions.get(f.id) ?? chosen.grams
                    : suggestWholeMealPortions([...selected, { id: f.id, grams: 100, edited: false }], usableFoods, mealTargets).get(f.id) ?? 100;
                  const unit = countUnitFor(f.id);
                  const suggested = unit ? `${suggestedCount(f.id, suggestedGrams)} ${unit.plural}` : `${suggestedGrams} g`;
                  const count = unit && chosen ? chosen.grams / unit.gramsPerItem : 0;
                  return <div key={f.id} className={'visual-food-card ' + (chosen ? 'is-selected' : '')}>
                    <button type="button" className="visual-food-main" aria-pressed={!!chosen}
                      onClick={() => chosen ? removeFood(f.id) : addFood(f.id)}>
                      <span className="visual-food-illustration" aria-hidden="true">{foodEmoji[f.id] ?? '🍽️'}</span>
                      <span className="visual-food-info"><strong>{f.name}</strong><small>Suggested {suggested}</small>{f.nutritionSource && <small>Source-based recipe estimate</small>}{fibreMethod(f) !== 'total' && <small>Dietary fibre unverified</small>}</span>
                      <span className={'visual-food-check ' + (chosen ? 'checked' : '')}>{chosen ? '✓' : '+'}</span>
                    </button>
                    {chosen && <div className="visual-food-amount" onClick={event => event.stopPropagation()}>
                      <span className="visual-amount-label">{unit ? 'How many?' : 'Portion'}</span>
                      <div className="visual-quantity-controls">
                        {unit ? <>
                          <button type="button" aria-label={'Decrease ' + f.name + ' count'} disabled={count <= 0} onClick={() => setCount(f.id, Math.max(0, count - 1))}>−</button>
                          <label className="sr-only" htmlFor={'food-count-' + f.id}>{f.name} count</label>
                          <input id={'food-count-' + f.id} type="number" min="0" max="40" step="1" value={count} onChange={e => setCount(f.id, Number(e.target.value))} />
                          <span>{count === 1 ? unit.singular : unit.plural}</span>
                          <button type="button" aria-label={'Increase ' + f.name + ' count'} disabled={count >= 40} onClick={() => setCount(f.id, count + 1)}>+</button>
                        </> : <>
                          <label className="sr-only" htmlFor={'visual-grams-' + f.id}>{f.name} grams</label>
                          <input id={'visual-grams-' + f.id} type="number" min="0" max="2000" step="5" value={chosen.grams} onChange={e => setGrams(f.id, Number(e.target.value))} />
                          <span>g</span>
                        </>}
                      </div>
                    </div>}
                  </div>;
                })}
              </div>
              {stepFoods.length > guidedChoices.length && <button type="button" className="text-action compact-show-all" onClick={() => setShowAllChoices(true)}>Show more choices</button>}
              {conditionSummary(conditions).length > 0 && <details className="compact-guidance"><summary>Food guidance for your profile</summary>{conditionSummary(conditions).map(t => <p key={t}>{t}</p>)}</details>}
              <div className="compact-step-footer">
                <button type="button" className="secondary" onClick={() => setGuideStep(i => Math.max(0, i - 1))} disabled={guideStep === 0}>← Back</button>
                {guideStep < 2 ? <button className="primary" type="button" onClick={() => { setGuideStep(i => Math.min(2,i+1));setShowAllChoices(false);}}>Next: {guideStep === 0 ? 'Protein' : 'Carbs'} →</button> : <span className="compact-finish">All steps shown ✓</span>}
              </div>
            </section>
            <aside className="panel compact-meal-summary" aria-label="Live meal summary">
              <div className="compact-summary-title"><h3>Meal summary</h3><span>{selected.length} foods</span></div>
              <div className="compact-calories"><strong>{format(calculated.kcal, 0)}</strong><span>kcal estimated</span></div>
              <div className="compact-macros"><span>Protein <strong>{format(calculated.protein)} g</strong></span><span>Carbs <strong>{format(calculated.carbs)} g</strong></span><span>Fibre <strong>{selectedFibreCoverage.complete ? format(calculated.fibre) + ' g' : 'Not available'}</strong></span><span>Fat <strong>{format(calculated.fat)} g</strong></span></div>
              {selected.length > 0 && <details className="compact-selection-details"><summary>Selected foods ({selected.length})</summary><ul>{selected.map(item => <li key={item.id}>{lookup.get(item.id)?.name}: {foodQuantityLabel(item.id, item.grams)}</li>)}</ul></details>}
              <button className="primary full" type="button" disabled={!selected.some(i => i.grams > 0)} onClick={saveDemo}>Add to demo history →</button>
              <p className="fine-print">Portions and nutrition are illustrative, not a medical prescription. Demo meals aren't saved to Firestore.</p>
            </aside>
          </div>
        </>}

        {page === 'history' && <>
          <div className="page-heading"><p className="eyebrow">YOUR JOURNEY</p><h1>Meal history</h1><p>Meals added during this browser session. These are demos, not verified consumption records.</p></div>
          {entries.length ? <div className="history-list">{entries.map(entry => <article className="panel history-entry" key={entry.id}><div><span className="eyebrow">{entry.date} · {entry.meal}</span><h3>{entry.items.map(i => lookup.get(i.id)?.name).filter(Boolean).join(', ')}</h3><p>{entry.items.map(i => `${lookup.get(i.id)?.name}: ${foodQuantityLabel(i.id, i.grams)}`).join(' • ')}</p></div><div className="history-end"><strong>{format(entry.totals.kcal, 0)} kcal</strong><button type="button" className="secondary" onClick={() => repeatEntry(entry)}>Edit as new meal</button><button type="button" className="text-action danger" onClick={() => setEntries(list => list.filter(e => e.id !== entry.id))}>Remove</button></div></article>)}</div> : <div className="empty-state tall"><span className="empty-art">📔</span><h3>No demo meals yet</h3><p>Build a meal and add it to this session to see it here.</p><button className="primary" type="button" onClick={() => navigate('builder')}>Build a meal →</button></div>}
        </>}

        {page === 'insights' && <>
          <div className="page-heading"><p className="eyebrow">YOUR PROGRESS</p><h1>Nutrition insights</h1><p>Simple summaries of meals added during this session—not medical guidance.</p></div>
          <div className="summary-grid"><article className="mini-card"><span className="card-icon green">◷</span><span className="stat-big">{entries.length}</span><strong>Demo entries</strong><small>Not persisted</small></article><article className="mini-card"><span className="card-icon orange">◈</span><span className="stat-big">{format(savedNutrition.kcal, 0)}</span><strong>Total sample kcal</strong><small>Across current session</small></article><article className="mini-card"><span className="card-icon purple">✳</span><span className="stat-big">{format(savedNutrition.protein)}</span><strong>Protein (g)</strong><small>Across current session</small></article></div>
          <article className="panel"><h3>Selected date breakdown</h3><label className="date-inline">Choose date<input type="date" value={mealDate} onChange={e => setMealDate(e.target.value)} /></label><NutritionStrip value={dayNutrition} fibreComplete={dayFibreCoverage.complete}/><p className="fine-print">{dayEntries.length} demo meal{dayEntries.length === 1 ? '' : 's'} on this date. Unlogged meals are unknown, not zero intake.</p></article>
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
