const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');

// GET teacher reports
router.get('/teacher', auth, requireRole('teacher'), async (req, res) => {
  try {
    const reports = {
      classAverage: 73,
      highestScore: 91,
      atRiskStudents: 2,
      attendanceRate: 92,
      topicMastery: [
        { topic: 'Number & Algebra', score: 78 },
        { topic: 'Pythagoras Theorem', score: 73 },
        { topic: 'Statistics', score: 69 },
        { topic: 'Coordinate Geometry', score: 61 },
        { topic: 'Trigonometry', score: 55 }
      ],
      studentProgress: [
        { name: 'Amara Osei', progress: 85, trend: 'up' },
        { name: 'Kofi Mensah', progress: 92, trend: 'up' },
        { name: 'Zara Kamau', progress: 78, trend: 'up' },
        { name: 'Faith Wanjiru', progress: 96, trend: 'up' },
        { name: 'David Mwangi', progress: 58, trend: 'down' }
      ]
    };

    res.json({ success: true, reports });
  } catch (e) {
    console.error('[reports/teacher]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching reports' });
  }
});

// GET admin reports
router.get('/admin', auth, requireRole('admin'), async (req, res) => {
  try {
    const reports = {
      totalStudents: 156,
      totalTeachers: 8,
      totalRevenue: 'KES 3.48M',
      averageRating: 4.7,
      monthlyGrowth: 12,
      topSubjects: [
        { subject: 'Mathematics', students: 89 },
        { subject: 'English', students: 67 },
        { subject: 'Biology', students: 45 },
        { subject: 'Chemistry', students: 38 },
        { subject: 'Physics', students: 32 }
      ]
    };

    res.json({ success: true, reports });
  } catch (e) {
    console.error('[reports/admin]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching reports' });
  }
});

module.exports = router;
