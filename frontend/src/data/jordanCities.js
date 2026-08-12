// ═══════════════════════════════════════════════════════════════════
// JORDAN — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for development-sector, corporate, industrial and
// Jordanian families across Amman, Aqaba, Irbid, Zarqa and the
// Jordan Valley.
// SECOND MIDDLE EAST BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// *** TIMEZONE — THE HEADLINE. READ FIRST ***
// Jordan runs UTC+3 YEAR-ROUND following the end of seasonal clock
// changes. Our teaching base runs UTC+3 year-round. That is a ZERO
// OFFSET — Jordan is the FIRST COUNTRY IN OUR ENTIRE COVERAGE that
// is on exactly our clock, all year, with no seasonal drift at all.
// Israel is one hour off in winter; Jordan is never off. Every hour
// of our teaching day is available, permanently. LEAD WITH THIS on
// every page — it is a genuine and unmatched operational advantage.
//
// LEGAL POSITIONING NOTE — HEDGE FIRMLY, SOURCING IS THIN:
// - We could NOT verify Jordan's position on parental home education
//   against a primary instrument.
// - What we can state: education is administered by the MINISTRY OF
//   EDUCATION (وزارة التربية والتعليم), whose mandate is to ensure
//   the provision of quality education from the early years through
//   secondary education; basic education is compulsory; private
//   schools operate with Ministry licensing.
// - State the compulsory range GENERALLY (basic education, commonly
//   described as ten years). Do NOT quote ages we have not verified.
//   Route families to the Ministry.
// - PHRASE EVERY TIME: "we are not aware of a specific framework",
//   "we could not verify", plus "confirm with the Ministry of
//   Education". NEVER assert permitted, NEVER assert prohibited.
// - Reuse the Panama/Guatemala/Venezuela argument: an absence of
//   regulation is an absence of protection rather than a permission.
// - Smartious is NOT a Ministry-licensed Jordanian school; say so.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT.
// - The national qualification is the TAWJIHI (General Secondary
//   Education Certificate Examination). We do NOT teach toward it
//   and say so. Many Jordanian private schools offer IGCSE/IB/SAT
//   alongside, so families here already understand the distinction.
//
// CURRENCY NOTE: the Jordanian dinar is pegged to the US dollar at a
// long-standing fixed rate. That makes USD-quoted fees unusually
// predictable in local terms — a real planning advantage, and one of
// only a handful of markets in our coverage where a family faces
// effectively no exchange-rate risk on a multi-year commitment.
// State it factually.
//
// MARKET NOTE: Amman has one of the deepest international school
// tiers in the Levant — the Amman Baccalaureate School, the
// International Academy Amman, King's Academy, the American
// Community School, the Ahliyyah and Bishop's schools, the Modern
// American and Modern Montessori schools — with substantial IB and
// IGCSE provision and fees at the top of the regional market.
// Jordan hosts one of the largest concentrations of UN agencies,
// international NGOs and development organisations anywhere in the
// region, which produces a constantly rotating professional
// community. Aqaba is the sole port, a special economic zone and a
// diving and tourism centre on the Red Sea. Irbid is the northern
// university city (Yarmouk, Jordan University of Science and
// Technology). Zarqa carries the refinery and the industrial belt.
// The Jordan Valley and Dead Sea hold potash, bromine and mineral
// processing plus intensive agriculture and resort development.
// ═══════════════════════════════════════════════════════════════════

