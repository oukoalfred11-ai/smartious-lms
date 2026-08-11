// ═══════════════════════════════════════════════════════════════════
// COLOMBIA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for corporate, energy, remote-work, and Colombian
// families across Bogotá, Medellín, Cali, Barranquilla and Cartagena.
// THIRD LATIN AMERICAN BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// LEGAL POSITIONING NOTE — COLOMBIA IS THE MOST GENUINELY CONTESTED
// POSITION IN OUR ENTIRE COVERAGE. THE SOURCES DISAGREE WITH EACH
// OTHER, AND THAT DISAGREEMENT IS THE STORY. RULES:
// - NEVER declare home education "legal" or "illegal" in Colombia.
//   Both claims are made by serious Colombian sources and neither is
//   settled. Present the tension, name the instruments, route the
//   family to the Ministerio de Educación Nacional and their
//   secretaría de educación.
// - WHAT IS SETTLED — cite precisely:
//   * Constitution art. 67, inciso 3: education is COMPULSORY
//     BETWEEN AGES FIVE AND FIFTEEN, comprising ONE YEAR OF
//     PREESCOLAR and NINE YEARS OF EDUCACIÓN BÁSICA.
//   * Constitution art. 27: the State guarantees the freedoms of
//     teaching, learning, research and chair.
//   * Constitution art. 68: parents have the right to choose the
//     type of education for their minor children.
//   * Ley 115 de 1994 art. 7: the family is the fundamental nucleus
//     of society and FIRST RESPONSIBLE for the education of children.
// - THE TENSION, STATED FAIRLY AND FROM BOTH SIDES:
//   * One reading, advanced by Colombian home-education organisations:
//     the law makes EDUCATION compulsory, not SCHOOLING
//     ("la educación es obligatoria, más no la escolarización"), and
//     nothing in the law speaks of escolarización — hence a "vacío
//     legal" in which families may educate at home provided they
//     ensure quality and validate. Red Enfamilia Colombia describes
//     the position as undefined, a legal vacuum.
//   * The contrary reading: Ley 115 de 1994 requires enrolment of
//     minors in authorised educational institutions, and non-
//     presential education is available only to adults or people in
//     exceptional personal or social circumstances, with attendance
//     otherwise required between five and fifteen.
//   BOTH must appear. Do not resolve them.
// - VALIDATION MACHINERY IS REAL AND WELL DEFINED — name it:
//   * Decreto 2832 de 2005: regulates VALIDACIÓN POR GRADOS of basic
//     and media studies; authorised institutions may evaluate those
//     who have acquired each grade's knowledge.
//   * Decreto 299 de 2009: permits validating the WHOLE BACHILLERATO
//     through a SINGLE EXAMINATION (Saber 11) — FOR THOSE OVER 18.
//     Always state the age condition.
//   * Decreto 1075 de 2015: the Decreto Único Reglamentario del
//     Sector Educación, integrating the norms and defining
//     validation options for those not schooled.
//   * Saber tests at grades 3, 5, 9 and 11, regulated by ICFES.
// - SCALE: Colombian home-education organisations report on the
//   order of 8,000 children and adolescents educated at home.
//   Attribute it; do not state it as an official figure.
// - THE WINDOW — REAL AND USEFUL: the compulsory range ends at
//   FIFTEEN and covers preescolar plus nine years of BÁSICA. The
//   EDUCACIÓN MEDIA years (grados 10-11) fall OUTSIDE the compulsory
//   range. Unlike Mexico and Brazil, Colombia therefore has a
//   post-compulsory phase — lead with it in senior planning.
// TIMEZONE: COT (UTC-5), no daylight saving — EIGHT HOURS behind
// Nairobi. Same pattern as Mexico: our teaching lands in the
// COLOMBIAN MORNING, not the afternoon. Colombian schools commonly
// run JORNADA MAÑANA and JORNADA TARDE, so a jornada tarde student
// has mornings free — that is our window. State the constraint
// plainly and give the solution.
// MARKET NOTE: strong international sector in Bogotá (Colegio
// Nueva Granada, the British, German, French, Italian and Anglo
// schools) and Medellín (Columbus, The Colombus School, Montessori),
// with a very large calendario B bilingual sector. Medellín has
// become one of the world's largest digital-nomad destinations.
// Economy: Bogotá's corporate and financial centre; Medellín's
// technology and textile base; Cali's agro-industry and Pacific
// corridor; Barranquilla's industrial port and the Caribbean coast;
// Cartagena's refinery, petrochemicals, port and tourism.
// ═══════════════════════════════════════════════════════════════════

