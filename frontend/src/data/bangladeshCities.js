// ═══════════════════════════════════════════════════════════════════
// BANGLADESH — Smartious city-level + country-level data
// Live online Cambridge IGCSE, O-Level, A-Level, Pearson Edexcel, IB
// Diploma, and American AP for English-medium, professional,
// industrial and Bangladeshi families across Dhaka, Chattogram,
// Sylhet, Khulna and Rajshahi.
// FIRST SOUTH ASIA MAINLAND BUILD — 5 cities.
//
// IMAGE NOTE: heroImg / heroImage use LOCAL PATHS under /heroes/.
// Drop a file at frontend/public/heroes/<slug>.jpg and it appears;
// if absent the onError handler shows the ink→crimson gradient.
//
// *** MARKET FRAMING — READ FIRST ***
// Cambridge is NOT novel in Bangladesh. The English-medium school
// sector has run Cambridge O-Level, IGCSE and A-Level (and Pearson
// Edexcel) for decades, and the qualifications are thoroughly
// understood by families, universities and employers here. NEVER
// pitch Cambridge as an exciting foreign alternative. The correct
// framing is exactly Myanmar's and Cyprus's: SUBJECT ACCESS,
// TEACHER DEPTH, PRICE and REACH OUTSIDE DHAKA.
// Note also that Bangladeshi English-medium schools commonly use
// O-LEVEL rather than IGCSE terminology. Use both — "Cambridge
// O-Level and IGCSE" — so the pages read naturally to a local family.
//
// LEGAL POSITIONING NOTE — HEDGE FIRMLY, SOURCING IS THIN:
// - We could NOT verify Bangladesh's position on parental home
//   education against a primary instrument.
// - What we can state: education is administered by the MINISTRY OF
//   EDUCATION, with the MINISTRY OF PRIMARY AND MASS EDUCATION
//   responsible for the primary level; primary education is
//   compulsory; the national curriculum is developed by the NATIONAL
//   CURRICULUM AND TEXTBOOK BOARD (NCTB); the national qualifications
//   are the SECONDARY SCHOOL CERTIFICATE (SSC) and HIGHER SECONDARY
//   CERTIFICATE (HSC), administered through the education boards.
// - English-medium schools operate under government registration and
//   oversight arrangements; confirm current requirements with the
//   Ministry.
// - PHRASE EVERY TIME: "we could not verify", plus "confirm with the
//   Ministry of Education". NEVER assert permitted, NEVER prohibited.
// - Reuse the absence-of-regulation-is-not-permission argument.
// - Smartious is NOT a registered Bangladeshi school; say so, and say
//   we do not teach toward the SSC or HSC.
// - CONSEQUENCE: SUPPLEMENTARY IS THE DEFAULT.
//
// TIMEZONE: BST (UTC+6), no seasonal changes — THREE HOURS AHEAD of
// our teaching base. Bangladeshi after-school hours land squarely in
// our teaching day: 16:00 BD = 13:00 for us, 18:00 = 15:00, 20:00 =
// 17:00. One of the best relationships in our coverage.
//
// CURRENCY: BDT. Fees quoted in USD.
//
// MARKET NOTE: Dhaka has a very large and long-established
// English-medium sector — Scholastica, Sunbeams, South Breeze,
// Maple Leaf, Aga Khan Academy, International School Dhaka,
// American International School Dhaka — running Cambridge O-Level,
// IGCSE, A-Level, Edexcel and IB. Chattogram is the port and second
// city with shipbreaking, the export processing zones and a
// substantial commercial community. SYLHET IS THE KEY DIASPORA CITY:
// the British Bangladeshi community is overwhelmingly Sylheti-
// origin, so families here have UK ties across generations and a
// UCAS-native qualification matters more than almost anywhere.
// Khulna anchors the south-west with Mongla port, shrimp and jute
// and the Sundarbans. Rajshahi is the northern university city,
// silk and mango region. Bangladesh's ready-made garments industry
// is one of the largest in the world and shapes the professional
// class in Dhaka and Chattogram particularly.
// ═══════════════════════════════════════════════════════════════════

