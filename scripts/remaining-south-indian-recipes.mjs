/**
 * 15 remaining South Indian catalog entries, mapped to explicit published
 * PREPARED RECIPE variants. They are ILLUSTRATIVE estimates, not universal
 * nutrient values. Never treat a recipe's reported fibre as documented
 * TOTAL dietary fibre without measurement-method confirmation.
 *
 * Khaana values are displayed per 100g rounded to whole grams, calculated
 * from named recipe ingredient weights using USDA FoodData Central.
 * Anuvaad INDB entries are calculated recipe averages, also per 100g.
 * Healthify entries have a public food-profile basis; original ingredient
 * reference is not available, and that limitation is labeled.
 */
const recipe = (id, name, category, kcal, protein, carbs, fat, sourceUrl, sourceName, variant, notes, reportedFibreG) => ({
  id, name, category, isActive:true, cuisine:'South Indian', aliases:[],
  nutritionStatus:'sample', values:{kcal,protein,carbs,fat},
  ...(Number.isFinite(reportedFibreG) ? {reportedFibreG} : {}),
  subtitle:'Named recipe estimate · per 100g · total dietary fibre unconfirmed',
  nutritionSource: {
    title:sourceName, url:sourceUrl, basis:'100g of named prepared recipe',
    fibreMethod:'unknown', variant,
    energyMethod:'recipe-level estimate',
    notes,
  },
});
const khaana='Khaana recipe (USDA ingredient-based estimate)';
const indb='Indian Nutrient Databank (Anuvaad), calculated recipe';
const healthify='Healthify food database entry (underlying recipe unavailable)';
export const REMAINING_DISHES=[
  recipe('rava_dosa','Rava dosa (semolina dosa, INDB recipe)','Grain',227.05,7.30,32.84,7.12,
    'https://www.anuvaad.org.in/nutrition-fact/semolina-dosa-suji-rava-dosa/',indb,
    'Semolina (suji/rava) dosa','Source-specific prepared dosa; do not substitute for every rava dosa.',4.04),
  recipe('upma','Upma (Tamil Nadu rava recipe)','Grain',114,3,15,5,
    'https://khaana.com/recipes/upma.html',khaana,
    'Semolina upma with curry leaves, dal, cashew and oil','Rounded Khaana per-100g macros; cooking yield varies.',1),
  recipe('coconut_rice','Coconut rice / Thengai sadam (Tamil recipe)','Grain',405,6,51,20,
    'https://khaana.com/recipes/thengai-sadam.html',khaana,
    'Cooled rice with grated coconut, dals and coconut oil','Source labels serving as 90g; per-100g metrics may seem unusually dense. Do not assume all coconut rice shares these values.',3),
  recipe('ragi_mudde','Ragi mudde (Karnataka cooked balls)','Grain',82,2,16,1,
    'https://khaana.com/recipes/ragi-mudde.html',khaana,
    'Finger millet flour and water cooked into mudde','Source recipe uses only ragi flour, water and salt; fat/energy are rounded estimates.',1),
  recipe('tomato_pappu','Tomato pappu (Andhra toor dal recipe)','Protein',85,4,11,3,
    'https://khaana.com/recipes/tomato-pappu.html',khaana,
    'Cooked toor dal, tomato, garlic and tempering','Rounded per-100g recipe estimates, not a standard tomato dal.',3),
  recipe('palakura_pappu','Palakura pappu (Healthify recipe entry)','Protein',78.82,4.11,10.26,2.42,
    'https://www.healthifyme.com/web/nutrifacts/palakura-pappu-d2805ac874',healthify,
    'Palakura pappu (spinach dal)','Original recipe or ingredient reference unavailable in public source; lower-confidence illustrative estimate.',1.85),
  recipe('pesarapappu','Pesarapappu curry (Healthify recipe entry)','Protein',87.65,4.83,12.33,2.17,
    'https://www.healthifyme.com/web/nutrifacts/pesarapappu-curry-8def76815f',healthify,
    'Pesarapappu curry, per 150g serving converted to 100g','Original public profile lists 131.48kcal, 7.25g protein, 18.5g carbs, 3.26g fat per 150g. Converted /1.5; not identical to plain cooked moong dal.',1.95),
  recipe('bendakaya_fry','Bendakaya / Okra fry (INDB recipe)','Vegetable',110.81,1.83,4.5,9.27,
    'https://www.anuvaad.org.in/nutrition-fact/okra-ladys-fingers-fry-bhindi-sabzi-sabji-subji/',indb,
    'Ladyfinger/okra fry (bhindi sabzi)','Comparable okra-fry recipe, not necessarily Andhra-style seasoning.',3.57),
  recipe('beans_poriyal','Beans poriyal (Tamil recipe)','Vegetable',139,3,11,10,
    'https://khaana.com/recipes/beans-poriyal.html',khaana,
    'French beans steamed with coconut, dals and coconut oil','Rounded recipe estimates; coconut and dal quantities may differ.',4),
  recipe('cabbage_poriyal','Cabbage poriyal (Tamil recipe)','Vegetable',101,2,8,7,
    'https://khaana.com/recipes/cabbage-poriyal.html',khaana,
    'Shredded cabbage with grated coconut and split dals','Rounded cooked-recipe estimates.',3),
  recipe('egg_burji','Egg bhurji (onion-tomato recipe)','Protein',130,6,4,10,
    'https://khaana.com/recipes/egg-bhurji.html',khaana,
    'Egg bhurji cooked with onion, tomato and oil','Published recipe is Punjabi-style, not a unique South Indian seasoning; rename prevents false specificity.',1),
  recipe('chicken_curry','Chettinad chicken curry (Tamil recipe)','Protein',121,11,5,6,
    'https://khaana.com/recipes/chettinad-chicken-curry.html',khaana,
    'Chettinad chicken curry with sesame oil and spices','Bone-in recipe with cooked yield; not interchangeable with other chicken curry recipes.',2),
  recipe('fish_curry','Kerala meen curry (coconut milk recipe)','Protein',170,12,3,12,
    'https://khaana.com/recipes/meen-curry.html',khaana,
    'Kerala fish curry with coconut milk and kokum','Coconut-milk variant; other fish curries have different oil and coconut quantities.',0),
  recipe('vegetable_kootu','Bottle gourd kootu (Tamil recipe)','Vegetable',100,3,10,6,
    'https://khaana.com/recipes/kootu.html',khaana,
    'Bottle gourd, moong dal and coconut kootu','Specific bottle-gourd kootu, not all vegetable kootu.',3),
  recipe('pachadi','Gongura-style leafy pachadi (substitute recipe)','Vegetable',161,3,11,13,
    'https://khaana.com/recipes/gongura-pachadi.html',khaana,
    'Sour leafy chutney using amaranth substitute and tamarind','Khaana recipe explicitly substitutes amaranth for gongura. Not an authentic universal vegetable pachadi reference.',1),
];
export const mayUpgradePending = existing => !!existing && existing.isActive===true
  && existing.nutritionStatus==='pending'
  && (existing.values===undefined || existing.values===null);
