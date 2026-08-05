/**
 * services/timetableConfirm.js
 * ============================================================
 * Turns a predicted timetable into a real one.
 *
 * A slot chosen at enrolment is a guess. This service watches lessons
 * as they are actually taught and does two things:
 *
 *   1. CONFIRM — the first lesson that starts for a student and
 *      subject sets the real day and time. The entry then stops
 *      moving. If the prediction was wrong, the entry is corrected
 *      and the original kept so someone can see by how much.
 *
 *   2. ADVANCE — as lessons are delivered, the entry's title tracks
 *      the syllabus, so the timetable reads
 *      "Physics — Refraction: total internal reflection" instead of a
 *      student's name. That tells a student what to prepare.
 *
 * Everything here is idempotent. Running it repeatedly changes nothing
 * once an entry is confirmed and its title is current.
 */
const TimetableEntry = require('../models/TimetableEntry')
const LiveClass = require('../models/LiveClass')
const Question = require('../models/Question')

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const EAT_OFFSET_MIN = 3 * 60

const pad = n => String(n).padStart(2, '0')

/** Day and HH:MM of a real lesson, in Nairobi local time. */
function slotOf(date) {
  const d = new Date(new Date(date).getTime() + EAT_OFFSET_MIN * 60000)
  return { dayOfWeek: DAYS[d.getUTCDay()], startTime: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}` }
}

/** Round to the nearest half hour, since lessons rarely start exactly on the minute. */
function tidy(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const r = Math.round(m / 30) * 30
  return r === 60 ? `${pad((h + 1) % 24)}:00` : `${pad(h)}:${pad(r)}`
}

function addMinutes(hhmm, mins) {
  const [h, m] = hhmm.split(':').map(Number)
  const t = (h * 60 + m + mins) % (24 * 60)
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`
}

/**
 * The next subtopic in the syllabus for a subject, given what has been
 * taught. Falls back to the lesson name on the LiveClass itself when
 * no spine is available for that subject.
 */
async function nextLessonFor(entry, lastDelivered) {
  // Spine order comes from the question bank, which is where the
  // lesson codes live. One query, distinct codes, sorted.
  const rows = await Question.aggregate([
    { $match: { subject: entry.subject, lessonCode: { $nin: ['', null] },
                ...(entry.curriculum ? { $or: [{ curriculum: entry.curriculum }, { curricula: entry.curriculum }] } : {}) } },
    { $group: { _id: '$lessonCode', name: { $first: '$subtopic' } } },
    { $sort: { _id: 1 } },
  ]).catch(() => [])

  if (!rows.length) return null
  if (!lastDelivered) return { code: rows[0]._id, name: rows[0].name }

  const i = rows.findIndex(r => r.name === lastDelivered || r._id === lastDelivered)
  const next = i >= 0 ? rows[i + 1] : rows[0]
  return next ? { code: next._id, name: next.name } : null
}

/**
 * Confirm one entry from a lesson that actually ran.
 * Returns a description of what changed, or null.
 */
async function confirmFromLesson(entry, live) {
  const when = live.startedAt || live.scheduledAt
  if (!when) return null

  const actual = slotOf(when)
  const start = tidy(actual.startTime)
  const mins = live.durationMins || 60
  const moved = entry.dayOfWeek !== actual.dayOfWeek || entry.startTime !== start

  if (moved) {
    entry.provisionalSlot = `${entry.dayOfWeek} ${entry.startTime}-${entry.endTime}`
    entry.dayOfWeek = actual.dayOfWeek
    entry.startTime = start
    entry.endTime = addMinutes(start, mins)
  }
  entry.confirmed = true
  entry.confirmedAt = new Date()
  entry.confirmedFrom = live._id
  entry.needsConfirmation = false
  return moved
    ? `moved from ${entry.provisionalSlot} to ${entry.dayOfWeek} ${entry.startTime}-${entry.endTime}`
    : `confirmed at ${entry.dayOfWeek} ${entry.startTime}`
}

/** Refresh an entry's title to name the next lesson. */
async function advanceTitle(entry, lastDelivered) {
  const next = await nextLessonFor(entry, lastDelivered)
  if (!next) return false
  if (entry.nextLessonCode === next.code) return false

  entry.lastLessonName = lastDelivered || entry.lastLessonName
  entry.nextLessonCode = next.code
  entry.nextLessonName = next.name
  entry.title = `${entry.subject} — ${next.name}`
  return true
}

/**
 * One pass. Looks at lessons that have started since the last run and
 * updates the matching timetable entries.
 */
async function runTimetableConfirm({ sinceHours = 48 } = {}) {
  const summary = { confirmed: 0, moved: 0, titlesAdvanced: 0, skipped: 0 }
  const since = new Date(Date.now() - sinceHours * 3600 * 1000)

  const lessons = await LiveClass.find({
    $or: [{ startedAt: { $gte: since } }, { status: 'ended', endedAt: { $gte: since } }],
  }).sort({ startedAt: 1 }).limit(500).lean()

  for (const live of lessons) {
    if (!live.startedAt) { summary.skipped++; continue }

    // Match on subject plus a shared student, which is what actually
    // ties a lesson to a timetable slot.
    const studentIds = live.assignedStudents || live.students || []
    const entries = await TimetableEntry.find({
      subject: live.subject,
      isActive: { $ne: false },
      ...(studentIds.length ? { assignedStudents: { $in: studentIds } } : { teacherId: live.teacherId }),
    })

    for (const entry of entries) {
      let dirty = false

      if (!entry.confirmed) {
        const what = await confirmFromLesson(entry, live)
        if (what) {
          dirty = true
          summary.confirmed++
          if (what.startsWith('moved')) summary.moved++
          console.log(`[timetable-confirm] ${entry.subject}: ${what}`)
        }
      }

      // Advance the title whether or not this was the confirming lesson.
      const delivered = live.syllabusSubtopicName || live.topic || null
      if (delivered) {
        const advanced = await advanceTitle(entry, delivered)
        if (advanced) {
          entry.lessonsDelivered = (entry.lessonsDelivered || 0) + 1
          dirty = true
          summary.titlesAdvanced++
        }
      }

      if (dirty) await entry.save()
    }
  }

  console.log(`[timetable-confirm] confirmed=${summary.confirmed} moved=${summary.moved} ` +
              `titles=${summary.titlesAdvanced} skipped=${summary.skipped}`)
  return summary
}

let timer = null
function startTimetableConfirm() {
  if (String(process.env.TIMETABLE_CONFIRM_ENABLED || 'true').toLowerCase() === 'false') {
    console.log('[timetable-confirm] disabled by TIMETABLE_CONFIRM_ENABLED=false')
    return
  }
  if (timer) return
  const mins = Math.max(10, Number(process.env.TIMETABLE_CONFIRM_MINUTES || 30))
  console.log(`[timetable-confirm] started — every ${mins} min`)
  setTimeout(() => {
    runTimetableConfirm()
    timer = setInterval(() => runTimetableConfirm(), mins * 60 * 1000)
  }, 120 * 1000)
}

module.exports = {
  runTimetableConfirm, startTimetableConfirm,
  slotOf, tidy, addMinutes, confirmFromLesson, advanceTitle,
}
