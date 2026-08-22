/**
 * lib/invoicePdf.js
 * ============================================================
 * Server-side branded PDF generation for invoices and receipts.
 * Attached to emails in routes/invoices.js and streamed by the
 * /pdf, /receipt-pdf and /preview-pdf endpoints.
 *
 * Uses pdfkit (pure JavaScript, no headless browser) so it is
 * safe on Render: no Chrome download, no cold-start penalty.
 *
 * Exports:
 *   buildInvoicePdfBuffer(inv)             -> Promise<Buffer>
 *   buildReceiptPdfBuffer(inv, receiptNo)  -> Promise<Buffer>
 *
 * Invoice theme: Crimson #7D1025 with Gold #C9A030 accents.
 * Receipt theme: Deep Green #065F46 premium with PAID stamp.
 */
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.jpg')

const CRIMSON = '#7D1025'
const CRIMSON_DEEP = '#5A0B1B'
const GREEN = '#065F46'
const GREEN_MID = '#047857'
const GREEN_TINT = '#F0FDF4'
const GOLD = '#C9A030'
const INK = '#1A1A1A'
const GREY = '#6B6B6B'
const LIGHT = '#E8E2D6'
const BONE = '#FDFAF4'

const CUR_SYMBOL = { USD: '$', KES: 'KSh ', GBP: '\u00A3', EUR: '\u20AC', AED: 'AED ' }

function money(n, currency) {
  const sym = CUR_SYMBOL[currency] || (currency + ' ')
  return sym + (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt)) return ''
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function docToBuffer(build) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48 })
    const chunks = []
    doc.on('data', c => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    try { build(doc); doc.end() } catch (e) { reject(e) }
  })
}

// ── Shared layout pieces (theme-aware via accent + tint) ────
function header(doc, titleText, refNo, dateLabel, dateValue, accent = CRIMSON) {
  const W = doc.page.width
  doc.rect(0, 0, W, 8).fill(accent)
  doc.rect(0, 8, W, 2).fill(GOLD)

  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, 48, 24, { width: 200 })
    doc.fillColor(GREY).font('Helvetica').fontSize(8.5)
      .text('Diamond Plaza Parklands, Nairobi  \u00B7  Karen Hardy, Nairobi', 48, 98)
      .text('hello@smartioushomeschool.com  \u00B7  +254 745 021 212  \u00B7  smartioushomeschool.com', 48, 110)
  } else {
    doc.fillColor(CRIMSON).font('Times-Bold').fontSize(24)
      .text('Smartious', 48, 34, { continued: true })
    doc.fillColor(GOLD).font('Times-BoldItalic')
      .text(' Homeschool Global')
    doc.fillColor(GREY).font('Helvetica').fontSize(8.5)
      .text('Diamond Plaza Parklands, Nairobi  \u00B7  Karen Hardy, Nairobi', 48, 62)
      .text('hello@smartioushomeschool.com  \u00B7  +254 745 021 212  \u00B7  smartioushomeschool.com', 48, 74)
  }

  doc.fillColor(accent === CRIMSON ? INK : accent).font('Times-Bold').fontSize(20)
    .text(titleText, 330, 34, { width: 217, align: 'right' })
  doc.fillColor(accent).font('Helvetica-Bold').fontSize(10)
    .text(refNo, 330, 60, { width: 217, align: 'right' })
  doc.fillColor(GREY).font('Helvetica').fontSize(9)
    .text(dateLabel + ': ' + dateValue, 330, 74, { width: 217, align: 'right' })

  doc.moveTo(48, 128).lineTo(W - 48, 128).lineWidth(0.8).strokeColor(LIGHT).stroke()
  return 140
}

