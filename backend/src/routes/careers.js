/**
 * routes/careers.js — the public careers application and the staff
 * Careers module (Admin, Dean & Operations, QA).
 * Mounted at /api/careers.
 *
 * Public (no sign-in, rate-limited):
 *   POST /applications/start           { firstName, lastName, email, position }
 *                                      → { id, token }   a draft, so files can upload
 *   POST /applications/:id/presign     { token, kind: document|demo, fileName, mimeType, fileSize }
 *                                      → { uploadUrl, key }   the browser PUTs straight to R2
 *   POST /applications/:id/submit      { token, …every field, documents, demoLesson }
 *                                      → { ref }   or 400 with every error
 *
 * Staff (admin, dos, ops_manager, qa):
 *   GET   /applications                 filters: status, position, subject, curriculum, level,
 *                                       country, q, minYears, maxYears, hasDemo, docs, minScore,
 *                                       assigned, from, to, sort, page, limit → { items, total, facets }
 *   GET   /applications/export.csv      same filters, as CSV
 *   GET   /applications/:id             full record, files with short-lived signed links
 *   PATCH /applications/:id/status      { status, note }
 *   PATCH /applications/:id             { assignedTo, tags }
 *   POST  /applications/:id/notes       { text }
 *   POST  /applications/:id/reviews     { scores, recommendation, comment }
 *   DELETE /applications/:id            admin only; removes the files too
 *
 * Files are private: the record keeps only the R2 key, and staff open a
 * document or the demo lesson through a signed link that lasts an hour.
 */
const express = require('express')
const crypto = require('crypto')
const rateLimit = require('express-rate-limit')
const { auth, requireRole } = require('../middleware/auth')
const {
  POSITIONS, APPLICATION_STATUSES, OPEN_STATUSES, APPLICANT_DOCS, REVIEW_CRITERIA, MAX_FILES,
} = require('../constants/careers')
const { checkUpload, uploadKey, cleanApplication, flags, avgScore, ref, hashToken, isEmail, str } = require('../lib/careers')

const router = express.Router()
const STAFF = ['admin', 'dos', 'ops_manager', 'qa']
const ORIGIN = () => (process.env.CLIENT_URL || 'https://smartioushomeschool.com').replace(/\/$/, '')

// ── R2 (same env as the library and teacher documents) ──────
const R2_READY = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME)
let r2 = null
function client() {
  if (!R2_READY) return null
  if (!r2) {
    const { S3Client } = require('@aws-sdk/client-s3')
    r2 = new S3Client({ region: 'auto', endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } })
  }
  return r2
}
// Signed like routes/teacher-documents.js (type, not length), which R2 accepts
// from browsers; the declared size is checked before signing.
async function signedPut(key, mimeType) {
  const { PutObjectCommand } = require('@aws-sdk/client-s3')
  const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
  return getSignedUrl(client(), new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, ContentType: mimeType }), { expiresIn: 3600 })
}
async function signedGet(key, filename) {
  if (!R2_READY || !key) return null
  const { GetObjectCommand } = require('@aws-sdk/client-s3')
  const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
  const disp = filename ? `inline; filename="${String(filename).replace(/[^\w.\- ]+/g, '_')}"` : undefined
  return getSignedUrl(client(), new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, ResponseContentDisposition: disp }), { expiresIn: 3600 })
}
async function removeFiles(keys) {
  if (!R2_READY) return
  const { DeleteObjectCommand } = require('@aws-sdk/client-s3')
  for (const Key of keys) { try { await client().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key })) } catch (e) { /* best effort */ } }
}

const Model = () => require('../models/JobApplication')
const fail = (res, code, message, extra = {}) => res.status(code).json({ success: false, message, ...extra })
const actor = (u) => ({ by: u._id, name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email, role: u.role, at: new Date() })

async function nextRef(kind) {
  const Counter = require('../models/Counter')
  const y = new Date().getUTCFullYear()
  const c = await Counter.findOneAndUpdate({ _id: `${kind}-${y}` }, { $inc: { seq: 1 } }, { upsert: true, new: true })
  return ref(kind === 'careers' ? 'SMA' : 'SMP', c.seq)
}

