import React, { useState, useEffect } from 'react'
import { useAuth, api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { initials } from '../shared/helpers.js'
import { PSection } from '../shared/ui.jsx'

function SettingsModule({ refreshKey, toast }) {
  const auth = useAuth()
  const user = auth?.user
  const role = user?.role || 'admin'
  const [activeTab, setActiveTab] = useState('profile')

  // Non-admin staff can only edit personal details — no system/school settings
  const STAFF_ROLES = ['sales', 'ops_manager', 'accountant', 'dos']
  const isStaff = STAFF_ROLES.includes(role)

  const tabs = isStaff
    ? [
        { id: 'profile',  label: 'My Profile' },
        { id: 'password', label: 'Change Password' },
      ]
    : [
        { id: 'profile',  label: 'Profile' },
        { id: 'password', label: 'Change Password' },
        { id: 'email',    label: 'Email Settings' },
        { id: 'school',   label: 'School Settings' },
      ]

  return (
    <>
      <PSection
        tag="Personal"
        title="Account"
        em="Settings"
        sub={isStaff
          ? 'Update your personal profile and password.'
          : 'Manage your profile, password, and notification preferences'}
      />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1.5px solid ' + TOKENS.line, paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '10px 18px', border: 'none', background: 'transparent',
            borderBottom: activeTab === t.id ? '2.5px solid ' + TOKENS.crimson : '2.5px solid transparent',
            color: activeTab === t.id ? TOKENS.crimson : TOKENS.s500,
            fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500,
            cursor: 'pointer', marginBottom: -1.5, transition: 'all .15s',
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'profile'  && <SettingsProfileTab  user={user} toast={toast}/>}
      {activeTab === 'password' && <SettingsPasswordTab toast={toast}/>}
      {!isStaff && activeTab === 'email'  && <SettingsEmailTab  toast={toast}/>}
      {!isStaff && activeTab === 'school' && <SettingsSchoolTab toast={toast}/>}
    </>
  )
}

function SettingsProfileTab({ user, toast }) {
  const [firstName,  setFirstName]  = useState(user?.firstName || '')
  const [lastName,   setLastName]   = useState(user?.lastName  || '')
  const [phone,      setPhone]      = useState(user?.phone     || '')
  const [saving,     setSaving]     = useState(false)
  const [avatarUrl,  setAvatarUrl]  = useState(user?.avatar    || '')
  const [uploading,  setUploading]  = useState(false)

  const save = async () => {
    if (!firstName.trim() || !lastName.trim()) { toast?.error?.('First and last name are required.'); return }
    setSaving(true)
    try {
      const { data } = await api.patch('/users/me', {
        firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(),
      })
      if (data?.success) toast?.ok?.('Profile updated.')
      else toast?.error?.(data?.message || 'Could not update profile.')
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not update profile.')
    } finally { setSaving(false) }
  }

  const uploadAvatar = async (file) => {
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { toast?.error?.('Image must be under 3 MB.'); return }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const { data } = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data?.success) {
        setAvatarUrl(data.data?.avatarUrl || '')
        toast?.ok?.('Profile photo updated.')
      } else {
        toast?.error?.(data?.message || 'Could not upload photo.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not upload photo.')
    } finally { setUploading(false) }
  }

  const inp = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 7, border: '1.5px solid ' + TOKENS.line, fontSize: 13, fontFamily: 'inherit' }
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 5 }
  const initials = (firstName[0] || '') + (lastName[0] || '')

  return (
    <div className="card" style={{ padding: 26, maxWidth: 520 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: TOKENS.s900, marginBottom: 20 }}>Your profile</div>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid ' + TOKENS.line }}/>
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: TOKENS.crimson, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#fff' }}>
              {initials || '?'}
            </div>
          )}
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }}/>
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.s900, marginBottom: 6 }}>Profile photo</div>
          <label style={{ display: 'inline-block', background: TOKENS.cream, border: '1.5px solid ' + TOKENS.line, borderRadius: 7, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, color: TOKENS.s700, cursor: uploading ? 'not-allowed' : 'pointer' }}>
            {uploading ? 'Uploading...' : 'Upload photo'}
            <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading}
              onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])}/>
          </label>
          <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 5 }}>JPG or PNG, max 3 MB</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={lbl}>First name</label>
          <input value={firstName} onChange={e => setFirstName(e.target.value)} style={inp}/>
        </div>
        <div>
          <label style={lbl}>Last name</label>
          <input value={lastName} onChange={e => setLastName(e.target.value)} style={inp}/>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Phone</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 700 000 000" style={inp}/>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>Email address</label>
        <div style={{ ...inp, background: TOKENS.cream, color: TOKENS.s500 }}>{user?.email || '—'}</div>
        <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 4 }}>To change your email contact your administrator.</div>
      </div>
      <button onClick={save} disabled={saving} style={{
        background: saving ? TOKENS.s300 : TOKENS.crimson, color: '#fff', border: 'none',
        padding: '10px 24px', borderRadius: 7, fontSize: 13, fontWeight: 700,
        cursor: saving ? 'not-allowed' : 'pointer',
      }}>{saving ? 'Saving...' : 'Save changes'}</button>
    </div>
  )
}

