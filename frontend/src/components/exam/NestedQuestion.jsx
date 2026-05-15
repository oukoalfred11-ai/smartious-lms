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

import { useState, useEffect, useRef, useCallback } from 'react'

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
// AttachmentList — renders Cloudinary-hosted images/files
// attached to a question or part. Inline images render as
// thumbnails (click to enlarge); other files render as links.
// ─────────────────────────────────────────────────────────
export const AttachmentList = ({ attachments }) => {
  if (!Array.isArray(attachments) || attachments.length === 0) return null
  return (
    <div style={{
      display:'flex', flexWrap:'wrap', gap:8, marginTop:8,
    }}>
      {attachments.map((att, i) => {
        const isImage = (att.mimeType || '').startsWith('image/') ||
          /\.(jpe?g|png|gif|webp|svg)$/i.test(att.filename || att.url || '')
        if (isImage) {
          return (
            <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
              style={{
                display:'inline-block',
                border:`1px solid ${BRAND.line}`,
                borderRadius:6,
                overflow:'hidden',
                background:BRAND.white,
                lineHeight:0,
              }}
              title={att.filename || 'View full size'}
            >
              <img src={att.url} alt={att.filename || 'Attachment'}
                style={{
                  maxWidth:280, maxHeight:200,
                  display:'block', objectFit:'contain',
                }}
              />
            </a>
          )
        }
        return (
          <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
            style={{
              display:'inline-flex', alignItems:'center', gap:6,
              padding:'8px 12px',
              background:BRAND.cream, border:`1px solid ${BRAND.line}`,
              borderRadius:6,
              fontSize:12, color:BRAND.crimson, fontWeight:600,
              textDecoration:'none',
            }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            {att.filename || 'Attachment'}
          </a>
        )
      })}
    </div>
  )
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
                {Array.isArray(part.attachments) && part.attachments.length > 0 && (
                  <AttachmentList attachments={part.attachments} />
                )}
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
                {Array.isArray(part.attachments) && part.attachments.length > 0 && (
                  <AttachmentList attachments={part.attachments} />
                )}
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
  // Student must click "Save Drawing" inside the canvas UI for the dataURL
  // to be captured. We show a status badge to make that clear.
  if (type === 'drawing' && renderers.DrawingCanvas) {
    const Canvas = renderers.DrawingCanvas
    const hasAnswer = !!(a.answerText && a.answerText.length > 100)  // dataURLs are long
    return (
      <div style={{
        border:`1.5px solid ${BRAND.line}`, borderRadius:6,
        background:BRAND.cream, padding:8,
      }}>
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:8, gap:8,
        }}>
          <div style={{ fontSize:11, color:BRAND.inkMute, fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase' }}>
            Sketch your answer below
          </div>
          {hasAnswer ? (
            <div style={{
              display:'inline-flex', alignItems:'center', gap:4,
              background:'#DCFCE7', color:'#15803D',
              padding:'3px 8px', borderRadius:99,
              fontSize:10.5, fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase',
            }}>
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Saved
            </div>
          ) : (
            <div style={{
              display:'inline-flex', alignItems:'center', gap:4,
              background:'#FEF3C7', color:'#92400E',
              padding:'3px 8px', borderRadius:99,
              fontSize:10.5, fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase',
            }}>
              Click "Save Drawing" below
            </div>
          )}
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
    const hasAnswer = !!(a.answerText && a.answerText.length > 100)
    return (
      <div style={{
        border:`1.5px solid ${BRAND.line}`, borderRadius:6,
        background:BRAND.cream, padding:8,
      }}>
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:8, gap:8,
        }}>
          <div style={{ fontSize:11, color:BRAND.inkMute, fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase' }}>
            Write your answer by hand (multi-page)
          </div>
          {hasAnswer ? (
            <div style={{
              display:'inline-flex', alignItems:'center', gap:4,
              background:'#DCFCE7', color:'#15803D',
              padding:'3px 8px', borderRadius:99,
              fontSize:10.5, fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase',
            }}>
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Saved
            </div>
          ) : (
            <div style={{
              display:'inline-flex', alignItems:'center', gap:4,
              background:'#FEF3C7', color:'#92400E',
              padding:'3px 8px', borderRadius:99,
              fontSize:10.5, fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase',
            }}>
              Click "Save" in toolbar
            </div>
          )}
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

// ─────────────────────────────────────────────────────────
// AnnotationCanvas — teacher-side marking on student's drawing
// ─────────────────────────────────────────────────────────
// Loads the student's submitted image as a background, lets the
// teacher draw on top with a coloured pen (red / green / blue) for
// ticks, crosses, and circled errors. Saves a composited PNG dataURL.
//
// Returns a composited PNG dataURL containing the original drawing
// PLUS the teacher's strokes. Original is never modified server-side.
// ─────────────────────────────────────────────────────────
export const AnnotationCanvas = ({ backgroundImageUrl, existingAnnotation, onSave, onCancel }) => {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef(null)
  const bgImageRef = useRef(null)

  const [color, setColor] = useState('#DC2626')
  const [penSize, setPenSize] = useState(4)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 })
  const [loading, setLoading] = useState(true)
  const [tainted, setTainted] = useState(false)

  useEffect(() => {
    if (!backgroundImageUrl) { setLoading(false); return }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      bgImageRef.current = img
      const maxW = 1000
      const ratio = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1
      setCanvasSize({
        w: Math.round(img.naturalWidth * ratio),
        h: Math.round(img.naturalHeight * ratio),
      })
      setLoading(false)
    }
    img.onerror = () => {
      const fallback = new Image()
      fallback.onload = () => {
        bgImageRef.current = fallback
        setTainted(true)
        const maxW = 1000
        const ratio = fallback.naturalWidth > maxW ? maxW / fallback.naturalWidth : 1
        setCanvasSize({
          w: Math.round(fallback.naturalWidth * ratio),
          h: Math.round(fallback.naturalHeight * ratio),
        })
        setLoading(false)
      }
      fallback.onerror = () => { setLoading(false); bgImageRef.current = null }
      fallback.src = backgroundImageUrl
    }
    img.src = backgroundImageUrl
  }, [backgroundImageUrl])

  useEffect(() => {
    if (loading) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctxRef.current = ctx

    canvas.width = canvasSize.w
    canvas.height = canvasSize.h
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const drawBackground = () => {
      if (bgImageRef.current) {
        try { ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height) }
        catch (e) { console.error('[annotation] drawImage failed:', e.message) }
      }
    }

    if (existingAnnotation) {
      const prev = new Image()
      prev.onload = () => {
        ctx.drawImage(prev, 0, 0, canvas.width, canvas.height)
        try {
          const snap = ctx.getImageData(0, 0, canvas.width, canvas.height)
          setHistory([snap]); setHistoryIndex(0)
        } catch { setTainted(true) }
      }
      prev.onerror = () => {
        drawBackground()
        try {
          const snap = ctx.getImageData(0, 0, canvas.width, canvas.height)
          setHistory([snap]); setHistoryIndex(0)
        } catch { setTainted(true) }
      }
      prev.src = existingAnnotation
    } else {
      drawBackground()
      try {
        const snap = ctx.getImageData(0, 0, canvas.width, canvas.height)
        setHistory([snap]); setHistoryIndex(0)
      } catch { setTainted(true) }
    }
  }, [loading, canvasSize, existingAnnotation])

  const pushHistory = () => {
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    if (!ctx || !canvas) return
    try {
      const snap = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const nextHistory = history.slice(0, historyIndex + 1)
      nextHistory.push(snap)
      if (nextHistory.length > 20) nextHistory.shift()
      setHistory(nextHistory)
      setHistoryIndex(nextHistory.length - 1)
    } catch { setTainted(true) }
  }

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const point = e.touches ? e.touches[0] : e
    return {
      x: (point.clientX - rect.left) * scaleX,
      y: (point.clientY - rect.top) * scaleY,
    }
  }

  const handleStart = (e) => {
    e.preventDefault()
    isDrawingRef.current = true
    lastPointRef.current = getPos(e)
    const ctx = ctxRef.current
    ctx.strokeStyle = color
    ctx.lineWidth = penSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }
  const handleMove = (e) => {
    if (!isDrawingRef.current) return
    e.preventDefault()
    const pt = getPos(e)
    const ctx = ctxRef.current
    ctx.beginPath()
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
    ctx.lineTo(pt.x, pt.y)
    ctx.stroke()
    lastPointRef.current = pt
  }
  const handleEnd = () => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    pushHistory()
  }

  const undo = () => {
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    ctxRef.current.putImageData(history[newIndex], 0, 0)
    setHistoryIndex(newIndex)
  }
  const redo = () => {
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    ctxRef.current.putImageData(history[newIndex], 0, 0)
    setHistoryIndex(newIndex)
  }
  const clearAnnotations = () => {
    if (!window.confirm('Clear all annotations? (Background image stays.)')) return
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (bgImageRef.current) {
      try { ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height) }
      catch {}
    }
    pushHistory()
  }
  const doSave = () => {
    if (tainted) {
      window.alert(
        'Cannot save annotation: the student\'s image was loaded from a server without CORS. ' +
        'Configure CORS on the image host (Cloudinary) to allow cross-origin access, then re-open the annotation.'
      )
      return
    }
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png')
      onSave?.(dataUrl)
    } catch (e) {
      window.alert('Could not save annotation: ' + e.message)
    }
  }

  const COLORS = [
    { value: '#DC2626', label: 'Red',   bg: '#FEE2E2' },
    { value: '#15803D', label: 'Green', bg: '#DCFCE7' },
    { value: '#1D4ED8', label: 'Blue',  bg: '#DBEAFE' },
  ]
  const SIZES = [2, 4, 7, 10]

  if (loading) {
    return (
      <div style={{ padding:40, textAlign:'center', background: BRAND.cream, borderRadius:8 }}>
        <div className="mono" style={{ fontSize:12, color: BRAND.inkMute, letterSpacing:'.1em' }}>
          LOADING STUDENT'S DRAWING...
        </div>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {tainted && (
        <div style={{
          padding:'10px 14px',
          background: '#FEF3C7', border: '1px solid #D97706',
          borderRadius: 6, fontSize: 12, color: '#92400E',
        }}>
          <strong>CORS warning:</strong> the image came from a server that doesn't allow cross-origin access.
          You can draw on it but the annotation cannot be saved. Configure CORS on Cloudinary to fix.
        </div>
      )}

      <div style={{
        display:'flex', gap:14, alignItems:'center', flexWrap:'wrap',
        padding:'10px 12px',
        background: BRAND.cream, border:`1px solid ${BRAND.line}`,
        borderRadius:8,
      }}>
        <div style={{ display:'flex', gap:4, alignItems:'center' }}>
          <span style={{ fontSize:10.5, fontWeight:700, color:BRAND.inkMute, letterSpacing:'.05em', textTransform:'uppercase', marginRight:4 }}>Pen</span>
          {COLORS.map(c => (
            <button key={c.value}
              onClick={() => setColor(c.value)}
              title={c.label}
              style={{
                width:28, height:28, borderRadius:'50%',
                background: c.value,
                border:`3px solid ${color === c.value ? '#1A1A1A' : c.bg}`,
                cursor:'pointer', padding:0,
                transition:'transform .1s',
                transform: color === c.value ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        <div style={{ display:'flex', gap:4, alignItems:'center' }}>
          <span style={{ fontSize:10.5, fontWeight:700, color:BRAND.inkMute, letterSpacing:'.05em', textTransform:'uppercase', marginRight:4 }}>Size</span>
          {SIZES.map(s => (
            <button key={s}
              onClick={() => setPenSize(s)}
              style={{
                width:30, height:30,
                background: penSize === s ? BRAND.crimson : BRAND.white,
                color: penSize === s ? BRAND.white : BRAND.ink,
                border:`1px solid ${penSize === s ? BRAND.crimson : BRAND.line}`,
                borderRadius:6, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
              <div style={{
                width: s, height: s, borderRadius:'50%',
                background: penSize === s ? BRAND.white : BRAND.ink,
              }}/>
            </button>
          ))}
        </div>

        <div style={{ display:'flex', gap:4, marginLeft:'auto' }}>
          <button onClick={undo} disabled={historyIndex <= 0}
            style={{
              padding:'6px 10px', background:BRAND.white,
              border:`1px solid ${BRAND.line}`, borderRadius:6,
              cursor: historyIndex <= 0 ? 'not-allowed' : 'pointer',
              fontSize:11, fontWeight:600, color:BRAND.ink,
              opacity: historyIndex <= 0 ? .4 : 1,
            }}>Undo</button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1}
            style={{
              padding:'6px 10px', background:BRAND.white,
              border:`1px solid ${BRAND.line}`, borderRadius:6,
              cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer',
              fontSize:11, fontWeight:600, color:BRAND.ink,
              opacity: historyIndex >= history.length - 1 ? .4 : 1,
            }}>Redo</button>
          <button onClick={clearAnnotations}
            style={{
              padding:'6px 10px', background:'#FEE2E2',
              border:'1px solid #FCA5A5', borderRadius:6,
              cursor:'pointer', fontSize:11, fontWeight:600, color:'#B91C1C',
            }}>Clear</button>
        </div>
      </div>

      <div style={{
        background: BRAND.white,
        border:`2px solid ${BRAND.line}`, borderRadius:8,
        overflow:'auto', maxHeight:'70vh',
        display:'flex', justifyContent:'center',
      }}>
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          style={{
            cursor:'crosshair', touchAction:'none',
            display:'block', maxWidth:'100%', height:'auto',
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>

      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
        {onCancel && (
          <button onClick={onCancel}
            style={{
              padding:'10px 18px', background:BRAND.white,
              border:`1.5px solid ${BRAND.line}`, borderRadius:6,
              cursor:'pointer', fontSize:13, fontWeight:700, color:BRAND.ink,
            }}>Cancel</button>
        )}
        <button onClick={doSave} disabled={tainted}
          style={{
            padding:'10px 22px',
            background: tainted ? '#9CA3AF' : BRAND.crimson,
            color:BRAND.white, border:'none', borderRadius:6,
            cursor: tainted ? 'not-allowed' : 'pointer',
            fontSize:13, fontWeight:700,
          }}>Save Annotation</button>
      </div>
    </div>
  )
}

// Default export bundles everything for convenience
export default {
  NestedQuestionEditor,
  NestedQuestionRenderer,
  NestedAnswerCollector,
  AnnotationCanvas,
  AttachmentList,
  labelAt,
  walkLeaves,
  sumLeafMarks,
  buildAnswersPayload,
}
