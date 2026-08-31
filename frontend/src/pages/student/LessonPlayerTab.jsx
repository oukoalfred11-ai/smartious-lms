/**
 * LessonPlayerTab.jsx
 * ============================================================
 * Consolidated lesson player for students.
 * Replaces the old Lesson Player + Resources + My Study Plan +
 * Adaptive Practice modules with one cohesive flow:
 *
 *   View 1 — Subject grid (cards mirror My Curriculum visually)
 *   View 2 — Lessons list for one subject, grouped by term
 *   View 3 — Split-screen player (YouTube embed + PDF.js notes)
 *
 * Mastery is teacher-driven: the student SEES mastery state but
 * doesn't mark it. Progress pies aggregate teacher-marked records.
 *
 * PDF.js: uses react-pdf (added as dep alongside this commit).
 * Set up to disable text selection + right-click + download.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { api } from '../../context/ctx.jsx'
import { imageForSubject, colorForSubject } from '../../utils/subjectImages.js'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// PDF.js worker — load from CDN to avoid Vite worker config
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const BRAND = {
  crimson:   '#7D1025',
  crimsonD:  '#5A0B1B',
  gold:      '#C9A030',
  goldPale:  '#FBF6E3',
  cream:     '#FBFAF5',
  ink:       '#1A1A1A',
  inkMute:   '#6B6B6B',
  line:      '#E8E2D6',
  white:     '#fff',
}

export default function LessonPlayerTab({ user, toast }) {
  // ── DATA ──
  const [subjects, setSubjects]   = useState([])
  const [subjectsLoading, setSubjectsLoading] = useState(true)

  const [selectedSubject, setSelectedSubject] = useState(null)
  const [lessons, setLessons]   = useState([])
  const [teacher, setTeacher]   = useState(null)
  const [lessonsLoading, setLessonsLoading] = useState(false)

  const [selectedLesson, setSelectedLesson] = useState(null)

  // Mastery: keyed map of lessonId → progress record
  const [progressMap, setProgressMap] = useState({})
  const [progressBySubject, setProgressBySubject] = useState({})

  // ── LOADERS ──
  const loadSubjects = useCallback(async () => {
    setSubjectsLoading(true)
    try {
      const { data } = await api.get('/lessons/student/my-subjects')
      if (data?.success) setSubjects(data.data?.subjects || [])
      else toast?.error?.(data?.message || 'Failed to load subjects.')
    } catch (e) {
      console.error('[lesson-player] subjects load failed:', e?.response?.data?.message || e.message)
      toast?.error?.('Could not load your subjects.')
    } finally {
      setSubjectsLoading(false)
    }
  }, [toast])

  const loadProgress = useCallback(async () => {
    try {
      const { data } = await api.get('/lesson-progress/my')
      if (data?.success) {
        setProgressMap(data.data?.byLesson || {})
        setProgressBySubject(data.data?.bySubject || {})
      }
    } catch (e) {
      console.error('[lesson-player] progress load failed:', e.message)
    }
  }, [])

  const loadLessons = useCallback(async (subjectId) => {
    setLessonsLoading(true)
    try {
      const { data } = await api.get('/lessons/student/subject/' + subjectId)
      if (data?.success) {
        setLessons(data.data?.lessons || [])
        setTeacher(data.data?.teacher || null)
      } else {
        toast?.error?.(data?.message || 'Failed to load lessons.')
      }
    } catch (e) {
      console.error('[lesson-player] lessons load failed:', e.message)
      toast?.error?.('Could not load lessons.')
    } finally {
      setLessonsLoading(false)
    }
  }, [toast])

  useEffect(() => { loadSubjects(); loadProgress() }, [loadSubjects, loadProgress])
  useEffect(() => {
    if (selectedSubject) loadLessons(selectedSubject._id)
    else { setLessons([]); setTeacher(null) }
  }, [selectedSubject, loadLessons])

  // ── VIEW 3: LESSON DETAIL ──
  if (selectedLesson) {
    return (
      <LessonDetailView
        lesson={selectedLesson}
        subject={selectedSubject}
        teacher={teacher}
        mastered={!!progressMap[selectedLesson._id]}
        onBack={() => setSelectedLesson(null)}
        // The playlist panel needs the whole subject's lessons, their
        // mastery state, and a way to switch between them without
        // leaving the player.
        lessons={lessons}
        progressMap={progressMap}
        onSelectLesson={setSelectedLesson}
      />
    )
  }

  // ── VIEW 2: LESSONS LIST ──
  if (selectedSubject) {
    const subjCol = colorForSubject(selectedSubject, BRAND.crimson)
    const lessonsByTerm = [1, 2, 3].map(t => ({
      term: t,
      lessons: lessons.filter(l => l.termIndex === t),
    }))
    const subjMasteredCount = progressBySubject[String(selectedSubject._id)] || 0
    const subjPct = lessons.length > 0 ? Math.round((subjMasteredCount / lessons.length) * 100) : 0

    return (
      <div>
        <button onClick={() => { setSelectedSubject(null); setLessons([]) }}
          style={{
            background: 'transparent', border: 'none', color: BRAND.crimson,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            padding: '6px 0', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          All subjects
        </button>

        {/* HEADER */}
        <div className="card" style={{
          padding: 0, marginBottom: 18, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,.08)',
        }}>
          <div style={{ height: 6, background: subjCol }}/>
          <div style={{ padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{
                display: 'inline-block',
                background: subjCol + '15', color: subjCol,
                fontSize: 10, fontWeight: 800, letterSpacing: '.12em',
                padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase',
                marginBottom: 6,
              }}>
                {selectedSubject.curriculum}
              </div>
              <h1 style={{
                fontFamily: "'Instrument Serif',serif", fontSize: 28, fontWeight: 400,
                margin: 0, lineHeight: 1.15, color: BRAND.ink,
              }}>
                {selectedSubject.subjectName}
              </h1>
              {teacher && (
                <div style={{ fontSize: 12.5, color: BRAND.inkMute, marginTop: 4 }}>
                  Taught by {teacher.firstName} {teacher.lastName}
                </div>
              )}
            </div>
            {/* Progress ring */}
            <ProgressRing percentage={subjPct} size={88} color={subjCol} />
            <div style={{ textAlign: 'right', minWidth: 120 }}>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: BRAND.ink }}>
                {subjMasteredCount} / {lessons.length}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: BRAND.inkMute }}>
                Mastered
              </div>
            </div>
          </div>
        </div>

        {/* LESSONS BY TERM */}
        {lessonsLoading ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 13, color: BRAND.inkMute, letterSpacing: '.1em' }}>
              LOADING LESSONS...
            </div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, color: BRAND.ink, marginBottom: 6 }}>
              No lessons yet
            </div>
            <div style={{ fontSize: 13, color: BRAND.inkMute }}>
              Your teacher hasn't published any lessons for this subject yet. Check back soon.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {lessonsByTerm.map(({ term, lessons: termLessons }) => {
              if (termLessons.length === 0) return null
              return (
                <div key={term}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: BRAND.crimson,
                    letterSpacing: '.12em', textTransform: 'uppercase',
                    marginBottom: 8, paddingLeft: 4,
                  }}>
                    Term {term} &middot; {termLessons.length} lesson{termLessons.length === 1 ? '' : 's'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {termLessons.map(l => (
                      <StudentLessonRow
                        key={l._id}
                        lesson={l}
                        mastered={!!progressMap[l._id]}
                        masteredAt={progressMap[l._id]?.masteredAt}
                        onOpen={() => setSelectedLesson(l)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── VIEW 1: SUBJECT GRID ──
  return (
    <div>
      {/* HERO */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: `linear-gradient(135deg, ${BRAND.crimson} 0%, ${BRAND.crimsonD} 100%)`,
        color: BRAND.cream,
        boxShadow: '0 12px 40px rgba(125,16,37,.20)',
      }}>
        <div style={{
          padding: '28px 32px',
          backgroundImage: 'radial-gradient(circle at 95% 50%, rgba(201,160,48,.18) 0%, transparent 50%)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#F0CC5A', marginBottom: 6 }}>
            Your Learning Library
          </div>
          <h1 style={{
            fontFamily: "'Instrument Serif',serif", fontSize: 32, fontWeight: 400,
            margin: 0, lineHeight: 1.1,
          }}>
            {subjects.length > 0
              ? `${subjects.length} subject${subjects.length === 1 ? '' : 's'} ready to study`
              : 'Lesson Player'}
          </h1>
          <div style={{ fontSize: 13, opacity: .85, marginTop: 6 }}>
            Video lessons, notes, and progress tracking — guided by your teachers.
          </div>
        </div>
      </div>

      {/* GRID */}
      {subjectsLoading ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 13, color: BRAND.inkMute, letterSpacing: '.1em' }}>
            LOADING YOUR SUBJECTS...
          </div>
        </div>
      ) : subjects.length === 0 ? (
        <div className="card" style={{ padding: '60px 32px', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: BRAND.goldPale, border: `2px solid ${BRAND.gold}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: BRAND.crimson,
          }}>
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: BRAND.ink, marginBottom: 6 }}>
            No subjects yet
          </div>
          <div style={{ fontSize: 13.5, color: BRAND.inkMute, maxWidth: 420, margin: '0 auto', lineHeight: 1.55 }}>
            You haven't been allocated a teacher for any subject yet. Once an admin allocates you, your subjects and lessons will appear here.
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14,
        }}>
          {subjects.map(s => (
            <StudentSubjectCard
              key={s._id}
              subject={s}
              onOpen={() => setSelectedSubject(s)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// SUBJECT CARD (student-facing)
// ═══════════════════════════════════════════════════════════
function StudentSubjectCard({ subject, onOpen }) {
  const col = colorForSubject(subject, BRAND.crimson)
  const img = imageForSubject(subject)
  const total = subject.lessonCount || 0
  const mastered = subject.masteredCount || 0
  const pct = subject.progressPct || 0

  return (
    <div className="card" style={{
      padding: 0, overflow: 'hidden', cursor: 'pointer',
      transition: 'transform .15s, box-shadow .15s',
    }}
      onClick={onOpen}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <div style={{
        position: 'relative',
        height: 140,
        background: img
          ? `linear-gradient(to bottom, rgba(0,0,0,0) 50%, ${col} 100%), url(${img})`
          : `linear-gradient(135deg, ${col} 0%, ${col}cc 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(255,255,255,.95)',
          color: col,
          fontSize: 9.5, fontWeight: 800, letterSpacing: '.1em',
          padding: '3px 9px', borderRadius: 99, textTransform: 'uppercase',
          backdropFilter: 'blur(4px)',
        }}>
          {subject.curriculum}
        </div>
        {pct > 0 && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
          }}>
            <ProgressRing percentage={pct} size={44} color={BRAND.white} trackColor="rgba(255,255,255,.3)" small/>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 18px 16px' }}>
        <div style={{
          fontFamily: "'Instrument Serif',serif", fontSize: 20, fontWeight: 400,
          color: BRAND.ink, lineHeight: 1.15, marginBottom: 4,
        }}>
          {subject.subjectName}
        </div>
        <div style={{ fontSize: 11.5, color: BRAND.inkMute, marginBottom: 12 }}>
          {subject.teacherName}
        </div>

        <div style={{
          background: BRAND.cream,
          padding: '10px 12px', borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: BRAND.inkMute, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Progress
            </div>
            <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: BRAND.ink }}>
              {mastered}/{total}
            </div>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700,
            color: pct >= 70 ? '#15803D' : pct >= 30 ? BRAND.gold : BRAND.inkMute,
          }}>
            {pct >= 100 ? '✓ Complete' : `${pct}%`}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// LESSON ROW
// ═══════════════════════════════════════════════════════════
function StudentLessonRow({ lesson, mastered, masteredAt, onOpen }) {
  return (
    <div className="card" style={{
      padding: '12px 14px', cursor: 'pointer',
      borderLeft: `4px solid ${mastered ? '#15803D' : BRAND.gold}`,
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      transition: 'transform .15s',
    }}
      onClick={onOpen}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(2px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)' }}
    >
      <div className="mono" style={{
        minWidth: 38, padding: '3px 8px', borderRadius: 4,
        background: BRAND.crimson, color: BRAND.white,
        fontSize: 11, fontWeight: 700, textAlign: 'center',
      }}>
        #{lesson.order}
      </div>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: BRAND.ink, marginBottom: 2 }}>
          {lesson.title}
        </div>
        <div style={{ fontSize: 11.5, color: BRAND.inkMute, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {lesson.videoEmbedId && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              Video
            </span>
          )}
          {lesson.notesPdfUrl && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Notes
            </span>
          )}
          {lesson.durationMins > 0 && <span>{lesson.durationMins} min</span>}
        </div>
      </div>
      {mastered && (
        <div style={{
          background: '#DCFCE7', color: '#15803D',
          fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em',
          padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Mastered
        </div>
      )}
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={BRAND.inkMute} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// LESSON DETAIL — split-screen player
// ═══════════════════════════════════════════════════════════
/**
 * LessonDetailView — the dark "cinema" player.
 *
 * Three columns inside one dark shell:
 *   left   a slim icon rail: Video / Notes / Library / Progress
 *   centre the video, with the lesson title beneath it
 *   right  the playlist for this subject, with thumbnails and durations
 *
 * NOTE ON VIDEO CONTROLS
 * The design shows a custom control bar (play, rewind, volume, cast).
 * Videos are YouTube embeds, and drawing a fake bar over an iframe gives
 * a student buttons that do nothing. YouTube's own controls are used
 * inside the dark frame instead — real controls beat painted ones.
 * A custom bar would need the YouTube IFrame API and is a separate job.
 */
const PLAYER = {
  shell:   '#0F1117',
  panel:   '#151822',
  raised:  '#1B1F2B',
  line:    'rgba(255,255,255,.06)',
  text:    '#F3EFE6',
  mute:    '#9AA0AD',
  accent:  '#C1121F',
  accentD: '#7D1025',
  gold:    '#E4C689',
  goldD:   '#C9973A',
}

// YouTube serves a thumbnail for any video id, so the playlist gets
// artwork without anyone having to upload one.
const thumbFor = (embedId) =>
  embedId ? `https://i.ytimg.com/vi/${embedId}/mqdefault.jpg` : ''

const fmtDur = (mins) => {
  const m = Number(mins) || 0
  if (!m) return ''
  const h = Math.floor(m / 60)
  return h ? `${h}:${String(m % 60).padStart(2, '0')}:00` : `${m}:00`
}

function RailButton({ icon, label, active, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} title={disabled ? `${label} — not available for this lesson` : label}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', padding: '13px 18px',
        background: active ? 'linear-gradient(90deg, rgba(193,18,31,.20), rgba(193,18,31,.04))' : 'transparent',
        border: 'none', borderLeftStyle: 'solid', borderLeftWidth: 3,
        borderLeftColor: active ? PLAYER.gold : 'transparent',
        color: disabled ? 'rgba(154,160,173,.4)' : active ? PLAYER.text : PLAYER.mute,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 13.5, fontWeight: active ? 700 : 600, textAlign: 'left',
        transition: 'background .18s, color .18s',
      }}>
      <span style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: active ? 'linear-gradient(135deg, #8B1A2E, #C9973A)' : 'rgba(255,255,255,.05)',
        color: active ? '#fff' : PLAYER.mute,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: active ? '0 3px 10px rgba(139,26,46,.45)' : 'none',
      }}>{icon}</span>
      <span className="lp-rail-label">{label}</span>
    </button>
  )
}

