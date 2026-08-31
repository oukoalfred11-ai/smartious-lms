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

export default function LessonPlayerTab({ user, toast, setPage }) {
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
        onOpenLibrary={() => setPage && setPage('library')}
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

function LessonDetailView({ lesson, subject, teacher, mastered, onBack, lessons = [], progressMap = {}, onSelectLesson, onOpenLibrary }) {
  const [pane, setPane] = useState('video')
  const [listOpen, setListOpen] = useState(false)   // mobile lesson drawer

  const playlist = (lessons && lessons.length) ? lessons : [lesson]

  // Merge the legacy single video with the videos[] array, de-duplicated.
  const videoList = useMemo(() => {
    const out = []
    const seen = new Set()
    if (lesson.videoEmbedId) {
      out.push({ source: 'youtube', embedId: lesson.videoEmbedId, title: 'Lesson video' })
      seen.add('yt:' + lesson.videoEmbedId)
    }
    for (const v of (lesson.videos || [])) {
      const key = v.source === 'recording' ? 'r2:' + (v.r2Url || v.r2Key) : 'yt:' + v.embedId
      if (seen.has(key)) continue
      seen.add(key)
      out.push(v)
    }
    return out
  }, [lesson._id, lesson.videoEmbedId, lesson.videos])

  const [activeVideoIdx, setActiveVideoIdx] = useState(0)
  useEffect(() => { setActiveVideoIdx(0) }, [lesson._id])
  const activeVideo = videoList[activeVideoIdx] || null

  const hasVideo = videoList.length > 0
  const hasNotes = !!lesson.notesPdfUrl

  useEffect(() => {
    setPane(hasVideo ? 'video' : hasNotes ? 'notes' : 'progress')
  }, [lesson._id, hasVideo, hasNotes])

  const doneCount = playlist.filter(l => progressMap[l._id]).length
  const pct = playlist.length ? Math.round((doneCount / playlist.length) * 100) : 0
  const lessonIndex = playlist.findIndex(l => String(l._id) === String(lesson._id))

  // SVG icons
  const Ico = {
    play:     <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>,
    notes:    <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>,
    library:  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    progress: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 12A10 10 0 1 1 12 2"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    back:     <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    check:    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    list:     <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    clock:    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    dot:      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12"/></svg>,
    close:    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  }

  const G = PLAYER.gold, GD = PLAYER.goldD, CR = PLAYER.accent

  // A tab in the top segmented control
  const Tab = ({ id, icon, label, disabled, onClick }) => {
    const on = pane === id
    return (
      <button
        onClick={onClick || (() => !disabled && setPane(id))}
        disabled={disabled}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
          borderRadius: 10, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          background: on ? 'linear-gradient(120deg, #8B1A2E, #A32438)' : 'transparent',
          color: disabled ? 'rgba(154,160,173,.35)' : on ? '#fff' : PLAYER.mute,
          fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
          boxShadow: on ? '0 4px 14px rgba(139,26,46,.4)' : 'none',
          transition: 'background .18s, color .18s',
        }}>
        <span style={{ color: on ? G : 'inherit', display: 'flex' }}>{icon}</span>
        {label}
      </button>
    )
  }

  // The lesson list (used both as sidebar and mobile drawer)
  const LessonList = () => (
    <>
      <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${PLAYER.line}` }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', color: G, textTransform: 'uppercase', marginBottom: 8 }}>
          {subject.subjectName}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
            <div style={{ width: pct + '%', height: '100%', background: `linear-gradient(90deg, ${CR}, ${GD})`, borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: PLAYER.mute }}>{doneCount}/{playlist.length}</span>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }} className="lp-list-scroll">
        {playlist.map((l, i) => {
          const on = String(l._id) === String(lesson._id)
          const done = !!progressMap[l._id]
          const vids = 1 + (l.videos ? l.videos.length : 0) - (l.videoEmbedId && (l.videos||[]).some(v=>v.embedId===l.videoEmbedId) ? 1 : 0)
          return (
            <button key={l._id}
              onClick={() => { if (!on && onSelectLesson) { onSelectLesson(l); setListOpen(false) } }}
              style={{
                display: 'flex', gap: 12, width: '100%', textAlign: 'left',
                padding: '13px 18px', border: 'none', cursor: on ? 'default' : 'pointer',
                background: on ? 'linear-gradient(90deg, rgba(193,18,31,.22), transparent)' : 'transparent',
                borderLeft: `3px solid ${on ? G : 'transparent'}`,
                alignItems: 'flex-start',
                transition: 'background .15s',
              }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'rgba(255,255,255,.035)' }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent' }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11.5, fontWeight: 800,
                background: done ? `linear-gradient(135deg, ${CR}, ${GD})` : on ? 'rgba(228,198,137,.15)' : 'rgba(255,255,255,.06)',
                color: done ? '#fff' : on ? G : PLAYER.mute,
                border: on && !done ? `1px solid ${G}` : 'none',
              }}>
                {done ? Ico.check : (i + 1)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: on ? 700 : 600, color: on ? PLAYER.text : '#C9CBD1', lineHeight: 1.4 }}>
                  {l.title}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 10.5, color: PLAYER.mute, alignItems: 'center' }}>
                  <span>Lesson {l.order}</span>
                  {l.durationMins > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{Ico.clock}{l.durationMins}m</span>}
                  {(l.videoEmbedId || (l.videos && l.videos.length > 0)) && (
                    <span style={{ color: G, display: 'flex', alignItems: 'center', gap: 3 }}>{Ico.play}</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )

  return (
    <div>
      <style>{`
        .lp-list-scroll::-webkit-scrollbar { width: 7px }
        .lp-list-scroll::-webkit-scrollbar-thumb { background: #2A3346; border-radius: 7px }
        .lp-list-scroll::-webkit-scrollbar-track { background: transparent }
        @media (max-width: 920px) {
          .lp-grid { grid-template-columns: 1fr !important; }
          .lp-sidebar-desktop { display: none !important; }
          .lp-listbtn-mobile { display: inline-flex !important; }
        }
        @keyframes lpFade { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      {/* Top bar: back + lesson title + tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'transparent', border: 'none', color: BRAND.crimson, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
          {Ico.back} All subjects
        </button>
        <div style={{ flex: 1 }} />
        <button className="lp-listbtn-mobile" onClick={() => setListOpen(true)}
          style={{ display: 'none', alignItems: 'center', gap: 7, background: BRAND.white, border: `1px solid ${BRAND.line}`, borderRadius: 9, color: BRAND.ink, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: '7px 13px' }}>
          {Ico.list} Lessons
        </button>
      </div>

      {/* Lesson heading */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: BRAND.inkMute, textTransform: 'uppercase', marginBottom: 4 }}>
          {subject.subjectName} &middot; Term {lesson.termIndex} &middot; Lesson {lesson.order}
          {mastered && (
            <span style={{ marginLeft: 10, color: '#15803D', display: 'inline-flex', alignItems: 'center', gap: 3, verticalAlign: 'middle' }}>
              {Ico.check} Mastered
            </span>
          )}
        </div>
        <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 400, color: BRAND.ink, lineHeight: 1.2, margin: 0 }}>
          {lesson.title}
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, background: PLAYER.panel, padding: 6, borderRadius: 13, width: 'fit-content', maxWidth: '100%', overflowX: 'auto' }}>
        <Tab id="video"    icon={Ico.play}     label="Lesson"   disabled={!hasVideo} />
        <Tab id="notes"    icon={Ico.notes}    label="Notes"    disabled={!hasNotes} />
        <Tab id="progress" icon={Ico.progress} label="Progress" />
        <Tab id="library"  icon={Ico.library}  label="Library"  onClick={() => onOpenLibrary && onOpenLibrary()} />
      </div>

      {/* Main grid: big stage + lesson sidebar */}
      <div className="lp-grid" style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16, alignItems: 'start',
      }}>
        {/* STAGE */}
        <div style={{
          background: PLAYER.shell, borderRadius: 18, overflow: 'hidden',
          border: '1px solid rgba(228,198,137,.12)',
          boxShadow: '0 24px 60px rgba(8,10,20,.28)',
          animation: 'lpFade .25s ease-out',
        }}>
          {/* The viewing area — large */}
          <div style={{
            width: '100%',
            ...(pane === 'notes' ? { height: 'min(74vh, 780px)', background: '#525659', display: 'flex' } : { aspectRatio: '16 / 9', background: '#000' }),
          }}>
            {pane === 'video' && hasVideo && activeVideo && activeVideo.source === 'recording' && (
              <video key={activeVideo.r2Url} src={activeVideo.r2Url} poster={activeVideo.posterUrl || undefined}
                controls controlsList="nodownload" onContextMenu={e => e.preventDefault()} playsInline
                style={{ width: '100%', height: '100%', display: 'block', background: '#000', objectFit: 'contain' }} />
            )}
            {pane === 'video' && hasVideo && activeVideo && activeVideo.source !== 'recording' && (
              <iframe key={activeVideo.embedId}
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.embedId}?rel=0&modestbranding=1`}
                title={lesson.title} allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} />
            )}
            {pane === 'video' && !hasVideo && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: PLAYER.mute, gap: 10 }}>
                <span style={{ color: 'rgba(228,198,137,.5)' }}>{Ico.play}</span>
                <span style={{ fontSize: 13 }}>No video for this lesson yet.</span>
              </div>
            )}
            {pane === 'notes' && hasNotes && <NotesPdfViewer url={lesson.notesPdfUrl} />}
            {pane === 'notes' && !hasNotes && (
              <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PLAYER.mute, fontSize: 13 }}>
                No notes for this lesson yet.
              </div>
            )}
            {pane === 'progress' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 30, color: PLAYER.mute }}>
                <ProgressRing percentage={pct} size={104} color={G} trackColor="rgba(255,255,255,.10)" />
                <div style={{ fontSize: 15, color: PLAYER.text, fontWeight: 700 }}>{doneCount} of {playlist.length} lessons mastered</div>
                <div style={{ fontSize: 12.5, textAlign: 'center', maxWidth: 340, lineHeight: 1.6 }}>
                  A lesson counts as mastered once you pass its practice questions. Keep going.
                </div>
              </div>
            )}
          </div>

          {/* Video chooser (only when several videos) */}
          {pane === 'video' && videoList.length > 1 && (
            <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', borderTop: `1px solid ${PLAYER.line}` }}>
              {videoList.map((v, i) => {
                const on = i === activeVideoIdx
                const label = v.source === 'recording'
                  ? (v.recordedAt ? 'Recorded ' + new Date(v.recordedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : (v.title || 'Recording ' + (i + 1)))
                  : (v.title || 'Video ' + (i + 1))
                return (
                  <button key={i} onClick={() => setActiveVideoIdx(i)}
                    style={{
                      flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10,
                      cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 700,
                      border: on ? 'none' : `1px solid ${PLAYER.line}`,
                      background: on ? 'linear-gradient(120deg, #8B1A2E, #A32438)' : PLAYER.raised,
                      color: on ? '#fff' : PLAYER.mute,
                      boxShadow: on ? '0 3px 12px rgba(139,26,46,.4)' : 'none',
                    }}>
                    <span style={{ color: on ? G : (v.source === 'recording' ? CR : PLAYER.mute), fontSize: 8, display: 'flex' }}>{Ico.dot}</span>
                    {label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Description strip */}
          {lesson.description && (
            <div style={{ padding: '16px 22px', borderTop: `1px solid ${PLAYER.line}`, color: '#B8BBC4', fontSize: 13, lineHeight: 1.7 }}>
              {lesson.description}
            </div>
          )}
        </div>

        {/* SIDEBAR — lesson list (desktop) */}
        <div className="lp-sidebar-desktop" style={{
          background: PLAYER.panel, borderRadius: 18, overflow: 'hidden',
          border: `1px solid ${PLAYER.line}`, display: 'flex', flexDirection: 'column',
          maxHeight: 'min(74vh, 780px)',
        }}>
          <LessonList />
        </div>
      </div>

      {/* Mobile lesson drawer */}
      {listOpen && (
        <div onClick={() => setListOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 60, animation: 'lpFade .2s' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(340px, 88vw)', background: PLAYER.panel, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 12 }}>
              <button onClick={() => setListOpen(false)} style={{ background: 'transparent', border: 'none', color: PLAYER.mute, cursor: 'pointer' }}>{Ico.close}</button>
            </div>
            <LessonList />
          </div>
        </div>
      )}
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
