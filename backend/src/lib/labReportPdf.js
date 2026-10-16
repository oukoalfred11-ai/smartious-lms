/**
 * lib/labReportPdf.js — printable Virtual Lab report.
 *
 * Built from the session's action log (replayed with the shared engine), so
 * the tables and graph are exactly what the student recorded. Includes the
 * notebook, answers, marks and teacher feedback, and states clearly that the
 * data are simulated by an educational model.
 */
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

const LOGO = path.join(__dirname, '..', 'assets', 'logo.jpg')
const CRIMSON = '#7D1025', INK = '#1A1A1A', GREY = '#6B6B6B', LIGHT = '#E8E2D6', BONE = '#FDFAF4'
const M = 46, PW = 595.28, W = PW - 2 * M

const SECTIONS = [['aim', 'Aim'], ['hypothesis', 'Hypothesis'], ['variables', 'Variables'], ['apparatus', 'Apparatus and materials'],
  ['procedure', 'Procedure'], ['observations', 'Observations'], ['analysis', 'Analysis'], ['evaluation', 'Evaluation and limitations'], ['conclusion', 'Conclusion']]
const STATUS = { in_progress: 'In progress', submitted: 'Submitted, awaiting marking', returned: 'Returned for correction', marked: 'Marked' }
const fmtD = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')

function useUnicodeFonts(doc) {
  try {
    const ttf = path.join(path.dirname(require.resolve('dejavu-fonts-ttf/package.json')), 'ttf')
    doc.registerFont('Body', path.join(ttf, 'DejaVuSans.ttf'))
    doc.registerFont('Bold', path.join(ttf, 'DejaVuSans-Bold.ttf'))
    doc.registerFont('Serif', path.join(ttf, 'DejaVuSerif-Bold.ttf'))
  } catch {
    doc.registerFont('Body', 'Helvetica'); doc.registerFont('Bold', 'Helvetica-Bold'); doc.registerFont('Serif', 'Times-Bold')
  }
}

function heading(doc, text) {
  if (doc.y > 740) doc.addPage()
  doc.moveDown(0.6).font('Serif').fontSize(12.5).fillColor(CRIMSON).text(text, M, doc.y, { width: W })
  doc.moveDown(0.25)
}
const para = (doc, text, opts = {}) => doc.font('Body').fontSize(9.5).fillColor(INK).text(text || '—', M, doc.y, { width: W, lineGap: 2, ...opts })

function table(doc, { columns, rows }) {
  const cw = W / columns.length
  const rowH = (cells, font) => Math.max(...cells.map(c => doc.font(font).fontSize(8.5).heightOfString(String(c), { width: cw - 8 }))) + 8
  const draw = (cells, font, fill) => {
    const h = rowH(cells, font)
    if (doc.y + h > 790) doc.addPage()
    const y = doc.y
    if (fill) doc.rect(M, y, W, h).fill(fill)
    cells.forEach((c, i) => doc.font(font).fontSize(8.5).fillColor(INK).text(String(c), M + i * cw + 4, y + 4, { width: cw - 8 }))
    doc.moveTo(M, y + h).lineTo(M + W, y + h).lineWidth(0.5).strokeColor(LIGHT).stroke()
    doc.x = M; doc.y = y + h
  }
  draw(columns, 'Bold', BONE)
  if (!rows.length) draw(columns.map((_, i) => (i === 0 ? 'No data recorded' : '')), 'Body')
  rows.forEach(r => draw(r, 'Body'))
}

function axisRange(vals) {
  let lo = Math.min(...vals), hi = Math.max(...vals)
  if (lo >= 0 && lo <= 0.35 * hi) lo = 0
  if (hi <= 0 && hi >= 0.35 * lo) hi = 0
  if (hi === lo) { hi += Math.abs(hi) * 0.1 || 1; lo -= Math.abs(lo) * 0.1 || 1 }
  const pad = (hi - lo) * 0.06
  return [lo === 0 ? 0 : lo - pad, hi === 0 ? 0 : hi + pad]
}
const SERIES = [INK, '#1D4C9A', '#1E7B34', '#B86E00']