function billedToBlock(doc, inv, y, accent = CRIMSON, tint = BONE) {
  doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(8)
    .text('BILLED TO', 48, y, { characterSpacing: 1.2 })
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(11).text(inv.billedToName || '', 48, y + 13)
  let yy = y + 27
  if (inv.billedToAddress) { doc.font('Helvetica').fontSize(9).fillColor(GREY).text(inv.billedToAddress, 48, yy, { width: 240 }); yy = doc.y + 2 }
  if (inv.billedToEmail)   { doc.font('Helvetica').fontSize(9).fillColor(GREY).text(inv.billedToEmail, 48, yy); yy = doc.y + 2 }

  let ry = y
  if (inv.studentName || inv.studentGrade || inv.subject) {
    doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(8)
      .text('STUDENT', 330, ry, { width: 217, align: 'right', characterSpacing: 1.2 })
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(10)
      .text(inv.studentName || '', 330, ry + 13, { width: 217, align: 'right' })
    const meta = [inv.studentGrade, inv.subject].filter(Boolean).join('  \u00B7  ')
    if (meta) doc.fillColor(GREY).font('Helvetica').fontSize(9)
      .text(meta, 330, ry + 27, { width: 217, align: 'right' })
  }
  let out = Math.max(yy, ry + 40) + 6
  if (inv.programmeLabel) {
    doc.rect(48, out, doc.page.width - 96, 20).fill(tint)
    doc.fillColor(accent === CRIMSON ? CRIMSON_DEEP : accent).font('Helvetica-Bold').fontSize(9)
      .text(inv.programmeLabel, 56, out + 6, { width: doc.page.width - 112 })
    out += 28
  }
  return out + 4
}

function itemsTable(doc, inv, y, accent = CRIMSON, tint = BONE) {
  const X = 48, W = doc.page.width - 96
  const cols = { desc: X + 8, sessions: X + W - 250, duration: X + W - 185, rate: X + W - 125, amount: X + W - 60 }
  doc.rect(X, y, W, 22).fill(accent)
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8)
  doc.text('DESCRIPTION', cols.desc, y + 7)
  doc.text('SESSIONS', cols.sessions, y + 7, { width: 60, align: 'right' })
  doc.text('DURATION', cols.duration, y + 7, { width: 55, align: 'right' })
  doc.text('RATE/HR', cols.rate, y + 7, { width: 60, align: 'right' })
  doc.text('AMOUNT', cols.amount, y + 7, { width: 52, align: 'right' })
  let yy = y + 22
  const items = (inv.lineItems || []).filter(it => it && it.description)
  items.forEach((it, i) => {
    const rowH = 22
    if (i % 2 === 1) doc.rect(X, yy, W, rowH).fill(tint)
    doc.fillColor(INK).font('Helvetica').fontSize(9)
    doc.text(String(it.description).slice(0, 70), cols.desc, yy + 7, { width: W - 270 })
    doc.fillColor(GREY)
    doc.text(it.sessions || '\u2014', cols.sessions, yy + 7, { width: 60, align: 'right' })
    doc.text(it.duration || '\u2014', cols.duration, yy + 7, { width: 55, align: 'right' })
    doc.text(it.ratePerHr ? money(it.ratePerHr, inv.currency) : '\u2014', cols.rate, yy + 7, { width: 60, align: 'right' })
    doc.fillColor(INK).font('Helvetica-Bold')
    doc.text(money(it.amount, inv.currency), cols.amount, yy + 7, { width: 52, align: 'right' })
    yy += rowH
  })
  doc.moveTo(X, yy).lineTo(X + W, yy).lineWidth(0.8).strokeColor(LIGHT).stroke()
  return yy + 10
}

function totals(doc, inv, y, { paid = false } = {}) {
  const X = doc.page.width - 48 - 220, W = 220
  const line = (label, value, opts = {}) => {
    doc.fillColor(opts.strong ? INK : GREY).font(opts.strong ? 'Helvetica-Bold' : 'Helvetica').fontSize(opts.strong ? 10 : 9)
    doc.text(label, X, y, { width: 130 })
    doc.text(value, X + 130, y, { width: 90, align: 'right' })
    y += opts.strong ? 18 : 15
  }
  line('Subtotal', money(inv.subtotal, inv.currency))
  if (inv.discount) line('Discount', '\u2212 ' + money(inv.discount, inv.currency))
  if (inv.vatPct)   line('VAT (' + inv.vatPct + '%)', money(inv.vatAmount, inv.currency))
  doc.rect(X - 8, y, W + 8, 26).fill(paid ? GREEN : CRIMSON)
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11)
  doc.text(paid ? 'TOTAL PAID' : 'TOTAL DUE', X, y + 8, { width: 120 })
  doc.text(money(paid ? (inv.paidAmount || inv.totalDue) : inv.totalDue, inv.currency), X + 110, y + 8, { width: 102, align: 'right' })
  return y + 36
}

