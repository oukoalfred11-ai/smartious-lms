/**
 * routes/assessment.js
 * ============================================================
 * Public-facing assessment request endpoint.
 * Mounted at /api/assessment
 *
 * POST /request
 *   - validates the payload from AssessmentForm.jsx
 *   - persists an AssessmentRequest document with
 *     status='awaiting_review' (no payment collected here)
 *   - sends two emails in parallel:
 *       A. admin notification → hellosmartious@gmail.com
 *       B. parent confirmation → form.parent1Email
 *   - rate limited to 5 submissions / IP / hour
 *
 * Returns { ok: true, requestRef } on success,
 *         { ok: false, error } on failure.
 */

const express   = require('express');
const router    = express.Router();
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const AssessmentRequest = require('../models/AssessmentRequest');
const { auth, requireRole } = require('../middleware/auth');
const axios = require('axios');

// ── Paystack ──────────────────────────────────────────────────
const PS_BASE    = 'https://api.paystack.co';
const psHeaders  = () => ({ Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' });
// Assessment fee in KES (multiply by 100 for kobo/pesewas).
// Paystack Kenya uses KES; change currency below if needed.
const ASSESSMENT_AMOUNT_KES  = 5800;
const ASSESSMENT_AMOUNT_KOBO = ASSESSMENT_AMOUNT_KES * 100;
// Callback URL Paystack redirects to after payment
const paystackCallbackUrl = () =>
  `${(process.env.CLIENT_URL || 'https://smartioushomeschool.com').replace(/\/$/, '')}/assessment/payment-callback`;

// ─────────────────────────────────────────────────────────
// Rate limiter — 5 submissions per IP per hour
// ─────────────────────────────────────────────────────────
const assessmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many assessment requests from this device. Please try again in an hour, or email hellosmartious@gmail.com directly.' },
});

