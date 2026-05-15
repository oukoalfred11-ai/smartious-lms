const express = require('express');
const Allocation = require('../models/Allocation');
const User = require('../models/User');
const Subject = require('../models/Subject');
const { auth, requireRole } = require('../middleware/auth');
const {
  sendTeacherAllocationNotification,
  sendStudentAllocationNotification
} = require('../services/emailService');
const router = express.Router();

function logAudit(user, action, details) {
  console.log(`[AUDIT] ${user}: ${action}`, details);
}

// ─────────────────────────────────────────────────────────────────
// Allocation System
// ─────────────────────────────────────────────────────────────────
// CRITICAL DATA SHAPE NOTE
// User.subjects is an array of subject-NAME strings ("Mathematics",
// "Physics") and User.curriculum is a single curriculum code ("IGCSE").
// User.subjectRefs (ObjectId array) exists in the schema but is empty in
// production — no enrolment code populates it. Therefore every route
// that needs Subject documents for a student must resolve them by
// curriculum + subjectName lookup against the Subject collection.
//
// We deliberately do not populate User.subjects — Mongoose populate
// only works on ref-typed fields, and trying it on a string array is
// what caused the previous 500s on /pending-count, /stats/summary,
// /unallocated/:id, and POST /.
// ─────────────────────────────────────────────────────────────────

// Helper: resolve a student's enrolled Subject documents.
async function resolveStudentSubjects(student) {
  if (!student || !student.curriculum) return [];
  const names = Array.isArray(student.subjects) ? student.subjects : [];
  if (names.length === 0) return [];
  return Subject.find({
    curriculum: student.curriculum,
    subjectName: { $in: names },
    isActive: true,
  }).lean();
}

