/**
 * lib/paystackReceipt.js — receipts for Paystack card payments.
 *
 *   receiptFor(request, invoice?) → { inv, receiptNo }   what the receipt PDF is built from
 *   sendPaystackReceipt(request, { to }) → { to, receiptNo }
 *
 * A request tied to a paid invoice gets that invoice's own receipt
 * (SM-RCP-<invoice no.>). A request on its own (no invoice) gets a
 * receipt for the payment itself: SM-RCP-<reference>, one line for
 * what was paid, "Paid by card through Paystack".
 */
const Invoice = require('../models/Invoice')
const PaystackRequest = require('../models/PaystackRequest')
const { getTransporter } = require('./issueInvoice')
const { buildReceiptEmailHTML, receiptNoFor } = require('./markInvoicePaid')

let buildReceiptPdfBuffer = null
try { ({ buildReceiptPdfBuffer } = require('./invoicePdf')) } catch (e) { console.warn('[paystackReceipt] PDF disabled -', e.message) }

const requestReceiptNo = (r) => 'SM-RCP-' + String(r.reference).replace(/^SMT-/, '')
const CHANNEL = { card: 'card', bank: 'bank', mobile_money: 'mobile money', bank_transfer: 'bank transfer', ussd: 'USSD' }

/** Pure: the receipt document for a request without a paid invoice. */
function standaloneReceipt(r) {
  const amount = Number(r.amount || 0)
  const how = r.manualMethod ? r.manualMethod : 'Paid by ' + (CHANNEL[r.channel] || 'card') + ' through Paystack'
  return {
    inv: {
      invoiceNo: r.reference,
      receiptFor: 'Payment reference: ' + r.reference,
      billedToName: r.payerName || r.email,
      billedToEmail: r.email,
      currency: r.currency,
      lineItems: [{ description: r.description || 'School fees', amount }],
      subtotal: amount, totalDue: amount, paidAmount: amount,
      paidAt: r.paidAt || new Date(),
      paymentNote: how + ' (reference ' + r.reference + ')',
    },
    receiptNo: requestReceiptNo(r),
  }
}

async function receiptFor(r) {
  if (r.invoiceId) {
    const inv = await Invoice.findById(r.invoiceId).lean()
    if (inv && inv.status === 'paid') return { inv, receiptNo: receiptNoFor(inv), invoice: true }
  }
  return { ...standaloneReceipt(r), invoice: false }
}

function standaloneEmailHTML(r, receiptNo) {
  // The invoice receipt email, worded for a payment rather than an invoice.
  return buildReceiptEmailHTML({ billedToName: r.payerName || 'Parent', currency: r.currency, totalDue: r.amount, invoiceNo: r.description || r.reference, paidAt: r.paidAt }, receiptNo)
    .replace('for invoice <strong>', 'for <strong>')
}

async function sendPaystackReceipt(r, { to } = {}) {
  if (r.status !== 'paid') throw new Error('A receipt can only be sent for a paid request.')
  const t = getTransporter()
  if (!t) throw new Error('Email is not configured on the server.')
  const { inv, receiptNo, invoice } = await receiptFor(r)
  const email = String(to || (invoice ? inv.billedToEmail : '') || r.email || '').trim().toLowerCase()
  if (!/.+@.+\..+/.test(email)) throw new Error('No valid email address for this receipt.')
  const attachments = []
  if (buildReceiptPdfBuffer) {
    try { attachments.push({ filename: receiptNo + '.pdf', content: await buildReceiptPdfBuffer(inv, receiptNo), contentType: 'application/pdf' }) }
    catch (e) { console.error('[paystack receipt pdf]', e.message) }
  }
  await t.sendMail({
    from: process.env.EMAIL_FROM || 'Smartious Billing <hello@smartioushomeschool.com>',
    to: email, replyTo: 'accounts@smartioushomeschool.com',
    subject: `Payment receipt ${receiptNo} — Smartious Homeschool Global`,
    html: invoice ? buildReceiptEmailHTML(inv, receiptNo) : standaloneEmailHTML(r, receiptNo),
    attachments,
  })
  await PaystackRequest.updateOne({ _id: r._id }, { $set: { receiptSentAt: new Date(), receiptSentTo: email } })
  return { to: email, receiptNo }
}

module.exports = { receiptFor, standaloneReceipt, sendPaystackReceipt, requestReceiptNo }
