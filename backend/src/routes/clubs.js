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
const ClubProject = require('../models/ClubProject');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// R2 storage for club cover photos and project uploads (same bucket the
// library and community chat use).
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
const clubUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 80 * 1024 * 1024 } });

const KIND_OF = (mime) =>
  /^image\//.test(mime) ? 'image' : /^video\//.test(mime) ? 'video' : /^audio\//.test(mime) ? 'audio' : 'file';
const UPLOAD_OK = /^(image\/(png|jpe?g|webp|gif)|video\/(mp4|webm|quicktime)|audio\/(webm|mpeg|mp4|ogg)|application\/(pdf|zip|msword|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|presentationml\.presentation|spreadsheetml\.sheet))|text\/plain)$/;

async function putToR2(folder, file) {
  const ext = (file.originalname.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6);
  const key = `${folder}/${new Date().toISOString().slice(0, 10)}/${uuidv4()}.${ext}`;
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME, Key: key, Body: file.buffer, ContentType: file.mimetype,
  }));
  return {
    kind: KIND_OF(file.mimetype),
    url: `${process.env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`,
    key, name: file.originalname.slice(0, 140), mime: file.mimetype, sizeBytes: file.size,
  };
}
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

// ── Uploads ─────────────────────────────────────────────────────────
// POST /api/clubs/upload-cover — a club's cover photo (admin or any leader).
router.post('/upload-cover', auth, requireRole('teacher', ...ADMIN), (req, res) => {
  if (!R2_READY) return res.status(503).json({ success: false, message: 'Image storage is not configured on the server.' });
  clubUpload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message || 'Upload failed.' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file received.' });
    if (!/^image\/(png|jpe?g|webp)$/.test(req.file.mimetype)) return res.status(400).json({ success: false, message: 'Covers must be PNG, JPG or WebP images.' });
    if (req.file.size > 8 * 1024 * 1024) return res.status(400).json({ success: false, message: 'Cover images: 8MB max.' });
    try {
      const a = await putToR2('clubs/covers', req.file);
      res.json({ success: true, data: { url: a.url } });
    } catch (e) { res.status(500).json({ success: false, message: 'Could not store the image.' }); }
  });
});

// POST /api/clubs/:id/upload — a project attachment (club members and leaders).
router.post('/:id/upload', auth, (req, res) => {
  if (!R2_READY) return res.status(503).json({ success: false, message: 'File storage is not configured on the server.' });
  clubUpload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message || 'Upload failed.' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file received.' });
    if (!UPLOAD_OK.test(req.file.mimetype)) return res.status(400).json({ success: false, message: 'That file type is not supported.' });
    try {
      const club = await Club.findById(req.params.id).select('members leaders').lean();
      if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });
      const inClub = [...(club.members || []), ...(club.leaders || [])].some(x => String(x) === String(req.user._id)) || ADMIN.includes(req.user.role);
      if (!inClub) return res.status(403).json({ success: false, message: 'Join the club to upload a project.' });
      const a = await putToR2('clubs/projects', req.file);
      res.json({ success: true, data: { attachment: a } });
    } catch (e) { res.status(500).json({ success: false, message: 'Could not store the file.' }); }
  });
});

// ── Projects: upload, discuss, vote for annual awards ───────────────
const shapeProject = (pr, userId) => ({
  _id: pr._id, clubId: pr.clubId, title: pr.title, description: pr.description,
  attachments: pr.attachments || [], year: pr.year, createdAt: pr.createdAt,
  author: pr.studentId && pr.studentId.firstName !== undefined
    ? { _id: pr.studentId._id, name: [pr.studentId.firstName, pr.studentId.lastName].filter(Boolean).join(' '), avatar: pr.studentId.avatar || '', gradeLevel: pr.studentId.gradeLevel || '' }
    : { _id: pr.studentId },
  votes: (pr.votes || []).length,
  myVote: !!userId && (pr.votes || []).some(v => String(v) === String(userId)),
  commentCount: (pr.comments || []).length,
  mine: !!userId && String(pr.studentId?._id || pr.studentId) === String(userId),
});

const memberOf = async (clubId, user) => {
  const club = await Club.findById(clubId).select('members leaders name').lean();
  if (!club) return { club: null, ok: false, leader: false };
  const leader = (club.leaders || []).some(x => String(x) === String(user._id));
  const ok = leader || ADMIN.includes(user.role) ||
    (club.members || []).some(x => String(x) === String(user._id));
  return { club, ok, leader };
};

