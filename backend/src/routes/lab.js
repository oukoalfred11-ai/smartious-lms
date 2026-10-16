/**
 * routes/lab.js — Smartious Virtual Science Laboratory API.
 * Mounted at /api/lab. Uses the existing login (auth middleware) and roles.
 *
 * Experiments
 *   GET    /experiments                 catalogue (+ publication status)
 *   GET    /experiments/:id
 *   PATCH  /experiments/:id/status      admin / Dean: draft|review|approved|published
 *   POST   /experiments/bulk-status     admin / Dean: { ids, status, note } for many at once
 * Sessions (a student's attempt)
 *   POST   /sessions                    student: open or resume { experimentId, assignmentId?, newAttempt? }
 *   GET    /sessions/mine               student: my attempts
 *   GET    /sessions/:id                owner, teacher of the student, admin/Dean, parent (submitted work)
 *   PUT    /sessions/:id                student: save { baseRevision, fromIndex, newActions, notebook, answers }
 *   POST   /sessions/:id/submit         student: { baseRevision, submissionKey } (idempotent)
 *   POST   /sessions/:id/reset          student: start this attempt again (not after submission)
 *   POST   /sessions/:id/mark           teacher/admin/Dean: { marks, feedback, action: mark|return }
 *   GET    /sessions/:id/report.pdf     printable lab report
 * Teaching
 *   GET    /students                    students the caller may assign to
 *   GET    /assignments                 teacher: mine; student: mine; admin/Dean: all
 *   POST   /assignments                 teacher (own students only) / admin / Dean
 *   PATCH  /assignments/:id             close / reopen / change deadline
 *   GET    /review                      submissions in scope (filters: status, experimentId, assignmentId)
 *
 * Every rule comes from shared/lab/access.js and shared/lab/sessionOps.js,
 * which have their own tests.
 */
const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Allocation = require('../models/Allocation');
const LabSession = require('../models/LabSession');
const LabAssignment = require('../models/LabAssignment');
const LabContent = require('../models/LabContent');
const { labCore } = require('../lib/labCore');

const STAFF = ['admin', 'dos', 'ops_manager'];
const fullName = (u) => [u?.firstName, u?.lastName].filter(Boolean).join(' ');
const isId = (v) => mongoose.isValidObjectId(v);

// Saves come every few seconds while a student works; this stops runaway clients.
const saveLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, keyGenerator: (req) => String(req.user?._id || req.ip), standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Saving too often. Please wait a moment.' } });

const wrap = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (e) {
    if (e && e.code && e.code >= 400 && e.code < 500) return res.status(e.code).json({ success: false, message: e.message, conflict: !!e.conflict });
    if (/Cannot find module|ERR_MODULE_NOT_FOUND/.test(String(e?.message))) {
      console.error('[lab] shared/lab engine missing:', e.message);
      return res.status(503).json({ success: false, message: 'The Virtual Lab engine is not available on the server.' });
    }
    console.error('[lab]', req.method, req.originalUrl, e);
    return res.status(500).json({ success: false, message: 'Something went wrong in the Virtual Lab.' });
  }
};

// ── Scope helpers ───────────────────────────────────────────
async function scopeFor(user) {
  if (user.role === 'teacher') {
    const ids = await Allocation.find({ teacherId: user._id, status: 'Active' }).distinct('studentId');
    return { studentIds: ids.map(String) };
  }
  if (user.role === 'parent') {
    const ids = new Set((user.linkedStudents || []).map(String));
    const via = await User.find({ role: 'student', $or: [{ parentId: user._id }, { linkedParents: user._id }] }).distinct('_id');
    via.forEach((v) => ids.add(String(v)));
    return { childIds: [...ids] };
  }
  return {};
}

async function statusMap() {
  const rows = await LabContent.find({}).lean();
  return Object.fromEntries(rows.map((r) => [r.experimentId, r]));
}
const statusOf = (map, id) => map[id]?.status || 'review';

/** A session as sent to clients: everything except the internal submission key. */
function sessionOut(s, { withActions = true } = {}) {
  const o = s.toObject ? s.toObject() : { ...s };
  delete o.submissionKey;
  if (!withActions) { delete o.actions; delete o.notebook; delete o.answers; delete o.analysis; }
  return o;
}

async function loadSession(req, res) {
  if (!isId(req.params.id)) { res.status(400).json({ success: false, message: 'Invalid id.' }); return null; }
  const s = await LabSession.findById(req.params.id);
  if (!s) { res.status(404).json({ success: false, message: 'Lab session not found.' }); return null; }
  return s;
}

