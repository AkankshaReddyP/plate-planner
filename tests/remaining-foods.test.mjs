import test from 'node:test';
import assert from 'node:assert/strict';
import { REMAINING_DISHES, mayUpgradePending } from '../scripts/remaining-south-indian-recipes.mjs';

const expectedIds=[
  'rava_dosa','upma','coconut_rice','ragi_mudde','tomato_pappu',
  'palakura_pappu','pesarapappu','bendakaya_fry','beans_poriyal',
  'cabbage_poriyal','egg_burji','chicken_curry','fish_curry',
  'vegetable_kootu','pachadi',
];

test('all 15 remaining canonical South Indian catalog ids have source-linked recipe estimates',()=>{
  assert.deepEqual(REMAINING_DISHES.map(f=>f.id).sort(),expectedIds.sort());
  assert.equal(new Set(REMAINING_DISHES.map(f=>f.id)).size,15);
  for(const food of REMAINING_DISHES){
    assert.equal(food.isActive,true);
    assert.equal(food.nutritionStatus,'sample');
    assert.equal(food.nutritionSource.fibreMethod,'unknown');
    assert.equal(food.nutritionSource.basis,'100g of named prepared recipe');
    assert.ok(food.nutritionSource.variant.length>5);
    assert.ok(food.nutritionSource.url.startsWith('https://'));
    assert.ok(food.nutritionSource.notes.length>10);
    assert.equal(Object.hasOwn(food.values,'fibre'),false);
    for(const nutrient of ['kcal','protein','carbs','fat']){
      assert.ok(Number.isFinite(food.values[nutrient]) && food.values[nutrient]>=0, food.id+' '+nutrient);
    }
  }
});

test('transcribed figures match named source variants, including katori conversion',()=>{
  const byId=new Map(REMAINING_DISHES.map(f=>[f.id,f]));
  assert.deepEqual(byId.get('rava_dosa').values,{kcal:227.05,protein:7.3,carbs:32.84,fat:7.12});
  assert.deepEqual(byId.get('tomato_pappu').values,{kcal:85,protein:4,carbs:11,fat:3});
  assert.deepEqual(byId.get('palakura_pappu').values,{kcal:78.82,protein:4.11,carbs:10.26,fat:2.42});
  assert.equal(byId.get('pesarapappu').values.kcal,87.65);
  assert.ok(Math.abs(byId.get('pesarapappu').values.protein*1.5-7.25)<0.01);
  assert.deepEqual(byId.get('chicken_curry').values,{kcal:121,protein:11,carbs:5,fat:6});
  assert.deepEqual(byId.get('fish_curry').values,{kcal:170,protein:12,carbs:3,fat:12});
});

test('does not overwrite source-reviewed, inactive, or customized records',()=>{
  assert.equal(mayUpgradePending({isActive:true,nutritionStatus:'pending'}),true);
  assert.equal(mayUpgradePending({isActive:true,nutritionStatus:'pending',values:null}),true);
  assert.equal(mayUpgradePending({isActive:true,nutritionStatus:'pending',values:{kcal:10}}),false);
  assert.equal(mayUpgradePending({isActive:true,nutritionStatus:'verified'}),false);
  assert.equal(mayUpgradePending({isActive:true,nutritionStatus:'sample'}),false);
  assert.equal(mayUpgradePending({isActive:false,nutritionStatus:'pending'}),false);
  assert.equal(mayUpgradePending(null),false);
});
