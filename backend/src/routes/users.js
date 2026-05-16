const router = require('express').Router();
const GroupRoom = require('../models/GroupRoom');
const User   = require('../models/User');
const Teacher = require('../models/Teacher');
const { auth, requireRole } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../services/emailService');
const { sendWelcomeEmail } = require('../lib/email');

// ── Cloudinary avatar upload setup ────────────────────────
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'smartious/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB cap
});

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

// Validation helper for role-specific fields
function validateRoleFields(user, role) {
  const errors = [];

  switch(role.toLowerCase()) {
    case 'student':
      if (!user.plan) user.plan = 'Basic';
      if (!Array.isArray(user.subjects)) {
        user.subjects = [];
      }
      break;
    case 'teacher':
      if (!Array.isArray(user.subjects)) {
        user.subjects = [];
      }
      if (!user.plan) user.plan = 'Staff';
      break;
    case 'parent':
      if (!user.plan) user.plan = 'Basic';
      break;
    case 'admin':
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

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'All Roles') {
      query.role = role.toLowerCase();
    }

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
      admissionNumber: admissionNumber.trim(),
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
      .select('_id firstName lastName email curriculum grade subjects admissionNumber')
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
    const teachers = await User.find({ role: 'teacher' })
      .select('_id firstName lastName email phone curriculum subjects createdAt status isActive isOnLeave leaveStartDate leaveEndDate jobTitle avatar bio yearsOfExperience teachingSpecialties statusReason')
      .sort('firstName')
      .limit(500);
    res.json({ success: true, teachers });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/users/:id/avatar — admin uploads a profile image
// for any user. Returns the Cloudinary URL and also saves it to
// the user's avatar field.
router.post('/:id/avatar', auth, requireRole('admin'), (req, res) => {
  uploadAvatar.single('file')(req, res, async (err) => {
    if (err) {
      console.error('[users avatar upload]', err.message);
      return res.status(400).json({ success: false, message: err.message || 'Upload failed.' });
    }
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded.' });

    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { avatar: req.file.path } },
        { new: true }
      ).select('-password');
      if (!user)
        return res.status(404).json({ success: false, message: 'User not found.' });

      res.json({
        success: true,
        message: 'Avatar updated.',
        data: { avatar: req.file.path },
      });
    } catch (e) {
      console.error('[users avatar save]', e.message);
      res.status(500).json({ success: false, message: 'Failed to save avatar.' });
    }
  });
});

