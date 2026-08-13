/**
 * lib/resultReportPdf.js
 * ═══════════════════════════════════════════════════════════════════
 * A student's result report as a real document.
 *
 *   buildResultReportPdf({ kind, student, assessment, score, stats,
 *                          topics, feedback }) -> Promise<Buffer>
 *
 * WHY THIS EXISTS
 * "Download Report" previously called window.print(), which produces a
 * browser screenshot of the page — cropped panels, navigation chrome,
 * whatever happened to be on screen. A parent shown that does not see a
 * school; they see a printout of a website. This produces a document
 * with the Smartious lockup, the student's name, the marks and the
 * teacher's comment, in colour, on one page.
 *
 * Uses pdfkit, matching examPaperPdf.js and reportPdf.js, so it runs on
 * Render with no headless browser.
 */

const PDFDocument = require('pdfkit')
const path = require('path')
const fs   = require('fs')

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.jpg')

const PAGE_W = 595.28
const PAGE_H = 841.89
const M      = 46
const CW     = PAGE_W - M * 2

// Brand palette. Unlike the exam paper — which is deliberately black and
// white because it gets photocopied — a result report is read once and
// kept, so colour carries meaning here.
const INK    = '#1A1A1A'
const MUTE   = '#6B6B6B'
const LINE   = '#E8E2D6'
const CRIMSON= '#7D1025'
const GOLD   = '#C9A030'
const GREEN  = '#15803D'
const AMBER  = '#B45309'
const RED    = '#B91C1C'

const esc = s => String(s == null ? '' : s)
const bandColour = pct => pct >= 70 ? GREEN : pct >= 50 ? GOLD : RED

/** Rounded rectangle, since pdfkit's roundedRect needs explicit radii. */
function rrect(doc, x, y, w, h, r) {
  doc.roundedRect(x, y, w, h, r)
  return doc
}

/** A labelled statistic in a soft tinted tile. */
function statTile(doc, x, y, w, label, value, tint, fg) {
  rrect(doc, x, y, w, 52, 7).fill(tint)
  doc.fillColor(fg).font('Helvetica-Bold').fontSize(16)
     .text(esc(value), x + 12, y + 12, { width: w - 24 })
  doc.fillColor(MUTE).font('Helvetica').fontSize(7.5)
     .text(esc(label).toUpperCase(), x + 12, y + 33, { width: w - 24, characterSpacing: 0.6 })
}

/** Horizontal progress bar with a percentage to its right. */
function bar(doc, x, y, w, pct, showPct = true) {
  const p = Math.max(0, Math.min(100, Number(pct) || 0))
  const barW = showPct ? w - 42 : w
  rrect(doc, x, y, barW, 7, 3.5).fill('#EDEDED')
  if (p > 0) rrect(doc, x, y, Math.max(4, barW * p / 100), 7, 3.5).fill(bandColour(p))
  if (showPct) {
    doc.fillColor(bandColour(p)).font('Helvetica-Bold').fontSize(9.5)
       .text(p + '%', x + barW + 8, y - 2, { width: 34, align: 'right' })
  }
}

