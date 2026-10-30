/**
 * paystack.js — card payments by Paystack checkout link.
 *
 * POST /api/paystack/request   { email, amount, currency, payerName, description, invoiceId? }
 *   → creates a Paystack checkout link, emails the parent a branded
 *     Pay Now button, records the request. Returns the link so the
 *     admin can also share it on WhatsApp. With invoiceId, the link is
 *     tied to that invoice: email, currency, payer and (unless given)
 *     amount come from the invoice, and a confirmed payment marks the
 *     invoice paid via lib/markInvoicePaid.
 *
 * GET  /api/paystack/requests  → recent requests with status.
 * GET  /api/paystack/verify/:reference
 *   → asks Paystack for the truth and updates the record. Safe to
 *     call any time; money status always comes from Paystack, never
 *     from the client.
 *
 * POST /api/paystack/verify-pending             check every pending request with Paystack
 * POST /api/paystack/requests/:ref/mark-paid     { method, note, paidAt?, sendReceipt? } accounts/admin
 * GET  /api/paystack/requests/:ref/receipt.pdf   the receipt (paid requests)
 * POST /api/paystack/requests/:ref/receipt       { email? } email the receipt (again)
 * POST /api/paystack/webhook                     Paystack's charge.success (signed)
 *
 * A confirmed payment emails the payer a receipt: the linked invoice's
 * receipt when the invoice is marked paid, otherwise a receipt for the
 * payment itself (lib/paystackReceipt.js).
 *
 * Env: PAYSTACK_SECRET_KEY (sk_live_... or sk_test_...).
 * Currencies must be enabled on the Paystack account to be usable.
 */
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');
const PaystackRequest = require('../models/PaystackRequest');
const Invoice = require('../models/Invoice');
const { markInvoicePaid } = require('../lib/markInvoicePaid');
const { sendPaystackReceipt, receiptFor } = require('../lib/paystackReceipt');

const PAYSTACK_CURRENCIES = ['KES', 'USD', 'NGN', 'GHS', 'ZAR'];
const balanceOf = (inv) => Math.max(0, Number(inv.totalDue || 0) - Number(inv.paidAmount || 0));
const round2 = (n) => Math.round(Number(n || 0) * 100) / 100;

const PAYSTACK = 'https://api.paystack.co';
const KEY = () => process.env.PAYSTACK_SECRET_KEY;

const ALLOWED = (req, res, next) => {
  const role = req.user?.role;
  // 'accounts' was never a real role name (the system's role is
  // 'accountant'), so accounts staff were silently locked out.
  // Accounts and sales both send Paystack invoices now.
  if (['admin', 'superadmin', 'accounts', 'accountant', 'sales', 'frontdesk', 'ops_manager', 'dos'].includes(role)) return next();
  return res.status(403).json({ success: false, message: 'Not allowed.' });
};

const fmtAmount = (amount, currency) =>
  currency + ' ' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const OUTCOME_TEXT = {
  marked_paid: 'marked paid, receipt sent',
  already_paid: 'was already paid \u2014 check for a double payment',
  partial: 'part payment recorded, invoice left open for review',
  currency_mismatch: 'currency differs from the invoice \u2014 needs manual review',
  invoice_missing: 'linked invoice not found',
};

/**
 * Apply a confirmed Paystack payment to the invoice it is tied to.
 * Uses the amount and currency Paystack reports, not what was asked.
 *  - full balance covered  → markInvoicePaid (receipt, billing clock)
 *  - less than the balance → paidAmount increased, note added, invoice
 *    left open for the accounts team to review
 *  - currency differs / invoice already paid → note only, for review
 * Called once per request (after the atomic flip to paid).
 */
