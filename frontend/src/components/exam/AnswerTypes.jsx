/**
 * AnswerTypes.jsx — the answer formats beyond written answers.
 * ============================================================
 *   multi      select all that apply        truefalse  True / False
 *   numeric    a number (± tolerance, unit)  math       an expression, marked by value
 *   fillblank  [[answer|alt]] blanks in text matching   pair left with right
 *   ordering   put items in order
 *
 * Two halves, one per audience:
 *   <AnswerKeyEditor>     teacher sets the answer key (bank form, nested parts)
 *   <StudentAnswerInput>  student answers (exams, homework)
 * The rules for marking live in backend/src/lib/answerTypes.js; the
 * shapes here must match it:
 *   multi/fillblank/matching/ordering → answerData: [strings]
 *   truefalse → selectedOption 'True'|'False';  numeric/math → answerText
 */
import { useMemo } from 'react'
import { renderMath } from '../ui/MathField.jsx'

const C = {
  crimson: '#7D1025', gold: '#C9A030', goldPale: '#FBF6E3', cream: '#FBFAF5',
  ink: '#1A1A1A', mute: '#6B6B6B', line: '#E8E2D6', white: '#FFFFFF', green: '#15803D',
}

export const NEW_TYPES = ['multi', 'truefalse', 'numeric', 'math', 'fillblank', 'matching', 'ordering']
export const OBJECTIVE_TYPES = ['mcq', ...NEW_TYPES]
export const ANSWER_TYPE_META = {
  mcq:         { label: 'Multiple choice',    color: '#1E3A8A', hint: 'One correct option' },
  multi:       { label: 'Select all',         color: '#0E7490', hint: 'Several correct options' },
  truefalse:   { label: 'True / False',       color: '#4D7C0F', hint: 'A statement to judge' },
  numeric:     { label: 'Numeric',            color: '#B45309', hint: 'A number, with tolerance and unit' },
  math:        { label: 'Maths expression',   color: '#9333EA', hint: 'Marked by value: 2(x+1) = 2x+2' },
  fillblank:   { label: 'Fill the blanks',    color: '#0369A1', hint: 'Type [[answer]] in the question' },
  matching:    { label: 'Matching',           color: '#BE185D', hint: 'Pair each item with its match' },
  ordering:    { label: 'Ordering',           color: '#4338CA', hint: 'Put steps or items in order' },
  short:       { label: 'Short answer',       color: '#166534', hint: 'A few words or a line' },
  long:        { label: 'Long answer',        color: '#7E22CE', hint: 'Paragraphs, teacher-marked' },
  drawing:     { label: 'Drawing',            color: '#DC2626', hint: 'Sketch on a canvas' },
  handwriting: { label: 'Handwriting',        color: '#0F1933', hint: 'Write by hand, multi-page' },
  upload:      { label: 'File upload',        color: '#7D1025', hint: 'Photo or file of working' },
}

// ── Fill in the blanks ─────────────────────────────────────────
const BLANK = /\[\[([^\]]*)\]\]/g
export const blankAnswers = (text) =>
  [...String(text || '').matchAll(BLANK)].map(m => m[1].split('|').map(s => s.trim()).filter(Boolean))
export const countBlanks = (text) => (String(text || '').match(BLANK) || []).length
/** Question text as a reader sees it: every [[…]] becomes a numbered gap. */
export const showBlanks = (text) => {
  let n = 0
  return String(text || '').replace(BLANK, () => ` ____(${++n})____ `)
}

/** One-line readable answer, stored as answerText alongside answerData. */
export function answerSummary(type, data, part = {}) {
  if (!Array.isArray(data)) return ''
  if (type === 'multi') return data.join('; ')
  if (type === 'fillblank') return data.map((v, i) => `(${i + 1}) ${v || '—'}`).join('   ')
  if (type === 'matching') return (part.matchLeft || (part.pairs || []).map(p => p.left))
    .map((l, i) => `${l} → ${data[i] || '—'}`).join('; ')
  if (type === 'ordering') return data.map((v, i) => `${i + 1}. ${v}`).join('  ')
  return data.join(', ')
}

