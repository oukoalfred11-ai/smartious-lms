/**
 * lib/absenceAlerts.js — tell families when a student has not joined.
 *
 * Runs every minute. Ten minutes into a lesson, every assigned student
 * who has not joined (and is not paused) triggers one email to the
 * student and their parents. The alert is recorded on the class
 * (absenceAlerted), so nobody is told twice. When a student has now
 * missed two lessons in a row (and again at four), the academic office
 * is told, so a week of silent absences cannot happen.
 */
const LiveClass = require('../models/LiveClass')
const ClassroomSession = require('../models/ClassroomSession')
const { absenceAlertDue, absentStudents, ABSENCE_ALERT_AFTER_MIN } = require('./scheduling')
const notices = require('./lessonNotices')

async function pausedIds(ids, now) {
  if (!ids.length) return []
  try {
    const StudentPause = require('../models/StudentPause')
    return await StudentPause.distinct('student', {
      student: { $in: ids }, status: 'active', startAt: { $lte: now },
      $or: [{ expectedEnd: null }, { expectedEnd: { $gt: now } }],
    })
  } catch { return [] }
}

/** How many of the student's most recent lessons (up to this one) were missed in a row. */
async function missStreak(studentId, uptoClass) {
  const recent = await LiveClass.find({
    assignedStudents: studentId, kind: { $in: ['lesson', null] },
    status: { $ne: 'cancelled' }, outcome: { $ne: 'not_held' }, classroomMode: { $ne: 'link' },
    scheduledAt: { $lte: uptoClass.scheduledAt },
  }).sort({ scheduledAt: -1 }).limit(6).select('_id').lean()
  if (!recent.length) return 0
  const joined = new Set((await ClassroomSession.distinct('liveClassId', {
    liveClassId: { $in: recent.map(c => c._id) }, userId: studentId, $or: [{ joinCount: { $gt: 0 } }, { present: true }],
  })).map(String))
  let n = 0
  for (const c of recent) { if (joined.has(String(c._id))) break; n++ }
  return n
}

async function runAbsenceAlerts(now = new Date()) {
  const classes = await LiveClass.find({
    kind: { $in: ['lesson', null] },
    // Joining is only recorded in the Smartious classroom; lessons held on
    // an external link have no join record, so they are never alerted.
    classroomMode: { $ne: 'link' },
    status: { $in: ['scheduled', 'live'] },
    scheduledAt: { $gte: new Date(now.getTime() - 40 * 60000), $lte: new Date(now.getTime() - ABSENCE_ALERT_AFTER_MIN * 60000) },
  }).populate('assignedStudents', 'firstName lastName email emailPrefs parentEmail linkedParents parentId parentName onBreak timezone')
    .populate('teacherId', 'firstName lastName').lean()

  let sent = 0
  for (const cls of classes) {
    if (!absenceAlertDue(cls, now)) continue
    const ids = (cls.assignedStudents || []).filter(Boolean).map(s => s._id)
    const joinedIds = await ClassroomSession.distinct('userId', { liveClassId: cls._id, joinCount: { $gt: 0 } })
    const absent = absentStudents(cls, { joinedIds, pausedIds: await pausedIds(ids, now) })
    for (const st of absent) {
      const ok = await notices.absenceAlert(cls, st)
      if (!ok) continue
      sent++
      await LiveClass.updateOne({ _id: cls._id }, { $addToSet: { absenceAlerted: String(st._id) } })
      try {
        const streak = await missStreak(st._id, cls)
        if (streak === 2 || streak === 4) {
          const teacher = cls.teacherId ? `${cls.teacherId.firstName} ${cls.teacherId.lastName}` : 'the teacher'
          await notices.academicAlert(`${st.firstName} ${st.lastName || ''} has missed ${streak} lessons in a row`, [
            `<strong>${st.firstName} ${st.lastName || ''}</strong> has not joined their last ${streak} lessons, most recently <strong>${cls.subject || cls.title}</strong> with ${teacher} on ${notices.when(cls.scheduledAt)}.`,
            'The family has been emailed each time. Please call the parent or guardian.',
          ])
        }
      } catch (e) { console.error('[absence alert] streak', e.message) }
    }
  }
  if (sent) console.log(`[absence alert] ${sent} family alert(s) sent`)
  return sent
}

/**
 * Each morning (07:00 Nairobi) the academic office receives the list of
 * lessons left unconfirmed for over 24 hours, by teacher.
 */
let digestDay = ''
async function runUnconfirmedDigest(now = new Date()) {
  const { zonedParts, zonedDayKey } = require('./schoolTime')
  const { closeCutover } = require('./scheduling')
  if (zonedParts(now, 'Africa/Nairobi').hour !== 7) return 0
  const day = zonedDayKey(now, 'Africa/Nairobi')
  if (digestDay === day) return 0
  digestDay = day
  const list = await LiveClass.find({
    kind: { $in: ['lesson', null] }, status: { $ne: 'cancelled' }, outcome: null,
    scheduledAt: { $gte: closeCutover(), $lte: new Date(now.getTime() - 24 * 3600000) },
  }).populate('teacherId', 'firstName lastName').sort({ scheduledAt: 1 }).limit(300).lean()
  if (!list.length) return 0
  const byTeacher = {}
  for (const c of list) {
    const name = c.teacherId ? `${c.teacherId.firstName} ${c.teacherId.lastName}` : 'Unassigned'
    ;(byTeacher[name] = byTeacher[name] || []).push(c)
  }
  const lines = Object.entries(byTeacher).map(([name, cs]) =>
    `<strong>${name}</strong> — ${cs.length} lesson${cs.length > 1 ? 's' : ''}: ` +
    cs.slice(0, 8).map(c => `${c.subject || c.title} (${notices.when(c.scheduledAt)})`).join('; ') + (cs.length > 8 ? '…' : ''))
  await notices.academicAlert(`${list.length} lesson${list.length > 1 ? 's' : ''} not yet closed by teachers`, [
    'These lessons are past but their teachers have not recorded whether they were taught. Until they are closed, no homework is set, the scheme of work does not move on and attendance is not counted.',
    ...lines,
    'Staff can see and close them under Lessons to confirm.',
  ])
  return list.length
}

module.exports = { runAbsenceAlerts, missStreak, runUnconfirmedDigest }
