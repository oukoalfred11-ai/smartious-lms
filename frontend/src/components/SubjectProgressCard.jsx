/**
 * SubjectProgressCard.jsx
 * ============================================================
 * Compact progress widget showing % of syllabus covered for a
 * student in a given subject. Drop into any subject card in the
 * Student Portal.
 *
 * Props (two ways to identify the subject):
 *   studentId    (string)  — required. The student whose progress to show.
 *   api          (axios)   — required. Project's pre-configured axios instance.
 *
 *   EITHER:
 *     subjectId    (string)  — the DB Subject._id (when you have it directly)
 *   OR:
 *     subjectName  (string)  — the subject name as stored in user.subjects
 *     curriculum   (string)  — the student's curriculum (used to resolve _id)
 *
 *   compact      (boolean) — optional. Tighter layout for small spaces.
 *
 * Behaviour:
 *   - If subjectId is provided, uses it directly
 *   - Otherwise resolves subjectName + curriculum -> real Subject._id via
 *     GET /api/subjects?curriculum=X (cached per curriculum on first call)
 *   - Fetches summary: GET /api/syllabus-progress/student/:s/subject/:sub/summary
 *   - Handles loading / empty / error states gracefully
 *   - Re-fetches when any identifying prop changes
 *
 * Visual conventions:
 *   - Crimson #7D1025 = remaining (work to do)
 *   - Gold #C9A030    = done (progress)
 *   - No emoji, no glyph
 */

import React, { useEffect, useState } from 'react'

const TOKENS = {
  crimson: '#7D1025',
  gold:    '#C9A030',
  cream:   '#FBFAF5',
  ink:     '#1A1A1A',
  s500:    '#6B6B6B',
  s300:    '#9A9A9A',
  s100:    '#E8E2D6',
  goldBg:  '#FDF7E2',
  goldInk: '#7D5A0F',
}

