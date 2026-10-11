/**
 * MyProfileModule — every member of staff's own profile.
 * ============================================================
 * Photo (cropped and zoomed in the browser, uploaded as a 640px square),
 * personal and professional details, password and email notifications.
 * Saves through /api/users/me, and updates the signed-in user at once so
 * the portal header shows the new photo and name without a reload.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth, api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { PCard } from '../shared/ui.jsx'
import EmailPrefsCard from '../../../../components/EmailPrefsCard.jsx'
import { SettingsPasswordTab } from './SettingsModule.jsx'

const CR = TOKENS.crimson
const LINE = '#E8E2D6'
const inp = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 9, border: '1.5px solid ' + LINE, fontSize: 13.5, fontFamily: 'inherit', background: '#fff', color: '#1A0F0E', outline: 'none' }
const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: CR, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }
const btnP = { background: CR, color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }
const btnG = { background: '#fff', color: '#3A2E2A', border: '1.5px solid ' + LINE, padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }
const errMsg = (e, f) => e?.response?.data?.message || f

const Field = ({ label, children, hint, span }) => (
  <div style={{ gridColumn: span ? '1 / -1' : undefined }}>
    <label style={lbl}>{label}</label>
    {children}
    {hint && <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 5 }}>{hint}</div>}
  </div>
)

export function Avatar({ user, size = 40, ring = false }) {
  const initials = ((user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')).toUpperCase() || '?'
  const base = { width: size, height: size, borderRadius: '50%', flexShrink: 0, boxShadow: ring ? '0 0 0 3px #fff, 0 0 0 5px ' + TOKENS.gold : undefined }
  return user?.avatar
    ? <img src={user.avatar} alt="" style={{ ...base, objectFit: 'cover', display: 'block' }} />
    : <div style={{ ...base, background: 'linear-gradient(135deg,#7D1025,#5A0B1B)', color: '#F0CC5A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.36 }}>{initials}</div>
}

// ── Photo cropper: drag to position, slider to zoom ─────────────
const VIEW = 260, OUT = 640
function PhotoCropper({ file, onCancel, onSave, busy }) {
  const [img, setImg] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const drag = useRef(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    const im = new Image()
    im.onload = () => setImg(im)
    im.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Image scaled so its short side fills the circle at zoom 1.
  const base = img ? VIEW / Math.min(img.width, img.height) : 1
  const w = img ? img.width * base * zoom : 0, h = img ? img.height * base * zoom : 0
  const clamp = (p) => ({ x: Math.min(0, Math.max(VIEW - w, p.x)), y: Math.min(0, Math.max(VIEW - h, p.y)) })
  useEffect(() => { if (img) setPos(clamp({ x: (VIEW - w) / 2, y: (VIEW - h) / 2 })) }, [img])   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setPos(p => clamp(p)) }, [zoom])   // eslint-disable-line react-hooks/exhaustive-deps

  const down = (e) => { drag.current = { x: e.clientX, y: e.clientY, p: pos }; e.currentTarget.setPointerCapture(e.pointerId) }
  const move = (e) => { if (drag.current) setPos(clamp({ x: drag.current.p.x + e.clientX - drag.current.x, y: drag.current.p.y + e.clientY - drag.current.y })) }
  const up = () => { drag.current = null }

  const save = () => {
    const c = document.createElement('canvas')
    c.width = c.height = OUT
    const k = OUT / VIEW
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, OUT, OUT)
    ctx.drawImage(img, pos.x * k, pos.y * k, w * k, h * k)
    c.toBlob(b => b && onSave(new File([b], 'avatar.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.9)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,10,8,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => !busy && onCancel()}>
      <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 380, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '16px 22px', background: 'linear-gradient(135deg,#7D1025,#5A0B1B)', color: '#FBFAF5', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20 }}>Position your photo</div>
        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
            style={{ width: VIEW, height: VIEW, borderRadius: '50%', overflow: 'hidden', position: 'relative', cursor: 'grab', touchAction: 'none', background: '#F4EFEB', boxShadow: '0 0 0 4px ' + TOKENS.goldPale + ', 0 0 0 6px ' + TOKENS.gold }}>
            {img && <img src={img.src} alt="" draggable={false} style={{ position: 'absolute', left: pos.x, top: pos.y, width: w, height: h, userSelect: 'none', pointerEvents: 'none' }} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <span style={{ fontSize: 12, color: TOKENS.s500 }}>Zoom</span>
            <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ flex: 1, accentColor: CR }} />
          </div>
          <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>Drag the photo to centre your face.</div>
          <div style={{ display: 'flex', gap: 10, alignSelf: 'stretch', justifyContent: 'flex-end' }}>
            <button style={btnG} disabled={busy} onClick={onCancel}>Cancel</button>
            <button style={{ ...btnP, opacity: busy || !img ? 0.7 : 1 }} disabled={busy || !img} onClick={save}>{busy ? 'Saving...' : 'Save photo'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Profile details (also used by Settings → Profile) ───────────
export function ProfileEditor({ toast }) {
  const auth = useAuth()
  const [me, setMe] = useState(null)
  const [f, setF] = useState(null)
  const [saving, setSaving] = useState(false)
  const [crop, setCrop] = useState(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const fileRef = useRef(null)

  const fill = (u) => setF({
    firstName: u.firstName || '', lastName: u.lastName || '', phone: u.phone || '',
    jobTitle: u.jobTitle || '', bio: u.bio || '', homeAddress: u.homeAddress || '',
    dateOfBirth: u.dateOfBirth ? String(u.dateOfBirth).slice(0, 10) : '',
    yearsOfExperience: u.yearsOfExperience || 0,
    qualifications: (u.qualifications || []).join('\n'),
    certifications: (u.certifications || []).join('\n'),
    defaultMeetingLink: u.defaultMeetingLink || '',
  })
  const load = useCallback(() => {
    api.get('/users/me')
      .then(r => { const u = r.data?.data?.user; if (u) { setMe(u); fill(u) } })
      .catch(e => toast?.error?.(errMsg(e, 'Could not load your profile.')))
  }, [toast])
  useEffect(() => { load() }, [load])

  const set = (k, v) => setF(x => ({ ...x, [k]: v }))

  const save = async () => {
    if (!f.firstName.trim() || !f.lastName.trim()) { toast?.error?.('First and last name are required.'); return }
    setSaving(true)
    try {
      const { data } = await api.patch('/users/me', f)
      const u = data?.data?.user
      if (u) { setMe(u); fill(u); auth?.updateUser?.({ firstName: u.firstName, lastName: u.lastName, phone: u.phone, jobTitle: u.jobTitle, bio: u.bio }) }
      toast?.ok?.('Profile saved.')
    } catch (e) { toast?.error?.(errMsg(e, 'Could not save your profile.')) }
    setSaving(false)
  }

  const pick = (file) => {
    if (!file) return
    if (!/^image\//.test(file.type)) { toast?.error?.('Choose a photo (JPG, PNG or WEBP).'); return }
    if (file.size > 15 * 1024 * 1024) { toast?.error?.('That photo is larger than 15 MB.'); return }
    setCrop(file)
  }
  const upload = async (file) => {
    setPhotoBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const avatar = data?.data?.avatar
      setMe(m => ({ ...m, avatar }))
      auth?.updateUser?.({ avatar })
      setCrop(null)
      toast?.ok?.('Profile photo updated.')
    } catch (e) { toast?.error?.(errMsg(e, 'Could not upload your photo.')) }
    setPhotoBusy(false)
  }
  const removePhoto = async () => {
    if (!window.confirm('Remove your profile photo?')) return
    try {
      await api.delete('/users/me/avatar')
      setMe(m => ({ ...m, avatar: '' }))
      auth?.updateUser?.({ avatar: '' })
      toast?.ok?.('Profile photo removed.')
    } catch (e) { toast?.error?.(errMsg(e, 'Could not remove your photo.')) }
  }

  if (!me || !f) return <PCard><div style={{ padding: 30, textAlign: 'center', color: TOKENS.s500 }}>Loading your profile...</div></PCard>

  const isPrincipal = me.role === 'admin'
  return (
    <>
      {/* Hero */}
      <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid ' + LINE, background: '#fff', marginBottom: 16 }}>
        <div style={{ height: 96, background: 'radial-gradient(circle at 20% 0%, #9A1B33, #6E1022 55%, #3E0712)' }} />
        <div style={{ padding: '0 24px 22px', display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: -56 }}>
          <div style={{ position: 'relative' }}>
            <Avatar user={me} size={120} ring />
            <button onClick={() => fileRef.current?.click()} title="Change photo" aria-label="Change photo"
              style={{ position: 'absolute', right: 2, bottom: 2, width: 38, height: 38, borderRadius: '50%', border: '3px solid #fff', background: CR, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { pick(e.target.files?.[0]); e.target.value = '' }} />
          </div>
          <div style={{ flex: 1, minWidth: 220, paddingBottom: 4 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, color: TOKENS.s900, lineHeight: 1.15 }}>{me.firstName} {me.lastName}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 6 }}>
              <span style={{ padding: '3px 11px', borderRadius: 99, fontSize: 11.5, fontWeight: 800, background: isPrincipal ? 'linear-gradient(135deg,#7D1025,#5A0B1B)' : TOKENS.goldPale, color: isPrincipal ? '#F0CC5A' : '#92400E', border: isPrincipal ? '1px solid ' + TOKENS.gold : 'none' }}>
                {isPrincipal ? '★ ' : ''}{me.teamTitle}
              </span>
              {me.jobTitle && me.jobTitle !== me.teamTitle && <span style={{ fontSize: 13, color: TOKENS.s500 }}>{me.jobTitle}</span>}
              <span style={{ fontSize: 13, color: TOKENS.s500 }}>{me.email}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
            <button style={btnG} onClick={() => fileRef.current?.click()}>{me.avatar ? 'Change photo' : 'Add photo'}</button>
            {me.avatar && <button style={{ ...btnG, color: '#B91C1C' }} onClick={removePhoto}>Remove</button>}
          </div>
        </div>
      </div>

      <PCard padding={22}>
        <div style={{ fontSize: 15, fontWeight: 800, color: TOKENS.s900, marginBottom: 14 }}>Personal details</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <Field label="First name"><input style={inp} value={f.firstName} onChange={e => set('firstName', e.target.value)} /></Field>
          <Field label="Last name"><input style={inp} value={f.lastName} onChange={e => set('lastName', e.target.value)} /></Field>
          <Field label="Phone"><input style={inp} value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="+254 700 000 000" /></Field>
          <Field label="Date of birth" hint="Used for the community birthday wishes."><input type="date" style={inp} value={f.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} /></Field>
          <Field label="Email" hint="Ask the Principal to change your sign-in email."><div style={{ ...inp, background: TOKENS.cream, color: TOKENS.s500 }}>{me.email}</div></Field>
          <Field label="Address"><input style={inp} value={f.homeAddress} onChange={e => set('homeAddress', e.target.value)} /></Field>
        </div>
      </PCard>

      <div style={{ height: 14 }} />
      <PCard padding={22}>
        <div style={{ fontSize: 15, fontWeight: 800, color: TOKENS.s900, marginBottom: 14 }}>Professional profile</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <Field label="Job title" hint={'Shown under your name. Your role is ' + me.teamTitle + '.'}><input style={inp} value={f.jobTitle} onChange={e => set('jobTitle', e.target.value)} placeholder={me.teamTitle} /></Field>
          <Field label="Years of experience"><input type="number" min="0" max="70" style={inp} value={f.yearsOfExperience} onChange={e => set('yearsOfExperience', e.target.value)} /></Field>
          <Field label="About me" span hint="Shown with your photo, title, qualifications and experience on the website's Meet Our Team page."><textarea rows={4} style={{ ...inp, resize: 'vertical' }} value={f.bio} onChange={e => set('bio', e.target.value)} placeholder="A short introduction for parents, students and colleagues." /></Field>
          <Field label="Qualifications" hint="One per line"><textarea rows={3} style={{ ...inp, resize: 'vertical' }} value={f.qualifications} onChange={e => set('qualifications', e.target.value)} placeholder="M.Ed. Educational Leadership" /></Field>
          <Field label="Certifications" hint="One per line"><textarea rows={3} style={{ ...inp, resize: 'vertical' }} value={f.certifications} onChange={e => set('certifications', e.target.value)} /></Field>
          <Field label="My meeting link" hint="Your default link for live classes and meetings (https://…)."><input style={inp} value={f.defaultMeetingLink} onChange={e => set('defaultMeetingLink', e.target.value)} placeholder="https://meet.google.com/..." /></Field>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button style={btnG} disabled={saving} onClick={() => fill(me)}>Discard changes</button>
          <button style={{ ...btnP, opacity: saving ? 0.7 : 1 }} disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Save profile'}</button>
        </div>
      </PCard>

      {crop && <PhotoCropper file={crop} busy={photoBusy} onCancel={() => setCrop(null)} onSave={upload} />}
    </>
  )
}

export default function MyProfileModule({ toast, setPage }) {
  const [tab, setTab] = useState('profile')
  const tabs = [['profile', 'Profile'], ['security', 'Password & security'], ['notifications', 'Notifications']]
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: TOKENS.gold }}>Me</div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, color: TOKENS.s900 }}>My <em style={{ color: CR }}>Profile</em></div>
        </div>
        {setPage && <button style={btnG} onClick={() => setPage('mystafffile')}>My staff file →</button>}
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, borderBottom: '1.5px solid ' + LINE, flexWrap: 'wrap' }}>
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '10px 16px', border: 'none', background: 'transparent', marginBottom: -1.5, cursor: 'pointer', fontSize: 13, fontWeight: tab === k ? 800 : 600, color: tab === k ? CR : TOKENS.s500, borderBottom: '2.5px solid ' + (tab === k ? CR : 'transparent') }}>{l}</button>
        ))}
      </div>
      {tab === 'profile' && <ProfileEditor toast={toast} />}
      {tab === 'security' && <SettingsPasswordTab toast={toast} />}
      {tab === 'notifications' && <div style={{ maxWidth: 560 }}><EmailPrefsCard /></div>}
    </>
  )
}
