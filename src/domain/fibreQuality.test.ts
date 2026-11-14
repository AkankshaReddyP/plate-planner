import { describe, it, expect } from 'vitest';
import { fibreCoverage, fibreMethod, hasComparableFibre } from './fibreQuality';

const foods = [
  {id:'spinach',nutritionSource:{fibreMethod:'total'}},
  {id:'idli',nutritionSource:{fibreMethod:'crude'}},
  {id:'sambar',nutritionSource:undefined},
];
describe('fibre method consistency', () => {
  it('recognizes only explicit total dietary fibre as comparable', () => {
    expect(fibreMethod(foods[0])).toBe('total');
    expect(fibreMethod(foods[1])).toBe('crude');
    expect(fibreMethod(foods[2])).toBe('unknown');
    expect(fibreMethod({nutritionSource:{fibreMethod:'insoluble'}})).toBe('unknown');
  });
  it('blocks crude or unknown fibre from whole-meal fibre totals', () => {
    const selected = [{id:'spinach',grams:100},{id:'idli',grams:80},{id:'sambar',grams:150}];
    expect(hasComparableFibre(selected,foods)).toBe(false);
    expect(fibreCoverage(selected,foods)).toEqual({complete:false,missingIds:['idli','sambar']});
    expect(hasComparableFibre([{id:'spinach',grams:100}],foods)).toBe(true);
  });
  it('does not treat a zero portion as missing nutrient coverage', () => {
    expect(fibreCoverage([{id:'spinach',grams:100},{id:'idli',grams:0}],foods).complete).toBe(true);
  });
});
