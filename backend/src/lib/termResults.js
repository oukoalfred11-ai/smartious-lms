/**
 * lib/termResults.js — the scores and attendance a term report carries,
 * shared by the report generator (routes/reports.js) and the Dean's
 * Marks Entry (routes/marks.js).
 *
 *   subjectRows(scores, grade, comments, previous)  pure (unit-tested)
 *   totals(rows)                                    pure: overall and end-of-term averages
 *   computeTerm(student, tStart, tEnd, opts)        loads scores + attendance for one student
 *
 * Refreshing a report from new marks keeps what people wrote on it: a
 * subject's teacher comment, initials and teacher carry over from
 * `previous` when `comments` has none.
 */
const { scoresFor } = require('./reportScores')
const { gradeFor } = require('./grading')
// attendanceFacts loads the models; required when used, so the pure helpers test without a database.

// Term end dates arrive as YYYY-MM-DD (UTC midnight); lessons that day count.
const endOfDay = (d) => (d.getUTCHours() === 0 && d.getUTCMinutes() === 0 ? new Date(d.getTime() + 864e5 - 1) : d)
const mean = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null)

function subjectRows(scores = {}, grade = () => '', comments = {}, previous = []) {
  const prev = new Map((previous || []).map(s => [s.subject, s]))
  return Object.entries(scores).map(([subject, r]) => {
    const meta = comments[subject] || {}
    const old = prev.get(subject) || {}
    return {
      subject,
      teacherId:       meta.teacherId || old.teacherId || null,
      teacherInitials: meta.initials  || old.teacherInitials || '',
      weeklyScores:    r.weekly.map(w => w.pct),
      weeklyTests:     r.weekly,
      weeklyAverage:   r.weeklyAverage,
      endTermScore:    r.endTerm,
      endTermSource:   r.endTermSource || '',
      weightedScore:   r.finalScore,
      letterGrade:     grade(r.finalScore),
      teacherComment:  meta.comment || old.teacherComment || '',
      missedWeekly:    r.weeklyAverage == null,
      missedEndTerm:   r.endTerm == null,
    }
  })
}

function totals(rows = []) {
  return {
    overallAverage: mean(rows.map(s => s.weightedScore).filter(v => v != null)),
    endTermAverage: mean(rows.map(s => s.endTermScore).filter(v => v != null)),
  }
}

/**
 * student: { _id, curriculum, gradeLevel }
 * opts: { comments, previous, scheduledFallback }
 * → { subjects, overallAverage, endTermAverage, meanGrade, attendance: { scheduledDays, attendedDays, absentDays, punctualityPct }, facts }
 */
async function computeTerm(student, tStart, tEnd, opts = {}) {
  const end = endOfDay(tEnd)
  const grade = (p) => gradeFor(student.curriculum, p, student.gradeLevel)
  const scores = await scoresFor(student._id, tStart, end)
  const subjects = subjectRows(scores, grade, opts.comments || {}, opts.previous || [])
  const t = totals(subjects)
  // Attended / scheduled LESSONS in the term (legacy day register before the cutover).
  const facts = await require('./attendanceFacts').oneStudent(student._id, tStart, end, { lessons: false })
  const scheduled = facts.scheduled || Number(opts.scheduledFallback) || 0
  return {
    subjects, ...t, meanGrade: grade(t.overallAverage),
    attendance: {
      scheduledDays: scheduled,
      attendedDays: facts.attended,
      absentDays: Math.max(0, scheduled - facts.attended),
      punctualityPct: scheduled ? Math.round((facts.attended / scheduled) * 100) : 0,
    },
    facts,
  }
}

module.exports = { subjectRows, totals, computeTerm, endOfDay }
