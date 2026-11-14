/**
 * USDA FoodData Central food-reference entries, transcribed per 100g edible
 * portion from the individually linked USDA/SR Legacy mirrors below.
 *
 * Do not substitute these for other cooking states, branded variants or Indian
 * dishes with added oil, salt, spices or water. All entries are 'sample'
 * reference values, NOT personalized or medically verified prescriptions.
 * Fibre is the USDA "Fiber, total dietary" nutrient, not crude fibre.
 *
 * Official source: https://fdc.nal.usda.gov/download-datasets/
 */
const food=(id,name,kcal,protein,carbs,fat,fibre,url,variant,fdcId=null)=>({
  id,name,isActive:true,
  subtitle:'USDA food reference · per 100g edible portion · actual product may vary',
  nutritionStatus:'sample',
  values:{kcal,protein,carbs,fat,fibre},
  nutritionSource:{
    title:'USDA FoodData Central reference composition (source record via linked nutrition page)',
    url,basis:'100g edible portion in the specified preparation state',
    fibreMethod:'total',variant,
    ...(fdcId?{fdcId}:{}),
  },
});
export const USDA_MATCHED_FOODS=[
  food('kabuli_chana_cooked','Kabuli chana (boiled chickpeas, no oil)',164,8.86,27.42,2.59,7.6,
    'https://www.mealyno.com/en/foods/chickpeas-cooked','Mature chickpeas, boiled without salt or oil',173757),
  food('rajma_cooked','Rajma (red kidney beans, boiled, no oil)',127,8.67,22.8,0.50,6.4,
    'https://batchbase.com.au/usda-foods/175194','Red kidney beans, mature seeds, boiled without salt',175194),
  food('green_peas_cooked','Green peas (boiled, drained)',84,5.36,15.6,0.22,5.5,
    'https://allthenutrients.com/compare/chickpeas-garbanzo-beans-bengal-gram-mature-seeds-cooked-boiled-without-salt/vs/peas-green-cooked-boiled-drained-without-salt/','Green peas boiled, drained without salt'),
  food('soybeans_cooked','Mature soybeans (boiled, without salt)',172,18.21,8.36,8.97,6.0,
    'https://www.mealyno.com/en/foods/lentils-cooked','Mature soybeans, cooked, boiled without salt',174271),
  food('tofu_firm','Firm tofu (raw, calcium-set)',144,17.27,2.78,8.72,2.3,
    'https://www.myfoodanalysis.com/food/firm-tofu-raw-172475','Tofu, raw, firm, prepared with calcium sulfate',172475),
  food('edamame_cooked','Edamame (frozen, prepared, shelled)',121,11.9,8.91,5.20,5.2,
    'https://allthenutrients.com/foods/edamame-frozen-prepared/','Edamame, frozen, prepared (without pods)'),
  food('quinoa_cooked','Quinoa (plain, boiled)',120,4.4,21.3,1.92,2.8,
    'https://batchbase.com.au/usda-foods/168917','Quinoa, cooked, plain without added oil',168917),
  food('almonds_raw','Almonds (raw, unflavoured)',579,21.1,21.5,49.9,12.5,
    'https://allthenutrients.com/foods/nuts-almonds/','Nuts, almonds, unflavoured',170567),
  food('pistachios_raw','Pistachios (raw, unsalted)',560,20.2,27.2,45.3,10.6,
    'https://allthenutrients.com/foods/nuts-pistachio-nuts-raw/','Nuts, pistachio nuts, raw'),
  food('pumpkin_seeds','Pumpkin seeds (dried kernels)',559,30.2,10.7,49.0,6.0,
    'https://allthenutrients.com/foods/seeds-pumpkin-and-squash-seed-kernels-dried/','Pumpkin/squash seed kernels, dried'),
  food('sunflower_seeds','Sunflower seeds (dried kernels)',584,20.8,20.0,51.5,8.6,
    'https://allthenutrients.com/foods/seeds-sunflower-seed-kernels-dried/','Sunflower seed kernels, dried'),
  food('sesame_seeds','Sesame seeds (whole, dried)',573,17.7,23.5,49.7,11.8,
    'https://allthenutrients.com/foods/seeds-sesame-seeds-whole-dried/','Sesame seeds, whole, dried'),
  food('chia_seeds','Chia seeds (dried)',486,16.5,42.1,30.7,34.4,
    'https://allthenutrients.com/foods/seeds-chia-seeds-dried/','Chia seeds, dried'),
  food('flax_seeds','Flaxseeds (whole)',534,18.3,28.9,42.2,27.3,
    'https://allthenutrients.com/foods/seeds-flaxseed/','Flaxseed, whole dry'),
  food('hemp_seeds','Hemp hearts (hulled seeds)',553,31.6,8.67,48.8,4.0,
    'https://allthenutrients.com/foods/seeds-hemp-seed-hulled/','Hemp seed, hulled'),
  food('greek_yogurt_plain','Greek yogurt (plain, nonfat)',59,10.2,3.60,0.39,0,
    'https://allthenutrients.com/foods/yogurt-greek-plain-nonfat-includes-foods-for-usda-s-food-distribution-program/','Greek yogurt, plain, nonfat (not sweetened)'),
  food('cottage_cheese','Cottage cheese (2% milkfat)',81,10.4,4.76,2.27,0,
    'https://batchbase.com.au/usda-foods/172182','Cheese, cottage, lowfat, 2% milkfat',172182),
  food('chicken_breast_grilled','Chicken breast (skinless, grilled, meat only)',151,30.54,0,3.17,0,
    'https://whatyoueat.io/foods/171534','Chicken breast, skinless boneless meat only, grilled',171534),
  food('fish_salmon_cooked','Atlantic salmon (farmed, cooked dry heat)',206,22.1,0,12.4,0,
    'https://allthenutrients.com/foods/fish-salmon-atlantic-farmed-cooked-dry-heat/','Fish, salmon, Atlantic, farmed, cooked, dry heat'),
  food('turkey_breast_cooked','Turkey breast (whole, meat only, roasted)',147,30.1,0,2.08,0,
    'https://batchbase.com.au/usda-foods/171496','Turkey, whole, breast, meat only, cooked roasted',171496),
  food('fish_tilapia_cooked','Tilapia (cooked, dry heat)',128,26.1,0,2.65,0,
    'https://allthenutrients.com/foods/fish-tilapia-cooked-dry-heat/','Fish, tilapia, cooked, dry heat'),
  food('crab_cooked','Alaska king crab (cooked, moist heat)',97,19.4,0,1.54,0,
    'https://allthenutrients.com/compare/fish-tilapia-cooked-dry-heat/vs/crustaceans-crab-alaska-king-cooked-moist-heat/','Alaska king crab, cooked, moist heat'),
];
export function canEnrichPending(existing){
  return !!existing && existing.isActive===true
    && existing.nutritionStatus==='pending'
    && (existing.values===undefined || existing.values===null);
}
