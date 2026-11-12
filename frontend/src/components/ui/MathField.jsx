import { splitMath, plainMath, keyboardMath, bareLatexSegments } from '../../lib/mathText.js'
import React, { useState, useRef, useEffect } from 'react'

/**
 * MathField
 * ------------------------------------------------------------
 * A textarea that can hold mathematics and STEM notation.
 *
 * Formulae are written in LaTeX between dollar signs, which is what
 * every exam board, textbook and marking system already uses, and what
 * an AI marker reads without ambiguity. "x^2" typed as plain text is
 * guesswork; "$x^2$" is not.
 *
 * Rendering uses KaTeX when it is present on the page, and falls back
 * to a readable Unicode approximation when it is not — so this works
 * with no npm install and improves automatically if KaTeX is added
 * later via a CDN tag in index.html:
 *
 *   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
 *   <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
 */

/* ── Insertable notation, grouped the way a teacher thinks ── */
export const MATH_GROUPS = [
  {
    name: 'Algebra',
    items: [
      { label: 'x²',      insert: 'x^{2}',            hint: 'power' },
      { label: 'xₙ',      insert: 'x_{n}',            hint: 'subscript' },
      { label: '√',       insert: '\\sqrt{x}',        hint: 'square root' },
      { label: 'ⁿ√',      insert: '\\sqrt[n]{x}',     hint: 'nth root' },
      { label: 'a⁄b',     insert: '\\frac{a}{b}',     hint: 'fraction' },
      { label: '±',       insert: '\\pm',             hint: 'plus or minus' },
      { label: '×',       insert: '\\times',          hint: 'multiply' },
      { label: '÷',       insert: '\\div',            hint: 'divide' },
      { label: '≈',       insert: '\\approx',         hint: 'approximately' },
      { label: '≤',       insert: '\\leq',            hint: 'less or equal' },
      { label: '≥',       insert: '\\geq',            hint: 'greater or equal' },
      { label: '≠',       insert: '\\neq',            hint: 'not equal' },
    ],
  },
  {
    name: 'Greek & constants',
    items: [
      { label: 'π',  insert: '\\pi' },      { label: 'θ',  insert: '\\theta' },
      { label: 'α',  insert: '\\alpha' },   { label: 'β',  insert: '\\beta' },
      { label: 'Δ',  insert: '\\Delta' },   { label: 'λ',  insert: '\\lambda' },
      { label: 'μ',  insert: '\\mu' },      { label: 'ρ',  insert: '\\rho' },
      { label: 'Ω',  insert: '\\Omega' },   { label: '∞',  insert: '\\infty' },
      { label: '°',  insert: '^{\\circ}',   hint: 'degrees' },
    ],
  },
  {
    name: 'Physics & chemistry',
    items: [
      { label: 'H₂O',   insert: 'H_{2}O',                    hint: 'subscript formula' },
      { label: 'SO₄²⁻', insert: 'SO_{4}^{2-}',               hint: 'ion' },
      { label: '→',     insert: '\\rightarrow',              hint: 'reacts to give' },
      { label: '⇌',     insert: '\\rightleftharpoons',       hint: 'reversible' },
      { label: 'ms⁻¹',  insert: '\\text{m s}^{-1}',          hint: 'unit' },
      { label: '×10ⁿ',  insert: '\\times 10^{n}',            hint: 'standard form' },
      { label: 'Σ',     insert: '\\sum',                     hint: 'sum' },
      { label: '∫',     insert: '\\int',                     hint: 'integral' },
      { label: 'd⁄dx',  insert: '\\frac{d}{dx}',             hint: 'derivative' },
    ],
  },
  {
    name: 'Common formulae',
    items: [
      { label: 'v = u + at',  insert: 'v = u + at' },
      { label: 's = ut + ½at²', insert: 's = ut + \\frac{1}{2}at^{2}' },
      { label: 'V = IR',      insert: 'V = IR' },
      { label: 'E = mc²',     insert: 'E = mc^{2}' },
      { label: 'ρ = m/V',     insert: '\\rho = \\frac{m}{V}' },
      { label: 'quadratic',   insert: 'x = \\frac{-b \\pm \\sqrt{b^{2}-4ac}}{2a}' },
    ],
  },
]

