import React, { useState, useEffect } from 'react'
import { api, useToast } from '../../../context/ctx.jsx'

/**
 * AllocationsPage Component - Phase 7
 * Subject-Curriculum Allocation System
 * 3-Point Check: Student has Subject + Curriculum, Teacher has matching teachingSpecialty
 */
export default function AllocationsPage({ toast }) {
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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


  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      'Active': { color: 'var(--g700)', bg: 'var(--g50)', border: 'var(--g100)' },
      'Pending': { color: 'var(--a600)', bg: 'var(--a50)', border: 'var(--a100)' },
      'Inactive': { color: 'var(--s600)', bg: 'var(--s100)', border: 'var(--s200)' },
      'Completed': { color: 'var(--b700)', bg: 'var(--b50)', border: 'var(--b100)' }
    }
    return colors[status] || colors.Active
  }

  const filteredAllocations = allocations.filter(a => {
    const studentName = (a.studentId?.firstName + ' ' + a.studentId?.lastName).toLowerCase()
    const teacherName = (a.teacherId?.firstName + ' ' + a.teacherId?.lastName).toLowerCase()
    const subjectName = (a.subjectId?.subjectName || '').toLowerCase()
    const q = search.toLowerCase()
    return studentName.includes(q) || teacherName.includes(q) || subjectName.includes(q)
  })

  return (
    <div style={{ animation: 'fadeIn .25s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="sec-tag">Allocations</div>
          <h1 className="serif" style={{ fontSize: 28, color: 'var(--s900)' }}>Student <em style={{ color: 'var(--g700)' }}>Allocations</em></h1>
          <p style={{ fontSize: 14, color: 'var(--s500)', marginTop: 3 }}>View all teacher assignments</p>
        </div>
      </div>


      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          className="fi"
          style={{ maxWidth: 400 }}
          placeholder="Search by student, teacher, or subject..."
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
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--s700)' }}>Subject</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--s700)' }}>Curriculum</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--s700)' }}>Teacher</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--s700)' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--s700)' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredAllocations.map((alloc, i) => {
                const statusColor = getStatusColor(alloc.status)
                return (
                  <tr key={alloc._id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : 'var(--s50)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{alloc.studentId?.firstName} {alloc.studentId?.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--s400)' }}>{alloc.studentId?.email}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{alloc.subjectId?.subjectName}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--s700)' }}>{alloc.curriculum}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{alloc.teacherId?.firstName} {alloc.teacherId?.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--s400)' }}>{alloc.teacherId?.email}</div>
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
    </div>
  )
}

