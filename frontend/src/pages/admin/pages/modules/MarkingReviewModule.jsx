import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { PCard } from '../shared/ui.jsx'

/**
 * MarkingReviewModule
 * ------------------------------------------------------------
 * A teacher accepts or overrides each AI-suggested mark. The mark the
 * student sees is always the teacher's, never the model's.
 *
 * The design point: an override is not a correction to one answer, it
 * is a correction to the QUESTION. These questions recur for years, so
 * the agreement rate and drift are shown beside every answer to make
 * that visible — a question the AI over-marks by exactly one every
 * time is telling you precisely what its mark scheme should say.
 */
export default function MarkingReviewModule({ toast }) {
  const [queue, setQueue]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [openId, setOpenId]     = useState(null)
  const [detail, setDetail]     = useState(null)
  const [busy, setBusy]         = useState(false)
  const [drafts, setDrafts]     = useState({})   // answerIndex -> { marks, feedback, note }

  const loadQueue = useCallback(() => {
    setLoading(true)
    api.get('/ai-review/queue')
      .then(r => setQueue(r.data?.data?.submissions || []))
      .catch(() => toast?.error?.('Could not load the review queue.'))
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => { loadQueue() }, [loadQueue])

  const openSubmission = async (id) => {
    setOpenId(id); setDetail(null); setDrafts({})
    try {
      const r = await api.get('/ai-review/submissions/' + id)
      const d = r.data?.data
      setDetail(d)
      // Pre-fill each field with the AI's figure, so accepting is one click
      // and overriding is an edit rather than a fresh entry.
      const pre = {}
      ;(d?.answers || []).forEach((a, i) => {
        if (a.aiSuggestion?.markedAt && !a.aiSuggestion?.reviewed) {
          pre[i] = { marks: String(a.aiSuggestion.marksAwarded ?? ''),
                     feedback: a.aiSuggestion.feedback || '', note: '' }
        }
      })
      setDrafts(pre)
    } catch { toast?.error?.('Could not open that submission.') }
  }

  const submitReview = async (idx, accepted) => {
    const d = drafts[idx]
    if (!d || d.marks === '') { toast?.error?.('Enter a mark first.'); return }
    setBusy(true)
    try {
      const r = await api.post(`/ai-review/submissions/${openId}/answers/${idx}/review`, {
        finalMarks: Number(d.marks), feedback: d.feedback, note: d.note,
      })
      const res = r.data?.data || {}
      toast?.ok?.(r.data?.message || 'Recorded.')
      if (res.learning?.readyToPromote) {
        toast?.ok?.('This question now has enough consistent history to be given a real mark scheme.')
      }
      await openSubmission(openId)
      if (res.remaining === 0) { setOpenId(null); setDetail(null); loadQueue() }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not save that review.')
    }
    setBusy(false)
  }

  const set = (idx, key, val) =>
    setDrafts(p => ({ ...p, [idx]: { ...(p[idx] || { marks:'', feedback:'', note:'' }), [key]: val } }))

  const confBadge = (c) => {
    const map = { high:['#065F46','#ECFDF5'], medium:['#8A6414','#FBF6EA'], low:['#8B1A2E','#FDF4F5'] }
    const [fg,bg] = map[c] || ['#6B6B6B','#F3F3F3']
    return <span style={{ fontSize:10, fontWeight:800, letterSpacing:'.06em', textTransform:'uppercase',
      padding:'2px 8px', borderRadius:99, color:fg, background:bg }}>{c || 'unknown'} confidence</span>
  }

  // ── QUEUE ──
  if (!openId) return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:TOKENS.s900 }}>Marking review</h2>
          <p style={{ margin:'4px 0 0', fontSize:13, color:TOKENS.s500 }}>
            The AI suggests, you decide. Nothing reaches a student until you accept it.
          </p>
        </div>
        <button onClick={loadQueue} style={{ padding:'8px 16px', borderRadius:8, border:`1.5px solid ${TOKENS.s100 || '#E8E0D0'}`,
          background:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', color:TOKENS.s700 }}>Refresh</button>
      </div>

      {loading && <PCard><div style={{ padding:22, textAlign:'center', color:TOKENS.s500, fontSize:13.5 }}>Loading…</div></PCard>}

      {!loading && queue.length === 0 && (
        <PCard>
          <div style={{ padding:34, textAlign:'center' }}>
            <div style={{ fontSize:15, fontWeight:700, color:TOKENS.s900, marginBottom:6 }}>Nothing waiting</div>
            <div style={{ fontSize:13, color:TOKENS.s500, maxWidth:460, margin:'0 auto', lineHeight:1.6 }}>
              When AI marking runs over a submission, it appears here for your approval.
            </div>
          </div>
        </PCard>
      )}

      {!loading && queue.map(s => (
        <PCard key={s._id} style={{ marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontSize:15, fontWeight:700, color:TOKENS.s900 }}>{s.student}</div>
              <div style={{ fontSize:12, color:TOKENS.s500 }}>
                {[s.grade, s.subject].filter(Boolean).join(' · ')}
              </div>
            </div>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              <Pill label={`${s.pendingCount} to review`} tone="crimson" />
              {s.lowConfidence > 0 && <Pill label={`${s.lowConfidence} low confidence`} tone="warn" />}
              {s.schemeless   > 0 && <Pill label={`${s.schemeless} no scheme`} tone="mute" />}
            </div>
            <button onClick={() => openSubmission(s._id)} style={{ padding:'9px 18px', borderRadius:8, border:'none',
              background:TOKENS.crimson, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>Review</button>
          </div>
        </PCard>
      ))}
    </div>
  )

  // ── DETAIL ──
  const pending = (detail?.answers || []).map((a,i) => ({ a, i }))
    .filter(x => x.a.aiSuggestion?.markedAt && !x.a.aiSuggestion?.reviewed)

  return (
    <div>
      <button onClick={() => { setOpenId(null); setDetail(null); loadQueue() }}
        style={{ background:'none', border:'none', color:TOKENS.crimson, fontSize:13, fontWeight:700,
                 cursor:'pointer', padding:0, marginBottom:14 }}>← Back to the queue</button>

      {!detail && <PCard><div style={{ padding:22, textAlign:'center', color:TOKENS.s500 }}>Loading…</div></PCard>}

      {detail && (
        <>
          <PCard style={{ marginBottom:14 }}>
            <div style={{ fontSize:17, fontWeight:800, color:TOKENS.s900 }}>{detail.student}</div>
            <div style={{ fontSize:12.5, color:TOKENS.s500, marginTop:3 }}>
              {[detail.grade, detail.subject, detail.homeworkTitle].filter(Boolean).join(' · ')}
              {' · '}{pending.length} answer{pending.length===1?'':'s'} awaiting your decision
            </div>
          </PCard>

          {pending.length === 0 && (
            <PCard><div style={{ padding:30, textAlign:'center', color:TOKENS.s500, fontSize:13.5 }}>
              Every suggestion on this submission has been reviewed.
            </div></PCard>
          )}

          {pending.map(({ a, i }) => {
            const s = a.aiSuggestion || {}
            const L = a.learning || {}
            const d = drafts[i] || { marks:'', feedback:'', note:'' }
            const outOf = a.question?.marks ?? '?'
            const changed = String(s.marksAwarded) !== String(d.marks)
            return (
              <PCard key={i} style={{ marginBottom:14 }}>
                {/* question */}
                <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase',
                              color:TOKENS.s400, marginBottom:6 }}>
                  Question {a.questionIndex + 1} · {outOf} mark{outOf===1?'':'s'}
                  {a.question?.subtopic ? ` · ${a.question.subtopic}` : ''}
                </div>
                <div style={{ fontSize:14, color:TOKENS.s900, lineHeight:1.6, whiteSpace:'pre-wrap', marginBottom:14 }}>
                  {a.question?.questionText || '(question text unavailable)'}
                </div>

                {/* student answer */}
                <Block title="Student's answer">
                  <div style={{ whiteSpace:'pre-wrap', fontSize:13.5, color:TOKENS.s900, lineHeight:1.6 }}>
                    {typeof a.answer === 'string' && a.answer.trim() ? a.answer : <em style={{ color:TOKENS.s400 }}>No answer given</em>}
                  </div>
                </Block>

                {/* what the AI did */}
                <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', margin:'14px 0 8px' }}>
                  <div style={{ fontSize:22, fontWeight:800, color:TOKENS.crimson }}>
                    {s.marksAwarded} <span style={{ fontSize:13, color:TOKENS.s500, fontWeight:600 }}>/ {outOf}</span>
                  </div>
                  {confBadge(s.confidence)}
                  {s.schemeless && <Pill label="no mark scheme — marked from subject knowledge" tone="mute" />}
                </div>
                {s.feedback && (
                  <div style={{ fontSize:13, color:TOKENS.s700, lineHeight:1.6, marginBottom:12 }}>{s.feedback}</div>
                )}

                {s.assumedScheme && (
                  <Block title="Marking points the AI assumed" tone="gold">
                    <div style={{ whiteSpace:'pre-wrap', fontSize:12.5, color:TOKENS.s700, lineHeight:1.7,
                                  fontFamily:'ui-monospace, monospace' }}>{s.assumedScheme}</div>
                  </Block>
                )}

                {/* history on this question */}
                {L.reviews > 0 && (
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap', margin:'12px 0' }}>
                    <Stat label="Reviews" value={L.reviews} />
                    <Stat label="Agreement" value={L.agreementRate === null ? '—' : L.agreementRate + '%'}
                          tone={L.agreementRate >= 80 ? 'good' : L.agreementRate >= 50 ? 'warn' : 'bad'} />
                    <Stat label="Average drift" value={(L.averageDelta > 0 ? '+' : '') + L.averageDelta}
                          tone={Math.abs(L.averageDelta) < 0.3 ? 'good' : 'warn'}
                          hint={L.averageDelta > 0 ? 'marks high' : L.averageDelta < 0 ? 'marks low' : 'accurate'} />
                    <Stat label="Times marked" value={L.timesMarked} />
                  </div>
                )}

                {L.teacherNotes?.length > 0 && (
                  <Block title="Notes left by teachers on this question">
                    <ul style={{ margin:0, paddingLeft:18, fontSize:12.5, color:TOKENS.s700, lineHeight:1.7 }}>
                      {L.teacherNotes.slice(-4).map((n, k) => <li key={k}>{n}</li>)}
                    </ul>
                  </Block>
                )}

                {/* the decision */}
                <div style={{ borderTop:`1px solid ${TOKENS.s100 || '#EFE7D8'}`, marginTop:16, paddingTop:16 }}>
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
                    <Field label={`Final mark (out of ${outOf})`} width={140}>
                      <input type="number" min={0} max={typeof outOf === 'number' ? outOf : undefined}
                        value={d.marks} onChange={e => set(i, 'marks', e.target.value)}
                        style={inp} />
                    </Field>
                    <Field label="Feedback to the student" grow>
                      <input value={d.feedback} onChange={e => set(i, 'feedback', e.target.value)} style={inp} />
                    </Field>
                  </div>
                  <Field label="Note for the mark scheme — why the AI was wrong, if it was" style={{ marginTop:12 }}>
                    <input value={d.note} onChange={e => set(i, 'note', e.target.value)} style={inp}
                      placeholder="e.g. do not credit the formula alone without substitution" />
                  </Field>
                  <div style={{ display:'flex', gap:9, marginTop:14, flexWrap:'wrap', alignItems:'center' }}>
                    <button disabled={busy} onClick={() => submitReview(i, !changed)}
                      style={{ padding:'10px 20px', borderRadius:8, border:'none',
                               background: busy ? '#C96773' : (changed ? TOKENS.crimson : '#065F46'),
                               color:'#fff', fontSize:13, fontWeight:700, cursor: busy ? 'not-allowed' : 'pointer' }}>
                      {busy ? 'Saving…' : changed ? 'Save adjusted mark' : 'Accept this mark'}
                    </button>
                    {changed && (
                      <span style={{ fontSize:12, color:TOKENS.s500 }}>
                        You are overriding {s.marksAwarded} → {d.marks}. The correction is kept against this question.
                      </span>
                    )}
                  </div>
                </div>
              </PCard>
            )
          })}
        </>
      )}
    </div>
  )
}

