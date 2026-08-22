/**
 * mailPolicy.js — one place where every outgoing email gets the
 * school's reply address and a permanent outbox copy.
 *
 * The backend creates nodemailer transporters in eight different
 * files (welcome, exams, invoices, homework, reports, and more).
 * Patching each send site would drift the moment a ninth appears,
 * so instead this module wraps nodemailer.createTransport ONCE at
 * process start. Every transporter created anywhere afterwards
 * sends through the same policy:
 *
 *   EMAIL_REPLY_TO  — set on every mail that has no replyTo of its
 *                     own, so when a parent replies to any system
 *                     email (exam notice, invoice, report), the
 *                     conversation lands in the school's real inbox.
 *
 *   EMAIL_BCC       — appended to every mail, so a copy of every
 *                     single system email is delivered to a real
 *                     mailbox (e.g. outbox@smartioushomeschool.com,
 *                     an alias on hello@). That mailbox becomes a
 *                     permanent, searchable outbox for the school,
 *                     regardless of which SMTP service is underneath
 *                     now or in the future.
 *
 * Both are optional: leave the env vars unset and behaviour is
 * exactly as before. Require this module FIRST in src/index.js,
 * before anything that might create a transporter.
 */
const nodemailer = require('nodemailer');

const original = nodemailer.createTransport.bind(nodemailer);

nodemailer.createTransport = function patchedCreateTransport(...args) {
  const transporter = original(...args);
  const send = transporter.sendMail.bind(transporter);

  transporter.sendMail = (options = {}, callback) => {
    const out = { ...options };

    const replyTo = process.env.EMAIL_REPLY_TO;
    if (replyTo && !out.replyTo) out.replyTo = replyTo;

    const bcc = process.env.EMAIL_BCC;
    if (bcc) {
      const existing = out.bcc
        ? (Array.isArray(out.bcc) ? out.bcc : [out.bcc])
        : [];
      // Never double-add if a caller already BCCs the outbox.
      if (!existing.some(a => String(a).toLowerCase().includes(bcc.toLowerCase()))) {
        out.bcc = [...existing, bcc];
      }
    }

    return send(out, callback);
  };

  return transporter;
};

console.log('[mailPolicy] active \u2014 replyTo: %s, bcc: %s',
  process.env.EMAIL_REPLY_TO || '(unset)',
  process.env.EMAIL_BCC || '(unset)');
