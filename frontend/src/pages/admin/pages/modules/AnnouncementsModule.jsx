import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'

// Some token keys vary across the codebase; fall back safely.
const LINE = TOKENS.line || '#EAE4DC'
const S600 = TOKENS.s600 || '#6B5D57'

// Category styling — mirrors the dashboard cards students and parents see.
const CATEGORIES = [
  { id: 'general',     label: 'General',     emoji: '\ud83d\udce2', tint: '#FBF3F4', bar: '#8B1A2E' },
  { id: 'event',       label: 'Event',       emoji: '\ud83d\uddd3\ufe0f', tint: '#FBF1F1', bar: '#C2410C' },
  { id: 'academic',    label: 'Academic',    emoji: '\ud83d\udcda', tint: '#EFF5EC', bar: '#3F6212' },
  { id: 'holiday',     label: 'Holiday',     emoji: '\u2600\ufe0f', tint: '#EEF4FB', bar: '#1D4ED8' },
  { id: 'achievement', label: 'Achievement', emoji: '\ud83c\udfc6', tint: '#FDF6E3', bar: '#B45309' },
  { id: 'reminder',    label: 'Reminder',    emoji: '\u23f0', tint: '#F3F0FA', bar: '#6D28D9' },
]
const catOf = id => CATEGORIES.find(c => c.id === id) || CATEGORIES[0]
const AUDIENCES = [
  { id: 'all', label: 'Everyone (students & parents)' },
  { id: 'students', label: 'Students only' },
  { id: 'parents', label: 'Parents only' },
]

const EMPTY = {
  title: '', body: '', category: 'general', audience: 'all',
  ctaLabel: '', ctaUrl: '', pinned: false, published: true,
  showFrom: '', showUntil: '',
}

const toLocalInput = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt)) return ''
  const pad = n => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