function SettingsPasswordTab({ toast }) {
  const [current,  setCurrent]  = useState('')
  const [next,     setNext]     = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [showCurr, setShowCurr] = useState(false)
  const [showNew,  setShowNew]  = useState(false)

  const save = async () => {
    if (!current.trim()) { toast?.error?.('Enter your current password.'); return }
    if (next.length < 8)  { toast?.error?.('New password must be at least 8 characters.'); return }
    if (next !== confirm)  { toast?.error?.('New passwords do not match.'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/users/change-password', { currentPassword: current, newPassword: next })
      if (data?.success) {
        toast?.ok?.('Password changed successfully.')
        setCurrent(''); setNext(''); setConfirm('')
      } else {
        toast?.error?.(data?.message || 'Could not change password.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not change password.')
    } finally {
      setSaving(false)
    }
  }

  const inp  = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 7, border: '1.5px solid ' + TOKENS.line, fontSize: 13, fontFamily: 'inherit' }
  const lbl  = { display: 'block', fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 5 }
  const wrap = { position: 'relative', marginBottom: 14 }
  const eye  = { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.s500, fontSize: 12, fontWeight: 600 }

  return (
    <div className="card" style={{ padding: 26, maxWidth: 420 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: TOKENS.s900, marginBottom: 18 }}>Change password</div>
      <div style={wrap}>
        <label style={lbl}>Current password</label>
        <input type={showCurr ? 'text' : 'password'} value={current} onChange={e => setCurrent(e.target.value)} style={inp}/>
        <button style={eye} onClick={() => setShowCurr(v => !v)}>{showCurr ? 'Hide' : 'Show'}</button>
      </div>
      <div style={wrap}>
        <label style={lbl}>New password</label>
        <input type={showNew ? 'text' : 'password'} value={next} onChange={e => setNext(e.target.value)} style={inp}/>
        <button style={eye} onClick={() => setShowNew(v => !v)}>{showNew ? 'Hide' : 'Show'}</button>
        {next && next.length < 8 && <div style={{ fontSize: 11, color: '#B91C1C', marginTop: 3 }}>Must be at least 8 characters</div>}
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>Confirm new password</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} style={inp}/>
        {confirm && next !== confirm && <div style={{ fontSize: 11, color: '#B91C1C', marginTop: 3 }}>Passwords do not match</div>}
      </div>
      <div style={{ background: TOKENS.cream, border: '1px solid ' + TOKENS.line, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: TOKENS.s500, marginBottom: 18, lineHeight: 1.6 }}>
        Use at least 8 characters. Mix uppercase, lowercase, numbers and symbols for a strong password.
      </div>
      <button onClick={save} disabled={saving || !current || next.length < 8 || next !== confirm} style={{
        background: saving || !current || next.length < 8 || next !== confirm ? TOKENS.s300 : TOKENS.crimson,
        color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 7,
        fontSize: 13, fontWeight: 700, cursor: saving || !current || next.length < 8 || next !== confirm ? 'not-allowed' : 'pointer',
      }}>{saving ? 'Changing...' : 'Change password'}</button>
    </div>
  )
}

