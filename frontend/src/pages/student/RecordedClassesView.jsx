import React, { useState, useEffect } from 'react'
import { api } from '../../context/ctx.jsx'

const fmtDur = (s) => {
  if (!s) return ''
  const m = Math.floor(s / 60)
  return m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m} min`
}
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : ''

/**
 * Recorded classes library for students. Shows the recordings an admin
 * has featured, visible to any student even if the class was not theirs.
 * A curated, growing library of the school's best teaching.
 */
export default function RecordedClassesView() {
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    let alive = true
    api.get('/classroom/recordings/library')
      .then(r => { if (alive) setRecordings(r.data?.data?.recordings || []) })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const shown = recordings.filter(r => {
    if (!q.trim()) return true
    const s = q.toLowerCase()
    return [r.title, r.subject, r.teacher, r.curriculum].some(v => (v||'').toLowerCase().includes(s))
  })

  const card = { background: '#fff', border: '1px solid #EAE4DC', borderRadius: 14, overflow: 'hidden' }

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13.5, color: '#6B5D57', margin: 0 }}>
          Recorded classes from across the school, chosen for you to rewatch and learn from, even beyond your own lessons.
        </p>
      </div>

      {playing && (
        <div style={{ ...card, marginBottom: 18, background: '#0F1117' }}>
          <video key={playing.url} src={playing.url} controls autoPlay controlsList="nodownload"
            onContextMenu={e => e.preventDefault()}
            style={{ width: '100%', maxHeight: 480, display: 'block', background: '#000' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
            <div>
              <div style={{ color: '#F3EFE6', fontWeight: 700, fontSize: 14 }}>{playing.title}</div>
              <div style={{ color: '#9AA0AD', fontSize: 12, marginTop: 2 }}>
                {[playing.subject, playing.teacher].filter(Boolean).join(' \u00b7 ')}
              </div>
            </div>
            <button onClick={() => setPlaying(null)}
              style={{ padding: '7px 14px', borderRadius: 8, background: '#1B1F2B', color: '#9AA0AD', border: '1px solid rgba(255,255,255,.1)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ ...card, padding: 40, textAlign: 'center', color: '#857973' }}>Loading library...</div>
      ) : recordings.length === 0 ? (
        <div style={{ ...card, padding: 40, textAlign: 'center', color: '#857973' }}>
          The recorded classes library is being built. Check back soon.
        </div>
      ) : (
        <>
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search by subject, teacher or topic..."
            style={{ padding: '10px 14px', border: '1.5px solid #EAE4DC', borderRadius: 9, fontSize: 13.5, width: '100%', maxWidth: 380, marginBottom: 16, boxSizing: 'border-box' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {shown.map(rec => (
              <div key={rec.recId} style={{ ...card, cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                onClick={() => setPlaying(rec)}>
                <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #1B1F2B, #0F1117)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A2E, #C9973A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(139,26,46,.5)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 3 }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                  {rec.durationSec > 0 && (
                    <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.7)', color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 5 }}>{fmtDur(rec.durationSec)}</span>
                  )}
                </div>
                <div style={{ padding: '12px 14px', flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: '#231715', lineHeight: 1.35, marginBottom: 5 }}>{rec.title}</div>
                  <div style={{ fontSize: 11.5, color: '#6B5D57', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {rec.subject && <span style={{ fontWeight: 700, color: '#8B1A2E' }}>{rec.subject}</span>}
                    {rec.teacher && <span>{rec.teacher}</span>}
                  </div>
                  {rec.recordedAt && <div style={{ fontSize: 10.5, color: '#857973', marginTop: 5 }}>{fmtDate(rec.recordedAt)}</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
