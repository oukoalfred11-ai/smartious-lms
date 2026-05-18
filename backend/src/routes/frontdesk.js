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

// ─────────────────────────────────────────────────────────
// POST /api/frontdesk/:id/email   — admin: email a lead
// Body: { subject, body, template, attachments: [{name,url}] }
// Sends one branded email to the lead's address and logs it.
// ─────────────────────────────────────────────────────────
router.post('/:id/email', auth, requireRole('admin'), async (req, res) => {
  try {
    const { subject, body, template = 'custom', attachments = [] } = req.body;

    if (!subject || !subject.trim())
      return res.status(400).json({ success: false, message: 'Subject is required.' });
    if (!body || !body.trim())
      return res.status(400).json({ success: false, message: 'Message body is required.' });

    const lead = await FrontDeskSubmission.findById(req.params.id);
    if (!lead)
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    if (!lead.email)
      return res.status(400).json({ success: false, message: 'This lead has no email address.' });

    // sendCommunityEmail is the single branded-email worker
    let sendCommunityEmail = null;
    try {
      ({ sendCommunityEmail } = require('../services/emailService'));
    } catch (e) {
      return res.status(503).json({ success: false, message: 'Email service unavailable.' });
    }

    const mailAttachments = (Array.isArray(attachments) ? attachments : [])
      .filter(a => a && a.url)
      .map(a => ({ filename: a.name || 'attachment', path: a.url }));

    const senderName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim()
      || 'Smartious Admissions';

    const result = await sendCommunityEmail({
      to: lead.email,
      recipientName: lead.name || lead.email,
      subject: subject.trim(),
      bodyText: body,
      senderName,
      attachments: mailAttachments,
    });

    // Log the email on the lead, regardless of delivery outcome
    lead.emailsSent.push({
      template,
      subject: subject.trim(),
      sentBy: senderName,
      sentAt: new Date(),
      delivered: !!result.success,
    });
    // Sending an email is contact — nudge a 'new' lead to 'contacted'
    if (lead.status === 'new') lead.status = 'contacted';
    await lead.save();

    if (!result.success) {
      return res.status(502).json({
        success: false,
        message: 'Email could not be delivered: ' + (result.error || 'unknown error'),
      });
    }

    res.json({
      success: true,
      message: 'Email sent to ' + lead.email,
      data: { status: lead.status, emailsSent: lead.emailsSent },
    });
  } catch (e) {
    console.error('[frontdesk email]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/frontdesk/:id/import   — admin
// Convert a registration lead into a real Student account plus
// a linked Parent account. Auto-generates temp passwords and
// emails welcome credentials to both. Marks the lead converted
// and records the created user ids so it cannot be re-imported.
// ─────────────────────────────────────────────────────────
router.post('/:id/import', auth, requireRole('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    let sendWelcomeEmail = null;
    try { ({ sendWelcomeEmail } = require('../lib/email')); }
    catch (e) { console.error('[frontdesk import] welcome email helper unavailable —', e.message); }

    const lead = await FrontDeskSubmission.findById(req.params.id);
    if (!lead)
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    if (lead.type !== 'registration')
      return res.status(400).json({ success: false, message: 'Only registration leads can be imported.' });
    if (lead.importedUserId)
      return res.status(409).json({ success: false, message: 'This lead has already been imported.' });

    // ── Resolve student name ──
    // Lead stores the student name; fall back to the contact name.
    const studentFirst = (lead.studentFirstName || lead.name || '').trim().split(/\s+/)[0] || 'Student';
    const studentLast  = (lead.studentLastName  || lead.name || '').trim().split(/\s+/).slice(1).join(' ') || studentFirst;

    // Student needs its own email. A registration lead usually
    // only has the PARENT email — so derive a placeholder student
    // login email from it unless a distinct one was provided.
    const parentEmail = (lead.email || '').trim().toLowerCase();
    if (!parentEmail)
      return res.status(400).json({ success: false, message: 'Lead has no email — cannot create accounts.' });

    let studentEmail = (req.body.studentEmail || '').trim().toLowerCase();
    if (!studentEmail) {
      // e.g. parent@gmail.com → parent+student@gmail.com
      const [local, domain] = parentEmail.split('@');
      studentEmail = domain ? `${local}+student@${domain}` : parentEmail;
    }

    // Guard against colliding with existing accounts
    const existingStudent = await User.findOne({ email: studentEmail });
    if (existingStudent)
      return res.status(409).json({
        success: false,
        message: `A user with email ${studentEmail} already exists. Provide a different student email.`,
      });

    // ── Create the STUDENT account ──
    const studentTempPw = User.generateTempPassword();
    const student = await User.create({
      firstName: studentFirst,
      lastName: studentLast,
      email: studentEmail,
      password: studentTempPw,
      role: 'student',
      isActive: true,
      mustChangePassword: true,
      plan: 'Basic',
      subjects: [],
      curriculum: lead.curriculum || '',
      programme: lead.programme || '',
      country: lead.country || '',
      dateOfBirth: lead.studentDob || undefined,
      phone: lead.phone || '',
    });

    // ── Create the linked PARENT account ──
    // Reuse an existing parent with this email if there is one.
    let parent = await User.findOne({ email: parentEmail, role: 'parent' });
    let parentTempPw = null;
    let parentCreated = false;
    if (!parent) {
      const parentFirst = (lead.name || 'Parent').trim().split(/\s+/)[0] || 'Parent';
      const parentLast  = (lead.name || '').trim().split(/\s+/).slice(1).join(' ') || parentFirst;
      parentTempPw = User.generateTempPassword();
      parent = await User.create({
        firstName: parentFirst,
        lastName: parentLast,
        email: parentEmail,
        password: parentTempPw,
        role: 'parent',
        isActive: true,
        mustChangePassword: true,
        plan: 'Basic',
        phone: lead.phone || '',
        country: lead.country || '',
      });
      parentCreated = true;
    }

    // ── Link parent ⇄ student both ways ──
    await User.findByIdAndUpdate(student._id, {
      $addToSet: { linkedParents: parent._id },
      $set: { parentId: parent._id },
    });
    await User.findByIdAndUpdate(parent._id, {
      $addToSet: { linkedStudents: student._id },
    });

    // ── Welcome emails (best-effort) ──
    const loginUrl = (process.env.FRONTEND_URL || 'https://smartioushomeschool.com') + '/login';
    const emailReport = { student: false, parent: false };
    if (sendWelcomeEmail) {
      try {
        const r = await sendWelcomeEmail({
          to: student.email, name: `${student.firstName} ${student.lastName}`.trim(),
          role: 'student', username: student.email, tempPassword: studentTempPw,
          admissionNumber: student.admissionNumber || null, loginUrl,
        });
        emailReport.student = !!r.success;
      } catch (e) { console.error('[frontdesk import] student email failed:', e.message); }

      if (parentCreated) {
        try {
          const r = await sendWelcomeEmail({
            to: parent.email, name: `${parent.firstName} ${parent.lastName}`.trim(),
            role: 'parent', username: parent.email, tempPassword: parentTempPw,
            admissionNumber: null, loginUrl,
          });
          emailReport.parent = !!r.success;
        } catch (e) { console.error('[frontdesk import] parent email failed:', e.message); }
      }
    }

    // ── Mark the lead converted + record the import ──
    lead.status = 'converted';
    lead.importedUserId = student._id;
    lead.importedParentId = parent._id;
    lead.importedAt = new Date();
    await lead.save();

    res.json({
      success: true,
      message: `Imported ${student.firstName} ${student.lastName} as a student`
        + (parentCreated ? ' with a linked parent account.' : ' (linked to existing parent).'),
      data: {
        studentId: student._id,
        studentEmail: student.email,
        admissionNumber: student.admissionNumber || null,
        parentId: parent._id,
        parentCreated,
        emails: emailReport,
      },
    });
  } catch (e) {
    console.error('[frontdesk import]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