function graph(doc, g) {
  if (!g || !g.points?.length) return
  const h = 200
  if (doc.y + h + 50 > 790) doc.addPage()
  const x0 = M + 40, y0 = doc.y + 10, gw = W - 60, gh = h
  const series = g.series?.length ? g.series : [{ name: null, points: g.points, line: g.line }]
  const all = series.flatMap(s => s.points)
  const [xmin, xmax] = axisRange(all.map(p => p.x))
  const [ymin, ymax] = axisRange(all.map(p => p.y))
  const X = (x) => x0 + ((x - xmin) / (xmax - xmin)) * gw
  const Y = (y) => y0 + gh - ((y - ymin) / (ymax - ymin)) * gh
  doc.rect(x0, y0, gw, gh).lineWidth(0.6).strokeColor('#BBB').stroke()
  if (ymin < 0 && ymax > 0) doc.moveTo(x0, Y(0)).lineTo(x0 + gw, Y(0)).strokeColor('#999').lineWidth(0.6).stroke()
  series.forEach((s, k) => {
    const col = k ? SERIES[k % 4] : CRIMSON
    if (s.line) doc.moveTo(X(xmin), Y(s.line.m * xmin + s.line.c)).lineTo(X(xmax), Y(s.line.m * xmax + s.line.c)).strokeColor(col).lineWidth(1).stroke()
    for (const p of s.points) doc.circle(X(p.x), Y(p.y), 2.6).fillColor(SERIES[k % 4]).fill()
  })
  const t = (v) => (Math.abs(v) < 1e-12 ? '0' : String(Number(v.toPrecision(3))))
  doc.font('Body').fontSize(8).fillColor(GREY)
  doc.text(t(xmin), x0 - 4, y0 + gh + 3).text(t(xmax), x0 + gw - 24, y0 + gh + 3)
  doc.text(t(ymax), M - 4, y0 - 2, { width: 42, align: 'right' }).text(t(ymin), M - 4, y0 + gh - 8, { width: 42, align: 'right' })
  doc.font('Bold').fontSize(8.5).fillColor(INK).text(g.xLabel, x0, y0 + gh + 14, { width: gw, align: 'center' })
  doc.save().rotate(-90, { origin: [M + 6, y0 + gh / 2] }).text(g.yLabel, M - 60, y0 + gh / 2 - 4, { width: 140, align: 'center' }).restore()
  const fits = series.filter(s => s.line).map(s => (s.name ? s.name + ': ' : 'Line of best fit: ') + 'gradient ' + Number(s.line.m.toPrecision(3)) + (s.line.c ? ', intercept ' + Number(s.line.c.toPrecision(3)) : ''))
  doc.font('Body').fontSize(8).fillColor(GREY).text(fits.join('   '), x0, y0 + gh + 26, { width: gw, align: 'center' })
  doc.x = M; doc.y = y0 + gh + 42
}

