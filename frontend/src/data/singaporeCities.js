// ═══════════════════════════════════════════════════════════════════
// SINGAPORE — Smartious area-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// and American AP for expatriate, permanent-resident and Singaporean
// families across central Singapore (Bukit Timah, Tanglin, Holland,
// River Valley), the east (East Coast, Katong, Tampines, Changi) and
// the west and north (Clementi, one-north, Jurong, Woodlands).
//
// Built for the searches Singapore families make: "online school
// Singapore", "homeschool Singapore", "homeschooling in Singapore",
// "online international school Singapore", "IGCSE online Singapore".
//
// IMAGE NOTE: area pages have no heroImg (the hero falls back to the
// ink→crimson gradient); the country hub uses /online-virtual-school.png.
// Do NOT paste guessed stock-photo IDs.
//
// LEGAL POSITIONING NOTE — READ BEFORE EDITING:
// - The Compulsory Education Act requires SINGAPORE CITIZENS of
//   compulsory school age (above 6 and under 15) to attend a national
//   primary school. Home schooling for a citizen child needs an
//   EXEMPTION from the Ministry of Education (MOE), applied for through
//   MOE's Compulsory Education Unit. MOE sets the conditions, including
//   national benchmarks the child is expected to meet. Do NOT state
//   benchmark details, fines or deadlines as fact here: point families
//   to MOE.
// - The Act covers citizens. Families who are not Singapore citizens
//   (Employment Pass, Dependant's Pass and similar) are not covered by
//   it; permanent residents should confirm their own position with MOE.
// - CONSEQUENCE: for citizen children of primary age without an MOE
//   exemption, Smartious is SUPPLEMENTARY (after school, subjects the
//   school does not offer, IGCSE / A-Level alongside). For expatriate
//   families, full-time online school is a straightforward choice.
// - Never imply MOE approval, registration or endorsement. Smartious is
//   a Cambridge International registered school and a Pearson Edexcel
//   approved centre; it is not an MOE-registered school in Singapore.
// - EXAMS: Cambridge International (IGCSE, International AS & A Level)
//   is NOT the same as the Singapore-Cambridge GCE O and A Levels run by
//   SEAB. Our students sit Cambridge International and Pearson Edexcel
//   papers as private candidates at centres that accept them, such as
//   British Council Singapore. Centres, fees and deadlines are set by
//   the centre; we confirm a centre per family.
// TIMEZONE: SGT (UTC+8), no daylight saving — FIVE HOURS AHEAD of
// Nairobi EAT, fixed all year. Singapore afternoons (2 PM – 6 PM SGT)
// are Nairobi mornings (9 AM – 1 PM EAT).
// ═══════════════════════════════════════════════════════════════════

const SG_SUBJECTS = [
  'Cambridge IGCSE Mathematics, Additional Mathematics, English Language, English Literature',
  'Cambridge IGCSE Sciences (Biology, Chemistry, Physics, Combined Science) and Computer Science',
  'Cambridge IGCSE Mandarin Chinese, French, Spanish, Economics, Business Studies, Geography, History',
  'Cambridge International AS & A Level Mathematics, Further Mathematics, Physics, Chemistry, Biology',
  'Cambridge International AS & A Level Economics, Business, Accounting, Computer Science, Psychology',
  'Pearson Edexcel International GCSE and International A Level',
  'IB Diploma Programme: all six subject groups, Theory of Knowledge and the Extended Essay',
  'American Curriculum: AP Calculus, AP Physics, AP Computer Science A, AP Economics',
  'SAT, ACT, IELTS and TOEFL preparation',
  'University applications: NUS, NTU and SMU, UCAS (UK), Common App (US), Australia and Canada',
]

const SG_CURRICULA = {
  cambridge: 'Cambridge IGCSE and Cambridge International AS & A Level: our main programme for Singapore families, taught live in small groups. These are Cambridge International qualifications, distinct from the Singapore-Cambridge GCE O and A Levels; papers are sat as a private candidate at a centre such as British Council Singapore.',
  cbc: 'Kenya CBC is available for Singapore families with East African ties.',
  ib: 'IB Diploma Programme: live subject teaching, Theory of Knowledge and Extended Essay supervision, for families on the IB route or moving between IB schools.',
  american: 'American Curriculum with AP: for families targeting American universities.',
}

