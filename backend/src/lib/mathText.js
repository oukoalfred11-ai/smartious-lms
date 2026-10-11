/**
 * mathText.js — LaTeX to readable Unicode, for PDFs.
 * ============================================================
 * Question text carries mathematics as $...$ LaTeX (the MathField
 * convention). Browsers render it with KaTeX; a PDF has no browser,
 * so the paper needs the mathematics as plain Unicode:
 *   $\frac{3}{4}$ -> 3/4,  $x^{2}$ -> x²,  $\sqrt{b^2-4ac}$ -> √(b²-4ac)
 *
 * This is a small brace-aware parser, not a pile of regexes: the old
 * regex version printed raw codes on real papers whenever braces
 * nested ($\frac{-b \pm \sqrt{…}}{2a}$ -> "\frac-b ± …"), when one
 * command was the prefix of another (\left -> "≤ft"), or for any
 * command it did not know (\vec{F} -> "\vecF"). Now commands are read
 * whole, arguments are parsed recursively, and an unknown command
 * prints its name, never its backslash.
 *
 * Also handled: $$…$$, \(…\), \[…\] delimiters; a $ used as money
 * ("costs $80, then $60") is left alone; HTML tags and entities pasted
 * from websites or Word are stripped and decoded.
 *
 * frontend/src/lib/mathText.js is the same code for the browser
 * fallback; keep the two in step.
 */

const GREEK = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η',
  theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο',
  pi: 'π', varpi: 'ϖ', rho: 'ρ', sigma: 'σ', varsigma: 'ς', tau: 'τ', upsilon: 'υ', phi: 'φ', varphi: 'φ',
  chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Upsilon: 'Υ',
  Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
}

const SYMBOLS = {
  ...GREEK,
  infty: '∞', pm: '±', mp: '∓', times: '×', div: '÷', cdot: '·', ast: '∗', star: '⋆', circ: '∘',
  approx: '≈', sim: '∼', simeq: '≃', cong: '≅', equiv: '≡', propto: '∝', neq: '≠', ne: '≠',
  leq: '≤', le: '≤', geq: '≥', ge: '≥', ll: '≪', gg: '≫', lt: '<', gt: '>',
  leqslant: '≤', geqslant: '≥',
  rightarrow: '→', to: '→', leftarrow: '←', gets: '←', leftrightarrow: '↔', Rightarrow: '⇒',
  Leftarrow: '⇐', Leftrightarrow: '⇔', implies: '⇒', iff: '⇔', mapsto: '↦', uparrow: '↑',
  downarrow: '↓', rightleftharpoons: '⇌', longrightarrow: '⟶', nearrow: '↗', searrow: '↘',
  sum: 'Σ', prod: 'Π', int: '∫', iint: '∬', oint: '∮', partial: '∂', nabla: '∇',
  forall: '∀', exists: '∃', neg: '¬', lnot: '¬', land: '∧', wedge: '∧', lor: '∨', vee: '∨', oplus: '⊕',
  in: '∈', notin: '∉', ni: '∋', subset: '⊂', subseteq: '⊆', supset: '⊃', supseteq: '⊇',
  cup: '∪', cap: '∩', emptyset: '∅', varnothing: '∅', setminus: '∖',
  angle: '∠', triangle: '△', perp: '⊥', parallel: '∥', degree: '°',
  therefore: '∴', because: '∵', ldots: '…', dots: '…', cdots: '⋯', vdots: '⋮', ddots: '⋱',
  prime: '′', ell: 'ℓ', hbar: 'ħ', langle: '⟨', rangle: '⟩', lfloor: '⌊', rfloor: '⌋',
  lceil: '⌈', rceil: '⌉', mid: '|', vert: '|', Vert: '‖', backslash: '\\',
  quad: '  ', qquad: '    ', colon: ':', surd: '√',
  // Function names print as words.
  sin: 'sin', cos: 'cos', tan: 'tan', sec: 'sec', csc: 'csc', cot: 'cot',
  arcsin: 'arcsin', arccos: 'arccos', arctan: 'arctan', sinh: 'sinh', cosh: 'cosh', tanh: 'tanh',
  log: 'log', ln: 'ln', lg: 'lg', exp: 'exp', lim: 'lim', max: 'max', min: 'min', sup: 'sup', inf: 'inf',
  det: 'det', gcd: 'gcd', mod: 'mod', bmod: 'mod', pmod: 'mod', deg: 'deg', arg: 'arg', dim: 'dim',
}
// Commands that only size or space things: drop them, keep what follows.
const IGNORE = new Set([
  'left', 'right', 'middle', 'big', 'Big', 'bigg', 'Bigg', 'bigl', 'bigr', 'Bigl', 'Bigr',
  'biggl', 'biggr', 'displaystyle', 'textstyle', 'scriptstyle', 'limits', 'nolimits',
  'nonumber', 'notag', 'label', 'hline', 'cline',
])
// Commands whose one argument is printed as is.
const TEXTLIKE = new Set([
  'text', 'textrm', 'textbf', 'textit', 'textsf', 'texttt', 'mathrm', 'mathbf', 'mathit',
  'mathsf', 'mathtt', 'mathcal', 'mathscr', 'boldsymbol', 'bm', 'mbox', 'hbox', 'operatorname',
  'underline', 'emph', 'pmb', 'boxed', 'phantom',
])
const ACCENT = { vec: '⃗', hat: '̂', widehat: '̂', bar: '̅', overline: '̅', dot: '̇', tilde: '̃', widetilde: '̃' }
const ENV_BRACKETS = { pmatrix: ['(', ')'], bmatrix: ['[', ']'], Bmatrix: ['{', '}'], vmatrix: ['|', '|'], Vmatrix: ['‖', '‖'], cases: ['{ ', ''] }
const BLACKBOARD = { R: 'ℝ', N: 'ℕ', Z: 'ℤ', Q: 'ℚ', C: 'ℂ', P: 'ℙ' }
const ESCAPED = { '%': '%', $: '$', '&': '&', '#': '#', _: '_', '{': '{', '}': '}', ',': ' ', ';': ' ', ':': ' ', ' ': ' ', '!': '', '\\': '\n' }

