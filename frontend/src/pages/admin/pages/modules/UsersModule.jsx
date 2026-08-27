import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { avColor, initials } from '../shared/helpers.js'
import { Av, PCard, PKpi, PSection, PlanBadge } from '../shared/ui.jsx'

function ParentLinkSection({ studentId, toast }) {
  const [linked, setLinked]   = useState(null)   // { _id, name, email } | null
  const [loading, setLoading] = useState(true)
  const [mode, setMode]       = useState('view') // view | pickExisting | createNew
  const [working, setWorking] = useState(false)

  // pick-existing state
  const [parents, setParents] = useState([])
  const [search, setSearch]   = useState('')
  const [parentsLoaded, setParentsLoaded] = useState(false)

  // create-new state
  const [np, setNp] = useState({ firstName: '', lastName: '', email: '', phone: '' })

  // Load the student's current parent
  const loadCurrent = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/users/' + studentId)
      const student = data.user || data.data?.user || data
      const pid = (student.linkedParents && student.linkedParents[0]) || student.parentId
      if (pid) {
        // pid may be an object (populated) or an id
        if (typeof pid === 'object' && pid.firstName !== undefined) {
          setLinked({
            _id: pid._id,
            name: `${pid.firstName || ''} ${pid.lastName || ''}`.trim() || pid.email,
            email: pid.email || '',
          })
        } else {
          const pRes = await api.get('/users/' + (pid._id || pid))
          const p = pRes.data.user || pRes.data.data?.user || pRes.data
          setLinked({
            _id: p._id,
            name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email,
            email: p.email || '',
          })
        }
      } else {
        setLinked(null)
      }
    } catch (e) {
      // non-fatal
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { if (studentId) loadCurrent() }, [studentId])

  const loadParents = async () => {
    if (parentsLoaded) return
    try {
      const { data } = await api.get('/users', { params: { role: 'parent' } })
      setParents(data.users || data.data?.users || [])
      setParentsLoaded(true)
    } catch (e) {
      toast?.error?.('Failed to load parents.')
    }
  }

  const linkExisting = async (parentId) => {
    setWorking(true)
    try {
      const { data } = await api.post('/users/' + studentId + '/link-parent', { parentId })
      if (data?.success) {
        setLinked(data.data.parent)
        setMode('view')
        toast?.ok?.('Parent linked.')
      } else {
        toast?.error?.(data?.message || 'Link failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Link failed.')
    } finally {
      setWorking(false)
    }
  }

  const createAndLink = async () => {
    if (!np.firstName.trim() || !np.email.trim()) {
      toast?.error?.('Parent first name and email are required.')
      return
    }
    setWorking(true)
    try {
      const { data } = await api.post('/users/' + studentId + '/create-and-link-parent', np)
      if (data?.success) {
        setLinked(data.data.parent)
        setMode('view')
        setNp({ firstName: '', lastName: '', email: '', phone: '' })
        toast?.ok?.(data.message || 'Parent linked.')
      } else {
        toast?.error?.(data?.message || 'Failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Failed.')
    } finally {
      setWorking(false)
    }
  }

  const unlink = async () => {
    if (!window.confirm('Unlink this parent from the student?')) return
    setWorking(true)
    try {
      const { data } = await api.delete('/users/' + studentId + '/parent')
      if (data?.success) {
        setLinked(null)
        toast?.ok?.('Parent unlinked.')
      } else {
        toast?.error?.(data?.message || 'Failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Failed.')
    } finally {
      setWorking(false)
    }
  }

  const filteredParents = parents.filter(p => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const name = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase()
    return name.includes(q) || (p.email || '').toLowerCase().includes(q)
  })

  const fi = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 11px', borderRadius: 6,
    border: '1.5px solid ' + TOKENS.s100, fontSize: 13, fontFamily: 'inherit',
  }

  return (
    <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid ' + TOKENS.s100 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        Parent / Guardian
      </div>

      {loading ? (
        <div style={{ fontSize: 12.5, color: TOKENS.s400 }}>Loading…</div>
      ) : (
        <>
          {/* Current parent */}
          {linked ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', background: TOKENS.goldPale,
              border: '1px solid ' + TOKENS.gold, borderRadius: 8,
              marginBottom: mode === 'view' ? 0 : 10,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.crimson }}>{linked.name}</div>
                <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>{linked.email}</div>
              </div>
              <button type="button" onClick={unlink} disabled={working}
                style={{
                  background: 'transparent', color: '#B91C1C',
                  border: '1px solid #FCA5A5', borderRadius: 5,
                  padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}>
                Unlink
              </button>
            </div>
          ) : (
            mode === 'view' && (
              <div style={{ fontSize: 12.5, color: TOKENS.s500, marginBottom: 10 }}>
                No parent linked. Link one so they receive teacher reports and updates.
              </div>
            )
          )}

          {/* Mode switch buttons */}
          {mode === 'view' && (
            <div style={{ display: 'flex', gap: 8, marginTop: linked ? 10 : 0 }}>
              <button type="button" onClick={() => { setMode('pickExisting'); loadParents() }}
                style={{
                  background: '#fff', color: TOKENS.crimson,
                  border: '1.5px solid ' + TOKENS.crimson, borderRadius: 6,
                  padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                {linked ? 'Change Parent' : 'Link Existing Parent'}
              </button>
              <button type="button" onClick={() => setMode('createNew')}
                style={{
                  background: TOKENS.crimson, color: '#fff', border: 'none', borderRadius: 6,
                  padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                + Create New Parent
              </button>
            </div>
          )}

          {/* Pick existing */}
          {mode === 'pickExisting' && (
            <div>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search parents by name or email…" style={{ ...fi, marginBottom: 8 }}/>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid ' + TOKENS.s100, borderRadius: 6, padding: 5 }}>
                {!parentsLoaded ? (
                  <div style={{ padding: 12, fontSize: 12, color: TOKENS.s400, textAlign: 'center' }}>Loading…</div>
                ) : filteredParents.length === 0 ? (
                  <div style={{ padding: 12, fontSize: 12, color: TOKENS.s400, textAlign: 'center' }}>
                    No parent accounts found. Use "Create New Parent" instead.
                  </div>
                ) : filteredParents.map(p => (
                  <div key={p._id} onClick={() => !working && linkExisting(p._id)}
                    style={{
                      padding: '7px 10px', cursor: working ? 'wait' : 'pointer',
                      borderRadius: 4, marginBottom: 2,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = TOKENS.goldPale}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: TOKENS.s900 }}>
                      {`${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email}
                    </div>
                    <div style={{ fontSize: 11, color: TOKENS.s500 }}>{p.email}</div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setMode('view')}
                style={{
                  marginTop: 8, background: 'transparent', color: TOKENS.s500,
                  border: '1px solid ' + TOKENS.s100, borderRadius: 6,
                  padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                Cancel
              </button>
            </div>
          )}

          {/* Create new */}
          {mode === 'createNew' && (
            <div>
              <div className="fr2">
                <div className="fg">
                  <label className="fl">First Name *</label>
                  <input style={fi} value={np.firstName} onChange={e => setNp(s => ({ ...s, firstName: e.target.value }))}/>
                </div>
                <div className="fg">
                  <label className="fl">Last Name</label>
                  <input style={fi} value={np.lastName} onChange={e => setNp(s => ({ ...s, lastName: e.target.value }))}/>
                </div>
              </div>
              <div className="fr2">
                <div className="fg">
                  <label className="fl">Email *</label>
                  <input style={fi} value={np.email} onChange={e => setNp(s => ({ ...s, email: e.target.value }))}/>
                </div>
                <div className="fg">
                  <label className="fl">Phone</label>
                  <input style={fi} value={np.phone} onChange={e => setNp(s => ({ ...s, phone: e.target.value }))}/>
                </div>
              </div>
              <div style={{ fontSize: 11, color: TOKENS.s400, margin: '2px 0 10px' }}>
                A parent account is created with a temporary password, and a welcome email is sent.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setMode('view')} disabled={working}
                  style={{
                    background: 'transparent', color: TOKENS.s500,
                    border: '1px solid ' + TOKENS.s100, borderRadius: 6,
                    padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>
                  Cancel
                </button>
                <button type="button" onClick={createAndLink} disabled={working}
                  style={{
                    background: working ? '#9CA3AF' : TOKENS.crimson, color: '#fff',
                    border: 'none', borderRadius: 6,
                    padding: '7px 16px', fontSize: 12, fontWeight: 700,
                    cursor: working ? 'not-allowed' : 'pointer',
                  }}>
                  {working ? 'Saving…' : 'Create & Link'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Profile image: pick a file, we upload it and store the returned URL.
// No pasting. Falls back gracefully and shows a live preview.
function AvatarUpload({ value, onChange, toast }) {
  const [busy, setBusy] = useState(false)
  const inputRef = React.useRef(null)

  const pick = () => inputRef.current && inputRef.current.click()
  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    if (!/^image\//.test(file.type)) { toast?.error?.('Please choose an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { toast?.error?.('Image must be under 5 MB.'); return }
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (data?.success && data?.data?.avatar) { onChange(data.data.avatar); toast?.ok?.('Photo uploaded.') }
      else toast?.error?.(data?.message || 'Upload failed.')
    } catch (err) {
      toast?.error?.(err?.response?.data?.message || 'Upload failed. Try again.')
    }
    setBusy(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 54, height: 54, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        background: '#F0EDE6', border: '1.5px solid #E2DACB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {value
          ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
          : <span style={{ fontSize: 20, color: '#B7AE9E' }}>{'\u{1F464}'}</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onFile} style={{ display: 'none' }} />
        <button type="button" onClick={pick} disabled={busy}
          style={{ padding: '7px 15px', borderRadius: 8, border: '1.5px solid var(--crimson, #8B1A2E)', background: busy ? '#EDE7DD' : 'var(--crimson, #8B1A2E)', color: busy ? '#8B857C' : '#fff', fontSize: 12.5, fontWeight: 700, cursor: busy ? 'default' : 'pointer' }}>
          {busy ? 'Uploading...' : value ? 'Change photo' : 'Upload photo'}
        </button>
        {value && !busy && (
          <button type="button" onClick={() => onChange('')}
            style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #E2DACB', background: '#fff', color: '#8B857C', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
            Remove
          </button>
        )}
      </div>
    </div>
  )
}

export function UserFormFields({ userForm, setUserForm, toast }) {
  const upd = (k, v) => setUserForm(f => ({ ...f, [k]: v }))

  const [catalog, setCatalog] = useState({ curricula: [], gradesByCurriculum: {}, subjects: [] })
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [qualInput, setQualInput] = useState('')
  const [certInput, setCertInput] = useState('')
  const [specInput, setSpecInput] = useState('')
  const [admissionInput, setAdmissionInput] = useState('')
  const [admissionLooking, setAdmissionLooking] = useState(false)
  const [linkedStudentDetails, setLinkedStudentDetails] = useState([])

  useEffect(() => {
    api.get('/curriculum/options')
      .then(res => {
        if (res.data?.success) {
          setCatalog({
            curricula: res.data.curricula || [],
            gradesByCurriculum: res.data.gradesByCurriculum || {},
            subjects: res.data.subjects || [],
          })
        }
      })
      .catch(err => console.error('[catalog] load failed:', err))
      .finally(() => setCatalogLoading(false))
  }, [])

  useEffect(() => {
    if (userForm.role !== 'parent') return
    const ids = userForm.linkedStudents || []
    if (ids.length === 0) { setLinkedStudentDetails([]); return }
    api.get('/users/students/list')
      .then(res => {
        if (res.data?.success) {
          const all = res.data.students || []
          const matched = ids.map(id => {
            const idStr = typeof id === 'object' ? id._id : id
            return all.find(s => s._id === idStr || s._id?.toString() === idStr?.toString())
          }).filter(Boolean)
          setLinkedStudentDetails(matched)
        }
      })
      .catch(() => {})
  }, [userForm.role, JSON.stringify(userForm.linkedStudents)])

  const studentCurriculum = userForm.curriculum
  const availableSubjects = catalog.subjects.filter(s =>
    s.availableIn === 'all' || (Array.isArray(s.availableIn) && s.availableIn.includes(studentCurriculum))
  )
  const subjectsByCategory = availableSubjects.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})
  const availableGrades = catalog.gradesByCurriculum[studentCurriculum] || []

  const toggleSubject = (subjectName) => {
    const current = userForm.subjects || []
    if (current.includes(subjectName)) upd('subjects', current.filter(s => s !== subjectName))
    else upd('subjects', [...current, subjectName])
  }

  const handleCurriculumChange = (newCurriculum) => {
    upd('curriculum', newCurriculum)
    upd('grade', '')
    const stillValid = (userForm.subjects || []).filter(subjName => {
      const subj = catalog.subjects.find(s => s.name === subjName)
      if (!subj) return false
      return subj.availableIn === 'all' || (Array.isArray(subj.availableIn) && subj.availableIn.includes(newCurriculum))
    })
    upd('subjects', stillValid)
  }

  const addChip = (field, inputValue, setInput) => {
    const val = inputValue.trim()
    if (!val) return
    const current = userForm[field] || []
    if (current.includes(val)) { setInput(''); return }
    upd(field, [...current, val])
    setInput('')
  }
  const removeChip = (field, idx) => {
    const current = userForm[field] || []
    upd(field, current.filter((_, i) => i !== idx))
  }

  const handleAddStudent = async () => {
    const num = admissionInput.trim()
    if (!num) return
    setAdmissionLooking(true)
    try {
      const res = await api.get('/users/students/by-admission/' + encodeURIComponent(num))
      if (res.data?.success && res.data.student) {
        const student = res.data.student
        const currentIds = userForm.linkedStudents || []
        const exists = currentIds.some(id => {
          const idStr = typeof id === 'object' ? id._id : id
          return idStr?.toString() === student._id?.toString()
        })
        if (exists) {
          alert('Student is already linked')
        } else {
          upd('linkedStudents', [...currentIds, student._id])
          setLinkedStudentDetails(prev => [...prev, student])
        }
        setAdmissionInput('')
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Student not found with that admission number')
    } finally {
      setAdmissionLooking(false)
    }
  }
  const removeLinkedStudent = (studentId) => {
    const currentIds = userForm.linkedStudents || []
    upd('linkedStudents', currentIds.filter(id => {
      const idStr = typeof id === 'object' ? id._id : id
      return idStr?.toString() !== studentId?.toString()
    }))
    setLinkedStudentDetails(prev => prev.filter(s => s._id !== studentId))
  }

  const chipStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', background: '#FBE8E8', color: TOKENS.crimson,
    borderRadius: 999, fontSize: 12.5, fontWeight: 600, border: '1px solid #F4C5C5',
  }
  const chipRemoveStyle = {
    background: 'transparent', border: 'none', color: TOKENS.crimson,
    cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1, fontWeight: 700,
  }

  return (
    <div>
      <div className="fr2">
        <div className="fg">
          <label className="fl">First Name *</label>
          <input className="fi" value={userForm.firstName} onChange={e => upd('firstName', e.target.value)} placeholder="First name" autoFocus />
        </div>
        <div className="fg">
          <label className="fl">Last Name *</label>
          <input className="fi" value={userForm.lastName} onChange={e => upd('lastName', e.target.value)} placeholder="Last name" />
        </div>
      </div>

      <div className="fg">
        <label className="fl">Email Address *</label>
        <input className="fi" type="email" value={userForm.email} onChange={e => upd('email', e.target.value)} placeholder="user@example.com" />
      </div>

      <div className="fg">
        <label className="fl">Phone Number</label>
        <input className="fi" value={userForm.phone} onChange={e => upd('phone', e.target.value)} placeholder="+254 700 000000" />
      </div>

      <div className="fg">
        <label className="fl">Role *</label>
        <select className="fsel" value={userForm.role} onChange={e => upd('role', e.target.value)}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
          <optgroup label="Staff Portals">
            <option value="admin">Administrator</option>
            <option value="dos">Dean of Studies (DOS)</option>
            <option value="ops_manager">Operations Manager / COO</option>
            <option value="accountant">Accountant</option>
            <option value="sales">Sales / Front Desk</option>
          </optgroup>
        </select>
      </div>

      {userForm.role === 'student' && (
        <>
          {userForm._id && userForm.admissionNumber && (
            <div className="fg">
              <label className="fl">Admission Number</label>
              <div style={{
                padding: '10px 14px', background: TOKENS.goldPale,
                border: '1px solid ' + TOKENS.gold, borderRadius: 8,
                fontFamily: 'JetBrains Mono, monospace', fontSize: 14,
                fontWeight: 700, color: TOKENS.crimson, letterSpacing: '0.04em',
              }}>{userForm.admissionNumber}</div>
              <div style={{ fontSize: 11, color: TOKENS.s400, marginTop: 4 }}>Auto-generated. Cannot be changed.</div>
            </div>
          )}

          {/* Programme + delivery mode */}
          <div className="fr2">
            <div className="fg">
              <label className="fl">Programme</label>
              <select className="fsel" value={userForm.programme || 'Homeschool'}
                onChange={e => {
                  const p = e.target.value
                  upd('programme', p)
                  // Advisory programmes carry no curriculum/subjects — clear them
                  if (!['Homeschool', 'Tuition', 'IUFP'].includes(p)) {
                    upd('curriculum', ''); upd('grade', ''); upd('subjects', [])
                  }
                }}>
                <option value="Homeschool">Homeschool</option>
                <option value="Tuition">Tuition</option>
                <option value="IUFP">IUFP (Foundation Programme)</option>
                <option value="Study Abroad">Study Abroad</option>
                <option value="Pre-University">Pre-University</option>
              </select>
            </div>
            <div className="fg">
              <label className="fl">Delivery Mode</label>
              <select className="fsel" value={userForm.deliveryMode || 'Virtual'}
                onChange={e => upd('deliveryMode', e.target.value)}>
                <option value="Virtual">Virtual</option>
                <option value="In-person">In-person</option>
              </select>
            </div>
          </div>

          {/* Advisory programmes need no academic fields */}
          {!['Homeschool', 'Tuition', 'IUFP'].includes(userForm.programme || 'Homeschool') ? (
            <div style={{
              padding: 12, background: TOKENS.goldPale,
              border: '1px solid ' + TOKENS.gold, borderRadius: 8,
              fontSize: 12.5, color: TOKENS.crimson, lineHeight: 1.5,
            }}>
              {userForm.programme} is an advisory programme — no curriculum or
              subjects are required. The student will be supported by an advisor.
            </div>
          ) : (
            <>
          <div className="fr2">
            <div className="fg">
              <label className="fl">Curriculum</label>
              <select className="fsel" value={userForm.curriculum || ''} onChange={e => handleCurriculumChange(e.target.value)} disabled={catalogLoading}>
                <option value="">Select curriculum...</option>
                {catalog.curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="fg">
              <label className="fl">Grade / Year</label>
              <select className="fsel" value={userForm.grade || ''} onChange={e => upd('grade', e.target.value)} disabled={!studentCurriculum}>
                <option value="">{studentCurriculum ? 'Select grade...' : 'Select curriculum first'}</option>
                {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="fg">
            <label className="fl">Plan</label>
            <select className="fsel" value={userForm.plan || 'Basic'} onChange={e => upd('plan', e.target.value)}>
              <option>Basic</option><option>Premium</option><option>IGCSE Pack</option>
            </select>
          </div>

          {studentCurriculum && (
            <div className="fg">
              <label className="fl">Subjects ({(userForm.subjects || []).length} selected)</label>
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, maxHeight: 280, overflowY: 'auto', background: '#FFF' }}>
                {availableSubjects.length === 0 ? (
                  <div style={{ fontSize: 12, color: TOKENS.s500, textAlign: 'center', padding: 12 }}>No subjects available for this curriculum</div>
                ) : (
                  Object.entries(subjectsByCategory).map(([category, subjects]) => (
                    <div key={category} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: TOKENS.crimson, marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid ' + TOKENS.s100 }}>{category}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 4 }}>
                        {subjects.map(s => {
                          const checked = (userForm.subjects || []).includes(s.name)
                          return (
                            <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', fontSize: 12.5, cursor: 'pointer', borderRadius: 4, background: checked ? TOKENS.goldPale : 'transparent' }}>
                              <input type="checkbox" checked={checked} onChange={() => toggleSubject(s.name)} style={{ cursor: 'pointer', accentColor: TOKENS.crimson }} />
                              <span style={{ color: checked ? TOKENS.crimson : TOKENS.s700, fontWeight: checked ? 600 : 400 }}>{s.name}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
            </>
          )}

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid ' + TOKENS.s100 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>Personal Profile</div>
            <div className="fr2">
              <div className="fg">
                <label className="fl">Date of Birth</label>
                <input className="fi" type="date" value={userForm.dateOfBirth ? userForm.dateOfBirth.slice(0, 10) : ''} onChange={e => upd('dateOfBirth', e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Profile photo (optional)</label>
                <AvatarUpload value={userForm.avatar} onChange={v => upd('avatar', v)} toast={toast} />
              </div>
            </div>
            <div className="fg">
              <label className="fl">Home Address</label>
              <textarea className="fi" rows={2} value={userForm.homeAddress || ''} onChange={e => upd('homeAddress', e.target.value)} placeholder="Street, city, country..." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div className="fg">
              <label className="fl">Medical Notes (optional)</label>
              <textarea className="fi" rows={2} value={userForm.medicalNotes || ''} onChange={e => upd('medicalNotes', e.target.value)} placeholder="Allergies, conditions, emergency info..." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              <div style={{ fontSize: 11, color: TOKENS.s400, marginTop: 4 }}>Confidential. Only visible to admin and assigned teachers.</div>
            </div>
          </div>

          {/* Parent / Guardian — only for an already-saved student */}
          {userForm._id ? (
            <ParentLinkSection studentId={userForm._id} toast={toast} />
          ) : (
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid ' + TOKENS.s100 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                Parent / Guardian
              </div>
              <div style={{ fontSize: 12.5, color: TOKENS.s500 }}>
                Save the student first, then reopen to link a parent or guardian.
              </div>
            </div>
          )}
        </>
      )}

      {userForm.role === 'teacher' && (
        <>
          <div className="fg">
            <label className="fl">Curricula (select all that apply)</label>
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, background: '#FFF', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 4 }}>
              {catalog.curricula.length === 0 ? (
                <div style={{ fontSize: 12, color: TOKENS.s500 }}>{catalogLoading ? 'Loading...' : 'No curricula available'}</div>
              ) : (
                catalog.curricula.map(c => {
                  const teacherCurricula = Array.isArray(userForm.curriculum) ? userForm.curriculum : (userForm.curriculum ? [userForm.curriculum] : [])
                  const checked = teacherCurricula.includes(c.id)
                  return (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', fontSize: 12.5, cursor: 'pointer', borderRadius: 4, background: checked ? TOKENS.goldPale : 'transparent' }}>
                      <input type="checkbox" checked={checked}
                        onChange={() => {
                          const current = Array.isArray(userForm.curriculum) ? [...userForm.curriculum] : (userForm.curriculum ? [userForm.curriculum] : [])
                          if (checked) {
                            const next = current.filter(x => x !== c.id)
                            upd('curriculum', next)
                            const stillValid = (userForm.subjects || []).filter(subjName => {
                              const subj = catalog.subjects.find(s => s.name === subjName)
                              if (!subj) return false
                              if (subj.availableIn === 'all') return true
                              return Array.isArray(subj.availableIn) && subj.availableIn.some(currId => next.includes(currId))
                            })
                            upd('subjects', stillValid)
                          } else { upd('curriculum', [...current, c.id]) }
                        }} style={{ cursor: 'pointer', accentColor: TOKENS.crimson }} />
                      <span style={{ color: checked ? TOKENS.crimson : TOKENS.s700, fontWeight: checked ? 600 : 400 }}>{c.name}</span>
                    </label>
                  )
                })
              )}
            </div>
          </div>

          {(() => {
            const teacherCurricula = Array.isArray(userForm.curriculum) ? userForm.curriculum : (userForm.curriculum ? [userForm.curriculum] : [])
            if (teacherCurricula.length === 0) {
              return (
                <div className="fg">
                  <label className="fl">Subjects</label>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, background: TOKENS.cream, fontSize: 12.5, color: TOKENS.s500, textAlign: 'center' }}>
                    Select at least one curriculum above to see available subjects
                  </div>
                </div>
              )
            }
            const teacherSubjects = catalog.subjects.filter(s => s.availableIn === 'all' || (Array.isArray(s.availableIn) && s.availableIn.some(currId => teacherCurricula.includes(currId))))
            const teacherSubjectsByCategory = teacherSubjects.reduce((acc, s) => { if (!acc[s.category]) acc[s.category] = []; acc[s.category].push(s); return acc }, {})
            const selectedSubjects = Array.isArray(userForm.subjects) ? userForm.subjects.filter(s => typeof s === 'string') : []
            const toggle = (subjectName) => {
              if (selectedSubjects.includes(subjectName)) upd('subjects', selectedSubjects.filter(s => s !== subjectName))
              else upd('subjects', [...selectedSubjects, subjectName])
            }
            return (
              <div className="fg">
                <label className="fl">Subjects ({selectedSubjects.length} selected)</label>
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, maxHeight: 320, overflowY: 'auto', background: '#FFF' }}>
                  {teacherSubjects.length === 0 ? (
                    <div style={{ fontSize: 12, color: TOKENS.s500, textAlign: 'center', padding: 12 }}>No subjects available for selected curricula</div>
                  ) : (
                    Object.entries(teacherSubjectsByCategory).map(([category, subs]) => (
                      <div key={category} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: TOKENS.crimson, marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid ' + TOKENS.s100 }}>{category}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 4 }}>
                          {subs.map(s => {
                            const checked = selectedSubjects.includes(s.name)
                            return (
                              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', fontSize: 12.5, cursor: 'pointer', borderRadius: 4, background: checked ? TOKENS.goldPale : 'transparent' }}>
                                <input type="checkbox" checked={checked} onChange={() => toggle(s.name)} style={{ cursor: 'pointer', accentColor: TOKENS.crimson }} />
                                <span style={{ color: checked ? TOKENS.crimson : TOKENS.s700, fontWeight: checked ? 600 : 400 }}>{s.name}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })()}

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid ' + TOKENS.s100 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>Teaching Profile</div>
            <div className="fr2">
              <div className="fg">
                <label className="fl">Years of Experience</label>
                <input className="fi" type="number" min="0" max="70" value={userForm.yearsOfExperience || 0} onChange={e => upd('yearsOfExperience', parseInt(e.target.value) || 0)} />
              </div>
              <div className="fg">
                <label className="fl">Profile photo (optional)</label>
                <AvatarUpload value={userForm.avatar} onChange={v => upd('avatar', v)} toast={toast} />
              </div>
            </div>
            <div className="fg">
              <label className="fl">Bio</label>
              <textarea className="fi" rows={3} value={userForm.bio || ''} onChange={e => upd('bio', e.target.value)} placeholder="Brief intro shown to students and parents..." maxLength={1000} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              <div style={{ fontSize: 11, color: TOKENS.s400, marginTop: 4 }}>{(userForm.bio || '').length}/1000 characters</div>
            </div>

            <div className="fg">
              <label className="fl">Qualifications ({(userForm.qualifications || []).length})</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input className="fi" value={qualInput} onChange={e => setQualInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip('qualifications', qualInput, setQualInput) } }} placeholder="e.g. B.Ed. Mathematics, University of Nairobi 2022" style={{ flex: 1 }} />
                <button type="button" onClick={() => addChip('qualifications', qualInput, setQualInput)} className="btn btn-s btn-sm" style={{ flexShrink: 0 }}>+ Add</button>
              </div>
              {(userForm.qualifications || []).length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(userForm.qualifications || []).map((q, i) => (
                    <span key={i} style={chipStyle}>{q}<button type="button" onClick={() => removeChip('qualifications', i)} style={chipRemoveStyle} aria-label="Remove">×</button></span>
                  ))}
                </div>
              )}
            </div>

            <div className="fg">
              <label className="fl">Certifications ({(userForm.certifications || []).length})</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input className="fi" value={certInput} onChange={e => setCertInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip('certifications', certInput, setCertInput) } }} placeholder="e.g. Cambridge IGCSE Mathematics certified" style={{ flex: 1 }} />
                <button type="button" onClick={() => addChip('certifications', certInput, setCertInput)} className="btn btn-s btn-sm" style={{ flexShrink: 0 }}>+ Add</button>
              </div>
              {(userForm.certifications || []).length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(userForm.certifications || []).map((c, i) => (
                    <span key={i} style={chipStyle}>{c}<button type="button" onClick={() => removeChip('certifications', i)} style={chipRemoveStyle}>×</button></span>
                  ))}
                </div>
              )}
            </div>

            <div className="fg">
              <label className="fl">Specializations ({(userForm.specializations || []).length})</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input className="fi" value={specInput} onChange={e => setSpecInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip('specializations', specInput, setSpecInput) } }} placeholder="e.g. Calculus, Mechanics, Past paper exam coaching" style={{ flex: 1 }} />
                <button type="button" onClick={() => addChip('specializations', specInput, setSpecInput)} className="btn btn-s btn-sm" style={{ flexShrink: 0 }}>+ Add</button>
              </div>
              {(userForm.specializations || []).length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(userForm.specializations || []).map((s, i) => (
                    <span key={i} style={chipStyle}>{s}<button type="button" onClick={() => removeChip('specializations', i)} style={chipRemoveStyle}>×</button></span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {userForm.role === 'parent' && (
        <>
          <div className="fg">
            <label className="fl">Brief Bio</label>
            <textarea className="fi" rows={3} value={userForm.bio || ''} onChange={e => upd('bio', e.target.value)} placeholder="Optional notes..." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <div className="fg">
            <label className="fl">Profile photo (optional)</label>
            <AvatarUpload value={userForm.avatar} onChange={v => upd('avatar', v)} toast={toast} />
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid ' + TOKENS.s100 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>Linked Children</div>
            <div className="fg">
              <label className="fl">Add a student by admission number</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="fi" value={admissionInput} onChange={e => setAdmissionInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddStudent() } }} placeholder="e.g. SH/2026/001" style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace' }} />
                <button type="button" onClick={handleAddStudent} disabled={admissionLooking || !admissionInput.trim()} className="btn btn-p btn-sm" style={{ flexShrink: 0 }}>{admissionLooking ? '...' : '+ Add'}</button>
              </div>
              <div style={{ fontSize: 11, color: TOKENS.s400, marginTop: 4 }}>Find a student's admission number on their user profile.</div>
            </div>

            {linkedStudentDetails.length > 0 && (
              <div className="fg">
                <label className="fl">Linked children ({linkedStudentDetails.length})</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {linkedStudentDetails.map(s => (
                    <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: TOKENS.goldPale, border: '1px solid ' + TOKENS.gold, borderRadius: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.s900 }}>{s.firstName} {s.lastName}</div>
                        <div style={{ fontSize: 11, color: TOKENS.s500, fontFamily: 'JetBrains Mono, monospace' }}>{s.admissionNumber || 'No admission number'}{s.gradeLevel && ' · ' + s.gradeLevel}</div>
                      </div>
                      <button type="button" onClick={() => removeLinkedStudent(s._id)} style={{ background: 'transparent', border: '1px solid #FCA5A5', color: '#DC2626', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div style={{ background: TOKENS.cream, border: '1px solid ' + TOKENS.s100, padding: 12, borderRadius: 10, fontSize: 12, color: TOKENS.s700, lineHeight: 1.6, marginTop: 12 }}>
        {userForm._id ? 'Changes will apply immediately when you click Update.' : 'A temporary password will be generated automatically and emailed to the user. They will be required to change it on first login.'}
      </div>
    </div>
  )
}

function UsersModule({ refreshKey, toast, setUserForm, setUserModal, openAddUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [showImportFD, setShowImportFD] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/users')
      setUsers(res.data.users || [])
      setLoading(false)
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load')
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [refreshKey, loadUsers])

  const counts = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    parents: users.filter(u => u.role === 'parent').length,
    admins: users.filter(u => ['admin','accountant','sales','ops_manager','dos'].includes(u.role)).length,
    pending: users.filter(u => u.mustChangePassword).length,
  }

  const filtered = users.filter(u => {
    if (search) {
      const q = search.toLowerCase()
      const fullName = ((u.firstName || '') + ' ' + (u.lastName || '')).toLowerCase()
      const email = (u.email || '').toLowerCase()
      const adm = (u.admissionNumber || '').toLowerCase()
      if (!fullName.includes(q) && !email.includes(q) && !adm.includes(q)) return false
    }
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (statusFilter === 'active' && (u.isActive === false || u.mustChangePassword)) return false
    if (statusFilter === 'pending' && !u.mustChangePassword) return false
    if (statusFilter === 'suspended' && u.isActive !== false) return false
    return true
  })

  const handleEdit = (u) => {
    setUserForm({
      firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '',
      phone: u.phone || '', role: u.role || 'student',
      curriculum: u.curriculum || '',
      grade: u.gradeLevel || u.grade || '',
      plan: u.plan || 'Basic',
      subjects: Array.isArray(u.subjects) ? u.subjects.filter(s => typeof s === 'string') : [],
      teachingSpecialties: u.teachingSpecialties || [],
      bio: u.bio || '',
      avatar: u.avatar || '',
      qualifications: Array.isArray(u.qualifications) ? u.qualifications : [],
      certifications: Array.isArray(u.certifications) ? u.certifications : [],
      specializations: Array.isArray(u.specializations) ? u.specializations : [],
      yearsOfExperience: u.yearsOfExperience || 0,
      admissionNumber: u.admissionNumber || '',
      dateOfBirth: u.dateOfBirth || '',
      homeAddress: u.homeAddress || '',
      medicalNotes: u.medicalNotes || '',
      linkedStudents: Array.isArray(u.linkedStudents) ? u.linkedStudents.map(s => typeof s === 'object' ? s._id : s) : [],
      _id: u._id,
    })
    setUserModal(true)
  }

  const handleDelete = async (u) => {
    if (!confirm('Delete ' + u.firstName + ' ' + u.lastName + ' permanently?')) return
    try {
      await api.delete('/users/' + u._id)
      setUsers(prev => prev.filter(x => x._id !== u._id))
      toast.ok(u.firstName + ' deleted')
    } catch (e) {
      toast.error('Delete failed: ' + (e.response?.data?.message || e.message))
    }
  }

  if (loading) return (
    <PCard><div style={{ padding: 40, textAlign: 'center', color: TOKENS.s500 }}>Loading users...</div></PCard>
  )
  if (error) return (
    <PCard><div style={{ padding: 24, color: '#991B1B' }}>Failed to load users: {error}</div></PCard>
  )

  return (
    <>
      <PSection
        tag="Accounts"
        title="User"
        em="Management"
        sub={'Manage students, teachers, parents and admins · ' + counts.total + ' total'}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-s btn-sm" onClick={() => setShowImportFD(true)}>Import from Front Desk</button>
            <button className="btn btn-s btn-sm" onClick={() => toast.info('Exporting CSV...')}>Export</button>
            <button className="btn btn-p btn-sm" onClick={() => openAddUser('student')}>+ Add User</button>
          </div>
        }
      />

      {showImportFD && (
        <ImportFromFrontDesk
          toast={toast}
          onClose={() => setShowImportFD(false)}
          onImported={() => { loadUsers() }}
        />
      )}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Total" value={counts.total} delta="All accounts"/>
        <PKpi label="Students" value={counts.students} delta="Active learners"/>
        <PKpi label="Teachers" value={counts.teachers} delta="Faculty"/>
        <PKpi label="Parents" value={counts.parents} delta="Guardians"/>
        <PKpi label="Pending" value={counts.pending} delta={counts.pending > 0 ? 'Login required' : 'All set'} deltaColor={counts.pending > 0 ? TOKENS.accentAmber : TOKENS.accentEmerald}/>
      </div>

      {/* FILTERS */}
      <PCard padding={16} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { id: 'all',     label: 'All',      count: counts.total },
            { id: 'student', label: 'Students', count: counts.students },
            { id: 'teacher', label: 'Teachers', count: counts.teachers },
            { id: 'parent',  label: 'Parents',  count: counts.parents },
            { id: 'admin',   label: 'Admins',   count: counts.admins },
          ].map(c => (
            <button key={c.id} onClick={() => setRoleFilter(c.id)} style={{
              background: roleFilter === c.id ? TOKENS.crimson : TOKENS.s50,
              color: roleFilter === c.id ? TOKENS.white : TOKENS.s700,
              border: '1px solid ' + (roleFilter === c.id ? 'transparent' : TOKENS.s200),
              padding: '8px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {c.label}
              <span style={{ background: roleFilter === c.id ? 'rgba(255,255,255,.22)' : TOKENS.s100, padding: '2px 7px', borderRadius: 99, fontSize: 11 }}>{c.count}</span>
            </button>
          ))}
          <select className="fsel" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto', padding: '8px 12px', fontSize: 12.5 }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending Login</option>
            <option value="suspended">Suspended</option>
          </select>
          <input className="fi" placeholder="Search name, email, admission #..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 280, marginLeft: 'auto' }} />
        </div>
      </PCard>

      {/* USER LIST */}
      {users.length === 0 ? (
        <PCard><div style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: TOKENS.s700, marginBottom: 8 }}>No users yet</div>
          <div style={{ fontSize: 13, color: TOKENS.s500, marginBottom: 18 }}>Click "+ Add User" to create the first account</div>
          <button className="btn btn-p btn-sm" onClick={() => openAddUser('student')}>+ Add First User</button>
        </div></PCard>
      ) : filtered.length === 0 ? (
        <PCard><div style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: TOKENS.s500 }}>No users match your filters</div>
        </div></PCard>
      ) : (
        <PCard padding={0} style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: TOKENS.s50, borderBottom: '1px solid ' + TOKENS.s100 }}>
                  {['User', 'Role', 'Admission #', 'Curriculum', 'Plan', 'Status', 'Actions'].map((h, i) => (
                    <th key={i} style={{ padding: '14px 16px', textAlign: i === 6 ? 'center' : 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: TOKENS.s500, width: i === 6 ? 140 : undefined }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const fullName = (u.firstName || '') + ' ' + (u.lastName || '')
                  const init = initials(u.firstName, u.lastName)
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid ' + TOKENS.s100 }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Av init={init} col={avColor(fullName)} size={38}/>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: TOKENS.s900 }}>{fullName.trim() || 'Unnamed'}</div>
                            <div style={{ fontSize: 12, color: TOKENS.s500 }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', background: TOKENS.s50, color: TOKENS.crimson, border: '1px solid ' + TOKENS.s200, borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: u.admissionNumber ? TOKENS.crimson : TOKENS.s400, fontWeight: 600 }}>
                        {u.admissionNumber || (u.role === 'student' ? '—' : '')}
                      </td>
                      <td style={{ padding: '14px 16px', color: TOKENS.s600, fontSize: 13 }}>
                        {Array.isArray(u.curriculum) ? u.curriculum.join(', ') : (u.curriculum || 'N/A')}
                      </td>
                      <td style={{ padding: '14px 16px' }}><PlanBadge p={u.plan || 'Basic'} /></td>
                      <td style={{ padding: '14px 16px' }}>
                        {u.isActive === false ? <span style={{ display: 'inline-block', padding: '3px 10px', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>Suspended</span> :
                          u.mustChangePassword ? <span style={{ display: 'inline-block', padding: '3px 10px', background: '#FEF3C7', color: TOKENS.accentAmber, border: '1px solid #FDE68A', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>Pending Login</span> :
                          <span style={{ display: 'inline-block', padding: '3px 10px', background: '#DCFCE7', color: TOKENS.accentEmerald, border: '1px solid #86EFAC', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>Active</span>
                        }
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button className="btn btn-g btn-sm" onClick={() => handleEdit(u)}>Edit</button>
                          <button className="btn btn-d btn-sm" onClick={() => handleDelete(u)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </PCard>
      )}
    </>
  )
}

function ImportFromFrontDesk({ toast, onClose, onImported }) {
  const [leads, setLeads]     = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId]   = useState(null)
  const [editEmail, setEditEmail] = useState({})   // leadId -> custom student email

  const load = useCallback(() => {
    setLoading(true)
    api.get('/frontdesk/submissions?type=registration')
      .then(r => setLeads(r.data.data?.submissions || []))
      .catch(() => toast?.error?.('Failed to load registration leads.'))
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => { load() }, [load])

  const importLead = async (lead) => {
    setBusyId(lead._id)
    try {
      const body = {}
      const customEmail = (editEmail[lead._id] || '').trim()
      if (customEmail) body.studentEmail = customEmail
      const { data } = await api.post('/frontdesk/' + lead._id + '/import', body)
      if (data?.success) {
        toast?.ok?.(data.message || 'Lead imported.')
        // Reflect import locally
        setLeads(list => list.map(l => l._id === lead._id
          ? { ...l, status: 'converted', importedUserId: data.data?.studentId || 'done' }
          : l))
        onImported && onImported()
      } else {
        toast?.error?.(data?.message || 'Import failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Import failed.')
    } finally {
      setBusyId(null)
    }
  }

  const importable = leads.filter(l => !l.importedUserId)
  const done       = leads.filter(l => l.importedUserId)

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(10,8,6,.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 720,
        maxHeight: '86vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid ' + (TOKENS.line || '#E8E2D6') }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: TOKENS.ink || '#1A1A1A' }}>
                Import from Front Desk
              </div>
              <div style={{ fontSize: 12, color: TOKENS.s500, marginTop: 2 }}>
                Registration enquiries from the website. Importing creates a student account and a linked parent account.
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'transparent', border: 'none', fontSize: 22,
              color: TOKENS.s400, cursor: 'pointer', lineHeight: 1,
            }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 18, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: TOKENS.s500, padding: 30 }}>Loading registration leads…</div>
          ) : leads.length === 0 ? (
            <div style={{ textAlign: 'center', color: TOKENS.s500, padding: 30 }}>
              No registration leads yet. They appear here when families register via the website.
            </div>
          ) : (
            <>
              {importable.length === 0 && (
                <div style={{ fontSize: 13, color: TOKENS.s500, marginBottom: 12 }}>
                  All registration leads have been imported.
                </div>
              )}

              {importable.map(lead => (
                <div key={lead._id} style={{
                  border: '1px solid ' + (TOKENS.line || '#E8E2D6'), borderRadius: 10,
                  padding: 14, marginBottom: 10,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TOKENS.ink || '#1A1A1A' }}>
                        {[lead.studentFirstName, lead.studentLastName].filter(Boolean).join(' ') || lead.name || 'Unnamed student'}
                      </div>
                      <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 2 }}>
                        {[
                          lead.curriculum,
                          lead.programme,
                          lead.country,
                          lead.studentDob ? 'DOB ' + lead.studentDob : '',
                        ].filter(Boolean).join(' · ')}
                      </div>
                      <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 2 }}>
                        Parent: {lead.name || '—'} · {lead.email || 'no email'} · {lead.phone || 'no phone'}
                      </div>
                    </div>
                  </div>

                  {/* Optional custom student email */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: TOKENS.s400, marginBottom: 3 }}>
                      Student login email <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional — leave blank to derive from the parent email)</span>
                    </div>
                    <input
                      value={editEmail[lead._id] || ''}
                      onChange={e => setEditEmail(m => ({ ...m, [lead._id]: e.target.value }))}
                      placeholder="e.g. student.name@email.com"
                      style={{
                        width: '100%', boxSizing: 'border-box', padding: '7px 10px',
                        borderRadius: 6, fontSize: 12.5,
                        border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
                      }}/>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <button
                      onClick={() => importLead(lead)}
                      disabled={busyId === lead._id || !lead.email}
                      style={{
                        background: !lead.email ? '#9CA3AF' : TOKENS.crimson,
                        color: '#fff', border: 'none', borderRadius: 6,
                        padding: '8px 18px', fontSize: 12.5, fontWeight: 700,
                        cursor: (busyId === lead._id || !lead.email) ? 'not-allowed' : 'pointer',
                      }}>
                      {busyId === lead._id ? 'Importing…' : 'Import as Student + Parent'}
                    </button>
                  </div>
                </div>
              ))}

              {done.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: TOKENS.s400, marginBottom: 6 }}>
                    Already imported ({done.length})
                  </div>
                  {done.map(lead => (
                    <div key={lead._id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', fontSize: 12.5, color: TOKENS.s500,
                      background: '#FBFAF5', borderRadius: 6, marginBottom: 4,
                    }}>
                      <span style={{ color: '#15803D', fontWeight: 700 }}>✓</span>
                      {[lead.studentFirstName, lead.studentLastName].filter(Boolean).join(' ') || lead.name}
                      <span style={{ color: TOKENS.s400 }}>· {lead.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default UsersModule
