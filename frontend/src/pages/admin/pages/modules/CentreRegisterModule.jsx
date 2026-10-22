/**
 * CentreRegisterModule.jsx — the Dean's register for students who learn
 * at a centre (In-person, and Hybrid on their in-person lessons).
 *
 * Online students are marked by joining the classroom; centre students are
 * marked here. One tap marks the whole day (every in-person lesson that
 * day); a lesson chip marks one lesson. Marks go to the same per-lesson
 * record as the teacher's register (/api/centre-register).
 */
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { DOSSpinner, PSection } from '../shared/ui.jsx'

const nairobiToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' })
const time = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' })
const MODE = { physical: 'In-person', hybrid: 'Hybrid', virtual: 'Online' }

const pill = (on, colour) => ({
  border: `1.5px solid ${on ? colour : TOKENS.line}`, background: on ? colour : '#fff', color: on ? '#fff' : TOKENS.ink,
  borderRadius: 99, padding: '6px 14px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
})

export default function CentreRegisterModule({ toast }) {
  const [date, setDate] = useState(nairobiToday())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [q, setQ] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api.get('/centre-register', { params: { date } })
      .then(r => setData(r.data?.data || null))
      .catch(e => toast?.error?.(e?.response?.data?.message || 'Could not load the register.'))
      .finally(() => setLoading(false))
  }, [date, toast])
  useEffect(() => { load() }, [load])

  const save = async (marks, key) => {
    setBusy(key)
    try {
      await api.post('/centre-register', { date, marks })
      // Update in place, so the list does not jump while marking.
      setData(d => d && {
        ...d,
        students: d.students.map(s => {
          const ms = marks.filter(m => String(m.studentId) === String(s.studentId))
          if (!ms.length) return s
          const lessons = s.lessons.map(l => {
            const m = ms.find(x => !x.liveClassId || String(x.liveClassId) === String(l.liveClassId))
            return m ? { ...l, present: m.present } : l
          })
          const marked = lessons.filter(l => l.present !== null)
          const day = !marked.length ? null : marked.length === lessons.length && marked.every(l => l.present) ? 'present'
            : marked.length === lessons.length && marked.every(l => !l.present) ? 'absent' : 'partial'
          return { ...s, lessons, day }
        }),
      })
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not save.') }
    finally { setBusy('') }
  }

  const students = (data?.students || []).filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()))
  const unmarked = (data?.students || []).filter(s => s.day === null)
  const counts = (data?.students || []).reduce((a, s) => { a[s.day || 'unmarked']++; return a }, { present: 0, absent: 0, partial: 0, unmarked: 0 })

  return (
    <div>
      <PSection tag="Academics" title="Centre" em="Register"
        sub="Students learning at a centre: In-person students, and Hybrid students on their in-person lessons. Online lessons are marked by joining the classroom." />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <input type="date" value={date} max={nairobiToday()} onChange={e => setDate(e.target.value)}
          style={{ border: `1px solid ${TOKENS.line}`, borderRadius: 8, padding: '8px 10px', fontSize: 13.5 }} />
        <button type="button" style={pill(false)} onClick={() => setDate(nairobiToday())}>Today</button>
        <input placeholder="Search a student" value={q} onChange={e => setQ(e.target.value)}
          style={{ border: `1px solid ${TOKENS.line}`, borderRadius: 8, padding: '8px 10px', fontSize: 13.5, flex: '1 1 180px', maxWidth: 260 }} />
        {data?.canMark && unmarked.length > 0 && (
          <button type="button" disabled={!!busy} style={{ ...pill(true, TOKENS.accentEmerald || '#065F46'), marginLeft: 'auto' }}
            onClick={() => save(unmarked.map(s => ({ studentId: s.studentId, present: true })), 'all')}>
            {busy === 'all' ? 'Saving…' : `Mark the other ${unmarked.length} present`}
          </button>
        )}
      </div>

      {data && (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12.5, color: TOKENS.inkMute, marginBottom: 14 }}>
          <span><b style={{ color: '#15803D' }}>{counts.present}</b> present</span>
          <span><b style={{ color: '#B91C1C' }}>{counts.absent}</b> absent</span>
          <span><b style={{ color: '#B45309' }}>{counts.partial}</b> part of the day</span>
          <span><b style={{ color: TOKENS.ink }}>{counts.unmarked}</b> not marked</span>
        </div>
      )}

      {loading ? <DOSSpinner /> : !students.length ? (
        <div style={{ padding: 30, textAlign: 'center', color: TOKENS.inkMute, background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12 }}>
          No in-person lessons on this day.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {students.map(s => (
            <div key={s.studentId} style={{ background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: '12px 14px', display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <div style={{ fontWeight: 800, color: TOKENS.ink }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: TOKENS.inkMute }}>{[s.grade, MODE[s.mode]].filter(Boolean).join(' · ')}{s.onBreak ? ' · on break' : ''}</div>
                </div>
                {data.canMark ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" disabled={!!busy} style={pill(s.day === 'present', '#15803D')}
                      onClick={() => save([{ studentId: s.studentId, present: true }], s.studentId + 'p')}>Present</button>
                    <button type="button" disabled={!!busy} style={pill(s.day === 'absent', '#B91C1C')}
                      onClick={() => save([{ studentId: s.studentId, present: false }], s.studentId + 'a')}>Absent</button>
                  </div>
                ) : <span style={{ fontSize: 12, color: TOKENS.inkMute }}>Opens on the day</span>}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {s.lessons.map(l => {
                  const colour = l.present === true ? '#15803D' : l.present === false ? '#B91C1C' : TOKENS.inkMute
                  return (
                    <button key={l.liveClassId} type="button" disabled={!data.canMark || !!busy}
                      title={(l.present === null ? 'Not marked' : l.present ? 'Present' : 'Absent') + ' — tap to change this lesson only'}
                      onClick={() => save([{ studentId: s.studentId, liveClassId: l.liveClassId, present: l.present !== true }], l.liveClassId + s.studentId)}
                      style={{ border: `1px solid ${colour}`, color: colour, background: '#fff', borderRadius: 8, padding: '4px 9px', fontSize: 11.5, fontWeight: 700, cursor: data.canMark ? 'pointer' : 'default' }}>
                      {time(l.scheduledAt)} {l.subject}{l.teacher ? ' · ' + l.teacher.split(' ')[0] : ''} {l.present === true ? '✓' : l.present === false ? '✗' : ''}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
