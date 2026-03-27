const router = require('express').Router()
const { Lesson } = require('../models/Models')
const { auth } = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  try {
    const { subject, curriculum, grade } = req.query
    const q = { status:'published' }
    if (subject) q.subject = subject
    if (curriculum) q.curriculum = curriculum
    if (grade) q.grade = grade
    const lessons = await Lesson.find(q).sort('title').limit(50)
    res.json({ success:true, lessons })
  } catch(e) { res.status(500).json({ success:false, message:e.message }) }
})

router.post('/', auth, async (req, res) => {
  try {
    const lesson = await Lesson.create({ ...req.body, teacherId: req.user._id })
    res.json({ success:true, lesson })
  } catch(e) { res.status(400).json({ success:false, message:e.message }) }
})

module.exports = router
