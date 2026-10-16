/* eslint-disable */
/**
 * lazyData.js — on-demand loading for the website's large data modules.
 *
 * The country/city files and blog articles add up to ~8 MB of source.
 * Importing them statically put all of it in the home page's JS, so
 * phones downloaded every city page just to show the landing page.
 *
 * Instead, LandingPage imports the same names from here. Each one starts
 * empty ([], {} or null) and is filled in, as a live ES-module binding,
 * when its module loads. LandingPage asks for the modules a page needs
 * (dataKeysForPage / dataKeysForPath), shows a skeleton until
 * loadData() resolves, then re-renders with the real values.
 *
 * Adding a country: add its `export let …` line and a MODULES entry
 * listing the pages that render it. scripts/build-data-index.js picks up
 * new *Cities.js files for /homeschool-<slug> routing automatically.
 */

import { ARTICLE_PART_LOADERS, HOMESCHOOL_SLUG_MODULES } from './generated/routeIndex.js'

export let COUNTRIES = []
export let US_STATES = {}, US_STATES_LIST = []
export let US_CITIES = {}, US_CITIES_BY_STATE = {}
export let CA_PROVINCES = {}, CA_PROVINCES_LIST = []
export let CA_CITIES = {}, CA_CITIES_BY_PROVINCE = {}
export let NAIROBI_AREAS = []
export let UAE_AREAS = []
export let UK_AREAS = [], UK_AREAS_BY_CITY = {}
export let KENYA_CITIES = [], KENYA_COUNTRY = null
export let ETHIOPIA_CITIES = [], ETHIOPIA_COUNTRY = null
export let RWANDA_CITIES = [], RWANDA_COUNTRY = null
export let SOUTH_AFRICA_CITIES = [], SOUTH_AFRICA_COUNTRY = null
export let QATAR_CITIES = [], QATAR_COUNTRY = null
export let SAUDI_ARABIA_CITIES = [], SAUDI_ARABIA_COUNTRY = null
export let UAE_CITIES = [], UAE_COUNTRY = null
export let EGYPT_CITIES = [], EGYPT_COUNTRY = null
export let MOROCCO_CITIES = [], MOROCCO_COUNTRY = null
export let SOUTH_KOREA_CITIES = [], SOUTH_KOREA_COUNTRY = null
export let JAPAN_CITIES = [], JAPAN_COUNTRY = null
export let MALAYSIA_CITIES = [], MALAYSIA_COUNTRY = null
export let SPAIN_CITIES = [], SPAIN_COUNTRY = null
export let DENMARK_CITIES = [], DENMARK_COUNTRY = null
export let FRANCE_CITIES = [], FRANCE_COUNTRY = null
export let ITALY_CITIES = [], ITALY_COUNTRY = null
export let POLAND_CITIES = [], POLAND_COUNTRY = null
export let PORTUGAL_CITIES = [], PORTUGAL_COUNTRY = null
export let CZECH_CITIES = [], CZECH_COUNTRY = null
export let BELGIUM_CITIES = [], BELGIUM_COUNTRY = null
export let SWEDEN_CITIES = [], SWEDEN_COUNTRY = null
export let NETHERLANDS_CITIES = [], NETHERLANDS_COUNTRY = null
export let NORWAY_CITIES = [], NORWAY_COUNTRY = null
export let NZ_CITIES = [], NZ_COUNTRY = null
export let AUSTRIA_CITIES = [], AUSTRIA_COUNTRY = null
export let HUNGARY_CITIES = [], HUNGARY_COUNTRY = null
export let FINLAND_CITIES = [], FINLAND_COUNTRY = null
export let GREECE_CITIES = [], GREECE_COUNTRY = null
export let AZERBAIJAN_CITIES = [], AZERBAIJAN_COUNTRY = null
export let GEORGIA_CITIES = [], GEORGIA_COUNTRY = null
export let PAKISTAN_CITIES = [], PAKISTAN_COUNTRY = null
export let AUSTRALIA_CITIES = [], AUSTRALIA_COUNTRY = null
export let LUXEMBOURG_CITIES = [], LUXEMBOURG_COUNTRY = null
export let SWITZERLAND_CITIES = [], SWITZERLAND_COUNTRY = null
export let SLOVAKIA_CITIES = [], SLOVAKIA_COUNTRY = null
export let SLOVENIA_CITIES = [], SLOVENIA_COUNTRY = null
export let CROATIA_CITIES = [], CROATIA_COUNTRY = null
export let SERBIA_CITIES = [], SERBIA_COUNTRY = null
export let BULGARIA_CITIES = [], BULGARIA_COUNTRY = null
export let ALBANIA_CITIES = [], ALBANIA_COUNTRY = null
export let NORTH_MACEDONIA_CITIES = [], NORTH_MACEDONIA_COUNTRY = null
export let MONTENEGRO_CITIES = [], MONTENEGRO_COUNTRY = null
export let BOSNIA_CITIES = [], BOSNIA_COUNTRY = null
export let KOSOVO_CITIES = [], KOSOVO_COUNTRY = null
export let ZAMBIA_CITIES = [], ZAMBIA_COUNTRY = null
export let ZIMBABWE_CITIES = [], ZIMBABWE_COUNTRY = null
export let BOTSWANA_CITIES = [], BOTSWANA_COUNTRY = null
export let NAMIBIA_CITIES = [], NAMIBIA_COUNTRY = null
export let ALGERIA_CITIES = [], ALGERIA_COUNTRY = null
export let TUNISIA_CITIES = [], TUNISIA_COUNTRY = null
export let MAURITIUS_CITIES = [], MAURITIUS_COUNTRY = null
export let GHANA_CITIES = [], GHANA_COUNTRY = null
export let ANGOLA_CITIES = [], ANGOLA_COUNTRY = null
export let DRC_CITIES = [], DRC_COUNTRY = null
export let MEXICO_CITIES = [], MEXICO_COUNTRY = null
export let BRAZIL_CITIES = [], BRAZIL_COUNTRY = null
export let COLOMBIA_CITIES = [], COLOMBIA_COUNTRY = null
export let ARGENTINA_CITIES = [], ARGENTINA_COUNTRY = null
export let CHILE_CITIES = [], CHILE_COUNTRY = null
export let PERU_CITIES = [], PERU_COUNTRY = null
export let ECUADOR_CITIES = [], ECUADOR_COUNTRY = null
export let PANAMA_CITIES = [], PANAMA_COUNTRY = null
export let COSTA_RICA_CITIES = [], COSTA_RICA_COUNTRY = null
export let DOMINICAN_CITIES = [], DOMINICAN_COUNTRY = null
export let URUGUAY_CITIES = [], URUGUAY_COUNTRY = null
export let GUATEMALA_CITIES = [], GUATEMALA_COUNTRY = null
export let PARAGUAY_CITIES = [], PARAGUAY_COUNTRY = null
export let BOLIVIA_CITIES = [], BOLIVIA_COUNTRY = null
export let VENEZUELA_CITIES = [], VENEZUELA_COUNTRY = null
export let PUERTO_RICO_CITIES = [], PUERTO_RICO_COUNTRY = null
export let ISRAEL_CITIES = [], ISRAEL_COUNTRY = null
export let JORDAN_CITIES = [], JORDAN_COUNTRY = null
export let IRAQ_CITIES = [], IRAQ_COUNTRY = null
export let CYPRUS_CITIES = [], CYPRUS_COUNTRY = null
export let LEBANON_CITIES = [], LEBANON_COUNTRY = null
export let MYANMAR_CITIES = [], MYANMAR_COUNTRY = null
export let MALDIVES_CITIES = [], MALDIVES_COUNTRY = null
export let CHINA_CITIES = [], CHINA_COUNTRY = null
export let BANGLADESH_CITIES = [], BANGLADESH_COUNTRY = null
export let NEPAL_CITIES = [], NEPAL_COUNTRY = null
export let TURKEY_CITIES = [], TURKEY_COUNTRY = null
export let KUWAIT_CITIES = [], KUWAIT_COUNTRY = null
export let OMAN_CITIES = [], OMAN_COUNTRY = null
export let NIGERIA_CITIES = [], NIGERIA_COUNTRY = null
export let BAHRAIN_CITIES = [], BAHRAIN_COUNTRY = null
export let TAIWAN_CITIES = [], TAIWAN_COUNTRY = null
export let IRELAND_CITIES = [], IRELAND_COUNTRY = null
export let UK_CITIES = [], UK_COUNTRY = null
export let INDIA_CITIES = [], INDIA_COUNTRY = null
export let GERMANY_CITIES = [], GERMANY_COUNTRY = null
export let ROMANIA_CITIES = [], ROMANIA_COUNTRY = null
export let UKRAINE_CITIES = [], UKRAINE_COUNTRY = null
export let VIETNAM_CITIES = [], VIETNAM_COUNTRY = null
export let THAILAND_CITIES = [], THAILAND_COUNTRY = null

