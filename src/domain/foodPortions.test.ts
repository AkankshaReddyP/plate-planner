import { describe, expect, it } from 'vitest';
import { countToGrams, countUnitFor, foodQuantityLabel, suggestedCount } from './foodPortions';
describe('food-appropriate quantity units', () => {
  it('uses count for eggs and grams for other foods', () => {
    expect(countUnitFor('egg')).toMatchObject({ gramsPerItem: 50, singular: 'egg' });
    expect(countUnitFor('rice')).toBeNull();
  });
  it('converts whole egg counts into approximate edible grams', () => {
    expect(countToGrams('egg',2)).toBe(100);
    expect(countToGrams('egg',0)).toBe(0);
    expect(countToGrams('egg',1.5)).toBeNull();
    expect(countToGrams('egg',41)).toBeNull();
    expect(countToGrams('rice',2)).toBeNull();
  });
  it('rounds suggested egg servings to count', () => {
    expect(suggestedCount('egg',75)).toBe(2);
    expect(suggestedCount('egg',50)).toBe(1);
    expect(suggestedCount('rice',100)).toBeNull();
  });
  it('labels stored grams in food-friendly units', () => {
    expect(foodQuantityLabel('egg',100)).toBe('2 eggs');
    expect(foodQuantityLabel('egg',50)).toBe('1 egg');
    expect(foodQuantityLabel('rice',120)).toBe('120 g');
  });
});