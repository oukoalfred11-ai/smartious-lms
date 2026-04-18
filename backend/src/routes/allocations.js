
const express = require('express');
const Allocation = require('../models/Allocation');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const { auth, requireRole } = require('../middleware/auth');
const { findCompatibleTeachers, findCompatibleStudents, getMatchStatistics } = require('../services/matchingService');
const { 
  sendTeacherAllocationNotification, 
  sendStudentAllocationNotification,
  sendAdminNotification 
} = require('../services/emailService');
const {
  getAllUniqueSubjectNames,
  findTeachersBySubjectName,
  findStudentsBySubjectName,
  getSubjectStatistics
} = require('../services/crossBoardMatchingService');
const router = express.Router();

// Audit log stub
function logAudit(user, action, details) {
  // TODO: Implement persistent audit logging
  console.log(`[AUDIT] ${user}: ${action}`, details);
}

// GET /api/allocations - List all allocations
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate('studentId', 'firstName lastName email curriculum')
      .populate('teacherId', 'firstName lastName email')
      .populate('subjects', 'subjectName category')
      .sort('-createdAt');
    res.json({ success: true, allocations });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/teacher - List allocations for teacher
router.get('/teacher', auth, requireRole('teacher'), async (req, res) => {
  try {
    const allocations = await Allocation.find({ teacherId: req.user._id })
      .populate('studentId', 'firstName lastName email curriculum')
      .populate('subjects', 'subjectName category curriculum')
      .sort('-createdAt');
    res.json({ success: true, allocations });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/matches/teachers/:studentId - Find compatible teachers for a student
router.get('/matches/teachers/:studentId', auth, requireRole('admin'), async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get compatible teachers
    const matches = await findCompatibleTeachers(studentId);
    const stats = getMatchStatistics(matches);

    res.json({
      success: true,
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        curriculum: student.curriculum
      },
      matches,
      statistics: stats
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/matches/students/:teacherId - Find compatible students for a teacher
router.get('/matches/students/:teacherId', auth, requireRole('admin'), async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Validate teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Get compatible students
    const matches = await findCompatibleStudents(teacherId);
    const stats = getMatchStatistics(matches);

    res.json({
      success: true,
      teacher: {
        _id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        curriculum: teacher.curriculum
      },
      matches,
      statistics: stats
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/allocations - Create allocation with matching and email notifications
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { studentId, teacherId, subjects, sendEmails = true } = req.body;

    // Validate inputs
    if (!studentId || !teacherId) {
      return res.status(400).json({
        success: false,
        message: 'studentId and teacherId are required'
      });
    }

    // Verify student and teacher exist
    const student = await User.findById(studentId);
    const teacher = await Teacher.findById(teacherId);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Calculate match score if not provided
    let matchScore = req.body.matchScore;
    if (!matchScore && student.subjects && student.subjects.length > 0) {
      const studentSubjectIds = student.subjects.map(s => s._id?.toString() || s.toString());
      const teacherSubjectIds = teacher.subjects ? teacher.subjects.map(s => s._id?.toString() || s.toString()) : [];
      
      if (teacherSubjectIds.length > 0) {
        const matchedCount = studentSubjectIds.filter(id => teacherSubjectIds.includes(id)).length;
        matchScore = Math.round((matchedCount / studentSubjectIds.length) * 100);
      } else {
        matchScore = 50; // Partial match if no subject overlap
      }
    }

    // Create allocation
    const allocation = await Allocation.create({
      studentId,
      teacherId,
      subjects: subjects || student.subjects || [],
      curriculum: student.curriculum,
      matchType: 'Matched',
      matchScore: matchScore || 0,
      status: 'Pending',
      createdBy: req.user._id
    });

    // Populate references for response
    await allocation.populate('studentId', 'firstName lastName email');
    await allocation.populate('teacherId', 'firstName lastName email');
    await allocation.populate('subjects', 'subjectName');

    // Send email notifications if enabled
    if (sendEmails) {
      const subjectNames = allocation.subjects.map(s => ({ subjectName: s.subjectName }));

      // Send to teacher
      await sendTeacherAllocationNotification({
        teacherEmail: teacher.email,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email,
        subjects: subjectNames,
        curriculum: student.curriculum,
        matchScore: matchScore || 0,
        allocationId: allocation._id
      });

      // Send to student
      await sendStudentAllocationNotification({
        studentEmail: student.email,
        studentName: `${student.firstName} ${student.lastName}`,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        subjects: subjectNames,
        curriculum: student.curriculum,
        matchScore: matchScore || 0,
        allocationId: allocation._id
      });

      // Mark as emails sent
      allocation.emailsSent = true;
      await allocation.save();
    }

    logAudit(
      req.user?.email || 'system',
      'create_allocation',
      `${student.firstName} ${student.lastName} → ${teacher.firstName} ${teacher.lastName}`
    );

    console.log(`✓ Allocation created: ${student.firstName} → ${teacher.firstName} (Match: ${matchScore}%)`);

    res.status(201).json({ success: true, allocation, emailsSent: sendEmails });
  } catch (e) {
    console.error('Error creating allocation:', e.message);
    res.status(400).json({ success: false, message: e.message });
  }
});

// PATCH /api/allocations/:id - Update allocation (e.g., reassign)
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const allocation = await Allocation.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id, updatedAt: new Date() },
      { new: true }
    );
    if (!allocation) return res.status(404).json({ success: false, message: 'Allocation not found' });
    logAudit(req.user?.email || 'system', 'update_allocation', allocation);
    res.json({ success: true, allocation });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// DELETE /api/allocations/:id - Delete allocation (DISABLED - per security policy)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  res.status(403).json({ 
    success: false, 
    message: 'Allocation deletion is disabled. Only admins can edit or reassign allocations. Use PATCH to modify.' 
  });
});

