/**
 * services/homeworkCycle.js
 * ============================================================
 * Homework should be submitted, marked, reviewed and released before
 * the next lesson in that subject. This service watches that cycle and
 * warns whoever is holding it up.
 *
 *   Student  — 2 hours before the next lesson, if not yet submitted
 *   Teacher  — as soon as a student submits
 *   Teacher  — 2 hours before the next lesson, if submitted work is
 *              still unmarked or marked but not released
 *
 * The deadline is not a fixed date. It is derived from the student's
 * own timetable, so a Tuesday physics class and a Friday physics class
 * get different deadlines from the same homework.
 *
 * Every warning is sent at most once per homework per lesson, recorded
 * on the submission, so a scheduler running every few minutes cannot
 * send the same warning twice.
 */
const Homework = require('../models/Homework')
const HomeworkSubmission = require('../models/HomeworkSubmission')
const TimetableEntry = require('../models/TimetableEntry')
const User = require('../models/User')
const { getTransporter } = require('../lib/issueInvoice')
const { resolveStudentRecipients } = require('../lib/recipients')

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const WARN_HOURS = Number(process.env.HOMEWORK_WARN_HOURS || 2)
const EAT_OFFSET_MIN = 3 * 60          // East Africa Time, no daylight saving

const FROM = () => process.env.EMAIL_FROM || 'Smartious <hellosmartious@gmail.com>'

/** Current wall-clock time in Nairobi, expressed as a Date in UTC terms. */
function nowEAT(now = new Date()) {
  return new Date(now.getTime() + EAT_OFFSET_MIN * 60000)
}

/**
 * The next occurrence of a weekly timetable slot, at or after `from`.
 * Returns a Date in the same EAT-shifted frame as nowEAT().
 */
function nextOccurrence(entry, from) {
  const target = DAYS.indexOf(entry.dayOfWeek)
  if (target < 0 || !entry.startTime) return null
  const [h, m] = entry.startTime.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null

  for (let add = 0; add <= 7; add++) {
    const d = new Date(from)
    d.setUTCDate(d.getUTCDate() + add)
    d.setUTCHours(h, m, 0, 0)
    if (d > from && d.getUTCDay() === target) return d
  }
  return null
}

/**
 * The next lesson in `subject` for one student.
 * Returns { at, entry } or null when the subject is not timetabled.
 */
async function nextLessonFor(studentId, subject, from) {
  const entries = await TimetableEntry.find({
    assignedStudents: studentId,
    subject,
    isActive: { $ne: false },
  }).lean()

  let best = null
  for (const e of entries) {
    // Respect a slot that only runs between two dates.
    if (e.startDate && new Date(e.startDate) > from) continue
    if (e.endDate && new Date(e.endDate) < from) continue
    const at = nextOccurrence(e, from)
    if (at && (!best || at < best.at)) best = { at, entry: e }
  }
  return best
}

/* ── EMAIL BODIES ─────────────────────────────────────────── */

const shell = (accent, eyebrow, heading, body) => `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 16px;background:#FDFAF4;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06);">
  <tr><td style="background:${accent};padding:22px 30px;">
    <div style="font-size:10.5px;font-weight:700;color:#F0CC5A;letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px;">${eyebrow}</div>
    <div style="font-size:19px;font-weight:800;color:#ffffff;">${heading}</div>
  </td></tr>
  <tr><td style="padding:24px 30px;">${body}</td></tr>
  <tr><td style="background:#FDFAF4;padding:15px 30px;border-top:1px solid #ECE4D4;">
    <p style="font-size:11px;color:#999;margin:0;">Smartious Homeschool &amp; eSchool &nbsp;·&nbsp; hellosmartious@gmail.com</p>
  </td></tr>
</table></td></tr></table></body></html>`

const p = t => `<p style="font-size:14.5px;line-height:1.7;color:#2c2c2c;margin:0 0 14px;">${t}</p>`

const fmtTime = d => d.toLocaleString('en-GB',
  { weekday:'long', hour:'2-digit', minute:'2-digit', timeZone:'UTC' })

function studentWarningEmail(student, hw, lessonAt) {
  return shell('linear-gradient(135deg,#8B1A2E,#6E1424)', 'Homework not yet submitted',
    `${hw.subject} — due before your next lesson`,
    p(`Dear ${student.firstName || 'there'},`) +
    p(`Your next <strong>${hw.subject}</strong> lesson starts in about ${WARN_HOURS} hours, on <strong>${fmtTime(lessonAt)}</strong>, and <strong>${hw.title || 'your homework'}</strong> has not been submitted yet.`) +
    p('Submitting now gives your teacher time to mark it and go through it with you in the lesson. Work submitted after the lesson has started cannot be discussed in that lesson.') +
    p('If something is stopping you from finishing it, reply to this email and tell your teacher before the lesson rather than after.'))
}

