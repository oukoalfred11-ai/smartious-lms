/**
 * routes/marks.js — the Dean keys in marks (mounted at /api/marks).
 *
 * For tests sat on paper, typically by centre (In-person / Hybrid)
 * students: weekly tests and the end-of-term exam, per subject. Term
 * reports read them through lib/reportScores.js.
 *
 *   GET    /api/marks/students?centre=1&q=   students to choose from
 *   GET    /api/marks?studentId&from&to      a student's keyed-in marks
 *   POST   /api/marks                        { studentId, subject, kind, label, date, score, outOf, note }
 *   PATCH  /api/marks/:id                    same fields
 *   DELETE /api/marks/:id
 *
 * End-of-term reports from these marks (with online exams and attendance):
 *   GET    /api/marks/report?studentId&academicYear&term   the student's report for that term, if any
 *   POST   /api/marks/report                               { studentId, academicYear, term, termStart, termEnd }
 *          builds the draft, or refreshes its scores and attendance (comments kept);
 *          preview and download it at /api/reports/:id/pdf
 *   POST   /api/marks/publish                              { academicYear, term, studentIds } publish drafts, notify parents
 *   GET    /api/marks/results.csv?academicYear&term&from&to&centre&q   end-of-term results, one row per subject
 */
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { auth, requireRole } = require('../middleware/auth')
const MarkEntry = require('../models/MarkEntry')
const User = require('../models/User')
const Report = require('../models/Report')
const { computeTerm, endOfDay } = require('../lib/termResults')
const { scoresFor } = require('../lib/reportScores')
const { gradeFor } = require('../lib/grading')

const DEAN = requireRole('dos', 'admin', 'ops_manager')
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function clean(b = {}) {
  const out = {}
  if (b.subject !== undefined) out.subject = String(b.subject).trim().slice(0, 80)
  if (b.kind !== undefined) out.kind = b.kind === 'endterm' ? 'endterm' : 'weekly'
  if (b.label !== undefined) out.label = String(b.label).trim().slice(0, 80)
  if (b.note !== undefined) out.note = String(b.note).trim().slice(0, 300)
  if (b.date !== undefined) { const d = new Date(b.date); if (isNaN(d)) throw new Error('Enter a valid date.'); out.date = d }
  if (b.outOf !== undefined) { const o = Number(b.outOf); if (!(o >= 1 && o <= 1000)) throw new Error('"Out of" must be between 1 and 1000.'); out.outOf = o }
  if (b.score !== undefined) { const s = Number(b.score); if (!(s >= 0) || !Number.isFinite(s)) throw new Error('Enter a valid mark.'); out.score = s }
  return out
}

function studentFilter(q = {}) {
  const f = { role: 'student', archived: { $ne: true } }
  if (q.centre === '1') f.deliveryMode = { $in: ['In-person', 'Hybrid'] }
  if (q.q) { const r = new RegExp(esc(String(q.q).slice(0, 60)), 'i'); f.$or = [{ firstName: r }, { lastName: r }, { admissionNo: r }] }
  return f
}

router.get('/students', auth, DEAN, async (req, res) => {
  try {
    const list = await User.find(studentFilter(req.query)).select('firstName lastName gradeLevel curriculum subjects deliveryMode admissionNo isActive').sort({ firstName: 1, lastName: 1 }).limit(300).lean()
    res.json({ success: true, data: list })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

// ── End-of-term reports ─────────────────────────────────────
const REPORT_FIELDS = '_id status academicYear term termLabel termStart termEnd overallAverage meanGrade dateIssued updatedAt'
function termOf(b = {}) {
  const academicYear = String(b.academicYear || '').trim()
  const term = Number(b.term)
  if (!/^\d{4}\/\d{4}$/.test(academicYear)) throw new Error('Enter the academic year as 2025/2026.')
  if (![1, 2, 3].includes(term)) throw new Error('Choose term 1, 2 or 3.')
  return { academicYear, term }
}

router.get('/report', auth, DEAN, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.query.studentId)) return res.status(400).json({ success: false, message: 'Choose a student.' })
    const report = await Report.findOne({ studentId: req.query.studentId, ...termOf(req.query) }).select(REPORT_FIELDS).lean()
    res.json({ success: true, data: report })
  } catch (e) { res.status(400).json({ success: false, message: e.message }) }
})

