// ═══════════════════════════════════════════════════════════════════
// GHANA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for corporate, energy, diaspora, and Ghanaian
// families across Accra, Kumasi, and Takoradi.
// WEST AFRICA BUILD — 3 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
// Do NOT paste guessed stock-photo IDs.
//
// LEGAL POSITIONING NOTE — READ BEFORE EDITING:
// - Governing statute: the EDUCATION ACT, 2008 (ACT 778), amended by
//   the Education (Amendment) Act, 2010 (Act 802).
// - SECTION 2: education at the basic level is FREE, COMPULSORY AND
//   UNIVERSAL. That is the core obligation and it should be quoted
//   in substance on every page.
// - The Act also provides for decentralisation of education (s.3),
//   the Education Service (s.4), inclusive education (s.5),
//   inspection and supervision and a national inspectorate function
//   (ss.7-8), and a National Teaching Council with licensing and
//   registration of teachers (ss.9-13). Note that Ghana's
//   pre-tertiary regulatory bodies have been restructured since 2008
//   — mention that only in general terms and hedge; do not name
//   current bodies or their powers unless verified.
// - PARENTAL-CHOICE HOME EDUCATION: we are not aware of an
//   established route under Act 778. PHRASE IT AS "not established /
//   we are not aware of" plus "confirm with the Ministry of
//   Education and the Ghana Education Service" — NOT as a
//   categorical prohibition.
// - SCHOOL LICENSING: pre-tertiary schools in Ghana are subject to
//   licensing and inspection requirements. CONSEQUENCE — STATE IT
//   PLAINLY: Smartious is NOT a licensed Ghanaian school and does
//   not present itself as one. We work ALONGSIDE a Ghanaian school.
//   This mirrors the Australia and Botswana disclosures.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT throughout.
// TIMEZONE — BE HONEST, THIS IS THE WEAKEST ALIGNMENT IN OUR AFRICAN
// COVERAGE: Ghana runs GMT (UTC+0) with no daylight saving, which is
// THREE HOURS BEHIND Nairobi EAT. An Accra after-school slot at
// 16:00 is 19:00 in Nairobi. Do NOT claim easy alignment. State the
// offset plainly, note that it is FIXED with no seasonal drift, and
// explain the two workable patterns: late-afternoon Accra classes in
// our evening teaching block, or morning Accra classes for full-time
// and flexible students. Honesty here is worth more than a claim.
// MARKET NOTE: Accra holds a genuinely deep international-school
// tier by regional standards — Ghana International School, Lincoln
// Community School, Tema International School, Association
// International School, SOS-Hermann Gmeiner, and a large Cambridge-
// offering private sector — plus a significant tech and fintech
// scene and a very large returning diaspora from the UK and US. The
// national route is the WASSCE, and Ghanaian private schools widely
// offer IGCSE alongside it. Kumasi is the Ashanti capital, KNUST's
// city, and the gold and trade centre of the interior. Sekondi-
// Takoradi is the oil and gas hub since the Jubilee field came on
// stream, with international oilfield services and a port.
// ═══════════════════════════════════════════════════════════════════

