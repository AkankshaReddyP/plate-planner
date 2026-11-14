/**
 * Illustrative starting portions for the current sample food catalog.
 * These are UX defaults, not individualized prescriptions or nutritional targets.
 * Each amount refers to the food's stated prepared/raw form, in grams.
 * Once validated foods and user goals are available, replace these
 * defaults with reviewed recommendations based on full meal context.
 */
const startingPortions: Record<string, { grams: number; explanation: string }> = {
  rice: { grams: 100, explanation: 'A small cooked-grain starting portion. Adjust for your full meal.' },
  roti: { grams: 40, explanation: 'Approximate starting weight for one prepared roti; actual size varies.' },
  dal: { grams: 150, explanation: 'A sample cooked-dal serving. Legumes contain both protein and carbohydrates.' },
  egg: { grams: 50, explanation: 'Approximate weight of one boiled egg without the shell.' },
  chicken: { grams: 90, explanation: 'A sample cooked chicken portion, approximately 3 ounces.' },
  curd: { grams: 150, explanation: 'A sample portion of plain curd; check the product nutrition information.' },
  spinach: { grams: 100, explanation: 'A sample cooked-vegetable portion. Add other vegetables if desired.' },
  carrot: { grams: 100, explanation: 'A sample raw-vegetable portion. Add other vegetables if desired.' },
  banana: { grams: 100, explanation: 'An illustrative edible banana portion; fruit sizes differ.' },
  apple: { grams: 120, explanation: 'An illustrative edible apple portion; fruit sizes differ.' },
};
export type SuggestedPortion = { grams: number; explanation: string; status: 'sample' };
export type PortionFood = { id: string; category: string };
export function suggestedPortion(foodId: string, sameGroupCount = 1): SuggestedPortion {
  const choice = startingPortions[foodId];
  const count = Math.max(1, Math.floor(sameGroupCount));
  // Simple illustrative shared-category starting point, not a dietary target.
  // Never prescribe quantities on the basis of a self-reported diagnosis.
  const baseGrams = choice?.grams ?? 100;
  const grams = count === 1 ? baseGrams : Math.max(10, Math.round(baseGrams / count / 5) * 5);
  return {
    grams,
    explanation: count === 1
      ? (choice?.explanation ?? 'Sample portion only; adjust based on your needs.')
      : `Sample starting portion when combining ${count} foods from this group; adjust each independently.`,
    status: 'sample',
  };
}
export function categorySuggestions(
  selectedIds: readonly string[],
  foods: readonly PortionFood[],
): Map<string, SuggestedPortion> {
  const byId = new Map(foods.map(food => [food.id, food.category]));
  const uniqueIds = [...new Set(selectedIds)].filter(id => byId.has(id));
  const counts = new Map<string, number>();
  uniqueIds.forEach(id => {
    const category = byId.get(id)!;
    // Protein and dairy share a guided step, as do grain and fruit.
    const group = category === 'Protein' || category === 'Dairy' ? 'protein'
      : category === 'Grain' || category === 'Fruit' ? 'carbohydrates' : 'vegetables';
    counts.set(group, (counts.get(group) ?? 0) + 1);
  });
  return new Map(uniqueIds.map(id => {
    const category = byId.get(id)!;
    const group = category === 'Protein' || category === 'Dairy' ? 'protein'
      : category === 'Grain' || category === 'Fruit' ? 'carbohydrates' : 'vegetables';
    return [id, suggestedPortion(id, counts.get(group) ?? 1)];
  }));
}
