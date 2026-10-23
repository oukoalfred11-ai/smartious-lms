/**
 * lib/termReportPdf.js — the end-of-term academic report, as a PDF.
 *
 *   buildTermReportPdf(report, { photo })  → Promise<Buffer>
 *     report  a Report document (models/Report.js)
 *     photo   optional JPEG/PNG Buffer of the student (lib/studentPhoto.js)
 *
 * A classic school report: parchment page, a double crimson-and-gold
 * border with corner ornaments, the school logo, the student's photograph
 * in a gilt frame, the subject results with each weekly test drawn as a
 * small bar (academic progress), attendance and learning habits, the class
 * teacher's, Dean's and Principal's comments, the Principal's signature
 * and the school's official seal. Fits one page for a usual report; longer
 * reports continue on further pages with the same frame.
 */
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

const ASSETS = path.join(__dirname, '..', 'assets')
// Images go to pdfkit as data URLs (JPEG or PNG only; anything else is skipped).
function imgSrc(buf) {
  if (!buf || !buf.length) return null
  const b = Buffer.from(buf)
  const mime = b[0] === 0x89 && b[1] === 0x50 ? 'image/png' : b[0] === 0xFF && b[1] === 0xD8 ? 'image/jpeg' : null
  return mime ? `data:${mime};base64,${b.toString('base64')}` : null
}
const read = (f) => { try { return imgSrc(fs.readFileSync(path.join(ASSETS, f))) } catch { return null } }

const CRIMSON = '#7D1025'
const GOLD = '#B8902F'
const GOLD_SOFT = '#E9D9AE'
const INK = '#2A2018'
const SEPIA = '#6E5B45'
const PARCHMENT = '#FBF6EA'
const TINT = '#F4EBD6'

const PW = 595.28, PH = 841.89
const M = 48                 // content margin
const W = PW - 2 * M

