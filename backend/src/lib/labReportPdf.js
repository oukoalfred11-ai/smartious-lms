/**
 * lib/labReportPdf.js — printable Virtual Lab report.
 *
 * Built from the session's action log (replayed with the shared engine), so
 * the bench record is exactly what the student recorded. Laid out as a
 * formal lab report: plan, the student's own results table, graphs (with
 * their hand-drawn lines and gradient triangle) and working, answers,
 * conclusion, evaluation, marks and teacher feedback. States clearly that
 * the data are simulated by an educational model.
 */
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

const LOGO = path.join(__dirname, '..', 'assets', 'logo.jpg')
const CRIMSON = '#7D1025', INK = '#1A1A1A', GREY = '#6B6B6B', LIGHT = '#E8E2D6', BONE = '#FDFAF4'
const M = 46, PW = 595.28, W = PW - 2 * M

const PLAN = [['aim', 'Aim'], ['hypothesis', 'Hypothesis'], ['variables', 'Variables'], ['risk', 'Risk assessment'], ['apparatus', 'Apparatus and materials'], ['procedure', 'Method']]
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

// The student's own graph: graph paper, their scales, crosses, their lines and triangle.
function studentGraph(doc, A, analysis, g, caption) {
  const pts = A.graphPoints(analysis, g)
  if (!pts.length) return
  const cols = analysis.table.columns
  const xc = cols.find(c => c.id === g.x), yc = cols.find(c => c.id === g.y)
  if (!xc || !yc) return
  const ax = A.axesOf(g, pts)
  const gh = 230
  if (doc.y + gh + 70 > 790) doc.addPage()
  const x0 = M + 48, y0 = doc.y + 8, gw = W - 70
  const X = (x) => x0 + ((x - ax.xmin) / (ax.xmax - ax.xmin)) * gw
  const Y = (y) => y0 + gh - ((y - ax.ymin) / (ax.ymax - ax.ymin)) * gh
  const ticks = (lo, hi, st) => { const o = []; for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + 1e-9; v += st) o.push(v); return o }
  doc.save()
  doc.rect(x0, y0, gw, gh).fill('#FFFEFA')
  if (g.type !== 'bar') ticks(ax.xmin, ax.xmax, ax.xstep / 5).forEach(v => doc.moveTo(X(v), y0).lineTo(X(v), y0 + gh).lineWidth(0.25).strokeColor('#F1DFC9').stroke())
  ticks(ax.ymin, ax.ymax, ax.ystep / 5).forEach(v => doc.moveTo(x0, Y(v)).lineTo(x0 + gw, Y(v)).lineWidth(0.25).strokeColor('#F1DFC9').stroke())
  const lab = (v, st) => (Math.abs(v) < st * 1e-6 ? '0' : String(Number(v.toPrecision(6))))
  doc.font('Body').fontSize(7.5).fillColor(GREY)
  if (g.type !== 'bar') ticks(ax.xmin, ax.xmax, ax.xstep).forEach(v => { doc.moveTo(X(v), y0).lineTo(X(v), y0 + gh).lineWidth(0.5).strokeColor('#E2BE96').stroke(); doc.text(lab(v, ax.xstep), X(v) - 20, y0 + gh + 3, { width: 40, align: 'center', lineBreak: false }) })
  ticks(ax.ymin, ax.ymax, ax.ystep).forEach(v => { doc.moveTo(x0, Y(v)).lineTo(x0 + gw, Y(v)).lineWidth(0.5).strokeColor('#E2BE96').stroke(); doc.text(lab(v, ax.ystep), x0 - 46, Y(v) - 3.5, { width: 42, align: 'right', lineBreak: false }) })
  doc.rect(x0, y0, gw, gh).lineWidth(0.7).strokeColor('#6B6B6B').stroke()
  doc.rect(x0, y0, gw, gh).clip()
  if (g.type === 'bar') {
    const bw = gw / pts.length, base = Y(Math.max(ax.ymin, Math.min(ax.ymax, 0)))
    pts.forEach((p, i) => doc.rect(x0 + i * bw + bw * 0.18, Math.min(Y(p.y), base), bw * 0.64, Math.abs(Y(p.y) - base)).fillAndStroke('#C9A5AD', CRIMSON))
  } else {
    if (g.type === 'line') { const s = pts.slice().sort((a, b) => a.x - b.x); s.forEach((p, i) => (i ? doc.lineTo(X(p.x), Y(p.y)) : doc.moveTo(X(p.x), Y(p.y)))); doc.lineWidth(1).strokeColor(CRIMSON).stroke() }
    for (const p of pts) {
      if (p.e) doc.moveTo(X(p.x), Y(p.y - p.e)).lineTo(X(p.x), Y(p.y + p.e)).lineWidth(0.6).strokeColor('#333').stroke()
      doc.moveTo(X(p.x) - 3, Y(p.y) - 3).lineTo(X(p.x) + 3, Y(p.y) + 3).moveTo(X(p.x) - 3, Y(p.y) + 3).lineTo(X(p.x) + 3, Y(p.y) - 3).lineWidth(1).strokeColor(INK).stroke()
    }
    const colour = { best: CRIMSON, worst: '#1D4C9A', tangent: '#1E7B34' }
    if (g.type === 'scatter') for (const l of g.lines || []) {
      doc.moveTo(X(l.x1), Y(l.y1)).lineTo(X(l.x2), Y(l.y2)).lineWidth(1.3).strokeColor(colour[l.role])
      if (l.role === 'worst') doc.dash(5, { space: 3 })
      doc.stroke().undash()
    }
    const r = A.graphResults(g)
    if (r.triangle) doc.moveTo(X(r.triangle.xa), Y(r.triangle.ya)).lineTo(X(r.triangle.xb), Y(r.triangle.ya)).lineTo(X(r.triangle.xb), Y(r.triangle.yb)).lineWidth(0.7).strokeColor('#333').dash(3, { space: 2 }).stroke().undash()
  }
  doc.restore()
  if (g.type === 'bar') { const bw = gw / pts.length; doc.font('Body').fontSize(7.5).fillColor(GREY); pts.forEach((p, i) => doc.text(p.cat.slice(0, 16), x0 + i * bw, y0 + gh + 3, { width: bw, align: 'center', lineBreak: false })) }
  const xl = String(g.xLabel || '').trim() || A.headingOf(xc), yl = String(g.yLabel || '').trim() || A.headingOf(yc)
  doc.font('Bold').fontSize(8.5).fillColor(INK).text(xl, x0, y0 + gh + 15, { width: gw, align: 'center' })
  doc.save().rotate(-90, { origin: [M + 2, y0 + gh / 2] }).text(yl, M - 68, y0 + gh / 2 - 4, { width: 140, align: 'center' }).restore()
  doc.font('Body').fontSize(8).fillColor(GREY).text(caption, M, y0 + gh + 30, { width: W, align: 'center' })
  doc.x = M; doc.y = y0 + gh + 30 + doc.heightOfString(caption, { width: W }) + 6
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

    const A = lab.analysis
    const an = session.analysis && A ? A.cleanAnalysis(session.analysis) : null
    const sig = (v, n = 3) => (v == null || !Number.isFinite(v) ? '—' : String(Number(v.toPrecision(n))))
    const ans = (q) => { const a = answers[q.id]; return q.type === 'choice' && a != null && a !== '' ? (q.options[Number(a)] || a) : a }
    let n = 0
    const H = (t) => heading(doc, `${++n}. ${t}`)

    for (const [k, label] of PLAN) {
      const fallback = k === 'aim' ? def.notebook.aim : k === 'variables' ? def.notebook.variables : k === 'apparatus' ? def.apparatus.map(a => lab.apparatus?.apparatusName ? lab.apparatus.apparatusName(a) : a.replace(/_/g, ' ')).join(', ') : k === 'procedure' ? def.procedure.map((p, i) => `${i + 1}. ${p}`).join('\n') : ''
      H(label)
      para(doc, nb[k] || fallback)
    }
    const planQs = def.questions.filter(q => /^plan_/.test(q.id))
    if (planQs.length) { H('Plan'); for (const q of planQs) { doc.font('Bold').fontSize(9.5).fillColor(INK).text(q.prompt.replace(/^Plan:\s*/, ''), M, doc.y, { width: W }); para(doc, ans(q) || '—'); doc.moveDown(0.3) } }

    H('Results')
    const t = an ? A.computeTable(an.table) : null
    if (t && t.columns.length) {
      table(doc, { columns: t.columns.map(c => A.headingOf(c) || '—'), rows: t.cells.map(r => r.map(c => c.text || '')) })
      const calc = t.columns.filter(c => c.kind === 'calc')
      if (calc.length) { doc.moveDown(0.2); para(doc, 'Calculated columns: ' + calc.map(c => `${c.name || '?'} = ${c.formula}`).join('; '), { fontSize: 8.5 }) }
    } else para(doc, 'The student did not draw up a results table; the bench record follows.')
    if (nb.observations) { doc.moveDown(0.3); doc.font('Bold').fontSize(9.5).fillColor(INK).text('Observations', M, doc.y); para(doc, nb.observations) }
    doc.moveDown(0.4)
    doc.font('Bold').fontSize(9.5).fillColor(GREY).text('Bench record (what the instruments showed)', M, doc.y); doc.moveDown(0.2)
    for (const bt of def.dataTables(params, state)) { doc.font('Bold').fontSize(9).fillColor(INK).text(bt.title, M, doc.y); doc.moveDown(0.2); table(doc, bt); doc.moveDown(0.4) }

    H('Graphs')
    if (an && an.graphs.length) {
      an.graphs.forEach((g, i) => {
        const r = A.graphResults(g, A.graphPoints(an, g))
        const cap = `Figure ${i + 1}. ${g.title || 'Graph'}` + (r.best ? `. Line of best fit: gradient ${sig(r.best.gradient)}, y-intercept ${sig(r.best.intercept)}` : '') + (r.worst ? `; worst acceptable line: gradient ${sig(r.worst.gradient)}` : '') + (r.triangle ? `; triangle Δy/Δx = ${sig(r.triangle.dy)} / ${sig(r.triangle.dx)}` : '') + (g.showComputer ? '. The computer’s least-squares line was shown to the student as a check' : '') + '.'
        if (doc.y > 520) doc.addPage()
        studentGraph(doc, A, an, g, cap)
      })
    } else {
      para(doc, 'The student did not plot a graph.')
      const g = def.graph(params, state)
      if (g?.points?.length) { doc.moveDown(0.3); doc.font('Bold').fontSize(9).fillColor(GREY).text('Computer plot of the bench readings, for reference: ' + g.title, M, doc.y); graph(doc, g) }
    }

    H('Analysis')
    if (an && an.calcs.length) {
      for (const c of A.computeCalcs(an)) para(doc, `${c.label ? c.label + ': ' : ''}${c.name ? c.name + ' = ' : ''}${c.expr || '—'} = ${c.text || '—'} ${c.unit || ''}${c.error ? '  (' + c.error + ')' : ''}`, { fontSize: 9 })
      doc.moveDown(0.3)
    }
    if (nb.analysis) para(doc, nb.analysis)
    for (const q of def.questions.filter(x => !/^plan_/.test(x.id) && x.id !== 'evaluation')) {
      doc.moveDown(0.3)
      doc.font('Bold').fontSize(9.5).fillColor(INK).text(q.prompt, M, doc.y, { width: W })
      const shown = ans(q)
      para(doc, shown ? shown + (q.unit && q.type === 'numeric' ? ' ' + q.unit : '') : '—')
    }
    H('Conclusion'); para(doc, nb.conclusion)
    H('Evaluation'); para(doc, [nb.evaluation, answers.evaluation].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join('\n\n'))

    if (an && A) {
      const todo = A.checkAnalysis(an, { minRows: def.practical?.minPoints || 5 }).filter(c => !c.ok)
      heading(doc, 'Lab coach: data-handling points to improve')
      para(doc, todo.length ? todo.map(c => '• ' + c.text).join('\n') : 'None: the table, graph and working meet every check.', { fontSize: 9 })
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
