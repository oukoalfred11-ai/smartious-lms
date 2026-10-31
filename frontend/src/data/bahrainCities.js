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
// - Smartious is a Cambridge International registered school and a
//   Pearson Edexcel approved centre (confirmed by the school, Oct 2026).
//   Students living in Bahrain sit written papers in Bahrain: private-
//   candidate entries through British Council Bahrain.
// - University of Bahrain: published policy (2026) recognises secondary
//   certificates on Ministry of Education attestation and lists
//   GCSE/IGCSE, AP and IB among accepted certificates; A Level grades of
//   B or above may earn 100-level course equivalency, with departmental
//   approval. The Higher Education Council requires authenticated
//   secondary certificates; the Ministry's Private Education Directorate
//   issues equivalency letters. Always "check the current rules".
// - We do not teach Kenya CBE/KCSE, CBSE or FBISE.
// - Recognition, equivalency and re-enrolment: always phrased as
//   "check with the school or the Ministry of Education".
// No invented schools' fees, statistics, testimonials or ratings.
// ═══════════════════════════════════════════════════════════════════

const FEES_BH = 'Online school is from USD 423/month for Primary (≈ BHD 159/month at about BHD 0.376/USD, Oct 2026 rate), payable termly. Secondary, IGCSE, A Level and IB fees vary by curriculum and level. One-to-one tuition is USD 15/hour (≈ BHD 5.6). Fees are non-refundable once the assessment is done, the timetable created and lessons started.'
const TIME_BH = 'Bahrain is on Arabia Standard Time (AST, UTC+3), the same time as our teachers in Nairobi. A 9:00 lesson is 9:00 in Manama, so live lessons fall in normal school hours, Sunday to Thursday, and every lesson is recorded.'
const EXAMS_BH = 'Cambridge IGCSE and A Level, and Pearson Edexcel International GCSE and A Level, are written in person at a centre. Students living in Bahrain sit their papers in Bahrain, with private-candidate entries made through British Council Bahrain. We plan the subjects and exam series with you and help with the registration. Entry deadlines fall months before each series, so check British Council Bahrain for current dates and fees.'
const STATUS_BH = 'Smartious is a Cambridge International registered school and a Pearson Edexcel approved centre, teaching to the current Cambridge and Pearson Edexcel syllabuses. Certificates are issued by Cambridge and Pearson, the same as for students at any other school.'
const UNI_BH = 'The University of Bahrain\'s published admission policy recognises secondary certificates on the Ministry of Education\'s attestation and lists GCSE/IGCSE, AP and IB among the certificates it accepts. Students starting university in Bahrain need their secondary certificates authenticated, as the Higher Education Council requires, and the Ministry\'s Private Education Directorate issues equivalency letters. Requirements change, so check the university and the Ministry before choosing subjects.'
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
      cambridge: 'Cambridge Primary to IGCSE and A Level, with papers sat in Bahrain through British Council Bahrain.',
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
      cambridge: 'Cambridge Primary to IGCSE and A Level, with papers sat in Bahrain through British Council Bahrain.',
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
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'saar-bh',
    name: 'Saar',
    county: 'Northern Governorate',
    region: 'Saar · Budaiya · Janabiya · Hamala · Barbar · Diraz',
    primaryKeyword: 'Online school and homeschooling in Saar',
    seoTitle: 'Online School in Saar, Bahrain | Live IGCSE & A Level',
    seoDesc: 'Online school for Saar, Budaiya and Janabiya: live Cambridge IGCSE and A Level on Bahrain time, from a Cambridge registered school. From USD 423/month.',
    heroTagline: 'Live Cambridge and Pearson Edexcel lessons for villa families in Saar, Budaiya, Janabiya and Hamala, without the Budaiya Highway school run.',
    intro: 'Saar is where many expatriate families in Bahrain choose to live: compounds and villas with gardens, close to several of the Kingdom\'s international schools, and a short drive to the causeway. It is also where families feel the school-run squeeze most, on the Budaiya Highway and the roads into Hamala and Janabiya at 7am. Smartious is a full online school on Bahrain time. Saar families use us for a complete British-curriculum timetable at home, for a child who arrives mid-year and cannot get a place straight away, or for one A Level subject a school timetable cannot fit.',
    altTexts: { hero: 'A student in a Saar villa taking a live online IGCSE lesson' },
    challenges: [
      'Morning traffic on the Budaiya Highway and the roads into Hamala, Janabiya and Saar itself.',
      'Waiting lists in some year groups at the international schools closest to Saar, particularly for mid-year arrivals.',
      'Siblings at different schools, which can mean two school runs in opposite directions.',
      'Teenagers who want an A Level combination, such as Further Mathematics with Computer Science, that their school cannot timetable.',
    ],
    familySituations: [
      'Compound families on corporate contracts who expect to move again within three years.',
      'Families who arrived over the summer and are still on a waiting list.',
      'Budaiya and Janabiya families with a Year 11 student retaking IGCSE subjects.',
      'Diraz and Barbar Bahraini families adding Cambridge IGCSE English or Mathematics alongside a local school.',
    ],
    nearbyAreas: ['Saar', 'Budaiya', 'Janabiya', 'Hamala', 'Barbar', 'Diraz', 'Al Markh', 'Bani Jamra', 'Jasra', 'Karzakan'],
    subjects: [
      'Cambridge Primary and Lower Secondary',
      'Cambridge IGCSE and International AS and A Level',
      'Pearson Edexcel International GCSE and A Level',
      'Cambridge IGCSE Arabic and Islamic Studies',
    ],
    whyChoose: [
      ['A Cambridge registered school', STATUS_BH],
      ['No Budaiya Highway run', 'Lessons start at home in Saar, on Bahrain time. ' + TIME_BH],
      ['Papers sat in Bahrain', EXAMS_BH],
      ['Clear fees', FEES_BH],
    ],
    growingReason: 'Saar has the Kingdom\'s densest concentration of expatriate villa families, and the most pressure on international-school places near home.',
    curricula: {
      cambridge: 'Cambridge Primary through IGCSE and A Level, with papers sat in Bahrain through British Council Bahrain.',
      ib: 'IB subject support for students at IB schools near Saar.',
      american: 'American curriculum with AP for US-linked families.',
    },
    homeschoolDetail: 'Full-time Saar students get a personal timetable, live small-group lessons, marked work, weekly tests and termly reports. ' + FEES_BH,
    homeTuitionDetail: 'One-to-one tuition is online at USD 15/hour (≈ BHD 5.6 at the Oct 2026 rate), useful for a single A Level subject.',
    onlineLearningDetail: TIME_BH,
    faqs: [
      { q: 'Can my child start online while we wait for a school place in Saar?', a: 'Yes. Many families join for a term or two while on a waiting list. We follow the Cambridge or Edexcel syllabus, so the student keeps pace and can move to a school when a place comes up. ' + RECOG_BH },
      { q: 'Is Smartious an accredited school?', a: STATUS_BH },
      { q: 'Where will my child sit IGCSE exams?', a: EXAMS_BH },
      { q: 'What does it cost?', a: FEES_BH },
      { q: 'When can we start, and who do we contact?', a: INTAKE + ' ' + CONTACT },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'juffair-bh',
    name: 'Juffair',
    county: 'Capital Governorate',
    region: 'Juffair · Um Al Hassam · Adliya · Hoora · Mahooz',
    primaryKeyword: 'Online school in Juffair',
    seoTitle: 'Online School in Juffair | American AP & British Curriculum',
    seoDesc: 'Online school for Juffair families: live American curriculum with AP, and Cambridge IGCSE and A Level, on Bahrain time. Continues when your posting ends.',
    heroTagline: 'Live American and British curriculum for Juffair, Um Al Hassam and Adliya families, built to continue when a posting ends or moves.',
    intro: 'Juffair is Bahrain\'s most transient neighbourhood. Apartment towers house families on naval, defence-contractor, banking and hospitality postings, many of them in Bahrain for one to three years and some with only weeks\' notice of a move. What these families need from a school is continuity: a curriculum their child can carry to the next posting, and a school that does not end when the lease does. Smartious teaches the American curriculum with AP, and Cambridge and Pearson Edexcel, live on Bahrain time, and enrolment moves with the family.',
    altTexts: { hero: 'A student in a Juffair apartment in a live online class' },
    challenges: [
      'Postings that start or end mid-year, with little notice.',
      'Families who want an American curriculum and AP courses, but cannot be sure of a place at a school near Juffair.',
      'Short leases and frequent moves between Juffair, Um Al Hassam and Amwaj.',
      'Keeping a teenager\'s AP or A Level courses on track through a move to another country.',
    ],
    familySituations: [
      'Families on naval or defence-contractor postings who expect to leave within two years.',
      'Banking and hospitality families in Juffair towers with a child in Grades 9 to 12.',
      'Families who left Bahrain at short notice and want their child\'s school to continue from wherever they are.',
      'Adliya and Um Al Hassam families who want one AP subject alongside a local school.',
    ],
    nearbyAreas: ['Juffair', 'Um Al Hassam', 'Adliya', 'Hoora', 'Mahooz', 'Gudaibiya', 'Bahrain Bay', 'Manama Souq'],
    subjects: [
      'American curriculum (Grades 1 to 12) with AP courses',
      'Cambridge IGCSE and International AS and A Level',
      'Pearson Edexcel International GCSE and A Level',
      'SAT preparation and US university applications',
    ],
    whyChoose: [
      ['Continues when you move', 'Your child\'s timetable, teachers and records stay the same when a posting moves the family to another country.'],
      ['American with AP, or British', 'The American curriculum with AP courses, or Cambridge and Pearson Edexcel. AP exams are taken at an authorised College Board test centre.'],
      ['Bahrain time', TIME_BH],
      ['Clear fees', FEES_BH],
    ],
    growingReason: 'Juffair families move more often than anyone else in Bahrain, and online school is the one school that moves with them.',
    curricula: {
      cambridge: 'Cambridge IGCSE and A Level, with papers sat in Bahrain through British Council Bahrain.',
      ib: 'IB subject support.',
      american: 'American curriculum with AP and SAT preparation. AP exams are taken at an authorised College Board test centre. Smartious is not a US-accredited school and does not issue a US high school diploma: for families who need one, we say so at assessment.',
    },
    homeschoolDetail: 'Full-time Juffair students get a personal timetable, live lessons, marked work, weekly tests and termly reports, and keep them through a move. ' + FEES_BH,
    homeTuitionDetail: 'One-to-one online tuition at USD 15/hour (≈ BHD 5.6), for example in one AP subject.',
    onlineLearningDetail: TIME_BH,
    faqs: [
      { q: 'What happens to my child\'s school if we are posted elsewhere?', a: 'Nothing changes: lessons are online, so your child keeps the same teachers, timetable and records. If the new country is in a different time zone, we review the timetable with you.' },
      { q: 'Do you issue an American high school diploma?', a: 'No. Smartious teaches the American curriculum with AP courses, but it is not a US-accredited school and does not issue a US diploma. AP exam scores are reported by the College Board and are widely used by US universities. If your child needs a US diploma, we will tell you at assessment.' },
      { q: 'Is Smartious an accredited school?', a: STATUS_BH },
      { q: 'What does it cost?', a: FEES_BH },
      { q: 'How do we start?', a: INTAKE + ' ' + CONTACT },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'amwaj-islands-bh',
    name: 'Amwaj Islands',
    county: 'Muharraq Governorate',
    region: 'Amwaj Islands · Al Dair · Samaheej · Galali · Busaiteen',
    primaryKeyword: 'Online school in Amwaj Islands',
    seoTitle: 'Online School in Amwaj Islands, Bahrain | Live IGCSE',
    seoDesc: 'Online school for Amwaj Islands families: live Cambridge IGCSE, A Level and AP on Bahrain time, no bridge traffic. From USD 423/month (≈ BHD 159).',
    heroTagline: 'Live online school for Amwaj Islands families, with no daily drive over to Manama, Saar or Riffa.',
    intro: 'Amwaj Islands is an island suburb at the northeastern tip of Muharraq, connected to the rest of Bahrain by a short causeway and a long morning drive. Most of the international schools Amwaj families choose are on the main island, in Saar, Hamala, Isa Town or Riffa, which can mean an hour or more in the car each day. Smartious teaches live online on Bahrain time, so Amwaj students start lessons at home and spend the saved time on sport, the sea and revision.',
    altTexts: { hero: 'A student on Amwaj Islands in a live online lesson' },
    challenges: [
      'The only road off the islands joins Muharraq traffic and the crossings to Manama at peak times.',
      'Most international schools Amwaj families choose are on the main island, far from home.',
      'Few local options for specialist A Level subjects within easy reach.',
      'Families who split time between Bahrain and another home country.',
    ],
    familySituations: [
      'Amwaj families with two children at schools in different parts of the main island.',
      'Families who moved to Amwaj for the waterfront and want to stop the long school run.',
      'Teenagers on Amwaj who train in a sport and need a flexible timetable.',
      'Busaiteen and Samaheej Bahraini families adding IGCSE subjects.',
    ],
    nearbyAreas: ['Amwaj Islands', 'Al Dair', 'Samaheej', 'Galali', 'Busaiteen', 'Muharraq', 'Diyar Al Muharraq', 'Hidd', 'Arad'],
    subjects: [
      'Cambridge IGCSE and International AS and A Level',
      'Pearson Edexcel International GCSE and A Level',
      'American curriculum with AP',
      'Cambridge Primary and Lower Secondary',
    ],
    whyChoose: [
      ['No drive off the island', 'Lessons start at home on Amwaj. ' + TIME_BH],
      ['A Cambridge registered school', STATUS_BH],
      ['Papers sat in Bahrain', EXAMS_BH],
      ['Clear fees', FEES_BH],
    ],
    growingReason: 'Amwaj families have the longest school run in Bahrain, and an online timetable removes it.',
    curricula: {
      cambridge: 'Cambridge Primary through IGCSE and A Level, with papers sat in Bahrain through British Council Bahrain.',
      ib: 'IB subject support.',
      american: 'American curriculum with AP.',
    },
    homeschoolDetail: 'Full-time Amwaj students get a personal timetable, live lessons, marked work and termly reports. ' + FEES_BH,
    homeTuitionDetail: 'One-to-one online tuition at USD 15/hour (≈ BHD 5.6).',
    onlineLearningDetail: TIME_BH + ' Fibre and 5G on Amwaj are well suited to live classes.',
    faqs: [
      { q: 'Can a student training in a sport fit online school around it?', a: 'Often, yes. Lessons follow a timetable, but we plan it with you at enrolment and can place lessons around regular training where classes allow.' },
      { q: 'Where would my child sit exams?', a: EXAMS_BH },
      { q: 'Is Smartious an accredited school?', a: STATUS_BH },
      { q: 'What does it cost?', a: FEES_BH },
      { q: 'How do we start?', a: INTAKE + ' ' + CONTACT },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'muharraq-bh',
    name: 'Muharraq',
    county: 'Muharraq Governorate',
    region: 'Muharraq · Hidd · Diyar Al Muharraq · Arad · Busaiteen · Galali',
    primaryKeyword: 'Online school in Muharraq',
    seoTitle: 'Online School in Muharraq | Cambridge IGCSE & A Level',
    seoDesc: 'Online Cambridge school for Muharraq, Hidd and Diyar Al Muharraq: live IGCSE and A Level, with Arabic and Islamic Studies, on Bahrain time.',
    heroTagline: 'Cambridge IGCSE and A Level for Bahraini families in Muharraq, Hidd, Arad and Diyar Al Muharraq, alongside Arabic and Islamic Studies.',
    intro: 'Muharraq, Bahrain\'s old capital and second city, is home to many Bahraini families who want an English-medium international qualification for their children without losing Arabic and Islamic Studies. New communities in Diyar Al Muharraq and Hidd have added young families who work in Manama or at the airport. Smartious teaches Cambridge and Pearson Edexcel live online on Bahrain time, including Cambridge IGCSE Arabic and Islamic Studies, as a full online school or alongside a local school.',
    altTexts: { hero: 'A Bahraini student in Muharraq in a live online Cambridge lesson' },
    challenges: [
      'Families who want IGCSE and A Level for university abroad, but also strong Arabic and Islamic Studies.',
      'Bridge traffic between Muharraq and Manama at school times.',
      'New Diyar Al Muharraq families whose preferred schools are on the main island.',
      'Students in national schools who want to add Cambridge IGCSE English or Mathematics.',
    ],
    familySituations: [
      'Bahraini families planning for universities in the UK, Canada or the Gulf.',
      'Diyar Al Muharraq families with young children who want Cambridge Primary at home.',
      'Hidd and Arad families with a student who needs one IGCSE or A Level subject.',
      'Families who want to understand Ministry of Education equivalency before choosing subjects.',
    ],
    nearbyAreas: ['Muharraq', 'Hidd', 'Diyar Al Muharraq', 'Arad', 'Busaiteen', 'Galali', 'Samaheej', 'Al Dair', 'Amwaj Islands'],
    subjects: [
      'Cambridge IGCSE Arabic (First Language) and Islamic Studies',
      'Cambridge IGCSE and International AS and A Level, all major subjects',
      'Pearson Edexcel International GCSE and A Level',
      'Cambridge Primary and Lower Secondary',
      'IELTS and university application support',
    ],
    whyChoose: [
      ['Arabic and Islamic Studies included', 'Cambridge IGCSE Arabic and Islamic Studies sit alongside English, Mathematics and the sciences in one timetable.'],
      ['A Cambridge registered school', STATUS_BH],
      ['Clear on university entry', UNI_BH],
      ['Clear fees', FEES_BH],
    ],
    growingReason: 'Muharraq families increasingly want international qualifications for universities abroad while keeping Arabic and Islamic Studies.',
    curricula: {
      cambridge: 'Cambridge Primary through IGCSE and A Level, including IGCSE Arabic and Islamic Studies, with papers sat in Bahrain through British Council Bahrain.',
      ib: 'IB subject support.',
      american: 'American curriculum with AP.',
    },
    homeschoolDetail: 'Full-time Muharraq students get a personal timetable, live lessons, marked work and termly reports. ' + FEES_BH,
    homeTuitionDetail: 'One-to-one online tuition at USD 15/hour (≈ BHD 5.6), for example IGCSE English or Mathematics alongside a national school.',
    onlineLearningDetail: TIME_BH,
    faqs: [
      { q: 'Can my child study Arabic and Islamic Studies with you?', a: 'Yes: Cambridge IGCSE Arabic and Islamic Studies are part of our Cambridge timetable.' },
      { q: 'Will Bahraini universities accept online IGCSE and A Level?', a: UNI_BH },
      { q: 'Is homeschooling legal in Bahrain for Bahraini citizens?', a: LEGAL_BH },
      { q: 'What does it cost?', a: FEES_BH },
      { q: 'How do we start?', a: INTAKE + ' ' + CONTACT },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'isa-town-bh',
    name: 'Isa Town',
    county: 'Southern Governorate',
    region: 'Isa Town · Sanad · Tubli · Jidhafs · Salmabad · A\'ali',
    primaryKeyword: 'Online school in Isa Town',
    seoTitle: 'Online School in Isa Town, Bahrain | IGCSE & A Level',
    seoDesc: 'Online school for Isa Town, Sanad, Tubli and Salmabad families: live Cambridge IGCSE and A Level, and Pearson Edexcel, on Bahrain time. From USD 423/month.',
    heroTagline: 'Live Cambridge and Pearson Edexcel lessons for families in Isa Town, Sanad, Tubli, Jidhafs and Salmabad.',
    intro: 'Isa Town sits in the middle of Bahrain, between Manama and Riffa, with several of the Kingdom\'s private and international schools nearby and a large community of Bahraini and South Asian families. Many families here already know the Cambridge route from school; what they look for from Smartious is a specialist teacher for one IGCSE or A Level subject, a structured year for a student retaking examinations, or a full online timetable for a child whose needs a large school cannot meet.',
    altTexts: { hero: 'A student in Isa Town in a live online A Level lesson' },
    challenges: [
      'Large classes in some schools, and students who need closer attention in one subject.',
      'Students retaking IGCSE or A Level subjects after a disappointing series.',
      'Families moving from CBSE or another national curriculum to Cambridge IGCSE.',
      'Traffic on the roads between Isa Town, Manama and Riffa at school times.',
    ],
    familySituations: [
      'Students retaking two or three IGCSE subjects in the October/November series.',
      'A Level students who need one-to-one help in Physics, Chemistry or Further Mathematics.',
      'South Asian families switching from CBSE to Cambridge IGCSE before Grade 9.',
      'Sanad and Tubli Bahraini families who want IGCSE subjects alongside a national school.',
    ],
    nearbyAreas: ['Isa Town', 'Sanad', 'Tubli', 'Jidhafs', 'Salmabad', 'A\'ali', 'Sitra', 'Nuwaidrat', 'Riffa'],
    subjects: [
      'Cambridge IGCSE and International AS and A Level',
      'Pearson Edexcel International GCSE and A Level',
      'IGCSE and A Level retake programmes',
      'Cambridge Lower Secondary for students moving from CBSE',
    ],
    whyChoose: [
      ['Retakes, planned properly', 'We plan the retake series, subjects and papers with you, and teach to the parts of the syllabus the last result showed were weak.'],
      ['A Cambridge registered school', STATUS_BH],
      ['Papers sat in Bahrain', EXAMS_BH],
      ['Clear fees', FEES_BH],
    ],
    growingReason: 'Isa Town families use specialist online teaching to raise results in a single subject, and to move between curricula smoothly.',
    curricula: {
      cambridge: 'Cambridge Lower Secondary through IGCSE and A Level, with papers sat in Bahrain through British Council Bahrain.',
      ib: 'IB subject support.',
      american: 'American curriculum with AP.',
    },
    homeschoolDetail: 'Full-time Isa Town students get a personal timetable, live lessons, weekly tests and termly reports. ' + FEES_BH,
    homeTuitionDetail: 'One-to-one online tuition at USD 15/hour (≈ BHD 5.6), the usual route for a single retake subject.',
    onlineLearningDetail: TIME_BH,
    faqs: [
      { q: 'Can my child retake IGCSE subjects with you?', a: 'Yes. We plan the series and papers with you and teach towards them. ' + EXAMS_BH },
      { q: 'We follow CBSE now. Can our child switch to Cambridge?', a: 'Yes. We do not teach CBSE, but many students move from CBSE to Cambridge Lower Secondary or IGCSE. The placement assessment shows where to start, and we plan any gaps, often in English and in how Cambridge papers ask questions.' },
      { q: 'Is Smartious an accredited school?', a: STATUS_BH },
      { q: 'What does it cost?', a: FEES_BH },
      { q: 'How do we start?', a: INTAKE + ' ' + CONTACT },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'hamad-town-bh',
    name: 'Hamad Town',
    county: 'Northern Governorate',
    region: 'Hamad Town · Buri · Dar Kulaib · Malkiya · Karzakan · Sadad',
    primaryKeyword: 'Online school in Hamad Town',
    seoTitle: 'Online School in Hamad Town | Cambridge IGCSE Online',
    seoDesc: 'Online Cambridge school for Hamad Town and western Bahrain: live IGCSE, A Level and English on Bahrain time, no drive to Manama. From USD 423/month.',
    heroTagline: 'Cambridge IGCSE, A Level and English for families in Hamad Town, Buri, Dar Kulaib, Malkiya and Karzakan.',
    intro: 'Hamad Town and the villages of western Bahrain are a long way, in rush-hour terms, from most of the Kingdom\'s English-medium international schools. Many families here are Bahraini, with children in national schools who want to add Cambridge IGCSE subjects, strong English for university abroad, or a full Cambridge timetable at home. Smartious teaches live on Bahrain time, so a Hamad Town student gets specialist teaching without the drive to Manama, Saar or Isa Town.',
    altTexts: { hero: 'A student in Hamad Town learning in a live online Cambridge class' },
    challenges: [
      'Few English-medium international schools close to the western villages.',
      'Long drives to Manama, Saar or Isa Town at school times.',
      'Students in national schools who want an international qualification for university abroad.',
      'Strong students who need English to the level UK and Canadian universities ask for.',
    ],
    familySituations: [
      'Bahraini families adding Cambridge IGCSE English and Mathematics to a national school.',
      'Families who want a full Cambridge timetable at home for a younger child.',
      'Students preparing for IELTS and university applications abroad.',
      'Dar Kulaib and Malkiya families with a student who needs one A Level subject.',
    ],
    nearbyAreas: ['Hamad Town', 'Buri', 'Dar Kulaib', 'Malkiya', 'Karzakan', 'Sadad', 'Shahrakan', 'Dumistan', 'Zallaq'],
    subjects: [
      'Cambridge IGCSE English (First or Second Language) and Mathematics',
      'Cambridge IGCSE and International AS and A Level sciences',
      'Cambridge IGCSE Arabic and Islamic Studies',
      'IELTS preparation and university applications',
    ],
    whyChoose: [
      ['International teaching without the drive', 'Lessons start at home in Hamad Town. ' + TIME_BH],
      ['A Cambridge registered school', STATUS_BH],
      ['Clear on university entry', UNI_BH],
      ['Clear fees', FEES_BH],
    ],
    growingReason: 'Families in western Bahrain want international qualifications and strong English without a long daily drive.',
    curricula: {
      cambridge: 'Cambridge Primary through IGCSE and A Level, with papers sat in Bahrain through British Council Bahrain.',
      ib: 'IB subject support.',
      american: 'American curriculum with AP.',
    },
    homeschoolDetail: 'Full-time Hamad Town students get a personal timetable, live lessons, marked work and termly reports. ' + FEES_BH,
    homeTuitionDetail: 'One-to-one online tuition at USD 15/hour (≈ BHD 5.6), for example IGCSE English alongside a national school.',
    onlineLearningDetail: TIME_BH,
    faqs: [
      { q: 'Can my child take IGCSE subjects while staying in a national school?', a: 'Yes. Many students take one or two Cambridge IGCSE subjects, often English and Mathematics, with us after school, and sit them in Bahrain. ' + EXAMS_BH },
      { q: 'Will Bahraini universities accept IGCSE and A Level?', a: UNI_BH },
      { q: 'Is Smartious an accredited school?', a: STATUS_BH },
      { q: 'What does it cost?', a: FEES_BH },
      { q: 'How do we start?', a: INTAKE + ' ' + CONTACT },
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
  seoTitle: 'Accredited Online School in Bahrain | Cambridge & Edexcel',
  seoDesc: 'Cambridge registered, Pearson Edexcel approved online school for Bahrain: live IGCSE, A Level and AP on Bahrain time. From USD 423/month (≈ BHD 159).',
  h1: 'Accredited online school and homeschool in Bahrain',

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
  heroEyebrow: 'Cambridge registered · Pearson Edexcel approved',
  heroH1Suffix: 'Bahrain',
  heroSubhead: 'Live online Cambridge IGCSE and A Level, Pearson Edexcel and the American curriculum with AP, from a Cambridge International registered school and Pearson Edexcel approved centre, for Bahraini and expatriate families in Manama, Saar, Juffair, Riffa, Muharraq, Amwaj and across the Kingdom, on Bahrain time with no time difference from our teachers.',
  heroValueProp: 'From USD 423/month for Primary (≈ BHD 159, Oct 2026 rate), payable termly. One-to-one tuition USD 15/hour (≈ BHD 5.6). January 2027 intake: Term 2 starts 5 January 2027.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Bahrain',

  // ── Cities ────────────────────────────────────────────────────
  citiesSectionTitle: 'Online school across Bahrain',
  citiesSectionBody: 'Pages for Manama, Saar, Juffair, Amwaj Islands, Muharraq, Isa Town, Riffa and Hamad Town, covering local areas, the school run, exams in Bahrain, fees in BHD, university entry and re-enrolment.',

  // ── Trust signals ({metric, value, sub}) ─────────────────────
  trustSignals: [
    { metric: 'Established', value: '2018', sub: 'Founded in Nairobi' },
    { metric: 'Countries', value: '40+', sub: 'Families learning with us' },
    { metric: 'Time zone', value: 'AST', sub: 'No difference from our teachers' },
    { metric: 'January 2027 intake', value: '5 Jan', sub: 'Term 2 starts 5 January 2027' },
  ],

  // ── Universities ──────────────────────────────────────────────
  universitiesInCountry: 'Universities in Bahrain, public and private, admit students with IGCSE and A Level or American qualifications. ' + UNI_BH,
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
    { name: 'Self-paced online schools', city: 'Online', curriculum: 'Often American, recorded lessons', feesUsd: 'Varies', feesAed: 'Varies: ask for the full cost', rating: 'Mostly self-study', capacityNote: 'Check how much is taught live, and by whom' },
    { name: 'Online tutoring services', city: 'Online', curriculum: 'Subject tutoring', feesUsd: 'Per hour', feesAed: 'Varies', rating: 'Tutoring, not a school', capacityNote: 'No timetable, reports or exam planning' },
    { name: 'Smartious (live online)', city: 'All of Bahrain', curriculum: 'Cambridge IGCSE & A Level · Pearson Edexcel · American AP', feesUsd: 'From 423/month (Primary), payable termly', feesAed: 'From ≈ BHD 159/month for Primary (Oct 2026 rate)', rating: 'Live online · recorded lessons', capacityNote: 'Fees vary by curriculum and level', isUs: true },
  ],

  // ── Legal framework ──────────────────────────────────────────
  legalFrameworkIntro: 'General information for families in Bahrain, not legal advice.',
  legalFramework: [
    { h: 'Compulsory education', p: LEGAL_BH },
    { h: 'Recognition and re-enrolment', p: RECOG_BH },
    { h: 'Exams in Bahrain', p: EXAMS_BH },
    { h: 'University in Bahrain', p: UNI_BH },
  ],

  // ── Why Smartious ────────────────────────────────────────────
  whySmartious: [
    { h: 'Cambridge registered, Pearson Edexcel approved', p: STATUS_BH },
    { h: 'No time difference', p: TIME_BH },
    { h: 'British Council Bahrain exam entries', p: EXAMS_BH },
    { h: 'Honest about recognition', p: RECOG_BH },
    { h: 'Clear fees', p: FEES_BH },
    { h: 'Moves with your family', p: 'Enrolment continues when a contract moves you elsewhere in the Gulf or home.' },
  ],

  // ── FAQs ─────────────────────────────────────────────────────
  faqs: [
    { q: 'Is Smartious an accredited online school?', a: STATUS_BH + ' Smartious is not licensed by Bahrain\'s Ministry of Education as a Bahraini school; families use it as an international online school.' },
    { q: 'Is homeschooling legal in Bahrain?', a: LEGAL_BH },
    { q: 'Can my child go to the University of Bahrain with online IGCSE and A Level?', a: UNI_BH },
    { q: 'Do you teach CBSE or FBISE?', a: 'No. We teach Cambridge, Pearson Edexcel and the American curriculum with AP. Many Indian and Pakistani families in Bahrain move their children from CBSE or FBISE to Cambridge IGCSE with us; the placement assessment shows where to start.' },
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
