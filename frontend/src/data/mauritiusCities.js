// ═══════════════════════════════════════════════════════════════════
// MAURITIUS — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for financial-services, expat, and Mauritian
// families across Port Louis, Ebène and Moka, and Grand Baie.
// INDIAN OCEAN BUILD — 3 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
// Do NOT paste guessed stock-photo IDs.
//
// POSITIONING NOTE — MAURITIUS IS UNLIKE ANY OTHER MARKET WE SERVE:
// Cambridge is not an international alternative here. IT IS THE
// NATIONAL SYSTEM. Mauritian students sit Cambridge International
// O Level and International A and AS Level examinations as their
// national qualifications, administered through the Mauritius
// Examinations Syndicate (MES), and they consistently rank among
// the very best in the world in them. THIS CHANGES THE WHOLE PITCH:
// - We are NOT introducing an unfamiliar qualification. We are
//   offering live small-group teaching in the qualification the
//   country already runs, to families who want more of it, or a
//   subject their school cannot staff, or continuity across a move.
// - NEVER frame Cambridge as "international recognition your child
//   would not otherwise have" here. That would read as ignorant to
//   any Mauritian parent. Frame it as depth, access, and choice.
// - Be genuinely respectful of the national system. Mauritius
//   outperforms most of the world in these examinations. Our value
//   is supplementary teaching, subject breadth, and portability —
//   not rescue.
//
// LEGAL POSITIONING NOTE:
// - The Education Act (Act 39 of 1957, as amended) governs. It
//   provides for registration of non-Government schools (section 10),
//   with the Minister able to refuse or cancel registration; for
//   quality assurance in primary and secondary schools; and for the
//   recognition and equivalence of qualifications obtained in or
//   outside Mauritius in the primary and secondary sector.
// - SCHOOLING IS COMPULSORY TO THE AGE OF SIXTEEN. Education is free
//   from pre-primary through tertiary, with free transport since
//   2005 and free textbooks for Grades 1-9 since 2020 — a genuinely
//   well-funded system that deserves to be described as such.
// - PARENTAL-CHOICE HOME EDUCATION: we are not aware of an
//   established route under the Education Act. Phrase it as "not
//   established / we are not aware of" plus "confirm with the
//   Ministry of Education", NOT as a categorical prohibition.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT. The school enrolment
//   carries the duty; live Cambridge teaching runs alongside.
// MARKET NOTE: Mauritius is an offshore financial centre and a
// managed-migration destination — Occupation Permit and Premium Visa
// holders, retirees, fund managers, family offices, and a growing
// remote-work population, alongside textile and manufacturing, a
// large tourism industry, and an ICT/BPO sector centred on Ebène
// Cybercity. Schooling: excellent free state system plus private
// confessional schools, a French network (Lycée Labourdonnais and
// peers), and IB schools such as Le Bocage. Bilingual English and
// French with Kreol widely spoken. Rodrigues and the outer islands
// are further from provision than anywhere on the main island.
// TIMEZONE: MUT (UTC+4), no daylight saving — ONE HOUR AHEAD of
// Nairobi EAT, fixed all year. Mauritian afternoon classes land in
// the Nairobi early afternoon; this is among the easiest scheduling
// relationships we have.
// ═══════════════════════════════════════════════════════════════════

