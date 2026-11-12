/**
 * mathTypeset.js: real mathematics on printed papers.
 * ============================================================
 * Plain Unicode is fine for x², H₂O or θ, but a fraction must print as a
 * fraction: numerator over a bar over denominator, as on any exam board
 * paper. Formulas with that kind of structure (fractions, roots, sums,
 * integrals, limits, matrices) are typeset by MathJax into vector SVG
 * and drawn inline with the question text by svg-to-pdfkit. Everything
 * else stays as selectable Unicode text in the paper's own font.
 *
 * drawRich(doc, raw, x, y, width, opts) lays a paragraph out word by word
 * with the formulas sitting on the text baseline. It returns false (and
 * draws nothing) when the text has no formula that needs typesetting, so
 * callers keep their ordinary doc.text() path for plain prose.
 */
const { splitMath, stripHtml, plainMath, keyboardMath, bareLatexSegments } = require('./mathText')

let SVGtoPDF = null, MJ = null
function engine() {
  if (MJ) return MJ
  const { mathjax } = require('mathjax-full/js/mathjax.js')
  const { TeX } = require('mathjax-full/js/input/tex.js')
  const { SVG } = require('mathjax-full/js/output/svg.js')
  const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js')
  const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js')
  const { AllPackages } = require('mathjax-full/js/input/tex/AllPackages.js')
  SVGtoPDF = require('svg-to-pdfkit')
  const adaptor = liteAdaptor()
  RegisterHTMLHandler(adaptor)
  const html = mathjax.document('', {
    InputJax: new TeX({ packages: AllPackages.filter(p => p !== 'bussproofs') }),
    OutputJax: new SVG({ fontCache: 'none' }),
  })
  MJ = { adaptor, html }
  return MJ
}

// Structure that Unicode cannot show on one line.
const NEEDS_TYPESET = /\\(?:[dtc]?frac|sqrt|int|iint|oint|sum|prod|lim|binom|dbinom|begin|over\b|overline|underline|overrightarrow|vec|hat|widehat|bar|cancel|underbrace|overbrace|stackrel|overset)/

const cache = new Map()
function typeset(tex) {
  if (cache.has(tex)) return cache.get(tex)
  let out = null
  try {
    const { adaptor, html } = engine()
    // Display style: full-size numerators and limits, as on a printed paper.
    const node = html.convert('\\displaystyle ' + tex, { display: false })
    const svg = adaptor.innerHTML(node)
    if (/data-mjx-error|merror/.test(svg)) throw new Error('TeX error')
    const num = (re) => { const m = svg.match(re); return m ? parseFloat(m[1]) : 0 }
    out = { svg, wEx: num(/width="([\d.]+)ex"/), hEx: num(/height="([\d.]+)ex"/), vaEx: num(/vertical-align:\s*(-?[\d.]+)ex/) }
  } catch (e) { out = null }
  if (cache.size > 500) cache.clear()
  cache.set(tex, out)
  return out
}

/** Paper text into tokens: { t:'text', s } and { t:'math', tex }. */
function tokens(raw) {
  const out = []
  const pushText = (s) => { if (s) out.push({ t: 'text', s }) }
  for (const part of splitMath(stripHtml(String(raw)))) {
    const runs = part.math ? [{ math: true, text: part.text }] : bareLatexSegments(part.text)
    for (const r of runs) {
      if (!r.math) { pushText(keyboardMath(r.text)); continue }
      if (!r.script && NEEDS_TYPESET.test(r.text)) out.push({ t: 'math', tex: r.text })
      else pushText(plainMath(r.text))
    }
  }
  return out
}

/**
 * Draw a paragraph whose formulas need real typesetting. The caller sets
 * the font, size and colour first (as for doc.text). Returns false when
 * there is nothing to typeset.
 */
