// ═══════════════════════════════════════════════════════════════════
// ZIMBABWE — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for professional, diaspora, mining, and Zimbabwean
// families across Harare, Bulawayo, and Victoria Falls / Hwange.
// THREE CITIES (Africa builds run 2-3 cities).
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg; if absent the
// onError handler falls back to the brand gradient. Do NOT paste in
// guessed stock-photo IDs.
//
// LEGAL POSITIONING NOTE:
// - The governing statute is the EDUCATION ACT [CHAPTER 25:04],
//   substantially amended by the EDUCATION AMENDMENT ACT, 2019 (Act
//   15 of 2019), in force 6 March 2020. Its long title is unusually
//   useful to us: the Act provides for the declaration of the
//   fundamental rights to, and objectives of, education in Zimbabwe;
//   for government schools; for the establishment, administration,
//   REGISTRATION AND CONTROL of non-government schools; and — note
//   this specifically — for the REGISTRATION AND CONTROL OF
//   CORRESPONDENCE COLLEGES AND INDEPENDENT COLLEGES, with an
//   advisory council for such colleges.
// - THAT CORRESPONDENCE-COLLEGE PROVISION IS WORTH STATING, AND
//   HEDGING: it shows Zimbabwean law has long contemplated education
//   delivered at a distance as a regulated category. Do NOT claim it
//   authorises any particular foreign online provider, and do NOT
//   claim registration status for Smartious. Say: the law recognises
//   distance and correspondence provision as a registrable category,
//   and any family should confirm the current position with the
//   Ministry of Primary and Secondary Education.
// - HOME EDUCATION — HEDGE AS WITH ZAMBIA AND KOSOVO: our research
//   of the Act did not surface an explicit statutory parental
//   home-education route. Say "we are not aware of an established
//   statutory route; confirm with the Ministry of Primary and
//   Secondary Education". Never assert prohibition; never imply
//   availability.
// - CONSEQUENCE: SUPPLEMENTARY is the default configuration.
//
// STRUCTURAL ADVANTAGES — USE PROMINENTLY:
// 1. THE DEEPEST CAMBRIDGE TRADITION IN OUR AFRICAN COVERAGE.
//    Zimbabwe's schools have run Cambridge O- and A-Levels for
//    generations; ZIMSEC administers the national equivalents and
//    many private and trust schools still run Cambridge alongside.
//    Cambridge here is native, not imported.
// 2. ENGLISH IS THE LANGUAGE OF INSTRUCTION (alongside Shona and
//    Ndebele as national languages). No dual-language curriculum
//    burden of the European kind.
// 3. TIMEZONE: CAT (UTC+2), no daylight saving — one hour behind
//    Nairobi EAT. Ties with Zambia as the closest in our coverage.
// 4. LITERACY AND ACADEMIC CULTURE are among the highest in Africa,
//    and the diaspora — South Africa, the UK, Australia, New Zealand
//    — is very large. Families are frequently planning across
//    borders already.
// 5. USD PRICING IS NATURAL. Zimbabwe operates a multi-currency
//    environment in which USD is widely used for school fees, so our
//    USD invoicing removes a friction rather than adding one. State
//    this factually and WITHOUT commentary on monetary policy,
//    inflation history, or politics.
//
// EDITORIAL NOTE: keep these pages strictly commercial and
// apolitical. No commentary on governance, sanctions, land reform,
// elections, or economic policy. Describe the education market, the
// qualifications, and the practical situation of families. If a
// sentence needs a political judgement to make sense, cut it.
// ═══════════════════════════════════════════════════════════════════

