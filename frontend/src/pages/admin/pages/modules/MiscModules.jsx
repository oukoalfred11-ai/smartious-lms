import React, { useState, useEffect, useRef } from 'react'
import { useStore, api } from '../../../../context/ctx.jsx'
import Modal from '../../../../components/ui/Modal.jsx'
import { TOKENS } from '../shared/tokens.js'
import { fmtDate, fmtKsh } from '../shared/helpers.js'
import { ModuleIcon, PCard, PKpi, PSection } from '../shared/ui.jsx'

export function LeaveModule({ refreshKey, toast }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/leave-requests').then(r => { setRequests(r.data.requests || r.data || []); setLoading(false) }).catch(() => setLoading(false))
  }, [refreshKey])

  const updateStatus = async (id, status) => {
    try {
      await api.patch('/leave-requests/' + id, { status })
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r))
      toast.ok('Marked as ' + status)
    } catch (e) { toast.error('Update failed: ' + (e.response?.data?.message || e.message)) }
  }
  const pending = requests.filter(r => r.status === 'pending' || !r.status).length

  return (
    <>
      <PSection tag="Time Off" title="Leave" em="Requests" sub="Manage teacher leave applications"/>
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Total" value={requests.length}/>
        <PKpi label="Pending" value={pending} deltaColor={pending > 0 ? TOKENS.accentAmber : TOKENS.accentEmerald}/>
        <PKpi label="Approved" value={requests.filter(r => r.status === 'approved').length}/>
        <PKpi label="Rejected" value={requests.filter(r => r.status === 'rejected').length}/>
      </div>
      {loading ? <PCard><div style={{ padding: 48, textAlign: 'center', color: TOKENS.s500 }}>Loading...</div></PCard> : requests.length === 0 ? (
        <PCard><div style={{ padding: 48, textAlign: 'center', color: TOKENS.s500 }}>No leave requests yet</div></PCard>
      ) : (
        <PCard padding={0} style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: TOKENS.s50, borderBottom: '1px solid ' + TOKENS.s100 }}>
              {['Teacher', 'Type', 'Dates', 'Reason', 'Status', 'Actions'].map((h, i) => (
                <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: TOKENS.s500 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {requests.map(r => (
                <tr key={r._id} style={{ borderBottom: '1px solid ' + TOKENS.s100 }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{r.teacherId?.firstName} {r.teacherId?.lastName}</td>
                  <td style={{ padding: '14px 16px' }}><span style={{ display: 'inline-block', padding: '3px 10px', background: TOKENS.s50, color: TOKENS.s700, border: '1px solid ' + TOKENS.s200, borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{r.type || 'Annual'}</span></td>
                  <td style={{ padding: '14px 16px', fontSize: 12 }}>{fmtDate(r.startDate)} → {fmtDate(r.endDate)}</td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: TOKENS.s600 }}>{r.reason || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                      ...(r.status === 'approved' ? { color: TOKENS.accentEmerald, background: '#DCFCE7', border: '1px solid #86EFAC' } :
                         r.status === 'rejected' ? { color: '#991B1B', background: '#FEE2E2', border: '1px solid #FECACA' } :
                         { color: TOKENS.accentAmber, background: '#FEF3C7', border: '1px solid #FDE68A' }) }}>
                      {r.status || 'pending'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {(!r.status || r.status === 'pending') && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ok btn-sm" onClick={() => updateStatus(r._id, 'approved')}>Approve</button>
                        <button className="btn btn-d btn-sm" onClick={() => updateStatus(r._id, 'rejected')}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PCard>
      )}
    </>
  )
}

export function ProgrammesModule({ refreshKey, toast }) {
  return (
    <>
      <PSection tag="Programmes" title="IUFP &" em="Study Abroad" sub="International foundation pathways and university preparation"/>
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Programmes" value="3"/>
        <PKpi label="Enrolled" value="42"/>
        <PKpi label="Partner Universities" value="12"/>
        <PKpi label="Placement Rate" value="87%"/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {[
          { name: 'IUFP — UK Pathway', desc: 'University foundation for UK universities', enrolled: 18, fee: 250000 },
          { name: 'IUFP — North America', desc: 'College prep for US/Canada admissions', enrolled: 14, fee: 280000 },
          { name: 'IUFP — Australia/NZ', desc: 'Foundation pathway to Aus/NZ', enrolled: 10, fee: 230000 },
        ].map(p => (
          <PCard key={p.name} accent={TOKENS.accentPurple}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.gold, letterSpacing: '.08em', marginBottom: 6, textTransform: 'uppercase' }}>Programme</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, color: TOKENS.s900, marginBottom: 6, fontWeight: 600 }}>{p.name}</h3>
            <div style={{ fontSize: 13, color: TOKENS.s500, lineHeight: 1.6, marginBottom: 14 }}>{p.desc}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid ' + TOKENS.s100 }}>
              <div>
                <div style={{ fontSize: 10, color: TOKENS.s500, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Enrolled</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: TOKENS.s900 }}>{p.enrolled}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: TOKENS.s500, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Annual Fee</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: TOKENS.crimson, fontFamily: 'JetBrains Mono, monospace' }}>{fmtKsh(p.fee)}</div>
              </div>
            </div>
          </PCard>
        ))}
      </div>
    </>
  )
}

