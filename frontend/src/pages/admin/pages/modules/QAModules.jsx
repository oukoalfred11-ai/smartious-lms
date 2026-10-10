/**
 * QAModules.jsx — the QA portal's showcase modules.
 * ============================================================
 *   TeacherProfilesModule — every teacher's profile and filed
 *     documents in one place, for accreditation reviewers.
 *   TDPModule — Teacher Development Programme: trainings run for
 *     teachers, with photos, details and attendance.
 *   AccreditationsModule — the school's accreditations and
 *     licenses, well arranged with uploaded certificates and
 *     validity status.
 * Reads work for QA, admin, ops, dos; adding and editing for
 * admin, ops, dos and qa (server enforced).
 */
import React, { useState, useEffect, useMemo } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { PCard, PSection } from '../shared/ui.jsx'

const CR = TOKENS.crimson || '#7D1025'
const GOLD = TOKENS.gold || '#C9A030'
const LINE = TOKENS.line || '#E8E2D6'

const inp = { width: '100%', boxSizing: 'border-box', border: '1.5px solid ' + LINE, borderRadius: 8, padding: '9px 11px', fontSize: 12.5, outline: 'none', fontFamily: 'inherit' }
const btnP = { background: CR, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }
const btnG = { background: '#fff', color: TOKENS.s700 || '#374151', border: '1.5px solid ' + LINE, borderRadius: 9, padding: '9px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }
const chip = (bg, fg) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 10.5, fontWeight: 800, background: bg, color: fg, letterSpacing: '.04em' })

const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

// Shared evidence uploader: presign, PUT to R2, hand back the record.
async function uploadEvidence(file, kind, toast) {
  try {
    const { data } = await api.post('/qa/uploads/presign', {
      fileName: file.name, mimeType: file.type, fileSize: file.size, kind,
    })
    if (!data?.success) { toast?.error?.(data?.message || 'Upload refused.'); return null }
    const put = await fetch(data.data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file })
    if (!put.ok) { toast?.error?.('Upload failed (' + put.status + ').'); return null }
    return { url: data.data.publicUrl, key: data.data.r2Key, name: file.name }
  } catch (e) {
    toast?.error?.(e?.response?.data?.message || 'Upload failed.')
    return null
  }
}

