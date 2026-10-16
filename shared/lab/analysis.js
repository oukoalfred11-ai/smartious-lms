/**
 * analysis.js — the student's own data handling: results table, graphs,
 * lines drawn by hand, gradient triangles and worked calculations.
 *
 * The bench records what the instruments showed. Everything after that is
 * the student's work, as on paper in a school laboratory: they head the
 * table, choose the calculated columns and their precision, choose the axes
 * and scales, draw the line of best fit (and a worst acceptable line), read
 * a gradient triangle and write out the calculation. The computer only does
 * the arithmetic the student asks for, and the coach (checkAnalysis) points
 * out what an examiner would mark down.
 *
 * Shape (plain JSON, saved with the session):
 * {
 *   table:  { columns: [{ id, name, unit, kind: 'raw'|'calc', formula?, dp?, sf? }], rows: [[string, ...]] }
 *   graphs: [{ id, type: 'scatter'|'line'|'bar', title, x, y, err?, xLabel, yLabel,
 *              scale: { auto, origin, xmin, xmax, ymin, ymax },
 *              lines: [{ role: 'best'|'worst'|'tangent', x1, y1, x2, y2 }],
 *              triangle: { xa, xb } | null, showComputer }]
 *   calcs:  [{ name, label, expr, unit, sf }]
 * }
 * Columns are referred to by letter (A = first column) in formulas, as in a
 * spreadsheet. Pure functions, no dependencies.
 */
import { linearFit, fitThroughOrigin, toSigFigs } from './science/numeric.js'

export const LIMITS = { columns: 12, rows: 40, graphs: 4, calcs: 30, lines: 4, text: 200, formula: 160, cell: 40 }
export const GRAPH_TYPES = ['scatter', 'line', 'bar']
export const LINE_ROLES = ['best', 'worst', 'tangent']
export const LINE_LABEL = { best: 'Line of best fit', worst: 'Worst acceptable line', tangent: 'Tangent' }

export const letterOf = (i) => String.fromCharCode(65 + i)
export const indexOfLetter = (l) => l.charCodeAt(0) - 65

// ── Formula language ────────────────────────────────────────
// Numbers, + − × ÷ ^, brackets, column letters (A–L), names of earlier
// results (lower case), pi, and functions. Angles are in degrees.
const DEG = Math.PI / 180
const FUNCS = {
  sqrt: { n: 1, f: Math.sqrt }, ln: { n: 1, f: Math.log }, lg: { n: 1, f: Math.log10 }, log: { n: 1, f: Math.log10 },
  exp: { n: 1, f: Math.exp }, abs: { n: 1, f: Math.abs },
  sin: { n: 1, f: (x) => Math.sin(x * DEG) }, cos: { n: 1, f: (x) => Math.cos(x * DEG) }, tan: { n: 1, f: (x) => Math.tan(x * DEG) },
  asin: { n: 1, f: (x) => Math.asin(x) / DEG }, acos: { n: 1, f: (x) => Math.acos(x) / DEG }, atan: { n: 1, f: (x) => Math.atan(x) / DEG },
  // Aggregates take columns (whole column) or any list of values.
  mean: { agg: true, f: (xs) => xs.reduce((a, b) => a + b, 0) / xs.length },
  sum: { agg: true, f: (xs) => xs.reduce((a, b) => a + b, 0) },
  min: { agg: true, f: (xs) => Math.min(...xs) }, max: { agg: true, f: (xs) => Math.max(...xs) },
  range: { agg: true, f: (xs) => Math.max(...xs) - Math.min(...xs) },
  halfrange: { agg: true, f: (xs) => (Math.max(...xs) - Math.min(...xs)) / 2 },
}
export const FUNCTION_NAMES = Object.keys(FUNCS)

export class FormulaError extends Error {}
const ferr = (m) => { throw new FormulaError(m) }

