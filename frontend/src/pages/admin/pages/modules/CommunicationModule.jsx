import React, { useState, useEffect } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { PCard, PSection } from '../shared/ui.jsx'

function CommunicationModule({ refreshKey, toast }) {
  const [view, setView] = useState('compose')   // compose | history

  return (
    <>
      <PSection
        tag="Communication"
        title="Reach the"
        em="Community"
        sub="Send branded emails to teachers, students, parents — or any address."
      />

      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {[
          { id: 'compose', label: 'Compose' },
          { id: 'history', label: 'History' },
        ].map(t => (
          <button key={t.id} onClick={() => setView(t.id)}
            style={{
              padding: '8px 18px', borderRadius: 99,
              border: `1.5px solid ${view === t.id ? TOKENS.crimson : (TOKENS.line || '#E8E2D6')}`,
              background: view === t.id ? TOKENS.crimson : '#fff',
              color: view === t.id ? '#fff' : TOKENS.crimson,
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {view === 'compose' ? <ComposeView toast={toast} /> : <HistoryView refreshKey={refreshKey} toast={toast} />}
    </>
  )
}

function ComposeView({ toast }) {
  const [recipients, setRecipients] = useState([])      // full community
  const [loading, setLoading] = useState(true)

  const [pickedIds, setPickedIds] = useState(new Set()) // selected user _ids
  const [externalText, setExternalText] = useState('')  // typed addresses, comma/newline separated
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const [attachments, setAttachments] = useState([])    // [{ name, url }]
  const [uploading, setUploading] = useState(false)

  const [sending, setSending] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    api.get('/communication/recipients')
      .then(r => setRecipients(r.data.data?.recipients || []))
      .catch(() => toast?.error?.('Failed to load recipients.'))
      .finally(() => setLoading(false))
  }, [toast])

  const filtered = recipients.filter(r => {
    if (roleFilter !== 'all' && r.role !== roleFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!r.name.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q)) return false
    }
    return true
  })

  const toggle = (id) => {
    setPickedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setConfirm(false)
  }

  // Quick group selection — adds everyone of a role to the picked set
  const pickGroup = (role) => {
    const ids = recipients.filter(r => r.role === role).map(r => r._id)
    setPickedIds(prev => {
      const next = new Set(prev)
      const allIn = ids.every(id => next.has(id))
      ids.forEach(id => allIn ? next.delete(id) : next.add(id))
      return next
    })
    setConfirm(false)
  }

  const externalList = externalText
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(Boolean)

  const totalCount = pickedIds.size + externalList.length

  const uploadFile = async (file) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast?.error?.('File exceeds 10 MB.'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/communication/upload-attachment', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data?.success) {
        setAttachments(a => [...a, data.data])
        toast?.ok?.('Attached ' + data.data.name)
      } else {
        toast?.error?.(data?.message || 'Upload failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const send = async () => {
    if (!subject.trim()) { toast?.error?.('Subject is required.'); return }
    if (!body.trim())    { toast?.error?.('Message body is required.'); return }
    if (totalCount === 0) { toast?.error?.('Pick at least one recipient.'); return }

    setSending(true)
    try {
      // Build an audience label
      let audience = ''
      const roles = ['teacher', 'student', 'parent', 'accountant', 'sales', 'ops_manager', 'dos']
      const groupLabels = []
      for (const role of roles) {
        const roleIds = recipients.filter(r => r.role === role).map(r => r._id)
        if (roleIds.length > 0 && roleIds.every(id => pickedIds.has(id))) {
          groupLabels.push('All ' + role.charAt(0).toUpperCase() + role.slice(1) + 's')
        }
      }
      audience = groupLabels.length > 0
        ? groupLabels.join(', ') + (externalList.length ? ' + external' : '')
        : `${totalCount} recipient${totalCount === 1 ? '' : 's'}`

      const { data } = await api.post('/communication/send', {
        subject: subject.trim(),
        body,
        userIds: [...pickedIds],
        externalEmails: externalList,
        attachments,
        audience,
      })
      if (data?.success) {
        setResult(data.data)
        toast?.ok?.(data.message || 'Sent.')
        setConfirm(false)
      } else {
        toast?.error?.(data?.message || 'Send failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Send failed.')
    } finally {
      setSending(false)
    }
  }

  const resetAll = () => {
    setPickedIds(new Set()); setExternalText(''); setSubject(''); setBody('')
    setAttachments([]); setConfirm(false); setResult(null)
  }

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', borderRadius: 6,
    border: '1.5px solid #E8E2D6', fontSize: 13, fontFamily: 'inherit',
  }
  const lbl = {
    display: 'block', fontSize: 10.5, fontWeight: 700,
    letterSpacing: '.06em', textTransform: 'uppercase',
    color: TOKENS.crimson, marginBottom: 5,
  }

  // Sent — show result summary
  if (result) {
    return (
      <PCard padding={28}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#DCFCE7', color: '#15803D',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: TOKENS.ink || '#1A1A1A' }}>
            Campaign sent
          </div>
          <div style={{ fontSize: 13.5, color: '#6B6B6B', marginTop: 6 }}>
            {result.sentCount} delivered{result.failedCount > 0 ? ` · ${result.failedCount} failed` : ''}
          </div>
          {result.failedCount > 0 && (
            <div style={{
              marginTop: 14, textAlign: 'left',
              background: '#FEF2F2', border: '1px solid #FCA5A5',
              borderRadius: 8, padding: 12, fontSize: 12, color: '#991B1B',
              maxHeight: 160, overflowY: 'auto',
            }}>
              <strong>Failed:</strong>
              {(result.results || []).filter(r => r.status === 'failed').map((r, i) => (
                <div key={i}>{r.email} — {r.error || 'unknown error'}</div>
              ))}
            </div>
          )}
          <button onClick={resetAll}
            style={{
              marginTop: 18, background: TOKENS.crimson, color: '#fff',
              border: 'none', padding: '10px 24px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            New Campaign
          </button>
        </div>
      </PCard>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 340px)', gap: 14 }}>
      {/* LEFT — compose */}
      <PCard padding={20}>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Subject</label>
          <input value={subject} onChange={e => { setSubject(e.target.value); setConfirm(false) }}
            placeholder="Email subject" style={inp}/>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Message</label>
          <textarea value={body} onChange={e => { setBody(e.target.value); setConfirm(false) }}
            rows={11} placeholder="Write your message. Leave a blank line between paragraphs."
            style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}/>
          <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 4 }}>
            Wrapped in the Smartious branded template. Blank lines become paragraphs.
          </div>
        </div>

        {/* Attachments */}
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Attachments</label>
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
              {attachments.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', background: '#FBFAF5',
                  border: '1px solid #E8E2D6', borderRadius: 6, fontSize: 12,
                }}>
                  <span style={{ flex: 1, color: '#1A1A1A' }}>{a.name}</span>
                  <button onClick={() => setAttachments(list => list.filter((_, idx) => idx !== i))}
                    style={{ background: 'transparent', border: 'none', color: '#B91C1C', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          <label style={{
            display: 'inline-block',
            background: '#fff', color: TOKENS.crimson,
            border: `1.5px solid ${TOKENS.crimson}`,
            padding: '7px 14px', borderRadius: 6,
            cursor: uploading ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700,
          }}>
            <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ display: 'none' }}
              onChange={e => { uploadFile(e.target.files?.[0]); e.target.value = '' }}/>
            {uploading ? 'Uploading...' : '+ Add Attachment (PDF, max 10 MB)'}
          </label>
        </div>

        {/* Send */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
          {!confirm ? (
            <button onClick={() => {
              if (!subject.trim() || !body.trim()) { toast?.error?.('Subject and message are required.'); return }
              if (totalCount === 0) { toast?.error?.('Pick at least one recipient.'); return }
              setConfirm(true)
            }}
              style={{
                background: TOKENS.crimson, color: '#fff', border: 'none',
                padding: '10px 22px', borderRadius: 6,
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}>
              Review &amp; Send
            </button>
          ) : (
            <>
              <span style={{ fontSize: 12, color: '#6B6B6B' }}>
                Send to {totalCount} recipient{totalCount === 1 ? '' : 's'}?
              </span>
              <button onClick={() => setConfirm(false)} disabled={sending}
                style={{
                  background: '#fff', color: '#6B6B6B', border: '1.5px solid #E8E2D6',
                  padding: '10px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                }}>
                Cancel
              </button>
              <button onClick={send} disabled={sending}
                style={{
                  background: sending ? '#9CA3AF' : '#15803D', color: '#fff', border: 'none',
                  padding: '10px 22px', borderRadius: 6,
                  cursor: sending ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700,
                }}>
                {sending ? 'Sending...' : 'Confirm Send'}
              </button>
            </>
          )}
        </div>
      </PCard>

      {/* RIGHT — recipients */}
      <PCard padding={16}>
        <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Recipients ({pickedIds.size + externalList.length})
        </div>

        {/* Quick groups */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {[
            { role: 'teacher', label: 'All Teachers' },
            { role: 'student', label: 'All Students' },
            { role: 'parent',  label: 'All Parents' },
          ].map(g => (
            <button key={g.role} onClick={() => pickGroup(g.role)}
              style={{
                background: '#FBF6E3', color: TOKENS.crimson,
                border: '1px solid #E8E2D6', borderRadius: 99,
                padding: '5px 10px', fontSize: 10.5, fontWeight: 700, cursor: 'pointer',
              }}>
              {g.label}
            </button>
          ))}
        </div>

        {/* Search + role filter */}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search community..."
          style={{ ...inp, marginBottom: 6 }}/>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {['all', 'teacher', 'student', 'parent'].map(rf => (
            <button key={rf} onClick={() => setRoleFilter(rf)}
              style={{
                flex: 1, padding: '5px 4px', borderRadius: 5,
                border: `1px solid ${roleFilter === rf ? TOKENS.crimson : '#E8E2D6'}`,
                background: roleFilter === rf ? TOKENS.crimson : '#fff',
                color: roleFilter === rf ? '#fff' : '#6B6B6B',
                fontSize: 10, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
              }}>
              {rf}
            </button>
          ))}
        </div>

        {/* Community list */}
        <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #E8E2D6', borderRadius: 6, padding: 5, marginBottom: 10 }}>
          {loading ? (
            <div style={{ padding: 14, fontSize: 12, color: '#6B6B6B', textAlign: 'center' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 14, fontSize: 12, color: '#6B6B6B', textAlign: 'center' }}>No matches.</div>
          ) : filtered.map(r => {
            const on = pickedIds.has(r._id)
            return (
              <div key={r._id} onClick={() => toggle(r._id)}
                style={{
                  padding: '6px 8px', cursor: 'pointer',
                  background: on ? '#FBF6E3' : 'transparent',
                  borderRadius: 4, marginBottom: 2,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                <div style={{
                  width: 15, height: 15, borderRadius: 3, flexShrink: 0,
                  border: `1.5px solid ${on ? TOKENS.crimson : '#E8E2D6'}`,
                  background: on ? TOKENS.crimson : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {on && (
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#6B6B6B' }}>{r.role}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* External addresses */}
        <label style={lbl}>External Addresses</label>
        <textarea value={externalText} onChange={e => setExternalText(e.target.value)}
          rows={3} placeholder="prospect@email.com, another@email.com"
          style={{ ...inp, resize: 'vertical', fontSize: 12 }}/>
        <div style={{ fontSize: 10.5, color: '#6B6B6B', marginTop: 4 }}>
          Comma or line separated. Admin only — for marketing and outreach beyond the school.
        </div>
      </PCard>
    </div>
  )
}

function HistoryView({ refreshKey, toast }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/communication/history')
      .then(r => setHistory(r.data.data?.history || []))
      .catch(() => toast?.error?.('Failed to load history.'))
      .finally(() => setLoading(false))
  }, [refreshKey, toast])

  if (loading) {
    return <PCard padding={40}><div style={{ textAlign: 'center', color: '#6B6B6B' }}>Loading history...</div></PCard>
  }
  if (history.length === 0) {
    return <PCard padding={40}><div style={{ textAlign: 'center', color: '#6B6B6B' }}>No campaigns sent yet.</div></PCard>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {history.map(c => (
        <PCard key={c._id} padding={14}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: TOKENS.ink || '#1A1A1A' }}>
                {c.subject}
              </div>
              <div style={{ fontSize: 11.5, color: '#6B6B6B', marginTop: 2 }}>
                {c.audience} · {c.sentByName || 'Admin'} · {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                {Array.isArray(c.attachments) && c.attachments.length > 0 && ` · ${c.attachments.length} attachment${c.attachments.length === 1 ? '' : 's'}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{
                fontSize: 10.5, fontWeight: 700,
                background: '#DCFCE7', color: '#15803D',
                padding: '3px 9px', borderRadius: 99,
              }}>
                {c.sentCount} sent
              </span>
              {c.failedCount > 0 && (
                <span style={{
                  fontSize: 10.5, fontWeight: 700,
                  background: '#FEE2E2', color: '#B91C1C',
                  padding: '3px 9px', borderRadius: 99,
                }}>
                  {c.failedCount} failed
                </span>
              )}
            </div>
          </div>
        </PCard>
      ))}
    </div>
  )
}

export default CommunicationModule
