/**
 * routes/partnerships.js — the public /partnerships enquiry form and the
 * staff Partnerships module (Admin, Dean & Operations, QA).
 * Mounted at /api/partnerships.
 *
 * Public (no sign-in, rate-limited):
 *   POST /upload      { category, fileName, mimeType, fileSize } → { uploadUrl, key, sig }
 *                     the browser PUTs the file straight to R2 (private)
 *   POST /            { type, organisation, contactName, email, …, details, message,
 *                       documents: [{ category, key, sig, filename, mimeType, sizeBytes }] } → { ref }
 *                     registration, licence and proof of operations are required
 *
 * Staff:
 *   GET   /                    filters: type, status, country, q, followUp (due|none), from, to, sort, page
 *   GET   /export.csv          same filters
 *   GET   /:id
 *   PATCH /:id/status          { status, note }
 *   PATCH /:id                 { assignedTo, followUpOn }
 *   POST  /:id/notes           { text }
 *   DELETE /:id                admin only
 */
const express = require('express')
const rateLimit = require('express-rate-limit')
const { auth, requireRole } = require('../middleware/auth')
const { PARTNERSHIP_TYPES, PARTNERSHIP_STATUSES } = require('../constants/careers')
const { PARTNER_DOCS, REQUIRED_PARTNER_DOCS } = require('../constants/careers')
const { cleanDetails, ref, isEmail, isUrl, str, checkUpload, partnerUploadKey, signKey, cleanPartnerDocs, PARTNER_PREFIX } = require('../lib/careers')
const r2 = require('../lib/r2Files')

const router = express.Router()
const STAFF = ['admin', 'dos', 'ops_manager', 'qa']
const Model = () => require('../models/PartnershipEnquiry')
const fail = (res, code, message, extra = {}) => res.status(code).json({ success: false, message, ...extra })
const actor = (u) => ({ by: u._id, name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email, role: u.role, at: new Date() })
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const TYPE_LABEL = {
  university_scholarships: 'University scholarships', exam_centre: 'Examination centre', training_provider: 'Training provider',
  co_curricular: 'Co-curricular provider', school_partnership: 'School partnership', technology: 'Technology partner',
  content_publisher: 'Content and publishing', corporate_family: 'Corporate family benefits', education_agent: 'Education agent',
  ngo_foundation: 'NGO or foundation', media: 'Media and events', other: 'Other',
}

const DOC_LABEL = { registration: 'Government registration certificate', licence: 'Operating licence or accreditation', proof_of_operations: 'Proof of operations', other: 'Other supporting document' }

const uploadLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 40, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many uploads from this connection. Try again in an hour.' } })

router.post('/upload', uploadLimit, async (req, res) => {
  try {
    if (!r2.ready()) return fail(res, 503, 'Document uploads are not available right now. Please try again later, or email hello@smartioushomeschool.com.')
    const { category, fileName, mimeType, fileSize } = req.body || {}
    if (!PARTNER_DOCS.includes(category)) return fail(res, 400, 'Unknown document type.')
    const err = checkUpload({ kind: 'document', mimeType, fileSize })
    if (err) return fail(res, 400, err)
    const key = partnerUploadKey(category, fileName)
    res.json({ success: true, data: { uploadUrl: await r2.signedPut(key, mimeType), key, sig: signKey(key) } })
  } catch (e) { fail(res, 500, e.message) }
})

const submitLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many enquiries from this connection. Try again in an hour.' } })

router.post('/', submitLimit, async (req, res) => {
  try {
    const b = req.body || {}
    const errors = []
    const type = PARTNERSHIP_TYPES.includes(b.type) ? b.type : null
    if (!type) errors.push('Choose the kind of partnership.')
    const doc = {
      type, organisation: str(b.organisation, 160), website: str(b.website, 300), country: str(b.country, 80), city: str(b.city, 80),
      contactName: str(b.contactName, 120), contactRole: str(b.contactRole, 120), email: str(b.email, 160).toLowerCase(), phone: str(b.phone, 40),
      details: cleanDetails(b.details), message: str(b.message, 4000), howHeard: str(b.howHeard, 120),
    }
    if (!doc.organisation) errors.push('Enter your organisation’s name.')
    if (!doc.contactName) errors.push('Enter a contact name.')
    if (!isEmail(doc.email)) errors.push('Enter a valid email address.')
    if (doc.website && !isUrl(doc.website)) errors.push('The website must start with http:// or https://.')
    if (!doc.country) errors.push('Enter your country.')
    const { docs, missing } = cleanPartnerDocs(b.documents)
    if (missing.length) errors.push('Upload your ' + missing.map(k => DOC_LABEL[k].toLowerCase()).join(', ') + '.')
    doc.documents = docs
    if (!b.consent) errors.push('Confirm that we may contact you about this enquiry.')
    if (errors.length) return fail(res, 400, errors[0], { errors })
    if (b.website2) return res.json({ success: true, data: { ref: 'SMP' } })   // honeypot: bots fill every field
    const Counter = require('../models/Counter')
    const y = new Date().getUTCFullYear()
    const c = await Counter.findOneAndUpdate({ _id: `partnerships-${y}` }, { $inc: { seq: 1 } }, { upsert: true, new: true })
    const p = await Model().create({ ...doc, ref: ref('SMP', c.seq), statusHistory: [{ status: 'new', note: 'Enquiry received', name: doc.contactName }] })
    res.json({ success: true, data: { ref: p.ref } })
    afterSubmit(p).catch(e => console.error('[partnerships] after submit:', e.message))
  } catch (e) { fail(res, 500, e.message) }
})

