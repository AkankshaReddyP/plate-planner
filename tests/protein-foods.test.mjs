import test from 'node:test';
import assert from 'node:assert/strict';
import { PROTEIN_FOODS, PROTEIN_GROUPS, proteinCounts } from '../scripts/protein-foods.mjs';

test('74 unique protein-containing food references, including chana variants',()=>{
  assert.equal(PROTEIN_FOODS.length,74);
  assert.equal(new Set(PROTEIN_FOODS.map(f=>f.id)).size,74);
  const ids=new Set(PROTEIN_FOODS.map(f=>f.id));
  for(const id of [
    'kabuli_chana_cooked','kala_chana_cooked','kala_chana_sprouted','chana_masala',
    'chana_dal_cooked','rajma_cooked','green_moong_sprouts',
    'soy_chunks_rehydrated','tofu_firm','paneer_plain','greek_yogurt_plain',
    'egg_whites_boiled','chicken_breast_grilled','fish_rohu_cooked','prawns_cooked',
    'peanuts_roasted','pumpkin_seeds',
  ])assert.ok(ids.has(id),id);
});

test('every new item remains browse-only until its preparation-specific nutrition is reviewed',()=>{
  for(const food of PROTEIN_FOODS){
    assert.match(food.id,/^[a-z][a-z0-9_]*$/);
    assert.ok(food.name.length>=5);
    assert.ok(PROTEIN_GROUPS.includes(food.foodGroup));
    assert.ok(['Protein','Dairy'].includes(food.category));
    assert.equal(food.nutritionStatus,'pending');
    assert.equal(food.isActive,true);
    assert.equal(Object.hasOwn(food,'values'),false,'must not fabricate nutrition for '+food.id);
    assert.ok(food.preparationState.length>2);
    assert.ok(Array.isArray(food.aliases));
  }
});
test('distinguishes boiled, sprouted, dried/rehydrated and curry preparations',()=>{
  const lookup=new Map(PROTEIN_FOODS.map(food=>[food.id,food]));
  assert.equal(lookup.get('kala_chana_cooked').preparationState,'boiled');
  assert.equal(lookup.get('kala_chana_sprouted').preparationState,'sprouted');
  assert.equal(lookup.get('soy_chunks_rehydrated').preparationState,'rehydrated');
  assert.equal(lookup.get('chana_masala').preparationState,'curry');
  assert.equal(lookup.get('kala_chana_cooked').category,'Protein');
  assert.equal(lookup.get('paneer_plain').category,'Dairy');
});
test('protein group counts are stable',()=>{
  assert.deepEqual(proteinCounts,{
    Legumes:26,Soy:7,'Dairy protein':7,Eggs:5,Meat:9,Seafood:10,'Nuts & seeds':10,
  });
});
