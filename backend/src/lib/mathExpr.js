/**
 * mathExpr.js — read and compare the mathematics students type.
 * ============================================================
 * Students answer "maths" questions with plain keyboard maths:
 *   2(x+1)   x^2 - 4   sqrt(2)/2   3.5e-4   2π   (a+b)^2   sin(x)/x
 * Two answers are the same when they have the same VALUE, not the same
 * spelling, so 2x+2, 2(x+1) and x*2 + 2 are all right. We parse each
 * into a small expression tree and evaluate both at several random
 * points for every variable they use.
 *
 * Supported: + − × ÷ * / ^ and unary minus, brackets ( ) [ ] { },
 * implicit multiplication (2x, 3(x+1), xy, 2π), √ and sqrt(), π/pi, e,
 * sin cos tan asin acos atan sinh cosh tanh ln log exp abs, decimals
 * with . or a lone comma, and scientific notation (3.5e-4, 3.5×10^-4).
 */

const FUNCS = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
  arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  sqrt: Math.sqrt, ln: Math.log, log: Math.log10, exp: Math.exp, abs: Math.abs,
  sec: x => 1 / Math.cos(x), csc: x => 1 / Math.sin(x), cot: x => 1 / Math.tan(x),
}
const CONSTS = { pi: Math.PI, 'π': Math.PI, e: Math.E }

function normalise(src) {
  return String(src || '')
    .replace(/\$/g, '')
    .replace(/\\left|\\right/g, '')
    .replace(/\\cdot|\\times|×|·|∙/g, '*')
    .replace(/\\div|÷|∶/g, '/')
    .replace(/[−–—]/g, '-')
    .replace(/\\pi/g, 'π')
    .replace(/\\sqrt/g, '√')
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/²/g, '^2').replace(/³/g, '^3')
    .replace(/(\d),(\d{1,2})(?!\d)/g, '$1.$2')   // 3,5 → 3.5 (not 1,000)
    .replace(/(\d),(\d{3})/g, '$1$2')            // 1,000 → 1000
    .replace(/\s+/g, '')
}

function tokenize(s) {
  const out = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (/[0-9.]/.test(c)) {
      const m = s.slice(i).match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i)
      if (!m) throw new Error('bad number')
      out.push({ t: 'num', v: parseFloat(m[0]) }); i += m[0].length; continue
    }
    if (/[A-Za-zπ]/.test(c)) {
      // Longest function or constant name first; otherwise single-letter variables.
      const rest = s.slice(i)
      const fn = Object.keys(FUNCS).sort((a, b) => b.length - a.length).find(f => rest.startsWith(f))
      if (fn) { out.push({ t: 'fn', v: fn }); i += fn.length; continue }
      if (rest.startsWith('pi')) { out.push({ t: 'num', v: Math.PI }); i += 2; continue }
      if (c === 'π') { out.push({ t: 'num', v: Math.PI }); i++; continue }
      out.push(c === 'e' ? { t: 'num', v: Math.E } : { t: 'var', v: c }); i++; continue
    }
    if (c === '√') { out.push({ t: 'fn', v: 'sqrt' }); i++; continue }
    if ('+-*/^'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue }
    if ('([{'.includes(c)) { out.push({ t: '(' }); i++; continue }
    if (')]}'.includes(c)) { out.push({ t: ')' }); i++; continue }
    throw new Error('unexpected ' + c)
  }
  // Implicit multiplication: 2x, 2(…), )(, x y, )x, 2sin(x), xπ
  const res = []
  for (let k = 0; k < out.length; k++) {
    const a = res[res.length - 1], b = out[k]
    const leftEnds = a && (a.t === 'num' || a.t === 'var' || a.t === ')')
    const rightStarts = b.t === 'num' || b.t === 'var' || b.t === '(' || b.t === 'fn'
    if (leftEnds && rightStarts) res.push({ t: 'op', v: '*' })
    res.push(b)
  }
  return res
}

