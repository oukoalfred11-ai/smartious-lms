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

/* ── Fallback renderer: readable without KaTeX ── */
const SUP = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','+':'⁺','-':'⁻','n':'ⁿ','a':'ᵃ','b':'ᵇ','x':'ˣ' }
const SUB = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','+':'₊','-':'₋','n':'ₙ','x':'ₓ','a':'ₐ' }
const SYM = {
  '\\pi':'π','\\theta':'θ','\\alpha':'α','\\beta':'β','\\Delta':'Δ','\\lambda':'λ',
  '\\mu':'μ','\\rho':'ρ','\\Omega':'Ω','\\infty':'∞','\\pm':'±','\\times':'×',
  '\\div':'÷','\\approx':'≈','\\leq':'≤','\\geq':'≥','\\neq':'≠','\\cdot':'·',
  '\\rightarrow':'→','\\rightleftharpoons':'⇌','\\sum':'Σ','\\int':'∫','\\sqrt':'√',
  '\\circ':'°',
}

function plainMath(tex) {
  let s = tex
  s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
  s = s.replace(/\\sqrt\[([^\]]*)\]\{([^{}]*)\}/g, '$1√($2)')
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, '√($1)')
  s = s.replace(/\\text\{([^{}]*)\}/g, '$1')
  for (const [k, v] of Object.entries(SYM)) s = s.split(k).join(v)
  s = s.replace(/\^\{([^{}]+)\}/g, (_, g) => [...g].map(c => SUP[c] || '^' + c).join(''))
  s = s.replace(/_\{([^{}]+)\}/g, (_, g) => [...g].map(c => SUB[c] || '_' + c).join(''))
  s = s.replace(/\^(\w)/g, (_, c) => SUP[c] || '^' + c)
  s = s.replace(/_(\w)/g, (_, c) => SUB[c] || '_' + c)
  return s.replace(/[{}]/g, '')
}

/** Render text containing $…$ segments. Exported for use in question lists. */
export function renderMath(text) {
  if (!text) return ''
  const hasKatex = typeof window !== 'undefined' && window.katex
  return String(text).split(/(\$[^$]+\$)/g).map((part, i) => {
    if (!part.startsWith('$') || !part.endsWith('$') || part.length < 3) {
      return <span key={i}>{part}</span>
    }
    const tex = part.slice(1, -1)
    if (hasKatex) {
      try {
        return <span key={i} dangerouslySetInnerHTML={{
          __html: window.katex.renderToString(tex, { throwOnError: false, displayMode: false }),
        }} />
      } catch { /* fall through to plain */ }
    }
    return (
      <span key={i} style={{ fontFamily: 'Cambria, Georgia, serif', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
        {plainMath(tex)}
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
