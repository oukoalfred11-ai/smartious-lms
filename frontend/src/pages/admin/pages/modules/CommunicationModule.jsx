/**
 * CommunicationModule.jsx
 * ============================================================
 * The REAL Communication module — the email centre the backend
 * (routes/communication.js) was built for. Replaces the temporary
 * re-export of the Curriculum Manager that previously sat on the
 * admin sidebar's Communication entry.
 *
 * Compose: pick recipients from the community (filter by role and
 * search, one-tap groups like All Teachers), optionally add typed
 * external addresses, attach files (uploaded through the existing
 * /upload-attachment endpoint), and send. Every send is recorded;
 * the History tab lists past campaigns with per-recipient status.
 */
import { useState, useEffect, useMemo } from 'react'
import { api } from '../../../../context/ctx.jsx'

const CRIMSON = '#7D1025'
const inputStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid #E8E0D0', borderRadius: 8, fontSize: 13.5, background: '#FFFFFF', color: '#1A1A1A', outline: 'none', boxSizing: 'border-box' }
const labelStyle = { fontSize: 11.5, fontWeight: 700, color: '#6B6B6B', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 6, display: 'block' }
const ROLE_LABEL = { teacher: 'Teacher', student: 'Student', parent: 'Parent', admin: 'Admin' }

function fmtWhen(d) {
  return d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
}

