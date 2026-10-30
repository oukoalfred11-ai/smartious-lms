/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════
// careers.js — labels and form fields for /careers, /partnerships and the
// staff Careers and Partnerships modules. The keys must match
// backend/src/constants/careers.js (backend/test/careers.test.js checks).
// ═══════════════════════════════════════════════════════════════════

export const POSITIONS = [
  { key: 'online_teacher',  label: 'Online subject teacher', hint: 'Teach live classes to students around the world from home.', teaching: true },
  { key: 'centre_teacher',  label: 'Learning centre teacher (Nairobi)', hint: 'Teach at our Parklands or Karen centres, with some online classes.', teaching: true },
  { key: 'tutor',           label: 'Part-time tutor', hint: 'One-to-one and small-group tuition, flexible hours.', teaching: true },
  { key: 'exam_specialist', label: 'Examiner or exam-preparation specialist', hint: 'Past-paper, mock and revision teaching for Cambridge, Edexcel, IB or AP.', teaching: true },
  { key: 'non_teaching',    label: 'Non-teaching role', hint: 'Admissions, operations, finance, marketing, technology or support.', teaching: false },
]
export const TEACHING_POSITIONS = POSITIONS.filter(p => p.teaching).map(p => p.key)

export const APPLICATION_STATUSES = [
  { key: 'new',         label: 'New',            color: '#1E40AF', bg: '#DBEAFE' },
  { key: 'screening',   label: 'Screening',      color: '#92400E', bg: '#FEF3C7' },
  { key: 'shortlisted', label: 'Shortlisted',    color: '#6B21A8', bg: '#F3E8FF' },
  { key: 'demo_review', label: 'Demo review',    color: '#0E7490', bg: '#CFFAFE' },
  { key: 'interview',   label: 'Interview',      color: '#9A3412', bg: '#FFEDD5' },
  { key: 'offer',       label: 'Offer made',     color: '#065F46', bg: '#D1FAE5' },
  { key: 'hired',       label: 'Hired',          color: '#fff',    bg: '#15803D' },
  { key: 'on_hold',     label: 'On hold',        color: '#374151', bg: '#E5E7EB' },
  { key: 'rejected',    label: 'Not progressed', color: '#991B1B', bg: '#FEE2E2' },
  { key: 'withdrawn',   label: 'Withdrawn',      color: '#6B7280', bg: '#F3F4F6' },
]

// The teacher portal's personnel file (backend constants/qa.js), less the
// employment contract. `required`: for teaching roles; `staffRequired`: for
// non-teaching roles. `mayBePending`: may be marked "in progress".
export const APPLICANT_DOCS = [
  { key: 'cv',                       label: 'CV / Résumé',                     required: true,  staffRequired: true,  hint: 'Your full teaching history, with dates.' },
  { key: 'academic_certificate',     label: 'Academic certificates',           required: true,  staffRequired: true,  hint: 'Degree certificate(s) and transcripts.' },
  { key: 'professional_certificate', label: 'Teaching qualification',          required: true,  hint: 'PGCE, B.Ed, Dip.Ed or equivalent.' },
  { key: 'identification',           label: 'National ID / Passport',          required: true,  staffRequired: true,  hint: 'The photo page.' },
  { key: 'teaching_license',         label: 'Teaching licence / registration', required: true,  mayBePending: true, hint: 'For example TSC (Kenya), QTS (UK), SACE (South Africa) or your country’s register.' },
  { key: 'police_clearance',         label: 'Police clearance',                required: true,  staffRequired: true,  mayBePending: true, hint: 'Certificate of good conduct, DBS or equivalent, issued in the last 12 months.' },
  { key: 'safeguarding_certificate', label: 'Safeguarding / child protection', required: true,  staffRequired: true,  mayBePending: true, hint: 'Any recognised safeguarding course certificate.' },
  { key: 'training_certificate',     label: 'Training certificates',           required: false, hint: 'Examiner training, online teaching, CPD.' },
  { key: 'reference',                label: 'References',                      required: false, hint: 'Reference letters, or a document with two referees’ contact details.' },
]

