const router = require('express').Router();
const User = require('../models/User');
const Allocation = require('../models/Allocation');
const Lesson = require('../models/Lesson');
const LessonProgress = require('../models/LessonProgress');
const { auth, requireRole } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────
// Helper: confirm the logged-in parent is linked to a student.
// Returns the student doc if linked, otherwise null.
// ─────────────────────────────────────────────────────────
async function assertParentOwnsChild(parentId, studentId) {
  const mongoose = require('mongoose');
  if (!mongoose.isValidObjectId(studentId)) return null;

  const parent = await User.findById(parentId)
    .select('linkedStudents children')
    .lean();
  if (!parent) return null;

  const ownIds = [
    ...(parent.linkedStudents || []).map(String),
    ...(parent.children || []).map(String),
  ];
  if (!ownIds.includes(String(studentId))) return null;

  return User.findById(studentId)
    .select('_id firstName lastName email programme deliveryMode curriculum gradeLevel grade subjects admissionNumber avatar isActive')
    .lean();
}

// ─────────────────────────────────────────────────────────
// GET /api/parents/my-children
// The logged-in parent's linked children — basic cards.
// ─────────────────────────────────────────────────────────
router.get('/my-children', auth, requireRole('parent', 'admin'), async (req, res) => {
  try {
    const parent = await User.findById(req.user._id)
      .select('linkedStudents children')
      .lean();

    const childIds = [...new Set([
      ...((parent?.linkedStudents) || []).map(String),
      ...((parent?.children) || []).map(String),
    ])];

    if (childIds.length === 0)
      return res.json({ success: true, data: { children: [] } });

    const children = await User.find({ _id: { $in: childIds }, role: 'student' })
      .select('_id firstName lastName programme deliveryMode curriculum gradeLevel grade avatar admissionNumber isActive')
      .sort('firstName')
      .lean();

    res.json({
      success: true,
      data: {
        children: children.map(c => ({
          _id: c._id,
          name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
          firstName: c.firstName || '',
          programme: c.programme || '',
          deliveryMode: c.deliveryMode || '',
          curriculum: typeof c.curriculum === 'string' ? c.curriculum : '',
          grade: c.gradeLevel || c.grade || '',
          avatar: c.avatar || '',
          admissionNumber: c.admissionNumber || '',
          isActive: c.isActive !== false,
        })),
      },
    });
  } catch (e) {
    console.error('[parents my-children]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/parents/child/:studentId/overview
// Dashboard + Programme data for one child. Ownership verified.
// ─────────────────────────────────────────────────────────
router.get('/child/:studentId/overview', auth, requireRole('parent', 'admin'), async (req, res) => {
  try {
    const student = await assertParentOwnsChild(req.user._id, req.params.studentId);
    if (!student)
      return res.status(403).json({ success: false, message: 'Not your child, or child not found.' });

    // Allocations — which subjects + teachers
    const allocations = await Allocation.find({ studentId: student._id, status: 'Active' })
      .populate('subjectId', 'subjectName curriculum')
      .populate('teacherId', 'firstName lastName')
      .lean();

    const subjectsAllocated = allocations.map(a => ({
      subjectId: a.subjectId?._id || a.subjectId,
      subjectName: a.subjectId?.subjectName || 'Subject',
      curriculum: a.curriculum || a.subjectId?.curriculum || '',
      teacher: a.teacherId
        ? `${a.teacherId.firstName || ''} ${a.teacherId.lastName || ''}`.trim()
        : 'Unassigned',
    }));

    res.json({
      success: true,
      data: {
        child: {
          _id: student._id,
          name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          programme: student.programme || '',
          deliveryMode: student.deliveryMode || '',
          curriculum: typeof student.curriculum === 'string' ? student.curriculum : '',
          grade: student.gradeLevel || student.grade || '',
          admissionNumber: student.admissionNumber || '',
          avatar: student.avatar || '',
          subjectNames: Array.isArray(student.subjects) ? student.subjects : [],
        },
        allocations: subjectsAllocated,
        stats: {
          enrolledSubjects: Array.isArray(student.subjects) ? student.subjects.length : 0,
          allocatedSubjects: subjectsAllocated.length,
        },
      },
    });
  } catch (e) {
    console.error('[parents child overview]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/parents/child/:studentId/progress
// Academic Progress — per-subject lesson mastery for one child.
// Mastery comes from LessonProgress records (teacher-marked).
// ─────────────────────────────────────────────────────────
router.get('/child/:studentId/progress', auth, requireRole('parent', 'admin'), async (req, res) => {
  try {
    const student = await assertParentOwnsChild(req.user._id, req.params.studentId);
    if (!student)
      return res.status(403).json({ success: false, message: 'Not your child, or child not found.' });

    // Active allocations give the subjects in play
    const allocations = await Allocation.find({ studentId: student._id, status: 'Active' })
      .populate('subjectId', 'subjectName curriculum color')
      .lean();

    // The child's mastery records, keyed by subject
    const progressRecords = await LessonProgress.find({ studentId: student._id }).lean();
    const masteredBySubject = {};
    progressRecords.forEach(p => {
      const sid = String(p.subjectId);
      masteredBySubject[sid] = (masteredBySubject[sid] || 0) + 1;
    });

    const subjects = [];
    for (const a of allocations) {
      const subjId = a.subjectId?._id || a.subjectId;
      if (!subjId) continue;
      const totalLessons = await Lesson.countDocuments({
        subjectId: subjId, status: 'published',
      });
      const mastered = masteredBySubject[String(subjId)] || 0;
      const pct = totalLessons > 0 ? Math.round((mastered / totalLessons) * 100) : 0;
      subjects.push({
        subjectId: subjId,
        name: a.subjectId?.subjectName || 'Subject',
        curriculum: a.curriculum || a.subjectId?.curriculum || '',
        color: a.subjectId?.color || '#7D1025',
        totalLessons,
        masteredLessons: mastered,
        progressPct: pct,
      });
    }

    const overallPct = subjects.length > 0
      ? Math.round(subjects.reduce((s, x) => s + x.progressPct, 0) / subjects.length)
      : 0;

    res.json({
      success: true,
      data: {
        childName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        subjects,
        overallPct,
      },
    });
  } catch (e) {
    console.error('[parents child progress]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
