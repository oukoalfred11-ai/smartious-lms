/**
 * igcseAdmissions2027.js — /igcse-admissions-2027
 * "Years 10 and 11 IGCSE: Cambridge and Edexcel, live online": Cambridge
 * IGCSE and Pearson Edexcel International GCSE admissions for January 2027,
 * open to students anywhere in the world.
 *
 * Rendered by pages/AdmissionsPage.jsx and, as static HTML for search
 * engines, by scripts/seo-static.mjs. The banner is the school's own
 * artwork (public/admissions/igcse-2027-admissions.jpg).
 *
 * SUBJECTS are the IGCSE subjects in the school's database
 * (backend/src/routes/seed-subjects.js, curricula CambridgeIGCSE and
 * EdexcelIGCSE); backend/test/aLevelAdmissions.test.js fails if they drift.
 * Facts: Cambridge International registered school, Pearson Edexcel
 * approved centre; the January 2027 intake starts with Term 2 on
 * 5 January 2027; the one published fee; admissions through /assessment.
 */

export const IGCSE_2027 = {
  slug: 'igcse-admissions-2027',
  ctaH: 'Start Years 10 and 11 IGCSE',
  leadsHeading: 'Where IGCSEs lead',
  title: 'IGCSE Admissions 2027 | Cambridge & Edexcel, Live Online',
  desc: 'IGCSE admissions for January 2027: Cambridge IGCSE and Pearson Edexcel International GCSE for Years 10 and 11, taught live online, for students anywhere.',
  eyebrow: 'Admissions now open · January 2027 intake',
  h1: 'IGCSE admissions 2027: Years 10 and 11, Cambridge and Edexcel, live online',
  intro: 'The two years that build the grades for A Level and beyond, taught live by subject-specialist teachers, wherever your family lives. Smartious admits Year 10 and Year 11 students for January 2027 on two routes: Cambridge IGCSE and Pearson Edexcel International GCSE. Students join from Africa, the Gulf, Europe, Asia and the Americas, follow one timetable with their teachers, and sit the same exams as students in any school.',
  banner: { src: '/admissions/igcse-2027-admissions.jpg', srcSmall: '/admissions/igcse-2027-admissions-960.jpg', width: 1920, height: 1080,
    alt: 'Smartious IGCSE admissions now open: Years 10 and 11 IGCSE, Cambridge and Edexcel, live online. Cambridge IGCSE with two exam series a year, Pearson Edexcel International GCSE graded 9 to 1, subject specialist teachers. Book an assessment, January 2027 intake.' },
  facts: [
    ['Intake', 'January 2027: Term 2 begins on 5 January 2027'],
    ['Apply by', '5 January 2027, or join later in the year after an assessment'],
    ['Years', 'Year 10 and Year 11, usually ages 14 to 16'],
    ['Boards', 'Cambridge IGCSE and Pearson Edexcel International GCSE'],
    ['Taught', 'Live online by subject specialists, in small classes'],
    ['Open to', 'Students anywhere in the world'],
  ],
  boards: [
    { h: 'Cambridge IGCSE', sub: 'Smartious is a Cambridge International registered school',
      p: 'The world\'s most widely taken international qualification for 14 to 16 year olds. Students usually take six to nine subjects over Years 10 and 11, with exams in two series a year, May/June and October/November, and many subjects offer Core and Extended papers so every student sits the right level.', link: '/cambridge-online-school' },
    { h: 'Pearson Edexcel International GCSE', sub: 'Smartious is a Pearson Edexcel approved centre',
      p: 'Graded 9 to 1, like the UK GCSE, with exams in the May/June series and, for many subjects, January. Assessment is by written exam, which suits students learning online and sitting exams as private candidates.', link: '/pearson-edexcel-online-school' },
  ],
  subjectsNote: 'Every subject is taught live by a subject specialist. Not every subject is set by both boards, so at the assessment we confirm the board, the paper tier and an exam centre for each subject before your child starts.',
  steps: [
    ['Book an assessment', 'Tell us about your child, their current school year and the subjects they want. Every admission starts here.'],
    ['Admissions review', 'Our Head of Admissions reviews every request and replies within three business days.'],
    ['Placement assessment', 'A short diagnostic in English and Mathematics, and in the chosen subjects, places your child in Year 10 or Year 11 at the right point.'],
    ['Subjects and timetable', 'We confirm the board and tier for each subject and build a timetable that works in your time zone.'],
    ['Start on 5 January 2027', 'Your child joins their classes for Term 2, with their teachers, a Dean of Studies and termly reports.'],
  ],
  who: [
    ['Starting Year 10', 'Students beginning the two-year IGCSE course, from Year 9, Lower Secondary or an equivalent grade.'],
    ['Joining in Year 11', 'Students who have started IGCSE elsewhere and need to finish with the right teachers. The assessment checks where they are in each subject.'],
    ['From a national system', 'Students moving from a national curriculum to an international one, with the time to catch up planned in.'],
    ['Moving or travelling', 'Families who relocate, or students in sport and the arts, who need one school that goes with them.'],
  ],
  universities: 'IGCSEs lead straight to A Level, the IB Diploma or a sixth form anywhere, and are accepted alongside GCSEs by schools, colleges and universities around the world. Many universities and ministries of education read IGCSE results as part of their entry and equivalency rules, so good grades in English, Mathematics and the sciences keep every door open. We plan subject choices around the A Levels and courses your child is aiming for.',
  exams: 'Students sit their IGCSE exams as private candidates at authorised exam centres near home, such as British Council offices and schools that accept private candidates. We confirm a centre for each family and keep track of the entry deadlines, which fall months before each series.',
  faqs: [
    { q: 'When does the January 2027 IGCSE intake start?', a: 'Term 2 begins on 5 January 2027. Apply by 5 January 2027; students can also join later in the year after an assessment.' },
    { q: 'Can my child join in Year 11?', a: 'Yes, if they have started IGCSE. The assessment shows where they are in each subject, and we plan the rest of the course with them, including which exam series to sit.' },
    { q: 'Cambridge IGCSE or Pearson Edexcel International GCSE: which is better?', a: 'Both are respected worldwide and lead to A Level. Cambridge IGCSE is the most widely taken, with two exam series a year and Core and Extended papers in many subjects; Pearson Edexcel International GCSE is graded 9 to 1, like the UK GCSE. We recommend a board for each subject at the assessment.' },
    { q: 'How many IGCSE subjects should my child take?', a: 'Most students take six to nine, including English and Mathematics, usually with sciences, a language and subjects that lead to their intended A Levels.' },
    { q: 'Can students from any country apply?', a: 'Yes. Classes are live online and students join from around the world. At the assessment we build a timetable that works in your time zone and confirm an exam centre near you.' },
    { q: 'Where are IGCSE exams sat?', a: 'At authorised exam centres near home as a private candidate, such as British Council offices and schools that accept private candidates. We confirm the centre and track the deadlines.' },
    { q: 'Are online IGCSEs accepted by schools and universities?', a: 'Yes. Students sit the same Cambridge and Pearson Edexcel exams and receive the same certificates as any school candidate; schools and universities accept the qualification, not the way it was taught.' },
    { q: 'How much do IGCSEs cost at Smartious?', a: 'Fees start from USD 423 a month for Primary, payable termly, and vary by curriculum and level; we send the IGCSE fees for your child\'s subjects after the assessment. Exam entry fees are paid to the exam centre.' },
  ],
}

