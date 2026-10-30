/**
 * lib/careers.js — the rules behind the careers and partnership forms,
 * kept free of the database so they can be tested (test/careers.test.js).
 *
 *   checkUpload({ kind, mimeType, fileSize })      → error message or ''
 *   uploadKey(appId, kind, fileName)               → careers/<id>/<kind>/<uuid>-<name>
 *   cleanApplication(body, appId)                  → { update, errors }
 *   flags(app)                                     → { docsComplete, hasDemo, missingDocs }
 *   avgScore(reviews)                              → mean of each review's mean, 1 dp
 *   cleanDetails(obj)                              → a partnership's type-specific answers
 *   partnerUploadKey(category, fileName)           → partnerships/uploads/<uuid>/<category>-<name>
 *   signKey(key) / cleanPartnerDocs(list)          → the partner's uploaded documents, checked:
 *        each key must carry our signature (issued with the upload URL), so an
 *        enquiry can only reference files uploaded through this form
 */
const crypto = require('crypto')
const {
  POSITIONS, TEACHING_POSITIONS, APPLICANT_DOCS, requiredDocsFor, PENDING_OK, REVIEW_CRITERIA,
  DOC_MIME, VIDEO_MIME, DOC_MAX_BYTES, VIDEO_MAX_BYTES,
  PARTNER_DOCS, REQUIRED_PARTNER_DOCS, PARTNER_MAX_FILES,
} = require('../constants/careers')

const str = (v, n) => String(v == null ? '' : v).trim().slice(0, n)
const num = (v, lo, hi) => { const x = Number(v); return v === '' || v == null || !Number.isFinite(x) ? null : Math.min(hi, Math.max(lo, x)) }
const list = (v, n = 30, len = 80) => (Array.isArray(v) ? v : []).map(x => str(x, len)).filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).slice(0, n)
const isEmail = (e) => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(e)
const isUrl = (u) => /^https?:\/\/[^\s]+\.[^\s]+/i.test(u)

function checkUpload({ kind, mimeType, fileSize }) {
  const size = Number(fileSize) || 0
  if (kind === 'demo') {
    if (!VIDEO_MIME.includes(mimeType)) return 'The demo lesson must be a video (MP4, WebM, MOV or MKV).'
    if (size <= 0 || size > VIDEO_MAX_BYTES) return 'The demo lesson video must be under 1 GB. For a longer recording, share a link instead.'
    return ''
  }
  if (kind === 'document') {
    if (!DOC_MIME.includes(mimeType)) return 'Documents must be PDF, Word or an image (PNG, JPG, WebP).'
    if (size <= 0 || size > DOC_MAX_BYTES) return 'Each document must be under 15 MB.'
    return ''
  }
  return 'Unknown upload type.'
}

function uploadKey(appId, kind, fileName) {
  const safe = String(fileName || 'file').toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(-80) || 'file'
  return `careers/${appId}/${kind === 'demo' ? 'demo' : 'documents'}/${crypto.randomUUID()}-${safe}`
}

/** A file reference sent back by the browser after upload: it must be one of ours. */
function cleanFile(f, appId, kind) {
  if (!f || typeof f !== 'object' || !f.key) return null
  const prefix = `careers/${appId}/${kind === 'demo' ? 'demo' : 'documents'}/`
  if (!String(f.key).startsWith(prefix)) return null
  return { key: String(f.key).slice(0, 300), filename: str(f.filename, 200), mimeType: str(f.mimeType, 100), sizeBytes: Math.max(0, Number(f.sizeBytes) || 0) }
}

