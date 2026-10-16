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

function Bulk({ list, onDone }) {
  const toast = useToast()
  const groups = [['all', 'All experiments'], ['featured', 'Featured experiments'], ...[...new Map(list.filter(e => e.collection).map(e => [e.collection.id, e.collection.name])).entries()]]
  const [group, setGroup] = useState('all')
  const [status, setStatus] = useState('published')
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const ids = list.filter(e => group === 'all' || (group === 'featured' ? !e.collection : e.collection?.id === group)).map(e => e.id)
  const run = async () => {
    setBusy(true)
    try {
      const { data } = await api.post('/lab/experiments/bulk-status', { ids, status, note: 'Bulk change' })
      toast.ok(data.message)
      if (data.data.refused.length) toast.error('Refused: ' + data.data.refused.map(r => r.id + ' (' + r.reason + ')').join('; '))
      setConfirm(false); onDone()
    } catch (e) { toast.error(e?.response?.data?.message || 'Could not change the status.') }
    finally { setBusy(false) }
  }
  return (
    <div className="lab-card">
      <h3>Change many at once</h3>
      <div className="lab-row">
        <select value={group} onChange={e => { setGroup(e.target.value); setConfirm(false) }} aria-label="Which experiments">{groups.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <select value={status} onChange={e => { setStatus(e.target.value); setConfirm(false) }} aria-label="New status">{STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        {!confirm
          ? <button type="button" className="lab-btn primary" onClick={() => setConfirm(true)} disabled={!ids.length}>Apply to {ids.length}</button>
          : <><span>Set {ids.length} experiment(s) to “{STATUSES.find(x => x[0] === status)[1]}”? Each is checked first; any that fail are left unchanged.</span>
              <button type="button" className="lab-btn primary" onClick={run} disabled={busy}>{busy ? 'Working…' : 'Yes, apply'}</button>
              <button type="button" className="lab-btn ghost" onClick={() => setConfirm(false)} disabled={busy}>Cancel</button></>}
      </div>
    </div>
  )
}

export default function ContentAdmin() {
  const [list, setList] = useState(null)
  const [err, setErr] = useState(null)
  const load = useCallback(() => api.get('/lab/experiments').then(r => setList(r.data.data.experiments)).catch(e => setErr(e?.response?.data?.message || 'Could not load experiments.')), [])
  useEffect(() => { load() }, [load])
  const counts = (list || []).reduce((a, e) => ({ ...a, [e.status]: (a[e.status] || 0) + 1 }), {})
  return (
    <div className="lab-page">
      <h1>Content review</h1>
      <p className="lab-help">Students only see published experiments, or approved ones their teacher has assigned. Check the science, safety notes and model assumptions before approving. Curriculum links are Smartious’s own mapping and are marked unverified until checked against the official syllabus.</p>
      {err && <p className="lab-error" role="alert">{err}</p>}
      {list == null && !err ? <div className="lab-loading">Loading…</div> : list && <>
        <p>{STATUSES.map(([k, l]) => `${l}: ${counts[k] || 0}`).join(' · ')}</p>
        <Bulk list={list} onDone={load} />
        {list.map(e => (
          <details key={e.id + e.status + (e.reviewNote || '')} className="lab-chapter">
            <summary>{e.collection ? <b>{e.collection.code} </b> : null}{e.title} <span className="lab-help">· {STATUSES.find(s => s[0] === e.status)?.[1] || e.status}</span></summary>
            <Row e={e} onSaved={load} />
          </details>
        ))}
      </>}
    </div>
  )
}
