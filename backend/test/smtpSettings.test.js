const test = require('node:test')
const assert = require('node:assert')

const KEYS = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_PASS', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
function withEnv(env, fn) {
  const saved = Object.fromEntries(KEYS.map(k => [k, process.env[k]]))
  KEYS.forEach(k => delete process.env[k]); Object.assign(process.env, env)
  try { return fn() } finally { KEYS.forEach(k => { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k] }) }
}
const { getTransporter } = require('../src/lib/issueInvoice')

test('no credentials: no transporter', () => {
  withEnv({}, () => assert.strictEqual(getTransporter(), null))
})
test('EMAIL_* names work', () => {
  withEnv({ EMAIL_USER: 'a@x.com', EMAIL_PASSWORD: 'p' }, () => assert.ok(getTransporter()))
})
test('SMTP_* names work too', () => {
  withEnv({ SMTP_HOST: 'smtp.example.com', SMTP_PORT: '465', SMTP_USER: 'a@x.com', SMTP_PASS: 'p' }, () => {
    const t = getTransporter()
    assert.ok(t)
    assert.strictEqual(t.options.host, 'smtp.example.com')
    assert.strictEqual(t.options.secure, true)
  })
})
test('EMAIL_PASS works too', () => {
  withEnv({ EMAIL_USER: 'a@x.com', EMAIL_PASS: 'p' }, () => assert.ok(getTransporter()))
})
