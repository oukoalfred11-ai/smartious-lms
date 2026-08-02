import React, { useState, useEffect } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { SCHOOL_CURRICULA, TOKENS } from '../shared/tokens.js'
import { PCard, PKpi, PSection } from '../shared/ui.jsx'

function StudentsManagementModule({ refreshKey, toast }) {
  const [students, setStudents]       = useState([])
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filterStatus, setFilterStatus] = useState('all')   // all | unallocated | partial | full
  const [selectedStudent, setSelectedStudent] = useState(null)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [studs, allocs] = await Promise.all([
        api.get('/users/students/list'),
        api.get('/allocations'),
      ])
      setStudents(studs.data.students || studs.data.data?.students || [])
      setAllocations(allocs.data.allocations || allocs.data.data?.allocations || [])
    } catch (e) {
      toast?.error?.('Failed to load students: ' + (e?.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { loadAll() }, [refreshKey])

  // Build student summaries — count subjects vs. allocated subjects.
  // Since student.subjects is name strings, we count distinct teachers per
  // student rather than trying to map names → subjectIds here. The detail
  // panel does the proper Subject lookup.
  const summaries = students.map(s => {
    const subjectNames = Array.isArray(s.subjects) ? s.subjects : []
    const myAllocs = allocations.filter(a =>
      a.studentId?._id === s._id && a.status === 'Active' && a.teacherId
    )
    return {
      ...s,
      subjectCount:   subjectNames.length,
      allocatedCount: myAllocs.length,
      pendingCount:   Math.max(0, subjectNames.length - myAllocs.length),
      myAllocations:  myAllocs,
    }
  })

  const totalPending = summaries.reduce((sum, s) => sum + s.pendingCount, 0)
  const totalAllocated = summaries.reduce((sum, s) => sum + s.allocatedCount, 0)
  const fullyAllocated = summaries.filter(s => s.subjectCount > 0 && s.pendingCount === 0).length

  const filtered = summaries.filter(s => {
    // Search
    if (search) {
      const q = search.toLowerCase()
      const name = ((s.firstName || '') + ' ' + (s.lastName || '')).toLowerCase()
      if (!name.includes(q) && !(s.email || '').toLowerCase().includes(q) && !(s.admissionNumber || '').toLowerCase().includes(q))
        return false
    }
    // Status filter
    if (filterStatus === 'unallocated' && s.allocatedCount > 0) return false
    if (filterStatus === 'partial' && (s.pendingCount === 0 || s.allocatedCount === 0)) return false
    if (filterStatus === 'full' && (s.pendingCount > 0 || s.subjectCount === 0)) return false
    return true
  })

  const statusOf = (s) => {
    if (s.subjectCount === 0)   return { label: 'No subjects', color: TOKENS.accentSlate }
    if (s.allocatedCount === 0) return { label: 'No allocations', color: TOKENS.accentRose }
    if (s.pendingCount > 0)     return { label: `${s.pendingCount} pending`, color: TOKENS.accentAmber }
    return { label: 'All allocated', color: TOKENS.accentEmerald }
  }

  return (
    <>
      <PSection
        tag="Student Management"
        title="Manage"
        em="Students"
        sub="Curriculum, subjects, and teacher allocations — all in one place."
      />

      <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <PKpi label="Students" value={students.length}/>
        <PKpi label="Fully Allocated" value={fullyAllocated} delta={`${students.length > 0 ? Math.round(fullyAllocated / students.length * 100) : 0}% of cohort`} deltaColor={TOKENS.accentEmerald}/>
        <PKpi label="Active Allocations" value={totalAllocated}/>
        <PKpi label="Pending" value={totalPending} delta={totalPending > 0 ? 'Need teachers' : 'All caught up'} deltaColor={totalPending > 0 ? TOKENS.accentAmber : TOKENS.accentEmerald}/>
      </div>

      <PCard padding={16} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="fi"
            placeholder="Search by name, email, or admission #..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 240, maxWidth: 420 }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'all',         label: 'All' },
              { id: 'unallocated', label: 'Unallocated' },
              { id: 'partial',     label: 'Partial' },
              { id: 'full',        label: 'Fully allocated' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setFilterStatus(opt.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 99,
                  border: `1.5px solid ${filterStatus === opt.id ? TOKENS.crimson : TOKENS.line || '#E8E2D6'}`,
                  background: filterStatus === opt.id ? TOKENS.crimson : '#fff',
                  color: filterStatus === opt.id ? '#fff' : TOKENS.crimson,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </PCard>

      {loading ? (
        <PCard padding={60}>
          <div style={{ textAlign: 'center', color: '#6B6B6B' }}>Loading students...</div>
        </PCard>
      ) : filtered.length === 0 ? (
        <PCard padding={60}>
          <div style={{ textAlign: 'center', color: '#6B6B6B' }}>No students match.</div>
        </PCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(s => {
            const stat = statusOf(s)
            return (
              <PCard key={s._id} padding={14} style={{ cursor: 'pointer' }}>
                <div onClick={() => setSelectedStudent(s)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: TOKENS.crimson, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {(s.firstName?.[0] || '') + (s.lastName?.[0] || '')}
                  </div>
                  {/* Name + email */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: TOKENS.ink || '#1A1A1A' }}>
                      {s.firstName} {s.lastName}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>
                      {s.email}
                      {s.admissionNumber && <> · {s.admissionNumber}</>}
                    </div>
                  </div>
                  {/* Curriculum */}
                  <div style={{
                    background: TOKENS.goldPale, color: TOKENS.crimson,
                    fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em',
                    padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase',
                    minWidth: 70, textAlign: 'center',
                  }}>
                    {s.curriculum || 'No curr'}
                  </div>
                  {/* Subject count */}
                  <div style={{ minWidth: 90, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 700, color: TOKENS.ink || '#1A1A1A' }}>
                      {s.allocatedCount}/{s.subjectCount}
                    </div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#6B6B6B', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                      Allocated
                    </div>
                  </div>
                  {/* Status pill */}
                  <div style={{
                    background: stat.color + '15', color: stat.color,
                    fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em',
                    padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase',
                  }}>
                    {stat.label}
                  </div>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6B6B6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </PCard>
            )
          })}
        </div>
      )}

      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          allocations={selectedStudent.myAllocations}
          onClose={() => setSelectedStudent(null)}
          onChanged={() => { loadAll() }}
          toast={toast}
        />
      )}
    </>
  )
}

