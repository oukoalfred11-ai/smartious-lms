import React, { useState, useEffect, useCallback } from 'react'
import { useStore, api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { PCard, PKpi, PSection } from '../shared/ui.jsx'
import { IGCSE_LIBRARY, IGCSE_MATHS_0580, LOWER_SEC_LIBRARY, PRIMARY_LIBRARY, PRIMARY_Y5_LIBRARY } from './spineData.js'

function SubjectsTab({ toast }) {
  // The 15 curricula from the new catalog
  const CURRICULA_LIST = [
    { id: 'CambridgePrimary',   name: 'Cambridge Primary' },
    { id: 'CambridgeLowerSec',  name: 'Cambridge Lower Secondary' },
    { id: 'CambridgeIGCSE',     name: 'Cambridge IGCSE' },
    { id: 'CambridgeALevel',    name: 'Cambridge A-Level' },
    { id: 'EdexcelLowerSec',    name: 'Edexcel Lower Secondary' },
    { id: 'EdexcelIGCSE',       name: 'Edexcel IGCSE' },
    { id: 'EdexcelALevel',      name: 'Edexcel A-Level' },
    { id: 'AQALowerSec',        name: 'AQA Lower Secondary' },
    { id: 'AQAGCSE',            name: 'AQA GCSE' },
    { id: 'AQAALevel',          name: 'AQA A-Level' },
    { id: 'IBPYP',              name: 'IB Primary Years (PYP)' },
    { id: 'IBMYP',              name: 'IB Middle Years (MYP)' },
    { id: 'IBDP',               name: 'IB Diploma (DP)' },
    { id: 'BNC',                name: 'British National Curriculum' },
    { id: 'American',           name: 'American Curriculum' },
    { id: 'Canadian',           name: 'Canadian Curriculum' },
    { id: 'KenyaCBC',           name: 'Kenya CBC' },
  ]
  // Categories grouped by curriculum family — drives the <optgroup>
  // dropdown in the form so admin sees categories organised by which
  // curricula use them. CATEGORIES (flat) is exposed for any code path
  // that just needs the list of valid values.
  const CATEGORY_GROUPS = [
    { label: 'Cambridge / Edexcel / AQA', categories: [
      'Mathematics', 'Sciences', 'Languages', 'Arts',
      'Business', 'Humanities', 'Technology', 'Physical Education',
    ]},
    { label: 'International Baccalaureate (IB)', categories: [
      'Studies in Language and Literature', 'Language and Literature',
      'Language Acquisition', 'Individuals and Societies',
      'The Arts', 'Physical and Health Education', 'IB Core',
    ]},
    { label: 'British National Curriculum', categories: [
      'Core', 'English', 'Practical', 'Design',
    ]},
    { label: 'Kenya CBC', categories: [
      'STEM', 'Social Studies', 'Life Skills',
    ]},
    { label: 'American / Other', categories: [
      'Electives',
    ]},
  ]
  const CATEGORIES = CATEGORY_GROUPS.flatMap(g => g.categories)

  const [filterCurriculum, setFilterCurriculum] = useState('CambridgeIGCSE')
  const [search, setSearch] = useState('')
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)        // subject object being edited
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    // includeInactive=true so admins see deactivated subjects (with the
    // INACTIVE badge and a Reactivate button). Other consumers of /subjects
    // (lesson forms, student dropdowns) omit this param and get active only.
    api.get('/subjects', { params: { curriculum: filterCurriculum, includeInactive: true } })
      .then(r => setSubjects(r.data?.subjects || []))
      .catch(() => toast?.error?.('Failed to load subjects.'))
      .finally(() => setLoading(false))
  }, [filterCurriculum, toast])

  useEffect(() => { load() }, [load])

  const filtered = search
    ? subjects.filter(s => s.subjectName?.toLowerCase().includes(search.toLowerCase()))
    : subjects

  const toggleActive = async (s) => {
    if (!window.confirm(`${s.isActive ? 'Deactivate' : 'Reactivate'} "${s.subjectName}"?`)) return
    setBusy(true)
    try {
      await api.patch('/subjects/' + s._id, { isActive: !s.isActive })
      toast?.ok?.(s.isActive ? 'Deactivated.' : 'Reactivated.')
      load()
    } catch (e) { toast?.error?.('Failed.') }
    finally { setBusy(false) }
  }

  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
    textTransform: 'uppercase', color: TOKENS.crimson, marginBottom: 5 }
  const inp = { width: '100%', boxSizing: 'border-box', padding: '8px 11px',
    borderRadius: 7, border: '1.5px solid ' + TOKENS.line, fontSize: 13, fontFamily: 'inherit', background: '#fff' }

  return (
    <div>
      {/* Filter row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'end', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 240px' }}>
          <label style={lbl}>Curriculum</label>
          <select value={filterCurriculum} onChange={e => setFilterCurriculum(e.target.value)} style={inp}>
            {CURRICULA_LIST.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ flex: '2 1 280px' }}>
          <label style={lbl}>Search subject name</label>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="e.g. Mathematics" style={inp}/>
        </div>
        <button onClick={() => setCreating(true)} style={{
          background: TOKENS.crimson, color: '#fff', border: 'none', borderRadius: 8,
          padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', height: 38,
        }}>+ Add Subject</button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: TOKENS.s500, fontSize: 13 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50, color: TOKENS.s500, fontSize: 13,
          border: '1px dashed ' + TOKENS.line, borderRadius: 12 }}>
          No subjects {search ? 'match the search' : 'in ' + filterCurriculum + ' yet'}. Click <b>+ Add Subject</b> to create one.
        </div>
      ) : (
        <div style={{ border: '1px solid ' + TOKENS.line, borderRadius: 12, overflow: 'hidden' }}>
          {filtered.map((s, i) => (
            <div key={s._id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderBottom: i < filtered.length - 1 ? '1px solid #F1ECE0' : 'none',
              background: s.isActive ? '#fff' : '#FAFAF8', opacity: s.isActive ? 1 : 0.6,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TOKENS.s900 }}>
                  {s.subjectName}
                  {!s.isActive && <span style={{ marginLeft: 8, fontSize: 10, color: '#B91C1C', fontWeight: 700 }}>INACTIVE</span>}
                </div>
                <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 2 }}>
                  {s.category}{s.code ? ' · ' + s.code : ''}
                </div>
              </div>
              <button onClick={() => setEditing(s)} disabled={busy} style={{
                border: '1.5px solid ' + TOKENS.line, background: '#fff', color: TOKENS.s700,
                borderRadius: 6, padding: '5px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
              }}>Edit</button>
              <button onClick={() => toggleActive(s)} disabled={busy} style={{
                border: '1.5px solid ' + (s.isActive ? '#FECACA' : TOKENS.line),
                background: '#fff', color: s.isActive ? '#B91C1C' : TOKENS.accentEmerald,
                borderRadius: 6, padding: '5px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
              }}>{s.isActive ? 'Deactivate' : 'Reactivate'}</button>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <SubjectFormModal
          editing={editing}
          curricula={CURRICULA_LIST}
          categories={CATEGORIES}
          categoryGroups={CATEGORY_GROUPS}
          defaultCurriculum={filterCurriculum}
          onClose={() => { setCreating(false); setEditing(null) }}
          onSaved={() => { setCreating(false); setEditing(null); load(); toast?.ok?.('Saved.') }}
          onError={(m) => toast?.error?.(m)}
        />
      )}
    </div>
  )
}

function SubjectFormModal({ editing, curricula, categories, categoryGroups, defaultCurriculum, onClose, onSaved, onError }) {
  const [form, setForm] = useState(() => editing ? {
    curriculum: editing.curriculum,
    subjectName: editing.subjectName || '',
    category: editing.category || 'Mathematics',
    code: editing.code || '',
    isActive: editing.isActive !== false,
  } : {
    curriculum: defaultCurriculum,
    subjectName: '',
    category: 'Mathematics',
    code: '',
    isActive: true,
  })
  const [saving, setSaving] = useState(false)
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.subjectName.trim()) { onError?.('Subject name required.'); return }
    if (!form.category.trim()) { onError?.('Category required.'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.patch('/subjects/' + editing._id, {
          subjectName: form.subjectName.trim(),
          category: form.category.trim(),
          code: form.code.trim() || undefined,
          isActive: form.isActive,
        })
      } else {
        await api.post('/subjects', {
          curriculum: form.curriculum,
          subjectName: form.subjectName.trim(),
          category: form.category.trim(),
          code: form.code.trim() || undefined,
        })
      }
      onSaved?.()
    } catch (e) {
      onError?.(e?.response?.data?.message || 'Failed to save subject.')
    } finally { setSaving(false) }
  }

  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
    textTransform: 'uppercase', color: TOKENS.crimson, marginBottom: 5 }
  const inp = { width: '100%', boxSizing: 'border-box', padding: '9px 12px',
    borderRadius: 7, border: '1.5px solid ' + TOKENS.line, fontSize: 13, fontFamily: 'inherit', background: '#fff' }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(35,23,21,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 14, padding: 24, maxWidth: 480, width: '100%',
        boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: TOKENS.s900, margin: '0 0 18px' }}>
          {editing ? 'Edit Subject' : 'New Subject'}
        </h3>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Curriculum *</label>
          <select value={form.curriculum} onChange={e => update('curriculum', e.target.value)}
            style={inp} disabled={!!editing}>
            {curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {editing && (
            <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 4 }}>
              Curriculum can't be changed after creation (would orphan the spine).
            </div>
          )}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Subject Name *</label>
          <input type="text" value={form.subjectName} onChange={e => update('subjectName', e.target.value)}
            placeholder="e.g. Primary Mathematics" style={inp}/>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Category *</label>
          <select value={form.category}
            onChange={e => update('category', e.target.value)} style={inp}>
            <option value="" disabled>— select a category —</option>
            {(categoryGroups || []).map(g => (
              <optgroup key={g.label} label={g.label}>
                {g.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </optgroup>
            ))}
            {/* Fallback to flat list if categoryGroups not provided */}
            {!categoryGroups && categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>Code (optional)</label>
          <input type="text" value={form.code} onChange={e => update('code', e.target.value)}
            placeholder="e.g. 0096" style={inp}/>
        </div>
        {editing && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, fontSize: 13 }}>
            <input type="checkbox" checked={form.isActive}
              onChange={e => update('isActive', e.target.checked)}/>
            Active
          </label>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={saving} style={{
            background: '#fff', border: '1.5px solid ' + TOKENS.line, color: TOKENS.s700,
            borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{
            background: saving ? '#9CA3AF' : TOKENS.crimson, color: '#fff', border: 'none',
            borderRadius: 8, padding: '9px 22px', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          }}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

function SyllabusSpineTab({ toast }) {
  const [curricula] = useState([
    { id: 'CambridgePrimary',   name: 'Cambridge Primary' },
    { id: 'CambridgeLowerSec',  name: 'Cambridge Lower Secondary' },
    { id: 'CambridgeIGCSE',     name: 'Cambridge IGCSE' },
    { id: 'CambridgeALevel',    name: 'Cambridge A-Level' },
    { id: 'EdexcelLowerSec',    name: 'Edexcel Lower Secondary' },
    { id: 'EdexcelIGCSE',       name: 'Edexcel IGCSE' },
    { id: 'EdexcelALevel',      name: 'Edexcel A-Level' },
    { id: 'AQALowerSec',        name: 'AQA Lower Secondary' },
    { id: 'AQAGCSE',            name: 'AQA GCSE' },
    { id: 'AQAALevel',          name: 'AQA A-Level' },
    { id: 'IBPYP',              name: 'IB Primary Years (PYP)' },
    { id: 'IBMYP',              name: 'IB Middle Years (MYP)' },
    { id: 'IBDP',               name: 'IB Diploma (DP)' },
    { id: 'BNC',                name: 'British National Curriculum' },
    { id: 'American',           name: 'American Curriculum' },
    { id: 'Canadian',           name: 'Canadian Curriculum' },
    { id: 'KenyaCBC',           name: 'Kenya CBC' },
  ])
  const [curriculum, setCurriculum] = useState('CambridgeIGCSE')
  const [subjects, setSubjects] = useState([])
  const [subjectId, setSubjectId] = useState('')
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState({})   // topicId -> bool
  const [busy, setBusy] = useState(false)

  // ── load subjects when curriculum changes ──
  useEffect(() => {
    let cancelled = false
    api.get('/subjects', { params: { curriculum } })
      .then(r => { if (!cancelled) { setSubjects(r.data.subjects || []); setSubjectId('') ; setTopics([]) } })
      .catch(() => toast?.error?.('Failed to load subjects.'))
    return () => { cancelled = true }
  }, [curriculum, toast])

  // ── load spine when subject changes ──
  const loadSpine = useCallback((sid) => {
    if (!sid) { setTopics([]); return }
    setLoading(true)
    api.get('/syllabus/subject/' + sid)
      .then(r => setTopics(r.data.data?.topics || []))
      .catch(() => toast?.error?.('Failed to load the syllabus spine.'))
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => { loadSpine(subjectId) }, [subjectId, loadSpine])

  const subjectName = (subjects.find(s => s._id === subjectId) || {}).subjectName || ''

  // ── topic operations ──
  const addTopic = async () => {
    const name = window.prompt('New topic name:')
    if (!name || !name.trim()) return
    setBusy(true)
    try {
      const { data } = await api.post('/syllabus/topic', { subjectId, topic: name.trim() })
      if (data?.success) { toast?.ok?.('Topic added.'); loadSpine(subjectId) }
      else toast?.error?.(data?.message || 'Failed.')
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Failed to add topic.') }
    finally { setBusy(false) }
  }

  const renameTopic = async (t) => {
    const name = window.prompt('Rename topic:', t.topic)
    if (!name || !name.trim() || name.trim() === t.topic) return
    setBusy(true)
    try {
      await api.patch('/syllabus/topic/' + t._id, { topic: name.trim() })
      toast?.ok?.('Topic renamed.'); loadSpine(subjectId)
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Failed.') }
    finally { setBusy(false) }
  }

  const deleteTopic = async (t) => {
    if (!window.confirm(`Delete topic "${t.topic}" and all its subtopics?`)) return
    setBusy(true)
    try {
      await api.delete('/syllabus/topic/' + t._id)
      toast?.ok?.('Topic deleted.'); loadSpine(subjectId)
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Failed.') }
    finally { setBusy(false) }
  }

  const moveTopic = async (idx, dir) => {
    const next = [...topics]
    const j = idx + dir
    if (j < 0 || j >= next.length) return
    ;[next[idx], next[j]] = [next[j], next[idx]]
    setTopics(next)
    try { await api.patch('/syllabus/reorder', { order: next.map(t => t._id) }) }
    catch { toast?.error?.('Failed to save order.'); loadSpine(subjectId) }
  }

  // ── subtopic operations (patch the whole subtopics array) ──
  const saveSubtopics = async (topic, subtopics) => {
    setBusy(true)
    try {
      await api.patch('/syllabus/topic/' + topic._id, { subtopics })
      loadSpine(subjectId)
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Failed.') }
    finally { setBusy(false) }
  }
  const addSubtopic = (topic) => {
    const name = window.prompt('New subtopic name:')
    if (!name || !name.trim()) return
    const subs = [...(topic.subtopics || []), { name: name.trim(), code: '', suggestedLessons: 1, subOrder: (topic.subtopics || []).length }]
    saveSubtopics(topic, subs)
  }
  const editSubtopic = (topic, idx) => {
    const s = topic.subtopics[idx]
    const name = window.prompt('Subtopic name:', s.name)
    if (name === null) return
    const lessonsRaw = window.prompt('Suggested lessons:', String(s.suggestedLessons ?? 1))
    if (lessonsRaw === null) return
    const subs = topic.subtopics.map((x, i) => i === idx
      ? { ...x, name: (name || '').trim() || x.name, suggestedLessons: parseInt(lessonsRaw, 10) || 0 }
      : x)
    saveSubtopics(topic, subs)
  }
  const deleteSubtopic = (topic, idx) => {
    if (!window.confirm('Delete this subtopic?')) return
    saveSubtopics(topic, topic.subtopics.filter((_, i) => i !== idx))
  }
  const moveSubtopic = (topic, idx, dir) => {
    const subs = [...topic.subtopics]
    const j = idx + dir
    if (j < 0 || j >= subs.length) return
    ;[subs[idx], subs[j]] = [subs[j], subs[idx]]
    saveSubtopics(topic, subs.map((s, i) => ({ ...s, subOrder: i })))
  }

  // ── load verified IGCSE Maths structure ──
  const loadIgcseMaths = async () => {
    if (!subjectId) { toast?.error?.('Pick a subject first.'); return }
    if (!/math/i.test(subjectName)) {
      if (!window.confirm(`The selected subject is "${subjectName}", not Mathematics. Load the IGCSE Maths structure into it anyway?`)) return
    }
    if (topics.length > 0 && !window.confirm('This REPLACES the entire existing spine for this subject. Continue?')) return
    setBusy(true)
    try {
      const { data } = await api.post('/syllabus/bulk', {
        subjectId, topics: IGCSE_MATHS_0580,
        sourceSyllabus: 'IGCSE Mathematics — 42-lesson scheme (Cambridge 0580 & Edexcel A 4MA1)',
      })
      if (data?.success) { toast?.ok?.(data.message || 'Loaded.'); loadSpine(subjectId) }
      else toast?.error?.(data?.message || 'Failed.')
    } catch (e) { await handleSpineError(e, { subjectId, topics: IGCSE_MATHS_0580, sourceSyllabus: 'IGCSE Mathematics — 42-lesson scheme (Cambridge 0580 & Edexcel A 4MA1)', }) }
    finally { setBusy(false) }
  }

  // ── load Cambridge Primary YEAR 5 spine (lesson-level) ──
  // Deeper than the all-stage Primary spine: one subtopic == one
  // lesson, so questions can be tagged to a specific lesson rather
  // than to a whole stage. Replaces the subject's spine.
  const loadPrimaryY5Spine = async () => {
    if (!subjectId) { toast?.error?.('Pick a subject first.'); return }
    const entry = PRIMARY_Y5_LIBRARY.find(e => e.match.test(subjectName))
    if (!entry) {
      toast?.error?.('No Year 5 spine matches "' + subjectName + '". Available: Mathematics, English, Science, Computing, Global Perspectives.')
      return
    }
    const lessons = entry.const_.reduce((n, t) => n + t.subtopics.length, 0)
    if (topics.length > 0 && !window.confirm(
      'This REPLACES the entire existing spine for this subject with the ' + lessons +
      '-lesson Year 5 (Stage 5) structure.\n\nAny lessons or progress already tagged to the current subtopics will lose that link. Continue?'
    )) return
    setBusy(true)
    try {
      const { data } = await api.post('/syllabus/bulk', {
        subjectId, topics: entry.const_, sourceSyllabus: entry.source,
      })
      if (data?.success) { toast?.ok?.(data.message || 'Loaded.'); loadSpine(subjectId) }
      else toast?.error?.(data?.message || 'Failed.')
    } catch (e) { await handleSpineError(e, { subjectId, topics: entry.const_, sourceSyllabus: entry.source, }) }
    finally { setBusy(false) }
  }

  // ── load Primary spine — auto-detects which subject ─────
  const loadPrimarySpine = async () => {
    if (!subjectId) { toast?.error?.('Pick a subject first.'); return }
    const entry = PRIMARY_LIBRARY.find(e => e.match.test(subjectName))
    if (!entry) {
      toast?.error?.('No Primary spine matches "' + subjectName + '". Expected one of: Mathematics, English, Science, Computing, Global Perspectives.')
      return
    }
    if (topics.length > 0 && !window.confirm('This REPLACES the entire existing spine for this subject. Continue?')) return
    setBusy(true)
    try {
      const { data } = await api.post('/syllabus/bulk', {
        subjectId, topics: entry.const_, sourceSyllabus: entry.source,
      })
      if (data?.success) { toast?.ok?.(data.message || 'Loaded.'); loadSpine(subjectId) }
      else toast?.error?.(data?.message || 'Failed.')
    } catch (e) { await handleSpineError(e, { subjectId, topics: entry.const_, sourceSyllabus: entry.source, }) }
    finally { setBusy(false) }
  }

  const loadLowerSecondarySpine = async () => {
    if (!subjectId) { toast?.error?.('Pick a subject first.'); return }
    const entry = LOWER_SEC_LIBRARY.find(e => e.match.test(subjectName))
    if (!entry) {
      toast?.error?.('No Lower Secondary spine matches "' + subjectName + '". Expected one of: Mathematics, English, Science, Computing, Global Perspectives.')
      return
    }
    if (topics.length > 0 && !window.confirm('This REPLACES the entire existing spine for this subject. Continue?')) return
    setBusy(true)
    try {
      const { data } = await api.post('/syllabus/bulk', {
        subjectId, topics: entry.const_, sourceSyllabus: entry.source,
      })
      if (data?.success) { toast?.ok?.(data.message || 'Loaded.'); loadSpine(subjectId) }
      else toast?.error?.(data?.message || 'Failed.')
    } catch (e) { await handleSpineError(e, { subjectId, topics: entry.const_, sourceSyllabus: entry.source, }) }
    finally { setBusy(false) }
  }

  /**
   * Handle a failed spine load.
   *
   * The bulk route now answers 409 with a code when the load would put
   * the wrong subject's content in place (SUBJECT_MISMATCH) or would
   * orphan questions (WOULD_ORPHAN_QUESTIONS). Those need the reason
   * shown and an explicit override, not a generic "failed" toast.
   *
   * Returns true when it handled the error itself.
   */
  const handleSpineError = async (e, payload) => {
    const d = e?.response?.data
    if (e?.response?.status !== 409 || !d?.code) {
      toast?.error?.(d?.message || 'Failed to load structure.')
      return true
    }
    if (!window.confirm(d.message + '\n\nPress OK only if you are certain. Cancel to stop.')) {
      toast?.info?.('Cancelled — nothing was changed.')
      return true
    }
    try {
      const { data } = await api.post('/syllabus/bulk', {
        ...payload, overrideSubjectCheck: true, acceptOrphans: true,
      })
      if (data?.success) { toast?.ok?.(data.message || 'Loaded.'); loadSpine(payload.subjectId) }
      else toast?.error?.(data?.message || 'Failed.')
    } catch (e2) {
      toast?.error?.(e2?.response?.data?.message || 'Failed to load structure.')
    }
    return true
  }

  const loadIgcseSpine = async () => {
    if (!subjectId) { toast?.error?.('Pick a subject first.'); return }
    const found = IGCSE_LIBRARY.find(e => e.match.test(subjectName))
    // Where a subject has different schemes per board, pick the one that
    // matches the curriculum currently selected.
    const entry = found?.byCurriculum?.[curriculum] || found
    if (!entry) {
      toast?.error?.('No IGCSE spine matches "' + subjectName + '". Available: Mathematics (use the IGCSE Maths 0580 button), Biology, Chemistry, Physics, English Language, Literature in English, ESL, Business Studies, Economics, Geography, History, Sociology.')
      return
    }
    if (topics.length > 0 && !window.confirm('This REPLACES the entire existing spine for this subject. Continue?')) return
    setBusy(true)
    try {
      const { data } = await api.post('/syllabus/bulk', {
        subjectId, topics: entry.const_, sourceSyllabus: entry.source,
      })
      if (data?.success) { toast?.ok?.(data.message || 'Loaded.'); loadSpine(subjectId) }
      else toast?.error?.(data?.message || 'Failed.')
    } catch (e) { await handleSpineError(e, { subjectId, topics: entry.const_, sourceSyllabus: entry.source, }) }
    finally { setBusy(false) }
  }

  // ── styles ──
  const sel = { padding: '8px 11px', borderRadius: 7, border: '1.5px solid ' + TOKENS.line,
    fontSize: 13, fontFamily: 'inherit', background: '#fff' }
  const totalSub = topics.reduce((s, t) => s + (t.subtopics || []).length, 0)
  const totalLessons = topics.reduce((s, t) =>
    s + (t.subtopics || []).reduce((a, x) => a + (x.suggestedLessons || 0), 0), 0)

  return (
    <div>
      {/* Subject picker */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
        <select value={curriculum} onChange={e => setCurriculum(e.target.value)} style={sel}>
          {curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={subjectId} onChange={e => setSubjectId(e.target.value)} style={{ ...sel, minWidth: 200 }}>
          <option value="">— Select a subject —</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
        </select>
        {subjectId && (
          <>
            <button onClick={addTopic} disabled={busy} style={{
              background: TOKENS.crimson, color: '#fff', border: 'none', borderRadius: 7,
              padding: '8px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            }}>+ Add Topic</button>
            <button onClick={loadIgcseMaths} disabled={busy} style={{
              background: '#fff', color: '#9A7B16', border: '1.5px dashed ' + TOKENS.gold,
              borderRadius: 7, padding: '8px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            }}>Load IGCSE Maths spine</button>
            {curriculum === 'CambridgePrimary' && (
              <button onClick={loadPrimarySpine} disabled={busy} title="All-stage planning spine (Stages 1-6): one subtopic per stage per strand" style={{
                background: '#fff', color: '#9A7B16', border: '1.5px dashed ' + TOKENS.gold,
                borderRadius: 7, padding: '8px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}>Load Cambridge Primary spine (all stages)</button>
            )}
            {curriculum === 'CambridgePrimary' && (
              <button onClick={loadPrimaryY5Spine} disabled={busy} title="Year 5 (Stage 5) lesson-level spine — one subtopic per lesson, for tagging questions to a specific lesson" style={{
                background: '#fff', color: '#8B1A2E', border: '1.5px solid #8B1A2E',
                borderRadius: 7, padding: '8px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}>Load Year 5 spine (lesson-level)</button>
            )}
            {curriculum === 'CambridgeLowerSec' && (
              <button onClick={loadLowerSecondarySpine} disabled={busy} title="Auto-detects which Lower Secondary spine matches the selected subject" style={{
                background: '#fff', color: '#9A7B16', border: '1.5px dashed ' + TOKENS.gold,
                borderRadius: 7, padding: '8px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}>Load Cambridge Lower Secondary spine</button>
            )}
            {(curriculum === 'CambridgeIGCSE' || curriculum === 'EdexcelIGCSE') && (
              <button onClick={loadIgcseSpine} disabled={busy} title="Auto-detects which IGCSE spine matches the selected subject. Cambridge and Edexcel IGCSE share the same teaching content and lesson sequence — they differ only in exam papers." style={{
                background: '#fff', color: '#9A7B16', border: '1.5px dashed ' + TOKENS.gold,
                borderRadius: 7, padding: '8px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}>Load IGCSE spine</button>
            )}
            <button style={{ background:'#FDFAF4', color:'#7D1025', border:'1.5px solid #C9A030', borderRadius:8, padding:'8px 14px', fontSize:12.5, fontWeight:700, cursor:'pointer' }}
              onClick={() => {
                const inp = document.createElement('input')
                inp.type = 'file'; inp.accept = 'application/json,.json'
                inp.onchange = async (ev) => {
                  const f = ev.target.files?.[0]; if (!f) return
                  try {
                    const parsed = JSON.parse(await f.text())
                    const topics = Array.isArray(parsed) ? parsed : parsed.topics
                    if (!Array.isArray(topics)) { toast?.error?.('JSON must contain a topics array.'); return }
                    if (!window.confirm('This REPLACES the entire ' + (subjectName || 'subject') + ' spine with ' + topics.length + ' topics from the file. Continue?')) return
                    const { data } = await api.post('/syllabus/bulk', { subjectId, topics, sourceSyllabus: parsed.sourceSyllabus || '' })
                    if (data?.success) { toast?.ok?.(data.message || 'Spine loaded.'); loadSpine(subjectId) }
                    else toast?.error?.(data?.message || 'Import failed.')
                  } catch (e) { toast?.error?.(e?.response?.data?.message || 'Invalid JSON file.') }
                }
                inp.click()
              }}>Import spine JSON</button>
          </>
        )}
      </div>

      {!subjectId ? (
        <div style={{ textAlign: 'center', color: TOKENS.s500, padding: 40, fontSize: 13 }}>
          Select a curriculum and subject to view or build its syllabus spine.
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', color: TOKENS.s500, padding: 40, fontSize: 13 }}>Loading spine…</div>
      ) : topics.length === 0 ? (
        <div style={{ textAlign: 'center', color: TOKENS.s500, padding: 40, fontSize: 13 }}>
          No syllabus spine yet for <b>{subjectName}</b>. Add topics, or load the verified IGCSE Maths structure.
        </div>
      ) : (
        <>
          {/* Summary */}
          <div style={{ display: 'flex', gap: 18, marginBottom: 16, fontSize: 12.5, color: TOKENS.s500 }}>
            <span><b style={{ color: TOKENS.s900 }}>{topics.length}</b> topics</span>
            <span><b style={{ color: TOKENS.s900 }}>{totalSub}</b> subtopics</span>
            <span><b style={{ color: TOKENS.s900 }}>{totalLessons}</b> suggested lessons</span>
          </div>

          {/* Topic list */}
          {topics.map((t, ti) => {
            const open = expanded[t._id]
            const tLessons = (t.subtopics || []).reduce((a, x) => a + (x.suggestedLessons || 0), 0)
            return (
              <div key={t._id} style={{ border: '1px solid ' + TOKENS.line, borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
                {/* Topic header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: TOKENS.cream }}>
                  <button onClick={() => setExpanded(e => ({ ...e, [t._id]: !open }))} style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: TOKENS.crimson, fontWeight: 800,
                  }}>{open ? '▾' : '▸'}</button>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: TOKENS.s900 }}>
                      {t.code ? t.code + '. ' : ''}{t.topic}
                    </span>
                    <span style={{ fontSize: 11.5, color: TOKENS.s500, marginLeft: 10 }}>
                      {(t.subtopics || []).length} subtopics · {tLessons} lessons
                    </span>
                  </div>
                  <button onClick={() => moveTopic(ti, -1)} disabled={ti === 0} style={miniBtn}>↑</button>
                  <button onClick={() => moveTopic(ti, 1)} disabled={ti === topics.length - 1} style={miniBtn}>↓</button>
                  <button onClick={() => renameTopic(t)} style={miniBtn}>Rename</button>
                  <button onClick={() => addSubtopic(t)} style={miniBtn}>+ Sub</button>
                  <button onClick={() => deleteTopic(t)} style={{ ...miniBtn, color: '#B91C1C' }}>Delete</button>
                </div>

                {/* Subtopics */}
                {open && (
                  <div style={{ padding: '6px 14px 12px 36px' }}>
                    {(t.subtopics || []).length === 0 ? (
                      <div style={{ fontSize: 12, color: TOKENS.s500, padding: '8px 0' }}>No subtopics. Use “+ Sub”.</div>
                    ) : t.subtopics.map((s, si) => (
                      <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: si < t.subtopics.length - 1 ? '1px solid ' + TOKENS.cream : 'none' }}>
                        <span style={{ flex: 1, fontSize: 12.5, color: TOKENS.s900 }}>
                          {s.code ? <b style={{ color: TOKENS.s500 }}>{s.code} </b> : ''}{s.name}
                        </span>
                        <span style={{ fontSize: 11, color: TOKENS.s500, background: TOKENS.cream, padding: '2px 8px', borderRadius: 20 }}>
                          {s.suggestedLessons || 0} lesson{(s.suggestedLessons || 0) === 1 ? '' : 's'}
                        </span>
                        <button onClick={() => moveSubtopic(t, si, -1)} disabled={si === 0} style={miniBtn}>↑</button>
                        <button onClick={() => moveSubtopic(t, si, 1)} disabled={si === t.subtopics.length - 1} style={miniBtn}>↓</button>
                        <button onClick={() => editSubtopic(t, si)} style={miniBtn}>Edit</button>
                        <button onClick={() => deleteSubtopic(t, si)} style={{ ...miniBtn, color: '#B91C1C' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

const miniBtn = {
  background: '#fff', border: '1px solid #E8E2D6', borderRadius: 6,
  padding: '4px 9px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
  color: '#7D1025', whiteSpace: 'nowrap',
}

function CurriculumModule({ refreshKey, toast }) {
  const store = useStore()
  const curricula = store.curricula || []
  const [tab, setTab] = useState('overview')

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      padding: '9px 18px', border: 'none', borderRadius: 8,
      background: tab === id ? TOKENS.crimson : '#fff',
      color: tab === id ? '#fff' : TOKENS.s700,
      border: '1.5px solid ' + (tab === id ? TOKENS.crimson : TOKENS.line),
      fontWeight: 700, fontSize: 13, cursor: 'pointer',
    }}>{label}</button>
  )

  return (
    <>
      <PSection tag="Academic" title="Curriculum" em="Manager" sub="Subjects, grades and the syllabus spine"/>
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {tabBtn('overview', 'Overview')}
        {tabBtn('subjects', 'Subjects')}
        {tabBtn('spine', 'Syllabus Spine')}
      </div>

      {tab === 'subjects' && <SubjectsTab toast={toast} />}
      {tab === 'spine' && <SyllabusSpineTab toast={toast} />}

      {tab === 'overview' && (<>
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Curricula" value={curricula.length}/>
        <PKpi label="Subjects" value="42"/>
        <PKpi label="Year Groups" value="16"/>
        <PKpi label="Languages" value="8"/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {(curricula.length > 0 ? curricula : [
          { name: 'IGCSE', subjects: ['Maths', 'English', 'Physics', 'Chemistry', 'Biology'] },
          { name: 'A-Level', subjects: ['Further Maths', 'Physics', 'Chemistry'] },
          { name: 'IB Diploma', subjects: ['HL Maths', 'HL English', 'HL Sciences'] },
          { name: 'Kenya CBC', subjects: ['Maths', 'English', 'Kiswahili', 'Sciences'] },
          { name: 'American', subjects: ['Algebra', 'Geometry', 'Biology'] },
          { name: 'British', subjects: ['Maths', 'English Lit', 'Sciences'] },
        ]).map((c, i) => {
          const subjList = Array.isArray(c.subjects) ? c.subjects : []
          return (
          <PCard key={i} accent={TOKENS.gold}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, color: TOKENS.s900, marginBottom: 8, fontWeight: 600 }}>{c.name}</h3>
            <div style={{ fontSize: 12, color: TOKENS.s500, marginBottom: 12 }}>{subjList.length} subjects offered</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {subjList.slice(0, 6).map((s, si) => (
                <span key={si} style={{ display: 'inline-block', padding: '3px 9px', background: TOKENS.goldPale, color: '#8E6B1A', border: '1px solid ' + TOKENS.gold, borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{typeof s === 'string' ? s : (s && s.name) || ''}</span>
              ))}
            </div>
          </PCard>
          )
        })}
      </div>
      </>)}
    </>
  )
}

export default CurriculumModule
