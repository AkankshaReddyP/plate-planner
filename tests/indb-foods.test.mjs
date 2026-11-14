import test from 'node:test';
import assert from 'node:assert/strict';
import { INDB_RECIPES, canApplyINDBUpdate } from '../scripts/indb-south-indian-recipes.mjs';
test('16 recipe-source-specific South Indian foods have per-100g macro fields',()=>{
  assert.equal(INDB_RECIPES.length,16);
  assert.equal(new Set(INDB_RECIPES.map(x=>x.id)).size,INDB_RECIPES.length);
  for(const food of INDB_RECIPES){
    assert.equal(food.nutritionStatus,'sample');
    assert.equal(food.nutritionSource.basis,'per 100g of named prepared recipe');
    assert.equal(food.nutritionSource.fibreMethod,'unknown');
    assert.ok(food.nutritionSource.url.startsWith('https://www.anuvaad.org.in/nutrition-fact/'));
    assert.equal(Object.hasOwn(food.values,'fibre'),false);
    assert.ok(Number.isFinite(food.reportedFibreG) && food.reportedFibreG>=0);
    for(const key of ['kcal','protein','carbs','fat'])
      assert.ok(Number.isFinite(food.values[key])&&food.values[key]>=0,food.id+' '+key);
  }
});
test('preserves exact published reference values for key dishes',()=>{
  const map=new Map(INDB_RECIPES.map(x=>[x.id,x]));
  assert.deepEqual(map.get('sambar').values,{kcal:96.92,protein:3.35,carbs:10.57,fat:4.38});
  assert.equal(map.get('sambar').reportedFibreG,3.52);
  assert.deepEqual(map.get('rasam').values,{kcal:26.74,protein:1.13,carbs:3.37,fat:0.88});
  assert.deepEqual(map.get('pesarattu').values,{kcal:285.96,protein:12.32,carbs:31.91,fat:11.67});
  assert.equal(map.get('medu_vada').values.kcal,745.5);
  assert.deepEqual(map.get('masala_dosa').values,{kcal:164.58,protein:3.29,carbs:19.57,fat:7.84});
  assert.deepEqual(map.get('avial').values,{kcal:124.56,protein:2.46,carbs:8.47,fat:8.94});
  assert.equal(map.get('pulihora').reportedFibreG,5.12);
});
test('only untouched pending records can be upgraded',()=>{
  assert.equal(canApplyINDBUpdate({isActive:true,nutritionStatus:'pending'}),true);
  assert.equal(canApplyINDBUpdate({isActive:true,nutritionStatus:'pending',values:null}),true);
  assert.equal(canApplyINDBUpdate({isActive:true,nutritionStatus:'verified'}),false);
  assert.equal(canApplyINDBUpdate({isActive:true,nutritionStatus:'sample'}),false);
  assert.equal(canApplyINDBUpdate({isActive:false,nutritionStatus:'pending'}),false);
  assert.equal(canApplyINDBUpdate({isActive:true,nutritionStatus:'pending',values:{kcal:0}}),false);
});
