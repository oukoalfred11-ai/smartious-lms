/**
 * ops-reports.js — the business side of the analytics house.
 *
 *   GET /api/ops-reports/funnel   inquiry pipeline: stage counts,
 *       conversion to enrolled, by source — where marketing money works.
 *   GET /api/ops-reports/churn    leaving-risk composite per active
 *       student: fee lateness + attendance decline + family inactivity.
 *       The business twin of the academic early-warning system.
 *   GET /api/ops-reports/revenue  collections, invoice aging, ARPU by
 *       curriculum — computable now that billing clocks are honest.
 *
 * Same doctrine as dos-reports: factual denominators, every number
 * traceable, method stated.
 */
const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');
const Invoice = require('../models/Invoice');
const LiveClass = require('../models/LiveClass');
const ClassroomSession = require('../models/ClassroomSession');

const STAFF = ['admin', 'ops_manager', 'dos'];
const r1 = (x) => Math.round(x * 10) / 10;
const pct = (n, d) => (d > 0 ? Math.round((n / d) * 1000) / 10 : null);

// ── Enrollment funnel ────────────────────────────────────────────────
router.get('/funnel', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    const days = Math.min(Number(req.query.days) || 90, 365);
    const since = new Date(Date.now() - days * 864e5);
    const [byStage, bySource] = await Promise.all([
      Inquiry.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$status', n: { $sum: 1 } } },
      ]),
      Inquiry.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { source: '$source', status: '$status' }, n: { $sum: 1 } } },
      ]),
    ]);
    const stages = ['new', 'contacted', 'interested', 'proposal_sent', 'assessment_req', 'enrolled', 'lost', 'unqualified'];
    const counts = Object.fromEntries(stages.map(s => [s, 0]));
    byStage.forEach(r => { counts[r._id] = r.n; });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const active = total - counts.enrolled - counts.lost - counts.unqualified;

    const sources = {};
    bySource.forEach(r => {
      const s = r._id.source || 'unknown';
      sources[s] = sources[s] || { total: 0, enrolled: 0 };
      sources[s].total += r.n;
      if (r._id.status === 'enrolled') sources[s].enrolled += r.n;
    });
    const sourceRows = Object.entries(sources).map(([source, v]) => ({
      source, total: v.total, enrolled: v.enrolled, conversionPct: pct(v.enrolled, v.total),
    })).sort((a, b) => b.total - a.total);

    res.json({ success: true, data: {
      windowDays: days, total, counts, activePipeline: active,
      conversionPct: pct(counts.enrolled, total),
      lossPct: pct(counts.lost + counts.unqualified, total),
      sources: sourceRows,
      method: `All inquiries created in the last ${days} days, grouped by their current stage and source. Conversion = enrolled / all inquiries in window.`,
    } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Churn early-warning ──────────────────────────────────────────────
router.get('/churn', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    const now = Date.now();
    const students = await User.find({ role: 'student', isActive: { $ne: false }, onBreak: { $ne: true } })
      .select('firstName lastName gradeLevel curriculum nextDueDate agreedFee parentId linkedParents lastActive').lean();

    // Attendance: last 14d vs the 14d before, derived-status classes.
    const from28 = new Date(now - 28 * 864e5);
    const raw = await LiveClass.find({
      status: { $nin: ['cancelled'] }, kind: { $in: ['lesson', null] },
      scheduledAt: { $gte: from28, $lte: new Date(now) },
    }).select('assignedStudents scheduledAt durationMins status').lean();
    const classes = raw.filter(c => c.status === 'ended' ||
      new Date(c.scheduledAt).getTime() + (c.durationMins || 60) * 60000 < now);
    const ids = classes.map(c => c._id);
    const sess = ids.length ? await ClassroomSession.find({ liveClassId: { $in: ids } })
      .select('liveClassId userId present joinCount').lean() : [];
    const att = new Set();
    sess.forEach(s => { if (((s.joinCount || 0) > 0 || s.present === true) && s.present !== false) att.add(String(s.liveClassId) + '|' + String(s.userId)); });
    const per = {}; // uid -> {recent:{a,s}, prior:{a,s}}
    classes.forEach(c => {
      const recent = new Date(c.scheduledAt).getTime() >= now - 14 * 864e5;
      (c.assignedStudents || []).forEach(u => {
        const uid = String(u);
        per[uid] = per[uid] || { recent: { a: 0, s: 0 }, prior: { a: 0, s: 0 } };
        const b = recent ? per[uid].recent : per[uid].prior;
        b.s += 1; if (att.has(String(c._id) + '|' + uid)) b.a += 1;
      });
    });

    // Parent inactivity: most recent lastActive among linked parents.
    const parentIds = new Set();
    students.forEach(s => { if (s.parentId) parentIds.add(String(s.parentId)); (s.linkedParents || []).forEach(p => parentIds.add(String(p))); });
    const parents = parentIds.size ? await User.find({ _id: { $in: [...parentIds] } }).select('lastActive').lean() : [];
    const parentActive = Object.fromEntries(parents.map(p => [String(p._id), p.lastActive]));

    const rows = students.map(s => {
      const uid = String(s._id);
      const p = per[uid] || { recent: { a: 0, s: 0 }, prior: { a: 0, s: 0 } };
      const recentPct = p.recent.s ? (p.recent.a / p.recent.s) * 100 : null;
      const priorPct = p.prior.s ? (p.prior.a / p.prior.s) * 100 : null;
      const attDrop = recentPct !== null && priorPct !== null ? priorPct - recentPct : 0;
      const feeLateDays = s.nextDueDate && new Date(s.nextDueDate) < new Date() ? Math.floor((now - new Date(s.nextDueDate)) / 864e5) : 0;
      const pDates = [s.parentId, ...(s.linkedParents || [])].map(x => parentActive[String(x)]).filter(Boolean);
      const parentGapDays = pDates.length ? Math.floor((now - Math.max(...pDates.map(d => new Date(d).getTime()))) / 864e5) : null;

      const signals = [];
      let score = 0;
      if (feeLateDays > 7) { score += Math.min(feeLateDays / 7, 5); signals.push(`fees ${feeLateDays}d late`); }
      if (attDrop >= 20) { score += 3; signals.push(`attendance down ${r1(attDrop)}pp`); }
      else if (attDrop >= 10) { score += 1.5; signals.push(`attendance down ${r1(attDrop)}pp`); }
      if (recentPct !== null && recentPct < 50 && p.recent.s >= 4) { score += 2; signals.push(`attending ${r1(recentPct)}% of classes`); }
      if (parentGapDays !== null && parentGapDays > 21) { score += 1.5; signals.push(`parent inactive ${parentGapDays}d`); }

      return {
        _id: s._id, name: [s.firstName, s.lastName].filter(Boolean).join(' '),
        grade: s.gradeLevel || '', curriculum: s.curriculum || '',
        monthlyFee: s.agreedFee || null,
        feeLateDays, attendanceRecentPct: recentPct !== null ? r1(recentPct) : null,
        attendanceDropPp: r1(attDrop), parentGapDays,
        score: r1(score), signals,
        risk: score >= 4 ? 'high' : score >= 2 ? 'watch' : 'ok',
      };
    }).filter(r => r.risk !== 'ok').sort((a, b) => b.score - a.score);

    res.json({ success: true, data: {
      rows, high: rows.filter(r => r.risk === 'high').length, watch: rows.filter(r => r.risk === 'watch').length,
      method: 'Composite of: fee lateness (days past the billing clock), attendance decline (last 14 days vs the 14 before, derived-status classes), current attendance below 50%, and family portal inactivity over 21 days. Score >= 4 is high risk, >= 2 watch.',
    } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Revenue health ───────────────────────────────────────────────────
router.get('/revenue', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [monthAgg, aging, arpu] = await Promise.all([
      Invoice.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        { $group: { _id: '$status', n: { $sum: 1 }, amount: { $sum: '$totalDue' } } },
      ]),
      Invoice.aggregate([
        { $match: { status: { $in: ['sent', 'overdue'] } } },
        { $project: { totalDue: 1, age: { $divide: [{ $subtract: [now, '$createdAt'] }, 864e5] } } },
        { $bucket: { groupBy: '$age', boundaries: [0, 15, 31, 61, 100000], default: 'other',
          output: { n: { $sum: 1 }, amount: { $sum: '$totalDue' } } } },
      ]),
      User.aggregate([
        { $match: { role: 'student', isActive: { $ne: false }, agreedFee: { $gt: 0 } } },
        { $group: { _id: '$curriculum', n: { $sum: 1 }, avgFee: { $avg: '$agreedFee' }, totalFee: { $sum: '$agreedFee' } } },
        { $sort: { totalFee: -1 } },
      ]),
    ]);
    const byStatus = Object.fromEntries(monthAgg.map(r => [r._id, { n: r.n, amount: r.amount }]));
    const issued = monthAgg.reduce((t, r) => t + r.amount, 0);
    const collected = byStatus.paid?.amount || 0;
    const agingLabels = { 0: '0-14d', 15: '15-30d', 31: '31-60d', 61: '60d+' };
    res.json({ success: true, data: {
      month: monthStart.toISOString().slice(0, 7),
      issued, collected, collectionPct: pct(collected, issued), byStatus,
      aging: aging.map(b => ({ bucket: agingLabels[b._id] || String(b._id), n: b.n, amount: b.amount })),
      outstandingTotal: aging.reduce((t, b) => t + b.amount, 0),
      arpu: arpu.map(r => ({ curriculum: r._id || 'Unset', students: r.n, avgFee: r1(r.avgFee), monthlyValue: r.totalFee })),
      expectedMonthly: arpu.reduce((t, r) => t + r.totalFee, 0),
      method: 'Issued/collected from invoices created this calendar month by status. Aging: unpaid invoices bucketed by days since issue. Expected monthly and ARPU from active students\' agreed fees by curriculum.',
    } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
