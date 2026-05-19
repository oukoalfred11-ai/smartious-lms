/**
 * ManageSubjectTab.jsx
 * ============================================================
 * Teacher's "Manage My Subject" page.
 *
 * Two views:
 *   1. SUBJECTS GRID — cards for each subject the teacher teaches
 *      (sourced from teachingSpecialties). Each card shows lesson
 *      counts and a "Manage Lessons" button.
 *   2. LESSONS LIST — table of lessons for the selected subject,
 *      grouped by term. Actions: add single, bulk import, edit,
 *      delete, mark published/draft, edit notes PDF / video URL.
 *
 * Plus a settings modal where the teacher can pick their
 * curricula × subjects to populate teachingSpecialties without
 * needing admin intervention.
 *
 * API client: imports `api` from a sibling location. Assumes the
 * standard axios instance pattern from ctx.jsx. If your project
 * exposes `api` differently, adjust the import.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { api } from '../../context/ctx.jsx'
import { imageForSubject, colorForSubject } from '../../utils/subjectImages.js'

// Brand palette — kept locally so this file is self-contained
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

// Curricula known to the system
const CURRICULA = ['IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC', 'BNC', 'American']

// YouTube ID extraction (mirror of backend)
const extractYouTubeId = (url = '') => {
  if (typeof url !== 'string') return ''
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) return m[1]
  }
  return ''
}

export default function ManageSubjectTab({ user, toast }) {
  // ────────────────────────────────────────────────────────
  // STATE
  // ────────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState([])
  const [subjectsLoading, setSubjectsLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [lessons, setLessons] = useState([])
  const [lessonsLoading, setLessonsLoading] = useState(false)
  const [subjectView, setSubjectView] = useState('lessons')   // lessons | mastery

  // Modals
  const [showSettings, setShowSettings] = useState(false)
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)

  // ────────────────────────────────────────────────────────
  // DATA LOADING
  // ────────────────────────────────────────────────────────
  const loadSubjects = useCallback(async () => {
    setSubjectsLoading(true)
    try {
      const { data } = await api.get('/lessons/my-subjects')
      if (data?.success) setSubjects(data.data?.subjects || [])
      else toast?.error?.(data?.message || 'Failed to load subjects.')
    } catch (e) {
      console.error('[manage subject] load failed:', e.message)
      toast?.error?.('Could not load your subjects.')
    } finally {
      setSubjectsLoading(false)
    }
  }, [toast])

  const loadLessons = useCallback(async (subjectId) => {
    setLessonsLoading(true)
    try {
      const { data } = await api.get('/lessons/subject/' + subjectId)
      if (data?.success) setLessons(data.data?.lessons || [])
      else toast?.error?.(data?.message || 'Failed to load lessons.')
    } catch (e) {
      console.error('[manage subject] lessons load failed:', e.message)
      toast?.error?.('Could not load lessons.')
    } finally {
      setLessonsLoading(false)
    }
  }, [toast])

  useEffect(() => { loadSubjects() }, [loadSubjects])
  useEffect(() => {
    if (selectedSubject) loadLessons(selectedSubject._id)
    else setLessons([])
    setSubjectView('lessons')
  }, [selectedSubject, loadLessons])

  // ────────────────────────────────────────────────────────
  // ACTIONS
  // ────────────────────────────────────────────────────────
  const deleteLesson = async (lesson) => {
    if (!window.confirm(`Delete lesson "${lesson.title}"? This cannot be undone.`)) return
    try {
      const { data } = await api.delete('/lessons/' + lesson._id)
      if (data?.success) {
        toast?.ok?.('Lesson deleted.')
        setLessons(ls => ls.filter(l => l._id !== lesson._id))
        loadSubjects()  // refresh counts
      } else {
        toast?.error?.(data?.message || 'Failed to delete.')
      }
    } catch (e) {
      toast?.error?.('Could not delete lesson.')
    }
  }

  const togglePublish = async (lesson) => {
    const next = lesson.status === 'published' ? 'draft' : 'published'
    try {
      const { data } = await api.patch('/lessons/' + lesson._id, { status: next })
      if (data?.success) {
        setLessons(ls => ls.map(l => l._id === lesson._id ? data.data.lesson : l))
        toast?.ok?.(next === 'published' ? 'Lesson published.' : 'Reverted to draft.')
        loadSubjects()
      }
    } catch (e) {
      toast?.error?.('Could not change status.')
    }
  }

  // ────────────────────────────────────────────────────────
  // RENDER: SUBJECTS GRID (no subject selected)
  // ────────────────────────────────────────────────────────
  if (!selectedSubject) {
    return (
      <div>
        {/* ─── HERO ─── */}
        <div className="card" style={{
          padding: 0, marginBottom: 18, overflow: 'hidden',
          background: `linear-gradient(135deg, ${BRAND.crimson} 0%, ${BRAND.crimsonD} 100%)`,
          color: BRAND.cream,
          boxShadow: '0 12px 40px rgba(125,16,37,.20)',
        }}>
          <div style={{
            padding: '24px 30px',
            display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
            backgroundImage: 'radial-gradient(circle at 95% 50%, rgba(201,160,48,.18) 0%, transparent 50%)',
          }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#F0CC5A', marginBottom: 6 }}>
                Teaching Library
              </div>
              <h1 style={{
                fontFamily: "'Instrument Serif', serif", fontSize: 30, fontWeight: 400,
                margin: 0, lineHeight: 1.15,
              }}>
                Manage My Subjects
              </h1>
              <div style={{ fontSize: 13, opacity: .85, marginTop: 6 }}>
                Build your lesson library — sub-topics, notes, and video explanations.
                {subjects.length > 0 && <> &middot; {subjects.length} subject{subjects.length === 1 ? '' : 's'} in your specialty</>}
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              style={{
                background: 'rgba(0,0,0,.18)', color: BRAND.cream,
                border: '1px solid rgba(251,250,245,.25)',
                padding: '10px 16px', borderRadius: 8,
                cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              My Specialties
            </button>
          </div>
        </div>

        {/* ─── GRID ─── */}
        {subjectsLoading ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 13, color: BRAND.inkMute, letterSpacing: '.1em' }}>
              LOADING SUBJECTS...
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
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: BRAND.ink, marginBottom: 6 }}>
              No subjects yet
            </div>
            <div style={{ fontSize: 13.5, color: BRAND.inkMute, maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.55 }}>
              Click <strong>My Specialties</strong> above to pick the curricula and subjects you teach.
              Once set, you'll be able to build your lesson library here.
            </div>
            <button onClick={() => setShowSettings(true)}
              style={{
                background: BRAND.crimson, color: BRAND.white, border: 'none',
                padding: '10px 22px', borderRadius: 8,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>
              Set My Specialties
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
          }}>
            {subjects.map(s => (
              <SubjectCard key={s._id} subject={s} onOpen={() => setSelectedSubject(s)} />
            ))}
          </div>
        )}

        {/* SETTINGS MODAL */}
        {showSettings && (
          <SpecialtiesModal
            user={user}
            initialSpecialties={subjects.map(s => s._id)}    // current subjectIds
            initialCurricula={[...new Set(subjects.flatMap(s => s.myCurricula || []))]}
            toast={toast}
            onClose={() => setShowSettings(false)}
            onSaved={() => { setShowSettings(false); loadSubjects() }}
          />
        )}
      </div>
    )
  }

  // ────────────────────────────────────────────────────────
  // RENDER: LESSONS LIST (subject selected)
  // ────────────────────────────────────────────────────────
  const lessonsByTerm = [1, 2, 3].map(t => ({
    term: t,
    lessons: lessons.filter(l => l.termIndex === t),
  }))

  const subjCol = colorForSubject(selectedSubject, BRAND.crimson)

  return (
    <div>
      {/* ─── BACK BUTTON ─── */}
      <button onClick={() => setSelectedSubject(null)}
        style={{
          background: 'transparent', border: 'none',
          color: BRAND.crimson, fontSize: 13, fontWeight: 700,
          cursor: 'pointer', padding: '6px 0', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Subjects
      </button>

      {/* ─── HEADER CARD ─── */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,.08)',
      }}>
        <div style={{ height: 6, background: subjCol }} />
        <div style={{ padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
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
            <div style={{ fontSize: 12.5, color: BRAND.inkMute, marginTop: 4 }}>
              {lessons.length} total lesson{lessons.length === 1 ? '' : 's'} &middot;{' '}
              {lessons.filter(l => l.status === 'published').length} published
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setShowBulkImport(true)}
              style={{
                background: BRAND.white, color: BRAND.crimson,
                border: `1.5px solid ${BRAND.crimson}`,
                padding: '10px 16px', borderRadius: 8,
                cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Bulk Import Titles
            </button>
            <button onClick={() => { setEditingLesson(null); setShowAddLesson(true) }}
              style={{
                background: BRAND.crimson, color: BRAND.white,
                border: 'none',
                padding: '10px 18px', borderRadius: 8,
                cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Lesson
            </button>
          </div>
        </div>
      </div>

      {/* ─── VIEW TOGGLE: LESSONS / STUDENT MASTERY ─── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          { id: 'lessons', label: 'Lessons' },
          { id: 'mastery', label: 'Student Mastery' },
        ].map(v => (
          <button key={v.id} onClick={() => setSubjectView(v.id)}
            style={{
              padding: '8px 18px', borderRadius: 99,
              border: `1.5px solid ${subjectView === v.id ? BRAND.crimson : BRAND.line || '#E8E2D6'}`,
              background: subjectView === v.id ? BRAND.crimson : BRAND.white,
              color: subjectView === v.id ? BRAND.white : BRAND.crimson,
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* ─── STUDENT MASTERY MATRIX ─── */}
      {subjectView === 'mastery' && (
        <MasteryMatrix subject={selectedSubject} toast={toast} />
      )}

      {/* ─── LESSONS GROUPED BY TERM ─── */}
      {subjectView === 'lessons' && (lessonsLoading ? (
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
          <div style={{ fontSize: 13, color: BRAND.inkMute, marginBottom: 18 }}>
            Add lessons one at a time, or paste a list of sub-topics for bulk import.
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setShowBulkImport(true)}
              style={{
                background: BRAND.white, color: BRAND.crimson,
                border: `1.5px solid ${BRAND.crimson}`,
                padding: '10px 18px', borderRadius: 8,
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}>
              Bulk Import
            </button>
            <button onClick={() => { setEditingLesson(null); setShowAddLesson(true) }}
              style={{
                background: BRAND.crimson, color: BRAND.white, border: 'none',
                padding: '10px 22px', borderRadius: 8,
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}>
              Add First Lesson
            </button>
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
                    <LessonRow
                      key={l._id}
                      lesson={l}
                      isAdmin={user?.role === 'admin'}
                      onEdit={() => { setEditingLesson(l); setShowAddLesson(true) }}
                      onDelete={() => deleteLesson(l)}
                      onTogglePublish={() => togglePublish(l)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {/* ADD/EDIT LESSON MODAL */}
      {showAddLesson && (
        <LessonFormModal
          subject={selectedSubject}
          editing={editingLesson}
          toast={toast}
          onClose={() => { setShowAddLesson(false); setEditingLesson(null) }}
          onSaved={() => {
            setShowAddLesson(false)
            setEditingLesson(null)
            loadLessons(selectedSubject._id)
            loadSubjects()
          }}
        />
      )}

      {/* BULK IMPORT MODAL */}
      {showBulkImport && (
        <BulkImportModal
          subject={selectedSubject}
          toast={toast}
          onClose={() => setShowBulkImport(false)}
          onSaved={() => {
            setShowBulkImport(false)
            loadLessons(selectedSubject._id)
            loadSubjects()
          }}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// SUBJECT CARD
// ═══════════════════════════════════════════════════════════
function SubjectCard({ subject, onOpen }) {
  const col = colorForSubject(subject, BRAND.crimson)
  const img = imageForSubject(subject)
  const total = subject.lessonCount || 0
  const published = subject.publishedCount || 0
  const pct = total > 0 ? Math.round((published / total) * 100) : 0

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
      {/* Cover image — falls back to colored block if no image known */}
      <div style={{
        position: 'relative',
        height: 140,
        background: img
          ? `linear-gradient(to bottom, rgba(0,0,0,0) 50%, ${col} 100%), url(${img})`
          : `linear-gradient(135deg, ${col} 0%, ${col}cc 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        {/* Curriculum badge floating on the image */}
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
      </div>

      <div style={{ padding: '14px 18px 16px' }}>
        <div style={{
          fontFamily: "'Instrument Serif',serif", fontSize: 20, fontWeight: 400,
          color: BRAND.ink, lineHeight: 1.15, marginBottom: 4,
        }}>
          {subject.subjectName}
        </div>
        <div style={{ fontSize: 11.5, color: BRAND.inkMute, marginBottom: 12 }}>
          {subject.category}
        </div>

        <div style={{
          background: BRAND.cream,
          padding: '10px 12px', borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: BRAND.inkMute, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Lessons
            </div>
            <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: BRAND.ink }}>
              {published}/{total}
            </div>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700,
            color: pct >= 70 ? '#15803D' : pct >= 30 ? BRAND.gold : BRAND.inkMute,
          }}>
            {total === 0 ? 'Add your first' : `${pct}% live`}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// LESSON ROW
// ═══════════════════════════════════════════════════════════
function LessonRow({ lesson, isAdmin, onEdit, onDelete, onTogglePublish }) {
  const isPublished = lesson.status === 'published'
  return (
    <div className="card" style={{
      padding: '12px 14px',
      borderLeft: `4px solid ${isPublished ? '#15803D' : BRAND.gold}`,
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
    }}>
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
          {!lesson.videoEmbedId && !lesson.notesPdfUrl && (
            <span style={{ color: '#B45309' }}>No content yet</span>
          )}
          {lesson.teacherId && (lesson.teacherId.firstName || lesson.teacherId.lastName) && (
            <span style={{ color: BRAND.inkMute }}>
              By {lesson.teacherId.firstName || ''} {lesson.teacherId.lastName || ''}
            </span>
          )}
        </div>
      </div>
      <div style={{
        background: isPublished ? '#DCFCE7' : BRAND.goldPale,
        color: isPublished ? '#15803D' : '#92400E',
        fontSize: 9.5, fontWeight: 800, letterSpacing: '.08em',
        padding: '3px 9px', borderRadius: 99, textTransform: 'uppercase',
      }}>
        {isPublished ? 'Published' : 'Draft'}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={onTogglePublish}
          style={{
            background: 'transparent', color: BRAND.crimson,
            border: `1px solid ${BRAND.line}`,
            padding: '6px 12px', borderRadius: 6,
            cursor: 'pointer', fontSize: 11.5, fontWeight: 600,
          }}>
          {isPublished ? 'Unpublish' : 'Publish'}
        </button>
        <button onClick={onEdit}
          style={{
            background: BRAND.crimson, color: BRAND.white, border: 'none',
            padding: '6px 14px', borderRadius: 6,
            cursor: 'pointer', fontSize: 11.5, fontWeight: 700,
          }}>
          Edit
        </button>
        {isAdmin && (
          <button onClick={onDelete} title="Delete lesson (admin only)"
            style={{
              background: '#FEE2E2', color: '#B91C1C', border: 'none',
              padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
            }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// LESSON FORM MODAL (add or edit one)
// ═══════════════════════════════════════════════════════════
function LessonFormModal({ subject, editing, toast, onClose, onSaved }) {
  const [form, setForm] = useState(() => editing ? {
    title:        editing.title || '',
    description:  editing.description || '',
    termIndex:    editing.termIndex || 1,
    order:        editing.order || '',
    videoUrl:     editing.videoUrl || '',
    notesPdfUrl:  editing.notesPdfUrl || '',
    notesPdfPublicId: editing.notesPdfPublicId || '',
    durationMins: editing.durationMins || 0,
    status:       editing.status || 'draft',
    topicRef:     editing.topicRef || '',
    subtopicName: editing.subtopicName || '',
  } : {
    title: '', description: '',
    termIndex: 1, order: '',
    videoUrl: '', notesPdfUrl: '', notesPdfPublicId: '',
    durationMins: 0, status: 'draft',
    topicRef: '', subtopicName: '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // ── Curriculum-spine integration ───────────────────────
  // subject._id IS the real database Subject id, so the spine
  // can be fetched directly — no name-matching needed. When a
  // spine exists, Topic + Subtopic dropdowns appear; picking a
  // subtopic prefills the lesson title. No spine → form is
  // unchanged.
  const [spineTopics, setSpineTopics] = useState([])
  useEffect(() => {
    if (!subject?._id) return
    let cancelled = false
    api.get('/syllabus/subject/' + subject._id)
      .then(r => { if (!cancelled) setSpineTopics(r.data?.data?.topics || []) })
      .catch(() => { if (!cancelled) setSpineTopics([]) })
    return () => { cancelled = true }
  }, [subject?._id])

  const hasSpine = spineTopics.length > 0
  const spineSelTopic = spineTopics.find(t => String(t._id) === String(form.topicRef))

  const ytId = useMemo(() => extractYouTubeId(form.videoUrl), [form.videoUrl])
  const ytInvalid = form.videoUrl.trim() && !ytId

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const uploadPdf = async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast?.error?.('Notes must be a PDF file.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      toast?.error?.('PDF is larger than 20 MB. Compress it and try again.')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/lessons/upload-pdf', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data?.success) {
        update('notesPdfUrl', data.data.url)
        update('notesPdfPublicId', data.data.publicId)
        toast?.ok?.('Notes PDF uploaded.')
      } else {
        toast?.error?.(data?.message || 'Upload failed.')
      }
    } catch (e) {
      toast?.error?.('Could not upload PDF: ' + (e?.response?.data?.message || e.message))
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    if (!form.title.trim()) { toast?.error?.('Title is required.'); return }
    if (ytInvalid) { toast?.error?.('Video URL must be a valid YouTube link.'); return }

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        termIndex: Number(form.termIndex) || 1,
        videoUrl: form.videoUrl.trim(),
        notesPdfUrl: form.notesPdfUrl,
        notesPdfPublicId: form.notesPdfPublicId,
        durationMins: Number(form.durationMins) || 0,
        status: form.status,
        topicRef: form.topicRef || null,
        subtopicName: form.subtopicName || '',
      }
      if (form.order !== '' && form.order !== null) payload.order = Number(form.order)
      if (!editing) payload.subjectId = subject._id

      const { data } = editing
        ? await api.patch('/lessons/' + editing._id, payload)
        : await api.post('/lessons', payload)

      if (data?.success) {
        toast?.ok?.(editing ? 'Lesson updated.' : 'Lesson created.')
        onSaved?.()
      } else {
        toast?.error?.(data?.message || 'Save failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not save lesson.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: BRAND.white, borderRadius: 12,
        maxWidth: 680, width: '100%', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        <div style={{
          padding: '18px 24px',
          background: `linear-gradient(135deg, ${BRAND.crimson} 0%, ${BRAND.crimsonD} 100%)`,
          color: BRAND.cream,
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#F0CC5A' }}>
            {editing ? 'Edit Lesson' : 'New Lesson'}
          </div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, marginTop: 2 }}>
            {subject.subjectName} &middot; Term {form.termIndex}
          </div>
        </div>

        <div style={{ padding: '20px 24px', overflow: 'auto', flex: 1 }}>
          <Field label="Title *">
            <input value={form.title} onChange={e => update('title', e.target.value)}
              placeholder="e.g. Quadratic Equations: Introduction" style={inp} />
          </Field>
          <Field label="Description (optional)">
            <textarea value={form.description} onChange={e => update('description', e.target.value)}
              rows={3} placeholder="Brief blurb about this lesson..." style={{ ...inp, resize: 'vertical' }} />
          </Field>

          {hasSpine && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Field label="Syllabus Topic" wrap={{ minWidth: 200, flex: 1 }}>
                <select value={form.topicRef}
                  onChange={e => { update('topicRef', e.target.value); update('subtopicName', '') }}
                  style={inp}>
                  <option value="">— Not linked —</option>
                  {spineTopics.map(t => (
                    <option key={t._id} value={t._id}>{t.code ? t.code + '. ' : ''}{t.topic}</option>
                  ))}
                </select>
              </Field>
              {form.topicRef && (
                <Field label="Subtopic" wrap={{ minWidth: 200, flex: 1 }}>
                  <select value={form.subtopicName}
                    onChange={e => {
                      const name = e.target.value
                      update('subtopicName', name)
                      // Prefill the title from the subtopic (teacher can edit)
                      if (name && !form.title.trim()) update('title', name)
                    }}
                    style={inp}>
                    <option value="">— Select subtopic —</option>
                    {(spineSelTopic?.subtopics || []).map((s, i) => (
                      <option key={i} value={s.name}>{s.code ? s.code + ' ' : ''}{s.name}</option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
          )}
          {hasSpine && form.subtopicName && spineSelTopic && (() => {
            const sub = (spineSelTopic.subtopics || []).find(s => s.name === form.subtopicName)
            const sug = sub && sub.suggestedLessons
            return sug ? (
              <div style={{ fontSize: 11.5, color: BRAND.crimson, margin: '-4px 0 10px', fontWeight: 600 }}>
                Syllabus guidance: this subtopic suggests {sug} lesson{sug === 1 ? '' : 's'}.
              </div>
            ) : null
          })()}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Field label="Term" wrap={{ minWidth: 140, flex: 1 }}>
              <select value={form.termIndex} onChange={e => update('termIndex', Number(e.target.value))} style={inp}>
                <option value={1}>Term 1</option>
                <option value={2}>Term 2</option>
                <option value={3}>Term 3</option>
              </select>
            </Field>
            <Field label="Order (#)" wrap={{ minWidth: 110, flex: 1 }}>
              <input type="number" value={form.order} onChange={e => update('order', e.target.value)}
                placeholder="auto" style={inp} />
            </Field>
            <Field label="Duration (min)" wrap={{ minWidth: 120, flex: 1 }}>
              <input type="number" min={0} value={form.durationMins} onChange={e => update('durationMins', e.target.value)}
                style={inp} />
            </Field>
            <Field label="Status" wrap={{ minWidth: 140, flex: 1 }}>
              <select value={form.status} onChange={e => update('status', e.target.value)} style={inp}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
          </div>

          <Field label="YouTube video URL (unlisted is fine)">
            <input value={form.videoUrl} onChange={e => update('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..." style={{
                ...inp,
                borderColor: ytInvalid ? '#FCA5A5' : BRAND.line,
              }} />
            {form.videoUrl && (
              ytId ? (
                <div style={{ fontSize: 11.5, color: '#15803D', marginTop: 4, fontWeight: 600 }}>
                  ✓ Detected video ID: {ytId}
                </div>
              ) : (
                <div style={{ fontSize: 11.5, color: '#B91C1C', marginTop: 4, fontWeight: 600 }}>
                  ✗ Not a valid YouTube URL
                </div>
              )
            )}
          </Field>

          <Field label="Notes PDF (max 20 MB)">
            {form.notesPdfUrl ? (
              <div style={{
                background: BRAND.goldPale,
                border: `1px solid ${BRAND.gold}`, borderRadius: 6,
                padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
              }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={BRAND.crimson} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <a href={form.notesPdfUrl} target="_blank" rel="noopener noreferrer"
                  style={{ flex: 1, color: BRAND.crimson, fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>
                  View uploaded PDF
                </a>
                <button onClick={() => { update('notesPdfUrl', ''); update('notesPdfPublicId', '') }}
                  style={{
                    background: 'transparent', color: BRAND.crimson,
                    border: `1px solid ${BRAND.crimson}`,
                    padding: '4px 10px', borderRadius: 4,
                    cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  }}>
                  Replace
                </button>
              </div>
            ) : (
              <label style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: BRAND.cream, border: `1px dashed ${BRAND.line}`,
                borderRadius: 6, cursor: 'pointer',
                fontSize: 12.5, color: BRAND.inkMute,
              }}>
                <input type="file" accept="application/pdf" style={{ display: 'none' }}
                  onChange={e => uploadPdf(e.target.files?.[0])}/>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                {uploading ? 'Uploading...' : 'Click to upload PDF'}
              </label>
            )}
          </Field>
        </div>

        <div style={{
          padding: '12px 24px',
          background: BRAND.cream, borderTop: `1px solid ${BRAND.line}`,
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose} disabled={saving}
            style={{
              background: BRAND.white, color: BRAND.crimson,
              border: `1.5px solid ${BRAND.line}`,
              padding: '9px 18px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving || uploading}
            style={{
              background: saving ? '#9CA3AF' : BRAND.crimson, color: BRAND.white,
              border: 'none', padding: '9px 22px', borderRadius: 6,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
            }}>
            {saving ? 'Saving...' : (editing ? 'Save Changes' : 'Create Lesson')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// BULK IMPORT MODAL
// ═══════════════════════════════════════════════════════════
function BulkImportModal({ subject, toast, onClose, onSaved }) {
  const [text, setText] = useState('')
  const [termIndex, setTermIndex] = useState(1)
  const [saving, setSaving] = useState(false)

  // ── Curriculum-spine integration ───────────────────────
  // If this subject has a spine, the teacher can pick a topic and
  // pull its subtopics straight into the list — generating lessons
  // from the syllabus structure. Free pasting still works as before.
  const [spineTopics, setSpineTopics] = useState([])
  const [pickedTopic, setPickedTopic] = useState('')
  useEffect(() => {
    if (!subject?._id) return
    let cancelled = false
    api.get('/syllabus/subject/' + subject._id)
      .then(r => { if (!cancelled) setSpineTopics(r.data?.data?.topics || []) })
      .catch(() => { if (!cancelled) setSpineTopics([]) })
    return () => { cancelled = true }
  }, [subject?._id])
  const hasSpine = spineTopics.length > 0

  const loadTopicSubtopics = (topicId) => {
    setPickedTopic(topicId)
    const t = spineTopics.find(x => String(x._id) === String(topicId))
    if (!t) return
    const names = (t.subtopics || []).map(s => s.name).filter(Boolean)
    // Append to anything already typed, avoiding duplicates
    setText(prev => {
      const existing = prev.split('\n').map(x => x.trim()).filter(Boolean)
      const merged = [...existing]
      names.forEach(n => { if (!merged.includes(n)) merged.push(n) })
      return merged.join('\n')
    })
  }

  const titles = text.split('\n').map(t => t.trim()).filter(Boolean)
  const count = titles.length
  const tooMany = count > 200

  const submit = async () => {
    if (count === 0) { toast?.error?.('Add at least one title.'); return }
    if (tooMany) { toast?.error?.('Maximum 200 titles per batch.'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/lessons/bulk', {
        subjectId: subject._id, titles, termIndex,
      })
      if (data?.success) {
        toast?.ok?.(`${count} lesson${count === 1 ? '' : 's'} created as drafts.`)
        onSaved?.()
      } else {
        toast?.error?.(data?.message || 'Bulk import failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Bulk import failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: BRAND.white, borderRadius: 12,
        maxWidth: 620, width: '100%', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        <div style={{
          padding: '18px 24px',
          background: `linear-gradient(135deg, ${BRAND.crimson} 0%, ${BRAND.crimsonD} 100%)`,
          color: BRAND.cream,
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#F0CC5A' }}>
            Bulk Import
          </div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, marginTop: 2 }}>
            Add many sub-topics at once
          </div>
        </div>
        <div style={{ padding: '20px 24px', overflow: 'auto', flex: 1 }}>
          <p style={{ fontSize: 13, color: BRAND.ink, lineHeight: 1.55, marginTop: 0 }}>
            Paste your list of lesson titles below — <strong>one per line</strong>. Each will become a
            draft lesson you can fill in (video, notes) later. Typical academic year is 60–80 lessons.
          </p>
          <Field label="Term to assign">
            <select value={termIndex} onChange={e => setTermIndex(Number(e.target.value))} style={inp}>
              <option value={1}>Term 1</option>
              <option value={2}>Term 2</option>
              <option value={3}>Term 3</option>
            </select>
          </Field>

          {hasSpine && (
            <Field label="Generate from syllabus topic (optional)">
              <select value={pickedTopic} onChange={e => loadTopicSubtopics(e.target.value)} style={inp}>
                <option value="">— Pick a topic to add its subtopics —</option>
                {spineTopics.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.code ? t.code + '. ' : ''}{t.topic} ({(t.subtopics || []).length} subtopics)
                  </option>
                ))}
              </select>
              <div style={{ fontSize: 11.5, color: BRAND.crimson, marginTop: 5, fontWeight: 600 }}>
                Picking a topic adds its subtopics to the list below. You can pick several, then edit before importing.
              </div>
            </Field>
          )}
          <Field label={`Lesson titles (${count} detected${tooMany ? ' — too many!' : ''})`}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={14}
              placeholder={`Numbers and Calculations\nAlgebra Basics\nLinear Equations\nQuadratic Equations\n...`}
              style={{
                ...inp,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13, lineHeight: 1.5,
                borderColor: tooMany ? '#FCA5A5' : BRAND.line,
              }}
            />
          </Field>
        </div>
        <div style={{
          padding: '12px 24px',
          background: BRAND.cream, borderTop: `1px solid ${BRAND.line}`,
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose} disabled={saving}
            style={{
              background: BRAND.white, color: BRAND.crimson,
              border: `1.5px solid ${BRAND.line}`,
              padding: '9px 18px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            Cancel
          </button>
          <button onClick={submit} disabled={saving || count === 0 || tooMany}
            style={{
              background: saving || count === 0 || tooMany ? '#9CA3AF' : BRAND.crimson,
              color: BRAND.white, border: 'none',
              padding: '9px 22px', borderRadius: 6,
              cursor: saving || count === 0 || tooMany ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
            }}>
            {saving ? 'Importing...' : `Import ${count} as Drafts`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// SPECIALTIES MODAL (teacher self-onboarding)
// ═══════════════════════════════════════════════════════════
function SpecialtiesModal({ initialSpecialties, initialCurricula, toast, onClose, onSaved }) {
  const [pickedCurricula, setPickedCurricula] = useState(initialCurricula || [])
  const [pickedSubjects, setPickedSubjects] = useState(initialSpecialties || [])
  const [allSubjects, setAllSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  // Load all subjects for the selected curricula. Refresh when curricula changes.
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        if (pickedCurricula.length === 0) {
          if (!cancelled) { setAllSubjects([]); setLoading(false) }
          return
        }
        // Subject.find filters by curriculum, so we fan out
        const queries = pickedCurricula.map(c =>
          api.get('/subjects', { params: { curriculum: c } })
        )
        const results = await Promise.all(queries)
        if (cancelled) return
        const merged = []
        results.forEach(r => {
          if (r.data?.success) {
            (r.data.subjects || []).forEach(s => {
              if (!merged.find(m => String(m._id) === String(s._id))) merged.push(s)
            })
          }
        })
        setAllSubjects(merged)
      } catch (e) {
        toast?.error?.('Could not load subjects: ' + (e?.response?.data?.message || e.message))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [pickedCurricula, toast])

  const toggleCurriculum = (c) => {
    setPickedCurricula(curr => curr.includes(c) ? curr.filter(x => x !== c) : [...curr, c])
  }
  const toggleSubject = (s) => {
    const id = String(s._id)
    setPickedSubjects(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  const filteredSubjects = allSubjects.filter(s => {
    if (!search.trim()) return true
    return s.subjectName.toLowerCase().includes(search.toLowerCase())
  })

  const save = async () => {
    if (pickedCurricula.length === 0) { toast?.error?.('Pick at least one curriculum.'); return }
    if (pickedSubjects.length === 0) { toast?.error?.('Pick at least one subject.'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/auth/me/teaching-specialties', {
        curricula: pickedCurricula,
        subjectIds: pickedSubjects,
      })
      if (data?.success) {
        toast?.ok?.(data.message || 'Specialties saved.')
        onSaved?.()
      } else {
        toast?.error?.(data?.message || 'Save failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not save specialties.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: BRAND.white, borderRadius: 12,
        maxWidth: 720, width: '100%', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        <div style={{
          padding: '18px 24px',
          background: `linear-gradient(135deg, ${BRAND.crimson} 0%, ${BRAND.crimsonD} 100%)`,
          color: BRAND.cream,
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#F0CC5A' }}>
            Settings
          </div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, marginTop: 2 }}>
            My Teaching Specialties
          </div>
          <div style={{ fontSize: 12.5, opacity: .85, marginTop: 4 }}>
            Pick the curricula and subjects you teach. We'll combine them into specialty pairs.
          </div>
        </div>
        <div style={{ padding: '20px 24px', overflow: 'auto', flex: 1 }}>
          {/* Step 1: Curricula */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Step 1 — Curricula you teach
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CURRICULA.map(c => {
                const picked = pickedCurricula.includes(c)
                return (
                  <button key={c} onClick={() => toggleCurriculum(c)}
                    style={{
                      background: picked ? BRAND.crimson : BRAND.white,
                      color: picked ? BRAND.white : BRAND.crimson,
                      border: `1.5px solid ${picked ? BRAND.crimson : BRAND.line}`,
                      padding: '7px 14px', borderRadius: 99,
                      cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    }}>
                    {picked ? '✓ ' : ''}{c}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Subjects */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Step 2 — Subjects you teach ({pickedSubjects.length} selected)
            </div>
            {pickedCurricula.length === 0 ? (
              <div style={{ padding: 18, background: BRAND.cream, borderRadius: 6, fontSize: 12.5, color: BRAND.inkMute, textAlign: 'center' }}>
                Pick at least one curriculum above to see available subjects.
              </div>
            ) : loading ? (
              <div style={{ padding: 18, fontSize: 12.5, color: BRAND.inkMute, textAlign: 'center' }}>
                Loading subjects...
              </div>
            ) : (
              <>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search subjects..."
                  style={{ ...inp, marginBottom: 8 }}
                />
                <div style={{
                  maxHeight: 280, overflowY: 'auto',
                  border: `1px solid ${BRAND.line}`, borderRadius: 6,
                  padding: 8,
                }}>
                  {filteredSubjects.length === 0 ? (
                    <div style={{ padding: 14, fontSize: 12.5, color: BRAND.inkMute, textAlign: 'center' }}>
                      No subjects match.
                    </div>
                  ) : (
                    filteredSubjects.map(s => {
                      const picked = pickedSubjects.includes(String(s._id))
                      return (
                        <div key={s._id}
                          onClick={() => toggleSubject(s)}
                          style={{
                            padding: '7px 10px', cursor: 'pointer',
                            background: picked ? BRAND.goldPale : 'transparent',
                            borderRadius: 4,
                            display: 'flex', alignItems: 'center', gap: 10,
                            marginBottom: 2,
                          }}>
                          <div style={{
                            width: 16, height: 16, borderRadius: 3,
                            border: `1.5px solid ${picked ? BRAND.crimson : BRAND.line}`,
                            background: picked ? BRAND.crimson : BRAND.white,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {picked && (
                              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={BRAND.white} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </div>
                          <div style={{ flex: 1, fontSize: 13, color: BRAND.ink }}>
                            <strong>{s.subjectName}</strong>{' '}
                            <span style={{ color: BRAND.inkMute, fontSize: 11.5 }}>
                              ({s.curriculum} &middot; {s.category})
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </>
            )}
          </div>

          {/* Preview */}
          {pickedCurricula.length > 0 && pickedSubjects.length > 0 && (
            <div style={{
              padding: 12, marginTop: 14,
              background: BRAND.goldPale, border: `1px solid ${BRAND.gold}`, borderRadius: 6,
              fontSize: 12, color: BRAND.crimson,
            }}>
              You'll have <strong>{pickedCurricula.length * pickedSubjects.length}</strong> specialty pair{pickedCurricula.length * pickedSubjects.length === 1 ? '' : 's'}
              {' '}({pickedSubjects.length} subjects × {pickedCurricula.length} curricula).
            </div>
          )}
        </div>
        <div style={{
          padding: '12px 24px',
          background: BRAND.cream, borderTop: `1px solid ${BRAND.line}`,
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose} disabled={saving}
            style={{
              background: BRAND.white, color: BRAND.crimson,
              border: `1.5px solid ${BRAND.line}`,
              padding: '9px 18px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            style={{
              background: saving ? '#9CA3AF' : BRAND.crimson, color: BRAND.white,
              border: 'none', padding: '9px 22px', borderRadius: 6,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
            }}>
            {saving ? 'Saving...' : 'Save Specialties'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════
const inp = {
  width: '100%', boxSizing: 'border-box',
  padding: '8px 12px', borderRadius: 6,
  border: `1.5px solid ${BRAND.line}`,
  fontSize: 13, fontFamily: 'inherit',
}

// ════════════════════════════════════════════════════════════
// MASTERY MATRIX — students × lessons grid; click a cell to
// toggle whether a student has mastered a lesson.
// ════════════════════════════════════════════════════════════
function MasteryMatrix({ subject, toast }) {
  const [loading, setLoading]   = useState(true)
  const [students, setStudents] = useState([])
  const [lessons, setLessons]   = useState([])
  const [mastery, setMastery]   = useState({})   // { studentId: { lessonId: true } }
  const [saving, setSaving]     = useState({})   // { 'sid:lid': true } while a toggle is in flight

  const load = useCallback(async () => {
    if (!subject?._id) return
    setLoading(true)
    try {
      const { data } = await api.get('/lesson-progress/teacher-roster/' + subject._id)
      if (data?.success) {
        setStudents(data.data?.students || [])
        setLessons(data.data?.lessons || [])
        // flatten masteryMap → { sid: { lid: true } }
        const flat = {}
        const mm = data.data?.masteryMap || {}
        Object.keys(mm).forEach(sid => {
          flat[sid] = {}
          Object.keys(mm[sid]).forEach(lid => { flat[sid][lid] = true })
        })
        setMastery(flat)
      } else {
        toast?.error?.(data?.message || 'Failed to load mastery roster.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not load mastery roster.')
    } finally {
      setLoading(false)
    }
  }, [subject, toast])

  useEffect(() => { load() }, [load])

  const toggleCell = async (studentId, lessonId) => {
    const key = studentId + ':' + lessonId
    if (saving[key]) return
    const currentlyMastered = !!mastery[studentId]?.[lessonId]
    const next = !currentlyMastered

    setSaving(s => ({ ...s, [key]: true }))
    // optimistic update
    setMastery(m => ({
      ...m,
      [studentId]: { ...(m[studentId] || {}), [lessonId]: next },
    }))

    try {
      const { data } = await api.post('/lesson-progress/toggle', {
        studentId, lessonId, mastered: next,
      })
      if (!data?.success) {
        // revert
        setMastery(m => ({
          ...m,
          [studentId]: { ...(m[studentId] || {}), [lessonId]: currentlyMastered },
        }))
        toast?.error?.(data?.message || 'Update failed.')
      }
    } catch (e) {
      setMastery(m => ({
        ...m,
        [studentId]: { ...(m[studentId] || {}), [lessonId]: currentlyMastered },
      }))
      toast?.error?.(e?.response?.data?.message || 'Update failed.')
    } finally {
      setSaving(s => { const c = { ...s }; delete c[key]; return c })
    }
  }

  const studentName = (s) => `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email || 'Student'
  const masteredCount = (sid) => lessons.reduce((n, l) => n + (mastery[sid]?.[l._id] ? 1 : 0), 0)

  if (loading) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 13, color: BRAND.inkMute, letterSpacing: '.1em' }}>
          LOADING MASTERY ROSTER...
        </div>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, color: BRAND.ink, marginBottom: 6 }}>
          No students allocated
        </div>
        <div style={{ fontSize: 13, color: BRAND.inkMute }}>
          No students are allocated to you for this subject yet. Mastery tracking appears once students are allocated.
        </div>
      </div>
    )
  }

  if (lessons.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, color: BRAND.ink, marginBottom: 6 }}>
          No lessons to track
        </div>
        <div style={{ fontSize: 13, color: BRAND.inkMute }}>
          Add lessons to this subject first — then mark which students have mastered each.
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BRAND.line || '#E8E2D6'}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.ink }}>
          Student Mastery
        </div>
        <div style={{ fontSize: 12, color: BRAND.inkMute, marginTop: 2 }}>
          Click a cell to mark a lesson mastered. This feeds each student's progress and the parent portal.
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 520 }}>
          <thead>
            <tr>
              <th style={{
                position: 'sticky', left: 0, zIndex: 2, background: BRAND.white,
                textAlign: 'left', padding: '10px 14px',
                fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em',
                textTransform: 'uppercase', color: BRAND.inkMute,
                borderBottom: `1px solid ${BRAND.line || '#E8E2D6'}`,
                minWidth: 160,
              }}>
                Student
              </th>
              {lessons.map(l => (
                <th key={l._id} title={l.title}
                  style={{
                    padding: '10px 6px', fontSize: 10, fontWeight: 700,
                    color: BRAND.inkMute,
                    borderBottom: `1px solid ${BRAND.line || '#E8E2D6'}`,
                    borderLeft: `1px solid ${BRAND.line || '#E8E2D6'}`,
                    minWidth: 46, maxWidth: 46,
                  }}>
                  <div style={{
                    writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                    margin: '0 auto', maxHeight: 90, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600,
                  }}>
                    {l.title}
                  </div>
                </th>
              ))}
              <th style={{
                padding: '10px 10px', fontSize: 10.5, fontWeight: 700,
                letterSpacing: '.06em', textTransform: 'uppercase', color: BRAND.inkMute,
                borderBottom: `1px solid ${BRAND.line || '#E8E2D6'}`,
                borderLeft: `1px solid ${BRAND.line || '#E8E2D6'}`,
              }}>
                Done
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => {
              const sid = String(s._id)
              const done = masteredCount(sid)
              return (
                <tr key={sid}>
                  <td style={{
                    position: 'sticky', left: 0, zIndex: 1, background: BRAND.white,
                    padding: '8px 14px', borderBottom: `1px solid ${BRAND.line || '#E8E2D6'}`,
                  }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: BRAND.ink }}>
                      {studentName(s)}
                    </div>
                    {s.admissionNumber && (
                      <div className="mono" style={{ fontSize: 10, color: BRAND.inkMute }}>
                        {s.admissionNumber}
                      </div>
                    )}
                  </td>
                  {lessons.map(l => {
                    const lid = String(l._id)
                    const on = !!mastery[sid]?.[lid]
                    const key = sid + ':' + lid
                    const busy = !!saving[key]
                    return (
                      <td key={lid}
                        onClick={() => toggleCell(sid, lid)}
                        style={{
                          textAlign: 'center', padding: 4,
                          borderBottom: `1px solid ${BRAND.line || '#E8E2D6'}`,
                          borderLeft: `1px solid ${BRAND.line || '#E8E2D6'}`,
                          cursor: busy ? 'wait' : 'pointer',
                        }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: 6, margin: '0 auto',
                          background: on ? '#15803D' : '#F3F1EC',
                          border: `1px solid ${on ? '#15803D' : (BRAND.line || '#E8E2D6')}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: busy ? 0.5 : 1, transition: 'all .12s',
                        }}>
                          {on && (
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                      </td>
                    )
                  })}
                  <td style={{
                    textAlign: 'center', padding: '8px 10px',
                    borderBottom: `1px solid ${BRAND.line || '#E8E2D6'}`,
                    borderLeft: `1px solid ${BRAND.line || '#E8E2D6'}`,
                  }}>
                    <span className="mono" style={{
                      fontSize: 12, fontWeight: 700,
                      color: done === 0 ? BRAND.inkMute : '#15803D',
                    }}>
                      {done}/{lessons.length}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Field({ label, children, wrap }) {
  return (
    <div style={{ marginBottom: 12, ...(wrap || {}) }}>
      <label style={{
        display: 'block', fontSize: 10.5, fontWeight: 700,
        letterSpacing: '.06em', textTransform: 'uppercase',
        color: BRAND.crimson, marginBottom: 4,
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}