export function tokenize(src) {
  const s = String(src ?? '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/²/g, '^2').replace(/³/g, '^3')
  const out = []
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (/\s/.test(ch)) { i++; continue }
    const num = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i))
    if (num) { out.push({ t: 'num', v: Number(num[0]) }); i += num[0].length; continue }
    const word = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i))
    if (word) {
      const w = word[0]
      if (/^[A-Z]$/.test(w)) out.push({ t: 'ref', v: w })
      else out.push({ t: 'name', v: FUNCS[w.toLowerCase()] || w.toLowerCase() === 'pi' ? w.toLowerCase() : w })
      i += w.length; continue
    }
    if ('+-*/^(),'.includes(ch)) { out.push({ t: 'op', v: ch }); i++; continue }
    ferr('Unexpected “' + ch + '”.')
  }
  return out
}

export function parseFormula(src) {
  const toks = tokenize(src)
  if (!toks.length) ferr('Empty formula.')
  let p = 0
  const peek = () => toks[p]
  const isOp = (v) => peek()?.t === 'op' && peek().v === v
  const take = (v) => { if (!isOp(v)) ferr('Expected “' + v + '”.'); p++ }
  function expr() {
    let n = term()
    while (isOp('+') || isOp('-')) { const op = toks[p++].v; n = { k: 'bin', op, a: n, b: term() } }
    return n
  }
  function term() {
    let n = unary()
    for (;;) {
      if (isOp('*') || isOp('/')) { const op = toks[p++].v; n = { k: 'bin', op, a: n, b: unary() } }
      // implicit multiplication: 2pi, 2(A+B), 4 pi
      else if (peek() && (peek().t === 'name' || peek().t === 'ref' || isOp('(')) && n) n = { k: 'bin', op: '*', a: n, b: unary() }
      else break
    }
    return n
  }
  function unary() {
    if (isOp('-')) { p++; return { k: 'neg', a: unary() } }
    if (isOp('+')) { p++; return unary() }
    return power()
  }
  function power() {
    const base = atom()
    if (isOp('^')) { p++; return { k: 'bin', op: '^', a: base, b: unary() } }
    return base
  }
  function atom() {
    const t = peek()
    if (!t) ferr('The formula ends too soon.')
    if (t.t === 'num') { p++; return { k: 'num', v: t.v } }
    if (t.t === 'ref') { p++; return { k: 'ref', v: t.v } }
    if (t.t === 'name') {
      p++
      if (FUNCS[t.v]) {
        take('(')
        const args = [expr()]
        while (isOp(',')) { p++; args.push(expr()) }
        take(')')
        if (FUNCS[t.v].n && args.length !== FUNCS[t.v].n) ferr(t.v + ' takes ' + FUNCS[t.v].n + ' value.')
        return { k: 'call', f: t.v, args }
      }
      if (t.v === 'pi') return { k: 'num', v: Math.PI }
      return { k: 'name', v: t.v }
    }
    if (isOp('(')) { p++; const n = expr(); take(')'); return n }
    ferr('Unexpected “' + t.v + '”.')
  }
  const tree = expr()
  if (p < toks.length) ferr('Unexpected “' + toks[p].v + '”.')
  return tree
}

/**
 * Evaluate a parsed formula. env:
 *   ref(letter)    → number (the value in this row), or
 *   column(letter) → number[] (whole column, for aggregates and working lines)
 *   names          → { name: number }
 * In a working line a bare column letter means the column's mean.
 */
export function evaluate(tree, env) {
  const ev = (n) => {
    switch (n.k) {
      case 'num': return n.v
      case 'neg': return -ev(n.a)
      case 'ref': {
        if (env.ref) return env.ref(n.v)
        const col = env.column?.(n.v)
        if (!col) ferr('Unknown column ' + n.v + '.')
        if (!col.length) ferr('Column ' + n.v + ' has no numbers.')
        return FUNCS.mean.f(col)
      }
      case 'name': {
        const v = env.names?.[n.v]
        if (v === undefined) ferr('Unknown name “' + n.v + '”.')
        if (!Number.isFinite(v)) ferr('“' + n.v + '” has no value yet.')
        return v
      }
      case 'bin': {
        const a = ev(n.a), b = ev(n.b)
        if (n.op === '+') return a + b
        if (n.op === '-') return a - b
        if (n.op === '*') return a * b
        if (n.op === '/') { if (b === 0) ferr('Division by zero.'); return a / b }
        return Math.pow(a, b)
      }
      case 'call': {
        const fn = FUNCS[n.f]
        if (fn.agg) {
          const vals = []
          for (const a of n.args) {
            if (a.k === 'ref' && env.column) { const col = env.column(a.v); if (!col) ferr('Unknown column ' + a.v + '.'); vals.push(...col) }
            else vals.push(ev(a))
          }
          if (!vals.length) ferr(n.f + ' needs some numbers.')
          return fn.f(vals)
        }
        return fn.f(ev(n.args[0]))
      }
    }
    ferr('Bad formula.')
  }
  const v = ev(tree)
  if (!Number.isFinite(v)) ferr('The result is not a number (check for a square root or log of a negative value).')
  return v
}

