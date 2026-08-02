import React, { useState, useEffect } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { SCHOOL_CURRICULA, TOKENS } from '../shared/tokens.js'
import { avColor, fmtDate, initials } from '../shared/helpers.js'
import { Av, PCard, PKpi, PSection } from '../shared/ui.jsx'

function TeachersModule({ refreshKey, toast, openAddUser }) {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [localRefresh, setLocalRefresh] = useState(0)

  const loadTeachers = () => {
    setLoading(true)
    api.get('/users/teachers/list')
      .then(r => { setTeachers(r.data.teachers || []); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { loadTeachers() }, [refreshKey, localRefresh])

  const filtered = teachers.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return ((t.firstName || '') + ' ' + (t.lastName || '')).toLowerCase().includes(q) ||
           (t.email || '').toLowerCase().includes(q) ||
           (t.jobTitle || '').toLowerCase().includes(q)
  })

  const activeCount = teachers.filter(t => t.isActive !== false && !t.isOnLeave).length
  const inactiveCount = teachers.filter(t => t.isActive === false).length

  return (
    <>
      <PSection
        tag="Faculty"
        title="Teacher"
        em="Management"
        sub={teachers.length + ' teachers on staff'}
        action={<button className="btn btn-p btn-sm" onClick={() => openAddUser('teacher')}>+ Add Teacher</button>}
      />

      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Total" value={teachers.length} delta="On staff"/>
        <PKpi label="Active" value={activeCount} delta="Available now" deltaColor={TOKENS.accentEmerald}/>
        <PKpi label="On Leave" value={teachers.filter(t => t.isOnLeave).length} delta="Approved leave" deltaColor={TOKENS.accentAmber}/>
        <PKpi label="Deactivated" value={inactiveCount} delta={inactiveCount > 0 ? 'Suspended' : 'None'} deltaColor={inactiveCount > 0 ? TOKENS.accentRose : TOKENS.accentEmerald}/>
      </div>

      <PCard padding={16} style={{ marginBottom: 16 }}>
        <input className="fi" placeholder="Search teachers by name, email, or title..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 420 }} />
      </PCard>

      {loading ? (
        <PCard><div style={{ padding: 48, textAlign: 'center', color: TOKENS.s500 }}>Loading teachers...</div></PCard>
      ) : filtered.length === 0 ? (
        <PCard><div style={{ padding: 48, textAlign: 'center', color: TOKENS.s500 }}>{teachers.length === 0 ? 'No teachers yet. Click + Add Teacher to create one.' : 'No teachers match your search.'}</div></PCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(t => {
            const name = ((t.firstName || '') + ' ' + (t.lastName || '')).trim()
            const specialtyCount = Array.isArray(t.teachingSpecialties) ? t.teachingSpecialties.length : 0
            const isDeactivated = t.isActive === false
            return (
              <PCard key={t._id} accent={isDeactivated ? TOKENS.accentRose : TOKENS.accentTeal}
                style={{ cursor: 'pointer', opacity: isDeactivated ? 0.7 : 1 }}>
                <div onClick={() => setSelected(t)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                    {t.avatar ? (
                      <img src={t.avatar} alt={name}
                        style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}/>
                    ) : (
                      <Av init={initials(t.firstName, t.lastName)} col={avColor(name)} size={52}/>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 17, color: TOKENS.s900, marginBottom: 2 }}>
                        {name || 'Unnamed'}
                      </div>
                      {t.jobTitle && (
                        <div style={{ fontSize: 11.5, color: TOKENS.crimson, fontWeight: 700, marginBottom: 2 }}>
                          {t.jobTitle}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: TOKENS.s500 }}>{t.email}</div>
                    </div>
                    {isDeactivated ? (
                      <span style={{ display: 'inline-block', padding: '3px 8px', background: '#FEE2E2', color: TOKENS.accentRose, border: '1px solid #FCA5A5', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>Deactivated</span>
                    ) : t.isOnLeave ? (
                      <span style={{ display: 'inline-block', padding: '3px 8px', background: '#FEF3C7', color: TOKENS.accentAmber, border: '1px solid #FDE68A', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>On Leave</span>
                    ) : null}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TOKENS.s500, paddingTop: 12, borderTop: '1px solid ' + TOKENS.s100 }}>
                    <span>{specialtyCount} specialt{specialtyCount === 1 ? 'y' : 'ies'}</span>
                    <span>{t.createdAt ? 'Joined ' + fmtDate(t.createdAt) : ''}</span>
                  </div>
                </div>
              </PCard>
            )
          })}
        </div>
      )}

      {selected && (
        <TeacherDetailModal
          teacher={selected}
          onClose={() => setSelected(null)}
          onChanged={() => { setLocalRefresh(v => v + 1) }}
          toast={toast}
        />
      )}
    </>
  )
}

function TeacherDetailModal({ teacher, onClose, onChanged, toast }) {
  const [tab, setTab] = useState('profile')
  const [tch, setTch] = useState(teacher)   // local copy, updated as we save

  const refreshTeacher = async () => {
    try {
      const { data } = await api.get('/users/teachers/list')
      const fresh = (data.teachers || []).find(t => t._id === teacher._id)
      if (fresh) setTch(fresh)
      onChanged?.()
    } catch (e) { /* silent */ }
  }

  const TABS = [
    { id: 'profile',     label: 'Profile' },
    { id: 'specialties', label: 'Specialties' },
    { id: 'students',    label: 'Students' },
    { id: 'email',       label: 'Email' },
    { id: 'status',      label: 'Status' },
  ]

  const name = ((tch.firstName || '') + ' ' + (tch.lastName || '')).trim()

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 12,
        maxWidth: 720, width: '100%', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: `linear-gradient(135deg, ${TOKENS.crimson} 0%, ${TOKENS.crimsonDeep} 100%)`,
          color: TOKENS.cream,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          {tch.avatar ? (
            <img src={tch.avatar} alt={name}
              style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,.3)' }}/>
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(255,255,255,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700,
            }}>
              {initials(tch.firstName, tch.lastName)}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#F0CC5A' }}>
              {tch.jobTitle || 'Teacher'}
            </div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, marginTop: 2 }}>
              {name || 'Unnamed Teacher'}
            </div>
            <div style={{ fontSize: 12, opacity: .85 }}>{tch.email}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 2,
          borderBottom: '1px solid #E8E2D6',
          padding: '0 16px', background: '#FBFAF5',
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '12px 16px',
                background: 'transparent', border: 'none',
                borderBottom: `2.5px solid ${tab === t.id ? TOKENS.crimson : 'transparent'}`,
                color: tab === t.id ? TOKENS.crimson : '#6B6B6B',
                fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflow: 'auto', flex: 1 }}>
          {tab === 'profile' && (
            <TeacherProfileTab teacher={tch} onSaved={refreshTeacher} toast={toast} />
          )}
          {tab === 'specialties' && (
            <TeacherSpecialtiesTab teacher={tch} onSaved={refreshTeacher} toast={toast} />
          )}
          {tab === 'students' && (
            <TeacherStudentsTab teacher={tch} toast={toast} />
          )}
          {tab === 'email' && (
            <TeacherEmailTab teacher={tch} onSent={refreshTeacher} toast={toast} />
          )}
          {tab === 'status' && (
            <TeacherStatusTab teacher={tch} onSaved={refreshTeacher} onClose={onClose} toast={toast} />
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          background: '#FBFAF5', borderTop: '1px solid #E8E2D6',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button onClick={onClose}
            style={{
              background: '#fff', color: TOKENS.crimson,
              border: '1.5px solid #E8E2D6',
              padding: '9px 20px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function TeacherProfileTab({ teacher, onSaved, toast }) {
  const [form, setForm] = useState({
    firstName: teacher.firstName || '',
    lastName:  teacher.lastName || '',
    email:     teacher.email || '',
    phone:     teacher.phone || '',
    jobTitle:  teacher.jobTitle || '',
    bio:       teacher.bio || '',
    yearsOfExperience: teacher.yearsOfExperience || 0,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatar, setAvatar] = useState(teacher.avatar || '')

  const TITLE_PRESETS = [
    'Subject Teacher', 'Senior Teacher', 'Lead Tutor',
    'Head of Department', 'Head of Sciences', 'Head of Languages',
    'Academic Coordinator', 'Examinations Officer',
  ]

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const uploadImg = async (file) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      toast?.error?.('Image must be JPG, PNG, or WebP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast?.error?.('Image is larger than 5 MB.')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/users/' + teacher._id + '/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data?.success) {
        setAvatar(data.data.avatar)
        toast?.ok?.('Profile image updated.')
        onSaved?.()
      } else {
        toast?.error?.(data?.message || 'Upload failed.')
      }
    } catch (e) {
      toast?.error?.('Could not upload image: ' + (e?.response?.data?.message || e.message))
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast?.error?.('First and last name are required.')
      return
    }
    setSaving(true)
    try {
      const { data } = await api.patch('/users/' + teacher._id, {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        phone:     form.phone.trim(),
        jobTitle:  form.jobTitle.trim(),
        bio:       form.bio.trim(),
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
      })
      if (data?.success || data?.user) {
        toast?.ok?.('Profile saved.')
        onSaved?.()
      } else {
        toast?.error?.(data?.message || 'Save failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 12px', borderRadius: 6,
    border: '1.5px solid #E8E2D6', fontSize: 13, fontFamily: 'inherit',
  }
  const lbl = {
    display: 'block', fontSize: 10.5, fontWeight: 700,
    letterSpacing: '.06em', textTransform: 'uppercase',
    color: TOKENS.crimson, marginBottom: 4,
  }

  return (
    <div>
      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        {avatar ? (
          <img src={avatar} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E8E2D6' }}/>
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#FBF6E3', border: '2px solid #C9A030',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: TOKENS.crimson, fontSize: 24, fontWeight: 700,
          }}>
            {initials(form.firstName, form.lastName)}
          </div>
        )}
        <label style={{
          background: '#fff', color: TOKENS.crimson,
          border: `1.5px solid ${TOKENS.crimson}`,
          padding: '8px 16px', borderRadius: 6,
          cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
        }}>
          <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
            onChange={e => uploadImg(e.target.files?.[0])}/>
          {uploading ? 'Uploading...' : (avatar ? 'Change Photo' : 'Upload Photo')}
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={lbl}>First Name *</label>
          <input value={form.firstName} onChange={e => update('firstName', e.target.value)} style={inp}/>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={lbl}>Last Name *</label>
          <input value={form.lastName} onChange={e => update('lastName', e.target.value)} style={inp}/>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={lbl}>Email (read-only)</label>
        <input value={form.email} disabled style={{ ...inp, background: '#F4F4F4', color: '#6B6B6B' }}/>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={lbl}>Phone</label>
          <input value={form.phone} onChange={e => update('phone', e.target.value)} style={inp}/>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <label style={lbl}>Years of Experience</label>
          <input type="number" min={0} max={70} value={form.yearsOfExperience}
            onChange={e => update('yearsOfExperience', e.target.value)} style={inp}/>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={lbl}>Job Title</label>
        <input value={form.jobTitle} onChange={e => update('jobTitle', e.target.value)}
          placeholder="e.g. Senior Mathematics Teacher" style={inp} list="title-presets"/>
        <datalist id="title-presets">
          {TITLE_PRESETS.map(t => <option key={t} value={t}/>)}
        </datalist>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
          {TITLE_PRESETS.slice(0, 5).map(t => (
            <button key={t} onClick={() => update('jobTitle', t)}
              style={{
                background: '#FBF6E3', color: TOKENS.crimson,
                border: '1px solid #E8E2D6', borderRadius: 99,
                padding: '3px 9px', fontSize: 10.5, fontWeight: 600, cursor: 'pointer',
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>Bio</label>
        <textarea value={form.bio} onChange={e => update('bio', e.target.value)}
          rows={3} placeholder="Short professional bio..."
          style={{ ...inp, resize: 'vertical' }}/>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={save} disabled={saving}
          style={{
            background: saving ? '#9CA3AF' : TOKENS.crimson,
            color: '#fff', border: 'none',
            padding: '9px 22px', borderRadius: 6,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 700,
          }}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}

function TeacherSpecialtiesTab({ teacher, onSaved, toast }) {
  // Canonical curricula (matches Subject catalog ids stored server-side).
  // Old admin-edited teachers may have legacy curriculum strings in
  // teachingSpecialties — handled in render below.
  const CURRICULA = SCHOOL_CURRICULA

  // Derive current curricula + subjectIds from teachingSpecialties
  const existingSpecs = Array.isArray(teacher.teachingSpecialties) ? teacher.teachingSpecialties : []
  const [pickedCurricula, setPickedCurricula] = useState(
    [...new Set(existingSpecs.map(s => s.curriculum).filter(Boolean))]
  )
  const [pickedSubjects, setPickedSubjects] = useState(
    [...new Set(existingSpecs.map(s => String(s.subjectId)).filter(Boolean))]
  )
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (pickedCurricula.length === 0) { setCatalog([]); return }
      setLoading(true)
      try {
        const results = await Promise.all(
          pickedCurricula.map(c => api.get('/subjects', { params: { curriculum: c } }))
        )
        if (cancelled) return
        const merged = []
        results.forEach(r => {
          const list = Array.isArray(r.data?.subjects) ? r.data.subjects : []
          list.forEach(s => {
            if (!merged.find(m => String(m._id) === String(s._id))) merged.push(s)
          })
        })
        setCatalog(merged)
      } catch (e) {
        toast?.error?.('Failed to load subjects.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [pickedCurricula, toast])

  const toggleCurr = (c) => {
    setPickedCurricula(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])
  }
  const toggleSubj = (id) => {
    setPickedSubjects(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  const filtered = catalog.filter(s =>
    !search.trim() || s.subjectName.toLowerCase().includes(search.toLowerCase())
  )

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch('/users/teachers/' + teacher._id + '/specialties', {
        curricula: pickedCurricula,
        subjectIds: pickedSubjects,
      })
      if (data?.success) {
        toast?.ok?.(data.message || 'Specialties saved.')
        onSaved?.()
      } else {
        toast?.error?.(data?.message || 'Save failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 12px', borderRadius: 6,
    border: '1.5px solid #E8E2D6', fontSize: 13, fontFamily: 'inherit',
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Step 1 — Curricula
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {/* If teacher has any legacy curriculum strings in their
              existing specialties that aren't in the canonical list,
              show those as toggle pills too so the admin can see and
              clean them up. */}
          {[...new Set(existingSpecs.map(s => s.curriculum).filter(Boolean))]
            .filter(legacy => !CURRICULA.some(c => c.id === legacy))
            .map(legacy => {
              const on = pickedCurricula.includes(legacy)
              return (
                <button key={'legacy:'+legacy} onClick={() => toggleCurr(legacy)}
                  style={{
                    background: on ? '#9A2434' : '#FEF3C7',
                    color: on ? '#fff' : '#92400E',
                    border: `1.5px solid ${on ? '#9A2434' : '#F59E0B'}`,
                    padding: '7px 14px', borderRadius: 99,
                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  }}
                  title="Legacy curriculum value — re-pick from the canonical list to clean up">
                  {on ? 'on · ' : ''}{legacy} (legacy)
                </button>
              )
            })}
          {CURRICULA.map(c => {
            const on = pickedCurricula.includes(c.id)
            return (
              <button key={c.id} onClick={() => toggleCurr(c.id)}
                style={{
                  background: on ? TOKENS.crimson : '#fff',
                  color: on ? '#fff' : TOKENS.crimson,
                  border: `1.5px solid ${on ? TOKENS.crimson : '#E8E2D6'}`,
                  padding: '7px 14px', borderRadius: 99,
                  cursor: 'pointer', fontSize: 12, fontWeight: 700,
                }}>
                {on ? 'on · ' : ''}{c.name}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Step 2 — Subjects ({pickedSubjects.length} selected)
        </div>
        {pickedCurricula.length === 0 ? (
          <div style={{ padding: 18, background: '#FBFAF5', borderRadius: 6, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>
            Pick at least one curriculum first.
          </div>
        ) : loading ? (
          <div style={{ padding: 18, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>Loading subjects...</div>
        ) : (
          <>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search subjects..." style={{ ...inp, marginBottom: 8 }}/>
            <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #E8E2D6', borderRadius: 6, padding: 8 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 14, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>No subjects match.</div>
              ) : filtered.map(s => {
                const on = pickedSubjects.includes(String(s._id))
                return (
                  <div key={s._id} onClick={() => toggleSubj(String(s._id))}
                    style={{
                      padding: '7px 10px', cursor: 'pointer',
                      background: on ? '#FBF6E3' : 'transparent',
                      borderRadius: 4, marginBottom: 2,
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 3,
                      border: `1.5px solid ${on ? TOKENS.crimson : '#E8E2D6'}`,
                      background: on ? TOKENS.crimson : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {on && (
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, fontSize: 13 }}>
                      <strong>{s.subjectName}</strong>{' '}
                      <span style={{ color: '#6B6B6B', fontSize: 11.5 }}>({s.curriculum})</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {pickedCurricula.length > 0 && pickedSubjects.length > 0 && (
        <div style={{
          padding: 10, marginTop: 12,
          background: '#FBF6E3', border: '1px solid #C9A030', borderRadius: 6,
          fontSize: 12, color: TOKENS.crimson,
        }}>
          This produces <strong>{pickedCurricula.length * pickedSubjects.length}</strong> specialty pair{pickedCurricula.length * pickedSubjects.length === 1 ? '' : 's'}.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
        <button onClick={save} disabled={saving}
          style={{
            background: saving ? '#9CA3AF' : TOKENS.crimson,
            color: '#fff', border: 'none',
            padding: '9px 22px', borderRadius: 6,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 700,
          }}>
          {saving ? 'Saving...' : 'Save Specialties'}
        </button>
      </div>
    </div>
  )
}

function TeacherStudentsTab({ teacher, toast }) {
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const { data } = await api.get('/allocations')
        if (cancelled) return
        const mine = (data.allocations || []).filter(a =>
          (a.teacherId?._id || a.teacherId) === teacher._id && a.status === 'Active'
        )
        setAllocations(mine)
      } catch (e) {
        toast?.error?.('Failed to load allocations.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [teacher._id, toast])

  if (loading) {
    return <div style={{ padding: 18, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>Loading students...</div>
  }

  if (allocations.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: '#1A1A1A', marginBottom: 4 }}>
          No students yet
        </div>
        <div style={{ fontSize: 12.5, color: '#6B6B6B' }}>
          This teacher has no active student allocations. Allocate students from the Manage Students module.
        </div>
      </div>
    )
  }

  // Group allocations by subject
  const bySubject = {}
  allocations.forEach(a => {
    const subj = a.subjectId?.subjectName || 'Unknown subject'
    if (!bySubject[subj]) bySubject[subj] = []
    bySubject[subj].push(a)
  })

  return (
    <div>
      <div style={{ fontSize: 12.5, color: '#6B6B6B', marginBottom: 12 }}>
        {allocations.length} active allocation{allocations.length === 1 ? '' : 's'} across {Object.keys(bySubject).length} subject{Object.keys(bySubject).length === 1 ? '' : 's'}.
      </div>
      {Object.entries(bySubject).map(([subj, allocs]) => (
        <div key={subj} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            {subj} · {allocs.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {allocs.map(a => (
              <div key={a._id} style={{
                padding: '8px 12px',
                background: '#fff', border: '1px solid #E8E2D6', borderRadius: 6,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: TOKENS.crimson, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {(a.studentId?.firstName?.[0] || '') + (a.studentId?.lastName?.[0] || '')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>
                    {a.studentId?.firstName} {a.studentId?.lastName}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B6B6B' }}>{a.studentId?.email}</div>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700,
                  background: '#FBF6E3', color: TOKENS.crimson,
                  padding: '3px 8px', borderRadius: 99,
                }}>
                  {a.curriculum}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TeacherEmailTab({ teacher, onSent, toast }) {
  // Templates — starting points the admin edits before sending.
  const TEMPLATES = {
    memo: {
      label: 'Internal Memo',
      subject: 'Internal Memo from Smartious Administration',
      body: 'This memo is to inform you of the following:\n\n[Write the announcement or information here.]\n\nPlease take note accordingly.',
    },
    meeting: {
      label: 'Meeting Request',
      subject: 'Request for a Meeting',
      body: 'We would like to schedule a meeting with you to discuss the following:\n\n[State the purpose of the meeting.]\n\nProposed date and time: [date / time]\nLocation / link: [venue or video link]\n\nKindly confirm your availability.',
    },
    commendation: {
      label: 'Letter of Commendation',
      subject: 'Recognition of Your Work',
      body: 'We would like to formally recognise and commend you for:\n\n[Describe the achievement or contribution.]\n\nYour effort makes a real difference at Smartious. Thank you.',
    },
    notice: {
      label: 'Formal Notice',
      subject: 'Formal Notice',
      body: 'This letter is to formally bring the following matter to your attention:\n\n[Describe the matter clearly and factually.]\n\nWe would like to discuss this with you. Please respond by [date], or contact the administration to arrange a meeting.\n\nThis notice is part of our standard process and a copy is retained on file.',
    },
    custom: {
      label: 'Custom Message',
      subject: '',
      body: '',
    },
  }

  const [kind, setKind] = useState('memo')
  const [subject, setSubject] = useState(TEMPLATES.memo.subject)
  const [body, setBody] = useState(TEMPLATES.memo.body)
  const [sending, setSending] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const applyTemplate = (k) => {
    setKind(k)
    setSubject(TEMPLATES[k].subject)
    setBody(TEMPLATES[k].body)
    setConfirm(false)
  }

  const send = async () => {
    if (!subject.trim()) { toast?.error?.('Subject is required.'); return }
    if (!body.trim())    { toast?.error?.('Message body is required.'); return }
    setSending(true)
    try {
      const { data } = await api.post('/users/' + teacher._id + '/send-email', {
        subject: subject.trim(), body, kind,
      })
      if (data?.success) {
        toast?.ok?.(data.message || 'Email sent.')
        setConfirm(false)
        onSent?.()
      } else {
        toast?.error?.(data?.message || 'Send failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Send failed.')
    } finally {
      setSending(false)
    }
  }

  const history = Array.isArray(teacher.sentEmails)
    ? [...teacher.sentEmails].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
    : []

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 12px', borderRadius: 6,
    border: '1.5px solid #E8E2D6', fontSize: 13, fontFamily: 'inherit',
  }
  const lbl = {
    display: 'block', fontSize: 10.5, fontWeight: 700,
    letterSpacing: '.06em', textTransform: 'uppercase',
    color: TOKENS.crimson, marginBottom: 4,
  }

  return (
    <div>
      <div style={{ fontSize: 12.5, color: '#6B6B6B', marginBottom: 14, lineHeight: 1.5 }}>
        Compose an email to <strong>{teacher.firstName} {teacher.lastName}</strong> ({teacher.email}).
        Pick a template as a starting point, then edit the wording before sending.
      </div>

      {/* Template picker */}
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Template</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.entries(TEMPLATES).map(([k, t]) => (
            <button key={k} onClick={() => applyTemplate(k)}
              style={{
                background: kind === k ? TOKENS.crimson : '#fff',
                color: kind === k ? '#fff' : TOKENS.crimson,
                border: `1.5px solid ${kind === k ? TOKENS.crimson : '#E8E2D6'}`,
                padding: '6px 12px', borderRadius: 99,
                cursor: 'pointer', fontSize: 11.5, fontWeight: 700,
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {kind === 'notice' && (
        <div style={{
          padding: 10, marginBottom: 12,
          background: '#FEF3C7', border: '1px solid #F59E0B',
          borderRadius: 6, fontSize: 11.5, color: '#92400E', lineHeight: 1.5,
        }}>
          A formal notice is a sensitive document. Write it factually and
          specifically. Review every line before sending — this is recorded
          in the teacher's email history.
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label style={lbl}>Subject</label>
        <input value={subject} onChange={e => { setSubject(e.target.value); setConfirm(false) }}
          placeholder="Email subject" style={inp}/>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Message</label>
        <textarea value={body} onChange={e => { setBody(e.target.value); setConfirm(false) }}
          rows={10} placeholder="Write your message. Leave a blank line between paragraphs."
          style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}/>
        <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 4 }}>
          The message is wrapped in the Smartious branded template, addressed to the teacher, and signed with your name. Blank lines become paragraph breaks.
        </div>
      </div>

      {/* Send with two-step confirm */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 22 }}>
        {!confirm ? (
          <button onClick={() => setConfirm(true)}
            style={{
              background: TOKENS.crimson, color: '#fff', border: 'none',
              padding: '9px 22px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            Review &amp; Send
          </button>
        ) : (
          <>
            <span style={{ fontSize: 12, color: '#6B6B6B', alignSelf: 'center' }}>
              Send this email to {teacher.email}?
            </span>
            <button onClick={() => setConfirm(false)} disabled={sending}
              style={{
                background: '#fff', color: '#6B6B6B',
                border: '1.5px solid #E8E2D6',
                padding: '9px 16px', borderRadius: 6,
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}>
              Cancel
            </button>
            <button onClick={send} disabled={sending}
              style={{
                background: sending ? '#9CA3AF' : '#15803D',
                color: '#fff', border: 'none',
                padding: '9px 22px', borderRadius: 6,
                cursor: sending ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 700,
              }}>
              {sending ? 'Sending...' : 'Confirm Send'}
            </button>
          </>
        )}
      </div>

      {/* History */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Email History ({history.length})
        </div>
        {history.length === 0 ? (
          <div style={{ padding: 14, background: '#FBFAF5', borderRadius: 6, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>
            No emails sent to this teacher yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {history.map((h, i) => (
              <div key={i} style={{
                padding: '8px 12px',
                background: '#fff', border: '1px solid #E8E2D6', borderRadius: 6,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1A1A' }}>
                    {h.subject}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B6B6B' }}>
                    {h.sentByName || 'Admin'} · {h.sentAt ? new Date(h.sentAt).toLocaleDateString() : ''}
                  </div>
                </div>
                <div style={{
                  fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
                  background: '#FBF6E3', color: TOKENS.crimson,
                  padding: '3px 8px', borderRadius: 99,
                }}>
                  {h.kind || 'memo'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TeacherStatusTab({ teacher, onSaved, onClose, toast }) {
  const [reason, setReason] = useState('')
  const [working, setWorking] = useState(false)
  const isActive = teacher.isActive !== false

  // Delete flow state
  const [deleteImpact, setDeleteImpact] = useState(null)   // null | {...} | 'loading'
  const [deleteConfirm, setDeleteConfirm] = useState('')   // typed confirmation
  const [deleting, setDeleting] = useState(false)

  const loadDeleteImpact = async () => {
    setDeleteImpact('loading')
    try {
      const { data } = await api.get('/users/' + teacher._id + '/delete-impact')
      if (data?.success) setDeleteImpact(data.data)
      else { setDeleteImpact(null); toast?.error?.(data?.message || 'Could not check impact.') }
    } catch (e) {
      setDeleteImpact(null)
      toast?.error?.(e?.response?.data?.message || 'Could not check impact.')
    }
  }

  const doDelete = async () => {
    setDeleting(true)
    try {
      const { data } = await api.delete('/users/' + teacher._id)
      if (data?.success) {
        toast?.ok?.(`Teacher deleted. ${data.data?.deactivatedAllocations || 0} allocation(s) deactivated.`)
        onSaved?.()
        onClose?.()
      } else {
        toast?.error?.(data?.message || 'Delete failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  const setActive = async (makeActive) => {
    if (!makeActive && !reason.trim()) {
      toast?.error?.('Please give a reason for deactivation.')
      return
    }
    setWorking(true)
    try {
      const { data } = await api.patch('/users/' + teacher._id, {
        isActive: makeActive,
        ...(makeActive ? {} : { statusReason: reason.trim() }),
      })
      if (data?.success || data?.user) {
        toast?.ok?.(makeActive ? 'Teacher reactivated.' : 'Teacher deactivated.')
        onSaved?.()
      } else {
        toast?.error?.(data?.message || 'Failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Failed.')
    } finally {
      setWorking(false)
    }
  }

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 12px', borderRadius: 6,
    border: '1.5px solid #E8E2D6', fontSize: 13, fontFamily: 'inherit',
  }

  return (
    <div>
      {/* Current status */}
      <div style={{
        padding: 14, borderRadius: 8, marginBottom: 18,
        background: isActive ? '#DCFCE7' : '#FEE2E2',
        border: `1px solid ${isActive ? '#86EFAC' : '#FCA5A5'}`,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: isActive ? '#15803D' : '#B91C1C' }}>
          Current Status
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: isActive ? '#15803D' : '#B91C1C', marginTop: 2 }}>
          {isActive ? 'Active' : 'Deactivated'}
        </div>
        {!isActive && teacher.statusReason && (
          <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4 }}>
            Reason: {teacher.statusReason}
          </div>
        )}
      </div>

      {/* Deactivate / Reactivate */}
      {isActive ? (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
            Temporarily deactivate
          </div>
          <p style={{ fontSize: 12.5, color: '#6B6B6B', margin: '0 0 10px', lineHeight: 1.5 }}>
            The teacher keeps their account and data but cannot log in. Their allocations stay intact and can be restored by reactivating. Use this for suspensions or leave that isn't a formal leave request.
          </p>
          <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: TOKENS.crimson, display: 'block', marginBottom: 4 }}>
            Reason for deactivation
          </label>
          <input value={reason} onChange={e => setReason(e.target.value)}
            placeholder="e.g. Suspended pending review" style={{ ...inp, marginBottom: 10 }}/>
          <button onClick={() => setActive(false)} disabled={working}
            style={{
              background: working ? '#9CA3AF' : '#B45309',
              color: '#fff', border: 'none',
              padding: '9px 18px', borderRadius: 6,
              cursor: working ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
            }}>
            {working ? 'Working...' : 'Deactivate Account'}
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
            Reactivate
          </div>
          <p style={{ fontSize: 12.5, color: '#6B6B6B', margin: '0 0 10px', lineHeight: 1.5 }}>
            Restores login access. Allocations and data are unchanged.
          </p>
          <button onClick={() => setActive(true)} disabled={working}
            style={{
              background: working ? '#9CA3AF' : '#15803D',
              color: '#fff', border: 'none',
              padding: '9px 18px', borderRadius: 6,
              cursor: working ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
            }}>
            {working ? 'Working...' : 'Reactivate Account'}
          </button>
        </div>
      )}

      {/* Permanently delete — MODEL A: content stays with the subject */}
      <div style={{
        padding: 14, borderRadius: 8,
        background: '#FEF2F2', border: '1px solid #FCA5A5',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#B91C1C', marginBottom: 4 }}>
          Permanently delete
        </div>
        <p style={{ fontSize: 12.5, color: '#6B6B6B', margin: '0 0 10px', lineHeight: 1.5 }}>
          Lessons and other teaching content belong to the subject — they are
          kept and pass to whoever teaches the subject next. Deleting this
          teacher only removes their account and deactivates their student
          allocations (which you can then reassign).
        </p>

        {deleteImpact === null && (
          <button onClick={loadDeleteImpact}
            style={{
              background: '#fff', color: '#B91C1C',
              border: '1.5px solid #B91C1C',
              padding: '8px 16px', borderRadius: 6,
              cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
            }}>
            Delete this teacher...
          </button>
        )}

        {deleteImpact === 'loading' && (
          <div style={{ fontSize: 12.5, color: '#6B6B6B' }}>Checking impact...</div>
        )}

        {deleteImpact && deleteImpact !== 'loading' && (
          <div>
            {deleteImpact.blocked ? (
              <div style={{ fontSize: 12.5, color: '#B91C1C', fontWeight: 600 }}>
                This account is protected and cannot be deleted.
              </div>
            ) : (
              <>
                <div style={{
                  background: '#fff', border: '1px solid #FCA5A5',
                  borderRadius: 6, padding: 12, marginBottom: 10,
                  fontSize: 12.5, color: '#1A1A1A',
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Deleting {deleteImpact.teacherName} will:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div>• Deactivate <strong>{deleteImpact.activeAllocations}</strong> active student allocation{deleteImpact.activeAllocations === 1 ? '' : 's'} — reassign these to another teacher afterwards</div>
                    <div>• <strong>Keep</strong> all {deleteImpact.authoredLessons} lesson{deleteImpact.authoredLessons === 1 ? '' : 's'} they authored — these stay with the subject</div>
                    <div>• Remove the teacher's login and account permanently</div>
                  </div>
                </div>
                <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#B91C1C', display: 'block', marginBottom: 4 }}>
                  Type DELETE to confirm
                </label>
                <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '8px 12px', borderRadius: 6,
                    border: '1.5px solid #FCA5A5', fontSize: 13,
                    fontFamily: 'inherit', marginBottom: 10,
                  }}/>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setDeleteImpact(null); setDeleteConfirm('') }}
                    disabled={deleting}
                    style={{
                      background: '#fff', color: '#6B6B6B',
                      border: '1.5px solid #E8E2D6',
                      padding: '8px 16px', borderRadius: 6,
                      cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                    }}>
                    Cancel
                  </button>
                  <button onClick={doDelete}
                    disabled={deleting || deleteConfirm !== 'DELETE'}
                    style={{
                      background: (deleting || deleteConfirm !== 'DELETE') ? '#9CA3AF' : '#B91C1C',
                      color: '#fff', border: 'none',
                      padding: '8px 18px', borderRadius: 6,
                      cursor: (deleting || deleteConfirm !== 'DELETE') ? 'not-allowed' : 'pointer',
                      fontSize: 12.5, fontWeight: 700,
                    }}>
                    {deleting ? 'Deleting...' : 'Permanently Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TeachersModule
