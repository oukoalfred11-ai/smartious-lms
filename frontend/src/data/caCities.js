// Canadian city landing pages for Smartious Homeschool
// URL pattern: /homeschool-{city-slug}-{province-abbr}
// Mirrors usCities.js structure
// All pricing referenced in CAD alongside USD (1 USD ≈ 1.36 CAD as of 2026)

export const CA_CITIES = {
  'toronto-on': {
    name: 'Toronto',
    province: 'ontario',
    metroPop: '6.4M Greater Toronto Area · Canada\'s largest metro',
    uniqueHook: 'Toronto and GTA families homeschool to give children deeper preparation than overcrowded TDSB or competitive private schools (UCC, Branksome, Havergal at $40-50K CAD/year). Plus University of Toronto, Waterloo, McMaster pipeline. Tech corridor (Shopify, Wealthsimple, OpenText, RBC Borealis AI) plus banking/finance families dominate.',
    topUnis: ['University of Toronto (UofT)', 'Toronto Metropolitan University (formerly Ryerson)', 'York University', 'OCAD University', 'McMaster University (Hamilton, 1hr west)', 'University of Waterloo (1.5hr west)', 'Queen\'s University (Kingston, 2.5hr east)'],
    neighborhoods: ['Forest Hill', 'Rosedale', 'The Annex', 'Yorkville', 'Lawrence Park', 'Leaside', 'Bayview-Bridle Path', 'Etobicoke (Kingsway, Humber Valley)', 'North York (Bayview Village, Willowdale)', 'Scarborough (Bridlewood)', 'Mississauga (Lorne Park, Mineola, Port Credit)', 'Oakville', 'Burlington', 'Vaughan (Thornhill, Maple)', 'Markham (Unionville, Cornell)', 'Richmond Hill', 'Aurora', 'Newmarket', 'Brampton'],
    heroPhoto: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Toronto and Greater Toronto Area families. Built for University of Toronto, Waterloo, McMaster, and Ivy League applications. From $245 CAD/month.',
    proof: 'GTA families use Smartious to deliver Cambridge A-Level rigour at a fraction of UCC, Branksome Hall, or Havergal tuition ($40-50K CAD/year). Cambridge A-Level is recognised on equal footing with Canadian Grade 12 by UofT, Waterloo, McMaster, Queen\'s, plus Ivy League and Russell Group UK universities.',
    metaTitle: 'Online Homeschool Toronto GTA — Live Cambridge IGCSE & A-Level | UofT, Waterloo, McMaster | Smartious',
    metaDesc: 'Live online homeschool for Toronto and GTA families. Cambridge IGCSE and A-Level with real teachers. Built for UofT, Waterloo, McMaster, Queen\'s, Ivy League. From $245 CAD/month.',
    faqs: [
      { q: 'How does Smartious work with Ontario\'s one-time letter homeschool requirement?', a: 'Ontario\'s Education Act Section 21(2)(a) requires only a one-time written notice to your local school board declaring intent to homeschool — no curriculum approval needed, no annual paperwork burden, no testing required. TDSB, YRDSB, PDSB (Peel), HDSB (Halton), DSBN (Durham), and all GTA boards accept the standard one-time letter. Smartious provides transcripts and curriculum documentation for university applications.' },
      { q: 'Does Smartious help GTA families apply to University of Toronto and Waterloo?', a: 'Yes. University of Toronto (Trinity, Victoria, St. Michael\'s, University, Innis, New, Woodsworth Colleges), Waterloo (especially Computer Science, Engineering, Mathematics), McMaster (Health Sciences direct-admission, Engineering), Queen\'s, and Western all accept Cambridge IGCSE and A-Level on equal footing with Ontario Grade 12. Cambridge Further Mathematics A-Level is particularly valued by Waterloo CS and Mathematics admissions.' },
      { q: 'Which GTA neighborhoods and 905 suburbs do you serve?', a: 'All of the Greater Toronto Area including downtown Toronto (Forest Hill, Rosedale, The Annex, Yorkville, Lawrence Park, Leaside, Bayview-Bridle Path), Etobicoke (Kingsway, Humber Valley), North York (Bayview Village, Willowdale), Scarborough, plus 905 region (Mississauga, Oakville, Burlington, Vaughan, Markham, Richmond Hill, Aurora, Newmarket, Brampton). Smartious is fully online so neighborhood is irrelevant.' },
    ],
  },

  'montreal-qc': {
    name: 'Montreal',
    province: 'quebec',
    metroPop: '4.3M metro residents · Canada\'s second-largest city',
    uniqueHook: 'Montreal\'s anglophone-Quebecker, francophone, and allophone families navigate Quebec\'s uniquely demanding homeschool law (annual learning project filed with the Direction de l\'enseignement à la maison). Plus McGill (one of Canada\'s top universities), Concordia, Université de Montréal pipeline.',
    topUnis: ['McGill University', 'Concordia University', 'Université de Montréal (UdeM)', 'HEC Montréal', 'École Polytechnique', 'Université du Québec à Montréal (UQAM)', 'Université de Sherbrooke (1.5hr east)', 'Université Laval (Quebec City, 2.5hr northeast)'],
    neighborhoods: ['Westmount', 'Outremont', 'TMR (Town of Mount Royal)', 'Hampstead', 'Plateau-Mont-Royal', 'Mile End', 'NDG (Notre-Dame-de-Grâce)', 'Côte-des-Neiges', 'Pointe-Claire', 'Beaconsfield', 'Kirkland', 'Dollard-des-Ormeaux', 'Saint-Lambert', 'Brossard', 'Laval', 'Longueuil', 'Boucherville'],
    heroPhoto: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Montreal families. Built for McGill, Concordia, UdeM, HEC Montréal, Polytechnique, plus Ivy League and UK Russell Group applications.',
    proof: 'Montreal anglophone families use Smartious Cambridge IGCSE/A-Level as an English-curriculum alternative to Quebec\'s francophone-default system. McGill, Concordia, and out-of-Quebec universities (UofT, Western, Queen\'s) accept Cambridge qualifications fully. Plus Cambridge French A-Level is excellent for bilingual Montreal students.',
    metaTitle: 'Online Homeschool Montreal Quebec — Live Cambridge IGCSE & A-Level | McGill, Concordia, UdeM | Smartious',
    metaDesc: 'Live online homeschool for Montreal families. Cambridge IGCSE and A-Level for McGill, Concordia, UdeM, HEC. Quebec learning-project compatible. From $245 CAD/month.',
    faqs: [
      { q: 'How does Quebec\'s annual learning project requirement work with Smartious?', a: 'Quebec has Canada\'s most demanding homeschool law — families must file an annual learning project with the Direction de l\'enseignement à la maison (DEM) by July 1 each year, plus submit a status report mid-year and a final evaluation at year-end. Smartious provides comprehensive curriculum documentation, attendance logs, and progress reports designed to satisfy DEM review. We have experience supporting Montreal families through DEM compliance, including bilingual (English/French) documentation.' },
      { q: 'Does Smartious help Montreal families apply to McGill, Concordia, and UdeM?', a: 'Yes. McGill (Faculty of Arts, Science, Engineering, Management, Medicine direct-admit), Concordia (John Molson School of Business, Engineering, Fine Arts), and Université de Montréal all accept Cambridge IGCSE and A-Level. McGill\'s admissions explicitly list Cambridge A-Level conversions. We provide free Common App, OUAC (Ontario Universities Application Centre), and McGill direct application support including Quebec\'s CEGEP equivalency considerations.' },
      { q: 'Which Montreal neighborhoods and South Shore / West Island areas do you serve?', a: 'All of Greater Montreal including West Island (Pointe-Claire, Beaconsfield, Kirkland, Dollard-des-Ormeaux), central Montreal (Westmount, Outremont, TMR, Hampstead, Plateau-Mont-Royal, Mile End, NDG, Côte-des-Neiges), plus South Shore (Saint-Lambert, Brossard, Boucherville), Laval, and Longueuil. Smartious instruction is in English but our teachers are familiar with bilingual Quebec contexts.' },
    ],
  },

  'vancouver-bc': {
    name: 'Vancouver',
    province: 'british-columbia',
    metroPop: '2.8M Metro Vancouver',
    uniqueHook: 'Vancouver\'s tech corridor (Amazon, Microsoft, EA, Slack, Hootsuite) plus Pacific Rim international families plus UBC academic culture create a distinctive homeschool community. Plus BC\'s Distributed Learning (DL) Funding (~$600 CAD/year per child) helps offset tuition for registered families.',
    topUnis: ['University of British Columbia (UBC)', 'Simon Fraser University (SFU)', 'University of Victoria (UVic, ferry to Vancouver Island)', 'Emily Carr University of Art + Design', 'British Columbia Institute of Technology (BCIT)', 'Capilano University', 'University of Northern British Columbia (UNBC)'],
    neighborhoods: ['Shaughnessy', 'West Point Grey', 'Kerrisdale', 'Dunbar', 'Kitsilano', 'False Creek', 'Yaletown', 'West Vancouver (British Properties, Caulfeild, Ambleside)', 'North Vancouver (Edgemont, Lynn Valley, Capilano)', 'Burnaby (Burnaby Mountain, Forest Glen)', 'Richmond (Steveston, Terra Nova)', 'Surrey (South Surrey, White Rock)', 'Coquitlam (Westwood Plateau)', 'Port Moody', 'Langley', 'New Westminster'],
    heroPhoto: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Vancouver and Metro Vancouver families. Built for UBC, SFU, UVic, and Pacific Rim international university applications. BC DL Funding eligible. From $245 CAD/month.',
    proof: 'Vancouver families benefit from BC\'s Distributed Learning Funding (~$600 CAD/year per registered child) plus Smartious Cambridge IGCSE/A-Level rigour for UBC Sauder, UBC Engineering, and SFU Beedie applications. International families particularly benefit — Cambridge A-Level is recognised globally, supporting future moves to UK, Australia, US, or back to home country.',
    metaTitle: 'Online Homeschool Vancouver BC — Live Cambridge IGCSE & A-Level | UBC, SFU, UVic | Smartious',
    metaDesc: 'Live online homeschool for Vancouver and Metro Vancouver families. Cambridge IGCSE and A-Level for UBC-tracking students. BC DL Funding eligible. From $245 CAD/month.',
    faqs: [
      { q: 'How does BC Distributed Learning (DL) Funding work with Smartious?', a: 'BC offers Distributed Learning Funding (~$600 CAD/year per child) to families who register their child with a BC-approved DL school. Smartious is an international online school (not BC-registered), so families using Smartious typically pair us with a BC DL school for funding purposes — our Cambridge IGCSE/A-Level academics combined with DL school registration. Alternatively, families file simple "registered homeschooler" status with their local school district (no funding, no oversight beyond annual notification).' },
      { q: 'Does Smartious help Vancouver families apply to UBC and SFU?', a: 'Yes. University of British Columbia (Sauder School of Business, Faculty of Applied Science, Faculty of Science, Faculty of Arts), Simon Fraser University (Beedie School of Business, Faculty of Applied Sciences), and University of Victoria (Gustavson School of Business) all accept Cambridge IGCSE and A-Level. UBC\'s broad-based admission process particularly values Cambridge A-Level rigour. We provide free university application support including UBC and SFU direct applications.' },
      { q: 'Which Metro Vancouver neighborhoods do you serve?', a: 'All of Metro Vancouver including Vancouver West (Shaughnessy, West Point Grey, Kerrisdale, Dunbar, Kitsilano), False Creek/Yaletown, West Vancouver (British Properties, Caulfeild), North Vancouver (Edgemont, Lynn Valley), Burnaby (Burnaby Mountain), Richmond (Steveston, Terra Nova), Surrey (South Surrey, White Rock), Tri-Cities (Coquitlam, Port Moody), Langley, and New Westminster. All Metro Vancouver families access identical service.' },
    ],
  },

  'calgary-ab': {
    name: 'Calgary',
    province: 'alberta',
    metroPop: '1.7M metro residents',
    uniqueHook: 'Calgary\'s energy industry families (oil and gas, executives at Suncor, Cenovus, Imperial Oil, CNRL, plus pipeline and engineering firms) homeschool to align with frequent business travel. Plus Alberta\'s universal Home Education Funding ($850 CAD per child per year) covers a meaningful chunk of Smartious tuition.',
    topUnis: ['University of Calgary (U of C)', 'Mount Royal University', 'SAIT (Southern Alberta Institute of Technology)', 'Ambrose University', 'University of Alberta (Edmonton, 3hr north)', 'University of Lethbridge (2hr south)', 'Athabasca University (online)'],
    neighborhoods: ['Mount Royal', 'Elbow Park', 'Britannia', 'Bel-Aire', 'Eagle Ridge', 'Aspen Woods', 'Springbank Hill', 'Strathcona Park', 'West Hillhurst', 'Mount Pleasant', 'Crescent Heights', 'Tuscany', 'Royal Oak', 'Panorama Hills', 'Evanston', 'Cranston', 'McKenzie Towne', 'Auburn Bay', 'Mahogany', 'Airdrie', 'Cochrane', 'Okotoks', 'Chestermere'],
    heroPhoto: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Calgary and Southern Alberta families. Built for University of Calgary, Mount Royal, SAIT, plus US/UK university applications. Alberta Home Education Funding ($850 CAD/child) eligible. From $245 CAD/month.',
    proof: 'Calgary energy-industry families pair Smartious Cambridge A-Level with Alberta\'s universal Home Education Funding ($850 CAD/year per child via a board-of-record like Mosaic, Wisdom, Wendell). Cambridge A-Level rigour strengthens U of Calgary Schulich, Haskayne Business School, and U of Alberta engineering applications.',
    metaTitle: 'Online Homeschool Calgary Alberta — Live Cambridge IGCSE & A-Level | U of C, Mount Royal | Smartious',
    metaDesc: 'Live online homeschool for Calgary and Southern Alberta families. Cambridge IGCSE and A-Level — Alberta Home Education Funding eligible. Built for U of C, Mount Royal, SAIT. From $245 CAD/month.',
    faqs: [
      { q: 'How does Alberta\'s Home Education Funding work with Smartious?', a: 'Alberta has the most generous homeschool funding in Canada — $850 CAD per child per year, universal regardless of income. Families register with a board-of-record (Wisdom Home Schooling, Mosaic Home Education, Wendell Home Education, others). The board-of-record provides the funding (some refund the full $850 to families to spend on educational resources; others provide curriculum vendors directly). Smartious tuition can be paid using these funds at most boards-of-record.' },
      { q: 'Does Smartious help Calgary families apply to University of Calgary and U of Alberta?', a: 'Yes. University of Calgary (Schulich School of Engineering, Haskayne School of Business, Cumming School of Medicine direct-admit), Mount Royal University, SAIT, and University of Alberta (Edmonton — Faculty of Engineering, Alberta School of Business) all accept Cambridge IGCSE and A-Level. We provide free Common App, OUAC (for Ontario universities), and Canadian university application support.' },
      { q: 'Which Calgary neighborhoods and Foothills areas do you serve?', a: 'All of Greater Calgary including inner-city (Mount Royal, Elbow Park, Britannia, Bel-Aire, Eagle Ridge), West (Aspen Woods, Springbank Hill, Strathcona Park, West Hillhurst, Mount Pleasant), North (Crescent Heights, Tuscany, Royal Oak, Panorama Hills, Evanston), South (Cranston, McKenzie Towne, Auburn Bay, Mahogany). Plus Foothills towns (Airdrie, Cochrane, Okotoks, Chestermere). All Calgary Region families access identical service.' },
    ],
  },

  'winnipeg-mb': {
    name: 'Winnipeg',
    province: 'manitoba',
    metroPop: '835K Winnipeg census metropolitan area',
    uniqueHook: 'Winnipeg families benefit from Manitoba\'s light homeschool oversight (one-time annual notification, no curriculum approval, no required testing) plus University of Manitoba, University of Winnipeg, and Brandon University pipeline. Multicultural families (Filipino, Indian, South Sudanese, East African communities) increasingly homeschool for academic depth and cultural preservation.',
    topUnis: ['University of Manitoba (U of M)', 'University of Winnipeg (U of W)', 'Brandon University', 'Canadian Mennonite University', 'Booth University College', 'Red River College Polytechnic', 'University of Saskatchewan (Saskatoon, 7hr west)'],
    neighborhoods: ['River Heights', 'Tuxedo', 'Crescentwood', 'Wellington Crescent', 'Lindenwoods', 'Whyte Ridge', 'Linden Woods', 'Wildwood Park', 'Tuxedo Park', 'Charleswood', 'Westwood', 'St. Vital', 'St. Boniface', 'St. James-Assiniboia', 'Headingley', 'East St. Paul', 'West St. Paul', 'Selkirk', 'Stonewall', 'Steinbach', 'Winkler'],
    heroPhoto: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Winnipeg and Manitoba families. Built for University of Manitoba, University of Winnipeg, Brandon University, plus out-of-province and international university applications. From $245 CAD/month.',
    proof: 'Winnipeg families benefit from Manitoba\'s simple one-time annual homeschool notification (no curriculum approval, no testing required) plus Cambridge A-Level rigour strengthening U of M, U of W, and out-of-Manitoba applications (UofT, McGill, UBC). Plus multicultural families value Cambridge\'s international portability.',
    metaTitle: 'Online Homeschool Winnipeg Manitoba — Live Cambridge IGCSE & A-Level | U of M, U of W | Smartious',
    metaDesc: 'Live online homeschool for Winnipeg and Manitoba families. Cambridge IGCSE and A-Level with Manitoba\'s light homeschool oversight. Built for U of M, U of W, Brandon. From $245 CAD/month.',
    faqs: [
      { q: 'How does Manitoba\'s homeschool notification work for Winnipeg families?', a: 'Manitoba\'s Education Administration Act requires only a one-time annual notification to the Manitoba Education and Training Department (filed by September 1 each year) declaring intent to homeschool. No curriculum approval required, no testing mandated, no annual portfolio submission. Smartious provides transcripts and curriculum documentation for university applications. Winnipeg School Division, Pembina Trails, Louis Riel, River East Transcona, and St. James-Assiniboia all follow the same provincial framework.' },
      { q: 'Does Smartious help Winnipeg families apply to University of Manitoba and University of Winnipeg?', a: 'Yes. University of Manitoba (Asper School of Business, Faculty of Engineering, Max Rady College of Medicine direct-admission, Faculty of Science), University of Winnipeg, and Brandon University all accept Cambridge IGCSE and A-Level. U of M\'s Faculty of Engineering and Medicine particularly value Cambridge A-Level Mathematics, Physics, Biology, and Chemistry depth.' },
      { q: 'Which Winnipeg neighborhoods and surrounding areas do you serve?', a: 'All of Greater Winnipeg including River Heights, Tuxedo, Crescentwood, Wellington Crescent, Lindenwoods, Whyte Ridge, Linden Woods, Wildwood Park, plus suburbs (Charleswood, Westwood, St. Vital, St. Boniface, St. James-Assiniboia, Headingley, East St. Paul, West St. Paul). Plus surrounding (Selkirk, Stonewall, Steinbach, Winkler). All Manitoba families access identical service.' },
    ],
  },

  'saskatoon-sk': {
    name: 'Saskatoon',
    province: 'saskatchewan',
    metroPop: '335K Saskatoon census metropolitan area',
    uniqueHook: 'Saskatoon hosts the University of Saskatchewan (one of Canada\'s top medical, agricultural, and veterinary universities, plus the Canadian Light Source synchrotron) — academic, medical, and agricultural families homeschool for deeper preparation. Plus Saskatchewan\'s school-division-dependent funding (varies by division, ~$500-$1,500 CAD/year for registered families).',
    topUnis: ['University of Saskatchewan (U of S)', 'Saskatchewan Polytechnic', 'St. Thomas More College', 'University of Regina (Regina, 2.5hr south)', 'Western College of Veterinary Medicine (U of S)', 'College of Medicine U of S'],
    neighborhoods: ['Nutana', 'Varsity View', 'River Heights', 'Grosvenor Park', 'Stonebridge', 'Willowgrove', 'Briarwood', 'Lakeridge', 'University Heights', 'Greystone Heights', 'College Park', 'Sutherland', 'Forest Grove', 'Silverwood Heights', 'Lawson Heights', 'Hampton Village', 'Evergreen', 'Rosewood', 'Warman', 'Martensville', 'Osler'],
    heroPhoto: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Saskatoon and Saskatchewan families. Built for University of Saskatchewan College of Medicine, Western College of Veterinary Medicine, Saskatchewan Polytechnic. From $245 CAD/month.',
    proof: 'Saskatoon families benefit from Western College of Veterinary Medicine (Canada\'s only veterinary school west of Guelph) plus U of S College of Medicine pipeline. Cambridge A-Level Biology + Chemistry depth is particularly strong preparation for these competitive admissions. Saskatchewan school division funding (varies, ~$500-$1,500 CAD/year) helps offset Smartious tuition.',
    metaTitle: 'Online Homeschool Saskatoon Saskatchewan — Live Cambridge IGCSE & A-Level | U of S, WCVM | Smartious',
    metaDesc: 'Live online homeschool for Saskatoon and Saskatchewan families. Cambridge IGCSE and A-Level — eligible for Saskatchewan school division funding. Built for U of S, WCVM, College of Medicine. From $245 CAD/month.',
    faqs: [
      { q: 'How does Saskatchewan homeschool funding work for Saskatoon families?', a: 'Saskatchewan homeschool funding varies by school division — Saskatoon Public Schools, Greater Saskatoon Catholic Schools, and Prairie Spirit School Division each have different funding structures (typically $500-$1,500 CAD per child per year for registered homeschool families). Families register with their division\'s home education office and submit annual educational plans. Smartious provides curriculum documentation and progress reports designed to satisfy division registration requirements.' },
      { q: 'Does Smartious help Saskatoon families apply to U of S College of Medicine and Western College of Veterinary Medicine?', a: 'Yes. University of Saskatchewan College of Medicine (direct-admission pathways) and Western College of Veterinary Medicine (Canada\'s only English-language vet school west of Ontario) both accept Cambridge IGCSE and A-Level. Cambridge A-Level Biology + Chemistry pairs particularly well with these admissions. Edwards School of Business, Faculty of Engineering, and Faculty of Agriculture also welcome Cambridge-strengthened applications.' },
      { q: 'Which Saskatoon neighborhoods and surrounding areas do you serve?', a: 'All of Greater Saskatoon including Nutana, Varsity View, River Heights, Grosvenor Park, Stonebridge, Willowgrove, Briarwood, Lakeridge, University Heights, Greystone Heights, College Park, Sutherland, Forest Grove, Silverwood Heights, Lawson Heights, Hampton Village, Evergreen, Rosewood. Plus surrounding (Warman, Martensville, Osler). All Saskatoon Region families access identical service.' },
    ],
  },

  'halifax-ns': {
    name: 'Halifax',
    province: 'nova-scotia',
    metroPop: '465K Halifax Regional Municipality',
    uniqueHook: 'Halifax hosts Dalhousie University (one of Canada\'s top research universities), Saint Mary\'s, MSVU (Mount Saint Vincent), University of King\'s College, plus CFB Halifax (Canadian Forces Base Halifax, largest east-coast military base) plus maritime culture. Distinctive Atlantic Canadian academic-and-military homeschool community.',
    topUnis: ['Dalhousie University', 'Saint Mary\'s University', 'Mount Saint Vincent University (MSVU)', 'University of King\'s College', 'NSCAD University (Nova Scotia College of Art and Design)', 'St. Francis Xavier University (Antigonish, 3hr east)', 'Acadia University (Wolfville, 1hr west)', 'Cape Breton University (Sydney, 4hr east)'],
    neighborhoods: ['South End Halifax', 'West End Halifax', 'North End Halifax', 'Halifax Peninsula', 'Bedford', 'Sackville', 'Cole Harbour', 'Dartmouth (Downtown Dartmouth, Westphal, Eastern Passage)', 'Clayton Park', 'Fairview', 'Spryfield', 'Timberlea', 'Tantallon', 'Hammonds Plains', 'Fall River', 'Windsor Junction', 'Wolfville (Acadia, 1hr west)'],
    heroPhoto: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Halifax and Nova Scotia families. Built for Dalhousie University, Saint Mary\'s, MSVU, St. FX, Acadia, and CFB Halifax military family schedule flexibility. From $245 CAD/month.',
    proof: 'Halifax families benefit from Nova Scotia\'s light homeschool oversight (annual notification) plus the densest concentration of universities in Atlantic Canada (Dalhousie + Saint Mary\'s + MSVU + King\'s College + NSCAD within Halifax). Cambridge A-Level strengthens Dalhousie pre-medicine, marine biology, and engineering applications. Plus CFB Halifax military families benefit from deployment-proof live online education.',
    metaTitle: 'Online Homeschool Halifax Nova Scotia — Live Cambridge IGCSE & A-Level | Dalhousie, Saint Mary\'s | Smartious',
    metaDesc: 'Live online homeschool for Halifax and Nova Scotia families. Cambridge IGCSE and A-Level for Dalhousie-tracking and CFB Halifax military families. From $245 CAD/month.',
    faqs: [
      { q: 'How does Nova Scotia homeschool law work for Halifax families?', a: 'Nova Scotia\'s Education Act requires annual notification to the Halifax Regional School Board (or relevant regional board) by September 30 each year — no curriculum approval needed, no testing mandated. Smartious provides curriculum documentation and transcripts for university applications. Halifax Regional Centre for Education, Annapolis Valley Regional Centre, Strait Regional Centre, and other Nova Scotia school boards all follow the same provincial framework.' },
      { q: 'Does Smartious help Halifax families apply to Dalhousie and Saint Mary\'s?', a: 'Yes. Dalhousie University (Faculty of Medicine, Faculty of Architecture, Schulich School of Law, Faculty of Engineering, Rowe School of Business, Faculty of Computer Science), Saint Mary\'s University (Sobey School of Business), MSVU, and University of King\'s College all accept Cambridge IGCSE and A-Level. Dalhousie\'s pre-medicine pathway and Faculty of Engineering particularly value Cambridge A-Level rigour.' },
      { q: 'Which Halifax and Nova Scotia areas do you serve?', a: 'All of Halifax Regional Municipality including South End Halifax, West End Halifax, North End Halifax, Halifax Peninsula, Bedford, Sackville, Cole Harbour, Dartmouth (Downtown Dartmouth, Westphal, Eastern Passage), Clayton Park, Fairview, Spryfield, Timberlea. Plus Tantallon, Hammonds Plains, Fall River, Windsor Junction, and Wolfville (Acadia University region). All Nova Scotia families access identical service.' },
    ],
  },

  'moncton-nb': {
    name: 'Moncton',
    province: 'new-brunswick',
    metroPop: '160K Greater Moncton',
    uniqueHook: 'Moncton is Canada\'s most bilingual city — anglophone and francophone families balance both languages. Université de Moncton is one of Canada\'s leading francophone universities outside Quebec. Mount Allison (Sackville, 45min south) is one of Canada\'s top primarily-undergraduate liberal arts universities. Plus Magnetic Hill region\'s growing tech and tourism corridor.',
    topUnis: ['Université de Moncton', 'Mount Allison University (Sackville, 45min south)', 'University of New Brunswick (UNB Fredericton, 1.5hr west)', 'Atlantic Baptist University (Crandall University)', 'St. Thomas University (Fredericton)', 'Cape Breton University (3hr southeast, NS)'],
    neighborhoods: ['West End Moncton', 'North End Moncton', 'Sunny Brae', 'Riverview', 'Dieppe (Champlain, Notre-Dame, Saint-Anselme)', 'Memramcook', 'Shediac', 'Sackville (Mount Allison)', 'Salisbury', 'Petitcodiac', 'Saint John (NB, 2hr south)', 'Fredericton (NB, 1.5hr west)'],
    heroPhoto: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Moncton and Greater Moncton families. Built for Université de Moncton, Mount Allison, UNB, and bilingual New Brunswick families. From $245 CAD/month.',
    proof: 'Moncton bilingual families benefit from Cambridge IGCSE/A-Level\'s English-language instruction strengthening university applications across Canada, US, UK, and globally. Cambridge French A-Level is excellent for francophone students. New Brunswick\'s light homeschool oversight (annual notification) makes Smartious straightforward to combine with provincial requirements.',
    metaTitle: 'Online Homeschool Moncton New Brunswick — Live Cambridge IGCSE & A-Level | Université de Moncton, Mount Allison | Smartious',
    metaDesc: 'Live online homeschool for Moncton and Greater Moncton families. Cambridge IGCSE and A-Level for bilingual New Brunswick families. Built for U de Moncton, Mount Allison, UNB. From $245 CAD/month.',
    faqs: [
      { q: 'How does New Brunswick homeschool law work for Moncton families?', a: 'New Brunswick\'s Education Act requires annual notification to the local school district (Anglophone East School District for anglophone Moncton families, Conseil des écoles publiques du Sud for francophone Moncton families) — no curriculum approval, no testing mandated. Smartious provides curriculum documentation and transcripts for university applications. Both Anglophone and Francophone school districts in New Brunswick follow the same provincial framework.' },
      { q: 'Does Smartious help Moncton bilingual families balance English and French?', a: 'Yes. Smartious instruction is in English (Cambridge IGCSE/A-Level) — strengthening English-language university applications across Canada, US, UK, Ireland, Australia, and globally. French is preserved at home and through Cambridge French 7156 IGCSE / 9716 A-Level offerings (we support French as a Cambridge subject for native or near-native speakers). This combination is ideal for bilingual Moncton families: rigorous English instruction during the day, French at home and through Cambridge French qualifications.' },
      { q: 'Which Moncton and Southeastern NB areas do you serve?', a: 'All of Greater Moncton including West End Moncton, North End Moncton, Sunny Brae, Riverview, Dieppe (Champlain, Notre-Dame, Saint-Anselme), Memramcook, Shediac, Sackville (Mount Allison), Salisbury, Petitcodiac. Plus families in Saint John (2hr south) and Fredericton (1.5hr west). All New Brunswick families access identical service.' },
    ],
  },

  'st-johns-nl': {
    name: 'St. John\'s',
    province: 'newfoundland-and-labrador',
    metroPop: '215K St. John\'s metro',
    uniqueHook: 'St. John\'s is North America\'s easternmost major city (Newfoundland Time UTC-3:30, half-hour offset from Atlantic Time) — Memorial University of Newfoundland (MUN, lowest in-province tuition in Canada), plus iceberg-coast culture and rich Newfoundland-Labrador heritage create a unique homeschool community. Plus offshore oil families and university researchers.',
    topUnis: ['Memorial University of Newfoundland (MUN — St. John\'s campus)', 'Memorial University Grenfell Campus (Corner Brook, 7hr west)', 'College of the North Atlantic', 'Dalhousie (Halifax, NS — ferry from Argentia)', 'Mount Saint Vincent (Halifax, NS)'],
    neighborhoods: ['Old St. John\'s (Battery, Signal Hill area)', 'Downtown St. John\'s', 'Pleasantville', 'East End St. John\'s', 'West End St. John\'s', 'Cowan Heights', 'Mount Pearl', 'Paradise', 'Conception Bay South (CBS)', 'Portugal Cove-St. Philip\'s', 'Torbay', 'Pouch Cove', 'Bay Bulls', 'Witless Bay'],
    heroPhoto: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for St. John\'s and Newfoundland-Labrador families. Built for Memorial University (MUN), plus mainland Canada and international university applications. From $245 CAD/month.',
    proof: 'Newfoundland families benefit from MUN (Memorial University of Newfoundland — Canada\'s second-largest university by enrollment with the lowest in-province undergraduate tuition) plus Smartious live online instruction across Canada\'s unique time zone (Newfoundland Time UTC-3:30). Cambridge A-Level rigour particularly strengthens MUN Faculty of Medicine and Faculty of Engineering applications.',
    metaTitle: 'Online Homeschool St. John\'s Newfoundland — Live Cambridge IGCSE & A-Level | Memorial University (MUN) | Smartious',
    metaDesc: 'Live online homeschool for St. John\'s and Newfoundland-Labrador families. Cambridge IGCSE and A-Level for MUN-tracking and mainland Canada university applications. From $245 CAD/month.',
    faqs: [
      { q: 'How does live online schooling work across Newfoundland Time (UTC-3:30)?', a: 'Newfoundland and Labrador uses Newfoundland Time (UTC-3:30), a half-hour offset from Atlantic Time. Smartious live classes run 9:30 AM – 6:30 PM Newfoundland Time (mapping to our standard EAT teaching hours — 4:30 PM – 1:30 AM EAT for Smartious tutors). All sessions are recorded so the time zone offset is never a barrier — families can review live sessions later. Many St. John\'s families do half-live, half-recorded learning rhythm.' },
      { q: 'Does Smartious help Newfoundland families apply to Memorial University (MUN)?', a: 'Yes. Memorial University of Newfoundland (Faculty of Medicine direct-admission pathway, Faculty of Engineering and Applied Science, Faculty of Business Administration, Faculty of Science, MUN Grenfell Campus liberal arts) all accept Cambridge IGCSE and A-Level. MUN has the lowest in-province tuition in Canada, making Cambridge A-Level academic depth highly valuable for competitive MUN admissions. We provide free Common App and Canadian university application support.' },
      { q: 'Which Newfoundland and Labrador areas do you serve?', a: 'All of Greater St. John\'s including Old St. John\'s (Battery, Signal Hill area), Downtown St. John\'s, Pleasantville, East End St. John\'s, West End St. John\'s, Cowan Heights, Mount Pearl, Paradise, Conception Bay South (CBS), Portugal Cove-St. Philip\'s, Torbay, Pouch Cove, Bay Bulls, Witless Bay. Plus families in Corner Brook (MUN Grenfell Campus, 7hr west) and Labrador City. All Newfoundland-Labrador families access identical service.' },
    ],
  },

  'charlottetown-pe': {
    name: 'Charlottetown',
    province: 'prince-edward-island',
    metroPop: '83K Charlottetown census metropolitan area',
    uniqueHook: 'Charlottetown is the birthplace of Canadian Confederation (1864 Charlottetown Conference) — UPEI (University of Prince Edward Island) hosts the Atlantic Veterinary College (one of five Canadian veterinary schools). Plus PEI\'s agricultural and tourism heritage (potatoes, lobster, Anne of Green Gables) and rapidly growing biotech sector make for distinctive Prince Edward Island homeschool culture.',
    topUnis: ['University of Prince Edward Island (UPEI)', 'Atlantic Veterinary College (AVC at UPEI)', 'Holland College', 'Maritime Christian College', 'Dalhousie University (Halifax, NS — ferry from Wood Islands or Northumberland Strait Bridge)', 'University of New Brunswick (Fredericton, 4hr via bridge)'],
    neighborhoods: ['Brighton', 'East Royalty', 'West Royalty', 'Sherwood', 'Spring Park', 'Parkdale', 'Hillsborough Park', 'Cornwall', 'Stratford', 'North Rustico', 'Cavendish (Anne of Green Gables)', 'Summerside (1hr west)', 'Souris (1hr east)', 'Montague', 'Kensington', 'O\'Leary'],
    heroPhoto: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1600&q=75',
    pitch: 'Live Cambridge IGCSE & A-Level for Charlottetown and Prince Edward Island families. Built for UPEI (especially Atlantic Veterinary College), Dalhousie, plus mainland Canada and international applications. From $245 CAD/month.',
    proof: 'PEI families benefit from UPEI\'s Atlantic Veterinary College (one of Canada\'s five vet schools) plus PEI\'s light homeschool oversight (annual notification, no testing required). Cambridge A-Level Biology + Chemistry is uniquely strong preparation for AVC veterinary admissions and UPEI Faculty of Science. Smartious live online instruction works seamlessly across PEI\'s small geographic footprint.',
    metaTitle: 'Online Homeschool Charlottetown PEI — Live Cambridge IGCSE & A-Level | UPEI, Atlantic Veterinary College | Smartious',
    metaDesc: 'Live online homeschool for Charlottetown and Prince Edward Island families. Cambridge IGCSE and A-Level for UPEI-tracking and Atlantic Veterinary College families. From $245 CAD/month.',
    faqs: [
      { q: 'How does PEI homeschool law work for Charlottetown families?', a: 'Prince Edward Island\'s School Act requires annual notification to the Public Schools Branch (or French-language Commission scolaire de langue française) — no curriculum approval needed, no testing mandated, no annual portfolio review. Smartious provides curriculum documentation and transcripts for university applications. PEI families have access to Atlantic Provinces Reciprocity for university transfer (allowing easy applications across NS, NB, NL universities).' },
      { q: 'Does Smartious help PEI families apply to UPEI Atlantic Veterinary College?', a: 'Yes. UPEI Atlantic Veterinary College (AVC — one of Canada\'s five accredited veterinary schools, serving all four Atlantic provinces) accepts Cambridge IGCSE and A-Level. Cambridge A-Level Biology + Chemistry depth is particularly strong preparation for AVC\'s highly competitive admissions. UPEI Faculty of Science, Faculty of Arts, School of Business, and Faculty of Education all welcome Cambridge-strengthened applications.' },
      { q: 'Which Prince Edward Island areas do you serve?', a: 'All of Prince Edward Island including Greater Charlottetown (Brighton, East Royalty, West Royalty, Sherwood, Spring Park, Parkdale, Hillsborough Park, Cornwall, Stratford), plus North Shore (North Rustico, Cavendish — Anne of Green Gables region), West (Summerside, Kensington, O\'Leary), and East (Souris, Montague). All PEI families across Queens County, Kings County, and Prince County access identical service. Plus Atlantic Canadian families in Cape Breton (NS) and Magdalen Islands (QC).' },
    ],
  },

};

export const CA_CITIES_LIST = Object.keys(CA_CITIES);

// Cities grouped by province slug for province-landing page integration
export const CA_CITIES_BY_PROVINCE = CA_CITIES_LIST.reduce((acc, slug) => {
  const city = CA_CITIES[slug];
  if (!acc[city.province]) acc[city.province] = [];
  acc[city.province].push(slug);
  return acc;
}, {});
