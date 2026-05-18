const router = require('express').Router();
const SyllabusTopic = require('../models/SyllabusTopic');
const Subject = require('../models/Subject');
const { auth, requireRole } = require('../middleware/auth');

// ═══════════════════════════════════════════════════════════
// CURRICULUM SPINE ROUTES  —  /api/syllabus
// Manages the SyllabusTopic spine: topics + embedded subtopics
// for each Subject. Admin-managed. Reading is open to any
// authenticated user (teachers/students consume the spine).
// ═══════════════════════════════════════════════════════════

// ── GET /api/syllabus/subject/:subjectId ───────────────────
// The full ordered spine for one subject.
router.get('/subject/:subjectId', auth, async (req, res) => {
  try {
    const topics = await SyllabusTopic.find({ subjectId: req.params.subjectId })
      .sort({ topicOrder: 1 })
      .lean({ virtuals: true });
    res.json({ success: true, data: { topics } });
  } catch (e) {
    console.error('[syllabus GET subject]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── GET /api/syllabus/topic/:id ────────────────────────────
router.get('/topic/:id', auth, async (req, res) => {
  try {
    const topic = await SyllabusTopic.findById(req.params.id).lean({ virtuals: true });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found.' });
    res.json({ success: true, data: { topic } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── POST /api/syllabus/topic ───────────────────────────────
// Create a topic. Body: subjectId, topic, code?, topicOrder?,
// subtopics?, sourceSyllabus?
router.post('/topic', auth, requireRole('admin'), async (req, res) => {
  try {
    const { subjectId, topic } = req.body;
    if (!subjectId || !topic || !topic.trim())
      return res.status(400).json({ success: false, message: 'subjectId and topic are required.' });

    // Pull curriculum + subjectName from the Subject (denormalised on the spine)
    const subject = await Subject.findById(subjectId).lean();
    if (!subject)
      return res.status(404).json({ success: false, message: 'Subject not found.' });

    // Default topicOrder = append to the end
    let order = req.body.topicOrder;
    if (typeof order !== 'number') {
      const count = await SyllabusTopic.countDocuments({ subjectId });
      order = count;
    }

    const doc = await SyllabusTopic.create({
      subjectId,
      curriculum:  subject.curriculum || '',
      subjectName: subject.subjectName || subject.name || '',
      topic: topic.trim(),
      code: (req.body.code || '').trim(),
      topicOrder: order,
      subtopics: Array.isArray(req.body.subtopics) ? req.body.subtopics : [],
      sourceSyllabus: (req.body.sourceSyllabus || '').trim(),
    });
    res.json({ success: true, message: 'Topic created.', data: { topic: doc } });
  } catch (e) {
    if (e.code === 11000)
      return res.status(409).json({ success: false, message: 'A topic with that name already exists for this subject.' });
    console.error('[syllabus POST topic]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── PATCH /api/syllabus/topic/:id ──────────────────────────
// Update a topic's own fields and/or replace its subtopics.
router.patch('/topic/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const update = {};
    if (typeof req.body.topic === 'string')      update.topic = req.body.topic.trim();
    if (typeof req.body.code === 'string')       update.code = req.body.code.trim();
    if (typeof req.body.topicOrder === 'number') update.topicOrder = req.body.topicOrder;
    if (typeof req.body.isActive === 'boolean')  update.isActive = req.body.isActive;
    if (typeof req.body.sourceSyllabus === 'string') update.sourceSyllabus = req.body.sourceSyllabus.trim();
    if (Array.isArray(req.body.subtopics))       update.subtopics = req.body.subtopics;

    const doc = await SyllabusTopic.findByIdAndUpdate(
      req.params.id, update, { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Topic not found.' });
    res.json({ success: true, message: 'Topic updated.', data: { topic: doc } });
  } catch (e) {
    if (e.code === 11000)
      return res.status(409).json({ success: false, message: 'A topic with that name already exists for this subject.' });
    console.error('[syllabus PATCH topic]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── DELETE /api/syllabus/topic/:id ─────────────────────────
router.delete('/topic/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const doc = await SyllabusTopic.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Topic not found.' });
    res.json({ success: true, message: 'Topic deleted.' });
  } catch (e) {
    console.error('[syllabus DELETE topic]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── PATCH /api/syllabus/reorder ────────────────────────────
// Bulk-set topicOrder. Body: { order: [topicId, topicId, ...] }
router.patch('/reorder', auth, requireRole('admin'), async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order))
      return res.status(400).json({ success: false, message: 'order must be an array of topic ids.' });
    await Promise.all(order.map((id, idx) =>
      SyllabusTopic.findByIdAndUpdate(id, { topicOrder: idx })
    ));
    res.json({ success: true, message: 'Order updated.' });
  } catch (e) {
    console.error('[syllabus reorder]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── POST /api/syllabus/bulk ────────────────────────────────
// Replace the ENTIRE spine for a subject in one call. Used to
// load a verified syllabus structure. Body: { subjectId, topics }
// where topics = [{ topic, code, subtopics:[...] }, ...]
router.post('/bulk', auth, requireRole('admin'), async (req, res) => {
  try {
    const { subjectId, topics, sourceSyllabus } = req.body;
    if (!subjectId || !Array.isArray(topics))
      return res.status(400).json({ success: false, message: 'subjectId and topics[] are required.' });

    const subject = await Subject.findById(subjectId).lean();
    if (!subject)
      return res.status(404).json({ success: false, message: 'Subject not found.' });

    // Replace: remove existing spine for this subject, then insert fresh
    await SyllabusTopic.deleteMany({ subjectId });

    const docs = topics.map((t, i) => ({
      subjectId,
      curriculum:  subject.curriculum || '',
      subjectName: subject.subjectName || subject.name || '',
      topic: (t.topic || '').trim(),
      code: (t.code || '').trim(),
      topicOrder: typeof t.topicOrder === 'number' ? t.topicOrder : i,
      sourceSyllabus: (sourceSyllabus || t.sourceSyllabus || '').trim(),
      subtopics: (Array.isArray(t.subtopics) ? t.subtopics : []).map((s, j) => ({
        name: (s.name || '').trim(),
        code: (s.code || '').trim(),
        subOrder: typeof s.subOrder === 'number' ? s.subOrder : j,
        suggestedLessons: typeof s.suggestedLessons === 'number' ? s.suggestedLessons : 1,
        objectives: Array.isArray(s.objectives) ? s.objectives : [],
      })),
    })).filter(d => d.topic);

    const created = await SyllabusTopic.insertMany(docs);
    res.json({ success: true, message: `Loaded ${created.length} topics.`, data: { count: created.length } });
  } catch (e) {
    console.error('[syllabus bulk]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
