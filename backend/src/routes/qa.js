/**
 * qa.js — QA portal data: Teacher Development Programme and
 * School Accreditations.
 * ============================================================
 *   GET    /summary              — QA dashboard: staff-file
 *                                  completeness, expiring documents,
 *                                  training reach, accreditation health
 *   GET    /teachers             — every teacher with file
 *                                  completeness and training hours
 *   GET    /teachers/:id         — one teacher: profile, documents,
 *                                  trainings attended, completeness
 *   POST   /uploads/presign      — presigned R2 upload (photos,
 *                                  certificates) for TDP and
 *                                  accreditation evidence
 *   GET    /trainings            — all trainings, newest first
 *   POST   /trainings            — record a training
 *   PATCH  /trainings/:id        — edit a training
 *   DELETE /trainings/:id        — remove one (R2 objects too)
 *   GET    /accreditations       — all accreditations
 *   POST   /accreditations       — add one
 *   PATCH  /accreditations/:id   — edit one
 *   DELETE /accreditations/:id   — remove one (R2 objects too)
 *
 * Teacher files (summary, teachers) are oversight only: admin, ops,
 * dos and qa. Trainings and accreditations are open to all staff plus
 * the qa role; writes to admin,
 * ops, dos and qa (qa files evidence during reviews, same as the
 * teacher-documents convention). The requireRole middleware's QA
 * read shadow covers GETs automatically, but roles are listed
 * explicitly so the intent is visible here.
 */
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const TeacherTraining = require('../models/TeacherTraining');
const Accreditation   = require('../models/Accreditation');
const TeacherDocument = require('../models/TeacherDocument');
const User            = require('../models/User');
const {
  TEACHER_DOC_CATEGORIES, REQUIRED_PERSONNEL, EXPIRY_WARN_DAYS, TRAINING_CATEGORIES, ACCREDITATION_TYPES,
  TEAM_ROLES, TEAM_GROUPS, TEACHER_CATEGORIES, TEACHER_CATEGORY_KEYS, teamGroup, teamTitle, requiredFor,
} = require('../constants/qa');
const { auth, requireRole } = require('../middleware/auth');

const READ_ROLES  = ['admin', 'ops_manager', 'dos', 'teacher', 'accountant', 'sales', 'qa'];
const WRITE_ROLES = ['admin', 'ops_manager', 'dos', 'qa'];
const OVERSIGHT_ROLES = ['admin', 'ops_manager', 'dos', 'qa'];
// Who may change a person's teacher category or job title.
const TEAM_EDIT_ROLES = ['admin', 'ops_manager', 'dos'];

const R2_READY = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME && process.env.R2_PUBLIC_URL);
if (!R2_READY) console.warn('[qa] R2 storage NOT configured - evidence uploads will fail.');
const r2Guard = (req, res, next) => R2_READY ? next() : res.status(503).json({ success: false, message: 'File storage is not configured on the server.' });

