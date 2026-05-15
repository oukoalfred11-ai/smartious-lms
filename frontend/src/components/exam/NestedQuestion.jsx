/**
 * NestedQuestion.jsx — shared editor / renderer / answer collector
 * ============================================================
 * Cambridge-format nested questions: Q1 → (a)(b)(c) → (i)(ii)(iii) → (1)(2)(3) → (α)(β)(γ).
 * Imported by both TeacherPortal (Question Bank form, Exam Builder picker,
 * Marking screen) and StudentPortal (sitting screen, result screen).
 *
 * Three exports:
 *   <NestedQuestionEditor>   — teacher authoring form, recursive
 *   <NestedQuestionRenderer> — read-only display (with optional per-part children)
 *   <NestedAnswerCollector>  — student answer form, recursive
 *
 * Plus utility helpers:
 *   labelAt(path)            — [1,0,2] → "b.i.3"
 *   walkLeaves(parts, cb)    — depth-first walk, callback gets (part, path)
 *   sumLeafMarks(parts)      — total marks for a parts tree
 */

import { useState, useCallback } from 'react'

// ─────────────────────────────────────────────────────────
// LABEL HELPERS
// ─────────────────────────────────────────────────────────
const ALPHA      = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
const ROMAN      = ['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii','xiii','xiv','xv','xvi']
const GREEK      = ['α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ']

// Convert a part path (array of zero-based indices) into a display label.
// Depth 0 (top question) returns ''; the question card itself uses Q1, Q2 etc.
//   [0]       → 'a'
//   [1, 0]    → 'b.i'
//   [2, 1, 0] → 'c.ii.1'
//   [3,2,1,0] → 'd.iii.2.β'
export const labelAt = (path) => {
  if (!Array.isArray(path) || path.length === 0) return ''
  return path.map((idx, depth) => {
    const i = Math.max(0, idx)
    if (depth === 0) return ALPHA[i] || `[${i+1}]`
    if (depth === 1) return ROMAN[i] || `[${i+1}]`
    if (depth === 2) return String(i+1)
    if (depth === 3) return GREEK[i] || `[${i+1}]`
    return `[${i+1}]`
  }).join('.')
}

// Walk every LEAF (no-children) part in the tree, calling cb(part, path).
// Useful for collecting answer slots in the student form.
export const walkLeaves = (parts, cb, basePath = []) => {
  if (!Array.isArray(parts) || parts.length === 0) return
  parts.forEach((p, i) => {
    const path = [...basePath, i]
    if (Array.isArray(p.parts) && p.parts.length > 0) {
      walkLeaves(p.parts, cb, path)
    } else {
      cb(p, path)
    }
  })
}

// Sum marks across leaf parts
export const sumLeafMarks = (parts) => {
  if (!Array.isArray(parts) || parts.length === 0) return 0
  let total = 0
  for (const p of parts) {
    if (Array.isArray(p.parts) && p.parts.length > 0) total += sumLeafMarks(p.parts)
    else total += Number(p.marks) || 0
  }
  return total
}

// Default colour palette (overridable via prop)
const BRAND = {
  crimson: '#7D1025',
  crimsonDeep: '#5A0B1B',
  gold: '#C9A030',
  goldPale: '#FBF6E3',
  cream: '#FBFAF5',
  ink: '#1A1A1A',
  inkSoft: '#3F3F3F',
  inkMute: '#6B6B6B',
  line: '#E8E2D6',
  white: '#FFFFFF',
}

