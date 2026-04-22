const express = require('express');
const User = require('../models/User');
const Allocation = require('../models/Allocation');
const TeacherLeaveRequest = require('../models/TeacherLeaveRequest');
const { auth, requireRole } = require('../middleware/auth');
const emailService = require('../services/emailService');
const router = express.Router();

// ─────────────────────────────────────────────────────────────────
// STUDENT STATUS MANAGEMENT
// ─────────────────────────────────────────────────────────────────

// PATCH /api/users/:id/student-status - Change student status (admin only)
router.patch('/:id/student-status', auth, requireRole('admin'), async (req, res) => {
  try {
    const { newStatus, reason } = req.body;
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const oldStatus = student.studentStatus || 'Active';

    // Update student status
    student.studentStatus = newStatus;
    student.statusChangedAt = new Date();
    student.statusChangedBy = req.user._id;
    student.statusReason = reason || '';
    
    // If student is no longer active, deactivate them
    if (['Graduated', 'Inactive', 'Removed', 'Non-Paying'].includes(newStatus)) {
      student.isActive = false;
    } else if (newStatus === 'Active') {
      student.isActive = true;
    }

    await student.save();

    // When student becomes inactive, handle linked parents
    if (oldStatus === 'Active' && newStatus !== 'Active') {
      // Check each linked parent
      const linkedParents = await User.find({ 
        role: 'parent', 
        linkedStudents: student._id 
      });

      for (const parent of linkedParents) {
        // Check if parent has other active students
        const activeStudents = await User.find({
          _id: { $in: parent.linkedStudents },
          role: 'student',
          studentStatus: 'Active'
        });

        // If no active students, deactivate parent
        if (activeStudents.length === 0) {
          parent.isActive = false;
          await parent.save();
          console.log(`✓ Parent ${parent.firstName} ${parent.lastName} deactivated (no active students)`);
        }
      }
    }

    // If re-activating, also re-activate linked parents
    if (oldStatus !== 'Active' && newStatus === 'Active') {
      const linkedParents = await User.find({
        role: 'parent',
        linkedStudents: student._id
      });

      for (const parent of linkedParents) {
        if (!parent.isActive) {
          parent.isActive = true;
          await parent.save();
          console.log(`✓ Parent ${parent.firstName} ${parent.lastName} reactivated`);
        }
      }
    }

    console.log(`✓ Student ${student.firstName} ${student.lastName} status changed to ${newStatus}`);

    res.json({ 
      success: true, 
      user: student,
      message: `Student status changed to ${newStatus}` 
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// GET /api/users/students/status - Get all students by status
router.get('/students/status', auth, requireRole('admin'), async (req, res) => {
  try {
    const status = req.query.status || 'Active';
    const students = await User.find({
      role: 'student',
      studentStatus: status
    }).select('firstName lastName email studentStatus statusChangedAt');

    res.json({ success: true, count: students.length, students });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// TEACHER LEAVE REQUEST MANAGEMENT
// ─────────────────────────────────────────────────────────────────

// POST /api/leave-requests - Create leave request (teacher only)
router.post('/', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { leaveStartDate, leaveEndDate, leaveReason, leaveType } = req.body;
    const teacher = await User.findById(req.user._id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Validate dates
    if (new Date(leaveStartDate) >= new Date(leaveEndDate)) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    // Create leave request
    const leaveRequest = await TeacherLeaveRequest.create({
      teacherId: teacher._id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      teacherEmail: teacher.email,
      leaveStartDate,
      leaveEndDate,
      leaveReason,
      leaveType: leaveType || 'Personal',
      status: 'Pending'
    });

    // Send confirmation email to teacher
    await emailService.sendLeaveRequestSubmittedEmail({
      teacherEmail: teacher.email,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      leaveType: leaveType || 'Personal',
      leaveStartDate,
      leaveEndDate,
      leaveReason
    });

    // Send notification to all admins
    const admins = await User.find({ role: 'admin' }).select('email');
    for (const admin of admins) {
      await emailService.sendAdminLeaveRequestNotification({
        adminEmail: admin.email,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        teacherEmail: teacher.email,
        leaveType: leaveType || 'Personal',
        leaveStartDate,
        leaveEndDate,
        leaveReason
      });
    }

    console.log(`✓ Leave request created for ${teacher.firstName} ${teacher.lastName}`);

    res.status(201).json({ 
      success: true, 
      leaveRequest,
      message: 'Leave request submitted for approval' 
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// GET /api/leave-requests - Get all leave requests (admin only)
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const status = req.query.status || 'Pending';
    const leaveRequests = await TeacherLeaveRequest.find({ status })
      .populate('teacherId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort('-createdAt');

    res.json({ success: true, count: leaveRequests.length, leaveRequests });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/leave-requests/pending-count - Get count of pending leave requests (admin only)
router.get('/pending-count', auth, requireRole('admin'), async (req, res) => {
  try {
    const pendingCount = await TeacherLeaveRequest.countDocuments({ status: 'Pending' });
    res.json({ success: true, pendingCount });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/leave-requests/:id/approve - Approve leave request (admin only)
router.patch('/:id/approve', auth, requireRole('admin'), async (req, res) => {
  try {
    const leaveRequest = await TeacherLeaveRequest.findById(req.params.id)
      .populate('teacherId', '_id firstName lastName email');

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Can only approve pending requests' });
    }

    // Approve the request
    leaveRequest.status = 'Approved';
    leaveRequest.approvedBy = req.user._id;
    leaveRequest.approvalDate = new Date();
    await leaveRequest.save();

    // Update teacher status and leave dates
    const teacher = await User.findById(leaveRequest.teacherId._id);
    teacher.teacherStatus = 'On Leave Approved';
    teacher.isOnLeave = true;
    teacher.leaveStartDate = leaveRequest.leaveStartDate;
    teacher.leaveEndDate = leaveRequest.leaveEndDate;
    await teacher.save();

    // Find and mark affected allocations as needing reassignment
    const affectedAllocations = await Allocation.find({
      teacherId: leaveRequest.teacherId._id,
      status: 'Active'
    });

    // Store affected allocations in the leave request
    leaveRequest.affectedAllocations = affectedAllocations.map(a => a._id);
    await leaveRequest.save();

    // Send approval email to teacher
    await emailService.sendLeaveRequestApprovedEmail({
      teacherEmail: leaveRequest.teacherId.email,
      teacherName: leaveRequest.teacherName,
      leaveType: leaveRequest.leaveType,
      leaveStartDate: leaveRequest.leaveStartDate,
      leaveEndDate: leaveRequest.leaveEndDate,
      affectedStudents: affectedAllocations.length,
      approvedBy: `${req.user.firstName} ${req.user.lastName}`
    });

    console.log(`✓ Leave request approved for ${teacher.firstName} ${teacher.lastName}`);
    console.log(`  Affected allocations: ${affectedAllocations.length}`);

    res.json({
      success: true,
      leaveRequest,
      affectedAllocations: affectedAllocations.length,
      message: 'Leave request approved. Affected students marked as pending allocation.'
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// PATCH /api/leave-requests/:id/reject - Reject leave request (admin only)
router.patch('/:id/reject', auth, requireRole('admin'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const leaveRequest = await TeacherLeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Can only reject pending requests' });
    }

    leaveRequest.status = 'Rejected';
    leaveRequest.rejectionReason = rejectionReason || '';
    await leaveRequest.save();

    // Send rejection email to teacher
    const teacher = await User.findById(leaveRequest.teacherId).select('email firstName lastName');
    if (teacher) {
      await emailService.sendLeaveRequestRejectedEmail({
        teacherEmail: teacher.email,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        leaveType: leaveRequest.leaveType,
        leaveStartDate: leaveRequest.leaveStartDate,
        leaveEndDate: leaveRequest.leaveEndDate,
        rejectionReason: rejectionReason
      });
    }

    console.log(`✓ Leave request rejected for ${leaveRequest.teacherName}`);

    res.json({
      success: true,
      leaveRequest,
      message: 'Leave request rejected'
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// PATCH /api/leave-requests/:id/cancel - Cancel leave request (teacher or admin)
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const leaveRequest = await TeacherLeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Only teacher who made request or admin can cancel
    if (req.user.role !== 'admin' && leaveRequest.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (['Cancelled', 'Rejected'].includes(leaveRequest.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this request' });
    }

    leaveRequest.status = 'Cancelled';
    await leaveRequest.save();

    // If was approved, revert teacher status
    if (leaveRequest.status === 'Approved') {
      const teacher = await User.findById(leaveRequest.teacherId);
      teacher.teacherStatus = 'Active';
      teacher.isOnLeave = false;
      teacher.leaveStartDate = null;
      teacher.leaveEndDate = null;
      await teacher.save();
    }

    console.log(`✓ Leave request cancelled for ${leaveRequest.teacherName}`);

    res.json({
      success: true,
      leaveRequest,
      message: 'Leave request cancelled'
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;

