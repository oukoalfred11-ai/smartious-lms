/**
 * SessionReview — a teacher (or admin / Dean) reads a student's lab work,
 * sees the automatic checks next to what the student's own data give,
 * and marks it or returns it for correction. The server re-checks access
 * and recomputes the automatic marks; this page only collects the teacher's.
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, useToast } from '../context/ctx.jsx'
import useLabSession from './useLabSession.js'
import View2D from './views2d.jsx'
import { DataTables, Graph, Notebook, Questions, RubricTable, STATUS_LABEL, SimulationNotice, openReport } from './panels.jsx'

function MarkForm({ session, def, onDone }) {
  const toast = useToast()
  const rows = session.markedRows || session.autoGrade?.rows || []
  const [marks, setMarks] = useState(() => Object.fromEntries(rows.map(r => [r.id, r.marks == null ? '' : String(r.marks)])))
  const [feedback, setFeedback] = useState(session.feedback || '')
  const [busy, setBusy] = useState(false)
  const total = rows.reduce((a, r) => a + (Number(marks[r.id]) || 0), 0)
  const max = rows.reduce((a, r) => a + r.max, 0)

  const send = async (action) => {
    setBusy(true)
    try {
      const body = { action, feedback, marks: Object.fromEntries(Object.entries(marks).filter(([, v]) => v !== '')) }
      const { data } = await api.post('/lab/sessions/' + session._id + '/mark', body)
      toast.ok(data.message || 'Saved.')
      onDone()
    } catch (e) { toast.error(e?.response?.data?.message || 'Could not save the marks.') }
    finally { setBusy(false) }
  }
  if (!rows.length) return <p className="lab-help">This work has not been submitted yet, so it cannot be marked.</p>
  return (
    <form className="lab-markform" onSubmit={e => { e.preventDefault(); send('mark') }}>
      <table className="lab-table">
        <thead><tr><th>Criterion</th><th>Automatic check</th><th>Marks</th></tr></thead>
        <tbody>{rows.map(r => {
          const g = def.rubric.find(x => x.id === r.id)
          return (
            <tr key={r.id}>
              <td>{r.label}{!r.auto && g?.guidance && <div className="lab-help">{g.guidance}</div>}</td>
              <td>{r.auto ? (session.autoGrade.rows.find(x => x.id === r.id)?.marks ?? '—') + ' / ' + r.max + ' · ' + (r.detail || '') : 'Teacher marks this'}</td>
              <td><input inputMode="decimal" aria-label={'Marks for ' + r.label} value={marks[r.id]} onChange={e => setMarks(m => ({ ...m, [r.id]: e.target.value }))} size="4" /> / {r.max}</td>
            </tr>
          )
        })}</tbody>
      </table>
      <p>Total: <b>{total} / {max}</b> <span className="lab-help">(whole or half marks; you may change an automatic mark if you disagree with it)</span></p>
      <label htmlFor="fb"><b>Feedback to the student</b></label>
      <textarea id="fb" rows={4} value={feedback} onChange={e => setFeedback(e.target.value)} maxLength={10000} />
      <div className="lab-row">
        <button type="submit" className="lab-btn primary" disabled={busy}>Save marks</button>
        <button type="button" className="lab-btn ghost" disabled={busy || !feedback.trim()} onClick={() => send('return')} title={feedback.trim() ? '' : 'Write what the student should correct first'}>Return for correction</button>
      </div>
    </form>
  )
}

function ReviewBody({ sessionId, onReload }) {
  const toast = useToast()
  const lab = useLabSession({ sessionId, readOnly: true })
  const { def, session, view, state, params } = lab
  const tables = useMemo(() => (def && params && state ? def.dataTables(params, state) : []), [def, params, state])
  const graph = useMemo(() => (def && params && state ? def.graph(params, state) : null), [def, params, state])
  const expected = useMemo(() => (def && params && state ? def.expected({ params, state, answers: lab.answers }) : null), [def, params, state, lab.answers])

  if (lab.loadError) return <p className="lab-error" role="alert">{lab.loadError}</p>
  if (!session || !def || !view) return <div className="lab-loading">Loading the work…</div>
  const s = session
  return (
    <div className="lab-review">
      <div className="lab-work-head">
        <div>
          <Link to="/lab/teach" className="lab-link">← Teaching</Link>
          <h1>{def.title}</h1>
          <p>{s.studentName} · attempt {s.attempt} · <b>{STATUS_LABEL[s.status]}</b>{s.submittedAt ? ' · submitted ' + new Date(s.submittedAt).toLocaleString('en-GB') : ''}{s.score != null ? ` · ${s.score} / ${s.maxScore}` : ''}</p>
        </div>
        <button type="button" className="lab-btn ghost" onClick={() => openReport(s._id, toast.error)}>PDF report</button>
      </div>
      <SimulationNotice def={def} />
      <div className="lab-review-grid">
        <section>
          <h2>Bench at the end</h2>
          <View2D experimentId={def.id} view={view} dispatch={() => false} editable={false} />
          <h2>Data</h2>
          <DataTables tables={tables} />
          <Graph g={graph} />
          <h2>Answers</h2>
          <Questions def={def} answers={lab.answers} update={() => {}} editable={false} expected={expected} />
          <p className="lab-help">Hidden model values for this attempt (teacher only): {Object.entries(expected || {}).filter(([k]) => /^true/.test(k)).map(([k, v]) => `${k.replace(/^true/, '')}: ${v}`).join(' · ') || '—'}</p>
          <h2>Notebook</h2>
          <Notebook def={def} notebook={lab.notebook} update={() => {}} editable={false} tables={[]} graph={null} />
        </section>
        <section>
          <h2>Marking</h2>
          {['submitted', 'marked', 'returned'].includes(s.status)
            ? <MarkForm session={s} def={def} onDone={onReload} />
            : <><p className="lab-help">The student is still working on this. You can mark it once it is submitted.</p><RubricTable rows={null} def={def} /></>}
          {s.history?.length > 0 && <><h3>History</h3><ul className="lab-list">{s.history.map((h, i) => <li key={i}>{h.at ? new Date(h.at).toLocaleString('en-GB') + ' · ' : ''}{h.byName || ''} {h.event}{h.note ? ': ' + h.note : ''}</li>)}</ul></>}
        </section>
      </div>
    </div>
  )
}

export default function SessionReview({ sessionId }) {
  const [k, setK] = useState(0)
  return <div className="lab-page"><ReviewBody key={k} sessionId={sessionId} onReload={() => setK(x => x + 1)} /></div>
}
