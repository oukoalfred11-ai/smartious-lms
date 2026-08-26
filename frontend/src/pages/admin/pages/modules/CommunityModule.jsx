/**
 * CommunityModule.jsx — the moderation room for the school-wide
 * community. Three views:
 *
 *   Review queue — reported and auto-hidden posts, each with its
 *                  reports, and one-click remove / restore / dismiss.
 *   Live feed    — the feed as students see it, with pin and remove
 *                  on every card, and an announcement composer.
 *   Removed      — the audit trail of removed content.
 *
 * Everything acts through /api/community endpoints; nothing here
 * bypasses the same rules students live under.
 */
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'

const ago = (d) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
const name = (a) => a ? `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Student' : 'Student'

const KIND_BADGE = {
  question:    { bg: '#EEF2FF', fg: '#4338CA', label: 'Question' },
  tip:         { bg: '#ECFDF5', fg: '#047857', label: 'Study Tip' },
  achievement: { bg: '#FEF3C7', fg: '#B45309', label: 'Achievement' },
  poll:        { bg: '#FCE7F3', fg: '#BE185D', label: 'Poll' },
}

export default function CommunityModule({ toast }) {
  const [tab, setTab] = useState('queue')
  const [chatQueue, setChatQueue] = useState([])
  const [chatRemoved, setChatRemoved] = useState([])
  const [queue, setQueue] = useState([])
  const [removed, setRemoved] = useState([])
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)
  const [announcement, setAnnouncement] = useState('')
  const [postingAnn, setPostingAnn] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/community/moderation/queue'),
      api.get('/community/posts'),
      api.get('/community-chat/moderation/queue'),
    ]).then(([q, f, cq]) => {
      setQueue(q.data?.data?.queue || [])
      setRemoved(q.data?.data?.recentRemoved || [])
      setFeed(f.data?.data?.posts || [])
      setChatQueue(cq.data?.data?.queue || [])
      setChatRemoved(cq.data?.data?.removed || [])
    }).catch(() => toast?.error?.('Could not load the community.'))
      .finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const act = async (id, action, needReason) => {
    let reason = ''
    if (needReason) {
      reason = window.prompt('Reason (kept on record, shown to no student):') 
      if (reason === null) return
    }
    try {
      await api.post('/community/posts/' + id + '/moderate', { action, reason })
      toast?.ok?.(action === 'remove' ? 'Post removed and recorded.' : 'Done.')
      load()
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Action failed.')
    }
  }

  const postAnnouncement = async () => {
    const text = announcement.trim()
    if (!text) return
    setPostingAnn(true)
    try {
      const r = await api.post('/community/posts', { kind: 'post', body: text })
      await api.post('/community/posts/' + r.data.data.post._id + '/moderate', { action: 'pin' })
      setAnnouncement('')
      toast?.ok?.('Announcement posted and pinned for the whole school.')
      load()
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not post.')
    }
    setPostingAnn(false)
  }

  const card = { background: '#fff', border: '1.5px solid ' + TOKENS.line, borderRadius: 12, padding: 16 }
  const btn = (variant) => ({
    padding: '6px 14px', borderRadius: 7, fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
    border: '1.5px solid ' + (variant === 'danger' ? '#B91C1C' : variant === 'primary' ? TOKENS.crimson : TOKENS.line),
    background: variant === 'danger' ? '#B91C1C' : variant === 'primary' ? TOKENS.crimson : '#fff',
    color: (variant === 'danger' || variant === 'primary') ? '#fff' : TOKENS.s600,
  })
  const tabBtn = (id, label, count) => (
    <button onClick={() => setTab(id)} style={{
      padding: '8px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
      border: 'none', background: tab === id ? TOKENS.crimson : 'transparent',
      color: tab === id ? '#fff' : TOKENS.s600,
    }}>
      {label}{typeof count === 'number' ? ' (' + count + ')' : ''}
    </button>
  )

  const PostCard = ({ p, inQueue }) => {
    const badge = KIND_BADGE[p.kind]
    return (
      <div style={{ ...card, borderColor: inQueue ? '#F59E0B' : TOKENS.line }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 13, color: TOKENS.s900 }}>{name(p.author)}</span>
          {p.author?.role && p.author.role !== 'student' && (
            <span style={{ fontSize: 9.5, fontWeight: 800, color: '#fff', background: TOKENS.crimson, padding: '2px 7px', borderRadius: 999, textTransform: 'uppercase' }}>{p.author.role}</span>
          )}
          {p.author?.gradeLevel && <span style={{ fontSize: 11, color: TOKENS.s500 }}>{p.author.gradeLevel}</span>}
          <span style={{ fontSize: 11, color: TOKENS.s500 }}>{ago(p.createdAt)}</span>
          {badge && <span style={{ fontSize: 9.5, fontWeight: 800, color: badge.fg, background: badge.bg, padding: '2px 7px', borderRadius: 999 }}>{badge.label}</span>}
          {p.pinned && <span style={{ fontSize: 9.5, fontWeight: 800, color: '#B45309', background: '#FEF3C7', padding: '2px 7px', borderRadius: 999 }}>PINNED</span>}
          {p.status === 'pending_review' && <span style={{ fontSize: 9.5, fontWeight: 800, color: '#fff', background: '#F59E0B', padding: '2px 7px', borderRadius: 999 }}>AUTO HIDDEN</span>}
        </div>
        <div style={{ fontSize: 13, color: TOKENS.s700, lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>{p.body}</div>
        {(p.reports || []).length > 0 && (
          <div style={{ marginTop: 10, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: '#92400E', marginBottom: 4 }}>REPORTS ({p.reports.length})</div>
            {p.reports.map((r, i) => (
              <div key={i} style={{ fontSize: 11.5, color: '#78350F' }}>
                {name(r.by)}{r.reason ? ': "' + r.reason + '"' : ' (no reason given)'} \u00b7 {ago(r.at)}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {inQueue ? (
            <>
              <button style={btn('danger')} onClick={() => act(p._id, 'remove', true)}>Remove post</button>
              {p.status === 'pending_review' && <button style={btn('primary')} onClick={() => act(p._id, 'restore')}>Restore to feed</button>}
              <button style={btn()} onClick={() => act(p._id, 'dismiss_reports')}>Dismiss reports</button>
            </>
          ) : p.status === 'removed' ? (
            <button style={btn()} onClick={() => act(p._id, 'restore')}>Restore</button>
          ) : (
            <>
              <button style={btn()} onClick={() => act(p._id, p.pinned ? 'unpin' : 'pin')}>{p.pinned ? 'Unpin' : 'Pin'}</button>
              <button style={btn('danger')} onClick={() => act(p._id, 'remove', true)}>Remove</button>
            </>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 11, color: TOKENS.s500, alignSelf: 'center' }}>
            {p.likeCount || 0} likes \u00b7 {(p.comments || []).length} comments
          </span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 820 }}>
      <div>
        <div style={{ fontSize: 19, fontWeight: 800, color: TOKENS.s900 }}>Community</div>
        <div style={{ fontSize: 12.5, color: TOKENS.s500 }}>
          One school wide feed, monitored and moderated. No private messages exist anywhere in the system.
        </div>
      </div>

      {/* Announcement composer */}
      <div style={{ ...card, borderColor: TOKENS.crimson + '55' }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: TOKENS.s900, marginBottom: 8 }}>Post a pinned announcement</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={announcement} onChange={e => setAnnouncement(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') postAnnouncement() }}
            placeholder="Speak to the whole school..." maxLength={2000}
            style={{ flex: 1, padding: '10px 13px', border: '1.5px solid ' + TOKENS.line, borderRadius: 8, fontSize: 13 }} />
          <button style={btn('primary')} disabled={postingAnn} onClick={postAnnouncement}>
            {postingAnn ? 'Posting...' : 'Post and pin'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, background: TOKENS.cream, padding: 5, borderRadius: 10, width: 'fit-content' }}>
        {tabBtn('chatqueue', 'Chat reports', chatQueue.length)}
        {tabBtn('queue', 'Feed queue', queue.length)}
        {tabBtn('feed', 'Live feed', feed.length)}
        {tabBtn('removed', 'Removed', removed.length + chatRemoved.length)}
      </div>

      {loading ? (
        <div style={{ ...card, textAlign: 'center', color: TOKENS.s500, fontSize: 13 }}>Loading...</div>
      ) : tab === 'chatqueue' ? (
        chatQueue.length === 0
          ? <div style={{ ...card, textAlign: 'center', color: '#166534', fontSize: 13, fontWeight: 700 }}>No reported chat messages. The room is healthy.</div>
          : chatQueue.map(m => (
            <div key={m._id} style={{ ...card, borderColor: '#F59E0B' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: TOKENS.s900 }}>{name(m.author)}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: TOKENS.s500, textTransform: 'uppercase' }}>{m.channel}</span>
                <span style={{ fontSize: 11, color: TOKENS.s500 }}>{ago(m.createdAt)}</span>
                {m.status === 'pending_review' && <span style={{ fontSize: 9.5, fontWeight: 800, color: '#fff', background: '#F59E0B', padding: '2px 7px', borderRadius: 999 }}>AUTO HIDDEN</span>}
              </div>
              <div style={{ fontSize: 13, color: TOKENS.s700, lineHeight: 1.55, whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>{m.body}</div>
              {(m.reports || []).length > 0 && (
                <div style={{ marginTop: 8, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '7px 11px' }}>
                  {m.reports.map((r, i) => (
                    <div key={i} style={{ fontSize: 11.5, color: '#78350F' }}>{name(r.by)}{r.reason ? ': "' + r.reason + '"' : ' (no reason)'}</div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button style={btn('danger')} onClick={async () => {
                  const reason = window.prompt('Reason (kept on record):'); if (reason === null) return
                  await api.post('/community-chat/messages/' + m._id + '/moderate', { action: 'remove', reason }).catch(() => {})
                  toast?.ok?.('Message removed.'); load()
                }}>Remove</button>
                {m.status === 'pending_review' && <button style={btn('primary')} onClick={async () => {
                  await api.post('/community-chat/messages/' + m._id + '/moderate', { action: 'restore' }).catch(() => {})
                  toast?.ok?.('Restored.'); load()
                }}>Restore</button>}
                <button style={btn()} onClick={async () => {
                  await api.post('/community-chat/messages/' + m._id + '/moderate', { action: 'dismiss_reports' }).catch(() => {})
                  toast?.ok?.('Dismissed.'); load()
                }}>Dismiss reports</button>
              </div>
            </div>
          ))
      ) : tab === 'queue' ? (
        queue.length === 0
          ? <div style={{ ...card, textAlign: 'center', color: '#166534', fontSize: 13, fontWeight: 700 }}>The queue is clear. Nothing needs review.</div>
          : queue.map(p => <PostCard key={p._id} p={p} inQueue />)
      ) : tab === 'feed' ? (
        feed.length === 0
          ? <div style={{ ...card, textAlign: 'center', color: TOKENS.s500, fontSize: 13 }}>The feed is empty. Post the first announcement above.</div>
          : feed.map(p => <PostCard key={p._id} p={p} />)
      ) : (
        removed.length === 0
          ? <div style={{ ...card, textAlign: 'center', color: TOKENS.s500, fontSize: 13 }}>Nothing has been removed.</div>
          : removed.map(p => <PostCard key={p._id} p={p} />)
      )}
    </div>
  )
}
