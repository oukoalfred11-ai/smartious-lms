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
 */
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { auth, requireRole } = require('../middleware/auth')
const MarkEntry = require('../models/MarkEntry')
const User = require('../models/User')

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

router.get('/students', auth, DEAN, async (req, res) => {
  try {
    const f = { role: 'student', archived: { $ne: true } }
    if (req.query.centre === '1') f.deliveryMode = { $in: ['In-person', 'Hybrid'] }
    if (req.query.q) { const r = new RegExp(esc(String(req.query.q).slice(0, 60)), 'i'); f.$or = [{ firstName: r }, { lastName: r }, { admissionNo: r }] }
    const list = await User.find(f).select('firstName lastName gradeLevel curriculum subjects deliveryMode admissionNo isActive').sort({ firstName: 1, lastName: 1 }).limit(300).lean()
    res.json({ success: true, data: list })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
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
