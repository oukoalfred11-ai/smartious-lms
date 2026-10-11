/**
 * answerTypes.js — the answer formats a question can ask for.
 * ============================================================
 *   mcq        one option                       correctAnswer: index (or option text, older rows)
 *   multi      select ALL that apply             correctAnswer: [indices]
 *   truefalse  True / False                      correctAnswer: true | false
 *   numeric    a number, optionally with unit    correctAnswer: number, tolerance (±), unit
 *   math       an expression, marked by value    correctAnswer: "2(x+1)"
 *   fillblank  blanks typed in the text          text: "Water boils at [[100|one hundred]] °C"
 *   matching   pair each left with a right       pairs: [{ left, right }]
 *   ordering   put items in order                options: items in the CORRECT order
 *   short, long, essay, drawing, handwriting, upload — written, teacher-marked
 *
 * The same rules apply to a whole question and to every nested part.
 * Objective types are auto-marked on submission as a suggestion; the
 * teacher's marking screen shows it pre-filled and can change it.
 */
const { numericValue, equivalent, close } = require('./mathExpr')

const OBJECTIVE = new Set(['mcq', 'multi', 'truefalse', 'numeric', 'math', 'fillblank', 'matching', 'ordering'])
const ALL_TYPES = ['mcq', 'multi', 'truefalse', 'numeric', 'math', 'fillblank', 'matching', 'ordering',
  'short', 'long', 'essay', 'drawing', 'handwriting', 'upload']

// ── Fill in the blanks ─────────────────────────────────────────
const BLANK = /\[\[([^\]]*)\]\]/g
/** Accepted answers for each blank: "[[100|one hundred]]" → [['100','one hundred']]. */
function blankAnswers(text) {
  return [...String(text || '').matchAll(BLANK)].map(m => m[1].split('|').map(s => s.trim()).filter(Boolean))
}
/** The text a student sees: answers removed, blanks kept. */
const hideBlanks = (text) => String(text || '').replace(BLANK, '[[]]')

// ── Deterministic shuffle (same order every time for a given seed) ──
function shuffled(list, seedText) {
  const out = list.slice()
  let h = 2166136261
  for (const c of String(seedText)) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0
  const rnd = () => { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0; return (h >>> 0) / 4294967296 }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  // Never hand out the answer: if the shuffle left it in order, rotate.
  if (out.length > 1 && out.every((v, i) => v === list[i])) out.push(out.shift())
  return out
}

/**
 * What a student may see of a question or part while sitting it.
 * Removes every answer field; shuffles where the order IS the answer.
 */
function studentView(node, seed = '') {
  if (!node || typeof node !== 'object') return node
  const { correctAnswer, markScheme, explanation, tolerance, pairs, ...rest } = node
  const out = { ...rest }
  const key = seed + '|' + (node._id || '') + '|' + (node.text || node.questionText || '').slice(0, 40)
  if (out.questionText) out.questionText = hideBlanks(out.questionText)
  if (out.text) out.text = hideBlanks(out.text)
  if (node.type === 'matching') {
    const list = Array.isArray(pairs) ? pairs : []
    out.matchLeft = list.map(p => p.left)
    out.matchRight = shuffled(list.map(p => p.right), key)
  }
  if (node.type === 'ordering' && Array.isArray(node.options)) out.options = shuffled(node.options, key)
  out.parts = Array.isArray(node.parts) ? node.parts.map((p, i) => studentView(p, seed + '.' + i)) : []
  return out
}

