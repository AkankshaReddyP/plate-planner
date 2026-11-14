/**
 * Named-recipe examples, from explicitly linked pages with ingredient recipes.
 * These are estimates for particular preparations, not universally standard
 * Andhra foods. Fibre reported by sources has unconfirmed analytical method,
 * so it is not used to satisfy total-dietary-fibre targets.
 */
const record=(id,name,kcal,protein,carbs,fat,reportedFibreG,url,variant,source)=>({
  id,name,isActive:true,nutritionStatus:'sample',
  subtitle:'Specific cooked-recipe estimate per 100g · dietary fibre method unconfirmed',
  values:{kcal,protein,carbs,fat},
  reportedFibreG,
  nutritionSource:{
    title:source,url,basis:'100g of named cooked prepared recipe',
    fibreMethod:'unknown',variant,
    energyMethod:'recipe ingredient calculation',
  },
});
const khaana='Khaana Indian regional recipe, ingredient-based USDA estimate';
const indb='Indian Nutrient Databank (INDB), Anuvaad Solutions prepared recipe';
export const NAMED_PREPARED_RECIPES=[
  record('gutti_vankaya_kura','Gutti vankaya kura (peanut-sesame stuffed brinjal)',153,3,10,12,4,
    'https://khaana.com/recipes/gutti-vankaya-kura.html',
    'Andhra small eggplants stuffed with peanut, sesame, coconut masala, cooked in tamarind gravy',khaana),
  record('dosakaya_pappu','Dosakaya pappu (yellow cucumber and toor dal)',73,3,11,2,2,
    'https://khaana.com/recipes/dosakaya-pappu.html',
    'Yellow dosakaya cucumber, toor dal, tomato and tamarind; 402g cooked serving',khaana),
  record('ragi_sangati','Ragi sangati (cooked millet and rice ball)',81,2,16,1,0,
    'https://khaana.com/recipes/ragi-sangati.html',
    'Ragi flour and rice, cooked with water, 348g serving; source-reported fibre rounds to 0g/100g',khaana),
  record('chapati','Chapati/Roti (INDB prepared recipe)',202.31,5.88,35.65,3.56,6.31,
    'https://www.anuvaad.org.in/nutrition-fact/chapati-roti/',
    'INDB chapati/roti prepared recipe, approximately 36g published reference serving',indb),
];
export const canEnrichNamedRecipe=existing=>!!existing && existing.isActive===true
  && existing.nutritionStatus==='pending'
  && (existing.values===undefined||existing.values===null);
