/**
 * communityChat.js — the school-wide live chat. One room, every
 * student in automatically, channels inside, chat pace, full
 * safety skeleton: contact-info filter before storage, reports
 * with auto-hide at three, moderation with kept records.
 * Announcements channel is staff-post-only. No DMs exist.
 */
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const CommunityMessage = require('../models/CommunityMessage');
const User = require('../models/User');

const CAN_POST = ['student', 'teacher', 'admin', 'dos', 'ops_manager'];
const CAN_MODERATE = ['teacher', 'admin', 'dos', 'ops_manager'];
const STAFF = ['teacher', 'admin', 'dos', 'ops_manager'];
const EMOJIS = ['\ud83d\udc4d', '\u2764\ufe0f', '\ud83c\udf89', '\ud83d\ude4c'];
const CHANNELS = ['general', 'announcements', 'questions', 'resources', 'wins'];

const asPoster = (req, res, next) => CAN_POST.includes(req.user?.role) ? next()
  : res.status(403).json({ success: false, message: 'Not allowed.' });
const asModerator = (req, res, next) => CAN_MODERATE.includes(req.user?.role) ? next()
  : res.status(403).json({ success: false, message: 'Moderators only.' });

// Same defence as the feed: block the patterns used to move a
// conversation off-platform, before anything is stored.
const CONTACT_PATTERNS = [
  { re: /[\+]?\d[\d\s\-().]{7,}\d/g,                          why: 'phone numbers' },
  { re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,            why: 'email addresses' },
  { re: /(https?:\/\/|www\.)\S+/gi,                            why: 'links' },
  { re: /\b(wa\.me|t\.me|bit\.ly|tinyurl|discord\.gg)\b/gi,    why: 'links' },
  { re: /\b(whatsapp|telegram|snapchat|instagram|tiktok|signal app|wechat)\b/gi, why: 'social media contact' },
  { re: /\b(dm me|text me|call me|inbox me|add me on)\b/gi,    why: 'requests for private contact' },
];
const contactViolation = (text) => {
  const t = String(text || '');
  for (const p of CONTACT_PATTERNS) { p.re.lastIndex = 0; if (p.re.test(t)) return p.why; }
  return null;
};

// Chat pace: quick enough for real conversation, boring for spam.
const lastMsgs = new Map();
const paceOk = (userId) => {
  const now = Date.now();
  const arr = (lastMsgs.get(String(userId)) || []).filter(t => now - t < 10 * 60 * 1000);
  if (arr.length >= 30) return false;                       // 30 per 10 min
  if (arr.length && now - arr[arr.length - 1] < 3000) return false;   // 3s gap
  arr.push(now); lastMsgs.set(String(userId), arr);
  return true;
};

const AUTHOR = 'firstName lastName role gradeLevel avatar';
const shape = (m, uid) => ({
  _id: m._id, channel: m.channel, body: m.body, author: m.author,
  replyToAuthor: m.replyToAuthor, replyToExcerpt: m.replyToExcerpt,
  pinned: !!m.pinned, system: !!m.system, createdAt: m.createdAt, status: m.status,
  reactions: EMOJIS.map(e => {
    const r = (m.reactions || []).find(x => x.emoji === e);
    return { emoji: e, count: r ? r.users.length : 0,
      mine: r ? r.users.some(id => String(id) === String(uid)) : false };
  }).filter(r => r.count > 0 || false),
  openReportCount: (m.reports || []).filter(r => !r.resolved).length,
});

