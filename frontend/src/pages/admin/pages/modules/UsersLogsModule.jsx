/**
 * UsersLogsModule.jsx — presence, login history and behaviour
 * analysis. Who is online right now, when the school is alive, who
 * has gone quiet, and which sign ins are failing.
 */
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { PSection } from '../shared/ui.jsx'

const GOLD = '#C9973A', CRIM = '#7D1025', INK = '#231715', MUT = '#8A8378', LINE = '#E5DFD3'
const GREEN = '#15803D'

const rel = (d) => {
  if (!d) return 'never'
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
}
const fmtDT = (d) => d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

const STATUS = {
  online: { label: 'Online', color: GREEN, bg: '#EDF7EF' },
  today: { label: 'Today', color: '#B07A18', bg: '#FBF4E4' },
  week: { label: 'This week', color: MUT, bg: '#F2EFE9' },
  dormant: { label: 'Dormant', color: '#B91C1C', bg: '#FBEAEA' },
}

export default function UsersLogsModule({ toast }) {
  const [data, setData] = useState(null)
  const [q, setQ] = useState('')
  const [roleF, setRoleF] = useState('all')

  const load = useCallback(() => {
    api.get('/user-logs/overview')
      .then(r => setData(r.data?.data || null))
      .catch(e => toast?.error?.(e?.response?.data?.message || 'Could not load user logs.'))
  }, [toast])
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t) }, [load])

  const dlCSV = () => {
    const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
    const cols = ['Name', 'Role', 'Email', 'Status', 'Last login', 'Last active', 'Logins 7d']
    const csv = [cols.map(esc).join(',')].concat(rows.map(r =>
      [r.name, r.role, r.email, r.status, r.lastLogin ? new Date(r.lastLogin).toISOString() : '', r.lastActive ? new Date(r.lastActive).toISOString() : '', r.logins7d].map(esc).join(',')
    )).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `user-logs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(a.href)
  }

  if (!data) return <div style={{ padding: 30, color: MUT, fontSize: 13 }}>Loading user logs...</div>

  const roles = [...new Set(data.rows.map(r => r.role))].sort()
  const rows = data.rows.filter(r =>
    (roleF === 'all' || r.role === roleF) &&
    (!q.trim() || (r.name + ' ' + r.email + ' ' + r.role).toLowerCase().includes(q.toLowerCase()))
  )
  const maxH = Math.max(...data.hourly, 1)

  const card = { background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: 16 }
  const kpi = (label, value, color) => (
    <div style={{ ...card, minWidth: 130 }}>
      <div style={{ fontSize: 24, fontWeight: 900, color: color || INK }}>{value}</div>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', color: MUT, textTransform: 'uppercase' }}>{label}</div>
    </div>
  )

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <PSection tag="Administration" title="Users" em="Logs"
        sub="Presence, login history and behaviour. Online means activity within the last five minutes; the view refreshes itself every minute." />

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {kpi('Online now', data.kpis.onlineNow, GREEN)}
        {kpi('Active today', data.kpis.activeToday, GOLD)}
        {kpi('Logins, 7 days', data.kpis.logins7d, INK)}
        {kpi('Failed attempts, 7 days', data.kpis.failed7d, data.kpis.failed7d > 0 ? '#B91C1C' : INK)}
        {kpi('Dormant 14d+', data.dormantCount, data.dormantCount > 0 ? '#B45309' : INK)}
      </div>

      {/* Online now */}
      {data.onlineNow.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: '.1em', color: GREEN, textTransform: 'uppercase', marginBottom: 8 }}>
            Online now ({data.onlineNow.length}) {Object.entries(data.byRoleOnline).map(([r, n]) => ` \u00b7 ${n} ${r}`).join('')}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {data.onlineNow.map(u => (
              <span key={u._id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: INK, background: '#EDF7EF', border: '1px solid #BFE3C6', borderRadius: 999, padding: '5px 12px' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN }} />
                {u.name} <span style={{ color: MUT, fontWeight: 600 }}>{u.role}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 1fr)', gap: 16, alignItems: 'start' }}>
        {/* LEFT: all users */}
        <div style={card}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
            <b style={{ fontSize: 13.5, color: INK }}>All users ({rows.length})</b>
            <span style={{ flex: 1 }} />
            <select value={roleF} onChange={e => setRoleF(e.target.value)} style={{ padding: '6px 9px', border: `1.5px solid ${LINE}`, borderRadius: 8, fontSize: 11.5 }}>
              <option value="all">All roles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, role..."
              style={{ padding: '6px 10px', border: `1.5px solid ${LINE}`, borderRadius: 8, fontSize: 11.5, width: 190 }} />
            <button onClick={dlCSV} style={{ padding: '6px 13px', borderRadius: 8, border: `1.5px solid ${CRIM}`, background: '#fff', color: CRIM, fontSize: 10.5, fontWeight: 800, cursor: 'pointer' }}>CSV</button>
          </div>
          <div style={{ maxHeight: 460, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr>{['User', 'Role', 'Status', 'Last active', 'Last login', '7d'].map(h =>
                <th key={h} style={{ position: 'sticky', top: 0, textAlign: 'left', padding: '6px 8px', background: '#F7F2EA', fontSize: 10.5, color: CRIM }}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map(r => {
                  const st = STATUS[r.status]
                  return (
                    <tr key={r._id} style={{ borderTop: `1px solid ${LINE}` }}>
                      <td style={{ padding: '6px 8px', fontWeight: 700, color: INK }}>{r.name}<div style={{ fontSize: 10, color: MUT, fontWeight: 500 }}>{r.email}</div></td>
                      <td style={{ padding: '6px 8px', color: MUT }}>{r.role}</td>
                      <td style={{ padding: '6px 8px' }}><span style={{ fontSize: 10, fontWeight: 800, color: st.color, background: st.bg, borderRadius: 999, padding: '3px 10px' }}>{st.label}</span></td>
                      <td style={{ padding: '6px 8px' }}>{rel(r.lastActive)}</td>
                      <td style={{ padding: '6px 8px' }}>{fmtDT(r.lastLogin)}</td>
                      <td style={{ padding: '6px 8px', fontWeight: 800, color: r.logins7d ? INK : MUT }}>{r.logins7d}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: rhythm + feeds */}
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={card}>
            <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: '.1em', color: GOLD, textTransform: 'uppercase', marginBottom: 8 }}>When the school is alive</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 70 }}>
              {data.hourly.map((v, h) => (
                <div key={h} title={`${h}:00 \u00b7 ${v} login(s)`} style={{ flex: 1, height: Math.max(3, v / maxH * 66), background: v ? GOLD : '#F1EAD9', borderRadius: 3 }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: MUT, marginTop: 3 }}>
              <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
            </div>
            <div style={{ fontSize: 10, color: MUT, marginTop: 4 }}>Successful logins per hour, last 7 days, EAT</div>
          </div>

          <div style={card}>
            <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: '.1em', color: INK, textTransform: 'uppercase', marginBottom: 8 }}>Recent sign ins</div>
            <div style={{ display: 'grid', gap: 4, maxHeight: 220, overflow: 'auto' }}>
              {data.recent.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 11, alignItems: 'baseline' }}>
                  <span style={{ color: MUT, whiteSpace: 'nowrap' }}>{rel(e.at)}</span>
                  <span style={{ fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{e.email}</span>
                  <span style={{ color: MUT }}>{e.role}</span>
                </div>
              ))}
            </div>
          </div>

          {data.failed.length > 0 && (
            <div style={{ ...card, borderColor: '#F0C9C9' }}>
              <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: '.1em', color: '#B91C1C', textTransform: 'uppercase', marginBottom: 8 }}>Failed attempts, 7 days</div>
              <div style={{ display: 'grid', gap: 4 }}>
                {data.failed.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 11.5, alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 800, color: '#B91C1C' }}>{f.attempts}x</span>
                    <span style={{ flex: 1, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.email}</span>
                    <span style={{ color: MUT, whiteSpace: 'nowrap' }}>{rel(f.last)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ fontSize: 10.5, color: MUT }}>{data.method}</div>
    </div>
  )
}
