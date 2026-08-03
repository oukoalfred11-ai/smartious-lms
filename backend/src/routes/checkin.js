/**
 * routes/checkin.js
 * Self-check-in for students and all staff (except admin).
 * Mounted at /api/checkin
 *
 * Endpoints:
 *   POST /api/checkin          — self check-in (present/absent/late)
 *   GET  /api/checkin/today    — get my check-in status for today
 *   GET  /api/checkin/history  — my last 30 days
 *   GET  /api/checkin/status   — DOS/admin: who checked in today
 *   POST /api/checkin/remind   — trigger manual reminder (admin/dos)
 *   POST /api/checkin/break    — DOS/admin: put user on break
 *   DELETE /api/checkin/break/:userId — remove break
 */

const express   = require('express')
const router    = express.Router()
const nodemailer = require('nodemailer')
const { auth, requireRole } = require('../middleware/auth')
const User       = require('../models/User')
const Attendance = require('../models/Attendance')

const SELF_ROLES = ['student','teacher','sales','ops_manager','accountant','dos']
const ADMIN_ROLES = ['admin','dos','ops_manager','accountant','sales']

function getTransporter() {
  const u = process.env.EMAIL_USER, p = process.env.EMAIL_PASSWORD
  if (!u||!p) return null
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT||'587',10),
    secure: parseInt(process.env.EMAIL_PORT||'587',10) === 465,
    auth: { user:u, pass:p },
  })
}

