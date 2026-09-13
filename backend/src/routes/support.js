/**
 * support.js - the Support Desk. Any signed in user opens a request
 * and chats with the school; admin and the operations manager are
 * emailed on every new request and user reply, and the manage view
 * carries the response clock so requests are answered on time.
 *   POST  /api/support            open a request
 *   GET   /api/support/mine       my requests with the thread
 *   POST  /api/support/:id/messages   reply (owner or staff)
 *   PATCH /api/support/:id        staff: resolve or reopen
 *   GET   /api/support/manage     staff: all requests + response KPIs
 */
const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const SupportTicket = require('../models/SupportTicket');
const { notify } = require('../lib/notify');

const STAFF_ROLES = ['admin', 'ops_manager'];
const STAFF = requireRole(...STAFF_ROLES);

// Same transport pattern as the rest of the house. Support mail is
// operational: it ignores optional email preferences by design.
function getTransporter() {
  const nodemailer = require('nodemailer');
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
}
function sendMailSafe(to, subject, html) {
  try {
    const t = getTransporter();
    if (!t || !to) return;
    t.sendMail({ from: process.env.EMAIL_FROM || process.env.EMAIL_USER, to, subject, html }).catch(() => {});
  } catch (e) { /* mail must never break support */ }
}
const wrap = (inner) => '<div style="font-family:Georgia,serif;color:#231715;max-width:560px">'
  + '<h2 style="color:#7D1025;margin:0 0 2px">Smartious Homeschool</h2>'
  + '<div style="color:#8a8378;font-size:12px;margin-bottom:12px">Support Desk</div>'
  + inner
  + '<p style="font-size:11px;color:#8a8378;margin-top:14px">Smartious Homeschool \u00b7 Est. 2018 \u00b7 smartioushomeschool.com</p></div>';
