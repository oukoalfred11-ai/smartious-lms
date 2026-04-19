
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

// Audit log stub
function logAudit(user, action, details) {
  // TODO: Implement persistent audit logging
  console.log(`[AUDIT] ${user}: ${action}`, details);
}

// ─────────────────────────────────────────────────────────────────
// PHASE 7: Subject-Curriculum Allocation System
// 3-Point Check: Student + Subject + Curriculum match Teacher specialty
// ─────────────────────────────────────────────────────────────────

// GET /api/allocations - List all allocations with details
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    // Get all allocations
    let allocations = await Allocation.find()
      .populate('studentId', 'firstName lastName email curriculum')
      .populate('teacherId', 'firstName lastName email isActive isOnLeave')
      .populate('subjectId', 'subjectName curriculum')
      .sort('-createdAt');

    // Filter out allocations where teacher is inactive or on leave
    allocations = allocations.filter(a => {
      return a.teacherId && a.teacherId.isActive && !a.teacherId.isOnLeave;
    });

    res.json({ success: true, allocations });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/pending-count - Get count of students needing allocation (any unallocated subjects)
router.get('/pending-count', auth, requireRole('admin'), async (req, res) => {
  try {
    // Get all students with subjects
    const students = await User.find({ role: 'student' })
      .select('_id subjects')
      .populate('subjects', '_id');

    // Get all active allocations with valid teachers
    const allocations = await Allocation.find({ status: 'Active' })
      .populate('teacherId', '_id isActive isOnLeave')
      .populate('studentId', '_id');

    // For each student, check if they have any unallocated subjects
    const studentsNeedingAllocation = new Set();

    for (const student of students) {
      if (!student.subjects || student.subjects.length === 0) {
        continue; // Skip students with no subjects
      }

      const studentSubjectIds = student.subjects.map(s => s._id.toString());

      // Get valid allocations for this student (teacher must be active and not on leave)
      const validAllocations = allocations.filter(a => 
        a.studentId && a.studentId._id.toString() === student._id.toString() &&
        a.teacherId && a.teacherId.isActive && !a.teacherId.isOnLeave
      );

      const allocatedSubjectIds = new Set(validAllocations.map(a => a.subjectId.toString()));

      // Check if any subjects are unallocated
      const hasUnallocated = studentSubjectIds.some(subjectId => !allocatedSubjectIds.has(subjectId));

      if (hasUnallocated) {
        studentsNeedingAllocation.add(student._id.toString());
      }
    }

    res.json({ 
      success: true, 
      pendingCount: studentsNeedingAllocation.size,
      pendingStudentIds: Array.from(studentsNeedingAllocation)
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/teacher - List allocations for current teacher
router.get('/teacher', auth, requireRole('teacher'), async (req, res) => {
  try {
    const allocations = await Allocation.find({ teacherId: req.user._id })
      .populate('studentId', 'firstName lastName email curriculum')
      .populate('subjectId', 'subjectName curriculum')
      .sort('-createdAt');
    res.json({ success: true, allocations });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/student/:studentId - List allocations for a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    // Check authorization: user is admin OR is the student
    const isAdmin = req.user.role === 'admin';
    const isStudent = req.user._id.toString() === req.params.studentId;
    
    if (!isAdmin && !isStudent) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const allocations = await Allocation.find({ studentId: req.params.studentId })
      .populate('teacherId', 'firstName lastName email')
      .populate('subjectId', 'subjectName curriculum')
      .sort('-createdAt');
    
    res.json({ success: true, allocations });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/unallocated/:studentId - Find subjects without teacher assignment
router.get('/unallocated/:studentId', auth, requireRole('admin'), async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify student exists
    const student = await User.findById(studentId).populate('subjects');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!student.subjects || student.subjects.length === 0) {
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

    // Get all subjects the student is enrolled in
    const studentSubjectIds = student.subjects.map(s => s._id.toString());

     // Find which subjects already have ACTIVE teacher allocations
     // Exclude allocations where teacher is inactive or on leave
     const allAllocations = await Allocation.find({ 
       studentId: studentId,
       status: { $ne: 'Inactive' }
     }).populate('teacherId', 'isActive isOnLeave');

     // Filter to only active teacher allocations
     const validAllocations = allAllocations.filter(a => 
       a.teacherId && a.teacherId.isActive && !a.teacherId.isOnLeave
     );
     
     const allocatedSubjectIds = validAllocations.map(a => a.subjectId.toString());

    // Filter unallocated subjects
    const allocatedSet = new Set(allocatedSubjectIds.map(id => id.toString()));
    const unallocatedSubjectIds = studentSubjectIds.filter(id => !allocatedSet.has(id));

    // Get full subject details
    const unallocatedSubjects = await Subject.find({ 
      _id: { $in: unallocatedSubjectIds } 
    });

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
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/suggest-teachers/:studentId/:subjectId - Get teachers for subject+curriculum
router.get('/suggest-teachers/:studentId/:subjectId', auth, requireRole('admin'), async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;

    // Get student with curriculum
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!student.curriculum) {
      return res.status(400).json({ success: false, message: 'Student has no curriculum set' });
    }

    // Get subject details
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Find teachers with matching teachingSpecialties (Subject + Curriculum pair)
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

    // Check which teachers are already allocated to this student for this subject
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
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/allocations - Create allocation (3-Point Check)
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { studentId, subjectId, teacherId, sendEmails = true } = req.body;

    // Validate inputs
    if (!studentId || !subjectId || !teacherId) {
      return res.status(400).json({
        success: false,
        message: 'studentId, subjectId, and teacherId are required'
      });
    }

    // ── 3-Point Check ──
    
    // 1. Verify student exists and has curriculum
    const student = await User.findById(studentId).populate('subjects');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    if (!student.curriculum) {
      return res.status(400).json({ success: false, message: 'Student has no curriculum assigned' });
    }

    // 2. Verify subject exists and student is enrolled
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    
    const studentSubjectIds = student.subjects.map(s => s._id.toString());
    if (!studentSubjectIds.includes(subjectId)) {
      return res.status(400).json({ success: false, message: 'Student is not enrolled in this subject' });
    }

    // 3. Verify teacher has matching teachingSpecialty (Subject + Curriculum pair)
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const hasSpecialty = teacher.teachingSpecialties?.some(ts => 
      ts.subjectId.toString() === subjectId && ts.curriculum === student.curriculum
    );

    if (!hasSpecialty) {
      return res.status(400).json({ 
        success: false, 
        message: `Teacher does not have specialty in ${subject.subjectName} for ${student.curriculum}` 
      });
    }

    // ── Constraint: One teacher per subject, per student ──
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

    // Create allocation
    const allocation = await Allocation.create({
      studentId,
      subjectId,
      teacherId,
      curriculum: student.curriculum,
      status: 'Active',
      createdBy: req.user._id
    });

    // Populate for response
    await allocation.populate('studentId', 'firstName lastName email');
    await allocation.populate('teacherId', 'firstName lastName email');
    await allocation.populate('subjectId', 'subjectName curriculum');

    // Send email notifications if enabled
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
        // Don't fail the allocation just because emails failed
      }
    }

    logAudit(
      req.user?.email || 'system',
      'create_allocation',
      `${student.firstName} ${student.lastName} → ${teacher.firstName} ${teacher.lastName} (${subject.subjectName})`
    );

    res.status(201).json({ success: true, allocation, emailsSent: sendEmails });
  } catch (e) {
    console.error('Error creating allocation:', e.message);
    res.status(400).json({ success: false, message: e.message });
  }
});

// PATCH /api/allocations/:id - Update allocation (e.g., reassign teacher)
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { teacherId, status } = req.body;
    const allocation = await Allocation.findById(req.params.id);
    
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Allocation not found' });
    }

    // If reassigning teacher, verify the new teacher has the specialty
    if (teacherId && teacherId !== allocation.teacherId.toString()) {
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(404).json({ success: false, message: 'Teacher not found' });
      }

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

    // Update allocation
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
    res.status(400).json({ success: false, message: e.message });
  }
});

// DELETE /api/allocations/:id - Delete allocation (DISABLED for audit trail)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  res.status(403).json({ 
    success: false, 
    message: 'Allocation deletion is disabled. Use PATCH with status: Inactive to deactivate.' 
  });
});

// GET /api/allocations/stats/summary - Dashboard stats
router.get('/stats/summary', auth, requireRole('admin'), async (req, res) => {
  try {
    const totalAllocations = await Allocation.countDocuments({ status: 'Active' });
    
    // Count unallocated subject pairs
    const students = await User.find({ role: 'student' })
      .populate('subjects', '_id');
    
    let totalSubjectPairs = 0;
    let unallocatedPairs = 0;

    for (const student of students) {
      const subjectCount = student.subjects?.length || 0;
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
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
