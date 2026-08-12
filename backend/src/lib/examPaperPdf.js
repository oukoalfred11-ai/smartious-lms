/**
 * lib/examPaperPdf.js
 * ═══════════════════════════════════════════════════════════════════
 * ONE STANDARD SMARTIOUS QUESTION PAPER.
 *
 *   buildExamPaperPdf(exam, questions, opts)  -> Promise<Buffer>
 *   buildMarkSchemePdf(exam, questions, opts) -> Promise<Buffer>
 *
 * WHY THIS EXISTS
 * Before this, every teacher laid out their own paper, so no two
 * Smartious assessments looked alike. A paper is the single artefact
 * a parent is most likely to photograph and share. It has to look
 * like it came from an institution, every time, without the teacher
 * having to design anything.
 *
 * DESIGN RULES — DO NOT RELAX THESE
 * 1. BLACK AND WHITE ONLY. No colour anywhere. Papers get
 *    photocopied; colour costs money and photocopies to mud. The
 *    Smartious crimson lives on reports and invoices, not here.
 * 2. NO THIRD-PARTY EXAM BOARD MARKS. No Cambridge, Pearson, AQA or
 *    IB logo, wordmark or device may ever be placed on this paper.
 *    The syllabus may be named in plain text ("Cambridge IGCSE
 *    Accounting 0452") because that is factual reference, but the
 *    paper is a Smartious document and the footer says so. Putting a
 *    board's mark here would assert authorship they have not given.
 * 3. ANSWER SPACE IS PROPORTIONAL TO MARKS. A 1-mark question gets
 *    one ruled line; a 5-mark question gets seven. Space is the
 *    strongest hint a paper gives a student about expected length,
 *    and getting it wrong is the commonest fault in teacher-made
 *    papers.
 * 4. A QUESTION NEVER SPLITS ACROSS A PAGE unless it genuinely
 *    cannot fit on one. Orphaned stems are the mark of an amateur
 *    paper.
 *
 * Uses pdfkit only — same stack as reportPdf.js, invoicePdf.js and
 * payslipPdf.js, so it runs on Render with no headless browser.
 */

const PDFDocument = require('pdfkit')
const path = require('path')
const fs   = require('fs')

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.jpg')

// ── geometry ──────────────────────────────────────────────────────
const PAGE_W = 595.28          // A4 portrait
const PAGE_H = 841.89
const M      = 56              // outer margin
const SPINE  = 34              // left strip reserved for the barcode
const CW     = PAGE_W - M * 2  // content width on ordinary pages

const INK   = '#000000'
const GREY  = '#555555'
const RULE  = '#000000'
const FAINT = '#BBBBBB'

// ── helpers ───────────────────────────────────────────────────────
const esc = s => String(s == null ? '' : s)

/**
 * Deterministic pseudo-barcode from a string. Cambridge-style papers
 * carry a machine-readable spine; ours encodes the Smartious paper id
 * so a scanned script can be matched back to the exam that produced
 * it. Rendered as vertical bars down the left edge of the cover.
 */
function drawSpineBarcode(doc, seedText, x, yTop, height) {
  let h = 0
  for (let i = 0; i < seedText.length; i++) h = (h * 31 + seedText.charCodeAt(i)) & 0x7fffffff
  const rand = () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff }

  doc.save()
  let y = yTop
  const end = yTop + height
  while (y < end - 2) {
    const barH = 1 + Math.floor(rand() * 3)        // 1-3 pt bar
    const gap  = 1 + Math.floor(rand() * 3)
    if (y + barH > end) break
    doc.rect(x, y, 14, barH).fill(INK)
    y += barH + gap
  }
  doc.restore()
}


/**
 * Camel-case curriculum ids are database values, not display text.
 * "CambridgePrimary" on a premium paper looks like a bug.
 */