// GET /api/users/teachers/qualified?subjectId=...&curriculum=...
// Returns active teachers whose teachingSpecialties include this
// subject+curriculum pair. Used by the admin Manage Students module
// to populate the teacher-allocation dropdown after the admin has
// chosen a (student, subject) pair to allocate.
router.get('/teachers/qualified', auth, requireRole('admin'), async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const { subjectId, curriculum } = req.query;

    if (!subjectId || !mongoose.isValidObjectId(subjectId))
      return res.status(400).json({ success: false, message: 'Valid subjectId is required.' });
    if (!curriculum)
      return res.status(400).json({ success: false, message: 'curriculum is required.' });

    const teachers = await User.find({
      role: 'teacher',
      isActive: true,
      isOnLeave: { $ne: true },
      teachingSpecialties: {
        $elemMatch: { subjectId, curriculum }
      }
    })
      .select('_id firstName lastName email phone teachingSpecialties')
      .sort('firstName')
      .lean();

    res.json({ success: true, teachers });
  } catch (e) {
    console.error('[users teachers/qualified]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/users/teachers/:id/specialties
// Admin sets a teacher's teachingSpecialties directly.
// Body: { curricula: [...], subjectIds: [...] } — builds the cartesian
// product, same shape the teacher self-service endpoint produces.
// This is separate from PATCH /:id so the admin can manage specialties
// without triggering the legacy subjectRefs-based rebuild.
router.patch('/teachers/:id/specialties', auth, requireRole('admin'), async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const Subject  = require('../models/Subject');
    const { curricula, subjectIds } = req.body;

    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== 'teacher')
      return res.status(404).json({ success: false, message: 'Teacher not found.' });

    if (!Array.isArray(curricula) || !Array.isArray(subjectIds))
      return res.status(400).json({ success: false, message: 'curricula and subjectIds must be arrays.' });

    const VALID = ['IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC', 'BNC', 'American'];
    const cleanCurricula = curricula.filter(c => VALID.includes(c));
    const cleanIds = subjectIds.filter(id => mongoose.isValidObjectId(id));

    // Empty is allowed — admin may want to clear specialties
    if (cleanIds.length > 0) {
      const found = await Subject.countDocuments({ _id: { $in: cleanIds } });
      if (found !== cleanIds.length)
        return res.status(400).json({ success: false, message: 'One or more subjectIds do not exist.' });
    }

    const pairs = [];
    for (const sid of cleanIds) {
      for (const curr of cleanCurricula) {
        pairs.push({ subjectId: sid, curriculum: curr });
      }
    }

    teacher.teachingSpecialties = pairs;
    await teacher.save();

    res.json({
      success: true,
      message: `Saved ${pairs.length} specialty pair${pairs.length === 1 ? '' : 's'}.`,
      data: { teachingSpecialties: teacher.teachingSpecialties },
    });
  } catch (e) {
    console.error('[users teachers/:id/specialties]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// CREATE user (admin only) with role-specific logic and auto-generated temp password
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    validateRoleFields(req.body, req.body.role);

    if (req.body.subjects && !Array.isArray(req.body.subjects)) {
      req.body.subjects = [];
    } else if (!req.body.subjects) {
      req.body.subjects = [];
    }

    // Auto-generate temporary password
    const tempPassword = User.generateTempPassword();
    req.body.password = tempPassword;
    req.body.isActive = true;
    req.body.mustChangePassword = true;

    const user = await User.create(req.body);

    // Generate verification JWT
    const verificationToken = jwt.sign(
      { userId: user._id, action: 'verify_email' },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '24h' }
    );

    user.verificationToken = verificationToken;
    await user.save();

    await user.populate('subjects', 'subjectName curriculum');
    await user.populate('teachingSpecialties.subjectId', 'subjectName');

    const safe = user.toObject();
    delete safe.password;

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
        const teachingSpecialties = [];
        const teachingCurricula = Array.isArray(req.body.curriculum) ? req.body.curriculum : (req.body.curriculum ? [req.body.curriculum] : []);
        const teachingSubjects = Array.isArray(req.body.subjects) ? req.body.subjects : [];

        for (const subjectId of teachingSubjects) {
          for (const curr of teachingCurricula) {
            teachingSpecialties.push({
              subjectId: subjectId,
              curriculum: curr
            });
          }
        }

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
    let emailStatus = { sent: false, error: null };
    if (req.body.sendWelcomeEmail !== false) {
      try {
        const fullName = (user.firstName + ' ' + user.lastName).trim();
        const loginUrl = (process.env.FRONTEND_URL || 'https://smartioushomeschool.com') + '/login';
        const emailResult = await sendWelcomeEmail({
          to: user.email,
          name: fullName,
          role: user.role,
          username: user.email,
          tempPassword: tempPassword,
          admissionNumber: user.admissionNumber || null,
          loginUrl,
        });
        if (emailResult.success) {
          emailStatus.sent = true;
          user.lastCredentialsSentAt = new Date();
          user.credentialsSentCount = (user.credentialsSentCount || 0) + 1;
          await user.save();
          console.log('[users POST] Welcome email sent to', user.email);
        } else {
          emailStatus.error = emailResult.message;
          console.warn('[users POST] Welcome email failed:', emailResult.message);
        }
      } catch (emailErr) {
        emailStatus.error = emailErr.message;
        console.error('[users POST] Welcome email error:', emailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      user: safe,
      credentials,
      emailStatus,
      message: emailStatus.sent
        ? 'User created successfully. Credentials sent to email.'
        : 'User created successfully. Email delivery failed — share credentials manually.'
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

    if (target.isDemo) {
      delete req.body.role;
      delete req.body.isDemo;
      delete req.body.isActive;
    }

    delete req.body.password;

    const newRole = req.body.role || target.role;
    validateRoleFields(req.body, newRole);

    // Handle parent-student linking on update
    if (req.body.linkedStudents && Array.isArray(req.body.linkedStudents)) {
      try {
        const oldLinkedStudents = target.linkedStudents || [];

        for (const studentId of oldLinkedStudents) {
          if (!req.body.linkedStudents.includes(studentId.toString())) {
            await User.findByIdAndUpdate(
              studentId,
              { $pull: { linkedParents: target._id } },
              { new: true }
            );
          }
        }

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
      }
    }

    const updateOpts = { new: true };
    let user = await User.findByIdAndUpdate(req.params.id, req.body, updateOpts).select('-password');

    if (user.role === 'teacher') {
      try { user = await user.populate('subjectRefs', 'subjectName curriculum'); } catch (e) { /* ignore */ }
    }

    const safe = user.toObject();

    // If user is a teacher and subjects or curriculum were updated, rebuild teachingSpecialties
    if (user.role === 'teacher' && (req.body.subjects !== undefined || req.body.curriculum !== undefined)) {
      try {
        const teachingSpecialties = [];
        const teachingCurricula = Array.isArray(user.curriculum) ? user.curriculum : (user.curriculum ? [user.curriculum] : []);
        const teachingSubjects = Array.isArray(user.subjectRefs) ? user.subjectRefs : [];

        for (const subject of teachingSubjects) {
          const subjectId = subject._id || subject;
          for (const curr of teachingCurricula) {
            teachingSpecialties.push({
              subjectId: subjectId,
              curriculum: curr
            });
          }
        }

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

    if (target.isMainAdmin) {
      return res.status(403).json({ success: false, message: 'Main admin account cannot be deleted.' });
    }

    if (target.isDemo) {
      return res.status(403).json({ success: false, message: 'Demo users cannot be deleted.' });
    }

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
