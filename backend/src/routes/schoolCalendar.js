/**
 * routes/schoolCalendar.js — school holidays and breaks (no lessons).
 *
 *   GET    /api/school-calendar           anyone signed in: upcoming and recent closures
 *   POST   /api/school-calendar           admin / dos / ops_manager: { name, start, end, kind, note }
 *   DELETE /api/school-calendar/:id       admin / dos / ops_manager
 *
 * Every change re-runs the timetable materializer straight away.
 */
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const SchoolClosure = require('../models/SchoolClosure')
const { zonedDayKey } = require('../lib/schoolTime')

const STAFF = ['admin', 'dos', 'ops_manager']
const isDay = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) && !isNaN(new Date(s + 'T00:00:00Z'))

router.get('/', auth, async (req, res) => {
  try {
    const from = zonedDayKey(new Date(Date.now() - 30 * 864e5), 'Africa/Nairobi')
    const closures = await SchoolClosure.find({ end: { $gte: from } }).sort({ start: 1 }).limit(100).lean()
    res.json({ success: true, data: { closures } })
  } catch (e) { res.status(500).json({ success: false, message: 'Could not load the school calendar.' }) }
})

router.post('/', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const { name, start, end, kind = 'holiday', note = '' } = req.body || {}
    if (!String(name || '').trim()) return res.status(400).json({ success: false, message: 'Give the holiday or break a name.' })
    if (!isDay(start) || !isDay(end || start)) return res.status(400).json({ success: false, message: 'Dates must be YYYY-MM-DD.' })
    const last = end || start
    if (last < start) return res.status(400).json({ success: false, message: 'The last day is before the first day.' })
    if ((new Date(last) - new Date(start)) / 864e5 > 120) return res.status(400).json({ success: false, message: 'A closure can be at most 120 days.' })
    const closure = await SchoolClosure.create({ name: String(name).trim(), start, end: last, kind, note, createdBy: req.user._id })
    res.json({ success: true, data: { closure }, message: 'Added. No lessons will be created on these days; untouched lessons already made are removed.' })
    require('../lib/timetableMaterializer').reconcileSoon()
  } catch (e) { res.status(400).json({ success: false, message: e.message || 'Could not add it.' }) }
})

router.delete('/:id', auth, requireRole(...STAFF), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id.' })
    await SchoolClosure.deleteOne({ _id: req.params.id })
    res.json({ success: true, message: 'Removed. Lessons on those days will be created again.' })
    require('../lib/timetableMaterializer').reconcileSoon()
  } catch (e) { res.status(500).json({ success: false, message: 'Could not remove it.' }) }
})

module.exports = router
