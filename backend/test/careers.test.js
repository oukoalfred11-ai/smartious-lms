const test = require('node:test')
const assert = require('node:assert')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const C = require('../src/constants/careers')
const { checkUpload, uploadKey, cleanApplication, flags, avgScore, cleanDetails, ref } = require('../src/lib/careers')

const ID = '6a0000000000000000000001'
const doc = (category) => ({ category, file: { key: `careers/${ID}/documents/x-${category}.pdf`, filename: category + '.pdf', mimeType: 'application/pdf', sizeBytes: 1000 } })
const full = (over = {}) => ({
  firstName: 'Amina', lastName: 'Otieno', email: 'amina@example.com', phone: '+254700000000', country: 'Kenya',
  position: 'online_teacher', subjects: ['Chemistry'], curricula: ['Cambridge IGCSE'], yearsExperience: 6,
  documents: C.REQUIRED_DOCS.map(doc),
  demoLesson: { url: 'https://youtu.be/abc', topic: 'Moles' },
  consents: { accurate: true, safeguarding: true, data: true },
  ...over,
})

test('a complete teaching application passes', () => {
  const { errors, update } = cleanApplication(full(), ID)
  assert.deepStrictEqual(errors, [])
  assert.strictEqual(update.documents.length, C.REQUIRED_DOCS.length)
  assert.deepStrictEqual(flags(update), { docsComplete: true, hasDemo: true, missingDocs: [], pendingDocs: [] })
})

test('teaching applications need subjects, documents and a demo lesson', () => {
  const { errors } = cleanApplication(full({ subjects: [], documents: [], demoLesson: {} }), ID)
  assert.ok(errors.some(e => /subject/i.test(e)))
  assert.ok(errors.some(e => /Upload these documents/.test(e)))
  assert.ok(errors.some(e => /demo lesson/i.test(e)))
})

test('licence, police clearance and safeguarding may be "in progress"; the CV may not', () => {
  const docs = C.REQUIRED_DOCS.filter(k => !C.PENDING_OK.includes(k)).map(doc)
    .concat(C.PENDING_OK.map(category => ({ category, pending: true })))
  const ok = cleanApplication(full({ documents: docs }), ID)
  assert.deepStrictEqual(ok.errors, [])
  assert.strictEqual(flags(ok.update).docsComplete, false)
  assert.deepStrictEqual(flags(ok.update).pendingDocs.sort(), [...C.PENDING_OK].sort())
  const bad = cleanApplication(full({ documents: C.REQUIRED_DOCS.filter(k => k !== 'cv').map(doc).concat([{ category: 'cv', pending: true }]) }), ID)
  assert.ok(bad.errors.some(e => /CV/.test(e)))
})

test('files must belong to this application', () => {
  const stolen = { category: 'cv', file: { key: 'careers/someoneelse/documents/cv.pdf' } }
  const { update } = cleanApplication(full({ documents: [stolen] }), ID)
  assert.strictEqual(update.documents.length, 0)
})

test('non-teaching roles need no demo lesson, subjects or teaching documents', () => {
  const { errors } = cleanApplication(full({ position: 'non_teaching', roleTitle: 'Admissions officer', subjects: [], curricula: [], demoLesson: {}, yearsExperience: '', documents: C.REQUIRED_DOCS_STAFF.map(doc) }), ID)
  assert.deepStrictEqual(errors, [])
  assert.ok(!C.REQUIRED_DOCS_STAFF.includes('professional_certificate') && !C.REQUIRED_DOCS_STAFF.includes('contract'))
})

test('upload rules', () => {
  assert.strictEqual(checkUpload({ kind: 'document', mimeType: 'application/pdf', fileSize: 2e6 }), '')
  assert.match(checkUpload({ kind: 'document', mimeType: 'application/zip', fileSize: 2e6 }), /PDF/)
  assert.match(checkUpload({ kind: 'document', mimeType: 'application/pdf', fileSize: 30e6 }), /15 MB/)
  assert.strictEqual(checkUpload({ kind: 'demo', mimeType: 'video/mp4', fileSize: 500e6 }), '')
  assert.match(checkUpload({ kind: 'demo', mimeType: 'video/mp4', fileSize: 2e9 }), /1 GB/)
  assert.match(uploadKey(ID, 'demo', 'My Lesson (final).MP4'), new RegExp(`^careers/${ID}/demo/[0-9a-f-]{36}-my-lesson-final-.mp4$`))
})

test('review scores average per review, then across reviews', () => {
  assert.strictEqual(avgScore([]), null)
  assert.strictEqual(avgScore([{ scores: { subject_knowledge: 5, pedagogy: 3 } }, { scores: { pedagogy: 2 } }]), 3)
})

test('partnership details are flat and bounded', () => {
  const d = cleanDetails({ boards: ['Cambridge International', 'IB'], capacity: 40, '$where': 'x', nested: { a: 1 }, privateCandidates: 'Yes' })
  assert.deepStrictEqual(d, { boards: ['Cambridge International', 'IB'], capacity: 40, where: 'x', privateCandidates: 'Yes' })
  assert.strictEqual(ref('SMA', 42, new Date('2026-10-28')), 'SMA-2026-0042')
})

test('website and server lists use the same keys', async () => {
  const F = await import(pathToFileURL(path.join(__dirname, '../../frontend/src/data/careers.js')).href)
  const keys = (a) => a.map(x => x.key)
  assert.deepStrictEqual(keys(F.POSITIONS), C.POSITIONS)
  assert.deepStrictEqual(F.TEACHING_POSITIONS, C.TEACHING_POSITIONS)
  assert.deepStrictEqual(keys(F.APPLICATION_STATUSES), C.APPLICATION_STATUSES)
  assert.deepStrictEqual(keys(F.APPLICANT_DOCS), C.APPLICANT_DOCS.map(d => d.key))
  assert.deepStrictEqual(F.APPLICANT_DOCS.filter(d => d.required).map(d => d.key), C.REQUIRED_DOCS)
  assert.deepStrictEqual(F.APPLICANT_DOCS.filter(d => d.staffRequired).map(d => d.key), C.REQUIRED_DOCS_STAFF)
  assert.deepStrictEqual(F.APPLICANT_DOCS.filter(d => d.mayBePending).map(d => d.key), C.PENDING_OK)
  assert.deepStrictEqual(keys(F.REVIEW_CRITERIA), C.REVIEW_CRITERIA)
  assert.deepStrictEqual(keys(F.PARTNERSHIP_TYPES), C.PARTNERSHIP_TYPES)
  assert.deepStrictEqual(keys(F.PARTNERSHIP_STATUSES), C.PARTNERSHIP_STATUSES)
})