export const COLOMBIA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'bogota-co',
    name: 'Bogotá',
    county: 'Bogotá D.C. and Cundinamarca',
    region: 'The corporate and financial capital · a deep international and bilingual school sector at premium fees · the diplomatic community · the country\'s university centre',
    primaryKeyword: 'Online school and international curriculum in Bogotá',
    heroTagline: 'For Bogotá families — Cambridge and IB taught live in the morning, which for a jornada tarde student is exactly the free half of the day.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Bogotá families. The capital holds Colombia\'s corporate and financial weight, its diplomatic community, its university centre, and a deep international and bilingual school sector — Colegio Nueva Granada, the British, German, French, Italian and Anglo schools, and a very large calendario B bilingual tier — priced at the top of the Colombian market. Colombian law on educating outside school is genuinely unsettled, and we set out both readings rather than picking the convenient one. We teach from Nairobi, eight hours ahead, so our classes land in the Colombian morning.',
    heroImg: '/heroes/bogota-co.jpg',
    altTexts: { hero: 'Bogotá and the eastern hills' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Bogotá families — morning classes that fit the jornada tarde, and the legal position stated fairly. From USD 400/month.',
    challenges: [
      'International and bilingual school fees in Bogotá sit at the top of the Colombian market.',
      'Colombian law on educating outside school is contested, with serious sources reaching opposite conclusions.',
      'Compulsory education runs from five to fifteen — but validation of studies has its own defined rules and age conditions.',
      'We teach eight hours ahead, so our classes land in the Colombian morning, not the afternoon.',
      'Time zone: Colombia runs COT (UTC-5) with no daylight saving — a fixed eight-hour gap behind Nairobi.',
    ],
    familySituations: [
      'Corporate, financial, and professional families outside the international tier\'s fees.',
      'Students in jornada tarde whose mornings are free.',
      'Diplomatic and international-organisation families.',
      'Bilingual-sector families wanting a full international examination track.',
      'Families targeting UK, Spanish, American, or Canadian universities.',
      'Students past the compulsory range running the educación media years differently.',
    ],
    nearbyAreas: ['Chicó and Usaquén', 'Chapinero', 'Cedritos', 'Chía and Cajicá', 'La Calera', 'Suba', 'Soacha'],
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
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Colombian university applications',
    ],
    whyChoose: [
      ['Morning classes, which is the point in Colombia', 'We teach eight hours ahead, so our block lands in the Colombian morning — the free half of the day for every student in jornada tarde.'],
      ['The legal position stated fairly, not conveniently', 'Colombian sources disagree about educating outside school. We give both readings, name the decrees, and send you to the Ministerio and your secretaría de educación.'],
      ['A fee gap against a strong local tier', 'Live small-group teaching at USD 2,160-6,480 a year against Bogotá international fees at the top of the Colombian market.'],
      ['Cambridge A-Levels for UCAS', 'The bilingual sector is large and the A-Level route is thinner — and A-Levels are what British admissions reads most directly.'],
      ['Spanish kept alongside', 'Cambridge Spanish runs beside the English-medium core, protecting Colombian and Spanish university routes.'],
    ],
    growingReason: 'Bogotá holds Colombia\'s corporate and financial centre, its diplomatic community, and a deep international and bilingual school sector priced at the top of the national market — inside a legal framework on home education that Colombian sources themselves dispute. Colombia runs COT (UTC-5), eight hours behind Nairobi, so our teaching lands in the Colombian morning.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Bogotá families, taught in the Colombian morning alongside a school enrolment. Examinations at authorised centres confirmed per family per session.',
      cbc: 'Kenya CBC available for Bogotá families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the capital\'s IB schools.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Colombia is the country in our coverage where we are least willing to give a one-word answer, because Colombian sources give opposite ones. What is settled: article 67 of the Constitution makes education compulsory between the ages of five and fifteen, comprising one year of preescolar and nine years of educación básica; article 27 guarantees the freedoms of teaching and learning; article 68 gives parents the right to choose the type of education for their minor children; and article 7 of Ley 115 de 1994 makes the family the fundamental nucleus of society and first responsible for the education of its children. What is contested is what follows. Colombian home-education organisations argue that the law makes education compulsory but not schooling — that nothing in it speaks of escolarización — and describe the position as a vacío legal in which families may educate at home provided they ensure quality and validate the results; Red Enfamilia Colombia puts it exactly that way. Others read Ley 115 as requiring enrolment of minors in authorised institutions, and hold that non-presential education is available only to adults or to people in exceptional personal or social circumstances, with attendance otherwise required between five and fifteen. We are not going to resolve that for you, and any provider who tells you it is simple is selling rather than advising: confirm your family\'s position with the Ministerio de Educación Nacional and your secretaría de educación. What is clear and useful is the validation machinery. Decreto 2832 de 2005 regulates validación por grados, allowing authorised institutions to evaluate those who have acquired each grade\'s knowledge. Decreto 299 de 2009 permits validating the entire bachillerato through a single examination for those over eighteen. Decreto 1075 de 2015 integrates these into the sector\'s single regulatory decree and defines the validation options for those not schooled. And Saber testing at grades 3, 5, 9 and 11, regulated by ICFES, provides external reference points throughout. Our own default is the one that raises none of this: live teaching alongside a school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Bogotá families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Colombian morning. With a fixed eight-hour gap and no daylight saving on either side, an 07:00-10:00 Colombian block sits in our normal late-afternoon teaching hours every week of the year, with all sessions recorded.',
    faqs: [
      { q: 'Is homeschooling legal in Colombia?', a: 'Colombian sources genuinely disagree, and we will not pretend otherwise. Home-education organisations argue that education is compulsory but schooling is not, and describe the position as a legal vacuum; others read Ley 115 de 1994 as requiring enrolment in authorised institutions, with non-presential education limited to adults or exceptional circumstances. Confirm your family\'s position with the Ministerio de Educación Nacional and your secretaría de educación rather than with any provider.' },
      { q: 'How would our child\'s studies be validated?', a: 'Colombia has defined machinery: Decreto 2832 de 2005 regulates validación por grados; Decreto 299 de 2009 permits validating the whole bachillerato in a single examination for those over eighteen; Decreto 1075 de 2015 integrates the options for those not schooled; and ICFES Saber testing at grades 3, 5, 9 and 11 provides external reference points.' },
      { q: 'Eight hours — how does the timetable work?', a: 'Our classes land in the Colombian morning, not the afternoon. For a student in jornada tarde, whose school runs in the afternoon, that is exactly the free half of the day. After-school is not possible from our side and we say so upfront.' },
      { q: 'Why Cambridge when the bilingual sector is so large?', a: 'Because bilingual schooling is not the same as an international examination track, and Cambridge A-Levels are comparatively thin here — which matters for anyone applying through UCAS.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'medellin-co',
    name: 'Medellín',
    county: 'Antioquia',
    region: 'Colombia\'s technology and innovation capital · one of the world\'s largest digital-nomad destinations · a strong bilingual school sector · an international resident population that arrived faster than the schools',
    primaryKeyword: 'Online school and international curriculum in Medellín',
    heroTagline: 'For Medellín and Antioquia families — the city the remote-work world moved to, where a morning teaching block fits a self-scheduled household perfectly.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Medellín families. Medellín has become Colombia\'s technology and innovation capital and one of the largest digital-nomad destinations in the world — a software and startup cluster, a long-standing textile and manufacturing base, and an international resident community from North America, Europe, and across Latin America that has grown far faster than the schools serving it. The bilingual sector is strong and its best places are competitive. We teach in the Colombian morning, which suits a jornada tarde student and a self-scheduling remote-work family equally well.',
    heroImg: '/heroes/medellin-co.jpg',
    altTexts: { hero: 'Medellín in the Aburrá valley' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Medellín and Antioquia families — digital-nomad capital, morning classes. From USD 400/month.',
    challenges: [
      'An international resident population growing far faster than the schools serving it.',
      'Competitive places at the strongest bilingual and international schools.',
      'Colombian law on educating outside school is contested — confirm your own position.',
      'We teach eight hours ahead, so our classes land in the Colombian morning.',
      'Families arriving mid-curriculum from North American, European, and Latin American systems.',
    ],
    familySituations: [
      'Software, startup, and technology-sector families.',
      'International remote-work and digital-nomad households.',
      'Textile, manufacturing, and Antioquian business families.',
      'Families arriving mid-curriculum and possibly moving on again.',
      'Students in jornada tarde with mornings free.',
    ],
    nearbyAreas: ['El Poblado', 'Laureles', 'Envigado', 'Sabaneta', 'Rionegro', 'Itagüí', 'Guatapé'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Computer Science, Chemistry',
      'Cambridge A-Level Economics, Business, Biology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Computer Science A, AP Physics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Colombian university applications',
    ],
    whyChoose: [
      ['Computing depth for an innovation capital', 'Cambridge A-Level Computer Science, Mathematics, and Further Mathematics suit the sector that has reshaped Medellín.'],
      ['Built for remote-work households', 'A family that already structures its own day builds around a morning teaching block far more easily than around a school run.'],
      ['Continuity for families who may move again', 'One curriculum, one teaching team, one examination board — wherever the next country is.'],
      ['Morning classes that fit the jornada tarde', 'Our block lands in the Colombian morning, free for every afternoon-shift student.'],
      ['The legal position stated fairly', 'Colombian sources disagree about home education; we give both readings and name the validation decrees.'],
    ],
    growingReason: 'Medellín has become Colombia\'s technology and innovation capital and one of the world\'s largest digital-nomad destinations, with a software and startup cluster and an international resident community that has grown far faster than the schools serving it. Colombia runs COT (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Antioquia, taught in the Colombian morning alongside a school enrolment.',
      cbc: 'Kenya CBC available for Medellín families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Antioquia, and it is genuinely contested: education is compulsory between five and fifteen under article 67 of the Constitution, article 68 gives parents the right to choose the type of education for their children, and Ley 115 de 1994 makes the family first responsible for it — while Colombian organisations and commentators disagree about whether that permits educating outside school or whether enrolment in an authorised institution is required. We present both and route families to the Ministerio de Educación Nacional and their secretaría de educación. The validation instruments — Decreto 2832 de 2005, Decreto 299 de 2009, and Decreto 1075 de 2015 — are the practical part, and the single-examination bachillerato route applies to those over eighteen. Our default remains teaching alongside a school enrolment, which raises none of it.',
    homeTuitionDetail: 'Smartious delivers to Medellín families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Colombian morning on a fixed eight-hour offset, with every session recorded.',
    faqs: [
      { q: 'We are a remote-work family here — how does the timetable work?', a: 'Well, usually. Our classes land in the Colombian morning, and a household that already sets its own schedule builds around that far more easily than around a fixed school run.' },
      { q: 'Our child is arriving mid-curriculum from the US or Europe — what happens?', a: 'They keep their pathway. The curriculum, teachers, and examination board stay constant, and we run alongside a local enrolment while the transition settles.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'cali-co',
    name: 'Cali & the Valle del Cauca',
    county: 'Valle del Cauca',
    region: 'The agro-industrial capital — sugar, food processing and the Pacific corridor · the Buenaventura port road · a major university and medical centre · thinner international provision than its size suggests',
    primaryKeyword: 'Online school and international curriculum in Cali',
    heroTagline: 'For Cali and Valle families — Colombia\'s third city and its Pacific gateway, with less international provision than its scale implies.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Cali and Valle del Cauca families. Cali anchors Colombia\'s agro-industrial heartland — sugar, food processing, and manufacturing across the valley — and the corridor down to Buenaventura, the country\'s principal Pacific port. It is also a major university and medical centre. For a city and region of this scale, international provision is thinner than families expect and concentrated in a handful of schools. Smartious teaches Cambridge and IB live in the Colombian morning, alongside a school enrolment.',
    heroImg: '/heroes/cali-co.jpg',
    altTexts: { hero: 'Cali and the Valle del Cauca' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Cali and Valle del Cauca families — agro-industrial capital, thin international provision. From USD 400/month.',
    challenges: [
      'International provision thinner than the city\'s size and industrial profile suggest.',
      'The Pacific corridor and Buenaventura sit well outside the school map.',
      'Colombian law on educating outside school is contested — confirm your own position.',
      'We teach eight hours ahead, so our classes land in the Colombian morning.',
      'Time zone: Cali shares COT (UTC-5) with no daylight saving.',
    ],
    familySituations: [
      'Agro-industrial, sugar, and food-processing business families.',
      'Port, logistics, and Pacific-corridor households.',
      'University and medical-sector academic families.',
      'Valle business families wanting an internationally examined track.',
      'Students in jornada tarde with mornings free.',
    ],
    nearbyAreas: ['Cali', 'Palmira', 'Jamundí', 'Yumbo', 'Buga', 'Buenaventura', 'Popayán'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Physics, Geography',
      'Cambridge A-Level Economics, Business, Accounting',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Chemistry, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, Canadian and Colombian university applications',
    ],
    whyChoose: [
      ['The complete option in a large city with thin provision', 'Identical live delivery in Cali and Bogotá, without relocation.'],
      ['Pre-medical depth for a major medical city', 'Cambridge A-Level Biology and Chemistry with Mathematics — the classic spine, and one Cali families aim at in numbers.'],
      ['Reaches the corridor, not just the city', 'Palmira, Buga, and Buenaventura get identical live teaching without a commute.'],
      ['Morning classes that fit the jornada tarde', 'Our block lands in the Colombian morning, free for every afternoon-shift student.'],
      ['The legal position stated fairly', 'Both readings given, the validation decrees named, and the family sent to the right authority.'],
    ],
    growingReason: 'Cali anchors Colombia\'s agro-industrial heartland — sugar, food processing, and manufacturing across the Valle — alongside the corridor to Buenaventura, the principal Pacific port, and a major university and medical sector, with thinner international provision than its scale suggests. Colombia runs COT (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Valle, taught in the Colombian morning alongside a school enrolment.',
      cbc: 'Kenya CBC available for Valle families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the Valle: education is compulsory between five and fifteen under article 67, the constitutional freedoms of teaching and parental choice sit alongside Ley 115\'s requirements, and Colombian sources reach opposite conclusions about what that permits. We present both readings and send families to the Ministerio de Educación Nacional and their secretaría de educación. The validation instruments — Decreto 2832 de 2005 for validación por grados, Decreto 299 de 2009 for the single-examination bachillerato route for those over eighteen, and Decreto 1075 de 2015 integrating the options — are the practical machinery. Our default is teaching alongside a school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Valle families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Colombian morning on a fixed eight-hour offset, with every session recorded.',
    faqs: [
      { q: 'Is there international schooling in Cali?', a: 'Some, concentrated in a handful of schools and thinner than the city\'s size suggests. Live online delivery reaches the whole Valle identically, including Palmira, Buga, and Buenaventura.' },
      { q: 'Our child is aiming at medicine — what should they take?', a: 'Cambridge A-Level Biology and Chemistry with Mathematics form the classic spine, planned backward from the target from IGCSE onward.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'barranquilla-co',
    name: 'Barranquilla',
    county: 'Atlántico',
    region: 'The Caribbean industrial capital · the Magdalena river port and the coastal manufacturing belt · a strong regional business community · the coast\'s university centre',
    primaryKeyword: 'Online school and international curriculum in Barranquilla',
    heroTagline: 'For Barranquilla and Atlántico families — the Caribbean\'s industrial capital, a thousand kilometres from the capital\'s school tier.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Barranquilla families. Barranquilla is the industrial capital of Colombia\'s Caribbean coast — the Magdalena river port, a manufacturing and logistics belt, a strong regional business community with long international trading ties, and the coast\'s principal university centre. Its international schooling is decent and limited, and Bogotá\'s tier is a flight away. Smartious teaches Cambridge and IB live in the Colombian morning, alongside a school enrolment, reaching the coast identically to the capital.',
    heroImg: '/heroes/barranquilla-co.jpg',
    altTexts: { hero: 'Barranquilla and the Magdalena river' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Barranquilla and Atlántico families — Caribbean industrial capital, limited provision. From USD 400/month.',
    challenges: [
      'Limited international schooling for the industrial capital of the Caribbean coast.',
      'Bogotá\'s tier is a flight away, so relocation or boarding have been the alternatives.',
      'Colombian law on educating outside school is contested — confirm your own position.',
      'We teach eight hours ahead, so our classes land in the Colombian morning.',
      'Time zone: Barranquilla shares COT (UTC-5) with no daylight saving.',
    ],
    familySituations: [
      'Manufacturing, port, and logistics business families.',
      'Regional business households with international trading ties.',
      'University and professional families along the coast.',
      'Families weighing relocation to Bogotá for schooling.',
      'Students in jornada tarde with mornings free.',
    ],
    nearbyAreas: ['Barranquilla', 'Puerto Colombia', 'Soledad', 'Malambo', 'Santa Marta', 'Ciénaga', 'the Atlántico coast'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Spanish and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Accounting',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Spanish, American and Colombian university applications',
    ],
    whyChoose: [
      ['The alternative to relocating for school', 'Coastal families have moved to Bogotá or boarded children for the senior years. Identical live teaching reaches Barranquilla instead.'],
      ['Business and economics for a trading city', 'Cambridge A-Level Economics, Business, and Mathematics suit the families who run the coast\'s commerce.'],
      ['Morning classes that fit the jornada tarde', 'Our block lands in the Colombian morning, free for every afternoon-shift student.'],
      ['The legal position stated fairly', 'Both readings given, the validation decrees named.'],
      ['Spanish kept alongside', 'Cambridge Spanish runs beside the English-medium core.'],
    ],
    growingReason: 'Barranquilla is the industrial capital of Colombia\'s Caribbean coast — the Magdalena river port, a manufacturing and logistics belt, and a strong regional business community with international trading ties — with limited international schooling and Bogotá a flight away. Colombia runs COT (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for the Caribbean coast, taught in the Colombian morning alongside a school enrolment.',
      cbc: 'Kenya CBC available for coastal families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies on the coast: compulsory education from five to fifteen under article 67, constitutional freedoms of teaching and parental choice alongside Ley 115\'s enrolment language, and Colombian sources disagreeing about what follows. We give both readings and route families to the Ministerio de Educación Nacional and their secretaría de educación, and we name the validation instruments — Decreto 2832 de 2005, Decreto 299 de 2009 with its over-eighteen condition, and Decreto 1075 de 2015. Our default is teaching alongside a school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Barranquilla families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Colombian morning on a fixed eight-hour offset, with every session recorded.',
    faqs: [
      { q: 'Do coastal families have to move to Bogotá for schooling?', a: 'Many have. Identical live teaching reaches Barranquilla and the wider coast, with examinations sat at authorised centres a few times a year.' },
      { q: 'Where do coastal students sit Cambridge examinations?', a: 'At authorised centres confirmed per family per session, with travel planned into each window ahead.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'cartagena-co',
    name: 'Cartagena',
    county: 'Bolívar',
    region: 'The refinery and petrochemical complex at Mamonal · a container port and industrial zone · a tourism economy of international scale · a growing international resident community',
    primaryKeyword: 'Online school and international curriculum in Cartagena',
    heroTagline: 'For Cartagena and Bolívar families — a refinery, a container port and a world tourism destination, with a short list of schools.',
    intro: 'Live online Cambridge IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Cartagena families. Cartagena carries two economies at once: the Mamonal industrial belt with its refinery, petrochemical plants, and container port, employing engineers and managers recruited nationally and internationally; and a tourism economy of genuinely international scale around the walled city, with a growing foreign resident and second-home community behind it. The school list is short for either. Smartious teaches Cambridge and IB live in the Colombian morning, alongside a school enrolment, with a rhythm that fits a season.',
    heroImg: '/heroes/cartagena-co.jpg',
    altTexts: { hero: 'Cartagena walled city and bay' },
    seoDesc: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for Cartagena and Bolívar families — refinery, port and tourism, short school list. From USD 400/month.',
    challenges: [
      'A short school list for an industrial belt and an international tourism economy combined.',
      'Refinery and petrochemical staff arrive on project timelines rather than admission cycles.',
      'A tourism season that shapes the household for much of the year.',
      'Colombian law on educating outside school is contested — confirm your own position.',
      'We teach eight hours ahead, so our classes land in the Colombian morning.',
    ],
    familySituations: [
      'Refinery, petrochemical, and industrial engineering families at Mamonal.',
      'Container port and logistics households.',
      'Hotel, tourism, and hospitality business families.',
      'Foreign resident and second-home families around the walled city.',
      'Students in jornada tarde with mornings free.',
    ],
    nearbyAreas: ['Cartagena', 'Mamonal', 'Bocagrande', 'Turbaco', 'Barú', 'Santa Marta', 'the Bolívar coast'],
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
      'University application support — UCAS (UK), Common Application (US), and Spanish, American and Colombian university applications',
    ],
    whyChoose: [
      ['Chemistry and engineering depth for a refinery city', 'Cambridge A-Level Chemistry, Physics, and Mathematics — led by a founder with a BEd in Mathematics and Physics — suit the Mamonal belt precisely.'],
      ['Built for a season', 'Live morning classes plus unlimited recordings hold the academic year through the tourism months.'],
      ['Portable across industrial postings', 'Cartagena now, another refinery or plant after — the curriculum and examination board stay constant.'],
      ['Morning classes that fit the jornada tarde', 'Our block lands in the Colombian morning, free for every afternoon-shift student.'],
      ['The legal position stated fairly', 'Both readings given, the validation decrees named.'],
    ],
    growingReason: 'Cartagena carries the Mamonal refinery and petrochemical belt with its container port alongside a tourism economy of international scale and a growing foreign resident community — with a short school list for either. Colombia runs COT (UTC-5), eight hours behind Nairobi.',
    curricula: {
      cambridge: 'Cambridge IGCSE and Cambridge A-Level — Smartious\'s primary offer for Bolívar, taught in the Colombian morning alongside a school enrolment.',
      cbc: 'Kenya CBC available for Cartagena families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Bolívar: compulsory education from five to fifteen, constitutional freedoms of teaching and parental choice sitting alongside Ley 115\'s enrolment language, and Colombian sources disagreeing about what that permits. We give both readings, name the validation decrees, and route families to the Ministerio de Educación Nacional and their secretaría de educación. Foreign resident families who remain registered elsewhere follow their country of residence\'s framework, a status they determine with their own advisers. Our default is teaching alongside a school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Cartagena families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in the Colombian morning on a fixed eight-hour offset, with the full recorded library carrying the season.',
    faqs: [
      { q: 'We came with a refinery or petrochemical project — is there a school for us?', a: 'The list is short. Live Cambridge teaching reaches Cartagena in the Colombian morning alongside a local school, and continues unchanged if the project moves on.' },
      { q: 'Our family works the tourism season — can schooling fit?', a: 'It is built for it: live morning classes with a complete recorded library, so the academic year holds through the busiest months.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const COLOMBIA_COUNTRY = {
  slug: 'colombia',
  name: 'Colombia',
  longName: 'Republic of Colombia',
  adjective: 'Colombian',
  flag: '🇨🇴',
  hub: '/online-school/colombia',
  hubPageId: 'homeschooling-colombia',
  cityPageId: 'colombia-city',

  currency: 'COP',
  currencyName: 'Colombian Peso',
  currencyPeg: 'Fees are invoiced in USD; peso equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'COT',
    name: 'Colombia Time (UTC-5), no daylight saving',
    utcOffset: '-5',
    offsetFromEAT: '-8 hours — our teaching lands in the Colombian morning, fixed all year',
  },

  examCentres: ['Authorised Cambridge and Pearson Edexcel provision confirmed per family per session — Colombia has established Cambridge provision through its international and bilingual school sector'],
  examCentreTiles: [
    { city: 'Bogotá', centre: 'Authorised provision', area: 'The country\'s deepest external-candidate capacity, confirmed per family per session.' },
    { city: 'Medellín and Cali', centre: 'Regional provision', area: 'Checked first for Antioquia and Valle families.' },
    { city: 'The Caribbean coast', centre: 'Planned per session', area: 'Barranquilla and Cartagena families plan travel into each window ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Colombia-based students sit as external candidates at authorised provision, with capacity confirmed per family per session. Colombia\'s large bilingual and international school sector means Cambridge provision is established here — Bogotá is checked first, with regional options in Medellín and Cali and travel planned ahead from the Caribbean coast. Two Colombian points sit alongside that. Where a family also wants Colombian validation of studies, the machinery is defined by decree — validación por grados under Decreto 2832 de 2005, the single-examination bachillerato route under Decreto 299 de 2009 for those over eighteen, and the consolidated options under Decreto 1075 de 2015 — and it runs through authorised Colombian institutions and ICFES rather than through us. And ICFES Saber testing at grades 3, 5, 9 and 11 gives external reference points along the way. We plan the Cambridge calendar around whichever of these a family is using.',
  secondaryProgrammeExamRef: 'Authorised Colombian Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/colombia.jpg',
  heroEyebrow: 'Online school for Colombia',
  heroH1Suffix: 'Colombia',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for corporate, industrial, remote-work, and Colombian families across Bogotá, Medellín, Cali, Barranquilla, and Cartagena. Colombian law on educating outside school is genuinely disputed — we give both readings and name the validation decrees rather than picking the convenient answer. We teach eight hours ahead, so our classes land in the Colombian morning, which is the free half of the day for jornada tarde students.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge / IB / American AP through to A-Level — morning teaching, Spanish kept alongside.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Colombia',

  citiesSectionTitle: 'Where our Colombia families are',
  citiesSectionBody: 'Smartious Colombia families concentrate across Bogotá (the corporate and financial capital with a deep international and bilingual sector at premium fees), Medellín (the technology and innovation capital and one of the world\'s largest digital-nomad destinations), Cali and the Valle (the agro-industrial heartland and the Pacific corridor, thinner on provision than its scale suggests), Barranquilla (the Caribbean industrial capital, a flight from the Bogotá tier), and Cartagena (a refinery and petrochemical belt beside an international tourism economy). One disputed legal position stated fairly, one morning teaching window, and a school system built around jornadas that happens to fit it.',

  trustSignals: [
    { h: 'An African school teaching Colombian families', p: 'Smartious was founded in Nairobi in 2019 and teaches from two operational centres established 2022 and 2023, serving students across more than seventy countries — an internationally accredited online school.' },
    { h: 'The disputed law stated fairly, not conveniently', p: 'Colombian sources reach opposite conclusions about educating outside school. Home-education organisations argue education is compulsory but schooling is not; others read Ley 115 de 1994 as requiring enrolment in authorised institutions. We give both and route families to the Ministerio de Educación Nacional and their secretaría de educación.' },
    { h: 'Morning teaching, and why it fits Colombia', p: 'We are eight hours ahead, so our classes land in the Colombian morning rather than the afternoon. Colombian schools commonly run jornada mañana and jornada tarde — and for an afternoon-shift student, our block is precisely the free half of the day.' },
    { h: 'The compulsory range, and the window after it', p: 'Article 67 of the Constitution makes education compulsory between five and fifteen, covering one year of preescolar and nine of básica. The educación media years fall outside that range — unlike Mexico or Brazil, Colombia has a genuine post-compulsory phase.' },
  ],

  universitiesInCountry: 'Universidad Nacional de Colombia, Universidad de los Andes, Universidad Javeriana, Universidad de Antioquia, EAFIT, Universidad del Valle, Universidad del Norte and a large private sector — one of the stronger higher-education systems in the region.',
  universityChannels: 'Colombian universities admit principally on the bachillerato and the ICFES Saber 11 result, and holders of foreign qualifications go through convalidación procedures with requirements confirmed per case rather than automatically — a family intending to enter Colombian higher education should begin that early. It is worth noting that Saber 11 also serves as the single-examination route to validating the whole bachillerato for those over eighteen under Decreto 299 de 2009, which makes it doubly important for families outside the ordinary school route. Outward, Colombian students are strongly oriented toward the United States and Spain, with Canada growing quickly, and all three read Cambridge A-Levels, the IB Diploma, and AP records directly; UCAS reads A-Levels natively; and A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across US, Spanish, Canadian, UK (UCAS), and Colombian destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Colombia families. Cambridge IGCSE and Cambridge A-Level delivered as live small-group classes in the Colombian morning on a fixed eight-hour offset with no seasonal drift — which fits students in jornada tarde and full-time learners — run alongside a Colombian school enrolment. Cambridge Spanish available beside the English-medium core. Examinations at authorised provision confirmed per session; Colombian validación of studies, where a family wants it, runs separately through authorised institutions and ICFES.',
  britishCurriculumSuits: 'Colombia families targeting the Cambridge pathway. Best fit for: (1) students in jornada tarde whose mornings are free, (2) families wanting an examined international track rather than bilingual schooling alone, (3) Medellín\'s international remote-work community, (4) Cali, Barranquilla and Cartagena families where provision is thinner than the city\'s scale, (5) students past the compulsory range planning the educación media years around a university target.',
  britishCurriculumDelivery: 'Live online classes in the Colombian morning, small groups 4-6 students, every session recorded, alongside a Colombian school enrolment.',
  ibDiplomaSuits: 'Colombia families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Colombia families targeting US universities via Common Application — a principal destination for Colombian students.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Colombia families join students across more than seventy countries — and Colombia is the market where we have had to be most careful about what the law actually says, because Colombian sources themselves disagree.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Cartagena\'s refinery families, Medellín\'s technology households, and every medicine-bound student in Cali and Bogotá. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Colombia has a strong international sector in Bogotá and Medellín and a very large bilingual calendario B tier beneath it, and those schools are good. Two gaps are real. Fees at the top put the tier beyond most Colombian professional families. And bilingual schooling is not the same as an internationally examined track — a distinction that matters at university application. There is also, unusually, a competitive market of Colombian home-education providers offering validation support, which is a different service from teaching and worth distinguishing.',
  competitors: [
    { name: 'Colegio Nueva Granada and the Bogotá tier',      city: 'Bogotá',                curriculum: 'American, IB and international',        feesUsd: 'Top of the Colombian market',                       feesAed: 'Premium tier',            rating: 4.7, capacityNote: 'Long-established and strong — the national benchmark' },
    { name: 'The Medellín international schools',             city: 'Medellín',              curriculum: 'American and IB',                       feesUsd: 'Premium tier',                                      feesAed: 'Competitive places',      rating: 4.5, capacityNote: 'Good provision for a city whose international population has outgrown it' },
    { name: 'The calendario B bilingual sector',              city: 'Nationwide',            curriculum: 'Bilingual Colombian',                   feesUsd: 'Mid to premium tier',                               feesAed: 'Widespread',              rating: 4.2, capacityNote: 'Large and useful — bilingual is not the same as an international examination track' },
    { name: 'Colombian homeschool validation providers',      city: 'Nationwide / online',   curriculum: 'Validation support and materials',      feesUsd: 'Lower cost, different service',                     feesAed: '—',                       rating: 4.0, capacityNote: 'They help families validate through ICFES routes; they are not live international teaching, and the two are often confused' },
    { name: 'Cali, the coast and the regions',                city: 'Outside Bogotá/Medellín', curriculum: 'Thinner provision',                   feesUsd: 'Limited international option',                      feesAed: '—',                       rating: 0,   capacityNote: 'Large cities with less provision than their scale implies' },
    { name: 'US-based online schools',                        city: 'Online',                curriculum: 'American online',                       feesUsd: 'Varies, often per-course',                          feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Closer to Colombia on the clock than we are — families should weigh that against price and class size' },
    { name: 'Smartious Homeschool (Colombia via online delivery)', city: 'Delivered to all Colombia', curriculum: 'Cambridge IGCSE, A-Level, IB DP, AP', feesUsd: 'USD 2,160-6,480/year', feesAed: 'COP equivalent at prevailing rate', rating: 4.8, capacityNote: 'Every class live through A-Level + the disputed law stated fairly + morning teaching that fits the jornada tarde + the post-fifteen window used properly' },
  ],

  legalFrameworkIntro: 'Colombia is the only country in our coverage where serious domestic sources reach opposite conclusions on the central question. We are not going to resolve that dispute, and any provider who tells you it is settled is selling rather than advising. Here is what is agreed, what is disputed, and what is usable.',
  legalFramework: [
    { h: 'What is settled', p: 'Article 67 of the Constitution, third paragraph, makes education compulsory between the ages of five and fifteen, comprising one year of preescolar and nine years of educación básica. Article 27 guarantees the freedoms of teaching, learning, research and chair. Article 68 gives parents the right to choose the type of education for their minor children. And article 7 of Ley 115 de 1994, the Ley General de Educación, makes the family the fundamental nucleus of society and the first responsible party for the education of its children. None of that is in dispute.' },
    { h: 'What is disputed — both readings, fairly', p: 'The first reading, advanced by Colombian home-education organisations, is that the law makes education compulsory but not schooling — that nothing in it speaks of escolarización — and that the position is therefore a vacío legal in which families may educate at home provided they ensure a quality education and validate the results. Red Enfamilia Colombia describes the legal situation in exactly those terms: not defined, a legal vacuum, with the laws neither favouring nor discriminating against home education because they simply do not regulate it. The second reading holds that Ley 115 de 1994 requires minors to be enrolled in authorised educational institutions, and that non-presential education is available only to adults or to persons in exceptional personal or social circumstances, with attendance otherwise required between five and fifteen. Both are argued by Colombian sources in good faith. We present both and resolve neither, and we would tell any family whose plan depends on the answer to confirm their own position with the Ministerio de Educación Nacional and their secretaría de educación before beginning.' },
    { h: 'Scale, attributed rather than asserted', p: 'Colombian home-education organisations report on the order of eight thousand children and adolescents being educated at home. We attribute that figure to those organisations rather than presenting it as an official statistic, because it is a community estimate rather than a ministry count. It is enough to say that the practice exists at meaningful scale and that a support ecosystem has grown around it.' },
    { h: 'The validation machinery, which is genuinely clear', p: 'Whatever one concludes about the first question, this part is well defined and it is what families actually operate. Decreto 2832 de 2005 regulates validación por grados of basic and media studies, and provides that authorised institutions may evaluate those who have acquired each grade\'s knowledge. Decreto 299 de 2009 permits validating the entire bachillerato through a single examination — the ICFES Saber 11 — for those over eighteen; the age condition is essential and frequently omitted in summaries. Decreto 1075 de 2015, the Decreto Único Reglamentario del Sector Educación, consolidates the existing rules and defines the validation options for those not schooled. And ICFES Saber testing at grades 3, 5, 9 and 11 provides external reference points throughout the school career.' },
    { h: 'The window after fifteen', p: 'One planning fact distinguishes Colombia sharply from its regional neighbours. The compulsory range ends at fifteen and covers preescolar plus nine years of básica — which means the educación media years, grados 10 and 11, fall outside it. Mexico\'s obligation runs through media superior and Brazil\'s to seventeen; Colombia\'s does not. For an internationally minded family the senior phase therefore has genuine flexibility, and the sensible plan builds toward it rather than arriving at it.' },
    { h: 'What we offer, and the timezone that shapes it', p: 'Our default is live teaching alongside a school enrolment, which raises none of the disputed questions at all. We teach from Nairobi, eight hours ahead of Colombia with no daylight saving on either side, so our classes land in the Colombian morning — a seven o\'clock Colombian block is three in the afternoon here. That works cleanly for the large number of Colombian students in jornada tarde, whose school runs in the afternoon and whose mornings are free, and for full-time learners. It does not work as an after-school arrangement, and families whose child is in jornada mañana should talk to us before enrolling so we can be realistic about which subjects and days are possible.' },
  ],

  whySmartious: [
    { h: 'The disputed law given fairly, both sides',                      p: 'Colombian sources disagree about educating outside school. We set out both readings, name the decrees, and send families to the right authority instead of picking the convenient answer.' },
    { h: 'Morning teaching that fits the jornada tarde',                   p: 'Eight hours ahead means our classes land in the Colombian morning — the free half of the day for afternoon-shift students.' },
    { h: 'The post-fifteen window used properly',                          p: 'Compulsory education ends at fifteen and the educación media years fall outside it — a genuine flexibility Mexico and Brazil do not have.' },
    { h: 'An examined track, not just a bilingual one',                    p: 'Colombia\'s bilingual sector is large; bilingual schooling and an internationally examined qualification are different things at university application.' },
    { h: 'The regions served identically',                                 p: 'Cali, Barranquilla and Cartagena are large cities with less provision than their scale implies. Live delivery reaches all of them.' },
    { h: 'Honest about the eight-hour gap',                                p: 'We lead with it, explain which patterns work, and tell jornada mañana families to talk to us before enrolling.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Colombia?', a: 'Colombian sources genuinely disagree and we will not pretend the question is settled. Home-education organisations argue that education is compulsory but schooling is not, and describe the position as a legal vacuum; others read Ley 115 de 1994 as requiring enrolment in authorised institutions, with non-presential education limited to adults or exceptional circumstances. Both are argued in good faith. Confirm your own position with the Ministerio de Educación Nacional and your secretaría de educación.' },
    { q: 'What is actually agreed?', a: 'That education is compulsory between five and fifteen under article 67 of the Constitution, covering one year of preescolar and nine of básica; that articles 27 and 68 guarantee freedom of teaching and the parental right to choose the type of education; and that Ley 115 de 1994 makes the family first responsible for children\'s education.' },
    { q: 'How are studies validated in Colombia?', a: 'Decreto 2832 de 2005 regulates validación por grados through authorised institutions; Decreto 299 de 2009 permits validating the whole bachillerato in a single examination — Saber 11 — for those over eighteen; and Decreto 1075 de 2015 consolidates the options for those not schooled. ICFES Saber testing at grades 3, 5, 9 and 11 gives reference points along the way.' },
    { q: 'Is there a window after the compulsory years?', a: 'Yes, and it distinguishes Colombia from its neighbours. The obligation ends at fifteen and covers preescolar plus nine years of básica, so the educación media years fall outside it — unlike Mexico, where the obligation runs through media superior, or Brazil, where it runs to seventeen.' },
    { q: 'Eight hours behind — how does the timetable work?', a: 'Our classes land in the Colombian morning, not the afternoon. For students in jornada tarde that is the free half of the day and it works cleanly; for full-time learners mornings are natural anyway. It does not work after school, and jornada mañana families should talk to us before enrolling.' },
    { q: 'Why Cambridge when Colombia has a large bilingual sector?', a: 'Because bilingual schooling gives fluency and classroom culture while universities abroad assess qualifications. Cambridge IGCSEs and A-Levels are read directly rather than equivalence-assessed, and A-Level provision here is thinner than bilingual provision.' },
    { q: 'Where do Colombian students sit Cambridge examinations?', a: 'At authorised provision confirmed per family per session. Colombia\'s international and bilingual sector means Cambridge provision is established — Bogotá first, with regional options in Medellín and Cali.' },
    { q: 'Which parts of Colombia does Smartious cover?', a: 'Bogotá, Medellín, Cali and the Valle, Barranquilla, and Cartagena have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us whether your child is in jornada mañana or jornada tarde, and whether you are pursuing Colombian validación: in Colombia those two facts shape the whole plan, and they belong in the first message.',
}
