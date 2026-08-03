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
const crypto     = require('crypto')
const nodemailer = require('nodemailer')

const LiveClass = require('../models/LiveClass')
const Homework  = require('../models/Homework')
const Question  = require('../models/Question')
const User      = require('../models/User')

const QUESTIONS_PER_HOMEWORK = 15
const DUE_AFTER_HOURS        = 48
const REVIEW_QUESTIONS       = 3   // max harder questions from earlier lessons
const LOOKBACK_HOURS         = 72

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
// ── Build a student's question set ──────────────────
// Uses $sample so MongoDB draws the random subset server-side.
// Never loads the whole pool into memory: safe at millions of rows.
//
//   - CURRENT lesson : (n - review) questions, any difficulty
//   - PRIOR lessons  : up to REVIEW_QUESTIONS harder questions,
//                      for spaced retrieval practice
//
// Because each student is sampled independently, two students in the
// same class get different papers without needing a large local pool.
const PROJECTION = {
  questionText:1, options:1, correctAnswer:1, explanation:1,
  marks:1, difficulty:1, topic:1, subtopic:1, type:1,
}

async function sample(match, size) {
  if (size <= 0) return []
  return Question.aggregate([
    { $match: match },
    { $sample: { size } },
    { $project: PROJECTION },
  ]).allowDiskUse(false)
}

// Lesson names that come BEFORE this class's lesson on the spine.
async function priorLessonNames(lc) {
  if (!lc.syllabusSubtopicName) return []
  try {
    const Subject       = require('../models/Subject')
    const SyllabusTopic = require('../models/SyllabusTopic')
    const subj = await Subject.findOne({
      subjectName: new RegExp('^' + escapeRe(lc.subject) + '$', 'i'),
      curriculum:  lc.curriculum,
    }).select('_id').lean()
    if (!subj) return []

    const topics = await SyllabusTopic.find({ subjectId: subj._id })
      .sort({ topicOrder: 1 }).select('subtopics.name subtopics.subOrder').lean()

    const ordered = []
    topics.forEach(t => (t.subtopics || []).forEach(st => ordered.push(st.name)))
    const idx = ordered.findIndex(n =>
      String(n).toLowerCase() === String(lc.syllabusSubtopicName).toLowerCase())
    return idx > 0 ? ordered.slice(0, idx) : []
  } catch (e) {
    console.error('[autoHomework priorLessons]', e.message)
    return []
  }
}

async function buildPaper(lc, priorNames, total) {
  const base = { isActive: { $ne: false } }
  if (lc.subject)    base.subject    = new RegExp('^' + escapeRe(lc.subject) + '$', 'i')
  if (lc.curriculum) base.curriculum = lc.curriculum

  // ── Review questions from earlier lessons (harder only) ──
  let review = []
  if (priorNames.length) {
    review = await sample({
      ...base,
      subtopic:   { $in: priorNames.map(n => new RegExp('^' + escapeRe(n) + '$', 'i')) },
      difficulty: { $in: ['medium', 'hard'] },
    }, REVIEW_QUESTIONS)
  }
  review.forEach(q => { q.isReview = true })

  // ── Current lesson, narrowest filter that yields enough ──
  const want = total - review.length
  const tiers = []
  if (lc.syllabusSubtopicName)
    tiers.push({ ...base, subtopic: new RegExp('^' + escapeRe(lc.syllabusSubtopicName) + '$', 'i') })
  if (lc.syllabusTopicName)
    tiers.push({ ...base, topic: new RegExp('^' + escapeRe(lc.syllabusTopicName) + '$', 'i') })
  if (lc.grade) tiers.push({ ...base, grade: lc.grade })
  tiers.push(base)

  let main = []
  for (const t of tiers) {
    main = await sample(t, want)
    if (main.length >= want) break
  }

  // Drop any review question that also came up in the main set
  const seen = new Set(main.map(q => String(q._id)))
  review = review.filter(q => !seen.has(String(q._id)))

  return { paper: [...main, ...review], mainCount: main.length, reviewCount: review.length }
}

