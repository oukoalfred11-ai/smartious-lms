/**
 * NotificationsBell.jsx — the bell for every portal, styled after the
 * student portal's. Reads /notifications/mine, shows the unread
 * badge, marks read on open, and plays a soft two tone chime when a
 * user arrives with unread notifications or new ones land while they
 * work. Browsers gate audio behind a user gesture, so a blocked
 * chime waits for the first click or key press and then sounds.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../context/ctx.jsx'

const CRIM = '#7D1025', INK = '#231715', MUT = '#8A8378', LINE = '#E5DFD3'

const rel = (d) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// Soft two tone chime, generated - no audio asset to load.
let _ctx = null, _pending = false, _armed = false
export function playChime() {
  try {
    _ctx = _ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (_ctx.state === 'suspended') {
      _pending = true
      if (!_armed) {
        _armed = true
        const arm = () => { _ctx.resume().then(() => { if (_pending) { _pending = false; tone() } }).catch(() => {}) }
        window.addEventListener('pointerdown', arm, { once: true })
        window.addEventListener('keydown', arm, { once: true })
      }
      return
    }
    tone()
  } catch (e) { /* silence is acceptable */ }
}
function tone() {
  const t0 = _ctx.currentTime
  ;[[880, 0], [1174.66, 0.13]].forEach(([f, dt]) => {
    const o = _ctx.createOscillator(), g = _ctx.createGain()
    o.type = 'sine'; o.frequency.value = f
    g.gain.setValueAtTime(0, t0 + dt)
    g.gain.linearRampToValueAtTime(0.12, t0 + dt + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.45)
    o.connect(g); g.connect(_ctx.destination)
    o.start(t0 + dt); o.stop(t0 + dt + 0.5)
  })
}

export default function NotificationsBell({ onNavigate }) {
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const prevUnread = useRef(null)

  const load = useCallback(() => {
    api.get('/notifications/mine')
      .then(r => {
        const d = r.data?.data || {}
        setItems(d.items || [])
        const u = d.unread || 0
        // Chime on arrival with unread, and whenever unread grows.
        if (prevUnread.current === null ? u > 0 : u > prevUnread.current) playChime()
        prevUnread.current = u
        setUnread(u)
      })
      .catch(() => {})
  }, [])
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t) }, [load])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next && unread > 0) {
      api.patch('/notifications/read-all').then(() => { setUnread(0); prevUnread.current = 0 }).catch(() => {})
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={toggle} aria-label="Notifications"
        style={{ position: 'relative', width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${LINE}`, background: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke={INK} strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 17, height: 17, borderRadius: 999, background: CRIM, color: '#fff', fontSize: 9.5, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid #fff' }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 44, width: 320, maxHeight: 400, overflow: 'auto', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, boxShadow: '0 10px 34px rgba(20,10,8,.14)', zIndex: 60, padding: 8 }}>
          <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: '.1em', color: CRIM, textTransform: 'uppercase', padding: '6px 10px' }}>Notifications</div>
          {items.length === 0 && <div style={{ padding: '14px 10px', fontSize: 12, color: MUT }}>Nothing yet. When the school speaks to you, it lands here.</div>}
          {items.map(n => (
            <button key={n._id} onClick={() => { setOpen(false); if (n.module && onNavigate) onNavigate(n.module) }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 10px', borderRadius: 10, border: 'none', background: n.readAt ? '#fff' : '#FBF4E4', cursor: n.module && onNavigate ? 'pointer' : 'default', marginBottom: 3 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <b style={{ flex: 1, fontSize: 12.5, color: INK }}>{n.title}</b>
                <span style={{ fontSize: 9.5, color: MUT, whiteSpace: 'nowrap' }}>{rel(n.createdAt)}</span>
              </div>
              {n.body && <div style={{ fontSize: 11.5, color: MUT, marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
