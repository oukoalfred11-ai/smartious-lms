// ═══════════════════════════════════════════════════════════════════
// INDONESIA — Smartious city-level + country-level data
// Live online Cambridge IGCSE, A-Level, Pearson Edexcel, IB Diploma,
// American AP and the Ontario OSSD (through our Ontario partner school)
// for Indonesian, expatriate and returning families across Jakarta,
// Bali, Surabaya, Bandung, Batam and Yogyakarta.
//
// LEGAL POSITIONING NOTE — READ BEFORE EDITING. OPEN TIER:
// - Law No. 20/2003 on the National Education System (UU Sisdiknas)
//   recognises three pathways: formal, non-formal and INFORMAL
//   education. Article 27: informal education is run by the family
//   and the community, and its results are recognised as equal to
//   formal and non-formal education once the student passes an
//   assessment against the national standard.
// - Permendikbud No. 129/2014 on Sekolahrumah (homeschooling) sets
//   three forms: tunggal (one family), majemuk (several families)
//   and komunitas (a community). Single and multi-family homeschools
//   register with the district/city education office (Dinas
//   Pendidikan kabupaten/kota). Still cited as current in 2025
//   literature; re-check before editing.
// - THE INDONESIAN DIPLOMA ROUTE: homeschooled students obtain the
//   state ijazah through the equivalency exams — Paket A (SD), Paket
//   B (SMP), Paket C (SMA) — usually via a PKBM (community learning
//   centre). Since 2024 Paket C graduates have been treated on the
//   same footing as SMA graduates for state university entry.
// - INTERNATIONAL QUALIFICATIONS: an Indonesian citizen using a
//   foreign diploma (IGCSE/A-Level, IB, US, OSSD) for an Indonesian
//   university or the civil service needs ijazah equivalence
//   (penyetaraan ijazah) from the Ministry. Say so; refer families
//   to the Ministry for the current procedure.
// - SPK SCHOOLS (Satuan Pendidikan Kerjasama) are the licensed
//   "international" schools; Indonesian students in them also take
//   Indonesian language, religion and civics.
// - COMPULSORY EDUCATION: nine years of basic education (wajib
//   belajar), ages 7-15. Homeschooling is a lawful way to meet it.
// - Do NOT claim Smartious is a PKBM, an SPK or registered with any
//   Dinas. Do not claim accreditation.
// MARKET: Jakarta holds the largest international tier (JIS, British
// School Jakarta, ACG, Sinarmas World Academy and many more); Bali has
// a large expatriate, remote-work and homeschooling community; Batam
// sits 45 minutes by ferry from Singapore.
// TIMEZONE: WIB (UTC+7) in Java and Sumatra; WITA (UTC+8) in Bali;
// WIT (UTC+9) in Papua. Jakarta is 4 hours ahead of Nairobi EAT.
// ═══════════════════════════════════════════════════════════════════

const LAW_FAQ = { q: 'Is homeschooling legal in Indonesia?', a: 'Yes. Law No. 20/2003 on the National Education System recognises informal education run by the family, and Permendikbud No. 129/2014 sets out homeschooling (sekolahrumah) in three forms: single-family, multi-family and community. Single and multi-family homeschools register with the district or city education office (Dinas Pendidikan). For an Indonesian state diploma, students sit the Paket A, B or C equivalency exams, usually through a PKBM.' }
const ROUTES_FAQ = { q: 'Can an Indonesian student use IGCSE or A-Level for an Indonesian university?', a: 'Yes, with ijazah equivalence (penyetaraan ijazah) from the Ministry, which Indonesian citizens need when they use a foreign diploma at home. Families who want to keep both doors open often add the Paket C exam. For universities abroad — Singapore, Australia, Malaysia, the UK, the US or Canada — Cambridge A-Level, the IB Diploma and AP are accepted directly.' }
const FEES_FAQ = { q: 'How much does Smartious cost?', a: 'From USD 423/month for Primary, varying by curriculum and level. One-to-one tuition is USD 15/hour. Admission starts with a placement assessment.' }
const SUBJECTS = [
  'Primary (Years 1-6): English, Maths, Science and more',
  'Cambridge Lower Secondary and IGCSE',
  'Cambridge AS and A-Level',
  'Pearson Edexcel International GCSE and A-Level',
  'IB Diploma Programme',
  'American curriculum with AP',
  'Ontario OSSD through our Ontario partner school',
  'SAT, IELTS and TOEFL preparation; one-to-one tuition',
]
const CURRICULA = {
  cambridge: 'Cambridge Primary, Lower Secondary, IGCSE and A-Level — the main route for Indonesian and expatriate families.',
  cbc: 'Kenya CBC available for Kenyan families in Indonesia.',
  ib: 'IB Diploma Programme.',
  american: 'American curriculum with AP, for families aiming at US universities.',
}
const HOMESCHOOL = 'Homeschooling (sekolahrumah) is lawful in Indonesia under Law No. 20/2003 and Permendikbud No. 129/2014. A single-family homeschool registers with the district or city education office. For the Indonesian ijazah, students sit Paket A, B or C through a PKBM; for an international route, they sit Cambridge, Pearson or IB exams. Our timetable, records and reports support either.'
const ONLINE = 'Live online via the Smartious LMS, in small classes of 4-6. Classes run in the Indonesian afternoon (from about 1 PM WIB), with sessions recorded for review.'

