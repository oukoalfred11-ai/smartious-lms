const router = require('express').Router();
const FrontDeskSubmission = require('../models/FrontDeskSubmission');
const { auth, requireRole } = require('../middleware/auth');

// Optional admin-notification email — best-effort, never blocks a submission
let sendAdminNotification = null;
try {
  ({ sendAdminNotification } = require('../services/emailService'));
} catch (e) {
  console.error('[frontdesk] admin email helper unavailable —', e.message);
}

// ─────────────────────────────────────────────────────────
// POST /api/frontdesk/submit   — PUBLIC (no auth)
// The landing-page forms post here. Accepts any of the three
// submission types. Stores the lead, then best-effort emails
// admin so nothing is missed.
// ─────────────────────────────────────────────────────────
router.post('/submit', async (req, res) => {
  try {
    const b = req.body || {};
    const type = ['consultation', 'registration', 'contact'].includes(b.type)
      ? b.type : 'contact';

    // An enquiry with nothing identifiable is not useful
    if (!b.name && !b.email && !b.phone && !b.message) {
      return res.status(400).json({ success: false, message: 'Submission is empty.' });
    }

    const submission = await FrontDeskSubmission.create({
      type,
      name:             b.name,
      email:            b.email,
      phone:            b.phone,
      relationship:     b.relationship,
      studentFirstName: b.studentFirstName,
      studentLastName:  b.studentLastName,
      studentDob:       b.studentDob,
      currentSchool:    b.currentSchool,
      country:          b.country,
      programme:        b.programme,
      curriculum:       b.curriculum,
      learningMode:     b.learningMode,
      pathway:          b.pathway,
      destination:      b.destination,
      duration:         b.duration,
      heardFrom:        b.heardFrom,
      consultFormat:    b.consultFormat,
      address:          b.address,
      subject:          b.subject,
      message:          b.message,
      sourcePage:       b.sourcePage,
      extra:            (b.extra && typeof b.extra === 'object') ? b.extra : {},
    });

    // Best-effort admin notification — must never fail the request
    if (sendAdminNotification) {
      const label = type === 'registration' ? 'Registration enquiry'
                  : type === 'consultation' ? 'Consultation request'
                  : 'Website message';
      try {
        await sendAdminNotification({
          subject: `Front Desk: ${label} — ${b.name || b.email || 'New lead'}`,
          message: [
            `A new ${label.toLowerCase()} was received via the website.`,
            b.name        ? `Name: ${b.name}` : '',
            b.email       ? `Email: ${b.email}` : '',
            b.phone       ? `Phone: ${b.phone}` : '',
            b.country     ? `Country: ${b.country}` : '',
            b.programme   ? `Programme: ${b.programme}` : '',
            b.curriculum  ? `Curriculum: ${b.curriculum}` : '',
            b.heardFrom   ? `Heard from: ${b.heardFrom}` : '',
            b.message     ? `Message: ${b.message}` : '',
            '',
            'View and manage this lead in the Front Desk module of the admin portal.',
          ].filter(Boolean).join('\n'),
        });
      } catch (mailErr) {
        console.error('[frontdesk] admin email failed:', mailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Submission received.',
      data: { id: submission._id },
    });
  } catch (e) {
    console.error('[frontdesk submit]', e.message);
    res.status(500).json({ success: false, message: 'Could not record submission.' });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/frontdesk/submissions   — admin
// Optional filters: ?type= &status= &country= &search=
// ─────────────────────────────────────────────────────────
router.get('/submissions', auth, requireRole('admin'), async (req, res) => {
  try {
    const { type, status, country, search } = req.query;
    const q = {};
    if (type   && type   !== 'all') q.type = type;
    if (status && status !== 'all') q.status = status;
    if (country && country !== 'all') q.country = country;
    if (search && search.trim()) {
      const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      q.$or = [{ name: re }, { email: re }, { phone: re }, { message: re }];
    }

    const submissions = await FrontDeskSubmission.find(q)
      .sort('-createdAt')
      .limit(500)
      .lean();

    res.json({ success: true, data: { submissions } });
  } catch (e) {
    console.error('[frontdesk submissions]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// PATCH /api/frontdesk/:id   — admin: update status / notes
// ─────────────────────────────────────────────────────────
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const update = {};
    if (req.body.status !== undefined) {
      if (!['new', 'contacted', 'converted', 'closed'].includes(req.body.status))
        return res.status(400).json({ success: false, message: 'Invalid status.' });
      update.status = req.body.status;
    }
    if (req.body.adminNotes !== undefined) update.adminNotes = String(req.body.adminNotes);

    const submission = await FrontDeskSubmission.findByIdAndUpdate(
      req.params.id, { $set: update }, { new: true }
    ).lean();
    if (!submission)
      return res.status(404).json({ success: false, message: 'Submission not found.' });

    res.json({ success: true, message: 'Updated.', data: { submission } });
  } catch (e) {
    console.error('[frontdesk patch]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/frontdesk/:id   — admin
// ─────────────────────────────────────────────────────────
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const deleted = await FrontDeskSubmission.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    res.json({ success: true, message: 'Deleted.' });
  } catch (e) {
    console.error('[frontdesk delete]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/frontdesk/stats   — admin: market analysis
// Aggregate counts by type, status, country, programme,
// curriculum, source channel, and a 30-day daily trend.
// ─────────────────────────────────────────────────────────
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const all = await FrontDeskSubmission.find()
      .select('type status country programme curriculum heardFrom createdAt')
      .lean();

    const tally = (field) => {
      const m = {};
      all.forEach(s => {
        const v = (s[field] || 'Not specified').toString().trim() || 'Not specified';
        m[v] = (m[v] || 0) + 1;
      });
      return Object.entries(m)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);
    };

    // 30-day daily trend
    const days = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    all.forEach(s => {
      const key = new Date(s.createdAt).toISOString().slice(0, 10);
      if (key in days) days[key]++;
    });

    res.json({
      success: true,
      data: {
        total: all.length,
        byType:       tally('type'),
        byStatus:     tally('status'),
        byCountry:    tally('country'),
        byProgramme:  tally('programme'),
        byCurriculum: tally('curriculum'),
        bySource:     tally('heardFrom'),
        trend: Object.entries(days).map(([date, count]) => ({ date, count })),
      },
    });
  } catch (e) {
    console.error('[frontdesk stats]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