const n0 = (v) => (v === null || v === undefined || isNaN(v) ? '—' : String(Math.round(v)))
const fmtShort = (d) => { const t = new Date(d); return isNaN(t) ? '' : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
const fmtD = (d) => { if (!d) return ''; const t = new Date(d); return isNaN(t) ? String(d) : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }
const caps = (doc, text, x, y, o = {}) => doc.font('Times-Bold').fontSize(o.size || 7.5).fillColor(o.color || SEPIA)
  .text(String(text).toUpperCase(), x, y, { characterSpacing: o.spacing ?? 1.4, lineBreak: false, width: o.width, align: o.align })

// ── The page: parchment, watermark, border and ornaments ─────
function paintPage(doc, logo) {
  doc.save()
  doc.rect(0, 0, PW, PH).fill(PARCHMENT)
  if (logo) { doc.opacity(0.045); doc.image(logo, PW / 2 - 170, PH / 2 - 60, { width: 340 }); doc.opacity(1) }
  // Double border: crimson, then gold.
  doc.lineWidth(2.2).strokeColor(CRIMSON).rect(18, 18, PW - 36, PH - 36).stroke()
  doc.lineWidth(0.6).strokeColor(CRIMSON).rect(23, 23, PW - 46, PH - 46).stroke()
  doc.lineWidth(0.8).strokeColor(GOLD).rect(28, 28, PW - 56, PH - 56).stroke()
  // Corner ornaments: a gold diamond with a small crimson centre.
  for (const [x, y] of [[28, 28], [PW - 28, 28], [28, PH - 28], [PW - 28, PH - 28]]) {
    doc.save().translate(x, y).rotate(45)
    doc.rect(-7, -7, 14, 14).fillAndStroke(PARCHMENT, GOLD)
    doc.rect(-3, -3, 6, 6).fill(CRIMSON)
    doc.restore()
  }
  doc.restore()
}

/** A gold rule with a diamond in the middle. */
function ornamentRule(doc, y, w = 260) {
  const x0 = PW / 2 - w / 2, x1 = PW / 2 + w / 2
  doc.save().lineWidth(0.7).strokeColor(GOLD)
  doc.moveTo(x0, y).lineTo(PW / 2 - 8, y).stroke()
  doc.moveTo(PW / 2 + 8, y).lineTo(x1, y).stroke()
  doc.translate(PW / 2, y).rotate(45).rect(-3, -3, 6, 6).fill(CRIMSON)
  doc.restore()
}

/** Text set round a circle, clockwise from the top. */
function circleText(doc, text, cx, cy, r, size) {
  doc.font('Times-Bold').fontSize(size)
  const chars = [...text]
  const widths = chars.map(c => doc.widthOfString(c))
  const total = widths.reduce((a, b) => a + b, 0)
  const gap = (2 * Math.PI * r - total) / chars.length
  let a = -Math.PI / 2
  chars.forEach((c, i) => {
    const mid = a + (widths[i] / 2) / r
    doc.save()
    doc.translate(cx + r * Math.cos(mid), cy + r * Math.sin(mid))
    doc.rotate((mid * 180) / Math.PI + 90)
    doc.text(c, -widths[i] / 2, -size * 0.7, { lineBreak: false })
    doc.restore()
    a += (widths[i] + gap) / r
  })
}

/** The school's official seal, drawn (crimson ink, slightly turned, as if stamped). */
function seal(doc, cx, cy, R = 44) {
  doc.save()
  doc.translate(cx, cy).rotate(-12).translate(-cx, -cy)
  doc.opacity(0.88)
  doc.circle(cx, cy, R).fill('#F6E7E9')
  doc.lineWidth(2).strokeColor(CRIMSON).circle(cx, cy, R).stroke()
  doc.lineWidth(0.7).circle(cx, cy, R - 4).stroke()
  doc.lineWidth(0.7).circle(cx, cy, R - 17).stroke()
  doc.fillColor(CRIMSON)
  circleText(doc, 'SMARTIOUS HOMESCHOOL • NAIROBI • EST. 2018 • ', cx, cy, R - 11.5, 7.2)
  // A star and the words in the middle.
  const star = (x, y, r1, r2) => {
    const pts = []
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const r = i % 2 ? r2 : r1; pts.push([x + r * Math.cos(a), y + r * Math.sin(a)]) }
    doc.polygon(...pts).fill(CRIMSON)
  }
  star(cx, cy - 11, 6, 2.6)
  doc.font('Times-Bold').fontSize(8).fillColor(CRIMSON).text('OFFICIAL', cx - 25, cy - 2, { width: 50, align: 'center', characterSpacing: 1, lineBreak: false })
  doc.font('Times-Bold').fontSize(8).text('SEAL', cx - 25, cy + 8, { width: 50, align: 'center', characterSpacing: 2, lineBreak: false })
  doc.opacity(1)
  doc.restore()
}

/** The photograph in a gilt double frame, or the initials when there is none. */
function photoFrame(doc, x, y, w, h, photo, name) {
  doc.save()
  doc.rect(x - 5, y - 5, w + 10, h + 10).fill('#FFFFFF')
  doc.lineWidth(1.6).strokeColor(GOLD).rect(x - 5, y - 5, w + 10, h + 10).stroke()
  doc.lineWidth(0.5).strokeColor(CRIMSON).rect(x - 2, y - 2, w + 4, h + 4).stroke()
  let drawn = false
  if (photo) {
    try { doc.image(photo, x, y, { cover: [w, h], align: 'center', valign: 'center' }); drawn = true } catch { drawn = false }
  }
  if (!drawn) {
    doc.rect(x, y, w, h).fill(TINT)
    const ini = String(name || '?').split(/\s+/).filter(Boolean).map(s => s[0]).slice(0, 2).join('').toUpperCase()
    doc.fillColor(GOLD).font('Times-Bold').fontSize(30).text(ini, x, y + h / 2 - 18, { width: w, align: 'center', lineBreak: false })
    doc.fillColor(SEPIA).font('Times-Italic').fontSize(7).text('Photograph', x, y + h - 14, { width: w, align: 'center', lineBreak: false })
  }
  doc.restore()
}

