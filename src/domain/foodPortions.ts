/** Food-specific portions for the current demo catalog. Count conversion is approximate. */
export type CountUnit = { singular: string; plural: string; gramsPerItem: number };
const countUnits: Record<string, CountUnit> = {
  egg: { singular: 'egg', plural: 'eggs', gramsPerItem: 50 },
};
export function countUnitFor(foodId: string): CountUnit | null {
  return countUnits[foodId] ?? null;
}
export function countToGrams(foodId: string, count: number): number | null {
  const unit = countUnitFor(foodId);
  if (!unit || !Number.isInteger(count) || count < 0 || count > 40) return null;
  return count * unit.gramsPerItem;
}
export function suggestedCount(foodId: string, suggestedGrams: number): number | null {
  const unit = countUnitFor(foodId);
  if (!unit || !Number.isFinite(suggestedGrams)) return null;
  return Math.max(1, Math.min(40, Math.round(suggestedGrams / unit.gramsPerItem)));
}
export function foodQuantityLabel(foodId: string, grams: number): string {
  const unit = countUnitFor(foodId);
  if (!unit) return `${Number(grams.toFixed(1))} g`;
  const count = grams / unit.gramsPerItem;
  if (Number.isInteger(count)) return `${count} ${count === 1 ? unit.singular : unit.plural}`;
  return `${Number(grams.toFixed(1))} g (≈ ${Number(count.toFixed(1))} ${unit.plural})`;
}
export const foodEmoji: Record<string, string> = {
  rice:'🍚', roti:'🫓', dal:'🥣', egg:'🥚', chicken:'🍗',curd:'🥛',
  spinach:'🥬', carrot:'🥕',banana:'🍌',apple:'🍎',
};
