// ═══════════════════════════════════════════════════════════════════
// BOLIVIA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for agro-industrial, mining, gas, development-sector
// and Bolivian families across Santa Cruz, La Paz, Cochabamba, Tarija
// and Potosí.
// FOURTEENTH LATIN AMERICAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// LEGAL POSITIONING NOTE — BOLIVIA HAS A STRICT STATUTE AND A REAL
// WORKING PRACTICE. BOTH MUST BE STATED. READ ALL:
// - GOVERNING STATUTE: LEY 070 "AVELINO SIÑANI – ELIZARDO PÉREZ",
//   of 20 December 2010, with the Ministerio de Educación as the
//   authority.
//   * ART. 1: every person has the right to receive education at all
//     levels — universal, productive, free, integral and
//     intercultural, without discrimination. Education is a supreme
//     function and first financial responsibility of the State, and
//     "EL ESTADO Y LA SOCIEDAD TIENEN TUICIÓN PLENA SOBRE EL SISTEMA
//     EDUCATIVO" — the State and society have FULL GUARDIANSHIP over
//     the education system. That phrase matters: it is the strongest
//     statist framing in our Latin American coverage.
//   * EDUCATION IS COMPULSORY UP TO BACHILLERATO. Fiscal education
//     is free at all levels up to higher education.
//   * ART. 85 structures the system into subsystems. EDUCACIÓN
//     REGULAR (arts. 9–15) is "sistemática, normada, OBLIGATORIA y
//     procesual", running from Educación Inicial en Familia
//     Comunitaria through Educación Primaria Comunitaria Vocacional
//     to Educación Secundaria Comunitaria Productiva (bachillerato).
//   * EDUCACIÓN INICIAL EN FAMILIA COMUNITARIA recognises and
//     strengthens the FAMILY AND COMMUNITY as the first space of
//     socialisation and learning, lasting five years in two stages,
//     the first "no escolarizada" and of shared family/community
//     responsibility. HEDGE HONESTLY: commentary notes this is
//     largely nominal in practice because pre-school libretas are
//     still requested.
// - COMPULSORY AGE RANGE reported as roughly 5 to 17. Cite as
//   reported and route families to the Ministerio de Educación.
// - COMMENTARY POSITION: the Constitution and the Avelino Siñani law
//   are read as requiring formal education in qualified centres,
//   with possible sanctions for non-attendance. State that.
// - RULINGS BOTH WAYS: commentary reports that in Bolivia and
//   Paraguay, without clear mention in their norms, there have been
//   rulings both in favour of and against home education. State it.
// - *** THE REAL WORKING PRACTICE — MUST BE INCLUDED, IT IS THE MOST
//   USEFUL FACT ON THE PAGE ***: the Bolivian government issued a
//   REGULATION FOR ONLINE EDUCATION (a 2020 reglamento covering
//   educación regular, published by the Ministerio de Educación).
//   Under that regulation, SEVERAL BOLIVIAN SCHOOLS BEGAN WORKING
//   WITH THE HOMESCHOOLING COMMUNITY in the EJE TRONCAL — LA PAZ,
//   SANTA CRUZ and COCHABAMBA — operating as "COLEGIOS SOMBRILLA"
//   (umbrella or cover schools). Community sources also record that
//   in 2018 a formal agreement was concluded with a Bolivian school
//   acting as curriculum provider, though it did not resolve
//   everything.
//   CRITICAL FRAMING: colegios sombrilla provide the BOLIVIAN
//   enrolment, curriculum coverage and domestic record. WE DO NOT.
//   They are COMPLEMENTARY to us, not competitors — a family may
//   well need both. Say this plainly and never imply we substitute
//   for a Bolivian umbrella school.
// - Smartious is NOT authorised by the Bolivian Ministerio de
//   Educación and says so.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT — alongside either an
//   ordinary Bolivian school or a colegio sombrilla arrangement.
// TIMEZONE: BOT (UTC-4), no daylight saving — SEVEN HOURS behind
// Nairobi, same as the Dominican Republic. Bolivian mornings and
// very early afternoons both work: 08:00 BOT = 15:00 Nairobi;
// 11:00 BOT = 18:00 Nairobi. Bolivian schools commonly run turnos
// mañana and tarde.
// MARKET NOTE: Santa Cruz de la Sierra is the economic capital —
// soy, cattle, gas services and the fastest-growing city in the
// country, with the strongest international tier (Santa Cruz
// Cooperative School, Colegio Alemán, Colegio Anglo Americano).
// La Paz holds government, the diplomatic corps and a large
// development and NGO sector, with El Alto alongside. Cochabamba is
// the valley university and agro-processing centre with a long
// missionary and NGO presence. Tarija runs the gas fields of the
// south plus a wine and viticulture industry. Potosí and the
// southwest hold the historic silver mining economy and the Salar de
// Uyuni lithium project, which has drawn international technical
// interest. Bolivia is landlocked, altitude-divided and physically
// hard to travel — which strengthens the live-delivery case.
// ═══════════════════════════════════════════════════════════════════

