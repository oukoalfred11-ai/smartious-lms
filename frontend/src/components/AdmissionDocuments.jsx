/**
 * AdmissionDocuments — the family side of a student's admission file.
 * ============================================================
 * Students and parents see the documents the Admission Pack asks for,
 * each with its status (missing, uploaded and awaiting review, verified,
 * or "needs a new copy" with the school's reason), upload into the right
 * slot, and download the Admission Pack itself. Only the Principal and the
 * Dean & Operations can review these (admin → Admission Documents).
 * Files are private: opening one fetches a 10-minute signed link.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../context/ctx.jsx'

const size = (b) => !b ? '' : b < 1048576 ? Math.round(b / 1024) + ' KB' : (b / 1048576).toFixed(1) + ' MB'
const day = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const chip = (bg, fg) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: bg, color: fg, whiteSpace: 'nowrap' })
const btn = { background: '#FFFFFF', color: '#3A2E2A', border: '1.5px solid #E8E0D0', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }
const primary = { ...btn, background: '#7D1025', color: '#FBFAF5', border: 'none' }

export const DOC_STATUS = {
  verified: { t: '✓ Verified', bg: '#DCFCE7', fg: '#15803D' },
  pending:  { t: 'Awaiting review', bg: '#E0F2FE', fg: '#0369A1' },
  rejected: { t: 'Needs a new copy', bg: '#FEE2E2', fg: '#B91C1C' },
}

export async function openAdmissionDoc(id, toast) {
  // Open the tab synchronously so pop-up blockers allow it, then point it at the signed link.
  const w = window.open('', '_blank')
  try {
    const { data } = await api.get('/admission-documents/' + id + '/open')
    if (!data?.data?.url) throw new Error(data?.message || 'Could not open the document.')
    if (w) w.location = data.data.url; else window.location.href = data.data.url
  } catch (e) {
    if (w) w.close()
    toast?.error?.(e?.response?.data?.message || e.message || 'Could not open the document.')
  }
}

export default function AdmissionDocuments({ studentId = null, toast: toastProp }) {
  // Callers may pass a fresh toast object each render; keep loads stable.
  const toastRef = useRef(toastProp); toastRef.current = toastProp
  const toast = { ok: (m) => toastRef.current?.ok?.(m), error: (m) => toastRef.current?.error?.(m) }
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [up, setUp] = useState(null)        // { category, note, file }
  const [busy, setBusy] = useState(false)
  const [pct, setPct] = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admission-documents/mine', { params: studentId ? { studentId } : {} })
      .then(r => setData(r.data?.data || null))
      .catch(() => toastRef.current?.error?.('Could not load admission documents.'))
      .finally(() => setLoading(false))
  }, [studentId])
  useEffect(() => { load() }, [load])

  const downloadPack = async () => {
    try {
      const r = await api.get('/admission-documents/pack', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }))
      const a = document.createElement('a'); a.href = url; a.download = 'Smartious_Admission_Pack_2026.pdf'
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch { toast?.error?.('Could not download the Admission Pack.') }
  }

  const doUpload = async () => {
    if (!up?.file) return toast?.error?.('Choose a file first.')
    const cat = (data?.categories || []).find(c => c.key === up.category) || {}
    setBusy(true); setPct(0)
    try {
      const pr = await api.post('/admission-documents/presign', {
        studentId: data?.student?._id, fileName: up.file.name, mimeType: up.file.type || 'application/octet-stream', fileSize: up.file.size,
      })
      const pd = pr.data?.data
      if (!pd?.uploadUrl) throw new Error(pr.data?.message || 'Could not prepare the upload.')
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', pd.uploadUrl)
        xhr.setRequestHeader('Content-Type', up.file.type || 'application/octet-stream')
        xhr.upload.onprogress = e => { if (e.total) setPct(Math.round((e.loaded / e.total) * 100)) }
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error('Upload failed (' + xhr.status + ').'))
        xhr.onerror = () => reject(new Error('Upload failed. Check your connection.'))
        xhr.send(up.file)
      })
      const { data: res } = await api.post('/admission-documents/confirm', {
        r2Key: pd.r2Key, category: up.category, title: cat.label, note: up.note || '',
        fileName: up.file.name, mimeType: up.file.type || '', fileSize: up.file.size,
      })
      if (!res?.success) throw new Error(res?.message || 'Could not save the document.')
      toast?.ok?.(res.message || 'Uploaded.')
      setUp(null); load()
    } catch (e) { toast?.error?.(e?.response?.data?.message || e.message || 'Upload failed.') }
    finally { setBusy(false); setPct(0) }
  }

  const remove = async (d) => {
    if (!window.confirm('Delete "' + d.title + '"?')) return
    try {
      const { data: res } = await api.delete('/admission-documents/' + d._id)
      toast?.ok?.(res?.message || 'Deleted.'); load()
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Delete failed.') }
  }

  if (loading && !data) return <div className="card" style={{ padding: 32, textAlign: 'center', color: '#6B6B6B' }}>Loading admission documents...</div>
  if (!data?.student) return <div className="card" style={{ padding: 32, textAlign: 'center', color: '#6B6B6B' }}>No student is linked to this account yet. Please contact the school.</div>

  const cats = data.categories || []
  const byCat = {}
  for (const d of data.documents || []) (byCat[d.category] = byCat[d.category] || []).push(d)
  const s = data.summary || { requiredTotal: 0, requiredSubmitted: 0, requiredVerified: 0 }
  const pctDone = s.requiredTotal ? Math.round((s.requiredSubmitted / s.requiredTotal) * 100) : 0
  const ring = s.requiredVerified === s.requiredTotal && s.requiredTotal ? '#15803D' : pctDone >= 60 ? '#B45309' : '#B91C1C'
  const R = 30, C = 2 * Math.PI * R

  return (
    <div>
      <div className="card" style={{ padding: 22, marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <svg width="76" height="76" viewBox="0 0 76 76" aria-label={pctDone + '% submitted'} style={{ flexShrink: 0 }}>
          <circle cx="38" cy="38" r={R} fill="none" stroke="#F4EFEB" strokeWidth="7" />
          <circle cx="38" cy="38" r={R} fill="none" stroke={ring} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(pctDone / 100) * C} ${C}`} transform="rotate(-90 38 38)" />
          <text x="38" y="38" textAnchor="middle" dominantBaseline="central" fontSize="16" fontWeight="800" fill="#1A1A1A">{pctDone}%</text>
        </svg>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>Admission documents · {data.student.name}</div>
          <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4, lineHeight: 1.55 }}>
            {s.requiredSubmitted} of {s.requiredTotal} required documents uploaded, {s.requiredVerified} verified by the school.
            Lessons begin once the signed Admission Agreement and first term's fees are received.
          </div>
        </div>
        <button onClick={downloadPack} style={btn}>Download Admission Pack (PDF)</button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'grid', gap: 10 }}>
          {cats.map(c => {
            const list = byCat[c.key] || []
            const live = list.filter(d => d.status !== 'rejected')
            const st = live.some(d => d.status === 'verified') ? DOC_STATUS.verified
              : live.length ? DOC_STATUS.pending
                : list.length ? DOC_STATUS.rejected
                  : c.required ? { t: 'Missing', bg: '#FEF3C7', fg: '#B45309' } : { t: 'Optional', bg: '#F4EFEB', fg: '#6B6B6B' }
            return (
              <div key={c.key} style={{ padding: '12px 14px', background: '#FBFAF5', border: '1px solid #EFE8DC', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{c.label}{c.required ? <span style={{ color: '#B91C1C' }}> *</span> : ''}</div>
                    {c.hint && <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>{c.hint}</div>}
                  </div>
                  <span style={chip(st.bg, st.fg)}>{st.t}</span>
                  <button onClick={() => setUp({ category: c.key, note: '', file: null })} style={primary}>+ Upload</button>
                </div>
                {list.map(d => {
                  const ds = DOC_STATUS[d.status] || DOC_STATUS.pending
                  return (
                    <div key={d._id} style={{ marginTop: 8, padding: '8px 10px', background: '#FFFFFF', border: '1px solid #EFE8DC', borderRadius: 9 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ flex: '1 1 180px', minWidth: 0, fontSize: 13, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.file?.filename || d.title}
                          <span style={{ color: '#9A8F86', fontSize: 11.5 }}> · {day(d.createdAt)}{d.file?.sizeBytes ? ' · ' + size(d.file.sizeBytes) : ''}{d.uploadedByName ? ' · by ' + d.uploadedByName : ''}</span>
                        </span>
                        <span style={chip(ds.bg, ds.fg)}>{ds.t}</span>
                        <button onClick={() => openAdmissionDoc(d._id, toast)} style={btn}>Open</button>
                        {d.status !== 'verified' && <button onClick={() => remove(d)} style={{ ...btn, color: '#B91C1C', borderColor: '#FECACA' }}>Delete</button>}
                      </div>
                      {d.status === 'rejected' && d.reviewNote && (
                        <div style={{ marginTop: 6, fontSize: 12.5, color: '#B91C1C' }}>School's note: {d.reviewNote}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: 11.5, color: '#9A8F86', marginTop: 10 }}>* Required. Your documents are private: only the Principal and the Dean can open them.</div>
      </div>

      {up && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,10,8,.55)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => !busy && setUp(null)}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 460, maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)', color: '#FBFAF5', fontSize: 19, fontWeight: 700 }}>Upload a document</div>
            <div style={{ padding: '20px 24px', display: 'grid', gap: 14 }}>
              <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#6B6B6B' }}>DOCUMENT
                <select value={up.category} onChange={e => setUp(u => ({ ...u, category: e.target.value }))} style={{ padding: '10px 12px', border: '1.5px solid #E8E0D0', borderRadius: 8, fontSize: 13.5 }}>
                  {cats.map(c => <option key={c.key} value={c.key}>{c.label}{c.required ? ' *' : ''}</option>)}
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#6B6B6B' }}>FILE (PDF, PHOTO OR WORD · UP TO 20 MB)
                <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif,.doc,.docx,image/*" onChange={e => setUp(u => ({ ...u, file: e.target.files?.[0] || null }))} style={{ fontSize: 13 }} />
                {up.file && <span style={{ fontWeight: 400 }}>{up.file.name} · {size(up.file.size)}</span>}
              </label>
              <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: '#6B6B6B' }}>NOTE FOR THE SCHOOL (OPTIONAL)
                <input value={up.note} onChange={e => setUp(u => ({ ...u, note: e.target.value }))} placeholder="e.g. page 2 of the report" style={{ padding: '10px 12px', border: '1.5px solid #E8E0D0', borderRadius: 8, fontSize: 13.5 }} />
              </label>
              {busy && (
                <div>
                  <div style={{ height: 8, background: '#F4EFEB', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: pct + '%', background: '#7D1025', transition: 'width .2s' }} /></div>
                  <div style={{ fontSize: 11.5, color: '#6B6B6B', marginTop: 4 }}>Uploading... {pct}%</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button disabled={busy} onClick={() => setUp(null)} style={{ ...btn, padding: '10px 18px' }}>Cancel</button>
                <button disabled={busy} onClick={doUpload} style={{ ...primary, padding: '10px 22px', opacity: busy ? .7 : 1 }}>{busy ? 'Uploading...' : 'Upload'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
