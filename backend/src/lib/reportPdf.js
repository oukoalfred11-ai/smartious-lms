/**
 * lib/reportPdf.js
 * ============================================================
 * Premium branded PDF generation for academic reports.
 *
 *   buildTermReportPdf(report)    -> Promise<Buffer>  (Report model)
 *   buildWeeklyReportPdf(report)  -> Promise<Buffer>  (WeeklyReport model)
 *
 * Design: Smartious logo lockup, crimson #7D1025 and gold
 * #C9A030 identity, serif display headings, structured tables,
 * learning-habit grid, signature block. Multi-page safe.
 */
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.jpg')

const CRIMSON = '#7D1025'
const CRIMSON_DEEP = '#5A0B1B'
const GOLD = '#C9A030'
const GOLD_SOFT = '#F3E7CB'
const INK = '#1A1A1A'
const GREY = '#6B6B6B'
const LIGHT = '#E8E2D6'
const BONE = '#FDFAF4'

const M = 46            // page margin
const PW = 595.28       // A4 width

const fmtD = d => {
  if (!d) return ''
  const dt = new Date(d)
  return isNaN(dt) ? '' : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
const n1 = v => (v === null || v === undefined || isNaN(v)) ? '\u2014' : (Math.round(v * 10) / 10).toString()

function docToBuffer(build) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: M, bufferPages: true })
    const chunks = []
    doc.on('data', c => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    try { build(doc); finishPages(doc); doc.end() } catch (e) { reject(e) }
  })
}

// Brand band + footer stamped on every page at the end.
function finishPages(doc) {
  const range = doc.bufferedPageRange()
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i)
    // Zero the bottom margin while stamping so writing in the footer
    // zone can never trigger pdfkit auto-pagination (phantom pages).
    const oldBottom = doc.page.margins.bottom
    doc.page.margins.bottom = 0
    doc.rect(0, 0, PW, 6).fill(CRIMSON)
    doc.rect(0, 6, PW, 2).fill(GOLD)
    doc.rect(0, doc.page.height - 8, PW, 8).fill(CRIMSON)
    doc.fillColor(GREY).font('Helvetica').fontSize(7)
      .text('Smartious Homeschool Global  \u00B7  hellosmartious@gmail.com  \u00B7  +254 745 021 212  \u00B7  Page ' + (i - range.start + 1) + ' of ' + range.count,
        M, doc.page.height - 26, { width: PW - 2 * M, align: 'center', lineBreak: false })
    doc.page.margins.bottom = oldBottom
  }
}

// Page-break helper: guarantees `need` points of space, returns y.
function ensure(doc, y, need) {
  if (y + need > doc.page.height - 46) { doc.addPage(); return 40 }
  return y
}

function logoHeader(doc, title, subtitle) {
  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, M, 20, { width: 168 })
  } else {
    doc.fillColor(CRIMSON).font('Times-Bold').fontSize(22).text('Smartious', M, 30, { continued: true })
    doc.fillColor(GOLD).font('Times-BoldItalic').text(' Homeschool Global')
  }
  doc.fillColor(INK).font('Times-Bold').fontSize(17)
    .text(title, 250, 28, { width: PW - 250 - M, align: 'right' })
  doc.fillColor(CRIMSON).font('Helvetica-Bold').fontSize(9.5)
    .text(subtitle, 250, 50, { width: PW - 250 - M, align: 'right' })
  doc.fillColor(GREY).font('Helvetica').fontSize(8)
    .text('Diamond Plaza Parklands \u00B7 Karen Hardy, Nairobi \u00B7 smartioushomeschool.com', 250, 64, { width: PW - 250 - M, align: 'right' })
  doc.moveTo(M, 92).lineTo(PW - M, 92).lineWidth(1).strokeColor(GOLD).stroke()
  return 102
}

function sectionTitle(doc, y, label) {
  doc.rect(M, y, 3, 12).fill(GOLD)
  doc.fillColor(CRIMSON_DEEP).font('Helvetica-Bold').fontSize(9.5)
    .text(label.toUpperCase(), M + 10, y + 1, { characterSpacing: 1.2 })
  return y + 20
}

