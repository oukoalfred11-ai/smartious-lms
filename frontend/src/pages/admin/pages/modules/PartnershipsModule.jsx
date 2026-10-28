/**
 * PartnershipsModule — partnership enquiries from /partnerships, in the
 * Admin, Dean & Operations and QA portals (backend routes/partnerships.js).
 *
 * Counts by type and status that filter on click, a filter bar (search,
 * type, status, country, follow-ups due, assignment, dates, sort), CSV
 * export, and an enquiry panel: the type's own answers, status with a
 * note, follow-up date, assignment, notes and history.
 */
import React, { useCallback, useEffect, useState } from 'react'
import { api, useAuth } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { PSection } from '../shared/ui.jsx'
import { PARTNERSHIP_TYPES, PARTNERSHIP_STATUSES } from '../../../../data/careers.js'
import { Badge } from './CareersModule.jsx'

const STATUS = Object.fromEntries(PARTNERSHIP_STATUSES.map(s => [s.key, s]))
const TYPE = Object.fromEntries(PARTNERSHIP_TYPES.map(t => [t.key, t]))
const line = TOKENS.line || '#E8E2D6'
const inp = { padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${line}`, fontSize: 13, fontFamily: 'inherit', background: '#fff', color: TOKENS.ink, minWidth: 0 }
const td = { padding: '10px 12px', fontSize: 12.5, color: TOKENS.s700, verticalAlign: 'top' }
const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const fmtDT = (d) => d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''
const chip = (on) => ({ padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${on ? TOKENS.crimson : line}`, background: on ? TOKENS.crimson : '#fff', color: on ? '#fff' : TOKENS.s700, display: 'inline-flex', gap: 6 })
const EMPTY_F = { q: '', type: '', status: 'open', country: '', followUp: '', assigned: '', from: '', to: '', sort: 'newest' }

