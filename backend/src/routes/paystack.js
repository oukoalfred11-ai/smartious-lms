/**
 * paystack.js — quick card payments, separate from the invoice system.
 *
 * POST /api/paystack/request   { email, amount, currency, payerName, description }
 *   → creates a Paystack checkout link, emails the parent a branded
 *     Pay Now button, records the request. Returns the link so the
 *     admin can also share it on WhatsApp.
 *
 * GET  /api/paystack/requests  → recent requests with status.
 * GET  /api/paystack/verify/:reference
 *   → asks Paystack for the truth and updates the record. Safe to
 *     call any time; money status always comes from Paystack, never
 *     from the client.
 *
 * Env: PAYSTACK_SECRET_KEY (sk_live_... or sk_test_...).
 * Currencies must be enabled on the Paystack account to be usable.
 */
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { auth } = require('../middleware/auth');
const PaystackRequest = require('../models/PaystackRequest');

const PAYSTACK = 'https://api.paystack.co';
const KEY = () => process.env.PAYSTACK_SECRET_KEY;

const ALLOWED = (req, res, next) => {
  const role = req.user?.role;
  if (['admin', 'superadmin', 'accounts', 'frontdesk'].includes(role)) return next();
  return res.status(403).json({ success: false, message: 'Not allowed.' });
};

const fmtAmount = (amount, currency) =>
  currency + ' ' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

