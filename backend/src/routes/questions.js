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
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const Question = require('../models/Question');
const { auth, requireRole } = require('../middleware/auth');
const { isSubjectValidForCurriculum } = require('../constants/curriculum');

// ─────────────────────────────────────────────────────────
// CLOUDINARY CONFIG
// ─────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'smartious/question-bank',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ─────────────────────────────────────────────────────────
// POST /api/questions/upload
// ─────────────────────────────────────────────────────────
router.post('/upload', auth, requireRole('teacher', 'admin'), (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('[questions/upload]', err.message);
      return res.status(400).json({ success: false, message: err.message || 'Upload failed.' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    return res.json({
      success: true,
      attachment: {
        url:       req.file.path,
        publicId:  req.file.filename,
        filename:  req.file.originalname,
        mimeType:  req.file.mimetype,
        sizeBytes: req.file.size,
      },
    });
  });
});

// ─────────────────────────────────────────────────────────
// POST /api/questions  — create a question (flat or nested)
// ─────────────────────────────────────────────────────────
router.post('/', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const {
      curriculum, subject, grade, topic, type,
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
      'curriculum', 'subject', 'grade', 'topic', 'type',
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

    for (const pid of publicIds) {
      try {
        await cloudinary.uploader.destroy(pid);
      } catch (err) {
        console.error('[questions DELETE] Cloudinary destroy failed for', pid, ':', err.message);
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
