const router = require('express').Router();
const GroupRoom = require('../models/GroupRoom');

// ─────────────────────────────────────────────────────────
// HELPER: Sync a student's GroupRoom enrollments based on
// their curriculum + gradeLevel + subjects.
// Adds to rooms they now match, removes from rooms they don't.
// ─────────────────────────────────────────────────────────
async function syncStudentEnrollments(studentId) {
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student' || !student.isActive) {
    return { matched: 0, addedTo: 0, removedFrom: 0 };
  }

  // Find rooms matching this student's enrollment criteria
  const matchingRooms = await GroupRoom.find({
    status: 'Active',
    curriculum: student.curriculum,
    grade: student.gradeLevel,
    subject: { $in: student.subjects || [] },
  }).select('_id students');

  const matchingIds = matchingRooms.map(r => r._id.toString());

  // Find rooms where this student is currently enrolled (any room)
  const currentRooms = await GroupRoom.find({
    students: student._id,
  }).select('_id');

  const currentIds = currentRooms.map(r => r._id.toString());

  // Add to: rooms they match but aren't in
  const toAdd = matchingIds.filter(id => !currentIds.includes(id));
  // Remove from: rooms they're in but don't match anymore
  const toRemove = currentIds.filter(id => !matchingIds.includes(id));

  if (toAdd.length > 0) {
    await GroupRoom.updateMany(
      { _id: { $in: toAdd } },
      { $addToSet: { students: student._id } }
    );
  }
  if (toRemove.length > 0) {
    await GroupRoom.updateMany(
      { _id: { $in: toRemove } },
      { $pull: { students: student._id } }
    );
  }

  return {
    matched: matchingIds.length,
    addedTo: toAdd.length,
    removedFrom: toRemove.length,
  };
}
const User   = require('../models/User');
const Teacher = require('../models/Teacher');
const { auth, requireRole } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../services/emailService');
const { sendWelcomeEmail } = require('../lib/email');

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

