/**
 * lib/payslipPdf.js
 * ============================================================
 * Branded payslip PDF, built with pdfkit so it runs on Render
 * without a headless browser.
 *
 * Deliberately shares the layout language of invoicePdf.js — same
 * logo block, same rule weights, same typographic scale — so a
 * teacher's payslip and a parent's invoice are recognisably from
 * the same school. The accent differs: payslips use a deep slate
 * with gold, keeping crimson for money owed *to* the school and
 * this quieter palette for money paid *by* it.
 *
 * Exports:
 *   buildPayslipPdfBuffer(record) -> Promise<Buffer>
 */
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.jpg')

// Green carries the payment news; crimson is the Smartious brand accent
// and marks anything subtracted, so the eye reads green = received,
// crimson = withheld without needing a legend.
const GREEN      = '#065F46'   // primary — headers, net pay, footer
const GREEN_MID  = '#047857'
const GREEN_TINT = '#F0FDF4'
const GREEN_EDGE = '#A7D8C0'
const CRIMSON    = '#8B1A2E'   // brand accent — section labels, deductions
const GOLD       = '#C9A030'   // period line only, tying back to the invoice
const INK        = '#1A1A1A'
const GREY       = '#6B6B6B'
const LIGHT      = '#E8E2D6'
const BONE       = '#FDFAF4'
const RED        = CRIMSON

const CUR = { KES: 'KSh ', USD: '$', GBP: '\u00A3', EUR: '\u20AC' }