// Blog: listing index (all articles, no bodies) and the full-article parts.
export let ARTICLES_INDEX = {}
const ARTICLE_PARTS = {}

// key → [import(), adopt exports into the bindings above, pages that render it]
const MODULES = {
  countries: [() => import('./countries.js'), m => { COUNTRIES = m.COUNTRIES }, ['country-detail']],
  usStates: [() => import('./usStates.js'), m => { US_STATES = m.US_STATES; US_STATES_LIST = m.US_STATES_LIST }, ['state-landing', 'city-landing', 'us-families']],
  usCities: [() => import('./usCities.js'), m => { US_CITIES = m.US_CITIES; US_CITIES_BY_STATE = m.US_CITIES_BY_STATE }, ['state-landing', 'city-landing']],
  caProvinces: [() => import('./caProvinces.js'), m => { CA_PROVINCES = m.CA_PROVINCES; CA_PROVINCES_LIST = m.CA_PROVINCES_LIST }, ['province-landing', 'ca-city-landing', 'ca-families']],
  caCities: [() => import('./caCities.js'), m => { CA_CITIES = m.CA_CITIES; CA_CITIES_BY_PROVINCE = m.CA_CITIES_BY_PROVINCE }, ['province-landing', 'ca-city-landing']],
  nairobiAreas: [() => import('./nairobiAreas.js'), m => { NAIROBI_AREAS = m.NAIROBI_AREAS }, ['tuition-nairobi', 'tuition-area']],
  uaeAreas: [() => import('./uaeAreas.js'), m => { UAE_AREAS = m.UAE_AREAS }, ['tuition-uae', 'uae-area']],
  ukAreas: [() => import('./ukAreas.js'), m => { UK_AREAS = m.UK_AREAS; UK_AREAS_BY_CITY = m.UK_AREAS_BY_CITY }, ['tuition-uk', 'uk-area']],
  kenyaCities: [() => import('./kenyaCities.js'), m => { KENYA_CITIES = m.KENYA_CITIES; KENYA_COUNTRY = m.KENYA_COUNTRY }, ['homeschooling-kenya', 'kenya-city']],
  ethiopiaCities: [() => import('./ethiopiaCities.js'), m => { ETHIOPIA_CITIES = m.ETHIOPIA_CITIES; ETHIOPIA_COUNTRY = m.ETHIOPIA_COUNTRY }, ['ethiopia-city', 'homeschooling-ethiopia']],
  rwandaCities: [() => import('./rwandaCities.js'), m => { RWANDA_CITIES = m.RWANDA_CITIES; RWANDA_COUNTRY = m.RWANDA_COUNTRY }, ['rwanda-city', 'homeschooling-rwanda']],
  southAfricaCities: [() => import('./southAfricaCities.js'), m => { SOUTH_AFRICA_CITIES = m.SOUTH_AFRICA_CITIES; SOUTH_AFRICA_COUNTRY = m.SOUTH_AFRICA_COUNTRY }, ['sa-city', 'homeschooling-south-africa']],
  qatarCities: [() => import('./qatarCities.js'), m => { QATAR_CITIES = m.QATAR_CITIES; QATAR_COUNTRY = m.QATAR_COUNTRY }, ['qatar-city', 'homeschooling-qatar']],
  saudiArabiaCities: [() => import('./saudiArabiaCities.js'), m => { SAUDI_ARABIA_CITIES = m.SAUDI_ARABIA_CITIES; SAUDI_ARABIA_COUNTRY = m.SAUDI_ARABIA_COUNTRY }, ['saudi-city', 'homeschooling-saudi-arabia']],
  uaeCities: [() => import('./uaeCities.js'), m => { UAE_CITIES = m.UAE_CITIES; UAE_COUNTRY = m.UAE_COUNTRY }, ['uae-city', 'homeschooling-uae']],
  egyptCities: [() => import('./egyptCities.js'), m => { EGYPT_CITIES = m.EGYPT_CITIES; EGYPT_COUNTRY = m.EGYPT_COUNTRY }, ['egypt-city', 'homeschooling-egypt']],
  moroccoCities: [() => import('./moroccoCities.js'), m => { MOROCCO_CITIES = m.MOROCCO_CITIES; MOROCCO_COUNTRY = m.MOROCCO_COUNTRY }, ['morocco-city', 'homeschooling-morocco']],
  southKoreaCities: [() => import('./southKoreaCities.js'), m => { SOUTH_KOREA_CITIES = m.SOUTH_KOREA_CITIES; SOUTH_KOREA_COUNTRY = m.SOUTH_KOREA_COUNTRY }, ['south-korea-city', 'homeschooling-south-korea']],
  japanCities: [() => import('./japanCities.js'), m => { JAPAN_CITIES = m.JAPAN_CITIES; JAPAN_COUNTRY = m.JAPAN_COUNTRY }, ['japan-city', 'homeschooling-japan']],
  malaysiaCities: [() => import('./malaysiaCities.js'), m => { MALAYSIA_CITIES = m.MALAYSIA_CITIES; MALAYSIA_COUNTRY = m.MALAYSIA_COUNTRY }, ['malaysia-city', 'homeschooling-malaysia']],
  spainCities: [() => import('./spainCities.js'), m => { SPAIN_CITIES = m.SPAIN_CITIES; SPAIN_COUNTRY = m.SPAIN_COUNTRY }, ['spain-city', 'homeschooling-spain']],
  denmarkCities: [() => import('./denmarkCities.js'), m => { DENMARK_CITIES = m.DENMARK_CITIES; DENMARK_COUNTRY = m.DENMARK_COUNTRY }, ['denmark-city', 'homeschooling-denmark']],
  franceCities: [() => import('./franceCities.js'), m => { FRANCE_CITIES = m.FRANCE_CITIES; FRANCE_COUNTRY = m.FRANCE_COUNTRY }, ['france-city', 'homeschooling-france']],
  italyCities: [() => import('./italyCities.js'), m => { ITALY_CITIES = m.ITALY_CITIES; ITALY_COUNTRY = m.ITALY_COUNTRY }, ['italy-city', 'homeschooling-italy']],
  polandCities: [() => import('./polandCities.js'), m => { POLAND_CITIES = m.POLAND_CITIES; POLAND_COUNTRY = m.POLAND_COUNTRY }, ['poland-city', 'homeschooling-poland']],
  portugalCities: [() => import('./portugalCities.js'), m => { PORTUGAL_CITIES = m.PORTUGAL_CITIES; PORTUGAL_COUNTRY = m.PORTUGAL_COUNTRY }, ['portugal-city', 'homeschooling-portugal']],
  czechCities: [() => import('./czechCities.js'), m => { CZECH_CITIES = m.CZECH_CITIES; CZECH_COUNTRY = m.CZECH_COUNTRY }, ['czech-city', 'homeschooling-czech-republic']],
  belgiumCities: [() => import('./belgiumCities.js'), m => { BELGIUM_CITIES = m.BELGIUM_CITIES; BELGIUM_COUNTRY = m.BELGIUM_COUNTRY }, ['belgium-city', 'homeschooling-belgium']],
  swedenCities: [() => import('./swedenCities.js'), m => { SWEDEN_CITIES = m.SWEDEN_CITIES; SWEDEN_COUNTRY = m.SWEDEN_COUNTRY }, ['sweden-city', 'homeschooling-sweden']],
  netherlandsCities: [() => import('./netherlandsCities.js'), m => { NETHERLANDS_CITIES = m.NETHERLANDS_CITIES; NETHERLANDS_COUNTRY = m.NETHERLANDS_COUNTRY }, ['netherlands-city', 'homeschooling-netherlands']],
  norwayCities: [() => import('./norwayCities.js'), m => { NORWAY_CITIES = m.NORWAY_CITIES; NORWAY_COUNTRY = m.NORWAY_COUNTRY }, ['norway-city', 'homeschooling-norway']],
  nzCities: [() => import('./nzCities.js'), m => { NZ_CITIES = m.NZ_CITIES; NZ_COUNTRY = m.NZ_COUNTRY }, ['new-zealand-city', 'homeschooling-new-zealand']],
  austriaCities: [() => import('./austriaCities.js'), m => { AUSTRIA_CITIES = m.AUSTRIA_CITIES; AUSTRIA_COUNTRY = m.AUSTRIA_COUNTRY }, ['austria-city', 'homeschooling-austria']],
  hungaryCities: [() => import('./hungaryCities.js'), m => { HUNGARY_CITIES = m.HUNGARY_CITIES; HUNGARY_COUNTRY = m.HUNGARY_COUNTRY }, ['hungary-city', 'homeschooling-hungary']],
  finlandCities: [() => import('./finlandCities.js'), m => { FINLAND_CITIES = m.FINLAND_CITIES; FINLAND_COUNTRY = m.FINLAND_COUNTRY }, ['finland-city', 'homeschooling-finland']],
  greeceCities: [() => import('./greeceCities.js'), m => { GREECE_CITIES = m.GREECE_CITIES; GREECE_COUNTRY = m.GREECE_COUNTRY }, ['greece-city', 'homeschooling-greece']],
  azerbaijanCities: [() => import('./azerbaijanCities.js'), m => { AZERBAIJAN_CITIES = m.AZERBAIJAN_CITIES; AZERBAIJAN_COUNTRY = m.AZERBAIJAN_COUNTRY }, ['azerbaijan-city', 'homeschooling-azerbaijan']],
  georgiaCities: [() => import('./georgiaCities.js'), m => { GEORGIA_CITIES = m.GEORGIA_CITIES; GEORGIA_COUNTRY = m.GEORGIA_COUNTRY }, ['georgia-city', 'homeschooling-georgia']],
  pakistanCities: [() => import('./pakistanCities.js'), m => { PAKISTAN_CITIES = m.PAKISTAN_CITIES; PAKISTAN_COUNTRY = m.PAKISTAN_COUNTRY }, ['pakistan-city', 'homeschooling-pakistan']],
  australiaCities: [() => import('./australiaCities.js'), m => { AUSTRALIA_CITIES = m.AUSTRALIA_CITIES; AUSTRALIA_COUNTRY = m.AUSTRALIA_COUNTRY }, ['australia-city', 'homeschooling-australia']],
  luxembourgCities: [() => import('./luxembourgCities.js'), m => { LUXEMBOURG_CITIES = m.LUXEMBOURG_CITIES; LUXEMBOURG_COUNTRY = m.LUXEMBOURG_COUNTRY }, ['luxembourg-city-page', 'homeschooling-luxembourg']],
  switzerlandCities: [() => import('./switzerlandCities.js'), m => { SWITZERLAND_CITIES = m.SWITZERLAND_CITIES; SWITZERLAND_COUNTRY = m.SWITZERLAND_COUNTRY }, ['switzerland-city', 'homeschooling-switzerland']],
  slovakiaCities: [() => import('./slovakiaCities.js'), m => { SLOVAKIA_CITIES = m.SLOVAKIA_CITIES; SLOVAKIA_COUNTRY = m.SLOVAKIA_COUNTRY }, ['slovakia-city', 'homeschooling-slovakia']],
  sloveniaCities: [() => import('./sloveniaCities.js'), m => { SLOVENIA_CITIES = m.SLOVENIA_CITIES; SLOVENIA_COUNTRY = m.SLOVENIA_COUNTRY }, ['slovenia-city', 'homeschooling-slovenia']],
  croatiaCities: [() => import('./croatiaCities.js'), m => { CROATIA_CITIES = m.CROATIA_CITIES; CROATIA_COUNTRY = m.CROATIA_COUNTRY }, ['croatia-city', 'homeschooling-croatia']],
  serbiaCities: [() => import('./serbiaCities.js'), m => { SERBIA_CITIES = m.SERBIA_CITIES; SERBIA_COUNTRY = m.SERBIA_COUNTRY }, ['serbia-city', 'homeschooling-serbia']],
  bulgariaCities: [() => import('./bulgariaCities.js'), m => { BULGARIA_CITIES = m.BULGARIA_CITIES; BULGARIA_COUNTRY = m.BULGARIA_COUNTRY }, ['bulgaria-city', 'homeschooling-bulgaria']],
  albaniaCities: [() => import('./albaniaCities.js'), m => { ALBANIA_CITIES = m.ALBANIA_CITIES; ALBANIA_COUNTRY = m.ALBANIA_COUNTRY }, ['albania-city', 'homeschooling-albania']],
  northMacedoniaCities: [() => import('./northMacedoniaCities.js'), m => { NORTH_MACEDONIA_CITIES = m.NORTH_MACEDONIA_CITIES; NORTH_MACEDONIA_COUNTRY = m.NORTH_MACEDONIA_COUNTRY }, ['north-macedonia-city', 'homeschooling-north-macedonia']],
  montenegroCities: [() => import('./montenegroCities.js'), m => { MONTENEGRO_CITIES = m.MONTENEGRO_CITIES; MONTENEGRO_COUNTRY = m.MONTENEGRO_COUNTRY }, ['montenegro-city', 'homeschooling-montenegro']],
  bosniaCities: [() => import('./bosniaCities.js'), m => { BOSNIA_CITIES = m.BOSNIA_CITIES; BOSNIA_COUNTRY = m.BOSNIA_COUNTRY }, ['bosnia-city', 'homeschooling-bosnia']],
  kosovoCities: [() => import('./kosovoCities.js'), m => { KOSOVO_CITIES = m.KOSOVO_CITIES; KOSOVO_COUNTRY = m.KOSOVO_COUNTRY }, ['kosovo-city', 'homeschooling-kosovo']],
  zambiaCities: [() => import('./zambiaCities.js'), m => { ZAMBIA_CITIES = m.ZAMBIA_CITIES; ZAMBIA_COUNTRY = m.ZAMBIA_COUNTRY }, ['zambia-city', 'homeschooling-zambia']],
  zimbabweCities: [() => import('./zimbabweCities.js'), m => { ZIMBABWE_CITIES = m.ZIMBABWE_CITIES; ZIMBABWE_COUNTRY = m.ZIMBABWE_COUNTRY }, ['zimbabwe-city', 'homeschooling-zimbabwe']],
  botswanaCities: [() => import('./botswanaCities.js'), m => { BOTSWANA_CITIES = m.BOTSWANA_CITIES; BOTSWANA_COUNTRY = m.BOTSWANA_COUNTRY }, ['botswana-city', 'homeschooling-botswana']],
  namibiaCities: [() => import('./namibiaCities.js'), m => { NAMIBIA_CITIES = m.NAMIBIA_CITIES; NAMIBIA_COUNTRY = m.NAMIBIA_COUNTRY }, ['namibia-city', 'homeschooling-namibia']],
  algeriaCities: [() => import('./algeriaCities.js'), m => { ALGERIA_CITIES = m.ALGERIA_CITIES; ALGERIA_COUNTRY = m.ALGERIA_COUNTRY }, ['algeria-city', 'homeschooling-algeria']],
  tunisiaCities: [() => import('./tunisiaCities.js'), m => { TUNISIA_CITIES = m.TUNISIA_CITIES; TUNISIA_COUNTRY = m.TUNISIA_COUNTRY }, ['tunisia-city', 'homeschooling-tunisia']],
  mauritiusCities: [() => import('./mauritiusCities.js'), m => { MAURITIUS_CITIES = m.MAURITIUS_CITIES; MAURITIUS_COUNTRY = m.MAURITIUS_COUNTRY }, ['mauritius-city', 'homeschooling-mauritius']],
  ghanaCities: [() => import('./ghanaCities.js'), m => { GHANA_CITIES = m.GHANA_CITIES; GHANA_COUNTRY = m.GHANA_COUNTRY }, ['ghana-city', 'homeschooling-ghana']],
  angolaCities: [() => import('./angolaCities.js'), m => { ANGOLA_CITIES = m.ANGOLA_CITIES; ANGOLA_COUNTRY = m.ANGOLA_COUNTRY }, ['angola-city', 'homeschooling-angola']],
  drcCities: [() => import('./drcCities.js'), m => { DRC_CITIES = m.DRC_CITIES; DRC_COUNTRY = m.DRC_COUNTRY }, ['drc-city', 'homeschooling-drc']],
  mexicoCities: [() => import('./mexicoCities.js'), m => { MEXICO_CITIES = m.MEXICO_CITIES; MEXICO_COUNTRY = m.MEXICO_COUNTRY }, ['mexico-city-page', 'homeschooling-mexico']],
  brazilCities: [() => import('./brazilCities.js'), m => { BRAZIL_CITIES = m.BRAZIL_CITIES; BRAZIL_COUNTRY = m.BRAZIL_COUNTRY }, ['brazil-city', 'homeschooling-brazil']],
  colombiaCities: [() => import('./colombiaCities.js'), m => { COLOMBIA_CITIES = m.COLOMBIA_CITIES; COLOMBIA_COUNTRY = m.COLOMBIA_COUNTRY }, ['colombia-city', 'homeschooling-colombia']],
  argentinaCities: [() => import('./argentinaCities.js'), m => { ARGENTINA_CITIES = m.ARGENTINA_CITIES; ARGENTINA_COUNTRY = m.ARGENTINA_COUNTRY }, ['argentina-city', 'homeschooling-argentina']],
  chileCities: [() => import('./chileCities.js'), m => { CHILE_CITIES = m.CHILE_CITIES; CHILE_COUNTRY = m.CHILE_COUNTRY }, ['chile-city', 'homeschooling-chile']],
  peruCities: [() => import('./peruCities.js'), m => { PERU_CITIES = m.PERU_CITIES; PERU_COUNTRY = m.PERU_COUNTRY }, ['peru-city', 'homeschooling-peru']],
  ecuadorCities: [() => import('./ecuadorCities.js'), m => { ECUADOR_CITIES = m.ECUADOR_CITIES; ECUADOR_COUNTRY = m.ECUADOR_COUNTRY }, ['ecuador-city', 'homeschooling-ecuador']],
  panamaCities: [() => import('./panamaCities.js'), m => { PANAMA_CITIES = m.PANAMA_CITIES; PANAMA_COUNTRY = m.PANAMA_COUNTRY }, ['panama-city-page', 'homeschooling-panama']],
  costaRicaCities: [() => import('./costaRicaCities.js'), m => { COSTA_RICA_CITIES = m.COSTA_RICA_CITIES; COSTA_RICA_COUNTRY = m.COSTA_RICA_COUNTRY }, ['costa-rica-city', 'homeschooling-costa-rica']],
  dominicanCities: [() => import('./dominicanCities.js'), m => { DOMINICAN_CITIES = m.DOMINICAN_CITIES; DOMINICAN_COUNTRY = m.DOMINICAN_COUNTRY }, ['dominican-city', 'homeschooling-dominican-republic']],
  uruguayCities: [() => import('./uruguayCities.js'), m => { URUGUAY_CITIES = m.URUGUAY_CITIES; URUGUAY_COUNTRY = m.URUGUAY_COUNTRY }, ['uruguay-city', 'homeschooling-uruguay']],
  guatemalaCities: [() => import('./guatemalaCities.js'), m => { GUATEMALA_CITIES = m.GUATEMALA_CITIES; GUATEMALA_COUNTRY = m.GUATEMALA_COUNTRY }, ['guatemala-city-page', 'homeschooling-guatemala']],
  paraguayCities: [() => import('./paraguayCities.js'), m => { PARAGUAY_CITIES = m.PARAGUAY_CITIES; PARAGUAY_COUNTRY = m.PARAGUAY_COUNTRY }, ['paraguay-city', 'homeschooling-paraguay']],
  boliviaCities: [() => import('./boliviaCities.js'), m => { BOLIVIA_CITIES = m.BOLIVIA_CITIES; BOLIVIA_COUNTRY = m.BOLIVIA_COUNTRY }, ['bolivia-city', 'homeschooling-bolivia']],
  venezuelaCities: [() => import('./venezuelaCities.js'), m => { VENEZUELA_CITIES = m.VENEZUELA_CITIES; VENEZUELA_COUNTRY = m.VENEZUELA_COUNTRY }, ['venezuela-city', 'homeschooling-venezuela']],
  puertoRicoCities: [() => import('./puertoRicoCities.js'), m => { PUERTO_RICO_CITIES = m.PUERTO_RICO_CITIES; PUERTO_RICO_COUNTRY = m.PUERTO_RICO_COUNTRY }, ['puerto-rico-city', 'homeschooling-puerto-rico']],
  israelCities: [() => import('./israelCities.js'), m => { ISRAEL_CITIES = m.ISRAEL_CITIES; ISRAEL_COUNTRY = m.ISRAEL_COUNTRY }, ['israel-city', 'homeschooling-israel']],
  jordanCities: [() => import('./jordanCities.js'), m => { JORDAN_CITIES = m.JORDAN_CITIES; JORDAN_COUNTRY = m.JORDAN_COUNTRY }, ['jordan-city', 'homeschooling-jordan']],
  iraqCities: [() => import('./iraqCities.js'), m => { IRAQ_CITIES = m.IRAQ_CITIES; IRAQ_COUNTRY = m.IRAQ_COUNTRY }, ['iraq-city', 'homeschooling-iraq']],
  cyprusCities: [() => import('./cyprusCities.js'), m => { CYPRUS_CITIES = m.CYPRUS_CITIES; CYPRUS_COUNTRY = m.CYPRUS_COUNTRY }, ['cyprus-city', 'homeschooling-cyprus']],
  lebanonCities: [() => import('./lebanonCities.js'), m => { LEBANON_CITIES = m.LEBANON_CITIES; LEBANON_COUNTRY = m.LEBANON_COUNTRY }, ['lebanon-city', 'homeschooling-lebanon']],
  myanmarCities: [() => import('./myanmarCities.js'), m => { MYANMAR_CITIES = m.MYANMAR_CITIES; MYANMAR_COUNTRY = m.MYANMAR_COUNTRY }, ['myanmar-city', 'homeschooling-myanmar']],
  maldivesCities: [() => import('./maldivesCities.js'), m => { MALDIVES_CITIES = m.MALDIVES_CITIES; MALDIVES_COUNTRY = m.MALDIVES_COUNTRY }, ['maldives-city', 'homeschooling-maldives']],
  chinaCities: [() => import('./chinaCities.js'), m => { CHINA_CITIES = m.CHINA_CITIES; CHINA_COUNTRY = m.CHINA_COUNTRY }, ['china-city', 'homeschooling-china']],
  bangladeshCities: [() => import('./bangladeshCities.js'), m => { BANGLADESH_CITIES = m.BANGLADESH_CITIES; BANGLADESH_COUNTRY = m.BANGLADESH_COUNTRY }, ['bangladesh-city', 'homeschooling-bangladesh']],
  nepalCities: [() => import('./nepalCities.js'), m => { NEPAL_CITIES = m.NEPAL_CITIES; NEPAL_COUNTRY = m.NEPAL_COUNTRY }, ['nepal-city', 'homeschooling-nepal']],
  turkeyCities: [() => import('./turkeyCities.js'), m => { TURKEY_CITIES = m.TURKEY_CITIES; TURKEY_COUNTRY = m.TURKEY_COUNTRY }, ['turkey-city', 'homeschooling-turkey']],
  kuwaitCities: [() => import('./kuwaitCities.js'), m => { KUWAIT_CITIES = m.KUWAIT_CITIES; KUWAIT_COUNTRY = m.KUWAIT_COUNTRY }, ['kuwait-city', 'homeschooling-kuwait']],
  omanCities: [() => import('./omanCities.js'), m => { OMAN_CITIES = m.OMAN_CITIES; OMAN_COUNTRY = m.OMAN_COUNTRY }, ['oman-city', 'homeschooling-oman']],
  nigeriaCities: [() => import('./nigeriaCities.js'), m => { NIGERIA_CITIES = m.NIGERIA_CITIES; NIGERIA_COUNTRY = m.NIGERIA_COUNTRY }, ['nigeria-city', 'homeschooling-nigeria']],
  bahrainCities: [() => import('./bahrainCities.js'), m => { BAHRAIN_CITIES = m.BAHRAIN_CITIES; BAHRAIN_COUNTRY = m.BAHRAIN_COUNTRY }, ['bahrain-city', 'homeschooling-bahrain']],
  taiwanCities: [() => import('./taiwanCities.js'), m => { TAIWAN_CITIES = m.TAIWAN_CITIES; TAIWAN_COUNTRY = m.TAIWAN_COUNTRY }, ['taiwan-city', 'homeschooling-taiwan']],
  irelandCities: [() => import('./irelandCities.js'), m => { IRELAND_CITIES = m.IRELAND_CITIES; IRELAND_COUNTRY = m.IRELAND_COUNTRY }, ['ireland-city', 'homeschooling-ireland']],
  ukCities: [() => import('./ukCities.js'), m => { UK_CITIES = m.UK_CITIES; UK_COUNTRY = m.UK_COUNTRY }, ['uk-city', 'homeschooling-united-kingdom']],
  indiaCities: [() => import('./indiaCities.js'), m => { INDIA_CITIES = m.INDIA_CITIES; INDIA_COUNTRY = m.INDIA_COUNTRY }, ['india-city', 'homeschooling-india']],
  germanyCities: [() => import('./germanyCities.js'), m => { GERMANY_CITIES = m.GERMANY_CITIES; GERMANY_COUNTRY = m.GERMANY_COUNTRY }, ['germany-city', 'homeschooling-germany']],
  romaniaCities: [() => import('./romaniaCities.js'), m => { ROMANIA_CITIES = m.ROMANIA_CITIES; ROMANIA_COUNTRY = m.ROMANIA_COUNTRY }, ['romania-city', 'homeschooling-romania']],
  ukraineCities: [() => import('./ukraineCities.js'), m => { UKRAINE_CITIES = m.UKRAINE_CITIES; UKRAINE_COUNTRY = m.UKRAINE_COUNTRY }, ['ukraine-city', 'homeschooling-ukraine']],
  vietnamCities: [() => import('./vietnamCities.js'), m => { VIETNAM_CITIES = m.VIETNAM_CITIES; VIETNAM_COUNTRY = m.VIETNAM_COUNTRY }, ['vietnam-city', 'homeschooling-vietnam']],
  thailandCities: [() => import('./thailandCities.js'), m => { THAILAND_CITIES = m.THAILAND_CITIES; THAILAND_COUNTRY = m.THAILAND_COUNTRY }, ['thailand-city', 'homeschooling-thailand']],
  articlesIndex: [() => import('./generated/articlesIndex.js'), m => { ARTICLES_INDEX = m.ARTICLES_INDEX }, ['blog', 'article']],
}
for (const [part, load] of Object.entries(ARTICLE_PART_LOADERS)) {
  MODULES[part] = [load, m => { ARTICLE_PARTS[part] = Object.values(m)[0] }, []]
}

