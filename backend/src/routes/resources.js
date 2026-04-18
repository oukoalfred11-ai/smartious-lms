const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');

// GET resources (for teachers and students)
router.get('/', auth, async (req, res) => {
  try {
    // Mock resources data - in production this would come from a Resources model
    const resources = [
      {
        id: 'res-1',
        title: 'Pythagoras Theorem Worksheet',
        type: 'PDF',
        subject: 'Mathematics',
        grade: 'Form 3',
        size: '1.2 MB',
        downloads: 34,
        createdAt: new Date(),
        addedBy: 'Mr. Muthomi'
      },
      {
        id: 'res-2',
        title: 'Trigonometry Lecture Slides',
        type: 'Slides',
        subject: 'Mathematics',
        grade: 'Form 3',
        size: '4.8 MB',
        downloads: 28,
        createdAt: new Date(),
        addedBy: 'Mr. Muthomi'
      },
      {
        id: 'res-3',
        title: 'Cambridge Past Papers 2018–2023',
        type: 'PDF',
        subject: 'Mathematics',
        grade: 'Form 4',
        size: '18.3 MB',
        downloads: 67,
        createdAt: new Date(),
        addedBy: 'Mr. Muthomi'
      }
    ];

    res.json({ success: true, resources });
  } catch (e) {
    console.error('[resources]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching resources' });
  }
});

// POST create resource (teacher only)
router.post('/', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { title, type, subject, grade, size, addedBy } = req.body;

    // Mock resource creation - in production this would save to database
    const newResource = {
      id: `res-${Date.now()}`,
      title,
      type,
      subject,
      grade,
      size: size || '—',
      downloads: 0,
      createdAt: new Date(),
      addedBy: addedBy || req.user.firstName + ' ' + req.user.lastName
    };

    res.json({ success: true, resource: newResource, message: 'Resource created successfully' });
  } catch (e) {
    console.error('[resources POST]', e.message);
    res.status(500).json({ success: false, message: 'Server error creating resource' });
  }
});

module.exports = router;