const CURRICULUM_LABEL = {
  CambridgePrimary:'Cambridge Primary', CambridgeLowerSec:'Cambridge Lower Secondary',
  CambridgeIGCSE:'Cambridge IGCSE', CambridgeALevel:'Cambridge A Level',
  EdexcelLowerSec:'Pearson Edexcel Lower Secondary', EdexcelIGCSE:'Pearson Edexcel International GCSE',
  EdexcelALevel:'Pearson Edexcel International A Level',
  AQALowerSec:'AQA Lower Secondary', AQAGCSE:'AQA GCSE', AQAALevel:'AQA A Level',
  IBPYP:'IB Primary Years Programme', IBMYP:'IB Middle Years Programme', IBDP:'IB Diploma Programme',
  BNC:'British National Curriculum', American:'American Curriculum',
  Canadian:'Canadian Curriculum', KenyaCBC:'Kenya CBC',
}
const prettyCurriculum = c => CURRICULUM_LABEL[c] || esc(c).replace(/([a-z])([A-Z])/g, '$1 $2')

/** Total marks for a question, summing leaf parts where present. */
function questionMarks(q) {
  const sumParts = parts => (parts || []).reduce((n, p) =>
    n + (Array.isArray(p.parts) && p.parts.length ? sumParts(p.parts) : (Number(p.marks) || 0)), 0)
  if (Array.isArray(q.parts) && q.parts.length) return sumParts(q.parts)
  return Number(q.marks) || 0
}

/** Part labels by depth: (a) (b) …  then (i) (ii) …  then 1. 2. … */
const ALPHA = 'abcdefghijklmnopqrstuvwxyz'
const ROMAN = ['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii']
function partLabel(depth, index) {
  if (depth === 0) return `(${ALPHA[index] || index + 1})`
  if (depth === 1) return `(${ROMAN[index] || index + 1})`
  return `${index + 1}.`
}

/**
 * Ruled answer lines, count derived from marks and question type.
 * This is the rule that makes a paper feel professional: the space
 * tells the student how much is expected.
 */
function linesForMarks(marks, type) {
  if (type === 'mcq') return 0
  const m = Math.max(1, Number(marks) || 1)
  if (type === 'long' || type === 'essay') return Math.min(24, m * 3)
  if (type === 'drawing' || type === 'upload' || type === 'handwriting') return 0
  return Math.min(16, m <= 1 ? 1 : m + 2)      // short answer
}

function drawAnswerLines(doc, x, width, count) {
  const step = 21
  for (let i = 0; i < count; i++) {
    const y = doc.y + step * i + 12
    doc.moveTo(x, y).lineTo(x + width, y)
       .lineWidth(0.6).dash(1.6, { space: 2.4 }).stroke(FAINT).undash()
  }
  doc.y = doc.y + step * count + 8
}

function drawBlankBox(doc, x, width, height, label) {
  const y = doc.y + 6
  doc.rect(x, y, width, height).lineWidth(0.8).stroke(FAINT)
  if (label) {
    doc.fontSize(7.5).fillColor(FAINT).font('Helvetica')
       .text(label, x + 6, y + 6, { width: width - 12 })
  }
  doc.y = y + height + 10
}

