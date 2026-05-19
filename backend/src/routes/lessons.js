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
const { syncTimetablesForSubject } = require('../services/timetableSync');

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

// Compute next lesson order within a subject (Model A: subject-scoped,
// not teacher-scoped — all teachers of a subject share one ordered list)
async function nextOrder(subjectId) {
  const last = await Lesson.findOne({ subjectId })
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

    // Count lessons per subject. MODEL A: lessons belong to the subject,
    // so the count is the same for every teacher of that subject.
    const subjectIds = subjects.map(s => s._id);
    const lessonCounts = await Lesson.aggregate([
      {
        $match: {
          subjectId: { $in: subjectIds.map(id => new mongoose.Types.ObjectId(String(id))) },
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
// MODEL A: returns ALL lessons for the subject. Any teacher with
// the subject in their teachingSpecialties may view them.
// ─────────────────────────────────────────────────────────
router.get('/subject/:subjectId', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.subjectId))
      return res.status(400).json({ success: false, message: 'Invalid subject id.' });

    // Authorise teachers: must have this subject in their specialties
    if (req.user.role === 'teacher') {
      const hasSpec = (req.user.teachingSpecialties || [])
        .some(s => String(s.subjectId) === String(req.params.subjectId));
      if (!hasSpec)
        return res.status(403).json({ success: false, message: 'You do not teach this subject.' });
    }

    const lessons = await Lesson.find({ subjectId: req.params.subjectId })
      .sort({ termIndex: 1, order: 1 })
      .populate('teacherId', 'firstName lastName')   // creator label only
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
      topicRef = null, subtopicName = '',
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

    // teacherId here is recorded as createdBy / original author only.
    const teacherId = req.user._id;
    const ord = Number.isFinite(Number(order)) ? Number(order) : await nextOrder(subjectId);

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
      topicRef: (topicRef && mongoose.isValidObjectId(topicRef)) ? topicRef : null,
      subtopicName: typeof subtopicName === 'string' ? subtopicName.trim() : '',
    });

    res.status(201).json({ success: true, message: 'Lesson created.', data: { lesson } });

    // Auto-sync: a lesson was added → recompute timetables for the
    // subject. Fire-and-forget so it never blocks the response.
    syncTimetablesForSubject(lesson.subjectId).catch(() => {});
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

    const teacherId = req.user._id;   // createdBy / original author
    const baseOrder = Number.isFinite(Number(startOrder))
      ? Number(startOrder)
      : await nextOrder(subjectId);

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

    // Auto-sync: lessons were added in bulk → recompute timetables.
    if (created.length) {
      syncTimetablesForSubject(created[0].subjectId).catch(() => {});
    }
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

    const isAdmin = req.user.role === 'admin';
    const subjectId = lesson.subjectId?._id || lesson.subjectId;
    let canRead = isAdmin;

    // MODEL A: a teacher may read any lesson for a subject in their
    // teachingSpecialties — not just lessons they personally created.
    if (!canRead && req.user.role === 'teacher') {
      const hasSpec = (req.user.teachingSpecialties || [])
        .some(s => String(s.subjectId) === String(subjectId));
      if (hasSpec) canRead = true;
    }

    // Students can read a PUBLISHED lesson if they have an Active
    // allocation for its subject (the allocated teacher is irrelevant
    // to access — content belongs to the subject).
    if (!canRead && req.user.role === 'student') {
      const alloc = await Allocation.findOne({
        studentId: req.user._id,
        subjectId: subjectId,
        status: 'Active',
      });
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

    // MODEL A: any teacher with this subject in their teachingSpecialties
    // may edit the lesson — content belongs to the subject, not a person.
    if (req.user.role !== 'admin') {
      const hasSpec = (req.user.teachingSpecialties || [])
        .some(s => String(s.subjectId) === String(lesson.subjectId));
      if (!hasSpec)
        return res.status(403).json({ success: false, message: 'You do not teach this subject.' });
    }

    const allowed = [
      'title', 'description', 'termIndex', 'order',
      'videoUrl', 'notesPdfUrl', 'notesPdfPublicId',
      'durationMins', 'status',
      'topicRef', 'subtopicName',
    ];
    for (const k of allowed) {
      if (k in req.body) {
        if (k === 'termIndex') {
          const t = Number(req.body.termIndex);
          if ([1, 2, 3].includes(t)) lesson.termIndex = t;
        } else if (k === 'status') {
          if (['draft', 'published'].includes(req.body.status)) lesson.status = req.body.status;
        } else if (k === 'topicRef') {
          lesson.topicRef = (req.body.topicRef && mongoose.isValidObjectId(req.body.topicRef))
            ? req.body.topicRef : null;
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
// DELETE /api/lessons/:id — ADMIN ONLY
// MODEL A decision: shared edit rights, but deletion is restricted
// to admin to protect against accidental loss of a shared library.
// Teachers who want a lesson gone should unpublish it, or ask admin.
// ─────────────────────────────────────────────────────────
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid lesson id.' });

    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });

    // Best-effort cleanup of Cloudinary PDF (don't fail the delete if it errors)
    if (lesson.notesPdfPublicId) {
      try { await cloudinary.uploader.destroy(lesson.notesPdfPublicId, { resource_type: 'raw' }); }
      catch (e) { console.error('[lessons delete] cloudinary cleanup failed:', e.message); }
    }

    const deletedSubjectId = lesson.subjectId;
    await lesson.deleteOne();
    res.json({ success: true, message: 'Lesson deleted.' });

    // Auto-sync: a lesson was removed → recompute timetables.
    syncTimetablesForSubject(deletedSubjectId).catch(() => {});
  } catch (e) {
    console.error('[lessons delete]', e.message);
    res.status(500).json({ success: false, message: 'Failed to delete lesson.' });
  }
});

// ─────────────────────────────────────────────────────────
// STUDENT ROUTES — accessed when student opens Lesson Player
// ─────────────────────────────────────────────────────────

// GET /api/lessons/student/my-subjects
// Returns the subjects this student has via Active allocations, with
// per-subject lesson counts and mastery counts.
router.get('/student/my-subjects', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student')
      return res.status(403).json({ success: false, message: 'Students only.' });

    // Find Active allocations for this student
    const allocations = await Allocation.find({
      studentId: req.user._id,
      status: 'Active',
    })
      .populate('subjectId', 'subjectName curriculum category color coverImage')
      .populate('teacherId', 'firstName lastName isActive isOnLeave')
      .lean();

    // Filter to allocations whose teacher is still active
    const valid = allocations.filter(a =>
      a.teacherId && a.teacherId.isActive && !a.teacherId.isOnLeave && a.subjectId
    );

    if (valid.length === 0)
      return res.json({ success: true, data: { subjects: [] } });

    // Lesson counts per subject. MODEL A: lessons belong to the subject,
    // so we count all published lessons for the subject — the allocated
    // teacher's identity does not filter the content.
    const LessonProgress = require('../models/LessonProgress');
    const subjects = [];
    for (const a of valid) {
      const totalLessons = await Lesson.countDocuments({
        subjectId: a.subjectId._id,
        status: 'published',
      });
      const masteredCount = await LessonProgress.countDocuments({
        studentId: req.user._id,
        subjectId: a.subjectId._id,
      });
      subjects.push({
        _id:         a.subjectId._id,
        subjectName: a.subjectId.subjectName,
        curriculum:  a.subjectId.curriculum,
        category:    a.subjectId.category,
        color:       a.subjectId.color,
        coverImage:  a.subjectId.coverImage,
        teacherId:   a.teacherId._id,
        teacherName: (a.teacherId.firstName || '') + ' ' + (a.teacherId.lastName || ''),
        lessonCount: totalLessons,
        masteredCount,
        progressPct: totalLessons > 0
          ? Math.round((masteredCount / totalLessons) * 100)
          : 0,
      });
    }

    res.json({ success: true, data: { subjects } });
  } catch (e) {
    console.error('[lessons student/my-subjects]', e.message);
    res.status(500).json({ success: false, message: 'Failed to load subjects: ' + e.message });
  }
});

