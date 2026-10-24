/**
 * lib/lessonNotices.js — emails to families (student + parents) and staff
 * about lessons: moved, cancelled, not held, extra / make-up lessons, the
 * "has not joined" absence alert, and alerts to the academic office.
 *
 * Every function is fire-and-forget: it logs and never throws, so a mail
 * problem can never fail the request that triggered it.
 *
 * Lessons that are in person for a student (lib/learningMode.js) send that
 * family none of these: they get tomorrow's timetable each evening instead.
 */
// Loaded lazily, so page() can be used (and unit-tested) without a database.
const User = { find: (...a) => require('../models/User').find(...a), findById: (...a) => require('../models/User').findById(...a) }
const hasLeft = (...a) => require('./studentExit').hasLeft(...a)
const resolveStudentRecipients = (...a) => require('./recipients').resolveStudentRecipients(...a)
const getTransporter = () => require('./issueInvoice').getTransporter()
const { inPersonLesson } = require('./learningMode')

const FROM = () => process.env.EMAIL_FROM || 'Smartious <hello@smartioushomeschool.com>'
const ACADEMIC_TO = () => process.env.ACADEMIC_EMAIL || process.env.SCHEDULING_ALERT_EMAIL || 'academics@smartioushomeschool.com'
const PORTAL = () => (process.env.CLIENT_URL || 'https://smartioushomeschool.com').replace(/\/$/, '')
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

const WHEN = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Africa/Nairobi',
})
const when = (d) => (d ? WHEN.format(new Date(d)) + ' (Nairobi time)' : '')
// Nairobi time, plus the family's own time when they live elsewhere.
function whenFor(d, tz) {
  if (!d) return ''
  const base = when(d)
  if (!tz || tz === 'Africa/Nairobi') return base
  try {
    const local = new Intl.DateTimeFormat('en-GB', { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz }).format(new Date(d))
    return `${base} — ${local} your time`
  } catch { return base }
}
const subjectOf = (cls) => cls.subject || cls.title || 'Lesson'

function page(title, lines, cta) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center">
<table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E8E2D6;">
<tr><td style="background:linear-gradient(135deg,#7D1025,#5A0B1B);padding:22px 30px;">
  <div style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.55);margin-bottom:6px">Smartious Homeschool · Lessons</div>
  <div style="font-size:19px;font-weight:800;color:#fff;">${esc(title)}</div>
</td></tr>
<tr><td style="padding:24px 30px;font-size:14px;color:#2c2c2c;line-height:1.65;">
  ${lines.map(l => `<p style="margin:0 0 12px;">${l}</p>`).join('')}
  ${cta ? `<a href="${cta.href}" style="display:block;background:#7D1025;color:#fff;text-align:center;padding:12px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;margin-top:8px;">${esc(cta.label)}</a>` : ''}
</td></tr>
<tr><td style="background:#FDFAF4;padding:12px 30px;border-top:1px solid #E8E2D6;">
  <p style="font-size:11px;color:#999;margin:0;">Academic office: +254 182 071 920 · academics@smartioushomeschool.com</p>
</td></tr></table></td></tr></table></body></html>`
}

/**
 * Send one message per student to the student and their parents. `cls`
 * (one lesson) skips students for whom it is in person; `build` may also
 * return null to skip a student.
 */
async function toFamilies(studentIds, build, category = 'classUpdates', cls = null) {
  const t = getTransporter()
  if (!t || !studentIds || !studentIds.length) return 0
  const students = await User.find({ _id: { $in: studentIds }, role: 'student' })
    .select('firstName lastName email emailPrefs parentEmail linkedParents parentId parentName onBreak timezone deliveryMode archived studentStatus').lean()
  let sent = 0
  for (const st of students) {
    if (cls && inPersonLesson(cls, st)) continue
    if (hasLeft(st)) continue
    try {
      const msg = build(st)
      if (!msg) continue
      const r = await resolveStudentRecipients(st, { includeStudent: true, category })
      if (!r.to.length) continue
      const { subject, html } = msg
      await t.sendMail({ from: FROM(), to: r.to.join(', '), subject, html })
      sent++
    } catch (e) { console.error('[lesson notice]', st.firstName, e.message) }
  }
  return sent
}

/** A lesson was moved to a new time. */
function lessonMoved(cls, oldAt) {
  return toFamilies(cls.assignedStudents, (st) => ({
    subject: `Lesson moved — ${subjectOf(cls)}, now ${whenFor(cls.scheduledAt, st.timezone)}`,
    html: page('A lesson has moved', [
      `${esc(st.firstName)}'s <strong>${esc(subjectOf(cls))}</strong> lesson has been moved.`,
      oldAt ? `Was: ${esc(whenFor(oldAt, st.timezone))}` : '',
      `<strong>Now: ${esc(whenFor(cls.scheduledAt, st.timezone))}</strong>`,
      'The reminder will come 30 minutes before the new time.',
    ].filter(Boolean), { href: PORTAL() + '/student', label: 'Open the student portal' }),
  }), 'classUpdates', cls).catch(e => console.error('[lesson notice] moved', e.message))
}