const PAGE_KEYS = {}
for (const [key, [, , pages]] of Object.entries(MODULES)) {
  for (const p of pages) (PAGE_KEYS[p] ||= []).push(key)
}

const loaded = new Set()
const inflight = {}

export function isDataLoaded(keys) {
  return keys.every(k => loaded.has(k))
}

export function loadData(keys) {
  return Promise.all(keys.map(key => {
    if (loaded.has(key)) return null
    const mod = MODULES[key]
    if (!mod) return null
    return (inflight[key] ||= mod[0]().then(
      m => { mod[1](m); loaded.add(key); delete inflight[key] },
      // Let a later navigation retry (e.g. after a flaky connection).
      err => { delete inflight[key]; throw err },
    ))
  }))
}

/** Modules a page renders from. `articleSlug` selects the article part. */
export function dataKeysForPage(page, articleSlug) {
  const keys = PAGE_KEYS[page] || []
  if (page !== 'article') return keys
  const entry = articleSlug && ARTICLES_INDEX[articleSlug]
  return entry ? [...keys, entry.part] : keys
}

/** Modules the URL resolver must search before it can pick the page. */
export function dataKeysForPath(path) {
  if (path.startsWith('/blog/')) return ['articlesIndex']
  if (path.startsWith('/homeschool-')) {
    return HOMESCHOOL_SLUG_MODULES.get(decodeURIComponent(path.slice('/homeschool-'.length))) || []
  }
  if (path.startsWith('/homeschooling/')) return ['kenyaCities']
  if (path.startsWith('/tuition/')) return ['nairobiAreas']
  if (path.startsWith('/tuition-uae/')) return ['uaeAreas']
  if (path.startsWith('/tuition-uk/')) return ['ukAreas']
  return []
}

/** Full article (with sections) once its part has loaded, else undefined. */
export function getFullArticle(slug) {
  const entry = ARTICLES_INDEX[slug]
  return entry ? ARTICLE_PARTS[entry.part]?.[slug] : undefined
}
