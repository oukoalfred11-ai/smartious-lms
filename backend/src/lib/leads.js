/**
 * lib/leads.js — one list of leads from the two places families first
 * reach us, and whether each one converted.
 *
 *   assessment requests (models/AssessmentRequest.js), from /assessment
 *   CRM enquiries       (models/Inquiry.js), logged by sales
 *
 * A lead is CONVERTED when the family now has a student at Smartious:
 *   - a student account whose parentEmail or email matches one of the
 *     lead's addresses, or
 *   - a parent account with that email and at least one linked child, or
 *   - a CRM enquiry marked "enrolled" or linked to a student, or an
 *     assessment request linked from such an enquiry.
 * Paying for the assessment is not conversion: many families pay or are
 * invoiced and never enrol, and those are the ones campaigns are for.
 *
 * The shaping and matching are pure (unit-tested); loadLeads() reads the
 * database.
 */
const norm = (e) => String(e || '').trim().toLowerCase()
const name = (...p) => p.map(x => String(x || '').trim()).filter(Boolean).join(' ')

const ASSESSMENT_STAGES = {
  awaiting_review: 'Awaiting review', info_requested: 'Information requested', accepted: 'Accepted',
  payment_pending: 'Invoiced, not paid', payment_received: 'Assessment paid', declined: 'Declined',
}
const INQUIRY_STAGES = {
  new: 'New enquiry', contacted: 'Contacted', interested: 'Interested', proposal_sent: 'Proposal sent',
  assessment_req: 'Assessment requested', enrolled: 'Enrolled', lost: 'Lost', unqualified: 'Unqualified',
}

function fromAssessment(a) {
  const emails = [a.parent1Email, a.hasParent2 ? a.parent2Email : '', a.studentEmail].map(norm).filter(e => e.includes('@'))
  const paid = a.status === 'payment_received' || !!a.paidAt
  return {
    id: String(a._id), type: 'assessment', ref: a.requestRef || '',
    parentName: name(a.parent1FirstName, a.parent1LastName), email: norm(a.parent1Email), emails,
    phone: a.parent1Phone || '', childName: name(a.studentFirstName, a.studentLastName), grade: a.studentGrade || '',
    country: a.countryIso || '', city: a.city || '', curriculum: (a.curriculumInterest || []).join(', '),
    stage: a.status, stageLabel: ASSESSMENT_STAGES[a.status] || a.status,
    invoiced: !!a.invoiceNo || !!a.invoiceSentAt || a.status === 'payment_pending', paid,
    invoiceNo: a.invoiceNo || '', createdAt: a.createdAt, flagged: false,
  }
}
function fromInquiry(q) {
  const emails = [q.parentEmail].map(norm).filter(e => e.includes('@'))
  return {
    id: String(q._id), type: 'inquiry', ref: '',
    parentName: q.parentName || '', email: norm(q.parentEmail), emails,
    phone: q.parentPhone || '', childName: q.studentName || '', grade: q.studentGrade || '',
    country: q.country || '', city: q.city || '', curriculum: q.curriculum || '',
    stage: q.status, stageLabel: INQUIRY_STAGES[q.status] || q.status,
    invoiced: false, paid: false, invoiceNo: '', createdAt: q.createdAt,
    flagged: q.status === 'enrolled' || !!q.convertedStudentId,
    assessmentRequestId: q.assessmentRequestId ? String(q.assessmentRequestId) : '',
  }
}

/**
 * Pure: mark each lead converted or not.
 *   students: [{ email, parentEmail }]   parents: [{ email, kids }] (kids = number of linked children)
 */
function markConverted(leads, students = [], parents = []) {
  const hit = new Set()
  for (const s of students) { if (s.parentEmail) hit.add(norm(s.parentEmail)); if (s.email) hit.add(norm(s.email)) }
  for (const p of parents) if (p.kids > 0 && p.email) hit.add(norm(p.email))
  // Assessment requests linked from an enrolled enquiry count too.
  const viaInquiry = new Set(leads.filter(l => l.type === 'inquiry' && l.flagged && l.assessmentRequestId).map(l => l.assessmentRequestId))
  return leads.map(l => {
    const byEmail = l.emails.find(e => hit.has(e))
    const converted = !!byEmail || l.flagged || (l.type === 'assessment' && viaInquiry.has(l.id))
    return { ...l, converted, convertedHow: byEmail ? 'Student account' : l.flagged ? 'Marked enrolled in CRM' : converted ? 'Enrolled via CRM enquiry' : '' }
  })
}

/** Pure: apply the list filters. */
function filterLeads(leads, f = {}) {
  const q = norm(f.q)
  const from = f.from ? new Date(f.from) : null
  const to = f.to ? new Date(new Date(f.to).getTime() + 864e5 - 1) : null
  return leads.filter(l => {
    if (f.source && f.source !== 'all' && l.type !== f.source) return false
    if (f.converted === 'yes' && !l.converted) return false
    if (f.converted === 'no' && l.converted) return false
    if (f.stage && f.stage !== 'all') {
      if (f.stage === 'invoiced_not_enrolled') { if (!(l.invoiced || l.paid) || l.converted) return false }
      else if (l.stage !== f.stage) return false
    }
    if (f.country && norm(l.country) !== norm(f.country)) return false
    if (from && new Date(l.createdAt) < from) return false
    if (to && new Date(l.createdAt) > to) return false
    if (q && ![l.parentName, l.childName, l.email, l.ref, l.phone, l.city].some(x => norm(x).includes(q))) return false
    return true
  })
}

/** Read both sources and mark conversions. */
async function loadLeads() {
  const AssessmentRequest = require('../models/AssessmentRequest')
  const Inquiry = require('../models/Inquiry')
  const User = require('../models/User')
  const [as, qs] = await Promise.all([
    AssessmentRequest.find({}).select('requestRef parent1FirstName parent1LastName parent1Email parent1Phone hasParent2 parent2Email studentFirstName studentLastName studentEmail studentGrade countryIso city curriculumInterest status invoiceNo invoiceSentAt paidAt createdAt').lean(),
    Inquiry.find({}).select('parentName parentEmail parentPhone studentName studentGrade country city curriculum status convertedStudentId assessmentRequestId createdAt').lean(),
  ])
  const leads = [...as.map(fromAssessment), ...qs.map(fromInquiry)]
  const emails = [...new Set(leads.flatMap(l => l.emails))]
  const [students, parents] = emails.length ? await Promise.all([
    // Case-insensitive match (collation strength 2): older accounts may
    // carry capitals in an email the lead typed in lowercase.
    User.find({ role: 'student', $or: [{ parentEmail: { $in: emails } }, { email: { $in: emails } }] }).collation({ locale: 'en', strength: 2 }).select('email parentEmail').lean(),
    User.find({ role: 'parent', email: { $in: emails } }).collation({ locale: 'en', strength: 2 }).select('email linkedStudents children').lean(),
  ]) : [[], []]
  return markConverted(leads, students, parents.map(p => ({ email: p.email, kids: (p.linkedStudents || []).length + (p.children || []).length })))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

module.exports = { fromAssessment, fromInquiry, markConverted, filterLeads, loadLeads, ASSESSMENT_STAGES, INQUIRY_STAGES, norm }
