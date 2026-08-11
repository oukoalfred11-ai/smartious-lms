// ═══════════════════════════════════════════════════════════════════
// ALGERIA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for hydrocarbon, corporate, diaspora, and Algerian
// families across Algiers, Oran, and Hassi Messaoud.
// NORTH AFRICA BUILD — 3 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
// Do NOT paste guessed stock-photo IDs.
//
// LEGAL POSITIONING NOTE — READ BEFORE EDITING:
// - Governing statute: LOI D'ORIENTATION SUR L'ÉDUCATION NATIONALE
//   n° 08-04 du 23 janvier 2008. Article 10: the State guarantees
//   the right to education without discrimination. Article 13:
//   education is free at all levels in State institutions. Article
//   38 places préscolaire (ages 3-6) expressly "en amont de la
//   scolarité obligatoire".
// - SCHOOLING IS FREE AND COMPULSORY TO AGE SIXTEEN. Structure:
//   enseignement fondamental of nine years from age six to fifteen,
//   then three years of secondary to the baccalauréat.
// - PARENTAL-CHOICE HOME EDUCATION IS NOT ESTABLISHED as a route we
//   can identify in the Loi d'orientation. PHRASE IT THAT WAY —
//   "not established / we are not aware of" plus "confirm with the
//   Ministère de l'Éducation nationale" — rather than asserting a
//   categorical prohibition we cannot fully evidence.
// - DISTANCE EDUCATION EXISTS AS A STATE FUNCTION: Algeria maintains
//   a national distance-education body (the ONEFD) through which
//   learners have followed national programmes and prepared for
//   national examinations. Mention it FACTUALLY and hedge — eligibility
//   and current arrangements are set by the ministry and confirmed
//   directly, not by us. Do not present it as a homeschooling route.
// - NATIONAL EXAMINATIONS (BEM at the end of fundamental education,
//   baccalauréat at the end of secondary) can in defined circumstances
//   be sat by independent candidates. State this HEDGED — eligibility
//   and procedure are ministry matters. Never promise it.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT throughout. The school
//   enrolment carries the compulsory-schooling duty; Cambridge or IB
//   runs live alongside it.
// LANGUAGE NOTE — PRACTICALLY IMPORTANT, NOT POLITICAL: instruction
// runs in Arabic through the fundamental years with French introduced
// progressively from the early primary grades, and French remains
// central at secondary level and in higher education, particularly in
// the sciences. Algeria is among the largest francophone populations
// in the world. From 2022 English began to be introduced in primary
// schools — a significant shift that makes an English-medium track
// more relevant than it once was. Mention the reform factually and
// without political framing.
// MARKET NOTE: the dominant international option is the FRENCH
// SYSTEM — the Lycée International Alexandre Dumas in Ben Aknoun,
// Algiers (opened 2002, with collège from 2008 and primary from
// 2012) is the anchor, and demand outstrips places. A
// British/Cambridge route is scarce to non-existent, which is
// precisely our opening. Economy: hydrocarbons above all —
// Sonatrach, the Hassi Messaoud and Hassi R'Mel fields, and the
// international oilfield-services companies working alongside them —
// plus Oran's petrochemical and port economy, Algiers' corporate,
// diplomatic and administrative sector, and a very large diaspora in
// France with real return and dual-residence flows.
// TIMEZONE: CET (UTC+1), no daylight saving — a FIXED TWO-HOUR
// offset behind Nairobi EAT every week of the year, with no
// seasonal drift. Say so; the "no DST on either side" point is real.
// ═══════════════════════════════════════════════════════════════════

