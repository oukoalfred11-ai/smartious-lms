/**
 * components/BirthdayBanner.jsx
 * ============================================================
 * Shown at the top of every dashboard (admin, sub-admin,
 * teacher, student, parent) whenever a community member has a
 * birthday today. Displays each celebrant with their photo and
 * a warm wish; any user can send them a personal letter, which
 * is emailed and stored. Celebrants see a special greeting and
 * can read their received letters. Renders nothing on days
 * with no birthdays. Zero emojis by policy.
 */
import React, { useState, useEffect } from 'react'
import { api } from '../context/ctx.jsx'

const CRIMSON = '#7D1025'
const GOLD = '#C9A030'
const CREAM = '#FDFAF4'
const SERIF = 'Georgia, "Times New Roman", serif'

const initialsOf = (f = '', l = '') => ((f[0] || '') + (l[0] || '')).toUpperCase() || 'S'
const roleLabel = r => ({ student: 'Student', teacher: 'Teacher', parent: 'Parent', admin: 'Staff', accountant: 'Staff', sales: 'Staff', ops_manager: 'Staff', dos: 'Staff' }[r] || 'Community member')

export default function BirthdayBanner() {
  const [celebrants, setCelebrants] = useState([])
  const [letterFor, setLetterFor] = useState(null)   // celebrant being written to
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')
  const [myLetters, setMyLetters] = useState(null)   // null = closed, [] = open

  useEffect(() => {
    api.get('/birthdays/today')
      .then(r => setCelebrants(r.data?.data?.celebrants || []))
      .catch(() => {})
  }, [])

  if (!celebrants.length) return null

  const me = celebrants.find(c => c.isMe)

  const sendLetter = async () => {
    if (!message.trim()) { setNotice('Write a few words first.'); return }
    setSending(true); setNotice('')
    try {
      const { data } = await api.post('/birthdays/' + letterFor._id + '/letter', { message })
      setCelebrants(cs => cs.map(c => c._id === letterFor._id ? { ...c, letterSent: true } : c))
      setLetterFor(null); setMessage('')
      setNotice(data?.message || 'Your birthday letter has been delivered.')
      setTimeout(() => setNotice(''), 4000)
    } catch (e) {
      setNotice(e?.response?.data?.message || 'Could not send the letter.')
    } finally { setSending(false) }
  }

  const openMyLetters = async () => {
    try {
      const { data } = await api.get('/birthdays/my-letters')
      setMyLetters(data?.data?.letters || [])
    } catch { setMyLetters([]) }
  }

  const modalBox = { position: 'fixed', inset: 0, background: 'rgba(8,12,20,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 16 }
  const modalCard = { background: '#fff', borderRadius: 14, padding: '26px 28px', width: 480, maxWidth: '94vw', maxHeight: '86vh', overflowY: 'auto', fontFamily: 'Arial, sans-serif' }

  return (
    <div style={{ marginBottom: 18, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: `linear-gradient(120deg, ${CRIMSON} 0%, #5A0B1B 65%, #3E0712 100%)`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 6px 24px rgba(125,16,37,.25)' }}>
        <div style={{ height: 3, background: GOLD }} />
        <div style={{ padding: '18px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ color: GOLD, fontSize: 18 }}>{'\u2726'}</span>
            <span style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: '#fff' }}>
              {me ? `Happy Birthday, ${me.firstName}!` : 'Birthdays in the Smartious Community today'}
            </span>
            <span style={{ color: GOLD, fontSize: 18 }}>{'\u2726'}</span>
            {me && (
              <span style={{ fontSize: 12.5, color: '#F3D9A4' }}>
                The whole Smartious family celebrates you today.
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
            {celebrants.map(c => (
              <div key={c._id} style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(201,160,48,.45)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 250 }}>
                {c.avatar
                  ? <img src={c.avatar} alt={c.firstName} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '2px solid ' + GOLD }} />
                  : <div style={{ width: 46, height: 46, borderRadius: '50%', background: GOLD, color: CRIMSON, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, border: '2px solid #E8C56A' }}>{initialsOf(c.firstName, c.lastName)}</div>}
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{c.firstName} {c.lastName}</div>
                  <div style={{ color: '#E9D9B8', fontSize: 11.5 }}>
                    {roleLabel(c.role)}{c.gradeLevel ? ' \u00B7 ' + c.gradeLevel : ''}
                  </div>
                  <div style={{ color: '#F3D9A4', fontSize: 11.5, fontFamily: SERIF, fontStyle: 'italic', marginTop: 2 }}>
                    Wishing you a truly wonderful year ahead
                  </div>
                </div>
                {c.isMe ? (
                  <button onClick={openMyLetters} style={{ background: GOLD, color: CRIMSON, border: 'none', padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    My letters
                  </button>
                ) : c.letterSent ? (
                  <span style={{ color: '#9BE3C0', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{'\u2713'} Letter sent</span>
                ) : (
                  <button onClick={() => { setLetterFor(c); setMessage(''); setNotice('') }} style={{ background: 'transparent', color: GOLD, border: '1.5px solid ' + GOLD, padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Send a letter
                  </button>
                )}
              </div>
            ))}
          </div>

          {notice && !letterFor && (
            <div style={{ marginTop: 10, fontSize: 12.5, color: '#9BE3C0', fontWeight: 700 }}>{notice}</div>
          )}
        </div>
      </div>

      {/* Write a letter */}
      {letterFor && (
        <div style={modalBox} onClick={() => setLetterFor(null)}>
          <div style={modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: CRIMSON }}>
              A birthday letter for {letterFor.firstName}
            </div>
            <div style={{ fontSize: 12.5, color: '#6B7280', margin: '6px 0 14px' }}>
              Your letter is delivered to {letterFor.firstName} by email and kept in their portal to read again. One letter per person per birthday.
            </div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={6}
              maxLength={1200}
              placeholder={'Dear ' + letterFor.firstName + ', happy birthday! ...'}
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '1px solid #E8E2D6', borderRadius: 10, fontSize: 14, fontFamily: SERIF, lineHeight: 1.7, resize: 'vertical', background: CREAM }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{message.length}/1200</span>
              {notice && <span style={{ fontSize: 12, color: '#B91C1C', fontWeight: 700 }}>{notice}</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
              <button onClick={() => setLetterFor(null)} style={{ background: CREAM, color: '#080C14', border: '1px solid #E8E2D6', padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button disabled={sending} onClick={sendLetter} style={{ background: CRIMSON, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {sending ? 'Sending...' : 'Send letter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read my letters (celebrant) */}
      {myLetters !== null && (
        <div style={modalBox} onClick={() => setMyLetters(null)}>
          <div style={{ ...modalCard, width: 540 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: CRIMSON, marginBottom: 12 }}>
              Your birthday letters
            </div>
            {myLetters.length === 0 ? (
              <div style={{ fontSize: 13.5, color: '#6B7280' }}>No letters yet today. Check back later, the community is just waking up.</div>
            ) : myLetters.map(l => (
              <div key={l._id} style={{ background: CREAM, border: '1px solid #E8E2D6', borderLeft: '4px solid ' + GOLD, borderRadius: 10, padding: '14px 18px', marginBottom: 10 }}>
                <div style={{ fontFamily: SERIF, fontSize: 14, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{l.message}</div>
                <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 8 }}>
                  From <strong>{l.fromName || 'A community member'}</strong>
                  {' \u00B7 '}{new Date(l.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button onClick={() => setMyLetters(null)} style={{ background: CREAM, color: '#080C14', border: '1px solid #E8E2D6', padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
