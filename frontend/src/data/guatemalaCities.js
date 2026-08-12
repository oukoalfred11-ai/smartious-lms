// ═══════════════════════════════════════════════════════════════════
// GUATEMALA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for corporate, development-sector, expatriate, and
// Guatemalan families across Guatemala City, Antigua, Quetzaltenango,
// Petén and Puerto Barrios.
// TWELFTH LATIN AMERICAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// LEGAL POSITIONING NOTE — HEDGE FIRMLY. SOURCING IS THIN:
// - We could NOT verify Guatemalan home-education law against a
//   primary instrument. The available indication is secondary
//   commentary placing Guatemala among Central American countries
//   where homeschooling is NOT REGULATED — no specific policies and
//   no legal framework clearly defining families' rights and
//   obligations, though families may educate at home.
// - PHRASE ACCORDINGLY EVERY TIME: "we are not aware of a specific
//   framework", "reported as not specifically regulated", plus
//   "confirm with MINEDUC". NEVER assert permitted, NEVER assert
//   prohibited.
// - What we can state: education is administered by the MINISTERIO
//   DE EDUCACIÓN (MINEDUC); education is compulsory at the primary
//   and basic levels; private schools operate with MINEDUC
//   authorisation. State the compulsory range generally and route
//   families to MINEDUC rather than quoting unverified ages.
// - Smartious is NOT a MINEDUC-authorised institution and says so.
// - REUSE THE PANAMA ARGUMENT, IT IS SOUND AND TRANSFERS: an absence
//   of regulation is an absence of protection rather than a
//   permission. Draw the contrast with Ecuador (names and regulates)
//   and Costa Rica (ministry explicitly rejects) — three different
//   Central American silences, three different risks.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT, stated firmly
//   precisely because the framework is unclear.
// TIMEZONE — TIED WITH MEXICO AND COSTA RICA AS OUR HARDEST: CST
// (UTC-6), no daylight saving — NINE HOURS behind Nairobi. Our
// Two teaching teams in different time zones = classes available
// across the full day. A 07:00 Guatemalan class is 16:00 Nairobi. State
// plainly. Guatemalan schools commonly run jornada matutina and
// vespertina, so a vespertina student has mornings free.
// MARKET NOTE: Guatemala City holds a strong international tier —
// Colegio Americano de Guatemala, the American School, Colegio
// Maya, Colegio Interamericano, the German school (Colegio Alemán),
// the Lycée Français — with substantial IB and American provision
// and fees at the top of the Central American market. Antigua hosts
// a large expatriate, Spanish-language-school and NGO community.
// Quetzaltenango (Xela) is the second city and a highland commercial
// and university centre with its own long-standing NGO and language-
// school presence. Petén runs tourism around Tikal plus agriculture.
// Puerto Barrios and Izabal hold the Atlantic port, banana
// plantations and the Caribbean coast. Guatemala has one of the
// largest development and NGO sectors in Central America and a very
// large diaspora in the United States.
// ═══════════════════════════════════════════════════════════════════

