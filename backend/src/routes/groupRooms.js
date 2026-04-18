const express = require('express');
const GroupRoom = require('../models/GroupRoom');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

function logAudit(user, action, details) {
  // TODO: Implement persistent audit logging
  console.log(`[AUDIT] ${user}: ${action}`, details);
}

// GET /api/groupRooms - List all group rooms
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const rooms = await GroupRoom.find().populate('teacher students');
    res.json({ success: true, rooms });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/groupRooms - Create group room
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const room = new GroupRoom(req.body);
    await room.save();
    logAudit(req.user?.email || 'system', 'create_group_room', room);
    res.status(201).json({ success: true, room });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// PATCH /api/groupRooms/:id - Update group room
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const room = await GroupRoom.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!room) return res.status(404).json({ success: false, message: 'Group room not found' });
    logAudit(req.user?.email || 'system', 'update_group_room', room);
    res.json({ success: true, room });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// DELETE /api/groupRooms/:id - Delete group room
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const room = await GroupRoom.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Group room not found' });
    logAudit(req.user?.email || 'system', 'delete_group_room', room);
    res.json({ success: true, message: 'Group room deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;