/* ── small presentational helpers ── */
const inp = {
  width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #E8E0D0',
  fontSize:13.5, boxSizing:'border-box', color:'#1a1a1a', background:'#fff',
}

function Field({ label, children, width, grow, style = {} }) {
  return (
    <div style={{ width: width || (grow ? undefined : '100%'), flex: grow ? '1 1 220px' : undefined, ...style }}>
      <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:'.08em', textTransform:'uppercase',
                    color:'#8A93A3', marginBottom:5 }}>{label}</div>
      {children}
    </div>
  )
}

function Block({ title, children, tone }) {
  const bg = tone === 'gold' ? '#FBF6EA' : '#FBF9F4'
  const bd = tone === 'gold' ? '#E8D9AE' : '#EFE7D8'
  return (
    <div style={{ background:bg, border:`1px solid ${bd}`, borderRadius:9, padding:'12px 14px', marginTop:10 }}>
      <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase',
                    color:'#8A6414', marginBottom:7 }}>{title}</div>
      {children}
    </div>
  )
}

function Stat({ label, value, tone, hint }) {
  const c = tone === 'good' ? '#065F46' : tone === 'warn' ? '#8A6414' : tone === 'bad' ? '#8B1A2E' : '#1a1a1a'
  return (
    <div style={{ border:'1px solid #EFE7D8', borderRadius:9, padding:'9px 13px', minWidth:96, background:'#fff' }}>
      <div style={{ fontSize:9.5, fontWeight:800, letterSpacing:'.08em', textTransform:'uppercase', color:'#8A93A3' }}>{label}</div>
      <div style={{ fontSize:16, fontWeight:800, color:c, marginTop:2 }}>{value}</div>
      {hint && <div style={{ fontSize:10, color:'#8A93A3', marginTop:1 }}>{hint}</div>}
    </div>
  )
}

function Pill({ label, tone }) {
  const map = { crimson:['#8B1A2E','#FDF4F5'], warn:['#8A6414','#FBF6EA'], mute:['#4A5261','#F3F3F3'] }
  const [fg,bg] = map[tone] || map.mute
  return <span style={{ fontSize:10.5, fontWeight:700, padding:'3px 9px', borderRadius:99, color:fg, background:bg }}>{label}</span>
}