function footerNotes(doc, inv, y, { receipt = false } = {}) {
  const X = 48, W = doc.page.width - 96
  if (!receipt) {
    doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(8).text('PAYMENT DETAILS', X, y, { characterSpacing: 1.2 })
    if (inv.paymentNote) {
      // Explicit per-invoice override
      doc.fillColor(INK).font('Helvetica').fontSize(9)
        .text(inv.paymentNote, X, y + 13, { width: W })
      y = doc.y + 10
    } else {
      // Two clearly separated payment methods, side by side:
      // M-Pesa (local) on the left, bank transfer (international)
      // on the right. Values must stay identical to the payment
      // block in routes/invoices.js buildInvoiceEmailHTML.
      const ref  = inv.invoiceNo || 'invoice number'
      const GAP  = 14
      const COLW = (W - GAP) / 2
      const LX   = X                 // left column x
      const RX   = X + COLW + GAP    // right column x
      const top  = y + 13
      const BOXH = 108

      // Panel backgrounds
      doc.roundedRect(LX, top, COLW, BOXH, 6).fill(BONE)
      doc.roundedRect(RX, top, COLW, BOXH, 6).fill(BONE)
      doc.roundedRect(LX, top, COLW, BOXH, 6).lineWidth(0.8).strokeColor('#E8E2D6').stroke()
      doc.roundedRect(RX, top, COLW, BOXH, 6).lineWidth(0.8).strokeColor('#E8E2D6').stroke()
      // Accent bar on each panel header
      doc.rect(LX, top, COLW, 3).fill(CRIMSON)
      doc.rect(RX, top, COLW, 3).fill(GOLD)

      // Renders "Label  Value" rows inside one panel
      const panel = (px, heading, sub, rows) => {
        const pad = 10
        const iw  = COLW - pad * 2
        let py = top + 11
        doc.fillColor(INK).font('Helvetica-Bold').fontSize(9)
          .text(heading, px + pad, py, { width: iw, characterSpacing: 0.6 })
        py = doc.y + 1
        doc.fillColor(GREY).font('Helvetica-Oblique').fontSize(7.5)
          .text(sub, px + pad, py, { width: iw })
        py = doc.y + 5
        rows.forEach(([label, value]) => {
          doc.fillColor(GREY).font('Helvetica').fontSize(7.5)
            .text(label.toUpperCase(), px + pad, py, { width: iw, characterSpacing: 0.5 })
          py = doc.y
          doc.fillColor(INK).font('Helvetica-Bold').fontSize(9.5)
            .text(value, px + pad, py, { width: iw })
          py = doc.y + 3
        })
      }

      panel(LX, 'M-PESA', 'Paying from Kenya', [
        ['Paybill',   '247247'],
        ['Account',   '745021'],
        ['Reference', ref],
      ])
      panel(RX, 'BANK TRANSFER', 'Paying from outside Kenya', [
        ['Bank',        'Equity Bank Kenya'],
        ['Account',     '0910186607556'],
        ['SWIFT / Beneficiary', 'EQBLKENA  \u00B7  Smartious Edtech'],
      ])

      y = top + BOXH + 10
    }
    // ── Issued-by signature ────────────────────────────────
    const sigName  = inv.issuedByName  || 'Innocent Jabuya'
    const sigTitle = inv.issuedByTitle || 'Head of Finance'
    doc.fillColor(GREY).font('Helvetica').fontSize(7.5)
      .text('ISSUED BY', X, y, { characterSpacing: 1 })
    doc.fillColor(CRIMSON).font('Helvetica-Bold').fontSize(10)
      .text(sigName, X, doc.y + 1, { width: W })
    doc.fillColor(GREY).font('Helvetica').fontSize(8.5)
      .text(sigTitle + '  \u00B7  Smartious Edtech', X, doc.y + 1, { width: W })
    y = doc.y + 10
  }
  if (inv.notes) {
    doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(8).text('NOTES', X, y, { characterSpacing: 1.2 })
    doc.fillColor(GREY).font('Helvetica').fontSize(9).text(inv.notes, X, y + 13, { width: W })
    y = doc.y + 10
  }
  doc.fillColor(GREY).font('Helvetica-Oblique').fontSize(8)
    .text('Thank you for learning with Smartious Homeschool Global.', X, doc.page.height - 70, { width: W, align: 'center' })
  doc.rect(0, doc.page.height - 10, doc.page.width, 10).fill(receipt ? GREEN : CRIMSON)
}

