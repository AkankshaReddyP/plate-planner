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
export function suggestedPortion(foodId: string): SuggestedPortion {
  const choice = startingPortions[foodId];
  return {
    grams: choice?.grams ?? 100,
    explanation: choice?.explanation ?? 'Sample portion only; adjust based on your needs.',
    status: 'sample',
  };
}