// ══════════════════════════════════════════════════════════════════
// COVER PAGE
// ══════════════════════════════════════════════════════════════════
function drawCover(doc, exam, meta) {
  const cx = M + SPINE                       // content x, clear of the spine
  const cw = PAGE_W - cx - M

  // ── spine barcode + vertical code, left edge ──
  drawSpineBarcode(doc, meta.paperCode, M - 12, 150, 300)
  doc.save()
     .rotate(-90, { origin: [M - 20, 470] })
     .fontSize(7).font('Courier').fillColor(INK)
     .text(meta.paperCode, M - 20 - 150, 466, { width: 300, align: 'center', characterSpacing: 1.6 })
     .restore()

  // ── logo lockup, centred ──
  // logo.jpg is the FULL lockup — shield + "Smartious" wordmark +
  // "HOMESCHOOL · GLOBAL" + EST. 2018. It must be rendered large enough
  // to read and must NOT be paired with a typed wordmark underneath, or
  // the name appears twice and the mark is squashed to a smudge.
  let y = 46
  const LOGO_W = 210
  const LOGO_RATIO = 460 / 1280        // native aspect of the asset
  if (fs.existsSync(LOGO_PATH)) {
    try {
      doc.image(LOGO_PATH, cx + (cw - LOGO_W) / 2, y, { width: LOGO_W })
      y += LOGO_W * LOGO_RATIO + 22
    } catch (e) {
      // Asset unreadable — fall back to type so the paper still has a head.
      doc.fontSize(16).font('Helvetica-Bold').fillColor(INK)
         .text('SMARTIOUS', cx, y, { width: cw, align: 'center', characterSpacing: 3.4 })
      doc.fontSize(7.5).font('Helvetica').fillColor(GREY)
         .text('HOMESCHOOL GLOBAL', cx, doc.y + 1, { width: cw, align: 'center', characterSpacing: 2.6 })
      y = doc.y + 20
    }
  } else {
    doc.fontSize(16).font('Helvetica-Bold').fillColor(INK)
       .text('SMARTIOUS', cx, y, { width: cw, align: 'center', characterSpacing: 3.4 })
    doc.fontSize(7.5).font('Helvetica').fillColor(GREY)
       .text('HOMESCHOOL GLOBAL', cx, doc.y + 1, { width: cw, align: 'center', characterSpacing: 2.6 })
    y = doc.y + 20
  }

  // ── student identification ──
  // Smartious students sit at home across ninety-nine countries, so a
  // centre number is meaningless here. What identifies a script is the
  // student, their admission number, where they sat it, when, and their
  // signature that the work is their own.
  const LBL = 11
  const idField = (label, bx, bw, by, boxH) => {
    doc.fontSize(7).font('Helvetica-Bold').fillColor(GREY)
       .text(label, bx + 5, by + 3.5, { width: bw - 10, characterSpacing: 0.7 })
    doc.rect(bx, by, bw, boxH).lineWidth(0.9).stroke(INK)
  }

  const boxH = 30
  const gap  = 10
  const halfW = (cw - gap) / 2

  idField('STUDENT NAME', cx, cw, y, boxH)
  y += boxH + gap

  idField('ADMISSION NUMBER', cx, halfW, y, boxH)
  idField('DATE', cx + halfW + gap, halfW, y, boxH)
  y += boxH + gap

  idField('COUNTRY', cx, halfW, y, boxH)
  idField('CITY', cx + halfW + gap, halfW, y, boxH)
  y += boxH + gap

  idField('SIGNATURE', cx, cw, y, boxH)
  y += boxH + 8

  doc.fontSize(7).font('Helvetica-Oblique').fillColor(GREY)
     .text('By signing above you confirm that the answers in this paper are your own work.',
           cx, y, { width: cw })
  y = doc.y + 14

  doc.moveTo(cx, y).lineTo(cx + cw, y).lineWidth(1.1).stroke(INK)
  y += 14

  // ── subject / paper block ──
  doc.fontSize(13).font('Helvetica-Bold').fillColor(INK)
     .text(esc(exam.subject).toUpperCase(), cx, y, { width: cw - 130, continued: false })
  doc.fontSize(13).font('Helvetica-Bold').fillColor(INK)
     .text(meta.paperNumber, cx + cw - 130, y, { width: 130, align: 'right' })
  y = doc.y + 3

  doc.fontSize(9).font('Helvetica').fillColor(INK)
     .text(esc(exam.title), cx, y, { width: cw - 170 })
  const rightY = y
  doc.fontSize(9).font('Helvetica-Bold').fillColor(INK)
     .text(meta.sessionLabel, cx + cw - 170, rightY, { width: 170, align: 'right' })
  y = Math.max(doc.y, rightY + 12) + 2

  doc.fontSize(9).font('Helvetica').fillColor(INK)
     .text(meta.gradeLabel, cx, y, { width: cw - 170 })
  const rY2 = y
  doc.fontSize(9).font('Helvetica-Bold').fillColor(INK)
     .text(meta.durationLabel, cx + cw - 170, rY2, { width: 170, align: 'right' })
  y = Math.max(doc.y, rY2 + 12) + 8

  if (meta.syllabusRef) {
    doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(GREY)
       .text(meta.syllabusRef, cx, y, { width: cw })
    y = doc.y + 6
  }

  doc.moveTo(cx, y).lineTo(cx + cw, y).lineWidth(0.7).stroke(INK)
  y += 12

  doc.fontSize(9).font('Helvetica').fillColor(INK)
     .text('You must answer on the question paper.', cx, y, { width: cw })
  y = doc.y + 3
  doc.text('No additional materials are needed.', cx, y, { width: cw })
  y = doc.y + 10
  doc.moveTo(cx, y).lineTo(cx + cw, y).lineWidth(0.7).stroke(INK)
  y += 14

  // ── INSTRUCTIONS ──
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(INK).text('INSTRUCTIONS', cx, y)
  y = doc.y + 5
  meta.instructions.forEach(line => {
    doc.circle(cx + 4, y + 4.2, 1.7).fill(INK)
    doc.fontSize(9).font('Helvetica').fillColor(INK)
       .text(line, cx + 14, y, { width: cw - 14 })
    y = doc.y + 3.5
  })
  y += 12

  // ── INFORMATION ──
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(INK).text('INFORMATION', cx, y)
  y = doc.y + 5
  meta.information.forEach(line => {
    doc.circle(cx + 4, y + 4.2, 1.7).fill(INK)
    doc.fontSize(9).font('Helvetica').fillColor(INK)
       .text(line, cx + 14, y, { width: cw - 14 })
    y = doc.y + 3.5
  })

  // ── cover footer ──
  const fy = PAGE_H - M - 26
  const keepBottom = doc.page.margins.bottom
  doc.page.margins.bottom = 0
  doc.moveTo(cx, fy).lineTo(cx + cw, fy).lineWidth(0.7).stroke(INK)
  doc.fontSize(8.5).font('Helvetica').fillColor(INK)
     .text(`This document has ${meta.pageCountLabel} pages. Any blank pages are indicated.`,
           cx, fy + 8, { width: cw, align: 'center' })
  doc.page.margins.bottom = keepBottom
}

