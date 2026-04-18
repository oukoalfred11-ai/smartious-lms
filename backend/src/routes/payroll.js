const express = require('express');
const Payroll = require('../models/Payroll');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

function logAudit(user, action, details) {
  // TODO: Implement persistent audit logging
  console.log(`[AUDIT] ${user}: ${action}`, details);
}

// GET /api/payroll - List all payroll records
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate('staffId processedBy');
    res.json({ success: true, payrolls });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/payroll - Create payroll record
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const payroll = new Payroll({ ...req.body, processedBy: req.user._id });
    await payroll.save();
    logAudit(req.user?.email || 'system', 'create_payroll', payroll);
    res.status(201).json({ success: true, payroll });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// PATCH /api/payroll/:id - Update payroll record
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date(), processedBy: req.user._id },
      { new: true }
    );
    if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found' });
    logAudit(req.user?.email || 'system', 'update_payroll', payroll);
    res.json({ success: true, payroll });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// DELETE /api/payroll/:id - Delete payroll record
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found' });
    logAudit(req.user?.email || 'system', 'delete_payroll', payroll);
    res.json({ success: true, message: 'Payroll deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;

