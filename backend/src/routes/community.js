/**
 * community.js — the school-wide community: one public feed,
 * monitored and moderated, bringing Smartious students together
 * across every country the school serves.
 *
 * Safety architecture (in order of defence):
 *  1. CONTACT-INFO FILTER — phone numbers, emails, links and social
 *     handles are blocked BEFORE anything is stored. The single
 *     biggest online-safety rule for minors: conversations stay on
 *     the platform, in the light.
 *  2. RATE LIMIT — a student can post at a human pace, not a spam pace.
 *  3. REPORTS — every student can flag any post. Three unresolved
 *     reports auto-hide the post into the moderation queue.
 *  4. MODERATION QUEUE — teachers and admins see flagged content
 *     and act with one click. Removal keeps the record.
 *
 * There are no private messages and no closed rooms by design.
 */
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const CommunityPost = require('../models/CommunityPost');

// ── Who may do what ───────────────────────────────────────
const CAN_POST = ['student', 'teacher', 'admin', 'dos', 'ops_manager'];
const CAN_MODERATE = ['teacher', 'admin', 'dos', 'ops_manager'];

const asPoster = (req, res, next) => {
  if (CAN_POST.includes(req.user?.role)) return next();
  return res.status(403).json({ success: false, message: 'Not allowed.' });
};
const asModerator = (req, res, next) => {
  if (CAN_MODERATE.includes(req.user?.role)) return next();
  return res.status(403).json({ success: false, message: 'Moderators only.' });
};

// ── 1. The contact-info filter ────────────────────────────
// Blocks the patterns used to move a conversation off-platform.
// Errs on the side of blocking; a false positive costs a reword,
// a false negative costs far more.
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
  for (const p of CONTACT_PATTERNS) {
    p.re.lastIndex = 0;
    if (p.re.test(t)) return p.why;
  }
  return null;
};

// ── 2. Human-pace rate limit (in-memory, per instance) ────
const lastPosts = new Map();   // userId -> [timestamps]
const paceOk = (userId) => {
  const now = Date.now();
  const arr = (lastPosts.get(String(userId)) || []).filter(t => now - t < 10 * 60 * 1000);
  if (arr.length >= 8) return false;                      // 8 per 10 min
  if (arr.length && now - arr[arr.length - 1] < 20000) return false;  // 20s gap
  arr.push(now);
  lastPosts.set(String(userId), arr);
  return true;
};

const AUTHOR_FIELDS = 'firstName lastName role gradeLevel avatar';

const shape = (doc, userId) => {
  const p = doc.toObject ? doc.toObject({ virtuals: true }) : doc;
  return {
    _id: p._id, kind: p.kind, body: p.body, tags: p.tags || [],
    author: p.author, pinned: !!p.pinned, status: p.status,
    createdAt: p.createdAt,
    likeCount: (p.likes || []).length,
    liked: userId ? (p.likes || []).some(id => String(id) === String(userId)) : false,
    pollOptions: (p.pollOptions || []).map((o, i) => ({
      text: o.text, count: (o.votes || []).length,
      mine: userId ? (o.votes || []).some(id => String(id) === String(userId)) : false,
      index: i,
    })),
    comments: (p.comments || []).filter(c => c.status === 'live').map(c => ({
      _id: c._id, author: c.author, body: c.body, createdAt: c.createdAt,
    })),
    openReportCount: (p.reports || []).filter(r => !r.resolved).length,
  };
};

