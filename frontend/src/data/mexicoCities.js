// ═══════════════════════════════════════════════════════════════════
// MEXICO — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for corporate, industrial, expat, and Mexican
// families across CDMX, Monterrey, Guadalajara, Querétaro and Cancún.
// FIRST LATIN AMERICAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// TIMEZONE — THE HARDEST IN OUR ENTIRE COVERAGE. BE HONEST:
// Mexico runs CST (UTC-6) across most of the country with no
// daylight saving since 2022. Nairobi is UTC+3 — a NINE-HOUR gap.
// A Mexican after-school slot at 16:00 is 01:00 in Nairobi. THE
// STANDARD SUPPLEMENTARY MODEL DOES NOT WORK HERE and we must not
// pretend otherwise.
// WHAT DOES WORK — and it is genuinely specific to Mexico:
//   * MEXICAN MORNING = NAIROBI LATE AFTERNOON/EVENING. A 07:00-10:00
//     Mexican block is 16:00-19:00 in Nairobi, a normal teaching slot.
//   * Mexican schools very commonly run TURNO MATUTINO and TURNO
//     VESPERTINO (morning and afternoon shifts). A student in turno
//     vespertino has MORNINGS FREE — which is exactly our window.
//     THIS IS THE KEY MARKET INSIGHT FOR MEXICO. Lead with it.
//   * Full-time and post-compulsory students take mornings anyway.
// Always state the nine-hour gap plainly, then give these solutions.
// Never bury it.
//
// LEGAL POSITIONING NOTE:
// - ARTICLE 3 OF THE CONSTITUTION makes education compulsory through
//   EDUCACIÓN MEDIA SUPERIOR (upper secondary) — compulsory schooling
//   in Mexico runs further than in most countries we serve, covering
//   preescolar, primaria, secundaria AND media superior. There is
//   therefore NO post-compulsory window of the kind our Balkan and
//   Angolan pages describe. Do not invent one.
// - The LEY GENERAL DE EDUCACIÓN governs the system; the SEP
//   (Secretaría de Educación Pública) is the authority.
// - PRIVATE SCHOOLS require RVOE — Reconocimiento de Validez Oficial
//   de Estudios — for their studies to have official validity.
//   CONSEQUENCE, STATE PLAINLY: Smartious does NOT hold RVOE and does
//   not present itself as a Mexican school with official validity.
//   We work ALONGSIDE a school that does. Same disclosure family as
//   Ghana, Botswana, DRC, Australia.
// - PARENTAL-CHOICE HOME EDUCATION is not established as a route we
//   can identify. Phrase as "not established / we are not aware of"
//   plus "confirm with the SEP and your state education authority" —
//   education is administered with significant state-level roles.
// - ACCREDITATION OF KNOWLEDGE: the SEP operates mechanisms for
//   accrediting knowledge acquired outside the school system,
//   commonly referenced by the acuerdo that established them, with
//   examinations administered by the national evaluation body.
//   HEDGE HARD: describe functionally, note eligibility and age
//   rules are set by the SEP, tell families to confirm directly,
//   and NEVER present it as a homeschooling route.
// - REVALIDACIÓN: foreign studies are revalidated through SEP
//   procedures. Mention as a defined process, not automatic.
// MARKET NOTE: Mexico has one of the largest and best-established
// international school markets in the Americas — the American
// Schools in CDMX, Monterrey and Guadalajara, Greengates, Edron,
// the German, French and Japanese schools, and a very large IB
// sector (Mexico has among the most IB World Schools in Latin
// America). Fees are high. Economy: the CDMX corporate and
// financial centre; Monterrey's industrial and corporate base;
// Guadalajara's technology sector; the Bajío automotive and
// aerospace corridor around Querétaro, Guanajuato and Aguascalientes
// with its German, Japanese and Korean workforce; and the Riviera
// Maya's tourism, second-home and remote-work population.
// ═══════════════════════════════════════════════════════════════════

