// ═══════════════════════════════════════════════════════════════════
// NIGERIA — Smartious city-level + country-level data
// Same export shape as kuwaitCities.js: NIGERIA_CITIES / NIGERIA_COUNTRY.
// Registered in lazyData.js; /homeschool-<slug> routing is picked up by
// scripts/build-data-index.js automatically.
//
// Facts used here (keep them in step with the rest of the site):
// - Nigeria is on West Africa Time (WAT, UTC+1), two hours behind
//   Nairobi (EAT, UTC+3). A 10:00 Nairobi lesson is 08:00 in Lagos.
// - Fees: from USD 423/month for Primary, payable termly; fees vary by
//   curriculum and level. One-to-one tuition USD 15/hour. Non-refundable
//   once the assessment is done, the timetable created and lessons
//   started. Naira figures are approximate at about ₦1,550/USD
//   (Oct 2026 rate) and the naira fluctuates: USD 423 ≈ ₦656,000,
//   USD 15 ≈ ₦23,000.
// - Payments go through Paystack (the site's payment provider).
// - IGCSE / A Level: private-candidate entries through British Council
//   Nigeria (Lagos, Abuja, Port Harcourt). WAEC, NECO and JAMB are
//   Nigerian bodies; university policies on IGCSE / A Level vary.
// - Legal: the Universal Basic Education Act requires basic education;
//   homeschooling is practised and debated. Never state more than that.
// No invented schools' fees, statistics, testimonials or ratings.
// ═══════════════════════════════════════════════════════════════════

const FEES_NG = 'Online school is from USD 423/month for Primary (≈ ₦656,000/month at about ₦1,550/USD, Oct 2026 rate; the naira fluctuates), payable termly. Secondary, IGCSE, A Level and IB fees vary by curriculum and level. One-to-one tuition is USD 15/hour (≈ ₦23,000). Fees are non-refundable once the assessment is done, the timetable created and lessons started.'
const TIME_NG = 'Nigeria is on West Africa Time (WAT, UTC+1), two hours behind our teachers in Nairobi. A lesson at 10:00 in Nairobi is at 08:00 in Lagos, so most live lessons fall in the Nigerian morning and early afternoon, and every lesson is recorded.'
const EXAMS_NG = 'Cambridge IGCSE and A Level, and Pearson Edexcel International GCSE and A Level, are taken as a private candidate. In Nigeria, private-candidate entries are made through British Council Nigeria, which runs exams in Lagos, Abuja and Port Harcourt. Entry deadlines fall months before each series, so check the British Council Nigeria website for the current dates, venues and fees.'
const DUAL_NG = 'Many Nigerian families want both routes: IGCSE or A Level for universities abroad, and WAEC (WASSCE for private candidates) or NECO for Nigerian universities. JAMB runs the UTME and Direct Entry. Some Nigerian universities, including UNILAG, consider IGCSE and A Level results, but requirements differ by university and course and may need equivalency, so check with the university and JAMB before relying on one route.'
const PAY_NG = 'Payments are made through Paystack, which Nigerian families commonly use with naira cards and bank transfer. Admissions confirms the invoice currency and amount with you before you pay.'
const LEGAL_NG = 'The Universal Basic Education Act requires that every child receives basic education. Homeschooling is practised in Nigeria, and how it should be recognised has been debated, including in the National Assembly. The law does not set out a clear registration process, so families should seek advice on their own situation. We provide timetables, reports and exam entries that families can show if asked about their child\'s education.'
const INTAKE = 'The January 2027 intake is open: Term 2 starts on 5 January 2027. Students can also join during the year after an assessment.'
const CONTACT = 'Admissions: +254 745 021 212 (call or WhatsApp). Academic office: +254 182 071 920. Email: hello@smartioushomeschool.com.'