function LessonDetailView({ lesson, subject, teacher, mastered, onBack, lessons = [], progressMap = {}, onSelectLesson }) {
  const [pane, setPane] = useState('video')
  const hasVideo = !!lesson.videoEmbedId
  const hasNotes = !!lesson.notesPdfUrl
  const playlist = (lessons && lessons.length) ? lessons : [lesson]

  useEffect(() => { setPane(hasVideo ? 'video' : hasNotes ? 'notes' : 'progress') },
    [lesson._id, hasVideo, hasNotes])

  const I = {
    video:    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/></svg>,
    notes:    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>,
    library:  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    progress: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="20" x2="6" y2="14"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="10"/></svg>,
  }

  const doneCount = playlist.filter(l => progressMap[l._id]).length

  return (
    <div>
      <style>{`
        @media (max-width: 900px) {
          .lp-shell { grid-template-columns: 1fr !important; }
          .lp-rail  { flex-direction: row !important; overflow-x: auto; }
          .lp-rail-label { display: none; }
          .lp-list  { max-height: 320px; }
        }
      `}</style>

      <button onClick={onBack}
        style={{
          background: 'transparent', border: 'none', color: BRAND.crimson,
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
          padding: '6px 0', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to lessons
      </button>

      <div className="lp-shell" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(170px, 200px) minmax(0, 1fr) minmax(240px, 320px)',
        background: PLAYER.shell,
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 24px 70px rgba(8,10,20,.5)', border: '1px solid rgba(228,198,137,.12)',
        minHeight: 520,
      }}>

        {/* ── LEFT RAIL ─────────────────────────────────────── */}
        <div className="lp-rail" style={{
          background: PLAYER.panel, borderRight: `1px solid ${PLAYER.line}`,
          display: 'flex', flexDirection: 'column', paddingTop: 4,
        }}>
          <div style={{ padding: '20px 18px 18px', borderBottom: `1px solid ${PLAYER.line}` }}>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 19, color: PLAYER.text, lineHeight: 1 }}>
              Smartious
            </div>
            <div style={{ fontSize: 9.5, letterSpacing: '.22em', color: PLAYER.gold, fontWeight: 700, marginTop: 3 }}>
              eSCHOOL
            </div>
          </div>
          <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column' }}>
            <RailButton icon={I.video}    label="Video"    active={pane==='video'}    disabled={!hasVideo} onClick={() => setPane('video')} />
            <RailButton icon={I.notes}    label="Notes"    active={pane==='notes'}    disabled={!hasNotes} onClick={() => setPane('notes')} />
            <RailButton icon={I.library}  label="Library"  active={pane==='library'}  onClick={() => setPane('library')} />
            <RailButton icon={I.progress} label="Progress" active={pane==='progress'} onClick={() => setPane('progress')} />
          </div>
        </div>

        {/* ── CENTRE STAGE ──────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ background: pane === 'notes' ? '#525659' : '#000', position: 'relative', ...(pane === 'notes' ? { height: 620, display: 'flex' } : { aspectRatio: '16 / 9' }), width: '100%' }}>
            {pane === 'video' && hasVideo && (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${lesson.videoEmbedId}?rel=0&modestbranding=1`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              />
            )}

            {pane === 'notes' && hasNotes && (
              <NotesPdfViewer url={lesson.notesPdfUrl} />
            )}
            {pane === 'notes' && !hasNotes && (
              <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PLAYER.mute, fontSize: 13 }}>
                No notes for this lesson yet.
              </div>
            )}
            {pane === 'library' && (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column', gap: 10, color: PLAYER.mute, padding: 30, textAlign: 'center' }}>
                <span style={{ color: PLAYER.accent }}>{I.library}</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: PLAYER.text }}>Subject library</div>
                <div style={{ fontSize: 12.5, maxWidth: 340, lineHeight: 1.6 }}>
                  Coursebooks and reading for {subject.subjectName} live in the Library tab.
                </div>
              </div>
            )}
            {pane === 'progress' && (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column', gap: 14, color: PLAYER.mute, padding: 30 }}>
                <ProgressRing percentage={playlist.length ? Math.round((doneCount / playlist.length) * 100) : 0}
                  size={92} color={PLAYER.accent} trackColor="rgba(255,255,255,.10)" />
                <div style={{ fontSize: 13.5, color: PLAYER.text, fontWeight: 700 }}>
                  {doneCount} of {playlist.length} lessons mastered
                </div>
                <div style={{ fontSize: 12, textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
                  A lesson counts as mastered once you pass its practice questions.
                </div>
              </div>
            )}
            {(pane === 'video' && !hasVideo) && (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: PLAYER.mute, fontSize: 13 }}>
                No video for this lesson yet.
              </div>
            )}
          </div>

          <div style={{ padding: '18px 24px', borderTop: `1px solid ${PLAYER.line}` }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                          color: PLAYER.mute, marginBottom: 5 }}>
              {subject.subjectName} &middot; Term {lesson.termIndex} &middot; Lesson {lesson.order}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400,
                           margin: 0, lineHeight: 1.2, color: PLAYER.text, flex: 1, minWidth: 220 }}>
                {lesson.title}
              </h1>
              {mastered && (
                <span style={{
                  background: 'rgba(34,197,94,.15)', color: '#4ADE80',
                  fontSize: 10, fontWeight: 800, letterSpacing: '.08em',
                  padding: '5px 12px', borderRadius: 99, textTransform: 'uppercase',
                }}>Mastered</span>
              )}
            </div>
            {lesson.description && (
              <div style={{ fontSize: 13, color: PLAYER.mute, marginTop: 8, lineHeight: 1.6, maxWidth: 640 }}>
                {lesson.description}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PLAYLIST ────────────────────────────────── */}
        <div style={{ background: PLAYER.panel, borderLeft: `1px solid ${PLAYER.line}`, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${PLAYER.line}` }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: PLAYER.text, lineHeight: 1.3 }}>
              {subject.subjectName}
            </div>
            <div style={{ fontSize: 12, color: PLAYER.mute, marginTop: 3 }}>
              {playlist.length} lesson{playlist.length === 1 ? '' : 's'}
              {doneCount > 0 && <> &middot; {doneCount} mastered</>}
            </div>
          </div>

          <div className="lp-list" style={{ overflowY: 'auto', flex: 1, maxHeight: 560 }}>
            {playlist.map((l, i) => {
              const active = String(l._id) === String(lesson._id)
              const done = !!progressMap[l._id]
              const thumb = thumbFor(l.videoEmbedId)
              return (
                <div key={l._id}
                  onClick={() => { if (!active && onSelectLesson) onSelectLesson(l) }}
                  style={{
                    display: 'flex', gap: 11, padding: '11px 16px',
                    background: active ? 'linear-gradient(90deg, rgba(193,18,31,.22), rgba(193,18,31,.05))' : 'transparent',
                    borderLeft: `3px solid ${active ? PLAYER.gold : 'transparent'}`,
                    cursor: active ? 'default' : 'pointer',
                    alignItems: 'flex-start',
                    transition: 'background .18s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.04)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                  <div style={{
                    width: 62, height: 38, borderRadius: 5, flexShrink: 0, overflow: 'hidden',
                    background: PLAYER.raised, position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {thumb
                      ? <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.currentTarget.style.display = 'none' }} />
                      : <span style={{ color: PLAYER.mute, fontSize: 15 }}>{I.notes}</span>}
                    {active && (
                      <span style={{
                        position: 'absolute', inset: 0, background: 'rgba(139,26,46,.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: PLAYER.gold,
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12.5, fontWeight: active ? 700 : 500,
                      color: active ? '#fff' : PLAYER.text, lineHeight: 1.35,
                    }}>
                      {i + 1}. {l.title}
                    </div>
                    <div style={{ fontSize: 11, color: PLAYER.mute, marginTop: 3, display: 'flex', gap: 7, alignItems: 'center' }}>
                      {fmtDur(l.durationMins) && <span>{fmtDur(l.durationMins)}</span>}
                      {done && <span style={{ color: '#4ADE80', fontWeight: 700 }}>&#10003;</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// PDF VIEWER — react-pdf with download/right-click disabled
// ═══════════════════════════════════════════════════════════
function NotesPdfViewer({ url }) {
  const [numPages, setNumPages] = useState(0)
  const [pageNum, setPageNum]   = useState(1)
  const [pdfWidth, setPdfWidth] = useState(0)
  const [loadError, setLoadError] = useState(null)
  const containerRef = useMemo(() => ({ current: null }), [])

  // Track container width for responsive PDF page width
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setPdfWidth(Math.min(containerRef.current.offsetWidth - 24, 900))
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [containerRef])

  const onLoad = ({ numPages: n }) => { setNumPages(n); setPageNum(1) }
  const onLoadError = (err) => { setLoadError(err?.message || 'Failed to load PDF'); }

  return (
    <div
      ref={(el) => { containerRef.current = el; if (el) setPdfWidth(Math.min(el.offsetWidth - 24, 900)) }}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        flex: 1,
        background: '#525659',
        overflow: 'auto',
        padding: 12,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        minHeight: 400,
        position: 'relative',
      }}
    >
      {loadError ? (
        <div style={{
          color: BRAND.cream, textAlign: 'center', padding: 40, fontSize: 13,
        }}>
          Could not load notes: {loadError}
        </div>
      ) : (
        <>
          <Document
            file={url}
            onLoadSuccess={onLoad}
            onLoadError={onLoadError}
            loading={
              <div style={{ color: BRAND.cream, textAlign: 'center', padding: 40, fontSize: 13 }}>
                Loading notes...
              </div>
            }
          >
            {pdfWidth > 0 && (
              <Page
                pageNumber={pageNum}
                width={pdfWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            )}
          </Document>

          {/* Page navigator */}
          {numPages > 0 && (
            <div style={{
              position: 'sticky', bottom: 0,
              marginTop: 8,
              background: 'rgba(0,0,0,.7)', color: BRAND.cream,
              padding: '6px 10px', borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontSize: 12, fontWeight: 600,
              maxWidth: 220, margin: '8px auto 0',
            }}>
              <button
                onClick={() => setPageNum(p => Math.max(1, p - 1))}
                disabled={pageNum <= 1}
                style={{
                  background: 'transparent', border: 'none', color: BRAND.cream,
                  cursor: pageNum <= 1 ? 'not-allowed' : 'pointer',
                  opacity: pageNum <= 1 ? .4 : 1,
                  padding: 4,
                }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <span>{pageNum} / {numPages}</span>
              <button
                onClick={() => setPageNum(p => Math.min(numPages, p + 1))}
                disabled={pageNum >= numPages}
                style={{
                  background: 'transparent', border: 'none', color: BRAND.cream,
                  cursor: pageNum >= numPages ? 'not-allowed' : 'pointer',
                  opacity: pageNum >= numPages ? .4 : 1,
                  padding: 4,
                }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// PROGRESS RING (small reusable)
// ═══════════════════════════════════════════════════════════
function ProgressRing({ percentage = 0, size = 60, color = BRAND.crimson, trackColor = BRAND.line, small = false }) {
  const target = Math.max(0, Math.min(100, percentage))
  const [shown, setShown] = useState(0)

  useEffect(() => {
    let raf
    const start = Date.now()
    const dur = 800
    const animate = () => {
      const t = Math.min(1, (Date.now() - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [target])

  const stroke = small ? 4 : 7
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const offset = circ - (shown / 100) * circ

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius}
          fill="transparent" stroke={trackColor} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={radius}
          fill="transparent" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 100ms linear' }}/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: small ? 10 : 14,
        fontWeight: 800,
        fontFamily: 'JetBrains Mono, monospace',
        color,
      }}>
        {shown}%
      </div>
    </div>
  )
}