// ── Experiments ─────────────────────────────────────────────
router.get('/experiments', auth, wrap(async (req, res) => {
  const { experiments, access } = await labCore();
  const map = await statusMap();
  let assignedIds = new Set();
  if (req.user.role === 'student') {
    const a = await LabAssignment.find({ studentIds: req.user._id, status: 'active' }).distinct('experimentId');
    assignedIds = new Set(a);
  }
  const list = experiments.EXPERIMENTS
    .map((d) => ({ ...experiments.catalogueEntry(d), status: statusOf(map, d.id), reviewNote: STAFF.includes(req.user.role) ? map[d.id]?.reviewNote || '' : undefined }))
    .filter((e) => access.canOpenExperiment(req.user, e.status, { assigned: assignedIds.has(e.id) }));
  res.json({ success: true, data: { experiments: list } });
}));

router.get('/experiments/:id', auth, wrap(async (req, res) => {
  const { experiments, access } = await labCore();
  const def = experiments.getExperiment(req.params.id);
  if (!def) return res.status(404).json({ success: false, message: 'Experiment not found.' });
  const status = statusOf(await statusMap(), def.id);
  const assigned = req.user.role === 'student' && !!(await LabAssignment.exists({ studentIds: req.user._id, experimentId: def.id, status: 'active' }));
  if (!access.canOpenExperiment(req.user, status, { assigned })) return res.status(403).json({ success: false, message: 'This experiment is not available yet.' });
  res.json({ success: true, data: { experiment: { ...experiments.catalogueEntry(def), status } } });
}));

// Bulk: set many experiments at once (e.g. publish a whole practical collection).
// Each one is checked exactly as for a single change; failures are reported, not hidden.
router.post('/experiments/bulk-status', auth, requireRole(...STAFF), wrap(async (req, res) => {
  const { experiments, engine } = await labCore();
  const status = req.body?.status;
  if (!['draft', 'review', 'approved', 'published'].includes(status)) return res.status(400).json({ success: false, message: 'Unknown status.' });
  const ids = [...new Set((Array.isArray(req.body?.ids) ? req.body.ids : []).map(String))].slice(0, 500);
  if (!ids.length) return res.status(400).json({ success: false, message: 'Choose at least one experiment.' });
  const note = String(req.body?.note || '').slice(0, 2000);
  const done = [], refused = [];
  for (const id of ids) {
    const def = experiments.getExperiment(id);
    if (!def) { refused.push({ id, reason: 'not found' }); continue; }
    if (['approved', 'published'].includes(status)) {
      const problems = engine.validateDefinition(def);
      if (problems.length) { refused.push({ id, reason: problems.join('; ') }); continue; }
    }
    await LabContent.findOneAndUpdate(
      { experimentId: id },
      { $set: { status, reviewNote: note, reviewedBy: req.user._id, reviewedByName: fullName(req.user) },
        $push: { history: { $each: [{ byName: fullName(req.user), status, note }], $slice: -50 } } },
      { upsert: true, new: true });
    done.push(id);
  }
  res.json({ success: true, data: { done, refused }, message: `${done.length} set to ${status}` + (refused.length ? `; ${refused.length} refused` : '') + '.' });
}));

router.patch('/experiments/:id/status', auth, requireRole(...STAFF), wrap(async (req, res) => {
  const { experiments, engine } = await labCore();
  const def = experiments.getExperiment(req.params.id);
  if (!def) return res.status(404).json({ success: false, message: 'Experiment not found.' });
  const status = req.body?.status;
  if (!['draft', 'review', 'approved', 'published'].includes(status)) return res.status(400).json({ success: false, message: 'Unknown status.' });
  if (['approved', 'published'].includes(status)) {
    const problems = engine.validateDefinition(def);
    if (problems.length) return res.status(422).json({ success: false, message: 'The experiment definition has problems: ' + problems.join('; ') });
  }
  const note = String(req.body?.note || '').slice(0, 2000);
  const doc = await LabContent.findOneAndUpdate(
    { experimentId: def.id },
    { $set: { status, reviewNote: note, reviewedBy: req.user._id, reviewedByName: fullName(req.user) },
      $push: { history: { $each: [{ byName: fullName(req.user), status, note }], $slice: -50 } } },
    { upsert: true, new: true });
  res.json({ success: true, data: { status: doc.status }, message: 'Status set to ' + status + '.' });
}));

