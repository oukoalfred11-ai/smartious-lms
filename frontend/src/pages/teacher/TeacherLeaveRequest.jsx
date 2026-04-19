import { useState, useEffect } from 'react'
import { useToast, api } from '../../context/ctx.jsx'
import Modal from '../../components/ui/Modal.jsx'

const Av = ({ init, col, size = 36 }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: col + '20', color: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono,monospace', fontSize: Math.round(size * .32), fontWeight: 700, flexShrink: 0 }}>{init}</div>
)

const Ico = ({ d, w = 18, col = 'currentColor', sw = 2 }) => (
  <svg width={w} height={w} fill="none" viewBox="0 0 24 24" stroke={col} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d.split('|').map((p, i) => {
      if (p.startsWith('rect:')) { const [, x, y, W, H, rx] = p.split(':'); return <rect key={i} x={x} y={y} width={W} height={H} rx={rx || 0} /> }
      if (p.startsWith('circle:')) { const [, cx, cy, r] = p.split(':'); return <circle key={i} cx={cx} cy={cy} r={r} /> }
      if (p.startsWith('line:')) { const [, x1, y1, x2, y2] = p.split(':'); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} /> }
      if (p.startsWith('poly:')) { return <polygon key={i} points={p.slice(5)} /> }
      if (p.startsWith('pline:')) { return <polyline key={i} points={p.slice(6)} /> }
      return <path key={i} d={p} />
    })}
  </svg>
)