async function afterSubmit(p) {
  const User = require('../models/User')
  const { notify } = require('../lib/notify')
  const staff = await User.find({ role: { $in: ['admin', 'dos', 'ops_manager'] }, isActive: { $ne: false } }).select('_id').lean()
  await notify(staff.map(s => s._id), { title: `Partnership enquiry: ${p.organisation}`, body: `${p.ref} · ${TYPE_LABEL[p.type] || p.type}${p.country ? ' · ' + p.country : ''}`, module: 'partnerships' })
  const t = require('../lib/issueInvoice').getTransporter()
  if (!t) return
  const { suppressedSet } = require('../lib/mailSuppression')
  if ((await suppressedSet([p.email])).has(p.email)) return
  const h = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]))
  await t.sendMail({
    from: process.env.EMAIL_FROM || 'Smartious <hello@smartioushomeschool.com>',
    to: p.email,
    subject: `Partnership enquiry received (${p.ref})`,
    html: `<div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:24px;color:#2c2c2c;line-height:1.65">
<h2 style="color:#7D1025;margin:0 0 12px">Thank you, ${h(p.contactName)}</h2>
<p>We have received ${h(p.organisation)}’s enquiry about a <strong>${h((TYPE_LABEL[p.type] || p.type).toLowerCase())}</strong> partnership with Smartious. Your reference is <strong>${h(p.ref)}</strong>.</p>
<p>The right person on our team will review it and reply, usually within five working days. If you have a proposal or brochure, reply to this email with it attached, quoting your reference.</p>
<p style="font-size:12px;color:#999;margin-top:24px">Smartious Homeschool &amp; eSchool</p></div>`,
  })
}

function filterFrom(q = {}) {
  const f = {}
  const many = (v) => String(v || '').split(',').map(x => x.trim()).filter(Boolean)
  if (q.type) f.type = { $in: many(q.type) }
  if (q.status === 'open') f.status = { $in: ['new', 'in_discussion', 'proposal', 'agreement'] }
  else if (q.status) f.status = { $in: many(q.status).filter(s => PARTNERSHIP_STATUSES.includes(s)) }
  if (q.country) f.country = new RegExp('^' + esc(q.country) + '$', 'i')
  if (q.followUp === 'due') f.followUpOn = { $ne: null, $lte: new Date() }
  if (q.followUp === 'none') f.followUpOn = null
  if (q.assigned === 'me' && q._me) f.assignedTo = q._me
  else if (q.assigned === 'none') f.assignedTo = null
  if (q.from || q.to) f.createdAt = { ...(q.from ? { $gte: new Date(q.from) } : {}), ...(q.to ? { $lte: new Date(new Date(q.to).getTime() + 86399999) } : {}) }
  if (q.q) { const re = new RegExp(esc(String(q.q).trim()), 'i'); f.$or = [{ organisation: re }, { contactName: re }, { email: re }, { ref: re }, { city: re }, { message: re }] }
  return f
}
const SORTS = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, followup: { followUpOn: 1, createdAt: -1 }, name: { organisation: 1 } }

router.get('/', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const q = { ...req.query, _me: req.user._id }
    const f = filterFrom(q)
    const page = Math.max(1, parseInt(q.page) || 1), limit = Math.min(200, parseInt(q.limit) || 50)
    const P = Model()
    const [items, total, byType, byStatus, byCountry] = await Promise.all([
      P.find(f).sort(SORTS[q.sort] || SORTS.newest).skip((page - 1) * limit).limit(limit).select('-notes -statusHistory').lean(),
      P.countDocuments(f),
      P.aggregate([{ $group: { _id: '$type', n: { $sum: 1 } } }]),
      P.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
      P.aggregate([{ $match: { country: { $ne: '' } } }, { $group: { _id: '$country', n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 60 }]),
    ])
    const toObj = (rows) => Object.fromEntries(rows.map(r => [r._id, r.n]))
    res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit), facets: { type: toObj(byType), status: toObj(byStatus), country: toObj(byCountry) } } })
  } catch (e) { fail(res, 500, e.message) }
})