export const INDONESIA_CITIES = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'jakarta-id',
    name: 'Jakarta',
    county: 'DKI Jakarta',
    region: 'Capital and largest city · about 11 million people (over 30 million in Jabodetabek) · corporate, diplomatic and energy headquarters · Indonesia\'s largest international-school tier',
    primaryKeyword: 'Online school and homeschooling in Jakarta',
    seoTitle: 'Online School & Homeschool in Jakarta, Indonesia | Smartious',
    heroTagline: 'For Jakarta families from Kemang and Pondok Indah to BSD, Kelapa Gading and PIK — live online Cambridge IGCSE and A-Level, IB, American AP and the OSSD, as homeschool or alongside school.',
    intro: 'Smartious teaches Jakarta families live online in small classes of 4-6 students. Homeschooling (sekolahrumah) is lawful in Indonesia: Law No. 20/2003 recognises education run by the family, and Permendikbud No. 129/2014 sets out how a family homeschool registers with the local education office. Jakarta has the country\'s largest international-school tier, but places are expensive, waitlists are long, and traffic makes a daily school run hard. Families use Smartious as a full homeschool programme, as a bridge while they wait for a place, or for one-to-one tuition alongside school. Indonesian families who want the state ijazah can add the Paket exams; families aiming abroad sit Cambridge or IB exams at centres in Jakarta.',
    altTexts: { hero: 'Online lessons for families in Jakarta, Indonesia' },
    seoDesc: 'Live online school and homeschooling for Jakarta families: Cambridge IGCSE and A-Level, IB, American AP and OSSD in small classes. Sekolahrumah and Paket C explained.',
    challenges: [
      'International-school places are expensive and oversubscribed at popular entry points, and the commute across Jakarta can take hours a day.',
      'Indonesian families choosing an international route need to plan ijazah equivalence (penyetaraan) or the Paket C exam if they may study at an Indonesian university.',
      'Expatriate families on two- to four-year postings need a curriculum that continues when they move on.',
      'Homeschooling families want a structured, teacher-led programme rather than self-study.',
      'Time zone: WIB (UTC+7), four hours ahead of Nairobi — classes run in the Jakarta afternoon.',
    ],
    familySituations: [
      'South Jakarta — Kemang, Pondok Indah, Cilandak, Kebayoran Baru, Senopati.',
      'Central Jakarta — Menteng, Kuningan, SCBD and Sudirman.',
      'North Jakarta — Kelapa Gading, Pantai Indah Kapuk (PIK).',
      'Tangerang and BSD City, Bintaro, Alam Sutera.',
      'Bekasi, Cikarang industrial estates and Bogor.',
      'Indonesian families who already homeschool and want live teachers.',
      'Expatriate corporate, energy and diplomatic families on rotation.',
      'Families waiting for an international-school place.',
      'Young athletes and performers with demanding schedules.',
      'Students preparing for universities in Singapore, Australia, the UK or the US.',
    ],
    nearbyAreas: ['Kemang', 'Pondok Indah', 'Cilandak', 'Kebayoran Baru', 'Menteng', 'Kuningan', 'Kelapa Gading', 'PIK', 'BSD City', 'Bintaro', 'Alam Sutera', 'Bekasi', 'Cikarang', 'Bogor', 'Depok'],
    subjects: SUBJECTS,
    whyChoose: [
      ['Live teachers, not self-study', 'Small live classes of 4-6 students, with homework after every lesson and weekly reports.'],
      ['No school run', 'Learn at home across Jabodetabek, without hours in Jakarta traffic.'],
      ['One route wherever you move', 'Cambridge, IB and AP continue unchanged if the family is posted elsewhere.'],
      ['Both doors open', 'International qualifications for universities abroad, with advice on Paket C and penyetaraan for Indonesian universities.'],
      ['Clear fees', 'From USD 423/month (Primary), varying by curriculum and level. Tuition from USD 15/hour.'],
    ],
    growingReason: 'Jakarta is Indonesia\'s capital and economic centre, home to corporate, energy and diplomatic headquarters and the country\'s largest international-school tier. Homeschooling has grown since 2020, and many families want a structured, teacher-led option without the cost and commute of a campus school.',
    curricula: CURRICULA,
    homeschoolDetail: HOMESCHOOL,
    homeTuitionDetail: 'Online one-to-one tuition from USD 15/hour for IGCSE, A-Level, IB and AP subjects.',
    onlineLearningDetail: ONLINE,
    faqs: [
      LAW_FAQ,
      { q: 'Where do Jakarta students sit Cambridge exams?', a: 'As private candidates through the British Council in Indonesia or at Cambridge schools in Jakarta that accept private candidates, in the May/June and October/November series. We help each family plan entries early.' },
      ROUTES_FAQ,
      FEES_FAQ,
    ],
  },
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'bali-id',
    name: 'Bali',
    county: 'Bali Province',
    region: 'Island province · Denpasar, Canggu, Ubud, Sanur, Seminyak and Uluwatu · large expatriate and remote-work community · WITA (UTC+8)',
    primaryKeyword: 'Online school and homeschooling in Bali',
    seoTitle: 'Online School & Homeschool in Bali, Indonesia | Smartious',
    heroTagline: 'For Bali families in Canggu, Ubud, Sanur, Seminyak, Uluwatu and Denpasar — live online Cambridge IGCSE and A-Level, IB and American AP, with real teachers on Bali time.',
    intro: 'Smartious teaches Bali families live online in small classes of 4-6 students. Bali has one of the largest homeschooling and "worldschooling" communities in Asia: expatriate families, remote workers and Indonesian families who want something different from a campus school. Many start with self-paced courses and then look for live teachers as their child moves towards IGCSE and A-Level. We teach Primary through A-Level, the IB, the American curriculum with AP and the OSSD through our Ontario partner school. Homeschooling is lawful in Indonesia under Law No. 20/2003 and Permendikbud No. 129/2014. Foreign families should also check the rules of their home country and the terms of their visa.',
    altTexts: { hero: 'Online lessons for families in Bali, Indonesia' },
    seoDesc: 'Live online school and homeschooling for Bali families in Canggu, Ubud, Sanur and Uluwatu: Cambridge IGCSE and A-Level, IB and American AP with real teachers.',
    challenges: [
      'International schools in Bali are few and fill quickly, and the best fit may be far from where the family lives.',
      'Self-paced courses work for some children but not for every teenager approaching IGCSE and A-Level.',
      'Exam entries need planning: Cambridge and Pearson exams are taken at authorised centres, which may mean travel to Jakarta or a Bali centre that accepts private candidates.',
      'Families move on: a qualification that continues in Australia, Europe or the Americas matters.',
      'Time zone: WITA (UTC+8), five hours ahead of Nairobi — classes run in the Bali afternoon.',
    ],
    familySituations: [
      'Canggu, Berawa, Pererenan and Seminyak families.',
      'Ubud and Gianyar families.',
      'Sanur, Denpasar and Renon families.',
      'Uluwatu, Jimbaran and Nusa Dua families.',
      'Remote-working and digital-nomad families.',
      'Worldschooling families travelling between Bali and other countries.',
      'Indonesian families in Bali choosing an international route.',
      'Families moving from self-paced study to live teachers.',
    ],
    nearbyAreas: ['Canggu', 'Berawa', 'Pererenan', 'Seminyak', 'Kerobokan', 'Ubud', 'Sanur', 'Denpasar', 'Jimbaran', 'Uluwatu', 'Nusa Dua', 'Tabanan', 'Lombok'],
    subjects: SUBJECTS,
    whyChoose: [
      ['Real teachers for the exam years', 'Live classes, marked homework and weekly reports as your child approaches IGCSE and A-Level.'],
      ['Learn anywhere on the island — or off it', 'Lessons follow the family if you travel.'],
      ['A route that travels', 'Cambridge, IB and AP are recognised in Australia, Europe, Asia and the Americas.'],
      ['Clear fees', 'From USD 423/month (Primary), varying by curriculum and level. Tuition from USD 15/hour.'],
    ],
    growingReason: 'Bali has a large and growing international community of families, remote workers and long-stay residents, and one of Asia\'s most active homeschooling scenes. As children reach the exam years, families look for live, structured teaching that leads to recognised qualifications.',
    curricula: CURRICULA,
    homeschoolDetail: HOMESCHOOL + ' Foreign families should also check their home country\'s rules and their visa conditions.',
    homeTuitionDetail: 'Online one-to-one tuition from USD 15/hour.',
    onlineLearningDetail: 'Live online via the Smartious LMS, in small classes of 4-6. Classes run in the Bali afternoon (WITA, UTC+8), with sessions recorded for review.',
    faqs: [
      LAW_FAQ,
      { q: 'We are foreign residents in Bali. Can we homeschool?', a: 'Many foreign families in Bali homeschool. Check the rules of your home country (especially if you plan to return) and the conditions of your visa, and keep records of your child\'s learning. Smartious provides a timetable, marked work and reports for every student.' },
      { q: 'Where can a Bali student sit IGCSE or A-Level exams?', a: 'As a private candidate at an authorised Cambridge or Pearson centre that accepts them — some families sit in Bali, others travel to Jakarta. Book early for the May/June and October/November series; we help plan entries.' },
      FEES_FAQ,
    ],
  },
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'surabaya-id',
    name: 'Surabaya',
    county: 'East Java',
    region: 'Second city of Indonesia · about 3 million people · East Java\'s port, trade and industrial centre · Universitas Airlangga and ITS',
    primaryKeyword: 'Online school and homeschooling in Surabaya',
    seoTitle: 'Online School & Homeschool in Surabaya, Indonesia | Smartious',
    heroTagline: 'For Surabaya and East Java families in Citraland, Pakuwon, Darmo and Sidoarjo — live online Cambridge IGCSE and A-Level, IB and American AP in small classes.',
    intro: 'Smartious teaches Surabaya and East Java families live online in small classes of 4-6 students. Surabaya is Indonesia\'s second city and a centre of trade, shipping and industry, with a strong Cambridge-school tradition among its national-plus and international schools. Families use Smartious as a full homeschool programme under Indonesia\'s sekolahrumah rules, alongside school for subjects their school does not offer, or for one-to-one exam preparation. Indonesian families who want the state ijazah can add the Paket exams; those aiming abroad sit Cambridge exams at centres in Surabaya or Jakarta.',
    altTexts: { hero: 'Online lessons for families in Surabaya, Indonesia' },
    seoDesc: 'Live online school and homeschooling for Surabaya and East Java families: Cambridge IGCSE and A-Level, IB and American AP in small classes. Sekolahrumah explained.',
    challenges: [
      'Good international and Cambridge schools are concentrated in a few districts and fill early.',
      'Some subjects at A-Level (Further Mathematics, Computer Science, Economics) are hard to find locally.',
      'Indonesian families on an international route need to plan Paket C or penyetaraan for Indonesian universities.',
      'Time zone: WIB (UTC+7), four hours ahead of Nairobi.',
    ],
    familySituations: [
      'West Surabaya — Citraland, Pakuwon Indah, Graha Family.',
      'Central and South Surabaya — Darmo, Gubeng, Dharmahusada.',
      'Sidoarjo and Gresik families.',
      'Malang families in the East Java highlands.',
      'Business and trading families planning study in Singapore, Australia or China.',
      'Families already homeschooling who want live teachers.',
    ],
    nearbyAreas: ['Citraland', 'Pakuwon Indah', 'Graha Family', 'Darmo', 'Gubeng', 'Dharmahusada', 'Kenjeran', 'Sidoarjo', 'Gresik', 'Malang', 'Batu'],
    subjects: ["Cambridge IGCSE Mathematics, Additional Mathematics, Physics and Chemistry for Surabaya's strong STEM students", "Cambridge A-Level Further Mathematics, Computer Science and Economics, which few East Java schools timetable", "Business and Accounting for trading and manufacturing families planning a family-business future", "Mandarin Chinese support alongside Cambridge English for families with links to China and Singapore", "IB Diploma and American AP for students aiming at universities abroad", "IELTS and SAT preparation before applications to Singapore, Australia and the US"],
    whyChoose: [
      ['The subjects your school lacks', 'Further Mathematics, Computer Science, Economics and more, taught live.'],
      ['Small live classes', 'Groups of 4-6 students, with homework, marking and weekly reports.'],
      ['Both doors open', 'International qualifications, with advice on Paket C and penyetaraan.'],
      ['Clear fees', 'From USD 423/month (Primary), varying by curriculum and level. Tuition from USD 15/hour.'],
    ],
    growingReason: 'Surabaya is Indonesia\'s second city and East Java\'s commercial centre. Its families have long chosen Cambridge qualifications, and many now want live online teaching for homeschooling or for subjects local schools do not offer.',
    curricula: CURRICULA,
    homeschoolDetail: "East Java families who homeschool register their sekolahrumah tunggal with the Dinas Pendidikan of Kota Surabaya, Sidoarjo, Gresik or Malang, depending on where they live. Children who want the state ijazah later enrol with a PKBM for Paket B or Paket C; children on the Cambridge route sit IGCSE and A-Level as private candidates. Our weekly reports and marked work give the Dinas or PKBM a clear record of what your child has covered.",
    homeTuitionDetail: "One-to-one online sessions from USD 15/hour, popular with Surabaya students at national-plus schools who need extra help with Cambridge Mathematics or Physics before the May/June series.",
    onlineLearningDetail: "Classes start from about 1 PM WIB, after Surabaya's morning heat and traffic, and every lesson is recorded so a student who misses one because of a family trip to Malang or Bali can catch up the same evening.",
    faqs: [
      { q: "We live in Surabaya. Who do we register our homeschool with?", a: "With the education office (Dinas Pendidikan) of the city or regency where you live: Kota Surabaya, Sidoarjo, Gresik or Malang. Each office sets its own process, so ask what it needs and keep a copy of what you hand in." },
      { q: "Can my child take only A-Level subjects their school does not offer?", a: "Yes. Many Surabaya students stay at their school and take one or two subjects with us, such as Further Mathematics or Computer Science, then sit them as private candidates." },
      { q: "Our family business trades with China and Singapore. Which route suits a child who may study there?", a: "Cambridge A-Level is well known to universities in Singapore and accepted by many in China and Hong Kong. We advise each family on subject choices for the courses they have in mind." },
      { q: "What does Smartious cost for a Surabaya family?", a: "From USD 423/month for Primary, varying by curriculum and level, invoiced in USD. One-to-one tuition is USD 15/hour." },
    ],
  },
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'bandung-id',
    name: 'Bandung',
    county: 'West Java',
    region: 'West Java\'s capital · about 2.5 million people · ITB and Universitas Padjadjaran · technology, textile and creative industries',
    primaryKeyword: 'Online school and homeschooling in Bandung',
    seoTitle: 'Online School & Homeschool in Bandung, Indonesia | Smartious',
    heroTagline: 'For Bandung and West Java families in Dago, Setiabudi, Pasteur and Kota Baru Parahyangan — live online Cambridge IGCSE and A-Level, IB and American AP.',
    intro: 'Smartious teaches Bandung families live online in small classes of 4-6 students. Bandung is a university city, home to the Institut Teknologi Bandung (ITB) and Universitas Padjadjaran, and has an active homeschooling community. Families use Smartious as a full homeschool programme under Indonesia\'s sekolahrumah rules, or alongside school for Cambridge and A-Level subjects. Indonesian families who want the state ijazah can add the Paket exams; students aiming at universities abroad sit Cambridge or IB exams at authorised centres.',
    altTexts: { hero: 'Online lessons for families in Bandung, Indonesia' },
    seoDesc: 'Live online school and homeschooling for Bandung and West Java families: Cambridge IGCSE and A-Level, IB and American AP in small classes on WIB time.',
    challenges: [
      'International-curriculum options in Bandung are fewer than in Jakarta.',
      'Strong STEM students want A-Level Mathematics, Further Mathematics and Physics taught by specialists.',
      'Indonesian families on an international route need to plan Paket C or penyetaraan for Indonesian universities such as ITB.',
      'Time zone: WIB (UTC+7), four hours ahead of Nairobi.',
    ],
    familySituations: [
      'North Bandung — Dago, Setiabudi, Lembang.',
      'Pasteur, Sukajadi and Cihampelas families.',
      'Kota Baru Parahyangan and Padalarang.',
      'Cimahi families.',
      'University staff families at ITB and Universitas Padjadjaran.',
      'Families already homeschooling who want live teachers.',
    ],
    nearbyAreas: ['Dago', 'Setiabudi', 'Lembang', 'Pasteur', 'Sukajadi', 'Cihampelas', 'Buah Batu', 'Kota Baru Parahyangan', 'Padalarang', 'Cimahi'],
    subjects: ["Cambridge A-Level Mathematics, Further Mathematics and Physics for students aiming at engineering, including ITB", "Cambridge IGCSE Computer Science and A-Level Computer Science for Bandung's tech-minded students", "Art and Design and English Literature for students drawn to Bandung's creative industries", "Cambridge Primary and Lower Secondary for younger children in homeschooling families", "IB Diploma and American AP routes for universities abroad", "SAT and IELTS preparation"],
    whyChoose: [
      ['Specialist STEM teaching', 'A-Level Mathematics, Further Mathematics and Physics led by subject specialists.'],
      ['Small live classes', 'Groups of 4-6 students, with homework, marking and weekly reports.'],
      ['Both doors open', 'International qualifications, with advice on Paket C and penyetaraan.'],
      ['Clear fees', 'From USD 423/month (Primary), varying by curriculum and level. Tuition from USD 15/hour.'],
    ],
    growingReason: 'Bandung is one of Indonesia\'s leading university cities, with a large professional and academic population and an active homeschooling community that wants structured, internationally recognised qualifications.',
    curricula: CURRICULA,
    homeschoolDetail: "Bandung has one of Java's most active homeschooling communities, and families register their homeschool with the Dinas Pendidikan of Kota Bandung, Kota Cimahi or Kabupaten Bandung Barat. Families who want their child to apply to ITB or Universitas Padjadjaran with an Indonesian ijazah plan Paket C through a local PKBM; families on the Cambridge route plan penyetaraan instead, or take both.",
    homeTuitionDetail: "Online one-to-one sessions from USD 15/hour, often booked by Bandung students preparing for A-Level Mathematics and Physics exams.",
    onlineLearningDetail: "Lessons run on WIB time from about 1 PM, which fits families in cooler North Bandung and Lembang who use the morning for projects, sport or the community activities Bandung homeschoolers are known for.",
    faqs: [
      { q: "Can a homeschooled Bandung student apply to ITB?", a: "Yes, through the national selection routes. A student with a Paket C ijazah applies like an SMA graduate; a student with only foreign qualifications needs penyetaraan from the Ministry first. Check ITB's current admission rules for your year." },
      { q: "Is there a homeschooling community in Bandung?", a: "Yes, Bandung has a well-established homeschooling scene, with family groups and PKBMs. Many families combine local activities with live online classes for the academic subjects." },
      { q: "Which Smartious subjects suit a future engineer?", a: "Cambridge A-Level Mathematics, Further Mathematics and Physics, plus Computer Science or Chemistry depending on the course." },
      { q: "How much is Smartious for families in Bandung?", a: "From USD 423/month for Primary, varying by curriculum and level. One-to-one tuition is USD 15/hour." },
    ],
  },
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'batam-id',
    name: 'Batam',
    county: 'Riau Islands',
    region: 'Free trade zone island · about 45 minutes by ferry from Singapore · shipyards, electronics and manufacturing · Riau Islands',
    primaryKeyword: 'Online school and homeschooling in Batam',
    seoTitle: 'Online School & Homeschool in Batam, Indonesia | Smartious',
    heroTagline: 'For Batam and Riau Islands families in Nagoya, Batam Centre, Sekupang and Nongsa — live online Cambridge IGCSE and A-Level, IB and American AP, a ferry ride from Singapore.',
    intro: 'Smartious teaches Batam families live online in small classes of 4-6 students. Batam sits in the Singapore orbit: many families work with Singapore companies, shipyards and factories, and plan for universities in Singapore, Malaysia or Australia. International-curriculum options on the island are limited, so families use Smartious as a full homeschool programme under Indonesia\'s sekolahrumah rules or alongside school. Students sit Cambridge exams at authorised centres in Batam, Jakarta or Singapore.',
    altTexts: { hero: 'Online lessons for families in Batam, Indonesia' },
    seoDesc: 'Live online school and homeschooling for Batam and Riau Islands families: Cambridge IGCSE and A-Level, IB and American AP, with routes to Singapore universities.',
    challenges: [
      'Few international-curriculum schools on the island.',
      'Families planning for Singapore, Malaysian or Australian universities need Cambridge A-Level or the IB.',
      'Exam entries may need travel to a centre in Jakarta or Singapore; we help plan this early.',
      'Time zone: WIB (UTC+7), four hours ahead of Nairobi.',
    ],
    familySituations: [
      'Nagoya, Batam Centre and Baloi families.',
      'Sekupang, Tiban and Batu Aji families.',
      'Nongsa families.',
      'Bintan and Tanjung Pinang families.',
      'Shipyard, manufacturing and engineering families, local and expatriate.',
      'Families working with Singapore companies.',
    ],
    nearbyAreas: ['Nagoya', 'Batam Centre', 'Baloi', 'Sekupang', 'Tiban', 'Batu Aji', 'Nongsa', 'Bintan', 'Tanjung Pinang', 'Karimun'],
    subjects: ["Cambridge IGCSE and A-Level in the subjects Singapore universities ask for, including Mathematics, Physics, Chemistry and Economics", "Cambridge English to the level needed for Singapore and Australian admissions", "A-Level Further Mathematics and Engineering-related Physics for shipyard and engineering families", "Pearson Edexcel International A-Level as an alternative exam board", "IB Diploma for students moving to IB schools in Singapore", "IELTS preparation for university applications"],
    whyChoose: [
      ['The route to Singapore and beyond', 'Cambridge A-Level and the IB are the qualifications universities in Singapore, Malaysia and Australia know best.'],
      ['Specialist teachers on the island', 'Live classes bring IGCSE and A-Level specialists to Batam.'],
      ['Small live classes', 'Groups of 4-6 students, with homework, marking and weekly reports.'],
      ['Clear fees', 'From USD 423/month (Primary), varying by curriculum and level. Tuition from USD 15/hour.'],
    ],
    growingReason: 'Batam is an industrial free-trade island in the Singapore orbit, with many families planning study across the strait. International-curriculum schooling on the island is limited, so live online teaching fills the gap.',
    curricula: CURRICULA,
    homeschoolDetail: "Batam families register a homeschool with the Dinas Pendidikan of Kota Batam (or of Bintan or Tanjung Pinang for families on the neighbouring islands). Because so many Batam students head to Singapore or Malaysia, most choose the Cambridge route and plan exam entries in Batam, Jakarta or Singapore; families who also want an Indonesian ijazah add Paket C through a PKBM.",
    homeTuitionDetail: "One-to-one online tuition from USD 15/hour, including focused preparation for Singapore university admission subjects.",
    onlineLearningDetail: "Classes run in the WIB afternoon, an hour behind Singapore time, so students follow the same rhythm as their friends across the strait and still have evenings free.",
    faqs: [
      { q: "Can a Batam student sit Cambridge exams in Singapore?", a: "Some families do, at centres in Singapore that accept private candidates; others sit in Batam or Jakarta. Check the centre's rules for foreign private candidates, its deadlines and fees, and plan travel for each paper." },
      { q: "Will Singapore universities accept Cambridge A-Levels from a homeschooled student in Batam?", a: "Singapore universities admit international applicants with Cambridge A-Level, the IB Diploma and other recognised qualifications. Requirements vary by course, so check each university's international admissions pages early." },
      { q: "Who do Batam families register a homeschool with?", a: "The Dinas Pendidikan of Kota Batam, or of Bintan or Tanjung Pinang for families living there." },
      { q: "What does Smartious cost in Batam?", a: "From USD 423/month for Primary, varying by curriculum and level. One-to-one tuition is USD 15/hour." },
    ],
  },
  // ─────────────────────────────────────────────────────────────────
  {
    slug: 'yogyakarta-id',
    name: 'Yogyakarta',
    county: 'Special Region of Yogyakarta',
    region: 'Special Region and student city · Universitas Gadjah Mada (UGM) · culture, tourism and education · near Borobudur and Prambanan',
    primaryKeyword: 'Online school and homeschooling in Yogyakarta',
    seoTitle: 'Online School & Homeschool in Yogyakarta, Indonesia | Smartious',
    heroTagline: 'For Yogyakarta and Central Java families in Sleman, Bantul and the city — live online Cambridge IGCSE and A-Level, IB and American AP in small classes.',
    intro: 'Smartious teaches Yogyakarta and Central Java families live online in small classes of 4-6 students. Yogyakarta is Indonesia\'s best-known student city, home to Universitas Gadjah Mada, with academic, NGO and expatriate families and a growing homeschooling community. Families use Smartious as a full homeschool programme under Indonesia\'s sekolahrumah rules, or alongside school for Cambridge and A-Level subjects. Indonesian families who want the state ijazah can add the Paket exams.',
    altTexts: { hero: 'Online lessons for families in Yogyakarta, Indonesia' },
    seoDesc: 'Live online school and homeschooling for Yogyakarta and Central Java families: Cambridge IGCSE and A-Level, IB and American AP in small classes on WIB time.',
    challenges: [
      'Few international-curriculum schools outside Jakarta, Bali and Surabaya.',
      'Academic and NGO families on fixed-term contracts need a curriculum that continues when they move.',
      'Indonesian families on an international route need to plan Paket C or penyetaraan.',
      'Time zone: WIB (UTC+7), four hours ahead of Nairobi.',
    ],
    familySituations: [
      'Sleman and Depok (Yogyakarta) families near UGM.',
      'City centre and Kotagede families.',
      'Bantul families.',
      'Solo (Surakarta) and Semarang families in Central Java.',
      'University, research and NGO families.',
      'Families already homeschooling who want live teachers.',
    ],
    nearbyAreas: ['Sleman', 'Depok (Sleman)', 'Kaliurang', 'Kotagede', 'Bantul', 'Kulon Progo', 'Magelang', 'Klaten', 'Solo', 'Semarang'],
    subjects: ["Cambridge IGCSE and A-Level History, Sociology and English Literature for students drawn to Yogyakarta's humanities tradition", "Cambridge A-Level Biology and Chemistry for students aiming at medicine, including UGM", "Cambridge Primary for younger children of university and NGO families", "Global Perspectives and research skills for students interested in development studies", "IB Diploma and American AP for universities abroad", "IELTS and TOEFL preparation"],
    whyChoose: [
      ['International routes outside the big cities', 'Cambridge, IB and AP taught live wherever you live in Central Java.'],
      ['Small live classes', 'Groups of 4-6 students, with homework, marking and weekly reports.'],
      ['Both doors open', 'International qualifications, with advice on Paket C and penyetaraan.'],
      ['Clear fees', 'From USD 423/month (Primary), varying by curriculum and level. Tuition from USD 15/hour.'],
    ],
    growingReason: 'Yogyakarta is a centre of education and culture with a large academic and NGO population. International-curriculum schooling is limited outside Indonesia\'s biggest cities, so live online teaching gives these families a structured route.',
    curricula: CURRICULA,
    homeschoolDetail: "Families in Yogyakarta register a homeschool with the Dinas Pendidikan of Kota Yogyakarta, Sleman, Bantul or Kulon Progo, depending on where they live. Children of Indonesian academics who expect to study at UGM often plan Paket C alongside an international route; children of foreign researchers and NGO staff usually follow Cambridge or IB so they can re-join school in their home country.",
    homeTuitionDetail: "Online one-to-one sessions from USD 15/hour, often used by Yogyakarta students preparing for A-Level sciences.",
    onlineLearningDetail: "Lessons run in the WIB afternoon from about 1 PM, leaving mornings for the visits to museums, the kraton, Borobudur and Prambanan that make Yogyakarta a good place to learn.",
    faqs: [
      { q: "We are a researcher family in Yogyakarta for two years. Which route makes returning home easiest?", a: "Cambridge or the IB, which most school systems recognise. Keep our reports and samples of work so the next school can place your child at the right level." },
      { q: "Can a homeschooled student apply to UGM?", a: "Yes, through the national selection routes. With a Paket C ijazah a student applies like an SMA graduate; with only foreign qualifications, penyetaraan from the Ministry is needed first." },
      { q: "Who registers a homeschool in Yogyakarta?", a: "The Dinas Pendidikan of the city or regency where you live: Kota Yogyakarta, Sleman, Bantul or Kulon Progo." },
      { q: "How much does Smartious cost in Yogyakarta?", a: "From USD 423/month for Primary, varying by curriculum and level. One-to-one tuition is USD 15/hour." },
    ],
  },
]

