import { splitMath, plainMath } from '../../lib/mathText.js'
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
export function renderMath(text) {
  if (!text) return ''
  const hasKatex = typeof window !== 'undefined' && window.katex
  let blank = 0
  return splitMath(String(text)).map((part, i) => {
    if (!part.math) {
      if (!part.text.includes('[[]]')) return <span key={i}>{part.text}</span>
      return <span key={i}>{part.text.split('[[]]').map((t, k) => k === 0 ? t : (
        <span key={k}><span style={{ display: 'inline-block', minWidth: 64, borderBottom: '2px solid currentColor', margin: '0 4px', textAlign: 'center', fontWeight: 700, fontSize: '.8em', opacity: .75 }}>({++blank})</span>{t}</span>
      ))}</span>
    }
    if (hasKatex) {
      try {
        return <span key={i} dangerouslySetInnerHTML={{
          __html: window.katex.renderToString(part.text, { throwOnError: false, displayMode: !!part.display }),
        }} />
      } catch { /* fall through to plain */ }
    }
    return (
      <span key={i} style={{ fontFamily: 'Cambria, Georgia, serif', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
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

  const hasMath = /\$[^$]+\$/.test(value || '')

  return (
    <div>
      {label && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
          <span style={lbl}>{label}</span>
          <button type="button" onClick={() => setShowTools(v => !v)} disabled={disabled}
            style={{ ...toolBtn, background: showTools ? '#8B1A2E' : '#fff', color: showTools ? '#fff' : '#8B1A2E' }}>
            {showTools ? 'Hide symbols' : 'Insert formula'}
          </button>
        </div>
      )}

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
            Mathematics is written between dollar signs, for example <code>$x^2 + 3x$</code>.
            Anything outside them stays ordinary text.
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
          <div style={{ ...lbl, color:'#8A6414', marginBottom:5 }}>
            Preview {katexReady ? '' : '(approximate — add KaTeX for exact rendering)'}
          </div>
          <div style={{ fontSize:14.5, lineHeight:1.7, color:'#0D1220' }}>{renderMath(value)}</div>
        </div>
      )}

      {hint && <p style={{ margin:'6px 0 0', fontSize:11.5, color:'#6B7280', lineHeight:1.5 }}>{hint}</p>}
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
                 fontFamily:'Cambria, Georgia, serif' }
