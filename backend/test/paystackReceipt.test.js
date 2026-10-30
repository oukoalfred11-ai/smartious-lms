const test = require('node:test')
const assert = require('node:assert')
const Module = require('node:module')

// The receipt helper loads models; give it stand-ins so the pure part tests without a database.
const realLoad = Module._load
Module._load = function (req, ...rest) {
  if (/(^|\/)(Invoice|PaystackRequest)$/.test(req)) return {}
  if (/(^|\/)issueInvoice$/.test(req)) return { getTransporter: () => null }
  if (/(^|\/)invoicePdf$/.test(req)) return {}
  if (/(^|\/)markInvoicePaid$/.test(req)) return { buildReceiptEmailHTML: () => '', receiptNoFor: (i) => 'SM-RCP-' + i.invoiceNo }
  return realLoad.call(this, req, ...rest)
}
const { standaloneReceipt, requestReceiptNo } = require('../src/lib/paystackReceipt')
Module._load = realLoad

test('a card payment with no invoice gets its own receipt', () => {
  const r = { reference: 'SMT-ABC-123', payerName: 'Amina', email: 'a@x.com', amount: 52000, currency: 'KES', description: 'Term 1 fees', channel: 'mobile_money', paidAt: new Date('2026-10-30') }
  const { inv, receiptNo } = standaloneReceipt(r)
  assert.strictEqual(receiptNo, 'SM-RCP-ABC-123')
  assert.strictEqual(requestReceiptNo(r), receiptNo)
  assert.strictEqual(inv.totalDue, 52000)
  assert.strictEqual(inv.paidAmount, 52000)
  assert.deepStrictEqual(inv.lineItems, [{ description: 'Term 1 fees', amount: 52000 }])
  assert.match(inv.paymentNote, /mobile money through Paystack/)
  assert.match(inv.receiptFor, /SMT-ABC-123/)
})

test('a payment marked paid by hand says how it was paid', () => {
  const { inv } = standaloneReceipt({ reference: 'SMT-X', email: 'a@x.com', amount: 10, currency: 'USD', manual: true, manualMethod: 'Bank transfer' })
  assert.match(inv.paymentNote, /^Bank transfer/)
  assert.strictEqual(inv.billedToName, 'a@x.com')
})
