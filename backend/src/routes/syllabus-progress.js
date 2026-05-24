/**
 * Syllabus Progress Routes
 * ============================================================
 * /api/syllabus-progress
 *
 * Tracks which subtopics each student has completed per subject.
 * See models/StudentSyllabusProgress.js for schema rationale.
 *
 * Routes:
 *   POST    /                          Mark one subtopic done for a student
 *   POST    /bulk                      Mark one subtopic done for multiple students
 *   GET     /student/:studentId        List all progress for a student (optional ?subjectId=)
 *   GET     /student/:studentId/subject/:subjectId/summary
 *                                      Returns { totalSubtopics, doneCount, percent }
 *   DELETE  /:progressId               Remove a "done" mark (correction case)
 *
 * Authorization (Phase 1 — basic):
 *   - All routes require an authenticated user (auth middleware)
 *   - POST/DELETE require role 'teacher' or 'admin' (any teacher of the
 *     same subject can mark; we don't tightly scope by allocation for
 *     now since teachers cross-cover and we want the cross-teacher
 *     visibility you requested earlier for attendance — same applies here)
 *   - GET allowed for teacher, admin, and the student themselves
 *
 * Phase 2 (future): tighten authorisation to allocated teacher only.
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const StudentSyllabusProgress = require('../models/StudentSyllabusProgress');
const SyllabusTopic = require('../models/SyllabusTopic');
const User = require('../models/User');
const Subject = require('../models/Subject');

// Auth middleware — matches the pattern used in lessons-route.js, etc.
const { auth, requireRole } = require('../middleware/auth');

// Helper: standardised JSON response
const ok = (res, data, message) => res.json({ success: true, data, message });
const fail = (res, status, message) => res.status(status).json({ success: false, message });

// ── POST / — Mark one subtopic done for one student ──────────
// Body: { studentId, subjectId, syllabusTopicName, syllabusSubtopicName,
//         linkedLiveClassId?, notes? }
router.post('/', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const {
      studentId, subjectId,
      syllabusTopicName, syllabusSubtopicName,
      linkedLiveClassId, notes,
    } = req.body || {};

    if (!studentId || !mongoose.isValidObjectId(studentId)) return fail(res, 400, 'Valid studentId required.');
    if (!subjectId || !mongoose.isValidObjectId(subjectId)) return fail(res, 400, 'Valid subjectId required.');
    if (!syllabusSubtopicName || !String(syllabusSubtopicName).trim()) {
      return fail(res, 400, 'syllabusSubtopicName required.');
    }

    // Verify student + subject exist (and student really is a student)
    const [student, subject] = await Promise.all([
      User.findById(studentId).select('role curriculum').lean(),
      Subject.findById(subjectId).select('curriculum subjectName isActive').lean(),
    ]);
    if (!student) return fail(res, 404, 'Student not found.');
    if (student.role !== 'student') return fail(res, 400, 'studentId is not a student.');
    if (!subject) return fail(res, 404, 'Subject not found.');

    // Upsert on (studentId, subjectId, syllabusSubtopicName)
    const filter = {
      studentId,
      subjectId,
      syllabusSubtopicName: String(syllabusSubtopicName).trim(),
    };
    const update = {
      $set: {
        curriculum: subject.curriculum,
        syllabusTopicName: syllabusTopicName ? String(syllabusTopicName).trim() : '',
        syllabusSubtopicName: String(syllabusSubtopicName).trim(),
        status: 'Done',
        markedBy: req.user._id,
        markedAt: new Date(),
        linkedLiveClassId: (linkedLiveClassId && mongoose.isValidObjectId(linkedLiveClassId))
          ? linkedLiveClassId
          : null,
        notes: notes ? String(notes).trim().slice(0, 500) : '',
      },
      $setOnInsert: { studentId, subjectId },
    };
    const doc = await StudentSyllabusProgress.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    return ok(res, { progress: doc }, 'Marked done.');
  } catch (err) {
    // Duplicate-key race: another request just inserted — treat as success
    if (err && err.code === 11000) {
      const existing = await StudentSyllabusProgress.findOne({
        studentId: req.body.studentId,
        subjectId: req.body.subjectId,
        syllabusSubtopicName: String(req.body.syllabusSubtopicName).trim(),
      });
      return ok(res, { progress: existing }, 'Already marked done.');
    }
    console.error('[syllabus-progress POST] error:', err);
    return fail(res, 500, err.message || 'Failed to mark done.');
  }
});

// ── POST /bulk — Mark one subtopic done for multiple students ──
// Body: { studentIds: [...], subjectId, syllabusTopicName, syllabusSubtopicName,
//         linkedLiveClassId?, notes? }
router.post('/bulk', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const {
      studentIds, subjectId,
      syllabusTopicName, syllabusSubtopicName,
      linkedLiveClassId, notes,
    } = req.body || {};

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return fail(res, 400, 'studentIds array required.');
    }
    if (!subjectId || !mongoose.isValidObjectId(subjectId)) return fail(res, 400, 'Valid subjectId required.');
    if (!syllabusSubtopicName || !String(syllabusSubtopicName).trim()) {
      return fail(res, 400, 'syllabusSubtopicName required.');
    }

    const validIds = studentIds.filter(id => mongoose.isValidObjectId(id));
    if (validIds.length === 0) return fail(res, 400, 'No valid studentIds.');

    const subject = await Subject.findById(subjectId).select('curriculum').lean();
    if (!subject) return fail(res, 404, 'Subject not found.');

    const cleanSubtopic = String(syllabusSubtopicName).trim();
    const cleanTopic = syllabusTopicName ? String(syllabusTopicName).trim() : '';
    const cleanNotes = notes ? String(notes).trim().slice(0, 500) : '';
    const linkLC = (linkedLiveClassId && mongoose.isValidObjectId(linkedLiveClassId)) ? linkedLiveClassId : null;

    // Bulk upsert via bulkWrite
    const ops = validIds.map(studentId => ({
      updateOne: {
        filter: { studentId, subjectId, syllabusSubtopicName: cleanSubtopic },
        update: {
          $set: {
            curriculum: subject.curriculum,
            syllabusTopicName: cleanTopic,
            syllabusSubtopicName: cleanSubtopic,
            status: 'Done',
            markedBy: req.user._id,
            markedAt: new Date(),
            linkedLiveClassId: linkLC,
            notes: cleanNotes,
          },
          $setOnInsert: { studentId, subjectId },
        },
        upsert: true,
      },
    }));

    const result = await StudentSyllabusProgress.bulkWrite(ops, { ordered: false });

    return ok(res, {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      total: validIds.length,
    }, `Marked done for ${validIds.length} student(s).`);
  } catch (err) {
    console.error('[syllabus-progress POST /bulk] error:', err);
    return fail(res, 500, err.message || 'Bulk mark failed.');
  }
});

// ── GET /student/:studentId — list all progress for a student ──
// Optional ?subjectId=...
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.isValidObjectId(studentId)) return fail(res, 400, 'Invalid studentId.');

    // Allow: teacher, admin, OR the student themselves
    const isOwn = String(req.user._id) === String(studentId);
    if (!isOwn && !['teacher', 'admin'].includes(req.user.role)) {
      return fail(res, 403, 'Not allowed.');
    }

    const filter = { studentId };
    if (req.query.subjectId && mongoose.isValidObjectId(req.query.subjectId)) {
      filter.subjectId = req.query.subjectId;
    }

    const items = await StudentSyllabusProgress.find(filter)
      .sort({ subjectId: 1, syllabusTopicName: 1, syllabusSubtopicName: 1 })
      .lean();

    return ok(res, { items }, `${items.length} progress records.`);
  } catch (err) {
    console.error('[syllabus-progress GET /student/:id] error:', err);
    return fail(res, 500, err.message || 'Failed to load progress.');
  }
});

// ── GET /student/:studentId/subject/:subjectId/summary ──────
// Returns { totalSubtopics, doneCount, percent, doneSubtopicNames }
// totalSubtopics is computed from the loaded SyllabusTopic spine for that subject.
// If no spine is loaded for the subject, totalSubtopics is 0 and percent is null.
router.get('/student/:studentId/subject/:subjectId/summary', auth, async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;
    if (!mongoose.isValidObjectId(studentId)) return fail(res, 400, 'Invalid studentId.');
    if (!mongoose.isValidObjectId(subjectId)) return fail(res, 400, 'Invalid subjectId.');

    const isOwn = String(req.user._id) === String(studentId);
    if (!isOwn && !['teacher', 'admin'].includes(req.user.role)) {
      return fail(res, 403, 'Not allowed.');
    }

    const [spine, doneRecords] = await Promise.all([
      SyllabusTopic.find({ subjectId }).select('subtopics').lean(),
      StudentSyllabusProgress.find({ studentId, subjectId, status: 'Done' })
        .select('syllabusSubtopicName')
        .lean(),
    ]);

    // Total subtopics across all topics in the spine
    const totalSubtopics = spine.reduce((sum, t) => sum + (Array.isArray(t.subtopics) ? t.subtopics.length : 0), 0);
    const doneSet = new Set(doneRecords.map(r => r.syllabusSubtopicName));

    // Only count "done" if the subtopic name still exists in the spine
    // (avoids inflating completion if a subtopic was renamed/removed).
    const validSubtopicNames = new Set();
    for (const t of spine) {
      for (const st of (t.subtopics || [])) {
        validSubtopicNames.add(st.name);
      }
    }
    let validDone = 0;
    const doneSubtopicNames = [];
    for (const name of doneSet) {
      if (validSubtopicNames.has(name)) {
        validDone++;
        doneSubtopicNames.push(name);
      }
    }

    const percent = totalSubtopics > 0
      ? Math.round((validDone / totalSubtopics) * 100)
      : null;

    return ok(res, {
      totalSubtopics,
      doneCount: validDone,
      percent,
      remainingCount: Math.max(0, totalSubtopics - validDone),
      doneSubtopicNames,
    }, 'Summary.');
  } catch (err) {
    console.error('[syllabus-progress summary] error:', err);
    return fail(res, 500, err.message || 'Summary failed.');
  }
});

// ── DELETE /:progressId — Remove a "done" mark ────────────
// Correction case: teacher marked done by mistake.
router.delete('/:progressId', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { progressId } = req.params;
    if (!mongoose.isValidObjectId(progressId)) return fail(res, 400, 'Invalid progressId.');

    const result = await StudentSyllabusProgress.findByIdAndDelete(progressId);
    if (!result) return fail(res, 404, 'Progress record not found.');

    return ok(res, { deleted: true }, 'Unmarked.');
  } catch (err) {
    console.error('[syllabus-progress DELETE] error:', err);
    return fail(res, 500, err.message || 'Delete failed.');
  }
});

module.exports = router;