/** The submission, cleaned, with every error that stops it. */
function cleanApplication(body = {}, appId) {
  const errors = []
  const position = POSITIONS.includes(body.position) ? body.position : null
  if (!position) errors.push('Choose the position you are applying for.')
  const teaching = TEACHING_POSITIONS.includes(position)

  const update = {
    firstName: str(body.firstName, 80), lastName: str(body.lastName, 80),
    email: str(body.email, 160).toLowerCase(), phone: str(body.phone, 40),
    country: str(body.country, 80), city: str(body.city, 80), timezone: str(body.timezone, 60),
    linkedin: str(body.linkedin, 300),
    position: position || undefined, roleTitle: str(body.roleTitle, 120),
    employment: ['full_time', 'part_time', 'either'].includes(body.employment) ? body.employment : '',
    hoursPerWeek: num(body.hoursPerWeek, 0, 80),
    availableFrom: body.availableFrom && !isNaN(new Date(body.availableFrom)) ? new Date(body.availableFrom) : null,
    expectedPay: str(body.expectedPay, 120),
    curricula: list(body.curricula), subjects: list(body.subjects, 40), levels: list(body.levels, 20, 60),
    yearsExperience: num(body.yearsExperience, 0, 60), yearsOnline: num(body.yearsOnline, 0, 60),
    highestQualification: str(body.highestQualification, 60), teachingQualification: str(body.teachingQualification, 160),
    registration: str(body.registration, 160), examinerExperience: str(body.examinerExperience, 300),
    setup: {
      internet: str(body.setup?.internet, 60), backupPower: !!body.setup?.backupPower,
      headsetWebcam: !!body.setup?.headsetWebcam, pentablet: !!body.setup?.pentablet,
    },
    coverLetter: str(body.coverLetter, 6000), howHeard: str(body.howHeard, 120),
    consents: { accurate: !!body.consents?.accurate, safeguarding: !!body.consents?.safeguarding, data: !!body.consents?.data },
  }
  if (!update.firstName || !update.lastName) errors.push('Enter your first and last name.')
  if (!isEmail(update.email)) errors.push('Enter a valid email address.')
  if (!update.phone) errors.push('Enter a phone number (with country code).')
  if (!update.country) errors.push('Enter the country you live in.')
  if (update.linkedin && !isUrl(update.linkedin)) errors.push('The LinkedIn or profile link must start with http:// or https://.')
  if (position === 'non_teaching' && !update.roleTitle) errors.push('Tell us which non-teaching role you are applying for.')
  if (teaching) {
    if (!update.subjects.length) errors.push('Select at least one subject you would teach.')
    if (!update.curricula.length) errors.push('Select at least one curriculum you can teach.')
    if (update.yearsExperience == null) errors.push('Enter your years of teaching experience.')
  }

  // Documents: one entry per category; a file, or "in progress" where allowed.
  const known = new Set(APPLICANT_DOCS.map(d => d.key))
  const docs = []
  for (const d of (Array.isArray(body.documents) ? body.documents : []).slice(0, 30)) {
    if (!d || !known.has(d.category)) continue
    const file = cleanFile(d.file, appId, 'document')
    const pending = !file && !!d.pending && PENDING_OK.includes(d.category)
    if (!file && !pending) continue
    docs.push({ category: d.category, file, pending, note: str(d.note, 300) })
  }
  update.documents = docs
  const missing = requiredDocsFor(position).filter(k => !docs.some(d => d.category === k))
  if (missing.length) {
    const label = Object.fromEntries(APPLICANT_DOCS.map(d => [d.key, d.label]))
    errors.push('Upload these documents (or mark them in progress where allowed): ' + missing.map(k => label[k]).join(', ') + '.')
  }

  // Demo lesson: required for teaching positions, as a file or a link.
  const demoFile = cleanFile(body.demoLesson?.file, appId, 'demo')
  const demoUrl = str(body.demoLesson?.url, 500)
  update.demoLesson = {
    file: demoFile, url: demoUrl,
    subject: str(body.demoLesson?.subject, 80), level: str(body.demoLesson?.level, 60),
    topic: str(body.demoLesson?.topic, 200), minutes: num(body.demoLesson?.minutes, 0, 240), notes: str(body.demoLesson?.notes, 1000),
  }
  if (demoUrl && !isUrl(demoUrl)) errors.push('The demo lesson link must start with http:// or https://.')
  if (teaching && !demoFile && !demoUrl) errors.push('Add your demo lesson: upload the recording or share a link to it.')
  if (teaching && (demoFile || demoUrl) && !update.demoLesson.topic) errors.push('Tell us the topic of your demo lesson.')

  if (!update.consents.accurate || !update.consents.data) errors.push('Confirm the declarations at the end of the form.')
  if (teaching && !update.consents.safeguarding) errors.push('Confirm the safeguarding declaration.')
  return { update, errors }
}