async function settleLinkedInvoice(doc, d) {
  const inv = await Invoice.findById(doc.invoiceId).lean();
  if (!inv) return 'invoice_missing';
  const cur = String(d.currency || doc.currency || '').toUpperCase();
  const received = round2(Number(d.amount || 0) / 100);
  const tag = (doc.manual ? `${doc.manualMethod} (marked paid by ${doc.markedPaidByName || 'staff'}: ${doc.manualNote}) for Paystack request ` : 'Paystack ') + `${doc.reference}: ${cur} ${received}`;
  const addNote = (text) => Invoice.updateOne({ _id: inv._id }, {
    $set: { paymentNote: [String(inv.paymentNote || '').trim(), text].filter(Boolean).join(' | ') },
  });

  if (inv.status === 'paid') {
    await addNote(`${tag} received after the invoice was already paid \u2014 review`);
    return 'already_paid';
  }
  if (cur !== inv.currency) {
    await addNote(`${tag} (invoice is ${inv.currency}) \u2014 review`);
    return 'currency_mismatch';
  }
  const total = round2(Number(inv.paidAmount || 0) + received);
  if (total + 0.005 >= round2(inv.totalDue)) {
    const { changed } = await markInvoicePaid(inv._id, {
      paidAmount: total,
      paidAt: doc.paidAt || new Date(),
      note: tag,
      source: doc.manual ? 'manual' : 'paystack',
      actorId: doc.manual ? doc.markedPaidBy : (doc.createdBy || null),
    });
    return changed ? 'marked_paid' : 'already_paid';
  }
  // Part payment: record the money, keep the invoice open.
  await Invoice.updateOne({ _id: inv._id, status: { $ne: 'paid' } }, {
    $inc: { paidAmount: received },
    $set: { paymentNote: [String(inv.paymentNote || '').trim(), `${tag} (part payment, balance ${inv.currency} ${round2(inv.totalDue - total)}) \u2014 review`].filter(Boolean).join(' | ') },
  });
  return 'partial';
}

// ── Create a payment request ──────────────────────────────
router.post('/request', auth, ALLOWED, async (req, res) => {
  try {
    if (!KEY()) return res.status(500).json({ success: false, message: 'PAYSTACK_SECRET_KEY is not set on the server.' });

    let { email, amount, currency = 'KES', payerName = '', description = 'School fees', invoiceId } = req.body || {};

    // Tied to an invoice: the invoice decides who pays, in what
    // currency, and (unless an amount is given) how much.
    let inv = null;
    if (invoiceId) {
      if (!mongoose.isValidObjectId(String(invoiceId))) return res.status(400).json({ success: false, message: 'Invalid invoice.' });
      inv = await Invoice.findById(invoiceId).lean();
      if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found.' });
      if (inv.status === 'paid') return res.status(400).json({ success: false, message: `Invoice ${inv.invoiceNo} is already paid.` });
      if (inv.status === 'cancelled') return res.status(400).json({ success: false, message: `Invoice ${inv.invoiceNo} is cancelled.` });
      if (!PAYSTACK_CURRENCIES.includes(inv.currency))
        return res.status(400).json({ success: false, message: `Invoice ${inv.invoiceNo} is in ${inv.currency}; card links support ${PAYSTACK_CURRENCIES.join(', ')} only.` });
      const balance = round2(balanceOf(inv));
      if (balance <= 0) return res.status(400).json({ success: false, message: `Invoice ${inv.invoiceNo} has no balance to pay.` });
      currency = inv.currency;
      email = String(email || '').trim() || inv.billedToEmail;
      payerName = String(payerName || '').trim() || inv.billedToName || '';
      if (!Number(amount)) amount = balance;
      if (!String(description || '').trim() || description === 'School fees')
        description = `Invoice ${inv.invoiceNo}` + (inv.studentName ? ` \u2014 ${inv.studentName}` : '');
    }
    if (!PAYSTACK_CURRENCIES.includes(currency)) return res.status(400).json({ success: false, message: 'Unsupported currency.' });

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
          ...(inv ? { invoiceNo: inv.invoiceNo } : {}),
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
      invoiceId: inv ? inv._id : null,
      invoiceNo: inv ? inv.invoiceNo : '',
      studentId: inv ? (inv.studentId || null) : null,
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

// ── Confirmation (shared by Check status, the webhook and Mark paid) ──

function paidNotice(paidDoc) {
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
        subject: 'PAID — ' + fmtAmount(paidDoc.amount, paidDoc.currency) + ' from ' + (paidDoc.payerName || paidDoc.email) + (paidDoc.manual ? ' (marked by hand)' : ''),
        text: (paidDoc.manual ? 'Payment marked paid by ' + (paidDoc.markedPaidByName || 'staff') + ' (' + paidDoc.manualMethod + '): ' + paidDoc.manualNote : 'Card payment received.') +
          '\n\nPayer: ' + (paidDoc.payerName || '') + '\nEmail: ' + paidDoc.email +
          '\nAmount: ' + fmtAmount(paidDoc.amount, paidDoc.currency) + '\nFor: ' + paidDoc.description +
          '\nReference: ' + paidDoc.reference + '\nChannel: ' + (paidDoc.channel || '') + '\nPaid at: ' + paidDoc.paidAt +
          (paidDoc.invoiceNo ? '\nInvoice: ' + paidDoc.invoiceNo + ' (' + (OUTCOME_TEXT[paidDoc.invoiceOutcome] || paidDoc.invoiceOutcome || 'not updated') + ')' : ''),
      });
    } catch (e) { console.error('[paystack] paid notice failed:', e.message); }
  })();
}