function buildResultReportPdf(data = {}) {
  return new Promise((resolve, reject) => {
    try {
      const {
        kind = 'exam',
        student = {},
        assessment = {},
        score = {},
        stats = {},
        topics = [],
        feedback = null,
      } = data

      const pct = Math.max(0, Math.min(100, Number(score.percentage) || 0))
      const doc = new PDFDocument({ size: 'A4', margin: M, bufferPages: true })
      const chunks = []
      doc.on('data', c => chunks.push(c))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      doc.info.Title  = `${esc(assessment.title)} — Result Report`
      doc.info.Author = 'Smartious Homeschool Global'

      // ── HEADER BAND ────────────────────────────────────────────
      doc.rect(0, 0, PAGE_W, 104).fill(CRIMSON)

      let logoBottom = 30
      if (fs.existsSync(LOGO_PATH)) {
        try {
          // The lockup is dark on white, so it sits on a white plate
          // rather than directly on crimson where it would disappear.
          rrect(doc, M, 22, 176, 60, 6).fill('#FFFFFF')
          doc.image(LOGO_PATH, M + 8, 30, { width: 160 })
          logoBottom = 82
        } catch (e) { /* fall through to type */ }
      }
      if (logoBottom === 30) {
        doc.fillColor('#FBFAF5').font('Helvetica-Bold').fontSize(17)
           .text('SMARTIOUS', M, 32, { characterSpacing: 2.6 })
        doc.fillColor('#E8C97A').font('Helvetica').fontSize(7.5)
           .text('HOMESCHOOL GLOBAL', M, 54, { characterSpacing: 2 })
      }

      doc.fillColor('#E8C97A').font('Helvetica-Bold').fontSize(8)
         .text(kind === 'homework' ? 'HOMEWORK RESULT REPORT' : 'EXAMINATION RESULT REPORT',
               PAGE_W / 2, 34, { width: CW / 2 + 20, align: 'right', characterSpacing: 1.4 })
      doc.fillColor('#FBFAF5').font('Helvetica').fontSize(8.5)
         .text(`Issued ${new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}`,
               PAGE_W / 2, 50, { width: CW / 2 + 20, align: 'right' })

      let y = 126

      // ── STUDENT + ASSESSMENT ───────────────────────────────────
      doc.fillColor(MUTE).font('Helvetica-Bold').fontSize(7.5)
         .text('STUDENT', M, y, { characterSpacing: 1 })
      doc.fillColor(INK).font('Helvetica-Bold').fontSize(15)
         .text(esc(student.name) || 'Student', M, y + 12, { width: CW * 0.55 })
      const idLine = [student.admissionNumber, student.grade].filter(Boolean).join('  ·  ')
      if (idLine) {
        doc.fillColor(MUTE).font('Helvetica').fontSize(9)
           .text(idLine, M, y + 31, { width: CW * 0.55 })
      }

      // Grade badge, right
      const gx = M + CW - 96
      rrect(doc, gx, y - 4, 96, 62, 8).fill(bandColour(pct))
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(26)
         .text(esc(score.grade) || (pct >= 50 ? 'P' : '—'), gx, y + 6, { width: 96, align: 'center' })
      doc.fillColor('#FFFFFF').font('Helvetica').fontSize(7.5)
         .text('GRADE', gx, y + 40, { width: 96, align: 'center', characterSpacing: 1.2 })

      y += 66
      doc.moveTo(M, y).lineTo(M + CW, y).lineWidth(0.8).stroke(LINE)
      y += 14

      doc.fillColor(MUTE).font('Helvetica-Bold').fontSize(7.5)
         .text('ASSESSMENT', M, y, { characterSpacing: 1 })
      doc.fillColor(INK).font('Helvetica-Bold').fontSize(13)
         .text(esc(assessment.title) || 'Assessment', M, y + 12, { width: CW - 110 })
      const meta = [assessment.subject, assessment.curriculum, assessment.grade]
        .filter(Boolean).join('  ·  ')
      doc.fillColor(MUTE).font('Helvetica').fontSize(9)
         .text(meta, M, doc.y + 2, { width: CW - 110 })
      if (assessment.completedAt) {
        doc.fillColor(MUTE).font('Helvetica').fontSize(8.5)
           .text('Completed', M + CW - 100, y + 12, { width: 100, align: 'right' })
        doc.fillColor(CRIMSON).font('Helvetica-Bold').fontSize(10)
           .text(esc(assessment.completedAt), M + CW - 100, y + 24, { width: 100, align: 'right' })
      }

      y = Math.max(doc.y + 18, y + 62)

      // ── SCORE ──────────────────────────────────────────────────
      rrect(doc, M, y, CW, 74, 9).fill('#FBFAF5')
      doc.fillColor(MUTE).font('Helvetica-Bold').fontSize(7.5)
         .text('OVERALL SCORE', M + 18, y + 14, { characterSpacing: 1 })
      doc.fillColor(INK).font('Helvetica-Bold').fontSize(27)
         .text(`${score.awarded ?? 0} / ${score.possible ?? 0}`, M + 18, y + 27)
      doc.fillColor(bandColour(pct)).font('Helvetica-Bold').fontSize(27)
         .text(`${pct}%`, M + CW - 180, y + 27, { width: 162, align: 'right' })
      bar(doc, M + 18, y + 60, CW - 36, pct, false)
      y += 92

      // ── STAT TILES ─────────────────────────────────────────────
      const tiles = [
        ['Total questions', stats.total ?? '—', '#FDE7EA', CRIMSON],
        ['Correct',         stats.correct ?? '—', '#DCFCE7', GREEN],
        ['Incorrect',       stats.wrong ?? '—', '#FEF3C7', AMBER],
        ['Time taken',      stats.time || '—', '#DBEAFE', '#1E40AF'],
      ]
      const tw = (CW - 3 * 10) / 4
      tiles.forEach((t, i) => statTile(doc, M + i * (tw + 10), y, tw, t[0], t[1], t[2], t[3]))
      y += 70

      // ── TOPIC BREAKDOWN ────────────────────────────────────────
      if (topics.length) {
        doc.fillColor(INK).font('Helvetica-Bold').fontSize(12)
           .text('Topic breakdown', M, y)
        y = doc.y + 8
        topics.slice(0, 10).forEach(t => {
          if (y > PAGE_H - 150) return
          doc.fillColor(INK).font('Helvetica').fontSize(9.5)
             .text(esc(t.label), M, y, { width: CW * 0.46, ellipsis: true, lineBreak: false })
          bar(doc, M + CW * 0.48, y + 2, CW * 0.52, t.pct)
          y += 20
        })
        y += 6
      }

      // ── TEACHER FEEDBACK ───────────────────────────────────────
      if (feedback && esc(feedback.text).trim()) {
        const boxH = 74
        rrect(doc, M, y, CW, boxH, 9).fill('#FBF6E3')
        doc.rect(M, y, 3.5, boxH).fill(GOLD)
        doc.fillColor(AMBER).font('Helvetica-Bold').fontSize(7.5)
           .text('TEACHER FEEDBACK', M + 16, y + 13, { characterSpacing: 1 })
        doc.fillColor(INK).font('Helvetica-Oblique').fontSize(10)
           .text(esc(feedback.text), M + 16, y + 27, { width: CW - 32, height: 30, ellipsis: true })
        if (feedback.teacher) {
          doc.fillColor(CRIMSON).font('Helvetica-Bold').fontSize(8.5)
             .text('— ' + esc(feedback.teacher), M + 16, y + boxH - 20, { width: CW - 32 })
        }
        y += boxH + 14
      }

      // ── FOOTER ─────────────────────────────────────────────────
      // Written below the bottom margin, so the margin is dropped for
      // the write — otherwise pdfkit auto-paginates and spawns a blank
      // second page. Same trap as examPaperPdf.js.
      const keepBottom = doc.page.margins.bottom
      doc.page.margins.bottom = 0
      const fy = PAGE_H - 54
      doc.moveTo(M, fy).lineTo(M + CW, fy).lineWidth(0.8).stroke(LINE)
      doc.fillColor(MUTE).font('Helvetica').fontSize(7.5)
         .text(`© Smartious Homeschool Global ${new Date().getFullYear()}  ·  smartioushomeschool.com`,
               M, fy + 10, { width: CW * 0.7 })
      doc.fillColor(MUTE).font('Helvetica-Oblique').fontSize(7)
         .text('This report is issued directly by the school and reflects work marked by the named teacher.',
               M, fy + 22, { width: CW })
      doc.page.margins.bottom = keepBottom

      doc.end()
    } catch (e) { reject(e) }
  })
}

module.exports = { buildResultReportPdf }
