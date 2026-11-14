import { describe, expect, it } from 'vitest';
import { conditionSummary, foodGuidance, guideSteps, inStep } from './mealGuidance';

const rice = { id: 'rice', name: 'White rice', category: 'Grain' };
const roti = { id: 'roti', name: 'Roti', category: 'Grain' };
const spinach = { id: 'spinach', name: 'Spinach', category: 'Vegetable' };
const egg = { id: 'egg', name: 'Egg', category: 'Protein' };
describe('guided meal categories', () => {
  it('starts with vegetables, then protein, then carbohydrate foods', () => {
    expect(guideSteps.map(s => s.key)).toEqual(['vegetables', 'protein', 'carbohydrates']);
    expect(inStep(spinach, 'vegetables')).toBe(true);
    expect(inStep(egg, 'protein')).toBe(true);
    expect(inStep(rice, 'carbohydrates')).toBe(true);
    expect(inStep(rice, 'vegetables')).toBe(false);
  });
});
describe('condition-aware choices', () => {
  it('prioritizes higher-fibre grains in diabetes without prohibiting refined grain', () => {
    expect(foodGuidance(roti, ['Diabetes']).priority).toBeLessThan(foodGuidance(rice, ['Diabetes']).priority);
    expect(foodGuidance(rice, ['Diabetes']).note).toMatch(/portion/);
  });
  it('does not misclassify vegetables as inflammatory arthritis triggers', () => {
    expect(foodGuidance(spinach, ['Arthritis']).priority).toBe(0);
    expect(conditionSummary(['Arthritis'])[0]).toMatch(/No specific food/);
  });
  it('does not automatically impose specific carbohydrate or sodium limits', () => {
    expect(conditionSummary(['Diabetes'])[0]).toMatch(/No universal carbohydrate limit/);
    expect(conditionSummary(['High blood pressure'])[0]).toMatch(/does not contain verified sodium data/);
  });
  it('does not infer clinical restrictions from nondisclosure or none', () => {
    expect(conditionSummary(['None', 'Prefer not to share'])).toEqual([]);
  });
});
