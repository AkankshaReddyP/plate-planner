/**
 * Discoverability-only regional food names.
 *
 * These are NOT nutrition profiles. Dishes remain nutritionStatus='pending'
 * until a cooked-recipe nutrient basis, source, and fibre method are reviewed.
 * Cuisine names distinguish traditional Andhra items from modern quinoa dishes.
 * Sources for Andhra naming:
 * https://www.ncert.nic.in/pdf/publication/otherpublications/Unity_cultural.pdf
 * https://kadapa.ap.gov.in/importance/local/
 * https://kadapa.ap.gov.in/culinary-delight/raagi-rotte-sajja-rotte-jonna-rotte/
 * https://www.niti.gov.in/sites/default/files/2026-04/Divya-Bharat-A-WIndow-to-the-Soul-of-India-Web.pdf
 */
const item=(id,name,category,foodGroup,aliases=[],cuisine='Andhra / Telangana')=>({
  id,isActive:true,name,category,foodGroup,cuisine,aliases,
  nutritionStatus:'pending',
  subtitle:'Recipe varies · nutrient profile awaiting review',
});
export const ANDHRA_EXPANSION=[
  // Andhra curries & vegetables
  item('gutti_vankaya_kura','Gutti vankaya kura (stuffed brinjal)','Vegetable','Curry',['gutti vankaya','stuffed eggplant curry']),
  item('vankaya_kura','Vankaya kura (brinjal curry)','Vegetable','Curry',['eggplant curry','brinjal koora']),
  item('dondakaya_fry','Dondakaya fry (ivy gourd)','Vegetable','Curry',['tindora fry','kovakkai']),
  item('dondakaya_kura','Dondakaya kura (ivy gourd curry)','Vegetable','Curry',['tindora curry']),
  item('beerakaya_kura','Beerakaya kura (ridge gourd)','Vegetable','Curry',['ridge gourd curry']),
  item('sorakaya_kura','Sorakaya kura (bottle gourd)','Vegetable','Curry',['anapakaya curry','lauki']),
  item('dosakaya_kura','Dosakaya kura (yellow cucumber)','Vegetable','Curry',['yellow cucumber curry']),
  item('aratikaya_vepudu','Aratikaya vepudu (raw banana fry)','Vegetable','Curry',['raw plantain fry']),
  item('bangaladumpa_kura','Bangaladumpa kura (potato curry)','Vegetable','Curry',['aloo kura']),
  item('munagakaya_kura','Munagakaya kura (drumstick curry)','Vegetable','Curry',['moringa pod curry']),
  item('thotakura_fry','Thotakura fry (amaranth leaves)','Vegetable','Curry',['amaranth greens curry']),
  item('chikkudukaya_kura','Chikkudukaya kura (broad beans)','Vegetable','Curry',['broad bean curry']),
  item('bendakaya_pulusu','Bendakaya pulusu (tamarind okra stew)','Vegetable','Curry',['okra pulusu']),
  item('gummadikaya_pulusu','Gummadikaya pulusu (pumpkin stew)','Vegetable','Curry',['pumpkin pulusu']),
  item('majiga_pulusu','Majjiga pulusu (spiced buttermilk curry)','Dairy','Curry',['majjiga pulusu','mor kuzhambu']),
  item('gongura_pappu','Gongura pappu (sorrel dal)','Protein','Pappu',['gongura dal']),
  item('chintakaya_pappu','Chintakaya pappu (tamarind dal)','Protein','Pappu',['chintaaku pappu']),
  item('dosakaya_pappu','Dosakaya pappu (yellow cucumber dal)','Protein','Pappu',['cucumber dal']),
  item('beerakaya_pappu','Beerakaya pappu (ridge gourd dal)','Protein','Pappu',['ridge gourd dal']),
  item('thotakura_pappu','Thotakura pappu (amaranth dal)','Protein','Pappu',['amaranth dal']),
  item('mudda_pappu','Mudda pappu (plain cooked dal)','Protein','Pappu',['plain toor dal']),
  item('ulavacharu','Ulavacharu (horse gram stew)','Protein','Curry',['ulava charu','horsegram soup']),
  item('pachi_pulusu','Pachi pulusu (uncooked tamarind broth)','Vegetable','Curry',['pachipulusu']),
  item('tomato_charu','Tomato charu (tomato rasam)','Vegetable','Curry',['tomato rasam']),
  // chutneys and pickles (high-salt/oil recipes vary)
  item('gongura_pachadi','Gongura pachadi (sorrel chutney)','Vegetable','Chutney',['gongura pickle','gongura chutney']),
  item('dosakaya_pachadi','Dosakaya pachadi (cucumber chutney)','Vegetable','Chutney',['yellow cucumber pachadi']),
  item('beerakaya_pachadi','Beerakaya pachadi (ridge gourd chutney)','Vegetable','Chutney',['ridge gourd pachadi']),
  item('allam_pachadi','Allam pachadi (ginger chutney)','Vegetable','Chutney',['ginger chutney']),
  item('avakaya','Avakaya (mango pickle)','Vegetable','Chutney',['avakai','mango pickle']),
  item('kandi_podi','Kandi podi (toor dal spice powder)','Protein','Chutney',['gunpowder','pappula podi']),
  // Andhra proteins and curries
  item('andhra_kodi_kura','Andhra kodi kura (chicken curry)','Protein','Curry',['kodi koora','chicken pulusu']),
  item('natu_kodi_pulusu','Natu kodi pulusu (country chicken stew)','Protein','Curry',['natukodi pulusu']),
  item('gongura_mutton','Gongura mutton curry','Protein','Curry',['gongura mamsam']),
  item('chepala_pulusu','Chepala pulusu (tamarind fish curry)','Protein','Curry',['fish pulusu','chapala pulusu']),
  item('royyala_iguru','Royyala iguru (prawn curry)','Protein','Curry',['royyala kura','prawn masala']),
  item('guddu_pulusu','Guddu pulusu (egg tamarind curry)','Protein','Curry',['egg pulusu','egg curry']),
  // rotis, millet and ragi
  item('jonna_rotte','Jonna rotte (sorghum flatbread)','Grain','Roti',['jowar roti','jonna roti']),
  item('sajja_rotte','Sajja rotte (pearl millet flatbread)','Grain','Roti',['bajra roti','sajja roti']),
  item('ragi_rotte','Ragi rotte (finger millet flatbread)','Grain','Ragi',['ragi roti','finger millet rotti']),
  item('chapati','Chapati (whole-wheat flatbread)','Grain','Roti',['phulka','wheat roti']),
  item('mixed_millet_roti','Mixed millet roti','Grain','Roti',['multimillet roti']),
  item('ragi_sangati','Ragi sangati (ragi-rice balls)','Grain','Ragi',['ragi sankati','ragi mudda','ragi sangati rice']),
  item('ragi_java','Ragi java (finger millet porridge)','Grain','Ragi',['ragi malt','ragi ambali']),
  item('ragi_dosa_andhra','Andhra-style ragi dosa','Grain','Ragi',['ragi attu','finger millet dosa']),
  item('ragi_idli_andhra','Andhra-style ragi idli','Grain','Ragi',['finger millet idli']),
  item('ragi_upma','Ragi upma','Grain','Ragi',['finger millet upma']),
  item('ragi_adai','Ragi adai (millet flatbread)','Grain','Ragi',['ragi pancake']),
  item('korra_annam','Korra annam (cooked foxtail millet)','Grain','Millet',['korra rice','foxtail millet rice']),
  // quinoa is modern/fusion rather than a historical Andhra speciality
  item('quinoa_cooked','Cooked quinoa (plain)','Grain','Quinoa',['plain quinoa','quinoa rice'],'Everyday / modern'),
  item('quinoa_vegetable_upma','Vegetable quinoa upma','Grain','Quinoa',['quinoa upma'],'Indian fusion'),
  item('quinoa_pesarattu','Quinoa pesarattu','Protein','Quinoa',['quinoa moong dosa'],'Indian fusion'),
  item('quinoa_khichdi','Quinoa khichdi with dal','Grain','Quinoa',['quinoa dal khichdi'],'Indian fusion'),
  item('quinoa_vegetable_pulao','Quinoa vegetable pulao','Grain','Quinoa',['quinoa pulav'],'Indian fusion'),
  item('quinoa_curdrice','Quinoa curd rice','Grain','Quinoa',['quinoa daddojanam'],'Indian fusion'),
  // Regional tiffin, meal additions
  item('erra_karam_dosa','Erra karam dosa (red chutney dosa)','Grain','Tiffin',['karam dosa']),
  item('guddu_dosa','Guddu dosa (egg dosa)','Protein','Tiffin',['egg dosa']),
  item('alasanda_vada','Alasanda vada (black-eyed pea fritters)','Protein','Tiffin',['alasandalu vada','lobia vada']),
  item('pulagam','Pulagam (rice-dal preparation)','Grain','Tiffin',['pulagam rice']),
  item('bobbatlu','Bobbatlu (sweet lentil flatbread)','Grain','Tiffin',['polelu','puran poli']),
];
export const expansionCounts = ANDHRA_EXPANSION.reduce((out,dish)=>{
  out[dish.foodGroup]=(out[dish.foodGroup]??0)+1;return out;
},{});
