/**
 * StaffFile — a team member's own staff file.
 * ============================================================
 * Every member of staff (the Principal, leadership, operations and every
 * kind of teacher) keeps one. It lists the documents their role requires
 * (the server decides: constants/qa.js requiredFor), each with its status
 * (missing, on file, verified by QA, expiring, expired) and a one-click
 * upload into the right category. Same store as the QA portal's Team
 * Profiles, so uploads appear there at once and verification shows here.
 */
import { useState, useEffect, useCallback } from 'react'
import { api } from '../context/ctx.jsx'

function tdocSize(b) {
  if (!b) return ''
  if (b < 1024) return b + ' B'
  if (b < 1048576) return Math.round(b / 1024) + ' KB'
  return (b / 1048576).toFixed(1) + ' MB'
}

// ── MY STAFF FILE (profile → My Documents) ─────────────────────
// The teacher's personnel file as Quality Assurance sees it: every
// required document with its status (missing, on file, verified by QA,
// expiring, expired) and a one-click upload into the right category.
// Same store as My Documents and the QA portal's Teacher Profiles.
const TSF_WARN_DAYS = 60
function tsfDocState(d) {
  if (!d.expiresAt) return null
  const days = Math.ceil((new Date(d.expiresAt) - Date.now()) / 86400000)
  if (days < 0) return { text: 'Expired', bg: '#FEE2E2', fg: '#B91C1C', expired: true }
  if (days <= TSF_WARN_DAYS) return { text: 'Expires in ' + days + ' days', bg: '#FEF3C7', fg: '#B45309' }
  return { text: 'Valid to ' + new Date(d.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), bg: '#DCFCE7', fg: '#15803D' }
}
export default function StaffFile({ toast, onOpenLibrary, showTeaching = true }) {
  const [docs, setDocs] = useState([])
  const [meta, setMeta] = useState([])
  const [requiredKeys, setRequiredKeys] = useState(null)   // this person's required documents
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [up, setUp] = useState(null)        // { category, title, expiresAt, file }
  const [busy, setBusy] = useState(false)
  const [pct, setPct] = useState(0)

  const load = useCallback(() => {
    api.get('/teacher-documents/mine')
      .then(r => {
        const d = r.data?.data || {}
        setDocs(d.documents || [])
        setMeta(d.categoryMeta || [])
        // What THIS person needs depends on their role: a qualified
        // teacher's file holds more than a support teacher's or the bursar's.
        setRequiredKeys(Array.isArray(d.required) ? d.required : null)
        setTitle(d.teamTitle || '')
      })
      .catch(() => toast?.error?.('Could not load your documents.'))
      .finally(() => setLoading(false))
  }, [toast])
  useEffect(() => { load() }, [load])

  const byCat = {}
  for (const d of docs) (byCat[d.category] = byCat[d.category] || []).push(d)
  const isReq = (c) => (requiredKeys ? requiredKeys.includes(c.key) : !!c.required)
  const personnel = meta.filter(c => c.group === 'personnel').map(c => ({ ...c, required: isReq(c) }))
  const teaching = showTeaching ? meta.filter(c => c.group === 'teaching') : []
  const required = personnel.filter(c => c.required)
  const valid = (k) => (byCat[k] || []).some(d => !tsfDocState(d)?.expired)
  const have = required.filter(c => valid(c.key)).length
  const pctDone = required.length ? Math.round((have / required.length) * 100) : 0
  const ringCol = pctDone >= 100 ? '#15803D' : pctDone >= 60 ? '#B45309' : '#B91C1C'

  const openUpload = (category) => {
    const c = meta.find(x => x.key === category) || {}
    setUp({ category, title: c.label || '', expiresAt: '', file: null })
  }

  const doUpload = async () => {
    if (!up?.file) return toast?.error?.('Choose a file first.')
    const cat = meta.find(x => x.key === up.category) || {}
    if (cat.expires && !up.expiresAt) return toast?.error?.('Add the expiry date shown on the document.')
    setBusy(true); setPct(0)
    try {
      const pr = await api.post('/teacher-documents/presign', {
        fileName: up.file.name, mimeType: up.file.type || 'application/octet-stream', fileSize: up.file.size,
      })
      const pd = pr.data?.data || pr.data
      if (!pd?.uploadUrl) throw new Error(pd?.message || 'Could not prepare the upload.')
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', pd.uploadUrl)
        xhr.setRequestHeader('Content-Type', up.file.type || 'application/octet-stream')
        xhr.upload.onprogress = evt => { if (evt.total) setPct(Math.round((evt.loaded / evt.total) * 100)) }
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error('Upload failed (' + xhr.status + ').'))
        xhr.onerror = () => reject(new Error('Upload failed. Check your connection.'))
        xhr.send(up.file)
      })
      const { data } = await api.post('/teacher-documents/confirm', {
        r2Key: pd.r2Key, category: up.category, title: (up.title || '').trim() || cat.label || up.file.name,
        fileName: up.file.name, mimeType: up.file.type || '', fileSize: up.file.size,
        expiresAt: up.expiresAt || null,
      })
      if (!data?.success) throw new Error(data?.message || 'Could not save the document.')
      toast?.ok?.((cat.label || 'Document') + ' added to your staff file.')
      setUp(null)
      load()
    } catch (e) { toast?.error?.(e?.response?.data?.message || e.message || 'Upload failed.') }
    finally { setBusy(false); setPct(0) }
  }

  const remove = async (d) => {
    if (!window.confirm('Delete "' + d.title + '" from your staff file?')) return
    try {
      const { data } = await api.delete('/teacher-documents/' + d._id)
      if (data?.success) { toast?.ok?.('Deleted.'); load() }
      else toast?.error?.(data?.message || 'Delete failed.')
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Delete failed.') }
  }

  const chip = (bg, fg) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: bg, color: fg, whiteSpace: 'nowrap' })
  const btnS = { background: '#FFFFFF', color: '#3A2E2A', border: '1.5px solid #E8E0D0', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }
  const inputStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid #E8E0D0', borderRadius: 8, fontSize: 13.5, background: '#FFFFFF', color: '#1A1A1A', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { fontSize: 11.5, fontWeight: 700, color: '#6B6B6B', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 6, display: 'block' }
  const R = 30, C = 2 * Math.PI * R
  const upCat = up ? (meta.find(x => x.key === up.category) || {}) : {}

  if (loading) return <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--s500)' }}>Loading your documents...</div>

  return (
    <div>
      <div className="card" style={{ padding: 22, marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <svg width="76" height="76" viewBox="0 0 76 76" aria-label={pctDone + '% complete'} style={{ flexShrink: 0 }}>
          <circle cx="38" cy="38" r={R} fill="none" stroke="#F4EFEB" strokeWidth="7" />
          <circle cx="38" cy="38" r={R} fill="none" stroke={ringCol} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${(pctDone / 100) * C} ${C}`} transform="rotate(-90 38 38)" />
          <text x="38" y="38" textAnchor="middle" dominantBaseline="central" fontSize="16" fontWeight="800" fill="#1A1A1A">{pctDone}%</text>
        </svg>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>My staff file{title ? <span style={{ fontWeight: 600, color: '#7D1025' }}> · {title}</span> : null}</div>
          <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4, lineHeight: 1.55 }}>
            {have} of {required.length} required documents on file. Quality Assurance reviews these for accreditation and marks each one verified once checked against the original.
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: '#7D1025', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>Staff file</div>
        <div style={{ display: 'grid', gap: 10 }}>
          {personnel.map(c => {
            const list = byCat[c.key] || []
            const ok = valid(c.key)
            const st = list.length === 0
              ? (c.required ? { t: 'Missing', bg: '#FEE2E2', fg: '#B91C1C' } : { t: 'Optional', bg: '#F4EFEB', fg: '#6B6B6B' })
              : !ok ? { t: 'Expired — upload a renewal', bg: '#FEE2E2', fg: '#B91C1C' }
                : list.every(d => d.verifiedAt) ? { t: '✓ Verified by QA', bg: '#DCFCE7', fg: '#15803D' }
                  : { t: 'On file', bg: '#E0F2FE', fg: '#0369A1' }
            return (
              <div key={c.key} style={{ padding: '12px 14px', background: '#FBFAF5', border: '1px solid #EFE8DC', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', flex: 1, minWidth: 180 }}>
                    {c.label}{c.required ? <span style={{ color: '#B91C1C' }}> *</span> : ''}
                  </span>
                  <span style={chip(st.bg, st.fg)}>{st.t}</span>
                  <button onClick={() => openUpload(c.key)} style={{ ...btnS, background: '#7D1025', color: '#FBFAF5', border: 'none' }}>+ Upload</button>
                </div>
                {list.map(d => {
                  const ds = tsfDocState(d)
                  return (
                    <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8, padding: '8px 10px', background: '#FFFFFF', border: '1px solid #EFE8DC', borderRadius: 9 }}>
                      <span style={{ flex: '1 1 180px', minWidth: 0, fontSize: 13, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.title}
                        <span style={{ color: '#9A8F86', fontSize: 11.5 }}> · {new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}{d.file?.sizeBytes ? ' · ' + tdocSize(d.file.sizeBytes) : ''}</span>
                      </span>
                      {ds && <span style={chip(ds.bg, ds.fg)}>{ds.text}</span>}
                      {d.verifiedAt && <span style={chip('#DCFCE7', '#15803D')} title={'Verified' + (d.verifiedByName ? ' by ' + d.verifiedByName : '')}>✓ Verified</span>}
                      <a href={d.file?.url} target="_blank" rel="noopener noreferrer" style={btnS}>Open</a>
                      <button onClick={() => remove(d)} style={{ ...btnS, color: '#B91C1C', borderColor: '#FECACA' }}>Delete</button>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: 11.5, color: '#9A8F86', marginTop: 10 }}>* Required for your role. You'll see a warning {TSF_WARN_DAYS} days before a dated document expires.</div>
      </div>

      {showTeaching && <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: '#7D1025', letterSpacing: '.08em', textTransform: 'uppercase', flex: 1 }}>Teaching documents</div>
          {onOpenLibrary && <button onClick={onOpenLibrary} style={btnS}>Open full library →</button>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {teaching.map(c => (
            <span key={c.key} style={chip((byCat[c.key] || []).length ? '#FDF2F4' : '#F4EFEB', (byCat[c.key] || []).length ? '#7D1025' : '#9A8F86')}>
              {c.label}: {(byCat[c.key] || []).length}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 10 }}>Schemes of work, lesson plans, records of work and other teaching files live in your full document library.</div>
      </div>}

      {up && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,10,8,.55)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => !busy && setUp(null)}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)', color: '#FBFAF5' }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 21 }}>Add to my staff file</div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Document</label>
                <select value={up.category} onChange={e => { const c = meta.find(x => x.key === e.target.value) || {}; setUp(u => ({ ...u, category: e.target.value, title: c.label || u.title })) }} style={inputStyle}>
                  <optgroup label="Staff file">{personnel.map(c => <option key={c.key} value={c.key}>{c.label}{c.required ? ' *' : ''}</option>)}</optgroup>
                  {teaching.length > 0 && <optgroup label="Teaching documents">{teaching.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</optgroup>}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Title</label>
                <input value={up.title} onChange={e => setUp(u => ({ ...u, title: e.target.value }))} placeholder={upCat.label || 'Document title'} style={inputStyle} />
              </div>
              {upCat.expires && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Expiry date (as shown on the document)</label>
                  <input type="date" value={up.expiresAt} onChange={e => setUp(u => ({ ...u, expiresAt: e.target.value }))} style={inputStyle} />
                </div>
              )}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>File (PDF, Word or photo — up to 50 MB)</label>
                <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" onChange={e => setUp(u => ({ ...u, file: e.target.files?.[0] || null }))} style={{ fontSize: 13 }} />
                {up.file && <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 6 }}>{up.file.name} · {tdocSize(up.file.size)}</div>}
              </div>
              {busy && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ height: 8, background: '#F4EFEB', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: pct + '%', background: '#7D1025', transition: 'width .2s' }} />
                  </div>
                  <div style={{ fontSize: 11.5, color: '#6B6B6B', marginTop: 4 }}>Uploading... {pct}%</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button disabled={busy} onClick={() => setUp(null)} style={{ background: '#FFFFFF', color: '#3A2E2A', border: '1.5px solid #E8E0D0', borderRadius: 9, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button disabled={busy} onClick={doUpload} style={{ background: '#7D1025', color: '#FBFAF5', border: 'none', borderRadius: 9, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: busy ? 'wait' : 'pointer', opacity: busy ? .7 : 1 }}>
                  {busy ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

