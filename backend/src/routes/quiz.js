/**
 * routes/quiz.js
 * Quiz game engine — solo play, competition, leaderboards.
 * Mounted at /api/quiz
 *
 * POST /api/quiz/session          — create solo quiz session
 * POST /api/quiz/competition      — create competition, get code
 * POST /api/quiz/join/:code       — student joins by code
 * POST /api/quiz/answer           — submit answer for a question
 * POST /api/quiz/complete         — mark session complete, award XP
 * GET  /api/quiz/session/:id      — get session state
 * GET  /api/quiz/leaderboard      — class/school leaderboard
 * GET  /api/quiz/achievements/:studentId — student achievements
 * GET  /api/quiz/questions        — fetch questions for a quiz
 */
const express       = require('express')
const router        = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const Question      = require('../models/Question')
const QuizSession   = require('../models/QuizSession')
const Achievement   = require('../models/StudentAchievement')
const User          = require('../models/User')

const ok   = (res, data, msg) => res.json({ success:true, data, message:msg||'' })
const fail = (res, code, msg) => res.status(code).json({ success:false, message:msg })

// ── Question fetcher with progressive filter relaxation ──
// Tries strictest filter first, then relaxes: grade → difficulty →
// curriculum, so students always get questions for their subject.
// Supports spine filters: topicRef (SyllabusTopic id) and subtopic.
async function fetchQuizQuestions({ subject, topic, subtopic, topicRef, curriculum, difficulty, grade, count }) {
  const n = Math.min(parseInt(count,10)||10, 50)
  const base = { isActive:{ $ne:false }, type:'mcq' }
  if (subject)  base.subject = new RegExp('^'+subject.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$','i')
  if (topic)    base.topic   = new RegExp(topic,'i')
  if (subtopic) base.subtopic= new RegExp(subtopic,'i')
  if (topicRef) base.topicRef= topicRef

  // Filter attempts from strictest to loosest
  const attempts = [
    { ...base, curriculum, difficulty, grade },
    { ...base, curriculum, difficulty },
    { ...base, curriculum },
    { ...base, difficulty },
    { ...base },
  ]

  for (const raw of attempts) {
    const filter = {}
    for (const [k,v] of Object.entries(raw)) if (v !== undefined && v !== '' && v !== null) filter[k] = v
    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: n } },
      { $project: { questionText:1, options:1, correctAnswer:1, explanation:1, marks:1, topic:1, subtopic:1, difficulty:1, subject:1 } }
    ])
    if (questions.length >= Math.min(3, n)) return questions
  }
  return []
}


// XP awards
const XP_CORRECT     = 10
const XP_SPEED_BONUS = 5   // if answered in first 10 seconds
const XP_STREAK_3    = 15  // 3-streak bonus
const XP_STREAK_5    = 30  // 5-streak bonus
const XP_PERFECT     = 50  // 100% accuracy bonus

// ── GET /api/quiz/questions ─────────────────────────
// Fetch N random questions for a quiz
router.get('/questions', auth, async (req, res) => {
  try {
    const { subject, topic, curriculum, difficulty, count=10, grade } = req.query
    const filter = { isActive:true }
    if (subject)    filter.subject    = new RegExp(subject, 'i')
    if (topic)      filter.topic      = new RegExp(topic, 'i')
    if (curriculum) filter.curriculum = curriculum
    if (difficulty) filter.difficulty = difficulty
    if (grade)      filter.grade      = grade
    // Only mcq questions for game (auto-markable)
    filter.type = 'mcq'
    filter['parts.0'] = { $exists:false } // flat questions only

    const total = await Question.countDocuments(filter)
    const n     = Math.min(parseInt(count,10)||10, 50)
    const skip  = Math.max(0, Math.floor(Math.random() * Math.max(0, total - n)))

    const questions = await Question.find(filter)
      .skip(skip).limit(n)
      .select('questionText options correctAnswer explanation marks topic difficulty subject')
      .lean()

    // If not enough from skip, just get what's available
    if (questions.length < n && skip > 0) {
      const more = await Question.find(filter).limit(n).select('questionText options correctAnswer explanation marks topic difficulty subject').lean()
      return ok(res, { questions: more, total })
    }

    return ok(res, { questions, total })
  } catch(e) { return fail(res,500,e.message) }
})