async function buildLabReportPdf({ lab, def, session }) {
  const params = lab.engine.paramsFor(def, session.seed, session.options)
  const state = lab.engine.replay(def, params, session.actions || [])
  const nb = session.notebook || {}
  const answers = session.answers || {}
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: M, bufferPages: true, info: { Title: def.title + ' — lab report', Author: 'Smartious Virtual Science Laboratory' } })
    const chunks = []
    doc.on('data', c => chunks.push(c)); doc.on('end', () => resolve(Buffer.concat(chunks))); doc.on('error', reject)
    useUnicodeFonts(doc)

    // Header
    doc.rect(0, 0, PW, 6).fill(CRIMSON)
    if (fs.existsSync(LOGO)) { try { doc.image(LOGO, M, 22, { height: 34 }) } catch {} }
    doc.font('Bold').fontSize(8).fillColor(CRIMSON).text('SMARTIOUS VIRTUAL SCIENCE LABORATORY', M + 200, 26, { width: W - 200, align: 'right' })
    doc.font('Serif').fontSize(19).fillColor(INK).text(def.title, M, 72, { width: W })
    doc.font('Body').fontSize(9.5).fillColor(GREY).text(`${session.studentName || 'Student'} · ${def.subject[0].toUpperCase() + def.subject.slice(1)} · attempt ${session.attempt || 1}`, M, doc.y + 2)
    doc.text(`Status: ${STATUS[session.status] || session.status} · Submitted: ${fmtD(session.submittedAt)}${session.score != null ? ` · Score: ${session.score} / ${session.maxScore}` : ''}`)
    doc.moveDown(0.4)
    doc.rect(M, doc.y, W, 30).fill('#FFF7E6')
    doc.font('Body').fontSize(8.2).fillColor('#7C2D12').text(
      (def.model.kind === 'simplified' ? 'Simplified educational model. ' : 'Educational model. ') +
      'All measurements in this report were produced by a computer simulation, not by real laboratory apparatus.', M + 8, doc.y + 8, { width: W - 16 })
    doc.y += 14

    for (const [k, label] of SECTIONS) {
      const fallback = k === 'aim' ? def.notebook.aim : k === 'variables' ? def.notebook.variables : k === 'apparatus' ? def.apparatus.map(a => lab.apparatus?.apparatusName ? lab.apparatus.apparatusName(a) : a.replace(/_/g, ' ')).join(', ') : k === 'procedure' ? def.procedure.map((p, i) => `${i + 1}. ${p}`).join('\n') : ''
      if (k === 'observations') {
        heading(doc, 'Raw data')
        for (const t of def.dataTables(params, state)) { doc.font('Bold').fontSize(9.5).fillColor(INK).text(t.title, M, doc.y); doc.moveDown(0.2); table(doc, t); doc.moveDown(0.4) }
        const g = def.graph(params, state)
        if (g?.points?.length) { heading(doc, 'Graph: ' + g.title); graph(doc, g) }
      }
      heading(doc, label)
      para(doc, nb[k] || fallback)
    }

    heading(doc, 'Calculations and answers')
    for (const q of def.questions) {
      doc.font('Bold').fontSize(9.5).fillColor(INK).text(q.prompt, M, doc.y, { width: W })
      const a = answers[q.id]
      const shown = q.type === 'choice' && a != null && a !== '' ? (q.options[Number(a)] || a) : a
      para(doc, shown ? shown + (q.unit && q.type === 'numeric' ? ' ' + q.unit : '') : '—')
      doc.moveDown(0.3)
    }

    const rows = session.markedRows || session.autoGrade?.rows
    if (rows) {
      heading(doc, 'Marks')
      table(doc, { columns: ['Criterion', 'Marks', 'Notes'], rows: rows.map(r => [r.label, r.marks == null ? '— / ' + r.max : r.marks + ' / ' + r.max, r.auto ? (r.overridden ? 'Teacher adjusted. ' : 'Auto-checked. ') + (r.detail || '') : 'Marked by teacher'] ) })
    }
    if (session.feedback) { heading(doc, 'Teacher feedback' + (session.markedByName ? ' — ' + session.markedByName : '')); para(doc, session.feedback) }

    heading(doc, 'About the model')
    para(doc, def.model.summary)
    doc.moveDown(0.2)
    def.model.assumptions.forEach(a => para(doc, '• ' + a))

    const range = doc.bufferedPageRange()
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i)
      doc.font('Body').fontSize(7.5).fillColor(GREY).text(`Smartious Homeschool & eSchool Global · Virtual Science Laboratory · ${def.id} v${session.experimentVersion} · page ${i + 1} of ${range.count}`, M, 815, { width: W, align: 'center', lineBreak: false })
    }
    doc.end()
  })
}

module.exports = { buildLabReportPdf }
