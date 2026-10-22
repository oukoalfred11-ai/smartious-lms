/**
 * lib/dailyTimetable.js — tomorrow's timetable, emailed each evening to
 * students who learn at a centre (In-person and Hybrid, lib/learningMode.js)
 * and their parents.
 *
 * In-person lessons send no join reminders or per-lesson change emails;
 * this one email replaces them. It lists every lesson tomorrow (at the
 * centre or online, cancelled ones marked), and tells the family to call
 * the academic office before the day if anything needs to change.
 *
 * Runs from 18:00 Nairobi (checked every 10 minutes until 22:00, so a
 * restart at 19:00 still sends). A Hybrid student is emailed only when at
 * least one of tomorrow's lessons is in person. User.timetableEmailedFor
 * records the day already sent, so nobody gets it twice.
 */
const { zonedParts, zonedTimeToUtc, zonedDayKey } = require('./schoolTime')
const { inPersonLesson, CENTRE_STUDENT_FILTER } = require('./learningMode')
// Models, mail and the email frame load lazily, so tomorrow() and
// buildEmail() can be unit-tested without a database.

const TZ = 'Africa/Nairobi'
const SEND_HOUR = Number(process.env.TIMETABLE_EMAIL_HOUR || 18)
const FROM = () => process.env.EMAIL_FROM || 'Smartious <hello@smartioushomeschool.com>'
const PORTAL = () => (process.env.CLIENT_URL || 'https://smartioushomeschool.com').replace(/\/$/, '')
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const time = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TZ })
const dayName = (d) => new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ })

/** [start, end) of the Nairobi day after `now`. */
function tomorrow(now) {
  const p = zonedParts(now, TZ)
  const start = zonedTimeToUtc(p.year, p.month, p.day + 1, 0, 0, TZ)
  const end = zonedTimeToUtc(p.year, p.month, p.day + 2, 0, 0, TZ)
  return { start, end, key: zonedDayKey(start, TZ) }
}

function buildEmail(st, lessons, day) {
  const rows = lessons.map(l => {
    const cancelled = l.status === 'cancelled'
    const where = inPersonLesson(l, st) ? (l.timetableEntryId?.location || 'At the centre') : 'Online (student portal)'
    const teacher = l.teacherId ? `${l.teacherId.firstName} ${l.teacherId.lastName || ''}`.trim() : ''
    const topic = [l.syllabusTopicName, l.syllabusSubtopicName].filter(Boolean).join(': ')
    return `<tr style="${cancelled ? 'color:#9A8F86;text-decoration:line-through;' : ''}">
      <td style="padding:7px 8px;border-bottom:1px solid #EEE7DB;white-space:nowrap;vertical-align:top"><strong>${esc(time(l.scheduledAt))}</strong></td>
      <td style="padding:7px 8px;border-bottom:1px solid #EEE7DB;vertical-align:top"><strong>${esc(l.subject || l.title || 'Lesson')}</strong>${teacher ? `<br><span style="font-size:12px;color:#6B6B6B">${esc(teacher)}</span>` : ''}${topic ? `<br><span style="font-size:12px;color:#6B6B6B">${esc(topic)}</span>` : ''}</td>
      <td style="padding:7px 8px;border-bottom:1px solid #EEE7DB;vertical-align:top;font-size:12.5px">${cancelled ? '<span style="text-decoration:none;color:#B91C1C;font-weight:700">Cancelled</span>' : esc(where)}</td>
    </tr>`
  }).join('')
  const { page } = require('./lessonNotices')
  const table = `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13.5px">${rows}</table>`
  return {
    subject: `Tomorrow's timetable — ${st.firstName}, ${day}`,
    html: page(`${st.firstName}'s timetable for ${day}`, [
      `Here is ${esc(st.firstName)}'s timetable for tomorrow, <strong>${esc(day)}</strong> (Nairobi time).`,
      table,
      `<strong>Need a change?</strong> Please contact the academic office before ${esc(day)}: +254 182 071 920 (call or WhatsApp) or academics@smartioushomeschool.com.`,
      'Homework is set and handed in online in the student portal.',
    ], { href: PORTAL() + '/student', label: 'Open the student portal' }),
  }
}

async function runDailyTimetable(now = new Date()) {
  const hour = zonedParts(now, TZ).hour
  if (hour < SEND_HOUR || hour >= SEND_HOUR + 4) return 0
  const User = require('../models/User')
  const LiveClass = require('../models/LiveClass')
  const { resolveStudentRecipients } = require('./recipients')
  const t = require('./issueInvoice').getTransporter()
  if (!t) return 0
  const { start, end, key } = tomorrow(now)
  const students = await User.find({
    ...CENTRE_STUDENT_FILTER, isActive: true, archived: { $ne: true }, onBreak: { $ne: true },
    timetableEmailedFor: { $ne: key },
  }).select('firstName lastName email emailPrefs parentEmail linkedParents parentId parentName onBreak timezone deliveryMode').lean()
  if (!students.length) return 0

  const lessons = await LiveClass.find({
    assignedStudents: { $in: students.map(s => s._id) }, kind: { $in: ['lesson', null] },
    scheduledAt: { $gte: start, $lt: end },
  }).populate('teacherId', 'firstName lastName').populate('timetableEntryId', 'location')
    .select('subject title scheduledAt status deliveryMode assignedStudents teacherId timetableEntryId syllabusTopicName syllabusSubtopicName')
    .sort({ scheduledAt: 1 }).lean()

  const day = dayName(start)
  let sent = 0
  for (const st of students) {
    const mine = lessons.filter(l => (l.assignedStudents || []).some(id => String(id) === String(st._id)))
    // Nothing tomorrow, or (Hybrid) nothing in person: no email.
    if (mine.some(l => l.status !== 'cancelled' && inPersonLesson(l, st))) {
      try {
        const r = await resolveStudentRecipients(st, { includeStudent: true, category: 'classUpdates' })
        if (r.to.length) {
          const { subject, html } = buildEmail(st, mine, day)
          await t.sendMail({ from: FROM(), to: r.to.join(', '), subject, html })
          sent++
        }
      } catch (e) { console.error('[daily timetable]', st.firstName, e.message); continue }
    }
    await User.updateOne({ _id: st._id }, { $set: { timetableEmailedFor: key } })
  }
  if (sent) console.log(`[daily timetable] ${sent} timetable email(s) for ${key}`)
  return sent
}

module.exports = { runDailyTimetable, buildEmail, tomorrow }