// ─────────────────────────────────────────────────────────
// <NestedQuestionEditor>  — recursive teacher authoring form
// ─────────────────────────────────────────────────────────
// Props:
//   value       — current parts array (may be empty for flat-only mode)
//   onChange    — (newParts) => void
//   maxDepth    — hard cap (default 4); UI hides "Add Sub-part" beyond this
//   depth       — internal recursion counter (don't pass from outside)
// ─────────────────────────────────────────────────────────
export const NestedQuestionEditor = ({
  value = [],
  onChange,
  maxDepth = 4,
  depth = 0,
  basePath = [],
}) => {
  const parts = Array.isArray(value) ? value : []

  const updatePart = (idx, patch) => {
    const next = parts.map((p, i) => i === idx ? { ...p, ...patch } : p)
    onChange(next)
  }
  const updatePartParts = (idx, childParts) => {
    updatePart(idx, { parts: childParts })
  }
  const addPart = () => {
    const newPart = {
      type: 'short',
      text: '',
      options: [],
      marks: 1,
      attachments: [],
      parts: [],
    }
    onChange([...parts, newPart])
  }
  const removePart = (idx) => {
    onChange(parts.filter((_, i) => i !== idx))
  }
  const movePart = (idx, dir) => {
    const j = idx + dir
    if (j < 0 || j >= parts.length) return
    const next = parts.slice()
    ;[next[idx], next[j]] = [next[j], next[idx]]
    onChange(next)
  }

  return (
    <div style={{
      // Indent for visual hierarchy
      marginLeft: depth > 0 ? 18 : 0,
      borderLeft: depth > 0 ? `2px solid ${BRAND.goldPale}` : 'none',
      paddingLeft: depth > 0 ? 14 : 0,
    }}>
      {parts.map((part, idx) => {
        const path = [...basePath, idx]
        const label = labelAt(path)
        const hasChildren = Array.isArray(part.parts) && part.parts.length > 0
        const leafMarks = hasChildren ? sumLeafMarks(part.parts) : (Number(part.marks) || 0)

        return (
          <div key={idx} style={{
            marginBottom: 12,
            background: depth === 0 ? BRAND.cream : BRAND.white,
            border: `1px solid ${BRAND.line}`,
            borderRadius: 8,
            padding: 12,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                width:32, height:32, borderRadius:6,
                background:BRAND.crimson, color:BRAND.white,
                fontFamily:'JetBrains Mono,monospace', fontWeight:700, fontSize:12,
              }}>
                ({label})
              </div>
              <div style={{ flex:1, fontSize:11, color:BRAND.inkMute, fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase' }}>
                {hasChildren ? `Sub-question (auto: ${leafMarks} marks from parts below)` : `Sub-question — leaf`}
              </div>
              <button onClick={() => movePart(idx, -1)} disabled={idx === 0}
                style={{ background:'transparent', border:'none', cursor:idx===0?'not-allowed':'pointer', color:BRAND.inkMute, fontSize:14, padding:'4px 6px', opacity:idx===0?.3:1 }}
                title="Move up">↑</button>
              <button onClick={() => movePart(idx, +1)} disabled={idx === parts.length-1}
                style={{ background:'transparent', border:'none', cursor:idx===parts.length-1?'not-allowed':'pointer', color:BRAND.inkMute, fontSize:14, padding:'4px 6px', opacity:idx===parts.length-1?.3:1 }}
                title="Move down">↓</button>
              <button onClick={() => { if (window.confirm(`Remove part (${label})?`)) removePart(idx) }}
                style={{ background:'transparent', border:'none', cursor:'pointer', color:BRAND.crimson, fontSize:14, padding:'4px 8px', fontWeight:700 }}
                title="Remove this part">×</button>
            </div>

            {/* Type + marks row */}
            <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
              <select
                value={part.type || 'short'}
                onChange={e => updatePart(idx, { type: e.target.value })}
                disabled={hasChildren}
                style={{
                  flex:'0 0 auto', padding:'6px 8px',
                  background: hasChildren ? '#F3F4F6' : BRAND.white,
                  border:`1px solid ${BRAND.line}`, borderRadius:6,
                  fontSize:12, color:BRAND.ink,
                }}
                title={hasChildren ? 'Disabled: parent parts have no answer type' : ''}
              >
                <option value="short">Short answer</option>
                <option value="long">Long answer / essay</option>
                <option value="mcq">Multiple choice</option>
                <option value="drawing">Drawing</option>
                <option value="handwriting">Handwriting</option>
                <option value="upload">File upload</option>
              </select>
              {!hasChildren && (
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:11, color:BRAND.inkMute, fontWeight:600 }}>Marks</span>
                  <input
                    type="number" min={0} step={1}
                    value={part.marks ?? 1}
                    onChange={e => updatePart(idx, { marks: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    style={{
                      width:60, padding:'6px 8px',
                      background:BRAND.white,
                      border:`1px solid ${BRAND.line}`, borderRadius:6,
                      fontSize:12, color:BRAND.ink,
                      fontFamily:'JetBrains Mono,monospace', fontWeight:700, textAlign:'center',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Question text */}
            <textarea
              value={part.text || ''}
              onChange={e => updatePart(idx, { text: e.target.value })}
              placeholder={`Part (${label}) question text...`}
              rows={2}
              style={{
                width:'100%', boxSizing:'border-box',
                padding:'8px 10px', resize:'vertical',
                background:BRAND.white, border:`1px solid ${BRAND.line}`, borderRadius:6,
                fontSize:13, color:BRAND.ink, fontFamily:'inherit',
                marginBottom: part.type === 'mcq' && !hasChildren ? 8 : 0,
              }}
            />

            {/* MCQ options */}
            {part.type === 'mcq' && !hasChildren && (
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize:10.5, fontWeight:700, color:BRAND.inkMute, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:6 }}>
                  Options (mark the correct one)
                </div>
                {(part.options || []).map((opt, oi) => (
                  <div key={oi} style={{ display:'flex', gap:6, marginBottom:5, alignItems:'center' }}>
                    <input
                      type="radio"
                      name={`correct-${depth}-${idx}`}
                      checked={part.correctAnswer === oi}
                      onChange={() => updatePart(idx, { correctAnswer: oi })}
                      style={{ accentColor: BRAND.crimson }}
                    />
                    <input
                      value={opt}
                      onChange={e => {
                        const newOpts = [...part.options]
                        newOpts[oi] = e.target.value
                        updatePart(idx, { options: newOpts })
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      style={{
                        flex:1, padding:'6px 8px',
                        background:BRAND.white,
                        border:`1px solid ${BRAND.line}`, borderRadius:6,
                        fontSize:12.5, color:BRAND.ink,
                      }}
                    />
                    <button
                      onClick={() => {
                        const newOpts = part.options.filter((_, i) => i !== oi)
                        // adjust correctAnswer if needed
                        let newCorrect = part.correctAnswer
                        if (typeof newCorrect === 'number') {
                          if (newCorrect === oi)      newCorrect = null
                          else if (newCorrect > oi)   newCorrect = newCorrect - 1
                        }
                        updatePart(idx, { options: newOpts, correctAnswer: newCorrect })
                      }}
                      style={{ background:'transparent', border:'none', cursor:'pointer', color:BRAND.inkMute, padding:'4px 6px' }}
                      title="Remove option"
                    >×</button>
                  </div>
                ))}
                <button
                  onClick={() => updatePart(idx, { options: [...(part.options || []), ''] })}
                  style={{
                    marginTop:4, padding:'4px 10px',
                    background:BRAND.white, border:`1px dashed ${BRAND.crimson}`,
                    color:BRAND.crimson, borderRadius:6,
                    fontSize:11, fontWeight:600, cursor:'pointer',
                  }}
                >+ Add option</button>
              </div>
            )}

            {/* Recursive: render this part's own sub-parts */}
            {hasChildren && (
              <div style={{ marginTop:10 }}>
                <NestedQuestionEditor
                  value={part.parts}
                  onChange={(newChildParts) => updatePartParts(idx, newChildParts)}
                  maxDepth={maxDepth}
                  depth={depth + 1}
                  basePath={path}
                />
              </div>
            )}

            {/* Add Sub-part button — only if not at maxDepth */}
            {depth + 1 < maxDepth && (
              <button
                onClick={() => {
                  // First time adding a sub-part: this part becomes a parent.
                  // We KEEP its marks/options as is — the schema will sum from children.
                  const newSubPart = { type:'short', text:'', options:[], marks:1, attachments:[], parts:[] }
                  const children = [...(part.parts || []), newSubPart]
                  updatePart(idx, { parts: children })
                }}
                style={{
                  marginTop:10, padding:'5px 10px',
                  background:BRAND.goldPale, border:`1px solid ${BRAND.gold}`,
                  color:BRAND.crimson, borderRadius:6,
                  fontSize:11, fontWeight:700, cursor:'pointer',
                }}
              >+ Add Sub-part {hasChildren ? `(${labelAt([...path, part.parts.length])})` : `(${labelAt([...path, 0])})`}</button>
            )}
          </div>
        )
      })}

      <button
        onClick={addPart}
        style={{
          marginTop: parts.length > 0 ? 4 : 0,
          padding:'8px 14px',
          background:depth === 0 ? BRAND.crimson : BRAND.white,
          color: depth === 0 ? BRAND.white : BRAND.crimson,
          border:`${depth === 0 ? '0' : '1.5px dashed'} ${BRAND.crimson}`,
          borderRadius:6,
          fontSize:12, fontWeight:700, cursor:'pointer',
          display:'inline-flex', alignItems:'center', gap:6,
        }}
      >
        + Add {depth === 0 ? 'Part' : 'Part'} ({labelAt([...basePath, parts.length])})
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// <NestedQuestionRenderer>  — read-only display
// ─────────────────────────────────────────────────────────
// Renders a question (stem + parts tree) in display mode.
// Used in:
//   - Exam Builder bank picker (preview of selected question)
//   - Teacher Marking screen (display the question alongside student answer)
//
// Props:
//   stem        — top-level question text (parent)
//   parts       — parts array
//   showMarks   — whether to display marks badges (default true)
//   compact     — smaller spacing for inline previews
// ─────────────────────────────────────────────────────────
export const NestedQuestionRenderer = ({ stem, parts = [], showMarks = true, compact = false }) => {
  const pad = compact ? 6 : 10
  return (
    <div>
      {stem && (
        <div style={{
          padding: `${pad}px ${pad+4}px`,
          background: BRAND.goldPale,
          border:`1px solid ${BRAND.gold}40`,
          borderRadius:6, marginBottom:10,
          fontSize: compact ? 12.5 : 13.5, color:BRAND.ink, lineHeight:1.5,
        }}>
          {stem}
        </div>
      )}
      {parts.length > 0 && (
        <NestedRendererInner parts={parts} basePath={[]} depth={0} showMarks={showMarks} compact={compact}/>
      )}
    </div>
  )
}

const NestedRendererInner = ({ parts, basePath, depth, showMarks, compact }) => {
  return (
    <div style={{
      marginLeft: depth > 0 ? 16 : 0,
      borderLeft: depth > 0 ? `2px solid ${BRAND.line}` : 'none',
      paddingLeft: depth > 0 ? 12 : 0,
    }}>
      {parts.map((part, idx) => {
        const path = [...basePath, idx]
        const label = labelAt(path)
        const hasChildren = Array.isArray(part.parts) && part.parts.length > 0
        const partMarks = hasChildren ? sumLeafMarks(part.parts) : (Number(part.marks) || 0)
        return (
          <div key={idx} style={{ marginBottom: compact ? 6 : 10 }}>
            <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
              <div style={{
                minWidth:30, padding:'2px 6px',
                background:BRAND.crimson + '12', color:BRAND.crimson,
                fontFamily:'JetBrains Mono,monospace',
                fontSize: compact ? 10.5 : 11.5, fontWeight:700,
                borderRadius:4, textAlign:'center', flexShrink:0,
              }}>
                ({label})
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize: compact ? 12.5 : 13.5, color:BRAND.ink, lineHeight:1.5 }}>
                  {part.text}
                </div>
                {part.type === 'mcq' && !hasChildren && (part.options || []).length > 0 && (
                  <div style={{ marginTop:4, paddingLeft:4 }}>
                    {part.options.map((o, oi) => (
                      <div key={oi} style={{ fontSize:11.5, color:BRAND.inkSoft, marginBottom:1 }}>
                        <span style={{ fontFamily:'JetBrains Mono,monospace', color:BRAND.inkMute }}>
                          {String.fromCharCode(65 + oi)}.
                        </span> {o}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {showMarks && (
                <div style={{
                  fontFamily:'JetBrains Mono,monospace',
                  fontSize: compact ? 10.5 : 11.5, color:BRAND.inkMute,
                  fontWeight:700, flexShrink:0,
                  padding:'2px 6px',
                  background:BRAND.cream, borderRadius:4,
                }}>
                  [{partMarks}]
                </div>
              )}
            </div>
            {hasChildren && (
              <NestedRendererInner
                parts={part.parts} basePath={path} depth={depth+1}
                showMarks={showMarks} compact={compact}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// <NestedAnswerCollector>  — student answer form
// ─────────────────────────────────────────────────────────
// Walks the nested tree and renders an answer input at every leaf.
// Tracks all answers in a map keyed by 'questionRef|partPath' string.
//
// Props:
//   questionRef — '<bankId>' OR 'custom:N'
//   stem        — parent question text (shown once at top)
//   flatQuestion — for flat questions: { type, options, text }
//   parts       — parts tree (may be empty for flat questions)
//   answers     — current answers map
//   onChange    — (newAnswers) => void
//   readOnly    — disable inputs (used for review/result screens)
//   renderers   — { DrawingCanvas, HandwritingCanvas, UploadInput } — passed in
//                 from the portal so this shared module stays portal-agnostic.
//                 If a renderer is missing, the type falls back to textarea.
//
// For FLAT questions (parts:[]), this renders ONE answer input
// directly with partPath=[] — same behaviour as before.
// ─────────────────────────────────────────────────────────
const makeKey = (questionRef, partPath) => questionRef + '|' + (partPath || []).join('.')

export const NestedAnswerCollector = ({
  questionRef,
  stem,
  flatQuestion = null,
  parts = [],
  answers = {},
  onChange,
  readOnly = false,
  renderers = {},
}) => {
  const isNested = Array.isArray(parts) && parts.length > 0

  const updateAnswer = useCallback((partPath, patch) => {
    const key = makeKey(questionRef, partPath)
    const next = { ...answers, [key]: { ...(answers[key] || {}), ...patch } }
    onChange(next)
  }, [questionRef, answers, onChange])

  return (
    <div>
      {stem && (
        <div style={{
          padding:'10px 14px',
          background:BRAND.goldPale, border:`1px solid ${BRAND.gold}40`,
          borderRadius:6, marginBottom:12,
          fontSize:13.5, color:BRAND.ink, lineHeight:1.5,
        }}>
          {stem}
        </div>
      )}
      {/* Flat question: render a single input here */}
      {!isNested && flatQuestion && (
        <AnswerInput
          part={flatQuestion}
          path={[]}
          questionRef={questionRef}
          answer={answers[makeKey(questionRef, [])]}
          onChange={(patch) => updateAnswer([], patch)}
          readOnly={readOnly}
          renderers={renderers}
        />
      )}
      {/* Nested: walk the tree, rendering an input at every leaf */}
      {isNested && (
        <NestedAnswerInner
          parts={parts} basePath={[]} depth={0}
          questionRef={questionRef}
          answers={answers}
          updateAnswer={updateAnswer}
          readOnly={readOnly}
          renderers={renderers}
        />
      )}
    </div>
  )
}

const NestedAnswerInner = ({ parts, basePath, depth, questionRef, answers, updateAnswer, readOnly, renderers }) => {
  return (
    <div style={{
      marginLeft: depth > 0 ? 16 : 0,
      borderLeft: depth > 0 ? `2px solid ${BRAND.line}` : 'none',
      paddingLeft: depth > 0 ? 14 : 0,
    }}>
      {parts.map((part, idx) => {
        const path = [...basePath, idx]
        const label = labelAt(path)
        const hasChildren = Array.isArray(part.parts) && part.parts.length > 0
        const partMarks = hasChildren ? sumLeafMarks(part.parts) : (Number(part.marks) || 0)
        return (
          <div key={idx} style={{ marginBottom:14 }}>
            <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:6 }}>
              <div style={{
                minWidth:30, padding:'2px 6px',
                background:BRAND.crimson + '12', color:BRAND.crimson,
                fontFamily:'JetBrains Mono,monospace',
                fontSize:11.5, fontWeight:700,
                borderRadius:4, textAlign:'center', flexShrink:0,
              }}>
                ({label})
              </div>
              <div style={{ flex:1, minWidth:0, fontSize:13.5, color:BRAND.ink, lineHeight:1.5 }}>
                {part.text}
              </div>
              <div style={{
                fontFamily:'JetBrains Mono,monospace', fontSize:11.5, color:BRAND.inkMute,
                fontWeight:700, flexShrink:0, padding:'2px 6px',
                background:BRAND.cream, borderRadius:4,
              }}>
                [{partMarks}]
              </div>
            </div>
            {!hasChildren && (
              <div style={{ marginLeft:38 }}>
                <AnswerInput
                  part={part} path={path}
                  questionRef={questionRef}
                  answer={answers[makeKey(questionRef, path)]}
                  onChange={(patch) => updateAnswer(path, patch)}
                  readOnly={readOnly}
                  renderers={renderers}
                />
              </div>
            )}
            {hasChildren && (
              <NestedAnswerInner
                parts={part.parts} basePath={path} depth={depth+1}
                questionRef={questionRef} answers={answers}
                updateAnswer={updateAnswer} readOnly={readOnly}
                renderers={renderers}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

const AnswerInput = ({ part, path, questionRef, answer, onChange, readOnly, renderers = {} }) => {
  const a = answer || {}
  const type = part.type || 'short'

  // ── MCQ ──
  if (type === 'mcq' && (part.options || []).length > 0) {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {part.options.map((opt, oi) => {
          const selected = a.selectedOption === opt
          return (
            <label key={oi} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'8px 12px',
              background: selected ? '#FBE8E8' : BRAND.cream,
              border:`1.5px solid ${selected ? BRAND.crimson : BRAND.line}`,
              borderRadius:6,
              cursor: readOnly ? 'default' : 'pointer',
              fontSize:13, opacity: readOnly ? .85 : 1,
            }}>
              <input
                type="radio"
                checked={selected}
                onChange={() => !readOnly && onChange({ selectedOption: opt, answerText: opt })}
                disabled={readOnly}
                style={{ accentColor: BRAND.crimson }}
              />
              <span style={{ fontFamily:'JetBrains Mono,monospace', color:BRAND.inkMute, fontSize:11 }}>
                {String.fromCharCode(65 + oi)}.
              </span>
              <span>{opt}</span>
            </label>
          )
        })}
      </div>
    )
  }

  // ── DRAWING (uses portal-provided DrawingCanvas) ──
  // The drawing is serialised to a single PNG dataURL stored in answerText.
  if (type === 'drawing' && renderers.DrawingCanvas) {
    const Canvas = renderers.DrawingCanvas
    return (
      <div style={{
        border:`1.5px solid ${BRAND.line}`, borderRadius:6,
        background:BRAND.cream, padding:8,
      }}>
        <div style={{ fontSize:11, color:BRAND.inkMute, fontWeight:600, marginBottom:6, letterSpacing:'.05em', textTransform:'uppercase' }}>
          Sketch your answer below
        </div>
        <Canvas
          value={a.answerText || ''}
          onSave={(dataUrl) => !readOnly && onChange({ answerText: dataUrl })}
          readOnly={readOnly}
        />
      </div>
    )
  }

  // ── HANDWRITING (multi-page, uses portal-provided HandwritingCanvas) ──
  // The canvas's onSave returns a single combined PNG dataURL of all pages.
  if (type === 'handwriting' && renderers.HandwritingCanvas) {
    const Canvas = renderers.HandwritingCanvas
    return (
      <div style={{
        border:`1.5px solid ${BRAND.line}`, borderRadius:6,
        background:BRAND.cream, padding:8,
      }}>
        <div style={{ fontSize:11, color:BRAND.inkMute, fontWeight:600, marginBottom:6, letterSpacing:'.05em', textTransform:'uppercase' }}>
          Write your answer by hand (multi-page)
        </div>
        <Canvas
          value={a.answerText || null}
          onSave={(dataUrl) => !readOnly && onChange({ answerText: dataUrl })}
          readOnly={readOnly}
        />
      </div>
    )
  }

  // ── UPLOAD (uses portal-provided UploadInput, or falls back to plain file input) ──
  if (type === 'upload') {
    if (renderers.UploadInput) {
      const Uploader = renderers.UploadInput
      return (
        <Uploader
          value={a.answerText || ''}
          onChange={(url) => !readOnly && onChange({ answerText: url })}
          readOnly={readOnly}
        />
      )
    }
    // Fallback: plain file input that stores the filename. Without an
    // uploader the actual upload won't happen, but at least the field renders.
    return (
      <div style={{
        padding:'12px 14px',
        background:BRAND.goldPale, border:`1px dashed ${BRAND.gold}`, borderRadius:6,
        fontSize:12, color:BRAND.crimson,
      }}>
        File upload type — uploader not configured in this portal. Type a note here for now:
        <textarea
          value={a.answerText || ''}
          onChange={e => !readOnly && onChange({ answerText: e.target.value })}
          rows={2}
          readOnly={readOnly}
          style={{
            width:'100%', marginTop:6, boxSizing:'border-box',
            padding:'8px 10px',
            background:BRAND.white,
            border:`1px solid ${BRAND.line}`, borderRadius:4,
            fontSize:13, fontFamily:'inherit',
          }}
        />
      </div>
    )
  }

  // ── SHORT / LONG (and fallback for missing renderers) ──
  const rows = type === 'long' ? 6 : 3
  const placeholder =
    type === 'drawing'     ? 'Drawing canvas unavailable — describe your sketch here…' :
    type === 'handwriting' ? 'Handwriting canvas unavailable — type your answer here…' :
                             'Type your answer here…'
  return (
    <textarea
      value={a.answerText || ''}
      onChange={e => !readOnly && onChange({ answerText: e.target.value })}
      placeholder={readOnly ? '' : placeholder}
      rows={rows}
      readOnly={readOnly}
      style={{
        width:'100%', boxSizing:'border-box',
        padding:'10px 12px', resize:'vertical',
        background: readOnly ? '#F9FAFB' : BRAND.cream,
        border:`1.5px solid ${BRAND.line}`, borderRadius:6,
        fontSize:13, fontFamily:'inherit', color:BRAND.ink,
      }}
    />
  )
}

// ─────────────────────────────────────────────────────────
// Export helper to flatten answers map into the API payload shape
// expected by POST /exams/:id/submit
// ─────────────────────────────────────────────────────────
export const buildAnswersPayload = (answersMap) => {
  return Object.entries(answersMap || {}).map(([key, value]) => {
    const [questionRef, pathStr] = key.split('|')
    const partPath = pathStr ? pathStr.split('.').filter(s => s.length > 0).map(Number) : []
    return {
      questionRef,
      partPath,
      answerText: value.answerText || '',
      selectedOption: value.selectedOption || '',
    }
  }).filter(a => a.answerText || a.selectedOption)
}

// Default export bundles everything for convenience
export default {
  NestedQuestionEditor,
  NestedQuestionRenderer,
  NestedAnswerCollector,
  labelAt,
  walkLeaves,
  sumLeafMarks,
  buildAnswersPayload,
}