export const GHANA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'accra-gh',
    name: 'Accra',
    county: 'Greater Accra Region',
    region: 'Capital · West Africa\'s tech and fintech centre · the corporate, diplomatic and development community · a deep international-school tier at premium fees · a large returning diaspora',
    primaryKeyword: 'Online school and Cambridge tutoring in Accra',
    heroTagline: 'For Accra families from Airport Residential to East Legon — Cambridge taught live in small groups, at a fraction of the tier\'s fees.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Accra families. Accra carries more corporate and institutional weight than almost any city in West Africa — a technology and fintech sector that has drawn continental and global headquarters, the oil and gas majors, the diplomatic and development community, and a returning diaspora from the UK and United States that has reshaped whole neighbourhoods. Its international-school tier is genuinely deep by regional standards, and its fees are at the top of the market. Under the Education Act, 2008, education at the basic level is free, compulsory and universal — so our clean default is supplementary: your school enrolment carries that duty, and we teach the Cambridge or IB track live alongside it.',
    heroImg: '/heroes/accra-gh.jpg',
    altTexts: { hero: 'Accra city and the coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Accra families — small-group teaching alongside your school, at a fraction of the tier\'s fees. From USD 400/month.',
    challenges: [
      'International school fees in Accra sit at the very top of the West African market, beyond many professional Ghanaian families.',
      'Places at the strongest schools are competitive, and the returning diaspora has increased demand.',
      'Education at the basic level is free, compulsory and universal under the Education Act, 2008.',
      'Corporate, energy, and development postings arrive and depart on contract timelines.',
      'Time zone: Ghana runs GMT (UTC+0) with no daylight saving — three hours behind Nairobi EAT, fixed, so Accra late-afternoon classes fall in our evening teaching block.',
    ],
    familySituations: [
      'Technology, fintech, and corporate-headquarters families.',
      'Oil, gas, and energy-sector families based in the capital.',
      'Diplomatic, development, and international-organisation families.',
      'Returning diaspora families from the UK and United States settling children mid-curriculum.',
      'Ghanaian professional families priced out of the international tier.',
      'Students combining a WASSCE school route with Cambridge subjects for overseas applications.',
    ],
    nearbyAreas: ['Airport Residential', 'East Legon', 'Cantonments', 'Labone', 'Osu', 'Tema', 'Aburi'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Business Studies, Economics, Computer Science',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Accounting, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Ghanaian, South African and Canadian university applications',
    ],
    whyChoose: [
      ['The tier\'s examinations at a professional family\'s budget', 'Live small-group Cambridge teaching at USD 2,160-6,480 a year against Accra international fees at the top of the West African market.'],
      ['Cambridge alongside the WASSCE route', 'Many Accra families keep their school and its national track and add Cambridge subjects for overseas applications. That combination is the most common shape we run here.'],
      ['Built for the diaspora return', 'A child arriving mid-curriculum from London or Maryland keeps one internationally examined pathway instead of restarting inside a new system.'],
      ['Computing depth for a fintech city', 'Cambridge A-Level Computer Science, Mathematics, and Further Mathematics — led by a founder with a BEd in Mathematics and Physics — suit the sector defining Accra.'],
      ['Honest about the clock', 'Ghana is three hours behind Nairobi, fixed. Late-afternoon Accra classes sit in our evening teaching block; morning slots suit full-time students. We schedule around it rather than pretending it does not exist.'],
    ],
    growingReason: 'Accra is West Africa\'s technology and fintech centre, with continental headquarters, the energy majors, a large diplomatic and development community, and a returning diaspora from the UK and US — alongside a deep international-school tier priced at the top of the regional market. Ghana runs GMT (UTC+0) with no daylight saving, three hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Accra families, run alongside a Ghanaian school enrolment. Examinations at authorised centres confirmed per family per session; Ghana has established Cambridge provision.',
      cbc: 'Kenya CBC available for Accra families with East African ties.',
      ib: 'IB Diploma Programme — supplements and support alongside the capital\'s IB provision.',
      american: 'American Curriculum with AP — for families targeting American universities, a very common Ghanaian destination.',
    },
    homeschoolDetail: 'Ghanaian education law is set by the Education Act, 2008 (Act 778), as amended in 2010. Section 2 provides that education at the basic level is free, compulsory and universal — the core obligation, and the reason our clean default here is supplementary. The Act also provides for the decentralisation of education, the Education Service, inclusive education, inspection and supervision through a national inspectorate function, and a National Teaching Council responsible for the licensing and registration of teachers; Ghana\'s pre-tertiary regulatory structures have been reorganised since 2008, and current arrangements are worth confirming rather than assumed. We are not aware of an established parental-choice home-education route under Act 778, and we phrase it that way rather than asserting a categorical prohibition we cannot fully evidence — a family whose plan turns on the point should confirm the current position with the Ministry of Education and the Ghana Education Service. One further point we state as plainly as we do in Australia and Botswana: pre-tertiary schools in Ghana are subject to licensing and inspection requirements, and Smartious is not a licensed Ghanaian school. We are an internationally accredited online school delivering from Nairobi, working alongside your Ghanaian school rather than replacing it.',
    homeTuitionDetail: 'Smartious delivers to Accra families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Ghana sits three hours behind Nairobi with no daylight saving on either side, so the offset is fixed: late-afternoon Accra classes fall in our evening teaching block, and morning Accra slots suit full-time and flexible students. Every session is recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Ghana?', a: 'Education at the basic level is free, compulsory and universal under section 2 of the Education Act, 2008. We are not aware of an established parental-choice home-education route under that Act, and we put it in those terms rather than asserting a flat prohibition — a family whose plan depends on it should confirm with the Ministry of Education and the Ghana Education Service. Structured study alongside a school enrolment is unrestricted, and that is what we offer.' },
      { q: 'Is Smartious a licensed school in Ghana?', a: 'No, and we say so plainly. Pre-tertiary schools here are subject to licensing and inspection requirements. Smartious is an internationally accredited online school delivering from Nairobi and working alongside your Ghanaian school rather than replacing it.' },
      { q: 'Can our child do WASSCE and Cambridge together?', a: 'That is the most common arrangement we run in Ghana. The school keeps the national route and the daily routine; we teach two or three Cambridge subjects live alongside it for overseas applications. It is a heavier year, so subject choice has to be disciplined.' },
      { q: 'What are the class times like?', a: 'Ghana is three hours behind Nairobi and neither country observes daylight saving, so the offset is fixed all year. Late-afternoon Accra classes sit in our evening teaching block; morning slots work well for full-time students. We are honest that this is a wider gap than for our East and Southern African families.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'kumasi-gh',
    name: 'Kumasi',
    county: 'Ashanti Region',
    region: 'The Ashanti capital and second city · KNUST and a major university community · gold, timber and the trading economy of the interior · thin international schooling relative to its size',
    primaryKeyword: 'Online school and Cambridge tutoring in Kumasi',
    heroTagline: 'For Kumasi and Ashanti families — Ghana\'s second city, its great technical university, and a fraction of Accra\'s international provision.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Kumasi families. Kumasi is the Ashanti capital and Ghana\'s second city — home to KNUST, one of West Africa\'s most significant technical universities, and to a gold, timber, and trading economy that has made it the commercial heart of the interior for centuries. Its academic community is substantial and its international schooling is thin relative to its size, with Accra\'s tier four hours south. Smartious delivers live small-group Cambridge and IB teaching across Ashanti, alongside your school enrolment.',
    heroImg: '/heroes/kumasi-gh.jpg',
    altTexts: { hero: 'Kumasi, the Ashanti capital' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Kumasi and Ashanti families — second city, KNUST, thin international provision. From USD 400/month.',
    challenges: [
      'Thin international schooling for a city of Kumasi\'s size and academic weight.',
      'Accra\'s tier is around four hours south — a relocation decision rather than a commute.',
      'Education at the basic level is free, compulsory and universal under the Education Act, 2008.',
      'Exam sittings mean Accra or regional windows, planned ahead.',
      'Time zone: Kumasi shares GMT (UTC+0), three hours behind Nairobi EAT, fixed all year.',
    ],
    familySituations: [
      'KNUST academic, research, and medical-faculty families.',
      'Gold mining, timber, and industrial-sector professional families.',
      'Trading and family-business households across Ashanti.',
      'Ghanaian professional families wanting Cambridge subjects unavailable locally.',
      'Students aiming at engineering, medicine, or business programmes abroad.',
    ],
    nearbyAreas: ['Kumasi', 'KNUST and Ayeduase', 'Ejisu', 'Obuasi', 'Konongo', 'Mampong', 'Sunyani'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Business Studies, Economics, Computer Science',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Accounting',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Chemistry',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Ghanaian, South African and Canadian university applications',
    ],
    whyChoose: [
      ['The complete option four hours from the tier', 'Identical live delivery in Kumasi and Accra — no relocation, no boarding decision.'],
      ['Engineering and pre-medical depth for a KNUST city', 'Cambridge A-Level Mathematics, Further Mathematics, Physics, and Chemistry — the exact spine an engineering and medical academic community aims at.'],
      ['Cambridge alongside the WASSCE route', 'The school keeps the national track; we add the subjects overseas applications need.'],
      ['Small groups, not a lecture', 'Every Smartious class is live in groups of 4-6, which is the opposite of the large-cohort teaching most Kumasi students know.'],
      ['Honest about the clock', 'Ghana is three hours behind Nairobi, fixed. Late-afternoon Kumasi classes sit in our evening block; morning slots suit full-time students.'],
    ],
    growingReason: 'Kumasi is the Ashanti capital and Ghana\'s second city — home to KNUST, one of West Africa\'s major technical universities, and to a gold, timber, and trading economy — with international schooling thin relative to its size and Accra four hours south. Kumasi shares GMT (UTC+0), three hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Ashanti, run alongside a Ghanaian school enrolment. Examinations at authorised centres confirmed per session with travel planned ahead.',
      cbc: 'Kenya CBC available for Ashanti families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Kumasi: education at the basic level is free, compulsory and universal under section 2 of the Education Act, 2008, and we are not aware of an established parental-choice home-education route under that Act — a position to confirm with the Ministry of Education and the Ghana Education Service. Pre-tertiary schools are subject to licensing and inspection requirements, and Smartious is not a licensed Ghanaian school; we work alongside yours. The supplementary configuration therefore carries the school years, with the Cambridge or IB track running live alongside toward external examinations.',
    homeTuitionDetail: 'Smartious delivers to Ashanti families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on the fixed three-hour offset — late-afternoon Kumasi classes in our evening block, morning slots for full-time students, every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Kumasi?', a: 'Thin relative to the city\'s size and academic weight — the deep tier is in Accra, around four hours south. Live online delivery is the complete option for Ashanti.' },
      { q: 'Our child is at KNUST\'s feeder schools and doing WASSCE — can Cambridge run alongside?', a: 'Yes, and it is the common shape here: the school keeps the national route while we teach two or three Cambridge subjects live for overseas applications.' },
      { q: 'Where do Kumasi students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with travel planned into each series ahead.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'takoradi-gh',
    name: 'Sekondi-Takoradi & the Western Region',
    county: 'Western Region',
    region: 'Ghana\'s oil and gas hub since the Jubilee field · the port and the international oilfield-services community · a rotational technical workforce · schooling that never scaled with the industry',
    primaryKeyword: 'Online school and Cambridge tutoring in Takoradi',
    heroTagline: 'For Takoradi and Western Region families — the oil city, staffed internationally and schooled locally.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Sekondi-Takoradi and Western Region families. Since the Jubilee field came on stream, Takoradi has been Ghana\'s oil and gas capital — the operators and the international oilfield-services companies, the port and its logistics chain, and a technical workforce recruited from across Africa, Europe, and further afield, much of it on rotational contracts. The city also anchors a Western Region economy of gold, cocoa, and timber. What none of it produced was schooling that scaled with the industry: the deep international tier remains in Accra, around four hours east. Smartious delivers live Cambridge and IB teaching to the oil city instead.',
    heroImg: '/heroes/takoradi-gh.jpg',
    altTexts: { hero: 'Takoradi harbour and the Western Region coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Sekondi-Takoradi and Western Region families — Ghana\'s oil hub, thin international schooling. From USD 400/month.',
    challenges: [
      'An internationally recruited oil and gas workforce with schooling that never scaled with the industry.',
      'Accra\'s international tier is around four hours east — a relocation or a boarding decision.',
      'Rotational contracts move families between operations, countries, and continents.',
      'Education at the basic level is free, compulsory and universal under the Education Act, 2008.',
      'Time zone: Takoradi shares GMT (UTC+0), three hours behind Nairobi EAT, fixed all year.',
    ],
    familySituations: [
      'Oil and gas operator, oilfield-services, and subsea engineering families.',
      'Port, logistics, and marine-services families.',
      'Gold mining, cocoa, and timber-sector professional families across the Western Region.',
      'Rotational technical staff whose households move between countries.',
      'Students aiming at petroleum engineering, geoscience, or marine programmes abroad.',
    ],
    nearbyAreas: ['Takoradi', 'Sekondi', 'the Takoradi port', 'Tarkwa', 'Axim', 'Elmina and Cape Coast', 'the Western Region fields'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Geography, Business Studies, Economics',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Geography',
      'Cambridge A-Level Biology, Economics, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Chemistry',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including petroleum and geoscience programmes), Common Application (US), and Ghanaian and South African university applications',
    ],
    whyChoose: [
      ['Schooling that survives a rotation', 'One live pathway held constant across postings — the case our Baku, Stavanger, Fier, Hassi Messaoud, and Copperbelt families have proven.'],
      ['Geoscience and engineering depth', 'Cambridge A-Level Physics, Chemistry, Mathematics, and Geography — the exact spine an oil and gas workforce\'s children aim at.'],
      ['The alternative to boarding in Accra', 'Takoradi families have sent senior students east or abroad for years. Live teaching reaches the oil city instead.'],
      ['Portable to the next basin', 'Takoradi now, Angola, Nigeria, the Gulf, or the North Sea after — the curriculum and the board stay constant.'],
      ['Honest about the clock', 'Ghana is three hours behind Nairobi, fixed. Late-afternoon Takoradi classes sit in our evening block; morning slots suit full-time students.'],
    ],
    growingReason: 'Sekondi-Takoradi has been Ghana\'s oil and gas capital since the Jubilee field came on stream — operators, international oilfield services, the port and its logistics chain, and a rotational technical workforce — alongside a Western Region economy of gold, cocoa, and timber, with schooling that never scaled with the industry. Takoradi shares GMT (UTC+0), three hours behind Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Western Region, portable across postings. Examinations at authorised centres confirmed per session with travel planned ahead.',
      cbc: 'Kenya CBC available for Western Region families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in the Western Region: education at the basic level is free, compulsory and universal under section 2 of the Education Act, 2008, and we are not aware of an established parental-choice home-education route under that Act — confirm with the Ministry of Education and the Ghana Education Service. Pre-tertiary schools are subject to licensing and inspection requirements and Smartious is not a licensed Ghanaian school; we work alongside yours. For internationally posted energy families the supplementary configuration is the natural one: the local school carries the duty while the Cambridge track runs live alongside and continues unchanged to the next basin.',
    homeTuitionDetail: 'Smartious delivers to Western Region families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on the fixed three-hour offset, with every session recorded — built for rotations, offshore schedules, and remote sites.',
    faqs: [
      { q: 'We are on an oil and gas rotation — does the schooling follow us?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next posting anywhere in the world, with examinations sat at authorised centres wherever the family is. Only the local legal framework changes, and we plan that part.' },
      { q: 'Is boarding in Accra the only option for senior years?', a: 'It has been for many Takoradi families. Live teaching reaches the oil city, with examination travel a few times a year rather than a child living away from home.' },
      { q: 'Where do Western Region students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with travel planned into each series ahead.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const GHANA_COUNTRY = {
  slug: 'ghana',
  name: 'Ghana',
  longName: 'Republic of Ghana',
  adjective: 'Ghanaian',
  flag: '🇬🇭',
  hub: '/online-school/ghana',
  hubPageId: 'homeschooling-ghana',
  cityPageId: 'ghana-city',

  currency: 'GHS',
  currencyName: 'Ghanaian Cedi',
  currencyPeg: 'Fees are invoiced in USD; cedi equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'GMT',
    name: 'Greenwich Mean Time (UTC+0), no daylight saving',
    utcOffset: '+0',
    offsetFromEAT: '-3 hours, fixed, every week of the year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Ghana has established Cambridge provision through its private-school sector, with capacity checked per series'],
  examCentreTiles: [
    { city: 'Accra', centre: 'Authorised provision', area: 'The country\'s main external-candidate capacity, confirmed per family per session.' },
    { city: 'Kumasi', centre: 'Regional provision', area: 'Ashanti families check regional options first, with Accra windows as the fallback.' },
    { city: 'Takoradi and the west', centre: 'Planned per session', area: 'Western Region families plan travel into each examination window ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Ghana-based students sit as external candidates at authorised provision, with capacity confirmed per family per session. Ghana is an easier market than most for this, because IGCSE is widely offered across the private-school sector alongside the national WASSCE route, so provision and familiarity are both established — Accra is checked first, with regional options for Kumasi and travel planned ahead from the Western Region. Note what does not change: a Smartious arrangement is delivered alongside a Ghanaian school, which continues its own national track — BECE at basic level and WASSCE at senior secondary — unchanged. The two calendars are planned together at enrolment rather than one replacing the other, and for most of our Ghanaian families the point of the Cambridge subjects is precisely to sit beside the WASSCE rather than instead of it.',
  secondaryProgrammeExamRef: 'Authorised Ghanaian Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/ghana.jpg',
  heroEyebrow: 'Online school for Ghana',
  heroH1Suffix: 'Ghana',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for corporate, energy, diaspora, and Ghanaian families across Accra, Kumasi, and Sekondi-Takoradi. Education at the basic level is free, compulsory and universal under the Education Act, 2008 — so we work alongside your Ghanaian school, adding the Cambridge subjects overseas applications need at a fraction of the Accra tier\'s fees.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — alongside your school, with WASSCE left intact.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Ghana',

  citiesSectionTitle: 'Where our Ghana families are',
  citiesSectionBody: 'Smartious Ghana families concentrate across Accra (West Africa\'s tech and fintech centre, the energy majors, the diplomatic and development community, a returning diaspora, and an international-school tier priced at the top of the regional market), Kumasi (the Ashanti capital, KNUST, and the gold and trading economy of the interior, four hours from that tier), and Sekondi-Takoradi (Ghana\'s oil and gas hub since Jubilee, with an internationally recruited rotational workforce and schooling that never scaled with the industry). One compulsory basic-education duty, one supplementary configuration, and a fixed three-hour offset we are honest about.',

  trustSignals: [
    { h: 'An African school teaching African families', p: 'Smartious was founded in Nairobi in 2019 and teaches from two operational centres established 2022 and 2023, serving students in 55 countries — an African school with international accreditation, not an overseas provider reaching in.' },
    { h: 'Honest about the clock', p: 'Ghana runs GMT (UTC+0) and Kenya EAT (UTC+3), with no daylight saving on either side — a fixed three-hour gap. Late-afternoon Ghanaian classes fall in our evening teaching block and morning slots suit full-time students. It is a wider gap than for our East and Southern African families and we schedule around it rather than pretending otherwise.' },
    { h: 'The law stated before anything is sold', p: 'Education at the basic level is free, compulsory and universal under section 2 of the Education Act, 2008. We are not aware of an established parental home-education route and say so in those terms, pointing families to the Ministry of Education and the Ghana Education Service.' },
    { h: 'What we are, stated plainly', p: 'Pre-tertiary schools in Ghana are subject to licensing and inspection requirements. Smartious is not a licensed Ghanaian school and does not present itself as one — we work alongside yours.' },
  ],

  universitiesInCountry: 'The University of Ghana at Legon, Kwame Nkrumah University of Science and Technology (KNUST) in Kumasi, the University of Cape Coast, Ashesi University, and a substantial private sector — Ghana has one of the more developed higher-education systems in West Africa.',
  universityChannels: 'Ghanaian universities admit primarily on the WASSCE, and holders of Cambridge and other international qualifications apply through established procedures with requirements confirmed per institution — IGCSE and A-Level are familiar here rather than exotic, because the private-school sector has offered them for years alongside the national route. Outward, Ghanaian students are among the most internationally mobile in West Africa: the United States and the United Kingdom are principal destinations, with Canada growing quickly, and all three read Cambridge A-Levels and the IB directly. UCAS reads A-Levels natively, the Common Application serves US plans, and A-Levels are accepted in 160+ countries — including the petroleum and geoscience programmes the Western Region\'s families most often have in view. Smartious provides personalised university guidance across Ghanaian, UK (UCAS), US, and Canadian destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Ghana families. Cambridge IGCSE (Years 10-11) and Cambridge A-Level (Years 12-13) delivered as live small-group classes on a fixed three-hour offset — late-afternoon Ghanaian slots in our evening teaching block, morning slots for full-time students — run alongside a Ghanaian school which continues its BECE and WASSCE track unchanged. Examinations at authorised Ghanaian provision confirmed per session. Pathway familiar across the Ghanaian private sector, read natively by UK universities via UCAS, and accepted in 160+ countries.',
  britishCurriculumSuits: 'Ghana families targeting the Cambridge pathway. Best fit for: (1) students keeping a WASSCE school route and adding Cambridge subjects for overseas applications, (2) Accra professional families outside the international tier\'s fees, (3) Kumasi and Ashanti families four hours from that tier, (4) oil and gas families in Sekondi-Takoradi and the Western Region, (5) returning diaspora children arriving mid-curriculum from the UK or United States.',
  britishCurriculumDelivery: 'Live online classes on a fixed three-hour offset, small groups 4-6 students, every session recorded, alongside your Ghanaian school.',
  ibDiplomaSuits: 'Ghana families targeting the IB Diploma\'s breadth — support alongside Accra\'s IB provision.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Ghana families targeting US universities via Common Application — a principal destination for Ghanaian students.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to African and internationally mobile families at online-delivery fees rather than campus ones. Ghana families join students in 55 other countries — West Africa\'s deepest international-school market, and the regions around it that the market never reached.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the Western Region\'s petroleum and geoscience families, Kumasi\'s KNUST-bound students, and Accra\'s fintech households. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Ghana has the deepest international-school market in West Africa, and the Accra schools are genuinely good — Ghana International School, Lincoln Community School, Tema International, Association International and their peers, alongside a large private sector that has offered IGCSE for years. The fees are correspondingly high. Outside Greater Accra the picture thins sharply: Kumasi is a city of over two million with a fraction of the provision, and Takoradi runs an international oil industry on local schooling. That gap, plus the fee gap inside Accra itself, is the space live delivery fills.',
  competitors: [
    { name: 'Ghana International School / Lincoln Community School', city: 'Accra',           curriculum: 'British, IB and American tracks',       feesUsd: 'Top of the West African market',                    feesAed: 'Premium tier',            rating: 4.7, capacityNote: 'Genuinely strong and competitive — the regional benchmark' },
    { name: 'Tema International, Association International and peers', city: 'Greater Accra', curriculum: 'IGCSE, IB and national tracks',        feesUsd: 'Premium tier',                                      feesAed: 'Varies',                  rating: 4.4, capacityNote: 'A deep second tier — still capital-bound' },
    { name: 'Private schools offering IGCSE',                 city: 'Accra, Kumasi',         curriculum: 'IGCSE alongside WASSCE',                feesUsd: 'Mid tier',                                          feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Cambridge is already established in Ghana — the qualification is not the gap' },
    { name: 'Kumasi and the interior',                        city: 'Ashanti',               curriculum: 'Thin provision',                        feesUsd: 'Little international option',                       feesAed: '—',                       rating: 0,   capacityNote: 'Over two million people, a major technical university, a fraction of the capital\'s provision' },
    { name: 'Sekondi-Takoradi and the Western Region',        city: 'The oil hub',           curriculum: 'Thin provision',                        feesUsd: 'Little international option',                       feesAed: '—',                       rating: 0,   capacityNote: 'An international oil industry running on local schooling' },
    { name: 'Wolsey Hall Oxford / King\'s InterHigh (online)', city: 'Online',                curriculum: 'Cambridge self-paced / UK online',      feesUsd: 'Per-subject / GBP 9,000-11,000',                    feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Self-paced or priced far above Smartious — though for Ghana specifically, UK-based providers are the closest match on timezone' },
    { name: 'Smartious Homeschool (Ghana via online delivery)', city: 'Delivered to all Ghana', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'GHS equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + Cambridge alongside WASSCE + Kumasi and the Western Region served identically + honest about the three-hour offset' },
  ],

  legalFrameworkIntro: 'Ghanaian education law is set by a single principal statute and one section of it does most of the work. Here is the framework, and the two disclosures that follow from it.',
  legalFramework: [
    { h: 'The governing statute and the core obligation', p: 'The Education Act, 2008 (Act 778), amended by the Education (Amendment) Act, 2010 (Act 802), governs the system. Section 2 provides that education at the basic level is free, compulsory and universal — the commitment usually referred to as FCUBE, and the core obligation from which everything else on this page follows. The Act also provides for the decentralisation of education, the Education Service, inclusive education, inspection and supervision through a national inspectorate function, and a National Teaching Council responsible for licensing and registering teachers. Ghana\'s pre-tertiary regulatory structures have been reorganised since 2008, so current bodies and their exact powers are worth confirming rather than assumed from a decade-old summary.' },
    { h: 'Home education: what we can and cannot say', p: 'We are not aware of an established parental-choice home-education route under Act 778, and we phrase it in exactly those terms rather than asserting a categorical prohibition we cannot fully evidence from the statute text. A family whose plan turns on the point should confirm the current position with the Ministry of Education and the Ghana Education Service. What is not in doubt is that structured education alongside a school enrolment is unrestricted, which is the configuration we build here.' },
    { h: 'What we are, and are not', p: 'Pre-tertiary schools in Ghana are subject to licensing and inspection requirements. Smartious is not a licensed Ghanaian school, does not operate premises in Ghana, and does not present itself as an alternative to a licensed school. We are an internationally accredited online school delivering live classes from Nairobi to families whose children remain enrolled at Ghanaian schools. We state this as directly as we do on our Australian and Botswana pages, and for the same reason: a family is entitled to know exactly what they are buying.' },
    { h: 'Why Cambridge sits comfortably beside WASSCE here', p: 'Ghana is one of the easier African markets for an international qualification, because IGCSE has been offered across the private-school sector for years alongside the national route. So the most common arrangement we run here is not a replacement but a pairing: the school keeps the BECE and WASSCE track and the daily routine, and we teach two or three Cambridge subjects live alongside for overseas applications. It is a heavier year and it demands discipline about subject choice — two or three A-Levels chosen strictly for the target course, not four chosen out of ambition — but for a student aiming at the United States, the United Kingdom, or Canada it is the combination that opens the most doors.' },
    { h: 'The honest point about the clock', p: 'Ghana runs GMT and Kenya runs EAT, three hours apart, with neither observing daylight saving. That is the widest offset in our African coverage and we would rather state it than dress it up: an Accra after-school slot at four in the afternoon is seven in the evening in Nairobi. Two patterns work. Late-afternoon Ghanaian classes sit in our evening teaching block, which is a normal working slot for us and the after-school slot for you. And morning Ghanaian classes suit full-time and flexible students, landing in our early afternoon. What the fixed offset does guarantee is that whichever pattern a family chooses, it never drifts with the seasons.' },
    { h: 'Where the qualifications lead', p: 'Ghanaian universities admit primarily on the WASSCE, with international qualifications applying through established procedures and requirements confirmed per institution. Outward, Ghanaian students are among the most internationally mobile in West Africa — the United States and United Kingdom are principal destinations, with Canada growing quickly — and all three read Cambridge A-Levels and the IB directly. UCAS reads A-Levels natively, the Common Application serves US plans, and A-Levels are accepted in 160+ countries, including the petroleum and geoscience programmes the Western Region\'s families most often have in view.' },
  ],

  whySmartious: [
    { h: 'Cambridge alongside WASSCE, not instead of it',                   p: 'The most common shape we run in Ghana: the school keeps the national route and the routine, we add two or three Cambridge subjects live for overseas applications.' },
    { h: 'The tier\'s examinations at a professional family\'s budget',      p: 'Accra international fees sit at the top of the West African market; Smartious runs USD 2,160-6,480 for live small-group teaching toward the same boards.' },
    { h: 'Kumasi and the Western Region served identically',                p: 'Over two million people in Ashanti with a fraction of Accra\'s provision, and an international oil industry in Takoradi running on local schooling.' },
    { h: 'Honest about the three-hour offset',                              p: 'Ghana is our widest African gap. We state it, explain the two workable patterns, and note that being fixed year-round means it never drifts.' },
    { h: 'Honest about what we are',                                        p: 'Not a licensed Ghanaian school, and we say it plainly — an internationally accredited online school working alongside yours.' },
    { h: 'An African school teaching African families',                     p: 'Nairobi-built and Nairobi-taught, serving 55 countries, working to African calendars and examination realities.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Ghana?', a: 'Education at the basic level is free, compulsory and universal under section 2 of the Education Act, 2008. We are not aware of an established parental-choice home-education route under that Act, and we put it in those terms rather than asserting a flat prohibition — a family whose plan depends on it should confirm with the Ministry of Education and the Ghana Education Service. Structured study alongside a school enrolment is unrestricted.' },
    { q: 'Is Smartious a licensed school in Ghana?', a: 'No, and we say so plainly. Pre-tertiary schools here are subject to licensing and inspection requirements. We are an internationally accredited online school delivering from Nairobi and working alongside your Ghanaian school rather than replacing it.' },
    { q: 'Can our child do WASSCE and Cambridge A-Levels together?', a: 'Yes, and it is the most common arrangement we run in Ghana. The school keeps the national track and the daily routine; we teach two or three Cambridge subjects live alongside for overseas applications. It is a heavier year, so subject choice has to be disciplined.' },
    { q: 'How do class times work given the three-hour gap?', a: 'Two patterns work. Late-afternoon Ghanaian classes sit in our evening teaching block — a normal working slot for us, the after-school slot for you. Morning Ghanaian classes suit full-time and flexible students. Neither country observes daylight saving, so whichever pattern you choose never drifts with the seasons. We would rather be straight that this is a wider gap than for our East and Southern African families.' },
    { q: 'How do the fees compare with Accra international schools?', a: 'Accra fees sit at the very top of the West African market. Smartious runs USD 2,160-6,480 a year for live small-group teaching toward the same Cambridge examinations — which for many professional Ghanaian families is the difference between access and no access.' },
    { q: 'We are returning from the UK or the US mid-curriculum — what happens?', a: 'The child keeps their pathway. Ghana\'s private sector already runs IGCSE widely, so a British-curriculum arrival lands in a familiar framework, and we run alongside to smooth subject differences and hold continuity.' },
    { q: 'Where do Ghanaian students sit Cambridge examinations?', a: 'At authorised provision confirmed per family per session. Ghana is an established Cambridge market through its private-school sector, so provision is easier here than in much of our coverage — Accra first, with regional options for Kumasi and travel planned ahead from the Western Region.' },
    { q: 'Which parts of Ghana does Smartious cover?', a: 'Accra, Kumasi and Ashanti, and Sekondi-Takoradi and the Western Region have dedicated pages. Live online delivery works identically anywhere in the country — which outside Greater Accra is precisely the point.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us whether your child is on the WASSCE track and which time of day suits: in Ghana the three-hour offset means the timetable conversation matters more than almost anywhere, and it belongs at the start.',
}
