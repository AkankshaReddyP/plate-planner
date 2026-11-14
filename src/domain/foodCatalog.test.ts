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
    expect(parseFoodDoc('rice',{...sample,nutritionStatus:'verified',values:{...values,fibre:undefined}})).toBeNull();
    expect(parseFoodDoc('rice',{...sample,nutritionStatus:'sample',values:{...values,protein:-3}})).toBeNull();
    expect(parseFoodDoc('rice',{...sample,nutritionStatus:'sample',values:{...values,kcal:Infinity}})).toBeNull();
  });
  it('never exposes inactive, malformed or unknown-category records', () => {
    expect(parseFoodDoc('idli',{...sample,isActive:false})).toBeNull();
    expect(parseFoodDoc('idli',{...sample,category:'Unrecognized'})).toBeNull();
    expect(parseFoodDoc('idli',{...sample,name:''})).toBeNull();
  });
});