/**
 * Integration tests for routes/lab.js.
 *
 * Runs the real route handlers with in-memory stand-ins for Express, the
 * auth middleware and the Mongoose models (this environment has no
 * database), so the request flow, permission checks, conflict handling and
 * marking are exercised end to end. Run: node --test backend/test/
 */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const Module = require('module')
const path = require('path')
const crypto = require('crypto')

// ── In-memory "database" ────────────────────────────────────
const oid = () => crypto.randomBytes(12).toString('hex')
const isId = (v) => /^[a-f0-9]{24}$/.test(String(v))
const get = (o, k) => k.split('.').reduce((a, p) => (a == null ? a : a[p]), o)
function matches(doc, f) {
  return Object.entries(f || {}).every(([k, v]) => {
    if (k === '$or') return v.some((g) => matches(doc, g))
    const val = get(doc, k)
    if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      if ('$in' in v) return v.$in.map(String).some((x) => (Array.isArray(val) ? val.map(String).includes(x) : String(val) === x))
      if ('$ne' in v) return String(val) !== String(v.$ne)
    }
    if (Array.isArray(val)) return val.map(String).includes(String(v))
    if (v === null) return val == null
    return String(val) === String(v)
  })
}
class Query {
  constructor(p) { this.p = p }
  sort(s) { this.s = s; return this } limit() { return this } select() { return this } lean() { return this }
  distinct(k) { return new Query(this.p.then((r) => [...new Set(r.map((d) => String(d[k])))])) }
  then(res, rej) { return this.p.then((r) => {
    if (Array.isArray(r) && this.s) { const [[k, d]] = Object.entries(this.s); r = [...r].sort((a, b) => (a[k] > b[k] ? d : -d)) }
    return r }).then(res, rej) }
}
function model(name, defaults = {}) {
  const rows = []
  const wrapDoc = (d) => d && Object.assign(Object.create({ toObject() { return JSON.parse(JSON.stringify(this)) }, save() { return Promise.resolve(this) } }), d)
  const applyUpdate = (d, u) => {
    for (const [k, v] of Object.entries(u.$set || {})) d[k] = v
    for (const [k, v] of Object.entries(u.$push || {})) { d[k] = d[k] || []; if (v && v.$each) d[k].push(...v.$each); else d[k].push(v) }
    d.updatedAt = new Date()
  }
  const M = {
    rows,
    find: (f) => new Query(Promise.resolve(rows.filter((r) => matches(r, f)).map(wrapDoc))),
    findOne: (f) => new Query(Promise.resolve(rows.filter((r) => matches(r, f)).map(wrapDoc)).then((a) => a[0] || null)),
    findById: (id) => new Query(Promise.resolve(wrapDoc(rows.find((r) => String(r._id) === String(id)) || null))),
    exists: async (f) => rows.some((r) => matches(r, f)),
    countDocuments: async (f) => rows.filter((r) => matches(r, f)).length,
    distinct: (k, f) => new Query(Promise.resolve([...new Set(rows.filter((r) => matches(r, f)).map((r) => r[k]))])),
    aggregate: async () => [],
    create: async (d) => {
      const doc = { _id: oid(), ...JSON.parse(JSON.stringify(defaults)), ...d, createdAt: new Date(), updatedAt: new Date() }
      if (name === 'LabSession' && rows.some((r) => ['studentId', 'experimentId', 'assignmentId', 'attempt'].every((k) => String(r[k]) === String(doc[k]))))
        throw Object.assign(new Error('dup'), { code: 11000 })
      rows.push(doc); return wrapDoc(doc)
    },
    findOneAndUpdate: async (f, u, o = {}) => {
      let d = rows.find((r) => matches(r, f))
      if (!d && o.upsert) { d = { _id: oid(), ...defaults, ...f }; rows.push(d) }
      if (!d) return null
      applyUpdate(d, u); return wrapDoc(d)
    },
    findByIdAndUpdate: async (id, u) => { const d = rows.find((r) => String(r._id) === String(id)); if (!d) return null; applyUpdate(d, u); return wrapDoc(d) },
  }
  return M
}
const DB = {
  User: model('User'), Allocation: model('Allocation'),
  LabSession: model('LabSession', { actions: [], notebook: {}, answers: {}, revision: 0, status: 'in_progress', options: {}, history: [], rubricMarks: {}, feedback: '' }),
  LabAssignment: model('LabAssignment', { status: 'active', options: {} }), LabContent: model('LabContent', { status: 'review', history: [] }),
}

