/**
 * Idempotent, privileged seed for /foodCatalog.
 * Run only via trusted GitHub deployment service account (never in browser).
 * Existing documents are never overwritten.
 * South Indian recipes deliberately have NO nutrient values until a verified
 * recipe/serving and source are attached. Do not guess food macros for health use.
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { stdout } from 'node:process';

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
