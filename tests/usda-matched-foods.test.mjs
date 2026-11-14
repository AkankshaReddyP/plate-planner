import test from 'node:test';
import assert from 'node:assert/strict';
import { USDA_MATCHED_FOODS, canEnrichPending } from '../scripts/usda-matched-foods.mjs';
import { PROTEIN_FOODS } from '../scripts/protein-foods.mjs';
import { ANDHRA_EXPANSION } from '../scripts/andhra-expansion-foods.mjs';

test('23 source-backed records have complete per-100g macros and total fibre',()=>{
  assert.equal(USDA_MATCHED_FOODS.length,23);
  assert.equal(new Set(USDA_MATCHED_FOODS.map(x=>x.id)).size,20);
  const canonical=new Set([...PROTEIN_FOODS,...ANDHRA_EXPANSION].map(x=>x.id));
  for(const food of USDA_MATCHED_FOODS){
    assert.ok(canonical.has(food.id),'not seeded as a canonical food: '+food.id);
    assert.equal(food.nutritionStatus,'sample');
    assert.equal(food.nutritionSource.fibreMethod,'total');
    assert.match(food.nutritionSource.url,/^https:\/\//);
    assert.ok(food.nutritionSource.variant.length>=15);
    assert.match(food.nutritionSource.basis,/100g edible portion/);
    for(const key of ['kcal','protein','carbs','fat','fibre'])
      assert.ok(Number.isFinite(food.values[key])&&food.values[key]>=0,food.id+' invalid '+key);
  }
});
test('documented preparation-specific control values match cited sources',()=>{
  const foods=new Map(USDA_MATCHED_FOODS.map(x=>[x.id,x]));
  assert.deepEqual(foods.get('kabuli_chana_cooked').values,
    {kcal:164,protein:8.86,carbs:27.42,fat:2.59,fibre:7.6});
  assert.deepEqual(foods.get('tofu_firm').values,
    {kcal:144,protein:17.27,carbs:2.78,fat:8.72,fibre:2.3});
  assert.deepEqual(foods.get('quinoa_cooked').values,
    {kcal:120,protein:4.4,carbs:21.3,fat:1.92,fibre:2.8});
  assert.deepEqual(foods.get('chicken_breast_grilled').values,
    {kcal:151,protein:30.54,carbs:0,fat:3.17,fibre:0});
});
test('only untouched pending items may be enriched, never altered completed records',()=>{
  assert.equal(canEnrichPending({isActive:true,nutritionStatus:'pending'}),true);
  assert.equal(canEnrichPending({isActive:true,nutritionStatus:'pending',values:null}),true);
  assert.equal(canEnrichPending({isActive:true,nutritionStatus:'pending',values:{kcal:123}}),false);
  assert.equal(canEnrichPending({isActive:true,nutritionStatus:'sample'}),false);
  assert.equal(canEnrichPending({isActive:true,nutritionStatus:'verified'}),false);
  assert.equal(canEnrichPending({isActive:false,nutritionStatus:'pending'}),false);
  assert.equal(canEnrichPending(undefined),false);
});