// ══════════════════════════════════════════════════════════════════
// QUESTION RENDERING
// ══════════════════════════════════════════════════════════════════
function renderParts(doc, parts, depth, x, width, scheme) {
  parts.forEach((p, i) => {
    const label = partLabel(depth, i)
    const hasChildren = Array.isArray(p.parts) && p.parts.length > 0
    const marks = hasChildren
      ? (p.parts || []).reduce((n, c) => n + (Number(c.marks) || 0), 0)
      : (Number(p.marks) || 0)

    if (doc.y > PAGE_H - M - 90) doc.addPage()

    doc.fontSize(9.5).font('Helvetica-Bold').fillColor(INK)
       .text(label, x, doc.y, { width: 26, continued: false })
    const labelY = doc.y
    doc.y = labelY - doc.currentLineHeight()

    doc.fontSize(9.5).font('Helvetica').fillColor(INK)
       .text(esc(p.text), x + 26, doc.y, { width: width - 26 - 34 })

    if (!hasChildren && marks > 0) {
      const my = doc.y - doc.currentLineHeight()
      doc.fontSize(9).font('Helvetica').fillColor(INK)
         .text(`[${marks}]`, x + width - 30, my, { width: 30, align: 'right' })
    }
    doc.y += 4

    if (p.type === 'mcq' && Array.isArray(p.options) && p.options.length) {
      p.options.forEach((opt, oi) => {
        doc.fontSize(9).font('Helvetica').fillColor(INK)
           .text(`${ALPHA[oi].toUpperCase()}   ${esc(opt)}`, x + 46, doc.y, { width: width - 80 })
        doc.y += 2
      })
      doc.y += 4
    }

    if (hasChildren) {
      renderParts(doc, p.parts, depth + 1, x + 22, width - 22, scheme)
    } else if (scheme) {
      drawSchemeBlock(doc, p, x + 26, width - 26)
    } else {
      const n = linesForMarks(marks, p.type)
      if (n > 0) drawAnswerLines(doc, x + 26, width - 26 - 34, n)
      else if (['drawing','upload','handwriting'].includes(p.type))
        drawBlankBox(doc, x + 26, width - 26 - 34, 120, 'Answer in this space')
      else doc.y += 6
    }
  })
}

