/**
 * components/PausedScreen.jsx
 * ============================================================
 * Shown when the API rejects a student or parent with
 * code ACCOUNT_PAUSED. Reads pause details written to
 * sessionStorage by the ctx.jsx response interceptor.
 */
import React from 'react'

const TYPE_LABELS = {
  holiday: 'Holiday', mid_term_break: 'Mid-term break', end_term_break: 'End-term break',
  summer_break: 'Summer break', medical_leave: 'Medical leave',
  fee_hold: 'Fee payment hold', other: 'Account hold',
}

const fmtDate = d => {
  if (!d) return null
  const dt = new Date(d)
  return isNaN(dt) ? null : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function PausedScreen() {
  let pause = null
  try { pause = JSON.parse(sessionStorage.getItem('sm_paused') || 'null') } catch { pause = null }

  const type = pause?.type || 'other'
  const label = TYPE_LABELS[type] || TYPE_LABELS.other
  const isFee = type === 'fee_hold'
  const expected = fmtDate(pause?.expectedEnd)
  const students = pause?.students || []

  const signOut = () => {
    localStorage.removeItem('sm_token')
    localStorage.removeItem('sm_user')
    sessionStorage.removeItem('sm_paused')
    window.location.href = '/login'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FDFAF4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'Georgia, serif' }}>
      <div style={{ maxWidth: 520, width: '100%', background: '#fff', borderRadius: 16, boxShadow: '0 10px 40px rgba(8,12,20,.12)', overflow: 'hidden' }}>
        <div style={{ height: 8, background: '#7D1025' }} />
        <div style={{ height: 3, background: '#C9A030' }} />
        <div style={{ padding: '36px 40px' }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: '#C9A030', fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>SMARTIOUS HOMESCHOOL GLOBAL</div>
          <h1 style={{ margin: '14px 0 6px', fontSize: 26, color: '#080C14' }}>Account temporarily paused</h1>
          <div style={{ display: 'inline-block', background: isFee ? '#FEF2F2' : '#F8F1E4', color: isFee ? '#991B1B' : '#7D1025', fontWeight: 700, fontSize: 13, padding: '5px 14px', borderRadius: 999, fontFamily: 'Arial, sans-serif', marginBottom: 16 }}>{label}</div>

          {pause?.role === 'parent' && students.length > 0 && (
            <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6, margin: '0 0 10px' }}>
              Your access is linked to: <strong>{students.join(', ')}</strong>.
            </p>
          )}

          <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, margin: '0 0 10px' }}>
            {isFee
              ? 'This account is on hold pending fee payment. Access will be restored as soon as payment is confirmed by our accounts office.'
              : 'This account is on a scheduled pause and portal access is suspended for its duration. All progress, records and materials are safe and will be exactly as you left them.'}
          </p>

          {expected && (
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, margin: '0 0 10px' }}>
              Expected return: <strong>{expected}</strong>. Access is restored automatically on this date.
            </p>
          )}

          {pause?.note && (
            <div style={{ background: '#F9FAFB', borderLeft: '3px solid #C9A030', padding: '10px 14px', fontSize: 13.5, color: '#4B5563', margin: '14px 0', fontFamily: 'Arial, sans-serif' }}>{pause.note}</div>
          )}

          <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.7, margin: '16px 0 24px', fontFamily: 'Arial, sans-serif' }}>
            Questions or ready to resume? Contact us at <strong>hellosmartious@gmail.com</strong> or <strong>+254 745 021 212</strong>{isFee ? ' (M-Pesa Paybill 745021)' : ''}.
          </p>

          <button onClick={signOut} style={{ background: '#7D1025', color: '#fff', border: 'none', padding: '11px 26px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
