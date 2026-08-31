import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'

const LINE = TOKENS.line || '#EAE4DC'
const S600 = TOKENS.s600 || '#6B5D57'

const fmtDur = (s) => {
  if (!s) return ''
  const m = Math.floor(s / 60), sec = s % 60
  return m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m ${sec}s`
}
const fmtSize = (b) => b ? (b > 1e9 ? (b/1e9).toFixed(1)+' GB' : (b/1e6).toFixed(0)+' MB') : ''
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : ''

export default function LiveClassesModule({ toast }) {
  const [tab, setTab] = useState('recordings')
  const [recordings, setRecordings] = useState([])
  const [liveClasses, setLiveClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(null)   // the recording being played
  const [filter, setFilter] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/classroom/recordings/all').catch(() => ({ data: { data: { recordings: [] } } })),
      api.get('/classroom/live/all').catch(() => ({ data: { data: { classes: [] } } })),
    ]).then(([r, l]) => {
      setRecordings(r.data?.data?.recordings || [])
      setLiveClasses(l.data?.data?.classes || [])
    }).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const toggleFeature = async (rec) => {
    try {
      await api.patch(`/classroom/${rec.liveClassId}/recordings/${rec.recId}`, { featured: !rec.featured })
      setRecordings(rs => rs.map(x => x.recId === rec.recId ? { ...x, featured: !x.featured } : x))
      toast?.ok?.(rec.featured ? 'Removed from the lesson player.' : 'Added to the lesson player. Students see it on that lesson.')
    } catch { toast?.error?.('Could not update.') }
  }
  const rename = async (rec) => {
    const title = window.prompt('Library title for this recording:', rec.title || '')
    if (title === null) return
    try {
      await api.patch(`/classroom/${rec.liveClassId}/recordings/${rec.recId}`, { title })
      setRecordings(rs => rs.map(x => x.recId === rec.recId ? { ...x, title } : x))
    } catch { toast?.error?.('Could not rename.') }
  }
  const remove = async (rec) => {
    if (!window.confirm('Delete this recording for good? This cannot be undone.')) return
    try {
      await api.delete(`/classroom/${rec.liveClassId}/recordings/${rec.recId}`)
      setRecordings(rs => rs.filter(x => x.recId !== rec.recId))
      if (playing?.recId === rec.recId) setPlaying(null)
      toast?.ok?.('Recording deleted.')
    } catch { toast?.error?.('Could not delete.') }
  }
  const joinClass = (id) => window.open(`/classroom/${id}`, '_blank', 'noopener')

  const card = { background: '#fff', border: `1.5px solid ${LINE}`, borderRadius: 14, padding: 18 }
  const btn = (kind) => ({
    padding: '7px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
    border: `1.5px solid ${kind === 'primary' ? TOKENS.crimson : LINE}`,
    background: kind === 'primary' ? TOKENS.crimson : '#fff',
    color: kind === 'primary' ? '#fff' : S600,
  })
  const tabBtn = (id, label, count) => (
    <button onClick={() => setTab(id)} style={{
      padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
      background: tab === id ? TOKENS.crimson : 'transparent',
      color: tab === id ? '#fff' : S600, fontWeight: 700, fontSize: 13,
    }}>{label}{count != null ? ` (${count})` : ''}</button>
  )

  const shown = recordings.filter(r => {
    if (!filter.trim()) return true
    const q = filter.toLowerCase()
    return [r.title, r.subject, r.teacher, r.curriculum].some(v => (v || '').toLowerCase().includes(q))
  })

  return (
    <div style={{ display: 'grid', gap: 18, maxWidth: 1000 }}>
      <div>
        <h2 style={{ fontSize: 21, fontWeight: 800, color: TOKENS.s900, margin: 0 }}>Live Classes & Recordings</h2>
        <p style={{ fontSize: 13, color: TOKENS.s500, margin: '4px 0 0' }}>
          Every class records automatically. Review recordings, delete weak ones, and add the best onto their lesson in the player.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 6, background: TOKENS.cream, padding: 5, borderRadius: 10, width: 'fit-content' }}>
        {tabBtn('recordings', 'Recordings', recordings.length)}
        {tabBtn('live', 'Live now / upcoming', liveClasses.length)}
      </div>

      {/* Player */}
      {playing && (
        <div style={{ ...card, padding: 0, overflow: 'hidden', background: '#0F1117' }}>
          <video key={playing.url} src={playing.url} controls autoPlay
            style={{ width: '100%', maxHeight: 460, display: 'block', background: '#000' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
            <div style={{ color: '#F3EFE6', fontWeight: 700, fontSize: 14 }}>{playing.title}</div>
            <button onClick={() => setPlaying(null)} style={{ ...btn(), background: '#1B1F2B', color: '#9AA0AD', border: '1px solid rgba(255,255,255,.1)' }}>Close</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ ...card, textAlign: 'center', color: TOKENS.s500 }}>Loading...</div>
      ) : tab === 'recordings' ? (
        <>
          <input value={filter} onChange={e => setFilter(e.target.value)}
            placeholder="Filter by title, subject, teacher..."
            style={{ padding: '10px 14px', border: `1.5px solid ${LINE}`, borderRadius: 9, fontSize: 13.5, maxWidth: 360 }} />
          {shown.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', color: TOKENS.s500 }}>
              No recordings yet. They appear here automatically once classes are taught.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {shown.map(rec => (
                <div key={rec.recId} style={{ ...card, display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 5 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: TOKENS.s900 }}>{rec.title}</span>
                      {rec.featured && (
                        <span style={{ fontSize: 9.5, fontWeight: 800, color: '#12060B', background: '#E4C689', padding: '2px 8px', borderRadius: 999 }}>ON LESSON</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12.5, color: S600, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {rec.subject && <span>{rec.subject}</span>}
                      {rec.curriculum && <span>{rec.curriculum}</span>}
                      {rec.teacher && <span>{rec.teacher}</span>}
                      {rec.durationSec > 0 && <span>{fmtDur(rec.durationSec)}</span>}
                      {rec.sizeBytes > 0 && <span>{fmtSize(rec.sizeBytes)}</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 4 }}>{fmtDate(rec.recordedAt)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button style={btn('primary')} onClick={() => setPlaying(rec)}>Play</button>
                    <button style={btn()} onClick={() => toggleFeature(rec)}>{rec.featured ? 'Remove from lesson' : 'Add to lesson'}</button>
                    <button style={btn()} onClick={() => rename(rec)}>Rename</button>
                    <button style={{ ...btn(), color: '#B91C1C', borderColor: '#FCA5A5' }} onClick={() => remove(rec)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        liveClasses.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', color: TOKENS.s500 }}>No live or upcoming classes right now.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {liveClasses.map(c => (
              <div key={c._id} style={{ ...card, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: TOKENS.s900 }}>{c.title}</span>
                    {c.status === 'live' && (
                      <span style={{ fontSize: 9.5, fontWeight: 800, color: '#fff', background: '#DC2626', padding: '2px 9px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} /> LIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: S600, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {c.subject && <span>{c.subject}</span>}
                    {c.teacher && <span>{c.teacher}</span>}
                    <span>{fmtDate(c.scheduledAt)}</span>
                    {c.recordingCount > 0 && <span>{c.recordingCount} recording{c.recordingCount>1?'s':''}</span>}
                  </div>
                </div>
                <button style={btn('primary')} onClick={() => joinClass(c._id)}>
                  {c.status === 'live' ? 'Join now' : 'Open'}
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