// Kept for the diagnostics endpoint: how big is the addressable pool?
async function poolForClass(lc) {
  const base = { isActive: { $ne: false } }
  if (lc.subject)    base.subject    = new RegExp('^' + escapeRe(lc.subject) + '$', 'i')
  if (lc.curriculum) base.curriculum = lc.curriculum
  const filter = lc.syllabusSubtopicName
    ? { ...base, subtopic: new RegExp('^' + escapeRe(lc.syllabusSubtopicName) + '$', 'i') }
    : base
  const n = await Question.countDocuments(filter)
  return { pool: new Array(n > 0 ? n : 0), filter, count: n }
}

function escapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

function snapshot(q) {
  return {
    questionId:    q._id,
    type:          q.type || 'mcq',
    // Non-MCQ answers cannot be auto-marked — the teacher grades these.
    _needsManualGrading: (q.type && q.type !== 'mcq') || false,
    _isReview:     !!q.isReview,
    questionText:  q.questionText,
    options:       q.options || [],
    correctAnswer: q.correctAnswer,
    explanation:   q.explanation || '',
    marks:         q.marks || 1,
    difficulty:    q.difficulty || 'medium',
    topic:         q.subtopic || q.topic || '',
  }
}

// ── Auto-end: flip lapsed classes to 'ended' ────────
// A class no longer needs the teacher to close it manually.
async function autoEndLapsedClasses() {
  const now = new Date()
  const open = await LiveClass.find({
    status: { $in: ['scheduled', 'live'] },
    scheduledAt: { $gte: new Date(now.getTime() - LOOKBACK_HOURS * 3600 * 1000) },
  }).select('_id title scheduledAt durationMins status').lean()

  let ended = 0
  for (const lc of open) {
    const endsAt = new Date(new Date(lc.scheduledAt).getTime() + (lc.durationMins || 60) * 60000)
    if (endsAt <= now) {
      await LiveClass.updateOne({ _id: lc._id }, { $set: { status: 'ended', endedAt: endsAt } })
      ended++
      console.log(`[autoEnd] "${lc.title}" auto-ended (was ${lc.status}, due to end ${endsAt.toISOString()})`)
    }
  }
  return ended
}