// ── POST /api/quiz/session ──────────────────────────
// Create a solo quiz session
router.post('/session', auth, async (req, res) => {
  try {
    const { subject, topic, curriculum, difficulty, count=10, grade, timePerQ=30 } = req.body
    const questions = await fetchQuizQuestions({ subject, topic, subtopic:req.body.subtopic, topicRef:req.body.topicRef, curriculum, difficulty, grade, count })
    if (!questions.length) return fail(res,404,'No questions available for '+(subject||'this subject')+' yet. Ask your teacher to add questions to the Question Bank.')

    const session = await QuizSession.create({
      code:     QuizSession.generateCode(),
      mode:     'solo',
      status:   'active',
      subject:  subject||'General',
      topic:    topic||'',
      curriculum: curriculum||'',
      questions: questions.map(q=>q._id),
      questionCount: questions.length,
      timePerQ: parseInt(timePerQ,10)||30,
      hostId:   req.user._id,
      hostName: req.user.firstName+' '+req.user.lastName,
      participants: [{
        studentId:   req.user._id,
        studentName: req.user.firstName+' '+req.user.lastName,
        answers: [],
        score: 0,
      }],
      startedAt: new Date(),
    })

    return ok(res, { session, questions }, 'Quiz started!')
  } catch(e) { return fail(res,500,e.message) }
})

// ── POST /api/quiz/competition ──────────────────────
// Create a competition session with shareable code
router.post('/competition', auth, async (req, res) => {
  try {
    const { subject, topic, curriculum, difficulty, count=10, grade, timePerQ=20 } = req.body
    const questions = await fetchQuizQuestions({ subject, topic, subtopic:req.body.subtopic, topicRef:req.body.topicRef, curriculum, difficulty, grade, count })
    if (!questions.length) return fail(res,404,'No questions available for '+(subject||'this subject')+' yet.')

    // Ensure unique code
    let code, attempts=0
    do { code = QuizSession.generateCode(); attempts++ } while (attempts < 10 && await QuizSession.findOne({code}))

    const session = await QuizSession.create({
      code, mode:'competition', status:'waiting',
      subject:subject||'General', topic:topic||'', curriculum:curriculum||'',
      questions: questions.map(q=>q._id),
      questionCount: questions.length,
      timePerQ: parseInt(timePerQ,10)||20,
      hostId: req.user._id,
      hostName: req.user.firstName+' '+req.user.lastName,
      participants: [],
    })

    return ok(res, { session, questions, code }, `Competition created! Code: ${code}`)
  } catch(e) { return fail(res,500,e.message) }
})

// ── POST /api/quiz/join/:code ────────────────────────
router.post('/join/:code', auth, async (req, res) => {
  try {
    const session = await QuizSession.findOne({ code:req.params.code.toUpperCase() })
    if (!session) return fail(res,404,'Code not found. Check and try again.')
    if (session.status==='finished') return fail(res,400,'This competition has ended.')

    const already = session.participants.some(p=>String(p.studentId)===String(req.user._id))
    if (!already) {
      session.participants.push({
        studentId:   req.user._id,
        studentName: req.user.firstName+' '+req.user.lastName,
        answers: [], score:0,
      })
      await session.save()
    }

    // Return questions
    const questions = await Question.find({ _id:{ $in:session.questions } })
      .select('questionText options correctAnswer explanation marks topic difficulty subject')
      .lean()

    return ok(res, { session, questions }, 'Joined!')
  } catch(e) { return fail(res,500,e.message) }
})

