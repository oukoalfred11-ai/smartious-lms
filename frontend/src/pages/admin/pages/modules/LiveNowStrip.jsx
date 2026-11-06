/**
 * LiveNowStrip.jsx — the classes running right now, each with a Join
 * button, for the Dean, the Operations Manager and Admin. Shown at the
 * top of their dashboard and of Live Classes, so joining a lesson is one
 * click instead of a tab inside a module. Refreshes every minute and
 * renders nothing when no class is live.
 */
import React, { useState, useEffect } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { joinClassroom } from '../../../../lib/joinClassroom.js'

export default function LiveNowStrip({ title = 'Live now' }) {
  const [live, setLive] = useState([])
  useEffect(() => {
    let alive = true
    const load = () => api.get('/classroom/live/all')
      .then(r => { if (alive) setLive((r.data?.data?.classes || []).filter(c => c.status === 'live')) })
      .catch(() => {})
    load()
    const t = setInterval(load, 60000)
    return () => { alive = false; clearInterval(t) }
  }, [])
  if (!live.length) return null
  return (
    <div style={{ background: '#fff', border: '1.5px solid #FCA5A5', borderRadius: 14, padding: '14px 16px', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626' }} />
        <span style={{ fontWeight: 800, fontSize: 14, color: TOKENS.s900 }}>{title}</span>
        <span style={{ fontSize: 12, color: TOKENS.s500 }}>{live.length} class{live.length === 1 ? '' : 'es'} · join to observe</span>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {live.map(c => (
          <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '8px 10px', background: '#FEF2F2', borderRadius: 10 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: TOKENS.s900 }}>{c.title || c.subject}</div>
              <div style={{ fontSize: 12, color: TOKENS.s600 }}>
                {[c.subject, c.grade, c.teacher, c.assigned ? c.assigned + ' student' + (c.assigned === 1 ? '' : 's') : ''].filter(Boolean).join(' · ')}
              </div>
            </div>
            <button onClick={() => joinClassroom(c._id)}
              style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: TOKENS.crimson, color: '#fff', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
