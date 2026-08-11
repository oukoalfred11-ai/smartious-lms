// ═══════════════════════════════════════════════════════════════════
// TUNISIA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for offshoring, aeronautics, expat, diaspora, and
// Tunisian families across Tunis, Sfax, and Sousse & Monastir.
// NORTH AFRICA BUILD — 3 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
// Do NOT paste guessed stock-photo IDs.
//
// LEGAL POSITIONING NOTE — READ BEFORE EDITING:
// - Governing statute: LOI D'ORIENTATION n° 2002-80 du 23 juillet
//   2002, relative à l'éducation et à l'enseignement scolaire.
// - EDUCATION IS COMPULSORY from age six to age sixteen. Structure:
//   enseignement de base (école de base) of nine years from six,
//   then secondary to the baccalauréat.
// - PARENTAL-CHOICE HOME EDUCATION IS NOT ESTABLISHED as a route we
//   can identify in the Loi d'orientation. PHRASE IT THAT WAY —
//   "not established / we are not aware of" plus "confirm with the
//   Ministère de l'Éducation" — rather than asserting a categorical
//   prohibition we cannot fully evidence.
// - The baccalauréat can in defined circumstances be sat by
//   independent candidates. State HEDGED — eligibility and procedure
//   are ministry matters. Never promise it, never call it a
//   homeschooling route.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT throughout.
// LANGUAGE NOTE — PRACTICALLY IMPORTANT, NOT POLITICAL: instruction
// is in Arabic in the early years with French introduced from the
// early primary grades, and French carries much of the scientific
// and technical teaching at secondary level and in higher education.
// English is taught as a further language and is increasingly
// valued in the offshoring and aeronautics sectors. Treat all of
// this as practical context for subject choice only.
// MARKET NOTE: as in Algeria and Morocco, the dominant international
// option is the FRENCH SYSTEM — the AEFE network in Tunis above all,
// heavily oversubscribed — with a smaller private bilingual sector
// and very little British or IB provision, which is our opening.
// Economy: a large francophone offshoring and shared-services sector,
// an established aeronautics and automotive-components industry
// around Tunis, Sousse, and Monastir supplying European primes,
// medical and pharmaceutical manufacturing, olive oil and
// agri-processing centred on Sfax, phosphates in the interior, and
// a tourism industry along the Sahel coast. Substantial European
// resident and long-stay community, and one of the largest
// diasporas in France, Italy, and Germany with strong return and
// dual-residence flows.
// TIMEZONE: CET (UTC+1), no daylight saving — a FIXED TWO-HOUR
// offset behind Nairobi EAT every week of the year.
// ═══════════════════════════════════════════════════════════════════

