/**
 * AdmissionDocsModule — admission documents uploaded by students and parents.
 * ============================================================
 * Admin and Dean & Operations only (the server enforces this too).
 * Overview of every student's admission file (required documents
 * uploaded / verified, waiting for review), then one student's file to
 * open each document, verify it, or ask for a new copy with a reason the
 * family sees in their portal. Files open through 10-minute signed links.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { DOC_STATUS, openAdmissionDoc } from '../../../../components/AdmissionDocuments.jsx'

const chip = (bg, fg) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: bg, color: fg, whiteSpace: 'nowrap' })
const btn = { background: '#FFFFFF', color: '#3A2E2A', border: '1.5px solid #E8E0D0', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }
const day = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const size = (b) => !b ? '' : b < 1048576 ? Math.round(b / 1024) + ' KB' : (b / 1048576).toFixed(1) + ' MB'

const FILTERS = [
  ['all', 'All students'], ['review', 'Waiting for review'], ['incomplete', 'Missing documents'],
  ['rejected', 'New copy requested'], ['complete', 'All verified'],
]

function StudentFile({ studentId, toast, onBack }) {
  const [data, setData] = useState(null)
  const toastRef = useRef(toast); toastRef.current = toast
  const load = useCallback(() => {
    api.get('/admission-documents/student/' + studentId)
      .then(r => setData(r.data?.data || null))
      .catch(e => toastRef.current?.error?.(e?.response?.data?.message || 'Could not load this student\'s documents.'))
  }, [studentId])
  useEffect(() => { load() }, [load])

  const review = async (d, status) => {
    let reviewNote = ''
    if (status === 'rejected') {
      reviewNote = window.prompt('What is wrong with "' + d.title + '"? The family will see this note.', '') || ''
      if (!reviewNote.trim()) return
    }
    try {
      const { data: res } = await api.patch('/admission-documents/' + d._id + '/review', { status, reviewNote })
      toast?.ok?.(res?.message || 'Saved.'); load()
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not save the review.') }
  }
  const remove = async (d) => {
    if (!window.confirm('Delete "' + d.title + '" (' + (d.file?.filename || '') + ') permanently?')) return
    try { await api.delete('/admission-documents/' + d._id); toast?.ok?.('Deleted.'); load() }
    catch (e) { toast?.error?.(e?.response?.data?.message || 'Delete failed.') }
  }

  if (!data) return <div className="card" style={{ padding: 30, textAlign: 'center', color: '#6B6B6B' }}>Loading...</div>
  const byCat = {}
  for (const d of data.documents) (byCat[d.category] = byCat[d.category] || []).push(d)
  const s = data.summary

  return (
    <div>
      <button onClick={onBack} style={{ ...btn, marginBottom: 14 }}>← All students</button>
      <div className="card" style={{ padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: '#1A1A1A' }}>{data.student.name}</div>
        <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>
          {data.student.admissionNumber ? data.student.admissionNumber + ' · ' : ''}{data.student.email} · {s.requiredSubmitted}/{s.requiredTotal} required uploaded · {s.requiredVerified} verified · {s.pending} waiting for review
        </div>
      </div>
      <div className="card" style={{ padding: 18, display: 'grid', gap: 10 }}>
        {data.categories.map(c => {
          const list = byCat[c.key] || []
          return (
            <div key={c.key} style={{ padding: '12px 14px', background: '#FBFAF5', border: '1px solid #EFE8DC', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', flex: 1 }}>{c.label}{c.required ? <span style={{ color: '#B91C1C' }}> *</span> : ''}</span>
                {!list.length && <span style={chip(c.required ? '#FEF3C7' : '#F4EFEB', c.required ? '#B45309' : '#6B6B6B')}>{c.required ? 'Missing' : 'Not provided'}</span>}
              </div>
              {list.map(d => {
                const st = DOC_STATUS[d.status] || DOC_STATUS.pending
                return (
                  <div key={d._id} style={{ marginTop: 8, padding: '10px 12px', background: '#FFFFFF', border: '1px solid #EFE8DC', borderRadius: 9 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ flex: '1 1 220px', minWidth: 0, fontSize: 13, color: '#1A1A1A' }}>
                        {d.file?.filename || d.title}
                        <span style={{ color: '#9A8F86', fontSize: 11.5 }}> · {day(d.createdAt)}{d.file?.sizeBytes ? ' · ' + size(d.file.sizeBytes) : ''} · uploaded by {d.uploadedByName || '—'} ({d.uploadedByRole})</span>
                      </span>
                      <span style={chip(st.bg, st.fg)} title={d.reviewedByName ? 'By ' + d.reviewedByName + ' on ' + day(d.reviewedAt) : ''}>{st.t}</span>
                      <button onClick={() => openAdmissionDoc(d._id, toast)} style={btn}>Open</button>
                      {d.status !== 'verified' && <button onClick={() => review(d, 'verified')} style={{ ...btn, background: '#15803D', color: '#fff', border: 'none' }}>Verify</button>}
                      {d.status !== 'rejected' && <button onClick={() => review(d, 'rejected')} style={{ ...btn, color: '#B91C1C', borderColor: '#FECACA' }}>Ask for new copy</button>}
                      {d.status !== 'pending' && <button onClick={() => review(d, 'pending')} style={btn}>Reset</button>}
                      <button onClick={() => remove(d)} style={{ ...btn, color: '#9A8F86' }}>Delete</button>
                    </div>
                    {d.note && <div style={{ fontSize: 12.5, color: '#3A2E2A', marginTop: 6 }}>Family's note: {d.note}</div>}
                    {d.reviewNote && <div style={{ fontSize: 12.5, color: '#B91C1C', marginTop: 4 }}>Asked for a new copy: {d.reviewNote}</div>}
                    {d.reviewedByName && <div style={{ fontSize: 11.5, color: '#9A8F86', marginTop: 4 }}>Reviewed by {d.reviewedByName} on {day(d.reviewedAt)}</div>}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdmissionDocsModule({ toast }) {
  const [rows, setRows] = useState(null)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('review')
  const [open, setOpen] = useState(null)
  const toastRef = useRef(toast); toastRef.current = toast

  const load = useCallback(() => {
    api.get('/admission-documents/overview')
      .then(r => setRows(r.data?.data?.students || []))
      .catch(e => { setRows([]); toastRef.current?.error?.(e?.response?.data?.message || 'Could not load admission documents.') })
  }, [])
  useEffect(() => { if (!open) load() }, [load, open])

  if (open) return <StudentFile studentId={open} toast={toast} onBack={() => setOpen(null)} />

  const list = (rows || []).filter(r => {
    if (q && !(r.name + ' ' + r.email + ' ' + (r.admissionNumber || '')).toLowerCase().includes(q.toLowerCase())) return false
    if (filter === 'review') return r.pending > 0
    if (filter === 'incomplete') return r.requiredSubmitted < r.requiredTotal
    if (filter === 'rejected') return r.rejected > 0
    if (filter === 'complete') return r.requiredTotal > 0 && r.requiredVerified === r.requiredTotal
    return true
  })
  const count = (f) => (rows || []).filter(r => f === 'review' ? r.pending > 0 : f === 'incomplete' ? r.requiredSubmitted < r.requiredTotal : f === 'rejected' ? r.rejected > 0 : f === 'complete' ? r.requiredVerified === r.requiredTotal : true).length

  return (
    <div>
      <div className="card" style={{ padding: 18, marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>Admission documents</div>
        <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>Uploaded by students and parents from their portals. Only the Principal and the Dean can open and verify them.</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {FILTERS.map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{ ...btn, ...(filter === k ? { background: '#7D1025', color: '#FBFAF5', border: 'none' } : {}) }}>{l} · {rows ? count(k) : '…'}</button>
          ))}
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email or admission no." style={{ flex: '1 1 220px', padding: '8px 12px', border: '1.5px solid #E8E0D0', borderRadius: 8, fontSize: 13 }} />
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#FBFAF5', textAlign: 'left', color: '#6B6B6B', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            <th style={{ padding: '12px 16px' }}>Student</th><th style={{ padding: '12px 10px' }}>Required uploaded</th><th style={{ padding: '12px 10px' }}>Verified</th>
            <th style={{ padding: '12px 10px' }}>Waiting</th><th style={{ padding: '12px 10px' }}>Last upload</th><th />
          </tr></thead>
          <tbody>
            {rows === null && <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#6B6B6B' }}>Loading...</td></tr>}
            {rows && !list.length && <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#6B6B6B' }}>No students in this view.</td></tr>}
            {list.map(r => (
              <tr key={r._id} style={{ borderTop: '1px solid #EFE8DC', cursor: 'pointer' }} onClick={() => setOpen(r._id)}>
                <td style={{ padding: '12px 16px' }}><div style={{ fontWeight: 700, color: '#1A1A1A' }}>{r.name}</div><div style={{ fontSize: 11.5, color: '#9A8F86' }}>{r.admissionNumber ? r.admissionNumber + ' · ' : ''}{r.email}</div></td>
                <td style={{ padding: '12px 10px' }}><span style={chip(r.requiredSubmitted === r.requiredTotal ? '#DCFCE7' : '#FEF3C7', r.requiredSubmitted === r.requiredTotal ? '#15803D' : '#B45309')}>{r.requiredSubmitted}/{r.requiredTotal}</span></td>
                <td style={{ padding: '12px 10px' }}>{r.requiredVerified}/{r.requiredTotal}</td>
                <td style={{ padding: '12px 10px' }}>{r.pending ? <span style={chip('#E0F2FE', '#0369A1')}>{r.pending}</span> : '—'}{r.rejected ? <span style={{ ...chip('#FEE2E2', '#B91C1C'), marginLeft: 6 }}>{r.rejected} new copy</span> : null}</td>
                <td style={{ padding: '12px 10px', color: '#6B6B6B' }}>{day(r.latest)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}><button style={btn}>Open file →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
