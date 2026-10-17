// ═══════════════════════════════════════════════════════════════════
// BAHRAIN — Smartious city-level + country-level data
// Same export shape as kuwaitCities.js: BAHRAIN_CITIES / BAHRAIN_COUNTRY.
// Registered in lazyData.js; /homeschool-<slug> routing is picked up by
// scripts/build-data-index.js automatically.
//
// Facts used here (keep them in step with the rest of the site):
// - Bahrain is on Arabia Standard Time (AST, UTC+3), the same as
//   Nairobi (EAT, UTC+3): no time difference.
// - Fees: from USD 423/month for Primary, payable termly; fees vary by
//   curriculum and level. One-to-one tuition USD 15/hour. Non-refundable
//   once the assessment is done, the timetable created and lessons
//   started. BHD is pegged at about BHD 0.376/USD: USD 423 ≈ BHD 159,
//   USD 15 ≈ BHD 5.6 (Oct 2026 rate).
// - IGCSE / A Level: private-candidate entries through British Council
//   Bahrain.
// - Recognition, equivalency and re-enrolment: always phrased as
//   "check with the school or the Ministry of Education".
// No invented schools' fees, statistics, testimonials or ratings.
// ═══════════════════════════════════════════════════════════════════

const FEES_BH = 'Online school is from USD 423/month for Primary (≈ BHD 159/month at about BHD 0.376/USD, Oct 2026 rate), payable termly. Secondary, IGCSE, A Level and IB fees vary by curriculum and level. One-to-one tuition is USD 15/hour (≈ BHD 5.6). Fees are non-refundable once the assessment is done, the timetable created and lessons started.'
const TIME_BH = 'Bahrain is on Arabia Standard Time (AST, UTC+3), the same time as our teachers in Nairobi. A 9:00 lesson is 9:00 in Manama, so live lessons fall in normal school hours, Sunday to Thursday, and every lesson is recorded.'
const EXAMS_BH = 'Cambridge IGCSE and A Level, and Pearson Edexcel International GCSE and A Level, are taken as a private candidate. In Bahrain, private-candidate entries are made through British Council Bahrain. Entry deadlines fall months before each series, so check the British Council Bahrain website for current dates and fees.'
const RECOG_BH = 'IGCSE and A Level are widely used in Bahrain\'s private schools and are accepted by universities in Bahrain and abroad. If your child may later move to a Bahraini school, or needs a certificate recognised for university or government purposes, ask the school or the Ministry of Education about equivalency and transfer requirements before you start, and keep reports and exam certificates.'
const LEGAL_BH = 'Bahrain\'s education law makes basic education compulsory. The rules for homeschooling and online schooling are not set out in detail and can differ for Bahraini citizens and expatriate residents. Expatriate families commonly use international online schools, especially for IGCSE and A Level. Check your own situation with the Ministry of Education.'
const INTAKE = 'The January 2027 intake is open: Term 2 starts on 5 January 2027. Students can also join during the year after an assessment.'
const CONTACT = 'Admissions: +254 745 021 212 (call or WhatsApp). Academic office: +254 182 071 920. Email: hello@smartioushomeschool.com.'