// POST /api/allocations/:id/approve - DEPRECATED: Use email verification flow instead
// Allocations are now auto-activated via email verification, not manual approval
router.post('/:id/approve', auth, requireRole('admin'), async (req, res) => {
  res.status(405).json({ 
    success: false, 
    message: 'Manual approval is deprecated. Allocations are managed via email verification flow and PATCH updates.' 
  });
});

// ── PHASE 6: Cross-Board Subject Matching Endpoints ─────────────────

// GET /api/allocations/cross-board/subjects - Get all unique subject names across boards
// Public endpoint - no authentication required
router.get('/cross-board/subjects', async (req, res) => {
  try {
    const subjects = await getAllUniqueSubjectNames();
    res.json({
      success: true,
      subjects,
      total: subjects.length
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/cross-board/subject-stats/:subjectName - Get statistics for a subject across boards
// Public endpoint - no authentication required
router.get('/cross-board/subject-stats/:subjectName', async (req, res) => {
  try {
    const stats = await getSubjectStatistics(req.params.subjectName);
    res.json({
      success: true,
      statistics: stats
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/cross-board/teachers/subject/:subjectName - Find teachers by subject name across all boards
// PHASE 6: Subject-centric matcher ignoring curriculum boundaries
// Public endpoint - no authentication required
router.get('/cross-board/teachers/subject/:subjectName', async (req, res) => {
  try {
    const { universalOnly } = req.query;
    const teachers = await findTeachersBySubjectName(
      req.params.subjectName,
      universalOnly === 'true'
    );
    
    res.json({
      success: true,
      subjectName: req.params.subjectName,
      teachers,
      total: teachers.length,
      universal: universalOnly === 'true'
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/allocations/cross-board/students/subject/:subjectName - Find students by subject name across all boards
// Public endpoint - no authentication required
router.get('/cross-board/students/subject/:subjectName', async (req, res) => {
  try {
    const students = await findStudentsBySubjectName(req.params.subjectName);
    
    res.json({
      success: true,
      subjectName: req.params.subjectName,
      students,
      total: students.length
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