function drawSchemeBlock(doc, q, x, width) {
  const ms = q.markScheme || {}
  const has = ms.modelAnswer || (ms.points || []).length || (ms.acceptableAnswers || []).length
  doc.y += 2

  if (q.type === 'mcq' && q.correctAnswer != null && String(q.correctAnswer).trim()) {
    doc.fontSize(9).font('Helvetica-Bold').fillColor(INK)
       .text('Answer:  ', x, doc.y, { continued: true })
       .font('Helvetica').text(esc(q.correctAnswer), { width: width - 60 })
    doc.y += 2
  }
  if (ms.modelAnswer) {
    doc.fontSize(9).font('Helvetica-Bold').fillColor(INK).text('Model answer', x, doc.y)
    doc.fontSize(9).font('Helvetica').fillColor(INK)
       .text(esc(ms.modelAnswer), x, doc.y + 1, { width: width - 20 })
    doc.y += 3
  }
  if ((ms.points || []).length) {
    doc.fontSize(9).font('Helvetica-Bold').fillColor(INK).text('Award', x, doc.y + 2)
    ms.points.forEach(pt => {
      doc.fontSize(9).font('Helvetica').fillColor(INK)
         .text(`•  ${esc(pt.text)}`, x + 8, doc.y + 1, { width: width - 60, continued: false })
      const py = doc.y - doc.currentLineHeight()
      doc.text(`[${Number(pt.marks) || 1}]`, x + width - 34, py, { width: 30, align: 'right' })
    })
    doc.y += 3
  }
  if ((ms.acceptableAnswers || []).length) {
    doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(GREY)
       .text('Also accept: ' + ms.acceptableAnswers.map(esc).join('; '), x, doc.y + 2, { width: width - 20 })
    doc.y += 2
  }
  if ((ms.commonErrors || []).length) {
    doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(GREY)
       .text('Common errors: ' + ms.commonErrors.map(esc).join('; '), x, doc.y + 2, { width: width - 20 })
    doc.y += 2
  }
  if (!has && q.explanation) {
    doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(GREY)
       .text(esc(q.explanation), x, doc.y + 2, { width: width - 20 })
    doc.y += 2
  }
  doc.y += 8
}

