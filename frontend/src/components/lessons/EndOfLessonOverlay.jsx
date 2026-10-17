/**
 * EndOfLessonOverlay.jsx — the full-screen pop-up a teacher sees after
 * leaving the classroom (/teacher?ended=<liveClassId>).
 *
 * One screen, three steps, one button:
 *   1. How did the lesson go?   taught (all / part) · student absent · not held
 *   2. Homework                 the exact questions that will be sent
 *   3. Next lesson              what the next class with these students teaches
 *
 * "Finish" saves the next lesson, then closes the lesson (which sends the
 * homework). "Do this later" leaves it in Lessons to close.
 */
import { useEffect, useState } from 'react'
import { api } from '../../context/ctx.jsx'
import HomeworkEditor from './HomeworkEditor.jsx'
import { ExtraLessonForm } from './LessonControl.jsx'

const C = { crimson: '#7D1025', gold: '#C9973A', line: '#E5DFD3', ink: '#1F2937', mut: '#6B7280', bg: '#FBF8F3', green: '#15803D', amber: '#B45309', red: '#B91C1C' }
const btn = (primary, extra) => ({ border: primary ? 'none' : `1px solid ${C.line}`, background: primary ? C.crimson : '#fff', color: primary ? '#fff' : C.ink, borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 800, cursor: 'pointer', ...extra })
const field = { width: '100%', boxSizing: 'border-box', border: `1px solid ${C.line}`, borderRadius: 8, padding: '9px 10px', fontSize: 13.5, fontFamily: 'inherit', color: C.ink, background: '#fff' }
const fmt = (d) => new Date(d).toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function Step({ n, title, children, muted }) {
  return (
    <section style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14, padding: '16px 18px', opacity: muted ? 0.55 : 1 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <span style={{ width: 26, height: 26, borderRadius: '50%', background: C.crimson, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 }}>{n}</span>
        <h3 style={{ margin: 0, fontSize: 16, color: C.ink }}>{title}</h3>
      </div>
      {children}
    </section>
  )
}