function infoGrid(doc, y, pairs, cols = 3) {
  const W = (PW - 2 * M) / cols
  let col = 0, rowY = y
  pairs.forEach(([k, v]) => {
    const x = M + col * W
    doc.fillColor(GREY).font('Helvetica-Bold').fontSize(7).text(k.toUpperCase(), x, rowY, { characterSpacing: .8 })
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(9.5).text(String(v || '\u2014'), x, rowY + 10, { width: W - 12 })
    col++
    if (col === cols) { col = 0; rowY += 30 }
  })
  return (col === 0 ? rowY : rowY + 30) + 4
}

// ════════════════════════════════════════════════════════════
// TERM REPORT
// ════════════════════════════════════════════════════════════
async function buildTermReportPdf(r) {
  return docToBuffer(doc => {
    let y = logoHeader(doc, 'END OF TERM ACADEMIC REPORT',
      `${r.termLabel || 'Term ' + r.term} \u00B7 ${r.academicYear || ''}`)

    // Student block
    y = sectionTitle(doc, y, 'Student information')
    y = infoGrid(doc, y, [
      ['Student name', r.studentName], ['Admission no.', r.admissionNo], ['Class / Year', r.yearGrade],
      ['Curriculum', r.curriculum], ['Programme', r.programme], ['Class teacher', r.classTeacher],
    ])

    // Attendance strip
    y = ensure(doc, y, 46)
    doc.rect(M, y, PW - 2 * M, 34).fill(BONE)
    doc.rect(M, y, 3, 34).fill(CRIMSON)
    const attW = (PW - 2 * M) / 4
    const attPairs = [
      ['Scheduled days', r.scheduledDays], ['Days attended', r.attendedDays],
      ['Days absent', r.absentDays], ['Punctuality', n1(r.punctualityPct) + '%'],
    ]
    attPairs.forEach(([k, v], i) => {
      doc.fillColor(GREY).font('Helvetica-Bold').fontSize(7).text(k.toUpperCase(), M + 14 + i * attW, y + 7)
      doc.fillColor(CRIMSON_DEEP).font('Helvetica-Bold').fontSize(12).text(String(v ?? '\u2014'), M + 14 + i * attW, y + 17)
    })
    y += 44

    // Subjects table
    y = ensure(doc, y, 60)
    y = sectionTitle(doc, y, 'Academic performance')
    const cols = [
      ['SUBJECT', M + 6, 128, 'left'],
      ['WEEKLY AVG', M + 140, 58, 'right'],
      ['END TERM', M + 202, 52, 'right'],
      ['FINAL (30/70)', M + 258, 62, 'right'],
      ['GRADE', M + 326, 38, 'center'],
      ['TEACHER COMMENT', M + 372, PW - M - (M + 372) - 6, 'left'],
    ]
    const headRow = yy => {
      doc.rect(M, yy, PW - 2 * M, 18).fill(CRIMSON)
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7)
      cols.forEach(([t, x, w, a]) => doc.text(t, x, yy + 6, { width: w, align: a }))
      return yy + 18
    }
    y = headRow(y)
    ;(r.subjects || []).forEach((s, i) => {
      doc.font('Helvetica').fontSize(8)
      const commentH = doc.heightOfString(s.teacherComment || '\u2014', { width: cols[5][2] })
      const rowH = Math.max(20, commentH + 10)
      if (y + rowH > doc.page.height - 60) { doc.addPage(); y = 40; y = headRow(y) }
      if (i % 2 === 1) doc.rect(M, y, PW - 2 * M, rowH).fill(BONE)
      doc.fillColor(INK).font('Helvetica-Bold').fontSize(8.5).text(s.subject || '', cols[0][1], y + 6, { width: cols[0][2] })
      doc.font('Helvetica').fillColor(s.missedWeekly ? '#B91C1C' : GREY).fontSize(8.5)
        .text(s.missedWeekly ? 'Missed' : n1(s.weeklyAverage), cols[1][1], y + 6, { width: cols[1][2], align: 'right' })
      doc.fillColor(s.missedEndTerm ? '#B91C1C' : GREY)
        .text(s.missedEndTerm ? 'Missed' : n1(s.endTermScore), cols[2][1], y + 6, { width: cols[2][2], align: 'right' })
      doc.fillColor(INK).font('Helvetica-Bold')
        .text(n1(s.weightedScore), cols[3][1], y + 6, { width: cols[3][2], align: 'right' })
      doc.fillColor(CRIMSON).text(s.letterGrade || '\u2014', cols[4][1], y + 6, { width: cols[4][2], align: 'center' })
      doc.fillColor(GREY).font('Helvetica').fontSize(8)
        .text(s.teacherComment || '\u2014', cols[5][1], y + 5, { width: cols[5][2] })
      y += rowH
    })
    doc.moveTo(M, y).lineTo(PW - M, y).lineWidth(.8).strokeColor(LIGHT).stroke()
    y += 8

    // Overall band
    y = ensure(doc, y, 40)
    doc.rect(M, y, PW - 2 * M, 28).fill(CRIMSON)
    doc.fillColor(GOLD_SOFT).font('Helvetica-Bold').fontSize(8)
      .text('OVERALL AVERAGE', M + 14, y + 5)
      .text('MEAN GRADE', M + 200, y + 5)
      .text('YEAR AVERAGE', M + 330, y + 5)
    doc.fillColor('#FFFFFF').fontSize(12)
      .text(n1(r.overallAverage) + '%', M + 14, y + 14)
      .text(r.meanGrade || '\u2014', M + 200, y + 14)
      .text(r.yearAverage != null ? n1(r.yearAverage) + '%' : '\u2014', M + 330, y + 14)
    y += 38

    // Learning habits grid
    const HABITS = [
      ['effort', 'Effort'], ['participation', 'Participation'], ['homework', 'Homework'], ['organisation', 'Organisation'],
      ['conduct', 'Conduct'], ['collaboration', 'Collaboration'], ['feedback', 'Response to feedback'], ['digital', 'Digital responsibility'],
    ]
    const SCALE = { 1: 'Concern', 2: 'Developing', 3: 'Good', 4: 'Excellent' }
    y = ensure(doc, y, 96)
    y = sectionTitle(doc, y, 'Learning habits')
    const hw2 = (PW - 2 * M) / 4
    HABITS.forEach(([key, label], i) => {
      const x = M + (i % 4) * hw2, yy = y + Math.floor(i / 4) * 30
      const v = r.learningHabits?.[key] ?? 3
      doc.fillColor(GREY).font('Helvetica-Bold').fontSize(7).text(label.toUpperCase(), x, yy, { width: hw2 - 10 })
      doc.fillColor(v >= 3 ? '#065F46' : v === 2 ? '#B45309' : '#B91C1C').font('Helvetica-Bold').fontSize(9.5)
        .text(SCALE[v] || 'Good', x, yy + 10)
    })
    y += 66

    // Narrative sections
    const narrative = (label, text) => {
      if (!text) return
      doc.font('Helvetica').fontSize(9)
      const h = doc.heightOfString(text, { width: PW - 2 * M - 16 }) + 30
      y = ensure(doc, y, h + 14)
      y = sectionTitle(doc, y, label)
      doc.rect(M, y, PW - 2 * M, h - 14).fill(BONE)
      doc.fillColor(INK).font('Helvetica').fontSize(9)
        .text(text, M + 10, y + 8, { width: PW - 2 * M - 20, lineGap: 2 })
      y += h - 4
    }
    if ((r.agreedTargets || []).length) narrative('Agreed targets for next term', r.agreedTargets.map((t, i) => (i + 1) + '. ' + t).join('\n'))
    narrative('Class teacher report', r.classTeacherReport)
    narrative('Head of academics remarks', r.hodRemarks)
    if (r.coCurricular) narrative('Co-curricular participation', r.coCurricular)

    // Promotion + issue block
    y = ensure(doc, y, 86)
    y = infoGrid(doc, y, [
      ['Promotion decision', r.promotionDecision], ['Next term begins', r.nextTermStart], ['Reporting time', r.reportingTime],
    ])
    y = ensure(doc, y, 60)
    doc.moveTo(M, y + 24).lineTo(M + 190, y + 24).lineWidth(.8).strokeColor(INK).stroke()
    doc.fillColor(GREY).font('Helvetica').fontSize(8).text('Issued by', M, y + 28)
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(9).text(r.issuedBy || '', M, y + 38, { width: 240 })
    doc.fillColor(GREY).font('Helvetica').fontSize(8)
      .text('Date issued: ' + fmtD(r.dateIssued || new Date()), PW - M - 200, y + 28, { width: 200, align: 'right' })
    doc.fillColor(CRIMSON).font('Times-BoldItalic').fontSize(9)
      .text('This report is an official document of Smartious Homeschool Global.', PW - M - 260, y + 40, { width: 260, align: 'right' })
  })
}

