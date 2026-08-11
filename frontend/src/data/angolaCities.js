// ═══════════════════════════════════════════════════════════════════
// ANGOLA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for oil and gas, corporate, expat, and Angolan
// families across Luanda, Lobito and Benguela, and Cabinda.
// LUSOPHONE AFRICA BUILD — 3 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
// Do NOT paste guessed stock-photo IDs.
//
// LEGAL POSITIONING NOTE — READ BEFORE EDITING. ANGOLA IS UNUSUALLY
// WELL DOCUMENTED, SO BE PRECISE:
// - Governing statute: LEI N.º 17/16 DE 7 DE OUTUBRO (Lei de Bases
//   do Sistema de Educação e Ensino), AMENDED BY LEI N.º 32/20 DE
//   12 DE AGOSTO, with the Regime Jurídico do Ensino Primário e
//   Secundário approved by Decreto Presidencial n.º 162/23.
// - THE COMPULSORY RANGE — QUOTE IT PROPERLY: "A obrigatoriedade da
//   Educação abrange a classe de iniciação, o Ensino Primário e o I
//   Ciclo do Ensino Secundário." So compulsory education covers the
//   iniciação class, primary, AND the FIRST cycle of secondary
//   (7ª-9ª classes, ages roughly 12-14).
// - THE WINDOW: the II Ciclo do Ensino Secundário (10ª-12ª classes,
//   ages roughly 15-17) is NOT within the compulsory range. So the
//   A-Level years sit outside the obligation, from around fifteen.
//   Use it, but state it precisely as "the II Ciclo is not within
//   the compulsory range" rather than inventing an age cut-off.
// - MANDATORY NATIONAL CURRICULUM: curricula, study plans, teaching
//   programmes and textbooks for pré-escolar, primário and
//   secundário have NATIONAL CHARACTER and are of MANDATORY
//   COMPLIANCE ("carácter nacional e são de cumprimento
//   obrigatório"), with 20% of curricular content the responsibility
//   of the locality. This is why supplementary is our default.
// - CONSULAR SCHOOLS — A GENUINELY USEFUL, SPECIFIC FACT: escolas
//   consulares (schools belonging to foreign States) teach in their
//   own country's official language under their own regulations,
//   BUT must also teach Portuguese Language, Angolan Literature,
//   History of Angola and Geography of Angola, with their curricular
//   programmes approved by the Ministério da Educação. Mention this
//   — international families in Luanda encounter it directly.
// - FOREIGN QUALIFICATIONS ARE RECOGNISED: certificates and diplomas
//   of primary, secondary and higher levels completed abroad are
//   valid in Angola provided they are recognised by the Executive,
//   with a comparability framework for mutual recognition. This is
//   a strong, specific reassurance — state it and note recognition
//   is a process, not automatic.
// - LANGUAGE POLICY FAVOURS US: the State promotes public policies
//   for the insertion and massification of the teaching of the main
//   international languages across all subsystems, WITH PRIORITY
//   FOR ENGLISH AND FRENCH. Say so factually.
// - HOME EDUCATION: we are not aware of an established
//   parental-choice route under the Lei de Bases. Phrase as "not
//   established / we are not aware of" + "confirm with the
//   Ministério da Educação". Do NOT assert a categorical ban.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT through the compulsory
//   range; the full pathway opens for the II Ciclo years.
// MARKET NOTE: Luanda has been repeatedly ranked among the most
// expensive cities in the world for expatriate staff, and its
// international school fees reflect that — Luanda International
// School, the Portuguese and French schools, and the oil-company-
// linked provision. Economy: oil and gas above all (Sonangol, the
// international operators, Soyo LNG, the Cabinda enclave), diamonds
// in the Lundas, the Lobito Corridor rail link to the Copperbelt
// and the DRC, fishing and agriculture around Benguela. Portuguese
// is the language of instruction; the diaspora sits mainly in
// Portugal and Brazil.
// TIMEZONE: WAT (UTC+1), no daylight saving — a FIXED TWO-HOUR
// offset behind Nairobi EAT every week of the year.
// ═══════════════════════════════════════════════════════════════════

