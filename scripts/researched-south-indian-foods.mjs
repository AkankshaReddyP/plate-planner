/**
 * Values transcribed from Anitha et al. (2024), Table 4, mean per 100g of
 * the cooked research recipe. All five measured values refer to the same
 * preparation. In this study "Fibre" is CRUDE fibre (not total dietary fibre).
 *
 * IMPORTANT: nutritionStatus 'sample' means research-recipe-specific numbers,
 * NOT a universal verified figure for homemade or restaurant preparations.
 * Publication: Frontiers in Sustainable Food Systems 8:1331260
 * https://doi.org/10.3389/fsufs.2024.1331260
 */
export const RESEARCH_SOURCE = {
  title: 'Anitha et al. (2024), Frontiers in Sustainable Food Systems, Table 4',
  url: 'https://doi.org/10.3389/fsufs.2024.1331260',
  studyRecipe: 'Laboratory prepared cooked recipe; quantities vary with ingredients and water absorption.',
  basis: '100g cooked food',
  fibreMethod: 'crude',
  energyMethod: 'laboratory',
};
const recipe = (id, name, kcal, protein, carbs, fat, fibre, detail) => ({
  id, name, category:'Grain', cuisine:'South Indian', isActive:true,
  aliases: [], nutritionStatus:'sample',
  subtitle:'Research recipe · per 100g cooked · fibre is crude',
  values:{kcal,protein,carbs,fat,fibre},
  nutritionSource:{...RESEARCH_SOURCE, variant:detail},
});
export const RESEARCHED_DISHES = [
  recipe('idli','Idli (white rice reference)',122.3,4.8,23.2,2.9,0.3,'Polished white rice idli'),
  recipe('plain_dosa','Plain dosa (white rice reference)',140.3,5.1,26.0,3.7,1.8,'Polished white rice dosa'),
  recipe('bisi_bele_bath','Bisi bele bath (white rice reference)',70.8,2.5,12.4,2.2,8.7,'Polished white rice bisi belle bath'),
  recipe('ven_pongal','Pongal (white rice reference)',184.6,3.8,4.9,18.1,0.6,'Polished white rice pongal'),
  recipe('puttu','Puttu (white rice reference)',209.1,4.4,33.1,9.2,4.3,'Polished white rice puttu'),
  recipe('ragi_idli','Ragi idli (research recipe)',90.0,4.5,20.2,0.4,1.9,'Finger millet idli'),
  recipe('ragi_dosa','Ragi dosa (research recipe)',160.2,4.1,31.4,4.2,0.3,'Finger millet dosa'),
  recipe('foxtail_idli','Foxtail millet idli (research recipe)',92.5,4.5,20.4,0.6,0.7,'Foxtail millet idli'),
  recipe('foxtail_dosa','Foxtail millet dosa (research recipe)',136.1,6.1,26.1,2.8,1.9,'Foxtail millet dosa'),
  recipe('little_millet_idli','Little millet idli (research recipe)',108.1,4.9,24.5,0.6,0.3,'Little millet idli'),
  recipe('little_millet_dosa','Little millet dosa (research recipe)',125.1,5.4,26.3,1.6,1.3,'Little millet dosa'),
  recipe('browntop_bisi_bele_bath','Browntop millet bisi bele bath (research recipe)',84.2,4.4,12.2,3.1,11.1,'Browntop millet bisi belle bath'),
];
export const canApplyResearchUpdate = existing => !!existing
  && existing.isActive === true
  && existing.nutritionStatus === 'pending'
  && (existing.values === undefined || existing.values === null);
