/**
 * INDB (Indian Nutrient Databank) prepared recipe ESTIMATES, per 100g.
 * Source: Anuvaad Solutions INDB, methodology https://www.anuvaad.org.in/methodology/
 * Authoritative individual recipe pages are recorded per entry.
 *
 * IMPORTANT: The source reports "Fibre" without confirming that every
 * constituent is assayed as TOTAL dietary fibre. Store its reported value in
 * reportedFibreG; do not present it as comparable total dietary fibre.
 * Numerical values are a single documented recipe, not typical food-label
 * or disease-specific prescriptions.
 */
const base='https://www.anuvaad.org.in/nutrition-fact/';
const recipe=(id,name,category,kcal,protein,carbs,fat,reportedFibreG,slug) => ({
  id, isActive:true, name, category, cuisine:'South Indian', aliases:[],
  nutritionStatus:'sample',
  subtitle:'INDB recipe estimate · per 100g · dietary fibre pending method review',
  values:{kcal,protein,carbs,fat},
  reportedFibreG,
  nutritionSource:{
    title:'Indian Nutrient Databank (Anuvaad Solutions), calculated recipe',
    url:base+slug+'/',
    basis:'per 100g of named prepared recipe',
    fibreMethod:'unknown',
    variant:name,
    energyMethod:'ingredient composition estimate',
    methodologyUrl:'https://www.anuvaad.org.in/methodology/',
  },
});
export const INDB_RECIPES=[
  recipe('sambar','Sambar (INDB recipe)','Protein',96.92,3.35,10.57,4.38,3.52,'sambar'),
  recipe('rasam','Rasam with tamarind (INDB recipe)','Vegetable',26.74,1.13,3.37,0.88,1.60,'rasam-with-tamarind-puli-rasam-chintapandu-rasam-charu-saaru'),
  recipe('pesarattu','Moong bean dosa / Pesarattu (INDB recipe)','Protein',285.96,12.32,31.91,11.67,6.04,'moong-bean-dosa-pesarattu'),
  recipe('rava_upma','Semolina / Rava upma (INDB recipe)','Grain',147.89,3.30,16.31,7.49,3.24,'semolina-upma-suji-rava-upma'),
  recipe('coconut_chutney','Coconut chutney (INDB recipe)','Vegetable',265.92,3.59,8.29,25.00,6.73,'coconut-chutney-nariyal-ki-chutney'),
  recipe('tomato_chutney','Tomato chutney (INDB recipe)','Vegetable',176.07,0.97,31.85,6.01,1.49,'tomato-chutney-tamatar-ki-chutney'),
  recipe('medu_vada','Medu vada / Garelu (INDB recipe)','Protein',745.50,4.39,9.70,76.32,2.27,'plain-urad-dal-vada-uzunne-vada-minapa-garelu-ulundu-vadai-medu-vada'),
  recipe('appam','Appam (INDB recipe)','Grain',267.70,3.12,13.28,22.63,6.19,'appam'),
  recipe('curd_rice','Curd rice / Perugu annam (INDB recipe)','Grain',195.74,5.75,32.93,4.32,2.13,'curd-rice-dahi-bhaat-dahi-chawal-perugu-annam-daddojanam-thayir-saadam'),
  recipe('lemon_rice','Lemon rice / Chitranna (INDB recipe)','Grain',176.30,4.26,21.62,7.88,2.52,'lemon-rice-pulihora-elumichai-sadam-chitranna'),
  recipe('sprouts_upma','Sprouts upma (INDB recipe)','Grain',316.25,9.50,44.96,10.44,7.16,'sprouts-upma'),
  recipe('masala_dosa','Masala dosa (INDB recipe)','Grain',164.58,3.29,19.57,7.84,2.52,'masala-dosa'),
  recipe('avial','Avial (INDB recipe)','Vegetable',124.56,2.46,8.47,8.94,5.44,'avial'),
  recipe('peanut_chutney','Peanut chutney (INDB recipe)','Protein',258.37,11.80,9.87,19.06,5.73,'peanut-chutney-mungfali-ki-chutney'),
  recipe('pulihora','Tamarind rice / Pulihora (INDB recipe)','Grain',373.04,7.45,65.08,8.53,5.12,'tamarind-rice-chintapandu-pulihora-puliyodharai-puli-sadam-huli-anna'),
  recipe('uttapam','Onion tomato uttapam (INDB recipe)','Grain',462.02,1.91,11.32,45.30,1.26,'onion-tomato-uttapam'),
];
export const canApplyINDBUpdate=(existing)=>!!existing&&existing.isActive===true
  && existing.nutritionStatus==='pending'
  && (existing.values===undefined||existing.values===null);