export const ANGOLA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'luanda-ao',
    name: 'Luanda',
    county: 'Luanda Province',
    region: 'Capital · Sonangol and the international oil operators · the corporate, diplomatic and banking centre · international school fees among the highest in Africa',
    primaryKeyword: 'Online school and international curriculum in Luanda',
    heroTagline: 'For Luanda families — the Cambridge and IB route at a fraction of what one of the world\'s most expensive expatriate cities charges for it.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Luanda families. Luanda carries Angola\'s corporate weight — Sonangol and the international oil operators, banking, construction, the diplomatic and development community, and a professional class that has grown fast around all of it. It has also been ranked repeatedly among the most expensive cities in the world for expatriate staff, and its international school fees sit accordingly high. Under the Lei de Bases, compulsory education covers the iniciação class, primary, and the first cycle of secondary, and the national curriculum is of mandatory compliance — so our clean default through those years is supplementary, with the full pathway opening for the II Ciclo.',
    heroImg: '/heroes/luanda-ao.jpg',
    altTexts: { hero: 'Luanda bay and the city' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Luanda families — international curriculum at a fraction of the capital\'s fees. From USD 400/month.',
    challenges: [
      'International school fees in Luanda are among the highest in Africa, reflecting one of the world\'s most expensive expatriate cities.',
      'Compulsory education covers the iniciação class, primary, and the I Ciclo of secondary, and the national curriculum is of mandatory compliance.',
      'Oil and gas postings arrive and depart on contract timelines rather than admission cycles.',
      'Portuguese is the language of instruction, so families moving in or out face a language transition in both directions.',
      'Time zone: Angola runs WAT (UTC+1) with no daylight saving — a fixed two-hour offset behind Nairobi EAT all year.',
    ],
    familySituations: [
      'Sonangol and international oil operator families, Angolan and expatriate.',
      'Banking, construction, and corporate-sector families.',
      'Diplomatic, development, and international-organisation families.',
      'Angolan professional families outside the international tier\'s fees.',
      'Families moving between Angola, Portugal, Brazil, and the Gulf.',
      'Students past the compulsory range running the full A-Level phase.',
    ],
    nearbyAreas: ['Luanda centre', 'Talatona', 'Miramar', 'Benfica', 'Viana', 'Belas', 'Cacuaco'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Portuguese, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Accounting, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Portuguese, Brazilian, South African and Angolan university applications',
    ],
    whyChoose: [
      ['A fee gap that is unusually large even for Africa', 'Luanda\'s international tier prices at one of the world\'s most expensive expatriate cities; Smartious runs USD 2,160-6,480 a year for live small-group teaching toward the same boards.'],
      ['Portuguese kept alongside the English-medium core', 'Cambridge Portuguese runs beside the academic track, which protects Portuguese and Brazilian university routes and keeps a returning child on solid ground.'],
      ['Built for oil and gas rotation', 'Luanda now, Soyo, the Gulf, or Houston next — the curriculum, teachers, and examination board stay constant across the posting.'],
      ['The law stated before anything is sold', 'Compulsory education covers iniciação, primary and the I Ciclo, and the national curriculum is of mandatory compliance. We run supplementary through those years and say so.'],
      ['An African school teaching African families', 'Nairobi-built and Nairobi-taught, serving families in 57 countries — not an overseas provider reaching in.'],
    ],
    growingReason: 'Luanda holds Sonangol and the international oil operators, banking and construction, and the diplomatic community — in a city ranked repeatedly among the world\'s most expensive for expatriate staff, with international school fees to match. Angola runs WAT (UTC+1) with no daylight saving, a fixed two-hour offset behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Luanda families: supplementary alongside a school enrolment through the compulsory range, and the full pathway for the II Ciclo years. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Luanda families with East African ties.',
      ib: 'IB Diploma Programme — supplements and support alongside the capital\'s campus routes.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Angolan education law is set by the Lei de Bases do Sistema de Educação e Ensino — Lei n.º 17/16 of 7 October, as amended by Lei n.º 32/20 of 12 August, with the legal regime for primary and secondary education approved by Presidential Decree n.º 162/23. Two provisions shape what we can offer. First, the compulsory range: the law provides that the obligation covers the iniciação class, the Ensino Primário, and the I Ciclo do Ensino Secundário — the 7th to 9th classes, roughly ages twelve to fourteen. The II Ciclo, the 10th to 12th classes, is not within that range. Second, the curriculum: study plans, teaching programmes and textbooks for pre-school, primary and secondary have national character and are of mandatory compliance, with twenty per cent of curricular content the responsibility of the locality. We are not aware of an established parental-choice home-education route under the Lei de Bases, and we phrase it that way rather than asserting a categorical prohibition — confirm the current position with the Ministério da Educação. Our clean default through the compulsory range is therefore supplementary: the school carries the obligation and the national curriculum, while the Cambridge or IB track runs live alongside. Two further points that matter to international families here: escolas consulares teach in their own country\'s official language under their own regulations but must also teach Portuguese Language, Angolan Literature, History of Angola and Geography of Angola, with programmes approved by the Ministry; and certificates and diplomas completed abroad are valid in Angola provided they are recognised by the Executive, so recognition exists as a process rather than automatically.',
    homeTuitionDetail: 'Smartious delivers to Luanda families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. With Angola on WAT year-round and Kenya two hours ahead with no daylight saving on either side, classes land in the Luanda afternoon and early evening at a constant time every week of the year, with every session recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Angola?', a: 'Compulsory education covers the iniciação class, primary and the I Ciclo of secondary under the Lei de Bases, and the national curriculum is of mandatory compliance. We are not aware of an established parental-choice home-education route under that law, and put it in those terms rather than asserting a flat prohibition — confirm with the Ministério da Educação. Structured study alongside a school enrolment is unrestricted.' },
      { q: 'What happens after the I Ciclo?', a: 'The II Ciclo do Ensino Secundário — the 10th to 12th classes, roughly ages fifteen to seventeen — is not within the compulsory range. From that point the A-Level years run outside the obligation, which is the most useful planning fact on this page.' },
      { q: 'Will a foreign qualification be recognised in Angola?', a: 'The Lei de Bases provides that certificates and diplomas of primary, secondary and higher levels completed abroad are valid in Angola provided they are recognised by the Executive, with a comparability framework supporting mutual recognition. So recognition exists as a defined process — worth starting early rather than assuming it is automatic.' },
      { q: 'How do the fees compare with Luanda international schools?', a: 'Luanda\'s tier prices at the level of one of the world\'s most expensive expatriate cities. Smartious runs USD 2,160-6,480 a year for live small-group teaching toward the same Cambridge examinations.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'lobito-ao',
    name: 'Lobito & Benguela',
    county: 'Benguela Province',
    region: 'The Atlantic port and the Lobito Corridor rail link to the Copperbelt and the DRC · fishing, agriculture and logistics · Angola\'s second urban centre · almost no international schooling',
    primaryKeyword: 'Online school and international curriculum in Lobito and Benguela',
    heroTagline: 'For Lobito and Benguela families — the corridor port that now moves Central Africa\'s copper, and no international school along it.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Lobito and Benguela families. The Benguela coast has become strategically important again: the Lobito Corridor rail link runs inland to the Copperbelt and the mining regions of the DRC, drawing logistics, rail, and port investment and the international staff who come with it, alongside a long-established fishing, agriculture, and industrial economy and Angola\'s second urban centre. International schooling along the corridor is almost non-existent, with Luanda\'s tier five hundred kilometres north. Smartious delivers the Cambridge and IB pathways live across Benguela province.',
    heroImg: '/heroes/lobito-ao.jpg',
    altTexts: { hero: 'Lobito bay and the Benguela coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Lobito and Benguela families — the Lobito Corridor, no international schooling. From USD 400/month.',
    challenges: [
      'Almost no international schooling along the corridor, with Luanda five hundred kilometres north.',
      'Rail, port, and logistics investment is bringing international staff faster than provision.',
      'Compulsory education covers iniciação, primary and the I Ciclo, with a mandatory national curriculum.',
      'Exam sittings mean Luanda windows, planned well ahead.',
      'Time zone: Benguela shares WAT (UTC+1) with no daylight saving — a fixed two-hour offset behind Nairobi EAT.',
    ],
    familySituations: [
      'Rail, port, and logistics families along the Lobito Corridor.',
      'Mining-services and trading families connected to the Copperbelt and the DRC.',
      'Fishing, agriculture, and industrial-sector professional families.',
      'Angolan professional families in the second urban centre with no local international option.',
      'Students past the compulsory range running the full A-Level phase.',
    ],
    nearbyAreas: ['Lobito', 'Benguela', 'Catumbela', 'Baía Farta', 'Huambo', 'Cubal', 'the corridor towns'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Portuguese, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Geography',
      'Cambridge A-Level Economics, Business, Biology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Portuguese, Brazilian, South African and Angolan university applications',
    ],
    whyChoose: [
      ['The complete option along a corridor with none', 'Identical live delivery in Lobito and Luanda — no relocation, no boarding decision.'],
      ['Built for a logistics and rail workforce', 'Engineering and economics at A-Level suit the families arriving with the corridor investment.'],
      ['Portuguese kept alongside', 'Cambridge Portuguese runs beside the English-medium core, protecting Portuguese and Brazilian routes.'],
      ['A fixed offset, all year', 'Benguela and Nairobi sit two hours apart with no daylight saving on either side, so class times never drift.'],
      ['The window after the I Ciclo', 'The II Ciclo is outside the compulsory range — the A-Level years run at the family\'s choice.'],
    ],
    growingReason: 'The Benguela coast has become strategically important again through the Lobito Corridor rail link to the Copperbelt and the DRC, drawing logistics, rail, and port investment alongside a long-standing fishing and industrial economy — with almost no international schooling and Luanda five hundred kilometres north. Benguela shares WAT (UTC+1), a fixed two-hour offset behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Benguela province: supplementary through the compulsory range, full pathway for the II Ciclo. Examination sittings planned per session with travel scheduled well ahead.',
      cbc: 'Kenya CBC available for Benguela families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Benguela: compulsory education covers the iniciação class, primary, and the I Ciclo of secondary under the Lei de Bases, with the national curriculum of mandatory compliance, and we are not aware of an established parental-choice home-education route — a position to confirm with the Ministério da Educação. The supplementary configuration therefore carries the compulsory range, and the II Ciclo years fall outside it. For families arriving with the corridor investment the arrangement also travels: the curriculum and examination board continue unchanged if the posting moves on to the DRC, Zambia, or elsewhere.',
    homeTuitionDetail: 'Smartious delivers to Benguela families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing in the local afternoon at a constant time on the fixed two-hour offset, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Lobito or Benguela?', a: 'Almost none — Angola\'s provision sits in Luanda, five hundred kilometres north. Live online delivery is the complete option for the corridor.' },
      { q: 'We have arrived with the corridor investment — does the schooling travel?', a: 'Yes: the same curriculum, teachers, and examination board continue if the posting moves on to the DRC, Zambia, or elsewhere, with examinations sat at authorised centres wherever the family is.' },
      { q: 'Where do Benguela students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with travel planned into each series well ahead.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'cabinda-ao',
    name: 'Cabinda & Soyo',
    county: 'Cabinda Province and the Zaire oil coast',
    region: 'Angola\'s oil heartland — the Cabinda enclave and the Soyo LNG complex · offshore operations and the international oilfield-services community · a rotational technical workforce · no international schooling',
    primaryKeyword: 'Online school and international curriculum in Cabinda',
    heroTagline: 'For Cabinda and Soyo families — the oil coast, staffed internationally and schooled locally, with Luanda a flight away.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families across Angola\'s oil coast. Cabinda and the Soyo LNG complex sit at the centre of the country\'s hydrocarbon economy — offshore operations, the international operators and oilfield-services companies, and a technical workforce recruited from across Africa, Europe, and the Americas, much of it on rotation. Luanda\'s international schooling is a flight away, and locally there is none. For decades the answers have been boarding abroad, a household split between two countries, or a compound school built for a company rather than a curriculum. Smartious delivers live Cambridge and IB teaching to the oil coast instead.',
    heroImg: '/heroes/cabinda-ao.jpg',
    altTexts: { hero: 'The Angolan oil coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Cabinda and Soyo families — Angola\'s oil coast, no international schooling. From USD 400/month.',
    challenges: [
      'An internationally recruited oil and gas workforce with no international schooling locally and Luanda a flight away.',
      'Rotational contracts split households across countries for much of the year.',
      'Boarding abroad or a separated family have been the standard answers.',
      'Compulsory education covers iniciação, primary and the I Ciclo for children resident in Angola.',
      'Time zone: the oil coast shares WAT (UTC+1) with no daylight saving — a fixed two-hour offset behind Nairobi EAT.',
    ],
    familySituations: [
      'Offshore operations, drilling, and oilfield-services engineering families.',
      'LNG and gas-processing families at Soyo.',
      'International technical and management staff on rotational contracts.',
      'Households split between the oil coast and a base elsewhere.',
      'Students aiming at petroleum engineering, geoscience, or related programmes abroad.',
    ],
    nearbyAreas: ['Cabinda city', 'Malongo', 'Soyo', 'the Zaire province coast', 'Landana', 'the offshore blocks', 'N\'zeto'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Portuguese, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Geography',
      'Cambridge A-Level Biology, Economics, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Chemistry',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including petroleum and geoscience programmes), Common Application (US), and Portuguese, Brazilian and South African university applications',
    ],
    whyChoose: [
      ['Schooling that survives a rotation', 'One live pathway held constant across postings — the case our Hassi Messaoud, Baku, Takoradi, and Stavanger families have proven.'],
      ['An alternative to a separated household', 'Oil-coast families have kept children abroad or lived apart for decades. Live teaching reaches the coast instead.'],
      ['Geoscience and engineering depth', 'Cambridge A-Level Physics, Chemistry, Mathematics, and Geography — the exact spine a hydrocarbon workforce\'s children aim at.'],
      ['A fixed offset, all year', 'The oil coast and Nairobi sit two hours apart with no daylight saving on either side, whatever the roster.'],
      ['Portable to the next basin', 'Cabinda now, the Gulf, West Africa, or Brazil next — the curriculum and the board stay constant.'],
    ],
    growingReason: 'Cabinda and the Soyo LNG complex sit at the centre of Angola\'s hydrocarbon economy — offshore operations, the international operators and oilfield-services companies, and a rotational technical workforce — with no international schooling locally and Luanda a flight away. The oil coast shares WAT (UTC+1), a fixed two-hour offset behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the oil coast, portable across postings. Examination sittings planned per session with travel scheduled well ahead.',
      cbc: 'Kenya CBC available for oil-coast families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies on the oil coast for children resident in Angola: compulsory education covers the iniciação class, primary, and the I Ciclo of secondary under the Lei de Bases, with a mandatory national curriculum, and we are not aware of an established parental-choice home-education route — confirm with the Ministério da Educação. The supplementary configuration is the natural one for rotational families: the local or company school carries the obligation while the Cambridge track runs live alongside and continues unchanged to the next posting. Families who are not resident in Angola — including rotational staff whose households remain registered elsewhere — follow their country of residence\'s framework, a status they determine with their own advisers.',
    homeTuitionDetail: 'Smartious delivers to oil-coast families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS at a constant two-hour offset with no seasonal drift, every session recorded — built for rotations, offshore schedules, and split households.',
    faqs: [
      { q: 'We are on an offshore rotation — does the schooling follow us?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next posting anywhere in the world, with examinations sat at authorised centres wherever the family is.' },
      { q: 'Is there any international schooling in Cabinda or Soyo?', a: 'None — Luanda\'s provision is a flight away. Live delivery is the only route that reaches the oil coast without splitting a household.' },
      { q: 'Our household is split between the coast and another country — how does that work?', a: 'The teaching is identical wherever the child is and the recorded library covers travel. Which national framework applies turns on the child\'s residence, which is a question for your own advisers.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const ANGOLA_COUNTRY = {
  slug: 'angola',
  name: 'Angola',
  longName: 'Republic of Angola',
  adjective: 'Angolan',
  flag: '🇦🇴',
  hub: '/online-school/angola',
  hubPageId: 'homeschooling-angola',
  cityPageId: 'angola-city',

  currency: 'AOA',
  currencyName: 'Angolan Kwanza',
  currencyPeg: 'Fees are invoiced in USD; kwanza equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'WAT',
    name: 'West Africa Time (UTC+1), no daylight saving',
    utcOffset: '+1',
    offsetFromEAT: '-2 hours, fixed, every week of the year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Luanda checked first, with regional and cross-border options where local capacity is limited'],
  examCentreTiles: [
    { city: 'Luanda', centre: 'Authorised provision', area: 'The country\'s main external-candidate capacity, confirmed per family per session.' },
    { city: 'Benguela and the corridor', centre: 'Planned per session', area: 'Lobito and Benguela families plan travel into each examination window well ahead.' },
    { city: 'The oil coast', centre: 'Planned well ahead', area: 'Cabinda and Soyo families plan sittings with flights scheduled several weeks in advance.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Angola-based students sit as external candidates at authorised provision, with capacity confirmed per family per session — Luanda is checked first, and Benguela and oil-coast families plan travel into each series well ahead given the distances. Note what does not change: through the compulsory range a Smartious arrangement is supplementary, so the school enrolment carries the obligation and the mandatory national curriculum while the Cambridge calendar runs alongside. One point specific to Angola is worth planning early rather than late: the Lei de Bases provides that certificates and diplomas of primary, secondary and higher levels completed abroad are valid in Angola provided they are recognised by the Executive, with a comparability framework for mutual recognition. Recognition therefore exists as a defined process, and families intending to return into the Angolan system should begin it in good time rather than assume it is automatic.',
  secondaryProgrammeExamRef: 'Authorised Luanda and regional provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/angola.jpg',
  heroEyebrow: 'Online school for Angola',
  heroH1Suffix: 'Angola',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for oil and gas, corporate, expatriate, and Angolan families across Luanda, Lobito and Benguela, and the Cabinda oil coast. Compulsory education covers the iniciação class, primary and the I Ciclo of secondary — so we run alongside your school through those years, and the full pathway opens for the II Ciclo. Taught live from Nairobi at a fixed two-hour offset that never drifts.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — against Luanda fees set by one of the world\'s most expensive expatriate cities.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Angola',

  citiesSectionTitle: 'Where our Angola families are',
  citiesSectionBody: 'Smartious Angola families concentrate across Luanda (Sonangol and the international operators, banking and construction, the diplomatic community, and international school fees among the highest in Africa), Lobito and Benguela (the Atlantic port and the corridor rail link to the Copperbelt and the DRC, drawing logistics and rail investment to a province with almost no international provision), and Cabinda and Soyo (the offshore and LNG heartland, staffed internationally and schooled locally, with Luanda a flight away). One compulsory range ending after the I Ciclo, one supplementary configuration, and a fixed offset that never drifts.',

  trustSignals: [
    { h: 'An African school teaching African families', p: 'Smartious was founded in Nairobi in 2019 and teaches from two operational centres established 2022 and 2023, serving students in 57 countries — an African school with international accreditation, not an overseas provider reaching in.' },
    { h: 'A fixed offset that never drifts', p: 'Angola runs WAT (UTC+1) and Kenya EAT (UTC+3), with no daylight saving on either side. The two-hour gap is constant every week of the year, so class times are the same in January as in July.' },
    { h: 'The compulsory range stated precisely', p: 'The Lei de Bases provides that the obligation covers the iniciação class, the Ensino Primário and the I Ciclo do Ensino Secundário. The II Ciclo — the 10th to 12th classes — is not within it, which is the most useful planning fact for the senior years.' },
    { h: 'Foreign qualifications are recognised as a process', p: 'The Lei de Bases provides that certificates and diplomas completed abroad are valid in Angola provided they are recognised by the Executive, with a comparability framework supporting mutual recognition. We tell families to start that process early rather than assume it is automatic.' },
  ],

  universitiesInCountry: 'Universidade Agostinho Neto in Luanda, the regional public universities established across the provinces, Universidade Katyavala Bwila in Benguela, and a substantial private sector including Universidade Católica de Angola and Universidade Lusíada.',
  universityChannels: 'Angolan universities admit on the national secondary route, and holders of foreign qualifications rely on the recognition provision in the Lei de Bases — certificates and diplomas completed abroad are valid in Angola once recognised by the Executive, supported by a comparability framework for mutual recognition of studies and qualifications. Families intending to return into the Angolan system should begin that process early. Outward, the destinations are distinctive for our coverage: Portugal above all, where the Angolan student community is long established and the language is shared, alongside Brazil for the same reason; then South Africa, the UK, and increasingly the Gulf and North America. UCAS reads Cambridge A-Levels natively, the Common Application serves US plans, Portuguese and Brazilian universities assess international qualifications through their own equivalence routes, and A-Levels are accepted in 160+ countries — including the petroleum and geoscience programmes the oil coast\'s families most often have in view. Smartious provides personalised university guidance across Portuguese, Brazilian, South African, UK (UCAS), and US destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Angola families, in the two shapes the law leaves open: live supplementary Cambridge subjects beside a school enrolment through the compulsory range — the iniciação class, primary and the I Ciclo — and the full Cambridge IGCSE and A-Level pathway for the II Ciclo years, which sit outside the obligation. Classes land in the Angolan afternoon on a fixed two-hour offset with no seasonal drift, with Cambridge Portuguese available alongside the English-medium core. Examinations at authorised provision confirmed per session.',
  britishCurriculumSuits: 'Angola families targeting the Cambridge pathway. Best fit for: (1) oil and gas families in Cabinda, Soyo, and the offshore sector where no international schooling exists locally, (2) Luanda families outside the international tier\'s exceptional fees, (3) Lobito and Benguela families along the corridor with almost nothing nearby, (4) internationally posted corporate and diplomatic families, (5) students past the compulsory range running the full A-Level phase.',
  britishCurriculumDelivery: 'Live online classes at a constant two-hour offset, small groups 4-6 students, every session recorded. Cambridge examinations at authorised provision, confirmed per session.',
  ibDiplomaSuits: 'Angola families targeting the IB Diploma\'s breadth — an alternative and supplement beside Luanda\'s campus routes.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Angola families targeting American universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to African and internationally mobile families at online-delivery fees rather than campus ones. Angola families join students in 57 other countries — from the Cabinda oil coast to Nairobi\'s own Diamond Plaza HQ, the Lobito Corridor to the Atlantic.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the oil coast\'s petroleum and geoscience families and every medicine-bound student in Luanda. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Angola\'s international schooling is a Luanda story priced by one of the most expensive expatriate cities in the world — Luanda International School, the Portuguese and French schools, and oil-company-linked provision. The schools themselves are decent; the fees are extraordinary even by international-school standards. Outside the capital the picture collapses: Benguela province has almost nothing along a corridor now attracting serious investment, and the Cabinda and Soyo oil heartland has none at all. The competitive space is both a fee gap and an absence.',
  competitors: [
    { name: 'Luanda International School',                    city: 'Luanda',                curriculum: 'International / IB-oriented',           feesUsd: 'Among the highest in Africa',                       feesAed: 'Premium tier',            rating: 4.5, capacityNote: 'The established international campus — priced by an exceptional expatriate market' },
    { name: 'Portuguese and French schools',                  city: 'Luanda',                curriculum: 'Portuguese and French national tracks', feesUsd: 'Premium tier',                                      feesAed: 'Varies',                  rating: 4.3, capacityNote: 'Strong national-system routes — not a British or IB pathway' },
    { name: 'Oil-company and compound provision',             city: 'Luanda, Malongo',       curriculum: 'Company-linked',                        feesUsd: 'Employer-supported where available',                feesAed: '—',                       rating: 4.0, capacityNote: 'Useful where it exists, narrow by design, and tied to an employer' },
    { name: 'Benguela and the corridor',                      city: 'Lobito, Benguela',      curriculum: 'Almost none',                           feesUsd: 'No real international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'A strategically important corridor with no schooling to match the investment' },
    { name: 'Cabinda and Soyo',                               city: 'The oil coast',         curriculum: '—',                                     feesUsd: 'Nothing locally',                                   feesAed: '—',                       rating: 0,   capacityNote: 'Angola\'s hydrocarbon heartland, with Luanda a flight away' },
    { name: 'Boarding in Portugal or South Africa',           city: 'Abroad',                curriculum: 'Portuguese and international',           feesUsd: 'Fees plus travel plus a child living away',         feesAed: '—',                       rating: 4.3, capacityNote: 'The traditional answer for oil-coast and provincial families' },
    { name: 'Smartious Homeschool (Angola via online delivery)', city: 'Delivered to all Angola', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'AOA equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + the oil coast and the corridor reached at last + Portuguese kept alongside + a fixed offset that never drifts' },
  ],

  legalFrameworkIntro: 'Angola\'s education law is unusually well documented and unusually specific about what is compulsory and what is not. Here is the framework exactly, including three provisions international families should know.',
  legalFramework: [
    { h: 'The governing statute', p: 'The Lei de Bases do Sistema de Educação e Ensino — Lei n.º 17/16 of 7 October, as amended by Lei n.º 32/20 of 12 August — governs the Angolan system, with the legal regime for primary and secondary education within the general education subsystem approved by Presidential Decree n.º 162/23. The system is expressly governed by principles including legality, universality, gratuitidade, and obrigatoriedade.' },
    { h: 'What is compulsory, and what is not', p: 'The law is precise: the obligation of education covers the classe de iniciação, the Ensino Primário, and the I Ciclo do Ensino Secundário. The I Ciclo comprises the 7th, 8th and 9th classes, attended by students from roughly twelve to fourteen. The II Ciclo — the 10th, 11th and 12th classes, roughly fifteen to seventeen — is not within the compulsory range. That single distinction is the most useful planning fact for any internationally minded Angolan family, because it means the A-Level years sit outside the obligation entirely.' },
    { h: 'The curriculum is mandatory, which shapes our offer', p: 'Curricula, study plans, teaching programmes and textbooks for pre-school, primary and secondary education have national character and are of mandatory compliance, with twenty per cent of curricular content the responsibility of the locality. That is a stronger curricular requirement than most frameworks we serve carry, and it is the reason our default through the compulsory range is supplementary rather than substitutive: the school delivers the national programme, and we teach the international track alongside it.' },
    { h: 'Home education: what we can and cannot say', p: 'We are not aware of an established parental-choice home-education route under the Lei de Bases, and we phrase it in those terms rather than asserting a categorical prohibition we cannot fully evidence from the statute. A family whose plan turns on the point should confirm the current position with the Ministério da Educação. What is unrestricted is structured education alongside a school enrolment, which is the configuration we build.' },
    { h: 'Two provisions international families should know', p: 'First, consular schools: institutions belonging to foreign States teach in their own country\'s official language under their own regulations, but must also teach Portuguese Language, Angolan Literature, History of Angola and Geography of Angola, with their curricular programmes approved by the Ministry of Education — so a child at a foreign-system school in Luanda carries a defined Angolan component regardless. Second, language policy runs in our favour: the State promotes public policies for the insertion and massification of the main international languages across all subsystems, with priority for English and French. An English-medium academic track is aligned with the direction the system itself is moving.' },
    { h: 'Recognition of foreign qualifications', p: 'The Lei de Bases provides that certificates and diplomas of primary, secondary and higher levels completed abroad are valid in Angola provided they are recognised by the Executive, and establishes a comparability framework used for mutual recognition agreements on studies, titles and academic qualifications. This matters in both directions for our families: it means an internationally examined record has a defined route to Angolan validity, and it means that route is a process to be started early rather than a formality to be assumed at the end.' },
  ],

  whySmartious: [
    { h: 'The compulsory range stated precisely',                          p: 'Iniciação, primary and the I Ciclo are compulsory; the II Ciclo is not. We plan the whole pathway around that distinction rather than around a vague age.' },
    { h: 'A fee gap that is exceptional even for Africa',                  p: 'Luanda\'s tier prices at one of the most expensive expatriate cities in the world; Smartious runs USD 2,160-6,480 a year for live small-group teaching.' },
    { h: 'The oil coast and the corridor reached at last',                 p: 'Cabinda, Soyo, Lobito and Benguela have had boarding abroad or a split household as their only options. Live teaching reaches all of them.' },
    { h: 'Portuguese kept alongside, deliberately',                        p: 'Cambridge Portuguese runs beside the English-medium core, protecting Portuguese and Brazilian university routes for a diaspora concentrated there.' },
    { h: 'Recognition explained as a process',                            p: 'Foreign qualifications are valid in Angola once recognised by the Executive. We tell families to begin that early rather than discover it late.' },
    { h: 'A fixed offset that never drifts',                              p: 'Neither Angola nor Kenya observes daylight saving, so class times are identical in January and July.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Angola?', a: 'Compulsory education covers the iniciação class, the Ensino Primário and the I Ciclo do Ensino Secundário under the Lei de Bases, and the national curriculum is of mandatory compliance. We are not aware of an established parental-choice home-education route under that law and put it in those terms rather than asserting a flat prohibition — confirm with the Ministério da Educação. Structured study alongside a school enrolment is unrestricted.' },
    { q: 'Exactly when does the obligation end?', a: 'After the I Ciclo do Ensino Secundário — the 9th class. The II Ciclo, comprising the 10th to 12th classes and attended from around age fifteen, is not within the compulsory range, so the A-Level years run outside the obligation.' },
    { q: 'Will a Cambridge qualification be recognised in Angola?', a: 'The Lei de Bases provides that certificates and diplomas of primary, secondary and higher levels completed abroad are valid in Angola provided they are recognised by the Executive, supported by a comparability framework for mutual recognition. It is a defined process — start it early if a return into the Angolan system is the plan.' },
    { q: 'Our child is at a consular or foreign-system school — does that change anything?', a: 'Those schools teach in their own country\'s official language under their own regulations, but must also teach Portuguese Language, Angolan Literature, History of Angola and Geography of Angola, with programmes approved by the Ministry. Our teaching runs alongside whichever school a child attends.' },
    { q: 'How do the fees compare with Luanda international schools?', a: 'Luanda\'s international fees are among the highest in Africa, reflecting one of the world\'s most expensive expatriate cities. Smartious runs USD 2,160-6,480 a year for live small-group teaching toward the same Cambridge examinations.' },
    { q: 'We are posted in Cabinda or Soyo — what are the realistic options?', a: 'Historically boarding abroad or a household split between two countries, because there is no international schooling locally and Luanda is a flight away. Live teaching reaches the oil coast and continues unchanged to the next posting.' },
    { q: 'How do class times work from Nairobi?', a: 'Angola runs WAT all year with no daylight saving and Kenya observes none either, so the two-hour offset is fixed — classes land in the Angolan afternoon and early evening at the same time every week of the year.' },
    { q: 'Which parts of Angola does Smartious cover?', a: 'Luanda, Lobito and Benguela, and Cabinda and Soyo have dedicated pages. Live online delivery works identically anywhere in the country — which on the oil coast and along the corridor is precisely the point.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us which class your child is in: in Angola the line between the I Ciclo and the II Ciclo changes the whole plan, and that conversation belongs at the start.',
}
