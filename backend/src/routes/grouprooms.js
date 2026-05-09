/**
 * GROUP ROOMS — ZOOM INTEGRATION ROUTES (minimal)
 * ============================================================
 * This is a SLIM route file focused only on Zoom link operations.
 * Full GroupRoom CRUD will come later when we migrate the
 * frontend store from localStorage to backend.
 *
 *   GET    /api/grouprooms              -> list all rooms (read-only sync)
 *   POST   /api/grouprooms/sync         -> bulk-sync rooms from frontend
 *   GET    /api/grouprooms/:id/zoom     -> get zoom link for a room
 *   PATCH  /api/grouprooms/:id/zoom     -> teacher sets zoom link
 *
 * Security:
 *  - All routes require valid JWT (auth middleware)
 *  - Setting zoom link requires teacher or admin role
 *  - Reading zoom link requires student/teacher/admin (any logged-in user)
 */

const express = require('express');
const router = express.Router();
const GroupRoom = require('../models/GroupRoom');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────
// GET /api/grouprooms — list all rooms (logged-in users)
// ─────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await GroupRoom.find({ status: 'Active' })
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, rooms });
  } catch (e) {
    console.error('[grouprooms GET]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to load rooms.' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/grouprooms/sync — bulk-sync rooms from frontend
// Used by admin to push localStorage rooms to backend so they
// can be looked up by ID for Zoom operations.
// ─────────────────────────────────────────────────────────
router.post('/sync', auth, requireRole('admin'), async (req, res) => {
  try {
    const { rooms } = req.body;

    if (!Array.isArray(rooms)) {
      return res.status(400).json({ success: false, message: 'rooms must be an array.' });
    }

    let created = 0;
    let updated = 0;

    for (const r of rooms) {
      // Skip rooms without required fields
      if (!r.name || !r.subject) continue;

      // Skip the localStorage ID format (room-1234567890) — only sync rooms
      // that have proper data. Use name+subject as deduplication key.
      const filter = { name: r.name, subject: r.subject };

      const existing = await GroupRoom.findOne(filter);

      if (existing) {
        // Don't overwrite zoomLink if already set
        const updateData = {
          curriculum: r.curriculum,
          grade: r.grade,
          capacity: r.capacity || 10,
          schedule: r.schedule,
          status: r.status || 'Active',
        };
        await GroupRoom.findByIdAndUpdate(existing._id, { $set: updateData });
        updated++;
      } else {
        await GroupRoom.create({
          name: r.name,
          subject: r.subject,
          curriculum: r.curriculum,
          grade: r.grade,
          capacity: r.capacity || 10,
          schedule: r.schedule,
          status: r.status || 'Active',
        });
        created++;
      }
    }

    return res.json({
      success: true,
      message: `Synced ${rooms.length} rooms (${created} created, ${updated} updated).`,
      created,
      updated,
    });
  } catch (e) {
    console.error('[grouprooms/sync]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to sync rooms.' });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/grouprooms/:id/zoom — get zoom link
// Any logged-in user can fetch (students, teachers, admin)
// ─────────────────────────────────────────────────────────
router.get('/:id/zoom', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid room ID.' });
    }

    const room = await GroupRoom.findById(id).select('name subject zoomLink zoomStartedAt').lean();

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    return res.json({
      success: true,
      roomId: room._id,
      roomName: room.name,
      subject: room.subject,
      zoomLink: room.zoomLink || null,
      zoomStartedAt: room.zoomStartedAt || null,
      isLive: !!(room.zoomLink && room.zoomStartedAt),
    });
  } catch (e) {
    console.error('[grouprooms/zoom GET]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to load zoom link.' });
  }
});

// ─────────────────────────────────────────────────────────
// PATCH /api/grouprooms/:id/zoom — teacher sets zoom link
// Teachers and admins only
// ─────────────────────────────────────────────────────────
router.patch('/:id/zoom', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { zoomLink, action } = req.body;

    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid room ID.' });
    }

    // Role check
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and admins can set zoom links.',
      });
    }

    let updates = {};

    if (action === 'end') {
      // Teacher ends the class — clear the zoom link
      updates = {
        zoomLink: '',
        zoomStartedAt: null,
        zoomStartedBy: null,
      };
    } else {
      // Teacher starts/sets the class
      if (!zoomLink || typeof zoomLink !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'zoomLink is required.',
        });
      }

      // Basic URL validation
      const trimmed = zoomLink.trim();
      if (!/^https?:\/\/.+/i.test(trimmed)) {
        return res.status(400).json({
          success: false,
          message: 'Zoom link must be a valid URL starting with http:// or https://',
        });
      }

      updates = {
        zoomLink: trimmed,
        zoomStartedAt: new Date(),
        zoomStartedBy: req.user._id,
      };
    }

    const room = await GroupRoom.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).select('name subject zoomLink zoomStartedAt').lean();

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    console.log('[grouprooms/zoom PATCH]', action || 'set', '·', room.name, '·', room.zoomLink || 'cleared');

    return res.json({
      success: true,
      message: action === 'end' ? 'Class ended.' : 'Zoom link saved.',
      roomId: room._id,
      zoomLink: room.zoomLink || null,
      zoomStartedAt: room.zoomStartedAt || null,
    });
  } catch (e) {
    console.error('[grouprooms/zoom PATCH]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to save zoom link.' });
  }
});

