/**
 * routes/student-sessions.js
 * Mounted at /api/student-sessions
 * ============================================================
 * Pause / Report Back management for student accounts.
 * Available to admin, dos, ops_manager and accountant.
 *
 * A pause makes the auth middleware reject the student AND any
 * linked parent (all of whose students are paused) with
 * code ACCOUNT_PAUSED until Report Back or auto-expiry.
 */
const express = require('express')
const router  = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const User = require('../models/User')
const StudentPause = require('../models/StudentPause')
const { sendPauseNotice, sendReportBackNotice } = require('../services/notificationEmails')

async function parentEmailsFor(student) {
  const ids = [ ...(student.linkedParents || []) ].map(String)
  if (!ids.length) return []
  const parents = await User.find({ _id: { $in: ids }, role: 'parent' }).select('email').lean()
  return parents.map(p => p.email).filter(Boolean)
}

const STAFF = requireRole('admin', 'dos', 'ops_manager', 'accountant')

const TYPE_LABELS = {
  holiday: 'Holiday', mid_term_break: 'Mid-term break', end_term_break: 'End-term break',
  summer_break: 'Summer break', medical_leave: 'Medical leave',
  fee_hold: 'Late fee payment hold', other: 'Other',
}

// ── GET /api/student-sessions ───────────────────────────────
// Students with pause state + linked parents + active pause.
router.get('/', auth, STAFF, async (req, res) => {
  try {
    const { search, status = 'all', type = 'all' } = req.query
    const filter = { role: 'student' }
    if (status === 'paused') filter.onBreak = true
    if (status === 'active') filter.onBreak = { $ne: true }
    if (search) {
      const re = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter.$or = [{ firstName: re }, { lastName: re }, { email: re }, { admissionNumber: re }]
    }
    if (type !== 'all') filter.breakType = type

    const students = await User.find(filter)
      .select('firstName lastName email admissionNumber curriculum gradeLevel programme onBreak breakType breakStart breakEnd breakNote breakBlocksAccess linkedParents parentName parentEmail')
      .populate('linkedParents', 'firstName lastName email')
      .sort({ onBreak: -1, firstName: 1 })
      .limit(500)
      .lean()

    const pausedIds = students.filter(s => s.onBreak).map(s => s._id)
    const activePauses = pausedIds.length
      ? await StudentPause.find({ student: { $in: pausedIds }, status: 'active' })
          .populate('createdBy', 'firstName lastName role').lean()
      : []
    const pauseByStudent = {}
    activePauses.forEach(p => { pauseByStudent[String(p.student)] = p })

    return res.json({ success: true, data: {
      students: students.map(s => ({ ...s, activePause: pauseByStudent[String(s._id)] || null })),
      typeLabels: TYPE_LABELS,
    } })
  } catch (e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── GET /api/student-sessions/stats ─────────────────────────
router.get('/stats', auth, STAFF, async (req, res) => {
  try {
    const [total, paused, byType] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', onBreak: true }),
      User.aggregate([
        { $match: { role: 'student', onBreak: true } },
        { $group: { _id: '$breakType', count: { $sum: 1 } } },
      ]),
    ])
    const typeMap = {}
    byType.forEach(t => { typeMap[t._id || 'other'] = t.count })
    return res.json({ success: true, data: { total, paused, active: total - paused, byType: typeMap } })
  } catch (e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── GET /api/student-sessions/history/:studentId ────────────
router.get('/history/:studentId', auth, STAFF, async (req, res) => {
  try {
    const history = await StudentPause.find({ student: req.params.studentId })
      .populate('createdBy', 'firstName lastName role')
      .populate('endedBy', 'firstName lastName role')
      .sort({ createdAt: -1 }).limit(50).lean()
    return res.json({ success: true, data: { history } })
  } catch (e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── POST /api/student-sessions/pause ────────────────────────
router.post('/pause', auth, STAFF, async (req, res) => {
  try {
    const { studentId, type = 'other', note = '', expectedEnd = null } = req.body
    // Access blocking: explicit flag wins; otherwise fee holds block, breaks do not.
    const blockAccess = typeof req.body.blockAccess === 'boolean' ? req.body.blockAccess : (type === 'fee_hold')
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId is required.' })
    if (!TYPE_LABELS[type]) return res.status(400).json({ success: false, message: 'Invalid pause type.' })

    const student = await User.findOne({ _id: studentId, role: 'student' })
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })
    if (student.onBreak) return res.status(400).json({ success: false, message: 'Student already has an active pause. Mark Report Back first.' })

    const end = expectedEnd ? new Date(expectedEnd) : null
    if (end && isNaN(end)) return res.status(400).json({ success: false, message: 'Invalid expected return date.' })
    if (end && end <= new Date()) return res.status(400).json({ success: false, message: 'Expected return date must be in the future.' })

    const pause = await StudentPause.create({
      student: student._id, type, note: String(note).trim(),
      blockAccess,
      startAt: new Date(), expectedEnd: end,
      createdBy: req.user._id, createdByRole: req.user.role,
    })

    // Denormalise onto the user for zero-cost middleware enforcement.
    // NOTE: isActive stays TRUE — pause is a session state, not deactivation.
    student.onBreak = true
    student.breakType = type
    student.breakStart = pause.startAt
    student.breakEnd = end
    student.breakNote = pause.note
    student.breakBlocksAccess = blockAccess
    await student.save()

    // Auto-email student + linked parents (best-effort, non-blocking)
    parentEmailsFor(student)
      .then(parentEmails => sendPauseNotice({ student, parentEmails, pause, typeLabel: TYPE_LABELS[type] }))
      .catch(e => console.error('[sessions] pause email failed:', e.message))

    const accessMsg = blockAccess
      ? 'Portal access suspended for the student and linked parents.'
      : 'Student keeps portal access for homework and personal studies; reminders and check-in are paused.'
    return res.status(201).json({ success: true,
      message: `${student.firstName} ${student.lastName} paused (${TYPE_LABELS[type]}). ${accessMsg}`,
      data: { pause } })
  } catch (e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── PATCH /api/student-sessions/:id/report-back ─────────────
router.patch('/:id/report-back', auth, STAFF, async (req, res) => {
  try {
    const pause = await StudentPause.findOne({ _id: req.params.id, status: 'active' })
    if (!pause) return res.status(404).json({ success: false, message: 'Active pause not found.' })

    pause.status = 'ended'
    pause.endedAt = new Date()
    pause.endedBy = req.user._id
    await pause.save()

    const student = await User.findByIdAndUpdate(pause.student, {
      $set: { onBreak: false, breakType: '', breakStart: null, breakEnd: null, breakNote: '', breakBlocksAccess: false, isActive: true }
    }, { new: true })

    if (student) {
      parentEmailsFor(student)
        .then(parentEmails => sendReportBackNotice({ student, parentEmails, auto: false }))
        .catch(e => console.error('[sessions] report-back email failed:', e.message))
    }

    return res.json({ success: true,
      message: `${student ? student.firstName + ' ' + student.lastName : 'Student'} marked as reported back. Access restored.`,
      data: { pause } })
  } catch (e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── PATCH /api/student-sessions/report-back-by-student/:studentId ──
// Convenience for legacy pauses that have no StudentPause record.
router.patch('/report-back-by-student/:studentId', auth, STAFF, async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.studentId, role: 'student' })
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })

    await StudentPause.updateMany({ student: student._id, status: 'active' },
      { $set: { status: 'ended', endedAt: new Date(), endedBy: req.user._id } })

    student.onBreak = false
    student.breakType = ''
    student.breakStart = null
    student.breakEnd = null
    student.breakNote = ''
    student.breakBlocksAccess = false
    student.isActive = true
    await student.save()

    parentEmailsFor(student)
      .then(parentEmails => sendReportBackNotice({ student, parentEmails, auto: false }))
      .catch(e => console.error('[sessions] report-back email failed:', e.message))

    return res.json({ success: true, message: `${student.firstName} ${student.lastName} marked as reported back. Access restored.` })
  } catch (e) { return res.status(500).json({ success: false, message: e.message }) }
})

module.exports = router
