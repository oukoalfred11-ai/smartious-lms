/**
 * MessagesOversightModule.jsx — read only view of every direct
 * conversation in the school, for admin and the operations manager.
 * In a school, messaging between adults and children is supervised
 * by design; the portals tell users the school can see conversations.
 */
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { PSection } from '../shared/ui.jsx'

const CRIM = '#7D1025', GOLD = '#C9973A', INK = '#231715', MUT = '#8A8378', LINE = '#E5DFD3'
const rel = (d) => {
  if (!d) return ''
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function MessagesOversightModule({ toast }) {
  const [convos, setConvos] = useState([])
  const [method, setMethod] = useState('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)

  const load = useCallback(() => {
    api.get('/dm/oversight/conversations')
      .then(r => { const d = r.data?.data || {}; setConvos(d.conversations || []); setMethod(d.method || '') })
      .catch(e => toast?.error?.(e?.response?.data?.message || 'Could not load conversations.'))
  }, [toast])
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t) }, [load])

  const openThread = (id) => {
    api.get(`/dm/oversight/conversations/${id}/messages`)
      .then(r => setOpen(r.data?.data || null))
      .catch(() => toast?.error?.('Could not open the thread.'))
  }

  const rows = convos.filter(c => {
    if (!q.trim()) return true
    const hay = (c.participantMeta || []).map(p => p.name + ' ' + p.role).join(' ') + ' ' + (c.lastMessageText || '')
    return hay.toLowerCase().includes(q.toLowerCase())
  })
  const card = { background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 14 }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <PSection tag="Operations" title="Messages" em="Oversight"
        sub="Every direct conversation in the school, read only, newest first. Users are told the school can see conversations." />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(0, 1.4fr)', gap: 16, alignItems: 'start' }}>
        <div style={card}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, role or last message..."
            style={{ width: '100%', padding: '8px 11px', border: `1.5px solid ${LINE}`, borderRadius: 9, fontSize: 12, boxSizing: 'border-box', marginBottom: 10 }} />
          <div style={{ display: 'grid', gap: 6, maxHeight: 500, overflow: 'auto' }}>
            {rows.length === 0 && <div style={{ fontSize: 12, color: MUT, padding: 8 }}>No conversations yet.</div>}
            {rows.map(c => (
              <button key={c._id} onClick={() => openThread(String(c._id))}
                style={{ textAlign: 'left', padding: '9px 11px', borderRadius: 10, border: `1px solid ${open?.conversation?._id === c._id ? GOLD : LINE}`, background: open?.conversation?._id === c._id ? '#FBF4E4' : '#FBF9F5', cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                  <b style={{ flex: 1, fontSize: 12, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(c.participantMeta || []).map(p => p.name).join(' \u2194 ')}
                  </b>
                  <span style={{ fontSize: 9.5, color: MUT, whiteSpace: 'nowrap' }}>{rel(c.lastMessageAt)}</span>
                </div>
                <div style={{ fontSize: 10, color: MUT, marginTop: 2 }}>
                  {(c.participantMeta || []).map(p => p.role).join(' \u00b7 ')} {'\u00b7'} {c.messageCount || 0} message{(c.messageCount || 0) === 1 ? '' : 's'}
                </div>
                <div style={{ fontSize: 10.5, color: MUT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{c.lastMessageText}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={card}>
          {!open ? (
            <div style={{ padding: 40, textAlign: 'center', color: MUT, fontSize: 12.5 }}>Select a conversation to read the thread. This view is read only.</div>
          ) : (
            <>
              <div style={{ borderBottom: `1px solid ${LINE}`, paddingBottom: 8, marginBottom: 10 }}>
                <b style={{ fontSize: 13, color: INK }}>{(open.conversation.participantMeta || []).map(p => p.name).join(' \u2194 ')}</b>
                <div style={{ fontSize: 10.5, color: MUT }}>{(open.conversation.participantMeta || []).map(p => p.role).join(' \u00b7 ')} {'\u00b7'} read only</div>
              </div>
              <div style={{ display: 'grid', gap: 6, maxHeight: 440, overflow: 'auto', padding: 2 }}>
                {open.messages.map(m => {
                  const first = String(m.senderId) === String((open.conversation.participantMeta || [])[0]?.userId)
                  return (
                    <div key={m._id} style={{ justifySelf: first ? 'start' : 'end', maxWidth: '80%', background: first ? '#F7F2EA' : '#F1E4E7', color: INK, borderRadius: first ? '12px 12px 12px 3px' : '12px 12px 3px 12px', padding: '7px 11px' }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: CRIM, marginBottom: 2 }}>{m.senderName} {'\u00b7'} {rel(m.at)}</div>
                      <div style={{ fontSize: 12.5, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>{m.body}</div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
      {method && <div style={{ fontSize: 10.5, color: MUT }}>{method}</div>}
    </div>
  )
}