export const CURRICULA = [
  'Cambridge Primary', 'Cambridge Lower Secondary', 'Cambridge IGCSE', 'Cambridge AS & A Level',
  'Pearson Edexcel International GCSE', 'Pearson Edexcel International A Level',
  'IB PYP', 'IB MYP', 'IB Diploma', 'American curriculum / AP', 'British National Curriculum', 'SAT / IELTS / TOEFL preparation',
]

export const SUBJECTS = [
  'Mathematics', 'Further Mathematics', 'Additional Mathematics', 'Statistics',
  'English Language', 'English Literature', 'English as a Second Language',
  'Physics', 'Chemistry', 'Biology', 'Combined / Coordinated Science', 'Environmental Management',
  'Computer Science', 'ICT', 'Economics', 'Business Studies', 'Accounting',
  'Geography', 'History', 'Global Perspectives', 'Sociology', 'Psychology', 'Law', 'Religious Studies',
  'French', 'Spanish', 'German', 'Arabic', 'Mandarin Chinese', 'Kiswahili',
  'Art & Design', 'Music', 'Drama', 'Physical Education', 'Design & Technology',
  'Primary (all subjects)', 'Early Years', 'Theory of Knowledge', 'Extended Essay supervision',
  'SAT', 'IELTS', 'TOEFL',
]

export const LEVELS = ['Early Years', 'Primary', 'Lower Secondary', 'IGCSE / GCSE', 'AS & A Level', 'IB Diploma', 'AP', 'Adult / test preparation']

export const QUALIFICATIONS = ['Diploma', "Bachelor's degree", "Master's degree", 'PhD', 'Other']

export const REVIEW_CRITERIA = [
  { key: 'subject_knowledge',   label: 'Subject knowledge' },
  { key: 'pedagogy',            label: 'Teaching method' },
  { key: 'online_presence',     label: 'Online presence and engagement' },
  { key: 'communication',       label: 'Communication and English' },
  { key: 'assessment_feedback', label: 'Checking understanding and feedback' },
]

// ── Partnerships ───────────────────────────────────────────
const YESNO = ['Yes', 'No', 'Not sure']
export const PARTNERSHIP_STATUSES = [
  { key: 'new',           label: 'New',           color: '#1E40AF', bg: '#DBEAFE' },
  { key: 'in_discussion', label: 'In discussion', color: '#92400E', bg: '#FEF3C7' },
  { key: 'proposal',      label: 'Proposal',      color: '#6B21A8', bg: '#F3E8FF' },
  { key: 'agreement',     label: 'Agreement',     color: '#0E7490', bg: '#CFFAFE' },
  { key: 'active',        label: 'Active partner', color: '#fff',   bg: '#15803D' },
  { key: 'declined',      label: 'Declined',      color: '#991B1B', bg: '#FEE2E2' },
  { key: 'archived',      label: 'Archived',      color: '#6B7280', bg: '#F3F4F6' },
]

// Documents every organisation uploads with an enquiry (keys match
// backend/src/constants/careers.js PARTNER_DOCS). PDF, Word or an image, 15 MB each.
export const PARTNER_DOCS = [
  { key: 'registration', label: 'Government registration certificate', required: true,
    hint: 'Certificate of incorporation, business or company registration, or charity or NGO registration, issued by the government.' },
  { key: 'licence', label: 'Operating licence or accreditation', required: true,
    hint: 'The licence or permit that allows you to operate, e.g. a ministry or education-authority licence, exam board approval, or trade licence.' },
  { key: 'proof_of_operations', label: 'Proof of operations', required: true,
    hint: 'A recent document showing you trade today: tax compliance certificate, bank reference letter, audited accounts or a utility bill, from the last 12 months.' },
  { key: 'other', label: 'Other supporting document', required: false,
    hint: 'Optional: a company profile, brochure or proposal.' },
]