function SettingsEmailTab({ toast }) {
  const [notifyNewRequest, setNotifyNewRequest] = useState(true)
  const [notifyPayment,    setNotifyPayment]    = useState(true)
  const [notifyEnrolment,  setNotifyEnrolment]  = useState(true)
  const [adminEmail,       setAdminEmail]       = useState('hellosmartious@gmail.com')
  const [saving,           setSaving]           = useState(false)

  const Toggle = ({ val, set }) => (
    <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }}>
      <input type="checkbox" checked={val} onChange={() => set(!val)} style={{ opacity: 0, width: 0, height: 0 }}/>
      <span style={{ position: 'absolute', inset: 0, background: val ? TOKENS.crimson : TOKENS.s300, borderRadius: 99, transition: 'background .2s' }}/>
      <span style={{ position: 'absolute', top: 3, left: val ? 23 : 3, width: 18, height: 18, background: '#fff', borderRadius: '50%', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }}/>
    </label>
  )

  const inp = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 7, border: '1.5px solid ' + TOKENS.line, fontSize: 13, fontFamily: 'inherit' }
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 5 }

  const save = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) { toast?.error?.('Enter a valid email address.'); return }
    setSaving(true)
    // Preferences stored locally for now — backend persistence can be added later
    try {
      localStorage.setItem('sm_email_prefs', JSON.stringify({ notifyNewRequest, notifyPayment, notifyEnrolment, adminEmail }))
      toast?.ok?.('Email preferences saved.')
    } catch {
      toast?.error?.('Could not save preferences.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sm_email_prefs') || '{}')
      if (saved.notifyNewRequest !== undefined) setNotifyNewRequest(saved.notifyNewRequest)
      if (saved.notifyPayment    !== undefined) setNotifyPayment(saved.notifyPayment)
      if (saved.notifyEnrolment  !== undefined) setNotifyEnrolment(saved.notifyEnrolment)
      if (saved.adminEmail)                     setAdminEmail(saved.adminEmail)
    } catch {}
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 760 }}>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: TOKENS.s900, marginBottom: 16 }}>Admin notification email</div>
        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>Send admin notifications to</label>
          <input value={adminEmail} onChange={e => setAdminEmail(e.target.value)} type="email" placeholder="hellosmartious@gmail.com" style={inp}/>
          <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 4 }}>
            Assessment requests, payment confirmations and enrolment alerts go here.
          </div>
        </div>
        <button onClick={save} disabled={saving} style={{
          background: saving ? TOKENS.s300 : TOKENS.crimson, color: '#fff', border: 'none',
          padding: '9px 22px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
        }}>{saving ? 'Saving...' : 'Save'}</button>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: TOKENS.s900, marginBottom: 16 }}>Notification preferences</div>
        {[
          { label: 'New assessment request',  desc: 'Alert when a family submits a request', val: notifyNewRequest, set: setNotifyNewRequest },
          { label: 'Payment received',        desc: 'Alert when assessment fee is paid',     val: notifyPayment,    set: setNotifyPayment    },
          { label: 'Student enrolment',       desc: 'Alert when a new student enrols',       val: notifyEnrolment,  set: setNotifyEnrolment  },
        ].map((row, i, arr) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid ' + TOKENS.line : 'none' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: TOKENS.s900 }}>{row.label}</div>
              <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>{row.desc}</div>
            </div>
            <Toggle val={row.val} set={row.set}/>
          </div>
        ))}
        <button onClick={save} disabled={saving} style={{
          marginTop: 16, background: saving ? TOKENS.s300 : TOKENS.crimson, color: '#fff', border: 'none',
          padding: '9px 22px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
        }}>{saving ? 'Saving...' : 'Save preferences'}</button>
      </div>
    </div>
  )
}

function SettingsSchoolTab({ toast }) {
  const [schoolName,    setSchoolName]    = useState('Smartious Homeschool and eSchool')
  const [whatsapp,      setWhatsapp]      = useState('+254745021212')
  const [contactEmail,  setContactEmail]  = useState('hellosmartious@gmail.com')
  const [assessFeeUSD,  setAssessFeeUSD]  = useState('45')
  const [assessFeeKES,  setAssessFeeKES]  = useState('5800')
  const [saving,        setSaving]        = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      // Save to localStorage — wire to backend /api/settings when ready
      const payload = { schoolName, whatsapp, contactEmail, assessFeeUSD, assessFeeKES }
      localStorage.setItem('sm_school_settings', JSON.stringify(payload))
      toast?.ok?.('School settings saved.')
    } catch {
      toast?.error?.('Could not save settings.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sm_school_settings') || '{}')
      if (saved.schoolName)   setSchoolName(saved.schoolName)
      if (saved.whatsapp)     setWhatsapp(saved.whatsapp)
      if (saved.contactEmail) setContactEmail(saved.contactEmail)
      if (saved.assessFeeUSD) setAssessFeeUSD(saved.assessFeeUSD)
      if (saved.assessFeeKES) setAssessFeeKES(saved.assessFeeKES)
    } catch {}
  }, [])

  const inp = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 7, border: '1.5px solid ' + TOKENS.line, fontSize: 13, fontFamily: 'inherit' }
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 5 }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 760 }}>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: TOKENS.s900, marginBottom: 16 }}>School identity</div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>School name</label>
          <input value={schoolName} onChange={e => setSchoolName(e.target.value)} style={inp}/>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>WhatsApp number</label>
          <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+254745021212" style={inp}/>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Contact email</label>
          <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} type="email" style={inp}/>
        </div>
        <button onClick={save} disabled={saving} style={{
          background: saving ? TOKENS.s300 : TOKENS.crimson, color: '#fff', border: 'none',
          padding: '9px 22px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
        }}>{saving ? 'Saving...' : 'Save'}</button>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: TOKENS.s900, marginBottom: 16 }}>Assessment fee</div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Fee in USD</label>
          <input value={assessFeeUSD} onChange={e => setAssessFeeUSD(e.target.value)} type="number" min="0" style={inp}/>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Fee in KES</label>
          <input value={assessFeeKES} onChange={e => setAssessFeeKES(e.target.value)} type="number" min="0" style={inp}/>
          <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 4 }}>
            KES amount is charged via Paystack. USD amount is shown in emails and the public form.
          </div>
        </div>
        <div style={{ background: TOKENS.cream, border: '1px solid ' + TOKENS.line, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: TOKENS.s500, marginBottom: 18, lineHeight: 1.6 }}>
          Changing these values updates the display only. To change the actual Paystack charge amount, update <strong>ASSESSMENT_AMOUNT_KES</strong> in <code>backend/src/routes/assessment.js</code> and redeploy.
        </div>
        <button onClick={save} disabled={saving} style={{
          background: saving ? TOKENS.s300 : TOKENS.crimson, color: '#fff', border: 'none',
          padding: '9px 22px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
        }}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </div>
  )
}

export default SettingsModule
