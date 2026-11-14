import { describe, expect, it } from 'vitest';
import { categoryProgress } from './categoryProgress';

const foods = [
  { id: 'spinach', name: 'Spinach', category: 'Vegetable' },
  { id: 'carrot', name: 'Carrot', category: 'Vegetable' },
  { id: 'dal', name: 'Dal', category: 'Protein' },
  { id: 'curd', name: 'Curd', category: 'Dairy' },
  { id: 'rice', name: 'Rice', category: 'Grain' },
  { id: 'banana', name: 'Banana', category: 'Fruit' },
];

describe('guided meal completion', () => {
  it('starts empty and fills to 100% after one positive portion in each category', () => {
    expect(categoryProgress([], foods)).toMatchObject({completed: 0, total: 3, percent: 0, checked: [false, false, false]});
    const vegetables = [{id: 'spinach', grams: 100}];
    expect(categoryProgress(vegetables, foods)).toMatchObject({completed: 1, percent: 33, checked: [true, false, false]});
    const protein = [...vegetables, {id: 'dal', grams: 80}];
    expect(categoryProgress(protein, foods)).toMatchObject({completed: 2, percent: 67, checked: [true, true, false]});
    expect(categoryProgress([...protein, {id: 'rice', grams: 120}], foods)).toMatchObject({completed: 3, percent: 100, checked: [true, true, true]});
  });
  it('counts repeated food in the same category only once and reverses when a portion is removed', () => {
    const items = [{id: 'spinach', grams: 80}, {id: 'carrot', grams: 50}, {id: 'curd', grams: 0}, {id: 'rice', grams: 50}];
    expect(categoryProgress(items, foods)).toMatchObject({completed: 2, percent: 67});
    expect(categoryProgress(items.filter(i => i.id !== 'rice'), foods)).toMatchObject({completed: 1, percent: 33});
  });
  it('ignores zero, invalid, and missing food entries', () => {
    expect(categoryProgress([{id: 'dal', grams: 0}, {id:'rice', grams: NaN}, {id:'missing', grams: 200}], foods)).toMatchObject({completed: 0, percent: 0});
  });
});
