const { test } = require('node:test')
const assert = require('node:assert')
const Module = require('module')

// POST /api/auth/reset-password (signed in, e.g. with a temporary
// password): the new password replaces it and clears the forced change,
// with no email code involved.
let me = null
const pass = (req, res, next) => next()
const load = Module._load
Module._load = function (req, ...rest) {
  if (/middleware\/auth$/.test(req)) return { auth: pass, requireRole: () => pass }
  if (/models\/User$/.test(req)) return { findById: async () => me, findOne: async () => null }
  return load.call(this, req, ...rest)
}
const router = require('../src/routes/auth')
const layer = router.stack.find(l => l.route && l.route.path === '/reset-password' && l.route.methods.post)
const fn = layer.route.stack[layer.route.stack.length - 1].handle
const call = (body) => new Promise((resolve) => {
  const res = { statusCode: 200, status(c) { this.statusCode = c; return this }, json(b) { resolve({ status: this.statusCode, body: b }) } }
  fn({ body, user: { _id: 'p1' } }, res)
})

test('choosing a password clears the forced change and any old codes', async () => {
  let saved = 0
  me = { _id: 'p1', password: 'TEMPpass22', mustChangePassword: true, otpCode: 'h', otpVerified: true, passwordResetToken: 't', save: async () => { saved++ } }
  const r = await call({ newPassword: 'my-own-pass-1' })
  assert.equal(r.status, 200)
  assert.equal(me.password, 'my-own-pass-1')
  assert.equal(me.mustChangePassword, false)
  assert.equal(me.otpCode, undefined); assert.equal(me.otpVerified, false); assert.equal(me.passwordResetToken, undefined)
  assert.equal(saved, 1)
})

test('a short password is refused and nothing changes', async () => {
  me = { _id: 'p1', password: 'TEMPpass22', mustChangePassword: true, save: async () => { throw new Error('should not save') } }
  const r = await call({ newPassword: 'short' })
  assert.equal(r.status, 400); assert.equal(me.mustChangePassword, true)
})
