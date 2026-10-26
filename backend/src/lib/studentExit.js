/**
 * lib/studentExit.js
 * A student who has graduated or left keeps every record (attendance,
 * reports, invoices, past lessons) but takes no further part in the
 * schedule: no future lessons, no timetable slots, no lesson emails.
 *
 * A student has LEFT when archived (the exit door in
 * routes/student-sessions.js), or when their status is Graduated or
 * Removed (year promotion graduates terminal grades without archiving).
 *
 * detachFromSchedule() takes leavers off upcoming lessons and timetable
 * slots. A lesson or slot left with nobody on it is cancelled / switched
 * off, so the teacher is not reminded about an empty class. Past lessons
 * are never touched. It runs on exit and graduation, and once at startup
 * (index.js) for students who left before it existed; it is idempotent.
 */
const LiveClass = require('../models/LiveClass')
const TimetableEntry = require('../models/TimetableEntry')
const User = require('../models/User')

const LEFT_STATUSES = ['Graduated', 'Removed']

/** The Mongo filter for students who have graduated or left. */
const LEFT_FILTER = { role: 'student', $or: [{ archived: true }, { studentStatus: { $in: LEFT_STATUSES } }] }

/** Has this student graduated or left? (Needs archived and studentStatus.) */
function hasLeft(student) {
  return !!student && (student.archived === true || LEFT_STATUSES.includes(student.studentStatus))
}

/** Take students off future lessons and timetable slots. Returns the counts. */
async function detachFromSchedule(studentIds, { now = new Date() } = {}) {
  const ids = (studentIds || []).filter(Boolean)
  if (!ids.length) return { lessons: 0, lessonsCancelled: 0, slots: 0, slotsOff: 0 }
  const idsOf = async (Model, f) => (await Model.find(f).select('_id').lean()).map(d => d._id)
  // Read which lessons and slots they are on before taking them off.
  const future = { assignedStudents: { $in: ids }, status: 'scheduled', scheduledAt: { $gte: now } }
  const lessonIds = await idsOf(LiveClass, future)
  const slotIds = await idsOf(TimetableEntry, { assignedStudents: { $in: ids } })
  if (!lessonIds.length && !slotIds.length) return { lessons: 0, lessonsCancelled: 0, slots: 0, slotsOff: 0 }

  const lessons = await LiveClass.updateMany({ _id: { $in: lessonIds } }, { $pull: { assignedStudents: { $in: ids } } })
  const lessonsCancelled = await LiveClass.updateMany(
    { _id: { $in: lessonIds }, status: 'scheduled', assignedStudents: { $size: 0 }, kind: { $in: ['lesson', null] } },
    { $set: { status: 'cancelled', cancelledAt: now, cancelReason: 'No students left on this lesson (graduated or left).' } },
  )
  const slots = await TimetableEntry.updateMany({ _id: { $in: slotIds } }, { $pull: { assignedStudents: { $in: ids } } })
  // A slot with no students and no curriculum+grade audience serves nobody.
  const slotsOff = await TimetableEntry.updateMany(
    { _id: { $in: slotIds }, isActive: { $ne: false }, assignedStudents: { $size: 0 },
      $or: [{ audienceCurriculum: { $in: ['', null] } }, { audienceGrade: { $in: ['', null] } }] },
    { $set: { isActive: false } },
  )
  return {
    lessons: lessons.modifiedCount || 0, lessonsCancelled: lessonsCancelled.modifiedCount || 0,
    slots: slots.modifiedCount || 0, slotsOff: slotsOff.modifiedCount || 0,
  }
}

/** Startup pass: detach everyone who has already graduated or left. */
async function detachAllLeavers() {
  if (String(process.env.DETACH_LEAVERS || '').toLowerCase() === 'off') return null
  const ids = (await User.find(LEFT_FILTER).select('_id').lean()).map(u => u._id)
  // Plus deleted accounts still sitting on lessons and slots (deleting a
  // student did not take them off the schedule before).
  const onSchedule = [...new Set([
    ...(await LiveClass.distinct('assignedStudents', { status: 'scheduled', scheduledAt: { $gte: new Date() } })),
    ...(await TimetableEntry.distinct('assignedStudents', {})),
  ].map(String))]
  if (onSchedule.length) {
    const existing = new Set((await User.find({ _id: { $in: onSchedule } }).select('_id').lean()).map(u => String(u._id)))
    const gone = onSchedule.filter(id => !existing.has(id))
    if (gone.length) {
      console.log(`[leavers] ${gone.length} deleted student account(s) still on the schedule: taking them off`)
      ids.push(...gone)
    }
  }
  const r = await detachFromSchedule(ids)
  if (r.lessons || r.slots) console.log(`[leavers] ${ids.length} graduated/left students: off ${r.lessons} upcoming lessons (${r.lessonsCancelled} now empty, cancelled) and ${r.slots} timetable slots (${r.slotsOff} switched off)`)
  return r
}

module.exports = { LEFT_STATUSES, LEFT_FILTER, hasLeft, detachFromSchedule, detachAllLeavers }