async function draftFor(req, res) {
  const app = await Model().findById(req.params.id).select('+tokenHash')
  if (!app || app.submitted) { fail(res, 404, 'This application is closed or was not found. Start a new one.'); return null }
  const token = String(req.body?.token || '')
  const a = Buffer.from(hashToken(token)), b = Buffer.from(app.tokenHash || '')
  if (!token || a.length !== b.length || !crypto.timingSafeEqual(a, b)) { fail(res, 403, 'This upload link has expired. Reload the page and try again.'); return null }
  return app
}

// ═══ Public ════════════════════════════════════════════════
const startLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many applications from this connection. Try again in an hour.' } })
const uploadLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many uploads from this connection. Try again later.' } })

router.post('/applications/start', startLimit, async (req, res) => {
  try {
    const b = req.body || {}
    const firstName = str(b.firstName, 80), lastName = str(b.lastName, 80), email = str(b.email, 160).toLowerCase()
    if (!firstName || !lastName || !isEmail(email)) return fail(res, 400, 'Enter your name and a valid email address to start.')
    const position = POSITIONS.includes(b.position) ? b.position : 'online_teacher'
    const token = crypto.randomBytes(24).toString('hex')
    const app = await Model().create({ firstName, lastName, email, position, tokenHash: hashToken(token) })
    res.json({ success: true, data: { id: app._id, token } })
  } catch (e) { fail(res, 500, e.message) }
})

router.post('/applications/:id/presign', uploadLimit, async (req, res) => {
  try {
    if (!R2_READY) return fail(res, 503, 'File uploads are not available right now. Email your documents to hello@smartioushomeschool.com instead.')
    const app = await draftFor(req, res); if (!app) return
    const { kind, fileName, mimeType, fileSize } = req.body || {}
    const err = checkUpload({ kind, mimeType, fileSize })
    if (err) return fail(res, 400, err)
    // A running count of uploads on the draft keeps one application from
    // becoming free storage.
    const counted = await Model().findOneAndUpdate({ _id: app._id, uploads: { $lt: MAX_FILES } }, { $inc: { uploads: 1 } })
    if (!counted) return fail(res, 400, 'This application has reached its upload limit.')
    const key = uploadKey(app._id, kind, fileName)
    res.json({ success: true, data: { uploadUrl: await signedPut(key, mimeType), key } })
  } catch (e) { fail(res, 500, e.message) }
})

router.post('/applications/:id/submit', startLimit, async (req, res) => {
  try {
    const app = await draftFor(req, res); if (!app) return
    const { update, errors } = cleanApplication(req.body || {}, String(app._id))
    if (errors.length) return fail(res, 400, errors[0], { errors })
    Object.assign(app, update)
    Object.assign(app, flags(app))
    app.submitted = true
    app.submittedAt = new Date()
    app.status = 'new'
    app.ref = await nextRef('careers')
    app.statusHistory = [{ status: 'new', note: 'Application submitted', name: 'Applicant', at: new Date() }]
    app.tokenHash = undefined
    await app.save()
    res.json({ success: true, data: { ref: app.ref } })
    afterSubmit(app).catch(e => console.error('[careers] after submit:', e.message))
  } catch (e) { fail(res, 500, e.message) }
})

async function afterSubmit(app) {
  const User = require('../models/User')
  const { notify } = require('../lib/notify')
  const staff = await User.find({ role: { $in: STAFF }, isActive: { $ne: false } }).select('_id').lean()
  const who = `${app.firstName} ${app.lastName}`
  const what = app.position === 'non_teaching' ? app.roleTitle : (app.subjects || []).slice(0, 3).join(', ')
  await notify(staff.map(s => s._id), { title: `New job application: ${who}`, body: `${app.ref} · ${what}${app.country ? ' · ' + app.country : ''}`, module: 'careers' })
  const t = require('../lib/issueInvoice').getTransporter()
  if (!t) return
  const { suppressedSet } = require('../lib/mailSuppression')
  if ((await suppressedSet([app.email])).has(app.email)) return
  await t.sendMail({
    from: process.env.EMAIL_FROM || 'Smartious <hello@smartioushomeschool.com>',
    to: app.email,
    subject: `We received your application (${app.ref})`,
    html: mail(`Thank you, ${app.firstName}`, [
      `We have received your application to teach with Smartious. Your reference is <strong>${app.ref}</strong>.`,
      'Our academic team reviews every application, including your documents and demo lesson. If your profile matches what our learners need, we will contact you to arrange an interview.',
      'You do not need to do anything else for now. If any of your details change, reply to this email quoting your reference.',
    ]),
  })
}

