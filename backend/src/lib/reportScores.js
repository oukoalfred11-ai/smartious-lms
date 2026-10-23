/**
 * lib/reportScores.js — the scores a term report is built from, per subject:
 * weekly tests and the end-of-term exam, as percentages.
 *
 * Two sources, merged:
 *   • online exams the student sat (Exam + graded ExamSubmission); an exam
 *     whose title says end of term / final / terminal is the end-of-term exam
 *   • marks keyed in by the Dean (MarkEntry), e.g. tests a centre student
 *     sat on paper; a keyed-in end-of-term mark takes precedence over an
 *     online one in the same subject
 *
 * Final mark per subject: weekly average 30 % + end of term 70 % (either
 * alone when the other is missing).
 */
const pct = (score, outOf) => (outOf > 0 ? Math.round((score / outOf) * 100) : null)
const mean = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null)
const isEndTermTitle = (t) => /end.?(of.?)?term|final|terminal/i.test(String(t || ''))

/**
 * Pure merge (unit-tested).
 *   exams: [{ subject, title, date, pct|null }]   pct null = not sat / not graded
 *   marks: [{ subject, kind, label, date, score, outOf }]
 * → { [subject]: { weekly: [{ label, date, pct, source }], endTerm: pct|null, endTermSource, weeklyAverage, finalScore } }
 */
function mergeScores(exams = [], marks = []) {
  const out = {}
  const get = (s) => (out[s] ||= { weekly: [], endTerm: null, endTermSource: null })
  for (const e of exams) {
    const r = get(e.subject)
    if (isEndTermTitle(e.title)) { if (e.pct != null) { r.endTerm = e.pct; r.endTermSource = 'online' } else if (r.endTermSource == null) r.endTermSource = 'missed' }
    else r.weekly.push({ label: e.title || 'Test', date: e.date, pct: e.pct, source: 'online' })
  }
  for (const m of [...marks].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))) {
    const r = get(m.subject)
    const p = pct(Number(m.score), Number(m.outOf))
    if (m.kind === 'endterm') { r.endTerm = p; r.endTermSource = 'keyed' }
    else r.weekly.push({ label: m.label || 'Weekly test', date: m.date, pct: p, source: 'keyed' })
  }
  for (const r of Object.values(out)) {
    r.weekly.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
    const sat = r.weekly.map(w => w.pct).filter(v => v != null)
    r.weeklyAverage = mean(sat)
    r.finalScore = r.weeklyAverage != null && r.endTerm != null ? Math.round(r.weeklyAverage * 0.3 + r.endTerm * 0.7)
      : r.endTerm != null ? r.endTerm : r.weeklyAverage
  }
  return out
}

/** Load both sources for one student and term, and merge them. */
async function scoresFor(studentId, tStart, tEnd) {
  const Exam = require('../models/Exam')
  const ExamSubmission = require('../models/ExamSubmission')
  const MarkEntry = require('../models/MarkEntry')
  const exams = await Exam.find({ assignedStudents: studentId, startAt: { $gte: tStart, $lte: tEnd } })
    .select('title subject startAt totalMarks').lean()
  const subs = exams.length ? await ExamSubmission.find({ examId: { $in: exams.map(e => e._id) }, studentId, status: { $in: ['graded', 'returned'] } }).lean() : []
  const byExam = new Map(subs.map(s => [String(s.examId), s]))
  const examRows = exams.map(e => {
    const s = byExam.get(String(e._id))
    const awarded = s ? (s.totalScore != null && s.totalScore > 0 ? s.totalScore : (s.answers || []).reduce((t, a) => t + (a.marksAwarded || 0), 0)) : null
    return { subject: e.subject, title: e.title, date: e.startAt, pct: s ? pct(awarded, e.totalMarks || 100) : null }
  })
  const marks = await MarkEntry.find({ studentId, date: { $gte: tStart, $lte: tEnd } }).lean()
  return mergeScores(examRows, marks)
}

module.exports = { mergeScores, scoresFor, isEndTermTitle }