// GET /api/allocations - List all allocations
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    let allocations = await Allocation.find()
      .populate('studentId', 'firstName lastName email curriculum')
      .populate('teacherId', 'firstName lastName email isActive isOnLeave')
      .populate('subjectId', 'subjectName curriculum')
      .sort('-createdAt');

    allocations = allocations.filter(a => {
      return a.teacherId && a.teacherId.isActive && !a.teacherId.isOnLeave;
    });

    res.json({ success: true, allocations });
  } catch (e) {
    console.error('[allocations list]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/pending-count
router.get('/pending-count', auth, requireRole('admin'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('_id curriculum subjects')
      .lean();

    const allocations = await Allocation.find({ status: 'Active' })
      .populate('teacherId', '_id isActive isOnLeave')
      .lean();

    // Build a map: studentId → set of allocated subjectId strings (valid teachers only)
    const allocatedByStudent = new Map();
    for (const a of allocations) {
      if (!a.studentId || !a.teacherId) continue;
      if (!a.teacherId.isActive || a.teacherId.isOnLeave) continue;
      const key = a.studentId.toString();
      if (!allocatedByStudent.has(key)) allocatedByStudent.set(key, new Set());
      allocatedByStudent.get(key).add(a.subjectId.toString());
    }

    let pendingCount = 0;
    const pendingStudentIds = [];

    for (const student of students) {
      const subjects = await resolveStudentSubjects(student);
      if (subjects.length === 0) continue;
      const allocatedSet = allocatedByStudent.get(student._id.toString()) || new Set();
      const hasUnallocated = subjects.some(s => !allocatedSet.has(s._id.toString()));
      if (hasUnallocated) {
        pendingCount++;
        pendingStudentIds.push(student._id.toString());
      }
    }

    res.json({ success: true, pendingCount, pendingStudentIds });
  } catch (e) {
    console.error('[allocations pending-count]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/teacher
router.get('/teacher', auth, requireRole('teacher'), async (req, res) => {
  try {
    const allocations = await Allocation.find({ teacherId: req.user._id })
      .populate('studentId', 'firstName lastName email curriculum')
      .populate('subjectId', 'subjectName curriculum')
      .sort('-createdAt');
    res.json({ success: true, allocations });
  } catch (e) {
    console.error('[allocations teacher]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/student/:studentId
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isStudent = req.user._id.toString() === req.params.studentId;
    if (!isAdmin && !isStudent)
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    const allocations = await Allocation.find({ studentId: req.params.studentId })
      .populate('teacherId', 'firstName lastName email')
      .populate('subjectId', 'subjectName curriculum')
      .sort('-createdAt');

    res.json({ success: true, allocations });
  } catch (e) {
    console.error('[allocations student]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/unallocated/:studentId
router.get('/unallocated/:studentId', auth, requireRole('admin'), async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId).select('firstName lastName curriculum subjects role').lean();
    if (!student || student.role !== 'student')
      return res.status(404).json({ success: false, message: 'Student not found' });

    const subjects = await resolveStudentSubjects(student);

    if (subjects.length === 0) {
      return res.json({
        success: true,
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          curriculum: student.curriculum
        },
        unallocatedSubjects: []
      });
    }

    const allAllocations = await Allocation.find({
      studentId: studentId,
      status: { $ne: 'Inactive' }
    }).populate('teacherId', 'isActive isOnLeave');

    const validAllocations = allAllocations.filter(a =>
      a.teacherId && a.teacherId.isActive && !a.teacherId.isOnLeave
    );

    const allocatedSet = new Set(validAllocations.map(a => a.subjectId.toString()));
    const unallocatedSubjects = subjects.filter(s => !allocatedSet.has(s._id.toString()));

    res.json({
      success: true,
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        curriculum: student.curriculum
      },
      unallocatedSubjects
    });
  } catch (e) {
    console.error('[allocations unallocated]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/suggest-teachers/:studentId/:subjectId
router.get('/suggest-teachers/:studentId/:subjectId', auth, requireRole('admin'), async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student')
      return res.status(404).json({ success: false, message: 'Student not found' });
    if (!student.curriculum)
      return res.status(400).json({ success: false, message: 'Student has no curriculum set' });

    const subject = await Subject.findById(subjectId);
    if (!subject)
      return res.status(404).json({ success: false, message: 'Subject not found' });

    const qualifiedTeachers = await User.find({
      role: 'teacher',
      isActive: true,
      teachingSpecialties: {
        $elemMatch: {
          subjectId: subject._id,
          curriculum: student.curriculum
        }
      }
    }).select('firstName lastName email');

    const existingAllocation = await Allocation.findOne({
      studentId: studentId,
      subjectId: subjectId,
      status: { $ne: 'Inactive' }
    });

    res.json({
      success: true,
      subject: {
        _id: subject._id,
        subjectName: subject.subjectName,
        curriculum: subject.curriculum
      },
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        curriculum: student.curriculum
      },
      qualifiedTeachers,
      currentTeacherId: existingAllocation?.teacherId || null,
      availableForSelection: qualifiedTeachers.filter(t =>
        !existingAllocation || t._id.toString() !== existingAllocation.teacherId.toString()
      )
    });
  } catch (e) {
    console.error('[allocations suggest-teachers]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/allocations
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { studentId, subjectId, teacherId, sendEmails = true } = req.body;

    if (!studentId || !subjectId || !teacherId) {
      return res.status(400).json({
        success: false,
        message: 'studentId, subjectId, and teacherId are required'
      });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student')
      return res.status(404).json({ success: false, message: 'Student not found' });
    if (!student.curriculum)
      return res.status(400).json({ success: false, message: 'Student has no curriculum assigned' });

    const subject = await Subject.findById(subjectId);
    if (!subject)
      return res.status(404).json({ success: false, message: 'Subject not found' });

    // Verify enrolment: name match + curriculum match
    const enrolledNames = Array.isArray(student.subjects) ? student.subjects : [];
    const isEnrolled = enrolledNames.includes(subject.subjectName) &&
                       subject.curriculum === student.curriculum;
    if (!isEnrolled)
      return res.status(400).json({ success: false, message: 'Student is not enrolled in this subject' });

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher')
      return res.status(404).json({ success: false, message: 'Teacher not found' });

    const hasSpecialty = teacher.teachingSpecialties?.some(ts =>
      ts.subjectId.toString() === subjectId && ts.curriculum === student.curriculum
    );

    if (!hasSpecialty) {
      return res.status(400).json({
        success: false,
        message: `Teacher does not have specialty in ${subject.subjectName} for ${student.curriculum}`
      });
    }

    const existingAllocation = await Allocation.findOne({
      studentId: studentId,
      subjectId: subjectId,
      status: { $ne: 'Inactive' }
    });

    if (existingAllocation) {
      return res.status(400).json({
        success: false,
        message: 'Student already has a teacher for this subject'
      });
    }

    const allocation = await Allocation.create({
      studentId,
      subjectId,
      teacherId,
      curriculum: student.curriculum,
      status: 'Active',
      createdBy: req.user._id
    });

    await allocation.populate('studentId', 'firstName lastName email');
    await allocation.populate('teacherId', 'firstName lastName email');
    await allocation.populate('subjectId', 'subjectName curriculum');

    if (sendEmails) {
      try {
        await sendTeacherAllocationNotification({
          teacherEmail: teacher.email,
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          studentName: `${student.firstName} ${student.lastName}`,
          studentEmail: student.email,
          subjects: [{ subjectName: subject.subjectName }],
          curriculum: student.curriculum,
          allocationId: allocation._id
        });

        await sendStudentAllocationNotification({
          studentEmail: student.email,
          studentName: `${student.firstName} ${student.lastName}`,
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          subjects: [{ subjectName: subject.subjectName }],
          curriculum: student.curriculum,
          allocationId: allocation._id
        });

        allocation.emailsSent = true;
        await allocation.save();
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr.message);
      }
    }

    logAudit(
      req.user?.email || 'system',
      'create_allocation',
      `${student.firstName} ${student.lastName} → ${teacher.firstName} ${teacher.lastName} (${subject.subjectName})`
    );

    res.status(201).json({ success: true, allocation, emailsSent: sendEmails });
  } catch (e) {
    console.error('[allocations create]', e.message);
    res.status(400).json({ success: false, message: e.message });
  }
});

// PATCH /api/allocations/:id
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { teacherId, status } = req.body;
    const allocation = await Allocation.findById(req.params.id);

    if (!allocation)
      return res.status(404).json({ success: false, message: 'Allocation not found' });

    if (teacherId && teacherId !== allocation.teacherId.toString()) {
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher')
        return res.status(404).json({ success: false, message: 'Teacher not found' });

      const hasSpecialty = teacher.teachingSpecialties?.some(ts =>
        ts.subjectId.toString() === allocation.subjectId.toString() &&
        ts.curriculum === allocation.curriculum
      );

      if (!hasSpecialty) {
        return res.status(400).json({
          success: false,
          message: 'New teacher does not have required specialty'
        });
      }
    }

    const updated = await Allocation.findByIdAndUpdate(
      req.params.id,
      {
        ...(teacherId && { teacherId }),
        ...(status && { status }),
        updatedBy: req.user._id,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('studentId', 'firstName lastName email')
     .populate('teacherId', 'firstName lastName email')
     .populate('subjectId', 'subjectName curriculum');

    logAudit(req.user?.email || 'system', 'update_allocation', allocation._id);
    res.json({ success: true, allocation: updated });
  } catch (e) {
    console.error('[allocations patch]', e.message);
    res.status(400).json({ success: false, message: e.message });
  }
});

// DELETE — disabled for audit trail
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Allocation deletion is disabled. Use PATCH with status: Inactive to deactivate.'
  });
});

// GET /api/allocations/stats/summary
router.get('/stats/summary', auth, requireRole('admin'), async (req, res) => {
  try {
    const totalAllocations = await Allocation.countDocuments({ status: 'Active' });

    const students = await User.find({ role: 'student' })
      .select('_id curriculum subjects')
      .lean();

    let totalSubjectPairs = 0;
    let unallocatedPairs = 0;

    for (const student of students) {
      const subjects = await resolveStudentSubjects(student);
      const subjectCount = subjects.length;
      totalSubjectPairs += subjectCount;

      if (subjectCount > 0) {
        const allocatedCount = await Allocation.countDocuments({
          studentId: student._id,
          status: 'Active'
        });
        unallocatedPairs += Math.max(0, subjectCount - allocatedCount);
      }
    }

    res.json({
      success: true,
      stats: {
        totalActiveAllocations: totalAllocations,
        unallocatedSubjectPairs: unallocatedPairs,
        totalSubjectPairs: totalSubjectPairs,
        allocationRate: totalSubjectPairs > 0 ? Math.round(((totalSubjectPairs - unallocatedPairs) / totalSubjectPairs) * 100) : 0
      }
    });
  } catch (e) {
    console.error('[allocations stats]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