function mail(title, lines) {
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  return `<!DOCTYPE html><html><body style="margin:0;background:#FDFAF4;font-family:sans-serif;"><table width="100%" style="padding:28px 14px"><tr><td align="center">
<table width="100%" style="max-width:540px;background:#fff;border-radius:12px;border:1px solid #E8E2D6;overflow:hidden">
<tr><td style="background:linear-gradient(135deg,#7D1025,#5A0B1B);padding:20px 28px;color:#fff;font-size:19px;font-weight:800">${esc(title)}</td></tr>
<tr><td style="padding:22px 28px;font-size:14px;color:#2c2c2c;line-height:1.65">${lines.map(l => `<p style="margin:0 0 12px">${l}</p>`).join('')}</td></tr>
<tr><td style="background:#FDFAF4;padding:12px 28px;border-top:1px solid #E8E2D6;font-size:11px;color:#999">Smartious Homeschool &amp; eSchool · ${ORIGIN().replace(/^https?:\/\//, '')}</td></tr>
</table></td></tr></table></body></html>`
}

// ═══ Staff ═════════════════════════════════════════════════
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function filterFrom(q = {}) {
  const f = { submitted: true }
  const many = (v) => String(v || '').split(',').map(x => x.trim()).filter(Boolean)
  if (q.status === 'open') f.status = { $in: OPEN_STATUSES }
  else if (q.status) f.status = { $in: many(q.status).filter(s => APPLICATION_STATUSES.includes(s)) }
  if (q.position) f.position = { $in: many(q.position) }
  if (q.subject) f.subjects = { $in: many(q.subject) }
  if (q.curriculum) f.curricula = { $in: many(q.curriculum) }
  if (q.level) f.levels = { $in: many(q.level) }
  if (q.country) f.country = new RegExp('^' + esc(q.country) + '$', 'i')
  if (q.minYears || q.maxYears) f.yearsExperience = { ...(q.minYears ? { $gte: Number(q.minYears) } : {}), ...(q.maxYears ? { $lte: Number(q.maxYears) } : {}) }
  if (q.hasDemo === 'yes') f.hasDemo = true
  if (q.hasDemo === 'no') f.hasDemo = false
  if (q.docs === 'complete') f.docsComplete = true
  if (q.docs === 'incomplete') f.docsComplete = false
  if (q.minScore) f.avgScore = { $gte: Number(q.minScore) }
  if (q.reviewed === 'yes') f['reviews.0'] = { $exists: true }
  if (q.reviewed === 'no') f['reviews.0'] = { $exists: false }
  if (q.assigned === 'me' && q._me) f.assignedTo = q._me
  else if (q.assigned === 'none') f.assignedTo = null
  if (q.from || q.to) f.submittedAt = { ...(q.from ? { $gte: new Date(q.from) } : {}), ...(q.to ? { $lte: new Date(new Date(q.to).getTime() + 86399999) } : {}) }
  if (q.q) {
    const re = new RegExp(esc(String(q.q).trim()), 'i')
    f.$or = [{ firstName: re }, { lastName: re }, { email: re }, { ref: re }, { phone: re }, { subjects: re }, { roleTitle: re }, { city: re }]
  }
  return f
}
const SORTS = { newest: { submittedAt: -1 }, oldest: { submittedAt: 1 }, score: { avgScore: -1, submittedAt: -1 }, experience: { yearsExperience: -1, submittedAt: -1 }, name: { lastName: 1, firstName: 1 } }
const LIST_FIELDS = 'ref firstName lastName email phone country city position roleTitle subjects curricula levels yearsExperience yearsOnline status assignedToName tags avgScore docsComplete hasDemo submittedAt reviews.recommendation'