export const BANGLADESH_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'dhaka-bd',
    name: 'Dhaka',
    county: 'Dhaka Division',
    region: 'The capital and the centre of one of the world\'s largest garment export industries · a very large and long-established English-medium school sector · the professional, diplomatic and development community · intense competition for places at the strongest schools',
    primaryKeyword: 'Online school and international curriculum in Dhaka',
    heroTagline: 'For Dhaka families — Cambridge is already familiar here. What is scarce is a specialist for the subject your school cannot run.',
    intro: 'Live online Cambridge O-Level and IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Dhaka families. Cambridge needs no introduction in this city — the English-medium sector has run O-Levels and A-Levels for decades and families here understand the qualifications as well as anywhere we teach. What we add is narrower: a subject specialist for the A-Level sets a single school timetable cannot sustain, a fee below the strongest schools, and a place without a queue. And Bangladesh sits three hours ahead of our teaching base, so after-school classes land squarely in our day.',
    heroImg: '/heroes/dhaka-bd.jpg',
    altTexts: { hero: 'Dhaka' },
    seoDesc: 'Live online Cambridge O-Level, IGCSE, A-Level, Pearson Edexcel, IB and AP for Dhaka families — subject specialists and after-school classes that fit. From USD 400/month.',
    challenges: [
      'Specialist A-Level subjects often will not run for small cohorts even in strong English-medium schools.',
      'Places at the leading schools are competitive, and mid-year entry is harder still.',
      'Fees at the top of the English-medium sector are significant locally.',
      'We could not verify Bangladesh\'s position on parental home education from a primary instrument.',
      'Time zone: Bangladesh runs BST (UTC+6), three hours ahead of our teaching base — after-school classes work well.',
    ],
    familySituations: [
      'English-medium school families needing a subject their timetable cannot cover.',
      'Garment, textile and export-sector professional households.',
      'Diplomatic, development and international-organisation families.',
      'Students targeting UK, North American, Australian or Malaysian universities.',
      'Families outside the leading schools\' fees who still want the same examinations.',
      'Students arriving mid-year with nowhere to place them.',
    ],
    nearbyAreas: ['Gulshan', 'Banani', 'Dhanmondi', 'Uttara', 'Bashundhara', 'Baridhara', 'Savar'],
    subjects: [
      'Cambridge O-Level and IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge O-Level and IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Bengali and home language support',
      'Cambridge A-Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
      'Cambridge A-Level Economics, Business, Accounting, Computer Science, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Computer Science A',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Australian, Malaysian and Bangladeshi university applications',
    ],
    whyChoose: [
      ['We are not introducing Cambridge to Dhaka', 'The English-medium sector has run O-Levels and A-Levels for decades. What we supply is teaching depth in specific subjects, not a new curriculum.'],
      ['The set your school cannot staff', 'Further Mathematics or a third science for four pupils is unviable on one timetable and routine in a live group drawn from several countries.'],
      ['A fee gap against the leading schools', 'Live small-group teaching at USD 2,160-6,480 a year toward the same examinations.'],
      ['After-school hours that genuinely work', 'Three hours ahead of our teaching base — a four o\'clock class in Dhaka is one in the afternoon for our teachers, six o\'clock is three.'],
      ['No waiting list', 'A child starts within a week of the assessment, which matters for mid-year arrivals and for families who have just changed school.'],
    ],
    growingReason: 'Dhaka is the capital and the centre of one of the world\'s largest garment export industries, with a very large and long-established English-medium school sector, a substantial professional, diplomatic and development community, and intense competition for places at the strongest schools. Bangladesh runs BST (UTC+6), three hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge O-Level, IGCSE and A-Level — Smartious\'s primary offer for Dhaka families, taught in after-school blocks alongside a school enrolment. Examinations at authorised centres confirmed per family per session; Bangladesh has extensive established Cambridge and Edexcel provision.',
      cbc: 'Kenya CBC available for Dhaka families with East African ties.',
      ib: 'IB Diploma Programme — live subject teaching and Extended Essay supervision alongside the city\'s IB provision.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'Bangladeshi education is administered by the Ministry of Education, with the Ministry of Primary and Mass Education responsible at the primary level, and primary education is compulsory — families should confirm the current age boundaries with the Ministry rather than take them from a provider. The national curriculum is developed by the National Curriculum and Textbook Board, and the national qualifications are the Secondary School Certificate and Higher Secondary Certificate administered through the education boards. English-medium schools operate under government registration and oversight arrangements, and current requirements should be confirmed with the Ministry. On parental home education we could not verify Bangladesh\'s position against a primary instrument, and we will not guess: an absence of clear regulation is an absence of protection rather than a permission, because where a matter is unaddressed there is nothing for a family to demonstrate if the question is raised. Put it to the Ministry directly. Smartious is not a registered Bangladeshi school, issues no Bangladeshi qualification, and does not teach toward the SSC or HSC. That distinction is straightforward here, because Dhaka families already understand the difference between the national board route and the Cambridge or Edexcel route — most of them have chosen between the two at some point. Our teaching sits in the second category, alongside whichever school a child attends.',
    homeTuitionDetail: 'Smartious delivers to Dhaka families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS. Bangladesh runs three hours ahead of our teaching base with no seasonal changes on either side, so a four or six o\'clock class in Dhaka sits comfortably inside our teaching day, at the same time every week of the year, with every session recorded.',
    faqs: [
      { q: 'Our school already does O-Levels and A-Levels — what would we gain?', a: 'Usually one specific thing: a subject set your school cannot staff for four students. Further Mathematics, a third science, or a clash. If your school covers what your child needs, we will tell you so.' },
      { q: 'Do you teach the SSC or HSC?', a: 'No. We are not a registered Bangladeshi school and issue no Bangladeshi qualification. We teach Cambridge, Edexcel, IB and AP, which sit alongside a school record.' },
      { q: 'What time are classes?', a: 'After-school works particularly well. Bangladesh is three hours ahead of our teaching base, so a four o\'clock class in Dhaka is one in the afternoon for our teachers and six o\'clock is three.' },
      { q: 'How do fees compare with the leading English-medium schools?', a: 'Smartious runs USD 2,160-6,480 a year for live small-group teaching toward the same Cambridge examinations, which is a different proposition financially from the top of the local sector.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'chattogram-bd',
    name: 'Chattogram',
    county: 'Chattogram Division',
    region: 'The principal port and second city · export processing zones, shipping and shipbreaking · a substantial commercial and industrial community · a much shorter English-medium list than Dhaka',
    primaryKeyword: 'Online school and international curriculum in Chattogram',
    heroTagline: 'For Chattogram families — the country\'s port and industrial engine, with a fraction of Dhaka\'s school list.',
    intro: 'Live online Cambridge O-Level and IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Chattogram families. The port city moves most of Bangladesh\'s trade and hosts the export processing zones, the shipping and shipbreaking industries and a commercial community with a long mercantile tradition. It is the country\'s second city by some distance, and its English-medium school list is a fraction of Dhaka\'s three hundred kilometres north. The constraint here is availability rather than curriculum, and live delivery answers it in after-school hours that fit our teaching day.',
    heroImg: '/heroes/chattogram-bd.jpg',
    altTexts: { hero: 'Chattogram port' },
    seoDesc: 'Live online Cambridge O-Level, IGCSE, A-Level, Pearson Edexcel, IB and AP for Chattogram families — port and industrial city, short school list. From USD 400/month.',
    challenges: [
      'A much shorter English-medium school list than Dhaka, three hundred kilometres north.',
      'Specialist A-Level subjects rarely run for small cohorts locally.',
      'A substantial commercial population with limited local options at sixth form.',
      'We could not verify Bangladesh\'s position on parental home education.',
      'Time zone: three hours ahead of our teaching base — after-school classes work well.',
    ],
    familySituations: [
      'Port, shipping, logistics and shipbreaking industry families.',
      'Export processing zone and manufacturing households.',
      'Commercial and trading families with a long mercantile tradition.',
      'Students aiming at engineering, business or medicine abroad.',
      'Households who would otherwise send a child to Dhaka for sixth form.',
    ],
    nearbyAreas: ['Chattogram', 'Agrabad', 'Khulshi', 'Patenga', 'Sitakunda', 'Cox\'s Bazar', 'the port corridor'],
    subjects: [
      'Cambridge O-Level and IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge O-Level and IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Bengali and home language support',
      'Cambridge A-Level Mathematics, Physics, Chemistry, Biology, Economics',
      'Cambridge A-Level Business, Accounting, Computer Science',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Calculus, AP Physics, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Australian, Malaysian and Bangladeshi university applications',
    ],
    whyChoose: [
      ['The complete option three hundred kilometres from Dhaka', 'Identical live delivery in Chattogram — no relocation for sixth form and no second household.'],
      ['Business and economics for a port and trading city', 'Cambridge A-Level Economics, Business, Accounting and Mathematics suit families who have run Bangladesh\'s trade for generations.'],
      ['Engineering depth for an industrial economy', 'Cambridge A-Level Physics, Mathematics and Chemistry — led by a founder with a BEd in Mathematics and Physics.'],
      ['After-school hours that genuinely work', 'A four o\'clock class here is one in the afternoon for our teachers.'],
      ['No waiting list', 'A child starts within a week of the assessment.'],
    ],
    growingReason: 'Chattogram is the principal port and second city, moving most of Bangladesh\'s trade and hosting the export processing zones, shipping and shipbreaking industries and a long mercantile community — with an English-medium school list a fraction of Dhaka\'s. Bangladesh runs BST (UTC+6), three hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge O-Level, IGCSE and A-Level — Smartious\'s primary offer for Chattogram, taught in after-school blocks alongside a school enrolment.',
      cbc: 'Kenya CBC available for Chattogram families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in Chattogram: education is administered by the Ministry of Education with the Ministry of Primary and Mass Education at the primary level, primary education is compulsory, and the national qualifications are the SSC and HSC administered through the education boards. English-medium schools operate under government registration and oversight arrangements. We could not verify Bangladesh\'s position on parental home education against a primary instrument and decline to read that silence in either direction — confirm with the Ministry directly. Smartious is not a registered Bangladeshi school, issues no Bangladeshi qualification and does not teach toward the SSC or HSC. Our arrangement is live subject teaching alongside a Bangladeshi school enrolment.',
    homeTuitionDetail: 'Smartious delivers to Chattogram families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school blocks, with every session recorded.',
    faqs: [
      { q: 'Would our child still need to go to Dhaka for sixth form?', a: 'Not for the teaching. Live delivery supplies A-Level subject specialists in Chattogram identically, with examination sittings at authorised local provision.' },
      { q: 'Our child wants engineering — what should they take?', a: 'Cambridge A-Level Mathematics and Physics with Chemistry or Further Mathematics, planned backward from the target university from O-Level or IGCSE onward.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'sylhet-bd',
    name: 'Sylhet',
    county: 'Sylhet Division',
    region: 'The tea garden region and the heart of Bangladesh\'s British diaspora connection · exceptional density of family ties to the United Kingdom · remittance-supported education spending · a growing but still short English-medium list',
    primaryKeyword: 'Online school and international curriculum in Sylhet',
    heroTagline: 'For Sylhet families — more UK family ties per household than anywhere in Bangladesh, and a qualification UCAS reads natively.',
    intro: 'Live online Cambridge O-Level and IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Sylhet families. Sylhet has a connection to Britain unlike anywhere else in Bangladesh — the British Bangladeshi community is overwhelmingly of Sylheti origin, and family ties across generations run through almost every household here. That makes one thing worth more in Sylhet than in most cities we serve: a qualification UCAS reads natively. Cambridge A-Levels are the record British admissions expects, requiring no conversion and no equivalence assessment. Alongside that sit the tea gardens, the remittance economy and a growing but still short English-medium school list.',
    heroImg: '/heroes/sylhet-bd.jpg',
    altTexts: { hero: 'Sylhet tea gardens' },
    seoDesc: 'Live online Cambridge O-Level, IGCSE, A-Level, Pearson Edexcel, IB and AP for Sylhet families — a UCAS-native qualification for a city with deep UK ties. From USD 400/month.',
    challenges: [
      'A growing but still short English-medium school list for the size of the demand.',
      'Families with UK ties needing a record British admissions reads without conversion.',
      'Dhaka is a considerable journey and its leading schools are competitive.',
      'We could not verify Bangladesh\'s position on parental home education.',
      'Time zone: three hours ahead of our teaching base — after-school classes work well.',
    ],
    familySituations: [
      'Households with family established in the United Kingdom across generations.',
      'Students who may apply to UK universities or join relatives there.',
      'Tea garden, agriculture and processing business families.',
      'Remittance-supported households investing in education.',
      'Families outside the leading Dhaka schools\' reach.',
    ],
    nearbyAreas: ['Sylhet city', 'Srimangal', 'Moulvibazar', 'Habiganj', 'Sunamganj', 'Zakiganj', 'the tea garden belt'],
    subjects: [
      'Cambridge O-Level and IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge O-Level and IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Bengali and home language support',
      'Cambridge A-Level Mathematics, Biology, Chemistry, Physics, Economics',
      'Cambridge A-Level Business, Accounting, Psychology, Geography',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Calculus, AP Microeconomics',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK) as the primary route, plus Common Application (US), Canadian and Bangladeshi applications',
    ],
    whyChoose: [
      ['UCAS reads A-Levels natively', 'For a city with this density of UK family ties, that is the practical answer to the question most households actually have. No conversion, no equivalence assessment, no explaining.'],
      ['UCAS guidance built in', 'Personal statement, reference planning, predicted grades and choice strategy — we run UK applications constantly and know the process rather than describing it.'],
      ['The complete option outside Dhaka', 'Identical live delivery in Sylhet, without relocating or competing for a capital place.'],
      ['After-school hours that genuinely work', 'A four o\'clock class here is one in the afternoon for our teachers.'],
      ['Agricultural and biological science that fit the region', 'Cambridge A-Level Biology and Chemistry feed agronomy, food science and the tea industry\'s technical roles directly.'],
    ],
    growingReason: 'Sylhet has a connection to Britain unlike anywhere else in Bangladesh — the British Bangladeshi community is overwhelmingly of Sylheti origin, with family ties across generations in almost every household — alongside the tea garden economy, remittance-supported education spending and a growing but still short English-medium school list. Bangladesh runs BST (UTC+6), three hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge O-Level, IGCSE and A-Level — Smartious\'s primary offer for Sylhet, and the route UK universities read natively through UCAS. Taught in after-school blocks alongside a school enrolment.',
      cbc: 'Kenya CBC available for Sylhet families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families with North American rather than UK ties.',
    },
    homeschoolDetail: 'The national picture applies in Sylhet: education is administered by the Ministry of Education with the Ministry of Primary and Mass Education at the primary level, primary education is compulsory, and the national qualifications are the SSC and HSC. English-medium schools operate under government registration and oversight arrangements. We could not verify Bangladesh\'s position on parental home education against a primary instrument and will not guess — confirm with the Ministry directly. Smartious is not a registered Bangladeshi school and does not teach toward the SSC or HSC. One point specific to this city: families with relatives in the United Kingdom sometimes ask whether a child might study under a UK framework instead. Education law follows residence, so a child resident in Bangladesh follows the Bangladeshi framework regardless of where relatives live — but the qualification is a separate question, and Cambridge A-Levels sat in Bangladesh are read by UCAS exactly as they would be if sat in Britain. That distinction between residence and qualification is the one most worth getting right here.',
    homeTuitionDetail: 'Smartious delivers to Sylhet families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school blocks, with every session recorded.',
    faqs: [
      { q: 'Our family is in Britain — will UK universities accept a qualification sat in Bangladesh?', a: 'Cambridge A-Levels are read by UCAS exactly as they would be if sat in the UK. The examination board is the same, the grades mean the same thing, and there is no conversion or equivalence step.' },
      { q: 'Could our child study under a UK framework from here?', a: 'Education law follows residence, so a child living in Bangladesh follows the Bangladeshi framework. The qualification is a separate question and that is where Cambridge helps — the record travels even though the residence does not change.' },
      { q: 'Is there enough English-medium schooling in Sylhet?', a: 'It is growing but still short for the demand, and Dhaka is a considerable journey. Live delivery reaches Sylhet identically.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'khulna-bd',
    name: 'Khulna & the South-West',
    county: 'Khulna Division',
    region: 'The south-western regional centre · Mongla port, shrimp aquaculture and jute processing · the Sundarbans and its research and conservation work · very limited English-medium provision',
    primaryKeyword: 'Online school and international curriculum in Khulna',
    heroTagline: 'For Khulna and south-western families — ports, shrimp, jute and the Sundarbans, with almost no English-medium schooling.',
    intro: 'Live online Cambridge O-Level and IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Khulna and south-western families. The region anchors Mongla port, the shrimp aquaculture and jute processing industries that export worldwide, and the Sundarbans with the research and conservation work that surrounds it. It is a substantial regional economy and English-medium provision here is very limited, with Dhaka a long way north-east. Live delivery reaches the south-west identically, in after-school hours that land squarely in our teaching day.',
    heroImg: '/heroes/khulna-bd.jpg',
    altTexts: { hero: 'Khulna and the Sundarbans delta' },
    seoDesc: 'Live online Cambridge O-Level, IGCSE, A-Level, Pearson Edexcel, IB and AP for Khulna and south-western Bangladesh families — ports and aquaculture, minimal provision. From USD 400/month.',
    challenges: [
      'Very limited English-medium provision across the south-west.',
      'Dhaka is a long way north-east and its schools are competitive.',
      'Families dispersed across the delta and the port corridor.',
      'We could not verify Bangladesh\'s position on parental home education.',
      'Time zone: three hours ahead of our teaching base — after-school classes work well.',
    ],
    familySituations: [
      'Mongla port, shipping and logistics families.',
      'Shrimp aquaculture, jute processing and agro-export households.',
      'Sundarbans research, conservation and environmental sector families.',
      'Regional professional and university households.',
      'Students aiming at environmental science, marine biology or engineering abroad.',
    ],
    nearbyAreas: ['Khulna', 'Mongla', 'Bagerhat', 'Jessore', 'Satkhira', 'the Sundarbans', 'the delta corridor'],
    subjects: [
      'Cambridge O-Level and IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge O-Level and IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Bengali and home language support',
      'Cambridge A-Level Biology, Chemistry, Geography, Mathematics, Physics',
      'Cambridge A-Level Economics, Business, Environmental Management-track subjects',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Environmental Science, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Australian, Malaysian and Bangladeshi university applications',
    ],
    whyChoose: [
      ['The complete option in a region with very little', 'Identical live delivery in Khulna as in Dhaka — no relocation and no second household.'],
      ['Environmental and marine science with real local ground', 'The Sundarbans, the delta and the aquaculture industry make Cambridge Biology and Geography and AP Environmental Science unusually well grounded.'],
      ['Business and economics for an export economy', 'Cambridge A-Level Economics, Business and Mathematics suit shrimp, jute and port families directly.'],
      ['After-school hours that genuinely work', 'A four o\'clock class here is one in the afternoon for our teachers.'],
      ['Every session recorded', 'A class that cannot be attended is never a class lost.'],
    ],
    growingReason: 'Khulna anchors the south-west with Mongla port, shrimp aquaculture and jute processing exporting worldwide, and the Sundarbans with its research and conservation work — a substantial regional economy with very limited English-medium provision. Bangladesh runs BST (UTC+6), three hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge O-Level, IGCSE and A-Level — Smartious\'s primary offer for the south-west, taught in after-school blocks alongside a school enrolment. Examination travel planned per session ahead.',
      cbc: 'Kenya CBC available for south-western families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the south-west: education is administered by the Ministry of Education with the Ministry of Primary and Mass Education at the primary level, primary education is compulsory, and the national qualifications are the SSC and HSC. We could not verify Bangladesh\'s position on parental home education against a primary instrument and will not guess in either direction — confirm with the Ministry directly, noting that an absence of clear regulation is an absence of protection rather than a permission. Smartious is not a registered Bangladeshi school and does not teach toward the SSC or HSC. Our arrangement is live subject teaching alongside a Bangladeshi school enrolment.',
    homeTuitionDetail: 'Smartious delivers to south-western families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school blocks, with every session recorded.',
    faqs: [
      { q: 'Is there English-medium schooling in Khulna?', a: 'Very limited, with Dhaka a long way north-east. Live delivery reaches Khulna, Mongla, Jessore and the delta corridor identically.' },
      { q: 'Our child wants environmental science or marine biology — what should they take?', a: 'Cambridge A-Level Biology and Chemistry with Geography, planned backward from the target university. The Sundarbans and the delta make unusually strong local context for those subjects.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'rajshahi-bd',
    name: 'Rajshahi & the North',
    county: 'Rajshahi and Rangpur Divisions',
    region: 'The northern university city · silk weaving and the mango and agricultural belt · a strong academic and medical tradition · thin English-medium provision across a wide region',
    primaryKeyword: 'Online school and international curriculum in Rajshahi',
    heroTagline: 'For Rajshahi and northern families — a university and medical city with high ambition and a short English-medium list.',
    intro: 'Live online Cambridge O-Level and IGCSE, Cambridge A-Level, Pearson Edexcel International, IB Diploma Programme, and American Curriculum with Advanced Placement (AP) for Rajshahi and northern families. The north holds the university city and its strong academic and medical tradition, alongside the silk weaving industry and the mango and agricultural belt that runs through the region. Academic ambition here is high — Rajshahi produces doctors, engineers and academics in numbers — and English-medium provision is thin across a wide region, with Dhaka a considerable journey south-east. Live delivery reaches the north identically, in after-school hours that fit our teaching day.',
    heroImg: '/heroes/rajshahi-bd.jpg',
    altTexts: { hero: 'Rajshahi and the northern belt' },
    seoDesc: 'Live online Cambridge O-Level, IGCSE, A-Level, Pearson Edexcel, IB and AP for Rajshahi and northern Bangladesh families — a university city with thin provision. From USD 400/month.',
    challenges: [
      'Thin English-medium provision across a wide northern region.',
      'Dhaka is a considerable journey south-east.',
      'High academic ambition in medicine and engineering with limited local A-Level options.',
      'We could not verify Bangladesh\'s position on parental home education.',
      'Time zone: three hours ahead of our teaching base — after-school classes work well.',
    ],
    familySituations: [
      'University academic, research and medical-faculty families.',
      'Silk weaving, agriculture and mango belt business households.',
      'Professional families across the northern divisions.',
      'Students aiming at medicine, dentistry or engineering.',
      'Households who would otherwise send a child south for sixth form.',
    ],
    nearbyAreas: ['Rajshahi', 'Natore', 'Naogaon', 'Chapainawabganj', 'Bogura', 'Rangpur', 'the northern belt'],
    subjects: [
      'Cambridge O-Level and IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
      'Cambridge O-Level and IGCSE Sciences (Biology, Chemistry, Physics, Combined Science)',
      'Cambridge IGCSE Bengali and home language support',
      'Cambridge A-Level Biology, Chemistry, Mathematics, Physics, Further Mathematics',
      'Cambridge A-Level Economics, Business, Psychology',
      'Pearson Edexcel International GCSE and A-Level',
      'IB Diploma Programme — all six subject groups',
      'American Curriculum — AP Biology, AP Chemistry, AP Calculus',
      'SAT, ACT, TOEFL, IELTS preparation',
      'University application support — UCAS (UK), Common Application (US), and Canadian, Australian, Malaysian and Bangladeshi university applications',
    ],
    whyChoose: [
      ['Pre-medical depth for a medical city', 'Cambridge A-Level Biology and Chemistry with Mathematics — the classic spine, and one Rajshahi families aim at in numbers given the city\'s medical tradition.'],
      ['The complete option in a wide region', 'Identical live delivery in Rajshahi, Bogura and Rangpur as in Dhaka.'],
      ['Engineering depth alongside', 'Cambridge A-Level Mathematics, Further Mathematics and Physics, led by a founder with a BEd in Mathematics and Physics.'],
      ['After-school hours that genuinely work', 'A four o\'clock class here is one in the afternoon for our teachers.'],
      ['No relocation for sixth form', 'Live delivery removes the journey south and the second household with it.'],
    ],
    growingReason: 'Rajshahi holds the northern university city and its strong academic and medical tradition, alongside silk weaving and the mango and agricultural belt — with high academic ambition and thin English-medium provision across a wide region. Bangladesh runs BST (UTC+6), three hours ahead of our teaching base.',
    curricula: {
      cambridge: 'Cambridge O-Level, IGCSE and A-Level — Smartious\'s primary offer for the north, taught in after-school blocks alongside a school enrolment. Examination travel planned per session ahead.',
      cbc: 'Kenya CBC available for northern families with East African ties.',
      ib: 'IB Diploma Programme available for families targeting this pathway.',
      american: 'American Curriculum with AP — for families targeting American universities.',
    },
    homeschoolDetail: 'The national picture applies in the north: education is administered by the Ministry of Education with the Ministry of Primary and Mass Education at the primary level, primary education is compulsory, and the national qualifications are the SSC and HSC administered through the education boards. English-medium schools operate under government registration and oversight arrangements. We could not verify Bangladesh\'s position on parental home education against a primary instrument and will not guess — confirm with the Ministry directly. Smartious is not a registered Bangladeshi school and does not teach toward the SSC or HSC. Our arrangement is live subject teaching alongside a Bangladeshi school enrolment, which for an academically ambitious northern household is usually the configuration they wanted anyway.',
    homeTuitionDetail: 'Smartious delivers to northern families online; the live programme is complete without in-person supplementation.',
    onlineLearningDetail: 'Live online via Smartious LMS in after-school blocks, with every session recorded.',
    faqs: [
      { q: 'Our child is aiming at medicine — what should they take?', a: 'Cambridge A-Level Biology and Chemistry with Mathematics form the classic spine, planned backward from the target university from O-Level or IGCSE onward. It is the most common request we receive from this region.' },
      { q: 'Is there English-medium schooling in the north?', a: 'Thin across a wide region, with Dhaka a considerable journey south-east. Live delivery reaches Rajshahi, Bogura and Rangpur identically.' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
export const BANGLADESH_COUNTRY = {
  slug: 'bangladesh',
  name: 'Bangladesh',
  longName: 'People\'s Republic of Bangladesh',
  adjective: 'Bangladeshi',
  flag: '🇧🇩',
  hub: '/online-school/bangladesh',
  hubPageId: 'homeschooling-bangladesh',
  cityPageId: 'bangladesh-city',

  currency: 'BDT',
  currencyName: 'Bangladeshi Taka',
  currencyPeg: 'Fees are quoted and invoiced in USD; taka equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'BST',
    name: 'Bangladesh Standard Time (UTC+6), with no seasonal clock changes',
    utcOffset: '+6',
    offsetFromEAT: 'Three hours ahead of our teaching base — so after-school classes land squarely inside our teaching day',
  },

  examCentres: ['Extensive authorised Cambridge and Pearson Edexcel provision through Bangladesh\'s large and long-established English-medium school sector, confirmed per family per session'],
  examCentreTiles: [
    { city: 'Dhaka', centre: 'Authorised provision', area: 'The country\'s deepest external-candidate capacity, confirmed per family per session.' },
    { city: 'Chattogram', centre: 'Regional provision', area: 'Checked first for southern and port-region families.' },
    { city: 'Sylhet, Khulna and Rajshahi', centre: 'Planned per session', area: 'Regional families plan travel into each window ahead.' },
  ],
  examLogisticsProse: 'Cambridge International and Pearson Edexcel examinations for Bangladesh-based students sit as external candidates at authorised provision, with capacity confirmed per family per session. Bangladesh is one of the easier markets in our coverage for this: the English-medium sector has run Cambridge O-Level, IGCSE and A-Level for decades, so provision and familiarity are both extensive. Dhaka is checked first, with Chattogram for southern families and travel planned ahead from Sylhet, Khulna and Rajshahi. Note what does not change: our arrangement runs alongside a Bangladeshi school, which continues its own track unchanged. Smartious is not a registered Bangladeshi school, issues no Bangladeshi qualification, and does not teach toward the SSC or HSC.',
  secondaryProgrammeExamRef: 'Authorised Bangladeshi Cambridge provision',
  finalCTABadgeExamRef: 'Cambridge centres confirmed per family, per session',

  heroImage: '/heroes/bangladesh.jpg',
  heroEyebrow: 'Online school for Bangladesh',
  heroH1Suffix: 'Bangladesh',
  heroSubhead: 'Live online Cambridge O-Level, IGCSE, A-Level, Pearson Edexcel, IB Diploma, and American AP for English-medium, professional and Bangladeshi families across Dhaka, Chattogram, Sylhet, Khulna and Rajshahi. Cambridge is already well established here, so we are not introducing a curriculum — we supply subject specialists, in after-school hours that land squarely in our teaching day.',
  heroValueProp: 'From USD 180/month. Small live classes 4-6 students, Cambridge O-Level / A-Level / IB / AP — after-school, alongside your school, with no waiting list.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Bangladesh',

  citiesSectionTitle: 'Where our Bangladesh families are',
  citiesSectionBody: 'Smartious Bangladesh families concentrate across Dhaka (the capital, the garment export economy and a very large English-medium sector with competitive places), Chattogram (the principal port and second city with a fraction of Dhaka\'s school list), Sylhet (the heart of Bangladesh\'s British diaspora connection, where a UCAS-native qualification matters more than almost anywhere), Khulna and the south-west (Mongla port, aquaculture and the Sundarbans, with very limited provision), and Rajshahi and the north (a university and medical city with high ambition and a short list). One familiar curriculum, one shortage of specialists, and a timezone that fits after-school.',

  trustSignals: [
    { h: 'Cambridge is already familiar here', p: 'Bangladesh\'s English-medium sector has run Cambridge O-Level, IGCSE and A-Level for decades. We are not introducing a curriculum and would not pretend to — what we add is a subject specialist for the sets a single timetable cannot sustain.' },
    { h: 'After-school hours that genuinely work', p: 'Bangladesh runs UTC+6, three hours ahead of our teaching base. A four o\'clock class in Dhaka is one in the afternoon for our teachers and six o\'clock is three — among the best scheduling relationships in our coverage.' },
    { h: 'A UCAS-native record, which matters most in Sylhet', p: 'Cambridge A-Levels are read by UCAS exactly as they would be if sat in Britain, with no conversion step. For a city where family ties to the United Kingdom run through almost every household, that is the practical answer to the question families actually have.' },
    { h: 'Honest about what we could not verify', p: 'We could not establish Bangladesh\'s position on parental home education from a primary instrument. Rather than guessing, we say so, note that an absence of clear regulation is not a permission, and send families to the Ministry of Education.' },
  ],

  universitiesInCountry: 'the University of Dhaka, Bangladesh University of Engineering and Technology, the University of Chittagong, the University of Rajshahi and the medical colleges, alongside a substantial private sector including North South, BRAC and Independent universities — several teaching in English.',
  universityChannels: 'Bangladeshi public universities admit principally on the HSC through their own admission examinations, while the private sector — much of it teaching in English — routinely admits students holding Cambridge A-Levels and Edexcel qualifications, which are thoroughly understood here. Outward, Bangladeshi students apply in very large numbers to the United Kingdom, and also to Canada, Australia, Malaysia, the United States and Germany. UCAS reads Cambridge A-Levels natively with no equivalence step, which matters particularly for the many families with British relatives; Canadian, Australian and Malaysian universities read A-Levels and the IB directly. A-Levels are accepted in 160+ countries. Smartious provides personalised university guidance across UK (UCAS), Canadian, Australian, Malaysian, US and Bangladeshi destinations.',
  cambridgeCardDescription: 'Smartious\'s primary offer for Bangladesh families. Cambridge O-Level, IGCSE and A-Level delivered as live small-group classes in after-school blocks — three hours ahead of our teaching base, so a four o\'clock class in Dhaka is one in the afternoon for us — run alongside a Bangladeshi school enrolment that continues its own track unchanged. Cambridge Bengali and home language support available beside the English-medium core. No waiting list.',
  britishCurriculumSuits: 'Bangladesh families targeting the Cambridge pathway. Best fit for: (1) English-medium students needing a subject their school cannot staff for a small cohort, (2) Sylhet families whose children may apply to UK universities or join relatives there, (3) Khulna, Rajshahi and Chattogram families where provision is thin or limited, (4) Dhaka households outside the leading schools\' fees, (5) students who would otherwise relocate for sixth form.',
  britishCurriculumDelivery: 'Live online classes in after-school blocks, small groups 4-6 students, every session recorded, alongside a Bangladeshi school enrolment.',
  ibDiplomaSuits: 'Bangladesh families in the country\'s IB sector wanting live subject teaching, Theory of Knowledge, and Extended Essay supervision alongside their school.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Bangladesh families targeting American universities via Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2019 to make international qualifications accessible to families at online-delivery fees rather than campus ones. Bangladesh is a market where Cambridge arrived long before we did and is thoroughly understood — which makes our role clear and narrow: we supply the subject specialist, not the curriculum.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics — Smartious\'s Cambridge A-Level and IB Diploma STEM subjects are led personally when needed, suiting Chattogram\'s engineering households and every medicine-bound student in Rajshahi and Dhaka. Head of Academics supervises curriculum delivery and university placement strategy per family.',

  competitorsIntro: 'Bangladesh has a very large and long-established English-medium school sector — Scholastica, Sunbeams, South Breeze, Maple Leaf, the Aga Khan Academy, International School Dhaka and American International School Dhaka among many others — running Cambridge O-Level, IGCSE, A-Level, Edexcel and IB. Those are serious institutions and the curriculum is thoroughly understood here. The gaps are specific: specialist A-Level sets that will not run for four students, fees at the top of the sector, and a school map that thins sharply outside Dhaka.',
  competitors: [
    { name: 'Scholastica, Sunbeams, South Breeze',              city: 'Dhaka',                 curriculum: 'Cambridge O-Level, A-Level and Edexcel', feesUsd: 'Top of the local market',                          feesAed: 'Competitive places',      rating: 4.6, capacityNote: 'Long-established and strong — the national benchmark, and heavily subscribed' },
    { name: 'Aga Khan Academy, ISD, AISD',                      city: 'Dhaka',                 curriculum: 'IB and American',                       feesUsd: 'International tier',                                feesAed: 'Premium',                 rating: 4.7, capacityNote: 'Excellent international provision, priced accordingly and capital-bound' },
    { name: 'The wider English-medium sector',                  city: 'Dhaka and Chattogram',  curriculum: 'Cambridge O-Level and A-Level',         feesUsd: 'Mid tier',                                          feesAed: 'Widespread',              rating: 4.2, capacityNote: 'Large and well established — and specialist A-Level sets still rarely run for small cohorts' },
    { name: 'Sylhet, Khulna and Rajshahi',                      city: 'Outside the two cities', curriculum: 'Thin to very limited',                 feesUsd: 'Limited option',                                    feesAed: '—',                       rating: 0,   capacityNote: 'A diaspora city with deep UK ties, a port and aquaculture region, and a university city — all short on provision' },
    { name: 'Private tuition and coaching centres',             city: 'Nationwide',            curriculum: 'Exam-focused coaching',                 feesUsd: 'Per hour, per subject',                             feesAed: 'Very widespread',         rating: 4.1, capacityNote: 'Enormous and long established — usually one-to-one or large-group, and rarely a structured year' },
    { name: 'UK-based online schools',                          city: 'Online',                curriculum: 'UK online, Cambridge and Edexcel',      feesUsd: 'GBP 9,000-11,000',                                  feesAed: 'Varies',                  rating: 4.2, capacityNote: 'Priced far above Smartious — though closer to the UK academic calendar, which some Sylhet families weigh' },
    { name: 'Smartious Homeschool (Bangladesh via online delivery)', city: 'Delivered nationwide', curriculum: 'Cambridge O-Level, IGCSE, A-Level, IB, AP', feesUsd: 'USD 2,160-6,480/year',                   feesAed: 'BDT at prevailing rate',   rating: 4.8, capacityNote: 'Every class live through A-Level + after-school hours that fit + Sylhet, Khulna and Rajshahi reached + no waiting list' },
  ],

  legalFrameworkIntro: 'Bangladesh is one of the markets where we could not verify the central question, so we set out what we can establish and then the two facts that matter more here in practice.',
  legalFramework: [
    { h: 'What we can establish', p: 'Education in Bangladesh is administered by the Ministry of Education, with the Ministry of Primary and Mass Education responsible at the primary level. Primary education is compulsory, and families should confirm the current age boundaries with the Ministry rather than take them from any article. The national curriculum is developed by the National Curriculum and Textbook Board, and the national qualifications are the Secondary School Certificate and the Higher Secondary Certificate, administered through the education boards. English-medium schools operate under government registration and oversight arrangements, and current requirements should be confirmed with the Ministry. Smartious is not a registered Bangladeshi school, issues no Bangladeshi qualification, and does not teach toward the SSC or HSC.' },
    { h: 'What we could not establish', p: 'Bangladesh\'s position on parental home education. We could not verify it against a primary instrument and are not going to fill that gap with confident prose. We will not tell you it is permitted and we will not tell you it is prohibited; both would exceed what we can evidence. What we would add is the point we make in Jordan, Iraq, Lebanon and elsewhere: an absence of clear regulation is an absence of protection rather than a permission, because where a matter is unaddressed there is nothing for a family to demonstrate if the question is raised. Put it to the Ministry of Education directly.' },
    { h: 'Why the distinction is easier here than in most markets', p: 'Bangladeshi families already understand the difference between the national board route and the Cambridge or Edexcel route, because most of them have chosen between the two at some point — the English-medium sector has run O-Levels and A-Levels for decades and the qualifications are thoroughly understood by families, universities and employers. So when we say our teaching sits alongside a school rather than replacing it, and that we do not teach toward the SSC or HSC, that lands as an ordinary statement rather than a complication.' },
    { h: 'The first thing that matters more: teachers, not curriculum', p: 'This is the honest heart of what we offer Bangladesh. The curriculum is already here and well taught. What a single school cannot always do is run Further Mathematics for four students, or a third science, or Computer Science at A-Level — and outside Dhaka the problem is sharper still, because the English-medium sector thins dramatically once you leave the capital and Chattogram. In a live class of four to six drawn from several countries, a subject that is unviable in one school runs normally. That is the whole mechanism.' },
    { h: 'The second: the United Kingdom, and Sylhet in particular', p: 'Bangladeshi students apply to UK universities in very large numbers, and Sylhet has a connection to Britain unlike anywhere else in the country — the British Bangladeshi community is overwhelmingly of Sylheti origin and family ties run through almost every household. UCAS reads Cambridge A-Levels natively, with no conversion and no equivalence assessment: an A-Level sat in Dhaka or Sylhet means exactly what an A-Level sat in Manchester means. One distinction is worth getting right, and families ask it often — education law follows residence, so a child living in Bangladesh follows the Bangladeshi framework regardless of where relatives live. The qualification is a separate question, and that is where Cambridge helps.' },
    { h: 'And the clock', p: 'Bangladesh runs UTC+6 with no seasonal clock changes against our UTC+3, so it is three hours ahead of us. A four o\'clock class in Dhaka is one in the afternoon for our teachers, six o\'clock is three, and eight in the evening is five. Every one of those is an ordinary teaching hour here. Across much of our Latin American coverage an after-school arrangement is impossible and we say so plainly; in Bangladesh it is the natural configuration, and it is one of the better scheduling relationships we have anywhere.' },
  ],

  whySmartious: [
    { h: 'A specialist, not a new curriculum',                            p: 'Cambridge has been taught in Bangladesh for decades. What is scarce is a teacher for the subject a school cannot run for four students.' },
    { h: 'After-school hours that genuinely work',                        p: 'Three hours ahead means a four o\'clock class in Dhaka is one in the afternoon for our teachers — the natural configuration here.' },
    { h: 'A UCAS-native record for a UK-connected country',               p: 'Cambridge A-Levels are read by UCAS with no conversion step, which matters most in Sylhet but applies nationwide.' },
    { h: 'Sylhet, Khulna and Rajshahi reached',                           p: 'A diaspora city, a port and aquaculture region and a university city, all short on English-medium provision.' },
    { h: 'No waiting list',                                              p: 'A child starts within a week of the assessment, which matters for mid-year arrivals and school changes.' },
    { h: 'Honest about the question we could not verify',                 p: 'We could not establish Bangladesh\'s home-education position and say so rather than guessing in either direction.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Bangladesh?', a: 'We could not verify a position from a primary instrument and will not guess. Primary education is compulsory and administered by the Ministry of Primary and Mass Education, with the Ministry of Education responsible more broadly. An absence of clear regulation is not a permission — put the question to the Ministry directly. Structured study alongside a school enrolment raises none of it.' },
    { q: 'Do you teach the SSC or HSC?', a: 'No. We are not a registered Bangladeshi school and issue no Bangladeshi qualification. We teach Cambridge O-Level, IGCSE, A-Level, Edexcel, IB and AP, which sit alongside a school record — a distinction Bangladeshi families already understand well.' },
    { q: 'Our school already does O-Levels — what would we gain?', a: 'Usually a subject it cannot staff for a small cohort: Further Mathematics, a third science, or a clash. If your school covers what your child needs, we will tell you so.' },
    { q: 'What time are classes?', a: 'After-school works particularly well. Bangladesh is three hours ahead of our teaching base, so a four o\'clock class in Dhaka is one in the afternoon for our teachers and six o\'clock is three.' },
    { q: 'Will UK universities accept A-Levels sat in Bangladesh?', a: 'Yes, and without any conversion. UCAS reads Cambridge A-Levels natively — an A-Level sat in Sylhet means exactly what one sat in Britain means. That matters particularly for the many families here with UK relatives.' },
    { q: 'Could our child follow a UK framework from Bangladesh?', a: 'Education law follows residence, so a child living in Bangladesh follows the Bangladeshi framework regardless of where relatives live. The qualification is a separate question, and Cambridge answers it.' },
    { q: 'Where would our child sit examinations?', a: 'At authorised provision confirmed per family per session. Bangladesh has extensive established Cambridge and Edexcel provision — Dhaka first, Chattogram for southern families, and travel planned ahead from Sylhet, Khulna and Rajshahi.' },
    { q: 'Which parts of Bangladesh does Smartious cover?', a: 'Dhaka, Chattogram, Sylhet, Khulna and the south-west, and Rajshahi and the north have dedicated pages. Live online delivery works identically anywhere in the country.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Two-gate admissions process. Submit the assessment request form — our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled. Tell us which subjects your school cannot offer and where your child hopes to apply: in Bangladesh those two answers are almost always the whole conversation.',
}
