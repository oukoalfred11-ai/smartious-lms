/**
 * aLevelAdmissions2027.js — /a-level-admissions-2027
 * "Begin your A Level journey in January 2027": Cambridge International
 * AS & A Level and Pearson Edexcel A Level admissions, open to students
 * anywhere in the world, taught live online.
 *
 * Rendered by pages/ALevelAdmissionsPage.jsx and, as static HTML for
 * search engines, by scripts/seo-static.mjs. The banner is the school's
 * own artwork (public/admissions/a-level-2027-admissions.jpg).
 *
 * SUBJECTS are the A Level subjects in the school's database
 * (backend/src/routes/seed-subjects.js, curricula CambridgeALevel and
 * EdexcelALevel); backend/test/aLevelAdmissions.test.js fails if the two
 * lists drift apart. Facts: Smartious is a Cambridge International
 * registered school and a Pearson Edexcel approved centre; the January 2027
 * intake starts with Term 2 on 5 January 2027; the one published fee;
 * admissions through /assessment only.
 */

export const A_LEVEL_2027 = {
  slug: 'a-level-admissions-2027',
  title: 'A Level Admissions 2027 | Cambridge & Edexcel, Live Online',
  desc: 'A Level admissions for January 2027: Cambridge International and Pearson Edexcel A Levels taught live online, for students anywhere in the world. Apply by 5 January.',
  eyebrow: 'Admissions now open · January 2027 intake',
  h1: 'A Level admissions 2027: begin your A Level journey in January',
  intro: 'The two years that open university doors, taught live online by subject-specialist teachers, wherever your family lives. Smartious admits A Level students for January 2027 on two routes: Cambridge International AS & A Level and Pearson Edexcel A Level. Students join from Africa, the Gulf, Europe, Asia and the Americas, follow one timetable with their teachers, and sit the same exams as students in any school.',
  banner: { src: '/admissions/a-level-2027-admissions.jpg', srcSmall: '/admissions/a-level-2027-admissions-960.jpg', width: 1920, height: 1080,
    alt: 'Smartious A Level admissions now open: begin your A Level journey in January 2027. Cambridge International AS and A Level, Pearson Edexcel International A Level, live online with subject specialist teachers. Book an assessment, apply by 5th January.' },
  facts: [
    ['Intake', 'January 2027: Term 2 begins on 5 January 2027'],
    ['Apply by', '5 January 2027, or join later in the year after an assessment'],
    ['Boards', 'Cambridge International and Pearson Edexcel'],
    ['Age', 'Usually 16 to 19, after IGCSE, GCSE or an equivalent'],
    ['Taught', 'Live online by subject specialists, in small classes'],
    ['Open to', 'Students anywhere in the world'],
  ],
  boards: [
    { h: 'Cambridge International AS & A Level', sub: 'Smartious is a Cambridge International registered school',
      p: 'The A Level most widely taken by international schools. Students usually take three or four subjects; the AS Level can be sat at the end of the first year and the full A Level at the end of the second, or every paper at the end. Exams run in the May/June and October/November series.', link: '/cambridge-online-school' },
    { h: 'Pearson Edexcel A Level', sub: 'Smartious is a Pearson Edexcel approved centre',
      p: 'Pearson Edexcel International A Levels are modular: subjects are built from units that can be sat across several exam series, so a student can bank results as they go and resit a unit rather than a whole subject. Exams run in January, May/June and October/November.', link: '/pearson-edexcel-online-school' },
  ],
  subjectsNote: 'Every subject is taught live by a subject specialist. Not every subject is set by both boards, and a few are examined through a board\'s UK A Level rather than its international A Level, so at the assessment we confirm the board, the examination route and an exam centre for each subject before your child starts.',
  steps: [
    ['Book an assessment', 'Tell us about your child, their current qualifications and the subjects they want. Every admission starts here.'],
    ['Admissions review', 'Our Head of Admissions reviews every request and replies within three business days.'],
    ['Placement assessment', 'A short diagnostic shows readiness for A Level in each chosen subject, so your child starts at the right point.'],
    ['Subjects and timetable', 'We confirm the board and exam route for each subject and build a timetable that works in your time zone.'],
    ['Start on 5 January 2027', 'Your child joins their classes for Term 2, with their teachers, a Dean of Studies and termly reports.'],
  ],
  who: [
    ['After IGCSE or GCSE', 'Students moving straight on from Cambridge or Pearson Edexcel IGCSE, or UK GCSE.'],
    ['From a national system', 'Students coming from a national curriculum who want A Levels for university abroad. The assessment checks readiness subject by subject.'],
    ['Moving or travelling', 'Families who relocate, or students in sport and the arts, who need one school that goes with them.'],
    ['Without a local A Level option', 'Students whose school or town does not offer A Level, or not the subjects they need.'],
  ],
  universities: 'A Levels are the standard entry qualification for UK universities through UCAS and are accepted by universities across Europe, Canada, Australia, Asia, Africa and the Gulf, and by US universities alongside the SAT or ACT where required. Some countries convert A Level grades through an equivalency process. Each university sets its own grade and subject requirements, so we plan subject choices around the courses your child is aiming for.',
  exams: 'Students sit their AS and A Level exams as private candidates at authorised exam centres near home, such as British Council offices and schools that accept private candidates. We confirm a centre for each family and keep track of the entry deadlines, which fall months before each series.',
  faqs: [
    { q: 'When does the January 2027 A Level intake start?', a: 'Term 2 begins on 5 January 2027. Apply by 5 January 2027; students can also join later in the year after an assessment.' },
    { q: 'Can students from any country apply?', a: 'Yes. Classes are live online and students join from around the world. At the assessment we build a timetable that works in your time zone and confirm an exam centre near you.' },
    { q: 'Cambridge or Pearson Edexcel A Level: which should my child take?', a: 'Both are respected by universities worldwide. Cambridge suits students who want the most widely taught international A Level with exams at the end of the course; Pearson Edexcel International A Level is modular, so results can be banked unit by unit. We recommend a board for each subject at the assessment.' },
    { q: 'How many A Level subjects should my child take?', a: 'Most students take three A Levels, and some take four, often including Further Mathematics. University requirements decide the mix, so choose subjects with the intended course in mind.' },
    { q: 'What do we need to apply?', a: 'Usually IGCSE, GCSE or equivalent results or predicted grades. Students from other systems are welcome: the placement assessment checks readiness in each subject.' },
    { q: 'Where are A Level exams sat?', a: 'At authorised exam centres near home as a private candidate, such as British Council offices and schools that accept private candidates. We confirm the centre and track the deadlines.' },
    { q: 'Are online A Levels accepted by universities?', a: 'Yes. Students sit the same Cambridge and Pearson Edexcel exams and receive the same certificates as any school candidate; universities accept the qualification, not the way it was taught.' },
    { q: 'How much do A Levels cost at Smartious?', a: 'Fees start from USD 423 a month for Primary, payable termly, and vary by curriculum and level; we send the A Level fees for your child\'s subjects after the assessment. Exam entry fees are paid to the exam centre.' },
  ],
}

