/**
 * lib/studentPurge.js — permanently delete a student who left, typically
 * one marked as left who never really enrolled.
 *
 * Leaving (lib/studentExit.js) keeps every record. This removes them:
 * the account and everything filed against it (attendance, reports,
 * marks, exam and homework work, progress, documents, allocations,
 * enrolment records, unpaid invoices and payment requests). The student
 * comes off timetable slots and upcoming lessons; past lessons keep the
 * class but lose the name. Linked parents lose the link; a parent left
 * with no other child is deleted too when asked (deleteParents).
 *
 * It refuses a student with a PAID invoice or a successful card payment:
 * money records stay for the accounts.
 */
const User = require('../models/User')

// [model file, student field, label shown before deleting]
const RECORDS = [
  ['Attendance', 'studentId', 'attendance records'],
  ['Report', 'studentId', 'reports'],
  ['WeeklyReport', 'studentId', 'weekly reports'],
  ['MarkEntry', 'studentId', 'marks'],
  ['ExamSubmission', 'studentId', 'exam scripts'],
  ['HomeworkSubmission', 'student', 'homework submissions'],
  ['QuizSession', 'studentId', 'quiz sessions'],
  ['LessonProgress', 'studentId', 'lesson progress records'],
  ['StudentSyllabusProgress', 'studentId', 'syllabus progress records'],
  ['TopicConfidence', 'studentId', 'topic confidence records'],
  ['StudentAchievement', 'studentId', 'achievements'],
  ['Intervention', 'studentId', 'interventions'],
  ['AcademicCorrection', 'studentId', 'academic corrections'],
  ['AdmissionDocument', 'studentId', 'admission documents'],
  ['Allocation', 'studentId', 'subject allocations'],
  ['Enrollment', 'studentId', 'enrolment records'],
  ['StudentPause', 'student', 'break records'],
  ['LabSession', 'studentId', 'virtual lab sessions'],
  ['ClubProject', 'studentId', 'club projects'],
  ['Invoice', 'studentId', 'invoices (unpaid)'],
  ['PaystackRequest', 'studentId', 'card payment requests (unpaid)'],
]
const model = (name) => { try { return require('../models/' + name) } catch (e) { return null } }

/** Pure: why this student cannot be deleted, or '' when they can. */
function blockReason(impact) {
  if (!impact) return 'Student not found.'
  if (!impact.hasLeft) return 'Only students marked as left or graduated can be deleted permanently. Mark them as left first.'
  if (impact.paid > 0) return `This student has ${impact.paid} paid invoice(s) or card payment(s). Payment records are kept for the accounts, so the student cannot be deleted. Keep them as a leaver instead.`
  return ''
}

/** Pure: of the linked parents, which to delete (no other child left). */
function parentsToDelete(parents, studentId, deleteParents) {
  if (!deleteParents) return []
  const sid = String(studentId)
  return (parents || []).filter(p => {
    const kids = [...(p.linkedStudents || []), ...(p.children || [])].map(String).filter(id => id !== sid)
    return kids.length === 0
  })
}

async function linkedParents(student) {
  const ids = new Set((student.linkedParents || []).map(String))
  if (student.parentId) ids.add(String(student.parentId))
  const byLink = await User.find({ role: 'parent', $or: [{ linkedStudents: student._id }, { children: student._id }] })
    .select('firstName lastName email linkedStudents children').lean()
  const more = ids.size ? await User.find({ _id: { $in: [...ids] }, role: 'parent' }).select('firstName lastName email linkedStudents children').lean() : []
  const all = new Map([...byLink, ...more].map(p => [String(p._id), p]))
  return [...all.values()]
}

/** What deleting this student removes. */
async function impactOf(studentId) {
  const student = await User.findById(studentId).lean()
  if (!student || student.role !== 'student') return null
  const { hasLeft } = require('./studentExit')
  const counts = []
  for (const [name, field, label] of RECORDS) {
    const M = model(name)
    if (!M) continue
    const n = await M.countDocuments({ [field]: student._id })
    if (n) counts.push({ label, n })
  }
  const Invoice = model('Invoice'), Pay = model('PaystackRequest')
  const paid = (Invoice ? await Invoice.countDocuments({ studentId: student._id, $or: [{ status: 'paid' }, { paidAmount: { $gt: 0 } }] }) : 0)
    + (Pay ? await Pay.countDocuments({ studentId: student._id, status: 'paid' }) : 0)
  const parents = await linkedParents(student)
  return {
    name: [student.firstName, student.lastName].filter(Boolean).join(' '),
    admissionNumber: student.admissionNumber || '',
    hasLeft: hasLeft(student) || student.isActive === false,
    paid, counts,
    parents: parents.map(p => ({ _id: p._id, name: [p.firstName, p.lastName].filter(Boolean).join(' '), email: p.email,
      onlyChild: parentsToDelete([p], student._id, true).length === 1 })),
  }
}

/** Delete the student and their records. Returns a summary. */
async function purgeStudent(studentId, { deleteParents = false } = {}) {
  const impact = await impactOf(studentId)
  const why = blockReason(impact)
  if (why) { const e = new Error(why); e.status = impact ? 409 : 404; throw e }
  const student = await User.findById(studentId)
  const sid = student._id

  await require('./studentExit').detachFromSchedule([sid])
  try { await model('TimetableEntry')?.updateMany({ assignedStudents: sid }, { $pull: { assignedStudents: sid } }) } catch (e) { /* best effort */ }
  try { await model('LiveClass')?.updateMany({ assignedStudents: sid }, { $pull: { assignedStudents: sid } }) } catch (e) { /* best effort */ }
  try { await model('LabAssignment')?.updateMany({ studentIds: sid }, { $pull: { studentIds: sid } }) } catch (e) { /* best effort */ }
  try { await model('GroupRoom')?.updateMany({ students: sid }, { $pull: { students: sid } }) } catch (e) { /* best effort */ }
  try { await model('Exam')?.updateMany({ assignedStudents: sid }, { $pull: { assignedStudents: sid } }) } catch (e) { /* best effort */ }

  let records = 0
  for (const [name, field] of RECORDS) {
    const M = model(name)
    if (!M) continue
    const r = await M.deleteMany({ [field]: sid })
    records += r.deletedCount || 0
  }
  try { await model('Notification')?.deleteMany({ userId: sid }) } catch (e) { /* best effort */ }

  const parents = await linkedParents(student)
  const doomed = parentsToDelete(parents, sid, deleteParents)
  await User.updateMany({ role: 'parent', $or: [{ linkedStudents: sid }, { children: sid }] }, { $pull: { linkedStudents: sid, children: sid } })
  let parentsDeleted = 0
  for (const p of doomed) {
    const r = await User.deleteOne({ _id: p._id, role: 'parent', isMainAdmin: { $ne: true } })
    parentsDeleted += r.deletedCount || 0
    try { await model('Notification')?.deleteMany({ userId: p._id }) } catch (e) { /* best effort */ }
  }

  await student.deleteOne()
  return { name: impact.name, records, parentsDeleted }
}

module.exports = { RECORDS, blockReason, parentsToDelete, impactOf, purgeStudent }