// ── POST /api/quiz/answer ───────────────────────────
// Submit answer for one question
router.post('/answer', auth, async (req, res) => {
  try {
    const { sessionId, questionId, answer, timeTaken } = req.body

    const session = await QuizSession.findById(sessionId)
    if (!session) return fail(res,404,'Session not found.')

    const question = await Question.findById(questionId).lean()
    if (!question) return fail(res,404,'Question not found.')

    const correct = String(answer) === String(question.correctAnswer)
    const speedBonus = timeTaken <= 10000 && correct ? XP_SPEED_BONUS : 0
    const basePoints = correct ? (question.marks||1) * XP_CORRECT : 0
    const points     = basePoints + speedBonus

    // Find participant
    const p = session.participants.find(p=>String(p.studentId)===String(req.user._id))
    if (!p) return fail(res,400,'Not a participant in this session.')

    // Check already answered
    const already = p.answers.find(a=>String(a.questionId)===String(questionId))
    if (already) return ok(res, { correct, points:0, explanation:question.explanation }, 'Already answered.')

    p.answers.push({ questionId, answer, correct, timeTaken:timeTaken||0, points })
    p.score       += points
    p.totalPoints += points
    if (correct) {
      p.correctCount++
      p.streak++
      if (p.streak > p.maxStreak) p.maxStreak = p.streak
    } else {
      p.streak = 0
    }

    await session.save()

    return ok(res, {
      correct,
      points,
      streak: p.streak,
      explanation: question.explanation,
    })
  } catch(e) { return fail(res,500,e.message) }
})

// ── POST /api/quiz/complete ─────────────────────────
// Mark session complete, award XP, update achievements
router.post('/complete', auth, async (req, res) => {
  try {
    const { sessionId } = req.body
    const session = await QuizSession.findById(sessionId).populate('questions','marks')
    if (!session) return fail(res,404,'Session not found.')

    const p = session.participants.find(p=>String(p.studentId)===String(req.user._id))
    if (!p) return fail(res,400,'Not a participant.')
    if (p.completedAt) return ok(res, { alreadyDone:true }, 'Already completed.')

    p.completedAt = new Date()

    // Calculate ranks for competition
    if (session.mode==='competition') {
      const sorted = [...session.participants].filter(x=>x.completedAt).sort((a,b)=>b.score-a.score)
      sorted.forEach((sp,i) => {
        const found = session.participants.find(x=>String(x.studentId)===String(sp.studentId))
        if (found) found.rank = i+1
      })
    }

    // XP awards
    let xpEarned = p.score
    const accuracy = p.answers.length ? (p.correctCount/p.answers.length)*100 : 0
    if (accuracy===100) xpEarned += XP_PERFECT
    if (p.maxStreak>=5) xpEarned += XP_STREAK_5
    else if (p.maxStreak>=3) xpEarned += XP_STREAK_3

    session.status = 'finished'
    await session.save()

    // Update achievement record
    const student = await User.findById(req.user._id).lean()
    let ach = await Achievement.findOne({ studentId:req.user._id })
    if (!ach) ach = new Achievement({ studentId:req.user._id, studentName:student?.firstName+' '+student?.lastName })

    ach.totalXP       += xpEarned
    ach.weeklyXP      += xpEarned
    ach.quizzesTaken  += 1
    ach.totalCorrect  += p.correctCount
    ach.totalAnswered += p.answers.length
    ach.lastQuizDate   = new Date()
    if (p.maxStreak > ach.bestStreak) ach.bestStreak = p.maxStreak

    // Streak tracking
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1); yesterday.setHours(0,0,0,0)
    const lastDate  = ach.lastQuizDate ? new Date(ach.lastQuizDate) : null
    if (lastDate && lastDate >= yesterday) ach.currentStreak++
    else ach.currentStreak = 1

    // Level up
    const newLevel = Math.floor(Math.sqrt(ach.totalXP/100)) + 1
    const leveledUp = newLevel > ach.level
    ach.level = newLevel

    // Badges
    const newBadges = []
    const hasBadge  = (id) => ach.badges.some(b=>b.id===id)
    if (!hasBadge('first_quiz')) { newBadges.push({ id:'first_quiz',name:'First Quiz!',icon:'◎',reason:'Completed your first quiz' }); }
    if (accuracy===100&&!hasBadge('perfect')) { newBadges.push({ id:'perfect',name:'Perfect Score',icon:'★',reason:'100% accuracy' }) }
    if (p.maxStreak>=5&&!hasBadge('streak5')) { newBadges.push({ id:'streak5',name:'On Fire!',icon:'▲',reason:'5 correct in a row' }) }
    if (ach.quizzesTaken>=10&&!hasBadge('quiz10')) { newBadges.push({ id:'quiz10',name:'Quiz Master',icon:'♛',reason:'Completed 10 quizzes' }) }
    if (ach.totalXP>=1000&&!hasBadge('xp1000')) { newBadges.push({ id:'xp1000',name:'1K Club',icon:'★',reason:'Earned 1,000 XP' }) }
    if (ach.currentStreak>=7&&!hasBadge('week')) { newBadges.push({ id:'week',name:'Week Warrior',icon:'◆',reason:'7-day streak' }) }

    ach.badges.push(...newBadges)

    // Subject stat
    const ss = ach.subjectStats.find(s=>s.subject===session.subject)
    if (ss) { ss.xp+=xpEarned; ss.correct+=p.correctCount; ss.answered+=p.answers.length; ss.lastPlayed=new Date() }
    else ach.subjectStats.push({ subject:session.subject, xp:xpEarned, correct:p.correctCount, answered:p.answers.length })

    await ach.save()

    return ok(res, {
      xpEarned, leveledUp, newLevel:ach.level, newBadges,
      accuracy: Math.round(accuracy),
      score: p.score, rank: p.rank||1,
      streak: p.maxStreak,
      achievement: ach,
    }, 'Quiz complete!')
  } catch(e) { console.error('[quiz complete]',e.message); return fail(res,500,e.message) }
})

