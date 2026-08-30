import React, { useState, useEffect } from 'react'
import { api } from '../context/ctx.jsx'

// Category styling — matches the admin composer and the mockup cards.
const CATS = {
  general:     { emoji: '\ud83d\udce2', tint: '#FBF3F4', bar: '#8B1A2E' },
  event:       { emoji: '\ud83d\uddd3\ufe0f', tint: '#FBF1F1', bar: '#C2410C' },
  academic:    { emoji: '\ud83d\udcda', tint: '#EFF5EC', bar: '#3F6212' },
  holiday:     { emoji: '\u2600\ufe0f', tint: '#EEF4FB', bar: '#1D4ED8' },
  achievement: { emoji: '\ud83c\udfc6', tint: '#FDF6E3', bar: '#B45309' },
  reminder:    { emoji: '\u23f0', tint: '#F3F0FA', bar: '#6D28D9' },
}
const catOf = id => CATS[id] || CATS.general
const fmtDate = (from, until) => {
  const f = from ? new Date(from) : null
  const u = until ? new Date(until) : null
  const opt = { day: 'numeric', month: 'short', year: 'numeric' }
  if (f && u) return `${f.toLocaleDateString('en-GB', opt)} to ${u.toLocaleDateString('en-GB', opt)}`
  if (f) return f.toLocaleDateString('en-GB', opt)
  return ''
}

/**
 * Announcements strip — horizontal scrolling cards of live broadcasts,
 * shown on the student and parent dashboards. Reads /announcements,
 * which the backend already scopes to this user and to what is live
 * right now, so scheduling and audience are handled server side.
 */
export default function AnnouncementsStrip() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    api.get('/announcements')
      .then(r => { if (alive) setItems(r.data?.data?.announcements || []) })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  if (loading || items.length === 0) return null

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>{'\ud83d\udce2'}</span>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#231715', margin: 0 }}>Announcements</h3>
      </div>
      <div style={{
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: 'minmax(260px, 300px)',
        gap: 14,
        overflowX: 'auto',
        paddingBottom: 6,
        scrollSnapType: 'x proximity',
      }}>
        {items.map(a => {
          const c = catOf(a.category)
          const clickable = !!a.ctaUrl
          const open = () => { if (a.ctaUrl) window.open(a.ctaUrl, '_blank', 'noopener,noreferrer') }
          return (
            <div key={a._id} onClick={clickable ? open : undefined}
              style={{
                background: c.tint, borderRadius: 14, padding: '16px 18px',
                borderLeft: '4px solid ' + c.bar,
                scrollSnapAlign: 'start',
                cursor: clickable ? 'pointer' : 'default',
                display: 'flex', flexDirection: 'column', minHeight: 128,
              }}>
              <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 26, lineHeight: 1 }}>{c.emoji}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: '#231715' }}>{a.title}</div>
                    {a.pinned && <span style={{ fontSize: 9, fontWeight: 800, color: c.bar }}>PINNED</span>}
                  </div>
                  {fmtDate(a.showFrom, a.showUntil) && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: c.bar, marginTop: 3 }}>{fmtDate(a.showFrom, a.showUntil)}</div>
                  )}
                  <div style={{ fontSize: 12.5, color: '#564844', marginTop: 6, lineHeight: 1.5 }}>{a.body}</div>
                </div>
              </div>
              {a.ctaLabel && (
                <div style={{ marginTop: 'auto', paddingTop: 10, fontSize: 12.5, fontWeight: 800, color: c.bar }}>
                  {a.ctaLabel} {'\u2192'}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
