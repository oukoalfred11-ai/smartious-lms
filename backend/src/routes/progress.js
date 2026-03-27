const router = require('express').Router()
const { Progress } = require('../models/Models')
const { auth } = require('../middleware/auth')

router.get('/mine', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.user._id }).sort('-createdAt').limit(50)
    res.json({ success:true, progress })
  } catch(e) { res.status(500).json({ success:false, message:e.message }) }
})

module.exports = router