export function GroupRoomsModule({ refreshKey, toast }) {
  const store = useStore()
  const [backendRooms, setBackendRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [catalog, setCatalog] = useState({ curricula: [], gradesByCurriculum: {}, subjects: [] })
  const [teachers, setTeachers] = useState([])
  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadBackendRooms() }, [refreshKey])
  useEffect(() => {
    api.get('/curriculum/options').then(res => {
      if (res.data?.success) setCatalog({ curricula: res.data.curricula || [], gradesByCurriculum: res.data.gradesByCurriculum || {}, subjects: res.data.subjects || [] })
    }).catch(() => {})
    api.get('/users?role=teacher').then(res => { if (res.data?.users) setTeachers(res.data.users) }).catch(() => {})
  }, [])

  const loadBackendRooms = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/grouprooms')
      if (data.success) setBackendRooms(data.rooms || [])
    } catch (e) {}
    setLoading(false)
  }

  const openCreate = () => {
    setEditForm({ _id: null, name: '', subject: '', curriculum: '', grade: '', capacity: 10, schedule: '', status: 'Active', teacher: '' })
    setEditModal(true)
  }
  const openEdit = (room) => {
    setEditForm({ _id: room._id, name: room.name || '', subject: room.subject || '', curriculum: room.curriculum || '', grade: room.grade || '', capacity: room.capacity || 10, schedule: room.schedule || '', status: room.status || 'Active', teacher: typeof room.teacher === 'object' && room.teacher !== null ? room.teacher._id : (room.teacher || '') })
    setEditModal(true)
  }
  const closeEdit = () => { setEditModal(false); setEditForm(null) }
  const updateForm = (k, v) => setEditForm(f => ({ ...f, [k]: v }))

  const saveRoom = async () => {
    if (!editForm.name?.trim()) { toast?.error?.('Room name is required'); return }
    if (!editForm.subject) { toast?.error?.('Subject is required'); return }
    if (!editForm.curriculum) { toast?.error?.('Curriculum is required'); return }
    if (!editForm.grade) { toast?.error?.('Grade is required'); return }
    const payload = { name: editForm.name.trim(), subject: editForm.subject, curriculum: editForm.curriculum, grade: editForm.grade, capacity: parseInt(editForm.capacity) || 10, schedule: editForm.schedule || '', status: editForm.status || 'Active', teacher: editForm.teacher || null }
    setSaving(true)
    try {
      let result
      if (editForm._id) result = await api.patch('/grouprooms/' + editForm._id, payload)
      else result = await api.post('/grouprooms', payload)
      if (result.data?.success) { toast?.ok?.(result.data.message || 'Room saved'); await loadBackendRooms(); closeEdit() }
    } catch (e) { toast?.error?.(e.response?.data?.message || 'Save failed') }
    setSaving(false)
  }

  const handleDelete = async (room) => {
    if (!confirm('Delete "' + room.name + '"?')) return
    try {
      const { data } = await api.delete('/grouprooms/' + room._id)
      if (data.success) { toast?.ok?.('Room deleted'); await loadBackendRooms() }
    } catch (e) { toast?.error?.('Delete failed') }
  }

  const availableGrades = editForm ? (catalog.gradesByCurriculum[editForm.curriculum] || []) : []
  const availableSubjects = editForm ? catalog.subjects.filter(s => s.availableIn === 'all' || (Array.isArray(s.availableIn) && s.availableIn.includes(editForm.curriculum))) : []
  const subjectsByCategory = availableSubjects.reduce((acc, s) => { if (!acc[s.category]) acc[s.category] = []; acc[s.category].push(s); return acc }, {})
  const matchingTeachers = editForm ? teachers.filter(t => {
    if (!t.curriculum || !t.subjects) return true
    const teacherCurricula = Array.isArray(t.curriculum) ? t.curriculum : [t.curriculum]
    const matchCurr = teacherCurricula.includes(editForm.curriculum)
    const matchSubj = !editForm.subject || (Array.isArray(t.subjects) && t.subjects.includes(editForm.subject))
    return matchCurr && matchSubj
  }) : []

  return (
    <>
      <PSection tag="Cohort Spaces" title="Group" em="Rooms" sub="Persistent classrooms · Auto-enrollment based on curriculum + grade + subjects"
        action={<button onClick={openCreate} className="btn btn-p btn-sm">+ New Room</button>}
      />
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Total Rooms" value={backendRooms.length}/>
        <PKpi label="Members" value={backendRooms.reduce((sum, r) => sum + (r.students?.length || 0), 0)}/>
        <PKpi label="Subjects" value={new Set(backendRooms.map(r => r.subject)).size}/>
        <PKpi label="Live Now" value={backendRooms.filter(r => r.zoomLink && r.zoomStartedAt).length} deltaColor={TOKENS.accentRose}/>
      </div>

      {loading ? <PCard><div style={{ padding: 48, textAlign: 'center', color: TOKENS.s500 }}>Loading rooms...</div></PCard> : backendRooms.length === 0 ? (
        <PCard><div style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: TOKENS.s700 }}>No group rooms yet</div>
          <div style={{ fontSize: 13, color: TOKENS.s500, marginTop: 6 }}>Click + New Room to create one</div>
        </div></PCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {backendRooms.map(room => {
            const enrolled = room.students?.length || 0
            const capacity = room.capacity || 10
            const isLive = room.zoomLink && room.zoomStartedAt
            return (
              <PCard key={room._id} accent={isLive ? TOKENS.accentRose : TOKENS.accentOcean}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 17, color: TOKENS.s900, margin: 0 }}>{room.name}</h3>
                    <div style={{ fontSize: 12, color: TOKENS.s500, marginTop: 2 }}>{room.subject} · {room.curriculum || '—'} {room.grade ? '· ' + room.grade : ''}</div>
                  </div>
                  {isLive && <span style={{ background: TOKENS.accentRose, color: TOKENS.white, fontSize: 9, fontWeight: 800, padding: '3px 9px', borderRadius: 99, letterSpacing: '.08em' }}>● LIVE</span>}
                </div>
                <div style={{ fontSize: 12, color: TOKENS.s500, marginBottom: 12 }}>{room.schedule || 'No schedule set'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: TOKENS.s500, marginBottom: 14 }}>
                  <span>{enrolled}/{capacity} students</span>
                  <div style={{ flex: 1, height: 4, background: TOKENS.s100, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: Math.min(100, (enrolled / capacity) * 100) + '%', background: enrolled >= capacity ? '#DC2626' : TOKENS.accentEmerald, borderRadius: 99 }}/>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, paddingTop: 12, borderTop: '1px solid ' + TOKENS.s100 }}>
                  <button onClick={() => openEdit(room)} className="btn btn-s btn-sm" style={{ flex: 1 }}>Edit</button>
                  <button onClick={() => handleDelete(room)} className="btn btn-d btn-sm" style={{ flex: 1 }}>Delete</button>
                </div>
              </PCard>
            )
          })}
        </div>
      )}

      {editModal && editForm && (
        <Modal open={editModal} onClose={closeEdit} title={editForm._id ? 'Edit Room' : 'Create New Room'} size="lg"
          footer={<><button className="btn btn-s" onClick={closeEdit} disabled={saving}>Cancel</button><button className="btn btn-p" onClick={saveRoom} disabled={saving}>{saving ? 'Saving...' : (editForm._id ? 'Update' : 'Create')}</button></>}>
          <div>
            <div className="fg"><label className="fl">Room Name *</label>
              <input className="fi" value={editForm.name} onChange={e => updateForm('name', e.target.value)} placeholder="e.g. Mathematics A" autoFocus/></div>
            <div className="fr2">
              <div className="fg"><label className="fl">Curriculum *</label>
                <select className="fsel" value={editForm.curriculum} onChange={e => { updateForm('curriculum', e.target.value); updateForm('grade', ''); updateForm('subject', '') }}>
                  <option value="">Select...</option>
                  {catalog.curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select></div>
              <div className="fg"><label className="fl">Grade *</label>
                <select className="fsel" value={editForm.grade} onChange={e => updateForm('grade', e.target.value)} disabled={!editForm.curriculum}>
                  <option value="">{editForm.curriculum ? 'Select grade...' : 'Select curriculum first'}</option>
                  {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select></div>
            </div>
            <div className="fg"><label className="fl">Subject *</label>
              <select className="fsel" value={editForm.subject} onChange={e => updateForm('subject', e.target.value)} disabled={!editForm.curriculum}>
                <option value="">{editForm.curriculum ? 'Select subject...' : 'Select curriculum first'}</option>
                {Object.entries(subjectsByCategory).map(([cat, subs]) => (
                  <optgroup key={cat} label={cat}>{subs.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</optgroup>
                ))}
              </select></div>
            <div className="fg"><label className="fl">Teacher</label>
              <select className="fsel" value={editForm.teacher} onChange={e => updateForm('teacher', e.target.value)}>
                <option value="">No teacher assigned</option>
                {matchingTeachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
              </select></div>
            <div className="fr2">
              <div className="fg"><label className="fl">Capacity</label>
                <input className="fi" type="number" min="1" max="100" value={editForm.capacity} onChange={e => updateForm('capacity', e.target.value)}/></div>
              <div className="fg"><label className="fl">Status</label>
                <select className="fsel" value={editForm.status} onChange={e => updateForm('status', e.target.value)}><option>Active</option><option>Inactive</option></select></div>
            </div>
            <div className="fg"><label className="fl">Schedule</label>
              <input className="fi" value={editForm.schedule} onChange={e => updateForm('schedule', e.target.value)} placeholder="e.g. Mon/Wed 10:00–11:00 AM"/></div>
          </div>
        </Modal>
      )}
    </>
  )
}

export function WebsiteModule({ refreshKey, toast }) {
  const store = useStore()
  const [site, setSite] = useState({ ...store.siteConfig })
  const [tab, setTab] = useState('content')
  const [saving, setSaving] = useState(false)
  const upd = (k, v) => setSite(p => ({ ...p, [k]: v }))
  const save = () => { setSaving(true); setTimeout(() => { store.updateSiteConfig(site); setSaving(false); toast.ok('Saved') }, 500) }

  return (
    <>
      <PSection tag="CMS" title="Website" em="Editor" sub="Edit landing page content · click Open Live Site to verify"
        action={<><button className="btn btn-s btn-sm" onClick={() => window.open('https://smartioushomeschool.com', '_blank', 'noopener')}>Open Live Site</button>{' '}<button className="btn btn-p btn-sm" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}
      />
      <PCard>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: TOKENS.s50, borderRadius: 8, marginBottom: 18, maxWidth: 400 }}>
          {[['content', 'Content'], ['stats', 'Stats'], ['contact', 'Contact']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: '8px 12px', borderRadius: 6,
              background: tab === id ? TOKENS.white : 'transparent',
              border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
              color: tab === id ? TOKENS.crimson : TOKENS.s500,
              boxShadow: tab === id ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
            }}>{label}</button>
          ))}
        </div>
        {tab === 'content' && (
          <>
            <div className="fg"><label className="fl">School Name</label><input className="fi" value={site.schoolName || ''} onChange={e => upd('schoolName', e.target.value)}/></div>
            <div className="fg"><label className="fl">Headline</label><input className="fi" value={site.headline || ''} onChange={e => upd('headline', e.target.value)}/></div>
            <div className="fg"><label className="fl">Subheadline</label><textarea className="fi" rows={3} value={site.subheadline || ''} onChange={e => upd('subheadline', e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }}/></div>
            <div className="fg"><label className="fl">About Text</label><textarea className="fi" rows={5} value={site.aboutText || ''} onChange={e => upd('aboutText', e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }}/></div>
          </>
        )}
        {tab === 'stats' && [1, 2, 3, 4].map(n => (
          <div key={n} className="fg"><label className="fl">Stat {n}</label><input className="fi" value={site['stat' + n] || ''} onChange={e => upd('stat' + n, e.target.value)}/></div>
        ))}
        {tab === 'contact' && (
          <>
            <div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={site.footerEmail || ''} onChange={e => upd('footerEmail', e.target.value)}/></div>
            <div className="fg"><label className="fl">Phone</label><input className="fi" type="tel" value={site.footerPhone || ''} onChange={e => upd('footerPhone', e.target.value)}/></div>
            <div className="fg"><label className="fl">WhatsApp</label><input className="fi" type="tel" value={site.whatsapp || ''} onChange={e => upd('whatsapp', e.target.value)}/></div>
            <div className="fg"><label className="fl">Address</label><textarea className="fi" rows={2} value={site.footerAddress || ''} onChange={e => upd('footerAddress', e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }}/></div>
          </>
        )}
      </PCard>
    </>
  )
}