export const INDONESIA_CITIES_LIST = INDONESIA_CITIES.map(c => ({
  slug: c.slug,
  name: c.name,
  county: c.county,
}))

// ═══════════════════════════════════════════════════════════════════
// INDONESIA COUNTRY-LEVEL OBJECT
// Consumed by CountryHub.jsx for /online-school/indonesia
// ═══════════════════════════════════════════════════════════════════
export const INDONESIA_COUNTRY = {
  slug: 'indonesia',
  name: 'Indonesia',
  longName: 'Republic of Indonesia',
  adjective: 'Indonesian',
  flag: '🇮🇩',
  hub: '/online-school/indonesia',
  hubPageId: 'homeschooling-indonesia',
  cityPageId: 'indonesia-city',

  currency: 'IDR',
  currencyName: 'Indonesian Rupiah',
  currencyPeg: 'Fees are invoiced in USD; the rupiah amount depends on the exchange rate on the day of payment.',

  timezone: { code: 'WIB', name: 'Western Indonesia Time (WIB, UTC+7); Bali WITA (UTC+8)', utcOffset: 7, offsetFromEAT: 4 },

  examCentres: [
    'British Council Indonesia (Jakarta) — Cambridge private candidates in the May/June and October/November series',
    'Cambridge schools in Jakarta, Surabaya, Bandung, Bali and Batam that accept private candidates, confirmed per session',
    'Pearson Edexcel approved centres for International GCSE and A-Level',
    'College Board AP and SAT test centres at international schools',
  ],
  examCentreTiles: [
    { city: 'Jakarta', centre: 'British Council and Cambridge schools', area: 'The main centre for private candidates.' },
    { city: 'Surabaya, Bandung, Bali, Batam', centre: 'Cambridge and Pearson schools', area: 'Confirmed per family, per exam series.' },
    { city: 'Singapore', centre: 'Option for Batam families', area: 'A ferry ride from Batam.' },
  ],
  examLogisticsProse: 'Smartious students in Indonesia sit Cambridge International and Pearson Edexcel exams as private candidates — through the British Council in Jakarta or at schools that accept private candidates in Jakarta, Surabaya, Bandung, Bali and Batam. Cambridge exams run in May/June and October/November. Centres set their own deadlines and fees, so we plan entries with each family well ahead.',
  secondaryProgrammeExamRef: 'British Council Indonesia and Cambridge centres',
  finalCTABadgeExamRef: 'Exam centres in Jakarta, Surabaya, Bandung, Bali and Batam',

  heroImage: '',
  heroEyebrow: 'Online school and homeschool for Indonesia',
  heroH1Suffix: 'Indonesia',
  heroSubhead: 'Live online Cambridge IGCSE and A-Level, Pearson Edexcel, IB Diploma, American AP and the OSSD through our Ontario partner school, for Indonesian, expatriate and returning families across Jakarta, Bali, Surabaya, Bandung, Batam and Yogyakarta.',
  heroValueProp: 'From USD 423/month (Primary), varying by curriculum and level. Small live classes of 4-6 students, homework after every lesson and weekly reports.',
  whatsappTrigger: 'Hi, I would like to enquire about Smartious for our family in Indonesia',

  citiesSectionTitle: 'Where our Indonesia families are',
  citiesSectionBody: 'We teach families across Indonesia, with pages for Jakarta and Jabodetabek, Bali, Surabaya and East Java, Bandung and West Java, Batam and the Riau Islands, and Yogyakarta and Central Java. Families in Medan, Makassar, Balikpapan, Semarang, Lombok and everywhere else join the same live classes online.',

  trustSignals: [
    { metric: 'Founded', value: '2018', sub: 'Nairobi head office' },
    { metric: 'Countries served', value: '40+', sub: 'Asia · Africa · Gulf · Europe · Americas' },
    { metric: 'Class size', value: '4-6', sub: 'Live small groups' },
    { metric: 'Live class window', value: 'WIB afternoon', sub: 'From about 1 PM Jakarta time' },
    { metric: 'Fees', value: 'From USD 423', sub: 'Per month (Primary)' },
  ],

  universitiesInCountry: 'Indonesian universities include Universitas Indonesia (UI), Institut Teknologi Bandung (ITB), Universitas Gadjah Mada (UGM), Universitas Airlangga, Institut Teknologi Sepuluh Nopember (ITS), IPB University and BINUS University, alongside international programmes such as Monash University Indonesia.',
  universityChannels: 'Indonesian state universities admit through national selection (SNBP, SNBT) and their own routes. Indonesian citizens with a foreign diploma need ijazah equivalence (penyetaraan) from the Ministry; Paket C graduates can apply like SMA graduates. Universities abroad — in Singapore, Malaysia, Australia, the UK, the US and Canada — accept Cambridge A-Level, the IB Diploma and AP directly, subject to course requirements.',
  cambridgeCardDescription: 'Our main programme for Indonesian families: Cambridge Primary, Lower Secondary, IGCSE and A-Level, taught live in small groups, with exams at Cambridge centres in Indonesia.',
  britishCurriculumSuits: 'Families who homeschool, families waiting for an international-school place, students who need subjects their school lacks, and students aiming at universities in Singapore, Australia, Malaysia or the UK.',
  britishCurriculumDelivery: 'Live online classes in the Indonesian afternoon, small groups of 4-6 students, with exams through the British Council or Cambridge schools in Indonesia.',
  ibDiplomaSuits: 'Students who want the IB Diploma\'s breadth, including those moving from an IB school.',
  ibDiplomaDelivery: 'Live online IB DP classes across the six subject groups, with Theory of Knowledge and Extended Essay supervision.',
  americanCurriculumSuits: 'Families aiming at US universities through the Common Application.',
  americanCurriculumDelivery: 'American curriculum with AP courses, Grades 9-12, with SAT preparation and college application support.',
  founderBioCountrySpecific: 'Alfred Ouko founded Smartious in Nairobi in 2018 to make international qualifications (Cambridge, IB, American, Ontario OSSD) accessible to families in more than 40 countries.',
  founderUniversitySpecialism: 'Alfred holds a BEd in Mathematics and Physics, and our A-Level and IB STEM subjects are led by subject specialists.',

  competitorsIntro: 'Indonesia\'s international schooling is led by SPK and international schools in Jakarta, Bali, Surabaya and Bandung, with many local homeschooling providers and PKBMs, and online schools from the UK and Australia. Campus schools offer a peer community we cannot replace; Smartious offers live small-group teaching at home at a fraction of the cost.',
  competitors: [
    { name: 'Jakarta Intercultural School (JIS)', city: 'Jakarta', curriculum: 'American + IB', feesAed: 'Premium tier', feesUsd: 'Premium tier', rating: 'Long-established international school', capacityNote: 'Competitive admissions' },
    { name: 'British School Jakarta', city: 'Tangerang Selatan (Bintaro)', curriculum: 'British + IB', feesAed: 'Premium tier', feesUsd: 'Premium tier', rating: 'Established British international school', capacityNote: 'Structured admissions' },
    { name: 'Bali international schools', city: 'Bali', curriculum: 'IB, British and own curricula', feesAed: 'Premium tier', feesUsd: 'Premium tier', rating: 'Several campuses across the island', capacityNote: 'Places fill quickly' },
    { name: 'Local homeschooling providers and PKBMs', city: 'Nationwide', curriculum: 'National curriculum, Paket A/B/C', feesAed: 'Varies', feesUsd: 'Varies', rating: 'The Indonesian diploma route', capacityNote: 'Mostly Indonesian-language' },
    { name: 'UK online schools (self-paced and live)', city: 'Online', curriculum: 'Cambridge / British', feesAed: 'Varies', feesUsd: 'Varies', rating: 'UK time zone', capacityNote: 'Lessons often outside the Indonesian day' },
    { name: 'Smartious (live online)', city: 'All of Indonesia via online delivery', curriculum: 'Cambridge IGCSE & A-Level · Edexcel · IB · American AP · OSSD', feesAed: 'From USD 423/month (Primary)', feesUsd: 'From USD 423/month (Primary)', rating: 'Live online · small classes · Indonesian afternoon', capacityNote: 'Admission by placement assessment', isUs: true },
  ],

  legalFrameworkIntro: 'Indonesia is one of the more open countries in Asia for homeschooling. The law recognises education run by the family, sets out how a homeschool registers, and offers equivalency exams for the state diploma. Here is how it fits together.',
  legalFramework: [
    { h: 'Law No. 20/2003 on the National Education System', p: 'Indonesian law recognises formal, non-formal and informal education. Informal education is run by the family and the community (Article 27), and its results are recognised as equal to formal and non-formal education once the student passes an assessment against the national standard. Nine years of basic education are compulsory (wajib belajar), and homeschooling is a lawful way to meet it.' },
    { h: 'Permendikbud No. 129/2014 on Sekolahrumah', p: 'The Ministry regulation sets out three forms of homeschooling: tunggal (one family), majemuk (several families) and komunitas (a community group). Single and multi-family homeschools register with the district or city education office (Dinas Pendidikan kabupaten/kota). Check the current procedure with your local Dinas.' },
    { h: 'The Indonesian diploma: Paket A, B and C', p: 'Homeschooled students obtain the state ijazah by passing the equivalency exams — Paket A (primary, SD), Paket B (lower secondary, SMP) and Paket C (upper secondary, SMA) — usually through a PKBM community learning centre. Paket C graduates can apply to Indonesian state universities like SMA graduates.' },
    { h: 'International qualifications and penyetaraan', p: 'Indonesian citizens who use a foreign diploma (Cambridge, IB, American, OSSD) for an Indonesian university or the civil service need ijazah equivalence (penyetaraan) from the Ministry. Universities abroad accept these qualifications directly. Families who want both options often combine an international route with Paket C.' },
    { h: 'SPK and international schools', p: 'Licensed international schools in Indonesia are SPK schools (Satuan Pendidikan Kerjasama). Indonesian students at SPK schools also study Indonesian language, religion and civics. Smartious is not an SPK school; we teach online, as a homeschool programme or alongside school.' },
    { h: 'Foreign families', p: 'Expatriate families living in Indonesia commonly homeschool or use international schools. Check your home country\'s rules if you plan to return, and the conditions of your visa or KITAS.' },
  ],

  whySmartious: [
    { h: 'Live teachers, not self-study', p: 'Small live classes of 4-6 students, with homework after every lesson and weekly reports for parents.' },
    { h: 'Lessons in the Indonesian day', p: 'Classes run in the Indonesian afternoon (WIB), unlike UK online schools that teach on London time.' },
    { h: 'Both doors open', p: 'International qualifications for universities abroad, with clear advice on Paket C and penyetaraan for Indonesian universities.' },
    { h: 'Wherever you live', p: 'Jakarta, Bali, Surabaya, Bandung, Batam, Yogyakarta, or anywhere across the archipelago.' },
    { h: 'One route if you move', p: 'Cambridge, IB and AP continue unchanged for families on postings or moving abroad.' },
    { h: 'Clear fees', p: 'From USD 423/month (Primary), varying by curriculum and level. One-to-one tuition from USD 15/hour.' },
  ],

  faqs: [
    LAW_FAQ,
    { q: 'Do I need to register our homeschool?', a: 'Under Permendikbud No. 129/2014, single-family and multi-family homeschools register with the district or city education office (Dinas Pendidikan). Procedures vary locally, so check with your Dinas.' },
    { q: 'How does a homeschooled student get an Indonesian ijazah?', a: 'By passing the equivalency exams: Paket A for primary, Paket B for lower secondary and Paket C for upper secondary, usually through a PKBM. Paket C graduates can apply to Indonesian state universities like SMA graduates.' },
    ROUTES_FAQ,
    { q: 'Where do students in Indonesia sit Cambridge exams?', a: 'As private candidates through the British Council in Jakarta or at Cambridge schools in Jakarta, Surabaya, Bandung, Bali and Batam that accept them, in the May/June and October/November series. We help each family plan entries.' },
    { q: 'What time are the live classes?', a: 'In the Indonesian afternoon, from about 1 PM WIB (2 PM in Bali). Jakarta is four hours ahead of our Nairobi head office.' },
    { q: 'Is Smartious an SPK school or a PKBM?', a: 'No. Smartious is an online school based in Nairobi. Families use us as a homeschool programme or alongside a school; for the Indonesian ijazah, students sit Paket exams through a PKBM.' },
    FEES_FAQ,
  ],

  ctaH: 'Book an assessment for your child',
  ctaSubhead: 'Admission starts with a placement assessment. Submit the request form and our admissions team will be in touch to arrange it.',
}
