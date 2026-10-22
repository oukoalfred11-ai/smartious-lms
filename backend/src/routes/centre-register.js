/**
 * centre-register.js — the Dean's register for students learning at a
 * centre (In-person, and Hybrid on their in-person lessons; see
 * lib/learningMode.js).
 *
 * Online students are marked present by joining the classroom; centre
 * students never join online, so the Dean (DOS) marks them. Marks are
 * written to the same per-lesson record as the class teacher's register
 * (ClassroomSession present + markedBy), so attendance reports, report
 * cards and the parent portal count them like any other lesson.
 *
 *   GET  /api/centre-register?date=YYYY-MM-DD   the day's centre students
 *        and their in-person lessons, with each lesson's mark
 *   POST /api/centre-register { date, marks: [{ studentId, liveClassId?, present }] }
 *        no liveClassId = the student's whole day (every in-person lesson)
 *
 * A day can be marked once it has started (Nairobi time), never ahead.
 */
const express = require('express')
const router = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const LiveClass = require('../models/LiveClass')
const ClassroomSession = require('../models/ClassroomSession')
const User = require('../models/User')
const { zonedParts, zonedTimeToUtc, zonedDayKey } = require('../lib/schoolTime')
const { inPersonLesson, learningMode } = require('../lib/learningMode')

const TZ = 'Africa/Nairobi'
const STAFF = ['dos', 'admin', 'ops_manager']

/** The Nairobi day for 'YYYY-MM-DD' (default today): { key, start, end }. */
function dayBounds(raw) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(raw || ''))
  const p = m ? { year: +m[1], month: +m[2], day: +m[3] } : zonedParts(new Date(), TZ)
  const start = zonedTimeToUtc(p.year, p.month, p.day, 0, 0, TZ)
  const end = zonedTimeToUtc(p.year, p.month, p.day + 1, 0, 0, TZ)
  return { key: zonedDayKey(start, TZ), start, end }
}

/** Centre students with lessons that day, and the lessons in person for each. */
async function load(day) {
  const lessons = await LiveClass.find({
    kind: { $in: ['lesson', null] }, status: { $ne: 'cancelled' },
    scheduledAt: { $gte: day.start, $lt: day.end },
  }).select('subject title scheduledAt durationMins deliveryMode assignedStudents teacherId outcome')
    .populate('teacherId', 'firstName lastName').sort({ scheduledAt: 1 }).lean()
  const ids = [...new Set(lessons.flatMap(l => (l.assignedStudents || []).map(String)))]
  const students = ids.length ? await User.find({ _id: { $in: ids }, role: 'student', archived: { $ne: true } })
    .select('firstName lastName gradeLevel deliveryMode onBreak').lean() : []
  const rows = []
  for (const st of students) {
    const mine = lessons.filter(l => (l.assignedStudents || []).some(id => String(id) === String(st._id)) && inPersonLesson(l, st))
    if (mine.length) rows.push({ st, lessons: mine })
  }
  return rows.sort((a, b) => (`${a.st.firstName} ${a.st.lastName}`).localeCompare(`${b.st.firstName} ${b.st.lastName}`))
}

router.get('/', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const day = dayBounds(req.query.date)
    const rows = await load(day)
    const classIds = rows.flatMap(r => r.lessons.map(l => l._id))
    const sessions = classIds.length ? await ClassroomSession.find({ liveClassId: { $in: classIds } })
      .select('liveClassId userId present markedBy').lean() : []
    const mark = new Map(sessions.map(s => [`${s.liveClassId}:${s.userId}`, s]))
    const students = rows.map(({ st, lessons }) => {
      const ls = lessons.map(l => {
        const s = mark.get(`${l._id}:${st._id}`)
        return {
          liveClassId: l._id,
          subject: l.subject || l.title || 'Lesson',
          teacher: l.teacherId ? `${l.teacherId.firstName} ${l.teacherId.lastName || ''}`.trim() : '',
          scheduledAt: l.scheduledAt,
          durationMins: l.durationMins || 60,
          // null = not marked yet
          present: s && s.markedBy ? s.present !== false : null,
        }
      })
      const marked = ls.filter(l => l.present !== null)
      return {
        studentId: st._id,
        name: `${st.firstName || ''} ${st.lastName || ''}`.trim(),
        grade: st.gradeLevel || '',
        mode: learningMode(st),
        onBreak: !!st.onBreak,
        lessons: ls,
        day: !marked.length ? null : marked.every(l => l.present) && marked.length === ls.length ? 'present'
          : marked.every(l => !l.present) && marked.length === ls.length ? 'absent' : 'partial',
      }
    })
    const today = dayBounds().key
    res.json({ success: true, data: { date: day.key, today, canMark: day.key <= today, students } })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

router.post('/', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const day = dayBounds(req.body?.date)
    if (day.key > dayBounds().key)
      return res.status(400).json({ success: false, message: 'You can only mark today or an earlier day.' })
    const marks = Array.isArray(req.body?.marks) ? req.body.marks : []
    if (!marks.length) return res.status(400).json({ success: false, message: 'No marks provided.' })
    const rows = await load(day)
    const byStudent = new Map(rows.map(r => [String(r.st._id), r.lessons]))
    let applied = 0
    for (const m of marks) {
      const lessons = byStudent.get(String(m?.studentId))
      if (!lessons) continue
      const targets = m.liveClassId ? lessons.filter(l => String(l._id) === String(m.liveClassId)) : lessons
      for (const l of targets) {
        await ClassroomSession.updateOne(
          { liveClassId: l._id, userId: m.studentId },
          { $set: { present: m.present !== false, markedBy: req.user._id }, $setOnInsert: { firstJoinedAt: null, joinCount: 0 } },
          { upsert: true },
        )
        applied++
      }
    }
    res.json({ success: true, message: `Register saved (${applied} lesson mark${applied === 1 ? '' : 's'}).`, data: { applied } })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

module.exports = router
module.exports.dayBounds = dayBounds
