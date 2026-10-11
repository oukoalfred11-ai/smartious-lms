const router = require('express').Router()
const User = require('../models/User')
const Invoice = require('../models/Invoice')
const { auth, requireRole } = require('../middleware/auth')

// 3480000 -> '3.48M', 12400 -> '12.4K', 950 -> '950'
const compact = n => {
  const v = Number(n || 0)
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(2) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return String(Math.round(v))
}

router.get('/admin', auth, requireRole('admin', 'accountant', 'sales', 'ops_manager'), async (req, res) => {
  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const [totalStudents, totalTeachers, collected] = await Promise.all([
      User.countDocuments({ role:'student' }),
      User.countDocuments({ role:'teacher' }),
      // Revenue = money collected this calendar month: invoices paid
      // this month by paidAt, summing paidAmount (totalDue fallback).
      Invoice.aggregate([
        { $match: { status: 'paid', paidAt: { $gte: monthStart } } },
        { $group: { _id: '$currency', n: { $sum: 1 },
          amount: { $sum: { $cond: [{ $gt: [{ $ifNull: ['$paidAmount', 0] }, 0] }, '$paidAmount', '$totalDue'] } } } },
        { $sort: { n: -1, amount: -1 } },
      ]),
    ])
    // Currencies are not added together; the headline figure is the
    // currency most payments were made in, the rest are alongside.
    const main = collected[0] || { _id: 'USD', amount: 0 }
    const revenueByCurrency = Object.fromEntries(collected.map(c => [c._id || 'USD', c.amount]))
    res.json({ success:true, stats: {
      totalStudents, totalTeachers,
      revenue: compact(main.amount), revenueCurrency: main._id || 'USD', revenueByCurrency,
      uptime:'99.4%',
    } })
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