export default function CommunicationModule({ toast }) {
  const [tab, setTab] = useState('compose')

  const [people, setPeople] = useState([])
  const [chosen, setChosen] = useState({})
  const [roleFilter, setRoleFilter] = useState('all')
  const [q, setQ] = useState('')
  const [external, setExternal] = useState('')

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState([])
  const [attBusy, setAttBusy] = useState(false)
  const [sending, setSending] = useState(false)

  const [history, setHistory] = useState([])
  const [histLoading, setHistLoading] = useState(false)
  const [openHist, setOpenHist] = useState(null)

  useEffect(() => {
    api.get('/communication/recipients')
      .then(r => { if (r.data?.success) setPeople(r.data.data.recipients || []) })
      .catch(() => toast?.error?.('Could not load the recipient list.'))
  }, [])

  const loadHistory = () => {
    setHistLoading(true)
    api.get('/communication/history')
      .then(r => { if (r.data?.success) setHistory(r.data.data.history || []) })
      .catch(() => toast?.error?.('Could not load the send history.'))
      .finally(() => setHistLoading(false))
  }
  useEffect(() => { if (tab === 'history') loadHistory() }, [tab])

  const filtered = useMemo(() => people.filter(p =>
    (roleFilter === 'all' || p.role === roleFilter) &&
    (!q.trim() || p.name.toLowerCase().includes(q.trim().toLowerCase()) || p.email.toLowerCase().includes(q.trim().toLowerCase()))
  ), [people, roleFilter, q])

  const chosenIds = Object.keys(chosen).filter(id => chosen[id])
  const chosenCount = chosenIds.length
  const externalList = external.split(/[,;\s]+/).map(x => x.trim()).filter(Boolean)

  const pickRole = (role) => {
    const ids = people.filter(p => p.role === role).map(p => String(p._id))
    const allOn = ids.length > 0 && ids.every(id => chosen[id])
    setChosen(c => { const n = { ...c }; for (const id of ids) n[id] = !allOn; return n })
  }
  const audienceLabel = () => {
    const parts = []
    let covered = 0
    for (const role of ['teacher', 'student', 'parent', 'admin']) {
      const ids = people.filter(p => p.role === role).map(p => String(p._id))
      if (ids.length && ids.every(id => chosen[id])) { parts.push('All ' + ROLE_LABEL[role] + 's'); covered += ids.length }
    }
    const named = chosenCount - covered
    if (named > 0) parts.push(named + ' individual' + (named === 1 ? '' : 's'))
    if (externalList.length) parts.push(externalList.length + ' external')
    return parts.join(' + ') || (chosenCount + ' recipient' + (chosenCount === 1 ? '' : 's'))
  }

  const addAttachment = async (file) => {
    if (!file) return
    if (file.size > 20 * 1024 * 1024) { toast?.error?.('Attachments must be 20 MB or smaller.'); return }
    setAttBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/communication/upload-attachment', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (!data?.success) throw new Error(data?.message || 'Upload failed.')
      setAttachments(a => [...a, { name: data.data.name, url: data.data.url }])
    } catch (e) { toast?.error?.(e.message || 'Attachment upload failed.') }
    finally { setAttBusy(false) }
  }

  const doSend = async () => {
    if (!subject.trim()) return toast?.error?.('Subject is required.')
    if (!body.trim()) return toast?.error?.('Write the message body first.')
    if (chosenCount + externalList.length === 0) return toast?.error?.('Choose at least one recipient.')
    if (!window.confirm('Send this email to ' + (chosenCount + externalList.length) + ' recipient(s)?')) return
    setSending(true)
    try {
      const { data } = await api.post('/communication/send', {
        subject, body,
        userIds: chosenIds,
        externalEmails: externalList,
        attachments,
        audience: audienceLabel(),
      })
      if (!data?.success) throw new Error(data?.message || 'Send failed.')
      const d = data.data || {}
      toast?.ok?.('Sent to ' + (d.sentCount ?? (chosenCount + externalList.length)) + ' recipient(s)' + (d.failedCount ? ', ' + d.failedCount + ' failed' : '') + '.')
      setSubject(''); setBody(''); setAttachments([]); setChosen({}); setExternal('')
    } catch (e) { toast?.error?.(e.message || 'Send failed.') }
    finally { setSending(false) }
  }

  const chip = (on) => ({ background: on ? CRIMSON : '#FFFFFF', color: on ? '#FBFAF5' : '#3A2E2A', border: '1px solid ' + (on ? CRIMSON : '#E8E0D0'), borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ marginRight: 'auto' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700, color: '#080C14' }}>Communication</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Email the community: pick the audience, write once, every send is on record.</div>
        </div>
        <button onClick={() => setTab('compose')} style={chip(tab === 'compose')}>Compose</button>
        <button onClick={() => setTab('history')} style={chip(tab === 'history')}>History</button>
      </div>

      {tab === 'compose' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 380px) 1fr', gap: 16, alignItems: 'start' }}>
          <div className="card" style={{ border: '1px solid #E8E2D6', borderRadius: 12, padding: 14 }}>
            <label style={labelStyle}>Recipients {chosenCount + externalList.length > 0 ? '(' + (chosenCount + externalList.length) + ' chosen)' : ''}</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {['teacher', 'student', 'parent', 'admin'].map(r => (
                <button key={r} onClick={() => pickRole(r)} style={{ ...chip(false), padding: '5px 11px', fontSize: 11 }}>All {ROLE_LABEL[r]}s</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ ...inputStyle, width: 120, padding: '8px 10px' }}>
                <option value="all">All roles</option>
                <option value="teacher">Teachers</option>
                <option value="student">Students</option>
                <option value="parent">Parents</option>
                <option value="admin">Admins</option>
              </select>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or email..." style={{ ...inputStyle, padding: '8px 10px' }} />
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #F0EAE0', borderRadius: 8 }}>
              {filtered.map(p => (
                <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderBottom: '1px solid #F5F0E8', cursor: 'pointer', background: chosen[p._id] ? 'rgba(125,16,37,.05)' : '#FFFFFF' }}>
                  <input type="checkbox" checked={!!chosen[p._id]} onChange={() => setChosen(c => ({ ...c, [p._id]: !c[p._id] }))} />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1A1A', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: CRIMSON, background: 'rgba(125,16,37,.07)', borderRadius: 99, padding: '2px 8px' }}>{ROLE_LABEL[p.role] || p.role}</span>
                </label>
              ))}
              {filtered.length === 0 && <div style={{ padding: 14, fontSize: 12, color: '#8A8378' }}>Nobody matches.</div>}
            </div>
            <div style={{ marginTop: 10 }}>
              <label style={labelStyle}>External addresses (optional, comma separated)</label>
              <input value={external} onChange={e => setExternal(e.target.value)} placeholder="someone@example.com, other@example.com" style={inputStyle} />
            </div>
          </div>

          <div className="card" style={{ border: '1px solid #E8E2D6', borderRadius: 12, padding: 14 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Mid term break dates" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={10} placeholder="Write your message. Leave a blank line between paragraphs." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Attachments</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {attachments.map((a, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FBF6E3', border: '1px solid #E8D58F', borderRadius: 99, padding: '4px 10px', fontSize: 11.5, fontWeight: 700, color: '#7A5B12' }}>
                    {a.name}
                    <button onClick={() => setAttachments(list => list.filter((_, j) => j !== i))} style={{ background: 'transparent', border: 'none', color: '#B91C1C', fontWeight: 800, cursor: 'pointer', padding: 0 }}>&times;</button>
                  </span>
                ))}
                <input type="file" disabled={attBusy} style={{ fontSize: 12 }}
                  onChange={e => { const f0 = e.target.files && e.target.files[0]; e.target.value = ''; addAttachment(f0) }} />
                {attBusy && <span style={{ fontSize: 11.5, color: '#8A8378' }}>Uploading...</span>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button disabled={sending} onClick={doSend} className="btn-p" style={{ border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 13.5, cursor: sending ? 'wait' : 'pointer', opacity: sending ? .7 : 1 }}>
                {sending ? 'Sending...' : 'Send Email'}
              </button>
              <span style={{ fontSize: 12, color: '#6B7280' }}>{chosenCount + externalList.length > 0 ? 'To: ' + audienceLabel() : 'Choose recipients on the left.'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {histLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 13.5 }}>Loading history...</div>
          ) : history.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', background: '#FFFFFF', border: '1px dashed #D4C9B2', borderRadius: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>Nothing sent yet</div>
              <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 6 }}>Every email sent from Compose will be recorded here.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {history.map(h2 => (
                <div key={h2._id} className="card" style={{ border: '1px solid #E8E2D6', borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', cursor: 'pointer' }}
                    onClick={() => setOpenHist(openHist === h2._id ? null : h2._id)}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', flex: 1, minWidth: 200 }}>{h2.subject}</div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#6B7280' }}>{h2.audience || (h2.recipientCount + ' recipients')}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: '#15803D' }}>{h2.sentCount} sent</span>
                    {h2.failedCount > 0 && <span style={{ fontSize: 11.5, fontWeight: 800, color: '#B91C1C' }}>{h2.failedCount} failed</span>}
                    <span style={{ fontSize: 11.5, color: '#8A8378' }}>{fmtWhen(h2.createdAt)} {h2.sentByName ? '· ' + h2.sentByName : ''}</span>
                  </div>
                  {openHist === h2._id && (
                    <div style={{ marginTop: 10, borderTop: '1px solid #F0EAE0', paddingTop: 10 }}>
                      <div style={{ fontSize: 12.5, color: '#3A2E2A', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 10 }}>{h2.body}</div>
                      {Array.isArray(h2.attachments) && h2.attachments.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                          {h2.attachments.map((a, i) => (
                            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 700, color: CRIMSON, background: 'rgba(125,16,37,.07)', borderRadius: 99, padding: '3px 10px', textDecoration: 'none' }}>{a.name || 'Attachment'}</a>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(h2.recipients || []).map((r, i) => (
                          <span key={i} title={r.error || ''} style={{ fontSize: 10.5, fontWeight: 700, borderRadius: 99, padding: '2px 9px', background: r.status === 'failed' ? '#FEE2E2' : '#F0FDF4', color: r.status === 'failed' ? '#B91C1C' : '#15803D' }}>
                            {r.name || r.email}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
