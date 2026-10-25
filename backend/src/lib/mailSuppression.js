/**
 * lib/mailSuppression.js — stop mailing addresses that bounce.
 *
 * A wrong or dead address used to receive every reminder, timetable and
 * report like any other, and each one came back to the school inbox as a
 * "Delivery Status Notification (Failure)". Class reminders also retried a
 * failed send every minute until the class began.
 *
 * Addresses are suppressed (models/MailSuppression.js) when:
 *   - the mail server refuses them while sending (a permanent 5xx reply,
 *     or listed in the send result's `rejected`), here via mailPolicy.js;
 *   - a bounce notice for them arrives in the school inbox
 *     (lib/bounceScanner.js reads it);
 *   - staff add them by hand.
 * lib/mailPolicy.js then drops suppressed addresses from every mail.
 */
const MailSuppression = { get m() { return require('../models/MailSuppression') } }

const EMAIL_RE = /[A-Za-z0-9._%+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const clean = (e) => String(e || '').trim().toLowerCase().replace(/^<|>$/g, '')

/** A permanent delivery failure (5xx), as opposed to a temporary one worth retrying. */
function isPermanentError(err) {
  if (!err) return false
  const code = Number(err.responseCode)
  if (code >= 500 && code < 600) return true
  return /\b5\.\d\.\d+\b|recipient (address )?rejected|user unknown|no such user|does not exist|invalid (recipient|address|mailbox)|mailbox unavailable|address not found/i
    .test(String(err.response || err.message || ''))
}

/** Addresses a failed send or a partial result names as refused. */
function rejectedAddresses(errOrResult, options = {}) {
  const out = new Set()
  for (const a of errOrResult?.rejected || []) out.add(clean(typeof a === 'object' ? a.address : a))
  for (const e of errOrResult?.rejectedErrors || []) if (e && e.recipient) out.add(clean(e.recipient))
  // A whole-message permanent failure for a single recipient names that recipient.
  if (!out.size && errOrResult instanceof Error && isPermanentError(errOrResult)) {
    const to = String(options.to || '').split(',').map(clean).filter(Boolean)
    if (to.length === 1) out.add(to[0])
  }
  return [...out].filter(a => a.includes('@'))
}

/**
 * The failed recipients in a bounce notice (RFC 3464 delivery status
 * report or Gmail's plain-text "Address not found" notice). Our own
 * addresses and the mailer daemon are never returned.
 */
function bouncedRecipients(text, { own = [] } = {}) {
  const t = String(text || '')
  const mine = new Set(own.map(clean))
  const skip = (a) => !a || mine.has(a) || /mailer-daemon|postmaster|noreply|no-reply/i.test(a)
  const found = new Set()
  // 1. The machine-readable part: Final-Recipient / Original-Recipient.
  for (const m of t.matchAll(/(?:Final|Original)-Recipient:\s*rfc822;\s*<?([^\s>;]+)>?/gi)) found.add(clean(m[1]))
  // 2. Gmail's notice: "Your message wasn't delivered to x@y because …".
  if (!found.size) for (const m of t.matchAll(/(?:wasn[’']t delivered to|could not be delivered to|delivery to the following recipients? failed[^\n]*\n)\s*<?([A-Za-z0-9._%+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/gi)) found.add(clean(m[1]))
  // 3. The X-Failed-Recipients header some servers add.
  for (const m of t.matchAll(/X-Failed-Recipients:\s*([^\n]+)/gi)) for (const a of m[1].match(EMAIL_RE) || []) found.add(clean(a))
  return [...found].filter(a => a.includes('@') && !skip(a))
}

/** Record suppressions (idempotent: a repeat failure bumps count and lastAt). */
async function suppress(addresses, reason = 'bounce', detail = '') {
  // Never the school's own addresses (sender, outbox copy, reply-to).
  const own = new Set([process.env.EMAIL_USER, process.env.EMAIL_BCC, process.env.EMAIL_REPLY_TO].map(clean).filter(Boolean))
  const list = [...new Set((addresses || []).map(clean).filter(a => a.includes('@') && !own.has(a)))]
  const now = new Date()
  for (const email of list) {
    await MailSuppression.m.updateOne(
      { email },
      { $setOnInsert: { email, reason, firstAt: now }, $set: { lastAt: now, detail: String(detail || '').slice(0, 300) }, $inc: { count: 1 } },
      { upsert: true },
    )
  }
  if (list.length) { cache.clear(); console.log(`[mail] suppressed ${list.join(', ')} (${reason})`) }
  return list
}

// Short cache: mailPolicy asks for every mail; suppressions change rarely.
const cache = new Map()
const TTL = 60 * 1000
async function suppressedSet(addresses) {
  const list = [...new Set((addresses || []).map(clean).filter(Boolean))]
  if (!list.length) return new Set()
  const now = Date.now(), out = new Set(), ask = []
  for (const a of list) {
    const c = cache.get(a)
    if (c && now - c.at < TTL) { if (c.hit) out.add(a) } else ask.push(a)
  }
  if (ask.length) {
    const hits = new Set((await MailSuppression.m.find({ email: { $in: ask } }).select('email').lean()).map(d => d.email))
    for (const a of ask) { cache.set(a, { at: now, hit: hits.has(a) }); if (hits.has(a)) out.add(a) }
  }
  return out
}

module.exports = { isPermanentError, rejectedAddresses, bouncedRecipients, suppress, suppressedSet, _cache: cache }