const r2 = R2_READY ? new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
}) : null;
const BUCKET     = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_MIME = [
  'application/pdf', 'image/png', 'image/jpeg', 'image/webp',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ── Presign ────────────────────────────────────────────────
router.post('/uploads/presign', auth, requireRole(...WRITE_ROLES), r2Guard, async (req, res) => {
  try {
    const { fileName, mimeType, fileSize, kind } = req.body || {};
    if (!fileName) return res.status(400).json({ success: false, message: 'fileName is required.' });
    const size = Number(fileSize) || 0;
    if (size <= 0 || size > MAX_BYTES)
      return res.status(400).json({ success: false, message: 'Files must be between 1 byte and 50 MB.' });
    if (mimeType && !ALLOWED_MIME.includes(mimeType))
      return res.status(400).json({ success: false, message: 'Only PDF, Word and image files are accepted here.' });
    const folder = kind === 'accreditation' ? 'qa/accreditations' : 'qa/trainings';
    const safeName = String(fileName).replace(/[^\w.\- ]+/g, '_').replace(/ /g, '_').slice(0, 140);
    const r2Key = `${folder}/${uuidv4()}-${safeName}`;
    const uploadUrl = await getSignedUrl(r2, new PutObjectCommand({
      Bucket: BUCKET, Key: r2Key, ContentType: mimeType || 'application/octet-stream',
    }), { expiresIn: 15 * 60 });
    return res.json({ success: true, data: { uploadUrl, r2Key, publicUrl: `${PUBLIC_URL}/${r2Key}` } });
  } catch (e) {
    console.error('[qa presign]', e.message);
    return res.status(500).json({ success: false, message: 'Could not prepare the upload.' });
  }
});

const cleanMedia = (arr, withCaption) => (Array.isArray(arr) ? arr : [])
  .filter(x => x && typeof x.url === 'string' && x.url.startsWith(PUBLIC_URL))
  .slice(0, 30)
  .map(x => withCaption
    ? ({ url: x.url, key: x.key || '', caption: String(x.caption || '').slice(0, 200) })
    : ({ url: x.url, key: x.key || '', name: String(x.name || '').slice(0, 200) }));

const cleanScope = (v) => (Array.isArray(v) ? v : String(v || '').split(','))
  .map(x => String(x).trim().slice(0, 120)).filter(Boolean).slice(0, 20);
const cleanUrl = (v) => {
  const u = String(v || '').trim().slice(0, 500);
  return /^https?:\/\//i.test(u) ? u : '';
};

const deleteObjects = async (items) => {
  if (!r2) return;
  for (const it of items || []) {
    if (!it.key) continue;
    try { await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: it.key })); }
    catch (e) { console.warn('[qa] R2 delete failed:', e.message); }
  }
};

// ── Teacher files: completeness ────────────────────────────
// A required personnel category is satisfied by at least one document
// that has not expired. Expired and soon-to-expire documents are listed
// so QA can chase renewals before an inspection.
const DAY = 86400000;
const CAT_LABEL = Object.fromEntries(TEACHER_DOC_CATEGORIES.map(c => [c.key, c.label]));

function fileStatus(docs, required = REQUIRED_PERSONNEL, now = Date.now()) {
  const valid = new Set();
  const expired = [], expiring = [];
  for (const d of docs) {
    const exp = d.expiresAt ? new Date(d.expiresAt).getTime() : null;
    if (exp !== null && exp < now) {
      expired.push({ _id: d._id, category: d.category, title: d.title, expiresAt: d.expiresAt });
      continue;
    }
    valid.add(d.category);
    if (exp !== null && exp - now <= EXPIRY_WARN_DAYS * DAY)
      expiring.push({ _id: d._id, category: d.category, title: d.title, expiresAt: d.expiresAt });
  }
  const have = required.filter(k => valid.has(k));
  // Only report an expired category if no valid copy replaced it.
  const expiredOnly = expired.filter(e => !valid.has(e.category));
  return {
    required: required.length,
    requiredKeys: required,
    have: have.length,
    pct: Math.round((have.length / required.length) * 100),
    missing: required.filter(k => !valid.has(k)),
    expired: expiredOnly,
    expiring,
    verified: docs.filter(d => d.verifiedAt).length,
    total: docs.length,
  };
}

const TEAM_FIELDS = 'firstName lastName email phone avatar bio role teacherCategory jobTitle yearsOfExperience qualifications certifications specializations subjects teachingSpecialties teacherStatus isOnLeave isActive createdAt';
// The whole staff team: the Principal, leadership, operations and every
// kind of teacher. Demo accounts are not people.
const activeTeamFilter = { role: { $in: TEAM_ROLES }, isActive: { $ne: false }, teacherStatus: { $ne: 'Left' }, isDemo: { $ne: true } };
const ROLE_ORDER = Object.fromEntries(TEAM_ROLES.map((r, i) => [r, i]));
const teamSort = (a, b) => (ROLE_ORDER[a.role] - ROLE_ORDER[b.role])
  || [a.firstName, a.lastName].join(' ').localeCompare([b.firstName, b.lastName].join(' '));
