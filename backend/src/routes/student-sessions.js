/**
 * routes/student-sessions.js
 * Mounted at /api/student-sessions
 * ============================================================
 * Pause / Report Back management for student accounts.
 * Available to admin, dos, ops_manager and accountant.
 *
 * A pause makes the auth middleware reject the student AND any
 * linked parent (all of whose students are paused) with
 * code ACCOUNT_PAUSED until Report Back or auto-expiry.
 */
const express = require('express')
const router  = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const User = require('../models/User')
const StudentPause = require('../models/StudentPause')
const { sendPauseNotice, sendReportBackNotice } = require('../services/notificationEmails')

async function parentEmailsFor(student) {
  const ids = [ ...(student.linkedParents || []) ].map(String)
  if (!ids.length) return []
  const parents = await User.find({ _id: { $in: ids }, role: 'parent' }).select('email').lean()
  return parents.map(p => p.email).filter(Boolean)
}

const STAFF = requireRole('admin', 'dos', 'ops_manager', 'accountant')

const TYPE_LABELS = {
  holiday: 'Holiday', mid_term_break: 'Mid-term break', end_term_break: 'End-term break',
  summer_break: 'Summer break', medical_leave: 'Medical leave',
  fee_hold: 'Late fee payment hold', other: 'Other',
}