// The A Level subjects in the school's database, by board and area.
// Kept equal to backend/src/routes/seed-subjects.js by a backend test.
export const A_LEVEL_SUBJECTS = {
  cambridge: {
    Mathematics: ['Mathematics', 'Further Mathematics', 'Statistics'],
    Sciences: ['Physics', 'Chemistry', 'Biology'],
    'English and languages': ['English Language', 'English Literature', 'French', 'Spanish', 'Arabic', 'Kiswahili'],
    'Humanities and social sciences': ['History', 'Geography', 'Psychology', 'Sociology', 'Law', 'Global Perspectives & Research'],
    'Business and technology': ['Economics', 'Business', 'Accounting', 'Computer Science', 'Information Technology'],
    'Arts and physical education': ['Art & Design', 'Music', 'Drama', 'Physical Education'],
  },
  edexcel: {
    Mathematics: ['Mathematics', 'Further Mathematics', 'Statistics'],
    Sciences: ['Physics', 'Chemistry', 'Biology'],
    'English and languages': ['English Language', 'English Literature', 'English Language & Literature', 'French', 'Spanish', 'German', 'Arabic', 'Kiswahili'],
    'Humanities and social sciences': ['History', 'Geography', 'Psychology', 'Sociology', 'Law', 'Politics'],
    'Business and technology': ['Economics', 'Business', 'Accounting', 'Computer Science', 'Information Technology'],
    'Arts and physical education': ['Art & Design', 'Music', 'Drama & Theatre Studies', 'Physical Education'],
  },
}

export const A_LEVEL_FEE_LINE = 'From USD 423/month for Primary, payable termly; fees vary by curriculum and level.'

// Every A Level subject we teach, either board, A to Z (for the "all subjects" list).
export const ALL_A_LEVEL_SUBJECTS = [...new Set(Object.values(A_LEVEL_SUBJECTS).flatMap(b => Object.values(b).flat()))].sort((a, b) => a.localeCompare(b))
