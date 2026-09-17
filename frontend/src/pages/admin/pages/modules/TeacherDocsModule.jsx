/**
 * TeacherDocsModule.jsx
 * ============================================================
 * Oversight view of every teacher's documentation file, for the
 * QA portal (and admin). Left: teacher list with filing counts.
 * Right: the selected teacher's documents grouped by category,
 * with the ability to file a document into that teacher's file
 * (an observation report, a moderated record) — provenance is
 * shown whenever the uploader is not the teacher themselves.
 */
import { useState, useEffect } from 'react'
import { api } from '../../../../context/ctx.jsx'

const CATEGORIES = [
  ['scheme_of_work',    'Schemes of Work'],
  ['lesson_plan',       'Lesson Plans'],
  ['record_of_work',    'Records of Work'],
  ['assessment_record', 'Assessment Records'],
  ['teaching_resource', 'Teaching Resources'],
  ['report',            'Reports'],
  ['other',             'Other'],
]
const LABEL = Object.fromEntries(CATEGORIES)

function fmtSize(b) {
  if (!b) return ''
  if (b < 1024 * 1024) return Math.max(1, Math.round(b / 1024)) + ' KB'
  return (b / (1024 * 1024)).toFixed(1) + ' MB'
}
function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

export default function TeacherDocsModule({ toast }) {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)          // selected teacher row
  const [docs, setDocs] = useState([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [upOpen, setUpOpen] = useState(false)
  const [upBusy, setUpBusy] = useState(false)
  const [upPct, setUpPct] = useState(0)
  const [up, setUp] = useState({ category: 'report', title: '', subject: '', description: '', file: null })

  const loadOverview = async () => {
    try {
      const { data } = await api.get('/teacher-documents/overview')
      if (data?.success) setTeachers(data.data.teachers || [])
    } catch (e) { toast?.error?.('Could not load the teachers overview.') }
    finally { setLoading(false) }
  }
  useEffect(() => { loadOverview() }, [])

  const openTeacher = async (t) => {
    setSel(t); setDocs([]); setDocsLoading(true)
    try {
      const { data } = await api.get('/teacher-documents/teacher/' + t._id)
      if (data?.success) setDocs(data.data.documents || [])
    } catch (e) { toast?.error?.('Could not load documents for ' + t.name + '.') }
    finally { setDocsLoading(false) }
  }

  const doUpload = async () => {
    if (!sel) return
    if (!up.file) return toast?.error?.('Choose a file first.')
    if (!up.title.trim()) return toast?.error?.('Give the document a title.')
    setUpBusy(true); setUpPct(0)
    try {
      const pr = await api.post('/teacher-documents/presign', {
        fileName: up.file.name, mimeType: up.file.type || 'application/octet-stream',
        fileSize: up.file.size, forTeacherId: sel._id,
      })
      const pd = pr.data?.data || pr.data
      if (!pd?.uploadUrl) throw new Error(pd?.message || 'Could not prepare the upload.')
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', pd.uploadUrl)
        xhr.setRequestHeader('Content-Type', up.file.type || 'application/octet-stream')
        xhr.upload.onprogress = evt => { if (evt.total) setUpPct(Math.round((evt.loaded / evt.total) * 100)) }
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error('Upload failed (' + xhr.status + ').'))
        xhr.onerror = () => reject(new Error('Upload failed. Check your connection.'))
        xhr.send(up.file)
      })
      const { data } = await api.post('/teacher-documents/confirm', {
        r2Key: pd.r2Key, category: up.category, title: up.title, subject: up.subject,
        description: up.description, fileName: up.file.name,
        mimeType: up.file.type || '', fileSize: up.file.size,
      })
      if (!data?.success) throw new Error(data?.message || 'Could not save the document.')
      toast?.ok?.('Filed under ' + LABEL[up.category] + ' for ' + sel.name + '.')
      setUpOpen(false)
      setUp(f => ({ ...f, title: '', subject: '', description: '', file: null }))
      openTeacher(sel); loadOverview()
    } catch (e) { toast?.error?.(e.message || 'Upload failed.') }
    finally { setUpBusy(false); setUpPct(0) }
  }

  const filtered = teachers.filter(t =>
    !q.trim() || t.name.toLowerCase().includes(q.trim().toLowerCase()) || t.email.toLowerCase().includes(q.trim().toLowerCase()))

  const groups = CATEGORIES
    .map(([id, label]) => [id, label, docs.filter(d => d.category === id)])
    .filter(([, , list]) => list.length > 0)

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid #E8E0D0', borderRadius: 8, fontSize: 13.5, background: '#FFFFFF', color: '#1A1A1A', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { fontSize: 11.5, fontWeight: 700, color: '#6B6B6B', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 6, display: 'block' }

  // ── Teacher detail ─────────────────────────────────────────
  if (sel) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <button onClick={() => { setSel(null); loadOverview() }} style={{ background: 'transparent', border: 'none', color: '#7D1025', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 6 }}>&larr; All teachers</button>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700, color: '#080C14' }}>{sel.name}</div>
          <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 2 }}>{sel.email}</div>
        </div>
        <button onClick={() => setUpOpen(true)} className="btn-p" style={{ border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 13.5, cursor: 'pointer' }}>
          + File a Document
        </button>
      </div>

      {docsLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 13.5 }}>Loading documents...</div>
      ) : docs.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: '#FFFFFF', border: '1px dashed #D4C9B2', borderRadius: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>No documents filed yet</div>
          <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 6 }}>This teacher has not uploaded anything, and nothing has been filed for them.</div>
        </div>
      ) : groups.map(([id, label, list]) => (
        <div key={id} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#7D1025', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 10 }}>{label} ({list.length})</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {list.map(d => {
              const filedByOther = d.uploadedBy && String(d.uploadedBy) !== String(d.teacherId)
              return (
                <div key={d._id} className="card" style={{ border: '1px solid #E8E2D6', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.35 }}>{d.title}</div>
                  <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 4 }}>
                    {[d.subject, fmtSize(d.file?.sizeBytes), fmtDate(d.createdAt)].filter(Boolean).join(' · ')}
                  </div>
                  {filedByOther && (
                    <div style={{ display: 'inline-block', marginTop: 8, background: '#FBF6E3', color: '#7A5B12', border: '1px solid #E8D58F', borderRadius: 99, padding: '2px 10px', fontSize: 10.5, fontWeight: 700 }}>
                      Filed by {d.uploadedByName || 'staff'}
                    </div>
                  )}
                  {d.description && <div style={{ fontSize: 12, color: '#3A2E2A', marginTop: 8, lineHeight: 1.5 }}>{d.description}</div>}
                  <div style={{ marginTop: 12 }}>
                    <a href={d.file?.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', background: 'rgba(125,16,37,.07)', color: '#7D1025', borderRadius: 8, padding: '8px 0', fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>Open</a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {upOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,10,8,.55)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => !upBusy && setUpOpen(false)}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #7D1025 0%, #8B1A2E 100%)', color: '#FBFAF5' }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 21 }}>File a Document for {sel.name}</div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Category</label>
                <select value={up.category} onChange={e => setUp(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                  {CATEGORIES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Title</label>
                <input value={up.title} onChange={e => setUp(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Lesson Observation Report 12 Sep" style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Subject (optional)</label>
                <input value={up.subject} onChange={e => setUp(f => ({ ...f, subject: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Notes (optional)</label>
                <textarea value={up.description} onChange={e => setUp(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>File (PDF, Word, Excel, PowerPoint, image — up to 50 MB)</label>
                <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.txt,.csv" onChange={e => setUp(f => ({ ...f, file: e.target.files?.[0] || null }))} style={{ fontSize: 13 }} />
                {up.file && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>{up.file.name} · {fmtSize(up.file.size)}</div>}
              </div>
              {upBusy && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ height: 8, background: '#F4EFEB', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: upPct + '%', background: '#7D1025', transition: 'width .2s' }} />
                  </div>
                  <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 4 }}>Uploading... {upPct}%</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button disabled={upBusy} onClick={() => setUpOpen(false)} style={{ background: '#FFFFFF', color: '#3A2E2A', border: '1.5px solid #E8E0D0', borderRadius: 9, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button disabled={upBusy} onClick={doUpload} className="btn-p" style={{ border: 'none', borderRadius: 9, padding: '10px 22px', fontSize: 13, cursor: upBusy ? 'wait' : 'pointer', opacity: upBusy ? .7 : 1 }}>
                  {upBusy ? 'Uploading...' : 'Save Document'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── Teacher list ───────────────────────────────────────────
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700, color: '#080C14' }}>Teacher Documents</div>
        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Every teacher's documentation file: schemes of work, lesson plans, records of work, assessment records and more.</div>
      </div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search a teacher by name or email..." className="fi" style={{ ...inputStyle, maxWidth: 380, marginBottom: 16 }} />
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 13.5 }}>Loading teachers...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 13.5 }}>No teachers match.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {filtered.map(t => (
            <div key={t._id} className="card" onClick={() => openTeacher(t)} style={{ border: '1px solid #E8E2D6', borderRadius: 12, padding: 16, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1A1A1A' }}>{t.name}</div>
                <div style={{ background: t.total > 0 ? 'rgba(21,128,61,.1)' : '#F4EFEB', color: t.total > 0 ? '#15803D' : '#6B7280', borderRadius: 99, padding: '3px 10px', fontSize: 11.5, fontWeight: 800 }}>
                  {t.total} doc{t.total === 1 ? '' : 's'}
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 3 }}>{t.email}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {CATEGORIES.map(([id, label]) => {
                  const n = t.categories?.[id] || 0
                  return (
                    <span key={id} style={{ background: n > 0 ? 'rgba(125,16,37,.07)' : '#FAF7F2', color: n > 0 ? '#7D1025' : '#B9AE9C', borderRadius: 6, padding: '3px 8px', fontSize: 10.5, fontWeight: 700 }}>
                      {label.split(' ')[0]} {n}
                    </span>
                  )
                })}
              </div>
              {t.latest && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 8 }}>Last filed: {fmtDate(t.latest)}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
