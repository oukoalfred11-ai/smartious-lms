/**
 * routes/lessonPlan.js — the student's lesson plan and their own progress.
 *
 *   GET  /api/lesson-plan/me                     student: my plan, every subject
 *   PUT  /api/lesson-plan/me/confidence          student: "got it" / "need help" on a topic
 *   GET  /api/lesson-plan/student/:id            parent (linked), the student's teachers, staff
 *   GET  /api/lesson-plan/teacher/help           teacher: open "need help" flags from their students
 *   POST /api/lesson-plan/teacher/help/:id/resolve
 */
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const User = require('../models/User')
const TimetableEntry = require('../models/TimetableEntry')
const TopicConfidence = require('../models/TopicConfidence')
const { buildStudentPlan } = require('../lib/studentPlan')

const STAFF = ['admin', 'dos', 'ops_manager']
const ok = (res, data, message) => res.json({ success: true, data, message })
const fail = (res, code, message) => res.status(code).json({ success: false, message })

async function canSee(user, student) {
  if (STAFF.includes(user.role)) return true
  if (user.role === 'student') return String(user._id) === String(student._id)
  if (user.role === 'parent') {
    const parent = await User.findById(user._id).select('linkedStudents email').lean()
    return (parent?.linkedStudents || []).map(String).includes(String(student._id)) || student.parentEmail === user.email
  }
  if (user.role === 'teacher') {
    return !!(await TimetableEntry.exists({ teacherId: user._id, isActive: true, assignedStudents: student._id }))
  }
  return false
}

router.get('/me', auth, requireRole('student'), async (req, res) => {
  try {
    const student = await User.findById(req.user._id).lean()
    return ok(res, await buildStudentPlan(student))
  } catch (e) { console.error('[lesson-plan me]', e.message); return fail(res, 500, 'Could not load your lesson plan.') }
})

router.put('/me/confidence', auth, requireRole('student'), async (req, res) => {
  try {
    const b = req.body || {}
    const key = String(b.key || '').slice(0, 400)
    if (!key) return fail(res, 400, 'Which topic?')
    const subjectId = mongoose.isValidObjectId(b.subjectId) ? b.subjectId : null
    const filter = { studentId: req.user._id, subjectId, key }
    if (!b.state) { await TopicConfidence.deleteOne(filter); return ok(res, { cleared: true }, 'Cleared.') }
    if (!['got_it', 'need_help'].includes(b.state)) return fail(res, 400, 'Choose "I\'ve got it" or "I need help".')
    const doc = await TopicConfidence.findOneAndUpdate(filter, {
      $set: { state: b.state, note: String(b.note || '').slice(0, 500), title: String(b.title || '').slice(0, 300), subject: String(b.subject || '').slice(0, 120), resolvedAt: null, resolvedBy: null },
    }, { upsert: true, new: true, setDefaultsOnInsert: true })
    return ok(res, { confidence: doc }, b.state === 'need_help' ? 'Your teacher will see that you need help with this topic.' : 'Marked as understood.')
  } catch (e) { console.error('[lesson-plan confidence]', e.message); return fail(res, 500, 'Could not save.') }
})

router.get('/student/:id', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid student.')
    const student = await User.findById(req.params.id).lean()
    if (!student || student.role !== 'student') return fail(res, 404, 'Student not found.')
    if (!(await canSee(req.user, student))) return fail(res, 403, 'Not authorised to view this student.')
    return ok(res, await buildStudentPlan(student))
  } catch (e) { console.error('[lesson-plan student]', e.message); return fail(res, 500, 'Could not load the lesson plan.') }
})

router.get('/teacher/help', auth, requireRole('teacher', ...STAFF), async (req, res) => {
  try {
    const q = { state: 'need_help', resolvedAt: null }
    if (!STAFF.includes(req.user.role)) {
      const entries = await TimetableEntry.find({ teacherId: req.user._id, isActive: true }).select('assignedStudents subjectId').lean()
      const pairs = entries.filter(e => e.subjectId).flatMap(e => (e.assignedStudents || []).map(s => ({ studentId: s, subjectId: e.subjectId })))
      if (!pairs.length) return ok(res, { flags: [] })
      q.$or = pairs
    }
    const flags = await TopicConfidence.find(q).sort({ updatedAt: -1 }).limit(200)
      .populate('studentId', 'firstName lastName').lean()
    return ok(res, { flags })
  } catch (e) { console.error('[lesson-plan help]', e.message); return fail(res, 500, 'Could not load help requests.') }
})

router.post('/teacher/help/:id/resolve', auth, requireRole('teacher', ...STAFF), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid id.')
    const flag = await TopicConfidence.findById(req.params.id)
    if (!flag) return fail(res, 404, 'Not found.')
    if (!STAFF.includes(req.user.role)) {
      const teaches = await TimetableEntry.exists({ teacherId: req.user._id, isActive: true, assignedStudents: flag.studentId, subjectId: flag.subjectId })
      if (!teaches) return fail(res, 403, 'Not your student.')
    }
    flag.resolvedAt = new Date(); flag.resolvedBy = req.user._id
    await flag.save()
    return ok(res, { flag }, 'Marked as dealt with.')
  } catch (e) { console.error('[lesson-plan resolve]', e.message); return fail(res, 500, 'Could not update.') }
})

module.exports = router
