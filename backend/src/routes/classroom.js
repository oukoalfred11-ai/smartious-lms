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
const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const { roomStatus } = require('../realtime/classroom');

// ── R2 client (same env vars as the Library) ───────────────
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const R2_READY = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME && process.env.R2_PUBLIC_URL);
const r2 = R2_READY ? new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
}) : null;

// ── Lesson recording: chunked upload ───────────────────────
// The teacher's browser records the lesson with MediaRecorder and
// posts 5-second WebM chunks as they are produced. Chunks append to
// a temp file on this server; on finish the whole file goes to R2
// and the URL is saved on the LiveClass. Memory use stays flat no
// matter how long the lesson runs.
//
// recId is minted at start and bound to (classId, teacher) so chunks
// cannot be appended to someone else's recording.
const activeRecordings = new Map();   // recId -> { classId, userId, path, bytes, startedAt }

async function requireOwnClass(req, res) {
  if (!mongoose.isValidObjectId(req.params.liveClassId)) {
    res.status(400).json({ success: false, message: 'Invalid id.' });
    return null;
  }
  const LiveClass = require('../models/LiveClass');
  const lc = await LiveClass.findById(req.params.liveClassId).select('teacherId title subject');
  if (!lc) { res.status(404).json({ success: false, message: 'Class not found.' }); return null; }
  const ok = String(lc.teacherId) === String(req.user._id) || req.user.role === 'admin';
  if (!ok) { res.status(403).json({ success: false, message: 'Not your class.' }); return null; }
  return lc;
}

router.post('/:liveClassId/recording/start', auth, async (req, res) => {
  try {
    if (!R2_READY) return res.status(503).json({ success: false, message: 'Recording storage (R2) is not configured.' });
    const lc = await requireOwnClass(req, res);
    if (!lc) return;
    const recId = crypto.randomUUID();
    const tmpPath = path.join(os.tmpdir(), `smartious-rec-${recId}.webm`);
    fs.writeFileSync(tmpPath, Buffer.alloc(0));
    activeRecordings.set(recId, {
      classId: String(lc._id), userId: String(req.user._id),
      path: tmpPath, bytes: 0, startedAt: Date.now(),
    });
    res.json({ success: true, data: { recId } });
  } catch (e) {
    console.error('[recording start]', e.message);
    res.status(500).json({ success: false, message: 'Could not start recording.' });
  }
});

router.post('/:liveClassId/recording/:recId/chunk', auth,
  express.raw({ type: 'application/octet-stream', limit: '25mb' }),
  async (req, res) => {
    try {
      const rec = activeRecordings.get(req.params.recId);
      if (!rec || rec.classId !== req.params.liveClassId || rec.userId !== String(req.user._id))
        return res.status(404).json({ success: false, message: 'Unknown recording.' });
      if (!req.body || !req.body.length)
        return res.json({ success: true });
      // 2 GB hard cap (~5 hours at lesson bitrate) protects the disk.
      if (rec.bytes + req.body.length > 2 * 1024 * 1024 * 1024)
        return res.status(413).json({ success: false, message: 'Recording too large.' });
      fs.appendFileSync(rec.path, req.body);
      rec.bytes += req.body.length;
      res.json({ success: true, data: { bytes: rec.bytes } });
    } catch (e) {
      console.error('[recording chunk]', e.message);
      res.status(500).json({ success: false, message: 'Chunk failed.' });
    }
  });

router.post('/:liveClassId/recording/:recId/finish', auth, async (req, res) => {
  const rec = activeRecordings.get(req.params.recId);
  try {
    if (!rec || rec.classId !== req.params.liveClassId || rec.userId !== String(req.user._id))
      return res.status(404).json({ success: false, message: 'Unknown recording.' });
    activeRecordings.delete(req.params.recId);
    if (rec.bytes === 0) { fs.unlinkSync(rec.path); return res.json({ success: true, data: { discarded: true } }); }

    const key = `recordings/${rec.classId}/${req.params.recId}.webm`;
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: fs.createReadStream(rec.path),
      ContentType: 'video/webm',
      ContentLength: rec.bytes,
    }));
    fs.unlink(rec.path, () => {});

    const url = `${process.env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
    const LiveClass = require('../models/LiveClass');
    await LiveClass.updateOne(
      { _id: rec.classId },
      { $push: { recordings: {
        url, sizeBytes: rec.bytes,
        durationSec: Math.round((Date.now() - rec.startedAt) / 1000),
        recordedAt: new Date(rec.startedAt),
      } } }
    );
    res.json({ success: true, data: { url } });
  } catch (e) {
    console.error('[recording finish]', e.message);
    if (rec) fs.unlink(rec.path, () => {});
    res.status(500).json({ success: false, message: 'Could not save the recording.' });
  }
});

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