/** Letters a formula refers to. */
export function refsOf(src) {
  try { return [...new Set(tokenize(src).filter(t => t.t === 'ref').map(t => t.v))] } catch { return [] }
}

/** Rewrite a formula after column `removed` (index) is deleted. Refs to it become “?”. */
export function shiftRefs(src, removed) {
  let toks
  try { toks = tokenize(src) } catch { return src }
  if (!toks.some(t => t.t === 'ref')) return src
  return String(src).replace(/(^|[^A-Za-z0-9_])([A-Z])(?![A-Za-z0-9_])/g, (m, pre, l) => {
    const i = indexOfLetter(l)
    if (i === removed) return pre + '?'
    return pre + (i > removed ? letterOf(i - 1) : l)
  })
}

// ── Numbers as a student writes them ────────────────────────
/** Parse a cell: a number (allowing a leading +, a comma decimal or ×10^n) or null. */
export function parseCell(text) {
  const t = String(text ?? '').trim().replace(/−/g, '-').replace(/,(\d)/g, '.$1')
  if (!t) return null
  const sci = /^([+-]?\d*\.?\d+)\s*[x×]\s*10\^?([+-]?\d+)$/.exec(t)
  if (sci) return Number(sci[1]) * Math.pow(10, Number(sci[2]))
  if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t)) return null
  return Number(t)
}
/** Decimal places written in a cell (“2.50” → 2), or null when not a plain decimal. */
export function decimalsWritten(text) {
  const t = String(text ?? '').trim().replace(/,(\d)/g, '.$1')
  if (!/^[+-]?\d*\.?\d+$/.test(t)) return null
  const i = t.indexOf('.')
  return i < 0 ? 0 : t.length - i - 1
}
/** Significant figures written in a plain decimal (“0.0250” → 3). */
export function sigFigsWritten(text) {
  const t = String(text ?? '').trim().replace(/^[+-]/, '')
  if (!/^\d*\.?\d+$/.test(t)) return null
  const digits = t.replace('.', '').replace(/^0+/, '')
  if (!digits) return 1
  return t.includes('.') ? digits.length : digits.replace(/0+$/, '').length || 1
}

export function formatValue(v, col = {}) {
  if (v == null || !Number.isFinite(v)) return '—'
  if (col.dp != null && col.dp !== '') return v.toFixed(Math.max(0, Math.min(8, Number(col.dp))))
  const sf = col.sf != null && col.sf !== '' ? Math.max(1, Math.min(8, Number(col.sf))) : 3
  const r = toSigFigs(v, sf)
  if (r !== 0 && (Math.abs(r) >= 1e6 || Math.abs(r) < 1e-4)) return r.toExponential(sf - 1)
  // keep trailing zeros that are significant (0.250, 12.0)
  const s = Number(r).toPrecision(sf)
  return s.includes('e') ? String(r) : s
}
export const headingOf = (col) => (col?.name ? col.name + (col.unit ? ' / ' + col.unit : '') : '')

// ── Table ──────────────────────────────────────────────────
export function emptyAnalysis() {
  return { table: { columns: [], rows: [] }, graphs: [], calcs: [] }
}

/**
 * Work out every cell. Returns { columns, cells[r][c] = { text, value, error }, column(letter) }.
 * Calculated columns may refer to raw columns and to calculated columns to their left.
 */
