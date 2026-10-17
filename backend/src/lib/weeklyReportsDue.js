/**
 * lib/weeklyReportsDue.js — which weekly reports a teacher owes this week.
 *
 * One source of truth for both the teacher's "Reports due this week" list
 * and the Thursday reminder / Friday show-cause check, so what the teacher
 * sees as done is exactly what the check accepts as done.
 *
 * A report is owed for every student the teacher had a lesson with this
 * week (Monday 00:00 Nairobi onward; cancelled and not-held lessons do not
 * count). It is cleared by a published WeeklyReport for that student
 * (linked by id, or by name for reports typed by hand) saved since the
 * Saturday before, or by a term Report published in the last 14 days.
 */
const User = require('../models/User')
const LiveClass = require('../models/LiveClass')
const WeeklyReport = require('../models/WeeklyReport')
const Report = require('../models/Report')
const { zonedParts, zonedTimeToUtc } = require('./schoolTime')

const TZ = 'Africa/Nairobi'
const escRe = (x) => String(x || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Monday 00:00 Nairobi of the week containing `now`. */
function weekStart(now = new Date()) {
  const p = zonedParts(now, TZ)
  const back = (['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday) + 6) % 7
  return zonedTimeToUtc(p.year, p.month, p.day - back, 0, 0, TZ)
}

/** "Week of 19 October 2026" — the label new reports carry. */
function weekLabel(monday) {
  return 'Week of ' + monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ })
}

const lessonFilter = (monday, until) => ({
  kind: { $in: ['lesson', null] },
  status: { $ne: 'cancelled' },
  outcome: { $ne: 'not_held' },
  scheduledAt: { $gte: monday, $lte: until },
})

/** Teachers with at least one lesson in the window. */
function teachersWithLessons(monday, until) {
  return LiveClass.distinct('teacherId', lessonFilter(monday, until))
}

/**
 * @param teacherId
 * @param {{ monday?: Date, until?: Date }} opts until defaults to the end
 *        of the week (the teacher's list shows the whole week; the cron
 *        passes `now`).
 * @returns {Promise<{ monday, week, items: Array<{ student, subjects, topics,
 *          lessons, report: {_id,status,subject}|null, cleared }> }>}
 */
async function reportsDue(teacherId, { monday = weekStart(), until } = {}) {
  const end = until || new Date(monday.getTime() + 7 * 864e5 - 1)
  const lessons = await LiveClass.find({ teacherId, ...lessonFilter(monday, end) })
    .select('assignedStudents subject syllabusTopicName syllabusSubtopicName scheduledAt').lean()

  const byStudent = new Map()
  for (const l of lessons) {
    for (const sid of l.assignedStudents || []) {
      const k = String(sid)
      if (!byStudent.has(k)) byStudent.set(k, { subjects: new Set(), topics: new Set(), lessons: 0 })
      const e = byStudent.get(k)
      e.lessons++
      if (l.subject) e.subjects.add(l.subject)
      const t = [l.syllabusTopicName, l.syllabusSubtopicName].filter(Boolean).join(': ')
      if (t) e.topics.add(t)
    }
  }
  if (!byStudent.size) return { monday, week: weekLabel(monday), items: [] }

  const students = await User.find({ _id: { $in: [...byStudent.keys()] } })
    .select('firstName lastName gradeLevel curriculum onBreak').lean()
  const grace = new Date(monday.getTime() - 2 * 864e5)

  const items = []
  for (const st of students) {
    const nameRe = new RegExp('^\\s*' + escRe(st.firstName) + '\\s+' + escRe(st.lastName) + '\\s*$', 'i')
    const mine = { teacherId, updatedAt: { $gte: grace }, $or: [{ studentId: st._id }, { studentId: null, studentName: nameRe }] }
    const published = await WeeklyReport.findOne({ ...mine, status: 'published' }).select('_id status subject').lean()
    const draft = published ? null : await WeeklyReport.findOne({ ...mine, status: 'draft' }).sort({ updatedAt: -1 }).select('_id status subject').lean()
    const term = published ? null : await Report.exists({
      teacherId, studentId: st._id, status: 'published', updatedAt: { $gte: new Date(Date.now() - 14 * 864e5) },
    })
    const e = byStudent.get(String(st._id))
    items.push({
      student: st,
      subjects: [...e.subjects],
      topics: [...e.topics],
      lessons: e.lessons,
      report: published || draft || null,
      cleared: !!(published || term),
    })
  }
  items.sort((a, b) => Number(a.cleared) - Number(b.cleared) || a.student.firstName.localeCompare(b.student.firstName))
  return { monday, week: weekLabel(monday), items }
}

module.exports = { reportsDue, teachersWithLessons, weekStart, weekLabel }
