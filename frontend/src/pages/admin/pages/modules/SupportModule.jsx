/**
 * SupportModule.jsx — the staff side of the Support Desk (admin and
 * operations manager). Every request as a chat thread, with the
 * response clock in plain sight so requests are answered on time.
 */
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { PSection } from '../shared/ui.jsx'

const CRIM = '#7D1025', GOLD = '#C9973A', INK = '#231715', MUT = '#8A8378', LINE = '#E5DFD3', GREEN = '#15803D', RED = '#B91C1C'
const STATUS = {
  open: { label: 'Open', color: '#B07A18', bg: '#FBF4E4' },
  awaiting_user: { label: 'Awaiting user', color: GREEN, bg: '#EDF7EF' },
  resolved: { label: 'Resolved', color: MUT, bg: '#F2EFE9' },
}
const rel = (d) => {
  if (!d) return '—'
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
}
const mins = (m) => m == null ? '—' : m < 60 ? m + 'm' : Math.floor(m / 60) + 'h ' + (m % 60) + 'm'

export default function SupportModule({ toast }) {
  const [data, setData] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [filter, setFilter] = useState('active')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    api.get('/support/manage')
      .then(r => setData(r.data?.data || null))
      .catch(e => toast?.error?.(e?.response?.data?.message || 'Could not load the Support Desk.'))
  }, [toast])
  useEffect(() => { load(); const t = setInterval(load, 45000); return () => clearInterval(t) }, [load])

  const reply = async () => {
    if (!msg.trim() || busy) return
    setBusy(true)
    try { await api.post(`/support/${openId}/messages`, { body: msg.trim() }); setMsg(''); load() }
    catch (e) { toast?.error?.('Reply failed.') } finally { setBusy(false) }
  }
  const setStatus = async (status) => {
    try { await api.patch(`/support/${openId}`, { status }); load() }
    catch (e) { toast?.error?.('Could not update status.') }
  }

  if (!data) return <div style={{ padding: 30, color: MUT, fontSize: 13 }}>Loading the Support Desk...</div>

  const rows = data.rows
    .filter(r => filter === 'all' ? true : filter === 'resolved' ? r.status === 'resolved' : r.status !== 'resolved')
    .sort((a, b) => (b.waitingMins - a.waitingMins) || (new Date(b.updatedAt) - new Date(a.updatedAt)))
  const open = data.rows.find(r => r._id === openId)
  const card = { background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 16 }
  const kpi = (label, value, color) => (
    <div style={{ ...card, minWidth: 118, padding: 14 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.07em', color: MUT, textTransform: 'uppercase' }}>{label}</div>
    </div>
  )

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <PSection tag="Operations" title="Support" em="Desk"
        sub="Every request from students, teachers and parents, with the response clock running. Longest waiting sits at the top." />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {kpi('Open', data.kpis.open, '#B07A18')}
        {kpi('Unanswered', data.kpis.unanswered, data.kpis.unanswered ? RED : INK)}
        {kpi('Overdue 4h+', data.kpis.overdue, data.kpis.overdue ? RED : GREEN)}
        {kpi('Avg first response', mins(data.kpis.avgFirstResponseMins), INK)}
        {kpi('Resolved, 7 days', data.kpis.resolved7d, GREEN)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(0, 1.5fr)', gap: 16, alignItems: 'start' }}>
        {/* List */}
        <div style={card}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {[['active', 'Active'], ['resolved', 'Resolved'], ['all', 'All']].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)}
                style={{ padding: '5px 13px', borderRadius: 999, border: `1.5px solid ${filter === k ? CRIM : LINE}`, background: filter === k ? CRIM : '#fff', color: filter === k ? '#fff' : MUT, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>{l}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 6, maxHeight: 520, overflow: 'auto' }}>
            {rows.length === 0 && <div style={{ fontSize: 12, color: MUT, padding: 10 }}>Nothing here. A quiet desk is a good desk.</div>}
            {rows.map(r => {
              const st = STATUS[r.status]
              const late = r.waitingMins > 240
              return (
                <button key={r._id} onClick={() => { setOpenId(r._id); setMsg('') }}
                  style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: openId === r._id ? '#FBF4E4' : '#FBF9F5', border: `1px solid ${late ? '#F0C9C9' : openId === r._id ? GOLD : LINE}` }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <b style={{ flex: 1, fontSize: 12.5, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.subject}</b>
                    <span style={{ fontSize: 9, fontWeight: 800, color: st.color, background: st.bg, borderRadius: 999, padding: '2px 9px', whiteSpace: 'nowrap' }}>{st.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 10.5, color: MUT, marginTop: 3 }}>
                    <span>{r.userName} {'\u00b7'} {r.userRole}</span>
                    <span style={{ flex: 1 }} />
                    {r.waitingMins > 0 && <span style={{ fontWeight: 800, color: late ? RED : '#B07A18' }}>waiting {mins(r.waitingMins)}</span>}
                    <span>{rel(r.updatedAt)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Thread */}
        <div style={card}>
          {!open ? (
            <div style={{ padding: 40, textAlign: 'center', color: MUT, fontSize: 12.5 }}>Select a request to read the thread and reply.</div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', borderBottom: `1px solid ${LINE}`, paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: 13.5, color: INK }}>{open.subject}</b>
                  <div style={{ fontSize: 11, color: MUT }}>{open.userName} {'\u00b7'} {open.userRole} {'\u00b7'} {open.userEmail}</div>
                </div>
                {open.status !== 'resolved'
                  ? <button onClick={() => setStatus('resolved')} style={{ padding: '7px 14px', borderRadius: 9, border: `1.5px solid ${GREEN}`, background: '#fff', color: GREEN, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Mark resolved</button>
                  : <button onClick={() => setStatus('open')} style={{ padding: '7px 14px', borderRadius: 9, border: `1.5px solid ${LINE}`, background: '#fff', color: MUT, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Reopen</button>}
              </div>
              <div style={{ display: 'grid', gap: 6, maxHeight: 360, overflow: 'auto', padding: '2px' }}>
                {open.messages.map((m, i) => (
                  <div key={i} style={{ justifySelf: m.staff ? 'end' : 'start', maxWidth: '82%', background: m.staff ? CRIM : '#F7F2EA', color: m.staff ? '#fff' : INK, borderRadius: m.staff ? '12px 12px 3px 12px' : '12px 12px 12px 3px', padding: '8px 12px' }}>
                    <div style={{ fontSize: 9.5, fontWeight: 800, opacity: 0.75, marginBottom: 2 }}>{m.senderName} {'\u00b7'} {rel(m.at)}</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>{m.body}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') reply() }} placeholder="Write the school's reply..."
                  style={{ flex: 1, padding: '10px 12px', border: `1.5px solid ${LINE}`, borderRadius: 9, fontSize: 12.5 }} />
                <button onClick={reply} disabled={busy} style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: CRIM, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>Reply</button>
              </div>
            </>
          )}
        </div>
      </div>
      <div style={{ fontSize: 10.5, color: MUT }}>{data.method} The requester is emailed on every staff reply; admin and the operations manager are emailed on every new request and user reply.</div>
    </div>
  )
}