/**
 * Render text containing maths: $…$, $$…$$, \(…\), \[…\]. KaTeX draws it
 * when loaded; otherwise lib/mathText.js gives readable Unicode. A $ used
 * as money ("costs $80") stays text, and empty [[]] blanks from
 * fill-the-blank questions show as numbered gaps.
 */
// Fractions full size, as on a printed paper (inline KaTeX shrinks them).
const fullSize = (tex) => (/\\[dt]?frac|\\int|\\sum|\\lim/.test(tex) && !/\\(display|text)style/.test(tex) ? '\\displaystyle ' + tex : tex)

export function renderMath(text) {
  if (!text) return ''
  const hasKatex = typeof window !== 'undefined' && window.katex
  let blank = 0
  return splitMath(String(text)).map((part, i) => {
    if (!part.math) {
      // Maths typed without $…$ (\frac{1}{2}, H_2O, x^2) still reads as
      // maths: structured formulas are drawn by KaTeX, the rest as Unicode.
      if (hasKatex && !part.text.includes('[[]]') && /\\[A-Za-z]/.test(part.text)) {
        return <span key={i}>{bareLatexSegments(part.text).map((r, k) => {
          if (!r.math) return <span key={k}>{keyboardMath(r.text)}</span>
          if (r.script) return <span key={k}>{plainMath(r.text)}</span>
          try {
            return <span key={k} dangerouslySetInnerHTML={{ __html: window.katex.renderToString(fullSize(r.text), { throwOnError: false }) }} />
          } catch { return <span key={k}>{plainMath(r.text)}</span> }
        })}</span>
      }
      const txt = keyboardMath(part.text)
      if (!txt.includes('[[]]')) return <span key={i}>{txt}</span>
      return <span key={i}>{txt.split('[[]]').map((t, k) => k === 0 ? t : (
        <span key={k}><span style={{ display: 'inline-block', minWidth: 64, borderBottom: '2px solid currentColor', margin: '0 4px', textAlign: 'center', fontWeight: 700, fontSize: '.8em', opacity: .75 }}>({++blank})</span>{t}</span>
      ))}</span>
    }
    if (hasKatex) {
      try {
        return <span key={i} dangerouslySetInnerHTML={{
          __html: window.katex.renderToString(fullSize(part.text), { throwOnError: false, displayMode: !!part.display }),
        }} />
      } catch { /* fall through to plain */ }
    }
    return (
      <span key={i} style={{ fontFamily: '"Source Serif 4",Georgia,serif', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
        {plainMath(part.text)}
      </span>
    )
  })
}

export default function MathField({
  value, onChange, rows = 4, placeholder = '', label, hint,
  disabled = false,
}) {
  const ref = useRef(null)
  const [group, setGroup] = useState(0)
  const [showTools, setShowTools] = useState(false)
  const [katexReady, setKatexReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.katex) { setKatexReady(true); return }
    // Poll briefly in case KaTeX is loading from a deferred CDN tag.
    const t = setInterval(() => {
      if (typeof window !== 'undefined' && window.katex) { setKatexReady(true); clearInterval(t) }
    }, 400)
    setTimeout(() => clearInterval(t), 6000)
    return () => clearInterval(t)
  }, [])

  /** Insert at the caret, wrapping in $…$ so it renders as mathematics. */
  const insert = (tex) => {
    const el = ref.current
    const cur = value || ''
    const start = el ? el.selectionStart : cur.length
    const end   = el ? el.selectionEnd   : cur.length

    // If the caret already sits inside a $…$ block, do not nest another.
    const before = cur.slice(0, start)
    const opens = (before.match(/\$/g) || []).length
    const inside = opens % 2 === 1
    const snippet = inside ? tex : `$${tex}$`

    const next = cur.slice(0, start) + snippet + cur.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      if (!el) return
      const pos = start + snippet.length
      el.focus(); el.setSelectionRange(pos, pos)
    })
  }

  // Any maths at all, with or without $…$: show the preview.
  const hasMath = /\$[^$]+\$/.test(value || '') || /\\[A-Za-z]|[\w)\]}][\^_][{\w\-+]/.test(value || '')
  const [editor, setEditor] = useState(false)

  return (
    <div>
      {/* The formula tools are always on offer, label or not. (They used to
          appear only with a label, so the exam builder never showed them.) */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:5, flexWrap:'wrap' }}>
        <span style={lbl}>{label || ''}</span>
        <div style={{ display:'flex', gap:6 }}>
          <button type="button" onClick={() => setEditor(true)} disabled={disabled}
            style={{ ...toolBtn, background:'#8B1A2E', color:'#fff', borderColor:'#8B1A2E' }}>
            ∑ Equation editor
          </button>
          <button type="button" onClick={() => setShowTools(v => !v)} disabled={disabled}
            style={{ ...toolBtn, background: showTools ? '#8B1A2E' : '#fff', color: showTools ? '#fff' : '#8B1A2E' }}>
            {showTools ? 'Hide symbols' : 'Symbols'}
          </button>
        </div>
      </div>

      {showTools && (
        <div style={{ border:'1px solid #E8E0D0', borderRadius:9, padding:'10px 11px', marginBottom:8, background:'#FBF9F4' }}>
          <div style={{ display:'flex', gap:6, marginBottom:9, flexWrap:'wrap' }}>
            {MATH_GROUPS.map((g, i) => (
              <button key={g.name} type="button" onClick={() => setGroup(i)}
                style={{ ...tabBtn, background: group === i ? '#8B1A2E' : 'transparent',
                         color: group === i ? '#fff' : '#4A5261' }}>{g.name}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {MATH_GROUPS[group].items.map(it => (
              <button key={it.label} type="button" title={it.hint || it.insert}
                onClick={() => insert(it.insert)} style={symBtn}>{it.label}</button>
            ))}
          </div>
          <p style={{ margin:'9px 0 0', fontSize:11, color:'#6B7280', lineHeight:1.5 }}>
            Click a symbol to insert it. For fractions, powers and roots the <b>Equation editor</b> is easiest.
          </p>
        </div>
      )}

      <textarea
        ref={ref} rows={rows} disabled={disabled}
        value={value || ''} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1.5px solid #E8E0D0',
                 fontSize:14, lineHeight:1.6, boxSizing:'border-box', resize:'vertical',
                 fontFamily:'ui-monospace, SFMono-Regular, monospace', color:'#0D1220', background:'#fff' }}
      />

      {hasMath && (
        <div style={{ marginTop:8, padding:'10px 12px', borderRadius:8,
                      border:'1px solid #E8D9AE', background:'#FBF6EA' }}>
          <div style={{ ...lbl, color:'#8A6414', marginBottom:5 }}>Preview: how it looks on screen and on the printed paper</div>
          <div style={{ fontSize:15, lineHeight:1.9, color:'#0D1220' }}>{renderMath(value)}</div>
        </div>
      )}

      {hint && <p style={{ margin:'6px 0 0', fontSize:11.5, color:'#6B7280', lineHeight:1.5 }}>{hint}</p>}

      {editor && <EquationEditor onClose={() => setEditor(false)} onInsert={(tex) => { setEditor(false); if (tex.trim()) insert(tex.trim()) }} />}
    </div>
  )
}