// ── Create a payment request ──────────────────────────────
router.post('/request', auth, ALLOWED, async (req, res) => {
  try {
    if (!KEY()) return res.status(500).json({ success: false, message: 'PAYSTACK_SECRET_KEY is not set on the server.' });

    const { email, amount, currency = 'KES', payerName = '', description = 'School fees' } = req.body || {};
    const amt = Number(amount);
    if (!email || !/.+@.+\..+/.test(String(email))) return res.status(400).json({ success: false, message: 'A valid email is required.' });
    if (!amt || amt <= 0) return res.status(400).json({ success: false, message: 'Amount must be greater than zero.' });

    const reference = 'SMT-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const initRes = await fetch(PAYSTACK + '/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + KEY(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: String(email).trim().toLowerCase(),
        amount: Math.round(amt * 100),           // lowest currency unit
        currency,
        reference,
        metadata: {
          payerName, description,
          custom_fields: [
            { display_name: 'For', variable_name: 'description', value: description },
            { display_name: 'Payer', variable_name: 'payer', value: payerName || email },
          ],
        },
      }),
    });
    const init = await initRes.json();
    if (!init.status || !init.data?.authorization_url) {
      return res.status(502).json({ success: false, message: 'Paystack: ' + (init.message || 'could not create the payment link.') });
    }

    const reqDoc = await PaystackRequest.create({
      payerName, email: String(email).trim().toLowerCase(),
      amount: amt, currency, description,
      reference, authorizationUrl: init.data.authorization_url,
      createdBy: req.user?._id || null,
    });

    // Email the parent their Pay Now button. Fire and forget; the
    // admin still gets the link either way. mailPolicy adds the
    // outbox copy automatically.
    ;(async () => {
      try {
        const nodemailer = require('nodemailer');
        const t = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587', 10),
          secure: parseInt(process.env.EMAIL_PORT || '587', 10) === 465,
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
        });
        await t.sendMail({
          from: process.env.EMAIL_FROM || 'Smartious Homeschool <hello@smartioushomeschool.com>',
          to: reqDoc.email,
          replyTo: 'accounts@smartioushomeschool.com',
          subject: 'Payment request from Smartious Homeschool \u2014 ' + fmtAmount(amt, currency),
          html: `
<div style="font-family:Georgia,'Times New Roman',serif;max-width:560px;margin:0 auto;border:1px solid #E7E1D4;border-radius:12px;overflow:hidden">
  <div style="background:#8B1A2E;padding:22px 28px">
    <div style="color:#fff;font-size:20px;font-weight:700">Smart<span style="color:#C9973A;font-style:italic">ious</span></div>
    <div style="color:#F3D9A4;font-size:10px;letter-spacing:3px">HOMESCHOOL</div>
  </div>
  <div style="padding:28px;background:#FDFAF4">
    <p style="font-size:15px;color:#080C14;margin:0 0 14px">Dear ${payerName || 'Parent'},</p>
    <p style="font-size:14px;color:#2E3D55;line-height:1.7;margin:0 0 18px">
      This is a secure payment request from Smartious Homeschool for
      <strong>${description}</strong>.
    </p>
    <div style="background:#fff;border:1px solid #E7E1D4;border-radius:10px;padding:18px 22px;margin-bottom:22px">
      <div style="font-size:12px;color:#5A5A62;margin-bottom:4px">Amount due</div>
      <div style="font-size:26px;color:#8B1A2E;font-weight:700">${fmtAmount(amt, currency)}</div>
      <div style="font-size:11.5px;color:#5A5A62;margin-top:6px">Reference: ${reference}</div>
    </div>
    <a href="${init.data.authorization_url}"
       style="display:block;text-align:center;background:#8B1A2E;color:#fff;text-decoration:none;padding:14px 20px;border-radius:9px;font-size:15px;font-weight:700">
      Pay Now by Card
    </a>
    <p style="font-size:12px;color:#5A5A62;line-height:1.6;margin:18px 0 0">
      Payment is processed securely by Paystack. Visa, Mastercard and other methods enabled on our account are accepted. If you have any question, simply reply to this email and our accounts team will assist you.
    </p>
  </div>
  <div style="background:#F1EADA;padding:14px 28px;font-size:11px;color:#5A5A62">
    Smartious Homeschool \u00b7 smartioushomeschool.com \u00b7 accounts@smartioushomeschool.com \u00b7 WhatsApp +254 745 021 212
  </div>
</div>`,
        });
      } catch (e) { console.error('[paystack] request email failed:', e.message); }
    })();

    return res.json({ success: true, data: { request: reqDoc } });
  } catch (e) {
    console.error('[paystack/request]', e);
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ── Recent requests ───────────────────────────────────────
router.get('/requests', auth, ALLOWED, async (req, res) => {
  try {
    const rows = await PaystackRequest.find({}).sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ success: true, data: { requests: rows } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ── Verify against Paystack (the source of truth) ─────────
router.get('/verify/:reference', auth, ALLOWED, async (req, res) => {
  try {
    if (!KEY()) return res.status(500).json({ success: false, message: 'PAYSTACK_SECRET_KEY is not set on the server.' });
    const doc = await PaystackRequest.findOne({ reference: req.params.reference });
    if (!doc) return res.status(404).json({ success: false, message: 'Request not found.' });

    const vRes = await fetch(PAYSTACK + '/transaction/verify/' + encodeURIComponent(doc.reference), {
      headers: { Authorization: 'Bearer ' + KEY() },
    });
    const v = await vRes.json();
    const d = v?.data;
    if (v.status && d) {
      const map = { success: 'paid', failed: 'failed', abandoned: 'abandoned' };
      const newStatus = map[d.status] || 'pending';
      const wasPaid = doc.status === 'paid';
      doc.status = newStatus;
      doc.channel = d.channel || doc.channel;
      doc.gatewayResponse = d.gateway_response || doc.gatewayResponse;
      if (newStatus === 'paid' && d.paid_at) doc.paidAt = new Date(d.paid_at);
      await doc.save();

      // First confirmation of payment: tell accounts once.
      if (newStatus === 'paid' && !wasPaid) {
        ;(async () => {
          try {
            const nodemailer = require('nodemailer');
            const t = nodemailer.createTransport({
              host: process.env.EMAIL_HOST || 'smtp.gmail.com',
              port: parseInt(process.env.EMAIL_PORT || '587', 10),
              secure: false,
              auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
            });
            await t.sendMail({
              from: process.env.EMAIL_FROM || 'Smartious Homeschool <hello@smartioushomeschool.com>',
              to: 'accounts@smartioushomeschool.com',
              subject: 'PAID \u2014 ' + fmtAmount(doc.amount, doc.currency) + ' from ' + (doc.payerName || doc.email),
              text: 'Card payment received.\n\nPayer: ' + (doc.payerName || '') + '\nEmail: ' + doc.email +
                '\nAmount: ' + fmtAmount(doc.amount, doc.currency) + '\nFor: ' + doc.description +
                '\nReference: ' + doc.reference + '\nChannel: ' + doc.channel + '\nPaid at: ' + doc.paidAt,
            });
          } catch (e) { console.error('[paystack] paid notice failed:', e.message); }
        })();
      }
    }
    return res.json({ success: true, data: { request: doc } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