// ── The feed ──────────────────────────────────────────────
router.get('/posts', auth, async (req, res) => {
  try {
    const q = { status: 'live' };
    if (req.query.kind && ['question', 'tip', 'achievement', 'poll', 'post'].includes(req.query.kind)) q.kind = req.query.kind;
    if (req.query.before) q.createdAt = { $lt: new Date(req.query.before) };
    const posts = await CommunityPost.find(q)
      .sort({ pinned: -1, createdAt: -1 })
      .limit(20)
      .populate('author', AUTHOR_FIELDS)
      .populate('comments.author', AUTHOR_FIELDS);
    return res.json({ success: true, data: { posts: posts.map(p => shape(p, req.user._id)) } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── Create a post ─────────────────────────────────────────
router.post('/posts', auth, asPoster, async (req, res) => {
  try {
    const { kind = 'post', body = '', tags = [], pollOptions = [] } = req.body || {};
    const text = String(body).trim();
    if (!text) return res.status(400).json({ success: false, message: 'Write something first.' });
    if (text.length > 2000) return res.status(400).json({ success: false, message: 'Posts are limited to 2000 characters.' });

    const why = contactViolation(text) || contactViolation((tags || []).join(' ')) ||
      contactViolation((pollOptions || []).map(o => o?.text || o).join(' '));
    if (why) return res.status(422).json({ success: false, message: 'To keep everyone safe, posts cannot contain ' + why + '. Please reword and post again.' });

    if (!paceOk(req.user._id)) return res.status(429).json({ success: false, message: 'You are posting very fast. Take a short breath and try again.' });

    const doc = await CommunityPost.create({
      author: req.user._id,
      kind: ['post', 'question', 'tip', 'achievement', 'poll'].includes(kind) ? kind : 'post',
      body: text,
      tags: (Array.isArray(tags) ? tags : []).slice(0, 5).map(t => String(t).trim()).filter(Boolean),
      pollOptions: kind === 'poll'
        ? (Array.isArray(pollOptions) ? pollOptions : []).slice(0, 5)
            .map(o => ({ text: String(o?.text || o).trim().slice(0, 120), votes: [] }))
            .filter(o => o.text)
        : [],
    });
    const full = await CommunityPost.findById(doc._id).populate('author', AUTHOR_FIELDS);
    return res.json({ success: true, data: { post: shape(full, req.user._id) } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── Like / unlike ─────────────────────────────────────────
router.post('/posts/:id/like', auth, asPoster, async (req, res) => {
  try {
    const p = await CommunityPost.findById(req.params.id);
    if (!p || p.status !== 'live') return res.status(404).json({ success: false, message: 'Post not found.' });
    const me = String(req.user._id);
    const i = p.likes.findIndex(id => String(id) === me);
    if (i >= 0) p.likes.splice(i, 1); else p.likes.push(req.user._id);
    await p.save();
    return res.json({ success: true, data: { likeCount: p.likes.length, liked: i < 0 } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── Vote in a poll (one vote, switchable) ─────────────────
router.post('/posts/:id/vote', auth, asPoster, async (req, res) => {
  try {
    const idx = parseInt(req.body?.optionIndex, 10);
    const p = await CommunityPost.findById(req.params.id);
    if (!p || p.status !== 'live' || p.kind !== 'poll') return res.status(404).json({ success: false, message: 'Poll not found.' });
    if (!(idx >= 0 && idx < p.pollOptions.length)) return res.status(400).json({ success: false, message: 'Pick an option.' });
    const me = String(req.user._id);
    p.pollOptions.forEach(o => { o.votes = o.votes.filter(id => String(id) !== me); });
    p.pollOptions[idx].votes.push(req.user._id);
    await p.save();
    return res.json({ success: true, data: { pollOptions: p.pollOptions.map((o, i) => ({ text: o.text, count: o.votes.length, mine: i === idx, index: i })) } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── Comment ───────────────────────────────────────────────
router.post('/posts/:id/comments', auth, asPoster, async (req, res) => {
  try {
    const text = String(req.body?.body || '').trim();
    if (!text) return res.status(400).json({ success: false, message: 'Write something first.' });
    if (text.length > 600) return res.status(400).json({ success: false, message: 'Comments are limited to 600 characters.' });
    const why = contactViolation(text);
    if (why) return res.status(422).json({ success: false, message: 'To keep everyone safe, comments cannot contain ' + why + '. Please reword.' });
    if (!paceOk(req.user._id)) return res.status(429).json({ success: false, message: 'You are posting very fast. Take a short breath and try again.' });

    const p = await CommunityPost.findById(req.params.id);
    if (!p || p.status !== 'live') return res.status(404).json({ success: false, message: 'Post not found.' });
    p.comments.push({ author: req.user._id, body: text });
    await p.save();
    const full = await CommunityPost.findById(p._id).populate('comments.author', AUTHOR_FIELDS);
    const c = full.comments[full.comments.length - 1];
    return res.json({ success: true, data: { comment: { _id: c._id, author: c.author, body: c.body, createdAt: c.createdAt } } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── Report a post ─────────────────────────────────────────
router.post('/posts/:id/report', auth, async (req, res) => {
  try {
    const p = await CommunityPost.findById(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Post not found.' });
    const me = String(req.user._id);
    if (p.reports.some(r => !r.resolved && String(r.by) === me)) {
      return res.json({ success: true, data: { message: 'Already reported. A moderator will review it.' } });
    }
    p.reports.push({ by: req.user._id, reason: String(req.body?.reason || '').slice(0, 300) });
    const open = p.reports.filter(r => !r.resolved).length;
    // Three independent reports hide the post until a human looks.
    if (open >= 3 && p.status === 'live') p.status = 'pending_review';
    await p.save();
    console.log('[community] post ' + p._id + ' reported (' + open + ' open)' + (p.status === 'pending_review' ? ' — AUTO-HIDDEN for review' : ''));
    return res.json({ success: true, data: { message: 'Thank you. A moderator will review this post.' } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── Moderation queue ──────────────────────────────────────
router.get('/moderation/queue', auth, asModerator, async (req, res) => {
  try {
    const flagged = await CommunityPost.find({
      $or: [{ status: 'pending_review' }, { reports: { $elemMatch: { resolved: false } } }],
    }).sort({ updatedAt: -1 }).limit(100)
      .populate('author', AUTHOR_FIELDS)
      .populate('reports.by', 'firstName lastName role');
    const recentRemoved = await CommunityPost.find({ status: 'removed' })
      .sort({ updatedAt: -1 }).limit(20).populate('author', AUTHOR_FIELDS);
    return res.json({ success: true, data: {
      queue: flagged.map(p => ({
        ...shape(p, req.user._id), body: p.body,
        reports: p.reports.filter(r => !r.resolved).map(r => ({ by: r.by, reason: r.reason, at: r.createdAt })),
      })),
      recentRemoved: recentRemoved.map(p => shape(p, req.user._id)),
    }});
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── Moderate a post ───────────────────────────────────────
router.post('/posts/:id/moderate', auth, asModerator, async (req, res) => {
  try {
    const { action, reason = '' } = req.body || {};
    const p = await CommunityPost.findById(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Post not found.' });

    if (action === 'remove') {
      p.status = 'removed';
      p.removedBy = req.user._id;
      p.removedReason = String(reason).slice(0, 300);
      p.reports.forEach(r => { r.resolved = true; });
    } else if (action === 'restore') {
      p.status = 'live';
      p.reports.forEach(r => { r.resolved = true; });
    } else if (action === 'dismiss_reports') {
      p.reports.forEach(r => { r.resolved = true; });
      if (p.status === 'pending_review') p.status = 'live';
    } else if (action === 'pin') { p.pinned = true; }
    else if (action === 'unpin') { p.pinned = false; }
    else return res.status(400).json({ success: false, message: 'Unknown action.' });

    await p.save();
    console.log('[community] ' + req.user.role + ' ' + req.user._id + ' -> ' + action + ' on post ' + p._id);
    return res.json({ success: true, data: { status: p.status, pinned: p.pinned } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── Moderate a comment ────────────────────────────────────
router.post('/posts/:id/comments/:cid/moderate', auth, asModerator, async (req, res) => {
  try {
    const p = await CommunityPost.findById(req.params.id);
    const c = p && p.comments.id(req.params.cid);
    if (!c) return res.status(404).json({ success: false, message: 'Comment not found.' });
    c.status = 'removed';
    c.removedBy = req.user._id;
    c.removedReason = String(req.body?.reason || '').slice(0, 300);
    await p.save();
    return res.json({ success: true });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
