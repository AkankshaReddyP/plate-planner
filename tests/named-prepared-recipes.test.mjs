import test from 'node:test';
import assert from 'node:assert/strict';
import { NAMED_PREPARED_RECIPES, canEnrichNamedRecipe } from '../scripts/named-prepared-recipes.mjs';
import { ANDHRA_EXPANSION } from '../scripts/andhra-expansion-foods.mjs';

test('four named prepared dishes have distinct source evidence and macro values',()=>{
  assert.equal(NAMED_PREPARED_RECIPES.length,4);
  const canonical=new Set(ANDHRA_EXPANSION.map(f=>f.id));
  for(const food of NAMED_PREPARED_RECIPES){
    assert.ok(canonical.has(food.id),food.id);
    assert.equal(food.nutritionStatus,'sample');
    assert.equal(food.nutritionSource.fibreMethod,'unknown');
    assert.equal(Object.hasOwn(food.values,'fibre'),false);
    assert.ok(food.nutritionSource.variant.length>16);
    assert.match(food.nutritionSource.url,/^https:\/\//);
    for(const key of ['kcal','protein','carbs','fat']){
      assert.ok(Number.isFinite(food.values[key])&&food.values[key]>=0);
    }
    assert.ok(Number.isFinite(food.reportedFibreG));
  }
});
test('source-reported recipe macros are per prepared 100g not raw ingredients',()=>{
  const byId=new Map(NAMED_PREPARED_RECIPES.map(x=>[x.id,x]));
  assert.deepEqual(byId.get('gutti_vankaya_kura').values,{kcal:153,protein:3,carbs:10,fat:12});
  assert.deepEqual(byId.get('dosakaya_pappu').values,{kcal:73,protein:3,carbs:11,fat:2});
  assert.deepEqual(byId.get('ragi_sangati').values,{kcal:81,protein:2,carbs:16,fat:1});
  assert.deepEqual(byId.get('chapati').values,{kcal:202.31,protein:5.88,carbs:35.65,fat:3.56});
});
test('a published recipe never overwrites existing reviewed nutrition',()=>{
  assert.equal(canEnrichNamedRecipe({isActive:true,nutritionStatus:'pending'}),true);
  assert.equal(canEnrichNamedRecipe({isActive:true,nutritionStatus:'pending',values:null}),true);
  assert.equal(canEnrichNamedRecipe({isActive:true,nutritionStatus:'sample'}),false);
  assert.equal(canEnrichNamedRecipe({isActive:true,nutritionStatus:'verified'}),false);
  assert.equal(canEnrichNamedRecipe({isActive:true,nutritionStatus:'pending',values:{kcal:0}}),false);
});