router.post('/report', auth, DEAN, async (req, res) => {
  try {
    const b = req.body || {}
    if (!mongoose.isValidObjectId(b.studentId)) return res.status(400).json({ success: false, message: 'Choose a student.' })
    const { academicYear, term } = termOf(b)
    const tStart = new Date(b.termStart), tEnd = new Date(b.termEnd)
    if (isNaN(tStart) || isNaN(tEnd) || tStart > tEnd) return res.status(400).json({ success: false, message: 'Enter the term dates.' })
    const student = await User.findOne({ _id: b.studentId, role: 'student' })
      .select('firstName lastName admissionNo gender curriculum gradeLevel programme avatar classTeacherId')
      .populate('classTeacherId', 'firstName lastName').lean()
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })

    const existing = await Report.findOne({ studentId: b.studentId, academicYear, term })
    const t = await computeTerm(student, tStart, tEnd, { previous: existing?.subjects || [] })
    if (!t.subjects.length) return res.status(400).json({ success: false, message: 'No marks for this term yet: key in marks or check the term dates.' })
    const fresh = {
      termStart: tStart, termEnd: tEnd,
      subjects: t.subjects, overallAverage: t.overallAverage, endTermAverage: t.endTermAverage, meanGrade: t.meanGrade,
      ...t.attendance,
    }
    let report
    if (existing) {
      // Scores and attendance only: comments, habits and the status stay as they are.
      existing.set(fresh)
      report = await existing.save()
    } else {
      report = await Report.create({
        studentId: b.studentId, academicYear, term, termLabel: `Term ${term}`, ...fresh,
        studentName: [student.firstName, student.lastName].filter(Boolean).join(' '),
        admissionNo: student.admissionNo || '—', gender: student.gender || '—',
        curriculum: student.curriculum || '—', yearGrade: student.gradeLevel || '—',
        programme: student.programme || '—',
        classTeacher: [student.classTeacherId?.firstName, student.classTeacherId?.lastName].filter(Boolean).join(' ') || '—',
        photoUrl: student.avatar || '',
        dateIssued: new Date(), generatedBy: req.user._id, status: 'draft',
      })
    }
    const out = await Report.findById(report._id).select(REPORT_FIELDS).lean()
    res.json({ success: true, data: out, message: existing ? 'Report updated from the latest marks.' : 'Draft report created.' })
  } catch (e) { res.status(400).json({ success: false, message: e.message }) }
})

router.post('/publish', auth, DEAN, async (req, res) => {
  try {
    const { academicYear, term } = termOf(req.body)
    const ids = (Array.isArray(req.body.studentIds) ? req.body.studentIds : []).filter(id => mongoose.isValidObjectId(id)).slice(0, 500)
    if (!ids.length) return res.status(400).json({ success: false, message: 'Choose the students to publish.' })
    const { notifyParentReportReady } = require('./reports')
    const drafts = await Report.find({ studentId: { $in: ids }, academicYear, term, status: { $ne: 'published' } })
      .populate('studentId', 'firstName lastName email parentEmail linkedParents')
    let published = 0, notified = 0
    for (const r of drafts) {
      // Only the drafts still unpublished: a second click publishes nothing twice.
      const upd = await Report.updateOne({ _id: r._id, status: { $ne: 'published' } }, { $set: { status: 'published' } })
      if (!upd.modifiedCount) continue
      published++
      try { if (await notifyParentReportReady(r)) notified++ } catch (e) { console.error('[marks publish notify]', e.message) }
    }
    const missing = ids.length - (await Report.countDocuments({ studentId: { $in: ids }, academicYear, term }))
    res.json({ success: true, data: { published, notified, missing } })
  } catch (e) { res.status(400).json({ success: false, message: e.message }) }
})

const csvCell = (v) => { const s = v == null ? '' : String(v); return /[",\n\r]/.test(s) || /^[=+\-@]/.test(s) ? '"' + (/^[=+\-@]/.test(s) ? "'" : '') + s.replace(/"/g, '""') + '"' : s }

