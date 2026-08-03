/**
 * services/pauseAutoResume.js
 * ============================================================
 * Hourly cron: pauses are sessions that can expire. When a
 * pause's expectedEnd passes, access is automatically restored
 * (auto Report Back) without staff intervention. Pauses with
 * no expectedEnd (e.g. fee holds) stay until manual Report Back.
 *
 * Also heals legacy break flags set directly on User (by the
 * old /checkin/break flow) whose breakEnd has passed.
 */
const User = require('../models/User')
const StudentPause = require('../models/StudentPause')
const { sendReportBackNotice } = require('./notificationEmails')

async function runPauseAutoResume() {
  const now = new Date()
  try {
    // 1. End expired pause records
    const expired = await StudentPause.find({ status: 'active', expectedEnd: { $ne: null, $lte: now } })
    for (const pause of expired) {
      pause.status = 'ended'
      pause.endedAt = now
      pause.autoEnded = true
      await pause.save()
      const student = await User.findByIdAndUpdate(pause.student, {
        $set: { onBreak: false, breakType: '', breakStart: null, breakEnd: null, breakNote: '', breakBlocksAccess: false }
      }, { new: true }).select('firstName lastName email parentEmail linkedParents').lean()
      console.log('[pause-cron] Auto report-back for student', String(pause.student), '(' + pause.type + ')')
      if (student) {
        const parents = await User.find({ _id: { $in: (student.linkedParents || []) }, role: 'parent' }).select('email').lean()
        sendReportBackNotice({ student, parentEmails: parents.map(p => p.email).filter(Boolean), auto: true })
          .catch(e => console.error('[pause-cron] welcome-back email failed:', e.message))
      }
    }

    // 2. Heal legacy user flags with a passed breakEnd and no pause record
    const legacy = await User.find({
      role: 'student', onBreak: true, breakEnd: { $ne: null, $lte: now }
    }).select('_id firstName lastName')
    for (const s of legacy) {
      const hasActive = await StudentPause.exists({ student: s._id, status: 'active' })
      if (hasActive) continue // handled by step 1 next tick if dated, or manual if open-ended
      await User.findByIdAndUpdate(s._id, {
        $set: { onBreak: false, breakType: '', breakStart: null, breakEnd: null, breakNote: '', breakBlocksAccess: false, isActive: true }
      })
      console.log('[pause-cron] Auto-restored legacy break for', s.firstName, s.lastName)
    }
  } catch (e) {
    console.error('[pause-cron]', e.message)
  }
}

function startPauseAutoResumeCron() {
  // Run on boot (catch anything missed while asleep), then hourly.
  runPauseAutoResume()
  setInterval(runPauseAutoResume, 60 * 60 * 1000)
  console.log('[pause-cron] Pause auto-resume cron started (hourly)')
}

module.exports = { startPauseAutoResumeCron, runPauseAutoResume }
