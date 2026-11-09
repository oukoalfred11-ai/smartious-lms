const test = require('node:test')
const assert = require('node:assert')
const Module = require('node:module')

// The route loads models and the auth middleware; stand-ins let the email helper run without a database.
const updates = []
let transporter = null
const realLoad = Module._load
Module._load = function (req, ...rest) {
  if (/(^|\/)PaystackRequest$/.test(req)) return { updateOne: async (q, u) => { updates.push(u.$set) } }
  if (/(^|\/)Invoice$/.test(req)) return {}
  if (/(^|\/)issueInvoice$/.test(req)) return { getTransporter: () => transporter }
  if (/(^|\/)middleware\/auth$/.test(req)) return { auth: (q, r, n) => n(), requireRole: () => (q, r, n) => n() }
  if (/(^|\/)(paystackReceipt|markInvoicePaid|invoicePdf)$/.test(req)) return { sendPaystackReceipt: async () => ({}), receiptFor: async () => ({}) }
  return realLoad.call(this, req, ...rest)
}
const { sendRequestEmail, requestEmailHTML } = require('../src/routes/paystack')._test
Module._load = realLoad

const doc = { _id: 'r1', reference: 'SMT-ABC-1', email: 'parent@example.com', payerName: 'A <Parent>', amount: 52000, currency: 'KES', description: 'Invoice SM-INV-1', authorizationUrl: 'https://checkout.paystack.com/xyz' }

test('the Pay Now email is sent and recorded on the request', async () => {
  updates.length = 0
  let sent = null
  transporter = { sendMail: async (m) => { sent = m; return { messageId: 'x' } } }
  const out = await sendRequestEmail(doc)
  assert.deepStrictEqual(out, { ok: true, to: 'parent@example.com' })
  assert.strictEqual(sent.to, 'parent@example.com')
  // Billing must reach a family paused for unpaid fees: it skips the recipient gate.
  assert.strictEqual(sent.smartiousBypassGate, true)
  assert.match(sent.html, /checkout\.paystack\.com\/xyz/)
  assert.ok(updates.at(-1).requestEmailSentAt instanceof Date)
  assert.strictEqual(updates.at(-1).requestEmailError, '')
})

test('a send failure is reported and recorded, not swallowed', async () => {
  updates.length = 0
  transporter = { sendMail: async () => { throw new Error('Invalid login: 535 Authentication failed') } }
  const out = await sendRequestEmail(doc)
  assert.strictEqual(out.ok, false)
  assert.match(out.error, /535/)
  assert.match(updates.at(-1).requestEmailError, /535/)
})

test('no SMTP settings on the server is reported', async () => {
  transporter = null
  const out = await sendRequestEmail(doc)
  assert.strictEqual(out.ok, false)
  assert.match(out.error, /not configured/)
})

test('a send the recipient gate skipped counts as not sent', async () => {
  transporter = { sendMail: async () => ({ gateSkipped: true, messageId: 'skipped-by-recipient-gate' }) }
  const out = await sendRequestEmail(doc)
  assert.strictEqual(out.ok, false)
  assert.match(out.error, /archived, paused or deactivated/)
})

test('resending to a corrected address uses that address', async () => {
  let sent = null
  transporter = { sendMail: async (m) => { sent = m; return {} } }
  const out = await sendRequestEmail(doc, { to: 'Other@Example.com' })
  assert.strictEqual(out.to, 'other@example.com')
  assert.strictEqual(sent.to, 'other@example.com')
})

test('names in the email are escaped', () => {
  assert.match(requestEmailHTML(doc), /A &lt;Parent&gt;/)
})