/* ── Visual equation editor ───────────────────────────────────────
   MathLive (MIT) gives a WYSIWYG maths box: type "1/2" and it becomes a
   fraction, "sqrt" a root, x then ^ a power, and an on-screen maths
   keyboard on phones and tablets. It is loaded from the CDN only when a
   teacher opens the editor, so it costs nothing anywhere else. The
   result is LaTeX, inserted between $…$ like the symbol buttons. */
const MATHLIVE_SRC = 'https://cdn.jsdelivr.net/npm/mathlive@0.105.3/mathlive.min.js'
let mathlivePromise = null
function loadMathLive() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.MathfieldElement) return Promise.resolve()
  if (!mathlivePromise) {
    mathlivePromise = new Promise((resolve, reject) => {
      const sc = document.createElement('script')
      sc.src = MATHLIVE_SRC; sc.async = true
      sc.onload = () => resolve()
      sc.onerror = () => { mathlivePromise = null; reject(new Error('MathLive failed to load')) }
      document.head.appendChild(sc)
    })
  }
  return mathlivePromise
}

const QUICK = [
  ['Fraction', '\\frac{#@}{#?}'], ['Power', '#@^{#?}'], ['Square root', '\\sqrt{#0}'], ['Subscript', '#@_{#?}'],
  ['π', '\\pi'], ['θ', '\\theta'], ['±', '\\pm'], ['×', '\\times'], ['÷', '\\div'], ['≤', '\\leq'], ['≥', '\\geq'], ['°', '^{\\circ}'],
  ['→', '\\rightarrow'], ['⇌', '\\rightleftharpoons'], ['∫', '\\int_{#?}^{#?}'], ['Σ', '\\sum_{#?}^{#?}'],
]