router.get('/applications', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const q = { ...req.query, _me: req.user._id }
    const f = filterFrom(q)
    const page = Math.max(1, parseInt(q.page) || 1), limit = Math.min(200, parseInt(q.limit) || 50)
    const J = Model()
    const [items, total, byStatus, bySubject, byCountry, byPosition] = await Promise.all([
      J.find(f).sort(SORTS[q.sort] || SORTS.newest).skip((page - 1) * limit).limit(limit).select(LIST_FIELDS).lean(),
      J.countDocuments(f),
      // Facets over every submitted application, so the filter bar can show counts.
      J.aggregate([{ $match: { submitted: true } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
      J.aggregate([{ $match: { submitted: true } }, { $unwind: '$subjects' }, { $group: { _id: '$subjects', n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 60 }]),
      J.aggregate([{ $match: { submitted: true, country: { $ne: '' } } }, { $group: { _id: '$country', n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 60 }]),
      J.aggregate([{ $match: { submitted: true } }, { $group: { _id: '$position', n: { $sum: 1 } } }]),
    ])
    const toObj = (rows) => Object.fromEntries(rows.map(r => [r._id, r.n]))
    res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit),
      facets: { status: toObj(byStatus), subject: toObj(bySubject), country: toObj(byCountry), position: toObj(byPosition) } } })
  } catch (e) { fail(res, 500, e.message) }
})

