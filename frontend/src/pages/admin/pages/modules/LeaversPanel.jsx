import React, { useState, useEffect } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'

/**
 * LeaversPanel — students who graduated or left (GET
 * /api/student-sessions/leavers): the alumni list, the leavers list, and
 * what the leavers have in common (when, why, at which grade).
 * Rendered inside StudentSessionsModule.
 */

const fmtD = d => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '–')
const span = m => (m === null || m === undefined ? '–' : m < 12 ? `${m} mo` : `${Math.floor(m / 12)} yr${m >= 24 ? 's' : ''}${m % 12 ? ' ' + (m % 12) + ' mo' : ''}`)
const csvEsc = v => { const s = v === null || v === undefined ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }

function downloadCsv(name, rows, cols) {
  const text = [cols.map(c => c[0]).join(','), ...rows.map(r => cols.map(c => csvEsc(c[1](r))).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
  a.download = name; a.click(); URL.revokeObjectURL(a.href)
}

const COLS = [
  ['Name', r => r.name], ['Admission no.', r => r.admissionNumber], ['Curriculum', r => r.curriculum],
  ['Final grade', r => r.grade], ['Programme', r => r.programme], ['Learning mode', r => r.mode],
  ['Joined', r => fmtD(r.joined)], ['Exit date', r => fmtD(r.exitDate)], ['Academic year', r => r.academicYear],
  ['Months with us', r => r.months], ['Reason / note', r => r.reason], ['Email', r => r.email], ['Phone', r => r.phone],
  ['Parent', r => r.parentName], ['Parent email', r => r.parentEmail], ['Parent phone', r => r.parentPhone],
]

function Breakdown({ title, items }) {
  if (!items || !items.length) return null
  const max = Math.max(...items.map(i => i.count))
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: TOKENS.s500, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>{title}</div>
      {items.slice(0, 6).map(i => (
        <div key={i.key} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 90px 24px', gap: 8, alignItems: 'center', fontSize: 12, marginBottom: 4 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: TOKENS.s800 }} title={i.key}>{i.key}</span>
          <span style={{ height: 7, borderRadius: 4, background: '#F3ECE2' }}><span style={{ display: 'block', height: 7, borderRadius: 4, width: (i.count / max * 100) + '%', background: TOKENS.crimson }} /></span>
          <b style={{ textAlign: 'right', color: TOKENS.s900 }}>{i.count}</b>
        </div>
      ))}
    </div>
  )
}

export default function LeaversPanel({ refreshKey, reloadOn }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('graduated')
  const [q, setQ] = useState('')
  const [year, setYear] = useState('all')

  useEffect(() => {
    api.get('/student-sessions/leavers')
      .then(r => { setData(r.data?.data || null); setError('') })
      .catch(e => setError(e?.response?.data?.message || 'Could not load leavers.'))
  }, [refreshKey, reloadOn])

  if (error) return <div style={{ fontSize: 12, color: '#B91C1C', marginBottom: 16 }}>{error}</div>
  if (!data) return null
  const s = data.summary
  const rows = data.rows.filter(r => r.kind === tab)
    .filter(r => year === 'all' || String(r.exitYear) === year)
    .filter(r => !q || (r.name + ' ' + r.admissionNumber + ' ' + r.reason).toLowerCase().includes(q.toLowerCase()))
  const tile = (label, val, color, note) => (
    <div style={{ background: '#FBF8F3', borderRadius: 10, padding: '10px 16px', minWidth: 130 }}>
      <div style={{ fontSize: 20, fontWeight: 900, color }}>{val ?? '–'}</div>
      <div style={{ fontSize: 10.5, color: TOKENS.s500, fontWeight: 700 }}>{label}</div>
      {note && <div style={{ fontSize: 10, color: TOKENS.s400 }}>{note}</div>}
    </div>
  )
  const tabBtn = (k, label) => (
    <button type="button" onClick={() => setTab(k)} style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800, cursor: 'pointer',
      border: `1.5px solid ${tab === k ? TOKENS.crimson : TOKENS.line}`, background: tab === k ? TOKENS.crimson : '#fff', color: tab === k ? '#fff' : TOKENS.s700 }}>{label}</button>
  )
  const th = { textAlign: 'left', padding: '6px 8px', background: '#F7F2EA', border: `1px solid ${TOKENS.line}`, whiteSpace: 'nowrap' }
  const td = { padding: '5px 8px', border: `1px solid ${TOKENS.line}`, verticalAlign: 'top' }

  return (
    <div style={{ background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <b style={{ fontSize: 14.5, color: TOKENS.s900 }}>Leavers and alumni</b>
        <span style={{ fontSize: 11.5, color: TOKENS.s500 }}>students who graduated or left: records kept, no lessons or reminders</span>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        {tile('Alumni (graduated)', s.graduated, '#15803D', `${s.graduatedLast365Days} in the last 12 months`)}
        {tile('Left before graduating', s.left, '#B91C1C', `${s.leftLast90Days} in the last 90 days`)}
        {tile('Left within 6 months', s.leftWithin6Months, '#B45309', 'of joining')}
        {tile('Typical time before leaving', span(s.medianMonthsBeforeLeaving), TOKENS.s900, 'median, students who left')}
      </div>

      {s.byYear.length > 0 && (
        <table style={{ borderCollapse: 'collapse', fontSize: 11.5, marginBottom: 14 }}>
          <thead><tr>{['Year', 'Graduated', 'Left'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>{s.byYear.map(y => <tr key={y.year}><td style={td}>{y.year}</td><td style={td}>{y.graduated}</td><td style={td}>{y.left}</td></tr>)}</tbody>
        </table>
      )}

      {s.left > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 16 }}>
          <Breakdown title="Why students left" items={s.leftBy.byReason} />
          <Breakdown title="Grade when they left" items={s.leftBy.byGrade} />
          <Breakdown title="Curriculum" items={s.leftBy.byCurriculum} />
          <Breakdown title="Programme" items={s.leftBy.byProgramme} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
        {tabBtn('graduated', `Alumni (${s.graduated})`)}
        {tabBtn('left', `Left (${s.left})`)}
        <select value={year} onChange={e => setYear(e.target.value)} style={{ padding: '6px 10px', border: `1px solid ${TOKENS.line}`, borderRadius: 8, fontSize: 12 }}>
          <option value="all">All years</option>
          {s.byYear.map(y => <option key={y.year} value={String(y.year)}>{y.year}</option>)}
        </select>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, admission no. or reason"
          style={{ padding: '6px 10px', border: `1px solid ${TOKENS.line}`, borderRadius: 8, fontSize: 12, flex: '1 1 180px', maxWidth: 280 }} />
        <button type="button" disabled={!rows.length} onClick={() => downloadCsv(tab === 'graduated' ? 'smartious-alumni.csv' : 'smartious-leavers.csv', rows, COLS)}
          style={{ marginLeft: 'auto', padding: '7px 14px', borderRadius: 8, border: 'none', background: TOKENS.crimson, color: '#fff', fontSize: 11.5, fontWeight: 800, cursor: rows.length ? 'pointer' : 'default', opacity: rows.length ? 1 : 0.5 }}>
          Download {tab === 'graduated' ? 'alumni list' : 'leavers list'} (CSV)
        </button>
      </div>

      {!rows.length ? (
        <div style={{ fontSize: 12, color: TOKENS.s500 }}>{tab === 'graduated' ? 'No alumni yet. Students appear here once marked graduated.' : 'No students have left.'}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
            <thead><tr>{['Name', 'Final grade', 'Curriculum', 'Joined', tab === 'graduated' ? 'Graduated' : 'Left', 'With us', tab === 'graduated' ? 'Note' : 'Reason', 'Contact'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>{rows.map(r => (
              <tr key={r.studentId}>
                <td style={td}><b>{r.name}</b>{r.admissionNumber && <div style={{ color: TOKENS.s400 }}>{r.admissionNumber}</div>}</td>
                <td style={td}>{r.grade || '–'}</td>
                <td style={td}>{r.curriculum || '–'}</td>
                <td style={td}>{fmtD(r.joined)}</td>
                <td style={td}>{fmtD(r.exitDate)}</td>
                <td style={td}>{span(r.months)}</td>
                <td style={td}>{r.reason || '–'}</td>
                <td style={td}>{[r.email, r.parentEmail && r.parentEmail !== r.email ? 'Parent: ' + r.parentEmail : ''].filter(Boolean).map(x => <div key={x}>{x}</div>)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