/**
 * After the one atomic flip to paid: settle the linked invoice (which
 * emails its own receipt), or email the payer a receipt for the payment
 * itself, and tell accounts. d: { amount (lowest unit), currency }.
 */
async function afterFirstPaid(doc, d, { sendReceipt = true } = {}) {
  if (doc.invoiceId) {
    try {
      const outcome = await settleLinkedInvoice(doc, d);
      doc = await PaystackRequest.findByIdAndUpdate(doc._id, { $set: { invoiceOutcome: outcome } }, { new: true });
    } catch (e) { console.error('[paystack] invoice settle failed:', doc.reference, e.message); }
  }
  // The invoice receipt goes out when the invoice is marked paid; any other
  // case (no invoice, part payment, mismatch) gets a receipt for this payment.
  if (sendReceipt && doc.invoiceOutcome !== 'marked_paid') {
    try { await sendPaystackReceipt(doc); doc = await PaystackRequest.findById(doc._id); }
    catch (e) { console.error('[paystack] receipt failed:', doc.reference, e.message); }
  } else if (doc.invoiceOutcome === 'marked_paid') {
    doc = await PaystackRequest.findByIdAndUpdate(doc._id, { $set: { receiptSentAt: new Date(), receiptSentTo: doc.email } }, { new: true });
  }
  paidNotice(doc);
  return doc;
}

/** Ask Paystack for the truth about one request and record it. */
async function syncWithPaystack(doc) {
  const vRes = await fetch(PAYSTACK + '/transaction/verify/' + encodeURIComponent(doc.reference), {
    headers: { Authorization: 'Bearer ' + KEY() },
  });
  const v = await vRes.json();
  const d = v?.data;
  if (!(v.status && d)) return { doc, paystackStatus: null };
  const map = { success: 'paid', failed: 'failed', abandoned: 'abandoned' };
  const newStatus = map[d.status] || 'pending';
  const fields = { channel: d.channel || doc.channel, gatewayResponse: d.gateway_response || doc.gatewayResponse };
  if (newStatus === 'paid') {
    // Atomic flip: two confirmations at once must not both count as the
    // first (double receipts, double notes).
    const flipped = await PaystackRequest.findOneAndUpdate(
      { _id: doc._id, status: { $ne: 'paid' } },
      { $set: { ...fields, status: 'paid', paidAt: d.paid_at ? new Date(d.paid_at) : new Date() } },
      { new: true }
    );
    doc = flipped ? await afterFirstPaid(flipped, d) : await PaystackRequest.findById(doc._id);
  } else if (doc.status !== 'paid') {
    // A confirmed payment is never downgraded.
    Object.assign(doc, fields, { status: newStatus });
    await doc.save();
  }
  return { doc, paystackStatus: d.status };
}

