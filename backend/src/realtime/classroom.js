/**
 * realtime/classroom.js — Smartious Classroom signaling server.
 *
 * The media itself NEVER touches this server: browsers connect to each
 * other directly with WebRTC (P2P mesh). This module only relays the
 * small text messages peers need to find each other (SDP offers,
 * answers, ICE candidates), plus the classroom collaboration layer:
 * presence, synced whiteboard operations, chat, and raise-hand.
 *
 * Rooms are keyed by LiveClass._id, so the native classroom rides the
 * exact same scheduling, assignment, and (later) attendance rails as
 * the meetingLink flow it runs alongside during the pilot.
 *
 * Access control on join:
 *   - teacher of the class, any admin/dos/ops_manager, or a student in
 *     assignedStudents. Everyone else is refused.
 *
 * Room state is held in memory (fine for the pilot; a Render restart
 *  simply means everyone rejoins). Board ops are capped so a very long
 * lesson cannot grow memory without bound.
 */
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const BOARD_OP_CAP = 8000;   // ~a full lesson of drawing
const CHAT_CAP = 300;

// roomId -> { peers: Map<socketId, peerInfo>, boardOps: [], chat: [], startedAt }
const rooms = new Map();

const roomOf = (liveClassId) => 'class:' + liveClassId;

// ── Attendance recording (fire-and-forget, never blocks the class) ──
async function recordJoin(liveClassId, peer) {
  try {
    const ClassroomSession = require('../models/ClassroomSession');
    await ClassroomSession.updateOne(
      { liveClassId, userId: peer.userId },
      {
        $setOnInsert: { firstJoinedAt: new Date(), name: peer.name, role: peer.role },
        $inc: { joinCount: 1 },
      },
      { upsert: true }
    );
  } catch (e) { console.error('[classroom attendance join]', e.message); }
}

async function recordLeave(liveClassId, peer) {
  try {
    if (!peer.activeSince) return;
    const ClassroomSession = require('../models/ClassroomSession');
    const now = new Date();
    const ms = Math.max(0, now - peer.activeSince);
    await ClassroomSession.updateOne(
      { liveClassId, userId: peer.userId },
      { $inc: { durationMs: ms }, $set: { lastLeftAt: now } }
    );

    // Roll a meaningful attendance (5+ minutes connected) into the
    // daily register — but NEVER overwrite an existing record, so a
    // teacher's manual mark always wins.
    if (peer.role !== 'student') return;
    const session = await ClassroomSession.findOne({ liveClassId, userId: peer.userId })
      .select('durationMs firstJoinedAt').lean();
    if (!session || session.durationMs < 5 * 60 * 1000) return;

    const LiveClass = require('../models/LiveClass');
    const lc = await LiveClass.findById(liveClassId)
      .select('scheduledAt teacherId curriculum').lean();
    if (!lc) return;

    const day = new Date(session.firstJoinedAt);
    day.setUTCHours(0, 0, 0, 0);
    const lateByMs = session.firstJoinedAt - new Date(lc.scheduledAt);
    const status = lateByMs > 10 * 60 * 1000 ? 'late' : 'present';

    const Attendance = require('../models/Attendance');
    const existing = await Attendance.findOne({ studentId: peer.userId, date: day }).lean();
    if (existing) return;
    await Attendance.create({
      studentId: peer.userId,
      date: day,
      status,
      lateTime: status === 'late' ? Math.round(lateByMs / 60000) + ' min' : '',
      markedBy: lc.teacherId,
      curriculum: lc.curriculum || '',
      reason: '',
    });
  } catch (e) {
    // Duplicate-key races (two classes same day) are expected and fine.
    if (e.code !== 11000) console.error('[classroom attendance leave]', e.message);
  }
}

function publicRoster(room) {
  return [...room.peers.values()].map(p => ({
    socketId: p.socketId,
    userId: p.userId,
    name: p.name,
    role: p.role,
    hand: !!p.hand,
    micOn: p.micOn !== false,
    camOn: p.camOn !== false,
  }));  // activeSince is intentionally excluded
}

/** Snapshot used by the REST status endpoint. */
function roomStatus(liveClassId) {
  const room = rooms.get(roomOf(liveClassId));
  if (!room) return { live: false, participants: 0, teacherPresent: false };
  const roster = publicRoster(room);
  return {
    live: roster.length > 0,
    participants: roster.length,
    teacherPresent: roster.some(p => p.role === 'teacher' || p.role === 'admin'),
    startedAt: room.startedAt || null,
  };
}