export const ALGERIA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'algiers-dz',
    name: 'Algiers',
    county: 'Wilaya of Algiers',
    region: 'Capital · Sonatrach and the hydrocarbon sector\'s corporate centre · the diplomatic and administrative community · the French lycée system\'s anchor, heavily oversubscribed',
    primaryKeyword: 'Online school and international curriculum in Algiers',
    heroTagline: 'For Algiers families — the Cambridge route the capital has never had, taught live and landing in your afternoon.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Algiers families. Algiers carries Algeria\'s corporate and administrative weight — Sonatrach and the hydrocarbon sector\'s head offices, the ministries, the diplomatic and international-organisation community, and a professional class with long ties to France. Its international schooling is almost entirely the French system, anchored by the Lycée International Alexandre Dumas at Ben Aknoun, and demand for those places substantially exceeds supply. What the capital has never had is a British-curriculum route. Under the Loi d\'orientation of 2008 schooling is free and compulsory to sixteen, so our clean default is supplementary: your enrolment carries that duty, and we teach the Cambridge or IB track live alongside it.',
    heroImg: '/heroes/algiers-dz.jpg',
    altTexts: { hero: 'Algiers and the bay' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Algiers families — the British-curriculum route the capital lacks, supplementary beside your school. From USD 400/month.',
    challenges: [
      'International schooling in Algiers is overwhelmingly the French system, and places are heavily oversubscribed.',
      'A British or IB route is scarce to non-existent, so families targeting UK, Gulf, or North American universities have had no local path.',
      'Schooling is free and compulsory to sixteen under the Loi d\'orientation n° 08-04 of 2008.',
      'Hydrocarbon and diplomatic postings arrive and depart on contract timelines rather than admission cycles.',
      'Time zone: Algeria runs CET (UTC+1) with no daylight saving — a fixed two-hour offset behind Nairobi EAT all year, with no seasonal drift.',
    ],
    familySituations: [
      'Sonatrach and hydrocarbon-sector corporate families.',
      'Diplomatic, international-organisation, and development-sector families.',
      'Algerian professional families seeking a British-curriculum route that does not exist locally.',
      'Families on the French lycée waitlist needing a bridge or an alternative.',
      'Dual-residence and returning diaspora families with ties to France.',
      'Students targeting UK, Gulf, Canadian, or US universities.',
    ],
    nearbyAreas: ['Algiers centre', 'Hydra', 'Ben Aknoun', 'Chéraga', 'Dély Ibrahim', 'Bab Ezzouar', 'Blida'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE French, Arabic and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, Canadian, Gulf and Algerian university applications',
    ],
    whyChoose: [
      ['The British route the capital does not have', 'Algiers is a French-system city with a long waitlist and no real Cambridge alternative. That gap is the whole reason we are here.'],
      ['French alongside the English-medium core', 'In a country with one of the largest francophone populations in the world, Cambridge French sits naturally beside the academic track — and keeps French university options open.'],
      ['A fixed offset, all year', 'Algeria runs CET with no daylight saving and Kenya observes none either, so our teaching hours sit at a constant two-hour offset with no seasonal drift.'],
      ['An African school teaching African families', 'Smartious is Nairobi-built and Nairobi-taught, serving families in 53 countries — not a European provider reaching in.'],
      ['The law stated before anything is sold', 'Schooling is free and compulsory to sixteen under the Loi d\'orientation of 2008; we run supplementary alongside your school and send you to the Ministère for anything else.'],
    ],
    growingReason: 'Algiers holds Sonatrach and the hydrocarbon sector\'s corporate centre, the ministries, and the diplomatic community, with international schooling almost entirely French-system and heavily oversubscribed — and no British-curriculum route at all. Algeria runs CET (UTC+1) with no daylight saving, a fixed two-hour offset behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Algiers families, run supplementary alongside a school enrolment. Examinations at authorised centres confirmed per family per session, with regional options where local capacity is limited.',
      cbc: 'Kenya CBC available for Algiers families with East African ties.',
      ib: 'IB Diploma Programme — the international alternative to the French baccalauréat route for families who want it.',
      american: 'American Curriculum with AP — for families targeting American or Canadian universities.',
    },
    homeschoolDetail: 'Algerian education law is set by the Loi d\'orientation sur l\'éducation nationale n° 08-04 of 23 January 2008. The State guarantees the right to education without discrimination and education is free at all levels in State institutions; schooling is compulsory to the age of sixteen, running as nine years of enseignement fondamental from age six followed by three years of secondary to the baccalauréat. We are not aware of an established parental-choice home-education route under that law, and we phrase it that way deliberately rather than asserting a categorical prohibition we cannot fully evidence — a family whose plan turns on the point should confirm the current position with the Ministère de l\'Éducation nationale. Two related features are worth stating factually. Algeria maintains a national distance-education body through which learners have followed national programmes and prepared for national examinations, and the national examinations themselves — the BEM and the baccalauréat — can in defined circumstances be taken by independent candidates. Eligibility and procedure for both are ministry matters, confirmed directly, and neither is a homeschooling pathway we would present as such. What is unrestricted is structured education alongside a school enrolment, and that is what we build: the school carries the compulsory-schooling duty and the daily routine, while the Cambridge or IB track runs live in the after-school hours.',
    homeTuitionDetail: 'Smartious delivers to Algiers families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. With Algeria on CET year-round and Kenya two hours ahead with no daylight saving on either side, classes land in the Algiers afternoon at a constant time every week of the year, with every session recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Algeria?', a: 'Schooling is free and compulsory to sixteen under the Loi d\'orientation n° 08-04 of 2008, and we are not aware of an established parental-choice home-education route under that law. We put it in those terms rather than asserting a flat prohibition, and would tell any family whose plan depends on it to confirm with the Ministère de l\'Éducation nationale. Structured study alongside a school enrolment is unrestricted, and that is what we offer.' },
      { q: 'Is there a British-curriculum school in Algiers?', a: 'Not in any established form — international schooling here is overwhelmingly the French system, anchored by the Lycée International Alexandre Dumas, with demand well above supply. The absence of a Cambridge route is precisely the gap live delivery fills.' },
      { q: 'Can our child keep French while studying in English?', a: 'Yes, and most of our Algerian families do. Cambridge French runs alongside the English-medium academic core, which keeps French and Canadian university options open while adding UK and international ones.' },
      { q: 'What are the class times like?', a: 'Algeria runs CET all year with no daylight saving and Kenya observes none either, so our teaching hours sit at a fixed two-hour offset — classes land in the Algiers afternoon at the same time every week of the year.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'oran-dz',
    name: 'Oran',
    county: 'Wilaya of Oran',
    region: 'The second city and western capital · the Arzew petrochemical complex and the port · a university and medical-faculty centre · strong Spanish and French connections · almost no international schooling',
    primaryKeyword: 'Online school and international curriculum in Oran',
    heroTagline: 'For Oran and western Algerian families — the petrochemical west, four hundred kilometres from the capital\'s only international schools.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Oran families. Oran is Algeria\'s second city and the capital of its west — the Arzew petrochemical and LNG complex sits along the coast beside it, the port handles a substantial share of national trade, and the university and its medical faculty draw students from across the region. The city\'s Mediterranean orientation and its Spanish and French connections have always been part of its character. What it does not have is international schooling of any depth: the capital\'s provision is four hundred kilometres east. Smartious delivers the Cambridge and IB pathways live across the west, supplementary alongside your school enrolment.',
    heroImg: '/heroes/oran-dz.jpg',
    altTexts: { hero: 'Oran and the Mediterranean coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Oran and western Algeria families — petrochemical west, no international schooling. From USD 400/month.',
    challenges: [
      'Almost no international schooling in the second city, with Algiers four hundred kilometres east.',
      'Petrochemical and port employment with international partners but no matching English-medium schooling.',
      'Schooling is free and compulsory to sixteen under the Loi d\'orientation of 2008.',
      'Exam sittings mean Algiers or regional windows, planned ahead.',
      'Time zone: Oran shares CET (UTC+1) with no daylight saving — a fixed two-hour offset behind Nairobi EAT.',
    ],
    familySituations: [
      'Arzew petrochemical, LNG, and port-industry engineering families.',
      'University and medical-faculty academic families.',
      'Professional and business families across the west with no local international option.',
      'Dual-residence families with ties to France and Spain.',
      'Students aiming at engineering, medicine, or business programmes abroad.',
    ],
    nearbyAreas: ['Oran centre', 'Es Sénia', 'Arzew', 'Bethioua', 'Aïn El Turk', 'Sidi Bel Abbès', 'Mostaganem'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE French, Spanish, Arabic and home language support',
      'Cambridge A-Level Chemistry, Physics, Mathematics, Further Mathematics, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Chemistry, AP Physics, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, Spanish, Canadian and Algerian university applications',
    ],
    whyChoose: [
      ['Chemistry and physics depth for a petrochemical region', 'Cambridge A-Level Chemistry, Physics, and Mathematics — led by a founder with a BEd in Mathematics and Physics — suit the Arzew complex\'s families precisely.'],
      ['The complete option four hundred kilometres from anywhere', 'Identical live delivery in Oran and Algiers — no relocation, no boarding decision.'],
      ['French and Spanish alongside the academic core', 'A Mediterranean city with long ties across the water can run Cambridge French or Spanish beside the English-medium track.'],
      ['A fixed offset, all year', 'Oran and Nairobi sit two hours apart with no daylight saving on either side, so class times never drift.'],
      ['The law stated before anything is sold', 'Schooling is compulsory to sixteen; we run supplementary alongside your school.'],
    ],
    growingReason: 'Oran is Algeria\'s second city and western capital — the Arzew petrochemical and LNG complex, a major port, and a university with a substantial medical faculty — with almost no international schooling and Algiers four hundred kilometres east. Oran shares CET (UTC+1) with no daylight saving, a fixed two-hour offset behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for western Algeria, run supplementary alongside a school enrolment. Examination sittings planned per session with travel scheduled ahead.',
      cbc: 'Kenya CBC available for western Algerian families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American or Canadian universities.',
    },
    homeschoolDetail: 'The national framework applies in Oran: schooling is free and compulsory to sixteen under the Loi d\'orientation n° 08-04 of 2008, and we are not aware of an established parental-choice home-education route under that law — a position to confirm with the Ministère de l\'Éducation nationale rather than take from a provider. Algeria\'s national distance-education body and the independent-candidate arrangements for the BEM and baccalauréat are ministry matters, stated here factually and not presented as pathways. The supplementary configuration therefore carries the school years, with the Cambridge or IB track running live alongside toward external examinations.',
    homeTuitionDetail: 'Smartious delivers to Oran families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing in the Oran afternoon at a constant time on the fixed two-hour offset, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Oran?', a: 'Almost none — the country\'s provision sits in Algiers, four hundred kilometres east, and is overwhelmingly the French system. Live online delivery is the complete option for the west.' },
      { q: 'Where do Oran students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with travel planned into each series ahead.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'hassi-messaoud-dz',
    name: 'Hassi Messaoud & the Sahara',
    county: 'Wilaya of Ouargla and the southern fields',
    region: 'Algeria\'s oil capital · Sonatrach and the international oilfield-services companies · Hassi R\'Mel and the southern gas fields · a rotational technical workforce a thousand kilometres from any international school',
    primaryKeyword: 'Online school and international curriculum in Hassi Messaoud',
    heroTagline: 'For Hassi Messaoud and southern field families — Algeria\'s oil capital, staffed from four continents and schooled from none of them.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families across Algeria\'s southern hydrocarbon fields. Hassi Messaoud is Algeria\'s oil capital — the country\'s largest field, with Sonatrach and the international oilfield-services companies operating alongside it, and the Hassi R\'Mel gas complex and the southern fields spread across the Sahara around it. The technical workforce is drawn from four continents and works rotations; the nearest international schooling is around eight hundred kilometres north in Algiers. For decades the answer has been families living apart, or children boarding abroad. Smartious delivers the international pathways live to the fields instead, at a fixed two-hour offset that never drifts.',
    heroImg: '/heroes/hassi-messaoud-dz.jpg',
    altTexts: { hero: 'The Algerian Sahara and the southern oilfields' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Hassi Messaoud, Ouargla and southern field families — oil capital, no schooling within 800km. From USD 400/month.',
    challenges: [
      'An internationally recruited technical workforce with no international schooling within around eight hundred kilometres.',
      'Rotational contracts split families across countries and continents for much of the year.',
      'Boarding abroad or a separated household have been the standard answers.',
      'Schooling is free and compulsory to sixteen under the Loi d\'orientation of 2008 for children resident in Algeria.',
      'Time zone: the south shares CET (UTC+1) with no daylight saving — a fixed two-hour offset behind Nairobi EAT.',
    ],
    familySituations: [
      'Sonatrach and oilfield-services engineering, geology, and drilling families.',
      'International technical and management staff on rotational contracts.',
      'Gas-complex families at Hassi R\'Mel and the southern fields.',
      'Households split between a field posting and a home base elsewhere.',
      'Students aiming at petroleum engineering, geoscience, or related programmes abroad.',
    ],
    nearbyAreas: ['Hassi Messaoud', 'Ouargla', 'Hassi R\'Mel', 'Touggourt', 'In Amenas', 'Ghardaïa', 'the southern fields'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE French, Arabic and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Geography',
      'Cambridge A-Level Biology, Economics, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Chemistry',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including petroleum and geoscience programmes), Common Application (US), and French, Canadian and Gulf university applications',
    ],
    whyChoose: [
      ['Schooling that survives a rotation', 'One live pathway held constant across field postings — same teachers, same syllabus, same examination board — the case our Baku, Stavanger, Fier, and Copperbelt families have proven.'],
      ['Geoscience and engineering depth', 'Cambridge A-Level Physics, Chemistry, Mathematics, and Geography — the exact spine a hydrocarbon workforce\'s children aim at.'],
      ['An alternative to a separated household', 'Field families have kept children abroad or lived apart for decades. Live teaching reaches the field instead.'],
      ['A fixed offset, all year', 'The south and Nairobi sit two hours apart with no daylight saving on either side — class times never drift, whatever the roster.'],
      ['Portable to the next posting', 'Hassi Messaoud now, the Gulf, West Africa, or the North Sea next — the curriculum and the board stay constant.'],
    ],
    growingReason: 'Hassi Messaoud is Algeria\'s oil capital — the country\'s largest field, with Sonatrach and the international oilfield-services companies alongside it and the Hassi R\'Mel gas complex across the Sahara — with an internationally recruited rotational workforce and no international schooling within around eight hundred kilometres. The south shares CET (UTC+1) with no daylight saving, a fixed two-hour offset behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the southern fields, portable across postings. Examination sittings planned per session with travel scheduled well ahead.',
      cbc: 'Kenya CBC available for field families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American or Canadian universities.',
    },
    homeschoolDetail: 'The national framework applies in the south for children resident in Algeria: schooling is free and compulsory to sixteen under the Loi d\'orientation n° 08-04 of 2008, and we are not aware of an established parental-choice home-education route under that law — confirm with the Ministère de l\'Éducation nationale. The supplementary configuration is the natural one for field families: the local school carries the duty while the Cambridge track runs live alongside and continues unchanged to the next posting, wherever in the world it is. Families who are not resident in Algeria — including rotational staff whose households remain registered elsewhere — follow their country of residence\'s framework, a status they determine with their own advisers.',
    homeTuitionDetail: 'Smartious delivers to southern field families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS at a constant two-hour offset with no seasonal drift, every session recorded — built for rotations, remote sites, and split households.',
    faqs: [
      { q: 'We are on a field rotation — does the schooling follow us?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next posting anywhere in the world, with examinations sat at authorised centres wherever the family is. Only the local legal framework changes, and we plan that part.' },
      { q: 'Is there any international schooling in the south?', a: 'None within around eight hundred kilometres — the country\'s provision is in Algiers and is overwhelmingly French-system. Live delivery is the only route that reaches the fields.' },
      { q: 'Our household is split between the field and another country — how does that work?', a: 'The teaching is identical wherever the child is, and the recorded library covers travel. Which national framework applies turns on the child\'s residence, which is a question for your own advisers.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const ALGERIA_COUNTRY = {
  slug: 'algeria',
  name: 'Algeria',
  longName: 'People\'s Democratic Republic of Algeria',
  adjective: 'Algerian',
  flag: '🇩🇿',
  hub: '/online-school/algeria',
  hubPageId: 'homeschooling-algeria',
  cityPageId: 'algeria-city',

  currency: 'DZD',
  currencyName: 'Algerian Dinar',
  currencyPeg: 'Fees are invoiced in USD; dinar equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'CET',
    name: 'Central European Time (UTC+1), no daylight saving',
    utcOffset: '+1',
    offsetFromEAT: '-2 hours, fixed, every week of the year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Algiers checked first, with regional and cross-border options where local capacity is limited'],
  examCentreTiles: [
    { city: 'Algiers', centre: 'Authorised provision', area: 'The country\'s main external-candidate capacity, confirmed per family per session.' },
    { city: 'Oran and the west', centre: 'Planned per session', area: 'Western families plan travel into each examination window ahead.' },
    { city: 'The southern fields', centre: 'Planned well ahead', area: 'Hassi Messaoud and Ouargla families plan sittings with travel scheduled several weeks in advance.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Algeria-based students sit as external candidates at authorised provision, with capacity confirmed per family per session — Algiers is checked first, and western and southern families plan travel into each series well ahead given the distances. Separately, and stated factually rather than as a pathway: Algeria maintains a national distance-education body through which learners have followed national programmes, and the national examinations — the BEM at the end of fundamental education and the baccalauréat at the end of secondary — can in defined circumstances be taken by independent candidates, with eligibility and procedure set by the ministry and confirmed directly. Our arrangement is supplementary, so a family\'s school continues its own national track unchanged while the Cambridge calendar runs alongside; the two are planned together at enrolment rather than one replacing the other.',
  secondaryProgrammeExamRef: 'Authorised Algiers and regional provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/algeria.jpg',
  heroEyebrow: 'Online school for Algeria',
  heroH1Suffix: 'Algeria',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for hydrocarbon, corporate, diaspora, and Algerian families across Algiers, Oran, and Hassi Messaoud. International schooling here is almost entirely the French system and heavily oversubscribed — the British-curriculum route simply does not exist locally. Taught live from Nairobi at a fixed two-hour offset that never drifts.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — supplementary beside your school, with French kept alongside.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Algeria',

  citiesSectionTitle: 'Where our Algeria families are',
  citiesSectionBody: 'Smartious Algeria families concentrate across Algiers (Sonatrach and the hydrocarbon corporate sector, the ministries, the diplomatic community, and the oversubscribed French lycée system), Oran (the Arzew petrochemical and LNG complex, the port, and a major university and medical faculty, four hundred kilometres from the capital), and Hassi Messaoud and the southern fields (Algeria\'s oil capital, staffed from four continents and around eight hundred kilometres from any international school). One compulsory framework, one supplementary configuration, and a British route the country has never had.',

  trustSignals: [
    { h: 'An African school teaching African families', p: 'Smartious was founded in Nairobi in 2019 and teaches from two operational centres established 2022 and 2023 — an African school with international accreditation, serving students in 53 countries, not a European provider reaching in.' },
    { h: 'A fixed offset that never drifts', p: 'Algeria runs CET (UTC+1) with no daylight saving and Kenya runs EAT (UTC+3) with none either. The two-hour gap is constant every week of the year, so class times are the same in January as in July.' },
    { h: 'The route the country does not have', p: 'International schooling in Algeria is overwhelmingly the French system and heavily oversubscribed. A British or Cambridge pathway is scarce to non-existent — which is precisely the gap live delivery fills.' },
    { h: 'The law stated before anything is sold', p: 'Schooling is free and compulsory to sixteen under the Loi d\'orientation n° 08-04 of 2008. We are not aware of an established parental home-education route and say so in those terms, pointing families to the Ministère de l\'Éducation nationale.' },
  ],

  universitiesInCountry: 'The University of Algiers and the USTHB, the University of Oran and its medical faculty, Constantine, Tlemcen, Annaba, and the grandes écoles including the École Nationale Polytechnique and the École Nationale Supérieure d\'Informatique.',
  universityChannels: 'Algerian universities admit on the national baccalauréat, and holders of foreign secondary qualifications apply through recognition and equivalence procedures with requirements confirmed per institution — a family planning to return into the Algerian system should confirm that route specifically rather than assume it. Where an internationally examined record does most work is outward, and for Algerian families that means several directions at once: French universities remain a principal destination and read Cambridge A-Levels and the IB routinely, as do Canadian institutions — particularly in Québec, a long-standing destination for Algerian students. UCAS reads A-Levels natively, the Common Application serves US plans, Gulf universities read them directly, and A-Levels are accepted in 160+ countries, including the petroleum and geoscience programmes the southern fields\' families most often have in view. Smartious provides personalised university guidance across French, Canadian, UK (UCAS), Gulf, and US destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Algeria families. Cambridge IGCSE (Years 10-11) and Cambridge A-Level (Years 12-13) delivered as live online classes at a fixed two-hour offset with no seasonal drift, run supplementary alongside a school enrolment as the Loi d\'orientation requires — with Cambridge French available alongside so French and Canadian options stay open. Examinations at authorised provision confirmed per session. Pathway read natively by UK universities via UCAS, read routinely in France, Canada, and the Gulf, and accepted in 160+ countries.',
  britishCurriculumSuits: 'Algeria families targeting the Cambridge pathway. Best fit for: (1) hydrocarbon families at Hassi Messaoud, Hassi R\'Mel, and the southern fields where no schooling exists within hundreds of kilometres, (2) Algiers families on the French lycée waitlist or wanting a British route that does not exist locally, (3) Oran and western families four hundred kilometres from any provision, (4) dual-residence and diaspora families with ties to France and Canada, (5) students targeting UK, Gulf, Canadian, or US universities.',
  britishCurriculumDelivery: 'Live online classes at a constant two-hour offset, small groups 4-6 students, every session recorded. Cambridge examinations at authorised provision, confirmed per session.',
  ibDiplomaSuits: 'Algeria families wanting the IB Diploma\'s breadth as an international alternative to the French baccalauréat route.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Algeria families targeting American or Canadian universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to African and internationally mobile families at online-delivery fees rather than campus ones. Algeria families join students in 53 other countries — from Hassi Messaoud to Nairobi\'s own Diamond Plaza HQ, the Sahara to the Mediterranean.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the southern fields\' petroleum-engineering families and Oran\'s petrochemical and medical households. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Algeria\'s international schooling is a French-system story concentrated in Algiers, and the anchor institution is good and heavily oversubscribed. Outside the capital the picture thins to almost nothing, and in the southern hydrocarbon fields there is nothing at all. What is missing everywhere, including in Algiers, is a British or Cambridge route — which makes the competitive space here unusually clear, because we are not competing with an existing provider so much as filling an absence.',
  competitors: [
    { name: 'Lycée International Alexandre Dumas',            city: 'Algiers (Ben Aknoun)',  curriculum: 'French system',                         feesUsd: 'Premium capital tier',                              feesAed: 'Heavily oversubscribed',  rating: 4.6, capacityNote: 'The anchor international school — French curriculum, demand well above supply' },
    { name: 'Private and bilingual schools',                  city: 'Algiers, Oran',         curriculum: 'Algerian and French-leaning',           feesUsd: 'Mid tier',                                          feesAed: 'Varies',                  rating: 4.1, capacityNote: 'Useful, national or French-oriented — not a British or IB route' },
    { name: 'Oran and the west',                              city: 'Western Algeria',       curriculum: 'Almost none',                           feesUsd: 'No real international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'The second city and the petrochemical coast, four hundred kilometres from the capital' },
    { name: 'The southern fields',                            city: 'Hassi Messaoud, Ouargla', curriculum: '—',                                   feesUsd: 'Nothing within ~800km',                             feesAed: '—',                       rating: 0,   capacityNote: 'Algeria\'s oil capital, staffed internationally, with no schooling to match' },
    { name: 'Boarding abroad',                                city: 'France, Tunisia, Gulf', curriculum: 'French and international',              feesUsd: 'Fees plus travel plus a child living away',         feesAed: '—',                       rating: 4.3, capacityNote: 'The traditional answer for field and western families' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh (online)', city: 'Online',                curriculum: 'Cambridge self-paced / UK online',      feesUsd: 'Per-subject / GBP 9,000-11,000',                    feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Self-paced or priced far above Smartious, and none carries French alongside the English-medium core' },
    { name: 'Smartious Homeschool (Algeria via online delivery)', city: 'Delivered to all Algeria', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'DZD equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + the British route the country lacks + French kept alongside + the southern fields reached at last + a fixed offset that never drifts' },
  ],

  legalFrameworkIntro: 'Algerian education law is set by a single orientation law and is straightforward to describe. Here it is exactly, including the two features families most often misread.',
  legalFramework: [
    { h: 'The governing statute', p: 'The Loi d\'orientation sur l\'éducation nationale n° 08-04 of 23 January 2008 governs the system. Article 10 provides that the State guarantees the right to education to every Algerian without discrimination based on sex, social origin, or geographical origin; article 13 provides that education is free at all levels in State institutions; and article 38 places préscolaire education, covering ages three to six, expressly upstream of compulsory schooling. Schooling is free and compulsory to the age of sixteen, running as nine years of enseignement fondamental from age six followed by three years of secondary education to the baccalauréat.' },
    { h: 'Home education: what we can and cannot say', p: 'We are not aware of an established parental-choice home-education route under the Loi d\'orientation, and we phrase it in exactly those terms. A confident assertion that home education is categorically prohibited is more than we can evidence from the statute text; a suggestion that it is freely available would be worse. A family whose plan turns on the point should confirm the current position with the Ministère de l\'Éducation nationale rather than rely on any provider\'s summary, including ours. What is not in doubt is that structured education alongside a school enrolment is unrestricted, which is the configuration we build.' },
    { h: 'Two features families misread — stated factually', p: 'First, Algeria maintains a national distance-education body through which learners have followed national programmes and prepared for national examinations. Second, the national examinations themselves — the BEM at the end of fundamental education and the baccalauréat at the end of secondary — can in defined circumstances be taken by independent candidates. Both are real, and neither is a homeschooling route. Eligibility, procedure, and current arrangements for each are ministry matters to be confirmed directly, and we mention them because families encounter them and read more into them than they carry.' },
    { h: 'Language, and why an English-medium track fits differently here now', p: 'Instruction runs in Arabic through the fundamental years with French introduced progressively from the early primary grades, and French remains central at secondary level and in higher education, particularly in the sciences — Algeria has one of the largest francophone populations in the world. From 2022, English began to be introduced in primary schools, which is a significant shift and makes an English-medium international track more relevant than it was a decade ago. Practically, our Algerian families almost always keep Cambridge French running alongside the English-medium core, because it protects French and Canadian university options while adding UK, Gulf, and American ones.' },
    { h: 'The gap that is specific to Algeria', p: 'In most countries we serve, the question is whether an international school is affordable or whether there is a place. In Algeria the question is more basic: there is essentially no British or Cambridge route to be on a waitlist for. International schooling here means the French system, anchored by the Lycée International Alexandre Dumas in Algiers and heavily oversubscribed, with almost nothing outside the capital and nothing at all in the southern fields. A family that wants an internationally examined English-medium record has historically had two options — send the child abroad, or do without.' },
    { h: 'Where the qualifications lead', p: 'Algerian universities admit on the national baccalauréat, and foreign qualifications go through recognition and equivalence procedures with requirements confirmed per institution — worth confirming specifically if a return into the Algerian system is the plan. Outward, the record travels widely: French universities remain a principal destination and read Cambridge A-Levels and the IB routinely, as do Canadian institutions, particularly in Québec; UCAS reads A-Levels natively; Gulf universities read them directly; the Common Application serves US plans; and A-Levels are accepted in 160+ countries, including the petroleum and geoscience programmes the southern fields\' families most often have in view.' },
  ],

  whySmartious: [
    { h: 'The British route Algeria does not have',                         p: 'International schooling here is the French system, oversubscribed and capital-bound. A Cambridge pathway is scarce to non-existent — we are filling an absence rather than competing for a share.' },
    { h: 'French kept alongside, deliberately',                             p: 'Cambridge French runs beside the English-medium core, so French and Canadian university options stay open while UK, Gulf, and American ones open up.' },
    { h: 'A fixed offset that never drifts',                                p: 'Neither Algeria nor Kenya observes daylight saving, so the two-hour gap is constant — class times are identical in January and July.' },
    { h: 'The southern fields reached at last',                             p: 'Hassi Messaoud is around eight hundred kilometres from any international school. Live teaching reaches the field, and travels to the next posting.' },
    { h: 'Careful where the law is not fully evidenced',                    p: 'We say "not established" and name the Ministère rather than asserting a prohibition we cannot document — and we do not dress up the distance-education body or independent-candidate rules as homeschooling routes.' },
    { h: 'An African school teaching African families',                     p: 'Nairobi-built and Nairobi-taught, serving 53 countries, working to African calendars and examination realities.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Algeria?', a: 'Schooling is free and compulsory to sixteen under the Loi d\'orientation n° 08-04 of 2008, and we are not aware of an established parental-choice home-education route under that law. We put it in those terms rather than asserting a categorical prohibition, and would tell any family whose plan depends on it to confirm with the Ministère de l\'Éducation nationale. Structured study alongside a school enrolment is unrestricted.' },
    { q: 'Is there a British or Cambridge school in Algeria?', a: 'Not in any established form. International schooling here is overwhelmingly the French system, anchored by the Lycée International Alexandre Dumas in Algiers and heavily oversubscribed, with almost nothing outside the capital. The absence of a Cambridge route is the gap we exist to fill.' },
    { q: 'What about the national distance-education body and independent candidates?', a: 'Both are real and neither is a homeschooling route. Algeria maintains a national distance-education body, and the BEM and baccalauréat can in defined circumstances be sat by independent candidates — eligibility and procedure are ministry matters to confirm directly. We state them factually because families read more into them than they carry.' },
    { q: 'Can our child keep French while studying in English?', a: 'Yes, and most of our Algerian families do. Cambridge French runs alongside the English-medium core, protecting French and Canadian university options while adding UK, Gulf, and US ones.' },
    { q: 'We are posted at Hassi Messaoud — what are the options?', a: 'Historically, boarding abroad or a separated household, because there is no international schooling within around eight hundred kilometres. Live teaching reaches the field, with examination travel a few times a year, and continues unchanged to the next posting.' },
    { q: 'How do class times work from Nairobi?', a: 'Algeria runs CET all year with no daylight saving and Kenya observes none either, so the two-hour offset is fixed. Classes land in the Algerian afternoon at the same time every week of the year.' },
    { q: 'Will French and Canadian universities accept Cambridge A-Levels?', a: 'French universities remain a principal destination for Algerian students and read Cambridge A-Levels and the IB routinely, as do Canadian institutions, particularly in Québec. UCAS reads A-Levels natively, Gulf universities read them directly, and the Common Application serves US plans.' },
    { q: 'Which parts of Algeria does Smartious cover?', a: 'Algiers, Oran and the west, and Hassi Messaoud and the southern fields have dedicated pages. Live online delivery works identically anywhere in the country — which in the Sahara is precisely the point.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us where in Algeria you are and whether your child is in the Algerian or French system: a Hassi Messaoud rotation, an Algiers lycée place, and an Oran school day need different timetables, and we plan around your enrolment rather than instead of it.',
}