export const BAHRAIN_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'manama-bh',
    name: 'Manama',
    county: 'Capital Governorate',
    region: 'Juffair · Adliya · Seef · Sanabis · Hoora · Saar · Budaiya · Amwaj',
    primaryKeyword: 'Online school and homeschooling in Manama',
    seoTitle: 'Online School in Manama | Live IGCSE, British Curriculum',
    seoDesc: 'Online school and homeschool in Manama: live IGCSE, A-Level and American classes on Bahrain time. From USD 423/month (≈ BHD 159). January 2027 intake.',
    heroTagline: 'Live online British and American curriculum for families in Juffair, Adliya, Seef, Sanabis, Saar, Budaiya and Amwaj, on Bahrain time.',
    intro: 'Manama families include long-term Bahraini residents and expatriates on two- to four-year contracts in finance, the US Navy\'s support community, healthcare and hospitality. Many want a British or American curriculum that continues when they move. Smartious teaches live online on Bahrain time, with no time difference from our teachers in Nairobi. Families in Juffair, Seef, Saar and Amwaj use us as a full online school, while waiting for a school place, or for one-to-one tuition alongside a Bahrain school.',
    altTexts: { hero: 'Student in Manama in a live online Smartious lesson' },
    challenges: [
      'Places in popular year groups at Bahrain\'s British and American schools can be limited, especially for families arriving mid-year.',
      'School-run traffic on the King Faisal Highway, Shaikh Khalifa bin Salman Highway and the roads to Saar and Budaiya at peak times.',
      'Expatriate contracts end or move, so families need a curriculum that continues in the next country.',
      'Families want to know how an online year will be treated if their child later re-enrols in a Bahraini school.',
      'Fees at leading international schools are high, and many add registration, capital and exam fees.',
    ],
    familySituations: [
      'Juffair families on fixed-term contracts who expect to move again.',
      'Seef and Sanabis families waiting for a school place for a mid-year arrival.',
      'Saar and Budaiya families who want to cut the cross-island school run.',
      'Amwaj families with a teenager who needs an A Level subject their school does not offer.',
      'Families who commute between Bahrain and the Eastern Province of Saudi Arabia across the King Fahd Causeway.',
    ],
    nearbyAreas: ['Juffair', 'Adliya', 'Seef', 'Sanabis', 'Hoora', 'Gudaibiya', 'Um Al Hassam', 'Saar', 'Budaiya', 'Janabiya', 'Amwaj Islands', 'Muharraq', 'Diyar Al Muharraq', 'Bahrain Bay'],
    subjects: [
      'Cambridge IGCSE and International AS and A Level, all major subjects',
      'Pearson Edexcel International GCSE and A Level',
      'American curriculum with AP courses',
      'Cambridge IGCSE Arabic and Islamic Studies',
      'SAT, IELTS and university application support',
    ],
    whyChoose: [
      ['Bahrain time, no difference', TIME_BH],
      ['Exam entries through British Council Bahrain', EXAMS_BH],
      ['Clear on recognition', RECOG_BH],
      ['Moves with your family', 'Enrolment continues when a contract moves you to another Gulf country or home.'],
      ['Clear fees', FEES_BH],
    ],
    growingReason: 'Manama\'s mobile expatriate families need schooling that continues between postings, and families arriving mid-year often cannot find a place straight away.',
    curricula: {
      cambridge: 'Cambridge Primary to IGCSE and A Level, entered as a private candidate through British Council Bahrain.',
      cbc: 'Kenya CBE (CBC) for families with East African links.',
      ib: 'IB subject support for students at IB schools in Bahrain.',
      american: 'American curriculum with AP, often chosen by US-linked families. AP exams are taken at an authorised College Board test centre.',
    },
    homeschoolDetail: 'Full-time Manama students get a personal timetable, live small-group lessons, recordings, marked work and termly reports. ' + FEES_BH,
    homeTuitionDetail: 'Tuition is online, one-to-one, at USD 15/hour (≈ BHD 5.6 at the Oct 2026 rate).',
    onlineLearningDetail: TIME_BH + ' Home fibre in Manama is fine for live classes.',
    faqs: [
      { q: 'What does online school cost in Bahrain?', a: FEES_BH },
      { q: 'Is there a time difference with your teachers?', a: TIME_BH },
      { q: 'Where does my child sit IGCSE exams in Bahrain?', a: EXAMS_BH },
      { q: 'Will a Bahraini school accept my child back after online school?', a: RECOG_BH },
      { q: 'Is homeschooling legal in Bahrain?', a: LEGAL_BH },
      { q: 'When can we start?', a: INTAKE },
      { q: 'How do we contact Smartious?', a: CONTACT },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'riffa-bh',
    name: 'Riffa',
    county: 'Southern Governorate',
    region: 'East Riffa · West Riffa · Riffa Views · Hajiyat · Bukuwara',
    primaryKeyword: 'Online school and homeschooling in Riffa',
    seoTitle: 'Online School in Riffa | Live IGCSE & American Classes',
    seoDesc: 'Online school and homeschool in Riffa: live IGCSE, A-Level and American classes on Bahrain time. From USD 423/month (≈ BHD 159). January 2027 intake.',
    heroTagline: 'Live online British and American curriculum for families in East Riffa, West Riffa, Riffa Views, Hajiyat and Isa Town, on Bahrain time.',
    intro: 'Riffa families, Bahraini and expatriate, often find that the school they want is a drive north towards Manama or Saar at rush hour. Smartious teaches live online on Bahrain time. Families in East and West Riffa, Riffa Views and nearby Isa Town use us as a full online school or for one-to-one tuition in a single subject.',
    altTexts: { hero: 'Student in Riffa in a live online Smartious lesson' },
    challenges: [
      'Rush-hour traffic on the Shaikh Isa bin Salman Highway and the roads north towards Manama, Isa Town and Saar.',
      'Places at preferred British and American schools can be limited in some year groups.',
      'Families want clarity on re-enrolment and equivalency if they later return to a Bahraini school.',
      'Finding specialist A Level teachers, for example in Further Mathematics or Computer Science.',
    ],
    familySituations: [
      'Riffa Views families who want to cut the drive to Saar or Manama.',
      'East Riffa Bahraini families adding IGCSE subjects alongside their school.',
      'West Riffa families on fixed-term contracts.',
      'Hajiyat and Isa Town families with a child who needs one-to-one A Level support.',
    ],
    nearbyAreas: ['East Riffa', 'West Riffa', 'Riffa Views', 'Hajiyat', 'Bukuwara', 'Isa Town', 'A\'ali', 'Awali', 'Sakhir', 'Zallaq'],
    subjects: [
      'Cambridge IGCSE and International AS and A Level',
      'Pearson Edexcel International GCSE and A Level',
      'American curriculum with AP',
      'Cambridge IGCSE Arabic and Islamic Studies',
    ],
    whyChoose: [
      ['No drive north at rush hour', 'Lessons start at home in Riffa.'],
      ['Bahrain time, no difference', TIME_BH],
      ['Exam entries through British Council Bahrain', EXAMS_BH],
      ['Clear on recognition', RECOG_BH],
      ['Clear fees', FEES_BH],
    ],
    growingReason: 'Riffa families want to avoid the daily drive north and to add international subjects without changing school.',
    curricula: {
      cambridge: 'Cambridge Primary to IGCSE and A Level, entered as a private candidate through British Council Bahrain.',
      cbc: 'Kenya CBE (CBC) for families with East African links.',
      ib: 'IB subject support.',
      american: 'American curriculum with AP.',
    },
    homeschoolDetail: 'Full-time Riffa students get a personal timetable, live small-group lessons, recordings, marked work and termly reports. ' + FEES_BH,
    homeTuitionDetail: 'Tuition is online, one-to-one, at USD 15/hour (≈ BHD 5.6 at the Oct 2026 rate).',
    onlineLearningDetail: TIME_BH,
    faqs: [
      { q: 'What does it cost?', a: FEES_BH },
      { q: 'Where does my child sit IGCSE exams?', a: EXAMS_BH },
      { q: 'Can my child return to a Bahraini school later?', a: RECOG_BH },
      { q: 'Is homeschooling legal in Bahrain?', a: LEGAL_BH },
      { q: 'When can we start, and who do we contact?', a: INTAKE + ' ' + CONTACT },
    ],
  },
]

