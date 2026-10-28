// South African city data for Smartious Homeschool
// Schema mirrors kenyaCities/ethiopiaCities/rwandaCities so the city renderer is shared.
// 14 places — Johannesburg, Cape Town, Pretoria, Durban, Gqeberha (PE), Stellenbosch,
// and (October 2026) Centurion, Umhlanga and Ballito, Somerset West, Bloemfontein,
// Polokwane, Mbombela, George and the Garden Route, East London.
// URL pattern: /homeschool-<city-slug>-za

export const SOUTH_AFRICA_CITIES = [
  {
    slug: 'johannesburg-za',
    name: 'Johannesburg',
    county: 'Gauteng',
    region: 'Economic capital · Sandton financial district · 5.7M residents',
    primaryKeyword: 'Online homeschooling in Johannesburg',
    heroTagline: 'For Sandton, Rosebank, Hyde Park, Bryanston, Houghton families — financial professionals, AISJ alternative-seekers, and SA families considering semigration to UK, Australia, Canada.',
    intro: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Johannesburg families across Sandton, Rosebank, Hyde Park, Houghton, Parkhurst, Melville, Greenside, Bryanston, Fourways, Randburg, Roodepoort, Soweto, Edenvale and all Johannesburg suburbs. Built for Sandton financial district families, AISJ (American International School of Johannesburg), St. Stithians, King Edward (KES), Roedean, St. John\'s College alternative-seekers, and SA families considering semigration to the UK, Australia, Canada, or UAE who want Cambridge curriculum portability built into their child\'s education.',
    heroImg: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Johannesburg Sandton skyline showing financial district high-rise buildings' },
    seoDesc: 'Live online homeschooling for Johannesburg families. Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, American AP. From USD 423/month (~ZAR 7,700). Lower than Brainline, Cambridge Home School Online, Wingu Academy. AISJ, St. Stithians, St. John\'s College alternative.',
    challenges: [
      'Private school tuition pressure: top Johannesburg private schools — St. John\'s College (R230,000+/year), Roedean (R200,000+/year), St. Stithians (R200,000+/year), King Edward VII (R150,000+/year), AISJ (USD 22,000-30,000/year) — represent meaningful financial commitment even for affluent Sandton, Hyde Park, Houghton families.',
      'Load shedding (Stage 2-6) disrupts in-person school schedules. Online instruction with recorded sessions provides resilience — lessons missed during outages are easily recovered through asynchronous review.',
      'Semigration consideration: significant Johannesburg professional families are evaluating moves to the UK, Australia, Canada, UAE, Mauritius, or Portugal over 2-5 year horizons. Cambridge curriculum provides international portability — children don\'t need transcript reconciliation or curriculum bridging on emigration.',
      'Existing local online schools (Brainline, Impaq, Cambridge Home School Online, Wingu Academy, ADvTech Online School, Crawford Online) are well-established competitors. Smartious differentiates on live Cambridge-trained PGCE teachers, smaller class sizes (4-6 students Online tier), 14-country student community, and pricing meaningfully below UK-based Cambridge Home School Online.',
      'Johannesburg traffic congestion (M1 highway, William Nicol, Jan Smuts corridor during morning rush) creates 1-2 hour daily school commutes for families in Sandton, Bryanston, Fourways, Randburg.',
      'BELA Act 2024 implementation has clarified DBE provincial homeschool registration requirements. Smartious provides curriculum, scheme of work, and assessment documentation supporting Gauteng Department of Education compliance.',
    ],
    familySituations: [
      'Sandton, Hyde Park, Houghton, Parkhurst financial professional families considering semigration.',
      'AISJ (American International School of Johannesburg) alternative-seekers wanting international curriculum without USD 22,000-30,000/year tuition.',
      'St. Stithians, St. John\'s College, KES, Roedean alternative-seekers wanting Cambridge curriculum at lower cost.',
      'Johannesburg corporate transfer families (multinational professionals on 2-5 year SA postings) wanting curriculum portability.',
      'Soweto, Mondeor, Lenasia middle-class professional families seeking quality online schooling beyond local schools.',
      'Mixed-nationality families (SA parent + international spouse) wanting bilingual curriculum and international university preparation.',
      'Older students (Grades 9-12) pivoting from NSC pathway to Cambridge IGCSE/A-Level for international university applications.',
    ],
    nearbyAreas: ['Sandton', 'Rosebank', 'Hyde Park', 'Houghton', 'Parkhurst', 'Melville', 'Greenside', 'Bryanston', 'Fourways', 'Randburg', 'Roodepoort', 'Soweto', 'Edenvale', 'Bedfordview', 'Kempton Park', 'Alberton', 'Germiston', 'Boksburg', 'Benoni', 'Krugersdorp', 'Lenasia', 'Mondeor', 'Glenvista', 'Linksfield', 'Saxonwold', 'Parkwood', 'Westcliff', 'Northcliff', 'Linden', 'Emmarentia', 'Constantia Kloof', 'Honeydew'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Humanities (Geography, History, Global Perspectives, Economics, Business Studies, Accounting)',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Accounting, Psychology, Sociology, English Literature',
      'Pearson Edexcel International GCSE and International A-Level subjects',
      'IB Diploma — all six groups including Theory of Knowledge and Extended Essay supervision',
      'American Curriculum — AP Mathematics (Calculus AB/BC, Statistics), AP Sciences, AP English, AP Social Sciences',
      'SAT, ACT, IELTS, TOEFL test preparation',
      'Afrikaans, isiZulu, Sesotho language support available alongside English-medium academic instruction',
    ],
    whyChoose: [
      ['Lower than Cambridge Home School Online', 'From USD 423/month (~ZAR 7,700), paid termly. Cambridge Home School Online (UK-based) typically charges R6,000-R10,000/month. Smartious delivers the same Cambridge curriculum at meaningfully lower cost from the Africa time zone.'],
      ['Live Cambridge-trained PGCE teachers, not recorded content', 'Many local online schools rely heavily on pre-recorded video lessons with light tutor support. Smartious is live online — every class is taught real-time by a Cambridge-trained PGCE teacher with subject specialism. Recordings are supplementary, not primary.'],
      ['SAST live class scheduling matching SA school hours', 'Live classes run 9 AM – 6 PM SAST (UTC+2) — exactly matching Johannesburg school hours. Same time zone as Cape Town, Pretoria, Durban — no scheduling complexity.'],
      ['Load shedding resilience built in', 'Every Smartious live class is recorded automatically. Stage 4-6 load shedding outages don\'t cost lessons — students review missed content asynchronously and join the next live session caught up.'],
      ['Cambridge exam access via British Council Johannesburg', 'British Council Johannesburg (Parktown) and various Cambridge-authorised SA centres (Crawford, AISJ, ISASA member schools) host Cambridge IGCSE and A-Level examinations during May/November series.'],
      ['Semigration-ready curriculum portability', 'For Johannesburg families considering UK, Australia, Canada, UAE, Mauritius, Portugal moves over 2-5 year horizons, Cambridge IGCSE/A-Level qualifications transfer seamlessly. No transcript reconciliation, no curriculum bridging, no missed academic year.'],
    ],
    growingReason: 'Johannesburg as South Africa\'s economic capital — Sandton being the highest concentration of corporate headquarters on the African continent — creates significant demand for international curriculum delivery. The combination of multinational corporate transfer families, ambitious SA professional families considering semigration, AISJ and top private school alternative-seekers, plus the established homeschool culture (SA has Africa\'s largest formal homeschool sector at 100,000+ families) makes Johannesburg the largest single market for live online Cambridge curriculum delivery on the African continent — bigger than Nairobi, Lagos, Cairo, or Addis Ababa.',
    curricula: {
      cambridge: 'Cambridge IGCSE (Grades 10-11) and A-Level (Grades 11-12) — Smartious\'s primary offer for Johannesburg families. British Council Johannesburg (Parktown) plus Cambridge-authorised SA centres host examinations. Pathway accepted by Wits, UCT, Stellenbosch, UP, UJ, plus UK Russell Group, US Ivy League, Canadian U15, Australian Group of Eight universities. Students without the NSC enter SA universities through a USAf exemption based on their AS and A Level results, and each faculty sets its own requirements.',
      cbc: 'Available for Johannesburg families with Kenyan citizenship ties or considering Kenya relocation.',
      ib: 'IB Diploma Programme (DP) — Grades 11-12 — full six-group delivery with TOK and Extended Essay supervision. AISJ alternative-seekers often choose IB DP given AISJ\'s IB curriculum.',
      american: 'American Curriculum — Common Core-aligned through Grade 8, then AP courses for Grades 9-12. Particularly suited to AISJ alternative families and US-based diaspora returnees.',
    },
    homeschoolDetail: 'Johannesburg families register with the Gauteng Department of Education under the BELA Act 2024 homeschool framework. Smartious provides comprehensive curriculum, scheme of work, assessment documentation, and progress reports suitable for Gauteng DBE compliance. For families wanting both NSC (National Senior Certificate) and Cambridge qualifications, parallel pathway documentation is supported.',
    homeTuitionDetail: 'Premium 1-on-1 support (USD 15/hour) includes premium 1-on-1 live online with optional in-person home tuition supplementation for Sandton, Rosebank, Hyde Park, Houghton families during examination preparation periods. Most instruction is live online via the Smartious LMS.',
    onlineLearningDetail: 'Live online Cambridge IGCSE, A-Level, Edexcel, IB Diploma and American AP delivered via Smartious LMS. Classes scheduled in South Africa Standard Time (SAST, UTC+2) exactly matching Johannesburg local time. Class sizes 4-6 students for Online tier, smaller groups for Online Plus, 1-on-1 for Premium. Recorded sessions provide load shedding resilience. Mshauri AI tutor support available 24/7. Works across Vodacom, MTN, Telkom 4G/5G LTE, fibre internet, plus Starlink satellite.',
    faqs: [
      { q: 'How does Smartious compare to Brainline, Impaq, Cambridge Home School Online, Wingu Academy, ADvTech Online?', a: 'Smartious is distinct from local SA online providers in three ways. First: live Cambridge-trained PGCE teachers delivering instruction real-time, not pre-recorded video lessons with light tutor support (the typical Brainline/Impaq model). Second: 14-country student community providing international peer interaction (vs SA-only student bodies). Third: pricing meaningfully below UK-based Cambridge Home School Online while matching local competitors. The trade-off: smaller scale than Brainline/Impaq, but higher-touch live instruction model.' },
      { q: 'Can Smartious deliver NSC (National Senior Certificate) qualifications?', a: 'Smartious primarily delivers Cambridge IGCSE and A-Level, Pearson Edexcel, IB Diploma, and American AP curricula — the internationally recognised qualifications. We do not directly deliver NSC, which is the South African national examination. Many Johannesburg families pursue Cambridge specifically because of its international university portability — particularly important for families considering semigration. For families wanting NSC specifically, local providers (Brainline, Impaq) are the established route. Cambridge IGCSE and A-Level qualifications are accepted at all major SA universities (Wits, UCT, Stellenbosch, UP, UJ).' },
      { q: 'How does Smartious work with the BELA Act 2024 homeschool registration?', a: 'The BELA Act 2024 (Basic Education Laws Amendment Act) updated the homeschool registration framework in South Africa. Johannesburg families register with the Gauteng Department of Education and provide curriculum documentation. Smartious supplies comprehensive curriculum, scheme of work, learning outcomes, and assessment documentation suitable for Gauteng DBE compliance. For families wanting additional documentation support, Pestalozzi Trust (the SA homeschool legal support organisation) provides excellent registration guidance.' },
      { q: 'How does load shedding affect Smartious classes?', a: 'Every Smartious live class is recorded automatically. Stage 4-6 load shedding outages affecting your area don\'t cost lessons — students review missed content asynchronously via the recording, complete any associated work, and join the next live session caught up. Families with reliable inverter/solar/UPS backup attend live; families relying solely on Eskom grid use the recording-then-catch-up pattern. Most Johannesburg homeschool families now have at least basic inverter backup for load shedding resilience.' },
      { q: 'My family is considering semigration to the UK / Australia / Canada / UAE / Mauritius. How does Cambridge help?', a: 'Cambridge IGCSE and A-Level qualifications are the most portable internationally — accepted across the UK (Russell Group, all universities), Australia (Group of Eight, all universities), Canada (U15, all provinces), USA (Ivy League, all universities), UAE/Qatar branch campuses, Mauritius universities, Portugal/EU universities, plus African universities including the major SA institutions. Smartious students mid-stream through Cambridge IGCSE or A-Level can relocate to any destination country without curriculum interruption, transcript reconciliation, or year-loss. This is particularly valuable for Johannesburg families on 2-5 year semigration evaluation timelines.' },
      { q: 'What\'s the cost in ZAR vs USD?', a: 'Smartious tuition is denominated in USD: From USD 423/month (~ZAR 7,700 at current rates), paid termly. Payments accepted via international card, PayPal, or EFT for SA residents. USD denomination provides stability against ZAR-USD volatility — particularly important for multi-year planning (Cambridge IGCSE 2-year programme, A-Level 2-year programme). Comparable to Brainline (R3,500-5,000/month), Impaq (similar), well below Cambridge Home School Online UK (R6,000-10,000/month).' },
    ],
  },

  {
    slug: 'cape-town-za',
    name: 'Cape Town',
    county: 'Western Cape',
    region: 'Mother City · Table Mountain · 4.6M residents',
    primaryKeyword: 'Online homeschooling in Cape Town',
    heroTagline: 'For Cape Town families — City Bowl, Sea Point, Camps Bay, Constantia, Newlands, Rondebosch, plus UCT academic households and semigration evaluators.',
    intro: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Cape Town families across City Bowl, Sea Point, Camps Bay, Bantry Bay, Clifton, Constantia, Bishopscourt, Newlands, Rondebosch, Claremont, Wynberg, Tokai, Hout Bay, Fish Hoek, Kalk Bay, Somerset West, Strand and all Cape Town suburbs. Built for Bishops Diocesan College, SACS (South African College School), Herschel Girls\', Westerford, Rondebosch Boys\' alternative-seekers, UCT academic households, City Bowl professional families, and Cape Town families considering semigration to the UK, Australia, Canada.',
    heroImg: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Cape Town showing Table Mountain backdrop and City Bowl' },
    seoDesc: 'Live online homeschooling for Cape Town families. Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, American AP. From USD 423/month (~ZAR 7,700). Bishops, SACS, Herschel alternative. SAST live classes during Cape Town school hours.',
    challenges: [
      'Private school tuition pressure: top Cape Town private schools — Bishops (R190,000+/year), Herschel Girls\' School (R180,000+/year), SACS Junior + High (R140,000+/year), Westerford (R55,000+/year as semi-public), Rondebosch Boys\' (R85,000+/year), Reddam House (R200,000+/year) — represent meaningful financial commitment even for affluent City Bowl, Constantia, Bishopscourt, Camps Bay families.',
      'Capacity constraints at top Cape Town private schools — Bishops, SACS, Herschel often have multi-year waiting lists, particularly for Grades 8-10 entry where places are typically allocated to existing students from earlier years.',
      'Semigration consideration: Cape Town families have particular semigration patterns toward the UK, Australia, and increasingly Mauritius. Cambridge curriculum provides international portability — children don\'t need transcript reconciliation on emigration.',
      'Load shedding (Stage 2-6) disrupts in-person school schedules. Online instruction with recorded sessions provides resilience for families without solar/inverter backup.',
      'UCT academic households want international academic exposure for children alongside strong SA university culture. Cambridge IGCSE/A-Level provides this while maintaining UCT, Stellenbosch, Wits eligibility.',
      'Lifestyle-focused families (Camps Bay, Hout Bay, Kalk Bay, Fish Hoek) value flexibility to combine academics with outdoor pursuits — surfing, hiking, sailing — that traditional school schedules constrain.',
    ],
    familySituations: [
      'City Bowl, Sea Point, Camps Bay, Bantry Bay professional families considering semigration to UK, Australia, Mauritius.',
      'Constantia, Bishopscourt, Newlands, Rondebosch private school alternative-seekers.',
      'UCT, UWC, Stellenbosch University academic households (faculty children) wanting international curriculum exposure.',
      'Cape Town corporate transfer families (multinational professionals on 2-5 year SA postings).',
      'Hout Bay, Kalk Bay, Fish Hoek, Noordhoek lifestyle families wanting flexible academics combined with outdoor pursuits.',
      'Cape Town tech sector families (Naspers/Prosus, Takealot, Allan Gray, Investec, etc.) on international career trajectories.',
      'Older students (Grades 9-12) pivoting from NSC pathway to Cambridge IGCSE/A-Level for international university applications.',
    ],
    nearbyAreas: ['City Bowl', 'Sea Point', 'Green Point', 'Camps Bay', 'Bantry Bay', 'Clifton', 'Constantia', 'Bishopscourt', 'Newlands', 'Rondebosch', 'Claremont', 'Wynberg', 'Tokai', 'Bergvliet', 'Plumstead', 'Hout Bay', 'Llandudno', 'Fish Hoek', 'Kalk Bay', 'Muizenberg', 'Noordhoek', 'Simon\'s Town', 'Pinelands', 'Observatory', 'Mowbray', 'Rosebank', 'Tamboerskloof', 'Gardens', 'Vredehoek', 'Oranjezicht', 'De Waterkant', 'Woodstock', 'Salt River', 'Somerset West', 'Strand', 'Gordon\'s Bay', 'Durbanville', 'Bellville', 'Brackenfell'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Humanities (Geography, History, Global Perspectives, Economics, Business Studies)',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Psychology, English Literature, Geography',
      'Pearson Edexcel International GCSE and International A-Level subjects',
      'IB Diploma — all six groups',
      'American Curriculum — AP courses',
      'SAT, ACT, IELTS, TOEFL test preparation',
      'Afrikaans, isiXhosa language support available alongside English-medium instruction',
    ],
    whyChoose: [
      ['Bishops / SACS / Herschel alternative pricing', 'From USD 423/month (~ZAR 7,700), paid termly — versus R55,000-R230,000/year at top Cape Town private schools.'],
      ['SAST live class scheduling', 'Live classes run 9 AM – 6 PM SAST (UTC+2) — exactly matching Cape Town school hours. Whole-day flexibility leaves afternoons for outdoor pursuits, sports, music, surfing.'],
      ['Cape Town outdoor lifestyle alignment', 'Online schedule enables Cape Town\'s lifestyle advantages — morning surf at Muizenberg, afternoon hike up Lion\'s Head, weekend sailing in Hout Bay — without sacrificing academic depth.'],
      ['Cambridge exam access at British Council Cape Town', 'British Council Cape Town and various Cambridge-authorised Western Cape centres (Bishops, SACS, Reddam House, AISJ Cape Town, ISASA member schools) host Cambridge IGCSE and A-Level examinations during May/November series.'],
      ['UCT, Stellenbosch, UWC pathway preserved', 'Cambridge AS and A Levels lead to UCT, Stellenbosch University and UWC through the USAf exemption, with each faculty setting its own requirements. Domestic SA university pathway maintained alongside international portability.'],
      ['Load shedding resilience built in', 'Every live class recorded automatically. Stage 4-6 outages don\'t cost lessons — async review, then back to live the next day.'],
    ],
    growingReason: 'Cape Town\'s combination of City Bowl professional families, Constantia/Bishopscourt/Camps Bay private school alternative-seekers, UCT academic households, the substantial tech sector (Naspers/Prosus, Takealot, Allan Gray, Investec), and the unique lifestyle-academic balance demanded by outdoor-pursuing families creates a distinctive Cape Town homeschool market. Semigration patterns specifically toward the UK and Australia (and increasingly Mauritius) make Cambridge curriculum portability particularly valuable. Cape Town is South Africa\'s second-largest single market for live online Cambridge curriculum delivery, behind Johannesburg.',
    curricula: {
      cambridge: 'Cambridge IGCSE (Grades 10-11) and A-Level (Grades 11-12). British Council Cape Town and Western Cape Cambridge-authorised centres host examinations. Pathway accepted by UCT, Stellenbosch, UWC, plus international universities worldwide.',
      cbc: 'Available for Cape Town families with Kenyan citizenship ties.',
      ib: 'IB Diploma Programme — full delivery. Reddam House Cape Town alternative-seekers often choose IB DP given Reddam\'s IB curriculum.',
      american: 'American Curriculum with AP — particularly relevant for AISJ alternative families and US-based diaspora returnees.',
    },
    homeschoolDetail: 'Cape Town families register with the Western Cape Education Department (WCED) under the BELA Act 2024 framework. Smartious provides curriculum, scheme of work, and assessment documentation suitable for WCED compliance. Pestalozzi Trust provides legal support for SA homeschool registration questions.',
    homeTuitionDetail: 'Premium tier includes optional in-person home tuition supplementation in City Bowl, Constantia, Newlands, Rondebosch, Camps Bay during examination preparation periods.',
    onlineLearningDetail: 'Live online instruction in South Africa Standard Time (UTC+2) matching Cape Town local time. Works across Vodacom, MTN, Telkom 4G/5G LTE, fibre internet, plus Starlink satellite for households wanting absolute reliability. Recorded sessions provide load shedding resilience.',
    faqs: [
      { q: 'How does Smartious compare to Cape Town private schools like Bishops, SACS, Herschel?', a: 'Bishops (R190,000+/year), SACS (R140,000+/year), Herschel (R180,000+/year), Westerford (R55,000+/year semi-public), Rondebosch Boys (R85,000+/year), Reddam House (R200,000+/year) provide physical campus education with established sports, arts, and pastoral programmes. Smartious provides live online Cambridge, IB, or American curriculum from USD 5,076/year (~ZAR 92,400/year) — meaningfully below private school total cost. The trade-off: no physical campus or in-school sports/arts programme, but the same internationally recognised academic qualifications. Many Cape Town families combine Smartious academic instruction with local sports clubs, music academies, surfing schools — the Cape Town lifestyle advantage.' },
      { q: 'Can my Cape Town child apply to UCT, Stellenbosch, or UWC with Cambridge qualifications?', a: 'Yes. UCT, Stellenbosch University, UWC, and all SA universities accept Cambridge IGCSE and A-Level qualifications. Students without the NSC enter SA universities through a USAf exemption based on their AS and A Level results, and each faculty sets its own requirements. The international portability is the additional advantage — same qualifications work for UK Russell Group, US Ivy League, Canadian U15, Australian Group of Eight, UAE branch campuses simultaneously.' },
      { q: 'Where do Cape Town students sit Cambridge IGCSE and A-Level examinations?', a: 'British Council Cape Town (City Bowl) and various Cambridge-authorised Western Cape centres (Bishops, SACS, Reddam House Cape Town, AISJ Cape Town, ISASA member schools) host Cambridge IGCSE and A-Level examinations during May/November series. Smartious handles examination registration logistics.' },
      { q: 'How does Smartious work with the Cape Town outdoor lifestyle?', a: 'Live classes 9 AM – 6 PM SAST leave evenings and weekends free, with flexible afternoons depending on subject load. Cape Town homeschool families typically combine academics with morning surf at Muizenberg, afternoon hikes up Lion\'s Head or Table Mountain, weekend sailing in Hout Bay, mountain biking in Tokai Forest. Recorded sessions enable async review during peak surf swell or family trips.' },
      { q: 'How does Smartious work with WCED homeschool registration under BELA Act 2024?', a: 'Western Cape families register with the Western Cape Education Department (WCED) under the updated BELA Act 2024 framework. Smartious provides curriculum, scheme of work, learning outcomes, and assessment documentation suitable for WCED compliance. Pestalozzi Trust (SA homeschool legal support organisation) provides additional registration guidance if needed.' },
      { q: 'My family is considering semigration to UK or Australia. How does Cambridge help?', a: 'Cambridge IGCSE and A-Level qualifications are the most portable internationally. UK universities (Russell Group, all institutions), Australian universities (Group of Eight, all institutions), Canadian, US, UAE, Mauritius, Portuguese universities all accept Cambridge. Cape Town families on 2-5 year semigration evaluation timelines maintain Cambridge throughout — no curriculum interruption on eventual move, no academic year loss, no transcript reconciliation.' },
    ],
  },

  {
    slug: 'pretoria-za',
    name: 'Pretoria',
    county: 'Tshwane, Gauteng',
    region: 'Administrative capital · University of Pretoria · 2.4M residents',
    primaryKeyword: 'Online homeschooling in Pretoria',
    heroTagline: 'For Pretoria families — Brooklyn, Waterkloof, Menlyn, Hatfield, Centurion — government, diplomatic, University of Pretoria academic households, and Afrikaans-medium families seeking international curriculum access.',
    intro: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Pretoria families across Brooklyn, Waterkloof, Menlyn, Hatfield, Pretoria Central, Centurion, Faerie Glen, Mooikloof, Lynnwood, Garsfontein, Equestria, Wapadrand and all Tshwane suburbs. Built for Pretoria Boys High, Pretoria Girls High, Crawford Pretoria, St. Mary\'s DSG alternative-seekers, government and diplomatic families, University of Pretoria (Tuks) academic households, and Afrikaans-medium families wanting Cambridge international curriculum access.',
    heroImg: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Pretoria showing the Union Buildings and Jacaranda-lined streets' },
    seoDesc: 'Live online homeschooling for Pretoria families. Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, American AP. From USD 423/month (~ZAR 7,700). Pretoria Boys, Pretoria Girls, Crawford Pretoria alternative. SAST live classes.',
    challenges: [
      'Private school tuition pressure: top Pretoria private schools — Crawford Pretoria, St. Mary\'s DSG, St. Alban\'s College, Cornwall Hill College — charge R130,000-R200,000+/year. Public-school-grade alternatives Pretoria Boys High and Pretoria Girls High are well-regarded but capacity-constrained.',
      'Capacity constraints at top Pretoria public-grade schools — Pretoria Boys High, Pretoria Girls High have multi-year waiting lists for Grade 8 entry, particularly for non-feeder-school applicants.',
      'Diplomatic families on Pretoria postings (foreign embassies, AU representations) need curriculum continuity for next postings — Cambridge IGCSE/A-Level provides international portability.',
      'Afrikaans-medium school background plus need for English-medium international curriculum requires careful linguistic scaffolding for Cambridge instruction.',
      'University of Pretoria (Tuks) academic households want international academic exposure for children alongside strong SA university culture.',
      'Government professional families (Union Buildings, DIRCO, various ministries) want flexible curriculum that supports children\'s eventual international university applications.',
    ],
    familySituations: [
      'Brooklyn, Waterkloof, Menlyn, Faerie Glen private school alternative-seekers.',
      'Diplomatic mission families (foreign embassies in Pretoria, AU representations).',
      'Government professional families (Union Buildings, DIRCO, Treasury, various ministries).',
      'University of Pretoria (Tuks), University of South Africa (UNISA) academic households.',
      'Centurion corporate transfer families (multinational professionals on 2-5 year SA postings).',
      'Afrikaans-medium school background families pivoting to Cambridge English-medium international curriculum.',
      'Older students (Grades 9-12) pivoting from NSC to Cambridge for international university applications.',
    ],
    nearbyAreas: ['Brooklyn', 'Waterkloof', 'Menlyn', 'Hatfield', 'Pretoria Central', 'Centurion', 'Faerie Glen', 'Mooikloof', 'Lynnwood', 'Garsfontein', 'Equestria', 'Wapadrand', 'Erasmuskloof', 'Constantia Park', 'Moreleta Park', 'Olympus', 'Wonderboom', 'Montana', 'Pretoria North', 'Akasia', 'Soshanguve', 'Mamelodi', 'Atteridgeville', 'Sunnyside', 'Arcadia', 'Groenkloof', 'Muckleneuk', 'Lyttelton', 'Irene', 'Cornwall Hill'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics)',
      'Cambridge IGCSE Humanities (Geography, History, Economics, Business Studies)',
      'Cambridge A-Level Mathematics, Further Mathematics, Sciences, Economics',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme (full six groups)',
      'American Curriculum with AP',
      'SAT, ACT, IELTS, TOEFL test preparation',
      'Afrikaans, isiZulu language support available alongside English instruction',
    ],
    whyChoose: [
      ['Pretoria private school alternative pricing', 'From USD 423/month (~ZAR 7,700) for Smartious vs R130,000-R200,000/year for Crawford Pretoria, St. Mary\'s DSG, St. Alban\'s, Cornwall Hill College.'],
      ['Diplomatic family curriculum portability', 'For Pretoria-based diplomatic families on rotation, Cambridge IGCSE/A-Level qualifications transfer seamlessly to next postings — Geneva, New York, Brussels, Nairobi, anywhere.'],
      ['University of Pretoria (Tuks) academic family alignment', 'For Tuks faculty households, Smartious provides international academic exposure alongside strong UP academic culture.'],
      ['Afrikaans-to-English transition support', 'Graduated English-medium instruction for children with Afrikaans-medium school background. Cambridge English Language and Literature provides structured English academic preparation while Afrikaans home/community use is maintained.'],
      ['Cambridge exam access via Pretoria centres', 'British Council Pretoria plus Cambridge-authorised Pretoria centres (Crawford Pretoria, ISASA member schools) host Cambridge IGCSE and A-Level examinations.'],
      ['Load shedding resilience', 'Every live class recorded automatically. Outages don\'t cost lessons.'],
    ],
    growingReason: 'Pretoria as South Africa\'s administrative capital concentrates the country\'s government, diplomatic, and ministerial professional class. The Union Buildings cluster (presidency, DIRCO, Treasury, key ministries), the diplomatic missions concentrated in Brooklyn and Waterkloof, the University of Pretoria (Tuks) and UNISA academic communities, plus the established Centurion corporate cluster create unique demand for international curriculum delivery. Diplomatic families particularly value curriculum portability for future postings, while government professional families increasingly evaluate semigration options where Cambridge portability matters.',
    curricula: {
      cambridge: 'Cambridge IGCSE (Grades 10-11) and A-Level (Grades 11-12). British Council Pretoria plus Cambridge-authorised Pretoria centres host examinations.',
      cbc: 'Available for Pretoria families with Kenyan citizenship ties.',
      ib: 'IB Diploma Programme — full delivery.',
      american: 'American Curriculum with AP — particularly relevant for US embassy families in Pretoria.',
    },
    homeschoolDetail: 'Pretoria families register with the Gauteng Department of Education under the BELA Act 2024 framework. Smartious provides comprehensive curriculum and assessment documentation suitable for Gauteng DBE compliance.',
    homeTuitionDetail: 'Premium tier includes optional in-person home tuition supplementation in Brooklyn, Waterkloof, Centurion, Hatfield during examination preparation periods.',
    onlineLearningDetail: 'Live online instruction in South Africa Standard Time (UTC+2). Works across Vodacom, MTN, Telkom 4G/5G LTE, fibre internet. Recorded sessions for load shedding resilience.',
    faqs: [
      { q: 'How does Smartious work for Pretoria diplomatic families?', a: 'For foreign embassy and AU representation families on Pretoria postings, Smartious provides Cambridge IGCSE/A-Level, IB Diploma, or American AP curriculum that transfers seamlessly to next postings. Documentation suitable for embassy school verification and university applications anywhere worldwide.' },
      { q: 'Can my Pretoria child apply to University of Pretoria (Tuks) with Cambridge qualifications?', a: 'Yes. University of Pretoria, University of South Africa (UNISA), Tshwane University of Technology, and all SA universities accept Cambridge IGCSE and A-Level qualifications. Students without the NSC enter SA universities through a USAf exemption based on their AS and A Level results, and each faculty sets its own requirements.' },
      { q: 'How does Smartious work with Afrikaans-medium school background?', a: 'For Pretoria families with children transitioning from Afrikaans-medium schools (Hoërskool Affies, Hoërskool Menlopark, etc.) to international curriculum, Smartious provides graduated English-medium academic instruction. Typical transition: 6-12 months of structured Cambridge English Language preparation alongside subject instruction. Afrikaans home language and cultural identity maintained through family and community, not via the academic curriculum.' },
      { q: 'Where do Pretoria students sit Cambridge IGCSE and A-Level examinations?', a: 'British Council Pretoria plus Cambridge-authorised Pretoria centres (Crawford Pretoria, ISASA member schools) host Cambridge examinations during May/November series. Smartious handles examination registration logistics.' },
      { q: 'How does Smartious work with the BELA Act 2024 homeschool registration?', a: 'Pretoria families register with the Gauteng Department of Education (same as Johannesburg families) under the BELA Act 2024 framework. Smartious provides curriculum, scheme of work, learning outcomes, and assessment documentation suitable for Gauteng DBE compliance.' },
    ],
  },

  {
    slug: 'durban-za',
    name: 'Durban',
    county: 'eThekwini, KwaZulu-Natal',
    region: 'Indian Ocean coast · Indian diaspora · 3.4M residents',
    primaryKeyword: 'Online homeschooling in Durban',
    heroTagline: 'For Durban families — Umhlanga, Ballito, Westville, Durban North, Berea — Indian-South African community, coastal lifestyle families, and Cambridge IGCSE seekers across KwaZulu-Natal.',
    intro: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Durban families across Umhlanga, Ballito, Westville, Durban North, La Lucia, Berea, Glenwood, Morningside, Musgrave, Hillcrest, Kloof, Pinetown, Chatsworth, Phoenix and all eThekwini suburbs. Built for Durban Girls\' College, Durban High School, St. Mary\'s Kloof, Crawford La Lucia, Michaelhouse, Hilton College alternative-seekers, Durban Indian community families, and KwaZulu-Natal coastal lifestyle families seeking international curriculum portability.',
    heroImg: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Durban Indian Ocean coastline showing Umhlanga lighthouse area' },
    seoDesc: 'Live online homeschooling for Durban families. Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, American AP. From USD 423/month (~ZAR 7,700). Durban Girls College, Michaelhouse, Hilton alternative. KZN coastal lifestyle compatible.',
    challenges: [
      'KZN private school tuition pressure: Michaelhouse and Hilton College (boarding schools, R250,000-R350,000/year), Durban Girls\' College, Durban High School, Crawford La Lucia, St. Mary\'s Kloof (R100,000-R180,000/year) represent meaningful financial commitment.',
      'KZN coastal lifestyle families (Umhlanga, Ballito, Salt Rock) value flexibility to combine academics with surfing, sailing, and outdoor pursuits that traditional schedules constrain.',
      'Durban Indian community families have particular interest in international university pathways — UK, Australia, Canada, India university options. Cambridge curriculum supports all simultaneously.',
      'Semigration consideration: KZN families have notable semigration patterns toward Australia (Perth, Brisbane), UK, and Mauritius. Cambridge curriculum provides portability.',
      'Subtropical Durban climate (35°C+ summer humidity) makes morning learning schedules essential — afternoons require shaded/cooled environments for academic focus.',
      'Load shedding (Stage 2-6) plus occasional KZN flooding events disrupt in-person school schedules. Online instruction with recorded sessions provides resilience.',
    ],
    familySituations: [
      'Umhlanga, Ballito, Salt Rock professional families on North Coast lifestyle.',
      'Westville, Durban North, La Lucia, Berea private school alternative-seekers.',
      'Durban Indian community families (Chatsworth, Phoenix, Verulam, Tongaat) wanting international university pathway access.',
      'Hillcrest, Kloof, Botha\'s Hill upper highway families.',
      'Durban corporate transfer families (multinational professionals on 2-5 year SA postings).',
      'KZN semigration evaluators considering Australia, UK, Mauritius moves.',
      'Older students (Grades 9-12) pivoting from NSC to Cambridge for international university applications.',
    ],
    nearbyAreas: ['Umhlanga', 'Umhlanga Rocks', 'Ballito', 'Westville', 'Durban North', 'La Lucia', 'Berea', 'Glenwood', 'Morningside', 'Musgrave', 'Hillcrest', 'Kloof', 'Pinetown', 'Chatsworth', 'Phoenix', 'Verulam', 'Tongaat', 'Salt Rock', 'Umdloti', 'Mt Edgecombe', 'Cornubia', 'Sherwood', 'Reservoir Hills', 'Newlands East', 'Newlands West', 'Springfield Park', 'Botha\'s Hill', 'Drummond', 'Pietermaritzburg (Hilton, Michaelhouse area, 80 km west)', 'Howick', 'Margate', 'Port Edward', 'Richards Bay'],
    subjects: [
      'Cambridge IGCSE Mathematics, English Language, English Literature, Sciences',
      'Cambridge IGCSE Humanities (Geography, History, Economics, Business Studies)',
      'Cambridge A-Level Mathematics, Sciences, Economics, Business',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme (full six groups)',
      'American Curriculum with AP',
      'SAT, ACT, IELTS, TOEFL test preparation',
      'Afrikaans, isiZulu language support available alongside English instruction',
    ],
    whyChoose: [
      ['Michaelhouse / Hilton College / Durban private school alternative pricing', 'From USD 423/month (~ZAR 7,700) for Smartious vs R100,000-R350,000/year for KZN private schools. Particularly valuable for families wanting Cambridge curriculum without boarding school relocation to Pietermaritzburg.'],
      ['KZN coastal lifestyle compatibility', 'Live classes 9 AM – 6 PM SAST leave afternoons free for Umhlanga/Ballito beach time, sailing in Durban harbour, surfing at North Pier — supporting whole-child development on the Indian Ocean coastline.'],
      ['Durban Indian community international pathway access', 'Cambridge qualifications open UK, Australia, Canada, India, plus African university pathways — particularly valuable for Durban Indian community families with international family connections.'],
      ['Cambridge exam access via British Council Durban', 'British Council Durban (Glenwood) plus Cambridge-authorised KZN centres (Michaelhouse, Hilton College, ISASA member schools) host Cambridge examinations.'],
      ['Semigration-ready curriculum for KZN families', 'For KZN families considering Australia, UK, Mauritius moves, Cambridge IGCSE/A-Level provides seamless portability.'],
      ['Climate-aligned morning schedule', 'Morning live classes complete before peak Durban heat and humidity, supporting sustained academic focus.'],
    ],
    growingReason: 'Durban\'s combination of Umhlanga and North Coast professional class (significant corporate and tech professional concentration), Durban Indian community (one of South Africa\'s largest South Asian diaspora communities with strong international family connections), KZN coastal lifestyle families demanding flexibility, plus the established KZN private school alternative market (Michaelhouse and Hilton College boarding schools represent meaningful family financial commitment) creates substantial Durban-specific homeschool demand. KwaZulu-Natal semigration patterns (notable Australia and UK movement) make Cambridge curriculum portability particularly valuable for the region.',
    curricula: {
      cambridge: 'Cambridge IGCSE (Grades 10-11) and A-Level (Grades 11-12). British Council Durban plus Cambridge-authorised KZN centres host examinations.',
      cbc: 'Available for Durban families with Kenyan citizenship ties.',
      ib: 'IB Diploma Programme — full delivery.',
      american: 'American Curriculum with AP — particularly relevant for US-based diaspora returnees.',
    },
    homeschoolDetail: 'Durban families register with the KwaZulu-Natal Department of Education under the BELA Act 2024 framework. Smartious provides curriculum and assessment documentation suitable for KZN DBE compliance.',
    homeTuitionDetail: 'Premium tier includes optional in-person home tuition supplementation in Umhlanga, Westville, Durban North, La Lucia, Berea during examination preparation periods.',
    onlineLearningDetail: 'Live online instruction in South Africa Standard Time (UTC+2). Works across Vodacom, MTN, Telkom 4G/5G LTE, fibre internet plus Starlink satellite backup. Recorded sessions for load shedding and weather event resilience.',
    faqs: [
      { q: 'How does Smartious compare to Michaelhouse, Hilton College, Durban Girls\' College?', a: 'Michaelhouse and Hilton College are KZN boarding schools (R250,000-R350,000/year). Durban Girls\' College, Durban High School, Crawford La Lucia, St. Mary\'s Kloof are day private schools (R100,000-R180,000/year). Smartious provides live online Cambridge, IB, or American curriculum from USD 5,076/year (~ZAR 92,400/year) — particularly valuable for families wanting Cambridge curriculum without boarding school relocation to Pietermaritzburg, or without day private school financial commitment.' },
      { q: 'How does Smartious work for Durban Indian community families?', a: 'Cambridge IGCSE and A-Level qualifications open international university pathways including UK universities (where significant SA Indian diaspora has historic connections), Australian universities (Sydney, Melbourne, Perth — established SA Indian diaspora destinations), Canadian universities, plus Indian universities (Cambridge recognised by major Indian universities for international student admissions). For Durban Indian families with extended family in multiple countries, Cambridge portability is particularly valuable.' },
      { q: 'Where do Durban students sit Cambridge IGCSE and A-Level examinations?', a: 'British Council Durban (Glenwood area) plus Cambridge-authorised KZN centres (Michaelhouse and Hilton College in Pietermaritzburg area, ISASA member schools across KZN) host Cambridge examinations during May/November series.' },
      { q: 'How does Smartious work with KZN coastal lifestyle?', a: 'Live classes 9 AM – 6 PM SAST leave afternoons free for Umhlanga and Ballito beach time, sailing, surfing at North Pier, hiking the Drakensberg. Recorded sessions enable async review during peak surf swell or family travel.' },
      { q: 'How does Smartious work with the BELA Act 2024 homeschool registration in KZN?', a: 'Durban families register with the KwaZulu-Natal Department of Education under the BELA Act 2024 framework. Smartious provides curriculum, scheme of work, and assessment documentation suitable for KZN DBE compliance. Pestalozzi Trust provides additional registration support.' },
    ],
  },

  {
    slug: 'gqeberha-za',
    name: 'Gqeberha',
    county: 'Eastern Cape',
    region: 'Formerly Port Elizabeth · Algoa Bay · Automotive hub · 1.2M residents',
    primaryKeyword: 'Online homeschooling in Gqeberha (Port Elizabeth)',
    heroTagline: 'For Gqeberha families — Summerstrand, Mill Park, Walmer, Newton Park — automotive industry professional families, Algoa Bay lifestyle households, and Eastern Cape families seeking international curriculum.',
    intro: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Gqeberha (formerly Port Elizabeth) families across Summerstrand, Mill Park, Walmer, Newton Park, Lorraine, Mount Pleasant, Bluewater Bay, Sherwood, Cotswold, Linton Grange and all Eastern Cape coastal areas. Built for Grey High School, Collegiate Girls\' High, Pearson High School, Theodor Herzl, Lawson Brown alternative-seekers, automotive industry professional families (Volkswagen, Mercedes-Benz, Isuzu, Ford), Coega Industrial Development Zone families, and Algoa Bay coastal lifestyle households.',
    heroImg: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Gqeberha Port Elizabeth showing Algoa Bay coastline' },
    seoDesc: 'Live online homeschooling for Gqeberha (Port Elizabeth) and Eastern Cape families. Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, American AP. From USD 423/month (~ZAR 7,700). Grey High, Collegiate alternative. SAST live classes.',
    challenges: [
      'Eastern Cape private school options more limited than Cape Town or Johannesburg — Grey High School and Collegiate Girls\' High are well-regarded public schools, Pearson High School is the main private alternative, but choice is constrained.',
      'Automotive industry professional families (Volkswagen, Mercedes-Benz, Isuzu, Ford, supplier industries) face periodic international transfers — Cambridge curriculum provides portability for next postings.',
      'Coega Industrial Development Zone families (deep-water port, automotive supplier cluster) need flexible curriculum for international postings.',
      'Nelson Mandela University academic households want international academic exposure for children alongside strong SA university culture.',
      'Eastern Cape semigration patterns toward UK, Australia, New Zealand are notable — Cambridge curriculum provides portability.',
      'Algoa Bay coastal lifestyle families (Summerstrand, Bluewater Bay) value flexibility for surfing, sailing, beach time that traditional schedules constrain.',
    ],
    familySituations: [
      'Summerstrand, Mill Park, Walmer, Newton Park automotive industry professional families.',
      'Volkswagen, Mercedes-Benz, Isuzu, Ford management families on potential international transfers.',
      'Coega Industrial Development Zone professional families.',
      'Nelson Mandela University faculty households.',
      'Eastern Cape semigration evaluators considering UK, Australia, New Zealand.',
      'Algoa Bay coastal lifestyle families wanting flexible academic scheduling.',
      'Older students (Grades 9-12) pivoting from NSC pathway to Cambridge IGCSE/A-Level for international applications.',
    ],
    nearbyAreas: ['Summerstrand', 'Mill Park', 'Walmer', 'Newton Park', 'Lorraine', 'Mount Pleasant', 'Bluewater Bay', 'Sherwood', 'Cotswold', 'Linton Grange', 'Charlo', 'Theescombe', 'Sunridge Park', 'Westering', 'Fairview', 'Algoa Park', 'North End', 'South End', 'Central', 'Humewood', 'Schauderville', 'Korsten', 'Gelvandale', 'Kragga Kamma', 'Greenbushes', 'Coega IDZ', 'Uitenhage (Kariega)', 'Despatch', 'Jeffreys Bay (J-Bay, 75 km southwest)', 'St Francis Bay', 'Cape St Francis', 'Addo Elephant National Park access'],
    subjects: [
      'Cambridge IGCSE Mathematics, English Language, Sciences, Humanities, Business',
      'Cambridge A-Level Mathematics, Sciences, Economics, Business',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme (full six groups)',
      'American Curriculum with AP',
      'SAT, ACT, IELTS, TOEFL test preparation',
      'Afrikaans, isiXhosa language support available alongside English instruction',
    ],
    whyChoose: [
      ['Limited Eastern Cape private school alternative', 'For Eastern Cape families wanting international curriculum, options are limited — Smartious provides Cambridge IGCSE, A-Level, IB curriculum without relocating to Cape Town or Johannesburg.'],
      ['Automotive industry international portability', 'For Volkswagen, Mercedes-Benz, Isuzu, Ford management families facing periodic international postings, Cambridge curriculum transfers seamlessly to Germany, Japan, USA, Mexico, China, other automotive industry destinations.'],
      ['Algoa Bay coastal lifestyle compatibility', 'Live classes 9 AM – 6 PM SAST leave afternoons free for Summerstrand beach, surfing at Pollok Beach or J-Bay, sailing in Algoa Bay — supporting whole-child coastal development.'],
      ['Cambridge exam access via Cape Town/Johannesburg', 'Gqeberha students travel to British Council Cape Town or Johannesburg for Cambridge May/November series — short flight from PE Airport.'],
      ['Nelson Mandela University academic family alignment', 'For NMU faculty households, Smartious provides international academic exposure for children alongside strong SA university culture.'],
      ['Coastal weather event resilience', 'Live classes recorded automatically. Eastern Cape coastal weather events don\'t cost lessons.'],
    ],
    growingReason: 'Gqeberha (formerly Port Elizabeth) hosts South Africa\'s automotive industry cluster — Volkswagen Group South Africa (largest VW manufacturing plant in Africa), Mercedes-Benz South Africa, Isuzu Motors South Africa, Ford Struandale Plant — plus the Coega Industrial Development Zone (deep-water port and growing automotive supplier cluster). This concentration creates a professional class with international career trajectories where Cambridge curriculum portability matters. Combined with Algoa Bay coastal lifestyle families, Nelson Mandela University academic households, and meaningful Eastern Cape semigration patterns toward the UK and Australia, Gqeberha represents a distinctive secondary South African market for live online international curriculum delivery.',
    curricula: {
      cambridge: 'Cambridge IGCSE (Grades 10-11) and A-Level (Grades 11-12). Examinations at British Council Cape Town or Johannesburg.',
      cbc: 'Available for Gqeberha families with Kenyan citizenship ties.',
      ib: 'IB Diploma Programme — full delivery.',
      american: 'American Curriculum with AP — particularly relevant for Ford and other US-headquartered automotive industry families.',
    },
    homeschoolDetail: 'Gqeberha families register with the Eastern Cape Department of Education under the BELA Act 2024 framework. Smartious provides curriculum and assessment documentation suitable for Eastern Cape DBE compliance.',
    homeTuitionDetail: 'Premium tier includes occasional in-person home tuition supplementation for Summerstrand, Mill Park, Walmer families during examination preparation periods.',
    onlineLearningDetail: 'Live online instruction in South Africa Standard Time (UTC+2). Works across Vodacom, MTN, Telkom 4G/5G LTE, fibre internet plus Starlink satellite backup. Recorded sessions for resilience.',
    faqs: [
      { q: 'How does Smartious work for automotive industry families in Gqeberha?', a: 'For Volkswagen, Mercedes-Benz, Isuzu, Ford management families on potential international transfers (Germany, Japan, USA, Mexico, China, other automotive destinations), Cambridge IGCSE/A-Level qualifications transfer seamlessly. Documentation supports international school verification and university applications anywhere worldwide.' },
      { q: 'What are the Eastern Cape private school alternatives Smartious replaces?', a: 'Grey High School (R55,000-R75,000/year as well-regarded public school), Collegiate Girls\' High School (similar), Pearson High School (R85,000-R130,000/year private), Theodor Herzl School, Lawson Brown High School. Smartious provides Cambridge international curriculum from USD 5,076/year (~ZAR 92,400/year) — particularly valuable for families wanting Cambridge specifically (not directly offered at most Eastern Cape schools).' },
      { q: 'Where do Gqeberha students sit Cambridge examinations?', a: 'Gqeberha students typically travel to British Council Cape Town or British Council Johannesburg for May/November Cambridge series — short flights from Port Elizabeth Airport make this practical twice per year.' },
      { q: 'How does Smartious work with Coega IDZ professional families?', a: 'For Coega Industrial Development Zone professional families (deep-water port management, automotive supplier industries, manufacturing professionals), Smartious provides international curriculum continuity for next international postings. Documentation suitable for relocation to industrial cities worldwide.' },
      { q: 'How does Smartious work with BELA Act 2024 homeschool registration in Eastern Cape?', a: 'Gqeberha families register with the Eastern Cape Department of Education under the BELA Act 2024 framework. Smartious provides curriculum, scheme of work, and assessment documentation suitable for Eastern Cape DBE compliance.' },
    ],
  },

  {
    slug: 'stellenbosch-za',
    name: 'Stellenbosch',
    county: 'Western Cape',
    region: 'University town · Wine region · Cape Winelands · 0.2M residents',
    primaryKeyword: 'Online homeschooling in Stellenbosch',
    heroTagline: 'For Stellenbosch families — Mostertsdrift, Welgevallen, Dalsig, Universiteitsoord — Stellenbosch University academic households, wine estate families, and affluent Cape Winelands community.',
    intro: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Stellenbosch families across Mostertsdrift, Welgevallen, Dalsig, Onder-Papegaaiberg, Idas Valley, Cloetesville, Plankenbrug, Krigeville, Universiteitsoord and the Cape Winelands. Built for Paul Roos Gymnasium, Bloemhof Girls\' High, Rhenish Girls\' High, Stellenbosch Waldorf School alternative-seekers, Stellenbosch University academic households, wine estate management families, and affluent Cape Winelands community.',
    heroImg: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600&q=80&auto=format&fit=crop',
    altTexts: { hero: 'Stellenbosch showing the historic university town and Cape Winelands' },
    seoDesc: 'Live online homeschooling for Stellenbosch and Cape Winelands families. Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, American AP. From USD 423/month (~ZAR 7,700). Paul Roos, Bloemhof alternative. Cape Winelands lifestyle.',
    challenges: [
      'Affluent Cape Winelands community (wine estate ownership, Stellenbosch University academic professionals, Cape Town commuter families) values flexibility to combine academics with vineyard lifestyle, outdoor pursuits, and family travel.',
      'Stellenbosch University academic households want international academic exposure for children alongside strong Stellenbosch University culture (one of South Africa\'s top universities).',
      'Wine estate management and oenology families have international family connections — France, Italy, Argentina, Chile, Australia, USA — where Cambridge curriculum portability matters.',
      'Paul Roos Gymnasium and Bloemhof Girls\' High are highly competitive Afrikaans-medium schools with limited admissions. Alternative pathways for non-Afrikaans-medium or international-focused families are limited locally.',
      'Cape Town commuter families (Stellenbosch-Cape Town corridor) experience traffic congestion. Online learning eliminates commute time.',
      'Afrikaans-medium school background plus need for English-medium international curriculum requires careful linguistic scaffolding for Cambridge instruction.',
    ],
    familySituations: [
      'Stellenbosch University faculty households (top SA university with strong business, agriculture, sciences, medicine, languages faculties).',
      'Wine estate ownership and management families (Stellenbosch, Franschhoek, Paarl wine routes).',
      'Cape Winelands affluent family households.',
      'Cape Town commuter families (Stellenbosch-Cape Town corridor) wanting to eliminate commute time.',
      'International wine industry professional families with connections to France, Italy, Argentina, Chile, Australia, USA.',
      'Paul Roos Gymnasium and Bloemhof Girls\' High alternative-seekers (capacity-constrained schools).',
      'Older students (Grades 9-12) pivoting from NSC to Cambridge for international university applications.',
    ],
    nearbyAreas: ['Mostertsdrift', 'Welgevallen', 'Dalsig', 'Onder-Papegaaiberg', 'Idas Valley', 'Cloetesville', 'Plankenbrug', 'Krigeville', 'Universiteitsoord', 'Stellenbosch town centre', 'Eikestad', 'Bird Street area', 'Coetzenburg', 'Die Boord', 'Welgemoed', 'Brandwacht', 'Franschhoek (30 km east)', 'Paarl (25 km north)', 'Wellington (40 km north)', 'Somerset West (20 km southeast)', 'Strand', 'Helderberg', 'Khayelitsha access', 'Pniel', 'Lanzerac wine estate area', 'Spier wine estate area', 'Eikendal', 'Devon Valley'],
    subjects: [
      'Cambridge IGCSE Mathematics, English Language, English Literature, Sciences',
      'Cambridge A-Level Mathematics, Sciences, Economics, Business, French, Spanish',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme (full six groups)',
      'American Curriculum with AP',
      'SAT, ACT, IELTS, TOEFL, DELF/DALF (French) test preparation',
      'Afrikaans, French, Spanish language support available alongside English instruction',
    ],
    whyChoose: [
      ['Cape Winelands lifestyle compatibility', 'Live classes 9 AM – 6 PM SAST leave afternoons free for vineyard family life, outdoor pursuits in the Cape Winelands, Helderberg hiking, wine harvest participation — supporting whole-child Cape Winelands development.'],
      ['Stellenbosch University academic family alignment', 'For Stellenbosch University faculty households, Smartious provides international academic exposure for children alongside strong SU academic culture. Cambridge AS and A Levels lead to Stellenbosch University through the USAf exemption.'],
      ['Wine industry international portability', 'For wine estate ownership and management families with international connections (France, Italy, Argentina, Chile, Australia, USA wine industry contacts), Cambridge curriculum portability matters for children\'s eventual international university and career options.'],
      ['Paul Roos / Bloemhof alternative without Afrikaans-medium constraint', 'For Stellenbosch families wanting Cambridge international curriculum specifically (not the Afrikaans-medium Paul Roos / Bloemhof curriculum), Smartious provides clear international academic pathway.'],
      ['Cambridge exam access at British Council Cape Town', 'Stellenbosch students travel to British Council Cape Town (45-minute drive) for Cambridge May/November examinations.'],
      ['Eliminate Stellenbosch-Cape Town commute', 'For families considering Cape Town private schools but living in Stellenbosch/Cape Winelands, Smartious eliminates the daily commute entirely.'],
    ],
    growingReason: 'Stellenbosch concentrates uniquely affluent and academically-oriented South African demographics — Stellenbosch University (consistently ranked among the top 2-3 South African universities) academic households, Cape Winelands wine estate ownership and management families (a meaningful international professional class with global connections), plus Cape Town commuter families choosing the Stellenbosch lifestyle over urban density. The combination creates particular demand for international curriculum delivery that respects both local Stellenbosch University pathways AND international university options. The relatively small Stellenbosch population (~200,000) belies its disproportionate share of affluent Cape Winelands homeschool market demand.',
    curricula: {
      cambridge: 'Cambridge IGCSE (Grades 10-11) and A-Level (Grades 11-12). British Council Cape Town hosts examinations (45-minute drive).',
      cbc: 'Available for Stellenbosch families with Kenyan citizenship ties.',
      ib: 'IB Diploma Programme — full delivery.',
      american: 'American Curriculum with AP — relevant for US-based wine industry connections and diaspora returnees.',
    },
    homeschoolDetail: 'Stellenbosch families register with the Western Cape Education Department (WCED) under the BELA Act 2024 framework. Smartious provides curriculum and assessment documentation suitable for WCED compliance.',
    homeTuitionDetail: 'Premium tier includes optional in-person home tuition supplementation in Mostertsdrift, Welgevallen, Dalsig during examination preparation periods.',
    onlineLearningDetail: 'Live online instruction in South Africa Standard Time (UTC+2). Works across Vodacom, MTN, Telkom 4G/5G LTE, fibre internet (Stellenbosch has strong infrastructure given university presence). Recorded sessions for load shedding resilience.',
    faqs: [
      { q: 'How does Smartious work for Stellenbosch University academic families?', a: 'For Stellenbosch University faculty households (one of SA\'s top universities with strong academic culture spanning business, agriculture, sciences, medicine, languages), Smartious provides international academic exposure for children alongside SU academic culture at home. Cambridge AS and A Levels lead to Stellenbosch University through the USAf exemption, preserving the local university pathway while opening international options.' },
      { q: 'What are the Stellenbosch private school alternatives?', a: 'Paul Roos Gymnasium (highly competitive Afrikaans-medium boys\' school), Bloemhof Girls\' High School (Afrikaans-medium), Rhenish Girls\' High (semi-private), Stellenbosch Waldorf School (Steiner education). For families wanting Cambridge international curriculum specifically (not directly offered at these schools), Smartious provides clear international academic pathway from Stellenbosch.' },
      { q: 'How does Smartious work for Cape Winelands wine estate families?', a: 'For wine estate ownership and management families with international connections (France, Italy, Argentina, Chile, Australia, USA wine industry contacts), Cambridge curriculum provides children with internationally portable academic qualifications matching the family\'s international business orientation. Cambridge French A-Level particularly relevant for families with French wine industry connections.' },
      { q: 'Where do Stellenbosch students sit Cambridge examinations?', a: 'British Council Cape Town (City Bowl) hosts Cambridge IGCSE and A-Level examinations during May/November series — 45-minute drive from Stellenbosch. Cambridge-authorised Western Cape centres (Bishops, SACS, Reddam House Cape Town) also host examinations.' },
      { q: 'How does Smartious work with Afrikaans-medium school background?', a: 'For Stellenbosch families with children transitioning from Afrikaans-medium primary schools (Hoërskool Stellenbosch area schools) to international curriculum, Smartious provides graduated English-medium academic instruction. Typical transition: 6-12 months of structured Cambridge English Language preparation alongside subject instruction. Afrikaans home/community language and cultural identity maintained independently.' },
      { q: 'How does Smartious work with WCED homeschool registration under BELA Act 2024?', a: 'Stellenbosch families register with the Western Cape Education Department (WCED) under the BELA Act 2024 framework (same as Cape Town families). Smartious provides comprehensive curriculum and assessment documentation suitable for WCED compliance.' },
    ],
  },

  // ── October 2026: eight more South African places ──
  {
    slug: "centurion-za",
    name: "Centurion",
    county: "Gauteng",
    region: "City of Tshwane · Between Pretoria and Johannesburg on the N1 · Gautrain corridor",
    primaryKeyword: "Online school and homeschooling in Centurion",
    heroTagline: "For Centurion families in Irene, Eldoraigne, Midstream and Highveld: commuting professionals between Pretoria and Johannesburg who want an international qualification without another school run.",
    intro: "Live online Cambridge IGCSE, AS and A Level, Pearson Edexcel, IB Diploma and American AP for Centurion families in Irene, Eldoraigne, Lyttelton, Midstream Estate, Rooihuiskraal, Wierda Park, Heuweloord, Copperleaf, Pierre van Ryneveld and Highveld Techno Park. Centurion sits on the N1 between Pretoria’s government and diplomatic quarter and Johannesburg’s financial district, and many households here have one parent commuting each way. That shapes what families ask for: a qualification that travels, subjects the local school cannot staff, and an evening that is not spent in traffic.",
    heroImg: "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=1600&q=80&auto=format&fit=crop",
    altTexts: {
     "hero": "Centurion in Gauteng, between Pretoria and Johannesburg"
    },
    seoDesc: "Online school and homeschooling in Centurion: live Cambridge IGCSE, A Level, Edexcel, IB and AP for Irene, Midstream and Eldoraigne families. Alongside school or full-time.",
    challenges: [
     "Two-city households: one parent in Pretoria, one in Sandton, and a school run that competes with the N1 and the R21 every morning.",
     "Large security estates such as Midstream and Copperleaf with young families who want continuity if a job moves to another city or country.",
     "Learners who want separate Physics and Chemistry, Further Mathematics or Computer Science at A Level, which few local schools can staff for a small group.",
     "Families weighing the NSC against an international route, and wanting to keep both open while they decide."
    ],
    familySituations: [
     "Irene and Lyttelton families with a parent in government, a parastatal or a Pretoria embassy.",
     "Midstream and Copperleaf estate families whose children are at a nearby school and want one to three international subjects alongside it.",
     "Highveld Techno Park technology and engineering households planning study abroad.",
     "Families relocating between Gauteng and the Western Cape who want one continuous record."
    ],
    nearbyAreas: [
     "Irene",
     "Eldoraigne",
     "Lyttelton",
     "Midstream Estate",
     "Rooihuiskraal",
     "Wierda Park",
     "Heuweloord",
     "Copperleaf",
     "Pierre van Ryneveld",
     "Highveld Techno Park",
     "Zwartkop",
     "Thatchfield",
     "Olievenhoutbosch",
     "Hennopspark",
     "Doringkloof",
     "Clubview",
     "Raslouw",
     "Monavoni",
     "Kosmosdal",
     "Blue Valley Golf Estate"
    ],
    subjects: [
     "Cambridge IGCSE, AS and A Level: Mathematics, Further Mathematics, English, the sciences as separate subjects, Computer Science, Economics, Business",
     "Pearson Edexcel International GCSE and International A Level",
     "IB Diploma Programme",
     "American curriculum with Advanced Placement",
     "SAT, IELTS and TOEFL preparation"
    ],
    whyChoose: [
     [
      "Between two cities, on one record",
      "Whether the next job is in Pretoria, Johannesburg or abroad, the subjects, teachers and examination board stay the same."
     ],
     [
      "Subjects a small group cannot get locally",
      "Further Mathematics, separate sciences and Computer Science at A Level, taught live by subject specialists."
     ],
     [
      "Keep the NSC, add the international door",
      "Stay at your Centurion school for the NSC and take one to three Cambridge subjects with us, planned against the USAf exemption rules."
     ],
     [
      "Evenings back",
      "Live classes after school, at home, instead of a second commute to an extra-lessons centre."
     ]
    ],
    growingReason: "Centurion has grown from a dormitory suburb into a city of its own, with estates, offices and the Gautrain station drawing families who work on either side of it. Its households are disproportionately mobile: diplomatic, government, technology and corporate careers that may move city or country within a few years. That makes a portable, internationally read qualification unusually valuable here, and a live online school a practical way to add one without changing school.",
    curricula: {
     "cambridge": "Cambridge IGCSE, AS and A Level, taught live, with examinations at authorised centres in Gauteng that families book.",
     "ib": "IB Diploma Programme.",
     "american": "American curriculum with AP, for US-bound learners and US-linked families."
    },
    homeschoolDetail: "Centurion is in the City of Tshwane, so families educating full-time at home register with the Gauteng Department of Education under the South African Schools Act as amended by the BELA Act. Learners who stay enrolled at a school and take extra subjects online need no home-education registration.",
    homeTuitionDetail: "Teaching is online; families who also want in-person help usually combine our live classes with a local tutor for exam technique.",
    onlineLearningDetail: "Live classes on South Africa Standard Time (UTC+2), one hour behind our Nairobi base, with two teaching teams so slots are available across the day. Lessons are recorded for rewatching, and the classroom has a data-saver mode for mobile connections.",
    faqs: [
     {
      "q": "Can my child stay at a Centurion school and study Cambridge subjects with you?",
      "a": "Yes, and it is the most common arrangement. Your child keeps the NSC at school and takes one to three Cambridge subjects live with us after school, planned so that the combination supports the USAf exemption if needed."
     },
     {
      "q": "Do we need to register with the Gauteng Department of Education?",
      "a": "Only if your child studies full-time at home. Then you register for home education with the Gauteng Department of Education. A learner enrolled at a school who takes extra subjects online does not need home-education registration."
     },
     {
      "q": "What does it cost?",
      "a": "From USD 423/month for Primary (about R 7,700 at ~18 rand to the dollar), varying by curriculum and level. Examination entries are paid separately to the examination centre."
     },
     {
      "q": "Where are examinations written?",
      "a": "At authorised Cambridge or Pearson Edexcel examination centres in Gauteng, which families book. We help you find a centre with capacity for your child’s subjects and plan entries early."
     }
    ],
  },
  {
    slug: "umhlanga-za",
    name: "Umhlanga and Ballito",
    county: "KwaZulu-Natal",
    region: "Durban North Coast · uMhlanga Ridge to the Dolphin Coast · Near King Shaka International",
    primaryKeyword: "Online school and homeschooling in Umhlanga and Ballito",
    heroTagline: "For North Coast families from uMhlanga Rocks and La Lucia to Ballito, Zimbali and Salt Rock: estate living, a fast-growing coast, and children who need an international route without a long drive south.",
    intro: "Live online Cambridge IGCSE, AS and A Level, Pearson Edexcel, IB Diploma and American AP for families along the Durban North Coast: uMhlanga Rocks, Umhlanga Ridge, La Lucia, Mount Edgecombe, Sibaya, Cornubia and, further north, Ballito, Simbithi, Zimbali, Salt Rock and Sheffield Beach. The North Coast has grown faster than its school places, and families moving up from Durban, Johannesburg and abroad often find that the subject combination they want is either oversubscribed or a long drive away. A live online school brings the specialist to the estate.",
    heroImg: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600&q=80&auto=format&fit=crop",
    altTexts: {
     "hero": "The KwaZulu-Natal North Coast near Umhlanga and Ballito"
    },
    seoDesc: "Online school and homeschooling in Umhlanga and Ballito: live Cambridge IGCSE, A Level, Edexcel, IB and AP for North Coast families in La Lucia, Zimbali, Simbithi and Salt Rock.",
    challenges: [
     "A coast growing faster than its school places, with waiting lists for popular schools and long drives on the N2 for the rest.",
     "Families semigrating from Gauteng mid-year, when moving a child between schools is hardest.",
     "Remote-working households and returning families who want an international record that also works if they move abroad.",
     "Learners at strong local schools who want an A Level subject the school does not offer."
    ],
    familySituations: [
     "Ballito, Simbithi and Zimbali estate families who moved from Johannesburg and want continuity.",
     "uMhlanga Ridge professionals in finance, logistics and the Dube TradePort economy.",
     "Returning South African families who lived in the UK, the Gulf or Australia and want to keep their child on a British-system route.",
     "Surfing, sailing and sport-focused learners who need a timetable that fits training."
    ],
    nearbyAreas: [
     "uMhlanga Rocks",
     "Umhlanga Ridge",
     "La Lucia",
     "Mount Edgecombe",
     "Sibaya",
     "Cornubia",
     "Glenashley",
     "Durban North",
     "La Mercy",
     "Tongaat",
     "Ballito",
     "Simbithi Eco-Estate",
     "Zimbali",
     "Salt Rock",
     "Sheffield Beach",
     "Shaka’s Rock",
     "Westbrook",
     "Compensation Beach",
     "Blythedale",
     "KwaDukuza"
    ],
    subjects: [
     "Cambridge IGCSE, AS and A Level: Mathematics, Further Mathematics, English, the sciences as separate subjects, Computer Science, Economics, Business",
     "Pearson Edexcel International GCSE and International A Level",
     "IB Diploma Programme",
     "American curriculum with Advanced Placement",
     "SAT, IELTS and TOEFL preparation"
    ],
    whyChoose: [
     [
      "A semigration-proof record",
      "Move up the coast, back to Gauteng or abroad; the subjects and board stay the same."
     ],
     [
      "No N2 commute for one subject",
      "The specialist teaches live from home, after school or around training."
     ],
     [
      "Mid-year moves made easier",
      "Start with us when you arrive, whatever the month, and join a local school when a place opens."
     ],
     [
      "Returning-family continuity",
      "Children coming back from the UK or the Gulf stay on Cambridge or Edexcel without a gap."
     ]
    ],
    growingReason: "The Durban North Coast, from uMhlanga to Ballito, is one of the fastest-growing residential corridors in South Africa, driven by estate development, the King Shaka International Airport and Dube TradePort economy, and a steady stream of families semigrating from Gauteng and returning from abroad. School capacity has not kept pace, and many of the families arriving here are exactly those who value a portable, internationally read qualification.",
    curricula: {
     "cambridge": "Cambridge IGCSE, AS and A Level, with examinations at authorised centres in KwaZulu-Natal that families book.",
     "ib": "IB Diploma Programme.",
     "american": "American curriculum with AP."
    },
    homeschoolDetail: "Families educating full-time at home register with the KwaZulu-Natal Department of Education under the South African Schools Act as amended by the BELA Act. A learner enrolled at a school who adds online subjects needs no home-education registration.",
    homeTuitionDetail: "Teaching is online; families often pair our live classes with local sport, surf or music programmes during the day.",
    onlineLearningDetail: "Live classes on South Africa Standard Time (UTC+2), with two teaching teams so slots can be fitted around training and school. Lessons are recorded for rewatching.",
    faqs: [
     {
      "q": "We are moving to Ballito mid-year. Can my child start with you before a school place opens?",
      "a": "Yes. Your child can start live classes with us in any month and continue them alongside a local school once a place opens, so the move does not cost a term."
     },
     {
      "q": "Do we register with the KwaZulu-Natal Department of Education?",
      "a": "Only for full-time study at home. Learners who stay enrolled at a school and take extra subjects online do not need home-education registration."
     },
     {
      "q": "Can my child keep a British-system route after returning from the UK?",
      "a": "Yes. Cambridge IGCSE and A Level, or Pearson Edexcel International GCSE and A Level, continue with us exactly as they would have abroad, and South African university entry runs through the USAf exemption."
     },
     {
      "q": "What does it cost?",
      "a": "From USD 423/month for Primary (about R 7,700 at ~18 rand to the dollar), varying by curriculum and level. Examination entries are paid to the centre."
     }
    ],
  },
  {
    slug: "somerset-west-za",
    name: "Somerset West",
    county: "Western Cape",
    region: "Helderberg basin · City of Cape Town · Between the mountains and False Bay",
    primaryKeyword: "Online school and homeschooling in Somerset West",
    heroTagline: "For Helderberg families in Somerset West, Strand and Gordon’s Bay: wine-farm and estate living, semigrants from Gauteng, and teenagers who want subjects the local options cannot staff.",
    intro: "Live online Cambridge IGCSE, AS and A Level, Pearson Edexcel, IB Diploma and American AP for Helderberg families in Somerset West, Strand, Gordon’s Bay, Sir Lowry’s Pass and the estates in between: Erinvale, Helderberg Village, Spanish Farm, Heritage Park and the wine-farm valleys below the Hottentots-Holland mountains. Somerset West combines Cape Town convenience with a smaller-town feel, and it has drawn a large number of semigrants and remote workers. Many of them want a qualification that travels and a subject or two that the local schools cannot offer.",
    heroImg: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600&q=80&auto=format&fit=crop",
    altTexts: {
     "hero": "Somerset West in the Helderberg, Western Cape"
    },
    seoDesc: "Online school and homeschooling in Somerset West: live Cambridge IGCSE, A Level, Edexcel, IB and AP for Helderberg families in Strand, Gordon’s Bay and the estates. Alongside school or full-time.",
    challenges: [
     "Semigrant families from Gauteng arriving at different points in the year and finding popular schools full.",
     "Remote-working parents with international employers who want a record that would transfer abroad.",
     "Teenagers wanting A Level subjects such as Further Mathematics, Computer Science or separate sciences that small local cohorts cannot sustain.",
     "The drive into Cape Town for specialist teaching or examination preparation."
    ],
    familySituations: [
     "Erinvale, Helderberg Village and Spanish Farm families who semigrated from Johannesburg or Pretoria.",
     "Remote workers for UK, European or US employers who may relocate again.",
     "Wine-farm and agricultural families in the Helderberg valleys.",
     "Families whose children are at a local school and want one to three Cambridge subjects alongside it."
    ],
    nearbyAreas: [
     "Strand",
     "Gordon’s Bay",
     "Sir Lowry’s Pass",
     "Erinvale",
     "Helderberg Village",
     "Spanish Farm",
     "Heritage Park",
     "Somerset Lakes",
     "Stellenbosch (about 20 km)",
     "Firgrove",
     "Croydon",
     "Macassar",
     "Broadlands",
     "Bridgewater",
     "Paardevlei",
     "Land en Zeezicht",
     "Golden Acre",
     "Rome Glen",
     "Briza",
     "Mountainside"
    ],
    subjects: [
     "Cambridge IGCSE, AS and A Level: Mathematics, Further Mathematics, English, the sciences as separate subjects, Computer Science, Economics, Business",
     "Pearson Edexcel International GCSE and International A Level",
     "IB Diploma Programme",
     "American curriculum with Advanced Placement",
     "SAT, IELTS and TOEFL preparation"
    ],
    whyChoose: [
     [
      "Built for semigrants",
      "Arrive in any month and keep the same subjects and teachers through the move."
     ],
     [
      "Remote-work households",
      "A Cambridge or Edexcel record transfers if the family moves abroad for the next job."
     ],
     [
      "Small-cohort subjects",
      "A Level Further Mathematics, Computer Science and separate sciences taught live by specialists."
     ],
     [
      "No drive into the city",
      "Specialist teaching and examination preparation at home, after school."
     ]
    ],
    growingReason: "The Helderberg has become one of the main destinations for families semigrating to the Western Cape, and for remote workers who want space without losing access to Cape Town and its airport. Those families are mobile by temperament and often by employer, and they value a qualification that would transfer abroad. The local school market is good but finite, which is where a live online school adds the subjects and continuity families are looking for.",
    curricula: {
     "cambridge": "Cambridge IGCSE, AS and A Level, with examinations at authorised centres in the Western Cape that families book.",
     "ib": "IB Diploma Programme.",
     "american": "American curriculum with AP."
    },
    homeschoolDetail: "Families educating full-time at home register with the Western Cape Education Department under the South African Schools Act as amended by the BELA Act. Learners enrolled at a school who add online subjects do not need home-education registration.",
    homeTuitionDetail: "Teaching is online; for in-person support, families often combine our live classes with local tutoring.",
    onlineLearningDetail: "Live classes on South Africa Standard Time (UTC+2), with two teaching teams so slots are available across the day. Lessons are recorded for rewatching, with a data-saver mode for mobile connections.",
    faqs: [
     {
      "q": "We are semigrating to Somerset West. When can my child start?",
      "a": "In any month. Your child can start live classes before the move and continue through it, joining a local school when a place opens if you want one."
     },
     {
      "q": "Do we need to register with the Western Cape Education Department?",
      "a": "Only if your child studies full-time at home. A learner enrolled at a school who takes extra subjects online needs no home-education registration."
     },
     {
      "q": "My employer may move us abroad. Does the qualification travel?",
      "a": "Yes. Cambridge IGCSE and A Level and Pearson Edexcel International A Levels are read directly by universities in the UK, Europe, North America and Australia, and the teaching continues with us wherever you move."
     },
     {
      "q": "What does it cost?",
      "a": "From USD 423/month for Primary (about R 7,700 at ~18 rand to the dollar), varying by curriculum and level. Examination entries are paid to the centre."
     }
    ],
  },
  {
    slug: "bloemfontein-za",
    name: "Bloemfontein",
    county: "Free State",
    region: "Mangaung · Judicial capital · University of the Free State",
    primaryKeyword: "Online school and homeschooling in Bloemfontein",
    heroTagline: "For Bloemfontein families in Westdene, Universitas, Bayswater and Langenhoven Park: a university and legal city in the centre of the country, where international subject choice is narrower than in the metros.",
    intro: "Live online Cambridge IGCSE, AS and A Level, Pearson Edexcel, IB Diploma and American AP for Bloemfontein families in Westdene, Universitas, Bayswater, Fichardt Park, Langenhoven Park, Brandwag, Dan Pienaar, Hospitaalpark and the estates around the city. Bloemfontein is South Africa’s judicial capital and home to the University of the Free State, with a strong school tradition in both English and Afrikaans. What the city has less of is international subject choice: families who want Cambridge or Edexcel A Levels, or a subject the local school does not offer, usually look to Gauteng or board.",
    heroImg: "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=1600&q=80&auto=format&fit=crop",
    altTexts: {
     "hero": "Bloemfontein, the Free State capital"
    },
    seoDesc: "Online school and homeschooling in Bloemfontein: live Cambridge IGCSE, A Level, Edexcel, IB and AP for Free State families in Westdene, Universitas and Langenhoven Park, without boarding.",
    challenges: [
     "International subject choice in the Free State is narrower than in the metros, and boarding in Gauteng is the traditional answer.",
     "Academic and medical families at the university and the city’s hospitals who want options for study abroad.",
     "Legal-profession families linked to the Supreme Court of Appeal who may move between cities.",
     "Afrikaans-medium learners who want to add an English-medium international qualification."
    ],
    familySituations: [
     "University of the Free State academic families planning postgraduate years abroad.",
     "Medical families at Universitas and the city’s hospitals.",
     "Legal-profession households linked to the courts.",
     "Agricultural families across the Free State who want to avoid boarding at a young age."
    ],
    nearbyAreas: [
     "Westdene",
     "Universitas",
     "Bayswater",
     "Fichardt Park",
     "Langenhoven Park",
     "Brandwag",
     "Dan Pienaar",
     "Hospitaalpark",
     "Willows",
     "Pellissier",
     "Heuwelsig",
     "Woodland Hills",
     "Noordhoek",
     "Fauna",
     "Hilton",
     "Arboretum",
     "Lourier Park",
     "Botshabelo",
     "Thaba Nchu",
     "Brandfort"
    ],
    subjects: [
     "Cambridge IGCSE, AS and A Level: Mathematics, Further Mathematics, English, the sciences as separate subjects, Computer Science, Economics, Business",
     "Pearson Edexcel International GCSE and International A Level",
     "IB Diploma Programme",
     "American curriculum with Advanced Placement",
     "SAT, IELTS and TOEFL preparation"
    ],
    whyChoose: [
     [
      "International subjects without boarding",
      "Cambridge and Edexcel A Levels taught live, at home in Bloemfontein."
     ],
     [
      "Alongside a strong local school",
      "Keep the NSC at school and add one to three international subjects."
     ],
     [
      "Bilingual families",
      "Add an English-medium international qualification alongside an Afrikaans-medium school."
     ],
     [
      "Academic and medical families",
      "A record read directly by universities abroad, for children of families who may spend years overseas."
     ]
    ],
    growingReason: "Bloemfontein has a strong school tradition and a university and professional population with international connections, but the international subject market is smaller than in Johannesburg or Cape Town. For families who want Cambridge or Edexcel A Levels without sending a child away to board, a live online school is the practical answer.",
    curricula: {
     "cambridge": "Cambridge IGCSE, AS and A Level, with examinations at authorised centres that families book; we help find the nearest centre with capacity.",
     "ib": "IB Diploma Programme.",
     "american": "American curriculum with AP."
    },
    homeschoolDetail: "Families educating full-time at home register with the Free State Department of Education under the South African Schools Act as amended by the BELA Act. Learners enrolled at a school who add online subjects need no home-education registration.",
    homeTuitionDetail: "Teaching is online; examination travel is planned with each family, because the nearest centre for some subjects may be outside the city.",
    onlineLearningDetail: "Live classes on South Africa Standard Time (UTC+2), with lessons recorded for rewatching and a data-saver mode for weaker connections.",
    faqs: [
     {
      "q": "Can my child do Cambridge A Levels in Bloemfontein without boarding?",
      "a": "Yes. We teach Cambridge AS and A Level live online, and your child writes the examinations at an authorised centre that you book. We help find the nearest centre with capacity for your child’s subjects."
     },
     {
      "q": "My child is at an Afrikaans-medium school. Can they add an international qualification?",
      "a": "Yes. Many learners keep their school and the NSC and take one to three Cambridge subjects in English with us, which also strengthens their English for study abroad."
     },
     {
      "q": "Do we register with the Free State Department of Education?",
      "a": "Only for full-time study at home. Learners enrolled at a school who add online subjects do not need home-education registration."
     },
     {
      "q": "What does it cost?",
      "a": "From USD 423/month for Primary (about R 7,700 at ~18 rand to the dollar), varying by curriculum and level. Examination entries are paid to the centre."
     }
    ],
  },
  {
    slug: "polokwane-za",
    name: "Polokwane",
    county: "Limpopo",
    region: "Limpopo capital · On the N1 to Zimbabwe · Platinum and agriculture",
    primaryKeyword: "Online school and homeschooling in Polokwane",
    heroTagline: "For Polokwane families in Bendor, Fauna Park, Flora Park and Welgelegen: the capital of a mining and farming province, where international A Levels have usually meant boarding in Gauteng.",
    intro: "Live online Cambridge IGCSE, AS and A Level, Pearson Edexcel, IB Diploma and American AP for Polokwane families in Bendor, Fauna Park, Flora Park, Welgelegen, Ivy Park, Sterpark, Westenburg, Seshego and the estates on the city’s edge, and for families across Limpopo: Mokopane and the platinum operations to the west, the farming districts, and the towns on the road north to the Zimbabwe border. Polokwane is a provincial capital with a growing professional class, but international subject choice is limited, and many families have sent teenagers to board in Pretoria or Johannesburg.",
    heroImg: "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=1600&q=80&auto=format&fit=crop",
    altTexts: {
     "hero": "Polokwane, the Limpopo provincial capital"
    },
    seoDesc: "Online school and homeschooling in Polokwane and Limpopo: live Cambridge IGCSE, A Level, Edexcel, IB and AP for families in Bendor and Fauna Park and across the platinum belt, without boarding.",
    challenges: [
     "International subjects are rarely available locally, so A Level ambitions usually mean boarding in Gauteng.",
     "Mining and engineering families at platinum operations who may be transferred within South Africa or abroad.",
     "Long distances to examination centres for international qualifications.",
     "Professional families in government, health and the university who want options for study abroad."
    ],
    familySituations: [
     "Mining, engineering and contractor families at the platinum operations around Mokopane.",
     "Government and provincial-administration families in Polokwane.",
     "Medical and academic families linked to the University of Limpopo and the city’s hospitals.",
     "Farming families across Limpopo who want to delay boarding."
    ],
    nearbyAreas: [
     "Bendor",
     "Fauna Park",
     "Flora Park",
     "Welgelegen",
     "Ivy Park",
     "Sterpark",
     "Westenburg",
     "Seshego",
     "Mankweng",
     "Polokwane Extension",
     "Eduan Park",
     "Nirvana",
     "Annadale",
     "Mokopane",
     "Tzaneen",
     "Haenertsburg",
     "Louis Trichardt (Makhado)",
     "Lebowakgomo",
     "Modimolle",
     "Bela-Bela"
    ],
    subjects: [
     "Cambridge IGCSE, AS and A Level: Mathematics, Further Mathematics, English, the sciences as separate subjects, Computer Science, Economics, Business",
     "Pearson Edexcel International GCSE and International A Level",
     "IB Diploma Programme",
     "American curriculum with Advanced Placement",
     "SAT, IELTS and TOEFL preparation"
    ],
    whyChoose: [
     [
      "A Levels without boarding",
      "Live Cambridge and Edexcel A Levels at home in Polokwane."
     ],
     [
      "Mining-transfer continuity",
      "The record continues unchanged if the family moves to another operation or abroad."
     ],
     [
      "Examination planning from day one",
      "We plan centres and travel early, because the nearest centre can be far."
     ],
     [
      "Alongside the local school",
      "Keep the NSC and add the international subjects that open doors abroad."
     ]
    ],
    growingReason: "Limpopo’s platinum, agriculture and public-sector economies have built a professional class in and around Polokwane with national and international careers. The international school market has not followed at the same pace, so families who want Cambridge or Edexcel A Levels have usually had to board their children in Gauteng. A live online school lets them keep their children at home.",
    curricula: {
     "cambridge": "Cambridge IGCSE, AS and A Level, with examinations at authorised centres that families book, often in Gauteng.",
     "ib": "IB Diploma Programme.",
     "american": "American curriculum with AP."
    },
    homeschoolDetail: "Families educating full-time at home register with the Limpopo Department of Education under the South African Schools Act as amended by the BELA Act. Learners enrolled at a school who add online subjects need no home-education registration.",
    homeTuitionDetail: "Teaching is online; we plan examination travel with each family in advance.",
    onlineLearningDetail: "Live classes on South Africa Standard Time (UTC+2), with lessons recorded for rewatching and a data-saver mode that suits mobile and satellite connections.",
    faqs: [
     {
      "q": "Can my child study A Levels in Polokwane instead of boarding in Gauteng?",
      "a": "Yes. We teach Cambridge and Pearson Edexcel AS and A Levels live online. Examinations are written at authorised centres that families book; we plan the centre and travel with you from the start."
     },
     {
      "q": "We work at a platinum operation and may be transferred. What happens to the schooling?",
      "a": "It continues unchanged. The subjects, teachers and examination board stay the same wherever the next posting is, in South Africa or abroad."
     },
     {
      "q": "Does the internet in Limpopo cope with live classes?",
      "a": "Most families use fibre or mobile data, and some use satellite. Our classroom reconnects automatically and has a data-saver mode, and lessons are recorded for rewatching."
     },
     {
      "q": "What does it cost?",
      "a": "From USD 423/month for Primary (about R 7,700 at ~18 rand to the dollar), varying by curriculum and level. Examination entries are paid to the centre."
     }
    ],
  },
  {
    slug: "mbombela-za",
    name: "Mbombela (Nelspruit)",
    county: "Mpumalanga",
    region: "Mpumalanga capital · The Lowveld · Gateway to the Kruger National Park",
    primaryKeyword: "Online school and homeschooling in Mbombela (Nelspruit)",
    heroTagline: "For Lowveld families in Mbombela, White River, Hazyview and Barberton: citrus and macadamia farms, lodges near the Kruger, and children who need a route to university that does not start with boarding.",
    intro: "Live online Cambridge IGCSE, AS and A Level, Pearson Edexcel, IB Diploma and American AP for families across the Lowveld: Mbombela (formerly Nelspruit) in Sonheuwel, West Acres, Steiltes, Riverside Park and Stonehenge; White River; Hazyview and the lodges near the Kruger National Park; Barberton; and the farms of the Crocodile and Sabie valleys. Lowveld families live with distance, from farms, lodges and conservation work, and the traditional answer to secondary school has been boarding. A live online school offers another one.",
    heroImg: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600&q=80&auto=format&fit=crop",
    altTexts: {
     "hero": "The Lowveld around Mbombela, Mpumalanga"
    },
    seoDesc: "Online school and homeschooling in Mbombela (Nelspruit) and the Lowveld: live Cambridge IGCSE, A Level, Edexcel, IB and AP for families in White River, Hazyview, Barberton and on farms and lodges.",
    challenges: [
     "Distance: farms, lodges and conservation posts far from secondary schools with international subjects.",
     "Lodge, conservation and tourism families who move between properties and seasons.",
     "Farming families in citrus, macadamia and timber who want to delay boarding.",
     "Long travel to examination centres for international qualifications."
    ],
    familySituations: [
     "Lodge, safari and conservation families near the Kruger National Park.",
     "Citrus, macadamia and timber farming families in the Crocodile, Sabie and Kaap valleys.",
     "Professional families in Mbombela in government, health and business.",
     "International families on conservation or development contracts who need a portable record."
    ],
    nearbyAreas: [
     "Sonheuwel",
     "West Acres",
     "Steiltes",
     "Riverside Park",
     "Stonehenge",
     "Nelspruit Extension",
     "Valencia Park",
     "Drum Rock",
     "White River",
     "Hazyview",
     "Barberton",
     "Sabie",
     "Graskop",
     "Malelane",
     "Komatipoort",
     "Karino",
     "Kabokweni",
     "KaNyamazane",
     "Rocky Drift",
     "Plaston"
    ],
    subjects: [
     "Cambridge IGCSE, AS and A Level: Mathematics, Further Mathematics, English, the sciences as separate subjects, Computer Science, Economics, Business",
     "Pearson Edexcel International GCSE and International A Level",
     "IB Diploma Programme",
     "American curriculum with Advanced Placement",
     "SAT, IELTS and TOEFL preparation"
    ],
    whyChoose: [
     [
      "The specialist comes to the farm or lodge",
      "Live lessons wherever the family lives, with lessons recorded for rewatching."
     ],
     [
      "Delay or avoid boarding",
      "International subjects at home through the secondary years."
     ],
     [
      "Conservation and lodge mobility",
      "The same teachers and board as families move between properties or countries."
     ],
     [
      "Examination travel planned early",
      "We plan centres and travel with each family from the start."
     ]
    ],
    growingReason: "The Lowveld’s economy, tourism around the Kruger National Park, conservation, citrus, macadamia and timber, places families far from the schools that offer international subjects. Many have boarded their children in Gauteng or KwaZulu-Natal. With fibre in the towns and mobile or satellite connections elsewhere, a live online school now lets those families keep their children at home.",
    curricula: {
     "cambridge": "Cambridge IGCSE, AS and A Level, with examinations at authorised centres that families book.",
     "ib": "IB Diploma Programme.",
     "american": "American curriculum with AP."
    },
    homeschoolDetail: "Families educating full-time at home register with the Mpumalanga Department of Education under the South African Schools Act as amended by the BELA Act. Learners enrolled at a school who add online subjects need no home-education registration.",
    homeTuitionDetail: "Teaching is online; examination travel is planned with each family.",
    onlineLearningDetail: "Live classes on South Africa Standard Time (UTC+2). The classroom reconnects automatically after drops and has a data-saver mode suited to mobile and satellite links; lessons are recorded for rewatching.",
    faqs: [
     {
      "q": "We live on a lodge near the Kruger. Can our child study online with you?",
      "a": "Yes, provided you have a workable connection; many lodge families use satellite or mobile data. The classroom has a data-saver mode and reconnects automatically, and lessons are recorded for rewatching."
     },
     {
      "q": "Can our child avoid boarding for secondary school?",
      "a": "Yes. Your child can study Cambridge or Pearson Edexcel subjects live with us at home through IGCSE and A Level, either full-time with home-education registration or alongside a local school."
     },
     {
      "q": "Do we register with the Mpumalanga Department of Education?",
      "a": "Only for full-time study at home. Learners enrolled at a school who add online subjects need no home-education registration."
     },
     {
      "q": "What does it cost?",
      "a": "From USD 423/month for Primary (about R 7,700 at ~18 rand to the dollar), varying by curriculum and level. Examination entries are paid to the centre."
     }
    ],
  },
  {
    slug: "george-za",
    name: "George and the Garden Route",
    county: "Western Cape",
    region: "Garden Route · George, Wilderness, Knysna, Mossel Bay and Plettenberg Bay",
    primaryKeyword: "Online school and homeschooling in George and the Garden Route",
    heroTagline: "For Garden Route families from George and Wilderness to Knysna, Plettenberg Bay and Mossel Bay: one of South Africa’s favourite semigration destinations, with fewer international subject options than the cities families moved from.",
    intro: "Live online Cambridge IGCSE, AS and A Level, Pearson Edexcel, IB Diploma and American AP for families along the Garden Route: George in Heather Park, Denneoord, Blanco, Kingswood and Fancourt; Wilderness; Herold’s Bay and Victoria Bay; Knysna; Plettenberg Bay; Sedgefield; and Mossel Bay. The Garden Route has drawn a steady flow of families from Gauteng and abroad, many of them remote workers, and the region’s schools are good but smaller than those in the metros. Families who want a particular A Level subject or an international route often find the choice narrower than where they came from.",
    heroImg: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600&q=80&auto=format&fit=crop",
    altTexts: {
     "hero": "The Garden Route coast near George"
    },
    seoDesc: "Online school and homeschooling in George and the Garden Route: live Cambridge IGCSE, A Level, Edexcel, IB and AP for families in Wilderness, Knysna, Plettenberg Bay and Mossel Bay.",
    challenges: [
     "Semigrant and remote-working families arriving from Gauteng and abroad, often mid-year.",
     "Smaller local schools that cannot staff every A Level subject for a small group.",
     "Distances between towns along the N2 and to examination centres.",
     "Families who may move again, abroad or back to a city, within a few years."
    ],
    familySituations: [
     "Remote-working families in George, Wilderness and Sedgefield employed by international companies.",
     "Plettenberg Bay and Knysna families in tourism, hospitality and property.",
     "Mossel Bay families in the energy and port economy.",
     "Golf-estate and retirement-belt families raising teenagers who want university options abroad."
    ],
    nearbyAreas: [
     "Heather Park",
     "Denneoord",
     "Blanco",
     "Kingswood Golf Estate",
     "Fancourt",
     "Glen Barrie",
     "Eden",
     "Bergsig",
     "Pacaltsdorp",
     "Herold’s Bay",
     "Victoria Bay",
     "Wilderness",
     "Sedgefield",
     "Knysna",
     "Brenton-on-Sea",
     "Plettenberg Bay",
     "Mossel Bay",
     "Great Brak River",
     "Hartenbos",
     "Oudtshoorn"
    ],
    subjects: [
     "Cambridge IGCSE, AS and A Level: Mathematics, Further Mathematics, English, the sciences as separate subjects, Computer Science, Economics, Business",
     "Pearson Edexcel International GCSE and International A Level",
     "IB Diploma Programme",
     "American curriculum with Advanced Placement",
     "SAT, IELTS and TOEFL preparation"
    ],
    whyChoose: [
     [
      "For families who moved here for the life",
      "Keep the international subjects your child had in the city, without the city."
     ],
     [
      "Remote-work households",
      "A record that transfers if the next move is abroad."
     ],
     [
      "Every A Level subject",
      "Further Mathematics, Computer Science and separate sciences taught live, whatever the local cohort size."
     ],
     [
      "One record along the N2",
      "Move between Garden Route towns without changing curriculum."
     ]
    ],
    growingReason: "The Garden Route is one of the most popular semigration destinations in South Africa, and remote work has accelerated the trend. The families arriving are often professionals who had access to a wide school market in Johannesburg, Cape Town or abroad and want to keep their children’s international options open in a region where school cohorts are smaller. A live online school fills exactly that gap.",
    curricula: {
     "cambridge": "Cambridge IGCSE, AS and A Level, with examinations at authorised centres that families book; we plan travel where the nearest centre is distant.",
     "ib": "IB Diploma Programme.",
     "american": "American curriculum with AP."
    },
    homeschoolDetail: "Families educating full-time at home register with the Western Cape Education Department under the South African Schools Act as amended by the BELA Act. Learners enrolled at a school who add online subjects need no home-education registration.",
    homeTuitionDetail: "Teaching is online; families often combine it with the Garden Route’s outdoor and sports programmes during the day.",
    onlineLearningDetail: "Live classes on South Africa Standard Time (UTC+2), with two teaching teams for flexible slots, lessons recorded for rewatching and a data-saver mode.",
    faqs: [
     {
      "q": "We moved to the Garden Route from Johannesburg. Can our child keep Cambridge subjects?",
      "a": "Yes. Your child continues Cambridge or Pearson Edexcel subjects live with us, alongside a local school or full-time at home with registration, whatever the month you arrive."
     },
     {
      "q": "Can my child take an A Level subject the local school does not offer?",
      "a": "Yes. We teach A Level subjects such as Further Mathematics, Computer Science and separate sciences live, whatever the size of the local cohort."
     },
     {
      "q": "Do we register with the Western Cape Education Department?",
      "a": "Only for full-time study at home. Learners enrolled at a school who add online subjects need no home-education registration."
     },
     {
      "q": "What does it cost?",
      "a": "From USD 423/month for Primary (about R 7,700 at ~18 rand to the dollar), varying by curriculum and level. Examination entries are paid to the centre."
     }
    ],
  },
  {
    slug: "east-london-za",
    name: "East London",
    county: "Eastern Cape",
    region: "Buffalo City · Automotive and port city · Nahoon, Beacon Bay and Gonubie",
    primaryKeyword: "Online school and homeschooling in East London",
    heroTagline: "For East London families in Nahoon, Beacon Bay, Gonubie, Vincent and Berea: an automotive and port city where international subject choice is narrower than in the metros.",
    intro: "Live online Cambridge IGCSE, AS and A Level, Pearson Edexcel, IB Diploma and American AP for East London families in Nahoon, Beacon Bay, Gonubie, Vincent, Berea, Bunkers Hill, Abbotsford, Bonnie Doon and Quigney, and across Buffalo City. East London’s economy is built around automotive manufacturing, the port and the East London Industrial Development Zone, which bring professional families with international careers. Its schools have a strong tradition, but families who want international A Levels, or subjects their school cannot staff, often look to Gauteng, the Western Cape or boarding.",
    heroImg: "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=1600&q=80&auto=format&fit=crop",
    altTexts: {
     "hero": "East London on the Eastern Cape coast"
    },
    seoDesc: "Online school and homeschooling in East London: live Cambridge IGCSE, A Level, Edexcel, IB and AP for Buffalo City families in Nahoon, Beacon Bay and Gonubie, alongside school or full-time.",
    challenges: [
     "Automotive and industrial-zone families who may be transferred to another plant in South Africa or abroad.",
     "Limited local availability of international A Levels and specialist subjects.",
     "Distance from the larger examination centres in the metros.",
     "Families weighing boarding elsewhere for the final school years."
    ],
    familySituations: [
     "Automotive-industry management and engineering families on potential international transfers.",
     "Port, logistics and industrial-zone professional families.",
     "Medical, legal and academic families linked to the city’s hospitals and university campuses.",
     "Coastal families who want to keep teenagers at home rather than board."
    ],
    nearbyAreas: [
     "Nahoon",
     "Beacon Bay",
     "Gonubie",
     "Vincent",
     "Berea",
     "Bunkers Hill",
     "Abbotsford",
     "Bonnie Doon",
     "Quigney",
     "Selborne",
     "Stirling",
     "Baysville",
     "Cambridge",
     "Amalinda",
     "Dorchester Heights",
     "Kidd’s Beach",
     "Kei Mouth",
     "Mdantsane",
     "King William’s Town (Qonce)",
     "Bhisho"
    ],
    subjects: [
     "Cambridge IGCSE, AS and A Level: Mathematics, Further Mathematics, English, the sciences as separate subjects, Computer Science, Economics, Business",
     "Pearson Edexcel International GCSE and International A Level",
     "IB Diploma Programme",
     "American curriculum with Advanced Placement",
     "SAT, IELTS and TOEFL preparation"
    ],
    whyChoose: [
     [
      "Automotive-transfer continuity",
      "The same subjects and board if the family is moved to another plant or country."
     ],
     [
      "International A Levels at home",
      "Avoid boarding elsewhere for the final years."
     ],
     [
      "Alongside a strong local school",
      "Keep the NSC and add one to three international subjects."
     ],
     [
      "Examination planning early",
      "We plan centres and travel from the start."
     ]
    ],
    growingReason: "East London’s automotive plant, port and industrial development zone have built a professional community with international careers and the possibility of transfer. The city’s school tradition is strong, but international A Levels and specialist subjects are harder to find than in the metros, which is where a live online school helps families keep their children at home.",
    curricula: {
     "cambridge": "Cambridge IGCSE, AS and A Level, with examinations at authorised centres that families book.",
     "ib": "IB Diploma Programme.",
     "american": "American curriculum with AP, relevant for US-linked automotive families."
    },
    homeschoolDetail: "Families educating full-time at home register with the Eastern Cape Department of Education under the South African Schools Act as amended by the BELA Act. Learners enrolled at a school who add online subjects need no home-education registration.",
    homeTuitionDetail: "Teaching is online; examination travel is planned with each family.",
    onlineLearningDetail: "Live classes on South Africa Standard Time (UTC+2), with lessons recorded for rewatching and a data-saver mode for mobile connections.",
    faqs: [
     {
      "q": "We may be transferred by an automotive company. What happens to our child’s schooling?",
      "a": "It continues unchanged. The subjects, teachers and examination board stay the same wherever the next posting is, in South Africa or abroad."
     },
     {
      "q": "Can my child take A Levels in East London?",
      "a": "Yes. We teach Cambridge and Pearson Edexcel AS and A Levels live online, and your child writes the examinations at an authorised centre that you book; we help find one with capacity."
     },
     {
      "q": "Do we register with the Eastern Cape Department of Education?",
      "a": "Only for full-time study at home. Learners enrolled at a school who add online subjects need no home-education registration."
     },
     {
      "q": "What does it cost?",
      "a": "From USD 423/month for Primary (about R 7,700 at ~18 rand to the dollar), varying by curriculum and level. Examination entries are paid to the centre."
     }
    ],
  },
]

