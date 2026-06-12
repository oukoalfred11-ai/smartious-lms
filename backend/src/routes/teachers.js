const express = require('express');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Subject = require('../models/Subject');
const { auth, requireRole } = require('../middleware/auth');
const { sendTeacherCredentialsEmail } = require('../services/emailService');
const { generateTemporaryPassword } = require('../services/credentialsService');
const router = express.Router();

// Audit log stub
function logAudit(user, action, details) {
  console.log(`[AUDIT] ${user}: ${action}`, details);
}

// ─────────────────────────────────────────────────────────────────
// buildTeachingSpecialties
// ─────────────────────────────────────────────────────────────────
// Given a list of Subject ObjectIds and one or more curriculum
// strings, resolve the subject documents and return a
// teachingSpecialties array that the allocation system can query.
//
// This is the single source of truth for keeping User.teachingSpecialties
// in sync whenever subjects or curriculum change on a teacher.
// ─────────────────────────────────────────────────────────────────
async function buildTeachingSpecialties(subjectIds, curricula) {
  if (!subjectIds || subjectIds.length === 0) return [];
  const curriculaList = Array.isArray(curricula)
    ? curricula.filter(Boolean)
    : curricula ? [curricula] : [];
  if (curriculaList.length === 0) return [];

  // Fetch real Subject documents to get the canonical _id
  const subjects = await Subject.find({
    _id: { $in: subjectIds },
    isActive: true,
  }).select('_id').lean();

  const specialties = [];
  for (const subject of subjects) {
    for (const curr of curriculaList) {
      specialties.push({ subjectId: subject._id, curriculum: curr });
    }
  }
  return specialties;
}