// ── Premium PAID stamp ──────────────────────────────────────
function premiumPaidStamp(doc, cx, cy, dateText) {
  const w = 150, h = 62
  doc.save()
  doc.translate(cx, cy).rotate(-11)
  doc.opacity(0.92)
  doc.roundedRect(-w / 2, -h / 2, w, h, 8).lineWidth(3).strokeColor(GREEN).stroke()
  doc.roundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 5).lineWidth(1).strokeColor(GREEN).stroke()
  doc.fillColor(GREEN).font('Helvetica-Bold').fontSize(24)
    .text('P A I D', -w / 2, -h / 2 + 13, { width: w, align: 'center' })
  doc.fillColor(GREEN_MID).font('Helvetica-Bold').fontSize(7.5)
    .text(String(dateText || '').toUpperCase(), -w / 2, h / 2 - 17, { width: w, align: 'center', characterSpacing: 1.5 })
  doc.opacity(1)
  doc.restore()
}

// ── Public builders ─────────────────────────────────────────
async function buildInvoicePdfBuffer(inv) {
  return docToBuffer(doc => {
    let y = header(doc, 'INVOICE', inv.invoiceNo, 'Issued', fmtDate(inv.issueDate))
    if (inv.dueDate) {
      doc.fillColor(GREY).font('Helvetica').fontSize(9)
        .text('Due: ' + fmtDate(inv.dueDate), 330, 88, { width: 217, align: 'right' })
    }
    y = billedToBlock(doc, inv, y)
    y = itemsTable(doc, inv, y)
    y = totals(doc, inv, y)
    footerNotes(doc, inv, y)
  })
}

async function buildReceiptPdfBuffer(inv, receiptNo) {
  return docToBuffer(doc => {
    let y = header(doc, 'RECEIPT', receiptNo, 'Paid', fmtDate(inv.paidAt || new Date()), GREEN)
    doc.fillColor(GREY).font('Helvetica').fontSize(9)
      .text('For invoice: ' + inv.invoiceNo, 330, 88, { width: 217, align: 'right' })
    y = billedToBlock(doc, inv, y, GREEN, GREEN_TINT)
    y = itemsTable(doc, inv, y, GREEN, GREEN_TINT)
    const stampY = y + 30
    y = totals(doc, inv, y, { paid: true })
    // Amount received confirmation strip
    doc.rect(48, y, 260, 36).fill(GREEN_TINT)
    doc.fillColor(GREEN).font('Helvetica-Bold').fontSize(8)
      .text('AMOUNT RECEIVED', 58, y + 8, { characterSpacing: 1.2 })
    doc.fillColor(GREEN).font('Helvetica-Bold').fontSize(12)
      .text(money(inv.paidAmount || inv.totalDue, inv.currency) + '  \u00B7  ' + fmtDate(inv.paidAt || new Date()), 58, y + 19)
    premiumPaidStamp(doc, 155, stampY, fmtDate(inv.paidAt || new Date()))
    footerNotes(doc, inv, y + 48, { receipt: true })
  })
}

module.exports = { buildInvoicePdfBuffer, buildReceiptPdfBuffer }