const { scaleKey, wordFor, keyLine } = require('./grading')
// Catalogue ids (e.g. CambridgeIGCSE) print as their names.
const curriculumName = (c) => (require('../constants/curriculum').CURRICULA.find(x => x.id === require('./academic').canonCurriculum(c)) || {}).name || c
const HABITS = [['effort', 'Effort'], ['participation', 'Participation'], ['homework', 'Homework'], ['organisation', 'Organisation'],
  ['conduct', 'Conduct'], ['collaboration', 'Collaboration'], ['feedback', 'Response to feedback'], ['digital', 'Digital responsibility']]
const SCALE = { 1: 'Concern', 2: 'Developing', 3: 'Good', 4: 'Excellent' }

function buildTermReportPdf(r, { photo: photoBuf = null } = {}) {
  const photo = imgSrc(photoBuf)
  const logo = read('logo-report.png') || read('logo.jpg')
  const signature = read('signature-principal.png')
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true, info: { Title: `Academic Report — ${r.studentName || ''}`, Author: 'Smartious Homeschool' } })
    const chunks = []
    doc.on('data', c => chunks.push(Buffer.from(c)))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    doc.on('pageAdded', () => paintPage(doc, logo))
    try {
      paintPage(doc, logo)
      let y = draw(doc, r, { logo, photo, signature })
      void y
      // Page numbers on a multi-page report.
      const range = doc.bufferedPageRange()
      if (range.count > 1) for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i)
        doc.font('Times-Italic').fontSize(8).fillColor(SEPIA).text(`Page ${i + 1} of ${range.count}`, M, PH - 44, { width: W, align: 'center', lineBreak: false })
      }
      doc.end()
    } catch (e) { reject(e) }
  })
}