// ════════════════════════════════════════════════════════════
// WEEKLY REPORT
// ════════════════════════════════════════════════════════════
async function buildWeeklyReportPdf(r) {
  return docToBuffer(doc => {
    let y = logoHeader(doc, 'WEEKLY PROGRESS REPORT',
      `${r.subject || ''} \u00B7 ${r.week || ''} \u00B7 ${r.period || ''} ${r.academicYear || ''}`.trim())

    y = sectionTitle(doc, y, 'Student information')
    y = infoGrid(doc, y, [
      ['Student', r.studentName], ['Class level', r.classLevel], ['Curriculum', r.curriculum],
      ['Subject', r.subject], ['Teacher', r.teacherName], ['Week', r.week],
    ])

    const listBlock = (label, items) => {
      const arr = (items || []).filter(Boolean)
      if (!arr.length) return
      const text = arr.map(t => '\u2022  ' + t).join('\n')
      doc.font('Helvetica').fontSize(9)
      const h = doc.heightOfString(text, { width: PW - 2 * M - 20 }) + 16
      y = ensure(doc, y, h + 24)
      y = sectionTitle(doc, y, label)
      doc.rect(M, y, PW - 2 * M, h).fill(BONE)
      doc.fillColor(INK).font('Helvetica').fontSize(9).text(text, M + 10, y + 8, { width: PW - 2 * M - 20, lineGap: 3 })
      y += h + 8
    }

    listBlock('Topics covered', r.topics)
    listBlock('Subtopics', r.subTopics)
    listBlock('Learning activities', r.activities)
    listBlock('Homework assigned', r.homework)

    // Assessments table
    const assessments = (r.assessments || []).filter(a => a && (a.desc || a.score != null))
    if (assessments.length) {
      y = ensure(doc, y, 60)
      y = sectionTitle(doc, y, 'Assessments this week')
      doc.rect(M, y, PW - 2 * M, 18).fill(CRIMSON)
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7.5)
      doc.text('ASSESSMENT', M + 8, y + 6)
      doc.text('SCORE', PW - M - 170, y + 6, { width: 55, align: 'right' })
      doc.text('OUT OF', PW - M - 110, y + 6, { width: 50, align: 'right' })
      doc.text('PERCENT', PW - M - 56, y + 6, { width: 50, align: 'right' })
      y += 18
      assessments.forEach((a, i) => {
        y = ensure(doc, y, 20)
        if (i % 2 === 1) doc.rect(M, y, PW - 2 * M, 18).fill(BONE)
        const pct = a.percentage != null ? a.percentage : (a.score != null && a.outOf ? Math.round(a.score / a.outOf * 100) : null)
        doc.fillColor(INK).font('Helvetica').fontSize(8.5).text(a.desc || 'Assessment', M + 8, y + 5, { width: 280 })
        doc.fillColor(GREY).text(a.score != null ? String(a.score) : '\u2014', PW - M - 170, y + 5, { width: 55, align: 'right' })
        doc.text(a.outOf != null ? String(a.outOf) : '\u2014', PW - M - 110, y + 5, { width: 50, align: 'right' })
        doc.fillColor(pct == null ? GREY : pct >= 70 ? '#065F46' : pct >= 50 ? '#B45309' : '#B91C1C').font('Helvetica-Bold')
          .text(pct != null ? pct + '%' : '\u2014', PW - M - 56, y + 5, { width: 50, align: 'right' })
        y += 18
      })
      y += 8
    }

    // Strengths / improvements side by side
    const twoCol = (leftLabel, leftItems, rightLabel, rightItems) => {
      const L = (leftItems || []).filter(Boolean), R = (rightItems || []).filter(Boolean)
      if (!L.length && !R.length) return
      const W2 = (PW - 2 * M - 14) / 2
      const lt = L.map(t => '\u2022  ' + t).join('\n') || '\u2014'
      const rt = R.map(t => '\u2022  ' + t).join('\n') || '\u2014'
      doc.font('Helvetica').fontSize(9)
      const h = Math.max(
        doc.heightOfString(lt, { width: W2 - 20 }),
        doc.heightOfString(rt, { width: W2 - 20 })) + 34
      y = ensure(doc, y, h + 10)
      doc.rect(M, y, W2, h).fill('#F0FDF4')
      doc.rect(M + W2 + 14, y, W2, h).fill('#FFF7ED')
      doc.fillColor('#065F46').font('Helvetica-Bold').fontSize(8).text(leftLabel.toUpperCase(), M + 10, y + 8, { characterSpacing: 1 })
      doc.fillColor('#B45309').text(rightLabel.toUpperCase(), M + W2 + 24, y + 8, { characterSpacing: 1 })
      doc.fillColor(INK).font('Helvetica').fontSize(9)
        .text(lt, M + 10, y + 22, { width: W2 - 20, lineGap: 3 })
        .text(rt, M + W2 + 24, y + 22, { width: W2 - 20, lineGap: 3 })
      y += h + 10
    }
    twoCol('Strengths observed', r.strengths, 'Areas for improvement', r.improvements)

    // Qualitative observations
    const quals = [
      ['Understanding', r.understanding], ['Participation', r.participation],
      ['Effort', r.effort], ['Behaviour', r.behaviour], ['General comment', r.generalComment || r.comment],
    ].filter(([, v]) => v)
    if (quals.length) {
      y = ensure(doc, y, 40)
      y = sectionTitle(doc, y, 'Teacher observations')
      quals.forEach(([k, v]) => {
        doc.font('Helvetica').fontSize(9)
        const h = doc.heightOfString(String(v), { width: PW - 2 * M - 130 }) + 8
        y = ensure(doc, y, h + 4)
        doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(8).text(k.toUpperCase(), M, y + 2, { width: 115 })
        doc.fillColor(INK).font('Helvetica').fontSize(9).text(String(v), M + 125, y, { width: PW - 2 * M - 130, lineGap: 2 })
        y += h + 4
      })
      y += 6
    }

    // Sign-off
    y = ensure(doc, y, 56)
    doc.moveTo(M, y + 22).lineTo(M + 180, y + 22).lineWidth(.8).strokeColor(INK).stroke()
    doc.fillColor(GREY).font('Helvetica').fontSize(8).text('Teacher', M, y + 26)
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(9).text(r.teacherName || '', M, y + 36)
    doc.fillColor(GREY).font('Helvetica').fontSize(8)
      .text('Issued: ' + fmtD(r.createdAt || new Date()), PW - M - 180, y + 26, { width: 180, align: 'right' })
    doc.fillColor(CRIMSON).font('Times-BoldItalic').fontSize(9)
      .text('Smartious Homeschool Global \u2014 weekly progress record.', PW - M - 250, y + 38, { width: 250, align: 'right' })
  })
}

module.exports = { buildTermReportPdf, buildWeeklyReportPdf }
