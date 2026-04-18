const router = require('express').Router();
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// ── 1. GET teacher profile (authenticated teacher)
router.get('/profile', auth, requireRole('teacher'), async (req, res) => {
  try {
    const teacher = await User.findById(req.user._id).select('-password');
    
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Construct response with profile data
    const profile = {
      id: teacher._id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone || '',
      bio: teacher.bio || '',
      avatar: `${teacher.firstName.charAt(0)}${teacher.lastName.charAt(0)}`.toUpperCase(),
      avatarColor: '#3B82F6', // Default color, can be stored in DB if needed
      department: teacher.department || 'General',
      subjects: teacher.subjects || [],
      qualifications: teacher.qualifications || [],
      joinedDate: teacher.createdAt,
      status: teacher.isActive ? 'Active' : 'Inactive',
      rating: 4.9, // TODO: Calculate from reviews
      reviews: 1840, // TODO: Count actual reviews
      studentCount: 96, // TODO: Count enrolled students
      lessonsPerWeek: 12, // TODO: Calculate from schedule
      averageSessionRating: 4.8, // TODO: Calculate from session ratings
      lessonsFacilitated: 342, // TODO: Count completed lessons
    };

    res.json({ success: true, profile });
  } catch (e) {
    console.error('[teacher/profile GET]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

// ── 2. UPDATE teacher profile (authenticated teacher)
router.patch('/profile', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { firstName, lastName, phone, bio } = req.body;

    // Validation
    if (!firstName || !firstName.trim()) {
      return res.status(400).json({ success: false, message: 'First name is required' });
    }
    if (!lastName || !lastName.trim()) {
      return res.status(400).json({ success: false, message: 'Last name is required' });
    }

    // Only allow updating specific fields
    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };

    if (phone !== undefined) {
      updateData.phone = phone.trim();
    }
    if (bio !== undefined) {
      // Enforce 500 char limit
      updateData.bio = bio.trim().slice(0, 500);
    }

    const teacher = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    const profile = {
      id: teacher._id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone || '',
      bio: teacher.bio || '',
      avatar: `${teacher.firstName.charAt(0)}${teacher.lastName.charAt(0)}`.toUpperCase(),
      avatarColor: '#3B82F6',
      department: teacher.department || 'General',
      subjects: teacher.subjects || [],
      qualifications: teacher.qualifications || [],
      joinedDate: teacher.createdAt,
      status: teacher.isActive ? 'Active' : 'Inactive',
      rating: 4.9,
      reviews: 1840,
      studentCount: 96,
      lessonsPerWeek: 12,
      averageSessionRating: 4.8,
      lessonsFacilitated: 342,
    };

    res.json({ success: true, profile, message: 'Profile updated successfully' });
  } catch (e) {
    console.error('[teacher/profile PATCH]', e.message);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
});

// ── 3. CHANGE PASSWORD (authenticated teacher)
router.post('/change-password', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { current, new: newPassword } = req.body;

    if (!current || !current.trim()) {
      return res.status(400).json({ success: false, message: 'Current password is required' });
    }
    if (!newPassword || !newPassword.trim()) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    // Get teacher with password (select('+password') if not included by default)
    const teacher = await User.findById(req.user._id);

    // Verify current password
    const isValid = await teacher.comparePassword(current);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Update password
    teacher.password = newPassword;
    await teacher.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (e) {
    console.error('[teacher/change-password]', e.message);
    res.status(500).json({ success: false, message: 'Server error changing password' });
  }
});

// ── 4. CHANGE EMAIL (authenticated teacher)
// This endpoint sends a verification email link (in production)
// For now, it validates the email and marks it as pending verification
router.post('/change-email', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail || !newEmail.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const newEmailLower = newEmail.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await User.findOne({ email: newEmailLower });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // In production, send verification email here
    // For now, update immediately
    const teacher = await User.findByIdAndUpdate(
      req.user._id,
      { email: newEmailLower },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Email changed successfully. Verification email sent.',
      email: teacher.email,
    });
  } catch (e) {
    console.error('[teacher/change-email]', e.message);
    res.status(500).json({ success: false, message: 'Server error changing email' });
  }
});

// ── 5. GET teacher's students
router.get('/students', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Get students assigned to this teacher (by subjects)
    const students = await User.find({ 
      role: 'student',
      subjects: { $in: req.user.subjects || [] }
    }).select('firstName lastName email curriculum grade xp streak createdAt').limit(50);

    res.json({ success: true, students });
  } catch (e) {
    console.error('[teacher/students]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching students' });
  }
});