export const MAURITIUS_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'port-louis-mu',
    name: 'Port Louis',
    county: 'Port Louis District',
    region: 'Capital and financial centre · the offshore and global-business sector · the port and the stock exchange · the administrative heart of a country that ranks among the world\'s best at Cambridge examinations',
    primaryKeyword: 'Online school and Cambridge tutoring in Port Louis',
    heroTagline: 'For Port Louis families — live small-group teaching in the examinations Mauritius already leads the world in.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Port Louis families. Mauritius is the one market we serve where Cambridge is not an international alternative but the national system itself: students sit Cambridge International O Level and A and AS Level examinations through the Mauritius Examinations Syndicate, and Mauritian candidates consistently rank among the very best in the world in them. So we are not here to introduce an unfamiliar qualification. We are here for families who want more of it than a timetable allows — a subject the school cannot staff, a Further Mathematics set that does not run, a bridge across a relocation, or simply small-group teaching in the subjects that decide a university place.',
    heroImg: '/heroes/port-louis-mu.jpg',
    altTexts: { hero: 'Port Louis harbour and the Moka range' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Port Louis families — small-group teaching in the examinations Mauritius already leads. From USD 400/month.',
    challenges: [
      'A strong national system in which competition for the best secondary places and grades is intense.',
      'Subjects like Further Mathematics or a third science often do not run for small cohorts.',
      'Schooling is compulsory to sixteen under the Education Act, so the school carries the duty.',
      'Global-business and financial-sector postings move families in and out of Mauritius regularly.',
      'Time zone: Mauritius runs MUT (UTC+4) with no daylight saving — one hour ahead of Nairobi EAT, fixed all year.',
    ],
    familySituations: [
      'Offshore financial services, fund management, and global-business families.',
      'Occupation Permit and Premium Visa holders new to the Mauritian system.',
      'Mauritian families wanting subject depth their school timetable cannot provide.',
      'Families relocating into or out of Mauritius mid-curriculum.',
      'Students targeting UK, South African, French, Indian, or Australian universities.',
      'Households wanting IB or American AP alongside the national Cambridge route.',
    ],
    nearbyAreas: ['Port Louis', 'Beau Bassin-Rose Hill', 'Quatre Bornes', 'Curepipe', 'Pailles', 'Terre Rouge', 'Pamplemousses'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE French, Economics, Business Studies',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Accounting, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and South African, French, Indian, Australian and Mauritian university applications',
    ],
    whyChoose: [
      ['The examinations your country already leads, taught in groups of five', 'Mauritius ranks among the world\'s best at Cambridge. We add small-group live teaching in the subjects where a place is won or lost — not a different qualification.'],
      ['The subject a timetable cannot staff', 'Further Mathematics, a third science, Computer Science for four pupils — routine in a live group drawn from several countries, impossible in one school.'],
      ['One hour ahead, fixed all year', 'Mauritius is an hour ahead of Nairobi with no daylight saving on either side, so afternoon classes land comfortably for both sides every week of the year.'],
      ['Built for a mobile financial sector', 'Global-business postings move; the curriculum, teachers, and examination board stay constant into or out of Mauritius.'],
      ['Respectful of a system that works', 'Mauritian state and confessional schools produce world-leading results. We supplement them; we do not pitch against them.'],
    ],
    growingReason: 'Port Louis is the capital of a country where Cambridge is the national examination system, administered through the Mauritius Examinations Syndicate, and where students consistently rank among the world\'s best in Cambridge O and A Level examinations — alongside an offshore financial and global-business sector that moves families in and out regularly. Mauritius runs MUT (UTC+4), one hour ahead of Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — the national route in Mauritius, and Smartious\'s primary offer: live small-group teaching alongside your school, in the subjects where depth matters most. Examinations sit through established Mauritian provision.',
      cbc: 'Kenya CBC available for Mauritius families with East African ties.',
      ib: 'IB Diploma Programme — for families choosing the IB route available on the island, or wanting support within it.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Mauritius runs one of the better-funded education systems in the region: schooling is free from pre-primary through tertiary, transport has been free since 2005, textbooks for Grades 1 to 9 since 2020, and schooling is compulsory to the age of sixteen under the Education Act. The Act provides for the registration of non-Government schools, with the Minister able to refuse or cancel registration, for quality assurance across primary and secondary schools, and for the recognition and equivalence of qualifications obtained in or outside Mauritius. We are not aware of an established parental-choice home-education route under that Act, and we phrase it that way rather than asserting a categorical prohibition we cannot fully evidence — a family whose plan turns on the point should confirm the current position with the Ministry of Education. What is unrestricted is structured teaching alongside a school enrolment, and in Mauritius that is not a workaround but the natural shape: the school carries the duty and the national Cambridge track, while we add live small-group teaching in the subjects that need it.',
    homeTuitionDetail: 'Smartious delivers to Mauritius families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. With Mauritius one hour ahead of Nairobi and no daylight saving on either side, afternoon and early-evening classes land comfortably for both sides every week of the year, with every session recorded.',
    faqs: [
      { q: 'Why would a Mauritian family need an international curriculum when Cambridge is already the national system?', a: 'They usually do not need a different qualification — and we say so plainly. What families come to us for is depth in the same one: Further Mathematics or a third science that does not run for a small cohort, small-group teaching in the subjects that decide a university place, or continuity when a posting moves the family. Mauritius ranks among the world\'s best at these examinations; we add teaching capacity, not recognition.' },
      { q: 'Is homeschooling legal in Mauritius?', a: 'Schooling is compulsory to sixteen under the Education Act, and we are not aware of an established parental-choice home-education route under it. We put it in those terms rather than asserting a flat prohibition, and would tell any family whose plan depends on it to confirm with the Ministry of Education. Structured teaching alongside a school enrolment is unrestricted.' },
      { q: 'We have just moved here on an Occupation Permit — how does our child transition?', a: 'Usually well, because the national system is Cambridge-based, so a child arriving from a British-curriculum school elsewhere is landing in a familiar examination framework. We often run alongside for the first year or two to smooth subject differences and keep continuity.' },
      { q: 'What are the class times like?', a: 'Mauritius is an hour ahead of Nairobi and neither observes daylight saving, so afternoon and early-evening classes work comfortably for both sides at the same time every week of the year.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'ebene-mu',
    name: 'Ebène, Moka & the Plaines Wilhems',
    county: 'Plaines Wilhems and Moka',
    region: 'Ebène Cybercity and the ICT and BPO sector · global business and fund administration · the smart-city developments and the international-school belt · the island\'s professional heartland',
    primaryKeyword: 'Online school and Cambridge tutoring in Ebène and Moka',
    heroTagline: 'For Ebène, Moka and Plaines Wilhems families — the island\'s professional belt, where competition for grades is the whole game.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families across Ebène, Moka, and the Plaines Wilhems. This is the professional heartland of Mauritius: Ebène Cybercity and the ICT and business-process sector, fund administration and global business, the smart-city developments at Moka, and the belt where much of the island\'s private and international schooling sits, including the IB and French routes. It is also where competition for grades and university places is most intense, in a country that already ranks among the world\'s best at Cambridge examinations. Smartious adds live small-group teaching in the subjects where that competition is decided.',
    heroImg: '/heroes/ebene-mu.jpg',
    altTexts: { hero: 'Ebène Cybercity and the Moka range' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Ebène, Moka and Plaines Wilhems families — subject depth for the island\'s professional belt. From USD 400/month.',
    challenges: [
      'Intense competition for grades and university places in a high-performing national system.',
      'Specialist subjects often do not run for small cohorts even in good schools.',
      'ICT, fund-administration, and global-business postings move families in and out.',
      'Families choosing between the national Cambridge route, the IB, and the French system need subject continuity across whichever they pick.',
      'Time zone: Mauritius runs MUT (UTC+4) with no daylight saving — one hour ahead of Nairobi EAT, fixed all year.',
    ],
    familySituations: [
      'ICT, BPO, and technology-sector families around Ebène Cybercity.',
      'Fund administration, global business, and professional-services families.',
      'Families in the international and IB school belt wanting subject depth alongside.',
      'Occupation Permit holders and returning Mauritian diaspora professionals.',
      'Students targeting competitive university courses in the UK, France, South Africa, or further afield.',
    ],
    nearbyAreas: ['Ebène', 'Moka', 'Quatre Bornes', 'Vacoas-Phoenix', 'Curepipe', 'Réduit', 'Beau Bassin-Rose Hill'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE French, Computer Science, Economics',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Accounting, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and French, South African, Indian, Australian and Mauritian university applications',
    ],
    whyChoose: [
      ['Computing and quantitative depth for a cybercity', 'Cambridge A-Level Computer Science, Mathematics, and Further Mathematics — led by a founder with a BEd in Mathematics and Physics — suit the sector that defines Ebène.'],
      ['The set that does not run at your school', 'Further Mathematics for four pupils is not viable on one timetable and is routine in a live group drawn from several countries.'],
      ['Support inside the IB as well as Cambridge', 'Families on the island\'s IB route get live subject teaching and Extended Essay supervision alongside their school.'],
      ['One hour ahead, fixed all year', 'No daylight saving on either side, so class times never drift.'],
      ['Respectful of a system that works', 'Mauritius produces world-leading Cambridge results. We add teaching capacity where a timetable runs out.'],
    ],
    growingReason: 'Ebène, Moka, and the Plaines Wilhems form the professional heartland of Mauritius — Cybercity\'s ICT and BPO sector, fund administration and global business, the smart-city developments, and much of the island\'s private, international, and IB schooling — with intense competition for grades in a system already among the world\'s best at Cambridge. Mauritius runs MUT (UTC+4), one hour ahead of Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — the national route, and Smartious\'s primary offer: live small-group teaching alongside your school in the subjects where depth decides outcomes.',
      cbc: 'Kenya CBC available for families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside the island\'s IB schools.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies across the Plaines Wilhems: schooling is compulsory to sixteen under the Education Act, which also provides for the registration of non-Government schools and for recognition and equivalence of qualifications obtained in or outside Mauritius. We are not aware of an established parental-choice home-education route under the Act — a position to confirm with the Ministry of Education rather than take from a provider. What we build is teaching alongside the school enrolment, which in a Cambridge-based national system is a natural fit rather than a workaround: the school runs the programme and the examinations, and we supply depth in the subjects a single timetable cannot.',
    homeTuitionDetail: 'Smartious delivers to Plaines Wilhems families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing comfortably for both sides on the fixed one-hour offset, with every session recorded.',
    faqs: [
      { q: 'Our school does not offer Further Mathematics — can you?', a: 'Yes, and it is the most common reason Mauritian families come to us. A set that is unviable for three or four pupils at one school runs routinely in a live group drawn from several countries.' },
      { q: 'We are in the IB, not the national Cambridge route — can you still help?', a: 'Yes: live subject teaching across all six groups, plus Theory of Knowledge and Extended Essay supervision, alongside your school.' },
      { q: 'Where do students sit Cambridge examinations?', a: 'Through established Mauritian provision — this is a Cambridge country with a national examinations body, so sittings are far simpler here than in most markets we serve.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'grand-baie-mu',
    name: 'Grand Baie & the North',
    county: 'Rivière du Rempart and Pamplemousses',
    region: 'The expatriate and residential north · Occupation Permit and Premium Visa households · tourism, hospitality and property · the sailing and remote-work community · a long way from the school belt',
    primaryKeyword: 'Online school and Cambridge tutoring in Grand Baie',
    heroTagline: 'For Grand Baie and northern families — the island\'s expatriate coast, an hour from the school belt and full of families mid-move.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Grand Baie and northern families. The north is where the island\'s international residential community concentrates — Occupation Permit and Premium Visa households, retirees, remote workers, property and hospitality businesses, the sailing and tourism economy from Grand Baie through Pereybère to Cap Malheureux. Many of these families arrive mid-curriculum from South Africa, France, the UK, or India, and many will move again. The schooling belt is largely down in the Plaines Wilhems, which for a northern family means a long daily run. Smartious teaches live to the north, at a fixed one-hour offset from Nairobi.',
    heroImg: '/heroes/grand-baie-mu.jpg',
    altTexts: { hero: 'Grand Baie and the northern coast of Mauritius' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Grand Baie and northern Mauritius families — expatriate coast, far from the school belt. From USD 400/month.',
    challenges: [
      'The main schooling belt is in the Plaines Wilhems, an awkward daily commute from the north.',
      'International families arrive mid-curriculum from several different systems and may move again.',
      'Permit-based residence means households are frequently planning around a defined stay.',
      'Schooling is compulsory to sixteen for children resident in Mauritius.',
      'Time zone: the north runs MUT (UTC+4) with no daylight saving — one hour ahead of Nairobi EAT, fixed all year.',
    ],
    familySituations: [
      'Occupation Permit, Premium Visa, and retiree households along the northern coast.',
      'Property, hospitality, and tourism business families.',
      'Remote-work and sailing-community families.',
      'Families arriving mid-curriculum from South Africa, France, the UK, or India.',
      'Households planning around a defined permit period rather than a whole school career.',
    ],
    nearbyAreas: ['Grand Baie', 'Pereybère', 'Cap Malheureux', 'Trou aux Biches', 'Pamplemousses', 'Goodlands', 'Rivière du Rempart'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE French, Business Studies, Geography',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and South African, French, Indian and Australian university applications',
    ],
    whyChoose: [
      ['No daily run to the Plaines Wilhems', 'Identical live teaching delivered to the north — the commute is the problem we remove.'],
      ['Built for a defined stay', 'Permit-based households planning three or five years keep one curriculum and one examination board across the whole period and beyond it.'],
      ['Continuity for mid-curriculum arrivals', 'A child arriving from South Africa, France, the UK, or India keeps their pathway rather than restarting inside a new one.'],
      ['One hour ahead, fixed all year', 'No daylight saving on either side, so class times never drift.'],
      ['French alongside where it matters', 'Mauritius is bilingual; Cambridge French runs naturally beside the English-medium core for families with French ties.'],
    ],
    growingReason: 'The Mauritian north is where the island\'s international residential community concentrates — Occupation Permit and Premium Visa households, retirees, remote workers, and the tourism, property, and sailing economy from Grand Baie to Cap Malheureux — with the main schooling belt an awkward commute away in the Plaines Wilhems. The north runs MUT (UTC+4), one hour ahead of Nairobi EAT.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the north, delivered live without the commute. Examinations through established Mauritian provision.',
      cbc: 'Kenya CBC available for northern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in the north: schooling is compulsory to sixteen under the Education Act for children resident in Mauritius, and we are not aware of an established parental-choice home-education route under it — a position to confirm with the Ministry of Education. Our arrangement is teaching alongside the school enrolment. For permit-based households it is worth adding that education law follows residence: a family resident in Mauritius is under the Mauritian framework, and one whose residence remains elsewhere follows that country\'s rules, which is a question for their own advisers rather than one we would answer for them.',
    homeTuitionDetail: 'Smartious delivers to northern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS, landing comfortably on the fixed one-hour offset, with every session recorded — which suits households whose year includes travel.',
    faqs: [
      { q: 'The good schools are all in the centre — is a daily commute the only option?', a: 'It has been for many northern families. Identical live teaching delivered to Grand Baie removes the run, with examinations sat through established Mauritian provision.' },
      { q: 'We are here on a permit for three years — does that suit an international pathway?', a: 'It suits it particularly well: one curriculum, one teaching team, and one examination board across the whole period and onward to wherever the family goes next.' },
      { q: 'Our child is arriving mid-curriculum from South Africa or France — what happens?', a: 'They keep their pathway. Because Mauritius runs a Cambridge-based national system, a British-curriculum arrival lands in a familiar framework; for French-system arrivals we usually run alongside for a period to smooth the transition.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const MAURITIUS_COUNTRY = {
  slug: 'mauritius',
  name: 'Mauritius',
  longName: 'Republic of Mauritius',
  adjective: 'Mauritian',
  flag: '🇲🇺',
  hub: '/online-school/mauritius',
  hubPageId: 'homeschooling-mauritius',
  cityPageId: 'mauritius-city',

  currency: 'MUR',
  currencyName: 'Mauritian Rupee',
  currencyPeg: 'Fees are invoiced in USD; rupee equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'MUT',
    name: 'Mauritius Time (UTC+4), no daylight saving',
    utcOffset: '+4',
    offsetFromEAT: '+1 hour ahead, fixed, every week of the year',
  },

  examCentres: ['Cambridge examinations run through established Mauritian provision — this is a Cambridge country with a national examinations body, so sittings are simpler here than in most markets we serve'],
  examCentreTiles: [
    { city: 'Nationwide', centre: 'Established Cambridge provision', area: 'Mauritius administers Cambridge examinations as its national system; arrangements confirmed per family per session.' },
    { city: 'Through your school', centre: 'The usual route', area: 'Most of our Mauritian students sit through their own school, since the national qualifications are the same Cambridge examinations we teach.' },
    { city: 'Private candidates', centre: 'Where needed', area: 'Confirmed per session for families whose subject is not offered by their school.' },
  ],
  examLogisticsProse: 'Mauritius is the easiest examination market in our entire coverage, for one reason: the national qualifications are Cambridge. Students sit Cambridge International O Level and A and AS Level examinations through the Mauritius Examinations Syndicate as their ordinary school-leaving route, and Mauritian candidates consistently rank among the very best in the world in them. For most of our students here that means no parallel calendar at all — the subjects we teach are the subjects their school enters them for, and we are adding teaching capacity rather than a second examination track. Where a family is taking a subject their school does not offer, private-candidate arrangements are confirmed per session. Where a family is on the IB or an American track instead, we plan that calendar separately in the usual way.',
  secondaryProgrammeExamRef: 'Established Mauritian Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge arrangements confirmed per family, per session',

  heroImage: '/heroes/mauritius.jpg',
  heroEyebrow: 'Online school for Mauritius',
  heroH1Suffix: 'Mauritius',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for financial-services, expatriate, and Mauritian families across Port Louis, Ebène and Moka, and Grand Baie. Mauritius already runs Cambridge as its national system and ranks among the best in the world at it — so we are not offering a different qualification. We are offering live small-group teaching in the one you already have, in the subjects a timetable cannot staff.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — one hour ahead of Nairobi, fixed all year.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Mauritius',

  citiesSectionTitle: 'Where our Mauritius families are',
  citiesSectionBody: 'Smartious Mauritius families concentrate across Port Louis (the capital, the offshore financial and global-business sector, and the administrative heart of a Cambridge nation), Ebène and Moka and the Plaines Wilhems (Cybercity\'s ICT and BPO sector, fund administration, the smart-city developments, and much of the island\'s private, international, and IB schooling, where competition for grades is most intense), and Grand Baie and the north (the expatriate and residential coast, permit-based households, the tourism and property economy, and an awkward distance from the school belt). One national Cambridge system, one supplementary role, and the easiest examination logistics we have anywhere.',

  trustSignals: [
    { h: 'An African school teaching African families', p: 'Smartious was founded in Nairobi in 2019 and teaches from two operational centres established 2022 and 2023, serving students in 55 countries — an African school with international accreditation.' },
    { h: 'One hour ahead, fixed all year', p: 'Mauritius runs MUT (UTC+4) and Kenya EAT (UTC+3), with no daylight saving on either side. Afternoon and early-evening classes land comfortably for both sides every week of the year.' },
    { h: 'We do not pretend to bring you recognition', p: 'Cambridge is the national system in Mauritius and Mauritian students rank among the world\'s best in it. We are not introducing an unfamiliar qualification — we add live small-group teaching in the subjects a single timetable cannot staff.' },
    { h: 'The law stated before anything is sold', p: 'Schooling is compulsory to sixteen under the Education Act. We are not aware of an established parental home-education route and say so in those terms, pointing families to the Ministry of Education.' },
  ],

  universitiesInCountry: 'The University of Mauritius at Réduit, the University of Technology Mauritius, the Open University of Mauritius, and a substantial branch-campus sector including institutions from the UK, France, and India — Mauritius has deliberately positioned itself as a regional higher-education hub.',
  universityChannels: 'Because Cambridge O and A Levels are the national qualifications, Mauritian students already hold a globally portable record at the end of school — which is why the island sends students to the UK, France, South Africa, India, Australia, and Canada in unusually high proportions for its size. UCAS reads A-Levels natively; South African, Australian, and Canadian universities read them routinely; French institutions assess them alongside the French-system route many Mauritian families also hold; and Indian universities are a long-standing destination. The Mauritian universities and the branch campuses at Réduit and elsewhere admit on the national Cambridge results directly. Smartious provides personalised university guidance across UK (UCAS), French, South African, Indian, Australian, and US destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Mauritius families — and here it is a supplement to the national system rather than an alternative to it. Cambridge IGCSE and A-Level delivered as live small-group classes at a fixed one-hour offset with no seasonal drift, taught alongside your school in the subjects where a timetable runs out: Further Mathematics, a third science, Computer Science, or simply small-group depth in the subjects that decide a university place. Examinations run through established Mauritian provision, usually via your own school.',
  britishCurriculumSuits: 'Mauritius families wanting depth in the national Cambridge route. Best fit for: (1) students needing a subject their school cannot staff for a small cohort, (2) families in the offshore, ICT, and global-business sectors who move in and out of the island, (3) northern families for whom the school belt is an awkward commute, (4) mid-curriculum arrivals from South Africa, France, the UK, or India, (5) students targeting competitive UK, French, South African, or Australian university courses.',
  britishCurriculumDelivery: 'Live online classes at a fixed one-hour offset, small groups 4-6 students, every session recorded, taught alongside your school.',
  ibDiplomaSuits: 'Mauritius families on the island\'s IB route wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Mauritius families targeting American universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to African and internationally mobile families at online-delivery fees rather than campus ones. Mauritius is an unusual market for us and a welcome one — a country that already runs Cambridge better than most of the world, where our role is depth rather than access.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, which in Mauritius most often means the Further Mathematics and third-science sets that individual school timetables cannot sustain. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Mauritius is the market where we are least willing to position against local schools, because the local schools are genuinely excellent — the state and confessional sector produces Cambridge results among the best in the world, and the private, IB, and French options are strong. Nobody here needs rescuing from their school. What families do run into is a timetable limit: a subject that will not run for four pupils, a set that clashes, a specialist teacher a single school cannot justify. That is the space we occupy, and it is a narrower and more honest one than in most countries we serve.',
  competitors: [
    { name: 'State and confessional secondary schools',       city: 'Nationwide',            curriculum: 'National Cambridge (SC/HSC)',           feesUsd: 'Free or heavily subsidised',                        feesAed: '—',                       rating: 4.7, capacityNote: 'World-leading Cambridge results — genuinely excellent and free' },
    { name: 'Private and international schools',              city: 'Plaines Wilhems, Moka', curriculum: 'Cambridge, IB',                         feesUsd: 'Premium local tier',                                feesAed: 'Varies',                  rating: 4.5, capacityNote: 'Strong provision including IB — competitive places' },
    { name: 'The French network',                             city: 'Curepipe, Port Louis',  curriculum: 'French system',                         feesUsd: 'Premium local tier',                                feesAed: 'Oversubscribed',          rating: 4.5, capacityNote: 'Long-established and well regarded — a different route entirely' },
    { name: 'Private tuition (leçons particulières)',          city: 'Nationwide',            curriculum: 'Exam-focused coaching',                 feesUsd: 'Per hour, per subject',                             feesAed: 'Widespread',              rating: 3.9, capacityNote: 'The default answer to a timetable gap — usually one-to-one, usually unstructured across a year' },
    { name: 'The north',                                      city: 'Grand Baie, Pereybère', curriculum: 'Thin locally',                          feesUsd: 'A commute to the centre',                           feesAed: '—',                       rating: 0,   capacityNote: 'The expatriate coast, an awkward run from the school belt' },
    { name: 'Wolsey Hall Oxford / CambriLearn / King\'s InterHigh (online)', city: 'Online',   curriculum: 'Cambridge self-paced / UK online',      feesUsd: 'Per-subject / GBP 9,000-11,000',                    feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Self-paced or priced far above Smartious — and several pitch Cambridge to Mauritians as though it were foreign here' },
    { name: 'Smartious Homeschool (Mauritius via online delivery)', city: 'Delivered to all Mauritius', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'MUR equivalent at prevailing rate', rating: 4.8, capacityNote: 'Live small-group teaching in the national qualification + the sets a timetable cannot staff + one hour ahead, fixed + honest that we add depth, not recognition' },
  ],

  legalFrameworkIntro: 'Mauritius needs less legal explanation than any country we cover and more context than most, because the interesting fact here is not the law but the qualification. Both are below.',
  legalFramework: [
    { h: 'The fact that shapes everything: Cambridge is the national system', p: 'Mauritian students sit Cambridge International O Level and International A and AS Level examinations as their national school-leaving qualifications, administered through the Mauritius Examinations Syndicate — and Mauritian candidates consistently rank among the very best in the world in them. No other market we serve is like this. It means we are not offering Mauritian families international recognition they lack; they already have the most portable school qualification in the world, earned through their own national system. Any provider pitching Cambridge to a Mauritian parent as an exotic upgrade has not understood the country.' },
    { h: 'The governing statute, and what it covers', p: 'The Education Act (Act 39 of 1957, as amended) governs. It provides for the registration of non-Government schools, with the Minister able to refuse registration or cancel it on defined grounds; for the promotion and maintenance of quality standards in primary and secondary schools through an appropriate quality-assurance mechanism; for the more effective teaching and spread of English; and for the recognition and equivalence of qualifications obtained in or outside Mauritius in the primary and secondary sector. Schooling is compulsory to the age of sixteen.' },
    { h: 'A genuinely well-funded system, described honestly', p: 'Education in Mauritius is free from pre-primary through tertiary. Transport has been free for all students since 2005; textbooks for Grades 1 to 9 have been free since 2020; the state has long subsidised much of the expenditure of the private confessional schools. Combined with the Cambridge results, that adds up to a system that outperforms almost everything around it, and we would rather say so than manufacture a problem. The problems Mauritian families actually bring us are narrower and real: a subject set that will not run, a commute from the north, a mid-curriculum arrival, a posting that will move again.' },
    { h: 'Home education: what we can and cannot say', p: 'We are not aware of an established parental-choice home-education route under the Education Act, and we phrase it that way rather than asserting a categorical prohibition we cannot fully evidence. A family whose plan turns on the point should confirm the current position with the Ministry of Education. What is unrestricted is structured teaching alongside a school enrolment — which in a Cambridge-based national system is not a workaround but the obvious shape, since the subjects we teach are the subjects the school enters students for.' },
    { h: 'Where our teaching actually fits', p: 'In three places, and we would not claim a fourth. First, subjects a single timetable cannot sustain: Further Mathematics, a third science, Computer Science for a handful of pupils. Second, geography — the school belt sits in the Plaines Wilhems and the international residential community sits in the north, and the daily run between them is a real cost. Third, mobility: the offshore, global-business, and permit-based population moves in and out of Mauritius constantly, and one live pathway across the whole period is worth more than the best local option a family will leave in three years.' },
    { h: 'Where the qualifications lead', p: 'Further than most countries manage, and Mauritian families know it. UCAS reads A-Levels natively; South African, Australian, Canadian, and Indian universities read them routinely; French institutions assess them alongside the French-system route many families here also hold; and the Mauritian universities and the branch campuses admit on the national Cambridge results directly. A student finishing here with strong Cambridge grades, English and French, and a live-taught specialist subject or two is competitive almost anywhere.' },
  ],

  whySmartious: [
    { h: 'Honest about what we add, and what we do not',                    p: 'Cambridge is your national system and Mauritius leads the world in it. We add live small-group teaching in the sets a timetable cannot staff — not recognition you already have.' },
    { h: 'The subject your school cannot run',                              p: 'Further Mathematics or a third science for four pupils is unviable on one timetable and routine in a live group drawn from several countries.' },
    { h: 'No commute from the north',                                       p: 'The school belt is in the Plaines Wilhems and much of the international community is in Grand Baie. Live delivery removes the run.' },
    { h: 'One hour ahead, fixed all year',                                  p: 'No daylight saving on either side, so class times never drift — the easiest scheduling relationship in our coverage.' },
    { h: 'Built for a permit-based stay',                                   p: 'Three years or five, one curriculum and one examination board across the whole period and onward to wherever the family goes next.' },
    { h: 'The easiest examinations we handle anywhere',                     p: 'Because the national qualifications are Cambridge, most of our Mauritian students sit through their own school with no parallel calendar at all.' },
  ],

  faqs: [
    { q: 'Cambridge is already our national system — what would we need Smartious for?', a: 'Usually not for the qualification, and we say so plainly. Families come to us for depth in the same one: a subject their school cannot staff for a small cohort, small-group teaching in the sets that decide a university place, no commute from the north, or continuity when a posting moves them. Mauritius ranks among the world\'s best at these examinations; we add teaching capacity, not recognition.' },
    { q: 'Is homeschooling legal in Mauritius?', a: 'Schooling is compulsory to sixteen under the Education Act, and we are not aware of an established parental-choice home-education route under it. We put it in those terms rather than asserting a flat prohibition, and would point any family whose plan depends on it to the Ministry of Education. Structured teaching alongside a school enrolment is unrestricted.' },
    { q: 'Where do our children sit the examinations?', a: 'Usually through their own school, because the national qualifications are the same Cambridge examinations we teach — administered through the Mauritius Examinations Syndicate. Private-candidate arrangements are confirmed per session where a subject is not offered locally.' },
    { q: 'We are arriving on an Occupation Permit mid-curriculum — how hard is the transition?', a: 'Easier than almost anywhere, because the national system is Cambridge-based: a child coming from a British-curriculum school lands in a familiar framework. For French-system or American arrivals we usually run alongside for a period to smooth the differences.' },
    { q: 'We live in Grand Baie — is the daily commute to the Plaines Wilhems avoidable?', a: 'Yes for the teaching. Identical live classes reach the north, with examinations sat through established Mauritian provision.' },
    { q: 'How do class times work from Nairobi?', a: 'Mauritius is one hour ahead of Kenya and neither observes daylight saving, so afternoon and early-evening classes land comfortably for both sides at the same time every week of the year.' },
    { q: 'Can our child study the IB or American curriculum instead?', a: 'Yes — live IB Diploma teaching across all six groups with Theory of Knowledge and Extended Essay supervision, or the American Curriculum with AP and SAT/ACT preparation, alongside or instead of the Cambridge route.' },
    { q: 'Which parts of Mauritius does Smartious cover?', a: 'Port Louis, Ebène and Moka and the Plaines Wilhems, and Grand Baie and the north have dedicated pages. Live online delivery works identically anywhere on the island and in Rodrigues.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us which subjects your school offers and which it does not: in Mauritius that is almost always the real question, and it belongs at the start of the conversation.',
}
