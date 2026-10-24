/**
 * lib/deliverySync.js
 * Keeps timetable slots and upcoming lessons in step with how their students
 * learn (User.deliveryMode, see lib/learningMode.js).
 *
 * TimetableEntry.deliveryMode and LiveClass.deliveryMode ('virtual' |
 * 'physical') are stored per slot / per lesson, and some features read them
 * directly (the timetable, the missed-lessons streak, the materialiser that
 * copies slots into lessons). They were not updated when a student was
 * switched between Virtual and In-person. This brings them in line:
 *   - every student on it In-person → 'physical'
 *   - every student on it Virtual   → 'virtual'
 *   - any Hybrid student, or a mix  → left alone (decided per lesson)
 * Only active slots and lessons still to come (scheduled) are changed;
 * past lessons keep their record.
 */
const TimetableEntry = require('../models/TimetableEntry')
const LiveClass = require('../models/LiveClass')
const User = require('../models/User')
const { learningMode } = require('./learningMode')

/** 'physical' | 'virtual' | null (leave alone) for a set of students. */
function wantedMode(students) {
  if (!students.length) return null
  const modes = new Set(students.map(learningMode))
  if (modes.size !== 1 || modes.has('hybrid')) return null
  return modes.has('physical') ? 'physical' : 'virtual'
}

/**
 * Bring slots and upcoming lessons in line. studentIds limits it to the
 * slots and lessons those students are on (all students when omitted).
 * dryRun reports what would change without writing.
 */
async function syncDeliveryModes({ studentIds = null, dryRun = false, now = new Date() } = {}) {
  const who = studentIds ? { assignedStudents: { $in: studentIds } } : { 'assignedStudents.0': { $exists: true } }
  const [entries, lessons] = await Promise.all([
    TimetableEntry.find({ ...who, isActive: { $ne: false } }).select('assignedStudents deliveryMode title').lean(),
    LiveClass.find({ ...who, kind: { $in: ['lesson', null] }, status: 'scheduled', scheduledAt: { $gte: now } })
      .select('assignedStudents deliveryMode title scheduledAt').lean(),
  ])
  const ids = [...new Set([...entries, ...lessons].flatMap(x => (x.assignedStudents || []).map(String)))]
  const students = new Map((await User.find({ _id: { $in: ids }, role: 'student' }).select('deliveryMode').lean()).map(u => [String(u._id), u]))

  const plan = (docs) => docs.map(d => {
    const st = (d.assignedStudents || []).map(id => students.get(String(id))).filter(Boolean)
    const mode = wantedMode(st)
    return mode && mode !== (d.deliveryMode || 'virtual') ? { _id: d._id, title: d.title, from: d.deliveryMode || 'virtual', to: mode, at: d.scheduledAt } : null
  }).filter(Boolean)
  const slotChanges = plan(entries), lessonChanges = plan(lessons)

  if (!dryRun) {
    for (const [Model, changes] of [[TimetableEntry, slotChanges], [LiveClass, lessonChanges]]) {
      for (const mode of ['physical', 'virtual']) {
        const ids = changes.filter(c => c.to === mode).map(c => c._id)
        if (ids.length) await Model.updateMany({ _id: { $in: ids } }, { $set: { deliveryMode: mode } })
      }
    }
  }
  return { slots: slotChanges, lessons: lessonChanges }
}

module.exports = { syncDeliveryModes, wantedMode }