function teacherSubmittedEmail(teacherName, studentName, hw, lessonAt) {
  return shell('linear-gradient(135deg,#065F46,#044734)', 'Homework submitted',
    `${studentName} has submitted ${hw.subject}`,
    p(`Dear ${teacherName || 'colleague'},`) +
    p(`<strong>${studentName}</strong> has submitted <strong>${hw.title || 'their homework'}</strong>.`) +
    (lessonAt ? p(`Their next ${hw.subject} lesson is <strong>${fmtTime(lessonAt)}</strong>, so it needs marking, reviewing and releasing before then.`) : '') +
    p('Open the Marking Review screen to run the marking and approve the marks.'))
}

function teacherBacklogEmail(teacherName, rows, lessonAt, subject) {
  const list = rows.map(r =>
    `<li style="margin-bottom:6px;"><strong>${r.student}</strong> — ${r.state}</li>`).join('')
  return shell('linear-gradient(135deg,#8A6414,#6B4E10)', 'Marking still outstanding',
    `${subject} lesson in about ${WARN_HOURS} hours`,
    p(`Dear ${teacherName || 'colleague'},`) +
    p(`Your <strong>${subject}</strong> lesson starts on <strong>${fmtTime(lessonAt)}</strong>. The following submitted work has not yet reached the student:`) +
    `<ul style="font-size:14px;line-height:1.7;color:#2c2c2c;margin:0 0 16px;padding-left:20px;">${list}</ul>` +
    p('Marks that are not released before the lesson cannot be discussed in it, which is the point of the deadline.'))
}

/* ── THE THREE CHECKS ─────────────────────────────────────── */

/**
 * Warn students whose next lesson is within the warning window and who
 * have not submitted. Also warns their parents, since the parent is
 * usually the person who can act on it.
 */
async function warnUnsubmitted(now, t, summary) {
  const from = nowEAT(now)
  const cutoff = new Date(from.getTime() + WARN_HOURS * 3600 * 1000)

  const homeworks = await Homework.find({
    status: 'published', isActive: { $ne: false },
  }).select('title subject assignedStudents createdBy').lean()

  for (const hw of homeworks) {
    for (const studentId of (hw.assignedStudents || [])) {
      const sub = await HomeworkSubmission.findOne({ homework: hw._id, student: studentId })
      if (sub && sub.status !== 'in_progress') continue          // already submitted

      const next = await nextLessonFor(studentId, hw.subject, from)
      if (!next || next.at > cutoff) continue                    // not due yet

      // Once per homework per lesson.
      const key = `${hw._id}:${next.at.toISOString()}`
      const existing = sub || new HomeworkSubmission({
        homework: hw._id, student: studentId, answers: [], status: 'in_progress',
      })
      if (existing.lastWarningKey === key) continue

      const student = await User.findById(studentId).select('firstName lastName email onBreak parentEmail parentId linkedParents').lean()
      if (!student || student.onBreak) continue

      const r = await resolveStudentRecipients(student, { includeStudent: true })
      if (!r.to.length) { summary.noEmail++; continue }

      try {
        await t.sendMail({
          from: FROM(), to: r.to.join(', '),
          subject: `Homework due before your next ${hw.subject} lesson`,
          html: studentWarningEmail(student, hw, next.at),
        })
        existing.lastWarningKey = key
        existing.lastWarningAt = new Date()
        await existing.save()
        summary.studentWarned++
      } catch (e) {
        summary.failed++
        console.error('[homework-cycle] student warning failed:', e.message)
      }
    }
  }
}

/**
 * Tell the teacher when work arrives, so marking can start before the
 * backlog warning is ever needed.
 */
async function notifyNewSubmissions(now, t, summary) {
  const subs = await HomeworkSubmission.find({
    status: 'submitted', teacherNotifiedAt: null,
  }).populate('student', 'firstName lastName').limit(200)

  for (const sub of subs) {
    const hw = await Homework.findById(sub.homework).select('title subject createdBy').lean()
    if (!hw) continue
    const teacher = await User.findById(hw.createdBy).select('firstName email').lean()
    if (!teacher?.email) { summary.noEmail++; continue }

    const studentName = sub.student
      ? `${sub.student.firstName || ''} ${sub.student.lastName || ''}`.trim() : 'A student'
    const next = sub.student ? await nextLessonFor(sub.student._id, hw.subject, nowEAT(now)) : null

    try {
      await t.sendMail({
        from: FROM(), to: teacher.email,
        subject: `${studentName} submitted ${hw.subject}`,
        html: teacherSubmittedEmail(teacher.firstName, studentName, hw, next?.at),
      })
      sub.teacherNotifiedAt = new Date()
      await sub.save()
      summary.teacherNotified++
    } catch (e) {
      summary.failed++
      console.error('[homework-cycle] submission notice failed:', e.message)
    }
  }
}

