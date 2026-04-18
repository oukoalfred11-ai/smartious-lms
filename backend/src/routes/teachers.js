const express = require('express');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const { sendTeacherCredentialsEmail } = require('../services/emailService');
const { generateTemporaryPassword, updateUserWithTemporaryPassword } = require('../services/credentialsService');
const router = express.Router();

// Audit log stub
function logAudit(user, action, details) {
  // TODO: Implement persistent audit logging
  console.log(`[AUDIT] ${user}: ${action}`, details);
}

// GET /api/teachers - List all teachers (public for frontend)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const curriculum = req.query.curriculum;
    const status = req.query.status || 'Active';

    // Build filter
    const filter = { status };
    if (curriculum && curriculum !== 'all') {
      filter.$or = [
        { curriculum: curriculum },
        { universalCurriculum: true }
      ];
    }

    // Count total
    const total = await Teacher.countDocuments(filter);

    // Fetch teachers
    const teachers = await Teacher.find(filter)
      .populate('subjects', 'subjectName category curriculum')
      .populate('userId', 'firstName lastName email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      teachers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (e) {
    console.error('Error fetching teachers:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/teachers/:id - Get single teacher
router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('subjects', 'subjectName category curriculum')
      .populate('userId', 'firstName lastName email phone');
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.json({ success: true, teacher });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/teachers - Create teacher (admin only)
// PHASE 4: Support universalCurriculum flag
// PHASE 5: Auto-dispatch credentials for teachers
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    // Ensure required fields
    if (!req.body.firstName || !req.body.lastName || !req.body.email) {
      return res.status(400).json({ 
        success: false, 
        message: 'firstName, lastName, and email are required' 
      });
    }

    // Validate curriculum is provided and valid
    const validCurriculums = ['IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC', 'BNC', 'American'];
    if (!req.body.curriculum || !validCurriculums.includes(req.body.curriculum)) {
      return res.status(400).json({
        success: false,
        message: `Curriculum is required and must be one of: ${validCurriculums.join(', ')}`
      });
    }

    const teacherData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone || '',
      bio: req.body.bio || '',
      curriculum: req.body.curriculum, // Required, validated above
      subjects: Array.isArray(req.body.subjects) && req.body.subjects.length > 0 
        ? req.body.subjects 
        : [],
      qualifications: Array.isArray(req.body.qualifications) ? req.body.qualifications : [],
      experience: req.body.experience || 0,
      status: req.body.status || 'Active',
      // PHASE 4: Add universalCurriculum flag to bypass curriculum-based filtering
      universalCurriculum: req.body.universalCurriculum || false,
      isDemo: req.body.isDemo || false,
    };

    const teacher = new Teacher(teacherData);
    await teacher.save();
    
    // PHASE 5: Create user account and send credentials
    // Check if user already exists
    let user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      // Generate temporary password
      const tempPassword = generateTemporaryPassword();
      
      // Create user account for teacher
      user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: tempPassword, // Will be hashed by pre-save hook
        role: 'teacher',
        phone: req.body.phone || '',
        curriculum: req.body.curriculum, // Required, validated above
        subjects: Array.isArray(req.body.subjects) ? req.body.subjects : [],
        isActive: true,
        isDemo: req.body.isDemo || false,
        plan: 'Staff',
        forcePasswordChange: true, // Force password reset on first login
      });
      
      await user.save();
      
      // Link teacher to user
      teacher.userId = user._id;
      await teacher.save();
      
      // PHASE 5: Send credentials email
      try {
        const loginUrl = process.env.CLIENT_URL || 'https://smartious.ac.ke';
        await sendTeacherCredentialsEmail({
          teacherEmail: user.email,
          teacherName: user.firstName,
          tempPassword: tempPassword, // Clear-text password in email only
          loginUrl: loginUrl,
          expiresIn: '24 hours'
        });
        console.log(`✓ Teacher ${user.email} created with credentials sent`);
      } catch (emailError) {
        console.error('Failed to send credentials email:', emailError.message);
        // Don't fail the teacher creation if email fails
      }
    } else {
      // User already exists, link it to teacher
      teacher.userId = user._id;
      await teacher.save();
    }
    
    logAudit(req.user?.email || 'system', 'create_teacher', teacher);
    
    // Populate subjects and userId before returning
    await teacher.populate('subjects', 'subjectName curriculum');
    await teacher.populate('userId', 'firstName lastName email');
    
    // PHASE 4: Emit WebSocket event for real-time menu update
    const io = req.app.locals.io;
    if (io) {
      io.emit('TEACHER_CREATED', {
        teacher: teacher.toObject(),
        message: `New teacher ${teacher.firstName} ${teacher.lastName} added to system`
      });
      console.log(`✓ WebSocket event TEACHER_CREATED emitted`);
    }
    
    res.status(201).json({ 
      success: true, 
      teacher,
      message: user.email ? 'Teacher created. Credentials sent to email.' : 'Teacher created.',
      credentialsSent: user.email ? true : false
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// PATCH /api/teachers/:id - Update teacher (admin only)
// PHASE 4: Support universalCurriculum updates
// PHASE 6: Support mass subject allocation
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Protect demo teachers
    if (teacher.isDemo) {
      delete req.body.isDemo;
      delete req.body.email; // Can't change email of demo users
    }

    // PHASE 6: Handle "Add All Subjects" request
    if (req.body.addAllSubjects === true) {
      // Get all subjects from the Subject collection
      const Subject = require('../models/Subject');
      const allSubjects = await Subject.find({ isActive: true });
      req.body.subjects = allSubjects.map(s => s._id);
      delete req.body.addAllSubjects; // Remove this flag from updates
    }

    // Allowed fields to update
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'bio', 'subjects', 'curriculum',
      'qualifications', 'experience', 'status', 'rating', 
      'totalStudents', 'totalSessions',
      'universalCurriculum' // PHASE 4: Allow updating universal curriculum flag
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    }

    // Special handling for subjects array
    if (updates.subjects) {
      updates.subjects = Array.isArray(updates.subjects) && updates.subjects.length > 0
        ? updates.subjects
        : [];
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email phone');

    logAudit(req.user?.email || 'system', 'update_teacher', updatedTeacher);
    res.json({ success: true, teacher: updatedTeacher });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// DELETE /api/teachers/:id - Delete teacher (admin only)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    if (teacher.isDemo) {
      return res.status(403).json({ 
        success: false, 
        message: 'Demo teachers cannot be deleted' 
      });
    }

    await Teacher.findByIdAndDelete(req.params.id);
    logAudit(req.user?.email || 'system', 'delete_teacher', teacher);
    res.json({ success: true, message: 'Teacher deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;
