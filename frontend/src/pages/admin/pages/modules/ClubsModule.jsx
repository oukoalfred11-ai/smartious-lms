import React, { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { joinClassroom } from '../../../../lib/joinClassroom.js'
import { useClashes, ClashNote } from '../../../../components/ClubsHub.jsx'

const LINE = TOKENS.line || '#EAE4DC'
const S600 = TOKENS.s600 || '#6B5D57'
const ICONS = ['debate', 'code', 'science', 'art', 'rocket', 'chess', 'mic', 'book', 'music', 'theatre', 'sports', 'heart', 'star']
const COLORS = ['#1E3A8A', '#6D28D9', '#3F6212', '#BE185D', '#C2410C', '#78350F', '#0E7490', '#1D4ED8', '#5B21B6', '#B91C1C', '#0F766E', '#2563EB', '#7D1025']
const EMPTY = { name: '', tagline: '', description: '', icon: 'star', color: '#7D1025', coverImage: '', category: 'General', meetingSchedule: '', durationMins: 60, capacity: 0, leaders: [], isActive: true, featured: false }

const fmtWhen = (d) => new Date(d).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function ClubsModule({ toast }) {
  const [clubs, setClubs] = useState([])
  const [events, setEvents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)        // club being created/edited
  const [detail, setDetail] = useState(null)    // { club, members, upcoming, past }
  const [meeting, setMeeting] = useState(null)  // schedule form for a club
  const [busy, setBusy] = useState(false)
  const [playing, setPlaying] = useState(null)
  const [coverBusy, setCoverBusy] = useState(false)
  const coverRef = useRef(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/clubs', { params: { all: true } }).catch(() => ({ data: { data: { clubs: [] } } })),
      api.get('/clubs/admin/teachers').catch(() => ({ data: { data: { teachers: [] } } })),
      api.get('/clubs/events').catch(() => ({ data: { data: { events: [] } } })),
    ]).then(([c, t, e]) => { setClubs(c.data?.data?.clubs || []); setTeachers(t.data?.data?.teachers || []); setEvents(e.data?.data?.events || []) })
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
      // datetime-local has no time zone: send the instant the person picked
      // (their local time), not a bare string the server would read as UTC.
      const body = { ...meeting, scheduledAt: new Date(meeting.scheduledAt).toISOString() }
      if (meeting._editId) {
        const r = await api.patch(`/clubs/${meeting.clubId}/meetings/${meeting._editId}`, { title: body.title, scheduledAt: body.scheduledAt, durationMins: body.durationMins, kind: body.kind, teacherId: body.teacherId })
        toast?.ok?.(r.data?.message || 'Session updated.')
      } else {
        const r = await api.post(`/clubs/${meeting.clubId}/meetings`, body)
        toast?.ok?.((r.data?.message || 'Session scheduled.') + ' Sessions open in the meeting view and record automatically.')
      }
      setMeeting(null); load(); if (detail) openDetail(detail.club)
    } catch (e) { toast?.error?.(e?.response?.data?.message || (meeting._editId ? 'Could not save the changes.' : 'Could not schedule.')) }
    finally { setBusy(false) }
  }
  // Open the schedule window pre-filled to edit an existing session.
  const editMeeting = (club, m) => {
    const d = new Date(m.scheduledAt), pad = (n) => String(n).padStart(2, '0')
    const _date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, _time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
    setMeeting({ _editId: m._id, _live: m.status === 'live', clubId: club._id, clubName: club.name, title: m.title, _date, _time, scheduledAt: `${_date}T${_time}`,
      durationMins: m.durationMins || club.durationMins || 60, kind: m.kind || 'club', teacherId: m.teacherId ? String(m.teacherId) : '', repeatWeeks: 1 })
  }
  const cancelMeeting = async (m) => {
    if (!window.confirm('Cancel this session?')) return
    try { await api.delete(`/clubs/${detail.club._id}/meetings/${m._id}`); openDetail(detail.club) } catch { toast?.error?.('Could not cancel.') }
  }

  const card = { background: '#fff', border: `1.5px solid ${LINE}`, borderRadius: 14, padding: 18 }
  const input = { width: '100%', padding: '9px 12px', border: `1.5px solid ${LINE}`, borderRadius: 8, fontSize: 13.5, boxSizing: 'border-box' }
  const btn = (primary, color) => ({ padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${primary ? (color || TOKENS.crimson) : LINE}`, background: primary ? (color || TOKENS.crimson) : '#fff', color: primary ? '#fff' : S600 })

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 1180 }}>
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
      ) : (<>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
          {[['Active clubs', clubs.filter(c => c.isActive).length, TOKENS.s900],
            ['Members', clubs.reduce((n, c) => n + (c.memberCount || 0), 0), TOKENS.s900],
            ['Sessions next 7 days', events.filter(e => new Date(e.scheduledAt) < new Date(Date.now() + 7 * 864e5)).length, '#1E3A8A'],
            ['Need a teacher', clubs.filter(c => c.isActive && !c.leaders.length).length, '#B45309']].map(([l, n, col]) => (
            <div key={l} style={{ ...card, padding: '14px 16px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.1em', color: TOKENS.s500, textTransform: 'uppercase' }}>{l}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: col, marginTop: 4 }}>{n}</div>
            </div>
          ))}
        </div>

        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px 6px', fontSize: 17, fontWeight: 800, color: TOKENS.s900 }}>Next 7 days</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, padding: '6px 18px 16px' }}>
            {Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); return new Date(d.getTime() + i * 864e5) }).map((d, i) => {
              const list = events.filter(e => new Date(e.scheduledAt).toDateString() === d.toDateString()).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
              return (
                <div key={i} style={{ background: '#FAF7F2', borderRadius: 10, padding: 8, minHeight: 70 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', color: i === 0 ? TOKENS.crimson : TOKENS.s500, marginBottom: 6 }}>{i === 0 ? 'TODAY' : d.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()} {d.getDate()}</div>
                  {list.length === 0 ? <div style={{ fontSize: 11, color: '#B3A89E' }}>Free</div> : list.map(e => (
                    <div key={e._id} title={'Edit: ' + e.title} onClick={() => { const c = clubs.find(x => String(x._id) === String(e.club?._id)); if (c) editMeeting(c, e) }} style={{ cursor: 'pointer', background: e.club?.color || TOKENS.crimson, color: '#fff', borderRadius: 7, padding: '4px 7px', fontSize: 11, fontWeight: 700, marginBottom: 4, lineHeight: 1.25 }}>
                      {new Date(e.scheduledAt).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })} {e.club?.name}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 760 }}>
            <thead><tr>{['Club', 'Leader', 'Members', 'Next session', ''].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10.5, letterSpacing: '.1em', color: TOKENS.s500, padding: '12px 16px', borderBottom: `1px solid ${LINE}`, textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
            <tbody>
              {clubs.map(c => (
                <tr key={c._id} style={{ borderBottom: `1px solid ${LINE}`, opacity: c.isActive ? 1 : .55 }}>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ width: 64, height: 38, borderRadius: 8, flexShrink: 0, background: c.coverImage ? `url(${c.coverImage}) 70% 50%/cover, ${c.color}` : c.color }} />
                      <div>
                        <div style={{ fontWeight: 800, color: TOKENS.s900 }}>{c.name} {!c.isActive && <span style={{ fontSize: 10, color: '#B91C1C', fontWeight: 800 }}>INACTIVE</span>}</div>
                        <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>{c.category}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px' }}>{c.leaders.length ? c.leaders.map(l => l.name).join(', ') : <button onClick={() => setForm({ ...EMPTY, ...c, leaders: [] })} style={{ background: '#FEF3C7', color: '#92400E', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Assign teacher</button>}</td>
                  <td style={{ padding: '10px 16px' }}>{c.memberCount}</td>
                  <td style={{ padding: '10px 16px', color: c.nextSession ? TOKENS.s900 : TOKENS.s500 }}>{c.nextSession ? fmtWhen(c.nextSession.scheduledAt) : 'None planned'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button style={{ ...btn(true, c.color), padding: '6px 11px' }} onClick={() => setMeeting({ clubId: c._id, clubName: c.name, title: `${c.name} meeting`, scheduledAt: '', _date: '', _time: '', durationMins: c.durationMins || 60, kind: 'club', teacherId: c.leaders[0]?._id || '', repeatWeeks: 1 })}>Schedule</button>
                      <button style={{ ...btn(false), padding: '6px 11px' }} onClick={() => openDetail(c)}>Sessions</button>
                      <button style={{ ...btn(false), padding: '6px 11px' }} onClick={() => setForm({ ...EMPTY, ...c, leaders: c.leaders.map(l => l._id) })}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </>)}

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
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: S600, marginBottom: 6 }}>Cover photo</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 128, height: 72, borderRadius: 10, flexShrink: 0, border: `1.5px solid ${LINE}`, background: form.coverImage ? `url(${form.coverImage}) center/cover no-repeat, linear-gradient(135deg, ${form.color}, #1A1A1A)` : `linear-gradient(135deg, ${form.color}, #1A1A1A)` }} />
                  <input ref={coverRef} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={async e => {
                    const file = e.target.files?.[0]; e.target.value = ''
                    if (!file) return
                    setCoverBusy(true)
                    try {
                      const fd = new FormData(); fd.append('file', file)
                      const r = await api.post('/clubs/upload-cover', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
                      const url = r.data?.data?.url
                      if (url) { setForm(f => ({ ...f, coverImage: url })); toast?.ok?.('Cover uploaded.') }
                    } catch (err) { toast?.error?.(err?.response?.data?.message || 'Could not upload the image.') }
                    finally { setCoverBusy(false) }
                  }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button onClick={() => coverRef.current?.click()} disabled={coverBusy} style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${TOKENS.crimson}`, background: '#fff', color: TOKENS.crimson, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', opacity: coverBusy ? .6 : 1 }}>{coverBusy ? 'Uploading...' : form.coverImage ? 'Replace photo' : 'Upload photo'}</button>
                    {form.coverImage && <button onClick={() => setForm(f => ({ ...f, coverImage: '' }))} style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${LINE}`, background: '#fff', color: S600, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Remove (use colour cover)</button>}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 6 }}>PNG, JPG or WebP, up to 8MB. Landscape around 16:10 looks best on the cards.</div>
              </div>
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
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: 'min(540px, 100%)', padding: 24, maxHeight: '92vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 20, color: TOKENS.s900 }}>{meeting._editId ? 'Edit session' : 'Schedule a session'}</h3>
            {meeting._live && <div style={{ fontSize: 12.5, color: '#92400E', background: '#FEF3C7', borderRadius: 8, padding: '8px 10px', margin: '6px 0 4px' }}>This session is live now: only its title can be changed.</div>}
            <div style={{ fontSize: 12.5, color: S600, marginBottom: 14 }}>{meeting.clubName}. Runs in the live classroom and records automatically.</div>
            <ScheduleFields meeting={meeting} setMeeting={setMeeting} teachers={teachers} input={input} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
              <button style={btn(false)} onClick={() => setMeeting(null)}>Cancel</button>
              <button style={btn(true)} onClick={schedule} disabled={busy}>{busy ? 'Saving...' : meeting._editId ? 'Save changes' : meeting.repeatWeeks > 1 ? `Schedule ${meeting.repeatWeeks} sessions` : 'Schedule'}</button>
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
                <button style={btn(true, detail.club.color)} onClick={() => joinClassroom(m._id)}>{m.status === 'live' ? 'Join' : 'Open'}</button>
                <button style={btn(false)} onClick={() => editMeeting(detail.club, m)}>Edit</button>
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


// Date, quick start times (any hour, Nairobi time), length, weekly repeat,
// kind, host and a live clash check.
const SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']
const slotLabel = (t) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` }
function ScheduleFields({ meeting, setMeeting, teachers, input }) {
  const set = (patch) => setMeeting(m => {
    const n = { ...m, ...patch }
    n.scheduledAt = n._date && n._time ? `${n._date}T${n._time}` : ''
    return n
  })
  const clashes = useClashes(meeting.clubId, meeting)
  const lab = { fontSize: 10.5, fontWeight: 800, letterSpacing: '.1em', color: TOKENS.crimson, margin: '12px 0 6px', textTransform: 'uppercase' }
  const custom = meeting._time && !SLOTS.includes(meeting._time)
  return (
    <div>
      <div style={lab}>Title</div>
      <input style={input} value={meeting.title} onChange={e => setMeeting(m => ({ ...m, title: e.target.value }))} placeholder="Session title" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 10 }}>
        <div><div style={lab}>Date</div><input type="date" style={input} value={meeting._date || ''} onChange={e => set({ _date: e.target.value })} /></div>
        <div><div style={lab}>Length</div>
          <select style={input} value={meeting.durationMins} onChange={e => setMeeting(m => ({ ...m, durationMins: Number(e.target.value) }))}>
            {[...new Set([30, 45, 60, 90, 120, Number(meeting.durationMins) || 60])].sort((a, b) => a - b).map(n => <option key={n} value={n}>{n} minutes</option>)}
          </select></div>
      </div>
      <div style={lab}>Start time (your local time)</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {SLOTS.map(t => (
          <button key={t} type="button" onClick={() => set({ _time: t })} style={{ padding: '7px 11px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            border: `1.5px solid ${meeting._time === t ? '#1E3A8A' : LINE}`, background: meeting._time === t ? '#1E3A8A' : '#fff', color: meeting._time === t ? '#fff' : S600 }}>{slotLabel(t)}</button>
        ))}
        <input type="time" value={meeting._time || ''} onChange={e => set({ _time: e.target.value })} title="Other time" style={{ ...input, width: 120, padding: '6px 9px', borderColor: custom ? '#1E3A8A' : LINE }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: meeting._editId ? '1fr' : '1fr 1fr', gap: 10 }}>
        {meeting._editId ? null : <div><div style={lab}>Repeat</div>
          <select style={input} value={meeting.repeatWeeks || 1} onChange={e => setMeeting(m => ({ ...m, repeatWeeks: Number(e.target.value) }))}>
            {[1, 2, 4, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n === 1 ? 'Just once' : `Every week for ${n} weeks`}</option>)}
          </select></div>}
        <div><div style={lab}>Type</div>
          <select style={input} value={meeting.kind} onChange={e => setMeeting(m => ({ ...m, kind: e.target.value }))}>
            <option value="club">Regular meeting</option><option value="competition">Competition</option><option value="event">Event</option>
          </select></div>
      </div>
      <div style={lab}>Host</div>
      <select style={input} value={meeting.teacherId} onChange={e => setMeeting(m => ({ ...m, teacherId: e.target.value }))}>
        <option value="">First assigned teacher</option>
        {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
      </select>
      <ClashNote clashes={clashes} ready={!!meeting.scheduledAt} />
    </div>
  )
}
