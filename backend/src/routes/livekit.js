/**
 * livekit.js — SFU room token service, phase 1.1.
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
 *
 * v1.1 — SESSION-UNIQUE IDENTITIES. LiveKit allows exactly one live
 * connection per identity: a second join with the same identity makes
 * the server kick the first (client log: "leave request, reason: 2",
 * DUPLICATE_IDENTITY). With identity = raw userId, a second tab, a
 * phone joining beside a laptop, or a reconnect racing its own dying
 * predecessor silently executed the earlier session — participants
 * were in the room but their media was dead: "joined but can't hear".
 * Identity is now userId + '#' + a per-session suffix, so concurrent
 * sessions coexist and stale ones just time out. The real userId
 * travels in metadata (and as the identity prefix); anything that
 * needs to target a USER resolves live identities first, as /stage
 * does below.
 */
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const LiveClass = require('../models/LiveClass');
const Club = require('../models/Club');

const READY = !!(process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET);
const STAFF = ['teacher', 'admin', 'ops_manager', 'dos'];

// The userId behind an identity, whether suffixed or legacy.
const userOf = (identity) => String(identity || '').split('#')[0];

// GET /api/livekit/config — which classroom engine should the client use?
router.get('/config', auth, (req, res) => {
  res.json({ success: true, data: { engine: READY ? 'sfu' : 'mesh', url: READY ? process.env.LIVEKIT_URL : null } });
});

// POST /api/livekit/token/:classId — a join token for one class room.
router.post('/token/:classId', auth, async (req, res) => {
  try {
    if (!READY) return res.status(503).json({ success: false, message: 'SFU is not configured; the classroom runs on the built-in engine.' });
    const cls = await LiveClass.findById(req.params.classId).select('teacherId assignedStudents clubId status kind').lean();
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found.' });

    // Who may join: staff, the assigned students, and (for club sessions)
    // the club's members and leaders. Same rule the mesh room enforces.
    const isAssembly = cls.kind === 'assembly';
    let allowed = isAssembly || STAFF.includes(req.user.role) ||
      (cls.assignedStudents || []).some((x) => String(x) === String(req.user._id));
    if (!allowed && cls.clubId) {
      const club = await Club.findById(cls.clubId).select('members leaders').lean();
      allowed = !!club && [...(club.members || []), ...(club.leaders || [])]
        .some((x) => String(x) === String(req.user._id));
    }
    if (!allowed) return res.status(403).json({ success: false, message: 'You are not part of this class.' });

    const { AccessToken } = require('livekit-server-sdk');
    // One identity per SESSION, not per user: a fresh suffix on every
    // token means a second device or a reconnect never collides with
    // (and never kills) an existing connection.
    const session = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const identity = String(req.user._id) + '#' + session;
    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity,
      name: [req.user.firstName, req.user.lastName].filter(Boolean).join(' ') || 'Member',
      metadata: JSON.stringify({ role: req.user.role, userId: String(req.user._id) }),
      ttl: '2h',
    });
    // Assemblies are stage-and-audience: staff publish, students join as
    // viewers and can be invited to speak live (see /stage below).
    const canPublish = isAssembly ? STAFF.includes(req.user.role) : true;
    at.addGrant({
      room: 'class-' + String(cls._id),
      roomJoin: true,
      canPublish,
      canSubscribe: true,
      canPublishData: true,
    });
    res.json({ success: true, data: { url: process.env.LIVEKIT_URL, token: await at.toJwt(), room: 'class-' + String(cls._id), identity, canPublish, kind: cls.kind || 'lesson' } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/livekit/stage/:classId — invite a participant to speak in an
// assembly, or take them off the stage. The client may send a userId or
// a full session identity; either way, EVERY live session of that user
// is updated, so the invitation lands on whichever device they are on.
router.post('/stage/:classId', auth, async (req, res) => {
  try {
    if (!READY) return res.status(503).json({ success: false, message: 'SFU is not configured.' });
    if (!STAFF.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Only staff manage the stage.' });
    const { userId, allow } = req.body || {};
    if (!userId) return res.status(400).json({ success: false, message: 'userId required.' });
    const { RoomServiceClient } = require('livekit-server-sdk');
    const host = process.env.LIVEKIT_URL.replace(/^wss:/, 'https:');
    const svc = new RoomServiceClient(host, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);
    const room = 'class-' + req.params.classId;

    // Resolve the user's live session identities in this room.
    const wanted = userOf(userId);
    const participants = await svc.listParticipants(room).catch(() => []);
    const targets = participants
      .map((p) => p.identity)
      .filter((id) => id === String(userId) || userOf(id) === wanted);
    if (!targets.length) return res.status(404).json({ success: false, message: 'That participant is not in the room right now.' });

    for (const identity of targets) {
      await svc.updateParticipant(room, identity, undefined, {
        canPublish: allow !== false,
        canSubscribe: true,
        canPublishData: true,
      });
    }
    res.json({ success: true, message: allow !== false ? 'Invited to the stage.' : 'Removed from the stage.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
