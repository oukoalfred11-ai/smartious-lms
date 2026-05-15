/**
 * routes/lessons.js
 * ============================================================
 * Mounted at /api/lessons
 *
 * Endpoints:
 *   GET    /my-subjects             — current teacher's subjects (from teachingSpecialties)
 *   GET    /subject/:subjectId      — all lessons for a subject (teacher: own only; admin: all)
 *   POST   /                        — create one lesson
 *   POST   /bulk                    — create N lessons from a title list
 *   POST   /upload-pdf              — upload notes PDF to Cloudinary
 *   GET    /:id                     — single lesson (teacher owner or assigned student or admin)
 *   PATCH  /:id                     — edit (teacher owner or admin)
 *   DELETE /:id                     — delete (teacher owner or admin)
 *
 * Auth: most endpoints require teacher or admin. The single-lesson GET
 * also allows the student to read if they're enrolled in the lesson's
 * subject within the right curriculum — that's how the Lesson Player
 * (Session 3) will fetch lesson content.
 */

const express  = require('express');
const mongoose = require('mongoose');
const multer   = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const Lesson  = require('../models/Lesson');
const Subject = require('../models/Subject');
const User    = require('../models/User');
const Allocation = require('../models/Allocation');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────────────────
// Cloudinary PDF storage — separate folder so notes are easy
// to find in the dashboard and easy to bulk-clean if needed.
// ─────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'smartious/lesson-notes',
    resource_type: 'raw',          // treat as raw asset; PDFs aren't images
    allowed_formats: ['pdf'],
  },
});
const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 20 * 1024 * 1024 },  // 20 MB cap per PDF
});

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

// Resolve the teacher's "my subjects" set from their teachingSpecialties.
// Returns an array of Subject docs joined with the teacher's pair info.
async function getTeacherSubjects(teacher) {
  const specialties = teacher.teachingSpecialties || [];
  if (specialties.length === 0) return [];

  // De-dup subjectIds
  const ids = [...new Set(specialties.map(s => String(s.subjectId)).filter(Boolean))];
  if (ids.length === 0) return [];

  const subjects = await Subject.find({ _id: { $in: ids } }).lean();
  // Annotate each subject with the curricula the teacher teaches it in
  // (a teacher could potentially teach the same subject across curricula,
  // though our schema makes each Subject curriculum-specific).
  return subjects.map(s => {
    const myCurricula = specialties
      .filter(sp => String(sp.subjectId) === String(s._id))
      .map(sp => sp.curriculum);
    return { ...s, myCurricula };
  });
}

// Compute next lesson order within a subject + teacher pair
async function nextOrder(teacherId, subjectId) {
  const last = await Lesson.findOne({ teacherId, subjectId })
    .sort({ order: -1 })
    .select('order')
    .lean();
  return (last?.order || 0) + 1;
}