/** A lesson was cancelled in advance, or closed as not held. */
function lessonCancelled(cls, { reason = '', notHeld = false } = {}) {
  return toFamilies(cls.assignedStudents, (st) => ({
    subject: `${notHeld ? 'Lesson did not take place' : 'Lesson cancelled'} — ${subjectOf(cls)}, ${when(cls.scheduledAt)}`,
    html: page(notHeld ? 'A lesson did not take place' : 'A lesson has been cancelled', [
      `${esc(st.firstName)}'s <strong>${esc(subjectOf(cls))}</strong> lesson on ${esc(whenFor(cls.scheduledAt, st.timezone))} ${notHeld ? 'did not take place' : 'is cancelled'}.`,
      reason ? `Reason: ${esc(reason)}` : '',
      'If a make-up lesson is arranged you will receive its time by email.',
    ].filter(Boolean), { href: PORTAL() + '/student', label: 'Open the student portal' }),
  }), 'classUpdates', cls).catch(e => console.error('[lesson notice] cancelled', e.message))
}

/** A teacher added an extra or make-up lesson. */
function lessonAdded(cls, { makeUp = false } = {}) {
  return toFamilies(cls.assignedStudents, (st) => ({
    subject: `${makeUp ? 'Make-up lesson' : 'Extra lesson'} — ${subjectOf(cls)}, ${when(cls.scheduledAt)}`,
    html: page(makeUp ? 'A make-up lesson is booked' : 'An extra lesson is booked', [
      `${esc(st.firstName)} has ${makeUp ? 'a make-up' : 'an extra'} <strong>${esc(subjectOf(cls))}</strong> lesson.`,
      `<strong>${esc(whenFor(cls.scheduledAt, st.timezone))}</strong>, ${cls.durationMins || 60} minutes.`,
      cls.syllabusTopicName ? `Topic: ${esc(cls.syllabusTopicName)}${cls.syllabusSubtopicName ? ': ' + esc(cls.syllabusSubtopicName) : ''}` : '',
    ].filter(Boolean), { href: PORTAL() + '/student', label: 'Open the student portal' }),
  }), 'classUpdates', cls).catch(e => console.error('[lesson notice] added', e.message))
}

/**
 * "Has not joined" alert to the student's parents (and the student) once
 * a lesson is 10 minutes old. Uses the classReminders preference: a
 * family that turned reminders off gets no alerts either.
 */
async function absenceAlert(cls, student) {
  const t = getTransporter()
  if (!t) return false
  try {
    const r = await resolveStudentRecipients(student, { includeStudent: true, category: 'classReminders' })
    if (!r.to.length) return true   // nothing we can send; do not retry forever
    await t.sendMail({
      from: FROM(), to: r.to.join(', '),
      subject: `${student.firstName} has not joined ${subjectOf(cls)} — started ${WHEN.format(new Date(cls.scheduledAt))}`,
      html: page(`${student.firstName} has not joined the lesson`, [
        `<strong>${esc(student.firstName)} ${esc(student.lastName || '')}</strong> has not joined today's <strong>${esc(subjectOf(cls))}</strong> lesson, which started at ${esc(whenFor(cls.scheduledAt, student.timezone))}.`,
        'Please make sure they join now. If they cannot attend, a parent or guardian should tell the Academic office (+254 182 071 920, call or WhatsApp, or academics@smartioushomeschool.com).',
        '<span style="font-size:12px;color:#6B6B6B">Attendance is the responsibility of the family; you can see every lesson and its attendance in the parent portal.</span>',
      ], { href: PORTAL() + '/parent', label: 'Open the parent portal' }),
    })
    return true
  } catch (e) { console.error('[absence alert]', student.firstName, e.message); return false }
}

