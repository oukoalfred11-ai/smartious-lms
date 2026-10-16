/**
 * panels.jsx — instructions, notebook, data tables, graph, questions,
 * save indicator and submission panel. Shared by the student workspace and
 * the teacher's review page.
 */
import { useState } from 'react'
import { api } from '../context/ctx.jsx'
import { NOTEBOOK_SECTIONS } from './core.js'

const LABELS = { aim: 'Aim', hypothesis: 'Hypothesis', variables: 'Variables', apparatus: 'Apparatus and materials', procedure: 'Procedure (what you actually did)', observations: 'Observations', analysis: 'Analysis', evaluation: 'Evaluation and limitations', conclusion: 'Conclusion' }
export const STATUS_LABEL = { in_progress: 'In progress', submitted: 'Submitted', returned: 'Returned for correction', marked: 'Marked' }
const fmt = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '')

export function SimulationNotice({ def }) {
  return (
    <p className="lab-sim" role="note">
      <b>{def.model.kind === 'simplified' ? 'Simplified educational model.' : 'Educational model.'}</b> Every reading in this lab is produced by a computer simulation, not by real apparatus.
      It is practice, and does not replace any practical work your examination board requires.
    </p>
  )
}

export function Instructions({ def }) {
  return (
    <div className="lab-instr">
      <SimulationNotice def={def} />
      <h3>Aim</h3><p>{def.notebook.aim}</p>
      <h3>Objectives</h3><ul>{def.objectives.map(o => <li key={o}>{o}</li>)}</ul>
      <h3>Safety</h3><ul className="lab-safety">{def.safety.map(o => <li key={o}>{o}</li>)}</ul>
      <h3>Procedure</h3><ol>{def.procedure.map(o => <li key={o}>{o}</li>)}</ol>
      <details><summary>How the model works</summary><p>{def.model.summary}</p><ul>{def.model.assumptions.map(a => <li key={a}>{a}</li>)}</ul></details>
      {def.curriculum?.length > 0 && <details><summary>Curriculum links</summary>
        <ul>{def.curriculum.map((c, i) => <li key={i}>{c.board} {c.level} {c.subject}: {c.topic}{c.verified && c.syllabusRef ? ` (${c.syllabusRef})` : ''}</li>)}</ul>
        <p className="lab-help">Topic links are a guide written by Smartious. They are not an endorsement by any examination board.</p></details>}
    </div>
  )
}

