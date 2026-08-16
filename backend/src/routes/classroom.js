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

router.get('/:liveClassId/status', auth, (req, res) => {
  if (!mongoose.isValidObjectId(req.params.liveClassId))
    return res.status(400).json({ success: false, message: 'Invalid id.' });
  res.json({ success: true, data: roomStatus(req.params.liveClassId) });
});

module.exports = router;
