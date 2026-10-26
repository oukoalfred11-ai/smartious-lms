const { test } = require('node:test')
const assert = require('node:assert')
const Module = require('module')

// Stubs: jsonwebtoken (behaviour set per test) and the User model.
let verify = () => ({ id: 'u1', role: 'student' })
let findById = async () => ({ _id: 'u1', role: 'student', isActive: true, email: 's@x.com' })
const jwtStub = { verify: (...a) => verify(...a), sign: () => 'fresh' }
const userStub = { findById: (...a) => ({ select: () => findById(...a) }), updateOne: () => ({ catch() {} }), find: () => ({ select: () => ({ lean: async () => [] }) }) }
const load = Module._load
Module._load = function (req, ...rest) {
  if (req === 'jsonwebtoken') return jwtStub
  if (/models\/User$/.test(req)) return userStub
  return load.call(this, req, ...rest)
}
const { auth } = require('../src/middleware/auth')

function call() {
  return new Promise((resolve) => {
    const req = { headers: { authorization: 'Bearer t' }, method: 'GET', originalUrl: '/api/x', baseUrl: '/api/x' }
    const res = { headers: {}, statusCode: 200, set(k, v) { this.headers[k] = v; return this }, status(c) { this.statusCode = c; return this }, json(b) { resolve({ status: this.statusCode, body: b, headers: this.headers }) } }
    auth(req, res, () => resolve({ status: 'next', user: req.user }))
  })
}
const err = (name, message = name) => Object.assign(new Error(message), { name })

test('a valid session passes', async () => {
  verify = () => ({ id: 'u1', role: 'student' }); findById = async () => ({ _id: 'u1', role: 'student', isActive: true })
  assert.equal((await call()).status, 'next')
})
test('expired and invalid tokens are 401 with a clear message', async () => {
  verify = () => { throw err('TokenExpiredError', 'jwt expired') }
  let r = await call(); assert.equal(r.status, 401); assert.equal(r.body.code, 'SESSION_EXPIRED')
  verify = () => { throw err('JsonWebTokenError', 'invalid signature') }
  r = await call(); assert.equal(r.status, 401); assert.equal(r.body.code, 'INVALID_TOKEN')
})
test('a database fault is 503, never 401, so nobody is signed out', async () => {
  verify = () => ({ id: 'u1', role: 'student' })
  findById = async () => { throw err('MongooseError', 'Operation `users.findOne()` buffering timed out after 10000ms') }
  const r = await call()
  assert.equal(r.status, 503); assert.equal(r.body.code, 'AUTH_UNAVAILABLE'); assert.equal(r.headers['Retry-After'], '2')
})
test('a deleted or deactivated account is still refused', async () => {
  findById = async () => null
  assert.equal((await call()).status, 401)
  findById = async () => ({ _id: 'u1', role: 'student', isActive: false, email: 'x@y.z' })
  assert.equal((await call()).status, 403)
})