export default function PartnershipsModule({ toast }) {
  const [f, setF] = useState(EMPTY_F)
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(null)
  const set = (k, v) => { setPage(1); setF(p => ({ ...p, [k]: v })) }
  const params = (extra = {}) => Object.fromEntries(Object.entries({ ...f, ...extra }).filter(([, v]) => v !== '' && v != null))

  const load = useCallback(() => {
    api.get('/partnerships', { params: params({ page, limit: 50 }) })
      .then(r => setData(r.data.data))
      .catch(e => { setData({ items: [], total: 0, facets: {} }); toast?.error?.(e?.response?.data?.message || 'Could not load enquiries.') })
  }, [f, page]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(load, f.q ? 300 : 0); return () => clearTimeout(t) }, [load]) // eslint-disable-line react-hooks/exhaustive-deps

  const exportCsv = async () => {
    try {
      const r = await api.get('/partnerships/export.csv', { params: params(), responseType: 'blob' })
      const url = URL.createObjectURL(r.data)
      const a = document.createElement('a'); a.href = url; a.download = `partnership-enquiries-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch { toast?.error?.('Could not export.') }
  }
  const facets = data?.facets || {}

  return (
    <>
      <PSection tag="Operations" title="Partnership" em="enquiries" sub="Universities, exam centres, training and co-curricular providers, schools and employers who want to work with us."
        action={<button className="btn btn-s btn-sm" onClick={exportCsv}>Export CSV</button>} />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <button onClick={() => set('type', '')} style={chip(!f.type)}>All types</button>
        {PARTNERSHIP_TYPES.filter(t => facets.type?.[t.key]).map(t => (
          <button key={t.key} onClick={() => set('type', f.type === t.key ? '' : t.key)} style={chip(f.type === t.key)}>{t.label} <b>{facets.type[t.key]}</b></button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <button onClick={() => set('status', 'open')} style={chip(f.status === 'open')}>Open</button>
        {PARTNERSHIP_STATUSES.map(s => <button key={s.key} onClick={() => set('status', f.status === s.key ? 'open' : s.key)} style={chip(f.status === s.key)}>{s.label} <b>{facets.status?.[s.key] || 0}</b></button>)}
        <button onClick={() => set('status', '')} style={chip(f.status === '')}>All</button>
      </div>

      <div className="card" style={{ padding: 12, marginBottom: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, alignItems: 'end' }}>
        <input style={{ ...inp, gridColumn: 'span 2' }} placeholder="Search organisation, contact, email, reference…" value={f.q} onChange={e => set('q', e.target.value)} />
        <select style={inp} value={f.country} onChange={e => set('country', e.target.value)}><option value="">All countries</option>{Object.entries(facets.country || {}).map(([k, n]) => <option key={k} value={k}>{k} ({n})</option>)}</select>
        <select style={inp} value={f.followUp} onChange={e => set('followUp', e.target.value)}><option value="">Follow-up: any</option><option value="due">Follow-up due</option><option value="none">No follow-up set</option></select>
        <select style={inp} value={f.assigned} onChange={e => set('assigned', e.target.value)}><option value="">Assigned: anyone</option><option value="me">Assigned to me</option><option value="none">Unassigned</option></select>
        <select style={inp} value={f.sort} onChange={e => set('sort', e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="followup">Follow-up date</option><option value="name">Organisation</option></select>
        <label style={{ fontSize: 11.5, color: TOKENS.s500 }}>From<input style={{ ...inp, width: '100%' }} type="date" value={f.from} onChange={e => set('from', e.target.value)} /></label>
        <label style={{ fontSize: 11.5, color: TOKENS.s500 }}>To<input style={{ ...inp, width: '100%' }} type="date" value={f.to} onChange={e => set('to', e.target.value)} /></label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5, color: TOKENS.s500 }}>
          <button className="btn btn-s btn-sm" onClick={() => { setF(EMPTY_F); setPage(1) }}>Clear</button>
          <span>{data ? `${data.total} enquir${data.total === 1 ? 'y' : 'ies'}` : 'Loading…'}</span>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead><tr>{['Organisation', 'Type', 'Contact', 'Country', 'Status', 'Follow up', 'Received'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11 }}>{h}</th>)}</tr></thead>
          <tbody>
            {data && !data.items.length && <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: TOKENS.s500, fontSize: 13 }}>No enquiries match these filters.</td></tr>}
            {(data?.items || []).map(p => {
              const due = p.followUpOn && new Date(p.followUpOn) <= new Date()
              return (
                <tr key={p._id} onClick={() => setOpen(p._id)} style={{ borderTop: `1px solid ${line}`, cursor: 'pointer' }}>
                  <td style={td}><div style={{ fontWeight: 700, color: TOKENS.ink }}>{p.organisation}</div><div style={{ fontSize: 11, color: TOKENS.s500 }}>{p.ref}</div></td>
                  <td style={td}>{TYPE[p.type]?.label || p.type}</td>
                  <td style={td}>{p.contactName}<div style={{ fontSize: 11, color: TOKENS.s500 }}>{p.email}</div></td>
                  <td style={td}>{p.country || '—'}</td>
                  <td style={td}><Badge s={p.status} map={STATUS} />{p.assignedToName && <div style={{ fontSize: 10.5, color: TOKENS.s500, marginTop: 3 }}>{p.assignedToName}</div>}</td>
                  <td style={{ ...td, color: due ? TOKENS.accentRose : TOKENS.s700, fontWeight: due ? 700 : 400 }}>{p.followUpOn ? fmtD(p.followUpOn) : '—'}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap', fontSize: 12 }}>{fmtD(p.createdAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {data?.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, alignItems: 'center' }}>
          <button className="btn btn-s btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{'‹'}</button>
          <span style={{ fontSize: 12.5 }}>Page {page} of {data.pages}</span>
          <button className="btn btn-s btn-sm" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>{'›'}</button>
        </div>
      )}
      {open && <EnquiryPanel id={open} toast={toast} onClose={() => setOpen(null)} onChanged={load} />}
    </>
  )
}

function EnquiryPanel({ id, toast, onClose, onChanged }) {
  const { user } = useAuth()
  const [p, setP] = useState(null)
  const [status, setStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [note, setNote] = useState('')
  const [follow, setFollow] = useState('')

  const load = useCallback(() => {
    api.get('/partnerships/' + id).then(r => { const x = r.data.data.enquiry; setP(x); setStatus(x.status); setFollow(x.followUpOn ? x.followUpOn.slice(0, 10) : '') })
      .catch(e => { toast?.error?.(e?.response?.data?.message || 'Could not open the enquiry.'); onClose() })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(load, [load])
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])

  const act = async (fn, ok) => { try { await fn(); toast?.ok?.(ok); load(); onChanged?.() } catch (e) { toast?.error?.(e?.response?.data?.message || 'That did not work.') } }
  const t = p ? TYPE[p.type] : null
  const fieldLabel = Object.fromEntries((t?.fields || []).map(fd => [fd.key, fd.label]))
  const row = (k, v) => v || v === 0 ? <div style={{ display: 'flex', gap: 10, fontSize: 13, padding: '5px 0', borderBottom: `1px solid ${line}` }}><span style={{ width: 200, flexShrink: 0, color: TOKENS.s500 }}>{k}</span><span style={{ color: TOKENS.ink, whiteSpace: 'pre-wrap' }}>{v}</span></div> : null

  return (
    <div role="dialog" aria-modal="true" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,10,10,.45)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(700px, 100%)', height: '100%', background: '#FBFAF5', overflowY: 'auto', padding: '20px 22px 60px', boxSizing: 'border-box', color: TOKENS.ink }}>
        {!p ? <div style={{ padding: 40, color: TOKENS.s500 }}>Loading…</div> : (<>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: TOKENS.s500, fontWeight: 700 }}>{p.ref} · received {fmtD(p.createdAt)} · {t?.label || p.type}</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{p.organisation}</div>
              <div style={{ fontSize: 13, color: TOKENS.s600 }}>{p.contactName}{p.contactRole ? ', ' + p.contactRole : ''} · {[p.city, p.country].filter(Boolean).join(', ')}</div>
              <div style={{ fontSize: 13, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href={`mailto:${p.email}?subject=${encodeURIComponent('Your partnership enquiry ' + p.ref)}`}>{p.email}</a>
                {p.phone && <a href={'tel:' + p.phone.replace(/\s/g, '')}>{p.phone}</a>}
                {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer">Website</a>}
              </div>
            </div>
            <button className="btn btn-s btn-sm" onClick={onClose}>Close</button>
          </div>

          <div className="card" style={{ padding: 12, marginTop: 12, display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge s={p.status} map={STATUS} />
              <span style={{ fontSize: 12.5, color: TOKENS.s500 }}>{p.assignedToName ? 'Assigned to ' + p.assignedToName : 'Unassigned'}</span>
              <span style={{ marginLeft: 'auto' }}>
                {String(p.assignedTo) !== String(user?._id)
                  ? <button className="btn btn-s btn-sm" onClick={() => act(() => api.patch('/partnerships/' + id, { assignedTo: user?._id }), 'Assigned to you.')}>Assign to me</button>
                  : <button className="btn btn-s btn-sm" onClick={() => act(() => api.patch('/partnerships/' + id, { assignedTo: null }), 'Unassigned.')}>Unassign</button>}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select style={inp} value={status} onChange={e => setStatus(e.target.value)}>{PARTNERSHIP_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select>
              <input style={{ ...inp, flex: 1, minWidth: 160 }} placeholder="Note for this change (optional)" value={statusNote} onChange={e => setStatusNote(e.target.value)} />
              <button className="btn btn-p btn-sm" disabled={status === p.status && !statusNote} onClick={() => act(() => api.patch(`/partnerships/${id}/status`, { status, note: statusNote }).then(() => setStatusNote('')), 'Status updated.')}>Update status</button>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 13 }}>
              Follow up on <input style={inp} type="date" value={follow} onChange={e => setFollow(e.target.value)} />
              <button className="btn btn-s btn-sm" onClick={() => act(() => api.patch('/partnerships/' + id, { followUpOn: follow || null }), follow ? 'Follow-up date set.' : 'Follow-up cleared.')}>Save</button>
            </div>
          </div>

          <div className="card" style={{ padding: 14, marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: TOKENS.crimson, marginBottom: 8 }}>{t?.label || 'Details'}</div>
            {Object.entries(p.details || {}).map(([k, v]) => <React.Fragment key={k}>{row(fieldLabel[k] || k, Array.isArray(v) ? v.join(', ') : String(v))}</React.Fragment>)}
            {row('Message', p.message)}{row('Heard about us', p.howHeard)}
          </div>

          <div className="card" style={{ padding: 14, marginTop: 12, display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 800 }}>Notes</div>
            <textarea style={{ ...inp, minHeight: 70 }} placeholder="Add a note" value={note} onChange={e => setNote(e.target.value)} />
            <button className="btn btn-p btn-sm" style={{ justifySelf: 'start' }} disabled={!note.trim()} onClick={() => act(() => api.post(`/partnerships/${id}/notes`, { text: note }).then(() => setNote('')), 'Note added.')}>Add note</button>
            {[...(p.notes || [])].reverse().map((n, i) => <div key={i} style={{ borderTop: `1px solid ${line}`, paddingTop: 8, fontSize: 13 }}><b>{n.name}</b> <span style={{ color: TOKENS.s500 }}>· {fmtDT(n.at)}</span><div style={{ whiteSpace: 'pre-wrap' }}>{n.text}</div></div>)}
          </div>

          <div className="card" style={{ padding: 14, marginTop: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>History</div>
            {[...(p.statusHistory || [])].reverse().map((h, i) => <div key={i} style={{ fontSize: 13, padding: '6px 0', borderBottom: `1px solid ${line}` }}><Badge s={h.status} map={STATUS} /> <span style={{ color: TOKENS.s500 }}>{fmtDT(h.at)} · {h.name}</span>{h.note && <div style={{ marginTop: 3 }}>{h.note}</div>}</div>)}
          </div>
        </>)}
      </div>
    </div>
  )
}