export const SOUTH_AFRICA_CITIES_LIST = SOUTH_AFRICA_CITIES.map(c => c.slug)

// ═══════════════════════════════════════════════════════════════════
// SOUTH_AFRICA_COUNTRY — Comprehensive country-level data for the SA hub
// ═══════════════════════════════════════════════════════════════════
export const SOUTH_AFRICA_COUNTRY = {
  slug: 'south-africa',
  name: 'South Africa',
  longName: 'Republic of South Africa',
  flag: '🇿🇦',
  hub: '/online-school/south-africa',
  hubPageId: 'homeschooling-south-africa',
  cityPageId: 'sa-city',
  currency: 'ZAR',
  currencyName: 'South African Rand',
  currencyPeg: { rate: 18.8, since: null, note: 'Floating, ~ZAR 18-19/USD typical 2026 range' },
  timezone: { code: 'SAST', name: 'South Africa Standard Time', utcOffset: 2, offsetFromEAT: -1 },
  examCentres: [
    'British Council Johannesburg (Parktown)',
    'British Council Cape Town (City Bowl)',
    'British Council Durban (Glenwood)',
    'Cambridge-authorised ISASA schools (Bishops, SACS, Crawford, Reddam House, AISJ)',
    'Michaelhouse, Hilton College (KZN boarding schools)',
  ],
  heroImage: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600&q=80&auto=format&fit=crop',
  heroEyebrow: 'Online homeschooling · Across South Africa',
  heroH1Suffix: 'South Africa',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for South African families across Johannesburg, Cape Town, Pretoria, Durban, Gqeberha, Stellenbosch.',
  heroValueProp: 'Lower than Cambridge Home School Online (UK). The Bishops / SACS / Herschel / Michaelhouse / Hilton / St Stithians / St John\'s / KES alternative. Built for semigration evaluators (UK, Australia, Canada, Mauritius, UAE), private school capacity-constrained families, plus African families wanting Cambridge curriculum portability. Load-shedding-resilient with recorded sessions.',
  whatsappTrigger: 'Hi Smartious, I would like online homeschooling for my child in South Africa.',
  citiesSectionTitle: 'Online homeschooling across South Africa',
  citiesSectionBody: 'Fourteen South African cities and regions. Each page covers local private school alternatives, BELA Act 2024 compliance, family situations and answers — from Johannesburg Sandton financial families to Cape Town City Bowl households to Stellenbosch Cape Winelands wine estate communities.',

  trustSignals: [
    { metric: 'Established', value: '2018', sub: 'Nairobi-based' },
    { metric: 'Curricula', value: '5', sub: 'Cambridge · Edexcel · IB · American AP · CBC' },
    { metric: 'Tutors', value: '78+', sub: 'PGCE-qualified subject specialists' },
    { metric: 'Countries served', value: '40+', sub: 'Africa · Gulf · Europe · Americas' },
    { metric: 'Physical centres', value: '2', sub: 'Diamond Plaza, Parklands · Karen West' },
    { metric: 'BELA Act ready', value: '2024', sub: 'Curriculum docs for DBE compliance' },
  ],

  competitorsIntro: 'South Africa has Africa\'s largest formal homeschool sector (100,000+ registered families) and a well-developed private school market. Below are major Cambridge, NSC, and IB curriculum schools plus established online providers South African families compare with Smartious. Fees are 2026 published ranges; ZAR-USD exchange rates fluctuate (~ZAR 18-19/USD typical range).',
  competitors: [
    {
      name: 'Bishops Diocesan College',
      city: 'Cape Town (Rondebosch)',
      curriculum: 'IEB / NSC + some Cambridge',
      feesAed: 'R 190,000+',
      feesUsd: '10,100+',
      rating: 'Established Cape Town elite school',
      capacityNote: 'Highly selective, multi-year waiting lists',
    },
    {
      name: 'St John\'s College',
      city: 'Johannesburg (Houghton)',
      curriculum: 'IEB / NSC',
      feesAed: 'R 230,000+',
      feesUsd: '12,200+',
      rating: 'Established Gauteng elite school',
      capacityNote: 'Selective admissions',
    },
    {
      name: 'Roedean School',
      city: 'Johannesburg (Parktown)',
      curriculum: 'IEB / NSC',
      feesAed: 'R 200,000+',
      feesUsd: '10,600+',
      rating: 'Established girls school',
      capacityNote: 'Waiting list for popular year groups',
    },
    {
      name: 'Michaelhouse',
      city: 'KwaZulu-Natal (Balgowan)',
      curriculum: 'IEB / NSC boarding',
      feesAed: 'R 280,000+',
      feesUsd: '14,900+',
      rating: 'Established KZN boarding',
      capacityNote: 'Boarding school commitment',
    },
    {
      name: 'AISJ (American International School Johannesburg)',
      city: 'Johannesburg',
      curriculum: 'American / IB Diploma',
      feesAed: 'USD 22,000 – 30,000',
      feesUsd: '22,000 – 30,000',
      rating: 'US Embassy school',
      capacityNote: 'International expat curriculum',
    },
    {
      name: 'Brainline',
      city: 'Online (SA-based)',
      curriculum: 'NSC / IEB-aligned',
      feesAed: 'R 42,000 – 60,000',
      feesUsd: '2,230 – 3,190',
      rating: 'Established SA online provider',
      capacityNote: 'Pre-recorded video lessons with tutor support',
    },
    {
      name: 'Impaq',
      city: 'Online (SA-based)',
      curriculum: 'NSC / CAPS-aligned',
      feesAed: 'R 40,000 – 55,000',
      feesUsd: '2,130 – 2,930',
      rating: 'Established SA online provider',
      capacityNote: 'Curriculum kits + assessment support',
    },
    {
      name: 'Cambridge Home School Online (UK)',
      city: 'Online (UK-based)',
      curriculum: 'Cambridge IGCSE & A-Level',
      feesAed: 'R 72,000 – 120,000',
      feesUsd: '3,830 – 6,380',
      rating: 'UK-based Cambridge online',
      capacityNote: 'UK time zone delivery (challenge for SA)',
    },
    {
      name: 'Smartious (live online)',
      city: 'All six South African cities',
      curriculum: 'Cambridge IGCSE & A-Level · Edexcel · IB · American AP · CBC',
      feesAed: 'R 41,000 – 123,000 (~USD 5,076)',
      feesUsd: '5,076 a year',
      rating: 'Live online · PGCE specialists · SAST time zone',
      capacityNote: 'Immediate enrolment — load-shedding-resilient',
      isUs: true,
    },
  ],

  legalFrameworkIntro: 'South Africa has Africa\'s most developed homeschool legal framework, updated by the BELA Act 2024 (Basic Education Laws Amendment Act). Here is what SA families need to know about homeschool registration, curriculum recognition, and university pathway access.',
  legalFramework: [
    {
      h: 'BELA Act 2024 — homeschool registration framework',
      p: 'The Basic Education Laws Amendment Act 2024 updated South Africa\'s homeschool registration framework. Families register with their provincial Department of Basic Education (DBE) — Western Cape Education Department (WCED), Gauteng DBE, KwaZulu-Natal DBE, Eastern Cape DBE, etc. Registration requires curriculum documentation, learning outcomes, and assessment plans. Smartious provides comprehensive curriculum, scheme of work, learning outcomes, and assessment documentation suitable for all provincial DBE registrations.',
    },
    {
      h: 'Provincial DBE registration requirements',
      p: 'Each province has slightly different administrative requirements but all align with national BELA Act framework. WCED (Western Cape) and Gauteng DBE are most established with online registration processes. Eastern Cape, KwaZulu-Natal, Free State, Limpopo, Mpumalanga, Northern Cape, North West follow parallel processes. Pestalozzi Trust (the established SA homeschool legal support organisation) provides excellent registration guidance and legal support if needed.',
    },
    {
      h: 'NSC vs Cambridge IGCSE/A-Level',
      p: 'NSC (National Senior Certificate) is the South African school-leaving qualification administered by Umalusi and IEB. NSC qualifications work for all South African universities (UCT, Wits, Stellenbosch, UJ, UP, etc.) but require credential evaluation for international universities. Cambridge IGCSE and A-Level qualifications are accepted by all major SA universities through the USAf exemption AND by international universities worldwide (UK, US, Canadian, Australian) without credential evaluation. For families considering semigration, Cambridge provides immediate international portability.',
    },
    {
      h: 'Cambridge International examination centres',
      p: 'British Council Johannesburg (Parktown), British Council Cape Town (City Bowl), British Council Durban (Glenwood) host Cambridge IGCSE and A-Level examinations during May/June and October/November series. Cambridge-authorised ISASA schools (Bishops, SACS, Crawford, Reddam House, AISJ, Michaelhouse, Hilton College) also serve as examination centres.',
    },
    {
      h: 'Semigration considerations',
      p: 'For families considering semigration to UK, Australia, Canada, Mauritius, Portugal, UAE, Cambridge IGCSE and A-Level qualifications provide seamless portability. Children mid-stream through Cambridge transfer to destination-country Cambridge schools or homeschool providers without curriculum bridging or academic year loss. This is the primary value proposition for semigration-evaluating families.',
    },
    {
      h: 'Load shedding and infrastructure realities',
      p: 'Stage 2-6 load shedding affects in-person school schedules across SA. Smartious live classes are recorded automatically — Stage 4-6 outages don\'t cost lessons. Students review missed content asynchronously via recording, complete associated work, and join the next live session caught up. Most SA homeschool families now use inverter/solar/UPS backup for live class attendance; Smartious works with both live and async patterns.',
    },
    {
      h: 'University acceptance — SA and worldwide',
      p: 'Cambridge IGCSE and A-Level qualifications are accepted by all SA universities — UCT, Wits, Stellenbosch, UWC, UP, UJ, UNISA, NMU, Rhodes — plus UK Russell Group, US Ivy League, Canadian U15, Australian Group of Eight universities. Students without the NSC enter SA universities through a USAf exemption based on their AS and A Level results, and each faculty sets its own requirements.',
    },
  ],

  whySmartious: [
    {
      h: 'Live Cambridge-trained PGCE teachers, not pre-recorded video',
      p: 'Many local SA online schools (Brainline, Impaq, ADvTech Online) rely heavily on pre-recorded video lessons with tutor support. Smartious is live online — every class is taught real-time by a Cambridge-trained PGCE-qualified subject specialist. Recordings are supplementary for catch-up, not primary instruction.',
    },
    {
      h: 'SAST live class scheduling matching SA school hours',
      p: 'Live classes run 9 AM – 6 PM SAST (UTC+2) — exactly matching Johannesburg, Cape Town, Pretoria, Durban school hours. Same time zone whether you\'re in Sandton, Constantia, Umhlanga, or Stellenbosch. Unlike UK-based Cambridge Home School Online (delivers in GMT/BST, 1-2 hours offset from SAST).',
    },
    {
      h: 'Load shedding resilience built in',
      p: 'Stage 2-6 load shedding affects in-person school schedules across SA. Every Smartious live class is recorded automatically. Outages affecting your area don\'t cost lessons — students review missed content async, complete associated work, and join the next live session caught up.',
    },
    {
      h: 'Semigration-ready curriculum portability',
      p: 'For families considering UK, Australia, Canada, Mauritius, Portugal, UAE moves over 2-5 year horizons, Cambridge IGCSE and A-Level qualifications transfer seamlessly. No transcript reconciliation, no curriculum bridging, no missed academic year. Cambridge is the most portable qualification internationally.',
    },
    {
      h: 'Lower than UK-based Cambridge Home School Online',
      p: 'Cambridge Home School Online (UK-based) typically charges R 6,000-10,000/month. Smartious is R 3,400-10,260/month — comparable Premium tier, meaningfully lower Online tier — delivered from Africa\'s own time zone, by African teachers serving African families.',
    },
    {
      h: 'BELA Act 2024 documentation ready',
      p: 'Smartious provides comprehensive curriculum, scheme of work, learning outcomes, and assessment documentation suitable for all provincial DBE compliance under BELA Act 2024. WCED, Gauteng DBE, KZN DBE, Eastern Cape DBE — all covered.',
    },
  ],

  faqs: [
    {
      q: 'How does Smartious compare to Brainline, Impaq, Cambridge Home School Online (UK), Wingu Academy, ADvTech Online?',
      a: 'Smartious is distinct from these in three ways. First: live Cambridge-trained PGCE teachers delivering instruction real-time, not pre-recorded video lessons with tutor support (the typical Brainline / Impaq / Wingu model). Second: SAST time zone delivery matching SA school hours (vs UK-based Cambridge Home School Online operating in GMT/BST). Third: 14-country student community providing international peer interaction (vs SA-only student bodies at most local providers). Pricing is competitive with local SA providers and meaningfully below UK-based Cambridge Home School Online.',
    },
    {
      q: 'Will my child miss out on sports, arts, and social development without a physical school?',
      a: 'A physical school provides a complete daily environment that an online programme does not replicate. However, many SA-based families combine Smartious academic instruction with local sports clubs (cricket, rugby, hockey, swimming, equestrian — SA has strong club infrastructure), music academies, scouts, debate, drama, plus the SA outdoor lifestyle (mountain biking, surfing, hiking). Smartious classes themselves provide regular live peer interaction across 40+ countries. Many families find the time freed from school commute and the academic depth from smaller class sizes more than compensates.',
    },
    {
      q: 'What about social interaction and peer relationships?',
      a: 'Smartious classes are small live groups of 4-6 students (Online tier) or smaller (Online Plus). Students attend the same classes with the same peers throughout the academic year, building relationships across the international student body spanning 40+ countries. SA families typically supplement with local sports clubs, church/synagogue/mosque communities, neighbourhood friendships. For semigration-evaluating families, the Smartious model provides more consistent peer relationships across moves than physical school relationships that reset with each relocation.',
    },
    {
      q: 'Can my SA child apply to UCT, Wits, Stellenbosch, UJ, UP with Cambridge qualifications?',
      a: 'Yes. UCT (University of Cape Town), Wits (University of the Witwatersrand), Stellenbosch University, UJ (University of Johannesburg), UP (University of Pretoria), UNISA, NMU, Rhodes, and all SA universities accept Cambridge IGCSE and A-Level qualifications. Students without the NSC enter SA universities through a USAf exemption based on their AS and A Level results, and each faculty sets its own requirements. The international portability is the additional advantage — same qualifications work for UK Russell Group, US Ivy League, Canadian U15, Australian Group of Eight, UAE branch campuses simultaneously.',
    },
    {
      q: 'My family is considering semigration to UK / Australia / Canada / Mauritius / UAE. How does Cambridge help?',
      a: 'Cambridge IGCSE and A-Level qualifications are the most portable internationally — accepted across the UK (Russell Group, all universities), Australia (Group of Eight, all universities), Canada (U15, all provinces), USA (Ivy League, all universities), UAE/Qatar branch campuses, Mauritius universities, Portugal/EU universities. Smartious students mid-stream through Cambridge can relocate to any destination without curriculum interruption, transcript reconciliation, or year-loss. This is particularly valuable for families on 2-5 year semigration evaluation timelines.',
    },
    {
      q: 'How does Smartious work with BELA Act 2024 homeschool registration?',
      a: 'Smartious provides comprehensive curriculum documentation suitable for all provincial DBE compliance under BELA Act 2024. Families register with their provincial Department of Basic Education (WCED, Gauteng DBE, KZN DBE, Eastern Cape DBE) and submit Smartious-provided curriculum, scheme of work, learning outcomes, and assessment documentation. Pestalozzi Trust (the established SA homeschool legal support organisation) provides additional registration guidance if needed.',
    },
    {
      q: 'How does load shedding affect Smartious classes?',
      a: 'Every Smartious live class is recorded automatically. Stage 2-6 load shedding outages affecting your area don\'t cost lessons — students review missed content asynchronously via the recording, complete any associated work, and join the next live session caught up. Families with inverter/solar/UPS backup attend live; families relying on Eskom grid use the recording-then-catch-up pattern. Most SA homeschool families now use at least basic inverter backup.',
    },
    {
      q: 'Are Smartious teachers qualified to deliver Cambridge curriculum?',
      a: 'Yes. Smartious teaching staff are PGCE-qualified (Postgraduate Certificate in Education) subject specialists with Cambridge International training. Teachers are based primarily in Nairobi, where Smartious operates two physical centres (Diamond Plaza, Parklands head office and Karen West). PGCE is the standard professional teaching credential used by Cambridge schools globally, including SA ISASA schools.',
    },
    {
      q: 'What technology and internet do we need at home?',
      a: 'Vodacom, MTN, or Telkom fibre internet (Vumatel, Openserve infrastructure) is more than sufficient. Mobile 4G/5G LTE also works well across major SA cities. For load shedding resilience, an inverter/solar/UPS backup is recommended. Starlink satellite is increasingly used in rural areas. Students need a laptop or desktop with webcam and microphone.',
    },
    {
      q: 'How does payment work in South African Rand (ZAR)?',
      a: 'Smartious tuition is denominated in USD (from USD 423 per month, about R 7,700 at a ZAR-USD rate of about 18, paid termly). Payments accepted via international card, PayPal, or EFT for SA residents. USD denomination provides stability against ZAR-USD volatility — particularly important for multi-year planning. Comparable to Brainline (R 3,500-5,000/month), Impaq (similar), well below Cambridge Home School Online UK (R 6,000-10,000/month).',
    },
    {
      q: 'What happens if we semigrate during my child\'s Cambridge programme?',
      a: 'Cambridge IGCSE and A-Level are designed for international portability. If you semigrate to UK, Australia, Canada, Mauritius, Portugal, UAE during your child\'s programme, they continue Cambridge IGCSE/A-Level either with Smartious (live online works from any reliable internet location worldwide) or transfer credentials to a Cambridge school in the new country. No transcript reconciliation, no curriculum bridging, no academic year loss. This portability is the primary reason semigration-evaluating families choose Cambridge.',
    },
    {
      q: 'How do we know if Smartious is the right fit for our family?',
      a: 'Book a free 15-minute consultation. We will discuss your child\'s current grade, target university destinations (SA, UK, Australia, Canada, US, anywhere), family situation (which city, semigration consideration timeline, child\'s learning preferences), and curriculum options. The consultation is genuinely no-commitment — we will be straightforward about whether Smartious or a different option (local SA private school, NSC-pathway online provider, hybrid approach) better fits your circumstances.',
    },
  ],

  ctaH: 'Ready to start your child\'s Cambridge journey from South Africa?',
  ctaSubhead: 'Free 15-minute consultation. We\'ll walk through your child\'s grade, target universities, and curriculum fit. No commitment.',
}