export const MEXICO_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'cdmx-mx',
    name: 'Mexico City',
    county: 'Ciudad de México and the Valle de México',
    region: 'The capital and corporate centre of Latin America\'s second-largest economy · a deep international and IB school market at premium fees · the diplomatic community · a large remote-work and returning-diaspora population',
    primaryKeyword: 'Online school and international curriculum in Mexico City',
    heroTagline: 'For CDMX families — Cambridge and IB taught live in the morning, which in Mexico is exactly when the vespertino students are free.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Mexico City families. CDMX is the corporate and financial capital of Latin America\'s second-largest economy, with one of the deepest international and IB school markets in the Americas — and fees to match. Under Article 3 of the Constitution education is compulsory through media superior, so a Mexican student is inside the system for longer than in most countries we serve, and our role is alongside a school rather than instead of one. One practical point we lead with rather than bury: we teach from Nairobi, nine hours ahead, so our classes land in the Mexican morning. For students in turno vespertino, that is precisely the free half of the day.',
    heroImg: '/heroes/cdmx-mx.jpg',
    altTexts: { hero: 'Mexico City skyline' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Mexico City families — morning classes that fit the turno vespertino. From USD 400/month.',
    challenges: [
      'International and IB school fees in CDMX sit among the highest in Latin America.',
      'Education is compulsory through media superior under Article 3, so there is no post-compulsory window before eighteen.',
      'We teach nine hours ahead of Mexico, so afternoon classes are not possible — mornings are.',
      'Private schools need RVOE for official validity, and Smartious does not hold it.',
      'Time zone: Mexico runs CST (UTC-6) with no daylight saving since 2022 — a fixed nine-hour gap behind Nairobi, so our teaching lands in the Mexican morning.',
    ],
    familySituations: [
      'Corporate, financial, and professional families outside the international tier\'s fees.',
      'Students in turno vespertino whose mornings are free.',
      'Diplomatic and international-organisation families.',
      'Remote-work and returning-diaspora households from the US and Canada.',
      'Families wanting Cambridge A-Levels where the local market is dominated by IB and the American curriculum.',
      'Students preparing for UK, Canadian, Spanish, or US universities.',
    ],
    nearbyAreas: ['Polanco', 'Santa Fe', 'Coyoacán', 'Lomas de Chapultepec', 'Interlomas', 'Cuajimalpa', 'Toluca'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, French and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Mexican university applications',
    ],
    whyChoose: [
      ['Morning classes, which is the point in Mexico', 'We teach nine hours ahead, so our block lands in the Mexican morning — the free half of the day for every student in turno vespertino, and the natural slot for full-time ones.'],
      ['Cambridge in an IB and American market', 'CDMX is well supplied with IB and US-curriculum schools and thin on Cambridge A-Levels. Families targeting UCAS often have to look outside their campus — which is exactly what we teach.'],
      ['A fee gap even by Latin American standards', 'Live small-group teaching at USD 2,160-6,480 a year against a capital tier priced among the highest in the region.'],
      ['What we are, stated plainly', 'Smartious does not hold RVOE and is not a Mexican school with official validity. We work alongside one that is.'],
      ['Spanish kept alongside', 'Cambridge Spanish runs beside the English-medium core, protecting Mexican and Spanish university routes.'],
    ],
    growingReason: 'Mexico City is the corporate and financial capital of Latin America\'s second-largest economy, with one of the deepest international and IB school markets in the Americas at premium fees — inside a system where education is compulsory through media superior. Mexico runs CST (UTC-6) with no daylight saving, nine hours behind Nairobi, so our teaching lands in the Mexican morning.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for CDMX families, taught in the Mexican morning alongside a school enrolment. Examinations at authorised centres confirmed per family per session; Mexico has established Cambridge provision.',
      cbc: 'Kenya CBC available for CDMX families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the capital\'s large IB sector.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Mexican education law starts with Article 3 of the Constitution, which makes education compulsory through educación media superior — upper secondary. That is a longer compulsory range than most countries we serve, and it means there is no post-compulsory window in Mexico of the kind our Balkan or Angolan pages describe. The Ley General de Educación governs the system and the SEP is the authority, with significant state-level administration. Private schools require RVOE — Reconocimiento de Validez Oficial de Estudios — for their studies to carry official validity, and we say plainly that Smartious does not hold RVOE and is not a Mexican school with official validity; we work alongside one that is. We are not aware of an established parental-choice home-education route, and we phrase it that way rather than asserting a categorical prohibition — confirm with the SEP and your state education authority. The SEP does operate mechanisms for accrediting knowledge acquired outside the school system, with examinations administered by the national evaluation body; eligibility and age rules for those are set by the SEP and should be confirmed directly, and we do not present them as a homeschooling route. Foreign studies are brought into the Mexican system through revalidación, a defined SEP process rather than an automatic recognition.',
    homeTuitionDetail: 'Smartious delivers to Mexico City families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Mexican morning. With a fixed nine-hour gap and no daylight saving on either side, a 07:00-10:00 Mexican block sits in our normal late-afternoon teaching hours, every week of the year, with all sessions recorded.',
    faqs: [
      { q: 'Nine hours is a big gap — how does this actually work?', a: 'It works in one direction and we are direct about that: our classes land in the Mexican morning, not the afternoon. A 07:00-10:00 block in Mexico is late afternoon in Nairobi. For a student in turno vespertino whose school runs in the afternoon, that is the free half of the day; for a full-time or post-compulsory student it is the natural teaching slot. An after-school arrangement is not possible from our side, and we would rather say so than sell you one.' },
      { q: 'Is homeschooling legal in Mexico?', a: 'Education is compulsory through media superior under Article 3 of the Constitution, and we are not aware of an established parental-choice home-education route. We put it in those terms rather than asserting a flat prohibition — confirm with the SEP and your state education authority. Structured study alongside a school enrolment is unrestricted.' },
      { q: 'Does Smartious have RVOE?', a: 'No, and we say so plainly. Private schools require RVOE for their studies to carry official validity in Mexico. Smartious is an internationally accredited online school working alongside a Mexican school that holds it.' },
      { q: 'Why Cambridge when CDMX has so many IB schools?', a: 'Because the market is thin on Cambridge A-Levels. Families targeting UK universities through UCAS frequently find their campus does not offer the route, and A-Levels remain the most directly read qualification for that destination.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'monterrey-mx',
    name: 'Monterrey',
    county: 'Nuevo León',
    region: 'Mexico\'s industrial and corporate capital · the nearshoring boom and its international workforce · Tec de Monterrey and a strong private-school tradition · two hours from the US border',
    primaryKeyword: 'Online school and international curriculum in Monterrey',
    heroTagline: 'For Monterrey and Nuevo León families — the nearshoring capital, where morning classes fit both the vespertino shift and an industrial working week.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Monterrey families. Monterrey is Mexico\'s industrial and corporate capital and the centre of the nearshoring boom — manufacturing groups, logistics along the border corridor, and a growing international workforce arriving with the investment, alongside Tec de Monterrey and one of the strongest private-school traditions in the country. Its international schools are good and priced accordingly. We teach in the Mexican morning from Nairobi, which suits students in turno vespertino and full-time learners alike, and we work alongside a school that holds RVOE rather than claiming to replace it.',
    heroImg: '/heroes/monterrey-mx.jpg',
    altTexts: { hero: 'Monterrey and the Cerro de la Silla' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Monterrey and Nuevo León families — nearshoring capital, morning classes. From USD 400/month.',
    challenges: [
      'Strong private and international schools priced at the top of the Mexican market.',
      'Nearshoring is bringing international staff faster than school places open.',
      'Education is compulsory through media superior, so there is no post-compulsory window.',
      'Our teaching lands in the Mexican morning, not the afternoon — nine hours ahead, fixed.',
      'Private schools need RVOE for official validity, and Smartious does not hold it.',
    ],
    familySituations: [
      'Manufacturing, industrial, and corporate-group families.',
      'International staff arriving with nearshoring investment from the US, Asia, and Europe.',
      'Logistics and border-corridor business families.',
      'Students in turno vespertino with mornings free.',
      'Families targeting US, Canadian, or UK universities from a Mexican school base.',
    ],
    nearbyAreas: ['San Pedro Garza García', 'Santa Catarina', 'Apodaca', 'Guadalupe', 'Saltillo', 'Nuevo Laredo corridor', 'Ramos Arizpe'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, German and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Mexican university applications',
    ],
    whyChoose: [
      ['Engineering depth for an industrial capital', 'Cambridge A-Level Mathematics, Further Mathematics, and Physics — led by a founder with a BEd in Mathematics and Physics — suit the families the nearshoring boom is bringing in.'],
      ['Morning classes that fit the vespertino shift', 'Our teaching block lands in the Mexican morning, which is free for every student whose school runs in the afternoon.'],
      ['Cambridge alongside an American-leaning market', 'Monterrey looks north for university, and A-Levels are read by UK, Canadian, and US institutions alike — a broader record than a single-market curriculum.'],
      ['A fee gap at the top of the Mexican market', 'Live small-group teaching at USD 2,160-6,480 a year.'],
      ['What we are, stated plainly', 'No RVOE, no claim to official validity — we work alongside a Mexican school that has it.'],
    ],
    growingReason: 'Monterrey is Mexico\'s industrial and corporate capital and the centre of the nearshoring boom, with manufacturing groups, border-corridor logistics, Tec de Monterrey, and a strong private-school tradition priced at the top of the national market. Mexico runs CST (UTC-6), nine hours behind Nairobi, so our teaching lands in the Mexican morning.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Nuevo León, taught in the Mexican morning alongside a school enrolment. Examinations at authorised centres confirmed per session.',
      cbc: 'Kenya CBC available for Monterrey families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Nuevo León: education is compulsory through media superior under Article 3, the Ley General de Educación governs, and private schools require RVOE for official validity. Smartious does not hold RVOE and works alongside a school that does. We are not aware of an established parental-choice home-education route — confirm with the SEP and the state education authority. For nearshoring families the supplementary configuration also travels: the curriculum and examination board continue unchanged if a posting moves on to another country.',
    homeTuitionDetail: 'Smartious delivers to Monterrey families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Mexican morning on a fixed nine-hour offset, with every session recorded — which suits industrial households and shift patterns.',
    faqs: [
      { q: 'We arrived with a nearshoring investment — does the schooling travel if we move again?', a: 'Yes: the same curriculum, teachers, and examination board continue to the next posting anywhere in the world, with examinations sat at authorised centres wherever the family is.' },
      { q: 'Can our child do this after school?', a: 'No — and we say so directly. We are nine hours ahead, so our classes land in the Mexican morning. It works for students in turno vespertino and for full-time learners, not as an after-school arrangement.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'guadalajara-mx',
    name: 'Guadalajara',
    county: 'Jalisco',
    region: 'Mexico\'s technology capital — the software, semiconductor and electronics cluster · a large international remote-work community · a strong university and medical sector · Lake Chapala\'s expatriate belt nearby',
    primaryKeyword: 'Online school and international curriculum in Guadalajara',
    heroTagline: 'For Guadalajara and Jalisco families — Mexico\'s tech capital, where morning classes fit a remote-work household as neatly as a vespertino timetable.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Guadalajara families. Guadalajara is Mexico\'s technology capital — a software, semiconductor, and electronics cluster that has drawn global firms and a substantial international remote-work community, alongside a strong university and medical sector and, an hour south, the long-established expatriate belt around Lake Chapala. Its international schooling is decent and concentrated. We teach in the Mexican morning from Nairobi, which suits vespertino students and remote-work households alike, and we run alongside a school holding RVOE rather than claiming to replace it.',
    heroImg: '/heroes/guadalajara-mx.jpg',
    altTexts: { hero: 'Guadalajara cathedral and the city' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Guadalajara and Jalisco families — tech capital, morning classes, Lake Chapala belt. From USD 400/month.',
    challenges: [
      'International school provision is concentrated and priced at the upper end of the local market.',
      'A large remote-work and expatriate community arriving faster than places open.',
      'Education is compulsory through media superior, so there is no post-compulsory window.',
      'Our teaching lands in the Mexican morning, nine hours ahead, fixed.',
      'Private schools need RVOE for official validity, and Smartious does not hold it.',
    ],
    familySituations: [
      'Software, semiconductor, and electronics-sector families.',
      'International remote-work households drawn to Jalisco.',
      'Lake Chapala expatriate and retiree families with school-age children.',
      'University and medical-sector academic families.',
      'Students in turno vespertino with mornings free.',
    ],
    nearbyAreas: ['Zapopan', 'Tlaquepaque', 'Tonalá', 'Chapala and Ajijic', 'Puerto Vallarta', 'Tequila', 'Tlajomulco'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Computer Science',
      'Cambridge A-Level Economics, Business, Biology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Computer Science A, AP Physics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Mexican university applications',
    ],
    whyChoose: [
      ['Computing depth for Mexico\'s tech capital', 'Cambridge A-Level Computer Science, Mathematics, and Further Mathematics suit the sector that defines Guadalajara.'],
      ['Built for remote-work households', 'A family that already structures its own day finds a morning teaching block easier to build around than a fixed school run.'],
      ['Reaches the Chapala belt', 'The expatriate communities around Ajijic and Chapala are an hour from the city\'s schools; live delivery removes the commute entirely.'],
      ['Morning classes that fit the vespertino shift', 'Our block lands in the Mexican morning, free for every afternoon-shift student.'],
      ['What we are, stated plainly', 'No RVOE, no claim to official validity — we work alongside a Mexican school that has it.'],
    ],
    growingReason: 'Guadalajara is Mexico\'s technology capital — a software, semiconductor, and electronics cluster with a large international remote-work community, a strong university and medical sector, and the Lake Chapala expatriate belt an hour south. Mexico runs CST (UTC-6), nine hours behind Nairobi, so our teaching lands in the Mexican morning.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Jalisco, taught in the Mexican morning alongside a school enrolment. Examinations at authorised centres confirmed per session.',
      cbc: 'Kenya CBC available for Jalisco families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Jalisco: education is compulsory through media superior under Article 3, private schools require RVOE for official validity, and Smartious does not hold RVOE — we work alongside a school that does. We are not aware of an established parental-choice home-education route; confirm with the SEP and the state education authority. For international remote-work and Chapala-belt families the supplementary configuration works particularly well, since the morning teaching block fits a household that already sets its own schedule.',
    homeTuitionDetail: 'Smartious delivers to Jalisco families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Mexican morning on a fixed nine-hour offset, with every session recorded.',
    faqs: [
      { q: 'We live around Lake Chapala — is a daily run into Guadalajara avoidable?', a: 'For the teaching, entirely. Live classes reach Ajijic and Chapala identically, with examinations sat at authorised centres a few times a year.' },
      { q: 'Can our child take Computer Science at A-Level?', a: 'Yes, and it is a common choice in Guadalajara for obvious reasons. It runs live in small groups alongside Mathematics and Further Mathematics.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'queretaro-mx',
    name: 'Querétaro & the Bajío',
    county: 'Querétaro, Guanajuato and Aguascalientes',
    region: 'The automotive and aerospace corridor · German, Japanese and Korean manufacturing communities · one of Mexico\'s fastest-growing regions · international schooling that has not kept pace with the investment',
    primaryKeyword: 'Online school and international curriculum in Querétaro and the Bajío',
    heroTagline: 'For Querétaro, León and Bajío families — the corridor that builds cars and aircraft, with schools that arrived later than the plants.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families across the Bajío corridor. Querétaro, Guanajuato, and Aguascalientes form Mexico\'s automotive and aerospace heartland — assembly plants and supplier parks, an aerospace cluster around Querétaro, and German, Japanese, and Korean manufacturing communities that arrived with the investment. It is among the fastest-growing regions in the country, and its international schooling has not kept pace with the plants. Smartious delivers Cambridge and IB live in the Mexican morning, alongside a school holding RVOE — the same corridor logic our Slovak, Hungarian, and Serbian plant-city pages run.',
    heroImg: '/heroes/queretaro-mx.jpg',
    altTexts: { hero: 'Querétaro and the Bajío corridor' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Querétaro, León and Bajío families — automotive and aerospace corridor. From USD 400/month.',
    challenges: [
      'International schooling has not kept pace with one of Mexico\'s fastest-growing industrial regions.',
      'German, Japanese, and Korean manufacturing families arrive on production timelines, not admission cycles.',
      'Education is compulsory through media superior, so there is no post-compulsory window.',
      'Our teaching lands in the Mexican morning, nine hours ahead, fixed.',
      'Private schools need RVOE for official validity, and Smartious does not hold it.',
    ],
    familySituations: [
      'Automotive assembly and supplier-park engineering families.',
      'Aerospace cluster families around Querétaro.',
      'German, Japanese, and Korean manufacturing management households.',
      'Mexican professional families in a fast-growing region with limited provision.',
      'Students in turno vespertino with mornings free.',
    ],
    nearbyAreas: ['Querétaro', 'San Miguel de Allende', 'León', 'Silao', 'Celaya', 'Irapuato', 'Aguascalientes'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, German, Japanese community support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Design and Technology-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and German, Japanese, Canadian and Mexican university applications',
    ],
    whyChoose: [
      ['The corridor case we have run four times already', 'Győr, Žilina, Kragujevac, and now the Bajío — world-class plants, internationally recruited engineers, and schooling built for someone else. We teach the same track in all of them.'],
      ['Engineering and aerospace depth', 'Cambridge A-Level Mathematics, Further Mathematics, and Physics suit assembly, supplier, and aerospace families precisely.'],
      ['Portable to the next plant', 'Querétaro now, Germany, Japan, or another Mexican site after — the curriculum, teachers, and examination board stay constant.'],
      ['Morning classes that fit the vespertino shift', 'Our block lands in the Mexican morning, free for every afternoon-shift student.'],
      ['What we are, stated plainly', 'No RVOE, no claim to official validity — we work alongside a Mexican school that has it.'],
    ],
    growingReason: 'Querétaro, Guanajuato, and Aguascalientes form Mexico\'s automotive and aerospace heartland — assembly plants, supplier parks, an aerospace cluster, and German, Japanese, and Korean manufacturing communities — in one of the country\'s fastest-growing regions, with international schooling that has not kept pace. Mexico runs CST (UTC-6), nine hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Bajío, taught in the Mexican morning alongside a school enrolment. Examinations at authorised centres confirmed per session.',
      cbc: 'Kenya CBC available for Bajío families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies across the Bajío: education is compulsory through media superior under Article 3, private schools require RVOE for official validity, and Smartious does not hold RVOE — we work alongside a school that does. We are not aware of an established parental-choice home-education route; confirm with the SEP and your state education authority. For the corridor\'s international manufacturing families the supplementary configuration is the natural one, and it travels unchanged to the next plant wherever in the world that is.',
    homeTuitionDetail: 'Smartious delivers to Bajío families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Mexican morning on a fixed nine-hour offset, with every session recorded — built for shift-pattern industrial households.',
    faqs: [
      { q: 'We came with a German or Japanese manufacturer — is there a school for us here?', a: 'Provision has not kept pace with the plants. Smartious delivers the Cambridge pathway live in the Mexican morning, alongside a local school, and it continues unchanged if the posting moves on.' },
      { q: 'Where do Bajío students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session; Mexico has established Cambridge provision, with capacity checked per series.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'cancun-mx',
    name: 'Cancún & the Riviera Maya',
    county: 'Quintana Roo',
    region: 'Mexico\'s tourism capital · Playa del Carmen and Tulum\'s remote-work and second-home communities · an international resident population growing faster than its schools · a season that runs much of the year',
    primaryKeyword: 'Online school and international curriculum in Cancún and the Riviera Maya',
    heroTagline: 'For Cancún, Playa del Carmen and Tulum families — the coast the world moved to, with schooling that never caught up.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for families across the Riviera Maya. Quintana Roo has changed faster than almost anywhere in Mexico: Cancún\'s tourism economy, Playa del Carmen and Tulum\'s remote-work and second-home communities, and an international resident population — American, Canadian, European, Argentine — that has grown far quicker than the schools serving it. Add a hospitality season that runs most of the year and a geography strung along a coast, and the schooling problem is both a supply problem and a logistics one. We teach live in the Mexican morning, which suits a household working the season and a vespertino timetable alike.',
    heroImg: '/heroes/cancun-mx.jpg',
    altTexts: { hero: 'The Riviera Maya coast' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Cancún, Playa del Carmen and Tulum families — international residents, thin schooling. From USD 400/month.',
    challenges: [
      'An international resident population growing far faster than the schools serving it.',
      'A hospitality season that runs much of the year and shapes the whole household.',
      'Families strung along a coast rather than clustered near one campus.',
      'Education is compulsory through media superior for children resident in Mexico.',
      'Our teaching lands in the Mexican morning, nine hours ahead, fixed.',
    ],
    familySituations: [
      'Hotel, hospitality, and tourism business families.',
      'Remote-work and second-home households in Playa del Carmen and Tulum.',
      'American, Canadian, European, and Argentine resident families.',
      'Families arriving mid-curriculum from other systems and possibly moving again.',
      'Students in turno vespertino with mornings free.',
    ],
    nearbyAreas: ['Cancún', 'Playa del Carmen', 'Tulum', 'Puerto Morelos', 'Cozumel', 'Bacalar', 'Mérida'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish, French and home language support',
      'Cambridge A-Level Mathematics, Physics, Chemistry, Biology, Geography',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Biology, AP Environmental Science',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Spanish and Mexican university applications',
    ],
    whyChoose: [
      ['Built for a season that runs most of the year', 'Live classes plus unlimited recordings hold the academic year together when the household works the coast.'],
      ['Reaches the whole coast identically', 'Cancún, Playa, Tulum, Bacalar — no commute to a single campus, which along this coastline is the real constraint.'],
      ['Continuity for families who may move again', 'One curriculum, one teaching team, one examination board, wherever the next country is.'],
      ['Morning classes that fit the vespertino shift', 'Our block lands in the Mexican morning, free for every afternoon-shift student.'],
      ['Spanish kept alongside', 'Cambridge Spanish runs beside the English-medium core for families settling long-term.'],
    ],
    growingReason: 'Quintana Roo has changed faster than almost anywhere in Mexico — Cancún\'s tourism economy, Playa del Carmen and Tulum\'s remote-work and second-home communities, and an international resident population growing far faster than the schools serving it. Mexico runs CST (UTC-6), nine hours behind Nairobi, so our teaching lands in the Mexican morning.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Riviera Maya, taught in the Mexican morning alongside a school enrolment. Examination sittings planned per session with travel scheduled ahead.',
      cbc: 'Kenya CBC available for Riviera Maya families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national framework applies in Quintana Roo: education is compulsory through media superior under Article 3 for children resident in Mexico, private schools require RVOE for official validity, and Smartious does not hold RVOE — we work alongside a school that does. We are not aware of an established parental-choice home-education route; confirm with the SEP and the state education authority. Families here on a non-resident basis follow their country of residence\'s framework, a status they determine with their own advisers — a common question along this coast and one we state precisely rather than blur.',
    homeTuitionDetail: 'Smartious delivers to Riviera Maya families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Mexican morning on a fixed nine-hour offset, with the full recorded library carrying the season.',
    faqs: [
      { q: 'Our family works the season — can schooling fit that?', a: 'It is built for it: live morning classes with a complete recorded library, so the academic year holds together through the busiest months.' },
      { q: 'We are here on a temporary residence basis — whose rules apply?', a: 'The Mexican obligation attaches to children resident in Mexico. Where the residency line sits for your household depends on your status and circumstances and is a question for your own advisers. The teaching works the same either way.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const MEXICO_COUNTRY = {
  slug: 'mexico',
  name: 'Mexico',
  longName: 'United Mexican States',
  adjective: 'Mexican',
  flag: '🇲🇽',
  hub: '/online-school/mexico',
  hubPageId: 'homeschooling-mexico',
  cityPageId: 'mexico-city-page',

  currency: 'MXN',
  currencyName: 'Mexican Peso',
  currencyPeg: 'Fees are invoiced in USD; peso equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'CST',
    name: 'Central Standard Time (UTC-6) across most of Mexico, no daylight saving since 2022',
    utcOffset: '-6',
    offsetFromEAT: '-9 hours — our teaching lands in the Mexican morning, fixed all year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Mexico has established Cambridge provision, with capacity checked per series'],
  examCentreTiles: [
    { city: 'Mexico City', centre: 'Authorised provision', area: 'The country\'s deepest external-candidate capacity, confirmed per family per session.' },
    { city: 'Monterrey and Guadalajara', centre: 'Regional provision', area: 'Checked first for northern and western families.' },
    { city: 'The Bajío and the coast', centre: 'Planned per session', area: 'Querétaro, León, and Riviera Maya families plan travel into each window ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Mexico-based students sit as external candidates at authorised provision, with capacity confirmed per family per session. Mexico has an established Cambridge presence alongside its very large IB sector, so provision is easier here than in much of our coverage — CDMX is checked first, with regional options for Monterrey and Guadalajara and travel planned ahead from the Bajío and the coast. Note what does not change: our arrangement runs alongside a Mexican school that holds RVOE, and that school continues its own national track unchanged. Smartious does not hold RVOE and the studies we teach carry Cambridge or IB validity rather than Mexican official validity — a distinction we state plainly rather than leave a family to discover.',
  secondaryProgrammeExamRef: 'Authorised Mexican Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/mexico.jpg',
  heroEyebrow: 'Online school for Mexico',
  heroH1Suffix: 'Mexico',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for corporate, industrial, expatriate, and Mexican families across Mexico City, Monterrey, Guadalajara, the Bajío, and the Riviera Maya. We teach from Nairobi, nine hours ahead — so our classes land in the Mexican morning, which is exactly the free half of the day for students in turno vespertino. Education is compulsory through media superior, so we work alongside your school, not instead of it.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — morning teaching, Spanish kept alongside.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Mexico',

  citiesSectionTitle: 'Where our Mexico families are',
  citiesSectionBody: 'Smartious Mexico families concentrate across Mexico City (the corporate capital, one of the deepest international and IB school markets in the Americas, priced accordingly), Monterrey (the industrial capital and the centre of the nearshoring boom), Guadalajara (the technology capital, with a large remote-work community and the Lake Chapala belt nearby), Querétaro and the Bajío (the automotive and aerospace corridor with German, Japanese, and Korean manufacturing communities), and Cancún and the Riviera Maya (an international resident population growing far faster than its schools). One long compulsory range, one morning teaching window, and a school system built around shifts that happens to fit it.',

  trustSignals: [
    { h: 'An African school teaching Mexican families', p: 'Smartious was founded in Nairobi in 2019 and teaches from two operational centres established 2022 and 2023, serving students in 67 countries. Mexico is among the furthest from us on the clock, and we plan around that openly rather than pretending it does not matter.' },
    { h: 'Morning teaching, and why it fits Mexico', p: 'We are nine hours ahead, so our classes land in the Mexican morning rather than the afternoon. Mexican schools very commonly run turno matutino and turno vespertino — and for a student on the afternoon shift, our block is precisely the free half of the day.' },
    { h: 'The compulsory range stated properly', p: 'Article 3 of the Constitution makes education compulsory through educación media superior. That is a longer range than most countries we serve, and it means Mexico has no post-compulsory window before eighteen — we do not invent one.' },
    { h: 'What we are, stated plainly', p: 'Private schools in Mexico require RVOE for their studies to carry official validity. Smartious does not hold RVOE and is not a Mexican school with official validity — we work alongside one that is.' },
  ],

  universitiesInCountry: 'UNAM, the Instituto Politécnico Nacional, Tec de Monterrey, the Universidad de Guadalajara, ITAM, Universidad Iberoamericana, and the state universities — one of the largest and most established higher-education systems in the Americas.',
  universityChannels: 'Mexican universities admit primarily on the national bachillerato route, and foreign studies enter the system through revalidación, a defined SEP process with requirements confirmed per case rather than automatic — a family intending to return into Mexican higher education should begin it early. Outward, Mexican students are heavily oriented toward the United States and Canada, both of which read Cambridge A-Levels, the IB Diploma, and AP records directly; Spain is a long-standing destination that assesses international qualifications through its own equivalence routes; and UCAS reads A-Levels natively. A-Levels are accepted in 160+ countries. One market note worth stating: Mexico has one of the largest IB communities in Latin America, so the IB is exceptionally well understood here — while Cambridge A-Levels, which UK admissions reads most directly, are comparatively thin on the ground, which is where much of our Mexican demand comes from. Smartious provides personalised university guidance across US, Canadian, UK (UCAS), Spanish, and Mexican destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Mexico families. Cambridge IGCSE (Years 10-11) and Cambridge A-Level (Years 12-13) delivered as live small-group classes in the Mexican morning on a fixed nine-hour offset with no seasonal drift — which fits students in turno vespertino and full-time learners — run alongside a Mexican school that holds RVOE and continues its own national track unchanged. Cambridge Spanish available beside the English-medium core. Examinations at authorised provision confirmed per session.',
  britishCurriculumSuits: 'Mexico families targeting the Cambridge pathway. Best fit for: (1) students in turno vespertino whose mornings are free, (2) families wanting A-Levels in a market dominated by the IB and the American curriculum, (3) Bajío manufacturing families whose corridor grew faster than its schools, (4) Riviera Maya and Chapala families strung out along a coast or a lake, (5) professional families outside the international tier\'s fees.',
  britishCurriculumDelivery: 'Live online classes in the Mexican morning, small groups 4-6 students, every session recorded, alongside a Mexican school holding RVOE.',
  ibDiplomaSuits: 'Mexico families in the country\'s large IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Mexico families targeting US universities via Common Application — the single most common overseas destination for Mexican students.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Mexico is our first Latin American market and among the furthest from us on the clock — which is why our Mexican timetable is built around the country\'s own shift system rather than around ours.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting the Bajío\'s automotive and aerospace families and Guadalajara\'s technology households. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Mexico has one of the largest and best-established international school markets in the Americas — the American Schools in CDMX, Monterrey and Guadalajara, the British-founded schools, the German, French and Japanese schools, and one of the biggest IB communities in Latin America. These are strong institutions and we do not pretend otherwise. Two gaps are real: the fees, which put the tier out of reach for most Mexican professional families; and the comparative scarcity of Cambridge A-Levels in a market dominated by the IB and the US curriculum, which matters for anyone applying through UCAS.',
  competitors: [
    { name: 'The American Schools (CDMX, Monterrey, Guadalajara)', city: 'Major cities',     curriculum: 'American + IB',                         feesUsd: 'Top of the Mexican market',                         feesAed: 'Premium tier',            rating: 4.7, capacityNote: 'Long-established and strong — the regional benchmark' },
    { name: 'Greengates, Edron and the British-founded schools', city: 'CDMX',               curriculum: 'British / IB',                          feesUsd: 'Premium tier',                                      feesAed: 'Competitive entry',       rating: 4.6, capacityNote: 'The closest local comparison to our track — capital-bound and expensive' },
    { name: 'The large IB sector',                             city: 'Nationwide',            curriculum: 'IB continuum',                          feesUsd: 'Premium to mid tier',                               feesAed: 'Varies',                  rating: 4.5, capacityNote: 'Mexico has among the most IB World Schools in Latin America — the IB is very well served here' },
    { name: 'The Bajío and the Riviera Maya',                  city: 'Fast-growing regions',  curriculum: 'Thin relative to growth',               feesUsd: 'Limited provision',                                 feesAed: '—',                       rating: 0,   capacityNote: 'An industrial corridor and a coast that both grew faster than their schools' },
    { name: 'Cambridge A-Level provision',                     city: 'Nationwide',            curriculum: 'Comparatively scarce',                  feesUsd: '—',                                                 feesAed: '—',                       rating: 0,   capacityNote: 'In an IB and US-curriculum market, families applying through UCAS often find no local A-Level route' },
    { name: 'US-based online schools',                         city: 'Online',                curriculum: 'American online',                       feesUsd: 'Varies, often per-course',                          feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Much closer on the clock than we are — families should weigh that honestly against price and class size' },
    { name: 'Smartious Homeschool (Mexico via online delivery)', city: 'Delivered to all Mexico', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'MXN equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + the A-Level route the market lacks + morning teaching that fits the turno vespertino + honest that we are nine hours away and hold no RVOE' },
  ],

  legalFrameworkIntro: 'Mexico has a longer compulsory range than most countries we serve and a formal validity regime for school studies. Both shape what we can honestly offer. Here is the framework, and the timezone reality that goes with it.',
  legalFramework: [
    { h: 'Compulsory education runs further here', p: 'Article 3 of the Mexican Constitution makes education compulsory through educación media superior — upper secondary. That is longer than in most of the countries we cover, where the obligation typically ends between fifteen and sixteen, and it has a direct consequence for planning: Mexico has no post-compulsory window of the kind our Croatian, Angolan, or Balkan pages describe. We do not invent one. The Ley General de Educación governs the system, the SEP is the federal authority, and the states carry significant administrative responsibility.' },
    { h: 'RVOE, and what we therefore are not', p: 'Private schools in Mexico require RVOE — Reconocimiento de Validez Oficial de Estudios — for the studies they deliver to carry official validity within the Mexican system. Smartious does not hold RVOE. We do not operate premises in Mexico, we do not claim official validity for Mexican purposes, and we do not present ourselves as an alternative to a school that holds it. What we deliver are Cambridge, Pearson Edexcel, IB, and AP qualifications with their own international validity, taught alongside a Mexican school that carries the official one. We state that as plainly here as we do in Ghana, Botswana, and the DRC.' },
    { h: 'Home education: what we can and cannot say', p: 'We are not aware of an established parental-choice home-education route in Mexican law, and we phrase it that way rather than asserting a categorical prohibition we cannot fully evidence. Because education is administered federally and at state level, a family whose plan turns on the point should confirm the current position with the SEP and with their own state education authority. What is unrestricted is structured education alongside a school enrolment, which is the configuration we build.' },
    { h: 'Accreditation and revalidación, described carefully', p: 'The SEP operates mechanisms for accrediting knowledge acquired outside the formal school system, with examinations administered through the national evaluation body, and separately for revalidating studies completed abroad. Both are real and both are frequently misread. Eligibility, age thresholds, and procedure for each are set by the SEP and should be confirmed directly rather than taken from any provider\'s summary, ours included — and neither is a homeschooling route. We mention them because families encounter them and reasonably wonder, not because we are recommending them.' },
    { h: 'The timezone, stated first rather than buried', p: 'Mexico is the hardest scheduling relationship in our entire coverage and we would rather lead with it. We teach from Nairobi at UTC+3; most of Mexico runs CST at UTC-6 with no daylight saving since 2022. That is a fixed nine-hour gap. A Mexican after-school slot at four in the afternoon is one in the morning for us, so the standard supplementary model simply does not work here. What does work is the reverse: our teaching block lands in the Mexican morning — a 07:00 to 10:00 Mexican class is late afternoon in Nairobi, a normal working slot for our teachers.' },
    { h: 'Why the Mexican school day makes that workable', p: 'Here is the part that turns a constraint into a fit. Mexican schools very commonly operate two shifts — turno matutino in the morning and turno vespertino in the afternoon. A student on the afternoon shift has their mornings free, which is exactly our teaching window. So the arrangement that fails in most countries at a nine-hour offset works cleanly here for a large share of Mexican students, alongside full-time learners who take mornings anyway. Families whose child is in turno matutino should talk to us about which subjects and which days are realistic before enrolling, because we would rather set expectations at the start than have a timetable collapse in March.' },
  ],

  whySmartious: [
    { h: 'Morning teaching that fits the turno vespertino',                p: 'Nine hours ahead means our classes land in the Mexican morning — the free half of the day for afternoon-shift students, and the natural slot for full-time ones.' },
    { h: 'The A-Level route a large market lacks',                         p: 'Mexico is exceptionally well served for the IB and the American curriculum and comparatively thin on Cambridge A-Levels — which is what UCAS reads most directly.' },
    { h: 'Honest about the nine-hour gap',                                 p: 'We lead with it rather than bury it, explain exactly which patterns work, and tell families in turno matutino to talk to us before enrolling.' },
    { h: 'Honest about RVOE',                                              p: 'We do not hold it and do not claim Mexican official validity. We work alongside a school that does.' },
    { h: 'The Bajío and the coast served identically',                     p: 'An automotive and aerospace corridor and a Caribbean coast that both grew faster than their schools.' },
    { h: 'Spanish kept alongside',                                         p: 'Cambridge Spanish runs beside the English-medium core, protecting Mexican and Spanish routes while adding UK, US, and Canadian ones.' },
  ],

  faqs: [
    { q: 'You are nine hours ahead — how can this possibly work?', a: 'In one direction, and we lead with that rather than hide it. Our classes land in the Mexican morning: a 07:00-10:00 Mexican block is late afternoon in Nairobi. For students in turno vespertino, whose school runs in the afternoon, that is exactly the free half of the day — and full-time students take mornings anyway. An after-school arrangement is not possible from our side. If your child is in turno matutino, talk to us before enrolling so we can be realistic about which subjects and days work.' },
    { q: 'Is homeschooling legal in Mexico?', a: 'Education is compulsory through educación media superior under Article 3 of the Constitution, and we are not aware of an established parental-choice home-education route. We put it in those terms rather than asserting a flat prohibition — confirm with the SEP and your state education authority. Structured study alongside a school enrolment is unrestricted.' },
    { q: 'Does Smartious have RVOE?', a: 'No, and we say so plainly. Private schools require RVOE for their studies to carry official validity in Mexico. We deliver Cambridge, Pearson Edexcel, IB and AP qualifications with their own international validity, alongside a Mexican school that holds the official one.' },
    { q: 'Is there a post-compulsory window like in other countries?', a: 'No. Mexico\'s compulsory range runs through media superior, which is longer than in most countries we cover. Any provider offering a full-time programme to a sixteen-year-old Mexican student on the basis that compulsory schooling has ended is describing another country\'s law.' },
    { q: 'Why Cambridge when Mexico has so many IB schools?', a: 'Precisely because it does. Mexico has one of the largest IB communities in Latin America and is comparatively thin on Cambridge A-Levels — and A-Levels are what UK admissions through UCAS reads most directly. Families targeting Britain often find no local route.' },
    { q: 'What about accreditation exams or revalidación?', a: 'The SEP operates mechanisms for accrediting knowledge acquired outside the school system and for revalidating studies completed abroad. Both are real, both have eligibility and age rules set by the SEP, and neither is a homeschooling route. Confirm the detail directly rather than from any provider\'s summary.' },
    { q: 'Where do Mexican students sit Cambridge examinations?', a: 'At authorised provision confirmed per family per session. Mexico has established Cambridge provision alongside its large IB sector, so this is easier here than in much of our coverage.' },
    { q: 'Which parts of Mexico does Smartious cover?', a: 'Mexico City, Monterrey, Guadalajara, Querétaro and the Bajío, and Cancún and the Riviera Maya have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us whether your child is in turno matutino or turno vespertino: in Mexico that single fact decides whether our timetable fits yours, and it belongs in the first message rather than the third.',
}