export default function TeacherLeaveRequest() {
  const toast = useToast()
  const [applyModal, setApplyModal] = useState(false)
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [leaveType, setLeaveType] = useState('Personal')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [selectedDates, setSelectedDates] = useState([])
  
  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  
  // Fetch leave requests
  const fetchLeaveRequests = async () => {
    setLoading(true)
    try {
      const res = await api.get('/leave-requests/my-requests')
      if (res.data.success) {
        setLeaveRequests(res.data.leaveRequests || [])
      }
    } catch (err) {
      console.error('Error fetching leave requests:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  // Generate calendar days
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateInRange = (day) => {
    if (!startDate || !endDate) return false
    const checkDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return checkDate >= start && checkDate <= end
  }

  const isDateStart = (day) => {
    if (!startDate) return false
    const checkDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
    const start = new Date(startDate)
    return checkDate.toDateString() === start.toDateString()
  }

  const isDateEnd = (day) => {
    if (!endDate) return false
    const checkDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
    const end = new Date(endDate)
    return checkDate.toDateString() === end.toDateString()
  }

  const handleDayClick = (day) => {
    const clickedDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
    const dateStr = clickedDate.toISOString().split('T')[0]
    
    if (!startDate) {
      setStartDate(dateStr)
    } else if (!endDate) {
      if (dateStr > startDate) {
        setEndDate(dateStr)
      } else {
        setStartDate(dateStr)
        setEndDate('')
      }
    } else {
      setStartDate(dateStr)
      setEndDate('')
    }
  }

  const handleApplyLeave = async () => {
    if (!startDate || !endDate || !reason.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error('End date must be after start date')
      return
    }

    try {
      const res = await api.post('/leave-requests', {
        leaveStartDate: startDate,
        leaveEndDate: endDate,
        leaveReason: reason,
        leaveType: leaveType
      })

      if (res.data.success) {
        toast.ok('Leave request submitted successfully!')
        setApplyModal(false)
        setStartDate('')
        setEndDate('')
        setReason('')
        setLeaveType('Personal')
        fetchLeaveRequests()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave request')
    }
  }

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return
    
    try {
      const res = await api.patch(`/leave-requests/${requestId}/cancel`)
      if (res.data.success) {
        toast.ok('Leave request cancelled')
        fetchLeaveRequests()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request')
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarMonth)
    const firstDay = getFirstDayOfMonth(calendarMonth)
    const days = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: 8 }} />)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isInRange = isDateInRange(day)
      const isStart = isDateStart(day)
      const isEnd = isDateEnd(day)
      const isPastDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day) < new Date()
      
      days.push(
        <div
          key={day}
          onClick={() => !isPastDate && handleDayClick(day)}
          style={{
            padding: 8,
            textAlign: 'center',
            borderRadius: 'var(--rsm)',
            cursor: isPastDate ? 'not-allowed' : 'pointer',
            background: isInRange ? 'var(--b100)' : 'transparent',
            color: isPastDate ? 'var(--s300)' : isStart || isEnd ? '#fff' : 'var(--s800)',
            fontWeight: isStart || isEnd ? 700 : 500,
            fontSize: 13,
            border: isStart || isEnd ? '2px solid var(--b700)' : '1px solid transparent',
            background: isStart || isEnd ? 'var(--b700)' : isInRange ? 'var(--b50)' : 'transparent',
            opacity: isPastDate ? 0.5 : 1,
            transition: 'all .2s'
          }}
        >
          {day}
        </div>
      )
    }
    
    return days
  }

  const statusColors = {
    Pending: { color: 'var(--a600)', bg: 'var(--a50)', border: 'var(--a100)' },
    Approved: { color: 'var(--g600)', bg: 'var(--g50)', border: 'var(--g100)' },
    Rejected: { color: 'var(--r600)', bg: 'var(--r50)', border: 'var(--r100)' },
    Cancelled: { color: 'var(--s600)', bg: 'var(--s100)', border: 'var(--s200)' },
  }

  const getDateRange = (start, end) => {
    const s = new Date(start)
    const e = new Date(end)
    return `${s.toLocaleDateString('en-GB', { day: 'short', month: 'short', year: 'numeric' })} – ${e.toLocaleDateString('en-GB', { day: 'short', month: 'short', year: 'numeric' })}`
  }

  const getDayCount = (start, end) => {
    const s = new Date(start)
    const e = new Date(end)
    return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="sec-tag">Time Management</div>
          <h2 className="serif" style={{ fontSize: 24, color: 'var(--s900)' }}>Leave <em style={{ color: 'var(--b700)' }}>Requests</em></h2>
        </div>
        <button className="btn btn-p" onClick={() => setApplyModal(true)}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Apply for Leave
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Stats */}
        <div className="card">
          <div className="ctitle" style={{ marginBottom: 16 }}>Leave Statistics</div>
          {[
            { label: 'Total Pending', value: leaveRequests.filter(r => r.status === 'Pending').length, color: 'var(--a600)' },
            { label: 'Total Approved', value: leaveRequests.filter(r => r.status === 'Approved').length, color: 'var(--g600)' },
            { label: 'Total Rejected', value: leaveRequests.filter(r => r.status === 'Rejected').length, color: 'var(--r600)' },
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color: 'var(--s600)', fontSize: 13 }}>{stat.label}</span>
              <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Upcoming Leave */}
        <div className="card">
          <div className="ctitle" style={{ marginBottom: 16 }}>Upcoming Approved Leave</div>
          {leaveRequests.filter(r => r.status === 'Approved' && new Date(r.leaveEndDate) > new Date()).length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 20 }}>No upcoming approved leave</div>
          ) : (
            leaveRequests.filter(r => r.status === 'Approved' && new Date(r.leaveEndDate) > new Date()).map(req => (
              <div key={req._id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{req.leaveType}</div>
                <div style={{ fontSize: 12, color: 'var(--s500)' }}>{getDateRange(req.leaveStartDate, req.leaveEndDate)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <div className="ctitle">Leave Request History</div>
          <p style={{ fontSize: 12, color: 'var(--s400)', marginTop: 4 }}>All your leave applications and their status</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            Loading leave requests...
          </div>
        ) : leaveRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', opacity: 0.5 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p>No leave requests yet. Apply for leave using the button above.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {leaveRequests.map((req) => {
              const statusColor = statusColors[req.status]
              const dayCount = getDayCount(req.leaveStartDate, req.leaveEndDate)
              return (
                <div key={req._id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--rmd)', padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{req.leaveType}</div>
                      <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 6 }}>{getDateRange(req.leaveStartDate, req.leaveEndDate)}</div>
                      <div style={{ fontSize: 12, color: 'var(--s400)', marginBottom: 8 }}>{dayCount} day{dayCount !== 1 ? 's' : ''} • {req.leaveReason}</div>
                      {req.rejectionReason && (
                        <div style={{ fontSize: 12, color: 'var(--r600)', background: 'var(--r50)', border: '1px solid var(--r100)', borderRadius: 'var(--rsm)', padding: 8, marginTop: 8 }}>
                          <strong>Rejection reason:</strong> {req.rejectionReason}
                        </div>
                      )}
                    </div>
                    <span className="badge" style={statusColor}>{req.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--s500)' }}>
                    <span>Applied: {new Date(req.createdAt).toLocaleDateString('en-GB')}</span>
                    {req.approvalDate && <span>Approved: {new Date(req.approvalDate).toLocaleDateString('en-GB')}</span>}
                  </div>
                  {req.status === 'Pending' && (
                    <button className="btn btn-g btn-sm" style={{ marginTop: 10, color: 'var(--r500)' }} onClick={() => handleCancelRequest(req._id)}>
                      Cancel Request
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <Modal open={applyModal} onClose={() => setApplyModal(false)} title="Apply for Leave" size="md"
        footer={<><button className="btn btn-p" onClick={handleApplyLeave}>Submit Leave Request</button><button className="btn btn-s" onClick={() => setApplyModal(false)}>Cancel</button></>}>
        <div>
          <div className="fg">
            <label className="fl">Leave Type *</label>
            <select className="fsel" value={leaveType} onChange={e => setLeaveType(e.target.value)}>
              <option value="Personal">Personal Leave</option>
              <option value="Medical">Medical Leave</option>
              <option value="Emergency">Emergency Leave</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="card" style={{ background: 'var(--bg)', border: '1px solid var(--border)', marginBottom: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Select Dates</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-g btn-sm" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}>‹</button>
                  <span style={{ fontSize: 13, fontWeight: 600, minWidth: 120, textAlign: 'center' }}>
                    {calendarMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </span>
                  <button className="btn btn-g btn-sm" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}>›</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 12 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--s500)', padding: 8 }}>{day}</div>
                ))}
                {renderCalendar()}
              </div>

              {startDate && endDate && (
                <div style={{ background: 'var(--b50)', border: '1px solid var(--b100)', borderRadius: 'var(--rmd)', padding: 10, fontSize: 13 }}>
                  <strong>Selected: </strong>{getDateRange(startDate, endDate)} ({getDayCount(startDate, endDate)} days)
                </div>
              )}
            </div>
          </div>

          <div className="fg">
            <label className="fl">Reason for Leave *</label>
            <textarea className="fi" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain your reason for leave..." style={{ resize: 'vertical' }} />
          </div>

          <div style={{ background: 'var(--a50)', border: '1px solid var(--a100)', borderRadius: 'var(--rmd)', padding: 12, fontSize: 12, color: 'var(--a700)' }}>
            <strong>ℹ Note:</strong> Your leave request will be reviewed by an admin. You'll be notified once it's approved or rejected. During your leave, your students will be reassigned to another teacher.
          </div>
        </div>
      </Modal>
    </div>
  )
}