export const BOLIVIA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'santa-cruz-bo',
    name: 'Santa Cruz de la Sierra',
    county: 'Santa Cruz Department',
    region: 'The economic capital and fastest-growing city in Bolivia · soy, cattle and agro-industry at export scale · gas services and corporate headquarters · the country\'s strongest international school tier',
    primaryKeyword: 'Online school and international curriculum in Santa Cruz de la Sierra',
    heroTagline: 'For Santa Cruz families — Cambridge and IB taught live alongside your school or your colegio sombrilla, whichever you hold.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Santa Cruz families. The eastern lowland capital is Bolivia\'s economic engine — soy, cattle and agro-industry at export scale, gas services, corporate headquarters, and the fastest population growth in the country — with the strongest international school tier Bolivia has, including the Santa Cruz Cooperative School and the German and Anglo-American schools. Bolivia\'s legal framework is strict on educating outside school and yet a real working practice has developed here, and we set out both accurately before anything else.',
    heroImg: '/heroes/santa-cruz-bo.jpg',
    altTexts: { hero: 'Santa Cruz de la Sierra' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Santa Cruz de la Sierra families — the colegio sombrilla practice explained, morning classes. From USD 400/month.',
    challenges: [
      'International school fees in Santa Cruz sit at the top of the Bolivian market with competitive places.',
      'Education is compulsory up to bachillerato under Ley 070, with Educación Regular expressly obligatory.',
      'Families using a colegio sombrilla still need an internationally examined qualification for study abroad.',
      'Smartious is not authorised by the Bolivian Ministerio de Educación.',
      'Time zone: Bolivia runs BOT (UTC-4) with no daylight saving — seven hours behind Nairobi, so mornings and very early afternoons work.',
    ],
    familySituations: [
      'Agro-industrial, soy, and cattle export business families.',
      'Gas services, energy, and corporate headquarters households.',
      'Families already working with a colegio sombrilla who want an international examination track.',
      'Professional families outside the international tier\'s fees.',
      'Students in turno tarde with mornings free.',
      'Students targeting US, Spanish, Brazilian, or Bolivian universities.',
    ],
    nearbyAreas: ['Equipetrol', 'Urubó', 'Warnes', 'Montero', 'Cotoca', 'La Guardia', 'San Ignacio de Velasco'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, Portuguese, German and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Brazilian, Argentine and Bolivian university applications',
    ],
    whyChoose: [
      ['Works alongside a colegio sombrilla, not instead of one', 'Umbrella schools carry the Bolivian enrolment and curriculum coverage; we teach the internationally examined track. Families frequently need both and we say so.'],
      ['Agricultural and business depth for an export capital', 'Cambridge A-Level Biology, Chemistry, Economics and Business suit soy, cattle and agro-industrial families directly.'],
      ['A fee gap against the strongest tier in Bolivia', 'Live small-group teaching at USD 2,160-6,480 a year.'],
      ['Seven hours, not nine', 'Bolivian mornings and very early afternoons both land in our teaching day — better than most of Latin America.'],
      ['The statute stated accurately', 'Ley 070 makes education compulsory up to bachillerato and Educación Regular expressly obligatory. We do not soften that.'],
    ],
    growingReason: 'Santa Cruz de la Sierra is Bolivia\'s economic capital and fastest-growing city — soy, cattle and agro-industry at export scale, gas services and corporate headquarters — with the country\'s strongest international school tier at premium fees. Bolivia runs BOT (UTC-4), seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Santa Cruz families, taught alongside a Bolivian school enrolment or a colegio sombrilla arrangement. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Santa Cruz families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the city\'s IB provision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Bolivian education is governed by Ley 070, the Ley de la Educación "Avelino Siñani – Elizardo Pérez" of 20 December 2010, and the statute is strict in its framing. Article 1 establishes education as a right at all levels and as a supreme function and first financial responsibility of the State, and provides that the State and society have full guardianship — tuición plena — over the education system. Education is compulsory up to bachillerato, and fiscal education is free at all levels. Article 85 structures the system into subsystems, and the Subsistema de Educación Regular set out in articles 9 to 15 is described as systematic, regulated, obligatory and processual, running from Educación Inicial en Familia Comunitaria through Educación Primaria Comunitaria Vocacional to Educación Secundaria Comunitaria Productiva. One provision reads more openly than the rest: Educación Inicial en Familia Comunitaria recognises and strengthens the family and community as the first space of socialisation and learning, with its first stage described as non-schooled and of shared family and community responsibility — though commentary notes that this is largely nominal in practice, since pre-school libretas are still requested. Commentary reads the Constitution and Ley 070 together as requiring formal education in qualified centres, with possible sanctions for non-attendance, and reports that in Bolivia — as in Paraguay — rulings have gone both in favour of and against educating at home. Against that statutory background, a real working practice has developed and Bolivian families deserve to know about it. The government issued a regulation for online education covering educación regular, and under it a number of Bolivian schools began working with the homeschooling community in the eje troncal of La Paz, Santa Cruz and Cochabamba, operating as colegios sombrilla — umbrella schools that carry the enrolment and curriculum coverage for families educating largely at home. Community sources also record a formal agreement concluded in 2018 with a Bolivian school acting as curriculum provider, though it did not resolve every question. We want to be precise about where we sit in that arrangement: a colegio sombrilla provides the Bolivian side — enrolment, national curriculum coverage, the domestic record. Smartious does not. We are not authorised by the Bolivian Ministerio de Educación and we issue no Bolivian qualification. What we teach are Cambridge, Pearson Edexcel, IB and AP examinations, which carry their own international validity. Those are complementary services rather than competing ones, and a family aiming at university abroad may well need both.',
    homeTuitionDetail: 'Smartious delivers to Santa Cruz families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Bolivia sits seven hours behind Nairobi with no daylight saving, so Bolivian morning and very early afternoon classes both fall in our teaching day at a constant time every week, with all sessions recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Bolivia?', a: 'Ley 070 makes education compulsory up to bachillerato and describes Educación Regular as obligatory, with commentary reading the framework as requiring formal education in qualified centres and noting possible sanctions for non-attendance. Reporting also indicates rulings have gone both ways. In practice, a regulation for online education has allowed some Bolivian schools to work with homeschooling families as colegios sombrilla in La Paz, Santa Cruz and Cochabamba. Confirm your own position with the Ministerio de Educación.' },
      { q: 'What is a colegio sombrilla and do you replace one?', a: 'An umbrella school — a Bolivian institution that carries the enrolment and national curriculum coverage for a family educating largely at home. We do not replace one and could not: we are not authorised by the Bolivian Ministerio de Educación and issue no Bolivian qualification. The two are complementary, and families aiming abroad often use both.' },
      { q: 'What do you actually provide?', a: 'Live Cambridge, Edexcel, IB and AP teaching in small groups toward international examinations — the qualification a Bolivian record cannot substitute for at a foreign university.' },
      { q: 'How does the timezone work?', a: 'Seven hours, fixed. Bolivian mornings and very early afternoons both land in our teaching day, and with schools commonly running turno mañana and tarde, most students have one window genuinely free.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'la-paz-bo',
    name: 'La Paz & El Alto',
    county: 'La Paz Department',
    region: 'The seat of government and the diplomatic corps · one of the largest development and NGO sectors in South America · El Alto\'s manufacturing and commercial economy · the highest major city in the world',
    primaryKeyword: 'Online school and international curriculum in La Paz',
    heroTagline: 'For La Paz and El Alto families — a diplomatic and development capital where postings rotate and curricula should not.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for La Paz and El Alto families. The seat of government hosts the diplomatic corps, the international organisations, and one of the largest development and NGO sectors in South America — a population defined by two- and three-year postings — alongside El Alto\'s manufacturing and commercial economy on the altiplano above. For a family who will be in Lima or Nairobi or Geneva next, a curriculum that continues unchanged is worth more than any single campus. Smartious teaches Cambridge and IB live to La Paz, alongside whichever Bolivian arrangement a family holds.',
    heroImg: '/heroes/la-paz-bo.jpg',
    altTexts: { hero: 'La Paz and Illimani' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for La Paz and El Alto families — a development capital built for rotation. From USD 400/month.',
    challenges: [
      'A capital defined by two- and three-year postings, so children change systems repeatedly.',
      'International school places are competitive and fees are high relative to local salaries.',
      'Education is compulsory up to bachillerato under Ley 070.',
      'Development postings rarely align with admission cycles.',
      'Time zone: La Paz shares BOT (UTC-4) with no daylight saving.',
    ],
    familySituations: [
      'Diplomatic, UN and international-organisation families on rotation.',
      'Development, NGO, and cooperation-sector households.',
      'Government, professional and academic families in the capital.',
      'El Alto manufacturing and commercial business households.',
      'Students who have already changed school systems twice and cannot afford a third disruption.',
    ],
    nearbyAreas: ['Zona Sur and Calacoto', 'San Miguel', 'Sopocachi', 'Achumani', 'El Alto', 'Mallasa', 'the Yungas road'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, French, German and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Politics-track subjects, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP World History',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Bolivian university applications',
    ],
    whyChoose: [
      ['Built for a posting cycle', 'The curriculum, teachers, and examination board continue unchanged from La Paz to the next capital — worth more to a rotating family than any single campus.'],
      ['Enrolment on the posting\'s timeline', 'Mid-year arrivals start within a week of the assessment, with no waitlist.'],
      ['Kenya CBC available, which matters here', 'Our development-sector families often have East African postings behind or ahead of them, and CBC continuity is a real option rather than a token one.'],
      ['Seven hours, not nine', 'Bolivian mornings and very early afternoons both land in our teaching day.'],
      ['Alongside your Bolivian arrangement', 'Ordinary school or colegio sombrilla — we teach the international track beside whichever you hold.'],
    ],
    growingReason: 'La Paz hosts the seat of government, the diplomatic corps, and one of the largest development and NGO sectors in South America — a capital defined by two- and three-year postings — alongside El Alto\'s manufacturing and commercial economy. Bolivia runs BOT (UTC-4), seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for La Paz families, portable to the next posting and taught alongside a Bolivian school or colegio sombrilla arrangement.',
      cbc: 'Kenya CBC available for La Paz families with East African ties — a common profile in the development community and one of the more used options here.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the capital\'s IB provision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in La Paz. Ley 070, the Avelino Siñani – Elizardo Pérez law of 2010, makes education compulsory up to bachillerato and describes Educación Regular as systematic, regulated, obligatory and processual, with article 1 providing that the State and society have full guardianship over the education system. Commentary reads the framework as requiring formal education in qualified centres, with possible sanctions for non-attendance, and reports rulings going both ways. In practice, a government regulation for online education opened the way for a number of Bolivian schools to work with homeschooling families as colegios sombrilla, and La Paz is one of the three eje troncal cities where that developed. Those umbrella schools carry the Bolivian enrolment and curriculum coverage; Smartious does not, is not authorised by the Ministerio de Educación, and issues no Bolivian qualification. For diplomatic and development families the residency point also matters: households on posting who remain resident elsewhere follow their own country\'s framework, which is a question for their advisers and one that arises constantly in this community.',
    homeTuitionDetail: 'Smartious delivers to La Paz families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed seven-hour offset, landing in the Bolivian morning or very early afternoon, with every session recorded — which suits diplomatic travel and mid-year arrivals.',
    faqs: [
      { q: 'We are posted here for three years — does an international track make sense?', a: 'It is the strongest case for one. The curriculum, teachers, and examination board continue unchanged to the next capital, which matters more to a rotating family than any single campus.' },
      { q: 'Our previous posting was in East Africa — is there continuity?', a: 'Yes, and it is a common profile here. Kenya CBC is available alongside the Cambridge, IB and American routes, so a child who started in the East African system can continue rather than restart.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'cochabamba-bo',
    name: 'Cochabamba',
    county: 'Cochabamba Department',
    region: 'The valley city and agricultural processing centre · a major university sector · a long-established missionary, NGO and international volunteer presence · the country\'s most temperate climate',
    primaryKeyword: 'Online school and international curriculum in Cochabamba',
    heroTagline: 'For Cochabamba families — the valley city with a long international community and a short list of international schools.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Cochabamba families. The valley city sits at the centre of Bolivia\'s agricultural processing economy, hosts a major university sector, and has carried a long-established missionary, NGO and international volunteer presence — one of the reasons Bolivia\'s homeschooling community has historically been strongest in the eje troncal of which Cochabamba is part. The climate and cost of living have drawn international residents for decades; the international schooling has stayed a short list. Smartious teaches Cambridge and IB live to the valley.',
    heroImg: '/heroes/cochabamba-bo.jpg',
    altTexts: { hero: 'Cochabamba and the valley' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Cochabamba families — valley university city, missionary and NGO community. From USD 400/month.',
    challenges: [
      'A long-established international community with a short list of international schools.',
      'Education is compulsory up to bachillerato under Ley 070.',
      'Families using a colegio sombrilla still need an internationally examined qualification for study abroad.',
      'Missionary and NGO postings arrive and depart on programme timelines.',
      'Time zone: Cochabamba shares BOT (UTC-4) with no daylight saving.',
    ],
    familySituations: [
      'Missionary, NGO, and international volunteer families.',
      'University academic, research, and medical-faculty households.',
      'Agricultural processing and valley business families.',
      'Families already working with a colegio sombrilla in the eje troncal.',
      'Students in turno tarde with mornings free.',
    ],
    nearbyAreas: ['Cochabamba', 'Tiquipaya', 'Quillacollo', 'Sacaba', 'Vinto', 'Punata', 'the Chapare road'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, German and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Physics, Geography',
      'Cambridge A-Level Economics, Business, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Chemistry, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Bolivian university applications',
    ],
    whyChoose: [
      ['Alongside a colegio sombrilla in the eje troncal', 'Cochabamba is one of the three cities where umbrella-school arrangements developed. We add the internationally examined track beside whichever you hold.'],
      ['Pre-medical depth for a university city', 'Cambridge A-Level Biology and Chemistry with Mathematics — the classic spine, and one Cochabamba families aim at in numbers.'],
      ['Built for missionary and NGO rotation', 'Postings move; the curriculum, teachers, and examination board continue unchanged to the next country.'],
      ['Seven hours, not nine', 'Bolivian mornings and very early afternoons both land in our teaching day.'],
      ['The statute stated accurately', 'Ley 070 makes education compulsory up to bachillerato. We do not soften that, and we build alongside a Bolivian arrangement.'],
    ],
    growingReason: 'Cochabamba sits at the centre of Bolivia\'s agricultural processing economy with a major university sector and a long-established missionary, NGO and international volunteer presence — one of the eje troncal cities where umbrella-school arrangements developed — with a short list of international schools. Bolivia runs BOT (UTC-4), seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the valley, taught alongside a Bolivian school or colegio sombrilla arrangement.',
      cbc: 'Kenya CBC available for Cochabamba families with East African ties — common in the mission and development community.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Cochabamba: Ley 070 makes education compulsory up to bachillerato, describes Educación Regular as obligatory, and provides in article 1 that the State and society have full guardianship over the education system. Commentary reads the framework as requiring formal education in qualified centres with possible sanctions for non-attendance, while reporting rulings in both directions. Cochabamba matters specifically because it is one of the three eje troncal cities — with La Paz and Santa Cruz — where a number of Bolivian schools began working with the homeschooling community as colegios sombrilla under the government\'s online-education regulation, and community sources record a formal curriculum-provider agreement concluded with a Bolivian school in 2018. Those umbrella arrangements carry the Bolivian enrolment and curriculum coverage. Smartious does not: we are not authorised by the Ministerio de Educación and issue no Bolivian qualification. We teach the internationally examined track alongside whatever Bolivian arrangement a family holds, and for households aiming at university abroad the two are complementary rather than alternative.',
    homeTuitionDetail: 'Smartious delivers to Cochabamba families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed seven-hour offset, landing in the Bolivian morning or very early afternoon, with every session recorded.',
    faqs: [
      { q: 'We already use a colegio sombrilla — what would you add?', a: 'The internationally examined qualification. The umbrella school carries your Bolivian enrolment and curriculum coverage; we teach Cambridge, Edexcel, IB or AP toward examinations foreign universities read directly. Many families here run both.' },
      { q: 'We are here on a mission or NGO posting — does the schooling travel?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next country, with examinations sat at authorised centres wherever the family is.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'tarija-bo',
    name: 'Tarija & the Southern Gas Fields',
    county: 'Tarija Department',
    region: 'Bolivia\'s hydrocarbon heartland — the southern gas fields and processing plants · a wine and viticulture industry at high altitude · the Argentine border corridor · minimal international schooling',
    primaryKeyword: 'Online school and international curriculum in Tarija',
    heroTagline: 'For Tarija and southern gas families — the fields that fund the country, with schooling built for a provincial capital.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Tarija families. The southern department holds Bolivia\'s hydrocarbon heartland — the gas fields, processing plants and pipeline infrastructure that have funded a substantial share of national revenue, with an engineering and operations workforce recruited nationally and internationally — alongside a distinctive high-altitude wine and viticulture industry and the corridor to the Argentine border. International schooling in the department is minimal, and Santa Cruz and La Paz are both a flight away. Smartious teaches Cambridge and IB live to the south.',
    heroImg: '/heroes/tarija-bo.jpg',
    altTexts: { hero: 'Tarija valley and vineyards' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Tarija and southern Bolivia families — gas fields and vineyards, minimal provision. From USD 400/month.',
    challenges: [
      'Minimal international schooling in Bolivia\'s hydrocarbon heartland.',
      'Santa Cruz and La Paz are both a flight away.',
      'Gas-sector postings move families between fields and countries.',
      'Education is compulsory up to bachillerato under Ley 070.',
      'Time zone: Tarija shares BOT (UTC-4) with no daylight saving.',
    ],
    familySituations: [
      'Gas field, processing plant, and pipeline engineering families.',
      'Hydrocarbon services and contractor households.',
      'Wine, viticulture, and agricultural business families.',
      'Cross-border trading households toward Argentina.',
      'Students aiming at petroleum engineering, chemistry or oenology programmes abroad.',
    ],
    nearbyAreas: ['Tarija', 'Villa Montes', 'Yacuiba', 'Bermejo', 'Valle de la Concepción', 'Entre Ríos', 'the Argentine border'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Chemistry, Physics, Mathematics, Further Mathematics, Biology',
      'Cambridge A-Level Economics, Business, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Chemistry, AP Physics, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including petroleum and chemical engineering), Common Application (US), and Argentine, Spanish and Bolivian university applications',
    ],
    whyChoose: [
      ['Chemistry and engineering depth for a gas region', 'Cambridge A-Level Chemistry, Physics and Mathematics — led by a founder with a BEd in Mathematics and Physics — suit the hydrocarbon workforce precisely.'],
      ['Portable across energy postings', 'Tarija now, another basin or country after — the curriculum and examination board stay constant.'],
      ['The complete option a flight from either city', 'Identical live delivery in Tarija, Santa Cruz and La Paz.'],
      ['Biology and chemistry for the wine sector too', 'Viticulture and oenology routes run on the same science spine, which suits the valley\'s wine families.'],
      ['Seven hours, not nine', 'Bolivian mornings and very early afternoons both land in our teaching day.'],
    ],
    growingReason: 'Tarija holds Bolivia\'s hydrocarbon heartland — the southern gas fields, processing plants and pipeline infrastructure funding a substantial share of national revenue — alongside a high-altitude wine industry and the Argentine border corridor, with minimal international schooling and both major cities a flight away. Bolivia runs BOT (UTC-4), seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the south, taught alongside a Bolivian school or colegio sombrilla arrangement and portable across energy postings.',
      cbc: 'Kenya CBC available for southern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Tarija: Ley 070 makes education compulsory up to bachillerato and describes Educación Regular as obligatory, with commentary reading the framework as requiring formal education in qualified centres and reporting rulings both ways. The colegio sombrilla practice that developed under the government\'s online-education regulation is concentrated in the eje troncal of La Paz, Santa Cruz and Cochabamba, so southern families should ask specifically whether an umbrella arrangement is available to them rather than assume it. Smartious is not authorised by the Bolivian Ministerio de Educación and issues no Bolivian qualification — we teach the internationally examined track alongside whatever Bolivian arrangement a family holds. Cross-border households resident in Argentina follow Argentine law, where education is obligatory through completion of secondary and we are not aware of an established parental home-education route.',
    homeTuitionDetail: 'Smartious delivers to Tarija families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed seven-hour offset, landing in the Bolivian morning or very early afternoon, with every session recorded — built for field rosters and remote sites.',
    faqs: [
      { q: 'We are on a gas-sector posting — does the schooling follow?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next basin or country, with examinations sat at authorised centres wherever the family is.' },
      { q: 'Are colegio sombrilla arrangements available in Tarija?', a: 'That practice developed mainly in the eje troncal of La Paz, Santa Cruz and Cochabamba, so ask specifically rather than assume. Whatever Bolivian arrangement you hold, our teaching runs alongside it.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'potosi-bo',
    name: 'Potosí, Uyuni & the Southwest',
    county: 'Potosí Department',
    region: 'The historic silver and tin mining economy · the Salar de Uyuni lithium project and its international technical interest · one of the highest inhabited regions on earth · essentially no international schooling',
    primaryKeyword: 'Online school and international curriculum in Potosí and Uyuni',
    heroTagline: 'For Potosí, Uyuni and southwestern families — five centuries of mining and the world\'s largest lithium flat, with no international school between them.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families across southwestern Bolivia. Potosí carries an mining economy five centuries old — silver, tin, zinc and the cooperatives that still work Cerro Rico — alongside something much newer: the Salar de Uyuni holds one of the largest lithium resources on earth, and the industrialisation projects around it have drawn international technical and engineering interest to one of the highest and most remote inhabited regions anywhere. What has not arrived is schooling. Smartious teaches Cambridge and IB live to the southwest.',
    heroImg: '/heroes/potosi-bo.jpg',
    altTexts: { hero: 'The Salar de Uyuni' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Potosí, Uyuni and southwestern Bolivia families — mining and lithium, no international schooling. From USD 400/month.',
    challenges: [
      'Essentially no international schooling in one of the most remote inhabited regions on earth.',
      'Santa Cruz and La Paz are long journeys or flights away.',
      'Lithium and mining projects bring international technical staff on multi-year assignments.',
      'Education is compulsory up to bachillerato under Ley 070.',
      'Time zone: the southwest shares BOT (UTC-4) with no daylight saving.',
    ],
    familySituations: [
      'Mining engineering, metallurgy and geology families — Bolivian and international.',
      'Lithium project technical, chemical engineering and processing households.',
      'Mining cooperative and services business families.',
      'Tourism and hospitality households around Uyuni and the southwest circuit.',
      'Students aiming at mining engineering, metallurgy, chemistry or geoscience programmes abroad.',
    ],
    nearbyAreas: ['Potosí', 'Uyuni', 'Llallagua', 'Tupiza', 'Villazón', 'Colchani', 'the Salar circuit'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Chemistry, Physics, Mathematics, Further Mathematics, Geography',
      'Cambridge A-Level Biology, Economics, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Chemistry, AP Physics, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK, including mining and materials programmes), Common Application (US), and Chilean, Canadian, Australian and Bolivian university applications',
    ],
    whyChoose: [
      ['The mining cohort we teach across four continents', 'Antofagasta, Arequipa, Kolwezi, Jwaneng, the Copperbelt — and now Potosí. The same Chemistry, Physics, Mathematics and Geography spine, in the same live groups.'],
      ['Chemistry depth for a lithium region', 'Lithium processing is a chemistry problem before it is anything else, and Cambridge A-Level Chemistry with Mathematics is the route into it.'],
      ['The complete option in a region with none', 'Identical live delivery in Uyuni and Santa Cruz — a long journey closed by a connection rather than a move.'],
      ['Portable to the next operation', 'Potosí now, Chile, Argentina, Australia or Canada next — the curriculum and the board stay constant.'],
      ['Seven hours, not nine', 'Bolivian mornings and very early afternoons both land in our teaching day.'],
    ],
    growingReason: 'Potosí carries a mining economy five centuries old — silver, tin, zinc and the Cerro Rico cooperatives — alongside the Salar de Uyuni, one of the largest lithium resources on earth, whose industrialisation has drawn international technical interest to one of the highest and most remote inhabited regions anywhere, with no international schooling. Bolivia runs BOT (UTC-4), seven hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the southwest, portable across mining postings. Examination sittings planned per session with travel scheduled well ahead.',
      cbc: 'Kenya CBC available for southwestern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American or Canadian universities.',
    },
    homeschoolDetail: 'The national framework applies in the southwest: Ley 070 makes education compulsory up to bachillerato and describes Educación Regular as obligatory, with article 1 providing that the State and society have full guardianship over the education system. Commentary reads the framework as requiring formal education in qualified centres with possible sanctions for non-attendance, while reporting rulings both ways. The colegio sombrilla practice developed mainly in the eje troncal of La Paz, Santa Cruz and Cochabamba, so southwestern families should ask specifically whether an umbrella arrangement is open to them. Smartious is not authorised by the Bolivian Ministerio de Educación and issues no Bolivian qualification; we teach the internationally examined track alongside whatever Bolivian arrangement a family holds. International project staff not resident in Bolivia follow their own country\'s framework, a question for their own advisers.',
    homeTuitionDetail: 'Smartious delivers to southwestern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS on a fixed seven-hour offset, landing in the Bolivian morning or very early afternoon, with the full recorded library built for remote sites and altitude connectivity.',
    faqs: [
      { q: 'We came with a lithium or mining project — does the schooling follow?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next operation anywhere in the world. It is the case we already run for families in Antofagasta, Arequipa, Kolwezi and the Copperbelt.' },
      { q: 'Is there any international schooling in Potosí or Uyuni?', a: 'Essentially none. Live delivery is the route that reaches the southwest without sending a child away, with examination travel a few times a year.' },
      { q: 'Our child wants chemical or mining engineering — what should they take?', a: 'Cambridge A-Level Chemistry and Mathematics with Physics, planned backward from the target university from IGCSE onward. Geography is a useful fourth for geoscience routes.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const BOLIVIA_COUNTRY = {
  slug: 'bolivia',
  name: 'Bolivia',
  longName: 'Plurinational State of Bolivia',
  adjective: 'Bolivian',
  flag: '🇧🇴',
  hub: '/online-school/bolivia',
  hubPageId: 'homeschooling-bolivia',
  cityPageId: 'bolivia-city',

  currency: 'BOB',
  currencyName: 'Boliviano',
  currencyPeg: 'Fees are invoiced in USD, which is widely used in Bolivia for larger commitments; boliviano equivalents are confirmed at invoicing.',

  timezone: {
    code: 'BOT',
    name: 'Bolivia Time (UTC-4), no daylight saving',
    utcOffset: '-4',
    offsetFromEAT: '-7 hours — Bolivian mornings and very early afternoons both land in our teaching day, fixed all year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Bolivia has established Cambridge provision through its international school sector'],
  examCentreTiles: [
    { city: 'Santa Cruz de la Sierra', centre: 'Authorised provision', area: 'The country\'s deepest external-candidate capacity, confirmed per family per session.' },
    { city: 'La Paz and Cochabamba', centre: 'Regional provision', area: 'Checked first for highland and valley families.' },
    { city: 'Tarija and the southwest', centre: 'Planned well ahead', area: 'Southern and Potosí families plan sittings with travel scheduled several weeks in advance.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Bolivia-based students sit as external candidates at authorised provision, with capacity confirmed per family per session — Santa Cruz is checked first, with options in La Paz and Cochabamba and travel planned well ahead from Tarija and the southwest. Bolivia is landlocked, altitude-divided and physically hard to travel, so examination logistics need more lead time here than in most of our markets. One point of clarity that matters especially in Bolivia: where a family uses a colegio sombrilla, that Bolivian school handles the domestic enrolment, curriculum coverage and record. Smartious does not — we are not authorised by the Bolivian Ministerio de Educación and issue no Bolivian qualification. We plan the Cambridge or IB calendar around whichever Bolivian arrangement a family holds.',
  secondaryProgrammeExamRef: 'Authorised Bolivian Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/bolivia.jpg',
  heroEyebrow: 'Online school for Bolivia',
  heroH1Suffix: 'Bolivia',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for agro-industrial, mining, gas, development-sector and Bolivian families across Santa Cruz, La Paz, Cochabamba, Tarija and Potosí. Bolivia has a strict statute and a real working practice — Ley 070 makes education compulsory to bachillerato, while colegios sombrilla operate under the online-education regulation — and we explain both, including exactly where we do and do not fit.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — alongside your Bolivian school or umbrella arrangement.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Bolivia',

  citiesSectionTitle: 'Where our Bolivia families are',
  citiesSectionBody: 'Smartious Bolivia families concentrate across Santa Cruz de la Sierra (the economic capital, soy and cattle at export scale, and the country\'s strongest international tier), La Paz and El Alto (the seat of government, the diplomatic corps and one of South America\'s largest development sectors), Cochabamba (the valley university and agro-processing centre with a long missionary and NGO presence), Tarija (the southern gas fields and a high-altitude wine industry), and Potosí, Uyuni and the southwest (five centuries of mining and one of the largest lithium resources on earth). One strict statute, one working umbrella-school practice, and a seven-hour offset that works.',

  trustSignals: [
    { h: 'The statute stated without softening', p: 'Ley 070, the Avelino Siñani – Elizardo Pérez law of 2010, makes education compulsory up to bachillerato and describes Educación Regular as systematic, regulated, obligatory and processual — with article 1 providing that the State and society have full guardianship over the education system. That is the strictest framing in our Latin American coverage and we do not dress it down.' },
    { h: 'The working practice explained, and where we sit in it', p: 'A government regulation for online education opened the way for Bolivian schools to work with homeschooling families as colegios sombrilla in La Paz, Santa Cruz and Cochabamba. Those umbrella schools carry the Bolivian enrolment and curriculum. We do not — we teach the internationally examined track alongside them, and the two are complementary rather than alternative.' },
    { h: 'Rulings both ways, reported honestly', p: 'Commentary records that in Bolivia, as in Paraguay, without clear mention in the norms there have been rulings both in favour of and against educating at home. We report that rather than presenting a settled answer in either direction.' },
    { h: 'Seven hours, and a country hard to travel', p: 'Bolivia runs BOT (UTC-4) with no daylight saving, seven hours behind our teaching base, so mornings and very early afternoons both work. That matters in a landlocked, altitude-divided country where reaching a campus can mean a flight rather than a drive.' },
  ],

  universitiesInCountry: 'the Universidad Mayor de San Andrés in La Paz, the Universidad Autónoma Gabriel René Moreno in Santa Cruz, the Universidad Mayor de San Simón in Cochabamba, the Universidad Mayor Real y Pontificia de San Francisco Xavier in Sucre — among the oldest in the Americas — and a private sector including UPB and UPSA.',
  universityChannels: 'Bolivian universities admit on the bachillerato through their own admission processes, with foreign qualifications going through recognition procedures confirmed per institution — and the domestic side of a student\'s record has to come from a Bolivian institution rather than from us, which is precisely why families using an umbrella arrangement keep it. Outward, Bolivian students look most often to Argentina, Brazil, Chile and Spain, with the United States and Canada meaningful particularly for the mining and energy sectors, and all of them read Cambridge A-Levels, the IB Diploma and AP records directly. UCAS reads A-Levels natively, and A-Levels are accepted in 160+ countries — including the mining engineering, metallurgy and materials programmes our Potosí and Tarija families most often have in view. Smartious provides personalised university guidance across Argentine, Brazilian, Chilean, Spanish, US, Canadian, UK (UCAS), and Bolivian destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Bolivia families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes on a fixed seven-hour offset with no seasonal drift — Bolivian mornings and very early afternoons both work, which suits both turnos — run alongside either an ordinary Bolivian school enrolment or a colegio sombrilla arrangement, whichever a family holds. Cambridge Spanish available beside the English-medium core. Examinations at authorised provision confirmed per session; Smartious holds no Bolivian ministerial authorisation and issues no Bolivian qualification.',
  britishCurriculumSuits: 'Bolivia families targeting the Cambridge pathway. Best fit for: (1) families already using a colegio sombrilla who need an internationally examined qualification for study abroad, (2) Potosí, Uyuni and Tarija households in mining and gas regions with no international provision, (3) La Paz diplomatic and development families whose postings rotate, (4) Santa Cruz and Cochabamba families outside the international tier\'s fees, (5) students needing a subject their school cannot staff.',
  britishCurriculumDelivery: 'Live online classes in the Bolivian morning or very early afternoon, small groups 4-6 students, every session recorded, alongside a Bolivian school or umbrella arrangement.',
  ibDiplomaSuits: 'Bolivia families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Bolivia families targeting US universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Bolivia is the market where a domestic solution already exists for the domestic problem — colegios sombrilla carry the Bolivian side — which makes it unusually easy for us to say exactly what we add and what we do not.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Potosí\'s mining and lithium households, Tarija\'s gas engineering families, and every medicine-bound student in Cochabamba and Santa Cruz. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Bolivia\'s international schooling concentrates in Santa Cruz, La Paz and Cochabamba — the Santa Cruz Cooperative School, the German and Anglo-American schools, the American Cooperative School in La Paz — with fees at the top of the local market. Outside those three cities there is essentially nothing, which matters in a country whose gas, mining and lithium economies sit in Tarija and Potosí. Bolivia also has a competitive feature few markets do: colegios sombrilla, Bolivian umbrella schools serving homeschooling families under the online-education regulation. Those are not competitors to us so much as the other half of a family\'s arrangement.',
  competitors: [
    { name: 'Santa Cruz Cooperative School and the eastern tier', city: 'Santa Cruz',          curriculum: 'American, IB and international',        feesUsd: 'Top of the Bolivian market',                        feesAed: 'Premium tier',            rating: 4.6, capacityNote: 'The country\'s strongest provision — concentrated in one city' },
    { name: 'American Cooperative School and La Paz tier',      city: 'La Paz',                curriculum: 'American and IB',                       feesUsd: 'Premium tier',                                      feesAed: 'Competitive places',      rating: 4.5, capacityNote: 'Serves the diplomatic and development community — competitive and expensive' },
    { name: 'Colegios sombrilla (umbrella schools)',            city: 'La Paz, Santa Cruz, Cochabamba', curriculum: 'Bolivian national, home-based',  feesUsd: 'Local pricing',                                     feesAed: '—',                       rating: 4.0, capacityNote: 'They hold the Bolivian enrolment and curriculum coverage; we do not. Complementary rather than competing, and many families use both' },
    { name: 'The German and heritage schools',                  city: 'Santa Cruz, La Paz',    curriculum: 'National-system bilingual',              feesUsd: 'Premium tier',                                      feesAed: 'Varies',                  rating: 4.4, capacityNote: 'Established heritage provision — a different route entirely' },
    { name: 'Tarija and the southwest',                         city: 'Gas and mining regions', curriculum: '—',                                    feesUsd: 'No international provision',                        feesAed: '—',                       rating: 0,   capacityNote: 'The hydrocarbon heartland and the lithium southwest, neither with international schooling' },
    { name: 'US-based online schools',                          city: 'Online',                curriculum: 'American online',                       feesUsd: 'Varies, often per-course',                          feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Closer to Bolivia on the clock than we are — families should weigh that against price and class size' },
    { name: 'Smartious Homeschool (Bolivia via online delivery)', city: 'Delivered to all Bolivia', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year',                       feesAed: 'BOB equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + works alongside a colegio sombrilla rather than replacing it + Tarija and Potosí reached + seven hours rather than nine' },
  ],

  legalFrameworkIntro: 'Bolivia has the strictest statutory framing in our Latin American coverage and, at the same time, one of the most practical working arrangements. Both belong on this page, and so does the line between what a Bolivian umbrella school does and what we do.',
  legalFramework: [
    { h: 'Ley 070 and how strictly it reads', p: 'The Ley de la Educación "Avelino Siñani – Elizardo Pérez" of 20 December 2010 governs Bolivian education. Article 1 establishes education as a right at all levels — universal, productive, free, integral and intercultural — and as a supreme function and first financial responsibility of the State, which has an indeclinable obligation to sustain, guarantee and manage it; it provides that the State and society have full guardianship, tuición plena, over the education system. Education is compulsory up to bachillerato and fiscal education is free at all levels. That is the strongest statist framing we encounter anywhere in Latin America, and we would not soften it for a family.' },
    { h: 'Educación Regular, and one provision that reads more openly', p: 'Article 85 structures the system into subsystems, and the Subsistema de Educación Regular set out in articles 9 to 15 is described as systematic, regulated, obligatory and processual, running from Educación Inicial en Familia Comunitaria through Educación Primaria Comunitaria Vocacional to Educación Secundaria Comunitaria Productiva. One provision reads differently from the rest: Educación Inicial en Familia Comunitaria recognises and strengthens the family and community as the first space of socialisation and learning, and its first stage is described as non-schooled and of shared family and community responsibility. Commentary notes, fairly, that this is largely nominal in practice because pre-school libretas are still requested. The compulsory range is reported as roughly five to seventeen; confirm the current boundaries with the Ministerio de Educación.' },
    { h: 'What that has meant in practice, and rulings both ways', p: 'Commentary reads the Constitution and Ley 070 together as requiring formal education in qualified centres, with possible sanctions for non-attendance. It also reports that in Bolivia — as in Paraguay — without clear mention in the norms, there have been rulings both in favour of and against educating at home. We give that as the honest state of things: a strict statute, no explicit home-education provision, and a judicial picture that has not settled.' },
    { h: 'The colegios sombrilla, which are the practical answer here', p: 'This is the most useful part of the page for a Bolivian family, and it is rarely explained properly. The government issued a regulation covering online education within educación regular, and under it a number of Bolivian schools began working with the homeschooling community in the eje troncal — La Paz, Santa Cruz and Cochabamba — operating as colegios sombrilla, or umbrella schools. Community sources also record that in 2018 a formal agreement was concluded with a Bolivian school acting as curriculum provider, though it did not resolve every question. What an umbrella school provides is the Bolivian side of the arrangement: the enrolment, the national curriculum coverage, and the domestic record. Families outside the three main cities should ask specifically whether an arrangement is open to them rather than assume it, since the practice developed in the eje troncal.' },
    { h: 'Where we sit, stated precisely', p: 'Smartious is not authorised by the Bolivian Ministerio de Educación, does not operate premises in Bolivia, and issues no Bolivian qualification. We are not an umbrella school and cannot substitute for one. What we teach are Cambridge IGCSE and A-Level, Pearson Edexcel, the IB Diploma and Advanced Placement — internationally examined qualifications read directly by universities abroad, which a Bolivian domestic record cannot substitute for at a foreign admissions office. So the two services are complementary rather than alternative: the umbrella school or ordinary school carries Bolivia, and we carry the international track. A family aiming at university outside Bolivia frequently needs both, and we would rather draw that line clearly than let anyone assume we cover the domestic side.' },
    { h: 'The timezone, and a country that is hard to cross', p: 'Bolivia runs BOT at UTC-4 with no daylight saving against our UTC+3, a fixed seven-hour gap — the same as the Dominican Republic and materially better than Costa Rica, Guatemala or Mexico at nine. Bolivian morning and very early afternoon classes both fall in our teaching day, and with schools commonly running turno mañana and tarde, most students have one window genuinely free. That matters more here than the arithmetic suggests: Bolivia is landlocked, divided by altitude and genuinely hard to travel, so for families in Potosí, Uyuni or the southern gas fields, reaching a campus can mean a flight rather than a drive — and live delivery closes that distance without a move.' },
  ],

  whySmartious: [
    { h: 'We work alongside a colegio sombrilla, not against one',        p: 'Umbrella schools carry the Bolivian enrolment and curriculum; we carry the internationally examined track. Complementary services, and we say so rather than implying we cover both.' },
    { h: 'The statute stated without softening',                          p: 'Ley 070 makes education compulsory to bachillerato and Educación Regular expressly obligatory, with the State holding full guardianship over the system. We do not dress that down.' },
    { h: 'Tarija and the southwest reached',                              p: 'The gas fields and the lithium region carry Bolivia\'s economy and have no international schooling at all.' },
    { h: 'The mining cohort, four continents deep',                       p: 'Potosí sits in the same live classes as Antofagasta, Arequipa, Kolwezi and the Copperbelt — one subject spine, one examination board, full portability.' },
    { h: 'Seven hours in a country hard to cross',                        p: 'Mornings and very early afternoons both work, which matters where reaching a campus means a flight rather than a drive.' },
    { h: 'Kenya CBC for the development sector',                          p: 'La Paz\'s rotating development community often arrives from or departs to East Africa, and CBC continuity is a real option here rather than a token one.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Bolivia?', a: 'Ley 070, the Avelino Siñani – Elizardo Pérez law of 2010, makes education compulsory up to bachillerato and describes Educación Regular as systematic, regulated, obligatory and processual, with article 1 giving the State and society full guardianship over the education system. Commentary reads the framework as requiring formal education in qualified centres with possible sanctions for non-attendance, and reports rulings going both ways. In practice, a regulation for online education has allowed some Bolivian schools to work with homeschooling families as colegios sombrilla. Confirm your own position with the Ministerio de Educación.' },
    { q: 'What is a colegio sombrilla?', a: 'A Bolivian umbrella school that carries the enrolment, national curriculum coverage and domestic record for a family educating largely at home. The practice developed under the government\'s online-education regulation in La Paz, Santa Cruz and Cochabamba. Families elsewhere should ask specifically whether an arrangement is available rather than assume it.' },
    { q: 'Are you an umbrella school, or do you replace one?', a: 'Neither. We are not authorised by the Bolivian Ministerio de Educación and issue no Bolivian qualification. We teach Cambridge, Edexcel, IB and AP toward international examinations. The two services are complementary — the umbrella school covers Bolivia, we cover the international track — and families aiming abroad often need both.' },
    { q: 'Why would we need an international qualification as well?', a: 'Because a Bolivian domestic record is assessed by foreign universities through recognition procedures, whereas Cambridge A-Levels, the IB Diploma and AP records are read directly. If your child will apply abroad, that difference is the whole argument.' },
    { q: 'Does the compulsory range really run to bachillerato?', a: 'Yes — Ley 070 makes education compulsory up to bachillerato, with the range reported as roughly five to seventeen. Confirm the current boundaries for your child with the Ministerio de Educación.' },
    { q: 'How does the timezone work?', a: 'Seven hours, fixed — the same as the Dominican Republic and better than most of our Latin American markets. Bolivian mornings and very early afternoons both land in our teaching day, and turno mañana/tarde leaves most students one window free.' },
    { q: 'Where do Bolivian students sit Cambridge examinations?', a: 'At authorised provision confirmed per family per session — Santa Cruz first, with options in La Paz and Cochabamba and travel planned well ahead from Tarija and the southwest, since Bolivia is genuinely hard to cross.' },
    { q: 'Which parts of Bolivia does Smartious cover?', a: 'Santa Cruz de la Sierra, La Paz and El Alto, Cochabamba, Tarija and the southern gas fields, and Potosí, Uyuni and the southwest have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us whether your child is at an ordinary Bolivian school or under a colegio sombrilla arrangement: in Bolivia that determines what we are adding and what is already covered, and it belongs in the first message.',
}
