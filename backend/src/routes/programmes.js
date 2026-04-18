const express = require('express');
const Programme = require('../models/Programme');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

function logAudit(user, action, details) {
  // TODO: Implement persistent audit logging
  console.log(`[AUDIT] ${user}: ${action}`, details);
}

// GET /api/programmes - List all programmes
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const programmes = await Programme.find();
    res.json({ success: true, programmes });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/programmes - Create programme
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const programme = new Programme(req.body);
    await programme.save();
    logAudit(req.user?.email || 'system', 'create_programme', programme);
    res.status(201).json({ success: true, programme });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// PATCH /api/programmes/:id - Update programme
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const programme = await Programme.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!programme) return res.status(404).json({ success: false, message: 'Programme not found' });
    logAudit(req.user?.email || 'system', 'update_programme', programme);
    res.json({ success: true, programme });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// DELETE /api/programmes/:id - Delete programme
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const programme = await Programme.findByIdAndDelete(req.params.id);
    if (!programme) return res.status(404).json({ success: false, message: 'Programme not found' });
    logAudit(req.user?.email || 'system', 'delete_programme', programme);
    res.json({ success: true, message: 'Programme deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;