// ─────────────────────────────────────────────────────────
// GET /api/lessons/my-subjects
// ─────────────────────────────────────────────────────────
router.get('/my-subjects', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    let subjects = [];
    if (req.user.role === 'admin') {
      // Admin sees all active subjects
      subjects = await Subject.find({ isActive: true }).sort('subjectName').lean();
    } else {
      subjects = await getTeacherSubjects(req.user);
    }

    // Count lessons per subject (for the teacher's own lessons)
    const subjectIds = subjects.map(s => s._id);
    const lessonCounts = await Lesson.aggregate([
      {
        $match: {
          subjectId: { $in: subjectIds.map(id => new mongoose.Types.ObjectId(String(id))) },
          ...(req.user.role === 'teacher' ? { teacherId: req.user._id } : {}),
        }
      },
      {
        $group: {
          _id: '$subjectId',
          total: { $sum: 1 },
          published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
        }
      }
    ]);
    const countsMap = {};
    lessonCounts.forEach(c => { countsMap[String(c._id)] = c; });

    const result = subjects.map(s => ({
      ...s,
      lessonCount:     countsMap[String(s._id)]?.total || 0,
      publishedCount:  countsMap[String(s._id)]?.published || 0,
    }));

    res.json({ success: true, data: { subjects: result } });
  } catch (e) {
    console.error('[lessons my-subjects]', e.message);
    res.status(500).json({ success: false, message: 'Failed to load subjects: ' + e.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/lessons/subject/:subjectId
// ─────────────────────────────────────────────────────────
router.get('/subject/:subjectId', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.subjectId))
      return res.status(400).json({ success: false, message: 'Invalid subject id.' });

    const filter = { subjectId: req.params.subjectId };
    if (req.user.role !== 'admin') filter.teacherId = req.user._id;

    const lessons = await Lesson.find(filter)
      .sort({ termIndex: 1, order: 1 })
      .lean();

    res.json({ success: true, data: { lessons } });
  } catch (e) {
    console.error('[lessons by subject]', e.message);
    res.status(500).json({ success: false, message: 'Failed to load lessons.' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/lessons — create one lesson
// ─────────────────────────────────────────────────────────
router.post('/', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const {
      subjectId, title, description = '',
      termIndex = 1, order,
      videoUrl = '', notesPdfUrl = '', notesPdfPublicId = '',
      durationMins = 0, status = 'draft',
    } = req.body;

    if (!subjectId || !mongoose.isValidObjectId(subjectId))
      return res.status(400).json({ success: false, message: 'Valid subjectId required.' });
    if (!title || !title.trim())
      return res.status(400).json({ success: false, message: 'Title is required.' });

    const subject = await Subject.findById(subjectId).lean();
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });

    // Authorise: teacher must have this subject in their teachingSpecialties
    if (req.user.role === 'teacher') {
      const hasSpec = (req.user.teachingSpecialties || [])
        .some(s => String(s.subjectId) === String(subjectId));
      if (!hasSpec)
        return res.status(403).json({ success: false, message: 'You do not teach this subject.' });
    }

    const teacherId = req.user._id;
    const ord = Number.isFinite(Number(order)) ? Number(order) : await nextOrder(teacherId, subjectId);

    const lesson = await Lesson.create({
      subjectId, teacherId,
      curriculum: subject.curriculum,
      order: ord,
      termIndex: [1, 2, 3].includes(Number(termIndex)) ? Number(termIndex) : 1,
      title: title.trim(),
      description: description.trim(),
      videoUrl, notesPdfUrl, notesPdfPublicId,
      durationMins: Number(durationMins) || 0,
      status: ['draft', 'published'].includes(status) ? status : 'draft',
    });

    res.status(201).json({ success: true, message: 'Lesson created.', data: { lesson } });
  } catch (e) {
    console.error('[lessons create]', e.message);
    res.status(500).json({ success: false, message: 'Failed to create lesson: ' + e.message });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/lessons/bulk — create many drafts from a title list
// ─────────────────────────────────────────────────────────
router.post('/bulk', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { subjectId, titles, termIndex = 1, startOrder } = req.body;

    if (!subjectId || !mongoose.isValidObjectId(subjectId))
      return res.status(400).json({ success: false, message: 'Valid subjectId required.' });
    if (!Array.isArray(titles) || titles.length === 0)
      return res.status(400).json({ success: false, message: 'titles must be a non-empty array.' });
    if (titles.length > 200)
      return res.status(400).json({ success: false, message: 'Maximum 200 titles per bulk import.' });

    const subject = await Subject.findById(subjectId).lean();
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });

    if (req.user.role === 'teacher') {
      const hasSpec = (req.user.teachingSpecialties || [])
        .some(s => String(s.subjectId) === String(subjectId));
      if (!hasSpec)
        return res.status(403).json({ success: false, message: 'You do not teach this subject.' });
    }

    const teacherId = req.user._id;
    const baseOrder = Number.isFinite(Number(startOrder))
      ? Number(startOrder)
      : await nextOrder(teacherId, subjectId);

    // Filter blanks, trim, dedupe within this batch
    const cleanTitles = titles
      .map(t => (typeof t === 'string' ? t.trim() : ''))
      .filter(Boolean);

    if (cleanTitles.length === 0)
      return res.status(400).json({ success: false, message: 'No non-empty titles found.' });

    const term = [1, 2, 3].includes(Number(termIndex)) ? Number(termIndex) : 1;
    const docs = cleanTitles.map((title, i) => ({
      subjectId, teacherId,
      curriculum: subject.curriculum,
      order: baseOrder + i,
      termIndex: term,
      title,
      status: 'draft',
    }));

    const created = await Lesson.insertMany(docs);
    res.status(201).json({
      success: true,
      message: `${created.length} lesson${created.length === 1 ? '' : 's'} created.`,
      data: { lessons: created },
    });
  } catch (e) {
    console.error('[lessons bulk]', e.message);
    res.status(500).json({ success: false, message: 'Failed to bulk-create lessons: ' + e.message });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/lessons/upload-pdf — upload notes PDF
// ─────────────────────────────────────────────────────────
router.post('/upload-pdf', auth, requireRole('teacher', 'admin'), (req, res) => {
  uploadPdf.single('file')(req, res, (err) => {
    if (err) {
      console.error('[lessons upload-pdf]', err.message);
      return res.status(400).json({ success: false, message: err.message || 'Upload failed.' });
    }
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded.' });

    res.json({
      success: true,
      data: {
        url:       req.file.path,
        publicId:  req.file.filename,
        filename:  req.file.originalname,
        sizeBytes: req.file.size,
      },
    });
  });
});

// ─────────────────────────────────────────────────────────
// GET /api/lessons/:id — single lesson
// ─────────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid lesson id.' });

    const lesson = await Lesson.findById(req.params.id)
      .populate('subjectId', 'subjectName curriculum category color coverImage')
      .populate('teacherId', 'firstName lastName')
      .lean();
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });

    const isOwner = String(lesson.teacherId?._id || lesson.teacherId) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    let canRead = isOwner || isAdmin;

    // Students can read the lesson if they're allocated to this teacher
    // for this subject (which is how the student-side Lesson Player will fetch).
    if (!canRead && req.user.role === 'student') {
      const alloc = await Allocation.findOne({
        studentId: req.user._id,
        subjectId: lesson.subjectId._id,
        teacherId: lesson.teacherId._id,
        status: 'Active',
      });
      // Only allow if lesson is published
      if (alloc && lesson.status === 'published') canRead = true;
    }

    if (!canRead)
      return res.status(403).json({ success: false, message: 'You do not have access to this lesson.' });

    res.json({ success: true, data: { lesson } });
  } catch (e) {
    console.error('[lessons get]', e.message);
    res.status(500).json({ success: false, message: 'Failed to load lesson.' });
  }
});

