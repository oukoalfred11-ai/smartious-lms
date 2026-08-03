/**
 * routes/birthdays.js
 * Mounted at /api/birthdays
 * ============================================================
 * Community birthdays: every signed-in user sees today's
 * celebrants on their dashboard and can send them a personal
 * birthday letter, delivered by branded email and stored so
 * the celebrant can read their letters in the portal.
 */
const express = require('express')
const router  = express.Router()
const mongoose = require('mongoose')
const { auth } = require('../middleware/auth')
const User = require('../models/User')
const { sendBirthdayLetterEmail } = require('../services/notificationEmails')

// ── Letter model (kept here: single, small, birthday-only) ──
const birthdayLetterSchema = new mongoose.Schema({
  from:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromName:   { type: String, default: '' },
  fromRole:   { type: String, default: '' },
  to:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message:    { type: String, required: true, maxlength: 1200 },
  year:       { type: Number, required: true },
}, { timestamps: true })
birthdayLetterSchema.index({ from: 1, to: 1, year: 1 }, { unique: true })
const BirthdayLetter = mongoose.models.BirthdayLetter || mongoose.model('BirthdayLetter', birthdayLetterSchema)

function eatNow() { return new Date(Date.now() + 3 * 60 * 60 * 1000) }
function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 }

function todayMatches() {
  const eat = eatNow()
  const year = eat.getUTCFullYear()
  const month = eat.getUTCMonth() + 1
  const day = eat.getUTCDate()
  const matches = [[month, day]]
  if (month === 2 && day === 28 && !isLeapYear(year)) matches.push([2, 29])
  return { year, matches }
}

// ── GET /api/birthdays/today ────────────────────────────────
// Today's celebrants, visible to every signed-in user.
router.get('/today', auth, async (req, res) => {
  try {
    const { year, matches } = todayMatches()
    const celebrants = await User.find({
      isActive: true,
      dateOfBirth: { $ne: null },
      $or: matches.map(([m, d]) => ({
        $expr: { $and: [
          { $eq: [{ $month: '$dateOfBirth' }, m] },
          { $eq: [{ $dayOfMonth: '$dateOfBirth' }, d] },
        ] }
      })),
    }).select('firstName lastName role avatar gradeLevel curriculum').limit(30).lean()

    // Which celebrants has the requester already written to this year?
    const sentTo = celebrants.length
      ? await BirthdayLetter.find({ from: req.user._id, to: { $in: celebrants.map(c => c._id) }, year })
          .select('to').lean()
      : []
    const sentSet = new Set(sentTo.map(l => String(l.to)))

    return res.json({ success: true, data: {
      celebrants: celebrants.map(c => ({
        _id: c._id,
        firstName: c.firstName, lastName: c.lastName,
        role: c.role, avatar: c.avatar || '',
        gradeLevel: c.gradeLevel || '', curriculum: c.curriculum || '',
        isMe: String(c._id) === String(req.user._id),
        letterSent: sentSet.has(String(c._id)),
      })),
    } })
  } catch (e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── POST /api/birthdays/:userId/letter ──────────────────────
router.post('/:userId/letter', auth, async (req, res) => {
  try {
    const message = String(req.body.message || '').trim()
    if (!message) return res.status(400).json({ success: false, message: 'Write a message first.' })
    if (message.length > 1200) return res.status(400).json({ success: false, message: 'Letters are limited to 1200 characters.' })
    if (String(req.params.userId) === String(req.user._id))
      return res.status(400).json({ success: false, message: 'You cannot send a letter to yourself.' })

    const celebrant = await User.findOne({ _id: req.params.userId, isActive: true })
      .select('firstName lastName email dateOfBirth')
    if (!celebrant) return res.status(404).json({ success: false, message: 'User not found.' })

    // Only on their actual birthday (EAT)
    const { year, matches } = todayMatches()
    const dob = celebrant.dateOfBirth ? new Date(celebrant.dateOfBirth) : null
    const isToday = dob && matches.some(([m, d]) => dob.getUTCMonth() + 1 === m && dob.getUTCDate() === d)
    if (!isToday) return res.status(400).json({ success: false, message: 'Letters can only be sent on the birthday itself.' })

    const fromName = `${req.user.firstName} ${req.user.lastName}`.trim()
    let letter
    try {
      letter = await BirthdayLetter.create({
        from: req.user._id, fromName, fromRole: req.user.role,
        to: celebrant._id, message, year,
      })
    } catch (e) {
      if (e.code === 11000) return res.status(400).json({ success: false, message: 'You have already sent this person a birthday letter today.' })
      throw e
    }

    // Best-effort email delivery of the letter
    sendBirthdayLetterEmail({ celebrant, fromName, message })
      .catch(e => console.error('[birthdays] letter email failed:', e.message))

    return res.status(201).json({ success: true, message: 'Your birthday letter has been delivered.', data: { letter } })
  } catch (e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── GET /api/birthdays/my-letters ───────────────────────────
// Letters the signed-in user received this year (celebrant view).
router.get('/my-letters', auth, async (req, res) => {
  try {
    const { year } = todayMatches()
    const letters = await BirthdayLetter.find({ to: req.user._id, year })
      .sort({ createdAt: -1 }).limit(100).lean()
    return res.json({ success: true, data: { letters } })
  } catch (e) { return res.status(500).json({ success: false, message: e.message }) }
})

module.exports = router
