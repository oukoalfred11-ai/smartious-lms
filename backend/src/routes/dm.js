/**
 * dm.js - in app direct messaging.
 * Students write to their own teachers; teachers to their students
 * and those students' parents; parents to their children's subject
 * teachers; admin and the operations manager to anyone - and the
 * same two roles can view all conversations read only, because in a
 * school, conversations between adults and children are supervised
 * by design. Every message raises an in app notification (bell and
 * chime); nothing here sends email.
 *
 *   GET  /api/dm/contacts
 *   GET  /api/dm/conversations
 *   POST /api/dm/conversations                { recipientId, body }
 *   GET  /api/dm/conversations/:id/messages
 *   POST /api/dm/conversations/:id/messages   { body }
 *   GET  /api/dm/oversight/conversations          (staff)
 *   GET  /api/dm/oversight/conversations/:id/messages (staff)
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const TimetableEntry = require('../models/TimetableEntry');
const Conversation = require('../models/Conversation');
const DirectMessage = require('../models/DirectMessage');
const { notify } = require('../lib/notify');

const STAFF_ROLES = ['admin', 'ops_manager'];
const STAFF = requireRole(...STAFF_ROLES);
const nameOf = (u) => [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;

// ── Who am I allowed to message? Drawn from the timetable itself. ──
async function allowedContacts(me) {
  const meId = String(me._id);
  const out = new Map(); // userId -> { user, context }
  const put = (u, context) => {
    if (!u || String(u._id) === meId) return;
    const k = String(u._id);
    if (out.has(k)) {
      const prev = out.get(k);
      if (context && !prev.context.includes(context)) prev.context += ', ' + context;
    } else out.set(k, { user: u, context: context || '' });
  };

  if (me.role === 'student') {
    const entries = await TimetableEntry.find({ assignedStudents: me._id, isActive: true })
      .populate('teacherId', 'firstName lastName email role').lean();
    entries.forEach(e => put(e.teacherId, e.subject ? e.subject + ' teacher' : 'Teacher'));
  } else if (me.role === 'teacher') {
    const entries = await TimetableEntry.find({ teacherId: me._id, isActive: true }).lean();
    const ids = [...new Set(entries.flatMap(e => (e.assignedStudents || []).map(String)))];
    const students = await User.find({ _id: { $in: ids }, isActive: { $ne: false } })
      .select('firstName lastName email role parentId linkedParents').lean();
    const parentIds = new Set();
    students.forEach(s => {
      put(s, 'Student');
      if (s.parentId) parentIds.add(String(s.parentId));
      (s.linkedParents || []).forEach(p => parentIds.add(String(p)));
    });
    if (parentIds.size) {
      const parents = await User.find({ _id: { $in: [...parentIds] }, isActive: { $ne: false } })
        .select('firstName lastName email role linkedStudents').lean();
      const sName = Object.fromEntries(students.map(s => [String(s._id), nameOf(s)]));
      parents.forEach(p => {
        const kids = (p.linkedStudents || []).map(String).filter(id => sName[id]).map(id => sName[id].split(' ')[0]);
        put(p, kids.length ? 'Parent of ' + kids.join(', ') : 'Parent');
      });
    }
  } else if (me.role === 'parent') {
    const parent = await User.findById(me._id).select('linkedStudents').lean();
    const kids = await User.find({ _id: { $in: parent?.linkedStudents || [] } }).select('firstName').lean();
    for (const kid of kids) {
      const entries = await TimetableEntry.find({ assignedStudents: kid._id, isActive: true })
        .populate('teacherId', 'firstName lastName email role').lean();
      entries.forEach(e => put(e.teacherId, (kid.firstName || 'child') + "'s " + (e.subject || 'subject') + ' teacher'));
    }
  } else if (STAFF_ROLES.includes(me.role)) {
    const everyone = await User.find({ isActive: { $ne: false }, _id: { $ne: me._id } })
      .select('firstName lastName email role').limit(600).lean();
    everyone.forEach(u => put(u, u.role));
  }
  return [...out.values()].map(({ user, context }) => ({
    _id: user._id, name: nameOf(user), role: user.role, context,
  })).sort((a, b) => a.name.localeCompare(b.name));
}

async function canMessage(me, otherId) {
  if (STAFF_ROLES.includes(me.role)) return true;
  const contacts = await allowedContacts(me);
  return contacts.some(c => String(c._id) === String(otherId));
}

router.get('/contacts', auth, async (req, res) => {
  try { res.json({ success: true, data: { contacts: await allowedContacts(req.user) } }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── My conversations with unread counts ──
router.get('/conversations', auth, async (req, res) => {
  try {
    const convos = await Conversation.find({ participants: req.user._id })
      .sort({ lastMessageAt: -1 }).limit(60).lean();
    const ids = convos.map(c => c._id);
    const unreadAgg = await DirectMessage.aggregate([
      { $match: { conversationId: { $in: ids }, senderId: { $ne: req.user._id }, readBy: { $ne: req.user._id } } },
      { $group: { _id: '$conversationId', n: { $sum: 1 } } },
    ]);
    const unread = Object.fromEntries(unreadAgg.map(x => [String(x._id), x.n]));
    res.json({ success: true, data: { conversations: convos.map(c => ({
      ...c,
      other: (c.participantMeta || []).find(p => String(p.userId) !== String(req.user._id)) || {},
      unread: unread[String(c._id)] || 0,
    })) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Start (or continue) a conversation ──
router.post('/conversations', auth, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const body = String(req.body.body || '').trim().slice(0, 3000);
    if (!mongoose.isValidObjectId(recipientId) || !body)
      return res.status(400).json({ success: false, message: 'Recipient and message are required.' });
    if (!(await canMessage(req.user, recipientId)))
      return res.status(403).json({ success: false, message: 'You can only message your own teachers, students or the school.' });

    const other = await User.findById(recipientId).select('firstName lastName email role').lean();
    if (!other) return res.status(404).json({ success: false, message: 'Recipient not found.' });

    const pairKey = [String(req.user._id), String(recipientId)].sort().join(':');
    let convo = await Conversation.findOne({ pairKey });
    if (!convo) {
      convo = await Conversation.create({
        pairKey,
        participants: [req.user._id, other._id],
        participantMeta: [
          { userId: req.user._id, name: nameOf(req.user), role: req.user.role },
          { userId: other._id, name: nameOf(other), role: other.role },
        ],
      });
    }
    req.params.id = String(convo._id);
    req.body.body = body;
    return sendMessage(req, res, convo, other);
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

async function sendMessage(req, res, convo, otherUser) {
  const body = String(req.body.body || '').trim().slice(0, 3000);
  const msg = await DirectMessage.create({
    conversationId: convo._id,
    senderId: req.user._id,
    senderName: nameOf(req.user),
    body,
    readBy: [req.user._id],
  });
  convo.lastMessageAt = new Date();
  convo.lastMessageText = body.slice(0, 120);
  convo.messageCount = (convo.messageCount || 0) + 1;
  await convo.save();

  const other = otherUser || await (async () => {
    const meta = (convo.participantMeta || []).find(p => String(p.userId) !== String(req.user._id));
    return meta ? { _id: meta.userId } : null;
  })();
  if (other) notify(other._id, { title: 'Message from ' + nameOf(req.user), body: body.slice(0, 120), module: 'messages' }).catch(() => {});

  res.json({ success: true, data: { conversationId: convo._id, message: msg.toObject() } });
}

// ── Read a thread (marks my unread as read) ──
router.get('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id).lean();
    if (!convo) return res.status(404).json({ success: false, message: 'Conversation not found.' });
    if (!convo.participants.map(String).includes(String(req.user._id)))
      return res.status(403).json({ success: false, message: 'Not your conversation.' });
    const messages = await DirectMessage.find({ conversationId: convo._id }).sort({ at: 1 }).limit(200).lean();
    DirectMessage.updateMany(
      { conversationId: convo._id, senderId: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    ).catch(() => {});
    res.json({ success: true, data: { conversation: convo, messages } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Reply on a thread ──
router.post('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ success: false, message: 'Conversation not found.' });
    if (!convo.participants.map(String).includes(String(req.user._id)))
      return res.status(403).json({ success: false, message: 'Not your conversation.' });
    if (!String(req.body.body || '').trim())
      return res.status(400).json({ success: false, message: 'Message required.' });
    return sendMessage(req, res, convo, null);
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Oversight: read only, staff only ──
router.get('/oversight/conversations', auth, STAFF, async (req, res) => {
  try {
    const convos = await Conversation.find({}).sort({ lastMessageAt: -1 }).limit(200).lean();
    res.json({ success: true, data: { conversations: convos,
      method: 'Every direct conversation in the school, newest first, read only. Messaging between adults and children in a school is supervised by design; users are told the school can see conversations.' } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/oversight/conversations/:id/messages', auth, STAFF, async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id).lean();
    if (!convo) return res.status(404).json({ success: false, message: 'Conversation not found.' });
    const messages = await DirectMessage.find({ conversationId: convo._id }).sort({ at: 1 }).limit(300).lean();
    res.json({ success: true, data: { conversation: convo, messages } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
