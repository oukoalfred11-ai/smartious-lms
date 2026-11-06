/**
 * ExamReviewPanel.jsx — the Dean verifies a teacher's exam before
 * students see it. Lists exams awaiting verification; Review opens the
 * whole paper with its answers and marks, the paper and mark-scheme
 * PDFs, and two decisions: Publish to students, or Return to the teacher
 * with a note. Backed by /api/exams/review/queue, /:id/review,
 * /:id/approve and /:id/return.
 */
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'

const fmt = d => d ? new Date(d).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'
const name = u => u ? [u.firstName, u.lastName].filter(Boolean).join(' ') : '—'
const btn = (kind) => ({
  padding: '7px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  border: '1.5px solid ' + (kind === 'primary' ? TOKENS.crimson : kind === 'warn' ? '#FCA5A5' : TOKENS.line),
  background: kind === 'primary' ? TOKENS.crimson : '#fff',
  color: kind === 'primary' ? '#fff' : kind === 'warn' ? '#991B1B' : TOKENS.s700,
})

const answerText = (q) => {
  const a = q.correctAnswer
  if (a == null || a === '') return ''
  if (Array.isArray(a)) return a.join(', ')
  if (typeof a === 'object') return JSON.stringify(a)
  return String(a) + (q.unit ? ' ' + q.unit : '') + (q.tolerance ? ' (± ' + q.tolerance + ')' : '')
}

