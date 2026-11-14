import { describe, expect, it } from 'vitest';
import { EXAMPLE_MEAL_TARGETS, mealNutrients, nutrientKeys, suggestWholeMealPortions } from './wholeMealPortions';
const foods = [
  {id:'spinach',category:'Vegetable',values:{kcal:23,protein:3,carbs:3.8,fat:0.3,fibre:2.4}},
  {id:'carrot',category:'Vegetable',values:{kcal:41,protein:0.9,carbs:9.6,fat:0.2,fibre:2.8}},
  {id:'dal',category:'Protein',values:{kcal:116,protein:7.2,carbs:20.3,fat:0.4,fibre:5.8}},
  {id:'egg',category:'Protein',values:{kcal:155,protein:12.6,carbs:1.1,fat:10.6,fibre:0}},
  {id:'rice',category:'Grain',values:{kcal:130,protein:2.7,carbs:28.2,fat:0.3,fibre:0.4}},
];
const selected = [{id:'spinach',grams:100},{id:'carrot',grams:100},{id:'dal',grams:150},{id:'egg',grams:50},{id:'rice',grams:100}];
describe('whole-meal nutrient recommendations', () => {
  it('sums all five nutrients across multiple selected foods', () => {
    const actual = mealNutrients(selected, foods);
    expect(actual.fibre).toBeCloseTo(2.4+2.8+8.7+0.4,5);
    expect(actual.protein).toBeCloseTo(3+0.9+10.8+6.3+2.7,5);
    expect(actual.carbs).toBeGreaterThan(60);
    expect(actual.kcal).toBeGreaterThan(400);
    expect(nutrientKeys).toEqual(['kcal','protein','carbs','fat','fibre']);
  });
  it('updates suggested vegetable and carbohydrate amounts based on meal-wide targets', () => {
    const basic = suggestWholeMealPortions(selected,foods,EXAMPLE_MEAL_TARGETS);
    const higherProtein = suggestWholeMealPortions(selected,foods,{...EXAMPLE_MEAL_TARGETS,protein:60});
    expect([...basic.keys()]).toHaveLength(5);
    expect([...higherProtein.values()]).not.toEqual([...basic.values()]);
  });
  it('accounts for other foods in the meal', () => {
    const veg = [{id:'spinach',grams:100},{id:'carrot',grams:100}];
    const first = suggestWholeMealPortions(veg,foods);
    const combined = suggestWholeMealPortions([...veg,{id:'dal',grams:150,edited:true}],foods);
    expect([...first.values()]).not.toEqual([...combined.values()].slice(0,2));
    expect(combined.get('dal')).toBe(150);
  });
  it('preserves manually edited quantities', () => {
    const result = suggestWholeMealPortions([{id:'spinach',grams:173,edited:true},{id:'carrot',grams:100}],foods);
    expect(result.get('spinach')).toBe(173);
  });
  it('limits automatic servings rather than forcing unattainable targets', () => {
    const result = suggestWholeMealPortions([{id:'spinach',grams:100}],foods,{kcal:2500,protein:150,carbs:300,fat:120,fibre:40});
    expect(result.get('spinach')).toBeLessThanOrEqual(200);
    expect(mealNutrients([{id:'spinach',grams:result.get('spinach')!}],foods).kcal).toBeLessThan(2500);
  });
});
