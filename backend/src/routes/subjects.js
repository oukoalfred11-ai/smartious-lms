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
  // Parentheses are NOT stripped.
  //
  // An earlier version dropped them, which collapsed
  //   "Language Acquisition (French)" / "(Mandarin)" / "(Spanish)"
  // into one key and wrongly deactivated two real subjects. The same
  // fault would have merged "Arts (Drama)" with "Arts (Music)". A
  // parenthetical almost always DISTINGUISHES a subject rather than
  // decorating it, so it is now part of the identity.
  //
  // Only the level prefix and the &/and spelling are normalised —
  // both are genuine spelling variants of one subject.
  return String(name || '')
    .toLowerCase()
    .replace(/^primary\s+/, '')
    .replace(/^lower\s+secondary\s+/, '')
    .replace(/\s*&\s*/g, ' and ')
    .replace(/[^a-z0-9()]+/g, ' ')
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
      // Survivor choice, in order:
      //   1. most data  — never strand records that are in use
      //   2. in the CATALOGUE — the name the enrolment form offers is what
      //      teachers and students actually see
      //   3. SHORTER name — "Science" over "Lower Secondary Science"
      //
      // The old tiebreak preferred the LONGER name, which is how
      // "Lower Secondary Science" survived and the catalogue-standard
      // "Science" was deactivated. Length is not evidence of correctness.
      withUsage.sort((a, b) =>
        b.usage.total - a.usage.total ||
        (catalogueHas(b) ? 1 : 0) - (catalogueHas(a) ? 1 : 0) ||
        a.subjectName.length - b.subjectName.length);
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

/**
 * Is this subject name offered by the curriculum catalogue?
 *
 * When two records hold the same subject, the one the enrolment form
 * offers should survive — that is the name a student is registered under
 * and a teacher sees on their timetable.
 *
 * Returns false if the catalogue cannot be read, so the sort degrades to
 * the shorter-name rule rather than throwing mid-resolve.
 */
function catalogueHas(subject) {
  try {
    const { SUBJECTS } = require('./curriculum');
    if (!Array.isArray(SUBJECTS)) return false;
    const name = String(subject.subjectName || '').trim().toLowerCase();
    return SUBJECTS.some(c =>
      String(c.name || '').trim().toLowerCase() === name &&
      (c.availableIn === 'all' ||
       (Array.isArray(c.availableIn) && c.availableIn.includes(subject.curriculum))));
  } catch (e) {
    return false;
  }
}

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
      // Survivor choice, in order:
      //   1. most data  — never strand records that are in use
      //   2. in the CATALOGUE — the name the enrolment form offers is what
      //      teachers and students actually see
      //   3. SHORTER name — "Science" over "Lower Secondary Science"
      //
      // The old tiebreak preferred the LONGER name, which is how
      // "Lower Secondary Science" survived and the catalogue-standard
      // "Science" was deactivated. Length is not evidence of correctness.
      withUsage.sort((a, b) =>
        b.usage.total - a.usage.total ||
        (catalogueHas(b) ? 1 : 0) - (catalogueHas(a) ? 1 : 0) ||
        a.subjectName.length - b.subjectName.length);
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

// ═══════════════════════════════════════════════════════════
// POST /api/subjects/merge
// Move everything from one Subject onto another, then deactivate the
// source. Needed where BOTH records hold data and neither can simply
// be switched off — for example Cambridge Primary, where the syllabus
// spine sits on "Primary Mathematics" while 1,098 questions are filed
// under "Mathematics". Split like that, questions cannot be placed on
// a lesson and the subject reads as having no spine.
//
// Body: { fromId, toId, confirm: true }
// ═══════════════════════════════════════════════════════════
router.post('/merge', auth, requireRole('admin'), async (req, res) => {
  try {
    const { fromId, toId, confirm } = req.body || {};
    if (confirm !== true)
      return res.status(400).json({ success:false, message:'Send { "confirm": true } to proceed.' });
    if (!fromId || !toId || String(fromId) === String(toId))
      return res.status(400).json({ success:false, message:'fromId and toId must both be given and differ.' });

    const [from, to] = await Promise.all([Subject.findById(fromId), Subject.findById(toId)]);
    if (!from || !to) return res.status(404).json({ success:false, message:'Subject not found.' });
    if (from.curriculum !== to.curriculum)
      return res.status(400).json({
        success:false,
        message:`Refusing to merge across curricula (${from.curriculum} into ${to.curriculum}).`,
      });

    const moved = {};
    const move = async (modelName, filter, update, opts) => {
      try {
        const M = require('../models/' + modelName);
        const r = await M.updateMany(filter, update, opts || {});
        moved[modelName] = r.modifiedCount ?? r.nModified ?? 0;
      } catch (err) {
        console.error(`[subjects/merge] ${modelName}:`, err.message);
        moved[modelName] = 0;
      }
    };

    // Records that reference the Subject by id.
    for (const m of ['SyllabusTopic','Lesson','Allocation','TimetableEntry',
                     'LibraryBook','LessonProgress','StudentSyllabusProgress']) {
      await move(m, { subjectId: from._id }, { $set: { subjectId: to._id } });
    }

    // Question stores the subject NAME, so it is re-tagged by name.
    await move('Question',
      { subject: from.subjectName, curriculum: from.curriculum },
      { $set: { subject: to.subjectName } });

    // Teachers' specialties point at the id.
    // The positional filtered operator needs arrayFilters, or Mongo
    // rejects the update outright.
    await move('User',
      { 'teachingSpecialties.subjectId': from._id },
      { $set: { 'teachingSpecialties.$[el].subjectId': to._id } },
      { arrayFilters: [{ 'el.subjectId': from._id }] });

    from.isActive = false;
    await from.save();

    const total = Object.values(moved).reduce((a, b) => a + b, 0);
    console.log(`[subjects] merged "${from.subjectName}" into "${to.subjectName}" `
              + `(${total} records) by ${req.user.email}`);

    return res.json({
      success: true,
      data: { from: from.subjectName, to: to.subjectName, moved, total },
      message: `Moved ${total} record(s) from "${from.subjectName}" to "${to.subjectName}" `
             + `and deactivated the source. Reload the spine check to confirm.`,
    });
  } catch (e) {
    console.error('[subjects/merge]', e.message);
    return res.status(500).json({ success:false, message:e.message });
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
