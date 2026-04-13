import { useState, useEffect } from 'react'
import { useToast, api } from '../../context/ctx.jsx'
import { useAuth } from '../../context/ctx.jsx'
import Modal from '../../components/ui/Modal.jsx'

// Avatar helper
const Av = ({ init, col, size = 36 }) => (
  <div style={{ width:size, height:size, borderRadius:'50%', background:col+'20', color:col, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'JetBrains Mono,monospace', fontSize:Math.round(size*.32), fontWeight:700, flexShrink:0 }}>{init}</div>
)

// Badge helper
const Badge = ({ label, color = 'blue' }) => {
  const colors = {
    blue: { bg: 'var(--b50)', text: 'var(--b700)' },
    green: { bg: 'var(--g50)', text: 'var(--g700)' },
    amber: { bg: 'var(--a50)', text: 'var(--a700)' },
  }
  const c = colors[color] || colors.blue
  return (
    <span style={{ display: 'inline-block', background: c.bg, color: c.text, padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
      {label}
    </span>
  )
}

export default function TeacherProfile() {
  const toast = useToast()
  const { user: loggedInUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Profile state
  const [teacher, setTeacher] = useState({
    id: 'tchr-001',
    firstName: 'James',
    lastName: 'Muthomi',
    email: 'j.muthomi@smartious.ac.ke',
    phone: '+254 745 021 212',
    bio: 'Mathematics teacher with 8 years of experience. Passionate about IGCSE curriculum.',
    avatar: 'JM',
    avatarColor: '#3B82F6',
    department: 'Mathematics',
    subjects: ['Mathematics', 'Statistics'],
    qualifications: ['B.Sc. Mathematics', 'M.Ed. Secondary Education', 'IGCSE Certification'],
    joinedDate: '2018-05-15',
    status: 'Active',
    rating: 4.9,
    reviews: 1840,
    studentCount: 96,
    lessonsPerWeek: 12,
    averageSessionRating: 4.8,
    lessonsFacilitated: 342,
  })

  // Fetch teacher profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/teacher/profile')
        if (data.success && data.profile) {
          setTeacher(data.profile)
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        toast.error('Failed to load profile. Using demo data.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    phone: teacher.phone,
    bio: teacher.bio,
  })

  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const [showVerifyEmail, setShowVerifyEmail] = useState(false)
  const [newEmail, setNewEmail] = useState(teacher.email)

  // Handle profile update
  const handleSaveProfile = async () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      toast.error('First and last names are required')
      return
    }
    
    setSaving(true)
    try {
      const { data } = await api.patch('/teacher/profile', {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        phone: editForm.phone.trim(),
        bio: editForm.bio.trim(),
      })
      
      if (data.success) {
        setTeacher(data.profile)
        toast.ok('Profile updated successfully!')
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Profile update failed:', err)
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Handle password change
  const handleChangePassword = async () => {
    if (!passwordForm.current.trim() || !passwordForm.new.trim()) {
      toast.error('All password fields are required')
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordForm.new.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    setSaving(true)
    try {
      const { data } = await api.post('/teacher/change-password', {
        current: passwordForm.current,
        new: passwordForm.new,
      })
      
      if (data.success) {
        toast.ok('Password changed successfully!')
        setShowChangePassword(false)
        setPasswordForm({ current: '', new: '', confirm: '' })
      }
    } catch (err) {
      console.error('Password change failed:', err)
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  // Handle email change
  const handleChangeEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    
    setSaving(true)
    try {
      const { data } = await api.post('/teacher/change-email', {
        newEmail: newEmail.trim(),
      })
      
      if (data.success) {
        setTeacher(prev => ({ ...prev, email: data.email }))
        toast.ok('Verification email sent. Please check your inbox.')
        setShowVerifyEmail(false)
      }
    } catch (err) {
      console.error('Email change failed:', err)
      toast.error(err.response?.data?.message || 'Failed to change email')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '16px', color: 'var(--s600)', marginBottom: 12 }}>Loading profile...</div>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid var(--b100)', borderTop: '4px solid var(--b500)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {!loading && (
      <>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Teacher Profile
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--s900)', margin: 0 }}>
              My Profile
            </h1>
          </div>
          {!isEditing && (
            <button className="btn btn-p btn-sm" onClick={() => setIsEditing(true)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      {!isEditing && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 30 }}>
          {/* Main Info */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
              <Av init={teacher.avatar} col={teacher.avatarColor} size={80} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--s900)', marginBottom: 4 }}>
                  {teacher.firstName} {teacher.lastName}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--s500)', marginBottom: 10 }}>
                  {teacher.department} • {teacher.subjects.join(', ')}
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Badge label={teacher.status} color="green" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '14px', fontWeight: '600' }}>
                    <span style={{ color: 'var(--a600)' }}>★ {teacher.rating}</span>
                    <span style={{ color: 'var(--s400)', fontSize: '12px' }}>({teacher.reviews.toLocaleString()} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: 'Students', value: teacher.studentCount },
                { label: 'Lessons/Week', value: teacher.lessonsPerWeek },
                { label: 'Total Sessions', value: teacher.lessonsFacilitated },
                { label: 'Avg Rating', value: teacher.averageSessionRating.toFixed(1) },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '12px', background: 'var(--bg)', borderRadius: 'var(--rmd)' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--b700)', marginBottom: 4 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--s500)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Personal Info */}
          <div className="card">
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--s800)', marginBottom: 16 }}>
              Contact Information
            </div>
            {[
              { label: 'Email', value: teacher.email, icon: '✉️' },
              { label: 'Phone', value: teacher.phone, icon: '📱' },
              { label: 'Joined', value: new Date(teacher.joinedDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }), icon: '📅' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 2 ? 14 : 0 }}>
                <div style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'var(--s400)', textTransform: 'uppercase', fontWeight: '700', marginBottom: 2 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--s700)', fontWeight: '500' }}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Qualifications */}
          <div className="card">
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--s800)', marginBottom: 16 }}>
              Qualifications
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {teacher.qualifications.map((qual, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', background: 'var(--bg)', borderRadius: 'var(--rmd)' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--g600)" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  <span style={{ fontSize: '13px', color: 'var(--s700)', fontWeight: '500' }}>
                    {qual}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--s800)', marginBottom: 12 }}>
              Bio
            </div>
            <div style={{ fontSize: '14px', color: 'var(--s600)', lineHeight: '1.6' }}>
              {teacher.bio}
            </div>
          </div>

          {/* Security Actions */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--s800)', marginBottom: 16 }}>
              Security & Account
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button className="btn btn-s" onClick={() => setShowChangePassword(true)}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm6-10V7a3 3 0 0 0-6 0v4" />
                </svg>
                Change Password
              </button>
              <button className="btn btn-s" onClick={() => setShowVerifyEmail(true)}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                </svg>
                Change Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="card" style={{ marginBottom: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <Av init={teacher.avatar} col={teacher.avatarColor} size={80} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--s800)', marginBottom: 8 }}>
                Profile Picture
              </div>
              <button className="btn btn-s btn-sm" onClick={() => toast.info('Upload picture feature coming soon')}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Upload New Picture
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div className="fg">
              <label className="fl">First Name *</label>
              <input
                className="fi"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
              />
            </div>
            <div className="fg">
              <label className="fl">Last Name *</label>
              <input
                className="fi"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="fg" style={{ marginBottom: 24 }}>
            <label className="fl">Phone</label>
            <input
              className="fi"
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
          </div>

          <div className="fg" style={{ marginBottom: 24 }}>
            <label className="fl">Bio</label>
            <textarea
              className="fi"
              rows={4}
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Tell students about yourself, your teaching experience, and interests..."
              style={{ resize: 'vertical' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--s400)', marginTop: 6 }}>
              {editForm.bio.length} / 500 characters
            </div>
          </div>

           <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn btn-s" onClick={() => setIsEditing(false)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-ok" onClick={handleSaveProfile} disabled={saving}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              </svg>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <Modal open={showChangePassword} onClose={() => setShowChangePassword(false)} title="Change Password" size="md"
        footer={
          <>
            <button className="btn btn-ok" onClick={handleChangePassword}>
              Update Password
            </button>
            <button className="btn btn-s" onClick={() => setShowChangePassword(false)} disabled={saving}>
              Cancel
            </button>
          </>
        }
      >
        <div>
          <div className="fg">
            <label className="fl">Current Password *</label>
            <input
              className="fi"
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
              placeholder="Enter your current password"
            />
          </div>
          <div className="fg">
            <label className="fl">New Password *</label>
            <input
              className="fi"
              type="password"
              value={passwordForm.new}
              onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
              placeholder="Enter your new password"
            />
            <div style={{ fontSize: '12px', color: 'var(--s400)', marginTop: 6 }}>
              Must be at least 8 characters long
            </div>
          </div>
          <div className="fg">
            <label className="fl">Confirm New Password *</label>
            <input
              className="fi"
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              placeholder="Confirm your new password"
            />
          </div>
        </div>
      </Modal>

      {/* Change Email Modal */}
      <Modal open={showVerifyEmail} onClose={() => setShowVerifyEmail(false)} title="Change Email Address" size="md"
        footer={
          <>
            <button className="btn btn-ok" onClick={handleChangeEmail}>
              Send Verification Email
            </button>
            <button className="btn btn-s" onClick={() => setShowVerifyEmail(false)} disabled={saving}>
              Cancel
            </button>
          </>
        }
      >
        <div>
          <div style={{ background: 'var(--a50)', border: '1px solid var(--a100)', borderRadius: 'var(--rmd)', padding: 12, marginBottom: 16, fontSize: 13, color: 'var(--a700)' }}>
            ℹ️ A verification email will be sent to your new address. Click the link to confirm the change.
          </div>
          <div className="fg">
            <label className="fl">Current Email</label>
            <input
              className="fi"
              type="email"
              disabled
              value={teacher.email}
              style={{ background: 'var(--s50)', cursor: 'not-allowed' }}
            />
          </div>
          <div className="fg">
            <label className="fl">New Email Address *</label>
            <input
              className="fi"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter your new email address"
            />
          </div>
        </div>
      </>
      )}
    </div>
  )
}