function attachClassroom(httpServer, allowedOrigins) {
  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
    // Signaling messages are tiny; keep the default payload limits.
  });

  const nsp = io.of('/classroom');

  // ── Handshake auth: same JWT the REST API uses ─────────────
  nsp.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error('No token.'));
      const decoded = jwt.verify(token, JWT_SECRET);
      const User = require('../models/User');
      const user = await User.findById(decoded.id)
        .select('firstName lastName role isActive').lean();
      if (!user || !user.isActive) return next(new Error('Invalid token.'));
      socket.data.user = {
        id: String(user._id),
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User',
        role: user.role,
      };
      next();
    } catch (e) {
      next(new Error('Auth failed.'));
    }
  });

  nsp.on('connection', (socket) => {
    const me = socket.data.user;

    // ── join { liveClassId } ─────────────────────────────────
    socket.on('join', async ({ liveClassId } = {}, ack) => {
      try {
        if (!liveClassId) return ack && ack({ ok: false, message: 'liveClassId required.' });

        const LiveClass = require('../models/LiveClass');
        const lc = await LiveClass.findById(liveClassId)
          .select('title subject teacherId assignedStudents status').lean();
        if (!lc) return ack && ack({ ok: false, message: 'Class not found.' });

        const isTeacher = String(lc.teacherId) === me.id;
        const isStaff = ['admin', 'dos', 'ops_manager'].includes(me.role);
        const isAssigned = (lc.assignedStudents || []).some(s => String(s) === me.id);
        if (!isTeacher && !isStaff && !isAssigned)
          return ack && ack({ ok: false, message: 'You are not assigned to this class.' });

        const rid = roomOf(liveClassId);
        let room = rooms.get(rid);
        if (!room) {
          room = { peers: new Map(), boardOps: [], chat: [], startedAt: new Date() };
          rooms.set(rid, room);
        }

        socket.data.roomId = rid;
        socket.data.liveClassId = String(liveClassId);
        const peerInfo = {
          socketId: socket.id, userId: me.id, name: me.name,
          role: isTeacher ? 'teacher' : me.role, hand: false, micOn: true, camOn: true,
          activeSince: new Date(),
        };
        room.peers.set(socket.id, peerInfo);
        socket.join(rid);
        recordJoin(socket.data.liveClassId, peerInfo);

        // Existing peers initiate offers TOWARD the newcomer (impolite
        // side); the newcomer answers. One initiator per pair avoids glare.
        socket.to(rid).emit('peer:joined', room.peers.get(socket.id));

        ack && ack({
          ok: true,
          self: { socketId: socket.id, role: room.peers.get(socket.id).role },
          classInfo: { title: lc.title, subject: lc.subject },
          roster: publicRoster(room),
          boardOps: room.boardOps,
          chat: room.chat.slice(-100),
        });
      } catch (e) {
        console.error('[classroom join]', e.message);
        ack && ack({ ok: false, message: 'Join failed.' });
      }
    });

    // ── WebRTC signaling relay (targeted, never broadcast) ───
    // payload: { to: socketId, description? , candidate? }
    socket.on('signal', (payload = {}) => {
      if (!payload.to || !socket.data.roomId) return;
      nsp.to(payload.to).emit('signal', {
        from: socket.id,
        description: payload.description,
        candidate: payload.candidate,
      });
    });

    // ── Whiteboard ops ───────────────────────────────────────
    // op: { kind:'stroke'|'shape'|'text'|'sticky', ...worldCoords }
    socket.on('board:op', (op) => {
      const room = rooms.get(socket.data.roomId);
      if (!room || !op) return;
      const peer = room.peers.get(socket.id);
      if (!peer) return;
      // Students draw only when a teacher has not locked the board;
      // the lock itself is a board op so late joiners replay it.
      op.by = peer.userId;
      room.boardOps.push(op);
      if (room.boardOps.length > BOARD_OP_CAP)
        room.boardOps.splice(0, room.boardOps.length - BOARD_OP_CAP);
      socket.to(socket.data.roomId).emit('board:op', op);
    });

    socket.on('board:clear', () => {
      const room = rooms.get(socket.data.roomId);
      if (!room) return;
      const peer = room.peers.get(socket.id);
      if (!peer || (peer.role !== 'teacher' && peer.role !== 'admin')) return;
      room.boardOps = [];
      nsp.to(socket.data.roomId).emit('board:clear');
    });

    // ── Chat ─────────────────────────────────────────────────
    socket.on('chat:msg', (text) => {
      const room = rooms.get(socket.data.roomId);
      if (!room || typeof text !== 'string') return;
      const peer = room.peers.get(socket.id);
      if (!peer) return;
      const msg = {
        name: peer.name, role: peer.role, userId: peer.userId,
        text: text.slice(0, 1000), at: Date.now(),
      };
      room.chat.push(msg);
      if (room.chat.length > CHAT_CAP) room.chat.splice(0, room.chat.length - CHAT_CAP);
      nsp.to(socket.data.roomId).emit('chat:msg', msg);
    });

    // ── Presence state: hand, mic, cam ───────────────────────
    socket.on('state', (patch = {}) => {
      const room = rooms.get(socket.data.roomId);
      if (!room) return;
      const peer = room.peers.get(socket.id);
      if (!peer) return;
      if (typeof patch.hand === 'boolean') peer.hand = patch.hand;
      if (typeof patch.micOn === 'boolean') peer.micOn = patch.micOn;
      if (typeof patch.camOn === 'boolean') peer.camOn = patch.camOn;
      nsp.to(socket.data.roomId).emit('peer:state', {
        socketId: socket.id, hand: peer.hand, micOn: peer.micOn, camOn: peer.camOn,
      });
    });

    // ── Leave / disconnect ───────────────────────────────────
    const leave = () => {
      const rid = socket.data.roomId;
      if (!rid) return;
      const room = rooms.get(rid);
      if (room) {
        const peer = room.peers.get(socket.id);
        if (peer) recordLeave(socket.data.liveClassId, peer);
        room.peers.delete(socket.id);
        socket.to(rid).emit('peer:left', { socketId: socket.id });
        if (room.peers.size === 0) rooms.delete(rid);  // free board + chat
      }
      socket.leave(rid);
      socket.data.roomId = null;
    };
    socket.on('leave', leave);
    socket.on('disconnect', leave);
  });

  console.log('[classroom] Signaling attached at /classroom namespace');
  return io;
}

module.exports = { attachClassroom, roomStatus };