function draw(doc, r, { logo, photo, signature }) {
  const BOTTOM = PH - 48
  const ensure = (y, need) => { if (y + need > BOTTOM) { doc.addPage(); return 50 } return y }

  // ── Heading ──
  let y = 40
  if (logo) doc.image(logo, PW / 2 - 74, y, { width: 148 })
  else doc.font('Times-Bold').fontSize(24).fillColor(CRIMSON).text('Smartious Homeschool', M, y + 14, { width: W, align: 'center' })
  y += 56
  doc.font('Times-Bold').fontSize(21).fillColor(CRIMSON).text('ACADEMIC REPORT', M, y, { width: W, align: 'center', characterSpacing: 5, lineBreak: false })
  y += 26
  doc.font('Times-Italic').fontSize(11).fillColor(SEPIA)
    .text(`${r.termLabel || 'Term ' + r.term}  ·  Academic Year ${r.academicYear || ''}`, M, y, { width: W, align: 'center', lineBreak: false })
  y += 18
  ornamentRule(doc, y)
  y += 14

  // ── The student ──
  const PWd = 78, PHt = 94
  photoFrame(doc, M + 6, y + 4, PWd, PHt, photo, r.studentName)
  const ix = M + PWd + 26, iw = PW - M - ix
  caps(doc, 'Student', ix, y + 2)
  doc.font('Times-Bold').fontSize(19).fillColor(INK).text(r.studentName || '', ix, y + 12, { width: iw, lineBreak: false, ellipsis: true })
  const pairs = [
    ['Admission no.', r.admissionNo], ['Year / Grade', r.yearGrade], ['Curriculum', curriculumName(r.curriculum)],
    ['Programme', r.programme], ['Class teacher', r.classTeacher], ['Term dates', r.termStart && r.termEnd ? `${fmtShort(r.termStart)} – ${fmtShort(r.termEnd)}` : ''],
  ]
  const cw = iw / 3
  pairs.forEach(([k, v], i) => {
    const x = ix + (i % 3) * cw, yy = y + 42 + Math.floor(i / 3) * 32
    caps(doc, k, x, yy, { size: 6.8, spacing: 1 })
    doc.font('Times-Roman').fontSize(10).fillColor(INK).text(v && v !== '—' ? String(v) : '—', x, yy + 10, { width: cw - 8, height: 22, ellipsis: true })
  })
  y += PHt + 14

  // ── Summary medallions ──
  const att = r.scheduledDays ? Math.round((r.attendedDays / r.scheduledDays) * 100) : null
  const meds = [
    ['Overall average', r.overallAverage != null ? n0(r.overallAverage) + '%' : '—'],
    ['Mean grade', r.meanGrade && r.meanGrade !== '—' ? r.meanGrade : '—', wordFor(r.curriculum, r.meanGrade, r.yearGrade)],
    ['Weekly tests', (() => { const xs = (r.subjects || []).map(s => s.weeklyAverage).filter(v => v != null); return xs.length ? n0(xs.reduce((a, b) => a + b, 0) / xs.length) + '%' : '—' })(), 'average'],
    ['Attendance', att != null ? att + '%' : '—', r.scheduledDays ? `${r.attendedDays} of ${r.scheduledDays} lessons` : ''],
  ]
  const mw = (W - 18) / 4
  meds.forEach(([k, v, sub], i) => {
    const x = M + i * (mw + 6)
    doc.rect(x, y, mw, 40).fill(TINT)
    doc.lineWidth(0.6).strokeColor(GOLD).rect(x + 2.5, y + 2.5, mw - 5, 35).stroke()
    caps(doc, k, x, y + 6, { size: 6.6, width: mw, align: 'center', spacing: 1 })
    doc.font('Times-Bold').fontSize(15).fillColor(CRIMSON).text(v, x, y + 15, { width: mw, align: 'center', lineBreak: false })
    if (sub) doc.font('Times-Italic').fontSize(7).fillColor(SEPIA).text(sub, x, y + 30, { width: mw, align: 'center', lineBreak: false })
  })
  y += 50

  // ── Results ──
  const sectionHead = (label, yy) => {
    doc.font('Times-Bold').fontSize(10.5).fillColor(CRIMSON).text(label.toUpperCase(), M, yy, { characterSpacing: 2.2, lineBreak: false })
    const tw = doc.widthOfString(label.toUpperCase()) + label.length * 2.2
    doc.lineWidth(0.6).strokeColor(GOLD).moveTo(M + tw + 8, yy + 6).lineTo(PW - M, yy + 6).stroke()
    return yy + 17
  }
  y = sectionHead('Academic performance', y)
  // Descriptive bands (Exceeding, Developing...) need a wider grade column.
  const wordy = scaleKey(r.curriculum, r.yearGrade) === 'descriptive'
  const gw = wordy ? 58 : 34
  const cols = [
    ['Subject', 104, 'left'], ['Weekly tests', 76, 'left'], ['Wk avg', 36, 'right'], ['Exam', 40, 'right'],
    ['Final', 34, 'right'], ['Grade', gw, 'center'], ["Teacher's comment", W - 104 - 76 - 36 - 40 - 34 - gw - 6, 'left'],
  ]
  const head = (yy) => {
    let x = M + 3
    for (const [t, w, a] of cols) { caps(doc, t, x, yy + 3, { size: 6.6, width: w, align: a, spacing: 0.8, color: CRIMSON }); x += w }
    doc.lineWidth(0.9).strokeColor(GOLD).moveTo(M, yy + 14).lineTo(PW - M, yy + 14).stroke()
    return yy + 18
  }
  y = head(y)
  const subjects = r.subjects || []
  if (!subjects.length) {
    doc.font('Times-Italic').fontSize(9.5).fillColor(SEPIA).text('No marks recorded for this term.', M + 3, y + 4)
    y += 22
  }
  subjects.forEach((s, i) => {
    doc.font('Times-Italic').fontSize(8.6)
    const cmt = s.teacherComment || ''
    const ch = cmt ? doc.heightOfString(cmt, { width: cols[6][1] - 4 }) : 10
    const rh = Math.max(21, ch + 8)
    if (y + rh > BOTTOM) { doc.addPage(); y = head(50) }
    if (i % 2 === 0) doc.rect(M, y, W, rh).fill('#F7F0DF')
    let x = M + 3
    doc.font('Times-Bold').fontSize(9.8).fillColor(INK).text(s.subject || '', x, y + 7, { width: cols[0][1] - 4, height: rh - 6, ellipsis: true }); x += cols[0][1]
    // Weekly tests: one bar per test (taller = higher mark); hollow = missed.
    const tests = (s.weeklyTests && s.weeklyTests.length ? s.weeklyTests.map(t => t.pct) : (s.weeklyScores || [])).slice(-10)
    const bh = 13, by = y + 4
    doc.lineWidth(0.4).strokeColor('#D8C9A6').moveTo(x, by + bh).lineTo(x + cols[1][1] - 10, by + bh).stroke()
    const bw = tests.length ? Math.min(7, (cols[1][1] - 12) / tests.length - 2) : 0
    tests.forEach((p, k) => {
      const bx = x + k * (bw + 2)
      if (p == null) doc.lineWidth(0.5).strokeColor('#B91C1C').rect(bx, by + bh - 4, bw, 4).stroke()
      else { const hh = Math.max(1.5, (Math.min(100, p) / 100) * bh); doc.rect(bx, by + bh - hh, bw, hh).fill(p >= 70 ? '#2F6B3A' : p >= 50 ? GOLD : '#A23B2A') }
    })
    if (!tests.length) doc.font('Times-Italic').fontSize(8).fillColor(SEPIA).text('none', x, y + 8, { lineBreak: false })
    x += cols[1][1]
    doc.font('Times-Roman').fontSize(9.8).fillColor(INK)
    doc.text(n0(s.weeklyAverage), x, y + 7, { width: cols[2][1] - 4, align: 'right', lineBreak: false }); x += cols[2][1]
    doc.fillColor(s.endTermScore == null ? '#A23B2A' : INK).text(s.endTermScore == null ? '—' : n0(s.endTermScore), x, y + 7, { width: cols[3][1] - 4, align: 'right', lineBreak: false }); x += cols[3][1]
    doc.font('Times-Bold').fillColor(INK).text(n0(s.weightedScore), x, y + 7, { width: cols[4][1] - 4, align: 'right', lineBreak: false }); x += cols[4][1]
    doc.font('Times-Bold').fontSize(wordy ? 9 : 11).fillColor(CRIMSON).text(s.letterGrade || '—', x, y + 6, { width: cols[5][1], align: 'center', lineBreak: false }); x += cols[5][1]
    doc.font('Times-Italic').fontSize(8.6).fillColor(SEPIA).text(cmt || '—', x + 4, y + 6, { width: cols[6][1] - 4 })
    y += rh
  })
  doc.lineWidth(0.9).strokeColor(GOLD).moveTo(M, y + 1).lineTo(PW - M, y + 1).stroke()
  doc.font('Times-Italic').fontSize(7.2).fillColor(SEPIA)
    .text('Final = weekly test average 30% + end-of-term exam 70%. Bars: each weekly test in order (green 70%+, gold 50–69%, red under 50%, outline = missed).', M, y + 5, { width: W, lineBreak: false })
  doc.text('Grades — ' + keyLine(r.curriculum, r.yearGrade) + '.', M, y + 14, { width: W, lineBreak: false, ellipsis: true })
  y += 27

  // ── Attendance and learning habits ──
  y = ensure(y, 70)
  y = sectionHead('Attendance & learning habits', y)
  const hx = M, hw = W / 4
  HABITS.forEach(([k, label], i) => {
    const v = r.learningHabits?.[k] ?? 3
    const x = hx + (i % 4) * hw, yy = y + Math.floor(i / 4) * 21
    caps(doc, label, x, yy, { size: 6.4, spacing: 0.8, width: hw - 6 })
    doc.font('Times-Bold').fontSize(9.6).fillColor(v >= 3 ? '#2F6B3A' : v === 2 ? '#8A6A1A' : '#A23B2A').text(SCALE[v] || 'Good', x, yy + 9, { lineBreak: false })
  })
  y += 46

  // ── Comments ──
  const block = (title, text, x, w, yy) => {
    caps(doc, title, x, yy, { color: CRIMSON, size: 7.4, spacing: 1.4 })
    doc.font('Times-Italic').fontSize(9.6).fillColor(INK)
    const t = text || '—'
    const h = doc.heightOfString(t, { width: w, lineGap: 1.5 })
    doc.text(t, x, yy + 12, { width: w, lineGap: 1.5 })
    return yy + 12 + h
  }
  const targets = (r.agreedTargets || []).filter(Boolean)
  if (r.classTeacherReport || targets.length) {
    const tw = targets.length ? W * 0.36 : 0
    const cw2 = W - (tw ? tw + 20 : 0)
    doc.font('Times-Italic').fontSize(9.6)
    const tText = targets.map((t, i) => `${i + 1}. ${t}`).join('\n')
    const need = Math.max(r.classTeacherReport ? doc.heightOfString(r.classTeacherReport, { width: cw2 }) : 0, tw ? doc.heightOfString(tText, { width: tw }) : 0) + 26
    y = ensure(y, need)
    const y1 = r.classTeacherReport ? block("Class teacher's report", r.classTeacherReport, M, cw2, y) : y
    const y2 = tw ? block('Targets for next term', tText, M + cw2 + 20, tw, y) : y
    y = Math.max(y1, y2) + 10
  }

  // Dean (left) and Principal (right), each signed.
  const half = (W - 24) / 2
  doc.font('Times-Italic').fontSize(9.6)
  const need = Math.max(doc.heightOfString(r.hodRemarks || '—', { width: half }), doc.heightOfString(r.principalComment || '—', { width: half - 70 })) + 84
  y = ensure(y, need)
  const yd = block("Dean's comment", r.hodRemarks, M, half, y)
  const yp = block("Principal's comment", r.principalComment, M + half + 24, half - 70, y)
  const sy = Math.max(yd, yp) + 36
  // Dean: name on the line.
  doc.lineWidth(0.6).strokeColor(INK).moveTo(M, sy).lineTo(M + half - 30, sy).stroke()
  doc.font('Times-Bold').fontSize(9.4).fillColor(INK).text(r.deanName || ' ', M, sy + 4, { width: half - 30, lineBreak: false })
  doc.font('Times-Italic').fontSize(8.4).fillColor(SEPIA).text('Dean of Studies', M, sy + 15, { lineBreak: false })
  // Principal: signature above the line, the seal beside it.
  const px = M + half + 24
  if (signature) { try { doc.image(signature, px + 4, sy - 40, { width: 112 }) } catch { /* no signature */ } }
  doc.lineWidth(0.6).strokeColor(INK).moveTo(px, sy).lineTo(px + half - 92, sy).stroke()
  doc.font('Times-Bold').fontSize(9.4).fillColor(INK).text(r.principalName || 'Alfred Ouko', px, sy + 4, { lineBreak: false })
  doc.font('Times-Italic').fontSize(8.4).fillColor(SEPIA).text(r.principalTitle || 'Founder & Principal', px, sy + 15, { lineBreak: false })
  seal(doc, PW - M - 40, sy - 6, 40)
  y = sy + 28

  // ── Closing details ──
  y = ensure(y, 40)
  ornamentRule(doc, y, 340)
  y += 10
  const close = [['Date issued', fmtD(r.dateIssued || new Date())], ['Next term begins', r.nextTermStart], ['Reporting time', r.reportingTime],
    // Promotion is a year-end decision: Term 3 only.
    ['Promotion', Number(r.term) === 3 ? r.promotionDecision : '']]
    .filter(([, v]) => v)
  const qw = W / Math.max(1, close.length)
  close.forEach(([k, v], i) => {
    caps(doc, k, M + i * qw, y, { size: 6.6, width: qw, align: 'center', spacing: 1 })
    doc.font('Times-Roman').fontSize(9.6).fillColor(INK).text(String(v), M + i * qw, y + 10, { width: qw, align: 'center', lineBreak: false, ellipsis: true })
  })
  y += 25
  doc.font('Times-Italic').fontSize(7.6).fillColor(SEPIA)
    .text('Smartious Homeschool · Diamond Plaza I, Parklands Annex, 3rd Floor, Nairobi · +254 745 021 212 · hello@smartioushomeschool.com', M, Math.min(y, PH - 60), { width: W, align: 'center', lineBreak: false })
  return y
}

module.exports = { buildTermReportPdf }