export default function EndOfLessonOverlay({ classId, toast, onClose }) {
  const [info, setInfo] = useState(null)
  const [err, setErr] = useState('')
  const [outcome, setOutcome] = useState('taught')
  const [coverage, setCoverage] = useState('full')
  const [reason, setReason] = useState('')
  const [nextPick, setNextPick] = useState('')
  const [busy, setBusy] = useState(false)
  const [makeUp, setMakeUp] = useState(false)

  useEffect(() => {
    api.get(`/liveclasses/${classId}/next`).then(r => {
      const d = r.data?.data
      setInfo(d)
      if (d?.next?.current) setNextPick(d.next.current)
    }).catch(e => setErr(e?.response?.data?.message || 'Could not load this lesson.'))
  }, [classId])

  // A lesson that ran out of time continues next lesson.
  useEffect(() => {
    if (!info?.today) return
    if (coverage === 'partial' && outcome === 'taught') setNextPick(info.today.value)
    else if (nextPick === info.today.value) setNextPick(info.next?.current || '')
  }, [coverage, outcome]) // eslint-disable-line react-hooks/exhaustive-deps

  // Esc = do this later.
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const closed = !!info?.lesson?.outcome
  const started = info && new Date(info.lesson.scheduledAt) <= new Date()

  const finish = async () => {
    setBusy(true)
    try {
      // 1. The next lesson first, so it is set even if closing fails.
      if (info.next && nextPick && nextPick !== info.next.current) {
        const opt = [info.today, ...info.options].find(o => o && o.value === nextPick)
        if (opt) await api.patch(`/liveclasses/${info.next._id}/lesson`, opt.lessonId ? { lessonId: opt.lessonId } : { topicName: opt.topicName, subtopicName: opt.subtopicName })
      }
      // 2. Close the lesson (taught sends the homework shown above).
      if (!closed && started) {
        await api.post(`/liveclasses/${classId}/close`, { outcome, coverage, reason, topic: info.lesson.topicName || '', subtopic: info.lesson.subtopicName || '' })
      }
      toast?.ok?.(closed || !started ? 'Saved.' : outcome === 'taught' ? 'Lesson closed. Homework is on its way to the students.' : outcome === 'not_held' ? 'Recorded. The family has been told.' : 'Lesson closed.')
      if (!closed && started && outcome === 'not_held') { setMakeUp(true); return }
      onClose(true)
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Could not save.') }
    finally { setBusy(false) }
  }

  const choice = (v, label, hint) => (
    <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', border: `1.5px solid ${outcome === v ? C.crimson : C.line}`, borderRadius: 10, cursor: 'pointer', background: outcome === v ? '#FFF6F7' : '#fff', flex: '1 1 180px' }}>
      <input type="radio" name="eol-outcome" checked={outcome === v} onChange={() => setOutcome(v)} style={{ marginTop: 3 }} />
      <span><b style={{ fontSize: 14 }}>{label}</b><br /><span style={{ fontSize: 12, color: C.mut }}>{hint}</span></span>
    </label>
  )

  return (
    <div role="dialog" aria-modal="true" aria-label="End of lesson" style={{ position: 'fixed', inset: 0, zIndex: 2000, background: C.bg, overflowY: 'auto', fontFamily: 'Inter,-apple-system,sans-serif' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '22px 16px 60px', display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.12em', color: C.gold, textTransform: 'uppercase' }}>Lesson finished</div>
            <h2 style={{ margin: '2px 0 0', fontSize: 24, color: C.ink, fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}>
              {info ? `${info.lesson.subject}${info.lesson.label ? ' — ' + info.lesson.label : ''}` : 'Loading…'}
            </h2>
            {info && <div style={{ fontSize: 13, color: C.mut, marginTop: 3 }}>{fmt(info.lesson.scheduledAt)} · {(info.lesson.students || []).map(s => s.name).join(', ') || 'no students'}</div>}
          </div>
          <button type="button" style={btn(false, { padding: '8px 14px', fontSize: 13 })} onClick={() => onClose()}>Do this later</button>
        </div>

        {err && <div style={{ color: C.red, fontSize: 14 }}>{err}</div>}

        {info && makeUp && (
          <Step n="✓" title="Book a make-up lesson?">
            <p style={{ fontSize: 13, color: C.mut, margin: '0 0 8px' }}>The family is emailed the new time.</p>
            <ExtraLessonForm toast={toast} makeUpFor={{ _id: classId, subject: info.lesson.subject, assignedStudents: (info.lesson.students || []).map(s => ({ _id: s._id, firstName: s.name })) }}
              onDone={() => onClose(true)} onCancel={() => onClose(true)} />
          </Step>
        )}

        {info && !makeUp && (<>
          <Step n="1" title="How did the lesson go?">
            {closed ? (
              <div style={{ fontSize: 13.5, color: C.green }}>Already closed as <b>{info.lesson.outcome.replace('_', ' ')}</b>.</div>
            ) : !started ? (
              <div style={{ fontSize: 13.5, color: C.amber }}>This lesson has not started yet, so it cannot be closed. You can still check the homework and the next lesson.</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {choice('taught', 'Taught', 'Sends the homework below')}
                  {choice('student_absent', 'Student absent', 'The student did not come')}
                  {choice('not_held', 'Not held', 'It did not take place; the family is told')}
                </div>
                {outcome === 'taught' && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[['full', 'We finished the topic'], ['partial', 'We ran out of time — continue next lesson']].map(([v, l]) => (
                      <label key={v} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, padding: '6px 10px', border: `1px solid ${coverage === v ? C.crimson : C.line}`, borderRadius: 99, cursor: 'pointer', background: '#fff' }}>
                        <input type="radio" name="eol-cov" checked={coverage === v} onChange={() => setCoverage(v)} />{l}
                      </label>
                    ))}
                  </div>
                )}
                {outcome === 'not_held' && (
                  <label style={{ fontSize: 12.5, color: C.mut }}>Why did it not take place? (sent to the family)
                    <input style={field} value={reason} onChange={e => setReason(e.target.value)} maxLength={300} placeholder="e.g. Teacher unwell; power outage" />
                  </label>
                )}
              </div>
            )}
          </Step>

          <Step n="2" title="Homework for this lesson" muted={!closed && outcome !== 'taught'}>
            {!closed && outcome !== 'taught'
              ? <div style={{ fontSize: 13, color: C.mut }}>Homework is only sent for a lesson that was taught.</div>
              : <HomeworkEditor classId={classId} toast={toast} />}
          </Step>

          <Step n="3" title="Next lesson">
            {info.toRecover > 0 && (
              <div style={{ fontSize: 13, color: C.amber, background: '#FEF3C7', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
                <b>{info.toRecover} session{info.toRecover > 1 ? 's' : ''} missed while you were on leave</b> with {info.lesson.students.length > 1 ? 'these students' : 'this student'}. The family was told you would agree the make-up time{info.toRecover > 1 ? 's' : ''} in this class — book {info.toRecover > 1 ? 'them' : 'it'} under My Classes → This week.
              </div>
            )}
            {!info.next ? (
              <div style={{ fontSize: 13, color: C.mut }}>There is no next lesson with these students on the calendar yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontSize: 13, color: C.ink }}><b>{fmt(info.next.scheduledAt)}</b></div>
                <label style={{ fontSize: 12.5, color: C.mut }}>What will you teach?
                  <select style={field} value={nextPick} onChange={e => setNextPick(e.target.value)}>
                    {!info.next.current && <option value="">Not chosen yet</option>}
                    {info.today && <option value={info.today.value}>Continue today: {info.today.label}</option>}
                    {info.options.map(o => <option key={o.value} value={o.value}>{o.label}{o.value === info.next.current ? ' (planned)' : ''}</option>)}
                  </select>
                </label>
                {!info.options.length && !info.today && <div style={{ fontSize: 12, color: C.mut }}>This class has no lesson plan to choose from.</div>}
              </div>
            )}
          </Step>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button type="button" style={btn(false)} onClick={() => onClose()}>Do this later</button>
            <button type="button" style={btn(true)} disabled={busy || (!closed && started && outcome === 'not_held' && !reason.trim())} onClick={finish}>
              {busy ? 'Saving…' : closed || !started ? 'Save' : 'Finish lesson'}
            </button>
          </div>
        </>)}
      </div>
    </div>
  )
}
