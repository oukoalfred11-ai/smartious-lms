/**
 * notifications.js - the bell.
 *   GET   /api/notifications/mine       latest 30 + unread count
 *   PATCH /api/notifications/read-all   mark all mine read
 */
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');

router.get('/mine', auth, async (req, res) => {
  try {
    const [items, unread] = await Promise.all([
      Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30).lean(),
      Notification.countDocuments({ userId: req.user._id, readAt: null }),
    ]);
    res.json({ success: true, data: { items, unread } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, readAt: null }, { $set: { readAt: new Date() } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