function renderQuestion(doc, q, number, scheme) {
  const x = M
  const total = questionMarks(q)

  // Keep the stem with at least the start of its answer space.
  if (doc.y > PAGE_H - M - 140) doc.addPage()

  doc.fontSize(10.5).font('Helvetica-Bold').fillColor(INK)
     .text(String(number), x, doc.y, { width: 22 })
  const ny = doc.y - doc.currentLineHeight()
  doc.y = ny

  doc.fontSize(10).font('Helvetica').fillColor(INK)
     .text(esc(q.questionText), x + 22, doc.y, { width: CW - 22 - 40 })
  doc.y += 6

  if (q.imageCaption) {
    doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(GREY)
       .text(esc(q.imageCaption), x + 22, doc.y, { width: CW - 22 })
    doc.y += 4
  }

  const hasParts = Array.isArray(q.parts) && q.parts.length > 0

  if (!hasParts && q.type === 'mcq' && Array.isArray(q.options) && q.options.length) {
    q.options.forEach((opt, oi) => {
      doc.fontSize(9.5).font('Helvetica').fillColor(INK)
         .text(`${ALPHA[oi].toUpperCase()}   ${esc(opt)}`, x + 40, doc.y, { width: CW - 80 })
      doc.y += 2
    })
    doc.y += 4
    if (!scheme) {
      doc.fontSize(9).font('Helvetica').fillColor(INK)
         .text('Answer', x + 40, doc.y, { width: 46, continued: true })
      doc.rect(x + 86, doc.y - 2, 30, 15).lineWidth(0.8).stroke(INK)
      doc.text('', { continued: false })
      doc.y += 18
    }
  }

  if (hasParts) {
    renderParts(doc, q.parts, 0, x + 22, CW - 22, scheme)
  } else if (scheme) {
    drawSchemeBlock(doc, q, x + 22, CW - 22)
  } else if (q.type !== 'mcq') {
    const n = linesForMarks(total, q.type)
    if (n > 0) drawAnswerLines(doc, x + 22, CW - 22 - 40, n)
    else if (['drawing','upload','handwriting'].includes(q.type))
      drawBlankBox(doc, x + 22, CW - 22 - 40, 150, 'Answer in this space')
  }

  // Total marks, right-aligned under the question.
  if (total > 0) {
    doc.fontSize(9).font('Helvetica-Bold').fillColor(INK)
       .text(`[Total: ${total}]`, x, doc.y, { width: CW, align: 'right' })
  }
  doc.y += 16
}

// ══════════════════════════════════════════════════════════════════
// FOOTERS — applied to every page after layout, so the page count
// is known. Smartious copyright only; no third-party marks.
// ══════════════════════════════════════════════════════════════════
function applyFooters(doc, meta, scheme) {
  const range = doc.bufferedPageRange()
  const year = new Date().getFullYear()
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i)
    // Writing below the bottom margin makes pdfkit auto-paginate, which
    // spawns a blank page per footer. Drop the margin for the write and
    // restore it. This is the phantom-page bug reportPdf.js warns about.
    const keepBottom = doc.page.margins.bottom
    doc.page.margins.bottom = 0
    const fy = PAGE_H - M + 14

    if (i > range.start) {
      // page number, centred at the head
      doc.fontSize(9).font('Helvetica-Bold').fillColor(INK)
         .text(String(i - range.start + 1), M, M - 30, { width: CW, align: 'center' })
    }

    doc.fontSize(7).font('Helvetica').fillColor(GREY)
       .text(`© Smartious Homeschool Global ${year}`, M, fy, { width: CW * 0.42 })
    doc.fontSize(7).font('Courier').fillColor(GREY)
       .text(meta.paperCode, M + CW * 0.42, fy, { width: CW * 0.24, align: 'center' })

    const last = i === range.start + range.count - 1
    doc.fontSize(7).font('Helvetica-Bold').fillColor(GREY)
       .text(last ? (scheme ? 'END OF MARK SCHEME' : 'END OF PAPER') : '[Turn over',
             M + CW * 0.66, fy, { width: CW * 0.34, align: 'right' })

    doc.page.margins.bottom = keepBottom
  }
}