export function MshauriModule({ refreshKey, toast }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm Mshauri, your Smartious teaching assistant. Ask me to generate questions, explain concepts, draft messages, or help plan lessons. What would you like to do?" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    try {
      const pending = localStorage.getItem('sm_mshauri_pending_prompt')
      if (pending && pending.trim()) { setInput(pending); localStorage.removeItem('sm_mshauri_pending_prompt') }
    } catch {}
  }, [])

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setInput('')
    setLoading(true)
    const endpoints = ['/mshauri', '/auth/mshauri', '/ai/mshauri', '/admin/mshauri']
    let success = false
    let lastError = null
    for (const ep of endpoints) {
      try {
        const res = await api.post(ep, { message: userMsg, prompt: userMsg })
        const reply = res.data.reply || res.data.message || res.data.response || res.data.text || 'No response'
        setMessages(m => [...m, { role: 'assistant', text: reply }])
        success = true
        break
      } catch (e) { lastError = e; if (e.response?.status !== 404) break }
    }
    if (!success) {
      const status = lastError?.response?.status
      const msg = status === 404 ? 'Mshauri AI is not yet wired to the backend. The frontend is ready, but no /api/mshauri endpoint exists yet.' : 'Could not reach Mshauri AI.'
      setMessages(m => [...m, { role: 'assistant', text: msg }])
    }
    setLoading(false)
  }

  return (
    <>
      <PSection tag="AI Assistant" title="" em="Mshauri AI" sub="Powered by Claude · ask anything about teaching, curriculum, or operations"/>
      <PCard style={{ background: 'linear-gradient(135deg, ' + TOKENS.crimson + ' 0%, ' + TOKENS.crimsonDeep + ' 100%)', color: TOKENS.white, border: 'none', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 540 }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <ModuleIcon kind="ai" size={40} accent={TOKENS.goldLight}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Mshauri AI Console</div>
            <div style={{ fontSize: 11, opacity: .7 }}>Model: claude-sonnet-4 · {messages.filter(m => m.role === 'user').length} messages this session</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: TOKENS.goldLight }}>● ONLINE</span>
        </div>
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: m.role === 'user' ? 'rgba(201,160,48,.25)' : 'rgba(255,255,255,.08)', fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.text}</div>
            </div>
          ))}
          {loading && <div style={{ padding: '10px 14px', color: 'rgba(255,255,255,.6)', fontSize: 12 }}>Mshauri is thinking...</div>}
        </div>
        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,.1)', display: 'flex', gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder="Ask Mshauri anything..." disabled={loading}
            style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, color: TOKENS.white, fontSize: 14, outline: 'none' }}/>
          <button onClick={send} disabled={loading || !input.trim()} style={{ background: TOKENS.gold, color: TOKENS.crimsonDeep, border: 'none', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', opacity: loading || !input.trim() ? .5 : 1 }}>Send</button>
        </div>
      </PCard>
    </>
  )
}