// The IGCSE subjects in the school's database, by board and area.
// Kept equal to backend/src/routes/seed-subjects.js by a backend test.
export const IGCSE_SUBJECTS = {
  "cambridge": {
    "Mathematics": [
      "Mathematics",
      "Additional Mathematics",
      "Further Mathematics"
    ],
    "Sciences": [
      "Physics",
      "Chemistry",
      "Biology",
      "Combined Science",
      "Environmental Management",
      "Marine Science"
    ],
    "English and languages": [
      "English Language",
      "English Literature",
      "English as a Second Language",
      "French",
      "Spanish",
      "Arabic",
      "Swahili",
      "Kiswahili"
    ],
    "Humanities and social sciences": [
      "History",
      "Geography",
      "Global Perspectives",
      "Sociology",
      "Psychology",
      "Religious Studies",
      "Islamic Studies"
    ],
    "Business and technology": [
      "Economics",
      "Business Studies",
      "Accounting",
      "Computer Science",
      "Information & Communication Technology",
      "Design & Technology",
      "Travel & Tourism"
    ],
    "Arts and physical education": [
      "Art & Design",
      "Music",
      "Drama",
      "Physical Education",
      "Media Studies"
    ]
  },
  "edexcel": {
    "Mathematics": [
      "Mathematics",
      "Further Pure Mathematics",
      "Statistics"
    ],
    "Sciences": [
      "Physics",
      "Chemistry",
      "Biology",
      "Double Award Science"
    ],
    "English and languages": [
      "English Language",
      "English Literature",
      "English as a Second Language",
      "French",
      "Spanish",
      "Arabic",
      "Swahili",
      "Kiswahili",
      "German",
      "Italian",
      "Chinese"
    ],
    "Humanities and social sciences": [
      "History",
      "Geography",
      "Religious Studies",
      "Islamic Studies",
      "Sociology",
      "Psychology",
      "Global Citizenship"
    ],
    "Business and technology": [
      "Economics",
      "Business Studies",
      "Accounting",
      "Commerce",
      "Computer Science",
      "Information & Communication Technology",
      "Design & Technology",
      "Travel & Tourism"
    ],
    "Arts and physical education": [
      "Art & Design",
      "Music",
      "Drama",
      "Physical Education",
      "Media Studies"
    ]
  }
}

export const IGCSE_FEE_LINE = 'From USD 423/month for Primary, payable termly; fees vary by curriculum and level.'

export const ALL_IGCSE_SUBJECTS = [...new Set(Object.values(IGCSE_SUBJECTS).flatMap(b => Object.values(b).flat()))].sort((a, b) => a.localeCompare(b))

// Everything pages/AdmissionsPage.jsx needs for this course.
export const IGCSE_ADMISSION = {
  pg: IGCSE_2027, subjects: IGCSE_SUBJECTS, all: ALL_IGCSE_SUBJECTS, fee: IGCSE_FEE_LINE,
  level: 'IGCSE',
  boardNames: { cambridge: 'Cambridge IGCSE', edexcel: 'Pearson Edexcel International GCSE' },
  routesHeading: 'Two IGCSE routes: Cambridge and Pearson Edexcel',
  ctaText: 'Apply by 5 January 2027. Every admission starts with an assessment, so your child begins Year 10 or Year 11 at the right point in every subject.',
  also: [['/cambridge-online-school', 'Cambridge online school'], ['/pearson-edexcel-online-school', 'Pearson Edexcel online school'], ['/curricula/igcse', 'IGCSE curriculum'], ['/a-level-admissions-2027', 'A Level admissions 2027']],
}
