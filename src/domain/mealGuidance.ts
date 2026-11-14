/** Educational food prioritization for the demo catalog, never a medical food ban. */
export type GuideStep = 'vegetables' | 'protein' | 'carbohydrates';
export type GuideFood = { id: string; name: string; category: string };
export const guideSteps: {key: GuideStep; title: string; hint: string}[] = [
  { key: 'vegetables', title: 'Vegetables & fibre first', hint: 'Start with non-starchy vegetables where practical.' },
  { key: 'protein', title: 'Protein next', hint: 'Choose a protein source; legumes also contain carbohydrates.' },
  { key: 'carbohydrates', title: 'Carbohydrates last', hint: 'Choose portions of grains or fruit that suit your needs.' },
];
export function inStep(food: GuideFood, step: GuideStep): boolean {
  if (step === 'vegetables') return food.category === 'Vegetable';
  if (step === 'protein') return food.category === 'Protein' || food.category === 'Dairy';
  return food.category === 'Grain' || food.category === 'Fruit';
}
export function foodGuidance(food: GuideFood, conditions: readonly string[]): {priority: number; note: string} {
  const diabetes = conditions.includes('Diabetes');
  const arthritis = conditions.includes('Arthritis');
  if (diabetes) {
    if (food.id === 'rice') return { priority: 3, note: 'Refined grain: consider a smaller serving and monitor total meal carbohydrates.' };
    if (food.id === 'roti') return { priority: 0, note: 'Whole-wheat option: still count carbohydrates in your portion.' };
    if (food.category === 'Fruit') return { priority: 1, note: 'Whole fruit provides fibre; include its carbohydrates in your meal total.' };
  }
  if (arthritis) {
    if (food.category === 'Vegetable' || food.category === 'Fruit') return { priority: 0, note: 'Plant foods fit an anti-inflammatory eating pattern.' };
    if (food.id === 'dal') return { priority: 0, note: 'Legumes add fibre and plant protein.' };
  }
  return { priority: 1, note: '' };
}
export function conditionSummary(conditions: readonly string[]): string[] {
  const notes: string[] = [];
  if (conditions.includes('Diabetes')) notes.push('Diabetes: track total carbohydrate portions and prioritize minimally processed, fibre-rich foods. No universal carbohydrate limit is assumed.');
  if (conditions.includes('Arthritis')) notes.push('Arthritis: favour a varied, Mediterranean-style pattern. No specific food is automatically an inflammation trigger.');
  if (conditions.includes('High blood pressure')) notes.push('High blood pressure: pay attention to sodium in ingredients and prepared dishes. This demo catalog does not contain verified sodium data.');
  if (conditions.includes('Thyroid condition')) notes.push('Thyroid conditions vary; do not restrict foods without individualized clinical advice.');
  if (conditions.includes('Other')) notes.push('Your selected condition needs tailored advice from a qualified clinician before food restrictions are applied.');
  return notes;
}