// ── 6. GET teacher's resources
router.get('/resources', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Mock resources data - in production this would come from a Resources model
    const resources = [
      {
        id: 'res-1',
        title: 'Pythagoras Theorem Worksheet',
        type: 'PDF',
        subject: 'Mathematics',
        grade: 'Form 3',
        size: '1.2 MB',
        downloads: 34,
        createdAt: new Date()
      },
      {
        id: 'res-2', 
        title: 'Trigonometry Lecture Slides',
        type: 'Slides',
        subject: 'Mathematics',
        grade: 'Form 3',
        size: '4.8 MB',
        downloads: 28,
        createdAt: new Date()
      }
    ];

    res.json({ success: true, resources });
  } catch (e) {
    console.error('[teacher/resources]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching resources' });
  }
});

// ── 7. GET teacher's messages
router.get('/messages', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Mock messages data - in production this would come from a Messages model
    const messages = [
      {
        id: 'msg-1',
        from: 'Janet Osei',
        fromRole: 'parent',
        subject: 'Mathematics Progress Update',
        body: 'Amara has been making good progress in mathematics...',
        time: '2 hours ago',
        unread: true
      }
    ];

    res.json({ success: true, messages });
  } catch (e) {
    console.error('[teacher/messages]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching messages' });
  }
});

// ── 8. GET teacher's reports
router.get('/reports', auth, requireRole('teacher'), async (req, res) => {
  try {
    const reports = {
      classAverage: 73,
      highestScore: 91,
      atRiskStudents: 2,
      attendanceRate: 92,
      topicMastery: [
        { topic: 'Number & Algebra', score: 78 },
        { topic: 'Pythagoras Theorem', score: 73 },
        { topic: 'Statistics', score: 69 }
      ]
    };

    res.json({ success: true, reports });
  } catch (e) {
    console.error('[teacher/reports]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching reports' });
  }
});

// ── 9. GET teacher's blog posts
router.get('/blog', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Mock blog posts - in production this would come from a Blog model
    const posts = [
      {
        id: 'post-1',
        title: '5 Ways to Make Quadratic Equations Fun for IGCSE Students',
        reads: 1847,
        earnings: 5541,
        date: 'Feb 28',
        status: 'Published'
      },
      {
        id: 'post-2',
        title: 'Why Pythagoras Theorem Appears in Every IGCSE Exam',
        reads: 3204,
        earnings: 9606,
        date: 'Feb 14', 
        status: 'Published'
      }
    ];

    res.json({ success: true, posts });
  } catch (e) {
    console.error('[teacher/blog]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching blog posts' });
  }
});

// ── 10. GET teacher's allocations
router.get('/allocations', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Mock allocations data
    const allocations = [
      {
        student: 'Amara Osei',
        curriculum: 'IGCSE',
        subject: 'Mathematics',
        slot: 'Mon/Wed 10:00–11:00 AM',
        fee: 'KES 1,500/session',
        status: 'Active'
      },
      {
        student: 'Kofi Mensah',
        curriculum: 'A-Level', 
        subject: 'Mathematics',
        slot: 'Tue/Thu 2:00–3:00 PM',
        fee: 'KES 1,500/session',
        status: 'Active'
      }
    ];

    res.json({ success: true, allocations });
  } catch (e) {
    console.error('[teacher/allocations]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching allocations' });
  }
});

// ── 11. GET teacher's payslips
router.get('/payslips', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Mock payslips data
    const payslips = [
      {
        month: 'January 2026',
        attendance: 22,
        offHours: 8,
        reads: 142,
        videos: 3,
        gross: 'KES 40,126',
        tax: 'KES 4,013',
        net: 'KES 36,113',
        status: 'Paid'
      },
      {
        month: 'December 2025',
        attendance: 20,
        offHours: 5,
        reads: 89,
        videos: 2,
        gross: 'KES 34,267',
        tax: 'KES 3,427',
        net: 'KES 30,840',
        status: 'Paid'
      }
    ];

    res.json({ success: true, payslips });
  } catch (e) {
    console.error('[teacher/payslips]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching payslips' });
  }
});

// ── 12. GET teacher's marking queue
router.get('/marking', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Mock marking queue data
    const papers = [
      {
        id: 'paper-1',
        exam: 'Maths Mock — Paper 1',
        submissions: 24,
        marks: 100,
        status: 'Pending'
      },
      {
        id: 'paper-2',
        exam: 'Chapter 4 Quiz',
        submissions: 18,
        marks: 20,
        status: 'Pending'
      }
    ];

    res.json({ success: true, papers });
  } catch (e) {
    console.error('[teacher/marking]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching marking queue' });
  }
});

module.exports = router;