export function computeTable(table) {
  const cols = table?.columns || []
  const rows = table?.rows || []
  const trees = cols.map(c => {
    if (c.kind !== 'calc') return null
    try {
      const tree = parseFormula(c.formula || '')
      for (const l of refsOf(c.formula)) {
        const i = indexOfLetter(l)
        if (i < 0 || i >= cols.length) return { error: 'Column ' + l + ' does not exist.' }
        if (i === cols.indexOf(c)) return { error: 'A column cannot use itself.' }
        if (cols[i].kind === 'calc' && i > cols.indexOf(c)) return { error: 'Column ' + l + ' is calculated later; move this column to its right.' }
      }
      return { tree }
    } catch (e) { return { error: e.message } }
  })
  const cells = rows.map(r => {
    const out = []
    cols.forEach((c, ci) => {
      if (c.kind !== 'calc') {
        const text = String(r[ci] ?? '')
        out.push({ text, value: parseCell(text), error: null })
        return
      }
      const t = trees[ci]
      if (t.error) { out.push({ text: '', value: null, error: t.error }); return }
      // a calculated column is blank on a row whose inputs are blank
      const refs = refsOf(c.formula)
      if (refs.some(l => out[indexOfLetter(l)]?.value == null)) { out.push({ text: '', value: null, error: null }); return }
      try {
        const value = evaluate(t.tree, { ref: (l) => { const v = out[indexOfLetter(l)]?.value; if (v == null) ferr('blank'); return v } })
        out.push({ text: formatValue(value, c), value, error: null })
      } catch (e) { out.push({ text: '', value: null, error: e.message }) }
    })
    return out
  })
  const column = (l) => {
    const i = indexOfLetter(l)
    if (i < 0 || i >= cols.length) return null
    return cells.map(r => r[i]?.value).filter(v => v != null && Number.isFinite(v))
  }
  return { columns: cols, cells, column }
}

/** Value the computer uses for a cell (the rounded text for calculated columns, as the student would plot it). */
const plotValue = (cell) => (cell?.value == null ? null : cell.text && cell.text !== '—' ? (parseCell(cell.text) ?? cell.value) : cell.value)

// ── Bench readings → a starting table ───────────────────────
/** Split a heading “p.d. V / V” into { name, unit }. */
export function splitHeading(h) {
  const s = String(h || '')
  const i = s.lastIndexOf(' / ')
  return i < 0 ? { name: s, unit: '' } : { name: s.slice(0, i), unit: s.slice(i + 3) }
}
/**
 * Raw (measured) columns of a bench table, ready to copy into the student's
 * table. Calculated columns are left out: working them out is the student's job.
 */
