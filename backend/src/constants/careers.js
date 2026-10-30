/**
 * constants/careers.js — the keys the careers and partnership forms use.
 *
 * Labels, help text and the per-type partnership fields live in the
 * website's copy (frontend/src/data/careers.js); test/careers.test.js
 * checks that the two lists of keys stay identical.
 */
const { TEACHER_DOC_CATEGORIES, requiredFor } = require('./qa')

// ── Careers ────────────────────────────────────────────────
const POSITIONS = ['online_teacher', 'centre_teacher', 'tutor', 'exam_specialist', 'non_teaching']
const TEACHING_POSITIONS = ['online_teacher', 'centre_teacher', 'tutor', 'exam_specialist']

const APPLICATION_STATUSES = ['new', 'screening', 'shortlisted', 'demo_review', 'interview', 'offer', 'hired', 'on_hold', 'rejected', 'withdrawn']
const OPEN_STATUSES = ['new', 'screening', 'shortlisted', 'demo_review', 'interview', 'offer', 'on_hold']

// The same personnel documents a teacher keeps in the portal (constants/qa.js),
// less the employment contract, which only exists after hiring. Licence,
// police clearance and safeguarding take time to obtain, so an applicant may
// mark them "in progress" instead of uploading.
const APPLICANT_DOCS = TEACHER_DOC_CATEGORIES
  .filter(c => c.group === 'personnel' && !['contract', 'observation_report', 'appraisal'].includes(c.key))
  .map(c => ({ key: c.key, label: c.label, required: !!c.required, mayBePending: !!c.expires }))
const REQUIRED_DOCS = APPLICANT_DOCS.filter(d => d.required).map(d => d.key)
// Non-teaching roles: what the portal requires of non-teaching staff, less the contract.
const REQUIRED_DOCS_STAFF = requiredFor({ role: 'admin' }).filter(k => k !== 'contract')
const requiredDocsFor = (position) => position === 'non_teaching' ? REQUIRED_DOCS_STAFF : REQUIRED_DOCS
const PENDING_OK = APPLICANT_DOCS.filter(d => d.mayBePending).map(d => d.key)

const REVIEW_CRITERIA = ['subject_knowledge', 'pedagogy', 'online_presence', 'communication', 'assessment_feedback']

// ── Partnerships ───────────────────────────────────────────
const PARTNERSHIP_TYPES = [
  'university_scholarships', 'exam_centre', 'training_provider', 'co_curricular', 'school_partnership',
  'technology', 'content_publisher', 'corporate_family', 'education_agent', 'ngo_foundation', 'media', 'other',
]
const PARTNERSHIP_STATUSES = ['new', 'in_discussion', 'proposal', 'agreement', 'active', 'declined', 'archived']
// Documents every organisation uploads with an enquiry (labels in frontend/src/data/careers.js).
const PARTNER_DOCS = ['registration', 'licence', 'proof_of_operations', 'other']
const REQUIRED_PARTNER_DOCS = ['registration', 'licence', 'proof_of_operations']
const PARTNER_MAX_FILES = 8

// ── Uploads ────────────────────────────────────────────────
const DOC_MIME = [
  'application/pdf', 'image/png', 'image/jpeg', 'image/webp',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska']
const DOC_MAX_BYTES = 15 * 1024 * 1024        // 15 MB a document
const VIDEO_MAX_BYTES = 1024 * 1024 * 1024    // 1 GB demo lesson
const MAX_FILES = 30                          // per application, all kinds

module.exports = {
  POSITIONS, TEACHING_POSITIONS, APPLICATION_STATUSES, OPEN_STATUSES,
  APPLICANT_DOCS, REQUIRED_DOCS, REQUIRED_DOCS_STAFF, requiredDocsFor, PENDING_OK, REVIEW_CRITERIA,
  PARTNERSHIP_TYPES, PARTNERSHIP_STATUSES, PARTNER_DOCS, REQUIRED_PARTNER_DOCS, PARTNER_MAX_FILES,
  DOC_MIME, VIDEO_MIME, DOC_MAX_BYTES, VIDEO_MAX_BYTES, MAX_FILES,
}