// ─────────────────────────────────────────────────────────
// PATCH /api/lessons/:id — edit
// ─────────────────────────────────────────────────────────
router.patch('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid lesson id.' });

    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });

    if (req.user.role !== 'admin' && String(lesson.teacherId) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Not your lesson.' });

    const allowed = [
      'title', 'description', 'termIndex', 'order',
      'videoUrl', 'notesPdfUrl', 'notesPdfPublicId',
      'durationMins', 'status',
    ];
    for (const k of allowed) {
      if (k in req.body) {
        if (k === 'termIndex') {
          const t = Number(req.body.termIndex);
          if ([1, 2, 3].includes(t)) lesson.termIndex = t;
        } else if (k === 'status') {
          if (['draft', 'published'].includes(req.body.status)) lesson.status = req.body.status;
        } else {
          lesson[k] = req.body[k];
        }
      }
    }

    await lesson.save();   // triggers the pre-save hook that extracts videoEmbedId
    res.json({ success: true, message: 'Lesson updated.', data: { lesson } });
  } catch (e) {
    console.error('[lessons patch]', e.message);
    res.status(500).json({ success: false, message: 'Failed to update lesson.' });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/lessons/:id
// ─────────────────────────────────────────────────────────
router.delete('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid lesson id.' });

    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });

    if (req.user.role !== 'admin' && String(lesson.teacherId) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Not your lesson.' });

    // Best-effort cleanup of Cloudinary PDF (don't fail the delete if it errors)
    if (lesson.notesPdfPublicId) {
      try { await cloudinary.uploader.destroy(lesson.notesPdfPublicId, { resource_type: 'raw' }); }
      catch (e) { console.error('[lessons delete] cloudinary cleanup failed:', e.message); }
    }

    await lesson.deleteOne();
    res.json({ success: true, message: 'Lesson deleted.' });
  } catch (e) {
    console.error('[lessons delete]', e.message);
    res.status(500).json({ success: false, message: 'Failed to delete lesson.' });
  }
});

module.exports = router;