router.get('/export.csv', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const items = await Model().find(filterFrom({ ...req.query, _me: req.user._id })).sort(SORTS[req.query.sort] || SORTS.newest).limit(5000).lean()
    const cell = (v) => { const s = v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === 'object' && v ? Object.entries(v).map(([k, x]) => `${k}: ${Array.isArray(x) ? x.join('/') : x}`).join('; ') : String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
    const cols = [['Reference', 'ref'], ['Type', 'type'], ['Organisation', 'organisation'], ['Website', 'website'], ['Country', 'country'], ['City', 'city'], ['Contact', 'contactName'],
      ['Role', 'contactRole'], ['Email', 'email'], ['Phone', 'phone'], ['Details', 'details'], ['Documents', 'documents'], ['Message', 'message'], ['Status', 'status'], ['Assigned to', 'assignedToName'], ['Follow up', 'followUpOn'], ['Received', 'createdAt']]
    const csv = [cols.map(c => c[0]).join(','), ...items.map(a => cols.map(([, k]) => cell(k === 'type' ? TYPE_LABEL[a.type] || a.type : k === 'documents' ? (a.documents || []).map(d => DOC_LABEL[d.category] || d.category).join('; ') : a[k])).join(','))].join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="partnership-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`)
    res.send('﻿' + csv)
  } catch (e) { fail(res, 500, e.message) }
})

router.get('/:id', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const p = await Model().findById(req.params.id).lean()
    if (!p) return fail(res, 404, 'Enquiry not found.')
    p.documents = await Promise.all((p.documents || []).map(async d => ({ ...d, label: DOC_LABEL[d.category] || d.category, url: await r2.signedGet(d.key, d.filename) })))
    p.missingDocs = REQUIRED_PARTNER_DOCS.filter(k => !p.documents.some(d => d.category === k)).map(k => DOC_LABEL[k])
    res.json({ success: true, data: { enquiry: p } })
  } catch (e) { fail(res, 500, e.message) }
})

router.patch('/:id/status', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const status = req.body?.status
    if (!PARTNERSHIP_STATUSES.includes(status)) return fail(res, 400, 'Unknown status.')
    const p = await Model().findById(req.params.id)
    if (!p) return fail(res, 404, 'Enquiry not found.')
    p.status = status
    p.statusHistory.push({ status, note: str(req.body?.note, 500), ...actor(req.user) })
    await p.save()
    res.json({ success: true, data: { status: p.status, statusHistory: p.statusHistory } })
  } catch (e) { fail(res, 500, e.message) }
})

router.patch('/:id', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const p = await Model().findById(req.params.id)
    if (!p) return fail(res, 404, 'Enquiry not found.')
    if ('assignedTo' in (req.body || {})) {
      const User = require('../models/User')
      const u = req.body.assignedTo ? await User.findOne({ _id: req.body.assignedTo, role: { $in: STAFF } }).select('firstName lastName email').lean() : null
      if (req.body.assignedTo && !u) return fail(res, 400, 'That person cannot be assigned.')
      p.assignedTo = u ? u._id : null
      p.assignedToName = u ? [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email : ''
    }
    if ('followUpOn' in (req.body || {})) p.followUpOn = req.body.followUpOn && !isNaN(new Date(req.body.followUpOn)) ? new Date(req.body.followUpOn) : null
    await p.save()
    res.json({ success: true, data: { assignedTo: p.assignedTo, assignedToName: p.assignedToName, followUpOn: p.followUpOn } })
  } catch (e) { fail(res, 500, e.message) }
})

router.post('/:id/notes', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const text = str(req.body?.text, 2000)
    if (!text) return fail(res, 400, 'Write a note first.')
    const p = await Model().findByIdAndUpdate(req.params.id, { $push: { notes: { text, ...actor(req.user) } } }, { new: true }).select('notes').lean()
    if (!p) return fail(res, 404, 'Enquiry not found.')
    res.json({ success: true, data: { notes: p.notes } })
  } catch (e) { fail(res, 500, e.message) }
})

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const p = await Model().findById(req.params.id).select('documents').lean()
    if (!p) return fail(res, 404, 'Enquiry not found.')
    await Model().deleteOne({ _id: req.params.id })
    await r2.remove((p.documents || []).map(d => d.key))
    res.json({ success: true, message: 'Enquiry deleted.' })
  } catch (e) { fail(res, 500, e.message) }
})

// Files uploaded with an enquiry that was never sent: removed after two days.
async function purgeOrphanUploads() {
  if (!r2.ready()) return 0
  const keys = await r2.list(PARTNER_PREFIX, 2 * 864e5)
  if (!keys.length) return 0
  const used = new Set((await Model().find({ 'documents.key': { $in: keys } }).select('documents.key').lean()).flatMap(p => p.documents.map(d => d.key)))
  const orphans = keys.filter(k => !used.has(k))
  await r2.remove(orphans)
  return orphans.length
}

module.exports = router
module.exports.filterFrom = filterFrom
module.exports.purgeOrphanUploads = purgeOrphanUploads
