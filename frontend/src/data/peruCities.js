// ═══════════════════════════════════════════════════════════════════
// PERU — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for mining, corporate, agro-export, and Peruvian
// families across Lima, Arequipa, Cusco, Trujillo and Piura.
// SIXTH LATIN AMERICAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// LEGAL POSITIONING NOTE — HEDGE MORE FIRMLY HERE THAN IN CHILE:
// - Governing statute: LEY GENERAL DE EDUCACIÓN N° 28044 (2003),
//   with MINEDU as the national authority and delivery administered
//   through regional Direcciones Regionales de Educación (DRE) and
//   local Unidades de Gestión Educativa Local (UGEL).
// - EDUCACIÓN BÁSICA REGULAR — inicial, primaria and secundaria — is
//   compulsory. State it that way rather than quoting an age range
//   we have not verified against the current text; tell families to
//   confirm the current ages with MINEDU or their UGEL.
// - Ley 28044 recognises EDUCACIÓN A DISTANCIA as a MODALITY of the
//   education system, applicable across levels. Mention it
//   FACTUALLY and HEDGE: whether and how it applies to a particular
//   child, and which providers are recognised for it, is a matter
//   for MINEDU and the UGEL, not for us. DO NOT present it as a
//   homeschooling route or imply Smartious operates within it.
// - Peru also operates EDUCACIÓN BÁSICA ALTERNATIVA (EBA) for people
//   who did not complete studies at the corresponding age. State
//   factually; it is not a parental-choice route for a school-age
//   child and has its own eligibility rules.
// - PARENTAL-CHOICE HOME EDUCATION: we are not aware of an
//   established route. Phrase as "not established / we are not aware
//   of" — NOT a categorical prohibition — plus "confirm with MINEDU
//   and your UGEL".
// - PRIVATE SCHOOLS operate with authorisation through the UGEL/DRE
//   structure. CONSEQUENCE: Smartious is NOT an authorised Peruvian
//   institution and says so — same disclosure family as Mexico,
//   Brazil, Argentina, Colombia, Ghana, DRC.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT throughout. Peru is
//   NOT Chile — do not carry the exámenes libres framing across.
// TIMEZONE: PET (UTC-5), no daylight saving — EIGHT HOURS behind
// Nairobi, same as Colombia. Our teaching lands in the PERUVIAN
// Two teaching teams in different time zones = classes available across the full day. Peruvian
// schools commonly run turno mañana and turno tarde, so a turno
// tarde student has mornings free — that is our window. State the
// constraint plainly and give the solution, exactly as on the
// Colombia and Mexico pages.
// MARKET NOTE: Lima holds the international tier — Markham College,
// San Silvestre, Roosevelt, Newton, the Franco-Peruano and German
// schools — much of it long established and priced at the top of the
// Peruvian market, with a substantial IB presence. Outside Lima
// provision thins very sharply. Economy: Lima's corporate, financial
// and port sector at Callao; Arequipa's mining belt (Cerro Verde and
// the southern operations) and its industrial base; Cusco's tourism
// economy of global scale plus the gas corridor; Trujillo and the
// northern agro-export complex (asparagus, blueberries, avocado);
// and Piura's oil, fishmeal and agro-industry with the Talara
// refinery. Peru is one of the world's largest copper producers and
// the mining workforce is internationally recruited.
// ═══════════════════════════════════════════════════════════════════

