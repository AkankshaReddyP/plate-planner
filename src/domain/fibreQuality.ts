/**
 * Fibre is only comparable across foods if the source measures total dietary
 * fibre. Crude fibre is NOT interchangeable with total dietary fibre.
 */
export type FibreMethod = 'total' | 'crude' | 'unknown';
export type FibreProvenance = { nutritionSource?: { fibreMethod?: string } };
export function fibreMethod(food: FibreProvenance): FibreMethod {
  return food.nutritionSource?.fibreMethod === 'total' ? 'total'
    : food.nutritionSource?.fibreMethod === 'crude' ? 'crude'
    : 'unknown';
}
export function hasComparableFibre(
  selected: readonly {id: string; grams: number}[],
  foods: readonly ({id: string} & FibreProvenance)[],
): boolean {
  const byId = new Map(foods.map(f => [f.id, f]));
  return selected.every(item => item.grams <= 0 || (() => {
    const food = byId.get(item.id);
    return !!food && fibreMethod(food) === 'total';
  })());
}
export function fibreCoverage(
  selected: readonly {id: string; grams: number}[],
  foods: readonly ({id: string} & FibreProvenance)[],
): {complete: boolean; missingIds: string[]} {
  const byId = new Map(foods.map(f => [f.id, f]));
  const missingIds = [...new Set(selected.filter(item => item.grams > 0)
    .filter(item => {const food = byId.get(item.id);return !food || fibreMethod(food) !== 'total';})
    .map(item => item.id))];
  return { complete: missingIds.length === 0, missingIds };
}
