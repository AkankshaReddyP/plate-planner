/**
 * Browse-only catalog of protein-containing foods with Indian/Telugu aliases.
 * Source values are not inferred from food names: items are nutrition-pending.
 * Prepared, dry and sprouted legumes must remain separate records because
 * per-100g nutrients change substantially with water, sprouting and oil.
 *
 * 'Protein' is a browsing category, not a claim the item contains only
 * protein, is low carb, or suits every medical condition.
 */
const food=(id,name,foodGroup,aliases=[],category='Protein',state='prepared')=>({
 id,name,isActive:true,category,foodGroup,
 cuisine:'Indian / everyday',aliases,preparationState:state,
 nutritionStatus:'pending',subtitle:'Protein-containing food · nutrition per serving pending review',
});
export const PROTEIN_FOODS=[
 // Pulses, beans, chana, whole legumes
 food('kabuli_chana_cooked','Kabuli chana (boiled chickpeas)','Legumes',['white chana','chole','garbanzo beans','sanagalu'],'Protein','boiled'),
 food('kala_chana_cooked','Kala chana (boiled black chickpeas)','Legumes',['black chana','desi chana','nalla sanagalu'],'Protein','boiled'),
 food('kala_chana_sprouted','Sprouted kala chana','Legumes',['sprouted black chickpeas','molakettina senagalu'],'Protein','sprouted'),
 food('chana_masala','Chana masala (chole curry)','Legumes',['chole masala','chickpea curry'],'Protein','curry'),
 food('chana_sundal','Chana sundal (tempered chickpeas)','Legumes',['senagala sundal','kondakadalai sundal'],'Protein','tempered'),
 food('chana_dal_cooked','Cooked chana dal (split Bengal gram)','Legumes',['senaga pappu','split chickpeas'],'Protein','boiled'),
 food('chana_dal_curry','Chana dal curry','Legumes',['senaga pappu kura'],'Protein','curry'),
 food('toor_dal_cooked','Cooked toor dal (pigeon pea)','Legumes',['kandi pappu','arhar dal'],'Protein','boiled'),
 food('moong_dal_cooked','Cooked yellow moong dal','Legumes',['pesara pappu','split green gram'],'Protein','boiled'),
 food('whole_green_moong_cooked','Boiled green moong (whole)','Legumes',['pesalu','green gram'],'Protein','boiled'),
 food('green_moong_sprouts','Green moong sprouts','Legumes',['pesara molakalu','sprouted green gram'],'Protein','sprouted'),
 food('moong_sprouts_curry','Moong sprouts curry','Legumes',['molakala kura','sprouted green gram curry'],'Protein','curry'),
 food('urad_dal_cooked','Cooked urad dal','Legumes',['minapa pappu','black gram dal'],'Protein','boiled'),
 food('whole_urad_cooked','Whole black gram (boiled)','Legumes',['whole minumulu','whole urad'],'Protein','boiled'),
 food('masoor_dal_cooked','Cooked masoor dal','Legumes',['erra pappu','red lentils'],'Protein','boiled'),
 food('rajma_cooked','Boiled rajma (kidney beans)','Legumes',['kidney beans','rajma beans'],'Protein','boiled'),
 food('rajma_curry','Rajma masala (kidney bean curry)','Legumes',['rajma curry'],'Protein','curry'),
 food('lobia_cooked','Boiled lobia (black-eyed peas)','Legumes',['alasandalu','black eyed beans','cowpeas'],'Protein','boiled'),
 food('alasanda_kura','Alasanda kura (cowpea curry)','Legumes',['alasandala kura','black-eyed pea curry'],'Protein','curry'),
 food('horsegram_cooked','Boiled horse gram','Legumes',['ulavalu','kulthi'],'Protein','boiled'),
 food('moth_bean_cooked','Cooked moth beans','Legumes',['matki','moth dal'],'Protein','boiled'),
 food('double_beans_cooked','Boiled double beans','Legumes',['lima beans','butter beans'],'Protein','boiled'),
 food('field_beans_cooked','Boiled field beans','Legumes',['anapakaya ginjalu','avarekalu'],'Protein','boiled'),
 food('green_peas_cooked','Cooked green peas','Legumes',['batani','matar'],'Protein','boiled'),
 food('batani_kura','Batani kura (green peas curry)','Legumes',['peas curry','matar curry'],'Protein','curry'),
 food('mixed_dal_cooked','Mixed lentil dal','Legumes',['mixed pappu','panchmel dal'],'Protein','curry'),
 // Soy, tofu and textured proteins
 food('soy_chunks_rehydrated','Soya chunks (rehydrated, cooked)','Soy',['meal maker','soya nuggets','soy chunks'],'Protein','rehydrated'),
 food('soya_chunks_curry','Soya chunks curry','Soy',['meal maker curry','soya kura'],'Protein','curry'),
 food('tofu_firm','Firm tofu','Soy',['soy paneer','bean curd'],'Protein','ready-to-eat'),
 food('tofu_bhurji','Tofu bhurji','Soy',['tofu scramble'],'Protein','cooked'),
 food('tempeh_plain','Tempeh (plain)','Soy',['fermented soy cakes'],'Protein','ready-to-eat'),
 food('edamame_cooked','Cooked edamame (shelled)','Soy',['young soybeans'],'Protein','boiled'),
 food('soybeans_cooked','Boiled mature soybeans','Soy',['cooked soya beans'],'Protein','boiled'),
 // Milk foods (also protein sources)
 food('paneer_plain','Paneer (plain)','Dairy protein',['cottage cheese','panir'],'Dairy','ready-to-eat'),
 food('paneer_bhurji','Paneer bhurji','Dairy protein',['scrambled paneer'],'Dairy','cooked'),
 food('paneer_curry','Paneer curry','Dairy protein',['paneer masala'],'Dairy','curry'),
 food('greek_yogurt_plain','Plain Greek yogurt','Dairy protein',['strained yogurt','high protein yogurt'],'Dairy','ready-to-eat'),
 food('hung_curd_plain','Hung curd (plain)','Dairy protein',['strained curd','thick dahi'],'Dairy','ready-to-eat'),
 food('cottage_cheese','Cottage cheese (plain)','Dairy protein',['fresh cheese curds'],'Dairy','ready-to-eat'),
 food('milk_toned','Toned milk','Dairy protein',['low fat milk'],'Dairy','ready-to-drink'),
 // Eggs
 food('egg_whites_boiled','Boiled egg whites','Eggs',['egg white','albumen'],'Protein','boiled'),
 food('egg_omelette','Egg omelette','Eggs',['omelet','guddu omelette'],'Protein','cooked'),
 food('egg_scramble','Scrambled eggs','Eggs',['scrambled egg'],'Protein','cooked'),
 food('egg_curry_tomato','Egg curry (tomato gravy)','Eggs',['guddu kura','egg masala'],'Protein','curry'),
 food('egg_half_fry','Egg half fry','Eggs',['fried egg','sunny side up'],'Protein','fried'),
 // Poultry and meat
 food('chicken_breast_grilled','Chicken breast (grilled)','Meat',['boneless chicken breast'],'Protein','grilled'),
 food('chicken_thigh_cooked','Chicken thigh (cooked)','Meat',['chicken dark meat'],'Protein','cooked'),
 food('chicken_65','Chicken 65','Meat',['chicken sixty five'],'Protein','fried'),
 food('chicken_roast','Andhra chicken roast','Meat',['kodi vepudu','chicken fry'],'Protein','roasted'),
 food('turkey_breast_cooked','Turkey breast (cooked)','Meat',['turkey lean meat'],'Protein','cooked'),
 food('mutton_curry_andhra','Andhra mutton curry','Meat',['mamsam kura','goat curry'],'Protein','curry'),
 food('goat_meat_cooked','Goat meat (cooked)','Meat',['mutton goat meat'],'Protein','cooked'),
 food('lamb_cooked','Lamb (cooked)','Meat',['sheep meat'],'Protein','cooked'),
 food('lean_beef_cooked','Lean beef (cooked)','Meat',['beef lean'],'Protein','cooked'),
 // Seafood
 food('fish_rohu_cooked','Rohu fish (cooked)','Seafood',['rohu','carp fish'],'Protein','cooked'),
 food('fish_catla_cooked','Catla fish (cooked)','Seafood',['catla','katla'],'Protein','cooked'),
 food('fish_tilapia_cooked','Tilapia (cooked)','Seafood',['tilapia fish'],'Protein','cooked'),
 food('fish_salmon_cooked','Salmon (cooked)','Seafood',['salmon fish'],'Protein','cooked'),
 food('fish_tuna_cooked','Tuna (cooked)','Seafood',['tuna fish'],'Protein','cooked'),
 food('fish_sardines_cooked','Sardines (cooked)','Seafood',['sardine fish'],'Protein','cooked'),
 food('prawns_cooked','Prawns / shrimp (cooked)','Seafood',['royyalu','shrimps'],'Protein','cooked'),
 food('prawn_fry_andhra','Andhra royyala vepudu (prawn fry)','Seafood',['royyala fry','shrimp fry'],'Protein','fried'),
 food('crab_cooked','Crab (cooked)','Seafood',['peethalu','crab meat'],'Protein','cooked'),
 food('fish_fry_andhra','Andhra fish fry','Seafood',['chepala vepudu','chepala fry'],'Protein','fried'),
 // Nuts and seeds: protein contributing, not necessarily high-protein per calorie
 food('peanuts_roasted','Roasted peanuts','Nuts & seeds',['verusenagalu','groundnuts'],'Protein','roasted'),
 food('almonds_raw','Almonds (raw)','Nuts & seeds',['badam'],'Protein','raw'),
 food('pistachios_raw','Pistachios (raw)','Nuts & seeds',['pista'],'Protein','raw'),
 food('pumpkin_seeds','Pumpkin seeds','Nuts & seeds',['gummadi ginjalu'],'Protein','raw'),
 food('sunflower_seeds','Sunflower seeds','Nuts & seeds',['sunflower kernels'],'Protein','raw'),
 food('sesame_seeds','Sesame seeds','Nuts & seeds',['nuvvulu','til seeds'],'Protein','raw'),
 food('hemp_seeds','Hemp hearts','Nuts & seeds',['shelled hemp seeds'],'Protein','raw'),
 food('chia_seeds','Chia seeds','Nuts & seeds',['chia'],'Protein','raw'),
 food('flax_seeds','Flaxseeds','Nuts & seeds',['avise ginjalu','alsi'],'Protein','raw'),
 food('peanut_butter','Unsweetened peanut butter','Nuts & seeds',['groundnut butter'],'Protein','ready-to-eat'),
];
export const PROTEIN_GROUPS=['Legumes','Soy','Dairy protein','Eggs','Meat','Seafood','Nuts & seeds'];
export const proteinCounts=Object.fromEntries(PROTEIN_GROUPS.map(group=>[group,PROTEIN_FOODS.filter(f=>f.foodGroup===group).length]));
