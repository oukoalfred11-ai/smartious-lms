/**
 * livekit.js — SFU upgrade, phase 1: room token service.
 *
 * The mesh classroom tops out at roughly 4 to 6 cameras because every
 * participant uploads their video once per peer. An SFU (selective
 * forwarding unit) removes that ceiling: each participant uploads once
 * and the server forwards. This service issues LiveKit access tokens so
 * the classroom can run on LiveKit Cloud (or a self-hosted LiveKit server
 * later, same SDK, no code change).
 *
 * Feature-flagged: the endpoint only activates when LIVEKIT_URL,
 * LIVEKIT_API_KEY and LIVEKIT_API_SECRET are set in the environment, and
 * GET /api/livekit/config tells the frontend whether to use the SFU
 * engine or fall back to mesh. Nothing breaks if the flag is off.
 */
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const LiveClass = require('../models/LiveClass');
const Club = require('../models/Club');

const READY = !!(process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET);
const STAFF = ['teacher', 'admin', 'ops_manager', 'dos'];

// GET /api/livekit/config — which classroom engine should the client use?
router.get('/config', auth, (req, res) => {
  res.json({ success: true, data: { engine: READY ? 'sfu' : 'mesh', url: READY ? process.env.LIVEKIT_URL : null } });
});

// POST /api/livekit/token/:classId — a join token for one class room.
router.post('/token/:classId', auth, async (req, res) => {
  try {
    if (!READY) return res.status(503).json({ success: false, message: 'SFU is not configured; the classroom runs on the built-in engine.' });
    const cls = await LiveClass.findById(req.params.classId).select('teacherId assignedStudents clubId status').lean();
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found.' });

    // Who may join: staff, the assigned students, and (for club sessions)
    // the club's members and leaders. Same rule the mesh room enforces.
    let allowed = STAFF.includes(req.user.role) ||
      (cls.assignedStudents || []).some((x) => String(x) === String(req.user._id));
    if (!allowed && cls.clubId) {
      const club = await Club.findById(cls.clubId).select('members leaders').lean();
      allowed = !!club && [...(club.members || []), ...(club.leaders || [])]
        .some((x) => String(x) === String(req.user._id));
    }
    if (!allowed) return res.status(403).json({ success: false, message: 'You are not part of this class.' });

    const { AccessToken } = require('livekit-server-sdk');
    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: String(req.user._id),
      name: [req.user.firstName, req.user.lastName].filter(Boolean).join(' ') || 'Member',
      metadata: JSON.stringify({ role: req.user.role }),
      ttl: '2h',
    });
    at.addGrant({
      room: 'class-' + String(cls._id),
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });
    res.json({ success: true, data: { url: process.env.LIVEKIT_URL, token: await at.toJwt(), room: 'class-' + String(cls._id) } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
