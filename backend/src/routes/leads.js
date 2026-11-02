/**
 * routes/leads.js — every lead in one place, converted or not, and email
 * campaigns to the families who have not enrolled. Mounted at /api/leads.
 *
 * Staff (admin, sales; the CRM stays out of the Dean & Operations portal):
 *   GET  /                     ?converted=yes|no|all &source=all|assessment|inquiry
 *                              &stage= &country= &from= &to= &q= &page=   → leads + counts
 *   GET  /export.csv           same filters
 *   GET  /templates            the campaign templates
 *   POST /preview              { template, subject, message }        → { subject, html }
 *   POST /send                 { template, subject, message, filters, ids?, test? }
 *        test: emails the sender only. Otherwise a campaign to the matching
 *        NOT-converted leads, one email per address, skipping addresses that
 *        unsubscribed, bounced, or were emailed by a campaign in the last
 *        `cooldownDays` (default 7). Sends in the background, about one a
 *        second; poll the campaign for progress.
 *   GET  /campaigns, /campaigns/:id
 *
 * Public:
 *   GET  /unsubscribe?e=&t=    stops campaign emails to that address (signed link)
 */
const express = require('express')
const crypto = require('crypto')
const rateLimit = require('express-rate-limit')
const { auth, requireRole } = require('../middleware/auth')
const { loadLeads, filterLeads, ASSESSMENT_STAGES, INQUIRY_STAGES, norm } = require('../lib/leads')
const { TEMPLATES, renderLeadEmail } = require('../lib/leadEmails')

const router = express.Router()
const STAFF = requireRole('admin', 'sales')
const MAX_PER_CAMPAIGN = 600
const GAP_MS = 1100
const Campaign = () => require('../models/LeadCampaign')
const OptOut = () => require('../models/MarketingOptOut')
const fail = (res, code, message) => res.status(code).json({ success: false, message })
const ORIGIN = () => (process.env.CLIENT_URL || 'https://smartioushomeschool.com').replace(/\/$/, '')

const unsubToken = (email) => crypto.createHmac('sha256', process.env.JWT_SECRET || 'smartious-dev').update('unsub:' + norm(email)).digest('hex').slice(0, 24)
const apiBase = (req) => (process.env.API_PUBLIC_URL || ((/localhost|127\.0\.0\.1/.test(req.get('host')) ? req.protocol : 'https') + '://' + req.get('host'))).replace(/\/$/, '')
const unsubUrl = (base, email) => `${base}/api/leads/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubToken(email)}`
const filtersOf = (q = {}) => ({
  converted: ['yes', 'no', 'all'].includes(q.converted) ? q.converted : 'all',
  source: ['assessment', 'inquiry'].includes(q.source) ? q.source : 'all',
  stage: String(q.stage || 'all').slice(0, 40), country: String(q.country || '').slice(0, 60),
  from: q.from || '', to: q.to || '', q: String(q.q || '').slice(0, 80),
})

// When each address last received a campaign email.
async function lastEmailed(emails) {
  if (!emails.length) return new Map()
  const rows = await Campaign().aggregate([
    { $match: { 'recipients.email': { $in: emails } } },
    { $unwind: '$recipients' },
    { $match: { 'recipients.email': { $in: emails }, 'recipients.status': 'sent' } },
    { $group: { _id: '$recipients.email', at: { $max: '$recipients.at' } } },
  ])
  return new Map(rows.map(r => [r._id, r.at]))
}

router.get('/', auth, STAFF, async (req, res) => {
  try {
    const all = await loadLeads()
    const f = filtersOf(req.query)
    const list = filterLeads(all, f)
    const page = Math.max(1, parseInt(req.query.page) || 1), limit = Math.min(200, parseInt(req.query.limit) || 50)
    const items = list.slice((page - 1) * limit, page * limit)
    const last = await lastEmailed([...new Set(items.map(l => l.email).filter(Boolean))])
    const inScope = filterLeads(all, { ...f, converted: 'all' })
    res.json({ success: true, data: {
      items: items.map(l => ({ ...l, lastEmailedAt: last.get(l.email) || null })),
      total: list.length, page, pages: Math.ceil(list.length / limit),
      counts: {
        all: inScope.length,
        converted: inScope.filter(l => l.converted).length,
        notConverted: inScope.filter(l => !l.converted).length,
        invoicedNotEnrolled: inScope.filter(l => (l.invoiced || l.paid) && !l.converted).length,
        reachable: new Set(inScope.filter(l => !l.converted && l.email).map(l => l.email)).size,
      },
      countries: [...new Set(all.map(l => l.country).filter(Boolean))].sort(),
      stages: { assessment: ASSESSMENT_STAGES, inquiry: INQUIRY_STAGES },
    } })
  } catch (e) { fail(res, 500, e.message) }
})

