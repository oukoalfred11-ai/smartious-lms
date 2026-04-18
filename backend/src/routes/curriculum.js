const express = require('express');
const Curriculum = require('../models/Curriculum');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

function logAudit(user, action, details) {
  // TODO: Implement persistent audit logging
  console.log(`[AUDIT] ${user}: ${action}`, details);
}

// GET /api/curriculum - List all curricula
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const curricula = await Curriculum.find();
    res.json({ success: true, curricula });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/curriculum - Create curriculum
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const curriculum = new Curriculum(req.body);
    await curriculum.save();
    logAudit(req.user?.email || 'system', 'create_curriculum', curriculum);
    res.status(201).json({ success: true, curriculum });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// PATCH /api/curriculum/:id - Update curriculum
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const curriculum = await Curriculum.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    logAudit(req.user?.email || 'system', 'update_curriculum', curriculum);
    res.json({ success: true, curriculum });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// DELETE /api/curriculum/:id - Delete curriculum
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const curriculum = await Curriculum.findByIdAndDelete(req.params.id);
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    logAudit(req.user?.email || 'system', 'delete_curriculum', curriculum);
    res.json({ success: true, message: 'Curriculum deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;