// ── Main worker ─────────────────────────────────────
async function processEndedClasses(opts = {}) {
  const { classId = null, force = false } = opts
  const now = new Date()
  const report = { autoEnded: 0, checked: 0, generated: 0, emailed: 0, skipped: [] }

  try { report.autoEnded = await autoEndLapsedClasses() }
  catch (e) { console.error('[autoEnd]', e.message) }

  // Classes whose scheduled end time has passed and that haven't
  // had homework generated yet. Look back 6h so a brief outage
  // doesn't permanently skip classes.
  const lookback = new Date(now.getTime() - LOOKBACK_HOURS * 60 * 60 * 1000)

  const candidates = await LiveClass.find({
    autoHomeworkGeneratedAt: { $in: [null, undefined] },
    autoHomeworkEnabled: { $ne: false },
    scheduledAt: { $gte: lookback },
    $or: [
      // Teacher flipped it to ended — honour that even if the
      // scheduled end time is still in the future.
      { status: 'ended' },
      // Otherwise wait for the scheduled end time to pass.
      { status: { $in: ['scheduled', 'live'] }, scheduledAt: { $lte: now } },
    ],
  }).lean()

  // Targeted re-run: ignore the processed stamp and the time window.
  let list = candidates
  if (classId) {
    const one = await LiveClass.findById(classId).lean()
    list = one ? [one] : []
  } else if (force) {
    const all = await LiveClass.find({ scheduledAt: { $gte: lookback } }).lean()
    list = all
  }

  report.checked = list.length
  console.log(`[autoHomework] sweep: ${report.autoEnded} auto-ended, ${list.length} class(es) to consider`)

  for (const lc of list) {
    const endsAt = new Date(new Date(lc.scheduledAt).getTime() + (lc.durationMins || 60) * 60000)
    const finished = lc.status === 'ended' || endsAt <= now
    if (!finished) { report.skipped.push({ title: lc.title, why: 'not finished yet, ends ' + endsAt.toISOString() }); continue }
    if (!lc.assignedStudents?.length) {
      report.skipped.push({ title: lc.title, why: 'no students assigned' })
      console.log(`[autoHomework] ${lc.title}: no students assigned — skipped`)
      await LiveClass.updateOne({ _id: lc._id },
        { $set: { autoHomeworkGeneratedAt: now, autoHomeworkNote: 'No students assigned.' } })
      continue
    }

    if (lc.autoHomeworkGeneratedAt && !force && !classId) {
      report.skipped.push({ title: lc.title, why: 'already processed at ' + lc.autoHomeworkGeneratedAt })
      continue
    }

    // Belt-and-braces: if homework already exists for this class, skip.
    // This works even if LiveClass.autoHomeworkGeneratedAt was never
    // persisted (e.g. the updated model was not deployed and Mongoose
    // strict mode silently dropped the $set).
    if (!force && !classId) {
      const already = await Homework.countDocuments({ sourceLiveClass: lc._id })
      if (already > 0) {
        report.skipped.push({ title: lc.title, why: `${already} homework already exists for this class` })
        continue
      }
      // Fallback when sourceLiveClass is not in the deployed schema:
      // match on the exact auto-generated title + this class's students.
      const lessonKeyProbe = lc.syllabusSubtopicName || lc.syllabusTopicName || lc.subject
      const dupe = await Homework.countDocuments({
        title: `${lc.subject}: ${lessonKeyProbe}`,
        assignedStudents: { $in: lc.assignedStudents },
        createdAt: { $gte: new Date(Date.now() - 14 * 24 * 3600 * 1000) },
      })
      if (dupe > 0) {
        report.skipped.push({ title: lc.title, why: `${dupe} matching homework already issued in the last 14 days` })
        await LiveClass.updateOne({ _id: lc._id },
          { $set: { autoHomeworkGeneratedAt: now, autoHomeworkNote: 'Duplicate guard: homework already existed.' } })
        continue
      }
    }

    try {
      const { pool } = await poolForClass(lc)
      if (!pool.length) {
        await LiveClass.updateOne({ _id: lc._id }, { $set: {
          autoHomeworkGeneratedAt: now,
          autoHomeworkNote: `No questions found for ${lc.subject}${lc.syllabusSubtopicName ? ' / ' + lc.syllabusSubtopicName : ''}.`,
        }})
        report.skipped.push({ title: lc.title, why: `no questions matched subject="${lc.subject}" curriculum="${lc.curriculum}" lesson="${lc.syllabusSubtopicName||'(none)'}"` })
        console.log(`[autoHomework] ${lc.title}: no questions in bank — skipped`)
        continue
      }

      const lessonKey  = lc.syllabusSubtopicName || lc.syllabusTopicName || lc.subject
      const dueAt      = new Date(now.getTime() + DUE_AFTER_HOURS * 3600 * 1000)
      const priorNames = await priorLessonNames(lc)
      let made = 0, mailed = 0, reviewTotal = 0

      // Pause awareness: access-blocked students (e.g. fee hold) get no
      // homework generated — it would fall due while they cannot access
      // the portal. Soft-paused students (holiday/break) DO get homework
      // so they can study at their own pace, but no notification email.
      const pauseFlags = {}
      const flagDocs = await User.find({ _id: { $in: lc.assignedStudents } })
        .select('onBreak breakBlocksAccess').lean()
      flagDocs.forEach(d => { pauseFlags[String(d._id)] = d })

      for (const studentId of lc.assignedStudents) {
        const pf = pauseFlags[String(studentId)] || {}
        if (pf.onBreak && pf.breakBlocksAccess) continue // no homework while access is blocked
        // Sampled per student, server-side — two students in the same
        // class receive different papers without a large local pool.
        const { paper, reviewCount } = await buildPaper(lc, priorNames, QUESTIONS_PER_HOMEWORK)
        if (!paper.length) continue
        reviewTotal += reviewCount
        const qs = paper.map(snapshot)

        const hw = await Homework.create({
          title:       `${lc.subject}: ${lessonKey}`,
          description: `Auto-assigned after your live class "${lc.title}". `
            + `${qs.length} questions`
            + (reviewCount ? ` (${qs.length - reviewCount} on this lesson, ${reviewCount} review from earlier lessons)` : '')
            + `. Due in ${DUE_AFTER_HOURS} hours. Your teacher will mark and release your score.`,
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
          requiresTeacherGrading: true,
        })
        made++
        if (!pf.onBreak && await notifyStudent(studentId, hw, lc, lessonKey)) mailed++
      }

      await LiveClass.updateOne({ _id: lc._id }, { $set: {
        autoHomeworkGeneratedAt: now,
        autoHomeworkNote: `${made} homework sets from a pool of ${pool.length} questions; ${mailed} emailed.`,
      }})

      // Read back — if the field did not persist, the updated LiveClass
      // model is not deployed and this class would regenerate every 60s.
      const check = await LiveClass.findById(lc._id).select('autoHomeworkGeneratedAt').lean()
      if (!check?.autoHomeworkGeneratedAt) {
        console.error('[autoHomework] *** CRITICAL: autoHomeworkGeneratedAt did NOT persist for "' +
          lc.title + '". Deploy backend/src/models/LiveClass.js or homework will be regenerated every minute. ***')
        report.skipped.push({ title: lc.title, why: 'STAMP FAILED — deploy the updated LiveClass.js model' })
      }
      report.generated += made
      if (!mailed) console.warn(`[autoHomework] ${lc.title}: ${made} sets created but 0 emails sent — check EMAIL_USER / EMAIL_PASSWORD on Render`)
      report.emailed   += mailed
      console.log(`[autoHomework] ${lc.title}: ${made} sets (${reviewTotal} review qns total, addressable pool ${pool.length}), ${mailed} emails`)
    } catch (e) {
      report.skipped.push({ title: lc.title, why: 'error: ' + e.message })
      console.error('[autoHomework]', lc.title, e.message)
    }
  }
  return report
}

