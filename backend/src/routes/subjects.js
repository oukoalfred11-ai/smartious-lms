const router = require('express').Router();
const Subject = require('../models/Subject');
const { auth, requireRole } = require('../middleware/auth');

// GET all subjects, optionally filtered by curriculum.
// By default returns only Active subjects (correct for student/teacher
// dropdowns and lesson/question forms). Pass ?includeInactive=true to
// also return deactivated subjects (used by the admin Subjects UI so
// admins can see and reactivate them).
router.get('/', async (req, res) => {
  try {
    const { curriculum, includeInactive } = req.query;
    const filter = {};
    if (curriculum) filter.curriculum = curriculum;
    if (includeInactive !== 'true') filter.isActive = true;

    const subjects = await Subject.find(filter)
      .sort('subjectName')
      .lean();

    res.json({ success: true, subjects });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET subjects grouped by curriculum (for dropdowns)
router.get('/by-curriculum', async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true })
      .select('curriculum subjectName category code')
      .lean();
    
    // Group by curriculum
    const grouped = {};
    subjects.forEach(subject => {
      if (!grouped[subject.curriculum]) {
        grouped[subject.curriculum] = [];
      }
      grouped[subject.curriculum].push(subject);
    });
    
    res.json({ success: true, subjectsByProgramme: grouped });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET subjects for a specific curriculum
router.get('/curriculum/:curriculum', async (req, res) => {
  try {
    const { curriculum } = req.params;
    
    const subjects = await Subject.find({
      curriculum: { $regex: new RegExp(`^${curriculum}$`, 'i') },
      isActive: true
    })
      .select('_id subjectName category code')
      .sort('subjectName')
      .lean();
    
    res.json({ success: true, subjects, curriculum });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// CREATE new subject (admin only) — "Quick Add" feature
router.post('/', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    const { curriculum, subjectName, category, code } = req.body;
    
    // Validate required fields
    if (!curriculum || !subjectName || !category) {
      return res.status(400).json({
        success: false,
        message: 'curriculum, subjectName, and category are required'
      });
    }
    
    // Check if subject already exists for this curriculum
    const existing = await Subject.findOne({
      curriculum,
      subjectName: { $regex: new RegExp(`^${subjectName}$`, 'i') }
    });
    
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Subject "${subjectName}" already exists for ${curriculum}`
      });
    }
    
    // Create new subject
    const subject = await Subject.create({
      curriculum,
      subjectName: subjectName.trim(),
      category: category.trim(),
      code: code ? code.trim() : undefined,
      isActive: true
    });
    
    console.log(`✓ Subject created: ${subjectName} (${curriculum})`);
    res.status(201).json({ success: true, subject });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// UPDATE subject (admin only)
router.patch('/:id', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    // Only apply the fields actually sent. Passing the whole object meant
    // a request carrying just { isActive:false } also wrote subjectName,
    // category and code as undefined — deactivating a subject wiped its
    // name.
    const patch = {};
    ['subjectName', 'category', 'code', 'isActive'].forEach(k => {
      if (k in req.body) patch[k] = req.body[k];
    });
    if (!Object.keys(patch).length) {
      return res.status(400).json({ success: false, message: 'Nothing to update.' });
    }

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { $set: patch },
      { new: true, runValidators: true }
    );
    
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    
    console.log(`✓ Subject updated: ${subject.subjectName}`);
    res.json({ success: true, subject });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
// DUPLICATE SUBJECT CLEANUP
//
// The catalogue accumulated the same subject twice under one
// curriculum — "Primary Mathematics" alongside "Mathematics",
// "Art & Design" alongside "Art and Design", and so on. Only one of
// each pair carries the syllabus spine, so the teacher-facing
// "does this subject have a spine?" check can resolve to the empty
// twin and report a loaded subject as unavailable.
//
// Nothing is hard-deleted. A duplicate is DEACTIVATED (isActive:false),
// which hides it everywhere and is reversible with one PATCH. A record
// with any dependent data is never touched, whatever the caller asks.
// ═══════════════════════════════════════════════════════════

/**
 * Normalise a subject name for duplicate detection.
 * "Primary Mathematics", "Mathematics" and "MATHEMATICS " all collapse
 * to the same key; so do "Art & Design" and "Art and Design".
 */
function dupKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, ' ')          // drop "(ESL)", "(Kiswahili)"
    .replace(/^primary\s+/, '')
    .replace(/^lower\s+secondary\s+/, '')
    .replace(/\s*&\s*/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Count every record that depends on a Subject. */
async function subjectUsage(subject) {
  const id = subject._id;
  const name = subject.subjectName;
  const safe = async (fn) => { try { return await fn(); } catch { return 0; } };

  const [topics, lessons, allocations, timetable, books, progress, sProgress, questions, users] =
    await Promise.all([
      safe(() => require('../models/SyllabusTopic').countDocuments({ subjectId: id })),
      safe(() => require('../models/Lesson').countDocuments({ subjectId: id })),
      safe(() => require('../models/Allocation').countDocuments({ subjectId: id })),
      safe(() => require('../models/TimetableEntry').countDocuments({ subjectId: id })),
      safe(() => require('../models/LibraryBook').countDocuments({ subjectId: id })),
      safe(() => require('../models/LessonProgress').countDocuments({ subjectId: id })),
      safe(() => require('../models/StudentSyllabusProgress').countDocuments({ subjectId: id })),
      // Question stores the subject NAME, not an id, so it is matched
      // by name and curriculum rather than by reference.
      safe(() => require('../models/Question').countDocuments({
        subject: name, curriculum: subject.curriculum,
      })),
      safe(() => require('../models/User').countDocuments({
        'teachingSpecialties.subjectId': id,
      })),
    ]);

  const total = topics + lessons + allocations + timetable + books + progress + sProgress + questions + users;
  return { topics, lessons, allocations, timetable, books, progress, sProgress, questions, users, total };
}

// ── GET /api/subjects/duplicates — dry run, changes nothing ──
router.get('/duplicates', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: { $ne: false } })
      .select('subjectName curriculum').lean();

    const groups = {};
    subjects.forEach(s => {
      const k = s.curriculum + '::' + dupKey(s.subjectName);
      (groups[k] = groups[k] || []).push(s);
    });

    const dupes = Object.entries(groups).filter(([, arr]) => arr.length > 1);
    const report = [];

    for (const [key, arr] of dupes) {
      const withUsage = [];
      for (const s of arr) withUsage.push({ ...s, usage: await subjectUsage(s) });
      // Keep the one carrying the most data; if tied, the longest name,
      // which is the more specific ("Primary Mathematics" over "Mathematics").
      withUsage.sort((a, b) =>
        b.usage.total - a.usage.total ||
        b.subjectName.length - a.subjectName.length);
      const [keep, ...rest] = withUsage;
      report.push({
        curriculum: key.split('::')[0],
        key: key.split('::')[1],
        keep: { _id: keep._id, subjectName: keep.subjectName, usage: keep.usage },
        deactivate: rest.map(r => ({
          _id: r._id,
          subjectName: r.subjectName,
          usage: r.usage,
          safe: r.usage.total === 0,
        })),
      });
    }

    const canDeactivate = report.reduce((n, g) => n + g.deactivate.filter(d => d.safe).length, 0);
    const blocked = report.reduce((n, g) => n + g.deactivate.filter(d => !d.safe).length, 0);

    return res.json({
      success: true,
      data: { groups: report, groupCount: report.length, canDeactivate, blocked },
      message: `${report.length} duplicate group(s). ${canDeactivate} empty duplicate(s) can be `
             + `deactivated safely; ${blocked} hold data and will be left alone.`,
    });
  } catch (e) {
    console.error('[subjects/duplicates]', e.message);
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ── POST /api/subjects/duplicates/resolve — deactivates the empty ones ──
router.post('/duplicates/resolve', auth, requireRole('admin'), async (req, res) => {
  try {
    if (req.body?.confirm !== true) {
      return res.status(400).json({
        success: false,
        message: 'Send { "confirm": true } to proceed. Run GET /api/subjects/duplicates first.',
      });
    }

    const subjects = await Subject.find({ isActive: { $ne: false } })
      .select('subjectName curriculum').lean();
    const groups = {};
    subjects.forEach(s => {
      const k = s.curriculum + '::' + dupKey(s.subjectName);
      (groups[k] = groups[k] || []).push(s);
    });

    const deactivated = [], skipped = [];
    for (const [, arr] of Object.entries(groups).filter(([, a]) => a.length > 1)) {
      const withUsage = [];
      for (const s of arr) withUsage.push({ ...s, usage: await subjectUsage(s) });
      withUsage.sort((a, b) =>
        b.usage.total - a.usage.total ||
        b.subjectName.length - a.subjectName.length);
      const [, ...rest] = withUsage;
      for (const r of rest) {
        if (r.usage.total > 0) {
          // Never touch a record with data, whatever was asked.
          skipped.push({ subjectName: r.subjectName, curriculum: r.curriculum, usage: r.usage });
          continue;
        }
        await Subject.findByIdAndUpdate(r._id, { $set: { isActive: false } });
        deactivated.push({ _id: r._id, subjectName: r.subjectName, curriculum: r.curriculum });
      }
    }

    console.log(`[subjects] deactivated ${deactivated.length} duplicate(s) by ${req.user.email}`);
    return res.json({
      success: true,
      data: { deactivated, skipped },
      message: `Deactivated ${deactivated.length} empty duplicate(s). `
             + `${skipped.length} left alone because they hold data. `
             + `Reversible: PATCH the subject with { "isActive": true }.`,
    });
  } catch (e) {
    console.error('[subjects/duplicates/resolve]', e.message);
    return res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE subject (admin only)
router.delete('/:id', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Subject deletion is disabled. Use PATCH with isActive: false to deactivate. ' +
             'Hard-deleting a Subject would orphan Lesson, SyllabusTopic, Allocation, and ' +
             'Question records that reference it.'
  });
});

module.exports = router;