export function SuggestionsModule({ toast, refreshKey }) {
  const [data, setData] = useState(null)
  const [statusF, setStatusF] = useState('all')
  const load = useCallback(() => {
    api.get('/suggestions', { params: { status: statusF } })
      .then(r => setData(r.data?.data || { suggestions: [], newCount: 0 }))
      .catch(() => toast?.error?.('Failed to load suggestions.'))
  }, [statusF, refreshKey])
  useEffect(() => { load() }, [load])
  if (data === null) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading suggestions...</div>
  const CAT = { academics: 'Academics', teaching: 'Teaching', portal: 'Portal', fees: 'Fees', wellbeing: 'Wellbeing', other: 'Other' }
  const markReviewed = async (id) => {
    try { await api.patch('/suggestions/' + id + '/reviewed'); load() }
    catch { toast?.error?.('Failed to update.') }
  }
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ background: TOKENS.crimson, color: '#fff', fontWeight: 800, fontSize: 13, padding: '6px 14px', borderRadius: 999 }}>
          {data.newCount} new
        </div>
        <select value={statusF} onChange={e => setStatusF(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid ' + TOKENS.line, borderRadius: 8, fontSize: 13 }}>
          <option value="all">All suggestions</option>
          <option value="new">New only</option>
          <option value="reviewed">Reviewed</option>
        </select>
      </div>
      <div style={{ background: '#fff', border: '1px solid ' + TOKENS.line, borderRadius: 14, overflow: 'hidden' }}>
        {data.suggestions.length === 0 ? (
          <div style={{ padding: 36, textAlign: 'center', color: '#6B7280', fontSize: 13.5 }}>No suggestions in this view.</div>
        ) : data.suggestions.map(sug => (
          <div key={sug._id} style={{ padding: '14px 18px', borderBottom: '1px solid ' + TOKENS.line, background: sug.status === 'new' ? '#FFFBF5' : '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{sug.fromName || 'Anonymous'}</span>
              <span style={{ fontSize: 11, color: '#6B7280' }}>{sug.fromRole}</span>
              <span style={{ background: '#F3E7CB', color: '#7D1025', fontSize: 10.5, fontWeight: 700, padding: '2px 9px', borderRadius: 999 }}>{CAT[sug.category] || 'Other'}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' }}>
                {new Date(sug.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
              {sug.status === 'new'
                ? <button onClick={() => markReviewed(sug._id)} style={{ fontSize: 11, background: '#065F46', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontWeight: 700 }}>Mark reviewed</button>
                : <span style={{ fontSize: 11, color: '#065F46', fontWeight: 700 }}>Reviewed</span>}
            </div>
            <div style={{ fontSize: 13, color: '#374151', marginTop: 8, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{sug.message}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