const SUP = {
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '-': '⁻', '−': '⁻',
  '=': '⁼', '(': '⁽', ')': '⁾', a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ', j: 'ʲ',
  k: 'ᵏ', l: 'ˡ', m: 'ᵐ', n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ',
  y: 'ʸ', z: 'ᶻ', '°': '°', '∘': '°', '′': '′', '*': '*', T: 'ᵀ', ' ': '',
}
const SUB = {
  0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', '+': '₊', '-': '₋', '−': '₋',
  '=': '₌', '(': '₍', ')': '₎', a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ',
  p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ', ' ': '',
}

// A result that reads unambiguously without brackets: x, 12, 3.5, π.
const atomic = (s) => /^[\p{L}\p{N}.′]+$/u.test(s) || s.length <= 1
const wrap = (s) => (atomic(s) ? s : `(${s})`)
const script = (s, map, mark) => {
  const chars = [...s]
  if (chars.every(c => map[c] !== undefined)) return chars.map(c => map[c]).join('')
  return chars.length > 1 ? `${mark}(${s})` : `${mark}${s}`
}

function plainMath(tex) {
  const src = String(tex)
  let i = 0

  const skipSpace = () => { while (i < src.length && /\s/.test(src[i])) i++ }

  // One argument: a {group}, a \command, or a single character.
  function arg() {
    skipSpace()
    if (i >= src.length) return ''
    if (src[i] === '{') { i++; const s = seq('}'); i++; return s }
    if (src[i] === '\\') return command()
    return src[i++]
  }
  function optArg() {
    skipSpace()
    if (src[i] !== '[') return null
    i++
    const s = seq(']')
    i++
    return s
  }

  function command() {
    i++ // backslash
    if (i >= src.length) return ''
    if (!/[A-Za-z]/.test(src[i])) { const c = src[i++]; return ESCAPED[c] ?? c }
    let name = ''
    while (i < src.length && /[A-Za-z]/.test(src[i])) name += src[i++]

    if (name === 'frac' || name === 'dfrac' || name === 'tfrac' || name === 'cfrac') {
      const a = arg(), b = arg()
      return `${wrap(a)}/${wrap(b)}`
    }
    if (name === 'binom' || name === 'dbinom') { const a = arg(), b = arg(); return `C(${a}, ${b})` }
    if (name === 'sqrt') {
      const n = optArg(), x = arg()
      const root = n == null ? '√' : n === '3' ? '∛' : n === '4' ? '∜' : `${script(n, SUP, '')}√`
      return root + wrap(x)
    }
    if (TEXTLIKE.has(name)) return arg()
    if (name === 'mathbb') { const a = arg(); return BLACKBOARD[a] || a }
    if (ACCENT[name]) {
      const a = arg()
      return [...a].length === 1 ? a + ACCENT[name] : `${name === 'vec' ? 'vec' : name}(${a})`
    }
    if (name === 'begin' || name === 'end') {
      const env = arg()
      const [open, close] = ENV_BRACKETS[env] || ['', '']
      return name === 'begin' ? open : close
    }
    if (IGNORE.has(name)) { if (name === 'label') arg(); return '' }
    if (name === 'not') { const a = arg(); return a === '=' ? '≠' : a === '∈' ? '∉' : a + '̸' }
    if (name === 'overset' || name === 'stackrel') { const top = arg(); const base = arg(); return `${base}${top ? '^' + top : ''}` }
    if (name === 'pmod') return `(mod ${arg()})`
    if (name in SYMBOLS) {
      const s = SYMBOLS[name]
      // Function names need a space before a following letter: \sin x.
      return /^[a-z]{2,}$/.test(s) && /^[ ]*[A-Za-z0-9\\(]/.test(src.slice(i)) ? s + ' ' : s
    }
    return name // unknown: readable name, never a raw backslash code
  }

  // Parse until `end` (a closing brace or bracket) or the end of input.
  function seq(end) {
    let out = ''
    while (i < src.length && src[i] !== end) {
      const c = src[i]
      if (c === '\\') out += command()
      else if (c === '{') { i++; out += seq('}'); i++ }
      else if (c === '}') i++ // stray closer
      else if (c === '^' || c === '_') {
        i++
        out += script(arg(), c === '^' ? SUP : SUB, c)
      } else if (c === '~') { out += ' '; i++ }
      else if (c === '&') { out += ' '; i++ }
      else { out += c; i++ }
    }
    return out
  }

  return seq(null)
    .replace(/[ \t]*\n[ \t]*/g, '; ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

// ── HTML pasted from websites or Word ───────────────────────────
const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", times: '×', divide: '÷', minus: '−', deg: '°', pi: 'π', le: '≤', ge: '≥', ne: '≠', plusmn: '±', sup2: '²', sup3: '³', frac12: '½', frac14: '¼', frac34: '¾', middot: '·', hellip: '…', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”' }
function stripHtml(text) {
  let s = String(text)
  if (!/[<&]/.test(s)) return s
  if (/<\/?[a-z][^>]*>/i.test(s)) {
    s = s.replace(/<sup>(.*?)<\/sup>/gi, (_, g) => script(g, SUP, '^'))
      .replace(/<sub>(.*?)<\/sub>/gi, (_, g) => script(g, SUB, '_'))
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/?[a-z][^>]*>/gi, '')
  }
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z0-9]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .replace(/\n{3,}/g, '\n\n')
}

/**
 * Find the maths in a string. Delimiters: $$…$$, \[…\], \(…\), $…$.
 * For single $ the pandoc rule tells maths from money: the opening $
 * is not followed by a space, the closing $ is not preceded by a space
 * and not followed by a digit. "$80, then $60" therefore stays text.
 */
function splitMath(text) {
  const s = String(text)
  const parts = []
  let buf = '', i = 0
  const flush = () => { if (buf) { parts.push({ math: false, text: buf }); buf = '' } }
  while (i < s.length) {
    const two = s.slice(i, i + 2)
    let close = null, open = 0
    if (two === '$$') { close = '$$'; open = 2 }
    else if (two === '\\[') { close = '\\]'; open = 2 }
    else if (two === '\\(') { close = '\\)'; open = 2 }
    else if (two === '\\$') { buf += '$'; i += 2; continue }
    else if (s[i] === '$' && s[i + 1] && !/\s/.test(s[i + 1])) {
      let j = i + 1
      while (j < s.length) {
        if (s[j] === '\\') { j += 2; continue }
        if (s[j] === '$' && !/\s/.test(s[j - 1]) && !/\d/.test(s[j + 1] || '')) break
        j++
      }
      if (j < s.length) {
        flush()
        parts.push({ math: true, text: s.slice(i + 1, j) })
        i = j + 1
        continue
      }
    }
    if (close) {
      const j = s.indexOf(close, i + open)
      if (j !== -1) {
        flush()
        parts.push({ math: true, text: s.slice(i + open, j), display: true })
        i = j + close.length
        continue
      }
    }
    buf += s[i++]
  }
  flush()
  return parts
}

/**
 * Keyboard maths typed without dollar signs (the admin bank's "plain
 * text" convention): x^2 → x², 10^-3 → 10⁻³, sqrt(50) → √(50).
 * Deliberately narrow so ordinary prose is never touched.
 */
function keyboardMath(text) {
  return String(text)
    .replace(/(\w|\))\^\(?(-?\d{1,3})\)?/g, (_, b, e) => b + [...e].map(c => SUP[c] || c).join(''))
    .replace(/\bsqrt\(([^()]{1,40})\)/g, '√($1)')
}

/** Convert every maths segment of a string; plain text gets keyboardMath. */
function mathToText(text) {
  if (!text) return text
  return splitMath(stripHtml(text)).map(p => (p.math ? plainMath(p.text) : keyboardMath(p.text))).join('')
}

/**
 * Paper-ready text: convert the mathematics AND strip inline mark
 * annotations that imported questions carry in their prose — the
 * paper prints authoritative [N] brackets itself, so "(3 marks)"
 * inside the sentence would show the marks twice.
 */
function cleanForPaper(text) {
  if (text == null || text === '') return text
  let s = mathToText(String(text))
  s = s.replace(/\(\s*\d+\s*marks?\s*\)\s*\.?/gi, '')
  s = s.replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+([.,;:])/g, '$1')
  return s.trim()
}

module.exports = { mathToText, plainMath, cleanForPaper, splitMath, stripHtml, keyboardMath }