/** An alert to the academic office (DOS). */
async function academicAlert(subject, lines) {
  const t = getTransporter()
  if (!t) return
  try { await t.sendMail({ from: FROM(), to: ACADEMIC_TO(), subject, html: page(subject, lines) }) }
  catch (e) { console.error('[academic alert]', e.message) }
}

/**
 * The teacher is unavailable (approved leave): one message per student
 * per leave, to the student and parents. The reason for the leave is
 * never shared.
 */
async function teacherUnavailable({ studentId, teacher, leave, lessons }) {
  const t = getTransporter()
  if (!t) return false
  try {
    const st = await User.findById(studentId)
      .select('firstName lastName email emailPrefs parentEmail linkedParents parentId parentName onBreak timezone deliveryMode archived studentStatus').lean()
    if (!st || hasLeft(st)) return true
    // In-person lessons are on the family's evening timetable instead.
    lessons = (lessons || []).filter(l => !inPersonLesson(l, st))
    if (!lessons.length) return true
    const r = await resolveStudentRecipients(st, { includeStudent: true, category: 'classUpdates' })
    if (!r.to.length) return true
    const tName = teacher ? `${teacher.firstName} ${teacher.lastName || ''}`.trim() : 'Your teacher'
    const day = (d) => new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Nairobi' })
    const period = day(leave.leaveStartDate) === day(leave.leaveEndDate) ? `on ${day(leave.leaveStartDate)}` : `from ${day(leave.leaveStartDate)} to ${day(leave.leaveEndDate)}`
    const list = lessons.map(l => `<li>${esc(subjectOf(l))} — ${esc(whenFor(l.scheduledAt, st.timezone))}</li>`).join('')
    const n = lessons.length
    await t.sendMail({
      from: FROM(), to: r.to.join(', '),
      subject: `${tName} is unavailable ${period} — ${st.firstName}'s lessons`,
      html: page(`${tName} is unavailable`, [
        `${esc(tName)} is unavailable ${esc(period)}, so ${esc(st.firstName)}'s lesson${n > 1 ? 's' : ''} with ${esc(teacher ? teacher.firstName : 'the teacher')} in that time will not take place:`,
        `<ul style="margin:0;padding-left:18px">${list}</ul>`,
        `<strong>The missed session${n > 1 ? 's' : ''} will be recovered.</strong> In the next class, ${esc(teacher ? teacher.firstName : 'the teacher')} will agree with ${esc(st.firstName)} when to hold the make-up session${n > 1 ? 's' : ''}, and you will receive the new time${n > 1 ? 's' : ''} by email.`,
        'No action is needed from you. Lessons with other teachers continue as normal.',
      ], { href: PORTAL() + '/parent', label: 'Open the parent portal' }),
    })
    return true
  } catch (e) { console.error('[lesson notice] unavailable', e.message); return false }
}

/** A leave was withdrawn: these lessons take place after all. */
function lessonsRestored(lessons) {
  const byStudent = new Map()
  for (const l of lessons) for (const sid of l.assignedStudents || []) {
    const k = String(sid); if (!byStudent.has(k)) byStudent.set(k, []); byStudent.get(k).push(l)
  }
  return toFamilies([...byStudent.keys()], (st) => {
    const mine = (byStudent.get(String(st._id)) || []).filter(l => !inPersonLesson(l, st))
    if (!mine.length) return null
    return {
      subject: `Lessons back on — ${mine.map(subjectOf).filter((x, i, a) => a.indexOf(x) === i).join(', ')}`,
      html: page('Lessons are back on', [
        `Good news: the teacher is available after all, so ${esc(st.firstName)}'s lesson${mine.length > 1 ? 's' : ''} below will take place as originally scheduled:`,
        `<ul style="margin:0;padding-left:18px">${mine.map(l => `<li>${esc(subjectOf(l))} — ${esc(whenFor(l.scheduledAt, st.timezone))}</li>`).join('')}</ul>`,
        'The reminder will come 30 minutes before each lesson.',
      ], { href: PORTAL() + '/student', label: 'Open the student portal' }),
    }
  })
}

module.exports = { lessonMoved, lessonCancelled, lessonAdded, absenceAlert, academicAlert, teacherUnavailable, lessonsRestored, when, whenFor, page }