// ── Sessions ────────────────────────────────────────────────
router.post('/sessions', auth, requireRole('student'), wrap(async (req, res) => {
  const { experiments, access } = await labCore();
  const def = experiments.getExperiment(req.body?.experimentId);
  if (!def) return res.status(404).json({ success: false, message: 'Experiment not found.' });
  let assignment = null;
  if (req.body?.assignmentId) {
    if (!isId(req.body.assignmentId)) return res.status(400).json({ success: false, message: 'Invalid assignment.' });
    assignment = await LabAssignment.findOne({ _id: req.body.assignmentId, studentIds: req.user._id, experimentId: def.id });
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });
  }
  const status = statusOf(await statusMap(), def.id);
  if (!access.canOpenExperiment(req.user, status, { assigned: !!assignment })) return res.status(403).json({ success: false, message: 'This experiment is not available yet.' });

  const key = { studentId: req.user._id, experimentId: def.id, assignmentId: assignment?._id || null };
  const latest = await LabSession.findOne(key).sort({ attempt: -1 });
  if (latest && (['in_progress', 'returned'].includes(latest.status) || !req.body?.newAttempt || assignment)) {
    return res.json({ success: true, data: { session: sessionOut(latest) } });
  }
  const doc = {
    ...key, attempt: (latest?.attempt || 0) + 1, experimentVersion: def.version,
    studentName: fullName(req.user), seed: crypto.randomBytes(12).toString('hex'),
    options: assignment?.options || {}, history: [{ by: req.user._id, byName: fullName(req.user), event: 'started' }],
  };
  try {
    const s = await LabSession.create(doc);
    return res.status(201).json({ success: true, data: { session: sessionOut(s) } });
  } catch (e) {
    if (e?.code === 11000) { // two tabs opened at once: return the one that won
      const s = await LabSession.findOne(key).sort({ attempt: -1 });
      return res.json({ success: true, data: { session: sessionOut(s) } });
    }
    throw e;
  }
}));

router.get('/sessions/mine', auth, requireRole('student'), wrap(async (req, res) => {
  const list = await LabSession.find({ studentId: req.user._id }).sort({ updatedAt: -1 }).limit(200);
  res.json({ success: true, data: { sessions: list.map((s) => sessionOut(s, { withActions: false })) } });
}));

router.get('/sessions/:id', auth, wrap(async (req, res) => {
  const { access } = await labCore();
  const s = await loadSession(req, res); if (!s) return;
  if (!access.canViewSession(req.user, s, await scopeFor(req.user))) return res.status(403).json({ success: false, message: 'You do not have access to this work.' });
  res.json({ success: true, data: { session: sessionOut(s) } });
}));

router.put('/sessions/:id', auth, requireRole('student'), saveLimiter, wrap(async (req, res) => {
  const { experiments, access, ops } = await labCore();
  const s = await loadSession(req, res); if (!s) return;
  if (String(s.studentId) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'You can only save your own work.' });
  if (!access.canEditSession(req.user, s)) return res.status(409).json({ success: false, message: 'This work has been submitted and can no longer be changed.' });
  const def = experiments.getExperiment(s.experimentId);
  const updates = ops.applySave(def, s.toObject(), req.body || {});
  // Conditional update on the revision: a concurrent save cannot be lost.
  const saved = await LabSession.findOneAndUpdate({ _id: s._id, revision: s.revision, status: s.status }, { $set: updates }, { new: true });
  if (!saved) return res.status(409).json({ success: false, conflict: true, message: 'This experiment was saved from another tab or device. Reload to continue from the latest copy.' });
  res.json({ success: true, data: { revision: saved.revision, savedAt: saved.updatedAt, actionCount: saved.actions.length } });
}));

router.post('/sessions/:id/reset', auth, requireRole('student'), wrap(async (req, res) => {
  const { access } = await labCore();
  const s = await loadSession(req, res); if (!s) return;
  if (!access.canEditSession(req.user, s)) return res.status(409).json({ success: false, message: 'Submitted work cannot be reset.' });
  if (Number(req.body?.baseRevision) !== s.revision) return res.status(409).json({ success: false, conflict: true, message: 'Reload first: this experiment changed elsewhere.' });
  const saved = await LabSession.findOneAndUpdate({ _id: s._id, revision: s.revision },
    { $set: { actions: [], answers: {}, revision: s.revision + 1 }, $push: { history: { by: req.user._id, byName: fullName(req.user), event: 'reset' } } }, { new: true });
  if (!saved) return res.status(409).json({ success: false, conflict: true, message: 'Reload first.' });
  res.json({ success: true, data: { session: sessionOut(saved) } });
}));