export function rawFromBench(benchTable) {
  if (!benchTable) return null
  const derived = new Set(benchTable.derived || [])
  const keep = benchTable.columns.map((c, i) => i).filter(i => !derived.has(i) && !/^#$|^run$/i.test(benchTable.columns[i].trim()))
  return {
    columns: keep.map((i, k) => ({ id: 'c' + (k + 1), kind: 'raw', ...splitHeading(benchTable.columns[i]) })),
    rows: benchTable.rows.map(r => keep.map(i => (r[i] === '—' ? '' : String(r[i] ?? '')))),
  }
}

// ── Lines and graphs ───────────────────────────────────────
export function lineOf(l) {
  if (!l || ![l.x1, l.y1, l.x2, l.y2].every(Number.isFinite) || l.x1 === l.x2) return null
  const m = (l.y2 - l.y1) / (l.x2 - l.x1)
  return { m, c: l.y1 - m * l.x1 }
}

/** Points of a graph from the student's table. Bar graphs keep the x text as a category. */
export function graphPoints(analysis, g) {
  const t = computeTable(analysis.table)
  const ix = t.columns.findIndex(c => c.id === g.x), iy = t.columns.findIndex(c => c.id === g.y)
  const ie = g.err ? t.columns.findIndex(c => c.id === g.err) : -1
  if (ix < 0 || iy < 0) return []
  return t.cells.map((r, i) => ({
    row: i, cat: r[ix]?.text || '', x: plotValue(r[ix]), y: plotValue(r[iy]), e: ie >= 0 ? Math.abs(plotValue(r[ie]) ?? NaN) : null,
  })).filter(p => p.y != null && (g.type === 'bar' ? p.cat !== '' : p.x != null))
}

function niceStep(span, n) {
  const raw = span / n
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const f = raw / mag
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag
}
/** Axis range and tick step for a graph. Uses the student's scale when they set one. */
export function axesOf(g, pts) {
  const sc = g.scale || {}
  const range = (vals, lo, hi, withErr) => {
    if (!sc.auto && Number.isFinite(lo) && Number.isFinite(hi) && hi > lo) return [lo, hi]
    if (!vals.length) return [0, 1]
    let a = Math.min(...vals), b = Math.max(...vals)
    if (withErr) { a = Math.min(a, ...withErr.map(p => p.y - (p.e || 0))); b = Math.max(b, ...withErr.map(p => p.y + (p.e || 0))) }
    if (sc.origin || g.type === 'bar') { a = Math.min(a, 0); b = Math.max(b, 0) }
    if (a === b) { a -= Math.abs(a) * 0.1 || 1; b += Math.abs(b) * 0.1 || 1 }
    const st = niceStep(b - a, 5)
    // round outwards to whole steps (a value already on a step stays put)
    return [Math.floor(a / st + 1e-9) * st, Math.ceil(b / st - 1e-9) * st]
  }
  const n = (v) => (v === '' || v == null ? NaN : Number(v))
  const [xmin, xmax] = g.type === 'bar' ? [0, Math.max(1, pts.length)] : range(pts.map(p => p.x), n(sc.xmin), n(sc.xmax))
  const [ymin, ymax] = range(pts.map(p => p.y), n(sc.ymin), n(sc.ymax), pts.some(p => p.e) ? pts : null)
  return { xmin, xmax, ymin, ymax, xstep: niceStep(xmax - xmin, 5), ystep: niceStep(ymax - ymin, 5) }
}

/** The computer's least-squares line for a graph (shown only when the student asks). */
export function computerFit(pts, kind = 'line') {
  const p = pts.filter(q => Number.isFinite(q.x) && Number.isFinite(q.y))
  if (kind === 'origin') { const f = fitThroughOrigin(p); return f ? { m: f.m, c: 0 } : null }
  const f = linearFit(p)
  return f ? { m: f.m, c: f.c, r2: f.r2 } : null
}

/** Results read from a graph: gradients and intercepts of the student's lines, and the triangle. */
export function graphResults(g, pts) {
  const out = {}
  for (const l of g.lines || []) {
    const ln = lineOf(l)
    if (!ln || out[l.role]) continue
    out[l.role] = { gradient: ln.m, intercept: ln.c, xIntercept: ln.m !== 0 ? -ln.c / ln.m : null }
  }
  const best = lineOf((g.lines || []).find(l => l.role === 'best'))
  if (best && g.triangle && Number.isFinite(g.triangle.xa) && Number.isFinite(g.triangle.xb) && g.triangle.xa !== g.triangle.xb) {
    const { xa, xb } = g.triangle
    const ya = best.m * xa + best.c, yb = best.m * xb + best.c
    out.triangle = { xa, ya, xb, yb, dx: xb - xa, dy: yb - ya, gradient: (yb - ya) / (xb - xa) }
  }
  if (out.best && out.worst) {
    out.gradientUncertainty = Math.abs(out.best.gradient - out.worst.gradient)
    out.interceptUncertainty = Math.abs(out.best.intercept - out.worst.intercept)
    out.gradientPercent = out.best.gradient ? 100 * out.gradientUncertainty / Math.abs(out.best.gradient) : null
  }
  if (pts) { const f = computerFit(pts); if (f) out.computer = f }
  return out
}

/** Names a working line can use: gradient, intercept, worst_gradient … (g2_gradient for the second graph). */
export function graphNames(analysis) {
  const names = {}
  ;(analysis.graphs || []).forEach((g, i) => {
    const r = graphResults(g)
    const pre = i ? 'g' + (i + 1) + '_' : ''
    if (r.best) { names[pre + 'gradient'] = r.best.gradient; names[pre + 'intercept'] = r.best.intercept; if (r.best.xIntercept != null) names[pre + 'x_intercept'] = r.best.xIntercept }
    if (r.worst) { names[pre + 'worst_gradient'] = r.worst.gradient; names[pre + 'worst_intercept'] = r.worst.intercept }
    if (r.tangent) names[pre + 'tangent_gradient'] = r.tangent.gradient
    if (r.gradientUncertainty != null) names[pre + 'gradient_uncertainty'] = r.gradientUncertainty
  })
  return names
}

/** Evaluate the working lines in order; each named line can be used by later ones. */
export function computeCalcs(analysis) {
  const t = computeTable(analysis.table)
  const names = { ...graphNames(analysis) }
  return (analysis.calcs || []).map(c => {
    let value = null, error = null
    if (String(c.expr || '').trim()) {
      try { value = evaluate(parseFormula(c.expr), { column: t.column, names }) } catch (e) { error = e.message }
    }
    const nm = String(c.name || '').trim()
    if (nm && value != null) names[nm] = value
    return { ...c, value, error, text: value == null ? '' : formatValue(value, { sf: c.sf || 3 }) }
  })
}

// ── Coach: what an examiner would look for ─────────────────
/**
 * Returns [{ area, ok: true|false, text }]. Formative only: these do not
 * change marks, they tell the student (and teacher) what to improve.
 */
export function checkAnalysis(analysis, { minRows = 5 } = {}) {
  const out = []
  const add = (area, ok, text) => out.push({ area, ok, text })
  const t = computeTable(analysis?.table)
  const cols = t.columns
  if (!cols.length) { add('Table', false, 'Draw up a results table: one column for each quantity you measured or calculated.'); return out }
  const noHead = cols.filter(c => !String(c.name || '').trim())
  add('Table', !noHead.length, noHead.length ? 'Every column needs a heading naming the quantity.' : 'Every column has a heading.')
  const noUnit = cols.filter(c => String(c.name || '').trim() && !String(c.unit || '').trim() && !c.noUnit)
  add('Table', !noUnit.length, noUnit.length ? 'Give a unit in the heading of: ' + noUnit.map(c => c.name).join(', ') + ' (write “quantity / unit”, or tick “no unit”).' : 'Every heading has a unit.')
  const filled = t.cells.filter(r => r.some(c => c.value != null))
  add('Table', filled.length >= minRows, filled.length >= minRows ? filled.length + ' rows of results.' : 'Only ' + filled.length + ' rows of results: aim for at least ' + minRows + '.')
  cols.forEach((c, ci) => {
    if (c.kind === 'calc') {
      const errs = t.cells.map(r => r[ci]).filter(x => x.error)
      if (errs.length || (!t.cells.length && !String(c.formula || '').trim())) add('Table', false, `Column ${letterOf(ci)} (${c.name || 'calculated'}): ${errs[0]?.error || 'enter a formula'}`)
      return
    }
    const dps = t.cells.map(r => decimalsWritten(r[ci]?.text)).filter(d => d != null)
    if (dps.length >= 2 && new Set(dps).size > 1) add('Table', false, `Column ${letterOf(ci)} (${c.name || '?'}): write every reading to the same number of decimal places (the instrument’s precision).`)
    const bad = t.cells.filter(r => r[ci]?.text && r[ci].value == null && cols.length > 1 && dps.length)
    if (bad.length) add('Table', false, `Column ${letterOf(ci)}: ${bad.length} entr${bad.length === 1 ? 'y is' : 'ies are'} not a number. Units go in the heading, not in the cells.`)
  })
  // calculated columns: as many s.f. as the least precise raw data, or one more
  cols.forEach((c, ci) => {
    if (c.kind !== 'calc') return
    const srcs = refsOf(c.formula).map(indexOfLetter).filter(i => cols[i] && cols[i].kind !== 'calc')
    if (!srcs.length) return
    const rawSf = Math.min(...srcs.flatMap(i => t.cells.map(r => sigFigsWritten(r[i]?.text)).filter(x => x != null)))
    const sf = c.dp != null && c.dp !== '' ? null : Number(c.sf || 3)
    if (Number.isFinite(rawSf) && sf != null && (sf < rawSf || sf > rawSf + 1)) add('Table', false, `Column ${letterOf(ci)} (${c.name || 'calculated'}): give ${rawSf} or ${rawSf + 1} significant figures, to match the data it comes from.`)
  })

  const graphs = analysis?.graphs || []
  if (!graphs.length) add('Graph', false, 'Plot a graph of your results.')
  graphs.forEach((g, gi) => {
    const tag = graphs.length > 1 ? `Graph ${gi + 1}: ` : 'Graph: '
    const pts = graphPoints(analysis, g)
    const xs = cols.find(c => c.id === g.x), ys = cols.find(c => c.id === g.y)
    if (!xs || !ys) { add('Graph', false, tag + 'choose a column for each axis.'); return }
    const lab = (s, c) => String(s || '').trim() || headingOf(c)
    const xl = lab(g.xLabel, xs), yl = lab(g.yLabel, ys)
    add('Graph', /\/|\(.+\)/.test(xl) && /\/|\(.+\)/.test(yl), /\/|\(.+\)/.test(xl) && /\/|\(.+\)/.test(yl) ? tag + 'both axes are labelled with quantity and unit.' : tag + 'label each axis with the quantity and its unit, e.g. “I / A”.')
    if (g.type === 'bar') { add('Graph', pts.length >= 2, pts.length >= 2 ? tag + pts.length + ' bars.' : tag + 'needs at least two bars.'); return }
    if (pts.length < 2) { add('Graph', false, tag + 'needs at least two plotted points.'); return }
    const ax = axesOf(g, pts)
    const fx = (Math.max(...pts.map(p => p.x)) - Math.min(...pts.map(p => p.x))) / (ax.xmax - ax.xmin)
    const fy = (Math.max(...pts.map(p => p.y)) - Math.min(...pts.map(p => p.y))) / (ax.ymax - ax.ymin)
    const offGrid = pts.filter(p => p.x < ax.xmin || p.x > ax.xmax || p.y < ax.ymin || p.y > ax.ymax).length
    if (offGrid) add('Graph', false, tag + offGrid + ' point(s) fall outside your scale. Change the axis limits.')
    else add('Graph', fx >= 0.5 && fy >= 0.5, fx >= 0.5 && fy >= 0.5 ? tag + 'the points fill more than half the grid in both directions.' : tag + 'choose scales so the points cover at least half the grid in each direction.')
    if (g.type !== 'scatter') return
    const best = lineOf((g.lines || []).find(l => l.role === 'best'))
    if (!best) { add('Graph', false, tag + 'draw a line of best fit (drag its two ends).'); return }
    const fit = computerFit(pts)
    const res = pts.map(p => p.y - (best.m * p.x + best.c))
    const above = res.filter(r => r > 0).length, below = res.filter(r => r < 0).length
    const yspan = Math.max(...pts.map(p => p.y)) - Math.min(...pts.map(p => p.y)) || 1
    const close = fit && Math.abs(best.m - fit.m) <= 0.08 * Math.abs(fit.m) + 1e-12 && Math.abs(res.reduce((a, b) => a + b, 0) / res.length) <= 0.05 * yspan
    add('Graph', !!close && Math.abs(above - below) <= Math.max(1, Math.ceil(pts.length / 4)),
      close && Math.abs(above - below) <= Math.max(1, Math.ceil(pts.length / 4)) ? tag + 'the line of best fit is balanced, with points evenly on both sides.' : tag + 'adjust the line of best fit so the points are spread evenly above and below it, following the trend.')
    const r = graphResults(g, pts)
    if (r.triangle) {
      const span = Math.max(...pts.map(p => p.x)) - Math.min(...pts.map(p => p.x))
      add('Analysis', Math.abs(r.triangle.dx) >= 0.5 * span, Math.abs(r.triangle.dx) >= 0.5 * span ? tag + 'the gradient triangle is large (more than half the line).' : tag + 'make the gradient triangle larger: at least half the length of the line, to reduce the reading uncertainty.')
    } else add('Analysis', false, tag + 'draw a gradient triangle on the line of best fit.')
    if (!(g.lines || []).some(l => l.role === 'worst')) add('Analysis', false, tag + 'draw a worst acceptable line to find the uncertainty in the gradient.')
  })
  const calcs = computeCalcs(analysis || emptyAnalysis())
  if (!calcs.length) add('Analysis', false, 'Show your working: write each step of the calculation.')
  calcs.forEach((c, i) => {
    if (c.error) add('Analysis', false, `Working line ${i + 1}: ${c.error}`)
    else if (c.value != null && !String(c.unit || '').trim() && !c.noUnit) add('Analysis', false, `Working line ${i + 1} (${c.label || c.name || 'result'}): give the unit.`)
  })
  return out
}

// ── Saving: validate and trim untrusted input ───────────────
const str = (v, n = LIMITS.text) => String(v ?? '').slice(0, n)
const fin = (v) => (v === '' || v == null ? null : Number.isFinite(Number(v)) ? Number(v) : null)
const sid = (v) => String(v ?? '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 24)

export function cleanAnalysis(a) {
  if (a == null) return emptyAnalysis()
  if (typeof a !== 'object') throw new Error('Analysis must be an object.')
  const cols = (Array.isArray(a.table?.columns) ? a.table.columns : []).slice(0, LIMITS.columns).map((c, i) => ({
    id: sid(c?.id) || 'c' + (i + 1), name: str(c?.name, 80), unit: str(c?.unit, 40),
    kind: c?.kind === 'calc' ? 'calc' : 'raw', ...(c?.kind === 'calc' ? { formula: str(c.formula, LIMITS.formula) } : {}),
    ...(fin(c?.dp) != null ? { dp: Math.max(0, Math.min(8, Math.round(fin(c.dp)))) } : {}),
    ...(fin(c?.sf) != null ? { sf: Math.max(1, Math.min(8, Math.round(fin(c.sf)))) } : {}),
    ...(c?.noUnit ? { noUnit: true } : {}),
  }))
  const ids = new Set(cols.map(c => c.id))
  if (ids.size !== cols.length) throw new Error('Two table columns have the same id.')
  const rows = (Array.isArray(a.table?.rows) ? a.table.rows : []).slice(0, LIMITS.rows).map(r => cols.map((c, i) => (c.kind === 'calc' ? '' : str(Array.isArray(r) ? r[i] : '', LIMITS.cell))))
  const graphs = (Array.isArray(a.graphs) ? a.graphs : []).slice(0, LIMITS.graphs).map((g, i) => ({
    id: sid(g?.id) || 'g' + (i + 1), type: GRAPH_TYPES.includes(g?.type) ? g.type : 'scatter', title: str(g?.title, 120),
    x: ids.has(g?.x) ? g.x : null, y: ids.has(g?.y) ? g.y : null, err: ids.has(g?.err) ? g.err : null,
    xLabel: str(g?.xLabel, 80), yLabel: str(g?.yLabel, 80),
    scale: { auto: g?.scale?.auto !== false, origin: !!g?.scale?.origin, xmin: fin(g?.scale?.xmin), xmax: fin(g?.scale?.xmax), ymin: fin(g?.scale?.ymin), ymax: fin(g?.scale?.ymax) },
    lines: (Array.isArray(g?.lines) ? g.lines : []).slice(0, LIMITS.lines).filter(l => LINE_ROLES.includes(l?.role))
      .map(l => ({ role: l.role, x1: fin(l.x1), y1: fin(l.y1), x2: fin(l.x2), y2: fin(l.y2) })).filter(l => [l.x1, l.y1, l.x2, l.y2].every(v => v != null)),
    triangle: g?.triangle && fin(g.triangle.xa) != null && fin(g.triangle.xb) != null ? { xa: fin(g.triangle.xa), xb: fin(g.triangle.xb) } : null,
    showComputer: !!g?.showComputer,
  }))
  const calcs = (Array.isArray(a.calcs) ? a.calcs : []).slice(0, LIMITS.calcs).map(c => ({
    name: String(c?.name ?? '').replace(/[^a-z0-9_]/g, '').slice(0, 24), label: str(c?.label, 120), expr: str(c?.expr, LIMITS.formula),
    unit: str(c?.unit, 40), sf: Math.max(1, Math.min(8, Math.round(fin(c?.sf) ?? 3))), ...(c?.noUnit ? { noUnit: true } : {}),
  }))
  return { table: { columns: cols, rows }, graphs, calcs }
}
