/**
 * LessonControl.jsx — the teacher's control over real lessons.
 *
 *  <LessonsToClose />       past lessons the teacher has not closed yet.
 *                           Closing = taught (full / partly covered),
 *                           student absent, or not held (with a reason).
 *                           Only a closed lesson moves the scheme of work
 *                           on, sets homework and counts attendance.
 *  <LessonsToClose staff /> the Director of Studies' view: every lesson
 *                           left unconfirmed for over 24 hours.
 *  <ExtraLessonForm />      book an extra or make-up lesson.
 */
import { useCallback, useEffect, useState } from 'react'
import { api } from '../../context/ctx.jsx'

const C = { crimson: '#7D1025', line: '#E5DFD3', ink: '#1F2937', mut: '#6B7280', bg: '#FBF8F3', green: '#15803D', amber: '#B45309', red: '#B91C1C' }
const fmt = (d) => new Date(d).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const btn = (primary) => ({ border: primary ? 'none' : `1px solid ${C.line}`, background: primary ? C.crimson : '#fff', color: primary ? '#fff' : C.ink, borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' })
const field = { width: '100%', boxSizing: 'border-box', border: `1px solid ${C.line}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit' }
const toLocalInput = (d) => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16) }

function CloseForm({ cls, onDone, toast }) {
  const [outcome, setOutcome] = useState('taught')
  const [coverage, setCoverage] = useState('full')
  const [topic, setTopic] = useState(cls.syllabusTopicName || cls.preparationLessonId?.title || '')
  const [subtopic, setSubtopic] = useState(cls.syllabusSubtopicName || '')
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [makeUp, setMakeUp] = useState(false)

  const save = async () => {
    setBusy(true)
    try {
      await api.post(`/liveclasses/${cls._id}/close`, { outcome, coverage, topic, subtopic, reason, note })
      toast?.ok?.(outcome === 'not_held' ? 'Recorded. The family has been told.' : 'Lesson closed.')
      if (outcome === 'not_held') setMakeUp(true)
      else onDone(cls._id)
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not close the lesson.') }
    finally { setBusy(false) }
  }

  if (makeUp) return (
    <div style={{ marginTop: 10 }}>
      <p style={{ fontSize: 13, color: C.ink, margin: '0 0 8px' }}>Book a make-up lesson now? The family is emailed the new time.</p>
      <ExtraLessonForm toast={toast} makeUpFor={cls} onDone={() => onDone(cls._id)} onCancel={() => onDone(cls._id)} />
    </div>
  )

  const choice = (v, label, hint) => (
    <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '8px 10px', border: `1px solid ${outcome === v ? C.crimson : C.line}`, borderRadius: 8, cursor: 'pointer', background: outcome === v ? '#FFF6F7' : '#fff', flex: '1 1 180px' }}>
      <input type="radio" name={'o' + cls._id} checked={outcome === v} onChange={() => setOutcome(v)} style={{ marginTop: 3 }} />
      <span><b style={{ fontSize: 13 }}>{label}</b><br /><span style={{ fontSize: 12, color: C.mut }}>{hint}</span></span>
    </label>
  )
  return (
    <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {choice('taught', 'Taught', 'Moves the plan on and sets homework')}
        {choice('student_absent', 'Student absent', 'Lesson ready but the student did not come')}
        {choice('not_held', 'Not held', 'Did not take place; the family is told')}
      </div>
      {outcome === 'taught' && (
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <label style={{ fontSize: 12, color: C.mut }}>Topic taught<input style={field} value={topic} onChange={e => setTopic(e.target.value)} maxLength={300} /></label>
          <label style={{ fontSize: 12, color: C.mut }}>Subtopic<input style={field} value={subtopic} onChange={e => setSubtopic(e.target.value)} maxLength={300} /></label>
          <label style={{ fontSize: 12, color: C.mut }}>How much was covered?
            <select style={field} value={coverage} onChange={e => setCoverage(e.target.value)}>
              <option value="full">All of it — move on</option>
              <option value="partial">Part of it — continue next lesson</option>
            </select>
          </label>
        </div>
      )}
      {outcome === 'not_held' && (
        <label style={{ fontSize: 12, color: C.mut }}>Why did it not take place? (sent to the family)
          <input style={field} value={reason} onChange={e => setReason(e.target.value)} maxLength={300} placeholder="e.g. Teacher unwell; power outage; public holiday" />
        </label>
      )}
      <label style={{ fontSize: 12, color: C.mut }}>Note for the record (optional, not sent)
        <textarea style={{ ...field, minHeight: 50 }} value={note} onChange={e => setNote(e.target.value)} maxLength={1000} />
      </label>
      <div><button type="button" style={btn(true)} disabled={busy || (outcome === 'not_held' && !reason.trim())} onClick={save}>{busy ? 'Saving…' : 'Close lesson'}</button></div>
    </div>
  )
}

export function LessonsToClose({ toast, staff = false, compact = false }) {
  const [list, setList] = useState(null)
  const [open, setOpen] = useState(null)
  const [err, setErr] = useState('')
  const load = useCallback(() => {
    api.get(staff ? '/liveclasses/staff/unconfirmed' : '/liveclasses/teacher/to-close?mine=1')
      .then(r => setList(r.data?.data?.classes || []))
      .catch(e => { setErr(e?.response?.data?.message || 'Could not load lessons.'); setList([]) })
  }, [staff])
  useEffect(() => { load() }, [load])
  const done = (id) => { setList(l => (l || []).filter(c => c._id !== id)); setOpen(null) }

  if (list === null) return null
  if (!list.length && compact) return null
  return (
    <section style={{ background: '#fff', border: `1px solid ${list.length ? '#F3D9A4' : C.line}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 16, color: C.ink }}>
          {staff ? 'Lessons to confirm (over 24 hours)' : 'Lessons to close'}
          {list.length > 0 && <span style={{ marginLeft: 8, background: '#FEF3C7', color: C.amber, borderRadius: 99, padding: '2px 9px', fontSize: 12 }}>{list.length}</span>}
        </h3>
        <span style={{ fontSize: 12, color: C.mut }}>{staff
          ? 'Teachers have not recorded whether these lessons were taught. You can close them on their behalf.'
          : 'Say what happened in each past lesson. Until you do, no homework is set and the plan does not move on.'}</span>
      </div>
      {err && <p style={{ color: C.red, fontSize: 13 }}>{err}</p>}
      {!list.length && <p style={{ fontSize: 13, color: C.green, margin: '10px 0 0' }}>All lessons are closed.</p>}
      <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0 }}>
        {list.map(c => (
          <li key={c._id} style={{ borderTop: `1px solid ${C.line}`, padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontSize: 13.5, color: C.ink }}>
                <b>{c.subject || c.title}</b>{c.syllabusTopicName ? ` — ${c.syllabusTopicName}${c.syllabusSubtopicName ? ': ' + c.syllabusSubtopicName : ''}` : ''}
                <div style={{ fontSize: 12, color: C.mut }}>{fmt(c.scheduledAt)} · {(c.assignedStudents || []).map(s => s.firstName).join(', ') || 'no students'}{staff && c.teacherId ? ` · ${c.teacherId.firstName} ${c.teacherId.lastName}` : ''}</div>
              </div>
              <button type="button" style={btn(open !== c._id)} onClick={() => setOpen(open === c._id ? null : c._id)}>{open === c._id ? 'Cancel' : 'Close lesson'}</button>
            </div>
            {open === c._id && <CloseForm cls={c} toast={toast} onDone={done} />}
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * Book an extra lesson (or a make-up for `makeUpFor`). Students come from
 * the make-up lesson, or are picked from `students` [{_id, firstName, lastName}].
 */
export function ExtraLessonForm({ toast, makeUpFor = null, students = [], subject = '', curriculum = '', grade = '', onDone, onCancel }) {
  const base = makeUpFor || {}
  const initialStudents = (base.assignedStudents || []).map(s => String(s._id || s))
  const [form, setForm] = useState({
    subject: base.subject || subject, curriculum: base.curriculum || curriculum, grade: base.grade || grade,
    when: toLocalInput(Date.now() + 24 * 3600000), durationMins: base.durationMins || 60,
    topic: base.syllabusTopicName || '', subtopic: base.syllabusSubtopicName || '', picked: initialStudents,
  })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const pool = students.length ? students : (base.assignedStudents || []).filter(s => s && s._id)
  const save = async () => {
    if (!form.picked.length) { toast?.error?.('Choose at least one student.'); return }
    setBusy(true)
    try {
      await api.post('/liveclasses', {
        title: `${makeUpFor ? 'Make-up' : 'Extra'} lesson — ${form.subject}`,
        subject: form.subject, curriculum: form.curriculum || 'General', grade: form.grade || 'All grades',
        scheduledAt: new Date(form.when).toISOString(), durationMins: Number(form.durationMins) || 60,
        kind: 'lesson', extra: true, makeUpFor: makeUpFor ? makeUpFor._id : null, classroomMode: 'native',
        assignedStudents: form.picked, syllabusTopicName: form.topic, syllabusSubtopicName: form.subtopic,
      })
      toast?.ok?.('Lesson booked. The family has been emailed.')
      onDone?.()
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not book the lesson.') }
    finally { setBusy(false) }
  }
  return (
    <div style={{ display: 'grid', gap: 8, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: 12 }}>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <label style={{ fontSize: 12, color: C.mut }}>Subject<input style={field} value={form.subject} onChange={set('subject')} /></label>
        <label style={{ fontSize: 12, color: C.mut }}>Date and time<input type="datetime-local" style={field} value={form.when} onChange={set('when')} /></label>
        <label style={{ fontSize: 12, color: C.mut }}>Minutes<input type="number" min="15" max="240" step="5" style={field} value={form.durationMins} onChange={set('durationMins')} /></label>
        <label style={{ fontSize: 12, color: C.mut }}>Topic (optional)<input style={field} value={form.topic} onChange={set('topic')} /></label>
      </div>
      {pool.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
          {pool.map(s => {
            const id = String(s._id)
            const on = form.picked.includes(id)
            return <label key={id} style={{ display: 'flex', gap: 5, alignItems: 'center', border: `1px solid ${on ? C.crimson : C.line}`, borderRadius: 99, padding: '3px 10px', background: '#fff', cursor: 'pointer' }}>
              <input type="checkbox" checked={on} onChange={() => setForm(f => ({ ...f, picked: on ? f.picked.filter(x => x !== id) : [...f.picked, id] }))} />{s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim()}
            </label>
          })}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" style={btn(true)} disabled={busy} onClick={save}>{busy ? 'Booking…' : makeUpFor ? 'Book make-up lesson' : 'Book extra lesson'}</button>
        {onCancel && <button type="button" style={btn(false)} onClick={onCancel}>{makeUpFor ? 'Not now' : 'Cancel'}</button>}
      </div>
    </div>
  )
}
