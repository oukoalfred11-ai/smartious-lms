/**
 * routes/checkin.js
 * Mounted at /api/checkin. The daily self check-in is retired (its
 * endpoints answer 410); what remains is breaks:
 *   POST /api/checkin/break    — DOS/admin: put user on break
 *   DELETE /api/checkin/break/:userId — remove break
 */

const express   = require('express')
const router    = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const User       = require('../models/User')

const ADMIN_ROLES = ['admin','dos','ops_manager','accountant','sales']

// ── Daily self check-in: retired ───────────────────────────
// Student attendance comes from lessons (lib/attendanceFacts); teachers'
// attendance is the Dean's register (routes/staff-attendance.js).
const retired = (req, res) => res.status(410).json({ success:false, message:'Daily check-in has been retired. Lesson attendance is recorded automatically, and the Dean keeps the teachers\' register.' })
router.post('/', auth, retired)
router.get('/today', auth, retired)
router.get('/history', auth, retired)
router.get('/status', auth, retired)
router.post('/remind', auth, retired)

// ── POST /api/checkin/break ───────────────────────────────
// DOS/admin puts a user on break (student or staff)
router.post('/break', auth, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const { userId, breakType='other', breakNote='', breakStart, breakEnd } = req.body
    if (!userId) return res.status(400).json({ success:false, message:'userId required.' })

    const user = await User.findByIdAndUpdate(userId, {
      $set: {
        onBreak:    true,
        breakType,
        breakNote,
        breakStart: breakStart ? new Date(breakStart) : new Date(),
        breakEnd:   breakEnd   ? new Date(breakEnd)   : null,
        // A break pauses reminders and check-in; it does NOT deactivate the
        // account. Setting isActive=false here locked students out of the
        // portal ("unauthorised") until staff manually ended the break.
        // Blocking access is a separate, explicit choice (StudentPause with
        // blockAccess, e.g. a fee hold).
      }
    }, { new:true })

    if (!user) return res.status(404).json({ success:false, message:'User not found.' })
    // Record the break as a student pause too: attendance excuses lessons
    // during a pause, so a mid-term break never reads as absences.
    if (user.role === 'student') {
      try {
        const StudentPause = require('../models/StudentPause')
        await StudentPause.updateMany({ student: user._id, status: 'active', blockAccess: { $ne: true } }, { $set: { status: 'ended', endedAt: new Date() } })
        await StudentPause.create({
          student: user._id, type: StudentPause.PAUSE_TYPES.includes(breakType) ? breakType : 'other',
          note: breakNote, startAt: user.breakStart, expectedEnd: user.breakEnd,
          createdBy: req.user._id, createdByRole: req.user.role,
        })
      } catch (e) { console.error('[checkin] break pause', e.message) }
    }
    console.log('[checkin] Placed on break:', user.firstName, user.lastName, breakType)
    return res.json({ success:true, message:`${user.firstName} ${user.lastName} placed on ${breakType}.`, data:{ user } })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── DELETE /api/checkin/break/:userId ────────────────────
// Remove break — reactivate user
router.delete('/break/:userId', auth, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, {
      $set: { onBreak:false, breakType:'', breakNote:'', breakStart:null, breakEnd:null, isActive:true }
    }, { new:true })
    if (!user) return res.status(404).json({ success:false, message:'User not found.' })
    try {
      const StudentPause = require('../models/StudentPause')
      await StudentPause.updateMany({ student: user._id, status: 'active', blockAccess: { $ne: true } }, { $set: { status: 'ended', endedAt: new Date() } })
    } catch (e) { console.error('[checkin] end pause', e.message) }
    return res.json({ success:true, message:`${user.firstName} ${user.lastName} is back from break.`, data:{ user } })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── Daily reminder function ───────────────────────────────
module.exports = router