function todayUTC() {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function isoDate(d) {
  return new Date(d).toISOString().slice(0,10)
}

// ── POST /api/checkin ─────────────────────────────────────
// Self check-in. Body: { status, lateTime?, reason? }
// status: 'present' | 'absent' | 'late'
router.post('/', auth, async (req, res) => {
  try {
    if (!SELF_ROLES.includes(req.user.role))
      return res.status(403).json({ success:false, message:'Check-in not available for this role.' })

    const user = await User.findById(req.user._id).lean()
    if (user.onBreak)
      return res.status(400).json({ success:false, message:'You are currently on a break. Contact your DOS or admin.' })

    const { status='present', lateTime='', reason='' } = req.body
    const VALID = ['present','absent','late']
    if (!VALID.includes(status))
      return res.status(400).json({ success:false, message:'Status must be present, absent or late.' })
    if (status==='absent' && !reason?.trim())
      return res.status(400).json({ success:false, message:'Please provide a reason for absence.' })
    if (status==='late' && !lateTime?.trim())
      return res.status(400).json({ success:false, message:'Please provide your arrival time.' })

    const today = todayUTC()

    // Map 'late' to 'present' in the Attendance model (status stored as present with lateTime note)
    const attStatus = status === 'absent' ? 'absent' : 'present'
    const noteText  = status === 'late'
      ? `Late arrival: ${lateTime}`
      : reason?.trim() || ''

    const doc = await Attendance.findOneAndUpdate(
      { studentId: req.user._id, date: today },
      { $set: {
          status:     attStatus,
          reason:     status==='absent' ? reason.trim() : noteText,
          markedBy:   req.user._id,
          markedAt:   new Date(),
          curriculum: Array.isArray(user.curriculum) ? user.curriculum.join(', ') : (user.curriculum || ''),
          // Extra fields for check-in
          checkedIn:     true,
          checkInStatus: status,        // 'present'|'absent'|'late'
          lateTime:      status==='late' ? lateTime.trim() : '',
          checkInTime:   new Date(),
      }},
      { upsert:true, new:true, setDefaultsOnInsert:true }
    )

    return res.json({ success:true, message:'Check-in recorded.', data:{ record:doc } })
  } catch(e) {
    console.error('[checkin POST]', e.message)
    return res.status(500).json({ success:false, message:e.message })
  }
})

// ── GET /api/checkin/today ────────────────────────────────
router.get('/today', auth, async (req, res) => {
  try {
    const today  = todayUTC()
    const record = await Attendance.findOne({ studentId:req.user._id, date:today }).lean()
    const user   = await User.findById(req.user._id).select('onBreak breakType breakNote breakStart breakEnd').lean()
    return res.json({ success:true, data:{
      record,
      checkedIn:     !!record?.checkedIn,
      checkInStatus: record?.checkInStatus || null,
      onBreak:       user.onBreak,
      breakType:     user.breakType,
      breakNote:     user.breakNote,
    }})
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── GET /api/checkin/history ──────────────────────────────
router.get('/history', auth, async (req, res) => {
  try {
    const from = new Date(Date.now() - 30*24*60*60*1000)
    const records = await Attendance.find({ studentId:req.user._id, date:{ $gte:from } })
      .sort({ date:-1 }).lean()
    return res.json({ success:true, data:{ records } })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── GET /api/checkin/status ───────────────────────────────
// DOS/admin: who has checked in today, who hasn't, who's on break
router.get('/status', auth, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const today   = todayUTC()
    const { role } = req.query  // optional filter

    const userFilter = { role:{ $in: SELF_ROLES } }
    if (role && SELF_ROLES.includes(role)) userFilter.role = role

    const [users, records] = await Promise.all([
      User.find(userFilter).select('firstName lastName email role curriculum gradeLevel onBreak breakType').lean(),
      Attendance.find({ date:today }).lean(),
    ])

    const recMap = {}
    records.forEach(r => { recMap[String(r.studentId)] = r })

    const result = users.map(u => {
      const rec = recMap[String(u._id)]
      return {
        userId:        u._id,
        name:          u.firstName+' '+u.lastName,
        email:         u.email,
        role:          u.role,
        curriculum:    Array.isArray(u.curriculum) ? u.curriculum.join(', ') : u.curriculum,
        grade:         u.gradeLevel,
        onBreak:       u.onBreak,
        breakType:     u.breakType,
        checkedIn:     !!rec?.checkedIn,
        checkInStatus: rec?.checkInStatus || null,
        lateTime:      rec?.lateTime || '',
        checkInTime:   rec?.checkInTime || null,
        reason:        rec?.reason || '',
      }
    })

    const summary = {
      total:      result.length,
      present:    result.filter(u=>u.checkInStatus==='present').length,
      late:       result.filter(u=>u.checkInStatus==='late').length,
      absent:     result.filter(u=>u.checkInStatus==='absent').length,
      notCheckedIn: result.filter(u=>!u.checkedIn&&!u.onBreak).length,
      onBreak:    result.filter(u=>u.onBreak).length,
    }

    return res.json({ success:true, data:{ users:result, summary, date:today } })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── POST /api/checkin/remind ──────────────────────────────
// Send manual check-in reminder. Also called by daily cron at 7 AM.
router.post('/remind', auth, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const sent = await sendDailyReminders()
    return res.json({ success:true, message:`Reminders sent to ${sent} users.`, data:{ sent } })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

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
        isActive:   false,
      }
    }, { new:true })

    if (!user) return res.status(404).json({ success:false, message:'User not found.' })
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
    return res.json({ success:true, message:`${user.firstName} ${user.lastName} is back from break.`, data:{ user } })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── Daily reminder function ───────────────────────────────
async function sendDailyReminders() {
  const t = getTransporter()
  if (!t) { console.log('[checkin reminder] Email not configured'); return 0 }

  // Only send on weekdays Mon-Fri
  const dayOfWeek = new Date().getDay() // 0=Sun
  if (dayOfWeek === 0 || dayOfWeek === 6) return 0

  const today = todayUTC()

  // Get all active users who haven't checked in yet today
  const users = await User.find({
    role: { $in: SELF_ROLES },
    isActive: true,
    onBreak:  false,
    email:    { $exists:true, $ne:'' },
  }).select('firstName lastName email role').lean()

  const records = await Attendance.find({ date:today, checkedIn:true }).select('studentId').lean()
  const checkedInIds = new Set(records.map(r=>String(r.studentId)))

  const pending = users.filter(u => !checkedInIds.has(String(u._id)))

  let sent = 0
  for (const user of pending) {
    try {
      await t.sendMail({
        from: process.env.EMAIL_FROM || 'Smartious <hellosmartious@gmail.com>',
        to:   user.email,
        subject: 'Daily check-in reminder — Smartious',
        html: buildReminderEmail(user),
        text: `Hi ${user.firstName}, please log in to your Smartious portal and check in for today. smartioushomeschool.com`,
      })
      sent++
    } catch(e) { console.error('[checkin reminder]', user.email, e.message) }
  }

  console.log(`[checkin reminder] Sent ${sent}/${pending.length} reminders`)
  return sent
}

function buildReminderEmail(user) {
  const portalPath = user.role==='student'?'/student':user.role==='teacher'?'/teacher':
    user.role==='sales'?'/sales':user.role==='ops_manager'?'/ops':
    user.role==='accountant'?'/accounts':user.role==='dos'?'/dos':'/login'
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#FDFAF4;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#8B1A2E,#6E1424);padding:24px 32px;">
  <div style="font-size:20px;font-weight:800;color:#fff;">Good morning, ${user.firstName}!</div>
  <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:4px;">Smartious Homeschool Global</div>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="font-size:15px;color:#2c2c2c;margin:0 0 20px;line-height:1.6;">
    This is your daily check-in reminder. Please log in to your portal and mark your attendance for today.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;border-radius:8px;border:1px solid #E8E2D6;margin-bottom:24px;">
    <tr><td style="padding:16px 18px;">
      <div style="font-size:13px;color:#2c2c2c;line-height:1.8;">
        <strong>Today:</strong> ${new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}<br>
        <strong>Check-in options:</strong> Present · Late (with time) · Absent (with reason)
      </div>
    </td></tr>
  </table>
  <a href="https://smartioushomeschool.com${portalPath}" style="display:block;background:#8B1A2E;color:#fff;text-align:center;padding:13px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">
    Go to my portal and check in
  </a>
  <p style="font-size:12px;color:#6B6B6B;margin:18px 0 0;text-align:center;">
    You will not receive this reminder once you have checked in.
  </p>
</td></tr>
<tr><td style="background:#FDFAF4;padding:16px 32px;border-top:1px solid #E8E2D6;">
  <p style="font-size:11px;color:#999;margin:0;">© ${new Date().getFullYear()} Smartious Homeschool Global</p>
</td></tr>
</table></td></tr></table></body></html>`
}

// Export both router and reminder function (called by index.js cron)
module.exports = router
module.exports.sendDailyReminders = sendDailyReminders
