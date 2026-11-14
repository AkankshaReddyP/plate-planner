/**
 * Idempotent, privileged seed for /foodCatalog.
 * Run only via trusted GitHub deployment service account (never in browser).
 * Existing documents are never overwritten.
 * Unreviewed South Indian names remain pending. A limited set of recipe-specific
 * research measurements is added with attribution; never guess missing data.
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { stdout } from 'node:process';
import { RESEARCHED_DISHES, canApplyResearchUpdate, canMigrateLegacyCrude } from './researched-south-indian-foods.mjs';
import { INDB_RECIPES, canApplyINDBUpdate } from './indb-south-indian-recipes.mjs';
import { REMAINING_DISHES, mayUpgradePending } from './remaining-south-indian-recipes.mjs';
import { ANDHRA_EXPANSION, expansionCounts } from './andhra-expansion-foods.mjs';
import { PROTEIN_FOODS, proteinCounts } from './protein-foods.mjs';
import { USDA_MATCHED_FOODS, canEnrichPending } from './usda-matched-foods.mjs';
import { NAMED_PREPARED_RECIPES, canEnrichNamedRecipe } from './named-prepared-recipes.mjs';

initializeApp({ credential: applicationDefault(), projectId: 'plate-planner-2bc28' });
const db = getFirestore();

const initialSamples = [
  ['rice','Cooked white rice','Grain',{kcal:130,protein:2.7,carbs:28.2,fibre:0.4,fat:0.3}],
  ['roti','Whole-wheat roti','Grain',{kcal:297,protein:9.6,carbs:46.4,fibre:7.1,fat:8.1}],
  ['dal','Cooked toor dal','Protein',{kcal:116,protein:7.2,carbs:20.3,fibre:5.8,fat:0.4}],
  ['egg','Boiled egg','Protein',{kcal:155,protein:12.6,carbs:1.1,fibre:0,fat:10.6}],
  ['chicken','Cooked chicken breast','Protein',{kcal:165,protein:31,carbs:0,fibre:0,fat:3.6}],
  ['curd','Plain curd','Dairy',{kcal:61,protein:3.5,carbs:4.7,fibre:0,fat:3.3}],
  ['spinach','Cooked spinach','Vegetable',{kcal:23,protein:3,carbs:3.8,fibre:2.4,fat:0.3}],
  ['carrot','Raw carrot','Vegetable',{kcal:41,protein:0.9,carbs:9.6,fibre:2.8,fat:0.2}],
  ['banana','Banana','Fruit',{kcal:89,protein:1.1,carbs:22.8,fibre:2.6,fat:0.3}],
  ['apple','Apple','Fruit',{kcal:52,protein:0.3,carbs:13.8,fibre:2.4,fat:0.2}],
];
const southIndian = [
  ['idli','Idli','Grain','idly'],
  ['plain_dosa','Plain dosa','Grain','dosai'],
  ['masala_dosa','Masala dosa','Grain',''],
  ['rava_dosa','Rava dosa','Grain',''],
  ['pesarattu','Pesarattu','Protein','pesaratu,green gram dosa'],
  ['uttapam','Uttapam','Grain','uthappam'],
  ['upma','Upma','Grain','uppuma'],
  ['rava_upma','Rava upma','Grain',''],
  ['ven_pongal','Ven pongal','Grain','khara pongal'],
  ['pulihora','Pulihora','Grain','tamarind rice,puliyogare'],
  ['lemon_rice','Lemon rice','Grain','chitranna'],
  ['coconut_rice','Coconut rice','Grain',''],
  ['curd_rice','Curd rice','Grain','thayir sadam'],
  ['bisi_bele_bath','Bisi bele bath','Grain',''],
  ['ragi_mudde','Ragi mudde','Grain','finger millet ball'],
  ['sambar','Sambar','Protein','sambhar'],
  ['rasam','Rasam','Vegetable','charu'],
  ['tomato_pappu','Tomato pappu','Protein','tomato dal'],
  ['palakura_pappu','Palakura pappu','Protein','spinach dal'],
  ['pesarapappu','Pesarapappu','Protein','moong dal'],
  ['coconut_chutney','Coconut chutney','Vegetable',''],
  ['tomato_chutney','Tomato chutney','Vegetable',''],
  ['peanut_chutney','Peanut chutney','Protein','groundnut chutney'],
  ['bendakaya_fry','Bendakaya fry','Vegetable','okra fry,bhindi'],
  ['beans_poriyal','Beans poriyal','Vegetable','beans stir fry'],
  ['cabbage_poriyal','Cabbage poriyal','Vegetable',''],
  ['avial','Avial','Vegetable','aviyal'],
  ['medu_vada','Medu vada','Protein','garelu'],
  ['appam','Appam','Grain',''],
  ['puttu','Puttu','Grain',''],
  ['egg_burji','Egg burji','Protein','egg bhurji'],
  ['chicken_curry','South Indian chicken curry','Protein',''],
  ['fish_curry','South Indian fish curry','Protein',''],
  ['vegetable_kootu','Vegetable kootu','Vegetable',''],
  ['pachadi','Vegetable pachadi','Vegetable',''],
];
// A dish's "category" is its initial browsing step, not a claim that it only
// contains that nutrient. Multi-ingredient dishes must be reviewed per recipe.
const docs = [
  ...initialSamples.map(([id,name,category,values]) => ({
    id, data: { isActive:true, name, category, values, cuisine:'Everyday', aliases: [],
      subtitle:'Illustrative per-100g data; not clinically verified', nutritionStatus:'sample' },
  })),
  ...southIndian.map(([id,name,category,aliases]) => ({
    id, data: {isActive:true, name, category, cuisine:'South Indian',
      aliases: aliases ? aliases.split(',') : [],
      subtitle:'Recipe-dependent · nutrition not verified',
      nutritionStatus:'pending'},
  })),
];
let created=0,existing=0;
for (const {id,data} of docs) {
  try {
    await db.collection('foodCatalog').doc(id).create(data);
    created++;
  } catch (error) {
    if (error?.code === 6 || error?.code === 'already-exists') existing++;
    else throw error;
  }
}
stdout.write(`Food catalog seed: ${created} created; ${existing} previously existing; ${docs.length} total seed entries. Pending dishes have no numeric nutrient values.\n`);

let researchCreated=0, researchUpgraded=0, researchMigrated=0, researchPreserved=0;
for (const research of RESEARCHED_DISHES) {
  const ref = db.collection('foodCatalog').doc(research.id);
  const result = await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      tx.create(ref, research);
      return 'created';
    }
    if (canApplyResearchUpdate(snap.data())) {
      tx.update(ref, {
        name: research.name, subtitle: research.subtitle,
        values: research.values, crudeFibreG: research.crudeFibreG,
        nutritionStatus: research.nutritionStatus,
        nutritionSource: research.nutritionSource,
      });
      return 'upgraded';
    }
    if (canMigrateLegacyCrude(snap.data(), research)) {
      tx.update(ref, { values: research.values, crudeFibreG: research.crudeFibreG });
      return 'migrated';
    }
    return 'preserved';
  });
  if (result === 'created') researchCreated++;
  if (result === 'upgraded') researchUpgraded++;
  if (result === 'migrated') researchMigrated++;
  if (result === 'preserved') researchPreserved++;
}
stdout.write(`Research recipes: ${researchCreated} new, ${researchUpgraded} pending records upgraded, ${researchMigrated} matching legacy crude records migrated, ${researchPreserved} existing reviewed/edited records preserved.\n`);

let indbCreated=0, indbUpgraded=0, indbPreserved=0;
for(const record of INDB_RECIPES){
  const ref=db.collection('foodCatalog').doc(record.id);
  const result=await db.runTransaction(async transaction=>{
    const snap=await transaction.get(ref);
    if(!snap.exists){transaction.create(ref,record);return 'created';}
    if(canApplyINDBUpdate(snap.data())){
      transaction.update(ref,{
        name:record.name,subtitle:record.subtitle,
        values:record.values,reportedFibreG:record.reportedFibreG,
        nutritionStatus:record.nutritionStatus,nutritionSource:record.nutritionSource,
      });
      return 'upgraded';
    }
    return 'preserved';
  });
  if(result==='created') indbCreated++;
  else if(result==='upgraded') indbUpgraded++;
  else indbPreserved++;
}
stdout.write(`INDB recipe batch: ${indbCreated} created, ${indbUpgraded} pending upgraded, ${indbPreserved} existing entries unchanged. Reported fibre is NOT treated as verified total dietary fibre.\n`);

let remainingCreated=0,remainingUpgraded=0,remainingPreserved=0;
for(const dish of REMAINING_DISHES){
  const ref=db.collection('foodCatalog').doc(dish.id);
  const result=await db.runTransaction(async tx=>{
    const existing=await tx.get(ref);
    if(!existing.exists){tx.create(ref,dish);return 'created';}
    if(mayUpgradePending(existing.data())){
      tx.update(ref,{
        name:dish.name,subtitle:dish.subtitle,values:dish.values,
        nutritionStatus:dish.nutritionStatus,nutritionSource:dish.nutritionSource,
        ...(dish.reportedFibreG!==undefined?{reportedFibreG:dish.reportedFibreG}:{}),
      });
      return 'upgraded';
    }
    return 'preserved';
  });
  if(result==='created')remainingCreated++;
  else if(result==='upgraded')remainingUpgraded++;
  else remainingPreserved++;
}
stdout.write(`Final 15 recipe entries: ${remainingCreated} created, ${remainingUpgraded} pending upgraded, ${remainingPreserved} existing reviewed/edited preserved. Source-specific macro estimates only; total dietary fibre remains unverified.\n`);

let andhraCreated=0,andhraExisting=0;
for(const food of ANDHRA_EXPANSION){
  const ref=db.collection('foodCatalog').doc(food.id);
  try {
    await ref.create(food);
    andhraCreated++;
  } catch(error) {
    if(error?.code===6 || error?.code==='already-exists') andhraExisting++;
    else throw error;
  }
}
stdout.write(`Andhra/regional expansion: ${andhraCreated} new; ${andhraExisting} existing retained; ${ANDHRA_EXPANSION.length} seed dishes. Categories: ${JSON.stringify(expansionCounts)}. All new dishes nutrition-pending.\n`);

let proteinsCreated=0,proteinsExisting=0;
for(const food of PROTEIN_FOODS){
  const ref=db.collection('foodCatalog').doc(food.id);
  try{
    await ref.create(food);
    proteinsCreated++;
  }catch(error){
    if(error?.code===6 || error?.code==='already-exists') proteinsExisting++;
    else throw error;
  }
}
stdout.write(`Protein collection: ${proteinsCreated} new, ${proteinsExisting} previously present, ${PROTEIN_FOODS.length} source-pending reference foods. Types: ${JSON.stringify(proteinCounts)}.\n`);

let matchedUpgraded=0,matchedPreserved=0,matchedMissing=0;
for(const research of USDA_MATCHED_FOODS){
  const ref=db.collection('foodCatalog').doc(research.id);
  const result=await db.runTransaction(async tx=>{
    const snap=await tx.get(ref);
    if(!snap.exists) return 'missing';
    if(!canEnrichPending(snap.data())) return 'preserved';
    tx.update(ref,{
      name:research.name,subtitle:research.subtitle,
      values:research.values,nutritionStatus:research.nutritionStatus,
      nutritionSource:research.nutritionSource,
    });
    return 'upgraded';
  });
  if(result==='upgraded')matchedUpgraded++;
  else if(result==='missing')matchedMissing++;
  else matchedPreserved++;
}
stdout.write(`USDA exact matches: ${matchedUpgraded} pending foods upgraded, ${matchedPreserved} preexisting completed/customized preserved, ${matchedMissing} missing canonical records (not invented).\n`);

let namedUpgraded=0,namedPreserved=0,namedMissing=0;
for(const food of NAMED_PREPARED_RECIPES){
  const ref=db.collection('foodCatalog').doc(food.id);
  const result=await db.runTransaction(async tx=>{
    const snap=await tx.get(ref);
    if(!snap.exists) return 'missing';
    if(!canEnrichNamedRecipe(snap.data())) return 'preserved';
    tx.update(ref,{
      name:food.name,subtitle:food.subtitle,
      values:food.values,reportedFibreG:food.reportedFibreG,
      nutritionStatus:food.nutritionStatus,
      nutritionSource:food.nutritionSource,
    });
    return 'upgraded';
  });
  if(result==='upgraded')namedUpgraded++;
  else if(result==='missing')namedMissing++;
  else namedPreserved++;
}
stdout.write(`Named cooked recipes: ${namedUpgraded} pending records upgraded; ${namedPreserved} previously reviewed/customized preserved; ${namedMissing} missing IDs. Source fibre method remains unverified.\n`);