router.get('/export.csv', auth, STAFF, async (req, res) => {
  try {
    const list = filterLeads(await loadLeads(), filtersOf(req.query))
    const cell = (v) => { const s = String(v == null ? '' : v); return /[",\n\r]/.test(s) || /^[=+\-@]/.test(s) ? '"' + (/^[=+\-@]/.test(s) ? "'" : '') + s.replace(/"/g, '""') + '"' : s }
    const cols = [['Source', l => l.type === 'assessment' ? 'Assessment request' : 'CRM enquiry'], ['Reference', l => l.ref], ['Parent', l => l.parentName], ['Email', l => l.email],
      ['Phone', l => l.phone], ['Child', l => l.childName], ['Grade', l => l.grade], ['Country', l => l.country], ['City', l => l.city], ['Curriculum', l => l.curriculum],
      ['Stage', l => l.stageLabel], ['Invoice', l => l.invoiceNo], ['Converted', l => l.converted ? 'Yes' : 'No'], ['How', l => l.convertedHow], ['Received', l => new Date(l.createdAt).toISOString().slice(0, 10)]]
    const csv = [cols.map(c => c[0]).join(','), ...list.map(l => cols.map(([, f]) => cell(f(l))).join(','))].join('\r\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`)
    res.send('﻿' + csv)
  } catch (e) { fail(res, 500, e.message) }
})

router.get('/templates', auth, STAFF, (req, res) => {
  res.json({ success: true, data: Object.entries(TEMPLATES).map(([key, t]) => ({ key, ...t })) })
})

router.post('/preview', auth, STAFF, (req, res) => {
  const b = req.body || {}
  if (!TEMPLATES[b.template]) return fail(res, 400, 'Choose a template.')
  const sample = { type: b.sampleType === 'inquiry' ? 'inquiry' : 'assessment', parentName: 'Amina Otieno', childName: 'Zara Otieno', ref: 'SMA-A12345' }
  const out = renderLeadEmail(b.template, sample, { subject: String(b.subject || '').slice(0, 160), message: String(b.message || '').slice(0, 4000), origin: ORIGIN(), unsubUrl: '#' })
  res.json({ success: true, data: { subject: out.subject, html: out.html } })
})

const sendLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many sends this hour.' } })

router.post('/send', auth, STAFF, sendLimit, async (req, res) => {
  try {
    const b = req.body || {}
    if (!TEMPLATES[b.template]) return fail(res, 400, 'Choose a template.')
    if (b.template === 'custom' && (!String(b.subject || '').trim() || !String(b.message || '').trim())) return fail(res, 400, 'Your own message needs a subject and a message.')
    const t = require('../lib/issueInvoice').getTransporter()
    if (!t) return fail(res, 500, 'Email is not configured on the server.')
    const opts = { subject: String(b.subject || '').slice(0, 160), message: String(b.message || '').slice(0, 4000), origin: ORIGIN() }
    const from = process.env.EMAIL_FROM || 'Smartious Admissions <hello@smartioushomeschool.com>'
    const base = apiBase(req)

    if (b.test) {
      const to = norm(req.user.email)
      if (!to.includes('@')) return fail(res, 400, 'Your account has no email address for the test.')
      const sample = { type: b.sampleType === 'inquiry' ? 'inquiry' : 'assessment', parentName: req.user.firstName || 'Test', childName: 'Zara', ref: 'SMA-TEST' }
      const m = renderLeadEmail(b.template, sample, { ...opts, unsubUrl: unsubUrl(base, to) })
      await t.sendMail({ from, to, subject: '[TEST] ' + m.subject, html: m.html, text: m.text })
      return res.json({ success: true, message: 'Test sent to ' + to + '.' })
    }

    // Audience: matching NOT-converted leads, one email per address.
    const f = filtersOf(b.filters)
    let list = filterLeads(await loadLeads(), { ...f, converted: 'no' })
    if (Array.isArray(b.ids) && b.ids.length) { const ids = new Set(b.ids.map(String)); list = list.filter(l => ids.has(l.id)) }
    const byEmail = new Map()
    for (const l of list) if (l.email && !byEmail.has(l.email)) byEmail.set(l.email, l)
    const emails = [...byEmail.keys()]
    const cooldownDays = Math.max(0, Math.min(60, Number(b.cooldownDays ?? 7)))
    const [opted, bounced, last] = await Promise.all([
      OptOut().find({ email: { $in: emails } }).select('email').lean().then(r => new Set(r.map(x => x.email))),
      require('../lib/mailSuppression').suppressedSet(emails),
      lastEmailed(emails),
    ])
    const cutoff = Date.now() - cooldownDays * 864e5
    const keep = emails.filter(e => !opted.has(e) && !bounced.has(e) && !(last.get(e) && new Date(last.get(e)).getTime() > cutoff))
    if (!keep.length) return fail(res, 400, 'No one to email: every matching family has enrolled, unsubscribed, bounced or was emailed in the last ' + cooldownDays + ' days.')
    if (keep.length > MAX_PER_CAMPAIGN) return fail(res, 400, `That is ${keep.length} families; send at most ${MAX_PER_CAMPAIGN} at a time. Narrow the filters (for example by country or date).`)

    const c = await Campaign().create({
      template: b.template, subject: opts.subject || TEMPLATES[b.template].subject, message: opts.message, filters: { ...f, ids: b.ids || [] },
      sentBy: req.user._id, sentByName: [req.user.firstName, req.user.lastName].filter(Boolean).join(' ') || req.user.email,
      total: keep.length, skipped: emails.length - keep.length,
      recipients: keep.map(e => { const l = byEmail.get(e); return { email: e, name: l.parentName, leadType: l.type, leadId: l.id } }),
    })
    res.json({ success: true, message: `Sending to ${keep.length} families${emails.length - keep.length ? ` (${emails.length - keep.length} skipped)` : ''}.`, data: { campaign: { _id: c._id, total: c.total, skipped: c.skipped } } })
    runCampaign(c._id, byEmail, opts, base, from).catch(e => console.error('[leads campaign]', e.message))
  } catch (e) { fail(res, 500, e.message) }
})

async function runCampaign(id, byEmail, opts, base, from) {
  const t = require('../lib/issueInvoice').getTransporter()
  const C = Campaign()
  const c = await C.findById(id).lean()
  let sent = 0, failed = 0
  for (const r of c.recipients) {
    const l = byEmail.get(r.email)
    const m = renderLeadEmail(c.template, l, { ...opts, unsubUrl: unsubUrl(base, r.email) })
    let status = 'sent', error = ''
    try {
      await t.sendMail({ from, to: r.email, replyTo: 'hello@smartioushomeschool.com', subject: m.subject, html: m.html, text: m.text,
        headers: { 'List-Unsubscribe': `<${unsubUrl(base, r.email)}>, <mailto:hello@smartioushomeschool.com?subject=unsubscribe>` } })
      sent++
    } catch (e) { status = 'failed'; error = String(e.message || e).slice(0, 200); failed++ }
    await C.updateOne({ _id: id, 'recipients.email': r.email }, { $set: { 'recipients.$.status': status, 'recipients.$.error': error, 'recipients.$.at': new Date(), sent, failed } })
    await new Promise(ok => setTimeout(ok, GAP_MS))
  }
  await C.updateOne({ _id: id }, { $set: { status: sent ? 'done' : 'failed', finishedAt: new Date(), sent, failed } })
}

router.get('/campaigns', auth, STAFF, async (req, res) => {
  try {
    const list = await Campaign().find({}).sort({ createdAt: -1 }).limit(50).select('-recipients').lean()
    res.json({ success: true, data: list })
  } catch (e) { fail(res, 500, e.message) }
})
router.get('/campaigns/:id', auth, STAFF, async (req, res) => {
  try {
    const c = await Campaign().findById(req.params.id).lean()
    if (!c) return fail(res, 404, 'Campaign not found.')
    res.json({ success: true, data: c })
  } catch (e) { fail(res, 500, e.message) }
})

// Public unsubscribe, from the link in every campaign email.
router.get('/unsubscribe', async (req, res) => {
  const email = norm(req.query.e), tok = String(req.query.t || '')
  const page = (title, body) => `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#EFE9DD;font-family:Arial,sans-serif"><div style="max-width:480px;margin:60px auto;background:#fff;border-radius:14px;padding:32px;text-align:center"><div style="font-family:Georgia,serif;font-size:22px;color:#8B1A2E;margin-bottom:10px">${title}</div><p style="color:#2E3D55;line-height:1.6">${body}</p><a href="${ORIGIN()}" style="color:#8B1A2E">smartioushomeschool.com</a></div></body></html>`
  const expect = unsubToken(email)
  if (!email.includes('@') || tok.length !== expect.length || !crypto.timingSafeEqual(Buffer.from(tok), Buffer.from(expect)))
    return res.status(400).send(page('Link not recognised', 'This unsubscribe link is incomplete. Reply to any of our emails with "unsubscribe" and we will remove you.'))
  try {
    await OptOut().updateOne({ email }, { $setOnInsert: { email, source: 'unsubscribe-link' } }, { upsert: true })
    res.send(page('You are unsubscribed', 'We will not send you admissions emails again. You will still receive emails about any invoice or enrolment you have with us.'))
  } catch (e) { res.status(500).send(page('Something went wrong', 'Please try again later.')) }
})

module.exports = router
module.exports.unsubToken = unsubToken
