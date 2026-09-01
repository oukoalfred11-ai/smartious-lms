/**
 * clubs.js — Smartious Clubs.
 *
 *   Students     browse clubs, join/leave, see meetings and the recordings
 *                archive (any student can rewatch any club's recordings,
 *                new members included).
 *   Leaders      teachers in charge of a club: schedule meetings, which are
 *                live classes (kind 'club') opened in the classroom's
 *                meeting view and auto-recorded.
 *   Admin        create/edit clubs, assign leaders, seed the starter set.
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth, requireRole } = require('../middleware/auth');
const Club = require('../models/Club');
const User = require('../models/User');
const LiveClass = require('../models/LiveClass');

const ADMIN = ['admin', 'ops_manager', 'dos'];
const slugify = (s) => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const oid = (v) => mongoose.Types.ObjectId.isValid(v);

const isLeaderOf = (club, userId) => (club.leaders || []).some(l => String(l._id || l) === String(userId));

const shapeClub = (c, userId) => ({
  _id: c._id, name: c.name, slug: c.slug, tagline: c.tagline, description: c.description,
  icon: c.icon, color: c.color, coverImage: c.coverImage, category: c.category,
  meetingSchedule: c.meetingSchedule, durationMins: c.durationMins, capacity: c.capacity,
  isActive: c.isActive, featured: c.featured, sortOrder: c.sortOrder,
  leaders: (c.leaders || []).map(l => l && l.firstName !== undefined
    ? { _id: l._id, name: [l.firstName, l.lastName].filter(Boolean).join(' '), avatar: l.avatar || '' }
    : { _id: l }),
  memberCount: (c.members || []).length,
  isMember: !!userId && (c.members || []).some(m => String(m._id || m) === String(userId)),
  isLeader: !!userId && isLeaderOf(c, userId),
});

// ── Browse ──────────────────────────────────────────────────────────
// GET /api/clubs            all active clubs (+ my membership flags)
router.get('/', auth, async (req, res) => {
  try {
    const all = req.query.all === 'true' && ADMIN.includes(req.user.role);
    const clubs = await Club.find(all ? {} : { isActive: true })
      .populate('leaders', 'firstName lastName avatar')
      .sort({ featured: -1, sortOrder: 1, name: 1 }).lean();
    res.json({ success: true, data: { clubs: clubs.map(c => shapeClub(c, req.user._id)) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/clubs/mine       clubs I belong to or lead
router.get('/mine', auth, async (req, res) => {
  try {
    const clubs = await Club.find({ isActive: true, $or: [{ members: req.user._id }, { leaders: req.user._id }] })
      .populate('leaders', 'firstName lastName avatar').sort({ name: 1 }).lean();
    res.json({ success: true, data: { clubs: clubs.map(c => shapeClub(c, req.user._id)) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/clubs/events     upcoming meetings/competitions across all clubs
router.get('/events', auth, async (req, res) => {
  try {
    const now = new Date();
    const rows = await LiveClass.find({ clubId: { $ne: null }, scheduledAt: { $gte: new Date(now - 2 * 3600 * 1000) }, status: { $ne: 'cancelled' } })
      .populate('clubId', 'name color icon').populate('teacherId', 'firstName lastName')
      .sort({ scheduledAt: 1 }).limit(30).lean();
    res.json({ success: true, data: { events: rows.map(r => ({
      _id: r._id, title: r.title, kind: r.kind, status: r.status, scheduledAt: r.scheduledAt, durationMins: r.durationMins,
      club: r.clubId ? { _id: r.clubId._id, name: r.clubId.name, color: r.clubId.color, icon: r.clubId.icon } : null,
      leader: r.teacherId ? [r.teacherId.firstName, r.teacherId.lastName].filter(Boolean).join(' ') : '',
    })) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/clubs/recordings   the archive: every recorded club session (all students may watch)
router.get('/recordings', auth, async (req, res) => {
  try {
    const filter = { clubId: { $ne: null }, 'recordings.0': { $exists: true } };
    if (req.query.club && oid(req.query.club)) filter.clubId = req.query.club;
    const rows = await LiveClass.find(filter)
      .populate('clubId', 'name color icon').populate('teacherId', 'firstName lastName')
      .sort({ scheduledAt: -1 }).limit(300).lean();
    const out = [];
    for (const r of rows) for (const rec of (r.recordings || [])) {
      out.push({
        recId: rec._id, liveClassId: r._id, url: rec.url, title: rec.title || r.title, kind: r.kind,
        durationSec: rec.durationSec || 0, recordedAt: rec.recordedAt || r.scheduledAt,
        club: r.clubId ? { _id: r.clubId._id, name: r.clubId.name, color: r.clubId.color, icon: r.clubId.icon } : null,
        leader: r.teacherId ? [r.teacherId.firstName, r.teacherId.lastName].filter(Boolean).join(' ') : '',
      });
    }
    res.json({ success: true, data: { recordings: out } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/clubs/:id        one club with members (members list for leaders/admin)
router.get('/:id', auth, async (req, res) => {
  try {
    if (!oid(req.params.id)) return res.status(400).json({ success: false, message: 'Bad id.' });
    const c = await Club.findById(req.params.id)
      .populate('leaders', 'firstName lastName avatar').populate('members', 'firstName lastName avatar gradeLevel').lean();
    if (!c) return res.status(404).json({ success: false, message: 'Club not found.' });
    const shaped = shapeClub(c, req.user._id);
    const canSeeMembers = ADMIN.includes(req.user.role) || shaped.isLeader || shaped.isMember;
    const now = new Date();
    const meetings = await LiveClass.find({ clubId: c._id, status: { $ne: 'cancelled' } })
      .sort({ scheduledAt: -1 }).limit(60).lean();
    res.json({ success: true, data: {
      club: shaped,
      members: canSeeMembers ? (c.members || []).map(m => ({ _id: m._id, name: [m.firstName, m.lastName].filter(Boolean).join(' '), avatar: m.avatar || '', gradeLevel: m.gradeLevel || '' })) : [],
      upcoming: meetings.filter(m => new Date(m.scheduledAt) >= new Date(now - 2 * 3600 * 1000) && m.status !== 'ended').reverse()
        .map(m => ({ _id: m._id, title: m.title, kind: m.kind, status: m.status, scheduledAt: m.scheduledAt, durationMins: m.durationMins })),
      past: meetings.filter(m => m.status === 'ended' || new Date(m.scheduledAt) < new Date(now - 2 * 3600 * 1000))
        .map(m => ({ _id: m._id, title: m.title, kind: m.kind, scheduledAt: m.scheduledAt, recordings: (m.recordings || []).map(r => ({ recId: r._id, url: r.url, durationSec: r.durationSec, recordedAt: r.recordedAt })) })),
    }});
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Membership ──────────────────────────────────────────────────────
router.post('/:id/join', auth, requireRole('student'), async (req, res) => {
  try {
    const c = await Club.findById(req.params.id);
    if (!c || !c.isActive) return res.status(404).json({ success: false, message: 'Club not found.' });
    if (c.capacity > 0 && c.members.length >= c.capacity && !c.members.some(m => String(m) === String(req.user._id)))
      return res.status(409).json({ success: false, message: 'This club is full right now.' });
    await Club.updateOne({ _id: c._id }, { $addToSet: { members: req.user._id } });
    // Let the student into any already-scheduled upcoming meeting too.
    await LiveClass.updateMany({ clubId: c._id, scheduledAt: { $gte: new Date() } }, { $addToSet: { assignedStudents: req.user._id } });
    res.json({ success: true, message: `Welcome to ${c.name}.` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
router.post('/:id/leave', auth, requireRole('student'), async (req, res) => {
  try {
    await Club.updateOne({ _id: req.params.id }, { $pull: { members: req.user._id } });
    await LiveClass.updateMany({ clubId: req.params.id, scheduledAt: { $gte: new Date() } }, { $pull: { assignedStudents: req.user._id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Meetings (leaders + admin) ──────────────────────────────────────
// POST /api/clubs/:id/meetings  { title, scheduledAt, durationMins, kind }
router.post('/:id/meetings', auth, requireRole('teacher', ...ADMIN), async (req, res) => {
  try {
    const c = await Club.findById(req.params.id).lean();
    if (!c) return res.status(404).json({ success: false, message: 'Club not found.' });
    const admin = ADMIN.includes(req.user.role);
    if (!admin && !isLeaderOf(c, req.user._id)) return res.status(403).json({ success: false, message: 'Only this club\'s leaders can schedule meetings.' });
    const { title, scheduledAt, durationMins, kind, teacherId } = req.body || {};
    const when = new Date(scheduledAt);
    if (!scheduledAt || isNaN(when)) return res.status(400).json({ success: false, message: 'A valid date and time is required.' });
    // The meeting's host: the leader scheduling it, or (admin) a chosen leader, else the first leader.
    let host = req.user._id;
    if (admin) host = (teacherId && oid(teacherId)) ? teacherId : (c.leaders && c.leaders[0]) || req.user._id;
    const lc = await LiveClass.create({
      title: (title || `${c.name} meeting`).trim().slice(0, 140),
      description: c.tagline || '',
      subject: c.name, curriculum: 'Clubs', grade: 'All',
      teacherId: host, scheduledAt: when,
      durationMins: Math.min(240, Math.max(15, Number(durationMins) || c.durationMins || 60)),
      assignedStudents: c.members || [],
      clubId: c._id, kind: ['club', 'competition', 'event'].includes(kind) ? kind : 'club',
      status: 'scheduled',
    });
    res.json({ success: true, data: { meeting: lc } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
router.delete('/:id/meetings/:meetingId', auth, requireRole('teacher', ...ADMIN), async (req, res) => {
  try {
    const c = await Club.findById(req.params.id).lean();
    if (!c) return res.status(404).json({ success: false, message: 'Club not found.' });
    if (!ADMIN.includes(req.user.role) && !isLeaderOf(c, req.user._id)) return res.status(403).json({ success: false, message: 'Not allowed.' });
    await LiveClass.updateOne({ _id: req.params.meetingId, clubId: c._id }, { $set: { status: 'cancelled' } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Admin: create / edit / leaders ──────────────────────────────────
const pick = (b = {}) => {
  const out = {};
  ['name', 'tagline', 'description', 'icon', 'color', 'coverImage', 'category', 'meetingSchedule'].forEach(k => { if (typeof b[k] === 'string') out[k] = b[k].trim(); });
  ['durationMins', 'capacity', 'sortOrder'].forEach(k => { if (b[k] !== undefined && b[k] !== '') out[k] = Number(b[k]) || 0; });
  ['isActive', 'featured'].forEach(k => { if (typeof b[k] === 'boolean') out[k] = b[k]; });
  if (Array.isArray(b.leaders)) out.leaders = b.leaders.filter(oid);
  return out;
};

router.post('/', auth, requireRole(...ADMIN), async (req, res) => {
  try {
    const data = pick(req.body);
    if (!data.name) return res.status(400).json({ success: false, message: 'A club name is required.' });
    data.slug = slugify(data.name);
    if (await Club.findOne({ slug: data.slug })) return res.status(409).json({ success: false, message: 'A club with that name already exists.' });
    data.createdBy = req.user._id;
    const c = await Club.create(data);
    res.json({ success: true, data: { club: shapeClub(c.toObject(), req.user._id) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/:id', auth, requireRole('teacher', ...ADMIN), async (req, res) => {
  try {
    const c = await Club.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Club not found.' });
    const admin = ADMIN.includes(req.user.role);
    if (!admin && !isLeaderOf(c, req.user._id)) return res.status(403).json({ success: false, message: 'Not allowed.' });
    const data = pick(req.body);
    if (!admin) { delete data.leaders; delete data.isActive; delete data.featured; delete data.sortOrder; }
    if (data.name && data.name !== c.name) data.slug = slugify(data.name);
    Object.assign(c, data);
    await c.save();
    const fresh = await Club.findById(c._id).populate('leaders', 'firstName lastName avatar').lean();
    res.json({ success: true, data: { club: shapeClub(fresh, req.user._id) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/clubs/admin/teachers   pick-list for assigning leaders
router.get('/admin/teachers', auth, requireRole(...ADMIN), async (req, res) => {
  try {
    const rows = await User.find({ role: 'teacher', isActive: { $ne: false } }).select('firstName lastName avatar').sort({ firstName: 1 }).lean();
    res.json({ success: true, data: { teachers: rows.map(t => ({ _id: t._id, name: [t.firstName, t.lastName].filter(Boolean).join(' '), avatar: t.avatar || '' })) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/clubs/admin/seed   create the starter set (skips any that exist)
const STARTER = [
  { name: 'Debate & MUN',          icon: 'debate',    color: '#1E3A8A', category: 'Leadership',  tagline: 'Build confidence, critical thinking and leadership through debates and Model UN sessions.' },
  { name: 'Coding & AI',           icon: 'code',      color: '#6D28D9', category: 'Technology',  tagline: 'Explore programming, artificial intelligence and build real-world tech projects.' },
  { name: 'Science & Innovation',  icon: 'science',   color: '#3F6212', category: 'STEM',        tagline: 'Experiment, discover and innovate through fun science projects and challenges.' },
  { name: 'Creative Arts',         icon: 'art',       color: '#BE185D', category: 'Arts',        tagline: 'Express yourself through drawing, painting, digital art, photography and design.' },
  { name: 'Entrepreneurship',      icon: 'rocket',    color: '#C2410C', category: 'Business',    tagline: 'Develop business ideas, problem solving and financial literacy skills.' },
  { name: 'Chess Club',            icon: 'chess',     color: '#78350F', category: 'Strategy',    tagline: 'Sharpen your strategy, focus and analytical skills in friendly competitions.' },
  { name: 'Public Speaking',       icon: 'mic',       color: '#0E7490', category: 'Leadership',  tagline: 'Improve your speaking skills and present with clarity and confidence.' },
  { name: 'Writing & Literature',  icon: 'book',      color: '#1D4ED8', category: 'Arts',        tagline: 'Unlock your creativity with storytelling, poetry and creative writing challenges.' },
  { name: 'Music Club',            icon: 'music',     color: '#5B21B6', category: 'Arts',        tagline: 'Share your talent, learn new skills and create beautiful music together.' },
  { name: 'Drama & Theatre',       icon: 'theatre',   color: '#B91C1C', category: 'Arts',        tagline: 'Act, perform and bring stories to life on our virtual theatre stage.' },
  { name: 'Sports & Wellness',     icon: 'sports',    color: '#0F766E', category: 'Wellbeing',   tagline: 'Stay active, healthy and motivated through fitness challenges and sports activities.' },
  { name: 'Community Service',     icon: 'heart',     color: '#2563EB', category: 'Service',     tagline: 'Make a difference through service projects and acts of kindness.' },
];
router.post('/admin/seed', auth, requireRole(...ADMIN), async (req, res) => {
  try {
    let created = 0;
    for (let i = 0; i < STARTER.length; i++) {
      const s = STARTER[i]; const slug = slugify(s.name);
      if (await Club.findOne({ slug })) continue;
      await Club.create({ ...s, slug, sortOrder: i, createdBy: req.user._id, meetingSchedule: '' });
      created++;
    }
    res.json({ success: true, message: created ? `Created ${created} starter club(s).` : 'All starter clubs already exist.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