// ── GET /api/student-sessions ───────────────────────────────
// Students with pause state + linked parents + active pause.
router.get('/', auth, STAFF, async (req, res) => {
  try {
    const { search, status = 'all', type = 'all' } = req.query
    const filter = { role: 'student' }
    if (status === 'paused') filter.onBreak = true
    if (status === 'active') filter.onBreak = { $ne: true }
    if (search) {
      const re = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter.$or = [{ firstName: re }, { lastName: re }, { email: re }, { admissionNumber: re }]
    }
    if (type !== 'all') filter.breakType = type

    const students = await User.find(filter)
      .select('firstName lastName email admissionNumber curriculum gradeLevel programme onBreak breakType breakStart breakEnd breakNote breakBlocksAccess linkedParents parentName parentEmail')
      .populate('linkedParents', 'firstName lastName email')
      .sort({ onBreak: -1, firstName: 1 })
      .limit(500)
      .lean()

    const pausedIds = students.filter(s => s.onBreak).map(s => s._id)
    const activePauses = pausedIds.length
      ? await StudentPause.find({ student: { $in: pausedIds }, status: 'active' })
          .populate('createdBy', 'firstName lastName role').lean()
      : []
    const pauseByStudent = {}
    activePauses.forEach(p => { pauseByStudent[String(p.student)] = p })

    return res.json({ success: true, data: {
      students: students.map(s => ({ ...s, activePause: pauseByStudent[String(s._id)] || null })),
      typeLabels: TYPE_LABELS,
    } })
  } catch (e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── GET /api/student-sessions/stats ─────────────────────────
router.get('/stats', auth, STAFF, async (req, res) => {
  try {
    const [total, paused, byType] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', onBreak: true }),
      User.aggregate([
        { $match: { role: 'student', onBreak: true } },
        { $group: { _id: '$breakType', count: { $sum: 1 } } },
      ]),
    ])
    const typeMap = {}
    byType.forEach(t => { typeMap[t._id || 'other'] = t.count })
    return res.json({ success: true, data: { total, paused, active: total - paused, byType: typeMap } })
  } catch (e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── GET /api/student-sessions/history/:studentId ────────────
router.get('/history/:studentId', auth, STAFF, async (req, res) => {
  try {
    const history = await StudentPause.find({ student: req.params.studentId })
      .populate('createdBy', 'firstName lastName role')
      .populate('endedBy', 'firstName lastName role')
      .sort({ createdAt: -1 }).limit(50).lean()
    return res.json({ success: true, data: { history } })
  } catch (e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── POST /api/student-sessions/pause ────────────────────────
router.post('/pause', auth, STAFF, async (req, res) => {
  try {
    const { studentId, type = 'other', note = '', expectedEnd = null } = req.body
    // Access blocking: explicit flag wins; otherwise fee holds block, breaks do not.
    const blockAccess = typeof req.body.blockAccess === 'boolean' ? req.body.blockAccess : (type === 'fee_hold')
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId is required.' })
    if (!TYPE_LABELS[type]) return res.status(400).json({ success: false, message: 'Invalid pause type.' })

    const student = await User.findOne({ _id: studentId, role: 'student' })
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })
    if (student.onBreak) return res.status(400).json({ success: false, message: 'Student already has an active pause. Mark Report Back first.' })

    const end = expectedEnd ? new Date(expectedEnd) : null
    if (end && isNaN(end)) return res.status(400).json({ success: false, message: 'Invalid expected return date.' })
    if (end && end <= new Date()) return res.status(400).json({ success: false, message: 'Expected return date must be in the future.' })

    const pause = await StudentPause.create({
      student: student._id, type, note: String(note).trim(),
      blockAccess,
      startAt: new Date(), expectedEnd: end,
      createdBy: req.user._id, createdByRole: req.user.role,
    })

    // Denormalise onto the user for zero-cost middleware enforcement.
    // NOTE: isActive stays TRUE — pause is a session state, not deactivation.
    student.onBreak = true
    student.breakType = type
    student.breakStart = pause.startAt
    student.breakEnd = end
    student.breakNote = pause.note
    student.breakBlocksAccess = blockAccess
    await student.save()

    // Auto-email student + linked parents (best-effort, non-blocking)
    parentEmailsFor(student)
      .then(parentEmails => sendPauseNotice({ student, parentEmails, pause, typeLabel: TYPE_LABELS[type] }))
      .catch(e => console.error('[sessions] pause email failed:', e.message))

    const accessMsg = blockAccess
      ? 'Portal access suspended for the student and linked parents.'
      : 'Student keeps portal access for homework and personal studies; reminders and check-in are paused.'
    return res.status(201).json({ success: true,
      message: `${student.firstName} ${student.lastName} paused (${TYPE_LABELS[type]}). ${accessMsg}`,
      data: { pause } })
  } catch (e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── PATCH /api/student-sessions/:id/report-back ─────────────
router.patch('/:id/report-back', auth, STAFF, async (req, res) => {
  try {
    const pause = await StudentPause.findOne({ _id: req.params.id, status: 'active' })
    if (!pause) return res.status(404).json({ success: false, message: 'Active pause not found.' })

    pause.status = 'ended'
    pause.endedAt = new Date()
    pause.endedBy = req.user._id
    await pause.save()

    const student = await User.findByIdAndUpdate(pause.student, {
      $set: { onBreak: false, breakType: '', breakStart: null, breakEnd: null, breakNote: '', breakBlocksAccess: false, isActive: true }
    }, { new: true })

    if (student) {
      parentEmailsFor(student)
        .then(parentEmails => sendReportBackNotice({ student, parentEmails, auto: false }))
        .catch(e => console.error('[sessions] report-back email failed:', e.message))
    }

    return res.json({ success: true,
      message: `${student ? student.firstName + ' ' + student.lastName : 'Student'} marked as reported back. Access restored.`,
      data: { pause } })
  } catch (e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ── PATCH /api/student-sessions/report-back-by-student/:studentId ──
// Convenience for legacy pauses that have no StudentPause record.
router.patch('/report-back-by-student/:studentId', auth, STAFF, async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.studentId, role: 'student' })
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })

    await StudentPause.updateMany({ student: student._id, status: 'active' },
      { $set: { status: 'ended', endedAt: new Date(), endedBy: req.user._id } })

    student.onBreak = false
    student.breakType = ''
    student.breakStart = null
    student.breakEnd = null
    student.breakNote = ''
    student.breakBlocksAccess = false
    student.isActive = true
    await student.save()

    parentEmailsFor(student)
      .then(parentEmails => sendReportBackNotice({ student, parentEmails, auto: false }))
      .catch(e => console.error('[sessions] report-back email failed:', e.message))

    return res.json({ success: true, message: `${student.firstName} ${student.lastName} marked as reported back. Access restored.` })
  } catch (e) { return res.status(500).json({ success: false, message: e.message }) }
})

// ════════════════════════════════════════════════════════════════════
// ACADEMIC YEARS, COHORTS AND RETENTION
// Statuses say what a student IS; enrollments say where they were each
// year. Together they produce cohort tables and the retention rate.
// ════════════════════════════════════════════════════════════════════
const Enrollment = require('../models/Enrollment');

// Next grade in each curriculum ladder; null = terminal (graduates).
function nextGrade(grade) {
  const g = String(grade || '').trim();
  let m = g.match(/^Year (\d+)/i);
  if (m) { const n = Number(m[1]); return n >= 13 ? null : 'Year ' + (n + 1); }
  m = g.match(/^Grade (\d+)/i);
  if (m) { const n = Number(m[1]); return n >= 12 ? null : 'Grade ' + (n + 1); }
  m = g.match(/^Form (\d+)/i);
  if (m) { const n = Number(m[1]); return n >= 4 ? null : 'Form ' + (n + 1); }
  m = g.match(/^MYP Grade (\d+)/i);
  if (m) { const n = Number(m[1]); return n >= 10 ? 'DP Year 1' : 'MYP Grade ' + (n + 1); }
  if (/^DP Year 1/i.test(g)) return 'DP Year 2';
  if (/^DP Year 2/i.test(g)) return null;
  if (/^PP1$/i.test(g)) return 'PP2';
  if (/^PP2$/i.test(g)) return 'Grade 1';
  if (/^Kindergarten$/i.test(g)) return 'Grade 1';
  return g; // unknown ladder: carry the grade forward unchanged
}

// GET /years — cohort table + retention per consecutive year pair.
router.get('/years', auth, STAFF, async (req, res) => {
  try {
    const recs = await Enrollment.find({}).lean();
    const years = [...new Set(recs.map(r => r.academicYear))].sort();
    const cohorts = years.map(y => {
      const inYear = recs.filter(r => r.academicYear === y);
      const byGrade = {};
      inYear.forEach(r => {
        byGrade[r.grade] = byGrade[r.grade] || { grade: r.grade, total: 0, active: 0, withdrawn: 0, graduated: 0, completed: 0, break: 0 };
        byGrade[r.grade].total += 1;
        byGrade[r.grade][r.status] = (byGrade[r.grade][r.status] || 0) + 1;
      });
      return { academicYear: y, total: inYear.length, grades: Object.values(byGrade).sort((a, b) => a.grade.localeCompare(b.grade, undefined, { numeric: true })) };
    });
    // Retention: of year X's non-graduating enrolled students, the share
    // holding a record in year X+1.
    const retention = [];
    for (let i = 0; i < years.length - 1; i++) {
      const yA = years[i], yB = years[i + 1];
      const inA = recs.filter(r => r.academicYear === yA && r.status !== 'graduated');
      const idsB = new Set(recs.filter(r => r.academicYear === yB).map(r => String(r.studentId)));
      const eligible = inA.length;
      const retained = inA.filter(r => idsB.has(String(r.studentId))).length;
      retention.push({ from: yA, to: yB, eligible, retained, pct: eligible ? Math.round(retained / eligible * 1000) / 10 : null });
    }
    res.json({ success: true, data: { cohorts, retention,
      method: 'Cohorts count enrollment records per academic year and grade. Retention for year X to X+1: of students enrolled in X whose record is not graduated, the percentage holding any enrollment record in X+1.' } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /years/init { academicYear } — snapshot every active student
// into the year at their current grade. Idempotent per student+year.
router.post('/years/init', auth, STAFF, async (req, res) => {
  try {
    const year = String(req.body?.academicYear || '').trim();
    if (!/^\d{4}\/\d{4}$/.test(year)) return res.status(400).json({ success: false, message: 'Academic year must look like 2026/2027.' });
    const students = await User.find({ role: 'student', isActive: { $ne: false } }).select('gradeLevel curriculum').lean();
    let created = 0;
    for (const st of students) {
      const r = await Enrollment.updateOne(
        { studentId: st._id, academicYear: year },
        { $setOnInsert: { grade: st.gradeLevel || 'Unassigned', curriculum: st.curriculum || '', status: 'active', startedAt: new Date() } },
        { upsert: true }
      );
      if (r.upsertedCount) created += 1;
    }
    // Stamp the current year on the student records too.
    await User.updateMany({ role: 'student', isActive: { $ne: false } }, { $set: { academicYear: year } });
    res.json({ success: true, message: `${year} initialized: ${created} student(s) enrolled (existing records kept).` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /years/promote { fromYear, toYear, confirm: true }
// Closes fromYear (active -> completed), advances every continuing
// student one grade, graduates terminal grades, opens toYear records.
router.post('/years/promote', auth, STAFF, async (req, res) => {
  try {
    const fromYear = String(req.body?.fromYear || '').trim();
    const toYear = String(req.body?.toYear || '').trim();
    if (req.body?.confirm !== true) return res.status(400).json({ success: false, message: 'Pass confirm: true - promotion changes every student record.' });
    if (!/^\d{4}\/\d{4}$/.test(fromYear) || !/^\d{4}\/\d{4}$/.test(toYear)) return res.status(400).json({ success: false, message: 'Years must look like 2026/2027.' });

    const recs = await Enrollment.find({ academicYear: fromYear, status: { $in: ['active', 'break'] } }).lean();
    let promoted = 0, graduated = 0;
    for (const r of recs) {
      const ng = nextGrade(r.grade);
      if (ng === null) {
        await Enrollment.updateOne({ _id: r._id }, { $set: { status: 'graduated', endedAt: new Date() } });
        await User.updateOne({ _id: r.studentId }, { $set: { studentStatus: 'Graduated', statusChangedAt: new Date(), statusReason: 'Completed ' + r.grade + ' (' + fromYear + ')', isActive: false } });
        graduated += 1;
      } else {
        await Enrollment.updateOne({ _id: r._id }, { $set: { status: 'completed', endedAt: new Date() } });
        await Enrollment.updateOne(
          { studentId: r.studentId, academicYear: toYear },
          { $setOnInsert: { grade: ng, curriculum: r.curriculum, status: 'active', startedAt: new Date() } },
          { upsert: true }
        );
        await User.updateOne({ _id: r.studentId }, { $set: { gradeLevel: ng, academicYear: toYear } });
        promoted += 1;
      }
    }
    res.json({ success: true, message: `${fromYear} closed: ${promoted} promoted into ${toYear}, ${graduated} graduated.` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// PATCH /exit/:studentId { kind: 'withdrawn'|'graduated', reason }
// The lifecycle exit door: closes the current enrollment record and
// the student account together, so rosters, timetables and portals all
// agree the student has left - and retention data gains its truth.
router.patch('/exit/:studentId', auth, STAFF, async (req, res) => {
  try {
    const kind = req.body?.kind === 'graduated' ? 'graduated' : 'withdrawn';
    const reason = String(req.body?.reason || '').slice(0, 300);
    const student = await User.findById(req.params.studentId);
    if (!student || student.role !== 'student') return res.status(404).json({ success: false, message: 'Student not found.' });
    await Enrollment.updateMany(
      { studentId: student._id, status: { $in: ['active', 'break'] } },
      { $set: { status: kind, endedAt: new Date(), reason } }
    );
    student.studentStatus = kind === 'graduated' ? 'Graduated' : 'Removed';
    student.statusChangedAt = new Date();
    student.statusChangedBy = req.user._id;
    student.statusReason = reason;
    student.isActive = false;
    await student.save();
    res.json({ success: true, message: `${student.firstName || 'Student'} marked ${kind === 'graduated' ? 'graduated' : 'as left'}. They no longer appear in rosters or timetables; their history is kept.` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router
