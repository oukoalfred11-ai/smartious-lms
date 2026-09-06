/**
 * observations.js — record and summarize lesson observations.
 *   POST /api/observations                { teacherId, liveClassId?, scores, note }
 *   GET  /api/observations/summary        per-teacher average + count
 *   GET  /api/observations?teacherId=     history for one teacher
 * Teachers can read their own; only academic staff write.
 */
const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const Observation = require('../models/Observation');

const STAFF = ['admin', 'ops_manager', 'dos'];

router.post('/', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const { teacherId, liveClassId, scores, note } = req.body || {};
    if (!teacherId || !scores) return res.status(400).json({ success: false, message: 'Teacher and scores are required.' });
    for (const c of Observation.CRITERIA) {
      const v = Number(scores[c]);
      if (!(v >= 1 && v <= 5)) return res.status(400).json({ success: false, message: `Score 1-5 required for ${c}.` });
    }
    const doc = await Observation.create({
      teacherId, liveClassId: liveClassId || null, observerId: req.user._id,
      scores: Object.fromEntries(Observation.CRITERIA.map(c => [c, Number(scores[c])])),
      note: String(note || '').slice(0, 1000),
    });
    res.json({ success: true, message: 'Observation recorded.', data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/summary', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const rows = await Observation.aggregate([
      { $project: { teacherId: 1, avg: { $avg: Observation.CRITERIA.map(c => '$scores.' + c) } } },
      { $group: { _id: '$teacherId', avg: { $avg: '$avg' }, n: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: { rows: rows.map(r => ({ teacherId: r._id, avg: Math.round(r.avg * 10) / 10, n: r.n })) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/', auth, async (req, res) => {
  try {
    const tid = req.query.teacherId;
    if (!tid) return res.status(400).json({ success: false, message: 'teacherId required.' });
    const isSelf = String(req.user._id) === String(tid);
    if (!isSelf && !STAFF.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Not allowed.' });
    const rows = await Observation.find({ teacherId: tid })
      .populate('observerId', 'firstName lastName')
      .populate('liveClassId', 'title subject scheduledAt')
      .sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, data: { rows, criteria: Observation.CRITERIA } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
