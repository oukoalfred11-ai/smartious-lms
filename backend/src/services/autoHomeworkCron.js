/**
 * services/autoHomeworkCron.js
 * ============================================================
 * When a live class's scheduled end time passes, automatically:
 *   1. Pull the question pool for that lesson from the Question bank
 *      (queried LIVE, so questions added manually later are included)
 *   2. Give EACH student a DIFFERENT 15-question selection from the pool
 *   3. Create one Homework doc per student (the Homework model snapshots
 *      questions, so per-student variation needs one doc per student)
 *   4. Email the student and their parent
 *
 * Runs every minute. Idempotent: a class is only processed once,
 * guarded by liveClass.autoHomeworkGeneratedAt.
 */
const cron       = require('node-cron')
const crypto     = require('crypto')
const nodemailer = require('nodemailer')

const LiveClass = require('../models/LiveClass')
const Homework  = require('../models/Homework')
const Question  = require('../models/Question')
const User      = require('../models/User')

const QUESTIONS_PER_HOMEWORK = 15
const DUE_AFTER_HOURS        = 48

function getTransporter() {
  const u = process.env.EMAIL_USER, p = process.env.EMAIL_PASSWORD
  if (!u || !p) return null
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false, auth: { user: u, pass: p },
  })
}

// ── Deterministic per-student shuffle ───────────────
// Same student + same lesson always yields the same set (so a
// refresh doesn't change their homework), but different students
// get different sets from the same pool.
function seededOrder(items, seedStr) {
  const scored = items.map((item, i) => {
    const h = crypto.createHash('sha256').update(seedStr + '::' + (item._id || i)).digest()
    return { item, rank: h.readUInt32BE(0) }
  })
  scored.sort((a, b) => a.rank - b.rank)
  return scored.map(s => s.item)
}

function pickForStudent(pool, studentId, lessonKey, n) {
  if (pool.length <= n) return pool.slice()
  return seededOrder(pool, String(studentId) + '|' + lessonKey).slice(0, n)
}

// ── Build the question pool for a live class ────────
// Narrowest-first, widening until we have enough.
async function poolForClass(lc) {
  const base = { isActive: { $ne: false }, type: 'mcq' }
  if (lc.subject)    base.subject    = new RegExp('^' + escapeRe(lc.subject) + '$', 'i')
  if (lc.curriculum) base.curriculum = lc.curriculum

  const tiers = []
  if (lc.syllabusSubtopicName) tiers.push({ ...base, subtopic: new RegExp('^' + escapeRe(lc.syllabusSubtopicName) + '$', 'i') })
  if (lc.syllabusTopicName)    tiers.push({ ...base, topic:    new RegExp('^' + escapeRe(lc.syllabusTopicName) + '$', 'i') })
  if (lc.grade)                tiers.push({ ...base, grade: lc.grade })
  tiers.push(base)

  for (const filter of tiers) {
    const found = await Question.find(filter)
      .select('_id type questionText options correctAnswer explanation marks difficulty topic subtopic')
      .lean()
    if (found.length >= QUESTIONS_PER_HOMEWORK) return { pool: found, filter }
    if (found.length > 0 && filter === tiers[tiers.length - 1]) return { pool: found, filter }
  }
  return { pool: [], filter: null }
}

function escapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

function snapshot(q) {
  return {
    questionId:    q._id,
    type:          q.type || 'mcq',
    questionText:  q.questionText,
    options:       q.options || [],
    correctAnswer: q.correctAnswer,
    explanation:   q.explanation || '',
    marks:         q.marks || 1,
    difficulty:    q.difficulty || 'medium',
    topic:         q.subtopic || q.topic || '',
  }
}

// ── Main worker ─────────────────────────────────────
async function processEndedClasses() {
  const now = new Date()

  // Classes whose scheduled end time has passed and that haven't
  // had homework generated yet. Look back 6h so a brief outage
  // doesn't permanently skip classes.
  const lookback = new Date(now.getTime() - 6 * 60 * 60 * 1000)

  const candidates = await LiveClass.find({
    status: { $in: ['scheduled', 'live', 'ended'] },
    scheduledAt: { $gte: lookback, $lte: now },
    autoHomeworkGeneratedAt: { $in: [null, undefined] },
    autoHomeworkEnabled: { $ne: false },
  }).lean()

  for (const lc of candidates) {
    const endsAt = new Date(new Date(lc.scheduledAt).getTime() + (lc.durationMins || 60) * 60000)
    if (endsAt > now) continue                    // not finished yet
    if (!lc.assignedStudents?.length) {
      await LiveClass.updateOne({ _id: lc._id },
        { $set: { autoHomeworkGeneratedAt: now, autoHomeworkNote: 'No students assigned.' } })
      continue
    }

    try {
      const { pool } = await poolForClass(lc)
      if (!pool.length) {
        await LiveClass.updateOne({ _id: lc._id }, { $set: {
          autoHomeworkGeneratedAt: now,
          autoHomeworkNote: `No questions found for ${lc.subject}${lc.syllabusSubtopicName ? ' / ' + lc.syllabusSubtopicName : ''}.`,
        }})
        console.log(`[autoHomework] ${lc.title}: no questions in bank — skipped`)
        continue
      }

      const lessonKey = lc.syllabusSubtopicName || lc.syllabusTopicName || lc.subject
      const dueAt     = new Date(now.getTime() + DUE_AFTER_HOURS * 3600 * 1000)
      let made = 0, mailed = 0

      for (const studentId of lc.assignedStudents) {
        const picked = pickForStudent(pool, studentId, lessonKey, QUESTIONS_PER_HOMEWORK)
        const qs     = picked.map(snapshot)

        const hw = await Homework.create({
          title:       `${lc.subject}: ${lessonKey}`,
          description: `Auto-assigned after your live class "${lc.title}". ${qs.length} questions. Due in ${DUE_AFTER_HOURS} hours.`,
          curriculum:  lc.curriculum,
          subject:     lc.subject,
          grade:       lc.grade,
          questions:   qs,
          assignedStudents: [studentId],
          releaseAt:   now,
          dueAt,
          createdBy:   lc.teacherId,
          status:      'published',
          totalMarks:  qs.reduce((s, q) => s + (q.marks || 1), 0),
          questionCount: qs.length,
          isActive:    true,
          sourceLiveClass: lc._id,
          isAutoGenerated: true,
        })
        made++
        if (await notifyStudent(studentId, hw, lc, lessonKey)) mailed++
      }

      await LiveClass.updateOne({ _id: lc._id }, { $set: {
        autoHomeworkGeneratedAt: now,
        autoHomeworkNote: `${made} homework sets from a pool of ${pool.length} questions; ${mailed} emailed.`,
      }})
      console.log(`[autoHomework] ${lc.title}: ${made} sets (pool ${pool.length}), ${mailed} emails`)
    } catch (e) {
      console.error('[autoHomework]', lc.title, e.message)
    }
  }
}