function drawRich(doc, raw, x, y, width, opts = {}) {
  if (raw == null || raw === '') return false
  const toks = tokens(raw)
  if (!toks.some(t => t.t === 'math')) return false
  const items = []                     // measured: { kind, text|svg, w, asc, desc }
  const size = doc._fontSize
  const f = doc._font
  const tAsc = (f.ascender / 1000) * size
  const tDesc = (-f.descender / 1000) * size
  const gap = Math.max(1, doc.currentLineHeight(true) - tAsc - tDesc)
  const exPt = size * 0.5
  let any = false

  const addText = (s) => {
    for (const piece of String(s).split(/(\n|\s+)/)) {
      if (!piece) continue
      if (piece === '\n' || /\n/.test(piece)) { items.push({ kind: 'br' }); continue }
      items.push({ kind: /^\s+$/.test(piece) ? 'sp' : 'word', text: piece, w: doc.widthOfString(piece.replace(/\s+/g, ' ')) })
    }
  }
  if (opts.prefix) addText(opts.prefix)
  for (const t of toks) {
    if (t.t === 'text') { addText(t.s); continue }
    const m = typeset(t.tex)
    if (!m) { addText(plainMath(t.tex)); continue }
    any = true
    const w = m.wEx * exPt, h = m.hEx * exPt, desc = Math.max(0, -m.vaEx * exPt)
    // Give the SVG its size in points: its own "ex" units are read
    // differently by svg-to-pdfkit and drew formulas too large.
    const svg = m.svg.replace(/^<svg([^>]*?)\swidth="[^"]*"/, `<svg$1 width="${w.toFixed(2)}pt"`)
      .replace(/^<svg([^>]*?)\sheight="[^"]*"/, `<svg$1 height="${h.toFixed(2)}pt"`)
      .replace(/^<svg([^>]*?)\sstyle="[^"]*"/, '<svg$1')
    items.push({ kind: 'math', svg, w, h, asc: h - desc, desc })
  }
  if (!any) return false

  // Greedy line breaking; a formula wider than the line gets a line of its own.
  const lines = [[]]
  let lw = 0
  for (const it of items) {
    if (it.kind === 'br') { lines.push([]); lw = 0; continue }
    const line = lines[lines.length - 1]
    if (it.kind === 'sp') { if (line.length) { line.push(it); lw += it.w } continue }
    if (lw + it.w > width && line.length) {
      while (line.length && line[line.length - 1].kind === 'sp') line.pop()
      lines.push([it]); lw = it.w
    } else { line.push(it); lw += it.w }
  }

  const bottom = () => doc.page.height - doc.page.margins.bottom
  let top = y
  let first = true
  for (const line of lines) {
    const asc = Math.max(tAsc, ...line.filter(i => i.kind === 'math').map(i => i.asc + 1.5))
    const desc = Math.max(tDesc, ...line.filter(i => i.kind === 'math').map(i => i.desc + 1.5))
    if (top + asc + desc > bottom()) { doc.addPage(); top = doc.page.margins.top }
    const base = top + asc
    if (first && opts.label) {
      // The question number sits on the first line's baseline, even when
      // a tall fraction makes that line deeper than usual.
      const L = opts.label
      const keepFont = doc._font, keepSize = doc._fontSize
      doc.font(L.font || 'Helvetica-Bold').fontSize(L.size || size)
      const la = (doc._font.ascender / 1000) * doc._fontSize
      doc.text(L.text, L.x, base - la, { lineBreak: false, width: L.width || 26 })
      doc._font = keepFont; doc._fontSize = keepSize
    }
    first = false
    let cx = x
    for (const it of line) {
      if (it.kind === 'word') doc.text(it.text, cx, base - tAsc, { lineBreak: false })
      else if (it.kind === 'math') SVGtoPDF(doc, it.svg, cx, base - it.asc, { width: it.w, height: it.h })
      cx += it.w
    }
    top = base + desc + gap
  }
  doc.x = x
  doc.y = top
  return true
}

/** True when the text holds a formula that will be typeset. */
const needsTypeset = (raw) => raw != null && raw !== '' && tokens(raw).some(t => t.t === 'math')

module.exports = { drawRich, typeset, tokens, needsTypeset, NEEDS_TYPESET }