/**
 * Warn the teacher about submitted work that is still unmarked, or
 * marked but never released, with the lesson approaching.
 */
async function warnUnreleased(now, t, summary) {
  const from = nowEAT(now)
  const cutoff = new Date(from.getTime() + WARN_HOURS * 3600 * 1000)

  const subs = await HomeworkSubmission.find({
    status: { $in: ['submitted', 'graded'] },
  }).populate('student', 'firstName lastName').limit(500)

  // Group by teacher + subject + lesson, so one email covers a class.
  const groups = new Map()
  for (const sub of subs) {
    if (!sub.student) continue
    const hw = await Homework.findById(sub.homework).select('title subject createdBy').lean()
    if (!hw) continue

    const next = await nextLessonFor(sub.student._id, hw.subject, from)
    if (!next || next.at > cutoff) continue

    const key = `${hw.createdBy}:${hw.subject}:${next.at.toISOString()}`
    if (sub.lastBacklogKey === key) continue

    if (!groups.has(key)) groups.set(key, { teacherId: hw.createdBy, subject: hw.subject, at: next.at, rows: [], subs: [] })
    groups.get(key).rows.push({
      student: `${sub.student.firstName || ''} ${sub.student.lastName || ''}`.trim(),
      state: sub.status === 'submitted' ? 'submitted, not yet marked' : 'marked, not yet released',
    })
    groups.get(key).subs.push(sub)
  }

  for (const [key, g] of groups) {
    const teacher = await User.findById(g.teacherId).select('firstName email').lean()
    if (!teacher?.email) { summary.noEmail++; continue }
    try {
      await t.sendMail({
        from: FROM(), to: teacher.email,
        subject: `${g.rows.length} ${g.subject} submission${g.rows.length === 1 ? '' : 's'} not released before your lesson`,
        html: teacherBacklogEmail(teacher.firstName, g.rows, g.at, g.subject),
      })
      for (const s of g.subs) { s.lastBacklogKey = key; await s.save() }
      summary.teacherWarned++
    } catch (e) {
      summary.failed++
      console.error('[homework-cycle] backlog warning failed:', e.message)
    }
  }
}

/** One pass over all three checks. Safe to run repeatedly. */
async function runHomeworkCycle(now = new Date()) {
  const summary = { studentWarned: 0, teacherNotified: 0, teacherWarned: 0, noEmail: 0, failed: 0 }
  const t = getTransporter()
  if (!t) { console.warn('[homework-cycle] email not configured — skipped'); return summary }

  try { await notifyNewSubmissions(now, t, summary) } catch (e) { console.error('[homework-cycle] notify:', e.message) }
  try { await warnUnsubmitted(now, t, summary) }     catch (e) { console.error('[homework-cycle] unsubmitted:', e.message) }
  try { await warnUnreleased(now, t, summary) }      catch (e) { console.error('[homework-cycle] unreleased:', e.message) }

  console.log(`[homework-cycle] students warned=${summary.studentWarned} ` +
              `teachers notified=${summary.teacherNotified} backlog warnings=${summary.teacherWarned} ` +
              `no email=${summary.noEmail} failed=${summary.failed}`)
  return summary
}

let timer = null
function startHomeworkCycle() {
  if (String(process.env.HOMEWORK_CYCLE_ENABLED || 'true').toLowerCase() === 'false') {
    console.log('[homework-cycle] disabled by HOMEWORK_CYCLE_ENABLED=false')
    return
  }
  if (timer) return
  const everyMin = Math.max(5, Number(process.env.HOMEWORK_CYCLE_MINUTES || 15))
  console.log(`[homework-cycle] started — every ${everyMin} min, warning ${WARN_HOURS}h before each lesson`)
  setTimeout(() => {
    runHomeworkCycle()
    timer = setInterval(runHomeworkCycle, everyMin * 60 * 1000)
  }, 90 * 1000)   // let the database settle after boot
}

module.exports = { runHomeworkCycle, startHomeworkCycle, nextLessonFor, nextOccurrence, nowEAT }
