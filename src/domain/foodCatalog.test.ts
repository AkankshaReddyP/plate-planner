import { describe, expect, it } from 'vitest';
import { parseFoodDoc } from './foodCatalog';
const sample = { isActive:true,name:'Idli',category:'Grain',subtitle:'Recipe varies',cuisine:'South Indian',aliases:['idly'],
  nutritionStatus:'pending' };
describe('Firestore food parsing', () => {
  it('shows active pending foods as catalog entries without invented nutrients', () => {
    const entry = parseFoodDoc('idli',sample);
    expect(entry).toMatchObject({id:'idli',name:'Idli',nutritionStatus:'pending',cuisine:'South Indian'});
    expect(entry?.values.kcal).toBe(0);
  });
  it('permits complete sample entries and rejects partial or invalid numeric data', () => {
    const values = {kcal:130,protein:3,carbs:28,fibre:0.5,fat:0.3};
    expect(parseFoodDoc('rice',{...sample,nutritionStatus:'sample',values})?.values.carbs).toBe(28);
    // If total fibre is explicitly claimed, the value must be present.
    expect(parseFoodDoc('rice',{...sample,nutritionStatus:'verified',nutritionSource:{title:'A',url:'https://example.org',basis:'100g cooked',fibreMethod:'total'},values:{...values,fibre:undefined}})).toBeNull();
    expect(parseFoodDoc('rice',{...sample,nutritionStatus:'sample',values:{...values,fibre:undefined}})?.values.fibre).toBe(0);
    expect(parseFoodDoc('rice',{...sample,nutritionStatus:'sample',values:{...values,protein:-3}})).toBeNull();
    expect(parseFoodDoc('rice',{...sample,nutritionStatus:'sample',values:{...values,kcal:Infinity}})).toBeNull();
  });
  it('never exposes inactive, malformed or unknown-category records', () => {
    expect(parseFoodDoc('idli',{...sample,isActive:false})).toBeNull();
    expect(parseFoodDoc('idli',{...sample,category:'Unrecognized'})).toBeNull();
    expect(parseFoodDoc('idli',{...sample,name:''})).toBeNull();
  });
});
describe('fibre provenance', () => {
  it('hides crude fibre while retaining the other research nutrients', () => {
    const source={title:'Study',url:'https://example.org/article',basis:'100g',fibreMethod:'crude'};
    const food = parseFoodDoc('idli',{...sample,nutritionStatus:'sample',
      nutritionSource:source,values:{kcal:120,protein:5,carbs:20,fat:2,fibre:8}});
    expect(food?.values.kcal).toBe(120);
    expect(food?.values.fibre).toBe(0);
    expect(food?.nutritionSource?.fibreMethod).toBe('crude');
  });
  it('uses numbers only when a valid source confirms total dietary fibre', () => {
    const source={title:'Study',url:'https://example.org/article',basis:'100g',fibreMethod:'total'};
    const food = parseFoodDoc('sambar',{...sample,nutritionStatus:'sample',
      nutritionSource:source,values:{kcal:76,protein:3,carbs:10,fat:2,fibre:4}});
    expect(food?.values.fibre).toBe(4);
  });
});

describe('regional dish tags', () => {
  it('parses a pending quinoa or ragi food group without inventing nutrition', () => {
    const quinoa = parseFoodDoc('quinoa_cooked',{...sample,name:'Cooked quinoa',foodGroup:'Quinoa',cuisine:'Everyday / modern'});
    expect(quinoa?.foodGroup).toBe('Quinoa');
    expect(quinoa?.nutritionStatus).toBe('pending');
    expect(quinoa?.values.kcal).toBe(0);
  });
});
