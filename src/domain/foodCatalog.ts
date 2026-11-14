import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/client';

export type FoodCategory = 'Protein' | 'Grain' | 'Vegetable' | 'Fruit' | 'Dairy';
export type FoodNutrients = { kcal: number; protein: number; carbs: number; fibre: number; fat: number };
export type CatalogFood = {
  id: string;
  name: string;
  subtitle: string;
  category: FoodCategory;
  values: FoodNutrients;
  nutritionStatus: 'sample' | 'verified' | 'pending';
  cuisine: string;
  foodGroup?: string;
  aliases: string[];
  reportedFibreG?: number;
  crudeFibreG?: number;
  nutritionSource?: {title: string; url: string; basis: string; fibreMethod?: string; variant?: string};
};
export type FoodCatalogState = { foods: CatalogFood[]; loading: boolean; error: string | null };
const zero: FoodNutrients = { kcal: 0, protein: 0, carbs: 0, fibre: 0, fat: 0 };
const categories = new Set<FoodCategory>(['Protein', 'Grain', 'Vegetable', 'Fruit', 'Dairy']);
const keys: (keyof FoodNutrients)[] = ['kcal','protein','carbs','fat'];
const statuses = new Set(['sample','verified','pending']);

function parseSource(value: unknown): CatalogFood['nutritionSource'] {
  if (!value || typeof value !== 'object') return undefined;
  const data = value as Record<string, unknown>;
  if (typeof data.title !== 'string' || typeof data.url !== 'string'
    || typeof data.basis !== 'string' || !data.url.startsWith('https://')) return undefined;
  return {
    title: data.title, url: data.url, basis: data.basis,
    fibreMethod: typeof data.fibreMethod === 'string' ? data.fibreMethod : undefined,
    variant: typeof data.variant === 'string' ? data.variant : undefined,
  };
}
export function parseFoodDoc(id: string, raw: Record<string, unknown>): CatalogFood | null {
  if (typeof raw.name !== 'string' || !raw.name.trim()) return null;
  if (!categories.has(raw.category as FoodCategory) || !statuses.has(raw.nutritionStatus as string)) return null;
  if (raw.isActive !== true) return null;
  const status = raw.nutritionStatus as CatalogFood['nutritionStatus'];
  const rawValues = raw.values && typeof raw.values === 'object' ? raw.values as Record<string, unknown> : null;
  // Never display a pending food as 0 kcal; it is explicitly ineligible for meal calculations.
  const source = parseSource(raw.nutritionSource);
  if (status !== 'pending' && (!rawValues || !keys.every(key => typeof rawValues[key] === 'number'
    && Number.isFinite(rawValues[key]) && (rawValues[key] as number) >= 0))) return null;
  if (status !== 'pending' && source?.fibreMethod === 'total'
    && (!rawValues || typeof rawValues.fibre !== 'number'
      || !Number.isFinite(rawValues.fibre) || rawValues.fibre < 0)) return null;
  return {
    id, name: raw.name.trim(),
    subtitle: typeof raw.subtitle === 'string' ? raw.subtitle : 'Recipe varies',
    category: raw.category as FoodCategory,
    // Only documented total dietary fibre enters meal calculations.
    values: status === 'pending' ? { ...zero } : {
      ...(Object.fromEntries(keys.map(k => [k, rawValues![k]])) as Omit<FoodNutrients, 'fibre'>),
      fibre: source?.fibreMethod === 'total' ? rawValues!.fibre as number : 0,
    },
    nutritionStatus: status,
    cuisine: typeof raw.cuisine === 'string' ? raw.cuisine : 'Other',
    foodGroup: typeof raw.foodGroup === 'string' ? raw.foodGroup : undefined,
    aliases: Array.isArray(raw.aliases) ? raw.aliases.filter((x): x is string => typeof x === 'string') : [],
    nutritionSource: source,
    reportedFibreG: typeof raw.reportedFibreG === 'number' && Number.isFinite(raw.reportedFibreG) && raw.reportedFibreG >= 0 ? raw.reportedFibreG : undefined,
    crudeFibreG: typeof raw.crudeFibreG === 'number' && Number.isFinite(raw.crudeFibreG) && raw.crudeFibreG >= 0 ? raw.crudeFibreG : undefined,
  };
}

export function useFoodCatalog(): FoodCatalogState {
  const [state, setState] = useState<FoodCatalogState>({ foods: [], loading: true, error: null });
  useEffect(() => {
    if (!db) {
      setState({ foods: [], loading: false, error: 'Food catalog requires Firestore configuration.' });
      return;
    }
    const activeFoods = query(collection(db, 'foodCatalog'), where('isActive', '==', true));
    const unsubscribe = onSnapshot(activeFoods, snapshot => {
      const foods = snapshot.docs.map(d => parseFoodDoc(d.id, d.data())).filter((x): x is CatalogFood => !!x)
        .sort((a,b) => a.name.localeCompare(b.name));
      setState({ foods, loading: false, error: null });
    }, () => setState({
      foods: [], loading: false,
      error: 'Could not load foods. Check your connection and that the catalog has been seeded.',
    }));
    return unsubscribe;
  }, []);
  return state;
}
