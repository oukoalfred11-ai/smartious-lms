const router = require('express').Router()
const User = require('../models/User')
const { auth, requireRole } = require('../middleware/auth')

router.get('/admin', auth, requireRole('admin'), async (req, res) => {
  try {
    const [totalStudents, totalTeachers] = await Promise.all([
      User.countDocuments({ role:'student' }),
      User.countDocuments({ role:'teacher' }),
    ])
    res.json({ success:true, stats: { totalStudents, totalTeachers, revenue:'3.48M', uptime:'99.4%' } })
  } catch(e) { res.status(500).json({ success:false, message:e.message }) }
})

module.exports = router