export const ZIMBABWE_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'harare-zw',
    name: 'Harare',
    county: 'Harare Province',
    region: 'Capital · the corporate and professional centre · a deep Cambridge school tradition · the diplomatic and NGO community · the largest concentration of examination provision',
    primaryKeyword: 'Online school and Cambridge curriculum in Harare',
    heroTagline: 'For Harare families — the Cambridge education this city has always valued, taught live, at fees built for the present.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Harare families. Few cities in Africa have a longer or deeper relationship with Cambridge examinations than Harare — generations of students have taken O- and A-Levels here, the trust and private schools built their reputations on them, and the qualification carries weight with Zimbabwean families, universities, and employers in a way it does in very few other markets. What has changed is what access costs. Smartious teaches that same pathway live in groups of four to six at USD 2,160-6,480 a year, in English, one hour from our Nairobi teaching base — as the full programme, or as one or two subjects alongside a school a family already values.',
    heroImg: '/heroes/harare-zw.jpg',
    altTexts: { hero: 'Harare city skyline' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Harare families — the Cambridge pathway taught live at accessible fees. From USD 400/month.',
    challenges: [
      'School fees at the strongest Cambridge and trust schools have moved beyond many professional households.',
      'Specialist A-Level subjects — Further Mathematics, Computer Science, Economics — are often unavailable for small cohorts.',
      'Families with relatives in South Africa, the UK, or Australia are frequently planning across two systems at once.',
      'Students who leave a school mid-phase can lose continuity in a curriculum that assumes a two-year run.',
      'Time zone: Zimbabwe runs CAT (UTC+2) with no daylight saving — one hour behind Nairobi EAT, so live classes land inside the Harare school day.',
    ],
    familySituations: [
      'Professional and corporate families weighing Cambridge school fees against household budgets.',
      'Families needing a specialist A-Level subject their school cannot staff.',
      'Diaspora-connected families planning for South African, UK, or Australian universities.',
      'Diplomatic, development, and NGO families on regional postings.',
      'Students returning from abroad mid-curriculum and needing continuity.',
      'Families in outlying suburbs for whom the daily school run is the binding constraint.',
    ],
    nearbyAreas: ['Borrowdale', 'Mount Pleasant', 'Avondale', 'Highlands', 'Chisipite', 'Ruwa', 'Chitungwiza'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Business Studies, Economics, Geography, Computer Science',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), South African universities, and Zimbabwean institutions',
    ],
    whyChoose: [
      ['The qualification Harare already trusts', 'Cambridge IGCSE and A-Level, taught live in small groups — not a new pathway to be persuaded of, but the established one made reachable.'],
      ['Subjects, not a second language', 'Teaching here is in English, so adding Cambridge means adding subjects rather than carrying a parallel curriculum in another language.'],
      ['One hour from our teaching base', 'Zimbabwe is one hour behind Nairobi EAT with no daylight saving either side — classes land in the Harare afternoon all year.'],
      ['The specialist subjects small cohorts lose', 'Further Mathematics, Computer Science, and specialist A-Levels taught properly in a group of five rather than dropped from a timetable.'],
      ['Fees in USD, which most families already use', 'School fees in Zimbabwe are commonly settled in USD, so our invoicing removes a step rather than adding one.'],
    ],
    growingReason: 'Harare holds Zimbabwe\'s corporate and professional centre and one of the deepest Cambridge school traditions in Africa — with the strongest schools\' fees now beyond many of the households that built that tradition. Zimbabwe runs CAT (UTC+2), one hour behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Harare families, as the full pathway or as individual subjects alongside a school enrolment. Examinations at authorised centres confirmed per family per session, with Zimbabwe\'s provision long established.',
      cbc: 'Kenya CBC available for Harare families with East African ties.',
      ib: 'IB Diploma Programme — support and an alternative alongside the city\'s campus provision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Education in Zimbabwe is governed by the Education Act [Chapter 25:04], substantially amended by the Education Amendment Act, 2019, in force from 6 March 2020 — an Act that declares fundamental rights to education and provides for government schools, for the registration and control of non-government schools, and, notably, for the registration and control of correspondence colleges and independent colleges. That last provision is worth noting because it shows Zimbabwean law has long treated education delivered at a distance as a recognised, registrable category rather than an anomaly; we state it as context and make no claim about any particular provider\'s status under it, ours included. On parental home education, our research of the Act did not surface an explicit statutory route, so we say what we can support: we are not aware of an established route, and a family considering one should confirm the current position with the Ministry of Primary and Secondary Education. What is unrestricted, and what we build, is structured education alongside a school enrolment — the school carrying the routine and whatever obligation applies, with live Cambridge subjects running alongside.',
    homeTuitionDetail: 'Premium tier includes optional in-person home tuition supplementation for Harare families during examination preparation periods, subject to associate teacher availability.',
    onlineLearningDetail: 'Live online via Smartious LMS. Classes land inside the Harare school day given the one-hour offset, with every session recorded for unlimited rewatch.',
    faqs: [
      { q: 'Is homeschooling legal in Zimbabwe?', a: 'Education is governed by the Education Act [Chapter 25:04] as amended in 2019. Our research of that Act did not surface an explicit statutory parental home-education route, so we are not aware of an established one and would tell any family considering it to confirm with the Ministry of Primary and Secondary Education. Structured study alongside a school enrolment is unrestricted, and that is how we work here.' },
      { q: 'Does Zimbabwean law recognise distance education?', a: 'The Education Act provides for the registration and control of correspondence colleges and independent colleges, with an advisory council for them — so distance provision is a recognised, regulated category in Zimbabwean law. We state that as context rather than as a claim about our own status, which families should verify with the Ministry.' },
      { q: 'Can we take one or two subjects alongside our current school?', a: 'Yes, and in Harare it is one of the most common arrangements — typically Further Mathematics, Computer Science, or a science the school cannot staff for a small cohort.' },
      { q: 'Where do Harare students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session. Zimbabwe\'s Cambridge examination provision is long established, which makes this considerably simpler than in most countries we serve.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'bulawayo-zw',
    name: 'Bulawayo',
    county: 'Bulawayo Province',
    region: 'The second city · an industrial and engineering tradition · long-established schools with a strong academic record · the gateway to Matabeleland and the South African corridor',
    primaryKeyword: 'Online school and Cambridge curriculum in Bulawayo',
    heroTagline: 'For Bulawayo families — a city that has always taken schooling seriously, and an economy that has made it harder to pay for.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Bulawayo families. Bulawayo is Zimbabwe\'s second city and its industrial one — a railway and engineering tradition, a manufacturing base, and a set of long-established schools whose academic records are known well beyond Matabeleland. It is also closely tied to South Africa: the corridor south shapes trade, work, and where a great many families\' relatives now live. Cambridge is familiar here and the ambition is not in question; what has changed is affordability, and how many specialist subjects a smaller cohort can sustain. Smartious teaches the Cambridge pathway live across Bulawayo and Matabeleland — in English, one hour from our teaching base.',
    heroImg: '/heroes/bulawayo-zw.jpg',
    altTexts: { hero: 'Bulawayo city centre' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Bulawayo and Matabeleland families — Cambridge taught live at accessible fees. From USD 400/month.',
    challenges: [
      'Strong local schools with rising fees, in a city where household budgets have tightened.',
      'Smaller senior cohorts make specialist A-Level subjects hard to sustain.',
      'Close South African ties mean many families are planning for two systems at once.',
      'Matabeleland outside the city has very little provision at any level.',
      'Time zone: Bulawayo shares CAT (UTC+2) — one hour behind Nairobi EAT.',
    ],
    familySituations: [
      'Professional, engineering, and manufacturing families across the city.',
      'Families with relatives and university plans in South Africa.',
      'Students needing a specialist A-Level their school cannot staff.',
      'Families in Matabeleland outside Bulawayo with no local option.',
      'Students returning from abroad mid-curriculum and needing continuity.',
    ],
    nearbyAreas: ['Bulawayo', 'Hillside', 'Khumalo', 'Pumula', 'Esigodini', 'Gwanda', 'Plumtree and the Botswana corridor'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Business Studies, Geography, Computer Science',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Chemistry',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), South African universities, and Zimbabwean institutions',
    ],
    whyChoose: [
      ['Specialist subjects a smaller cohort cannot sustain', 'Further Mathematics, Computer Science, and specialist sciences taught properly in a group of five, wherever the student is enrolled.'],
      ['A qualification that reads south of the border', 'South African universities assess Cambridge A-Levels routinely — which matters in a city whose families are so closely tied to that corridor.'],
      ['Engineering depth for an engineering city', 'Cambridge A-Level Mathematics, Further Mathematics, and Physics — led by a founder with a BEd in Mathematics and Physics.'],
      ['Reaches Matabeleland, not just the city', 'Gwanda, Esigodini, Plumtree and the wider province get identical live teaching.'],
      ['One hour from our teaching base', 'Bulawayo is one hour behind Nairobi EAT — classes land in the local afternoon.'],
    ],
    growingReason: 'Bulawayo is Zimbabwe\'s second city and industrial centre — a railway and engineering tradition, long-established schools with strong academic records, and close ties to the South African corridor — with affordability and cohort size now the binding constraints. Bulawayo shares CAT (UTC+2), one hour behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Bulawayo and Matabeleland, as the full pathway or as individual subjects alongside a school enrolment. Examinations at authorised centres confirmed per session.',
      cbc: 'Kenya CBC available for Bulawayo families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national position applies in Bulawayo: education is governed by the Education Act [Chapter 25:04] as amended in 2019, which provides among other things for the registration and control of correspondence and independent colleges — distance provision being a recognised regulated category in Zimbabwean law. Our research did not surface an explicit statutory parental home-education route, so we say we are not aware of one and point families to the Ministry of Primary and Secondary Education. Structured education alongside a school enrolment is unrestricted and is our default configuration.',
    homeTuitionDetail: 'In-person tuition supplementation in Bulawayo is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the Bulawayo school day on the one-hour offset, with every session recorded.',
    faqs: [
      { q: 'Our school cannot offer Further Mathematics — can you?', a: 'Yes, and it is among the most common reasons Bulawayo families come to us. The student stays enrolled where they are and takes the subject with us live in a group of four to six, sitting the same Cambridge examination.' },
      { q: 'Will South African universities accept these qualifications?', a: 'South African universities assess Cambridge A-Levels routinely, with entry and exemption requirements confirmed per institution and programme. It is a well-trodden route for Zimbabwean students.' },
      { q: 'Do you reach families outside the city?', a: 'Yes — Gwanda, Esigodini, Plumtree and the wider province receive identical live teaching, with examination travel planned into each series.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'victoria-falls-zw',
    name: 'Victoria Falls & Hwange',
    county: 'Matabeleland North',
    region: 'The tourism capital and the Zambezi · Hwange National Park and the coal and power belt · an internationally staffed hospitality and conservation economy · no international schooling',
    primaryKeyword: 'Online school and Cambridge curriculum in Victoria Falls',
    heroTagline: 'For Victoria Falls and Hwange families — one of Africa\'s great tourism destinations, and a schooling map that stops at Bulawayo.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Victoria Falls and Hwange families. Victoria Falls is one of the most internationally visited places on the continent — lodges and hotels, rafting and safari operations, an international airport, and a permanent community of operators, guides, conservationists, and hospitality managers who live here year-round rather than seasonally. An hour south, Hwange runs the national park alongside the coal and power belt with its own technical workforce. Bulawayo is several hours away and the schooling map effectively stops there. Smartious delivers the Cambridge pathway live across the north-west, with a rhythm built for a season that never quite ends.',
    heroImg: '/heroes/victoria-falls-zw.jpg',
    altTexts: { hero: 'Victoria Falls and the Zambezi' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Victoria Falls and Hwange families — tourism and conservation economy, no international schooling. From USD 400/month.',
    challenges: [
      'No international schooling in the region, with Bulawayo several hours away.',
      'Lodge, safari, and conservation work rarely fits a fixed school timetable.',
      'Staff and families frequently live well outside town, where distance decides everything.',
      'Hwange\'s technical and mining workforce has no local Cambridge option.',
      'Time zone: Victoria Falls shares CAT (UTC+2) — one hour behind Nairobi EAT.',
    ],
    familySituations: [
      'Lodge, hotel, and hospitality management families along the Zambezi.',
      'Safari guiding and conservation staff families living outside town.',
      'Hwange coal, power, and technical workforce families.',
      'Cross-border families with ties to Zambia and Botswana.',
      'Students aiming at universities in Zimbabwe, South Africa, or overseas.',
    ],
    nearbyAreas: ['Victoria Falls', 'the Zambezi lodges', 'Hwange town', 'Hwange National Park', 'Dete', 'Binga', 'the Zambian and Botswana borders'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Geography, Business Studies, Travel and Tourism-track subjects',
      'Cambridge A-Level Biology, Geography, Mathematics, Physics, Chemistry',
      'Cambridge A-Level Economics, Business',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), South African universities, and Zimbabwean institutions',
    ],
    whyChoose: [
      ['The complete option where no campus exists', 'Identical live delivery from the Falls to Hwange — the Cambridge pathway the north-west never had.'],
      ['Built for a season that never ends', 'Live classes plus a complete recorded library hold the academic year through peak visitor months and shift rosters.'],
      ['Biology and environmental science that fit the place', 'A major national park and one of the world\'s great river systems make unusually strong context for Cambridge Biology and Geography, and AP Environmental Science.'],
      ['Reaches families outside town', 'Lodge and conservation staff living well beyond the Falls get the same teaching as anyone in Harare.'],
      ['One hour from our teaching base', 'Victoria Falls is one hour behind Nairobi EAT.'],
    ],
    growingReason: 'Victoria Falls is one of Africa\'s most internationally visited destinations — lodges, safari and rafting operations, an international airport, and a permanent year-round community — with Hwange\'s park and coal belt south of it and no international schooling anywhere in the region. Victoria Falls shares CAT (UTC+2), one hour behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the north-west. Examination sittings planned per session with travel scheduled around the season.',
      cbc: 'Kenya CBC available for north-western families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national position applies in the north-west: education is governed by the Education Act [Chapter 25:04] as amended in 2019, we are not aware of an explicit statutory parental home-education route under it, and families considering one should confirm with the Ministry of Primary and Secondary Education. Structured education alongside a school enrolment is unrestricted and is our default, with the recorded library carrying the visitor season. Families with ties across the Zambian or Botswana borders should note that education law follows residence rather than where a business operates — and that our Zambia pages cover the position on the other side of the bridge.',
    homeTuitionDetail: 'In-person tuition supplementation in the north-west is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the local school day on the one-hour offset, with the full recorded library carrying peak season and shift rosters.',
    faqs: [
      { q: 'We work in lodges and guiding — can schooling fit our roster?', a: 'It is built for it: live classes with a complete recorded library, so the academic pace holds through peak season and irregular shifts.' },
      { q: 'Is there a Cambridge school at the Falls or in Hwange?', a: 'No international provision in the region, with Bulawayo several hours away. Live online delivery is the complete option for the north-west.' },
      { q: 'We have family across the border in Zambia — do the same rules apply?', a: 'Education law follows residence rather than where a business operates or where relatives live. Our Zambia pages set out the position there; a family\'s own advisers can confirm which applies to them.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const ZIMBABWE_COUNTRY = {
  slug: 'zimbabwe',
  name: 'Zimbabwe',
  longName: 'Republic of Zimbabwe',
  adjective: 'Zimbabwean',
  flag: '🇿🇼',
  hub: '/online-school/zimbabwe',
  hubPageId: 'homeschooling-zimbabwe',
  cityPageId: 'zimbabwe-city',

  currency: 'USD',
  currencyName: 'United States Dollar',
  currencyPeg: 'Invoicing is in USD, which Zimbabwean families already use widely for school fees — so there is no conversion step to manage.',

  timezone: {
    code: 'CAT',
    name: 'Central Africa Time (UTC+2), no daylight saving',
    utcOffset: '+2',
    offsetFromEAT: '-1 hour — tied with Zambia as the closest alignment in Smartious coverage',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Harare and Bulawayo checked first, with Zimbabwe\'s Cambridge provision long established'],
  examCentreTiles: [
    { city: 'Harare', centre: 'Long-established provision', area: 'The largest concentration of Cambridge examination capacity in the country, confirmed per family per session.' },
    { city: 'Bulawayo', centre: 'Established provision', area: 'The second city\'s schools and centres, confirmed per session.' },
    { city: 'The north-west and the regions', centre: 'Planned per session', area: 'Victoria Falls and Hwange families plan travel into each series around the season.' },
  ],
  examLogisticsProse: 'Zimbabwe is among the most straightforward countries we serve for examinations, and the reason is history: Cambridge O- and A-Levels have been taken here for generations, so authorised provision is long established rather than something to be assembled. Harare holds the largest concentration of capacity, Bulawayo the second, and north-western families plan travel into each series around the visitor season. Students sit as external candidates where they are not enrolled at a centre school, with capacity confirmed per family per session. One thing worth noting for families running our track alongside a Zimbabwean school: there is no second-language national examination to carry, of the kind our European families manage. Both curricula run in English and overlap heavily in mathematics and the sciences, so the additional load is genuine but far lighter than in most of our coverage.',
  secondaryProgrammeExamRef: 'Long-established Zimbabwean Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/zimbabwe.jpg',
  heroEyebrow: 'Online Cambridge school for Zimbabwe',
  heroH1Suffix: 'Zimbabwe',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for professional, diaspora-connected, mining, and Zimbabwean families across Harare, Bulawayo, and Victoria Falls and Hwange. Few countries in Africa know Cambridge better than this one. We teach that same pathway live in groups of four to six, in English, one hour from our teaching base — as the full programme or as the two subjects your school cannot staff.',
  heroValueProp: 'From USD 180/month, invoiced in the currency Zimbabwean families already use for fees. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Zimbabwe',

  citiesSectionTitle: 'Where our Zimbabwe families are',
  citiesSectionBody: 'Smartious Zimbabwe families concentrate across Harare (the corporate and professional centre with the deepest Cambridge tradition and the largest examination capacity), Bulawayo and Matabeleland (the industrial second city, closely tied to the South African corridor, where smaller cohorts make specialist subjects hard to sustain), and Victoria Falls and Hwange (an internationally staffed tourism, conservation, and coal economy with no international schooling at all). One qualification the whole country already trusts, three different reasons families cannot reach it.',

  trustSignals: [
    { h: 'Two operational teaching centres', p: 'Live teaching to Zimbabwe families is delivered from two international-standard operational centres established 2022 and 2023, in Nairobi.' },
    { h: 'One hour from our teaching base', p: 'Zimbabwe runs CAT (UTC+2) with no daylight saving — one hour behind Nairobi EAT, tied with Zambia as the closest alignment in our coverage. Live classes land in the Zimbabwean afternoon every month of the year.' },
    { h: 'Cambridge is native here, not imported', p: 'Zimbabwe has taken Cambridge O- and A-Levels for generations, examination provision is long established, and the qualification carries weight with families, universities, and employers. We are extending access to a familiar pathway, not introducing an unfamiliar one.' },
    { h: 'The framework stated carefully', p: 'Education is governed by the Education Act [Chapter 25:04] as amended in 2019. Our research did not surface an explicit statutory parental home-education route, so we say we are not aware of one and point families to the Ministry of Primary and Secondary Education — rather than claiming either a prohibition or an availability.' },
  ],

  universitiesInCountry: 'The University of Zimbabwe, the National University of Science and Technology (NUST) in Bulawayo, Midlands State University, Africa University, and a substantial private and church-founded sector — all teaching in English, with strong medical, engineering, and commerce faculties.',
  universityChannels: 'Zimbabwean universities admit students on Cambridge qualifications routinely, with entry requirements confirmed per programme — the qualification is thoroughly familiar in the system, having been taken here for generations alongside ZIMSEC\'s national examinations. Regionally, South African universities are the single most common overseas destination for Zimbabwean students and assess Cambridge A-Levels routinely, with exemption and entry requirements confirmed per institution; Botswana and Namibia follow. Internationally, UCAS reads A-Levels natively, the Common Application serves US plans, Australian and New Zealand universities assess them routinely — which matters given where much of the Zimbabwean diaspora now lives — and A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across Zimbabwean, Southern African, UK (UCAS), Australian, and US destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Zimbabwe families. Cambridge IGCSE (Years 10-11) and Cambridge A-Level (Years 12-13) delivered as live online classes landing inside the Zimbabwean school day on the one-hour offset — as the full pathway, or as one or two subjects alongside a school a family already values. Examinations at long-established Zimbabwean provision, confirmed per session. This is the qualification the country already knows; our contribution is price, reach, and the subjects small cohorts cannot sustain.',
  britishCurriculumSuits: 'Zimbabwe families targeting the Cambridge pathway. Best fit for: (1) professional households for whom the strongest schools\' fees have moved out of range, (2) students needing a specialist A-Level — Further Mathematics, Computer Science, Economics — their school cannot staff for a small cohort, (3) families in Victoria Falls, Hwange, and the regions with no provision at all, (4) diaspora-connected families planning for South African, UK, Australian, or New Zealand universities, (5) students returning from abroad mid-curriculum who need continuity.',
  britishCurriculumDelivery: 'Live online classes landing inside the Zimbabwean school day on the one-hour offset, small groups 4-6 students. Cambridge examinations at established provision, confirmed per session.',
  ibDiplomaSuits: 'Zimbabwe families targeting the IB Diploma\'s breadth — support and an alternative alongside the country\'s campus provision.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Zimbabwe families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in 2019 in Nairobi to make international qualifications accessible to African and internationally mobile families at online-delivery fees. Zimbabwe is a natural market for that: the same region, the same language of instruction, one hour of time difference, and a Cambridge tradition older than most of the schools we compete with elsewhere. Zimbabwe families join students in 50 other countries.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, which suits a country where Further Mathematics and the specialist sciences are exactly what smaller senior cohorts lose first. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Zimbabwe\'s schools do not need to be sold on Cambridge, and we would not attempt it. The trust and private schools in Harare and Bulawayo have decades of results behind them and offer a campus experience we cannot replicate. Three specific things have changed: what those schools cost relative to household budgets, how many specialist subjects a smaller senior cohort can sustain, and how much of the country lives beyond reach of either city. Those three gaps are where we work.',
  competitors: [
    { name: 'Harare trust and private schools',               city: 'Harare',                curriculum: 'Cambridge O/A-Level, some IB',          feesUsd: 'Premium tier, USD-denominated',                     feesAed: 'Varies by school',        rating: 4.6, capacityNote: 'Decades of results and genuine campus culture — and fees beyond many professional households' },
    { name: 'Bulawayo established schools',                   city: 'Bulawayo',              curriculum: 'Cambridge O/A-Level',                   feesUsd: 'Upper-mid to premium',                              feesAed: 'Varies',                  rating: 4.5, capacityNote: 'Strong academic records; smaller senior cohorts limit specialist subjects' },
    { name: 'ZIMSEC national route',                          city: 'Nationwide',            curriculum: 'National O/A-Level',                    feesUsd: 'State and low-fee schools',                         feesAed: '—',                       rating: 4.2, capacityNote: 'The majority route, well understood domestically — a different qualification for overseas admission' },
    { name: 'Victoria Falls, Hwange and the regions',         city: 'Outside the two cities', curriculum: '—',                                    feesUsd: 'No international provision',                        feesAed: '—',                       rating: 0,   capacityNote: 'A globally visited tourism economy and a coal and power belt — nothing' },
    { name: 'Boarding in South Africa or the UK',             city: 'Abroad',                curriculum: 'Cambridge / national systems',          feesUsd: 'Far above local fees, plus travel',                 feesAed: 'Plus separation',         rating: 4.4, capacityNote: 'A long-standing Zimbabwean answer — expensive, and it sends the child away' },
    { name: 'Smartious Homeschool (Zimbabwe via online delivery)', city: 'Delivered to all Zimbabwe', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'Invoiced in USD', rating: 4.8, capacityNote: 'Every class live through A-Level + the qualification the country already trusts + specialist subjects small cohorts lose + the regions served identically' },
  ],

  legalFrameworkIntro: 'Zimbabwe\'s framework is easy to state and contains one provision worth noticing that most guides skip. Here it is exactly, including the part we describe carefully rather than confidently.',
  legalFramework: [
    { h: 'The governing statute', p: 'Education in Zimbabwe is governed by the Education Act [Chapter 25:04], substantially amended by the Education Amendment Act, 2019 (Act 15 of 2019), which came into force on 6 March 2020. The Act declares fundamental rights to, and objectives of, education; provides for government schools and facilities; provides for the establishment, administration, registration and control of non-government schools; and makes financial provision for schools. The Ministry of Primary and Secondary Education administers the sector, and ZIMSEC administers national examinations.' },
    { h: 'The provision most guides skip: correspondence and independent colleges', p: 'The same Act provides for the registration and control of correspondence colleges and independent colleges, and for an advisory council for such colleges. That is worth noticing, because it means Zimbabwean law has long treated education delivered at a distance as a recognised, regulated category rather than an oddity — a longer history with the idea than several European countries we serve. We are careful about what we draw from it: it is context about how the system thinks, not a claim that it authorises any particular foreign provider, and certainly not a claim about our own status. Any family for whom that question matters should put it to the Ministry directly.' },
    { h: 'Home education: what we can and cannot say', p: 'Our research of the Education Act did not surface an explicit statutory parental home-education route. We are not aware of an established route; we will not assert a flat prohibition, which is more than the statute text supports; and we will not imply availability, which would be worse for a family who relies on it. Confirm the current position with the Ministry of Primary and Secondary Education. What is unrestricted, and what we build, is structured education alongside a school enrolment: the school carries the routine and whatever obligation applies, and live Cambridge subjects run alongside toward external examinations.' },
    { h: 'Why Cambridge is not a foreign qualification here', p: 'This matters more in Zimbabwe than almost anywhere we operate. Cambridge O- and A-Levels have been taken in this country for generations; the trust and private schools built their reputations on them; examination provision is long established; and Zimbabwean universities, employers, and families read the qualification fluently. So the conversation is not about whether an international qualification will be accepted. It is about price, about which subjects a school can still staff, and about how much of the country lives beyond reach of Harare or Bulawayo. Those are the questions we answer.' },
    { h: 'Three practical advantages, stated plainly', p: 'Language: teaching is in English, so a student adding Cambridge subjects is adding subjects rather than carrying a second curriculum in a second language — the burden that defines home education across much of Europe simply does not exist here. Time: Zimbabwe runs CAT at UTC+2 with no daylight saving, one hour behind our Nairobi teaching base, so live classes land in the Zimbabwean afternoon all year. Currency: school fees in Zimbabwe are commonly settled in USD, which is how we invoice, so there is no conversion step for a family to manage.' },
    { h: 'Where the qualifications lead', p: 'Zimbabwean universities admit on Cambridge qualifications routinely with requirements confirmed per programme. South African universities are the single most common overseas destination for Zimbabwean students and assess A-Levels routinely, with exemption requirements confirmed per institution; Botswana and Namibia follow. And given where much of the Zimbabwean diaspora now lives, it is worth noting that Australian, New Zealand, and UK universities all read A-Levels directly — UCAS natively — with the Common Application serving US plans. One examined record covers every one of those destinations, which is precisely what a family planning across borders needs.' },
  ],

  whySmartious: [
    { h: 'The qualification the country already trusts',                    p: 'Cambridge IGCSE and A-Level have been taken here for generations. We are not asking families to believe in something new — only to reach something familiar.' },
    { h: 'The specialist subjects small cohorts lose first',                p: 'Further Mathematics, Computer Science, and specialist sciences taught properly in a group of five, whichever school a student is enrolled at.' },
    { h: 'One hour from our teaching base',                                 p: 'CAT with no daylight saving, one hour behind Nairobi EAT — classes land in the Zimbabwean afternoon every month of the year.' },
    { h: 'Invoiced in the currency families already use',                   p: 'School fees here are commonly settled in USD, which is how we invoice — one less step to manage.' },
    { h: 'A record that works everywhere the diaspora is',                  p: 'South Africa, the UK, Australia, New Zealand — all read Cambridge A-Levels directly, which matters for families already planning across borders.' },
    { h: 'The regions served identically',                                  p: 'Victoria Falls, Hwange, Matabeleland outside Bulawayo — no provision at all, and identical live teaching.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Zimbabwe?', a: 'Education is governed by the Education Act [Chapter 25:04] as amended in 2019, and our research of that Act did not surface an explicit statutory parental home-education route. We are not aware of an established route and would tell any family considering one to confirm with the Ministry of Primary and Secondary Education. Structured study alongside a school enrolment is unrestricted, and that is how we work here.' },
    { q: 'Does Zimbabwean law recognise distance education?', a: 'The Education Act provides for the registration and control of correspondence colleges and independent colleges, with an advisory council for them — so distance provision is a recognised, regulated category in Zimbabwean law. We offer that as context about the system rather than as a claim about any provider\'s status, ours included.' },
    { q: 'Is Cambridge recognised in Zimbabwe?', a: 'Thoroughly, and for generations. Cambridge O- and A-Levels are deeply established here, examination provision is long-standing, and Zimbabwean universities and employers read the qualification fluently alongside ZIMSEC\'s national examinations.' },
    { q: 'Can we take just one or two subjects alongside our current school?', a: 'Yes, and it is among the most common arrangements here — typically Further Mathematics, Computer Science, or a specialist science a smaller senior cohort cannot sustain. The student stays where they are and sits the same Cambridge examination.' },
    { q: 'How do you handle fees?', a: 'We invoice in USD, which Zimbabwean families already use widely for school fees, so there is no conversion step to manage. USD 2,160-6,480 a year covers live small-group teaching through to A-Level.' },
    { q: 'Will South African universities accept these qualifications?', a: 'They assess Cambridge A-Levels routinely, with exemption and entry requirements confirmed per institution and programme. It is the most common overseas route for Zimbabwean students, alongside the UK, Australia, and New Zealand — all of which read A-Levels directly.' },
    { q: 'How does the timezone work?', a: 'Zimbabwe runs CAT at UTC+2 with no daylight saving, one hour behind our Nairobi teaching base — tied with Zambia as the closest alignment in our coverage. Live classes land in the Zimbabwean afternoon, never late at night.' },
    { q: 'Is this an alternative to boarding in South Africa?', a: 'For many families, yes: the same qualification, live small-group teaching, a fraction of the cost, and the child at home. What boarding provides that we cannot is the campus experience itself, and families weigh that differently.' },
    { q: 'Which parts of Zimbabwe does Smartious cover?', a: 'Harare, Bulawayo and Matabeleland, and Victoria Falls and Hwange have dedicated pages with local context. Live online delivery works identically anywhere in the country — which in the north-west is precisely the point.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us whether you are looking for the full programme or one or two subjects alongside your child\'s current school: in Zimbabwe both are common, and they are different conversations.',
}
