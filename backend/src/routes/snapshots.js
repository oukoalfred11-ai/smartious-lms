/**
 * snapshots.js (routes) — trend series for module charts, backfill, and
 * the intervention register. All academic-staff guarded.
 *
 *   GET  /api/snapshots?scope=school&days=30      day-by-day series
 *   POST /api/snapshots/backfill { days }         rebuild history (admin)
 *   GET  /api/interventions?status=open
 *   POST /api/interventions                       log an action for a student
 *   PATCH /api/interventions/:id/close { outcome, outcomeNote }
 */
const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const MetricSnapshot = require('../models/MetricSnapshot');
const Intervention = require('../models/Intervention');
const User = require('../models/User');
const { computeDay, rollup } = require('../lib/snapshots');

const STAFF = ['admin', 'ops_manager', 'dos'];
const dayKey = (d) => d.toISOString().split('T')[0];

router.get('/', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const scope = req.query.scope || 'school';
    const days = Math.min(Number(req.query.days) || 30, 120);
    const fromDay = dayKey(new Date(Date.now() - days * 864e5));
    const rows = await MetricSnapshot.find({ scope, day: { $gte: fromDay } }).sort({ day: 1 }).lean();
    const summary = await rollup(scope, fromDay, dayKey(new Date()));
    res.json({ success: true, data: { scope, days, rows: rows.map(r => ({ day: r.day, ...r.metrics })), summary } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/backfill', auth, requireRole('admin', 'dos'), async (req, res) => {
  try {
    const days = Math.min(Number(req.body?.days) || 30, 90);
    let done = 0;
    for (let i = days; i >= 0; i--) {
      await computeDay(new Date(Date.now() - i * 864e5));
      done += 1;
    }
    res.json({ success: true, message: `Rebuilt ${done} day(s) of history.` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Intervention register ────────────────────────────────────────────
router.get('/interventions', auth, requireRole(...STAFF, 'teacher'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.studentId) filter.studentId = req.query.studentId;
    const rows = await Intervention.find(filter)
      .populate('studentId', 'firstName lastName gradeLevel')
      .populate('owner', 'firstName lastName')
      .sort({ dueDate: 1 }).limit(300).lean();
    res.json({ success: true, data: { rows } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/interventions', auth, requireRole(...STAFF, 'teacher'), async (req, res) => {
  try {
    const { studentId, flag, action, ownerId, dueDate, metricAtStart } = req.body || {};
    if (!studentId || !flag || !action || !dueDate)
      return res.status(400).json({ success: false, message: 'Student, flag, action and review date are required.' });
    const student = await User.findById(studentId).select('_id');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    const doc = await Intervention.create({
      studentId, flag: String(flag).slice(0, 40), action: String(action).slice(0, 500),
      owner: ownerId || req.user._id, dueDate: new Date(dueDate),
      metricAtStart: String(metricAtStart || '').slice(0, 120), createdBy: req.user._id,
    });
    res.json({ success: true, message: 'Intervention logged.', data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/interventions/:id/close', auth, requireRole(...STAFF, 'teacher'), async (req, res) => {
  try {
    const { outcome, outcomeNote } = req.body || {};
    if (!['improved', 'no_change', 'worse'].includes(outcome))
      return res.status(400).json({ success: false, message: 'Outcome must be improved, no_change or worse.' });
    const doc = await Intervention.findByIdAndUpdate(req.params.id,
      { $set: { status: 'closed', outcome, outcomeNote: String(outcomeNote || '').slice(0, 500), closedAt: new Date() } },
      { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, message: 'Intervention closed.', data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
