const { test } = require('node:test')
const assert = require('node:assert')
const Module = require('module')

// Stubs: auth middleware (admin signed in), the User model and the email sender.
let target = null
let saved = 0
let mailed = []
let mailResult = { success: true }
const pass = (req, res, next) => next()
const authStub = { auth: pass, requireRole: () => pass, optionalAuth: pass }
const userStub = {
  findById: async (id) => target && String(target._id) === String(id) ? target : null,
  generateTempPassword: () => 'x',
}
const load = Module._load
Module._load = function (req, ...rest) {
  if (/middleware\/auth$/.test(req)) return authStub
  if (/models\/User$/.test(req)) return userStub
  if (/lib\/email$/.test(req)) return { sendWelcomeEmail: async () => ({}), sendPasswordResetByAdminEmail: async (a) => { mailed.push(a); return mailResult } }
  return load.call(this, req, ...rest)
}
const router = require('../src/routes/users')

function handler(method, path) {
  const layer = router.stack.find(l => l.route && l.route.path === path && l.route.methods[method])
  const fns = layer.route.stack.map(s => s.handle)
  return fns[fns.length - 1]
}
function call(fn, req) {
  return new Promise((resolve) => {
    const res = { statusCode: 200, status(c) { this.statusCode = c; return this }, json(b) { resolve({ status: this.statusCode, body: b }) } }
    fn(req, res)
  })
}
const doc = (o) => ({ _id: 'p1', role: 'parent', email: 'dad@example.com', firstName: 'Jurijs', lastName: 'D', save: async function () { saved++ }, ...o })
const admin = { email: 'admin@x.com', role: 'admin' }
const reset = () => handler('post', '/:id/reset-password')

test('a parent gets a readable temporary password, flagged to change, and it is emailed', async () => {
  target = doc({ otpCode: 'h', otpVerified: true, passwordResetToken: 't' }); saved = 0; mailed = []; mailResult = { success: true }
  const r = await call(reset(), { params: { id: 'p1' }, user: admin })
  assert.equal(r.status, 200)
  assert.match(r.body.tempPassword, /^[A-HJ-NP-Za-hj-np-z2-9]{10}$/)
  assert.equal(target.password, r.body.tempPassword)
  assert.equal(target.mustChangePassword, true)
  assert.equal(target.otpCode, undefined); assert.equal(target.otpVerified, false); assert.equal(target.passwordResetToken, undefined)
  assert.equal(saved, 1)
  assert.equal(r.body.emailed, true)
  assert.equal(mailed[0].to, 'dad@example.com'); assert.equal(mailed[0].tempPassword, r.body.tempPassword)
})

test('the password is still returned when the email fails', async () => {
  target = doc(); mailResult = { success: false }
  const r = await call(reset(), { params: { id: 'p1' }, user: admin })
  assert.equal(r.status, 200); assert.equal(r.body.emailed, false); assert.ok(r.body.tempPassword)
})

test('staff passwords are refused', async () => {
  for (const role of ['admin', 'teacher', 'ops_manager', 'accountant']) {
    target = doc({ role }); saved = 0
    const r = await call(reset(), { params: { id: 'p1' }, user: admin })
    assert.equal(r.status, 403); assert.equal(saved, 0)
  }
})

test('archived and missing accounts are refused', async () => {
  target = doc({ archived: true }); saved = 0
  assert.equal((await call(reset(), { params: { id: 'p1' }, user: admin })).status, 400)
  target = null
  assert.equal((await call(reset(), { params: { id: 'p1' }, user: admin })).status, 404)
  assert.equal(saved, 0)
})

test('two resets give different passwords', async () => {
  target = doc(); const a = (await call(reset(), { params: { id: 'p1' }, user: admin })).body.tempPassword
  target = doc(); const b = (await call(reset(), { params: { id: 'p1' }, user: admin })).body.tempPassword
  assert.notEqual(a, b)
})