/** Title, group and required documents for one person. */
const decorate = (u) => ({ ...u, teacherCategory: u.role === 'teacher' ? (u.teacherCategory || 'teacher') : undefined, teamTitle: teamTitle(u), group: teamGroup(u.role) });
const DOC_FIELDS = 'teacherId category title subject description expiresAt verifiedAt verifiedByName uploadedBy uploadedByName file createdAt';

// Trainings each teacher attended, as { [teacherId]: { count, hours, last } }.
async function trainingByTeacher(teacherIds) {
  const rows = await TeacherTraining.aggregate([
    { $match: { attendees: { $in: teacherIds } } },
    { $unwind: '$attendees' },
    { $match: { attendees: { $in: teacherIds } } },
    { $group: { _id: '$attendees', count: { $sum: 1 }, hours: { $sum: '$durationHours' }, last: { $max: '$trainingDate' } } },
  ]);
  return Object.fromEntries(rows.map(r => [String(r._id), { count: r.count, hours: r.hours, last: r.last }]));
}

const accStatus = (a, now = Date.now()) => {
  if (!a.expiresAt) return 'permanent';
  const t = new Date(a.expiresAt).getTime();
  if (t < now) return 'expired';
  if (t - now <= 90 * DAY) return 'expiring';
  return 'valid';
};

