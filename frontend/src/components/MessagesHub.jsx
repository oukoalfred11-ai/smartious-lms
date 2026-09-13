/**
 * MessagesHub.jsx — the one messaging surface for student, teacher
 * and parent portals. Before typing, the person chooses a lane:
 * a subject teacher (direct message, drawn from the timetable),
 * Guidance and Counselling (confidential request to the school), or
 * General support. Existing conversations and requests live in one
 * list. Every message rings the recipient's bell in the app;
 * conversations are visible to the school's administration.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../context/ctx.jsx'

const CRIM = '#7D1025', GOLD = '#C9973A', INK = '#231715', MUT = '#8A8378', LINE = '#E5DFD3'
const TEAL = '#0F766E'

const rel = (d) => {
  if (!d) return ''
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'now'
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
const tTime = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

export default function MessagesHub({ meId, role = 'student' }) {
  const [convos, setConvos] = useState([])
  const [tickets, setTickets] = useState([])
  const [contacts, setContacts] = useState(null)
  const [view, setView] = useState('list')    // list | choose | pick | compose | dm | ticket
  const [lane, setLane] = useState('general') // compose lane: guidance | general
  const [q, setQ] = useState('')
  const [openDM, setOpenDM] = useState(null)  // { conversation, messages, newRecipient? }
  const [openTicket, setOpenTicket] = useState(null)
  const [subject, setSubject] = useState('')
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef(null)

  const loadAll = useCallback(() => {
    api.get('/dm/conversations').then(r => setConvos(r.data?.data?.conversations || [])).catch(() => {})
    api.get('/support/mine').then(r => setTickets(r.data?.data?.tickets || [])).catch(() => {})
  }, [])
  useEffect(() => { loadAll(); const t = setInterval(loadAll, 30000); return () => clearInterval(t) }, [loadAll])

  const scrollDown = () => setTimeout(() => { scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight) }, 30)

  const openThread = useCallback((id) => {
    api.get(`/dm/conversations/${id}/messages`).then(r => { setOpenDM(r.data?.data || null); setView('dm'); scrollDown() }).catch(() => {})
  }, [])
  useEffect(() => {
    if (view !== 'dm' || !openDM?.conversation?._id) return
    const id = String(openDM.conversation._id)
    const t = setInterval(() => api.get(`/dm/conversations/${id}/messages`).then(r => setOpenDM(r.data?.data || null)).catch(() => {}), 12000)
    return () => clearInterval(t)
  }, [view, openDM?.conversation?._id])

  const openTicketThread = (t) => { setOpenTicket(t); setView('ticket') }

  const startWith = (contact) => {
    const existing = convos.find(c => String(c.other?.userId) === String(contact._id))
    if (existing) return openThread(String(existing._id))
    setOpenDM({ conversation: { _id: null, participantMeta: [{ userId: contact._id, name: contact.name, role: contact.role }] }, messages: [], newRecipient: contact })
    setView('dm')
  }

  const sendDM = async () => {
    if (!draft.trim() || busy) return
    setBusy(true)
    try {
      if (openDM.newRecipient) {
        const r = await api.post('/dm/conversations', { recipientId: openDM.newRecipient._id, body: draft.trim() })
        const cid = r.data?.data?.conversationId
        setDraft(''); loadAll()
        if (cid) openThread(String(cid))
      } else {
        await api.post(`/dm/conversations/${openDM.conversation._id}/messages`, { body: draft.trim() })
        setDraft('')
        const r = await api.get(`/dm/conversations/${openDM.conversation._id}/messages`)
        setOpenDM(r.data?.data || null); scrollDown(); loadAll()
      }
    } catch (e) { /* keep draft */ } finally { setBusy(false) }
  }

  const createTicket = async () => {
    if (!subject.trim() || !draft.trim() || busy) return
    setBusy(true)
    try {
      await api.post('/support', { subject: subject.trim(), body: draft.trim(), category: lane })
      setSubject(''); setDraft(''); setView('list'); loadAll()
    } catch (e) { /* stay */ } finally { setBusy(false) }
  }
  const replyTicket = async () => {
    if (!draft.trim() || busy) return
    setBusy(true)
    try {
      const r = await api.post(`/support/${openTicket._id}/messages`, { body: draft.trim() })
      setDraft(''); setOpenTicket(r.data?.data?.ticket || openTicket); loadAll()
    } catch (e) { /* keep */ } finally { setBusy(false) }
  }

  const choosePick = () => {
    setView('pick'); setQ('')
    if (!contacts) api.get('/dm/contacts').then(r => setContacts(r.data?.data?.contacts || [])).catch(() => setContacts([]))
  }

  const merged = [
    ...convos.map(c => ({ kind: 'dm', at: c.lastMessageAt, item: c })),
    ...tickets.map(t => ({ kind: 'ticket', at: t.updatedAt, item: t })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at))

  const other = openDM ? (openDM.newRecipient || (openDM.conversation.participantMeta || []).find(p => String(p.userId) !== String(meId)) || {}) : null
  const filteredContacts = (contacts || []).filter(c => !q.trim() || (c.name + ' ' + c.role + ' ' + c.context).toLowerCase().includes(q.toLowerCase()))
  const teacherWord = role === 'teacher' ? 'a student or parent' : role === 'parent' ? "your child's subject teacher" : 'a subject teacher'

  const laneChip = (t) => t.category === 'guidance'
    ? { label: 'Guidance', color: TEAL, bg: '#E6F4F2' }
    : { label: 'Support', color: '#B07A18', bg: '#FBF4E4' }

  const backBtn = (label = 'Back') => (
    <button onClick={() => { setView('list'); setOpenDM(null); setOpenTicket(null); setDraft('') }}
      style={{ border: 'none', background: 'none', color: CRIM, fontSize: 12, fontWeight: 800, cursor: 'pointer', padding: 0 }}>{'\u2190'} {label}</button>
  )

  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: `1px solid ${LINE}`, background: '#FBF9F5' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: '.12em', color: GOLD, textTransform: 'uppercase' }}>Messages</div>
          <div style={{ fontSize: 10.5, color: MUT }}>Talk to {teacherWord}, Guidance and Counselling, or the school. Conversations are visible to the school's administration.</div>
        </div>
        {view === 'list' && (
          <button onClick={() => setView('choose')} style={{ padding: '7px 14px', borderRadius: 9, border: 'none', background: CRIM, color: '#fff', fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}>New message</button>
        )}
      </div>

      {/* The chooser: three lanes before a word is typed */}
      {view === 'choose' && (
        <div style={{ padding: 16 }}>
          {backBtn('Cancel')}
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {[
              { key: 'teacher', title: role === 'teacher' ? 'Message a student or parent' : 'Message a subject teacher', desc: role === 'parent' ? "Write directly to one of your child's teachers." : role === 'teacher' ? 'Write directly to one of your students or their parent.' : 'Write directly to one of your own teachers.', color: CRIM, onClick: choosePick },
              { key: 'guidance', title: 'Guidance and Counselling', desc: 'Something personal or heavy on your mind. Handled with care and confidentiality by the school.', color: TEAL, onClick: () => { setLane('guidance'); setView('compose') } },
              { key: 'general', title: 'General support', desc: 'Anything unclear or not working, from timetables to fees. We reply the same day.', color: '#B07A18', onClick: () => { setLane('general'); setView('compose') } },
            ].map(o => (
              <button key={o.key} onClick={o.onClick}
                style={{ textAlign: 'left', padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${LINE}`, borderLeft: `4px solid ${o.color}`, background: '#FBF9F5', cursor: 'pointer' }}>
                <b style={{ fontSize: 13.5, color: INK, display: 'block' }}>{o.title}</b>
                <span style={{ fontSize: 11.5, color: MUT, marginTop: 3, display: 'block', lineHeight: 1.45 }}>{o.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contact picker */}
      {view === 'pick' && (
        <div style={{ padding: 14 }}>
          {backBtn()}
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search..."
            style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${LINE}`, borderRadius: 9, fontSize: 12.5, boxSizing: 'border-box', marginTop: 10 }} />
          <div style={{ display: 'grid', gap: 4, marginTop: 10, maxHeight: 320, overflow: 'auto' }}>
            {contacts === null && <div style={{ fontSize: 11.5, color: MUT, padding: 8 }}>Loading your contacts...</div>}
            {contacts !== null && filteredContacts.length === 0 && <div style={{ fontSize: 11.5, color: MUT, padding: 8 }}>No contacts found. Contacts come from the timetable.</div>}
            {filteredContacts.map(c => (
              <button key={c._id} onClick={() => { setDraft(''); startWith(c) }}
                style={{ display: 'flex', gap: 10, alignItems: 'center', textAlign: 'left', padding: '9px 12px', borderRadius: 10, border: `1px solid ${LINE}`, background: '#FBF9F5', cursor: 'pointer' }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: CRIM, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>{(c.name || '?')[0]}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: 'block', fontSize: 12.5, color: INK }}>{c.name}</b>
                  <span style={{ fontSize: 10.5, color: MUT }}>{c.context || c.role}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compose a guidance or support request */}
      {view === 'compose' && (
        <div style={{ padding: 16 }}>
          {backBtn()}
          <div style={{ fontSize: 12.5, fontWeight: 800, color: lane === 'guidance' ? TEAL : '#B07A18', margin: '10px 0 8px' }}>
            {lane === 'guidance' ? 'Guidance and Counselling' : 'General support'}
          </div>
          {lane === 'guidance' && (
            <div style={{ fontSize: 11.5, color: MUT, background: '#E6F4F2', borderRadius: 9, padding: '8px 11px', marginBottom: 8, lineHeight: 1.5 }}>
              Whatever you write here is read with care by the school's guidance team. Take your time.
            </div>
          )}
          <div style={{ display: 'grid', gap: 8 }}>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject"
              style={{ padding: '9px 11px', border: `1.5px solid ${LINE}`, borderRadius: 9, fontSize: 12.5 }} />
            <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={4} placeholder={lane === 'guidance' ? 'What would you like to talk about?' : 'Describe what you need help with...'}
              style={{ padding: '9px 11px', border: `1.5px solid ${LINE}`, borderRadius: 9, fontSize: 12.5, resize: 'vertical', fontFamily: 'inherit' }} />
            <button onClick={createTicket} disabled={busy}
              style={{ justifySelf: 'start', padding: '9px 20px', borderRadius: 9, border: 'none', background: lane === 'guidance' ? TEAL : CRIM, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>Send to the school</button>
          </div>
        </div>
      )}

      {/* Unified list */}
      {view === 'list' && (
        <div style={{ maxHeight: 380, overflow: 'auto' }}>
          {merged.length === 0 && <div style={{ padding: 18, fontSize: 12, color: MUT }}>No conversations yet. Tap New message and choose who to talk to.</div>}
          {merged.map((e) => e.kind === 'dm' ? (
            <button key={'d' + e.item._id} onClick={() => openThread(String(e.item._id))}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', borderBottom: `1px solid ${LINE}`, background: '#fff', cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <b style={{ flex: 1, fontSize: 12.5, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.item.other?.name || 'Conversation'}</b>
                {e.item.unread > 0 && <span style={{ minWidth: 16, height: 16, borderRadius: 999, background: CRIM, color: '#fff', fontSize: 9, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{e.item.unread}</span>}
                <span style={{ fontSize: 9.5, fontWeight: 800, color: CRIM, background: '#F7E9EC', borderRadius: 999, padding: '2px 9px' }}>{e.item.other?.role || 'chat'}</span>
                <span style={{ fontSize: 9.5, color: MUT }}>{rel(e.item.lastMessageAt)}</span>
              </div>
              <div style={{ fontSize: 10.5, color: MUT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{e.item.lastMessageText}</div>
            </button>
          ) : (
            <button key={'t' + e.item._id} onClick={() => openTicketThread(e.item)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', borderBottom: `1px solid ${LINE}`, background: '#fff', cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <b style={{ flex: 1, fontSize: 12.5, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.item.subject}</b>
                <span style={{ fontSize: 9.5, fontWeight: 800, color: laneChip(e.item).color, background: laneChip(e.item).bg, borderRadius: 999, padding: '2px 9px' }}>{laneChip(e.item).label}</span>
                <span style={{ fontSize: 9.5, color: MUT }}>{rel(e.item.updatedAt)}</span>
              </div>
              <div style={{ fontSize: 10.5, color: MUT, marginTop: 2 }}>
                {e.item.status === 'awaiting_user' ? 'The school replied' : e.item.status === 'resolved' ? 'Resolved' : 'Waiting for the school'}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* DM thread */}
      {view === 'dm' && openDM && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 300 }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${LINE}`, display: 'flex', gap: 8, alignItems: 'center' }}>
            {backBtn()}
            <b style={{ fontSize: 13, color: INK }}>{other?.name}</b>
            <span style={{ fontSize: 10.5, color: MUT }}>{other?.role}</span>
          </div>
          <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: 12, display: 'grid', gap: 6, alignContent: 'start', maxHeight: 300 }}>
            {openDM.messages.length === 0 && <div style={{ fontSize: 11.5, color: MUT, textAlign: 'center', padding: 16 }}>Say hello. Your message rings their bell the moment it lands.</div>}
            {openDM.messages.map(m => {
              const mine = String(m.senderId) === String(meId)
              return (
                <div key={m._id} style={{ justifySelf: mine ? 'end' : 'start', maxWidth: '78%', background: mine ? CRIM : '#F7F2EA', color: mine ? '#fff' : INK, borderRadius: mine ? '12px 12px 3px 12px' : '12px 12px 12px 3px', padding: '7px 11px' }}>
                  <div style={{ fontSize: 12.5, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>{m.body}</div>
                  <div style={{ fontSize: 8.5, opacity: 0.65, marginTop: 2, textAlign: 'right' }}>{tTime(m.at)}</div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, padding: 10, borderTop: `1px solid ${LINE}` }}>
            <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendDM() }}
              placeholder={`Message ${other?.name || ''}...`}
              style={{ flex: 1, padding: '9px 12px', border: `1.5px solid ${LINE}`, borderRadius: 9, fontSize: 12.5 }} />
            <button onClick={sendDM} disabled={busy} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: CRIM, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>Send</button>
          </div>
        </div>
      )}

      {/* Ticket thread (guidance or support) */}
      {view === 'ticket' && openTicket && (
        <div style={{ padding: 14 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            {backBtn()}
            <b style={{ flex: 1, fontSize: 12.5, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{openTicket.subject}</b>
            <span style={{ fontSize: 9.5, fontWeight: 800, color: laneChip(openTicket).color, background: laneChip(openTicket).bg, borderRadius: 999, padding: '2px 9px' }}>{laneChip(openTicket).label}</span>
          </div>
          <div style={{ display: 'grid', gap: 6, maxHeight: 260, overflow: 'auto', padding: '4px 2px' }}>
            {openTicket.messages.map((m, i) => (
              <div key={i} style={{ justifySelf: m.staff ? 'start' : 'end', maxWidth: '85%', background: m.staff ? '#F7F2EA' : (openTicket.category === 'guidance' ? TEAL : CRIM), color: m.staff ? INK : '#fff', borderRadius: m.staff ? '12px 12px 12px 3px' : '12px 12px 3px 12px', padding: '8px 12px' }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, opacity: 0.75, marginBottom: 2 }}>{m.staff ? 'Smartious' : 'You'} {'\u00b7'} {rel(m.at)}</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>{m.body}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') replyTicket() }} placeholder="Write a reply..."
              style={{ flex: 1, padding: '9px 11px', border: `1.5px solid ${LINE}`, borderRadius: 9, fontSize: 12.5 }} />
            <button onClick={replyTicket} disabled={busy} style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: CRIM, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>Send</button>
          </div>
        </div>
      )}
    </div>
  )
}
