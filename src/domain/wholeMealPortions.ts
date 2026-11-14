import { categorySuggestions } from './portionSuggestions';

export type NutrientKey = 'kcal' | 'protein' | 'carbs' | 'fat' | 'fibre';
export type NutritionTargets = Record<NutrientKey, number>;
export type MealFood = { id: string; category: string; values: NutritionTargets };
export type MealItem = { id: string; grams: number; edited?: boolean };

/** Demo reference ONLY. Not calculated from a self-reported diagnosis. */
export const EXAMPLE_MEAL_TARGETS: NutritionTargets = {
  kcal: 500, protein: 25, carbs: 60, fat: 18, fibre: 7,
};
export const nutrientKeys: NutrientKey[] = ['kcal', 'protein', 'carbs', 'fat', 'fibre'];
export const nutrientLabels: Record<NutrientKey, string> = {
  kcal: 'Calories', protein: 'Protein', carbs: 'Carbs', fat: 'Fat', fibre: 'Fibre',
};
export const nutrientUnits: Record<NutrientKey, string> = {
  kcal: 'kcal', protein: 'g', carbs: 'g', fat: 'g', fibre: 'g',
};

export function mealNutrients(items: readonly MealItem[], foods: readonly MealFood[]): NutritionTargets {
  const byId = new Map(foods.map(f => [f.id, f]));
  const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };
  for (const item of items) {
    const food = byId.get(item.id);
    if (!food || !Number.isFinite(item.grams) || item.grams <= 0) continue;
    for (const nutrient of nutrientKeys) totals[nutrient] += (food.values[nutrient] || 0) * item.grams / 100;
  }
  return totals;
}

/**
 * Whole-meal illustrative optimizer:
 * - scores ALL five nutrients for ALL selected foods;
 * - respects manually edited gram values;
 * - keeps automatic values in plausible bounded demo ranges;
 * - never claims exact goal attainment when selected foods cannot reach it.
 * Low weights for unachievable fibre/fat ranges avoid extreme portions.
 */
export function suggestWholeMealPortions(
  selected: readonly MealItem[],
  foods: readonly MealFood[],
  targets: NutritionTargets = EXAMPLE_MEAL_TARGETS,
): Map<string, number> {
  const byId = new Map(foods.map(f => [f.id, f]));
  const base = categorySuggestions(selected.map(x => x.id), foods);
  const amounts = new Map<string, number>();
  const auto: MealItem[] = [];
  for (const item of selected) {
    if (!byId.has(item.id)) continue;
    const initial = item.edited ? item.grams : (base.get(item.id)?.grams ?? 100);
    amounts.set(item.id, initial);
    if (!item.edited) auto.push(item);
  }
  if (!auto.length) return amounts;

  const makeItems = () => selected.map(item => ({...item, grams: amounts.get(item.id) ?? 0}));
  const baselines = new Map(auto.map(item => [item.id, base.get(item.id)?.grams ?? 100]));
  const weights: NutritionTargets = { kcal: 1.2, protein: 1, carbs: 1, fat: 0.5, fibre: 0.65 };

  const score = () => {
    const actual = mealNutrients(makeItems(), foods);
    let sum = 0;
    for (const key of nutrientKeys) {
      const target = targets[key];
      if (!Number.isFinite(target) || target <= 0) continue;
      const diff = (actual[key] - target) / target;
      sum += weights[key] * diff * diff;
    }
    // Regularize toward modest base portions, including when foods are insufficient.
    for (const item of auto) {
      const baseline = baselines.get(item.id)!;
      const diff = ((amounts.get(item.id) ?? baseline) - baseline) / Math.max(100, baseline);
      sum += 0.12 * diff * diff;
    }
    return sum;
  };

  // Bounded coordinate descent on 5g increments, 3 passes.
  // This is deterministic and handles combinations without clinical claims.
  for (let pass = 0; pass < 3; pass++) {
    for (const item of auto) {
      const food = byId.get(item.id)!;
      const baseline = baselines.get(item.id)!;
      const lower = food.category === 'Vegetable' ? 25 : 10;
      const upper = Math.max(lower, Math.min(250, Math.max(100, baseline * 2)));
      let best = amounts.get(item.id) ?? baseline;
      let bestScore = score();
      for (let grams = lower; grams <= upper; grams += 5) {
        amounts.set(item.id, grams);
        const value = score();
        if (value < bestScore - 0.000001) {bestScore = value; best = grams;}
      }
      amounts.set(item.id, best);
    }
  }
  return amounts;
}