// ── Email ───────────────────────────────────────────
// ── Shared email chrome ─────────────────────────────
function shell({ eyebrow, heading, sub, body }) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;background:#FDFAF4;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E8E2D6;">
<tr><td style="background:linear-gradient(135deg,#7D1025,#5A0B1B);padding:24px 32px;">
  <div style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:8px">${eyebrow}</div>
  <div style="font-size:20px;font-weight:800;color:#fff;">${heading}</div>
  <div style="font-size:13px;color:rgba(255,255,255,.65);margin-top:4px;">${sub}</div>
</td></tr>
<tr><td style="padding:28px 32px;">${body}</td></tr>
<tr><td style="background:#FDFAF4;padding:14px 32px;border-top:1px solid #E8E2D6;">
  <p style="font-size:11px;color:#999;margin:0;">&copy; ${new Date().getFullYear()} Smartious Homeschool Global &middot; hellosmartious@gmail.com &middot; +254 745 021 212</p>
</td></tr></table></td></tr></table></body></html>`
}

function factsTable(rows) {
  return `<table width="100%" style="background:#FDFAF4;border-radius:8px;border:1px solid #E8E2D6;margin-bottom:20px;"><tr><td style="padding:16px 20px;">
    <table width="100%">${rows.map(([k,v,bold]) => `
      <tr><td style="font-size:12px;color:#6B6B6B;font-weight:700;text-transform:uppercase;padding-bottom:6px">${k}</td>
          <td style="font-size:${bold?14:13}px;font-weight:${bold?800:700};color:${bold?'#7D1025':'#1A1A1A'};text-align:right;padding-bottom:6px">${v}</td></tr>`).join('')}
    </table></td></tr></table>`
}

function cta(href, label) {
  return `<a href="${href}" style="display:block;background:#7D1025;color:#fff;text-align:center;padding:13px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">${label}</a>`
}

// ── Notify: separate templates for student and parent ──
async function notifyStudent(studentId, hw, lc, lessonKey) {
  const t = getTransporter()
  if (!t) return false
  try {
    const student = await User.findById(studentId)
      .select('firstName lastName email parentEmail parentName linkedParents').lean()
    if (!student) return false

    const due = new Date(hw.dueAt).toLocaleString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    })
    const facts = [
      ['Subject', lc.subject],
      ['Lesson', lessonKey],
      ['Questions', String(hw.questionCount), true],
      ['Total marks', String(hw.totalMarks)],
      ['Due', due],
    ]

    // Collect parent addresses
    const parentEmails = new Set()
    if (student.parentEmail) parentEmails.add(student.parentEmail)
    if (student.linkedParents?.length) {
      const ps = await User.find({ _id: { $in: student.linkedParents } }).select('email').lean()
      ps.forEach(p => p.email && parentEmails.add(p.email))
    }
    // Never send the student version to a parent address
    const studentEmail = student.email && !parentEmails.has(student.email) ? student.email : null

    const from = process.env.EMAIL_FROM || 'Smartious <hellosmartious@gmail.com>'
    let sent = 0

    // ── STUDENT ──
    if (studentEmail) {
      const html = shell({
        eyebrow: 'Smartious Homeschool &middot; Homework',
        heading: 'Your homework is ready',
        sub: `${lc.subject} &middot; ${lessonKey}`,
        body: `
          <p style="font-size:14px;color:#2c2c2c;margin:0 0 20px;line-height:1.7;">
            Hi ${student.firstName}, your live class <strong>${lc.title}</strong> has ended and your homework is now open.
          </p>
          ${factsTable(facts)}
          <p style="font-size:13px;color:#564844;line-height:1.7;margin:0 0 20px;">
            Your question set is unique to you, so compare your working with classmates rather than your answers.
          </p>
          ${cta('https://smartioushomeschool.com/student', 'Start my homework &rarr;')}`,
      })
      try {
        await t.sendMail({ from, to: studentEmail,
          subject: `Homework ready — ${lc.subject}: ${lessonKey}`, html })
        sent++
      } catch (e) { console.error('[autoHomework email/student]', e.message) }
    }

    // ── PARENT ──
    const childName = `${student.firstName} ${student.lastName}`.trim()
    if (parentEmails.size) {
      const html = shell({
        eyebrow: 'Smartious Homeschool &middot; Parent Update',
        heading: 'Homework set for ' + student.firstName,
        sub: `${lc.subject} &middot; ${lessonKey}`,
        body: `
          <p style="font-size:14px;color:#2c2c2c;margin:0 0 20px;line-height:1.7;">
            Dear ${student.parentName || 'Parent'}, following today's live class
            <strong>${lc.title}</strong>, homework has been set for <strong>${childName}</strong>.
          </p>
          ${factsTable(facts)}
          <div style="background:#F9F2F3;border-radius:8px;padding:14px 18px;margin-bottom:20px;border-left:3px solid #7D1025;">
            <p style="font-size:12px;font-weight:700;color:#7D1025;text-transform:uppercase;letter-spacing:.06em;margin:0 0 6px">How you can help</p>
            <p style="font-size:13px;color:#2c2c2c;margin:0;line-height:1.65;">
              Each learner receives a different selection of questions, so answers cannot be shared.
              A quiet 30 minutes before the deadline is usually enough. You can follow ${student.firstName}'s
              progress and marks in the parent portal once the work is submitted.
            </p>
          </div>
          ${cta('https://smartioushomeschool.com/parent', 'View in parent portal &rarr;')}`,
      })
      for (const email of parentEmails) {
        try {
          await t.sendMail({ from, to: email,
            subject: `Homework set for ${student.firstName} — ${lc.subject} &middot; due ${due}`, html })
          sent++
        } catch (e) { console.error('[autoHomework email/parent]', email, e.message) }
      }
    }

    return sent > 0
  } catch (e) {
    console.error('[autoHomework email]', e.message)
    return false
  }
}

// ── Scheduler ───────────────────────────────────────
function startAutoHomeworkCron() {
  // setInterval, not node-cron — node-cron is not a dependency of this
  // backend and every other scheduled job here uses setInterval too.
  const tick = () => processEndedClasses()
    .catch(e => console.error('[autoHomework cron]', e.message))
  setTimeout(tick, 20 * 1000)          // first run shortly after boot
  setInterval(tick, 60 * 1000)         // then every minute
  const mail = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
  console.log('[autoHomework] ===================================')
  console.log('[autoHomework] scheduler STARTED — every 60s')
  console.log('[autoHomework] auto-end lapsed classes: ON')
  console.log('[autoHomework] questions per homework : ' + QUESTIONS_PER_HOMEWORK)
  console.log('[autoHomework] lookback window        : ' + LOOKBACK_HOURS + 'h')
  console.log('[autoHomework] email configured       : ' + (mail ? 'YES' : 'NO — emails will NOT send'))
  console.log('[autoHomework] ===================================')
}

// index.js calls: require('./services/autoHomeworkCron').start()
module.exports = {
  start: startAutoHomeworkCron,
  startAutoHomeworkCron,
  processEndedClasses,
  autoEndLapsedClasses,
  pickForStudent,
  poolForClass,
  buildPaper,
  priorLessonNames,
}
