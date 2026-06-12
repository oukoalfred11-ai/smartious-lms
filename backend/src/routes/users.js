const router = require('express').Router();
const GroupRoom = require('../models/GroupRoom');
const User   = require('../models/User');
const Teacher = require('../models/Teacher');
const { auth, requireRole } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, sendTeacherMemoEmail } = require('../services/emailService');
const { sendWelcomeEmail } = require('../lib/email');

// ── Cloudinary avatar upload setup ────────────────────────
// Wrapped defensively: if multer / multer-storage-cloudinary are not
// installed, we must NOT throw at module load — that would crash the
// entire server (index.js requires this file at boot). Instead the
// avatar endpoint degrades to a clear 503 and every other /api/users
// route keeps working.
let uploadAvatar = null;
let avatarUploadError = null;
try {
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
  uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB cap
  });
} catch (e) {
  avatarUploadError = e.message;
  console.error('[users] avatar upload disabled —', e.message);
}

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
      .select('_id firstName lastName email curriculum grade gradeLevel subjects admissionNumber programme deliveryMode isActive status')
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
      .select('_id firstName lastName email phone curriculum subjects createdAt status isActive isOnLeave leaveStartDate leaveEndDate jobTitle avatar bio yearsOfExperience teachingSpecialties statusReason sentEmails')
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
  if (!uploadAvatar) {
    return res.status(503).json({
      success: false,
      message: 'Image upload is unavailable on the server: ' + (avatarUploadError || 'upload module not installed.'),
    });
  }
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

    // Full catalog — must match SCHOOL_CURRICULA in Dashboard.jsx and
    // the curriculum ids stored on Subject documents and User records.
    const VALID = [
      'CambridgePrimary', 'CambridgeLowerSec', 'CambridgeIGCSE', 'CambridgeALevel',
      'EdexcelLowerSec',  'EdexcelIGCSE',      'EdexcelALevel',
      'AQALowerSec',      'AQAGCSE',           'AQAALevel',
      'IB', 'BNC', 'American', 'Canadian', 'KenyaCBC',
      // Legacy strings kept so existing teacher records are not broken
      'IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC',
    ];
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

    // If a STUDENT was created with a parentId, link both ways.
    // (Inline parent creation is a separate endpoint — see
    //  POST /:id/create-and-link-parent below.)
    if (user.role === 'student' && req.body.parentId) {
      try {
        const parent = await User.findById(req.body.parentId);
        if (parent && parent.role === 'parent') {
          await User.findByIdAndUpdate(user._id, {
            $addToSet: { linkedParents: parent._id },
            $set: { parentId: parent._id },
          });
          await User.findByIdAndUpdate(parent._id, {
            $addToSet: { linkedStudents: user._id },
          });
          console.log(`✓ Student ${user.firstName} linked to parent ${parent.firstName}`);
        }
      } catch (linkErr) {
        console.error('Failed to link student to parent:', linkErr.message);
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

// ── STUDENT ↔ PARENT LINKING ──────────────────────────────
// POST /api/users/:id/link-parent
// Links an EXISTING parent account to a student (both ways).
// Body: { parentId }
router.post('/:id/link-parent', auth, requireRole('admin'), async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const { parentId } = req.body;

    if (!mongoose.isValidObjectId(parentId))
      return res.status(400).json({ success: false, message: 'Valid parentId is required.' });

    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student')
      return res.status(404).json({ success: false, message: 'Student not found.' });

    const parent = await User.findById(parentId);
    if (!parent || parent.role !== 'parent')
      return res.status(404).json({ success: false, message: 'Parent not found.' });

    // One parent per student — clear any previous link first
    const prevParentIds = [
      ...(student.linkedParents || []).map(String),
      ...(student.parentId ? [String(student.parentId)] : []),
    ];
    for (const pid of [...new Set(prevParentIds)]) {
      if (pid !== String(parent._id)) {
        await User.findByIdAndUpdate(pid, { $pull: { linkedStudents: student._id } });
      }
    }

    student.linkedParents = [parent._id];
    student.parentId = parent._id;
    await student.save();
    await User.findByIdAndUpdate(parent._id, { $addToSet: { linkedStudents: student._id } });

    res.json({
      success: true,
      message: 'Parent linked.',
      data: {
        parent: {
          _id: parent._id,
          name: `${parent.firstName || ''} ${parent.lastName || ''}`.trim(),
          email: parent.email,
        },
      },
    });
  } catch (e) {
    console.error('[users link-parent]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/users/:id/create-and-link-parent
// Creates a NEW parent account and links it to the student.
// Body: { firstName, lastName, email, phone }
// The parent gets a real account (temp password, welcome email)
// via the same path as any admin-created parent.
router.post('/:id/create-and-link-parent', auth, requireRole('admin'), async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !firstName.trim())
      return res.status(400).json({ success: false, message: 'Parent first name is required.' });
    if (!email || !email.trim())
      return res.status(400).json({ success: false, message: 'Parent email is required.' });

    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student')
      return res.status(404).json({ success: false, message: 'Student not found.' });

    // Reuse an existing parent account if this email already exists
    let parent = await User.findOne({ email: email.trim().toLowerCase() });
    let createdNew = false;

    if (parent) {
      if (parent.role !== 'parent')
        return res.status(400).json({
          success: false,
          message: 'That email already belongs to a non-parent account.',
        });
    } else {
      const tempPassword = User.generateTempPassword();
      parent = await User.create({
        firstName: firstName.trim(),
        lastName: (lastName || '').trim(),
        email: email.trim().toLowerCase(),
        phone: (phone || '').trim(),
        role: 'parent',
        password: tempPassword,
        isActive: true,
        mustChangePassword: true,
      });
      createdNew = true;

      // Welcome email — best-effort, mirrors the normal parent-create flow
      try {
        await sendWelcomeEmail({
          to: parent.email,
          name: `${parent.firstName} ${parent.lastName}`.trim(),
          tempPassword,
          role: 'parent',
        });
      } catch (mailErr) {
        console.error('Parent welcome email failed:', mailErr.message);
      }
    }

    // Link both ways — one parent per student
    const prevParentIds = [
      ...(student.linkedParents || []).map(String),
      ...(student.parentId ? [String(student.parentId)] : []),
    ];
    for (const pid of [...new Set(prevParentIds)]) {
      if (pid !== String(parent._id)) {
        await User.findByIdAndUpdate(pid, { $pull: { linkedStudents: student._id } });
      }
    }
    student.linkedParents = [parent._id];
    student.parentId = parent._id;
    await student.save();
    await User.findByIdAndUpdate(parent._id, { $addToSet: { linkedStudents: student._id } });

    res.json({
      success: true,
      message: createdNew ? 'Parent account created and linked.' : 'Existing parent linked.',
      data: {
        parent: {
          _id: parent._id,
          name: `${parent.firstName || ''} ${parent.lastName || ''}`.trim(),
          email: parent.email,
        },
        createdNew,
      },
    });
  } catch (e) {
    console.error('[users create-and-link-parent]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE /api/users/:id/parent — unlink a student's parent (both ways)
router.delete('/:id/parent', auth, requireRole('admin'), async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student')
      return res.status(404).json({ success: false, message: 'Student not found.' });

    const parentIds = [
      ...(student.linkedParents || []).map(String),
      ...(student.parentId ? [String(student.parentId)] : []),
    ];
    for (const pid of [...new Set(parentIds)]) {
      await User.findByIdAndUpdate(pid, { $pull: { linkedStudents: student._id } });
    }
    student.linkedParents = [];
    student.parentId = undefined;
    await student.save();

    res.json({ success: true, message: 'Parent unlinked.' });
  } catch (e) {
    console.error('[users unlink-parent]', e.message);
    res.status(500).json({ success: false, message: e.message });
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

// POST /api/users/:id/send-email — admin sends a branded email to a teacher
// Body: { subject, body, kind }
// Records the send in the teacher's sentEmails history.
router.post('/:id/send-email', auth, requireRole('admin'), async (req, res) => {
  try {
    const { subject, body, kind = 'memo' } = req.body;

    if (!subject || !subject.trim())
      return res.status(400).json({ success: false, message: 'Subject is required.' });
    if (!body || !body.trim())
      return res.status(400).json({ success: false, message: 'Message body is required.' });

    const teacher = await User.findById(req.params.id);
    if (!teacher)
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    if (!teacher.email)
      return res.status(400).json({ success: false, message: 'This teacher has no email address.' });

    const senderName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Smartious Administration';

    const result = await sendTeacherMemoEmail({
      to: teacher.email,
      teacherName: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim(),
      subject: subject.trim(),
      bodyText: body,
      kind,
      senderName,
    });

    if (!result.success) {
      return res.status(502).json({
        success: false,
        message: 'Email could not be sent: ' + (result.error || 'unknown error'),
      });
    }

    // Record in history (append-only)
    teacher.sentEmails = teacher.sentEmails || [];
    teacher.sentEmails.push({
      subject: subject.trim(),
      kind,
      sentAt: new Date(),
      sentBy: req.user._id,
      sentByName: senderName,
    });
    await teacher.save();

    res.json({
      success: true,
      message: 'Email sent to ' + teacher.email,
      data: { sentEmails: teacher.sentEmails },
    });
  } catch (e) {
    console.error('[users send-email]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/users/:id/delete-impact — preview what deleting a teacher affects
// MODEL A: lessons/questions belong to subjects and are NOT deleted.
// Only the teacher's Allocations need handling. This endpoint reports
// the counts so the admin can confirm with full information.
router.get('/:id/delete-impact', auth, requireRole('admin'), async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const Allocation = require('../models/Allocation');
    const Lesson = require('../models/Lesson');

    const target = await User.findById(req.params.id).lean();
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    const activeAllocations = await Allocation.countDocuments({
      teacherId: req.params.id, status: 'Active',
    });
    // Lessons this teacher authored (kept — shown for transparency)
    const authoredLessons = await Lesson.countDocuments({ teacherId: req.params.id });

    res.json({
      success: true,
      data: {
        teacherName: `${target.firstName || ''} ${target.lastName || ''}`.trim(),
        activeAllocations,    // these will be deactivated
        authoredLessons,      // these are KEPT (belong to the subject)
        blocked: !!target.isMainAdmin || !!target.isDemo,
      },
    });
  } catch (e) {
    console.error('[users delete-impact]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const Allocation = require('../models/Allocation');
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    if (target.isMainAdmin) {
      return res.status(403).json({ success: false, message: 'Main admin account cannot be deleted.' });
    }

    if (target.isDemo) {
      return res.status(403).json({ success: false, message: 'Demo users cannot be deleted.' });
    }

    let deactivatedAllocations = 0;

    if (target.role === 'teacher') {
      // MODEL A: the teacher's lessons, questions, and other content
      // belong to their subjects — they are NOT deleted and stay
      // available to whoever teaches the subject next.
      //
      // Their Allocations DO need handling: deactivate them so no
      // student points at a deleted teacher. Admin can then allocate
      // a replacement teacher for those (student, subject) pairs.
      try {
        const result = await Allocation.updateMany(
          { teacherId: req.params.id, status: 'Active' },
          { $set: { status: 'Inactive', updatedBy: req.user._id, updatedAt: new Date() } }
        );
        deactivatedAllocations = result.modifiedCount || 0;
        console.log(`✓ Deactivated ${deactivatedAllocations} allocation(s) for deleted teacher ${target.email}`);
      } catch (allocErr) {
        console.error('Failed to deactivate allocations:', allocErr.message);
      }

      try {
        await Teacher.deleteOne({ email: target.email });
        console.log(`✓ Teacher record deleted for ${target.firstName} ${target.lastName}`);
      } catch (teacherError) {
        console.error('Failed to delete Teacher record:', teacherError.message);
      }
    }

    await target.deleteOne();
    res.json({
      success: true,
      message: 'User deleted.',
      data: { deactivatedAllocations },
    });
  } catch (e) {
    console.error('[users delete]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/users/public-teachers   — PUBLIC (no auth)
// Powers the public "Meet Our Team" page on the landing site.
// Returns ONLY safe, public profile fields for every teacher —
// never email, phone, or any private/contact data.
// ─────────────────────────────────────────────────────────
router.get('/public-teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('firstName lastName jobTitle bio avatar qualifications certifications specializations yearsOfExperience subjects curriculum createdAt')
      .lean();

    // Explicitly whitelist the public fields — nothing else leaves the server.
    const publicTeachers = teachers.map(t => ({
      id: String(t._id),
      name: `${t.firstName || ''} ${t.lastName || ''}`.trim(),
      jobTitle: t.jobTitle || 'Teacher',
      bio: t.bio || '',
      avatar: t.avatar || '',
      qualifications: Array.isArray(t.qualifications) ? t.qualifications : [],
      certifications: Array.isArray(t.certifications) ? t.certifications : [],
      specializations: Array.isArray(t.specializations) ? t.specializations : [],
      yearsOfExperience: t.yearsOfExperience || 0,
      subjects: Array.isArray(t.subjects) ? t.subjects : [],
      curriculum: Array.isArray(t.curriculum) ? t.curriculum : (t.curriculum ? [t.curriculum] : []),
    }));

    // Most experienced first, then alphabetical
    publicTeachers.sort((a, b) =>
      (b.yearsOfExperience - a.yearsOfExperience) || a.name.localeCompare(b.name)
    );

    res.json({ success: true, data: { teachers: publicTeachers } });
  } catch (e) {
    console.error('[users public-teachers]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