export default function AnnouncementsModule({ toast }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)   // id being edited, or 'new', or null
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/announcements/manage')
      .then(r => setList(r.data?.data?.announcements || []))
      .catch(() => toast?.error?.('Could not load announcements.'))
      .finally(() => setLoading(false))
  }, [toast])
  useEffect(() => { load() }, [load])

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const openNew = () => { setForm(EMPTY); setEditing('new') }
  const openEdit = (a) => {
    setForm({
      title: a.title || '', body: a.body || '', category: a.category || 'general',
      audience: a.audience || 'all', ctaLabel: a.ctaLabel || '', ctaUrl: a.ctaUrl || '',
      pinned: !!a.pinned, published: a.published !== false,
      showFrom: toLocalInput(a.showFrom), showUntil: toLocalInput(a.showUntil),
    })
    setEditing(a._id)
  }
  const cancel = () => { setEditing(null); setForm(EMPTY) }

  const save = async () => {
    if (!form.title.trim() || !form.body.trim()) { toast?.error?.('Add a title and a message.'); return }
    setSaving(true)
    const payload = {
      ...form,
      showFrom: form.showFrom ? new Date(form.showFrom).toISOString() : new Date().toISOString(),
      showUntil: form.showUntil ? new Date(form.showUntil).toISOString() : null,
    }
    try {
      if (editing === 'new') await api.post('/announcements', payload)
      else await api.patch('/announcements/' + editing, payload)
      toast?.ok?.('Announcement saved.')
      cancel(); load()
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Save failed.')
    }
    setSaving(false)
  }

  const remove = async (a) => {
    if (!window.confirm('Delete this announcement for good?')) return
    try { await api.delete('/announcements/' + a._id); toast?.ok?.('Deleted.'); load() }
    catch { toast?.error?.('Delete failed.') }
  }
  const togglePin = async (a) => {
    try { await api.patch('/announcements/' + a._id, { pinned: !a.pinned }); load() }
    catch { toast?.error?.('Could not update.') }
  }
  const togglePublish = async (a) => {
    try { await api.patch('/announcements/' + a._id, { published: !a.published }); load() }
    catch { toast?.error?.('Could not update.') }
  }

  const card = { background: '#fff', border: '1.5px solid ' + LINE, borderRadius: 14, padding: 20 }
  const fieldLabel = { fontSize: 12, fontWeight: 700, color: TOKENS.s700, marginBottom: 5, display: 'block' }
  const input = { width: '100%', padding: '10px 13px', border: '1.5px solid ' + LINE, borderRadius: 9, fontSize: 13.5, boxSizing: 'border-box' }
  const btn = (kind) => ({
    padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: '1.5px solid',
    borderColor: kind === 'primary' ? TOKENS.crimson : LINE,
    background: kind === 'primary' ? TOKENS.crimson : '#fff',
    color: kind === 'primary' ? '#fff' : TOKENS.s700,
  })

  const stateBadge = (a) => {
    if (a.expired) return { label: 'Expired', bg: '#F3F4F6', fg: '#6B7280' }
    if (!a.published) return { label: 'Draft', bg: '#FEF3C7', fg: '#92400E' }
    if (a.scheduled) return { label: 'Scheduled', bg: '#DBEAFE', fg: '#1E40AF' }
    if (a.live) return { label: 'Live', bg: '#DCFCE7', fg: '#166534' }
    return { label: '', bg: '#F3F4F6', fg: '#6B7280' }
  }

  return (
    <div style={{ display: 'grid', gap: 18, maxWidth: 940 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: TOKENS.s900, margin: 0 }}>Announcements</h2>
          <p style={{ fontSize: 13, color: TOKENS.s500, margin: '4px 0 0' }}>
            Broadcast to student and parent dashboards. Schedule repeated information once and it shows and hides on its own.
          </p>
        </div>
        {!editing && <button style={btn('primary')} onClick={openNew}>+ New announcement</button>}
      </div>

      {editing && (
        <div style={{ ...card, display: 'grid', gap: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: TOKENS.s900 }}>
            {editing === 'new' ? 'New announcement' : 'Edit announcement'}
          </div>

          <div>
            <label style={fieldLabel}>Title</label>
            <input style={input} value={form.title} maxLength={120}
              onChange={e => upd('title', e.target.value)} placeholder="e.g. Parent Orientation Webinar" />
          </div>
          <div>
            <label style={fieldLabel}>Message</label>
            <textarea style={{ ...input, minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }} value={form.body} maxLength={1000}
              onChange={e => upd('body', e.target.value)} placeholder="What do families need to know?" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={fieldLabel}>Category</label>
              <select style={input} value={form.category} onChange={e => upd('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji + '  ' + c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={fieldLabel}>Show to</label>
              <select style={input} value={form.audience} onChange={e => upd('audience', e.target.value)}>
                {AUDIENCES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={fieldLabel}>Button text (optional)</label>
              <input style={input} value={form.ctaLabel} maxLength={40}
                onChange={e => upd('ctaLabel', e.target.value)} placeholder="e.g. Register Now" />
            </div>
            <div>
              <label style={fieldLabel}>Button link (optional)</label>
              <input style={input} value={form.ctaUrl} maxLength={500}
                onChange={e => upd('ctaUrl', e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={fieldLabel}>Show from</label>
              <input type="datetime-local" style={input} value={form.showFrom}
                onChange={e => upd('showFrom', e.target.value)} />
              <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 4 }}>Leave blank to start now.</div>
            </div>
            <div>
              <label style={fieldLabel}>Show until (optional)</label>
              <input type="datetime-local" style={input} value={form.showUntil}
                onChange={e => upd('showUntil', e.target.value)} />
              <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 4 }}>Leave blank to show indefinitely.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: TOKENS.s700, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.pinned} onChange={e => upd('pinned', e.target.checked)} />
              Pin to top
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: TOKENS.s700, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.published} onChange={e => upd('published', e.target.checked)} />
              Published (uncheck to save as a draft)
            </label>
          </div>

          {/* Live preview of the dashboard card */}
          <div>
            <label style={fieldLabel}>Preview</label>
            <div style={{ background: catOf(form.category).tint, borderRadius: 12, padding: '16px 18px', maxWidth: 340, borderLeft: '4px solid ' + catOf(form.category).bar }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 26 }}>{catOf(form.category).emoji}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: TOKENS.s900 }}>{form.title || 'Announcement title'}</div>
                  <div style={{ fontSize: 12, color: S600, marginTop: 5, lineHeight: 1.5 }}>{form.body || 'Your message appears here.'}</div>
                  {form.ctaLabel && (
                    <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 800, color: catOf(form.category).bar }}>{form.ctaLabel} {'\u2192'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={btn('primary')} disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Save announcement'}</button>
            <button style={btn()} onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}

      {/* Existing announcements */}
      {loading ? (
        <div style={{ ...card, textAlign: 'center', color: TOKENS.s500 }}>Loading...</div>
      ) : list.length === 0 && !editing ? (
        <div style={{ ...card, textAlign: 'center', color: TOKENS.s500 }}>
          No announcements yet. Create your first to broadcast it to every dashboard.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {list.map(a => {
            const c = catOf(a.category); const sb = stateBadge(a)
            return (
              <div key={a._id} style={{ ...card, padding: 0, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: 5, background: c.bar, flexShrink: 0 }} />
                <div style={{ padding: '16px 18px', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{c.emoji}</span>
                    <span style={{ fontWeight: 800, fontSize: 15, color: TOKENS.s900 }}>{a.title}</span>
                    {a.pinned && <span style={{ fontSize: 10, fontWeight: 800, color: TOKENS.crimson }}>PINNED</span>}
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: sb.bg, color: sb.fg }}>{sb.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: S600, lineHeight: 1.55 }}>{a.body}</div>
                  <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 8, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <span>To: {AUDIENCES.find(x => x.id === a.audience)?.label || a.audience}</span>
                    {a.showFrom && <span>From {fmtDate(a.showFrom)}</span>}
                    {a.showUntil && <span>Until {fmtDate(a.showUntil)}</span>}
                    {a.authorName && <span>By {a.authorName}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    <button style={{ ...btn(), padding: '6px 13px', fontSize: 12 }} onClick={() => openEdit(a)}>Edit</button>
                    <button style={{ ...btn(), padding: '6px 13px', fontSize: 12 }} onClick={() => togglePin(a)}>{a.pinned ? 'Unpin' : 'Pin'}</button>
                    <button style={{ ...btn(), padding: '6px 13px', fontSize: 12 }} onClick={() => togglePublish(a)}>{a.published ? 'Unpublish' : 'Publish'}</button>
                    <button style={{ ...btn(), padding: '6px 13px', fontSize: 12, color: '#B91C1C', borderColor: '#FCA5A5' }} onClick={() => remove(a)}>Delete</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