const esc = (s) => String(s || '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

async function notifyStaff(subject, html) {
  const staff = await User.find({ role: { $in: STAFF_ROLES }, isActive: { $ne: false } }).select('email').lean();
  staff.forEach(s => sendMailSafe(s.email, subject, html));
}

// ── Open a request ──
router.post('/', auth, async (req, res) => {
  try {
    const subject = String(req.body.subject || '').trim().slice(0, 140);
    const body = String(req.body.body || '').trim().slice(0, 3000);
    if (!subject || !body) return res.status(400).json({ success: false, message: 'A subject and a message are required.' });
    const category = req.body.category === 'guidance' ? 'guidance' : 'general';

    const name = [req.user.firstName, req.user.lastName].filter(Boolean).join(' ') || req.user.email;
    const t = await SupportTicket.create({
      userId: req.user._id,
      userName: name,
      userRole: req.user.role,
      userEmail: req.user.email,
      subject,
      category,
      messages: [{ senderId: req.user._id, senderName: name, staff: false, body }],
      lastUserMessageAt: new Date(),
    });

    User.find({ role: { $in: STAFF_ROLES }, isActive: { $ne: false } }).select('_id').lean()
      .then(staff => notify(staff.map(x => x._id), { title: category === 'guidance' ? 'New Guidance and Counselling request' : 'New support request', body: name + ': ' + subject, module: 'support' })).catch(() => {});
    const lane = category === 'guidance' ? 'Guidance and Counselling' : 'support';
    notifyStaff((category === 'guidance' ? 'New Guidance and Counselling request \u00b7 ' : 'New support request \u00b7 ') + subject, wrap(
      '<p style="font-size:14px"><b>' + esc(name) + '</b> (' + esc(req.user.role) + ') opened a ' + lane + ' request.' + (category === 'guidance' ? ' Handle with care and confidentiality.' : '') + '</p>'
      + '<p style="font-size:13px;background:#FBF8F3;border-left:3px solid #C9973A;padding:10px 12px"><b>' + esc(subject) + '</b><br>' + esc(body).slice(0, 400) + '</p>'
      + '<p style="font-size:13px">Reply from the Support Desk in the admin portal. The response clock is running.</p>'
    )).catch(() => {});

    res.json({ success: true, data: { ticket: t } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── My requests ──
router.get('/mine', auth, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(40).lean();
    res.json({ success: true, data: { tickets } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Reply on a thread ──
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const body = String(req.body.body || '').trim().slice(0, 3000);
    if (!body) return res.status(400).json({ success: false, message: 'Message required.' });
    const t = await SupportTicket.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Request not found.' });

    const isStaff = STAFF_ROLES.includes(req.user.role);
    const isOwner = String(t.userId) === String(req.user._id);
    if (!isStaff && !isOwner) return res.status(403).json({ success: false, message: 'Not your request.' });

    const name = [req.user.firstName, req.user.lastName].filter(Boolean).join(' ') || req.user.email;
    t.messages.push({ senderId: req.user._id, senderName: name, staff: isStaff, body });

    if (isStaff) {
      if (!t.firstStaffReplyAt) t.firstStaffReplyAt = new Date();
      t.lastStaffMessageAt = new Date();
      if (t.status !== 'resolved') t.status = 'awaiting_user';
      notify(t.userId, { title: 'Support replied', body: t.subject, module: 'messages' }).catch(() => {});
      sendMailSafe(t.userEmail, 'Support replied \u00b7 ' + t.subject, wrap(
        '<p style="font-size:14px">Dear ' + esc(t.userName.split(' ')[0] || 'there') + ',</p>'
        + '<p style="font-size:13px">The school has replied to your support request <b>' + esc(t.subject) + '</b>:</p>'
        + '<p style="font-size:13px;background:#FBF8F3;border-left:3px solid #7D1025;padding:10px 12px">' + esc(body).slice(0, 500) + '</p>'
        + '<p style="font-size:13px">Open your portal to continue the conversation.</p>'
      ));
    } else {
      t.lastUserMessageAt = new Date();
      t.status = 'open'; // a user reply reopens the clock, even on resolved
      t.resolvedAt = null;
      User.find({ role: { $in: STAFF_ROLES }, isActive: { $ne: false } }).select('_id').lean()
        .then(staff => notify(staff.map(x => x._id), { title: 'Support reply from ' + t.userName, body: t.subject, module: 'support' })).catch(() => {});
      notifyStaff('Support reply from ' + t.userName + ' \u00b7 ' + t.subject, wrap(
        '<p style="font-size:14px"><b>' + esc(t.userName) + '</b> replied on <b>' + esc(t.subject) + '</b>:</p>'
        + '<p style="font-size:13px;background:#FBF8F3;border-left:3px solid #C9973A;padding:10px 12px">' + esc(body).slice(0, 400) + '</p>'
      )).catch(() => {});
    }
    await t.save();
    res.json({ success: true, data: { ticket: t.toObject() } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Resolve / reopen ──
router.patch('/:id', auth, STAFF, async (req, res) => {
  try {
    const t = await SupportTicket.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (req.body.status === 'resolved') { t.status = 'resolved'; t.resolvedAt = new Date(); }
    else if (req.body.status === 'open') { t.status = 'open'; t.resolvedAt = null; }
    else return res.status(400).json({ success: false, message: 'status must be resolved or open.' });
    await t.save();
    res.json({ success: true, data: { ticket: t.toObject() } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Manage view with the response clock ──
router.get('/manage', auth, STAFF, async (req, res) => {
  try {
    const now = Date.now();
    const week = new Date(now - 7 * 24 * 3600 * 1000);
    const tickets = await SupportTicket.find({}).sort({ updatedAt: -1 }).limit(200).lean();

    const rows = tickets.map(t => {
      const lastStaff = t.lastStaffMessageAt ? new Date(t.lastStaffMessageAt).getTime() : 0;
      const lastUser = t.lastUserMessageAt ? new Date(t.lastUserMessageAt).getTime() : new Date(t.createdAt).getTime();
      const waitingMins = (t.status !== 'resolved' && lastUser > lastStaff) ? Math.round((now - lastUser) / 60000) : 0;
      return { ...t, waitingMins, unanswered: !t.firstStaffReplyAt && t.status !== 'resolved' };
    });

    const firstResp = tickets.filter(t => t.firstStaffReplyAt && new Date(t.createdAt) >= week)
      .map(t => (new Date(t.firstStaffReplyAt) - new Date(t.createdAt)) / 60000);
    const kpis = {
      open: rows.filter(r => r.status === 'open').length,
      awaiting: rows.filter(r => r.status === 'awaiting_user').length,
      unanswered: rows.filter(r => r.unanswered).length,
      overdue: rows.filter(r => r.waitingMins > 240).length,
      avgFirstResponseMins: firstResp.length ? Math.round(firstResp.reduce((a, b) => a + b, 0) / firstResp.length) : null,
      resolved7d: tickets.filter(t => t.resolvedAt && new Date(t.resolvedAt) >= week).length,
    };
    res.json({ success: true, data: { rows, kpis,
      method: 'Waiting time counts from the last user message with no later staff reply. Overdue means waiting over four hours on an unresolved request. Average first response covers requests opened in the last seven days.' } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