// ── Marking ────────────────────────────────────────────────────
const norm = (s) => String(s ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase()
const parseData = (a) => {
  if (a == null) return null
  if (typeof a !== 'string') return a
  try { return JSON.parse(a) } catch { return a }
}
// Partial credit rounds to the nearest half mark.
const share = (marks, ratio) => Math.round(Math.max(0, Math.min(1, ratio)) * marks * 2) / 2

/** The number at the start of an answer like "12.5 m", "−3", "1/3", "3.5×10^-4 J". */
function readNumber(raw, unit) {
  let s = String(raw ?? '').trim()
  if (unit) s = s.split(unit).join(' ')
  let v = numericValue(s)
  if (Number.isFinite(v)) return v
  const m = s.replace(/[−–]/g, '-').match(/^[-+]?(?:\d[\d,]*\.?\d*|\.\d+)(?:\s*(?:e|[×x*]\s*10\s*\^)\s*[-+]?\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)?/i)
  if (m) v = numericValue(m[0])
  return v
}

const correctIndex = (node) => {
  const c = node.correctAnswer
  if (typeof c === 'number') return c
  if (typeof c === 'string' && /^\d+$/.test(c.trim()) && !(node.options || []).includes(c)) return Number(c)
  const i = (node.options || []).indexOf(c)
  return i >= 0 ? i : -1
}

/**
 * Suggested mark for one answer to one leaf question/part.
 * Returns { marks, isCorrect } for objective types, null otherwise
 * (or when no answer key is set — then the teacher marks it).
 */
function autoMark(node, answer) {
  if (!node || !OBJECTIVE.has(node.type)) return null
  const marks = Number(node.marks) || 1
  const data = parseData(answer.answerData)
  const text = answer.answerText || ''
  const result = (ratio) => ({ marks: share(marks, ratio), isCorrect: ratio >= 1 })

  switch (node.type) {
    case 'mcq': {
      const ci = correctIndex(node)
      if (ci < 0) return null
      const picked = answer.selectedOption || text
      return result(norm(picked) === norm(node.options[ci]) ? 1 : 0)
    }
    case 'multi': {
      const key = (Array.isArray(node.correctAnswer) ? node.correctAnswer : [])
        .map(c => (typeof c === 'number' ? node.options[c] : c)).filter(v => v != null).map(norm)
      if (!key.length) return null
      const chosen = new Set((Array.isArray(data) ? data : []).map(norm))
      const right = key.filter(k => chosen.has(k)).length
      const wrong = [...chosen].filter(c => !key.includes(c)).length
      return result((right - wrong) / key.length)
    }
    case 'truefalse': {
      if (node.correctAnswer == null || node.correctAnswer === '') return null
      const want = String(node.correctAnswer).toLowerCase() === 'true'
      const got = norm(answer.selectedOption || text)
      if (got !== 'true' && got !== 'false') return result(0)
      return result((got === 'true') === want ? 1 : 0)
    }
    case 'numeric': {
      const want = numericValue(String(node.correctAnswer ?? ''))
      if (!Number.isFinite(want)) return null
      const got = readNumber(text, node.unit)
      const tol = Number(node.tolerance)
      return result(close(got, want, Number.isFinite(tol) && tol > 0 ? tol : undefined) ? 1 : 0)
    }
    case 'math': {
      if (!node.correctAnswer) return null
      return result(equivalent(text, String(node.correctAnswer)) ? 1 : 0)
    }
    case 'fillblank': {
      const key = blankAnswers(node.text || node.questionText)
      if (!key.length) return null
      const got = Array.isArray(data) ? data : []
      const right = key.filter((alts, i) => {
        const g = got[i]
        if (g == null || String(g).trim() === '') return false
        if (alts.some(a => norm(a) === norm(g))) return true
        // Numbers compare by value: "100.0" = "100".
        const gv = readNumber(g), av = alts.map(a => readNumber(a))
        return Number.isFinite(gv) && av.some(v => close(gv, v))
      }).length
      return result(right / key.length)
    }
    case 'matching': {
      const pairs = Array.isArray(node.pairs) ? node.pairs : []
      if (!pairs.length) return null
      const got = Array.isArray(data) ? data : []
      const right = pairs.filter((p, i) => norm(got[i]) === norm(p.right)).length
      return result(right / pairs.length)
    }
    case 'ordering': {
      const items = node.options || []
      if (items.length < 2) return null
      const got = Array.isArray(data) ? data : []
      if (got.length !== items.length) return result(0)
      const right = items.filter((it, i) => norm(got[i]) === norm(it)).length
      return result(right / items.length)
    }
  }
  return null
}

/** One-line, human-readable form of a structured answer (for answerText). */
function summarise(type, data, node = {}) {
  const d = parseData(data)
  if (!Array.isArray(d)) return ''
  if (type === 'multi') return d.join('; ')
  if (type === 'fillblank') return d.map((v, i) => `(${i + 1}) ${v || '—'}`).join('   ')
  if (type === 'matching') return (node.matchLeft || node.pairs?.map(p => p.left) || d.map((_, i) => i + 1))
    .map((l, i) => `${l} → ${d[i] || '—'}`).join('; ')
  if (type === 'ordering') return d.map((v, i) => `${i + 1}. ${v}`).join('  ')
  return d.join(', ')
}

/** Find the leaf a stored answer belongs to: the question itself, or parts[path…]. */
function leafAt(question, partPath) {
  let node = question
  for (const i of partPath || []) {
    node = node?.parts?.[i]
    if (!node) return null
  }
  return node
}

const SUPS = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻', n: 'ⁿ' }
/** Keyboard maths made readable: x^2 → x², sqrt(2) → √(2), * → ×, pi → π. */
const prettyExpr = (s) => String(s || '')
  .replace(/\^\(?(-?[0-9n]+)\)?/g, (_, g) => [...g].map(c => SUPS[c] ?? c).join(''))
  .replace(/sqrt/g, '√').replace(/\bpi\b/g, 'π').replace(/\*/g, '×')

/** The answer key as text, for the mark scheme. */
function answerKeyText(node) {
  const L = (i) => String.fromCharCode(65 + i)
  switch (node.type) {
    case 'mcq': {
      const ci = correctIndex(node)
      return ci >= 0 ? `${L(ci)}  ${node.options[ci] ?? ''}` : ''
    }
    case 'multi': return (Array.isArray(node.correctAnswer) ? node.correctAnswer : [])
      .map(c => (typeof c === 'number' ? `${L(c)}  ${node.options[c] ?? ''}` : c)).join('; ')
    case 'truefalse': return node.correctAnswer == null || node.correctAnswer === '' ? '' : (String(node.correctAnswer).toLowerCase() === 'true' ? 'True' : 'False')
    case 'numeric': return node.correctAnswer == null || node.correctAnswer === '' ? '' :
      `${node.correctAnswer}${node.unit ? ' ' + node.unit : ''}${Number(node.tolerance) > 0 ? `  (accept ± ${node.tolerance})` : ''}`
    case 'math': return node.correctAnswer ? `${prettyExpr(node.correctAnswer)}  (or any equivalent form)` : ''
    case 'fillblank': return blankAnswers(node.text || node.questionText).map((a, i) => `(${i + 1}) ${a.join(' / ')}`).join('   ')
    case 'matching': return (node.pairs || []).map(p => `${p.left} → ${p.right}`).join('; ')
    case 'ordering': return (node.options || []).map((o, i) => `${i + 1}. ${o}`).join('   ')
  }
  return node.correctAnswer != null && typeof node.correctAnswer !== 'object' ? String(node.correctAnswer) : ''
}

module.exports = {
  OBJECTIVE, ALL_TYPES, BLANK, blankAnswers, hideBlanks, shuffled, studentView,
  autoMark, summarise, leafAt, answerKeyText, readNumber, prettyExpr,
}
