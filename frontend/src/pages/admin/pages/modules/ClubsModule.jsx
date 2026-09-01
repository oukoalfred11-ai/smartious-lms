import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'

const LINE = TOKENS.line || '#EAE4DC'
const S600 = TOKENS.s600 || '#6B5D57'
const ICONS = ['debate', 'code', 'science', 'art', 'rocket', 'chess', 'mic', 'book', 'music', 'theatre', 'sports', 'heart', 'star']
const COLORS = ['#1E3A8A', '#6D28D9', '#3F6212', '#BE185D', '#C2410C', '#78350F', '#0E7490', '#1D4ED8', '#5B21B6', '#B91C1C', '#0F766E', '#2563EB', '#7D1025']
const EMPTY = { name: '', tagline: '', description: '', icon: 'star', color: '#7D1025', coverImage: '', category: 'General', meetingSchedule: '', durationMins: 60, capacity: 0, leaders: [], isActive: true, featured: false }

const fmtWhen = (d) => new Date(d).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const toLocal = (d) => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16) }

export default function ClubsModule({ toast }) {
  const [clubs, setClubs] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)        // club being created/edited
  const [detail, setDetail] = useState(null)    // { club, members, upcoming, past }
  const [meeting, setMeeting] = useState(null)  // schedule form for a club
  const [busy, setBusy] = useState(false)
  const [playing, setPlaying] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/clubs', { params: { all: true } }).catch(() => ({ data: { data: { clubs: [] } } })),
      api.get('/clubs/admin/teachers').catch(() => ({ data: { data: { teachers: [] } } })),
    ]).then(([c, t]) => { setClubs(c.data?.data?.clubs || []); setTeachers(t.data?.data?.teachers || []) })
      .finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const openDetail = async (c) => {
    try { const r = await api.get('/clubs/' + c._id); setDetail(r.data?.data) } catch { toast?.error?.('Could not load club.') }
  }
  const save = async () => {
    if (!form.name.trim()) return toast?.error?.('Give the club a name.')
    setBusy(true)
    try {
      if (form._id) await api.patch('/clubs/' + form._id, form)
      else await api.post('/clubs', form)
      toast?.ok?.(form._id ? 'Club updated.' : 'Club created.')
      setForm(null); load()
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not save.') }
    finally { setBusy(false) }
  }
  const seed = async () => {
    if (!window.confirm('Create the 12 starter clubs (Debate & MUN, Coding & AI, Chess...)? Existing ones are skipped.')) return
    setBusy(true)
    try { const r = await api.post('/clubs/admin/seed'); toast?.ok?.(r.data?.message); load() }
    catch (e) { toast?.error?.(e?.response?.data?.message || 'Seed failed.') }
    finally { setBusy(false) }
  }
  const schedule = async () => {
    if (!meeting.scheduledAt) return toast?.error?.('Pick a date and time.')
    setBusy(true)
    try {
      await api.post(`/clubs/${meeting.clubId}/meetings`, meeting)
      toast?.ok?.('Session scheduled. It will open in the meeting view and record automatically.')
      setMeeting(null); if (detail) openDetail(detail.club)
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not schedule.') }
    finally { setBusy(false) }
  }
  const cancelMeeting = async (m) => {
    if (!window.confirm('Cancel this session?')) return
    try { await api.delete(`/clubs/${detail.club._id}/meetings/${m._id}`); openDetail(detail.club) } catch { toast?.error?.('Could not cancel.') }
  }

  const card = { background: '#fff', border: `1.5px solid ${LINE}`, borderRadius: 14, padding: 18 }
  const input = { width: '100%', padding: '9px 12px', border: `1.5px solid ${LINE}`, borderRadius: 8, fontSize: 13.5, boxSizing: 'border-box' }
  const btn = (primary, color) => ({ padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${primary ? (color || TOKENS.crimson) : LINE}`, background: primary ? (color || TOKENS.crimson) : '#fff', color: primary ? '#fff' : S600 })
  const Ico = ({ k, c, s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><circle cx="12" cy="12" r="10" opacity={k === 'star' ? .35 : .35} /><text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">{(k || '?')[0].toUpperCase()}</text></svg>

  return (
    <div style={{ display: 'grid', gap: 18, maxWidth: 1040 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: TOKENS.s900, margin: 0 }}>Clubs</h2>
          <p style={{ fontSize: 13, color: TOKENS.s500, margin: '4px 0 0' }}>Set up clubs, put teachers in charge, and schedule sessions. Every session runs in the live classroom's meeting view and records automatically.</p>
        </div>
        <button style={btn(false)} onClick={seed} disabled={busy}>Add starter clubs</button>
        <button style={btn(true)} onClick={() => setForm({ ...EMPTY })}>+ New club</button>
      </div>

      {loading ? <div style={{ ...card, textAlign: 'center', color: TOKENS.s500 }}>Loading...</div> : clubs.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: TOKENS.s500 }}>No clubs yet. Use <b>Add starter clubs</b> for the standard twelve, or create your own.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {clubs.map(c => (
            <div key={c._id} style={{ ...card, borderTop: `4px solid ${c.color}`, opacity: c.isActive ? 1 : .6 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ width: 42, height: 42, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontWeight: 800 }}>{c.name[0]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: TOKENS.s900 }}>{c.name} {!c.isActive && <span style={{ fontSize: 10, color: '#B91C1C', fontWeight: 800 }}>INACTIVE</span>}</div>
                  <div style={{ fontSize: 12, color: S600, marginTop: 3, lineHeight: 1.45 }}>{c.tagline}</div>
                  <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 6 }}>
                    {c.memberCount} member{c.memberCount === 1 ? '' : 's'} &middot; {c.leaders.length ? 'Led by ' + c.leaders.map(l => l.name).join(', ') : <span style={{ color: '#B45309', fontWeight: 700 }}>No teacher assigned</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <button style={btn(true, c.color)} onClick={() => setMeeting({ clubId: c._id, clubName: c.name, title: `${c.name} meeting`, scheduledAt: '', durationMins: c.durationMins || 60, kind: 'club', teacherId: c.leaders[0]?._id || '' })}>Schedule session</button>
                <button style={btn(false)} onClick={() => openDetail(c)}>Members & sessions</button>
                <button style={btn(false)} onClick={() => setForm({ ...EMPTY, ...c, leaders: c.leaders.map(l => l._id) })}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / edit */}
      {form && (
        <div onClick={() => setForm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: 'min(640px, 100%)', maxHeight: '92vh', overflowY: 'auto', padding: 24 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 18, color: TOKENS.s900 }}>{form._id ? 'Edit club' : 'New club'}</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <input style={input} placeholder="Club name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <input style={input} placeholder="One-line tagline (shown on the card)" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} />
              <textarea style={{ ...input, minHeight: 90 }} placeholder="Longer description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input style={input} placeholder="Category (Arts, STEM, Leadership...)" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                <input style={input} placeholder="Meets (e.g. Fridays 4:00 PM EAT)" value={form.meetingSchedule} onChange={e => setForm(f => ({ ...f, meetingSchedule: e.target.value }))} />
              </div>
              <input style={input} placeholder="Cover image URL (optional; leave blank for a colour cover)" value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} />
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: S600, marginBottom: 6 }}>Icon</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ICONS.map(k => <button key={k} onClick={() => setForm(f => ({ ...f, icon: k }))} style={{ padding: '5px 10px', borderRadius: 999, border: `1.5px solid ${form.icon === k ? TOKENS.crimson : LINE}`, background: form.icon === k ? TOKENS.crimson : '#fff', color: form.icon === k ? '#fff' : S600, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>{k}</button>)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: S600, marginBottom: 6 }}>Colour</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {COLORS.map(c => <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: `3px solid ${form.color === c ? TOKENS.s900 : '#fff'}`, cursor: 'pointer', boxShadow: '0 0 0 1px ' + LINE }} />)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: S600, marginBottom: 6 }}>Teachers in charge</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 130, overflowY: 'auto' }}>
                  {teachers.length === 0 && <span style={{ fontSize: 12, color: TOKENS.s500 }}>No active teachers found.</span>}
                  {teachers.map(t => { const on = form.leaders.includes(t._id); return (
                    <button key={t._id} onClick={() => setForm(f => ({ ...f, leaders: on ? f.leaders.filter(x => x !== t._id) : [...f.leaders, t._id] }))} style={{ padding: '5px 11px', borderRadius: 999, border: `1.5px solid ${on ? TOKENS.crimson : LINE}`, background: on ? '#FBF3F4' : '#fff', color: on ? TOKENS.crimson : S600, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{on ? '\u2713 ' : ''}{t.name}</button>
                  )})}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <label style={{ fontSize: 12, color: S600 }}>Session length (min)<input type="number" style={input} value={form.durationMins} onChange={e => setForm(f => ({ ...f, durationMins: Number(e.target.value) }))} /></label>
                <label style={{ fontSize: 12, color: S600 }}>Capacity (0 = open)<input type="number" style={input} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} /></label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: S600, justifyContent: 'flex-end' }}>
                  <label><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Active</label>
                  <label><input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} /> Featured</label>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
              <button style={btn(false)} onClick={() => setForm(null)}>Cancel</button>
              <button style={btn(true)} onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save club'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule session */}
      {meeting && (
        <div onClick={() => setMeeting(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: 'min(480px, 100%)', padding: 24 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, color: TOKENS.s900 }}>Schedule a session</h3>
            <div style={{ fontSize: 12.5, color: S600, marginBottom: 14 }}>{meeting.clubName}. Opens in the classroom's meeting view and records automatically.</div>
            <div style={{ display: 'grid', gap: 12 }}>
              <input style={input} value={meeting.title} onChange={e => setMeeting(m => ({ ...m, title: e.target.value }))} placeholder="Session title" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
                <input type="datetime-local" style={input} value={meeting.scheduledAt} onChange={e => setMeeting(m => ({ ...m, scheduledAt: e.target.value }))} />
                <input type="number" style={input} value={meeting.durationMins} onChange={e => setMeeting(m => ({ ...m, durationMins: Number(e.target.value) }))} placeholder="Minutes" />
              </div>
              <select style={input} value={meeting.kind} onChange={e => setMeeting(m => ({ ...m, kind: e.target.value }))}>
                <option value="club">Regular meeting</option><option value="competition">Competition</option><option value="event">Event</option>
              </select>
              <select style={input} value={meeting.teacherId} onChange={e => setMeeting(m => ({ ...m, teacherId: e.target.value }))}>
                <option value="">Host: first assigned teacher</option>
                {teachers.map(t => <option key={t._id} value={t._id}>Host: {t.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
              <button style={btn(false)} onClick={() => setMeeting(null)}>Cancel</button>
              <button style={btn(true)} onClick={schedule} disabled={busy}>{busy ? 'Scheduling...' : 'Schedule'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Members & sessions */}
      {detail && (
        <div onClick={() => setDetail(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: 'min(760px, 100%)', maxHeight: '92vh', overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 18, color: detail.club.color, flex: 1 }}>{detail.club.name}</h3>
              <button style={btn(false)} onClick={() => setDetail(null)}>Close</button>
            </div>
            {playing && <video key={playing} src={playing} controls autoPlay style={{ width: '100%', borderRadius: 12, background: '#000', marginTop: 12 }} />}

            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', color: TOKENS.s500, textTransform: 'uppercase', margin: '18px 0 8px' }}>Upcoming sessions</div>
            {detail.upcoming.length === 0 ? <div style={{ fontSize: 12.5, color: TOKENS.s500 }}>Nothing scheduled.</div> : detail.upcoming.map(m => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${LINE}`, fontSize: 13 }}>
                <span style={{ flex: 1, fontWeight: 600, color: TOKENS.s900 }}>{m.title} {m.status === 'live' && <span style={{ fontSize: 10, color: '#fff', background: '#DC2626', padding: '1px 7px', borderRadius: 999, fontWeight: 800 }}>LIVE</span>}</span>
                <span style={{ color: S600, fontSize: 12 }}>{fmtWhen(m.scheduledAt)}</span>
                <button style={btn(true, detail.club.color)} onClick={() => window.open('/classroom/' + m._id, '_blank', 'noopener')}>{m.status === 'live' ? 'Join' : 'Open'}</button>
                <button style={{ ...btn(false), color: '#B91C1C', borderColor: '#FCA5A5' }} onClick={() => cancelMeeting(m)}>Cancel</button>
              </div>
            ))}

            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', color: TOKENS.s500, textTransform: 'uppercase', margin: '18px 0 8px' }}>Recorded sessions (evidence archive)</div>
            {detail.past.filter(p => p.recordings.length).length === 0 ? <div style={{ fontSize: 12.5, color: TOKENS.s500 }}>No recordings yet.</div> : detail.past.filter(p => p.recordings.length).map(p => (
              <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${LINE}`, fontSize: 13 }}>
                <span style={{ flex: 1, fontWeight: 600, color: TOKENS.s900 }}>{p.title}</span>
                <span style={{ color: S600, fontSize: 12 }}>{fmtWhen(p.scheduledAt)}</span>
                <button style={btn(true, detail.club.color)} onClick={() => setPlaying(p.recordings[0].url)}>Play</button>
              </div>
            ))}

            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', color: TOKENS.s500, textTransform: 'uppercase', margin: '18px 0 8px' }}>Members ({detail.members.length})</div>
            {detail.members.length === 0 ? <div style={{ fontSize: 12.5, color: TOKENS.s500 }}>No members yet.</div> : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {detail.members.map(m => <span key={m._id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px 5px 5px', borderRadius: 999, border: `1px solid ${LINE}`, fontSize: 12, color: TOKENS.s900 }}>
                  {m.avatar ? <img src={m.avatar} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} /> : <span style={{ width: 22, height: 22, borderRadius: '50%', background: detail.club.color, color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{m.name[0]}</span>}
                  {m.name}{m.gradeLevel ? <span style={{ color: TOKENS.s500 }}> {m.gradeLevel}</span> : null}
                </span>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
