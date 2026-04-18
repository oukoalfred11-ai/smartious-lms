const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');

// GET teacher's marking queue
router.get('/teacher', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Mock marking queue data
    const papers = [
      {
        id: 'paper-1',
        exam: 'Maths Mock — Paper 1',
        submissions: 24,
        marks: 100,
        status: 'Pending',
        deadline: '2026-04-15',
        subject: 'Mathematics'
      },
      {
        id: 'paper-2',
        exam: 'Chapter 4 Quiz',
        submissions: 18,
        marks: 20,
        status: 'Pending',
        deadline: '2026-04-12',
        subject: 'Mathematics'
      },
      {
        id: 'paper-3',
        exam: 'Trigonometry Test',
        submissions: 15,
        marks: 50,
        status: 'In Progress',
        deadline: '2026-04-18',
        subject: 'Mathematics'
      }
    ];

    res.json({ success: true, papers });
  } catch (e) {
    console.error('[marking/teacher]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching marking queue' });
  }
});

// GET submissions for a specific paper
router.get('/paper/:id', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Mock submissions data
    const submissions = [
      {
        id: 'sub-1',
        studentName: 'Amara Osei',
        studentId: 'student-1',
        submittedAt: '2026-04-10T10:30:00Z',
        status: 'Pending',
        score: null,
        aiAnalysis: {
          plagiarism: 3,
          aiGenerated: 5,
          integrity: 'Good'
        }
      },
      {
        id: 'sub-2',
        studentName: 'Kofi Mensah',
        studentId: 'student-2',
        submittedAt: '2026-04-10T11:15:00Z',
        status: 'Pending',
        score: null,
        aiAnalysis: {
          plagiarism: 1,
          aiGenerated: 2,
          integrity: 'Excellent'
        }
      },
      {
        id: 'sub-3',
        studentName: 'David Mwangi',
        studentId: 'student-3',
        submittedAt: '2026-04-10T09:45:00Z',
        status: 'Flagged',
        score: null,
        aiAnalysis: {
          plagiarism: 22,
          aiGenerated: 15,
          integrity: 'Concerning'
        }
      }
    ];

    res.json({ success: true, submissions });
  } catch (e) {
    console.error('[marking/paper]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching submissions' });
  }
});

// POST mark submission
router.post('/submission/:id', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { score, feedback, marks } = req.body;

    // Mock marking submission - in production this would update the database
    const result = {
      id: req.params.id,
      score: parseInt(score),
      totalMarks: parseInt(marks) || 100,
      feedback,
      markedBy: req.user.firstName + ' ' + req.user.lastName,
      markedAt: new Date(),
      status: 'Marked'
    };

    res.json({ success: true, result, message: 'Submission marked successfully' });
  } catch (e) {
    console.error('[marking/submission]', e.message);
    res.status(500).json({ success: false, message: 'Server error marking submission' });
  }
});

// POST AI marking for paper
router.post('/ai-mark/:paperId', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Mock AI marking - in production this would trigger AI analysis
    const results = [
      { studentId: 'student-1', score: 85, feedback: 'Good understanding of concepts' },
      { studentId: 'student-2', score: 92, feedback: 'Excellent work' },
      { studentId: 'student-3', score: 45, feedback: 'Needs improvement in calculations' }
    ];

    res.json({ success: true, results, message: 'AI marking completed' });
  } catch (e) {
    console.error('[marking/ai-mark]', e.message);
    res.status(500).json({ success: false, message: 'Server error with AI marking' });
  }
});

module.exports = router;