// ─────────────────────────────────────────────────────────
// Email transporter — reuses the same Gmail SMTP convention
// as lib/email.js (EMAIL_HOST / EMAIL_USER / EMAIL_PASSWORD).
// Kept local to this file rather than importing lib/email.js
// directly so this route has zero dependency on its internals;
// if lib/email.js changes shape later this route is unaffected.
// ─────────────────────────────────────────────────────────
let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  if (!user || !pass) {
    console.error('[assessment] EMAIL_USER / EMAIL_PASSWORD not set — emails will not send');
    return null;
  }
  transporter = nodemailer.createTransport({
    host, port, secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

const ADMIN_NOTIFY_EMAIL = 'hellosmartious@gmail.com';
const ASSESSMENT_FEE_USD = 45;
const ASSESSMENT_FEE_KES = 5800;

// Admin panel review URL pattern — adjust to match the real
// Admin Portal route once that page exists. Uses requestRef as
// the lookup key so the link works regardless of Mongo _id format.
const adminReviewUrl = (requestRef) =>
  `https://smartioushomeschool.com/admin/assessment-requests/${encodeURIComponent(requestRef)}`;

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());

// Generate a short reference like 'A-12847'. Retries on the rare
// collision (unique index also guards this at the DB level).
async function generateRequestRef() {
  for (let i = 0; i < 5; i++) {
    const ref = 'A-' + Math.floor(10000 + Math.random() * 90000);
    const exists = await AssessmentRequest.exists({ requestRef: ref });
    if (!exists) return ref;
  }
  // Fallback — timestamp-based, astronomically unlikely to collide
  return 'A-' + Date.now().toString().slice(-6);
}

// Server-side validation mirroring AssessmentForm.jsx's validate()
function validatePayload(body) {
  const errors = {};

  if (!body.studentFirstName?.trim()) errors.studentFirstName = 'Required';
  if (!body.studentLastName?.trim())  errors.studentLastName  = 'Required';
  if (!body.studentDOB)               errors.studentDOB       = 'Required';
  if (!body.studentGrade)             errors.studentGrade     = 'Required';

  if (!body.parent1FirstName?.trim()) errors.parent1FirstName = 'Required';
  if (!body.parent1LastName?.trim())  errors.parent1LastName  = 'Required';
  if (!body.parent1Relationship)      errors.parent1Relationship = 'Required';

  if (!body.parent1Email?.trim())          errors.parent1Email = 'Required';
  else if (!isValidEmail(body.parent1Email)) errors.parent1Email = 'Invalid email';

  if (!body.parent1Phone?.trim())     errors.parent1Phone = 'Required';
  if (!body.preferredContact)         errors.preferredContact = 'Required';
  if (!body.countryIso)               errors.countryIso = 'Required';
  if (!body.city?.trim())             errors.city = 'Required';

  if (!Array.isArray(body.curriculumInterest) || body.curriculumInterest.length === 0)
    errors.curriculumInterest = 'Select at least one';

  if (body.feeAcknowledged !== true)
    errors.feeAcknowledged = 'Required to proceed';

  // Optional-but-if-present email validations
  if (body.studentEmail && !isValidEmail(body.studentEmail))
    errors.studentEmail = 'Invalid email';
  if (body.hasParent2 && body.parent2Email && !isValidEmail(body.parent2Email))
    errors.parent2Email = 'Invalid email';

  return errors;
}

// ═══════════════════════════════════════════════════════════
// EMAIL A — Admin notification
// ═══════════════════════════════════════════════════════════
function buildAdminEmailHTML(reqDoc) {
  const r = reqDoc;
  const fullName = `${r.studentFirstName} ${r.studentLastName}`;
  const countryLabel = r.countryIso === 'OTHER' ? 'Other (remote)' : r.countryIso;

  const row = (label, value) =>
    value ? `<tr>
      <td style="padding:8px 14px;font-size:12px;color:#6b6b6b;font-weight:700;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;vertical-align:top;border-bottom:1px solid #f0e8e8;">${label}</td>
      <td style="padding:8px 14px;font-size:13.5px;color:#1a1a1a;border-bottom:1px solid #f0e8e8;">${value}</td>
    </tr>` : '';

  const sectionHeader = (label) =>
    `<tr><td colspan="2" style="padding:18px 14px 6px;font-size:11px;color:#8B1A2E;font-weight:800;text-transform:uppercase;letter-spacing:.08em;">${label}</td></tr>`;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#080C14;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(139,26,46,.1);">

        <tr><td style="background:linear-gradient(135deg,#8B1A2E 0%,#6E1424 100%);padding:26px 30px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#C9973A;margin-bottom:6px;">New Assessment Request</div>
          <div style="font-family:Georgia,serif;font-size:22px;color:#fff;">${fullName}</div>
          <div style="font-size:13px;color:rgba(255,255,255,.8);margin-top:4px;">${countryLabel} · Ref: ${r.requestRef}</div>
        </td></tr>

        <tr><td style="padding:24px 24px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${sectionHeader('Student')}
            ${row('Name', fullName)}
            ${row('Date of birth', r.studentDOB)}
            ${row('Grade level', r.studentGrade)}
            ${row('Current school', r.currentSchool)}
            ${row('Student email', r.studentEmail)}
            ${row('Home language(s)', r.studentLanguages)}
            ${row('Learning needs', r.learningNeeds)}

            ${sectionHeader('Parent / Guardian')}
            ${row('Name', `${r.parent1FirstName} ${r.parent1LastName} (${r.parent1Relationship})`)}
            ${row('Email', `<a href="mailto:${r.parent1Email}" style="color:#8B1A2E;">${r.parent1Email}</a>`)}
            ${row('Phone', r.parent1Phone)}
            ${row('Preferred contact', r.preferredContact)}
            ${row('Preferred time', r.preferredContactTime)}
            ${r.hasParent2 ? row('Second parent', `${r.parent2FirstName} ${r.parent2LastName} (${r.parent2Relationship}) — ${r.parent2Email || ''} ${r.parent2Phone || ''}`) : ''}

            ${sectionHeader('Location')}
            ${row('Country', countryLabel)}
            ${row('State / Province', r.stateProvince)}
            ${row('City', r.city)}
            ${row('Timezone', r.timezone)}

            ${sectionHeader('Academic')}
            ${row('Curriculum interest', (r.curriculumInterest || []).join('; '))}
            ${row('Target university', (r.targetUniversity || []).join('; '))}
            ${row('Why considering Smartious', (r.whyConsidering || []).join('; '))}
            ${row('Preferred schedule', r.preferredSchedule)}

            ${sectionHeader('Additional')}
            ${row('How they heard about us', r.howDidYouHear)}
            ${row('Additional info', r.additionalInfo)}
          </table>
        </td></tr>

        <tr><td style="padding:8px 24px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding-top:14px;">
              <a href="${adminReviewUrl(r.requestRef)}" style="display:inline-block;background:#8B1A2E;color:#fff;padding:13px 30px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">Review in Admin Portal</a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="background:#FDFAF4;padding:16px 24px;border-top:1px solid #f0e8e8;">
          <p style="font-size:11px;color:#999;margin:0;">Submitted ${new Date(r.createdAt || Date.now()).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })} EAT · ${r.submittedIp || ''}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildAdminEmailText(r) {
  const fullName = `${r.studentFirstName} ${r.studentLastName}`;
  const lines = [
    `New assessment request — ${fullName} (Ref: ${r.requestRef})`,
    '',
    '--- STUDENT ---',
    `Name: ${fullName}`,
    `DOB: ${r.studentDOB}`,
    `Grade: ${r.studentGrade}`,
    `Current school: ${r.currentSchool || '—'}`,
    `Learning needs: ${r.learningNeeds || '—'}`,
    '',
    '--- PARENT ---',
    `${r.parent1FirstName} ${r.parent1LastName} (${r.parent1Relationship})`,
    `Email: ${r.parent1Email}`,
    `Phone: ${r.parent1Phone}`,
    `Preferred contact: ${r.preferredContact}`,
    '',
    '--- LOCATION ---',
    `${r.city}, ${r.stateProvince || ''} ${r.countryIso}`.trim(),
    `Timezone: ${r.timezone || '—'}`,
    '',
    '--- ACADEMIC ---',
    `Curriculum interest: ${(r.curriculumInterest || []).join('; ')}`,
    `Why considering Smartious: ${(r.whyConsidering || []).join('; ')}`,
    '',
    `Review: ${adminReviewUrl(r.requestRef)}`,
  ];
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════
// EMAIL B — Parent confirmation
// ═══════════════════════════════════════════════════════════
function buildParentEmailHTML(r) {
  const studentFirst = r.studentFirstName;
  const parentFirst  = r.parent1FirstName;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#080C14;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(139,26,46,.08);">

        <tr><td style="background:linear-gradient(135deg,#8B1A2E 0%,#6E1424 100%);padding:32px 36px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#C9973A;margin-bottom:8px;">Request Received</div>
          <div style="font-family:Georgia,serif;font-size:26px;color:#fff;line-height:1.25;">Thank you, ${parentFirst}.</div>
          <div style="font-size:13px;color:rgba(255,255,255,.8);margin-top:8px;">Reference: ${r.requestRef}</div>
        </td></tr>

        <tr><td style="padding:32px 36px;">
          <p style="font-size:15px;line-height:1.65;color:#2c2c2c;margin:0 0 22px;">
            We've received your assessment request for <strong>${studentFirst}</strong>. Our Head of Admissions will review the request and respond to this email address within <strong>three business days</strong>, regardless of decision.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;border-left:4px solid #C9973A;border-radius:6px;padding:18px 22px;margin-bottom:26px;">
            <tr><td>
              <div style="font-size:11px;color:#C9973A;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;">What happens next</div>
              <ol style="margin:0;padding-left:18px;font-size:13.5px;line-height:1.85;color:#1a1a1a;">
                <li>Confirmation email (this one) acknowledging receipt of your request</li>
                <li>Admissions decision within three business days — one of three outcomes:
                  <ul style="margin:6px 0;padding-left:18px;color:#52616B;font-size:12.5px;">
                    <li><strong style="color:#1a1a1a;">Accepted</strong> — you'll receive an invoice for the USD ${ASSESSMENT_FEE_USD} (approx KES ${ASSESSMENT_FEE_KES.toLocaleString()}) assessment fee. The diagnostic is scheduled once payment is received. This fee is credited against your first month's tuition if you proceed to enrolment.</li>
                    <li><strong style="color:#1a1a1a;">More information requested</strong> — we may ask clarifying questions before deciding.</li>
                    <li><strong style="color:#1a1a1a;">Not a current fit</strong> — we'll explain why and recommend better-suited alternatives where we can.</li>
                  </ul>
                </li>
                <li>If accepted and the fee is paid: a structured diagnostic across English, Mathematics and Science (approximately 90 minutes)</li>
                <li>A written report with subject-specific recommendations, plus a 30-minute consultation with our Head of Academics</li>
                <li>A curriculum pathway recommendation and, where results indicate fit, a formal enrolment offer</li>
              </ol>
            </td></tr>
          </table>

          <p style="font-size:13px;line-height:1.65;color:#6b6b6b;margin:0 0 4px;">Please keep your reference number for any follow-up correspondence:</p>
          <p style="font-size:18px;font-family:'JetBrains Mono',monospace;color:#8B1A2E;font-weight:700;margin:0 0 26px;">${r.requestRef}</p>

          <p style="font-size:13.5px;line-height:1.65;color:#2c2c2c;margin:0;">
            Warm regards,<br>
            <strong>Alfred Ouko</strong><br>
            Founder &amp; Head of Academics<br>
            Smartious Homeschool and eSchool
          </p>
        </td></tr>

        <tr><td style="background:#FDFAF4;padding:22px 36px;border-top:1px solid #f0e8e8;">
          <p style="font-size:12px;line-height:1.55;color:#6b6b6b;margin:0 0 8px;">Questions in the meantime? Reply to this email or contact <a href="mailto:hellosmartious@gmail.com" style="color:#8B1A2E;">hellosmartious@gmail.com</a>.</p>
          <p style="font-size:11px;color:#999;margin:0;">© ${new Date().getFullYear()} Smartious Homeschool and eSchool · Nairobi, Kenya · <a href="https://smartioushomeschool.com" style="color:#999;">smartioushomeschool.com</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildParentEmailText(r) {
  const lines = [
    `Thank you, ${r.parent1FirstName}.`,
    '',
    `We've received your assessment request for ${r.studentFirstName}. Our Head of Admissions will review the request and respond within three business days, regardless of decision.`,
    '',
    'WHAT HAPPENS NEXT',
    '1. Confirmation email (this one)',
    '2. Admissions decision within three business days:',
    `   - Accepted: invoice for USD ${ASSESSMENT_FEE_USD} (approx KES ${ASSESSMENT_FEE_KES.toLocaleString()}) assessment fee, credited against first month's tuition on enrolment`,
    '   - More information requested: clarifying questions before deciding',
    '   - Not a current fit: explanation and alternative recommendations',
    '3. If accepted: structured diagnostic (English, Mathematics, Science — approx 90 minutes)',
    '4. Written report plus 30-minute consultation with our Head of Academics',
    '5. Curriculum pathway recommendation and enrolment offer where results indicate fit',
    '',
    `Your reference number: ${r.requestRef}`,
    '',
    'Warm regards,',
    'Alfred Ouko',
    'Founder & Head of Academics',
    'Smartious Homeschool and eSchool',
    '',
    'Questions? Reply to this email or contact hellosmartious@gmail.com',
  ];
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════
// POST /request
// ═══════════════════════════════════════════════════════════
router.post('/request', assessmentLimiter, async (req, res) => {
  try {
    const body = req.body || {};

    // ── Validate ──────────────────────────────────────────
    const errors = validatePayload(body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ ok: false, error: 'Validation failed', fieldErrors: errors });
    }

    // ── Generate reference and persist ───────────────────
    const requestRef = await generateRequestRef();

    const doc = await AssessmentRequest.create({
      studentFirstName: body.studentFirstName.trim(),
      studentLastName:  body.studentLastName.trim(),
      studentDOB:       body.studentDOB,
      studentGrade:     body.studentGrade,
      currentSchool:    (body.currentSchool || '').trim(),
      studentEmail:     (body.studentEmail || '').trim(),
      studentLanguages: (body.studentLanguages || '').trim(),
      learningNeeds:    (body.learningNeeds || '').trim(),

      parent1FirstName:    body.parent1FirstName.trim(),
      parent1LastName:     body.parent1LastName.trim(),
      parent1Relationship: body.parent1Relationship,
      parent1Email:        body.parent1Email.trim().toLowerCase(),
      parent1Phone:        body.parent1Phone.trim(),

      hasParent2:          !!body.hasParent2,
      parent2FirstName:    (body.parent2FirstName || '').trim(),
      parent2LastName:     (body.parent2LastName || '').trim(),
      parent2Relationship: body.parent2Relationship || '',
      parent2Email:        (body.parent2Email || '').trim().toLowerCase(),
      parent2Phone:        (body.parent2Phone || '').trim(),

      preferredContact:     body.preferredContact,
      preferredContactTime: (body.preferredContactTime || '').trim(),

      countryIso:    body.countryIso,
      stateProvince: (body.stateProvince || '').trim(),
      city:          body.city.trim(),
      timezone:      (body.timezone || '').trim(),

      curriculumInterest: Array.isArray(body.curriculumInterest) ? body.curriculumInterest : [],
      targetUniversity:   Array.isArray(body.targetUniversity) ? body.targetUniversity : [],
      whyConsidering:      Array.isArray(body.whyConsidering) ? body.whyConsidering : [],
      preferredSchedule:  (body.preferredSchedule || '').trim(),

      howDidYouHear:  body.howDidYouHear || '',
      additionalInfo: (body.additionalInfo || '').trim(),

      feeAcknowledged: body.feeAcknowledged === true,

      status: 'awaiting_review',
      requestRef,

      submittedIp:        req.ip || req.headers['x-forwarded-for'] || '',
      submittedUserAgent: req.headers['user-agent'] || '',
    });

    console.log('[assessment] new request created:', requestRef, '—', doc.studentFirstName, doc.studentLastName);

    // ── Send both emails in parallel ─────────────────────
    const t = getTransporter();
    const from = process.env.EMAIL_FROM || 'Smartious E-School <hellosmartious@gmail.com>';

    const emailResults = await Promise.allSettled([
      t ? t.sendMail({
        from,
        to: ADMIN_NOTIFY_EMAIL,
        subject: `New assessment request — ${doc.studentFirstName} ${doc.studentLastName} (${doc.countryIso})`,
        html: buildAdminEmailHTML(doc),
        text: buildAdminEmailText(doc),
      }) : Promise.reject(new Error('No transporter configured')),

      t ? t.sendMail({
        from,
        to: doc.parent1Email,
        subject: `Your Smartious assessment request — ${doc.studentFirstName} ${doc.studentLastName}`,
        html: buildParentEmailHTML(doc),
        text: buildParentEmailText(doc),
      }) : Promise.reject(new Error('No transporter configured')),
    ]);

    emailResults.forEach((result, i) => {
      const label = i === 0 ? 'admin notification' : 'parent confirmation';
      if (result.status === 'rejected') {
        console.error(`[assessment] Failed to send ${label} email for ${requestRef}:`, result.reason?.message || result.reason);
      } else {
        console.log(`[assessment] Sent ${label} email for ${requestRef}`);
      }
    });

    // Request succeeds even if email sending fails — the record
    // is saved either way. Email failures are logged, not surfaced
    // to the family (they'd just retry and create a duplicate).
    return res.json({ ok: true, requestRef });

  } catch (err) {
    console.error('[assessment request]', err.message);

    if (err.code === 11000) {
      // Extremely rare requestRef collision — ask the client to retry
      return res.status(500).json({ ok: false, error: 'Could not generate a unique reference. Please try submitting again.' });
    }

    return res.status(500).json({ ok: false, error: 'Something went wrong while submitting your request. Please try again or email hellosmartious@gmail.com directly.' });
  }
});


// ═══════════════════════════════════════════════════════════
// EMAIL C — "More information requested" notice to parent
// ═══════════════════════════════════════════════════════════
function buildInfoRequestedHTML(r, message) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#080C14;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(139,26,46,.08);">
        <tr><td style="background:linear-gradient(135deg,#8B1A2E 0%,#6E1424 100%);padding:32px 36px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#C9973A;margin-bottom:8px;">A Quick Follow-Up</div>
          <div style="font-family:Georgia,serif;font-size:24px;color:#fff;line-height:1.25;">We need a little more information</div>
          <div style="font-size:13px;color:rgba(255,255,255,.8);margin-top:8px;">Reference: ${r.requestRef}</div>
        </td></tr>
        <tr><td style="padding:32px 36px;">
          <p style="font-size:15px;line-height:1.65;color:#2c2c2c;margin:0 0 18px;">
            Dear ${r.parent1FirstName},
          </p>
          <p style="font-size:14.5px;line-height:1.7;color:#2c2c2c;margin:0 0 18px;">
            Thank you for your assessment request for ${r.studentFirstName}. Before our Head of Admissions can make a decision, we'd like to ask:
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;border-left:4px solid #C9973A;border-radius:6px;padding:18px 22px;margin-bottom:24px;">
            <tr><td style="font-size:14px;line-height:1.7;color:#1a1a1a;white-space:pre-line;">${message || 'Please reply to this email with any additional details about your enquiry.'}</td></tr>
          </table>
          <p style="font-size:14px;line-height:1.65;color:#2c2c2c;margin:0 0 22px;">
            Simply reply to this email with the requested information and we'll continue the review right away.
          </p>
          <p style="font-size:13.5px;line-height:1.65;color:#2c2c2c;margin:0;">
            Warm regards,<br><strong>Alfred Ouko</strong><br>Founder &amp; Head of Academics<br>Smartious Homeschool and eSchool
          </p>
        </td></tr>
        <tr><td style="background:#FDFAF4;padding:22px 36px;border-top:1px solid #f0e8e8;">
          <p style="font-size:11px;color:#999;margin:0;">© ${new Date().getFullYear()} Smartious Homeschool and eSchool · smartioushomeschool.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildInfoRequestedText(r, message) {
  return [
    `Dear ${r.parent1FirstName},`,
    '',
    `Thank you for your assessment request for ${r.studentFirstName}. Before our Head of Admissions can make a decision, we'd like to ask:`,
    '',
    message || 'Please reply to this email with any additional details about your enquiry.',
    '',
    "Simply reply to this email with the requested information and we'll continue the review right away.",
    '',
    'Warm regards,',
    'Alfred Ouko',
    'Founder & Head of Academics',
    'Smartious Homeschool and eSchool',
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════
// EMAIL D — "Declined" notice to parent
// ═══════════════════════════════════════════════════════════
function buildDeclinedHTML(r, message) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#080C14;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(139,26,46,.08);">
        <tr><td style="background:linear-gradient(135deg,#52616B 0%,#3B454D 100%);padding:32px 36px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#C9973A;margin-bottom:8px;">Assessment Request Update</div>
          <div style="font-family:Georgia,serif;font-size:24px;color:#fff;line-height:1.25;">Thank you for your interest in Smartious</div>
          <div style="font-size:13px;color:rgba(255,255,255,.8);margin-top:8px;">Reference: ${r.requestRef}</div>
        </td></tr>
        <tr><td style="padding:32px 36px;">
          <p style="font-size:15px;line-height:1.65;color:#2c2c2c;margin:0 0 18px;">
            Dear ${r.parent1FirstName},
          </p>
          <p style="font-size:14.5px;line-height:1.7;color:#2c2c2c;margin:0 0 18px;">
            Thank you for submitting an assessment request for ${r.studentFirstName}. After careful review, we don't believe we're the right fit at this time.
          </p>
          ${message ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;border-left:4px solid #C9973A;border-radius:6px;padding:18px 22px;margin-bottom:24px;">
            <tr><td style="font-size:14px;line-height:1.7;color:#1a1a1a;white-space:pre-line;">${message}</td></tr>
          </table>` : ''}
          <p style="font-size:14px;line-height:1.65;color:#2c2c2c;margin:0 0 22px;">
            We're grateful for the time you took to share details about ${r.studentFirstName}, and we wish your family all the best in finding the right educational fit.
          </p>
          <p style="font-size:13.5px;line-height:1.65;color:#2c2c2c;margin:0;">
            Warm regards,<br><strong>Alfred Ouko</strong><br>Founder &amp; Head of Academics<br>Smartious Homeschool and eSchool
          </p>
        </td></tr>
        <tr><td style="background:#FDFAF4;padding:22px 36px;border-top:1px solid #f0e8e8;">
          <p style="font-size:11px;color:#999;margin:0;">© ${new Date().getFullYear()} Smartious Homeschool and eSchool · smartioushomeschool.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildDeclinedText(r, message) {
  return [
    `Dear ${r.parent1FirstName},`,
    '',
    `Thank you for submitting an assessment request for ${r.studentFirstName}. After careful review, we don't believe we're the right fit at this time.`,
    '',
    message || '',
    '',
    `We're grateful for the time you took to share details about ${r.studentFirstName}, and we wish your family all the best in finding the right educational fit.`,
    '',
    'Warm regards,',
    'Alfred Ouko',
    'Founder & Head of Academics',
    'Smartious Homeschool and eSchool',
  ].filter(Boolean).join('\n');
}

// ═══════════════════════════════════════════════════════════
// EMAIL E — Acceptance + payment invoice to parent
// ═══════════════════════════════════════════════════════════
function buildAcceptedHTML(r, payUrl) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#080C14;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(139,26,46,.08);">
        <tr><td style="background:linear-gradient(135deg,#166534 0%,#14532D 100%);padding:32px 36px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#86EFAC;margin-bottom:8px;">Great news</div>
          <div style="font-family:Georgia,serif;font-size:26px;color:#fff;line-height:1.25;">Your request has been accepted</div>
          <div style="font-size:13px;color:rgba(255,255,255,.8);margin-top:8px;">Reference: ${r.requestRef}</div>
        </td></tr>
        <tr><td style="padding:32px 36px;">
          <p style="font-size:15px;line-height:1.65;color:#2c2c2c;margin:0 0 18px;">
            Dear ${r.parent1FirstName},
          </p>
          <p style="font-size:14.5px;line-height:1.7;color:#2c2c2c;margin:0 0 18px;">
            We're pleased to accept your assessment request for <strong>${r.studentFirstName}</strong>. To schedule the diagnostic assessment, please pay the assessment fee of <strong>KES ${ASSESSMENT_AMOUNT_KES.toLocaleString()}</strong> using the button below.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDF4;border-left:4px solid #166534;border-radius:6px;padding:16px 20px;margin-bottom:26px;">
            <tr><td>
              <div style="font-size:12px;color:#166534;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">What you're paying for</div>
              <ul style="margin:0;padding-left:18px;font-size:13.5px;line-height:1.8;color:#1a1a1a;">
                <li>Structured diagnostic across English, Mathematics and Science (~90 minutes)</li>
                <li>Detailed written report with subject-specific recommendations</li>
                <li>30-minute consultation with our Head of Academics</li>
                <li>Curriculum pathway recommendation</li>
              </ul>
              <p style="margin:12px 0 0;font-size:12.5px;color:#166534;font-weight:600;">
                This fee is credited against your first month's tuition if you proceed to enrolment.
              </p>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:26px;">
            <tr><td align="center">
              <a href="${payUrl}" style="display:inline-block;background:#166534;color:#fff;padding:16px 40px;border-radius:8px;text-decoration:none;font-weight:800;font-size:15px;letter-spacing:.01em;">
                Pay KES ${ASSESSMENT_AMOUNT_KES.toLocaleString()} — Secure Payment
              </a>
            </td></tr>
            <tr><td align="center" style="padding-top:10px;">
              <p style="font-size:11px;color:#9CA3AF;margin:0;">Powered by Paystack · Secure · Encrypted</p>
            </td></tr>
          </table>
          <p style="font-size:13px;line-height:1.6;color:#6B6B6B;margin:0 0 22px;">
            Once payment is confirmed, our Head of Admissions will contact you within one business day to schedule the assessment at a time that suits your timezone.
          </p>
          <p style="font-size:13.5px;line-height:1.65;color:#2c2c2c;margin:0;">
            Warm regards,<br><strong>Alfred Ouko</strong><br>Founder &amp; Head of Academics<br>Smartious Homeschool and eSchool
          </p>
        </td></tr>
        <tr><td style="background:#FDFAF4;padding:22px 36px;border-top:1px solid #f0e8e8;">
          <p style="font-size:11px;color:#999;margin:0;">Questions? Reply to this email or contact <a href="mailto:hellosmartious@gmail.com" style="color:#8B1A2E;">hellosmartious@gmail.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildAcceptedText(r, payUrl) {
  return [
    `Dear ${r.parent1FirstName},`,
    '',
    `Great news — we've accepted your assessment request for ${r.studentFirstName}.`,
    '',
    `To schedule the assessment, please pay the KES ${ASSESSMENT_AMOUNT_KES.toLocaleString()} assessment fee:`,
    payUrl,
    '',
    'This covers:',
    '- Structured diagnostic across English, Mathematics and Science (~90 minutes)',
    '- Detailed written report with subject-specific recommendations',
    '- 30-minute consultation with our Head of Academics',
    '',
    "The fee is credited against your first month's tuition on enrolment.",
    '',
    'Warm regards,',
    'Alfred Ouko',
    'Founder & Head of Academics',
    'Smartious Homeschool and eSchool',
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════
// GET /requests — list with filters + pagination (admin only)
// Query params: status, search, page (1-based), limit
// ═══════════════════════════════════════════════════════════
router.get('/requests', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status, search, page = 1, limit = 25 } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;

    if (search && String(search).trim()) {
      const term = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { studentFirstName: { $regex: term, $options: 'i' } },
        { studentLastName:  { $regex: term, $options: 'i' } },
        { parent1FirstName: { $regex: term, $options: 'i' } },
        { parent1LastName:  { $regex: term, $options: 'i' } },
        { parent1Email:     { $regex: term, $options: 'i' } },
        { requestRef:       { $regex: term, $options: 'i' } },
      ];
    }

    const pageNum  = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const skip     = (pageNum - 1) * limitNum;

    const [requests, total, statusCounts] = await Promise.all([
      AssessmentRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-submittedUserAgent')
        .lean(),
      AssessmentRequest.countDocuments(filter),
      AssessmentRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const counts = { awaiting_review: 0, info_requested: 0, accepted: 0, declined: 0 };
    statusCounts.forEach(c => { if (c._id in counts) counts[c._id] = c.count; });

    return res.json({
      ok: true,
      data: {
        requests,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        counts,
      },
    });
  } catch (err) {
    console.error('[assessment list]', err.message);
    return res.status(500).json({ ok: false, error: 'Failed to load requests.' });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /requests/:id — single request detail (admin only)
// ═══════════════════════════════════════════════════════════
router.get('/requests/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const doc = await AssessmentRequest.findById(req.params.id)
      .populate('reviewedBy', 'firstName lastName email')
      .lean();
    if (!doc) return res.status(404).json({ ok: false, error: 'Request not found.' });
    return res.json({ ok: true, data: { request: doc } });
  } catch (err) {
    console.error('[assessment get]', err.message);
    return res.status(500).json({ ok: false, error: 'Failed to load request.' });
  }
});

// ═══════════════════════════════════════════════════════════
// PATCH /requests/:id — update status / notes (admin only)
// Body: { status?, internalNotes?, message? }
//   status        — one of the four enum values
//   internalNotes — admin-only notes, always saved if provided
//   message       — optional custom text included in the
//                   "info_requested" or "declined" parent email
//
// Triggers a parent email automatically when status changes to
// 'info_requested' or 'declined'. 'accepted' does NOT send an
// email here — that's tied to the separate Paystack invoicing
// workflow which is out of scope for this endpoint.
// ═══════════════════════════════════════════════════════════
router.patch('/requests/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status, internalNotes, message } = req.body || {};
    const doc = await AssessmentRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, error: 'Request not found.' });

    const VALID_STATUSES = ['awaiting_review', 'info_requested', 'accepted', 'declined'];
    const statusChanged = status && status !== doc.status;

    if (status) {
      if (!VALID_STATUSES.includes(status))
        return res.status(400).json({ ok: false, error: 'Invalid status value.' });
      doc.status = status;
      doc.reviewedAt = new Date();
      doc.reviewedBy = req.user._id;
    }

    if (internalNotes !== undefined) {
      doc.internalNotes = String(internalNotes).trim();
    }

    await doc.save();

    // Fire appropriate email on status transition
    if (statusChanged) {
      const t = getTransporter();
      const from = process.env.EMAIL_FROM || 'Smartious E-School <hellosmartious@gmail.com>';

      if (status === 'accepted') {
        // ── Generate Paystack payment link ────────────────────
        try {
          const reference = `ASS-${doc.requestRef}-${Date.now()}`;
          const psRes = await axios.post(`${PS_BASE}/transaction/initialize`, {
            email:        doc.parent1Email,
            amount:       ASSESSMENT_AMOUNT_KOBO,
            currency:     'KES',
            reference,
            callback_url: paystackCallbackUrl(),
            metadata: {
              requestRef:       doc.requestRef,
              studentName:      `${doc.studentFirstName} ${doc.studentLastName}`,
              parentName:       `${doc.parent1FirstName} ${doc.parent1LastName}`,
              assessmentRequest: String(doc._id),
            },
          }, { headers: psHeaders() });

          const payUrl = psRes.data?.data?.authorization_url;
          if (!payUrl) throw new Error('No authorization_url from Paystack');

          // Save payment reference + link + bump status to payment_pending
          doc.paystackReference  = reference;
          doc.paystackAuthUrl    = payUrl;
          doc.paystackAmountKobo = ASSESSMENT_AMOUNT_KOBO;
          doc.status             = 'payment_pending';
          doc.invoiceSentAt      = new Date();
          await doc.save();

          if (t) {
            t.sendMail({
              from, to: doc.parent1Email,
              subject: `Your Smartious assessment request is accepted — pay to confirm — ${doc.requestRef}`,
              html: buildAcceptedHTML(doc, payUrl),
              text: buildAcceptedText(doc, payUrl),
            })
              .then(() => console.log(`[assessment] Sent acceptance+invoice email for ${doc.requestRef}`))
              .catch(e => console.error(`[assessment] Failed to send acceptance email for ${doc.requestRef}:`, e.message));
          }
          console.log(`[assessment] Paystack link created for ${doc.requestRef}: ${payUrl}`);
        } catch (psErr) {
          console.error(`[assessment] Paystack init failed for ${doc.requestRef}:`, psErr?.response?.data || psErr.message);
          // Don't fail the whole request — just log. Admin can retry.
          return res.status(502).json({ ok: false, error: 'Request accepted but could not generate payment link. Check PAYSTACK_SECRET_KEY env var and try again.' });
        }

      } else if (status === 'info_requested' || status === 'declined') {
        if (t) {
          const mail = status === 'info_requested'
            ? {
                from, to: doc.parent1Email,
                subject: `A quick follow-up on your Smartious assessment request — ${doc.requestRef}`,
                html: buildInfoRequestedHTML(doc, message),
                text: buildInfoRequestedText(doc, message),
              }
            : {
                from, to: doc.parent1Email,
                subject: `Update on your Smartious assessment request — ${doc.requestRef}`,
                html: buildDeclinedHTML(doc, message),
                text: buildDeclinedText(doc, message),
              };
          t.sendMail(mail)
            .then(() => console.log(`[assessment] Sent ${status} email for ${doc.requestRef}`))
            .catch(e => console.error(`[assessment] Failed to send ${status} email for ${doc.requestRef}:`, e.message));
        } else {
          console.error('[assessment] No transporter — could not send', status, 'email for', doc.requestRef);
        }
      }
    }

    return res.json({ ok: true, data: { request: doc } });
  } catch (err) {
    console.error('[assessment patch]', err.message);
    return res.status(500).json({ ok: false, error: 'Failed to update request.' });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /payment-callback
// Paystack redirects here after payment (success or failure).
// Public endpoint — no auth (parent is not a logged-in user).
// Verifies the transaction with Paystack API, updates status
// to 'payment_received', then redirects parent to a result page.
// ═══════════════════════════════════════════════════════════
router.get('/payment-callback', async (req, res) => {
  const { reference, trxref } = req.query;
  const ref = reference || trxref;

  const frontendBase = (process.env.CLIENT_URL || 'https://smartioushomeschool.com').replace(/\/$/, '');

  if (!ref) {
    return res.redirect(`${frontendBase}/assessment/payment-result?status=error&reason=missing_reference`);
  }

  try {
    // Verify with Paystack
    const { data: psData } = await axios.get(
      `${PS_BASE}/transaction/verify/${encodeURIComponent(ref)}`,
      { headers: psHeaders() }
    );

    const txn = psData?.data;
    const requestDoc = await AssessmentRequest.findOne({ paystackReference: ref });

    if (!requestDoc) {
      console.error('[assessment callback] No request found for reference:', ref);
      return res.redirect(`${frontendBase}/assessment/payment-result?status=error&reason=not_found`);
    }

    if (txn?.status === 'success') {
      requestDoc.status      = 'payment_received';
      requestDoc.paidAt      = new Date();
      requestDoc.paystackData = txn;
      await requestDoc.save();
      console.log(`[assessment] Payment received for ${requestDoc.requestRef}`);

      // Notify admin
      const t = getTransporter();
      const from = process.env.EMAIL_FROM || 'Smartious E-School <hellosmartious@gmail.com>';
      if (t) {
        t.sendMail({
          from,
          to: ADMIN_NOTIFY_EMAIL,
          subject: `Assessment fee paid — ${requestDoc.studentFirstName} ${requestDoc.studentLastName} (${requestDoc.requestRef})`,
          html: `<p>The assessment fee for <strong>${requestDoc.studentFirstName} ${requestDoc.studentLastName}</strong> (Ref: ${requestDoc.requestRef}) has been paid.<br>Amount: KES ${Math.round((txn.amount || 0) / 100).toLocaleString()}<br>Schedule the assessment now.</p>`,
          text: `Assessment fee paid — ${requestDoc.requestRef}\nAmount: KES ${Math.round((txn.amount || 0) / 100).toLocaleString()}\nSchedule the assessment now.`,
        }).catch(e => console.error('[assessment callback] admin notify email failed:', e.message));
      }

      return res.redirect(`${frontendBase}/assessment/payment-result?status=success&ref=${encodeURIComponent(requestDoc.requestRef)}&name=${encodeURIComponent(requestDoc.studentFirstName)}`);
    } else {
      requestDoc.paystackData = txn;
      await requestDoc.save();
      console.log(`[assessment] Payment not successful for ${requestDoc.requestRef}:`, txn?.status);
      return res.redirect(`${frontendBase}/assessment/payment-result?status=failed&ref=${encodeURIComponent(requestDoc.requestRef)}&payUrl=${encodeURIComponent(requestDoc.paystackAuthUrl || '')}`);
    }
  } catch (err) {
    console.error('[assessment callback] error:', err.message);
    return res.redirect(`${frontendBase}/assessment/payment-result?status=error&reason=${encodeURIComponent(err.message)}`);
  }
});

module.exports = router;
