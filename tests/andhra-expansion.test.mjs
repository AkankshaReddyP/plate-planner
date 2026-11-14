import test from 'node:test';
import assert from 'node:assert/strict';
import { ANDHRA_EXPANSION, expansionCounts } from '../scripts/andhra-expansion-foods.mjs';
const expectedGroups=['Curry','Pappu','Chutney','Roti','Ragi','Millet','Quinoa','Tiffin'];
test('Andhra expansion is a nonduplicated, complete browse-only collection',()=>{
  assert.equal(ANDHRA_EXPANSION.length,59);
  assert.equal(new Set(ANDHRA_EXPANSION.map(f=>f.id)).size,ANDHRA_EXPANSION.length);
  for(const food of ANDHRA_EXPANSION){
    assert.ok(/^[a-z][a-z0-9_]*$/.test(food.id),food.id);
    assert.ok(food.name.length>4);
    assert.ok(expectedGroups.includes(food.foodGroup));
    assert.ok(['Grain','Vegetable','Protein','Dairy'].includes(food.category));
    assert.equal(food.nutritionStatus,'pending');
    assert.equal(food.isActive,true);
    assert.equal(Object.hasOwn(food,'values'),false,'do not fabricate macros: '+food.id);
    assert.equal(typeof food.cuisine,'string');
    assert.ok(Array.isArray(food.aliases));
  }
  assert.equal(expansionCounts.Curry,24);
  assert.equal(expansionCounts.Ragi,7);
  assert.equal(expansionCounts.Quinoa,6);
  assert.equal(expansionCounts.Roti,4);
});
test('quinoa is not inaccurately branded a historical Andhra specialty',()=>{
  for(const food of ANDHRA_EXPANSION.filter(f=>f.foodGroup==='Quinoa'))
    assert.notEqual(food.cuisine,'Andhra / Telangana');
});
test('representative Andhra dishes, roti and ragi options are searchable by Telugu aliases',()=>{
  const byId=new Map(ANDHRA_EXPANSION.map(f=>[f.id,f]));
  assert.ok(byId.get('gutti_vankaya_kura')?.aliases.includes('gutti vankaya'));
  assert.equal(byId.get('jonna_rotte')?.foodGroup,'Roti');
  assert.equal(byId.get('ragi_sangati')?.foodGroup,'Ragi');
  assert.equal(byId.get('quinoa_vegetable_upma')?.foodGroup,'Quinoa');
  assert.equal(byId.get('chepala_pulusu')?.foodGroup,'Curry');
});
