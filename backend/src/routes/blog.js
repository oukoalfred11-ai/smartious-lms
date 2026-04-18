const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');

// GET teacher's blog posts
router.get('/teacher', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Mock blog posts - in production this would come from a Blog model
    const posts = [
      {
        id: 'post-1',
        title: '5 Ways to Make Quadratic Equations Fun for IGCSE Students',
        reads: 1847,
        earnings: 5541,
        date: 'Feb 28',
        status: 'Published'
      },
      {
        id: 'post-2',
        title: 'Why Pythagoras Theorem Appears in Every IGCSE Exam',
        reads: 3204,
        earnings: 9606,
        date: 'Feb 14',
        status: 'Published'
      },
      {
        id: 'post-3',
        title: 'How I Use AI to Give Better Exam Feedback',
        reads: 892,
        earnings: 2676,
        date: 'Jan 30',
        status: 'Published'
      },
      {
        id: 'post-4',
        title: 'Teaching Trigonometry: From SOHCAHTOA to Applications',
        reads: 0,
        earnings: 0,
        date: 'Draft',
        status: 'Draft'
      }
    ];

    res.json({ success: true, posts });
  } catch (e) {
    console.error('[blog/teacher]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching blog posts' });
  }
});

// POST create blog post (teacher only)
router.post('/', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { title, body, subject, category, status } = req.body;

    // Mock blog post creation - in production this would save to database
    const newPost = {
      id: `post-${Date.now()}`,
      title,
      body,
      subject,
      category,
      status: status || 'Draft',
      reads: 0,
      earnings: 0,
      date: status === 'Published' ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Draft',
      author: req.user.firstName + ' ' + req.user.lastName
    };

    res.json({ success: true, post: newPost, message: 'Blog post created successfully' });
  } catch (e) {
    console.error('[blog POST]', e.message);
    res.status(500).json({ success: false, message: 'Server error creating blog post' });
  }
});

// PATCH update blog post (teacher only)
router.patch('/:id', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { title, body, subject, category, status } = req.body;

    // Mock blog post update - in production this would update in database
    const updatedPost = {
      id: req.params.id,
      title,
      body,
      subject,
      category,
      status: status || 'Draft',
      date: status === 'Published' ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Draft',
      author: req.user.firstName + ' ' + req.user.lastName
    };

    res.json({ success: true, post: updatedPost, message: 'Blog post updated successfully' });
  } catch (e) {
    console.error('[blog PATCH]', e.message);
    res.status(500).json({ success: false, message: 'Server error updating blog post' });
  }
});

// DELETE blog post (teacher only)
router.delete('/:id', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Mock blog post deletion - in production this would delete from database
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (e) {
    console.error('[blog DELETE]', e.message);
    res.status(500).json({ success: false, message: 'Server error deleting blog post' });
  }
});

module.exports = router;