export const JORDAN_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'amman-jo',
    name: 'Amman',
    county: 'Amman Governorate',
    region: 'The capital and regional headquarters city · one of the largest concentrations of UN agencies and international NGOs anywhere in the region · a deep international school tier at premium fees · a constantly rotating professional community',
    primaryKeyword: 'Online school and international curriculum in Amman',
    heroTagline: 'For Amman families — Cambridge and IB taught live on exactly your clock, at any hour of the day that suits you.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Amman families. The capital is a regional headquarters city — home to one of the largest concentrations of UN agencies, international NGOs and development organisations anywhere in the region, alongside a corporate and professional sector and a deep international school tier priced at the top of the regional market. It is also, uniquely in our coverage, on exactly our clock: Jordan runs UTC+3 year-round and so do we, so every hour of our teaching day is available to an Amman family, permanently and with no seasonal drift.',
    heroImg: '/heroes/amman-jo.jpg',
    altTexts: { hero: 'Amman' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Amman families — taught on exactly your clock, at any hour. From USD 400/month.',
    challenges: [
      'International school fees in Amman sit at the top of the regional market with competitive places.',
      'Development and diplomatic postings arrive and depart on programme timelines rather than admission cycles.',
      'Basic education is compulsory and administered by the Ministry of Education.',
      'We could not verify Jordan\'s position on parental home education from a primary instrument.',
      'Time zone: none. Jordan runs UTC+3 year-round and so does our teaching base — a zero offset, all year.',
    ],
    familySituations: [
      'UN agency, international NGO and development-sector families on rotation.',
      'Diplomatic and international-organisation households.',
      'Corporate and professional families outside the international tier\'s fees.',
      'Students needing a subject their school cannot staff for a small group.',
      'Families whose children will apply to UK, US, Canadian, Gulf or Jordanian universities.',
      'Households arriving mid-curriculum from another country\'s system.',
    ],
    nearbyAreas: ['Abdoun', 'Deir Ghbar', 'Dabouq', 'Khalda', 'Sweifieh', 'Madaba', 'Salt'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Gulf and Jordanian university applications',
    ],
    whyChoose: [
      ['Exactly your clock, all year', 'Jordan runs UTC+3 year-round and so do we. There is no offset at all and no seasonal drift — the first country in our coverage where that is true. Any hour of our teaching day works.'],
      ['Built for a rotating sector', 'Development and diplomatic postings move. The curriculum, teachers, and examination board continue unchanged to the next country — which is why our development-sector families often re-enrol from a new posting.'],
      ['A fee gap against a premium tier', 'Live small-group teaching at USD 2,160-6,480 a year against Amman international fees at the top of the regional market.'],
      ['Fees that behave predictably', 'The dinar is pegged to the dollar at a long-standing fixed rate, so USD-quoted fees carry effectively no exchange-rate risk over a multi-year commitment.'],
      ['Arabic kept as an examined subject', 'Cambridge Arabic runs alongside the English-medium core rather than being traded away.'],
    ],
    growingReason: 'Amman is a regional headquarters city hosting one of the largest concentrations of UN agencies, international NGOs and development organisations in the region, alongside a deep international school tier at premium fees and a constantly rotating professional community. Jordan runs UTC+3 year-round — exactly our teaching clock, with no offset at all.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Amman families, taught alongside a Jordanian school enrolment at whatever hour suits. Examinations at authorised centres confirmed per family per session; Jordan has well-established Cambridge provision.',
      cbc: 'Kenya CBC available for Amman families with East African ties — a common profile in the development community.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the capital\'s substantial IB sector.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Jordanian education is administered by the Ministry of Education, whose mandate is to ensure the provision of quality education from the early years through secondary education, and basic education is compulsory — commonly described as ten years, with families advised to confirm the current boundaries with the Ministry rather than take them from a provider\'s article. Private schools operate with Ministry licensing, and Smartious does not hold it: we do not operate premises in Jordan, claim no Jordanian recognition, and issue no Jordanian qualification. On parental home education we are going to be careful, because we could not verify Jordan\'s position against a primary instrument. We will not tell you it is permitted and we will not tell you it is prohibited; both would exceed what we can evidence, and a family that plans a school year on an overconfident claim carries the cost of it rather than we do. What we would add is the point we make in Panama, Guatemala and Venezuela: an absence of clear regulation is an absence of protection rather than a permission, because where a matter is unaddressed there is nothing for a family to demonstrate if the question is raised. Put it to the Ministry of Education directly and keep the answer. One further clarification specific to Jordan: the national qualification is the Tawjihi, and we do not teach toward it. Many Jordanian private schools already offer IGCSE, the IB and SAT alongside the national route, so families here generally understand the distinction better than in most markets — our track sits in that same category, alongside the Jordanian record rather than replacing it.',
    homeTuitionDetail: 'Smartious delivers to Amman families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Jordan runs UTC+3 year-round and our teaching base runs UTC+3 year-round, so there is no offset whatsoever and nothing drifts seasonally — an Amman family can take a class at any hour of our teaching day, at the same time every week of the year, with every session recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Jordan?', a: 'We could not verify a position from a primary Jordanian instrument and will not guess. Basic education is compulsory and administered by the Ministry of Education. An absence of clear regulation is not a permission — put the question to the Ministry directly. Structured study alongside a school enrolment raises none of it, and that is what we offer.' },
      { q: 'Do you teach the Tawjihi?', a: 'No. We are not a Ministry-licensed Jordanian school and issue no Jordanian qualification. We teach Cambridge, Pearson Edexcel, IB and AP examinations, which sit alongside the Jordanian record — a distinction most Amman families already understand, since many private schools here run IGCSE and the IB alongside the national route.' },
      { q: 'What time are classes?', a: 'Whenever suits you. Jordan runs UTC+3 year-round and so does our teaching base — a zero offset with no seasonal drift. Jordan is the first country in our entire coverage where that is true, so the whole teaching day is genuinely open.' },
      { q: 'We are on a development posting — does the schooling follow?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next country. It is the most common reason development families come to us, and many re-enrol from a new posting rather than starting over.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'aqaba-jo',
    name: 'Aqaba',
    county: 'Aqaba Governorate',
    region: 'Jordan\'s sole port and its special economic zone · a Red Sea diving and tourism economy of international standing · logistics and shipping · four hours south of Amman\'s school tier',
    primaryKeyword: 'Online school and international curriculum in Aqaba',
    heroTagline: 'For Aqaba families — the country\'s only port and its economic zone, four hours from the capital\'s schools.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Aqaba families. The Red Sea city is Jordan\'s sole port, a special economic zone with its own investment and logistics regime, and a diving and tourism economy that draws visitors and operators from across Europe and the Gulf. It is a genuinely international working community, and Amman\'s school tier is four hours north. Live delivery reaches Aqaba identically — and because Jordan sits on exactly our teaching clock, a family here can take classes at whatever hour their week allows.',
    heroImg: '/heroes/aqaba-jo.jpg',
    altTexts: { hero: 'Aqaba and the Red Sea' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Aqaba families — the port and economic zone, four hours from Amman. From USD 400/month.',
    challenges: [
      'International schooling is concentrated in Amman, four hours north.',
      'A port, logistics and tourism economy with an internationally mobile workforce.',
      'Seasonal tourism patterns that shape household schedules.',
      'We could not verify Jordan\'s position on parental home education.',
      'Time zone: none — Jordan and our teaching base both run UTC+3 year-round.',
    ],
    familySituations: [
      'Port, shipping, and logistics families.',
      'Special economic zone investment and management households.',
      'Diving, tourism, and hospitality business families.',
      'Families weighing relocation to Amman for schooling.',
      'Students aiming at marine science, logistics or engineering programmes abroad.',
    ],
    nearbyAreas: ['Aqaba', 'Tala Bay', 'Wadi Rum', 'Ma\'an', 'Wadi Musa and Petra', 'the Red Sea coast', 'the southern desert highway'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic and home language support',
      'Cambridge A-Level Biology, Geography, Mathematics, Economics, Business',
      'Cambridge A-Level Chemistry, Physics, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Gulf and Jordanian university applications',
    ],
    whyChoose: [
      ['The complete option four hours from the tier', 'Identical live delivery in Aqaba and Amman — no relocation and no boarding decision.'],
      ['Marine and environmental science that fit the place', 'The Red Sea reef and the Rum desert make unusually serious ground for Cambridge Biology and Geography and AP Environmental Science.'],
      ['Business and economics for a port and zone economy', 'Cambridge A-Level Economics, Business and Mathematics suit the families who run Jordan\'s trade gateway.'],
      ['Exactly your clock, all year', 'Zero offset with no seasonal drift, so the timetable fits around a working household rather than the other way round.'],
      ['Fees that behave predictably', 'The dinar\'s dollar peg means USD-quoted fees carry effectively no exchange-rate risk.'],
    ],
    growingReason: 'Aqaba is Jordan\'s sole port, a special economic zone with its own investment regime, and a Red Sea diving and tourism economy of international standing — a genuinely international working community four hours south of Amman\'s school tier. Jordan runs UTC+3 year-round, exactly our teaching clock.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Aqaba, taught alongside a Jordanian school enrolment. Examination travel to Amman planned per session well ahead.',
      cbc: 'Kenya CBC available for Aqaba families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Aqaba: basic education is compulsory and administered by the Ministry of Education, private schools operate with Ministry licensing, and we could not verify Jordan\'s position on parental home education against a primary instrument. We decline to characterise it as either permission or prohibition, and would send any family whose plan depends on it to the Ministry directly. Smartious is not a Ministry-licensed Jordanian school, issues no Jordanian qualification and does not teach toward the Tawjihi — our arrangement is live international teaching alongside a Jordanian school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Aqaba families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on exactly Jordan\'s clock with no offset at all, and every session recorded — which suits a tourism economy with seasonal peaks.',
    faqs: [
      { q: 'Is there international schooling in Aqaba?', a: 'Provision is concentrated in Amman, four hours north. Live delivery reaches Aqaba identically, with examination travel planned into each window well ahead.' },
      { q: 'Our family works the diving and tourism season — can schooling fit?', a: 'It is built for it: live classes at whatever hour suits plus a complete recorded library, so the academic year holds through the busiest months.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'irbid-jo',
    name: 'Irbid & the North',
    county: 'Irbid Governorate',
    region: 'Jordan\'s university city — Yarmouk University and the Jordan University of Science and Technology · a major medical and engineering academic sector · one of the youngest populations in the country · thin international provision',
    primaryKeyword: 'Online school and international curriculum in Irbid',
    heroTagline: 'For Irbid and northern families — a university city with medical and engineering ambitions, and almost no international schooling.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Irbid and northern Jordanian families. Irbid is the country\'s university city — Yarmouk University and the Jordan University of Science and Technology between them give the north a medical and engineering academic culture that few regional cities match, and one of the youngest populations in Jordan. Academic ambition here is high and international schooling is thin, with the tier concentrated in Amman an hour and a half south. We teach Cambridge and IB live across the north, at whatever hour suits.',
    heroImg: '/heroes/irbid-jo.jpg',
    altTexts: { hero: 'Irbid and northern Jordan' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Irbid and northern Jordan families — a university city with thin international provision. From USD 400/month.',
    challenges: [
      'Thin international provision in a city with a strong academic culture.',
      'Amman\'s tier is an hour and a half south.',
      'Medical and engineering ambitions requiring specific A-Level subject sets.',
      'We could not verify Jordan\'s position on parental home education.',
      'Time zone: none — Jordan and our teaching base both run UTC+3 year-round.',
    ],
    familySituations: [
      'University academic, medical-faculty and research families.',
      'Engineering and science-sector households.',
      'Professional families across the northern governorates.',
      'Students aiming at medicine, dentistry, pharmacy or engineering.',
      'Families whose children will apply to Gulf, UK or North American universities.',
    ],
    nearbyAreas: ['Irbid', 'Ramtha', 'Ajloun', 'Jerash', 'Mafraq', 'Um Qais', 'the northern governorates'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Physics, Further Mathematics',
      'Cambridge A-Level Economics, Business, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Chemistry, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Gulf, Canadian and Jordanian university applications',
    ],
    whyChoose: [
      ['Pre-medical depth for a medical university city', 'Cambridge A-Level Biology and Chemistry with Mathematics — the classic spine, and one Irbid families aim at in numbers given the city\'s medical faculties.'],
      ['Engineering depth alongside', 'Cambridge A-Level Mathematics, Further Mathematics and Physics — led by a founder with a BEd in Mathematics and Physics.'],
      ['The complete option outside the capital', 'Identical live delivery in Irbid and Amman, without relocating.'],
      ['Exactly your clock, all year', 'Zero offset with no seasonal drift — an academic household can build the week it wants.'],
      ['Arabic kept as an examined subject', 'Cambridge Arabic runs alongside the English-medium core.'],
    ],
    growingReason: 'Irbid is Jordan\'s university city — Yarmouk University and the Jordan University of Science and Technology give the north a medical and engineering academic culture few regional cities match, alongside one of the youngest populations in the country — with thin international provision and the tier concentrated in Amman. Jordan runs UTC+3 year-round, exactly our teaching clock.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the north, taught alongside a Jordanian school enrolment.',
      cbc: 'Kenya CBC available for northern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the north: basic education is compulsory and administered by the Ministry of Education, private schools operate with Ministry licensing, and we could not verify Jordan\'s position on parental home education against a primary instrument — a silence we decline to read in either direction. Confirm with the Ministry directly. Smartious is not a Ministry-licensed Jordanian school, issues no Jordanian qualification and does not teach toward the Tawjihi. Our arrangement is live international teaching alongside a Jordanian school enrolment, which for an academically ambitious household is usually the configuration they wanted anyway.',
    homeTuitionDetail: 'Smartious delivers to northern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on exactly Jordan\'s clock with no offset at all, and every session recorded.',
    faqs: [
      { q: 'Our child is aiming at medicine — what should they take?', a: 'Cambridge A-Level Biology and Chemistry with Mathematics form the classic spine, planned backward from the target university from IGCSE onward. It is the most common request we receive from this city.' },
      { q: 'Is there international schooling in Irbid?', a: 'Thin, with the tier concentrated in Amman an hour and a half south. Live delivery reaches the whole north identically.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'zarqa-jo',
    name: 'Zarqa & the Industrial Belt',
    county: 'Zarqa Governorate',
    region: 'Jordan\'s industrial capital — the refinery, chemicals and manufacturing · free zones and heavy industry · the second-largest population centre · almost no international provision',
    primaryKeyword: 'Online school and international curriculum in Zarqa',
    heroTagline: 'For Zarqa and industrial-belt families — the refinery and manufacturing heartland, half an hour from Amman and a world from its schools.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Zarqa and industrial-belt families. Zarqa carries Jordan\'s industrial economy — the refinery, chemicals, manufacturing and the free zones around them — and is one of the country\'s largest population centres, yet its international provision is close to non-existent. Amman is half an hour away and its school tier is priced for a different market. For engineering and technical households here, the answer is not relocation but live delivery, on a clock that has no offset at all.',
    heroImg: '/heroes/zarqa-jo.jpg',
    altTexts: { hero: 'The Jordanian industrial belt' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Zarqa and industrial-belt families — refinery and manufacturing heartland. From USD 400/month.',
    challenges: [
      'Almost no international provision in one of Jordan\'s largest population centres.',
      'Amman\'s tier is close by but priced for a different market.',
      'Technical and engineering households wanting specific A-Level subject sets.',
      'We could not verify Jordan\'s position on parental home education.',
      'Time zone: none — Jordan and our teaching base both run UTC+3 year-round.',
    ],
    familySituations: [
      'Refinery, chemicals and process engineering families.',
      'Manufacturing and free-zone business households.',
      'Logistics and industrial-services families.',
      'Professional households priced out of the Amman tier.',
      'Students aiming at chemical, mechanical or industrial engineering.',
    ],
    nearbyAreas: ['Zarqa', 'Russeifa', 'Hashemiyya', 'Dhulail', 'Azraq', 'the free zones', 'east Amman'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic and home language support',
      'Cambridge A-Level Chemistry, Physics, Mathematics, Further Mathematics, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Chemistry, AP Physics, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Gulf, Canadian and Jordanian university applications',
    ],
    whyChoose: [
      ['Chemistry and process engineering depth', 'Cambridge A-Level Chemistry, Physics and Mathematics suit a refinery and chemicals belt precisely.'],
      ['A fee gap that matters here more than most', 'Amman is thirty minutes away and its international fees are set for a different market. Live small-group teaching at USD 2,160-6,480 a year is reachable.'],
      ['Exactly your clock, all year', 'Zero offset with no seasonal drift, so classes fit around industrial shift patterns rather than fighting them.'],
      ['Every session recorded', 'A missed class on a shift week is never a lost one.'],
      ['Arabic kept as an examined subject', 'Cambridge Arabic runs alongside the English-medium core.'],
    ],
    growingReason: 'Zarqa carries Jordan\'s industrial economy — refinery, chemicals, manufacturing and free zones — as one of the country\'s largest population centres, with international provision close to non-existent and Amman\'s tier priced for a different market. Jordan runs UTC+3 year-round, exactly our teaching clock.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the industrial belt, taught alongside a Jordanian school enrolment.',
      cbc: 'Kenya CBC available for Zarqa families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Zarqa: basic education is compulsory and administered by the Ministry of Education, private schools operate with Ministry licensing, and we could not verify Jordan\'s position on parental home education against a primary instrument. We decline to read that silence in either direction and would send families to the Ministry. Smartious is not a Ministry-licensed Jordanian school, issues no Jordanian qualification and does not teach toward the Tawjihi — our arrangement is live international teaching alongside a Jordanian school enrolment.',
    homeTuitionDetail: 'Smartious delivers to industrial-belt families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on exactly Jordan\'s clock with no offset at all, and every session recorded — built for shift patterns.',
    faqs: [
      { q: 'Amman is only half an hour away — why not just enrol there?', a: 'Distance is not the constraint here; price is. Amman\'s international fees are set at the top of the regional market. Live small-group teaching toward the same Cambridge examinations is a different proposition financially.' },
      { q: 'Our child wants chemical engineering — what should they take?', a: 'Cambridge A-Level Chemistry, Mathematics and Physics, planned backward from the target university from IGCSE onward.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'dead-sea-jo',
    name: 'The Dead Sea & Jordan Valley',
    county: 'Balqa, Karak and the Jordan Valley',
    region: 'Potash, bromine and mineral processing at industrial scale · intensive irrigated agriculture below sea level · resort and wellness development · dispersed communities far from any school tier',
    primaryKeyword: 'Online school and international curriculum in the Dead Sea and Jordan Valley',
    heroTagline: 'For Dead Sea and Jordan Valley families — mineral processing, agriculture and resorts, spread across a valley with no schools built for it.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Dead Sea and Jordan Valley families. The valley carries an unusual mix: potash, bromine and mineral processing operations of genuine industrial scale, intensive irrigated agriculture in one of the most distinctive growing environments on earth, and a resort and wellness sector along the shore. It is also dispersed — families are spread down a long valley rather than clustered near any town with a school tier. Live delivery reaches all of it, on a clock with no offset at all.',
    heroImg: '/heroes/dead-sea-jo.jpg',
    altTexts: { hero: 'The Dead Sea and Jordan Valley' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Dead Sea and Jordan Valley families — mineral processing, agriculture and resorts. From USD 400/month.',
    challenges: [
      'Dispersed communities down a long valley with no local school tier.',
      'Industrial rosters and agricultural seasons shaping household schedules.',
      'Amman is an hour or more up the escarpment.',
      'We could not verify Jordan\'s position on parental home education.',
      'Time zone: none — Jordan and our teaching base both run UTC+3 year-round.',
    ],
    familySituations: [
      'Potash, bromine and mineral-processing engineering families.',
      'Agricultural and agri-technology households in the valley.',
      'Resort, wellness and hospitality business families.',
      'Water and environmental research staff.',
      'Students aiming at chemical engineering, agronomy or environmental science.',
    ],
    nearbyAreas: ['Sweimeh', 'Safi', 'South Shuneh', 'North Shuneh', 'Karak', 'Deir Alla', 'the valley road'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Arabic and home language support',
      'Cambridge A-Level Chemistry, Biology, Geography, Mathematics, Physics',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Chemistry, AP Biology, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Gulf, Canadian and Jordanian university applications',
    ],
    whyChoose: [
      ['Chemistry depth for a minerals economy', 'Potash and bromine processing is a chemistry problem before it is anything else, and Cambridge A-Level Chemistry with Mathematics is the route into it.'],
      ['Environmental and agricultural science that fit the valley', 'One of the most distinctive growing and hydrological environments on earth makes serious ground for Cambridge Geography and Biology and AP Environmental Science.'],
      ['Reaches a dispersed valley', 'Sweimeh, Safi, Deir Alla and the shore communities all get identical live teaching.'],
      ['Exactly your clock, all year', 'Zero offset with no seasonal drift, and every session recorded for industrial and agricultural schedules.'],
      ['No relocation up the escarpment', 'Amman is an hour or more away and its tier is priced for a different market.'],
    ],
    growingReason: 'The Jordan Valley carries potash, bromine and mineral processing at industrial scale, intensive irrigated agriculture in a distinctive growing environment, and a resort and wellness sector — with families dispersed down a long valley and no local school tier. Jordan runs UTC+3 year-round, exactly our teaching clock.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the valley, taught alongside a Jordanian school enrolment. Examination travel to Amman planned per session well ahead.',
      cbc: 'Kenya CBC available for valley families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the valley: basic education is compulsory and administered by the Ministry of Education, private schools operate with Ministry licensing, and we could not verify Jordan\'s position on parental home education against a primary instrument. Confirm with the Ministry directly. Smartious is not a Ministry-licensed Jordanian school, issues no Jordanian qualification and does not teach toward the Tawjihi. For internationally posted minerals and agri-technology staff who are not resident in Jordan, their country of residence\'s framework applies instead — a question for their own advisers.',
    homeTuitionDetail: 'Smartious delivers to valley families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on exactly Jordan\'s clock with no offset at all, and the full recorded library built for dispersed sites and shift rosters.',
    faqs: [
      { q: 'Is there any schooling option in the valley?', a: 'Not an international one — Amman is an hour or more up the escarpment. Live delivery reaches Sweimeh, Safi, Deir Alla and the shore communities identically.' },
      { q: 'Our child wants chemical engineering or environmental science — what should they take?', a: 'Cambridge A-Level Chemistry and Mathematics with Physics for engineering, or Chemistry and Biology with Geography for environmental routes. Both are planned backward from the target university.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const JORDAN_COUNTRY = {
  slug: 'jordan',
  name: 'Jordan',
  longName: 'Hashemite Kingdom of Jordan',
  adjective: 'Jordanian',
  flag: '🇯🇴',
  hub: '/online-school/jordan',
  hubPageId: 'homeschooling-jordan',
  cityPageId: 'jordan-city',

  currency: 'JOD',
  currencyName: 'Jordanian Dinar',
  currencyPeg: 'The dinar is pegged to the US dollar at a long-standing fixed rate, so our USD-quoted fees carry effectively no exchange-rate risk over a multi-year commitment — one of the more predictable currency positions in our coverage.',

  timezone: {
    code: 'UTC+3',
    name: 'UTC+3 year-round, with no seasonal clock changes',
    utcOffset: '+3',
    offsetFromEAT: 'None. Jordan runs UTC+3 and our teaching base runs UTC+3 — a zero offset, all year, with no seasonal drift',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Jordan has well-established Cambridge and IB provision through its substantial international school sector'],
  examCentreTiles: [
    { city: 'Amman', centre: 'Authorised provision', area: 'The country\'s deepest external-candidate capacity, confirmed per family per session.' },
    { city: 'Irbid and the north', centre: 'Planned per session', area: 'Northern families plan travel into each window ahead.' },
    { city: 'Aqaba and the valley', centre: 'Planned well ahead', area: 'Southern and valley families plan travel to Amman several weeks in advance.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Jordan-based students sit as external candidates at authorised provision, with capacity confirmed per family per session. Jordan is an easier market than most for this: the international school sector has run IGCSE and the IB for decades, so provision and familiarity are both well established, and Amman is checked first with travel planned ahead from Irbid, Aqaba and the valley. The country is compact enough that examination travel is generally a handful of day trips a year. Note what does not change: our arrangement runs alongside a Jordanian school, which continues its own national track unchanged. Smartious is not a Ministry-licensed Jordanian school, issues no Jordanian qualification, and does not teach toward the Tawjihi — what we teach carries Cambridge, Pearson Edexcel, IB or AP validity instead.',
  secondaryProgrammeExamRef: 'Authorised Jordanian Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/jordan.jpg',
  heroEyebrow: 'Online school for Jordan',
  heroH1Suffix: 'Jordan',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for development-sector, corporate, industrial and Jordanian families across Amman, Aqaba, Irbid, Zarqa and the Jordan Valley. Jordan is the first country in our entire coverage on exactly our teaching clock — UTC+3 year-round, both sides, no offset and no seasonal drift — so every hour of our day is genuinely available to you.',
  heroValueProp: 'From USD 180/month, with dinar fees effectively fixed by the dollar peg. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — at any hour that suits.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Jordan',

  citiesSectionTitle: 'Where our Jordan families are',
  citiesSectionBody: 'Smartious Jordan families concentrate across Amman (a regional headquarters city with one of the largest development and NGO communities in the region and a deep international tier), Aqaba (the sole port and special economic zone, four hours south), Irbid and the north (the university city, with medical and engineering ambitions and thin provision), Zarqa and the industrial belt (the refinery and manufacturing heartland, close to Amman and priced out of it), and the Dead Sea and Jordan Valley (minerals, agriculture and resorts spread down a long valley). One compulsory framework, one honest legal hedge, and no timezone at all.',

  trustSignals: [
    { h: 'The only zero-offset market we have', p: 'Jordan runs UTC+3 year-round and our teaching base runs UTC+3 year-round. There is no offset and no seasonal drift — the first country in our entire coverage where that is true. Every hour of our teaching day is available, permanently.' },
    { h: 'Fees that behave predictably', p: 'The dinar is pegged to the dollar at a long-standing fixed rate, so USD-quoted fees carry effectively no exchange-rate risk across a multi-year education commitment.' },
    { h: 'Honest about what we could not verify', p: 'We could not establish Jordan\'s position on parental home education from a primary instrument. Rather than guessing in either direction, we say so, note that an absence of clear regulation is not a permission, and send families to the Ministry of Education.' },
    { h: 'Clear about the Tawjihi', p: 'We do not teach toward the national qualification and are not a Ministry-licensed Jordanian school. Many Jordanian private schools already run IGCSE and the IB alongside the national route, so families here generally understand where our track sits.' },
  ],

  universitiesInCountry: 'the University of Jordan, the Jordan University of Science and Technology, Yarmouk University, the German Jordanian University, Princess Sumaya University for Technology and the American University of Madaba — with several institutions teaching substantially in English.',
  universityChannels: 'Jordanian universities admit principally on the Tawjihi, with holders of international qualifications entering through equivalency procedures administered per institution and confirmed per case — a family intending to enter the Jordanian system should confirm that route early, and note that the Jordanian side of a student\'s record has to come from a Jordanian school rather than from us. Outward, Jordanian and expatriate students here apply in numbers to the United Kingdom, the United States, Canada and the Gulf: UCAS reads Cambridge A-Levels natively, American and Canadian universities read A-Levels, the IB Diploma and AP records directly, and Gulf institutions — many of them branch campuses of British and American universities — read them equally directly. A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across UK (UCAS), US, Canadian, Gulf and Jordanian destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Jordan families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes at whatever hour suits — Jordan and our teaching base both run UTC+3 year-round, so there is no offset and nothing drifts — run alongside a Jordanian school enrolment that continues its own national track unchanged. Cambridge Arabic available beside the English-medium core. Fees quoted in USD, which the dinar peg makes unusually predictable locally.',
  britishCurriculumSuits: 'Jordan families targeting the Cambridge pathway. Best fit for: (1) development, NGO and diplomatic households whose postings rotate, (2) Aqaba, Irbid, Zarqa and valley families where provision is thin or absent, (3) Amman families outside the international tier\'s fees, (4) students aiming at medicine or engineering who need specific A-Level sets, (5) households arriving mid-curriculum from another country\'s system.',
  britishCurriculumDelivery: 'Live online classes at any hour of our teaching day, small groups 4-6 students, every session recorded, alongside a Jordanian school enrolment.',
  ibDiplomaSuits: 'Jordan families in the country\'s substantial IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Jordan families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Jordan is the first country in our ninety-one that shares our clock exactly — same offset, all year, no drift — which makes it the one market where the timetable question simply does not arise.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Zarqa\'s process engineering households, the valley\'s minerals sector and every medicine-bound student in Irbid and Amman. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Amman has one of the deepest international school tiers in the Levant — the Amman Baccalaureate School, the International Academy Amman, King\'s Academy, the American Community School, the Ahliyyah and Bishop\'s schools and the Modern American and Modern Montessori schools among them — with substantial IB and IGCSE provision built over decades. Those are strong institutions and their fees sit at the top of the regional market. Outside Amman the picture thins sharply: Zarqa is one of the country\'s largest population centres with almost nothing, Irbid is a major university city with little, and Aqaba and the valley have none.',
  competitors: [
    { name: 'Amman Baccalaureate School, International Academy Amman', city: 'Amman',          curriculum: 'IB continuum and IGCSE',                feesUsd: 'Top of the regional market',                        feesAed: 'Premium tier',            rating: 4.8, capacityNote: 'Long-established and strong — the national benchmark' },
    { name: 'King\'s Academy and the American Community School',  city: 'Madaba / Amman',      curriculum: 'American, IB and boarding',             feesUsd: 'Premium tier',                                      feesAed: 'Selective',               rating: 4.7, capacityNote: 'Excellent and selective — a different proposition for most families' },
    { name: 'The Ahliyyah, Bishop\'s and Modern schools',        city: 'Amman',                curriculum: 'National plus IGCSE and SAT',           feesUsd: 'Mid to premium tier',                               feesAed: 'Widespread',              rating: 4.4, capacityNote: 'Strong national schools running international qualifications alongside — the model most Jordanian families know' },
    { name: 'Zarqa and the industrial belt',                     city: 'Zarqa',                curriculum: 'Almost none',                           feesUsd: 'No real international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'One of the largest population centres in the country with essentially no international provision' },
    { name: 'Aqaba, Irbid and the valley',                       city: 'Outside Amman',        curriculum: 'Thin to none',                          feesUsd: 'Limited international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'A port and economic zone, a university city and a minerals valley, none with a school tier' },
    { name: 'Private tuition',                                    city: 'Nationwide',           curriculum: 'Exam-focused coaching',                 feesUsd: 'Per hour, per subject',                             feesAed: 'Widespread',              rating: 4.0, capacityNote: 'The default answer to a subject gap — usually one-to-one and unstructured across a year' },
    { name: 'Smartious Homeschool (Jordan via online delivery)',  city: 'Delivered nationwide', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP',   feesUsd: 'USD 2,160-6,480/year',                              feesAed: 'JOD effectively fixed by the peg', rating: 4.8, capacityNote: 'Every class live through A-Level + zero timezone offset year-round + Zarqa, Aqaba, Irbid and the valley reached + honest that we could not verify the legal position' },
  ],

  legalFrameworkIntro: 'Jordan is one of the markets where we could not verify the central question, and we would rather open by saying so than write around it. Here is what we can establish, and the two practical facts that shape our offer here more than the law does.',
  legalFramework: [
    { h: 'What we can establish', p: 'Education in Jordan is administered by the Ministry of Education, whose mandate is to ensure the provision of quality education from the early years through secondary education. Basic education is compulsory — commonly described as ten years, with families advised to confirm the current boundaries with the Ministry rather than take them from any article. Private schools operate with Ministry licensing, and Smartious does not hold it: we do not operate premises in Jordan, we claim no Jordanian recognition, and the qualifications we deliver carry Cambridge, Pearson Edexcel, IB or AP validity rather than a domestic one.' },
    { h: 'What we could not establish', p: 'Jordan\'s position on parental home education. We could not verify it against a primary instrument, and we are not going to fill that gap with confident prose. We will not tell you home education is permitted in Jordan and we will not tell you it is prohibited; both would exceed what we can evidence. What we would add is the point we make in Panama, Guatemala and Venezuela: an absence of clear regulation is an absence of protection rather than a permission, because where a matter is unaddressed there is nothing for a family to demonstrate if the question is raised. Put it to the Ministry of Education directly.' },
    { h: 'The Tawjihi, and where our track sits', p: 'The national qualification is the Tawjihi, and we do not teach toward it. We say that plainly, though it is a less confusing point in Jordan than in most markets: a great many Jordanian private schools already run IGCSE, the IB and SAT alongside the national route, so families here generally understand that an international examination track sits beside the national record rather than replacing it. Jordanian universities admit principally on the Tawjihi with international qualifications entering through equivalency procedures — confirm that route early if a Jordanian university is the plan.' },
    { h: 'What we therefore build', p: 'Live Cambridge or IB teaching alongside a Jordanian school enrolment. The school carries the compulsory-education duty and the domestic record; we teach the internationally examined track alongside it. Nothing in that arrangement depends on the unresolved question, which is exactly why it is the arrangement we build.' },
    { h: 'The clock, which is genuinely without precedent for us', p: 'This deserves stating properly because Jordan is the first country in our entire coverage where it is true. Jordan runs UTC+3 year-round following the end of seasonal clock changes. Our teaching base runs UTC+3 year-round. That is a zero offset — not a small one, not one that shifts in summer, but none at all, permanently. Israel comes closest at one hour in winter and level in summer; Jordan is level always. The practical consequence is that our entire teaching day is available to a Jordanian family at exactly the hour it appears on their own clock. A seven o\'clock evening class is seven o\'clock for both of us. In ninety other markets the timetable is a constraint we work around and are honest about; here there is nothing to work around.' },
    { h: 'And the currency, which is unusually predictable', p: 'The Jordanian dinar is pegged to the US dollar at a long-standing fixed rate. Our fees are quoted in USD, which means a Jordanian family committing to five years of schooling is committing to a figure that is effectively fixed in their own currency as well. Across our coverage that is true only in a handful of markets — the dollarised ones and the pegged ones — and it removes a variable that families elsewhere have to plan around.' },
  ],

  whySmartious: [
    { h: 'Zero timezone offset, year-round',                              p: 'Jordan and our teaching base both run UTC+3 with no seasonal changes. The first market in our coverage with no offset at all — every hour of our day is available at the hour it shows on your clock.' },
    { h: 'Fees effectively fixed in dinars',                              p: 'The dollar peg means a USD-quoted multi-year commitment behaves predictably in local terms.' },
    { h: 'Built for a rotating development sector',                       p: 'Jordan hosts one of the largest UN and NGO concentrations in the region. One pathway continues unchanged to the next posting.' },
    { h: 'Zarqa, Aqaba, Irbid and the valley reached',                    p: 'Four regions carrying industry, trade, universities and minerals, none with an international school tier.' },
    { h: 'Honest about the question we could not verify',                 p: 'We could not establish Jordan\'s home-education position and say so rather than guessing in either direction.' },
    { h: 'Arabic kept as an examined subject',                            p: 'Cambridge Arabic alongside the English-medium core rather than traded away.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Jordan?', a: 'We could not verify a position from a primary Jordanian instrument and will not guess. Basic education is compulsory and administered by the Ministry of Education. An absence of clear regulation is not a permission — put the question to the Ministry directly. Structured study alongside a school enrolment raises none of it.' },
    { q: 'Do you teach the Tawjihi?', a: 'No. We are not a Ministry-licensed Jordanian school and issue no Jordanian qualification. We teach Cambridge, Edexcel, IB and AP examinations, which sit alongside the Jordanian record — a distinction most families here already understand, since many private schools run IGCSE and the IB alongside the national route.' },
    { q: 'What time are classes?', a: 'Any hour of our teaching day, at exactly the time it shows on your clock. Jordan runs UTC+3 year-round and so does our teaching base — a zero offset with no seasonal drift, and the first market in our coverage where that is true.' },
    { q: 'How do fees work with the dinar?', a: 'We quote in USD, and the dinar is pegged to the dollar at a long-standing fixed rate — so a multi-year commitment behaves predictably in local terms, which is not the case in most of our markets.' },
    { q: 'We are on a UN or NGO posting — does the schooling follow?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next country. Many of our development-sector families re-enrol from a new posting rather than starting over, which is the clearest evidence the portability is real.' },
    { q: 'Will Jordanian universities accept Cambridge A-Levels?', a: 'Jordanian universities admit principally on the Tawjihi, with international qualifications entering through equivalency procedures administered per institution. Confirm that route early if a Jordanian university is the plan. Outward, UK, US, Canadian and Gulf universities read A-Levels and the IB directly.' },
    { q: 'Where do Jordanian students sit Cambridge examinations?', a: 'At authorised provision confirmed per family per session — Amman is checked first, with travel planned ahead from Irbid, Aqaba and the valley. Jordan is compact enough that this is a handful of day trips a year.' },
    { q: 'Which parts of Jordan does Smartious cover?', a: 'Amman, Aqaba, Irbid and the north, Zarqa and the industrial belt, and the Dead Sea and Jordan Valley have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us which hours suit your household: Jordan is the one market where we can genuinely build the timetable around you rather than around a timezone.',
}
