/**
 * lib/bounceScanner.js — read the delivery-failure notices in the school
 * inbox, stop mailing the addresses they name, and file the notices away.
 *
 * Gmail accepts mail for a dead address and reports the failure later, as
 * a "Delivery Status Notification (Failure)" from mailer-daemon in the
 * sending mailbox (EMAIL_USER). Without this, every reminder, timetable
 * and report to that address produced another notice in the inbox.
 *
 * Every BOUNCE_SCAN_MINUTES (default 30) it signs in to the mailbox over
 * IMAP with the same EMAIL_USER / EMAIL_PASSWORD the app sends with,
 * finds failure notices from the last few days that are still in the
 * inbox, suppresses their failed recipients (lib/mailSuppression.js), and
 * moves each processed notice out of the inbox under the label
 * "Smartious/Bounces" (Gmail), so nothing is deleted.
 *
 * Settings: BOUNCE_SCAN=off to disable; BOUNCE_IMAP_HOST (default
 * imap.gmail.com, or derived from EMAIL_HOST smtp.x → imap.x);
 * BOUNCE_LABEL to rename the label.
 */
const { connect, imapDate } = require('./imapLite')
const { bouncedRecipients, suppress } = require('./mailSuppression')

const DAYS = 7
const MAX_PER_RUN = 100

function imapHost() {
  if (process.env.BOUNCE_IMAP_HOST) return process.env.BOUNCE_IMAP_HOST
  const smtp = String(process.env.EMAIL_HOST || 'smtp.gmail.com')
  return /^smtp\./i.test(smtp) ? smtp.replace(/^smtp\./i, 'imap.') : 'imap.gmail.com'
}

/** One pass. Returns { notices, suppressed: [addresses], filed }. */
async function scanBounces({ now = new Date(), connectFn = connect, host = imapHost(), port, secure } = {}) {
  const user = process.env.EMAIL_USER, pass = process.env.EMAIL_PASSWORD
  if (!user || !pass) return { notices: 0, suppressed: [], filed: 0, skipped: 'no mailbox credentials' }
  const label = process.env.BOUNCE_LABEL || 'Smartious/Bounces'
  const own = [user, process.env.EMAIL_BCC, process.env.EMAIL_REPLY_TO, (String(process.env.EMAIL_FROM || '').match(/[^\s<>]+@[^\s<>]+/) || [])[0]].filter(Boolean)

  const c = await connectFn({ host, port, secure, user, pass })
  const result = { notices: 0, suppressed: [], filed: 0 }
  try {
    const cap = await c.cmd('CAPABILITY')
    const gmail = cap.lines.some(l => /X-GM-EXT-1/i.test(l))
    await c.login()
    await c.cmd('SELECT INBOX')
    const since = imapDate(new Date(now.getTime() - DAYS * 86400000))
    const found = await c.cmd(`UID SEARCH SINCE ${since} OR FROM "mailer-daemon" FROM "postmaster"`)
    const uids = found.lines.filter(l => /^\* SEARCH/i.test(l)).flatMap(l => l.replace(/^\* SEARCH/i, '').trim().split(/\s+/)).filter(Boolean).slice(-MAX_PER_RUN)
    if (gmail && uids.length) { try { await c.cmd('CREATE ' + c.quote(label)) } catch { /* exists */ } }

    for (const uid of uids) {
      const r = await c.cmd(`UID FETCH ${uid} (BODY.PEEK[]<0.60000>)`)
      const text = r.literals.join('\n')
      // Only failure notices; a "delayed" warning is not a bounce yet.
      if (!/delivery status notification \(failure\)|undeliverable|delivery has failed|address not found|failure notice|returned mail|Action:\s*failed/i.test(text)) continue
      if (/Action:\s*delayed/i.test(text) && !/Action:\s*failed/i.test(text)) continue
      result.notices++
      const addrs = bouncedRecipients(text, { own })
      if (addrs.length) {
        const why = (text.match(/Diagnostic-Code:[^\n]*/i) || text.match(/(?:because|The response (?:from the remote server )?was:)[^\n]*/i) || [''])[0]
        result.suppressed.push(...await suppress(addrs, 'bounce', why.trim()))
      }
      // File the notice out of the inbox (labelled, not deleted).
      if (gmail) {
        await c.cmd(`UID STORE ${uid} +X-GM-LABELS (${c.quote(label)})`)
        await c.cmd(`UID STORE ${uid} -X-GM-LABELS (\\Inbox)`)
        result.filed++
      }
    }
  } finally {
    await c.logout()
  }
  result.suppressed = [...new Set(result.suppressed)]
  return result
}

let timer = null
function startBounceScanner() {
  if (String(process.env.BOUNCE_SCAN || '').toLowerCase() === 'off') { console.log('[bounces] scanner off (BOUNCE_SCAN=off)'); return }
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || timer) return
  const every = Math.max(5, Number(process.env.BOUNCE_SCAN_MINUTES) || 30) * 60 * 1000
  const run = () => scanBounces()
    .then(r => { if (r.notices) console.log(`[bounces] ${r.notices} failure notice(s): suppressed ${r.suppressed.join(', ') || 'none new'}; ${r.filed} filed out of the inbox`) })
    .catch(e => console.error('[bounces] scan failed:', e.message))
  setTimeout(run, 60 * 1000)
  timer = setInterval(run, every)
  console.log(`[bounces] scanner on, every ${every / 60000} min (${imapHost()})`)
}

module.exports = { scanBounces, startBounceScanner, imapHost }