router.post('/sessions/:id/submit', auth, requireRole('student'), wrap(async (req, res) => {
  const { experiments, ops } = await labCore();
  const s = await loadSession(req, res); if (!s) return;
  if (String(s.studentId) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'You can only submit your own work.' });
  const def = experiments.getExperiment(s.experimentId);
  const out = ops.applySubmit(def, s.toObject(), { baseRevision: req.body?.baseRevision, submissionKey: req.body?.submissionKey });
  if (out.duplicate) return res.json({ success: true, data: { session: sessionOut(s) }, message: 'Already submitted.' });
  const saved = await LabSession.findOneAndUpdate({ _id: s._id, revision: s.revision, status: s.status },
    { $set: out, $push: { history: { by: req.user._id, byName: fullName(req.user), event: 'submitted' } } }, { new: true });
  if (!saved) {
    const now = await LabSession.findById(s._id);
    if (now?.status === 'submitted' && now.submissionKey === req.body?.submissionKey) return res.json({ success: true, data: { session: sessionOut(now) }, message: 'Already submitted.' });
    return res.status(409).json({ success: false, conflict: true, message: 'This work changed while submitting. Reload and try again.' });
  }
  res.json({ success: true, data: { session: sessionOut(saved) }, message: 'Submitted for marking.' });
}));

router.post('/sessions/:id/mark', auth, requireRole('teacher', ...STAFF), wrap(async (req, res) => {
  const { experiments, access, ops } = await labCore();
  const s = await loadSession(req, res); if (!s) return;
  if (!access.canMarkSession(req.user, s, await scopeFor(req.user))) return res.status(403).json({ success: false, message: 'You can only mark work from students you teach.' });
  const def = experiments.getExperiment(s.experimentId);
  const out = ops.applyMark(def, s.toObject(), { marks: req.body?.marks || {}, feedback: req.body?.feedback || '', action: req.body?.action || 'mark', markerName: fullName(req.user) });
  const saved = await LabSession.findByIdAndUpdate(s._id,
    { $set: { ...out, markedBy: req.user._id }, $push: { history: { by: req.user._id, byName: fullName(req.user), event: out.status === 'marked' ? 'marked' : 'returned', note: String(req.body?.feedback || '').slice(0, 300) } } }, { new: true });
  res.json({ success: true, data: { session: sessionOut(saved) }, message: out.status === 'marked' ? 'Marked.' : 'Returned to the student for correction.' });
}));

