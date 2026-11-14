import test from 'node:test';
import assert from 'node:assert/strict';
import { RESEARCHED_DISHES, canApplyResearchUpdate, RESEARCH_SOURCE } from '../scripts/researched-south-indian-foods.mjs';

test('all researched recipes have complete, finite per-100g values and citations', () => {
  assert.equal(RESEARCHED_DISHES.length, 12);
  assert.equal(new Set(RESEARCHED_DISHES.map(x => x.id)).size, RESEARCHED_DISHES.length);
  for (const food of RESEARCHED_DISHES) {
    assert.equal(food.isActive, true);
    assert.equal(food.nutritionStatus, 'sample');
    assert.equal(food.nutritionSource.url, RESEARCH_SOURCE.url);
    assert.equal(food.nutritionSource.fibreMethod, 'crude');
    assert.equal(food.nutritionSource.basis, '100g cooked food');
    for (const key of ['kcal','protein','carbs','fat','fibre']) {
      assert.ok(Number.isFinite(food.values[key]) && food.values[key] >= 0, food.id + ' invalid ' + key);
    }
  }
});
test('transcribed white-rice control values correspond to published Table 4', () => {
  const byId = new Map(RESEARCHED_DISHES.map(x => [x.id,x]));
  assert.deepEqual(byId.get('idli').values,{kcal:122.3,protein:4.8,carbs:23.2,fat:2.9,fibre:0.3});
  assert.deepEqual(byId.get('plain_dosa').values,{kcal:140.3,protein:5.1,carbs:26.0,fat:3.7,fibre:1.8});
  assert.deepEqual(byId.get('bisi_bele_bath').values,{kcal:70.8,protein:2.5,carbs:12.4,fat:2.2,fibre:8.7});
  assert.deepEqual(byId.get('ven_pongal').values,{kcal:184.6,protein:3.8,carbs:4.9,fat:18.1,fibre:0.6});
  assert.deepEqual(byId.get('puttu').values,{kcal:209.1,protein:4.4,carbs:33.1,fat:9.2,fibre:4.3});
});
test('only untouched pending food records may receive an upgrade', () => {
  assert.equal(canApplyResearchUpdate({isActive:true,nutritionStatus:'pending'}),true);
  assert.equal(canApplyResearchUpdate({isActive:true,nutritionStatus:'pending',values:null}),true);
  assert.equal(canApplyResearchUpdate({isActive:true,nutritionStatus:'pending',values:{kcal:1}}),false);
  assert.equal(canApplyResearchUpdate({isActive:true,nutritionStatus:'verified'}),false);
  assert.equal(canApplyResearchUpdate({isActive:true,nutritionStatus:'sample'}),false);
  assert.equal(canApplyResearchUpdate({isActive:false,nutritionStatus:'pending'}),false);
  assert.equal(canApplyResearchUpdate(null),false);
});