// ── Minimal Express stand-in ────────────────────────────────
function fakeExpress() {
  const routes = []
  const router = {}
  for (const m of ['get', 'post', 'put', 'patch', 'delete']) router[m] = (p, ...h) => routes.push({ m, p, h })
  const e = () => ({})
  e.Router = () => { router.routes = routes; return router }
  return e
}
const stubs = {
  express: fakeExpress(),
  'express-rate-limit': () => (req, res, next) => next(),
  mongoose: { isValidObjectId: isId },
}
const origLoad = Module._load
Module._load = function (req, parent, isMain) {
  if (stubs[req]) return stubs[req]
  if (req.endsWith('/middleware/auth')) return {
    auth: (q, s, n) => n(),
    requireRole: (...roles) => (q, s, n) => (roles.includes(q.user.role) || (roles.includes('ops_manager') && q.user.role === 'dos') ? n() : s.status(403).json({ success: false, message: 'role' })),
  }
  for (const m of Object.keys(DB)) if (req.endsWith('/models/' + m)) return DB[m]
  return origLoad.apply(this, arguments)
}
const router = require(path.join(__dirname, '..', 'src', 'routes', 'lab.js'))

async function call(user, method, url, body = {}) {
  const [p, qs] = url.split('?')
  const route = router.routes.find((r) => r.m === method && new RegExp('^' + r.p.replace(/:[^/]+/g, '([^/]+)').replace(/\./g, '\\.') + '$').test(p))
  if (!route) throw new Error('no route ' + method + ' ' + url)
  const names = (route.p.match(/:[^/]+/g) || []).map((x) => x.slice(1))
  const vals = new RegExp('^' + route.p.replace(/:[^/]+/g, '([^/]+)').replace(/\./g, '\\.') + '$').exec(p).slice(1)
  const req = { user, body, params: Object.fromEntries(names.map((n, i) => [n, vals[i]])), query: Object.fromEntries(new URLSearchParams(qs || '')), method, originalUrl: url }
  const res = { statusCode: 200, body: null, headers: {}, status(c) { this.statusCode = c; return this }, json(b) { this.body = b; return this }, setHeader(k, v) { this.headers[k] = v }, send(b) { this.body = b; return this } }
  for (const h of route.h) {
    let nextCalled = false
    await h(req, res, () => { nextCalled = true })
    if (!nextCalled) break
  }
  return res
}

// ── Fixtures ────────────────────────────────────────────────
const mk = (role, first) => { const u = { _id: oid(), role, firstName: first, lastName: 'Test', linkedStudents: [] }; DB.User.rows.push(u); return u }
const admin = mk('admin', 'Ada'), dean = mk('dos', 'Dee'), teacher = mk('teacher', 'Tom'), otherTeacher = mk('teacher', 'Una')
const student = mk('student', 'Sam'), stranger = mk('student', 'Stan'), parent = mk('parent', 'Pat'), accountant = mk('accountant', 'Acc')
parent.linkedStudents = [student._id]
DB.Allocation.rows.push({ _id: oid(), teacherId: teacher._id, studentId: student._id, status: 'Active' })

test('students cannot open experiments that are not published', async () => {
  const r = await call(student, 'post', '/sessions', { experimentId: 'phys-ohms-law' })
  assert.equal(r.statusCode, 403)
  const list = await call(student, 'get', '/experiments')
  assert.equal(list.body.data.experiments.length, 0)
})

test('only admin/Dean can change publication status; definitions are validated', async () => {
  assert.equal((await call(teacher, 'patch', '/experiments/phys-ohms-law/status', { status: 'published' })).statusCode, 403)
  const r = await call(admin, 'patch', '/experiments/phys-ohms-law/status', { status: 'published', note: 'Checked by physics lead' })
  assert.equal(r.statusCode, 200, JSON.stringify(r.body))
  assert.equal((await call(dean, 'patch', '/experiments/chem-titration/status', { status: 'approved' })).statusCode, 200)
  assert.equal((await call(admin, 'patch', '/experiments/nope/status', { status: 'published' })).statusCode, 404)
})