export const SINGAPORE_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'central-singapore-sg',
    seoTitle: 'Online School in Central Singapore | Bukit Timah, Tanglin',
    name: 'Central Singapore',
    county: 'Central Region',
    region: 'Bukit Timah · Tanglin · Holland Village · River Valley · Orchard · Novena · the embassy belt and the densest cluster of international schools on the island',
    primaryKeyword: 'Online school in central Singapore',
    heroTagline: 'For families in Bukit Timah, Tanglin, Holland Village and River Valley: live Cambridge, IB and American classes without the school run.',
    intro: 'Live online Cambridge IGCSE, Cambridge International AS & A Level, Pearson Edexcel, IB Diploma and American Curriculum with AP for families in central Singapore: Bukit Timah and the Dunearn and Holland Road corridor, Tanglin and the embassy belt off Napier Road, Holland Village, River Valley and Robertson Quay, Orchard and Novena. Central Singapore holds the island\'s densest cluster of international schools and its longest waiting lists, and many of the families here are on corporate or diplomatic postings that may end mid-year. Smartious gives a child one curriculum, one set of teachers and one exam board that move with the family, taught live in small groups in Singapore afternoons. For Singapore citizens of primary age, the Compulsory Education Act applies: see the note on homeschooling below.',
    altTexts: { hero: 'Central Singapore skyline above the Singapore River' },
    seoDesc: 'Live online school for central Singapore families in Bukit Timah, Tanglin, Holland and River Valley. Cambridge IGCSE, A-Level, IB and AP in small live classes. From USD 423/month.',
    challenges: [
      'International school places in central Singapore are oversubscribed at the popular entry years, and a mid-year arrival can wait a term or more for a place.',
      'Premium international school fees and one-off charges add up quickly for families who are not on a full corporate education allowance.',
      'Diplomatic and regional-headquarters postings can end mid-year; a new school abroad can mean a new curriculum and a lost term.',
      'Singapore citizens of compulsory school age must attend a national primary school unless MOE grants an exemption, so for citizen families online teaching is usually alongside school.',
      'Time zone: Singapore runs SGT (UTC+8), five hours ahead of Nairobi, fixed all year. Classes run in Singapore afternoons.',
    ],
    familySituations: [
      'Diplomatic families in the Tanglin and Napier Road embassy belt.',
      'Regional-headquarters families in banking, consulting, technology and commodities on two- to four-year postings.',
      'Families waiting for an international school place after a mid-year move.',
      'Students needing a subject their school does not run, such as Further Mathematics or a third science.',
      'Families moving between IB and Cambridge schools across Asia.',
      'Singaporean families wanting IGCSE or A-Level depth alongside school.',
    ],
    nearbyAreas: ['Bukit Timah', 'Tanglin', 'Holland Village', 'River Valley', 'Robertson Quay', 'Orchard', 'Novena', 'Newton', 'Dempsey', 'Farrer Road', 'Sixth Avenue', 'Toa Payoh'],
    subjects: SG_SUBJECTS,
    whyChoose: [
      ['No waiting list', 'A placement assessment, then a timetable. A child who arrives in March starts in March.'],
      ['One curriculum across postings', 'The same Cambridge, IB or American programme, teachers and exam board before, during and after Singapore.'],
      ['Live, small and subject-taught', 'Small live classes with subject specialists, homework that is marked, and termly reports.'],
      ['Singapore afternoons', 'Classes run between 2 PM and 6 PM SGT, which is the Nairobi morning, every week of the year.'],
      ['Honest about the law', 'For citizen children of primary age we say plainly that MOE\'s rules come first, and teach alongside school.'],
    ],
    growingReason: 'Central Singapore is home to much of the island\'s expatriate and diplomatic community and to most of its international schools. The demand we see is not for a different qualification but for a place, now, in the one the family already uses, and for continuity when the posting ends.',
    curricula: SG_CURRICULA,
    homeschoolDetail: 'For Singapore citizens of compulsory school age (above 6 and under 15), the Compulsory Education Act requires enrolment in a national primary school; home schooling needs an exemption from MOE, applied for through its Compulsory Education Unit, and MOE sets the conditions. Families who are not Singapore citizens are not covered by the Act; permanent residents should confirm their position with MOE. Most of our central Singapore students are expatriate children studying full time, or citizen students taking IGCSE, A-Level or a subject their school does not offer alongside school.',
    homeTuitionDetail: 'Smartious teaches Singapore families online; the live programme is complete without home tuition.',
    onlineLearningDetail: 'Live online classes on the Smartious platform, in small groups, at fixed Singapore afternoon times that do not drift through the year.',
    faqs: [
      { q: 'Can my child study full time with Smartious while we live in central Singapore?', a: 'If your child is not a Singapore citizen, usually yes: the Compulsory Education Act covers citizens. For a Singapore citizen of primary age, home schooling needs an MOE exemption, so most citizen families use Smartious alongside school. Permanent residents should confirm their position with MOE.' },
      { q: 'We are waiting for an international school place. Can our child start now?', a: 'Yes. Book an assessment; after placement your child joins live classes in the curriculum they were already following, and can move into a school later without a gap.' },
      { q: 'Where would our child sit IGCSE or A-Level exams?', a: 'As a private candidate at a centre that accepts them, such as British Council Singapore. We confirm a centre and the entry deadlines for each family; exam fees are paid to the centre.' },
      { q: 'What time are classes?', a: 'In Singapore afternoons, usually between 2 PM and 6 PM SGT, the same time every week of the year.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'east-singapore-sg',
    seoTitle: 'Online School in East Singapore | East Coast, Tampines',
    name: 'East Singapore',
    county: 'East Region',
    region: 'East Coast · Katong · Marine Parade · Siglap · Bedok · Tampines · Pasir Ris · Changi · aviation, logistics and family housing near the coast',
    primaryKeyword: 'Online school in east Singapore',
    heroTagline: 'For East Coast, Katong, Tampines and Changi families: live international classes at home, close to the coast and far from the central school belt.',
    intro: 'Live online Cambridge IGCSE, Cambridge International AS & A Level, Pearson Edexcel, IB Diploma and American Curriculum with AP for families in east Singapore: the East Coast and Marine Parade, Katong and Joo Chiat, Siglap and Frankel, Bedok, Tampines, Pasir Ris and the Changi area. The east is family housing, landed estates and condominiums by the coast, with many households in aviation, logistics, shipping and the business parks. Some of the international schools families want sit across the island, and a long daily run on the expressway eats into the day. Smartious teaches the same programmes live, in small groups, in Singapore afternoons, so the teaching comes to the child. For Singapore citizens of primary age, the Compulsory Education Act applies: see the note on homeschooling below.',
    altTexts: { hero: 'East Coast Park and the shoreline in east Singapore' },
    seoDesc: 'Live online school for East Coast, Katong, Tampines and Changi families. Cambridge IGCSE, A-Level, IB and AP taught live in small groups. From USD 423/month.',
    challenges: [
      'The international school a family wants may be across the island, and the daily drive on the ECP, PIE or TPE adds up for younger children.',
      'Aviation, logistics and shipping careers bring rotations and relocations that do not follow school terms.',
      'Families with several children face several sets of international school fees at once.',
      'Singapore citizens of compulsory school age must attend a national primary school unless MOE grants an exemption.',
      'Time zone: SGT (UTC+8), five hours ahead of Nairobi, fixed all year.',
    ],
    familySituations: [
      'Aviation families connected to Changi, from flight crew to engineering and airline management.',
      'Logistics, shipping and supply-chain families around Changi Business Park and the east.',
      'Families in the landed estates of Siglap, Frankel and Opera Estate who prefer a shorter school day at home.',
      'Students preparing IGCSEs or A Levels as private candidates.',
      'Children with health needs, or anxiety at school, who learn better in a small live class at home.',
      'Singaporean families adding IGCSE, A-Level or a subject their school does not offer.',
    ],
    nearbyAreas: ['East Coast', 'Marine Parade', 'Katong', 'Joo Chiat', 'Siglap', 'Frankel', 'Bedok', 'Tampines', 'Pasir Ris', 'Changi', 'Loyang', 'Simei', 'Paya Lebar'],
    subjects: SG_SUBJECTS,
    whyChoose: [
      ['The teaching comes to you', 'Live lessons at home in the east, instead of a cross-island run twice a day.'],
      ['Built around rotations', 'Aviation and logistics careers move; the curriculum, teachers and exam board stay the same.'],
      ['Siblings on one timetable', 'Children at different levels can study at home on coordinated afternoon timetables.'],
      ['Exams planned for you', 'We plan private-candidate entries and confirm a centre, such as British Council Singapore, for each sitting.'],
      ['Clear about MOE', 'For citizen children of primary age we teach alongside school, not instead of it, unless MOE has granted an exemption.'],
    ],
    growingReason: 'East Singapore is where many aviation, logistics and shipping families live, often in landed homes or coastal condominiums some distance from the international schools they would choose. Families come to us for the same qualifications without the daily drive, and for continuity through rotations and relocations.',
    curricula: SG_CURRICULA,
    homeschoolDetail: 'The Compulsory Education Act requires Singapore citizens of compulsory school age (above 6 and under 15) to attend a national primary school unless MOE grants an exemption; MOE sets the conditions for home schooling. Non-citizen families are not covered by the Act, and permanent residents should check their position with MOE. In the east, our students are mostly expatriate children studying full time and citizen students taking IGCSE, A-Level or extra subjects alongside school.',
    homeTuitionDetail: 'Smartious teaches Singapore families online; the live programme is complete without home tuition.',
    onlineLearningDetail: 'Live online classes in small groups on the Smartious platform, in Singapore afternoons, fixed all year.',
    faqs: [
      { q: 'We live in Tampines. Does online school suit a family far from the international schools?', a: 'Yes. The classes are live and the same wherever you live on the island, so there is no daily drive. Exams are sat at a centre that accepts private candidates, which we confirm with you.' },
      { q: 'My partner works rotations at Changi. What happens if we are posted elsewhere?', a: 'Your child keeps the same curriculum, teachers and exam board after the move. Only the time zone changes, and we adjust the timetable.' },
      { q: 'Is homeschooling legal for Singaporean children?', a: 'For Singapore citizens of compulsory school age, home schooling needs an exemption from MOE, which sets the conditions. Without one, citizen children attend a national primary school and can study with us alongside it.' },
      { q: 'Can two children at different levels both study with you?', a: 'Yes. Each child is placed after an assessment and gets their own timetable; we coordinate the afternoons so they fit a family day.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'west-singapore-sg',
    seoTitle: 'Online School in West Singapore | Clementi, Jurong',
    name: 'West and North Singapore',
    county: 'West and North Regions',
    region: 'Clementi · Buona Vista · one-north · West Coast · Jurong · Bukit Batok · Woodlands · Sembawang · research, energy, engineering and the Johor causeway',
    primaryKeyword: 'Online school in west Singapore',
    heroTagline: 'For Clementi, one-north, Jurong and Woodlands families: live Cambridge, IB and American classes for research, engineering and cross-border households.',
    intro: 'Live online Cambridge IGCSE, Cambridge International AS & A Level, Pearson Edexcel, IB Diploma and American Curriculum with AP for families in west and north Singapore: Clementi and Dover, Buona Vista and one-north, West Coast and Pasir Panjang, Jurong and the Jurong Lake District, Bukit Batok and Bukit Panjang, and Woodlands and Sembawang in the north. The west is the island\'s research and engineering side, from the universities and one-north\'s biomedical and technology parks to the energy and chemicals industry on Jurong Island. Families here include researchers on fixed-term contracts, engineers on project postings and cross-border households with ties to Johor. Smartious teaches the same international programmes live, in small groups, in Singapore afternoons. For Singapore citizens of primary age, the Compulsory Education Act applies: see the note on homeschooling below.',
    altTexts: { hero: 'Buildings and green space in the west of Singapore' },
    seoDesc: 'Live online school for Clementi, one-north, Jurong and Woodlands families. Cambridge IGCSE, A-Level, IB and AP taught live in small groups. From USD 423/month.',
    challenges: [
      'Research and engineering contracts are often fixed-term, and the next post may be in another country and another school system.',
      'Strong STEM students want Further Mathematics, a third science or Computer Science, which not every school runs for a small group.',
      'Families in the north and west can be a long way from the international schools they would choose.',
      'Singapore citizens of compulsory school age must attend a national primary school unless MOE grants an exemption.',
      'Time zone: SGT (UTC+8), five hours ahead of Nairobi, fixed all year.',
    ],
    familySituations: [
      'Research families at the universities and the one-north biomedical and technology parks.',
      'Engineering, energy and chemicals families on project postings around Jurong.',
      'Families with ties across the causeway in Johor.',
      'STEM students wanting Further Mathematics, a third science or Computer Science.',
      'Students sitting IGCSEs or A Levels as private candidates.',
      'Singaporean families wanting an international qualification alongside school.',
    ],
    nearbyAreas: ['Clementi', 'Dover', 'Buona Vista', 'one-north', 'West Coast', 'Pasir Panjang', 'Jurong East', 'Jurong West', 'Bukit Batok', 'Bukit Panjang', 'Choa Chu Kang', 'Woodlands', 'Sembawang', 'Yishun'],
    subjects: SG_SUBJECTS,
    whyChoose: [
      ['Built for STEM', 'Further Mathematics, three sciences and Computer Science in live groups drawn from several countries, where one school cannot run the set.'],
      ['Through the end of a contract', 'Fixed-term posts end; your child\'s curriculum and teachers carry on to the next country.'],
      ['Close to home in the west and north', 'Live classes reach Woodlands and Jurong exactly as they reach the city centre.'],
      ['Exams planned with you', 'Private-candidate entries planned early, at a centre such as British Council Singapore.'],
      ['Straight about MOE', 'For citizen children of primary age, MOE\'s rules come first; we teach alongside school.'],
    ],
    growingReason: 'West Singapore is the island\'s research, engineering and industrial side, and the north faces Johor across the causeway. Families here are often on fixed-term contracts or move between countries, and they come to us for STEM depth and for one curriculum that survives the move.',
    curricula: SG_CURRICULA,
    homeschoolDetail: 'Under the Compulsory Education Act, Singapore citizens of compulsory school age (above 6 and under 15) attend a national primary school unless MOE grants a home-schooling exemption, on conditions MOE sets. Non-citizen families are not covered by the Act; permanent residents should confirm their position with MOE. Our west and north students are mostly expatriate children studying full time and citizen students adding IGCSE, A-Level or STEM subjects alongside school.',
    homeTuitionDetail: 'Smartious teaches Singapore families online; the live programme is complete without home tuition.',
    onlineLearningDetail: 'Live online classes in small groups on the Smartious platform, in Singapore afternoons, fixed all year.',
    faqs: [
      { q: 'My child wants Further Mathematics and three sciences. Can you teach that?', a: 'Yes. Further Mathematics, Physics, Chemistry, Biology and Computer Science run as live small-group classes at IGCSE and A Level, and are sat as a private candidate at a centre we confirm with you.' },
      { q: 'My research contract ends next year. What happens to my child\'s schooling?', a: 'The curriculum, teachers and exam board move with you. Only the time zone changes, and we adjust the timetable for the new country.' },
      { q: 'Is online school allowed for Singapore citizens?', a: 'A Singapore citizen of compulsory school age needs an MOE exemption to be home schooled. Without one, the child attends a national primary school and can study with us alongside it.' },
      { q: 'We live in Woodlands. Does that change anything?', a: 'No. The classes are the same live classes wherever you live in Singapore.' },
    ],
  },
]

export const SINGAPORE_COUNTRY = {
  slug: 'singapore',
  name: 'Singapore',
  longName: 'Republic of Singapore',
  adjective: 'Singaporean',
  flag: '🇸🇬',
  hub: '/online-school/singapore',
  hubPageId: 'homeschooling-singapore',
  cityPageId: 'singapore-city',

  currency: 'SGD',
  currencyName: 'Singapore Dollar',
  currencyPeg: 'Fees are invoiced in USD; Singapore dollar equivalents move with the exchange rate and are confirmed at invoicing.',

  timezone: {
    code: 'SGT',
    name: 'Singapore Standard Time (UTC+8), no daylight saving',
    utcOffset: '+8',
    offsetFromEAT: '+5 hours ahead, fixed, every week of the year',
  },

  examCentres: ['British Council Singapore and other centres that accept private candidates for Cambridge International and Pearson Edexcel examinations'],
  examCentreTiles: [
    { city: 'Singapore', centre: 'British Council Singapore', area: 'Accepts private candidates for Cambridge International and Pearson Edexcel examinations; subjects, fees and deadlines are set by the centre.' },
    { city: 'Singapore', centre: 'Other approved centres', area: 'Some Cambridge and Pearson centres on the island take external candidates; we confirm availability per subject and session.' },
    { city: 'Not the same as', centre: 'Singapore-Cambridge GCE', area: 'The national O and A Levels are run by SEAB. Our students sit Cambridge International IGCSE and AS & A Level, or Pearson Edexcel.' },
  ],
  examLogisticsProse: 'Singapore students who study with us sit Cambridge International (IGCSE and International AS & A Level) or Pearson Edexcel (International GCSE and International A Level) papers as private candidates, usually at British Council Singapore, which accepts private candidates, or at another centre that takes external entries. These are different examinations from the Singapore-Cambridge GCE O and A Levels run by SEAB for national schools, although universities in Singapore and abroad read both. Entry deadlines fall months before each series (May/June and October/November for Cambridge; January, May/June and October/November for Pearson Edexcel), and the centre sets the fees, so we plan entries with each family at the start of the course and confirm the centre for every sitting.',
  secondaryProgrammeExamRef: 'British Council Singapore and other centres taking private candidates',
  finalCTABadgeExamRef: 'Private-candidate entries planned and a centre confirmed for every sitting',

  heroImage: '/online-virtual-school.png',
  heroEyebrow: 'Online school for Singapore',
  heroH1Suffix: 'Singapore',
  heroSubhead: 'Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma and American AP for families in Singapore, taught in small groups by subject specialists in Singapore afternoons. Full-time online school for expatriate families who need a place now or continuity across postings, and IGCSE, A-Level or extra subjects alongside school for Singaporean families. For Singapore citizens of primary age, home schooling needs an MOE exemption, and we say so before anything else.',
  heroValueProp: 'From USD 423/month. Small live classes, Cambridge / Pearson Edexcel / IB / American AP through to A-Level, in Singapore afternoons, fixed all year.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Singapore',

  citiesSectionTitle: 'Where our Singapore families are',
  citiesSectionBody: 'Smartious Singapore families live across the island: central Singapore (Bukit Timah, Tanglin, Holland Village and River Valley, the embassy belt and the main cluster of international schools), the east (East Coast, Katong, Tampines and Changi, with many aviation and logistics households), and the west and north (Clementi, one-north, Jurong and Woodlands, the research, engineering and cross-border side). The classes are the same live classes wherever you live.',

  trustSignals: [
    { h: 'Cambridge and Pearson Edexcel', p: 'Smartious is a Cambridge International registered school and a Pearson Edexcel approved centre, teaching live online to families in 40+ countries.' },
    { h: 'Singapore afternoons, fixed all year', p: 'Singapore runs SGT (UTC+8) and Kenya EAT (UTC+3), with no daylight saving on either side, so classes run in Singapore afternoons at the same time every week.' },
    { h: 'The law stated first', p: 'Singapore citizens of compulsory school age need an MOE exemption to be home schooled. We say so up front and teach citizen children alongside school unless an exemption is in place.' },
    { h: 'Exams planned, centre confirmed', p: 'We plan private-candidate entries at the start of each course and confirm a centre, such as British Council Singapore, for every sitting.' },
  ],

  universitiesInCountry: 'The National University of Singapore (NUS), Nanyang Technological University (NTU), Singapore Management University (SMU), the Singapore University of Technology and Design (SUTD), the Singapore Institute of Technology (SIT) and the Singapore University of Social Sciences (SUSS), alongside overseas branch campuses.',
  universityChannels: 'Singapore\'s universities admit applicants with international qualifications as well as the national GCE A Levels, and set their own subject and grade requirements for each course: Cambridge International AS & A Level, Pearson Edexcel International A Level, the IB Diploma and the American route with AP and the SAT are all used by applicants. UCAS (UK), Australian, Canadian and US universities read the same qualifications. Smartious plans subject choices around the courses a student is aiming for and supports applications to NUS, NTU and SMU, UCAS, the Common App, and Australia and Canada.',
  cambridgeCardDescription: 'Our main programme for Singapore families: Cambridge IGCSE and Cambridge International AS & A Level, taught live in small groups in Singapore afternoons. Full time for expatriate families; alongside school for Singaporean families. Papers are sat as a private candidate at a centre such as British Council Singapore.',
  britishCurriculumSuits: 'Singapore families wanting Cambridge IGCSE and A Level. Best fit for: (1) expatriate children waiting for, or between, international school places, (2) families on postings who need one curriculum across moves, (3) students wanting Further Mathematics, a third science or Computer Science, (4) Singaporean students adding an international qualification alongside school, (5) children who learn better in a small live class at home.',
  britishCurriculumDelivery: 'Live online classes in Singapore afternoons, small groups, subject specialists, marked homework and termly reports.',
  ibDiplomaSuits: 'Singapore families on the IB route, or moving between IB schools across Asia, wanting live subject teaching, Theory of Knowledge and Extended Essay supervision.',
  ibDiplomaDelivery: 'Live online IB DP classes across all six subject groups plus Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Singapore families targeting American universities through the Common Application.',
  americanCurriculumDelivery: 'American Curriculum with AP courses Grades 9-12, SAT/ACT preparation, Common App essay coaching.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2018 to make international qualifications accessible to internationally mobile families at online fees rather than campus ones. In Singapore our role is simple: a place now, continuity across postings, and the subjects a timetable cannot run.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics. In Singapore the STEM sets he oversees most often are Further Mathematics, Physics and Computer Science at IGCSE and A Level.',

  competitorsIntro: 'Singapore has excellent schools, national and international, and we do not pitch against them. Families come to us for three reasons: an international school place that is not available yet, continuity across a posting, and subjects a single timetable cannot run. Here is where we sit among the options.',
  competitors: [
    { name: 'National schools (MOE)',                       city: 'Island-wide',         curriculum: 'Singapore national curriculum, GCE O / A Level', feesUsd: 'Subsidised; higher rates for non-citizens', feesAed: 'Places for foreigners are limited' },
    { name: 'International schools',                        city: 'Island-wide',         curriculum: 'IB, Cambridge, American, national systems',     feesUsd: 'Premium; often tens of thousands of SGD a year', feesAed: 'Waiting lists at popular entry years' },
    { name: 'Private tuition centres',                      city: 'Island-wide',         curriculum: 'Exam coaching, per subject',                    feesUsd: 'Per hour, per subject',                       feesAed: 'Alongside school' },
    { name: 'Self-paced online courses',                    city: 'Online',              curriculum: 'Cambridge / UK online, often self-paced',       feesUsd: 'Varies',                                      feesAed: 'Varies' },
    { name: 'Smartious Homeschool (live online)',           city: 'All of Singapore',    curriculum: 'Cambridge IGCSE, A Level, Pearson Edexcel, IB DP, AP', feesUsd: 'From USD 423/month for Primary', feesAed: 'Varies by curriculum and level' },
  ],

  legalFrameworkIntro: 'In Singapore the question that matters is citizenship. The Compulsory Education Act covers Singapore citizens; families who are not citizens are not covered by it. Here is what that means in practice, stated before we offer anything.',
  legalFramework: [
    { h: 'Singapore citizens: national primary school, or an MOE exemption', p: 'Under the Compulsory Education Act, Singapore citizens of compulsory school age (above 6 and under 15) must be enrolled in a national primary school. Home schooling a citizen child requires an exemption from the Ministry of Education, applied for through MOE\'s Compulsory Education Unit, and MOE sets the conditions, including the national benchmarks it expects the child to meet. Families considering this should read MOE\'s current guidance and apply before withdrawing a child.' },
    { h: 'Families who are not citizens', p: 'The Act covers Singapore citizens. Expatriate families on Employment Passes, Dependant\'s Passes and similar passes are not covered by it and can choose an international school, home education or a full-time online school. Permanent residents should confirm their own position with MOE.' },
    { h: 'What this means for Smartious', p: 'For expatriate children, Smartious can be the whole school: live classes, marked work, reports and exams. For Singapore citizens of primary age without an MOE exemption, we teach alongside school: IGCSE or A Level, a subject the school does not offer, or extra support. Smartious is not a school registered with MOE and does not claim to be.' },
    { h: 'Cambridge International is not the GCE', p: 'The Singapore-Cambridge GCE O and A Levels are national examinations run by SEAB. Our students sit Cambridge International IGCSE and AS & A Level, or Pearson Edexcel International GCSE and A Level, as private candidates. Universities in Singapore and abroad read both routes.' },
    { h: 'Where the qualifications lead', p: 'NUS, NTU and SMU admit applicants with international qualifications as well as GCE A Levels, setting their own requirements by course. UCAS, Australian, Canadian and US universities read the same qualifications, which is why families on postings value one curriculum across moves.' },
  ],

  whySmartious: [
    { h: 'A place now', p: 'No waiting list: a placement assessment, then a timetable, whatever month you arrive.' },
    { h: 'One curriculum across postings', p: 'Before, during and after Singapore: the same programme, teachers and exam board.' },
    { h: 'The subject a timetable cannot run', p: 'Further Mathematics, a third science or Computer Science in live groups drawn from several countries.' },
    { h: 'Singapore afternoons', p: 'Classes between 2 PM and 6 PM SGT, the same time every week of the year.' },
    { h: 'Exams handled', p: 'Private-candidate entries planned early; a centre such as British Council Singapore confirmed for every sitting.' },
    { h: 'Honest about MOE', p: 'For citizen children of primary age, MOE\'s rules come first, and we say so before anything else.' },
  ],

  faqs: [
    { q: 'Is homeschooling legal in Singapore?', a: 'For Singapore citizens of compulsory school age (above 6 and under 15), home schooling needs an exemption from MOE, applied for through its Compulsory Education Unit; MOE sets the conditions. Families who are not citizens are not covered by the Compulsory Education Act. Permanent residents should confirm their position with MOE.' },
    { q: 'Can expatriate children study full time with an online school in Singapore?', a: 'Yes. Children who are not Singapore citizens are not covered by the Compulsory Education Act, so expatriate families can choose a full-time online school. With Smartious your child follows Cambridge, Pearson Edexcel, IB or the American curriculum in live small classes.' },
    { q: 'Can Singaporean children study with Smartious?', a: 'Yes, alongside school: IGCSE or A Level, a subject the school does not offer, or extra support. A citizen child of primary age studies with us full time only if MOE has granted a home-schooling exemption.' },
    { q: 'Where do students sit IGCSE and A-Level exams in Singapore?', a: 'As private candidates at a centre that accepts them, such as British Council Singapore. We plan entries early and confirm the centre; exam fees are set by and paid to the centre.' },
    { q: 'Is Cambridge IGCSE the same as the Singapore-Cambridge O Level?', a: 'No. The GCE O and A Levels are Singapore\'s national examinations, run by SEAB. IGCSE and Cambridge International AS & A Level are Cambridge\'s international qualifications. Universities in Singapore and abroad read both.' },
    { q: 'Do NUS, NTU and SMU accept international qualifications?', a: 'Yes. They admit applicants with international qualifications such as Cambridge International A Levels and the IB Diploma, and set their own subject and grade requirements for each course, so check the course you are aiming for.' },
    { q: 'What time are classes in Singapore?', a: 'In Singapore afternoons, usually between 2 PM and 6 PM SGT. Singapore is five hours ahead of Nairobi with no daylight saving on either side, so the times stay the same all year.' },
    { q: 'How much does online school cost in Singapore?', a: 'Smartious fees start from USD 423 a month for Primary, payable termly, and vary by curriculum and level. Exam entry fees are paid to the exam centre.' },
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Every admission starts with an assessment. Tell us your child\'s current curriculum and whether they are a Singapore citizen, permanent resident or on a pass: that decides whether they study with us full time or alongside school. Our Head of Admissions replies within three business days.',
}