// ── GET /api/quiz/session/:id ───────────────────────
router.get('/session/:id', auth, async (req, res) => {
  try {
    const session = await QuizSession.findById(req.params.id)
      .populate('participants.studentId','firstName lastName avatar')
      .lean()
    if (!session) return fail(res,404,'Not found.')
    return ok(res, { session })
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /api/quiz/leaderboard ───────────────────────
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { subject, limit=20 } = req.query
    const filter = {}
    if (subject) filter['subjectStats.subject'] = subject

    const achievements = await Achievement.find(filter)
      .sort({ totalXP:-1 })
      .limit(parseInt(limit,10)||20)
      .populate('studentId','firstName lastName avatar gradeLevel curriculum')
      .lean()

    const board = achievements.map((a,i) => ({
      rank:      i+1,
      studentId: a.studentId?._id,
      name:      a.studentId ? `${a.studentId.firstName} ${a.studentId.lastName}` : a.studentName,
      avatar:    a.studentId?.avatar||'',
      level:     a.level,
      totalXP:   a.totalXP,
      weeklyXP:  a.weeklyXP,
      quizzes:   a.quizzesTaken,
      accuracy:  a.totalAnswered ? Math.round((a.totalCorrect/a.totalAnswered)*100) : 0,
      streak:    a.currentStreak,
      badges:    a.badges.length,
      grade:     a.studentId?.gradeLevel||'',
    }))

    return ok(res, { board })
  } catch(e) { return fail(res,500,e.message) }
})

// ── GET /api/quiz/achievements/:studentId ───────────
router.get('/achievements/:studentId', auth, async (req, res) => {
  try {
    const sid = req.params.studentId==='me' ? req.user._id : req.params.studentId
    let ach = await Achievement.findOne({ studentId:sid }).lean()
    if (!ach) ach = { totalXP:0, level:1, quizzesTaken:0, badges:[], subjectStats:[], currentStreak:0, bestStreak:0 }

    // Get recent sessions
    const sessions = await QuizSession.find({ 'participants.studentId':sid, status:'finished' })
      .sort({ finishedAt:-1 }).limit(10)
      .select('subject questionCount startedAt finishedAt participants')
      .lean()

    const history = sessions.map(s=>{
      const p = s.participants.find(x=>String(x.studentId)===String(sid))
      return {
        subject: s.subject,
        date:    s.finishedAt||s.updatedAt,
        score:   p?.score||0,
        correct: p?.correctCount||0,
        total:   p?.answers?.length||0,
        accuracy:p?.answers?.length ? Math.round((p.correctCount/p.answers.length)*100):0,
      }
    })

    return ok(res, { achievement:ach, history })
  } catch(e) { return fail(res,500,e.message) }
})

module.exports = router