// GET /api/teachers - List all teachers (public for frontend)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const curriculum = req.query.curriculum;
    const status = req.query.status;

    const filter = {};
    if (status) filter.status = status;
    if (curriculum && curriculum !== 'all') {
      filter.$or = [
        { curriculum: curriculum },
        { universalCurriculum: true }
      ];
    }

    const total = await Teacher.countDocuments(filter);
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
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
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
    if (!teacher)
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, teacher });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/teachers - Create teacher (admin only)
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    if (!req.body.firstName || !req.body.lastName || !req.body.email) {
      return res.status(400).json({
        success: false,
        message: 'firstName, lastName, and email are required'
      });
    }

    // Full 15-curriculum catalog — matches SCHOOL_CURRICULA in Dashboard.jsx
    const validCurriculums = [
      'CambridgePrimary', 'CambridgeLowerSec', 'CambridgeIGCSE', 'CambridgeALevel',
      'EdexcelLowerSec',  'EdexcelIGCSE',      'EdexcelALevel',
      'AQALowerSec',      'AQAGCSE',           'AQAALevel',
      'IB', 'BNC', 'American', 'Canadian', 'KenyaCBC',
      // Legacy strings — kept so existing teacher data is not broken
      'IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC',
    ];
    if (!req.body.curriculum || !validCurriculums.includes(req.body.curriculum)) {
      return res.status(400).json({
        success: false,
        message: `Curriculum is required and must be one of the supported curricula.`
      });
    }

    const subjectIds = Array.isArray(req.body.subjects) && req.body.subjects.length > 0
      ? req.body.subjects
      : [];

    const teacherData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone || '',
      bio: req.body.bio || '',
      curriculum: req.body.curriculum,
      subjects: subjectIds,
      qualifications: Array.isArray(req.body.qualifications) ? req.body.qualifications : [],
      experience: req.body.experience || 0,
      status: req.body.status || 'Active',
      universalCurriculum: req.body.universalCurriculum || false,
      isDemo: req.body.isDemo || false,
    };

    const teacher = new Teacher(teacherData);
    await teacher.save();

    // Build teachingSpecialties for the User record so the allocation
    // system can find this teacher immediately after creation.
    const teachingSpecialties = await buildTeachingSpecialties(
      subjectIds,
      req.body.curriculum
    );

    // Create or update the User record
    let user = await User.findOne({ email: req.body.email });

    if (!user) {
      const tempPassword = generateTemporaryPassword();

      user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: tempPassword,
        role: 'teacher',
        phone: req.body.phone || '',
        curriculum: req.body.curriculum,
        subjects: subjectIds,
        // ── THE FIX ──────────────────────────────────────────────
        // Populate teachingSpecialties so this teacher appears in
        // allocation suggest-teachers queries immediately.
        teachingSpecialties,
        // ─────────────────────────────────────────────────────────
        isActive: true,
        isDemo: req.body.isDemo || false,
        plan: 'Staff',
        forcePasswordChange: true,
      });

      await user.save();

      teacher.userId = user._id;
      await teacher.save();

      try {
        const loginUrl = process.env.CLIENT_URL || 'https://smartioushomeschool.com';
        await sendTeacherCredentialsEmail({
          teacherEmail: user.email,
          teacherName: user.firstName,
          tempPassword,
          loginUrl,
          expiresIn: '24 hours'
        });
        console.log(`✓ Teacher ${user.email} created with credentials sent`);
      } catch (emailError) {
        console.error('Failed to send credentials email:', emailError.message);
      }
    } else {
      // User already exists — update their teachingSpecialties to include
      // any subjects just assigned via the Teacher record.
      teacher.userId = user._id;
      await teacher.save();

      // Merge with any existing specialties rather than overwriting,
      // in case the teacher was previously registered with different subjects.
      const existingKeys = new Set(
        (user.teachingSpecialties || []).map(ts => `${ts.subjectId}::${ts.curriculum}`)
      );
      const newSpecialties = teachingSpecialties.filter(
        ts => !existingKeys.has(`${ts.subjectId}::${ts.curriculum}`)
      );
      if (newSpecialties.length > 0) {
        await User.findByIdAndUpdate(user._id, {
          $push: { teachingSpecialties: { $each: newSpecialties } }
        });
      }
    }

    logAudit(req.user?.email || 'system', 'create_teacher', teacher);

    await teacher.populate('subjects', 'subjectName curriculum');
    await teacher.populate('userId', 'firstName lastName email');

    const io = req.app.locals.io;
    if (io) {
      io.emit('TEACHER_CREATED', {
        teacher: teacher.toObject(),
        message: `New teacher ${teacher.firstName} ${teacher.lastName} added to system`
      });
    }

    res.status(201).json({
      success: true,
      teacher,
      message: 'Teacher created. Credentials sent to email.',
      credentialsSent: true
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// PATCH /api/teachers/:id - Update teacher (admin only)
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher)
      return res.status(404).json({ success: false, message: 'Teacher not found' });

    if (teacher.isDemo) {
      delete req.body.isDemo;
      delete req.body.email;
    }

    // Handle "Add All Subjects" shortcut
    if (req.body.addAllSubjects === true) {
      const allSubjects = await Subject.find({ isActive: true });
      req.body.subjects = allSubjects.map(s => s._id);
      delete req.body.addAllSubjects;
    }

    const allowedFields = [
      'firstName', 'lastName', 'phone', 'bio', 'subjects', 'curriculum',
      'qualifications', 'experience', 'status', 'rating',
      'totalStudents', 'totalSessions', 'universalCurriculum'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (field in req.body) updates[field] = req.body[field];
    }

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

    // ── Sync teachingSpecialties on the User record ────────────
    // Whenever subjects or curriculum are updated on the Teacher,
    // rebuild teachingSpecialties on the linked User so the
    // allocation system reflects the change immediately.
    const subjectsChanged = 'subjects' in updates;
    const curriculumChanged = 'curriculum' in updates;

    if ((subjectsChanged || curriculumChanged) && updatedTeacher.userId) {
      try {
        const finalSubjectIds = updatedTeacher.subjects || [];
        const finalCurriculum  = updatedTeacher.curriculum;

        const freshSpecialties = await buildTeachingSpecialties(
          finalSubjectIds,
          finalCurriculum
        );

        // Full replace of teachingSpecialties — admin just confirmed
        // the new subject/curriculum set so the old entries are stale.
        await User.findByIdAndUpdate(updatedTeacher.userId, {
          $set: {
            teachingSpecialties: freshSpecialties,
            // Keep User.subjects in sync too so the profile page
            // reflects the same subjects as the Teacher record.
            subjects: finalSubjectIds,
            curriculum: finalCurriculum,
          }
        });

        console.log(
          `[teachers PATCH] synced teachingSpecialties for user ${updatedTeacher.userId}:`,
          `${freshSpecialties.length} specialties`
        );
      } catch (syncErr) {
        // Non-fatal — log and continue. The teacher record is updated;
        // only the allocation filter is affected until the next save.
        console.error('[teachers PATCH] teachingSpecialties sync failed:', syncErr.message);
      }
    }

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
    if (!teacher)
      return res.status(404).json({ success: false, message: 'Teacher not found' });

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
