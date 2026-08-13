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
router.post('/topic', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
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
router.patch('/topic/:id', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
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
router.delete('/topic/:id', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
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
router.patch('/reorder', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
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
/**
 * Vocabulary that identifies a subject from its topic text.
 *
 * Used to catch a spine being loaded onto the wrong subject. A Physics
 * scheme was once written over Cambridge IGCSE Biology, orphaning 1,504
 * questions, and nothing in this route noticed: it accepted any topics[]
 * for any subjectId.
 *
 * Deliberately loose. It only has to spot a gross mismatch — Physics
 * content arriving at a Biology record — not police wording.
 */
const SUBJECT_VOCAB = {
  biology:   /\b(cell|enzyme|photosynth|osmosis|respirat|organism|genetic|ecosystem|digest|nutrition|classif|reproduc|inherit|homeostas|pathogen|immun)\b/i,
  chemistry: /\b(atom|mole|acid|alkali|salt|electrolys|periodic|bonding|reaction rate|organic|hydrocarbon|titrat)\b/i,
  physics:   /\b(motion|force|energy|momentum|thermal|wave|electric|magnet|nuclear|radioact|circuit|optic|pressure)\b/i,
  mathematics: /\b(number|algebra|geometr|trigonom|statistic|probabilit|fraction|equation|vector|mensurat)\b/i,
  economics: /\b(demand|supply|market|inflation|unemploy|fiscal|monetary|trade|elasticit|gdp|scarcit)\b/i,
};

/**
 * Does this spine look like it belongs to this subject?
 * Returns null when there is no opinion, or { expected, looksLike }.
 */
function detectSpineMismatch(subjectName, topics) {
  const key = Object.keys(SUBJECT_VOCAB)
    .find(k => String(subjectName || '').toLowerCase().includes(k));
  if (!key) return null;                       // subject not covered — no opinion

  const text = (topics || [])
    .map(t => [t.topic, ...(t.subtopics || []).map(s => s.name)].join(' '))
    .join(' ');

  const scores = Object.entries(SUBJECT_VOCAB).map(([k, re]) => {
    const m = text.match(new RegExp(re.source, 'gi'));
    return [k, m ? m.length : 0];
  }).sort((a, b) => b[1] - a[1]);

  const [topKey, topScore] = scores[0];
  const ownScore = (scores.find(x => x[0] === key) || [key, 0])[1];

  // Flag only a clear win for another subject.
  if (topKey !== key && topScore >= 3 && topScore > ownScore * 2) {
    return { expected: key, looksLike: topKey, expectedHits: ownScore, actualHits: topScore };
  }
  return null;
}

router.post('/bulk', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    const { subjectId, topics, sourceSyllabus } = req.body;
    if (!subjectId || !Array.isArray(topics))
      return res.status(400).json({ success: false, message: 'subjectId and topics[] are required.' });

    const subject = await Subject.findById(subjectId).lean();
    if (!subject)
      return res.status(404).json({ success: false, message: 'Subject not found.' });

    // ── GUARD 1: is this spine even about this subject? ──────────
    const mismatch = detectSpineMismatch(subject.subjectName, topics);
    if (mismatch && req.body.overrideSubjectCheck !== true) {
      return res.status(409).json({
        success: false,
        code: 'SUBJECT_MISMATCH',
        message: `This spine reads like ${mismatch.looksLike.toUpperCase()} content, but you are `
               + `loading it onto ${subject.subjectName}. Loading it would replace the existing `
               + `spine. If this is deliberate, resend with overrideSubjectCheck: true.`,
        data: mismatch,
      });
    }

    // ── GUARD 2: what would this destroy? ────────────────────────
    const existing = await SyllabusTopic.find({ subjectId }).select('topic subtopics').lean();
    const existingLessons = existing.reduce((n, t) => n + ((t.subtopics || []).length), 0);

    // Questions reference subtopics by NAME, so a replacement that drops
    // a name orphans every question filed under it.
    let orphaned = 0, orphanSample = [];
    if (existing.length) {
      try {
        const Question = require('../models/Question');
        const incoming = new Set();
        topics.forEach(t => (t.subtopics || []).forEach(s => incoming.add((s.name || '').trim())));
        const losing = [];
        existing.forEach(t => (t.subtopics || []).forEach(s => {
          if (!incoming.has((s.name || '').trim())) losing.push(s.name);
        }));
        if (losing.length) {
          orphaned = await Question.countDocuments({
            subject: subject.subjectName,
            curriculum: subject.curriculum,
            subtopic: { $in: losing },
          });
          orphanSample = losing.slice(0, 5);
        }
      } catch (e) { /* counting must never block a legitimate load */ }
    }

    if (orphaned > 0 && req.body.acceptOrphans !== true) {
      return res.status(409).json({
        success: false,
        code: 'WOULD_ORPHAN_QUESTIONS',
        message: `This would replace ${existing.length} topic(s) / ${existingLessons} lesson(s) and `
               + `orphan ${orphaned} question(s) whose subtopics do not exist in the new spine. `
               + `Those questions would no longer link to any lesson. To proceed anyway, resend `
               + `with acceptOrphans: true.`,
        data: { existingTopics: existing.length, existingLessons, orphaned, sampleLostSubtopics: orphanSample },
      });
    }

    // ── GUARD 3: keep a copy before deleting ─────────────────────
    // The old route deleted the spine with no backup. A wrong load was
    // therefore unrecoverable except by rebuilding it by hand.
    let backupId = null;
    if (existing.length) {
      try {
        const SpineBackup = require('../models/SpineBackup');
        const b = await SpineBackup.create({
          subjectId,
          subjectName: subject.subjectName,
          curriculum: subject.curriculum,
          topics: await SyllabusTopic.find({ subjectId }).lean(),
          replacedBy: req.user._id,
          reason: sourceSyllabus || 'bulk load',
        });
        backupId = b._id;
      } catch (e) {
        console.error('[syllabus bulk] backup failed:', e.message);
        return res.status(500).json({
          success: false,
          message: 'Could not back up the existing spine, so the replacement was cancelled. '
                 + 'Nothing has been changed.',
        });
      }
    }

    console.log(`[syllabus bulk] ${subject.curriculum}/${subject.subjectName}: `
              + `replacing ${existing.length} topics (${existingLessons} lessons) with ${topics.length} `
              + `by ${req.user.email}${backupId ? ' — backup ' + backupId : ''}`);

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
    const newLessons = docs.reduce((n, d) => n + d.subtopics.length, 0);
    res.json({
      success: true,
      message: `Loaded ${created.length} topics (${newLessons} lessons) onto ${subject.subjectName}.`
             + (backupId ? ` Previous spine backed up — restore with POST /api/syllabus/restore/${backupId}.` : ''),
      data: { count: created.length, lessons: newLessons, replaced: existing.length, backupId },
    });
  } catch (e) {
    console.error('[syllabus bulk]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /api/syllabus/backups/:subjectId
// Every snapshot taken before a spine was replaced, newest first.
// ═══════════════════════════════════════════════════════════
router.get('/backups/:subjectId', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    const SpineBackup = require('../models/SpineBackup');
    const rows = await SpineBackup.find({ subjectId: req.params.subjectId })
      .populate('replacedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: {
        backups: rows.map(b => ({
          _id: b._id,
          subjectName: b.subjectName,
          curriculum: b.curriculum,
          topics: (b.topics || []).length,
          lessons: (b.topics || []).reduce((n, t) => n + ((t.subtopics || []).length), 0),
          reason: b.reason,
          replacedBy: b.replacedBy
            ? [b.replacedBy.firstName, b.replacedBy.lastName].filter(Boolean).join(' ')
            : '',
          createdAt: b.createdAt,
          restoredAt: b.restoredAt,
          // First few topic names, so the right snapshot is recognisable
          // without downloading the whole payload.
          sampleTopics: (b.topics || []).slice(0, 4).map(t => t.topic),
        })),
      },
      message: `${rows.length} backup(s).`,
    });
  } catch (e) {
    console.error('[syllabus backups]', e.message);
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/syllabus/restore/:backupId
// Put a snapshot back. Backs up the current spine first, so a restore
// is itself reversible.
// ═══════════════════════════════════════════════════════════
router.post('/restore/:backupId', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    const SpineBackup = require('../models/SpineBackup');
    const backup = await SpineBackup.findById(req.params.backupId).lean();
    if (!backup) return res.status(404).json({ success: false, message: 'Backup not found.' });

    const subject = await Subject.findById(backup.subjectId).lean();
    if (!subject) return res.status(404).json({ success: false, message: 'Subject no longer exists.' });

    // Snapshot what is there now, so this restore can also be undone.
    const current = await SyllabusTopic.find({ subjectId: backup.subjectId }).lean();
    if (current.length) {
      await SpineBackup.create({
        subjectId: backup.subjectId,
        subjectName: subject.subjectName,
        curriculum: subject.curriculum,
        topics: current,
        replacedBy: req.user._id,
        reason: `superseded by restore of ${backup._id}`,
      });
    }

    await SyllabusTopic.deleteMany({ subjectId: backup.subjectId });

    // Strip _id so Mongo issues fresh ones rather than colliding.
    const docs = (backup.topics || []).map(({ _id, __v, ...rest }) => rest);
    const created = docs.length ? await SyllabusTopic.insertMany(docs) : [];

    await SpineBackup.findByIdAndUpdate(backup._id, {
      $set: { restoredAt: new Date(), restoredBy: req.user._id },
    });

    const lessons = docs.reduce((n, d) => n + ((d.subtopics || []).length), 0);
    console.log(`[syllabus restore] ${subject.subjectName}: ${created.length} topics restored by ${req.user.email}`);

    return res.json({
      success: true,
      data: { topics: created.length, lessons },
      message: `Restored ${created.length} topic(s) / ${lessons} lesson(s) to ${subject.subjectName}.`,
    });
  } catch (e) {
    console.error('[syllabus restore]', e.message);
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /api/syllabus/export/:subjectId
// Dump a live spine as a pasteable spineData.js block.
//
// Physics (79 lessons) and Economics (83) exist only in the database —
// the code has 38 and 39. Anyone pressing "Load IGCSE spine" on those
// would silently halve them. Exporting brings code and production back
// into line so a reload is harmless.
// ═══════════════════════════════════════════════════════════
router.get('/export/:subjectId', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId).lean();
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });

    const topics = await SyllabusTopic.find({ subjectId: req.params.subjectId })
      .sort({ topicOrder: 1 }).lean();
    if (!topics.length)
      return res.status(404).json({ success: false, message: 'This subject has no spine to export.' });

    const constName = (subject.curriculum + '_' + subject.subjectName)
      .toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');

    const lessons = topics.reduce((n, t) => n + ((t.subtopics || []).length), 0);
    const q = (v) => "'" + String(v || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";

    const body = topics.map(t =>
      '  { topic: ' + q(t.topic) + (t.code ? ', code: ' + q(t.code) : '') + ',\n' +
      '    subtopics: [\n' +
      (t.subtopics || []).map(s =>
        '      { name: ' + q(s.name) + (s.code ? ', code: ' + q(s.code) : '') + ' },'
      ).join('\n') +
      '\n    ] },'
    ).join('\n');

    const js =
      '// ' + subject.curriculum + ' · ' + subject.subjectName + '\n' +
      '// Exported from the live database on ' + new Date().toISOString().slice(0, 10) + '\n' +
      '// ' + topics.length + ' topics, ' + lessons + ' lessons\n' +
      'export const ' + constName + ' = [\n' + body + '\n]\n';

    return res.json({
      success: true,
      data: { constName, topics: topics.length, lessons, js },
      message: `Exported ${topics.length} topics / ${lessons} lessons as ${constName}.`,
    });
  } catch (e) {
    console.error('[syllabus export]', e.message);
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /api/syllabus/audit
// Runs the mismatch detector across EVERY loaded spine.
//
// Two wrong spines were found by hand — Physics content on Cambridge
// IGCSE Biology, and Mathematics content on both Accounting and
// Additional Mathematics. Each was discovered by chance. This checks
// all of them at once, and also flags the pattern that gave the game
// away both times: two subjects sharing an identical spine shape.
// ═══════════════════════════════════════════════════════════
router.get('/audit', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: { $ne: false } })
      .select('subjectName curriculum').lean();

    const all = await SyllabusTopic.find({ isActive: { $ne: false } })
      .select('subjectId topic subtopics').lean();

    const bySubject = {};
    all.forEach(t => { (bySubject[String(t.subjectId)] = bySubject[String(t.subjectId)] || []).push(t); });

    const loaded = subjects
      .filter(s => (bySubject[String(s._id)] || []).length)
      .map(s => {
        const topics = bySubject[String(s._id)];
        return {
          _id: s._id,
          subjectName: s.subjectName,
          curriculum: s.curriculum,
          topics,
          topicCount: topics.length,
          lessonCount: topics.reduce((n, t) => n + ((t.subtopics || []).length), 0),
        };
      });

    // 1. Content that reads like another subject.
    const mismatches = [];
    loaded.forEach(s => {
      const m = detectSpineMismatch(s.subjectName, s.topics);
      if (m) mismatches.push({
        curriculum: s.curriculum, subject: s.subjectName,
        looksLike: m.looksLike, ownHits: m.expectedHits, otherHits: m.actualHits,
        sampleTopics: s.topics.slice(0, 4).map(t => t.topic),
      });
    });

    // 2. Identical spines on different subjects. This is what exposed
    //    both real cases: Biology matched Physics exactly, and
    //    Accounting matched Additional Mathematics exactly.
    const sig = {};
    loaded.forEach(s => {
      const key = s.topics.map(t => t.topic).sort().join('|');
      (sig[key] = sig[key] || []).push(`${s.curriculum} ${s.subjectName}`);
    });
    const shared = Object.values(sig)
      .filter(v => v.length > 1)
      .map(v => ({ subjects: v, note: 'identical topic list — intended only where one scheme serves two boards' }));

    // 3. Spines too thin to place a question on a lesson.
    const thin = loaded
      .filter(s => s.lessonCount > 0 && s.lessonCount < 20)
      .map(s => ({ curriculum: s.curriculum, subject: s.subjectName,
                   topics: s.topicCount, lessons: s.lessonCount }));

    // 4. Topics carrying no subtopics at all — a question cannot be filed there.
    const emptyTopics = [];
    loaded.forEach(s => {
      const empties = s.topics.filter(t => !(t.subtopics || []).length).map(t => t.topic);
      if (empties.length) emptyTopics.push({
        curriculum: s.curriculum, subject: s.subjectName,
        count: empties.length, sample: empties.slice(0, 3),
      });
    });

    return res.json({
      success: true,
      data: {
        checked: loaded.length,
        mismatches, sharedSpines: shared, thinSpines: thin, emptyTopics,
      },
      message: `Checked ${loaded.length} loaded spine(s). `
             + `${mismatches.length} look like another subject; `
             + `${shared.length} group(s) share an identical topic list; `
             + `${thin.length} are thinner than 20 lessons.`,
    });
  } catch (e) {
    console.error('[syllabus audit]', e.message);
    return res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
