/**
 * LessonPlan.jsx — a student's lesson plan, subject by subject.
 *
 *  <LessonPlan editable />          the student's own plan: they mark each
 *                                   topic "I've got it" or "I need help".
 *  <LessonPlan studentId={id} />    read-only, for parents and teachers.
 *  <HelpRequests />                 for teachers: topics their students
 *                                   asked for help with.
 *
 * A topic is Done only once the teacher closed the lesson that taught it.
 */
import { useCallback, useEffect, useState } from 'react'
import { api } from '../../context/ctx.jsx'

const C = { crimson: '#7D1025', line: '#E5DFD3', ink: '#1F2937', mut: '#6B7280', bg: '#FBF8F3', green: '#15803D', amber: '#B45309', red: '#B91C1C', blue: '#1D4ED8' }
const day = (d) => new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
const dayTime = (d) => new Date(d).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const pill = (bg, fg, t, title) => <span title={title} style={{ background: bg, color: fg, borderRadius: 99, padding: '2px 9px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{t}</span>
const btn = (on, col) => ({ border: `1px solid ${on ? col : C.line}`, background: on ? col : '#fff', color: on ? '#fff' : C.ink, borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' })

function Item({ it, subject, editable, onSet }) {
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState(it.confidence?.note || '')
  const conf = it.confidence?.state
  const status = {
    done: pill('#D1FAE5', '#065F46', 'Done'),
    in_progress: pill('#DBEAFE', C.blue, 'In progress', 'Started; the teacher continues it next lesson'),
    next: pill('#FEF3C7', C.amber, 'Next'),
    planned: pill('#F3F4F6', '#4B5563', 'Planned'),
  }[it.status]
  return (
    <li style={{ padding: '10px 0', borderTop: `1px solid ${C.line}` }}>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: '1 1 260px' }}>
          <div style={{ fontSize: 14, color: C.ink, fontWeight: 600 }}>{it.title}</div>
          {it.topic && it.topic !== it.title && <div style={{ fontSize: 12, color: C.mut }}>{it.topic}</div>}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 5 }}>
            {status}
            {it.taughtAt && pill('#F9FAFB', C.mut, 'Taught ' + day(it.taughtAt))}
            {it.status === 'done' && it.attended === false && pill('#FEE2E2', C.red, it.recording ? 'Missed — watch the recording' : 'Missed this lesson')}
            {!it.taughtAt && it.scheduledFor && pill('#F9FAFB', C.mut, dayTime(it.scheduledFor))}
            {it.mastered && pill('#EDE9FE', '#5B21B6', 'Mastered', 'Marked by your teacher')}
            {!editable && conf === 'got_it' && pill('#D1FAE5', '#065F46', 'Student: got it')}
            {!editable && conf === 'need_help' && pill('#FEE2E2', C.red, it.confidence.resolvedAt ? 'Asked for help — dealt with' : 'Student: needs help')}
          </div>
          {!editable && it.confidence?.note && <div style={{ fontSize: 12, color: C.mut, marginTop: 4 }}>“{it.confidence.note}”</div>}
        </div>
        {editable && (it.status === 'done' || it.status === 'in_progress') && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" style={btn(conf === 'got_it', C.green)} onClick={() => onSet(it, conf === 'got_it' ? '' : 'got_it', '')}>I’ve got it</button>
            <button type="button" style={btn(conf === 'need_help', C.red)} onClick={() => (conf === 'need_help' ? onSet(it, '', '') : setNoteOpen(true))}>I need help</button>
          </div>
        )}
      </div>
      {editable && noteOpen && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          <input value={note} onChange={e => setNote(e.target.value)} maxLength={500} placeholder="What is difficult? (optional, your teacher sees this)"
            style={{ flex: '1 1 240px', border: `1px solid ${C.line}`, borderRadius: 8, padding: '7px 10px', fontSize: 13 }} />
          <button type="button" style={btn(true, C.red)} onClick={() => { onSet(it, 'need_help', note); setNoteOpen(false) }}>Send to my teacher</button>
          <button type="button" style={btn(false)} onClick={() => setNoteOpen(false)}>Cancel</button>
        </div>
      )}
    </li>
  )
}

