const router = require('express').Router()
const User = require('../models/User')
const { auth, requireRole } = require('../middleware/auth')

router.get('/admin', auth, requireRole('admin', 'accountant', 'sales', 'ops_manager'), async (req, res) => {
  try {
    const [totalStudents, totalTeachers] = await Promise.all([
      User.countDocuments({ role:'student' }),
      User.countDocuments({ role:'teacher' }),
    ])
    res.json({ success:true, stats: { totalStudents, totalTeachers, revenue:'3.48M', uptime:'99.4%' } })
  } catch(e) { res.status(500).json({ success:false, message:e.message }) }
})

// GET teacher dashboard data
router.get('/teacher', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Get teacher's students count
    const teacherStudents = await User.countDocuments({ 
      role: 'student', 
      subjects: { $in: req.user.subjects || [] } 
    });
    
    // Get recent activity stats
    const recentStats = {
      activeStudents: 24,
      classAverage: 73,
      examsToMark: 3,
      resourcesUploaded: 47
    };
    
    res.json({ 
      success: true, 
      stats: {
        teacherStudents,
        ...recentStats
      }
    });
  } catch(e) { 
    res.status(500).json({ success:false, message:e.message }) 
  }
})

module.exports = router
