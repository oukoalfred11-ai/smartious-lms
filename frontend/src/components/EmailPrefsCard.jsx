/**
 * EmailPrefsCard — which optional emails a person receives.
 * Self contained: loads from /auth/me, saves each toggle at once and
 * reverts on failure. Operational mail (billing, welcome, account) is
 * never optional and is not listed.
 */
import { useState, useEffect } from 'react'
import { api } from '../context/ctx.jsx'

export default function EmailPrefsCard() {
  const CRIM = '#7D1025', TRACK = '#E5DFD3', INK = '#231715', MUT = '#8A8378'
  const ROWS = [
    ['classReminders', 'Class reminders', 'A reminder 30 minutes before each class, with the topic'],
    ['classUpdates', 'Class updates', 'When a class, club or event is created or changed'],
    ['examNotices', 'Exam notices', 'When an examination is scheduled'],
    ['resultsEmails', 'Results emails', 'Marked results and report digests'],
  ]
  const [prefs, setPrefs] = useState(null)
  const [busy, setBusy] = useState('')

  useEffect(() => {
    api.get('/auth/me')
      .then(r => {
        const u = r.data?.data?.user || r.data?.user || r.data?.data || {}
        const base = {}
        ROWS.forEach(([k]) => { base[k] = u.emailPrefs?.[k] !== false })
        setPrefs(base)
      })
      .catch(() => setPrefs(null))
  }, [])

  const toggle = async (k) => {
    if (!prefs || busy) return
    const next = !prefs[k]
    setPrefs(p => ({ ...p, [k]: next }))
    setBusy(k)
    try { await api.patch('/auth/me/email-prefs', { [k]: next }) }
    catch (e) { setPrefs(p => ({ ...p, [k]: !next })) }
    finally { setBusy('') }
  }

  if (!prefs) return null
  return (
    <div style={{ background: '#fff', border: `1px solid ${TRACK}`, borderRadius: 14, padding: 18, marginTop: 16 }}>
      <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: '.12em', color: '#C9A030', textTransform: 'uppercase' }}>Email notifications</div>
      <div style={{ fontSize: 12, color: MUT, marginTop: 3, marginBottom: 12 }}>Choose which emails you receive. Changes apply immediately.</div>
      <div style={{ display: 'grid', gap: 10 }}>
        {ROWS.map(([k, label, desc]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{label}</div>
              <div style={{ fontSize: 11, color: MUT }}>{desc}</div>
            </div>
            <button onClick={() => toggle(k)} disabled={busy === k} aria-label={label}
              style={{ width: 46, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
                background: prefs[k] ? CRIM : '#D6D0C4', transition: 'background 160ms', opacity: busy === k ? 0.6 : 1 }}>
              <span style={{ position: 'absolute', top: 3, left: prefs[k] ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 160ms', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