export function SubjectPlan({ s, editable, onSet }) {
  const [showDone, setShowDone] = useState(false)
  const done = s.items.filter(i => i.status === 'done')
  const now = s.items.filter(i => i.status === 'in_progress' || i.status === 'next')
  const later = s.items.filter(i => i.status === 'planned')
  const pct = s.counts.total ? Math.round((s.counts.done / s.counts.total) * 100) : 0
  return (
    <section style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <h3 style={{ margin: 0, fontSize: 17, color: C.ink }}>{s.subject}</h3>
        <span style={{ fontSize: 12, color: C.mut }}>{s.teacher ? s.teacher + ' · ' : ''}{(s.slots || []).map(x => `${x.day} ${x.start}`).join(', ')}</span>
      </div>
      {s.mode === 'none' ? (
        <p style={{ fontSize: 13, color: C.mut, margin: '8px 0 0' }}>Your teacher has not published a scheme of work for this subject yet.</p>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0 4px' }}>
            <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: pct + '%', height: '100%', background: C.green }} />
            </div>
            <span style={{ fontSize: 12, color: C.mut, whiteSpace: 'nowrap' }}>{s.counts.done} of {s.counts.total} topics taught</span>
          </div>
          <div style={{ fontSize: 12, color: C.mut }}>
            {s.counts.gotIt > 0 && <span style={{ color: C.green, marginRight: 10 }}>{s.counts.gotIt} understood</span>}
            {s.counts.needHelp > 0 && <span style={{ color: C.red }}>{s.counts.needHelp} need help</span>}
          </div>
          {now.length > 0 && <><h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: C.mut, margin: '12px 0 0' }}>Now</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>{now.map(it => <Item key={it.key} it={it} subject={s} editable={editable} onSet={(i, st, note) => onSet(s, i, st, note)} />)}</ul></>}
          {later.length > 0 && <><h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: C.mut, margin: '12px 0 0' }}>Coming up</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>{later.slice(0, 6).map(it => <Item key={it.key} it={it} subject={s} editable={editable} onSet={(i, st, note) => onSet(s, i, st, note)} />)}</ul>
            {later.length > 6 && <p style={{ fontSize: 12, color: C.mut, margin: '6px 0 0' }}>…and {later.length - 6} more topics this year.</p>}</>}
          {done.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <button type="button" onClick={() => setShowDone(v => !v)} style={{ background: 'none', border: 'none', color: C.crimson, fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 13 }}>
                {showDone ? 'Hide' : 'Show'} {done.length} topic{done.length > 1 ? 's' : ''} already taught
              </button>
              {showDone && <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0' }}>{done.slice().reverse().map(it => <Item key={it.key} it={it} subject={s} editable={editable} onSet={(i, st, note) => onSet(s, i, st, note)} />)}</ul>}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export function LessonPlan({ studentId = null, editable = false, toast }) {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const load = useCallback(() => {
    api.get(studentId ? `/lesson-plan/student/${studentId}` : '/lesson-plan/me')
      .then(r => setData(r.data?.data || { subjects: [] }))
      .catch(e => { setErr(e?.response?.data?.message || 'Could not load the lesson plan.'); setData({ subjects: [] }) })
  }, [studentId])
  useEffect(() => { load() }, [load])

  const onSet = async (s, it, state, note) => {
    try {
      const r = await api.put('/lesson-plan/me/confidence', { subjectId: s.subjectId, subject: s.subject, key: it.key, title: it.title, state, note })
      if (state) toast?.ok?.(r.data?.message || 'Saved.')
      load()
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not save.') }
  }

  if (!data) return <div style={{ padding: 30, textAlign: 'center', color: C.mut }}>Loading the lesson plan…</div>
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: C.ink }}>{editable ? 'My lesson plan' : 'Lesson plan'}</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: C.mut }}>
          {editable
            ? 'What each teacher is teaching you, in order. After each lesson, mark the topic “I’ve got it” or “I need help” — your teacher and parents see it.'
            : 'Every subject’s topics in order: what has been taught (and whether the student attended), what is next, and how confident the student feels.'}
        </p>
      </div>
      {err && <p style={{ color: C.red, fontSize: 13 }}>{err}</p>}
      {!data.subjects.length && !err && <p style={{ color: C.mut, fontSize: 13 }}>No timetabled subjects yet.</p>}
      {data.subjects.map(s => <SubjectPlan key={String(s.entryIds?.[0] || s.subject)} s={s} editable={editable} onSet={onSet} />)}
    </div>
  )
}

export function HelpRequests({ toast }) {
  const [flags, setFlags] = useState(null)
  const load = useCallback(() => {
    api.get('/lesson-plan/teacher/help').then(r => setFlags(r.data?.data?.flags || [])).catch(() => setFlags([]))
  }, [])
  useEffect(() => { load() }, [load])
  if (!flags || !flags.length) return null
  const resolve = async (f) => {
    try { await api.post(`/lesson-plan/teacher/help/${f._id}/resolve`); toast?.ok?.('Marked as dealt with.'); load() }
    catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not update.') }
  }
  return (
    <section style={{ background: '#fff', border: '1px solid #FCA5A5', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
      <h3 style={{ margin: 0, fontSize: 16, color: C.ink }}>Students asking for help <span style={{ marginLeft: 6, background: '#FEE2E2', color: C.red, borderRadius: 99, padding: '2px 9px', fontSize: 12 }}>{flags.length}</span></h3>
      <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
        {flags.map(f => (
          <li key={f._id} style={{ borderTop: `1px solid ${C.line}`, padding: '8px 0', display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ fontSize: 13.5, color: C.ink }}>
              <b>{f.studentId ? `${f.studentId.firstName} ${f.studentId.lastName || ''}` : 'Student'}</b> · {f.subject} — {f.title}
              {f.note && <div style={{ fontSize: 12, color: C.mut }}>“{f.note}”</div>}
            </div>
            <button type="button" onClick={() => resolve(f)} style={btn(false)}>Dealt with</button>
          </li>
        ))}
      </ul>
    </section>
  )
}
