/**
 * lowerSecondaryAdmissions2027.js — /lower-secondary-admissions-2027
 * "Years 7 to 9 Lower Secondary: Cambridge and Edexcel, live online":
 * Cambridge Lower Secondary and Pearson Edexcel iLowerSecondary admissions
 * for January 2027, open to students anywhere in the world.
 *
 * Rendered by pages/AdmissionsPage.jsx and, as static HTML for search
 * engines, by scripts/seo-static.mjs. The banner is the school's own
 * artwork (public/admissions/lower-secondary-2027-admissions.jpg).
 *
 * SUBJECTS are the Lower Secondary subjects in the school's database
 * (backend/src/routes/seed-subjects.js, curricula CambridgeLowerSec and
 * EdexcelLowerSec); backend/test/aLevelAdmissions.test.js fails if they
 * drift. The end-of-stage tests are described as what we prepare for
 * (the banner's "Checkpoint preparation"); nothing claims Smartious runs
 * them. Facts as on the other admissions pages: January 2027 intake, Term 2
 * starts 5 January 2027, the one published fee, admissions via /assessment.
 */

export const LOWER_SEC_2027 = {
  slug: 'lower-secondary-admissions-2027',
  ctaH: 'Start Lower Secondary',
  leadsHeading: 'Where Lower Secondary leads',
  examsHeading: 'Checkpoint and end-of-stage tests',
  title: 'Lower Secondary Admissions 2027 | Years 7-9, Live Online',
  desc: 'Lower Secondary admissions for January 2027: Cambridge Lower Secondary and Pearson Edexcel iLowerSecondary for Years 7 to 9, taught live online.',
  eyebrow: 'Admissions now open · January 2027 intake',
  h1: 'Lower Secondary admissions 2027: Years 7 to 9, Cambridge and Edexcel, live online',
  intro: 'The years that build strong foundations for IGCSE, taught live by subject-specialist teachers, wherever your family lives. Smartious admits Year 7, Year 8 and Year 9 students for January 2027 on two routes: Cambridge Lower Secondary and Pearson Edexcel iLowerSecondary. Students join from Africa, the Gulf, Europe, Asia and the Americas, follow one timetable with their teachers, and arrive at Year 10 ready for IGCSE.',
  banner: { src: '/admissions/lower-secondary-2027-admissions.jpg', srcSmall: '/admissions/lower-secondary-2027-admissions-960.jpg', width: 1920, height: 1080,
    alt: 'Smartious Lower Secondary admissions now open: Years 7 to 9 Lower Secondary, Cambridge and Edexcel, live online. Cambridge Lower Secondary Checkpoint preparation, Pearson Edexcel iLowerSecondary, subject specialist teachers. Book an assessment, January 2027 intake.' },
  facts: [
    ['Intake', 'January 2027: Term 2 begins on 5 January 2027'],
    ['Apply by', '5 January 2027, or join later in the year after an assessment'],
    ['Years', 'Year 7, Year 8 and Year 9, usually ages 11 to 14'],
    ['Boards', 'Cambridge Lower Secondary and Pearson Edexcel iLowerSecondary'],
    ['Taught', 'Live online by subject specialists, in small classes'],
    ['Open to', 'Students anywhere in the world'],
  ],
  boards: [
    { h: 'Cambridge Lower Secondary', sub: 'Smartious is a Cambridge International registered school',
      p: 'Stages 7 to 9 of the Cambridge pathway, the bridge from Primary to IGCSE. English, Mathematics and Science are taught in depth alongside the wider curriculum, with regular progress tests and preparation for the Cambridge Lower Secondary Checkpoint tests at the end of Stage 9.', link: '/cambridge-online-school' },
    { h: 'Pearson Edexcel iLowerSecondary', sub: 'Smartious is a Pearson Edexcel approved centre',
      p: 'Pearson\'s international curriculum for ages 11 to 14, built to lead into Pearson Edexcel International GCSE. English, Mathematics and Science sit at the centre, with preparation for the iLowerSecondary achievement tests at the end of Year 9.', link: '/pearson-edexcel-online-school' },
  ],
  subjectsNote: 'Every subject is taught live by a subject specialist. Not every subject is offered on both routes, so at the assessment we confirm the route and the year group for each subject before your child starts.',
  steps: [
    ['Book an assessment', 'Tell us about your child, their current school year and how they learn best. Every admission starts here.'],
    ['Admissions review', 'Our Head of Admissions reviews every request and replies within three business days.'],
    ['Placement assessment', 'A short diagnostic in English and Mathematics places your child in Year 7, 8 or 9 at the right point.'],
    ['Subjects and timetable', 'We confirm the route and build a timetable that works in your time zone.'],
    ['Start on 5 January 2027', 'Your child joins their classes for Term 2, with their teachers, a class teacher and termly reports.'],
  ],
  who: [
    ['Moving up from Primary', 'Students starting Year 7 after Cambridge Primary, Pearson iPrimary or a national primary curriculum.'],
    ['Joining in Year 8 or 9', 'Students changing school mid-way who need continuity before IGCSE. The assessment shows where they are in each subject.'],
    ['Changing curriculum', 'Students moving from a national system to an international one, with time to close any gaps before Year 10.'],
    ['Moving or travelling', 'Families who relocate, or young athletes and performers, who need one school that goes with them.'],
  ],
  universities: 'Lower Secondary leads straight into Year 10 and IGCSE: Cambridge Lower Secondary into Cambridge IGCSE, and Pearson Edexcel iLowerSecondary into Pearson Edexcel International GCSE. By the end of Year 9 students have the reading, writing, mathematics and study habits IGCSE expects, and a clear idea of the subjects they want to take. Our IGCSE admissions page shows what comes next.',
  exams: 'Progress is checked through regular tests, marked work and termly reports, so parents always know where their child stands. At the end of the stage, students prepare for the Cambridge Lower Secondary Checkpoint or the Pearson iLowerSecondary achievement tests in English, Mathematics and Science; we advise each family on whether and where to sit them.',
  faqs: [
    { q: 'When does the January 2027 Lower Secondary intake start?', a: 'Term 2 begins on 5 January 2027. Apply by 5 January 2027; students can also join later in the year after an assessment.' },
    { q: 'Which year should my child join?', a: 'Usually the year that matches their age, Year 7 at 11 to 12, Year 8 at 12 to 13 and Year 9 at 13 to 14. The placement assessment confirms it, and can place a child up or down a year where that serves them better.' },
    { q: 'Cambridge Lower Secondary or Pearson iLowerSecondary: which is better?', a: 'Both prepare students well for IGCSE. Choose the route that leads into the IGCSE board your child will take: Cambridge Lower Secondary into Cambridge IGCSE, and iLowerSecondary into Pearson Edexcel International GCSE. We recommend one at the assessment.' },
    { q: 'What is the Cambridge Lower Secondary Checkpoint?', a: 'A set of end-of-stage tests in English, Mathematics and Science taken at the end of Stage 9, giving an international benchmark before IGCSE. Our teachers prepare students for it, and we advise families on whether and where to sit it.' },
    { q: 'Can students from any country apply?', a: 'Yes. Classes are live online and students join from around the world. At the assessment we build a timetable that works in your time zone.' },
    { q: 'How long is the school day online?', a: 'Lessons run on a weekly timetable with breaks between them, so the day is structured like school without long hours in front of a screen. Homework is set and marked online.' },
    { q: 'Will my child be ready for IGCSE?', a: 'That is what Lower Secondary is for. By the end of Year 9 students have covered the foundations IGCSE builds on, and they move into Year 10 with the same teachers and school.' },
    { q: 'How much does Lower Secondary cost at Smartious?', a: 'Fees start from USD 423 a month for Primary, payable termly, and vary by curriculum and level; we send the Lower Secondary fees after the assessment.' },
  ],
}

