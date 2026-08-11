// ═══════════════════════════════════════════════════════════════════
// ZAMBIA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for mining, expat, professional, and Zambian
// families across Lusaka, the Copperbelt, and Livingstone.
// THREE CITIES (Africa builds run 2-3 cities).
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent, the onError handler falls back to the brand gradient.
// Do NOT paste in guessed stock-photo IDs.
//
// LEGAL POSITIONING NOTE:
// - The governing statute is the EDUCATION ACT, 2011 (No. 23 of
//   2011), which regulates the provision of education, the
//   establishment and registration of educational institutions,
//   learners' rights, curriculum, assessment and certification. The
//   Examinations Council of Zambia (ECZ) is established under its
//   own Act. Structure: basic education grades 1-9, then high
//   school education covering grades 10-12 over three years.
// - HOME EDUCATION — HEDGE EXACTLY AS WRITTEN: our research of the
//   Education Act 2011 did not surface an explicit statutory
//   parental home-education route. State it as "we are not aware of
//   an established statutory home-education route, and families
//   should confirm the current position with the Ministry of
//   Education" — NOT as a prohibition, which we cannot evidence,
//   and NOT as an available pathway, which would be worse.
// - CONSEQUENCE: SUPPLEMENTARY is the default. The school enrolment
//   carries whatever obligation applies; Cambridge runs alongside.
//   Private and international schools are registered and regulated
//   under the Act, and many already teach Cambridge — so a great
//   deal of what families want is available in-country and our role
//   is to reach the families and subjects those schools cannot.
//
// TWO STRUCTURAL ADVANTAGES — USE THESE PROMINENTLY, THEY DO NOT
// EXIST IN OUR EUROPEAN COVERAGE:
// 1. ENGLISH IS THE LANGUAGE OF INSTRUCTION. There is no dual-track
//    language burden of the kind Hungarian, Slovak, Slovenian,
//    Serbian, or Bulgarian families carry. A Zambian student adding
//    Cambridge subjects is adding subjects, not a second language.
// 2. TIMEZONE: Zambia runs CAT (UTC+2) — ONE HOUR behind Nairobi
//    EAT, the closest alignment in our entire coverage. Live classes
//    land squarely in the Zambian school day and afternoon.
// 3. CAMBRIDGE IS NOT FOREIGN HERE. Cambridge qualifications are
//    long established across Zambian private and international
//    schools, and examination provision exists in-country. Frame us
//    as extending access to a familiar pathway, never as importing
//    an exotic one.
// MARKET NOTE: Lusaka holds the international tier — the American
// International School of Lusaka, the International School of
// Lusaka, Baobab College, Rhodes Park, Lusaka's Cambridge-offering
// private schools — at fees that have risen sharply. The Copperbelt
// (Kitwe, Ndola, Chingola, Solwezi) runs the copper economy with an
// internationally recruited technical workforce and far thinner
// provision. Livingstone runs Victoria Falls tourism. Zambia also
// hosts a substantial regional expatriate and NGO community, and a
// growing number of families returning from South Africa and the UK.
// ═══════════════════════════════════════════════════════════════════