// ── QA dashboard summary ───────────────────────────────────
router.get('/summary', auth, requireRole(...OVERSIGHT_ROLES), async (req, res) => {
  try {
    const now = Date.now();
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const team = await User.find(activeTeamFilter).select('firstName lastName avatar role teacherCategory').lean();
    const teachers = team.filter(u => u.role === 'teacher');
    const ids = team.map(t => t._id);
    const [docs, trainingsYear, recent, allTrainings, accs, byTeacher] = await Promise.all([
      TeacherDocument.find({ teacherId: { $in: ids } }).select(DOC_FIELDS).lean(),
      TeacherTraining.find({ trainingDate: { $gte: yearStart } }).select('durationHours attendees').lean(),
      TeacherTraining.find({}).sort({ trainingDate: -1 }).limit(4)
        .select('title trainingDate provider durationHours mode category photos attendees').lean(),
      TeacherTraining.countDocuments({}),
      Accreditation.find({}).select('name body type expiresAt documents').lean(),
      trainingByTeacher(ids),
    ]);

    const docsBy = {};
    for (const d of docs) (docsBy[String(d.teacherId)] = docsBy[String(d.teacherId)] || []).push(d);
    const name = (t) => [t.firstName, t.lastName].filter(Boolean).join(' ');
    let pctSum = 0, complete = 0;
    const attention = [];
    const expiringDocs = [];
    for (const t of team) {
      const st = fileStatus(docsBy[String(t._id)] || [], requiredFor(t), now);
      pctSum += st.pct;
      if (st.have === st.required) complete += 1;
      else attention.push({ _id: t._id, name: name(t), avatar: t.avatar || '', title: teamTitle(t), pct: st.pct, missing: st.missing.length });
      for (const e of [...st.expired, ...st.expiring])
        expiringDocs.push({ teacherId: t._id, teacher: name(t), category: e.category, label: CAT_LABEL[e.category] || e.category, title: e.title, expiresAt: e.expiresAt, expired: new Date(e.expiresAt).getTime() < now });
    }
    attention.sort((a, b) => a.pct - b.pct);
    expiringDocs.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));

    const reached = new Set();
    let hoursYear = 0;
    for (const t of trainingsYear) {
      hoursYear += t.durationHours || 0;
      for (const a of t.attendees || []) reached.add(String(a));
    }
    // Training coverage is measured across the teaching staff.
    const idSet = new Set(teachers.map(t => String(t._id)));
    const reachedActive = [...reached].filter(id => idSet.has(id)).length;

    const accCounts = { valid: 0, expiring: 0, expired: 0, permanent: 0 };
    const accAlerts = [];
    for (const a of accs) {
      const st = accStatus(a, now);
      accCounts[st] += 1;
      if (st === 'expiring' || st === 'expired') accAlerts.push({ _id: a._id, name: a.name, body: a.body, type: a.type, expiresAt: a.expiresAt, status: st });
      if (!(a.documents || []).length) accAlerts.push({ _id: a._id, name: a.name, body: a.body, type: a.type, status: 'no-certificate' });
    }

    const hoursList = teachers.map(t => byTeacher[String(t._id)]?.hours || 0);
    res.json({ success: true, data: {
      team: {
        total: team.length,
        teachers: teachers.length,
        byCategory: Object.fromEntries(TEACHER_CATEGORIES.map(c => [c.key, teachers.filter(t => (t.teacherCategory || 'teacher') === c.key).length])),
        complete,
        avgCompleteness: team.length ? Math.round(pctSum / team.length) : 0,
        attention: attention.slice(0, 8),
        requiredCategories: REQUIRED_PERSONNEL.map(k => ({ key: k, label: CAT_LABEL[k] })),
      },
      documents: {
        total: docs.length,
        verified: docs.filter(d => d.verifiedAt).length,
        expiring: expiringDocs.slice(0, 12),
        expiringCount: expiringDocs.length,
      },
      training: {
        total: allTrainings,
        thisYear: trainingsYear.length,
        hoursThisYear: hoursYear,
        teachersReachedThisYear: reachedActive,
        coveragePct: teachers.length ? Math.round((reachedActive / teachers.length) * 100) : 0,
        avgHoursPerTeacher: hoursList.length ? Math.round((hoursList.reduce((a, b) => a + b, 0) / hoursList.length) * 10) / 10 : 0,
        recent,
      },
      accreditations: { total: accs.length, ...accCounts, alerts: accAlerts },
      generatedAt: new Date(),
    } });
  } catch (e) {
    console.error('[qa summary]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── The team with file completeness ────────────────────────
async function listTeam(req, res) {
  try {
    const includeLeft = req.query.includeLeft === '1';
    const filter = includeLeft ? { role: { $in: TEAM_ROLES }, isDemo: { $ne: true } } : activeTeamFilter;
    const people = await User.find(filter).select(TEAM_FIELDS)
      .populate('teachingSpecialties.subjectId', 'subjectName curriculum').lean();
    people.sort(teamSort);
    const ids = people.map(t => t._id);
    const [docs, byTeacher] = await Promise.all([
      TeacherDocument.find({ teacherId: { $in: ids } }).select('teacherId category expiresAt verifiedAt').lean(),
      trainingByTeacher(ids),
    ]);
    const docsBy = {};
    for (const d of docs) (docsBy[String(d.teacherId)] = docsBy[String(d.teacherId)] || []).push(d);
    const now = Date.now();
    const rows = people.map(t => ({
      ...decorate(t),
      file: fileStatus(docsBy[String(t._id)] || [], requiredFor(t), now),
      training: byTeacher[String(t._id)] || { count: 0, hours: 0, last: null },
    }));
    res.json({ success: true, data: {
      team: rows, teachers: rows,
      categoryMeta: TEACHER_DOC_CATEGORIES, required: REQUIRED_PERSONNEL,
      teacherCategories: TEACHER_CATEGORIES, groups: TEAM_GROUPS.map(({ key, label }) => ({ key, label })),
    } });
  } catch (e) {
    console.error('[qa team]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
}
router.get('/team', auth, requireRole(...OVERSIGHT_ROLES), listTeam);
router.get('/teachers', auth, requireRole(...OVERSIGHT_ROLES), listTeam);   // older name

// ── One person's full profile ──────────────────────────────
async function getMember(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id.' });
    const person = await User.findOne({ _id: req.params.id, role: { $in: TEAM_ROLES } }).select(TEAM_FIELDS)
      .populate('teachingSpecialties.subjectId', 'subjectName curriculum').lean();
    if (!person) return res.status(404).json({ success: false, message: 'Team member not found.' });
    const [documents, trainings] = await Promise.all([
      TeacherDocument.find({ teacherId: person._id }).select(DOC_FIELDS).sort({ category: 1, createdAt: -1 }).lean(),
      TeacherTraining.find({ attendees: person._id })
        .select('title provider trainingDate durationHours mode category location photos files')
        .sort({ trainingDate: -1 }).lean(),
    ]);
    const member = decorate(person);
    res.json({ success: true, data: {
      member, teacher: member, documents, trainings,
      file: fileStatus(documents, requiredFor(person)),
      trainingHours: trainings.reduce((s, t) => s + (t.durationHours || 0), 0),
      categoryMeta: TEACHER_DOC_CATEGORIES, required: requiredFor(person),
      teacherCategories: TEACHER_CATEGORIES,
      canEdit: TEAM_EDIT_ROLES.includes(req.user.role),
    } });
  } catch (e) {
    console.error('[qa member]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
}
router.get('/team/:id', auth, requireRole(...OVERSIGHT_ROLES), getMember);
router.get('/teachers/:id', auth, requireRole(...OVERSIGHT_ROLES), getMember);   // older name

// ── Set a teacher's category and anyone's job title ────────
router.patch('/team/:id', auth, requireRole(...TEAM_EDIT_ROLES), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id.' });
    const person = await User.findOne({ _id: req.params.id, role: { $in: TEAM_ROLES } });
    if (!person) return res.status(404).json({ success: false, message: 'Team member not found.' });
    const { teacherCategory, jobTitle } = req.body || {};
    if (teacherCategory !== undefined) {
      if (person.role !== 'teacher') return res.status(400).json({ success: false, message: 'Only teachers have a teacher category.' });
      if (!TEACHER_CATEGORY_KEYS.includes(teacherCategory)) return res.status(400).json({ success: false, message: 'Unknown teacher category.' });
      person.teacherCategory = teacherCategory;
    }
    if (jobTitle !== undefined) person.jobTitle = String(jobTitle || '').trim().slice(0, 80);
    await person.save();
    res.json({ success: true, message: `${person.firstName} is now ${teamTitle(person)}.`, data: { teacherCategory: person.teacherCategory, jobTitle: person.jobTitle, teamTitle: teamTitle(person) } });
  } catch (e) {
    console.error('[qa team patch]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Trainings (TDP) ────────────────────────────────────────
router.get('/trainings', auth, requireRole(...READ_ROLES), async (req, res) => {
  try {
    const rows = await TeacherTraining.find({})
      .populate('attendees', 'firstName lastName avatar subjects')
      .populate('createdBy', 'firstName lastName role')
      .sort({ trainingDate: -1 }).limit(500).lean();
    res.json({ success: true, data: { trainings: rows } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/trainings', auth, requireRole(...WRITE_ROLES), async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.title || !b.trainingDate)
      return res.status(400).json({ success: false, message: 'Title and training date are required.' });
    const doc = await TeacherTraining.create({
      title: String(b.title).slice(0, 200),
      provider: String(b.provider || '').slice(0, 200),
      trainingDate: new Date(b.trainingDate),
      durationHours: Math.max(0, Math.min(500, Number(b.durationHours) || 0)),
      mode: ['In person', 'Online', 'Blended'].includes(b.mode) ? b.mode : 'In person',
      description: String(b.description || '').slice(0, 4000),
      category: TRAINING_CATEGORIES.includes(b.category) ? b.category : 'Pedagogy',
      location: String(b.location || '').slice(0, 200),
      outcomes: String(b.outcomes || '').slice(0, 4000),
      attendees: (Array.isArray(b.attendees) ? b.attendees : []).filter(id => mongoose.isValidObjectId(id)).slice(0, 200),
      photos: cleanMedia(b.photos, true),
      files: cleanMedia(b.files, false),
      createdBy: req.user._id,
    });
    res.json({ success: true, data: { training: doc } });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.patch('/trainings/:id', auth, requireRole(...WRITE_ROLES), async (req, res) => {
  try {
    const doc = await TeacherTraining.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Training not found.' });
    const b = req.body || {};
    if (b.title !== undefined) doc.title = String(b.title).slice(0, 200);
    if (b.provider !== undefined) doc.provider = String(b.provider).slice(0, 200);
    if (b.trainingDate !== undefined) doc.trainingDate = new Date(b.trainingDate);
    if (b.durationHours !== undefined) doc.durationHours = Math.max(0, Math.min(500, Number(b.durationHours) || 0));
    if (b.mode !== undefined && ['In person', 'Online', 'Blended'].includes(b.mode)) doc.mode = b.mode;
    if (b.description !== undefined) doc.description = String(b.description).slice(0, 4000);
    if (b.category !== undefined && TRAINING_CATEGORIES.includes(b.category)) doc.category = b.category;
    if (b.location !== undefined) doc.location = String(b.location).slice(0, 200);
    if (b.outcomes !== undefined) doc.outcomes = String(b.outcomes).slice(0, 4000);
    if (b.attendees !== undefined) doc.attendees = (Array.isArray(b.attendees) ? b.attendees : []).filter(id => mongoose.isValidObjectId(id)).slice(0, 200);
    if (b.photos !== undefined) doc.photos = cleanMedia(b.photos, true);
    if (b.files !== undefined) doc.files = cleanMedia(b.files, false);
    await doc.save();
    res.json({ success: true, data: { training: doc } });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/trainings/:id', auth, requireRole(...WRITE_ROLES), async (req, res) => {
  try {
    const doc = await TeacherTraining.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Training not found.' });
    await deleteObjects([...(doc.photos || []), ...(doc.files || [])]);
    await doc.deleteOne();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Accreditations ─────────────────────────────────────────
router.get('/accreditations', auth, requireRole(...READ_ROLES), async (req, res) => {
  try {
    const rows = await Accreditation.find({})
      .populate('createdBy', 'firstName lastName role')
      .sort({ type: 1, expiresAt: 1, name: 1 }).limit(300).lean();
    res.json({ success: true, data: { accreditations: rows } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/accreditations', auth, requireRole(...WRITE_ROLES), async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.name) return res.status(400).json({ success: false, message: 'Name is required.' });
    const doc = await Accreditation.create({
      name: String(b.name).slice(0, 200),
      body: String(b.body || '').slice(0, 200),
      type: ACCREDITATION_TYPES.includes(b.type) ? b.type : 'Accreditation',
      certificateNumber: String(b.certificateNumber || '').slice(0, 120),
      issuedAt: b.issuedAt ? new Date(b.issuedAt) : null,
      expiresAt: b.expiresAt ? new Date(b.expiresAt) : null,
      notes: String(b.notes || '').slice(0, 2000),
      scope: cleanScope(b.scope),
      verifyUrl: cleanUrl(b.verifyUrl),
      documents: cleanMedia(b.documents, false),
      createdBy: req.user._id,
    });
    res.json({ success: true, data: { accreditation: doc } });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.patch('/accreditations/:id', auth, requireRole(...WRITE_ROLES), async (req, res) => {
  try {
    const doc = await Accreditation.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Accreditation not found.' });
    const b = req.body || {};
    if (b.name !== undefined) doc.name = String(b.name).slice(0, 200);
    if (b.body !== undefined) doc.body = String(b.body).slice(0, 200);
    if (b.type !== undefined && ACCREDITATION_TYPES.includes(b.type)) doc.type = b.type;
    if (b.scope !== undefined) doc.scope = cleanScope(b.scope);
    if (b.verifyUrl !== undefined) doc.verifyUrl = cleanUrl(b.verifyUrl);
    if (b.certificateNumber !== undefined) doc.certificateNumber = String(b.certificateNumber).slice(0, 120);
    if (b.issuedAt !== undefined) doc.issuedAt = b.issuedAt ? new Date(b.issuedAt) : null;
    if (b.expiresAt !== undefined) doc.expiresAt = b.expiresAt ? new Date(b.expiresAt) : null;
    if (b.notes !== undefined) doc.notes = String(b.notes).slice(0, 2000);
    if (b.documents !== undefined) doc.documents = cleanMedia(b.documents, false);
    await doc.save();
    res.json({ success: true, data: { accreditation: doc } });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/accreditations/:id', auth, requireRole(...WRITE_ROLES), async (req, res) => {
  try {
    const doc = await Accreditation.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Accreditation not found.' });
    await deleteObjects(doc.documents || []);
    await doc.deleteOne();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