// ── PDF report ──────────────────────────────────────────────
router.get('/sessions/:id/report.pdf', auth, wrap(async (req, res) => {
  const lab = await labCore();
  const s = await loadSession(req, res); if (!s) return;
  if (!lab.access.canViewSession(req.user, s, await scopeFor(req.user))) return res.status(403).json({ success: false, message: 'You do not have access to this work.' });
  const def = lab.experiments.getExperiment(s.experimentId);
  const { buildLabReportPdf } = require('../lib/labReportPdf');
  const pdf = await buildLabReportPdf({ lab, def, session: s.toObject() });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="lab-report-${s.experimentId}-${String(s._id).slice(-6)}.pdf"`);
  res.send(pdf);
}));

// ── Teaching: students, assignments, review ─────────────────
router.get('/students', auth, requireRole('teacher', ...STAFF), wrap(async (req, res) => {
  const filter = { role: 'student', archived: { $ne: true } };
  if (req.user.role === 'teacher') filter._id = { $in: (await scopeFor(req.user)).studentIds };
  const list = await User.find(filter).select('firstName lastName email admissionNumber curriculum gradeLevel').sort({ firstName: 1 }).limit(2000).lean();
  res.json({ success: true, data: { students: list.map((u) => ({ _id: u._id, name: fullName(u), email: u.email, admissionNumber: u.admissionNumber || null, curriculum: u.curriculum, grade: u.gradeLevel })) } });
}));

router.get('/assignments', auth, wrap(async (req, res) => {
  let filter;
  if (req.user.role === 'student') filter = { studentIds: req.user._id };
  else if (req.user.role === 'teacher') filter = { teacherId: req.user._id };
  else if (STAFF.includes(req.user.role)) filter = {};
  else return res.status(403).json({ success: false, message: 'Not available.' });
  const list = await LabAssignment.find(filter).sort({ createdAt: -1 }).limit(500).lean();
  if (req.user.role === 'student') {
    const mine = await LabSession.find({ studentId: req.user._id, assignmentId: { $in: list.map((a) => a._id) } }).select('assignmentId status score maxScore attempt').lean();
    const byA = Object.fromEntries(mine.map((m) => [String(m.assignmentId), m]));
    return res.json({ success: true, data: { assignments: list.map((a) => ({ ...a, studentIds: undefined, mySession: byA[String(a._id)] || null })) } });
  }
  const counts = await LabSession.aggregate([{ $match: { assignmentId: { $in: list.map((a) => a._id) } } }, { $group: { _id: { a: '$assignmentId', s: '$status' }, n: { $sum: 1 } } }]);
  const byA = {};
  for (const c of counts) { const k = String(c._id.a); byA[k] = byA[k] || {}; byA[k][c._id.s] = c.n; }
  res.json({ success: true, data: { assignments: list.map((a) => ({ ...a, studentCount: a.studentIds.length, progress: byA[String(a._id)] || {} })) } });
}));

router.post('/assignments', auth, requireRole('teacher', ...STAFF), wrap(async (req, res) => {
  const { experiments, access } = await labCore();
  const b = req.body || {};
  const def = experiments.getExperiment(b.experimentId);
  if (!def) return res.status(404).json({ success: false, message: 'Experiment not found.' });
  const status = statusOf(await statusMap(), def.id);
  if (!['approved', 'published'].includes(status)) return res.status(409).json({ success: false, message: 'Only approved or published experiments can be assigned.' });
  const studentIds = [...new Set((b.studentIds || []).map(String))].filter(isId);
  if (!access.canAssign(req.user, studentIds, await scopeFor(req.user))) return res.status(403).json({ success: false, message: 'You can only assign experiments to students you teach.' });
  const real = await User.countDocuments({ _id: { $in: studentIds }, role: 'student' });
  if (real !== studentIds.length) return res.status(400).json({ success: false, message: 'Some selected people are not students.' });
  const dueAt = b.dueAt ? new Date(b.dueAt) : null;
  if (dueAt && isNaN(dueAt.getTime())) return res.status(400).json({ success: false, message: 'Invalid deadline.' });
  const options = def.id === 'chem-titration' && ['HCl', 'CH3COOH'].includes(b.options?.acid) ? { acid: b.options.acid } : {};
  if (def.practical && b.options?.stockroom === true) options.stockroom = true;   // students choose the apparatus themselves
  const a = await LabAssignment.create({
    experimentId: def.id, title: String(b.title || def.title).trim().slice(0, 200), instructions: String(b.instructions || '').slice(0, 4000),
    options, teacherId: req.user._id, teacherName: fullName(req.user), studentIds, dueAt,
  });
  res.status(201).json({ success: true, data: { assignment: a }, message: 'Assigned to ' + studentIds.length + ' student(s).' });
}));

router.patch('/assignments/:id', auth, requireRole('teacher', ...STAFF), wrap(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id.' });
  const a = await LabAssignment.findById(req.params.id);
  if (!a) return res.status(404).json({ success: false, message: 'Assignment not found.' });
  if (req.user.role === 'teacher' && String(a.teacherId) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not your assignment.' });
  if (req.body?.status && ['active', 'closed'].includes(req.body.status)) a.status = req.body.status;
  if (req.body?.dueAt !== undefined) a.dueAt = req.body.dueAt ? new Date(req.body.dueAt) : null;
  await a.save();
  res.json({ success: true, data: { assignment: a } });
}));

router.get('/review', auth, requireRole('teacher', ...STAFF), wrap(async (req, res) => {
  const filter = {};
  if (req.user.role === 'teacher') filter.studentId = { $in: (await scopeFor(req.user)).studentIds };
  const q = req.query;
  if (q.status && ['in_progress', 'submitted', 'returned', 'marked'].includes(q.status)) filter.status = q.status;
  if (q.experimentId) filter.experimentId = String(q.experimentId);
  if (q.assignmentId && isId(q.assignmentId)) filter.assignmentId = q.assignmentId;
  const list = await LabSession.find(filter).sort({ submittedAt: -1, updatedAt: -1 }).limit(500);
  res.json({ success: true, data: { sessions: list.map((s) => sessionOut(s, { withActions: false })) } });
}));

module.exports = router;