// ── Email ───────────────────────────────────────────
async function notifyStudent(studentId, hw, lc, lessonKey) {
  const t = getTransporter()
  if (!t) return false
  try {
    const student = await User.findById(studentId)
      .select('firstName lastName email parentEmail linkedParents').lean()
    if (!student) return false

    const to = new Set()
    if (student.email) to.add(student.email)
    if (student.parentEmail) to.add(student.parentEmail)
    if (student.linkedParents?.length) {
      const ps = await User.find({ _id: { $in: student.linkedParents } }).select('email').lean()
      ps.forEach(p => p.email && to.add(p.email))
    }
    if (!to.size) return false

    const due = new Date(hw.dueAt).toLocaleString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    })

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;background:#FDFAF4;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E8E2D6;">
<tr><td style="background:linear-gradient(135deg,#7D1025,#5A0B1B);padding:24px 32px;">
  <div style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:8px">Smartious Homeschool · Homework</div>
  <div style="font-size:20px;font-weight:800;color:#fff;">New homework has been set</div>
  <div style="font-size:13px;color:rgba(255,255,255,.65);margin-top:4px;">${lc.subject} · ${lessonKey}</div>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="font-size:14px;color:#2c2c2c;margin:0 0 20px;line-height:1.7;">
    Hi ${student.firstName}, your live class <strong>${lc.title}</strong> has ended and your homework is now ready.
  </p>
  <table width="100%" style="background:#FDFAF4;border-radius:8px;border:1px solid #E8E2D6;margin-bottom:20px;"><tr><td style="padding:16px 20px;">
    <table width="100%">
      <tr><td style="font-size:12px;color:#6B6B6B;font-weight:700;text-transform:uppercase;padding-bottom:6px">Questions</td><td style="font-size:14px;font-weight:800;color:#7D1025;text-align:right;padding-bottom:6px">${hw.questionCount}</td></tr>
      <tr><td style="font-size:12px;color:#6B6B6B;font-weight:700;text-transform:uppercase;padding-bottom:6px">Total marks</td><td style="font-size:14px;font-weight:700;color:#1A1A1A;text-align:right;padding-bottom:6px">${hw.totalMarks}</td></tr>
      <tr><td style="font-size:12px;color:#6B6B6B;font-weight:700;text-transform:uppercase;">Due</td><td style="font-size:13px;font-weight:700;color:#1A1A1A;text-align:right;">${due}</td></tr>
    </table>
  </td></tr></table>
  <p style="font-size:13px;color:#564844;line-height:1.7;margin:0 0 20px;">
    Your question set is unique to you, so compare your working with classmates rather than your answers.
  </p>
  <a href="https://smartioushomeschool.com/student" style="display:block;background:#7D1025;color:#fff;text-align:center;padding:13px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Open my homework →</a>
</td></tr>
<tr><td style="background:#FDFAF4;padding:14px 32px;border-top:1px solid #E8E2D6;">
  <p style="font-size:11px;color:#999;margin:0;">© ${new Date().getFullYear()} Smartious Homeschool Global · hellosmartious@gmail.com · +254 745 021 212</p>
</td></tr></table></td></tr></table></body></html>`

    for (const email of to) {
      await t.sendMail({
        from: process.env.EMAIL_FROM || 'Smartious <hellosmartious@gmail.com>',
        to: email,
        subject: `Homework set — ${lc.subject}: ${lessonKey} · Smartious`,
        html,
      })
    }
    return true
  } catch (e) {
    console.error('[autoHomework email]', e.message)
    return false
  }
}

// ── Scheduler ───────────────────────────────────────
function startAutoHomeworkCron() {
  cron.schedule('* * * * *', () => {
    processEndedClasses().catch(e => console.error('[autoHomework cron]', e.message))
  }, { timezone: 'Africa/Nairobi' })
  console.log('[autoHomework] cron started — checks every minute (Africa/Nairobi)')
}

// index.js calls: require('./services/autoHomeworkCron').start()
module.exports = {
  start: startAutoHomeworkCron,
  startAutoHomeworkCron,
  processEndedClasses,
  pickForStudent,
  poolForClass,
}