export const ZAMBIA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'lusaka-zm',
    name: 'Lusaka',
    county: 'Lusaka Province',
    region: 'Capital · the corporate, diplomatic and NGO centre of the region · the country\'s international-school tier · Cambridge long established in the private sector',
    primaryKeyword: 'Online school and Cambridge curriculum in Lusaka',
    heroTagline: 'For Lusaka families — the Cambridge pathway you already know, taught live at a fraction of the fees, one hour from our teaching base.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Lusaka families. Lusaka carries Zambia\'s corporate weight and a diplomatic, development, and NGO community that serves much of the region — and its international-school tier has grown alongside it, with the American International School of Lusaka, the International School of Lusaka, Baobab College and the Cambridge-offering private schools drawing families from across the city. What has also grown is the fee. Smartious teaches the same Cambridge pathway those schools run, live and in small groups, at USD 2,160-6,480 a year — and with two advantages that do not exist in most of the markets we serve: teaching is in English, so there is no second curriculum to carry, and Zambia sits one hour behind our Nairobi teaching base, the closest alignment we have anywhere.',
    heroImg: '/heroes/lusaka-zm.jpg',
    altTexts: { hero: 'Lusaka city centre' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Lusaka families — the Cambridge pathway at a fraction of local international-school fees. From USD 400/month.',
    challenges: [
      'International and Cambridge-offering school fees in Lusaka have risen sharply, outpacing many professional salaries.',
      'The strongest schools are oversubscribed, with entry points that fill early.',
      'Families relocating within the region arrive mid-year rather than on admission cycles.',
      'Specialist A-Level subjects — Further Mathematics, Computer Science, Economics — are often unavailable for small cohorts.',
      'Time zone: Zambia runs CAT (UTC+2) — one hour behind Nairobi EAT, the closest alignment in our coverage, so live classes land squarely in the school day.',
    ],
    familySituations: [
      'Professional and corporate families facing rising Cambridge-school fees.',
      'Diplomatic, development, and NGO families on regional postings.',
      'Families needing an A-Level subject their school cannot staff.',
      'Returning families from South Africa, the UK, and the Gulf keeping curriculum continuity.',
      'Students preparing for UK, South African, or US universities.',
      'Families in Lusaka\'s outer districts for whom the daily school run is the binding constraint.',
    ],
    nearbyAreas: ['Kabulonga', 'Woodlands', 'Rhodes Park', 'Roma', 'Chelston', 'Chilanga', 'Kafue'],
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
      'University application support — UCAS (UK), Common Application (US), South African universities, and Zambian and regional institutions',
    ],
    whyChoose: [
      ['The same qualification, a different fee', 'Cambridge IGCSE and A-Level taught live in groups of 4-6 at USD 2,160-6,480 a year — the pathway Lusaka\'s private schools already run, without the campus overheads.'],
      ['No second curriculum to carry', 'Teaching here is in English, so a Zambian student adding Cambridge subjects is adding subjects — not the dual-language load families face across much of Europe.'],
      ['The closest timezone we have', 'Zambia is one hour behind Nairobi EAT. Live classes land inside the Lusaka school day and afternoon, never late at night.'],
      ['The subjects a small cohort cannot justify', 'Further Mathematics, Computer Science, and specialist A-Levels taught properly in a group of five rather than dropped from a timetable.'],
      ['Founder-led STEM', 'Alfred Ouko holds a BEd in Mathematics and Physics and leads the Cambridge A-Level and IB STEM subjects personally when needed.'],
    ],
    growingReason: 'Lusaka holds Zambia\'s corporate, diplomatic, development, and NGO centre alongside the country\'s international-school tier — with Cambridge long established in the private sector and fees rising faster than salaries. Zambia runs CAT (UTC+2), one hour behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Lusaka families, run supplementary alongside a school enrolment or as the full pathway. Examinations at authorised centres confirmed per family per session, with in-country provision well established.',
      cbc: 'Kenya CBC available for Lusaka families with East African ties — a common profile in the regional NGO and corporate community.',
      ib: 'IB Diploma Programme — supplements and support alongside the city\'s campus IB provision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Education in Zambia is governed by the Education Act, 2011, which regulates the provision of education and the establishment and registration of educational institutions, along with curriculum, assessment, and certification; national examinations run through the Examinations Council of Zambia. Our research of that Act did not surface an explicit statutory parental home-education route, and we state that carefully: we are not aware of an established route, families considering one should confirm the current position with the Ministry of Education, and we will neither assert a prohibition we cannot evidence nor imply an availability we cannot support. What is clear and unrestricted is structured education alongside a school enrolment, and that is our clean default in Zambia — the school carries whatever obligation applies while live Cambridge or IB subjects run alongside, typically in the after-school slot given the one-hour offset. Registered private and international schools already teach Cambridge widely here, so much of what families want exists in-country; our role is to reach the households those fees exclude and the subjects those timetables cannot staff.',
    homeTuitionDetail: 'Premium tier includes optional in-person home tuition supplementation for Lusaka families during examination preparation periods, subject to associate teacher availability.',
    onlineLearningDetail: 'Live online via Smartious LMS. Classes land inside the Lusaka school day given the one-hour offset — the closest timezone alignment in our coverage — with every session recorded for unlimited rewatch.',
    faqs: [
      { q: 'Is homeschooling legal in Zambia?', a: 'Education is governed by the Education Act, 2011, and our research of that Act did not surface an explicit statutory parental home-education route. We are not aware of an established route and would tell any family considering one to confirm the current position with the Ministry of Education. What is unrestricted is structured study alongside a school enrolment, which is how we work here.' },
      { q: 'How do your fees compare with Lusaka\'s Cambridge schools?', a: 'Smartious runs USD 2,160-6,480 a year for live small-group teaching. Lusaka\'s international and Cambridge-offering private schools sit well above that, and the gap has widened as fees have risen. We are not replacing what a campus does socially — we are making the same qualification reachable.' },
      { q: 'Can we take just one or two subjects?', a: 'Yes, and it is a common arrangement here: a student stays at their school and takes Further Mathematics, Computer Science, or a science with us live because the local timetable cannot staff it for a handful of pupils.' },
      { q: 'Where do Lusaka students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session — Cambridge provision is well established in Zambia, which makes this simpler here than in most countries we serve.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'kitwe-zm',
    name: 'Kitwe & the Copperbelt',
    county: 'Copperbelt Province',
    region: 'The copper economy — Kitwe, Ndola, Chingola, Mufulira and Solwezi · an internationally recruited mining and engineering workforce · far thinner schooling than the capital',
    primaryKeyword: 'Online school and Cambridge curriculum in Kitwe and the Copperbelt',
    heroTagline: 'For Copperbelt families — mines staffed from four continents, and a schooling map that stops in Lusaka.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families across Kitwe and the Copperbelt. The copper belt running through Kitwe, Ndola, Chingola, Mufulira and out to Solwezi is one of Africa\'s great mining regions, and its workforce reflects that — mining houses, engineering contractors, and service companies recruiting from South Africa, India, China, Australia, and Europe, alongside a deep local professional class of engineers and metallurgists. What the region does not have is anything approaching Lusaka\'s schooling, and the capital is a long drive or a flight away. Smartious delivers the Cambridge pathway live across the Copperbelt — in English, one hour from our teaching base, with the recorded library built around shift patterns.',
    heroImg: '/heroes/kitwe-zm.jpg',
    altTexts: { hero: 'The Copperbelt mining landscape' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Kitwe, Ndola and Copperbelt families — mining region, thin schooling provision. From USD 400/month.',
    challenges: [
      'An internationally recruited mining workforce with schooling provision far thinner than Lusaka\'s.',
      'The capital is a long drive or a flight away — a relocation or boarding decision rather than a commute.',
      'Mining rotations and shift patterns cut across any fixed school timetable.',
      'Specialist A-Level sciences and mathematics are hard to staff for small cohorts in regional schools.',
      'Time zone: the Copperbelt shares CAT (UTC+2) — one hour behind Nairobi EAT.',
    ],
    familySituations: [
      'Mining, metallurgy, and engineering families across the copper economy.',
      'Contractor and service-company families on multi-year assignments.',
      'Zambian professional families in regional cities without a Cambridge option.',
      'Families weighing boarding in Lusaka or South Africa against staying together.',
      'Students aiming at engineering, geology, or medicine at regional and overseas universities.',
    ],
    nearbyAreas: ['Kitwe', 'Ndola', 'Chingola', 'Mufulira', 'Luanshya', 'Solwezi', 'Kalulushi'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Geography, Business Studies, Computer Science',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Geography, Economics, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Chemistry, AP Physics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including mining and geoscience programmes), Common Application (US), South African universities, and Zambian institutions',
    ],
    whyChoose: [
      ['The alternative to sending a child to Lusaka', 'Identical live teaching delivered to Kitwe, Ndola, Chingola, or Solwezi — no boarding, no relocation, no weekly separation.'],
      ['Geology and engineering depth for a mining region', 'Cambridge A-Level Physics, Chemistry, Mathematics, Further Mathematics, and Geography — led by a founder with a BEd in Mathematics and Physics.'],
      ['Built for rotations and shifts', 'Live classes plus a complete recorded library hold the academic pace through shift patterns and contractor rotations.'],
      ['Portable to the next mine', 'The curriculum, teachers, and examination board continue unchanged to the DRC, South Africa, Australia, or wherever the next posting is.'],
      ['One hour from our teaching base', 'The Copperbelt is one hour behind Nairobi EAT — classes land inside the school day.'],
    ],
    growingReason: 'The Copperbelt — Kitwe, Ndola, Chingola, Mufulira and Solwezi — runs one of Africa\'s great mining economies with a workforce recruited from four continents, and schooling provision far thinner than the capital\'s, a long drive or flight away. The Copperbelt shares CAT (UTC+2), one hour behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Copperbelt, run supplementary alongside a school enrolment or as the full pathway. Examinations at authorised centres confirmed per session, with travel planned ahead where needed.',
      cbc: 'Kenya CBC available for Copperbelt families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national position applies on the Copperbelt: education is governed by the Education Act, 2011, and we are not aware of an established statutory parental home-education route under it — a position families should confirm with the Ministry of Education rather than take from any provider. Structured education alongside a school enrolment is unrestricted and is our clean default, which suits mining families particularly well: the local school carries the routine and whatever obligation applies, the Cambridge track runs live alongside, and the whole arrangement travels unchanged when a contract moves the family to another operation.',
    homeTuitionDetail: 'In-person tuition supplementation on the Copperbelt is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the Copperbelt school day on the one-hour offset, with every session recorded — built for shift patterns and rotations.',
    faqs: [
      { q: 'Is there a Cambridge school on the Copperbelt?', a: 'Provision is far thinner than Lusaka\'s, and the capital is a long drive or flight away. Live online delivery is the complete option for the region, run supplementary alongside a local enrolment or as the full pathway.' },
      { q: 'We are on a multi-year mining contract — does the schooling follow?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next operation anywhere in the world, with examinations sat at authorised centres wherever the family is.' },
      { q: 'Our child wants to study mining engineering — what should they take?', a: 'Cambridge A-Level Mathematics and Physics form the spine, with Chemistry or Further Mathematics depending on the target programme, and Geography where geoscience is in view. We plan the set around the destination from IGCSE onward.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'livingstone-zm',
    name: 'Livingstone & the Southern Province',
    county: 'Southern Province',
    region: 'Victoria Falls and the tourism capital · a seasonal international visitor economy · the Zimbabwean border · no international schooling in the region',
    primaryKeyword: 'Online school and Cambridge curriculum in Livingstone',
    heroTagline: 'For Livingstone and Southern Province families — the falls bring the world every season, and take none of it home to the schools.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Livingstone and Southern Province families. Livingstone is Zambia\'s tourism capital — Victoria Falls, the lodges and camps along the Zambezi, rafting and safari operations, and an airport that connects the region internationally — with a permanent community of tourism operators, hospitality businesses, guides, and conservation staff living here year-round. Across the bridge sits Zimbabwe, and around the province lie Choma, Mazabuka, and the Kafue agricultural belt. International schooling in the region does not exist. Smartious delivers the Cambridge pathway live across the south, with a rhythm built for the season.',
    heroImg: '/heroes/livingstone-zm.jpg',
    altTexts: { hero: 'Victoria Falls and the Zambezi at Livingstone' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Livingstone and Southern Province families — tourism capital, no international schooling. From USD 400/month.',
    challenges: [
      'No international schooling in the region, with Lusaka around five hours away.',
      'Tourism seasons run the whole household, and lodge and camp work is rarely a nine-to-five.',
      'Conservation and safari staff often live outside town, where distance is the binding constraint.',
      'Specialist subjects are unavailable in regional schools for small cohorts.',
      'Time zone: Livingstone shares CAT (UTC+2) — one hour behind Nairobi EAT.',
    ],
    familySituations: [
      'Tourism, lodge, and hospitality business families along the Zambezi.',
      'Safari, guiding, and conservation staff families living outside town.',
      'Cross-border families with ties to Zimbabwe.',
      'Agricultural and agribusiness families across the Southern Province.',
      'Students aiming at universities in Zambia, South Africa, or overseas.',
    ],
    nearbyAreas: ['Livingstone', 'the Victoria Falls area', 'Kazungula', 'Choma', 'Mazabuka', 'Monze', 'the Zimbabwean border'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Geography, Business Studies, Travel and Tourism-track subjects',
      'Cambridge A-Level Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Geography, Economics, Business',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), South African universities, and Zambian institutions',
    ],
    whyChoose: [
      ['The complete option where no campus exists', 'Identical live delivery from Livingstone to Choma — the Cambridge pathway the south never had.'],
      ['Built for the season', 'Live classes plus a complete recorded library hold the academic year through the high season, when the whole family works.'],
      ['Biology and environmental science that fit the place', 'A national park, a river system, and a conservation economy make unusually good context for Cambridge Biology, Geography, and AP Environmental Science.'],
      ['Reaches families outside town', 'Lodge and conservation staff living well outside Livingstone get the same teaching as anyone in the capital.'],
      ['One hour from our teaching base', 'Livingstone is one hour behind Nairobi EAT.'],
    ],
    growingReason: 'Livingstone is Zambia\'s tourism capital — Victoria Falls, the Zambezi lodges, rafting and safari operations, and an international airport — with a year-round community of operators and conservation staff, and no international schooling anywhere in the region. Livingstone shares CAT (UTC+2), one hour behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Southern Province. Examination sittings planned per session with travel scheduled around the season.',
      cbc: 'Kenya CBC available for Southern Province families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national position applies in the south: education is governed by the Education Act, 2011, and we are not aware of an established statutory parental home-education route under it — worth confirming with the Ministry of Education. Structured education alongside a school enrolment is unrestricted and is our default, with the recorded library carrying the tourism season. Families with ties across the Zimbabwean border should note that education law follows residence rather than where a business operates.',
    homeTuitionDetail: 'In-person tuition supplementation in the Southern Province is subject to associate availability; the live online programme is complete without it.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing inside the local school day on the one-hour offset, with the full recorded library carrying the high season.',
    faqs: [
      { q: 'We run a lodge through the high season — can schooling fit that?', a: 'It is built for it: live classes with a complete recorded library, so the academic year holds together through the busiest months, with enrolment any week of the year.' },
      { q: 'Is there a Cambridge school in Livingstone?', a: 'No international provision in the region, with Lusaka around five hours away. Live online delivery is the complete option for the south.' },
      { q: 'Where do Southern Province students sit examinations?', a: 'At authorised centres confirmed per family per session, with travel planned into exam windows ahead of the season.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const ZAMBIA_COUNTRY = {
  slug: 'zambia',
  name: 'Zambia',
  longName: 'Republic of Zambia',
  adjective: 'Zambian',
  flag: '🇿🇲',
  hub: '/online-school/zambia',
  hubPageId: 'homeschooling-zambia',
  cityPageId: 'zambia-city',

  currency: 'ZMW',
  currencyName: 'Zambian Kwacha',
  currencyPeg: 'Approximate ZMW conversion at prevailing rates (final invoicing in USD, which many Zambian families already use for school fees).',

  timezone: {
    code: 'CAT',
    name: 'Central Africa Time (UTC+2), no daylight saving',
    utcOffset: '+2',
    offsetFromEAT: '-1 hour — the closest alignment in Smartious coverage',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Lusaka checked first, with established in-country provision through British Council and school centres'],
  examCentreTiles: [
    { city: 'Lusaka', centre: 'Established provision', area: 'Cambridge examination provision is long established in Zambia, confirmed per family per session.' },
    { city: 'The Copperbelt', centre: 'Regional options', area: 'Kitwe and Ndola provision checked per session, with Lusaka travel planned where needed.' },
    { city: 'The Southern Province', centre: 'Planned per session', area: 'Livingstone families plan travel into each series around the tourism season.' },
  ],
  examLogisticsProse: 'Examinations are simpler in Zambia than in most countries we serve, and it is worth saying why. Cambridge qualifications are long established across Zambian private and international schools, so authorised provision exists in-country rather than having to be assembled — Lusaka is checked first, with Copperbelt options confirmed per session and Southern Province families planning travel into each series. Students sit as external candidates where they are not enrolled at a centre school, and capacity is confirmed per family per session. Note what does not apply here: there is no parallel national examination in a second language to plan around, of the kind our European families carry. A Zambian student in the supplementary configuration sits their school\'s assessments and the Cambridge series, both in English, against curricula that overlap heavily in mathematics and the sciences.',
  secondaryProgrammeExamRef: 'Established Zambian Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/zambia.jpg',
  heroEyebrow: 'Online Cambridge school for Zambia',
  heroH1Suffix: 'Zambia',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for mining, professional, expatriate, and Zambian families across Lusaka, the Copperbelt, and Livingstone. The same Cambridge pathway Zambian private schools already run — taught live in groups of four to six, in English, one hour from our teaching base, at a fraction of local international-school fees.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — with no second language curriculum to carry and the closest timezone alignment in our coverage.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Zambia',

  citiesSectionTitle: 'Where our Zambia families are',
  citiesSectionBody: 'Smartious Zambia families concentrate across Lusaka (the corporate, diplomatic and NGO centre, holding the country\'s international-school tier at rising fees), Kitwe and the Copperbelt (the copper economy and its internationally recruited mining and engineering workforce, with far thinner provision), and Livingstone and the Southern Province (Victoria Falls tourism, conservation, and agriculture, with none at all). One familiar qualification, three very different schooling situations.',

  trustSignals: [
    { h: 'Two operational teaching centres', p: 'Live teaching to Zambia families is delivered from two international-standard operational centres established 2022 and 2023, in Nairobi.' },
    { h: 'The closest timezone in our coverage', p: 'Zambia runs CAT (UTC+2) — one hour behind Nairobi EAT, with no daylight saving on either side. Live classes land squarely in the Zambian school day and afternoon, every month of the year.' },
    { h: 'No second curriculum to carry', p: 'Teaching in Zambia is in English, so adding Cambridge subjects means adding subjects — not the dual-language burden families across much of Europe carry alongside a national examination in another language.' },
    { h: 'The framework stated carefully', p: 'Education is governed by the Education Act, 2011. Our research did not surface an explicit statutory parental home-education route, so we say we are not aware of one and point families to the Ministry of Education — rather than asserting either a prohibition or an availability we cannot evidence.' },
  ],

  universitiesInCountry: 'The University of Zambia, the Copperbelt University at Kitwe, Mulungushi University, Levy Mwanawasa Medical University, and a substantial private sector including the University of Lusaka and Cavendish University Zambia — all teaching in English.',
  universityChannels: 'Zambian universities admit students on Cambridge qualifications routinely, with entry requirements confirmed per programme — Cambridge is not a foreign qualification here but a familiar one, long used by Zambian private and international schools alongside the national School Certificate. Regionally, South African universities assess Cambridge A-Levels routinely and are a common destination for Zambian students, as are institutions in Zimbabwe, Botswana, and Namibia. Internationally, A-Levels are read natively by UK universities via UCAS and accepted in 160+ countries, and the Common Application serves US plans. Smartious provides personalised university guidance across Zambian, regional Southern African, UK (UCAS), and US destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Zambia families. Cambridge IGCSE (Years 10-11) and Cambridge A-Level (Years 12-13) delivered as live online classes landing inside the Zambian school day on the one-hour offset — run supplementary alongside a school enrolment, or as the full pathway. Examinations at authorised in-country provision confirmed per session. This is the qualification Zambian private schools already teach: our contribution is reaching the families their fees exclude and the subjects their timetables cannot staff.',
  britishCurriculumSuits: 'Zambia families targeting the Cambridge pathway. Best fit for: (1) professional families priced out of Lusaka\'s rising Cambridge and international school fees, (2) mining and engineering families across the Copperbelt where provision is thin, (3) tourism, conservation, and agricultural families in the Southern Province and the regions, (4) students needing a specialist A-Level their school cannot staff, (5) families relocating within the region who need curriculum continuity.',
  britishCurriculumDelivery: 'Live online classes landing inside the Zambian school day on the one-hour offset, small groups 4-6 students. Cambridge examinations at authorised in-country provision, confirmed per session.',
  ibDiplomaSuits: 'Zambia families targeting the IB Diploma\'s breadth — support alongside Lusaka\'s campus IB provision.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Zambia families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in 2019 in Nairobi to make international qualifications accessible to African and internationally mobile families at online-delivery fees. Zambia sits closer to that mission than almost anywhere we serve: same region, same language of instruction, one hour of time difference, and a Cambridge tradition already in place. Zambia families join students in 50 other countries.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the Copperbelt\'s mining and metallurgy families and every medicine- or engineering-bound student in the country. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Zambia\'s Cambridge tier is real and, in Lusaka, genuinely good — the American International School of Lusaka, the International School of Lusaka, Baobab College, and the Cambridge-offering private schools do work we are not trying to replicate. The problem is reach and price: fees have risen sharply, the strongest entry points fill, and outside the capital the provision thins to very little. That is the space we occupy — the same qualification, delivered live, to the families and regions the campuses do not reach.',
  competitors: [
    { name: 'American International School of Lusaka',        city: 'Lusaka',                curriculum: 'American + IB',                         feesUsd: 'Premium tier',                                      feesAed: 'Varies by grade',         rating: 4.5, capacityNote: 'The diplomatic-community school' },
    { name: 'International School of Lusaka',                 city: 'Lusaka',                curriculum: 'IB continuum',                          feesUsd: 'Premium tier',                                      feesAed: 'Varies',                  rating: 4.4, capacityNote: 'Long-established international campus' },
    { name: 'Baobab College and the Cambridge private tier',  city: 'Lusaka',                curriculum: 'Cambridge IGCSE + A-Level',             feesUsd: 'Upper-mid to premium',                              feesAed: 'Varies',                  rating: 4.3, capacityNote: 'The closest local comparison to our track — strong, and oversubscribed' },
    { name: 'The Copperbelt',                                 city: 'Kitwe, Ndola, Solwezi', curriculum: 'Thin Cambridge provision',              feesUsd: 'Limited',                                           feesAed: '—',                       rating: 0,   capacityNote: 'A mining economy staffed from four continents, barely served' },
    { name: 'The Southern Province',                          city: 'Livingstone and beyond', curriculum: '—',                                    feesUsd: 'No international provision',                        feesAed: '—',                       rating: 0,   capacityNote: 'Tourism, conservation and agriculture — nothing' },
    { name: 'Boarding in South Africa or the UK',             city: 'Abroad',                curriculum: 'Cambridge / national systems',          feesUsd: 'Far above local fees, plus travel',                 feesAed: 'Plus separation',         rating: 4.4, capacityNote: 'The traditional answer for regional families — expensive, and it sends the child away' },
    { name: 'Smartious Homeschool (Zambia via online delivery)', city: 'Delivered to all Zambia', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'ZMW equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + the same Cambridge qualification + one-hour timezone + the Copperbelt and the south served identically' },
  ],

  legalFrameworkIntro: 'Zambia\'s framework is straightforward to describe, and there is one part of it we will describe carefully rather than confidently. Here it is exactly.',
  legalFramework: [
    { h: 'The governing statute', p: 'Education in Zambia is regulated by the Education Act, 2011 (No. 23 of 2011), which provides for the regulation of educational provision, the establishment and registration of educational institutions — public, private, aided, and community — and for curriculum, assessment, and certification, alongside learners\' rights and responsibilities. National examinations run through the Examinations Council of Zambia. The structure runs basic education across grades 1 to 9, then high school education covering grades 10 to 12 over three years.' },
    { h: 'Home education: what we can and cannot say', p: 'Our research of the Education Act, 2011 did not surface an explicit statutory parental home-education route, and we are going to be careful with that finding rather than confident. We are not aware of an established route; we will not assert a flat prohibition, because that is more than the statute text supports; and we will certainly not imply availability, because a family who acts on that and finds otherwise pays for it. A family considering home education in Zambia should confirm the current position with the Ministry of Education directly. What is not in doubt is that structured education alongside a school enrolment is unrestricted, which is the configuration we build.' },
    { h: 'Why Cambridge is not a foreign qualification here', p: 'This distinguishes Zambia from most of our coverage. Cambridge IGCSE and A-Level are long established in Zambian private and international schools, sitting alongside the national School Certificate route, and examination provision exists in-country rather than needing to be assembled. So we are not importing something unfamiliar and asking families to trust it — we are extending access to a pathway Zambian schools, universities, and employers already recognise. That changes the conversation from "will this be accepted?" to "can we reach it?", which is a much better question to be answering.' },
    { h: 'Two structural advantages worth stating plainly', p: 'First, language. Teaching in Zambia is in English, so a student adding Cambridge subjects is adding subjects. Across much of our European coverage, families in the equivalent position carry a second full curriculum in a second language toward a national examination — the single most underestimated cost in home education there. It simply does not apply in Zambia. Second, time. Zambia runs CAT at UTC+2 with no daylight saving, one hour behind our Nairobi teaching base, which is the closest alignment anywhere in our coverage. Live classes land in the Zambian afternoon every month of the year, never late at night and never at dawn.' },
    { h: 'What that leaves: the configurations that work', p: 'For most Zambian families the arrangement is supplementary and needs nothing from anyone: the child stays enrolled, the school carries the routine and whatever obligation applies, and live Cambridge subjects run alongside in the after-school slot — commonly Mathematics, the sciences, and a specialist A-Level the school cannot staff. For families already outside the school system, or in regions where provision is genuinely absent, the same live teaching runs as a fuller programme, with the position confirmed with the Ministry rather than assumed. Either way the examined output is identical: Cambridge IGCSEs and A-Levels sat at authorised in-country provision.' },
    { h: 'Where the qualifications lead', p: 'Zambian universities admit students on Cambridge qualifications routinely with requirements confirmed per programme, since the qualification is already familiar in the system. Regionally, South African universities are a common destination for Zambian students and assess A-Levels routinely, as do institutions in Zimbabwe, Botswana, and Namibia. Internationally, UCAS reads A-Levels natively, the Common Application serves US plans, and A-Levels are accepted in 160+ countries. For a family weighing boarding abroad against staying together, the relevant point is that the qualification is the same either way — only the cost and the separation differ.' },
  ],

  whySmartious: [
    { h: 'The same Cambridge qualification, reachable',                     p: 'The pathway Lusaka\'s private schools already run — live, in groups of 4-6, at USD 2,160-6,480 a year.' },
    { h: 'No second language curriculum to carry',                          p: 'Teaching here is in English. Adding Cambridge means adding subjects, not a parallel national examination in another language.' },
    { h: 'The closest timezone in our coverage',                            p: 'One hour behind Nairobi EAT, no daylight saving either side — classes land in the Zambian afternoon all year.' },
    { h: 'The alternative to boarding',                                     p: 'Copperbelt and Southern Province families have historically sent children to Lusaka or South Africa. The same qualification now reaches them at home.' },
    { h: 'The subjects a small cohort cannot justify',                      p: 'Further Mathematics, Computer Science, and specialist sciences taught properly in a group of five rather than dropped from a regional timetable.' },
    { h: 'The framework stated carefully',                                  p: 'We are not aware of an established statutory home-education route and we say exactly that, pointing families to the Ministry rather than overclaiming in either direction.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Zambia?', a: 'Education is governed by the Education Act, 2011, and our research of that Act did not surface an explicit statutory parental home-education route. We are not aware of an established route, and a family considering one should confirm the current position with the Ministry of Education. What is unrestricted is structured study alongside a school enrolment — the configuration we build.' },
    { q: 'Is Cambridge recognised in Zambia?', a: 'Thoroughly. Cambridge IGCSE and A-Level are long established in Zambian private and international schools alongside the national School Certificate, examination provision exists in-country, and Zambian universities admit on Cambridge qualifications routinely with requirements confirmed per programme.' },
    { q: 'How do your fees compare with Lusaka schools?', a: 'Smartious runs USD 2,160-6,480 a year for live small-group teaching through to A-Level. Lusaka\'s international and Cambridge private schools sit well above that and have risen sharply. We are not replicating a campus — we are making the qualification reachable.' },
    { q: 'Can our child take only one or two subjects with you?', a: 'Yes, and on the Copperbelt and in the regions it is the most common arrangement: the child stays at their school and takes Further Mathematics, Computer Science, or a science with us live because the local timetable cannot staff it for a handful of pupils.' },
    { q: 'How does the timezone work?', a: 'Zambia runs CAT at UTC+2, one hour behind our Nairobi teaching base, with no daylight saving on either side. It is the closest alignment in our entire coverage — live classes land in the Zambian afternoon every month of the year.' },
    { q: 'Do we have to carry a second curriculum in another language?', a: 'No — and that is worth noting, because families across much of Europe do. Teaching in Zambia is in English, so the Cambridge track and the national curriculum overlap heavily in mathematics and the sciences and share a language throughout.' },
    { q: 'Where do Zambian students sit Cambridge examinations?', a: 'At authorised in-country provision confirmed per family per session — Lusaka checked first, with Copperbelt options per session and Southern Province families planning travel into each series.' },
    { q: 'Is this an alternative to boarding in South Africa or the UK?', a: 'For many families, yes. The qualification is the same, the teaching is live and in small groups, the cost is a fraction, and the child stays at home. What boarding offers that we do not is the campus experience itself, and families weigh that differently.' },
    { q: 'Which parts of Zambia does Smartious cover?', a: 'Lusaka, Kitwe and the Copperbelt, and Livingstone and the Southern Province have dedicated pages with local context. Live online delivery works identically anywhere in the country — which on the Copperbelt and in the south is precisely the point.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us whether you want the full programme or one or two subjects alongside your child\'s current school: in Zambia both are common, and they are different plans.',
}
