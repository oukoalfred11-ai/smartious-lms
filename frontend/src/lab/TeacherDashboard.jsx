/**
 * TeacherDashboard — assign experiments to your own students, follow
 * progress, open submissions for marking and export a class report.
 * The student list and the submissions come from the server already
 * limited to the teacher's allocated students (admin / Dean see all).
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, useToast } from '../context/ctx.jsx'
import { STATUS_LABEL } from './panels.jsx'

const fmtD = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')
const csvCell = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }

function AssignForm({ experiments, students, onCreated }) {
  const toast = useToast()
  const usable = experiments.filter(e => ['approved', 'published'].includes(e.status))
  const [f, setF] = useState({ experimentId: '', title: '', instructions: '', dueAt: '', acid: 'HCl' })
  const [picked, setPicked] = useState(() => new Set())
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const shown = students.filter(s => !q || (s.name + ' ' + (s.admissionNumber || '') + ' ' + (s.grade || '')).toLowerCase().includes(q.toLowerCase()))
  const toggle = (id) => setPicked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const body = { experimentId: f.experimentId, title: f.title, instructions: f.instructions, dueAt: f.dueAt ? new Date(f.dueAt).toISOString() : null, studentIds: [...picked] }
      if (f.experimentId === 'chem-titration') body.options = { acid: f.acid }
      const { data } = await api.post('/lab/assignments', body)
      toast.ok(data.message || 'Assigned.')
      setF({ experimentId: '', title: '', instructions: '', dueAt: '', acid: 'HCl' }); setPicked(new Set())
      onCreated()
    } catch (err) { toast.error(err?.response?.data?.message || 'Could not create the assignment.') }
    finally { setBusy(false) }
  }

  if (!usable.length) return <p className="lab-help">No experiment has been approved yet. An administrator or the Dean approves experiments in Content review before they can be assigned.</p>
  return (
    <form className="lab-form" onSubmit={submit}>
      <label>Experiment
        <select required value={f.experimentId} onChange={e => setF({ ...f, experimentId: e.target.value })}>
          <option value="">Choose…</option>
          {usable.map(e => <option key={e.id} value={e.id}>{e.title} ({e.subject})</option>)}
        </select>
      </label>
      {f.experimentId === 'chem-titration' && (
        <label>Acid in the flask
          <select value={f.acid} onChange={e => setF({ ...f, acid: e.target.value })}>
            <option value="HCl">Hydrochloric acid (strong)</option>
            <option value="CH3COOH">Ethanoic acid (weak)</option>
          </select>
        </label>
      )}
      <label>Title (optional)<input value={f.title} maxLength={200} onChange={e => setF({ ...f, title: e.target.value })} /></label>
      <label>Instructions to students (optional)<textarea rows={3} maxLength={4000} value={f.instructions} onChange={e => setF({ ...f, instructions: e.target.value })} /></label>
      <label>Deadline (optional)<input type="datetime-local" value={f.dueAt} onChange={e => setF({ ...f, dueAt: e.target.value })} /></label>
      <fieldset className="lab-fs">
        <legend>Students ({picked.size} selected)</legend>
        {students.length === 0
          ? <p className="lab-help">You have no allocated students yet.</p>
          : <>
              <div className="lab-row">
                <input type="search" placeholder="Search by name, admission number or grade" value={q} onChange={e => setQ(e.target.value)} aria-label="Search students" />
                <button type="button" className="lab-btn sm" onClick={() => setPicked(p => new Set([...p, ...shown.map(s => s._id)]))}>Select shown</button>
                <button type="button" className="lab-btn sm ghost" onClick={() => setPicked(new Set())}>Clear</button>
              </div>
              <ul className="lab-pick">{shown.map(s => (
                <li key={s._id}><label className="lab-check"><input type="checkbox" checked={picked.has(s._id)} onChange={() => toggle(s._id)} /> {s.name}{s.admissionNumber ? ' · ' + s.admissionNumber : ''}{s.grade ? ' · ' + s.grade : ''}</label></li>
              ))}</ul>
            </>}
      </fieldset>
      <button type="submit" className="lab-btn primary" disabled={busy || !f.experimentId || !picked.size}>{busy ? 'Assigning…' : 'Assign'}</button>
    </form>
  )
}

function Assignments({ list, experiments, onChange }) {
  const toast = useToast()
  const title = (id) => experiments.find(e => e.id === id)?.title || id
  const setStatus = async (a, status) => {
    try { await api.patch('/lab/assignments/' + a._id, { status }); toast.ok(status === 'closed' ? 'Assignment closed.' : 'Assignment reopened.'); onChange() }
    catch (e) { toast.error(e?.response?.data?.message || 'Could not update.') }
  }
  if (!list.length) return <p className="lab-help">No assignments yet.</p>
  return (
    <table className="lab-table">
      <thead><tr><th>Assignment</th><th>Experiment</th><th>Deadline</th><th>Students</th><th>Progress</th><th></th></tr></thead>
      <tbody>{list.map(a => {
        const p = a.progress || {}
        return (
          <tr key={a._id}>
            <td>{a.title}{a.status === 'closed' ? ' (closed)' : ''}</td><td>{title(a.experimentId)}</td><td>{fmtD(a.dueAt)}</td><td>{a.studentCount}</td>
            <td>{['in_progress', 'submitted', 'returned', 'marked'].map(k => p[k] ? `${STATUS_LABEL[k]}: ${p[k]}` : null).filter(Boolean).join(' · ') || 'Not started'}</td>
            <td><button type="button" className="lab-btn sm ghost" onClick={() => setStatus(a, a.status === 'closed' ? 'active' : 'closed')}>{a.status === 'closed' ? 'Reopen' : 'Close'}</button></td>
          </tr>
        )
      })}</tbody>
    </table>
  )
}

function Submissions({ experiments, assignments }) {
  const toast = useToast()
  const [filter, setFilter] = useState({ status: 'submitted', experimentId: '', assignmentId: '' })
  const [rows, setRows] = useState(null)
  const load = useCallback(async () => {
    setRows(null)
    try {
      const qs = new URLSearchParams(Object.entries(filter).filter(([, v]) => v)).toString()
      const { data } = await api.get('/lab/review' + (qs ? '?' + qs : ''))
      setRows(data.data.sessions)
    } catch (e) { toast.error(e?.response?.data?.message || 'Could not load submissions.'); setRows([]) }
  }, [filter, toast])
  useEffect(() => { load() }, [load])
  const title = (id) => experiments.find(e => e.id === id)?.title || id
  const aTitle = (id) => assignments.find(a => a._id === id)?.title || (id ? 'Assignment' : 'Practice')

  const exportCsv = () => {
    const head = ['Student', 'Experiment', 'Assignment', 'Attempt', 'Status', 'Submitted', 'Score', 'Max', 'Marked by']
    const body = rows.map(s => [s.studentName, title(s.experimentId), aTitle(s.assignmentId), s.attempt, STATUS_LABEL[s.status], s.submittedAt ? new Date(s.submittedAt).toISOString() : '', s.score ?? '', s.maxScore ?? '', s.markedByName || ''])
    const csv = [head, ...body].map(r => r.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = 'virtual-lab-class-report.csv'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  return (
    <div>
      <div className="lab-row">
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} aria-label="Status">
          <option value="">All statuses</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filter.experimentId} onChange={e => setFilter({ ...filter, experimentId: e.target.value })} aria-label="Experiment">
          <option value="">All experiments</option>{experiments.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <select value={filter.assignmentId} onChange={e => setFilter({ ...filter, assignmentId: e.target.value })} aria-label="Assignment">
          <option value="">All assignments</option>{assignments.map(a => <option key={a._id} value={a._id}>{a.title}</option>)}
        </select>
        <button type="button" className="lab-btn sm ghost" onClick={exportCsv} disabled={!rows?.length}>Export CSV</button>
      </div>
      {rows == null ? <div className="lab-loading">Loading…</div> : !rows.length ? <p className="lab-help">Nothing matches these filters.</p> : (
        <table className="lab-table">
          <thead><tr><th>Student</th><th>Experiment</th><th>Assignment</th><th>Status</th><th>Submitted</th><th>Score</th><th></th></tr></thead>
          <tbody>{rows.map(s => (
            <tr key={s._id}>
              <td>{s.studentName}</td><td>{title(s.experimentId)}</td><td>{aTitle(s.assignmentId)}</td><td>{STATUS_LABEL[s.status]}</td><td>{fmtD(s.submittedAt)}</td>
              <td>{s.score != null ? `${s.score} / ${s.maxScore}` : '—'}</td>
              <td><Link className="lab-btn sm" to={'/lab/review/' + s._id}>{s.status === 'submitted' ? 'Mark' : 'Open'}</Link></td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  )
}

export default function TeacherDashboard() {
  const toast = useToast()
  const [tab, setTab] = useState('review')
  const [experiments, setExperiments] = useState([])
  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [err, setErr] = useState(null)
  const loadAssignments = useCallback(() => api.get('/lab/assignments').then(r => setAssignments(r.data.data.assignments)).catch(e => toast.error(e?.response?.data?.message || 'Could not load assignments.')), [toast])
  useEffect(() => {
    Promise.all([api.get('/lab/experiments'), api.get('/lab/students')])
      .then(([e, s]) => { setExperiments(e.data.data.experiments); setStudents(s.data.data.students) })
      .catch(e => setErr(e?.response?.data?.message || 'Could not load the Virtual Lab.'))
    loadAssignments()
  }, [loadAssignments])
  const tabs = useMemo(() => [['review', 'Submissions'], ['assign', 'New assignment'], ['assignments', 'Assignments']], [])
  if (err) return <div className="lab-page"><p className="lab-error" role="alert">{err}</p></div>
  return (
    <div className="lab-page">
      <h1>Teaching</h1>
      <div className="lab-tabs" role="tablist">{tabs.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
      <div className="lab-panel">
        {tab === 'review' && <Submissions experiments={experiments} assignments={assignments} />}
        {tab === 'assign' && <AssignForm experiments={experiments} students={students} onCreated={() => { loadAssignments(); setTab('assignments') }} />}
        {tab === 'assignments' && <Assignments list={assignments} experiments={experiments} onChange={loadAssignments} />}
      </div>
    </div>
  )
}