// Each type: who it is for, what we offer them, and its own questions.
// field types: text, textarea, number, select (options), multi (options), date
export const PARTNERSHIP_TYPES = [
  { key: 'university_scholarships', label: 'University scholarships', short: 'Universities and colleges',
    pitch: 'Offer scholarships or recruitment routes to our Cambridge, Edexcel, IB and AP graduates in more than forty countries.',
    fields: [
      { key: 'institutionType', label: 'Institution type', type: 'select', options: ['University', 'University college', 'Foundation or pathway provider', 'Scholarship foundation'] },
      { key: 'studyCountries', label: 'Countries of study', type: 'text', placeholder: 'e.g. United Kingdom, Canada' },
      { key: 'scholarshipName', label: 'Scholarship or programme name', type: 'text' },
      { key: 'awardValue', label: 'Award value or coverage', type: 'text', placeholder: 'e.g. 50% tuition, GBP 5,000 a year' },
      { key: 'numberOfAwards', label: 'Number of awards per year', type: 'number' },
      { key: 'qualificationsAccepted', label: 'Qualifications accepted', type: 'multi', options: ['Cambridge A Level', 'Pearson Edexcel A Level', 'IB Diploma', 'AP', 'IGCSE (foundation entry)'] },
      { key: 'deadline', label: 'Next application deadline', type: 'date' },
    ] },
  { key: 'exam_centre', label: 'Examination centre', short: 'Exam centres',
    pitch: 'Host our students as private candidates for Cambridge, Pearson Edexcel, IB, AP or English-language examinations.',
    fields: [
      { key: 'centreNumber', label: 'Centre number', type: 'text' },
      { key: 'boards', label: 'Boards you are authorised for', type: 'multi', options: ['Cambridge International', 'Pearson Edexcel', 'IB', 'College Board AP', 'SAT', 'IELTS', 'TOEFL', 'Other'] },
      { key: 'privateCandidates', label: 'Do you accept private candidates?', type: 'select', options: YESNO },
      { key: 'series', label: 'Series you run', type: 'multi', options: ['January', 'May/June', 'October/November', 'Other'] },
      { key: 'capacity', label: 'Approximate seats per series for external candidates', type: 'number' },
      { key: 'practicals', label: 'Can you host science practical examinations?', type: 'select', options: YESNO },
      { key: 'address', label: 'Centre address', type: 'text' },
    ] },
  { key: 'training_provider', label: 'Training provider', short: 'Teacher training and CPD',
    pitch: 'Train our teachers: online pedagogy, safeguarding, examiner training, leadership and subject CPD.',
    fields: [
      { key: 'trainingAreas', label: 'Training you offer', type: 'multi', options: ['Online pedagogy', 'Safeguarding', 'Examiner / assessment training', 'Subject CPD', 'SEN and inclusion', 'Leadership', 'Educational technology', 'Wellbeing'] },
      { key: 'accreditedBy', label: 'Accredited or endorsed by', type: 'text' },
      { key: 'delivery', label: 'Delivery', type: 'select', options: ['Online', 'In person (Nairobi)', 'Both'] },
      { key: 'certificate', label: 'Do participants receive a certificate?', type: 'select', options: YESNO },
      { key: 'cohortSize', label: 'Typical cohort size', type: 'number' },
    ] },
  { key: 'co_curricular', label: 'Co-curricular provider', short: 'Clubs, sports and activities',
    pitch: 'Run clubs and activities for our students online or in Nairobi: coding, robotics, music, sport, debate and more.',
    fields: [
      { key: 'activities', label: 'Activities', type: 'multi', options: ['Coding', 'Robotics', 'STEM', 'Music', 'Art', 'Drama', 'Debate / Model UN', 'Chess', 'Languages', 'Sport', 'Entrepreneurship', 'Duke of Edinburgh / Award', 'Other'] },
      { key: 'ageGroups', label: 'Age groups', type: 'multi', options: ['5-7', '8-10', '11-13', '14-16', '17-18'] },
      { key: 'delivery', label: 'Delivery', type: 'select', options: ['Online', 'In person (Nairobi)', 'Both'] },
      { key: 'safeguardingPolicy', label: 'Do you have a safeguarding policy and checked staff?', type: 'select', options: YESNO },
      { key: 'pricingModel', label: 'Pricing model', type: 'select', options: ['Per student', 'Per session', 'Per term', 'Revenue share', 'Free / sponsored'] },
    ] },
  { key: 'school_partnership', label: 'School partnership', short: 'Schools',
    pitch: 'Add subjects your school cannot staff, share specialist teachers, or give your students an international qualification alongside yours.',
    fields: [
      { key: 'schoolType', label: 'School type', type: 'select', options: ['Public / government', 'Independent / private', 'International', 'Faith school', 'Homeschool co-operative'] },
      { key: 'curriculum', label: 'Your current curriculum', type: 'text' },
      { key: 'learners', label: 'Number of learners', type: 'number' },
      { key: 'interest', label: 'Interested in', type: 'multi', options: ['Subjects we cannot staff', 'Cambridge / Edexcel alongside our curriculum', 'Exam preparation', 'Teacher sharing', 'Virtual Lab', 'Holiday programmes'] },
    ] },
  { key: 'technology', label: 'Technology partner', short: 'EdTech and platforms',
    pitch: 'Integrate with our live classroom, learning platform or Virtual Lab.',
    fields: [
      { key: 'productType', label: 'Product', type: 'select', options: ['Learning platform', 'Assessment', 'Content', 'Hardware / devices', 'Connectivity', 'AI tools', 'Other'] },
      { key: 'integration', label: 'What you propose', type: 'textarea' },
    ] },
  { key: 'content_publisher', label: 'Content and publishing', short: 'Publishers',
    pitch: 'Textbooks, digital resources and assessment content for our students and teachers.',
    fields: [
      { key: 'boardsCovered', label: 'Boards covered', type: 'multi', options: ['Cambridge', 'Pearson Edexcel', 'IB', 'AP', 'Other'] },
      { key: 'formats', label: 'Formats', type: 'multi', options: ['Print', 'Digital', 'Interactive', 'Video'] },
    ] },
  { key: 'corporate_family', label: 'Corporate family benefits', short: 'Employers and relocation',
    pitch: 'Education for your employees’ children: postings, relocations and remote locations.',
    fields: [
      { key: 'employees', label: 'Families to support (approximately)', type: 'number' },
      { key: 'locations', label: 'Countries or sites', type: 'text' },
      { key: 'benefit', label: 'What you need', type: 'multi', options: ['Full-time online school', 'Subjects alongside a local school', 'Exam preparation', 'Relocation continuity', 'Tuition'] },
    ] },
  { key: 'education_agent', label: 'Education agent', short: 'Agents and counsellors',
    pitch: 'Refer families and represent Smartious in your country.',
    fields: [
      { key: 'countriesCovered', label: 'Countries you cover', type: 'text' },
      { key: 'familiesPerYear', label: 'Families you advise per year (approximately)', type: 'number' },
      { key: 'registered', label: 'Are you a registered agent or counsellor?', type: 'select', options: YESNO },
    ] },
  { key: 'ngo_foundation', label: 'NGO or foundation', short: 'NGOs and foundations',
    pitch: 'Sponsored places, bursaries and education programmes for learners who need them.',
    fields: [
      { key: 'focus', label: 'Your focus', type: 'text' },
      { key: 'learners', label: 'Learners you hope to reach', type: 'number' },
      { key: 'funding', label: 'Funding', type: 'select', options: ['Fully funded', 'Partly funded', 'Seeking a partner to co-fund'] },
    ] },
  { key: 'media', label: 'Media and events', short: 'Media and events',
    pitch: 'Interviews, features, education fairs and conferences.',
    fields: [
      { key: 'outlet', label: 'Outlet or event', type: 'text' },
      { key: 'date', label: 'Date, if known', type: 'date' },
    ] },
  { key: 'other', label: 'Other', short: 'Something else', pitch: 'Tell us what you have in mind.', fields: [] },
]