export default function SubjectProgressCard({
  studentId,
  subjectId: subjectIdProp,
  subjectName,
  curriculum,
  api,
  compact = false,
}) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [resolvedSubjectId, setResolvedSubjectId] = useState(subjectIdProp || null)
  const [plan, setPlan] = useState(null)
  const [planOpen, setPlanOpen] = useState(true)   // complete list by default
  useEffect(() => {
    if (!api || !resolvedSubjectId) return
    let on = true
    api.get('/curriculum/progress/subject', { params: { subjectId: resolvedSubjectId } })
      .then(r => { if (on && r.data?.data) setPlan(r.data.data) })
      .catch(() => {})
    return () => { on = false }
  }, [api, resolvedSubjectId])

  // ── If we don't have a direct subjectId, resolve it from name + curriculum ──
  useEffect(() => {
    if (subjectIdProp) {
      setResolvedSubjectId(subjectIdProp)
      return
    }
    if (!subjectName || !curriculum) {
      setResolvedSubjectId(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/subjects', { params: { curriculum } })
        if (cancelled) return
        const list = data?.subjects || []
        const norm = (s) => String(s || '').trim().toLowerCase()
        const want = norm(subjectName)
        let match = list.find(s => norm(s.subjectName) === want)
        if (!match) {
          match = list.find(s => {
            const have = norm(s.subjectName)
            return have && want && (have.includes(want) || want.includes(have))
          })
        }
        setResolvedSubjectId(match?._id || null)
      } catch (e) {
        if (!cancelled) setResolvedSubjectId(null)
      }
    })()
    return () => { cancelled = true }
  }, [subjectIdProp, subjectName, curriculum, api])

  useEffect(() => {
    if (!studentId || !resolvedSubjectId) {
      setState({ status: 'idle', data: null, error: null })
      return
    }
    let cancelled = false
    setState({ status: 'loading', data: null, error: null })
    ;(async () => {
      try {
        const { data } = await api.get(
          `/syllabus-progress/student/${studentId}/subject/${resolvedSubjectId}/summary`
        )
        if (cancelled) return
        const summary = data?.data || null
        if (!summary) {
          setState({ status: 'error', data: null, error: 'No summary returned.' })
          return
        }
        setState({ status: 'ok', data: summary, error: null })
      } catch (e) {
        if (cancelled) return
        setState({
          status: 'error',
          data: null,
          error: e?.response?.data?.message || e.message || 'Failed to load progress.',
        })
      }
    })()
    return () => { cancelled = true }
  }, [studentId, resolvedSubjectId, api])

  const pad = compact ? '8px 10px' : '10px 14px'
  const titleSize = compact ? 10 : 11
  const percentSize = compact ? 18 : 24
  const labelSize = compact ? 10.5 : 11.5

  // ── LOADING ──
  if (state.status === 'loading') {
    return (
      <div style={{
        background: TOKENS.cream, border: '1px solid ' + TOKENS.s100,
        borderRadius: 8, padding: pad,
      }}>
        <div style={{
          fontSize: titleSize, fontWeight: 700,
          color: TOKENS.s500, letterSpacing: '.08em',
          textTransform: 'uppercase', marginBottom: 6,
        }}>Syllabus progress</div>
        <div style={{ fontSize: 12, color: TOKENS.s300, fontStyle: 'italic' }}>
          Loading...
        </div>
      </div>
    )
  }

  // ── ERROR ──
  if (state.status === 'error') {
    return (
      <div style={{
        background: TOKENS.cream, border: '1px solid ' + TOKENS.s100,
        borderRadius: 8, padding: pad,
      }}>
        <div style={{
          fontSize: titleSize, fontWeight: 700,
          color: TOKENS.s500, letterSpacing: '.08em',
          textTransform: 'uppercase', marginBottom: 6,
        }}>Syllabus progress</div>
        <div style={{ fontSize: 11.5, color: TOKENS.crimson }}>
          {state.error}
        </div>
      </div>
    )
  }

  // ── IDLE (waiting for required props or resolved id) ──
  if (state.status === 'idle' || !state.data) {
    // If we should have had a subjectId by now but resolution failed,
    // show a graceful empty state instead of an endless loading skeleton.
    if (studentId && (subjectIdProp === undefined && subjectName && curriculum) && resolvedSubjectId === null && state.status === 'idle') {
      return (
        <div style={{
          background: TOKENS.cream, border: '1px solid ' + TOKENS.s100,
          borderRadius: 8, padding: pad,
        }}>
          <div style={{
            fontSize: titleSize, fontWeight: 700,
            color: TOKENS.s500, letterSpacing: '.08em',
            textTransform: 'uppercase', marginBottom: 6,
          }}>Syllabus progress</div>
          <div style={{ fontSize: 11.5, color: TOKENS.s500, fontStyle: 'italic' }}>
            This subject is not yet set up in the catalog.
          </div>
        </div>
      )
    }
    return null
  }

  const { totalSubtopics, doneCount, percent, remainingCount } = state.data

  // ── EMPTY (no spine loaded for this subject) ──
  if (totalSubtopics === 0 || percent === null) {
    return (
      <div style={{
        background: TOKENS.cream, border: '1px solid ' + TOKENS.s100,
        borderRadius: 8, padding: pad,
      }}>
        <div style={{
          fontSize: titleSize, fontWeight: 700,
          color: TOKENS.s500, letterSpacing: '.08em',
          textTransform: 'uppercase', marginBottom: 6,
        }}>Syllabus progress</div>
        <div style={{ fontSize: 11.5, color: TOKENS.s500, fontStyle: 'italic' }}>
          Syllabus not yet loaded for this subject.
        </div>
      </div>
    )
  }

  // ── OK ──
  const remainingPct = Math.max(0, 100 - percent)

  // Timetable-linked subjects get the upgraded progress: donut + dated
  // lesson plan, in the same spot the subtopics strip occupied. The
  // legacy strip below remains the fallback for unlinked subjects.
  if (plan) {
    const GOLD = '#C9973A', CRIM = '#7D1025', TRACK = '#F1EAD9', MUT = '#8A8378'
    const R = 26, C = 2 * Math.PI * R
    const aF = plan.counts.total ? plan.counts.attended / plan.counts.total : 0
    const mF = plan.counts.total ? plan.counts.missed / plan.counts.total : 0
    const pct = plan.counts.total ? Math.round(plan.counts.covered / plan.counts.total * 100) : 0
    const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    const nextIdx = plan.plan.findIndex(l => l.status === 'scheduled' || l.status === 'projected')
    const visible = planOpen ? plan.plan : plan.plan.slice(Math.max(0, (nextIdx === -1 ? plan.plan.length : nextIdx) - 2), (nextIdx === -1 ? plan.plan.length : nextIdx) + 4)
    const mark = (st) => st === 'attended'
      ? <span style={{ width: 15, height: 15, borderRadius: '50%', background: GOLD, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, flexShrink: 0 }}>{'\u2713'}</span>
      : st === 'missed'
        ? <span style={{ width: 15, height: 15, borderRadius: '50%', background: CRIM, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, flexShrink: 0 }}>{'\u2713'}</span>
        : st === 'scheduled'
          ? <span style={{ width: 15, height: 15, borderRadius: '50%', border: `2px solid ${CRIM}`, display: 'inline-block', flexShrink: 0 }} />
          : <span style={{ width: 15, height: 15, borderRadius: '50%', border: `2px dashed ${TRACK}`, display: 'inline-block', flexShrink: 0 }} />
    return (
      <div style={{ background: TOKENS.cream, border: '1px solid ' + TOKENS.s100, borderRadius: 8, padding: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <svg width="66" height="66" viewBox="0 0 66 66">
            <circle cx="33" cy="33" r={R} fill="none" stroke={TRACK} strokeWidth="8" />
            <circle cx="33" cy="33" r={R} fill="none" stroke={GOLD} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${aF * C} ${C}`} transform="rotate(-90 33 33)" />
            <circle cx="33" cy="33" r={R} fill="none" stroke={CRIM} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${mF * C} ${C}`} strokeDashoffset={-(aF * C)} transform="rotate(-90 33 33)" />
            <text x="33" y="37" textAnchor="middle" style={{ font: '800 13px Montserrat, Arial', fill: CRIM }}>{pct}%</text>
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: MUT, textTransform: 'uppercase' }}>Lesson plan progress</div>
            <div style={{ fontSize: 11.5, color: '#231715', marginTop: 3 }}>
              <b style={{ color: GOLD }}>{plan.counts.attended}</b> attended {'\u00b7'} <b style={{ color: CRIM }}>{plan.counts.missed}</b> to catch up {'\u00b7'} <b>{plan.counts.total - plan.counts.covered}</b> ahead
            </div>
            <div style={{ fontSize: 10, color: MUT, marginTop: 2 }}>every {plan.slot}{plan.teacher ? ' \u00b7 ' + plan.teacher : ''}</div>
          </div>
        </div>
        <div style={{ marginTop: 8, display: 'grid', gap: 4, maxHeight: planOpen ? 340 : undefined, overflow: planOpen ? 'auto' : undefined, paddingRight: 4 }}>
          {visible.map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 7, background: l.status === 'scheduled' ? '#FBF3F5' : 'transparent', opacity: l.status === 'projected' ? 0.8 : 1 }}>
              {mark(l.status)}
              <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#231715', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</span>
              <span style={{ fontSize: 9.5, fontWeight: 800, whiteSpace: 'nowrap', color: l.status === 'attended' ? GOLD : l.status === 'projected' ? MUT : CRIM }}>{l.status === 'projected' ? '~' + fmt(l.date) : fmt(l.date)}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setPlanOpen(o => !o)}
          style={{ marginTop: 6, padding: '4px 12px', borderRadius: 7, border: `1px solid ${TRACK}`, background: '#fff', color: CRIM, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>
          {planOpen ? 'Focus around today' : `Show all ${plan.plan.length} lessons`}
        </button>
      </div>
    )
  }

  return (
    <div style={{
      background: TOKENS.cream, border: '1px solid ' + TOKENS.s100,
      borderRadius: 8, padding: pad,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 8,
      }}>
        <div style={{
          fontSize: titleSize, fontWeight: 700,
          color: TOKENS.s500, letterSpacing: '.08em',
          textTransform: 'uppercase',
        }}>Syllabus progress</div>
        <div style={{ fontSize: percentSize, fontWeight: 800, color: TOKENS.gold, lineHeight: 1 }}>
          {percent}%
        </div>
      </div>

      {/* Progress bar — gold fill on cream/grey track */}
      <div style={{
        height: 8, borderRadius: 999,
        background: TOKENS.s100, overflow: 'hidden',
        marginBottom: 8,
      }}>
        <div style={{
          width: percent + '%', height: '100%',
          background: TOKENS.gold,
          transition: 'width 300ms ease',
        }} />
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontSize: labelSize, color: TOKENS.s500,
      }}>
        <span>
          <strong style={{ color: TOKENS.ink }}>{doneCount}</strong>
          {' of '}
          <strong style={{ color: TOKENS.ink }}>{totalSubtopics}</strong>
          {' subtopics covered'}
        </span>
        <span style={{ color: TOKENS.crimson, fontWeight: 700 }}>
          {remainingCount} remaining
        </span>
      </div>
    </div>
  )
}