// The Lower Secondary subjects in the school's database, by board and area.
// Kept equal to backend/src/routes/seed-subjects.js by a backend test.
export const LOWER_SEC_SUBJECTS = {
  "cambridge": {
    "Mathematics": [
      "Mathematics"
    ],
    "Science": [
      "Science"
    ],
    "English and languages": [
      "English",
      "French",
      "Arabic",
      "Kiswahili"
    ],
    "Humanities": [
      "History",
      "Geography",
      "Global Perspectives",
      "Religious Studies"
    ],
    "Computing and the arts": [
      "Computer Science",
      "Art & Design",
      "Music",
      "Physical Education"
    ]
  },
  "edexcel": {
    "Mathematics": [
      "Mathematics"
    ],
    "Science": [
      "Science"
    ],
    "English and languages": [
      "English",
      "French",
      "Arabic",
      "Kiswahili"
    ],
    "Humanities": [
      "History",
      "Geography"
    ],
    "Computing and the arts": [
      "Computer Science",
      "Art & Design",
      "Physical Education"
    ]
  }
}

export const LOWER_SEC_FEE_LINE = 'From USD 423/month for Primary, payable termly; fees vary by curriculum and level.'

export const ALL_LOWER_SEC_SUBJECTS = [...new Set(Object.values(LOWER_SEC_SUBJECTS).flatMap(b => Object.values(b).flat()))].sort((a, b) => a.localeCompare(b))

// Everything pages/AdmissionsPage.jsx needs for this course.
export const LOWER_SEC_ADMISSION = {
  pg: LOWER_SEC_2027, subjects: LOWER_SEC_SUBJECTS, all: ALL_LOWER_SEC_SUBJECTS, fee: LOWER_SEC_FEE_LINE,
  level: 'Lower Secondary',
  boardNames: { cambridge: 'Cambridge Lower Secondary', edexcel: 'Pearson Edexcel iLowerSecondary' },
  routesHeading: 'Two Lower Secondary routes: Cambridge and Pearson Edexcel',
  ctaText: 'Apply by 5 January 2027. Every admission starts with an assessment, so your child begins Year 7, 8 or 9 at the right point.',
  also: [['/cambridge-online-school', 'Cambridge online school'], ['/pearson-edexcel-online-school', 'Pearson Edexcel online school'], ['/igcse-admissions-2027', 'IGCSE admissions 2027'], ['/a-level-admissions-2027', 'A Level admissions 2027']],
}
