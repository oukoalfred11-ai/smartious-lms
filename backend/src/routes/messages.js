const router = require('express').Router()
const { Message } = require('../models/Models')
const { auth, requireRole } = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({ $or: [{ senderId: req.user._id }, { recipientId: req.user._id }] }).sort('-createdAt').limit(50).populate('senderId','firstName lastName role').populate('recipientId','firstName lastName role')
    res.json({ success:true, messages })
  } catch(e) { res.status(500).json({ success:false, message:e.message }) }
})

router.post('/', auth, async (req, res) => {
  try {
    const msg = await Message.create({ ...req.body, senderId: req.user._id })
    res.json({ success:true, message: msg })
  } catch(e) { res.status(400).json({ success:false, message:e.message }) }
})

// GET teacher messages
router.get('/teacher', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Mock messages data - in production this would come from a Messages model
    const messages = [
      {
        id: 'msg-1',
        from: 'Janet Osei',
        fromRole: 'parent',
        subject: 'Mathematics Progress Update',
        body: 'Amara has been making good progress in mathematics. She scored 85% on the recent mock exam.',
        time: '2 hours ago',
        unread: true
      },
      {
        id: 'msg-2',
        from: 'Admin',
        fromRole: 'admin',
        subject: 'Schedule Update',
        body: 'Please note the change in classroom allocation for next week.',
        time: '1 day ago',
        unread: false
      }
    ];

    res.json({ success: true, messages });
  } catch (e) {
    console.error('[messages/teacher]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching messages' });
  }
});

module.exports = router
