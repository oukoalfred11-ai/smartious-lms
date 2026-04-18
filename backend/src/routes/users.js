const router = require('express').Router();
const User   = require('../models/User');
const Teacher = require('../models/Teacher');
const { auth, requireRole } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../services/emailService');

// Validation helper for role-specific fields
function validateRoleFields(user, role) {
  const errors = [];
  
  switch(role.toLowerCase()) {
    case 'student':
      // Students should have curriculum and subjects (optional but recommended)
      if (!user.plan) user.plan = 'Basic';
      // Ensure subjects is an array
      if (!Array.isArray(user.subjects)) {
        user.subjects = [];
      }
      break;
    case 'teacher':
      // Teachers should have subjects array and curriculum
      if (!Array.isArray(user.subjects)) {
        user.subjects = [];
      }
      if (!user.plan) user.plan = 'Staff';
      break;
    case 'parent':
      // Parents can have phone and bio
      if (!user.plan) user.plan = 'Basic';
      break;
    case 'admin':
      // Admins get Staff plan
      if (!user.plan) user.plan = 'Staff';
      break;
  }
  
  return errors;
}

// GET all users (admin only) — never return passwords
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('subjects', 'subjectName curriculum')
      .sort('-createdAt')
      .limit(200);
    res.json({ success: true, users });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET all students (for parent selection)
router.get('/students/list', auth, requireRole('admin'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('_id firstName lastName email curriculum grade')
      .populate('subjects', 'subjectName curriculum')
      .sort('firstName')
      .limit(500);
    res.json({ success: true, students });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// CREATE user (admin only)
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    // Validate and set role-specific defaults
    validateRoleFields(req.body, req.body.role);
    
    // Ensure subjects is always an array of ObjectIds
    if (req.body.subjects && !Array.isArray(req.body.subjects)) {
      req.body.subjects = [];
    } else if (!req.body.subjects) {
      req.body.subjects = [];
    }
    
     const user = await User.create(req.body);
    
    // Generate verification JWT
    const verificationToken = jwt.sign(
      { userId: user._id, action: 'verify_email' },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '24h' }
    );
    
    // Update user with verification token
    user.verificationToken = verificationToken;
    user.forcePasswordReset = true;
    await user.save();
    
    // Send verification email
    const verificationLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail({
      email: user.email,
      name: user.firstName,
      verificationLink,
      expiresIn: '24 hours'
    });
    
    // Populate subjects before returning
    await user.populate('subjects', 'subjectName curriculum');
    
    const safe = user.toObject();
    delete safe.password;
    
    // If user is a parent, link to selected students
    if (user.role === 'parent' && req.body.linkedStudents && Array.isArray(req.body.linkedStudents)) {
      try {
        // Add students to parent's linkedStudents
        user.linkedStudents = req.body.linkedStudents;
        
        // Add parent to each student's linkedParents
        for (const studentId of req.body.linkedStudents) {
          await User.findByIdAndUpdate(
            studentId,
            { $addToSet: { linkedParents: user._id } },
            { new: true }
          );
        }
        await user.save();
        console.log(`✓ Parent ${user.firstName} ${user.lastName} linked to ${req.body.linkedStudents.length} students`);
      } catch (linkError) {
        console.error('Failed to link parent to students:', linkError.message);
        // Don't fail parent creation if linking fails
      }
    }
    
    // If user role is 'teacher', also create a Teacher record
    if (user.role === 'teacher') {
      try {
        const teacherData = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || '',
          curriculum: user.curriculum || '',
          subjects: Array.isArray(user.subjects) && user.subjects.length > 0 ? user.subjects : [],
          status: 'Active',
        };
        
        const teacher = await Teacher.create(teacherData);
        safe.teacherId = teacher._id; // Include teacher ID in response
        console.log(`✓ Teacher record created for ${user.firstName} ${user.lastName}`);
      } catch (teacherError) {
        console.error('Failed to create Teacher record:', teacherError.message);
        // Don't fail the user creation if teacher creation fails
      }
    }
    
    res.json({ 
      success: true, 
      user: safe,
      message: 'User created. Verification email sent. Please check your email to verify your account.'
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// UPDATE user (admin only) — demo users cannot be deleted or have role/isDemo changed
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // Protect demo users: disallow role change or deactivation
    if (target.isDemo) {
      delete req.body.role;
      delete req.body.isDemo;
      delete req.body.isActive; // cannot deactivate demo accounts
    }

    // Never update password via this route — use a dedicated change-password endpoint
    delete req.body.password;

    // Validate role-specific fields
    const newRole = req.body.role || target.role;
    validateRoleFields(req.body, newRole);

    // Handle parent-student linking on update
    if (req.body.linkedStudents && Array.isArray(req.body.linkedStudents)) {
      try {
        // Get old linked students to remove parent from their linkedParents
        const oldLinkedStudents = target.linkedStudents || [];
        
        // Remove parent from old students
        for (const studentId of oldLinkedStudents) {
          if (!req.body.linkedStudents.includes(studentId.toString())) {
            await User.findByIdAndUpdate(
              studentId,
              { $pull: { linkedParents: target._id } },
              { new: true }
            );
          }
        }
        
        // Add parent to new students
        for (const studentId of req.body.linkedStudents) {
          await User.findByIdAndUpdate(
            studentId,
            { $addToSet: { linkedParents: target._id } },
            { new: true }
          );
        }
        console.log(`✓ Parent ${target.firstName} ${target.lastName} link updated`);
      } catch (linkError) {
        console.error('Failed to update parent-student links:', linkError.message);
        // Don't fail the user update if linking fails
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .select('-password')
      .populate('subjects', 'subjectName curriculum');
    
    const safe = user.toObject();
    
    // If user is a teacher and subjects or curriculum were updated, sync to Teacher record
    if (user.role === 'teacher' && (req.body.subjects !== undefined || req.body.curriculum !== undefined)) {
      try {
        const teacher = await Teacher.findOne({ email: user.email });
        if (teacher) {
          teacher.curriculum = user.curriculum || teacher.curriculum;
          teacher.subjects = Array.isArray(req.body.subjects) && req.body.subjects.length > 0 
            ? req.body.subjects 
            : [];
          teacher.phone = user.phone || teacher.phone;
          await teacher.save();
          console.log(`✓ Teacher record updated for ${user.firstName} ${user.lastName}`);
        }
      } catch (teacherError) {
        console.error('Failed to sync Teacher record:', teacherError.message);
        // Don't fail the user update if teacher sync fails
      }
    }
    
    res.json({ success: true, user: safe });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE user (admin only) — demo users cannot be deleted
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.isDemo) {
      return res.status(403).json({ success: false, message: 'Demo users cannot be deleted.' });
    }
    
    // If user is a teacher, also delete the Teacher record
    if (target.role === 'teacher') {
      try {
        await Teacher.deleteOne({ email: target.email });
        console.log(`✓ Teacher record deleted for ${target.firstName} ${target.lastName}`);
      } catch (teacherError) {
        console.error('Failed to delete Teacher record:', teacherError.message);
      }
    }
    
    await target.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
