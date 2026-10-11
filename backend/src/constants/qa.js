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

// ── The team ───────────────────────────────────────────────
// Every staff account is part of the team and keeps a staff file.
// Students, parents and demo accounts are not staff.
const TEAM_ROLES = ['admin', 'dos', 'ops_manager', 'qa', 'accountant', 'sales', 'teacher'];

// The admin account is the school's Principal.
const ROLE_TITLES = {
  admin: 'Principal',
  // One merged role, shared by two people.
  dos: 'Dean & Operations',
  ops_manager: 'Dean & Operations',
  qa: 'Quality Assurance',
  accountant: 'Accountant',
  sales: 'Sales & Front Desk',
  teacher: 'Teacher',
};

// Teachers come in three kinds. Set by the Principal (or the Dean or
// Operations) on the teacher's profile; new teachers start as 'teacher'.
const TEACHER_CATEGORIES = [
  { key: 'teacher', label: 'Teacher', short: 'Teacher', desc: 'Qualified teacher, teaching classes' },
  { key: 'trainee', label: 'Teacher in training', short: 'In training', desc: 'Being trained; teaches under supervision' },
  { key: 'support', label: 'Support teacher', short: 'Support', desc: 'Helps with lesson preparation, resources and marking' },
];
const TEACHER_CATEGORY_KEYS = TEACHER_CATEGORIES.map(c => c.key);

// Groups for filtering the team page.
const TEAM_GROUPS = [
  { key: 'leadership', label: 'Leadership', roles: ['admin', 'dos', 'ops_manager', 'qa'] },
  { key: 'teaching', label: 'Teaching', roles: ['teacher'] },
  { key: 'operations', label: 'Operations', roles: ['accountant', 'sales'] },
];
const teamGroup = (role) => (TEAM_GROUPS.find(g => g.roles.includes(role)) || {}).key || 'operations';

/** "Principal", "Teacher in training", "Accountant"… */
function teamTitle(u) {
  if (!u) return ''
  if (u.role === 'teacher') {
    const c = TEACHER_CATEGORIES.find(x => x.key === (u.teacherCategory || 'teacher'));
    return c ? c.label : 'Teacher';
  }
  if (['dos', 'ops_manager'].includes(u.role) && (u.additionalRoles || []).includes('qa'))
    return 'Dean & Quality Assurance';
  return ROLE_TITLES[u.role] || 'Staff';
}

/**
 * The documents a person's staff file must contain. Everyone working
 * with children needs a CV, ID, police clearance, a contract,
 * safeguarding training and their academic certificates; a qualified
 * teacher also needs the teaching qualification and licence. Teachers
 * in training and support teachers are not yet expected to hold those.
 */
const BASE_REQUIRED = ['cv', 'academic_certificate', 'identification', 'police_clearance', 'contract', 'safeguarding_certificate'];
function requiredFor(u) {
  if (u && u.role === 'teacher' && (u.teacherCategory || 'teacher') === 'teacher') return REQUIRED_PERSONNEL;
  return BASE_REQUIRED;
}

module.exports = {
  TEACHER_DOC_CATEGORIES, CATEGORY_KEYS, REQUIRED_PERSONNEL, EXPIRY_WARN_DAYS,
  TRAINING_CATEGORIES, ACCREDITATION_TYPES,
  TEAM_ROLES, ROLE_TITLES, TEACHER_CATEGORIES, TEACHER_CATEGORY_KEYS, TEAM_GROUPS,
  teamGroup, teamTitle, requiredFor,
};