function money(n, currency) {
  const sym = CUR[currency] || (currency + ' ')
  return sym + (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(d) {
  if (!d) return '\u2014'
  const dt = new Date(d)
  if (isNaN(dt)) return '\u2014'
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

/** Small caps section label with a hairline beneath it. */
function sectionLabel(doc, text, x, y, width) {
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(CRIMSON)
     .text(text.toUpperCase(), x, y, { characterSpacing: 1.4 })
  doc.moveTo(x, y + 13).lineTo(x + width, y + 13).lineWidth(0.6).strokeColor(LIGHT).stroke()
  return y + 22
}

/** One label/value row inside an earnings or deductions block. */
function lineRow(doc, label, value, x, y, width, opts = {}) {
  const bold = opts.bold || false
  // Truncate by MEASURING the string, not by counting characters: a label
  // that still overflows wraps onto a second line and collides with the
  // detail line beneath it. Set the font before measuring, since
  // widthOfString uses whatever font is currently active.
  const labelW = width - 112
  doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9.5)
  let shown = String(label)
  if (doc.widthOfString(shown) > labelW) {
    while (shown.length > 1 && doc.widthOfString(shown + '\u2026') > labelW) {
      shown = shown.slice(0, -1)
    }
    shown += '\u2026'
  }
  doc.fillColor(opts.muted ? GREY : INK)
     .text(shown, x, y, { width: labelW, lineBreak: false })
  doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9.5)
     .fillColor(opts.colour || INK)
     .text(value, x + width - 110, y, { width: 110, align: 'right' })
  return y + 15
}

function buildPayslipPdfBuffer(r) {
  return docToBuffer(doc => {
    const M = 48
    const W = doc.page.width - M * 2      // 499pt usable
    const COL = (W - 18) / 2              // two-column width

    // ── Header band ──────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 6).fill(GREEN)

    let y = 26
    if (fs.existsSync(LOGO_PATH)) {
      doc.image(LOGO_PATH, M, y, { width: 168 })
    } else {
      doc.font('Helvetica-Bold').fontSize(19).fillColor(GREEN).text('Smartious', M, y + 12)
    }

    doc.font('Helvetica-Bold').fontSize(23).fillColor(GREEN)
       .text('PAYSLIP', M, y + 6, { width: W, align: 'right' })
    doc.font('Helvetica-Bold').fontSize(10).fillColor(GOLD)
       .text(r.periodLabel || '', M, y + 34, { width: W, align: 'right' })

    y = 92
    doc.font('Helvetica').fontSize(7.8).fillColor(GREY)
       .text('Diamond Plaza, Parklands, Nairobi   \u00B7   Karen Hardy, Nairobi', M, y)
       .text('hellosmartious@gmail.com   \u00B7   +254 745 021 212   \u00B7   smartioushomeschool.com', M, y + 10)

    y += 30
    doc.moveTo(M, y).lineTo(M + W, y).lineWidth(1.4).strokeColor(GREEN).stroke()
    y += 18

    // ── Employee / payment detail, two columns ───────────────
    const leftX = M, rightX = M + COL + 18
    let ly = sectionLabel(doc, 'Employee', leftX, y, COL)
    doc.font('Helvetica-Bold').fontSize(12).fillColor(INK).text(r.teacherName || '', leftX, ly)
    ly += 16
    doc.font('Helvetica').fontSize(9).fillColor(GREY).text(r.teacherEmail || '', leftX, ly)
    ly += 13
    if (r.staffRole) { doc.text(r.staffRole, leftX, ly); ly += 13 }

    let ry = sectionLabel(doc, 'Payment', rightX, y, COL)
    const payRows = [
      ['Pay period',   r.periodLabel || '\u2014'],
      ['Payment date', fmtDate(r.paymentDate)],
      ['Method',       r.paymentMethod || '\u2014'],
      ['Reference',    r.paymentRef || '\u2014'],
    ]
    payRows.forEach(([k, v]) => {
      doc.font('Helvetica').fontSize(8.5).fillColor(GREY).text(k, rightX, ry, { width: 82, lineBreak: false })
      doc.font('Helvetica-Bold').fontSize(9).fillColor(INK)
         .text(String(v), rightX + 82, ry, { width: COL - 82, align: 'right' })
      ry += 14
    })

    y = Math.max(ly, ry) + 16

    // ── Earnings ─────────────────────────────────────────────
    const earnStart = y
    let ey = sectionLabel(doc, 'Earnings', leftX, y, COL)
    ey = lineRow(doc, 'Basic salary', money(r.basicSalary, r.currency), leftX, ey, COL)

    const extras = (r.tuitionExtras || []).filter(e => e.status === 'approved')
    if (extras.length) {
      extras.forEach(e => {
        const label = e.description || 'Tuition extra'
        const detail = [e.subject, e.sessions ? e.sessions + ' session' + (e.sessions === 1 ? '' : 's') : null]
          .filter(Boolean).join(' \u00B7 ')
        ey = lineRow(doc, label, money(e.totalAmount, r.currency), leftX, ey, COL)
        if (detail) {
          doc.font('Helvetica').fontSize(7.5).fillColor(GREY).text(detail, leftX + 6, ey - 3)
          ey += 9
        }
      })
    } else {
      doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(GREY)
         .text('No approved tuition extras this period', leftX, ey)
      ey += 15
    }

    doc.moveTo(leftX, ey + 2).lineTo(leftX + COL, ey + 2).lineWidth(0.6).strokeColor(LIGHT).stroke()
    ey += 8
    ey = lineRow(doc, 'Gross pay',
                 money((r.basicSalary || 0) + (r.totalApprovedExtras || 0), r.currency),
                 leftX, ey, COL, { bold: true })

    // ── Deductions ───────────────────────────────────────────
    let dy = sectionLabel(doc, 'Deductions', rightX, earnStart, COL)
    const ded = r.deductions || []
    if (ded.length) {
      ded.forEach(d => {
        dy = lineRow(doc, d.label || 'Deduction',
                     '- ' + money(d.amount, r.currency), rightX, dy, COL, { colour: RED })
      })
    } else {
      doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(GREY)
         .text('No deductions this period', rightX, dy)
      dy += 15
    }
    doc.moveTo(rightX, dy + 2).lineTo(rightX + COL, dy + 2).lineWidth(0.6).strokeColor(LIGHT).stroke()
    dy += 8
    dy = lineRow(doc, 'Total deductions',
                 '- ' + money(r.totalDeductions, r.currency),
                 rightX, dy, COL, { bold: true, colour: RED })

    y = Math.max(ey, dy) + 20

    // ── Net pay block ────────────────────────────────────────
    doc.roundedRect(M, y, W, 62, 5).fill(GREEN)
    doc.font('Helvetica-Bold').fontSize(8).fillColor(GOLD)
       .text('NET PAY', M + 22, y + 16, { characterSpacing: 1.6 })
    doc.font('Helvetica').fontSize(8).fillColor('#9CC9B8')
       .text('Gross less deductions', M + 22, y + 32)
    doc.font('Helvetica-Bold').fontSize(23).fillColor('#FFFFFF')
       .text(money(r.netPay, r.currency), M + 22, y + 18, { width: W - 44, align: 'right' })

    y += 78

    // ── Paid confirmation ────────────────────────────────────
    if (r.status === 'paid') {
      doc.roundedRect(M, y, W, 34, 4).fillAndStroke(GREEN_TINT, GREEN_EDGE)
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(GREEN)
         .text('PAID', M + 16, y + 12, { characterSpacing: 1.2, lineBreak: false })
      doc.font('Helvetica').fontSize(8.8).fillColor('#3F6B58')
         .text(
           'Released ' + fmtDate(r.paymentDate) +
           (r.paymentRef ? '   \u00B7   Reference ' + r.paymentRef : '') +
           (r.paymentMethod ? '   \u00B7   ' + r.paymentMethod : ''),
           M + 56, y + 12, { width: W - 72 }
         )
      y += 46
    }

    // ── Note ─────────────────────────────────────────────────
    if (r.paymentNote) {
      y = sectionLabel(doc, 'Note', M, y, W)
      doc.font('Helvetica').fontSize(9).fillColor(INK)
         .text(r.paymentNote, M, y, { width: W })
      y = doc.y + 14
    }

    // ── Footer ───────────────────────────────────────────────
    const fy = doc.page.height - 74
    doc.moveTo(M, fy).lineTo(M + W, fy).lineWidth(0.6).strokeColor(LIGHT).stroke()
    doc.font('Helvetica').fontSize(7.5).fillColor(GREY)
       .text(
         'This payslip is issued for your records. Queries about any figure should go to the finance office ' +
         'within 30 days of the payment date.',
         M, fy + 10, { width: W, align: 'center' }
       )
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(GREEN)
       .text('Smartious Homeschool & eSchool   \u00B7   Confidential', M, fy + 32, { width: W, align: 'center' })

    doc.rect(0, doc.page.height - 6, doc.page.width, 6).fill(GREEN)
  })
}

module.exports = { buildPayslipPdfBuffer }
