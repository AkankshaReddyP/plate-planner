import { guideSteps, inStep, type GuideFood } from './mealGuidance';

/** Completion means a positive portion from each guided food category.
 * It is a workflow indicator, NOT a measure of nutritional balance.
 */
export function categoryProgress(
  selected: readonly { id: string; grams: number }[],
  foods: readonly GuideFood[],
): { completed: number; total: number; percent: number; checked: boolean[] } {
  const byId = new Map(foods.map(food => [food.id, food]));
  const checked = guideSteps.map(step => selected.some(item => {
    const food = byId.get(item.id);
    return !!food && Number.isFinite(item.grams) && item.grams > 0 && inStep(food, step.key);
  }));
  const completed = checked.filter(Boolean).length;
  const total = guideSteps.length;
  return { completed, total, percent: Math.round((completed / total) * 100), checked };
}