function EquationEditor({ onClose, onInsert }) {
  const host = useRef(null)
  const mfRef = useRef(null)
  const [state, setState] = useState('loading')   // loading | ready | failed
  const [latex, setLatex] = useState('')

  useEffect(() => {
    let alive = true
    loadMathLive().then(() => {
      if (!alive || !host.current) return
      const mf = new window.MathfieldElement()
      mf.smartFence = true
      mf.style.cssText = 'width:100%;font-size:26px;padding:10px 12px;border:1.5px solid #E8E0D0;border-radius:10px;min-height:64px;box-sizing:border-box;'
      mf.addEventListener('input', () => setLatex(mf.value))
      host.current.appendChild(mf)
      mfRef.current = mf
      setState('ready')
      setTimeout(() => mf.focus(), 50)
    }).catch(() => { if (alive) setState('failed') })
    return () => { alive = false; try { window.mathVirtualKeyboard?.hide?.() } catch { /* noop */ } }
  }, [])

  const put = (tex) => { const mf = mfRef.current; if (!mf) return; mf.executeCommand(['insert', tex, { selectionMode: 'placeholder' }]); mf.focus() }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(13,18,32,.55)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:16, width:'min(640px, 100%)', padding:22, boxShadow:'0 24px 60px rgba(0,0,0,.3)' }}>
        <div style={{ fontFamily:'"Source Serif 4",Georgia,serif', fontSize:20, fontWeight:700, color:'#0D1220' }}>Equation editor</div>
        <div style={{ fontSize:12.5, color:'#6B7280', margin:'4px 0 14px', lineHeight:1.5 }}>
          Type the maths as you would say it: <b>1/2</b> makes a fraction, <b>x^2</b> a power, <b>sqrt</b> a square root, <b>pi</b> gives π. Or use the buttons.
        </div>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
          {QUICK.map(([l, t]) => <button key={l} type="button" disabled={state !== 'ready'} onClick={() => put(t)} style={{ ...symBtn, fontSize: l.length > 2 ? 12 : 14 }}>{l}</button>)}
          <button type="button" disabled={state !== 'ready'} onClick={() => { try { window.mathVirtualKeyboard.show() } catch { /* noop */ } }} style={{ ...symBtn, fontSize:12 }}>⌨ Maths keyboard</button>
        </div>
        <div ref={host}>
          {state === 'loading' && <div style={{ padding:22, textAlign:'center', color:'#6B7280', fontSize:13, border:'1.5px dashed #E8E0D0', borderRadius:10 }}>Loading the equation editor…</div>}
          {state === 'failed' && <div style={{ padding:16, color:'#991B1B', fontSize:13, background:'#FEF2F2', borderRadius:10 }}>The equation editor could not load (check the internet connection). You can still use Symbols, or type maths such as x^2 or \frac{1}{2}.</div>}
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
          <button type="button" onClick={onClose} style={{ padding:'9px 16px', borderRadius:9, border:'1.5px solid #E8E0D0', background:'#fff', color:'#4A5261', fontWeight:700, fontSize:13, cursor:'pointer' }}>Cancel</button>
          <button type="button" disabled={!latex.trim()} onClick={() => onInsert(latex)} style={{ padding:'9px 18px', borderRadius:9, border:'none', background: latex.trim() ? '#8B1A2E' : '#D1D5DB', color:'#fff', fontWeight:800, fontSize:13, cursor: latex.trim() ? 'pointer' : 'default' }}>Insert into question</button>
        </div>
      </div>
    </div>
  )
}

const lbl = { fontSize:10.5, fontWeight:800, letterSpacing:'.08em', textTransform:'uppercase', color:'#8A93A3' }
const toolBtn = { fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:6,
                  border:'1.5px solid #E8A4AD', cursor:'pointer' }
const tabBtn = { fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:99,
                 border:'1px solid #E8E0D0', cursor:'pointer' }
const symBtn = { minWidth:34, padding:'6px 9px', borderRadius:6, border:'1px solid #E8E0D0',
                 background:'#fff', fontSize:13.5, cursor:'pointer', color:'#0D1220',
                 fontFamily:'"Source Serif 4",Georgia,serif' }