// GET /stats — Get total user count for sidebar badge
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ success: true, totalUsers });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET all users (admin only) with advanced search and filtering
router.get('/', auth, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { search, role, curriculum } = req.query;
    let query = {};

    // Advanced search: name or email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter
    if (role && role !== 'All Roles') {
      query.role = role.toLowerCase();
    }

    // Curriculum filter
    if (curriculum && curriculum !== 'All') {
      query.curriculum = curriculum;
    }

    const users = await User.find(query)
      .select('-password')
      .populate('subjects', 'subjectName curriculum')
      .populate('teachingSpecialties.subjectId', 'subjectName')
      .sort('-createdAt')
      .limit(200);
    
    res.json({ success: true, users });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET student by admission number (for parent linking in admin form)
router.get('/students/by-admission/:admissionNumber', auth, requireRole('admin'), async (req, res) => {
  try {
    const { admissionNumber } = req.params;
    if (!admissionNumber) {
      return res.status(400).json({ success: false, message: 'Admission number is required' });
    }
    const student = await User.findOne({
      role: 'student',
      admissionNumber: admissionNumber.trim().toUpperCase(),
    }).select('_id firstName lastName email curriculum gradeLevel admissionNumber');
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'No student found with admission number ' + admissionNumber });
    }
    res.json({ success: true, student });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET all students (for parent selection)
router.get('/students/list', auth, requireRole('admin'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('_id firstName lastName email curriculum grade subjects')
      .populate('subjects', 'subjectName curriculum')
      .sort('-createdAt')
      .limit(500);
    res.json({ success: true, students });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET all teachers (for allocations)
router.get('/teachers/list', auth, requireRole('admin'), async (req, res) => {
  try {
    // Get teachers from User collection
    const teachers = await User.find({ role: 'teacher' })
      .select('_id firstName lastName email phone curriculum subjects createdAt status isOnLeave leaveStartDate leaveEndDate')
      .populate('subjects', 'subjectName curriculum')
      .sort('firstName')
      .limit(500);
    res.json({ success: true, teachers });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// CREATE user (admin only) with role-specific logic and auto-generated temp password
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    validateRoleFields(req.body, req.body.role);
    
    // Ensure subjects is always an array of ObjectIds
    if (req.body.subjects && !Array.isArray(req.body.subjects)) {
      req.body.subjects = [];
    } else if (!req.body.subjects) {
      req.body.subjects = [];
    }

    // PHASE 3-5: Auto-generate temporary password
    const tempPassword = User.generateTempPassword();
    req.body.password = tempPassword;
    req.body.isActive = true; // Users are immediately active
    req.body.mustChangePassword = true;

    const user = await User.create(req.body);
    
    // Generate verification JWT
    const verificationToken = jwt.sign(
      { userId: user._id, action: 'verify_email' },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '24h' }
    );
    
    // Update user with verification token
    user.verificationToken = verificationToken;
    await user.save();
    
    // Populate subjects before returning
    await user.populate('subjects', 'subjectName curriculum');
    await user.populate('teachingSpecialties.subjectId', 'subjectName');
    
    const safe = user.toObject();
    delete safe.password;
    
    // PHASE 3-5: RETURN TEMP PASSWORD IN RESPONSE (for "Copy Credentials" feature)
    const credentials = {
      email: user.email,
      tempPassword: tempPassword
    };

    // If user is a parent, link to selected students
    if (user.role === 'parent' && req.body.linkedStudents && Array.isArray(req.body.linkedStudents)) {
      try {
        user.linkedStudents = req.body.linkedStudents;
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
      }
    }
    
     // If user role is 'teacher', build teachingSpecialties from subjects and curriculum
     if (user.role === 'teacher') {
       try {
         // Build teachingSpecialties array from subjects and curriculum
         const teachingSpecialties = [];
         const teachingCurricula = Array.isArray(req.body.curriculum) ? req.body.curriculum : (req.body.curriculum ? [req.body.curriculum] : []);
         const teachingSubjects = Array.isArray(req.body.subjects) ? req.body.subjects : [];
         
         // Create a specialty for each combination of subject and curriculum
         for (const subjectId of teachingSubjects) {
           for (const curr of teachingCurricula) {
             teachingSpecialties.push({
               subjectId: subjectId,
               curriculum: curr
             });
           }
         }
         
         // Update user with teachingSpecialties
         if (teachingSpecialties.length > 0) {
           user.teachingSpecialties = teachingSpecialties;
           await user.save();
         }
         
         console.log(`✓ Teacher ${user.firstName} ${user.lastName} assigned ${teachingSpecialties.length} specialties`);
       } catch (specialtyError) {
         console.error('Failed to assign teaching specialties:', specialtyError.message);
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
           curriculum: user.curriculum || [],
           subjects: Array.isArray(user.subjects) && user.subjects.length > 0 ? user.subjects : [],
           status: 'Active',
         };
         
         const teacher = await Teacher.create(teacherData);
         safe.teacherId = teacher._id;
         console.log(`✓ Teacher record created for ${user.firstName} ${user.lastName}`);
       } catch (teacherError) {
         console.error('Failed to create Teacher record:', teacherError.message);
       }
     }
    
  // Auto-sync GroupRoom enrollments for newly created students
    if (user.role === 'student') {
      try {
        const enrollment = await syncStudentEnrollments(user._id);
        console.log('[users POST] Synced enrollments for new student', user.firstName, '· matched', enrollment.matched, '· added', enrollment.addedTo);
      } catch (enrollError) {
        console.error('[users POST] Enrollment sync failed:', enrollError.message);
      }
    }
    // Send welcome email with login credentials
    let emailStatus = { sent: false, error: null }
    if (req.body.sendWelcomeEmail !== false) {  // default: send unless explicitly disabled
      try {
        const fullName = (user.firstName + ' ' + user.lastName).trim()
        const loginUrl = (process.env.FRONTEND_URL || 'https://smartioushomeschool.com') + '/login'
        const emailResult = await sendWelcomeEmail({
          to: user.email,
          name: fullName,
          role: user.role,
          username: user.email,
          tempPassword: tempPassword,
          admissionNumber: user.admissionNumber || null,
          loginUrl,
        })
        if (emailResult.success) {
          emailStatus.sent = true
          user.lastCredentialsSentAt = new Date()
          user.credentialsSentCount = (user.credentialsSentCount || 0) + 1
          await user.save()
          console.log('[users POST] Welcome email sent to', user.email)
        } else {
          emailStatus.error = emailResult.message
          console.warn('[users POST] Welcome email failed:', emailResult.message)
        }
      } catch (emailErr) {
        emailStatus.error = emailErr.message
        console.error('[users POST] Welcome email error:', emailErr.message)
      }
    }
    res.status(201).json({ 
      success: true, 
      user: safe,
      credentials,
      emailStatus,  // { sent: bool, error: string|null }
      message: emailStatus.sent
        ? 'User created successfully. Credentials sent to email.'
        : 'User created successfully. Email delivery failed — share credentials manually.'
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

    const updateOpts = { new: true };
     let user = await User.findByIdAndUpdate(req.params.id, req.body, updateOpts).select('-password');
     // Only populate teacher subjectRefs (ObjectId references to Subject docs)
     if (user.role === 'teacher') {
       try { user = await user.populate('subjectRefs', 'subjectName curriculum'); } catch (e) { /* ignore */ }
     }
     
     const safe = user.toObject();
     
     // If user is a teacher and subjects or curriculum were updated, rebuild teachingSpecialties
     if (user.role === 'teacher' && (req.body.subjects !== undefined || req.body.curriculum !== undefined)) {
       try {
         // Build teachingSpecialties array from subjects and curriculum
         const teachingSpecialties = [];
         const teachingCurricula = Array.isArray(user.curriculum) ? user.curriculum : (user.curriculum ? [user.curriculum] : []);
         const teachingSubjects = Array.isArray(user.subjectRefs) ? user.subjectRefs : [];
         
         // Create a specialty for each combination of subject and curriculum
         for (const subject of teachingSubjects) {
           const subjectId = subject._id || subject;
           for (const curr of teachingCurricula) {
             teachingSpecialties.push({
               subjectId: subjectId,
               curriculum: curr
             });
           }
         }
         
         // Update user with new teachingSpecialties
         user.teachingSpecialties = teachingSpecialties;
         await user.save();
         console.log(`✓ Teacher ${user.firstName} ${user.lastName} specialties updated to ${teachingSpecialties.length}`);
       } catch (specialtyError) {
         console.error('Failed to update teaching specialties:', specialtyError.message);
       }
       
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
     
     // Auto-sync GroupRoom enrollments if this is a student and curriculum/grade/subjects changed
     if (user.role === 'student' && (
       req.body.curriculum !== undefined ||
       req.body.gradeLevel !== undefined ||
       req.body.subjects !== undefined
     )) {
       try {
         const enrollment = await syncStudentEnrollments(user._id);
         console.log('[users PATCH] Synced enrollments for', user.firstName, '· matched', enrollment.matched, '· added', enrollment.addedTo, '· removed', enrollment.removedFrom);
       } catch (enrollError) {
         console.error('[users PATCH] Enrollment sync failed:', enrollError.message);
       }
     }
    res.json({ success: true, user: safe });
   } catch (e) {
     res.status(500).json({ success: false, message: e.message });
   }
});

// PATCH /api/users/:id/leave - Set teacher on leave or return from leave (admin only)
router.patch('/:id/leave', auth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (user.role !== 'teacher') {
      return res.status(400).json({ success: false, message: 'Only teachers can be set on leave' });
    }

    const { isOnLeave, leaveStartDate, leaveEndDate } = req.body;

    if (isOnLeave) {
      user.isOnLeave = true;
      user.leaveStartDate = leaveStartDate || new Date();
      user.leaveEndDate = leaveEndDate;
    } else {
      user.isOnLeave = false;
      user.leaveStartDate = null;
      user.leaveEndDate = null;
    }

    await user.save();
    const safe = user.toObject();
    delete safe.password;

    res.json({ 
      success: true, 
      user: safe,
      message: isOnLeave ? `${user.firstName} ${user.lastName} is now on leave` : `${user.firstName} ${user.lastName} has returned from leave`
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    
    // PHASE 3-5: Protect main admin from deletion
    if (target.isMainAdmin) {
      return res.status(403).json({ success: false, message: 'Main admin account cannot be deleted.' });
    }
    
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