export const PERU_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'lima-pe',
    name: 'Lima',
    county: 'Lima and Callao',
    region: 'The corporate and financial capital · a long-established international school tier with a substantial IB presence · the Callao port complex · the mining sector\'s head offices',
    primaryKeyword: 'Online school and international curriculum in Lima',
    heroTagline: 'For Lima families — Cambridge and IB taught live in the morning, which for a turno tarde student is the free half of the day.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Lima families. Lima carries Peru\'s corporate and financial weight, the mining sector\'s head offices, the Callao port complex, and a long-established international school tier — Markham, San Silvestre, Roosevelt, Newton, the Franco-Peruano and German schools — with a substantial IB presence and fees at the top of the Peruvian market. Educación básica regular is compulsory in Peru, so our role is alongside a school rather than instead of one. We teach from Nairobi, eight hours ahead, so our classes land in the Peruvian morning.',
    heroImg: '/heroes/lima-pe.jpg',
    altTexts: { hero: 'Lima and the Pacific coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Lima families — morning classes that fit the turno tarde, alongside your school. From USD 400/month.',
    challenges: [
      'International school fees in Lima sit at the top of the Peruvian market, with competitive places.',
      'Educación básica regular is compulsory, so the school carries the obligation.',
      'We teach eight hours ahead, so our classes land in the Peruvian morning, not the afternoon.',
      'Private institutions operate with authorisation through the UGEL and DRE structure, and Smartious is not one.',
      'Time zone: Peru runs PET (UTC-5) with no daylight saving — a fixed eight-hour gap behind Nairobi.',
    ],
    familySituations: [
      'Corporate, financial, and mining head-office families outside the international tier\'s fees.',
      'Students in turno tarde whose mornings are free.',
      'Port, logistics, and trade families around Callao.',
      'Diplomatic and international-organisation households.',
      'Families wanting Cambridge A-Levels in a market with a strong IB presence.',
      'Students targeting UK, American, Spanish, or Peruvian universities.',
    ],
    nearbyAreas: ['Miraflores', 'San Isidro', 'La Molina', 'Surco', 'Barranco', 'Callao', 'Asia and the southern beaches'],
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
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Peruvian university applications',
    ],
    whyChoose: [
      ['Morning classes, which is the point in Peru', 'We teach eight hours ahead, so our block lands in the Peruvian morning — the free half of the day for every student in turno tarde.'],
      ['Cambridge A-Levels in an IB-weighted market', 'Lima is well served for the IB and thinner on A-Levels — which matters for anyone applying through UCAS.'],
      ['A fee gap against the top of the Peruvian market', 'Live small-group teaching at USD 2,160-6,480 a year.'],
      ['What we are, stated plainly', 'Smartious is not an authorised Peruvian institution. We work alongside a school that is.'],
      ['Spanish kept alongside', 'Cambridge Spanish runs beside the English-medium core, protecting Peruvian and Spanish university routes.'],
    ],
    growingReason: 'Lima holds Peru\'s corporate and financial centre, the mining sector\'s head offices, the Callao port complex, and a long-established international school tier with a substantial IB presence at premium fees. Peru runs PET (UTC-5) with no daylight saving, eight hours behind Nairobi, so our teaching lands in the Peruvian morning.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Lima families, taught in the Peruvian morning alongside a school enrolment. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Lima families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the city\'s IB schools.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Peruvian education law is set by the Ley General de Educación N° 28044, with MINEDU as the national authority and delivery administered through the regional Direcciones Regionales de Educación and the local Unidades de Gestión Educativa Local. Educación básica regular — inicial, primaria, and secundaria — is compulsory, and families should confirm the current age boundaries with MINEDU or their UGEL rather than take them from a provider\'s summary. Two provisions are worth stating factually because families encounter them. Ley 28044 recognises educación a distancia as a modality of the education system applicable across levels; whether and how that applies to a particular child, and which providers are recognised within it, is a matter for MINEDU and the UGEL rather than for us, and we do not present it as a homeschooling route or suggest that Smartious operates inside it. And Peru operates Educación Básica Alternativa for people who did not complete their studies at the corresponding age, which has its own eligibility rules and is not a parental-choice route for a school-age child. We are not aware of an established parental-choice home-education route in Peruvian law, and we phrase it that way rather than asserting a categorical prohibition — confirm with MINEDU and your UGEL. Private institutions operate with authorisation through the UGEL and DRE structure; Smartious is not an authorised Peruvian institution and works alongside a school that is.',
    homeTuitionDetail: 'Smartious delivers to Lima families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Peruvian morning. With a fixed eight-hour gap and no daylight saving on either side, a 07:00-10:00 Peruvian block sits in our normal late-afternoon teaching hours every week of the year, with all sessions recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Peru?', a: 'Educación básica regular is compulsory under the Ley General de Educación N° 28044, and we are not aware of an established parental-choice home-education route. We put it in those terms rather than asserting a flat prohibition — confirm with MINEDU and your UGEL. Structured study alongside a school enrolment is unrestricted.' },
      { q: 'What about educación a distancia?', a: 'Ley 28044 recognises it as a modality of the education system across levels. Whether it applies to a particular child, and which providers are recognised within it, is a matter for MINEDU and the UGEL. We state it factually and do not claim to operate inside it.' },
      { q: 'Eight hours — how does the timetable work?', a: 'Our classes land in the Peruvian morning, not the afternoon. For a student in turno tarde, whose school runs in the afternoon, that is the free half of the day. After-school and morning blocks are both available, since we run two teaching teams in different time zones.' },
      { q: 'Is Smartious an authorised Peruvian institution?', a: 'No, and we say so plainly. Private institutions operate with authorisation through the UGEL and DRE structure. We work alongside a Peruvian school that holds it, and teach Cambridge, Edexcel, IB and AP qualifications.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'arequipa-pe',
    name: 'Arequipa & the Southern Mining Belt',
    county: 'Arequipa and Moquegua',
    region: 'The second city and the southern copper belt — Cerro Verde and the regional operations · an industrial base and a major university · Matarani and the mineral export corridor',
    primaryKeyword: 'Online school and international curriculum in Arequipa',
    heroTagline: 'For Arequipa and southern mining families — Peru\'s copper south, staffed internationally and schooled locally.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Arequipa and southern Peruvian families. Arequipa is Peru\'s second city and the commercial capital of its southern mining belt — Cerro Verde on the city\'s edge and the operations spread across Moquegua and the south, the Matarani export corridor, an industrial base, and a major university. Peru is among the world\'s largest copper producers and the technical workforce is recruited internationally, but international schooling here is a fraction of Lima\'s, and the capital is a flight north. Smartious teaches live to the south, in the Peruvian morning, alongside a school.',
    heroImg: '/heroes/arequipa-pe.jpg',
    altTexts: { hero: 'Arequipa and El Misti' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Arequipa and southern Peru mining families — copper belt, thin international schooling. From USD 400/month.',
    challenges: [
      'An internationally recruited mining workforce with a fraction of Lima\'s international provision.',
      'Mine sites and camps sit well outside the city, in Moquegua and across the south.',
      'Rotational contracts move families between operations and countries.',
      'Educación básica regular is compulsory; the supplementary configuration carries those years.',
      'We teach eight hours ahead, so our classes land in the Peruvian morning.',
    ],
    familySituations: [
      'Mining engineering, geology, and metallurgy families — Peruvian and international.',
      'Contractor and mining-services households on rotational postings.',
      'Industrial and manufacturing families in the city.',
      'University academic and research families.',
      'Students in turno tarde with mornings free.',
    ],
    nearbyAreas: ['Arequipa', 'Cerro Verde', 'Matarani', 'Moquegua', 'Ilo', 'Camaná', 'the southern operations'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Chemistry, Physics, Mathematics, Further Mathematics, Geography',
      'Cambridge A-Level Biology, Economics, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Chemistry, AP Physics, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including mining and geoscience programmes), Common Application (US), and Chilean, Canadian and Peruvian university applications',
    ],
    whyChoose: [
      ['The mining cohort we teach across four continents', 'Antofagasta, Jwaneng, Kolwezi, the Copperbelt, Rössing — and now the Peruvian south. The same A-Level spine and the same live groups.'],
      ['Metallurgy and geoscience depth', 'Cambridge A-Level Chemistry, Physics, Mathematics, and Geography — led by a founder with a BEd in Mathematics and Physics.'],
      ['The alternative to boarding in Lima', 'Southern families have sent senior students to the capital for decades. Live teaching reaches Arequipa and the operations instead.'],
      ['Portable to the next operation', 'Arequipa now, Chile, Canada, or Australia next — the curriculum and the board stay constant.'],
      ['Morning classes that fit the turno tarde', 'Our block lands in the Peruvian morning, free for every afternoon-shift student.'],
    ],
    growingReason: 'Arequipa is Peru\'s second city and the commercial capital of the southern copper belt — Cerro Verde, the Moquegua operations, and the Matarani export corridor — in one of the world\'s largest copper-producing countries, with a fraction of Lima\'s international provision. Peru runs PET (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for southern Peru, taught in the Peruvian morning alongside a school enrolment and portable across mining postings.',
      cbc: 'Kenya CBC available for southern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American or Canadian universities.',
    },
    homeschoolDetail: 'The national framework applies in the south, administered through the regional DRE and local UGEL: educación básica regular is compulsory under Ley 28044, educación a distancia is recognised as a modality of the system with its application a matter for MINEDU and the UGEL rather than for us, and we are not aware of an established parental-choice home-education route — confirm with MINEDU and your UGEL. Smartious is not an authorised Peruvian institution and works alongside a school that is. For internationally posted mining families the supplementary configuration also travels, continuing unchanged to the next operation anywhere in the world.',
    homeTuitionDetail: 'Smartious delivers to southern Peruvian families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Peruvian morning on a fixed eight-hour offset, with every session recorded — built for rosters and remote sites.',
    faqs: [
      { q: 'We are on a mining rotation — does the schooling follow us?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next operation anywhere in the world, with examinations sat at authorised centres wherever the family is.' },
      { q: 'Is boarding in Lima the only option for southern families?', a: 'It has been. Live teaching reaches Arequipa, Moquegua, and the operations, with examination travel a few times a year rather than a child living away.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'cusco-pe',
    name: 'Cusco & the Sacred Valley',
    county: 'Cusco Region',
    region: 'A tourism economy of global scale · the Machu Picchu corridor and the Sacred Valley · an international resident and hospitality community · the Camisea gas corridor across the region',
    primaryKeyword: 'Online school and international curriculum in Cusco',
    heroTagline: 'For Cusco and Sacred Valley families — one of the most visited places on earth, with an international community and no international school.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Cusco and Sacred Valley families. Cusco anchors one of the largest tourism economies in South America — the Machu Picchu corridor, the Sacred Valley, and a hospitality and adventure sector that draws owners, managers, and guides from across Europe, North America, and Latin America, many of whom settle. The Camisea gas corridor runs across the wider region. What none of it produced is international schooling: for that, families look to Lima, a flight away. Smartious teaches live to the valley in the Peruvian morning, alongside a school.',
    heroImg: '/heroes/cusco-pe.jpg',
    altTexts: { hero: 'Cusco and the Sacred Valley' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Cusco and Sacred Valley families — global tourism economy, no international schooling. From USD 400/month.',
    challenges: [
      'A genuinely international resident community with no international schooling in the region.',
      'A tourism season that shapes the household for much of the year.',
      'Families spread across the city, the valley, and the corridor towns.',
      'Educación básica regular is compulsory; the supplementary configuration carries those years.',
      'We teach eight hours ahead, so our classes land in the Peruvian morning.',
    ],
    familySituations: [
      'Hotel, lodge, and adventure-tourism business families.',
      'International residents who arrived for a season and settled.',
      'Gas-corridor and energy-sector households across the region.',
      'Families in the Sacred Valley away from the city.',
      'Students in turno tarde with mornings free.',
    ],
    nearbyAreas: ['Cusco', 'Urubamba', 'Ollantaytambo', 'Pisac', 'Calca', 'Aguas Calientes', 'the Sacred Valley'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, French and home language support',
      'Cambridge A-Level Biology, Geography, Mathematics, Chemistry, History',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP World History',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Peruvian university applications',
    ],
    whyChoose: [
      ['The complete option where none exists', 'Identical live delivery in Cusco and Lima — no relocation, no boarding decision.'],
      ['Built for a tourism season', 'Live morning classes plus unlimited recordings hold the academic year through the busiest months.'],
      ['Geography, history and environmental science that fit the place', 'The Sacred Valley and the Andes make unusually good context for Cambridge Geography and History and AP Environmental Science.'],
      ['Reaches the valley, not just the city', 'Urubamba, Ollantaytambo, and Pisac get identical live teaching.'],
      ['Morning classes that fit the turno tarde', 'Our block lands in the Peruvian morning, free for every afternoon-shift student.'],
    ],
    growingReason: 'Cusco anchors one of the largest tourism economies in South America — the Machu Picchu corridor and the Sacred Valley — with an international hospitality and resident community and the Camisea gas corridor across the wider region, and no international schooling anywhere in it. Peru runs PET (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Cusco region, taught in the Peruvian morning alongside a school enrolment. Examination sittings planned per session with travel scheduled ahead.',
      cbc: 'Kenya CBC available for Cusco families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Cusco, administered through the regional DRE and local UGEL: educación básica regular is compulsory under Ley 28044, educación a distancia is recognised as a modality of the system with its application a matter for MINEDU and the UGEL, and we are not aware of an established parental-choice home-education route — confirm with MINEDU and your UGEL. International residents who remain registered elsewhere follow their country of residence\'s framework, a status they determine with their own advisers. Smartious is not an authorised Peruvian institution.',
    homeTuitionDetail: 'Smartious delivers to Cusco families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Peruvian morning on a fixed eight-hour offset, with the full recorded library carrying the tourism season.',
    faqs: [
      { q: 'Is there international schooling in Cusco?', a: 'None — for that families look to Lima, a flight away. Live online delivery is the complete option for the region, alongside a local school enrolment.' },
      { q: 'Our family runs a lodge or tour business — can schooling fit the season?', a: 'It is built for it: live morning classes with a complete recorded library, so the academic year holds through the busiest months.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'trujillo-pe',
    name: 'Trujillo & the Northern Agro Corridor',
    county: 'La Libertad',
    region: 'The agro-export capital — asparagus, blueberries and avocado for global markets · the Chavimochic irrigation complex · a major university and medical centre · thin international provision',
    primaryKeyword: 'Online school and international curriculum in Trujillo',
    heroTagline: 'For Trujillo and La Libertad families — an agro-export industry feeding global supermarkets, with schooling built for a provincial city.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Trujillo and La Libertad families. Northern Peru runs one of the most successful agro-export transformations anywhere — asparagus, blueberries, avocado and grapes grown on the Chavimochic irrigation complex and shipped to supermarkets across Europe, North America, and Asia, with the technical, commercial, and export management that comes with it. Trujillo is also a major university and medical centre. International schooling is thin, and Lima is nine hours south by road. Smartious teaches live to the north, in the Peruvian morning, alongside a school.',
    heroImg: '/heroes/trujillo-pe.jpg',
    altTexts: { hero: 'Trujillo and the northern Peruvian coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Trujillo and La Libertad families — northern agro-export corridor, thin provision. From USD 400/month.',
    challenges: [
      'A globally connected agro-export industry with thin international schooling.',
      'Lima is a flight or a long road journey south.',
      'Educación básica regular is compulsory; the supplementary configuration carries those years.',
      'Exam sittings mean Lima or regional windows, planned ahead.',
      'We teach eight hours ahead, so our classes land in the Peruvian morning.',
    ],
    familySituations: [
      'Agro-export, agronomy, and food-technology families.',
      'Commercial and export-management households trading into Europe, North America, and Asia.',
      'University academic and medical-faculty families.',
      'Regional business families across La Libertad.',
      'Students in turno tarde with mornings free.',
    ],
    nearbyAreas: ['Trujillo', 'Chepén', 'Virú', 'Chao', 'Chiclayo', 'Chimbote', 'the Chavimochic corridor'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Geography, Physics',
      'Cambridge A-Level Economics, Business, Accounting',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Peruvian university applications',
    ],
    whyChoose: [
      ['Biology and agricultural science depth', 'Cambridge A-Level Biology and Chemistry with Geography suit agronomy, food science, and agricultural-business routes precisely.'],
      ['Business and economics for an export corridor', 'Cambridge A-Level Economics and Business suit the families who run the north\'s trade into global markets.'],
      ['The complete option a long way from the capital', 'Identical live delivery in Trujillo and Lima, without relocation.'],
      ['Pre-medical depth for a medical city', 'Cambridge A-Level Biology and Chemistry with Mathematics, planned from IGCSE onward.'],
      ['Morning classes that fit the turno tarde', 'Our block lands in the Peruvian morning, free for every afternoon-shift student.'],
    ],
    growingReason: 'Northern Peru runs one of the most successful agro-export transformations anywhere — asparagus, blueberries, avocado and grapes on the Chavimochic complex shipped worldwide — alongside a major university and medical sector, with thin international schooling and Lima a long way south. Peru runs PET (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the northern corridor, taught in the Peruvian morning alongside a school enrolment.',
      cbc: 'Kenya CBC available for northern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in La Libertad, administered through the regional DRE and local UGEL: educación básica regular is compulsory under Ley 28044, educación a distancia is recognised as a modality of the system with its application a matter for MINEDU and the UGEL, and we are not aware of an established parental-choice home-education route — confirm with MINEDU and your UGEL. Smartious is not an authorised Peruvian institution and works alongside a school that is.',
    homeTuitionDetail: 'Smartious delivers to northern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Peruvian morning on a fixed eight-hour offset, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Trujillo?', a: 'Thin — the tier is in Lima, a flight or a long road journey south. Live online delivery is the complete option for the north.' },
      { q: 'Our child wants agronomy or food science — what should they take?', a: 'Cambridge A-Level Biology and Chemistry with Geography or Mathematics, planned backward from the target university from IGCSE onward.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'piura-pe',
    name: 'Piura & Talara',
    county: 'Piura Region',
    region: 'The northern oil and agro-industrial region — the Talara refinery and the offshore fields · fishmeal and processing at Paita · mango, grape and banana export · the Ecuadorian border corridor',
    primaryKeyword: 'Online school and international curriculum in Piura and Talara',
    heroTagline: 'For Piura and Talara families — a refinery, an offshore field and a global fruit-export industry, with a school list of almost nothing.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Piura and Talara families. Peru\'s far north carries an unusual mix: the Talara refinery and the offshore oil fields, the fishing and fishmeal complex at Paita, a fruit-export industry shipping mango, grape, and banana to Europe and North America, and the corridor to the Ecuadorian border. It is a genuinely industrial and internationally trading region, and its international schooling is close to non-existent — Lima is well over a thousand kilometres south. Smartious teaches live to the north, in the Peruvian morning, alongside a school.',
    heroImg: '/heroes/piura-pe.jpg',
    altTexts: { hero: 'The northern Peruvian coast at Piura' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Piura and Talara families — refinery, offshore fields and fruit export, almost no provision. From USD 400/month.',
    challenges: [
      'Almost no international schooling in an industrial and internationally trading region.',
      'Lima is well over a thousand kilometres south.',
      'Refinery and offshore postings arrive on project timelines rather than admission cycles.',
      'Educación básica regular is compulsory; the supplementary configuration carries those years.',
      'We teach eight hours ahead, so our classes land in the Peruvian morning.',
    ],
    familySituations: [
      'Refinery, offshore, and oilfield-services engineering families.',
      'Fishing, fishmeal, and processing-industry households at Paita.',
      'Fruit-export and agro-industrial business families.',
      'Cross-border trading households toward Ecuador.',
      'Students in turno tarde with mornings free.',
    ],
    nearbyAreas: ['Piura', 'Talara', 'Paita', 'Sullana', 'Máncora', 'Sechura', 'the Ecuadorian border'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Chemistry, Physics, Mathematics, Biology, Geography',
      'Cambridge A-Level Economics, Business, Further Mathematics',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Chemistry, AP Physics, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including petroleum and marine programmes), Common Application (US), and Spanish and Peruvian university applications',
    ],
    whyChoose: [
      ['Chemistry and engineering depth for a refinery region', 'Cambridge A-Level Chemistry, Physics, and Mathematics suit Talara and the offshore fields precisely.'],
      ['The complete option a thousand kilometres from the tier', 'Identical live delivery in Piura and Lima, without relocation.'],
      ['Portable across energy postings', 'Talara now, another refinery or basin after — the curriculum and the board stay constant.'],
      ['Marine and environmental science that fit the coast', 'The Paita fishing complex and the northern coast make good context for Biology and AP Environmental Science.'],
      ['Morning classes that fit the turno tarde', 'Our block lands in the Peruvian morning, free for every afternoon-shift student.'],
    ],
    growingReason: 'Peru\'s far north carries the Talara refinery and offshore fields, the Paita fishing and fishmeal complex, and a fruit-export industry shipping worldwide — a genuinely industrial and internationally trading region with almost no international schooling and Lima well over a thousand kilometres south. Peru runs PET (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the far north, taught in the Peruvian morning alongside a school enrolment and portable across energy postings.',
      cbc: 'Kenya CBC available for northern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Piura, administered through the regional DRE and local UGEL: educación básica regular is compulsory under Ley 28044, educación a distancia is recognised as a modality of the system with its application a matter for MINEDU and the UGEL, and we are not aware of an established parental-choice home-education route — confirm with MINEDU and your UGEL. Smartious is not an authorised Peruvian institution. Cross-border households resident in Ecuador follow Ecuadorian law instead, a distinction decided by residence rather than by where a business trades, and one for their own advisers.',
    homeTuitionDetail: 'Smartious delivers to far-northern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Peruvian morning on a fixed eight-hour offset, with every session recorded — built for project timelines and offshore rosters.',
    faqs: [
      { q: 'We came with a refinery or offshore project — is there a school for us?', a: 'Almost nothing locally, with Lima well over a thousand kilometres south. Live Cambridge teaching reaches Piura and Talara in the Peruvian morning alongside a local school, and continues unchanged if the project moves on.' },
      { q: 'Where do far-northern students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with travel planned into each window well ahead.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const PERU_COUNTRY = {
  slug: 'peru',
  name: 'Peru',
  longName: 'Republic of Peru',
  adjective: 'Peruvian',
  flag: '🇵🇪',
  hub: '/online-school/peru',
  hubPageId: 'homeschooling-peru',
  cityPageId: 'peru-city',

  currency: 'PEN',
  currencyName: 'Peruvian Sol',
  currencyPeg: 'Fees are invoiced in USD; sol equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'PET',
    name: 'Peru Time (UTC-5), no daylight saving',
    utcOffset: '-5',
    offsetFromEAT: '-8 hours — our teaching lands in the Peruvian morning, fixed all year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Peru has established Cambridge provision through its international school sector'],
  examCentreTiles: [
    { city: 'Lima', centre: 'Authorised provision', area: 'The country\'s deepest external-candidate capacity, confirmed per family per session.' },
    { city: 'Arequipa', centre: 'Regional provision', area: 'Checked first for southern mining families.' },
    { city: 'The north and Cusco', centre: 'Planned per session', area: 'Trujillo, Piura, and Cusco families plan travel into each window well ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Peru-based students sit as external candidates at authorised provision, with capacity confirmed per family per session — Lima is checked first, with regional options in Arequipa and travel planned ahead from Cusco, Trujillo, and Piura. Note what does not change: our arrangement runs alongside a Peruvian school, which continues its own national track unchanged. Smartious is not an authorised Peruvian institution and the qualifications we teach carry Cambridge, Pearson Edexcel, IB, or AP validity rather than Peruvian official recognition. Separately, and stated factually rather than as a pathway: Ley 28044 recognises educación a distancia as a modality of the education system, and Peru operates Educación Básica Alternativa for those who did not complete studies at the corresponding age — both have their own rules administered by MINEDU and the UGEL, and neither is something we operate within or advise on.',
  secondaryProgrammeExamRef: 'Authorised Peruvian Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/peru.jpg',
  heroEyebrow: 'Online school for Peru',
  heroH1Suffix: 'Peru',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for mining, corporate, agro-export, and Peruvian families across Lima, Arequipa, Cusco, Trujillo, and Piura. Educación básica regular is compulsory under Ley 28044, so we work alongside your school. We teach eight hours ahead, so our classes land in the Peruvian morning — the free half of the day for turno tarde students.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — morning teaching, Spanish kept alongside.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Peru',

  citiesSectionTitle: 'Where our Peru families are',
  citiesSectionBody: 'Smartious Peru families concentrate across Lima (the corporate and financial capital with a long-established international tier and substantial IB presence), Arequipa and the southern mining belt (Cerro Verde and the Moquegua operations in one of the world\'s largest copper-producing countries), Cusco and the Sacred Valley (a tourism economy of global scale with an international resident community and no international schooling), Trujillo and the northern agro corridor (asparagus, blueberries and avocado for global supermarkets), and Piura and Talara (a refinery, offshore fields, and a fruit-export industry over a thousand kilometres from the capital). One compulsory framework, one morning teaching window, and a school system built around turnos that happens to fit it.',

  trustSignals: [
    { h: 'An African school teaching Peruvian families', p: 'Smartious was founded in Nairobi in 2019 and teaches from two operational centres established 2022 and 2023, serving students across more than seventy countries — an internationally accredited online school.' },
    { h: 'Morning teaching, and why it fits Peru', p: 'We are eight hours ahead, so our classes land in the Peruvian morning rather than the afternoon. Peruvian schools commonly run turno mañana and turno tarde — and for an afternoon-shift student, our block is precisely the free half of the day.' },
    { h: 'The law stated before anything is sold', p: 'Educación básica regular is compulsory under the Ley General de Educación N° 28044. We are not aware of an established parental home-education route and say so in those terms, pointing families to MINEDU and their UGEL.' },
    { h: 'What we are, stated plainly', p: 'Private institutions in Peru operate with authorisation through the UGEL and DRE structure. Smartious is not an authorised Peruvian institution and does not present itself as one — we work alongside a school that is.' },
  ],

  universitiesInCountry: 'Pontificia Universidad Católica del Perú, Universidad Nacional Mayor de San Marcos — among the oldest in the Americas — Universidad de Lima, Universidad del Pacífico, UPC, and the national universities at Arequipa, Trujillo, Cusco and Piura.',
  universityChannels: 'Peruvian universities admit on the national secondary certificate through their own admission processes, and foreign qualifications go through recognition procedures with requirements confirmed per institution — a family intending to enter Peruvian higher education should confirm that route early. Outward, Peruvian students are strongly oriented toward the United States and Spain, with Chile, Canada, and Australia meaningful for the mining and resource sectors, and all of them read Cambridge A-Levels, the IB Diploma, and AP records directly. UCAS reads A-Levels natively, and A-Levels are accepted in 160+ countries — including the mining engineering, geoscience, and agricultural science programmes that our Arequipa, Trujillo, and Piura families most often have in view. Smartious provides personalised university guidance across US, Spanish, Chilean, Canadian, UK (UCAS), and Peruvian destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Peru families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes in the Peruvian morning on a fixed eight-hour offset with no seasonal drift — which fits students in turno tarde and full-time learners — run alongside a Peruvian school enrolment that continues its own national track unchanged. Cambridge Spanish available beside the English-medium core. Examinations at authorised provision confirmed per session.',
  britishCurriculumSuits: 'Peru families targeting the Cambridge pathway. Best fit for: (1) students in turno tarde whose mornings are free, (2) mining families in Arequipa and the southern belt where boarding in Lima has been the default, (3) Cusco, Trujillo, and Piura families with little or no provision within hundreds of kilometres, (4) Lima families outside the international tier\'s fees, (5) students wanting Cambridge A-Levels in a market weighted toward the IB.',
  britishCurriculumDelivery: 'Live online classes in the Peruvian morning, small groups 4-6 students, every session recorded, alongside a Peruvian school enrolment.',
  ibDiplomaSuits: 'Peru families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Peru families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Peru families join students across more than seventy countries — and our Arequipa mining families sit in the same live classes as families in Antofagasta, the Copperbelt, Kolwezi, and Botswana\'s diamond towns.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the southern copper belt\'s metallurgy families, Piura\'s refinery households, and every medicine-bound student in Lima and Trujillo. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Peru\'s international schooling is a Lima story and a strong one — Markham, San Silvestre, Roosevelt, Newton, the Franco-Peruano and German schools, much of it long established with a substantial IB presence. The fees sit at the top of the Peruvian market. Outside Lima the picture thins very sharply: Arequipa is the second city of one of the world\'s largest copper producers with a fraction of the capital\'s provision, and Cusco, Trujillo, and Piura have close to nothing despite economies that trade globally every day.',
  competitors: [
    { name: 'Markham College, San Silvestre, Roosevelt, Newton', city: 'Lima',                curriculum: 'British, American and IB',              feesUsd: 'Top of the Peruvian market',                        feesAed: 'Premium tier',            rating: 4.8, capacityNote: 'Long-established and strong — the national benchmark' },
    { name: 'The Franco-Peruano, German and Italian schools',  city: 'Lima',                  curriculum: 'National-system bilingual',              feesUsd: 'Premium tier',                                      feesAed: 'Varies',                  rating: 4.5, capacityNote: 'Strong heritage schools — a different route entirely' },
    { name: 'Bilingual private schools',                       city: 'Lima and Arequipa',     curriculum: 'Bilingual Peruvian, some IGCSE',        feesUsd: 'Mid to premium tier',                               feesAed: 'Varies',                  rating: 4.1, capacityNote: 'Useful — bilingual is not the same as an international examination track' },
    { name: 'Arequipa and the southern belt',                  city: 'Southern Peru',         curriculum: 'Thin provision',                        feesUsd: 'Limited international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'The second city of a major copper producer, with a fraction of Lima\'s provision' },
    { name: 'Cusco, Trujillo and Piura',                       city: 'The regions',           curriculum: 'Close to none',                         feesUsd: 'No real international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'A global tourism economy, a global agro-export corridor, and a refinery region — none with international schooling' },
    { name: 'US-based online schools',                         city: 'Online',                curriculum: 'American online',                       feesUsd: 'Varies, often per-course',                          feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Closer to Peru on the clock than we are — families should weigh that against price and class size' },
    { name: 'Smartious Homeschool (Peru via online delivery)', city: 'Delivered to all Peru', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP',   feesUsd: 'USD 2,160-6,480/year',                              feesAed: 'PEN equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + morning teaching that fits the turno tarde + the mining south and the regions reached + honest that we are eight hours away and hold no Peruvian authorisation' },
  ],

  legalFrameworkIntro: 'Peru\'s framework is administered on three levels — national, regional, and local — which shapes both what we can say and where families should confirm it. Here is the structure.',
  legalFramework: [
    { h: 'The governing statute and the administering bodies', p: 'The Ley General de Educación N° 28044 governs the Peruvian system, with MINEDU as the national authority. Delivery is administered through the regional Direcciones Regionales de Educación and the local Unidades de Gestión Educativa Local — the UGEL — which authorise and supervise institutions in their jurisdiction. That three-level structure matters practically: the body a family actually deals with is usually their UGEL, and it is the right place to confirm anything specific to their circumstances.' },
    { h: 'What is compulsory', p: 'Educación básica regular — comprising the inicial, primaria, and secundaria levels — is compulsory. We state it that way rather than quoting an age range, because the boundaries are the kind of detail that should be read from the current instruments rather than taken from a provider\'s article, and MINEDU or your UGEL will confirm them for your child\'s situation.' },
    { h: 'Two provisions families ask about', p: 'First, Ley 28044 recognises educación a distancia as a modality of the education system, applicable across levels. That is real, and it is not a homeschooling route: whether and how it applies to a particular child, and which providers are recognised within it, is a matter for MINEDU and the UGEL rather than for us, and Smartious does not claim to operate inside it. Second, Peru operates Educación Básica Alternativa for people who did not complete their studies at the corresponding age, with its own eligibility rules — it is not a parental-choice route for a school-age child. We mention both because families encounter them and reasonably wonder.' },
    { h: 'Home education: what we can and cannot say', p: 'We are not aware of an established parental-choice home-education route in Peruvian law, and we phrase it in exactly those terms rather than asserting a categorical prohibition we cannot fully evidence. A family whose plan turns on the point should confirm the current position with MINEDU and their UGEL. What is unrestricted is structured education alongside a school enrolment, and that is the configuration we build throughout.' },
    { h: 'What we are, and are not', p: 'Private institutions in Peru operate with authorisation through the UGEL and DRE structure. Smartious does not hold Peruvian authorisation, does not operate premises in Peru, and does not present itself as an alternative to an authorised institution. The qualifications we deliver carry Cambridge, Pearson Edexcel, IB, or AP validity; the Peruvian recognition belongs to your school. We state that as plainly here as we do in Mexico, Brazil, Argentina, Colombia, Ghana, and the DRC.' },
    { h: 'The timezone, and the school day that rescues it', p: 'We teach from Nairobi at UTC+3 and Peru runs PET at UTC-5 with no daylight saving, so the gap is a fixed eight hours — the same as Colombia and one hour better than Mexico. That means our teaching lands in the Peruvian morning and Both after-school and morning blocks are available, since we run two teaching teams in different time zones. What makes it workable is the Peruvian school day itself: schools commonly run turno mañana and turno tarde, so a student on the afternoon shift has mornings entirely free, which is exactly our window. Families whose child is in turno mañana should talk to us before enrolling so we can be realistic about which subjects and days are possible.' },
  ],

  whySmartious: [
    { h: 'Morning teaching that fits the turno tarde',                     p: 'Eight hours ahead means our classes land in the Peruvian morning — the free half of the day for afternoon-shift students, and the natural slot for full-time ones.' },
    { h: 'The mining south served like the mining world',                  p: 'Arequipa and the southern belt sit in the same live classes as Antofagasta, the Copperbelt, Kolwezi, and Botswana\'s diamond towns — one cohort, one subject spine.' },
    { h: 'The regions reached at all',                                     p: 'Cusco, Trujillo and Piura run global tourism, agro-export and refinery economies with close to no international schooling.' },
    { h: 'Cambridge A-Levels in an IB-weighted market',                    p: 'Lima is well served for the IB and thinner on A-Levels — which is what UCAS reads most directly.' },
    { h: 'Honest about the eight-hour gap',                                p: 'We lead with it, explain which patterns work, and tell turno mañana families to talk to us before enrolling.' },
    { h: 'Honest about authorisation',                                     p: 'We are not an authorised Peruvian institution and do not claim Peruvian recognition. We work alongside a school that has it.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Peru?', a: 'Educación básica regular — inicial, primaria and secundaria — is compulsory under the Ley General de Educación N° 28044, and we are not aware of an established parental-choice home-education route. We put it in those terms rather than asserting a flat prohibition — confirm with MINEDU and your UGEL. Structured study alongside a school enrolment is unrestricted.' },
    { q: 'What about educación a distancia under Ley 28044?', a: 'It is recognised as a modality of the education system across levels, and it is not a homeschooling route. Whether it applies to a particular child, and which providers are recognised within it, is a matter for MINEDU and the UGEL. We state it factually and do not claim to operate inside it.' },
    { q: 'Is Smartious an authorised Peruvian institution?', a: 'No, and we say so plainly. Private institutions operate with authorisation through the UGEL and DRE structure. We work alongside a Peruvian school that holds it, and teach Cambridge, Edexcel, IB and AP qualifications.' },
    { q: 'Eight hours behind — how does the timetable work?', a: 'Our classes land in the Peruvian morning, not the afternoon. For students in turno tarde that is the free half of the day and it works cleanly; for full-time learners mornings are natural anyway. It does not work after school, and turno mañana families should talk to us before enrolling.' },
    { q: 'Why Cambridge when Lima has a strong IB presence?', a: 'Because A-Levels are what UK admissions through UCAS reads most directly, and Peru\'s market is weighted toward the IB and the American curriculum. Families targeting Britain often find no local A-Level route.' },
    { q: 'We are posted at a mine in the south — what are the options?', a: 'Historically boarding in Lima. Live teaching reaches Arequipa, Moquegua, and the operations, and continues unchanged to the next posting — Chile, Canada, Australia, or elsewhere.' },
    { q: 'Where do Peruvian students sit Cambridge examinations?', a: 'At authorised provision confirmed per family per session — Lima first, with regional options in Arequipa and travel planned ahead from Cusco, Trujillo, and Piura.' },
    { q: 'Which parts of Peru does Smartious cover?', a: 'Lima, Arequipa and the southern mining belt, Cusco and the Sacred Valley, Trujillo and the northern agro corridor, and Piura and Talara have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us whether your child is in turno mañana or turno tarde: in Peru that single fact decides whether our timetable fits yours, and it belongs in the first message rather than the third.',
}