function QuestionView({ q, label, depth = 0 }) {
  const parts = Array.isArray(q.parts) ? q.parts : []
  const ans = answerText(q)
  const scheme = q.markScheme && (q.markScheme.modelAnswer || q.markScheme.answer || (Array.isArray(q.markScheme.points) ? q.markScheme.points.join('; ') : ''))
  return (
    <div style={{ padding: depth ? '8px 0 0 16px' : '12px 0', borderTop: depth ? 'none' : '1px solid ' + TOKENS.line }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
        <span style={{ fontWeight: 800, color: TOKENS.crimson, minWidth: 26 }}>{label}</span>
        <div style={{ flex: 1, fontSize: 13.5, color: TOKENS.s900, whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{q.questionText || q.text || ''}</div>
        {!parts.length && <span style={{ fontSize: 12, fontWeight: 700, color: TOKENS.s600, whiteSpace: 'nowrap' }}>[{q.marks || 0}]</span>}
      </div>
      {Array.isArray(q.options) && q.options.length > 0 && (
        <ol type="A" style={{ margin: '6px 0 0 36px', padding: 0, fontSize: 13, color: TOKENS.s700 }}>
          {q.options.map((o, i) => {
            const right = Array.isArray(q.correctAnswer) ? q.correctAnswer.map(String).includes(String(o)) : String(q.correctAnswer) === String(o)
            return <li key={i} style={{ fontWeight: right ? 800 : 400, color: right ? '#065F46' : undefined }}>{o}{right ? '  ✓' : ''}</li>
          })}
        </ol>
      )}
      {(ans && !(q.options || []).length) && <div style={{ margin: '6px 0 0 36px', fontSize: 12.5, color: '#065F46' }}><b>Answer:</b> {ans}</div>}
      {scheme && <div style={{ margin: '4px 0 0 36px', fontSize: 12.5, color: TOKENS.s600 }}><b>Mark scheme:</b> {scheme}</div>}
      {Array.isArray(q.attachments) && q.attachments.length > 0 && <div style={{ margin: '4px 0 0 36px', fontSize: 12, color: TOKENS.s500 }}>{q.attachments.length} attachment{q.attachments.length > 1 ? 's' : ''} (see the paper PDF)</div>}
      {parts.map((p, i) => <QuestionView key={i} q={p} label={'(' + String.fromCharCode(97 + i) + ')'} depth={depth + 1} />)}
    </div>
  )
}

export default function ExamReviewPanel({ toast, onDecided }) {
  const [queue, setQueue] = useState({ pending: [], recent: [] })
  const [open, setOpen] = useState(null)       // { exam, questions }
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [showRecent, setShowRecent] = useState(false)

  const load = useCallback(() => {
    api.get('/exams/review/queue')
      .then(r => setQueue({ pending: r.data?.data?.pending || [], recent: r.data?.data?.recent || [] }))
      .catch(() => {})
  }, [])
  useEffect(() => { load() }, [load])

  const review = async (e) => {
    setBusy(true); setNote('')
    try {
      const { data } = await api.get('/exams/' + e._id + '/review')
      setOpen(data.data)
    } catch (err) { toast?.error?.(err?.response?.data?.message || 'Could not open the exam.') }
    finally { setBusy(false) }
  }
  const pdf = async (kind) => {
    try {
      const r = await api.get('/exams/' + open.exam._id + '/' + kind + '.pdf', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }))
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch { toast?.error?.('Could not build the PDF.') }
  }
  const decide = async (outcome) => {
    if (outcome === 'return' && !note.trim()) { toast?.error?.('Write a note telling the teacher what to change.'); return }
    if (outcome === 'approve' && !window.confirm('Publish this exam to its students? They and their parents are notified by email.')) return
    setBusy(true)
    try {
      const { data } = await api.post('/exams/' + open.exam._id + '/' + outcome, { note: note.trim() })
      toast?.ok?.(data?.message || 'Done.')
      setOpen(null); load(); onDecided?.()
    } catch (err) { toast?.error?.(err?.response?.data?.message || 'Could not save the decision.') }
    finally { setBusy(false) }
  }

  if (open) {
    const ex = open.exam
    const students = (ex.assignedStudents || []).length
    return (
      <div className="card" style={{ padding: 20, marginBottom: 18 }}>
        <button onClick={() => setOpen(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: TOKENS.crimson, fontSize: 12.5, fontWeight: 700, padding: 0, marginBottom: 12 }}>← Back to the queue</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#B45309' }}>Awaiting verification</div>
            <h3 style={{ margin: '4px 0', fontSize: 19, color: TOKENS.s900 }}>{ex.title}</h3>
            <div style={{ fontSize: 13, color: TOKENS.s600 }}>
              {[ex.subject, ex.paperNumber, ex.curriculum, ex.grade].filter(Boolean).join(' · ')}<br />
              Set by <b>{name(ex.teacherId)}</b> · {fmt(ex.startAt)} · {ex.durationMins} min · {ex.totalQuestions} questions · {ex.totalMarks} marks · {students} student{students === 1 ? '' : 's'}{(ex.groupRoomIds || []).length ? ' + groups' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <button style={btn()} onClick={() => pdf('paper')}>Paper PDF</button>
            <button style={btn()} onClick={() => pdf('scheme')}>Mark scheme PDF</button>
          </div>
        </div>
        {ex.instructions && <div style={{ fontSize: 13, color: TOKENS.s700, background: TOKENS.cream || '#FBF6EA', padding: '10px 12px', borderRadius: 8, marginBottom: 10 }}><b>Instructions:</b> {ex.instructions}</div>}
        <div style={{ marginBottom: 16 }}>
          {(open.questions || []).length === 0
            ? <div style={{ padding: 20, color: TOKENS.s500 }}>No questions found on this exam.</div>
            : open.questions.map((q, i) => <QuestionView key={i} q={q} label={String(i + 1) + '.'} />)}
        </div>
        <div style={{ borderTop: '1px solid ' + TOKENS.line, paddingTop: 14 }}>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
            placeholder="Note to the teacher (needed to return the exam; optional when publishing)"
            style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1.5px solid ' + TOKENS.line, fontFamily: 'inherit', fontSize: 13, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button style={btn('primary')} disabled={busy} onClick={() => decide('approve')}>Verify and publish to students</button>
            <button style={btn('warn')} disabled={busy} onClick={() => decide('return')}>Return to teacher</button>
          </div>
        </div>
      </div>
    )
  }

  const { pending, recent } = queue
  return (
    <div className="card" style={{ padding: 0, marginBottom: 18, overflow: 'hidden', border: pending.length ? '1.5px solid #F59E0B' : undefined }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, background: pending.length ? '#FFFBEB' : undefined }}>
        <span style={{ fontWeight: 800, fontSize: 14, color: TOKENS.s900 }}>Awaiting your verification</span>
        <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 11.5, fontWeight: 800, background: pending.length ? '#F59E0B' : TOKENS.line, color: pending.length ? '#fff' : TOKENS.s600 }}>{pending.length}</span>
        <span style={{ flex: 1, fontSize: 12, color: TOKENS.s500 }}>Teachers' exams reach students only after you publish them.</span>
        {recent.length > 0 && <button style={btn()} onClick={() => setShowRecent(v => !v)}>{showRecent ? 'Hide' : 'Recent decisions'}</button>}
      </div>
      {pending.length === 0 && !showRecent && <div style={{ padding: '4px 16px 14px', fontSize: 12.5, color: TOKENS.s500 }}>Nothing waiting.</div>}
      {pending.map(e => {
        const late = new Date(e.startAt) < new Date()
        return (
          <div key={e._id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '10px 16px', borderTop: '1px solid ' + TOKENS.line }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: TOKENS.s900 }}>{e.title}</div>
              <div style={{ fontSize: 12, color: TOKENS.s600 }}>
                {[e.subject, e.paperNumber, e.grade].filter(Boolean).join(' · ')} · {name(e.teacherId)} · {e.totalQuestions} Qs / {e.totalMarks} marks ·{' '}
                <span style={{ color: late ? '#B91C1C' : undefined, fontWeight: late ? 700 : 400 }}>{fmt(e.startAt)}{late ? ' (time passed)' : ''}</span>
              </div>
            </div>
            <button style={btn('primary')} disabled={busy} onClick={() => review(e)}>Review</button>
          </div>
        )
      })}
      {showRecent && recent.map(e => (
        <div key={e._id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '9px 16px', borderTop: '1px solid ' + TOKENS.line, background: '#FAFAF9' }}>
          <div style={{ flex: 1, minWidth: 220, fontSize: 12.5, color: TOKENS.s700 }}>
            <b>{e.title}</b> · {name(e.teacherId)} · {e.approval?.status === 'approved' ? 'Published' : 'Returned'} by {name(e.approval?.reviewedBy)} {fmt(e.approval?.reviewedAt)}
            {e.approval?.note ? <div style={{ color: TOKENS.s500 }}>“{e.approval.note}”</div> : null}
          </div>
          <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 800, background: e.approval?.status === 'approved' ? '#D1FAE5' : '#FEE2E2', color: e.approval?.status === 'approved' ? '#065F46' : '#991B1B' }}>
            {e.approval?.status === 'approved' ? 'Published' : 'Returned'}
          </span>
        </div>
      ))}
    </div>
  )
}
