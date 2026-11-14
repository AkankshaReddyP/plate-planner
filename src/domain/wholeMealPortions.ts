import { categorySuggestions } from './portionSuggestions';

export type MealFood = { id: string; category: string; values: { fibre: number; carbs: number; kcal: number } };
export type MealItem = { id: string; grams: number; edited?: boolean };
export const EXAMPLE_MEAL_FIBRE_GRAMS = 7;

/** Educational demo reference only; a clinical target requires individualized inputs. */
export function mealFibre(items: readonly MealItem[], foods: readonly MealFood[]): number {
  const byId = new Map(foods.map(f => [f.id, f]));
  return items.reduce((sum, item) => {
    const f = byId.get(item.id);
    return sum + (f && Number.isFinite(item.grams) && item.grams > 0 ? item.grams * f.values.fibre / 100 : 0);
  }, 0);
}

const round5 = (value: number) => Math.round(value / 5) * 5;

/**
 * Uses ALL chosen foods and their fibre per 100g, not just the number
 * of selected foods. Keeps any manually edited quantity unchanged.
 * Demonstration algorithm: initial vegetable portions 50g each, plus
 * a capped fibre-based allocation towards the user-adjustable example goal.
 * No diagnosed condition is treated as a medically verified nutrient limit.
 */
export function suggestWholeMealPortions(
  selected: readonly MealItem[],
  foods: readonly MealFood[],
  fibreGoal: number = EXAMPLE_MEAL_FIBRE_GRAMS,
): Map<string, number> {
  const byId = new Map(foods.map(food => [food.id, food]));
  const hints = categorySuggestions(selected.map(x => x.id), foods);
  const amounts = new Map<string, number>();
  for (const item of selected) {
    const food = byId.get(item.id);
    if (!food) continue;
    amounts.set(item.id, item.edited ? item.grams : food.category === 'Vegetable'
      ? 50 : (hints.get(item.id)?.grams ?? 100));
  }
  const editableVegetables = selected.filter(item => {
    const food = byId.get(item.id);
    return food?.category === 'Vegetable' && !item.edited && food.values.fibre > 0;
  });
  if (!editableVegetables.length || !Number.isFinite(fibreGoal) || fibreGoal <= 0) return amounts;
  const current = mealFibre(selected.map(item => ({ ...item, grams: amounts.get(item.id) ?? 0 })), foods);
  const gap = Math.max(0, fibreGoal - current);
  if (gap === 0) return amounts;
  // Equalize each selected vegetable's estimated contribution to the gap.
  const gapPerFood = gap / editableVegetables.length;
  for (const item of editableVegetables) {
    const density = byId.get(item.id)!.values.fibre / 100;
    const extraGrams = gapPerFood / density;
    amounts.set(item.id, Math.min(200, Math.max(50, round5(50 + extraGrams))));
  }
  return amounts;
}