let sessionId, revision = 0
test('a student opens, saves and resumes a session; refresh returns the same session', async () => {
  const r = await call(student, 'post', '/sessions', { experimentId: 'phys-ohms-law' })
  assert.equal(r.statusCode, 201, JSON.stringify(r.body))
  sessionId = String(r.body.data.session._id)
  assert.ok(r.body.data.session.seed)
  assert.equal(r.body.data.session.submissionKey, undefined)
  const again = await call(student, 'post', '/sessions', { experimentId: 'phys-ohms-law' })
  assert.equal(String(again.body.data.session._id), sessionId)
  const wires = [['PS.+', 'S1.a'], ['S1.b', 'A1.+'], ['A1.-', 'R1.a'], ['R1.b', 'PS.-'], ['V1.+', 'R1.a'], ['V1.-', 'R1.b']]
  const s = await call(student, 'put', '/sessions/' + sessionId, { baseRevision: 0, fromIndex: 0, newActions: wires.map(([a, b]) => ({ type: 'connect', payload: { a, b } })), notebook: { hypothesis: 'V is proportional to I' } })
  assert.equal(s.statusCode, 200, JSON.stringify(s.body))
  revision = s.body.data.revision
  const got = await call(student, 'get', '/sessions/' + sessionId)
  assert.equal(got.body.data.session.actions.length, 6)
  assert.equal(got.body.data.session.notebook.hypothesis, 'V is proportional to I')
})

test('a stale save is a 409 conflict and nothing is lost', async () => {
  const r = await call(student, 'put', '/sessions/' + sessionId, { baseRevision: revision - 1, fromIndex: 0, newActions: [] })
  assert.equal(r.statusCode, 409)
  assert.equal(r.body.conflict, true)
  const got = await call(student, 'get', '/sessions/' + sessionId)
  assert.equal(got.body.data.session.actions.length, 6)
})

test('an invalid action is rejected with 422 and not stored', async () => {
  const r = await call(student, 'put', '/sessions/' + sessionId, { baseRevision: revision, fromIndex: 6, newActions: [{ type: 'setSupply', payload: { volts: 400 } }] })
  assert.equal(r.statusCode, 422)
  const got = await call(student, 'get', '/sessions/' + sessionId)
  assert.equal(got.body.data.session.actions.length, 6)
})

test('other students, other teachers and unrelated staff cannot see the work', async () => {
  assert.equal((await call(stranger, 'get', '/sessions/' + sessionId)).statusCode, 403)
  assert.equal((await call(otherTeacher, 'get', '/sessions/' + sessionId)).statusCode, 403)
  assert.equal((await call(accountant, 'get', '/sessions/' + sessionId)).statusCode, 403)
  assert.equal((await call(stranger, 'put', '/sessions/' + sessionId, { baseRevision: revision, fromIndex: 6, newActions: [] })).statusCode, 403)
  assert.equal((await call(teacher, 'get', '/sessions/' + sessionId)).statusCode, 200)
  assert.equal((await call(parent, 'get', '/sessions/' + sessionId)).statusCode, 403, 'parents see only submitted work')
})

test('submission is graded on the server and duplicate submits are safe', async () => {
  const add = [{ type: 'setSupply', payload: { volts: 6 } }, { type: 'toggleSwitch' }]
  const s = await call(student, 'put', '/sessions/' + sessionId, { baseRevision: revision, fromIndex: 6, newActions: add, answers: { gradient: '20', ohmic: '0' } })
  revision = s.body.data.revision
  const key = 'submit-key-123456'
  const r1 = await call(student, 'post', '/sessions/' + sessionId + '/submit', { baseRevision: revision, submissionKey: key })
  assert.equal(r1.statusCode, 200, JSON.stringify(r1.body))
  assert.equal(r1.body.data.session.status, 'submitted')
  assert.ok(r1.body.data.session.autoGrade.rows.length)
  const r2 = await call(student, 'post', '/sessions/' + sessionId + '/submit', { baseRevision: revision, submissionKey: key })
  assert.equal(r2.statusCode, 200)
  assert.equal(DB.LabSession.rows.filter((x) => String(x._id) === sessionId).length, 1)
  assert.equal((await call(student, 'put', '/sessions/' + sessionId, { baseRevision: revision + 1, fromIndex: 8, newActions: [] })).statusCode, 409, 'no edits after submission')
  assert.equal((await call(parent, 'get', '/sessions/' + sessionId)).statusCode, 200, 'parent can now see it')
})

