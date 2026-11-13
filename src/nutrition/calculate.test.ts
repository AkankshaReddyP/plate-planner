import {describe,it,expect} from 'vitest';
import {calculateMeal,type Food} from './calculate';
const food:Food={id:'synthetic',name:'Synthetic test item',per100g:{calories:200,protein:20,carbs:10,fibre:2}};
describe('calculateMeal',()=>{
 it('scales per 100 grams accurately',()=>{expect(calculateMeal([{foodId:'synthetic',grams:50}],[food])).toEqual({calories:100,protein:10,carbs:5,fibre:1});});
 it('sums multiple portions',()=>{expect(calculateMeal([{foodId:'synthetic',grams:50},{foodId:'synthetic',grams:25}],[food]).calories).toBe(150);});
 it('rejects negative and nonfinite quantities',()=>{for(const grams of [-1,NaN,Infinity]) expect(()=>calculateMeal([{foodId:'synthetic',grams}],[food])).toThrow();});
 it('rejects unknown food IDs',()=>{expect(()=>calculateMeal([{foodId:'missing',grams:20}],[food])).toThrow();});
 it('handles empty meals',()=>{expect(calculateMeal([],[food]).protein).toBe(0);});
});
