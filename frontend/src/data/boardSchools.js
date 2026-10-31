/**
 * boardSchools.js — the two exam-board school pages:
 *   /cambridge-online-school        Smartious as a Cambridge online school
 *   /pearson-edexcel-online-school  Smartious as a Pearson Edexcel online school
 *
 * Rendered by pages/BoardSchoolPage.jsx and, as static HTML for search
 * engines, by scripts/seo-static.mjs. Smartious is a Cambridge
 * International registered school and a Pearson Edexcel approved centre
 * (confirmed by the school, October 2026). Fees: the one published fee
 * only. Admissions: /assessment only.
 */

export const FEE_LINE = 'From USD 423/month for Primary, payable termly; fees vary by curriculum and level.'

export const BOARD_SCHOOLS = {
  cambridge: {
    slug: 'cambridge-online-school',
    board: 'Cambridge',
    boardFull: 'Cambridge International Education',
    other: 'edexcel',
    title: 'Accredited Cambridge Online School | Smartious',
    desc: 'Smartious is a Cambridge registered online school: live Cambridge Primary, Lower Secondary, IGCSE and A Level classes with specialist teachers, from anywhere.',
    eyebrow: 'Cambridge International registered school',
    h1: 'Accredited Cambridge online school, from Primary to A Level',
    intro: 'Smartious is a Cambridge International registered school teaching the Cambridge curriculum live online, to families in more than forty countries. Students follow one timetable with subject-specialist teachers, from Cambridge Primary through Lower Secondary and IGCSE to International AS & A Level, and we enter them for their Cambridge examinations.',
    status: [
      ['A Cambridge registered school', 'Smartious is registered with Cambridge International Education, the University of Cambridge department that sets and marks Cambridge IGCSE and A Level. We teach to the current Cambridge syllabuses and enter our students for their examinations.'],
      ['A school, not a tutoring marketplace', 'One academic team, one timetable and one record per student: a class teacher, a Dean of Studies who oversees progress, weekly tests and a written end-of-term report.'],
      ['Live, small classes', 'Every lesson is taught live by a subject specialist, with time for questions, discussion and feedback, not pre-recorded videos.'],
    ],
    stages: [
      { name: 'Cambridge Primary', ages: 'Ages 5 to 11', p: 'English, Mathematics and Science at the heart of the week, with the wider Primary curriculum around them. Classes are short, lively and built for young learners on screen, and parents see progress in the parent portal.' },
      { name: 'Cambridge Lower Secondary', ages: 'Ages 11 to 14', p: 'The bridge from Primary to IGCSE: English, Mathematics and Science taught in more depth, with the study habits, writing and problem-solving that IGCSE asks for.' },
      { name: 'Cambridge IGCSE', ages: 'Ages 14 to 16', p: 'The world’s most widely taken international qualification for this age. Students usually take six to nine subjects over two years, with examinations in the May/June or October/November series.' },
      { name: 'Cambridge International AS & A Level', ages: 'Ages 16 to 19', p: 'Three or four subjects studied in depth for university entry. AS Level can be taken at the end of the first year and the full A Level at the end of the second.' },
    ],
    subjects: {
      'IGCSE': ['English (First or Second Language)', 'Mathematics', 'Additional Mathematics', 'Biology', 'Chemistry', 'Physics', 'Combined Science', 'Computer Science', 'ICT', 'Business Studies', 'Economics', 'Accounting', 'Geography', 'History', 'Global Perspectives', 'Modern languages'],
      'AS & A Level': ['Mathematics', 'Further Mathematics', 'Statistics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Business', 'Accounting', 'Computer Science', 'English', 'Geography', 'History', 'Psychology'],
    },
    subjectsNote: 'Subjects run when there is a class for them; tell us your choices at assessment and we will confirm the timetable.',
    included: [
      ['Live timetabled lessons', 'A weekly timetable of live lessons with the same subject teachers all term.'],
      ['Weekly tests and term reports', 'Short weekly tests in each subject, an end-of-term examination and a written report with teacher, Dean and Principal comments.'],
      ['Past papers and mock examinations', 'Cambridge past papers, mark schemes and examiner reports built into the course, and full mock examinations before the real series.'],
      ['Science practicals', 'Practical work prepared for the Cambridge practical and alternative-to-practical papers, including our Virtual Lab for the IGCSE practicals.'],
      ['Examination entry', 'As a registered school we enter students for their Cambridge examinations and agree with each family where they will sit them.'],
      ['Parent portal', 'Timetable, attendance, test marks, reports and invoices in one place for parents.'],
    ],
    exams: [
      'Cambridge IGCSE and AS & A Level examinations run in two main series each year: May/June and October/November (a March series runs in India only).',
      'Written papers are sat in person, under exam conditions, at a centre. We enter students as a Cambridge registered school and agree the sitting arrangements with each family before the entry deadline.',
      'Results are issued by Cambridge International Education and are the same qualification a student at any other Cambridge school receives.',
    ],
    choose: [
      ['Is the school registered with Cambridge?', 'A Cambridge registered school teaches to the current syllabuses and can enter its own students for examinations. Ask any online school whether it is registered, and how it enters students.'],
      ['Are lessons live, and who teaches them?', 'Ask how many lessons a week are live, whether the same teacher teaches the class all term, and what the teachers’ qualifications are.'],
      ['How is progress checked?', 'Look for regular tests, marked work returned with feedback, and written term reports, not only a final grade.'],
      ['What happens at exam time?', 'Ask who makes the examination entries, where the student will sit the papers and what the entry fees are.'],
      ['How are practicals covered?', 'Science IGCSEs include practical skills. Ask how the school teaches them online.'],
    ],
    compare: 'Choosing between Cambridge and Pearson Edexcel? Both are British-style international qualifications accepted by universities worldwide. Cambridge has two main examination series a year and a very wide subject range; Pearson Edexcel International A Level is modular, with more series a year in which units can be sat or resat. We teach both, and help families choose at assessment.',
    faqs: [
      { q: 'Is Smartious an accredited Cambridge school?', a: 'Smartious is a Cambridge International registered school. Cambridge registers schools that teach its programmes and enter students for its examinations; that is the recognition Cambridge itself gives a school.' },
      { q: 'Are Cambridge qualifications from an online school the same as from a school building?', a: 'Yes. Cambridge IGCSE and A Level certificates are issued by Cambridge International Education, whether the student was taught online or in a classroom. Universities see the same qualification.' },
      { q: 'Can my child sit Cambridge exams in our country?', a: 'Cambridge examinations are sat in person at a centre. As a registered school we enter our students and agree with each family where they will sit, usually at a centre in or near their home city.' },
      { q: 'Which ages and stages do you teach?', a: 'Cambridge Primary (ages 5 to 11), Cambridge Lower Secondary (11 to 14), Cambridge IGCSE (14 to 16) and Cambridge International AS & A Level (16 to 19).' },
      { q: 'Are the classes live?', a: 'Yes. Lessons are taught live on a weekly timetable by subject-specialist teachers, with questions, discussion and feedback in the lesson.' },
      { q: 'How much does the Cambridge online school cost?', a: FEE_LINE },
      { q: 'How do we join?', a: 'Every student starts with an assessment, so we can place them at the right stage and plan their subjects. Book it on our assessment page.' },
      { q: 'Can students join part way through IGCSE or A Level?', a: 'Often, yes. At assessment we look at what the student has already covered against the Cambridge syllabus and plan how they catch up before their examination series.' },
    ],
  },

  edexcel: {
    slug: 'pearson-edexcel-online-school',
    board: 'Pearson Edexcel',
    boardFull: 'Pearson Edexcel',
    other: 'cambridge',
    title: 'Accredited Pearson Edexcel Online School | Smartious',
    desc: 'Smartious is a Pearson Edexcel approved centre teaching International GCSE and International A Level live online, with specialist teachers, from anywhere.',
    eyebrow: 'Pearson Edexcel approved centre',
    h1: 'Accredited Pearson Edexcel online school for International GCSE and A Level',
    intro: 'Smartious is a Pearson Edexcel approved centre teaching the Edexcel route live online, to families in more than forty countries. Students in Years 7 to 13 follow one timetable with subject-specialist teachers, through Pearson Edexcel International GCSE and International AS & A Level, and we enter them for their Edexcel examinations.',
    status: [
      ['A Pearson Edexcel approved centre', 'Smartious is approved by Pearson to deliver Edexcel qualifications and enter candidates for them. We teach to the current Pearson Edexcel specifications.'],
      ['A school, not a tutoring marketplace', 'One academic team, one timetable and one record per student: a class teacher, a Dean of Studies who oversees progress, weekly tests and a written end-of-term report.'],
      ['Live, small classes', 'Every lesson is taught live by a subject specialist, with time for questions, discussion and feedback, not pre-recorded videos.'],
    ],
    stages: [
      { name: 'Years 7 to 9', ages: 'Ages 11 to 14', p: 'The English Key Stage 3 years, taught to lead straight into Edexcel International GCSE: English, Mathematics and Science in depth, with the writing and problem-solving the examinations ask for.' },
      { name: 'Pearson Edexcel International GCSE', ages: 'Ages 14 to 16', p: 'Closely aligned with the English GCSE standard and recognised by universities and employers worldwide. Students usually take six to nine subjects over two years.' },
      { name: 'Pearson Edexcel International AS & A Level', ages: 'Ages 16 to 19', p: 'A modular A Level: units are examined across the two years, and can be sat, and where allowed resat, in several series a year. Three or four subjects for university entry.' },
    ],
    subjects: {
      'International GCSE': ['English Language', 'English Literature', 'Mathematics', 'Further Pure Mathematics', 'Biology', 'Chemistry', 'Physics', 'Science (Double Award)', 'Computer Science', 'ICT', 'Business', 'Economics', 'Accounting', 'Geography', 'History'],
      'International AS & A Level': ['Mathematics', 'Further Mathematics', 'Statistics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Business', 'Accounting', 'English Language', 'English Literature', 'Psychology'],
    },
    subjectsNote: 'Subjects run when there is a class for them; tell us your choices at assessment and we will confirm the timetable.',
    included: [
      ['Live timetabled lessons', 'A weekly timetable of live lessons with the same subject teachers all term.'],
      ['Weekly tests and term reports', 'Short weekly tests in each subject, an end-of-term examination and a written report with teacher, Dean and Principal comments.'],
      ['Past papers and mock examinations', 'Edexcel past papers and mark schemes built into the course, and full mock examinations before each series.'],
      ['Unit planning', 'For International A Level we plan which units to sit in which series, so students spread the load and know their resit options.'],
      ['Examination entry', 'As an approved centre we enter students for their Edexcel examinations and agree with each family where they will sit them.'],
      ['Parent portal', 'Timetable, attendance, test marks, reports and invoices in one place for parents.'],
    ],
    exams: [
      'Pearson Edexcel International A Level units can be sat in the January, May/June and October/November series. International GCSE examinations run in the January and May/June series.',
      'Written papers are sat in person, under exam conditions, at a centre. We enter students as a Pearson Edexcel approved centre and agree the sitting arrangements with each family before the entry deadline.',
      'Results and certificates are issued by Pearson and are the same qualification a student at any other Edexcel school receives.',
    ],
    choose: [
      ['Is the school a Pearson approved centre?', 'An approved centre can enter its own students for Edexcel examinations. Ask any online school whether it is approved by Pearson, and how it enters students.'],
      ['Are lessons live, and who teaches them?', 'Ask how many lessons a week are live, whether the same teacher teaches the class all term, and what the teachers’ qualifications are.'],
      ['How is progress checked?', 'Look for regular tests, marked work returned with feedback, and written term reports, not only a final grade.'],
      ['Is there a plan for the units?', 'International A Level is modular. Ask which units will be sat in which series, and how resits work.'],
      ['What happens at exam time?', 'Ask who makes the examination entries, where the student will sit the papers and what the entry fees are.'],
    ],
    compare: 'Choosing between Pearson Edexcel and Cambridge? Both are British-style international qualifications accepted by universities worldwide. Edexcel International A Level is modular, with more series a year in which units can be sat or resat, and maps closely onto the English system; Cambridge has a very wide subject range and two main series a year. We teach both, and help families choose at assessment.',
    faqs: [
      { q: 'Is Smartious an accredited Pearson Edexcel school?', a: 'Smartious is a Pearson Edexcel approved centre. Pearson approves centres to deliver its qualifications and enter candidates for them; that is the recognition Pearson itself gives a school.' },
      { q: 'Are Edexcel qualifications from an online school the same as from a school building?', a: 'Yes. International GCSE and International A Level certificates are issued by Pearson, whether the student was taught online or in a classroom. Universities see the same qualification.' },
      { q: 'Can my child sit Edexcel exams in our country?', a: 'Edexcel examinations are sat in person at a centre. As an approved centre we enter our students and agree with each family where they will sit, usually at a centre in or near their home city.' },
      { q: 'What is modular about International A Level?', a: 'Each subject is made of units examined separately. Units can be sat in different series across the two years, and resat where the specification allows, with the best result counting towards the final grade.' },
      { q: 'Which years do you teach on the Edexcel route?', a: 'Years 7 to 9 leading into International GCSE, International GCSE (Years 10 and 11) and International AS & A Level (Years 12 and 13).' },
      { q: 'How much does the Edexcel online school cost?', a: FEE_LINE },
      { q: 'How do we join?', a: 'Every student starts with an assessment, so we can place them in the right year and plan their subjects and units. Book it on our assessment page.' },
      { q: 'Can my child switch from a UK school?', a: 'Usually, yes. Edexcel International GCSE and A Level sit close to the English GCSE and A Level, so students moving from a UK school often carry on with the same subjects. We check the details at assessment.' },
    ],
  },
}

export const BOARD_SCHOOL_SLUG_TO_KEY = Object.fromEntries(Object.entries(BOARD_SCHOOLS).map(([k, v]) => [v.slug, k]))
