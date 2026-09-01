import React, { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../context/ctx.jsx'

/**
 * CommunityChat: the one school-wide chat room, shared by every portal
 * (students, parents, teachers, admins). Everyone in Smartious is a member.
 */
export default function CommunityChatView({ user, toast }) {
  const [msgs, setMsgs] = useState([])
  const [pinnedMsg, setPinnedMsg] = useState(null)
  const [pinHidden, setPinHidden] = useState(false)
  const [memberCount, setMemberCount] = useState(0)
  const [members, setMembers] = useState([])
  const [membersOpen, setMembersOpen] = useState(false)
  const [channel, setChannel] = useState('')
  const [draft, setDraft] = useState('')
  const [sendErr, setSendErr] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [sending, setSending] = useState(false)
  const [pickerFor, setPickerFor] = useState(null)
  const [pending, setPending] = useState(null)      // uploaded attachment waiting to send
  const [uploading, setUploading] = useState(false)
  const [recState, setRecState] = useState('idle')  // idle | recording
  const [recSecs, setRecSecs] = useState(0)
  const boxRef = useRef(null)
  const stickRef = useRef(true)
  const fileRef = useRef(null)
  const videoRef = useRef(null)
  const recRef = useRef(null)

  // ── Palette (dark theatre, crimson + gold) ──
  const T = {
    shell: '#0F131C', panel: '#151B27', raised: '#1C2333', line: 'rgba(255,255,255,.07)',
    text: '#F3EFE6', mute: '#9AA3B5', dim: '#6B7486',
    cr: '#8B1A2E', crL: '#C1121F', gold: '#E4C689', goldD: '#C9973A',
  }
  const CH = {
    '':              { label: 'All',           color: '#E4C689' },
    general:         { label: 'General',       color: '#3B82F6' },
    announcements:   { label: 'Announcements', color: '#C1121F' },
    questions:       { label: 'Questions',     color: '#14B8A6' },
    resources:       { label: 'Resources',     color: '#22C55E' },
    wins:            { label: 'Wins',          color: '#F59E0B' },
  }

  // ── Solid coloured SVG icons ──
  const Ic = {
    all:      (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill={c}><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>,
    chat:     (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill={c}><path d="M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 1-2z"/></svg>,
    mega:     (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill={c}><path d="M3 10v4a2 2 0 0 0 2 2h2l5 4V4L7 8H5a2 2 0 0 0-2 2zm13-1.5v7a3.5 3.5 0 0 0 0-7zM16 4v2a6 6 0 0 1 0 12v2a8 8 0 0 0 0-16z"/></svg>,
    quest:    (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill={c}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 16a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6zm1.3-5.4v.9h-2.6v-1.5c0-1.9 2.9-2 2.9-3.6a1.6 1.6 0 0 0-3.2 0H7.8a4.2 4.2 0 0 1 8.4 0c0 2.6-2.9 2.8-2.9 4.2z"/></svg>,
    book:     (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill={c}><path d="M5 2h13a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a3 3 0 0 1-3-3V5a3 3 0 0 1 1-3zm2 15a1 1 0 0 0 0 2h11v-2z"/></svg>,
    trophy:   (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill={c}><path d="M7 2h10v2h3a1 1 0 0 1 1 1c0 3.3-2 5.7-4.7 6.5A5 5 0 0 1 13 14.9V17h3v2H8v-2h3v-2.1a5 5 0 0 1-3.3-3.4C5 10.7 3 8.3 3 5a1 1 0 0 1 1-1h3zm0 4H5.2C5.6 7.6 6.6 8.8 8 9.4zm10 0v3.4c1.4-.6 2.4-1.8 2.8-3.4z"/></svg>,
    members:  (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill={c}><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20a7 7 0 0 1 14 0v1H2zm15-6c2.8 0 5 2 5 5v2h-4v-1a8.9 8.9 0 0 0-2.4-6z"/></svg>,
    clip:     (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M16.5 6.5v9a4.5 4.5 0 0 1-9 0V6a3 3 0 0 1 6 0v9a1.5 1.5 0 0 1-3 0V7h-2v8a3.5 3.5 0 0 0 7 0V6a5 5 0 0 0-10 0v9.5a6.5 6.5 0 0 0 13 0v-9z"/></svg>,
    mic:      (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v5a4 4 0 0 0 4 4zm6-4h-2a4 4 0 0 1-8 0H6a6 6 0 0 0 5 5.9V20H8v2h8v-2h-3v-3.1A6 6 0 0 0 18 11z"/></svg>,
    stop:     (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill={c}><rect x="5" y="5" width="14" height="14" rx="2"/></svg>,
    video:    (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M3 6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3.5l5-3v11l-5-3V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
    send:     (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M2.5 3.5 21.5 12 2.5 20.5 5 13.5l9-1.5-9-1.5z"/></svg>,
    reply:    (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill={c}><path d="M10 6V3L3 10l7 7v-3.5c5 0 8.5 1.5 11 5-1-5-4-9.5-11-12.5z"/></svg>,
    flag:     (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill={c}><path d="M5 3h2v18H5zm3 0h11l-2.5 4.5L19 12H8z"/></svg>,
    smile:    (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill={c}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8.5 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM7 14h10a5 5 0 0 1-10 0z"/></svg>,
    pin:      (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill={c}><path d="M14 2l8 8-3 1-2 2 1 5-2 2-4-4-6 6H4v-2l6-6-4-4 2-2 5 1 2-2z"/></svg>,
    file:     (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill={c}><path d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1.5V9h5.5z"/></svg>,
    close:    (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill={c}><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L12 13.4l-6.3 6.3-1.4-1.4L10.6 12 4.3 5.7l1.4-1.4L12 10.6l6.3-6.3z"/></svg>,
    play:     (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill={c}><path d="M6 4l14 8-14 8z"/></svg>,
  }
  const chIcon = { '': Ic.all, general: Ic.chat, announcements: Ic.mega, questions: Ic.quest, resources: Ic.book, wins: Ic.trophy }

  // ── Data ──
  const load = useCallback((ch = channel) => {
    api.get('/community-chat/messages' + (ch ? '?channel=' + ch : ''))
      .then(r => {
        const d = r.data?.data || {}
        setMsgs(d.messages || []); setPinnedMsg(d.pinned || null); setMemberCount(d.memberCount || 0)
      }).catch(() => {})
  }, [channel])
  useEffect(() => { load(channel) }, [channel])
  useEffect(() => {
    const t = setInterval(() => { if (!document.hidden) load(channel) }, 4000)
    return () => clearInterval(t)
  }, [channel, load])
  useEffect(() => {
    if (stickRef.current && boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight
  }, [msgs.length])
  useEffect(() => {
    api.get('/community-chat/members').then(r => setMembers(r.data?.data?.members || [])).catch(() => {})
  }, [])

  const onScroll = () => {
    const el = boxRef.current; if (!el) return
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  // ── Send ──
  const send = async () => {
    const text = draft.trim()
    if ((!text && !pending) || sending) return
    setSending(true); setSendErr('')
    try {
      const r = await api.post('/community-chat/messages', {
        body: text, channel: channel || 'general', replyTo: replyTo?._id || null,
        attachment: pending || null,
      })
      const m = r.data?.data?.message
      if (m) setMsgs(ms => [...ms, m])
      setDraft(''); setReplyTo(null); setPending(null); stickRef.current = true
    } catch (e) {
      setSendErr(e?.response?.data?.message || 'Could not send.')
    } finally { setSending(false) }
  }

  // ── Upload (documents, images, video) ──
  const uploadFile = async (file, hint) => {
    if (!file) return
    setUploading(true); setSendErr('')
    try {
      const fd = new FormData(); fd.append('file', file)
      const r = await api.post('/community-chat/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const a = r.data?.data
      if (a) setPending({ ...a, durationSec: hint?.durationSec || 0 })
    } catch (e) {
      setSendErr(e?.response?.data?.message || 'Upload failed.')
    } finally { setUploading(false) }
  }

  // ── Voice notes ──
  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
      const rec = new MediaRecorder(stream, { mimeType: mime })
      const chunks = []
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const secs = recRef.current?.secs || 0
        const blob = new Blob(chunks, { type: 'audio/webm' })
        if (secs >= 1) uploadFile(new File([blob], 'voice-note.webm', { type: 'audio/webm' }), { durationSec: secs })
        recRef.current = null; setRecState('idle'); setRecSecs(0)
      }
      rec.start(250)
      recRef.current = { rec, secs: 0, timer: setInterval(() => {
        if (recRef.current) { recRef.current.secs += 1; setRecSecs(recRef.current.secs)
          if (recRef.current.secs >= 180) stopRec() }
      }, 1000) }
      setRecState('recording')
    } catch { setSendErr('Microphone access is needed for voice notes.') }
  }
  const stopRec = () => {
    const r = recRef.current; if (!r) return
    clearInterval(r.timer)
    try { r.rec.stop() } catch { /* noop */ }
  }
  useEffect(() => () => { if (recRef.current) { clearInterval(recRef.current.timer); try { recRef.current.rec.stop() } catch {} } }, [])

  const react = (id, emoji) => {
    api.post('/community-chat/messages/' + id + '/react', { emoji })
      .then(r => { const m = r.data?.data?.message; if (m) setMsgs(ms => ms.map(x => x._id === id ? m : x)) })
      .catch(() => {})
    setPickerFor(null)
  }
  const report = (id) => {
    const reason = window.prompt('Why are you reporting this message?') || ''
    api.post('/community-chat/messages/' + id + '/report', { reason })
      .then(() => toast?.ok?.('Thanks. A teacher will review it.')).catch(() => {})
  }

  // ── Helpers ──
  const nameOf = a => a ? [a.firstName, a.lastName].filter(Boolean).join(' ') || 'Member' : 'Member'
  const isStaffRole = r => ['teacher', 'admin', 'dos', 'ops_manager'].includes(r)
  const roleLabel = (r, grade) => r === 'teacher' ? 'Teacher' : r === 'parent' ? 'Parent' : isStaffRole(r) ? 'Smartious team' : (grade || 'Student')
  const roleColor = r => r === 'teacher' ? '#E4C689' : r === 'parent' ? '#5EEAD4' : isStaffRole(r) ? '#F87171' : ''
  const timeOf = d => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const dayOf = d => new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  const fmtSize = b => b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB'
  const fmtSecs = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const EMOJIS = ['\ud83d\udc4d', '\u2764\ufe0f', '\ud83c\udf89', '\ud83d\ude4c']

  const Avatar = ({ a, size = 36 }) => {
    const n = nameOf(a)
    const initials = n.split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    const hue = (n.charCodeAt(0) * 37 + (n.charCodeAt(1) || 0) * 11) % 360
    return a?.avatar
      ? <img src={a.avatar} alt={n} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(255,255,255,.10)' }} />
      : <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, hsl(${hue},55%,38%), hsl(${(hue + 40) % 360},60%,28%))`,
          color: '#fff', fontWeight: 800, fontSize: size * 0.36, border: '2px solid rgba(255,255,255,.10)' }}>{initials || '?'}</div>
  }

  const Attachment = ({ a, mine }) => {
    if (!a) return null
    const box = { marginTop: 8, borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.line}`, background: mine ? 'rgba(0,0,0,.18)' : T.raised, maxWidth: 380 }
    if (a.kind === 'image') return <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', ...box }}><img src={a.url} alt={a.name} style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }} /></a>
    if (a.kind === 'video') return <div style={box}><video src={a.url} controls controlsList="nodownload" playsInline style={{ width: '100%', maxHeight: 320, display: 'block', background: '#000' }} /></div>
    if (a.kind === 'audio') return (
      <div style={{ ...box, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', minWidth: 260 }}>
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${T.cr}, ${T.goldD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Ic.mic('#fff')}</span>
        <audio src={a.url} controls controlsList="nodownload" style={{ flex: 1, height: 34, minWidth: 0 }} />
        {a.durationSec > 0 && <span style={{ fontSize: 11, color: T.mute, fontWeight: 700 }}>{fmtSecs(a.durationSec)}</span>}
      </div>
    )
    return (
      <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ ...box, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', textDecoration: 'none' }}>
        <span style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Ic.file('#3B82F6')}</span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', color: T.text, fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name || 'Document'}</span>
          <span style={{ display: 'block', color: T.mute, fontSize: 11, marginTop: 2 }}>{(a.mime || '').split('/').pop().toUpperCase().slice(0, 8)} {a.sizeBytes ? '\u00b7 ' + fmtSize(a.sizeBytes) : ''} \u00b7 Open</span>
        </span>
      </a>
    )
  }

  const canPostHere = channel !== 'announcements' || isStaffRole(user?.role)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: membersOpen ? 'minmax(0,1fr) 280px' : 'minmax(0,1fr)', gap: 14, alignItems: 'start' }}>
      <style>{`
        .cm-scroll::-webkit-scrollbar{width:7px}.cm-scroll::-webkit-scrollbar-thumb{background:#2A3346;border-radius:7px}
        .cm-row .cm-acts{opacity:0;transition:opacity .15s}.cm-row:hover .cm-acts{opacity:1}
        @keyframes cmPulse{0%,100%{opacity:1}50%{opacity:.35}}
        @media(max-width:900px){.cm-grid{grid-template-columns:1fr!important}}
      `}</style>

      <div style={{ background: T.shell, borderRadius: 18, border: '1px solid rgba(228,198,137,.12)', boxShadow: '0 24px 60px rgba(8,10,20,.28)', display: 'flex', flexDirection: 'column', height: 'min(78vh, 820px)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1, minWidth: 0 }}>
            {Object.keys(CH).map(k => {
              const on = channel === k
              return (
                <button key={k || 'all'} onClick={() => setChannel(k)} style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 10, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  background: on ? 'rgba(255,255,255,.08)' : 'transparent', color: on ? T.text : T.mute, fontSize: 12.5, fontWeight: 700,
                  boxShadow: on ? `inset 0 -2px 0 ${CH[k].color}` : 'none',
                }}>{chIcon[k](CH[k].color)}{CH[k].label}</button>
              )
            })}
          </div>
          <button onClick={() => setMembersOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px 6px 6px', borderRadius: 999, border: `1px solid ${T.line}`, background: membersOpen ? 'rgba(228,198,137,.12)' : T.panel, cursor: 'pointer', color: T.text, fontSize: 12, fontWeight: 700 }}>
            <span style={{ display: 'flex' }}>
              {members.slice(0, 4).map((m, i) => <span key={m._id} style={{ marginLeft: i ? -8 : 0, display: 'flex' }}><Avatar a={m} size={24} /></span>)}
            </span>
            {Ic.members(T.gold)} {memberCount || members.length} members
          </button>
        </div>

        {/* Pinned */}
        {pinnedMsg && !pinHidden && (
          <div style={{ padding: '10px 18px', borderBottom: `1px solid ${T.line}`, background: 'rgba(228,198,137,.06)', display: 'flex', gap: 10, alignItems: 'center' }}>
            {Ic.pin(T.gold)}
            <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <b style={{ color: T.gold }}>{nameOf(pinnedMsg.author)}:</b> {pinnedMsg.body}
            </div>
            <button onClick={() => setPinHidden(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>{Ic.close(T.dim)}</button>
          </div>
        )}

        {/* Messages */}
        <div ref={boxRef} onScroll={onScroll} className="cm-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
          {msgs.length === 0 && <div style={{ color: T.dim, textAlign: 'center', fontSize: 13, padding: 40 }}>No messages here yet. Say hello.</div>}
          {msgs.map((m, i) => {
            const prev = msgs[i - 1]
            const newDay = !prev || dayOf(prev.createdAt) !== dayOf(m.createdAt)
            const mine = String(m.author?._id || '') === String(user?._id || '')
                        if (m.system) return <div key={m._id} style={{ textAlign: 'center', fontSize: 11.5, color: T.dim, margin: '10px 0' }}>{m.body}</div>
            return (
              <React.Fragment key={m._id}>
                {newDay && <div style={{ textAlign: 'center', margin: '14px 0 12px' }}><span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.1em', color: T.dim, background: T.panel, padding: '4px 12px', borderRadius: 999, textTransform: 'uppercase' }}>{dayOf(m.createdAt)}</span></div>}
                <div className="cm-row" style={{ display: 'flex', gap: 10, marginBottom: 14, flexDirection: mine ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                  <Avatar a={m.author} />
                  <div style={{ maxWidth: '78%', minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexDirection: mine ? 'row-reverse' : 'row' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: roleColor(m.author?.role) || T.text }}>{mine ? 'You' : nameOf(m.author)}</span>
                      {m.author?.role && m.author.role !== 'student' && <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.08em', color: '#12060B', background: roleColor(m.author.role), padding: '1px 7px', borderRadius: 999, textTransform: 'uppercase' }}>{roleLabel(m.author.role)}</span>}
                      {m.author?.role === 'student' && m.author?.gradeLevel && <span style={{ fontSize: 10.5, color: T.dim }}>{m.author.gradeLevel}</span>}
                      <span style={{ fontSize: 10.5, color: T.dim }}>{timeOf(m.createdAt)}</span>
                      <span style={{ display: 'flex', gap: 4 }} className="cm-acts">
                        <button title="Reply" onClick={() => setReplyTo(m)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}>{Ic.reply(T.mute)}</button>
                        <button title="React" onClick={() => setPickerFor(pickerFor === m._id ? null : m._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}>{Ic.smile(T.mute)}</button>
                        {!mine && <button title="Report" onClick={() => report(m._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}>{Ic.flag(T.mute)}</button>}
                      </span>
                    </div>
                    <div style={{
                      background: mine ? 'linear-gradient(135deg, #8B1A2E, #A32438)' : T.panel,
                      color: T.text, padding: '10px 14px', borderRadius: mine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      fontSize: 13.5, lineHeight: 1.55, border: mine ? 'none' : `1px solid ${T.line}`, wordBreak: 'break-word',
                    }}>
                      {m.replyToAuthor && (
                        <div style={{ borderLeft: `3px solid ${T.gold}`, paddingLeft: 10, marginBottom: 8, fontSize: 12, color: mine ? 'rgba(255,255,255,.8)' : T.mute }}>
                          <b style={{ color: T.gold }}>{m.replyToAuthor}</b><br />{m.replyToExcerpt}
                        </div>
                      )}
                      {m.body}
                      <Attachment a={m.attachment} mine={mine} />
                    </div>
                    {(m.reactions || []).length > 0 && (
                      <div style={{ display: 'flex', gap: 5, marginTop: 5, flexDirection: mine ? 'row-reverse' : 'row' }}>
                        {m.reactions.map(r => (
                          <button key={r.emoji} onClick={() => react(m._id, r.emoji)} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 999, cursor: 'pointer', background: r.mine ? 'rgba(228,198,137,.18)' : T.raised, border: `1px solid ${r.mine ? T.gold : T.line}`, color: T.text }}>{r.emoji} {r.count}</button>
                        ))}
                      </div>
                    )}
                    {pickerFor === m._id && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, background: T.raised, padding: 6, borderRadius: 999, width: 'fit-content', border: `1px solid ${T.line}` }}>
                        {EMOJIS.map(e => <button key={e} onClick={() => react(m._id, e)} style={{ fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer' }}>{e}</button>)}
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            )
          })}
        </div>

        {/* Composer */}
        <div style={{ borderTop: `1px solid ${T.line}`, padding: '12px 16px', background: T.panel }}>
          {replyTo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: 12, color: T.mute, borderLeft: `3px solid ${T.gold}`, paddingLeft: 10 }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Replying to <b style={{ color: T.gold }}>{nameOf(replyTo.author)}</b>: {replyTo.body}</span>
              <button onClick={() => setReplyTo(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>{Ic.close(T.dim)}</button>
            </div>
          )}
          {pending && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '8px 12px', borderRadius: 10, background: T.raised, border: `1px solid ${T.line}` }}>
              {pending.kind === 'audio' ? Ic.mic(T.gold) : pending.kind === 'video' ? Ic.video('#A855F7') : pending.kind === 'image' ? Ic.file('#22C55E') : Ic.file('#3B82F6')}
              <span style={{ flex: 1, fontSize: 12.5, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pending.kind === 'audio' ? `Voice note ${pending.durationSec ? fmtSecs(pending.durationSec) : ''}` : pending.name} <span style={{ color: T.dim }}>{pending.sizeBytes ? '\u00b7 ' + fmtSize(pending.sizeBytes) : ''}</span></span>
              <button onClick={() => setPending(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>{Ic.close(T.dim)}</button>
            </div>
          )}
          {sendErr && <div style={{ fontSize: 12, color: '#F87171', marginBottom: 8 }}>{sendErr}</div>}
          {!canPostHere ? (
            <div style={{ fontSize: 12.5, color: T.dim, textAlign: 'center', padding: 6 }}>Only teachers post in Announcements. Pick another channel to chat.</div>
          ) : recState === 'recording' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: T.crL, animation: 'cmPulse 1s infinite' }} />
              <span style={{ flex: 1, color: T.text, fontWeight: 700, fontSize: 13.5 }}>Recording voice note {fmtSecs(recSecs)}</span>
              <button onClick={stopRec} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: `linear-gradient(120deg, ${T.cr}, #A32438)`, color: '#fff', fontWeight: 800, fontSize: 12.5 }}>{Ic.stop('#fff')} Stop</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input ref={fileRef} type="file" hidden accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,image/png,image/jpeg,image/webp,image/gif" onChange={e => { uploadFile(e.target.files?.[0]); e.target.value = '' }} />
              <input ref={videoRef} type="file" hidden accept="video/mp4,video/webm,video/quicktime" onChange={e => { uploadFile(e.target.files?.[0]); e.target.value = '' }} />
              <button title="Attach a document or image" disabled={uploading || !!pending} onClick={() => fileRef.current?.click()} style={{ width: 38, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer', background: T.raised, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (uploading || pending) ? .4 : 1 }}>{Ic.clip('#3B82F6')}</button>
              <button title="Attach a video" disabled={uploading || !!pending} onClick={() => videoRef.current?.click()} style={{ width: 38, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer', background: T.raised, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (uploading || pending) ? .4 : 1 }}>{Ic.video('#A855F7')}</button>
              <button title="Record a voice note" disabled={uploading || !!pending} onClick={startRec} style={{ width: 38, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer', background: T.raised, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (uploading || pending) ? .4 : 1 }}>{Ic.mic(T.gold)}</button>
              <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder={uploading ? 'Uploading...' : 'Write a message'} maxLength={800}
                style={{ flex: 1, minWidth: 0, background: T.shell, border: `1px solid ${T.line}`, borderRadius: 12, padding: '10px 14px', color: T.text, fontSize: 13.5, outline: 'none' }} />
              <button onClick={send} disabled={sending || uploading || (!draft.trim() && !pending)} style={{ width: 42, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer', background: (draft.trim() || pending) ? `linear-gradient(120deg, ${T.cr}, #A32438)` : T.raised, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: (draft.trim() || pending) ? '0 4px 14px rgba(139,26,46,.4)' : 'none' }}>{Ic.send((draft.trim() || pending) ? T.gold : T.dim)}</button>
            </div>
          )}
        </div>
      </div>

      {/* Members panel */}
      {membersOpen && (
        <div style={{ background: T.shell, borderRadius: 18, border: `1px solid ${T.line}`, height: 'min(78vh, 820px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            {Ic.members(T.gold)}
            <span style={{ flex: 1, color: T.text, fontWeight: 800, fontSize: 13.5 }}>Members</span>
            <span style={{ fontSize: 11.5, color: T.mute }}>{members.length}</span>
            <button onClick={() => setMembersOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>{Ic.close(T.dim)}</button>
          </div>
          <div className="cm-scroll" style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {members.map(m => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 10 }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.04)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Avatar a={{ firstName: m.name, role: m.role, avatar: m.avatar }} size={32} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}{String(m._id) === String(user?._id) ? ' (you)' : ''}</div>
                  <div style={{ fontSize: 10.5, color: T.dim }}>{roleLabel(m.role, m.gradeLevel)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
