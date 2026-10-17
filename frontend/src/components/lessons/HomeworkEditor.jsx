/**
 * HomeworkEditor.jsx — the homework a lesson sends when it is closed as
 * taught. The teacher sees the exact questions, and can add (from the
 * question bank or their own), edit and delete them, or turn homework
 * off for the lesson. Every change saves straight away.
 *
 *  <HomeworkEditor classId toast />
 */
import { useCallback, useEffect, useState } from 'react'
import { api } from '../../context/ctx.jsx'

const C = { crimson: '#7D1025', line: '#E5DFD3', ink: '#1F2937', mut: '#6B7280', bg: '#FBF8F3', green: '#15803D', amber: '#B45309', red: '#B91C1C' }
const btn = (primary, extra) => ({ border: primary ? 'none' : `1px solid ${C.line}`, background: primary ? C.crimson : '#fff', color: primary ? '#fff' : C.ink, borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', ...extra })
const field = { width: '100%', boxSizing: 'border-box', border: `1px solid ${C.line}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', color: C.ink }
const TYPE_LABEL = { mcq: 'Multiple choice', short: 'Short answer', long: 'Long answer', drawing: 'Drawing', handwriting: 'Handwritten', upload: 'Upload' }
const blankQ = () => ({ type: 'short', questionText: '', options: ['', '', '', ''], correctAnswer: null, marks: 1, explanation: '' })

function QuestionForm({ initial, onSave, onCancel, busy }) {
  const [q, setQ] = useState(() => ({ ...blankQ(), ...initial, options: (initial?.options?.length ? [...initial.options] : ['', '', '', '']) }))
  const set = (k, v) => setQ(x => ({ ...x, [k]: v }))
  const correctIx = typeof q.correctAnswer === 'number' ? q.correctAnswer : q.options.indexOf(q.correctAnswer)
  return (
    <div style={{ display: 'grid', gap: 8, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12, color: C.mut, flex: '1 1 160px' }}>Type
          <select style={field} value={q.type} onChange={e => set('type', e.target.value)}>
            {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label style={{ fontSize: 12, color: C.mut, width: 90 }}>Marks
          <input type="number" min="1" max="50" style={field} value={q.marks} onChange={e => set('marks', e.target.value)} />
        </label>
      </div>
      <label style={{ fontSize: 12, color: C.mut }}>Question
        <textarea style={{ ...field, minHeight: 70 }} value={q.questionText} onChange={e => set('questionText', e.target.value)} maxLength={5000} autoFocus />
      </label>
      {q.type === 'mcq' && (
        <div style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, color: C.mut }}>Options — tick the correct one</span>
          {q.options.map((o, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="radio" name="correct" checked={correctIx === i} onChange={() => set('correctAnswer', i)} title="Correct answer" />
              <input style={field} value={o} placeholder={`Option ${String.fromCharCode(65 + i)}`}
                onChange={e => set('options', q.options.map((x, j) => (j === i ? e.target.value : x)))} />
              {q.options.length > 2 && <button type="button" style={btn(false, { padding: '4px 9px', color: C.red })}
                onClick={() => setQ(x => ({ ...x, options: x.options.filter((_, j) => j !== i), correctAnswer: correctIx === i ? null : (correctIx > i ? correctIx - 1 : correctIx) }))}>×</button>}
            </div>
          ))}
          {q.options.length < 8 && <button type="button" style={btn(false, { justifySelf: 'start', padding: '4px 10px', fontSize: 12 })} onClick={() => set('options', [...q.options, ''])}>+ Option</button>}
        </div>
      )}
      {q.type !== 'mcq' && (
        <label style={{ fontSize: 12, color: C.mut }}>Model answer (for marking, optional)
          <textarea style={{ ...field, minHeight: 44 }} value={q.correctAnswer == null ? '' : String(q.correctAnswer)} onChange={e => set('correctAnswer', e.target.value)} />
        </label>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" style={btn(true)} disabled={busy || !q.questionText.trim()} onClick={() => {
          const out = { ...q, options: q.type === 'mcq' ? q.options.map(o => o.trim()).filter(Boolean) : [] }
          if (q.type === 'mcq') {
            const text = q.options[correctIx]
            out.correctAnswer = text != null ? out.options.indexOf(text.trim()) : null
          }
          onSave(out)
        }}>{busy ? 'Saving…' : 'Save question'}</button>
        <button type="button" style={btn(false)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

function BankSearch({ classId, have, onAdd, onClose }) {
  const [q, setQ] = useState('')
  const [list, setList] = useState(null)
  const search = useCallback((text) => {
    setList(null)
    api.get(`/liveclasses/${classId}/homework/bank`, { params: { q: text } })
      .then(r => setList(r.data?.data?.questions || [])).catch(() => setList([]))
  }, [classId])
  useEffect(() => { search('') }, [search])
  const haveIds = new Set(have.map(x => String(x.questionId || '')).filter(Boolean))
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: 12, display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input style={field} value={q} onChange={e => setQ(e.target.value)} placeholder="Search the question bank (this lesson's questions are shown first)"
          onKeyDown={e => { if (e.key === 'Enter') search(q) }} />
        <button type="button" style={btn(true)} onClick={() => search(q)}>Search</button>
        <button type="button" style={btn(false)} onClick={onClose}>Done</button>
      </div>
      {list === null && <div style={{ fontSize: 12, color: C.mut }}>Searching…</div>}
      {list && !list.length && <div style={{ fontSize: 12, color: C.mut }}>No questions found. Try another word, or write your own.</div>}
      <div style={{ display: 'grid', gap: 6, maxHeight: 300, overflow: 'auto' }}>
        {(list || []).map(x => {
          const added = haveIds.has(String(x.questionId))
          return (
            <div key={x.questionId} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ flex: 1, fontSize: 13, color: C.ink, whiteSpace: 'pre-wrap' }}>
                {x.questionText}
                <div style={{ fontSize: 11, color: C.mut, marginTop: 2 }}>{TYPE_LABEL[x.type] || x.type} · {x.marks} mark{x.marks > 1 ? 's' : ''}{x.topic ? ` · ${x.topic}` : ''}</div>
              </div>
              <button type="button" disabled={added} style={btn(!added, { padding: '4px 10px', fontSize: 12 })} onClick={() => onAdd(x)}>{added ? 'Added' : 'Add'}</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function HomeworkEditor({ classId, toast }) {
  const [hw, setHw] = useState(null)
  const [err, setErr] = useState('')
  const [editing, setEditing] = useState(null)   // index, or 'new'
  const [bank, setBank] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    setErr('')
    api.get(`/liveclasses/${classId}/homework`).then(r => setHw(r.data?.data || null))
      .catch(e => setErr(e?.response?.data?.message || 'Could not load the homework.'))
  }, [classId])
  useEffect(() => { load() }, [load])

  const save = async (body, okMsg) => {
    setBusy(true)
    try {
      const r = await api.put(`/liveclasses/${classId}/homework`, body)
      setHw(r.data?.data || hw)
      if (okMsg) toast?.ok?.(okMsg)
      return true
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not save the homework.'); return false }
    finally { setBusy(false) }
  }
  const setQuestions = (questions, msg) => save({ questions }, msg)
  const rebuild = async () => {
    if (!window.confirm('Replace this list with a fresh selection from the question bank?')) return
    setBusy(true)
    try { const r = await api.post(`/liveclasses/${classId}/homework/reset`); setHw(r.data?.data); toast?.ok?.('New selection made.') }
    catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not rebuild.') }
    finally { setBusy(false) }
  }

  if (err) return <div style={{ fontSize: 13, color: C.red }}>{err} <button type="button" style={btn(false, { padding: '3px 10px', fontSize: 12 })} onClick={load}>Retry</button></div>
  if (!hw) return <div style={{ fontSize: 13, color: C.mut }}>Loading the homework…</div>

  if (hw.sent) return (
    <div style={{ fontSize: 13, color: C.green, background: '#EDF7EF', borderRadius: 10, padding: '10px 12px' }}>
      Homework has already been sent for this lesson. {hw.sentNote}
    </div>
  )

  const qs = hw.questions || []
  const total = qs.reduce((s, q) => s + (Number(q.marks) || 1), 0)
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5, fontWeight: 700, color: C.ink }}>
        <input type="checkbox" checked={hw.enabled} disabled={busy}
          onChange={e => save({ enabled: e.target.checked }, e.target.checked ? 'Homework is on for this lesson.' : 'Homework is off for this lesson.')} />
        Send homework when this lesson is closed as taught
      </label>
      {!hw.enabled && <div style={{ fontSize: 12.5, color: C.mut }}>No homework will be sent for this lesson.</div>}
      {hw.enabled && (<>
        <div style={{ fontSize: 12.5, color: C.mut }}>
          {qs.length} question{qs.length === 1 ? '' : 's'} · {total} mark{total === 1 ? '' : 's'}{hw.lesson ? ` · ${hw.lesson}` : ''}. Every student in this lesson receives exactly these questions, due in 48 hours.
        </div>
        {hw.stale && <div style={{ fontSize: 12.5, color: C.amber, background: '#FEF3C7', borderRadius: 8, padding: '7px 10px' }}>
          This lesson now teaches a different topic from the one you edited this list for. <button type="button" style={btn(false, { padding: '2px 9px', fontSize: 12 })} onClick={rebuild}>Make a new selection</button>
        </div>}
        {!qs.length && <div style={{ fontSize: 13, color: C.amber }}>The question bank has nothing for this lesson yet. Add questions below, or the students get no homework.</div>}
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
          {qs.map((q, i) => (
            <li key={i} style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 10, padding: '9px 12px' }}>
              {editing === i ? (
                <QuestionForm initial={q} busy={busy} onCancel={() => setEditing(null)} onSave={async (nq) => {
                  // An edited bank question becomes the teacher's own copy;
                  // the bank itself is never changed from here.
                  const changed = nq.questionText !== q.questionText || JSON.stringify(nq.options) !== JSON.stringify(q.options) || String(nq.correctAnswer) !== String(q.correctAnswer) || nq.type !== q.type
                  const next = qs.map((x, j) => (j === i ? { ...x, ...nq, questionId: changed ? null : x.questionId } : x))
                  if (await setQuestions(next, 'Question updated.')) setEditing(null)
                }} />
              ) : (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <b style={{ fontSize: 13, color: C.crimson, minWidth: 22 }}>{i + 1}.</b>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: C.ink, whiteSpace: 'pre-wrap' }}>{q.questionText}</div>
                    {q.type === 'mcq' && (q.options || []).length > 0 && (
                      <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: 12.5, color: C.mut }}>
                        {q.options.map((o, j) => {
                          const right = typeof q.correctAnswer === 'number' ? q.correctAnswer === j : String(q.correctAnswer) === o
                          return <li key={j} style={{ color: right ? C.green : C.mut, fontWeight: right ? 700 : 400 }}>{o}{right ? ' ✓' : ''}</li>
                        })}
                      </ul>
                    )}
                    <div style={{ fontSize: 11, color: C.mut, marginTop: 3 }}>
                      {TYPE_LABEL[q.type] || q.type} · {q.marks || 1} mark{(q.marks || 1) > 1 ? 's' : ''}{q._isReview ? ' · review from an earlier lesson' : ''}{!q.questionId ? ' · your question' : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    <button type="button" style={btn(false, { padding: '4px 10px', fontSize: 12 })} onClick={() => { setEditing(i); setBank(false) }}>Edit</button>
                    <button type="button" style={btn(false, { padding: '4px 10px', fontSize: 12, color: C.red, borderColor: '#FCA5A5' })} disabled={busy}
                      onClick={() => setQuestions(qs.filter((_, j) => j !== i), 'Question removed.')}>Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
        {editing === 'new' && (
          <QuestionForm initial={blankQ()} busy={busy} onCancel={() => setEditing(null)}
            onSave={async (nq) => { if (await setQuestions([...qs, { ...nq, questionId: null }], 'Question added.')) setEditing(null) }} />
        )}
        {bank && <BankSearch classId={classId} have={qs} onClose={() => setBank(false)}
          onAdd={(x) => setQuestions([...qs, x], 'Question added.')} />}
        {editing === null && !bank && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" style={btn(false)} onClick={() => setBank(true)}>+ Add from question bank</button>
            <button type="button" style={btn(false)} onClick={() => setEditing('new')}>+ Write my own question</button>
            <button type="button" style={btn(false, { color: C.mut })} disabled={busy} onClick={rebuild}>New selection</button>
          </div>
        )}
      </>)}
    </div>
  )
}
