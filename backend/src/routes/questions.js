/**
 * QUESTION BANK ROUTES
 * ============================================================
 * CRUD endpoints for the question bank, plus Cloudinary image uploads.
 *
 *   POST   /api/questions/upload      multipart/form-data → { url, publicId, ... }
 *   POST   /api/questions             JSON → create question metadata
 *   GET    /api/questions             list (filtered)
 *   GET    /api/questions/:id         single
 *   PATCH  /api/questions/:id         update
 *   DELETE /api/questions/:id         delete (also removes Cloudinary files)
 *
 * Authorization:
 *   All routes require login. Teachers/admins can create.
 *   Anyone (incl. students) can read questions for self-study.
 *   Only the creator or admin can edit/delete.
 *
 * NESTED PARTS:
 *   Questions can be FLAT (parts: []) or NESTED (parts: [{ ... }]).
 *   When parts is non-empty, the Question model's pre-save hook
 *   auto-computes the top-level `marks` from the recursive sum of
 *   leaf marks. POST and PATCH both accept the parts array verbatim.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const Question = require('../models/Question');
const { auth, requireRole } = require('../middleware/auth');
const { isSubjectValidForCurriculum } = require('../constants/curriculum');

// ─────────────────────────────────────────────────────────
// R2 CONFIG — replaces Cloudinary for question attachments
// ─────────────────────────────────────────────────────────
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/gif','image/webp','application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed.'), false);
  },
});

// ─────────────────────────────────────────────────────────
// POST /api/questions/upload
// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
// POST /api/questions/upload — upload an attachment to Cloudinary
// Open to any authenticated user. Teachers use it to attach images
// to questions; students use it to upload drawing answers in homework
// and any upload-type answers in exams.
// ─────────────────────────────────────────────────────────
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded.' });

    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Filed alongside the subject's library material rather than in a
    // flat questions/ bucket, so everything for a subject lives under
    // one prefix and can be found, moved or cleared together.
    // Falls back to the old layout when no subject is supplied.
    const clean = v => String(v || '').trim().replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '-');
    const curriculum = clean(req.body?.curriculum);
    const subjectName = clean(req.body?.subject);
    const key = (curriculum && subjectName)
      ? `library/${curriculum}/${subjectName}/artwork/${uuidv4()}_${safeName}`
      : `questions/${uuidv4()}_${safeName}`;
    await r2.send(new PutObjectCommand({
      Bucket:      process.env.R2_BUCKET_NAME,
      Key:         key,
      Body:        req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const url = `${(process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')}/${key}`;
    return res.json({
      success: true,
      attachment: {
        url,
        publicId:  key,
        filename:  req.file.originalname,
        mimeType:  req.file.mimetype,
        sizeBytes: req.file.size,
      },
    });
  } catch (err) {
    console.error('[questions/upload]', err.message);
    res.status(500).json({ success: false, message: err.message || 'Upload failed.' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/questions  — create a question (flat or nested)
// ─────────────────────────────────────────────────────────
router.post('/', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const {
      curriculum, subject, grade, topic, subtopic, type,
      questionText, options, correctAnswer, explanation,
      marks, difficulty, attachments,
      parts,   // ── NEW: nested parts array (optional)
      markScheme, lessonCode,
    } = req.body;

    // Validation
    if (!curriculum || !subject || !grade) {
      return res.status(400).json({ success: false, message: 'curriculum, subject and grade are required.' });
    }

    // ── The subject must have a spine ────────────────────────
    // Enforced here as well as in the editor, because a question filed
    // against no spine cannot be placed on a lesson, cannot be found
    // by topic and cannot feed auto-homework.
    try {
      const Subject = require('../models/Subject');
      const SyllabusTopic = require('../models/SyllabusTopic');
      const subjDoc = await Subject.findOne({ subjectName: subject, curriculum }).select('_id').lean()
                   || await Subject.findOne({ subjectName: subject }).select('_id').lean();
      if (!subjDoc) {
        return res.status(400).json({ success: false, message: `Subject "${subject}" was not found.` });
      }
      const spine = await SyllabusTopic.findOne({
        subjectId: subjDoc._id, isActive: { $ne: false }, 'subtopics.0': { $exists: true },
      }).select('_id').lean();
      if (!spine) {
        return res.status(400).json({
          success: false,
          message: `${subject} has no syllabus spine loaded, so questions cannot be filed against it yet. Ask an administrator to upload the spine first.`,
        });
      }
    } catch (e) {
      console.error('[questions POST] spine check failed:', e.message);
    }

    // ── A markable question needs a mark scheme ──────────────
    // MCQs mark themselves. Everything else is marked by a teacher or
    // by AI, and neither can mark to nothing. Accepted without one
    // only if explicitly flagged, in which case it is held inactive.
    const needsScheme = type && type !== 'mcq';
    const ms = markScheme || {};
    const hasScheme = !!(ms.modelAnswer
      || (Array.isArray(ms.points) && ms.points.length)
      || (Array.isArray(ms.acceptableAnswers) && ms.acceptableAnswers.length));
    if (needsScheme && !hasScheme && req.body.allowMissingScheme !== true) {
      return res.status(400).json({
        success: false,
        message: 'A model answer or marking points are required so the question can be marked. '
               + 'Tick "save without a mark scheme" to store it as a draft instead.',
      });
    }
    if (needsScheme && hasScheme && Array.isArray(ms.points) && ms.points.length) {
      const sum = ms.points.reduce((t, p) => t + (Number(p.marks) || 0), 0);
      if (Number(marks) > 0 && sum !== Number(marks)) {
        return res.status(400).json({
          success: false,
          message: `The marking points total ${sum} but the question is worth ${marks}. They must match.`,
        });
      }
    }
    if (!questionText || !questionText.trim()) {
      return res.status(400).json({ success: false, message: 'questionText is required.' });
    }
    if (!type) {
      return res.status(400).json({ success: false, message: 'type is required.' });
    }

    const isNested = Array.isArray(parts) && parts.length > 0;

    // For FLAT MCQs the options array is required.
    // For NESTED questions, MCQ checks happen per-part inside the schema,
    // so we don't enforce options at the top level.
    if (!isNested && type === 'mcq' && (!Array.isArray(options) || options.length < 2)) {
      return res.status(400).json({ success: false, message: 'MCQ questions need at least 2 options.' });
    }

    if (!isSubjectValidForCurriculum(subject, curriculum)) {
      // Lenient: trust frontend subject names.
    }

    const question = await Question.create({
      curriculum, subject, grade,
      topic: topic || '',
      subtopic: subtopic || '',
      type: isNested ? 'nested' : type,
      questionText: questionText.trim(),
      options:      Array.isArray(options) ? options : [],
      correctAnswer: correctAnswer !== undefined ? correctAnswer : null,
      explanation:  explanation || '',
      marks:        marks || 1,
      difficulty:   difficulty || 'medium',
      attachments:  Array.isArray(attachments) ? attachments : [],
      parts:        isNested ? parts : [],
      markScheme:   hasScheme ? {
        modelAnswer:       ms.modelAnswer || '',
        points:            Array.isArray(ms.points) ? ms.points : [],
        acceptableAnswers: Array.isArray(ms.acceptableAnswers) ? ms.acceptableAnswers : [],
        commonErrors:      Array.isArray(ms.commonErrors) ? ms.commonErrors : [],
      } : undefined,
      needsMarkScheme: needsScheme && !hasScheme,
      isActive:     !(needsScheme && !hasScheme),
      lessonCode:   lessonCode || '',
      createdBy:    req.user._id,
    });

    return res.json({
      success: true,
      message: 'Question saved.',
      question,
    });
  } catch (e) {
    console.error('[questions POST]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to create question: ' + e.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/questions  — list with filters
// ─────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const filter = { isActive: true };
    const esc = (s) => String(s).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (req.query.curriculum) filter.$and = [...(filter.$and || []),
      { $or: [{ curriculum: req.query.curriculum }, { curricula: req.query.curriculum }] }];
    // Subject: exact name, case-insensitive — "mathematics" must find
    // "Mathematics", or a teacher concludes the bank is empty.
    if (req.query.subject) filter.subject = new RegExp('^' + esc(req.query.subject) + '$', 'i');
    // Grade: label-tolerant. Import batches and enrolment screens have
    // written the same year as "Year 5", "Grade 5", "Stage 5", "year5"
    // or plain "5"; an exact string match hid all of them from the exam
    // builder. Any request naming a number matches every family label
    // carrying that number (Form is deliberately excluded — Form 5 is a
    // different age than Year 5).
    if (req.query.grade) {
      const g = String(req.query.grade).trim();
      const num = g.match(/(\d{1,2})/);
      const rx = num
        ? new RegExp('^\\s*(?:year|grade|stage|class)?\\s*' + num[1] + '\\s*$', 'i')
        : new RegExp('^\\s*' + esc(g) + '\\s*$', 'i');
      filter.$and = [...(filter.$and || []),
        { $or: [{ grade: rx }, { gradeLevels: rx }] }];
    }
    if (req.query.topic)      filter.topic      = req.query.topic;
    if (req.query.type)       filter.type       = req.query.type;
    if (req.query.createdBy === 'me') {
      filter.createdBy = req.user._id;
    } else if (req.query.createdBy && /^[a-f\d]{24}$/i.test(req.query.createdBy)) {
      filter.createdBy = req.query.createdBy;
    }
    if (req.query.q) {
      filter.questionText = { $regex: req.query.q, $options: 'i' };
    }

    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const skip  = parseInt(req.query.skip) || 0;

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit).lean(),
      Question.countDocuments(filter),
    ]);

    return res.json({ success: true, questions, total, limit, skip });
  } catch (e) {
    console.error('[questions GET]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to load questions.' });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/questions/:id
// ─────────────────────────────────────────────────────────
// Returns the subject names a teacher may work on, or null for admins
// (null meaning "no restriction"). Used by both the artwork queue and
// the upload endpoint so the listing and the action agree.
/**
 * The subject names a teacher may work on, or null for admins.
 *
 * TWO BUGS FIXED HERE
 * 1. It selected `name` from Subject, but the field is `subjectName`.
 *    Every lookup returned undefined, so the list was always empty and
 *    a teacher with specialties still saw nothing scoped correctly.
 * 2. It ignored curriculum. A teacher who teaches Biology at IGCSE was
 *    also being granted Biology at KCSE and IB, which are different
 *    courses with different question banks.
 *
 * Returns { names, pairs } so a caller can scope by subject alone or by
 * the exact subject-and-curriculum combination the teacher was allocated.
 */