// ══════════════════════════════════════════════════════════════════
// PUBLIC
// ══════════════════════════════════════════════════════════════════
function buildMeta(exam, questions, opts = {}) {
  const totalMarks = questions.reduce((n, q) => n + questionMarks(q), 0)
  const mins = Number(exam.durationMins) || 60
  const h = Math.floor(mins / 60), m = mins % 60
  const durationLabel = h ? `${h} hour${h > 1 ? 's' : ''}${m ? ` ${m} minutes` : ''}` : `${m} minutes`

  const idPart = String(exam._id || opts.paperId || Date.now()).slice(-6).toUpperCase()
  const subjCode = esc(exam.subject).replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'GEN'
  const paperCode = `SMT/${subjCode}/${idPart}`

  const start = exam.startAt ? new Date(exam.startAt) : new Date()
  const sessionLabel = start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return {
    paperCode,
    paperNumber: opts.paperNumber || 'Paper 1',
    sessionLabel,
    gradeLabel: [esc(exam.grade), prettyCurriculum(exam.curriculum)].filter(Boolean).join('   ·   '),
    durationLabel,
    totalMarks,
    syllabusRef: opts.syllabusRef || '',
    pageCountLabel: '—',
    instructions: (esc(exam.instructions).split(/\r?\n/).map(s => s.trim()).filter(Boolean).length
      ? esc(exam.instructions).split(/\r?\n/).map(s => s.trim()).filter(Boolean)
      : [
          'Answer all questions.',
          'Use a black or dark blue pen. You may use an HB pencil for any diagrams or graphs.',
          'Complete every box at the top of this page, including your signature.',
          'Write your answer to each question in the space provided.',
          'Do not use correction fluid or tape.',
          'You should show your workings.',
        ]),
    information: [
      `The total mark for this paper is ${totalMarks}.`,
      'The number of marks for each question or part question is shown in brackets [ ].',
      'Where you are asked to complete a layout, you may not need all the lines for your answers.',
    ],
  }
}

function render(exam, questions, opts, scheme) {
  return new Promise((resolve, reject) => {
    try {
      const meta = buildMeta(exam, questions, opts)
      const doc = new PDFDocument({ size: 'A4', margin: M, bufferPages: true, autoFirstPage: false })
      const chunks = []
      doc.on('data', c => chunks.push(c))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      doc.info.Title  = `${esc(exam.subject)} — ${esc(exam.title)}${scheme ? ' (Mark Scheme)' : ''}`
      doc.info.Author = 'Smartious Homeschool Global'

      if (!scheme) {
        doc.addPage()
        drawCover(doc, exam, meta)
      }

      doc.addPage()
      if (scheme) {
        doc.fontSize(13).font('Helvetica-Bold').fillColor(INK)
           .text('MARK SCHEME', M, M, { width: CW, align: 'center', characterSpacing: 2 })
        doc.fontSize(9.5).font('Helvetica').fillColor(GREY)
           .text(`${esc(exam.subject)} — ${esc(exam.title)}`, M, doc.y + 4, { width: CW, align: 'center' })
        doc.fontSize(8.5).font('Helvetica').fillColor(GREY)
           .text(`${meta.gradeLabel}   ·   Total ${meta.totalMarks} marks   ·   ${meta.paperCode}`,
                 M, doc.y + 2, { width: CW, align: 'center' })
        doc.moveTo(M, doc.y + 8).lineTo(M + CW, doc.y + 8).lineWidth(0.8).stroke(INK)
        doc.y += 20
      }

      questions.forEach((q, i) => renderQuestion(doc, q, i + 1, scheme))

      // Now that the page count is known, stamp it on the cover.
      const range = doc.bufferedPageRange()
      const total = range.count
      if (!scheme) {
        doc.switchToPage(range.start)
        doc.page.margins.bottom = 0
        const fy = PAGE_H - M - 26
        doc.rect(M + SPINE, fy + 4, PAGE_W - (M + SPINE) - M, 16).fill('#FFFFFF')
        doc.fontSize(8.5).font('Helvetica').fillColor(INK)
           .text(`This document has ${total} pages. Any blank pages are indicated.`,
                 M + SPINE, fy + 8, { width: PAGE_W - (M + SPINE) - M, align: 'center' })
      }

      applyFooters(doc, meta, scheme)
      doc.flushPages()
      doc.end()
    } catch (e) { reject(e) }
  })
}

const buildExamPaperPdf  = (exam, questions, opts = {}) => render(exam, questions, opts, false)
const buildMarkSchemePdf = (exam, questions, opts = {}) => render(exam, questions, opts, true)

module.exports = { buildExamPaperPdf, buildMarkSchemePdf, questionMarks }
