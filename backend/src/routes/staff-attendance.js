/**
 * routes/staff-attendance.js — the Dean marks teachers' attendance
 * (mounted at /api/staff-attendance).
 *
 *   GET  /?day=YYYY-MM-DD        every teacher, their mark for the day, approved
 *                                leave and that day's lessons (held / not held)
 *   POST /                       { day, marks: [{ staffId, status, note }] }
 *   GET  /summary?from&to        per teacher: days marked by status, rate
 *   GET  /mine?from&to           a teacher's own marks
 *
 * Marks: present, late, half_day, absent, leave, off (no lessons that day).
 * Attendance rate = (present + late + half a day for half_day) of days
 * marked, excluding leave and off days.
 */
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const User = require('../models/User')
const LiveClass = require('../models/LiveClass')
const TeacherLeaveRequest = require('../models/TeacherLeaveRequest')
const StaffAttendance = require('../models/StaffAttendance')
const { STAFF_MARKS } = StaffAttendance
const { zonedDayKey, zonedTimeToUtc } = require('../lib/schoolTime')

const DEAN = requireRole('admin', 'dos', 'ops_manager')
const TZ = 'Africa/Nairobi'
const isDay = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) && !isNaN(new Date(s + 'T00:00:00Z'))
const nameOf = (u) => (u ? [u.firstName, u.lastName].filter(Boolean).join(' ') : '')
const dayBounds = (day) => {
  const [y, m, d] = day.split('-').map(Number)
  const start = zonedTimeToUtc(y, m, d, 0, 0, TZ)
  return { start, end: new Date(start.getTime() + 864e5 - 1) }
}
const rateOf = (c) => {
  const counted = c.present + c.late + c.half_day + c.absent
  return counted ? Math.round(((c.present + c.late + c.half_day * 0.5) / counted) * 1000) / 10 : null
}