// ── Read the room ─────────────────────────────────────────
router.get('/messages', auth, async (req, res) => {
  try {
    const q = { status: 'live' };
    if (req.query.channel && CHANNELS.includes(req.query.channel)) q.channel = req.query.channel;
    if (req.query.before) q.createdAt = { $lt: new Date(req.query.before) };
    const rows = await CommunityMessage.find(q)
      .sort({ createdAt: -1 }).limit(60).populate('author', AUTHOR);
    const pinned = await CommunityMessage.findOne({ status: 'live', pinned: true })
      .sort({ createdAt: -1 }).populate('author', AUTHOR);
    const memberCount = await User.countDocuments({ role: { $in: ['student', 'teacher'] }, isActive: { $ne: false } });
    return res.json({ success: true, data: {
      messages: rows.reverse().map(m => shape(m, req.user._id)),
      pinned: pinned ? shape(pinned, req.user._id) : null,
      memberCount,
    }});
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── Say something ─────────────────────────────────────────
router.post('/messages', auth, asPoster, async (req, res) => {
  try {
    const { body = '', channel = 'general', replyTo = null } = req.body || {};
    const text = String(body).trim();
    if (!text) return res.status(400).json({ success: false, message: 'Write something first.' });
    if (text.length > 800) return res.status(400).json({ success: false, message: 'Messages are limited to 800 characters.' });
    const ch = CHANNELS.includes(channel) ? channel : 'general';
    if (ch === 'announcements' && !STAFF.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only teachers and staff post announcements. Try General or Questions.' });
    }
    const why = contactViolation(text);
    if (why) return res.status(422).json({ success: false, message: 'To keep everyone safe, messages cannot contain ' + why + '. Please reword and send again.' });
    if (!paceOk(req.user._id)) return res.status(429).json({ success: false, message: 'Slow down a little. Give the room three seconds between messages.' });

    let replyToAuthor = '', replyToExcerpt = '', replyId = null;
    if (replyTo) {
      const parent = await CommunityMessage.findById(replyTo).populate('author', 'firstName lastName');
      if (parent && parent.status === 'live') {
        replyId = parent._id;
        replyToAuthor = parent.author ? `${parent.author.firstName || ''} ${parent.author.lastName || ''}`.trim() : 'Student';
        replyToExcerpt = String(parent.body).slice(0, 140);
      }
    }
    const doc = await CommunityMessage.create({
      author: req.user._id, channel: ch, body: text,
      replyTo: replyId, replyToAuthor, replyToExcerpt,
    });
    const full = await CommunityMessage.findById(doc._id).populate('author', AUTHOR);
    return res.json({ success: true, data: { message: shape(full, req.user._id) } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── React ─────────────────────────────────────────────────
router.post('/messages/:id/react', auth, asPoster, async (req, res) => {
  try {
    const emoji = req.body?.emoji;
    if (!EMOJIS.includes(emoji)) return res.status(400).json({ success: false, message: 'Unknown reaction.' });
    const m = await CommunityMessage.findById(req.params.id);
    if (!m || m.status !== 'live') return res.status(404).json({ success: false, message: 'Message not found.' });
    const me = String(req.user._id);
    let r = m.reactions.find(x => x.emoji === emoji);
    if (!r) { m.reactions.push({ emoji, users: [req.user._id] }); }
    else {
      const i = r.users.findIndex(id => String(id) === me);
      if (i >= 0) r.users.splice(i, 1); else r.users.push(req.user._id);
    }
    await m.save();
    return res.json({ success: true, data: { message: shape(m, req.user._id) } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── Report ────────────────────────────────────────────────
router.post('/messages/:id/report', auth, async (req, res) => {
  try {
    const m = await CommunityMessage.findById(req.params.id);
    if (!m) return res.status(404).json({ success: false, message: 'Message not found.' });
    const me = String(req.user._id);
    if (!m.reports.some(r => !r.resolved && String(r.by) === me)) {
      m.reports.push({ by: req.user._id, reason: String(req.body?.reason || '').slice(0, 300) });
      if (m.reports.filter(r => !r.resolved).length >= 3 && m.status === 'live') m.status = 'pending_review';
      await m.save();
      console.log('[chat] message ' + m._id + ' reported' + (m.status === 'pending_review' ? ' — AUTO-HIDDEN' : ''));
    }
    return res.json({ success: true, data: { message: 'Thank you. A moderator will review it.' } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── Moderation ────────────────────────────────────────────
router.get('/moderation/queue', auth, asModerator, async (req, res) => {
  try {
    const flagged = await CommunityMessage.find({
      $or: [{ status: 'pending_review' }, { reports: { $elemMatch: { resolved: false } } }],
    }).sort({ updatedAt: -1 }).limit(100)
      .populate('author', AUTHOR).populate('reports.by', 'firstName lastName role');
    const removed = await CommunityMessage.find({ status: 'removed' })
      .sort({ updatedAt: -1 }).limit(30).populate('author', AUTHOR);
    return res.json({ success: true, data: {
      queue: flagged.map(m => ({ ...shape(m, req.user._id),
        reports: m.reports.filter(r => !r.resolved).map(r => ({ by: r.by, reason: r.reason, at: r.createdAt })) })),
      removed: removed.map(m => shape(m, req.user._id)),
    }});
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.post('/messages/:id/moderate', auth, asModerator, async (req, res) => {
  try {
    const { action, reason = '' } = req.body || {};
    const m = await CommunityMessage.findById(req.params.id);
    if (!m) return res.status(404).json({ success: false, message: 'Message not found.' });
    if (action === 'remove') {
      m.status = 'removed'; m.removedBy = req.user._id;
      m.removedReason = String(reason).slice(0, 300);
      m.reports.forEach(r => { r.resolved = true; });
    } else if (action === 'restore') { m.status = 'live'; m.reports.forEach(r => { r.resolved = true; }); }
    else if (action === 'dismiss_reports') { m.reports.forEach(r => { r.resolved = true; }); if (m.status === 'pending_review') m.status = 'live'; }
    else if (action === 'pin') { await CommunityMessage.updateMany({ pinned: true }, { pinned: false }); m.pinned = true; }
    else if (action === 'unpin') { m.pinned = false; }
    else return res.status(400).json({ success: false, message: 'Unknown action.' });
    await m.save();
    console.log('[chat] ' + req.user.role + ' -> ' + action + ' on message ' + m._id);
    return res.json({ success: true });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
