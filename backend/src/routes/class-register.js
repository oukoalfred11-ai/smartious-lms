/**
 * class-register.js — per-session attendance, owned by the class teacher.
 *
 * The old day-register model confused everyone: one student has several
 * teachers, so "who marks the day?" had no good answer. Attendance now
 * belongs to each class session:
 *   - joining a class auto-records presence (ClassroomSession)
 *   - the class's own teacher confirms or amends the register afterwards
 *   - the factual metric everywhere becomes: attended X of Y scheduled
 *     classes, never a percentage of only-the-days-that-had-records.
 *
 *   GET  /api/class-register/:liveClassId      the register for one session
 *   POST /api/class-register/:liveClassId      amendments [{studentId, present}]
 */
const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const LiveClass = require('../models/LiveClass');
const ClassroomSession = require('../models/ClassroomSession');
const User = require('../models/User');

const STAFF = ['admin', 'ops_manager', 'dos'];

async function loadClass(req, res) {
  const cls = await LiveClass.findById(req.params.liveClassId)
    .select('title subject grade teacherId assignedStudents scheduledAt status kind').lean();
  if (!cls) { res.status(404).json({ success: false, message: 'Class not found.' }); return null; }
  const isTeacher = String(cls.teacherId) === String(req.user._id);
  if (!isTeacher && !STAFF.includes(req.user.role)) {
    res.status(403).json({ success: false, message: 'Only the class teacher or academic staff can view this register.' });
    return null;
  }
  return cls;
}

router.get('/:liveClassId', auth, requireRole('teacher', ...STAFF), async (req, res) => {
  try {
    const cls = await loadClass(req, res);
    if (!cls) return;
    const [students, sessions] = await Promise.all([
      User.find({ _id: { $in: cls.assignedStudents || [] } }).select('firstName lastName gradeLevel').lean(),
      ClassroomSession.find({ liveClassId: cls._id }).select('userId present joinCount firstJoinedAt markedBy').lean(),
    ]);
    const byUser = Object.fromEntries(sessions.map(s => [String(s.userId), s]));
    const rows = students.map(st => {
      const s = byUser[String(st._id)];
      return {
        studentId: st._id,
        name: [st.firstName, st.lastName].filter(Boolean).join(' '),
        grade: st.gradeLevel || '',
        joined: !!s && (s.joinCount || 0) > 0,
        firstJoinedAt: s?.firstJoinedAt || null,
        present: s ? s.present !== false : false,
        amended: !!s?.markedBy,
      };
    }).sort((a, b) => (a.name > b.name ? 1 : -1));
    res.json({ success: true, data: { class: cls, rows } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/:liveClassId', auth, requireRole('teacher', ...STAFF), async (req, res) => {
  try {
    const cls = await loadClass(req, res);
    if (!cls) return;
    const marks = Array.isArray(req.body?.marks) ? req.body.marks : [];
    if (!marks.length) return res.status(400).json({ success: false, message: 'No marks provided.' });
    const allowed = new Set((cls.assignedStudents || []).map(String));
    let applied = 0;
    for (const m of marks) {
      if (!m || !allowed.has(String(m.studentId))) continue;
      await ClassroomSession.updateOne(
        { liveClassId: cls._id, userId: m.studentId },
        {
          $set: { present: m.present !== false, markedBy: req.user._id },
          $setOnInsert: { firstJoinedAt: null, joinCount: 0 },
        },
        { upsert: true }
      );
      applied += 1;
    }
    res.json({ success: true, message: `Register saved: ${applied} student(s).`, data: { applied } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
