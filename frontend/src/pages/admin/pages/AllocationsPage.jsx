import React, { useState, useEffect } from 'react'
import { api, useToast } from '../../../context/ctx.jsx'

/**
 * AllocationsPage Component
 * Displays teacher-student allocations and allows admin to create new ones
 */
export default function AllocationsPage({ toast }) {
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [teacherMatches, setTeacherMatches] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [creating, setCreating] = useState(false)

  // Fetch allocations on mount
  useEffect(() => {
    fetchAllocations()
  }, [])

  const fetchAllocations = async () => {
    setLoading(true)
    try {
      const res = await api.get('/allocations')
      setAllocations(res.data.allocations || [])
    } catch (e) {
      toast.error('Failed to load allocations: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await api.get('/users/students/list')
      setStudents(res.data.students || [])
    } catch (e) {
      toast.error('Failed to load students')
    }
  }

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/users?role=teacher')
      const teachers = res.data.users ? res.data.users.filter(u => u.role === 'teacher') : []
      setTeachers(teachers)
    } catch (e) {
      // Fallback: teachers might not be directly in users endpoint
      console.warn('Failed to load teachers from users endpoint')
    }
  }

  // Handle student selection to find matches
  const handleStudentSelect = async (studentId) => {
    setSelectedStudent(studentId)
    setLoadingMatches(true)
    setTeacherMatches([])
    setSelectedTeacher(null)

    try {
      const res = await api.get(`/allocations/matches/teachers/${studentId}`)
      setTeacherMatches(res.data.matches || [])
      
      if (!res.data.matches || res.data.matches.length === 0) {
        toast.warn('No compatible teachers found for this student')
      }
    } catch (e) {
      toast.error('Failed to find compatible teachers: ' + e.message)
    } finally {
      setLoadingMatches(false)
    }
  }

  // Create allocation
  const handleCreateAllocation = async () => {
    if (!selectedStudent || !selectedTeacher) {
      toast.error('Please select both a student and teacher')
      return
    }

    setCreating(true)
    try {
      const res = await api.post('/allocations', {
        studentId: selectedStudent,
        teacherId: selectedTeacher,
        sendEmails: true
      })

      toast.ok(`Allocation created! Emails sent to both parties.`)
      
      // Reset form and refresh
      setShowCreateModal(false)
      setSelectedStudent(null)
      setSelectedTeacher(null)
      setTeacherMatches([])
      
      fetchAllocations()
    } catch (e) {
      toast.error('Failed to create allocation: ' + (e.response?.data?.message || e.message))
    } finally {
      setCreating(false)
    }
  }

  // Open modal with data loading
  const handleOpenModal = async () => {
    await Promise.all([fetchStudents(), fetchTeachers()])
    setShowCreateModal(true)
  }

  // Get student name from allocation
  const getStudentName = (allocation) => {
    if (allocation.studentId?.firstName && allocation.studentId?.lastName) {
      return `${allocation.studentId.firstName} ${allocation.studentId.lastName}`
    }
    return 'Unknown'
  }

  // Get teacher name from allocation
  const getTeacherName = (allocation) => {
    if (allocation.teacherId?.firstName && allocation.teacherId?.lastName) {
      return `${allocation.teacherId.firstName} ${allocation.teacherId.lastName}`
    }
    return 'Unknown'
  }

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      'Active': { color: 'var(--g700)', bg: 'var(--g50)', border: 'var(--g100)' },
      'Pending': { color: 'var(--a600)', bg: 'var(--a50)', border: 'var(--a100)' },
      'Inactive': { color: 'var(--s600)', bg: 'var(--s100)', border: 'var(--s200)' },
      'Completed': { color: 'var(--b700)', bg: 'var(--b50)', border: 'var(--b100)' }
    }
    return colors[status] || colors.Pending
  }

  const filteredAllocations = allocations.filter(a => {
    const studentName = getStudentName(a).toLowerCase()
    const teacherName = getTeacherName(a).toLowerCase()
    const q = search.toLowerCase()
    return studentName.includes(q) || teacherName.includes(q)
  })

  return (
    <div style={{ animation: 'fadeIn .25s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="sec-tag">Allocations</div>
          <h1 className="serif" style={{ fontSize: 28, color: 'var(--s900)' }}>Teacher-<em style={{ color: 'var(--g700)' }}>Student</em> Matches</h1>
          <p style={{ fontSize: 14, color: 'var(--s500)', marginTop: 3 }}>Manage tutor allocations and automate matching</p>
        </div>
        <button className="btn btn-p" onClick={handleOpenModal} style={{ marginTop: 4 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Allocation
        </button>
      </div>

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="fi"
          style={{ maxWidth: 300 }}
          placeholder="Search student or teacher name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Allocations Table */}
      {loading ? (
        <div style={{ fontSize: 14, color: 'var(--s500)', padding: 40, textAlign: 'center' }}>
          Loading allocations...
        </div>
      ) : filteredAllocations.length === 0 ? (
        <div style={{ fontSize: 14, color: 'var(--s500)', padding: 40, textAlign: 'center', background: 'var(--s50)', borderRadius: 'var(--rmd)', border: '1px solid var(--border)' }}>
          {search ? 'No allocations match your search' : 'No allocations yet. Create one to get started!'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--s50)' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--s700)' }}>Student</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--s700)' }}>Teacher</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--s700)' }}>Curriculum</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--s700)' }}>Match Score</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--s700)' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--s700)' }}>Emails Sent</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--s700)' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredAllocations.map((alloc, i) => {
                const statusColor = getStatusColor(alloc.status)
                return (
                  <tr key={alloc._id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : 'var(--s50)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{getStudentName(alloc)}</div>
                      <div style={{ fontSize: 12, color: 'var(--s400)' }}>{alloc.studentId?.email}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{getTeacherName(alloc)}</div>
                      <div style={{ fontSize: 12, color: 'var(--s400)' }}>{alloc.teacherId?.email}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {alloc.curriculum || 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--b700)' }}>
                        {alloc.matchScore || 0}%
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        className="badge"
                        style={{
                          color: statusColor.color,
                          background: statusColor.bg,
                          borderColor: statusColor.border
                        }}
                      >
                        {alloc.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {alloc.emailsSent ? (
                        <span style={{ color: 'var(--g700)', fontWeight: 600 }}>✓ Yes</span>
                      ) : (
                        <span style={{ color: 'var(--s400)' }}>No</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', fontSize: 12, color: 'var(--s400)' }}>
                      {new Date(alloc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Allocation Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: 20
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 'var(--rmd)',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,.1)',
            maxWidth: 600,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Create New Allocation</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--s500)' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              {/* Step 1: Select Student */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--s900)' }}>
                  Step 1: Select Student *
                </label>
                <select
                  className="fsel"
                  value={selectedStudent || ''}
                  onChange={e => {
                    const val = e.target.value
                    if (val) {
                      handleStudentSelect(val)
                    }
                  }}
                >
                  <option value="">-- Choose a student --</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName} ({s.curriculum || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Teacher from Matches */}
              {selectedStudent && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--s900)' }}>
                    Step 2: Select Compatible Teacher *
                  </label>

                  {loadingMatches ? (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--s500)' }}>
                      Finding compatible teachers...
                    </div>
                  ) : teacherMatches.length > 0 ? (
                    <div style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--rmd)',
                      maxHeight: 300,
                      overflowY: 'auto'
                    }}>
                      {teacherMatches.map(match => (
                        <div
                          key={match.teacherId}
                          onClick={() => setSelectedTeacher(match.teacherId)}
                          style={{
                            padding: '12px',
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                            background: selectedTeacher === match.teacherId ? 'var(--b50)' : '#fff',
                            borderLeft: selectedTeacher === match.teacherId ? '4px solid var(--b700)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, color: 'var(--s900)' }}>
                                {match.teacherName}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 2 }}>
                                {match.email}
                              </div>
                              {match.matchedSubjects && match.matchedSubjects.length > 0 && (
                                <div style={{ fontSize: 12, color: 'var(--s500)', marginTop: 4 }}>
                                  Subjects: {match.matchedSubjects.map(s => s.subjectName).join(', ')}
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: match.matchScore === 100 ? 'var(--g700)' : 'var(--b700)'
                              }}>
                                {match.matchScore}%
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 2 }}>
                                {match.matchType}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: 20,
                      textAlign: 'center',
                      color: 'var(--r600)',
                      background: 'var(--r50)',
                      borderRadius: 'var(--rmd)',
                      border: '1px solid var(--r100)'
                    }}>
                      No compatible teachers found for this student
                    </div>
                  )}
                </div>
              )}

              {/* Selected Summary */}
              {selectedStudent && selectedTeacher && (
                <div style={{
                  padding: 14,
                  background: 'var(--g50)',
                  border: '1px solid var(--g100)',
                  borderRadius: 'var(--rmd)',
                  marginBottom: 20
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', marginBottom: 8 }}>
                    ✓ Ready to allocate
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--s900)' }}>
                    {students.find(s => s._id === selectedStudent)?.firstName}{' '}
                    {students.find(s => s._id === selectedStudent)?.lastName}
                    {' '}<span style={{ color: 'var(--s400)' }}>→</span>{' '}
                    {teacherMatches.find(m => m.teacherId === selectedTeacher)?.teacherName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 4 }}>
                    Match Score:{' '}
                    <span style={{ fontWeight: 600, color: 'var(--b700)' }}>
                      {teacherMatches.find(m => m.teacherId === selectedTeacher)?.matchScore}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 10,
              justifyContent: 'flex-end'
            }}>
              <button
                className="btn btn-s"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-p"
                onClick={handleCreateAllocation}
                disabled={!selectedStudent || !selectedTeacher || creating}
              >
                {creating ? 'Creating...' : 'Create & Send Emails'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

