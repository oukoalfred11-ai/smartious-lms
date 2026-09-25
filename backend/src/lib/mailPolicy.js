/**
 * mailPolicy.js — one place where every outgoing email gets the
 * school's reply address, a permanent outbox copy, and the
 * recipient gate.
 *
 * The backend creates nodemailer transporters in many different
 * files (welcome, exams, invoices, homework, reports, and more).
 * Patching each send site would drift the moment a new one appears,
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
 *   RECIPIENT GATE  — no system email reaches an archived account,
 *                     a paused (on break) student, or a deactivated
 *                     student or parent, whichever of the many send
 *                     sites produced it. Recipients are resolved
 *                     against the User collection at send time; the
 *                     blocked ones are dropped, and a mail with no
 *                     one left is skipped entirely (logged, and the
 *                     caller receives a resolved skip result, never
 *                     an error). A send may carry
 *                     smartiousBypassGate: true to pass anyway;
 *                     the exit and reinstatement notices use it,
 *                     since those are addressed to just-archived
 *                     people by design. If the database cannot be
 *                     consulted, mail passes: a gate fault must
 *                     never stop operational email.
 *
 * All optional: leave the env vars unset and replyTo/bcc behave
 * exactly as before. Require this module FIRST in src/index.js,
 * before anything that might create a transporter.
 */
const nodemailer = require('nodemailer');

// ── Recipient helpers (exported for tests) ──────────────────────

/** "a@x, b@y" | {address} | mixed arrays → lowercased address list */
function normalizeAddresses(field) {
  if (!field) return [];
  const items = Array.isArray(field) ? field : [field];
  const out = [];
  for (const item of items) {
    if (!item) continue;
    if (typeof item === 'object' && item.address) {
      out.push(String(item.address).trim().toLowerCase());
    } else {
      String(item).split(',').forEach(part => {
        const a = part.trim().toLowerCase();
        if (a) out.push(a);
      });
    }
  }
  return out;
}

/** The gate's one rule. userDoc has role, archived, onBreak, isActive. */
function isBlockedUser(u) {
  if (!u) return false;                       // unknown address: not ours to block
  if (u.archived === true) return true;       // archived, any role
  if (u.role === 'student' && u.onBreak === true) return true;   // paused
  if ((u.role === 'student' || u.role === 'parent') && u.isActive === false) return true;
  return false;
}

/** Remove blocked addresses from a to/cc field, keeping its shape simple. */
function filterField(field, blockedSet) {
  const kept = normalizeAddresses(field).filter(a => !blockedSet.has(a));
  return kept;
}

async function blockedAddressSet(addresses) {
  if (!addresses.length) return new Set();
  let mongoose;
  try { mongoose = require('mongoose'); } catch { return new Set(); }
  if (!mongoose.connection || mongoose.connection.readyState !== 1) return new Set();
  let User;
  try { User = mongoose.model('User'); } catch { return new Set(); }
  const docs = await User.find({ email: { $in: addresses } })
    .select('email role archived onBreak isActive')
    .lean();
  const blocked = new Set();
  for (const d of docs) {
    if (isBlockedUser(d)) blocked.add(String(d.email).trim().toLowerCase());
  }
  return blocked;
}

// ── The transport patch ─────────────────────────────────────────

const original = nodemailer.createTransport.bind(nodemailer);

nodemailer.createTransport = function patchedCreateTransport(...args) {
  const transporter = original(...args);
  const send = transporter.sendMail.bind(transporter);

  transporter.sendMail = (options = {}, callback) => {
    const run = async () => {
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

      // ── Recipient gate ──
      const bypass = out.smartiousBypassGate === true;
      delete out.smartiousBypassGate;
      if (!bypass) {
        try {
          const toAddrs = normalizeAddresses(out.to);
          const ccAddrs = normalizeAddresses(out.cc);
          const blocked = await blockedAddressSet([...new Set([...toAddrs, ...ccAddrs])]);
          if (blocked.size) {
            const keptTo = filterField(out.to, blocked);
            const keptCc = filterField(out.cc, blocked);
            console.log('[mailPolicy] gate dropped: ' + [...blocked].join(', ')
              + ' (archived, paused or deactivated) from "' + (out.subject || 'no subject') + '"');
            if (!keptTo.length) {
              // No one left: skip the send entirely, succeed quietly.
              return { accepted: [], rejected: [], messageId: 'skipped-by-recipient-gate', gateSkipped: true };
            }
            out.to = keptTo.join(', ');
            if (out.cc !== undefined) out.cc = keptCc.length ? keptCc.join(', ') : undefined;
          }
        } catch (e) {
          // A gate fault never stops operational mail.
          console.error('[mailPolicy] gate check failed, sending anyway:', e.message);
        }
      }

      return send(out);
    };

    if (typeof callback === 'function') {
      run().then(r => callback(null, r)).catch(err => callback(err));
      return;
    }
    return run();
  };

  return transporter;
};

console.log('[mailPolicy] active — replyTo: %s, bcc: %s, recipient gate: on',
  process.env.EMAIL_REPLY_TO || '(unset)',
  process.env.EMAIL_BCC || '(unset)');

module.exports = { normalizeAddresses, isBlockedUser, filterField };
