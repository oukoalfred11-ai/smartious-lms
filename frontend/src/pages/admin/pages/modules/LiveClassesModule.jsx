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
  const [past, setPast] = useState([])
  const [editCls, setEditCls] = useState(null)   // { _id, title, when, mins }
  const [savingEdit, setSavingEdit] = useState(false)
  const [autoInfo, setAutoInfo] = useState(null) // { count, sample } of auto-scheduled classes
  const [purging, setPurging] = useState(false)
  const [filter, setFilter] = useState('')

  const loadAuto = useCallback(() => {
    api.get('/liveclasses/auto/count')
      .then(r => setAutoInfo(r.data?.data || null))
      .catch(() => setAutoInfo(null))
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/classroom/recordings/all').catch(() => ({ data: { data: { recordings: [] } } })),
      api.get('/classroom/live/all').catch(() => ({ data: { data: { classes: [] } } })),
    ]).then(([r, l]) => {
      setRecordings(r.data?.data?.recordings || [])
      setLiveClasses(l.data?.data?.classes || [])
      setPast(l.data?.data?.past || [])
    }).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load(); loadAuto() }, [load, loadAuto])

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
        {tabBtn('past', 'Past classes', past.length)}
      </div>

      {/* Auto-scheduled cleanup: classes the old auto-timetable created,
          which teachers never scheduled and reminders kept announcing. */}
      {autoInfo && autoInfo.count > 0 && (
        <div style={{ background: '#FEF3C7', border: '1.5px solid #F59E0B', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: '#92400E' }}>{autoInfo.count} auto-scheduled class{autoInfo.count === 1 ? '' : 'es'} found</div>
            <div style={{ fontSize: 12, color: '#92400E', marginTop: 3, lineHeight: 1.5 }}>
              Created by the old auto-timetable, not by teachers, and reminders are going out for them.
              {autoInfo.sample?.length > 0 && <> Next: {autoInfo.sample.slice(0, 3).map(x => `${x.title || x.subject} (${new Date(x.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})`).join(', ')}.</>}
              {' '}Removing them stops the reminders. Classes already taught or recorded are not touched.
            </div>
          </div>
          <button disabled={purging} onClick={async () => {
            if (!window.confirm(`Remove all ${autoInfo.count} auto-scheduled classes? Teachers' own classes are not affected.`)) return
            setPurging(true)
            try {
              const r = await api.delete('/liveclasses/auto/purge')
              toast?.ok?.(r.data?.message || 'Removed.')
              setAutoInfo({ count: 0, sample: [] }); load()
            } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not remove them.') }
            finally { setPurging(false) }
          }} style={{ background: '#B45309', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 16px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer', opacity: purging ? .6 : 1 }}>
            {purging ? 'Removing...' : 'Remove them all'}
          </button>
        </div>
      )}

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
      ) : tab === 'live' ? (
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
                {c.status === 'scheduled' && (
                  <>
                    <button style={btn('ghost')} onClick={() => setEditCls({ _id: c._id, title: c.title || '', when: c.scheduledAt ? new Date(new Date(c.scheduledAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '', mins: c.durationMins || 60 })}>Edit</button>
                    <button style={{ ...btn('ghost'), color: '#B91C1C', borderColor: '#FCA5A5' }} onClick={async () => {
                      if (!window.confirm(`Delete "${c.title}"? Assigned students will no longer see it.`)) return
                      try { await api.delete('/liveclasses/' + c._id); toast?.ok?.('Class deleted.'); load() }
                      catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not delete.') }
                    }}>Delete</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )
      ) : null}

      {/* Past classes: what has actually been taught */}
      {tab === 'past' && (
        past.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', color: S600, fontSize: 13.5 }}>No classes ended in the last 30 days.</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {past.map(c => (
              <div key={c._id} style={{ ...card, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, color: TOKENS.s900 }}>{c.title}
                    {c.kind !== 'lesson' && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 800, color: '#92400E', background: '#FEF3C7', padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase' }}>{c.kind}</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: S600, display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                    {c.subject && <span>{c.subject}{c.grade ? ` · ${c.grade}` : ''}</span>}
                    {c.teacher && <span>{c.teacher}</span>}
                    <span>{fmtDate(c.scheduledAt)}</span>
                    <span>{c.assigned} assigned</span>
                  </div>
                </div>
                                {c.joined === 0
                  ? <span style={{ fontSize: 11.5, fontWeight: 800, color: '#B91C1C', background: '#FEE2E2', padding: '3px 10px', borderRadius: 999 }}>DID NOT RUN</span>
                  : c.recordingCount > 0
                    ? <span style={{ fontSize: 12, fontWeight: 800, color: '#15803D' }}>{c.joined} attended \u00b7 {c.recordingCount} recording{c.recordingCount > 1 ? 's' : ''}</span>
                    : <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309' }}>{c.joined} attended \u00b7 no recording</span>}
              </div>
            ))}
          </div>
        )
      )}

      {/* Edit upcoming class */}
      {editCls && (
        <div onClick={() => setEditCls(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: 'min(440px,100%)', padding: 22, display: 'grid', gap: 12 }}>
            <b style={{ fontSize: 16, color: TOKENS.s900 }}>Edit class</b>
            <input value={editCls.title} onChange={e => setEditCls(x => ({ ...x, title: e.target.value }))} placeholder="Class title"
              style={{ padding: '10px 12px', border: `1.5px solid ${TOKENS.line}`, borderRadius: 9, fontSize: 13.5, fontWeight: 700 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 10 }}>
              <input type="datetime-local" value={editCls.when} onChange={e => setEditCls(x => ({ ...x, when: e.target.value }))}
                style={{ padding: '10px 12px', border: `1.5px solid ${TOKENS.line}`, borderRadius: 9, fontSize: 13 }} />
              <input type="number" min={15} max={240} value={editCls.mins} onChange={e => setEditCls(x => ({ ...x, mins: Number(e.target.value) }))}
                style={{ padding: '10px 12px', border: `1.5px solid ${TOKENS.line}`, borderRadius: 9, fontSize: 13 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={btn('ghost')} onClick={() => setEditCls(null)}>Cancel</button>
              <button style={btn('primary')} disabled={savingEdit} onClick={async () => {
                if (!editCls.title.trim() || !editCls.when) return toast?.error?.('Title and time are required.')
                setSavingEdit(true)
                try {
                  await api.patch('/liveclasses/' + editCls._id, { title: editCls.title.trim(), scheduledAt: new Date(editCls.when).toISOString(), durationMins: editCls.mins })
                  toast?.ok?.('Class updated. Students see the new details immediately.')
                  setEditCls(null); load()
                } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not update.') }
                finally { setSavingEdit(false) }
              }}>{savingEdit ? 'Saving...' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
