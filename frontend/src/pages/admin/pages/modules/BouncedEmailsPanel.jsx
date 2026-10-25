/**
 * BouncedEmailsPanel — addresses the system no longer emails because mail
 * to them bounced or was refused (GET /api/mail-suppressions). Shows whose
 * address it is so it can be corrected, then lifted. Rendered in
 * UsersLogsModule.
 */
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'

const CRIM = '#7D1025', INK = '#231715', MUT = '#8A8378', LINE = '#E5DFD3'
const REASON = { bounce: 'Bounced', rejected: 'Refused by mail server', manual: 'Added by staff' }
const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

export default function BouncedEmailsPanel({ toast }) {
  const [rows, setRows] = useState(null)
  const [busy, setBusy] = useState('')
  const [email, setEmail] = useState('')
  const load = useCallback(() => {
    api.get('/mail-suppressions').then(r => setRows(r.data?.data?.rows || [])).catch(() => setRows([]))
  }, [])
  useEffect(() => { load() }, [load])

  const act = async (key, fn) => {
    setBusy(key)
    try { const r = await fn(); toast?.ok?.(r.data?.message || 'Done.'); load() }
    catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not complete that.') }
    finally { setBusy('') }
  }
  const btn = (bg, color) => ({ padding: '6px 12px', borderRadius: 7, border: bg === '#fff' ? `1px solid ${LINE}` : 'none', background: bg, color, fontSize: 12, fontWeight: 700, cursor: 'pointer' })

  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
        <b style={{ fontSize: 14.5, color: INK }}>Bounced email addresses</b>
        <span style={{ fontSize: 12, color: MUT }}>{rows ? rows.length : '…'} address{rows?.length === 1 ? '' : 'es'} not emailed</span>
        <span style={{ flex: 1 }} />
        <button type="button" disabled={!!busy} style={btn(CRIM, '#fff')} onClick={() => act('scan', () => api.post('/mail-suppressions/scan'))}>
          {busy === 'scan' ? 'Reading the inbox…' : 'Check the inbox for bounces now'}
        </button>
      </div>
      <p style={{ fontSize: 12, color: MUT, margin: '0 0 12px', lineHeight: 1.55 }}>
        When an email bounces, that address stops receiving system emails, so the inbox no longer fills with failure notices.
        The inbox is checked automatically every 30 minutes and the notices are moved to the “Smartious/Bounces” label.
        Correct the address on the person’s profile, then lift the block here.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Block an address by hand"
          style={{ padding: '7px 10px', border: `1px solid ${LINE}`, borderRadius: 7, fontSize: 12.5, flex: '1 1 220px', maxWidth: 320 }} />
        <button type="button" disabled={!!busy || !email.trim()} style={btn('#fff', INK)}
          onClick={() => act('add', () => api.post('/mail-suppressions', { email: email.trim() })).then(() => setEmail(''))}>Block</button>
      </div>
      {!rows ? null : !rows.length ? <div style={{ fontSize: 12.5, color: MUT }}>No bounced addresses.</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr>{['Address', 'Whose', 'Why', 'Failures', 'Last', ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', borderBottom: `1px solid ${LINE}`, color: MUT, fontWeight: 700 }}>{h}</th>)}</tr></thead>
            <tbody>{rows.map(r => (
              <tr key={r.email}>
                <td style={{ padding: '6px 8px', borderBottom: `1px solid ${LINE}`, fontWeight: 700, color: INK }}>{r.email}</td>
                <td style={{ padding: '6px 8px', borderBottom: `1px solid ${LINE}` }}>{r.owners?.length ? r.owners.map(o => <div key={o._id + o.field}>{o.name} <span style={{ color: MUT }}>({o.role}, {o.field})</span></div>) : <span style={{ color: MUT }}>No account</span>}</td>
                <td style={{ padding: '6px 8px', borderBottom: `1px solid ${LINE}` }} title={r.detail}>{REASON[r.reason] || r.reason}{r.detail ? <div style={{ color: MUT, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.detail}</div> : null}</td>
                <td style={{ padding: '6px 8px', borderBottom: `1px solid ${LINE}` }}>{r.count}</td>
                <td style={{ padding: '6px 8px', borderBottom: `1px solid ${LINE}`, whiteSpace: 'nowrap' }}>{fmt(r.lastAt)}</td>
                <td style={{ padding: '6px 8px', borderBottom: `1px solid ${LINE}` }}>
                  <button type="button" disabled={!!busy} style={btn('#fff', CRIM)} onClick={() => act(r.email, () => api.delete('/mail-suppressions/' + encodeURIComponent(r.email)))}>Email again</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