export const GUATEMALA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'guatemala-city-gt',
    name: 'Guatemala City',
    county: 'Guatemala Department',
    region: 'The capital and corporate centre of Central America\'s largest economy · one of the region\'s biggest development and NGO communities · a strong international school tier at premium fees',
    primaryKeyword: 'Online school and international curriculum in Guatemala City',
    heroTagline: 'For Guatemala City families — the capital tier\'s examinations at a fraction of its fees, taught in your morning.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Guatemala City families. The capital carries the corporate weight of Central America\'s largest economy, one of the region\'s biggest development and NGO communities, the diplomatic sector, and an international school tier to match — the Colegio Americano, Colegio Maya, Colegio Interamericano, the German and French schools — with substantial IB and American provision and fees at the top of the Central American market. On home education Guatemala is one of the markets where we know least, and we say so rather than filling the gap with confident prose.',
    heroImg: '/heroes/guatemala-city-gt.jpg',
    altTexts: { hero: 'Guatemala City and the volcanoes' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Guatemala City families — the capital tier\'s curriculum at a fraction of its fees. From USD 400/month.',
    challenges: [
      'International school fees in Guatemala City sit at the top of the Central American market.',
      'Development and NGO postings arrive and depart on programme timelines rather than admission cycles.',
      'We could not verify Guatemala\'s position on home education from a primary instrument.',
      'Private schools operate with MINEDUC authorisation, and Smartious is not one.',
      'Time zone: Guatemala runs CST (UTC-6) with no daylight saving — a fixed nine-hour gap, so our classes land in the Guatemalan morning.',
    ],
    familySituations: [
      'Corporate, banking, and professional families outside the international tier\'s fees.',
      'Development, NGO, and international-organisation households on rotation.',
      'Diplomatic families posted to the region\'s largest aid hub.',
      'Students in jornada vespertina whose mornings are free.',
      'Returning diaspora families from the United States settling children mid-curriculum.',
      'Students targeting US, Spanish, UK, or Guatemalan universities.',
    ],
    nearbyAreas: ['Zona 10 and 14', 'Zona 15 Vista Hermosa', 'Carretera a El Salvador', 'Mixco', 'San Lucas Sacatepéquez', 'Fraijanes', 'Villa Nueva'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, French, German and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Guatemalan university applications',
    ],
    whyChoose: [
      ['A fee gap against the top of the Central American market', 'Live small-group teaching at USD 2,160-6,480 a year against a capital tier priced at regional records.'],
      ['Built for a development posting', 'NGO and programme postings move; the curriculum, teachers, and examination board continue unchanged to the next country.'],
      ['Morning classes, the only option at nine hours', 'A seven o\'clock Guatemalan class is four in the afternoon for our teachers. Both morning and after-school blocks are available, since we run two teaching teams in different time zones.'],
      ['Honest where we cannot verify', 'We could not establish Guatemala\'s home-education position from a primary instrument, and we report that rather than guessing in either direction.'],
      ['Spanish kept alongside', 'Cambridge Spanish runs beside the English-medium core, protecting Guatemalan and Spanish university routes.'],
    ],
    growingReason: 'Guatemala City carries the corporate weight of Central America\'s largest economy, one of the region\'s biggest development and NGO communities, and an international school tier with substantial IB and American provision at the top of the regional market. Guatemala runs CST (UTC-6), nine hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Guatemala City families, taught in the Guatemalan morning alongside a school enrolment. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Guatemala City families with East African ties — a common profile in the development community.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the capital\'s IB schools.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Guatemala is one of the markets where we know least, and we would rather open with that than write around it. What we can state: education is administered by the Ministerio de Educación, MINEDUC; education is compulsory at the primary and basic levels, with the current age boundaries worth confirming with the ministry rather than taken from a provider; and private schools operate with MINEDUC authorisation, which Smartious does not hold. What we could not establish is Guatemala\'s position on parental home education. The indication available to us is secondary commentary placing Guatemala among Central American countries where homeschooling is not regulated — no specific policies and no legal framework clearly defining the rights and obligations of families who choose it, though families may in practice educate at home. That is thin sourcing for a consequential question, and we will not build on it: we will not tell you home education is permitted in Guatemala, and we will not tell you it is prohibited. Both would exceed what we can evidence. What we would say is what we say in Panama: an absence of regulation is an absence of protection rather than a permission. Where a matter is regulated — as in Ecuador, whose ministry names and regulates the modality — a family knows what compliance looks like and can demonstrate it. Where it is unaddressed, there is nothing to demonstrate and no framework to rely on if the question is ever raised. Put the question to MINEDUC directly before acting. Our own arrangement raises none of it: live Cambridge or IB teaching alongside a Guatemalan school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Guatemala City families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Guatemalan morning. With a fixed nine-hour gap and no daylight saving on either side, a 07:00-10:00 Guatemalan block sits in our normal late-afternoon teaching hours every week of the year, with all sessions recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Guatemala?', a: 'We could not verify a position from a primary Guatemalan instrument and will not guess. Education is compulsory at primary and basic levels and administered by MINEDUC; the available indication is secondary commentary placing Guatemala among countries where home education is not specifically regulated. An absence of regulation is not a permission — put the question to MINEDUC directly.' },
      { q: 'Is Smartious a MINEDUC-authorised institution?', a: 'No, and we say so plainly. Private schools operate with MINEDUC authorisation. We work alongside a Guatemalan school that holds it, and teach Cambridge, Edexcel, IB and AP qualifications.' },
      { q: 'Nine hours — how does this work?', a: 'In one direction. Classes are available across the day, including after-school, because we run two teaching teams in different time zones. For a student in jornada vespertina, whose school runs in the afternoon, mornings are free and it works cleanly.' },
      { q: 'How do the fees compare with the capital tier?', a: 'Guatemala City\'s international fees sit at the top of the Central American market. Smartious runs USD 2,160-6,480 a year for live small-group teaching toward the same Cambridge examinations.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'antigua-gt',
    name: 'Antigua Guatemala',
    county: 'Sacatepéquez',
    region: 'A UNESCO colonial city with an unusually large expatriate community for its size · Spanish-language schools drawing students worldwide · a substantial NGO and development presence · a growing remote-work population',
    primaryKeyword: 'Online school and international curriculum in Antigua Guatemala',
    heroTagline: 'For Antigua families — a small colonial city with an outsized international community, and very little schooling built for it.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Antigua families. Few towns of Antigua\'s size anywhere carry an international community like this one: a UNESCO colonial centre that draws Spanish-language students from around the world, a long-established NGO and development presence, a growing remote-work and lifestyle-migration population, and hospitality and coffee businesses owned by families from North America and Europe who came and stayed. Guatemala City\'s international schools are an hour away over a mountain road. Smartious teaches Cambridge and IB live to Antigua in the Guatemalan morning.',
    heroImg: '/heroes/antigua-gt.jpg',
    altTexts: { hero: 'Antigua Guatemala and Volcán de Agua' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Antigua Guatemala families — a large expat community, little local schooling. From USD 400/month.',
    challenges: [
      'An outsized international community for the town\'s size, with little schooling built for it.',
      'Guatemala City is an hour away over a mountain road — a daily commute few want.',
      'A transient NGO and language-school population alongside settled families.',
      'We could not verify Guatemala\'s position on home education from a primary instrument.',
      'We teach nine hours ahead, so our classes land in the Guatemalan morning.',
    ],
    familySituations: [
      'NGO, development, and mission-sector families based in Antigua.',
      'Remote-work and lifestyle-migration households.',
      'Hospitality, coffee, and tourism business owners from North America and Europe.',
      'Long-settled expatriate families with school-age children.',
      'Students in jornada vespertina with mornings free.',
    ],
    nearbyAreas: ['Antigua Guatemala', 'Ciudad Vieja', 'Jocotenango', 'San Lucas Sacatepéquez', 'Santa María de Jesús', 'Lake Atitlán and Panajachel', 'Chimaltenango'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, French, German and home language support',
      'Cambridge A-Level Mathematics, Biology, Chemistry, History, Geography',
      'Cambridge A-Level Economics, Business, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP World History',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Guatemalan university applications',
    ],
    whyChoose: [
      ['No mountain-road commute', 'Guatemala City is an hour each way on a road nobody wants to drive twice a day. Live delivery removes it for the child entirely.'],
      ['A record that travels home again', 'Many Antigua families will return to North America or Europe. Cambridge and AP records are read directly by universities there.'],
      ['Reaches Atitlán and the highlands too', 'Panajachel, San Marcos and the lake communities get identical live teaching.'],
      ['Morning classes that fit the jornada vespertina', 'Our block lands in the Guatemalan morning, free for every afternoon-shift student.'],
      ['Honest where we cannot verify', 'We could not establish Guatemala\'s home-education position and say so rather than guessing.'],
    ],
    growingReason: 'Antigua carries an international community out of all proportion to its size — a UNESCO colonial centre drawing Spanish-language students worldwide, a long-established NGO and development presence, a growing remote-work population, and expatriate-owned hospitality and coffee businesses — with Guatemala City an hour away over a mountain road. Guatemala runs CST (UTC-6), nine hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Antigua and the highlands, taught in the Guatemalan morning alongside a school enrolment.',
      cbc: 'Kenya CBC available for Antigua families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for the many North American families here targeting US universities.',
    },
    homeschoolDetail: 'The national picture applies in Sacatepéquez, and Antigua families deserve the careful version because more of them consider educating outside school than in most Guatemalan communities. Education is compulsory at primary and basic levels and administered by MINEDUC, and private schools operate with MINEDUC authorisation. We could not verify Guatemala\'s position on parental home education against a primary instrument; the available indication is secondary commentary placing the country among those where it is not specifically regulated, with no framework clearly defining families\' rights and obligations. We decline to read that as permission or prohibition. It is worth adding the point we make in Panama: an absence of rules is also an absence of protection, and where a matter is unaddressed there is nothing for a family to demonstrate if the question is ever raised. Contrast Ecuador, where the ministry names and regulates the modality and families know exactly what compliance requires. Put the question to MINEDUC before acting. Families resident elsewhere follow their country of residence\'s framework, a common question in a town with this much international movement.',
    homeTuitionDetail: 'Smartious delivers to Antigua families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Guatemalan morning on a fixed nine-hour offset, with every session recorded — which suits households that set their own schedule.',
    faqs: [
      { q: 'Is the drive into Guatemala City really the alternative?', a: 'For many Antigua families it has been — an hour each way over a mountain road, twice a day. Live delivery removes it for the child, with examination travel a few times a year.' },
      { q: 'We may return to the US or Europe — does that affect the choice?', a: 'It affects the qualification. Cambridge and AP records are read directly by universities there, whereas a purely local or informal record requires equivalence assessment.' },
      { q: 'Do you reach the Lake Atitlán communities?', a: 'Yes — Panajachel, San Marcos and the lake towns get identical live teaching, which matters given how dispersed that community is.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'quetzaltenango-gt',
    name: 'Quetzaltenango (Xela)',
    county: 'Quetzaltenango Department',
    region: 'The second city and highland commercial capital · a major university centre · a long-standing NGO, medical-mission and language-school presence · minimal international schooling',
    primaryKeyword: 'Online school and international curriculum in Quetzaltenango',
    heroTagline: 'For Xela and western highland families — Guatemala\'s second city, four hours from the capital and outside its school map entirely.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Quetzaltenango families. Xela is Guatemala\'s second city and the commercial capital of the western highlands — a major university centre with medical and engineering faculties, a long-standing NGO, medical-mission and Spanish-language-school presence that brings international staff and volunteers through year after year, and a highland agricultural and textile economy. It is also four hours from the capital, which puts the country\'s international schooling firmly out of reach. Smartious teaches Cambridge and IB live across the western highlands.',
    heroImg: '/heroes/quetzaltenango-gt.jpg',
    altTexts: { hero: 'Quetzaltenango and the western highlands' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Quetzaltenango and western highland families — second city, no international provision. From USD 400/month.',
    challenges: [
      'Minimal international schooling in the second city, four hours from the capital.',
      'A substantial NGO, medical-mission and language-school community with no schooling built for it.',
      'University and professional families with children aiming at competitive courses.',
      'We could not verify Guatemala\'s position on home education from a primary instrument.',
      'We teach nine hours ahead, so our classes land in the Guatemalan morning.',
    ],
    familySituations: [
      'NGO, development, and medical-mission families based in the highlands.',
      'University faculty, research, and medical-faculty households.',
      'Highland agricultural, textile, and commercial business families.',
      'Spanish-language-school and volunteer-sector staff with children.',
      'Students in jornada vespertina with mornings free.',
    ],
    nearbyAreas: ['Quetzaltenango', 'Salcajá', 'San Marcos', 'Totonicapán', 'Huehuetenango', 'Retalhuleu', 'Momostenango'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Physics, Geography',
      'Cambridge A-Level Economics, Business, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Chemistry, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Guatemalan university applications',
    ],
    whyChoose: [
      ['The complete option four hours from the tier', 'Identical live delivery in Xela and Guatemala City — no relocation, no boarding decision.'],
      ['Pre-medical depth for a medical-faculty city', 'Cambridge A-Level Biology and Chemistry with Mathematics — the classic spine, and one Xela families aim at in numbers given the city\'s medical sector.'],
      ['Built for the development community', 'NGO and mission postings move; the curriculum, teachers, and examination board continue unchanged to the next country.'],
      ['Morning classes that fit the jornada vespertina', 'Our block lands in the Guatemalan morning, free for every afternoon-shift student.'],
      ['Honest where we cannot verify', 'We could not establish Guatemala\'s home-education position and say so.'],
    ],
    growingReason: 'Quetzaltenango is Guatemala\'s second city and the commercial capital of the western highlands — a major university centre with medical and engineering faculties, a long-standing NGO, medical-mission and language-school presence, and a highland agricultural economy — four hours from the capital and outside its school map. Guatemala runs CST (UTC-6), nine hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the western highlands, taught in the Guatemalan morning alongside a school enrolment.',
      cbc: 'Kenya CBC available for highland families with East African ties — common in the development sector.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the western highlands: education is compulsory at primary and basic levels and administered by MINEDUC, private schools operate with MINEDUC authorisation, and we could not verify Guatemala\'s position on parental home education against a primary instrument — the available indication being secondary commentary placing the country among those where it is not specifically regulated. We decline to read that silence as permission or prohibition and would send any family whose plan depends on it to MINEDUC directly, noting that an absence of rules is also an absence of protection. Smartious is not a MINEDUC-authorised institution. Internationally posted development and mission families who are not resident in Guatemala follow their own country\'s framework, a question for their advisers.',
    homeTuitionDetail: 'Smartious delivers to highland families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Guatemalan morning on a fixed nine-hour offset, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Xela?', a: 'Minimal, with the capital four hours east. Live online delivery reaches the whole western highlands identically.' },
      { q: 'We are here on an NGO or medical-mission posting — does the schooling follow?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next country, with examinations sat at authorised centres wherever the family is.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'peten-gt',
    name: 'Petén & Flores',
    county: 'Petén Department',
    region: 'The Tikal and Maya Biosphere region · an international tourism, archaeology and conservation community · agriculture and cattle across the lowlands · the most remote department in the country',
    primaryKeyword: 'Online school and international curriculum in Petén and Flores',
    heroTagline: 'For Petén and Flores families — archaeology, conservation and tourism in the rainforest, five hundred kilometres from any international school.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Petén families. The northern department runs an economy unlike anywhere else in Guatemala: Tikal and the Maya Biosphere Reserve draw international archaeology, conservation and research staff on multi-year projects; a substantial tourism and hospitality industry works around Flores and Lake Petén Itzá; and agriculture and cattle occupy the lowlands. It is also the country\'s most remote department, with Guatemala City around five hundred kilometres south. International schooling here does not exist. Smartious teaches Cambridge and IB live to the Petén.',
    heroImg: '/heroes/peten-gt.jpg',
    altTexts: { hero: 'Lake Petén Itzá and the Petén rainforest' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Petén and Flores families — Tikal, conservation and tourism, no international schooling. From USD 400/month.',
    challenges: [
      'No international schooling in the country\'s most remote department.',
      'Guatemala City is around five hundred kilometres south.',
      'International archaeology and conservation staff arrive on project timelines.',
      'We could not verify Guatemala\'s position on home education from a primary instrument.',
      'We teach nine hours ahead, so our classes land in the Guatemalan morning.',
    ],
    familySituations: [
      'Archaeology, conservation, and research families on multi-year projects.',
      'Tourism, hospitality, and lodge business households around Flores and Tikal.',
      'Agricultural and cattle-sector families across the lowlands.',
      'NGO and biosphere-management staff.',
      'Students aiming at archaeology, environmental science, or biology programmes abroad.',
    ],
    nearbyAreas: ['Flores', 'Santa Elena', 'San Benito', 'Tikal', 'El Remate', 'Sayaxché', 'Melchor de Mencos'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Biology, Geography, History, Chemistry, Mathematics',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP World History',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Guatemalan university applications',
    ],
    whyChoose: [
      ['The only realistic option in the department', 'Identical live delivery in Flores and Guatemala City — five hundred kilometres closed by a connection rather than a move.'],
      ['History, biology and environmental science that fit the place', 'Tikal and the Maya Biosphere make unusually serious context for Cambridge History, Biology and Geography and AP Environmental Science.'],
      ['Built for a project posting', 'Archaeology and conservation contracts move; the curriculum, teachers, and examination board continue unchanged to the next country.'],
      ['Morning classes that fit the jornada vespertina', 'Our block lands in the Guatemalan morning, free for every afternoon-shift student.'],
      ['Honest where we cannot verify', 'We could not establish Guatemala\'s home-education position and say so.'],
    ],
    growingReason: 'Petén runs Tikal and the Maya Biosphere Reserve with their international archaeology, conservation and research community, a tourism industry around Flores and Lake Petén Itzá, and lowland agriculture — as the country\'s most remote department, five hundred kilometres from the capital and with no international schooling. Guatemala runs CST (UTC-6), nine hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Petén, taught in the Guatemalan morning alongside a school enrolment. Examination sittings planned per session with travel scheduled well ahead.',
      cbc: 'Kenya CBC available for Petén families with East African ties — common among conservation staff.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the Petén: education is compulsory at primary and basic levels and administered by MINEDUC, and we could not verify Guatemala\'s position on parental home education against a primary instrument, the available indication being secondary commentary placing the country among those where it is not specifically regulated. We decline to read that as permission or prohibition, and note that an absence of rules is also an absence of protection. Put the question to MINEDUC. For families on international project postings who remain resident elsewhere, their country of residence\'s framework applies — a question for their own advisers and one that arises constantly in a conservation and archaeology community. Smartious is not a MINEDUC-authorised institution.',
    homeTuitionDetail: 'Smartious delivers to Petén families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Guatemalan morning on a fixed nine-hour offset, with every session recorded — built for remote sites and field seasons.',
    faqs: [
      { q: 'Is there any international schooling in the Petén?', a: 'None — Guatemala City is around five hundred kilometres south. Live delivery is the only route that reaches the department without sending a child away.' },
      { q: 'We are on an archaeology or conservation project — does the schooling follow?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next country, with examinations sat at authorised centres wherever the family is.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'puerto-barrios-gt',
    name: 'Puerto Barrios & Izabal',
    county: 'Izabal Department',
    region: 'The Atlantic port complex handling most of the country\'s trade · banana and palm-oil plantations · Río Dulce and Lívingston\'s Garífuna coast · a cruising and marine community',
    primaryKeyword: 'Online school and international curriculum in Puerto Barrios',
    heroTagline: 'For Puerto Barrios and Izabal families — the port that moves Guatemala\'s trade, and a marine community with nowhere to school.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Izabal families. The Atlantic department carries Puerto Barrios and Santo Tomás de Castilla — the port complex through which most Guatemalan trade passes — alongside the banana and palm-oil plantations that supply European and North American markets, and the Río Dulce cruising community where sailors from across the Americas keep boats and, increasingly, live year-round. Guatemala City is around five hours west. International schooling in the department does not exist. Smartious teaches Cambridge and IB live to the Atlantic coast.',
    heroImg: '/heroes/puerto-barrios-gt.jpg',
    altTexts: { hero: 'Río Dulce and the Guatemalan Caribbean coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Puerto Barrios, Río Dulce and Izabal families — the Atlantic port and marine community, no provision. From USD 400/month.',
    challenges: [
      'No international schooling in the department, with Guatemala City around five hours west.',
      'A port and plantation economy trading globally with schooling built for a provincial town.',
      'A cruising and marine community that moves between countries by sea.',
      'We could not verify Guatemala\'s position on home education from a primary instrument.',
      'We teach nine hours ahead, so our classes land in the Guatemalan morning.',
    ],
    familySituations: [
      'Port, container terminal, and shipping-agency families.',
      'Banana, palm-oil, and agro-export plantation households.',
      'Río Dulce cruising, marina, and marine-services families.',
      'Garífuna coast tourism and hospitality businesses.',
      'Students in jornada vespertina with mornings free.',
    ],
    nearbyAreas: ['Puerto Barrios', 'Santo Tomás de Castilla', 'Río Dulce', 'Lívingston', 'Morales', 'El Estor', 'the Honduran border'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Mathematics, Economics, Business, Biology, Geography',
      'Cambridge A-Level Chemistry, Physics, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Microeconomics, AP Biology, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Guatemalan university applications',
    ],
    whyChoose: [
      ['Schooling that survives a cruising life', 'Río Dulce families who move between countries by sea keep one curriculum and one examination board across every passage — the case our yachting families in Tivat and the Caribbean already run.'],
      ['The complete option in a department with none', 'Identical live delivery in Puerto Barrios and Guatemala City, five hours west.'],
      ['Business and economics for a port economy', 'Cambridge A-Level Economics, Business and Mathematics suit the families who move Guatemala\'s trade.'],
      ['Morning classes that fit the jornada vespertina', 'Our block lands in the Guatemalan morning, free for every afternoon-shift student.'],
      ['Honest where we cannot verify', 'We could not establish Guatemala\'s home-education position and say so.'],
    ],
    growingReason: 'Izabal carries Puerto Barrios and Santo Tomás de Castilla — the port complex handling most Guatemalan trade — alongside banana and palm-oil plantations supplying European and North American markets and the Río Dulce cruising community, with no international schooling and Guatemala City five hours west. Guatemala runs CST (UTC-6), nine hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Atlantic coast, taught in the Guatemalan morning alongside a school enrolment and portable for cruising families.',
      cbc: 'Kenya CBC available for Izabal families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Izabal: education is compulsory at primary and basic levels and administered by MINEDUC, private schools operate with MINEDUC authorisation, and we could not verify Guatemala\'s position on parental home education against a primary instrument — the available indication being secondary commentary placing the country among those where it is not specifically regulated. We decline to read that as permission or prohibition and would send families to MINEDUC. For the Río Dulce cruising community the residency question arises constantly: education law follows residence rather than where a boat is berthed, and households registered in the United States, Canada or Europe follow those frameworks, which differ sharply. That is a question for their own advisers. Smartious is not a MINEDUC-authorised institution.',
    homeTuitionDetail: 'Smartious delivers to Izabal families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Guatemalan morning on a fixed nine-hour offset, with the full recorded library built for passages and remote anchorages.',
    faqs: [
      { q: 'We keep a boat at Río Dulce and move between countries — does the schooling follow?', a: 'Yes: the same curriculum, teachers, and examination board continue wherever the family is, with examinations sat at authorised centres. Only the local legal framework changes, and which one applies turns on residence rather than where the boat is berthed.' },
      { q: 'Is there international schooling in Izabal?', a: 'None — Guatemala City is around five hours west. Live delivery reaches the whole department identically.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const GUATEMALA_COUNTRY = {
  slug: 'guatemala',
  name: 'Guatemala',
  longName: 'Republic of Guatemala',
  adjective: 'Guatemalan',
  flag: '🇬🇹',
  hub: '/online-school/guatemala',
  hubPageId: 'homeschooling-guatemala',
  cityPageId: 'guatemala-city-page',

  currency: 'GTQ',
  currencyName: 'Guatemalan Quetzal',
  currencyPeg: 'Fees are invoiced in USD, which is widely used in Guatemala for larger commitments; quetzal equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'CST',
    name: 'Central Standard Time (UTC-6), no daylight saving',
    utcOffset: '-6',
    offsetFromEAT: '-9 hours — our teaching lands in the Guatemalan morning, fixed all year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Guatemala has established Cambridge provision through its international school sector'],
  examCentreTiles: [
    { city: 'Guatemala City', centre: 'Authorised provision', area: 'The country\'s external-candidate capacity, confirmed per family per session.' },
    { city: 'Antigua and the highlands', centre: 'Planned per session', area: 'Sacatepéquez and Quetzaltenango families plan travel into each window ahead.' },
    { city: 'Petén and Izabal', centre: 'Planned well ahead', area: 'Northern and Atlantic families plan sittings with travel scheduled several weeks in advance.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Guatemala-based students sit as external candidates at authorised provision, with capacity confirmed per family per session — Guatemala City is checked first, with travel planned ahead from Antigua, Quetzaltenango, the Petén and Izabal. The country\'s geography makes that a real consideration: Petén is around five hundred kilometres north of the capital and Izabal five hours east, so those families plan sittings several weeks in advance. Note what does not change: our arrangement runs alongside a Guatemalan school, which continues its own national track unchanged. Smartious is not a MINEDUC-authorised institution, and the qualifications we teach carry Cambridge, Pearson Edexcel, IB, or AP validity rather than Guatemalan official recognition.',
  secondaryProgrammeExamRef: 'Authorised Guatemalan Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/guatemala.jpg',
  heroEyebrow: 'Online school for Guatemala',
  heroH1Suffix: 'Guatemala',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for corporate, development-sector, expatriate, and Guatemalan families across Guatemala City, Antigua, Quetzaltenango, Petén, and Izabal. Guatemala is one of the markets where we know least on home education, and we say so rather than guessing. We teach nine hours ahead, so our classes land in the Guatemalan morning.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — morning teaching, alongside your school.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Guatemala',

  citiesSectionTitle: 'Where our Guatemala families are',
  citiesSectionBody: 'Smartious Guatemala families concentrate across Guatemala City (the corporate capital of Central America\'s largest economy, one of the region\'s biggest development communities, and an international tier at the top of the regional market), Antigua (a UNESCO colonial city with an international community out of all proportion to its size), Quetzaltenango (the second city and highland university centre, four hours from the capital), Petén and Flores (Tikal, the Maya Biosphere and an international archaeology and conservation community five hundred kilometres north), and Puerto Barrios and Izabal (the Atlantic port complex and the Río Dulce cruising community). One regulatory silence we decline to interpret, and one morning teaching window.',

  trustSignals: [
    { h: 'We say when we cannot verify something', p: 'We could not establish Guatemala\'s home-education position from a primary instrument. Rather than guessing in either direction, we report what the available commentary indicates, note that an absence of regulation is not a permission, and send families to MINEDUC.' },
    { h: 'Timetabling, and why we run two teaching teams', p: 'We are nine hours ahead — tied with Mexico and Costa Rica as our widest gap. Classes are available across the day, including after-school, because we run two teaching teams in different time zones. Schools commonly run jornada matutina and vespertina, so an afternoon-shift student has mornings free.' },
    { h: 'Built for a development sector that rotates', p: 'Guatemala hosts one of the largest NGO and development communities in Central America. One live pathway continues unchanged to the next posting, in any country.' },
    { h: 'What we are, stated plainly', p: 'Private schools in Guatemala operate with MINEDUC authorisation. Smartious is not a MINEDUC-authorised institution and does not present itself as one — we work alongside one that is.' },
  ],

  universitiesInCountry: 'the Universidad de San Carlos de Guatemala — the oldest in Central America — Universidad Francisco Marroquín, Universidad del Valle de Guatemala, Universidad Rafael Landívar, and a private sector with several institutions teaching partly in English.',
  universityChannels: 'Guatemalan universities admit on the national diversificado qualification through their own processes, with foreign qualifications going through recognition procedures confirmed per institution. Universidad del Valle and Universidad Francisco Marroquín in particular are familiar with international qualifications and read them more directly. Outward, Guatemalan students are overwhelmingly oriented toward the United States — the country has one of the largest diasporas in the US and the ties are constant — with Spain, Mexico and Canada following, and all of them read Cambridge A-Levels, the IB Diploma and AP records directly. UCAS reads A-Levels natively, and A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across US, Spanish, Mexican, Canadian, UK (UCAS), and Guatemalan destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Guatemala families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes in the Guatemalan morning on a fixed nine-hour offset with no seasonal drift — which fits students in jornada vespertina and full-time learners — run alongside a Guatemalan school enrolment that continues its own national track unchanged. Cambridge Spanish available beside the English-medium core. Examinations at authorised provision confirmed per session.',
  britishCurriculumSuits: 'Guatemala families targeting the Cambridge pathway. Best fit for: (1) Petén, Izabal and highland families with no international provision at all, (2) Antigua\'s large expatriate and NGO community an hour over the mountain from the capital, (3) Guatemala City families outside the international tier\'s fees, (4) development and mission-sector households whose postings rotate, (5) students in jornada vespertina whose mornings are free.',
  britishCurriculumDelivery: 'Live online classes in the Guatemalan morning, small groups 4-6 students, every session recorded, alongside a Guatemalan school enrolment.',
  ibDiplomaSuits: 'Guatemala families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Guatemala families targeting US universities via Common Application — the dominant overseas destination given the scale of the diaspora and the country\'s ties to the United States.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Guatemala families join students across more than eighty countries — and Guatemala is a market where our development-sector families often already know us from a previous posting, because the curriculum travels even when the assignment ends.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Quetzaltenango\'s medical-faculty households and every science-bound student in the capital. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Guatemala City has a strong international tier for the region — the Colegio Americano, Colegio Maya, Colegio Interamericano, the German and French schools — with substantial IB and American provision and fees at the top of the Central American market. Outside the capital the picture collapses almost entirely: Antigua hosts an international community out of all proportion to its size with little schooling for it, Quetzaltenango is a city of hundreds of thousands four hours away, and Petén and Izabal have nothing at all despite hosting international archaeology, conservation, port and marine communities.',
  competitors: [
    { name: 'Colegio Americano, Colegio Maya, Colegio Interamericano', city: 'Guatemala City', curriculum: 'American, IB and international',        feesUsd: 'Top of the Central American market',                feesAed: 'Premium tier',            rating: 4.6, capacityNote: 'Strong provision for the region — capital-bound and expensive' },
    { name: 'The German and French schools',                   city: 'Guatemala City',        curriculum: 'National-system bilingual',              feesUsd: 'Premium tier',                                      feesAed: 'Varies',                  rating: 4.4, capacityNote: 'Long-established heritage schools — a different route entirely' },
    { name: 'Antigua',                                         city: 'Sacatepéquez',          curriculum: 'Little relative to its community',       feesUsd: 'Limited international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'An outsized expatriate and NGO population an hour over the mountain from the capital' },
    { name: 'Quetzaltenango',                                  city: 'Western highlands',     curriculum: 'Minimal',                               feesUsd: 'No real international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'The second city and a major university centre, four hours from the tier' },
    { name: 'Petén and Izabal',                                city: 'North and Atlantic',    curriculum: '—',                                     feesUsd: 'No international provision',                         feesAed: '—',                       rating: 0,   capacityNote: 'Tikal\'s archaeology community, the Maya Biosphere, the Atlantic port and the Río Dulce cruising fleet — none with schooling' },
    { name: 'US-based online schools',                         city: 'Online',                curriculum: 'American online',                       feesUsd: 'Varies, often per-course',                          feesAed: 'Varies',                  rating: 4.3, capacityNote: 'Much closer to Guatemala on the clock and familiar to the large US-connected community — families should weigh that honestly against price and class size' },
    { name: 'Smartious Homeschool (Guatemala via online delivery)', city: 'Delivered to all Guatemala', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'GTQ equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + Antigua, Xela, Pet\u00e9n and Izabal reached + honest that we are nine hours away and could not verify the legal position' },
  ],

  legalFrameworkIntro: 'Guatemala is, with Panama, one of the two markets in our Latin American coverage where we could not verify the central question. We would rather open by saying so than write around it.',
  legalFramework: [
    { h: 'What we can establish', p: 'Education in Guatemala is administered by the Ministerio de Educación, MINEDUC. Education is compulsory at the primary and basic levels — families should confirm the current age boundaries with the ministry rather than take them from a provider\'s article. Private schools operate with MINEDUC authorisation, and Smartious does not hold it: we do not operate premises in Guatemala, we do not claim Guatemalan recognition, and the qualifications we deliver carry Cambridge, Pearson Edexcel, IB or AP validity rather than a domestic one.' },
    { h: 'What we could not establish', p: 'Guatemala\'s position on parental home education. The indication available to us is secondary commentary placing Guatemala among Central American countries where homeschooling is not regulated — no specific policies and no legal framework clearly defining the rights and obligations of families who choose it, though families may in practice educate at home. That is thin sourcing for a question this consequential. We will not tell you home education is permitted in Guatemala, and we will not tell you it is prohibited. Both would exceed what we can evidence, and a family that acts on an overconfident claim pays for it rather than we do.' },
    { h: 'Why an absence of rules is not a permission', p: 'It is worth drawing the comparison across the three Central American markets we serve, because the silences are different and so are the risks. Ecuador — not Central American but instructive — names educación en casa as a modality and regulates it by acuerdo, with conditions and an accreditation route, and families who ignored the conditions have faced child-protection proceedings. Costa Rica\'s ministry explicitly does not accept the modality, and domestic analysis records that it happens without legal backing or state supervision. Guatemala and Panama appear simply not to address it. A regulated route is demanding and it is also a protection: a family knows what compliance looks like and can demonstrate it. Where a matter is unaddressed, there is nothing to demonstrate and no framework to rely on if the question is raised by a school, an authority, or a court. That is a weaker position for a family, not a stronger one.' },
    { h: 'What we would tell a Guatemalan family to do', p: 'Put the question directly to MINEDUC before acting rather than after, and get the answer in a form you can keep. If you are an expatriate or development-sector household, remember that your own residence status may also bear on which framework applies to your children at all, and that belongs with your own advisers. And treat any provider that gives you a confident one-line answer on Guatemalan home-education law with more scepticism than you would treat our refusal to give one.' },
    { h: 'What we therefore offer', p: 'Structured teaching alongside a Guatemalan school enrolment, stated firmly here precisely because the framework is unclear. The school carries the compulsory-education duty and the daily routine; Smartious teaches the Cambridge or IB track live in a morning block toward external examinations. Nothing in that arrangement depends on the unresolved question, which is exactly why it is the arrangement we build.' },
    { h: 'The timezone, and the school day that makes it workable', p: 'We teach from Nairobi at UTC+3 and Guatemala runs CST at UTC-6 with no daylight saving, a fixed nine-hour gap — tied with Mexico and Costa Rica as the widest in our coverage. Our teaching lands in the Guatemalan morning, which means Both after-school and morning blocks are available, since we run two teaching teams in different time zones. What makes it workable is the Guatemalan school day: schools commonly run jornada matutina and vespertina, so a student on the afternoon shift has mornings entirely free, which is exactly our window. Families whose child is in jornada matutina should talk to us before enrolling so we can be realistic about which subjects and days work.' },
  ],

  whySmartious: [
    { h: 'Honest that we could not verify the law',                        p: 'Guatemala\'s home-education position could not be established from a primary source. We report that, decline to guess, and send families to MINEDUC.' },
    { h: 'An absence of rules explained as a risk',                        p: 'Where a matter is unregulated there is nothing to demonstrate and no framework to rely on. We draw the contrast with Ecuador and Costa Rica rather than letting silence read as permission.' },
    { h: 'Antigua, Xela, Petén and Izabal reached',                        p: 'Four regions with substantial international communities — expatriate, university, archaeology, port and marine — and no international schooling between them.' },
    { h: 'Built for a rotating development sector',                        p: 'Guatemala hosts one of Central America\'s largest NGO communities. One pathway continues unchanged to the next posting.' },
    { h: 'Morning teaching that fits the jornada vespertina',              p: 'Nine hours ahead means our classes land in the Guatemalan morning — the free half of the day for afternoon-shift students.' },
    { h: 'Honest that US providers are closer on the clock',               p: 'For a country this US-connected, an American online school is nearer in time zone. Families should weigh that against price and class size.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Guatemala?', a: 'We could not verify a position from a primary Guatemalan instrument and will not guess. Education is compulsory at primary and basic levels and administered by MINEDUC; the available indication is secondary commentary placing Guatemala among countries where home education is not specifically regulated, with no framework defining families\' rights and obligations. An absence of regulation is not a permission — put the question to MINEDUC directly.' },
    { q: 'Why do Ecuador and Costa Rica get clearer answers on your site?', a: 'Because Ecuador\'s ministry names and regulates the modality in detail, and Costa Rica\'s explicitly does not accept it with domestic analysis recording that it happens without legal backing. Guatemala appears simply not to address it. We would rather show that difference than flatten three positions into one confident sentence.' },
    { q: 'Is Smartious a MINEDUC-authorised institution?', a: 'No, and we say so plainly. Private schools operate with MINEDUC authorisation. We work alongside a Guatemalan school that holds it, and teach Cambridge, Edexcel, IB and AP qualifications.' },
    { q: 'Nine hours behind — how does the timetable work?', a: 'Classes are available across the day, including after-school, because we run two teaching teams in different time zones. For students in jornada vespertina that is the free half of the day. Jornada matutina families should talk to us before enrolling so we can be realistic.' },
    { q: 'How do the fees compare with Guatemala City schools?', a: 'The capital\'s international fees sit at the top of the Central American market. Smartious runs USD 2,160-6,480 a year for live small-group teaching toward the same Cambridge examinations.' },
    { q: 'We are on an NGO or development posting — does the schooling follow?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next country, which is why our development-sector families often re-enrol from a new posting rather than starting over.' },
    { q: 'Would a US online school suit us better?', a: 'Possibly, and we raise it rather than hiding it — a US provider is closer on the clock and familiar to Guatemala\'s heavily US-connected community. We offer price, small live groups, and Cambridge and IB alongside the American route.' },
    { q: 'Which parts of Guatemala does Smartious cover?', a: 'Guatemala City, Antigua, Quetzaltenango, Petén and Flores, and Puerto Barrios and Izabal have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us where in Guatemala you are and whether your child is in jornada matutina or vespertina: the first decides how far you are from any campus, the second decides whether our timetable fits yours.',
}