// GET /api/lessons/student/subject/:subjectId
// Returns all published lessons for one of the student's subjects.
// Authorisation: student must have an Active allocation for this subject.
router.get('/student/subject/:subjectId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student')
      return res.status(403).json({ success: false, message: 'Students only.' });
    if (!mongoose.isValidObjectId(req.params.subjectId))
      return res.status(400).json({ success: false, message: 'Invalid subject id.' });

    const allocation = await Allocation.findOne({
      studentId: req.user._id,
      subjectId: req.params.subjectId,
      status: 'Active',
    }).populate('teacherId', 'firstName lastName isActive isOnLeave').lean();

    if (!allocation)
      return res.status(403).json({ success: false, message: 'Not enrolled in this subject.' });
    if (!allocation.teacherId || !allocation.teacherId.isActive || allocation.teacherId.isOnLeave)
      return res.status(403).json({ success: false, message: 'No active teacher allocated.' });

    const lessons = await Lesson.find({
      subjectId: req.params.subjectId,
      status: 'published',
    }).sort({ termIndex: 1, order: 1 }).lean();

    res.json({
      success: true,
      data: {
        lessons,
        teacher: {
          _id:       allocation.teacherId._id,
          firstName: allocation.teacherId.firstName,
          lastName:  allocation.teacherId.lastName,
        },
      },
    });
  } catch (e) {
    console.error('[lessons student/subject]', e.message);
    res.status(500).json({ success: false, message: 'Failed to load lessons.' });
  }
});

module.exports = router;