function StudentDetailModal({ student, allocations: initialAllocs, onClose, onChanged, toast }) {
  const [curriculum, setCurriculum] = useState(student.curriculum || '')
  const [subjects, setSubjects]     = useState(Array.isArray(student.subjects) ? [...student.subjects] : [])
  const [subjectCatalog, setSubjectCatalog] = useState([])     // Subject docs for current curriculum
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [allocs, setAllocs] = useState(initialAllocs || [])
  const [allocateFor, setAllocateFor] = useState(null)         // { subjectName, subjectId }
  const [showSubjectPicker, setShowSubjectPicker] = useState(false)
  const [saving, setSaving] = useState(false)

  // Canonical curricula list (matches Subject catalog ids stored
  // server-side). Old admin-edited students may have a legacy
  // curriculum string ('IGCSE', 'A-Level' etc.) that doesn't match
  // any canonical id — handled in the dropdown render below.
  const CURRICULA = SCHOOL_CURRICULA

  // Load Subject catalog for the chosen curriculum so we can resolve names→IDs
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!curriculum) { setSubjectCatalog([]); return }
      setCatalogLoading(true)
      try {
        const { data } = await api.get('/subjects', { params: { curriculum } })
        if (cancelled) return
        setSubjectCatalog(data.subjects || [])
      } catch (e) {
        toast?.error?.('Failed to load subject catalog.')
      } finally {
        if (!cancelled) setCatalogLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [curriculum, toast])

  // Resolve student.subjects (names) into Subject documents for the picker UI
  const enrolledSubjectDocs = subjects
    .map(name => subjectCatalog.find(s => s.subjectName === name))
    .filter(Boolean)

  // For each enrolled subject, find its allocation (if any)
  const allocationFor = (subjectId) => {
    return allocs.find(a =>
      (a.subjectId?._id || a.subjectId) === subjectId && a.status === 'Active'
    )
  }

  // Save curriculum + subjects changes
  const saveBasics = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch('/users/' + student._id, {
        curriculum,
        subjects,
      })
      if (data?.success || data?.user) {
        toast?.ok?.('Saved.')
        onChanged?.()
      } else {
        toast?.error?.(data?.message || 'Save failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  // Removing a subject. If allocated, also deactivate the allocation.
  const removeSubject = async (subjectName) => {
    if (!window.confirm(`Remove ${subjectName} from this student? Any teacher allocation for this subject will be deactivated.`)) return
    const subj = subjectCatalog.find(s => s.subjectName === subjectName)
    const alloc = subj ? allocationFor(subj._id) : null

    if (alloc) {
      try {
        await api.patch('/allocations/' + alloc._id, { status: 'Inactive' })
      } catch (e) {
        toast?.error?.('Failed to deactivate allocation: ' + (e?.response?.data?.message || e.message))
        return
      }
    }

    // Now remove from subjects list and save
    const newSubjects = subjects.filter(s => s !== subjectName)
    setSubjects(newSubjects)
    try {
      await api.patch('/users/' + student._id, { subjects: newSubjects })
      // Refresh allocations
      const { data } = await api.get('/allocations/student/' + student._id)
      setAllocs(data.allocations || [])
      toast?.ok?.('Subject removed.')
      onChanged?.()
    } catch (e) {
      toast?.error?.('Failed to remove subject.')
    }
  }

  // After allocate or reallocate succeeds, refetch allocs
  const refetchAllocs = async () => {
    try {
      const { data } = await api.get('/allocations/student/' + student._id)
      setAllocs(data.allocations || [])
      onChanged?.()
    } catch (e) { /* silent */ }
  }

  // Unassign a teacher (deactivate)
  const unassignTeacher = async (alloc) => {
    if (!window.confirm('Unassign this teacher? The student will lose access to lessons for this subject until reallocated.')) return
    try {
      await api.patch('/allocations/' + alloc._id, { status: 'Inactive' })
      toast?.ok?.('Teacher unassigned.')
      refetchAllocs()
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Failed to unassign.')
    }
  }

  const dirty = curriculum !== (student.curriculum || '') ||
                JSON.stringify(subjects.sort()) !== JSON.stringify((Array.isArray(student.subjects) ? student.subjects : []).slice().sort())

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
        maxWidth: 760, width: '100%', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: `linear-gradient(135deg, ${TOKENS.crimson} 0%, ${TOKENS.crimsonDeep} 100%)`,
          color: TOKENS.cream,
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#F0CC5A' }}>
            Manage Student
          </div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, marginTop: 2 }}>
            {student.firstName} {student.lastName}
          </div>
          <div style={{ fontSize: 12, opacity: .85, marginTop: 4 }}>
            {student.email}{student.admissionNumber && <> · {student.admissionNumber}</>}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflow: 'auto', flex: 1 }}>
          {/* Curriculum + actions */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: TOKENS.crimson, marginBottom: 6 }}>
              Curriculum
            </label>
            <select value={curriculum} onChange={e => setCurriculum(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: 6,
                border: '1.5px solid #E8E2D6',
                fontSize: 13, fontFamily: 'inherit',
                minWidth: 240,
              }}>
              <option value="">— Select —</option>
              {/* If the student's saved curriculum isn't in the canonical
                  list (legacy 'IGCSE', 'A-Level' etc.), show it as a
                  disabled "legacy" option so the dropdown reflects the
                  saved value rather than appearing blank. */}
              {curriculum && !CURRICULA.some(c => c.id === curriculum) && (
                <option value={curriculum}>{curriculum} (legacy — please re-select)</option>
              )}
              {CURRICULA.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {curriculum && curriculum !== student.curriculum && (
              <div style={{
                marginTop: 8, padding: 10,
                background: '#FEF3C7', border: '1px solid #F59E0B',
                borderRadius: 6, fontSize: 12, color: '#92400E',
              }}>
                Changing curriculum will keep existing subject names, but most won't match the new curriculum's catalog. You'll likely need to re-pick subjects.
              </div>
            )}
          </div>

          {/* Subjects + Allocations */}
          <div style={{ marginBottom: 14 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 8,
            }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: TOKENS.crimson }}>
                Subjects &amp; Teachers ({subjects.length})
              </label>
              <button onClick={() => setShowSubjectPicker(true)}
                disabled={!curriculum || catalogLoading}
                style={{
                  background: '#fff', color: TOKENS.crimson,
                  border: `1.5px solid ${TOKENS.crimson}`,
                  padding: '5px 12px', borderRadius: 6,
                  cursor: !curriculum || catalogLoading ? 'not-allowed' : 'pointer',
                  fontSize: 11.5, fontWeight: 700,
                  opacity: !curriculum || catalogLoading ? .5 : 1,
                }}>
                + Edit Subjects
              </button>
            </div>

            {subjects.length === 0 ? (
              <div style={{ padding: 18, background: '#FBFAF5', borderRadius: 6, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>
                No subjects yet. Click "Edit Subjects" to enrol.
              </div>
            ) : catalogLoading ? (
              <div style={{ padding: 18, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>
                Loading catalog...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {subjects.map(name => {
                  const subj = subjectCatalog.find(s => s.subjectName === name)
                  if (!subj) {
                    return (
                      <div key={name} style={{
                        padding: '10px 12px',
                        background: '#FEE2E2', border: '1px solid #FCA5A5',
                        borderRadius: 6, fontSize: 12.5, color: '#991B1B',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                      }}>
                        <span><strong>{name}</strong> — not in {curriculum} catalog</span>
                        <button onClick={() => removeSubject(name)}
                          style={{
                            background: 'transparent', color: '#991B1B',
                            border: '1px solid #991B1B',
                            padding: '3px 8px', borderRadius: 4,
                            cursor: 'pointer', fontSize: 11, fontWeight: 700,
                          }}>
                          Remove
                        </button>
                      </div>
                    )
                  }
                  const alloc = allocationFor(subj._id)
                  return (
                    <div key={name} style={{
                      padding: '10px 12px',
                      background: '#fff', border: '1px solid #E8E2D6',
                      borderRadius: 6,
                      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                    }}>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>
                          {subj.subjectName}
                        </div>
                        <div style={{ fontSize: 11, color: '#6B6B6B' }}>
                          {subj.category}
                        </div>
                      </div>
                      {alloc ? (
                        <>
                          <div style={{
                            background: '#DCFCE7', color: '#15803D',
                            fontSize: 11, fontWeight: 700,
                            padding: '4px 10px', borderRadius: 99,
                          }}>
                            ✓ {alloc.teacherId?.firstName} {alloc.teacherId?.lastName}
                          </div>
                          <button onClick={() => setAllocateFor({ subjectId: subj._id, subjectName: subj.subjectName, currentAlloc: alloc })}
                            style={{
                              background: 'transparent', color: TOKENS.crimson,
                              border: '1px solid #E8E2D6',
                              padding: '4px 10px', borderRadius: 4,
                              cursor: 'pointer', fontSize: 11, fontWeight: 700,
                            }}>
                            Reassign
                          </button>
                          <button onClick={() => unassignTeacher(alloc)}
                            style={{
                              background: '#FEE2E2', color: '#B91C1C',
                              border: 'none',
                              padding: '4px 8px', borderRadius: 4,
                              cursor: 'pointer', fontSize: 11, fontWeight: 700,
                            }}>
                            Unassign
                          </button>
                        </>
                      ) : (
                        <>
                          <div style={{
                            background: '#FEF3C7', color: '#92400E',
                            fontSize: 11, fontWeight: 700,
                            padding: '4px 10px', borderRadius: 99,
                          }}>
                            No teacher
                          </div>
                          <button onClick={() => setAllocateFor({ subjectId: subj._id, subjectName: subj.subjectName })}
                            style={{
                              background: TOKENS.crimson, color: '#fff',
                              border: 'none',
                              padding: '5px 12px', borderRadius: 4,
                              cursor: 'pointer', fontSize: 11, fontWeight: 700,
                            }}>
                            Allocate
                          </button>
                        </>
                      )}
                      <button onClick={() => removeSubject(name)} title="Remove subject"
                        style={{
                          background: 'transparent', border: 'none',
                          color: '#6B6B6B', cursor: 'pointer',
                          padding: 4,
                        }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>


        <div style={{
          padding: '12px 24px',
          background: '#FBFAF5', borderTop: '1px solid #E8E2D6',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose} disabled={saving}
            style={{
              background: '#fff', color: TOKENS.crimson,
              border: '1.5px solid #E8E2D6',
              padding: '9px 18px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            Close
          </button>
          <button onClick={saveBasics} disabled={saving || !dirty}
            style={{
              background: saving || !dirty ? '#9CA3AF' : TOKENS.crimson,
              color: '#fff', border: 'none',
              padding: '9px 22px', borderRadius: 6,
              cursor: saving || !dirty ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
            }}>
            {saving ? 'Saving...' : (dirty ? 'Save Changes' : 'No changes')}
          </button>
        </div>
      </div>

      {/* SUBJECT PICKER */}
      {showSubjectPicker && (
        <SubjectPickerModal
          curriculum={curriculum}
          catalog={subjectCatalog}
          initial={subjects}
          onClose={() => setShowSubjectPicker(false)}
          onSave={(newList) => { setSubjects(newList); setShowSubjectPicker(false) }}
        />
      )}

      {/* ALLOCATE TEACHER */}
      {allocateFor && (
        <AllocateTeacherModal
          studentId={student._id}
          studentName={`${student.firstName} ${student.lastName}`}
          curriculum={curriculum}
          subjectId={allocateFor.subjectId}
          subjectName={allocateFor.subjectName}
          currentAlloc={allocateFor.currentAlloc}
          onClose={() => setAllocateFor(null)}
          onSaved={() => { setAllocateFor(null); refetchAllocs() }}
          toast={toast}
        />
      )}
    </div>
  )
}

function SubjectPickerModal({ curriculum, catalog, initial, onClose, onSave }) {
  const [picked, setPicked] = useState(new Set(initial))
  const [search, setSearch] = useState('')

  const toggle = (name) => {
    setPicked(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const filtered = catalog.filter(s =>
    !search.trim() || s.subjectName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'rgba(0,0,0,.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 12,
        maxWidth: 620, width: '100%', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        <div style={{
          padding: '16px 24px',
          background: `linear-gradient(135deg, ${TOKENS.crimson} 0%, ${TOKENS.crimsonDeep} 100%)`,
          color: TOKENS.cream,
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#F0CC5A' }}>
            Subjects
          </div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, marginTop: 2 }}>
            Edit Enrolled Subjects · {curriculum}
          </div>
          <div style={{ fontSize: 12, opacity: .85, marginTop: 4 }}>
            {picked.size} selected of {catalog.length} available
          </div>
        </div>
        <div style={{ padding: '16px 24px', flex: 1, overflow: 'auto' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search subjects..."
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px', borderRadius: 6,
              border: '1.5px solid #E8E2D6',
              fontSize: 13, marginBottom: 10, fontFamily: 'inherit',
            }}/>
          {filtered.length === 0 ? (
            <div style={{ padding: 14, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>
              No subjects match.
            </div>
          ) : (
            <div style={{
              maxHeight: '50vh', overflowY: 'auto',
              border: '1px solid #E8E2D6', borderRadius: 6, padding: 6,
            }}>
              {filtered.map(s => {
                const isPicked = picked.has(s.subjectName)
                return (
                  <div key={s._id}
                    onClick={() => toggle(s.subjectName)}
                    style={{
                      padding: '7px 10px', cursor: 'pointer',
                      background: isPicked ? '#FBF6E3' : 'transparent',
                      borderRadius: 4,
                      display: 'flex', alignItems: 'center', gap: 10,
                      marginBottom: 2,
                    }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 3,
                      border: `1.5px solid ${isPicked ? TOKENS.crimson : '#E8E2D6'}`,
                      background: isPicked ? TOKENS.crimson : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {isPicked && (
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, fontSize: 13 }}>
                      <strong>{s.subjectName}</strong>{' '}
                      <span style={{ color: '#6B6B6B', fontSize: 11.5 }}>({s.category})</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div style={{
          padding: '12px 24px',
          background: '#FBFAF5', borderTop: '1px solid #E8E2D6',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose}
            style={{
              background: '#fff', color: TOKENS.crimson,
              border: '1.5px solid #E8E2D6',
              padding: '9px 18px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            Cancel
          </button>
          <button onClick={() => onSave([...picked])}
            style={{
              background: TOKENS.crimson, color: '#fff', border: 'none',
              padding: '9px 22px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            Use {picked.size} Subject{picked.size === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AllocateTeacherModal({ studentId, studentName, curriculum, subjectId, subjectName, currentAlloc, onClose, onSaved, toast }) {
  const [qualifiedTeachers, setQualifiedTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pickedTeacherId, setPickedTeacherId] = useState(String(currentAlloc?.teacherId?._id || currentAlloc?.teacherId || ''))
  const [canBeGrouped, setCanBeGrouped] = useState(currentAlloc?.canBeGrouped || false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const { data } = await api.get('/users/teachers/qualified', {
          params: { subjectId, curriculum },
        })
        if (cancelled) return
        setQualifiedTeachers(data.teachers || [])
      } catch (e) {
        toast?.error?.('Failed to load teachers: ' + (e?.response?.data?.message || e.message))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [subjectId, curriculum, toast])

  const save = async () => {
    if (!pickedTeacherId) { toast?.error?.('Pick a teacher.'); return }
    if (currentAlloc && pickedTeacherId === String(currentAlloc.teacherId?._id || currentAlloc.teacherId || '')) { onClose(); return }

    setSaving(true)
    try {
      if (currentAlloc) {
        // Reassign existing allocation
        const { data } = await api.patch('/allocations/' + currentAlloc._id, {
          teacherId: pickedTeacherId,
        })
        if (data?.success) {
          toast?.ok?.('Teacher reassigned.')
          onSaved?.()
        } else {
          toast?.error?.(data?.message || 'Failed to reassign.')
        }
      } else {
        // Create new allocation
        const { data } = await api.post('/allocations', {
          studentId, subjectId, teacherId: pickedTeacherId,
          sendEmails: true, canBeGrouped,
        })
        if (data?.success) {
          toast?.ok?.('Teacher allocated.')
          onSaved?.()
        } else {
          toast?.error?.(data?.message || 'Failed to allocate.')
        }
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'rgba(0,0,0,.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 12,
        maxWidth: 540, width: '100%', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        <div style={{
          padding: '16px 24px',
          background: `linear-gradient(135deg, ${TOKENS.crimson} 0%, ${TOKENS.crimsonDeep} 100%)`,
          color: TOKENS.cream,
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#F0CC5A' }}>
            {currentAlloc ? 'Reassign Teacher' : 'Allocate Teacher'}
          </div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, marginTop: 2 }}>
            {subjectName} · {curriculum}
          </div>
          <div style={{ fontSize: 12, opacity: .85, marginTop: 4 }}>
            For {studentName}
          </div>
        </div>
        <div style={{ padding: '16px 24px', flex: 1, overflow: 'auto' }}>
          {loading ? (
            <div style={{ padding: 18, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>
              Finding qualified teachers...
            </div>
          ) : qualifiedTeachers.length === 0 ? (
            <div style={{
              padding: 18, background: '#FEE2E2',
              border: '1px solid #FCA5A5', borderRadius: 6,
              fontSize: 12.5, color: '#991B1B',
            }}>
              <strong>No qualified teachers found.</strong>
              <div style={{ marginTop: 4 }}>
                No active teacher has <strong>{subjectName}</strong> for <strong>{curriculum}</strong> in their teaching specialties.
                Ask a teacher to add this pair in Manage My Subject → My Specialties.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {qualifiedTeachers.map(t => {
                const isPicked = pickedTeacherId === String(t._id)
                const isCurrent = String(currentAlloc?.teacherId?._id || currentAlloc?.teacherId || '') === String(t._id)
                return (
                  <div key={t._id}
                    onClick={() => setPickedTeacherId(t._id)}
                    style={{
                      padding: '10px 12px', cursor: 'pointer',
                      border: `1.5px solid ${isPicked ? TOKENS.crimson : '#E8E2D6'}`,
                      background: isPicked ? '#FBF6E3' : '#fff',
                      borderRadius: 6,
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: `1.5px solid ${isPicked ? TOKENS.crimson : '#E8E2D6'}`,
                      background: isPicked ? TOKENS.crimson : '#fff',
                      flexShrink: 0,
                    }}/>
                    <div style={{ flex: 1, fontSize: 13 }}>
                      <strong>{t.firstName} {t.lastName}</strong>
                      <div style={{ fontSize: 11, color: '#6B6B6B' }}>{t.email}</div>
                    </div>
                    {isCurrent && (
                      <div style={{
                        background: '#DCFCE7', color: '#15803D',
                        fontSize: 10, fontWeight: 700, letterSpacing: '.05em',
                        padding: '3px 8px', borderRadius: 99, textTransform: 'uppercase',
                      }}>
                        Current
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        {!currentAlloc && (
          <div style={{ padding:'12px 20px', borderTop:'1px solid #E8E2D6', background:'#FFFBF0' }}>
            <label style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer' }}>
              <div style={{ position:'relative', width:40, height:22, flexShrink:0, marginTop:2 }}>
                <input type="checkbox" checked={canBeGrouped} onChange={e => setCanBeGrouped(e.target.checked)} style={{ opacity:0, width:0, height:0 }}/>
                <span style={{ position:'absolute', inset:0, background:canBeGrouped?TOKENS.crimson:'#D1D5DB', borderRadius:99, transition:'background .2s' }}/>
                <span style={{ position:'absolute', top:3, left:canBeGrouped?21:3, width:16, height:16, background:'#fff', borderRadius:'50%', transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }}/>
              </div>
              <div>
                <div style={{ fontSize:12.5, fontWeight:700, color:TOKENS.s900, marginBottom:2 }}>Can be grouped with similar students</div>
                <div style={{ fontSize:11, color:TOKENS.s500, lineHeight:1.5 }}>On = shared class slot with others on the same subject. Off = dedicated 1-to-1 slot.</div>
              </div>
            </label>
          </div>
        )}

        <div style={{
          padding: '12px 24px',
          background: '#FBFAF5', borderTop: '1px solid #E8E2D6',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose} disabled={saving}
            style={{
              background: '#fff', color: TOKENS.crimson,
              border: '1.5px solid #E8E2D6',
              padding: '9px 18px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving || loading || !pickedTeacherId}
            style={{
              background: saving || !pickedTeacherId ? '#9CA3AF' : TOKENS.crimson,
              color: '#fff', border: 'none',
              padding: '9px 22px', borderRadius: 6,
              cursor: saving || !pickedTeacherId ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
            }}>
            {saving ? 'Saving...' : (currentAlloc ? 'Reassign' : 'Allocate')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentsManagementModule
