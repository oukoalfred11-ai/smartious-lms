/**
 * routes/question-bank.js
 * Mounted at /api/questions
 *
 * ROUTE ORDER MATTERS: every named route is declared BEFORE the
 * /:id parameterised routes, otherwise Express captures names like
 * "selftest" as an :id.
 */
const crypto   = require('crypto')
const express  = require('express')
const router   = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const Question = require('../models/Question')

const ok   = (res,data,msg) => res.json({ success:true, data, message:msg||'' })
const fail = (res,code,msg) => res.status(code).json({ success:false, message:msg })

// ── GET /api/questions ──────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const { subject, topic, curriculum, difficulty, grade, type, search, page=1, limit=50 } = req.query
    const filter = {}
    if (subject)    filter.subject    = new RegExp(subject,'i')
    if (topic)      filter.topic      = new RegExp(topic,'i')
    if (curriculum) filter.curriculum = curriculum
    if (difficulty) filter.difficulty = difficulty
    if (grade)      filter.grade      = grade
    if (type)       filter.type       = type
    if (search)     filter.$or = [
      { questionText: new RegExp(search,'i') },
      { topic: new RegExp(search,'i') },
    ]
    const total = await Question.countDocuments(filter)
    const questions = await Question.find(filter)
      .sort({ subject:1, topic:1, difficulty:1 })
      .skip((parseInt(page)-1)*parseInt(limit))
      .limit(parseInt(limit))
      .lean()
    const payload = { questions, total, page: parseInt(page), pages: Math.ceil(total/parseInt(limit)) }
    // Dual shape: nested for the Question Bank UI, top-level for
    // older callers that expect routes/questions.js's format.
    return res.json({ success: true, ...payload, limit: parseInt(limit), data: payload })
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /api/questions/topics ───────────────────────
router.get('/topics', auth, async (req, res) => {
  try {
    const { subject, curriculum } = req.query
    const filter = {}
    if (subject)    filter.subject    = new RegExp(subject,'i')
    if (curriculum) filter.curriculum = curriculum
    const topics = await Question.distinct('topic', filter)
    return ok(res, { topics: topics.filter(Boolean).sort() })
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /api/questions/spine ────────────────────────
// Spine topics + subtopics for a subject name + curriculum.
// Used by the quiz launcher and the question editor so questions
// attach to the same spine that lessons and live classes use.
router.get('/spine', auth, async (req, res) => {
  try {
    const Subject       = require('../models/Subject')
    const SyllabusTopic = require('../models/SyllabusTopic')
    const { subject, curriculum } = req.query
    if (!subject) return ok(res, { topics: [] })
    const subjFilter = { subjectName: new RegExp('^'+subject.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$','i') }
    if (curriculum) subjFilter.curriculum = curriculum
    const subjectDoc = await Subject.findOne(subjFilter).lean()
    if (!subjectDoc) return ok(res, { topics: [] })
    const topics = await SyllabusTopic.find({ subjectId: subjectDoc._id, isActive: { $ne: false } })
      .sort({ topicOrder: 1 })
      .select('topic code subtopics.name subtopics.code')
      .lean()
    return ok(res, { subjectId: subjectDoc._id, topics })
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /api/questions/coverage ─────────────────────
// How many questions exist per spine lesson — shows the gaps.
router.get('/coverage', auth, async (req, res) => {
  try {
    const Subject       = require('../models/Subject')
    const SyllabusTopic = require('../models/SyllabusTopic')
    const { subject, curriculum } = req.query
    if (!subject || !curriculum) return fail(res, 400, 'subject and curriculum are required.')

    const subjectDoc = await Subject.findOne({
      subjectName: new RegExp('^'+String(subject).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$','i'),
      curriculum,
    }).lean()
    if (!subjectDoc) return ok(res, { lessons: [], totals:{ lessons:0, withQuestions:0, questions:0 } })

    const topics = await SyllabusTopic.find({ subjectId: subjectDoc._id }).sort({ topicOrder:1 }).lean()
    const counts = await Question.aggregate([
      { $match: { subject: subjectDoc.subjectName, curriculum, isActive: { $ne:false } } },
      { $group: { _id: '$subtopic', n: { $sum: 1 } } },
    ])
    const byName = {}
    counts.forEach(c => { if (c._id) byName[String(c._id).toLowerCase()] = c.n })

    const lessons = []
    topics.forEach(t => (t.subtopics||[]).forEach(st => {
      lessons.push({
        topic: t.topic, topicCode: t.code,
        lesson: st.name, lessonCode: st.code,
        questions: byName[String(st.name).toLowerCase()] || 0,
      })
    }))
    return ok(res, {
      lessons,
      totals: {
        lessons: lessons.length,
        withQuestions: lessons.filter(l=>l.questions>0).length,
        questions: lessons.reduce((s,l)=>s+l.questions,0),
      },
    })
  } catch(e) { return fail(res, 500, e.message) }
})

// ── GET /api/questions/preview-paper ────────────────
// Shows exactly what auto-homework WOULD generate for a lesson,
// without scheduling a class. Run it repeatedly to confirm the
// selection varies. Query: subject, curriculum, lesson, grade, n
router.get('/preview-paper', auth, requireRole('admin','ops_manager','dos','teacher'), async (req, res) => {
  try {
    const { buildPaper, priorLessonNames } = require('../services/autoHomeworkCron')
    const { subject, curriculum, lesson, topic, grade, n } = req.query
    if (!subject) return fail(res, 400, 'subject is required.')

    // Stand-in for a live class
    const fake = {
      subject, curriculum: curriculum || 'CambridgeIGCSE',
      grade: grade || '',
      syllabusSubtopicName: lesson || null,
      syllabusTopicName:    topic  || null,
    }
    const prior = await priorLessonNames(fake)
    const total = Math.max(1, Math.min(50, parseInt(n || '15', 10)))
    const { paper, mainCount, reviewCount } = await buildPaper(fake, prior, total)

    return ok(res, {
      requested: total,
      returned:  paper.length,
      fromThisLesson: mainCount,
      reviewFromEarlierLessons: reviewCount,
      earlierLessonsAvailable: prior.length,
      questions: paper.map(q => ({
        review:     !!q.isReview,
        difficulty: q.difficulty,
        lesson:     q.subtopic || q.topic || '',
        question:   q.questionText,
        answer:     q.correctAnswer,
      })),
    }, `${paper.length} question(s): ${mainCount} from this lesson, ${reviewCount} review. Re-run to see a different selection.`)
  } catch(e) { return fail(res, 500, e.message) }
})

// ── GET /api/questions/selftest ─────────────────────
// One call that checks EVERY precondition for auto-homework and
// says exactly which one is failing. No guessing.
router.get('/selftest', auth, requireRole('admin','ops_manager','dos'), async (req, res) => {
  const checks = []
  const add = (name, pass, detail) => checks.push({ name, pass, detail })

  try {
    // 1. Does the service module load at all?
    let svc = null
    try {
      svc = require('../services/autoHomeworkCron')
      add('Service module loads', true, 'backend/src/services/autoHomeworkCron.js found')
      add('Exports start()', typeof svc.start === 'function', typeof svc.start)
    } catch (e) {
      add('Service module loads', false, 'REQUIRE FAILED: ' + e.message + ' — file missing or a dependency is not installed')
    }

    // 2. Email config
    const mail = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
    add('Email configured', mail, mail ? 'EMAIL_USER + EMAIL_PASSWORD present' : 'MISSING — homework will generate but no email will send')

    // 3. Model fields deployed?
    const LiveClass = require('../models/LiveClass')
    const Homework  = require('../models/Homework')
    const lcPaths = Object.keys(LiveClass.schema.paths)
    const hwPaths = Object.keys(Homework.schema.paths)
    add('LiveClass.autoHomeworkGeneratedAt', lcPaths.includes('autoHomeworkGeneratedAt'),
        lcPaths.includes('autoHomeworkGeneratedAt') ? 'present' : 'MISSING — deploy the updated LiveClass.js model')
    add('Homework.sourceLiveClass', hwPaths.includes('sourceLiveClass'),
        hwPaths.includes('sourceLiveClass') ? 'present' : 'MISSING — deploy the updated Homework.js model')

    // 4. Questions in the bank
    const totalQ = await Question.countDocuments({ isActive: { $ne: false }, type: 'mcq' })
    add('MCQ questions exist', totalQ > 0, totalQ + ' active MCQ question(s) in the bank')

    // 5. Recent classes and whether each can produce homework
    const since = new Date(Date.now() - 7*24*3600*1000)
    const classes = await LiveClass.find({ scheduledAt: { $gte: since } })
      .sort({ scheduledAt: -1 }).limit(10).lean()
    add('Recent live classes', classes.length > 0, classes.length + ' class(es) in the last 7 days')

    const perClass = []
    for (const lc of classes) {
      const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const f = { isActive:{ $ne:false }, type:'mcq' }
      if (lc.subject)    f.subject    = new RegExp('^'+esc(lc.subject)+'$','i')
      if (lc.curriculum) f.curriculum = lc.curriculum
      const subjectPool = await Question.countDocuments(f)
      const lessonPool  = lc.syllabusSubtopicName
        ? await Question.countDocuments({ ...f, subtopic: new RegExp('^'+esc(lc.syllabusSubtopicName)+'$','i') })
        : null
      const hw = await Homework.countDocuments({ sourceLiveClass: lc._id })
      const endsAt = new Date(new Date(lc.scheduledAt).getTime() + (lc.durationMins||60)*60000)

      let blocker = null
      if (hw > 0) blocker = null
      else if (!lc.assignedStudents?.length) blocker = 'No students assigned to this class'
      else if (!subjectPool) blocker = `No questions match subject "${lc.subject}" + curriculum "${lc.curriculum}"`
      else if (lc.autoHomeworkGeneratedAt) blocker = `Already stamped as processed (${lc.autoHomeworkNote||'no note'}) — re-run with force:true`
      else if (lc.status !== 'ended' && endsAt > new Date()) blocker = 'Class has not ended yet'
      else blocker = 'Should generate on next sweep — check Render logs for [autoHomework]'

      perClass.push({
        _id: String(lc._id), title: lc.title, status: lc.status,
        subject: lc.subject, curriculum: lc.curriculum,
        lesson: lc.syllabusSubtopicName || '(none set)',
        students: lc.assignedStudents?.length || 0,
        questionsForSubject: subjectPool,
        questionsForLesson: lessonPool,
        homeworkCreated: hw,
        result: hw > 0 ? 'OK' : 'BLOCKED',
        blocker,
      })
    }

    const failed = checks.filter(c => !c.pass)
    return ok(res, { checks, classes: perClass },
      failed.length ? `${failed.length} check(s) FAILED: ` + failed.map(f=>f.name).join(', ')
                    : 'All system checks passed — see per-class blockers below.')
  } catch(e) {
    return fail(res, 500, e.message)
  }
})

// ── POST /api/questions/run-auto-homework ───────────
// Manually fire the auto-homework sweep and return a diagnostic
// report. Use this to test without waiting for the 60s tick.
router.post('/run-auto-homework', auth, requireRole('admin','ops_manager','dos'), async (req, res) => {
  try {
    const { processEndedClasses } = require('../services/autoHomeworkCron')
    // { classId } re-runs one class ignoring its processed stamp.
    // { force:true } re-sweeps every class in the lookback window.
    const report = await processEndedClasses({
      classId: req.body?.classId || null,
      force:   req.body?.force === true,
    })
    const msg = report.generated
      ? `Generated ${report.generated} homework sets from ${report.checked} class(es); ${report.emailed} emailed.`
      : `Checked ${report.checked} class(es); nothing generated.`
    return ok(res, report, msg)
  } catch(e) { return fail(res, 500, e.message) }
})

// ── GET /api/questions/homework-debug ───────────────
// Explains, per recent live class, exactly why homework was or
// was not generated — the fastest way to diagnose a silent no-op.
router.get('/homework-debug', auth, requireRole('admin','ops_manager','dos'), async (req, res) => {
  try {
    const LiveClass = require('../models/LiveClass')
    const Homework  = require('../models/Homework')
    const since = new Date(Date.now() - 7*24*3600*1000)
    const classes = await LiveClass.find({ scheduledAt: { $gte: since } })
      .sort({ scheduledAt: -1 }).limit(25).lean()

    const rows = []
    for (const lc of classes) {
      const endsAt = new Date(new Date(lc.scheduledAt).getTime() + (lc.durationMins||60)*60000)
      const qFilter = { isActive:{ $ne:false }, type:'mcq' }
      if (lc.subject)    qFilter.subject    = new RegExp('^'+String(lc.subject).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$','i')
      if (lc.curriculum) qFilter.curriculum = lc.curriculum
      const subjectPool = await Question.countDocuments(qFilter)
      const lessonPool  = lc.syllabusSubtopicName
        ? await Question.countDocuments({ ...qFilter, subtopic: new RegExp('^'+String(lc.syllabusSubtopicName).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$','i') })
        : null
      const hwCount = await Homework.countDocuments({ sourceLiveClass: lc._id })

      let verdict
      if (hwCount) verdict = `OK — ${hwCount} homework set(s) created`
      else if (endsAt > new Date()) verdict = 'Waiting — class has not ended yet'
      else if (!lc.assignedStudents?.length) verdict = 'BLOCKED — no students assigned to this class'
      else if (!subjectPool) verdict = `BLOCKED — no questions for subject "${lc.subject}" + curriculum "${lc.curriculum}"`
      else if (lc.autoHomeworkEnabled === false) verdict = 'BLOCKED — autoHomeworkEnabled is false'
      else if (lc.autoHomeworkGeneratedAt) verdict = `Already processed: ${lc.autoHomeworkNote||''}`
      else verdict = 'Pending — should generate on next sweep'

      rows.push({
        _id: String(lc._id),
        status: lc.status,
        title: lc.title, subject: lc.subject, curriculum: lc.curriculum,
        lesson: lc.syllabusSubtopicName || null,
        scheduledAt: lc.scheduledAt, endsAt,
        students: lc.assignedStudents?.length || 0,
        questionsForSubject: subjectPool,
        questionsForLesson: lessonPool,
        homeworkCreated: hwCount,
        generatedAt: lc.autoHomeworkGeneratedAt || null,
        note: lc.autoHomeworkNote || '',
        verdict,
      })
    }
    return ok(res, { classes: rows, emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) })
  } catch(e) { return fail(res, 500, e.message) }
})

// ── POST /api/questions/bulk ────────────────────────
// Bulk-add questions. Accepts { questions: [...] } or a bare array.
// Each item needs: subject, questionText, options[], correctAnswer.
// Optional: topic, subtopic (== spine lesson name), lessonCode,
// curriculum, grade, difficulty, explanation, marks.
// Duplicates (same subject + questionText) are skipped, not errored.
router.post('/bulk', auth, requireRole('admin','ops_manager','dos','teacher'), async (req, res) => {
  try {
    // Accepts EITHER shape:
    //  A) { questions: [ {...}, ... ] }  — full JSON objects
    //  B) { text, defaults }             — one question per line:
    //     Question? | optA | optB | optC | optD | correctIndexOrText | explanation
    let items = Array.isArray(req.body) ? req.body : (req.body.questions || [])

    if ((!items || !items.length) && typeof req.body.text === 'string') {
      const d = req.body.defaults || {}
      items = req.body.text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(line => {
        const p = line.split('|').map(x => x.trim())
        const [qt, a, b, cc, dd, ans, exp] = p
        const options = [a, b, cc, dd].filter(x => x)
        let correctAnswer = ans || ''
        // allow 1-4 or A-D as the answer key
        if (/^[1-4]$/.test(correctAnswer))      correctAnswer = options[parseInt(correctAnswer,10)-1] || ''
        else if (/^[A-Da-d]$/.test(correctAnswer)) correctAnswer = options['abcd'.indexOf(correctAnswer.toLowerCase())] || ''
        return {
          subject:    d.subject,
          curriculum: d.curriculum,
          grade:      d.grade,
          topic:      d.topic || '',
          subtopic:   d.subtopic || '',
          difficulty: d.difficulty || 'medium',
          questionText: qt || '',
          options,
          correctAnswer,
          explanation: exp || '',
          marks: 1,
        }
      })
    }

    if (!Array.isArray(items) || !items.length) return fail(res, 400, 'Send { questions: [ ... ] } or { text, defaults }.')
    if (items.length > 2000) return fail(res, 400, 'Maximum 2000 questions per import.')

    let inserted = 0, skipped = 0
    const errors = []

    for (let i = 0; i < items.length; i++) {
      const q = items[i] || {}
      const label = `#${i+1} ${(q.questionText||'(no text)').slice(0,50)}`
      try {
        if (!q.subject)       { errors.push(`${label}: missing subject`); continue }
        if (!q.questionText)  { errors.push(`${label}: missing questionText`); continue }
        const opts = Array.isArray(q.options) ? q.options.filter(o => String(o||'').trim()) : []
        if (opts.length < 2)  { errors.push(`${label}: needs at least 2 options`); continue }
        if (!q.correctAnswer) { errors.push(`${label}: missing correctAnswer`); continue }
        if (!opts.includes(q.correctAnswer)) { errors.push(`${label}: correctAnswer is not one of the options`); continue }

        // O(1) duplicate check on a unique-sparse indexed hash.
        // Scanning unindexed questionText would be a full collection
        // scan per row — unusable once the bank reaches millions.
        const hash = crypto.createHash('sha1')
          .update(String(q.subject) + '||' + String(q.questionText).trim().toLowerCase())
          .digest('hex')
        const exists = await Question.findOne({ contentHash: hash }).select('_id').lean()
        if (exists) { skipped++; continue }

        await Question.create({
          subject:      q.subject,
          topic:        q.topic || '',
          subtopic:     q.subtopic || '',
          lessonCode:   q.lessonCode || '',
          curriculum:   q.curriculum || 'CambridgeIGCSE',
          grade:        q.grade || 'Year 10',
          difficulty:   ['easy','medium','hard'].includes(q.difficulty) ? q.difficulty : 'medium',
          type:         'mcq',
          questionText: q.questionText,
          options:      opts,
          correctAnswer:q.correctAnswer,
          explanation:  q.explanation || '',
          marks:        Number(q.marks) > 0 ? Number(q.marks) : 1,
          isActive:     true,
          contentHash:  hash,
          createdBy:    req.user._id,
        })
        inserted++
      } catch (err) {
        errors.push(`${label}: ${err.message}`)
      }
    }

    return ok(res, { inserted, skipped, failed: errors.length, errors: errors.slice(0, 15) },
      `Imported ${inserted} questions (${skipped} duplicates skipped, ${errors.length} failed).`)
  } catch(e) { return fail(res, 500, e.message) }
})

// ── POST /api/questions/seed ────────────────────────
router.post('/seed', auth, requireRole('admin','ops_manager'), async (req, res) => {
  try {
    let inserted=0, skipped=0
    const errors = []
    for (const q of SEED_QUESTIONS) {
      try {
        const exists = await Question.findOne({ questionText: q.questionText, subject: q.subject })
        if (exists) { skipped++; continue }
        await Question.create({ ...q, type:'mcq', isActive:true, createdBy:req.user._id })
        inserted++
      } catch(err) {
        errors.push(`${q.subject}/${(q.questionText||'').slice(0,40)}: ${err.message}`)
      }
    }
    const msg = `Seeded ${inserted} questions (${skipped} existed, ${errors.length} errors).`
    if (errors.length) console.error('[questions seed]', errors.slice(0,5))
    return ok(res, { inserted, skipped, errors: errors.slice(0,5) }, msg)
  } catch(e) { return fail(res,500,e.message) }
})




module.exports = router

const SEED_QUESTIONS = [

// ══════════════════════════════════════════════════════
// MATHEMATICS — IGCSE/O-Level
// ══════════════════════════════════════════════════════

// ─── Algebra ──────────────────────────────────────────
{ subject:'Mathematics', topic:'Algebra', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'easy',
  questionText:'Solve for x: 3x + 7 = 22',
  options:['x = 3','x = 5','x = 7','x = 4'],
  correctAnswer:'x = 5',
  explanation:'3x = 22 − 7 = 15, so x = 15 ÷ 3 = 5', marks:2 },

{ subject:'Mathematics', topic:'Algebra', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'easy',
  questionText:'Expand and simplify: (x + 3)(x − 2)',
  options:['x² + x − 6','x² − x − 6','x² + 5x − 6','x² + x + 6'],
  correctAnswer:'x² + x − 6',
  explanation:'(x+3)(x−2) = x²−2x+3x−6 = x²+x−6', marks:2 },

{ subject:'Mathematics', topic:'Algebra', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'Factorise: x² − 5x + 6',
  options:['(x − 2)(x − 3)','(x + 2)(x − 3)','(x − 1)(x − 6)','(x − 2)(x + 3)'],
  correctAnswer:'(x − 2)(x − 3)',
  explanation:'Find two numbers that multiply to 6 and add to −5: −2 and −3. So (x−2)(x−3)', marks:2 },

{ subject:'Mathematics', topic:'Algebra', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'Solve: 2x² − 8 = 0',
  options:['x = ±2','x = ±4','x = 2 only','x = ±√8'],
  correctAnswer:'x = ±2',
  explanation:'2x² = 8 → x² = 4 → x = ±√4 = ±2', marks:3 },

{ subject:'Mathematics', topic:'Algebra', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'If f(x) = 2x + 3, find f(4)',
  options:['11','9','7','10'],
  correctAnswer:'11',
  explanation:'f(4) = 2(4) + 3 = 8 + 3 = 11', marks:1 },

{ subject:'Mathematics', topic:'Algebra', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'hard',
  questionText:'Solve the simultaneous equations: 3x + 2y = 12 and x − y = 1',
  options:['x = 2, y = 3','x = 3, y = 2','x = 14/5, y = 9/5','x = 4, y = 0'],
  correctAnswer:'x = 14/5, y = 9/5',
  explanation:'From x−y=1: x=y+1. Substitute: 3(y+1)+2y=12 → 5y=9 → y=9/5, x=14/5', marks:4 },

{ subject:'Mathematics', topic:'Algebra', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'Simplify: (3x²y)(4xy³)',
  options:['12x³y⁴','12x²y³','7x³y⁴','12x³y³'],
  correctAnswer:'12x³y⁴',
  explanation:'Multiply coefficients: 3×4=12. Add indices: x^(2+1)=x³, y^(1+3)=y⁴', marks:2 },

{ subject:'Mathematics', topic:'Algebra', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'hard',
  questionText:'Use the quadratic formula to solve: x² + 3x − 10 = 0',
  options:['x = 2 or x = −5','x = −2 or x = 5','x = 2 or x = 5','x = 1 or x = 10'],
  correctAnswer:'x = 2 or x = −5',
  explanation:'x = (−3 ± √(9+40)) / 2 = (−3 ± 7) / 2. So x = 2 or x = −5', marks:3 },

// ─── Number ───────────────────────────────────────────
{ subject:'Mathematics', topic:'Number', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'What is 15% of 240?',
  options:['36','34','38','32'],
  correctAnswer:'36',
  explanation:'15% of 240 = (15/100) × 240 = 36', marks:1 },

{ subject:'Mathematics', topic:'Number', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'Write 0.000362 in standard form',
  options:['3.62 × 10⁻⁴','3.62 × 10⁻³','3.62 × 10⁴','36.2 × 10⁻⁵'],
  correctAnswer:'3.62 × 10⁻⁴',
  explanation:'Move decimal 4 places right: 3.62 × 10⁻⁴', marks:1 },

{ subject:'Mathematics', topic:'Number', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'Find the HCF of 48 and 72',
  options:['24','12','6','36'],
  correctAnswer:'24',
  explanation:'48 = 2⁴×3, 72 = 2³×3². HCF = 2³×3 = 24', marks:2 },

{ subject:'Mathematics', topic:'Number', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'Calculate: √(144) + 3²',
  options:['21','15','17','25'],
  correctAnswer:'21',
  explanation:'√144 = 12, 3² = 9. 12 + 9 = 21', marks:2 },

{ subject:'Mathematics', topic:'Number', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'Express 72 as a product of prime factors',
  options:['2³ × 3²','2² × 3³','2 × 36','2⁴ × 3'],
  correctAnswer:'2³ × 3²',
  explanation:'72 = 8 × 9 = 2³ × 3²', marks:2 },

// ─── Geometry ─────────────────────────────────────────
{ subject:'Mathematics', topic:'Geometry', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'What is the area of a circle with radius 7 cm? (π = 3.14)',
  options:['153.86 cm²','43.96 cm²','21.98 cm²','98.5 cm²'],
  correctAnswer:'153.86 cm²',
  explanation:'Area = πr² = 3.14 × 7² = 3.14 × 49 = 153.86 cm²', marks:2 },

{ subject:'Mathematics', topic:'Geometry', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'In a right-angled triangle, the two shorter sides are 6 cm and 8 cm. Find the hypotenuse.',
  options:['10 cm','12 cm','14 cm','7 cm'],
  correctAnswer:'10 cm',
  explanation:'c² = 6² + 8² = 36 + 64 = 100, c = √100 = 10 cm (Pythagoras)', marks:3 },

{ subject:'Mathematics', topic:'Geometry', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'The angles in a triangle are in the ratio 2:3:4. Find the largest angle.',
  options:['80°','60°','40°','90°'],
  correctAnswer:'80°',
  explanation:'2+3+4 = 9 parts. Total = 180°. Each part = 20°. Largest = 4×20 = 80°', marks:3 },

{ subject:'Mathematics', topic:'Geometry', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'hard',
  questionText:'A cylinder has radius 5 cm and height 12 cm. Find its volume in terms of π.',
  options:['300π cm³','60π cm³','120π cm³','600π cm³'],
  correctAnswer:'300π cm³',
  explanation:'V = πr²h = π × 5² × 12 = π × 25 × 12 = 300π cm³', marks:3 },

{ subject:'Mathematics', topic:'Geometry', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'What is the sum of interior angles of a hexagon?',
  options:['720°','540°','360°','900°'],
  correctAnswer:'720°',
  explanation:'Sum = (n−2)×180 = (6−2)×180 = 4×180 = 720°', marks:2 },

// ─── Trigonometry ─────────────────────────────────────
{ subject:'Mathematics', topic:'Trigonometry', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'In a right-angled triangle, the opposite side = 5 cm and hypotenuse = 13 cm. Find sin θ.',
  options:['5/13','12/13','5/12','13/5'],
  correctAnswer:'5/13',
  explanation:'sin θ = opposite/hypotenuse = 5/13', marks:2 },

{ subject:'Mathematics', topic:'Trigonometry', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'Find the value of cos 60°',
  options:['0.5','√3/2','1','0'],
  correctAnswer:'0.5',
  explanation:'cos 60° = 1/2 = 0.5. This is a standard trigonometric value to memorise.', marks:1 },

{ subject:'Mathematics', topic:'Trigonometry', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'hard',
  questionText:'A ladder of length 10 m leans against a wall at angle 72° to the ground. How high up the wall does it reach? (sin 72° = 0.951)',
  options:['9.51 m','3.09 m','10.5 m','8.2 m'],
  correctAnswer:'9.51 m',
  explanation:'Height = 10 × sin 72° = 10 × 0.951 = 9.51 m', marks:3 },

// ─── Statistics & Probability ─────────────────────────
{ subject:'Mathematics', topic:'Statistics', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'Find the mean of: 4, 7, 9, 12, 3',
  options:['7','8','6','5'],
  correctAnswer:'7',
  explanation:'Sum = 4+7+9+12+3 = 35. Mean = 35÷5 = 7', marks:2 },

{ subject:'Mathematics', topic:'Statistics', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'Find the median of: 3, 7, 2, 9, 1',
  options:['3','7','2','5'],
  correctAnswer:'3',
  explanation:'Arrange in order: 1,2,3,7,9. Middle value (3rd) = 3', marks:2 },

{ subject:'Mathematics', topic:'Probability', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'A bag contains 3 red and 5 blue balls. What is the probability of picking a red ball?',
  options:['3/8','5/8','3/5','1/3'],
  correctAnswer:'3/8',
  explanation:'P(red) = number of red / total = 3/(3+5) = 3/8', marks:2 },

{ subject:'Mathematics', topic:'Probability', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'hard',
  questionText:'Two fair dice are rolled. What is the probability that the sum equals 7?',
  options:['6/36','5/36','7/36','8/36'],
  correctAnswer:'6/36',
  explanation:'Pairs summing to 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6 outcomes out of 36', marks:3 },

// ─── Indices & Surds ──────────────────────────────────
{ subject:'Mathematics', topic:'Indices and Surds', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'Simplify: 2^3 × 2^4',
  options:['2^7','2^12','4^7','2^1'],
  correctAnswer:'2^7',
  explanation:'When multiplying powers with same base, add indices: 2^(3+4) = 2^7', marks:1 },

{ subject:'Mathematics', topic:'Indices and Surds', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'Simplify: √75',
  options:['5√3','3√5','25√3','√25 × √3'],
  correctAnswer:'5√3',
  explanation:'√75 = √(25×3) = √25 × √3 = 5√3', marks:2 },

{ subject:'Mathematics', topic:'Indices and Surds', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'hard',
  questionText:'Evaluate: 27^(2/3)',
  options:['9','3','18','6'],
  correctAnswer:'9',
  explanation:'27^(2/3) = (27^(1/3))^2 = (∛27)^2 = 3^2 = 9', marks:2 },

// ─── Functions & Graphs ───────────────────────────────
{ subject:'Mathematics', topic:'Functions and Graphs', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'What is the gradient of the line y = 3x − 7?',
  options:['3','−7','7','1/3'],
  correctAnswer:'3',
  explanation:'In y = mx + c, m is the gradient. Here m = 3', marks:1 },

{ subject:'Mathematics', topic:'Functions and Graphs', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'Find the y-intercept of the line passing through (0, 4) and (2, 8)',
  options:['4','8','2','0'],
  correctAnswer:'4',
  explanation:'The y-intercept is where x = 0. The point (0,4) gives y-intercept = 4', marks:1 },

// ══════════════════════════════════════════════════════
// A-LEVEL MATHEMATICS
// ══════════════════════════════════════════════════════

{ subject:'Mathematics', topic:'Calculus - Differentiation', curriculum:'CambridgeALevel', grade:'Year 12', difficulty:'medium',
  questionText:'Differentiate: y = 4x³ − 5x² + 2x − 7',
  options:['12x² − 10x + 2','4x² − 5x + 2','12x² − 10x','12x³ − 10x + 2'],
  correctAnswer:'12x² − 10x + 2',
  explanation:'dy/dx: bring power down and reduce by 1. d/dx[4x³] = 12x², d/dx[5x²] = 10x, d/dx[2x] = 2, d/dx[7] = 0', marks:3 },

{ subject:'Mathematics', topic:'Calculus - Differentiation', curriculum:'CambridgeALevel', grade:'Year 12', difficulty:'hard',
  questionText:'Find the gradient of y = x² − 4x + 3 at x = 3',
  options:['2','−2','6','0'],
  correctAnswer:'2',
  explanation:'dy/dx = 2x − 4. At x=3: gradient = 2(3) − 4 = 6 − 4 = 2', marks:3 },

{ subject:'Mathematics', topic:'Calculus - Integration', curriculum:'CambridgeALevel', grade:'Year 12', difficulty:'medium',
  questionText:'Integrate: ∫(3x² + 2x) dx',
  options:['x³ + x² + C','3x³ + x² + C','x³ + x + C','6x + 2 + C'],
  correctAnswer:'x³ + x² + C',
  explanation:'∫3x² dx = x³, ∫2x dx = x², add constant C. Result: x³ + x² + C', marks:3 },

{ subject:'Mathematics', topic:'Binomial Theorem', curriculum:'CambridgeALevel', grade:'Year 12', difficulty:'hard',
  questionText:'Find the coefficient of x² in the expansion of (1 + 2x)^5',
  options:['40','10','80','20'],
  correctAnswer:'40',
  explanation:'Using binomial: C(5,2) × (2x)² = 10 × 4x² = 40x². Coefficient = 40', marks:3 },

{ subject:'Mathematics', topic:'Logarithms', curriculum:'CambridgeALevel', grade:'Year 12', difficulty:'medium',
  questionText:'Solve: log₂(8) = x',
  options:['3','2','4','8'],
  correctAnswer:'3',
  explanation:'2^x = 8 = 2^3, so x = 3', marks:2 },

{ subject:'Mathematics', topic:'Logarithms', curriculum:'EdexcelALevel', grade:'Year 12', difficulty:'hard',
  questionText:'Simplify: log₁₀(1000) + log₁₀(0.01)',
  options:['1','3','5','-1'],
  correctAnswer:'1',
  explanation:'log(1000) = 3, log(0.01) = log(10⁻²) = −2. Sum = 3 + (−2) = 1', marks:3 },

{ subject:'Mathematics', topic:'Vectors', curriculum:'CambridgeALevel', grade:'Year 12', difficulty:'medium',
  questionText:'If a = (3, 4), find |a| (the magnitude of vector a)',
  options:['5','7','√7','12'],
  correctAnswer:'5',
  explanation:'|a| = √(3² + 4²) = √(9 + 16) = √25 = 5', marks:2 },

// ══════════════════════════════════════════════════════
// PHYSICS — IGCSE
// ══════════════════════════════════════════════════════

// ─── Forces & Motion ──────────────────────────────────
{ subject:'Physics', topic:'Forces and Motion', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'easy',
  questionText:'A car accelerates from 0 to 30 m/s in 10 seconds. Calculate the acceleration.',
  options:['3 m/s²','0.3 m/s²','300 m/s²','30 m/s²'],
  correctAnswer:'3 m/s²',
  explanation:'a = (v−u)/t = (30−0)/10 = 3 m/s²', marks:2 },

{ subject:'Physics', topic:'Forces and Motion', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'A force of 20 N acts on a mass of 4 kg. Calculate the acceleration.',
  options:['5 m/s²','80 m/s²','0.2 m/s²','24 m/s²'],
  correctAnswer:'5 m/s²',
  explanation:'F = ma → a = F/m = 20/4 = 5 m/s² (Newton\'s Second Law)', marks:2 },

{ subject:'Physics', topic:'Forces and Motion', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'What is the SI unit of force?',
  options:['Newton (N)','Joule (J)','Watt (W)','Pascal (Pa)'],
  correctAnswer:'Newton (N)',
  explanation:'Force is measured in Newtons (N), named after Sir Isaac Newton. 1 N = 1 kg⋅m/s²', marks:1 },

{ subject:'Physics', topic:'Forces and Motion', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'A 60 kg person stands on Earth. What is their weight? (g = 10 N/kg)',
  options:['600 N','60 N','6 N','6000 N'],
  correctAnswer:'600 N',
  explanation:'W = mg = 60 × 10 = 600 N', marks:2 },

{ subject:'Physics', topic:'Forces and Motion', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'hard',
  questionText:'A ball is thrown upwards with initial velocity 20 m/s. How long does it take to reach maximum height? (g = 10 m/s²)',
  options:['2 s','4 s','1 s','0.5 s'],
  correctAnswer:'2 s',
  explanation:'At max height, v = 0. Using v = u − gt: 0 = 20 − 10t → t = 2 s', marks:3 },

// ─── Energy, Work & Power ─────────────────────────────
{ subject:'Physics', topic:'Energy, Work and Power', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'Calculate the work done when a force of 50 N moves an object 8 m.',
  options:['400 J','58 J','6.25 J','400 N'],
  correctAnswer:'400 J',
  explanation:'W = F × d = 50 × 8 = 400 J', marks:2 },

{ subject:'Physics', topic:'Energy, Work and Power', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'A machine does 1200 J of work in 40 seconds. What is its power output?',
  options:['30 W','48000 W','0.033 W','1240 W'],
  correctAnswer:'30 W',
  explanation:'P = W/t = 1200/40 = 30 W', marks:2 },

{ subject:'Physics', topic:'Energy, Work and Power', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'A 2 kg book is held 3 m above the ground. Calculate its gravitational potential energy. (g = 10 N/kg)',
  options:['60 J','600 J','0.67 J','23 J'],
  correctAnswer:'60 J',
  explanation:'GPE = mgh = 2 × 10 × 3 = 60 J', marks:2 },

{ subject:'Physics', topic:'Energy, Work and Power', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'A car of mass 1000 kg moves at 20 m/s. Calculate its kinetic energy.',
  options:['200,000 J','10,000 J','20,000 J','400,000 J'],
  correctAnswer:'200,000 J',
  explanation:'KE = ½mv² = ½ × 1000 × 20² = 500 × 400 = 200,000 J', marks:3 },

// ─── Waves & Light ────────────────────────────────────
{ subject:'Physics', topic:'Waves and Light', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'What is the speed of light in a vacuum?',
  options:['3 × 10⁸ m/s','3 × 10⁶ m/s','3 × 10¹⁰ m/s','3 × 10⁵ m/s'],
  correctAnswer:'3 × 10⁸ m/s',
  explanation:'The speed of light in vacuum c = 3 × 10⁸ m/s (approximately 300,000 km/s)', marks:1 },

{ subject:'Physics', topic:'Waves and Light', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'A wave has frequency 200 Hz and wavelength 2 m. Calculate its speed.',
  options:['400 m/s','100 m/s','202 m/s','0.01 m/s'],
  correctAnswer:'400 m/s',
  explanation:'v = f × λ = 200 × 2 = 400 m/s', marks:2 },

{ subject:'Physics', topic:'Waves and Light', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'Which electromagnetic wave has the shortest wavelength?',
  options:['Gamma rays','X-rays','Ultraviolet','Radio waves'],
  correctAnswer:'Gamma rays',
  explanation:'The EM spectrum from longest to shortest wavelength: radio, microwave, infrared, visible, UV, X-ray, gamma. Gamma rays have the shortest wavelength and highest frequency/energy.', marks:1 },

// ─── Electricity ──────────────────────────────────────
{ subject:'Physics', topic:'Electricity', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'Calculate the resistance if V = 12V and I = 3A. (Use V = IR)',
  options:['4 Ω','36 Ω','0.25 Ω','9 Ω'],
  correctAnswer:'4 Ω',
  explanation:'R = V/I = 12/3 = 4 Ω (Ohm\'s Law)', marks:2 },

{ subject:'Physics', topic:'Electricity', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'A 60 W bulb is used for 2 hours. How much electrical energy does it use?',
  options:['432,000 J','120 J','30 J','720 J'],
  correctAnswer:'432,000 J',
  explanation:'E = P × t = 60 × (2 × 3600) = 60 × 7200 = 432,000 J', marks:3 },

{ subject:'Physics', topic:'Electricity', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'hard',
  questionText:'Three resistors of 2Ω, 3Ω, and 6Ω are connected in parallel. Find the total resistance.',
  options:['1 Ω','11 Ω','0.5 Ω','2 Ω'],
  correctAnswer:'1 Ω',
  explanation:'1/R = 1/2 + 1/3 + 1/6 = 3/6 + 2/6 + 1/6 = 6/6 = 1. So R = 1 Ω', marks:4 },

// ─── Thermal Physics ──────────────────────────────────
{ subject:'Physics', topic:'Thermal Physics', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'Which of the following is the best conductor of heat?',
  options:['Copper','Wood','Air','Plastic'],
  correctAnswer:'Copper',
  explanation:'Metals, especially copper, are excellent conductors of heat. Non-metals and gases are poor conductors (insulators).', marks:1 },

{ subject:'Physics', topic:'Thermal Physics', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'Water boils at 100°C. What is this in Kelvin?',
  options:['373 K','100 K','273 K','−173 K'],
  correctAnswer:'373 K',
  explanation:'K = °C + 273 = 100 + 273 = 373 K', marks:1 },

// ══════════════════════════════════════════════════════
// CHEMISTRY — IGCSE
// ══════════════════════════════════════════════════════

{ subject:'Chemistry', topic:'Atomic Structure', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'An atom of carbon has 6 protons. How many electrons does a neutral carbon atom have?',
  options:['6','12','3','8'],
  correctAnswer:'6',
  explanation:'In a neutral atom, the number of electrons equals the number of protons. Carbon has 6 protons, so it has 6 electrons.', marks:1 },

{ subject:'Chemistry', topic:'Atomic Structure', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'The element ¹²₆C has mass number 12 and atomic number 6. How many neutrons does it have?',
  options:['6','12','3','18'],
  correctAnswer:'6',
  explanation:'Neutrons = mass number − atomic number = 12 − 6 = 6', marks:2 },

{ subject:'Chemistry', topic:'The Periodic Table', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'Elements in the same group of the Periodic Table have the same number of:',
  options:['Electrons in their outer shell','Protons','Neutrons','Shells'],
  correctAnswer:'Electrons in their outer shell',
  explanation:'Elements in the same group have the same number of electrons in their outermost shell, which gives them similar chemical properties.', marks:1 },

{ subject:'Chemistry', topic:'The Periodic Table', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'Which group in the Periodic Table contains the Noble Gases?',
  options:['Group 0 (Group 18)','Group 1','Group 7','Group 4'],
  correctAnswer:'Group 0 (Group 18)',
  explanation:'Noble gases (He, Ne, Ar, Kr, Xe, Rn) are in Group 0 (also called Group 18). They have full outer shells and are very unreactive.', marks:1 },

{ subject:'Chemistry', topic:'Chemical Bonding', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'What type of bond forms between sodium (Na) and chlorine (Cl) in NaCl?',
  options:['Ionic bond','Covalent bond','Metallic bond','Hydrogen bond'],
  correctAnswer:'Ionic bond',
  explanation:'Na donates one electron to Cl, forming Na⁺ and Cl⁻ ions. The electrostatic attraction between these oppositely charged ions is an ionic bond.', marks:2 },

{ subject:'Chemistry', topic:'Chemical Bonding', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'What type of bond holds the two hydrogen atoms together in H₂?',
  options:['Covalent bond','Ionic bond','Metallic bond','Van der Waals forces'],
  correctAnswer:'Covalent bond',
  explanation:'In H₂, each hydrogen atom shares one electron to form a shared pair. This sharing of electrons is a covalent bond.', marks:1 },

{ subject:'Chemistry', topic:'Moles and Stoichiometry', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'Calculate the relative molecular mass (Mr) of H₂SO₄. (H=1, S=32, O=16)',
  options:['98','64','34','80'],
  correctAnswer:'98',
  explanation:'Mr = (2×1) + 32 + (4×16) = 2 + 32 + 64 = 98', marks:2 },

{ subject:'Chemistry', topic:'Moles and Stoichiometry', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'hard',
  questionText:'How many moles are in 44 g of CO₂? (Mr of CO₂ = 44)',
  options:['1 mole','2 moles','0.5 moles','44 moles'],
  correctAnswer:'1 mole',
  explanation:'moles = mass/Mr = 44/44 = 1 mole', marks:2 },

{ subject:'Chemistry', topic:'Rates of Reaction', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'Which factor does NOT affect the rate of a chemical reaction?',
  options:['The colour of the reactants','Temperature','Concentration','Catalyst'],
  correctAnswer:'The colour of the reactants',
  explanation:'Rate is affected by temperature, concentration, surface area, catalyst, and pressure (for gases). Colour is a physical property that does not affect reaction rate.', marks:2 },

{ subject:'Chemistry', topic:'Acids and Bases', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'What is the pH of pure water at 25°C?',
  options:['7','0','14','1'],
  correctAnswer:'7',
  explanation:'Pure water is neutral, with a pH of exactly 7 at 25°C.', marks:1 },

{ subject:'Chemistry', topic:'Acids and Bases', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'What salt is produced when hydrochloric acid reacts with sodium hydroxide?',
  options:['Sodium chloride (NaCl)','Sodium sulphate','Sodium carbonate','Sodium oxide'],
  correctAnswer:'Sodium chloride (NaCl)',
  explanation:'HCl + NaOH → NaCl + H₂O. The acid and alkali neutralise each other to form salt (NaCl) and water.', marks:2 },

{ subject:'Chemistry', topic:'Electrolysis', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'hard',
  questionText:'During the electrolysis of dilute sulphuric acid, what is produced at the cathode?',
  options:['Hydrogen gas','Oxygen gas','Sulphur dioxide','Water'],
  correctAnswer:'Hydrogen gas',
  explanation:'At the cathode (negative electrode), H⁺ ions gain electrons: 2H⁺ + 2e⁻ → H₂. Hydrogen gas is produced.', marks:3 },

// ══════════════════════════════════════════════════════
// BIOLOGY — IGCSE
// ══════════════════════════════════════════════════════

{ subject:'Biology', topic:'Unit 1 · Cell Structure & Organisation', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'Which organelle is known as the "powerhouse of the cell"?',
  options:['Mitochondria','Ribosome','Nucleus','Chloroplast'],
  correctAnswer:'Mitochondria',
  explanation:'Mitochondria produce ATP (energy) through aerobic respiration, earning the nickname "powerhouse of the cell".', marks:1 },

{ subject:'Biology', topic:'Unit 1 · Cell Structure & Organisation', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'Which structure is found in plant cells but NOT in animal cells?',
  options:['Cell wall','Cell membrane','Nucleus','Cytoplasm'],
  correctAnswer:'Cell wall',
  explanation:'Plant cells have a rigid cell wall made of cellulose. Animal cells have a flexible cell membrane but no cell wall.', marks:2 },

{ subject:'Biology', topic:'Unit 2 · Plant Nutrition & Photosynthesis', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'What are the raw materials needed for photosynthesis?',
  options:['Carbon dioxide and water','Oxygen and glucose','Carbon dioxide and oxygen','Glucose and water'],
  correctAnswer:'Carbon dioxide and water',
  explanation:'Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Plants use CO₂ and H₂O to make glucose and oxygen.', marks:2 },

{ subject:'Biology', topic:'Unit 2 · Plant Nutrition & Photosynthesis', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'In which part of the plant cell does photosynthesis take place?',
  options:['Chloroplast','Mitochondria','Nucleus','Vacuole'],
  correctAnswer:'Chloroplast',
  explanation:'Chloroplasts contain chlorophyll, the green pigment that absorbs light energy for photosynthesis.', marks:1 },

{ subject:'Biology', topic:'Unit 3 · Respiration', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'Write the word equation for aerobic respiration.',
  options:['glucose + oxygen → carbon dioxide + water + energy','glucose → lactic acid + energy','glucose + water → oxygen + glucose','carbon dioxide + water → glucose + oxygen'],
  correctAnswer:'glucose + oxygen → carbon dioxide + water + energy',
  explanation:'Aerobic respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP (energy). This occurs in mitochondria.', marks:2 },

{ subject:'Biology', topic:'Unit 4 · Inheritance & Genetics', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'hard',
  questionText:'In a monohybrid cross between two heterozygous parents (Tt × Tt), what is the expected ratio of tall to short offspring?',
  options:['3:1','1:1','1:2:1','2:1'],
  correctAnswer:'3:1',
  explanation:'Tt × Tt → TT:Tt:tt = 1:2:1. Tall (TT+Tt) : short (tt) = 3:1 since T is dominant', marks:3 },

{ subject:'Biology', topic:'Unit 4 · Inheritance & Genetics', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'What is the name of the molecule that carries genetic information in most living organisms?',
  options:['DNA','RNA','ATP','Protein'],
  correctAnswer:'DNA',
  explanation:'DNA (deoxyribonucleic acid) is the molecule that stores genetic information. It is a double helix made of nucleotides.', marks:1 },

{ subject:'Biology', topic:'Unit 3 · Transport in Animals', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'Which blood component carries oxygen around the body?',
  options:['Red blood cells','White blood cells','Platelets','Plasma'],
  correctAnswer:'Red blood cells',
  explanation:'Red blood cells (erythrocytes) contain haemoglobin, which binds to oxygen and transports it to body cells.', marks:1 },

{ subject:'Biology', topic:'Unit 5 · Organisms & Environment', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'What is the original source of energy for almost all food chains?',
  options:['The Sun','The soil','Decomposers','Herbivores'],
  correctAnswer:'The Sun',
  explanation:'Producers (plants/algae) capture sunlight energy through photosynthesis, forming the base of food chains.', marks:1 },

// ══════════════════════════════════════════════════════
// BUSINESS STUDIES — IGCSE
// ══════════════════════════════════════════════════════

{ subject:'Business Studies', topic:'Business Organisation', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'What does the term "sole trader" mean?',
  options:['A business owned and run by one person','A business with one product','A public limited company','A business with only one employee'],
  correctAnswer:'A business owned and run by one person',
  explanation:'A sole trader is the simplest business structure where one person owns and runs the business. They keep all profits but have unlimited liability.', marks:1 },

{ subject:'Business Studies', topic:'Marketing', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'What are the 4 Ps of the marketing mix?',
  options:['Product, Price, Place, Promotion','Product, Profit, People, Place','Price, People, Promotion, Production','Product, Price, People, Profit'],
  correctAnswer:'Product, Price, Place, Promotion',
  explanation:'The 4 Ps (marketing mix): Product (what is sold), Price (what it costs), Place (where it is sold), Promotion (how it is communicated). These help businesses meet customer needs.', marks:2 },

{ subject:'Business Studies', topic:'Finance', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'If a business has revenue of $50,000 and total costs of $35,000, what is its profit?',
  options:['$15,000','$85,000','$35,000','$50,000'],
  correctAnswer:'$15,000',
  explanation:'Profit = Revenue − Total Costs = $50,000 − $35,000 = $15,000', marks:2 },

{ subject:'Business Studies', topic:'Human Resources', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'What is the purpose of a job description?',
  options:['To describe the duties and responsibilities of a job role','To describe the qualities needed in a candidate','To state the salary for a job','To advertise a job vacancy'],
  correctAnswer:'To describe the duties and responsibilities of a job role',
  explanation:'A job description outlines what the job involves — tasks, responsibilities, and who the employee reports to. A person specification describes the ideal candidate.', marks:2 },

// ══════════════════════════════════════════════════════
// COMPUTER SCIENCE — IGCSE
// ══════════════════════════════════════════════════════

{ subject:'Computer Science', topic:'Binary and Data', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'Convert the binary number 1010 to decimal.',
  options:['10','8','12','5'],
  correctAnswer:'10',
  explanation:'1010 in binary: 1×2³ + 0×2² + 1×2¹ + 0×2⁰ = 8 + 0 + 2 + 0 = 10', marks:2 },

{ subject:'Computer Science', topic:'Binary and Data', curriculum:'CambridgeIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'How many bits are in 1 byte?',
  options:['8','4','16','2'],
  correctAnswer:'8',
  explanation:'1 byte = 8 bits. This is a fundamental unit in computing: 1 nibble = 4 bits, 1 byte = 8 bits, 1 kilobyte = 1024 bytes.', marks:1 },

{ subject:'Computer Science', topic:'Programming Concepts', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'easy',
  questionText:'What does an algorithm describe?',
  options:['A step-by-step set of instructions to solve a problem','A type of computer programming language','A method of storing data','A type of computer hardware'],
  correctAnswer:'A step-by-step set of instructions to solve a problem',
  explanation:'An algorithm is a precise, finite set of instructions that describes how to solve a problem or complete a task.', marks:1 },

{ subject:'Computer Science', topic:'Programming Concepts', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'What does a "for loop" do in programming?',
  options:['Repeats a block of code a specified number of times','Repeats code indefinitely','Executes code only once','Skips over a block of code'],
  correctAnswer:'Repeats a block of code a specified number of times',
  explanation:'A for loop iterates a defined number of times. Example: for i in range(5) repeats 5 times with i going from 0 to 4.', marks:2 },

{ subject:'Computer Science', topic:'Networks', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'medium',
  questionText:'What does "HTTP" stand for?',
  options:['HyperText Transfer Protocol','High Transfer Technology Protocol','Home Transfer Text Process','HyperText Technology Protocol'],
  correctAnswer:'HyperText Transfer Protocol',
  explanation:'HTTP (HyperText Transfer Protocol) is the foundation of data communication on the World Wide Web. HTTPS is the secure version.', marks:1 },

// ══════════════════════════════════════════════════════
// ECONOMICS — IGCSE
// ══════════════════════════════════════════════════════

{ subject:'Economics', topic:'Supply and Demand', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'easy',
  questionText:'If the price of a good rises, what typically happens to the quantity demanded (all else equal)?',
  options:['It falls','It rises','It stays the same','It doubles'],
  correctAnswer:'It falls',
  explanation:'The Law of Demand states that as price rises, quantity demanded falls (inverse relationship), assuming all other factors remain constant (ceteris paribus).', marks:1 },

{ subject:'Economics', topic:'Supply and Demand', curriculum:'CambridgeIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'Which factor would cause the demand curve for coffee to shift to the right?',
  options:['An increase in the price of tea (a substitute)','An increase in the price of coffee','A decrease in consumer income','A decrease in population'],
  correctAnswer:'An increase in the price of tea (a substitute)',
  explanation:'If tea (a substitute for coffee) gets more expensive, consumers switch to coffee. This increases demand for coffee, shifting the curve right.', marks:3 },

{ subject:'Economics', topic:'Market Structures', curriculum:'EdexcelIGCSE', grade:'Year 11', difficulty:'medium',
  questionText:'Which market structure has only ONE seller of a product with no close substitutes?',
  options:['Monopoly','Oligopoly','Perfect competition','Duopoly'],
  correctAnswer:'Monopoly',
  explanation:'A monopoly has a single seller dominating the market. Entry barriers prevent competition, giving the monopolist significant price-setting power.', marks:2 },

// ══════════════════════════════════════════════════════
// KENYA CBC — MATHEMATICS (Grade 7–9)
// ══════════════════════════════════════════════════════

{ subject:'Mathematics', topic:'Number and Operations', curriculum:'KenyaCBC', grade:'Grade 7', difficulty:'easy',
  questionText:'What is 25% of 200?',
  options:['50','25','75','100'],
  correctAnswer:'50',
  explanation:'25% = 25/100 = 1/4. 1/4 of 200 = 50', marks:1 },

{ subject:'Mathematics', topic:'Algebra', curriculum:'KenyaCBC', grade:'Grade 8', difficulty:'easy',
  questionText:'Solve for y: 2y − 6 = 10',
  options:['y = 8','y = 2','y = 4','y = 16'],
  correctAnswer:'y = 8',
  explanation:'2y = 10 + 6 = 16, y = 16 ÷ 2 = 8', marks:2 },

{ subject:'Mathematics', topic:'Geometry', curriculum:'KenyaCBC', grade:'Grade 7', difficulty:'easy',
  questionText:'What is the perimeter of a square with side length 7 cm?',
  options:['28 cm','49 cm','14 cm','21 cm'],
  correctAnswer:'28 cm',
  explanation:'Perimeter of square = 4 × side = 4 × 7 = 28 cm', marks:1 },

// ══════════════════════════════════════════════════════
// IB MATHEMATICS
// ══════════════════════════════════════════════════════

{ subject:'Mathematics', topic:'Calculus', curriculum:'IB', grade:'Grade 11', difficulty:'hard',
  questionText:'Find the derivative of f(x) = e^(2x)',
  options:['2e^(2x)','e^(2x)','2xe^x','e^(x)'],
  correctAnswer:'2e^(2x)',
  explanation:'Using chain rule: d/dx[e^(2x)] = e^(2x) × d/dx[2x] = 2e^(2x)', marks:3 },

{ subject:'Mathematics', topic:'Statistics', curriculum:'IB', grade:'Grade 11', difficulty:'medium',
  questionText:'A normal distribution has mean μ = 50 and standard deviation σ = 10. What percentage of values lie within one standard deviation of the mean?',
  options:['68%','95%','99.7%','50%'],
  correctAnswer:'68%',
  explanation:'The 68-95-99.7 rule: 68% within 1σ, 95% within 2σ, 99.7% within 3σ of the mean.', marks:2 },

]