export function DataTables({ tables }) {
  return tables.map(t => (
    <div key={t.title} className="lab-tablewrap">
      <h4>{t.title}</h4>
      <table className="lab-table">
        <thead><tr>{t.columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{t.rows.length ? t.rows.map((r, i) => <tr key={i}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>) : <tr><td colSpan={t.columns.length}>No data recorded yet.</td></tr>}</tbody>
      </table>
    </div>
  ))
}

const nice = (v) => { const p = Math.pow(10, Math.floor(Math.log10(Math.abs(v) || 1))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p }

export function Graph({ g }) {
  if (!g) return null
  if (!g.points.length) return <p className="lab-help">The graph appears when you record data.</p>
  const W = 460, H = 280, L = 56, B = 44, T = 14, R = 14
  const xs = g.points.map(p => p.x), ys = g.points.map(p => p.y)
  const xmax = nice(Math.max(...xs, 0) * 1.05 || 1), xmin = Math.min(0, ...xs) < 0 ? -nice(-Math.min(...xs)) : 0
  const ymax = Math.max(...ys, 0) > 0 ? nice(Math.max(...ys) * 1.05) : 0, ymin = Math.min(...ys, 0) < 0 ? -nice(-Math.min(...ys) * 1.05) : 0
  const yTop = ymax === ymin ? 1 : ymax
  const X = (x) => L + ((x - xmin) / (xmax - xmin)) * (W - L - R)
  const Y = (y) => T + (1 - (y - ymin) / (yTop - ymin)) * (H - T - B)
  const ticks = (a, b) => Array.from({ length: 6 }, (_, i) => a + (b - a) * i / 5)
  const lab = (v) => Number(v.toPrecision(3)).toString()
  return (
    <figure className="lab-graph">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${g.title}. ${g.points.length} points plotted.`}>
        <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="#FFF" stroke="#BBB" />
        {ticks(xmin, xmax).map(v => <g key={'x' + v}><line x1={X(v)} x2={X(v)} y1={T} y2={H - B} stroke="#EEE" /><text x={X(v)} y={H - B + 14} fontSize="10" textAnchor="middle">{lab(v)}</text></g>)}
        {ticks(ymin, yTop).map(v => <g key={'y' + v}><line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="#EEE" /><text x={L - 6} y={Y(v) + 3} fontSize="10" textAnchor="end">{lab(v)}</text></g>)}
        {ymin < 0 && <line x1={L} x2={W - R} y1={Y(0)} y2={Y(0)} stroke="#888" />}
        {g.line && <line x1={X(xmin)} y1={Y(g.line.m * xmin + g.line.c)} x2={X(xmax)} y2={Y(g.line.m * xmax + g.line.c)} stroke="#7D1025" strokeWidth="1.5" />}
        {g.points.map((p, i) => <g key={i} stroke="#111" strokeWidth="1.6"><line x1={X(p.x) - 4} x2={X(p.x) + 4} y1={Y(p.y) - 4} y2={Y(p.y) + 4} /><line x1={X(p.x) - 4} x2={X(p.x) + 4} y1={Y(p.y) + 4} y2={Y(p.y) - 4} /></g>)}
        <text x={(L + W - R) / 2} y={H - 8} fontSize="11" textAnchor="middle" fontWeight="600">{g.xLabel}</text>
        <text transform={`translate(14 ${(T + H - B) / 2}) rotate(-90)`} fontSize="11" textAnchor="middle" fontWeight="600">{g.yLabel}</text>
      </svg>
      <figcaption>{g.title}{g.line ? ` · line of best fit: gradient ${Number(g.line.m.toPrecision(3))}${g.line.c ? ', intercept ' + Number(g.line.c.toPrecision(3)) : ''}` : ''}</figcaption>
    </figure>
  )
}

export function Notebook({ def, notebook, update, editable, tables, graph }) {
  return (
    <div className="lab-notebook">
      {NOTEBOOK_SECTIONS.map(k => (
        <div key={k} className="lab-nb-sec">
          {k === 'observations' && <div className="lab-nb-data"><h3>Raw data (recorded automatically from your readings)</h3><DataTables tables={tables} /><Graph g={graph} /></div>}
          <label htmlFor={'nb-' + k}><h3>{LABELS[k]}</h3></label>
          {editable
            ? <textarea id={'nb-' + k} value={notebook[k] ?? ''} onChange={e => update(k, e.target.value)} maxLength={10000} rows={k === 'aim' ? 2 : 4}
                placeholder={k === 'aim' ? def.notebook.aim : k === 'variables' ? def.notebook.variables : ''} />
            : <p className="lab-nb-ro">{notebook[k] || '—'}</p>}
        </div>
      ))}
    </div>
  )
}

export function Questions({ def, answers, update, editable, expected }) {
  return (
    <div className="lab-questions">
      {def.questions.map(q => (
        <div key={q.id} className="lab-q">
          <label htmlFor={'q-' + q.id}><b>{q.prompt}</b>{q.unit ? ` (${q.unit})` : ''}</label>
          {q.hint && <p className="lab-help">{q.hint}</p>}
          {editable && (q.type === 'choice'
            ? <div role="radiogroup" aria-label={q.prompt}>{q.options.map((o, i) => (
                <label key={i} className="lab-radio"><input type="radio" name={'q-' + q.id} checked={String(answers[q.id]) === String(i)} onChange={() => update(q.id, String(i))} disabled={!editable} /> {o}</label>))}</div>
            : q.type === 'numeric'
              ? <input id={'q-' + q.id} inputMode="decimal" value={answers[q.id] ?? ''} onChange={e => update(q.id, e.target.value)} disabled={!editable} />
              : <textarea id={'q-' + q.id} rows={3} value={answers[q.id] ?? ''} onChange={e => update(q.id, e.target.value)} disabled={!editable} maxLength={10000} />)}
          {!editable && <p className="lab-nb-ro">{q.type === 'choice' ? (q.options[Number(answers[q.id])] || '—') : (answers[q.id] || '—')}</p>}
          {expected && expected[q.id] != null && <p className="lab-expected">From the student’s own data: {String(expected[q.id])}</p>}
        </div>
      ))}
    </div>
  )
}

export function SaveIndicator({ save, onRetry }) {
  const map = {
    idle: ['', ''], saved: ['ok', 'Saved' + (save.at ? ' ' + fmt(save.at) : '')], dirty: ['pend', 'Unsaved changes'], saving: ['pend', 'Saving…'],
    error: ['bad', save.error || 'Not saved'], conflict: ['bad', save.error || 'Saved elsewhere'],
  }
  const [cls, text] = map[save.status] || map.idle
  if (!text) return null
  return (
    <span className={'lab-save ' + cls} role="status" aria-live="polite">{text}
      {save.status === 'error' && <button type="button" className="lab-link" onClick={onRetry}>Retry now</button>}
      {save.status === 'conflict' && <button type="button" className="lab-link" onClick={() => window.location.reload()}>Reload</button>}
    </span>
  )
}

export function RubricTable({ rows, def }) {
  const list = rows || def.rubric.map(r => ({ id: r.id, label: r.label, max: r.marks, marks: null, auto: !!r.auto, detail: r.guidance || '' }))
  return (
    <table className="lab-table">
      <thead><tr><th>Criterion</th><th>Marks</th><th>How it is marked</th></tr></thead>
      <tbody>{list.map(r => <tr key={r.id}><td>{r.label}</td><td>{r.marks == null ? '— / ' + r.max : r.marks + ' / ' + r.max}</td><td>{r.auto ? (r.overridden ? 'Teacher adjusted. ' : 'Checked automatically. ') + (rows ? r.detail || '' : '') : 'Teacher' + (r.detail && !rows ? ': ' + r.detail : '')}</td></tr>)}</tbody>
    </table>
  )
}

/** Opens the PDF report with the user's login (the API needs the auth header). */
export async function openReport(sessionId, onError) {
  const w = window.open('', '_blank')
  try {
    const res = await api.get('/lab/sessions/' + sessionId + '/report.pdf', { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    if (w) w.location.href = url; else window.location.href = url
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  } catch {
    if (w) w.close()
    onError?.('The report could not be created. Try again.')
  }
}

export function SubmitPanel({ lab, toast }) {
  const { def, session, editable, save } = lab
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const s = session
  const doSubmit = async () => {
    setBusy(true)
    try { await lab.submit(); toast.ok('Submitted for marking.'); setConfirm(false) }
    catch (e) { toast.error(e?.response?.data?.message || e.message || 'Could not submit.') }
    finally { setBusy(false) }
  }
  return (
    <div className="lab-submit">
      <p>Status: <b>{STATUS_LABEL[s.status]}</b>{s.submittedAt ? ' · submitted ' + fmt(s.submittedAt) : ''}</p>
      {s.status === 'returned' && s.feedback && <div className="lab-feedback"><b>Your teacher asks you to correct:</b><p>{s.feedback}</p></div>}
      {s.status === 'marked' && <p className="lab-score">Score: <b>{s.score} / {s.maxScore}</b></p>}
      {s.status === 'marked' && s.feedback && <div className="lab-feedback"><b>Feedback{s.markedByName ? ' from ' + s.markedByName : ''}:</b><p>{s.feedback}</p></div>}
      <h3>Mark scheme</h3>
      <RubricTable rows={s.status === 'marked' ? s.markedRows : s.status === 'in_progress' || s.status === 'returned' ? null : s.autoGrade?.rows} def={def} />
      {s.status === 'submitted' && <p className="lab-help">Automatic checks are shown above. Your teacher will mark the rest.</p>}
      {editable && (confirm
        ? <div className="lab-confirm" role="alertdialog" aria-label="Confirm submission">
            <p>Submit now? You cannot change your work after submitting unless your teacher returns it.</p>
            <button type="button" className="lab-btn primary" onClick={doSubmit} disabled={busy}>{busy ? 'Submitting…' : 'Yes, submit'}</button>
            <button type="button" className="lab-btn ghost" onClick={() => setConfirm(false)} disabled={busy}>Cancel</button>
          </div>
        : <button type="button" className="lab-btn primary" onClick={() => setConfirm(true)} disabled={save.status === 'conflict'}>Submit for marking</button>)}
      <p><button type="button" className="lab-btn ghost" onClick={() => openReport(s._id, toast.error)}>Download PDF report</button></p>
    </div>
  )
}