test('only the student’s teacher (or admin/Dean) can mark; return needs feedback', async () => {
  assert.equal((await call(otherTeacher, 'post', '/sessions/' + sessionId + '/mark', { marks: { report: 3 }, action: 'mark' })).statusCode, 403)
  assert.equal((await call(student, 'post', '/sessions/' + sessionId + '/mark', { marks: { report: 4 }, action: 'mark' })).statusCode, 403)
  const ret = await call(teacher, 'post', '/sessions/' + sessionId + '/mark', { action: 'return', feedback: '' })
  assert.equal(ret.statusCode, 400)
  const ok = await call(teacher, 'post', '/sessions/' + sessionId + '/mark', { marks: { report: 3 }, feedback: 'Clear graph; add units.', action: 'mark' })
  assert.equal(ok.statusCode, 200, JSON.stringify(ok.body))
  assert.equal(ok.body.data.session.status, 'marked')
  assert.equal(ok.body.data.session.feedback, 'Clear graph; add units.')
})

test('teachers can only assign approved experiments to their own students', async () => {
  assert.equal((await call(teacher, 'post', '/assignments', { experimentId: 'bio-osmosis', studentIds: [student._id] })).statusCode, 409, 'still in review')
  assert.equal((await call(teacher, 'post', '/assignments', { experimentId: 'chem-titration', studentIds: [stranger._id] })).statusCode, 403)
  const ok = await call(teacher, 'post', '/assignments', { experimentId: 'chem-titration', studentIds: [student._id], options: { acid: 'CH3COOH' }, dueAt: '2026-11-30' })
  assert.equal(ok.statusCode, 201, JSON.stringify(ok.body))
  const aId = String(ok.body.data.assignment._id)
  // the assigned student can open the approved (not yet published) experiment, with the assignment's acid
  const s = await call(student, 'post', '/sessions', { experimentId: 'chem-titration', assignmentId: aId })
  assert.equal(s.statusCode, 201, JSON.stringify(s.body))
  assert.equal(s.body.data.session.options.acid, 'CH3COOH')
  assert.equal((await call(stranger, 'post', '/sessions', { experimentId: 'chem-titration', assignmentId: aId })).statusCode, 404)
  const mine = await call(student, 'get', '/assignments')
  assert.equal(mine.body.data.assignments.length, 1)
  assert.equal(mine.body.data.assignments[0].studentIds, undefined, 'other students are not revealed')
})

test('review list is scoped to the teacher’s students', async () => {
  const t = await call(teacher, 'get', '/review')
  assert.ok(t.body.data.sessions.every((s) => String(s.studentId) === String(student._id)))
  const o = await call(otherTeacher, 'get', '/review')
  assert.equal(o.body.data.sessions.length, 0)
  assert.equal((await call(student, 'get', '/review')).statusCode, 403)
})

test('admin/Dean can publish practicals in bulk; a student then completes one end to end', async () => {
  assert.equal((await call(teacher, 'post', '/experiments/bulk-status', { ids: ['phys-al-1-1'], status: 'published' })).statusCode, 403)
  const r = await call(dean, 'post', '/experiments/bulk-status', { ids: ['phys-al-1-1', 'phys-al-1-2', 'nope'], status: 'published' })
  assert.equal(r.statusCode, 200)
  assert.deepEqual(r.body.data.done, ['phys-al-1-1', 'phys-al-1-2'])
  assert.equal(r.body.data.refused[0].id, 'nope')
  const list = await call(stranger, 'get', '/experiments')
  assert.ok(list.body.data.experiments.some((e) => e.id === 'phys-al-1-1' && e.collection?.code === '1.1'))

  const open = await call(stranger, 'post', '/sessions', { experimentId: 'phys-al-1-1' })
  assert.ok([200, 201].includes(open.statusCode), JSON.stringify(open.body))
  const s = open.body.data.session
  const { carefulRun } = await import(path.join(__dirname, '..', '..', 'shared', 'lab', 'test', 'careful.js'))
  const { getExperiment } = await import(path.join(__dirname, '..', '..', 'shared', 'lab', 'experiments', 'index.js'))
  assert.equal(s.options.bench, 2, 'new physics attempts use the hands-on bench')
  const run = carefulRun(getExperiment('phys-al-1-1'), s.seed, { options: s.options })
  const save = await call(stranger, 'put', '/sessions/' + s._id, { baseRevision: s.revision, fromIndex: 0, newActions: run.actions, notebook: { aim: 'Density' }, answers: run.answers })
  assert.equal(save.statusCode, 200, JSON.stringify(save.body))
  const sub = await call(stranger, 'post', '/sessions/' + s._id + '/submit', { baseRevision: save.body.data.revision, submissionKey: 'key-al-1-0001' })
  assert.equal(sub.statusCode, 200, JSON.stringify(sub.body))
  const g = sub.body.data.session.autoGrade
  for (const row of g.rows.filter((x) => x.auto)) assert.equal(row.marks, row.max, row.label + ': ' + row.detail)
})