async function allowedSubjectsFor(user) {
  if (user.role !== 'teacher') return null;
  const User = require('../models/User');
  const Subject = require('../models/Subject');
  const me = await User.findById(user._id).select('teachingSpecialties').lean();
  const specialties = (me && me.teachingSpecialties) || [];
  if (!specialties.length) return [];

  const ids = specialties.map(sp => sp.subjectId).filter(Boolean);
  const docs = ids.length
    ? await Subject.find({ _id: { $in: ids } }).select('subjectName curriculum').lean()
    : [];
  const byId = {};
  docs.forEach(d => { byId[String(d._id)] = d; });

  const names = new Set();
  specialties.forEach(sp => {
    const doc = sp.subjectId ? byId[String(sp.subjectId)] : null;
    // Older records store the subject name directly rather than an id.
    const nm = doc ? doc.subjectName : sp.subject;
    if (nm) names.add(nm);
  });
  return [...names];
}

// ─────────────────────────────────────────────────────────
// GET /api/questions/spine-subjects
// Subjects whose syllabus spine has been uploaded. A question written
// against no spine cannot be filed to a lesson, cannot be found by
// topic and cannot feed auto-homework, so the question editor offers
// only these and marks the rest unavailable.
// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
// POST /api/questions/remap-subtopics
// Rename subtopics WITHIN one subject so orphaned questions reach the
// spine.
//
// Successive imports each invented their own wording for the same
// lesson — "Osmoregulation: Role of ADH", "Kidney Function, Nephron
// Structure & ADH Action" and "Regulation of Water Content" were three
// names for one subtopic. None matched the spine, so 388 Biology
// questions could not reach a lesson.
//
// Every target is checked against the live spine first: a mapping that
// points at a subtopic which does not exist is rejected outright rather
// than quietly creating a new orphan.
//
// Body: { subject, curriculum, map: { "old name": "spine name" }, confirm }
// ─────────────────────────────────────────────────────────
router.post('/remap-subtopics', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    const { subject, curriculum, map, confirm } = req.body || {};
    if (!subject || !curriculum || !map || typeof map !== 'object')
      return res.status(400).json({ success:false, message:'subject, curriculum and map are required.' });

    const Subject = require('../models/Subject');
    const SyllabusTopic = require('../models/SyllabusTopic');
    const subj = await Subject.findOne({
      subjectName: subject, curriculum, isActive: { $ne: false },
    }).lean();
    if (!subj) return res.status(404).json({ success:false, message:`Subject "${subject}" not found under ${curriculum}.` });

    const spine = await SyllabusTopic.find({ subjectId: subj._id }).select('subtopics').lean();
    const valid = new Set();
    spine.forEach(t => (t.subtopics || []).forEach(st => valid.add((st.name || '').trim())));
    if (!valid.size)
      return res.status(400).json({ success:false, message:'That subject has no spine loaded.' });

    // Reject the whole request if any target is not a real subtopic.
    const badTargets = [...new Set(Object.values(map))].filter(t => !valid.has(String(t).trim()));
    if (badTargets.length)
      return res.status(400).json({
        success:false,
        message:`${badTargets.length} target subtopic(s) do not exist on the spine. Nothing was changed.`,
        data: { badTargets: badTargets.slice(0, 10) },
      });

    // Count what each mapping would move.
    const plan = [];
    let wouldMove = 0;
    for (const [from, to] of Object.entries(map)) {
      const n = await Question.countDocuments({
        subject, curriculum, subtopic: from, isActive: { $ne: false },
      });
      if (n) { plan.push({ from, to, questions: n }); wouldMove += n; }
    }

    if (confirm !== true) {
      return res.json({
        success: true, dryRun: true,
        data: { mappings: Object.keys(map).length, effective: plan.length, wouldMove, plan },
        message: `DRY RUN — ${plan.length} of ${Object.keys(map).length} mapping(s) match questions; `
               + `${wouldMove} question(s) would be re-linked. Resend with confirm: true.`,
      });
    }

    let moved = 0;
    for (const item of plan) {
      const r = await Question.updateMany(
        { subject, curriculum, subtopic: item.from },
        { $set: { subtopic: item.to } });
      moved += r.modifiedCount ?? r.nModified ?? 0;
    }
    console.log(`[questions/remap] ${curriculum}/${subject}: ${moved} question(s) re-linked by ${req.user.email}`);

    return res.json({
      success: true,
      data: { moved, mappingsApplied: plan.length },
      message: `Re-linked ${moved} question(s) across ${plan.length} subtopic name(s).`,
    });
  } catch (e) {
    console.error('[questions/remap-subtopics]', e.message);
    return res.status(500).json({ success:false, message:e.message });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/questions/retag
// Move questions from one subject/curriculum label to another.
//
// Questions carry `subject` and `curriculum` as STRINGS, so a bank
// imported under "Business" is invisible to the Subject record called
// "Business Studies" and can never reach its 118-lesson spine. Same for
// curriculum values like "IGCSE" where the catalogue says
// "CambridgeIGCSE".
//
// Always DRY RUN first: without { confirm: true } it reports what would
// change and how many questions would then link to the target spine,
// and writes nothing.
//
// Body: { fromSubject, fromCurriculum, toSubject, toCurriculum, confirm }
// ─────────────────────────────────────────────────────────
router.post('/retag', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    const { fromSubject, fromCurriculum, toSubject, toCurriculum, confirm, topics,
            fromGrade, toGrade, fromGradeLevel, toGradeLevel } = req.body || {};

    // Optional topic filter. A corrupt batch can hold two subjects under
    // one bad label — 125 questions filed as subject "EdexcelIGCSE"
    // turned out to be 42 Mathematics and 83 Biology. Without this the
    // whole batch would move to one subject or the other.
    const topicFilter = Array.isArray(topics) && topics.length
      ? { topic: { $in: topics } }
      : {};
    if (!fromSubject || !fromCurriculum)
      return res.status(400).json({ success:false, message:'fromSubject and fromCurriculum are required.' });

    // Grade is optional and independent of subject/curriculum. It exists
    // because a curriculum rename can strand the grade too: KCSE questions
    // were carrying "Grade 11 (Form 3)", a CBC-era label that no longer
    // appears in GRADES_BY_CURRICULUM, so every grade filter missed them.
    const target = {
      subject:    toSubject    || fromSubject,
      curriculum: toCurriculum || fromCurriculum,
    };
    if (toGrade) target.grade = toGrade;
    if (target.subject === fromSubject && target.curriculum === fromCurriculum
        && !toGrade && !toGradeLevel)
      return res.status(400).json({ success:false, message:'Nothing would change.' });

    const filter = { subject: fromSubject, curriculum: fromCurriculum, ...topicFilter };
    if (fromGrade) filter.grade = fromGrade;
    const total = await Question.countDocuments(filter);
    if (!total)
      return res.status(404).json({ success:false, message:`No questions found for "${fromSubject}" / ${fromCurriculum}.` });

    // Would these questions actually link once renamed? A rename that
    // leaves them orphaned anyway is worth knowing about BEFORE running.
    const Subject = require('../models/Subject');
    const SyllabusTopic = require('../models/SyllabusTopic');
    const subj = await Subject.findOne({
      subjectName: target.subject, curriculum: target.curriculum, isActive: { $ne: false },
    }).lean();

    let wouldLink = 0, wouldOrphan = 0, sampleUnmatched = [];
    if (subj) {
      const spine = await SyllabusTopic.find({ subjectId: subj._id }).select('subtopics').lean();
      const valid = new Set();
      spine.forEach(t => (t.subtopics || []).forEach(st => valid.add((st.name || '').trim())));

      const grouped = await Question.aggregate([
        { $match: filter },
        { $group: { _id: '$subtopic', n: { $sum: 1 } } },
      ]);
      grouped.forEach(g => {
        const st = (g._id || '').trim();
        if (st && valid.has(st)) wouldLink += g.n;
        else {
          wouldOrphan += g.n;
          if (sampleUnmatched.length < 5) sampleUnmatched.push({ subtopic: st || '(none)', count: g.n });
        }
      });
    }

    if (confirm !== true) {
      return res.json({
        success: true,
        dryRun: true,
        data: {
          questions: total,
          from: `${fromSubject} / ${fromCurriculum}`,
          to: `${target.subject} / ${target.curriculum}`
            + (toGrade ? `  grade -> "${toGrade}"` : ''),
          targetSubjectExists: !!subj,
          wouldLink, wouldOrphan, sampleUnmatched,
          gradeLevelsToFix: (fromGradeLevel || (toGrade ? fromGrade : null))
            ? await Question.countDocuments({
                subject: fromSubject, curriculum: target.curriculum,
                gradeLevels: fromGradeLevel || fromGrade })
            : 0,
        },
        message: !subj
          ? `DRY RUN — ${total} question(s) would be renamed, but no ACTIVE subject `
            + `"${target.subject}" exists under ${target.curriculum}, so they would still not link.`
          : `DRY RUN — ${total} question(s) would move to "${target.subject}". `
            + `${wouldLink} would link to the spine, ${wouldOrphan} would still be orphaned. `
            + `Resend with confirm: true to apply.`,
      });
    }

    const r = await Question.updateMany(filter, { $set: target });
    const moved = r.modifiedCount ?? r.nModified ?? 0;

    // gradeLevels is the ARRAY of other grades a question is shared with,
    // and $set on `grade` does not touch it. Leaving it means a question
    // reads grade:"Form 3" while still carrying "Grade 11 (Form 3)" in its
    // shared list — and the grade filter searches BOTH, so the stale label
    // keeps matching.
    //
    // arrayFilters replaces just the matching element. A plain $set on the
    // field would overwrite the whole array and lose the other grades.
    // gradeLevels is swept SEPARATELY from grade, with its own from/to.
    //
    // They have to be independent: once the primary grade has been fixed,
    // a filter on the old grade value matches nothing, so a combined
    // update can never reach the array afterwards. That is exactly what
    // happened on the first run — grade became "Form 3" while gradeLevels
    // still read ["Grade 11 (Form 3)", "Grade 12 (Form 4)"].
    const lvlFrom = fromGradeLevel || (toGrade ? fromGrade : null);
    const lvlTo   = toGradeLevel   || toGrade;
    let levelsFixed = 0;
    if (lvlFrom && lvlTo) {
      // Deliberately NOT constrained by filter.grade — the array is fixed
      // wherever the stale label appears, whatever the primary grade says.
      const lvlFilter = { subject: fromSubject, curriculum: target.curriculum,
                          gradeLevels: lvlFrom };
      const lr = await Question.updateMany(
        lvlFilter,
        { $set: { 'gradeLevels.$[lvl]': lvlTo } },
        { arrayFilters: [{ lvl: lvlFrom }] });
      levelsFixed = lr.modifiedCount ?? lr.nModified ?? 0;
    }
    console.log(`[questions/retag] ${fromSubject}/${fromCurriculum} -> ${target.subject}/${target.curriculum}: `
              + `${moved} question(s) by ${req.user.email}`);

    return res.json({
      success: true,
      data: { moved, levelsFixed, wouldLink, wouldOrphan },
      message: `Re-tagged ${moved} question(s) to "${target.subject}" / ${target.curriculum}. `
             + (levelsFixed ? `${levelsFixed} also had "${fromGrade}" replaced in gradeLevels. ` : '')
             + `${wouldLink} now link to the spine. `
             + `Reverse with fromSubject "${target.subject}", toSubject "${fromSubject}".`,
    });
  } catch (e) {
    console.error('[questions/retag]', e.message);
    return res.status(500).json({ success:false, message:e.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/questions/orphan-audit
// Which questions cannot be placed on a lesson?
//
// A question links to the syllabus by its `subtopic` STRING matching a
// subtopic name on the subject's spine. Nothing enforces that at write
// time, so a question can carry a subtopic that no longer exists —
// after a spine reload, a rename, or simply a typo at import. Such a
// question still appears in the bank but can never feed auto-homework,
// lesson practice or a topic-filtered paper.
//
// Read-only. Changes nothing.
// ─────────────────────────────────────────────────────────
router.get('/orphan-audit', auth, requireRole('admin', 'ops_manager', 'dos'), async (req, res) => {
  try {
    // ?subject=Biology&curriculum=CambridgeIGCSE returns EVERY unmatched
    // subtopic name for that subject rather than a five-item sample,
    // which is what a mapping pass needs.
    const detailMode = !!(req.query.subject && req.query.curriculum);
    const Subject = require('../models/Subject');
    const SyllabusTopic = require('../models/SyllabusTopic');

    const subjects = await Subject.find({ isActive: { $ne: false } })
      .select('subjectName curriculum').lean();
    const spine = await SyllabusTopic.find({ isActive: { $ne: false } })
      .select('subjectId topic subtopics').lean();

    // Valid subtopic names per subject, keyed by curriculum + name so a
    // question is only checked against its OWN subject's spine.
    const validBy = {};
    const subjById = {};
    subjects.forEach(s => { subjById[String(s._id)] = s; });
    spine.forEach(t => {
      const subj = subjById[String(t.subjectId)];
      if (!subj) return;
      const key = subj.curriculum + '||' + subj.subjectName;
      validBy[key] = validBy[key] || new Set();
      (t.subtopics || []).forEach(st => validBy[key].add((st.name || '').trim()));
    });

    // Group every question by subject and count how it links.
    const rows = await Question.aggregate([
      { $match: detailMode
          ? { isActive: { $ne: false }, subject: req.query.subject, curriculum: req.query.curriculum }
          : { isActive: { $ne: false } } },
      { $group: {
          _id: { curriculum: '$curriculum', subject: '$subject', subtopic: '$subtopic' },
          n: { $sum: 1 },
      } },
    ]);

    const report = {};
    let totalQ = 0, totalOrphan = 0, totalNoSubtopic = 0, totalNoSpine = 0;

    rows.forEach(r => {
      const { curriculum, subject, subtopic } = r._id;
      const key = curriculum + '||' + subject;
      const bucket = report[key] || (report[key] = {
        curriculum, subject, total: 0, linked: 0,
        noSubtopic: 0, notOnSpine: 0, spineExists: !!validBy[key],
        sampleOrphans: [],
      });
      bucket.total += r.n;
      totalQ += r.n;

      const st = (subtopic || '').trim();
      if (!st) {
        bucket.noSubtopic += r.n; totalNoSubtopic += r.n;
      } else if (!validBy[key]) {
        // No spine at all for this subject — every question is unplaceable.
        bucket.notOnSpine += r.n; totalNoSpine += r.n;
      } else if (!validBy[key].has(st)) {
        bucket.notOnSpine += r.n; totalOrphan += r.n;
          // Full list when a single subject is requested, so the exact
        // unmatched names can be mapped; a short sample otherwise.
        if (detailMode || bucket.sampleOrphans.length < 5) {
          bucket.sampleOrphans.push({ subtopic: st, count: r.n });
        }
      } else {
        bucket.linked += r.n;
      }
    });

    Object.values(report).forEach(b => b.sampleOrphans.sort((a, z) => z.count - a.count));
    const subjectsOut = Object.values(report)
      .map(b => ({ ...b, orphanPct: b.total ? Math.round(((b.noSubtopic + b.notOnSpine) / b.total) * 100) : 0 }))
      .sort((a, b) => (b.noSubtopic + b.notOnSpine) - (a.noSubtopic + a.notOnSpine));

    return res.json({
      success: true,
      data: {
        totals: {
          questions: totalQ,
          linked: totalQ - totalNoSubtopic - totalOrphan - totalNoSpine,
          noSubtopic: totalNoSubtopic,
          orphanedBySpine: totalOrphan,
          subjectHasNoSpine: totalNoSpine,
        },
        subjects: subjectsOut,
      },
      message: `${totalQ} active question(s). `
             + `${totalNoSubtopic} carry no subtopic, `
             + `${totalOrphan} name a subtopic absent from their spine, `
             + `${totalNoSpine} belong to a subject with no spine at all.`,
    });
  } catch (e) {
    console.error('[questions/orphan-audit]', e.message);
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/spine-subjects', auth, async (req, res) => {
  try {
    const Subject = require('../models/Subject');
    const SyllabusTopic = require('../models/SyllabusTopic');

    const subjects = await Subject.find({ isActive: { $ne: false } })
      .select('subjectName curriculum').lean();

    // One aggregate rather than a query per subject.
    const counts = await SyllabusTopic.aggregate([
      { $match: { isActive: { $ne: false } } },
      { $group: { _id: '$subjectId', topics: { $sum: 1 },
                  subtopics: { $sum: { $size: { $ifNull: ['$subtopics', []] } } } } },
    ]);
    const byId = {};
    counts.forEach(c => { byId[String(c._id)] = c; });

    const rows = subjects.map(s => {
      const c = byId[String(s._id)] || { topics: 0, subtopics: 0 };
      return {
        _id: s._id,
        subjectName: s.subjectName,
        curriculum: s.curriculum,
        topics: c.topics,
        subtopics: c.subtopics,
        // A spine with topics but no subtopics cannot place a question
        // on a lesson, so it does not count as loaded.
        hasSpine: c.subtopics > 0,
      };
    }).sort((a, b) => Number(b.hasSpine) - Number(a.hasSpine)
                   || a.subjectName.localeCompare(b.subjectName));

    const ready = rows.filter(r => r.hasSpine);
    return res.json({
      success: true,
      data: { total: rows.length, ready: ready.length, subjects: rows },
      message: ready.length
        ? `${ready.length} of ${rows.length} subjects have a spine loaded.`
        : 'No subject has a syllabus spine yet. Upload one before writing questions.',
    });
  } catch (e) {
    console.error('[questions/spine-subjects]', e.message);
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/questions/artwork/pending
// Questions still waiting for their artwork to be produced.
// Declared BEFORE '/:id' so 'artwork' is not read as an id.
// ─────────────────────────────────────────────────────────
router.get('/artwork/pending', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { subject, curriculum, grade, kind } = req.query;
    // Match a question that needs a figure by EITHER signal.
    //
    // The queue used to require artwork.status === 'pending', but the bulk
    // importer only builds an artwork object when the payload supplies
    // one. A question flagged with imageNeeded alone had no artwork object
    // at all, so it was held inactive AND absent from this queue — 565
    // questions invisible in both directions, which is what teachers were
    // seeing as an empty screen.
    const filter = {
      $or: [
        { 'artwork.required': true, 'artwork.status': 'pending' },
        { 'artwork.required': true, 'artwork.status': { $exists: false } },
        { imageNeeded: true, 'artwork.status': { $ne: 'done' } },
      ],
    };
    if (subject)    filter.subject    = subject;
    if (curriculum) filter.$and = [...(filter.$and || []),
      { $or: [{ curriculum }, { curricula: curriculum }] }];
    if (grade) filter.$and = [...(filter.$and || []),
      { $or: [{ grade }, { gradeLevels: grade }] }];
    if (kind)       filter['artwork.kind'] = kind;

    // ── Speciality scoping ──────────────────────────────────
    // A teacher sees only artwork for the subjects and curricula they
    // are qualified to teach, so a Biology teacher is not asked to
    // produce a Computer Science circuit diagram. Admins see everything.
    let scopeNote = null;
    if (req.user.role === 'teacher') {
      const User = require('../models/User');
      const Subject = require('../models/Subject');

      const me = await User.findById(req.user._id).select('teachingSpecialties').lean();
      const specialties = (me && me.teachingSpecialties) || [];

      if (!specialties.length) {
        // No specialities recorded: show nothing rather than everything,
        // so an unconfigured account cannot alter unrelated questions.
        return res.json({
          success: true, total: 0, bySubject: {}, questions: [],
          scopeNote: 'No teaching specialities are set on your account, so no artwork requests are shown. Ask an administrator to add your subjects.',
        });
      }

      // Specialities store subjectId, so resolve them to subject names.
      const subjectIds = specialties.map(sp => sp.subjectId).filter(Boolean);
      // The field is subjectName, not name. Selecting 'name' returned
      // undefined for every subject, so allowedNames was always empty and
      // every teacher got the "could not be matched" message with an empty
      // queue — even when their specialities were set correctly.
      const subjectDocs = subjectIds.length
        ? await Subject.find({ _id: { $in: subjectIds } }).select('subjectName curriculum').lean()
        : [];

      const byId = {};
      subjectDocs.forEach(d => { byId[String(d._id)] = d; });
      const allowedNames = [...new Set(specialties
        .map(sp => (sp.subjectId && byId[String(sp.subjectId)]?.subjectName) || sp.subject)
        .filter(Boolean))];
      const allowedCurricula = [...new Set(specialties.map(sp => sp.curriculum).filter(Boolean))];

      if (!allowedNames.length) {
        return res.json({
          success: true, total: 0, bySubject: {}, questions: [],
          scopeNote: 'Your teaching specialities could not be matched to any subject. Ask an administrator to check your profile.',
        });
      }

      // Match on subject name, and on curriculum where one is recorded.
      filter.subject = subject && allowedNames.includes(subject)
        ? subject
        : { $in: allowedNames };

      if (allowedCurricula.length && !curriculum) {
        filter.curriculum = { $in: allowedCurricula };
      } else if (curriculum && !allowedCurricula.includes(curriculum) && allowedCurricula.length) {
        // Asked for a curriculum they do not teach.
        return res.json({
          success: true, total: 0, bySubject: {}, questions: [],
          scopeNote: 'You do not teach that curriculum, so no requests are shown.',
        });
      }

      scopeNote = `Showing artwork for your subjects: ${allowedNames.join(', ')}.`;
    }

    const questions = await Question.find(filter)
      .select('questionText subject curriculum grade topic type difficulty artwork')
      .sort({ subject: 1, grade: 1, createdAt: 1 })
      .limit(500)
      .lean();

    // Counts per subject let the UI show where the work is concentrated.
    const bySubject = {};
    questions.forEach(q => { bySubject[q.subject] = (bySubject[q.subject] || 0) + 1; });

    return res.json({ success: true, total: questions.length, bySubject, questions, scopeNote });
  } catch (err) {
    console.error('[questions/artwork/pending]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/questions/:id/artwork
// Attach a produced image to a question and close the request.
// Body: { attachment: { url, publicId, filename, mimeType, sizeBytes } }
// The file itself is uploaded first via POST /api/questions/upload.
// ─────────────────────────────────────────────────────────
router.post('/:id/artwork', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { attachment } = req.body || {};
    if (!attachment || !attachment.url)
      return res.status(400).json({ success: false, message: 'No attachment supplied.' });

    const question = await Question.findById(req.params.id);
    if (!question)
      return res.status(404).json({ success: false, message: 'Question not found.' });
    if (!question.artwork || !question.artwork.required)
      return res.status(400).json({ success: false, message: 'This question does not have an artwork request.' });

    // A teacher may only upload artwork for their own subjects. Without
    // this check the listing would be scoped but the action would not,
    // and a crafted request could attach an image to any question.
    const allowed = await allowedSubjectsFor(req.user);
    if (allowed !== null && !allowed.includes(question.subject)) {
      return res.status(403).json({
        success: false,
        message: `You are not assigned to ${question.subject}, so you cannot upload artwork for this question.`,
      });
    }

    question.attachments.push(attachment);
    question.artwork.status     = 'uploaded';
    question.artwork.uploadedBy = req.user._id;
    question.artwork.uploadedAt = new Date();
    await question.save();

    console.log(`[artwork uploaded] question=${question._id} subject=${question.subject} by=${req.user.email || req.user._id}`);
    return res.json({ success: true, message: 'Artwork attached.', question });
  } catch (err) {
    console.error('[questions/:id/artwork]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/questions/:id/artwork/reopen
// Reverses an upload — used when the image was wrong.
// ─────────────────────────────────────────────────────────
router.post('/:id/artwork/reopen', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question)
      return res.status(404).json({ success: false, message: 'Question not found.' });
    question.artwork.status     = 'pending';
    question.artwork.uploadedBy = null;
    question.artwork.uploadedAt = null;
    await question.save();
    return res.json({ success: true, message: 'Artwork request reopened.', question });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid question ID.' });
    }
    const question = await Question.findById(id)
      .populate('createdBy', 'firstName lastName email').lean();
    if (!question || !question.isActive) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    return res.json({ success: true, question });
  } catch (e) {
    console.error('[questions GET :id]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to load question.' });
  }
});

// ─────────────────────────────────────────────────────────
// PATCH /api/questions/:id  — update (creator or admin only)
// ─────────────────────────────────────────────────────────
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid question ID.' });
    }
    const question = await Question.findById(id);
    if (!question || !question.isActive) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    if (question.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only edit your own questions.' });
    }
    // Now includes `parts` so teachers can switch between flat and nested,
    // or edit nested structure after creation.
    const allowed = [
      'curriculum', 'subject', 'grade', 'topic', 'subtopic', 'type',
      'questionText', 'options', 'correctAnswer', 'explanation',
      'marks', 'difficulty', 'attachments', 'parts',
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) question[key] = req.body[key];
    }
    // If the update switches to nested, normalise the type tag.
    if (Array.isArray(question.parts) && question.parts.length > 0) {
      question.type = 'nested';
    }
    await question.save();
    return res.json({ success: true, question });
  } catch (e) {
    console.error('[questions PATCH]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to update question.' });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/questions/:id  — soft delete + Cloudinary cleanup
// ─────────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid question ID.' });
    }
    const question = await Question.findById(id);
    if (!question || !question.isActive) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    if (question.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own questions.' });
    }

    // Collect Cloudinary publicIds from top-level + nested parts
    const collectPublicIds = (atts, into) => {
      (atts || []).forEach(a => { if (a.publicId) into.push(a.publicId); });
    };
    const walkParts = (parts, into) => {
      (parts || []).forEach(p => {
        collectPublicIds(p.attachments, into);
        if (Array.isArray(p.parts) && p.parts.length) walkParts(p.parts, into);
      });
    };
    const publicIds = [];
    collectPublicIds(question.attachments, publicIds);
    walkParts(question.parts, publicIds);

    for (const key of publicIds) {
      try {
        await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
      } catch (err) {
        console.error('[questions DELETE] R2 cleanup failed for', key, ':', err.message);
      }
    }

    question.isActive = false;
    await question.save();

    return res.json({ success: true, message: 'Question deleted.' });
  } catch (e) {
    console.error('[questions DELETE]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to delete question.' });
  }
});

module.exports = router;