// Precedence climbing. ^ is right-associative and binds tighter than unary minus (-x^2 = -(x^2)).
function parse(tokens) {
  let p = 0
  const peek = () => tokens[p]
  const take = () => tokens[p++]

  function primary() {
    const tk = take()
    if (!tk) throw new Error('unexpected end')
    if (tk.t === 'num') return { k: 'num', v: tk.v }
    if (tk.t === 'var') return { k: 'var', v: tk.v }
    if (tk.t === '(') { const e = expr(0); if (take()?.t !== ')') throw new Error('missing )'); return e }
    if (tk.t === 'fn') {
      // sin(x)^2 is (sin x)², as on paper; sin x and √2 take one power-level term.
      if (peek()?.t === '(') return { k: 'fn', f: tk.v, a: primary() }
      return { k: 'fn', f: tk.v, a: power() }
    }
    if (tk.t === 'op' && (tk.v === '-' || tk.v === '+')) {
      const e = power()
      return tk.v === '-' ? { k: 'neg', a: e } : e
    }
    throw new Error('unexpected token')
  }
  function power() {
    const base = primary()
    if (peek()?.t === 'op' && peek().v === '^') {
      take()
      const exp = unary()
      return { k: 'op', o: '^', a: base, b: exp }
    }
    return base
  }
  function unary() {
    if (peek()?.t === 'op' && (peek().v === '-' || peek().v === '+')) {
      const op = take().v
      const e = unary()
      return op === '-' ? { k: 'neg', a: e } : e
    }
    return power()
  }
  const PREC = { '+': 1, '-': 1, '*': 2, '/': 2 }
  function expr(min) {
    let left = unary()
    while (peek()?.t === 'op' && PREC[peek().v] >= min && peek().v !== '^') {
      const op = take().v
      const right = expr(PREC[op] + 1)
      left = { k: 'op', o: op, a: left, b: right }
    }
    return left
  }
  const tree = expr(0)
  if (p !== tokens.length) throw new Error('trailing input')
  return tree
}

function evaluate(n, env) {
  switch (n.k) {
    case 'num': return n.v
    case 'var': return env[n.v] ?? NaN
    case 'neg': return -evaluate(n.a, env)
    case 'fn': return FUNCS[n.f](evaluate(n.a, env))
    case 'op': {
      const a = evaluate(n.a, env), b = evaluate(n.b, env)
      return n.o === '+' ? a + b : n.o === '-' ? a - b : n.o === '*' ? a * b : n.o === '/' ? a / b : Math.pow(a, b)
    }
  }
  return NaN
}

function vars(n, set = new Set()) {
  if (!n) return set
  if (n.k === 'var') set.add(n.v)
  vars(n.a, set); vars(n.b, set)
  return set
}

/** Parse a typed expression; returns null when it cannot be read. */
function compile(src) {
  try {
    let s = normalise(src)
    // "y = 2x + 1": compare the right-hand side.
    if (s.includes('=')) s = s.split('=').pop()
    if (!s) return null
    return parse(tokenize(s))
  } catch { return null }
}

/** The numeric value of a constant expression ("1/3", "2π", "3.5×10^-4"), or NaN. */
function numericValue(src) {
  const t = compile(src)
  if (!t || vars(t).size) return NaN
  return evaluate(t, {})
}

const close = (a, b, tol) => {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false
  const scale = Math.max(1, Math.abs(a), Math.abs(b))
  return Math.abs(a - b) <= (tol != null ? tol : 1e-9 * scale)
}

/**
 * Do two expressions have the same value everywhere we look?
 * Variables get eight sets of random values; points where both sides
 * are undefined (√ of a negative, division by zero) are skipped.
 */
function equivalent(student, answer) {
  const ts = compile(student), ta = compile(answer)
  if (!ts || !ta) return false
  const names = [...new Set([...vars(ts), ...vars(ta)])]
  let compared = 0
  // Deterministic pseudo-random points, so a mark never flips on re-run.
  let seed = 1234567
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  for (let k = 0; k < 8; k++) {
    const env = {}
    for (const v of names) env[v] = 0.5 + rnd() * 2.5
    const a = evaluate(ts, env), b = evaluate(ta, env)
    if (!Number.isFinite(a) && !Number.isFinite(b)) continue
    if (!close(a, b, 1e-7 * Math.max(1, Math.abs(b)))) return false
    compared++
  }
  return compared > 0
}

module.exports = { compile, evaluate, numericValue, equivalent, close }
