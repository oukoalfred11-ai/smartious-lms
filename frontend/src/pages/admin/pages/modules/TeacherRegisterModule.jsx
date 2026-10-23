/**
 * TeacherRegisterModule.jsx — the Dean marks teachers' attendance, one day
 * at a time (/api/staff-attendance). Replaces the old self check-in.
 *
 * Each teacher shows that day's lessons (and whether they ran) and any
 * approved leave, with a suggested mark the Dean can accept in one tap.
 * The Summary view gives each teacher's record over a range.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { DOSSpinner, PSection } from '../shared/ui.jsx'
import { ClickStat, useStatReport } from '../shared/StatReport.jsx'

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' })
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' })
const time = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' })
const longDay = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export const MARKS = {
  present:  { label: 'Present',  bg: '#D1FAE5', fg: '#065F46' },
  late:     { label: 'Late',     bg: '#FEF3C7', fg: '#92400E' },
  half_day: { label: 'Half day', bg: '#E0F2FE', fg: '#075985' },
  absent:   { label: 'Absent',   bg: '#FEE2E2', fg: '#991B1B' },
  leave:    { label: 'On leave', bg: '#EDE9FE', fg: '#5B21B6' },
  off:      { label: 'Day off',  bg: '#F3F4F6', fg: '#4B5563' },
}
const OUTCOME = { taught: 'taught', student_absent: 'student absent', not_held: 'not held', ended: 'ended', scheduled: 'not closed', live: 'live' }
const box = { background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12 }
const inp = { border: `1px solid ${TOKENS.line}`, borderRadius: 8, padding: '7px 9px', fontSize: 13, fontFamily: 'inherit', background: '#fff' }
const btn = (primary) => ({ border: primary ? 'none' : `1px solid ${TOKENS.line}`, background: primary ? TOKENS.crimson : '#fff', color: primary ? '#fff' : TOKENS.s900, borderRadius: 8, padding: '8px 14px', fontWeight: 800, fontSize: 13, cursor: 'pointer' })

export default function TeacherRegisterModule({ toast }) {
  const [view, setView] = useState('day')
  return (
    <div>
      <PSection tag="Dean of Studies" title="Teachers'" em="Register"
        sub="Mark each teacher present, late, half day, absent, on leave or off. Each teacher's lessons for the day and approved leave are shown to help you." />
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[['day', 'Mark a day'], ['summary', 'Summary']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setView(k)} style={{ ...btn(view === k), padding: '6px 14px', fontSize: 12.5 }}>{l}</button>
        ))}
      </div>
      {view === 'day' ? <DayRegister toast={toast} /> : <Summary toast={toast} />}
    </div>
  )
}

function DayRegister({ toast }) {
  const [day, setDay] = useState(today())
  const [data, setData] = useState(null)
  const [edits, setEdits] = useState({})   // staffId -> { status, note }
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setData(null); setEdits({})
    api.get('/staff-attendance', { params: { day } })
      .then(r => setData(r.data?.data || null))
      .catch(e => { toast?.error?.(e?.response?.data?.message || 'Could not load the register.'); setData(false) })
  }, [day, toast])
  useEffect(() => { load() }, [load])

  const cur = (r) => edits[r.staffId] || { status: r.status, note: r.note }
  const set = (r, patch) => setEdits(p => ({ ...p, [r.staffId]: { ...cur(r), ...patch } }))
  const dirty = Object.keys(edits).length
  const unmarked = useMemo(() => (data?.rows || []).filter(r => !cur(r).status), [data, edits]) // eslint-disable-line react-hooks/exhaustive-deps

  const acceptSuggestions = () => {
    const next = { ...edits }
    unmarked.forEach(r => { if (r.suggested) next[r.staffId] = { status: r.suggested, note: cur(r).note || '' } })
    setEdits(next)
  }
  const save = async () => {
    setSaving(true)
    try {
      const marks = Object.entries(edits).map(([staffId, v]) => ({ staffId, status: v.status || null, note: v.note || '' }))
      const r = await api.post('/staff-attendance', { day, marks })
      toast?.ok?.(r.data?.message || 'Saved.'); load()
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not save.') }
    finally { setSaving(false) }
  }

  const future = day > today()
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ ...box, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setDay(d => new Date(new Date(d + 'T12:00:00Z').getTime() - 864e5).toISOString().slice(0, 10))} style={btn(false)} aria-label="Previous day">‹</button>
        <input type="date" value={day} max={today()} onChange={e => e.target.value && setDay(e.target.value)} style={inp} />
        <button type="button" disabled={day >= today()} onClick={() => setDay(d => new Date(new Date(d + 'T12:00:00Z').getTime() + 864e5).toISOString().slice(0, 10))} style={btn(false)} aria-label="Next day">›</button>
        <b style={{ fontSize: 14, color: TOKENS.s900 }}>{longDay(day)}</b>
        <span style={{ flex: 1 }} />
        {data && <span style={{ fontSize: 12.5, color: TOKENS.s500 }}>{data.summary.marked} of {data.summary.teachers} marked</span>}
        {!!unmarked.some(r => r.suggested) && <button type="button" onClick={acceptSuggestions} style={btn(false)}>Use suggestions for unmarked</button>}
        <button type="button" onClick={save} disabled={!dirty || saving || future} style={{ ...btn(true), opacity: !dirty || future ? 0.5 : 1 }}>{saving ? 'Saving…' : `Save register${dirty ? ` (${dirty})` : ''}`}</button>
      </div>

      {data === null ? <div style={{ ...box, padding: 20 }}><DOSSpinner /></div> : !data ? null : (
        <div style={{ ...box, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 760 }}>
            <thead><tr>{['Teacher', 'Lessons that day', 'Mark', 'Note'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, color: TOKENS.s500, textTransform: 'uppercase', letterSpacing: '.06em', background: '#FBF8F2' }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {data.rows.map(r => {
                const c = cur(r), changed = !!edits[r.staffId]
                return (
                  <tr key={r.staffId} style={{ borderTop: `1px solid ${TOKENS.line}`, background: changed ? '#FFFBEB' : undefined, verticalAlign: 'top' }}>
                    <td style={{ padding: '9px 10px', minWidth: 170 }}>
                      <div style={{ fontWeight: 700, color: TOKENS.s900 }}>{r.name}</div>
                      {r.onLeave && <div style={{ fontSize: 11.5, color: '#5B21B6', fontWeight: 700 }}>Approved leave: {r.onLeave}</div>}
                      {r.markedBy && !changed && <div style={{ fontSize: 11, color: TOKENS.s400 }}>marked by {r.markedBy}</div>}
                    </td>
                    <td style={{ padding: '9px 10px', fontSize: 12, color: TOKENS.s600, minWidth: 190 }}>
                      {r.lessons.length ? r.lessons.map((l, i) => (
                        <div key={i}>{time(l.time)} {l.subject} <span style={{ color: l.outcome === 'not_held' ? '#B91C1C' : l.outcome === 'taught' ? '#15803D' : TOKENS.s400 }}>· {OUTCOME[l.outcome] || l.outcome}</span></div>
                      )) : <span style={{ color: TOKENS.s400 }}>No lessons</span>}
                    </td>
                    <td style={{ padding: '7px 10px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {Object.entries(MARKS).map(([k, m]) => {
                          const on = c.status === k
                          return (
                            <button key={k} type="button" disabled={future} onClick={() => set(r, { status: on ? null : k })}
                              title={r.suggested === k && !c.status ? 'Suggested' : undefined}
                              style={{ border: `1.5px solid ${on ? m.fg : r.suggested === k && !c.status ? m.fg + '66' : TOKENS.line}`, background: on ? m.bg : '#fff', color: on ? m.fg : TOKENS.s600,
                                borderRadius: 99, padding: '4px 10px', fontSize: 11.5, fontWeight: on ? 800 : 600, cursor: 'pointer', borderStyle: r.suggested === k && !c.status ? 'dashed' : 'solid' }}>
                              {m.label}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                    <td style={{ padding: '7px 10px', minWidth: 160 }}>
                      <input value={c.note || ''} onChange={e => set(r, { note: e.target.value })} maxLength={300} placeholder={c.status === 'late' ? 'e.g. arrived 9:20' : c.status === 'absent' ? 'Reason' : ''} style={{ ...inp, width: '100%', boxSizing: 'border-box' }} />
                    </td>
                  </tr>
                )
              })}
              {!data.rows.length && <tr><td colSpan={4} style={{ padding: 16, color: TOKENS.s500 }}>No active teachers.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ margin: 0, fontSize: 12, color: TOKENS.s500 }}>Dashed outline = suggested from the day (approved leave, no lessons, or lessons that ran). Nothing is saved until you press Save register.</p>
    </div>
  )
}

function Summary({ toast }) {
  const [from, setFrom] = useState(daysAgo(30))
  const [to, setTo] = useState(today())
  const [data, setData] = useState(null)
  const report = useStatReport(toast)
  useEffect(() => {
    setData(null)
    api.get('/staff-attendance/summary', { params: { from, to } })
      .then(r => setData(r.data?.data || null))
      .catch(e => { toast?.error?.(e?.response?.data?.message || 'Could not load the summary.'); setData(false) })
  }, [from, to, toast])

  const rows = data?.rows || []
  const tot = rows.reduce((t, r) => { Object.keys(MARKS).forEach(k => { t[k] = (t[k] || 0) + r[k] }); return t }, {})
  // A report from the rows already loaded: everyone, or the teachers with a given mark.
  const open = (k) => report.open({ load: async () => ({
    title: k ? `Teachers ${MARKS[k].label.toLowerCase()}` : "Teachers' attendance", window: { from, to },
    value: k ? tot[k] || 0 : rows.length,
    summary: Object.entries(MARKS).map(([m, v]) => [v.label, tot[m] || 0]),
    method: data?.method || '',
    columns: k
      ? [{ key: 'name', label: 'Teacher' }, { key: 'day', label: 'Day', type: 'date' }, { key: 'note', label: 'Note' }]
      : [{ key: 'name', label: 'Teacher' }, ...Object.entries(MARKS).map(([m, v]) => ({ key: m, label: v.label, type: 'num' })), { key: 'marked', label: 'Days marked', type: 'num' }, { key: 'rate', label: 'Rate', type: 'pct' }],
    rows: k ? rows.flatMap(r => r.days.filter(d => d.status === k).map(d => ({ name: r.name, day: d.day + 'T12:00:00Z', note: d.note }))) : rows,
  }) })

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {report.modal}
      <div style={{ ...box, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inp} />
        <span style={{ fontSize: 12, color: TOKENS.s400 }}>to</span>
        <input type="date" value={to} max={today()} onChange={e => setTo(e.target.value)} style={inp} />
        <span style={{ flex: 1 }} />
        <button type="button" onClick={() => open(null)} style={btn(true)} disabled={!data}>Full report</button>
      </div>
      {data === null ? <div style={{ ...box, padding: 20 }}><DOSSpinner /></div> : !data ? null : <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
          {Object.entries(MARKS).map(([k, m]) => (
            <ClickStat key={k} onOpen={() => open(k)}>
              <div style={{ ...box, padding: '12px 14px 20px', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: m.fg }}>{tot[k] || 0}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.s500, textTransform: 'uppercase', letterSpacing: '.05em' }}>{m.label} days</div>
              </div>
            </ClickStat>
          ))}
        </div>
        <div style={{ ...box, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
            <thead><tr>{['Teacher', ...Object.values(MARKS).map(m => m.label), 'Rate'].map(h => (
              <th key={h} style={{ textAlign: h === 'Teacher' ? 'left' : 'right', padding: '8px 10px', fontSize: 11, color: TOKENS.s500, textTransform: 'uppercase', background: '#FBF8F2' }}>{h}</th>
            ))}</tr></thead>
            <tbody>{rows.map(r => (
              <tr key={r.staffId} style={{ borderTop: `1px solid ${TOKENS.line}` }}>
                <td style={{ padding: '8px 10px', fontWeight: 700 }}>{r.name}</td>
                {Object.keys(MARKS).map(k => <td key={k} style={{ padding: '8px 10px', textAlign: 'right', color: r[k] ? MARKS[k].fg : TOKENS.s400, fontWeight: r[k] ? 700 : 400 }}>{r[k]}</td>)}
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: r.rate == null ? TOKENS.s400 : r.rate >= 90 ? '#065F46' : r.rate >= 75 ? '#92400E' : '#991B1B' }}>{r.rate == null ? '—' : r.rate + '%'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: TOKENS.s500 }}>{data.method}</p>
      </>}
    </div>
  )
}
