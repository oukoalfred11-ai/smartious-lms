import React, { useState, useEffect } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from './tokens.js'

/**
 * charts.jsx — the house chart kit. Pure SVG, no dependencies, so every
 * module can afford a trend line. TrendLine and Bars render series;
 * AnalyticsStrip is the drop-in pattern: fetches snapshot history for a
 * scope and shows charts + CSV download + print, so analytics lives in
 * every module rather than one Reports page.
 */

export function TrendLine({ data, color = TOKENS.crimson, suffix = '%', height = 72, label }) {
  const pts = (data || []).filter(d => d.value !== null && d.value !== undefined)
  if (pts.length < 2) return <div style={{ fontSize: 11.5, color: TOKENS.s400, padding: '18px 0' }}>Not enough history yet - the nightly snapshot builds this trend.</div>
  const w = 560, h = height, pad = 6
  const vals = pts.map(p => p.value)
  const min = Math.min(...vals), max = Math.max(...vals)
  const span = (max - min) || 1
  const x = (i) => pad + (i / (pts.length - 1)) * (w - pad * 2)
  const y = (v) => h - pad - ((v - min) / span) * (h - pad * 2)
  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ' ' + y(p.value).toFixed(1)).join(' ')
  const last = pts[pts.length - 1], first = pts[0]
  const up = last.value >= first.value
  return (
    <div>
      {label && <div style={{ fontSize: 11, fontWeight: 800, color: TOKENS.s500, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>{label}</div>}
      <svg viewBox={'0 0 ' + w + ' ' + h} style={{ width: '100%', height }} preserveAspectRatio="none">
        <path d={path + ' L' + x(pts.length - 1) + ' ' + (h - pad) + ' L' + x(0) + ' ' + (h - pad) + ' Z'} fill={color} opacity="0.08" />
        <path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx={x(pts.length - 1)} cy={y(last.value)} r="3.4" fill={color} />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: TOKENS.s400 }}>
        <span>{first.day?.slice(5)}</span>
        <b style={{ color: up ? '#15803D' : '#B91C1C', fontSize: 12 }}>{last.value}{suffix}</b>
        <span>{last.day?.slice(5)}</span>
      </div>
    </div>
  )
}

export function Bars({ data, color = TOKENS.gold, height = 72, label }) {
  const pts = data || []
  if (!pts.length) return null
  const w = 560, h = height, pad = 4
  const max = Math.max(...pts.map(p => p.value || 0), 1)
  const bw = (w - pad * 2) / pts.length
  return (
    <div>
      {label && <div style={{ fontSize: 11, fontWeight: 800, color: TOKENS.s500, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>{label}</div>}
      <svg viewBox={'0 0 ' + w + ' ' + h} style={{ width: '100%', height }} preserveAspectRatio="none">
        {pts.map((p, i) => {
          const bh = ((p.value || 0) / max) * (h - pad * 2)
          return <rect key={i} x={pad + i * bw + 0.5} y={h - pad - bh} width={Math.max(bw - 1.5, 1)} height={bh} fill={color} rx="1.5" opacity={p.value ? 0.9 : 0.25} />
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: TOKENS.s400 }}>
        <span>{pts[0]?.day?.slice(5)}</span>
        <b style={{ color: TOKENS.s800, fontSize: 12 }}>{pts.reduce((t, p) => t + (p.value || 0), 0)} total</b>
        <span>{pts[pts.length - 1]?.day?.slice(5)}</span>
      </div>
    </div>
  )
}

const toCSV = (rows) => {
  if (!rows.length) return ''
  const heads = Object.keys(rows[0])
  const esc = (x) => { const t = x === null || x === undefined ? '' : String(x); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t }
  return [heads.join(','), ...rows.map(r => heads.map(k => esc(r[k])).join(','))].join('\n')
}

export function AnalyticsStrip({ scope = 'school', days = 30, title = 'Last 30 days', show = ['attendance', 'exams', 'sessions'] }) {
  const [snap, setSnap] = useState(null)
  useEffect(() => {
    api.get('/snapshots', { params: { scope, days } })
      .then(r => setSnap(r.data?.data || null)).catch(() => setSnap(null))
  }, [scope, days])
  if (!snap) return null
  const rows = snap.rows || []
  const attendance = rows.map(r => ({ day: r.day, value: r.scheduled ? Math.round((r.attended / r.scheduled) * 1000) / 10 : null }))
  const exams = rows.map(r => ({ day: r.day, value: r.examAvg }))
  const sessions = rows.map(r => ({ day: r.day, value: r.sessionsHeld }))
  const qb = rows.map(r => ({ day: r.day, value: r.qbAdded }))
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8' }))
    a.download = scope.replace(':', '-') + '-trend.csv'; a.click(); URL.revokeObjectURL(a.href)
  }
  const printStrip = () => {
    const s = snap.summary || {}
    const w = window.open('', '_blank'); if (!w) return
    w.document.write(`<html><head><title>Smartious trend report</title><style>body{font-family:Georgia,serif;margin:36px}h1{color:#7D1025;font-size:20px}table{border-collapse:collapse;font-size:11.5px;width:100%}th,td{border:1px solid #ddd;padding:5px 8px;text-align:left}th{background:#F7F2EA}</style></head><body>
      <h1>Smartious trend report: ${scope}</h1>
      <p style="color:#666;font-size:12px">${title} \u00b7 generated ${new Date().toDateString()} \u00b7 Attendance ${s.attendancePct ?? '\u2013'}% (${s.attended}/${s.scheduled}) \u00b7 Exam avg ${s.examAvg ?? '\u2013'}% (${s.examN}) \u00b7 Lessons ${s.sessionsHeld}</p>
      <table><thead><tr>${Object.keys(rows[0] || { day: 1 }).map(h => '<th>' + h + '</th>').join('')}</tr></thead>
      <tbody>${rows.map(r => '<tr>' + Object.values(r).map(v => '<td>' + (v ?? '\u2013') + '</td>').join('') + '</tr>').join('')}</tbody></table>
      <script>window.onload = () => window.print()</` + `script></body></html>`)
    w.document.close()
  }
  return (
    <div style={{ background: '#fff', border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <b style={{ fontSize: 13.5, color: TOKENS.s900 }}>{title}</b>
        <span style={{ flex: 1 }} />
        <button onClick={download} style={{ padding: '4px 11px', borderRadius: 8, border: `1.5px solid ${TOKENS.line}`, background: '#fff', color: TOKENS.s600, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>CSV</button>
        <button onClick={printStrip} style={{ padding: '4px 11px', borderRadius: 8, border: 'none', background: TOKENS.crimson, color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Print</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {show.includes('attendance') && <TrendLine data={attendance} label="Attendance" />}
        {show.includes('exams') && <TrendLine data={exams} label="Exam average" color="#B45309" />}
        {show.includes('sessions') && <Bars data={sessions} label="Lessons held / day" />}
        {show.includes('qb') && <Bars data={qb} label="Questions added / day" color="#15803D" />}
      </div>
    </div>
  )
}
