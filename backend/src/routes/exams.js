const router = require('express').Router()
const { Exam, Progress } = require('../models/Models')
const { auth } = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  try {
    const exams = await Exam.find({ status:'published' }).sort('-createdAt').limit(20)
    res.json({ success:true, exams })
  } catch(e) { res.status(500).json({ success:false, message:e.message }) }
})

router.post('/', auth, async (req, res) => {
  try {
    const exam = await Exam.create({ ...req.body, teacherId: req.user._id })
    res.json({ success:true, exam })
  } catch(e) { res.status(400).json({ success:false, message:e.message }) }
})

router.post('/:id/submit', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
    if (!exam) return res.status(404).json({ success:false, message:'Exam not found' })
    const { answers } = req.body
    let score = 0, maxScore = 0
    const gradedAnswers = exam.questions.map((q, i) => {
      maxScore += q.marks
      const isCorrect = answers[i] === q.correctAnswer
      if (isCorrect) score += q.marks
      return { questionId: q._id, answer: answers[i], isCorrect, marksAwarded: isCorrect ? q.marks : 0 }
    })
    const pct = Math.round(score / maxScore * 100)
    const progress = await Progress.create({ studentId: req.user._id, examId: exam._id, type:'exam', status:'graded', score, percentage: pct, answers: gradedAnswers, completedAt: new Date() })
    res.json({ success:true, score, percentage: pct, grade: pct>=80?'A':pct>=70?'B':pct>=60?'C':pct>=50?'D':'F', progress })
  } catch(e) { res.status(500).json({ success:false, message:e.message }) }
})

module.exports = router