router.get('/', auth, DEAN, async (req, res) => {
  try {
    const day = isDay(req.query.day) ? req.query.day : zonedDayKey(new Date(), TZ)
    const { start, end } = dayBounds(day)
    const [teachers, marks, leaves, lessons] = await Promise.all([
      User.find({ role: 'teacher', isActive: { $ne: false }, archived: { $ne: true } }).select('firstName lastName email teacherCategory').sort({ firstName: 1, lastName: 1 }).lean(),
      StaffAttendance.find({ day }).populate('markedBy', 'firstName lastName').lean(),
      TeacherLeaveRequest.find({ status: 'Approved', leaveStartDate: { $lte: end }, leaveEndDate: { $gte: start } }).select('teacherId leaveType leaveStartDate leaveEndDate').lean(),
      LiveClass.find({ scheduledAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' }, kind: { $in: ['lesson', null] } })
        .select('teacherId subject title scheduledAt status outcome').sort({ scheduledAt: 1 }).lean(),
    ])
    const markBy = new Map(marks.map(m => [String(m.staffId), m]))
    const leaveBy = new Map(leaves.map(l => [String(l.teacherId), l]))
    const lessonsBy = {}
    lessons.forEach(l => { (lessonsBy[String(l.teacherId)] = lessonsBy[String(l.teacherId)] || []).push(l) })
    const rows = teachers.map(t => {
      const id = String(t._id), m = markBy.get(id), lv = leaveBy.get(id), ls = lessonsBy[id] || []
      return {
        staffId: t._id, name: nameOf(t), email: t.email, category: t.teacherCategory || 'teacher',
        status: m?.status || null, note: m?.note || '', markedBy: nameOf(m?.markedBy), markedAt: m?.updatedAt || null,
        onLeave: lv ? lv.leaveType || 'Approved leave' : null,
        lessons: ls.map(l => ({ time: l.scheduledAt, subject: l.subject || l.title, outcome: l.outcome || (l.status === 'ended' ? 'ended' : l.status) })),
        // A starting point the Dean can accept: leave, no lessons (off), or
        // lessons that ran.
        suggested: lv ? 'leave' : !ls.length ? 'off' : ls.some(l => ['taught', 'student_absent'].includes(l.outcome) || l.status === 'ended') ? 'present' : null,
      }
    })
    const count = (s) => rows.filter(r => r.status === s).length
    res.json({ success: true, data: { day, rows, summary: {
      teachers: rows.length, marked: rows.filter(r => r.status).length,
      present: count('present'), late: count('late'), half_day: count('half_day'), absent: count('absent'), leave: count('leave'), off: count('off'),
    } } })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

router.post('/', auth, DEAN, async (req, res) => {
  try {
    const { day, marks } = req.body || {}
    if (!isDay(day)) return res.status(400).json({ success: false, message: 'Choose a day.' })
    if (day > zonedDayKey(new Date(), TZ)) return res.status(400).json({ success: false, message: 'You cannot mark a day that has not happened yet.' })
    const list = Array.isArray(marks) ? marks : []
    let saved = 0, cleared = 0
    for (const m of list) {
      if (!mongoose.isValidObjectId(m?.staffId)) continue
      if (m.status === null || m.status === '') { cleared += (await StaffAttendance.deleteOne({ staffId: m.staffId, day })).deletedCount; continue }
      if (!STAFF_MARKS.includes(m.status)) return res.status(400).json({ success: false, message: 'Unknown mark: ' + m.status })
      if (!(await User.exists({ _id: m.staffId, role: 'teacher' }))) continue
      await StaffAttendance.updateOne({ staffId: m.staffId, day },
        { $set: { status: m.status, note: String(m.note || '').trim().slice(0, 300), markedBy: req.user._id } }, { upsert: true })
      saved++
    }
    res.json({ success: true, data: { saved, cleared }, message: `Register saved: ${saved} teacher${saved === 1 ? '' : 's'}.` })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

async function summary(from, to, staffIds) {
  const f = { day: { $gte: from, $lte: to } }
  if (staffIds) f.staffId = { $in: staffIds }
  const marks = await StaffAttendance.find(f).select('staffId day status note').sort({ day: 1 }).lean()
  const by = {}
  marks.forEach(m => {
    const c = by[String(m.staffId)] = by[String(m.staffId)] || { present: 0, late: 0, half_day: 0, absent: 0, leave: 0, off: 0, days: [] }
    c[m.status] += 1; c.days.push({ day: m.day, status: m.status, note: m.note })
  })
  return by
}

router.get('/summary', auth, DEAN, async (req, res) => {
  try {
    const to = isDay(req.query.to) ? req.query.to : zonedDayKey(new Date(), TZ)
    const from = isDay(req.query.from) ? req.query.from : zonedDayKey(new Date(Date.now() - 30 * 864e5), TZ)
    const [teachers, by] = await Promise.all([
      User.find({ role: 'teacher', isActive: { $ne: false }, archived: { $ne: true } }).select('firstName lastName').sort({ firstName: 1 }).lean(),
      summary(from, to),
    ])
    const rows = teachers.map(t => {
      const c = by[String(t._id)] || { present: 0, late: 0, half_day: 0, absent: 0, leave: 0, off: 0, days: [] }
      return { staffId: t._id, name: nameOf(t), ...c, marked: c.days.length, rate: rateOf(c) }
    })
    res.json({ success: true, data: { from, to, rows,
      method: 'Days the Dean marked in the range. Rate = present and late days, plus half of half days, out of days marked present, late, half day or absent. Leave and days off are not counted.' } })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

router.get('/mine', auth, requireRole('teacher'), async (req, res) => {
  try {
    const to = isDay(req.query.to) ? req.query.to : zonedDayKey(new Date(), TZ)
    const from = isDay(req.query.from) ? req.query.from : zonedDayKey(new Date(Date.now() - 60 * 864e5), TZ)
    const c = (await summary(from, to, [req.user._id]))[String(req.user._id)] || { present: 0, late: 0, half_day: 0, absent: 0, leave: 0, off: 0, days: [] }
    res.json({ success: true, data: { from, to, ...c, rate: rateOf(c) } })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

module.exports = router
module.exports.rateOf = rateOf
