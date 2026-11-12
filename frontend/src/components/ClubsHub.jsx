import React, { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../context/ctx.jsx'
import HeroPanelVideo from './HeroPanelVideo.jsx'
import { joinClassroom } from '../lib/joinClassroom.js'

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

const CR = '#7D1025', GOLD = '#C9973A', INK = '#1A1A1A', MUTE = '#6B6B6B', LINE = '#E8E2D6', CREAM = '#FBFAF5'

const fmtWhen = (d) => new Date(d).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const fmtDay = (d) => ({ d: new Date(d).toLocaleDateString('en-GB', { day: '2-digit' }), m: new Date(d).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase() })
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const fmtDur = (s) => { const m = Math.round((s || 0) / 60); return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min` }

// Clash check while a session is being planned: asks the server whether the
// slot overlaps the host teacher's or members' other classes. Advisory only.
export function useClashes(clubId, f) {
  const [state, setState] = useState(null)
  useEffect(() => {
    if (!clubId || !f?.scheduledAt) { setState(null); return }
    const when = new Date(f.scheduledAt)
    if (isNaN(when)) { setState(null); return }
    let alive = true
    const t = setTimeout(() => {
      api.get(`/clubs/${clubId}/clash`, { params: { scheduledAt: when.toISOString(), durationMins: f.durationMins, repeatWeeks: f.repeatWeeks || 1, teacherId: f.teacherId || undefined } })
        .then(r => { if (alive) setState(r.data?.data?.clashes || []) })
        .catch(() => { if (alive) setState(null) })
    }, 350)
    return () => { alive = false; clearTimeout(t) }
  }, [clubId, f?.scheduledAt, f?.durationMins, f?.repeatWeeks, f?.teacherId])
  return state
}
export function ClashNote({ clashes, ready }) {
  if (!ready || clashes == null) return null
  const fmt = (d) => new Date(d).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })
  if (clashes.length === 0) return <div style={{ marginTop: 10, fontSize: 12.5, color: '#065F46', background: '#E7F7EF', borderRadius: 10, padding: '9px 12px' }}>No clash: the host and members are free at this time.</div>
  return (
    <div style={{ marginTop: 10, fontSize: 12.5, color: '#92400E', background: '#FEF3C7', borderRadius: 10, padding: '9px 12px' }}>
      <b>Possible clash.</b> {clashes.slice(0, 3).map((c, i) => <span key={i}>{i ? '; ' : ' '}{c.who} has "{c.title}" {fmt(c.scheduledAt)}</span>)}{clashes.length > 3 ? ` and ${clashes.length - 3} more` : ''}. You can still schedule it.
    </div>
  )
}

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
  const [modalTab, setModalTab] = useState('about')   // about | projects

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
    setOpen(c); setDetail(null); setModalTab('about')
    try { const r = await api.get('/clubs/' + c._id); setDetail(r.data?.data || null) } catch { /* noop */ }
  }
  const STAFF = ['teacher', 'admin', 'ops_manager', 'dos']
  const isStaff = STAFF.includes(user?.role)

  // Students join and leave as members. Staff never do: joining as
  // staff means taking LEADERSHIP of the activity.
  const toggleJoin = async (c) => {
    if (readOnly) return
    setBusy(c._id)
    try {
      const action = isStaff ? 'lead' : (c.isMember ? 'leave' : 'join')
      const r = await api.post(`/clubs/${c._id}/${action}`)
      toast?.ok?.(r.data?.message || (c.isMember ? `Left ${c.name}.` : `Welcome to ${c.name}.`))
      if (isStaff) {
        setClubs(cs => cs.map(x => x._id === c._id ? { ...x, isLeader: true, isMember: false } : x))
        if (open && open._id === c._id) { setOpen(o => ({ ...o, isLeader: true, isMember: false })); setModalTab('manage'); refreshDetail(c._id) }
      } else {
        setClubs(cs => cs.map(x => x._id === c._id ? { ...x, isMember: !c.isMember, memberCount: x.memberCount + (c.isMember ? -1 : 1) } : x))
        if (open && open._id === c._id) setOpen(o => ({ ...o, isMember: !c.isMember }))
      }
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not update membership.') }
    finally { setBusy('') }
  }

  const stepDown = async (c) => {
    if (!window.confirm('Step down from leading ' + c.name + '?')) return
    try {
      await api.post(`/clubs/${c._id}/unlead`)
      toast?.ok?.('You have stepped down from ' + c.name + '.')
      setClubs(cs => cs.map(x => x._id === c._id ? { ...x, isLeader: false } : x))
      if (open && open._id === c._id) { setOpen(o => ({ ...o, isLeader: false })); setModalTab('about') }
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not step down.') }
  }

  const removeMember = async (clubId, m) => {
    if (!window.confirm('Remove ' + m.name + ' from this activity?')) return
    try {
      await api.post(`/clubs/${clubId}/members/${m._id}/remove`)
      toast?.ok?.(m.name + ' removed.')
      refreshDetail(clubId)
      setClubs(cs => cs.map(x => x._id === clubId ? { ...x, memberCount: Math.max(0, x.memberCount - 1) } : x))
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not remove the member.') }
  }

  const refreshDetail = async (id) => {
    try { const r = await api.get('/clubs/' + id); setDetail(r.data?.data || null) } catch (e) {}
  }

  const scheduleMeeting = async (clubId, form) => {
    try {
      // Send the picked local time as a real instant (see ClubsModule).
      await api.post(`/clubs/${clubId}/meetings`, { ...form, scheduledAt: new Date(form.scheduledAt).toISOString() })
      toast?.ok?.((form.repeatWeeks > 1 ? `${form.repeatWeeks} weekly sessions scheduled.` : 'Session scheduled.') + ' Members will find them in Events.')
      refreshDetail(clubId); load()
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not schedule.') }
  }
  const joinMeeting = (id) => joinClassroom(id)

  const mine = clubs.filter(c => c.isMember || c.isLeader)
  const led = clubs.filter(c => c.isLeader)
  const ledIds = new Set(led.map(c => String(c._id)))
  const ledMembers = led.reduce((n, c) => n + (c.memberCount || 0), 0)
  const myUpcoming = (events || []).filter(e => ledIds.has(String(e.clubId || e.club?._id || ''))).length
  const StaffKpis = () => !isStaff ? null : (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
      {[['Activities I lead', led.length, CR], ['Members across mine', ledMembers, GOLD], ['My upcoming sessions', myUpcoming, '#0F766E']].map(([label, n, color]) => (
        <div key={label} style={{ background: '#fff', border: '1px solid #E8E2D6', borderRadius: 14, padding: '12px 18px', minWidth: 140 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color }}>{n}</div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.07em', color: MUTE, textTransform: 'uppercase' }}>{label}</div>
        </div>
      ))}
    </div>
  )


  const nextLabel = (ns) => {
    if (!ns) return ''
    const d = new Date(ns.scheduledAt)
    return d.toLocaleDateString('en-GB', { weekday: 'short' }) + ' · ' + d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()
  }
  const Card = ({ c }) => (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform .15s, box-shadow .15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 34px rgba(26,26,26,.10)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
      <div onClick={() => openClub(c)} style={{ height: 132, position: 'relative', cursor: 'pointer',
        background: c.coverImage ? `url(${c.coverImage}) 70% 50%/cover no-repeat, ${c.color || CR}` : `linear-gradient(135deg, ${c.color || CR}, #1A1A1A)` }}>
        {c.category && <span style={{ position: 'absolute', right: 12, top: 12, fontSize: 10.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,.92)', color: INK, padding: '4px 9px', borderRadius: 99 }}>{c.category}</span>}
        <span style={{ position: 'absolute', left: 16, bottom: -22, width: 46, height: 46, borderRadius: 13, border: '3px solid #fff', background: c.color || CR, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico k={c.icon} c="#fff" s={22} /></span>
      </div>
      <div style={{ padding: '30px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div onClick={() => openClub(c)} style={{ fontWeight: 800, fontSize: 16, color: INK, cursor: 'pointer', lineHeight: 1.3 }}>{c.name}</div>
        <div style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.5, margin: '5px 0 12px', flex: 1 }}>{c.tagline}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, fontSize: 11.5, color: '#5A4D47' }}>
          {(c.nextSession || c.meetingSchedule) && <span style={{ background: CREAM, padding: '4px 9px', borderRadius: 8 }}>{c.nextSession ? nextLabel(c.nextSession) : c.meetingSchedule}</span>}
          <span style={{ background: CREAM, padding: '4px 9px', borderRadius: 8 }}>{c.memberCount ? `${c.memberCount} member${c.memberCount === 1 ? '' : 's'}` : 'New club'}</span>
          {c.leaders?.length > 0 && <span style={{ background: CREAM, padding: '4px 9px', borderRadius: 8 }}>{c.leaders.map(l => l.name).join(', ')}</span>}
        </div>
        {!readOnly && (
          c.isLeader ? (
            <button onClick={() => { openClub(c); setModalTab('manage') }} style={{ padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13, color: '#fff', background: GOLD }}>You lead {'·'} Manage</button>
          ) : c.isMember && !isStaff ? (
            <button onClick={() => openClub(c)} style={{ padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13, color: '#065F46', background: '#E7F7EF' }}>Member {'·'} Open</button>
          ) : (
            <button onClick={() => toggleJoin(c)} disabled={busy === c._id} style={{ padding: '8px 0', borderRadius: 10, cursor: 'pointer', fontWeight: 800, fontSize: 13, color: c.color || CR, background: '#fff', border: `1.5px solid ${c.color || CR}`, opacity: busy === c._id ? .6 : 1 }}>{isStaff ? 'Lead this activity' : 'Join club'}</button>
          )
        )}
      </div>
    </div>
  )

  // ── Overview pieces ──────────────────────────────────────────────
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t) }, [])
  const cats = [...new Set(clubs.map(c => c.category).filter(Boolean))]
  const shown = clubs.filter(c => (cat === 'All' || c.category === cat) &&
    (!q.trim() || (c.name + ' ' + (c.tagline || '')).toLowerCase().includes(q.trim().toLowerCase())))
  const clubById = Object.fromEntries(clubs.map(c => [String(c._id), c]))
  const mineIds = new Set(mine.map(c => String(c._id)))
  const upcoming = [...(events || [])].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
  const nextUp = upcoming.find(e => mineIds.has(String(e.club?._id))) || upcoming[0] || null
  const timeOf = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()
  const dayWord = (d) => {
    const x = new Date(d), t = new Date(now); const k = (y) => y.toDateString()
    if (k(x) === k(t)) return 'Today'
    if (k(x) === k(new Date(now + 864e5))) return 'Tomorrow'
    return x.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
  }

  const OverviewTop = () => {
    const club = nextUp ? clubById[String(nextUp.club?._id)] : null
    const ms = nextUp ? new Date(nextUp.scheduledAt) - now : 0
    const live = nextUp && (nextUp.status === 'live' || (ms <= 10 * 60000 && ms > -(nextUp.durationMins || 60) * 60000))
    const hrs = Math.max(0, Math.floor(ms / 3600000)), mins = Math.max(0, Math.floor((ms % 3600000) / 60000))
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div style={{ borderRadius: 20, color: '#fff', padding: '22px 24px', minHeight: 200, position: 'relative', overflow: 'hidden',
          background: nextUp
            ? `linear-gradient(90deg, rgba(14,18,40,.92) 0%, rgba(14,18,40,.72) 55%, rgba(14,18,40,.15) 100%), ${club?.coverImage ? `url(${club.coverImage}) right -120px center/auto 150% no-repeat,` : ''} ${nextUp.club?.color || CR}`
            : `linear-gradient(135deg, ${CR}, #3D0712)` }}>
          {nextUp ? <>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', color: '#F3D58E', textTransform: 'uppercase' }}>{live ? 'Live now' : 'Next up'} {'·'} {dayWord(nextUp.scheduledAt)} {timeOf(nextUp.scheduledAt)}</div>
            <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 'clamp(1.35rem, 2.4vw, 1.75rem)', fontWeight: 700, margin: '8px 0 6px', lineHeight: 1.2, maxWidth: 520 }}>{nextUp.club?.name ? `${nextUp.club.name}: ` : ''}{nextUp.title}</div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.82)' }}>{nextUp.kind && nextUp.kind !== 'club' ? nextUp.kind[0].toUpperCase() + nextUp.kind.slice(1) + ' · ' : ''}{nextUp.leader ? `Led by ${nextUp.leader} · ` : ''}{nextUp.durationMins || 60} min {'·'} Live classroom</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 20, flexWrap: 'wrap' }}>
              {!readOnly && <button onClick={() => joinMeeting(nextUp._id)} style={{ background: live ? '#DC2626' : '#fff', color: live ? '#fff' : (nextUp.club?.color || CR), border: 'none', borderRadius: 11, padding: '11px 18px', fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }}>{live ? 'Join now' : 'Open room'}</button>}
              {club && <button onClick={() => openClub(club)} style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.4)', borderRadius: 11, padding: '10px 16px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>Club page</button>}
              {!live && ms > 0 && <div style={{ display: 'flex', gap: 8 }}>
                {[[hrs, 'HRS'], [mins, 'MIN']].map(([n, l]) => <div key={l} style={{ background: 'rgba(255,255,255,.12)', borderRadius: 10, padding: '6px 10px', textAlign: 'center', fontSize: 9.5, letterSpacing: '.08em', color: 'rgba(255,255,255,.7)' }}><b style={{ display: 'block', fontSize: 19, color: '#fff', letterSpacing: 0 }}>{n}</b>{l}</div>)}
              </div>}
            </div>
          </> : <>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', color: '#F3D58E' }}>NEXT UP</div>
            <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 24, fontWeight: 700, margin: '8px 0' }}>No club sessions scheduled yet</div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.82)' }}>{isStaff ? 'Lead an activity and schedule its first session.' : 'Join a club below; its sessions will appear here.'}</div>
          </>}
        </div>
        <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 20, padding: '18px 20px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.14em', color: CR, marginBottom: 6 }}>{isStaff ? 'ACTIVITIES I LEAD' : 'MY CLUBS'}</div>
          {(isStaff ? led : mine).length === 0
            ? <div style={{ fontSize: 13, color: MUTE, padding: '12px 0' }}>{isStaff ? 'You are not leading an activity yet. Pick one below and choose Lead this activity.' : 'You have not joined a club yet. Pick one below.'}</div>
            : (isStaff ? led : mine).slice(0, 4).map((c, i, arr) => (
              <div key={c._id} onClick={() => openClub(c)} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #F3ECE2' : 'none', cursor: 'pointer' }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: c.color || CR, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ico k={c.icon} c="#fff" s={20} /></span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: INK }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: MUTE, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nextSession ? `Next: ${dayWord(c.nextSession.scheduledAt)} ${timeOf(c.nextSession.scheduledAt)} · ${c.nextSession.title}` : 'No session scheduled'}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: c.isLeader ? '#8A5A12' : '#065F46', background: c.isLeader ? '#FBF1DC' : '#E7F7EF', padding: '4px 10px', borderRadius: 99, flexShrink: 0 }}>{c.isLeader ? 'Leader' : 'Member'}</span>
              </div>
            ))}
        </div>
      </div>
    )
  }

  const ThisWeek = () => {
    const start = new Date(now); start.setHours(0, 0, 0, 0)
    const days = Array.from({ length: 7 }, (_, i) => new Date(start.getTime() + i * 864e5))
    const byDay = days.map(d => upcoming.filter(e => new Date(e.scheduledAt).toDateString() === d.toDateString()))
    return (
      <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 20, padding: '18px 20px', marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 20, fontWeight: 700, color: INK }}>This week in clubs</div>
          <div style={{ fontSize: 12, color: MUTE }}>Times shown in your time zone</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          {days.map((d, i) => (
            <div key={i}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: i === 0 ? CR : '#9A8F86', marginBottom: 6 }}>
                {i === 0 ? 'TODAY' : d.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()} <span style={{ color: INK, fontSize: 14, letterSpacing: 0 }}>{d.getDate()}</span>
              </div>
              {byDay[i].length === 0 ? <div style={{ fontSize: 11.5, color: '#B3A89E', padding: '6px 0' }}>No sessions</div> : byDay[i].map(e => (
                <div key={e._id} onClick={() => { const c = clubById[String(e.club?._id)]; if (c) openClub(c) }} style={{ cursor: 'pointer', borderLeft: `4px solid ${e.club?.color || CR}`, background: (e.club?.color || CR) + '12', borderRadius: 10, padding: '8px 10px', marginBottom: 6 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, lineHeight: 1.25 }}>{e.club?.name || e.title}</div>
                  <div style={{ fontSize: 11.5, color: '#6B5F57' }}>{timeOf(e.scheduledAt)}{e.status === 'live' ? ' · LIVE' : ''}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const grid = (list) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
      {list.map(c => <Card key={c._id} c={c} />)}
    </div>
  )

  return (
    <div>
      {/* ── Hero: the clubs film full width, with the page title and
          the section tabs over it. Cinematic shading (dark on the left
          for the words, clear on the right) instead of a crimson dye. ── */}
      <div className="clubs-hero" style={{ position: 'relative', zIndex: 0, overflow: 'hidden', borderRadius: 22, marginBottom: 20, minHeight: 250,
        background: `linear-gradient(120deg, ${CR} 0%, #5A0B1B 55%, #2A050C 100%)`, boxShadow: '0 14px 40px -18px rgba(61,7,18,.55)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <HeroPanelVideo tone="cinematic" />
        <div className="ch-shade" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none' }} />
        <style>{`
          .clubs-hero .ch-tab{display:flex;align-items:center;gap:8px;padding:9px 16px;border-radius:99px;cursor:pointer;font-size:14px;color:#fff;
            border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:background .2s}
          .clubs-hero .ch-tab:hover{background:rgba(255,255,255,.16)}
          .clubs-hero .ch-tab.on{background:#fff;color:${CR};border-color:#fff;font-weight:800}
          @media(max-width:700px){.clubs-hero .ch-shade{background:linear-gradient(180deg,rgba(40,6,14,.55),rgba(40,6,14,.35) 60%,rgba(20,3,8,.6))}.clubs-hero{min-height:220px!important}.clubs-hero .ch-quote{display:none}.clubs-hero .ch-tab{padding:8px 12px;font-size:13px}}
        `}</style>
        <div style={{ padding: '26px 28px 0', maxWidth: 640 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.2em', color: '#F3D58E', textTransform: 'uppercase' }}>Beyond the classroom</div>
          <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 'clamp(1.9rem, 3.8vw, 2.7rem)', fontWeight: 600, lineHeight: 1.1, color: '#fff', margin: '6px 0 8px', textShadow: '0 2px 18px rgba(0,0,0,.35)' }}>
            {isStaff ? <>Clubs &amp; <em style={{ color: '#F3D58E' }}>activities</em></> : <>Your <em style={{ color: '#F3D58E' }}>clubs</em></>}
          </div>
          <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,.86)', lineHeight: 1.55, maxWidth: 520 }}>{isStaff ? 'Lead an activity, schedule sessions at any time of day, and see the week at a glance.' : 'Find your people, join a session live, and catch up on anything you missed.'}</div>
          <div style={{ display: 'flex', gap: 18, marginTop: 14, flexWrap: 'wrap', color: 'rgba(255,255,255,.9)', fontSize: 13 }}>
            {[[clubs.length, 'clubs'], [isStaff ? led.length : mine.length, isStaff ? 'you lead' : 'joined'], [(events || []).length, 'sessions coming up']].map(([n, l]) => (
              <span key={l}><b style={{ fontSize: 18, color: '#fff', marginRight: 5 }}>{n}</b>{l}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '18px 20px 18px' }}>
          {[['overview', 'Overview', 'home'], ['mine', 'My Clubs', 'users'], ['events', 'Events', 'cal'], ['recordings', 'Recordings', 'play']].map(([id, label, k]) => (
            <button key={id} className={'ch-tab' + (tab === id ? ' on' : '')} onClick={() => setTab(id)}><Ico k={k} c={tab === id ? CR : '#fff'} s={16} />{label}</button>
          ))}
          <div className="ch-quote" style={{ marginLeft: 'auto', color: 'rgba(255,255,255,.85)', fontSize: 12.5, fontStyle: 'italic' }}>
            <span style={{ color: '#F3D58E', fontSize: 18, lineHeight: 0 }}>&ldquo;</span> Discover your passion today, lead the world tomorrow.
          </div>
        </div>
      </div>

      {/* Main */}
      <div>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: MUTE }}>Loading clubs...</div> : (
          <>
            {tab === 'overview' && (
              <>
            <StaffKpis />
                {clubs.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: MUTE, background: '#fff', borderRadius: 16, border: `1px solid ${LINE}` }}>Clubs are being set up. Check back soon.</div> : <>
                  <OverviewTop />
                  <ThisWeek />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', margin: '24px 0 14px' }}>
                    {['All', ...cats].map(k => (
                      <button key={k} onClick={() => setCat(k)} style={{ padding: '8px 15px', borderRadius: 99, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        border: `1px solid ${cat === k ? INK : '#E4DACB'}`, background: cat === k ? INK : '#fff', color: cat === k ? '#fff' : '#5A4D47' }}>
                        {k === 'All' ? `All ${clubs.length}` : k}
                      </button>
                    ))}
                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search clubs" style={{ marginLeft: 'auto', minWidth: 200, padding: '8px 16px', borderRadius: 99, border: '1px solid #E4DACB', fontSize: 13, background: '#fff', outline: 'none' }} />
                  </div>
                  {shown.length === 0 ? <div style={{ padding: 30, textAlign: 'center', color: MUTE, background: '#fff', borderRadius: 16, border: `1px solid ${LINE}` }}>No clubs match.</div> : grid(shown)}
                </>}
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
            <div style={{ height: 150, background: open.coverImage ? `url(${open.coverImage}) center/cover no-repeat, linear-gradient(135deg, ${open.color}, #1A1A1A)` : `linear-gradient(135deg, ${open.color}, #1A1A1A)`, position: 'relative' }}>
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
                  <button onClick={() => toggleJoin(open)} style={{ padding: '10px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 800, color: '#fff', background: isStaff ? CR : (open.isMember ? '#6B7280' : open.color) }}>{isStaff ? 'Lead this activity' : open.isMember ? 'Leave club' : 'Join Club'}</button>
                )}
                {!readOnly && open.isLeader && (
                  <span style={{ padding: '8px 14px', borderRadius: 999, fontWeight: 800, fontSize: 11.5, color: GOLD, background: '#FBF4E4', border: `1px solid ${GOLD}` }}>Activity leader</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 16, background: CREAM, borderRadius: 10, padding: 4, width: 'fit-content' }}>
                {[['about', 'About & sessions'], ['projects', 'Projects & awards'], ...(open.isLeader && !readOnly ? [['manage', 'Manage']] : [])].map(([id, label]) => (
                  <button key={id} onClick={() => setModalTab(id)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 800, background: modalTab === id ? open.color : 'transparent', color: modalTab === id ? '#fff' : MUTE }}>{label}</button>
                ))}
              </div>

              {modalTab === 'manage' && open.isLeader && !readOnly ? (
                <ManagePanel club={open} detail={detail} onRemove={(m) => removeMember(open._id, m)}
                  onSchedule={(f) => scheduleMeeting(open._id, f)} onStepDown={() => stepDown(open)} onStart={joinMeeting} />
              ) : modalTab === 'projects' ? (
                <ClubProjects club={open} user={user} toast={toast} readOnly={readOnly} />
              ) : (
              <>
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
              </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * ClubProjects: the club's project gallery and annual awards. Members
 * upload their work (a build, an initiative, writing, an app, a video),
 * fellow members discuss each project and suggest improvements, and cast
 * one award vote per club per year, movable until the awards.
 */
function ManagePanel({ club, detail, onRemove, onSchedule, onStepDown, onStart }) {
  const [mf, setMf] = useState({ title: '', scheduledAt: '', durationMins: 60, repeatWeeks: 1 })
  const clashes = useClashes(club?._id, mf)
  const members = detail?.members || []
  const upcoming = detail?.upcoming || []
  const input = { padding: '8px 10px', border: '1.5px solid #E5DFD3', borderRadius: 9, fontSize: 12.5 }
  const label = (t) => <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: '.09em', color: '#C9973A', textTransform: 'uppercase', margin: '14px 0 8px' }}>{t}</div>
  return (
    <div style={{ paddingTop: 6 }}>
      {label('Schedule a session')}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={mf.title} onChange={e => setMf(f => ({ ...f, title: e.target.value }))} placeholder="Session title" style={{ ...input, flex: 1, minWidth: 160 }} />
        <input type="datetime-local" value={mf.scheduledAt} onChange={e => setMf(f => ({ ...f, scheduledAt: e.target.value }))} style={input} />
        <input type="number" min="15" step="15" value={mf.durationMins} onChange={e => setMf(f => ({ ...f, durationMins: Number(e.target.value) || 60 }))} style={{ ...input, width: 80 }} title="Minutes" />
        <select value={mf.repeatWeeks} onChange={e => setMf(f => ({ ...f, repeatWeeks: Number(e.target.value) }))} style={input} title="Repeat weekly">
          {[1, 2, 4, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n === 1 ? 'Once' : `Weekly × ${n}`}</option>)}
        </select>
        <button onClick={() => { if (!mf.title.trim() || !mf.scheduledAt) return; onSchedule({ title: mf.title.trim(), scheduledAt: mf.scheduledAt, durationMins: mf.durationMins, repeatWeeks: mf.repeatWeeks }); setMf({ title: '', scheduledAt: '', durationMins: 60, repeatWeeks: 1 }) }}
          style={{ padding: '9px 16px', borderRadius: 9, border: 'none', background: '#7D1025', color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>{mf.repeatWeeks > 1 ? `Schedule ${mf.repeatWeeks}` : 'Schedule'}</button>
      </div>
      <ClashNote clashes={clashes} ready={!!mf.scheduledAt} />
      {upcoming.length > 0 && <>
        {label('Upcoming sessions')}
        <div style={{ display: 'grid', gap: 6 }}>
          {upcoming.map(m => (
            <div key={m._id} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12.5, background: '#FBF8F3', border: '1px solid #E5DFD3', borderRadius: 10, padding: '8px 12px' }}>
              <b style={{ flex: 1, color: '#231715' }}>{m.title}</b>
              <span style={{ color: '#8A8378', fontSize: 11.5 }}>{new Date(m.scheduledAt).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              <button onClick={() => onStart(m._id)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#0F766E', color: '#fff', fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>Open room</button>
            </div>
          ))}
        </div>
      </>}
      {label('Members ' + (members.length ? '(' + members.length + ')' : ''))}
      {!members.length ? <div style={{ fontSize: 12, color: '#8A8378' }}>No members yet. Students join from their portal; your activity appears in their Clubs page.</div> : (
        <div style={{ display: 'grid', gap: 4, maxHeight: 220, overflow: 'auto' }}>
          {members.map(m => (
            <div key={m._id} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12.5, borderBottom: '1px solid #F2EFE9', padding: '6px 2px' }}>
              <span style={{ flex: 1, color: '#231715', fontWeight: 600 }}>{m.name}</span>
              <button onClick={() => onRemove(m)} style={{ padding: '4px 10px', borderRadius: 7, border: '1.5px solid #E8B4B4', background: '#fff', color: '#B91C1C', fontWeight: 800, fontSize: 10.5, cursor: 'pointer' }}>Remove</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 18, borderTop: '1px solid #E5DFD3', paddingTop: 12 }}>
        <button onClick={onStepDown} style={{ padding: '8px 14px', borderRadius: 9, border: '1.5px solid #E5DFD3', background: '#fff', color: '#8A8378', fontWeight: 800, fontSize: 11.5, cursor: 'pointer' }}>Step down as leader</button>
      </div>
    </div>
  )
}

function ClubProjects({ club, user, toast, readOnly }) {
  const [projects, setProjects] = useState([])
  const [top3, setTop3] = useState([])
  const [year] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [share, setShare] = useState(null)          // { title, description, attachments }
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [openProj, setOpenProj] = useState(null)    // { project, comments }
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const fileRef = useRef(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get(`/clubs/${club._id}/projects`, { params: { year } })
      .then(r => { setProjects(r.data?.data?.projects || []); setTop3(r.data?.data?.top3 || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [club._id, year])
  useEffect(() => { load() }, [load])

  const openProject = async (p) => {
    try { const r = await api.get(`/clubs/${club._id}/projects/${p._id}`); setOpenProj(r.data?.data); setComment('') }
    catch { toast?.error?.('Could not open the project.') }
  }
  const addFile = async (file) => {
    if (!file || !share) return
    if (share.attachments.length >= 4) return toast?.error?.('Up to 4 files per project.')
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const r = await api.post(`/clubs/${club._id}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const a = r.data?.data?.attachment
      if (a) setShare(sh => ({ ...sh, attachments: [...sh.attachments, a] }))
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Upload failed.') }
    finally { setUploading(false) }
  }
  const publish = async () => {
    if (!share.title.trim()) return toast?.error?.('Give your project a title.')
    setPosting(true)
    try {
      await api.post(`/clubs/${club._id}/projects`, share)
      toast?.ok?.('Project published to the club.')
      setShare(null); load()
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not publish.') }
    finally { setPosting(false) }
  }
  const vote = async (p) => {
    try {
      const r = await api.post(`/clubs/${club._id}/projects/${p._id}/vote`)
      toast?.ok?.(r.data?.message)
      load()
      if (openProj?.project?._id === p._id) openProject(p)
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not vote.') }
  }
  const sendComment = async () => {
    const body = comment.trim()
    if (!body || sending) return
    setSending(true)
    try {
      await api.post(`/clubs/${club._id}/projects/${openProj.project._id}/comments`, { body })
      setComment('')
      openProject(openProj.project)
      setProjects(ps => ps.map(x => x._id === openProj.project._id ? { ...x, commentCount: x.commentCount + 1 } : x))
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not comment.') }
    finally { setSending(false) }
  }
  const removeProject = async (p) => {
    if (!window.confirm('Take this project down?')) return
    try { await api.delete(`/clubs/${club._id}/projects/${p._id}`); setOpenProj(null); load() }
    catch { toast?.error?.('Could not remove it.') }
  }

  const medal = ['#F2C230', '#C0C7D1', '#C88A5B']
  const rankOf = (id) => top3.indexOf(id)
  const canAct = !readOnly && (club.isMember || club.isLeader)
  const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const AvatarDot = ({ a, size = 26 }) => a?.avatar
    ? <img src={a.avatar} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    : <span style={{ width: size, height: size, borderRadius: '50%', background: club.color, color: '#fff', fontSize: size * .42, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{(a?.name || '?')[0]}</span>

  const Thumb = ({ a }) => {
    if (a.kind === 'image') return <img src={a.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    if (a.kind === 'video') return <video src={a.url} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#000' }} />
    return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${club.color}18` }}><Ico k="book" c={club.color} s={28} /></div>
  }

  return (
    <div style={{ marginTop: 16 }}>
      {/* Awards banner */}
      <div style={{ background: 'linear-gradient(135deg, #FDF6E3, #FBF1F1)', border: `1px solid ${LINE}`, borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Ico k="trophy" c={GOLD} s={30} />
        <div style={{ flex: 1, minWidth: 200, fontSize: 12.5, color: INK, lineHeight: 1.5 }}>
          <b>{year} Club Awards.</b> Share your project, discuss and improve each other's work, and cast your award vote. One vote per member, and you can move it any time before the awards.
        </div>
        {canAct && <button onClick={() => setShare({ title: '', description: '', attachments: [] })} style={{ background: club.color, color: '#fff', border: 'none', borderRadius: 9, padding: '10px 16px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>+ Share a project</button>}
      </div>

      {/* Share form */}
      {share && (
        <div style={{ border: `1.5px solid ${club.color}55`, borderRadius: 12, padding: 16, marginTop: 12, background: '#fff' }}>
          <input value={share.title} onChange={e => setShare(sh => ({ ...sh, title: e.target.value }))} placeholder="Project title (e.g. Water filter from local materials)" maxLength={140}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: `1.5px solid ${LINE}`, borderRadius: 9, fontSize: 14, fontWeight: 700 }} />
          <textarea value={share.description} onChange={e => setShare(sh => ({ ...sh, description: e.target.value }))} placeholder="Tell the club about it: what it is, how you built it, what you'd like feedback on..." maxLength={3000}
            style={{ width: '100%', boxSizing: 'border-box', minHeight: 90, marginTop: 8, padding: '10px 12px', border: `1.5px solid ${LINE}`, borderRadius: 9, fontSize: 13, lineHeight: 1.5, fontFamily: 'inherit' }} />
          {share.attachments.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {share.attachments.map((a, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: CREAM, border: `1px solid ${LINE}`, fontSize: 11.5, color: INK }}>
                  {a.name || a.kind}
                  <button onClick={() => setShare(sh => ({ ...sh, attachments: sh.attachments.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTE, fontWeight: 800 }}>&times;</button>
                </span>
              ))}
            </div>
          )}
          <input ref={fileRef} type="file" hidden accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt" onChange={e => { addFile(e.target.files?.[0]); e.target.value = '' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${LINE}`, background: '#fff', color: INK, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: uploading ? .5 : 1 }}>{uploading ? 'Uploading...' : 'Add photo / video / file'}</button>
            <span style={{ flex: 1, fontSize: 11, color: MUTE }}>Up to 4 files, 80MB each.</span>
            <button onClick={() => setShare(null)} style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${LINE}`, background: '#fff', color: MUTE, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            <button onClick={publish} disabled={posting || uploading} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: club.color, color: '#fff', fontSize: 12.5, fontWeight: 800, cursor: 'pointer', opacity: posting ? .6 : 1 }}>{posting ? 'Publishing...' : 'Publish to club'}</button>
          </div>
        </div>
      )}

      {/* Gallery */}
      {loading ? <div style={{ padding: 30, textAlign: 'center', color: MUTE, fontSize: 13 }}>Loading projects...</div>
        : projects.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: MUTE, fontSize: 13 }}>No projects shared yet this year. {canAct ? 'Be the first: your work could win the club award.' : ''}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginTop: 14 }}>
            {projects.map(p => {
              const rk = rankOf(p._id)
              return (
                <div key={p._id} onClick={() => openProject(p)} style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', background: '#fff', position: 'relative' }}>
                  {rk > -1 && p.votes > 0 && (
                    <span style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, width: 26, height: 26, borderRadius: '50%', background: medal[rk], color: '#3A2A00', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,.25)' }}>{rk + 1}</span>
                  )}
                  <div style={{ aspectRatio: '16/10', background: CREAM }}>
                    {p.attachments[0] ? <Thumb a={p.attachments[0]} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico k={club.icon} c={club.color} s={38} /></div>}
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: INK, lineHeight: 1.35 }}>{p.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 7 }}>
                      <AvatarDot a={p.author} size={22} />
                      <span style={{ flex: 1, fontSize: 11.5, color: MUTE, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.author?.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, fontSize: 11.5, color: MUTE }}>
                      <span style={{ fontWeight: 800, color: p.myVote ? club.color : MUTE }}>{'\u2605'} {p.votes}</span>
                      <span>{'\ud83d\udcac'.length ? '' : ''}{p.commentCount} comment{p.commentCount === 1 ? '' : 's'}</span>
                      <span style={{ marginLeft: 'auto' }}>{fmt(p.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      {/* Project detail + discussion */}
      {openProj && (
        <div onClick={() => setOpenProj(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: 'min(680px, 100%)', maxHeight: '92vh', overflowY: 'auto', padding: 22 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: INK, lineHeight: 1.3 }}>{openProj.project.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <AvatarDot a={openProj.project.author} />
                  <span style={{ fontSize: 12.5, color: MUTE }}>{openProj.project.author?.name}{openProj.project.author?.gradeLevel ? ` \u00b7 ${openProj.project.author.gradeLevel}` : ''} \u00b7 {fmt(openProj.project.createdAt)}</span>
                </div>
              </div>
              {(openProj.project.mine || club.isLeader) && (
                <button onClick={() => removeProject(openProj.project)} style={{ background: '#fff', border: `1px solid #FCA5A5`, color: '#B91C1C', borderRadius: 8, padding: '6px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>Take down</button>
              )}
              <button onClick={() => setOpenProj(null)} style={{ background: CREAM, border: 'none', borderRadius: 999, width: 30, height: 30, cursor: 'pointer', fontWeight: 800, color: MUTE }}>&times;</button>
            </div>

            {openProj.project.description && <p style={{ fontSize: 13.5, color: INK, lineHeight: 1.7, marginTop: 12, whiteSpace: 'pre-wrap' }}>{openProj.project.description}</p>}

            {openProj.project.attachments.length > 0 && (
              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                {openProj.project.attachments.map((a, i) => (
                  a.kind === 'image' ? <img key={i} src={a.url} alt="" style={{ width: '100%', borderRadius: 10, display: 'block' }} />
                  : a.kind === 'video' ? <video key={i} src={a.url} controls playsInline style={{ width: '100%', borderRadius: 10, background: '#000', display: 'block' }} />
                  : a.kind === 'audio' ? <audio key={i} src={a.url} controls style={{ width: '100%' }} />
                  : <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: `1px solid ${LINE}`, borderRadius: 10, textDecoration: 'none', color: INK, fontSize: 13, fontWeight: 700 }}><Ico k="book" c={club.color} s={20} />{a.name || 'Attachment'}<span style={{ marginLeft: 'auto', fontSize: 11, color: MUTE }}>Open</span></a>
                ))}
              </div>
            )}

            {/* Vote */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, padding: '12px 14px', borderRadius: 12, background: 'linear-gradient(135deg, #FDF6E3, #FBF1F1)', border: `1px solid ${LINE}` }}>
              <Ico k="trophy" c={GOLD} s={24} />
              <span style={{ flex: 1, fontSize: 12.5, color: INK }}><b>{openProj.project.votes}</b> award vote{openProj.project.votes === 1 ? '' : 's'} this year</span>
              {canAct && !openProj.project.mine && (
                <button onClick={() => vote(openProj.project)} style={{ background: openProj.project.myVote ? '#6B7280' : club.color, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 16px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>
                  {openProj.project.myVote ? 'Withdraw my vote' : '\u2605 Vote for the award'}
                </button>
              )}
              {openProj.project.mine && <span style={{ fontSize: 11.5, color: MUTE }}>Your project. Members vote, you campaign.</span>}
            </div>

            {/* Discussion */}
            <div style={{ marginTop: 18, fontSize: 11, fontWeight: 800, letterSpacing: '.12em', color: GOLD, textTransform: 'uppercase' }}>Discussion ({openProj.comments.length})</div>
            {openProj.comments.length === 0 && <div style={{ fontSize: 12.5, color: MUTE, padding: '10px 0' }}>No comments yet. Start the discussion: what works, what could be better?</div>}
            {openProj.comments.map(c => (
              <div key={c._id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: `1px solid ${LINE}` }}>
                <AvatarDot a={c.author} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: INK }}>{c.author?.name}{['teacher', 'admin', 'dos', 'ops_manager'].includes(c.author?.role) && <span style={{ fontSize: 9.5, fontWeight: 800, color: '#12060B', background: GOLD, padding: '1px 6px', borderRadius: 999, marginLeft: 6 }}>TEACHER</span>} <span style={{ fontWeight: 400, color: MUTE, fontSize: 11 }}>{fmt(c.createdAt)}</span></div>
                  <div style={{ fontSize: 13, color: INK, lineHeight: 1.55, marginTop: 3, whiteSpace: 'pre-wrap' }}>{c.body}</div>
                </div>
              </div>
            ))}
            {canAct && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendComment() }} maxLength={1000}
                  placeholder="Comment or suggest an improvement..." style={{ flex: 1, minWidth: 0, padding: '10px 13px', border: `1.5px solid ${LINE}`, borderRadius: 10, fontSize: 13 }} />
                <button onClick={sendComment} disabled={sending || !comment.trim()} style={{ background: comment.trim() ? club.color : CREAM, color: comment.trim() ? '#fff' : MUTE, border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>Send</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
