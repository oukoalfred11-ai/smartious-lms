/**
 * SupportCard.jsx — the user side of the Support Desk. Lives on each
 * portal's messages page: open a request, chat with the school, see
 * every past thread. Self contained; only needs the shared api.
 */
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../context/ctx.jsx'

const CRIM = '#7D1025', GOLD = '#C9973A', INK = '#231715', MUT = '#8A8378', LINE = '#E5DFD3'
const STATUS = {
  open: { label: 'Waiting for school', color: '#B07A18', bg: '#FBF4E4' },
  awaiting_user: { label: 'School replied', color: '#15803D', bg: '#EDF7EF' },
  resolved: { label: 'Resolved', color: MUT, bg: '#F2EFE9' },
}
const rel = (d) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function SupportCard() {
  const [tickets, setTickets] = useState([])
  const [openId, setOpenId] = useState(null)
  const [composing, setComposing] = useState(false)
  const [subject, setSubject] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    api.get('/support/mine').then(r => setTickets(r.data?.data?.tickets || [])).catch(() => {})
  }, [])
  useEffect(() => { load() }, [load])

  const create = async () => {
    if (!subject.trim() || !msg.trim() || busy) return
    setBusy(true)
    try {
      await api.post('/support', { subject: subject.trim(), body: msg.trim() })
      setSubject(''); setMsg(''); setComposing(false); load()
    } catch (e) { /* stay composing */ } finally { setBusy(false) }
  }
  const reply = async () => {
    if (!msg.trim() || busy) return
    setBusy(true)
    try { await api.post(`/support/${openId}/messages`, { body: msg.trim() }); setMsg(''); load() }
    catch (e) { /* keep text */ } finally { setBusy(false) }
  }

  const open = tickets.find(t => t._id === openId)

  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: '.12em', color: GOLD, textTransform: 'uppercase' }}>Support Desk</div>
          <div style={{ fontSize: 12, color: MUT, marginTop: 2 }}>Anything unclear or not working? Write to the school. We reply the same day.</div>
        </div>
        {!composing && !open && (
          <button onClick={() => { setComposing(true); setOpenId(null) }}
            style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: CRIM, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>New request</button>
        )}
      </div>

      {composing && (
        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject, for example: I cannot open my homework"
            style={{ padding: '9px 11px', border: `1.5px solid ${LINE}`, borderRadius: 9, fontSize: 12.5 }} />
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3} placeholder="Describe what you need help with..."
            style={{ padding: '9px 11px', border: `1.5px solid ${LINE}`, borderRadius: 9, fontSize: 12.5, resize: 'vertical', fontFamily: 'inherit' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={create} disabled={busy} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: CRIM, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>Send to the school</button>
            <button onClick={() => setComposing(false)} style={{ padding: '8px 14px', borderRadius: 9, border: `1.5px solid ${LINE}`, background: '#fff', color: MUT, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {!composing && !open && tickets.length > 0 && (
        <div style={{ display: 'grid', gap: 6, marginTop: 12 }}>
          {tickets.map(t => {
            const st = STATUS[t.status] || STATUS.open
            return (
              <button key={t._id} onClick={() => { setOpenId(t._id); setMsg('') }}
                style={{ display: 'flex', gap: 10, alignItems: 'center', textAlign: 'left', padding: '9px 12px', borderRadius: 10, border: `1px solid ${LINE}`, background: '#FBF9F5', cursor: 'pointer' }}>
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</span>
                <span style={{ fontSize: 9.5, fontWeight: 800, color: st.color, background: st.bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>{st.label}</span>
                <span style={{ fontSize: 10, color: MUT, whiteSpace: 'nowrap' }}>{rel(t.updatedAt)}</span>
              </button>
            )
          })}
        </div>
      )}

      {open && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <button onClick={() => setOpenId(null)} style={{ border: 'none', background: 'none', color: CRIM, fontSize: 12, fontWeight: 800, cursor: 'pointer', padding: 0 }}>{'\u2190'} All requests</button>
            <b style={{ fontSize: 12.5, color: INK, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{open.subject}</b>
          </div>
          <div style={{ display: 'grid', gap: 6, maxHeight: 260, overflow: 'auto', padding: '4px 2px' }}>
            {open.messages.map((m, i) => (
              <div key={i} style={{ justifySelf: m.staff ? 'start' : 'end', maxWidth: '85%', background: m.staff ? '#F7F2EA' : CRIM, color: m.staff ? INK : '#fff', borderRadius: m.staff ? '12px 12px 12px 3px' : '12px 12px 3px 12px', padding: '8px 12px' }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, opacity: 0.75, marginBottom: 2 }}>{m.staff ? 'Smartious Support' : 'You'} {'\u00b7'} {rel(m.at)}</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>{m.body}</div>
              </div>
            ))}
          </div>
          {open.status !== 'resolved' || true ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') reply() }} placeholder="Write a reply..."
                style={{ flex: 1, padding: '9px 11px', border: `1.5px solid ${LINE}`, borderRadius: 9, fontSize: 12.5 }} />
              <button onClick={reply} disabled={busy} style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: CRIM, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>Send</button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