// ─────────────────────────────────────────────────────────
// PHASE 2: ROOM CRUD + AUTO-ENROLLMENT
// Add these routes to backend/src/routes/grouprooms.js
// (paste them just BEFORE the `module.exports = router;` line)
// ─────────────────────────────────────────────────────────
 
// Helper: find students whose enrollment matches this room and add them to students[]
// Also: remove students who no longer match
async function autoEnrollStudents(roomId) {
  const room = await GroupRoom.findById(roomId);
  if (!room) return { added: 0, removed: 0 };
 
  // Find all students matching this room's curriculum + grade + subject
  const matchingStudents = await User.find({
    role: 'student',
    isActive: true,
    curriculum: room.curriculum,
    gradeLevel: room.grade,
    subjects: room.subject,  // mongoose handles "string in array" automatically
  }).select('_id');
 
  const matchingIds = matchingStudents.map(s => s._id.toString());
  const currentIds = (room.students || []).map(id => id.toString());
 
  // Add: new students who match but aren't in the room
  const toAdd = matchingIds.filter(id => !currentIds.includes(id));
  // Remove: students currently in the room who no longer match
  const toRemove = currentIds.filter(id => !matchingIds.includes(id));
 
  if (toAdd.length > 0 || toRemove.length > 0) {
    room.students = matchingIds; // overwrite with the matched set
    await room.save();
  }
 
  return { added: toAdd.length, removed: toRemove.length, total: matchingIds.length };
}
 
// ─────────────────────────────────────────────────────────
// POST /api/grouprooms — create a new room (admin only)
// ─────────────────────────────────────────────────────────
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, subject, curriculum, grade, capacity, schedule, status, teacher } = req.body;
 
    // Basic validation
    if (!name || !subject) {
      return res.status(400).json({ success: false, message: 'name and subject are required.' });
    }
 
    const room = await GroupRoom.create({
      name: name.trim(),
      subject: subject.trim(),
      curriculum: curriculum || '',
      grade: grade || '',
      capacity: capacity || 10,
      schedule: schedule || '',
      status: status || 'Active',
      teacher: teacher || null,
      students: [],
    });
 
    // Auto-enroll matching students immediately
    const enroll = await autoEnrollStudents(room._id);
    console.log('[grouprooms POST]', room.name, '· enrolled', enroll.total, 'matching students');
 
    return res.json({
      success: true,
      message: 'Room created.' + (enroll.added > 0 ? ' Auto-enrolled ' + enroll.added + ' student(s).' : ''),
      room: await GroupRoom.findById(room._id).lean(),
    });
  } catch (e) {
    console.error('[grouprooms POST]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to create room.' });
  }
});
 
// ─────────────────────────────────────────────────────────
// PATCH /api/grouprooms/:id — edit a room (admin only)
// Re-runs auto-enrollment after edit.
// ─────────────────────────────────────────────────────────
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid room ID.' });
    }
 
    // Allow updating these fields only (not zoomLink, _id, students[])
    const allowed = ['name', 'subject', 'curriculum', 'grade', 'capacity', 'schedule', 'status', 'teacher'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
 
    const room = await GroupRoom.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }
 
    // Re-run auto-enrollment with potentially-changed criteria
    const enroll = await autoEnrollStudents(room._id);
    console.log('[grouprooms PATCH]', room.name, '· enrolled', enroll.total, '· added', enroll.added, '· removed', enroll.removed);
 
    return res.json({
      success: true,
      message: 'Room updated.' +
        (enroll.added > 0 ? ' Added ' + enroll.added + ' student(s).' : '') +
        (enroll.removed > 0 ? ' Removed ' + enroll.removed + ' student(s).' : ''),
      room: await GroupRoom.findById(room._id).lean(),
    });
  } catch (e) {
    console.error('[grouprooms PATCH]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to update room.' });
  }
});
 
// ─────────────────────────────────────────────────────────
// DELETE /api/grouprooms/:id — delete a room (admin only)
// ─────────────────────────────────────────────────────────
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid room ID.' });
    }
 
    const room = await GroupRoom.findByIdAndDelete(id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }
 
    return res.json({ success: true, message: 'Room deleted.' });
  } catch (e) {
    console.error('[grouprooms DELETE]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to delete room.' });
  }
});
 
// ─────────────────────────────────────────────────────────
// POST /api/grouprooms/:id/reenroll — manually re-run auto-enrollment
// Useful if admin updates a student's curriculum/subjects and wants
// to immediately push that student into matching rooms.
// ─────────────────────────────────────────────────────────
router.post('/:id/reenroll', auth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid room ID.' });
    }
 
    const enroll = await autoEnrollStudents(id);
    return res.json({
      success: true,
      message: 'Re-enrolled. ' + enroll.total + ' total student(s) match.',
      ...enroll,
    });
  } catch (e) {
    console.error('[grouprooms reenroll]', e.message);
    return res.status(500).json({ success: false, message: 'Failed to re-enroll.' });
  }
});

module.exports = router;
