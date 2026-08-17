/**
 * routes/classroom.js — REST support for the native Smartious Classroom.
 * Mounted at /api/classroom
 *
 *   GET /ice                — ICE server list for RTCPeerConnection.
 *                             Free public STUN always; TURN only when the
 *                             coturn env vars are set. TURN credentials are
 *                             time-limited HMAC (coturn static-auth-secret
 *                             mode) so the secret itself never leaves the
 *                             server and a leaked credential dies in 6 hours.
 *   GET /:liveClassId/status — is the native room live, how many people.
 *                             Lets the Student Portal show "Join classroom"
 *                             only once the teacher is actually inside.
 *
 * Env (all optional until you stand up coturn):
 *   TURN_URL     e.g. turn:turn.smartioushomeschool.com:3478
 *   TURN_SECRET  the static-auth-secret from /etc/turnserver.conf
 */
const router = require('express').Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const { roomStatus } = require('../realtime/classroom');

router.get('/ice', auth, (req, res) => {
  const iceServers = [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  ];

  if (process.env.TURN_URL && process.env.TURN_SECRET) {
    // coturn "use-auth-secret" convention: username = expiry:userId,
    // credential = base64(HMAC-SHA1(secret, username)).
    const ttl = 6 * 60 * 60;
    const username = `${Math.floor(Date.now() / 1000) + ttl}:${req.user._id}`;
    const credential = crypto
      .createHmac('sha1', process.env.TURN_SECRET)
      .update(username).digest('base64');
    iceServers.push({ urls: process.env.TURN_URL, username, credential });
  }

  res.json({ success: true, data: { iceServers } });
});

/**
 * GET /:liveClassId/attendance — per-student session report for a
 * native class: joined time, minutes connected, reconnects, lateness.
 * Includes assigned students who never joined (marked absent) so the
 * teacher sees the full register. Teacher of the class or staff only.
 */
router.get('/:liveClassId/attendance', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.liveClassId))
      return res.status(400).json({ success: false, message: 'Invalid id.' });

    const LiveClass = require('../models/LiveClass');
    const lc = await LiveClass.findById(req.params.liveClassId)
      .select('title subject scheduledAt durationMins teacherId assignedStudents')
      .populate('assignedStudents', 'firstName lastName')
      .lean();
    if (!lc) return res.status(404).json({ success: false, message: 'Class not found.' });

    const isOwner = String(lc.teacherId) === String(req.user._id);
    const isStaff = ['admin', 'dos', 'ops_manager'].includes(req.user.role);
    if (!isOwner && !isStaff)
      return res.status(403).json({ success: false, message: 'Not your class.' });

    const ClassroomSession = require('../models/ClassroomSession');
    const sessions = await ClassroomSession.find({ liveClassId: lc._id }).lean();
    const byUser = new Map(sessions.map(s => [String(s.userId), s]));

    const scheduled = new Date(lc.scheduledAt);
    const students = (lc.assignedStudents || []).map(stu => {
      const s = byUser.get(String(stu._id));
      if (!s || !s.firstJoinedAt) {
        return {
          userId: stu._id,
          name: `${stu.firstName || ''} ${stu.lastName || ''}`.trim(),
          status: 'absent', joinedAt: null, minutes: 0, joinCount: 0, lateByMin: 0,
        };
      }
      const lateByMin = Math.max(0, Math.round((new Date(s.firstJoinedAt) - scheduled) / 60000));
      return {
        userId: stu._id,
        name: `${stu.firstName || ''} ${stu.lastName || ''}`.trim() || s.name,
        status: lateByMin > 10 ? 'late' : 'present',
        joinedAt: s.firstJoinedAt,
        minutes: Math.round((s.durationMs || 0) / 60000),
        joinCount: s.joinCount || 0,
        lateByMin,
      };
    });

    // Teacher's own session, for the record.
    const teacherSession = sessions.find(s => String(s.userId) === String(lc.teacherId));

    res.json({
      success: true,
      data: {
        classInfo: { title: lc.title, subject: lc.subject, scheduledAt: lc.scheduledAt, durationMins: lc.durationMins },
        teacher: teacherSession ? {
          joinedAt: teacherSession.firstJoinedAt,
          minutes: Math.round((teacherSession.durationMs || 0) / 60000),
        } : null,
        students,
      },
    });
  } catch (e) {
    console.error('[classroom attendance]', e.message);
    res.status(500).json({ success: false, message: 'Failed to load attendance.' });
  }
});

router.get('/:liveClassId/status', auth, (req, res) => {
  if (!mongoose.isValidObjectId(req.params.liveClassId))
    return res.status(400).json({ success: false, message: 'Invalid id.' });
  res.json({ success: true, data: roomStatus(req.params.liveClassId) });
});

module.exports = router;