export const BAHRAIN_COUNTRY = {
  // ── Identity ───────────────────────────────────────────────────
  slug: 'bahrain',
  name: 'Bahrain',
  longName: 'Kingdom of Bahrain',
  adjective: 'Bahraini',
  flag: '🇧🇭',
  hub: '/online-school/bahrain',
  hubPageId: 'homeschooling-bahrain',
  cityPageId: 'bahrain-city',

  // ── SEO (hub) ─────────────────────────────────────────────────
  seoTitle: 'Online School in Bahrain | British & American Curriculum',
  seoDesc: 'Virtual school and homeschool in Bahrain: live IGCSE, A-Level and American classes on Bahrain time. From USD 423/month (≈ BHD 159). January 2027 intake.',
  h1: 'Online school and homeschool in Bahrain',

  // ── Currency ──────────────────────────────────────────────────
  currency: 'BHD',
  currencyName: 'Bahraini Dinar',
  currencyPeg: { rate: 0.376, since: null, note: 'BHD is pegged to the USD at about 0.376 (Oct 2026 rate). Figures are approximate; fees are set in USD.' },

  // ── Time zone ─────────────────────────────────────────────────
  timezone: {
    code: 'AST',
    name: 'Arabia Standard Time',
    utcOffset: '+3',
    offsetFromEAT: 'zero, the same as Nairobi',
  },

  // ── Exam centres ──────────────────────────────────────────────
  examCentres: ['British Council Bahrain'],
  examCentreTiles: [
    { city: 'Manama', centre: 'British Council Bahrain', area: 'Private-candidate entries for Cambridge and Pearson Edexcel. Check current dates and fees on the British Council Bahrain website.' },
  ],
  examLogisticsProse: EXAMS_BH,
  secondaryProgrammeExamRef: 'British Council Bahrain',
  finalCTABadgeExamRef: 'British Council Bahrain exam entries',

  // ── Hero ──────────────────────────────────────────────────────
  heroImage: '/online-virtual-school.png',
  heroEyebrow: 'Online school for Bahrain',
  heroH1Suffix: 'Bahrain',
  heroSubhead: 'Live online Cambridge IGCSE and A Level, Pearson Edexcel and the American curriculum with AP, for Bahraini and expatriate families in Manama, Riffa and across the Kingdom, on Bahrain time with no time difference from our teachers.',
  heroValueProp: 'From USD 423/month for Primary (≈ BHD 159, Oct 2026 rate), payable termly. One-to-one tuition USD 15/hour (≈ BHD 5.6). January 2027 intake: Term 2 starts 5 January 2027.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Bahrain',

  // ── Cities ────────────────────────────────────────────────────
  citiesSectionTitle: 'Online school across Bahrain',
  citiesSectionBody: 'Pages for Manama and Riffa, covering local areas, the school run, British Council Bahrain exam entries, fees in BHD and questions about recognition and re-enrolment.',

  // ── Trust signals ({metric, value, sub}) ─────────────────────
  trustSignals: [
    { metric: 'Established', value: '2018', sub: 'Founded in Nairobi' },
    { metric: 'Countries', value: '40+', sub: 'Families learning with us' },
    { metric: 'Time zone', value: 'AST', sub: 'No difference from our teachers' },
    { metric: 'January 2027 intake', value: '5 Jan', sub: 'Term 2 starts 5 January 2027' },
  ],

  // ── Universities ──────────────────────────────────────────────
  universitiesInCountry: 'Universities in Bahrain, public and private, admit students with IGCSE and A Level or American high school qualifications. Each sets its own requirements, and some may ask for Ministry of Education equivalency, so check with the university early.',
  universityChannels: RECOG_BH + ' For universities abroad, IGCSE and A Level go through UCAS (UK) and are widely accepted in the US, Canada and elsewhere.',
  cambridgeCardDescription: 'Cambridge IGCSE and International AS and A Level taught live on Bahrain time, with private-candidate entries through British Council Bahrain.',
  britishCurriculumSuits: 'Families aiming at UK and international universities, and expatriate families who expect to move.',
  britishCurriculumDelivery: 'Live small-group lessons on Bahrain time, Sunday to Thursday, with recordings.',
  ibDiplomaSuits: 'Students at IB schools who want subject support.',
  ibDiplomaDelivery: 'Live IB subject lessons and exam preparation. Full IB Diploma registration needs an IB World School.',
  americanCurriculumSuits: 'US-linked families and students aiming at US or Canadian universities.',
  americanCurriculumDelivery: 'American curriculum with AP and SAT preparation. AP exams are taken at an authorised College Board test centre.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2018 to make international qualifications accessible through live online teaching. Bahraini and expatriate families learn alongside students from 40+ countries.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics.',

  // ── Comparison (no invented school fees) ──────────────────────
  competitorsIntro: 'Fees at Bahrain\'s international schools vary by school and year group, and many add registration, capital and exam fees. Ask each school for its current fee schedule and compare the full cost.',
  competitors: [
    { name: 'International schools in Bahrain', city: 'Manama · Saar · Riffa · Isa Town', curriculum: 'British, American or IB', feesUsd: 'Varies by school', feesAed: 'Varies by school: ask for the current schedule', rating: 'Physical campus', capacityNote: 'Places in some year groups are limited' },
    { name: 'Smartious (live online)', city: 'All of Bahrain', curriculum: 'Cambridge IGCSE & A Level · Pearson Edexcel · American AP', feesUsd: 'From 423/month (Primary), payable termly', feesAed: 'From ≈ BHD 159/month for Primary (Oct 2026 rate)', rating: 'Live online · recorded lessons', capacityNote: 'Fees vary by curriculum and level', isUs: true },
  ],

  // ── Legal framework ──────────────────────────────────────────
  legalFrameworkIntro: 'General information for families in Bahrain, not legal advice.',
  legalFramework: [
    { h: 'Compulsory education', p: LEGAL_BH },
    { h: 'Recognition and re-enrolment', p: RECOG_BH },
    { h: 'Exams as a private candidate', p: EXAMS_BH },
  ],

  // ── Why Smartious ────────────────────────────────────────────
  whySmartious: [
    { h: 'No time difference', p: TIME_BH },
    { h: 'British Council Bahrain exam entries', p: EXAMS_BH },
    { h: 'Honest about recognition', p: RECOG_BH },
    { h: 'Clear fees', p: FEES_BH },
    { h: 'Moves with your family', p: 'Enrolment continues when a contract moves you elsewhere in the Gulf or home.' },
  ],

  // ── FAQs ─────────────────────────────────────────────────────
  faqs: [
    { q: 'Is homeschooling legal in Bahrain?', a: LEGAL_BH },
    { q: 'How much does online school cost in Bahrain?', a: FEES_BH },
    { q: 'Is there a time difference?', a: TIME_BH },
    { q: 'Where do students in Bahrain sit IGCSE and A Level exams?', a: EXAMS_BH },
    { q: 'Will a Bahraini school or university recognise an online year?', a: RECOG_BH },
    { q: 'Is a virtual school in Bahrain the same as homeschooling?', a: 'Families use both words. With Smartious your child follows a full timetable with live teachers, marked work and reports, studying from home.' },
    { q: 'When is the next intake?', a: INTAKE },
    { q: 'How do we contact Smartious?', a: CONTACT },
    { q: 'How do live online classes work?', a: 'Students follow a weekly timetable of live lessons with qualified teachers, in small groups or one to one, and every lesson is recorded for catch-up. Families receive assessments and termly reports. Each student starts with a placement assessment, so we can place them at the right level.' },
  ],

  // ── CTA ──────────────────────────────────────────────────────
  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Submit the assessment request form. Admissions reviews every request and replies within three business days. January 2027 intake: Term 2 starts 5 January 2027.',
}
