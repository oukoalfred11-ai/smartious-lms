/**
 * constants/qa.js — shared vocabulary for the QA portal.
 * ============================================================
 * Teacher document categories in two groups:
 *   personnel — the staff file an accreditor (Cognia, Cambridge,
 *               the Ministry) asks to see for every teacher;
 *   teaching  — working documents a school inspection expects.
 * `required` personnel categories drive each teacher's file
 * completeness score; `expires` ones carry an expiry date.
 */

const TEACHER_DOC_CATEGORIES = [
  // Personnel file
  { key: 'cv',                       label: 'CV / Résumé',                     group: 'personnel', required: true },
  { key: 'academic_certificate',     label: 'Academic certificates',           group: 'personnel', required: true },
  { key: 'professional_certificate', label: 'Teaching qualification',          group: 'personnel', required: true },
  { key: 'identification',           label: 'National ID / Passport',          group: 'personnel', required: true },
  { key: 'teaching_license',         label: 'Teaching licence / registration', group: 'personnel', required: true, expires: true },
  { key: 'police_clearance',         label: 'Police clearance',                group: 'personnel', required: true, expires: true },
  { key: 'contract',                 label: 'Employment contract',             group: 'personnel', required: true, expires: true },
  { key: 'safeguarding_certificate', label: 'Safeguarding / child protection', group: 'personnel', required: true, expires: true },
  { key: 'training_certificate',     label: 'Training certificates',           group: 'personnel' },
  { key: 'observation_report',       label: 'Lesson observation reports',      group: 'personnel' },
  { key: 'appraisal',                label: 'Appraisals',                      group: 'personnel' },
  { key: 'reference',                label: 'References',                      group: 'personnel' },
  // Teaching documents
  { key: 'scheme_of_work',           label: 'Schemes of Work',                 group: 'teaching' },
  { key: 'lesson_plan',              label: 'Lesson Plans',                    group: 'teaching' },
  { key: 'record_of_work',           label: 'Records of Work',                 group: 'teaching' },
  { key: 'assessment_record',        label: 'Assessment Records',              group: 'teaching' },
  { key: 'teaching_resource',        label: 'Teaching Resources',              group: 'teaching' },
  { key: 'report',                   label: 'Reports',                         group: 'teaching' },
  { key: 'other',                    label: 'Other',                           group: 'teaching' },
];

const CATEGORY_KEYS = TEACHER_DOC_CATEGORIES.map(c => c.key);
const REQUIRED_PERSONNEL = TEACHER_DOC_CATEGORIES.filter(c => c.required).map(c => c.key);

// A document expiring within this many days is flagged as "expiring".
const EXPIRY_WARN_DAYS = 60;

const TRAINING_CATEGORIES = [
  'Pedagogy', 'Curriculum', 'Assessment', 'Subject knowledge', 'ICT & digital',
  'Safeguarding', 'Inclusion & SEN', 'Leadership', 'Wellbeing', 'Other',
];

const ACCREDITATION_TYPES = ['Accreditation', 'License', 'Membership', 'Registration', 'Other'];

module.exports = {
  TEACHER_DOC_CATEGORIES, CATEGORY_KEYS, REQUIRED_PERSONNEL, EXPIRY_WARN_DAYS,
  TRAINING_CATEGORIES, ACCREDITATION_TYPES,
};