// ═══════════════════════════════════════════════════════════
// 1. TEACHER PROFILES
// ═══════════════════════════════════════════════════════════
export function TeacherProfilesModule({ toast }) {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState(null)        // selected teacher
  const [docs, setDocs] = useState(null)      // their documents
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/users', { params: { role: 'teacher' } })
      .then(r => setTeachers((r.data?.users || []).filter(u => u.role === 'teacher')))
      .catch(() => toast?.error?.('Could not load teachers.'))
      .finally(() => setLoading(false))
  }, [])

  const open = async (t) => {
    setSel(t); setDocs(null)
    try {
      const { data } = await api.get('/teacher-documents/teacher/' + t._id)
      setDocs(data?.data?.documents || data?.documents || [])
    } catch { setDocs([]) }
  }

  const list = teachers.filter(t => !search || ((t.firstName || '') + ' ' + (t.lastName || '')).toLowerCase().includes(search.toLowerCase()))

  if (sel) {
    const byCat = {}
    for (const d of (docs || [])) { (byCat[d.category] = byCat[d.category] || []).push(d) }
    return (
      <>
        <PSection tag="QA Portal" title="Teacher" em="Profile" sub="Profile, qualifications and the documents this teacher has filed."/>
        <button onClick={() => { setSel(null); setDocs(null) }} style={{ ...btnG, marginBottom: 14 }}>Back to all teachers</button>
        <PCard>
          <div style={{ display: 'flex', gap: 18, padding: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: 86, height: 86, borderRadius: 18, overflow: 'hidden', background: 'linear-gradient(135deg,' + CR + ',#3D0712)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, fontSize: 30, fontWeight: 800 }}>
              {sel.avatar ? <img src={sel.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ((sel.firstName || '?')[0] || '?')}
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: TOKENS.s900 }}>{sel.firstName} {sel.lastName}</div>
              <div style={{ fontSize: 12.5, color: TOKENS.s500, marginTop: 2 }}>{sel.jobTitle || 'Teacher'}{sel.yearsOfExperience ? ' · ' + sel.yearsOfExperience + ' years experience' : ''}</div>
              {sel.bio && <div style={{ fontSize: 13, color: TOKENS.s700, marginTop: 10, lineHeight: 1.65, maxWidth: 640 }}>{sel.bio}</div>}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                {(sel.teachingSpecialties || []).map((s, i) => (
                  <span key={i} style={chip('#FDF2F4', CR)}>{s.subjectId?.subjectName || s.subjectName || s.curriculum || 'Specialty'}</span>
                ))}
              </div>
              {(sel.qualifications || []).length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: GOLD, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 5 }}>Qualifications</div>
                  {(sel.qualifications || []).map((q, i) => <div key={i} style={{ fontSize: 12.5, color: TOKENS.s700, padding: '2px 0' }}>{typeof q === 'string' ? q : (q.title || q.name || '')}</div>)}
                </div>
              )}
            </div>
          </div>
        </PCard>
        <div style={{ height: 14 }} />
        <PCard>
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: CR, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.08em' }}>Filed documents {docs ? '(' + docs.length + ')' : ''}</div>
            {docs === null && <div style={{ color: TOKENS.s500, fontSize: 13 }}>Loading documents...</div>}
            {docs !== null && docs.length === 0 && <div style={{ color: TOKENS.s500, fontSize: 13 }}>No documents filed yet.</div>}
            {Object.entries(byCat).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: TOKENS.s700, marginBottom: 6 }}>{cat} <span style={{ color: TOKENS.s400, fontWeight: 600 }}>({items.length})</span></div>
                {items.map(d => (
                  <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', border: '1px solid ' + LINE, borderRadius: 9, marginBottom: 6 }}>
                    <span style={{ flex: 1, fontSize: 12.5, color: TOKENS.s900, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title || d.fileName}</span>
                    {d.filedByStaff && <span style={chip(TOKENS.goldPale || '#FBF6E3', '#92400E')}>Filed by staff</span>}
                    <span style={{ fontSize: 11, color: TOKENS.s400 }}>{fmtD(d.createdAt)}</span>
                    <a href={d.fileUrl || d.url} target="_blank" rel="noreferrer" style={{ ...btnG, padding: '5px 12px', fontSize: 11.5, textDecoration: 'none' }}>Open</a>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </PCard>
      </>
    )
  }

  return (
    <>
      <PSection tag="QA Portal" title="Teacher" em="Profiles" sub="Every teacher with their profile and filed documents, one click deep."/>
      <input style={{ ...inp, maxWidth: 320, marginBottom: 16 }} placeholder="Search teachers..." value={search} onChange={e => setSearch(e.target.value)} />
      {loading ? <div style={{ color: TOKENS.s500, fontSize: 13 }}>Loading teachers...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
          {list.map(t => (
            <PCard key={t._id}>
              <button onClick={() => open(t)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 16, cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 13, overflow: 'hidden', background: 'linear-gradient(135deg,' + CR + ',#3D0712)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, fontSize: 19, fontWeight: 800 }}>
                    {t.avatar ? <img src={t.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ((t.firstName || '?')[0] || '?')}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: TOKENS.s900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.firstName} {t.lastName}</div>
                    <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>{t.jobTitle || 'Teacher'}</div>
                  </div>
                </div>
              </button>
            </PCard>
          ))}
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// 2. TEACHER DEVELOPMENT PROGRAMME (TDP)
// ═══════════════════════════════════════════════════════════
const emptyTraining = { title: '', provider: '', trainingDate: '', durationHours: '', mode: 'In person', description: '', attendees: [], photos: [], files: [] }

export function TDPModule({ toast }) {
  const [rows, setRows] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)       // training form state
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = () => api.get('/qa/trainings')
    .then(r => setRows(r.data?.data?.trainings || []))
    .catch(() => toast?.error?.('Could not load trainings.'))
    .finally(() => setLoading(false))
  useEffect(() => {
    load()
    api.get('/users', { params: { role: 'teacher' } })
      .then(r => setTeachers((r.data?.users || []).filter(u => u.role === 'teacher')))
      .catch(() => {})
  }, [])

  const save = async () => {
    if (!modal.title.trim() || !modal.trainingDate) { toast?.error?.('Title and date are required.'); return }
    setSaving(true)
    try {
      const payload = { ...modal, durationHours: Number(modal.durationHours) || 0 }
      const { data } = modal._id
        ? await api.patch('/qa/trainings/' + modal._id, payload)
        : await api.post('/qa/trainings', payload)
      if (data?.success) { toast?.ok?.('Training saved.'); setModal(null); load() }
      else toast?.error?.(data?.message || 'Save failed.')
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Save failed.') }
    finally { setSaving(false) }
  }

  const remove = async (t) => {
    if (!window.confirm('Delete the training "' + t.title + '" and its photos?')) return
    try { await api.delete('/qa/trainings/' + t._id); toast?.ok?.('Deleted.'); load() }
    catch { toast?.error?.('Could not delete.') }
  }

  const addMedia = async (files, field) => {
    setUploading(true)
    for (const f of Array.from(files).slice(0, 10)) {
      const rec = await uploadEvidence(f, 'training', toast)
      if (rec) setModal(m => ({ ...m, [field]: [...m[field], field === 'photos' ? { url: rec.url, key: rec.key, caption: '' } : rec] }))
    }
    setUploading(false)
  }

  const toggleAttendee = (id) => setModal(m => ({
    ...m, attendees: m.attendees.includes(id) ? m.attendees.filter(x => x !== id) : [...m.attendees, id],
  }))

  return (
    <>
      <PSection tag="QA Portal" title="Teacher Development" em="Programme" sub="Every training delivered to our teachers, with photos, details and attendance."/>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <button style={btnP} onClick={() => setModal({ ...emptyTraining })}>+ Record a training</button>
        <span style={{ fontSize: 12, color: TOKENS.s500 }}>{rows.length} training{rows.length === 1 ? '' : 's'} on record</span>
      </div>

      {loading ? <div style={{ color: TOKENS.s500, fontSize: 13 }}>Loading...</div> :
        rows.length === 0 ? <PCard><div style={{ padding: 30, textAlign: 'center', color: TOKENS.s500, fontSize: 13 }}>No trainings recorded yet. Record the first one.</div></PCard> :
        rows.map(t => (
          <PCard key={t._id}>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: TOKENS.s900 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: TOKENS.s500, marginTop: 3 }}>
                    {fmtD(t.trainingDate)}{t.provider ? ' · ' + t.provider : ''}{t.durationHours ? ' · ' + t.durationHours + ' hours' : ''} · {t.mode}
                  </div>
                  {t.description && <div style={{ fontSize: 12.5, color: TOKENS.s700, marginTop: 8, lineHeight: 1.6 }}>{t.description}</div>}
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 10 }}>
                    {(t.attendees || []).map(a => <span key={a._id} style={chip('#FDF2F4', CR)}>{a.firstName} {a.lastName}</span>)}
                    {(t.attendees || []).length === 0 && <span style={{ fontSize: 11.5, color: TOKENS.s400 }}>No attendees tagged</span>}
                  </div>
                  {(t.files || []).length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                      {t.files.map((f, i) => <a key={i} href={f.url} target="_blank" rel="noreferrer" style={{ ...btnG, padding: '4px 11px', fontSize: 11, textDecoration: 'none' }}>{f.name || 'File ' + (i + 1)}</a>)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={btnG} onClick={() => setModal({ ...emptyTraining, ...t, trainingDate: t.trainingDate ? String(t.trainingDate).slice(0, 10) : '', attendees: (t.attendees || []).map(a => a._id || a) })}>Edit</button>
                  <button style={{ ...btnG, color: '#B91C1C', borderColor: '#FCA5A5' }} onClick={() => remove(t)}>Delete</button>
                </div>
              </div>
              {(t.photos || []).length > 0 && (
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 12 }}>
                  {t.photos.map((p, i) => (
                    <a key={i} href={p.url} target="_blank" rel="noreferrer" style={{ flexShrink: 0 }}>
                      <img src={p.url} alt={p.caption || 'Training photo'} style={{ width: 120, height: 86, objectFit: 'cover', borderRadius: 10, border: '1px solid ' + LINE }} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </PCard>
        ))}

      {modal && (
        <div onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: 'min(640px,100%)', maxHeight: '92vh', overflowY: 'auto', padding: 20, display: 'grid', gap: 10 }}>
            <b style={{ fontSize: 15, color: TOKENS.s900 }}>{modal._id ? 'Edit training' : 'Record a training'}</b>
            <input style={inp} placeholder="Training title *" value={modal.title} onChange={e => setModal(m => ({ ...m, title: e.target.value }))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input style={inp} placeholder="Provider / facilitator" value={modal.provider} onChange={e => setModal(m => ({ ...m, provider: e.target.value }))} />
              <input style={inp} type="date" value={modal.trainingDate} onChange={e => setModal(m => ({ ...m, trainingDate: e.target.value }))} />
              <input style={inp} type="number" min="0" placeholder="Duration (hours)" value={modal.durationHours} onChange={e => setModal(m => ({ ...m, durationHours: e.target.value }))} />
              <select style={inp} value={modal.mode} onChange={e => setModal(m => ({ ...m, mode: e.target.value }))}>
                <option>In person</option><option>Online</option><option>Blended</option>
              </select>
            </div>
            <textarea style={{ ...inp, resize: 'vertical' }} rows={3} placeholder="What the training covered" value={modal.description} onChange={e => setModal(m => ({ ...m, description: e.target.value }))} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: TOKENS.s500, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Teachers who attended</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 130, overflowY: 'auto' }}>
                {teachers.map(t => {
                  const on = modal.attendees.includes(t._id)
                  return (
                    <button key={t._id} onClick={() => toggleAttendee(t._id)} style={{ ...chip(on ? CR : '#F3F4F6', on ? '#fff' : TOKENS.s700), border: 'none', cursor: 'pointer', padding: '6px 12px' }}>
                      {t.firstName} {t.lastName}
                    </button>
                  )
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ ...btnG, display: 'inline-block' }}>
                {uploading ? 'Uploading...' : '+ Photos'}
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { addMedia(e.target.files, 'photos'); e.target.value = '' }} />
              </label>
              <label style={{ ...btnG, display: 'inline-block' }}>
                + Files (programme, certificates)
                <input type="file" accept="application/pdf,image/*,.doc,.docx" multiple style={{ display: 'none' }} onChange={e => { addMedia(e.target.files, 'files'); e.target.value = '' }} />
              </label>
              <span style={{ fontSize: 11.5, color: TOKENS.s500 }}>{modal.photos.length} photo(s), {modal.files.length} file(s)</span>
            </div>
            {modal.photos.length > 0 && (
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
                {modal.photos.map((p, i) => (
                  <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={p.url} alt="" style={{ width: 84, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid ' + LINE }} />
                    <button onClick={() => setModal(m => ({ ...m, photos: m.photos.filter((_, j) => j !== i) }))}
                      style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', border: 'none', background: '#B91C1C', color: '#fff', fontSize: 11, cursor: 'pointer', lineHeight: '20px', padding: 0 }}>x</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={btnG} onClick={() => setModal(null)}>Cancel</button>
              <button style={btnP} disabled={saving || uploading} onClick={save}>{saving ? 'Saving...' : 'Save training'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// 3. SCHOOL ACCREDITATIONS
// ═══════════════════════════════════════════════════════════
const emptyAcc = { name: '', body: '', type: 'Accreditation', certificateNumber: '', issuedAt: '', expiresAt: '', notes: '', documents: [] }

const accStatus = (a) => {
  if (!a.expiresAt) return { label: 'No expiry', bg: '#F3F4F6', fg: '#374151' }
  const days = Math.ceil((new Date(a.expiresAt) - Date.now()) / 86400000)
  if (days < 0) return { label: 'Expired ' + fmtD(a.expiresAt), bg: '#FEE2E2', fg: '#B91C1C' }
  if (days <= 90) return { label: 'Expires in ' + days + ' days', bg: '#FEF3C7', fg: '#92400E' }
  return { label: 'Valid until ' + fmtD(a.expiresAt), bg: '#DCFCE7', fg: '#15803D' }
}

export function AccreditationsModule({ toast }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = () => api.get('/qa/accreditations')
    .then(r => setRows(r.data?.data?.accreditations || []))
    .catch(() => toast?.error?.('Could not load accreditations.'))
    .finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!modal.name.trim()) { toast?.error?.('Name is required.'); return }
    setSaving(true)
    try {
      const { data } = modal._id
        ? await api.patch('/qa/accreditations/' + modal._id, modal)
        : await api.post('/qa/accreditations', modal)
      if (data?.success) { toast?.ok?.('Saved.'); setModal(null); load() }
      else toast?.error?.(data?.message || 'Save failed.')
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Save failed.') }
    finally { setSaving(false) }
  }

  const remove = async (a) => {
    if (!window.confirm('Delete "' + a.name + '" and its certificate files?')) return
    try { await api.delete('/qa/accreditations/' + a._id); toast?.ok?.('Deleted.'); load() }
    catch { toast?.error?.('Could not delete.') }
  }

  const addDocs = async (files) => {
    setUploading(true)
    for (const f of Array.from(files).slice(0, 10)) {
      const rec = await uploadEvidence(f, 'accreditation', toast)
      if (rec) setModal(m => ({ ...m, documents: [...m.documents, rec] }))
    }
    setUploading(false)
  }

  const groups = useMemo(() => {
    const g = {}
    for (const a of rows) (g[a.type || 'Other'] = g[a.type || 'Other'] || []).push(a)
    return g
  }, [rows])

  return (
    <>
      <PSection tag="QA Portal" title="School" em="Accreditations" sub="Our accreditations, licenses and registrations with their certificates, arranged for review."/>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <button style={btnP} onClick={() => setModal({ ...emptyAcc })}>+ Add accreditation or license</button>
        <span style={{ fontSize: 12, color: TOKENS.s500 }}>{rows.length} on record</span>
      </div>

      {loading ? <div style={{ color: TOKENS.s500, fontSize: 13 }}>Loading...</div> :
        rows.length === 0 ? <PCard><div style={{ padding: 30, textAlign: 'center', color: TOKENS.s500, fontSize: 13 }}>Nothing recorded yet. Add the first certificate.</div></PCard> :
        Object.entries(groups).map(([type, items]) => (
          <div key={type} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: CR, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>{type}s</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
              {items.map(a => {
                const st = accStatus(a)
                return (
                  <PCard key={a._id}>
                    <div style={{ padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                        <div style={{ fontSize: 14.5, fontWeight: 800, color: TOKENS.s900 }}>{a.name}</div>
                        <span style={chip(st.bg, st.fg)}>{st.label}</span>
                      </div>
                      <div style={{ fontSize: 12, color: TOKENS.s500, marginTop: 4 }}>
                        {a.body || 'Issuing body not set'}{a.certificateNumber ? ' · No. ' + a.certificateNumber : ''}
                      </div>
                      {a.issuedAt && <div style={{ fontSize: 11.5, color: TOKENS.s400, marginTop: 3 }}>Issued {fmtD(a.issuedAt)}</div>}
                      {a.notes && <div style={{ fontSize: 12, color: TOKENS.s700, marginTop: 8, lineHeight: 1.55 }}>{a.notes}</div>}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                        {(a.documents || []).map((d, i) => (
                          <a key={i} href={d.url} target="_blank" rel="noreferrer" style={{ ...btnG, padding: '4px 11px', fontSize: 11, textDecoration: 'none' }}>{d.name || 'Certificate ' + (i + 1)}</a>
                        ))}
                        {(a.documents || []).length === 0 && <span style={{ fontSize: 11.5, color: '#B45309', fontWeight: 700 }}>No certificate uploaded</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                        <button style={{ ...btnG, padding: '5px 12px', fontSize: 11.5 }} onClick={() => setModal({ ...emptyAcc, ...a, issuedAt: a.issuedAt ? String(a.issuedAt).slice(0, 10) : '', expiresAt: a.expiresAt ? String(a.expiresAt).slice(0, 10) : '' })}>Edit</button>
                        <button style={{ ...btnG, padding: '5px 12px', fontSize: 11.5, color: '#B91C1C', borderColor: '#FCA5A5' }} onClick={() => remove(a)}>Delete</button>
                      </div>
                    </div>
                  </PCard>
                )
              })}
            </div>
          </div>
        ))}

      {modal && (
        <div onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: 'min(560px,100%)', maxHeight: '92vh', overflowY: 'auto', padding: 20, display: 'grid', gap: 10 }}>
            <b style={{ fontSize: 15, color: TOKENS.s900 }}>{modal._id ? 'Edit' : 'Add'} accreditation / license</b>
            <input style={inp} placeholder="Name, e.g. Cognia Accreditation *" value={modal.name} onChange={e => setModal(m => ({ ...m, name: e.target.value }))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input style={inp} placeholder="Issuing body" value={modal.body} onChange={e => setModal(m => ({ ...m, body: e.target.value }))} />
              <select style={inp} value={modal.type} onChange={e => setModal(m => ({ ...m, type: e.target.value }))}>
                <option>Accreditation</option><option>License</option><option>Membership</option><option>Registration</option><option>Other</option>
              </select>
              <input style={inp} placeholder="Certificate number" value={modal.certificateNumber} onChange={e => setModal(m => ({ ...m, certificateNumber: e.target.value }))} />
              <span />
              <label style={{ fontSize: 11, color: TOKENS.s500 }}>Issued<input style={inp} type="date" value={modal.issuedAt} onChange={e => setModal(m => ({ ...m, issuedAt: e.target.value }))} /></label>
              <label style={{ fontSize: 11, color: TOKENS.s500 }}>Expires (leave empty if permanent)<input style={inp} type="date" value={modal.expiresAt} onChange={e => setModal(m => ({ ...m, expiresAt: e.target.value }))} /></label>
            </div>
            <textarea style={{ ...inp, resize: 'vertical' }} rows={2} placeholder="Notes" value={modal.notes} onChange={e => setModal(m => ({ ...m, notes: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ ...btnG, display: 'inline-block' }}>
                {uploading ? 'Uploading...' : '+ Upload certificate / license'}
                <input type="file" accept="application/pdf,image/*" multiple style={{ display: 'none' }} onChange={e => { addDocs(e.target.files); e.target.value = '' }} />
              </label>
              <span style={{ fontSize: 11.5, color: TOKENS.s500 }}>{modal.documents.length} file(s)</span>
            </div>
            {modal.documents.length > 0 && modal.documents.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                <button onClick={() => setModal(m => ({ ...m, documents: m.documents.filter((_, j) => j !== i) }))} style={{ ...btnG, padding: '3px 10px', fontSize: 11, color: '#B91C1C' }}>Remove</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={btnG} onClick={() => setModal(null)}>Cancel</button>
              <button style={btnP} disabled={saving || uploading} onClick={save}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
