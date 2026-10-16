/**
 * LabApp — Smartious Virtual Science Laboratory, mounted at /lab/*.
 * Uses the LMS login; the server enforces every permission.
 *
 *   /lab                     library (+ my work for students)
 *   /lab/run/:experimentId   student workspace (?assignment=<id>, ?new=1 for another practice attempt)
 *   /lab/session/:id         reopen a specific attempt
 *   /lab/teach               teacher / admin / Dean dashboard
 *   /lab/review/:id          mark one submission
 *   /lab/content             admin / Dean content review
 */
import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, useAuth, useToast } from '../context/ctx.jsx'
import Workspace from './Workspace.jsx'
import TeacherDashboard from './TeacherDashboard.jsx'
import SessionReview from './SessionReview.jsx'
import ContentAdmin from './ContentAdmin.jsx'
import { STATUS_LABEL } from './panels.jsx'
import './lab.css'

const STAFF = ['admin', 'dos', 'ops_manager']
const PORTAL = { student: '/student', teacher: '/teacher', admin: '/admin', dos: '/dos', ops_manager: '/ops' }
const fmtD = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '')

function Library({ role }) {
  const toast = useToast()
  const navigate = useNavigate()
  const [list, setList] = useState(null)
  const [subject, setSubject] = useState('')
  const [err, setErr] = useState(null)
  useEffect(() => { api.get('/lab/experiments').then(r => setList(r.data.data.experiments)).catch(e => setErr(e?.response?.data?.message || 'Could not load the experiments.')) }, [])
  const startNew = async (id) => {
    try { const { data } = await api.post('/lab/sessions', { experimentId: id, newAttempt: true }); navigate('/lab/session/' + data.data.session._id) }
    catch (e) { toast.error(e?.response?.data?.message || 'Could not start a new attempt.') }
  }
  if (err) return <p className="lab-error" role="alert">{err}</p>
  if (!list) return <div className="lab-loading">Loading experiments…</div>
  const shown = list.filter(e => !subject || e.subject === subject)
  return (
    <section>
      <div className="lab-row">
        <h2>Experiments</h2>
        <div className="lab-seg" role="group" aria-label="Subject">
          {[['', 'All'], ['chemistry', 'Chemistry'], ['physics', 'Physics'], ['biology', 'Biology']].map(([k, l]) => <button key={k} type="button" className={subject === k ? 'on' : ''} aria-pressed={subject === k} onClick={() => setSubject(k)}>{l}</button>)}
        </div>
      </div>
      {!shown.length && <p className="lab-help">{role === 'student' ? 'No experiments are open to you yet. Your teacher will assign one.' : 'No experiments.'}</p>}
      <div className="lab-cards">
        {shown.map(e => (
          <article key={e.id} className="lab-card">
            <span className={'lab-badge ' + e.subject}>{e.subject}</span>
            {role !== 'student' && <span className="lab-help"> · {e.status}</span>}
            <h3>{e.title}</h3>
            <p>{e.summary}</p>
            <p className="lab-help">About {e.durationMin} min · {e.difficulty}{e.model.kind === 'simplified' ? ' · simplified model' : ''}</p>
            <details><summary>What you will practise</summary><ul>{e.skills.map(s => <li key={s}>{s}</li>)}</ul></details>
            {role === 'student'
              ? <div className="lab-row"><Link className="lab-btn primary" to={'/lab/run/' + e.id}>Open</Link><button type="button" className="lab-btn ghost" onClick={() => startNew(e.id)} title="Starts a fresh attempt once your previous practice attempt has been submitted; otherwise it reopens it.">New attempt</button></div>
              : <p className="lab-help">{['approved', 'published'].includes(e.status) ? 'Assign it from Teaching.' : 'Needs approval in Content review before it can be assigned.'}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}

function MyWork() {
  const [sessions, setSessions] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [err, setErr] = useState(null)
  useEffect(() => {
    Promise.all([api.get('/lab/sessions/mine'), api.get('/lab/assignments')])
      .then(([s, a]) => { setSessions(s.data.data.sessions); setAssignments(a.data.data.assignments) })
      .catch(e => setErr(e?.response?.data?.message || 'Could not load your work.'))
  }, [])
  if (err) return <p className="lab-error" role="alert">{err}</p>
  if (!sessions) return <div className="lab-loading">Loading your work…</div>
  const open = assignments.filter(a => a.status === 'active')
  return (
    <section>
      <h2>Assigned to you</h2>
      {!open.length ? <p className="lab-help">No lab assignments right now.</p> : (
        <table className="lab-table"><thead><tr><th>Assignment</th><th>Teacher</th><th>Deadline</th><th>Status</th><th></th></tr></thead>
          <tbody>{open.map(a => {
            const late = a.dueAt && new Date(a.dueAt) < new Date() && !['submitted', 'marked'].includes(a.mySession?.status)
            return (
              <tr key={a._id}>
                <td>{a.title}{a.instructions && <div className="lab-help">{a.instructions}</div>}</td><td>{a.teacherName}</td>
                <td className={late ? 'lab-warn' : ''}>{a.dueAt ? fmtD(a.dueAt) + (late ? ' (past due)' : '') : '—'}</td>
                <td>{a.mySession ? STATUS_LABEL[a.mySession.status] + (a.mySession.score != null ? ` · ${a.mySession.score} / ${a.mySession.maxScore}` : '') : 'Not started'}</td>
                <td><Link className="lab-btn sm primary" to={`/lab/run/${a.experimentId}?assignment=${a._id}`}>{a.mySession ? 'Open' : 'Start'}</Link></td>
              </tr>
            )
          })}</tbody></table>
      )}
      <h2>My attempts</h2>
      {!sessions.length ? <p className="lab-help">You have not started an experiment yet.</p> : (
        <table className="lab-table"><thead><tr><th>Experiment</th><th>Attempt</th><th>Status</th><th>Last saved</th><th>Score</th><th></th></tr></thead>
          <tbody>{sessions.map(s => (
            <tr key={s._id}><td>{s.experimentId}{s.assignmentId ? ' (assignment)' : ' (practice)'}</td><td>{s.attempt}</td><td>{STATUS_LABEL[s.status]}</td><td>{fmtD(s.updatedAt)}</td>
              <td>{s.score != null ? `${s.score} / ${s.maxScore}` : '—'}</td><td><Link className="lab-btn sm" to={'/lab/session/' + s._id}>Open</Link></td></tr>
          ))}</tbody></table>
      )}
    </section>
  )
}

function Home({ role }) {
  return <div className="lab-page">{role === 'student' && <MyWork />}<Library role={role} /></div>
}

function Run() {
  const { experimentId } = useParams()
  const [sp] = useSearchParams()
  return <Workspace key={experimentId + (sp.get('assignment') || '')} experimentId={experimentId} assignmentId={sp.get('assignment')} />
}
function SessionPage() { const { id } = useParams(); return <Workspace key={id} sessionId={id} /> }
function ReviewPage() { const { id } = useParams(); return <SessionReview key={id} sessionId={id} /> }

export default function LabApp() {
  const { user } = useAuth()
  const role = user?.role
  const teaches = role === 'teacher' || STAFF.includes(role)
  return (
    <div className="lab-app">
      <header className="lab-header">
        <Link to="/lab" className="lab-brand"><span className="lab-brand-mark" aria-hidden="true">S</span> Smartious Virtual Lab</Link>
        <nav aria-label="Virtual Lab">
          <NavLink end to="/lab">{role === 'student' ? 'My lab' : 'Experiments'}</NavLink>
          {teaches && <NavLink to="/lab/teach">Teaching</NavLink>}
          {STAFF.includes(role) && <NavLink to="/lab/content">Content review</NavLink>}
          <Link to={PORTAL[role] || '/portal'}>Back to portal</Link>
        </nav>
      </header>
      <main className="lab-main">
        <Routes>
          <Route index element={<Home role={role} />} />
          <Route path="run/:experimentId" element={role === 'student' ? <Run /> : <Navigate to="/lab" replace />} />
          <Route path="session/:id" element={role === 'student' ? <SessionPage /> : <ReviewPage />} />
          <Route path="teach" element={teaches ? <TeacherDashboard /> : <Navigate to="/lab" replace />} />
          <Route path="review/:id" element={teaches ? <ReviewPage /> : <Navigate to="/lab" replace />} />
          <Route path="content" element={STAFF.includes(role) ? <ContentAdmin /> : <Navigate to="/lab" replace />} />
          <Route path="*" element={<Navigate to="/lab" replace />} />
        </Routes>
      </main>
    </div>
  )
}
