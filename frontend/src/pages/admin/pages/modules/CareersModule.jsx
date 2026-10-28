/**
 * CareersModule — job applications from /careers, in the Admin, Dean &
 * Operations and QA portals (backend routes/careers.js).
 *
 * Pipeline counts that filter on click, a filter bar (search, status,
 * position, subject, curriculum, level, country, experience, demo lesson,
 * documents, score, reviewed, assignment, dates, sort), CSV export, and an
 * application panel: profile, documents and the demo lesson through
 * short-lived signed links, scored reviews, notes, assignment and history.
 */
import React, { useCallback, useEffect, useState } from 'react'
import { api, useAuth } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { PSection } from '../shared/ui.jsx'
import { POSITIONS, APPLICATION_STATUSES, CURRICULA, LEVELS, REVIEW_CRITERIA } from '../../../../data/careers.js'

const STATUS = Object.fromEntries(APPLICATION_STATUSES.map(s => [s.key, s]))
const POS = Object.fromEntries(POSITIONS.map(p => [p.key, p.label]))
const line = TOKENS.line || '#E8E2D6'
const inp = { padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${line}`, fontSize: 13, fontFamily: 'inherit', background: '#fff', color: TOKENS.ink, minWidth: 0 }
const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const fmtDT = (d) => d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''
const size = (b) => b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'

export function Badge({ s, map = STATUS }) {
  const x = map[s] || { label: s, color: '#374151', bg: '#F3F4F6' }
  return <span style={{ padding: '3px 10px', borderRadius: 99, background: x.bg, color: x.color, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>{x.label}</span>
}

const EMPTY_F = { q: '', status: 'open', position: '', subject: '', curriculum: '', level: '', country: '', minYears: '', hasDemo: '', docs: '', minScore: '', reviewed: '', assigned: '', from: '', to: '', sort: 'newest' }

export default function CareersModule({ toast }) {
  const [f, setF] = useState(EMPTY_F)
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(null)
  const [more, setMore] = useState(false)
  const set = (k, v) => { setPage(1); setF(p => ({ ...p, [k]: v })) }
  const params = (extra = {}) => Object.fromEntries(Object.entries({ ...f, ...extra }).filter(([, v]) => v !== '' && v != null))

  const load = useCallback(() => {
    api.get('/careers/applications', { params: params({ page, limit: 50 }) })
      .then(r => setData(r.data.data))
      .catch(e => { setData({ items: [], total: 0, facets: {} }); toast?.error?.(e?.response?.data?.message || 'Could not load applications.') })
  }, [f, page]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(load, f.q ? 300 : 0); return () => clearTimeout(t) }, [load]) // eslint-disable-line react-hooks/exhaustive-deps

  const exportCsv = async () => {
    try {
      const r = await api.get('/careers/applications/export.csv', { params: params(), responseType: 'blob' })
      const url = URL.createObjectURL(r.data)
      const a = document.createElement('a'); a.href = url; a.download = `job-applications-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch { toast?.error?.('Could not export.') }
  }

  const facets = data?.facets || {}
  const openCount = APPLICATION_STATUSES.filter(s => !['hired', 'rejected', 'withdrawn'].includes(s.key)).reduce((n, s) => n + (facets.status?.[s.key] || 0), 0)

  return (
    <>
      <PSection tag="People" title="Careers and" em="applications" sub="Applications from the Careers page: documents, demo lessons, reviews and the hiring pipeline."
        action={<button className="btn btn-s btn-sm" onClick={exportCsv}>Export CSV</button>} />

      {/* Pipeline: click a stage to filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <button onClick={() => set('status', 'open')} style={{ ...chip(f.status === 'open') }}>Open <b>{openCount}</b></button>
        {APPLICATION_STATUSES.map(s => (
          <button key={s.key} onClick={() => set('status', f.status === s.key ? 'open' : s.key)} style={chip(f.status === s.key)}>
            {s.label} <b>{facets.status?.[s.key] || 0}</b>
          </button>
        ))}
        <button onClick={() => set('status', '')} style={chip(f.status === '')}>All</button>
      </div>

      <div className="card" style={{ padding: 12, marginBottom: 14, display: 'grid', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
          <input style={{ ...inp, gridColumn: 'span 2' }} placeholder="Search name, email, reference, subject, city…" value={f.q} onChange={e => set('q', e.target.value)} />
          <select style={inp} value={f.position} onChange={e => set('position', e.target.value)}>
            <option value="">All positions</option>{POSITIONS.map(p => <option key={p.key} value={p.key}>{p.label}{facets.position?.[p.key] ? ` (${facets.position[p.key]})` : ''}</option>)}
          </select>
          <select style={inp} value={f.subject} onChange={e => set('subject', e.target.value)}>
            <option value="">All subjects</option>{Object.entries(facets.subject || {}).map(([k, n]) => <option key={k} value={k}>{k} ({n})</option>)}
          </select>
          <select style={inp} value={f.country} onChange={e => set('country', e.target.value)}>
            <option value="">All countries</option>{Object.entries(facets.country || {}).map(([k, n]) => <option key={k} value={k}>{k} ({n})</option>)}
          </select>
          <select style={inp} value={f.sort} onChange={e => set('sort', e.target.value)}>
            <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="score">Highest review score</option><option value="experience">Most experience</option><option value="name">Name</option>
          </select>
        </div>
        {more && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
            <select style={inp} value={f.curriculum} onChange={e => set('curriculum', e.target.value)}><option value="">All curricula</option>{CURRICULA.map(c => <option key={c}>{c}</option>)}</select>
            <select style={inp} value={f.level} onChange={e => set('level', e.target.value)}><option value="">All levels</option>{LEVELS.map(c => <option key={c}>{c}</option>)}</select>
            <input style={inp} type="number" min="0" placeholder="Min. years teaching" value={f.minYears} onChange={e => set('minYears', e.target.value)} />
            <select style={inp} value={f.hasDemo} onChange={e => set('hasDemo', e.target.value)}><option value="">Demo: any</option><option value="yes">Has demo lesson</option><option value="no">No demo lesson</option></select>
            <select style={inp} value={f.docs} onChange={e => set('docs', e.target.value)}><option value="">Documents: any</option><option value="complete">Complete</option><option value="incomplete">Missing or in progress</option></select>
            <select style={inp} value={f.minScore} onChange={e => set('minScore', e.target.value)}><option value="">Any score</option>{[4.5, 4, 3.5, 3].map(n => <option key={n} value={n}>Score {n}+</option>)}</select>
            <select style={inp} value={f.reviewed} onChange={e => set('reviewed', e.target.value)}><option value="">Reviewed: any</option><option value="no">Not yet reviewed</option><option value="yes">Reviewed</option></select>
            <select style={inp} value={f.assigned} onChange={e => set('assigned', e.target.value)}><option value="">Assigned: anyone</option><option value="me">Assigned to me</option><option value="none">Unassigned</option></select>
            <label style={{ fontSize: 11.5, color: TOKENS.s500 }}>From<input style={{ ...inp, width: '100%' }} type="date" value={f.from} onChange={e => set('from', e.target.value)} /></label>
            <label style={{ fontSize: 11.5, color: TOKENS.s500 }}>To<input style={{ ...inp, width: '100%' }} type="date" value={f.to} onChange={e => set('to', e.target.value)} /></label>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12.5, color: TOKENS.s500 }}>
          <button className="btn btn-s btn-sm" onClick={() => setMore(m => !m)}>{more ? 'Fewer filters' : 'More filters'}</button>
          <button className="btn btn-s btn-sm" onClick={() => { setF(EMPTY_F); setPage(1) }}>Clear</button>
          <span style={{ marginLeft: 'auto' }}>{data ? `${data.total} application${data.total === 1 ? '' : 's'}` : 'Loading…'}</span>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
          <thead><tr>{['Applicant', 'Position and subjects', 'Country', 'Years', 'Documents', 'Demo', 'Score', 'Status', 'Submitted'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11 }}>{h}</th>)}</tr></thead>
          <tbody>
            {data && !data.items.length && <tr><td colSpan={9} style={{ padding: 30, textAlign: 'center', color: TOKENS.s500, fontSize: 13 }}>No applications match these filters.</td></tr>}
            {(data?.items || []).map(a => (
              <tr key={a._id} onClick={() => setOpen(a._id)} style={{ borderTop: `1px solid ${line}`, cursor: 'pointer' }}>
                <td style={td}><div style={{ fontWeight: 700, color: TOKENS.ink }}>{a.firstName} {a.lastName}</div><div style={{ fontSize: 11, color: TOKENS.s500 }}>{a.ref} · {a.email}</div></td>
                <td style={td}><div style={{ fontSize: 12.5 }}>{POS[a.position]}{a.roleTitle ? ': ' + a.roleTitle : ''}</div><div style={{ fontSize: 11.5, color: TOKENS.s500 }}>{(a.subjects || []).slice(0, 4).join(', ')}{(a.subjects || []).length > 4 ? '…' : ''}</div></td>
                <td style={td}>{a.country || '—'}</td>
                <td style={td}>{a.yearsExperience ?? '—'}</td>
                <td style={td}>{a.docsComplete ? <span style={{ color: TOKENS.accentEmerald, fontWeight: 700 }}>{'✓'} Complete</span> : <span style={{ color: TOKENS.accentAmber, fontWeight: 700 }}>Incomplete</span>}</td>
                <td style={td}>{a.hasDemo ? '✓' : '—'}</td>
                <td style={td}>{a.avgScore != null ? <b>{a.avgScore}</b> : <span style={{ color: TOKENS.s400 }}>{'—'}</span>}</td>
                <td style={td}><Badge s={a.status} />{a.assignedToName && <div style={{ fontSize: 10.5, color: TOKENS.s500, marginTop: 3 }}>{a.assignedToName}</div>}</td>
                <td style={{ ...td, whiteSpace: 'nowrap', fontSize: 12 }}>{fmtD(a.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data?.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, alignItems: 'center' }}>
          <button className="btn btn-s btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{'‹'}</button>
          <span style={{ fontSize: 12.5 }}>Page {page} of {data.pages}</span>
          <button className="btn btn-s btn-sm" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>{'›'}</button>
        </div>
      )}
      {open && <ApplicationPanel id={open} toast={toast} onClose={() => setOpen(null)} onChanged={load} />}
    </>
  )
}

const td = { padding: '10px 12px', fontSize: 12.5, color: TOKENS.s700, verticalAlign: 'top' }
function chip(on) {
  return { padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${on ? TOKENS.crimson : line}`, background: on ? TOKENS.crimson : '#fff', color: on ? '#fff' : TOKENS.s700, display: 'inline-flex', gap: 6 }
}

function ApplicationPanel({ id, toast, onClose, onChanged }) {
  const { user } = useAuth()
  const [a, setA] = useState(null)
  const [tab, setTab] = useState('profile')
  const [status, setStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [note, setNote] = useState('')
  const [rev, setRev] = useState({ scores: {}, recommendation: 'maybe', comment: '' })

  const load = useCallback(() => {
    api.get('/careers/applications/' + id).then(r => {
      const x = r.data.data.application
      setA(x); setStatus(x.status)
      const mine = (x.reviews || []).find(rv => String(rv.by) === String(user?._id))
      if (mine) setRev({ scores: mine.scores || {}, recommendation: mine.recommendation, comment: mine.comment || '' })
    }).catch(e => { toast?.error?.(e?.response?.data?.message || 'Could not open the application.'); onClose() })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(load, [load])
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])

  const act = async (fn, ok) => { try { await fn(); toast?.ok?.(ok); load(); onChanged?.() } catch (e) { toast?.error?.(e?.response?.data?.message || 'That did not work.') } }
  const saveStatus = () => act(() => api.patch(`/careers/applications/${id}/status`, { status, note: statusNote }).then(() => setStatusNote('')), 'Status updated.')
  const assignMe = (me) => act(() => api.patch(`/careers/applications/${id}`, { assignedTo: me ? user?._id : null }), me ? 'Assigned to you.' : 'Unassigned.')
  const addNote = () => note.trim() && act(() => api.post(`/careers/applications/${id}/notes`, { text: note }).then(() => setNote('')), 'Note added.')
  const saveReview = () => act(() => api.post(`/careers/applications/${id}/reviews`, rev), 'Review saved.')

  const sec = { fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: TOKENS.crimson, margin: '14px 0 8px' }
  const row = (k, v) => v || v === 0 ? <div style={{ display: 'flex', gap: 10, fontSize: 13, padding: '5px 0', borderBottom: `1px solid ${line}` }}><span style={{ width: 170, flexShrink: 0, color: TOKENS.s500 }}>{k}</span><span style={{ color: TOKENS.ink, whiteSpace: 'pre-wrap' }}>{v}</span></div> : null
  const demo = a?.demoLesson || {}
  const yt = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/.exec(demo.url || '')

  return (
    <div role="dialog" aria-modal="true" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,10,10,.45)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(760px, 100%)', height: '100%', background: '#FBFAF5', overflowY: 'auto', padding: '20px 22px 60px', boxSizing: 'border-box', color: TOKENS.ink }}>
        {!a ? <div style={{ padding: 40, color: TOKENS.s500 }}>Loading…</div> : (<>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: TOKENS.s500, fontWeight: 700 }}>{a.ref} · submitted {fmtD(a.submittedAt)}</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{a.firstName} {a.lastName}</div>
              <div style={{ fontSize: 13, color: TOKENS.s600 }}>{POS[a.position]}{a.roleTitle ? ': ' + a.roleTitle : ''} · {[a.city, a.country].filter(Boolean).join(', ')}</div>
              <div style={{ fontSize: 13, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href={'mailto:' + a.email}>{a.email}</a>{a.phone && <a href={'tel:' + a.phone.replace(/\s/g, '')}>{a.phone}</a>}
                {a.phone && <a href={'https://wa.me/' + a.phone.replace(/[^\d]/g, '')} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
                {a.linkedin && <a href={a.linkedin} target="_blank" rel="noopener noreferrer">Profile</a>}
              </div>
            </div>
            <button className="btn btn-s btn-sm" onClick={onClose}>Close</button>
          </div>

          <div className="card" style={{ padding: 12, marginTop: 12, display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge s={a.status} />
              {a.avgScore != null && <span style={{ fontSize: 12.5, fontWeight: 700 }}>Score {a.avgScore} / 5 ({a.reviews.length} review{a.reviews.length === 1 ? '' : 's'})</span>}
              <span style={{ fontSize: 12.5, color: TOKENS.s500 }}>{a.assignedToName ? 'Assigned to ' + a.assignedToName : 'Unassigned'}</span>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                {String(a.assignedTo) !== String(user?._id) ? <button className="btn btn-s btn-sm" onClick={() => assignMe(true)}>Assign to me</button> : <button className="btn btn-s btn-sm" onClick={() => assignMe(false)}>Unassign</button>}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select style={inp} value={status} onChange={e => setStatus(e.target.value)}>{APPLICATION_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select>
              <input style={{ ...inp, flex: 1, minWidth: 160 }} placeholder="Note for this change (optional)" value={statusNote} onChange={e => setStatusNote(e.target.value)} />
              <button className="btn btn-p btn-sm" disabled={status === a.status && !statusNote} onClick={saveStatus}>Update status</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, margin: '14px 0 4px', flexWrap: 'wrap' }}>
            {[['profile', 'Profile'], ['documents', `Documents${a.missingDocs?.length || a.pendingDocs?.length ? ' ⚠' : ''}`], ['demo', 'Demo lesson'], ['reviews', `Reviews (${a.reviews.length})`], ['notes', `Notes (${a.notes.length})`], ['history', 'History']].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={chip(tab === k)}>{l}</button>
            ))}
          </div>

          {tab === 'profile' && (<div className="card" style={{ padding: 14 }}>
            <div style={sec}>Teaching</div>
            {row('Subjects', (a.subjects || []).join(', '))}{row('Curricula', (a.curricula || []).join(', '))}{row('Levels', (a.levels || []).join(', '))}
            {row('Years teaching', a.yearsExperience)}{row('Years online', a.yearsOnline)}{row('Highest qualification', a.highestQualification)}
            {row('Teaching qualification', a.teachingQualification)}{row('Registration', a.registration)}{row('Examiner experience', a.examinerExperience)}
            <div style={sec}>Availability</div>
            {row('Employment', { full_time: 'Full-time', part_time: 'Part-time', either: 'Either' }[a.employment])}{row('Hours a week', a.hoursPerWeek)}
            {row('Available from', a.availableFrom ? fmtD(a.availableFrom) : '')}{row('Expected pay', a.expectedPay)}{row('Time zone', a.timezone)}
            <div style={sec}>Setup</div>
            {row('Internet', a.setup?.internet)}{row('Backup power', a.setup?.backupPower ? 'Yes' : 'No')}{row('Headset and webcam', a.setup?.headsetWebcam ? 'Yes' : 'No')}{row('Pen tablet', a.setup?.pentablet ? 'Yes' : 'No')}
            <div style={sec}>Cover letter</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{a.coverLetter || '—'}</div>
            {row('Heard about us', a.howHeard)}
          </div>)}

          {tab === 'documents' && (<div className="card" style={{ padding: 14 }}>
            {(a.missingDocs?.length > 0) && <div style={{ fontSize: 13, color: TOKENS.accentRose, marginBottom: 8 }}>Missing: {a.missingDocs.join(', ')}</div>}
            {(a.documents || []).map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${line}`, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 180 }}><div style={{ fontWeight: 700, fontSize: 13.5 }}>{d.label}</div>
                  <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>{d.file ? `${d.file.filename} · ${size(d.file.sizeBytes)}` : 'In progress' + (d.note ? ': ' + d.note : '')}</div></div>
                {d.url ? <a className="btn btn-s btn-sm" href={d.url} target="_blank" rel="noopener noreferrer">Open</a> : d.pending ? <span style={{ fontSize: 12, color: TOKENS.accentAmber, fontWeight: 700 }}>In progress</span> : null}
              </div>
            ))}
            <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 8 }}>Links are private and expire after an hour; reopen the application for fresh ones.</div>
          </div>)}

          {tab === 'demo' && (<div className="card" style={{ padding: 14, display: 'grid', gap: 10 }}>
            {!demo.file && !demo.url && <div style={{ color: TOKENS.s500, fontSize: 13 }}>No demo lesson (non-teaching role).</div>}
            {demo.fileUrl && <video src={demo.fileUrl} controls preload="metadata" style={{ width: '100%', borderRadius: 10, background: '#000', maxHeight: 420 }} />}
            {yt && <iframe title="Demo lesson" src={`https://www.youtube-nocookie.com/embed/${yt[1]}`} style={{ width: '100%', aspectRatio: '16 / 9', border: 0, borderRadius: 10 }} allowFullScreen />}
            {demo.url && <a href={demo.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13 }}>Open the demo lesson link</a>}
            {row('Topic', demo.topic)}{row('Subject', demo.subject)}{row('Level', demo.level)}{row('Length', demo.minutes ? demo.minutes + ' min' : '')}{row('Notes', demo.notes)}
            <button className="btn btn-s btn-sm" style={{ justifySelf: 'start' }} onClick={() => setTab('reviews')}>Score this demo lesson</button>
          </div>)}

          {tab === 'reviews' && (<div className="card" style={{ padding: 14, display: 'grid', gap: 10 }}>
            <div style={{ fontWeight: 800 }}>Your review</div>
            {REVIEW_CRITERIA.map(c => (
              <div key={c.key} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ width: 230, fontSize: 13 }}>{c.label}</span>
                {[1, 2, 3, 4, 5].map(n => <button key={n} onClick={() => setRev(r => ({ ...r, scores: { ...r.scores, [c.key]: n } }))} style={{ ...chip(rev.scores[c.key] === n), padding: '5px 11px' }}>{n}</button>)}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ width: 230, fontSize: 13 }}>Recommendation</span>
              {[['hire', 'Hire'], ['maybe', 'Maybe'], ['no', 'Do not progress']].map(([k, l]) => <button key={k} onClick={() => setRev(r => ({ ...r, recommendation: k }))} style={chip(rev.recommendation === k)}>{l}</button>)}
            </div>
            <textarea style={{ ...inp, minHeight: 80 }} placeholder="Comments: strengths, concerns, what to probe at interview" value={rev.comment} onChange={e => setRev(r => ({ ...r, comment: e.target.value }))} />
            <button className="btn btn-p btn-sm" style={{ justifySelf: 'start' }} onClick={saveReview}>Save review</button>
            <div style={sec}>All reviews</div>
            {!a.reviews.length && <div style={{ fontSize: 13, color: TOKENS.s500 }}>No reviews yet.</div>}
            {a.reviews.map((r, i) => (
              <div key={i} style={{ borderTop: `1px solid ${line}`, paddingTop: 8, fontSize: 13 }}>
                <b>{r.name}</b> <span style={{ color: TOKENS.s500 }}>· {fmtDT(r.at)} · {{ hire: 'Hire', maybe: 'Maybe', no: 'Do not progress' }[r.recommendation]}</span>
                <div style={{ color: TOKENS.s600 }}>{REVIEW_CRITERIA.filter(c => r.scores?.[c.key]).map(c => `${c.label} ${r.scores[c.key]}`).join(' · ')}</div>
                {r.comment && <div style={{ whiteSpace: 'pre-wrap', marginTop: 3 }}>{r.comment}</div>}
              </div>
            ))}
          </div>)}

          {tab === 'notes' && (<div className="card" style={{ padding: 14, display: 'grid', gap: 8 }}>
            <textarea style={{ ...inp, minHeight: 70 }} placeholder="Add a note (visible to Admin, Dean and QA)" value={note} onChange={e => setNote(e.target.value)} />
            <button className="btn btn-p btn-sm" style={{ justifySelf: 'start' }} onClick={addNote} disabled={!note.trim()}>Add note</button>
            {[...a.notes].reverse().map((n, i) => <div key={i} style={{ borderTop: `1px solid ${line}`, paddingTop: 8, fontSize: 13 }}><b>{n.name}</b> <span style={{ color: TOKENS.s500 }}>· {fmtDT(n.at)}</span><div style={{ whiteSpace: 'pre-wrap' }}>{n.text}</div></div>)}
          </div>)}

          {tab === 'history' && (<div className="card" style={{ padding: 14 }}>
            {[...a.statusHistory].reverse().map((h, i) => <div key={i} style={{ fontSize: 13, padding: '6px 0', borderBottom: `1px solid ${line}` }}><Badge s={h.status} /> <span style={{ color: TOKENS.s500 }}>{fmtDT(h.at)} · {h.name}</span>{h.note && <div style={{ marginTop: 3 }}>{h.note}</div>}</div>)}
          </div>)}
        </>)}
      </div>
    </div>
  )
}