// ── Verify against Paystack (the source of truth) ─────────
router.get('/verify/:reference', auth, ALLOWED, async (req, res) => {
  try {
    if (!KEY()) return res.status(500).json({ success: false, message: 'PAYSTACK_SECRET_KEY is not set on the server.' });
    const doc = await PaystackRequest.findOne({ reference: req.params.reference });
    if (!doc) return res.status(404).json({ success: false, message: 'Request not found.' });
    const out = await syncWithPaystack(doc);
    return res.json({ success: true, data: { request: out.doc } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ── Check every pending request at once ───────────────────
router.post('/verify-pending', auth, ALLOWED, async (req, res) => {
  try {
    if (!KEY()) return res.status(500).json({ success: false, message: 'PAYSTACK_SECRET_KEY is not set on the server.' });
    const pending = await PaystackRequest.find({ status: 'pending', createdAt: { $gte: new Date(Date.now() - 90 * 864e5) } }).limit(60);
    let paid = 0;
    for (const doc of pending) {
      try { const out = await syncWithPaystack(doc); if (out.doc.status === 'paid') paid++; } catch (e) { console.error('[paystack] verify-pending', doc.reference, e.message); }
    }
    return res.json({ success: true, data: { checked: pending.length, paid } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── Mark paid by hand ─────────────────────────────────────
// For money that reached us another way (bank transfer, M-Pesa, cash)
// against a card request, or a payment Paystack shows but this record
// missed. Paystack is asked first: if it confirms the payment, that is
// recorded as a normal card payment. Accounts and admin only.
const CAN_MARK = ['admin', 'superadmin', 'accountant', 'accounts'];
router.post('/requests/:reference/mark-paid', auth, async (req, res) => {
  try {
    if (!CAN_MARK.includes(req.user?.role)) return res.status(403).json({ success: false, message: 'Only accounts or an admin can mark a payment paid.' });
    const doc = await PaystackRequest.findOne({ reference: req.params.reference });
    if (!doc) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (doc.status === 'paid') return res.status(400).json({ success: false, message: 'This request is already paid.' });
    const method = String(req.body?.method || '').trim().slice(0, 60);
    const note = String(req.body?.note || '').trim().slice(0, 300);
    if (!method) return res.status(400).json({ success: false, message: 'Choose how the money was paid.' });
    if (!note) return res.status(400).json({ success: false, message: 'Add a note: the transaction or bank reference, or why it is being marked paid.' });
    const paidAt = req.body?.paidAt && !isNaN(new Date(req.body.paidAt)) ? new Date(req.body.paidAt) : new Date();
    if (paidAt > new Date(Date.now() + 864e5)) return res.status(400).json({ success: false, message: 'The payment date cannot be in the future.' });

    // Paystack first: a real card payment is recorded as one.
    if (KEY()) {
      try {
        const out = await syncWithPaystack(doc);
        if (out.doc.status === 'paid') return res.json({ success: true, message: 'Paystack confirms this payment; recorded as a card payment.', data: { request: out.doc } });
      } catch (e) { console.error('[paystack] mark-paid verify', e.message); }
    }
    const who = [req.user.firstName, req.user.lastName].filter(Boolean).join(' ') || req.user.email || '';
    const flipped = await PaystackRequest.findOneAndUpdate(
      { _id: doc._id, status: { $ne: 'paid' } },
      { $set: { status: 'paid', paidAt, manual: true, manualMethod: method, manualNote: note, channel: method, markedPaidBy: req.user._id, markedPaidByName: who } },
      { new: true }
    );
    if (!flipped) return res.status(409).json({ success: false, message: 'This request was just marked paid.' });
    const out = await afterFirstPaid(flipped, { amount: Math.round(Number(flipped.amount) * 100), currency: flipped.currency }, { sendReceipt: req.body?.sendReceipt !== false });
    return res.json({ success: true, message: 'Marked paid.' + (out.receiptSentAt ? ' Receipt sent to ' + out.receiptSentTo + '.' : ''), data: { request: out } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

// ── Receipts ──────────────────────────────────────────────
router.get('/requests/:reference/receipt.pdf', auth, ALLOWED, async (req, res) => {
  try {
    const doc = await PaystackRequest.findOne({ reference: req.params.reference }).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (doc.status !== 'paid') return res.status(400).json({ success: false, message: 'A receipt is only available once the payment is paid.' });
    const { buildReceiptPdfBuffer } = require('../lib/invoicePdf');
    const { inv, receiptNo } = await receiptFor(doc);
    const pdf = await buildReceiptPdfBuffer(inv, receiptNo);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', (req.query.download ? 'attachment' : 'inline') + '; filename="' + receiptNo + '.pdf"');
    return res.send(pdf);
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
});

router.post('/requests/:reference/receipt', auth, ALLOWED, async (req, res) => {
  try {
    const doc = await PaystackRequest.findOne({ reference: req.params.reference }).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Request not found.' });
    const out = await sendPaystackReceipt(doc, { to: req.body?.email });
    return res.json({ success: true, message: `Receipt ${out.receiptNo} sent to ${out.to}.`, data: { request: await PaystackRequest.findById(doc._id).lean() } });
  } catch (e) { return res.status(400).json({ success: false, message: e.message }); }
});

// ── Webhook: Paystack tells us the moment a payment succeeds ──
// Set https://<api>/api/paystack/webhook as the webhook URL in the
// Paystack dashboard. Signed with the secret key (x-paystack-signature,
// HMAC-SHA512 of the raw body); the payment is then re-checked with
// Paystack before anything is recorded.
router.post('/webhook', async (req, res) => {
  try {
    if (!KEY() || !req.rawBody) return res.sendStatus(400);
    const sig = crypto.createHmac('sha512', KEY()).update(req.rawBody).digest('hex');
    const given = String(req.headers['x-paystack-signature'] || '');
    if (sig.length !== given.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(given))) return res.sendStatus(401);
    res.sendStatus(200);   // acknowledge at once; Paystack retries slow endpoints
    const ev = req.body || {};
    if (ev.event !== 'charge.success' || !ev.data?.reference) return;
    const doc = await PaystackRequest.findOne({ reference: ev.data.reference });
    if (doc && doc.status !== 'paid') await syncWithPaystack(doc);
  } catch (e) {
    console.error('[paystack webhook]', e.message);
    if (!res.headersSent) res.sendStatus(500);
  }
});

module.exports = router;