function flags(app) {
  const docs = app.documents || []
  const missingDocs = requiredDocsFor(app.position).filter(k => !docs.some(d => d.category === k && (d.file || d.pending)))
  const pendingDocs = docs.filter(d => d.pending).map(d => d.category)
  return {
    docsComplete: !missingDocs.length && !pendingDocs.length,
    hasDemo: !!(app.demoLesson && (app.demoLesson.file || app.demoLesson.url)),
    missingDocs, pendingDocs,
  }
}

function avgScore(reviews = []) {
  const means = reviews.map(r => {
    const v = REVIEW_CRITERIA.map(k => Number(r.scores?.[k])).filter(x => x >= 1 && x <= 5)
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
  }).filter(x => x != null)
  return means.length ? Math.round(10 * means.reduce((a, b) => a + b, 0) / means.length) / 10 : null
}

/** A partnership type's answers: flat strings, numbers, booleans and short lists only. */
function cleanDetails(obj) {
  const out = {}
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return out
  for (const [k, v] of Object.entries(obj).slice(0, 30)) {
    const key = String(k).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 40)
    if (!key || key.startsWith('$')) continue
    if (Array.isArray(v)) out[key] = list(v, 20, 120)
    else if (typeof v === 'boolean') out[key] = v
    else if (typeof v === 'number' && Number.isFinite(v)) out[key] = v
    else if (v != null && typeof v !== 'object') out[key] = str(v, 1000)
  }
  return out
}

const ref = (prefix, n, d = new Date()) => `${prefix}-${d.getUTCFullYear()}-${String(n).padStart(4, '0')}`
const hashToken = (t) => crypto.createHash('sha256').update(String(t)).digest('hex')

// ── Partnership documents ────────────────────────────────────
const PARTNER_PREFIX = 'partnerships/uploads/'
const safeName = (f) => String(f || 'file').toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(-80) || 'file'
function partnerUploadKey(category, fileName) {
  return `${PARTNER_PREFIX}${crypto.randomUUID()}/${category}-${safeName(fileName)}`
}
const signKey = (key) => crypto.createHmac('sha256', process.env.JWT_SECRET || 'smartious-dev').update('partner-doc:' + key).digest('hex').slice(0, 32)
const sameSig = (a, b) => { const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || '')); return x.length === y.length && crypto.timingSafeEqual(x, y) }

/** → { docs: [{ category, key, filename, mimeType, sizeBytes }], missing: [category] } */
function cleanPartnerDocs(input) {
  const docs = []
  for (const d of (Array.isArray(input) ? input : []).slice(0, PARTNER_MAX_FILES)) {
    if (!d || !PARTNER_DOCS.includes(d.category)) continue
    const key = String(d.key || '')
    if (!key.startsWith(PARTNER_PREFIX) || !key.split('/')[3]?.startsWith(d.category + '-') || !sameSig(d.sig, signKey(key))) continue
    if (docs.some(x => x.key === key)) continue
    docs.push({ category: d.category, key: key.slice(0, 300), filename: str(d.filename, 200), mimeType: str(d.mimeType, 100), sizeBytes: Math.max(0, Number(d.sizeBytes) || 0) })
  }
  const missing = REQUIRED_PARTNER_DOCS.filter(k => !docs.some(d => d.category === k))
  return { docs, missing }
}

module.exports = { partnerUploadKey, signKey, cleanPartnerDocs, PARTNER_PREFIX, checkUpload, uploadKey, cleanFile, cleanApplication, flags, avgScore, cleanDetails, ref, hashToken, isEmail, isUrl, str }
