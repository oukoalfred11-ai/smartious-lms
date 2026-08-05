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
    const key = `questions/${uuidv4()}_${safeName}`;
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
    } = req.body;

    // Validation
    if (!curriculum || !subject || !grade) {
      return res.status(400).json({ success: false, message: 'curriculum, subject and grade are required.' });
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
    if (req.query.curriculum) filter.curriculum = req.query.curriculum;
    if (req.query.subject)    filter.subject    = req.query.subject;
    if (req.query.grade)      filter.grade      = req.query.grade;
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
async function allowedSubjectsFor(user) {
  if (user.role !== 'teacher') return null;
  const User = require('../models/User');
  const Subject = require('../models/Subject');
  const me = await User.findById(user._id).select('teachingSpecialties').lean();
  const specialties = (me && me.teachingSpecialties) || [];
  const subjectIds = specialties.map(sp => sp.subjectId).filter(Boolean);
  if (!subjectIds.length) return [];
  const docs = await Subject.find({ _id: { $in: subjectIds } }).select('name').lean();
  return [...new Set(docs.map(d => d.name).filter(Boolean))];
}

// ─────────────────────────────────────────────────────────
// GET /api/questions/artwork/pending
// Questions still waiting for their artwork to be produced.
// Declared BEFORE '/:id' so 'artwork' is not read as an id.
// ─────────────────────────────────────────────────────────
router.get('/artwork/pending', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { subject, curriculum, grade, kind } = req.query;
    const filter = { 'artwork.required': true, 'artwork.status': 'pending' };
    if (subject)    filter.subject    = subject;
    if (curriculum) filter.curriculum = curriculum;
    if (grade)      filter.grade      = grade;
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
      const subjectDocs = subjectIds.length
        ? await Subject.find({ _id: { $in: subjectIds } }).select('name curriculum').lean()
        : [];

      const allowedNames = [...new Set(subjectDocs.map(d => d.name).filter(Boolean))];
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
