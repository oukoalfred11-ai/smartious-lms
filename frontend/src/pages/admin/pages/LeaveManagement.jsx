import React, { useState, useEffect } from 'react'
import { useToast, api } from '../../../context/ctx.jsx'
import Modal from '../../../components/ui/Modal.jsx'

const Av = ({ init, col, size = 34 }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: col + '20', color: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono,monospace', fontSize: Math.round(size * .32), fontWeight: 700, flexShrink: 0 }}>
    {init}
  </div>
)

const statusMap = {
  Pending: { color: 'var(--a600)', bg: 'var(--a50)', border: 'var(--a100)' },
  Approved: { color: 'var(--g600)', bg: 'var(--g50)', border: 'var(--g100)' },
  Rejected: { color: 'var(--r600)', bg: 'var(--r50)', border: 'var(--r100)' },
  Cancelled: { color: 'var(--s600)', bg: 'var(--s100)', border: 'var(--s200)' },
}

export default function LeaveManagement() {
  const toast = useToast()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('Pending')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [detailModal, setDetailModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectModal, setRejectModal] = useState(false)

  // Fetch leave requests
  const fetchLeaveRequests = async (status = 'Pending') => {
    setLoading(true)
    try {
      const res = await api.get(`/leave-requests?status=${status}`)
      if (res.data.success) {
        setLeaveRequests(res.data.leaveRequests || [])
      }
    } catch (err) {
      console.error('Error fetching leave requests:', err)
      toast.error('Failed to load leave requests')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLeaveRequests(filterStatus)
  }, [filterStatus])

  const handleApproveLeave = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this leave request?')) return
    
    try {
      const res = await api.patch(`/leave-requests/${requestId}/approve`)
      if (res.data.success) {
        toast.ok(`Leave request approved! ${res.data.affectedAllocations} student(s) affected and marked for reassignment.`)
        setDetailModal(false)
        fetchLeaveRequests(filterStatus)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve request')
    }
  }

  const handleRejectLeave = async (requestId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      const res = await api.patch(`/leave-requests/${requestId}/reject`, { rejectionReason })
      if (res.data.success) {
        toast.ok('Leave request rejected')
        setRejectModal(false)
        setRejectionReason('')
        setDetailModal(false)
        fetchLeaveRequests(filterStatus)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request')
    }
  }

  const getDayCount = (start, end) => {
    const s = new Date(start)
    const e = new Date(end)
    return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1
  }

  const getDateRange = (start, end) => {
    const s = new Date(start)
    const e = new Date(end)
    return `${s.toLocaleDateString('en-GB', { day: 'short', month: 'short' })} – ${e.toLocaleDateString('en-GB', { day: 'short', month: 'short', year: 'numeric' })}`
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div className="sec-tag">Human Resources</div>
        <h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>Teacher <em style={{ color: 'var(--b700)' }}>Leave Management</em></h2>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Pending', count: leaveRequests.length, color: 'var(--a600)', onClick: () => setFilterStatus('Pending') },
          { label: 'Approved', count: leaveRequests.filter(r => r.status === 'Approved').length, color: 'var(--g600)', onClick: () => setFilterStatus('Approved') },
          { label: 'Rejected', count: leaveRequests.filter(r => r.status === 'Rejected').length, color: 'var(--r600)', onClick: () => setFilterStatus('Rejected') },
          { label: 'Cancelled', count: leaveRequests.filter(r => r.status === 'Cancelled').length, color: 'var(--s600)', onClick: () => setFilterStatus('Cancelled') },
        ].map((stat, i) => (
          <div key={i} className="kpi" onClick={stat.onClick} style={{ cursor: 'pointer' }}>
            <div className="kpi-v" style={{ color: stat.color }}>{stat.count}</div>
            <div className="kpi-l">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['Pending', 'Approved', 'Rejected', 'Cancelled'].map(status => (
          <button
            key={status}
            className={`btn btn-sm ${filterStatus === status ? 'btn-p' : 'btn-s'}`}
            onClick={() => setFilterStatus(status)}
            style={{ fontSize: 12 }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Leave Requests Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            Loading...
          </div>
        ) : leaveRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>
            No {filterStatus.toLowerCase()} leave requests found
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Applied</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((req) => {
                const statusColor = statusMap[req.status]
                const dayCount = getDayCount(req.leaveStartDate, req.leaveEndDate)
                return (
                  <tr key={req._id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedRequest(req); setDetailModal(true) }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Av init={req.teacherName?.split(' ').map(n => n[0]).join('') || 'T'} col="#3B82F6" size={34} />
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {req.teacherName}
                          <div style={{ fontSize: 11, color: 'var(--s400)', fontWeight: 400, marginTop: 2 }}>{req.teacherEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{req.leaveType}</span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--s600)' }}>
                      {getDateRange(req.leaveStartDate, req.leaveEndDate)}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--s600)', fontWeight: 600 }}>
                      {dayCount} day{dayCount !== 1 ? 's' : ''}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--s500)', maxWidth: 200 }}>
                      {req.leaveReason.substring(0, 50)}{req.leaveReason.length > 50 ? '...' : ''}
                    </td>
                    <td>
                      <span className="badge" style={statusColor}>{req.status}</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--s400)' }}>
                      {new Date(req.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td>
                      <button className="btn btn-g btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); setDetailModal(true) }}>View</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      <Modal open={detailModal} onClose={() => { setDetailModal(false); setSelectedRequest(null); setRejectModal(false) }} title="Leave Request Details" size="md"
        footer={selectedRequest && selectedRequest.status === 'Pending' ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ok" onClick={() => handleApproveLeave(selectedRequest._id)}>Approve Leave</button>
            <button className="btn btn-d btn-sm" onClick={() => setRejectModal(true)}>Reject</button>
            <button className="btn btn-s" onClick={() => setDetailModal(false)}>Close</button>
          </div>
        ) : (
          <button className="btn btn-s" onClick={() => setDetailModal(false)}>Close</button>
        )}>
        {selectedRequest && (
          <div>
            {/* Teacher Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <Av init={selectedRequest.teacherName?.split(' ').map(n => n[0]).join('') || 'T'} col="#3B82F6" size={44} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedRequest.teacherName}</div>
                <div style={{ fontSize: 13, color: 'var(--s500)' }}>{selectedRequest.teacherEmail}</div>
              </div>
            </div>

            {/* Leave Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s400)', textTransform: 'uppercase', marginBottom: 4 }}>Leave Type</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedRequest.leaveType}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s400)', textTransform: 'uppercase', marginBottom: 4 }}>Status</div>
                <span className="badge" style={statusMap[selectedRequest.status]}>{selectedRequest.status}</span>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s400)', textTransform: 'uppercase', marginBottom: 4 }}>Start Date</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{new Date(selectedRequest.leaveStartDate).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s400)', textTransform: 'uppercase', marginBottom: 4 }}>End Date</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{new Date(selectedRequest.leaveEndDate).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
              </div>
            </div>

            {/* Duration */}
            <div style={{ background: 'var(--b50)', border: '1px solid var(--b100)', borderRadius: 'var(--rmd)', padding: 12, marginBottom: 16, fontSize: 13 }}>
              <strong>Duration:</strong> {getDayCount(selectedRequest.leaveStartDate, selectedRequest.leaveEndDate)} working day{getDayCount(selectedRequest.leaveStartDate, selectedRequest.leaveEndDate) !== 1 ? 's' : ''}
            </div>

            {/* Reason */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s400)', textTransform: 'uppercase', marginBottom: 6 }}>Reason for Leave</div>
              <div style={{ fontSize: 13, color: 'var(--s700)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--rmd)', padding: 12 }}>
                {selectedRequest.leaveReason}
              </div>
            </div>

            {/* Affected Allocations */}
            {selectedRequest.status === 'Approved' && selectedRequest.affectedAllocations && selectedRequest.affectedAllocations.length > 0 && (
              <div style={{ marginBottom: 16, background: 'var(--a50)', border: '1px solid var(--a100)', borderRadius: 'var(--rmd)', padding: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--a700)', fontWeight: 600, marginBottom: 6 }}>
                  ⚠ {selectedRequest.affectedAllocations.length} Student(s) Affected
                </div>
                <div style={{ fontSize: 12, color: 'var(--a600)' }}>
                  These students need to be reassigned to another teacher during the leave period.
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {selectedRequest.status === 'Rejected' && selectedRequest.rejectionReason && (
              <div style={{ marginBottom: 16, background: 'var(--r50)', border: '1px solid var(--r100)', borderRadius: 'var(--rmd)', padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--r600)', marginBottom: 6 }}>Rejection Reason</div>
                <div style={{ fontSize: 13, color: 'var(--r700)' }}>
                  {selectedRequest.rejectionReason}
                </div>
              </div>
            )}

            {/* Approval Details */}
            {selectedRequest.status === 'Approved' && selectedRequest.approvalDate && (
              <div style={{ background: 'var(--g50)', border: '1px solid var(--g100)', borderRadius: 'var(--rmd)', padding: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--g700)' }}>
                  <strong>Approved on:</strong> {new Date(selectedRequest.approvalDate).toLocaleDateString('en-GB')}<br />
                  <strong>Approved by:</strong> {selectedRequest.approvedBy?.firstName || 'Admin'} {selectedRequest.approvedBy?.lastName || ''}
                </div>
              </div>
            )}

            {/* Reject Modal */}
            {rejectModal && (
              <div style={{ background: 'var(--r50)', border: '1px solid var(--r100)', borderRadius: 'var(--rmd)', padding: 12, marginTop: 12 }}>
                <label className="fl" style={{ marginBottom: 8, fontSize: 12 }}>Rejection Reason *</label>
                <textarea
                  className="fi"
                  rows={3}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Explain why you're rejecting this leave request..."
                  style={{ resize: 'vertical', marginBottom: 10 }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-d btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleRejectLeave(selectedRequest._id)}>
                    Reject Request
                  </button>
                  <button className="btn btn-s btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setRejectModal(false); setRejectionReason('') }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