router.get('/results.csv', auth, DEAN, async (req, res) => {
  try {
    const { academicYear, term } = termOf(req.query)
    const tStart = new Date(req.query.from), tEnd = new Date(req.query.to)
    if (isNaN(tStart) || isNaN(tEnd)) return res.status(400).json({ success: false, message: 'Enter the term dates.' })
    const students = await User.find(studentFilter(req.query)).select('firstName lastName admissionNo gradeLevel curriculum deliveryMode').sort({ firstName: 1, lastName: 1 }).limit(300).lean()
    const reports = await Report.find({ studentId: { $in: students.map(s => s._id) }, academicYear, term }).select('studentId status').lean()
    const status = new Map(reports.map(r => [String(r.studentId), r.status]))
    const rows = [['Student', 'Admission no', 'Grade', 'Curriculum', 'Mode', 'Subject', 'Weekly tests', 'Weekly average %', 'End of term %', 'Final %', 'Grade awarded', 'Report']]
    const end = endOfDay(tEnd)
    for (let i = 0; i < students.length; i += 8) {
      const batch = students.slice(i, i + 8)
      const scores = await Promise.all(batch.map(s => scoresFor(s._id, tStart, end)))
      batch.forEach((s, k) => {
        const name = [s.firstName, s.lastName].filter(Boolean).join(' ')
        const rep = status.get(String(s._id)) || 'not created'
        for (const [subject, r] of Object.entries(scores[k])) {
          rows.push([name, s.admissionNo || '', s.gradeLevel || '', s.curriculum || '', s.deliveryMode || '', subject,
            r.weekly.filter(w => w.pct != null).length, r.weeklyAverage ?? '', r.endTerm ?? '', r.finalScore ?? '',
            r.finalScore != null ? gradeFor(s.curriculum, r.finalScore, s.gradeLevel) : '', rep])
        }
      })
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="end-of-term-results-${academicYear.replace('/', '-')}-T${term}.csv"`)
    res.send('\ufeff' + rows.map(r => r.map(csvCell).join(',')).join('\r\n'))
  } catch (e) { res.status(400).json({ success: false, message: e.message }) }
})

router.get('/', auth, DEAN, async (req, res) => {
  try {
    const { studentId, from, to } = req.query
    if (!mongoose.isValidObjectId(studentId)) return res.status(400).json({ success: false, message: 'Choose a student.' })
    const f = { studentId }
    if (from || to) { f.date = {}; if (from) f.date.$gte = new Date(from); if (to) f.date.$lte = new Date(new Date(to).getTime() + 864e5 - 1) }
    const list = await MarkEntry.find(f).sort({ subject: 1, date: 1 }).populate('enteredBy', 'firstName lastName').lean()
    res.json({ success: true, data: list })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

router.post('/', auth, DEAN, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.body?.studentId)) return res.status(400).json({ success: false, message: 'Choose a student.' })
    const d = clean(req.body)
    if (!d.subject) return res.status(400).json({ success: false, message: 'Choose a subject.' })
    if (d.score == null) return res.status(400).json({ success: false, message: 'Enter the mark.' })
    const outOf = d.outOf || 100
    if (d.score > outOf) return res.status(400).json({ success: false, message: `The mark cannot be more than ${outOf}.` })
    const student = await User.exists({ _id: req.body.studentId, role: 'student' })
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })
    // Several end-of-term marks in one subject and term: the latest-dated counts (reportScores.js).
    const doc = await MarkEntry.create({ ...d, outOf, date: d.date || new Date(), studentId: req.body.studentId, enteredBy: req.user._id })
    res.json({ success: true, data: doc })
  } catch (e) { res.status(400).json({ success: false, message: e.message }) }
})

router.patch('/:id', auth, DEAN, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id.' })
    const m = await MarkEntry.findById(req.params.id)
    if (!m) return res.status(404).json({ success: false, message: 'Mark not found.' })
    Object.assign(m, clean(req.body), { enteredBy: req.user._id })
    if (m.score > m.outOf) return res.status(400).json({ success: false, message: `The mark cannot be more than ${m.outOf}.` })
    await m.save()
    res.json({ success: true, data: m })
  } catch (e) { res.status(400).json({ success: false, message: e.message }) }
})

router.delete('/:id', auth, DEAN, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id.' })
    await MarkEntry.deleteOne({ _id: req.params.id })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

module.exports = router