// GET /api/clubs/:id/projects?year= — the club's project gallery
router.get('/:id/projects', auth, async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const rows = await ClubProject.find({ clubId: req.params.id, isActive: true, year })
      .populate('studentId', 'firstName lastName avatar gradeLevel')
      .sort({ createdAt: -1 }).limit(200).lean();
    const shaped = rows.map(r => shapeProject(r, req.user._id));
    // Award standing: most votes first for the awards strip.
    const standings = [...shaped].sort((a, b) => b.votes - a.votes).slice(0, 3).map(p => p._id);
    res.json({ success: true, data: { projects: shaped, top3: standings, year } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/clubs/:id/projects/:pid — one project with its discussion
router.get('/:id/projects/:pid', auth, async (req, res) => {
  try {
    const pr = await ClubProject.findOne({ _id: req.params.pid, clubId: req.params.id, isActive: true })
      .populate('studentId', 'firstName lastName avatar gradeLevel')
      .populate('comments.authorId', 'firstName lastName avatar role').lean();
    if (!pr) return res.status(404).json({ success: false, message: 'Project not found.' });
    const comments = (pr.comments || []).map(c => ({
      _id: c._id, body: c.body, createdAt: c.createdAt,
      author: c.authorId && c.authorId.firstName !== undefined
        ? { _id: c.authorId._id, name: [c.authorId.firstName, c.authorId.lastName].filter(Boolean).join(' '), avatar: c.authorId.avatar || '', role: c.authorId.role }
        : { _id: c.authorId },
    }));
    res.json({ success: true, data: { project: shapeProject(pr, req.user._id), comments } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/clubs/:id/projects — publish a project (members)
router.post('/:id/projects', auth, async (req, res) => {
  try {
    const { ok } = await memberOf(req.params.id, req.user);
    if (!ok) return res.status(403).json({ success: false, message: 'Join the club to share a project.' });
    const { title, description, attachments } = req.body || {};
    if (!title || !String(title).trim()) return res.status(400).json({ success: false, message: 'Give your project a title.' });
    const atts = (Array.isArray(attachments) ? attachments : []).slice(0, 4).filter(a =>
      a && typeof a.url === 'string' && a.url.startsWith(String(process.env.R2_PUBLIC_URL || '\u0000').replace(/\/$/, '') + '/clubs/'));
    const pr = await ClubProject.create({
      clubId: req.params.id, studentId: req.user._id,
      title: String(title).trim().slice(0, 140),
      description: String(description || '').trim().slice(0, 3000),
      attachments: atts, year: new Date().getFullYear(),
    });
    res.json({ success: true, message: 'Project published to the club.', data: { project: shapeProject(pr.toObject(), req.user._id) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/clubs/:id/projects/:pid/comments — discuss and suggest
router.post('/:id/projects/:pid/comments', auth, async (req, res) => {
  try {
    const { ok } = await memberOf(req.params.id, req.user);
    if (!ok) return res.status(403).json({ success: false, message: 'Join the club to comment.' });
    const body = String(req.body?.body || '').trim();
    if (!body) return res.status(400).json({ success: false, message: 'Write a comment first.' });
    const pr = await ClubProject.findOneAndUpdate(
      { _id: req.params.pid, clubId: req.params.id, isActive: true },
      { $push: { comments: { authorId: req.user._id, body: body.slice(0, 1000) } } },
      { new: true });
    if (!pr) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, data: { commentCount: pr.comments.length } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/clubs/:id/projects/:pid/vote — annual-award ballot.
// One vote per member per club per year: voting here moves your vote off
// any other project in the same club and year. Voting again on the same
// project withdraws it. You cannot vote for your own project.
router.post('/:id/projects/:pid/vote', auth, async (req, res) => {
  try {
    const { ok } = await memberOf(req.params.id, req.user);
    if (!ok) return res.status(403).json({ success: false, message: 'Join the club to vote.' });
    const pr = await ClubProject.findOne({ _id: req.params.pid, clubId: req.params.id, isActive: true });
    if (!pr) return res.status(404).json({ success: false, message: 'Project not found.' });
    if (String(pr.studentId) === String(req.user._id)) return res.status(400).json({ success: false, message: 'You cannot vote for your own project.' });
    const had = pr.votes.some(v => String(v) === String(req.user._id));
    if (had) {
      await ClubProject.updateOne({ _id: pr._id }, { $pull: { votes: req.user._id } });
      return res.json({ success: true, message: 'Vote withdrawn.', data: { voted: false } });
    }
    // Move the ballot: remove my vote from every other project in this club+year.
    await ClubProject.updateMany({ clubId: pr.clubId, year: pr.year }, { $pull: { votes: req.user._id } });
    await ClubProject.updateOne({ _id: pr._id }, { $addToSet: { votes: req.user._id } });
    res.json({ success: true, message: 'Your award vote is on this project. You can move it any time before the awards.', data: { voted: true } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// DELETE /api/clubs/:id/projects/:pid — owner takes it down, or a leader/admin moderates
router.delete('/:id/projects/:pid', auth, async (req, res) => {
  try {
    const { ok, leader } = await memberOf(req.params.id, req.user);
    const pr = await ClubProject.findOne({ _id: req.params.pid, clubId: req.params.id });
    if (!pr) return res.status(404).json({ success: false, message: 'Project not found.' });
    const mine = String(pr.studentId) === String(req.user._id);
    if (!mine && !leader && !ADMIN.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Not allowed.' });
    await ClubProject.updateOne({ _id: pr._id }, { $set: { isActive: false, removedBy: req.user._id } });
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
  { name: 'Debate & MUN',          icon: 'debate',    color: '#1E3A8A',
    coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=60', category: 'Leadership',  tagline: 'Build confidence, critical thinking and leadership through debates and Model UN sessions.' },
  { name: 'Coding & AI',           icon: 'code',      color: '#6D28D9',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=60', category: 'Technology',  tagline: 'Explore programming, artificial intelligence and build real-world tech projects.' },
  { name: 'Science & Innovation',  icon: 'science',   color: '#3F6212',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=60', category: 'STEM',        tagline: 'Experiment, discover and innovate through fun science projects and challenges.' },
  { name: 'Creative Arts',         icon: 'art',       color: '#BE185D',
    coverImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=60', category: 'Arts',        tagline: 'Express yourself through drawing, painting, digital art, photography and design.' },
  { name: 'Entrepreneurship',      icon: 'rocket',    color: '#C2410C',
    coverImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=60', category: 'Business',    tagline: 'Develop business ideas, problem solving and financial literacy skills.' },
  { name: 'Chess Club',            icon: 'chess',     color: '#78350F',
    coverImage: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=900&q=60', category: 'Strategy',    tagline: 'Sharpen your strategy, focus and analytical skills in friendly competitions.' },
  { name: 'Public Speaking',       icon: 'mic',       color: '#0E7490',
    coverImage: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=60', category: 'Leadership',  tagline: 'Improve your speaking skills and present with clarity and confidence.' },
  { name: 'Writing & Literature',  icon: 'book',      color: '#1D4ED8',
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=60', category: 'Arts',        tagline: 'Unlock your creativity with storytelling, poetry and creative writing challenges.' },
  { name: 'Music Club',            icon: 'music',     color: '#5B21B6',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=60', category: 'Arts',        tagline: 'Share your talent, learn new skills and create beautiful music together.' },
  { name: 'Drama & Theatre',       icon: 'theatre',   color: '#B91C1C',
    coverImage: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=900&q=60', category: 'Arts',        tagline: 'Act, perform and bring stories to life on our virtual theatre stage.' },
  { name: 'Sports & Wellness',     icon: 'sports',    color: '#0F766E',
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=60', category: 'Wellbeing',   tagline: 'Stay active, healthy and motivated through fitness challenges and sports activities.' },
  { name: 'Community Service',     icon: 'heart',     color: '#2563EB',
    coverImage: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=60', category: 'Service',     tagline: 'Make a difference through service projects and acts of kindness.' },
];
router.post('/admin/seed', auth, requireRole(...ADMIN), async (req, res) => {
  try {
    let created = 0, updated = 0;
    for (let i = 0; i < STARTER.length; i++) {
      const s = STARTER[i]; const slug = slugify(s.name);
      const existing = await Club.findOne({ slug }).select('coverImage').lean();
      if (existing) {
        // Backfill the cover photo onto an existing club that has none;
        // a cover the school set itself is never overwritten.
        if (!existing.coverImage && s.coverImage) {
          await Club.updateOne({ _id: existing._id }, { $set: { coverImage: s.coverImage } });
          updated++;
        }
        continue;
      }
      await Club.create({ ...s, slug, sortOrder: i, createdBy: req.user._id, meetingSchedule: '' });
      created++;
    }
    const bits = [];
    if (created) bits.push(`Created ${created} starter club(s)`);
    if (updated) bits.push(`added cover photos to ${updated} existing club(s)`);
    res.json({ success: true, message: bits.length ? bits.join('; ') + '.' : 'All starter clubs already exist, with covers in place.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