export const NIGERIA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'lagos-ng',
    name: 'Lagos',
    county: 'Lagos State',
    region: 'Lekki · Victoria Island · Ikoyi · Ikeja · Magodo · Ajah',
    primaryKeyword: 'Online school and homeschooling in Lagos',
    seoTitle: 'Online School in Lagos | Live IGCSE & British Curriculum',
    seoDesc: 'Online school and homeschool in Lagos: live IGCSE, A-Level and American classes for Lekki, Ikoyi and Ikeja families. From USD 423/month. January 2027 intake.',
    heroTagline: 'Live online British and American curriculum for families in Lekki, Victoria Island, Ikoyi, Ikeja, Magodo and Ajah. No 5 am school run.',
    intro: 'In Lagos, the school run often decides the school. A Lekki or Ajah family with a school on the Island or the Mainland can leave home before dawn, cross the Lekki toll corridor or the Third Mainland Bridge, and still arrive late. Smartious teaches Lagos children live online, in British and American curricula, with lessons in the West African morning and recordings of every class. Families use us as a full online school, as a way to keep IGCSE and WAEC options open, or for one-to-one tuition alongside a Lagos school.',
    altTexts: { hero: 'Student in Lagos in a live online Smartious lesson' },
    challenges: [
      'Traffic. The Lekki-Epe Expressway, Ozumba Mbadiwe, the Third Mainland Bridge and Ikorodu Road can turn a short distance into a long school run, and Ajah and Sangotedo families often leave earliest.',
      'Fees at leading British and American curriculum schools on the Island and in Lekki are high, paid in naira or dollars, and many add levies, transport and exam fees.',
      'Exchange-rate movements make school budgets hard to plan, and many families now compare dollar-priced and naira-priced options.',
      'Parents commonly mention safety and the strain of long journeys as reasons for keeping younger children closer to home.',
      'Families want both an international route (IGCSE, A Level) and a Nigerian route (WAEC, NECO, JAMB) and need help planning both.',
    ],
    familySituations: [
      'Lekki Phase 1 and Chevron-axis families with children at Island schools.',
      'Ajah, Sangotedo and Abraham Adesanya families facing the longest morning commute.',
      'Ikoyi and Victoria Island families on corporate or diplomatic postings who expect to move again.',
      'Ikeja GRA and Magodo families on the Mainland who want a British curriculum without crossing to the Island.',
      'Families planning IGCSE plus WAEC so that both foreign and Nigerian universities stay open.',
      'Families with a child who needs a single A Level subject, such as Further Mathematics, that their school does not timetable.',
    ],
    nearbyAreas: ['Lekki Phase 1', 'Lekki', 'Chevron', 'Ajah', 'Sangotedo', 'Victoria Island', 'Ikoyi', 'Banana Island', 'Oniru', 'Ikeja GRA', 'Magodo', 'Gbagada', 'Surulere', 'Yaba', 'Maryland', 'Ogudu'],
    subjects: [
      'Cambridge IGCSE Mathematics, Additional Mathematics, English Language and Literature, Sciences, Economics, Business, Computer Science',
      'Cambridge International AS and A Level Mathematics, Further Mathematics, Physics, Chemistry, Biology, Economics, Accounting',
      'Pearson Edexcel International GCSE and A Level',
      'American curriculum with AP courses',
      'WAEC and NECO preparation in Mathematics, English and the sciences',
      'SAT, IELTS and university application support',
    ],
    whyChoose: [
      ['No dawn school run', 'Lessons start at home in Lekki, Ajah or Magodo, without the Third Mainland Bridge or the Lekki corridor.'],
      ['Lessons in the Lagos morning', TIME_NG],
      ['Both routes kept open', DUAL_NG],
      ['Exam entries planned with you', EXAMS_NG],
      ['Clear fees in USD, paid via Paystack', 'From USD 423/month for Primary (≈ ₦656,000 at about ₦1,550/USD, Oct 2026 rate), payable termly. One-to-one tuition is USD 15/hour (≈ ₦23,000). ' + PAY_NG],
    ],
    growingReason: 'Lagos parents are looking at online school because of the time and cost of the school run, exchange-rate pressure on school fees, and the wish to keep both international and Nigerian university routes open.',
    curricula: {
      cambridge: 'Cambridge Primary to IGCSE and A Level, the most common international route in Lagos. Entries are made as a private candidate through British Council Nigeria in Lagos.',
      cbc: 'Kenya CBE (CBC) is available for families with East African links.',
      ib: 'IB subject support for students at IB schools in Lagos.',
      american: 'American curriculum with AP for families aiming at US and Canadian universities. AP exams are taken at an authorised College Board test centre.',
    },
    homeschoolDetail: 'Full-time Lagos students get a personal timetable, live small-group lessons, recordings, marked work and termly reports on the Smartious LMS. ' + FEES_NG,
    homeTuitionDetail: 'Tuition for Lagos families is online, one-to-one, at USD 15/hour (≈ ₦23,000 at the Oct 2026 rate). We do not have a centre in Nigeria.',
    onlineLearningDetail: TIME_NG + ' Fibre and 4G in Lekki, Ikoyi, VI and Ikeja are fine for live classes. A backup power source, such as an inverter, helps.',
    faqs: [
      { q: 'What does online school cost for a Lagos family?', a: FEES_NG },
      { q: 'What time are live lessons in Lagos?', a: TIME_NG },
      { q: 'Where does my child sit IGCSE or A Level exams in Lagos?', a: EXAMS_NG },
      { q: 'Can my child do IGCSE and WAEC?', a: DUAL_NG },
      { q: 'Is homeschooling legal in Nigeria?', a: LEGAL_NG },
      { q: 'How do we pay?', a: PAY_NG },
      { q: 'When can we start, and who do we contact?', a: INTAKE + ' ' + CONTACT },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'abuja-ng',
    name: 'Abuja',
    county: 'Federal Capital Territory',
    region: 'Maitama · Asokoro · Wuse · Garki · Gwarinpa',
    primaryKeyword: 'Online school and homeschooling in Abuja',
    seoTitle: 'Online School in Abuja | Live IGCSE & American Classes',
    seoDesc: 'Online school and homeschool in Abuja: live IGCSE, A-Level and American classes for Maitama, Asokoro and Gwarinpa. From USD 423/month. Jan 2027 intake.',
    heroTagline: 'Live online British and American curriculum for families in Maitama, Asokoro, Wuse, Garki, Gwarinpa, Jabi and Life Camp.',
    intro: 'Abuja has many diplomatic, government, NGO and corporate families, and many of them move every few years. Smartious gives Abuja children a live British or American curriculum that does not change when the family\'s posting does. Lessons run in the West African morning and are recorded. Families in Maitama, Asokoro, Wuse, Garki and Gwarinpa use us as a full online school, to keep IGCSE and WAEC options open, or for one-to-one tuition.',
    altTexts: { hero: 'Student in Abuja in a live online Smartious lesson' },
    challenges: [
      'Traffic on the Kubwa Expressway, the Nyanya-Mararaba corridor and the roads into the city centre makes the Gwarinpa and outer-suburb school run long.',
      'Diplomatic and international-organisation families move on short notice and need curriculum continuity.',
      'Fees at international schools in Maitama, Asokoro and the city centre are high, and places in some year groups are limited.',
      'Parents commonly mention safety and long journeys as reasons to keep schooling closer to home.',
      'Families want to combine an international route with WAEC or NECO for Nigerian universities.',
    ],
    familySituations: [
      'Maitama and Asokoro diplomatic families on two- to four-year postings.',
      'Wuse 2 and Garki families working in government or international organisations.',
      'Gwarinpa, Jabi, Life Camp and Katampe families avoiding the expressway school run.',
      'Families combining IGCSE with WAEC or NECO for Nigerian university entry.',
      'Families with a child who needs A Level sciences that their school does not offer.',
    ],
    nearbyAreas: ['Maitama', 'Asokoro', 'Wuse', 'Wuse 2', 'Garki', 'Gwarinpa', 'Jabi', 'Utako', 'Life Camp', 'Katampe', 'Guzape', 'Apo', 'Lokogoma', 'Kubwa'],
    subjects: [
      'Cambridge IGCSE and International AS and A Level, all major subjects',
      'Pearson Edexcel International GCSE and A Level',
      'American curriculum with AP courses',
      'WAEC and NECO preparation',
      'French, as many diplomatic families need it',
      'SAT, IELTS and university application support',
    ],
    whyChoose: [
      ['Moves with your posting', 'Online enrolment continues when a diplomatic or NGO posting moves the family to another country.'],
      ['Lessons in the Abuja morning', TIME_NG],
      ['Exam entries in Abuja', EXAMS_NG],
      ['Both routes kept open', DUAL_NG],
      ['Clear fees', 'From USD 423/month for Primary (≈ ₦656,000 at about ₦1,550/USD, Oct 2026 rate), payable termly. One-to-one tuition is USD 15/hour. ' + PAY_NG],
    ],
    growingReason: 'Abuja\'s internationally mobile families need schooling that moves with them, and many Nigerian families want to keep both international and national university routes open.',
    curricula: {
      cambridge: 'Cambridge Primary to IGCSE and A Level. Entries are made as a private candidate through British Council Nigeria in Abuja.',
      cbc: 'Kenya CBE (CBC) for families with East African links.',
      ib: 'IB subject support for students at IB schools.',
      american: 'American curriculum with AP, often chosen by diplomatic and US-linked families.',
    },
    homeschoolDetail: 'Full-time Abuja students get a personal timetable, live small-group lessons, recordings, marked work and termly reports. ' + FEES_NG,
    homeTuitionDetail: 'Tuition is online, one-to-one, at USD 15/hour (≈ ₦23,000 at the Oct 2026 rate).',
    onlineLearningDetail: TIME_NG + ' Fibre and 4G in Maitama, Asokoro, Wuse and Gwarinpa are fine for live classes. A backup power source helps.',
    faqs: [
      { q: 'What does online school cost in Abuja?', a: FEES_NG },
      { q: 'We are on a diplomatic posting. What happens when we move?', a: 'Your child stays enrolled and keeps the same curriculum and teachers. Lessons are recorded, so a different time zone does not mean missed work.' },
      { q: 'Where are IGCSE exams sat in Abuja?', a: EXAMS_NG },
      { q: 'Can my child do IGCSE and also WAEC or NECO?', a: DUAL_NG },
      { q: 'Is homeschooling legal in Nigeria?', a: LEGAL_NG },
      { q: 'How do we pay, and when can we start?', a: PAY_NG + ' ' + INTAKE },
      { q: 'How do we contact Smartious?', a: CONTACT },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'port-harcourt-ng',
    name: 'Port Harcourt',
    county: 'Rivers State',
    region: 'Old GRA · New GRA · Trans-Amadi · Peter Odili Road · Rumuola',
    primaryKeyword: 'Online school and homeschooling in Port Harcourt',
    seoTitle: 'Online School Port Harcourt | Live IGCSE Classes',
    seoDesc: 'Online school and homeschool in Port Harcourt: live IGCSE, A-Level and American classes for GRA and Trans-Amadi families. From USD 423/month. Jan 2027 intake.',
    heroTagline: 'Live online British and American curriculum for families in Old and New GRA, Trans-Amadi, Peter Odili Road and Rumuola.',
    intro: 'Port Harcourt\'s oil and gas families often work rotations and expect transfers. Many look for a school that follows the child, not the posting. Smartious teaches Port Harcourt students live online, in British and American curricula, in the West African morning, with recordings of every lesson. Families in the GRAs, Trans-Amadi and along Peter Odili Road use us as a full online school or for one-to-one tuition.',
    altTexts: { hero: 'Student in Port Harcourt in a live online Smartious lesson' },
    challenges: [
      'Traffic at Rumuola, Garrison and on the Aba Road and Peter Odili Road makes the school run long.',
      'Oil and gas rotations and transfers between Port Harcourt, Lagos and other countries interrupt schooling.',
      'There are fewer British-curriculum options than in Lagos or Abuja.',
      'Parents commonly mention safety and long journeys as reasons to keep schooling closer to home.',
      'Families want IGCSE and A Level plus WAEC or NECO as a safeguard.',
    ],
    familySituations: [
      'Old GRA and New GRA families on oil and gas rotations.',
      'Trans-Amadi families who expect a transfer to Lagos or abroad.',
      'Peter Odili Road and Woji families avoiding Aba Road traffic.',
      'Families planning IGCSE plus WAEC.',
    ],
    nearbyAreas: ['Old GRA', 'New GRA', 'Trans-Amadi', 'Peter Odili Road', 'Woji', 'Rumuola', 'Rumuibekwe', 'D-Line', 'Elelenwo', 'Eliozu', 'Ada George'],
    subjects: [
      'Cambridge IGCSE and International AS and A Level, all major subjects',
      'Pearson Edexcel International GCSE and A Level',
      'American curriculum with AP',
      'WAEC and NECO preparation',
      'Engineering-track A Level Mathematics, Further Mathematics, Physics and Chemistry',
    ],
    whyChoose: [
      ['Continuity through transfers', 'Online enrolment continues when an oil and gas posting moves the family.'],
      ['Lessons in the Port Harcourt morning', TIME_NG],
      ['Exam entries in Port Harcourt', EXAMS_NG],
      ['Both routes kept open', DUAL_NG],
      ['Clear fees', 'From USD 423/month for Primary (≈ ₦656,000 at about ₦1,550/USD, Oct 2026 rate), payable termly. One-to-one tuition is USD 15/hour. ' + PAY_NG],
    ],
    growingReason: 'Port Harcourt families in the energy sector need schooling that survives rotations and transfers, and many want strong A Level sciences for engineering.',
    curricula: {
      cambridge: 'Cambridge Primary to IGCSE and A Level, entered as a private candidate through British Council Nigeria. Check the Port Harcourt venue for your series.',
      cbc: 'Kenya CBE (CBC) for families with East African links.',
      ib: 'IB subject support.',
      american: 'American curriculum with AP for families linked to US and Canadian employers or universities.',
    },
    homeschoolDetail: 'Full-time Port Harcourt students get a personal timetable, live small-group lessons, recordings, marked work and termly reports. ' + FEES_NG,
    homeTuitionDetail: 'Tuition is online, one-to-one, at USD 15/hour (≈ ₦23,000 at the Oct 2026 rate).',
    onlineLearningDetail: TIME_NG + ' A backup power source and a 4G router help when the grid or fibre drops.',
    faqs: [
      { q: 'What does it cost in Port Harcourt?', a: FEES_NG },
      { q: 'Can my child sit IGCSE exams in Port Harcourt?', a: EXAMS_NG },
      { q: 'What happens if we are transferred?', a: 'Your child stays enrolled with the same curriculum and teachers wherever you move, and lessons are recorded.' },
      { q: 'Can we combine IGCSE with WAEC?', a: DUAL_NG },
      { q: 'Is homeschooling legal in Nigeria?', a: LEGAL_NG },
      { q: 'How do we pay and contact you?', a: PAY_NG + ' ' + CONTACT },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'ibadan-ng',
    name: 'Ibadan',
    county: 'Oyo State',
    region: 'Bodija · Jericho · Oluyole · Ring Road · Agodi GRA',
    primaryKeyword: 'Online school and homeschooling in Ibadan',
    seoTitle: 'Online School in Ibadan | Live IGCSE & A-Level Classes',
    seoDesc: 'Online school and homeschool in Ibadan: live IGCSE, A-Level and American classes for Bodija, Jericho and Oluyole families. From USD 423/month. Jan 2027 intake.',
    heroTagline: 'Live online British and American curriculum for families in Bodija, Jericho, Oluyole, Agodi GRA and around the University of Ibadan.',
    intro: 'Ibadan is a university city with many academic and professional families, but fewer British-curriculum schools than Lagos. Some families consider boarding or moving their children to Lagos for IGCSE. Smartious gives Ibadan children a live international curriculum at home, in the West African morning, alongside WAEC or NECO preparation for families who want both routes.',
    altTexts: { hero: 'Student in Ibadan in a live online Smartious lesson' },
    challenges: [
      'Fewer British-curriculum schools than Lagos or Abuja, so families consider boarding or a move.',
      'Academic families want strong A Level sciences and Mathematics.',
      'Traffic on Ring Road, at Challenge and on the Lagos-Ibadan Expressway.',
      'Families want both IGCSE or A Level and WAEC or NECO.',
    ],
    familySituations: [
      'Bodija and University of Ibadan families wanting A Level sciences.',
      'Jericho and Agodi GRA families who do not want their children boarding.',
      'Oluyole families commuting toward Lagos.',
      'Families planning IGCSE plus WAEC.',
    ],
    nearbyAreas: ['Bodija', 'Jericho', 'Agodi GRA', 'Oluyole', 'Ring Road', 'Iyaganku', 'Akobo', 'Samonda', 'University of Ibadan', 'Challenge', 'Mokola'],
    subjects: [
      'Cambridge IGCSE and International AS and A Level',
      'Pearson Edexcel International GCSE and A Level',
      'American curriculum with AP',
      'WAEC and NECO preparation',
      'Yoruba-speaking families can add French or other language options',
    ],
    whyChoose: [
      ['International curriculum without boarding', 'Your child follows IGCSE or A Level at home in Ibadan.'],
      ['Lessons in the Ibadan morning', TIME_NG],
      ['Both routes kept open', DUAL_NG],
      ['Exam entries', EXAMS_NG + ' From Ibadan, Lagos is usually the nearest British Council venue.'],
      ['Clear fees', 'From USD 423/month for Primary (≈ ₦656,000 at about ₦1,550/USD, Oct 2026 rate), payable termly. One-to-one tuition is USD 15/hour. ' + PAY_NG],
    ],
    growingReason: 'Ibadan families want an international qualification without sending their children away, and university families want strong sciences.',
    curricula: {
      cambridge: 'Cambridge Primary to IGCSE and A Level, entered through British Council Nigeria, usually at the Lagos venue for Ibadan families.',
      cbc: 'Kenya CBE (CBC) for families with East African links.',
      ib: 'IB subject support.',
      american: 'American curriculum with AP.',
    },
    homeschoolDetail: 'Full-time Ibadan students get a personal timetable, live small-group lessons, recordings, marked work and termly reports. ' + FEES_NG,
    homeTuitionDetail: 'Tuition is online, one-to-one, at USD 15/hour (≈ ₦23,000 at the Oct 2026 rate).',
    onlineLearningDetail: TIME_NG + ' A backup power source helps.',
    faqs: [
      { q: 'What does it cost?', a: FEES_NG },
      { q: 'Where would my child sit IGCSE exams?', a: EXAMS_NG + ' Ibadan families usually travel to Lagos.' },
      { q: 'Can we combine IGCSE with WAEC or NECO?', a: DUAL_NG },
      { q: 'Is homeschooling legal in Nigeria?', a: LEGAL_NG },
      { q: 'How do we pay and contact you?', a: PAY_NG + ' ' + CONTACT },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'enugu-ng',
    name: 'Enugu',
    county: 'Enugu State',
    region: 'Independence Layout · GRA · New Haven · Trans-Ekulu',
    primaryKeyword: 'Online school and homeschooling in Enugu',
    seoTitle: 'Online School in Enugu | Live IGCSE & A-Level Classes',
    seoDesc: 'Online school and homeschool in Enugu: live IGCSE, A-Level and American classes for Independence Layout and GRA families. From USD 423/month. Jan 2027 intake.',
    heroTagline: 'Live online British and American curriculum for families in Independence Layout, GRA, New Haven and Trans-Ekulu.',
    intro: 'Enugu families who want a British curriculum often look to boarding schools or other cities. Smartious offers IGCSE, A Level and the American curriculum live online at home in Enugu, in the West African morning, with WAEC or NECO preparation for families who want both routes. Families in the diaspora with relatives in Enugu also use us to keep a child\'s schooling steady during long stays.',
    altTexts: { hero: 'Student in Enugu in a live online Smartious lesson' },
    challenges: [
      'Few British-curriculum day schools, so families consider boarding elsewhere.',
      'Diaspora families who spend long periods in Enugu need schooling that continues.',
      'Families want IGCSE or A Level plus WAEC or NECO.',
      'IGCSE exam entries usually mean travelling to a British Council venue in another city.',
    ],
    familySituations: [
      'Independence Layout and GRA families who prefer not to board their children.',
      'Diaspora families spending a year in Enugu.',
      'Trans-Ekulu families planning IGCSE plus WAEC.',
    ],
    nearbyAreas: ['Independence Layout', 'GRA', 'New Haven', 'Trans-Ekulu', 'Achara Layout', 'Uwani', 'Abakpa', 'Emene', 'Nsukka'],
    subjects: [
      'Cambridge IGCSE and International AS and A Level',
      'Pearson Edexcel International GCSE and A Level',
      'American curriculum with AP',
      'WAEC and NECO preparation',
    ],
    whyChoose: [
      ['International curriculum at home', 'IGCSE and A Level in Enugu without boarding.'],
      ['Lessons in the Enugu morning', TIME_NG],
      ['Both routes kept open', DUAL_NG],
      ['Exam entries planned early', EXAMS_NG + ' Enugu families should plan travel to the nearest venue for their series.'],
      ['Clear fees', 'From USD 423/month for Primary (≈ ₦656,000 at about ₦1,550/USD, Oct 2026 rate), payable termly. One-to-one tuition is USD 15/hour. ' + PAY_NG],
    ],
    growingReason: 'Enugu families want international qualifications without boarding, and diaspora families want continuity during long visits home.',
    curricula: {
      cambridge: 'Cambridge Primary to IGCSE and A Level, entered as a private candidate through British Council Nigeria.',
      cbc: 'Kenya CBE (CBC) for families with East African links.',
      ib: 'IB subject support.',
      american: 'American curriculum with AP.',
    },
    homeschoolDetail: 'Full-time Enugu students get a personal timetable, live small-group lessons, recordings, marked work and termly reports. ' + FEES_NG,
    homeTuitionDetail: 'Tuition is online, one-to-one, at USD 15/hour (≈ ₦23,000 at the Oct 2026 rate).',
    onlineLearningDetail: TIME_NG + ' A backup power source helps.',
    faqs: [
      { q: 'What does it cost?', a: FEES_NG },
      { q: 'Where would my child sit IGCSE exams?', a: EXAMS_NG },
      { q: 'Can we combine IGCSE with WAEC or NECO?', a: DUAL_NG },
      { q: 'Is homeschooling legal in Nigeria?', a: LEGAL_NG },
      { q: 'How do we pay and contact you?', a: PAY_NG + ' ' + CONTACT },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'kano-ng',
    name: 'Kano',
    county: 'Kano State',
    region: 'Nassarawa GRA · Bompai · Sabon Gari · Tarauni',
    primaryKeyword: 'Online school and homeschooling in Kano',
    seoTitle: 'Online School in Kano | Live IGCSE & A-Level Classes',
    seoDesc: 'Online school and homeschool in Kano: live IGCSE, A-Level and American classes for Nassarawa GRA and Bompai families. From USD 423/month. Jan 2027 intake.',
    heroTagline: 'Live online British and American curriculum for families in Nassarawa GRA, Bompai, Sabon Gari and Tarauni, with Arabic and Islamic Studies options.',
    intro: 'Kano families who want IGCSE or A Level often have few local options and may look to Abuja or boarding schools. Smartious offers British and American curricula live online at home in Kano, in the West African morning, with Arabic and Islamic Studies available alongside, and WAEC or NECO preparation for families who want both routes.',
    altTexts: { hero: 'Student in Kano in a live online Smartious lesson' },
    challenges: [
      'Few British-curriculum schools, so families consider Abuja or boarding.',
      'Families want an international curriculum that sits alongside Arabic and Islamic Studies.',
      'IGCSE exam entries usually mean travelling to a British Council venue in another city.',
      'Families want IGCSE or A Level plus WAEC or NECO.',
    ],
    familySituations: [
      'Nassarawa GRA families who prefer not to send children to Abuja.',
      'Bompai business families planning A Level for universities abroad.',
      'Families combining IGCSE with Arabic and Islamic Studies.',
    ],
    nearbyAreas: ['Nassarawa GRA', 'Bompai', 'Sabon Gari', 'Tarauni', 'Gyadi-Gyadi', 'Hotoro', 'Zoo Road', 'Kano city centre'],
    subjects: [
      'Cambridge IGCSE and International AS and A Level',
      'Cambridge IGCSE Arabic and Islamic Studies',
      'Pearson Edexcel International GCSE and A Level',
      'American curriculum with AP',
      'WAEC and NECO preparation',
    ],
    whyChoose: [
      ['International curriculum at home', 'IGCSE and A Level in Kano without moving to Abuja.'],
      ['Arabic and Islamic Studies', 'Cambridge IGCSE Arabic and Islamic Studies can sit alongside the core subjects.'],
      ['Lessons in the Kano morning', TIME_NG],
      ['Exam entries planned early', EXAMS_NG + ' Kano families usually travel to Abuja.'],
      ['Clear fees', 'From USD 423/month for Primary (≈ ₦656,000 at about ₦1,550/USD, Oct 2026 rate), payable termly. One-to-one tuition is USD 15/hour. ' + PAY_NG],
    ],
    growingReason: 'Kano families want international qualifications close to home, alongside Arabic and Islamic Studies.',
    curricula: {
      cambridge: 'Cambridge Primary to IGCSE and A Level, entered as a private candidate through British Council Nigeria, usually at the Abuja venue for Kano families.',
      cbc: 'Kenya CBE (CBC) for families with East African links.',
      ib: 'IB subject support.',
      american: 'American curriculum with AP.',
    },
    homeschoolDetail: 'Full-time Kano students get a personal timetable, live small-group lessons, recordings, marked work and termly reports. ' + FEES_NG,
    homeTuitionDetail: 'Tuition is online, one-to-one, at USD 15/hour (≈ ₦23,000 at the Oct 2026 rate).',
    onlineLearningDetail: TIME_NG + ' A backup power source helps.',
    faqs: [
      { q: 'What does it cost?', a: FEES_NG },
      { q: 'Can my child study Arabic and Islamic Studies too?', a: 'Yes. Cambridge IGCSE Arabic and Islamic Studies can be added to the timetable.' },
      { q: 'Where would my child sit IGCSE exams?', a: EXAMS_NG + ' Kano families usually travel to Abuja.' },
      { q: 'Can we combine IGCSE with WAEC or NECO?', a: DUAL_NG },
      { q: 'Is homeschooling legal in Nigeria?', a: LEGAL_NG },
      { q: 'How do we pay and contact you?', a: PAY_NG + ' ' + CONTACT },
    ],
  },
]

export const NIGERIA_COUNTRY = {
  // ── Identity ───────────────────────────────────────────────────
  slug: 'nigeria',
  name: 'Nigeria',
  longName: 'Federal Republic of Nigeria',
  adjective: 'Nigerian',
  flag: '🇳🇬',
  hub: '/online-school/nigeria',
  hubPageId: 'homeschooling-nigeria',
  cityPageId: 'nigeria-city',

  // ── SEO (hub) ─────────────────────────────────────────────────
  seoTitle: 'Online School in Nigeria | British & American Curriculum',
  seoDesc: 'Online school and homeschool in Nigeria: live IGCSE, A-Level and American classes (WAT) for Lagos, Abuja, Port Harcourt. From USD 423/month. Jan 2027 intake.',
  h1: 'Online school and homeschool in Nigeria',

  // ── Currency ──────────────────────────────────────────────────
  currency: 'NGN',
  currencyName: 'Nigerian Naira',
  currencyPeg: { rate: 1550, since: null, note: 'The naira floats and fluctuates. Figures use about ₦1,550/USD (Oct 2026 rate) and are approximate; fees are set in USD.' },

  // ── Time zone ─────────────────────────────────────────────────
  timezone: {
    code: 'WAT',
    name: 'West Africa Time',
    utcOffset: '+1',
    offsetFromEAT: '2 hours behind Nairobi (EAT)',
  },

  // ── Exam centres ──────────────────────────────────────────────
  examCentres: ['British Council Nigeria (Lagos)', 'British Council Nigeria (Abuja)', 'British Council Nigeria (Port Harcourt)'],
  examCentreTiles: [
    { city: 'Lagos', centre: 'British Council Nigeria', area: 'Private-candidate entries for Cambridge and Pearson Edexcel. Check current dates, venues and fees on the British Council Nigeria website.' },
    { city: 'Abuja', centre: 'British Council Nigeria', area: 'Private-candidate entries for Cambridge and Pearson Edexcel. Usually the nearest venue for families in the north.' },
    { city: 'Port Harcourt', centre: 'British Council Nigeria', area: 'Private-candidate entries for Cambridge and Pearson Edexcel. Check that your series runs at this venue.' },
  ],
  examLogisticsProse: EXAMS_NG + ' WAEC (WASSCE for private candidates) and NECO run separately, and JAMB runs the UTME and Direct Entry for Nigerian universities.',
  secondaryProgrammeExamRef: 'British Council Nigeria',
  finalCTABadgeExamRef: 'British Council Nigeria exam entries',

  // ── Hero ──────────────────────────────────────────────────────
  heroImage: '/online-virtual-school.png',
  heroEyebrow: 'Online school for Nigeria',
  heroH1Suffix: 'Nigeria',
  heroSubhead: 'Live online Cambridge IGCSE and A Level, Pearson Edexcel, the American curriculum with AP, and WAEC and NECO preparation, for families in Lagos, Abuja, Port Harcourt, Ibadan, Enugu and Kano. Lessons run in the West African morning, two hours behind our teachers in Nairobi, and every lesson is recorded.',
  heroValueProp: 'From USD 423/month for Primary (≈ ₦656,000 at about ₦1,550/USD, Oct 2026 rate; the naira fluctuates), payable termly. One-to-one tuition USD 15/hour. Payment through Paystack. January 2027 intake: Term 2 starts 5 January 2027.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Nigeria',

  // ── Cities ────────────────────────────────────────────────────
  citiesSectionTitle: 'Online school across Nigeria',
  citiesSectionBody: 'Pages for Lagos, Abuja, Port Harcourt, Ibadan, Enugu and Kano. Each covers local areas, the school run, where to sit IGCSE exams, how to combine IGCSE with WAEC or NECO, fees in naira and the questions parents ask.',

  // ── Trust signals ({metric, value, sub}) ─────────────────────
  trustSignals: [
    { metric: 'Established', value: '2018', sub: 'Founded in Nairobi' },
    { metric: 'Countries', value: '40+', sub: 'Families learning with us' },
    { metric: 'Time zone', value: 'WAT', sub: 'Morning lessons, 2 hours behind Nairobi' },
    { metric: 'January 2027 intake', value: '5 Jan', sub: 'Term 2 starts 5 January 2027' },
  ],

  // ── Universities ──────────────────────────────────────────────
  universitiesInCountry: 'Nigerian universities admit through JAMB (UTME or Direct Entry). Some, including UNILAG, consider IGCSE and A Level results, but requirements differ by university and course and may need equivalency. Check with the university and JAMB early.',
  universityChannels: DUAL_NG + ' For universities abroad, IGCSE and A Level go through UCAS (UK) and are widely accepted in the US, Canada and elsewhere. We support applications and personal statements.',
  cambridgeCardDescription: 'Cambridge IGCSE and International AS and A Level taught live in the West African morning, with private-candidate entries through British Council Nigeria in Lagos, Abuja or Port Harcourt.',
  britishCurriculumSuits: 'Nigerian families aiming at UK and international universities, and families who want IGCSE alongside WAEC or NECO.',
  britishCurriculumDelivery: 'Live small-group lessons in WAT with recordings. Exam entries through British Council Nigeria.',
  ibDiplomaSuits: 'Students at IB schools who want subject support.',
  ibDiplomaDelivery: 'Live IB subject lessons and exam preparation. Full IB Diploma registration needs an IB World School.',
  americanCurriculumSuits: 'Families aiming at US or Canadian universities, and diplomatic or US-linked families in Abuja and Lagos.',
  americanCurriculumDelivery: 'American curriculum with AP courses and SAT preparation. AP exams are taken at an authorised College Board test centre.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2018 to make international qualifications accessible through live online teaching. Nigerian families learn alongside students from 40+ countries.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics.',

  // ── Comparison (no invented school fees) ──────────────────────
  competitorsIntro: 'Fees at Nigerian international schools vary widely by school, city and year group, and many schools charge in dollars or adjust naira fees during the year. Compare the full cost, including levies, transport and exam fees, and ask each school for its current fee schedule.',
  competitors: [
    { name: 'International schools in Lagos and Abuja', city: 'Lagos · Abuja', curriculum: 'British, American or IB', feesUsd: 'Varies by school', feesAed: 'Varies by school: ask for the current schedule', rating: 'Physical campus', capacityNote: 'Places in some year groups are limited; add transport and levies' },
    { name: 'Smartious (live online)', city: 'All of Nigeria', curriculum: 'Cambridge IGCSE & A Level · Pearson Edexcel · American AP · WAEC/NECO prep', feesUsd: 'From 423/month (Primary), payable termly', feesAed: 'From ≈ ₦656,000/month for Primary (Oct 2026 rate)', rating: 'Live online · recorded lessons', capacityNote: 'Fees vary by curriculum and level', isUs: true },
  ],

  // ── Legal framework ──────────────────────────────────────────
  legalFrameworkIntro: 'General information for Nigerian families, not legal advice.',
  legalFramework: [
    { h: 'Universal Basic Education Act', p: LEGAL_NG },
    { h: 'WAEC, NECO and JAMB', p: DUAL_NG },
    { h: 'IGCSE and A Level as a private candidate', p: EXAMS_NG },
  ],

  // ── Why Smartious ────────────────────────────────────────────
  whySmartious: [
    { h: 'Less time on the road', p: 'Lessons start at home, not after a long drive across Lagos, Abuja or Port Harcourt.' },
    { h: 'Morning lessons in WAT', p: TIME_NG },
    { h: 'IGCSE and WAEC planned together', p: DUAL_NG },
    { h: 'Clear fees, paid via Paystack', p: FEES_NG + ' ' + PAY_NG },
    { h: 'Moves with your family', p: 'Enrolment continues through transfers within Nigeria or abroad.' },
  ],

  // ── FAQs ─────────────────────────────────────────────────────
  faqs: [
    { q: 'Is homeschooling legal in Nigeria?', a: LEGAL_NG },
    { q: 'How much does online school cost in Nigeria?', a: FEES_NG },
    { q: 'What time are live lessons in Nigeria?', a: TIME_NG },
    { q: 'Where do Nigerian students sit IGCSE and A Level exams?', a: EXAMS_NG },
    { q: 'Can my child do IGCSE and WAEC or NECO?', a: DUAL_NG },
    { q: 'Do Nigerian universities accept IGCSE and A Level?', a: 'Some do, including UNILAG, but requirements differ by university and course and may involve equivalency or JAMB Direct Entry rules. Check with the university and JAMB, and consider taking WAEC or NECO as well.' },
    { q: 'Can we pay in naira?', a: PAY_NG },
    { q: 'When is the next intake?', a: INTAKE },
    { q: 'How do we contact Smartious?', a: CONTACT },
  ],

  // ── CTA ──────────────────────────────────────────────────────
  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Submit the assessment request form. Admissions reviews every request and replies within three business days. January 2027 intake: Term 2 starts 5 January 2027.',
}
