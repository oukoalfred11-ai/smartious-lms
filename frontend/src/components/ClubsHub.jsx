import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../context/ctx.jsx'

/**
 * ClubsHub: the Smartious Clubs experience for students (and parents, read
 * only). Browse clubs as image cards with an icon badge and a coloured Join
 * button, see your clubs, upcoming events, and the recordings archive of
 * past club sessions, which every student (new or old) can rewatch.
 */

// ── Solid SVG icons, one per club type ──
const ICON = {
  debate:  <path d="M12 2a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm-7 8h2a5 5 0 0 0 10 0h2a7 7 0 0 1-6 6.9V19h3v2H8v-2h3v-2.1A7 7 0 0 1 5 10zM3 22h18v-1H3z"/>,
  code:    <path d="M8.7 7.3 4 12l4.7 4.7 1.4-1.4L6.8 12l3.3-3.3zm6.6 0-1.4 1.4 3.3 3.3-3.3 3.3 1.4 1.4L20 12zM13.6 4l-4 16h1.9l4-16z"/>,
  science: <path d="M9 2h6v2h-1v5.3l5.6 9.4A2 2 0 0 1 17.9 22H6.1a2 2 0 0 1-1.7-3.3L10 9.3V4H9zm3 2v6l-2.5 4h5L12 10z"/>,
  art:     <path d="M12 2a10 10 0 0 0 0 20c1.4 0 2-.9 2-2 0-.6-.2-1-.6-1.5-.3-.4-.4-.7-.4-1.1 0-1 .9-1.9 2-1.9h2a5 5 0 0 0 5-5c0-4.7-4.5-8.5-10-8.5zM6.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>,
  rocket:  <path d="M12 2c3 2 5 6 5 10l3 3v3l-4-1.5-1 2.5h-6l-1-2.5L4 18v-3l3-3c0-4 2-8 5-10zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>,
  chess:   <path d="M8 3h8v3l-2 1 1 8h1l1 3H7l1-3h1l1-8-2-1zm-3 18h14v1H5z"/>,
  mic:     <path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v5a4 4 0 0 0 4 4zm6-4h-2a4 4 0 0 1-8 0H6a6 6 0 0 0 5 5.9V20H8v2h8v-2h-3v-3.1A6 6 0 0 0 18 11z"/>,
  book:    <path d="M5 2h13a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a3 3 0 0 1-3-3V5a3 3 0 0 1 1-3zm2 15a1 1 0 0 0 0 2h11v-2z"/>,
  music:   <path d="M12 3v10.6A3.5 3.5 0 1 0 14 17V7h4V3zm-5 11a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>,
  theatre: <path d="M3 4h8v7a4 4 0 0 1-8 0zm2 2.5v1h4v-1zm.5 4.5a2.5 1.2 0 0 0 5 0zM13 6h8v7a4 4 0 0 1-8 0zm2 2.5v1h4v-1zm.5 3.3a2.5 1.2 0 0 1 5 0z"/>,
  sports:  <path d="M14 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM9 8.5l4-1.5 4 2.5 2 3-1.7 1-1.8-2.5-1.5.8 2 3-2.5 6H11l2.2-5-2.2-1.6-2.4 2.6L7 15.5l3-3.3-1-1.7-2.5 1.5-1-1.7z"/>,
  heart:   <path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9z"/>,
  star:    <path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z"/>,
  users:   <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20a7 7 0 0 1 14 0v1H2zm15-6c2.8 0 5 2 5 5v2h-4v-1a8.9 8.9 0 0 0-2.4-6z"/>,
  trophy:  <path d="M7 2h10v2h3a1 1 0 0 1 1 1c0 3.3-2 5.7-4.7 6.5A5 5 0 0 1 13 14.9V17h3v2H8v-2h3v-2.1a5 5 0 0 1-3.3-3.4C5 10.7 3 8.3 3 5a1 1 0 0 1 1-1h3z"/>,
  cal:     <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3zm-1 7v11h12V9z"/>,
  play:    <path d="M6 4l14 8-14 8z"/>,
  brain:   <path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 1 5.5A3.5 3.5 0 0 0 11 20V5a2 2 0 0 0-2-2zm6 0a2 2 0 0 0-2 2v15a3.5 3.5 0 0 0 6-3.5 3 3 0 0 0 1-5.5 3 3 0 0 0-2-5 3 3 0 0 0-3-3z"/>,
  home:    <path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/>,
  chart:   <path d="M4 20V10h3v10zm6.5 0V4h3v16zM17 20v-7h3v7z"/>,
}
const Ico = ({ k, c = '#fff', s = 20 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>{ICON[k] || ICON.star}</svg>

const CR = '#8B1A2E', GOLD = '#C9A030', INK = '#1A1A1A', MUTE = '#6B6B6B', LINE = '#E8E2D6', CREAM = '#FBFAF5'

const fmtWhen = (d) => new Date(d).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const fmtDay = (d) => ({ d: new Date(d).toLocaleDateString('en-GB', { day: '2-digit' }), m: new Date(d).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase() })
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const fmtDur = (s) => { const m = Math.round((s || 0) / 60); return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min` }

export default function ClubsHub({ user, toast, readOnly = false }) {
  const [tab, setTab] = useState('overview')
  const [clubs, setClubs] = useState([])
  const [events, setEvents] = useState([])
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(null)      // club detail
  const [detail, setDetail] = useState(null)
  const [playing, setPlaying] = useState(null)
  const [busy, setBusy] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/clubs').catch(() => ({ data: { data: { clubs: [] } } })),
      api.get('/clubs/events').catch(() => ({ data: { data: { events: [] } } })),
      api.get('/clubs/recordings').catch(() => ({ data: { data: { recordings: [] } } })),
    ]).then(([c, e, r]) => {
      setClubs(c.data?.data?.clubs || []); setEvents(e.data?.data?.events || []); setRecordings(r.data?.data?.recordings || [])
    }).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const openClub = async (c) => {
    setOpen(c); setDetail(null)
    try { const r = await api.get('/clubs/' + c._id); setDetail(r.data?.data || null) } catch { /* noop */ }
  }
  const toggleJoin = async (c) => {
    if (readOnly) return
    setBusy(c._id)
    try {
      const r = await api.post(`/clubs/${c._id}/${c.isMember ? 'leave' : 'join'}`)
      toast?.ok?.(r.data?.message || (c.isMember ? `Left ${c.name}.` : `Welcome to ${c.name}.`))
      setClubs(cs => cs.map(x => x._id === c._id ? { ...x, isMember: !c.isMember, memberCount: x.memberCount + (c.isMember ? -1 : 1) } : x))
      if (open && open._id === c._id) setOpen(o => ({ ...o, isMember: !c.isMember }))
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not update membership.') }
    finally { setBusy('') }
  }
  const joinMeeting = (id) => window.open('/classroom/' + id, '_blank', 'noopener')

  const mine = clubs.filter(c => c.isMember || c.isLeader)
  const sideTab = (id, label, k) => {
    const on = tab === id
    return (
      <button key={id} onClick={() => setTab(id)} style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
        background: on ? 'rgba(255,255,255,.14)' : 'transparent', color: '#fff', fontSize: 14, fontWeight: on ? 800 : 600, textAlign: 'left',
      }}><Ico k={k} c={on ? GOLD : 'rgba(255,255,255,.85)'} s={18} />{label}</button>
    )
  }

  const Card = ({ c }) => (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: `1px solid ${LINE}`, boxShadow: '0 6px 20px rgba(26,26,26,.06)', display: 'flex', flexDirection: 'column', transition: 'transform .15s, box-shadow .15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 30px rgba(26,26,26,.12)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,26,26,.06)' }}>
      <div onClick={() => openClub(c)} style={{ position: 'relative', aspectRatio: '16/10', cursor: 'pointer', background: c.coverImage ? `url(${c.coverImage}) center/cover` : `linear-gradient(135deg, ${c.color}, #1A1A1A)` }}>
        {!c.coverImage && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: .18 }}><Ico k={c.icon} c="#fff" s={110} /></div>}
        <div style={{ position: 'absolute', left: '50%', bottom: -26, transform: 'translateX(-50%)', width: 56, height: 56, borderRadius: '50%', background: c.color, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.2)' }}>
          <Ico k={c.icon} c="#fff" s={26} />
        </div>
      </div>
      <div style={{ padding: '36px 16px 16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div onClick={() => openClub(c)} style={{ fontWeight: 900, fontSize: 14.5, letterSpacing: '.03em', color: c.color, textTransform: 'uppercase', cursor: 'pointer' }}>{c.name}</div>
        <div style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.5, margin: '8px 0 14px', flex: 1 }}>{c.tagline}</div>
        <div style={{ fontSize: 11, color: MUTE, marginBottom: 10 }}>{c.memberCount} member{c.memberCount === 1 ? '' : 's'}{c.leaders?.length ? ` \u00b7 ${c.leaders.map(l => l.name).join(', ')}` : ''}</div>
        {!readOnly && (
          <button onClick={() => toggleJoin(c)} disabled={busy === c._id} style={{
            padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13, color: '#fff',
            background: c.isMember ? '#15803D' : c.color, opacity: busy === c._id ? .6 : 1,
          }}>{c.isLeader ? 'You lead this club' : c.isMember ? 'Joined' : 'Join Club'}</button>
        )}
      </div>
    </div>
  )

  const grid = (list) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))', gap: 18 }}>
      {list.map(c => <Card key={c._id} c={c} />)}
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px minmax(0,1fr)', gap: 22, alignItems: 'start' }} className="clubs-grid">
      <style>{`@media (max-width: 900px) { .clubs-grid { grid-template-columns: 1fr !important } .clubs-side { flex-direction: row !important; overflow-x: auto } }`}</style>

      {/* Sidebar */}
      <div className="clubs-side" style={{ background: `linear-gradient(180deg, ${CR}, #5A0B1B)`, borderRadius: 18, padding: 14, display: 'flex', flexDirection: 'column', gap: 4, minHeight: 420 }}>
        {sideTab('overview', 'Overview', 'home')}
        {sideTab('mine', 'My Clubs', 'users')}
        {sideTab('events', 'Events', 'cal')}
        {sideTab('recordings', 'Recordings', 'play')}
        <div style={{ marginTop: 'auto', padding: '18px 10px 6px', color: 'rgba(255,255,255,.85)', fontSize: 13.5, lineHeight: 1.6, fontStyle: 'italic' }}>
          <span style={{ color: GOLD, fontSize: 22, lineHeight: 0 }}>&ldquo;</span> Discover your passion today, lead the world tomorrow.
        </div>
      </div>

      {/* Main */}
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.2em', color: INK }}>SMARTIOUS</div>
            <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1, color: INK }}>
              CLUBS <span style={{ color: CR }}>MODULE</span>
            </div>
            <div style={{ fontSize: 14, color: MUTE, marginTop: 6 }}>Explore. Learn. Lead. Beyond Academics.</div>
            <div style={{ width: 46, height: 3, background: CR, marginTop: 8, borderRadius: 2 }} />
          </div>
          <div style={{ background: `linear-gradient(135deg, ${CR}, #A32438)`, color: '#fff', borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center', boxShadow: '0 8px 22px rgba(139,26,46,.3)' }}>
            <span style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico k="users" c="#fff" s={22} /></span>
            <div><div style={{ fontWeight: 800, fontSize: 16 }}>{clubs.length} Clubs</div><div style={{ fontSize: 11.5, opacity: .9 }}>Find your passion and grow with like-minded peers.</div></div>
          </div>
        </div>

        {loading ? <div style={{ padding: 40, textAlign: 'center', color: MUTE }}>Loading clubs...</div> : (
          <>
            {tab === 'overview' && (
              <>
                {clubs.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: MUTE, background: '#fff', borderRadius: 16, border: `1px solid ${LINE}` }}>Clubs are being set up. Check back soon.</div> : grid(clubs)}

                {/* Why join + events + compete */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginTop: 24 }}>
                  <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${LINE}`, padding: 18, gridColumn: 'span 1' }}>
                    <span style={{ display: 'inline-block', background: CR, color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', padding: '5px 12px', borderRadius: 8, marginBottom: 14 }}>WHY JOIN CLUBS?</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12, textAlign: 'center', fontSize: 12, color: INK }}>
                      {[['brain', '#C1121F', 'Build new skills and knowledge'], ['users', '#6D28D9', 'Make friends and connect globally'], ['trophy', '#F59E0B', 'Boost your portfolio and university applications'], ['rocket', '#C2410C', 'Discover your passion and grow beyond classrooms']].map(([k, c, t]) => (
                        <div key={k}><Ico k={k} c={c} s={34} /><div style={{ marginTop: 6, lineHeight: 1.4 }}>{t}</div></div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${LINE}`, padding: 18 }}>
                    <span style={{ display: 'inline-block', background: CR, color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', padding: '5px 12px', borderRadius: 8, marginBottom: 12 }}>UPCOMING EVENTS</span>
                    {events.length === 0 ? <div style={{ fontSize: 12.5, color: MUTE }}>No club sessions scheduled yet.</div> : events.slice(0, 4).map(e => {
                      const d = fmtDay(e.scheduledAt)
                      return (
                        <div key={e._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${LINE}`, fontSize: 12.5 }}>
                          <span style={{ background: CR, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap' }}>{d.d} {d.m}</span>
                          <span style={{ flex: 1, color: INK, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
                          <span style={{ color: MUTE }}>{fmtTime(e.scheduledAt)}</span>
                          {e.status === 'live' && <button onClick={() => joinMeeting(e._id)} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 9px', fontSize: 10.5, fontWeight: 800, cursor: 'pointer' }}>LIVE</button>}
                        </div>
                      )
                    })}
                    <button onClick={() => setTab('events')} style={{ marginTop: 12, background: CR, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>View All Events &rarr;</button>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #FDF6E3, #FBF1F1)', borderRadius: 16, border: `1px solid ${LINE}`, padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
                    <Ico k="trophy" c={GOLD} s={56} />
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 14, color: INK, lineHeight: 1.3 }}>COMPETE.<br />COLLABORATE.<br />SUCCEED.</div>
                      <div style={{ fontSize: 12, color: MUTE, margin: '6px 0 10px' }}>Take part in club competitions and events, and watch past sessions to see how it is done.</div>
                      <button onClick={() => setTab('recordings')} style={{ background: CR, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Explore Recordings &rarr;</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === 'mine' && (mine.length === 0
              ? <div style={{ padding: 40, textAlign: 'center', color: MUTE, background: '#fff', borderRadius: 16, border: `1px solid ${LINE}` }}>You have not joined a club yet. Pick one from the Overview.</div>
              : grid(mine))}

            {tab === 'events' && (
              <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${LINE}`, overflow: 'hidden' }}>
                {events.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: MUTE }}>No upcoming club sessions.</div> : events.map(e => (
                  <div key={e._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: `1px solid ${LINE}` }}>
                    <span style={{ width: 40, height: 40, borderRadius: 10, background: e.club?.color || CR, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ico k={e.club?.icon} c="#fff" s={20} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: INK }}>{e.title} {e.kind !== 'club' && <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: GOLD, padding: '2px 7px', borderRadius: 999, marginLeft: 6, textTransform: 'uppercase' }}>{e.kind}</span>}</div>
                      <div style={{ fontSize: 12, color: MUTE, marginTop: 2 }}>{e.club?.name} &middot; {fmtWhen(e.scheduledAt)} &middot; {e.durationMins} min {e.leader ? `\u00b7 ${e.leader}` : ''}</div>
                    </div>
                    {!readOnly && <button onClick={() => joinMeeting(e._id)} style={{ background: e.status === 'live' ? '#DC2626' : CR, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>{e.status === 'live' ? 'Join now' : 'Open room'}</button>}
                  </div>
                ))}
              </div>
            )}

            {tab === 'recordings' && (
              <>
                {playing && (
                  <div style={{ background: '#0F1117', borderRadius: 16, overflow: 'hidden', marginBottom: 18 }}>
                    <video key={playing.url} src={playing.url} controls autoPlay controlsList="nodownload" onContextMenu={e => e.preventDefault()} style={{ width: '100%', maxHeight: 480, display: 'block', background: '#000' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                      <div><div style={{ color: '#F3EFE6', fontWeight: 700 }}>{playing.title}</div><div style={{ color: '#9AA0AD', fontSize: 12 }}>{playing.club?.name} &middot; {fmtWhen(playing.recordedAt)}</div></div>
                      <button onClick={() => setPlaying(null)} style={{ background: '#1B1F2B', color: '#9AA0AD', border: 'none', borderRadius: 8, padding: '7px 14px', fontWeight: 700, cursor: 'pointer' }}>Close</button>
                    </div>
                  </div>
                )}
                {recordings.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: MUTE, background: '#fff', borderRadius: 16, border: `1px solid ${LINE}` }}>No recorded club sessions yet. Every meeting records automatically and appears here.</div> : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
                    {recordings.map(r => (
                      <div key={r.recId} onClick={() => setPlaying(r)} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${LINE}`, overflow: 'hidden', cursor: 'pointer' }}>
                        <div style={{ aspectRatio: '16/9', background: `linear-gradient(135deg, ${r.club?.color || CR}, #1A1A1A)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <span style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico k="play" c={r.club?.color || CR} s={20} /></span>
                          {r.durationSec > 0 && <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.7)', color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 5 }}>{fmtDur(r.durationSec)}</span>}
                        </div>
                        <div style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 800, fontSize: 13, color: INK, lineHeight: 1.35 }}>{r.title}</div>
                          <div style={{ fontSize: 11.5, color: MUTE, marginTop: 4 }}><span style={{ color: r.club?.color || CR, fontWeight: 700 }}>{r.club?.name}</span> &middot; {fmtWhen(r.recordedAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Club detail */}
      {open && (
        <div onClick={() => setOpen(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: 'min(720px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ height: 150, background: open.coverImage ? `url(${open.coverImage}) center/cover` : `linear-gradient(135deg, ${open.color}, #1A1A1A)`, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 24, bottom: -26, width: 60, height: 60, borderRadius: '50%', background: open.color, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico k={open.icon} c="#fff" s={28} /></div>
              <button onClick={() => setOpen(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,.4)', color: '#fff', border: 'none', borderRadius: 999, width: 30, height: 30, cursor: 'pointer', fontWeight: 800 }}>&times;</button>
            </div>
            <div style={{ padding: '36px 24px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 900, fontSize: 20, color: open.color, textTransform: 'uppercase' }}>{open.name}</div>
                  <div style={{ fontSize: 13, color: MUTE, marginTop: 4 }}>{open.tagline}</div>
                </div>
                {!readOnly && !open.isLeader && (
                  <button onClick={() => toggleJoin(open)} style={{ padding: '10px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 800, color: '#fff', background: open.isMember ? '#6B7280' : open.color }}>{open.isMember ? 'Leave club' : 'Join Club'}</button>
                )}
              </div>
              {open.description && <p style={{ fontSize: 13.5, color: INK, lineHeight: 1.7, marginTop: 14 }}>{open.description}</p>}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12.5, color: MUTE, marginTop: 10 }}>
                {open.leaders?.length > 0 && <span>Led by <b style={{ color: INK }}>{open.leaders.map(l => l.name).join(', ')}</b></span>}
                {open.meetingSchedule && <span>Meets <b style={{ color: INK }}>{open.meetingSchedule}</b></span>}
                <span><b style={{ color: INK }}>{open.memberCount}</b> members</span>
              </div>

              <div style={{ marginTop: 20, fontSize: 11, fontWeight: 800, letterSpacing: '.12em', color: GOLD, textTransform: 'uppercase' }}>Upcoming sessions</div>
              {!detail ? <div style={{ fontSize: 12.5, color: MUTE, padding: '8px 0' }}>Loading...</div> : detail.upcoming.length === 0 ? <div style={{ fontSize: 12.5, color: MUTE, padding: '8px 0' }}>Nothing scheduled yet.</div> : detail.upcoming.map(m => (
                <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${LINE}`, fontSize: 13 }}>
                  <span style={{ flex: 1, color: INK, fontWeight: 600 }}>{m.title}</span>
                  <span style={{ color: MUTE, fontSize: 12 }}>{fmtWhen(m.scheduledAt)}</span>
                  {!readOnly && (open.isMember || open.isLeader) && <button onClick={() => joinMeeting(m._id)} style={{ background: m.status === 'live' ? '#DC2626' : open.color, color: '#fff', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}>{m.status === 'live' ? 'Join now' : 'Open room'}</button>}
                </div>
              ))}

              <div style={{ marginTop: 20, fontSize: 11, fontWeight: 800, letterSpacing: '.12em', color: GOLD, textTransform: 'uppercase' }}>Past sessions</div>
              {!detail ? null : detail.past.filter(p => p.recordings.length).length === 0 ? <div style={{ fontSize: 12.5, color: MUTE, padding: '8px 0' }}>No recordings yet.</div> : detail.past.filter(p => p.recordings.length).map(p => (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${LINE}`, fontSize: 13 }}>
                  <span style={{ flex: 1, color: INK, fontWeight: 600 }}>{p.title}</span>
                  <span style={{ color: MUTE, fontSize: 12 }}>{fmtWhen(p.scheduledAt)}</span>
                  <button onClick={() => { setOpen(null); setTab('recordings'); setPlaying({ ...p.recordings[0], title: p.title, club: { name: open.name, color: open.color }, recordedAt: p.recordings[0].recordedAt || p.scheduledAt }) }}
                    style={{ background: open.color, color: '#fff', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 11.5, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Ico k="play" c="#fff" s={12} /> Watch</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
