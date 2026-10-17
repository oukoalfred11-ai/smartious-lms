/**
 * SchoolCalendar.jsx — the school calendar and leave cover.
 *
 *  <SchoolCalendarManager />  staff: holidays and breaks (no lessons are
 *                             created on these days).
 *  <LessonsNeedingCover />    staff: lessons of teachers on leave with no
 *                             replacement - assign a cover teacher.
 *  <UpcomingClosures />       families: "No lessons: Mid-term break …".
 */
import { useCallback, useEffect, useState } from 'react'
import { api } from '../../context/ctx.jsx'

const C = { crimson: '#7D1025', line: '#E5DFD3', ink: '#1F2937', mut: '#6B7280', bg: '#FBF8F3', green: '#15803D', amber: '#B45309', red: '#B91C1C' }
const field = { border: `1px solid ${C.line}`, borderRadius: 8, padding: '7px 9px', fontSize: 13, fontFamily: 'inherit' }
const btn = (primary) => ({ border: primary ? 'none' : `1px solid ${C.line}`, background: primary ? C.crimson : '#fff', color: primary ? '#fff' : C.ink, borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' })
const fmtDay = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const range = (c) => (c.start === c.end ? fmtDay(c.start) : `${fmtDay(c.start)} – ${fmtDay(c.end)}`)
const KINDS = [['holiday', 'Public holiday'], ['half_term', 'Mid-term break'], ['term_break', 'End-of-term holiday'], ['other', 'Other closure']]

function useClosures() {
  const [list, setList] = useState(null)
  const load = useCallback(() => {
    api.get('/school-calendar').then(r => setList(r.data?.data?.closures || [])).catch(() => setList([]))
  }, [])
  useEffect(() => { load() }, [load])
  return [list, load]
}

export function SchoolCalendarManager({ toast }) {
  const [list, load] = useClosures()
  const [f, setF] = useState({ name: '', start: '', end: '', kind: 'holiday' })
  const [busy, setBusy] = useState(false)
  const add = async () => {
    setBusy(true)
    try {
      const r = await api.post('/school-calendar', { ...f, end: f.end || f.start })
      toast?.ok?.(r.data?.message || 'Added.')
      setF({ name: '', start: '', end: '', kind: 'holiday' }); load()
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not add it.') }
    finally { setBusy(false) }
  }
  const remove = async (c) => {
    if (!window.confirm(`Remove "${c.name}"? Lessons on those days will be created again.`)) return
    try { await api.delete('/school-calendar/' + c._id); toast?.ok?.('Removed.'); load() }
    catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not remove it.') }
  }
  return (
    <section style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 12, padding: '14px 16px', margin: '10px 0' }}>
      <h3 style={{ margin: 0, fontSize: 16, color: C.ink }}>School calendar — holidays and breaks</h3>
      <p style={{ fontSize: 12, color: C.mut, margin: '4px 0 10px' }}>No timetabled lessons are created on these days, and untouched lessons already created are removed. Teachers can still book extra lessons.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={{ fontSize: 12, color: C.mut, display: 'grid', gap: 3 }}>Name<input style={field} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="e.g. Mid-term break" /></label>
        <label style={{ fontSize: 12, color: C.mut, display: 'grid', gap: 3 }}>Type<select style={field} value={f.kind} onChange={e => setF({ ...f, kind: e.target.value })}>{KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label style={{ fontSize: 12, color: C.mut, display: 'grid', gap: 3 }}>First day<input type="date" style={field} value={f.start} onChange={e => setF({ ...f, start: e.target.value })} /></label>
        <label style={{ fontSize: 12, color: C.mut, display: 'grid', gap: 3 }}>Last day<input type="date" style={field} value={f.end} min={f.start} onChange={e => setF({ ...f, end: e.target.value })} /></label>
        <button type="button" style={btn(true)} disabled={busy || !f.name.trim() || !f.start} onClick={add}>{busy ? 'Adding…' : 'Add'}</button>
      </div>
      {list && list.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
          {list.map(c => (
            <li key={c._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, borderTop: `1px solid ${C.line}`, padding: '8px 0', fontSize: 13.5, color: C.ink, flexWrap: 'wrap' }}>
              <span><b>{c.name}</b> · {range(c)} <span style={{ color: C.mut }}>({(KINDS.find(k => k[0] === c.kind) || KINDS[3])[1]})</span></span>
              <button type="button" style={{ ...btn(false), padding: '3px 10px', fontSize: 12, color: C.red }} onClick={() => remove(c)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      {list && !list.length && <p style={{ fontSize: 13, color: C.mut, margin: '10px 0 0' }}>No holidays or breaks entered yet.</p>}
    </section>
  )
}

export function LessonsNeedingCover({ toast }) {
  const [list, setList] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [pick, setPick] = useState({})
  const load = useCallback(() => {
    api.get('/liveclasses/staff/needs-cover').then(r => setList(r.data?.data?.classes || [])).catch(() => setList([]))
    api.get('/timetable/overview').then(r => setTeachers(r.data?.data?.teachers || [])).catch(() => {})
  }, [])
  useEffect(() => { load() }, [load])
  if (!list || !list.length) return null
  const assign = async (c) => {
    try { await api.post(`/liveclasses/${c._id}/cover`, { teacherId: pick[c._id] }); toast?.ok?.('Cover teacher assigned.'); load() }
    catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not assign cover.') }
  }
  return (
    <section style={{ background: '#fff', border: '1px solid #FCA5A5', borderRadius: 12, padding: '14px 16px', margin: '10px 0' }}>
      <h3 style={{ margin: 0, fontSize: 16, color: C.ink }}>Lessons needing cover <span style={{ marginLeft: 6, background: '#FEE2E2', color: C.red, borderRadius: 99, padding: '2px 9px', fontSize: 12 }}>{list.length}</span></h3>
      <p style={{ fontSize: 12, color: C.mut, margin: '4px 0 6px' }}>The teacher is on approved leave with no replacement. Assign a cover teacher, or let the teacher close the lesson as not held afterwards.</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {list.map(c => (
          <li key={c._id} style={{ borderTop: `1px solid ${C.line}`, padding: '8px 0', display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13.5, color: C.ink }}>
              <b>{c.subject || c.title}</b> · {new Date(c.scheduledAt).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              <span style={{ color: C.mut }}> · {c.teacherId ? `${c.teacherId.firstName} ${c.teacherId.lastName}` : ''} · {(c.assignedStudents || []).map(s => s.firstName).join(', ')}</span>
            </span>
            <span style={{ display: 'flex', gap: 6 }}>
              <select style={field} value={pick[c._id] || ''} onChange={e => setPick(p => ({ ...p, [c._id]: e.target.value }))}>
                <option value="">Cover teacher…</option>
                {teachers.filter(t => !c.teacherId || String(t._id) !== String(c.teacherId._id)).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
              <button type="button" style={btn(true)} disabled={!pick[c._id]} onClick={() => assign(c)}>Assign</button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Upcoming holidays for students and parents (next 60 days). */
export function UpcomingClosures() {
  const [list] = useClosures()
  if (!list) return null
  const today = new Date().toISOString().slice(0, 10)
  const soon = new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10)
  const upcoming = list.filter(c => c.end >= today && c.start <= soon)
  if (!upcoming.length) return null
  return (
    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '10px 14px', margin: '0 0 14px', fontSize: 13, color: '#1E3A8A' }}>
      <b>No lessons:</b> {upcoming.map(c => `${c.name} (${range(c)})`).join(' · ')}
    </div>
  )
}