export const TUNISIA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'tunis-tn',
    name: 'Tunis',
    county: 'Grand Tunis',
    region: 'Capital · the offshoring and shared-services centre serving French and European markets · aeronautics and technology · the diplomatic community · the French lycée network, heavily oversubscribed',
    primaryKeyword: 'Online school and international curriculum in Tunis',
    heroTagline: 'For Tunis families from Lac to La Marsa — the Cambridge route the capital has never had, with French kept alongside.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Tunis families. Tunis carries Tunisia\'s corporate weight — a large francophone offshoring and shared-services sector working for French and European clients, aeronautics and technology firms, banking, the diplomatic and international-organisation community, and a professional class with deep ties to France and Italy. Its international schooling is dominated by the French network, which is strong and heavily oversubscribed, alongside a smaller private bilingual sector. British and IB provision is thin. Under the Loi d\'orientation of 2002 education is compulsory from six to sixteen, so our clean default is supplementary: your school enrolment carries that duty, and we teach the Cambridge or IB track live alongside it — with Cambridge French running beside the English-medium core.',
    heroImg: '/heroes/tunis-tn.jpg',
    altTexts: { hero: 'Tunis and the lake' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Tunis families — the British-curriculum route the capital lacks, French kept alongside. From USD 400/month.',
    challenges: [
      'International schooling in Tunis is dominated by the French network and heavily oversubscribed.',
      'British and IB provision is thin, so families targeting UK, Gulf, or North American universities have had little local path.',
      'Education is compulsory from six to sixteen under the Loi d\'orientation n° 2002-80.',
      'Offshoring, aeronautics, and diplomatic postings move families in and out on contract timelines.',
      'Time zone: Tunisia runs CET (UTC+1) with no daylight saving — a fixed two-hour offset behind Nairobi EAT all year.',
    ],
    familySituations: [
      'Offshoring, shared-services, and technology-sector families working for European clients.',
      'Aeronautics, engineering, and manufacturing management families.',
      'Diplomatic, international-organisation, and development-sector families.',
      'Families on the French lycée waitlist needing a bridge or an alternative.',
      'European resident and long-stay families along the Tunis coast.',
      'Dual-residence and returning diaspora families with ties to France, Italy, and Germany.',
    ],
    nearbyAreas: ['Tunis centre', 'Les Berges du Lac', 'La Marsa', 'Carthage', 'Sidi Bou Said', 'Ariana', 'Ben Arous'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE French, Italian, Arabic and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, Italian, Canadian, Gulf and Tunisian university applications',
    ],
    whyChoose: [
      ['The British route the capital does not have', 'Tunis is a French-system city with long waitlists and thin Cambridge provision. That gap is the reason we are here.'],
      ['French kept alongside, deliberately', 'Cambridge French runs beside the English-medium core, so French, Canadian, and Tunisian options stay open while UK, Gulf, and American ones open up.'],
      ['Built for the offshoring economy', 'A sector that works in French and increasingly needs English is exactly where an English-medium examined record pays off for the next generation.'],
      ['A fixed offset, all year', 'Neither Tunisia nor Kenya observes daylight saving, so the two-hour gap never drifts — class times are the same in January and July.'],
      ['An African school teaching African families', 'Nairobi-built and Nairobi-taught, serving families in 53 countries.'],
    ],
    growingReason: 'Tunis holds Tunisia\'s offshoring and shared-services sector serving French and European markets, its aeronautics and technology firms, banking, and the diplomatic community — with international schooling dominated by an oversubscribed French network and thin British or IB provision. Tunisia runs CET (UTC+1) with no daylight saving, a fixed two-hour offset behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Tunis families, run supplementary alongside a school enrolment, with Cambridge French available beside the English-medium core. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Tunis families with East African ties.',
      ib: 'IB Diploma Programme — the international alternative to the French baccalauréat route for families who want it.',
      american: 'American Curriculum with AP — for families targeting American or Canadian universities.',
    },
    homeschoolDetail: 'Tunisian education law is set by the Loi d\'orientation n° 2002-80 of 23 July 2002 relating to education and school teaching. Education is compulsory from the age of six to the age of sixteen, running as nine years of enseignement de base followed by secondary education to the baccalauréat. We are not aware of an established parental-choice home-education route under that law, and we phrase it that way deliberately rather than asserting a categorical prohibition we cannot fully evidence — a family whose plan turns on the point should confirm the current position with the Ministère de l\'Éducation. The baccalauréat can in defined circumstances be taken by independent candidates; eligibility and procedure are ministry matters to confirm directly, and it is not a homeschooling route we would present as such. What is unrestricted is structured education alongside a school enrolment, and that is what we build: the school carries the compulsory-education duty and the daily routine, while the Cambridge or IB track runs live in the after-school hours toward external examinations.',
    homeTuitionDetail: 'Smartious delivers to Tunis families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. With Tunisia on CET year-round and Kenya two hours ahead with no daylight saving on either side, classes land in the Tunis afternoon at a constant time every week of the year, with every session recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Tunisia?', a: 'Education is compulsory from six to sixteen under the Loi d\'orientation n° 2002-80 of 2002, and we are not aware of an established parental-choice home-education route under that law. We put it in those terms rather than asserting a flat prohibition, and would tell any family whose plan depends on it to confirm with the Ministère de l\'Éducation. Structured study alongside a school enrolment is unrestricted.' },
      { q: 'Is there a British-curriculum school in Tunis?', a: 'Provision is thin. International schooling here is dominated by the French network, which is strong and heavily oversubscribed, with a smaller private bilingual sector alongside it. A Cambridge route is scarce — which is the gap live delivery fills.' },
      { q: 'Can our child keep French while studying in English?', a: 'Yes, and most of our Tunisian families do. Cambridge French runs alongside the English-medium academic core, keeping French, Canadian, and Tunisian university options open while adding UK, Gulf, and American ones.' },
      { q: 'What are the class times like?', a: 'Tunisia runs CET all year with no daylight saving and Kenya observes none either, so our teaching hours sit at a fixed two-hour offset — classes land in the Tunis afternoon at the same time every week of the year.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'sfax-tn',
    name: 'Sfax',
    county: 'Sfax Governorate',
    region: 'The second city and economic capital of the south · olive oil, agri-processing and chemicals · a major port and a strong commercial tradition · a large university and medical faculty · almost no international schooling',
    primaryKeyword: 'Online school and international curriculum in Sfax',
    heroTagline: 'For Sfax families — Tunisia\'s working second city, with a medical faculty, a port, and no international school.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Sfax families. Sfax is Tunisia\'s second city and the economic capital of its south — olive oil and agri-processing on a scale that shapes national exports, chemicals and phosphate handling, a major port, and a commercial tradition that has produced much of the country\'s business class. The University of Sfax and its medical faculty draw students from across the region. What the city does not have is international schooling of any depth: the French network and the private bilingual sector are concentrated in the capital, around four hours north. Smartious delivers the Cambridge and IB pathways live across the south, supplementary alongside your school enrolment.',
    heroImg: '/heroes/sfax-tn.jpg',
    altTexts: { hero: 'Sfax and the port' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Sfax and southern Tunisia families — second city, medical faculty, no international schooling. From USD 400/month.',
    challenges: [
      'Almost no international schooling in the second city, with Tunis around four hours north.',
      'A strong commercial and medical-academic community with no English-medium academic route locally.',
      'Education is compulsory from six to sixteen under the Loi d\'orientation of 2002.',
      'Exam sittings mean Tunis windows, planned ahead.',
      'Time zone: Sfax shares CET (UTC+1) with no daylight saving — a fixed two-hour offset behind Nairobi EAT.',
    ],
    familySituations: [
      'Commercial, trading, and family-business households across the south.',
      'Olive oil, agri-processing, and chemicals industry families.',
      'University of Sfax academic and medical-faculty families.',
      'Port, logistics, and export-business families.',
      'Students aiming at medicine, engineering, or business programmes abroad.',
    ],
    nearbyAreas: ['Sfax centre', 'Sakiet Ezzit', 'Kerkennah', 'Mahdia', 'Gabès', 'Gafsa', 'Djerba'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE French, Arabic and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Further Mathematics, Physics',
      'Cambridge A-Level Economics, Business, Accounting',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Chemistry, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, Canadian, Gulf and Tunisian university applications',
    ],
    whyChoose: [
      ['Pre-medical depth for a medical-faculty city', 'Cambridge A-Level Biology and Chemistry with Mathematics form the classic spine, and Sfax families aim at it more than most.'],
      ['The complete option four hours from the capital', 'Identical live delivery in Sfax and Tunis — no relocation, no boarding decision.'],
      ['Business and economics for a commercial city', 'Cambridge A-Level Economics, Business, and Accounting suit the families who run the south\'s trade and export businesses.'],
      ['French kept alongside', 'Cambridge French runs beside the English-medium core, protecting French and Tunisian university routes.'],
      ['A fixed offset, all year', 'Sfax and Nairobi sit two hours apart with no daylight saving on either side.'],
    ],
    growingReason: 'Sfax is Tunisia\'s second city and the economic capital of its south — olive oil and agri-processing at national scale, chemicals, a major port, and a large university with a substantial medical faculty — with almost no international schooling and Tunis four hours north. Sfax shares CET (UTC+1) with no daylight saving, a fixed two-hour offset behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for southern Tunisia, run supplementary alongside a school enrolment. Examination sittings planned per session with travel scheduled ahead.',
      cbc: 'Kenya CBC available for southern Tunisian families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American or Canadian universities.',
    },
    homeschoolDetail: 'The national framework applies in Sfax: education is compulsory from six to sixteen under the Loi d\'orientation n° 2002-80 of 2002, and we are not aware of an established parental-choice home-education route under that law — a position to confirm with the Ministère de l\'Éducation rather than take from a provider. The baccalauréat can in defined circumstances be sat by independent candidates, which is a ministry matter and not a homeschooling pathway. The supplementary configuration therefore carries the school years, with the Cambridge or IB track running live alongside toward external examinations.',
    homeTuitionDetail: 'Smartious delivers to Sfax families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing in the Sfax afternoon at a constant time on the fixed two-hour offset, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Sfax?', a: 'Almost none — the French network and the private bilingual sector are concentrated in Tunis, around four hours north. Live online delivery is the complete option for the south.' },
      { q: 'Our child is aiming at medicine — what should they take?', a: 'Cambridge A-Level Biology and Chemistry with Mathematics form the classic spine. We plan the subject set around the target from IGCSE onward, whether the destination is Tunisia, France, or the UK.' },
      { q: 'Where do Sfax students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with travel planned into each series ahead.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'sousse-tn',
    name: 'Sousse & Monastir',
    county: 'The Sahel coast',
    region: 'The Sahel\'s twin centres · aeronautics and automotive components supplying European primes · a tourism economy of international scale · a medical school and a substantial European resident community',
    primaryKeyword: 'Online school and international curriculum in Sousse and Monastir',
    heroTagline: 'For Sousse, Monastir and Sahel families — European industry, European visitors, European residents, and schooling for none of them.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Sousse, Monastir, and Sahel families. The Sahel coast is Tunisia\'s most internationally exposed region outside the capital: an aeronautics and automotive-components industry supplying European primes, a tourism economy running from Hammamet through Sousse to Mahdia, Monastir\'s airport and medical school, and a substantial European resident and long-stay community, particularly French, German, and Italian. The industrial employers are international and the visitor economy is international; the schooling is not. Smartious delivers the Cambridge and IB pathways live along the coast, supplementary alongside your school enrolment.',
    heroImg: '/heroes/sousse-tn.jpg',
    altTexts: { hero: 'The Sahel coast at Sousse' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Sousse, Monastir and Sahel families — aeronautics, tourism and European residents, no international schooling. From USD 400/month.',
    challenges: [
      'An internationally exposed industrial and tourism region with no international schooling of depth.',
      'European resident and long-stay families need to know which framework applies, and that turns on residence.',
      'Education is compulsory from six to sixteen for children resident in Tunisia.',
      'A tourism season that runs the household for much of the year.',
      'Time zone: the Sahel shares CET (UTC+1) with no daylight saving — a fixed two-hour offset behind Nairobi EAT.',
    ],
    familySituations: [
      'Aeronautics and automotive-components engineering and management families.',
      'Tourism, hospitality, and hotel-group business families across the Sahel.',
      'European resident, long-stay, and second-home families.',
      'Monastir medical school and healthcare-sector families.',
      'Dual-residence and returning diaspora families with ties to France, Italy, and Germany.',
    ],
    nearbyAreas: ['Sousse', 'Monastir', 'Port El Kantaoui', 'Hammamet', 'Mahdia', 'Kairouan', 'Nabeul'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE French, German, Italian and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Design and Technology-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Biology',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, German, Italian, Canadian and Tunisian university applications',
    ],
    whyChoose: [
      ['Engineering depth for an aeronautics region', 'Cambridge A-Level Mathematics, Further Mathematics, and Physics suit an industry supplying European aerospace and automotive primes.'],
      ['Three European languages available alongside', 'French, German, or Italian can run beside the English-medium core — which matters for a coast whose residents and employers come from all three.'],
      ['Built for a tourism season', 'Live classes plus unlimited recordings hold the academic year together when the household works the season.'],
      ['Residence stated precisely', 'Which framework applies turns on where a family legally resides; we state that clearly and send the question to your own advisers.'],
      ['A fixed offset, all year', 'The Sahel and Nairobi sit two hours apart with no daylight saving on either side.'],
    ],
    growingReason: 'The Sahel coast is Tunisia\'s most internationally exposed region outside the capital — aeronautics and automotive components supplying European primes, a tourism economy from Hammamet to Mahdia, Monastir\'s airport and medical school, and a substantial European resident community — with no international schooling of depth. The Sahel shares CET (UTC+1) with no daylight saving, a fixed two-hour offset behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Sahel, run supplementary alongside a school enrolment, with French, German, or Italian available beside the English-medium core. Examination sittings planned per session with travel scheduled ahead.',
      cbc: 'Kenya CBC available for Sahel families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American or Canadian universities.',
    },
    homeschoolDetail: 'The national framework applies along the Sahel for children resident in Tunisia: education is compulsory from six to sixteen under the Loi d\'orientation n° 2002-80 of 2002, and we are not aware of an established parental-choice home-education route under that law — a position to confirm with the Ministère de l\'Éducation. The supplementary configuration carries the school years, with the recorded library carrying the tourism season. European resident and long-stay families who remain registered elsewhere follow their country of residence\'s framework, whatever it provides — French, German, and Italian rules all differ materially — and that is a question for their own advisers rather than one we would answer for them.',
    homeTuitionDetail: 'Smartious delivers to Sahel families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing in the local afternoon at a constant time on the fixed two-hour offset, with the full recorded library carrying the tourism season.',
    faqs: [
      { q: 'We are European residents spending much of the year in Tunisia — whose rules apply?', a: 'Your country of residence, which is a legal determination about your household rather than a general question. The French, German, and Italian frameworks all differ materially from each other and from Tunisia\'s. We state the distinction precisely and plan the education around whichever side of it you are on.' },
      { q: 'Is there international schooling in Sousse or Monastir?', a: 'Nothing of depth — the French network and private bilingual sector are concentrated in Tunis. Live online delivery is the complete option for the Sahel.' },
      { q: 'Our family works the tourism season — can schooling fit that?', a: 'It is built for it: live classes with a complete recorded library, so the academic year holds together through the busiest months.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const TUNISIA_COUNTRY = {
  slug: 'tunisia',
  name: 'Tunisia',
  longName: 'Republic of Tunisia',
  adjective: 'Tunisian',
  flag: '🇹🇳',
  hub: '/online-school/tunisia',
  hubPageId: 'homeschooling-tunisia',
  cityPageId: 'tunisia-city',

  currency: 'TND',
  currencyName: 'Tunisian Dinar',
  currencyPeg: 'Fees are invoiced in USD; dinar equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'CET',
    name: 'Central European Time (UTC+1), no daylight saving',
    utcOffset: '+1',
    offsetFromEAT: '-2 hours, fixed, every week of the year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Tunis checked first, with regional options where local capacity is limited'],
  examCentreTiles: [
    { city: 'Tunis', centre: 'Authorised provision', area: 'The country\'s main external-candidate capacity, confirmed per family per session.' },
    { city: 'Sousse and the Sahel', centre: 'Planned per session', area: 'Sahel families plan travel into each examination window ahead.' },
    { city: 'Sfax and the south', centre: 'Planned per session', area: 'Southern families plan Tunis windows with travel scheduled ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Tunisia-based students sit as external candidates at authorised provision, with capacity confirmed per family per session — Tunis is checked first, and Sahel and southern families plan travel into each series ahead. Tunisia is compact enough that this is a handful of day trips a year rather than a relocation question. Separately, and stated factually rather than as a pathway: the Tunisian baccalauréat can in defined circumstances be sat by independent candidates, with eligibility and procedure set by the ministry and confirmed directly. Our arrangement is supplementary, so a family\'s school continues its own national track unchanged while the Cambridge calendar runs alongside; the two are planned together at enrolment rather than one replacing the other.',
  secondaryProgrammeExamRef: 'Authorised Tunis and regional provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/tunisia.jpg',
  heroEyebrow: 'Online school for Tunisia',
  heroH1Suffix: 'Tunisia',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for offshoring, aeronautics, expat, diaspora, and Tunisian families across Tunis, Sfax, and Sousse and Monastir. International schooling here is dominated by an oversubscribed French network, with British and IB provision thin — and outside the capital, close to absent. Taught live from Nairobi at a fixed two-hour offset that never drifts, with Cambridge French alongside.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — supplementary beside your school, with French, German, or Italian kept alongside.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Tunisia',

  citiesSectionTitle: 'Where our Tunisia families are',
  citiesSectionBody: 'Smartious Tunisia families concentrate across Tunis (the offshoring and shared-services sector serving European markets, aeronautics and technology, banking, the diplomatic community, and the oversubscribed French network), Sfax (the second city and economic capital of the south — olive oil, chemicals, a major port, and a large medical faculty, four hours from the capital), and Sousse and Monastir (the Sahel\'s aeronautics and automotive-components industry, a tourism economy of international scale, a medical school, and a substantial European resident community). One compulsory framework, one supplementary configuration, and a British route the country has never really had.',

  trustSignals: [
    { h: 'An African school teaching African families', p: 'Smartious was founded in Nairobi in 2019 and teaches from two operational centres established 2022 and 2023 — an African school with international accreditation, serving students in 53 countries, not a European provider reaching in.' },
    { h: 'A fixed offset that never drifts', p: 'Tunisia runs CET (UTC+1) with no daylight saving and Kenya runs EAT (UTC+3) with none either. The two-hour gap is constant every week of the year, so class times are the same in January as in July.' },
    { h: 'The route the country does not really have', p: 'International schooling in Tunisia is dominated by the French network, which is strong and heavily oversubscribed. British and IB provision is thin in the capital and close to absent outside it.' },
    { h: 'The law stated before anything is sold', p: 'Education is compulsory from six to sixteen under the Loi d\'orientation n° 2002-80 of 2002. We are not aware of an established parental home-education route and say so in those terms, pointing families to the Ministère de l\'Éducation.' },
  ],

  universitiesInCountry: 'The University of Tunis and Tunis El Manar with its medical faculty, the University of Carthage and its engineering schools, the University of Sfax and its medical faculty, the University of Sousse and the Monastir medical school, alongside a substantial private higher-education sector, some of it teaching in English.',
  universityChannels: 'Tunisian universities admit on the national baccalauréat, and holders of foreign secondary qualifications apply through recognition and equivalence procedures with requirements confirmed per institution — worth confirming specifically if a return into the Tunisian system, particularly into medicine, is the plan. Outward, an internationally examined record travels in several directions at once for Tunisian families: French universities remain a principal destination and read Cambridge A-Levels and the IB routinely, as do Italian, German, and Canadian institutions, all of which host substantial Tunisian student communities. UCAS reads A-Levels natively, Gulf universities read them directly, the Common Application serves US plans, and A-Levels are accepted in 160+ countries — including the aerospace and engineering programmes the Sahel\'s industrial families most often have in view. Smartious provides personalised university guidance across French, Italian, German, Canadian, UK (UCAS), Gulf, and US destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Tunisia families. Cambridge IGCSE (Years 10-11) and Cambridge A-Level (Years 12-13) delivered as live online classes at a fixed two-hour offset with no seasonal drift, run supplementary alongside a school enrolment as the Loi d\'orientation requires — with Cambridge French, German, or Italian available alongside so European options stay open. Examinations at authorised provision confirmed per session. Pathway read natively by UK universities via UCAS, read routinely across France, Italy, Germany, Canada, and the Gulf, and accepted in 160+ countries.',
  britishCurriculumSuits: 'Tunisia families targeting the Cambridge pathway. Best fit for: (1) offshoring, technology, and aeronautics families whose sector already works internationally, (2) Tunis families on the French lycée waitlist or wanting a British route that barely exists locally, (3) Sfax and Sahel families with no international provision within hours, (4) European resident and long-stay families along the coast, (5) dual-residence and diaspora families with ties to France, Italy, and Germany.',
  britishCurriculumDelivery: 'Live online classes at a constant two-hour offset, small groups 4-6 students, every session recorded. Cambridge examinations at authorised provision, confirmed per session.',
  ibDiplomaSuits: 'Tunisia families wanting the IB Diploma\'s breadth as an international alternative to the French baccalauréat route.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Tunisia families targeting American or Canadian universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to African and internationally mobile families at online-delivery fees rather than campus ones. Tunisia families join students in 53 other countries — from the Sahel coast to Nairobi\'s own Diamond Plaza HQ.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the Sahel\'s aeronautics families and every medicine-bound student in Sfax, Monastir, and Tunis. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Tunisia\'s international schooling is a French-system story concentrated in Tunis, and the network there is strong and heavily oversubscribed. Outside the capital the picture thins fast: Sfax, the country\'s second city, has almost nothing, and the Sahel — with European industry, European visitors, and European residents — has nothing of depth. British and IB provision is scarce everywhere. The competitive space is therefore an absence rather than a share.',
  competitors: [
    { name: 'The French network in Tunis',                    city: 'Tunis',                 curriculum: 'French system',                         feesUsd: 'Premium capital tier',                              feesAed: 'Heavily oversubscribed',  rating: 4.6, capacityNote: 'Strong and long-established — French curriculum, demand well above supply' },
    { name: 'Private bilingual schools',                      city: 'Tunis and the Sahel',   curriculum: 'Tunisian and French-leaning bilingual',  feesUsd: 'Mid to premium tier',                              feesAed: 'Varies',                  rating: 4.2, capacityNote: 'A real sector — not a British or IB route' },
    { name: 'Sfax and the south',                             city: 'Southern Tunisia',      curriculum: 'Almost none',                           feesUsd: 'No real international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'The second city, its port and its medical faculty, four hours from the capital' },
    { name: 'Sousse, Monastir and the Sahel',                 city: 'The Sahel coast',       curriculum: 'Nothing of depth',                      feesUsd: 'No real international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'European industry, European visitors and European residents — and no school built for them' },
    { name: 'Boarding in France or Italy',                    city: 'Europe',                curriculum: 'French and international',              feesUsd: 'Fees plus travel plus a child living away',         feesAed: '—',                       rating: 4.3, capacityNote: 'The traditional answer for families outside the capital' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh (online)', city: 'Online',                curriculum: 'Cambridge self-paced / UK online',      feesUsd: 'Per-subject / GBP 9,000-11,000',                    feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Self-paced or priced far above Smartious, and none carries French, German, or Italian alongside the English-medium core' },
    { name: 'Smartious Homeschool (Tunisia via online delivery)', city: 'Delivered to all Tunisia', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'TND equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + the British route the country lacks + three European languages available alongside + Sfax and the Sahel served identically + a fixed offset that never drifts' },
  ],

  legalFrameworkIntro: 'Tunisian education law is set by a single orientation law and is short to state. Here it is exactly, including the provision families most often misread.',
  legalFramework: [
    { h: 'The governing statute', p: 'The Loi d\'orientation n° 2002-80 of 23 July 2002, relating to education and school teaching, governs the system. Education is compulsory from the age of six to the age of sixteen, running as nine years of enseignement de base from age six followed by secondary education leading to the baccalauréat. Tunisia\'s system has a long-standing reputation for academic seriousness, particularly in the sciences and in medicine, and that reputation is deserved — the question our families bring is not whether the national system is good, but whether it opens the doors they have in view.' },
    { h: 'Home education: what we can and cannot say', p: 'We are not aware of an established parental-choice home-education route under the Loi d\'orientation, and we phrase it in exactly those terms. Asserting a categorical prohibition would be more than we can evidence from the statute text; suggesting the arrangement is freely available would be worse. A family whose plan turns on the point should confirm the current position with the Ministère de l\'Éducation rather than rely on any provider\'s summary, ours included. What is not in doubt is that structured education alongside a school enrolment is unrestricted, which is the configuration we build.' },
    { h: 'The independent-candidate provision, stated factually', p: 'The Tunisian baccalauréat can in defined circumstances be taken by independent candidates. That is real, it is well known, and it is not a homeschooling route — eligibility, procedure, and current arrangements are ministry matters to be confirmed directly. We state it because families encounter it and sometimes read it as an implicit permission to educate outside school, which it is not.' },
    { h: 'Language, and why it shapes subject choice', p: 'Instruction is in Arabic in the early years with French introduced from the early primary grades, and French carries much of the scientific and technical teaching at secondary level and in higher education. English is taught as a further language and is increasingly valued in the offshoring, aeronautics, and technology sectors that employ so many of our Tunisian families. Practically, this means our students almost always keep Cambridge French running alongside the English-medium core — and on the Sahel coast, where the resident community and the industrial employers are French, German, and Italian, families frequently add a second European language rather than dropping the first.' },
    { h: 'The gap that is specific to Tunisia', p: 'The country has a strong national system and a strong French network, and between them they serve most families well. What neither provides is a British or IB route, and the French network\'s capacity in Tunis is well below demand in any case. Outside the capital the position is starker: Sfax is the second city with a major medical faculty and almost no international provision, and the Sahel hosts European aerospace suppliers, European tour operators, and European residents without a single school built for their children. A family wanting an internationally examined English-medium record has historically had two options — send the child to Europe, or do without.' },
    { h: 'Where the qualifications lead', p: 'Tunisian universities admit on the national baccalauréat, with foreign qualifications going through recognition and equivalence procedures and requirements confirmed per institution — worth confirming specifically for medicine, which is a common destination here. Outward the record travels widely: French universities remain a principal destination for Tunisian students and read Cambridge A-Levels and the IB routinely, as do Italian, German, and Canadian institutions; UCAS reads A-Levels natively; Gulf universities read them directly; the Common Application serves US plans; and A-Levels are accepted in 160+ countries, including the aerospace and engineering programmes the Sahel\'s industrial families most often have in view.' },
  ],

  whySmartious: [
    { h: 'The British route Tunisia does not really have',                  p: 'International schooling here is the French network, oversubscribed and capital-bound, with British and IB provision scarce. We are filling an absence rather than competing for a share.' },
    { h: 'Three European languages available alongside',                    p: 'French, German, or Italian can run beside the English-medium core — which matters on a coast whose residents and employers come from all three.' },
    { h: 'A fixed offset that never drifts',                                p: 'Neither Tunisia nor Kenya observes daylight saving, so the two-hour gap is constant — class times are identical in January and July.' },
    { h: 'Sfax and the Sahel served identically',                           p: 'The second city and the industrial coast have almost nothing between them. Live delivery closes both gaps the same way.' },
    { h: 'Careful where the law is not fully evidenced',                    p: 'We say "not established" and name the Ministère rather than asserting a prohibition we cannot document — and we do not dress up the independent-candidate rules as a homeschooling route.' },
    { h: 'An African school teaching African families',                     p: 'Nairobi-built and Nairobi-taught, serving 53 countries, working to African calendars and examination realities.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Tunisia?', a: 'Education is compulsory from six to sixteen under the Loi d\'orientation n° 2002-80 of 2002, and we are not aware of an established parental-choice home-education route under that law. We put it in those terms rather than asserting a categorical prohibition, and would tell any family whose plan depends on it to confirm with the Ministère de l\'Éducation. Structured study alongside a school enrolment is unrestricted.' },
    { q: 'The baccalauréat can be sat as an independent candidate — does that let us homeschool?', a: 'No, and it is a common misreading. The independent-candidate provision is real and its eligibility and procedure are ministry matters, but it is an examination arrangement rather than a permission to educate outside school. We state it factually for exactly that reason.' },
    { q: 'Is there a British-curriculum school in Tunisia?', a: 'Provision is thin. International schooling is dominated by the French network, strong and heavily oversubscribed in Tunis, with a private bilingual sector alongside it. Sfax and the Sahel have almost nothing. The absence of a Cambridge route is the gap we exist to fill.' },
    { q: 'Can our child keep French while studying in English?', a: 'Yes, and most of our Tunisian families do. Cambridge French runs alongside the English-medium core; on the Sahel coast families often add German or Italian rather than dropping French, given who lives and invests there.' },
    { q: 'We are European residents in Tunisia — whose rules apply to our children?', a: 'Your country of residence, which is a legal determination about your household. The French, German, and Italian frameworks differ materially from each other and from Tunisia\'s, and that question belongs with your own advisers. The teaching itself works identically either way.' },
    { q: 'How do class times work from Nairobi?', a: 'Tunisia runs CET all year with no daylight saving and Kenya observes none either, so the two-hour offset is fixed. Classes land in the Tunisian afternoon at the same time every week of the year.' },
    { q: 'Will French, Italian, or Canadian universities accept Cambridge A-Levels?', a: 'All three read Cambridge A-Levels and the IB routinely and host substantial Tunisian student communities, as do German institutions. UCAS reads A-Levels natively, Gulf universities read them directly, and the Common Application serves US plans.' },
    { q: 'Which parts of Tunisia does Smartious cover?', a: 'Tunis, Sfax and the south, and Sousse and Monastir on the Sahel coast have dedicated pages. Live online delivery works identically anywhere in the country — which outside the capital is precisely the point.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us whether your child is in the Tunisian or the French system, and which languages they are carrying: in Tunisia that shapes the subject set more than anywhere else we teach, and it belongs at the start of the conversation.',
}
