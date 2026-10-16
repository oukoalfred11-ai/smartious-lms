/**
 * ContentAdmin — admin / Dean review and publication of experiments.
 * draft → review → approved (teachers may assign) → published (open to all
 * students). The server refuses approval when the definition fails its
 * checks; the same checks are shown here so problems are visible first.
 */
import { useCallback, useEffect, useState } from 'react'
import { api, useToast } from '../context/ctx.jsx'
import { getExperiment, validateDefinition } from './core.js'

const STATUSES = [['draft', 'Draft'], ['review', 'In review'], ['approved', 'Approved (assignable)'], ['published', 'Published (all students)']]

function Row({ e, onSaved }) {
  const toast = useToast()
  const [status, setStatus] = useState(e.status)
  const [note, setNote] = useState(e.reviewNote || '')
  const [busy, setBusy] = useState(false)
  const def = getExperiment(e.id)
  const problems = def ? validateDefinition(def) : ['This experiment is not in this version of the app.']
  const save = async () => {
    setBusy(true)
    try { const { data } = await api.patch('/lab/experiments/' + e.id + '/status', { status, note }); toast.ok(data.message || 'Saved.'); onSaved() }
    catch (err) { toast.error(err?.response?.data?.message || 'Could not change the status.') }
    finally { setBusy(false) }
  }
  return (
    <article className="lab-card">
      <h3>{e.title} <span className={'lab-badge ' + e.subject}>{e.subject}</span> <span className="lab-help">v{e.version} · {e.model.kind} model</span></h3>
      <p>{e.summary}</p>
      <p>Current status: <b>{STATUSES.find(s => s[0] === e.status)?.[1] || e.status}</b></p>
      {problems.length
        ? <div className="lab-problems" role="alert"><b>Definition checks failed:</b><ul>{problems.map(p => <li key={p}>{p}</li>)}</ul></div>
        : <p className="lab-ok">Definition checks passed (structure, rubric, safety notes, model assumptions, curriculum metadata).</p>}
      <details><summary>Curriculum links ({def?.curriculum?.length || 0})</summary>
        <ul>{(def?.curriculum || []).map((c, i) => <li key={i}>{c.board} {c.level} {c.subject}: {c.topic} · {c.verified ? 'verified ' + (c.syllabusRef || '') : 'syllabus reference not verified'}</li>)}</ul>
      </details>
      <details><summary>Model assumptions</summary><ul>{e.model.assumptions.map(a => <li key={a}>{a}</li>)}</ul></details>
      <div className="lab-row">
        <select value={status} onChange={ev => setStatus(ev.target.value)} aria-label={'Status for ' + e.title}>{STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <input value={note} onChange={ev => setNote(ev.target.value)} maxLength={2000} placeholder="Review note (optional)" aria-label="Review note" />
        <button type="button" className="lab-btn primary" onClick={save} disabled={busy || (status === e.status && note === (e.reviewNote || ''))}>Save</button>
      </div>
    </article>
  )
}

export default function ContentAdmin() {
  const [list, setList] = useState(null)
  const [err, setErr] = useState(null)
  const load = useCallback(() => api.get('/lab/experiments').then(r => setList(r.data.data.experiments)).catch(e => setErr(e?.response?.data?.message || 'Could not load experiments.')), [])
  useEffect(() => { load() }, [load])
  return (
    <div className="lab-page">
      <h1>Content review</h1>
      <p className="lab-help">Students only see published experiments, or approved ones their teacher has assigned. Check the science, safety notes and model assumptions before approving. Curriculum links are Smartious’s own mapping and are marked unverified until checked against the official syllabus.</p>
      {err && <p className="lab-error" role="alert">{err}</p>}
      {list == null && !err ? <div className="lab-loading">Loading…</div> : (list || []).map(e => <Row key={e.id + e.status + (e.reviewNote || '')} e={e} onSaved={load} />)}
    </div>
  )
}
