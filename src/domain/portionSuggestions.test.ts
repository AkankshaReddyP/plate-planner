import { describe, expect, it } from 'vitest';
import { categorySuggestions, suggestedPortion } from './portionSuggestions';
const foods = [
  { id: 'spinach', category: 'Vegetable' }, { id: 'carrot', category: 'Vegetable' },
  { id: 'dal', category: 'Protein' }, { id: 'egg', category: 'Protein' }, { id: 'curd', category: 'Dairy' },
  { id: 'rice', category: 'Grain' }, { id: 'roti', category: 'Grain' },
];
describe('sample portion suggestions', () => {
  it('uses food-specific starting gram amounts', () => {
    expect(suggestedPortion('egg').grams).toBe(50);
    expect(suggestedPortion('dal').grams).toBe(150);
    expect(suggestedPortion('roti').grams).toBe(40);
  });
  it('suggests separate reduced portions when multiple foods share a guide category', () => {
    const portions = categorySuggestions(['dal', 'egg'], foods);
    expect(portions.get('dal')?.grams).toBe(75);
    expect(portions.get('egg')?.grams).toBe(25);
    expect(portions.get('dal')?.status).toBe('sample');
  });
  it('groups dairy with protein and grain with fruit, but does not reduce unrelated categories', () => {
    const portions = categorySuggestions(['spinach', 'dal', 'curd', 'rice'], foods);
    expect(portions.get('spinach')?.grams).toBe(100);
    expect(portions.get('dal')?.grams).toBe(75);
    expect(portions.get('curd')?.grams).toBe(75);
    expect(portions.get('rice')?.grams).toBe(100);
  });
  it('de-duplicates foods and safely falls back for unknown food ids', () => {
    const portions = categorySuggestions(['egg', 'egg', 'not-in-catalog'], foods);
    expect(portions.size).toBe(1);
    expect(portions.get('egg')?.grams).toBe(50);
    expect(suggestedPortion('unknown').grams).toBe(100);
  });
});