/** Has the student given an answer of this type? */
export function isAnswered(type, v) {
  if (!v) return false
  if (['multi', 'fillblank', 'matching', 'ordering'].includes(type))
    return Array.isArray(v.answerData) && v.answerData.some(x => String(x ?? '').trim())
  return !!((v.answerText && String(v.answerText).trim()) || v.selectedOption)
}

// ── Shared bits ────────────────────────────────────────────────
const box = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', background: C.white, border: `1.5px solid ${C.line}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', color: C.ink, outline: 'none' }
const label = { fontSize: 10.5, fontWeight: 700, color: C.mute, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }
const smallBtn = { padding: '5px 10px', background: C.white, border: `1px dashed ${C.crimson}`, color: C.crimson, borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }
const iconBtn = (disabled) => ({ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.line}`, background: C.white, color: disabled ? '#C8C2BA' : C.crimson, fontSize: 15, cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 })
const M = ({ children }) => <>{renderMath(String(children ?? ''))}</>

// Make keyboard maths readable while typing: x^2 → x², sqrt(2) → √(2), * → ×.
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻', n: 'ⁿ' }
export const prettyMath = (s) => String(s || '')
  .replace(/\^\(?(-?[0-9n]+)\)?/g, (_, g) => [...g].map(c => SUP[c] ?? c).join(''))
  .replace(/sqrt/g, '√').replace(/\bpi\b/g, 'π').replace(/\*/g, '×').replace(/\//g, '∕')

// ══════════════════════════════════════════════════════════════
// STUDENT
// ══════════════════════════════════════════════════════════════
/**
 * value: { answerText, answerData, selectedOption }
 * onChange(patch) merges into value.
 */
export function StudentAnswerInput({ part, value, onChange, readOnly = false }) {
  const v = value || {}
  const type = part.type
  const set = (patch) => !readOnly && onChange(patch)
  const setData = (data) => set({ answerData: data, answerText: answerSummary(type, data, part) })

  if (type === 'multi') {
    const chosen = new Set(Array.isArray(v.answerData) ? v.answerData : [])
    return (
      <div>
        <div style={{ ...label, color: C.crimson }}>Select all that apply</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(part.options || []).map((opt, i) => {
            const on = chosen.has(opt)
            return (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: readOnly ? 'default' : 'pointer', background: on ? '#FBE8E8' : C.cream, border: `1.5px solid ${on ? C.crimson : C.line}`, fontSize: 13.5 }}>
                <input type="checkbox" checked={on} disabled={readOnly} style={{ accentColor: C.crimson, width: 17, height: 17 }}
                  onChange={() => {
                    const next = new Set(chosen)
                    on ? next.delete(opt) : next.add(opt)
                    // Keep the options' own order so the saved answer reads naturally.
                    setData((part.options || []).filter(o => next.has(o)))
                  }} />
                <span style={{ fontFamily: 'JetBrains Mono,monospace', color: C.mute, fontSize: 11 }}>{String.fromCharCode(65 + i)}.</span>
                <span><M>{opt}</M></span>
              </label>
            )
          })}
        </div>
      </div>
    )
  }

  if (type === 'truefalse') {
    return (
      <div style={{ display: 'flex', gap: 10 }}>
        {['True', 'False'].map(o => {
          const on = v.selectedOption === o
          return (
            <button key={o} type="button" disabled={readOnly} onClick={() => set({ selectedOption: o, answerText: o })}
              style={{ flex: 1, maxWidth: 180, padding: '12px 10px', borderRadius: 10, cursor: readOnly ? 'default' : 'pointer', fontSize: 14, fontWeight: 700, border: `2px solid ${on ? C.crimson : C.line}`, background: on ? C.crimson : C.white, color: on ? C.white : C.ink, transition: 'all .15s' }}>
              {o === 'True' ? '✓  True' : '✕  False'}
            </button>
          )
        })}
      </div>
    )
  }

  if (type === 'numeric') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <input type="text" inputMode="decimal" value={v.answerText || ''} readOnly={readOnly}
          onChange={e => set({ answerText: e.target.value })}
          placeholder="Your answer, e.g. 12.5" style={{ ...box, width: 200, fontFamily: 'JetBrains Mono,monospace', fontSize: 15 }} />
        {part.unit && <span style={{ fontSize: 14, fontWeight: 600, color: C.mute }}><M>{part.unit}</M></span>}
        {!readOnly && <span style={{ fontSize: 11.5, color: C.mute, width: '100%' }}>Numbers only. Fractions like 1/3 and powers like 3.5×10^-4 are fine.</span>}
      </div>
    )
  }

  if (type === 'math') return <MathAnswer value={v.answerText || ''} onChange={t => set({ answerText: t })} readOnly={readOnly} />

  if (type === 'fillblank') {
    const n = countBlanks(part.text || part.questionText) || 1
    const data = Array.isArray(v.answerData) ? v.answerData : []
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        {Array.from({ length: n }, (_, i) => (
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ minWidth: 34, textAlign: 'center', padding: '4px 0', borderRadius: 6, background: C.goldPale, color: C.crimson, fontWeight: 800, fontSize: 12, fontFamily: 'JetBrains Mono,monospace' }}>({i + 1})</span>
            <input value={data[i] || ''} readOnly={readOnly} placeholder={`Blank ${i + 1}`} style={{ ...box, maxWidth: 360 }}
              onChange={e => { const next = Array.from({ length: n }, (_, k) => data[k] || ''); next[i] = e.target.value; setData(next) }} />
          </label>
        ))}
      </div>
    )
  }

  if (type === 'matching') {
    const left = part.matchLeft || (part.pairs || []).map(p => p.left)
    const right = part.matchRight || (part.pairs || []).map(p => p.right)
    const data = Array.isArray(v.answerData) ? v.answerData : []
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        {left.map((l, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 22px minmax(0,1fr)', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: '9px 12px', background: C.cream, border: `1.5px solid ${C.line}`, borderRadius: 8, fontSize: 13.5 }}><M>{l}</M></div>
            <span style={{ textAlign: 'center', color: C.gold, fontWeight: 800 }}>→</span>
            <select value={data[i] || ''} disabled={readOnly} style={{ ...box, cursor: readOnly ? 'default' : 'pointer', borderColor: data[i] ? C.crimson : C.line }}
              onChange={e => { const next = left.map((_, k) => data[k] || ''); next[i] = e.target.value; setData(next) }}>
              <option value="">Choose…</option>
              {right.map((r, k) => <option key={k} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'ordering') {
    const items = Array.isArray(v.answerData) && v.answerData.length ? v.answerData : (part.options || [])
    const move = (i, d) => {
      const j = i + d
      if (j < 0 || j >= items.length) return
      const next = items.slice();
      [next[i], next[j]] = [next[j], next[i]]
      setData(next)
    }
    const touched = Array.isArray(v.answerData) && v.answerData.length
    return (
      <div>
        <div style={label}>Arrange from first to last{!touched && !readOnly ? ' — use the arrows' : ''}</div>
        <div style={{ display: 'grid', gap: 6 }}>
          {items.map((it, i) => (
            <div key={it + i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px 6px 12px', background: C.white, border: `1.5px solid ${touched ? C.crimson + '55' : C.line}`, borderRadius: 10 }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: C.crimson, color: C.white, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 13.5 }}><M>{it}</M></span>
              {!readOnly && <>
                <button type="button" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0} style={iconBtn(i === 0)}>↑</button>
                <button type="button" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1} style={iconBtn(i === items.length - 1)}>↓</button>
              </>}
            </div>
          ))}
        </div>
        {!touched && !readOnly && items.length > 0 && (
          <button type="button" onClick={() => setData(items.slice())} style={{ ...smallBtn, marginTop: 8 }}>This order is my answer</button>
        )}
      </div>
    )
  }
  return null
}

const KEYS = [
  ['x²', '^2'], ['xⁿ', '^'], ['√', 'sqrt('], ['π', 'π'], ['(', '('], [')', ')'],
  ['×', '*'], ['÷', '/'], ['−', '-'], ['+', '+'], ['x', 'x'], ['y', 'y'],
]
function MathAnswer({ value, onChange, readOnly }) {
  const id = useMemo(() => 'm' + Math.random().toString(36).slice(2), [])
  const insert = (s) => {
    const el = document.getElementById(id)
    const at = el ? el.selectionStart : value.length
    const end = el ? el.selectionEnd : value.length
    const next = value.slice(0, at) + s + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => { if (el) { el.focus(); el.setSelectionRange(at + s.length, at + s.length) } })
  }
  return (
    <div>
      <input id={id} value={value} readOnly={readOnly} onChange={e => onChange(e.target.value)}
        placeholder="e.g. 2(x+1)  or  x^2 - 4  or  sqrt(3)/2" autoComplete="off" spellCheck={false}
        style={{ ...box, fontFamily: 'JetBrains Mono,monospace', fontSize: 15 }} />
      {!readOnly && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {KEYS.map(([k, s]) => (
            <button key={k} type="button" onMouseDown={e => e.preventDefault()} onClick={() => insert(s)}
              style={{ minWidth: 40, height: 36, padding: '0 10px', borderRadius: 8, border: `1px solid ${C.line}`, background: C.cream, color: C.ink, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>{k}</button>
          ))}
        </div>
      )}
      {value && (
        <div style={{ marginTop: 8, fontSize: 13, color: C.mute }}>
          Reads as: <span style={{ fontSize: 16, color: C.ink, fontFamily: "'Cambria Math','STIX Two Math',Georgia,serif" }}>{prettyMath(value)}</span>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// TEACHER — the answer key
// ══════════════════════════════════════════════════════════════
/**
 * q: the question or part ({ type, text|questionText, options, correctAnswer, tolerance, unit, pairs })
 * onChange(patch): merge into it.
 * For mcq the existing option editors stay in place; this covers the new types.
 */
export function AnswerKeyEditor({ q, onChange }) {
  const type = q.type
  const options = Array.isArray(q.options) ? q.options : []
  const setOptions = (opts, extra = {}) => onChange({ options: opts, ...extra })

  if (type === 'multi') {
    const key = new Set(Array.isArray(q.correctAnswer) ? q.correctAnswer : [])
    const list = options.length ? options : ['', '', '', '']
    return (
      <div>
        <div style={label}>Options — tick every correct one ({key.size} correct)</div>
        {list.map((opt, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={key.has(i)} style={{ accentColor: C.green, width: 18, height: 18 }}
              onChange={() => { const k = new Set(key); k.has(i) ? k.delete(i) : k.add(i); onChange({ options: list, correctAnswer: [...k].sort((a, b) => a - b) }) }} />
            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: C.mute }}>{String.fromCharCode(65 + i)}</span>
            <input value={opt} placeholder={`Option ${String.fromCharCode(65 + i)}`} style={box}
              onChange={e => { const n = list.slice(); n[i] = e.target.value; setOptions(n) }} />
            {list.length > 2 && <button type="button" style={iconBtn(false)} onClick={() => {
              const n = list.filter((_, k) => k !== i)
              const ck = [...key].filter(k => k !== i).map(k => (k > i ? k - 1 : k))
              onChange({ options: n, correctAnswer: ck })
            }}>×</button>}
          </div>
        ))}
        <button type="button" style={smallBtn} onClick={() => setOptions([...list, ''])}>+ Add option</button>
        <div style={{ fontSize: 11.5, color: C.mute, marginTop: 6 }}>Partial credit: each right tick earns its share, each wrong tick takes one away.</div>
      </div>
    )
  }

  if (type === 'truefalse') {
    const v = q.correctAnswer == null || q.correctAnswer === '' ? null : String(q.correctAnswer).toLowerCase() === 'true'
    return (
      <div>
        <div style={label}>The statement is…</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[true, false].map(b => (
            <button key={String(b)} type="button" onClick={() => onChange({ correctAnswer: b })}
              style={{ padding: '9px 22px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', border: `2px solid ${v === b ? C.green : C.line}`, background: v === b ? C.green : C.white, color: v === b ? C.white : C.ink }}>
              {b ? 'True' : 'False'}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'numeric') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        <div><div style={label}>Correct answer</div>
          <input value={q.correctAnswer ?? ''} placeholder="e.g. 9.81 or 1/3" style={{ ...box, fontFamily: 'JetBrains Mono,monospace' }}
            onChange={e => onChange({ correctAnswer: e.target.value })} /></div>
        <div><div style={label}>Accept ± (tolerance)</div>
          <input type="number" step="any" min="0" value={q.tolerance ?? ''} placeholder="e.g. 0.05" style={box}
            onChange={e => onChange({ tolerance: e.target.value === '' ? null : Number(e.target.value) })} /></div>
        <div><div style={label}>Unit (shown to student)</div>
          <input value={q.unit || ''} placeholder="e.g. m/s, cm², kg" style={box}
            onChange={e => onChange({ unit: e.target.value })} /></div>
      </div>
    )
  }

  if (type === 'math') {
    return (
      <div>
        <div style={label}>Correct expression</div>
        <input value={q.correctAnswer || ''} placeholder="e.g. 2(x+1)" spellCheck={false}
          style={{ ...box, fontFamily: 'JetBrains Mono,monospace' }} onChange={e => onChange({ correctAnswer: e.target.value })} />
        <div style={{ fontSize: 11.5, color: C.mute, marginTop: 6 }}>
          Any equivalent form is marked right: 2(x+1), 2x+2 and 2+2x all match. Use x^2, sqrt(…), pi.
          {q.correctAnswer ? <> Reads as <b style={{ color: C.ink }}>{prettyMath(q.correctAnswer)}</b>.</> : null}
        </div>
      </div>
    )
  }

  if (type === 'fillblank') {
    const blanks = blankAnswers(q.text ?? q.questionText)
    return (
      <div style={{ background: C.goldPale, border: `1px solid ${C.gold}66`, borderRadius: 8, padding: '10px 12px', fontSize: 12.5, lineHeight: 1.6 }}>
        Type each blank into the question text inside double square brackets, with any other accepted answers after a bar:
        <div style={{ fontFamily: 'JetBrains Mono,monospace', margin: '6px 0', color: C.crimson }}>Water boils at [[100]] °C at sea level, which is [[373|373.15]] K.</div>
        {blanks.length
          ? <div><b>{blanks.length} blank{blanks.length === 1 ? '' : 's'} found:</b> {blanks.map((a, i) => `(${i + 1}) ${a.join(' / ')}`).join('   ')}</div>
          : <div style={{ color: '#B45309', fontWeight: 600 }}>No blanks yet — add [[answer]] to the question text.</div>}
      </div>
    )
  }

  if (type === 'matching') {
    const pairs = Array.isArray(q.pairs) && q.pairs.length ? q.pairs : [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }]
    const setPairs = (p) => onChange({ pairs: p })
    return (
      <div>
        <div style={label}>Pairs — students see the right-hand side shuffled</div>
        {pairs.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 18px minmax(0,1fr) 34px', gap: 6, alignItems: 'center', marginBottom: 6 }}>
            <input value={p.left} placeholder={`Item ${i + 1}`} style={box} onChange={e => setPairs(pairs.map((x, k) => (k === i ? { ...x, left: e.target.value } : x)))} />
            <span style={{ textAlign: 'center', color: C.gold, fontWeight: 800 }}>→</span>
            <input value={p.right} placeholder="Its match" style={box} onChange={e => setPairs(pairs.map((x, k) => (k === i ? { ...x, right: e.target.value } : x)))} />
            <button type="button" style={iconBtn(pairs.length <= 2)} disabled={pairs.length <= 2} onClick={() => setPairs(pairs.filter((_, k) => k !== i))}>×</button>
          </div>
        ))}
        <button type="button" style={smallBtn} onClick={() => setPairs([...pairs, { left: '', right: '' }])}>+ Add pair</button>
      </div>
    )
  }

  if (type === 'ordering') {
    const list = options.length ? options : ['', '', '']
    const move = (i, d) => { const j = i + d; if (j < 0 || j >= list.length) return; const n = list.slice(); [n[i], n[j]] = [n[j], n[i]]; setOptions(n) }
    return (
      <div>
        <div style={label}>Items in the CORRECT order — students get them shuffled</div>
        {list.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: C.crimson, color: C.white, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
            <input value={it} placeholder={`Step ${i + 1}`} style={box} onChange={e => { const n = list.slice(); n[i] = e.target.value; setOptions(n) }} />
            <button type="button" style={iconBtn(i === 0)} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
            <button type="button" style={iconBtn(i === list.length - 1)} disabled={i === list.length - 1} onClick={() => move(i, 1)}>↓</button>
            {list.length > 2 && <button type="button" style={iconBtn(false)} onClick={() => setOptions(list.filter((_, k) => k !== i))}>×</button>}
          </div>
        ))}
        <button type="button" style={smallBtn} onClick={() => setOptions([...list, ''])}>+ Add item</button>
      </div>
    )
  }
  return null
}

/** Problem with an answer key, or null when it is complete. */
export function answerKeyProblem(q) {
  const type = q.type
  const text = q.text ?? q.questionText
  const filled = (q.options || []).filter(o => String(o).trim())
  if (type === 'multi') {
    if (filled.length < 2) return 'Select-all needs at least 2 options'
    if (!Array.isArray(q.correctAnswer) || !q.correctAnswer.length) return 'Tick at least one correct option'
  }
  if (type === 'truefalse' && (q.correctAnswer == null || q.correctAnswer === '')) return 'Choose whether the statement is True or False'
  if (type === 'numeric' && (q.correctAnswer == null || String(q.correctAnswer).trim() === '')) return 'Enter the correct number'
  if (type === 'math' && !String(q.correctAnswer || '').trim()) return 'Enter the correct expression'
  if (type === 'fillblank' && !countBlanks(text)) return 'Add at least one [[blank]] to the question text'
  if (type === 'matching' && (q.pairs || []).filter(p => p.left.trim() && p.right.trim()).length < 2) return 'Matching needs at least 2 complete pairs'
  if (type === 'ordering' && filled.length < 2) return 'Ordering needs at least 2 items'
  return null
}

/** Strip empty rows before saving. */
export function cleanAnswerKey(q) {
  const out = {}
  if (q.type === 'multi') {
    const list = q.options || []
    const keep = list.map((o, i) => [o, i]).filter(([o]) => String(o).trim())
    out.options = keep.map(([o]) => o)
    const key = new Set(Array.isArray(q.correctAnswer) ? q.correctAnswer : [])
    out.correctAnswer = keep.map(([, i], k) => (key.has(i) ? k : -1)).filter(k => k >= 0)
  }
  if (q.type === 'ordering') out.options = (q.options || []).filter(o => String(o).trim())
  if (q.type === 'matching') out.pairs = (q.pairs || []).filter(p => p.left.trim() && p.right.trim())
  return out
}

/** The answer key in words, for teacher previews (mirrors backend answerKeyText). */
export function answerKeyText(q) {
  const L = (i) => String.fromCharCode(65 + i)
  const opts = q.options || []
  switch (q.type) {
    case 'multi': return (Array.isArray(q.correctAnswer) ? q.correctAnswer : []).map(i => `${L(i)} ${opts[i] ?? ''}`).join('; ')
    case 'truefalse': return q.correctAnswer == null || q.correctAnswer === '' ? '' : String(q.correctAnswer).toLowerCase() === 'true' ? 'True' : 'False'
    case 'numeric': return q.correctAnswer == null || q.correctAnswer === '' ? '' : `${q.correctAnswer}${q.unit ? ' ' + q.unit : ''}${Number(q.tolerance) > 0 ? ` (± ${q.tolerance})` : ''}`
    case 'math': return q.correctAnswer ? `${prettyMath(q.correctAnswer)} or any equivalent` : ''
    case 'fillblank': return blankAnswers(q.text ?? q.questionText).map((a, i) => `(${i + 1}) ${a.join(' / ')}`).join('   ')
    case 'matching': return (q.pairs || []).map(p => `${p.left} → ${p.right}`).join('; ')
    case 'ordering': return opts.map((o, i) => `${i + 1}. ${o}`).join('   ')
  }
  return ''
}

/** "Answer key: …" line for teacher previews of the newer formats. */
export function AnswerKeyLine({ q }) {
  if (!NEW_TYPES.includes(q.type)) return null
  const key = answerKeyText(q)
  return (
    <div style={{ margin: '8px 0 2px', padding: '7px 12px', borderRadius: 7, background: '#DCFCE7', border: '1px solid #86EFAC', fontSize: 13, color: C.green }}>
      <b style={{ fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', marginRight: 8 }}>{ANSWER_TYPE_META[q.type].label} · key</b>
      {key ? renderMath(key) : <i>not set</i>}
    </div>
  )
}
