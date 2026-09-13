/**
 * user-logs.js - the Users Logs module: presence, login history and
 * behaviour analysis for administrators.
 *   GET /api/user-logs/overview
 */
const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const LoginEvent = require('../models/LoginEvent');

const STAFF = requireRole('admin', 'ops_manager');

router.get('/overview', auth, STAFF, async (req, res) => {
  try {
    const now = Date.now();
    const min5 = new Date(now - 5 * 60 * 1000);
    const dayStart = new Date(now - 24 * 3600 * 1000);
    const week = new Date(now - 7 * 24 * 3600 * 1000);
    const twoWeeks = new Date(now - 14 * 24 * 3600 * 1000);

    const users = await User.find({ isActive: { $ne: false } })
      .select('firstName lastName role email lastLogin lastActive createdAt')
      .lean();

    const events7 = await LoginEvent.find({ at: { $gte: week } })
      .select('userId email role success at ip').lean();

    const okEvents = events7.filter(e => e.success);
    const loginCount = {};
    okEvents.forEach(e => { if (e.userId) loginCount[String(e.userId)] = (loginCount[String(e.userId)] || 0) + 1; });

    const status = (u) => {
      const a = u.lastActive ? new Date(u.lastActive).getTime() : 0;
      if (a >= min5.getTime()) return 'online';
      if (a >= dayStart.getTime()) return 'today';
      if (a >= week.getTime()) return 'week';
      return 'dormant';
    };

    const rows = users.map(u => ({
      _id: u._id,
      name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
      role: u.role,
      email: u.email,
      lastLogin: u.lastLogin || null,
      lastActive: u.lastActive || null,
      logins7d: loginCount[String(u._id)] || 0,
      status: status(u),
    })).sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0));

    const onlineNow = rows.filter(r => r.status === 'online');
    const byRoleOnline = {};
    onlineNow.forEach(r => { byRoleOnline[r.role] = (byRoleOnline[r.role] || 0) + 1; });

    // Hourly rhythm of the school: successful logins per hour, EAT.
    const hourly = new Array(24).fill(0);
    okEvents.forEach(e => { hourly[new Date(new Date(e.at).getTime() + 3 * 3600 * 1000).getUTCHours()] += 1; });

    const failures = events7.filter(e => !e.success);
    const failByEmail = {};
    failures.forEach(e => {
      const k = e.email || 'unknown';
      failByEmail[k] = failByEmail[k] || { email: k, attempts: 0, last: null };
      failByEmail[k].attempts += 1;
      if (!failByEmail[k].last || e.at > failByEmail[k].last) failByEmail[k].last = e.at;
    });

    const recent = await LoginEvent.find({ success: true }).sort({ at: -1 }).limit(30)
      .select('email role at ip').lean();

    const dormant = rows.filter(r => (!r.lastActive || new Date(r.lastActive) < twoWeeks));

    res.json({ success: true, data: {
      kpis: {
        onlineNow: onlineNow.length,
        activeToday: rows.filter(r => r.status === 'online' || r.status === 'today').length,
        logins7d: okEvents.length,
        failed7d: failures.length,
        totalUsers: rows.length,
      },
      byRoleOnline,
      onlineNow: onlineNow.slice(0, 40),
      rows,
      hourly,
      recent,
      failed: Object.values(failByEmail).sort((a, b) => b.attempts - a.attempts).slice(0, 20),
      dormantCount: dormant.length,
      method: 'Online means activity within five minutes (requests stamp presence at most once per five minutes per user). Login history from sign in events kept 120 days. Hourly rhythm counts successful logins per hour, East Africa Time, over the last seven days.',
    } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
