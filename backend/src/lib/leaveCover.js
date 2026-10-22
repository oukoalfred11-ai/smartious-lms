/**
 * lib/leaveCover.js — lessons while a teacher is on approved leave.
 *
 * Policy: lessons are NOT handed to another teacher. Every lesson of the
 * teacher inside the leave dates is cancelled ("Teacher unavailable"),
 * the families are told once per leave (the student and parents get the
 * dates and the lessons affected), and the teacher agrees with the
 * student(s) in their next class when to recover the missed sessions.
 * Missed sessions are listed for the teacher until a make-up lesson is
 * booked for each (or the teacher records that none is needed).
 *
 * Cancelling the leave restores the lessons that have not happened yet
 * and tells the families (releaseLeaveCover).
 *
 * Idempotent; run after every timetable reconcile (so lessons created
 * later inside a long leave are cancelled too) and when leave is approved.
 */
// Models are loaded lazily so leaveWindow() can be unit-tested without a database.
const LC = () => require('../models/LiveClass')

const LEAVE_REASON = 'Teacher unavailable (approved leave)'

function leaveWindow(leave) {
  const from = new Date(leave.leaveStartDate)
  const to = new Date(leave.leaveEndDate)
  // The end date is a whole day: until 23:59 Nairobi on that day.
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate(), 20, 59, 59))
  return { from, to: end > to ? end : to }
}

async function applyLeaveCover(now = new Date()) {
  const TeacherLeaveRequest = require('../models/TeacherLeaveRequest')
  const User = require('../models/User')
  const leaves = await TeacherLeaveRequest.find({ status: 'Approved', leaveEndDate: { $gte: new Date(now.getTime() - 864e5) } })
  let cancelled = 0
  for (const leave of leaves) {
    const { from, to } = leaveWindow(leave)
    if (to < now) continue
    // The teacher's lessons in the leave - including any an earlier
    // version of this code handed to a cover teacher (handed back here).
    const lessons = await LC().find({
      $or: [{ teacherId: leave.teacherId }, { originalTeacherId: leave.teacherId, coverLeaveId: leave._id }],
      status: { $in: ['scheduled', 'live'] }, kind: { $in: ['lesson', null] },
      scheduledAt: { $gte: from > now ? from : now, $lte: to },
    })
    if (!lessons.length) continue
    const entries = new Set()
    for (const lc of lessons) {
      if (lc.originalTeacherId) { lc.teacherId = lc.originalTeacherId; lc.originalTeacherId = null }
      if (lc.timetableEntryId && !lc.originalScheduledAt) lc.originalScheduledAt = lc.scheduledAt
      lc.status = 'cancelled'
      lc.cancelledAt = now
      lc.cancelReason = LEAVE_REASON
      lc.leaveMissed = true
      lc.coverLeaveId = leave._id
      lc.needsCover = false
      try { await lc.save() } catch (e) { console.error('[leave] cancel', lc._id, e.message); continue }
      if (lc.timetableEntryId) entries.add(String(lc.timetableEntryId))
      cancelled++
    }
    // The topics move on to the lessons after the leave.
    for (const id of entries) await require('./lessonPlan').restampForEntryId(id)
    await notifyFamilies(leave)
  }

  // A leave that is over: the teacher is back (nothing else resets this).
  const back = await User.find({ role: 'teacher', isOnLeave: true, leaveEndDate: { $lt: new Date(now.getTime() - 864e5) } }).select('_id')
  for (const t of back) {
    const still = await TeacherLeaveRequest.exists({ teacherId: t._id, status: 'Approved', leaveEndDate: { $gte: new Date(now.getTime() - 864e5) } })
    if (!still) await User.updateOne({ _id: t._id }, { $set: { isOnLeave: false, teacherStatus: 'Active', leaveStartDate: null, leaveEndDate: null } })
  }

  if (cancelled) console.log(`[leave] ${cancelled} lesson(s) cancelled for approved teacher leave`)
  return { cancelled }
}

/**
 * Tell each affected student and their parents ONCE per leave: the
 * teacher is unavailable, these lessons will not take place, and the
 * teacher will agree the make-up times with the student in the next class.
 */
async function notifyFamilies(leave) {
  const missed = await LC().find({ coverLeaveId: leave._id, leaveMissed: true, status: 'cancelled' })
    .sort({ scheduledAt: 1 }).select('assignedStudents subject title scheduledAt deliveryMode').lean()
  const done = new Set((leave.familiesNotified || []).map(String))
  const byStudent = new Map()
  for (const lc of missed) {
    for (const sid of lc.assignedStudents || []) {
      const k = String(sid)
      if (done.has(k)) continue
      if (!byStudent.has(k)) byStudent.set(k, [])
      byStudent.get(k).push(lc)
    }
  }
  if (!byStudent.size) return 0
  const User = require('../models/User')
  const teacher = await User.findById(leave.teacherId).select('firstName lastName').lean()
  const { teacherUnavailable } = require('./lessonNotices')
  const sent = []
  for (const [sid, list] of byStudent) {
    const ok = await teacherUnavailable({ studentId: sid, teacher, leave, lessons: list })
    if (ok) sent.push(sid)
  }
  if (sent.length) {
    const TeacherLeaveRequest = require('../models/TeacherLeaveRequest')
    await TeacherLeaveRequest.updateOne({ _id: leave._id }, { $addToSet: { familiesNotified: { $each: sent } } })
  }
  return sent.length
}

/** Leave cancelled: lessons that have not happened yet take place after all. */
async function releaseLeaveCover(leaveId) {
  const future = await LC().find({ coverLeaveId: leaveId, status: 'cancelled', leaveMissed: true, scheduledAt: { $gt: new Date() } })
  const entries = new Set()
  for (const lc of future) {
    lc.status = 'scheduled'
    lc.cancelledAt = null
    lc.cancelReason = ''
    lc.leaveMissed = false
    lc.coverLeaveId = null
    try { await lc.save() } catch (e) { console.error('[leave] restore', lc._id, e.message); continue }
    if (lc.timetableEntryId) entries.add(String(lc.timetableEntryId))
  }
  for (const id of entries) await require('./lessonPlan').restampForEntryId(id)
  // Lessons handed to a cover teacher by the old policy go back too.
  const handed = await LC().find({ coverLeaveId: leaveId, originalTeacherId: { $ne: null }, status: 'scheduled', scheduledAt: { $gt: new Date() } }).select('_id originalTeacherId').lean()
  for (const c of handed) {
    await LC().updateOne({ _id: c._id }, { $set: { teacherId: c.originalTeacherId, originalTeacherId: null, coverLeaveId: null, needsCover: false } })
  }
  if (future.length) {
    const { lessonsRestored } = require('./lessonNotices')
    lessonsRestored(future).catch(e => console.error('[leave] restored notice', e.message))
  }
  return future.length + handed.length
}

module.exports = { applyLeaveCover, releaseLeaveCover, leaveWindow, LEAVE_REASON }
