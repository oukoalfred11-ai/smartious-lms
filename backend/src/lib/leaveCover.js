/**
 * lib/leaveCover.js — lessons while a teacher is on approved leave.
 *
 * For every approved leave that has not ended, each upcoming lesson of
 * that teacher inside the leave dates is either
 *   - handed to the replacement teacher (temporaryReplacementTeacherId):
 *     teacherId = cover teacher, originalTeacherId = the teacher on leave; or
 *   - flagged needsCover for the Director of Studies to arrange cover
 *     (or cancel as not held).
 * Cancelling the leave hands the lessons back (releaseLeaveCover).
 * Idempotent; run after every reconcile and when leave is approved.
 */
// Models are loaded lazily so leaveWindow() can be unit-tested without a database.
const LC = () => require('../models/LiveClass')

function leaveWindow(leave) {
  const from = new Date(leave.leaveStartDate)
  const to = new Date(leave.leaveEndDate)
  // The end date is a whole day: until 23:59 Nairobi on that day.
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate(), 20, 59, 59))
  return { from, to: end > to ? end : to }
}

async function applyLeaveCover(now = new Date()) {
  const TeacherLeaveRequest = require('../models/TeacherLeaveRequest')
  const leaves = await TeacherLeaveRequest.find({ status: 'Approved', leaveEndDate: { $gte: new Date(now.getTime() - 864e5) } }).lean()
  let covered = 0, flagged = 0
  for (const leave of leaves) {
    const { from, to } = leaveWindow(leave)
    const base = {
      teacherId: leave.teacherId, status: 'scheduled', kind: { $in: ['lesson', null] },
      scheduledAt: { $gte: from > now ? from : now, $lte: to },
    }
    if (leave.temporaryReplacementTeacherId) {
      const r = await LC().updateMany(base, {
        $set: { teacherId: leave.temporaryReplacementTeacherId, originalTeacherId: leave.teacherId, coverLeaveId: leave._id, needsCover: false },
      })
      covered += r.modifiedCount || 0
    } else {
      const r = await LC().updateMany({ ...base, needsCover: { $ne: true } }, { $set: { needsCover: true, coverLeaveId: leave._id } })
      flagged += r.modifiedCount || 0
    }
  }
  if (covered || flagged) console.log(`[leave cover] ${covered} lesson(s) handed to cover teachers, ${flagged} flagged as needing cover`)
  return { covered, flagged }
}

/** Leave cancelled: lessons go back to their own teacher. */
async function releaseLeaveCover(leaveId) {
  const future = { coverLeaveId: leaveId, status: 'scheduled', scheduledAt: { $gt: new Date() } }
  const handed = await LC().find({ ...future, originalTeacherId: { $ne: null } }).select('_id originalTeacherId').lean()
  for (const c of handed) {
    await LC().updateOne({ _id: c._id }, { $set: { teacherId: c.originalTeacherId, originalTeacherId: null, coverLeaveId: null, needsCover: false } })
  }
  const r = await LC().updateMany({ ...future, originalTeacherId: null }, { $set: { needsCover: false, coverLeaveId: null } })
  return handed.length + (r.modifiedCount || 0)
}

module.exports = { applyLeaveCover, releaseLeaveCover, leaveWindow }