router.get('/applications/export.csv', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const items = await Model().find(filterFrom({ ...req.query, _me: req.user._id })).sort(SORTS[req.query.sort] || SORTS.newest).limit(5000).lean()
    const cell = (v) => { const s = Array.isArray(v) ? v.join('; ') : v instanceof Date ? v.toISOString().slice(0, 10) : String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
    const cols = [['Reference', 'ref'], ['First name', 'firstName'], ['Last name', 'lastName'], ['Email', 'email'], ['Phone', 'phone'], ['Country', 'country'], ['City', 'city'],
      ['Position', 'position'], ['Role', 'roleTitle'], ['Subjects', 'subjects'], ['Curricula', 'curricula'], ['Levels', 'levels'], ['Years teaching', 'yearsExperience'], ['Years online', 'yearsOnline'],
      ['Status', 'status'], ['Score', 'avgScore'], ['Documents complete', 'docsComplete'], ['Demo lesson', 'hasDemo'], ['Assigned to', 'assignedToName'], ['Submitted', 'submittedAt']]
    const csv = [cols.map(c => c[0]).join(','), ...items.map(a => cols.map(([, k]) => cell(a[k])).join(','))].join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="job-applications-${new Date().toISOString().slice(0, 10)}.csv"`)
    res.send('﻿' + csv)
  } catch (e) { fail(res, 500, e.message) }
})

router.get('/applications/:id', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const a = await Model().findOne({ _id: req.params.id, submitted: true }).lean()
    if (!a) return fail(res, 404, 'Application not found.')
    const label = Object.fromEntries(APPLICANT_DOCS.map(d => [d.key, d.label]))
    a.documents = await Promise.all((a.documents || []).map(async d => ({ ...d, label: label[d.category] || d.category, url: d.file ? await signedGet(d.file.key, d.file.filename) : null })))
    if (a.demoLesson?.file) a.demoLesson.fileUrl = await signedGet(a.demoLesson.file.key, a.demoLesson.file.filename)
    const fl = flags(a)
    res.json({ success: true, data: { application: { ...a, missingDocs: fl.missingDocs, pendingDocs: fl.pendingDocs }, criteria: REVIEW_CRITERIA, docTypes: APPLICANT_DOCS } })
  } catch (e) { fail(res, 500, e.message) }
})

router.patch('/applications/:id/status', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const status = req.body?.status
    if (!APPLICATION_STATUSES.includes(status)) return fail(res, 400, 'Unknown status.')
    const a = await Model().findOne({ _id: req.params.id, submitted: true })
    if (!a) return fail(res, 404, 'Application not found.')
    a.status = status
    a.statusHistory.push({ status, note: str(req.body?.note, 500), ...actor(req.user) })
    await a.save()
    res.json({ success: true, data: { status: a.status, statusHistory: a.statusHistory } })
  } catch (e) { fail(res, 500, e.message) }
})

router.patch('/applications/:id', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const a = await Model().findOne({ _id: req.params.id, submitted: true })
    if (!a) return fail(res, 404, 'Application not found.')
    if ('assignedTo' in (req.body || {})) {
      const User = require('../models/User')
      const u = req.body.assignedTo ? await User.findOne({ _id: req.body.assignedTo, role: { $in: STAFF } }).select('firstName lastName email').lean() : null
      if (req.body.assignedTo && !u) return fail(res, 400, 'That person cannot be assigned.')
      a.assignedTo = u ? u._id : null
      a.assignedToName = u ? [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email : ''
    }
    if (Array.isArray(req.body?.tags)) a.tags = req.body.tags.map(t => str(t, 40)).filter(Boolean).slice(0, 12)
    await a.save()
    res.json({ success: true, data: { assignedTo: a.assignedTo, assignedToName: a.assignedToName, tags: a.tags } })
  } catch (e) { fail(res, 500, e.message) }
})

router.post('/applications/:id/notes', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const text = str(req.body?.text, 2000)
    if (!text) return fail(res, 400, 'Write a note first.')
    const a = await Model().findOneAndUpdate({ _id: req.params.id, submitted: true }, { $push: { notes: { text, ...actor(req.user) } } }, { new: true }).select('notes').lean()
    if (!a) return fail(res, 404, 'Application not found.')
    res.json({ success: true, data: { notes: a.notes } })
  } catch (e) { fail(res, 500, e.message) }
})

router.post('/applications/:id/reviews', auth, requireRole(...STAFF), async (req, res) => {
  try {
    const scores = {}
    for (const k of REVIEW_CRITERIA) { const v = Number(req.body?.scores?.[k]); if (v >= 1 && v <= 5) scores[k] = Math.round(v) }
    if (!Object.keys(scores).length) return fail(res, 400, 'Score at least one criterion from 1 to 5.')
    const recommendation = ['hire', 'maybe', 'no'].includes(req.body?.recommendation) ? req.body.recommendation : 'maybe'
    const a = await Model().findOne({ _id: req.params.id, submitted: true })
    if (!a) return fail(res, 404, 'Application not found.')
    // One review per reviewer: a second one replaces the first.
    a.reviews = a.reviews.filter(r => String(r.by) !== String(req.user._id))
    a.reviews.push({ scores, recommendation, comment: str(req.body?.comment, 2000), ...actor(req.user) })
    a.avgScore = avgScore(a.reviews)
    await a.save()
    res.json({ success: true, data: { reviews: a.reviews, avgScore: a.avgScore } })
  } catch (e) { fail(res, 500, e.message) }
})

router.delete('/applications/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const a = await Model().findById(req.params.id).lean()
    if (!a) return fail(res, 404, 'Application not found.')
    await removeFiles([...(a.documents || []).map(d => d.file?.key), a.demoLesson?.file?.key].filter(Boolean))
    await Model().deleteOne({ _id: a._id })
    res.json({ success: true, message: 'Application and its files deleted.' })
  } catch (e) { fail(res, 500, e.message) }
})

// Drafts nobody finished: removed after 14 days, with their files.
async function purgeStaleDrafts(now = new Date()) {
  const J = Model()
  const stale = await J.find({ submitted: false, createdAt: { $lt: new Date(now.getTime() - 14 * 86400000) } }).select('_id').lean()
  for (const d of stale) {
    if (R2_READY) {
      try {
        const { ListObjectsV2Command } = require('@aws-sdk/client-s3')
        const out = await client().send(new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME, Prefix: `careers/${d._id}/` }))
        await removeFiles((out.Contents || []).map(o => o.Key))
      } catch (e) { /* best effort */ }
    }
    await J.deleteOne({ _id: d._id })
  }
  return stale.length
}

module.exports = router
module.exports.purgeStaleDrafts = purgeStaleDrafts
module.exports.filterFrom = filterFrom
