/**
 * constants/admissionDocs.js — what a student's admission file holds.
 * Matches item 5 of the Admission Pack ("Documents to submit").
 */
const ADMISSION_DOC_CATEGORIES = [
  { key: 'admission_agreement', label: 'Signed Admission Agreement', required: true,  hint: 'Part 2 of the Admission Pack, completed and signed by the student and a parent.' },
  { key: 'identity',            label: 'Passport or birth certificate', required: true, hint: 'A clear copy of the photo page or the birth certificate.' },
  { key: 'photo',               label: 'Passport-size photograph', required: true,  hint: 'A recent photo on a plain background.' },
  { key: 'school_report',       label: 'Most recent school report', required: true,  hint: 'The latest report from the previous school.' },
  { key: 'exam_certificates',   label: 'Examination certificates', required: false, hint: 'For example IGCSE results, if the student has any.' },
  { key: 'learning_needs',      label: 'Learning-needs reports', required: false, hint: 'Educational psychologist, therapist or doctor reports, if you have them.' },
  { key: 'proof_of_payment',    label: 'Proof of payment (first term)', required: true,  hint: 'Bank slip, M-Pesa message or card receipt.' },
  { key: 'other',               label: 'Other document', required: false, hint: '' },
]
const ADMISSION_DOC_KEYS = ADMISSION_DOC_CATEGORIES.map(c => c.key)
const REQUIRED_ADMISSION_DOCS = ADMISSION_DOC_CATEGORIES.filter(c => c.required).map(c => c.key)

// Only the Principal (admin) and the Dean & Operations role may open,
// verify or reject a student's admission documents.
const ADMISSION_REVIEW_ROLES = ['admin', 'dos', 'ops_manager']

module.exports = { ADMISSION_DOC_CATEGORIES, ADMISSION_DOC_KEYS, REQUIRED_ADMISSION_DOCS, ADMISSION_REVIEW_ROLES }
