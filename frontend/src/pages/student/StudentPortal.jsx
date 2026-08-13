/**
 * StudentPortal.jsx — Individualised Learning System
 *
 * Every section reads live data from the API:
 *  - Mastery scores per topic (not hardcoded)
 *  - Practice questions matched to current difficulty
 *  - Mshauri AI receives the student's real mastery context
 *  - Dashboard rec
 ommends exactly what to study next
 *  - Study plan is personalised per student
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import BirthdayBanner from '../../components/BirthdayBanner.jsx'
import SuggestionBox from '../../components/SuggestionBox.jsx'
import { useAuth, useToast, api } from '../../context/ctx.jsx'
import { useStore } from '../../context/ctx.jsx'
import Modal from '../../components/ui/Modal.jsx'
import {
  NestedQuestionEditor,
  NestedQuestionRenderer,
  NestedAnswerCollector,
  AttachmentList,
  buildAnswersPayload,
  labelAt,
  sumLeafMarks,
} from '../../components/exam/NestedQuestion.jsx'
import LessonPlayerTab from './LessonPlayerTab.jsx'
import QuizGame from './QuizGame.jsx'
import AchievementTab from './AchievementTab.jsx'
import SubjectProgressCard from '../../components/SubjectProgressCard.jsx'
import LibraryViewer from '../../components/LibraryViewer.jsx'

// ── SVG icon helper ───────────────────────────────────────
const I = (d) => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    dangerouslySetInnerHTML={{__html: d}}/>
)

// ── Avatar ────────────────────────────────────────────────
function Av({init, col, size=36}) {
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:col+'20',color:col,
      display:'flex',alignItems:'center',justifyContent:'center',
      fontFamily:'JetBrains Mono,monospace',fontSize:Math.round(size*.32),
      fontWeight:700,flexShrink:0}}>
      {init}
    </div>
  )
}

// ── Mastery colour helper ─────────────────────────────────
const masteryCol = (pct) =>
  pct >= 80 ? 'var(--g600)' : pct >= 60 ? 'var(--b600)' : pct >= 40 ? 'var(--a600)' : 'var(--r500)'

const masteryLabel = (pct) =>
  pct >= 80 ? 'Mastered' : pct >= 60 ? 'Progressing' : pct >= 40 ? 'Building' : pct > 0 ? 'Needs Help' : 'Not Started'

// ── YouTube URL normalizer ────────────────────────────────
// Teachers paste any YouTube URL format. Convert to embed URL
// so the iframe plays inline instead of opening the YouTube app.
const toYouTubeEmbed = (url) => {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  // Already an embed URL
  if (/^https?:\/\/(www\.)?youtube\.com\/embed\//i.test(trimmed)) return trimmed

  let videoId = ''
  let m

  // youtu.be/VIDEOID
  m = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (m) videoId = m[1]

  // youtube.com/watch?v=VIDEOID
  if (!videoId) { m = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/); if (m) videoId = m[1] }

  // youtube.com/shorts/VIDEOID
  if (!videoId) { m = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/); if (m) videoId = m[1] }

  // youtube.com/live/VIDEOID
  if (!videoId) { m = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/); if (m) videoId = m[1] }

  // Raw 11-char video ID
  if (!videoId && /^[a-zA-Z0-9_-]{11}$/.test(trimmed)) videoId = trimmed

  if (!videoId) return ''
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
}
// ── Badge icon SVGs ───────────────────────────────────────
const BADGE_ICONS = {
  streak_7:    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#F97316" strokeWidth="2" strokeLinecap="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>,
  streak_30:   <svg width="16" height="16" fill="#F59E0B" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  xp_1000:     <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  xp_5000:     <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  master_subj: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 0 0 0 5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 1 0 5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  all_round:   <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
}

// ═════════════════════════════════════════════════════════
// PREMIUM DESIGN TOKENS — mirrors admin portal
// ═════════════════════════════════════════════════════════
const TOKENS = {
  // Brand — identical to admin portal
  crimson:      '#7D1025',
  crimsonDeep:  '#5A0B1B',
  crimsonLight: '#A51C2E',
  crimsonInk:   '#3F0612',
  gold:         '#C9A030',
  goldLight:    '#F0CC5A',
  goldPale:     '#FBF6E3',
  cream:        '#FBFAF5',
  creamDeep:    '#F5F1E8',
  // Neutrals — same scale as admin
  ink:          '#1A0F0E',
  inkSoft:      '#564844',
  inkMute:      '#857973',
  s900:         '#231715',
  s700:         '#564844',
  s500:         '#857973',
  s400:         '#A89E99',
  s300:         '#CFC7C2',
  s200:         '#E8E1DC',
  s100:         '#F4EFEB',
  s50:          '#FAF7F4',
  line:         '#E8E2D6',
  lineSoft:     '#F0EBE0',
  white:        '#FFFFFF',
  // Accents — same as admin portal
  accentTeal:    '#0F766E',
  accentEmerald: '#15803D',
  accentNavy:    '#1E3A8A',
  accentAmber:   '#B45309',
  accentPurple:  '#6B21A8',
  accentRose:    '#BE123C',
  accentSlate:   '#475569',
  // Legacy aliases
  blue:        '#2E5BFF',
  emerald:     '#0F9B6E',
  amber:       '#D97706',
  violet:      '#7C3AED',
  rose:        '#E11D48',
  teal:        '#0E7C7B',
  indigo:      '#3730A3',
  brown:       '#92400E',
}

// ── Premium section header (mirrors admin portal PSection) ──
function SSection({ tag, title, em, sub }) {
  return (
    <div style={{ marginBottom:20 }}>
      {tag && <div className="sec-tag">{tag}</div>}
      <h2 className="serif" style={{ fontSize:26, color:TOKENS.ink, margin:'4px 0 6px', lineHeight:1.15 }}>
        {title}{em && <em style={{ fontStyle:'italic', color:TOKENS.crimson }}> {em}</em>}
      </h2>
      {sub && <div style={{ fontSize:13, color:TOKENS.s500, lineHeight:1.55 }}>{sub}</div>}
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// APPLE-STYLE COLOURED NAV ICONS
// Each module renders as a 26×26 squircle tile with its own
// signature gradient and a white pictogram, like iOS Settings.
// ═════════════════════════════════════════════════════════

// Each module's signature colour pair (top → bottom of gradient)
const NAV_ICON_PALETTE = {
  dashboard:    ['#FF6B6B', '#EE5253'], // coral red
  curriculum:   ['#5E8CFF', '#3D6FE8'], // bright blue
  lessons:      ['#FF7B5C', '#F94E3F'], // tomato orange
  practice:     ['#7C3AED', '#5B21B6'], // violet
  homework:     ['#22C55E', '#15803D'], // green
  exams:        ['#D97706', '#B45309'], // amber
  results:      ['#C9A030', '#7D1025'], // gold to crimson — premium brand
  live:         ['#EF4444', '#B91C1C'], // signal red
  myroom:       ['#0EA5E9', '#0369A1'], // sky blue
  timetable:    ['#EC4899', '#BE185D'], // pink
  tutor:        ['#8B5CF6', '#6D28D9'], // royal purple
  studyplan:    ['#14B8A6', '#0F766E'], // teal
  resources:    ['#6366F1', '#4338CA'], // indigo
  profile:      ['#64748B', '#334155'], // slate
  achievements: ['#F59E0B', '#D97706'], // gold/amber
  subscription: ['#10B981', '#047857'], // emerald
}

const NavIcon = ({ name, active }) => {
  const [c1, c2] = NAV_ICON_PALETTE[name] || ['#94A3B8', '#475569']
  const size = 26
  const r = 7 // squircle-ish corner radius for 26px tile

  // The pictogram is rendered in pure white on top of the coloured tile.
  // Each path lives inside a 24×24 viewport.
  const renderGlyph = () => {
    switch (name) {
      case 'dashboard':
        return (
          <g fill="#fff">
            <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5"/>
            <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5"/>
            <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5"/>
            <rect x="13" y="13" width="7.5" height="7.5" rx="1.5"/>
          </g>
        )
      case 'curriculum': // open book
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 5.5C3.5 4.7 4.2 4 5 4h5.5c.6 0 1 .4 1 1v14c0-.6-.4-1-1-1H5c-.8 0-1.5-.7-1.5-1.5V5.5z" fill="#fff" fillOpacity=".25"/>
            <path d="M20.5 5.5c0-.8-.7-1.5-1.5-1.5h-5.5c-.6 0-1 .4-1 1v14c0-.6.4-1 1-1h5.5c.8 0 1.5-.7 1.5-1.5V5.5z" fill="#fff" fillOpacity=".25"/>
            <path d="M12 5v14"/>
            <path d="M16.5 4v6l1.8-1.2L20 10V4" fill="#fff"/>
          </g>
        )
      case 'lessons': // play triangle in rounded rect
        return (
          <g fill="#fff">
            <rect x="3" y="5" width="18" height="14" rx="2.5" fillOpacity=".25"/>
            <path d="M10 8.5v7l6-3.5-6-3.5z"/>
          </g>
        )
      case 'practice': // target with arrow
        return (
          <g>
            <circle cx="10" cy="14" r="6" fill="#fff" fillOpacity=".25"/>
            <circle cx="10" cy="14" r="3.5" fill="none" stroke="#fff" strokeWidth="1.8"/>
            <circle cx="10" cy="14" r="1.2" fill="#fff"/>
            <path d="M14 10l4-4M17 5l2 2M16 4l2 2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M14 10l-1.5-1.5L18 3l1.5 1.5L14 10z" fill="#fff"/>
          </g>
        )
      case 'homework': // clipboard with check
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="5" width="14" height="16" rx="2" fill="#fff" fillOpacity=".25"/>
            <rect x="8.5" y="3" width="7" height="4" rx="1" fill="#fff"/>
            <path d="M8 13.5l2.5 2.5 5-5"/>
          </g>
        )
      case 'exams': // shield with star
        return (
          <g>
            <path d="M12 3L4 6v6c0 4.5 3.5 8.5 8 9.5 4.5-1 8-5 8-9.5V6l-8-3z" fill="#fff" fillOpacity=".25" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M12 8.5l1.5 3 3.3.5-2.4 2.3.5 3.3L12 16l-2.9 1.6.5-3.3-2.4-2.3 3.3-.5L12 8.5z" fill="#fff"/>
          </g>
        )
      case 'results': // medal with ribbon — achievement/grades
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {/* Ribbon — two ends */}
            <path d="M8 3 L8 11 L12 9 L16 11 L16 3" fill="#fff" fillOpacity=".25"/>
            {/* Medal circle */}
            <circle cx="12" cy="15.5" r="5.5" fill="#fff" fillOpacity=".3" stroke="#fff" strokeWidth="1.6"/>
            {/* Star on medal */}
            <path d="M12 12.3 L13 14.4 L15.3 14.6 L13.6 16.1 L14.1 18.3 L12 17.1 L9.9 18.3 L10.4 16.1 L8.7 14.6 L11 14.4 Z"
              fill="#fff" stroke="none"/>
          </g>
        )
      case 'communication': // chat bubble with reply lines
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {/* Main bubble */}
            <path d="M4 5 Q4 3.5 5.5 3.5 L18.5 3.5 Q20 3.5 20 5 L20 14 Q20 15.5 18.5 15.5 L9 15.5 L5 19 L5 15.5 Q4 15.5 4 14 Z"
              fill="#fff" fillOpacity=".25"/>
            {/* Message lines */}
            <line x1="8" y1="7.5" x2="16" y2="7.5" strokeWidth="1.5"/>
            <line x1="8" y1="10" x2="14" y2="10" strokeWidth="1.5"/>
            <line x1="8" y1="12.5" x2="12" y2="12.5" strokeWidth="1.5"/>
          </g>
        )
      case 'live': // video camera
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="7" width="13" height="10" rx="2" fill="#fff" fillOpacity=".25"/>
            <path d="M16 10.5L21 7v10l-5-3.5z" fill="#fff"/>
            <circle cx="6.5" cy="10.5" r="1" fill="#fff" stroke="none"/>
          </g>
        )
      case 'myroom': // three people
        return (
          <g fill="#fff">
            <circle cx="8" cy="9" r="3" fillOpacity=".25"/>
            <circle cx="8" cy="9" r="3" fill="none" stroke="#fff" strokeWidth="1.6"/>
            <circle cx="16" cy="10" r="2.5" fillOpacity=".25"/>
            <circle cx="16" cy="10" r="2.5" fill="none" stroke="#fff" strokeWidth="1.6"/>
            <path d="M3 20c.6-3 2.6-5 5-5s4.4 2 5 5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M14 20c.4-2 1.8-3.5 3.5-3.5s3.1 1.5 3.5 3.5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
          </g>
        )
      case 'timetable': // calendar
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" fill="#fff" fillOpacity=".25"/>
            <path d="M3 10h18"/>
            <path d="M8 3v4M16 3v4"/>
            <circle cx="8.5" cy="14" r="1" fill="#fff" stroke="none"/>
            <circle cx="12" cy="14" r="1" fill="#fff" stroke="none"/>
            <circle cx="15.5" cy="14" r="1" fill="#fff" stroke="none"/>
            <circle cx="8.5" cy="17.5" r="1" fill="#fff" stroke="none"/>
            <circle cx="12" cy="17.5" r="1" fill="#fff" stroke="none"/>
          </g>
        )
      case 'attendance': // clipboard with check
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="4" width="14" height="17" rx="2" fill="#fff" fillOpacity=".25"/>
            <rect x="9" y="2" width="6" height="3" rx="1" fill="#fff" stroke="#fff" strokeWidth="1.6"/>
            <path d="M8.5 12.5l2 2 4-4.5"/>
          </g>
        )
      case 'tutor': // chat bubble with sparkle
        return (
          <g>
            <path d="M3 9a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v4a5 5 0 0 1-5 5h-5l-4 3v-3a5 5 0 0 1-4-5V9z" fill="#fff" fillOpacity=".25" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M12 7.5l.9 1.9 2 .3-1.5 1.4.4 2L12 12.2l-1.8 1 .4-2-1.5-1.4 2-.3L12 7.5z" fill="#fff"/>
          </g>
        )
      case 'studyplan': // calendar with checks
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" fill="#fff" fillOpacity=".25"/>
            <path d="M3 10h18M8 3v4M16 3v4"/>
            <path d="M7 14l1.5 1.5L11 13"/>
            <path d="M13 17l1.5 1.5L17 16"/>
          </g>
        )
      case 'resources': // stacked docs
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 4h7l4 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#fff" fillOpacity=".25"/>
            <path d="M14 4v4h4"/>
            <path d="M8.5 12h7M8.5 15h7M8.5 18h4"/>
          </g>
        )
      case 'library': // open book
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="#fff" fillOpacity=".25"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="#fff" fillOpacity=".25"/>
            <line x1="8" y1="7" x2="16" y2="7"/>
            <line x1="8" y1="11" x2="16" y2="11"/>
          </g>
        )
      case 'profile': // person
        return (
          <g>
            <circle cx="12" cy="8" r="3.8" fill="#fff" fillOpacity=".25" stroke="#fff" strokeWidth="1.8"/>
            <path d="M4.5 20c.6-4 3.8-6.5 7.5-6.5s6.9 2.5 7.5 6.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </g>
        )
      case 'achievements': // trophy
        return (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 4h10v5a5 5 0 0 1-5 5 5 5 0 0 1-5-5V4z" fill="#fff" fillOpacity=".25"/>
            <path d="M7 6H4v2a3 3 0 0 0 3 3"/>
            <path d="M17 6h3v2a3 3 0 0 1-3 3"/>
            <path d="M12 14v4M9 21h6M9.5 18h5l.5 3h-6l.5-3z" fill="#fff"/>
          </g>
        )
      default:
        return <circle cx="12" cy="12" r="4" fill="#fff"/>
    }
  }

  return (
    <div style={{
      width:size, height:size,
      borderRadius: r,
      background:`linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
      display:'flex', alignItems:'center', justifyContent:'center',
      flexShrink:0,
      boxShadow: active
        ? `0 4px 10px ${c2}55, inset 0 1px 0 rgba(255,255,255,.35)`
        : `0 1px 3px ${c2}40, inset 0 1px 0 rgba(255,255,255,.25)`,
      transition:'box-shadow .15s, transform .15s',
      transform: active ? 'scale(1.04)' : 'scale(1)',
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        {renderGlyph()}
      </svg>
    </div>
  )
}

// ── NAV SECTIONS ──────────────────────────────────────────
const NAV_SECTIONS = [
  { label:'Learning', items:[
    { id:'dashboard',    label:'Dashboard',       icon:'dashboard',    svg:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>' },
    { id:'curriculum',   label:'My Curriculum',   icon:'curriculum',   svg:'<path d="M4 19V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13"/><path d="M4 19a2 2 0 0 0 2 2h14"/><path d="M8 10h8M8 14h6"/>' },
    { id:'lessons',      label:'Lesson Player',   icon:'lessons',      svg:'<polygon points="5 3 19 12 5 21 5 3"/>' },
    { id:'quiz',         label:'Quiz Game',       icon:'quiz',         svg:'<path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'},
    { id:'homework',     label:'Homework',        icon:'homework',     svg:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>' },
    { id:'exams',        label:'Exams',           icon:'exams',        svg:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',  badge:'1' },
    { id:'results',      label:'My Results',      icon:'results',      svg:'<circle cx="12" cy="8" r="6"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>' },
    { id:'live',         label:'Live Classes',    icon:'live',         svg:'<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>', live:true },
    { id:'timetable',    label:'Timetable',       icon:'timetable',    svg:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
    { id:'attendance',   label:'My Attendance',   icon:'attendance',   svg:'<rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2" width="6" height="3" rx="1"/><path d="M8.5 12.5l2 2 4-4.5"/>' },
    { id:'library',      label:'Library',         icon:'library',      svg:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/>' },
  ]},
  { label:'Tools', items:[
    { id:'tutor',        label:'Mshauri AI',      icon:'tutor',        svg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
    { id:'communication', label:'Communication',  icon:'communication', svg:'<path d="M4 4h16v12H5.17L4 17.17V4z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="12" x2="13" y2="12"/>' },
  ]},
  { label:'Account', items:[
    { id:'profile',      label:'Profile',         icon:'profile',      svg:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
    { id:'achievements', label:'Achievements',    icon:'achievements', svg:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
  ]},
]

const TIMETABLE = [
  {day:'Mon',subj:'Mathematics',teacher:'Mr. Muthomi',time:'9:00–10:00 AM',status:'completed'},
  {day:'Mon',subj:'Biology',    teacher:'Dr. Ouma',   time:'2:00–3:00 PM', status:'completed'},
  {day:'Tue',subj:'English',   teacher:'Ms. Wambua', time:'10:00–11:00 AM',status:'completed'},
  {day:'Wed',subj:'Mathematics',teacher:'Mr. Muthomi',time:'9:00–10:00 AM',status:'live'},
  {day:'Wed',subj:'Chemistry', teacher:'Dr. Ouma',   time:'1:00–2:00 PM', status:'upcoming'},
  {day:'Thu',subj:'Physics',   teacher:'Mr. Njoroge',time:'11:00 AM–12 PM',status:'upcoming'},
  {day:'Fri',subj:'English',   teacher:'Ms. Wambua', time:'9:00–10:00 AM', status:'upcoming'},
]

// ─────────────────────────────────────────────────────────
// ── ADVISORY DASHBOARD ────────────────────────────────────
// Shown to Study Abroad and Pre-University students. These are
// advisory programmes — the full experience (application tracking,
// course pathways, counselling) is a separate build track. For now
// this is a clean, welcoming placeholder.
function AdvisoryDashboard({ programme, deliveryMode, firstName }) {
  const COPY = {
    'Study Abroad': {
      tag: 'Study Abroad Programme',
      blurb: 'Your dedicated advisor will guide you through every step of your study-abroad journey — university selection, applications, documentation, and visa support.',
      next: 'Your advisor will reach out shortly to begin your consultation. You can also contact the Smartious team any time at hellosmartious@gmail.com.',
    },
    'Pre-University': {
      tag: 'Pre-University Programme',
      blurb: 'A programme designed to keep you engaged and prepared for university — exploring career pathways, course options, and the units that map to them.',
      next: 'Your personalised pathway and course overview are being prepared. Your advisor will be in touch soon to plan your next steps.',
    },
  }
  const c = COPY[programme] || COPY['Study Abroad']

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{
        background: `linear-gradient(135deg, ${TOKENS.crimson} 0%, ${TOKENS.crimsonD || '#5A0B1B'} 100%)`,
        borderRadius: 14, padding: '30px 32px', color: '#FBFAF5',
        boxShadow: '0 12px 40px rgba(125,16,37,.20)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#F0CC5A' }}>
          {c.tag}{deliveryMode ? ` · ${deliveryMode}` : ''}
        </div>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 30, fontWeight: 400, margin: '8px 0 0', lineHeight: 1.15 }}>
          Welcome, {firstName}
        </h1>
        <p style={{ fontSize: 14, opacity: .9, marginTop: 8, lineHeight: 1.6 }}>
          {c.blurb}
        </p>
      </div>

      <div style={{
        marginTop: 16, background: '#fff',
        border: `1px solid ${TOKENS.line || '#E8E2D6'}`, borderRadius: 12,
        padding: '22px 24px',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          What happens next
        </div>
        <p style={{ fontSize: 13.5, color: TOKENS.ink || '#1A1A1A', lineHeight: 1.6, margin: 0 }}>
          {c.next}
        </p>
      </div>

      <div style={{
        marginTop: 12, padding: '14px 18px',
        background: TOKENS.goldPale || '#FBF6E3',
        border: `1px solid ${TOKENS.gold || '#C9A030'}`, borderRadius: 10,
        fontSize: 12.5, color: TOKENS.crimson, lineHeight: 1.5,
      }}>
        Your full programme dashboard is being prepared and will appear here soon.
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MOBILE SHELL — shared across Student, Teacher, Parent portals
// On mobile (<768px): bottom tab bar + full-width content
// On desktop: existing sidebar layout
// ═══════════════════════════════════════════════════════════

// Hook: detects mobile screen
function useIsMobile() {
  const [mobile, setMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  )
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

// Mobile top bar — shown instead of sidebar on mobile
function MobileTopBar({ title, eyebrow, onMenuToggle, menuOpen, user, initials }) {
  return (
    <div style={{
      position:'sticky', top:0, zIndex:100,
      background:'rgba(251,250,245,.96)',
      backdropFilter:'blur(16px)',
      WebkitBackdropFilter:'blur(16px)',
      borderBottom:'1px solid #F4EFEB',
      display:'flex', alignItems:'center',
      padding:'0 16px', height:56, gap:12,
      flexShrink:0,
    }}>
      <button onClick={onMenuToggle} style={{
        width:36, height:36, borderRadius:8,
        background:menuOpen?'#FBF6E3':'transparent',
        border:'none', cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        flexShrink:0,
      }}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={menuOpen?'#7D1025':'#564844'} strokeWidth="2" strokeLinecap="round">
          {menuOpen
            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
          }
        </svg>
      </button>
      <div style={{ flex:1, minWidth:0 }}>
        {eyebrow&&<div style={{ fontSize:9, fontWeight:700, color:'#7D1025', textTransform:'uppercase', letterSpacing:'.12em' }}>{eyebrow}</div>}
        <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:18, color:'#1A0F0E', lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{title}</div>
      </div>
      <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#7D1025,#5A0B1B)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'2px solid #C9A03030' }}>
        <span style={{ color:'#F0CC5A', fontSize:11, fontWeight:700 }}>{initials}</span>
      </div>
    </div>
  )
}

// Mobile drawer — slides in from left when menu is open
function MobileDrawer({ open, onClose, sections, page, setPage, portalLabel, user, initials, onLogout, children }) {
  if (!open) return null
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:200 }}/>
      {/* Drawer */}
      <div style={{
        position:'fixed', top:0, left:0, bottom:0, width:280,
        background:'#FBFAF5', zIndex:201, display:'flex', flexDirection:'column',
        overflowY:'auto', boxShadow:'4px 0 24px rgba(0,0,0,.12)',
        animation:'slideInLeft .2s ease',
      }}>
        <style>{`@keyframes slideInLeft{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
        {/* Logo */}
        <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid #F4EFEB' }}>
          <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:24, color:'#1A0F0E' }}>
            Smart<em style={{ fontStyle:'italic', color:'#7D1025' }}>ious</em>
          </div>
          <div style={{ fontSize:9.5, color:'#7D1025', fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', marginTop:3 }}>{portalLabel}</div>
        </div>

        {/* Nav sections */}
        <nav style={{ flex:1, padding:'12px 0' }}>
          {sections.map((s, si) => (
            <div key={si} style={{ marginBottom:16 }}>
              {s.section&&<div style={{ fontSize:10, fontWeight:700, color:'#7D1025', textTransform:'uppercase', letterSpacing:'.12em', padding:'0 20px 6px' }}>{s.section}</div>}
              {s.items.map(item => {
                const active = page === item.id
                return (
                  <div key={item.id} onClick={() => { setPage(item.id); onClose() }}
                    style={{ display:'flex', alignItems:'center', gap:14, padding:'11px 20px', cursor:'pointer', background:active?'#FBF6E3':'transparent', borderLeft:active?'3px solid #C9A030':'3px solid transparent', color:active?'#7D1025':'#564844', fontWeight:active?600:400, fontSize:15, transition:'all .15s' }}>
                    <div style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={active?'#7D1025':'#857973'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon||'M3 12h18M3 6h18M3 18h18'}/>
                      </svg>
                    </div>
                    <span>{item.label}</span>
                    {item.badge&&<span style={{ marginLeft:'auto', background:'#7D1025', color:'#fff', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99 }}>{item.badge}</span>}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Extra content (child selector etc) */}
        {children}

        {/* User card */}
        <div style={{ padding:'12px 16px', borderTop:'1px solid #F4EFEB' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#7D1025,#5A0B1B)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'#F0CC5A', fontSize:12, fontWeight:700 }}>{initials}</span>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#1A0F0E' }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize:11, color:'#857973' }}>{portalLabel?.replace(' Portal','')}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ width:'100%', padding:'10px', borderRadius:8, border:'1px solid #E8E2D6', background:'transparent', color:'#564844', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log out
          </button>
        </div>
      </div>
    </>
  )
}

// Mobile bottom tab bar — shows 4-5 most important tabs
function MobileBottomTabs({ tabs, page, setPage }) {
  return (
    <div style={{
      position:'fixed', bottom:0, left:0, right:0, zIndex:100,
      background:'rgba(251,250,245,.97)',
      backdropFilter:'blur(16px)',
      WebkitBackdropFilter:'blur(16px)',
      borderTop:'1px solid #E8E2D6',
      display:'flex',
      paddingBottom:'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(tab => {
        const active = page === tab.id
        return (
          <button key={tab.id} onClick={() => setPage(tab.id)} style={{
            flex:1, border:'none', background:'transparent', cursor:'pointer',
            padding:'8px 4px 10px', display:'flex', flexDirection:'column',
            alignItems:'center', gap:3, transition:'all .15s',
          }}>
            <div style={{ width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="22" height="22" fill={active?'#7D1025':'none'} viewBox="0 0 24 24"
                stroke={active?'#7D1025':'#9A9A9A'} strokeWidth={active?2:1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.icon||'M3 12h18'}/>
              </svg>
            </div>
            <span style={{ fontSize:9.5, fontWeight:active?700:500, color:active?'#7D1025':'#9A9A9A', letterSpacing:'.01em' }}>
              {tab.shortLabel||tab.label}
            </span>
            {active&&<div style={{ width:4, height:4, borderRadius:'50%', background:'#C9A030', marginTop:-2 }}/>}
          </button>
        )
      })}
    </div>
  )
}


export default function StudentPortal() {
  const { user, logout: ctxLogout } = useAuth()
  const toast    = useToast()
  const store    = useStore()

  // ── Programme ────────────────────────────────────────
  // Academic programmes (Homeschool, Tuition, IUFP) get the full
  // learning experience. Advisory programmes (Study Abroad,
  // Pre-University) get a focused placeholder dashboard for now —
  // their full experience is a separate build track.
  const programme = user?.programme || 'Homeschool'
  const deliveryMode = user?.deliveryMode || ''
  const ADVISORY_PROGRAMMES = ['Study Abroad', 'Pre-University']
  const isAdvisory = ADVISORY_PROGRAMMES.includes(programme)

  // ── Navigation ───────────────────────────────────────
  const [page,        setPage]        = useState('dashboard')
  const [collapsed,   setCollapsed]   = useState(false)

  // ── Notifications dropdown (header bell) ─────────────
  const [notifsOpen, setNotifsOpen] = useState(false)
  const [notifsList, setNotifsList] = useState([])
  const [notifsLastSeen, setNotifsLastSeen] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem('sm_notifs_last_seen') || '0', 10)
      return Number.isFinite(v) ? v : 0
    } catch { return 0 }
  })

  // ── Header avatar (display picture) ──────────────────
  // Sources, in order: user.avatar from the DB; localStorage avatar
  // (set by ProfileTab when the student uploads an image — currently
  // a base64 data-url, kept locally because there's no Cloudinary
  // pipeline for avatars yet). We watch localStorage so the header
  // updates instantly when the student saves a new avatar in their
  // profile, without needing a page reload.
  const [headerAvatar, setHeaderAvatar] = useState(() => {
    try {
      return user?.avatar || localStorage.getItem('sm_profile_avatar') || null
    } catch {
      return user?.avatar || null
    }
  })
  useEffect(() => {
    // If the user prop updates (e.g. /auth/me responds with avatar),
    // prefer that, falling back to localStorage.
    try {
      setHeaderAvatar(user?.avatar || localStorage.getItem('sm_profile_avatar') || null)
    } catch {
      setHeaderAvatar(user?.avatar || null)
    }
  }, [user?.avatar])
  useEffect(() => {
    // React to ProfileTab saves within the same tab. The 'storage'
    // event only fires across tabs, so we also poll briefly when
    // the student visits the profile page or returns from it.
    const onStorage = (e) => {
      if (e.key === 'sm_profile_avatar') {
        setHeaderAvatar(e.newValue || user?.avatar || null)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [user?.avatar])
  useEffect(() => {
    // When the student leaves the profile page, refresh from local
    // storage in case they just uploaded a new avatar (same-tab
    // localStorage writes don't fire the 'storage' event above).
    if (page !== 'profile') {
      try {
        const fresh = user?.avatar || localStorage.getItem('sm_profile_avatar') || null
        if (fresh !== headerAvatar) setHeaderAvatar(fresh)
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  // Advisory students may only visit dashboard / profile.
  // If they somehow land elsewhere, send them back to the dashboard.
  useEffect(() => {
    if (isAdvisory && !['dashboard', 'profile'].includes(page)) {
      setPage('dashboard')
    }
  }, [isAdvisory, page])

  // ── Mastery (from API) ───────────────────────────────
  const [mastery,       setMastery]       = useState(null)
  const [masteryLoading,setMasteryLoading] = useState(true)
  const [nextRec,       setNextRec]       = useState(null)

  // ── Adaptive practice (from API) ─────────────────────
  const [practiceData,  setPracticeData]  = useState(null)
  const [practiceLoading,setPracticeLoading] = useState(false)
  const [practiceAnswers,setPracticeAnswers] = useState({})
  const [practiceResult, setPracticeResult]  = useState(null)
  const [submitting,    setSubmitting]    = useState(false)

  // ── Lesson player ────────────────────────────────────
  const [lessonTab,   setLessonTab]   = useState('video')
  const [selectedSubj, setSelectedSubj] = useState(null)
  const [fcIdx,       setFcIdx]       = useState(0)
  const [fcFlipped,   setFcFlipped]   = useState(false)
  const [flashcards,  setFlashcards]  = useState([])

  // ── Curriculum view ─────────────────────────────────
  // Which subject card is expanded in the curriculum drawer (null = all collapsed)
  const [curriculumExpandedSubject, setCurriculumExpandedSubject] = useState(null)
  // Map of subjectName → [homework items], fetched once when curriculum is opened
  const [curriculumHwBySubject, setCurriculumHwBySubject] = useState(null)

  // Fetch the student's homework list the first time they open the curriculum
  // page, then group by subject for per-card counts. Refresh whenever the
  // student navigates back into curriculum so counts stay current.
  useEffect(() => {
    if (page !== 'curriculum') return
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/homework/student/list')
        if (cancelled) return
        const items = Array.isArray(data?.homework) ? data.homework
                    : Array.isArray(data)            ? data
                    : []
        const grouped = {}
        items.forEach(hw => {
          const subj = hw.subject || 'General'
          if (!grouped[subj]) grouped[subj] = []
          grouped[subj].push(hw)
        })
        setCurriculumHwBySubject(grouped)
      } catch (e) {
        // Non-fatal — cards just won't show homework counts
        if (!cancelled) setCurriculumHwBySubject({})
      }
    })()
    return () => { cancelled = true }
  }, [page])

  // ── Exams ────────────────────────────────────────────
  const [examActive,  setExamActive]  = useState(false)
  const [examAnswers, setExamAnswers] = useState({})
  const [examResult,  setExamResult]  = useState(null)
  const [examTime,    setExamTime]    = useState(3600)

  // ── Mshauri (mastery-aware) ──────────────────────────
  const [tutorMsgs,   setTutorMsgs]   = useState([
    {role:'ai', text:"Habari! I'm Mshauri, your personalised AI tutor. I can see your exact mastery levels and I'll always guide you to what needs the most attention. What would you like to work on today?"}
  ])
  const [tutorInp,    setTutorInp]    = useState('')
  const [aiLoading,   setAiLoading]   = useState(false)
  const [masteryCtx,  setMasteryCtx]  = useState('')

  // ── Study plan (from API) ────────────────────────────
  const [studyPlan,   setStudyPlan]   = useState([])
  const [planLoading, setPlanLoading] = useState(false)

  const chatEndRef = useRef(null)

  // ── LOAD MASTERY ON MOUNT ────────────────────────────
  useEffect(() => {
    loadMastery()
    loadMasteryContext()
    loadNotifications()
    // refresh notifications every 90s
    const id = setInterval(loadNotifications, 90000)
    return () => clearInterval(id)
  }, [])

  const loadMastery = async () => {
    try {
      setMasteryLoading(true)
      const { data } = await api.get('/mastery/me')
      if (data.success) {
        setMastery(data.mastery)
        setNextRec(data.nextRecommended)
      }
    } catch (e) {
      console.error('Mastery load error:', e.message)
    } finally {
      setMasteryLoading(false)
    }
  }

  const loadMasteryContext = async () => {
    try {
      const { data } = await api.get('/adaptive/mshauri-context')
      if (data.success) setMasteryCtx(data.context)
    } catch {}
  }

  // Aggregate notifications from existing data sources. There's no
  // dedicated /notifications endpoint, so we synthesize the bell's
  // feed from upcoming live classes, pending homework, recent results
  // and recent communication. Frontend-only — no backend changes.
  const loadNotifications = async () => {
    const items = []
    const now = Date.now()
    const dayMs = 86400000

    // 1) Upcoming live classes (next 24h)
    try {
      const { data } = await api.get('/liveclasses/student/upcoming')
      const upcoming = data?.classes || data?.data?.classes || []
      for (const c of upcoming.slice(0, 5)) {
        const when = new Date(c.scheduledAt || c.startTime).getTime()
        if (!Number.isFinite(when)) continue
        if (when - now > dayMs) continue
        items.push({
          id: 'live:' + c._id,
          ts: when,
          icon: 'live',
          title: c.title || 'Live class',
          subtitle: c.subjectName
            ? c.subjectName + ' · ' + timeUntil(when)
            : timeUntil(when),
          page: 'live',
        })
      }
    } catch {}

    // 2) Active homework with deadlines (next 7 days)
    try {
      const { data } = await api.get('/homework/student/me')
      const hws = data?.homework || data?.data?.homework || []
      for (const h of hws.slice(0, 6)) {
        if (h.status !== 'published') continue
        const due = h.dueDate ? new Date(h.dueDate).getTime() : null
        if (due && due < now) continue           // skip overdue (separate concern)
        if (due && due - now > 7 * dayMs) continue
        items.push({
          id: 'hw:' + h._id,
          ts: due || (now + dayMs),               // sort by due date
          icon: 'homework',
          title: h.title || 'Homework',
          subtitle: h.subjectName
            ? h.subjectName + (due ? ' · due ' + timeUntil(due) : '')
            : (due ? 'Due ' + timeUntil(due) : ''),
          page: 'homework',
        })
      }
    } catch {}

    // 3) Recently released results (last 7 days)
    try {
      const { data } = await api.get('/results/student/me')
      const results = data?.results || data?.data?.results || []
      for (const r of results.slice(0, 5)) {
        const when = new Date(r.releasedAt || r.gradedAt || r.createdAt || 0).getTime()
        if (!Number.isFinite(when) || when === 0) continue
        if (now - when > 7 * dayMs) continue
        items.push({
          id: 'res:' + (r._id || r.homeworkId || r.examId),
          ts: when,
          icon: 'results',
          title: r.title || (r.subjectName ? r.subjectName + ' result' : 'New result'),
          subtitle: (r.score !== undefined && r.outOf !== undefined)
            ? r.score + ' / ' + r.outOf + ' · ' + timeAgo(when)
            : timeAgo(when),
          page: 'results',
        })
      }
    } catch {}

    // Sort: most recent / soonest first
    items.sort((a, b) => {
      // Future events (live, homework due) ascending by ts
      // Past events (results) descending by ts
      const aFut = a.ts >= now
      const bFut = b.ts >= now
      if (aFut !== bFut) return aFut ? -1 : 1
      return aFut ? a.ts - b.ts : b.ts - a.ts
    })

    setNotifsList(items.slice(0, 8))
  }

  // ── LOAD ADAPTIVE PRACTICE ───────────────────────────
  const loadPractice = useCallback(async (subject, topic) => {
    try {
      setPracticeLoading(true)
      setPracticeResult(null)
      setPracticeAnswers({})
      const params = new URLSearchParams({ count: 5 })
      if (subject) params.set('subject', subject)
      if (topic)   params.set('topic', topic)
      const { data } = await api.get(`/adaptive/practice?${params}`)
      if (data.success) setPracticeData(data.practice)
    } catch (e) {
      toast.error('Could not load practice questions.')
    } finally {
      setPracticeLoading(false)
    }
  }, [toast])

  // ── LOAD FLASHCARDS ──────────────────────────────────
  const loadFlashcards = useCallback(async (topic) => {
    try {
      const params = topic ? `?topic=${encodeURIComponent(topic)}` : ''
      const { data } = await api.get(`/adaptive/flashcards${params}`)
      if (data.success) {
        setFlashcards(data.flashcards)
        setFcIdx(0)
        setFcFlipped(false)
      }
    } catch {}
  }, [])

  // ── LOAD STUDY PLAN ──────────────────────────────────
  const loadStudyPlan = useCallback(async () => {
    try {
      setPlanLoading(true)
      const { data } = await api.get('/adaptive/study-plan')
      if (data.success) setStudyPlan(data.plan)
    } catch {} finally {
      setPlanLoading(false)
    }
  }, [])

  // ── SUBMIT PRACTICE ──────────────────────────────────
  const submitPractice = async () => {
    if (!practiceData) return
    setSubmitting(true)
    const questions = practiceData.questions
    let correct = 0
    questions.forEach(q => {
      if (practiceAnswers[q.id] === q.correct) correct++
    })
    const score = Math.round((correct / questions.length) * 100)
    setPracticeResult({ correct, total: questions.length, score })

    // Update mastery
    try {
      const { data } = await api.post('/mastery/update', {
        subject:     practiceData.subject,
        topic:       practiceData.topic,
        score,
        sessionType: 'practice',
        timeMins:    8,
      })
      if (data.success) {
        toast.ok(`+${data.xpEarned} XP earned! Mastery updated.`)
        if (data.newBadges?.length) {
          toast.ok(`New badge unlocked: ${data.newBadges[0].name}`)
        }
        // Refresh mastery data
        loadMastery()
        loadMasteryContext()
      }
    } catch {}
    setSubmitting(false)
  }

  // ── EXAM (static bank, scores to API) ────────────────
  const EXAM_QS = [
    {id:1,q:'In a right-angled triangle with legs 3 cm and 4 cm, the hypotenuse is:',opts:['5 cm','7 cm','6 cm','4.5 cm'],ans:'5 cm',marks:5},
    {id:2,q:'If c = 13 and a = 5 in a right-angled triangle, b equals:',opts:['12','10','8','11'],ans:'12',marks:5},
    {id:3,q:'Which set forms a Pythagorean triple?',opts:['3,4,5','2,3,4','4,5,6','1,2,3'],ans:'3,4,5',marks:5},
    {id:4,q:'The area of a right-angled triangle with legs 6 and 8 is:',opts:['24 cm²','48 cm²','14 cm²','28 cm²'],ans:'24 cm²',marks:5},
  ]
  useEffect(() => {
    if (!examActive || examResult) return
    const id = setInterval(() => setExamTime(t => { if(t<=1){clearInterval(id);return 0} return t-1 }), 1000)
    return () => clearInterval(id)
  }, [examActive, examResult])

  const submitExam = async () => {
    const correct = EXAM_QS.filter(q => examAnswers[q.id] === q.ans).length
    const score   = Math.round((correct / EXAM_QS.length) * 100)
    setExamResult({ correct, score, total: EXAM_QS.length * 5, pct: score })
    try {
      await api.post('/mastery/update', { subject:'Mathematics', topic:'Pythagoras & Geometry', score, sessionType:'exam', timeMins:20 })
      loadMastery()
    } catch {}
  }
  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  // ── MSHAURI (mastery-aware) ──────────────────────────
  const sendTutor = async () => {
    if (!tutorInp.trim() || aiLoading) return
    const q = tutorInp.trim()
    setTutorInp('')
    setAiLoading(true)
    setTutorMsgs(m => [...m, {role:'user', text:q}])
    try {
      const { data } = await api.post('/auth/mshauri', {
        message: q,
        masteryContext: masteryCtx,
      })
      setTutorMsgs(m => [...m, {role:'ai', text: data.reply || 'Let me think about that...'}])
    } catch {
      setTutorMsgs(m => [...m, {role:'ai', text:"I'm having trouble connecting right now. Please try again in a moment."}])
    }
    setAiLoading(false)
    setTimeout(() => chatEndRef.current?.scrollIntoView({behavior:'smooth'}), 80)
  }

  // ── Navigate and trigger loads ───────────────────────
  const goTo = (id) => {
    setPage(id)
    if (id === 'practice' && !practiceData) loadPractice()
    if (id === 'studyplan')                  loadStudyPlan()
    if (id === 'lessons' && flashcards.length === 0) loadFlashcards(nextRec?.topic)
  }

  const firstName = user?.firstName || 'Student'
  const initials  = user ? `${user.firstName[0]}${user.lastName[0]}` : 'ST'
  const subjects  = mastery?.subjects || []

  // ─────────────────────────────────────────────────────
  // Title for the current page (used in top-bar)
  const pageTitle =
    page === 'dashboard'    ? `Welcome back, ${firstName}` :
    page === 'practice'     ? (practiceData ? `Adaptive Practice — ${practiceData.topic}` : 'Adaptive Practice') :
    page === 'homework'     ? 'Homework' :
    page === 'tutor'        ? 'Mshauri AI Tutor' :
    page === 'studyplan'    ? 'My Personalised Study Plan' :
    page === 'curriculum'   ? 'My Curriculum' :
    page === 'lessons'      ? 'Lesson Player' :
    page === 'exams'        ? 'Exams' :
    page === 'results'      ? 'My Results' :
    page === 'live'         ? 'Live Classes' :
    page === 'timetable'    ? 'Timetable' :
    page === 'attendance'   ? 'Attendance & Check-in' :
    page === 'library'      ? 'Library' :
    page === 'resources'    ? 'Resources' :
    page === 'profile'      ? 'My Profile' :
    page === 'achievements' ? 'Achievements' :
    'Portal'

  const programmeLine = (() => {
    const p = user?.programme || 'Homeschool'
    const mode = user?.deliveryMode ? ` (${user.deliveryMode})` : ''
    const curr = (typeof user?.curriculum === 'string' && user.curriculum) ? ` · ${user.curriculum}` : ''
    return `${p}${mode}${curr}`
  })()

  const pageEyebrow =
    page === 'dashboard'    ? programmeLine :
    page === 'practice'     ? 'Adaptive learning' :
    page === 'homework'     ? 'Assignments' :
    page === 'tutor'        ? 'AI companion' :
    page === 'studyplan'    ? 'Personalised plan' :
    page === 'curriculum'   ? 'Programme map' :
    page === 'lessons'      ? 'Recorded lessons' :
    page === 'exams'        ? 'Assessments' :
    page === 'results'      ? 'Grades & feedback' :
    page === 'live'         ? 'Scheduled sessions' :
    page === 'timetable'    ? 'Weekly schedule' :
    page === 'attendance'   ? 'Mark today and view your history' :
    page === 'library'      ? 'Coursebook PDFs' :
    page === 'resources'    ? 'Learning library' :
    page === 'profile'      ? 'Account details' :
    page === 'achievements' ? 'Badges & milestones' :
    ''

  const sidebarWidth = collapsed ? 76 : 240

  return (
    <div className="app" style={{
      // Override any global .app { display:flex; height:100vh; overflow:hidden }
      // that the original chrome assumed. We need block layout + natural scroll.
      display:'block',
      position:'relative',
      width:'100%',
      minHeight:'100vh',
      height:'auto',
      overflow:'visible',
      background:TOKENS.cream,
      fontFamily:'Inter,-apple-system,BlinkMacSystemFont,sans-serif',
      color:TOKENS.ink,
    }}>

      {/* ═══════════════════════════════════════════════
          PREMIUM SIDEBAR — cream w/ gold rail on active
          ═══════════════════════════════════════════════ */}
      <aside style={{
        position:'fixed',
        top:0, left:0, bottom:0,
        width:sidebarWidth,
        background:TOKENS.cream,
        borderRight:`1px solid ${TOKENS.line}`,
        display:'flex',
        flexDirection:'column',
        zIndex:50,
        transition:'width .25s cubic-bezier(.22,.61,.36,1)',
        overflow:'visible',
      }}>
        {/* Logo block */}
        <div style={{
          flexShrink:0,
          padding: collapsed ? '20px 0' : '20px 22px',
          display:'flex',
          alignItems:'center',
          gap:12,
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom:`1px solid ${TOKENS.lineSoft}`,
          minHeight:72,
        }}>
          <div style={{
            width:42, height:46,
            display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0,
          }}>
            {/* Smartious shield mark — crimson shield with gold star above
                an open book. Matches the official brand mark. */}
            <svg viewBox="0 0 64 72" width="38" height="42" xmlns="http://www.w3.org/2000/svg">
              {/* Gold outer trim */}
              <path d="M4 4 L60 4 L60 44 Q60 56 32 68 Q4 56 4 44 Z" fill="#C9A030"/>
              {/* Crimson shield body */}
              <path d="M7 7 L57 7 L57 44 Q57 54 32 65 Q7 54 7 44 Z" fill="#7D1025"/>
              {/* Inner gold pinstripe */}
              <path d="M11 11 L53 11 L53 44 Q53 52 32 61 Q11 52 11 44 Z"
                fill="none" stroke="#C9A030" strokeWidth="0.5" opacity="0.4"/>
              {/* Gold star */}
              <polygon points="32,16 33.6,20.8 38.7,20.8 34.6,23.8 36.2,28.6 32,25.6 27.8,28.6 29.4,23.8 25.3,20.8 30.4,20.8"
                fill="#C9A030"/>
              {/* Open book — white pages */}
              <path d="M16 36 Q24 32 32 34 L32 52 Q24 50 16 54 Z" fill="#FFFFFF"/>
              <path d="M48 36 Q40 32 32 34 L32 52 Q40 50 48 54 Z" fill="#FFFFFF"/>
              {/* Book spine */}
              <line x1="32" y1="34" x2="32" y2="52" stroke="#E8D58F" strokeWidth="0.5"/>
              {/* Text lines on pages */}
              <line x1="20" y1="40" x2="29" y2="39" stroke="#E8D58F" strokeWidth="0.7" strokeLinecap="round"/>
              <line x1="20" y1="43" x2="29" y2="42" stroke="#E8D58F" strokeWidth="0.7" strokeLinecap="round"/>
              <line x1="20" y1="46" x2="29" y2="45" stroke="#E8D58F" strokeWidth="0.7" strokeLinecap="round"/>
              <line x1="35" y1="39" x2="44" y2="40" stroke="#E8D58F" strokeWidth="0.7" strokeLinecap="round"/>
              <line x1="35" y1="42" x2="44" y2="43" stroke="#E8D58F" strokeWidth="0.7" strokeLinecap="round"/>
              <line x1="35" y1="45" x2="44" y2="46" stroke="#E8D58F" strokeWidth="0.7" strokeLinecap="round"/>
            </svg>
          </div>
          {!collapsed && (
            <div style={{minWidth:0}}>
              <div style={{
                fontFamily:'Instrument Serif,Georgia,serif',
                fontSize:22, fontWeight:400,
                color:TOKENS.ink, lineHeight:1,
              }}>
                Smart<span style={{fontStyle:'italic', color:TOKENS.crimson}}>ious</span>
              </div>
              <div style={{
                fontSize:9.5, color:TOKENS.crimson,
                letterSpacing:'.14em', textTransform:'uppercase',
                marginTop:4, fontWeight:700,
                fontFamily:'Inter,-apple-system,sans-serif',
              }}>
                Student Portal
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            position:'absolute',
            top:24, right:-13,
            width:26, height:26,
            borderRadius:'50%',
            background:TOKENS.white,
            border:`1px solid ${TOKENS.line}`,
            boxShadow:'0 2px 8px rgba(0,0,0,.06)',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', zIndex:60,
            transition:'all .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = TOKENS.gold; e.currentTarget.style.boxShadow = `0 2px 10px ${TOKENS.gold}40` }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = TOKENS.line; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.06)' }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={TOKENS.inkSoft} strokeWidth="2.5" strokeLinecap="round"
            style={{transform:collapsed?'rotate(180deg)':'none',transition:'transform .25s'}}>
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        {/* Nav */}
        <nav style={{
          flex:1,
          minHeight:0,   // critical: lets flex child shrink below content height so overflow can scroll
          paddingTop:14,
          paddingBottom:14,
          overflowY:'auto',
          overflowX:'hidden',
          scrollbarWidth:'thin',
          scrollbarColor:`${TOKENS.line} transparent`,
        }}>
          {NAV_SECTIONS.map((sec, si) => (
            <div key={si} style={{marginBottom:18}}>
              {!collapsed && (
                <div style={{
                  fontSize:10, fontWeight:700,
                  color:TOKENS.crimson,
                  letterSpacing:'.14em', textTransform:'uppercase',
                  padding:'0 22px 8px',
                }}>
                  {sec.label}
                </div>
              )}
              {sec.items
                .filter(item => !isAdvisory || ['dashboard', 'profile'].includes(item.id))
                .map(item => {
                  const active = page === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => goTo(item.id)}
                      title={collapsed ? item.label : undefined}
                      style={{
                        position:'relative',
                        display:'flex',
                        alignItems:'center',
                        gap: collapsed ? 0 : 12,
                        padding: collapsed ? '11px 0' : '10px 22px',
                        margin: collapsed ? '2px 12px' : '2px 12px',
                        borderRadius:8,
                        cursor:'pointer',
                        background: active ? '#FBF6E3' : 'transparent',
                        color: active ? TOKENS.crimson : TOKENS.s700,
                        fontWeight: active ? 600 : 500,
                        fontSize:13.5,
                        transition:'background .15s, color .15s',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = TOKENS.lineSoft }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                    >
                      {/* Active gold rail */}
                      {active && !collapsed && (
                        <div style={{
                          position:'absolute',
                          left:-12, top:8, bottom:8,
                          width:3, borderRadius:'0 3px 3px 0',
                          background:TOKENS.gold,
                          boxShadow:`0 0 8px ${TOKENS.gold}60`,
                        }}/>
                      )}
                      <div style={{
                        width:26, height:26,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        flexShrink:0,
                      }}>
                        <NavIcon name={item.icon} active={active}/>
                      </div>
                      {!collapsed && (
                        <>
                          <span style={{flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span style={{
                              background:TOKENS.crimson, color:TOKENS.white,
                              fontSize:10, fontWeight:700,
                              padding:'2px 7px', borderRadius:10,
                              fontFamily:'JetBrains Mono,monospace',
                            }}>
                              {item.badge}
                            </span>
                          )}
                          {item.live && (
                            <span style={{display:'flex', alignItems:'center', gap:4}}>
                              <span style={{
                                width:6, height:6, borderRadius:'50%',
                                background:'#22C55E',
                                boxShadow:'0 0 0 0 #22C55E',
                                animation:'pulseDot 1.5s ease-out infinite',
                              }}/>
                            </span>
                          )}
                        </>
                      )}
                      {collapsed && item.badge && (
                        <span style={{
                          position:'absolute', top:6, right:6,
                          width:7, height:7, borderRadius:'50%',
                          background:TOKENS.crimson,
                        }}/>
                      )}
                    </div>
                  )
                })}
            </div>
          ))}
        </nav>

        {/* User card */}
        <div style={{
          flexShrink:0,
          padding: collapsed ? '12px 0 0' : '12px 14px 0',
          borderTop:`1px solid ${TOKENS.lineSoft}`,
        }}>
          <div style={{
            display:'flex',
            alignItems:'center',
            gap:10,
            padding: collapsed ? '8px 0' : '8px 8px',
            borderRadius:10,
            background:TOKENS.cream,
            border:`1px solid ${TOKENS.line}`,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <div style={{
              width:34, height:34, borderRadius:'50%',
              background:`linear-gradient(135deg, ${TOKENS.crimson}, ${TOKENS.crimsonDeep})`,
              color:'#F0CC5A',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'JetBrains Mono,monospace',
              fontSize:11, fontWeight:700, flexShrink:0,
            }}>
              {initials}
            </div>
            {!collapsed && (
              <div style={{minWidth:0, flex:1}}>
                <div style={{
                  fontSize:12.5, fontWeight:700, color:TOKENS.ink,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{
                  fontSize:10.5, color:TOKENS.s500,
                  fontFamily:'JetBrains Mono,monospace',
                  marginTop:2,
                }}>
                  {user?.grade || 'IGCSE'} · {mastery ? mastery.xp.toLocaleString() + ' XP' : '...'}
                </div>
              </div>
            )}
          </div>

          {/* Back to website */}
          <div
            onClick={() => window.location.href='/'}
            style={{
              marginTop:8,
              padding: collapsed ? '10px 0' : '10px 12px',
              borderRadius:8,
              cursor:'pointer',
              display:'flex',
              alignItems:'center',
              gap: collapsed ? 0 : 10,
              fontSize:12,
              color:TOKENS.inkMute,
              fontWeight:500,
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition:'background .15s, color .15s',
              marginBottom:10,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = TOKENS.lineSoft; e.currentTarget.style.color = TOKENS.crimson }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TOKENS.inkMute }}
            title={collapsed ? 'Back to Website' : undefined}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            {!collapsed && <span>Back to Website</span>}
          </div>
        </div>

        {/* Inline keyframes for live dot pulse */}
        <style>{`
          @keyframes pulseDot {
            0% { box-shadow: 0 0 0 0 rgba(34,197,94,.5); }
            70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
            100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </aside>

      {/* ═══════════════════════════════════════════════
          MAIN — frosted top-bar + content
          ═══════════════════════════════════════════════ */}
      <main style={{
        display:'block',
        marginLeft: sidebarWidth,
        width: `calc(100% - ${sidebarWidth}px)`,
        minHeight:'100vh',
        height:'auto',
        overflow:'visible',
        transition:'margin-left .25s cubic-bezier(.22,.61,.36,1), width .25s cubic-bezier(.22,.61,.36,1)',
        background:TOKENS.cream,
        position:'relative',
      }}>
        <div style={{ padding:'16px 24px 0' }}><BirthdayBanner /><SuggestionBox /></div>
        {/* Frosted top-bar — matches admin portal */}
        <div style={{
          position:'sticky',
          top:0, zIndex:30,
          background:'rgba(251,250,245,.9)',
          backdropFilter:'saturate(180%) blur(20px)',
          WebkitBackdropFilter:'saturate(180%) blur(20px)',
          borderBottom:`1px solid ${TOKENS.s100}`,
          padding:'13px 28px',
          display:'flex',
          alignItems:'center',
          gap:20,
          minHeight:76,
        }}>
          <div style={{flex:1, minWidth:0}}>
            {pageEyebrow && (
              <div style={{
                fontSize:10, fontWeight:700,
                color:TOKENS.crimson,
                letterSpacing:'.14em', textTransform:'uppercase',
                marginBottom:3,
              }}>
                {pageEyebrow}
              </div>
            )}
            <div style={{
              fontFamily:"'Instrument Serif',Georgia,serif",
              fontSize:22, fontWeight:400,
              color:TOKENS.ink, lineHeight:1.2,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
            }}>
              {pageTitle}
            </div>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:10}}>
            {nextRec && (
              <div style={{
                display:'inline-flex', alignItems:'center', gap:6,
                padding:'7px 12px',
                background:TOKENS.goldPale,
                border:`1px solid ${TOKENS.gold}30`,
                borderRadius:999,
                fontSize:11.5, fontWeight:600,
                color:TOKENS.crimsonDeep,
              }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={TOKENS.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <span style={{color:TOKENS.inkMute, fontWeight:500}}>Focus:</span>
                <span>{nextRec.topic}</span>
              </div>
            )}
            {/* Notification bell — aggregates upcoming live classes,
                homework deadlines, and recent results. Frontend-only
                aggregation from existing endpoints. */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setNotifsOpen(v => !v)
                  // Mark as seen when opened
                  if (!notifsOpen) {
                    const stamp = Date.now()
                    setNotifsLastSeen(stamp)
                    try { localStorage.setItem('sm_notifs_last_seen', String(stamp)) } catch {}
                  }
                }}
                title="Notifications"
                style={{
                  position: 'relative',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36,
                  background: TOKENS.cream,
                  border: `1px solid ${TOKENS.line}`,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'background .15s, border-color .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = TOKENS.goldPale; e.currentTarget.style.borderColor = TOKENS.gold + '60' }}
                onMouseLeave={e => { e.currentTarget.style.background = TOKENS.cream; e.currentTarget.style.borderColor = TOKENS.line }}
              >
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke={TOKENS.crimsonDeep} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {/* Unread badge — counts items with ts > last-seen */}
                {(() => {
                  const unread = notifsList.filter(n => n.ts > notifsLastSeen).length
                  if (unread === 0) return null
                  return (
                    <span style={{
                      position: 'absolute', top: -2, right: -2,
                      minWidth: 17, height: 17, padding: '0 4px',
                      background: TOKENS.crimson, color: '#fff',
                      borderRadius: 99,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 800,
                      border: '2px solid #fff',
                      boxSizing: 'content-box',
                    }}>{unread > 9 ? '9+' : unread}</span>
                  )
                })()}
              </button>
              {notifsOpen && (
                <>
                  {/* Click-outside catcher */}
                  <div onClick={() => setNotifsOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}/>
                  {/* Dropdown panel */}
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 320, maxWidth: 'calc(100vw - 32px)',
                    background: '#fff',
                    border: `1px solid ${TOKENS.line}`,
                    borderRadius: 10,
                    boxShadow: '0 10px 30px rgba(0,0,0,.12)',
                    zIndex: 100, overflow: 'hidden',
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: `1px solid ${TOKENS.line}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div style={{
                        fontSize: 11, fontWeight: 800,
                        letterSpacing: '.1em', textTransform: 'uppercase',
                        color: TOKENS.crimsonDeep,
                      }}>Notifications</div>
                      {notifsList.length > 0 && (
                        <div style={{ fontSize: 11, color: TOKENS.inkMute }}>
                          {notifsList.length} item{notifsList.length === 1 ? '' : 's'}
                        </div>
                      )}
                    </div>
                    {notifsList.length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', color: TOKENS.inkMute, fontSize: 12.5 }}>
                        Nothing new right now. Check back later for class reminders, homework deadlines, and new results.
                      </div>
                    ) : (
                      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                        {notifsList.map(n => (
                          <div key={n.id}
                            onClick={() => {
                              setNotifsOpen(false)
                              if (n.page) goTo(n.page)
                            }}
                            style={{
                              padding: '11px 16px',
                              borderBottom: `1px solid ${TOKENS.line}`,
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'flex-start', gap: 10,
                              transition: 'background .12s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = TOKENS.goldPale}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                          >
                            {/* Type dot */}
                            <div style={{
                              width: 8, height: 8, borderRadius: '50%',
                              marginTop: 6, flexShrink: 0,
                              background: n.icon === 'live' ? '#B91C1C'
                                : n.icon === 'homework' ? TOKENS.gold
                                : n.icon === 'results' ? '#15803D'
                                : TOKENS.inkMute,
                            }}/>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: 13, fontWeight: 600, color: TOKENS.ink,
                                lineHeight: 1.3, marginBottom: 2,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>{n.title}</div>
                              <div style={{ fontSize: 11.5, color: TOKENS.inkMute, lineHeight: 1.4 }}>
                                {n.subtitle}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Logout button — calls auth context's logout if available,
                falls back to clearing local auth state + redirecting. */}
            <button
              onClick={() => {
                if (!window.confirm('Log out of your account?')) return
                try {
                  if (typeof ctxLogout === 'function') {
                    ctxLogout()
                    return
                  }
                } catch {}
                // Fallback — clear local auth + redirect
                try {
                  localStorage.removeItem('sm_token')
                  localStorage.removeItem('sm_user')
                } catch {}
                window.location.href = '/'
              }}
              title="Log out"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: '50%',
                background: TOKENS.cream,
                border: `1px solid ${TOKENS.line}`,
                cursor: 'pointer',
                transition: 'background .15s, border-color .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = TOKENS.goldPale; e.currentTarget.style.borderColor = TOKENS.gold + '60' }}
              onMouseLeave={e => { e.currentTarget.style.background = TOKENS.cream; e.currentTarget.style.borderColor = TOKENS.line }}
            >
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke={TOKENS.crimsonDeep} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>

            {/* Student avatar (display picture) — opens profile when clicked */}
            <button
              onClick={() => goTo('profile')}
              title="My profile"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: '50%',
                background: headerAvatar
                  ? 'transparent'
                  : `linear-gradient(135deg, ${TOKENS.crimson}, ${TOKENS.crimsonDeep})`,
                color: TOKENS.goldLight,
                border: `2px solid ${TOKENS.gold}`,
                cursor: 'pointer',
                fontSize: 13, fontWeight: 800,
                fontFamily: 'Instrument Serif,Georgia,serif',
                overflow: 'hidden', flexShrink: 0,
                padding: 0,
                boxShadow: `0 2px 6px ${TOKENS.crimson}30`,
                transition: 'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = `0 4px 10px ${TOKENS.crimson}45` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 2px 6px ${TOKENS.crimson}30` }}
            >
              {headerAvatar ? (
                <img src={headerAvatar} alt={user?.firstName || 'Profile'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              ) : (
                initials
              )}
            </button>
          </div>
        </div>

        <div className="content" style={{
          display:'block',
          width:'100%',
          minHeight:'calc(100vh - 76px)',
          height:'auto',
          overflow:'visible',
          animation:'fadeIn .25s ease',
          padding:'24px 32px 48px',
          boxSizing:'border-box',
        }}>
          

          {/* ════════════════════════════════════════════
              CURRICULUM — topic-by-topic mastery grid
          ════════════════════════════════════════════ */}
          {/* ════════════════════════════════════════════
              CURRICULUM — real enrolment data + subject cards
              Reads user.curriculum / user.gradeLevel / user.subjects
              from the backend (no hardcoded fallback list).
              Each subject renders as an image card; click expands a
              drawer with per-subject lessons / homework / exam counts.
          ════════════════════════════════════════════ */}
          {page === 'curriculum' && (() => {
            // ── 1. Read real enrolment from the user record ──
            const enrolledCurriculum = user?.curriculum || ''
            const enrolledGrade      = user?.gradeLevel || user?.grade || ''
            // user.subjects is the canonical source per the User model
            // (string array, e.g. ['Mathematics','Physics','Chemistry'])
            const enrolledSubjects   = Array.isArray(user?.subjects)
              ? user.subjects.filter(Boolean)
              : []

            // Curriculum metadata (display name, org, description) from store
            const curriculumInfo = store.curricula?.find(c =>
              c.name === enrolledCurriculum ||
              c.name?.toLowerCase() === enrolledCurriculum?.toLowerCase()
            )
            const curriculumDisplay = curriculumInfo?.name || enrolledCurriculum

            // ── 2. Curated subject image library (Unsplash) ──
            // Long-term: replace these with Cloudinary URLs stored against
            // a Subject document. For now, fixed defaults per common subject.
            const SUBJECT_IMAGES = {
              'Mathematics':       'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
              'Maths':             'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
              'Further Mathematics':'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=450&fit=crop',
              'Physics':           'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=450&fit=crop',
              'Chemistry':         'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=800&h=450&fit=crop',
              'Biology':           'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=450&fit=crop',
              'English':           'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=450&fit=crop',
              'English Language':  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=450&fit=crop',
              'English Literature':'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=800&h=450&fit=crop',
              'Literature':        'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=800&h=450&fit=crop',
              'History':           'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&h=450&fit=crop',
              'Geography':         'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=450&fit=crop',
              'Computer Science':  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
              'ICT':               'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
              'Business Studies':  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=450&fit=crop',
              'Business':          'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=450&fit=crop',
              'Economics':         'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
              'Accounting':        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop',
              'Art':               'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=450&fit=crop',
              'Art & Design':      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=450&fit=crop',
              'Visual Arts':       'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=450&fit=crop',
              'Music':             'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=450&fit=crop',
              'French':            'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=450&fit=crop',
              'Spanish':           'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&h=450&fit=crop',
              'Kiswahili':         'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&h=450&fit=crop',
              'Religious Studies': 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=450&fit=crop',
              'Physical Education':'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=450&fit=crop',
              'PE':                'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=450&fit=crop',
              'Psychology':        'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=450&fit=crop',
              'Sociology':         'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=450&fit=crop',
            }
            const SUBJECT_COLOURS = {
              'Mathematics': '#7D1025', 'Maths': '#7D1025', 'Further Mathematics': '#5A0B1B',
              'Physics': '#1E3A8A', 'Chemistry': '#166534', 'Biology': '#7C2D12',
              'English': '#6B21A8', 'English Language': '#6B21A8', 'English Literature': '#581C87',
              'Literature': '#581C87', 'History': '#92400E', 'Geography': '#0F766E',
              'Computer Science': '#1F2937', 'ICT': '#1F2937', 'Business Studies': '#7E22CE',
              'Business': '#7E22CE', 'Economics': '#9F1239', 'Accounting': '#0E7C7B',
              'Art': '#BE185D', 'Art & Design': '#BE185D', 'Visual Arts': '#BE185D',
              'Music': '#0E7490', 'French': '#1E40AF', 'Spanish': '#B91C1C',
              'Kiswahili': '#15803D', 'Religious Studies': '#7C2D12',
              'Physical Education': '#059669', 'PE': '#059669',
              'Psychology': '#7C3AED', 'Sociology': '#0369A1',
            }
            const imageFor  = (s) => SUBJECT_IMAGES[s]
            const colourFor = (s) => SUBJECT_COLOURS[s] || '#7D1025'

            // ── 3. Per-subject summary data ──
            // Lessons: from store (already loaded per session)
            const lessonsBySubject = {}
            ;(store.lessons || []).forEach(l => {
              const s = l.subject || 'General'
              if (!lessonsBySubject[s]) lessonsBySubject[s] = []
              lessonsBySubject[s].push(l)
            })

            // Homework: fetched once on this view's first render, kept in
            // module-scoped state (a closure over the parent component's
            // useState). Use a local cache keyed by subject.
            const hwBySubject = curriculumHwBySubject || {}

            // Empty-enrolment guard
            const hasEnrolment = !!enrolledCurriculum && enrolledSubjects.length > 0

            return (
              <div>
                {/* ── HERO: curriculum + grade + counts ── */}
                <div className="card" style={{
                  padding: 0, marginBottom: 18, overflow: 'hidden',
                  background: 'linear-gradient(135deg, #7D1025 0%, #5A0B1B 100%)',
                  color: '#fff', border: 'none',
                }}>
                  <div style={{ padding: '28px 32px 22px', display:'flex', alignItems:'flex-start', gap:24, flexWrap:'wrap' }}>
                    <div style={{ flex:1, minWidth:260 }}>
                      <div style={{
                        fontSize: 10.5, fontWeight: 700, letterSpacing: '.16em',
                        textTransform: 'uppercase', color:'#F0CC5A', marginBottom: 6,
                      }}>
                        Your Programme
                      </div>
                      <h2 style={{
                        fontFamily: "'Instrument Serif','Playfair Display',serif",
                        fontSize: 34, fontWeight: 400, margin: 0, lineHeight: 1.1,
                      }}>
                        {curriculumDisplay || 'No curriculum on file'}
                      </h2>
                      {enrolledGrade && (
                        <div style={{ fontSize: 14, opacity: .88, marginTop: 6, fontFamily:'JetBrains Mono,monospace' }}>
                          {enrolledGrade}
                        </div>
                      )}
                      {curriculumInfo?.description && (
                        <p style={{
                          fontSize: 13.5, opacity: .85, marginTop: 14, marginBottom: 0,
                          maxWidth: 560, lineHeight: 1.55,
                        }}>
                          {curriculumInfo.description}
                        </p>
                      )}
                    </div>
                    {hasEnrolment && (
                      <div style={{ display:'flex', gap:12, flexShrink:0 }}>
                        <div style={{
                          background:'rgba(255,255,255,.1)', padding:'14px 18px',
                          borderRadius:10, minWidth:90, textAlign:'center',
                          border:'1px solid rgba(255,255,255,.12)',
                        }}>
                          <div style={{ fontSize:26, fontWeight:700, fontFamily:'JetBrains Mono,monospace', color:'#F0CC5A' }}>
                            {enrolledSubjects.length}
                          </div>
                          <div style={{ fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', opacity:.8, marginTop:2 }}>
                            Subjects
                          </div>
                        </div>
                        <div style={{
                          background:'rgba(255,255,255,.1)', padding:'14px 18px',
                          borderRadius:10, minWidth:90, textAlign:'center',
                          border:'1px solid rgba(255,255,255,.12)',
                        }}>
                          <div style={{ fontSize:26, fontWeight:700, fontFamily:'JetBrains Mono,monospace', color:'#F0CC5A' }}>
                            {(store.lessons || []).length}
                          </div>
                          <div style={{ fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', opacity:.8, marginTop:2 }}>
                            Lessons
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── EMPTY STATE ── */}
                {!hasEnrolment && (
                  <div className="card" style={{
                    padding: '40px 28px', textAlign:'center',
                    background:'#FBFAF5', border:'1px dashed #E8E2D6',
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 12, opacity:.5 }}>▤</div>
                    <div style={{
                      fontFamily:"'Instrument Serif',serif", fontSize: 22,
                      color:'#1A1A1A', marginBottom: 8,
                    }}>
                      No subjects enrolled yet
                    </div>
                    <div style={{ fontSize: 13.5, color:'#6B6B6B', maxWidth: 480, margin:'0 auto', lineHeight: 1.55 }}>
                      Your curriculum and subjects haven't been set up yet. Contact your
                      programme coordinator at <strong style={{color:'#7D1025'}}>hellosmartious@gmail.com</strong> to complete your enrolment.
                    </div>

                    {/* ── DIAGNOSTIC: show raw user fields so we can debug ── */}
                    <details style={{
                      marginTop: 24, textAlign:'left',
                      maxWidth: 560, marginLeft:'auto', marginRight:'auto',
                      background:'#fff', border:'1px solid #E8E2D6', borderRadius:8,
                      padding:'10px 14px',
                    }}>
                      <summary style={{ cursor:'pointer', fontSize:11, color:'#6B6B6B', fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase' }}>
                        Diagnostic · what the frontend has
                      </summary>
                      <pre style={{
                        fontSize:11, fontFamily:'JetBrains Mono,monospace',
                        background:'#FBFAF5', padding:10, borderRadius:6,
                        marginTop:10, overflow:'auto', maxHeight:260, color:'#3F3F3F',
                      }}>
{JSON.stringify({
  _id: user?._id || user?.id || '(missing)',
  email: user?.email || '(missing)',
  curriculum: user?.curriculum || '(empty)',
  gradeLevel: user?.gradeLevel || '(empty)',
  grade: user?.grade || '(empty)',
  subjects: user?.subjects || '(empty)',
  subjectsType: Array.isArray(user?.subjects) ? 'array(' + user.subjects.length + ')' : typeof user?.subjects,
  studentSubjects: user?.studentSubjects || '(none)',
  subjectRefs: user?.subjectRefs || '(none)',
  allKeys: user ? Object.keys(user).sort() : [],
}, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}

                {/* ── SUBJECT CARDS GRID ── */}
                {hasEnrolment && (
                  <>
                    <div className="sec-tag" style={{marginBottom:14}}>My Subjects</div>
                    <div style={{
                      display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: 16,
                      marginBottom: 24,
                    }}>
                      {enrolledSubjects.map(subjectName => {
                        const img      = imageFor(subjectName)
                        const col      = colourFor(subjectName)
                        const lessonCt = (lessonsBySubject[subjectName] || []).length
                        const hwCt     = (hwBySubject[subjectName] || []).length
                        const isOpen   = curriculumExpandedSubject === subjectName

                        return (
                          <div key={subjectName} style={{
                            background:'#fff',
                            borderRadius: 14,
                            overflow:'hidden',
                            border:'1px solid #E8E2D6',
                            transition:'box-shadow .2s, transform .2s, border-color .2s',
                            cursor:'pointer',
                            boxShadow: isOpen ? '0 8px 24px rgba(125,16,37,.16)' : '0 1px 3px rgba(0,0,0,.04)',
                            borderColor: isOpen ? '#7D1025' : '#E8E2D6',
                          }}
                            onClick={() => setCurriculumExpandedSubject(isOpen ? null : subjectName)}
                            onMouseEnter={e => { if (!isOpen) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,.08)' } }}
                            onMouseLeave={e => { if (!isOpen) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.04)' } }}
                          >
                            {/* Image header */}
                            <div style={{
                              position:'relative',
                              height: 140,
                              background: img
                                ? `linear-gradient(135deg, ${col}cc 0%, ${col}66 100%), url("${img}")`
                                : `linear-gradient(135deg, ${col} 0%, ${col}aa 100%)`,
                              backgroundSize:'cover',
                              backgroundPosition:'center',
                              display:'flex', alignItems:'flex-end',
                              padding:'14px 16px',
                              color:'#fff',
                            }}>
                              <div style={{ flex:1 }}>
                                <div style={{
                                  fontFamily:"'Instrument Serif',serif",
                                  fontSize:22, lineHeight:1.1, margin:0,
                                  textShadow:'0 1px 4px rgba(0,0,0,.3)',
                                }}>
                                  {subjectName}
                                </div>
                                <div style={{
                                  fontSize:10.5, opacity:.95, marginTop:4,
                                  letterSpacing:'.08em', textTransform:'uppercase', fontWeight:600,
                                  textShadow:'0 1px 3px rgba(0,0,0,.4)',
                                }}>
                                  {curriculumDisplay} {enrolledGrade ? '· ' + enrolledGrade : ''}
                                </div>
                              </div>
                            </div>

                            {/* Stats strip */}
                            <div style={{
                              padding:'12px 16px',
                              display:'flex', gap:14, alignItems:'center',
                              borderBottom: isOpen ? '1px solid #F0EBE0' : 'none',
                            }}>
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                                <span style={{ fontSize:12, color:'#3F3F3F', fontWeight:600 }}>{lessonCt} lessons</span>
                              </div>
                              <div style={{ width:1, height:14, background:'#E8E2D6' }}/>
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                  <polyline points="14 2 14 8 20 8"/>
                                </svg>
                                <span style={{ fontSize:12, color:'#3F3F3F', fontWeight:600 }}>{hwCt} homework</span>
                              </div>
                              <div style={{ marginLeft:'auto' }}>
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={isOpen ? '#7D1025' : '#6B6B6B'} strokeWidth="2.5" strokeLinecap="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>
                                  <polyline points="6 9 12 15 18 9"/>
                                </svg>
                              </div>
                            </div>

                            {/* Drawer */}
                            {isOpen && (
                              <div style={{ padding:'14px 16px 16px', background:'#FBFAF5' }}>
                                {/* Quick actions */}
                                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); goTo('lessons') }}
                                    style={{
                                      flex:1, minWidth:120,
                                      padding:'9px 12px',
                                      background: col, color:'#fff',
                                      border:'none', borderRadius:8,
                                      fontSize:12, fontWeight:600, cursor:'pointer',
                                      display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
                                      boxShadow:`0 2px 6px ${col}44`,
                                    }}
                                  >
                                    <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                    Open Lessons
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); goTo('homework') }}
                                    style={{
                                      flex:1, minWidth:120,
                                      padding:'9px 12px',
                                      background:'#fff', color:'#3F3F3F',
                                      border:'1px solid #E8E2D6', borderRadius:8,
                                      fontSize:12, fontWeight:600, cursor:'pointer',
                                      display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
                                    }}
                                  >
                                    Homework
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); goTo('exams') }}
                                    style={{
                                      flex:1, minWidth:120,
                                      padding:'9px 12px',
                                      background:'#fff', color:'#3F3F3F',
                                      border:'1px solid #E8E2D6', borderRadius:8,
                                      fontSize:12, fontWeight:600, cursor:'pointer',
                                      display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
                                    }}
                                  >
                                    Exams
                                  </button>
                                </div>

                                {/* Recent lessons preview */}
                                {lessonCt > 0 ? (
                                  <div>
                                    <div style={{ fontSize:10.5, fontWeight:700, color:'#6B6B6B', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>
                                      Recent Lessons
                                    </div>
                                    {(lessonsBySubject[subjectName] || []).slice(0,3).map((l, i) => (
                                      <div key={i} style={{
                                        display:'flex', alignItems:'center', gap:10,
                                        padding:'8px 10px',
                                        background:'#fff', borderRadius:8,
                                        border:'1px solid #F0EBE0',
                                        marginBottom: i < 2 ? 6 : 0,
                                      }}>
                                        <div style={{
                                          width:6, height:6, borderRadius:'50%',
                                          background: col, flexShrink:0,
                                        }}/>
                                        <div style={{ flex:1, minWidth:0 }}>
                                          <div style={{
                                            fontSize:12.5, color:'#1A1A1A', fontWeight:500,
                                            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                                          }}>
                                            {l.title || l.topic || 'Untitled lesson'}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div style={{
                                    fontSize:12, color:'#6B6B6B', fontStyle:'italic',
                                    textAlign:'center', padding:'12px 0',
                                  }}>
                                    No lessons published yet for this subject.
                                  </div>
                                )}

                                {/* Syllabus progress widget — % covered */}
                                <div style={{ marginTop: 14 }}>
                                  <SubjectProgressCard
                                    studentId={user?._id}
                                    subjectName={subjectName}
                                    curriculum={user?.curriculum}
                                    api={api}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )
          })()}

          {/* ════════════════════════════════════════════
              LESSONS — player with adaptive flashcards
          ════════════════════════════════════════════ */}
          {page === 'lessons' && <LessonPlayerTab user={user} toast={toast} />}
        {page === 'quiz' && <QuizGameLauncher user={user} toast={toast} setPage={setPage}/>}

          {/* ════════════════════════════════════════════
              ADAPTIVE PRACTICE — live questions from API
          ════════════════════════════════════════════ */}
          {page === 'dashboard' && isAdvisory && (
            <AdvisoryDashboard programme={programme} deliveryMode={deliveryMode} firstName={user?.firstName || 'there'} />
          )}
          {page === 'dashboard' && !isAdvisory && <DashboardTab user={user} store={store} setPage={setPage} toast={toast} />}
          {page === 'practice' && <PracticeTab user={user} toast={toast} goTo={goTo} />}
          {page === 'homework' && <HomeworkTab user={user} toast={toast} />}

          {/* ════════════════════════════════════════════
              EXAMS
          ════════════════════════════════════════════ */}
          {page === 'exams' && <ExamsTab user={user} toast={toast} goTo={goTo} store={store} />}
          {page === 'results' && <MyResultsTab user={user} toast={toast} setPage={setPage} />}

          {/* ════════════════════════════════════════════
              LIVE CLASSES
          ════════════════════════════════════════════ */}
          {page === 'live' && <LiveClassesTab user={user} toast={toast} goTo={goTo} />}

          {/* ════════════════════════════════════════════
              TIMETABLE
          ════════════════════════════════════════════ */}
          {page === 'timetable' && <RealTimetableTab user={user} setPage={setPage} toast={toast} />}

          {page === 'attendance' && <StudentAttendancePage user={user} toast={toast} />}

          {/* ════════════════════════════════════════════
              MSHAURI AI — mastery-aware
          ════════════════════════════════════════════ */}
          {page === 'tutor' && <MshauriTab user={user} />}

          {/* ════════════════════════════════════════════
              PERSONALISED STUDY PLAN
          ════════════════════════════════════════════ */}
          {page === 'studyplan' && <StudyPlanTab user={user} store={store} setPage={setPage} toast={toast} />}

          {/* ════════════════════════════════════════════
              LIBRARY — coursebook PDFs by subject
          ════════════════════════════════════════════ */}
          {page === 'library' && <StudentLibraryPage user={user} toast={toast} />}

          {/* ════════════════════════════════════════════
              RESOURCES — live from teacher uploads
          ════════════════════════════════════════════ */}
          {page === 'resources' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Uploaded by your teachers</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Resources</h2></div>
              {store.resources.length === 0 ? (
                <div className="empty"><h3>No resources yet</h3><p>Your teachers will upload worksheets, past papers and more here.</p></div>
              ) : (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
                  {store.resources.map((r) => (
                    <div key={r.id} className="card" style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                      <div style={{width:44,height:44,borderRadius:'var(--rmd)',background:'var(--b50)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--b700)" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:13.5,color:'var(--s800)',marginBottom:3}}>{r.title}</div>
                        <div style={{fontSize:11.5,color:'var(--s400)',marginBottom:3}}>{r.type} · {r.subject} · {r.grade}</div>
                        <div style={{fontSize:11.5,color:'var(--s400)',marginBottom:8}}>Added by {r.addedBy} · {r.date}</div>
                        <button className="btn btn-s btn-sm" onClick={() => store.downloadResource(r)}>{r.type==='Link'?'Open':'Download'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════
              ACHIEVEMENTS — live badges + XP
          ════════════════════════════════════════════ */}
          {page === 'achievements' && <AchievementTab user={user}/>}

          {/* ════════════════════════════════════════════
              PROFILE
          ════════════════════════════════════════════ */}
          {page === 'profile' && <ProfileTab user={user} toast={toast} />}
          {page === 'communication' && <StudentCommunicationTab user={user} toast={toast} />}

        </div>
      </main>
    </div>
  );
}
          
// ═══════════════════════════════════════════════════════════
// QUESTION BANK — IGCSE / Edexcel / CBC
// ═══════════════════════════════════════════════════════════
const QUESTION_BANK = {
  Mathematics: {
    'Algebra': [
      { q: 'Solve for x:  3x + 7 = 22', options: ['x = 5', 'x = 7', 'x = 15', 'x = 29/3'], answer: 'x = 5', explanation: 'Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5.' },
      { q: 'Expand (x + 4)(x − 2)', options: ['x² + 2x − 8', 'x² − 2x − 8', 'x² + 6x − 8', 'x² + 2x + 8'], answer: 'x² + 2x − 8', explanation: 'FOIL: x·x + x·(−2) + 4·x + 4·(−2) = x² − 2x + 4x − 8 = x² + 2x − 8.' },
      { q: 'Factorise:  x² − 9', options: ['(x − 3)(x − 3)', '(x + 3)(x − 3)', '(x + 9)(x − 1)', 'Cannot be factorised'], answer: '(x + 3)(x − 3)', explanation: 'Difference of two squares: a² − b² = (a + b)(a − b). Here a = x, b = 3.' },
      { q: 'If 2x − 5 = 11, what is the value of x?', options: ['3', '6', '8', '13'], answer: '8', explanation: 'Add 5: 2x = 16. Divide by 2: x = 8.' },
      { q: 'Simplify:  4(2x + 3) − 5x', options: ['3x + 12', '13x + 12', '8x + 3', '3x + 3'], answer: '3x + 12', explanation: 'Distribute: 8x + 12 − 5x. Combine like terms: 3x + 12.' },
    ],
    'Geometry & Pythagoras': [
      { q: 'A right-angled triangle has legs 6 cm and 8 cm. What is the hypotenuse?', options: ['10 cm', '14 cm', '12 cm', '7 cm'], answer: '10 cm', explanation: 'Pythagoras: c² = 6² + 8² = 36 + 64 = 100, so c = 10 cm.' },
      { q: 'Which set is a Pythagorean triple?', options: ['(2, 3, 4)', '(5, 12, 13)', '(4, 5, 6)', '(1, 2, 3)'], answer: '(5, 12, 13)', explanation: '5² + 12² = 25 + 144 = 169 = 13². The others do not satisfy a² + b² = c².' },
      { q: 'The area of a triangle with base 10 cm and height 6 cm is:', options: ['60 cm²', '30 cm²', '16 cm²', '32 cm²'], answer: '30 cm²', explanation: 'Area = ½ × base × height = ½ × 10 × 6 = 30 cm².' },
      { q: 'The interior angles of a triangle sum to:', options: ['90°', '180°', '270°', '360°'], answer: '180°', explanation: 'Standard geometry fact: interior angles of any triangle always sum to 180°.' },
      { q: 'A square has perimeter 24 cm. What is its area?', options: ['36 cm²', '48 cm²', '72 cm²', '144 cm²'], answer: '36 cm²', explanation: 'Side length = 24 ÷ 4 = 6 cm. Area = 6² = 36 cm².' },
    ],
    'Number & Percentages': [
      { q: 'What is 15% of 240?', options: ['24', '32', '36', '40'], answer: '36', explanation: '15% = 0.15. 0.15 × 240 = 36.' },
      { q: 'A jacket costs $80, then is reduced by 25%. The new price is:', options: ['$55', '$60', '$65', '$75'], answer: '$60', explanation: '25% of 80 = 20. 80 − 20 = $60.' },
      { q: 'Express 0.75 as a fraction in simplest form.', options: ['3/4', '7/10', '75/100', '4/5'], answer: '3/4', explanation: '0.75 = 75/100 = 3/4 (dividing top and bottom by 25).' },
      { q: 'What is the value of 2³ × 3²?', options: ['72', '36', '54', '108'], answer: '72', explanation: '2³ = 8 and 3² = 9. So 8 × 9 = 72.' },
      { q: 'A price increases from $40 to $50. What is the percentage increase?', options: ['10%', '20%', '25%', '50%'], answer: '25%', explanation: 'Increase = $10. Percentage = (10/40) × 100 = 25%.' },
    ],
    'Statistics': [
      { q: 'Find the mean of: 4, 7, 9, 10, 5', options: ['7', '7.5', '6', '8'], answer: '7', explanation: 'Sum = 35. Mean = 35 ÷ 5 = 7.' },
      { q: 'Find the median of: 3, 8, 1, 5, 9, 2, 7', options: ['5', '6', '7', '4'], answer: '5', explanation: 'Sort: 1, 2, 3, 5, 7, 8, 9. Middle value (4th of 7) = 5.' },
      { q: 'Find the mode of: 2, 4, 4, 5, 7, 4, 8', options: ['4', '5', '7', '2'], answer: '4', explanation: 'Mode = the value appearing most often. The number 4 appears 3 times.' },
      { q: 'The range of a data set is:', options: ['Mean of all values', 'Difference between largest and smallest', 'Most common value', 'Sum divided by count'], answer: 'Difference between largest and smallest', explanation: 'Range = max − min. It measures the spread of the data.' },
      { q: 'A bag has 3 red and 7 blue balls. P(picking red) is:', options: ['3/10', '3/7', '7/10', '1/3'], answer: '3/10', explanation: 'P(red) = favourable / total = 3 / (3 + 7) = 3/10.' },
    ],
    'Trigonometry': [
      { q: 'In a right triangle, sin(θ) is defined as:', options: ['Opposite / Hypotenuse', 'Adjacent / Hypotenuse', 'Opposite / Adjacent', 'Hypotenuse / Opposite'], answer: 'Opposite / Hypotenuse', explanation: 'SOH from SOH-CAH-TOA: sin = Opposite / Hypotenuse.' },
      { q: 'What is sin(30°)?', options: ['0.5', '0.707', '0.866', '1'], answer: '0.5', explanation: 'sin(30°) = 1/2 = 0.5. This is a standard angle to memorise.' },
      { q: 'cos(60°) equals:', options: ['√3/2', '1/2', '√2/2', '1'], answer: '1/2', explanation: 'cos(60°) = 0.5. (Note: cos(60°) = sin(30°).)' },
      { q: 'Which of these statements is true?', options: ['sin²θ + cos²θ = 1', 'sin²θ − cos²θ = 1', 'sin θ + cos θ = 1', 'tan θ = sin θ × cos θ'], answer: 'sin²θ + cos²θ = 1', explanation: 'Pythagorean identity. Always true for any angle θ.' },
      { q: 'tan(45°) =', options: ['0', '1', '√2', '∞'], answer: '1', explanation: 'tan(45°) = sin(45°)/cos(45°) = (√2/2)/(√2/2) = 1.' },
    ],
  },
 
  Physics: {
    'Forces & Motion': [
      { q: 'Newton\'s second law is expressed as:', options: ['F = ma', 'F = m/a', 'F = m + a', 'F = m − a'], answer: 'F = ma', explanation: 'Force = mass × acceleration. Standard Newton\'s second law equation.' },
      { q: 'A car accelerates from rest at 4 m/s². After 5 seconds its velocity is:', options: ['9 m/s', '20 m/s', '25 m/s', '4 m/s'], answer: '20 m/s', explanation: 'v = u + at = 0 + 4 × 5 = 20 m/s.' },
      { q: 'The SI unit of force is:', options: ['Joule', 'Watt', 'Newton', 'Pascal'], answer: 'Newton', explanation: '1 Newton = 1 kg·m/s². Named after Sir Isaac Newton.' },
      { q: 'Acceleration due to gravity on Earth is approximately:', options: ['8.8 m/s²', '9.8 m/s²', '10.8 m/s²', '11.8 m/s²'], answer: '9.8 m/s²', explanation: 'g ≈ 9.8 m/s² near Earth\'s surface (often rounded to 10 in IGCSE problems).' },
      { q: 'Momentum is defined as:', options: ['mass × velocity', 'mass × acceleration', 'force × time', 'force × distance'], answer: 'mass × velocity', explanation: 'p = mv. Momentum is the product of mass and velocity.' },
    ],
    'Electricity': [
      { q: 'Ohm\'s Law states:', options: ['V = IR', 'V = I/R', 'V = I + R', 'V = I − R'], answer: 'V = IR', explanation: 'Voltage = Current × Resistance. Foundation of basic circuit analysis.' },
      { q: 'The SI unit of electrical resistance is:', options: ['Volt', 'Ampere', 'Ohm', 'Watt'], answer: 'Ohm', explanation: '1 Ohm (Ω) = 1 V/A. Named after Georg Ohm.' },
      { q: 'In a series circuit, the current:', options: ['Is the same everywhere', 'Splits at each junction', 'Increases with each component', 'Decreases with each component'], answer: 'Is the same everywhere', explanation: 'In series, current has only one path so it\'s identical at every point.' },
      { q: 'A 12 V battery drives 3 A through a circuit. The resistance is:', options: ['4 Ω', '36 Ω', '15 Ω', '0.25 Ω'], answer: '4 Ω', explanation: 'R = V/I = 12/3 = 4 Ω.' },
      { q: 'Power dissipated by a resistor is given by:', options: ['P = VI', 'P = V/I', 'P = V + I', 'P = V − I'], answer: 'P = VI', explanation: 'Power = Voltage × Current. Also expressible as I²R or V²/R.' },
    ],
    'Waves': [
      { q: 'Wave speed equation:', options: ['v = fλ', 'v = f/λ', 'v = f + λ', 'v = f − λ'], answer: 'v = fλ', explanation: 'Speed = frequency × wavelength. Fundamental wave equation.' },
      { q: 'The unit of frequency is:', options: ['Metre', 'Second', 'Hertz', 'Newton'], answer: 'Hertz', explanation: '1 Hz = 1 cycle per second. Named after Heinrich Hertz.' },
      { q: 'Sound waves are:', options: ['Transverse', 'Longitudinal', 'Electromagnetic', 'Standing only'], answer: 'Longitudinal', explanation: 'Sound waves consist of compressions and rarefactions parallel to the direction of travel.' },
      { q: 'Light travels in a vacuum at approximately:', options: ['3 × 10⁵ m/s', '3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s'], answer: '3 × 10⁸ m/s', explanation: 'The speed of light in a vacuum is c ≈ 299,792,458 m/s ≈ 3 × 10⁸ m/s.' },
      { q: 'When light passes from air into glass, it:', options: ['Speeds up', 'Slows down', 'Stays the same speed', 'Stops completely'], answer: 'Slows down', explanation: 'Light slows in denser media. This causes refraction (bending of light).' },
    ],
    'Energy': [
      { q: 'The unit of energy is the:', options: ['Watt', 'Joule', 'Newton', 'Pascal'], answer: 'Joule', explanation: '1 Joule = 1 N·m = energy to apply 1 N over 1 m.' },
      { q: 'Kinetic energy is calculated as:', options: ['½mv²', 'mv²', 'mgh', 'mv'], answer: '½mv²', explanation: 'KE = ½ × mass × velocity². Note the factor of one-half.' },
      { q: 'Gravitational potential energy is:', options: ['mgh', '½mv²', 'mv', 'F × d'], answer: 'mgh', explanation: 'GPE = mass × gravity × height. Energy stored due to position above a reference level.' },
      { q: 'Energy can be:', options: ['Created from nothing', 'Destroyed completely', 'Transformed but not destroyed', 'Multiplied by adding fuel'], answer: 'Transformed but not destroyed', explanation: 'Conservation of Energy: total energy is constant; only the form changes.' },
      { q: 'Power is defined as:', options: ['Energy × time', 'Energy / time', 'Energy + time', 'Force × time'], answer: 'Energy / time', explanation: 'P = E/t. Measured in Watts (1 W = 1 J/s).' },
    ],
  },
 
  Biology: {
    'Cell Biology': [
      { q: 'The structure that controls what enters and leaves an animal cell is the:', options: ['Cell wall', 'Cell membrane', 'Nucleus', 'Cytoplasm'], answer: 'Cell membrane', explanation: 'Cell membrane is selectively permeable. (Cell walls are found in plants, fungi, and bacteria — not animal cells.)' },
      { q: 'Photosynthesis occurs in the:', options: ['Mitochondria', 'Nucleus', 'Chloroplasts', 'Ribosomes'], answer: 'Chloroplasts', explanation: 'Chloroplasts contain chlorophyll and convert light energy into chemical energy.' },
      { q: 'The "powerhouse" of the cell is the:', options: ['Nucleus', 'Mitochondrion', 'Chloroplast', 'Vacuole'], answer: 'Mitochondrion', explanation: 'Mitochondria produce ATP through respiration — the cell\'s usable energy currency.' },
      { q: 'Which cell structure contains DNA?', options: ['Cytoplasm', 'Cell membrane', 'Nucleus', 'Ribosome'], answer: 'Nucleus', explanation: 'In eukaryotic cells, DNA is housed in the nucleus.' },
      { q: 'Plant cells have all of the following EXCEPT:', options: ['Cell wall', 'Chloroplasts', 'Centrioles', 'Large vacuole'], answer: 'Centrioles', explanation: 'Centrioles are typically found in animal cells, not plant cells.' },
    ],
    'Human Body Systems': [
      { q: 'Oxygen and carbon dioxide are exchanged in the:', options: ['Trachea', 'Bronchi', 'Alveoli', 'Diaphragm'], answer: 'Alveoli', explanation: 'Alveoli are tiny air sacs with thin walls — gas exchange happens by diffusion across them.' },
      { q: 'The chamber of the heart that pumps blood to the body is the:', options: ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle'], answer: 'Left ventricle', explanation: 'The left ventricle is the most muscular chamber, pumping oxygenated blood through the aorta to the body.' },
      { q: 'Insulin is produced by the:', options: ['Liver', 'Stomach', 'Pancreas', 'Kidney'], answer: 'Pancreas', explanation: 'The pancreas produces insulin (and glucagon) to regulate blood sugar.' },
      { q: 'The largest organ in the human body is the:', options: ['Brain', 'Liver', 'Skin', 'Lungs'], answer: 'Skin', explanation: 'Skin is the largest organ by surface area and weight.' },
      { q: 'Red blood cells transport oxygen using a protein called:', options: ['Insulin', 'Haemoglobin', 'Glucose', 'Albumin'], answer: 'Haemoglobin', explanation: 'Haemoglobin contains iron, which binds oxygen reversibly.' },
    ],
    'Genetics & Inheritance': [
      { q: 'DNA stands for:', options: ['Deoxyribonucleic acid', 'Dinitrogen acid', 'Diribonucleic acid', 'Dinucleic acid'], answer: 'Deoxyribonucleic acid', explanation: 'DNA = Deoxyribonucleic Acid. Stores genetic information in all living cells.' },
      { q: 'A human body cell normally has how many chromosomes?', options: ['23', '46', '92', '12'], answer: '46', explanation: '23 pairs of chromosomes = 46 in total in human somatic cells.' },
      { q: 'The genotype Tt represents:', options: ['Homozygous dominant', 'Homozygous recessive', 'Heterozygous', 'Mutant'], answer: 'Heterozygous', explanation: 'Heterozygous = one dominant + one recessive allele.' },
      { q: 'Sex chromosomes in human males are:', options: ['XX', 'XY', 'YY', 'XO'], answer: 'XY', explanation: 'Males have one X and one Y chromosome. Females have XX.' },
      { q: 'Which scientists are credited with the structure of DNA?', options: ['Darwin & Wallace', 'Watson & Crick', 'Mendel & Morgan', 'Pasteur & Koch'], answer: 'Watson & Crick', explanation: 'James Watson and Francis Crick proposed the double helix structure in 1953 (with key data from Rosalind Franklin).' },
    ],
    'Ecology': [
      { q: 'Producers in an ecosystem are typically:', options: ['Herbivores', 'Carnivores', 'Plants', 'Decomposers'], answer: 'Plants', explanation: 'Plants produce their own food via photosynthesis — they\'re the base of most food chains.' },
      { q: 'A food chain typically starts with:', options: ['A predator', 'A producer', 'A decomposer', 'A consumer'], answer: 'A producer', explanation: 'Producers (plants) capture solar energy. Energy then flows up to consumers.' },
      { q: 'The process by which water evaporates and forms clouds is part of the:', options: ['Carbon cycle', 'Nitrogen cycle', 'Water cycle', 'Rock cycle'], answer: 'Water cycle', explanation: 'The water cycle includes evaporation, condensation, precipitation, and collection.' },
      { q: 'A community of organisms with their physical environment forms a(n):', options: ['Population', 'Species', 'Ecosystem', 'Habitat'], answer: 'Ecosystem', explanation: 'Ecosystem = biotic (living) + abiotic (non-living) factors interacting.' },
      { q: 'Which gas do plants take in for photosynthesis?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], answer: 'Carbon dioxide', explanation: 'Plants absorb CO₂ and release O₂ during photosynthesis.' },
    ],
  },
 
  Chemistry: {
    'Atomic Structure': [
      { q: 'The atomic number of an element equals the number of:', options: ['Neutrons', 'Protons', 'Electrons + Neutrons', 'Protons + Neutrons'], answer: 'Protons', explanation: 'Atomic number Z = number of protons. (In a neutral atom, this also equals the number of electrons.)' },
      { q: 'Which subatomic particle has a negative charge?', options: ['Proton', 'Neutron', 'Electron', 'Nucleus'], answer: 'Electron', explanation: 'Electrons carry a charge of −1. Protons are +1, neutrons are neutral.' },
      { q: 'The mass number of an atom is:', options: ['Number of protons only', 'Number of electrons only', 'Number of protons + neutrons', 'Number of neutrons only'], answer: 'Number of protons + neutrons', explanation: 'Mass number A = protons + neutrons. Electrons have negligible mass.' },
      { q: 'Isotopes of an element have:', options: ['Same protons, different neutrons', 'Same neutrons, different protons', 'Same protons and neutrons', 'Different electrons'], answer: 'Same protons, different neutrons', explanation: 'Isotopes have the same atomic number but different mass numbers (e.g. Carbon-12 and Carbon-14).' },
      { q: 'Where are electrons located?', options: ['In the nucleus', 'In shells around the nucleus', 'Spread evenly through the atom', 'Outside the atom'], answer: 'In shells around the nucleus', explanation: 'Electrons occupy energy levels (shells) at specific distances from the nucleus.' },
    ],
    'The Periodic Table': [
      { q: 'Group 1 elements are also known as:', options: ['Halogens', 'Noble gases', 'Alkali metals', 'Transition metals'], answer: 'Alkali metals', explanation: 'Group 1: Li, Na, K, Rb, Cs, Fr — soft, highly reactive metals.' },
      { q: 'Group 7 elements are called:', options: ['Halogens', 'Alkali metals', 'Noble gases', 'Lanthanides'], answer: 'Halogens', explanation: 'Group 7 (or 17): F, Cl, Br, I, At — non-metals that form salts.' },
      { q: 'Group 0 (or 8) elements are:', options: ['Alkali metals', 'Halogens', 'Noble gases', 'Transition metals'], answer: 'Noble gases', explanation: 'Group 0: He, Ne, Ar, Kr, Xe, Rn — full outer shells, very unreactive.' },
      { q: 'As you go down Group 1, reactivity:', options: ['Decreases', 'Increases', 'Stays the same', 'Becomes zero'], answer: 'Increases', explanation: 'Outer electron is held less tightly going down the group, so it\'s easier to lose, making the element more reactive.' },
      { q: 'Elements in the same period have the same:', options: ['Number of electron shells', 'Number of outer electrons', 'Atomic mass', 'Reactivity'], answer: 'Number of electron shells', explanation: 'Period number = number of electron shells.' },
    ],
    'Chemical Reactions': [
      { q: 'A chemical reaction that releases heat is called:', options: ['Endothermic', 'Exothermic', 'Catalytic', 'Reversible'], answer: 'Exothermic', explanation: 'Exo = "out". Releases heat to the surroundings.' },
      { q: 'A catalyst is a substance that:', options: ['Is consumed in the reaction', 'Speeds up a reaction without being used up', 'Slows down all reactions', 'Reacts only with metals'], answer: 'Speeds up a reaction without being used up', explanation: 'Catalysts lower activation energy and are recovered unchanged at the end.' },
      { q: 'Balance:  H₂ + O₂ → H₂O. Coefficients are:', options: ['1, 1, 1', '2, 1, 2', '1, 2, 2', '2, 2, 1'], answer: '2, 1, 2', explanation: '2H₂ + O₂ → 2H₂O. Now: 4 H atoms each side, 2 O atoms each side. Balanced.' },
      { q: 'pH 7 is:', options: ['Strongly acidic', 'Strongly basic', 'Neutral', 'Salt'], answer: 'Neutral', explanation: 'Pure water has pH 7. Below 7 = acid, above 7 = base.' },
      { q: 'Which gas turns limewater milky?', options: ['Oxygen', 'Hydrogen', 'Carbon dioxide', 'Nitrogen'], answer: 'Carbon dioxide', explanation: 'CO₂ reacts with calcium hydroxide (limewater) forming insoluble calcium carbonate, the white cloudiness.' },
    ],
    'Acids, Bases & Salts': [
      { q: 'An acid produces which ion in water?', options: ['OH⁻', 'H⁺', 'Na⁺', 'Cl⁻'], answer: 'H⁺', explanation: 'Acids release H⁺ (hydrogen ions) in aqueous solution.' },
      { q: 'A base produces which ion in water?', options: ['H⁺', 'OH⁻', 'O²⁻', 'H₃O⁺'], answer: 'OH⁻', explanation: 'Alkalis (soluble bases) release OH⁻ (hydroxide ions) in water.' },
      { q: 'Acid + Base →', options: ['Salt + Hydrogen', 'Salt + Water', 'Salt + Carbon dioxide', 'No reaction'], answer: 'Salt + Water', explanation: 'Neutralisation: H⁺ + OH⁻ → H₂O. The remaining ions form a salt.' },
      { q: 'Acid + Metal →', options: ['Salt + Water', 'Salt + Hydrogen', 'Salt + Oxygen', 'No reaction'], answer: 'Salt + Hydrogen', explanation: 'A reactive metal displaces hydrogen from an acid, producing the metal salt and H₂ gas.' },
      { q: 'Universal indicator turns red in:', options: ['A strong acid', 'A weak base', 'Neutral solution', 'A strong base'], answer: 'A strong acid', explanation: 'Universal indicator: red = strong acid (pH 0–2), green = neutral (pH 7), purple = strong base (pH 13–14).' },
    ],
  },
 
  English: {
    'Reading Comprehension': [
      { q: 'A "metaphor" is:', options: ['A direct comparison using "like" or "as"', 'An indirect comparison without "like" or "as"', 'An exaggeration', 'A repeated sound'], answer: 'An indirect comparison without "like" or "as"', explanation: 'Metaphor: "Time is a thief." Simile would say "Time is like a thief."' },
      { q: 'What is the main purpose of a topic sentence?', options: ['Conclude a paragraph', 'State the main idea of a paragraph', 'Provide an example', 'Add an interesting fact'], answer: 'State the main idea of a paragraph', explanation: 'Topic sentence = anchor of the paragraph. Usually placed first.' },
      { q: 'Which of these is an example of personification?', options: ['The wind whispered through the trees', 'The wind was strong', 'The wind blew at 50 mph', 'The wind was cold'], answer: 'The wind whispered through the trees', explanation: 'Personification gives human qualities ("whispered") to non-human things.' },
      { q: '"He is as brave as a lion" is an example of:', options: ['Metaphor', 'Simile', 'Hyperbole', 'Alliteration'], answer: 'Simile', explanation: 'Simile uses "like" or "as" for comparison.' },
      { q: 'The narrator who refers to themselves as "I" is using:', options: ['First person', 'Second person', 'Third person omniscient', 'Third person limited'], answer: 'First person', explanation: 'First person uses I/me/we. Second uses you. Third uses he/she/they.' },
    ],
    'Grammar & Punctuation': [
      { q: 'Choose the correct sentence:', options: ['Their going to the store', 'There going to the store', 'They\'re going to the store', 'Theyre going to the store'], answer: 'They\'re going to the store', explanation: 'They\'re = "they are". Their = possessive. There = location.' },
      { q: 'A semicolon is used to:', options: ['End a sentence', 'Join two related independent clauses', 'Introduce a list', 'Show possession'], answer: 'Join two related independent clauses', explanation: 'Example: "I love coffee; she prefers tea." Both halves could stand alone, but they\'re closely linked.' },
      { q: 'Which sentence uses an apostrophe correctly?', options: ['The dog\'s tail wagged', 'The dogs tail wagged', 'The dogs\' tail wagged', 'The dog tail\'s wagged'], answer: 'The dog\'s tail wagged', explanation: 'Singular possession: dog\'s. (Plural would be "dogs\'" — note position of the apostrophe.)' },
      { q: 'The past tense of "run" is:', options: ['Runned', 'Ran', 'Running', 'Runs'], answer: 'Ran', explanation: '"Run" is irregular: run / ran / run.' },
      { q: 'Which is a complete sentence?', options: ['Walking down the street', 'The boy walked down the street', 'After the rain stopped', 'Because she was happy'], answer: 'The boy walked down the street', explanation: 'A complete sentence needs a subject ("The boy") and a verb ("walked"). Others are fragments.' },
    ],
    'Literature': [
      { q: 'Shakespeare wrote during which historical period?', options: ['Medieval', 'Renaissance', 'Victorian', 'Romantic'], answer: 'Renaissance', explanation: 'Shakespeare (1564–1616) wrote during the English Renaissance / Elizabethan era.' },
      { q: '"Romeo and Juliet" is a:', options: ['Comedy', 'Tragedy', 'History', 'Sonnet'], answer: 'Tragedy', explanation: 'A Shakespearean tragedy ending in the deaths of both lovers.' },
      { q: 'Which is NOT a feature of poetry?', options: ['Rhyme', 'Rhythm', 'Imagery', 'Long paragraphs'], answer: 'Long paragraphs', explanation: 'Poetry uses lines/stanzas, not paragraphs. The other three are common poetic features.' },
      { q: 'A "sonnet" typically has how many lines?', options: ['10', '12', '14', '16'], answer: '14', explanation: 'Traditional sonnet (Shakespearean or Petrarchan) = 14 lines, often in iambic pentameter.' },
      { q: 'The protagonist of a story is:', options: ['The villain', 'The main character', 'The narrator', 'The setting'], answer: 'The main character', explanation: 'Protagonist = central character whose journey the story follows.' },
    ],
    'Writing Skills': [
      { q: 'A persuasive essay aims to:', options: ['Tell a story', 'Describe a scene', 'Convince the reader', 'Provide instructions'], answer: 'Convince the reader', explanation: 'Persuasive writing presents arguments to influence the reader\'s opinion.' },
      { q: 'A good thesis statement is:', options: ['Vague and general', 'Clear and specific', 'A question', 'A description'], answer: 'Clear and specific', explanation: 'Strong thesis = clear claim + specific reasons. Frames the entire essay.' },
      { q: 'The best place for a topic sentence in an academic paragraph is:', options: ['At the end', 'In the middle', 'At the start', 'Doesn\'t matter'], answer: 'At the start', explanation: 'Topic sentence first → reader knows the paragraph\'s focus immediately.' },
      { q: 'Which is the most formal opening for a letter?', options: ['Hi there!', 'Dear Sir/Madam,', 'Hey,', 'What\'s up?'], answer: 'Dear Sir/Madam,', explanation: 'Standard formal salutation when you don\'t know the recipient\'s name.' },
      { q: '"In conclusion" is typically used to:', options: ['Introduce a new topic', 'Add an example', 'Begin a final summary', 'Disagree with a point'], answer: 'Begin a final summary', explanation: 'Conclusion phrases signal the closing summary of an essay or argument.' },
    ],
  },
};
 
// Subject colours — premium palette
const SUBJECT_COLOURS = {
  Mathematics: '#8B1A2E',
  Physics: '#1E3A8A',
  Chemistry: '#166534',
  Biology: '#7C2D12',
  English: '#6B21A8',
  History: '#92400E',
  Geography: '#0F766E',
  'Computer Science': '#1F2937',
  'Business Studies': '#7E22CE',
  Economics: '#9F1239',
}
const subjectColour = (s) => SUBJECT_COLOURS[s] || '#8B1A2E'
 
// Persisted XP/sessions in localStorage
const PRACTICE_XP_KEY = 'sm_practice_xp'
const PRACTICE_HIST_KEY = 'sm_practice_history'
 
const loadXp = () => {
  try { return parseInt(localStorage.getItem(PRACTICE_XP_KEY) || '0', 10) || 0 }
  catch { return 0 }
}
const saveXp = (xp) => { try { localStorage.setItem(PRACTICE_XP_KEY, String(xp)) } catch {} }
const loadHist = () => {
  try { return JSON.parse(localStorage.getItem(PRACTICE_HIST_KEY) || '[]') }
  catch { return [] }
}
const saveHist = (hist) => { try { localStorage.setItem(PRACTICE_HIST_KEY, JSON.stringify(hist.slice(-50))) } catch {} }
 
// Shuffle helper
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
 
function PracticeTab({ user, toast, goTo }) {
  const [stage, setStage]       = useState('pick')      // 'pick' | 'quiz' | 'result'
  const [subject, setSubject]   = useState(null)
  const [topic, setTopic]       = useState(null)
  const [questions, setQs]      = useState([])
  const [answers, setAnswers]   = useState({})
  const [result, setResult]     = useState(null)
  const [xp, setXp]             = useState(loadXp())
  const [hist, setHist]         = useState(loadHist())
 
  const allSubjects = Object.keys(QUESTION_BANK)
 
  const startQuiz = (subj, top) => {
    const bank = QUESTION_BANK[subj]?.[top] || []
    if (bank.length === 0) {
      toast?.error?.('No questions for this topic yet.')
      return
    }
    // Pick 5, shuffle, shuffle options too
    const picked = shuffle(bank).slice(0, 5).map((q, i) => ({
      ...q,
      id: i + 1,
      shuffledOptions: shuffle(q.options),
      marks: q.marks || 5,
    }))
    setSubject(subj)
    setTopic(top)
    setQs(picked)
    setAnswers({})
    setResult(null)
    setStage('quiz')
  }
 
  const submit = () => {
    let correct = 0
    questions.forEach(q => {
      if (answers[q.id] === q.answer) correct++
    })
    const score = Math.round((correct / questions.length) * 100)
    const xpEarned = correct * 20  // 20 XP per correct = max 100/quiz
    const newXp = xp + xpEarned
    const session = {
      subject, topic, score, correct,
      total: questions.length,
      xpEarned,
      date: new Date().toISOString(),
    }
    const newHist = [...hist, session]
    setXp(newXp)
    setHist(newHist)
    saveXp(newXp)
    saveHist(newHist)
    setResult({ correct, score, xpEarned })
    setStage('result')
    if (score >= 80)      toast?.ok?.(`Excellent! +${xpEarned} XP`)
    else if (score >= 60) toast?.ok?.(`Good work! +${xpEarned} XP`)
    else                  toast?.info?.(`+${xpEarned} XP. Try again to improve!`)
  }
 
  const resetToPick = () => {
    setStage('pick')
    setSubject(null)
    setTopic(null)
    setQuestions([])
    setAnswers({})
    setResult(null)
  }
 
  // ── PICK SCREEN ──────────────────────────────────────────
  if (stage === 'pick') {
    return (
      <div>
        {/* Hero */}
        <div className="card" style={{
          padding: 0, marginBottom: 18, overflow: 'hidden',
          background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
          color: '#fff',
        }}>
          <div style={{ padding: '24px 30px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
              Practice &amp; Master
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              Sharpen your skills, one topic at a time
            </h2>
            <p style={{ fontSize: 13.5, opacity: .85, marginTop: 8, marginBottom: 0, maxWidth: 540, lineHeight: 1.55 }}>
              5 questions per session. Instant feedback. Earn XP for every correct answer. Choose a subject below to begin.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
            {[
              ['Total XP', xp.toLocaleString()],
              ['Sessions', hist.length],
              ['Best Score', hist.length ? `${Math.max(...hist.map(h => h.score))}%` : '—'],
              ['Avg Score', hist.length ? `${Math.round(hist.reduce((s, h) => s + h.score, 0) / hist.length)}%` : '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6, marginBottom: 2 }}>
                  {l}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Subject grid */}
        <div style={{ marginBottom: 14 }}>
          <div className="sec-tag">Pick a subject</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 24 }}>
          {allSubjects.map(s => {
            const col   = subjectColour(s)
            const topics = Object.keys(QUESTION_BANK[s])
            return (
              <div key={s} className="card" style={{ padding: 0, overflow: 'hidden', borderTop: `4px solid ${col}` }}>
                <div style={{ padding: '16px 18px 12px' }}>
                  <div className="serif" style={{ fontSize: 18, color: 'var(--s900)', marginBottom: 4 }}>{s}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>
                    {topics.length} topic{topics.length === 1 ? '' : 's'} · IGCSE / Edexcel
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', padding: '8px 8px' }}>
                  {topics.map(t => (
                    <button
                      key={t}
                      onClick={() => startQuiz(s, t)}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '8px 10px', borderRadius: 6,
                        border: 'none', background: 'transparent',
                        cursor: 'pointer', fontSize: 13, color: 'var(--s700)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'background .15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = col + '14' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <span>{t}</span>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={col} strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
 
        {/* Recent sessions */}
        {hist.length > 0 && (
          <div className="card">
            <div className="ctitle" style={{ marginBottom: 12 }}>Recent Sessions</div>
            <table className="tbl">
              <thead>
                <tr><th>Date</th><th>Subject</th><th>Topic</th><th>Score</th><th>XP</th></tr>
              </thead>
              <tbody>
                {[...hist].reverse().slice(0, 8).map((h, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 12.5, color: 'var(--s500)' }}>
                      {new Date(h.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ fontWeight: 600 }}>{h.subject}</td>
                    <td style={{ fontSize: 13, color: 'var(--s600)' }}>{h.topic}</td>
                    <td>
                      <span className="mono" style={{ fontWeight: 700, color: h.score >= 80 ? 'var(--g600)' : h.score >= 60 ? 'var(--b700)' : 'var(--a600)' }}>
                        {h.score}%
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontWeight: 700, color: 'var(--p600)' }}>+{h.xpEarned}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }
 
  // ── QUIZ SCREEN ──────────────────────────────────────────
  if (stage === 'quiz') {
    const answered = Object.keys(answers).length
    const col = subjectColour(subject)
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div className="sec-tag">{subject} · IGCSE Practice</div>
            <h2 className="serif" style={{ fontSize: 22, color: 'var(--s900)' }}>{topic}</h2>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--s500)' }}>{answered}/{questions.length} answered</div>
            <button className="btn btn-s btn-sm" onClick={resetToPick}>Change Topic</button>
          </div>
        </div>
 
        <div className="prog-bar" style={{ marginBottom: 20, height: 8 }}>
          <div className="prog-fill" style={{ width: `${(answered / questions.length) * 100}%`, background: col, transition: 'width .3s' }}/>
        </div>
 
        {questions.map(q => (
          <div key={q.id} className="card" style={{ marginBottom: 14, borderColor: answers[q.id] ? col : 'var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: answers[q.id] ? col : 'var(--s200)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: answers[q.id] ? '#fff' : 'var(--s500)',
                  flexShrink: 0,
                }}>{q.id}</div>
                <span style={{ fontSize: 15, color: 'var(--s800)', fontWeight: 500, lineHeight: 1.5 }}>{q.q}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--s400)', flexShrink: 0, marginLeft: 8 }}>{q.marks} marks</span>
            </div>
            {q.shuffledOptions.map(opt => (
              <label
                key={opt}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', marginBottom: 7,
                  borderRadius: 'var(--rmd)', cursor: 'pointer',
                  border: `1.5px solid ${answers[q.id] === opt ? col : 'var(--border)'}`,
                  background: answers[q.id] === opt ? col + '0F' : 'var(--bg)',
                  transition: 'all .15s',
                }}
              >
                <input
                  type="radio"
                  name={`q${q.id}`}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                  style={{ accentColor: col }}
                />
                <span style={{ fontSize: 14, color: answers[q.id] === opt ? col : 'var(--s700)', fontWeight: answers[q.id] === opt ? 600 : 400 }}>
                  {opt}
                </span>
              </label>
            ))}
          </div>
        ))}
 
        <div style={{ position: 'sticky', bottom: 16, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--rxl)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--sh-lg)' }}>
          <div style={{ fontSize: 13.5, color: 'var(--s600)' }}>
            {answered < questions.length
              ? <span style={{ color: 'var(--a600)' }}>{questions.length - answered} unanswered</span>
              : <span style={{ color: 'var(--g600)' }}>All questions answered</span>
            }
          </div>
          <button
            className="btn btn-p"
            onClick={submit}
            disabled={answered === 0}
            style={{ background: col, borderColor: col }}
          >
            Submit Answers
          </button>
        </div>
      </div>
    )
  }
 
  // ── RESULT SCREEN ────────────────────────────────────────
  if (stage === 'result' && result) {
    const col = subjectColour(subject)
    const wrong = questions.filter(q => answers[q.id] && answers[q.id] !== q.answer)
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: result.score >= 80 ? 'var(--g50)' : result.score >= 60 ? 'var(--b50)' : 'var(--a50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span className="mono" style={{
              fontSize: 28, fontWeight: 700,
              color: result.score >= 80 ? 'var(--g600)' : result.score >= 60 ? 'var(--b700)' : 'var(--a600)',
            }}>{result.score}%</span>
          </div>
          <h2 className="serif" style={{ fontSize: 26, color: 'var(--s900)', marginBottom: 6 }}>
            {result.score >= 80 ? 'Excellent work!' : result.score >= 60 ? 'Good effort!' : 'Keep practising!'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--s500)', marginBottom: 20 }}>
            {topic} — {subject}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              ['Correct', `${result.correct}/${questions.length}`, 'var(--b50)', 'var(--b700)'],
              ['XP Earned', `+${result.xpEarned}`, 'var(--p50, var(--a50))', 'var(--p600, var(--a600))'],
              ['Total XP', xp.toLocaleString(), 'var(--g50)', 'var(--g600)'],
            ].map(([l, v, bg, c]) => (
              <div key={l} style={{ background: bg, borderRadius: 'var(--rmd)', padding: '14px 10px' }}>
                <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                <div style={{ fontSize: 11.5, color: 'var(--s500)', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-p" onClick={() => startQuiz(subject, topic)} style={{ background: col, borderColor: col }}>
              Try Again
            </button>
            <button className="btn btn-s" onClick={resetToPick}>Pick Another Topic</button>
            <button className="btn btn-s" onClick={() => goTo?.('dashboard')}>Back to Dashboard</button>
          </div>
        </div>
 
        {/* Review wrong answers */}
        {wrong.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div className="sec-tag" style={{ marginBottom: 8 }}>Review</div>
            <h3 className="serif" style={{ fontSize: 18, color: 'var(--s900)', marginBottom: 14 }}>
              Let&apos;s look at what you missed
            </h3>
            {wrong.map((q, i) => (
              <div key={i} className="card" style={{ marginBottom: 10, borderLeft: '4px solid var(--r500)' }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--s900)', marginBottom: 8 }}>
                  Q{q.id}: {q.q}
                </div>
                <div style={{ fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: 'var(--s500)' }}>Your answer: </span>
                  <span style={{ color: 'var(--r600)', fontWeight: 600 }}>{answers[q.id]}</span>
                </div>
                <div style={{ fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: 'var(--s500)' }}>Correct answer: </span>
                  <span style={{ color: 'var(--g700)', fontWeight: 600 }}>{q.answer}</span>
                </div>
                {q.explanation && (
                  <div style={{ fontSize: 12.5, color: 'var(--s600)', fontStyle: 'italic', background: 'var(--bg)', padding: '8px 12px', borderRadius: 'var(--rsm)' }}>
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
 
  return null
}
          
 // ═══════════════════════════════════════════════════════════
// ACHIEVEMENTS TAB — reads from PracticeTab's localStorage
// ═══════════════════════════════════════════════════════════
function AchievementsTab({ user }) {
  // Read same keys that PracticeTab writes
  const xp   = (() => { try { return parseInt(localStorage.getItem('sm_practice_xp') || '0', 10) || 0 } catch { return 0 } })()
  const hist = (() => { try { return JSON.parse(localStorage.getItem('sm_practice_history') || '[]') } catch { return [] } })()
 
  // Calculate streaks from history dates
  const calcStreak = (sessions) => {
    if (sessions.length === 0) return 0
    const days = new Set(sessions.map(s => new Date(s.date).toDateString()))
    let streak = 0
    let cursor = new Date()
    // Look back day by day; allow today + consecutive prior days
    // First check: did they practice today OR yesterday? (yesterday because they might
    // not have practiced yet today but the streak isn't broken)
    const today     = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    if (!days.has(today) && !days.has(yesterday)) return 0
    if (!days.has(today)) cursor = new Date(Date.now() - 86400000)
 
    while (days.has(cursor.toDateString())) {
      streak++
      cursor = new Date(cursor.getTime() - 86400000)
    }
    return streak
  }
 
  const streak           = calcStreak(hist)
  const sessionCount     = hist.length
  const subjectsPracticed = [...new Set(hist.map(h => h.subject))]
  const avgScore         = hist.length ? Math.round(hist.reduce((s, h) => s + h.score, 0) / hist.length) : 0
  const bestScore        = hist.length ? Math.max(...hist.map(h => h.score)) : 0
  const bestEver         = hist.find(h => h.score === bestScore)
 
  // Per-subject averages (for Subject Specialist badge)
  const subjectAverages = {}
  subjectsPracticed.forEach(subj => {
    const subjSessions = hist.filter(h => h.subject === subj)
    subjectAverages[subj] = Math.round(subjSessions.reduce((s, h) => s + h.score, 0) / subjSessions.length)
  })
  const hasSpecialty = Object.values(subjectAverages).some(avg => avg >= 80)
  const specialtySubject = Object.entries(subjectAverages).find(([_, avg]) => avg >= 80)?.[0]
 
  // ── BADGES — earned conditions ───────────────────────────
  const badges = [
    { id:'first',       name:'First Steps',       desc:'Complete your first session',   tier:'bronze', earned: sessionCount >= 1 },
    { id:'quick',       name:'Quick Learner',     desc:'Score 60%+ on a session',         tier:'bronze', earned: bestScore >= 60 },
    { id:'high',        name:'High Achiever',     desc:'Score 80%+ on a session',         tier:'silver', earned: bestScore >= 80 },
    { id:'perfect',     name:'Perfectionist',     desc:'Score 100% on a session',         tier:'gold',   earned: bestScore >= 100 },
    { id:'dedicated',   name:'Dedicated',         desc:'Complete 5 sessions',             tier:'bronze', earned: sessionCount >= 5 },
    { id:'committed',   name:'Committed',         desc:'Complete 25 sessions',            tier:'silver', earned: sessionCount >= 25 },
    { id:'scholar',     name:'Scholar',           desc:'Complete 100 sessions',           tier:'gold',   earned: sessionCount >= 100 },
    { id:'xp100',       name:'Centurion',         desc:'Earn 100 XP',                     tier:'bronze', earned: xp >= 100 },
    { id:'xp500',       name:'Half Millennium',   desc:'Earn 500 XP',                     tier:'silver', earned: xp >= 500 },
    { id:'xp1000',      name:'Millennium',        desc:'Earn 1,000 XP',                   tier:'gold',   earned: xp >= 1000 },
    { id:'xp5000',      name:'Legend',            desc:'Earn 5,000 XP',                   tier:'platinum', earned: xp >= 5000 },
    { id:'streak3',     name:'3-Day Streak',      desc:'Practice 3 days in a row',        tier:'bronze', earned: streak >= 3 },
    { id:'streak7',     name:'Week Warrior',      desc:'Practice 7 days in a row',        tier:'silver', earned: streak >= 7 },
    { id:'streak30',    name:'Monthly Master',    desc:'Practice 30 days in a row',       tier:'platinum', earned: streak >= 30 },
    { id:'renaissance', name:'Renaissance',       desc:'Practice 3 different subjects',   tier:'silver', earned: subjectsPracticed.length >= 3 },
    { id:'allrounder',  name:'All Rounder',       desc:'Practice all 5 subjects',         tier:'gold',   earned: subjectsPracticed.length >= 5 },
    { id:'specialist',  name:'Subject Specialist',desc:'Average 80%+ in any subject',     tier:'gold',   earned: hasSpecialty },
  ]
 
  const earnedBadges = badges.filter(b => b.earned)
  const lockedBadges = badges.filter(b => !b.earned)
 
  // Tier styling
  const tierStyles = {
    bronze:   { bg:'#CD7F3220', border:'#CD7F32', icon:'#CD7F32' },
    silver:   { bg:'#C0C0C020', border:'#9CA3AF', icon:'#6B7280' },
    gold:     { bg:'#F0CC5A20', border:'#F0CC5A', icon:'#C9973A' },
    platinum: { bg:'#E5E4E220', border:'#94A3B8', icon:'#475569' },
  }
 
  // Next level XP target — 1,000 XP per level
  const currentLevel    = Math.floor(xp / 1000) + 1
  const xpThisLevel     = xp % 1000
  const xpToNextLevel   = 1000 - xpThisLevel
  const levelProgressPct = Math.round((xpThisLevel / 1000) * 100)
 
  // Top-3 milestone close to unlocking
  const closeBadges = lockedBadges
    .map(b => {
      let progress = 0, target = 1
      if (b.id === 'first')       { progress = sessionCount; target = 1 }
      else if (b.id === 'quick')  { progress = bestScore; target = 60 }
      else if (b.id === 'high')   { progress = bestScore; target = 80 }
      else if (b.id === 'perfect'){ progress = bestScore; target = 100 }
      else if (b.id === 'dedicated'){ progress = sessionCount; target = 5 }
      else if (b.id === 'committed'){ progress = sessionCount; target = 25 }
      else if (b.id === 'scholar'){ progress = sessionCount; target = 100 }
      else if (b.id === 'xp100')  { progress = xp; target = 100 }
      else if (b.id === 'xp500')  { progress = xp; target = 500 }
      else if (b.id === 'xp1000') { progress = xp; target = 1000 }
      else if (b.id === 'xp5000') { progress = xp; target = 5000 }
      else if (b.id === 'streak3'){ progress = streak; target = 3 }
      else if (b.id === 'streak7'){ progress = streak; target = 7 }
      else if (b.id === 'streak30'){ progress = streak; target = 30 }
      else if (b.id === 'renaissance'){ progress = subjectsPracticed.length; target = 3 }
      else if (b.id === 'allrounder'){ progress = subjectsPracticed.length; target = 5 }
      else if (b.id === 'specialist'){
        const bestAvg = Math.max(0, ...Object.values(subjectAverages))
        progress = bestAvg; target = 80
      }
      return { ...b, progress, target, pct: Math.min(100, Math.round((progress/target)*100)) }
    })
    .sort((a,b) => b.pct - a.pct)
    .slice(0, 3)
 
  return (
    <div>
      {/* Hero */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
        color: '#fff',
      }}>
        <div style={{ padding: '28px 32px 22px', display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          {/* Level badge */}
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'rgba(240,204,90,.18)',
            border: '3px solid #F0CC5A',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,.25)',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#F0CC5A', opacity: .85 }}>
              Level
            </div>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#F0CC5A', lineHeight: 1 }}>
              {currentLevel}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 4 }}>
              Your Achievements
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              {earnedBadges.length === 0
                ? 'Start practising to earn your first badge'
                : earnedBadges.length < 5
                ? "You're on your way"
                : earnedBadges.length < 10
                ? 'Strong progress, keep it up'
                : 'You are an achiever'}
            </h2>
            <div style={{ fontSize: 13.5, opacity: .85, marginTop: 6 }}>
              {earnedBadges.length} of {badges.length} badges earned · {xpToNextLevel.toLocaleString()} XP to Level {currentLevel + 1}
            </div>
          </div>
        </div>
        {/* XP progress bar inside hero */}
        <div style={{ background: 'rgba(0,0,0,.2)', padding: '12px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: .75, marginBottom: 5 }}>
            <span>{xpThisLevel} / 1,000 XP</span>
            <span className="mono">{levelProgressPct}%</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,.1)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              width: levelProgressPct + '%',
              height: '100%',
              background: 'linear-gradient(90deg, #F0CC5A, #C9973A)',
              borderRadius: 99,
              transition: 'width 1s ease',
            }}/>
          </div>
        </div>
        {/* Stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
          {[
            ['Total XP',      xp.toLocaleString()],
            ['Day Streak',    streak === 0 ? '0' : `${streak} day${streak === 1 ? '' : 's'}`],
            ['Sessions',      sessionCount],
            ['Best Score',    sessionCount ? `${bestScore}%` : '—'],
            ['Avg Score',     sessionCount ? `${avgScore}%` : '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,.08)', borderTop: '1px solid rgba(255,255,255,.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6, marginBottom: 3 }}>
                {label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
 
      {/* Empty state if no sessions yet */}
      {sessionCount === 0 ? (
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: 'var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="var(--s400)" strokeWidth="1.5" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 17, color: 'var(--s800)', marginBottom: 6 }}>Your achievements will appear here</h3>
          <p style={{ fontSize: 13.5, color: 'var(--s500)', maxWidth: 380, margin: '0 auto' }}>
            Complete your first practice session to start earning XP and unlocking badges.
          </p>
        </div>
      ) : (
        <>
          {/* Almost-there badges */}
          {closeBadges.length > 0 && (
            <div className="card" style={{ marginBottom: 18 }}>
              <div className="ctitle" style={{ marginBottom: 14 }}>Almost there</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {closeBadges.map(b => {
                  const tier = tierStyles[b.tier]
                  return (
                    <div key={b.id} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: tier.bg, border: `2px solid ${tier.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, opacity: .55, filter: 'grayscale(.4)',
                      }}>
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={tier.icon} strokeWidth="2" strokeLinecap="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s800)' }}>{b.name}</div>
                          <div className="mono" style={{ fontSize: 12, color: 'var(--s500)' }}>
                            {b.progress} / {b.target}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 5 }}>{b.desc}</div>
                        <div style={{ height: 5, background: 'var(--s100)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ width: b.pct + '%', height: '100%', background: tier.icon, borderRadius: 99, transition: 'width 1s ease' }}/>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
 
          {/* Earned badges */}
          {earnedBadges.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 12 }}>
                <div className="sec-tag">Earned · {earnedBadges.length}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {earnedBadges.map(b => {
                  const tier = tierStyles[b.tier]
                  return (
                    <div key={b.id} style={{
                      background: '#fff',
                      border: `2px solid ${tier.border}`,
                      borderRadius: 'var(--rlg)',
                      padding: '18px 14px',
                      textAlign: 'center',
                      position: 'relative',
                      transition: 'all .2s',
                      boxShadow: `0 4px 12px ${tier.bg}`,
                    }}>
                      {/* Tier ribbon */}
                      <div style={{
                        position: 'absolute', top: 8, right: 8,
                        background: tier.icon, color: '#fff',
                        fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                        padding: '2px 7px', borderRadius: 99,
                      }}>
                        {b.tier}
                      </div>
                      <div style={{
                        width: 56, height: 56, margin: '0 auto 10px', borderRadius: '50%',
                        background: tier.bg, border: `2px solid ${tier.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="28" height="28" fill={tier.icon} stroke={tier.icon} strokeWidth="1" viewBox="0 0 24 24">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--s900)', marginBottom: 3 }}>{b.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--s500)' }}>{b.desc}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
 
          {/* Locked badges */}
          {lockedBadges.length > 0 && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <div className="sec-tag">Locked · {lockedBadges.length}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {lockedBadges.map(b => {
                  const tier = tierStyles[b.tier]
                  return (
                    <div key={b.id} style={{
                      background: 'var(--bg)',
                      border: '1.5px solid var(--s200)',
                      borderRadius: 'var(--rlg)',
                      padding: '18px 14px',
                      textAlign: 'center',
                      opacity: .55,
                      filter: 'grayscale(.5)',
                      transition: 'all .2s',
                    }}>
                      <div style={{
                        position: 'absolute', top: 0, right: 0,
                      }}/>
                      <div style={{
                        width: 56, height: 56, margin: '0 auto 10px', borderRadius: '50%',
                        background: 'var(--s100)', border: '2px solid var(--s200)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--s400)" strokeWidth="2" strokeLinecap="round">
                          <rect x="3" y="11" width="18" height="11" rx="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--s700)', marginBottom: 3 }}>{b.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--s500)' }}>{b.desc}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

 // ═══════════════════════════════════════════════════════════
// EXAMS TAB — uses QUESTION_BANK from PracticeTab paste
// ═══════════════════════════════════════════════════════════
const EXAM_DURATION_SECONDS = 60 * 60  // 60 minutes
// Demo exam-history helpers removed with the practice-exam path.
// Results now come from the API rather than localStorage.
 
// Curriculum ids are database values, not display text. "CambridgePrimary"
// on a student's screen looks like a bug.
const CURRICULUM_LABEL = {
  CambridgePrimary:'Cambridge Primary', CambridgeLowerSec:'Cambridge Lower Secondary',
  CambridgeIGCSE:'Cambridge IGCSE', CambridgeALevel:'Cambridge A Level',
  EdexcelLowerSec:'Edexcel Lower Secondary', EdexcelIGCSE:'Edexcel International GCSE',
  EdexcelALevel:'Edexcel International A Level', AQALowerSec:'AQA Lower Secondary',
  AQAGCSE:'AQA GCSE', AQAALevel:'AQA A Level', IBPYP:'IB PYP', IBMYP:'IB MYP', IBDP:'IB Diploma',
  BNC:'British National Curriculum', American:'American Curriculum',
  Canadian:'Canadian Curriculum', KenyaCBC:'Kenya CBC',
}
const prettyCurriculum = (c) =>
  CURRICULUM_LABEL[c] || String(c || '').replace(/([a-z])([A-Z])/g, '$1 $2')

/**
 * ModuleCard — the house listing card for the student portal.
 *
 * The exam module's card design (accent top border, serif title, 2x2 stat
 * tiles, footer action) is now the standard for every listing, so a
 * student meets the same shape whether they are looking at exams,
 * homework, live classes or the library. Previously each tab invented its
 * own row style and the portal read as several products stitched together.
 *
 * Props
 *   accent    colour of the top border and the footer button
 *   badges    [{ label, bg, fg }] — status pills across the top
 *   eyebrow   small uppercase line under the title (subject, curriculum)
 *   title     the item name
 *   tiles     [[label, value]] — up to four; rendered as the 2x2 grid
 *   meta      one muted line under the tiles (date, teacher)
 *   note      optional coloured strip, e.g. a released result
 *   footer    JSX for the foot of the card (button or status text)
 *   onClick   optional — makes the whole card clickable
 *   dimmed    reduces opacity for locked/unavailable items
 */
function ModuleCard({ accent, badges = [], eyebrow, title, tiles = [], meta, note, footer, onClick, dimmed }) {
  return (
    <div
      onClick={onClick}
      className="card sm-glow sm-glow-card"
      style={{
        padding: 0, overflow: 'hidden',
        borderTop: `4px solid ${accent}`,
        display: 'flex', flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        opacity: dimmed ? 0.62 : 1,
        transition: 'opacity .2s',
      }}>
      <div style={{ padding: '18px 20px 14px', flex: 1 }}>
        {badges.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {badges.map((b, i) => (
              <span key={i} style={{
                background: b.bg, color: b.fg,
                fontSize: 9.5, fontWeight: 800, letterSpacing: '.08em',
                padding: '2px 8px', borderRadius: 99,
              }}>{b.label}</span>
            ))}
          </div>
        )}

        <div className="serif" style={{ fontSize: 18, color: 'var(--s900)', marginBottom: 4, lineHeight: 1.25 }}>
          {title}
        </div>
        {eyebrow && (
          <div style={{ fontSize: 11.5, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600 }}>
            {eyebrow}
          </div>
        )}

        {tiles.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, margin: '14px 0 0' }}>
            {tiles.slice(0, 4).map(([l, v]) => (
              <div key={l} style={{ background: 'var(--bg)', borderRadius: 'var(--rsm)', padding: '8px 10px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--s400)' }}>{l}</div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--s800)' }}>{v}</div>
              </div>
            ))}
          </div>
        )}

        {meta && <div style={{ fontSize: 12, color: 'var(--s500)', marginTop: 12 }}>{meta}</div>}
        {note}
      </div>

      {footer && (
        <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
          {footer}
        </div>
      )}
    </div>
  )
}

/** Standard responsive grid for ModuleCard listings. */
const MODULE_GRID = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }

const fmtExamTime = (s) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
 
const gradeFor = (pct) => {
  if (pct >= 90) return { grade: 'A*', colour: 'var(--g600)', message: 'Outstanding!' }
  if (pct >= 80) return { grade: 'A',  colour: 'var(--g600)', message: 'Excellent!' }
  if (pct >= 70) return { grade: 'B',  colour: 'var(--b700)', message: 'Very good.' }
  if (pct >= 60) return { grade: 'C',  colour: 'var(--b700)', message: 'Good. Pass.' }
  if (pct >= 50) return { grade: 'D',  colour: 'var(--a600)', message: 'Borderline pass.' }
  if (pct >= 40) return { grade: 'E',  colour: 'var(--a600)', message: 'Below pass.' }
  return         { grade: 'U',         colour: 'var(--r500)', message: 'Ungraded — review and retry.' }
}
 
const examShuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
 
function ExamsTab({ user, toast, goTo, store }) {
  const [stage,    setStage]    = useState('list')   // 'list' | 'real-sitting' | 'real-result'
  const [subject,  setSubject]  = useState(null)
  const [answers,  setAnswers]  = useState({})
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS)
  const [result,   setResult]   = useState(null)

  // ── Real exams assigned by teachers (from backend) ──
  // Source: GET /api/exams/student/list. Refreshes whenever the student
  // returns to the list view.
  const [scheduledExams, setScheduledExams] = useState([])
  const [scheduledLoading, setScheduledLoading] = useState(true)

  const loadScheduledExams = async () => {
    setScheduledLoading(true)
    try {
      const { data } = await api.get('/exams/student/list')
      if (data?.success) {
        setScheduledExams(data.data?.exams || [])
      } else {
        setScheduledExams([])
      }
    } catch (e) {
      console.error('[exams student/list] failed:', e?.response?.data?.message || e.message)
      setScheduledExams([])
    } finally {
      setScheduledLoading(false)
    }
  }

  useEffect(() => {
    if (stage === 'list') loadScheduledExams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  // ─────────────────────────────────────────────────────
  // REAL EXAM FLOW — backend-driven (separate from practice)
  // ─────────────────────────────────────────────────────
  // The "practice" exam at stage='sitting'/'result' uses the local
  // QUESTION_BANK and runs entirely client-side. The "real" exam
  // at stage='real-sitting'/'real-result' is loaded from the backend
  // via GET /api/exams/:id/take, answered in the UI, and submitted
  // via POST /api/exams/:id/submit. Auto-grading happens server-side
  // for MCQs; short/long answers wait for teacher marking.
  const [realExam, setRealExam] = useState(null)
  const [realBankQuestions, setRealBankQuestions] = useState([])
  const [realAnswers, setRealAnswers] = useState({})  // { [questionRef]: { answerText, selectedOption } }
  const [realTimeLeft, setRealTimeLeft] = useState(0) // seconds
  const [realSubmitting, setRealSubmitting] = useState(false)
  const [realResult, setRealResult] = useState(null)
  const [realIntegrity, setRealIntegrity] = useState({ tabSwitches: 0, copyPasteAttempts: 0 })
  const realStartTimeRef = useRef(null)
  // Autosave status, surfaced to the student so they can see their work
  // is being kept. Silence here reads as data loss even when nothing is
  // wrong, so the indicator matters as much as the saving does.
  const [realSavedAt, setRealSavedAt] = useState(null)
  const [realSaving, setRealSaving] = useState(false)
  const realAnswersRef = useRef({})
  const realIntegrityRef = useRef({ tabSwitches: 0, copyPasteAttempts: 0 })

  // Build the unified question list a real exam needs to render:
  // bank questions (full docs from server) followed by custom questions
  // (embedded in the exam doc, addressed as 'custom:N').
  const realQuestionsForRender = (() => {
    if (!realExam) return []
    const bank = (realBankQuestions || []).map(q => ({
      ref: String(q._id),
      type: q.type || 'short',
      questionText: q.questionText || q.question || '',
      options: q.options || [],
      marks: q.marks || 0,
      topic: q.topic || '',
      parts: Array.isArray(q.parts) ? q.parts : [],
      attachments: Array.isArray(q.attachments) ? q.attachments : [],
      _source: 'bank',
    }))
    const custom = (realExam.customQuestions || []).map((q, i) => ({
      ref: 'custom:' + i,
      type: q.type || 'short',
      questionText: q.questionText || '',
      options: q.options || [],
      marks: q.marks || 0,
      topic: q.topic || '',
      parts: Array.isArray(q.parts) ? q.parts : [],
      attachments: Array.isArray(q.attachments) ? q.attachments : [],
      _source: 'custom',
    }))
    return [...bank, ...custom]
  })()

  const startRealExam = async (examId) => {
    if (!examId) return
    try {
      const { data } = await api.get('/exams/' + examId + '/take')
      if (!data?.success) {
        toast?.error?.(data?.message || 'Could not open exam.')
        return
      }
      const exam = data.data?.exam
      const bank = data.data?.bankQuestions || []
      const sub  = data.data?.submission

      setRealExam(exam)
      setRealBankQuestions(bank)
      setRealResult(null)

      // Restore anything autosaved on a previous attempt at this sitting.
      // A student whose browser crashed or whose connection dropped comes
      // back to their work rather than a blank paper.
      const restored = {}
      ;(sub?.answers || []).forEach(a => {
        if (!a?.questionRef) return
        const key = (a.partPath && a.partPath.length)
          ? `${a.questionRef}::${a.partPath.join('.')}`
          : a.questionRef
        restored[key] = { answerText: a.answerText || '', selectedOption: a.selectedOption || '' }
      })
      setRealAnswers(restored)
      if (Object.keys(restored).length) {
        toast?.ok?.(`Restored ${Object.keys(restored).length} saved answer(s) from your last session.`)
      }

      // Integrity counters resume from the server so closing the tab
      // cannot be used to reset them.
      setRealIntegrity({
        tabSwitches: Number(sub?.tabSwitches) || 0,
        copyPasteAttempts: Number(sub?.copyPasteAttempts) || 0,
      })
      setRealSavedAt(sub?.lastSavedAt ? new Date(sub.lastSavedAt) : null)

      // Time remaining: durationMins - secondsSinceSubmissionStart
      // (so refresh doesn't reset; honours the submission record's startedAt)
      const startedAt = sub?.startedAt ? new Date(sub.startedAt).getTime() : Date.now()
      realStartTimeRef.current = startedAt
      const elapsedMs = Date.now() - startedAt
      const totalMs   = (exam.durationMins || 60) * 60000
      const remaining = Math.max(0, Math.floor((totalMs - elapsedMs) / 1000))
      setRealTimeLeft(remaining)

      setStage('real-sitting')
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Network error.'
      console.error('[real-exam start] failed:', msg)
      toast?.error?.('Could not start: ' + msg)
    }
  }

  // Keep refs in step with state so the autosave interval always sends
  // the latest answers without needing to be torn down and rebuilt.
  useEffect(() => { realAnswersRef.current = realAnswers }, [realAnswers])
  useEffect(() => { realIntegrityRef.current = realIntegrity }, [realIntegrity])

  /**
   * AUTOSAVE. Answers previously lived only in React state and the only
   * write was the final submit, so a crashed tab or a dropped connection
   * lost the entire paper. Saves every 25 seconds, and immediately when
   * the tab is hidden or the window is about to close.
   */
  const realExamRef = useRef(null)
  useEffect(() => { realExamRef.current = realExam }, [realExam])

  const saveRealProgress = useCallback(async (silent = true) => {
    const exam = realExamRef.current
    if (!exam?._id) return
    const payload = Object.entries(realAnswersRef.current || {}).map(([key, v]) => {
      const [questionRef, path] = key.split('::')
      return {
        questionRef,
        partPath: path ? path.split('.').map(Number) : [],
        answerText: v?.answerText || '',
        selectedOption: v?.selectedOption || '',
      }
    })
    if (!payload.length) return
    try {
      if (!silent) setRealSaving(true)
      const { data } = await api.post('/exams/' + exam._id + '/save', {
        answers: payload,
        tabSwitches: realIntegrityRef.current.tabSwitches,
        copyPasteAttempts: realIntegrityRef.current.copyPasteAttempts,
      })
      if (data?.success) setRealSavedAt(new Date(data.data?.savedAt || Date.now()))
    } catch (e) {
      // Never interrupt a student mid-paper for a failed autosave; the
      // next tick retries and the final submit carries everything anyway.
      console.warn('[exam autosave] failed:', e?.response?.data?.message || e.message)
    } finally { setRealSaving(false) }
  }, [])

  useEffect(() => {
    if (stage !== 'real-sitting') return
    const id = setInterval(() => saveRealProgress(true), 25000)
    const onHide = () => { if (document.hidden) saveRealProgress(true) }
    const onUnload = () => { saveRealProgress(true) }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('beforeunload', onUnload)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('beforeunload', onUnload)
      saveRealProgress(true)          // save on leaving the sitting view
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  // Countdown for the real exam timer. Auto-submits at zero.
  useEffect(() => {
    if (stage !== 'real-sitting') return
    if (realTimeLeft <= 0) {
      submitRealExam(/* timedOut */ true)
      return
    }
    const t = setTimeout(() => setRealTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, realTimeLeft])

  // Integrity: detect tab switches and copy/paste attempts during sitting
  useEffect(() => {
    if (stage !== 'real-sitting') return
    const onVisChange = () => {
      if (document.hidden) setRealIntegrity(s => ({ ...s, tabSwitches: s.tabSwitches + 1 }))
    }
    const onPaste = (e) => {
      setRealIntegrity(s => ({ ...s, copyPasteAttempts: s.copyPasteAttempts + 1 }))
      // Don't block — just count
    }
    document.addEventListener('visibilitychange', onVisChange)
    document.addEventListener('paste', onPaste)
    return () => {
      document.removeEventListener('visibilitychange', onVisChange)
      document.removeEventListener('paste', onPaste)
    }
  }, [stage])

  const submitRealExam = async (timedOut = false) => {
    if (realSubmitting) return
    if (!realExam) return
    setRealSubmitting(true)
    try {
      // realAnswers is keyed by 'questionRef|partPath'. The helper flattens
      // that into the API payload shape: { questionRef, partPath, answerText,
      // selectedOption } — works for both flat (partPath:[]) and nested
      // questions, without the sitting screen needing to know which is which.
      const answersPayload = buildAnswersPayload(realAnswers)
      const timeSpentSecs = realStartTimeRef.current
        ? Math.floor((Date.now() - realStartTimeRef.current) / 1000)
        : 0
      const { data } = await api.post('/exams/' + realExam._id + '/submit', {
        answers: answersPayload,
        timeSpentSecs,
        tabSwitches:       realIntegrity.tabSwitches,
        copyPasteAttempts: realIntegrity.copyPasteAttempts,
      })
      if (data?.success) {
        setRealResult(data.data?.submission)
        setStage('real-result')
        if (timedOut) toast?.info?.('Time is up — exam auto-submitted.')
      } else {
        toast?.error?.(data?.message || 'Failed to submit.')
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Network error.'
      console.error('[real-exam submit] failed:', msg)
      toast?.error?.('Could not submit: ' + msg)
    } finally {
      setRealSubmitting(false)
    }
  }

  // Helper: format mm:ss
  const formatMSS = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0')
  }

  // Compute live status from start time + duration
  const computeExamStatus = (exam) => {
    if (exam.computedStatus) return exam.computedStatus  // backend already computed it
    const now = Date.now()
    const start = new Date(exam.startAt).getTime()
    const end = start + (exam.durationMins || 0) * 60000
    if (now < start) return 'scheduled'
    if (now <= end)  return 'active'
    return 'ended'
  }
  // Format start time relative to now
  const formatExamWhen = (iso) => {
    const d = new Date(iso)
    const opts = { weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }
    return d.toLocaleString(undefined, opts)
  }

  // The self-serve practice exam was removed. Exams come only from
  // teachers via the API, so there is no local question fixture and no
  // second timer — the real-sitting countdown owns that.
 
 
 
 
  // Released results — read from the actual logged-in student name
  const studentFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  const releasedResults = (() => {
    try { return store?.getStudentResults?.(studentFullName) || [] }
    catch { return [] }
  })()

  // ─────────────────────────────────────────────────────
  // REAL EXAM — SITTING SCREEN
  // ─────────────────────────────────────────────────────
  if (stage === 'real-sitting' && realExam) {
    const qs = realQuestionsForRender
    // Count answered SLOTS, not just top-level questions. For nested
    // questions each leaf is its own slot. realAnswers is keyed by
    // 'questionRef|partPath' so every populated key = one answered leaf.
    const answered = Object.values(realAnswers || {}).filter(a => {
      return a && ((a.answerText && a.answerText.trim()) || a.selectedOption)
    }).length
    // Count total leaves across all questions for the denominator
    const totalSlots = qs.reduce((sum, q) => {
      if (!Array.isArray(q.parts) || q.parts.length === 0) return sum + 1
      let leafCount = 0
      const walk = (parts) => parts.forEach(p => {
        if (Array.isArray(p.parts) && p.parts.length > 0) walk(p.parts)
        else leafCount += 1
      })
      walk(q.parts)
      return sum + leafCount
    }, 0)
    const lowTime = realTimeLeft < 60
    const subjCol = subjectColour(realExam.subject)

    return (
      <div>
        {/* ── Exam header, in the house card format ──────────────
            Ported from the practice-exam layout: a bordered card with
            the subject-coloured pill timer, rather than the raw amber
            alert box this used before. Same information, and it now
            matches the rest of the portal. */}
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rxl)',
          padding: '14px 24px',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 14,
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ minWidth: 220 }}>
            <div className="serif" style={{ fontSize: 18, color: 'var(--s900)' }}>
              {realExam.title}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--s400)' }}>
              <span style={{ color: subjCol, fontWeight: 600 }}>{realExam.subject}</span>
              {' · '}{qs.length} question{qs.length === 1 ? '' : 's'}
              {' · '}{realExam.totalMarks || 0} marks
              {realExam.paperNumber ? ` · ${realExam.paperNumber}` : ''}
            </div>
            {/* Autosave indicator. A student who cannot see that work is
                being kept assumes it is not, so this is part of the
                feature rather than decoration. */}
            <div style={{
              fontSize: 11, fontWeight: 600, color: 'var(--s500)',
              display: 'flex', alignItems: 'center', gap: 6, marginTop: 4,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: realSaving ? '#D97706' : (realSavedAt ? '#059669' : '#94A3B8'),
                flexShrink: 0,
              }}/>
              {realSaving
                ? 'Saving\u2026'
                : realSavedAt
                  ? `Answers saved ${realSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Answers save automatically'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: 'var(--s500)' }}>
              <span style={{ fontWeight: 700, color: 'var(--s900)' }}>{answered}</span>/{totalSlots} answered
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 99,
              background: lowTime ? 'var(--r50)' : 'var(--bg)',
              border: `1.5px solid ${lowTime ? 'var(--r500)' : 'var(--border)'}`,
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={lowTime ? 'var(--r600)' : 'var(--s700)'} strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: lowTime ? 'var(--r600)' : 'var(--s800)' }}>
                {formatMSS(realTimeLeft)}
              </span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Submit now? You will not be able to change answers after this.')) {
                  submitRealExam(false)
                }
              }}
              disabled={realSubmitting}
              style={{
                background: realSubmitting ? '#9CA3AF' : '#7D1025',
                color: '#fff', border: 'none',
                padding: '9px 18px', borderRadius: 8,
                fontSize: 12.5, fontWeight: 700,
                cursor: realSubmitting ? 'not-allowed' : 'pointer',
              }}>
              {realSubmitting ? 'Submitting\u2026' : 'Submit Exam'}
            </button>
          </div>
        </div>

        {/* Progress bar — same as the practice format */}
        <div className="prog-bar" style={{ marginBottom: 18, height: 8 }}>
          <div className="prog-fill" style={{
            width: `${totalSlots ? (answered / totalSlots) * 100 : 0}%`,
            background: subjCol, transition: 'width .3s',
          }}/>
        </div>

        {/* Instructions */}
        {realExam.instructions && (
          <div style={{
            padding:'12px 14px',
            background:'#FBFAF5', border:'1px solid #E8E2D6',
            borderRadius:8, marginBottom:16,
            fontSize:13, color:'var(--s700)', lineHeight:1.55,
          }}>
            <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--s500)', marginBottom:4 }}>
              Instructions
            </div>
            {realExam.instructions}
          </div>
        )}

        {/* Questions */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {qs.map((q, i) => {
            const isNested = Array.isArray(q.parts) && q.parts.length > 0
            // Has this question been answered at all? Used to tint the card
            // border, exactly as the practice format did — it gives the
            // student an at-a-glance sense of what is left.
            const qTouched = Object.entries(realAnswers || {}).some(([k, v]) =>
              k.startsWith(q.ref) && v && ((v.answerText && v.answerText.trim()) || v.selectedOption))
            return (
              <div key={q.ref} className="card" style={{
                padding:16,
                background:'#fff',
                border:`1px solid ${qTouched ? subjCol : 'var(--border)'}`,
                borderRadius:'var(--rxl)',
                transition:'border-color .2s',
              }}>
                {/* Question number + stem */}
                <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                  <div className="mono" style={{
                    width:28, height:28, borderRadius:'50%',
                    background: qTouched ? subjCol : 'var(--s200)',
                    color: qTouched ? '#fff' : 'var(--s500)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12, fontWeight:700, flexShrink:0,
                    transition:'background .2s',
                  }}>{i+1}</div>
                  <div style={{ flex:1 }}>
                    {q.topic && (
                      <div style={{ fontSize:11, color:'var(--s400)', textTransform:'uppercase',
                                    letterSpacing:'.06em', fontWeight:600, marginBottom:4 }}>
                        {q.topic}
                      </div>
                    )}
                    {q.questionText && (
                      <div style={{ fontSize:15, fontWeight:500, color:'var(--s800)', lineHeight:1.5 }}>
                        {q.questionText}
                      </div>
                    )}
                    {Array.isArray(q.attachments) && q.attachments.length > 0 && (
                      <AttachmentList attachments={q.attachments} />
                    )}
                    <div style={{ fontSize:10.5, color:'var(--s500)', marginTop:4 }}>
                      {isNested
                        ? `${sumLeafMarks(q.parts)} marks total · ${q.parts.length} part${q.parts.length===1?'':'s'}`
                        : `${q.marks} mark${q.marks === 1 ? '' : 's'}`}
                    </div>
                  </div>
                </div>

                {/* Answer area: shared component handles both flat and nested */}
                <div style={{ marginLeft:46 }}>
                  <NestedAnswerCollector
                    questionRef={q.ref}
                    flatQuestion={!isNested ? {
                      type: q.type,
                      options: q.options,
                      text: '',  // stem already shown above
                    } : null}
                    parts={isNested ? q.parts : []}
                    answers={realAnswers}
                    onChange={setRealAnswers}
                    renderers={{
                      DrawingCanvas,
                      HandwritingCanvas,
                      // UploadInput: TODO — wire to Cloudinary uploader when ready
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Submit footer */}
        <div style={{
          marginTop:20, padding:'16px 0',
          borderTop:'1px solid var(--border)',
          display:'flex', alignItems:'center', gap:14, flexWrap:'wrap',
        }}>
          <div style={{ fontSize:12, color:'var(--s500)', flex:1 }}>
            {answered < totalSlots
              ? <span style={{ color:'#B45309' }}>{totalSlots - answered} unanswered</span>
              : <span style={{ color:'#15803D' }}>All answered ✓</span>}
            {' · '}{formatMSS(realTimeLeft)} remaining
          </div>
          <button
            onClick={() => {
              if (window.confirm('Submit now? You will not be able to change answers after this.')) {
                submitRealExam(false)
              }
            }}
            disabled={realSubmitting}
            style={{
              background: realSubmitting ? '#9CA3AF' : '#7D1025',
              color:'#fff', border:'none',
              padding:'10px 22px', borderRadius:6,
              fontSize:13, fontWeight:700,
              cursor: realSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {realSubmitting ? 'Submitting…' : 'Submit Exam'}
          </button>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────
  // REAL EXAM — POST-SUBMISSION CONFIRMATION
  // Per design: simple confirmation only. The student gets the
  // premium full breakdown in the Results module, not here.
  // ─────────────────────────────────────────────────────
  if (stage === 'real-result' && realResult) {
    const isGraded = realResult.status === 'graded'
    return (
      <div style={{ maxWidth: 560, margin: '40px auto 0' }}>
        <div className="card" style={{ textAlign:'center', padding:'40px 32px' }}>
          {/* Confirmation icon */}
          <div style={{
            width:88, height:88, borderRadius:'50%',
            background: isGraded
              ? 'linear-gradient(135deg, #C9A030 0%, #7D1025 100%)'
              : 'linear-gradient(135deg, #15803D 0%, #047857 100%)',
            color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 20px',
            boxShadow: isGraded
              ? '0 8px 32px rgba(125,16,37,.25)'
              : '0 8px 32px rgba(21,128,61,.25)',
          }}>
            <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <div className="serif" style={{ fontSize:30, color:'#1A1A1A', marginBottom:8, lineHeight:1.15 }}>
            {isGraded ? 'Already graded!' : 'Exam submitted'}
          </div>
          <div style={{ fontSize:14, color:'#6B6B6B', marginBottom:28, lineHeight:1.55 }}>
            {isGraded
              ? 'Your teacher has already finished marking. Your full results are ready in the Results section — including per-question feedback.'
              : 'Your answers are with your teacher for grading. You\u2019ll get a notification when they\u2019re ready. Until then, check your past results below.'}
          </div>

          {/* Show inline score teaser only if graded — full detail moves to Results module */}
          {isGraded && (
            <div style={{
              display:'inline-block',
              padding:'14px 28px',
              background:'#FBF6E3',
              border:'1px solid #C9A030',
              borderRadius:8,
              marginBottom:24,
            }}>
              <div className="mono" style={{ fontSize:28, fontWeight:700, color:'#7D1025' }}>
                {realResult.percentage || 0}%
              </div>
              <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#7D1025', marginTop:2 }}>
                Your Score{realResult.grade ? ' \u00b7 Grade ' + realResult.grade : ''}
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button
              onClick={() => {
                setStage('list')
                setRealExam(null)
                setRealResult(null)
                // Jump to Results module
                if (typeof goTo === 'function') goTo('results')
              }}
              style={{
                background:'#7D1025', color:'#fff', border:'none',
                padding:'12px 24px', borderRadius:8,
                fontSize:13, fontWeight:700, cursor:'pointer',
                display:'inline-flex', alignItems:'center', gap:8,
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
              </svg>
              View My Results
            </button>
            <button
              onClick={() => { setStage('list'); setRealExam(null); setRealResult(null) }}
              style={{
                background:'transparent', color:'#7D1025',
                border:'1.5px solid #7D1025',
                padding:'12px 24px', borderRadius:8,
                fontSize:13, fontWeight:700, cursor:'pointer',
              }}
            >
              Back to Exams
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── LIST SCREEN ──────────────────────────────────────────
  if (stage === 'list') {
    // Stats come from REAL graded submissions, not the old localStorage
    // practice history. A student's exam record should reflect what their
    // teacher actually marked, not self-run practice sittings.
    // Filter on STATUS, not on percentage being a number. percentage
    // defaults to 0 and is set to 0 on submit, so a submitted-but-unmarked
    // paper reads as a legitimate 0% — which is why the header showed
    // "7 graded, 0% pass rate, grade U" when nothing had actually been
    // marked. Only 'graded' and 'returned' carry a real score.
    const graded = scheduledExams.filter(e =>
      e.mySubmission && ['graded', 'returned'].includes(e.mySubmission.status))
    const pcts   = graded.map(e => e.mySubmission.percentage)
    const passRate = pcts.length ? Math.round((pcts.filter(x => x >= 60).length / pcts.length) * 100) : 0
    const avgGrade = pcts.length
      ? gradeFor(Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)).grade
      : '\u2014'
 
    return (
      <div>
        {/* ── Hero banner ────────────────────────────────────────
            The artwork carries the message, so no gradient, tint or
            text overlay is placed on it — anything laid over the image
            competes with the typography already in it. The stat strip
            sits underneath on solid crimson. */}
        <div className="card" style={{
          padding: 0, marginBottom: 18, overflow: 'hidden',
          maxWidth: 1180, marginLeft: 'auto', marginRight: 'auto',
        }}>
          <img
            src="/banners/exam-hero.jpg"
            alt="Success in your exam — prepare with confidence, stay focused, do your best"
            style={{ width: '100%', display: 'block', height: 'auto' }}
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            background: '#6B0F1E',
          }}>
            {[
              ['Exams Taken',  scheduledExams.length || '\u2014'],
              ['Graded',       pcts.length || '\u2014'],
              ['Pass Rate',    pcts.length ? `${passRate}%` : '\u2014'],
              ['Avg Grade',    avgGrade],
            ].map(([l, v]) => (
              <div key={l} style={{ padding: '13px 18px', borderRight: '1px solid rgba(201,160,48,.18)' }}>
                <div style={{
                  fontSize: 9.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
                  color: '#E8C97A', opacity: .85, marginBottom: 3,
                  textShadow: '0 0 10px rgba(201,160,48,.45)',
                }}>{l}</div>
                <div style={{
                  fontSize: 17, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace',
                  color: '#F5D98B',
                  textShadow: '0 0 12px rgba(245,217,139,.65), 0 0 26px rgba(201,160,48,.35)',
                }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
 
        {/* ═══════════════════════════════════════════════
            SCHEDULED EXAMS — set by teachers, fetched from API
            ═══════════════════════════════════════════════ */}
        <div className="card" style={{ marginBottom: 18, padding: 18 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, gap:12, flexWrap:'wrap' }}>
            <div>
              <div className="sec-tag">From Your Teachers</div>
              <h3 className="serif" style={{ fontSize: 20, color: 'var(--s900)', margin: '4px 0 0' }}>
                Scheduled Exams
              </h3>
            </div>
            <button
              onClick={loadScheduledExams}
              disabled={scheduledLoading}
              style={{
                background:'transparent', border:'1px solid var(--border)',
                padding:'6px 12px', borderRadius:6,
                fontSize:11, color:'var(--s500)', cursor: scheduledLoading ? 'wait' : 'pointer',
                fontWeight:600, letterSpacing:'.04em',
              }}
            >
              {scheduledLoading ? 'Loading…' : 'Refresh'}
            </button>
          </div>

          {scheduledLoading ? (
            <div style={{ padding:'16px 0', color:'var(--s500)', fontSize:13, textAlign:'center' }}>
              Loading exams from server...
            </div>
          ) : scheduledExams.length === 0 ? (
            <div style={{
              padding:'18px 16px', background:'#FBFAF5',
              border:'1px dashed #E8E2D6', borderRadius:8,
              fontSize:13, color:'var(--s500)', textAlign:'center',
            }}>
              No exams have been scheduled for you yet. Your teachers will assign exams here when they're ready.
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:14 }}>
              {/* De-duplicate defensively: an exam should never appear twice,
                  and a repeated _id in the payload would silently render two
                  identical cards with a React key collision. */}
              {Array.from(new Map(scheduledExams.map(e => [String(e._id), e])).values()).map(ex => {
                const status = computeExamStatus(ex)
                const submitted = ex.mySubmission && ['submitted','graded','returned'].includes(ex.mySubmission.status)
                const sCol  = status === 'active'    ? '#B91C1C'
                            : status === 'scheduled' ? '#B45309'
                            : '#64748B'
                const sBg   = status === 'active'    ? '#FEE2E2'
                            : status === 'scheduled' ? '#FEF3C7'
                            : '#F1F5F9'
                const sLabel= status === 'active'    ? 'LIVE NOW'
                            : status === 'scheduled' ? 'SCHEDULED'
                            : 'ENDED'
                const subjCol = subjectColour(ex.subject)
                const teacherName = ex.teacherId
                  ? `${ex.teacherId.firstName || ''} ${ex.teacherId.lastName || ''}`.trim()
                  : ''
                return (
                  <div key={ex._id} className="card sm-glow sm-glow-card" style={{
                    padding: 0, overflow: 'hidden',
                    borderTop: `4px solid ${subjCol}`,
                    display: 'flex', flexDirection: 'column',
                  }}>
                    <div style={{ padding: '18px 20px 14px', flex: 1 }}>
                      <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap', alignItems:'center' }}>
                        <span style={{
                          background:sBg, color:sCol,
                          fontSize:9.5, fontWeight:800, letterSpacing:'.08em',
                          padding:'2px 8px', borderRadius:99,
                        }}>{sLabel}</span>
                        {status === 'active' && (
                          <span style={{ width:7, height:7, borderRadius:'50%', background:'#B91C1C' }}/>
                        )}
                        {submitted && (
                          <span style={{
                            background:'var(--g50)', color:'var(--g700)',
                            fontSize:9.5, fontWeight:800, letterSpacing:'.08em',
                            padding:'2px 8px', borderRadius:99,
                          }}>{ex.mySubmission.status === 'graded' ? 'GRADED' : 'SUBMITTED'}</span>
                        )}
                      </div>

                      <div className="serif" style={{ fontSize: 18, color: 'var(--s900)', marginBottom: 4 }}>
                        {ex.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600 }}>
                        {ex.subject}{ex.grade ? ` \u00b7 ${prettyCurriculum(ex.curriculum)} ${ex.grade}` : ''}
                      </div>

                      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8, margin:'14px 0 0' }}>
                        {[
                          ['Questions', typeof ex.totalQuestions === 'number' ? ex.totalQuestions : '\u2014'],
                          ['Duration',  `${ex.durationMins} min`],
                          ['Marks',     ex.totalMarks || '\u2014'],
                          ['Paper',     ex.paperNumber || 'Paper 1'],
                        ].map(([l, v]) => (
                          <div key={l} style={{ background:'var(--bg)', borderRadius:'var(--rsm)', padding:'8px 10px' }}>
                            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--s400)' }}>{l}</div>
                            <div className="mono" style={{ fontSize:13, fontWeight:700, color:'var(--s800)' }}>{v}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize:12, color:'var(--s500)', marginTop:12 }}>
                        {formatExamWhen(ex.startAt)}{teacherName ? ` \u00b7 ${teacherName}` : ''}
                      </div>

                      {submitted && ex.mySubmission.status === 'graded' && (
                        <div style={{
                          background: ex.mySubmission.percentage >= 60 ? 'var(--g50)' : 'var(--a50)',
                          border: `1px solid ${ex.mySubmission.percentage >= 60 ? 'var(--g100)' : 'var(--a100)'}`,
                          borderRadius:'var(--rsm)', padding:'8px 12px', marginTop:12, fontSize:12.5,
                          color: ex.mySubmission.percentage >= 60 ? 'var(--g700)' : 'var(--a600)',
                        }}>
                          Result: <strong>{ex.mySubmission.totalScore}/{ex.mySubmission.maxScore || ex.totalMarks}</strong>
                          {' '}({ex.mySubmission.percentage}% \u00b7 {gradeFor(ex.mySubmission.percentage).grade})
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop:'auto', padding:'12px 16px', borderTop:'1px solid var(--border)', background:'var(--bg)' }}>
                      {submitted ? (
                        <div style={{ fontSize:12, color:'var(--s500)', textAlign:'center', fontWeight:600 }}>
                          {ex.mySubmission.status === 'graded' ? 'Marked by your teacher' : 'Awaiting marking'}
                        </div>
                      ) : status === 'active' ? (
                        <button className="btn btn-p"
                          style={{ width:'100%', justifyContent:'center', background:subjCol, borderColor:subjCol }}
                          onClick={() => startRealExam(ex._id)}>
                          Start Exam
                        </button>
                      ) : status === 'scheduled' ? (
                        <div style={{ fontSize:12, color:'var(--s500)', textAlign:'center' }}>Opens at start time</div>
                      ) : (
                        <div style={{ fontSize:12, color:'var(--s500)', textAlign:'center' }}>Closed \u2014 not attempted</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Released results from teacher */}
        {releasedResults.length > 0 && (
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="ctitle" style={{ marginBottom: 14 }}>Released Results from Teacher</div>
            <table className="tbl">
              <thead>
                <tr><th>Exam</th><th>Score</th><th>Grade</th><th>Date</th><th>Feedback</th></tr>
              </thead>
              <tbody>
                {releasedResults.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.exam}</td>
                    <td>
                      <span className="mono" style={{ fontWeight: 700, color: r.grade === 'A' || r.grade === 'B' ? 'var(--g600)' : 'var(--a600)' }}>
                        {r.score}/{r.total}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${r.grade === 'A' || r.grade === 'B' ? 'badge-green' : 'badge-amber'}`}>{r.grade}</span>
                    </td>
                    <td style={{ color: 'var(--s500)', fontSize: 13 }}>{r.date}</td>
                    <td style={{ fontSize: 12.5, color: 'var(--s500)', maxWidth: 220 }}>{r.feedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
 
 
      </div>
    )
  }
 
  // ── SITTING SCREEN ───────────────────────────────────────
 
  // ── RESULT SCREEN ────────────────────────────────────────
 
  return null
}
// ═══════════════════════════════════════════════════════════
// LIVE CLASSES TAB — unified list, status-based, real Zoom
// ═══════════════════════════════════════════════════════════
 
// Parse a schedule string like "Mon/Wed 9:00–10:00 AM"
const parseScheduleString = (scheduleStr) => {
  if (!scheduleStr || typeof scheduleStr !== 'string') return null
  const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }
 
  const parts = scheduleStr.trim().split(/\s+(?=\d)/)
  if (parts.length < 2) return null
  const daysPart = parts[0]
  const timePart = parts.slice(1).join(' ')
 
  const dayMatches = daysPart.toLowerCase().match(/sun|mon|tue|wed|thu|fri|sat/g)
  if (!dayMatches || dayMatches.length === 0) return null
  const days = []
  dayMatches.forEach(d => { if (dayMap[d] !== undefined && !days.includes(dayMap[d])) days.push(dayMap[d]) })
 
  const timeMatch = timePart.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)?\s*[-–—]\s*(\d{1,2}):?(\d{0,2})\s*(am|pm)/i)
  if (!timeMatch) return null
 
  let startH = parseInt(timeMatch[1], 10)
  const startM = parseInt(timeMatch[2] || '0', 10)
  const startMer = (timeMatch[3] || timeMatch[6]).toLowerCase()
  let endH = parseInt(timeMatch[4], 10)
  const endM = parseInt(timeMatch[5] || '0', 10)
  const endMer = timeMatch[6].toLowerCase()
 
  const to24 = (h, mer) => {
    if (mer === 'pm' && h < 12) return h + 12
    if (mer === 'am' && h === 12) return 0
    return h
  }
  startH = to24(startH, startMer)
  endH = to24(endH, endMer)
 
  return {
    days,
    startMins: startH * 60 + startM,
    endMins:   endH * 60 + endM,
  }
}
 
const formatMins = (mins) => {
  let h = Math.floor(mins / 60)
  const m = mins % 60
  const mer = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return h + ':' + String(m).padStart(2, '0') + ' ' + mer
}
 
const dayName = (dow) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow]
const fullDayName = (dow) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dow]
 
// Compute the unified status for a room
// Returns: { kind: 'live' | 'starting' | 'should-be-live' | 'finished' | 'today-later' | 'tomorrow' | 'upcoming' | 'no-schedule',
//           label, sublabel, canJoin }
const computeStatus = (room, now) => {
  const parsed = parseScheduleString(room.schedule)
  const todayDow = now.getDay()
  const nowMins = now.getHours() * 60 + now.getMinutes()
 
  // Check if teacher has actually started Zoom (within last 3 hours)
  const teacherStarted = !!(room.zoomLink && room.zoomStartedAt &&
    (Date.now() - new Date(room.zoomStartedAt).getTime()) < 3 * 60 * 60 * 1000)
 
  if (teacherStarted) {
    return {
      kind: 'live',
      label: 'LIVE NOW',
      sublabel: 'Class in progress — join your teacher',
      canJoin: true,
    }
  }
 
  if (!parsed) {
    return {
      kind: 'no-schedule',
      label: 'No schedule set',
      sublabel: room.schedule || 'Ask your teacher about class times',
      canJoin: false,
    }
  }
 
  const isScheduledToday = parsed.days.includes(todayDow)
 
  // Today, currently within the time window but teacher hasn't started Zoom
  if (isScheduledToday && nowMins >= parsed.startMins && nowMins < parsed.endMins) {
    return {
      kind: 'should-be-live',
      label: 'WAITING FOR TEACHER',
      sublabel: 'Scheduled now — teacher hasn\'t started yet',
      canJoin: false,
    }
  }
 
  // Today, before the start time
  if (isScheduledToday && nowMins < parsed.startMins) {
    const minsAway = parsed.startMins - nowMins
    return {
      kind: 'starting',
      label: 'STARTS LATER TODAY',
      sublabel: minsAway < 60
        ? 'Starts in ' + minsAway + ' min · ' + formatMins(parsed.startMins)
        : 'Starts at ' + formatMins(parsed.startMins) + ' (in ' + Math.floor(minsAway / 60) + 'h ' + (minsAway % 60) + 'm)',
      canJoin: false,
    }
  }
 
  // Today, after the end time
  if (isScheduledToday && nowMins >= parsed.endMins) {
    return {
      kind: 'finished',
      label: 'FINISHED FOR TODAY',
      sublabel: 'Today\'s class ended at ' + formatMins(parsed.endMins),
      canJoin: false,
    }
  }
 
  // Find the next upcoming day
  for (let i = 1; i <= 7; i++) {
    const checkDow = (todayDow + i) % 7
    if (parsed.days.includes(checkDow)) {
      if (i === 1) {
        return {
          kind: 'tomorrow',
          label: 'TOMORROW',
          sublabel: 'Tomorrow at ' + formatMins(parsed.startMins),
          canJoin: false,
        }
      }
      return {
        kind: 'upcoming',
        label: fullDayName(checkDow).toUpperCase(),
        sublabel: dayName(checkDow) + ' at ' + formatMins(parsed.startMins),
        canJoin: false,
      }
    }
  }
 
  return { kind: 'no-schedule', label: 'No upcoming sessions', sublabel: room.schedule || '', canJoin: false }
}
 
const teacherDisplayName = (teacher) => {
  if (!teacher) return 'Teacher'
  if (typeof teacher === 'string') return teacher
  if (typeof teacher === 'object') {
    const name = ((teacher.firstName || '') + ' ' + (teacher.lastName || '')).trim()
    return name || teacher.email || 'Teacher'
  }
  return 'Teacher'
}
 
function LiveClassesTab({ user, toast, goTo }) {
  // ── State ──
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  // ── Countdown tick (every 30s) ──
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  // ── Load classes from backend ──
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/liveclasses/student/list')
        if (cancelled) return
        if (data?.success) {
          setClasses(data.data?.classes || [])
        } else {
          setClasses([])
        }
      } catch (e) {
        if (cancelled) return
        console.error('[liveclasses] load failed:', e?.response?.data?.message || e.message)
        setClasses([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 60000) // refresh every minute
    return () => { cancelled = true; clearInterval(id) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Helpers ──
  const subjectColour = (subj) => {
    const map = {
      Mathematics:'#7D1025', Maths:'#7D1025',
      English:'#0F766E',
      Physics:'#1E40AF',
      Chemistry:'#7C3AED',
      Biology:'#15803D',
      'Computer Science':'#0369A1', ICT:'#0369A1',
      Business: '#92400E', Economics:'#92400E',
      History:'#A16207', Geography:'#A16207',
    }
    return map[subj] || '#7D1025'
  }

  const fmtDateTime = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-GB', {
      weekday:'short', day:'numeric', month:'short',
      hour:'2-digit', minute:'2-digit',
    })
  }

  const minsUntil = (iso) => {
    if (!iso) return null
    return Math.round((new Date(iso).getTime() - Date.now()) / 60000)
  }

  const canJoin = (lc) => {
    // Joinable if live OR within 10 min of start time
    if (lc.computedStatus === 'live') return true
    const m = minsUntil(lc.scheduledAt)
    return m !== null && m <= 10 && m >= -((lc.durationMins || 0))
  }

  const countdownText = (lc) => {
    const m = minsUntil(lc.scheduledAt)
    if (m === null) return ''
    if (lc.computedStatus === 'live') return 'IN PROGRESS'
    if (lc.computedStatus === 'ended') return 'ended'
    if (m < 0) return 'starting any moment'
    if (m === 0) return 'starting now'
    if (m < 60) return `in ${m} min`
    const h = Math.floor(m / 60)
    if (h < 24) return `in ${h}h ${m - h*60}m`
    const d = Math.floor(h / 24)
    return `in ${d} day${d === 1 ? '' : 's'}`
  }

  // ── Categorise ──
  const upcoming = classes.filter(c => c.computedStatus === 'scheduled')
  const live     = classes.filter(c => c.computedStatus === 'live')
  const past     = classes.filter(c => c.computedStatus === 'ended').slice(0, 8)

  // suppress unused-var warning for tick — it forces re-render every 30s
  void tick

  // ── EMPTY ──
  if (!loading && classes.length === 0) {
    return (
      <div className="card" style={{ padding:'60px 32px', textAlign:'center' }}>
        <div style={{
          width:80, height:80, borderRadius:'50%',
          background:'#FBF6E3', border:'2px solid #C9A030',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 20px', color:'#7D1025',
        }}>
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
        </div>
        <div className="serif" style={{ fontSize:24, color:'#1A1A1A', marginBottom:6 }}>
          No live classes scheduled
        </div>
        <div style={{ fontSize:13.5, color:'#6B6B6B', maxWidth:380, margin:'0 auto', lineHeight:1.55 }}>
          When your teacher schedules a live session for you, it will appear here with the time, topic, and a button to prepare and join.
        </div>
      </div>
    )
  }

  // ── LIST ──
  return (
    <div>
      {/* ── Hero banner ────────────────────────────────────────
          Same treatment as Exams, Homework and Library: artwork
          untouched, narrower card, glowing gold stat footer. The live
          alert bar is kept below the stats — a class in progress is
          the one thing a student must not miss. */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        maxWidth: 1180, marginLeft: 'auto', marginRight: 'auto',
      }}>
        <img
          src="/banners/liveclasses-hero.jpg"
          alt="Live online class — learn, interact, excel"
          style={{ width: '100%', display: 'block', height: 'auto' }}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          background: '#6B0F1E',
        }}>
          {[
            ['Live now',  live.length || '\u2014'],
            ['Upcoming',  upcoming.length || '\u2014'],
            ['Completed', classes.filter(c => c.computedStatus === 'ended').length || '\u2014'],
            ['Next',      upcoming.length ? countdownText(upcoming[0]) : '\u2014'],
          ].map(([l, v]) => (
            <div key={l} style={{ padding: '13px 18px', borderRight: '1px solid rgba(201,160,48,.18)' }}>
              <div style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
                color: '#E8C97A', opacity: .85, marginBottom: 3,
                textShadow: '0 0 10px rgba(201,160,48,.45)',
              }}>{l}</div>
              <div style={{
                fontSize: 17, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace',
                color: '#F5D98B',
                textShadow: '0 0 12px rgba(245,217,139,.65), 0 0 26px rgba(201,160,48,.35)',
              }}>{v}</div>
            </div>
          ))}
        </div>
        {live.length > 0 && (
          <div style={{
            background: '#15803D', color: '#FBFAF5', padding: '10px 24px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: '#4ADE80', animation: 'pulse 1.5s infinite', flexShrink: 0,
            }}/>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.04em' }}>
              {live.length} class{live.length === 1 ? '' : 'es'} happening right now — join below.
            </span>
          </div>
        )}
      </div>

      {loading && (
        <div className="card" style={{ padding:40, textAlign:'center' }}>
          <div className="mono" style={{ fontSize:13, color:'var(--s400)', letterSpacing:'.1em' }}>
            LOADING YOUR CLASSES...
          </div>
        </div>
      )}

      {/* ─── LIVE NOW ─── */}
      {live.length > 0 && (
        <div style={{ marginBottom:18 }}>
          <h2 className="serif" style={{ fontSize:20, fontWeight:400, color:'#1A1A1A', marginBottom:10 }}>
            Live Now
          </h2>
          <div style={MODULE_GRID}>
            {live.map(lc => (
              <LiveClassCard key={lc._id} lc={lc} subjectColour={subjectColour}
                fmtDateTime={fmtDateTime} countdownText={countdownText}
                canJoin={canJoin} toast={toast} goTo={goTo}/>
            ))}
          </div>
        </div>
      )}

      {/* ─── UPCOMING ─── */}
      {upcoming.length > 0 && (
        <div style={{ marginBottom:18 }}>
          <h2 className="serif" style={{ fontSize:20, fontWeight:400, color:'#1A1A1A', marginBottom:10 }}>
            Upcoming
          </h2>
          <div style={MODULE_GRID}>
            {upcoming.map(lc => (
              <LiveClassCard key={lc._id} lc={lc} subjectColour={subjectColour}
                fmtDateTime={fmtDateTime} countdownText={countdownText}
                canJoin={canJoin} toast={toast} goTo={goTo}/>
            ))}
          </div>
        </div>
      )}

      {/* ─── PAST ─── */}
      {past.length > 0 && (
        <div>
          <h2 className="serif" style={{ fontSize:20, fontWeight:400, color:'#1A1A1A', marginBottom:10 }}>
            Recently Ended
          </h2>
          <div style={MODULE_GRID}>
            {past.map(lc => (
              <LiveClassCard key={lc._id} lc={lc} subjectColour={subjectColour}
                fmtDateTime={fmtDateTime} countdownText={countdownText}
                canJoin={canJoin} toast={toast} goTo={goTo} muted/>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// LiveClassCard — one card per scheduled session
// ─────────────────────────────────────────────────────────
function LiveClassCard({ lc, subjectColour, fmtDateTime, countdownText, canJoin, toast, goTo, muted }) {
  const col = subjectColour(lc.subject)
  const isLive = lc.computedStatus === 'live'
  const isEnded = lc.computedStatus === 'ended'
  const teacherName = lc.teacherId
    ? `${lc.teacherId.firstName || ''} ${lc.teacherId.lastName || ''}`.trim()
    : 'Your teacher'

  const onJoin = () => {
    if (!lc.meetingLink) {
      toast?.error?.('No meeting link set for this class.')
      return
    }
    window.open(lc.meetingLink, '_blank', 'noopener,noreferrer')
  }

  const onPrepare = () => {
    if (lc.preparationLessonId?._id) {
      // Future: goTo('lessons', { lessonId: lc.preparationLessonId._id })
      toast?.info?.('Lesson Player launches next session — for now the prep lesson is "' + (lc.preparationLessonId.title || 'untitled') + '"')
    } else {
      toast?.info?.('Your teacher hasn\'t linked prep material yet for this class.')
    }
  }

  return (
    <ModuleCard
      accent={col}
      dimmed={muted}
      badges={[
        isLive  ? { label:'LIVE NOW', bg:'#FEE2E2', fg:'#B91C1C' } :
        isEnded ? { label:'ENDED',    bg:'#F1F5F9', fg:'#64748B' } :
                  { label:'UPCOMING', bg:'#FEF3C7', fg:'#92400E' },
      ]}
      title={lc.title || lc.topic || `${lc.subject} class`}
      eyebrow={lc.subject}
      tiles={[
        ['When',     fmtDateTime(lc.startAt)],
        ['Duration', lc.durationMins ? `${lc.durationMins} min` : '\u2014'],
        ['Teacher',  teacherName],
        ['Status',   isLive ? 'Live' : isEnded ? 'Ended' : (countdownText?.(lc) || 'Scheduled')],
      ]}
      meta={lc.preparationLessonId?.title ? `Prep: ${lc.preparationLessonId.title}` : null}
      footer={
        isLive || canJoin?.(lc) ? (
          <button className="btn btn-p"
            style={{ width:'100%', justifyContent:'center', background:col, borderColor:col }}
            onClick={onJoin}>
            Join class
          </button>
        ) : isEnded ? (
          <div style={{ fontSize:12, color:'var(--s500)', textAlign:'center' }}>This class has ended</div>
        ) : lc.preparationLessonId ? (
          <button className="btn btn-s" style={{ width:'100%', justifyContent:'center' }} onClick={onPrepare}>
            Prepare for this class
          </button>
        ) : (
          <div style={{ fontSize:12, color:'var(--s500)', textAlign:'center' }}>
            {countdownText?.(lc) || 'Starts soon'}
          </div>
        )
      }
    />
  )
}

 
// ═══════════════════════════════════════════════════════════
// MSHAURI AI — smart rule-based tutor (no API required)
// ═══════════════════════════════════════════════════════════
const MSHAURI_HISTORY_KEY = 'sm_mshauri_history'
 
const loadMshauriHist = () => {
  try { return JSON.parse(localStorage.getItem(MSHAURI_HISTORY_KEY) || '[]') }
  catch { return [] }
}
const saveMshauriHist = (h) => {
  try { localStorage.setItem(MSHAURI_HISTORY_KEY, JSON.stringify(h.slice(-30))) } catch {}
}
 
// ── TOPIC EXPLANATIONS — Mshauri's knowledge base ────────────
const TOPIC_EXPLANATIONS = {
  'pythagoras': `**Pythagoras Theorem** is a rule about right-angled triangles.
 
For any right-angled triangle with legs a and b, and hypotenuse c (the longest side, opposite the right angle):
 
**c² = a² + b²**
 
For example, if a triangle has legs of 3 cm and 4 cm:
c² = 3² + 4² = 9 + 16 = 25
c = √25 = 5 cm
 
**Common Pythagorean triples to memorise:** (3,4,5), (5,12,13), (8,15,17). These appear often in IGCSE exams.
 
Want me to walk you through a problem?`,
 
  'photosynthesis': `**Photosynthesis** is how plants make their own food using sunlight.
 
The simplified equation:
**6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂**
 
In plain words: carbon dioxide + water + light energy → glucose (sugar) + oxygen.
 
**Where it happens:** in chloroplasts, which contain the green pigment chlorophyll. Chlorophyll absorbs light energy.
 
**The two stages:**
1. **Light-dependent reactions** — splits water, releases oxygen, produces ATP and NADPH
2. **Calvin Cycle (light-independent)** — uses ATP/NADPH to convert CO₂ into glucose
 
**Why it matters:** photosynthesis is the source of nearly all the oxygen in our atmosphere and the base of almost every food chain on Earth.
 
Want to try a quick question on this?`,
 
  'algebra': `**Algebra** is using letters to represent unknown numbers, then finding what those numbers must be.
 
**The basic rule:** whatever you do to one side of an equation, do to the other.
 
**Example:** Solve 3x + 5 = 20
 
Step 1: Subtract 5 from both sides → 3x = 15
Step 2: Divide both sides by 3 → x = 5
 
**Key skills:**
- Combine like terms: 3x + 2x = 5x
- Expand brackets: 2(x + 3) = 2x + 6
- Factorise: 2x + 6 = 2(x + 3)
- Solve linear equations
- Solve quadratics by factorising or formula
 
What kind of algebra problem are you working on?`,
 
  'cell biology': `**Cell biology** studies the building blocks of life.
 
**Two main cell types:**
- **Animal cells** — have nucleus, cytoplasm, cell membrane, mitochondria, ribosomes
- **Plant cells** — all of the above PLUS cell wall, chloroplasts, large vacuole
 
**Key parts:**
- **Nucleus** — contains DNA, controls the cell
- **Cell membrane** — controls what enters/leaves
- **Cytoplasm** — jelly-like fluid where reactions happen
- **Mitochondria** — "powerhouse" — produces energy through respiration
- **Chloroplasts** (plants only) — site of photosynthesis
- **Ribosomes** — make proteins
- **Cell wall** (plants only) — gives shape and support
 
Specialised cells (red blood cells, nerve cells, sperm cells) are adapted for specific jobs.
 
Which part would you like me to explain in more depth?`,
 
  'newton': `**Newton's Three Laws of Motion**
 
**1st Law — Inertia:** An object stays at rest, or moves at constant velocity, unless acted on by a net force. Things don't change their motion by themselves.
 
**2nd Law:** Force = mass × acceleration (F = ma).
- 1 Newton (N) = the force needed to accelerate 1 kg at 1 m/s²
- A heavier object needs more force to accelerate at the same rate
 
**3rd Law:** For every action there is an equal and opposite reaction. When you push the ground walking, the ground pushes you back equally.
 
**Useful equations from these laws:**
- F = ma
- W = mg (weight = mass × gravity, where g ≈ 9.8 m/s² on Earth)
- p = mv (momentum)
 
What problem can I help you with?`,
 
  'periodic table': `**The Periodic Table** organises all known elements by their atomic number (number of protons).
 
**Key features:**
- **Periods** (rows) — elements in the same period have the same number of electron shells
- **Groups** (columns) — elements in the same group have the same number of outer electrons → similar chemical behaviour
 
**Important groups:**
- **Group 1: Alkali metals** (Li, Na, K…) — soft, very reactive
- **Group 2: Alkaline earth metals** (Mg, Ca…) — reactive but less than Group 1
- **Group 7: Halogens** (F, Cl, Br, I) — non-metals, form salts
- **Group 0: Noble gases** (He, Ne, Ar) — full outer shell, unreactive
 
**Trends:**
- Reactivity of metals **increases** down a group
- Reactivity of non-metals **decreases** down a group
- Atomic radius increases down a group, decreases across a period
 
What element or trend would you like to explore?`,
 
  'electricity': `**Electricity basics**
 
**Ohm's Law:** V = IR
- V = Voltage (Volts) — the "push"
- I = Current (Amperes) — the flow of charge
- R = Resistance (Ohms) — how much something resists current
 
**Power equations:**
- P = VI (Power = Voltage × Current)
- P = I²R = V²/R
 
**Series circuits:**
- Current is the same everywhere
- Voltages add up: V_total = V₁ + V₂ + V₃
- Resistances add: R_total = R₁ + R₂ + R₃
 
**Parallel circuits:**
- Voltage is the same across each branch
- Currents add: I_total = I₁ + I₂ + I₃
- 1/R_total = 1/R₁ + 1/R₂ + 1/R₃
 
**Common units:** 1 kWh = 3,600,000 Joules. Energy bill = Power (kW) × time (hours) × cost per kWh.
 
What circuit problem are you working on?`,
 
  'simile metaphor': `**Simile vs Metaphor** — both are comparisons, but they work differently.
 
**Simile** — uses "like" or "as" to compare:
- "She runs like the wind"
- "His smile is as bright as the sun"
- "The water was as cold as ice"
 
**Metaphor** — says one thing IS another, no "like" or "as":
- "She is a shining star"
- "Time is a thief"
- "His words were daggers"
 
**Why they matter:** they make writing more vivid and emotional. Authors use them to paint pictures in the reader's mind.
 
**Other figures of speech to know for IGCSE English:**
- **Personification** — giving human traits to non-humans ("the wind whispered")
- **Hyperbole** — exaggeration ("I've told you a million times")
- **Alliteration** — repeating initial sounds ("Peter Piper picked")
 
Want to try identifying these in a sentence?`,
 
  'percentage': `**Percentages** mean "out of 100." So 25% = 25/100 = 0.25.
 
**Three common calculations:**
 
**1. Find X% of Y:** Convert percentage to decimal, multiply.
Example: 15% of 240 = 0.15 × 240 = **36**
 
**2. Find what % one number is of another:** (part / whole) × 100
Example: What % of 80 is 20? → (20/80) × 100 = **25%**
 
**3. Percentage change:** ((new − old) / old) × 100
Example: Price went from $40 to $50. Change = ((50−40)/40) × 100 = **25% increase**
 
**Common conversions to remember:**
- 50% = 1/2 = 0.5
- 25% = 1/4 = 0.25
- 75% = 3/4 = 0.75
- 10% = 1/10 = 0.1
- 33⅓% = 1/3
- 12.5% = 1/8
 
What percentage problem can I help with?`,
 
  'trigonometry': `**Trigonometry** — relating angles to sides in right-angled triangles.
 
**The three ratios** (memorise SOH CAH TOA):
- **sin θ = Opposite / Hypotenuse**
- **cos θ = Adjacent / Hypotenuse**
- **tan θ = Opposite / Adjacent**
 
(Opposite is the side opposite the angle θ. Adjacent is the side next to it that isn't the hypotenuse.)
 
**Standard angles to memorise:**
| Angle | sin | cos | tan |
|-------|-----|-----|-----|
| 0° | 0 | 1 | 0 |
| 30° | 1/2 | √3/2 | 1/√3 |
| 45° | √2/2 | √2/2 | 1 |
| 60° | √3/2 | 1/2 | √3 |
| 90° | 1 | 0 | undefined |
 
**Pythagorean identity:** sin²θ + cos²θ = 1 — always true, useful for simplifying.
 
**To find an unknown angle:** use sin⁻¹, cos⁻¹, tan⁻¹ on your calculator.
 
Show me your problem and I'll walk through it.`,
}
 
// ── FIND BEST MATCHING TOPIC ─────────────────────────────────
const findTopicMatch = (text) => {
  const lower = text.toLowerCase()
  // Try direct matches first
  for (const key of Object.keys(TOPIC_EXPLANATIONS)) {
    if (lower.includes(key)) return key
  }
  // Aliases
  const aliases = [
    [['hypotenuse', 'right triangle', 'right angled triangle'], 'pythagoras'],
    [['plant food', 'chlorophyll', 'photosynthes'], 'photosynthesis'],
    [['solve for x', 'equation', 'unknown', 'variable'], 'algebra'],
    [['mitochondria', 'nucleus', 'chloroplast', 'organelle'], 'cell biology'],
    [['force', 'motion', 'acceleration', 'momentum'], 'newton'],
    [['element', 'group 1', 'halogen', 'noble gas', 'alkali metal'], 'periodic table'],
    [['voltage', 'current', 'ohm', 'circuit', 'resistance'], 'electricity'],
    [['figure of speech', 'comparison', 'imagery', 'literary device'], 'simile metaphor'],
    [['percent', '% of', 'discount', 'increase by'], 'percentage'],
    [['sin', 'cos', 'tan', 'soh cah toa'], 'trigonometry'],
  ]
  for (const [keywords, topic] of aliases) {
    if (keywords.some(k => lower.includes(k))) return topic
  }
  return null
}
 
// ── MATH SOLVER — handles simple linear equations ────────────
const trySolveMath = (text) => {
  const lower = text.toLowerCase().trim()
 
  // Arithmetic: "what is 7 * 8" or "what's 25% of 80"
  const arithMatch = lower.match(/(?:what\s+(?:is|s)\s+)?(\d+(?:\.\d+)?)\s*([+\-*/x×÷])\s*(\d+(?:\.\d+)?)/i)
  if (arithMatch) {
    const a = parseFloat(arithMatch[1])
    const op = arithMatch[2].toLowerCase().replace('x', '*').replace('×', '*').replace('÷', '/')
    const b = parseFloat(arithMatch[3])
    let result
    if (op === '+') result = a + b
    else if (op === '-') result = a - b
    else if (op === '*') result = a * b
    else if (op === '/') result = b !== 0 ? a / b : null
    if (result !== null && result !== undefined) {
      return `${a} ${arithMatch[2]} ${b} = **${Number.isInteger(result) ? result : result.toFixed(4).replace(/\.?0+$/, '')}**`
    }
  }
 
  // Percentage: "what is 15% of 240"
  const pctMatch = lower.match(/(\d+(?:\.\d+)?)\s*%\s+of\s+(\d+(?:\.\d+)?)/i)
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1])
    const num = parseFloat(pctMatch[2])
    const result = (pct / 100) * num
    return `${pct}% of ${num} = (${pct}/100) × ${num} = **${Number.isInteger(result) ? result : result.toFixed(2)}**`
  }
 
  // Linear equation: "solve 3x + 5 = 20" or "3x + 5 = 20"
  const linMatch = text.match(/(\-?\d*\.?\d*)\s*x\s*([+\-])\s*(\d+(?:\.\d+)?)\s*=\s*(\-?\d+(?:\.\d+)?)/i)
  if (linMatch) {
    const a = parseFloat(linMatch[1] || '1') || 1
    const sign = linMatch[2]
    const b = parseFloat(linMatch[3])
    const c = parseFloat(linMatch[4])
    const constant = sign === '+' ? b : -b
    const x = (c - constant) / a
    return `**Solving ${a}x ${sign} ${b} = ${c}**
 
Step 1: ${sign === '+' ? 'Subtract' : 'Add'} ${b} from both sides → ${a}x = ${c - constant}
Step 2: Divide both sides by ${a} → **x = ${Number.isInteger(x) ? x : x.toFixed(2)}**
 
Check: ${a} × ${Number.isInteger(x) ? x : x.toFixed(2)} ${sign} ${b} = ${(a * x + constant).toFixed(2)} ✓`
  }
 
  return null
}
 
// ── BUILD PROGRESS REPORT — reads from localStorage ──────────
const buildProgressReport = (user) => {
  let practiceHist = []
  let examHist = []
  let xp = 0
  try { practiceHist = JSON.parse(localStorage.getItem('sm_practice_history') || '[]') } catch {}
  try { examHist = JSON.parse(localStorage.getItem('sm_exam_history') || '[]') } catch {}
  try { xp = parseInt(localStorage.getItem('sm_practice_xp') || '0', 10) || 0 } catch {}
 
  if (practiceHist.length === 0 && examHist.length === 0) {
    return `You haven't started any practice or exams yet, ${user?.firstName || ''}. Try the **Adaptive Practice** tab to begin — pick any subject and topic, complete 5 questions, and I'll know exactly where you stand. Once you've done a few sessions I can give you tailored advice.`
  }
 
  const subjectStats = {}
  practiceHist.forEach(s => {
    if (!subjectStats[s.subject]) subjectStats[s.subject] = []
    subjectStats[s.subject].push(s.score)
  })
 
  const subjectLines = Object.entries(subjectStats).map(([subj, scores]) => {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    return `- **${subj}:** ${avg}% average (${scores.length} session${scores.length === 1 ? '' : 's'})`
  }).join('\n')
 
  const weakSubjects = Object.entries(subjectStats)
    .filter(([_, scores]) => scores.reduce((a, b) => a + b, 0) / scores.length < 60)
    .map(([s]) => s)
 
  const recentSessions = [...practiceHist].reverse().slice(0, 3)
 
  let report = `**Your progress so far, ${user?.firstName || ''}:**
 
Total XP: **${xp.toLocaleString()}**
✎ Practice sessions: **${practiceHist.length}**
♕ Exams taken: **${examHist.length}**
 
**By subject:**
${subjectLines}
 
**Recent sessions:**
${recentSessions.map(s => `- ${s.topic} (${s.subject}): ${s.score}%`).join('\n')}`
 
  if (weakSubjects.length > 0) {
    report += `\n\n**My recommendation:** Focus on ${weakSubjects.join(' and ')}. These need more attention. Try a few practice sessions in those subjects today.`
  } else if (practiceHist.length >= 3) {
    report += `\n\n✧ You're doing well across all subjects. Keep up the steady work!`
  }
 
  return report
}
 
// ── BUILD STUDY RECOMMENDATION ───────────────────────────────
const buildStudyRecommendation = (user) => {
  let practiceHist = []
  try { practiceHist = JSON.parse(localStorage.getItem('sm_practice_history') || '[]') } catch {}
 
  if (practiceHist.length === 0) {
    return `Since you haven't started yet, I suggest beginning with **Mathematics — Algebra** or **English — Grammar**. These are foundational and appear in every IGCSE paper. Head to the **Adaptive Practice** tab and try 5 questions. Then come back and tell me how it went.`
  }
 
  // Find the subject with lowest average
  const subjectAvgs = {}
  practiceHist.forEach(s => {
    if (!subjectAvgs[s.subject]) subjectAvgs[s.subject] = []
    subjectAvgs[s.subject].push(s.score)
  })
 
  const sorted = Object.entries(subjectAvgs)
    .map(([s, scores]) => ({ subject: s, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
    .sort((a, b) => a.avg - b.avg)
 
  const weakest = sorted[0]
  const lastSession = practiceHist[practiceHist.length - 1]
 
  if (weakest.avg < 60) {
    return `Today, focus on **${weakest.subject}** — your average there is ${Math.round(weakest.avg)}%, which means you have room to grow. Pick any topic in ${weakest.subject} from the **Adaptive Practice** tab. After 2 sessions, take a quick break, then try a different subject to keep things fresh. Aim for 30 minutes of focused study.`
  }
 
  return `You're doing well across the board. Today, I'd suggest:
1. **15 min review** — practise ${lastSession.topic} again to lock it in
2. **20 min new ground** — pick a topic you haven't tried yet
3. **5 min reflection** — look at your Achievements tab and see which badge you're closest to
 
Keep the momentum, ${user?.firstName || 'friend'}!`
}
 
// ── MAIN RESPONSE ROUTER ─────────────────────────────────────
const generateMshauriReply = (userMessage, user) => {
  const text = userMessage.trim()
  const lower = text.toLowerCase()
 
  // 1. Greetings
  if (/^(hi|hello|hey|habari|jambo|yo|sup|hola)[\s!.?]*$/i.test(lower)) {
    return `Habari, ${user?.firstName || 'friend'}! Ready to study? You can ask me to:
- Explain a topic ("explain pythagoras")
- Solve a problem ("solve 3x + 5 = 20")
- Tell you what to study ("what should I study today?")
- Show your progress ("how am I doing?")
 
What would you like to start with?`
  }
 
  // 2. Progress questions
  if (/(how am i doing|my progress|how have i been|my stats|how did i do|my performance|am i improving)/i.test(lower)) {
    return buildProgressReport(user)
  }
 
  // 3. Study recommendations
  if (/(what should i study|what to study|what to learn|recommend|suggest.*topic|study plan|where should i start)/i.test(lower)) {
    return buildStudyRecommendation(user)
  }
 
  // 4. Maths solver
  const mathReply = trySolveMath(text)
  if (mathReply) return mathReply
 
  // 5. Topic explanation
  const topic = findTopicMatch(text)
  if (topic) return TOPIC_EXPLANATIONS[topic]
 
  // 6. Test me requests
  if (/(test me|quiz me|practice|give me.*question)/i.test(lower)) {
    return `Great instinct! Head to the **Adaptive Practice** tab — pick any subject and topic, and I'll have 5 questions ready for you. Each session takes about 5 minutes and I'll save your XP to your achievements.
 
After your session, come back and tell me how it went. I'll help you understand anything you got wrong.`
  }
 
  // 7. Help with homework — redirect appropriately
  if (/(do my homework|do this for me|just give me the answer|whats the answer)/i.test(lower)) {
    return `I can help you understand the topic, but I won't do your homework for you — that wouldn't help you actually learn. Tell me which topic the question is on, or share what you've tried so far, and I'll help you work through it.`
  }
 
  // 8. Generic learning question — guide them
  if (/(i don't understand|i dont understand|confused|stuck|help me with|how do i)/i.test(lower)) {
    return `I'd love to help. Tell me specifically which topic you're stuck on — for example:
- "Help me with **Pythagoras Theorem**"
- "I don't understand **photosynthesis**"
- "How do I **solve algebra equations**?"
 
The more specific you are, the better I can help. You can also try the **Adaptive Practice** tab and see what comes up — sometimes doing questions helps reveal exactly what's confusing.`
  }
 
  // 9. Emotional / motivational
  if (/(stressed|anxious|worried|overwhelmed|cant focus|hard|too difficult|i give up|tired)/i.test(lower)) {
    return `That's a normal feeling, ${user?.firstName || 'friend'} — every student goes through it. Here's what helps:
 
1. **Pomodoro:** Study for 25 minutes, then take a 5-minute break. Repeat 3-4 times.
2. **One topic at a time.** Don't try to do everything at once.
3. **Practice beats reading.** Active practice (the Practice tab) builds memory faster than re-reading notes.
4. **Sleep matters.** Your brain consolidates learning during sleep — never sacrifice it.
 
Remember: progress, not perfection. Every practice session you complete makes you a little better than yesterday. What specific subject is feeling hardest right now?`
  }
 
  // 10. Off-topic
  if (/(weather|movie|song|football|game|date|girlfriend|boyfriend|tiktok|instagram)/i.test(lower)) {
    return `Let's keep our focus on your studies — what subject can I help you with today? You can ask about Maths, Physics, Chemistry, Biology, English, or any specific topic.`
  }
 
  // 11. Default — encourage them to be specific
  return `That's an interesting question. To give you the best help, could you be more specific?
 
For example:
- For Maths: "**Solve 2x + 7 = 15**" or "**Explain Pythagoras**"
- For Sciences: "**Explain photosynthesis**" or "**What are Newton's laws?**"
- For English: "**What is a metaphor?**" or "**Explain similes**"
- For Studies: "**What should I study today?**" or "**How am I doing?**"
 
What would you like to learn about?`
}
 
function MshauriTab({ user }) {
  const [messages, setMessages] = useState(() => {
    const saved = loadMshauriHist()
    if (saved.length > 0) return saved
    const name = user?.firstName || 'there'
    return [{
      role: 'assistant',
      text: `Habari ${name}! I'm Mshauri, your personal AI tutor. I can help you understand difficult topics, solve problems step-by-step, or check your progress. What would you like to work on today?`,
      time: new Date().toISOString(),
    }]
  })
  const [input, setInput]     = useState('')
  const [thinking, setThinking] = useState(false)
  const chatEndRef            = useRef(null)
 
  useEffect(() => {
    saveMshauriHist(messages)
  }, [messages])
 
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])
 
  const send = (text) => {
    const userMsg = (text || input).trim()
    if (!userMsg || thinking) return
 
    const newMessages = [...messages, { role: 'user', text: userMsg, time: new Date().toISOString() }]
    setMessages(newMessages)
    setInput('')
    setThinking(true)
 
    // Simulate thinking time for realism (300-800ms based on response length)
    const reply = generateMshauriReply(userMsg, user)
    const delay = Math.min(800, 300 + reply.length * 2)
    setTimeout(() => {
      setMessages(m => [...m, { role: 'assistant', text: reply, time: new Date().toISOString() }])
      setThinking(false)
    }, delay)
  }
 
  const clearChat = () => {
    if (window.confirm('Clear our conversation?')) {
      const name = user?.firstName || 'there'
      const fresh = [{
        role: 'assistant',
        text: `Habari ${name}! Fresh start. What would you like to learn today?`,
        time: new Date().toISOString(),
      }]
      setMessages(fresh)
    }
  }
 
  // Suggestions adapt to whether they have practice history
  const suggestions = (() => {
    let practiceHist = []
    try { practiceHist = JSON.parse(localStorage.getItem('sm_practice_history') || '[]') } catch {}
    if (practiceHist.length === 0) {
      return ['What should I study today?', 'Explain Pythagoras', 'Solve 2x + 7 = 15', 'How does this work?']
    }
    const recent = practiceHist[practiceHist.length - 1]
    return [
      'How am I doing?',
      `Explain ${recent.topic}`,
      'What should I study today?',
      'Solve 3x + 5 = 20',
    ]
  })()
 
  const initials = user?.firstName?.[0]?.toUpperCase() || 'S'
 
  // Simple markdown-ish formatter for **bold** and line breaks
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--s900)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }
 
  return (
    <div>
      {/* Hero */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
        color: '#fff',
      }}>
        <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(240,204,90,.18)',
            border: '3px solid #F0CC5A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
            boxShadow: '0 4px 16px rgba(0,0,0,.25)',
          }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#F0CC5A" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="10" rx="2"/>
              <circle cx="12" cy="5" r="2"/>
              <path d="M12 7v4"/>
            </svg>
            <span style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 12, height: 12, borderRadius: '50%',
              background: '#4ADE80',
              border: '2px solid #6B0F1E',
              animation: 'pulse 2s infinite',
            }}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 4 }}>
              Personalised AI Tutor
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              Mshauri
            </h2>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }}/>
              Online · Knows your progress · Always patient
            </div>
          </div>
          <button
            onClick={clearChat}
            style={{
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.25)',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: 'var(--rmd)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            New Chat
          </button>
        </div>
      </div>
 
      {/* Chat container */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)', minHeight: 480, padding: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 10,
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: m.role === 'assistant' ? '#8B1A2E' : 'var(--s200)',
                color: m.role === 'assistant' ? '#F0CC5A' : 'var(--s700)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: m.role === 'assistant' ? 'Instrument Serif, serif' : 'JetBrains Mono, monospace',
                fontSize: m.role === 'assistant' ? 16 : 12,
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {m.role === 'assistant' ? 'M' : initials}
              </div>
              <div style={{
                background: m.role === 'user' ? '#8B1A2E' : 'var(--bg)',
                color: m.role === 'user' ? '#fff' : 'var(--s800)',
                padding: '12px 16px',
                borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                fontSize: 14,
                lineHeight: 1.65,
                maxWidth: '78%',
                border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {m.role === 'assistant' ? renderText(m.text) : m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#8B1A2E', color: '#F0CC5A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Instrument Serif, serif', fontSize: 16, fontWeight: 700,
                flexShrink: 0,
              }}>M</div>
              <div style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                padding: '12px 16px',
                borderRadius: '4px 14px 14px 14px',
                fontSize: 13,
                color: 'var(--s500)',
                fontStyle: 'italic',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ display: 'inline-flex', gap: 3 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B1A2E', animation: 'mDot 1.2s infinite' }}/>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B1A2E', animation: 'mDot 1.2s infinite .2s' }}/>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B1A2E', animation: 'mDot 1.2s infinite .4s' }}/>
                </span>
                Mshauri is thinking…
              </div>
              <style>{`@keyframes mDot { 0%, 100% { opacity: .3 } 50% { opacity: 1 } }`}</style>
            </div>
          )}
          <div ref={chatEndRef}/>
        </div>
 
        <div style={{ padding: '12px 18px 14px', borderTop: '1px solid var(--border)', background: 'var(--white)' }}>
          {messages.length <= 2 && !thinking && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--s700)',
                    padding: '5px 11px',
                    borderRadius: 99,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#8B1A2E'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#8B1A2E' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--s700)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
 
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="Ask Mshauri anything about your studies…"
              rows={1}
              disabled={thinking}
              style={{
                flex: 1,
                background: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--rmd)',
                padding: '10px 14px',
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.5,
                maxHeight: 120,
              }}
              onFocus={e => e.target.style.borderColor = '#8B1A2E'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={() => send()}
              disabled={thinking || !input.trim()}
              style={{
                background: input.trim() && !thinking ? '#8B1A2E' : 'var(--s200)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--rmd)',
                padding: '10px 16px',
                cursor: input.trim() && !thinking ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 600,
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
 
// ═══════════════════════════════════════════════════════════
// TIMETABLE TAB — week grid + list, real student schedule
// ═══════════════════════════════════════════════════════════
function TimetableTab({ user, store, setPage, toast }) {
  const [view, setView]   = useState('grid')   // 'grid' | 'list'
  const [tick, setTick]   = useState(0)
  const [selected, setSelected] = useState(null)  // currently selected slot for action menu
 
  // Re-evaluate live status every 30 seconds
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [])
 
  // Find this student's enrolled rooms
  const studentFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  const allRooms = store?.groupRooms || []
  const myRooms = allRooms.filter(r =>
    r.students?.some(s =>
      s === studentFullName ||
      s === user?.firstName ||
      (user?.firstName && s.includes(user.firstName))
    )
  )
 
  // Build slot data — one slot per (room × day-it-recurs)
  const slots = []
  myRooms.forEach(room => {
    const parsed = parseScheduleString(room.schedule)
    if (!parsed) return
    parsed.days.forEach(dow => {
      slots.push({
        roomId: room.id,
        room,
        dow,
        startMins: parsed.startMins,
        endMins: parsed.endMins,
      })
    })
  })
 
  const subjColours = {
    'Mathematics': '#8B1A2E', 'Physics': '#1E3A8A', 'Chemistry': '#166534',
    'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E',
    'Geography': '#0F766E', 'Computer Science': '#1F2937',
    'Business Studies': '#7E22CE', 'Economics': '#9F1239',
  }
  const colourFor = (s) => subjColours[s] || '#8B1A2E'
 
  const now = new Date()
  const todayDow = now.getDay()
  const nowMins = now.getHours() * 60 + now.getMinutes()
 
  const isLiveNow = (slot) =>
    slot.dow === todayDow && nowMins >= slot.startMins && nowMins < slot.endMins
  const isPastToday = (slot) =>
    slot.dow === todayDow && nowMins >= slot.endMins
  const isUpcomingToday = (slot) =>
    slot.dow === todayDow && nowMins < slot.startMins
 
  // Determine which days to show (always Mon-Fri; add Sat/Sun if any class falls there)
  const usedDays = new Set(slots.map(s => s.dow))
  const showSat = usedDays.has(6)
  const showSun = usedDays.has(0)
  const dayList = []
  if (showSun) dayList.push(0)
  for (let d = 1; d <= 5; d++) dayList.push(d)
  if (showSat) dayList.push(6)
  const dayShortName = (d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]
  const dayLongName  = (d) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]
 
  // Time range to display — find earliest start, latest end across all slots
  let earliestMins = 8 * 60   // default 8 AM
  let latestMins   = 17 * 60  // default 5 PM
  if (slots.length > 0) {
    earliestMins = Math.min(...slots.map(s => s.startMins))
    latestMins   = Math.max(...slots.map(s => s.endMins))
    // Snap to nearest hour boundary
    earliestMins = Math.floor(earliestMins / 60) * 60
    latestMins   = Math.ceil(latestMins / 60) * 60
    // Add small buffer
    earliestMins = Math.max(7 * 60, earliestMins)
    latestMins   = Math.min(20 * 60, latestMins + 30)
  }
  const totalMinsSpan = latestMins - earliestMins
 
  // Hour labels for the row headers
  const hourLabels = []
  for (let m = earliestMins; m <= latestMins; m += 60) {
    let h = Math.floor(m / 60)
    const mer = h >= 12 ? 'PM' : 'AM'
    h = h % 12
    if (h === 0) h = 12
    hourLabels.push({ mins: m, label: `${h} ${mer}` })
  }
 
  const formatTime = (mins) => {
    let h = Math.floor(mins / 60)
    const m = mins % 60
    const mer = h >= 12 ? 'PM' : 'AM'
    h = h % 12
    if (h === 0) h = 12
    return `${h}${m === 0 ? '' : ':' + String(m).padStart(2, '0')} ${mer}`
  }
 
  // Stats
  const liveCount      = slots.filter(isLiveNow).length
  const todayCount     = slots.filter(s => s.dow === todayDow).length
  const totalWeekly    = slots.length
  const subjectCount   = new Set(slots.map(s => s.room.subject)).size
 
  // ── Action menu actions ─────────────────────────────────────
  const handleAction = (action, slot) => {
    setSelected(null)
    if (action === 'join') {
      setPage('live')
    } else if (action === 'view-class') {
      setPage('myroom')
    } else if (action === 'add-cal') {
      toast?.info?.(`Reminder set for ${slot.room.subject}`)
    } else if (action === 'practice') {
      setPage('practice')
    }
  }
 
  // ── EMPTY STATE ─────────────────────────────────────────────
  if (myRooms.length === 0) {
    return (
      <div>
        <div className="card" style={{
          padding: 0, marginBottom: 18, overflow: 'hidden',
          background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
          color: '#fff',
        }}>
          <div style={{ padding: '24px 30px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
              Weekly Schedule
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0 }}>
              Your Timetable
            </h2>
          </div>
        </div>
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: 'var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="var(--s400)" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 17, color: 'var(--s800)', marginBottom: 6 }}>Your timetable will appear here</h3>
          <p style={{ fontSize: 13.5, color: 'var(--s500)', maxWidth: 380, margin: '0 auto' }}>
            Once an admin enrols you in classes, your weekly schedule will be built automatically from your class times.
          </p>
        </div>
      </div>
    )
  }
 
  return (
    <div>
      {/* Hero */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
        color: '#fff',
      }}>
        <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
              Weekly Schedule
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              Your Timetable
            </h2>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
              {dayLongName(todayDow)} · {now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
            </div>
          </div>
          {/* View toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,.2)',
            borderRadius: 99,
            padding: 3,
            gap: 2,
          }}>
            {[['grid', 'Week'], ['list', 'List']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setView(id)}
                style={{
                  background: view === id ? '#fff' : 'transparent',
                  color: view === id ? '#8B1A2E' : 'rgba(255,255,255,.75)',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: 99,
                  cursor: 'pointer',
                  fontSize: 12.5,
                  fontWeight: 600,
                  transition: 'all .15s',
                }}
              >{label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
          {[
            ['Live Now',     liveCount],
            ['Today',        todayCount],
            ['This Week',    totalWeekly],
            ['Subjects',     subjectCount],
          ].map(([l, v]) => (
            <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6, marginBottom: 2 }}>
                {l}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
 
      {/* GRID VIEW */}
      {view === 'grid' && (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `64px repeat(${dayList.length}, minmax(110px, 1fr))`,
            minWidth: 64 + dayList.length * 110,
          }}>
            {/* Header row */}
            <div style={{ background: 'var(--bg)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}/>
            {dayList.map(d => {
              const isToday = d === todayDow
              return (
                <div key={d} style={{
                  background: isToday ? 'rgba(139,26,46,.06)' : 'var(--bg)',
                  borderRight: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                  padding: '12px 8px',
                  textAlign: 'center',
                  position: 'relative',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: isToday ? '#8B1A2E' : 'var(--s400)' }}>
                    {dayShortName(d)}
                  </div>
                  {isToday && (
                    <div style={{ fontSize: 9, color: '#8B1A2E', fontWeight: 700, marginTop: 1 }}>Today</div>
                  )}
                </div>
              )
            })}
 
            {/* Body — one row per hour */}
            {hourLabels.slice(0, -1).map((hour, hi) => (
              <div key={hi} style={{ display: 'contents' }}>
                {/* Time label */}
                <div style={{
                  background: 'var(--bg)',
                  borderRight: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                  padding: '6px 6px 0',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  color: 'var(--s400)',
                  textAlign: 'right',
                  height: 60,
                }}>
                  {hour.label}
                </div>
                {/* Day cells for this hour - empty cells with grid lines */}
                {dayList.map(d => {
                  const isToday = d === todayDow
                  return (
                    <div key={d} style={{
                      background: isToday ? 'rgba(139,26,46,.025)' : 'transparent',
                      borderRight: '1px solid var(--border)',
                      borderBottom: '1px solid var(--border)',
                      height: 60,
                      position: 'relative',
                    }}/>
                  )
                })}
              </div>
            ))}
          </div>
 
          {/* Overlay slots positioned absolutely on the grid */}
          <div style={{ position: 'relative', marginTop: -((hourLabels.length - 1) * 60), pointerEvents: 'none' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `64px repeat(${dayList.length}, minmax(110px, 1fr))`,
              minWidth: 64 + dayList.length * 110,
            }}>
              <div/>
              {dayList.map(d => (
                <div key={d} style={{ position: 'relative', minHeight: (hourLabels.length - 1) * 60 + 'px' }}>
                  {slots.filter(s => s.dow === d).map((slot, si) => {
                    const col = colourFor(slot.room.subject)
                    const top = ((slot.startMins - earliestMins) / 60) * 60
                    const height = Math.max(36, ((slot.endMins - slot.startMins) / 60) * 60 - 2)
                    const live = isLiveNow(slot)
                    const past = isPastToday(slot)
                    return (
                      <div
                        key={si}
                        onClick={() => setSelected(slot)}
                        style={{
                          position: 'absolute',
                          top: top + 'px',
                          left: 4,
                          right: 4,
                          height: height + 'px',
                          background: live ? col : col + 'E0',
                          color: '#fff',
                          borderRadius: 'var(--rsm)',
                          padding: '6px 8px',
                          fontSize: 11,
                          cursor: 'pointer',
                          pointerEvents: 'auto',
                          boxShadow: live ? `0 0 0 2px #fff, 0 0 0 4px ${col}` : '0 1px 3px rgba(0,0,0,.15)',
                          opacity: past ? 0.55 : 1,
                          overflow: 'hidden',
                          transition: 'all .15s',
                          zIndex: live ? 5 : 1,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                        title={`${slot.room.subject} — ${slot.room.teacher}\n${formatTime(slot.startMins)} – ${formatTime(slot.endMins)}`}
                      >
                        {live && (
                          <div style={{
                            display: 'inline-block',
                            background: '#fff',
                            color: col,
                            fontSize: 8.5,
                            fontWeight: 800,
                            letterSpacing: '.08em',
                            padding: '1px 6px',
                            borderRadius: 99,
                            marginBottom: 2,
                          }}>● LIVE</div>
                        )}
                        <div style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.2, marginBottom: 2, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          {slot.room.subject}
                        </div>
                        <div style={{ fontSize: 10, opacity: .8, lineHeight: 1.2 }}>
                          {formatTime(slot.startMins)}
                        </div>
                        {height > 50 && (
                          <div style={{ fontSize: 10, opacity: .75, lineHeight: 1.2, marginTop: 1, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                            {slot.room.teacher}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
 
      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...slots].sort((a, b) => {
                // Sort by day then time, with today first
                const aDayOrder = a.dow === todayDow ? -1 : a.dow
                const bDayOrder = b.dow === todayDow ? -1 : b.dow
                if (aDayOrder !== bDayOrder) return aDayOrder - bDayOrder
                return a.startMins - b.startMins
              }).map((slot, i) => {
                const col = colourFor(slot.room.subject)
                const live = isLiveNow(slot)
                const past = isPastToday(slot)
                const upcomingToday = isUpcomingToday(slot)
                const isToday = slot.dow === todayDow
 
                let statusBadge
                if (live) statusBadge = <span className="badge badge-red" style={{ background: '#FEE2E2', color: '#991B1B' }}>● Live Now</span>
                else if (past) statusBadge = <span className="badge badge-slate" style={{ background: 'var(--s100)', color: 'var(--s500)' }}>Done</span>
                else if (upcomingToday) statusBadge = <span className="badge badge-amber">Today</span>
                else statusBadge = <span className="badge badge-blue">Upcoming</span>
 
                return (
                  <tr key={i} style={{ background: live ? '#FEF2F2' : isToday ? 'rgba(139,26,46,.025)' : 'transparent' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 4, height: 24, borderRadius: 2, background: col, flexShrink: 0 }}/>
                        <span className="mono" style={{ fontWeight: 700, color: isToday ? '#8B1A2E' : 'var(--s700)' }}>
                          {dayShortName(slot.dow)}
                        </span>
                      </div>
                    </td>
                    <td className="mono" style={{ fontSize: 13 }}>
                      {formatTime(slot.startMins)} – {formatTime(slot.endMins)}
                    </td>
                    <td style={{ fontWeight: 600 }}>{slot.room.subject}</td>
                    <td style={{ color: 'var(--s500)', fontSize: 13 }}>{slot.room.teacher}</td>
                    <td>{statusBadge}</td>
                    <td>
                      {live && (
                        <button className="btn btn-d btn-sm" onClick={() => setPage('live')}>
                          Join
                        </button>
                      )}
                      {!live && !past && (
                        <button className="btn btn-s btn-sm" onClick={() => toast?.info?.(`Reminder set for ${slot.room.subject}`)}>
                          Remind
                        </button>
                      )}
                      {past && (
                        <button className="btn btn-s btn-sm" onClick={() => setPage('practice')}>
                          Practice
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
 
      {/* Action menu modal */}
      {selected && (() => {
        const live = isLiveNow(selected)
        const past = isPastToday(selected)
        return (
          <div
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(15,23,42,.55)',
              zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20,
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--white)',
                borderRadius: 'var(--rxl)',
                width: '100%', maxWidth: 420,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,.3)',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '20px 24px',
                background: `linear-gradient(135deg, ${colourFor(selected.room.subject)} 0%, ${colourFor(selected.room.subject)}DD 100%)`,
                color: '#fff',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .8, marginBottom: 4 }}>
                  {dayLongName(selected.dow)} · {formatTime(selected.startMins)} – {formatTime(selected.endMins)}
                </div>
                <h3 className="serif" style={{ fontSize: 22, margin: 0 }}>{selected.room.subject}</h3>
                <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
                  {selected.room.teacher} · {selected.room.curriculum} {selected.room.grade ? '· ' + selected.room.grade : ''}
                </div>
                {live && (
                  <div style={{
                    display: 'inline-block',
                    background: '#fff', color: colourFor(selected.room.subject),
                    fontSize: 10, fontWeight: 800, letterSpacing: '.1em',
                    padding: '3px 10px', borderRadius: 99,
                    marginTop: 10,
                  }}>● LIVE NOW</div>
                )}
              </div>
 
              {/* Actions */}
              <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {live && (
                  <button
                    className="btn btn-p"
                    onClick={() => handleAction('join', selected)}
                    style={{ background: colourFor(selected.room.subject), borderColor: colourFor(selected.room.subject), justifyContent: 'flex-start' }}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Join Class Now
                  </button>
                )}
                {!live && !past && (
                  <button
                    className="btn btn-s"
                    onClick={() => handleAction('add-cal', selected)}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Set Reminder
                  </button>
                )}
                <button
                  className="btn btn-s"
                  onClick={() => handleAction('view-class', selected)}
                  style={{ justifyContent: 'flex-start' }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  View Classmates
                </button>
                {past && (
                  <button
                    className="btn btn-s"
                    onClick={() => handleAction('practice', selected)}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1.5"/></svg>
                    Practice This Subject
                  </button>
                )}
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: 'transparent', border: 'none',
                    color: 'var(--s500)', padding: '8px',
                    fontSize: 13, cursor: 'pointer',
                    textAlign: 'center', marginTop: 4,
                  }}
                >Close</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
 
// ═══════════════════════════════════════════════════════════
// STUDY PLAN TAB — 7-day rolling plan, real data, mark-as-done
// ═══════════════════════════════════════════════════════════
const STUDY_PLAN_KEY = 'sm_study_plan'
const STUDY_PLAN_DONE_KEY = 'sm_study_plan_done'   // tasks marked complete
const STUDY_PLAN_GENERATED_KEY = 'sm_study_plan_generated'  // ISO date when last regenerated
 
const loadDoneTasks = () => {
  try { return JSON.parse(localStorage.getItem(STUDY_PLAN_DONE_KEY) || '{}') }
  catch { return {} }
}
const saveDoneTasks = (d) => {
  try { localStorage.setItem(STUDY_PLAN_DONE_KEY, JSON.stringify(d)) } catch {}
}
 
const loadStoredPlan = () => {
  try { return JSON.parse(localStorage.getItem(STUDY_PLAN_KEY) || 'null') }
  catch { return null }
}
const saveStoredPlan = (p) => {
  try {
    localStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(p))
    localStorage.setItem(STUDY_PLAN_GENERATED_KEY, new Date().toISOString())
  } catch {}
}
 
// ── PLAN GENERATOR — uses real Practice + Exam history ─────
const generateStudyPlan = (user, store) => {
  // Read student's data
  let practiceHist = []
  let examHist = []
  try { practiceHist = JSON.parse(localStorage.getItem('sm_practice_history') || '[]') } catch {}
  try { examHist = JSON.parse(localStorage.getItem('sm_exam_history') || '[]') } catch {}
 
  // Subject → array of {topic, score, attempts}
  const subjectStats = {}
  practiceHist.forEach(s => {
    if (!subjectStats[s.subject]) subjectStats[s.subject] = {}
    if (!subjectStats[s.subject][s.topic]) {
      subjectStats[s.subject][s.topic] = { scores: [], attempts: 0 }
    }
    subjectStats[s.subject][s.topic].scores.push(s.score)
    subjectStats[s.subject][s.topic].attempts++
  })
 
  // Compute each topic's avg
  const topicMastery = []
  Object.entries(subjectStats).forEach(([subject, topics]) => {
    Object.entries(topics).forEach(([topic, data]) => {
      const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      topicMastery.push({ subject, topic, mastery: Math.round(avg), attempts: data.attempts })
    })
  })
 
  // Subjects from QUESTION_BANK that the student hasn't tried yet
  const allSubjects = Object.keys(QUESTION_BANK)
  const triedSubjects = new Set(topicMastery.map(t => t.subject))
  const untriedSubjects = allSubjects.filter(s => !triedSubjects.has(s))
 
  // Find untried topics within tried subjects
  const untriedTopics = []
  Object.keys(QUESTION_BANK).forEach(subject => {
    Object.keys(QUESTION_BANK[subject]).forEach(topic => {
      const tried = topicMastery.find(t => t.subject === subject && t.topic === topic)
      if (!tried) {
        untriedTopics.push({ subject, topic, mastery: 0, attempts: 0 })
      }
    })
  })
 
  // Find student's enrolled rooms (live classes anchor study around them)
  const studentFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  const myRooms = (store?.groupRooms || []).filter(r =>
    r.students?.some(s => s === studentFullName || s === user?.firstName || (user?.firstName && s.includes(user.firstName)))
  )
 
  // Map class days: { 1: ['Mathematics', 'Biology'], 3: [...] }
  const classesByDay = {}
  myRooms.forEach(room => {
    const parsed = parseScheduleString(room.schedule)
    if (!parsed) return
    parsed.days.forEach(dow => {
      if (!classesByDay[dow]) classesByDay[dow] = []
      classesByDay[dow].push({ subject: room.subject, time: parsed.startMins, teacher: room.teacher })
    })
  })
 
  // Build the 7-day plan starting today
  const plan = []
  const today = new Date()
  const dayLongName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
 
  // Sort weak topics by mastery (lowest first) for priority
  const weakTopics = [...topicMastery].filter(t => t.mastery < 70).sort((a, b) => a.mastery - b.mastery)
  const reviewTopics = [...topicMastery].filter(t => t.mastery >= 70 && t.mastery < 85).sort((a, b) => a.mastery - b.mastery)
 
  // Build a rotation pool that prioritises weak first, then untried in tried subjects, then untried subjects
  const studyPool = [
    ...weakTopics.map(t => ({ ...t, priority: 'high' })),
    ...untriedTopics.slice(0, 5).map(t => ({ ...t, priority: 'medium' })),
    ...reviewTopics.map(t => ({ ...t, priority: 'low' })),
    ...untriedTopics.slice(5).map(t => ({ ...t, priority: 'medium' })),
  ]
 
  // Fallback: if pool is empty (cold start), seed with first 7 topics from QUESTION_BANK
  if (studyPool.length === 0) {
    Object.keys(QUESTION_BANK).forEach(subject => {
      Object.keys(QUESTION_BANK[subject]).slice(0, 2).forEach(topic => {
        studyPool.push({ subject, topic, mastery: 0, attempts: 0, priority: 'medium' })
      })
    })
  }
 
  // Generate one entry per day
  for (let i = 0; i < 7; i++) {
    const date = new Date(today.getTime() + i * 86400000)
    const dow = date.getDay()
    const isWeekend = dow === 0 || dow === 6
    const dayClasses = classesByDay[dow] || []
    const isToday = i === 0
 
    // Pick this day's main topic — rotate through pool
    const mainTopic = studyPool[i % studyPool.length] || { subject: 'Mathematics', topic: 'Algebra', mastery: 0, priority: 'medium' }
 
    // Build tasks list
    const tasks = []
    const minsTarget = isWeekend ? 25 : (mainTopic.priority === 'high' ? 45 : 35)
 
    if (isToday) {
      tasks.push({
        id: `${date.toDateString()}-warmup`,
        type: 'warmup',
        title: 'Warm-up: 5 minutes review of yesterday',
        mins: 5,
        action: 'review',
      })
    }
 
    tasks.push({
      id: `${date.toDateString()}-practice-${mainTopic.topic.replace(/\s/g, '-')}`,
      type: 'practice',
      title: `Practice ${mainTopic.topic}`,
      subject: mainTopic.subject,
      topic: mainTopic.topic,
      mins: 20,
      action: 'practice',
      mastery: mainTopic.mastery,
    })
 
    if (mainTopic.mastery > 0 && mainTopic.mastery < 60) {
      tasks.push({
        id: `${date.toDateString()}-explain-${mainTopic.topic.replace(/\s/g, '-')}`,
        type: 'explain',
        title: `Ask Mshauri to explain ${mainTopic.topic}`,
        mins: 10,
        action: 'mshauri',
        topic: mainTopic.topic,
      })
    }
 
    // Anchor live classes
    dayClasses.forEach(cls => {
      tasks.push({
        id: `${date.toDateString()}-class-${cls.subject.replace(/\s/g, '-')}`,
        type: 'class',
        title: `Live ${cls.subject} class with ${cls.teacher}`,
        mins: 60,
        time: cls.time,
        action: 'live',
        subject: cls.subject,
      })
    })
 
    // Weekend: lighter, suggest exam practice
    if (isWeekend && !isToday) {
      tasks.push({
        id: `${date.toDateString()}-exam`,
        type: 'exam',
        title: `Take a practice exam (10 questions)`,
        mins: 30,
        action: 'exam',
      })
    }
 
    // Sort tasks by time if any have specific times
    tasks.sort((a, b) => {
      if (a.time !== undefined && b.time !== undefined) return a.time - b.time
      if (a.time !== undefined) return -1
      if (b.time !== undefined) return 1
      // Order: warmup → practice → explain → exam
      const order = { warmup: 1, class: 2, practice: 3, explain: 4, exam: 5 }
      return (order[a.type] || 99) - (order[b.type] || 99)
    })
 
    plan.push({
      date: date.toISOString(),
      dow,
      dateStr: date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }),
      shortDate: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      dayName: dayLongName[dow],
      isToday,
      isWeekend,
      mainSubject: mainTopic.subject,
      mainTopic: mainTopic.topic,
      mainMastery: mainTopic.mastery,
      priority: mainTopic.priority,
      minsTarget,
      tasks,
    })
  }
 
  return plan
}
 
// ── COLOURS ────────────────────────────────────────────────
const planSubjColours = {
  'Mathematics': '#8B1A2E', 'Physics': '#1E3A8A', 'Chemistry': '#166534',
  'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E',
  'Geography': '#0F766E',
}
const planSubjColour = (s) => planSubjColours[s] || '#8B1A2E'
 
const priorityStyle = {
  high:   { label: 'Priority',  bg: 'var(--r50)', color: 'var(--r600)', accent: 'var(--r500)' },
  medium: { label: 'Build',     bg: 'var(--a50)', color: 'var(--a600)', accent: 'var(--a600)' },
  low:    { label: 'Maintain',  bg: 'var(--g50)', color: 'var(--g600)', accent: 'var(--g600)' },
}
 
const taskTypeIcon = (type) => {
  if (type === 'warmup') return '☀'
  if (type === 'class') return '●'
  if (type === 'practice') return '◆'
  if (type === 'explain') return '◇'
  if (type === 'exam') return '★'
  return '·'
}
 
function StudyPlanTab({ user, store, setPage, toast }) {
  const [plan, setPlan]     = useState(() => loadStoredPlan() || generateStudyPlan(user, store))
  const [done, setDone]     = useState(() => loadDoneTasks())
  const [activeDay, setActiveDay] = useState(0)  // index into plan
 
  // Auto-regenerate if plan is older than 24 hours OR data has changed
  useEffect(() => {
    const stored = loadStoredPlan()
    const generatedAt = localStorage.getItem(STUDY_PLAN_GENERATED_KEY)
    if (!stored || !generatedAt) {
      const fresh = generateStudyPlan(user, store)
      setPlan(fresh)
      saveStoredPlan(fresh)
      return
    }
    const ageHours = (Date.now() - new Date(generatedAt).getTime()) / 3600000
    if (ageHours > 24) {
      const fresh = generateStudyPlan(user, store)
      setPlan(fresh)
      saveStoredPlan(fresh)
    }
  }, [])
 
  const refreshPlan = () => {
    const fresh = generateStudyPlan(user, store)
    setPlan(fresh)
    saveStoredPlan(fresh)
    toast?.ok?.('Study plan refreshed using your latest data.')
  }
 
  const toggleDone = (taskId) => {
    const newDone = { ...done, [taskId]: !done[taskId] }
    setDone(newDone)
    saveDoneTasks(newDone)
  }
 
  const handleAction = (task) => {
    if (task.action === 'practice')  setPage('practice')
    else if (task.action === 'live') setPage('live')
    else if (task.action === 'exam') setPage('exams')
    else if (task.action === 'mshauri') setPage('tutor')
    else if (task.action === 'review') {
      toast?.info?.('Review your last practice session in the Achievements tab.')
      setPage('achievements')
    }
  }
 
  const formatTaskTime = (mins) => {
    let h = Math.floor(mins / 60)
    const m = mins % 60
    const mer = h >= 12 ? 'PM' : 'AM'
    h = h % 12
    if (h === 0) h = 12
    return `${h}${m === 0 ? '' : ':' + String(m).padStart(2, '0')} ${mer}`
  }
 
  // Stats
  const allTasks = plan.flatMap(d => d.tasks)
  const doneCount = allTasks.filter(t => done[t.id]).length
  const totalCount = allTasks.length
  const completionPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0
  const todayPlan = plan[0]
  const todayTasks = todayPlan?.tasks || []
  const todayDone = todayTasks.filter(t => done[t.id]).length
 
  return (
    <div>
      {/* Hero */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
        color: '#fff',
      }}>
        <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
              Personalised &amp; Adaptive
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              Your Study Plan
            </h2>
            <p style={{ fontSize: 13.5, opacity: .85, marginTop: 6, marginBottom: 0, maxWidth: 520, lineHeight: 1.55 }}>
              Built from your real practice scores, exam history, and live class schedule. Your weakest topics get the most attention.
            </p>
          </div>
          <button
            onClick={refreshPlan}
            style={{
              background: 'rgba(255,255,255,.15)',
              border: '1px solid rgba(255,255,255,.3)',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: 'var(--rmd)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh Plan
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', background: 'rgba(0,0,0,.18)' }}>
          {[
            ['Today',         `${todayDone}/${todayTasks.length}`],
            ['This Week',     `${doneCount}/${totalCount}`],
            ['Completion',    `${completionPct}%`],
            ['Focus',         todayPlan?.mainSubject?.split(' ')[0] || '—'],
          ].map(([l, v]) => (
            <div key={l} style={{ padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6, marginBottom: 2 }}>
                {l}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
 
      {/* Day picker tabs */}
      <div style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        marginBottom: 18,
        paddingBottom: 4,
      }}>
        {plan.map((day, i) => {
          const isActive = activeDay === i
          const dayDoneCount = day.tasks.filter(t => done[t.id]).length
          const allDone = dayDoneCount === day.tasks.length && day.tasks.length > 0
          return (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              style={{
                background: isActive ? '#8B1A2E' : 'var(--white)',
                color: isActive ? '#fff' : 'var(--s700)',
                border: `1.5px solid ${isActive ? '#8B1A2E' : 'var(--border)'}`,
                borderRadius: 'var(--rmd)',
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                position: 'relative',
                flexShrink: 0,
                transition: 'all .15s',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: isActive ? .85 : .5, marginBottom: 2 }}>
                {day.isToday ? 'Today' : day.dayName.slice(0, 3)}
              </div>
              <div style={{ fontSize: 13 }}>{day.shortDate}</div>
              {allDone && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--g500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
              )}
            </button>
          )
        })}
      </div>
 
      {/* Active day card */}
      {plan[activeDay] && (() => {
        const day  = plan[activeDay]
        const subjCol = planSubjColour(day.mainSubject)
        const pri  = priorityStyle[day.priority] || priorityStyle.medium
        return (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Day header */}
            <div style={{
              padding: '20px 24px 18px',
              borderBottom: '1px solid var(--border)',
              borderLeft: `4px solid ${subjCol}`,
              background: 'var(--bg)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--s400)', marginBottom: 4 }}>
                    {day.dateStr}
                  </div>
                  <h3 className="serif" style={{ fontSize: 22, color: 'var(--s900)', margin: 0, lineHeight: 1.15 }}>
                    Focus: <span style={{ color: subjCol }}>{day.mainSubject}</span>
                  </h3>
                  <div style={{ fontSize: 13, color: 'var(--s500)', marginTop: 4 }}>
                    Main topic: <strong>{day.mainTopic}</strong>
                    {day.mainMastery > 0 && (
                      <> · current mastery <span className="mono" style={{ fontWeight: 700, color: day.mainMastery < 60 ? 'var(--r600)' : day.mainMastery < 80 ? 'var(--a600)' : 'var(--g600)' }}>{day.mainMastery}%</span></>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    background: pri.bg, color: pri.color,
                    fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
                    padding: '4px 10px', borderRadius: 99,
                  }}>{pri.label}</span>
                  <span style={{
                    background: 'var(--white)', color: 'var(--s700)',
                    fontSize: 11.5, fontWeight: 700,
                    padding: '4px 10px', borderRadius: 99,
                    border: '1px solid var(--border)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{day.minsTarget} min target</span>
                </div>
              </div>
 
              {/* Why this? coaching note */}
              <div style={{
                fontSize: 12.5, color: 'var(--s500)', fontStyle: 'italic',
                background: 'var(--white)', borderRadius: 'var(--rsm)',
                padding: '8px 12px',
                borderLeft: `2px solid ${subjCol}`,
              }}>
                {day.priority === 'high'
                  ? `Why this: your mastery in ${day.mainTopic} is below 70%. Today's practice will move it forward.`
                  : day.mainMastery === 0
                  ? `Why this: you haven't practised ${day.mainTopic} yet. Today's session is your introduction.`
                  : `Why this: keeping ${day.mainTopic} fresh while you build other topics. Light review.`
                }
              </div>
            </div>
 
            {/* Tasks list */}
            <div style={{ padding: '14px 0' }}>
              {day.tasks.length === 0 ? (
                <div style={{ padding: '20px 24px', textAlign: 'center', color: 'var(--s400)', fontSize: 13 }}>
                  No tasks scheduled — enjoy a rest day.
                </div>
              ) : day.tasks.map((task) => {
                const isDone = done[task.id]
                const hasTime = task.time !== undefined
                const taskCol = task.subject ? planSubjColour(task.subject) : subjCol
                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      padding: '12px 24px',
                      borderBottom: '1px solid var(--border)',
                      opacity: isDone ? 0.55 : 1,
                      transition: 'opacity .2s',
                    }}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleDone(task.id)}
                      style={{
                        width: 22, height: 22, flexShrink: 0,
                        borderRadius: 6,
                        border: `2px solid ${isDone ? 'var(--g500)' : 'var(--s300, #CBD5E1)'}`,
                        background: isDone ? 'var(--g500)' : 'var(--white)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: 2,
                        transition: 'all .15s',
                      }}
                    >
                      {isDone && (
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
 
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 14, fontWeight: 700,
                          color: isDone ? 'var(--s500)' : 'var(--s900)',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}>
                          {task.title}
                        </span>
                        {hasTime && (
                          <span className="mono" style={{
                            fontSize: 11, fontWeight: 700,
                            color: taskCol,
                            background: taskCol + '15',
                            padding: '2px 7px',
                            borderRadius: 99,
                          }}>
                            {formatTaskTime(task.time)}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--s400)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ color: taskCol, fontWeight: 700, fontSize: 12 }}>
                          {taskTypeIcon(task.type)}
                        </span>
                        <span style={{ textTransform: 'capitalize' }}>{task.type}</span>
                        <span>·</span>
                        <span>{task.mins} min</span>
                      </div>
                    </div>
 
                    {!isDone && (
                      <button
                        className="btn btn-s btn-sm"
                        onClick={() => handleAction(task)}
                        style={{ flexShrink: 0, marginTop: 2 }}
                      >
                        Start
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
 
// ═══════════════════════════════════════════════════════════
// SUBSCRIPTION TAB — KES, enrolled-only, 3-day grace
// ═══════════════════════════════════════════════════════════
 
// Paystack live key (your dashboard)
const PAYSTACK_PUBLIC_KEY = 'pk_live_a1608f5c5f71946ca1357afa673cd53ce4057af8'
 
// ── Subscription module removed ──────────────────────────
// Billing is handled outside the student portal. SubscriptionTab,
// SubscriptionStatusBanner, the localStorage tier/payment keys and
// computeSubscriptionStatus were all removed together.


// ═══════════════════════════════════════════════════════════
// HOMEWORK TAB — wired to /api/homework/student/list
// Phase 3.4 + 3.5a: list + submit (MCQ, short, long, upload)
// Drawing/handwriting canvas comes in Phase 3.5b
// ═══════════════════════════════════════════════════════════

const homeworkSubjColours = {
  'Mathematics': '#8B1A2E', 'Physics': '#1E3A8A', 'Chemistry': '#166534',
  'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E',
  'Geography': '#0F766E', 'Computer Science': '#1F2937',
}
const homeworkColourFor = (s) => homeworkSubjColours[s] || '#8B1A2E'

const formatHomeworkDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.round((d - now) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0 && diffDays <= 7) return 'In ' + diffDays + ' days'
  if (diffDays < 0 && diffDays >= -7) return Math.abs(diffDays) + ' days ago'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatHomeworkDateTime = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

const hwTypeLabel = {
  mcq: 'Multiple Choice',
  short: 'Short Answer',
  long: 'Long Answer',
  drawing: 'Drawing',
  handwriting: 'Handwriting',
  upload: 'File Upload',
}
// ═══════════════════════════════════════════════════════════
// DRAWING CANVAS — for student homework drawing answers
// Phase 3.5b
// ═══════════════════════════════════════════════════════════
//
// Self-contained component:
//   - Pointer events (mouse, touch, pen all unified)
//   - Pen sizes (3), Eraser, 5 colors
//   - Undo/Redo (stack of imageData snapshots)
//   - Clear all
//   - Save: returns PNG dataURL via onSave callback
//
// Props:
//   value:   optional initial dataURL to load (existing answer)
//   onSave:  callback(dataURL) — called when student clicks Save
//   onClose: callback to dismiss (optional, used inside modal)
//   readOnly: bool — if true, just shows the image, no drawing tools
//
// The component is responsive: canvas internal pixel size matches
// CSS size on mount (and on resize), so strokes don't stretch.
 
const DRAW_COLORS = [
  { id: 'black', value: '#1a1a1a', label: 'Black' },
  { id: 'blue',  value: '#1E3A8A', label: 'Blue' },
  { id: 'red',   value: '#DC2626', label: 'Red' },
  { id: 'green', value: '#15803D', label: 'Green' },
  { id: 'gold',  value: '#C9A030', label: 'Gold' },
]
 
const DRAW_SIZES = [
  { id: 'fine',   value: 2,  label: 'Fine' },
  { id: 'medium', value: 4,  label: 'Medium' },
  { id: 'thick',  value: 8,  label: 'Thick' },
]
 
function DrawingCanvas({ value, onSave, onClose, readOnly = false }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  // Drawing state
  const [color, setColor] = useState(DRAW_COLORS[0].value)
  const [size, setSize] = useState(DRAW_SIZES[1].value)  // medium default
  const [tool, setTool] = useState('pen')                // 'pen' | 'eraser'
  const [isDrawing, setIsDrawing] = useState(false)
  // History for undo/redo. Each entry is a dataURL snapshot
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  // Track last position for line drawing
  const lastPosRef = useRef({ x: 0, y: 0 })
 
  // ── INIT CANVAS ──
  // Size canvas to its container, load initial value if present
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
 
    const setupCanvas = () => {
      const rect = container.getBoundingClientRect()
      // Account for device pixel ratio so strokes are crisp on retina
      const dpr = window.devicePixelRatio || 1
      const cssWidth = Math.max(rect.width, 320)
      const cssHeight = Math.max(rect.height || 400, 320)
      canvas.style.width = cssWidth + 'px'
      canvas.style.height = cssHeight + 'px'
      canvas.width = Math.floor(cssWidth * dpr)
      canvas.height = Math.floor(cssHeight * dpr)
      const ctx = canvas.getContext('2d')
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      // White background so saved PNG isn't transparent
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, cssWidth, cssHeight)
      // If we have an initial value, draw it
      if (value && typeof value === 'string') {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0, cssWidth, cssHeight)
          saveSnapshot()
        }
        img.src = value
      } else {
        saveSnapshot()  // initial blank state
      }
    }
    setupCanvas()
    // We deliberately don't re-run on resize to avoid losing strokes —
    // the user can scroll if the container resizes. (Future: snapshot+rescale.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
 
  // ── HISTORY ──
  const saveSnapshot = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataURL = canvas.toDataURL('image/png')
    setHistory(prev => {
      // Truncate forward history if we're not at the head
      const trimmed = historyIndex < prev.length - 1 ? prev.slice(0, historyIndex + 1) : prev
      const next = [...trimmed, dataURL]
      // Cap history to 30 entries to limit memory
      if (next.length > 30) next.shift()
      return next
    })
    setHistoryIndex(idx => Math.min(idx + 1, 29))
  }
 
  const restoreSnapshot = (dataURL) => {
    const canvas = canvasRef.current
    if (!canvas || !dataURL) return
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      // Clear and draw
      const dpr = window.devicePixelRatio || 1
      const cssW = canvas.width / dpr
      const cssH = canvas.height / dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.scale(dpr, dpr)
      ctx.drawImage(img, 0, 0, cssW, cssH)
    }
    img.src = dataURL
  }
 
  const undo = () => {
    if (historyIndex <= 0) return
    const newIdx = historyIndex - 1
    setHistoryIndex(newIdx)
    restoreSnapshot(history[newIdx])
  }
 
  const redo = () => {
    if (historyIndex >= history.length - 1) return
    const newIdx = historyIndex + 1
    setHistoryIndex(newIdx)
    restoreSnapshot(history[newIdx])
  }
 
  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const cssW = canvas.width / dpr
    const cssH = canvas.height / dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.scale(dpr, dpr)
    saveSnapshot()
  }
 
  // ── POINTER HANDLERS ──
  const getCanvasPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }
 
  const onPointerDown = (e) => {
    if (readOnly) return
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)
    const pos = getCanvasPos(e)
    lastPosRef.current = pos
    setIsDrawing(true)
    // Draw initial dot for tap-and-release
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.fillStyle = tool === 'eraser' ? '#FFFFFF' : color
    ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2)
    ctx.fill()
  }
 
  const onPointerMove = (e) => {
    if (!isDrawing || readOnly) return
    const canvas = canvasRef.current
    if (!canvas) return
    const pos = getCanvasPos(e)
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color
    ctx.lineWidth = tool === 'eraser' ? size * 2 : size
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPosRef.current = pos
  }
 
  const onPointerUp = (e) => {
    if (!isDrawing || readOnly) return
    const canvas = canvasRef.current
    if (canvas && canvas.hasPointerCapture && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId)
    }
    setIsDrawing(false)
    saveSnapshot()
  }
 
  // ── SAVE ──
  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataURL = canvas.toDataURL('image/png')
    if (onSave) onSave(dataURL)
  }
 
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
 
  // ── RENDER ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Toolbar */}
      {!readOnly && (
        <div style={{
          display: 'flex', gap: 14, flexWrap: 'wrap',
          padding: '10px 12px',
          background: '#FBFAF5',
          borderRadius: 8,
          border: '1px solid var(--border)',
          alignItems: 'center',
        }}>
          {/* Tool: pen vs eraser */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              type="button"
              onClick={() => setTool('pen')}
              title="Pen"
              style={{
                padding: '6px 10px',
                background: tool === 'pen' ? '#7D1025' : '#FFF',
                color: tool === 'pen' ? '#FBFAF5' : 'var(--s700)',
                border: '1px solid ' + (tool === 'pen' ? '#7D1025' : 'var(--border)'),
                borderRadius: 6, cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.586 7.586"/>
                <circle cx="11" cy="11" r="2"/>
              </svg>
              Pen
            </button>
            <button
              type="button"
              onClick={() => setTool('eraser')}
              title="Eraser"
              style={{
                padding: '6px 10px',
                background: tool === 'eraser' ? '#7D1025' : '#FFF',
                color: tool === 'eraser' ? '#FBFAF5' : 'var(--s700)',
                border: '1px solid ' + (tool === 'eraser' ? '#7D1025' : 'var(--border)'),
                borderRadius: 6, cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 20H7L3 16c-1-1-1-3 0-4l9-9c1-1 3-1 4 0l5 5c1 1 1 3 0 4l-7 7"/>
                <path d="M14 7l5 5"/>
              </svg>
              Eraser
            </button>
          </div>
 
          {/* Divider */}
          <div style={{ width: 1, height: 22, background: 'var(--border)' }}/>
 
          {/* Size buttons */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--s500)', letterSpacing: '.06em', textTransform: 'uppercase', marginRight: 4 }}>Size</span>
            {DRAW_SIZES.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSize(s.value)}
                title={s.label}
                style={{
                  padding: '4px 8px',
                  background: size === s.value ? '#FBE8E8' : '#FFF',
                  border: '1.5px solid ' + (size === s.value ? '#7D1025' : 'var(--border)'),
                  borderRadius: 6, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28,
                }}>
                <div style={{
                  width: s.value * 1.5, height: s.value * 1.5,
                  background: size === s.value ? '#7D1025' : 'var(--s600)',
                  borderRadius: '50%',
                }}/>
              </button>
            ))}
          </div>
 
          {/* Divider */}
          <div style={{ width: 1, height: 22, background: 'var(--border)' }}/>
 
          {/* Color buttons (only show if pen tool) */}
          {tool === 'pen' && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--s500)', letterSpacing: '.06em', textTransform: 'uppercase', marginRight: 4 }}>Color</span>
              {DRAW_COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: c.value,
                    border: color === c.value ? '3px solid #FBFAF5' : '2px solid var(--border)',
                    boxShadow: color === c.value ? '0 0 0 2px ' + c.value : 'none',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}/>
              ))}
            </div>
          )}
 
          {/* Right-aligned actions */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              title="Undo"
              style={{
                padding: '6px 10px',
                background: '#FFF',
                color: canUndo ? 'var(--s700)' : 'var(--s400)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                cursor: canUndo ? 'pointer' : 'not-allowed',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 7v6h6"/>
                <path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>
              </svg>
              Undo
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              title="Redo"
              style={{
                padding: '6px 10px',
                background: '#FFF',
                color: canRedo ? 'var(--s700)' : 'var(--s400)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                cursor: canRedo ? 'pointer' : 'not-allowed',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 7v6h-6"/>
                <path d="M3 17a9 9 0 0 1 15-6.7L21 13"/>
              </svg>
              Redo
            </button>
            <button
              type="button"
              onClick={() => { if (confirm('Clear the canvas? This cannot be undone except via Undo.')) clearCanvas() }}
              title="Clear all"
              style={{
                padding: '6px 10px',
                background: '#FFF',
                color: '#DC2626',
                border: '1px solid #FCA5A5',
                borderRadius: 6, cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
              }}>
              Clear
            </button>
          </div>
        </div>
      )}
 
      {/* Canvas container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 400,
          background: '#FFF',
          border: '2px solid ' + (isDrawing ? '#7D1025' : 'var(--border)'),
          borderRadius: 8,
          overflow: 'hidden',
          touchAction: 'none',  // Prevent browser pinch/scroll while drawing
          position: 'relative',
        }}>
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            display: 'block',
            cursor: readOnly ? 'default' : (tool === 'eraser' ? 'cell' : 'crosshair'),
          }}
        />
      </div>
 
      {/* Save / Cancel actions */}
      {!readOnly && onSave && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {onClose && (
            <button type="button" onClick={onClose} className="btn btn-s">Cancel</button>
          )}
          <button type="button" onClick={handleSave} className="btn btn-p">Save Drawing</button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// HANDWRITING CANVAS — for student handwritten answers
// Phase 3.5c
// ═══════════════════════════════════════════════════════════
//
// Optimized for handwriting (not freehand drawing):
//   - Pen-only, single dark ink color
//   - Two pen sizes (fine, medium)
//   - Quadratic-curve smoothing between points
//   - Pressure sensitivity (stylus) — line width varies
//   - Ruled-paper background lines
//   - Multi-page: add pages, navigate between them
//   - Composite all pages into ONE tall PNG on save
//   - Undo/Redo per page
//   - Backend storage: still uses single attachment field
//
// Props:
//   value:    optional initial PNG dataURL (existing answer composite)
//   onSave:   callback(dataURL) — called when student clicks Save
//   readOnly: bool — just shows the image, no controls
//
// Multi-page implementation:
//   - Pages are kept as separate canvases in the `pages` ref
//   - On save, we paint each page sequentially onto a tall offscreen canvas
//     and toDataURL the result. Backend never sees more than one image.
//   - Loading an existing answer (the composited PNG) renders it into a
//     single page; user can add more pages on top if they want to redo.
 
const INK_COLOR = '#0F1933'  // very dark blue-black, classic ink
const RULE_COLOR = '#E2E5EA' // very subtle ruled lines
const PAGE_HEIGHT = 540      // single page height
const PAGE_LINE_HEIGHT = 30  // line spacing for ruled background
const HW_SIZES = [
  { id: 'fine',   value: 1.5, label: 'Fine' },
  { id: 'medium', value: 2.5, label: 'Medium' },
]
 
function HandwritingCanvas({ value, onSave, readOnly = false }) {
  const containerRef = useRef(null)
  // We render ONE canvas at a time but maintain history per page.
  // pagesData[i] = the rasterized contents of page i (PNG dataURL)
  // Plus per-page history for undo/redo.
  const canvasRef = useRef(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pages, setPages] = useState([null])  // dataURL per page; null = blank
  // Per-page history stacks. histories[i] = array of dataURLs, indexes[i] = current pointer
  const [histories, setHistories] = useState([[]])
  const [historyIndexes, setHistoryIndexes] = useState([-1])
 
  const [size, setSize] = useState(HW_SIZES[1].value)  // medium default
  const [isDrawing, setIsDrawing] = useState(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  // For quadratic curve smoothing we keep the previous "anchor" point separate
  // from the current cursor, so we draw from anchor → midpoint(anchor, cursor)
  // with the previous point as the control. Net effect: smooth curves.
  const prevPointRef = useRef(null)
 
  // ── INIT CANVAS + LOAD INITIAL ──
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
 
    const setupCanvas = () => {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const cssWidth = Math.max(rect.width, 320)
      const cssHeight = PAGE_HEIGHT
      canvas.style.width = cssWidth + 'px'
      canvas.style.height = cssHeight + 'px'
      canvas.width = Math.floor(cssWidth * dpr)
      canvas.height = Math.floor(cssHeight * dpr)
      const ctx = canvas.getContext('2d')
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
 
      drawBackground(ctx, cssWidth, cssHeight)
 
      // If we have an initial value, draw it as page 0
      if (value && typeof value === 'string') {
        const img = new Image()
        img.onload = () => {
          // Initial value might be much taller than one page
          // (because we composited multiple pages on save).
          // We just draw it scaled to fit the first page's width,
          // letting the user add more pages on top if they want.
          const aspectRatio = img.width / img.height
          const drawWidth = cssWidth
          const drawHeight = drawWidth / aspectRatio
          if (drawHeight <= cssHeight) {
            ctx.drawImage(img, 0, 0, drawWidth, drawHeight)
          } else {
            // Just show the top of the previous answer
            ctx.drawImage(img, 0, 0, drawWidth, drawHeight)
          }
          saveSnapshotToHistory()
        }
        img.src = value
      } else {
        saveSnapshotToHistory()
      }
    }
    setupCanvas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
 
  // Draw the ruled-paper background
  const drawBackground = (ctx, width, height) => {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)
    // Ruled lines
    ctx.save()
    ctx.strokeStyle = RULE_COLOR
    ctx.lineWidth = 1
    for (let y = PAGE_LINE_HEIGHT; y < height; y += PAGE_LINE_HEIGHT) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    // Left margin line
    ctx.strokeStyle = '#FCA5A5'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(50, 0)
    ctx.lineTo(50, height)
    ctx.stroke()
    ctx.restore()
  }
 
  // ── HISTORY ──
  const saveSnapshotToHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataURL = canvas.toDataURL('image/png')
    setHistories(prev => {
      const next = [...prev]
      const currentHist = next[pageIndex] || []
      const trimmed = (historyIndexes[pageIndex] || 0) < currentHist.length - 1
        ? currentHist.slice(0, (historyIndexes[pageIndex] || 0) + 1)
        : currentHist
      const newHist = [...trimmed, dataURL]
      if (newHist.length > 30) newHist.shift()
      next[pageIndex] = newHist
      return next
    })
    setHistoryIndexes(prev => {
      const next = [...prev]
      next[pageIndex] = Math.min((next[pageIndex] || -1) + 1, 29)
      return next
    })
    // Also save current rasterized state to pages[]
    setPages(prev => {
      const next = [...prev]
      next[pageIndex] = dataURL
      return next
    })
  }
 
  const restoreFromDataURL = (dataURL) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const cssW = canvas.width / dpr
    const cssH = canvas.height / dpr
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(dpr, dpr)
    drawBackground(ctx, cssW, cssH)
    if (dataURL) {
      const img = new Image()
      img.onload = () => { ctx.drawImage(img, 0, 0, cssW, cssH) }
      img.src = dataURL
    }
  }
 
  const undo = () => {
    const idx = historyIndexes[pageIndex] || 0
    if (idx <= 0) return
    const newIdx = idx - 1
    setHistoryIndexes(prev => {
      const next = [...prev]
      next[pageIndex] = newIdx
      return next
    })
    restoreFromDataURL(histories[pageIndex][newIdx])
    // Also update pages[] to reflect undo
    setPages(prev => {
      const next = [...prev]
      next[pageIndex] = histories[pageIndex][newIdx]
      return next
    })
  }
 
  const redo = () => {
    const hist = histories[pageIndex] || []
    const idx = historyIndexes[pageIndex] || 0
    if (idx >= hist.length - 1) return
    const newIdx = idx + 1
    setHistoryIndexes(prev => {
      const next = [...prev]
      next[pageIndex] = newIdx
      return next
    })
    restoreFromDataURL(hist[newIdx])
    setPages(prev => {
      const next = [...prev]
      next[pageIndex] = hist[newIdx]
      return next
    })
  }
 
  const clearPage = () => {
    if (!confirm('Clear this page?')) return
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const cssW = canvas.width / dpr
    const cssH = canvas.height / dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(dpr, dpr)
    drawBackground(ctx, cssW, cssH)
    saveSnapshotToHistory()
  }
 
  // ── PAGE NAVIGATION ──
  // Switching page: save current canvas as the page's snapshot, then load the target page
  const switchToPage = (toIndex) => {
    if (toIndex === pageIndex || toIndex < 0 || toIndex >= pages.length) return
    // Save current page state
    const canvas = canvasRef.current
    if (!canvas) return
    const currentDataURL = canvas.toDataURL('image/png')
    setPages(prev => {
      const next = [...prev]
      next[pageIndex] = currentDataURL
      return next
    })
    // Load target page
    const target = pages[toIndex]
    setPageIndex(toIndex)
    // restore happens after pageIndex updates — use a microtask
    setTimeout(() => { restoreFromDataURL(target) }, 0)
  }
 
  const addPage = () => {
    // Save current page first
    const canvas = canvasRef.current
    if (canvas) {
      const currentDataURL = canvas.toDataURL('image/png')
      setPages(prev => {
        const next = [...prev]
        next[pageIndex] = currentDataURL
        return next
      })
    }
    // Add a new blank page
    setPages(prev => [...prev, null])
    setHistories(prev => [...prev, []])
    setHistoryIndexes(prev => [...prev, -1])
    // Switch to the new page
    const newIdx = pages.length
    setPageIndex(newIdx)
    setTimeout(() => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      const dpr = window.devicePixelRatio || 1
      const cssW = canvasRef.current.width / dpr
      const cssH = canvasRef.current.height / dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.scale(dpr, dpr)
      drawBackground(ctx, cssW, cssH)
      // initial blank snapshot for the new page
      const dataURL = canvasRef.current.toDataURL('image/png')
      setHistories(prev => {
        const next = [...prev]
        next[newIdx] = [dataURL]
        return next
      })
      setHistoryIndexes(prev => {
        const next = [...prev]
        next[newIdx] = 0
        return next
      })
      setPages(prev => {
        const next = [...prev]
        next[newIdx] = dataURL
        return next
      })
    }, 0)
  }
 
  const deletePage = () => {
    if (pages.length <= 1) {
      // Don't delete the last page; clear it instead
      clearPage()
      return
    }
    if (!confirm('Delete this page? Cannot be undone.')) return
    const newPages = pages.filter((_, i) => i !== pageIndex)
    const newHistories = histories.filter((_, i) => i !== pageIndex)
    const newIndexes = historyIndexes.filter((_, i) => i !== pageIndex)
    const newPageIndex = Math.max(0, pageIndex - 1)
    setPages(newPages)
    setHistories(newHistories)
    setHistoryIndexes(newIndexes)
    setPageIndex(newPageIndex)
    setTimeout(() => { restoreFromDataURL(newPages[newPageIndex]) }, 0)
  }
 
  // ── POINTER HANDLERS ──
  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }
 
  // Pen-on-paper style line width using pressure if available
  const computeWidth = (e) => {
    const base = size
    // For mouse, e.pressure is 0.5 by default (or 0 if not pressed); for stylus it varies 0–1.
    // We give a 50%-150% multiplier on the base size based on pressure.
    const pressure = (e.pressure !== undefined && e.pressure > 0 && e.pointerType === 'pen')
      ? Math.max(0.3, Math.min(1.5, e.pressure * 1.5))
      : 1
    return base * pressure
  }
 
  const onPointerDown = (e) => {
    if (readOnly) return
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)
    const pos = getPos(e)
    lastPosRef.current = pos
    prevPointRef.current = pos
    setIsDrawing(true)
    // Tap-and-release dot
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.fillStyle = INK_COLOR
    ctx.arc(pos.x, pos.y, computeWidth(e) / 2, 0, Math.PI * 2)
    ctx.fill()
  }
 
  const onPointerMove = (e) => {
    if (!isDrawing || readOnly) return
    const canvas = canvasRef.current
    if (!canvas) return
    const pos = getPos(e)
    const ctx = canvas.getContext('2d')
    const w = computeWidth(e)
 
    // Quadratic curve smoothing:
    // From the previous "anchor" through current cursor, with the midpoint as the control.
    // (Or simpler: draw from previous to midpoint(prev, current) using current as control.)
    const last = lastPosRef.current
    const midX = (last.x + pos.x) / 2
    const midY = (last.y + pos.y) / 2
 
    ctx.strokeStyle = INK_COLOR
    ctx.lineWidth = w
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.quadraticCurveTo(last.x, last.y, midX, midY)
    ctx.stroke()
 
    lastPosRef.current = pos
    prevPointRef.current = { x: midX, y: midY }
  }
 
  const onPointerUp = (e) => {
    if (!isDrawing || readOnly) return
    const canvas = canvasRef.current
    if (canvas && canvas.hasPointerCapture && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId)
    }
    setIsDrawing(false)
    saveSnapshotToHistory()
  }
 
  // ── SAVE: composite all pages into one tall PNG ──
  const handleSave = async () => {
    // First, snapshot the current page so its latest state is in pages[]
    const canvas = canvasRef.current
    if (canvas) {
      const currentDataURL = canvas.toDataURL('image/png')
      setPages(prev => {
        const next = [...prev]
        next[pageIndex] = currentDataURL
        return next
      })
    }
    // Wait a tick for the state update to settle, then composite
    await new Promise(r => setTimeout(r, 50))
    // Read fresh pages from a ref-like approach: we just use the local
    // value we just computed, OR re-read by calling toDataURL on the current
    // canvas for this page and using `pages[]` for the rest.
    const allPages = [...pages]
    // Make sure current page is up-to-date
    if (canvas) allPages[pageIndex] = canvas.toDataURL('image/png')
 
    // Build offscreen tall canvas
    const dpr = window.devicePixelRatio || 1
    const containerWidth = containerRef.current?.getBoundingClientRect().width || 800
    const cssWidth = Math.max(containerWidth, 320)
    const cssHeight = PAGE_HEIGHT * allPages.length
 
    const offscreen = document.createElement('canvas')
    offscreen.width = Math.floor(cssWidth * dpr)
    offscreen.height = Math.floor(cssHeight * dpr)
    const offCtx = offscreen.getContext('2d')
    offCtx.scale(dpr, dpr)
    offCtx.fillStyle = '#FFFFFF'
    offCtx.fillRect(0, 0, cssWidth, cssHeight)
 
    // Sequentially load each page and paint
    for (let i = 0; i < allPages.length; i++) {
      const pageDataURL = allPages[i]
      if (!pageDataURL) continue
      await new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          offCtx.drawImage(img, 0, i * PAGE_HEIGHT, cssWidth, PAGE_HEIGHT)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = pageDataURL
      })
    }
 
    const finalDataURL = offscreen.toDataURL('image/png')
    if (onSave) onSave(finalDataURL)
  }
 
  const canUndo = (historyIndexes[pageIndex] || 0) > 0
  const canRedo = (historyIndexes[pageIndex] || 0) < ((histories[pageIndex] || []).length - 1)
 
  // ── RENDER ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Toolbar */}
      {!readOnly && (
        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap',
          padding: '10px 12px',
          background: '#FBFAF5',
          borderRadius: 8,
          border: '1px solid var(--border)',
          alignItems: 'center',
        }}>
          {/* Pen size */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--s500)', letterSpacing: '.06em', textTransform: 'uppercase', marginRight: 4 }}>Pen</span>
            {HW_SIZES.map(s => (
              <button key={s.id} type="button" onClick={() => setSize(s.value)} title={s.label}
                style={{
                  padding: '6px 12px',
                  background: size === s.value ? '#7D1025' : '#FFF',
                  color: size === s.value ? '#FBFAF5' : 'var(--s700)',
                  border: '1px solid ' + (size === s.value ? '#7D1025' : 'var(--border)'),
                  borderRadius: 6, cursor: 'pointer',
                  fontSize: 12, fontWeight: 700,
                }}>{s.label}</button>
            ))}
          </div>
 
          <div style={{ width: 1, height: 22, background: 'var(--border)' }}/>
 
          {/* Page navigation */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--s500)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Page</span>
            <button type="button" onClick={() => switchToPage(pageIndex - 1)} disabled={pageIndex === 0}
              style={{
                width: 26, height: 26, padding: 0,
                background: '#FFF',
                color: pageIndex === 0 ? 'var(--s400)' : 'var(--s700)',
                border: '1px solid var(--border)', borderRadius: 4,
                cursor: pageIndex === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', minWidth: 50, textAlign: 'center', color: 'var(--s700)' }}>
              {pageIndex + 1} / {pages.length}
            </span>
            <button type="button" onClick={() => switchToPage(pageIndex + 1)} disabled={pageIndex >= pages.length - 1}
              style={{
                width: 26, height: 26, padding: 0,
                background: '#FFF',
                color: pageIndex >= pages.length - 1 ? 'var(--s400)' : 'var(--s700)',
                border: '1px solid var(--border)', borderRadius: 4,
                cursor: pageIndex >= pages.length - 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            <button type="button" onClick={addPage}
              style={{
                padding: '4px 10px', background: '#C9A030', color: '#7D1025',
                border: '1px solid #C9A030', borderRadius: 4,
                cursor: 'pointer', fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Page
            </button>
          </div>
 
          {/* Right actions */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
            <button type="button" onClick={undo} disabled={!canUndo}
              style={{
                padding: '6px 10px', background: '#FFF',
                color: canUndo ? 'var(--s700)' : 'var(--s400)',
                border: '1px solid var(--border)', borderRadius: 6,
                cursor: canUndo ? 'pointer' : 'not-allowed',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 7v6h6"/>
                <path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>
              </svg>
              Undo
            </button>
            <button type="button" onClick={redo} disabled={!canRedo}
              style={{
                padding: '6px 10px', background: '#FFF',
                color: canRedo ? 'var(--s700)' : 'var(--s400)',
                border: '1px solid var(--border)', borderRadius: 6,
                cursor: canRedo ? 'pointer' : 'not-allowed',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 7v6h-6"/>
                <path d="M3 17a9 9 0 0 1 15-6.7L21 13"/>
              </svg>
              Redo
            </button>
            <button type="button" onClick={clearPage}
              style={{
                padding: '6px 10px', background: '#FFF', color: 'var(--s700)',
                border: '1px solid var(--border)', borderRadius: 6,
                cursor: 'pointer', fontSize: 12, fontWeight: 700,
              }}>
              Clear Page
            </button>
            {pages.length > 1 && (
              <button type="button" onClick={deletePage}
                style={{
                  padding: '6px 10px', background: '#FFF', color: '#DC2626',
                  border: '1px solid #FCA5A5', borderRadius: 6,
                  cursor: 'pointer', fontSize: 12, fontWeight: 700,
                }}>
                Delete Page
              </button>
            )}
          </div>
        </div>
      )}
 
      {/* Canvas container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: PAGE_HEIGHT,
          background: '#FFF',
          border: '2px solid ' + (isDrawing ? '#7D1025' : 'var(--border)'),
          borderRadius: 8,
          overflow: 'hidden',
          touchAction: 'none',
          position: 'relative',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            display: 'block',
            cursor: readOnly ? 'default' : 'crosshair',
          }}
        />
      </div>
 
      {/* Tip line */}
      {!readOnly && (
        <div style={{ fontSize: 11, color: 'var(--s400)', fontStyle: 'italic' }}>
          Tip: write naturally on the lines. Use stylus on tablet for pressure-sensitive ink. Add pages for longer answers.
        </div>
      )}
 
      {/* Save action */}
      {!readOnly && onSave && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={handleSave} className="btn btn-p">
            Save Handwriting ({pages.length} page{pages.length === 1 ? '' : 's'})
          </button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MY RESULTS — premium grade module
// Shows all graded exam submissions with radial subject rings,
// a list of past results, and a detail view per result with
// per-question breakdown and teacher feedback.
// ═══════════════════════════════════════════════════════════
function MyResultsTab({ user, toast, setPage }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubId, setSelectedSubId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        // My Results now covers BOTH exams and homework. A student thinks
        // of "my results" as everything a teacher has marked, and having
        // homework grades reachable only from the homework tab meant a
        // term's marked work was scattered across two screens.
        const [exRes, hwRes] = await Promise.allSettled([
          api.get('/exams/submissions/my'),
          api.get('/homework/student/list'),
        ])
        if (cancelled) return

        const examRows = exRes.status === 'fulfilled' && exRes.value?.data?.success
          ? (exRes.value.data.data?.submissions || []).map(r => ({ ...r, kind: 'exam' }))
          : []

        // Homework arrives as assignments; only marked ones are results.
        const hwRows = hwRes.status === 'fulfilled' && hwRes.value?.data?.success
          ? (hwRes.value.data.homework || [])
              .filter(h => h.mySubmission && ['graded', 'returned'].includes(h.mySubmission.status))
              .map(h => {
                const sub = h.mySubmission
                const possible = Number(sub.totalPossible) || 0
                const awarded  = Number(sub.totalAwarded)  || 0
                return {
                  kind: 'homework',
                  _id: sub._id || h._id,
                  homeworkId: h._id,
                  examId: { title: h.title, subject: h.subject, curriculum: h.curriculum, grade: h.grade },
                  totalScore: awarded,
                  maxScore: possible,
                  percentage: possible ? Math.round((awarded / possible) * 100) : 0,
                  status: sub.status,
                  submittedAt: sub.submittedAt || h.dueAt,
                }
              })
          : []

        if (exRes.status === 'rejected' && hwRes.status === 'rejected') {
          toast?.error?.('Could not load results.')
        }
        setResults([...examRows, ...hwRows])
      } catch (e) {
        if (cancelled) return
        console.error('[results] load failed:', e?.response?.data?.message || e.message)
        toast?.error?.('Could not load results.')
        setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedSubId) { setDetail(null); return }
    let cancelled = false
    const load = async () => {
      setDetailLoading(true)
      try {
        const { data } = await api.get('/exams/submissions/my/' + selectedSubId)
        if (cancelled) return
        if (data?.success) setDetail(data.data)
        else toast?.error?.(data?.message || 'Failed to load result.')
      } catch (e) {
        if (cancelled) return
        console.error('[results detail] load failed:', e.message)
        toast?.error?.('Could not load result.')
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [selectedSubId, toast])

  const graded = results.filter(r => r.status === 'graded')
  const subjectStats = (() => {
    const map = {}
    graded.forEach(r => {
      const subj = r.examId?.subject || 'Other'
      if (!map[subj]) map[subj] = { totalScore: 0, maxScore: 0, count: 0 }
      map[subj].totalScore += (r.totalScore || 0)
      map[subj].maxScore   += (r.maxScore || 0)
      map[subj].count      += 1
    })
    return Object.entries(map).map(([subject, stats]) => ({
      subject,
      avgPct: stats.maxScore > 0 ? Math.round((stats.totalScore / stats.maxScore) * 100) : 0,
      count: stats.count,
    }))
  })()

  const overallStats = (() => {
    if (graded.length === 0) return { avgPct: 0, totalScore: 0, maxScore: 0 }
    const totalScore = graded.reduce((s, r) => s + (r.totalScore || 0), 0)
    const maxScore   = graded.reduce((s, r) => s + (r.maxScore || 0), 0)
    return {
      avgPct: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
      totalScore, maxScore,
    }
  })()

  const pendingCount = results.filter(r => r.status === 'submitted').length

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'highest': return (b.percentage || 0) - (a.percentage || 0)
      case 'lowest':  return (a.percentage || 0) - (b.percentage || 0)
      case 'subject': return (a.examId?.subject || '').localeCompare(b.examId?.subject || '')
      default:        return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)
    }
  })

  if (selectedSubId) {
    return (
      <MyResultDetail
        subId={selectedSubId}
        detail={detail}
        loading={detailLoading}
        onBack={() => { setSelectedSubId(null); setDetail(null) }}
      />
    )
  }

  if (loading) {
    return (
      <div className="card" style={{ padding:'60px 20px', textAlign:'center' }}>
        <div className="mono" style={{ fontSize:13, color:'var(--s400)', letterSpacing:'.1em' }}>
          LOADING YOUR RESULTS...
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="card" style={{ padding:'60px 32px', textAlign:'center' }}>
        <div style={{
          width:80, height:80, borderRadius:'50%',
          background:'#FBF6E3', border:'2px solid #C9A030',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 20px', color:'#7D1025',
        }}>
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6"/>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
          </svg>
        </div>
        <div className="serif" style={{ fontSize:24, color:'#1A1A1A', marginBottom:6 }}>
          No results yet
        </div>
        <div style={{ fontSize:13.5, color:'#6B6B6B', maxWidth:380, margin:'0 auto 24px', lineHeight:1.55 }}>
          Once you submit an exam and your teacher grades it, your results will appear here with full per-question feedback.
        </div>
        <button onClick={() => setPage?.('exams')}
          style={{
            background:'#7D1025', color:'#fff', border:'none',
            padding:'10px 22px', borderRadius:8,
            fontSize:13, fontWeight:700, cursor:'pointer',
          }}>
          Go to Exams
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="card" style={{
        padding:0, marginBottom:18, overflow:'hidden',
        background:'linear-gradient(135deg, #7D1025 0%, #5A0B1B 100%)',
        color:'#FBFAF5',
        boxShadow:'0 12px 40px rgba(125,16,37,.20)',
      }}>
        <div style={{
          padding:'28px 32px',
          display:'flex', alignItems:'center', gap:32, flexWrap:'wrap',
          backgroundImage:'radial-gradient(circle at 95% 50%, rgba(201,160,48,.18) 0%, transparent 50%)',
        }}>
          <div style={{ flex:1, minWidth:220 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'#F0CC5A', marginBottom:6 }}>
              Academic Performance
            </div>
            <h1 className="serif" style={{ fontSize:32, fontWeight:400, margin:0, lineHeight:1.1 }}>
              {graded.length > 0
                ? `Averaging ${overallStats.avgPct}% across ${graded.length} exam${graded.length===1?'':'s'}`
                : 'Awaiting graded results'}
            </h1>
            <div style={{ fontSize:13, opacity:.85, marginTop:6 }}>
              {overallStats.maxScore > 0 && (
                <>{overallStats.totalScore} of {overallStats.maxScore} marks total
                  {pendingCount > 0 && <> &middot; {pendingCount} awaiting grading</>}
                </>
              )}
              {graded.length === 0 && pendingCount > 0 && <>{pendingCount} exam{pendingCount===1?'':'s'} awaiting your teacher's review</>}
            </div>
          </div>
          {graded.length > 0 && (
            <CircularRing
              percentage={overallStats.avgPct}
              size={140}
              stroke={11}
              trackColor="rgba(251,250,245,.15)"
              fillColor="#C9A030"
              label="Overall"
            />
          )}
        </div>
        {subjectStats.length > 0 && (
          <div style={{
            background:'rgba(0,0,0,.18)',
            padding:'18px 32px',
            display:'flex', flexWrap:'wrap', gap:18,
            alignItems:'center',
          }}>
            <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'#F0CC5A', marginRight:12 }}>
              By Subject
            </div>
            {subjectStats.map(s => (
              <div key={s.subject} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <CircularRing
                  percentage={s.avgPct}
                  size={56}
                  stroke={5}
                  trackColor="rgba(251,250,245,.18)"
                  fillColor={s.avgPct >= 70 ? '#86EFAC' : s.avgPct >= 50 ? '#FDE68A' : '#FCA5A5'}
                />
                <div>
                  <div style={{ fontSize:12.5, fontWeight:600, color:'#FBFAF5' }}>{s.subject}</div>
                  <div style={{ fontSize:10.5, color:'#F0CC5A' }}>
                    {s.count} exam{s.count===1?'':'s'} &middot; {s.avgPct}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        display:'flex', alignItems:'center', gap:10, marginBottom:12, flexWrap:'wrap',
      }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#6B6B6B', letterSpacing:'.06em', textTransform:'uppercase' }}>
          Sort:
        </div>
        {[
          ['recent', 'Most Recent'],
          ['highest', 'Highest Score'],
          ['lowest', 'Needs Attention'],
          ['subject', 'By Subject'],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setSortBy(id)}
            style={{
              background: sortBy === id ? '#7D1025' : 'transparent',
              color: sortBy === id ? '#fff' : '#7D1025',
              border: '1px solid ' + (sortBy === id ? '#7D1025' : '#E8E2D6'),
              padding:'6px 12px', borderRadius:99,
              fontSize:11.5, fontWeight:600, cursor:'pointer',
            }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {sortedResults.map(r => {
          const exam = r.examId
          const isGraded = r.status === 'graded'
          const subjCol = subjectColour(exam?.subject)
          const submittedDate = r.submittedAt
            ? new Date(r.submittedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
            : '—'

          return (
            <div key={r._id} className="card" style={{
              padding:14, cursor: (isGraded && r.kind !== 'homework') ? 'pointer' : 'default',
              borderLeft:'4px solid ' + subjCol,
              opacity: isGraded ? 1 : .75,
              transition:'transform .15s',
            }}
              onMouseEnter={(e) => { if (isGraded && r.kind !== 'homework') e.currentTarget.style.transform = 'translateX(2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)' }}
              // Only exam rows open the breakdown. Homework results have no
              // exam-detail endpoint, so a click would 404 — they show
              // their score inline instead.
              onClick={() => { if (isGraded && r.kind !== 'homework') setSelectedSubId(r._id) }}
              title={r.kind === 'homework'
                ? 'Homework result — open the Homework tab for the marked answers'
                : isGraded ? 'Click for full breakdown' : 'Awaiting teacher review'}
            >
              <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ display:'flex', gap:6, marginBottom:4, flexWrap:'wrap', alignItems:'center' }}>
                    <span style={{
                      background: subjCol + '15', color: subjCol,
                      fontSize:9.5, fontWeight:700, letterSpacing:'.06em',
                      padding:'2px 8px', borderRadius:99, textTransform:'uppercase',
                    }}>{exam?.subject || 'Subject'}</span>
                    <span style={{
                      background: r.kind === 'homework' ? '#EDE9FE' : '#DBEAFE',
                      color:      r.kind === 'homework' ? '#5B21B6' : '#1E40AF',
                      fontSize:9.5, fontWeight:700, letterSpacing:'.06em',
                      padding:'2px 8px', borderRadius:99, textTransform:'uppercase',
                    }}>{r.kind === 'homework' ? 'Homework' : 'Exam'}</span>
                    {!isGraded && (
                      <span style={{
                        background:'#FEF3C7', color:'#92400E',
                        fontSize:9.5, fontWeight:700, letterSpacing:'.06em',
                        padding:'2px 8px', borderRadius:99,
                      }}>AWAITING GRADE</span>
                    )}
                    <span style={{ fontSize:11, color:'#6B6B6B' }}>
                      {exam?.curriculum} {exam?.grade}
                    </span>
                  </div>
                  <div style={{ fontWeight:700, fontSize:15.5, color:'#1A1A1A', marginBottom:2 }}>
                    {exam?.title || 'Exam'}
                  </div>
                  <div style={{ fontSize:11.5, color:'#6B6B6B' }}>
                    Submitted {submittedDate}
                    {exam?.teacherId && <> &middot; Marked by {exam.teacherId.firstName} {exam.teacherId.lastName}</>}
                  </div>
                </div>
                {isGraded ? (
                  <>
                    <CircularRing
                      percentage={r.percentage || 0}
                      size={64}
                      stroke={6}
                      trackColor="#FBF6E3"
                      fillColor={r.percentage >= 70 ? '#15803D' : r.percentage >= 50 ? '#C9A030' : '#B45309'}
                    />
                    <div style={{ minWidth:80, textAlign:'right' }}>
                      <div className="mono" style={{ fontSize:14, fontWeight:700, color:'#1A1A1A' }}>
                        {r.totalScore}/{r.maxScore}
                      </div>
                      {r.grade && (
                        <div style={{
                          display:'inline-block', marginTop:4,
                          background: r.percentage >= 70 ? '#DCFCE7' : r.percentage >= 50 ? '#FBF6E3' : '#FEE2E2',
                          color:     r.percentage >= 70 ? '#15803D' : r.percentage >= 50 ? '#7D1025' : '#B45309',
                          padding:'2px 8px', borderRadius:99,
                          fontSize:11, fontWeight:700,
                        }}>
                          {r.grade}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ minWidth:80, textAlign:'right' }}>
                    <div style={{ fontSize:11.5, color:'#92400E', fontStyle:'italic' }}>
                      Pending teacher review
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// CircularRing — animated radial progress indicator
// ─────────────────────────────────────────────────────────
function CircularRing({ percentage = 0, size = 64, stroke = 6, trackColor = '#E8E2D6', fillColor = '#7D1025', label }) {
  const [displayed, setDisplayed] = useState(0)
  const target = Math.max(0, Math.min(100, percentage))

  useEffect(() => {
    let frame
    const startTime = Date.now()
    const duration = 900
    const animate = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayed(Math.round(target * eased))
      if (t < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [target])

  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayed / 100) * circumference

  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius}
          fill="transparent" stroke={trackColor} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={radius}
          fill="transparent" stroke={fillColor} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition:'stroke-dashoffset 100ms linear' }}/>
      </svg>
      <div style={{
        position:'absolute', inset:0,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        textAlign:'center',
      }}>
        <div className="mono" style={{
          fontSize: size >= 100 ? 28 : size >= 56 ? 14 : 11,
          fontWeight:700, color: fillColor, lineHeight:1,
        }}>
          {displayed}%
        </div>
        {label && (
          <div style={{
            fontSize: size >= 100 ? 10 : 8.5,
            fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase',
            color: fillColor, marginTop:size >= 100 ? 4 : 2, opacity:.75,
          }}>
            {label}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// MyResultDetail — premium per-result breakdown
// ─────────────────────────────────────────────────────────
/**
 * ResultIcon — coloured SVG icons for the results screen.
 *
 * These replace emoji. Emoji are rendered by the operating system, so
 * the same character is a flat glyph on Windows, a glossy 3D blob on
 * Apple and something else again on Android — the product looks
 * different on every device and cannot be brand-controlled. These are
 * drawn once, use the Smartious palette, and are identical everywhere.
 *
 * Each is multi-tone (a soft fill plus a stronger stroke) so it reads
 * as an illustration rather than a wireframe glyph at 26px.
 */
function ResultIcon({ name, size = 26 }) {
  const p = { width: size, height: size, viewBox: '0 0 32 32', fill: 'none',
              xmlns: 'http://www.w3.org/2000/svg', style: { display: 'block' } }
  const S = { strokeLinecap: 'round', strokeLinejoin: 'round' }

  switch (name) {
    case 'questions': return (
      <svg {...p}><rect x="7" y="4" width="18" height="24" rx="3" fill="#FDE7EA"/>
        <rect x="7" y="4" width="18" height="24" rx="3" stroke="#C1121F" strokeWidth="1.8"/>
        <rect x="12" y="2" width="8" height="5" rx="2" fill="#C1121F"/>
        <path d="M12 14h8M12 19h5" stroke="#C1121F" strokeWidth="1.8" {...S}/></svg>)
    case 'correct': return (
      <svg {...p}><circle cx="16" cy="16" r="13" fill="#DCFCE7"/>
        <circle cx="16" cy="16" r="13" stroke="#15803D" strokeWidth="1.8"/>
        <path d="M10 16.5l4 4 8-8.5" stroke="#15803D" strokeWidth="2.6" {...S}/></svg>)
    case 'wrong': return (
      <svg {...p}><circle cx="16" cy="16" r="13" fill="#FEF3C7"/>
        <circle cx="16" cy="16" r="13" stroke="#B45309" strokeWidth="1.8"/>
        <path d="M11.5 11.5l9 9M20.5 11.5l-9 9" stroke="#B45309" strokeWidth="2.6" {...S}/></svg>)
    case 'time': return (
      <svg {...p}><circle cx="16" cy="16" r="13" fill="#DBEAFE"/>
        <circle cx="16" cy="16" r="13" stroke="#1E40AF" strokeWidth="1.8"/>
        <path d="M16 9v7.5l4.5 3" stroke="#1E40AF" strokeWidth="2.4" {...S}/></svg>)
    case 'star': return (
      <svg {...p}><path d="M16 3.5l3.9 7.9 8.7 1.3-6.3 6.1 1.5 8.6L16 23.3l-7.8 4.1 1.5-8.6-6.3-6.1 8.7-1.3z"
        fill="#FEF0C7" stroke="#C9A030" strokeWidth="1.8" {...S}/></svg>)

    // ── Topic icons ──
    case 'skeleton': return (
      <svg {...p}><circle cx="16" cy="9" r="5.5" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.8"/>
        <path d="M16 14.5v13M11 18h10M12 27l4-3 4 3" stroke="#64748B" strokeWidth="2" {...S}/>
        <circle cx="14" cy="8.5" r="1.2" fill="#64748B"/><circle cx="18" cy="8.5" r="1.2" fill="#64748B"/></svg>)
    case 'muscle': return (
      <svg {...p}><path d="M7 19c0-6 4-10 9-10 5 0 9 3 9 8 0 5-4 8-9 8-4 0-9-2-9-6z" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.8"/>
        <path d="M12 15c2 2 5 2 7 0" stroke="#DC2626" strokeWidth="1.8" {...S}/></svg>)
    case 'heart': return (
      <svg {...p}><path d="M16 27S4 20 4 12.5C4 8.4 7.1 5.5 10.8 5.5c2.2 0 4.1 1.1 5.2 2.8 1.1-1.7 3-2.8 5.2-2.8C24.9 5.5 28 8.4 28 12.5 28 20 16 27 16 27z"
        fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.8" {...S}/></svg>)
    case 'lungs': return (
      <svg {...p}><path d="M16 5v11" stroke="#0891B2" strokeWidth="2" {...S}/>
        <path d="M13 13c0 6-2 9-5 11-2 1.3-3-.5-3-2.5 0-5 1.5-9 4-11 2-1.6 4-.5 4 2.5z" fill="#CFFAFE" stroke="#0891B2" strokeWidth="1.8" {...S}/>
        <path d="M19 13c0 6 2 9 5 11 2 1.3 3-.5 3-2.5 0-5-1.5-9-4-11-2-1.6-4-.5-4 2.5z" fill="#CFFAFE" stroke="#0891B2" strokeWidth="1.8" {...S}/></svg>)
    case 'brain': return (
      <svg {...p}><path d="M12 6c-3 0-5 2-5 4.5 0 .8.2 1.5.6 2.1C6 13.6 5 15.2 5 17c0 2.4 1.8 4.4 4.2 4.9.3 2.3 2.3 4.1 4.8 4.1 1.2 0 2.2-.4 3-1V7c-.8-.6-1.8-1-3-1z"
        fill="#F3E8FF" stroke="#7C3AED" strokeWidth="1.8" {...S}/>
        <path d="M20 6c3 0 5 2 5 4.5 0 .8-.2 1.5-.6 2.1C26 13.6 27 15.2 27 17c0 2.4-1.8 4.4-4.2 4.9-.3 2.3-2.3 4.1-4.8 4.1-1.2 0-2.2-.4-3-1V7c.8-.6 1.8-1 3-1z"
        fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.8" {...S}/></svg>)
    case 'digest': return (
      <svg {...p}><path d="M13 5v5c-4 1-6 4-6 8 0 5 4 9 9 9 4 0 7-2 8-5" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.8" {...S}/>
        <path d="M13 5h5c3 0 5 2 5 5v6" stroke="#D97706" strokeWidth="1.8" {...S}/></svg>)
    case 'plant': return (
      <svg {...p}><path d="M16 28V13" stroke="#15803D" strokeWidth="2.2" {...S}/>
        <path d="M16 17c-5 0-8-3-8-8 5 0 8 3 8 8z" fill="#BBF7D0" stroke="#15803D" strokeWidth="1.7" {...S}/>
        <path d="M16 14c5 0 8-3 8-8-5 0-8 3-8 8z" fill="#86EFAC" stroke="#15803D" strokeWidth="1.7" {...S}/></svg>)
    case 'atom': return (
      <svg {...p}><circle cx="16" cy="16" r="3" fill="#7C3AED"/>
        <ellipse cx="16" cy="16" rx="12" ry="5" stroke="#A855F7" strokeWidth="1.8"/>
        <ellipse cx="16" cy="16" rx="12" ry="5" stroke="#A855F7" strokeWidth="1.8" transform="rotate(60 16 16)"/>
        <ellipse cx="16" cy="16" rx="12" ry="5" stroke="#A855F7" strokeWidth="1.8" transform="rotate(120 16 16)"/></svg>)
    case 'energy': return (
      <svg {...p}><path d="M18 3L7 18h7l-2 11 11-15h-7z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.8" {...S}/></svg>)
    case 'force': return (
      <svg {...p}><path d="M9 6h5v11a5 5 0 0 0 4 0V6h5v11a10 10 0 0 1-14 0z" fill="#E0E7FF" stroke="#4338CA" strokeWidth="1.8" {...S}/>
        <path d="M9 6v4h5V6M18 6v4h5V6" stroke="#4338CA" strokeWidth="1.8" {...S}/></svg>)
    case 'light': return (
      <svg {...p}><path d="M16 4a8 8 0 0 0-5 14.2V22h10v-3.8A8 8 0 0 0 16 4z" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="1.8" {...S}/>
        <path d="M12.5 25h7M13.5 28h5" stroke="#CA8A04" strokeWidth="2" {...S}/></svg>)
    case 'space': return (
      <svg {...p}><circle cx="16" cy="16" r="7" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="1.8"/>
        <ellipse cx="16" cy="16" rx="13" ry="4.5" stroke="#1D4ED8" strokeWidth="1.8" transform="rotate(-22 16 16)"/></svg>)
    case 'water': return (
      <svg {...p}><path d="M16 3.5s9 10 9 15.5a9 9 0 0 1-18 0C7 13.5 16 3.5 16 3.5z" fill="#BFDBFE" stroke="#1D4ED8" strokeWidth="1.8" {...S}/></svg>)
    case 'number': return (
      <svg {...p}><rect x="4" y="4" width="24" height="24" rx="5" fill="#FDE7EA" stroke="#C1121F" strokeWidth="1.8"/>
        <path d="M12 9v14M20 9v14M8 14h16M8 19h16" stroke="#C1121F" strokeWidth="1.8" {...S}/></svg>)
    case 'algebra': return (
      <svg {...p}><rect x="4" y="4" width="24" height="24" rx="5" fill="#EDE9FE" stroke="#6D28D9" strokeWidth="1.8"/>
        <path d="M11 11l10 10M21 11L11 21" stroke="#6D28D9" strokeWidth="2.4" {...S}/></svg>)
    case 'geometry': return (
      <svg {...p}><path d="M5 25L16 5l11 20z" fill="#CFFAFE" stroke="#0E7490" strokeWidth="1.8" {...S}/>
        <path d="M11 25a5 5 0 0 1 5-5" stroke="#0E7490" strokeWidth="1.6" {...S}/></svg>)
    case 'measure': return (
      <svg {...p}><rect x="3" y="11" width="26" height="10" rx="2.5" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.8"/>
        <path d="M9 11v4M14 11v6M19 11v4M24 11v6" stroke="#B45309" strokeWidth="1.7" {...S}/></svg>)
    case 'stats': return (
      <svg {...p}><rect x="4" y="16" width="6" height="12" rx="1.6" fill="#BFDBFE" stroke="#1D4ED8" strokeWidth="1.7"/>
        <rect x="13" y="9" width="6" height="19" rx="1.6" fill="#93C5FD" stroke="#1D4ED8" strokeWidth="1.7"/>
        <rect x="22" y="13" width="6" height="15" rx="1.6" fill="#BFDBFE" stroke="#1D4ED8" strokeWidth="1.7"/></svg>)
    case 'money': return (
      <svg {...p}><circle cx="16" cy="16" r="12" fill="#DCFCE7" stroke="#15803D" strokeWidth="1.8"/>
        <path d="M16 9v14M12.5 12.5h6a2.8 2.8 0 0 1 0 5.6h-5a2.8 2.8 0 0 0 0 5.6h6" stroke="#15803D" strokeWidth="1.9" {...S}/></svg>)
    case 'reading': return (
      <svg {...p}><path d="M16 8.5C13.5 6.5 9.5 6 5 6.5v18C9.5 24 13.5 24.5 16 26.5V8.5z" fill="#FDE7EA" stroke="#C1121F" strokeWidth="1.8" {...S}/>
        <path d="M16 8.5C18.5 6.5 22.5 6 27 6.5v18c-4.5-.5-8.5 0-11 2V8.5z" fill="#FEF0C7" stroke="#C1121F" strokeWidth="1.8" {...S}/></svg>)
    case 'writing': return (
      <svg {...p}><path d="M6 26l1.5-5.5L21 7a2.8 2.8 0 0 1 4 4L11.5 24.5z" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.8" {...S}/>
        <path d="M19.5 8.5l4 4" stroke="#B45309" strokeWidth="1.8" {...S}/></svg>)
    case 'grammar': return (
      <svg {...p}><rect x="4" y="6" width="24" height="20" rx="4" fill="#E0E7FF" stroke="#4338CA" strokeWidth="1.8"/>
        <path d="M10 20l4-9 4 9M11.5 17h5M21 11v9" stroke="#4338CA" strokeWidth="1.9" {...S}/></svg>)
    case 'speaking': return (
      <svg {...p}><path d="M5 8.5A3.5 3.5 0 0 1 8.5 5h15A3.5 3.5 0 0 1 27 8.5v9a3.5 3.5 0 0 1-3.5 3.5H13l-6 5.5v-5.5A3.5 3.5 0 0 1 5 17.5z"
        fill="#DCFCE7" stroke="#15803D" strokeWidth="1.8" {...S}/></svg>)
    case 'history': return (
      <svg {...p}><path d="M7 27V11l9-6 9 6v16z" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.8" {...S}/>
        <path d="M12 27v-8h8v8M4 27h24" stroke="#B45309" strokeWidth="1.8" {...S}/></svg>)
    case 'geography': return (
      <svg {...p}><circle cx="16" cy="16" r="12" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="1.8"/>
        <path d="M4 16h24M16 4c3.5 4 3.5 20 0 24M16 4c-3.5 4-3.5 20 0 24" stroke="#1D4ED8" strokeWidth="1.6" {...S}/></svg>)
    case 'computing': return (
      <svg {...p}><rect x="3" y="6" width="26" height="17" rx="3" fill="#E0E7FF" stroke="#4338CA" strokeWidth="1.8"/>
        <path d="M12 12l-3 3 3 3M20 12l3 3-3 3M10 27h12" stroke="#4338CA" strokeWidth="1.9" {...S}/></svg>)
    default: return (
      <svg {...p}><rect x="5" y="5" width="22" height="22" rx="5" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.8"/>
        <path d="M11 12h10M11 16h10M11 20h6" stroke="#64748B" strokeWidth="1.8" {...S}/></svg>)
  }
}

function MyResultDetail({ subId, detail, loading, onBack }) {
  const [expandedAnswers, setExpandedAnswers] = useState({})

  if (loading || !detail) {
    return (
      <div>
        <button onClick={onBack}
          style={{
            background:'transparent', border:'none', color:'#7D1025',
            fontSize:13, fontWeight:700, cursor:'pointer',
            padding:'6px 0', marginBottom:14,
            display:'flex', alignItems:'center', gap:6,
          }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Results
        </button>
        <div className="card" style={{ padding:'60px 20px', textAlign:'center' }}>
          <div className="mono" style={{ fontSize:13, color:'var(--s400)', letterSpacing:'.1em' }}>
            LOADING RESULT...
          </div>
        </div>
      </div>
    )
  }

  const sub = detail.submission
  const exam = sub.examId
  const bank = detail.bankQuestions || []
  const subjCol = subjectColour(exam?.subject)
  const pct = sub.percentage || 0
  const passed = pct >= 50
  const isGraded = sub.status === 'graded'

  // ── Derived values for the results screen ────────────────
  const avatarUrl = user?.avatar || ''
  const firstName = (user?.firstName || '').trim()

  // Encouragement is banded, and the low band is deliberately not
  // "you failed". A result screen is where a child finds out how they
  // did; the wording should tell the truth and still leave them able
  // to try again.
  const praise = pct >= 85
    ? { headline:`Outstanding, ${firstName || 'well done'}!`, sub:"You're mastering this material.",
        title:'Excellent Performance!', body:'You have a strong understanding of this topic. Keep it up!',
        icon:'star', tintFg:'#15803D' }
    : pct >= 70
    ? { headline:`Great job, ${firstName || 'well done'}!`, sub:"You're making excellent progress.",
        title:'Strong Result', body:'You handled most of this confidently. Review the topics below to push higher.',
        icon:'star', tintFg:'#15803D' }
    : pct >= 50
    ? { headline:`Good effort, ${firstName || 'well done'}!`, sub:'A solid pass with room to grow.',
        title:'Solid Pass', body:'You have the basics. The weaker topics below are where the next marks are.',
        icon:'correct', tintFg:'#B45309' }
    : { headline:`Keep going, ${firstName || 'you can do this'}.`, sub:'This one was tough — that happens.',
        title:'Room to Improve', body:'Work through the topics below with your teacher, then try again.',
        icon:'muscle', tintFg:'#B91C1C' }

  const findQuestion = (ref) => {
    if (!ref) return null
    if (ref.startsWith('custom:')) {
      const idx = parseInt(ref.slice(7), 10)
      return (exam?.customQuestions || [])[idx] || null
    }
    return bank.find(q => String(q._id) === String(ref)) || null
  }
  // Counts. answers[] carries isCorrect per leaf once graded.
  const stats = (() => {
    const ans = sub.answers || []
    const correct = ans.filter(a => a.isCorrect === true).length
    const wrong   = ans.filter(a => a.isCorrect === false).length
    const total   = ans.length || (exam?.totalQuestions || 0)
    const secs    = Number(sub.timeSpentSecs) || 0
    const timeStr = secs
      ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
      : '\u2014'
    return { total, correct, wrong, timeStr }
  })()

  // Topic breakdown, built from each answered question's topic tag.
  // Marks are used rather than a right/wrong count so a part-marked
  // long answer contributes proportionally.
  const TOPIC_ICON = [
    [/skelet|bone/i,'skeleton'], [/muscl/i,'muscle'], [/digest|stomach|nutri/i,'digest'],
    [/circulat|heart|blood/i,'heart'], [/respirat|lung|breath/i,'lungs'],
    [/nervous|brain|neuro|sense/i,'brain'], [/plant|photosynth|leaf|seed|flower/i,'plant'],
    [/cell|microb|bacteri|life ?cycle|classif/i,'atom'],
    [/energy|electric|circuit|magnet/i,'energy'], [/force|motion|friction|gravit/i,'force'],
    [/light|optic|shadow|colour|color/i,'light'], [/sound|wave|hearing/i,'speaking'],
    [/space|planet|earth|solar|moon|sun/i,'space'], [/water|rain|ocean|weather|state/i,'water'],
    [/rock|geolog|soil|fossil/i,'history'],
    [/number|arithmet|place value|fraction|decimal|percent|count/i,'number'],
    [/algebra|equation|sequence|calculat/i,'algebra'],
    [/geometr|shape|angle|symmetr|position|movement/i,'geometry'],
    [/measure|mass|length|volume|time|capacit/i,'measure'],
    [/statistic|data|graph|chart|probab/i,'stats'],
    [/money|finance|cost|budget|ratio|proportion/i,'money'],
    [/read|comprehen|fiction|non-fiction|text/i,'reading'],
    [/writ|composit|essay|narrat|plan/i,'writing'],
    [/grammar|punctuat|spell|vocabul|word|sentence/i,'grammar'],
    [/poet|poem|verse/i,'writing'], [/speak|listen|discuss|present/i,'speaking'],
    [/histor|past|ancient|civilisat/i,'history'], [/map|geograph|country|place/i,'geography'],
    [/comput|program|algorithm|code|binary|network|data ?hand/i,'computing'],
    [/chemi|element|reaction|acid|material|separat/i,'atom'],
  ]
  const iconForTopic = (t) => {
    const hit = TOPIC_ICON.find(([re]) => re.test(t || ''))
    return hit ? hit[1] : 'default'
  }

  const topicRows = (() => {
    const acc = {}
    ;(sub.answers || []).forEach(a => {
      const q = findQuestion(a.questionRef)
      const topic = (q?.topic || q?.subtopic || '').trim()
      if (!topic) return
      const leaf = findLeaf(q, a.partPath) || q
      const possible = Number(leaf?.marks) || 1
      const got = Number(a.marksAwarded) || 0
      if (!acc[topic]) acc[topic] = { got: 0, possible: 0 }
      acc[topic].got += got
      acc[topic].possible += possible
    })
    return Object.entries(acc)
      .filter(([, v]) => v.possible > 0)
      .map(([topic, v]) => ({
        topic,
        // Spine topics read "Year 5 · Number — Place Value"; only the
        // last segment is useful in a narrow column.
        label: topic.split('\u2014').pop().split('\u00b7').pop().trim() || topic,
        icon: iconForTopic(topic),
        pct: Math.round((v.got / v.possible) * 100),
      }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 8)
  })()

  const findLeaf = (question, partPath) => {
    if (!question || !Array.isArray(partPath) || partPath.length === 0) return null
    let current = { parts: question.parts || [] }
    for (const idx of partPath) {
      if (!Array.isArray(current.parts) || !current.parts[idx]) return null
      current = current.parts[idx]
    }
    return current
  }

  return (
    <div>
      <button onClick={onBack}
        style={{
          background:'transparent', border:'none', color:'#7D1025',
          fontSize:13, fontWeight:700, cursor:'pointer',
          padding:'6px 0', marginBottom:14,
          display:'flex', alignItems:'center', gap:6,
        }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Results
      </button>

      {/* ── RESULTS HERO ────────────────────────────────────────
          The student's own photo and a hand-drawn grade ring. A result
          screen is the moment a child finds out how they did, so it
          leads with encouragement and their name rather than a number. */}
      <div className="card sm-glow sm-glow-card" style={{
        padding:0, marginBottom:16, overflow:'hidden',
        boxShadow:'0 12px 40px rgba(125,16,37,.12)',
      }}>
        <div style={{
          display:'grid', gridTemplateColumns:'minmax(0,1.15fr) auto',
          gap:20, alignItems:'center',
          padding:'26px 30px',
          background:'linear-gradient(105deg, #FDFAF4 0%, #FBF3F4 62%, #F8E9EB 100%)',
        }}>
          <div style={{ minWidth:0 }}>
            <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:34, fontWeight:400,
                         margin:0, lineHeight:1.05, color:'#1A1A1A' }}>
              Results
            </h1>
            <div style={{ fontSize:22, fontWeight:800, color:'#C1121F', marginTop:4, lineHeight:1.2 }}>
              {praise.headline}
            </div>
            <div style={{ fontSize:14, color:'#4A4A4A', marginTop:5 }}>
              {praise.sub}
            </div>
            <div style={{ width:56, height:4, background:'#C1121F', borderRadius:2, marginTop:14 }}/>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
            {avatarUrl && (
              <img src={avatarUrl} alt=""
                onError={e => { e.currentTarget.style.display = 'none' }}
                style={{ width:96, height:96, borderRadius:'50%', objectFit:'cover',
                         border:'4px solid #fff', boxShadow:'0 8px 24px rgba(0,0,0,.14)' }}/>
            )}
            {/* Hand-circled grade, as a teacher would mark a paper. */}
            <div style={{ position:'relative', width:118, height:104, flexShrink:0 }}>
              <svg viewBox="0 0 130 116" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
                <ellipse cx="66" cy="60" rx="52" ry="45" fill="none" stroke="#C1121F" strokeWidth="5"
                  strokeLinecap="round" transform="rotate(-6 66 60)"
                  strokeDasharray="300" strokeDashoffset="14"/>
                <line x1="17" y1="20" x2="7"  y2="10" stroke="#C1121F" strokeWidth="4.5" strokeLinecap="round"/>
                <line x1="27" y1="13" x2="21" y2="2"  stroke="#C1121F" strokeWidth="4.5" strokeLinecap="round"/>
              </svg>
              <div style={{
                position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:"'Instrument Serif',serif", fontSize:44, color:'#C1121F', lineHeight:1,
                paddingBottom:4,
              }}>
                {sub.grade || (pct >= 50 ? 'P' : '\u2014')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DETAIL + TOPIC BREAKDOWN ───────────────────────────── */}
      <style>{`@media (max-width: 860px) { .res-split { grid-template-columns: 1fr !important; } }`}</style>
      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1.5fr) minmax(0,1fr)', gap:16, marginBottom:16 }}
           className="res-split">
        <div className="card sm-glow sm-glow-card" style={{ padding:'22px 26px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', gap:14, flexWrap:'wrap' }}>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:19, fontWeight:800, color:'#1A1A1A', lineHeight:1.25 }}>
                {exam?.subject}{exam?.title ? ' \u2013 ' + exam.title : ''}
              </div>
              <div style={{ fontSize:13, color:'#6B6B6B', marginTop:3 }}>
                {exam?.curriculum ? exam.curriculum + ' \u00b7 ' : ''}{exam?.grade}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:12.5, color:'#6B6B6B' }}>Completed on</div>
              <div style={{ fontSize:14, fontWeight:700, color:'#C1121F' }}>
                {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : '\u2014'}
              </div>
            </div>
          </div>

          <div style={{ height:1, background:'var(--border)', margin:'18px 0' }}/>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(132px, 1fr))', gap:6 }}>
            {[
              ['Total Questions', stats.total,   'questions'],
              ['Correct Answers', stats.correct, 'correct'],
              ['Wrong Answers',   stats.wrong,   'wrong'],
              ['Time Taken',      stats.timeStr, 'time'],
            ].map(([label, value, icon]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:11, padding:'6px 4px' }}>
                <span style={{
                  width:46, height:46, flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}><ResultIcon name={icon} size={38} /></span>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:11.5, color:'#6B6B6B', fontWeight:600 }}>{label}</div>
                  <div style={{ fontSize:21, fontWeight:800, color:'#1A1A1A', lineHeight:1.15 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:20 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1A1A1A', marginBottom:8 }}>
              Performance Overview
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ flex:1, height:10, background:'#EDEDED', borderRadius:99, overflow:'hidden' }}>
                <div style={{
                  width:`${Math.max(0, Math.min(100, pct))}%`, height:'100%', borderRadius:99,
                  background: pct >= 70 ? '#22C55E' : pct >= 50 ? '#C9A030' : '#EF4444',
                  transition:'width .6s ease',
                }}/>
              </div>
              <div style={{ fontSize:21, fontWeight:800, color: pct >= 70 ? '#15803D' : pct >= 50 ? '#B45309' : '#B91C1C' }}>
                {pct}%
              </div>
            </div>
          </div>

          <div style={{
            marginTop:18, background:'#F5F5F3', borderRadius:12, padding:'16px 18px',
            display:'flex', gap:13, alignItems:'flex-start',
          }}>
            <span style={{
              width:44, height:44, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}><ResultIcon name={praise.icon} size={40} /></span>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:15.5, fontWeight:800, color:praise.tintFg }}>{praise.title}</div>
              <div style={{ fontSize:13.5, color:'#4A4A4A', marginTop:3, lineHeight:1.55 }}>
                {praise.body}
              </div>
            </div>
          </div>
        </div>

        {/* Topic breakdown, computed from each answer's question topic. */}
        <div className="card sm-glow sm-glow-card" style={{ padding:'22px 24px', display:'flex', flexDirection:'column' }}>
          <div style={{ fontSize:17, fontWeight:800, color:'#1A1A1A', marginBottom:14 }}>
            Topic Breakdown
          </div>
          {topicRows.length === 0 ? (
            <div style={{ fontSize:13, color:'#6B6B6B', lineHeight:1.6 }}>
              This paper's questions are not tagged by topic, so a breakdown is not available.
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:13, flex:1 }}>
              {topicRows.map(t => (
                <div key={t.topic} style={{ display:'flex', gap:11, alignItems:'center' }}>
                  <span style={{ width:34, flexShrink:0, display:'flex', justifyContent:'center' }}>
                    <ResultIcon name={t.icon} size={30} />
                  </span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1A1A1A',
                                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {t.label}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:9, marginTop:4 }}>
                      <div style={{ flex:1, height:7, background:'#EDEDED', borderRadius:99, overflow:'hidden' }}>
                        <div style={{
                          width:`${t.pct}%`, height:'100%', borderRadius:99,
                          background: t.pct >= 70 ? '#22C55E' : t.pct >= 50 ? '#C9A030' : '#EF4444',
                        }}/>
                      </div>
                      <span style={{ fontSize:12.5, fontWeight:700, color:'#4A4A4A', minWidth:34, textAlign:'right' }}>
                        {t.pct}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => window.print()}
            style={{
              marginTop:18, width:'100%', background:'#C1121F', color:'#fff', border:'none',
              borderRadius:99, padding:'13px 20px', fontSize:14, fontWeight:800, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:9,
              boxShadow:'0 8px 22px rgba(193,18,31,.28)',
            }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Report
          </button>
        </div>
      </div>

      {/* Teacher feedback, now a card of its own — it used to be
          nested inside the old results header. */}
      {/* Teacher feedback, now a card of its own — it used to be
          nested inside the old results header. */}
      {isGraded && sub.feedback && (
        <div className="card sm-glow sm-glow-card" style={{
          background:'#FBF6E3', padding:'20px 32px',
          position:'relative', marginBottom:16,
        }}>
          <div style={{
            position:'absolute', top:14, left:18,
            fontSize:64, color:'#C9A030', opacity:.25,
            fontFamily:"'Instrument Serif',serif", lineHeight:1,
          }}>&ldquo;</div>
          <div style={{ paddingLeft:32 }}>
            <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'#7D1025', marginBottom:6 }}>
              Teacher Feedback
            </div>
            <div className="serif" style={{ fontSize:16, color:'#1A1A1A', lineHeight:1.55, fontStyle:'italic' }}>
              {sub.feedback}
            </div>
            {exam?.teacherId && (
              <div style={{ fontSize:11.5, color:'#7D1025', marginTop:8, fontWeight:600 }}>
                &mdash; {exam.teacherId.firstName} {exam.teacherId.lastName}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ marginBottom:10 }}>
        <h2 className="serif" style={{ fontSize:22, fontWeight:400, color:'#1A1A1A', marginBottom:4 }}>
          Question by Question
        </h2>
        <div style={{ fontSize:12, color:'#6B6B6B', marginBottom:14 }}>
          Tap any answer to expand and see your response and your teacher's comment.
        </div>
      </div>

      {(sub.answers || []).length === 0 ? (
        <div className="card" style={{ padding:24, textAlign:'center' }}>
          <div style={{ fontSize:13, color:'#6B6B6B' }}>No answer breakdown available.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {sub.answers.map((answer, i) => {
            const question = findQuestion(answer.questionRef)
            const isNested = Array.isArray(answer.partPath) && answer.partPath.length > 0
            const leafPart = isNested ? findLeaf(question, answer.partPath) : null

            const isCustomRef = answer.questionRef?.startsWith('custom:')
            const qIndex = isCustomRef
              ? -1
              : (exam?.questionIds || []).findIndex(qid => String(qid) === String(answer.questionRef))
            const qLabel = qIndex < 0 ? 'Q?' : 'Q' + (qIndex + 1)
            const fullLabel = isNested ? qLabel + '.' + labelAt(answer.partPath) : qLabel

            const maxMarks = leafPart
              ? (Number(leafPart.marks) || 0)
              : (question ? (Number(question.marks) || 0) : 0)
            const awarded = Number(answer.marksAwarded) || 0
            const isFull = maxMarks > 0 && awarded === maxMarks
            const isZero = awarded === 0 && maxMarks > 0
            const partial = !isFull && !isZero && maxMarks > 0

            const statusColor = isFull ? '#15803D' : partial ? '#C9A030' : '#B45309'
            const statusIcon = isFull ? '✓' : partial ? '◐' : '✗'

            const questionText = leafPart ? leafPart.text : (question?.questionText || '(question not found)')
            const partType = leafPart ? leafPart.type : (question?.type || 'short')
            const isExpanded = !!expandedAnswers[i]

            return (
              <div key={i} className="card" style={{
                padding:0, overflow:'hidden',
                borderLeft: '4px solid ' + statusColor,
                cursor: 'pointer',
                transition:'box-shadow .15s',
              }}
                onClick={() => setExpandedAnswers(s => ({ ...s, [i]: !s[i] }))}
              >
                <div style={{
                  padding:'12px 16px',
                  display:'flex', alignItems:'center', gap:12, flexWrap:'wrap',
                }}>
                  <div className="mono" style={{
                    minWidth:54, padding:'4px 8px', borderRadius:6,
                    background:'#7D1025', color:'#fff',
                    fontSize:11, fontWeight:700, textAlign:'center', flexShrink:0,
                  }}>
                    {fullLabel}
                  </div>
                  <div style={{ flex:1, minWidth:0, fontSize:13.5, color:'#1A1A1A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace: isExpanded ? 'normal' : 'nowrap', lineHeight:1.4 }}>
                    {questionText}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                    <div style={{
                      width:28, height:28, borderRadius:'50%',
                      background: statusColor, color:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:14, fontWeight:700,
                    }}>{statusIcon}</div>
                    <div className="mono" style={{
                      fontSize:13.5, fontWeight:700, color: statusColor,
                      minWidth:48, textAlign:'center',
                    }}>
                      {awarded}/{maxMarks}
                    </div>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                      stroke="#6B6B6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{
                    padding:'4px 16px 16px',
                    borderTop:'1px solid #E8E2D6',
                    background:'#FBFAF5',
                  }} onClick={(e) => e.stopPropagation()}>
                    {isNested && question?.questionText && (
                      <div style={{
                        marginTop:12, padding:'10px 14px',
                        background:'#FBF6E3', borderLeft:'3px solid #C9A030', borderRadius:4,
                        fontSize:12, color:'#6B6B6B', fontStyle:'italic', lineHeight:1.55,
                      }}>
                        <strong style={{ color:'#7D1025', fontStyle:'normal' }}>Context: </strong>
                        {question.questionText}
                      </div>
                    )}
                    {leafPart && Array.isArray(leafPart.attachments) && leafPart.attachments.length > 0 && (
                      <div style={{ marginTop:12 }}>
                        <AttachmentList attachments={leafPart.attachments}/>
                      </div>
                    )}
                    {!leafPart && question && Array.isArray(question.attachments) && question.attachments.length > 0 && (
                      <div style={{ marginTop:12 }}>
                        <AttachmentList attachments={question.attachments}/>
                      </div>
                    )}

                    <div style={{ marginTop:12 }}>
                      <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#6B6B6B', marginBottom:6 }}>
                        Your answer
                        {answer.teacherAnnotation && (
                          <span style={{
                            marginLeft:8, padding:'2px 8px', borderRadius:99,
                            background:'#FBE8E8', color:'#7D1025',
                            fontSize:9.5, letterSpacing:'.06em',
                          }}>
                            ✓ MARKED BY TEACHER
                          </span>
                        )}
                      </div>
                      {(partType === 'drawing' || partType === 'handwriting') && answer.answerText && answer.answerText.startsWith('data:') ? (() => {
                        // Show the teacher's annotated version if it exists,
                        // otherwise the student's original drawing.
                        const display = answer.teacherAnnotation || answer.answerText
                        return (
                          <a href={display} target="_blank" rel="noopener noreferrer">
                            <img src={display} alt={answer.teacherAnnotation ? 'Marked by teacher' : 'Your drawing'}
                              style={{
                                maxWidth:'100%', maxHeight:420,
                                border:'1px solid #E8E2D6', borderRadius:6,
                                background:'#fff', display:'block',
                              }}/>
                          </a>
                        )
                      })() : partType === 'mcq' ? (
                        <div style={{
                          padding:'10px 14px', background:'#fff', borderRadius:6,
                          border:'1px solid #E8E2D6', fontSize:13.5, color:'#1A1A1A',
                        }}>
                          {answer.selectedOption || answer.answerText || <em style={{ color:'#94A3B8' }}>(no answer)</em>}
                        </div>
                      ) : (
                        <div style={{
                          padding:'12px 14px', background:'#fff', borderRadius:6,
                          border:'1px solid #E8E2D6',
                          fontSize:13.5, color:'#1A1A1A', lineHeight:1.6,
                          whiteSpace:'pre-wrap',
                        }}>
                          {answer.answerText || <em style={{ color:'#94A3B8' }}>(no answer)</em>}
                        </div>
                      )}
                    </div>

                    {answer.teacherComment && (
                      <div style={{ marginTop:12 }}>
                        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#7D1025', marginBottom:6 }}>
                          Teacher's note
                        </div>
                        <div style={{
                          padding:'10px 14px',
                          background:'#FBF6E3', border:'1px solid #C9A030',
                          borderRadius:6,
                          fontSize:13, color:'#1A1A1A', lineHeight:1.55,
                          fontStyle:'italic',
                        }}>
                          {answer.teacherComment}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function HomeworkTab({ user, toast }) {
  // ── DATA ──
  const [homework, setHomework] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [view, setView] = useState('status')  // 'status' | 'subject' | 'date'
  const [selected, setSelected] = useState(null)  // homework being viewed
  const [submission, setSubmission] = useState(null)  // current student's submission for selected hw

  // ── ANSWER STATE ──
  // answers indexed by questionIndex: { type, answer, attachment, pasteWarning }
  const [answers, setAnswers] = useState({})
  const [pasteWarning, setPasteWarning] = useState({})
  const [submittingNow, setSubmittingNow] = useState(false)
  const [uploadingIdx, setUploadingIdx] = useState(null)

  // Load homework on mount
  useEffect(() => { loadHomework() }, [])

  const loadHomework = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/homework/student/list')
      if (data.success) {
        setHomework(data.homework || [])
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load homework')
    } finally {
      setLoading(false)
    }
  }

  // ── DERIVED STATUS ──
  const enrichStatus = (hw) => {
    if (hw.locked) return 'locked'
    if (hw.mySubmission) {
      if (hw.mySubmission.status === 'released' || hw.mySubmission.status === 'graded') return 'graded'
      if (hw.mySubmission.status === 'submitted') return 'submitted'
    }
    if (hw.overdue) return 'overdue'
    return 'pending'
  }

  const enriched = homework.map(hw => ({ ...hw, computedStatus: enrichStatus(hw) }))

  const counts = {
    locked: enriched.filter(h => h.computedStatus === 'locked').length,
    pending: enriched.filter(h => h.computedStatus === 'pending').length,
    overdue: enriched.filter(h => h.computedStatus === 'overdue').length,
    submitted: enriched.filter(h => h.computedStatus === 'submitted').length,
    graded: enriched.filter(h => h.computedStatus === 'graded').length,
  }

  // Group by view
  let grouped = {}
  if (view === 'status') {
    grouped = {
      'Overdue': enriched.filter(h => h.computedStatus === 'overdue'),
      'Locked (released later)': enriched.filter(h => h.computedStatus === 'locked'),
      'Pending': enriched.filter(h => h.computedStatus === 'pending'),
      'Submitted': enriched.filter(h => h.computedStatus === 'submitted'),
      'Graded': enriched.filter(h => h.computedStatus === 'graded'),
    }
  } else if (view === 'subject') {
    enriched.forEach(h => {
      if (!grouped[h.subject]) grouped[h.subject] = []
      grouped[h.subject].push(h)
    })
  } else if (view === 'date') {
    grouped = {
      'This Week': enriched.filter(h => {
        if (!h.dueAt) return false
        const days = (new Date(h.dueAt) - new Date()) / (1000 * 60 * 60 * 24)
        return days >= -7 && days <= 7
      }),
      'Next Week': enriched.filter(h => {
        if (!h.dueAt) return false
        const days = (new Date(h.dueAt) - new Date()) / (1000 * 60 * 60 * 24)
        return days > 7 && days <= 14
      }),
      'Later': enriched.filter(h => {
        if (!h.dueAt) return true
        const days = (new Date(h.dueAt) - new Date()) / (1000 * 60 * 60 * 24)
        return days > 14
      }),
      'No Due Date': enriched.filter(h => !h.dueAt),
    }
  }

  // ── OPEN HOMEWORK ──
  const openHomework = async (hw) => {
    if (hw.locked) {
      toast?.info?.('Homework opens on ' + formatHomeworkDateTime(hw.releaseAt))
      return
    }
    setSelected(hw)
    setAnswers({})
    setPasteWarning({})

    // If already submitted, just load the submission for display
    if (hw.mySubmission) {
      try {
        const { data } = await api.get('/homework/' + hw._id + '/my-submission')
        if (data.success && data.submission) {
          setSubmission(data.submission)
          // Pre-fill answers display from existing submission
          const initial = {}
          ;(data.submission.answers || []).forEach(a => {
            initial[a.questionIndex] = a
          })
          setAnswers(initial)
          return
        }
      } catch (e) { /* fall through */ }
    }

    // Otherwise create / fetch in-progress submission
    try {
      const { data } = await api.post('/homework/' + hw._id + '/start')
      if (data.success && data.submission) {
        setSubmission(data.submission)
        // Pre-fill any saved answers
        const initial = {}
        ;(data.submission.answers || []).forEach(a => {
          initial[a.questionIndex] = a
        })
        setAnswers(initial)
      }
    } catch (e) {
      toast?.error?.(e.response?.data?.message || 'Could not open homework')
      setSelected(null)
    }
  }

  const closeHomework = () => {
    setSelected(null)
    setSubmission(null)
    setAnswers({})
    setPasteWarning({})
  }

  // ── ANSWER HANDLERS ──
  const setAnswer = (idx, value) => {
    setAnswers(prev => ({
      ...prev,
      [idx]: { ...(prev[idx] || {}), answer: value },
    }))
  }

  const setAnswerAttachment = (idx, attachment) => {
    setAnswers(prev => ({
      ...prev,
      [idx]: { ...(prev[idx] || {}), attachment },
    }))
  }

  const showPasteWarning = (idx) => {
    setPasteWarning(prev => ({ ...prev, [idx]: true }))
    setTimeout(() => setPasteWarning(prev => ({ ...prev, [idx]: false })), 3000)
    toast?.error?.('Pasting is disabled. Please type your answer.')
  }

  // Upload an image attachment for a question (for upload-type questions)
  const uploadAnswerFile = async (idx, file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast?.error?.('File too large (max 5 MB)')
      return
    }
    setUploadingIdx(idx)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/questions/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data.success && data.attachment) {
        setAnswerAttachment(idx, data.attachment)
        toast?.ok?.('Uploaded')
      } else {
        toast?.error?.(data.message || 'Upload failed')
      }
    } catch (e) {
      toast?.error?.(e.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingIdx(null)
    }
  }

  // Validate all answers before submit
  const validateAnswers = (questions) => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const a = answers[i]
      if (q.type === 'mcq') {
        if (!a || a.answer === null || a.answer === undefined) {
          return 'Question ' + (i + 1) + ' (MCQ): pick an option'
        }
      } else if (q.type === 'short' || q.type === 'long') {
        if (!a || !a.answer || !String(a.answer).trim()) {
          return 'Question ' + (i + 1) + ': type your answer'
        }
        if (q.type === 'short' && String(a.answer).trim().length < 3) {
          return 'Question ' + (i + 1) + ': answer is too short'
        }
      } else if (q.type === 'upload') {
        if (!a || !a.attachment || !a.attachment.url) {
          return 'Question ' + (i + 1) + ': upload a file'
        }
      } else if (q.type === 'drawing') {
        if (!a || !a.attachment || !a.attachment.url) {
          return 'Question ' + (i + 1) + ' (drawing): please draw your answer'
        }
      } else if (q.type === 'handwriting') {
        if (!a || !a.attachment || !a.attachment.url) {
          return 'Question ' + (i + 1) + ' (handwriting): please write your answer'
        }
      }
    }
    return null
  }

  const submitHomework = async () => {
    if (!selected) return
    const err = validateAnswers(selected.questions || [])
    if (err) { toast?.error?.(err); return }

    setSubmittingNow(true)
    try {
      // Build payload
      const answerPayload = (selected.questions || []).map((q, idx) => {
        const a = answers[idx] || {}
        return {
          questionIndex: idx,
          answer: a.answer !== undefined ? a.answer : null,
          attachment: a.attachment || undefined,
        }
      })

      const { data } = await api.post('/homework/' + selected._id + '/submit', {
        answers: answerPayload,
      })

      if (data.success) {
        toast?.ok?.(data.message || 'Submitted')
        await loadHomework()
        closeHomework()
      } else {
        toast?.error?.(data.message || 'Submit failed')
      }
    } catch (e) {
      toast?.error?.(e.response?.data?.message || 'Submit failed: ' + e.message)
    } finally {
      setSubmittingNow(false)
    }
  }

  // ── RENDER ──
  return (
    <div>
      {/* ── Hero banner ────────────────────────────────────────
          The artwork carries the message, so nothing is laid over it.
          Slightly narrower than full width so the card reads as a
          deliberate object rather than a page-wide strip. The stat
          footer uses the Smartious gold with a soft glow. */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        maxWidth: 1180, marginLeft: 'auto', marginRight: 'auto',
      }}>
        <img
          src="/banners/homework-hero.jpg"
          alt="Stay consistent, build success — complete today, understand better"
          style={{ width: '100%', display: 'block', height: 'auto' }}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          background: '#6B0F1E',
        }}>
          {[
            ['Locked', counts.locked],
            ['Pending', counts.pending],
            ['Overdue', counts.overdue],
            ['Submitted', counts.submitted],
            ['Graded', counts.graded],
          ].map(([l, v]) => (
            <div key={l} style={{ padding: '13px 18px', borderRight: '1px solid rgba(201,160,48,.18)' }}>
              <div style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
                color: '#E8C97A', opacity: .85, marginBottom: 3,
                textShadow: '0 0 10px rgba(201,160,48,.45)',
              }}>{l}</div>
              <div style={{
                fontSize: 17, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace',
                color: '#F5D98B',
                textShadow: '0 0 12px rgba(245,217,139,.65), 0 0 26px rgba(201,160,48,.35)',
              }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grouping toggle — moved out of the hero, which is now artwork. */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <div style={{ display: 'flex', background: 'var(--s100)', borderRadius: 99, padding: 3, gap: 2 }}>
          {[['status', 'Status'], ['subject', 'Subject'], ['date', 'Date']].map(([id, label]) => (
            <button key={id} onClick={() => setView(id)} style={{
              background: view === id ? '#7D1025' : 'transparent',
              color: view === id ? '#fff' : 'var(--s600)',
              border: 'none', padding: '6px 16px', borderRadius: 99,
              cursor: 'pointer', fontSize: 12, fontWeight: 700,
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Loading / Error / Empty / List */}
      {loading && (
        <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--s500)' }}>
          Loading homework from your teachers...
        </div>
      )}

      {error && (
        <div className="card" style={{ padding: 16, background: '#FEF2F2', borderColor: '#FCA5A5' }}>
          <div style={{ fontWeight: 700, color: '#991B1B', marginBottom: 4 }}>Failed to load</div>
          <div style={{ fontSize: 13, color: '#7F1D1D' }}>{error}</div>
        </div>
      )}

      {!loading && !error && enriched.length === 0 && (
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: 'var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="var(--s400)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 17, color: 'var(--s800)', marginBottom: 6 }}>No homework yet</h3>
          <p style={{ fontSize: 13.5, color: 'var(--s500)', maxWidth: 380, margin: '0 auto' }}>
            When your teachers assign work, it will appear here. Make sure you're enrolled in your subjects.
          </p>
        </div>
      )}

      {!loading && !error && Object.entries(grouped).map(([groupName, items]) => {
        if (!items || items.length === 0) return null
        const isOverdueGroup = groupName === 'Overdue'
        const isLockedGroup = groupName.startsWith('Locked')
        return (
          <div key={groupName} className="card" style={{ marginBottom: 14 }}>
            <div className="chdr">
              <div className="ctitle" style={{ color: isOverdueGroup ? 'var(--r600)' : isLockedGroup ? 'var(--s500)' : undefined }}>
                {groupName}
              </div>
              <span className={'badge ' + (isOverdueGroup ? 'badge-red' : 'badge-slate')} style={isOverdueGroup ? { background: 'var(--r50)', color: 'var(--r600)' } : {}}>
                {items.length}
              </span>
            </div>
            <div style={MODULE_GRID}>
            {items.map(hw => {
              const col = homeworkColourFor(hw.subject)
              const teacherName = hw.createdBy
                ? (typeof hw.createdBy === 'object'
                    ? ((hw.createdBy.firstName || '') + ' ' + (hw.createdBy.lastName || '')).trim() || 'Teacher'
                    : 'Teacher')
                : 'Teacher'
              const st = hw.computedStatus
              const badge =
                st === 'graded'    ? { label:'GRADED',    bg:'var(--g50)',  fg:'var(--g700)' } :
                st === 'submitted' ? { label:'SUBMITTED', bg:'#DBEAFE',     fg:'#1E40AF'     } :
                st === 'overdue'   ? { label:'OVERDUE',   bg:'#FEE2E2',     fg:'#991B1B'     } :
                st === 'locked'    ? { label:'LOCKED',    bg:'#F1F5F9',     fg:'#64748B'     } :
                                     { label:'DUE',       bg:'#FEF3C7',     fg:'#92400E'     }
              const graded = st === 'graded' && hw.mySubmission
              const pct = graded && hw.mySubmission.totalPossible
                ? Math.round((hw.mySubmission.totalAwarded / hw.mySubmission.totalPossible) * 100)
                : null
              return (
                <ModuleCard
                  key={hw._id}
                  accent={col}
                  dimmed={hw.locked}
                  onClick={hw.locked ? undefined : () => openHomework(hw)}
                  badges={[badge]}
                  title={hw.title}
                  eyebrow={hw.subject}
                  tiles={[
                    ['Questions', hw.questionCount || 0],
                    ['Due', hw.dueAt ? formatHomeworkDate(hw.dueAt) : '\u2014'],
                    ['Marks', hw.totalMarks || (hw.mySubmission?.totalPossible ?? '\u2014')],
                    ['Status', badge.label.charAt(0) + badge.label.slice(1).toLowerCase()],
                  ]}
                  meta={teacherName}
                  note={graded ? (
                    <div style={{
                      background: pct >= 60 ? 'var(--g50)' : 'var(--a50)',
                      border: `1px solid ${pct >= 60 ? 'var(--g100)' : 'var(--a100)'}`,
                      borderRadius:'var(--rsm)', padding:'8px 12px', marginTop:12, fontSize:12.5,
                      color: pct >= 60 ? 'var(--g700)' : 'var(--a600)',
                    }}>
                      Result: <strong>{hw.mySubmission.totalAwarded || 0}/{hw.mySubmission.totalPossible || 0}</strong>
                      {pct !== null ? ` (${pct}%)` : ''}
                    </div>
                  ) : null}
                  footer={
                    hw.locked ? (
                      <div style={{ fontSize:12, color:'var(--s500)', textAlign:'center' }}>
                        Opens {formatHomeworkDate(hw.releaseAt)}
                      </div>
                    ) : graded ? (
                      <div style={{ fontSize:12, color:'var(--s500)', textAlign:'center', fontWeight:600 }}>
                        Marked by your teacher
                      </div>
                    ) : st === 'submitted' ? (
                      <div style={{ fontSize:12, color:'var(--s500)', textAlign:'center', fontWeight:600 }}>
                        Awaiting marking
                      </div>
                    ) : (
                      <button className="btn btn-p"
                        style={{ width:'100%', justifyContent:'center', background:col, borderColor:col }}
                        onClick={(e) => { e.stopPropagation(); openHomework(hw) }}>
                        {st === 'overdue' ? 'Submit now' : 'Start homework'}
                      </button>
                    )
                  }
                />
              )
            })}
            </div>
          </div>
        )
      })}

      {/* HOMEWORK DETAIL / SUBMIT MODAL */}
      {selected && (
        <div onClick={closeHomework} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)', zIndex: 200,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: 20, overflowY: 'auto',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--white)', borderRadius: 'var(--rxl)',
            maxWidth: 760, width: '100%', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,.3)', marginTop: 40, marginBottom: 40,
          }}>
            {/* Header */}
            <div style={{
              padding: '22px 28px',
              background: 'linear-gradient(135deg, ' + homeworkColourFor(selected.subject) + ' 0%, ' + homeworkColourFor(selected.subject) + 'DD 100%)',
              color: '#fff',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .8, marginBottom: 4 }}>
                {selected.subject} · {selected.curriculum} · {selected.grade}
              </div>
              <h3 className="serif" style={{ fontSize: 22, margin: 0, lineHeight: 1.2 }}>{selected.title}</h3>
              <div style={{ fontSize: 13, opacity: .9, marginTop: 6 }}>
                {selected.dueAt ? 'Due ' + formatHomeworkDate(selected.dueAt) + ' · ' : ''}
                {selected.questions?.length || 0} question{selected.questions?.length === 1 ? '' : 's'} · {selected.totalMarks} marks
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 28px', maxHeight: '65vh', overflowY: 'auto' }}>
              {selected.description && (
                <div style={{ marginBottom: 18 }}>
                  <div className="sec-tag" style={{ marginBottom: 6 }}>Instructions</div>
                  <div style={{ fontSize: 14, color: 'var(--s700)', lineHeight: 1.65 }}>{selected.description}</div>
                </div>
              )}

              {/* If already submitted/graded — show grade view */}
              {submission && (submission.status === 'submitted' || submission.status === 'graded' || submission.status === 'released') && (
                <div style={{
                  background: submission.status === 'released' || submission.status === 'graded' ? 'var(--g50)' : 'var(--b50)',
                  border: '1px solid ' + (submission.status === 'released' || submission.status === 'graded' ? 'var(--g100)' : 'var(--b100)'),
                  borderRadius: 'var(--rmd)', padding: 18, marginBottom: 18,
                }}>
                  {(submission.status === 'graded' || submission.status === 'released') && submission.totalPossible > 0 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: '50%',
                          background: 'var(--g500)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 16, fontWeight: 700,
                        }}>
                          {Math.round(((submission.totalAwarded || 0) / submission.totalPossible) * 100)}%
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--g700)' }}>
                            {submission.totalAwarded || 0} / {submission.totalPossible} marks
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--s500)' }}>
                            {submission.gradedAt && 'Graded ' + new Date(submission.gradedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            {submission.isLate && ' · submitted late'}
                          </div>
                        </div>
                      </div>
                      {submission.overallFeedback && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 4 }}>Teacher Feedback</div>
                          <div style={{ fontSize: 13.5, color: 'var(--s700)', lineHeight: 1.65, fontStyle: 'italic' }}>"{submission.overallFeedback}"</div>
                        </div>
                      )}
                    </>
                  )}
                  {submission.status === 'submitted' && (
                    <>
                      <div style={{ fontWeight: 700, color: 'var(--b700)', marginBottom: 4 }}>
                        Submitted · awaiting your teacher to grade
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--s500)' }}>
                        Submitted {submission.submittedAt && new Date(submission.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {submission.isLate && ' · late'}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Render each question */}
              {(selected.questions || []).map((q, idx) => {
                const a = answers[idx] || {}
                const isReadOnly = submission && (submission.status === 'submitted' || submission.status === 'graded' || submission.status === 'released')
                return (
                  <div key={idx} style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--rmd)',
                    padding: 16,
                    marginBottom: 12,
                    background: idx % 2 === 0 ? '#FFF' : 'var(--bg)',
                  }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
                      <span className="mono" style={{
                        fontSize: 11, fontWeight: 700, color: '#7D1025',
                        background: '#FBE8E8', padding: '2px 8px', borderRadius: 4,
                        flexShrink: 0,
                      }}>Q{idx + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s900)', lineHeight: 1.5 }}>{q.questionText}</div>
                        <div style={{ fontSize: 11, color: 'var(--s500)', marginTop: 2 }}>
                          {hwTypeLabel[q.type]} · {q.marks} mark{q.marks === 1 ? '' : 's'}
                        </div>
                      </div>
                    </div>

                    {/* Question's own attachments (images from teacher) */}
                    {q.attachments && q.attachments.length > 0 && (
                      <div style={{ marginBottom: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {q.attachments.map((att, i) => (
                          <a key={i} href={att.url} target="_blank" rel="noopener noreferrer">
                            {att.mimeType?.startsWith('image/')
                              ? <img src={att.url} alt="" style={{ maxWidth: 200, maxHeight: 140, borderRadius: 4, border: '1px solid var(--border)' }}/>
                              : <span style={{ fontSize: 12, padding: '4px 10px', background: 'var(--bg)', borderRadius: 4 }}>{att.filename || 'File'}</span>}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* MCQ answer */}
                    {q.type === 'mcq' && (
                      <div>
                        {q.options.map((opt, optIdx) => {
                          const isSelected = a.answer === optIdx
                          const isCorrect = isReadOnly && a.marksAwarded > 0 && isSelected
                          const isWrong = isReadOnly && a.marksAwarded === 0 && isSelected
                          return (
                            <label key={optIdx} style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 14px', marginBottom: 6,
                              border: '1.5px solid ' + (isCorrect ? '#22C55E' : isWrong ? '#DC2626' : isSelected ? homeworkColourFor(selected.subject) : 'var(--border)'),
                              borderRadius: 'var(--rsm)',
                              cursor: isReadOnly ? 'default' : 'pointer',
                              background: isCorrect ? '#DCFCE7' : isWrong ? '#FEE2E2' : isSelected ? homeworkColourFor(selected.subject) + '10' : 'var(--bg)',
                              opacity: isReadOnly && !isSelected ? 0.6 : 1,
                            }}>
                              <input
                                type="radio"
                                name={'q-' + idx}
                                checked={isSelected}
                                disabled={isReadOnly}
                                onChange={() => setAnswer(idx, optIdx)}
                              />
                              <span style={{ fontSize: 13.5 }}>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            </label>
                          )
                        })}
                        {isReadOnly && a.marksAwarded !== null && a.marksAwarded !== undefined && (
                          <div style={{ fontSize: 12, color: 'var(--s600)', marginTop: 6 }}>
                            Awarded: <strong>{a.marksAwarded}</strong> / {q.marks}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Short / Long text answer (paste blocked) */}
                    {(q.type === 'short' || q.type === 'long') && (
                      <div>
                        {!isReadOnly && (
                          <div style={{ fontSize: 11.5, color: 'var(--s500)', fontStyle: 'italic', marginBottom: 6, background: 'var(--a50)', borderLeft: '3px solid var(--a500, #F59E0B)', padding: '6px 10px', borderRadius: 4 }}>
                            Type your answer in your own words. Pasting is disabled.
                          </div>
                        )}
                        <textarea
                          value={a.answer || ''}
                          onChange={e => setAnswer(idx, e.target.value)}
                          onPaste={e => { e.preventDefault(); if (!isReadOnly) showPasteWarning(idx) }}
                          onCopy={e => e.preventDefault()}
                          onCut={e => e.preventDefault()}
                          onContextMenu={e => e.preventDefault()}
                          disabled={isReadOnly}
                          rows={q.type === 'long' ? 8 : 3}
                          placeholder={isReadOnly ? '' : 'Start typing your response...'}
                          style={{
                            width: '100%', padding: 12,
                            border: '1.5px solid ' + (pasteWarning[idx] ? 'var(--r500)' : 'var(--border)'),
                            borderRadius: 'var(--rsm)', fontSize: 14, fontFamily: 'inherit',
                            lineHeight: 1.6, outline: 'none', resize: 'vertical',
                            background: isReadOnly ? 'var(--bg)' : '#FFF',
                          }}
                        />
                        {pasteWarning[idx] && (
                          <div style={{ fontSize: 11, color: 'var(--r500)', marginTop: 4, fontWeight: 600 }}>
                            Paste blocked. Please type your answer.
                          </div>
                        )}
                        {!isReadOnly && a.answer && (
                          <div style={{ fontSize: 11.5, color: 'var(--s400)', marginTop: 4 }}>
                            {String(a.answer).length} characters · {String(a.answer).trim().split(/\s+/).filter(Boolean).length} words
                          </div>
                        )}
                        {isReadOnly && a.feedback && (
                          <div style={{ marginTop: 8, padding: 10, background: '#FBF6E3', borderLeft: '3px solid #C9A030', borderRadius: 4, fontSize: 12.5, color: 'var(--s700)' }}>
                            <strong>Feedback:</strong> {a.feedback}
                          </div>
                        )}
                        {isReadOnly && a.marksAwarded !== null && a.marksAwarded !== undefined && (
                          <div style={{ fontSize: 12, color: 'var(--s600)', marginTop: 6 }}>
                            Awarded: <strong>{a.marksAwarded}</strong> / {q.marks}
                          </div>
                        )}
                      </div>
                    )}

                    {/* File upload answer */}
                    {q.type === 'upload' && (
                      <div>
                        {!a.attachment && !isReadOnly && (
                          <label style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: 10, padding: '20px 16px',
                            border: '2px dashed var(--border)', borderRadius: 'var(--rmd)',
                            background: 'var(--bg)', cursor: uploadingIdx === idx ? 'wait' : 'pointer',
                          }}>
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--s500)" strokeWidth="2" strokeLinecap="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="17 8 12 3 7 8"/>
                              <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            <div style={{ fontSize: 13, color: 'var(--s700)', fontWeight: 600 }}>
                              {uploadingIdx === idx ? 'Uploading...' : 'Click to upload your answer (image/PDF, max 5 MB)'}
                            </div>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={e => { if (e.target.files?.[0]) uploadAnswerFile(idx, e.target.files[0]); e.target.value = '' }}
                              disabled={uploadingIdx === idx}
                              style={{ display: 'none' }}
                            />
                          </label>
                        )}
                        {a.attachment && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, border: '1.5px solid var(--g500)', borderRadius: 'var(--rmd)', background: 'var(--g50)' }}>
                            {a.attachment.mimeType?.startsWith('image/')
                              ? <img src={a.attachment.url} alt="" style={{ maxWidth: 100, maxHeight: 80, borderRadius: 4 }}/>
                              : <span style={{ fontSize: 13, fontWeight: 600 }}>{a.attachment.filename || 'File'}</span>}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, color: 'var(--g700)', fontWeight: 600 }}>{a.attachment.filename}</div>
                              <a href={a.attachment.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--s500)' }}>View</a>
                            </div>
                            {!isReadOnly && (
                              <button onClick={() => setAnswerAttachment(idx, null)} style={{ background: 'transparent', border: 'none', color: 'var(--s500)', cursor: 'pointer', fontSize: 16, padding: 4 }}>×</button>
                            )}
                          </div>
                        )}
                        {isReadOnly && a.marksAwarded !== null && a.marksAwarded !== undefined && (
                          <div style={{ fontSize: 12, color: 'var(--s600)', marginTop: 6 }}>
                            Awarded: <strong>{a.marksAwarded}</strong> / {q.marks}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Drawing — full canvas */}
                    {q.type === 'drawing' && (
                      <div>
                        {/* When graded and teacher annotated, show that instead of canvas */}
                        {isReadOnly && a.teacherAnnotation ? (
                          <div>
                            <div style={{
                              fontSize:10.5, fontWeight:700, color:'#7D1025',
                              letterSpacing:'.08em', textTransform:'uppercase', marginBottom:6,
                              display:'flex', alignItems:'center', gap:6,
                            }}>
                              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Marked by your teacher
                            </div>
                            <a href={a.teacherAnnotation} target="_blank" rel="noopener noreferrer">
                              <img
                                src={a.teacherAnnotation}
                                alt="Marked by teacher"
                                style={{
                                  maxWidth:'100%', maxHeight:480,
                                  border:'2px solid #C9A030', borderRadius:8,
                                  background:'#fff', display:'block',
                                }}
                              />
                            </a>
                            {a.attachment?.url && (
                              <div style={{ marginTop:6 }}>
                                <a href={a.attachment.url} target="_blank" rel="noopener noreferrer"
                                  style={{ fontSize:11.5, color:'#6B6B6B', textDecoration:'underline' }}>
                                  View your original (unmarked)
                                </a>
                              </div>
                            )}
                          </div>
                        ) : a.attachment && a.attachment.url ? (
                          // Either editing OR graded without annotation — show original
                          <div>
                            <DrawingCanvas
                              value={a.attachment.url}
                              readOnly={isReadOnly}
                            />
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => setAnswerAttachment(idx, null)}
                                style={{
                                  background: 'transparent', border: '1px solid var(--border)',
                                  color: 'var(--s600)', padding: '6px 14px',
                                  borderRadius: 6, cursor: 'pointer',
                                  fontSize: 12, fontWeight: 700, marginTop: 8,
                                }}
                              >Redo Drawing</button>
                            )}
                          </div>
                        ) : !isReadOnly ? (
                          <DrawingCanvas
                            onSave={async (dataURL) => {
                              // Convert dataURL to blob, upload to Cloudinary
                              setUploadingIdx(idx)
                              try {
                                const blob = await (await fetch(dataURL)).blob()
                                const file = new File([blob], 'drawing-' + Date.now() + '.png', { type: 'image/png' })
                                const fd = new FormData()
                                fd.append('file', file)
                                const { data } = await api.post('/questions/upload', fd, {
                                  headers: { 'Content-Type': 'multipart/form-data' },
                                })
                                if (data.success && data.attachment) {
                                  setAnswerAttachment(idx, data.attachment)
                                  toast?.ok?.('Drawing saved')
                                } else {
                                  toast?.error?.(data.message || 'Upload failed')
                                }
                              } catch (e) {
                                toast?.error?.('Save failed: ' + e.message)
                              } finally {
                                setUploadingIdx(null)
                              }
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: 12, color: 'var(--s500)', fontStyle: 'italic' }}>No drawing submitted.</div>
                        )}
                        {uploadingIdx === idx && (
                          <div style={{ fontSize: 12, color: 'var(--s500)', marginTop: 6 }}>Uploading drawing...</div>
                        )}
                        {isReadOnly && a.marksAwarded !== null && a.marksAwarded !== undefined && (
                          <div style={{ fontSize: 12, color: 'var(--s600)', marginTop: 6 }}>
                            Awarded: <strong>{a.marksAwarded}</strong> / {q.marks}
                          </div>
                        )}
                      </div>
                    )}
                   {/* Handwriting — full canvas */}
                    {q.type === 'handwriting' && (
                      <div>
                        {a.attachment && a.attachment.url ? (
                          <div>
                            <HandwritingCanvas
                              value={a.attachment.url}
                              readOnly={isReadOnly}
                            />
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => setAnswerAttachment(idx, null)}
                                style={{
                                  background: 'transparent', border: '1px solid var(--border)',
                                  color: 'var(--s600)', padding: '6px 14px',
                                  borderRadius: 6, cursor: 'pointer',
                                  fontSize: 12, fontWeight: 700, marginTop: 8,
                                }}
                              >Redo Handwriting</button>
                            )}
                          </div>
                        ) : !isReadOnly ? (
                          <HandwritingCanvas
                            onSave={async (dataURL) => {
                              setUploadingIdx(idx)
                              try {
                                const blob = await (await fetch(dataURL)).blob()
                                const file = new File([blob], 'handwriting-' + Date.now() + '.png', { type: 'image/png' })
                                const fd = new FormData()
                                fd.append('file', file)
                                const { data } = await api.post('/questions/upload', fd, {
                                  headers: { 'Content-Type': 'multipart/form-data' },
                                })
                                if (data.success && data.attachment) {
                                  setAnswerAttachment(idx, data.attachment)
                                  toast?.ok?.('Handwriting saved')
                                } else {
                                  toast?.error?.(data.message || 'Upload failed')
                                }
                              } catch (e) {
                                toast?.error?.('Save failed: ' + e.message)
                              } finally {
                                setUploadingIdx(null)
                              }
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: 12, color: 'var(--s500)', fontStyle: 'italic' }}>No handwriting submitted.</div>
                        )}
                        {uploadingIdx === idx && (
                          <div style={{ fontSize: 12, color: 'var(--s500)', marginTop: 6 }}>Uploading handwriting...</div>
                        )}
                        {isReadOnly && a.marksAwarded !== null && a.marksAwarded !== undefined && (
                          <div style={{ fontSize: 12, color: 'var(--s600)', marginTop: 6 }}>
                            Awarded: <strong>{a.marksAwarded}</strong> / {q.marks}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={closeHomework} className="btn btn-s">Close</button>
              {(!submission || submission.status === 'in_progress') && (
                <button
                  onClick={submitHomework}
                  disabled={submittingNow}
                  className="btn btn-p"
                  style={{
                    background: homeworkColourFor(selected.subject),
                    borderColor: homeworkColourFor(selected.subject),
                  }}
                >
                  {submittingNow ? 'Submitting...' : 'Submit Homework'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
 
 
// ═══════════════════════════════════════════════════════════
// PROFILE TAB — student account & preferences
// ═══════════════════════════════════════════════════════════
const PROFILE_PREFS_KEY    = 'sm_profile_prefs'
const PROFILE_AVATAR_KEY   = 'sm_profile_avatar'
const PROFILE_BIO_KEY      = 'sm_profile_bio'
const PROFILE_DISPLAY_KEY  = 'sm_profile_display_name'
 
const loadProfilePrefs = () => {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_PREFS_KEY) || 'null') || {
      notifyEmail: true,
      notifyDailyDigest: true,
      notifyHomework: true,
      notifyExamResults: true,
      notifyLiveClass: true,
      shareProgressWithParent: true,
      preferredContactMethod: 'email',
      timezone: 'Africa/Nairobi',
      preferredLanguage: 'en',
    }
  } catch {
    return null
  }
}
const saveProfilePrefs = (p) => {
  try { localStorage.setItem(PROFILE_PREFS_KEY, JSON.stringify(p)) } catch {}
}
 
// Generate avatar initials background colour from name (deterministic)
const initialsColor = (name) => {
  const colors = ['#8B1A2E', '#1E3A8A', '#166534', '#7C2D12', '#6B21A8', '#92400E', '#0F766E', '#7E22CE']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i)
  return colors[Math.abs(hash) % colors.length]
}
 
// ═══════════════════════════════════════════════════════════
// STUDENT COMMUNICATION TAB — email teachers + admin only
// ═══════════════════════════════════════════════════════════
// A student may email the teachers allocated to them and the
// administration — nobody else. No parents, no other students,
// no external addresses. Attachments allowed (e.g. homework).
// ═══════════════════════════════════════════════════════════

const STUDENT_EMAIL_TEMPLATES = {
  question: {
    label: 'Ask a Question',
    subject: 'Question about my lesson',
    body: 'Hello,\n\nI have a question about [subject / topic]:\n\n[Write your question clearly.]\n\nThank you for your help.',
  },
  homework: {
    label: 'Submit / Ask About Homework',
    subject: 'Homework',
    body: 'Hello,\n\nThis is regarding the homework for [subject].\n\n[Explain — e.g. "I have attached my completed work" or "I need help with question 3".]\n\nThank you.',
  },
  absence: {
    label: 'Explain an Absence',
    subject: 'Absence from class',
    body: 'Hello,\n\nI was / will be absent from [class] on [date] because [reason].\n\nPlease let me know what I missed and how to catch up.\n\nThank you.',
  },
  custom: {
    label: 'Custom Message',
    subject: '',
    body: '',
  },
}

function StudentCommunicationTab({ user, toast }) {
  const [view, setView] = useState('compose')   // compose | history

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--s900)', margin: 0 }}>
          Communication
        </h1>
        <div style={{ fontSize: 13, color: 'var(--s500)', marginTop: 2 }}>
          Email your teachers and the school administration.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          { id: 'compose', label: 'Compose' },
          { id: 'history', label: 'History' },
        ].map(t => (
          <button key={t.id} onClick={() => setView(t.id)}
            style={{
              padding: '8px 18px', borderRadius: 99,
              border: `1.5px solid ${view === t.id ? 'var(--b700)' : 'var(--border)'}`,
              background: view === t.id ? 'var(--b700)' : '#fff',
              color: view === t.id ? '#fff' : 'var(--b700)',
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {view === 'compose'
        ? <StudentComposeView user={user} toast={toast} />
        : <StudentCommsHistory toast={toast} />}
    </div>
  )
}

function StudentComposeView({ user, toast }) {
  const [teachers, setTeachers] = useState([])
  const [admins, setAdmins]     = useState([])
  const [loading, setLoading]   = useState(true)

  const [picked, setPicked] = useState({})   // email -> { email, name }

  const [kind, setKind]       = useState('question')
  const [subject, setSubject] = useState(STUDENT_EMAIL_TEMPLATES.question.subject)
  const [body, setBody]       = useState(STUDENT_EMAIL_TEMPLATES.question.body)

  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading]     = useState(false)

  const [sending, setSending] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [result, setResult]   = useState(null)

  useEffect(() => {
    api.get('/communication/student/recipients')
      .then(r => {
        setTeachers(r.data.data?.teachers || [])
        setAdmins(r.data.data?.admins || [])
      })
      .catch(() => toast?.error?.('Failed to load recipients.'))
      .finally(() => setLoading(false))
  }, [toast])

  const applyTemplate = (k) => {
    setKind(k)
    setSubject(STUDENT_EMAIL_TEMPLATES[k].subject)
    setBody(STUDENT_EMAIL_TEMPLATES[k].body)
    setConfirm(false)
  }

  const toggle = (email, name) => {
    if (!email) return
    setPicked(prev => {
      const next = { ...prev }
      if (next[email]) delete next[email]
      else next[email] = { email, name: name || '' }
      return next
    })
    setConfirm(false)
  }

  const pickedList = Object.values(picked)

  const uploadFile = async (file) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast?.error?.('File exceeds 10 MB.'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/communication/upload-attachment', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data?.success) {
        setAttachments(a => [...a, data.data])
        toast?.ok?.('Attached ' + data.data.name)
      } else {
        toast?.error?.(data?.message || 'Upload failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const send = async () => {
    if (!subject.trim()) { toast?.error?.('Subject is required.'); return }
    if (!body.trim())    { toast?.error?.('Message body is required.'); return }
    if (pickedList.length === 0) { toast?.error?.('Pick at least one recipient.'); return }

    setSending(true)
    try {
      const { data } = await api.post('/communication/student/send', {
        subject: subject.trim(),
        body,
        recipientEmails: pickedList,
        attachments,
        audience: STUDENT_EMAIL_TEMPLATES[kind].label,
      })
      if (data?.success) {
        setResult(data.data)
        toast?.ok?.(data.message || 'Sent.')
        setConfirm(false)
      } else {
        toast?.error?.(data?.message || 'Send failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Send failed.')
    } finally {
      setSending(false)
    }
  }

  const resetAll = () => {
    setPicked({}); setKind('question')
    setSubject(STUDENT_EMAIL_TEMPLATES.question.subject)
    setBody(STUDENT_EMAIL_TEMPLATES.question.body)
    setAttachments([]); setConfirm(false); setResult(null)
  }

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', borderRadius: 8,
    border: '1.5px solid var(--border)', fontSize: 13, fontFamily: 'inherit',
  }
  const lbl = {
    display: 'block', fontSize: 10.5, fontWeight: 700,
    letterSpacing: '.06em', textTransform: 'uppercase',
    color: 'var(--b700)', marginBottom: 5,
  }
  const card = {
    background: '#fff', border: '1px solid var(--border)',
    borderRadius: 'var(--rlg)', padding: 20,
  }

  if (result) {
    return (
      <div style={{ ...card, textAlign: 'center', padding: 28 }}>
        <div style={{
          width: 54, height: 54, borderRadius: '50%',
          background: 'var(--g50)', color: 'var(--g600)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
        }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--s900)' }}>Email sent</div>
        <div style={{ fontSize: 13, color: 'var(--s500)', marginTop: 6 }}>
          {result.sentCount} delivered{result.failedCount > 0 ? ` · ${result.failedCount} failed` : ''}
        </div>
        <button onClick={resetAll}
          style={{
            marginTop: 18, background: 'var(--b700)', color: '#fff',
            border: 'none', padding: '10px 24px', borderRadius: 8,
            cursor: 'pointer', fontSize: 13, fontWeight: 700,
          }}>
          New Message
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 320px)', gap: 14 }}>
      {/* compose */}
      <div style={card}>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Template</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(STUDENT_EMAIL_TEMPLATES).map(([k, t]) => (
              <button key={k} onClick={() => applyTemplate(k)}
                style={{
                  background: kind === k ? 'var(--b700)' : '#fff',
                  color: kind === k ? '#fff' : 'var(--b700)',
                  border: `1.5px solid ${kind === k ? 'var(--b700)' : 'var(--border)'}`,
                  padding: '6px 12px', borderRadius: 99,
                  cursor: 'pointer', fontSize: 11.5, fontWeight: 700,
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Subject</label>
          <input value={subject} onChange={e => { setSubject(e.target.value); setConfirm(false) }}
            placeholder="Email subject" style={inp}/>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Message</label>
          <textarea value={body} onChange={e => { setBody(e.target.value); setConfirm(false) }}
            rows={10} placeholder="Write your message."
            style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}/>
        </div>

        {/* Attachments */}
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Attachments</label>
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
              {attachments.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', background: 'var(--bg)',
                  border: '1px solid var(--border)', borderRadius: 6, fontSize: 12,
                }}>
                  <span style={{ flex: 1, color: 'var(--s900)' }}>{a.name}</span>
                  <button onClick={() => setAttachments(list => list.filter((_, idx) => idx !== i))}
                    style={{ background: 'transparent', border: 'none', color: 'var(--r600)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          <label style={{
            display: 'inline-block',
            background: '#fff', color: 'var(--b700)',
            border: '1.5px solid var(--b700)',
            padding: '7px 14px', borderRadius: 8,
            cursor: uploading ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700,
          }}>
            <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ display: 'none' }}
              onChange={e => { uploadFile(e.target.files?.[0]); e.target.value = '' }}/>
            {uploading ? 'Uploading...' : '+ Attach a File (e.g. homework, max 10 MB)'}
          </label>
        </div>

        {/* Send */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
          {!confirm ? (
            <button onClick={() => {
              if (!subject.trim() || !body.trim()) { toast?.error?.('Subject and message are required.'); return }
              if (pickedList.length === 0) { toast?.error?.('Pick at least one recipient.'); return }
              setConfirm(true)
            }}
              style={{
                background: 'var(--b700)', color: '#fff', border: 'none',
                padding: '10px 22px', borderRadius: 8,
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}>
              Review &amp; Send
            </button>
          ) : (
            <>
              <span style={{ fontSize: 12, color: 'var(--s500)' }}>
                Send to {pickedList.length} recipient{pickedList.length === 1 ? '' : 's'}?
              </span>
              <button onClick={() => setConfirm(false)} disabled={sending}
                style={{
                  background: '#fff', color: 'var(--s500)', border: '1.5px solid var(--border)',
                  padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                }}>
                Cancel
              </button>
              <button onClick={send} disabled={sending}
                style={{
                  background: sending ? '#9CA3AF' : 'var(--g600)', color: '#fff', border: 'none',
                  padding: '10px 22px', borderRadius: 8,
                  cursor: sending ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700,
                }}>
                {sending ? 'Sending...' : 'Confirm Send'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* recipients */}
      <div style={{ ...card, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--b700)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Recipients ({pickedList.length})
        </div>

        {loading ? (
          <div style={{ padding: 14, fontSize: 12, color: 'var(--s500)', textAlign: 'center' }}>Loading...</div>
        ) : (
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--s500)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              My Teachers
            </div>
            {teachers.length === 0 ? (
              <div style={{ fontSize: 11.5, color: 'var(--s500)', padding: '4px 0 10px' }}>
                No teachers allocated to you yet.
              </div>
            ) : teachers.map(t => (
              <StudentRecipRow key={t._id}
                label={t.name}
                sub={t.subjects && t.subjects.length ? t.subjects.join(', ') : 'Teacher'}
                on={!!picked[t.email]}
                onClick={() => toggle(t.email, t.name)}
              />
            ))}

            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--s500)', letterSpacing: '.08em', textTransform: 'uppercase', margin: '10px 0 6px' }}>
              Administration
            </div>
            {admins.length === 0 ? (
              <div style={{ fontSize: 11.5, color: 'var(--s500)' }}>No admin contacts.</div>
            ) : admins.map(a => (
              <StudentRecipRow key={a._id}
                label={a.name} sub="Admin"
                on={!!picked[a.email]}
                onClick={() => toggle(a.email, a.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StudentRecipRow({ label, sub, on, onClick }) {
  return (
    <div onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 7px', cursor: 'pointer',
        background: on ? 'var(--b50)' : 'transparent',
        borderRadius: 5, marginBottom: 2,
      }}>
      <div style={{
        width: 15, height: 15, borderRadius: 3, flexShrink: 0,
        border: `1.5px solid ${on ? 'var(--b700)' : 'var(--border)'}`,
        background: on ? 'var(--b700)' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {on && (
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </div>
        <div style={{ fontSize: 10, color: 'var(--s500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {sub}
        </div>
      </div>
    </div>
  )
}

function StudentCommsHistory({ toast }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/communication/student/history')
      .then(r => setHistory(r.data.data?.history || []))
      .catch(() => toast?.error?.('Failed to load history.'))
      .finally(() => setLoading(false))
  }, [toast])

  const card = {
    background: '#fff', border: '1px solid var(--border)',
    borderRadius: 'var(--rlg)', padding: 14,
  }

  if (loading) {
    return <div style={{ ...card, padding: 40, textAlign: 'center', color: 'var(--s500)' }}>Loading history...</div>
  }
  if (history.length === 0) {
    return <div style={{ ...card, padding: 40, textAlign: 'center', color: 'var(--s500)' }}>No messages sent yet.</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {history.map(c => (
        <div key={c._id} style={card}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--s900)' }}>{c.subject}</div>
              <div style={{ fontSize: 11.5, color: 'var(--s500)', marginTop: 2 }}>
                {c.audience} · {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                {Array.isArray(c.attachments) && c.attachments.length > 0 && ` · ${c.attachments.length} attachment${c.attachments.length === 1 ? '' : 's'}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{
                fontSize: 10.5, fontWeight: 700,
                background: 'var(--g50)', color: 'var(--g600)',
                padding: '3px 9px', borderRadius: 99,
              }}>
                {c.sentCount} sent
              </span>
              {c.failedCount > 0 && (
                <span style={{
                  fontSize: 10.5, fontWeight: 700,
                  background: 'var(--r50)', color: 'var(--r600)',
                  padding: '3px 9px', borderRadius: 99,
                }}>
                  {c.failedCount} failed
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
function ProfileTab({ user, toast }) {
  // Initialise from the user prop. The mount effect below refetches
  // from /api/student-profile/me to pick up any recent changes.
  const [section, setSection] = useState('account')
  const [displayName, setDisplayName] = useState(`${user?.firstName || ''} ${user?.lastName || ''}`.trim())
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [bio, setBio] = useState(user?.bio || localStorage.getItem(PROFILE_BIO_KEY) || '')
  const [avatar, setAvatar] = useState(user?.avatar || localStorage.getItem(PROFILE_AVATAR_KEY) || null)
  const [prefs, setPrefs] = useState(() => loadProfilePrefs())
  const [saving, setSaving] = useState(false)

  // Refetch on mount
  useEffect(() => {
    let cancelled = false
    api.get('/student-profile/me')
      .then(res => {
        if (cancelled) return
        const p = res.data?.data?.profile
        if (!p) return
        setFirstName(p.firstName || '')
        setLastName(p.lastName || '')
        setDisplayName(`${p.firstName || ''} ${p.lastName || ''}`.trim())
        setPhone(p.phone || '')
        if (p.bio !== undefined) setBio(p.bio || '')
        if (p.avatar !== undefined) setAvatar(p.avatar || null)
      })
      .catch(() => { /* keep what we already have */ })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Password change state
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [pwdSubmitting, setPwdSubmitting] = useState(false)

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
 
  const initials = (displayName || 'S').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'S'
  const avatarBg = initialsColor(displayName || 'Student')
 
  // Save real DB profile via PATCH /student-profile/me.
  // Bio + avatar are also mirrored to localStorage for offline
  // first-paint of the avatar.
  const saveAccountInfo = async () => {
    if (!firstName.trim()) {
      toast?.error?.('First name cannot be empty.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        avatar: avatar || '',
      }
      const { data } = await api.patch('/student-profile/me', payload)
      if (!data?.success) {
        toast?.error?.(data?.message || 'Server rejected the changes.')
        setSaving(false)
        return
      }
      // Mirror locally for fast load
      localStorage.setItem(PROFILE_DISPLAY_KEY, `${firstName} ${lastName}`.trim())
      localStorage.setItem(PROFILE_BIO_KEY, bio.trim())
      if (avatar) localStorage.setItem(PROFILE_AVATAR_KEY, avatar)
      else localStorage.removeItem(PROFILE_AVATAR_KEY)
      setDisplayName(`${firstName} ${lastName}`.trim())
      toast?.ok?.('Profile updated.')
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }
 
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1024 * 500) {
      toast?.error?.('Image too large. Max 500KB.')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast?.error?.('Please upload an image file.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setAvatar(ev.target.result)
    reader.readAsDataURL(file)
  }
 
  const removeAvatar = () => {
    setAvatar(null)
    localStorage.removeItem(PROFILE_AVATAR_KEY)
  }
 
  // Password change — uses backend if available, otherwise saves intent locally
  const changePassword = async () => {
    if (pwdSubmitting) return
 
    // Validation
    if (!currentPwd) { toast?.error?.('Enter your current password.'); return }
    if (!newPwd || newPwd.length < 8) { toast?.error?.('New password must be at least 8 characters.'); return }
    if (newPwd === currentPwd) { toast?.error?.('New password must be different from current.'); return }
    if (newPwd !== confirmPwd) { toast?.error?.('Passwords do not match.'); return }
 
    // Strength check
    const hasLower = /[a-z]/.test(newPwd)
    const hasUpper = /[A-Z]/.test(newPwd)
    const hasNumber = /\d/.test(newPwd)
    if (!hasLower || !hasUpper || !hasNumber) {
      toast?.error?.('Password must contain uppercase, lowercase, and a number.')
      return
    }
 
    setPwdSubmitting(true)

    try {
      const { data } = await api.post('/student-profile/change-password', {
        currentPassword: currentPwd,
        newPassword: newPwd,
      })
      if (data?.success) {
        toast?.ok?.('Password changed successfully.')
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
      } else {
        toast?.error?.(data?.message || 'Could not change password.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not change password.')
    } finally {
      setPwdSubmitting(false)
    }
  }
 
  // Delete account — soft-deletes the user via the backend.
  // After success, clears the auth token and reloads to login.
  const submitDeleteAccount = async () => {
    if (deleteSubmitting) return
    if (deleteConfirmation !== 'DELETE') {
      toast?.error?.('Type DELETE in uppercase to confirm.')
      return
    }
    if (!deletePassword) {
      toast?.error?.('Enter your password.')
      return
    }
    setDeleteSubmitting(true)
    try {
      const { data } = await api.post('/student-profile/delete-account', {
        password: deletePassword,
        confirmation: deleteConfirmation,
      })
      if (data?.success) {
        toast?.ok?.('Account deactivated. Logging out...')
        // Clear local auth + cached profile
        try {
          localStorage.removeItem('sm_token')
          localStorage.removeItem('sm_user')
          localStorage.removeItem(PROFILE_DISPLAY_KEY)
          localStorage.removeItem(PROFILE_BIO_KEY)
          localStorage.removeItem(PROFILE_AVATAR_KEY)
        } catch {}
        // Hard reload to clear in-memory React state and force re-auth
        setTimeout(() => { window.location.href = '/' }, 1500)
      } else {
        toast?.error?.(data?.message || 'Could not delete account.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not delete account.')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  const updatePref = (key, value) => {
    const newPrefs = { ...prefs, [key]: value }
    setPrefs(newPrefs)
    saveProfilePrefs(newPrefs)
  }
 
  // Section nav items
  const sections = [
    { id: 'account',        label: 'Account Info',     iconPath: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
    { id: 'security',       label: 'Password & Security', iconPath: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' },
    { id: 'notifications',  label: 'Notifications',    iconPath: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>' },
    { id: 'communication',  label: 'Communication',    iconPath: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
    { id: 'danger',         label: 'Account & Privacy', iconPath: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' },
  ]
 
  return (
    <div>
      {/* Hero */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
        color: '#fff',
      }}>
        <div style={{ padding: '28px 30px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Big avatar */}
          <div style={{
            width: 84, height: 84, borderRadius: '50%',
            background: avatar ? 'transparent' : avatarBg,
            border: '3px solid #F0CC5A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 30, fontWeight: 700,
            fontFamily: "'Instrument Serif', serif",
            flexShrink: 0,
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,.25)',
          }}>
            {avatar ? (
              <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : initials}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .75, marginBottom: 6 }}>
              Account Settings
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
              {displayName || 'My Profile'}
            </h2>
            <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>
              {user?.email || 'No email set'} · {user?.curriculum || 'IGCSE'} · {user?.grade || 'Year 10'}
            </div>
          </div>
        </div>
      </div>
 
      {/* Section nav */}
      <div style={{
        display: 'flex',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--rmd)',
        padding: 4,
        marginBottom: 18,
        gap: 2,
        flexWrap: 'wrap',
      }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              flex: 1, minWidth: 130,
              background: section === s.id ? 'var(--white)' : 'transparent',
              color: section === s.id ? '#8B1A2E' : 'var(--s500)',
              border: 'none',
              padding: '10px 14px',
              borderRadius: 'var(--rsm)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
              boxShadow: section === s.id ? '0 4px 16px rgba(10,8,6,.10)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all .15s',
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              dangerouslySetInnerHTML={{ __html: s.iconPath }}/>
            {s.label}
          </button>
        ))}
      </div>
 
      {/* SECTION: Account Info */}
      {section === 'account' && (
        <div className="card">
          <div className="ctitle" style={{ marginBottom: 18 }}>Personal Information</div>
 
          {/* Avatar uploader */}
          <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--s500)', marginBottom: 10 }}>Profile Picture</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: avatar ? 'transparent' : avatarBg,
                color: '#fff', fontSize: 26, fontWeight: 700,
                fontFamily: "'Instrument Serif', serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                border: '2px solid var(--border)',
              }}>
                {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : initials}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ display: 'inline-block', marginRight: 8, marginBottom: 4 }}>
                  <span className="btn btn-s btn-sm" style={{ cursor: 'pointer' }}>
                    {avatar ? 'Change Picture' : 'Upload Picture'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                </label>
                {avatar && (
                  <button
                    onClick={removeAvatar}
                    className="btn btn-d btn-sm"
                    style={{ marginLeft: 4 }}
                  >Remove</button>
                )}
                <div style={{ fontSize: 11.5, color: 'var(--s400)', marginTop: 6 }}>
                  PNG or JPG, square crop works best. Max 500KB.
                </div>
              </div>
            </div>
          </div>
 
          {/* Name */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="First name"
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
                  border: '1.5px solid var(--border)', borderRadius: 'var(--rmd)',
                  outline: 'none', background: 'var(--white)',
                }}
                onFocus={e => e.target.style.borderColor = '#8B1A2E'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Last name"
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
                  border: '1.5px solid var(--border)', borderRadius: 'var(--rmd)',
                  outline: 'none', background: 'var(--white)',
                }}
                onFocus={e => e.target.style.borderColor = '#8B1A2E'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
              Phone <span style={{ fontWeight: 400, color: 'var(--s400)' }}>(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+254 7XX XXX XXX"
              style={{
                width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
                border: '1.5px solid var(--border)', borderRadius: 'var(--rmd)',
                outline: 'none', background: 'var(--white)',
              }}
              onFocus={e => e.target.style.borderColor = '#8B1A2E'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
 
          {/* Email (read-only — managed by admin) */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || 'Not set'}
              disabled
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                fontFamily: 'inherit',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--rmd)',
                background: 'var(--bg)',
                color: 'var(--s500)',
                cursor: 'not-allowed',
              }}
            />
            <div style={{ fontSize: 11.5, color: 'var(--s400)', marginTop: 4 }}>
              Contact admin to change your email address.
            </div>
          </div>
 
          {/* Curriculum & Grade (read-only) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
                Curriculum
              </label>
              <input
                type="text"
                value={user?.curriculum || 'IGCSE'}
                disabled
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
                  border: '1.5px solid var(--border)', borderRadius: 'var(--rmd)',
                  background: 'var(--bg)', color: 'var(--s500)', cursor: 'not-allowed',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
                Grade / Year
              </label>
              <input
                type="text"
                value={user?.grade || 'Year 10'}
                disabled
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
                  border: '1.5px solid var(--border)', borderRadius: 'var(--rmd)',
                  background: 'var(--bg)', color: 'var(--s500)', cursor: 'not-allowed',
                }}
              />
            </div>
          </div>
 
          {/* Bio */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
              About Me <span style={{ fontWeight: 400, color: 'var(--s400)' }}>(optional)</span>
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value.slice(0, 300))}
              placeholder="Share a bit about yourself, your interests, or what you're aiming for..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                fontFamily: 'inherit',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--rmd)',
                outline: 'none',
                resize: 'vertical',
                background: 'var(--white)',
                lineHeight: 1.6,
              }}
              onFocus={e => e.target.style.borderColor = '#8B1A2E'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <div style={{ fontSize: 11.5, color: 'var(--s400)', marginTop: 4, textAlign: 'right' }}>
              {bio.length} / 300 characters
            </div>
          </div>
 
          <button onClick={saveAccountInfo} disabled={saving}
            className="btn btn-p"
            style={{ opacity: saving ? 0.5 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
 
      {/* SECTION: Password & Security */}
      {section === 'security' && (
        <div className="card">
          <div className="ctitle" style={{ marginBottom: 18 }}>Change Password</div>
 
          <div style={{
            background: 'var(--a50)', border: '1px solid var(--a100)',
            borderRadius: 'var(--rmd)', padding: 12, marginBottom: 18,
            fontSize: 12.5, color: 'var(--a700, #92400E)',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:1}}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              Choose a strong password. Use at least 8 characters with uppercase, lowercase, and a number. Never share your password with anyone - not even teachers or admin staff.
            </div>
          </div>
 
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
              Current Password
            </label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
              style={{
                width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
                border: '1.5px solid var(--border)', borderRadius: 'var(--rmd)',
                outline: 'none', background: 'var(--white)',
              }}
              onFocus={e => e.target.style.borderColor = '#8B1A2E'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
 
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
              New Password
            </label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              style={{
                width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
                border: '1.5px solid var(--border)', borderRadius: 'var(--rmd)',
                outline: 'none', background: 'var(--white)',
              }}
              onFocus={e => e.target.style.borderColor = '#8B1A2E'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            {newPwd && (
              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap', fontSize: 11 }}>
                {[
                  { check: newPwd.length >= 8, label: '8+ characters' },
                  { check: /[a-z]/.test(newPwd), label: 'lowercase' },
                  { check: /[A-Z]/.test(newPwd), label: 'UPPERCASE' },
                  { check: /\d/.test(newPwd), label: 'number' },
                ].map(req => (
                  <span key={req.label} style={{
                    padding: '2px 8px', borderRadius: 99,
                    background: req.check ? 'var(--g50)' : 'var(--s100)',
                    color: req.check ? 'var(--g600)' : 'var(--s500)',
                    fontWeight: 600,
                  }}>
                    {req.check ? '[x]' : '[ ]'} {req.label}
                  </span>
                ))}
              </div>
            )}
          </div>
 
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 6 }}>
              Confirm New Password
            </label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              placeholder="Type new password again"
              autoComplete="new-password"
              style={{
                width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
                border: `1.5px solid ${confirmPwd && newPwd !== confirmPwd ? 'var(--r500)' : 'var(--border)'}`,
                borderRadius: 'var(--rmd)', outline: 'none', background: 'var(--white)',
              }}
              onFocus={e => { if (newPwd === confirmPwd) e.target.style.borderColor = '#8B1A2E' }}
              onBlur={e => { if (!confirmPwd || newPwd === confirmPwd) e.target.style.borderColor = 'var(--border)' }}
            />
            {confirmPwd && newPwd !== confirmPwd && (
              <div style={{ fontSize: 11, color: 'var(--r500)', marginTop: 4, fontWeight: 600 }}>
                Passwords don't match
              </div>
            )}
          </div>
 
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, fontSize: 13, color: 'var(--s600)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showPwd}
              onChange={e => setShowPwd(e.target.checked)}
              style={{ accentColor: '#8B1A2E' }}
            />
            Show passwords
          </label>
 
          <button
            onClick={changePassword}
            disabled={pwdSubmitting}
            className="btn btn-p"
            style={{ opacity: pwdSubmitting ? .7 : 1 }}
          >
            {pwdSubmitting ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      )}
 
      {/* SECTION: Notifications */}
      {section === 'notifications' && (
        <div className="card">
          <div className="ctitle" style={{ marginBottom: 18 }}>Notification Preferences</div>
 
          {[
            { key: 'notifyEmail',          label: 'Email notifications',           desc: 'Receive important account emails.' },
            { key: 'notifyDailyDigest',    label: 'Daily study digest',            desc: 'Morning summary of your day\'s plan and what\'s due.' },
            { key: 'notifyHomework',       label: 'Homework reminders',            desc: 'Alert me 24 hours before any homework is due.' },
            { key: 'notifyExamResults',    label: 'Exam results',                  desc: 'Notify me when teachers release exam grades.' },
            { key: 'notifyLiveClass',      label: 'Live class reminders',          desc: '15 minutes before every scheduled live class.' },
          ].map(item => (
            <div key={item.key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '14px 0', borderBottom: '1px solid var(--border)', gap: 14, flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)' }}>{item.label}</div>
                <div style={{ fontSize: 12.5, color: 'var(--s500)', marginTop: 2 }}>{item.desc}</div>
              </div>
              {/* Toggle */}
              <button
                onClick={() => updatePref(item.key, !prefs[item.key])}
                style={{
                  width: 44, height: 24, padding: 2,
                  borderRadius: 99,
                  border: 'none',
                  background: prefs[item.key] ? '#8B1A2E' : 'var(--s300, #CBD5E1)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background .2s',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 2,
                  left: prefs[item.key] ? 22 : 2,
                  width: 20, height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left .2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,.2)',
                }}/>
              </button>
            </div>
          ))}
 
          <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 16, fontStyle: 'italic' }}>
            Changes save automatically.
          </div>
        </div>
      )}
 
      {/* SECTION: Communication */}
      {section === 'communication' && (
        <div className="card">
          <div className="ctitle" style={{ marginBottom: 18 }}>Communication & Privacy</div>
 
          {/* Share progress with parent */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            padding: '14px 0', borderBottom: '1px solid var(--border)', gap: 14, flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)' }}>Share progress with parent</div>
              <div style={{ fontSize: 12.5, color: 'var(--s500)', marginTop: 2 }}>
                Allow your parent or guardian to see your dashboard, mastery scores, and exam results.
              </div>
            </div>
            <button
              onClick={() => updatePref('shareProgressWithParent', !prefs.shareProgressWithParent)}
              style={{
                width: 44, height: 24, padding: 2, borderRadius: 99, border: 'none',
                background: prefs.shareProgressWithParent ? '#8B1A2E' : 'var(--s300, #CBD5E1)',
                cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 2,
                left: prefs.shareProgressWithParent ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff', transition: 'left .2s',
                boxShadow: '0 2px 4px rgba(0,0,0,.2)',
              }}/>
            </button>
          </div>
 
          {/* Preferred contact method */}
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)', marginBottom: 4 }}>
              Preferred contact method
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--s500)', marginBottom: 10 }}>
              How should teachers and admin reach you for important updates?
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'email',    label: 'Email' },
                { id: 'message',  label: 'In-app messaging' },
                { id: 'both',     label: 'Both' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updatePref('preferredContactMethod', opt.id)}
                  className={prefs.preferredContactMethod === opt.id ? 'btn btn-p btn-sm' : 'btn btn-s btn-sm'}
                  style={{ background: prefs.preferredContactMethod === opt.id ? '#8B1A2E' : 'transparent' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
 
          {/* Timezone */}
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: 14, color: 'var(--s900)', marginBottom: 4 }}>
              Timezone
            </label>
            <div style={{ fontSize: 12.5, color: 'var(--s500)', marginBottom: 10 }}>
              Class times and reminders are shown in this timezone.
            </div>
            <select
              value={prefs.timezone}
              onChange={e => updatePref('timezone', e.target.value)}
              style={{
                padding: '8px 12px', fontSize: 14, fontFamily: 'inherit',
                border: '1.5px solid var(--border)', borderRadius: 'var(--rmd)',
                background: 'var(--white)', color: 'var(--s700)', cursor: 'pointer',
                minWidth: 200,
              }}
            >
              <option value="Africa/Nairobi">Nairobi (EAT, UTC+3)</option>
              <option value="Asia/Dubai">Dubai (GST, UTC+4)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="America/New_York">New York (EST/EDT)</option>
              <option value="America/Los_Angeles">Los Angeles (PST/PDT)</option>
              <option value="Africa/Lagos">Lagos (WAT, UTC+1)</option>
              <option value="Africa/Johannesburg">Johannesburg (SAST, UTC+2)</option>
            </select>
          </div>
 
          {/* Language */}
          <div style={{ padding: '14px 0' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: 14, color: 'var(--s900)', marginBottom: 4 }}>
              Preferred language
            </label>
            <div style={{ fontSize: 12.5, color: 'var(--s500)', marginBottom: 10 }}>
              For emails and notifications. Class language is set by your teacher.
            </div>
            <select
              value={prefs.preferredLanguage}
              onChange={e => updatePref('preferredLanguage', e.target.value)}
              style={{
                padding: '8px 12px', fontSize: 14, fontFamily: 'inherit',
                border: '1.5px solid var(--border)', borderRadius: 'var(--rmd)',
                background: 'var(--white)', color: 'var(--s700)', cursor: 'pointer',
                minWidth: 200,
              }}
            >
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
              <option value="fr">Francais</option>
              <option value="ar">Arabic</option>
              <option value="es">Espanol</option>
            </select>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          ACCOUNT & PRIVACY (danger zone)
          Delete account flow. Soft-delete on the backend;
          requires password + literal "DELETE" confirmation.
      ═══════════════════════════════════════════════════ */}
      {section === 'danger' && (
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--s900)', marginBottom: 6 }}>
            Account & Privacy
          </h3>
          <p style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 20 }}>
            Manage your data and account status.
          </p>

          <div style={{
            background: '#FFF7ED',
            border: '1.5px solid #FB923C',
            borderRadius: 'var(--rmd, 8px)',
            padding: 20, marginBottom: 16,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, color: '#9A3412',
              letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8,
            }}>Danger zone</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s900)', marginBottom: 6 }}>
              Delete my account
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--s500)', lineHeight: 1.6, marginBottom: 14 }}>
              Deactivates your account immediately. You will be logged out and
              cannot log back in. Your homework submissions, attendance records,
              and grades are preserved for the school's records. If this is a
              mistake, contact your school administrator to restore access.
            </div>
            <button onClick={() => setShowDeleteModal(true)}
              style={{
                background: '#7D1025', color: '#fff', border: 'none',
                padding: '10px 18px', borderRadius: 7,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>
              Delete my account
            </button>
          </div>
        </div>
      )}

      {/* Delete account confirmation modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }} onClick={() => !deleteSubmitting && setShowDeleteModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 10,
            maxWidth: 440, width: '100%',
            padding: 28, boxShadow: '0 10px 40px rgba(0,0,0,.3)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: '#7D1025', marginTop: 0, marginBottom: 8 }}>
              Permanently deactivate your account?
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--s700)', lineHeight: 1.6, marginBottom: 16 }}>
              You will be logged out immediately. The school administrator
              can restore your account later if needed, but you will not
              be able to log in yourself once this is done.
            </p>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 4 }}>
              Your current password
            </label>
            <input type="password" value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              disabled={deleteSubmitting}
              placeholder="••••••••"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px', borderRadius: 6,
                border: '1.5px solid var(--border)',
                fontSize: 13, marginBottom: 12,
              }}/>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--s700)', marginBottom: 4 }}>
              Type <span style={{ fontFamily: 'monospace', background: '#FEE2E2', padding: '1px 6px', borderRadius: 3, color: '#7D1025' }}>DELETE</span> in uppercase to confirm
            </label>
            <input type="text" value={deleteConfirmation}
              onChange={e => setDeleteConfirmation(e.target.value)}
              disabled={deleteSubmitting}
              placeholder="DELETE"
              autoComplete="off"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px', borderRadius: 6,
                border: '1.5px solid ' + (deleteConfirmation === 'DELETE' ? '#7D1025' : 'var(--border)'),
                fontSize: 13, fontFamily: 'monospace', marginBottom: 18,
              }}/>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)}
                disabled={deleteSubmitting}
                style={{
                  background: 'transparent', color: 'var(--s700)',
                  border: '1.5px solid var(--border)',
                  padding: '9px 16px', borderRadius: 6,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>Cancel</button>
              <button onClick={submitDeleteAccount}
                disabled={deleteSubmitting || deleteConfirmation !== 'DELETE' || !deletePassword}
                style={{
                  background: '#7D1025', color: '#fff', border: 'none',
                  padding: '9px 16px', borderRadius: 6,
                  fontSize: 13, fontWeight: 700,
                  cursor: (deleteSubmitting || deleteConfirmation !== 'DELETE' || !deletePassword) ? 'not-allowed' : 'pointer',
                  opacity: (deleteSubmitting || deleteConfirmation !== 'DELETE' || !deletePassword) ? 0.5 : 1,
                }}>
                {deleteSubmitting ? 'Deactivating...' : 'Delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
 

// ═══════════════════════════════════════════════════════════
// DASHBOARD — Unified Student Dashboard
// ═══════════════════════════════════════════════════════════
//
// REPLACES the TWO existing dashboard blocks (lines 400-1408).
// One unified component that adapts to learning mode.
//
// HOW TO APPLY:
//
// STEP 1: Find and select the entire individual+group dashboard block
//
//   START: line ~397 — the comment that says:
//     {/* ════════════════════════════════════════════
//         DASHBOARD — live mastery data
//
//   END: line ~1408 — the closing `)}` after the group dashboard
//   (right before the SUBSCRIPTION comment block)
//
//   That's about 1008 lines of code. Select all of it.
//
// STEP 2: Delete the selection
//
// STEP 3: Paste this single line in its place:
//
//          {page === 'dashboard' && <DashboardTab user={user} store={store} setPage={setPage} setLearningMode={setLearningMode} learningMode={learningMode} toast={toast} />}
//
// STEP 4: Add the DashboardTab component at the bottom of the file
//   at COLUMN 1 — paste everything below this line:


// ═══════════════════════════════════════════════════════════
// DASHBOARD TAB — unified for individual & group, real data
// ═══════════════════════════════════════════════════════════

const dashSubjColours = {
  'Mathematics': '#8B1A2E', 'Physics': '#1E3A8A', 'Chemistry': '#166534',
  'Biology': '#7C2D12', 'English': '#6B21A8', 'History': '#92400E',
  'Geography': '#0F766E', 'Computer Science': '#1F2937',
  'Business Studies': '#7E22CE', 'Economics': '#9F1239',
}
const dashSubjColour = (s) => dashSubjColours[s] || '#8B1A2E'

// Daily affirmations — rotates by day-of-year, same quote for the whole day.
// Mix of African voices, classic wisdom, education-focused, and Smartious originals.
const DAILY_AFFIRMATIONS = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "You are never too small to make a difference.", author: "Wangari Maathai" },
  { text: "I have learned that to be with those I like is enough.", author: "Walt Whitman" },
  { text: "Small daily steps compound into mastery.", author: null },
  { text: "Once you stop learning, you start dying.", author: "Albert Einstein" },
  { text: "The best way out is always through.", author: "Robert Frost" },
  { text: "He who learns, teaches.", author: "Ethiopian proverb" },
  { text: "Knowledge is like a garden; if it is not cultivated, it cannot be harvested.", author: "Guinean proverb" },
  { text: "Mistakes are proof that you are trying.", author: null },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "A river cuts through rock not because of its power, but its persistence.", author: null },
  { text: "When the deepest part of you becomes engaged in what you are doing, you have come home.", author: "Sarah Ban Breathnach" },
  { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African proverb" },
  { text: "Try to be a rainbow in someone's cloud.", author: "Maya Angelou" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "The expert in anything was once a beginner.", author: null },
  { text: "Wisdom is like a baobab tree; no one individual can embrace it.", author: "Akan proverb" },
  { text: "Do not wait for the light to appear at the end of the tunnel; stride down there and light it yourself.", author: "Sara Henderson" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "There is no shame in not knowing; the shame lies in not finding out.", author: "Russian proverb" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The only way to learn mathematics is to do mathematics.", author: "Paul Halmos" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { text: "If I have seen further it is by standing on the shoulders of giants.", author: "Isaac Newton" },
  { text: "A goal without a plan is just a wish.", author: "Antoine de Saint-Exupery" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "However difficult life may seem, there is always something you can do and succeed at.", author: "Stephen Hawking" },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
]

// Pick the affirmation for today — same for everyone on the same day, rotates daily
const todaysAffirmation = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const dayOfYear = Math.floor(diff / 86400000)
  return DAILY_AFFIRMATIONS[dayOfYear % DAILY_AFFIRMATIONS.length]
}

const greetingFor = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Working late'
}


// Simple format for "X hours ago" / "yesterday"
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// For a future-dated value, returns "in 3h", "tomorrow", "in 5d", etc.
const timeUntil = (iso) => {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'now'
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `in ${mins}m`
  if (hours < 24) return `in ${hours}h`
  if (days === 1) return 'tomorrow'
  if (days < 7) return `in ${days}d`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function DashboardTab({ user, store, setPage, toast }) {
  const [tick, setTick] = useState(0)
  const [liveClasses,  setLiveClasses]  = useState([])
  const [hwPending,    setHwPending]    = useState([])
  const [recentExams,  setRecentExams]  = useState([])
  const [timetable,    setTimetable]    = useState([])
  const [ciStatus,     setCiStatus]     = useState(null)
  const [loading,      setLoading]      = useState(true)

  const firstName    = user?.firstName || 'Student'
  const initials     = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('')||'S'
  const avatar       = (() => { try { return user?.avatar||localStorage.getItem('sm_profile_avatar') } catch { return null } })()
  const gradeLabel   = user?.gradeLevel || user?.grade || ''
  const curriculum   = user?.curriculum || 'Cambridge IGCSE'
  const programme    = user?.programme || 'Homeschool'

  // Local data
  let practiceHist=[], examHist=[], xp=0, streak=0
  try { practiceHist = JSON.parse(localStorage.getItem('sm_practice_history')||'[]') } catch {}
  try { examHist     = JSON.parse(localStorage.getItem('sm_exam_history')||'[]') } catch {}
  try { xp           = parseInt(localStorage.getItem('sm_practice_xp')||'0',10)||0 } catch {}

  // Streak
  const streakCount = (() => {
    const days = new Set(practiceHist.map(s=>new Date(s.date).toDateString()))
    let c=0, cur=new Date()
    while(days.has(cur.toDateString())){ c++; cur.setDate(cur.getDate()-1) }
    return c
  })()

  // Subject mastery
  const subjectStats = {}
  practiceHist.forEach(s=>{ if(!subjectStats[s.subject]) subjectStats[s.subject]=[]; subjectStats[s.subject].push(s.score) })
  const subjects = Object.entries(subjectStats).map(([subj,scores])=>({
    subject:subj, mastery:Math.round(scores.reduce((a,b)=>a+b,0)/scores.length), sessions:scores.length
  })).sort((a,b)=>b.mastery-a.mastery).slice(0,4)

  // Pass rate
  const passRate = examHist.length>0 ? Math.round(examHist.filter(e=>e.score>=60).length/examHist.length*100) : null

  // Live clock
  useEffect(() => {
    const id = setInterval(()=>setTick(t=>t+1), 30000)
    return ()=>clearInterval(id)
  }, [])

  // API loads
  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      api.get('/homework/student/list'),
      api.get('/exams/student/list'),
      api.get('/timetable/me'),
      api.get('/checkin/today'),
    ]).then(([hw, ex, tt, ci]) => {
      if (hw.status==='fulfilled') {
        const list = hw.value.data?.homework||hw.value.data?.data?.homework||[]
        setHwPending(list.filter(h=>h.status!=='submitted'&&h.status!=='graded').slice(0,5))
      }
      if (ex.status==='fulfilled') {
        const list = ex.value.data?.exams||ex.value.data?.data?.exams||[]
        setRecentExams(list.slice(0,4))
      }
      if (tt.status==='fulfilled') setTimetable(tt.value.data?.data?.entries||tt.value.data?.entries||[])
      if (ci.status==='fulfilled') setCiStatus(ci.value.data?.data)
    }).finally(()=>setLoading(false))
  }, [user?._id])

  const now      = new Date()
  const nowMins  = now.getHours()*60+now.getMinutes()
  const todayDay = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][now.getDay()]
  const toMins   = hhmm=>{ if(!hhmm) return 0; const [h,m]=hhmm.split(':').map(Number); return h*60+m }
  const fmt      = hhmm=>{ if(!hhmm)return ''; const[h,m]=hhmm.split(':').map(Number); const mer=h>=12?'PM':'AM'; let hr=h%12; if(!hr)hr=12; return `${hr}${m?':'+String(m).padStart(2,'0'):''} ${mer}` }

  const todayEntries = timetable.filter(e=>e.dayOfWeek===todayDay).sort((a,b)=>toMins(a.startTime)-toMins(b.startTime))
  const nextClass    = todayEntries.find(e=>toMins(e.startTime)>nowMins)
  const liveNow      = todayEntries.find(e=>nowMins>=toMins(e.startTime)&&nowMins<toMins(e.endTime))

  const gc = s => s>=80?'#065F46':s>=70?'#1E40AF':s>=60?'#92400E':s>=50?'#6B21A8':'#991B1B'
  const gl = s => s>=80?'A*':s>=70?'B':s>=60?'C':s>=50?'D':s>=40?'E':'U'

  const greeting = now.getHours()<12?'Good morning':now.getHours()<17?'Good afternoon':'Good evening'
  const dayLabel = now.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})

  // KPI data
  const kpis = [
    { label:'XP Earned',    val:xp.toLocaleString(),              color:TOKENS.gold,         sub:'all time' },
    { label:'Study streak', val:streakCount+(streakCount===1?' day':' days'), color:TOKENS.crimson, sub:'consecutive' },
    { label:'Pass rate',    val:passRate!==null?passRate+'%':'—', color:passRate>=70?'#065F46':passRate>=50?'#D97706':'#991B1B', sub:'from exams' },
    { label:'HW pending',   val:hwPending.length,                 color:hwPending.length>0?TOKENS.crimson:TOKENS.accentEmerald, sub:'assignments' },
  ]

  const SUBJ_COLS = {'Mathematics':'#8B1A2E','Maths':'#8B1A2E','Physics':'#1E3A8A','Chemistry':'#166534','Biology':'#7C2D12','English':'#6B21A8','English Language':'#6B21A8','History':'#92400E','Geography':'#0F766E','Computer Science':'#1F2937','Business Studies':'#7E22CE','Economics':'#9F1239'}
  const colFor = s => SUBJ_COLS[s]||'#8B1A2E'

  return (
    <div style={{ animation:'fadeIn .3s ease' }}>

      {/* ── Hero banner ── */}
      <div style={{
        background:'linear-gradient(135deg,#7D1025 0%,#5A0B1B 55%,#3D0712 100%)',
        borderRadius:16, overflow:'hidden', marginBottom:20,
        boxShadow:'0 8px 32px rgba(125,16,37,.2)',
      }}>
        <div style={{ display:'flex', alignItems:'stretch' }}>
          {/* Avatar panel */}
          <div style={{ width:130, flexShrink:0, position:'relative', overflow:'hidden' }}>
            {avatar
              ? <img src={avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', minHeight:140, display:'block' }}/>
              : <div style={{ width:'100%', minHeight:140, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,.08)' }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(201,160,48,.15)', border:'2px solid rgba(201,160,48,.4)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Instrument Serif',serif", fontSize:22, fontWeight:400, color:'#C9A030' }}>
                    {initials}
                  </div>
                </div>
            }
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, transparent 50%, #7D1025)' }}/>
          </div>

          {/* Info */}
          <div style={{ flex:1, padding:'22px 24px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'#C9A030', marginBottom:6 }}>
              {dayLabel}
            </div>
            <h2 style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:26, fontWeight:400, color:'#fff', margin:'0 0 5px', letterSpacing:'-.3px' }}>
              {greeting}, <em style={{ fontStyle:'italic', color:'#F0CC5A' }}>{firstName}</em>
            </h2>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:10 }}>
              <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,.7)', textTransform:'uppercase', letterSpacing:'.08em' }}>{curriculum}</span>
              {gradeLabel && <span style={{ fontSize:12, color:'rgba(255,255,255,.5)' }}>{gradeLabel}</span>}
              <span style={{ fontSize:12, color:'rgba(255,255,255,.4)', textTransform:'capitalize' }}>{programme}</span>
            </div>
            {/* Check-in status */}
            {ciStatus && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 12px', borderRadius:99, background:ciStatus.checkedIn?'rgba(21,128,61,.25)':ciStatus.onBreak?'rgba(107,33,168,.25)':'rgba(255,255,255,.1)', border:'1px solid '+(ciStatus.checkedIn?'rgba(21,128,61,.4)':ciStatus.onBreak?'rgba(107,33,168,.4)':'rgba(255,255,255,.2)'), width:'fit-content' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:ciStatus.checkedIn?'#4ADE80':ciStatus.onBreak?'#C084FC':'#9CA3AF', flexShrink:0 }}/>
                <span style={{ fontSize:11, fontWeight:600, color:ciStatus.checkedIn?'#4ADE80':ciStatus.onBreak?'#C084FC':'rgba(255,255,255,.6)' }}>
                  {ciStatus.onBreak?'On break':ciStatus.checkedIn?'Checked in · '+(ciStatus.checkInStatus||'present'):'Not checked in today'}
                </span>
                {!ciStatus.checkedIn&&!ciStatus.onBreak&&<button onClick={()=>setPage('attendance')} style={{ fontSize:10, fontWeight:700, color:'#C9A030', background:'transparent', border:'none', cursor:'pointer', padding:0, textDecoration:'underline' }}>Check in</button>}
              </div>
            )}
          </div>

          {/* Today at a glance */}
          <div style={{ width:160, flexShrink:0, borderLeft:'1px solid rgba(255,255,255,.1)', padding:'20px 18px', display:'flex', flexDirection:'column', justifyContent:'center', gap:12 }}>
            {liveNow ? (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.45)', marginBottom:4 }}>Live now</div>
                <div style={{ fontSize:13, fontWeight:800, color:'#4ADE80' }}>{liveNow.subject}</div>
                <div style={{ fontSize:10.5, color:'rgba(255,255,255,.4)', marginTop:3 }}>{fmt(liveNow.startTime)}–{fmt(liveNow.endTime)}</div>
                <button onClick={()=>setPage('live')} style={{ marginTop:8, fontSize:10.5, fontWeight:700, background:'#22C55E', color:'#fff', border:'none', borderRadius:6, padding:'4px 12px', cursor:'pointer' }}>Join</button>
              </div>
            ) : nextClass ? (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.45)', marginBottom:4 }}>Next class</div>
                <div style={{ fontSize:13, fontWeight:800, color:'#fff' }}>{nextClass.subject}</div>
                <div style={{ fontSize:10.5, color:'rgba(255,255,255,.5)', marginTop:3 }}>{fmt(nextClass.startTime)}</div>
              </div>
            ) : (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:4 }}>Today</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>No more classes</div>
              </div>
            )}
            <div style={{ textAlign:'center', paddingTop:8, borderTop:'1px solid rgba(255,255,255,.08)' }}>
              <div style={{ fontSize:9.5, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:3 }}>Today's schedule</div>
              <div style={{ fontSize:18, fontWeight:800, color:'#C9A030' }}>{todayEntries.length}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,.35)' }}>{todayEntries.length===1?'class':'classes'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background:'#fff', border:'1px solid #E8E2D6', borderRadius:12, padding:'16px 18px', transition:'box-shadow .18s, transform .18s' }}
            onMouseEnter={e=>{ e.currentTarget.style.boxShadow=`0 8px 24px rgba(125,16,37,.08)`; e.currentTarget.style.transform='translateY(-2px)' }}
            onMouseLeave={e=>{ e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)' }}>
            <div style={{ fontSize:10, fontWeight:700, color:TOKENS.inkMute, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6 }}>{k.label}</div>
            <div style={{ fontSize:26, fontWeight:800, color:k.color, lineHeight:1, marginBottom:2 }}>{k.val}</div>
            <div style={{ fontSize:11, color:TOKENS.inkMute }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16, alignItems:'start' }}>

        {/* Left column */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Today's timetable */}
          <div style={{ background:'#fff', border:'1px solid #E8E2D6', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #E8E2D6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:2 }}>Today's schedule</div>
                <div style={{ fontSize:14, fontWeight:800, color:TOKENS.ink }}>{['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][now.getDay()]}</div>
              </div>
              <button onClick={()=>setPage('timetable')} style={{ fontSize:12, fontWeight:700, color:TOKENS.crimson, background:'transparent', border:'none', cursor:'pointer', textDecoration:'underline' }}>Full timetable →</button>
            </div>
            {loading ? (
              <div style={{ padding:20, textAlign:'center', color:TOKENS.inkMute, fontSize:13 }}>Loading...</div>
            ) : todayEntries.length===0 ? (
              <div style={{ padding:24, textAlign:'center', color:TOKENS.inkMute, fontSize:13 }}>
                {['Saturday','Sunday'].includes(['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][now.getDay()])?'Weekend — no classes today':'No scheduled classes today'}
              </div>
            ) : (
              <div style={{ padding:'8px 0' }}>
                {todayEntries.map(e => {
                  const isLive = nowMins>=toMins(e.startTime)&&nowMins<toMins(e.endTime)
                  const isDone = nowMins>=toMins(e.endTime)
                  const col    = e.dayOfWeek==='Fri'?'#6D28D9':colFor(e.subject)
                  return (
                    <div key={e._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 18px', opacity:isDone?.55:1, background:isLive?col+'08':undefined, borderLeft:isLive?`3px solid ${col}`:undefined }}>
                      <div style={{ width:56, textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:col }}>{fmt(e.startTime)}</div>
                        <div style={{ fontSize:10, color:TOKENS.inkMute }}>{fmt(e.endTime)}</div>
                      </div>
                      <div style={{ width:3, height:36, borderRadius:2, background:col, flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:TOKENS.ink }}>{e.subject}</div>
                        {e.teacherId&&<div style={{ fontSize:11.5, color:TOKENS.inkMute, marginTop:1 }}>{e.teacherId.firstName||''} {e.teacherId.lastName||''}</div>}
                      </div>
                      {isLive&&<span style={{ fontSize:10, fontWeight:800, color:'#fff', background:'#22C55E', padding:'3px 9px', borderRadius:99, letterSpacing:'.04em' }}>LIVE</span>}
                      <span style={{ fontSize:10, color:TOKENS.inkMute, textTransform:'capitalize' }}>{e.deliveryMode}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Subject mastery */}
          {subjects.length > 0 && (
            <div style={{ background:'#fff', border:'1px solid #E8E2D6', borderRadius:12, overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #E8E2D6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:2 }}>Subject mastery</div>
                  <div style={{ fontSize:14, fontWeight:800, color:TOKENS.ink }}>Performance overview</div>
                </div>
                <button onClick={()=>setPage('results')} style={{ fontSize:12, fontWeight:700, color:TOKENS.crimson, background:'transparent', border:'none', cursor:'pointer', textDecoration:'underline' }}>All results →</button>
              </div>
              <div style={{ padding:18, display:'flex', flexDirection:'column', gap:12 }}>
                {subjects.map(s => {
                  const col = colFor(s.subject)
                  return (
                    <div key={s.subject}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:10, height:10, borderRadius:2, background:col, flexShrink:0 }}/>
                          <span style={{ fontSize:13, fontWeight:600, color:TOKENS.ink }}>{s.subject}</span>
                          <span style={{ fontSize:10.5, color:TOKENS.inkMute }}>{s.sessions} sessions</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ padding:'1px 8px', borderRadius:99, fontSize:11, fontWeight:800, background:gc(s.mastery)+'15', color:gc(s.mastery) }}>{gl(s.mastery)}</span>
                          <span style={{ fontSize:13, fontWeight:800, color:gc(s.mastery) }}>{s.mastery}%</span>
                        </div>
                      </div>
                      <div style={{ height:6, background:'#F3F4F6', borderRadius:99 }}>
                        <div style={{ width:s.mastery+'%', height:'100%', background:col, borderRadius:99, transition:'width .5s' }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent exams */}
          {recentExams.length > 0 && (
            <div style={{ background:'#fff', border:'1px solid #E8E2D6', borderRadius:12, overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #E8E2D6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:2 }}>Assessments</div>
                  <div style={{ fontSize:14, fontWeight:800, color:TOKENS.ink }}>Recent exams</div>
                </div>
                <button onClick={()=>setPage('exams')} style={{ fontSize:12, fontWeight:700, color:TOKENS.crimson, background:'transparent', border:'none', cursor:'pointer', textDecoration:'underline' }}>All exams →</button>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:'#FBFAF5' }}>
                  {['Exam','Subject','Status','Score'].map(h=>(
                    <th key={h} style={{ padding:'8px 14px', textAlign:'left', fontSize:10.5, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.06em', borderBottom:'1px solid #E8E2D6' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {recentExams.map(e=>(
                    <tr key={e._id} style={{ borderTop:'1px solid #E8E2D6' }}>
                      <td style={{ padding:'9px 14px', fontSize:13, fontWeight:600, color:TOKENS.ink }}>{e.title}</td>
                      <td style={{ padding:'9px 14px', fontSize:12, color:TOKENS.inkMute }}>{e.subject}</td>
                      <td style={{ padding:'9px 14px' }}>
                        <span style={{ padding:'2px 8px', borderRadius:99, fontSize:10.5, fontWeight:700,
                          background:e.status==='ended'?'#D1FAE5':e.status==='live'?'#FEF3C7':'#F3F4F6',
                          color:e.status==='ended'?'#065F46':e.status==='live'?'#92400E':'#6B7280' }}>
                          {e.status==='ended'?'Completed':e.status==='live'?'Live':'Upcoming'}
                        </span>
                      </td>
                      <td style={{ padding:'9px 14px', fontWeight:800, fontSize:13, color:e.score!=null?gc(e.score):TOKENS.inkMute }}>
                        {e.score!=null?e.score+'%':'—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Quick actions */}
          <div style={{ background:'#fff', border:'1px solid #E8E2D6', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #E8E2D6' }}>
              <div style={{ fontSize:10, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:2 }}>Quick actions</div>
              <div style={{ fontSize:14, fontWeight:800, color:TOKENS.ink }}>Jump to</div>
            </div>
            <div style={{ padding:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { label:'Practice',    page:'practice',  color:'#7C3AED', bg:'#F5F3FF' },
                { label:'Homework',    page:'homework',  color:'#15803D', bg:'#F0FDF4' },
                { label:'Live class',  page:'live',      color:'#B91C1C', bg:'#FEF2F2' },
                { label:'Timetable',   page:'timetable', color:'#BE185D', bg:'#FDF2F8' },
                { label:'Exams',       page:'exams',     color:'#B45309', bg:'#FFFBEB' },
                { label:'Library',     page:'library',   color:'#0369A1', bg:'#F0F9FF' },
              ].map(a=>(
                <button key={a.page} onClick={()=>setPage(a.page)} style={{
                  padding:'10px 12px', borderRadius:9, border:`1.5px solid ${a.color}20`,
                  background:a.bg, color:a.color, fontSize:12.5, fontWeight:700,
                  cursor:'pointer', textAlign:'left', transition:'all .15s',
                }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=a.color; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow=`0 4px 12px ${a.color}20` }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=a.color+'20'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Homework pending */}
          <div style={{ background:'#fff', border:'1px solid #E8E2D6', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #E8E2D6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:2 }}>Homework</div>
                <div style={{ fontSize:14, fontWeight:800, color:TOKENS.ink }}>Pending</div>
              </div>
              {hwPending.length>0&&<span style={{ fontSize:11, fontWeight:700, color:'#fff', background:TOKENS.crimson, padding:'2px 9px', borderRadius:99 }}>{hwPending.length}</span>}
            </div>
            {loading ? (
              <div style={{ padding:20, textAlign:'center', color:TOKENS.inkMute, fontSize:13 }}>Loading...</div>
            ) : hwPending.length===0 ? (
              <div style={{ padding:24, textAlign:'center' }}>
                <div style={{ fontSize:24, marginBottom:6 }}>✓</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#065F46' }}>All caught up!</div>
                <div style={{ fontSize:11.5, color:TOKENS.inkMute, marginTop:2 }}>No pending homework</div>
              </div>
            ) : (
              <div>
                {hwPending.map((h,i) => {
                  const due    = h.dueDate ? new Date(h.dueDate) : null
                  const isOver = due && due < now
                  const col    = colFor(h.subject)
                  return (
                    <div key={h._id||i} style={{ padding:'10px 16px', borderBottom:'1px solid #F4EFEB', borderLeft:`3px solid ${isOver?'#991B1B':col}`, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div>
                        <div style={{ fontSize:12.5, fontWeight:700, color:TOKENS.ink }}>{h.title}</div>
                        <div style={{ fontSize:11, color:TOKENS.inkMute, marginTop:1 }}>{h.subject}</div>
                      </div>
                      {due&&<div style={{ fontSize:10.5, fontWeight:700, color:isOver?'#991B1B':'#D97706', whiteSpace:'nowrap', marginLeft:8 }}>
                        {isOver?'Overdue':due.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
                      </div>}
                    </div>
                  )
                })}
                <div style={{ padding:'10px 16px' }}>
                  <button onClick={()=>setPage('homework')} style={{ width:'100%', padding:'9px', borderRadius:8, background:TOKENS.cream, border:`1px solid ${TOKENS.line}`, color:TOKENS.crimson, fontSize:13, fontWeight:700, cursor:'pointer' }}>View all homework →</button>
                </div>
              </div>
            )}
          </div>

          {/* Motivational quote */}
          {(() => {
            const quotes = [
              { text:"The secret of getting ahead is getting started.", author:"Mark Twain" },
              { text:"Education is the most powerful weapon you can use to change the world.", author:"Nelson Mandela" },
              { text:"Every expert was once a beginner.", author:"Helen Hayes" },
              { text:"Success is the sum of small efforts repeated day in and day out.", author:"Robert Collier" },
            ]
            const q = quotes[new Date().getDate()%quotes.length]
            return (
              <div style={{ background:'linear-gradient(135deg,#7D1025,#5A0B1B)', borderRadius:12, padding:'20px 20px' }}>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'#C9A030', marginBottom:10 }}>Daily affirmation</div>
                <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:15, fontWeight:400, color:'#fff', lineHeight:1.55, marginBottom:10, fontStyle:'italic' }}>"{q.text}"</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.55)' }}>— {q.author}</div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}


// Helper at module level — minutes since midnight to "9:00 AM"
function formatMinsTime(mins) {
  let h = Math.floor(mins / 60)
  const m = mins % 60
  const mer = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}${m === 0 ? '' : ':' + String(m).padStart(2, '0')} ${mer}`
}

// ═══════════════════════════════════════════════════════════
// STUDENT LIBRARY PAGE
// Browse coursebook PDFs for the student's subjects. Books are
// grouped by subject. Clicking "Open" launches the LibraryViewer
// in full-screen mode with download deterrence.
// ═══════════════════════════════════════════════════════════
function StudentLibraryPage({ user, toast }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  // Quick filters. A search box alone means a student has to already know
  // what they are looking for, which is the opposite of browsing a library.
  const [shelfF, setShelfF] = useState('all')     // all | mine | academic | general
  const [genreF, setGenreF] = useState('all')
  const [viewerBook, setViewerBook] = useState(null)
  const [openFolders, setOpenFolders] = useState({})
  const toggleFolder = (key) => setOpenFolders(f => ({ ...f, [key]: !f[key] }))

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const { data } = await api.get('/library')
        if (cancelled) return
        setBooks(data?.data?.books || [])
      } catch (e) {
        if (!cancelled) toast?.error?.('Failed to load library: ' + (e?.response?.data?.message || e.message))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter by search term
  const mySubjects = new Set(
    (user?.subjects || []).map(x => String(x).trim().toLowerCase()).filter(Boolean))
  const isMine = (b) => mySubjects.has(String(b.subjectName || '').trim().toLowerCase())

  const filtered = (() => {
    const q = search.trim().toLowerCase()
    return books.filter(b => {
      if (shelfF === 'mine'     && !isMine(b)) return false
      if (shelfF === 'academic' && (b.shelf || 'academic') !== 'academic') return false
      if (shelfF === 'general'  && (b.shelf || 'academic') !== 'general')  return false
      if (genreF !== 'all' && (b.genre || '') !== genreF) return false
      if (!q) return true
      return (b.title || '').toLowerCase().includes(q)
          || (b.description || '').toLowerCase().includes(q)
          || (b.author || '').toLowerCase().includes(q)
          || (b.subjectName || '').toLowerCase().includes(q)
          || (b.genre || '').toLowerCase().includes(q)
    })
  })()

  // Genres actually present, so the chip row never offers an empty filter.
  const genresAvailable = [...new Set(
    books.filter(b => (b.shelf || 'academic') === 'general' && b.genre).map(b => b.genre)
  )].sort()

  // Coursebooks grouped by subject, with the student's OWN subjects first.
  //
  // The library now returns every book rather than only the student's
  // enrolled subjects, which is the point — reading should not stop at
  // the syllabus. But a flat alphabetical list would bury a student's own
  // coursebooks under everything else, so their subjects are labelled and
  // sorted to the top and the rest sits under "Explore".
  const grouped = (() => {
    const mine = {}
    const other = {}
    for (const b of filtered) {
      if (b.section === 'mock' || b.section === 'past_paper') continue
      const general = (b.shelf || 'academic') === 'general'
      const label = general
        ? 'Reading for pleasure  \u2014  ' + (b.genre || 'Other')
        : (isMine(b) ? 'Your subjects  \u2014  ' : 'Explore  \u2014  ') + (b.subjectName || 'Other')
      const target = (!general && isMine(b)) ? mine : other
      if (!target[label]) target[label] = []
      target[label].push(b)
    }
    const out = {}
    Object.keys(mine).sort().forEach(k => { out[k] = mine[k] })
    Object.keys(other).sort().forEach(k => { out[k] = other[k] })
    return out
  })()

  // Paper folders: Section -> Subject -> Year -> [papers sorted Paper 1..6]
  const paperTree = (() => {
    const SEC = { past_paper: 'Past Papers \u00B7 Exam Body', mock: 'Mock Exams' }
    const tree = {}
    for (const b of filtered) {
      if (b.section !== 'mock' && b.section !== 'past_paper') continue
      const sec = SEC[b.section]
      const subj = b.subjectName || 'Other'
      const yr = b.examYear ? String(b.examYear) : 'Unsorted'
      tree[sec] = tree[sec] || {}
      tree[sec][subj] = tree[sec][subj] || {}
      tree[sec][subj][yr] = tree[sec][subj][yr] || []
      tree[sec][subj][yr].push(b)
    }
    for (const sec of Object.keys(tree))
      for (const subj of Object.keys(tree[sec]))
        for (const yr of Object.keys(tree[sec][subj]))
          tree[sec][subj][yr].sort((a, b2) => (a.paperNumber || 99) - (b2.paperNumber || 99)
            || String(a.session || '').localeCompare(String(b2.session || ''))
            || String(a.title || '').localeCompare(String(b2.title || '')))
    return tree
  })()
  const hasPapers = Object.keys(paperTree).length > 0

  return (
    <div>
      {/* ── Hero banner ────────────────────────────────────────
          Same treatment as Exams and Homework: artwork untouched, a
          slightly narrower card, and a glowing gold stat footer. */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        maxWidth: 1180, marginLeft: 'auto', marginRight: 'auto',
      }}>
        <img
          src="/banners/library-hero.jpg"
          alt="Digital library — read, learn, grow"
          style={{ width: '100%', display: 'block', height: 'auto' }}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          background: '#6B0F1E',
        }}>
          {[
            ['Books',    books.length || '\u2014'],
            ['Subjects', Object.keys(grouped).length || '\u2014'],
            ['Showing',  filtered.length || '\u2014'],
          ].map(([l, v]) => (
            <div key={l} style={{ padding: '13px 18px', borderRight: '1px solid rgba(201,160,48,.18)' }}>
              <div style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
                color: '#E8C97A', opacity: .85, marginBottom: 3,
                textShadow: '0 0 10px rgba(201,160,48,.45)',
              }}>{l}</div>
              <div style={{
                fontSize: 17, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace',
                color: '#F5D98B',
                textShadow: '0 0 12px rgba(245,217,139,.65), 0 0 26px rgba(201,160,48,.35)',
              }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 16 }}>
        Read your coursebooks inline. Books open in full-screen mode and cannot be downloaded.
      </div>

      {/* ── Search + quick filters ──────────────────────────────
          A search box alone requires a student to already know what
          they want. Chips let them browse: their own subjects, the
          wider curriculum shelf, or reading for pleasure by genre. */}
      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, author, subject or genre..."
          style={{
            width: '100%', maxWidth: 420, boxSizing: 'border-box',
            padding: '10px 14px', borderRadius: 8,
            border: '1.5px solid #E8E2D6',
            fontSize: 13, background: '#FBFAF5', marginBottom: 12,
          }}/>

        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            ['all',      'All books'],
            ['mine',     'My subjects'],
            ['academic', 'Curriculum'],
            ['general',  'Reading for pleasure'],
          ].map(([id, label]) => (
            <button key={id}
              onClick={() => { setShelfF(id); if (id !== 'general') setGenreF('all') }}
              style={{
                background: shelfF === id ? '#7D1025' : '#fff',
                color:      shelfF === id ? '#fff' : 'var(--s600)',
                border: '1.5px solid ' + (shelfF === id ? '#7D1025' : 'var(--border)'),
                padding: '6px 14px', borderRadius: 99,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>{label}</button>
          ))}

          {/* Genre chips only appear once there is a general shelf to browse. */}
          {(shelfF === 'general' || shelfF === 'all') && genresAvailable.length > 0 && (
            <>
              <span style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }}/>
              <button onClick={() => setGenreF('all')} style={{
                background: genreF === 'all' ? 'var(--s200)' : 'transparent',
                color: 'var(--s600)', border: 'none',
                padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>All genres</button>
              {genresAvailable.map(g => (
                <button key={g} onClick={() => { setGenreF(g); setShelfF('general') }} style={{
                  background: genreF === g ? '#C9A030' : 'transparent',
                  color: genreF === g ? '#1A0F0E' : 'var(--s600)',
                  border: 'none', padding: '6px 12px', borderRadius: 99,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>{g}</button>
              ))}
            </>
          )}

          {(shelfF !== 'all' || genreF !== 'all' || search) && (
            <button onClick={() => { setShelfF('all'); setGenreF('all'); setSearch('') }}
              style={{
                background: 'transparent', color: 'var(--s500)', border: 'none',
                padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                textDecoration: 'underline',
              }}>Clear</button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ fontSize: 13, color: '#9A9A9A', fontStyle: 'italic', padding: 20 }}>
          Loading library...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <h3>{books.length === 0 ? 'No books in your library yet' : 'No books match your search'}</h3>
          <p>{books.length === 0
            ? 'Your teachers will upload coursebook PDFs here as they become available.'
            : 'Try a different search term, or clear the search to see all books.'}</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap: 22 }}>
          {/* NOT re-sorted: grouped is already ordered with the
              student's own subjects first, then Explore. */}
          {Object.keys(grouped).map(subj => (
            <div key={subj}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#7D1025',
                letterSpacing: '.08em', textTransform: 'uppercase',
                marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #E8E2D6',
              }}>
                {subj}
                <span style={{ color: '#9A9A9A', fontWeight: 600, marginLeft: 8 }}>
                  ({grouped[subj].length})
                </span>
              </div>
              <div style={{
                display:'grid',
                gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 12,
              }}>
                {grouped[subj].map(book => (
                  <StudentBookCard key={book._id} book={book}
                    onOpen={() => setViewerBook(book)}/>
                ))}
              </div>
            </div>
          ))}

          {/* Past papers and mock exams: folder view by Subject, then Year, then Paper 1-6 */}
          {hasPapers && Object.keys(paperTree).sort().map(sec => (
            <div key={sec}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#7D1025',
                letterSpacing: '.08em', textTransform: 'uppercase',
                marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #E8E2D6',
              }}>
                {sec}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
                {Object.keys(paperTree[sec]).sort().map(subj => (
                  <div key={subj} style={{ background:'#fff', border:'1px solid #E8E2D6', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontFamily:'Georgia, serif', fontSize: 15, fontWeight: 700, color:'#1A1A1A', marginBottom: 10 }}>
                      {subj}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
                      {Object.keys(paperTree[sec][subj]).sort((a, b2) => {
                        if (a === 'Unsorted') return 1
                        if (b2 === 'Unsorted') return -1
                        return parseInt(b2, 10) - parseInt(a, 10)
                      }).map(yr => {
                        const fkey = sec + '|' + subj + '|' + yr
                        const open = !!openFolders[fkey]
                        const papers = paperTree[sec][subj][yr]
                        return (
                          <div key={yr} style={{ border:'1px solid #EFE9DD', borderRadius: 9, overflow:'hidden' }}>
                            <button onClick={() => toggleFolder(fkey)} style={{
                              width:'100%', display:'flex', alignItems:'center', gap: 10,
                              background: open ? '#FBF7EC' : '#FDFAF4', border:'none',
                              padding:'10px 14px', cursor:'pointer', textAlign:'left',
                            }}>
                              <span style={{
                                width: 30, height: 24, borderRadius: 5, flexShrink: 0,
                                background: 'linear-gradient(135deg, #C9A030, #A8821F)',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                color:'#fff', fontSize: 11, fontWeight: 800,
                              }}>{open ? '\u2212' : '+'}</span>
                              <span style={{ fontSize: 13.5, fontWeight: 800, color:'#3A2E1E' }}>{yr}</span>
                              <span style={{ fontSize: 11.5, color:'#9A9A9A', fontWeight: 600 }}>
                                {papers.length} paper{papers.length === 1 ? '' : 's'}
                              </span>
                            </button>
                            {open && (
                              <div style={{ padding:'6px 10px 10px', display:'flex', flexDirection:'column', gap: 6 }}>
                                {papers.map(bk => (
                                  <div key={bk._id} style={{
                                    display:'flex', alignItems:'center', gap: 10,
                                    background:'#fff', border:'1px solid #EFE9DD', borderRadius: 8,
                                    padding:'8px 12px',
                                  }}>
                                    <span style={{
                                      fontSize: 10, fontWeight: 800, color:'#7D1025',
                                      background:'#F7E9EC', border:'1px solid #E4C3CB',
                                      borderRadius: 99, padding:'3px 10px', letterSpacing:'.04em',
                                      flexShrink: 0, whiteSpace:'nowrap',
                                    }}>
                                      {bk.paperNumber ? 'PAPER ' + bk.paperNumber : 'PDF'}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 12.5, fontWeight: 700, color:'#1A1A1A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                        {bk.title}
                                      </div>
                                      {bk.session && (
                                        <div style={{ fontSize: 10.5, color:'#7D5A0F', fontWeight: 700 }}>{bk.session}</div>
                                      )}
                                    </div>
                                    <button onClick={() => setViewerBook(bk)} style={{
                                      background:'#7D1025', color:'#fff', border:'none',
                                      borderRadius: 7, padding:'7px 14px', fontSize: 11.5,
                                      fontWeight: 700, cursor:'pointer', flexShrink: 0,
                                    }}>Open</button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewerBook && (
        <LibraryViewer book={viewerBook} api={api} readOnly onClose={() => setViewerBook(null)}/>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// StudentBookCard
// Compact book card for the student library. Read-only,
// no delete button.
// ─────────────────────────────────────────────────────────
function StudentBookCard({ book, onOpen }) {
  const sizeMB = book.sizeBytes ? (book.sizeBytes / (1024 * 1024)).toFixed(1) + ' MB' : ''
  return (
    <div className="sm-glow sm-glow-card" style={{
      background: '#fff', border: 'none', borderRadius: 10,
      padding: 14, display: 'flex', flexDirection: 'column',
    }}>
      {book.coverUrl ? (
        <img src={book.coverUrl} alt="" loading="lazy" style={{
          width: '100%', height: 150, borderRadius: 8, objectFit: 'cover',
          objectPosition: 'top', marginBottom: 10, border: '1px solid #E8E2D6',
        }} />
      ) : (
        <div style={{
          width: '100%', height: 150, borderRadius: 8, marginBottom: 10,
          background: 'linear-gradient(150deg, #7D1025 0%, #5C0B1B 60%, #3E0712 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <div style={{
            width: 44, height: 56, borderRadius: 4, border: '2px solid #C9A030',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#C9A030', fontSize: 10, fontWeight: 800, letterSpacing: '.05em',
          }}>PDF</div>
          <div style={{
            color: '#F0CC5A', fontSize: 11, fontWeight: 700, textAlign: 'center',
            padding: '0 14px', fontFamily: 'Georgia, serif', fontStyle: 'italic',
            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{book.subjectName || 'Coursebook'}</div>
        </div>
      )}
      <div style={{ display:'flex', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 13.5, color: '#1A1A1A',
            lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{book.title}</div>
          {book.author && (
            <div style={{ fontSize: 11.5, color: '#6B6B6B', marginTop: 3 }}>{book.author}</div>
          )}
        </div>
      </div>

      {book.description && (
        <div style={{
          fontSize: 11.5, color: '#6B6B6B', marginBottom: 8,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', lineHeight: 1.4,
        }}>
          {book.description}
        </div>
      )}

      <div style={{ fontSize: 10.5, color: '#9A9A9A', marginBottom: 10 }}>
        {sizeMB}
        {book.grades?.length ? ' · ' + book.grades.join(', ') : ''}
      </div>

      <button onClick={onOpen}
        style={{
          background: '#7D1025', color: '#fff', border: 'none',
          padding: '8px 14px', borderRadius: 6,
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          marginTop: 'auto',
        }}>
        Open book
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// LessonPracticeTab
// ═══════════════════════════════════════════════════════════
// Embedded adaptive practice for the Lesson Player. Pulls
// questions from the real Question Bank (GET /api/questions)
// filtered by the lesson's subject + curriculum + topic, so
// students practice on exactly what they just watched/read.
//
// Props:
//   subject     — subject name (matches Question.subject)
//   curriculum  — curriculum id (matches Question.curriculum)
//   topic       — topic name (matches Question.topic). Optional;
//                 when absent the practice covers the whole subject.
//   user        — current student (for XP tracking)
//   toast       — toast helper
//
// Render stages: 'loading' | 'empty' | 'quiz' | 'result'
//
// Question shape (from /api/questions): supports nested parts.
// For embedded practice we currently render MCQs only — a
// question without an MCQ leaf is skipped. This keeps the
// embedded loop fast-feedback. Long-form questions belong in
// homework / exams, not lesson practice.
// ═══════════════════════════════════════════════════════════
function LessonPracticeTab({ subject, curriculum, topic, user, toast }) {
  const [stage, setStage] = useState('loading')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})  // { qIndex: optionString }
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Local XP — uses same key as PracticeTab so stats unify.
  const [xp, setXp] = useState(() => {
    try { return parseInt(localStorage.getItem('sm_practice_xp') || '0', 10) || 0 } catch { return 0 }
  })

  // Pick an MCQ leaf out of a possibly-nested question. Returns null
  // if no MCQ found. We pick the first MCQ leaf we hit in DFS order.
  const findMcqLeaf = (q) => {
    if (q.type === 'mcq' && Array.isArray(q.options) && q.options.length >= 2) {
      return {
        text: q.questionText || q.text || '(no question text)',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        marks: q.marks || 1,
      }
    }
    const parts = Array.isArray(q.parts) ? q.parts : []
    for (const p of parts) {
      if (p.type === 'mcq' && Array.isArray(p.options) && p.options.length >= 2) {
        return {
          text: (q.questionText || q.text || '') + (p.text ? ' — ' + p.text : ''),
          options: p.options,
          correctAnswer: p.correctAnswer,
          explanation: p.explanation || q.explanation || '',
          marks: p.marks || 1,
        }
      }
      const nested = findMcqLeaf(p)
      if (nested) return nested
    }
    return null
  }

  // Shuffle helper
  const shuffle = (arr) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  // Fetch questions for this lesson context
  const loadQuestions = async () => {
    setStage('loading')
    setError(null)
    setAnswers({})
    setResult(null)
    try {
      const params = { type: 'mcq', limit: 40 }
      if (curriculum) params.curriculum = curriculum
      if (subject)    params.subject    = subject
      if (topic)      params.topic      = topic

      const { data } = await api.get('/questions', { params })
      const raw = data?.questions || []

      // Reduce each question to a renderable MCQ leaf (if any)
      const playable = []
      for (const q of raw) {
        const leaf = findMcqLeaf(q)
        if (!leaf) continue
        playable.push({
          _id: q._id,
          text: leaf.text,
          options: leaf.options,
          correctAnswer: leaf.correctAnswer,
          explanation: leaf.explanation,
          marks: leaf.marks,
          shuffledOptions: shuffle(leaf.options),
        })
      }

      if (playable.length === 0) {
        setStage('empty')
        setQuestions([])
        return
      }

      // Pick up to 5 random ones
      const picked = shuffle(playable).slice(0, 5).map((q, i) => ({ ...q, qIndex: i }))
      setQuestions(picked)
      setStage('quiz')
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load practice questions.')
      setStage('empty')
    }
  }

  useEffect(() => {
    loadQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, curriculum, topic])

  // Compare student's answer to correctAnswer. correctAnswer in the
  // schema is `Mixed` so it can be:
  //   - a string (the option text)                              → direct compare
  //   - an array of strings (multi-correct, all required)       → not handled here; first match only
  //   - an index number into options                            → resolve to option text first
  // We coerce to the option *string* for comparison.
  const normalizeCorrect = (q) => {
    const c = q.correctAnswer
    if (typeof c === 'string') return c
    if (Array.isArray(c) && c.length > 0) return String(c[0])
    if (typeof c === 'number' && q.options && q.options[c] !== undefined) return q.options[c]
    return null
  }

  const submit = () => {
    let correct = 0
    const breakdown = questions.map(q => {
      const studentAns = answers[q.qIndex]
      const correctOpt = normalizeCorrect(q)
      const isCorrect = studentAns != null && correctOpt != null && studentAns === correctOpt
      if (isCorrect) correct++
      return { ...q, studentAns, correctOpt, isCorrect }
    })
    const total = questions.length
    const score = total > 0 ? Math.round((correct / total) * 100) : 0
    const xpEarned = correct * 20
    const newXp = xp + xpEarned
    setXp(newXp)
    try { localStorage.setItem('sm_practice_xp', String(newXp)) } catch {}

    // Append to practice history so the dashboard stat carries over
    try {
      const hist = JSON.parse(localStorage.getItem('sm_practice_history') || '[]')
      hist.push({
        subject, topic, score, correct, total,
        xpEarned,
        date: new Date().toISOString(),
        source: 'lesson-player',
      })
      localStorage.setItem('sm_practice_history', JSON.stringify(hist))
    } catch {}

    setResult({ correct, total, score, xpEarned, breakdown })
    setStage('result')
    if (score >= 80)      toast?.ok?.(`Excellent! +${xpEarned} XP`)
    else if (score >= 60) toast?.ok?.(`Good work! +${xpEarned} XP`)
    else                  toast?.info?.(`+${xpEarned} XP. Try again to improve!`)
  }

  const tryAgain = () => loadQuestions()

  // ── LOADING ──
  if (stage === 'loading') {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9A9A9A', fontSize: 13 }}>
        Loading practice questions...
      </div>
    )
  }

  // ── EMPTY (no questions in bank yet, or fetch failed) ──
  if (stage === 'empty') {
    return (
      <div style={{
        padding: 28, background: '#FBFAF5',
        border: '1px solid #E8E2D6', borderRadius: 10,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 20, color: '#1A1A1A', marginBottom: 8,
        }}>
          No practice questions for this topic yet
        </div>
        <div style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.6, marginBottom: 14, maxWidth: 460, margin: '0 auto 14px' }}>
          {topic
            ? <>Your teacher hasn't added practice questions for <strong>{topic}</strong> yet. Check back soon, or try another topic in the meantime.</>
            : <>No multiple-choice questions are available for this subject yet.</>}
        </div>
        {error && (
          <div style={{ fontSize: 11.5, color: '#9A2434', marginBottom: 12 }}>
            {error}
          </div>
        )}
        <button onClick={loadQuestions}
          style={{
            background: '#7D1025', color: '#fff', border: 'none',
            padding: '8px 18px', borderRadius: 7,
            fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
          }}>
          Refresh
        </button>
      </div>
    )
  }

  // ── RESULT ──
  if (stage === 'result' && result) {
    const colour = result.score >= 80 ? '#15803D' : result.score >= 60 ? '#C9A030' : '#9A2434'
    return (
      <div>
        <div style={{
          padding: '22px 26px',
          background: `linear-gradient(135deg, ${colour}, ${colour}DD)`,
          color: '#fff',
          borderRadius: 12, marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, marginBottom: 6 }}>
            Practice complete
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 38, fontWeight: 400, lineHeight: 1 }}>
              {result.score}%
            </div>
            <div style={{ fontSize: 14, opacity: .9 }}>
              {result.correct} of {result.total} correct · +{result.xpEarned} XP
            </div>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div style={{ marginBottom: 16 }}>
          {result.breakdown.map((q, i) => (
            <div key={i} style={{
              padding: 14, marginBottom: 10,
              background: '#fff',
              border: '1px solid ' + (q.isCorrect ? '#BBF7D0' : '#FECACA'),
              borderLeft: '4px solid ' + (q.isCorrect ? '#15803D' : '#9A2434'),
              borderRadius: 7,
            }}>
              <div style={{
                fontSize: 10.5, fontWeight: 800,
                color: q.isCorrect ? '#15803D' : '#9A2434',
                letterSpacing: '.08em', textTransform: 'uppercase',
                marginBottom: 6,
              }}>
                Q{i + 1} · {q.isCorrect ? 'Correct' : 'Incorrect'}
              </div>
              <div style={{ fontSize: 13, color: '#1A1A1A', lineHeight: 1.5, marginBottom: 8 }}>
                {q.text}
              </div>
              <div style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 4 }}>
                Your answer: <strong style={{ color: q.isCorrect ? '#15803D' : '#9A2434' }}>
                  {q.studentAns || '(no answer)'}
                </strong>
              </div>
              {!q.isCorrect && q.correctOpt && (
                <div style={{ fontSize: 12, color: '#15803D', marginBottom: 4 }}>
                  Correct: <strong>{q.correctOpt}</strong>
                </div>
              )}
              {q.explanation && (
                <div style={{
                  fontSize: 11.5, color: '#6B6B6B',
                  background: '#FBFAF5', padding: 8, borderRadius: 5,
                  marginTop: 6, lineHeight: 1.5,
                }}>
                  <strong>Why:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={tryAgain}
          style={{
            background: '#7D1025', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: 7,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
          Try another set
        </button>
      </div>
    )
  }

  // ── QUIZ ──
  const allAnswered = questions.every(q => answers[q.qIndex] != null)
  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 14, flexWrap: 'wrap', gap: 8,
      }}>
        <div>
          <div style={{
            fontSize: 10, fontWeight: 800, color: '#7D1025',
            letterSpacing: '.12em', textTransform: 'uppercase',
            marginBottom: 3,
          }}>Adaptive practice</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>
            {topic || subject || 'Practice'} · {questions.length} questions
          </div>
        </div>
        <div style={{
          fontSize: 11, color: '#6B6B6B',
          background: '#FBFAF5', padding: '5px 12px', borderRadius: 99,
          border: '1px solid #E8E2D6',
        }}>
          {Object.keys(answers).length} / {questions.length} answered
        </div>
      </div>

      {questions.map((q, i) => (
        <div key={q._id} style={{
          padding: 16, marginBottom: 12,
          background: '#fff',
          border: '1px solid #E8E2D6',
          borderRadius: 8,
        }}>
          <div style={{
            fontSize: 10.5, fontWeight: 800, color: '#7D1025',
            letterSpacing: '.08em', textTransform: 'uppercase',
            marginBottom: 8,
          }}>Question {i + 1}</div>
          <div style={{
            fontSize: 14, color: '#1A1A1A', lineHeight: 1.55,
            marginBottom: 12, whiteSpace: 'pre-wrap',
          }}>
            {q.text}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {q.shuffledOptions.map((opt, oi) => {
              const selected = answers[q.qIndex] === opt
              return (
                <label key={oi}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 12px',
                    background: selected ? '#FDF7E2' : '#FBFAF5',
                    border: '1.5px solid ' + (selected ? '#C9A030' : '#E8E2D6'),
                    borderRadius: 6, cursor: 'pointer',
                    transition: 'background .12s, border-color .12s',
                  }}>
                  <input type="radio"
                    name={`q-${q.qIndex}`}
                    checked={selected}
                    onChange={() => setAnswers({ ...answers, [q.qIndex]: opt })}
                    style={{ marginTop: 2, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 13, color: '#1A1A1A', lineHeight: 1.45 }}>{opt}</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}

      <button onClick={submit} disabled={!allAnswered}
        style={{
          background: allAnswered ? '#7D1025' : '#D5CFC8',
          color: '#fff', border: 'none',
          padding: '11px 22px', borderRadius: 8,
          fontSize: 13.5, fontWeight: 800,
          cursor: allAnswered ? 'pointer' : 'not-allowed',
        }}>
        {allAnswered ? 'Submit answers' : `Answer all ${questions.length} questions to submit`}
      </button>
    </div>
  )
}

// Export so LessonPlayerTab can import it
export { LessonPracticeTab }

// ═══════════════════════════════════════════════════════════
// StudentAttendancePage
// ═══════════════════════════════════════════════════════════
// Read-only view of the student's own daily attendance record,
// populated by teachers via the Teacher Portal's Attendance tab.
//
// Layout:
//   1. Month navigator (prev / current / next, with this-month default)
//   2. Summary KPIs — total marked days, present, absent, half-day,
//      attendance percentage
//   3. Calendar grid view — every day of the chosen month coloured
//      by status. Weekends shown but un-coloured.
//   4. Absence list — chronological list of absent days with reasons
//
// Endpoint: GET /api/attendance/student/:studentId?from=&to=
//   - Backend already permits a student to read their own record
//     (no role check needed when isOwn is true)
//   - Returns `items` array sorted by date desc
// ═══════════════════════════════════════════════════════════
function StudentAttendancePage({ user, toast }) {
  const todayStr = new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
  const isWeekend = [0,6].includes(new Date().getDay())

  // ── Check-in state ──
  const [ciStatus, setCiStatus] = useState(null)
  const [ciLoading,setCiLoading]= useState(true)
  const [saving,   setSaving]   = useState(false)
  const [pick,     setPick]     = useState('present')
  const [lateTime, setLateTime] = useState('')
  const [reason,   setReason]   = useState('')

  // ── Calendar state ──
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [records, setRecords] = useState([])
  const [calLoad, setCalLoad] = useState(true)
  const [error,   setError]   = useState(null)

  const firstDay  = new Date(year, month, 1)
  const lastDay   = new Date(year, month+1, 0)
  const fromKey   = `${year}-${String(month+1).padStart(2,'0')}-01`
  const toKey     = `${year}-${String(month+1).padStart(2,'0')}-${String(lastDay.getDate()).padStart(2,'0')}`
  const monthLabel= firstDay.toLocaleDateString('en-GB',{month:'long',year:'numeric'})

  const loadCI = () => {
    setCiLoading(true)
    api.get('/checkin/today').then(r=>setCiStatus(r.data?.data)).catch(()=>{}).finally(()=>setCiLoading(false))
  }
  const loadCal = () => {
    if (!user?._id) return
    setCalLoad(true); setError(null)
    api.get(`/attendance/student/${user._id}`,{params:{from:fromKey,to:toKey}})
      .then(r=>setRecords(r.data?.data?.items||[]))
      .catch(e=>setError(e?.response?.data?.message||'Failed.'))
      .finally(()=>setCalLoad(false))
  }

  useEffect(()=>{loadCI()},[ ])
  useEffect(()=>{loadCal()},[user?._id,fromKey,toKey])

  const submit = async () => {
    if(pick==='late'&&!lateTime.trim()){toast?.error?.('Enter your arrival time.');return}
    if(pick==='absent'&&!reason.trim()){toast?.error?.('Enter a reason for absence.');return}
    setSaving(true)
    try { await api.post('/checkin',{status:pick,lateTime,reason}); toast?.ok?.('Check-in recorded.'); loadCI(); loadCal() }
    catch(e){toast?.error?.(e?.response?.data?.message||'Check-in failed.')}
    finally{setSaving(false)}
  }

  const SS = {
    present:{bg:'#D1FAE5',fg:'#065F46',label:'Present'},
    late:   {bg:'#FEF3C7',fg:'#D97706',label:'Late'},
    absent: {bg:'#FEE2E2',fg:'#991B1B',label:'Absent'},
    half_day:{bg:'#DBEAFE',fg:'#1E40AF',label:'Half day'},
  }
  const alreadyIn = !ciLoading&&ciStatus?.checkedIn
  const todaySS   = alreadyIn ? SS[ciStatus.checkInStatus]||SS.present : null

  // Calendar helpers
  const byDateKey = {}
  records.forEach(r=>{
    const d=new Date(r.date)
    byDateKey[`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`]=r
  })
  const counts={present:0,absent:0,half_day:0,late:0}
  records.forEach(r=>{if(counts[r.status]!==undefined)counts[r.status]++;else if(r.checkInStatus==='late')counts.late++})
  const totalMarked = records.length
  const attendedScore = counts.present + (counts.half_day||0)*0.5
  const pct = totalMarked>0?Math.round((attendedScore/totalMarked)*100):null

  const calDays=[]
  const startPad=(firstDay.getDay()+6)%7
  for(let i=0;i<startPad;i++) calDays.push(null)
  for(let d=1;d<=lastDay.getDate();d++) calDays.push(d)

  const prevMonth=()=>{ if(month===0){setYear(y=>y-1);setMonth(11)}else setMonth(m=>m-1) }
  const nextMonth=()=>{ if(month===11){setYear(y=>y+1);setMonth(0)}else setMonth(m=>m+1) }

  const DAY_LABELS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

  // On break
  if(!ciLoading&&ciStatus?.onBreak) return (
    <div>
      <div style={{marginBottom:20}}>
        <div className="sec-tag">Attendance</div>
        <h2 className="serif" style={{fontSize:26,color:TOKENS.ink,margin:'6px 0 4px'}}>My Attendance</h2>
      </div>
      <div style={{padding:'40px 20px',textAlign:'center',background:'#fff',border:'1px solid #E8E2D6',borderRadius:12}}>
        <div style={{fontFamily:"'Instrument Serif',serif",fontSize:22,color:'#1A0F0E',marginBottom:8}}>You are on a break</div>
        <div style={{fontSize:13,color:'#857973',lineHeight:1.65}}>Check-in is paused. Contact your DOS or admin to return.{ciStatus.breakNote?' Note: '+ciStatus.breakNote:''}</div>
      </div>
    </div>
  )

  return (
    <div>
      {/* Page header */}
      <div style={{marginBottom:20}}>
        <div className="sec-tag">Attendance</div>
        <h2 className="serif" style={{fontSize:26,color:'var(--s900)',margin:'6px 0 4px'}}>My Attendance</h2>
        <div style={{fontSize:13,color:'#6B6B6B'}}>{todayStr}</div>
      </div>

      {/* ── Daily check-in card ── */}
      <div style={{background:'#fff',border:'1px solid #E8E2D6',borderRadius:12,overflow:'hidden',marginBottom:20}}>
        <div style={{background:'linear-gradient(135deg,#8B1A2E,#5A0B1B)',padding:'20px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:'#C9A030',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:4}}>Daily check-in</div>
            <div style={{fontSize:16,fontWeight:700,color:'#fff'}}>
              {alreadyIn ? 'Checked in' : isWeekend ? 'No check-in today' : 'Mark your attendance'}
            </div>
          </div>
          {alreadyIn && todaySS && (
            <span style={{padding:'6px 16px',borderRadius:99,background:todaySS.fg,color:'#fff',fontSize:13,fontWeight:700}}>
              {todaySS.label}
            </span>
          )}
        </div>

        <div style={{padding:'20px 24px'}}>
          {ciLoading ? (
            <div style={{textAlign:'center',color:'#9A9A9A',fontSize:13}}>Loading...</div>
          ) : isWeekend ? (
            <div style={{textAlign:'center',color:'#9A9A9A',fontSize:13,padding:'8px 0'}}>Enjoy your weekend! Check-in resumes Monday.</div>
          ) : alreadyIn ? (
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:52,height:52,borderRadius:'50%',background:todaySS.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={todaySS.fg} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:todaySS.fg}}>{todaySS.label} today</div>
                <div style={{fontSize:12.5,color:'#857973',marginTop:2}}>
                  {ciStatus.record?.checkInTime ? 'Checked in at '+new Date(ciStatus.record.checkInTime).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : ''}
                  {ciStatus.checkInStatus==='late'&&ciStatus.record?.lateTime ? ' · Arrived: '+ciStatus.record.lateTime : ''}
                  {ciStatus.checkInStatus==='absent'&&ciStatus.record?.reason ? ' · '+ciStatus.record.reason : ''}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
                {[{val:'present',label:'Present',bg:'#D1FAE5',fg:'#065F46',desc:'On time'},{val:'late',label:'Late',bg:'#FEF3C7',fg:'#D97706',desc:'Running late'},{val:'absent',label:'Absent',bg:'#FEE2E2',fg:'#991B1B',desc:'Not attending'}].map(opt=>(
                  <button key={opt.val} onClick={()=>{setPick(opt.val);if(opt.val!=='late')setLateTime('');if(opt.val!=='absent')setReason('')}}
                    style={{padding:'12px 8px',borderRadius:9,cursor:'pointer',textAlign:'center',border:'2px solid '+(pick===opt.val?opt.fg:'#E8E2D6'),background:pick===opt.val?opt.bg:'#fff',transition:'all .15s'}}>
                    <div style={{fontSize:13,fontWeight:800,color:pick===opt.val?opt.fg:'#564844',marginBottom:2}}>{opt.label}</div>
                    <div style={{fontSize:10.5,color:pick===opt.val?opt.fg:'#9A9A9A'}}>{opt.desc}</div>
                  </button>
                ))}
              </div>
              {pick==='late'&&(
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:11,fontWeight:700,color:'#8B1A2E',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4,display:'block'}}>Arrival time</label>
                  <input type="time" value={lateTime} onChange={e=>setLateTime(e.target.value)} style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #E8E2D6',fontSize:15,fontFamily:'inherit',boxSizing:'border-box'}}/>
                </div>
              )}
              {pick==='absent'&&(
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:11,fontWeight:700,color:'#8B1A2E',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4,display:'block'}}>Reason for absence</label>
                  <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={2} placeholder="Please explain your absence..."
                    style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #E8E2D6',fontSize:13,fontFamily:'inherit',resize:'vertical',boxSizing:'border-box'}}/>
                </div>
              )}
              <button onClick={submit} disabled={saving} style={{
                width:'100%',padding:'11px',borderRadius:9,
                background:saving?'#9A9A9A':pick==='absent'?'#991B1B':pick==='late'?'#D97706':'#065F46',
                color:'#fff',border:'none',fontSize:13,fontWeight:800,cursor:saving?'not-allowed':'pointer',
              }}>{saving?'Submitting...':'Mark myself as '+pick}</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Attendance stats + calendar ── */}
      <div style={{background:'#fff',border:'1px solid #E8E2D6',borderRadius:12,overflow:'hidden'}}>
        {/* Month nav + stats */}
        <div style={{padding:'16px 20px',borderBottom:'1px solid #E8E2D6',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button onClick={prevMonth} style={{background:'transparent',border:'1.5px solid #E8E2D6',borderRadius:7,padding:'5px 10px',cursor:'pointer',fontSize:14,fontWeight:700,color:'#564844'}}>‹</button>
            <span style={{fontWeight:800,fontSize:14,color:'#1A0F0E',minWidth:160,textAlign:'center'}}>{monthLabel}</span>
            <button onClick={nextMonth} style={{background:'transparent',border:'1.5px solid #E8E2D6',borderRadius:7,padding:'5px 10px',cursor:'pointer',fontSize:14,fontWeight:700,color:'#564844'}}>›</button>
          </div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {[{label:'Present',val:counts.present,color:'#065F46',bg:'#D1FAE5'},{label:'Late',val:counts.late,color:'#D97706',bg:'#FEF3C7'},{label:'Absent',val:counts.absent,color:'#991B1B',bg:'#FEE2E2'},{label:'Rate',val:pct!==null?pct+'%':'—',color:'#1A0F0E',bg:'#FBFAF5'}].map(s=>(
              <div key={s.label} style={{padding:'6px 14px',borderRadius:8,background:s.bg,textAlign:'center'}}>
                <div style={{fontSize:16,fontWeight:800,color:s.color}}>{s.val}</div>
                <div style={{fontSize:10,color:s.color,fontWeight:600,marginTop:1}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar grid */}
        <div style={{padding:'16px 20px'}}>
          {calLoad ? (
            <div style={{textAlign:'center',color:'#9A9A9A',padding:'30px 0',fontSize:13}}>Loading...</div>
          ) : error ? (
            <div style={{color:'#7D1025',fontSize:13}}>{error}</div>
          ) : (
            <>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:6}}>
                {DAY_LABELS.map(d=><div key={d} style={{textAlign:'center',fontSize:10.5,fontWeight:700,color:'#857973',padding:'4px 0',letterSpacing:'.06em'}}>{d}</div>)}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
                {calDays.map((d,i)=>{
                  if(!d) return <div key={'pad-'+i}/>
                  const key=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
                  const rec=byDateKey[key]
                  const isToday=d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear()
                  const st=rec?SS[rec.checkInStatus||rec.status]:null
                  return (
                    <div key={key} title={rec?`${st?.label||rec.status}${rec.reason?' — '+rec.reason:''}`:''} style={{
                      aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',
                      borderRadius:8,fontSize:12.5,fontWeight:isToday?800:500,
                      background:st?st.bg:isToday?'#FDF2F4':'#FBFAF5',
                      color:st?st.fg:isToday?'#8B1A2E':'#564844',
                      border:isToday?'2px solid #C9A030':'1px solid transparent',
                      cursor:rec?'help':'default',
                      position:'relative',
                    }}>
                      {d}
                      {rec&&<div style={{position:'absolute',bottom:3,left:'50%',transform:'translateX(-50%)',width:4,height:4,borderRadius:'50%',background:st?.fg||'#9A9A9A'}}/>}
                    </div>
                  )
                })}
              </div>
              <div style={{display:'flex',gap:12,marginTop:12,flexWrap:'wrap'}}>
                {Object.entries(SS).map(([k,s])=>(
                  <div key={k} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#857973'}}>
                    <div style={{width:10,height:10,borderRadius:2,background:s.bg,border:'1px solid '+s.fg+'40'}}/>
                    {s.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// StudentCheckInTab — self check-in for student portal
// ═══════════════════════════════════════════════════════════
function StudentCheckInTab({ user, toast }) {
  const today = new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
  const dayOfWeek = new Date().getDay()
  const isWeekend = dayOfWeek===0||dayOfWeek===6

  const [status,  setStatus]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [history, setHistory] = useState([])
  const [pick,    setPick]    = useState('present')
  const [lateTime,setLateTime]= useState('')
  const [reason,  setReason]  = useState('')

  const load = () => {
    setLoading(true)
    api.get('/checkin/today')
      .then(r=>setStatus(r.data?.data))
      .catch(()=>{})
      .finally(()=>setLoading(false))
    api.get('/checkin/history')
      .then(r=>setHistory(r.data?.data?.records||[]))
      .catch(()=>{})
  }

  useEffect(()=>{load()},[])

  const submit = async () => {
    if(pick==='late'&&!lateTime.trim()){toast?.error?.('Enter your arrival time.');return}
    if(pick==='absent'&&!reason.trim()){toast?.error?.('Enter a reason.');return}
    setSaving(true)
    try {
      await api.post('/checkin',{status:pick,lateTime,reason})
      toast?.ok?.('Check-in recorded.')
      load()
    } catch(e){toast?.error?.(e?.response?.data?.message||'Check-in failed.')}
    finally{setSaving(false)}
  }

  const fmtDate = d=>d?new Date(d).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}):'—'
  const fmtTime = d=>d?new Date(d).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'—'
  const SS = { present:{bg:'#D1FAE5',fg:'#065F46',label:'Present'}, late:{bg:'#FEF3C7',fg:'#D97706',label:'Late'}, absent:{bg:'#FEE2E2',fg:'#991B1B',label:'Absent'} }

  if(!loading&&status?.onBreak) return (
    <div style={{padding:'40px 20px',textAlign:'center'}}>
      <div style={{fontFamily:"'Instrument Serif',serif",fontSize:20,color:'#1A0F0E',marginBottom:8}}>You are on a break</div>
      <div style={{fontSize:13,color:'#857973',lineHeight:1.65}}>Your account is temporarily paused. Contact your DOS or admin to return.</div>
      {status.breakNote&&<div style={{fontSize:12.5,color:'#564844',background:'#FDFAF5',borderRadius:8,padding:'10px 14px',marginTop:12,display:'inline-block',fontStyle:'italic'}}>"{status.breakNote}"</div>}
    </div>
  )

  const alreadyIn = !loading&&status?.checkedIn
  const todaySS   = alreadyIn?SS[status.checkInStatus]||SS.present:null

  return (
    <div>
      <div style={{marginBottom:20}}>
        <div className="sec-tag">Daily attendance</div>
        <h2 className="serif" style={{fontSize:26,color:'var(--s900)',margin:'6px 0 4px'}}>Check In</h2>
        <div style={{fontSize:13,color:'#6B6B6B'}}>{today}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:20,alignItems:'start'}}>
        <div style={{background:'#fff',border:'1px solid #E8E2D6',borderRadius:12,overflow:'hidden'}}>
          <div style={{background:'linear-gradient(135deg,#8B1A2E,#5A0B1B)',padding:'22px 24px'}}>
            <div style={{fontSize:20,fontWeight:800,color:'#fff',marginBottom:4}}>
              Good {new Date().getHours()<12?'morning':new Date().getHours()<17?'afternoon':'evening'}, {user?.firstName}
            </div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.6)'}}>
              {alreadyIn?'You are checked in for today.':isWeekend?'No check-in on weekends.':'Please mark your attendance.'}
            </div>
          </div>
          <div style={{padding:'24px'}}>
            {loading?<div style={{textAlign:'center',color:'#9A9A9A',padding:'20px 0'}}>Loading...</div>
            :isWeekend?<div style={{textAlign:'center',color:'#9A9A9A',padding:'20px 0'}}>Enjoy your weekend!</div>
            :alreadyIn?(
              <div style={{textAlign:'center'}}>
                <div style={{width:68,height:68,borderRadius:'50%',background:todaySS.bg,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={todaySS.fg} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{fontSize:22,fontWeight:800,color:todaySS.fg,marginBottom:4}}>{todaySS.label}</div>
                <div style={{fontSize:13,color:'#857973'}}>Checked in at {fmtTime(status?.record?.checkInTime)}</div>
                {status?.checkInStatus==='late'&&<div style={{fontSize:13,color:'#D97706',marginTop:8}}>Arrival: {status.record?.lateTime}</div>}
                {status?.checkInStatus==='absent'&&<div style={{fontSize:13,color:'#991B1B',marginTop:8}}>{status.record?.reason}</div>}
              </div>
            ):(
              <>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:18}}>
                  {[{val:'present',label:'Present',bg:'#D1FAE5',fg:'#065F46',desc:'On time'},{val:'late',label:'Late',bg:'#FEF3C7',fg:'#D97706',desc:'Running late'},{val:'absent',label:'Absent',bg:'#FEE2E2',fg:'#991B1B',desc:'Not attending'}].map(opt=>(
                    <button key={opt.val} onClick={()=>{setPick(opt.val);if(opt.val!=='late')setLateTime('');if(opt.val!=='absent')setReason('')}}
                      style={{padding:'14px 10px',borderRadius:10,cursor:'pointer',textAlign:'center',border:'2px solid '+(pick===opt.val?opt.fg:'#E8E2D6'),background:pick===opt.val?opt.bg:'#fff'}}>
                      <div style={{fontSize:13,fontWeight:800,color:pick===opt.val?opt.fg:'#564844',marginBottom:3}}>{opt.label}</div>
                      <div style={{fontSize:11,color:pick===opt.val?opt.fg:'#9A9A9A'}}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
                {pick==='late'&&<div style={{marginBottom:14}}>
                  <label style={{fontSize:11,fontWeight:700,color:'#8B1A2E',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:5,display:'block'}}>Arrival time</label>
                  <input type="time" value={lateTime} onChange={e=>setLateTime(e.target.value)}
                    style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid #E8E2D6',fontSize:15,fontFamily:'inherit',boxSizing:'border-box'}}/>
                </div>}
                {pick==='absent'&&<div style={{marginBottom:14}}>
                  <label style={{fontSize:11,fontWeight:700,color:'#8B1A2E',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:5,display:'block'}}>Reason for absence</label>
                  <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3} placeholder="Please explain your absence..."
                    style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid #E8E2D6',fontSize:13,fontFamily:'inherit',resize:'vertical',boxSizing:'border-box'}}/>
                </div>}
                <button onClick={submit} disabled={saving}
                  style={{width:'100%',padding:'12px',borderRadius:9,background:saving?'#9A9A9A':pick==='absent'?'#991B1B':pick==='late'?'#D97706':'#065F46',color:'#fff',border:'none',fontSize:14,fontWeight:800,cursor:saving?'not-allowed':'pointer'}}>
                  {saving?'Submitting...':'Mark myself as '+pick}
                </button>
              </>
            )}
          </div>
        </div>

        {/* History */}
        <div style={{background:'#fff',border:'1px solid #E8E2D6',borderRadius:12,overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid #E8E2D6',fontWeight:800,fontSize:13,color:'#1A0F0E'}}>My attendance (30 days)</div>
          {history.length===0?<div style={{padding:24,textAlign:'center',color:'#9A9A9A',fontSize:13}}>No records yet.</div>:(
            <div style={{maxHeight:400,overflowY:'auto'}}>
              {[...history].sort((a,b)=>new Date(b.date)-new Date(a.date)).map((r,i)=>{
                const s=SS[r.checkInStatus||r.status]||{bg:'#F3F4F6',fg:'#6B7280',label:r.status||'—'}
                return(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 14px',borderBottom:'1px solid #F4EFEB'}}>
                    <div>
                      <div style={{fontSize:12.5,fontWeight:600,color:'#1A0F0E'}}>{fmtDate(r.date)}</div>
                      {(r.lateTime||r.reason)&&<div style={{fontSize:11,color:'#857973',marginTop:1}}>{r.lateTime?'Arrived: '+r.lateTime:r.reason}</div>}
                    </div>
                    <span style={{padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:700,background:s.bg,color:s.fg}}>{r.checkInStatus==='late'?'Late':s.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// RealTimetableTab
// ═══════════════════════════════════════════════════════════
// Backend-driven student timetable. Reads recurring weekly slots
// from /api/timetable/me where the student is in `assignedStudents`
// or matches the entry's audience curriculum + grade.
//
// View modes:
//   - week-grid: 7-column × time-row grid for this week's slots
//   - list:      chronological list grouped by day
//
// Click any slot to open the teacher's profile preview modal —
// shows display picture and basic info, NO contact details
// (students must use the Communication module to reach teachers).
// ═══════════════════════════════════════════════════════════


function QuizGameLauncher({ user, toast, setPage }) {
  const [active,   setActive]   = useState(false)
  const [config,   setConfig]   = useState({ subject:'', topic:'', subtopic:'' })
  const [subjects, setSubjects] = useState([])
  const [spine,    setSpine]    = useState([])       // topics for chosen subject
  const [spineLoading, setSpineLoading] = useState(false)

  useEffect(() => {
    const s = (user?.subjects||[]).filter(x=>typeof x==='string' && x.trim())
    const list = s.length > 0 ? s : ['Mathematics','Physics','Chemistry','Biology','English Language','Business Studies','Computer Science','Economics']
    setSubjects(list)
    setConfig(c=>({ ...c, subject:list[0]||'' }))
  }, [user])

  // Load spine topics whenever the subject changes
  useEffect(() => {
    if (!config.subject) { setSpine([]); return }
    setSpineLoading(true)
    api.get('/questions/spine', { params:{ subject:config.subject, curriculum:user?.curriculum||'' } })
      .then(r => setSpine(r.data?.data?.topics||[]))
      .catch(() => setSpine([]))
      .finally(() => setSpineLoading(false))
  }, [config.subject, user?.curriculum])

  // Coloured SVG icon per subject
  const SubjectIcon = ({ name, size=34 }) => {
    const P = (d, extra={}) => <path d={d} fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...extra}/>
    const key = (name||'').toLowerCase()
    let stroke='#7D1025', bg='#FDE7EC', body=null
    if (key.includes('math')) { stroke='#7C3AED'; bg='#EDE9FE'
      body=<g stroke={stroke}>{P('M4 4h16v16H4z')}{P('M8 9h8M8 15h4')}<circle cx="16" cy="15" r="1.4" fill={stroke} stroke="none"/></g> }
    else if (key.includes('physic')) { stroke='#2563EB'; bg='#DBEAFE'
      body=<g stroke={stroke}><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.6" fill={stroke} stroke="none"/></g> }
    else if (key.includes('chem')) { stroke='#059669'; bg='#D1FAE5'
      body=<g stroke={stroke}>{P('M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3')}{P('M7.5 15h9')}</g> }
    else if (key.includes('bio')) { stroke='#16A34A'; bg='#DCFCE7'
      body=<g stroke={stroke}>{P('M12 2c3 3 3 7 0 10c-3 3-3 7 0 10')}{P('M12 2c-3 3-3 7 0 10c3 3 3 7 0 10')}{P('M8.5 7h7M8.5 17h7M7.5 12h9')}</g> }
    else if (key.includes('english') || key.includes('literature')) { stroke='#D97706'; bg='#FEF3C7'
      body=<g stroke={stroke}>{P('M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z')}{P('M4 19.5A2.5 2.5 0 0 0 6.5 22H20')}{P('M9 7h7M9 11h5')}</g> }
    else if (key.includes('business') || key.includes('account') || key.includes('commerce')) { stroke='#0891B2'; bg='#CFFAFE'
      body=<g stroke={stroke}>{P('M4 20V10M10 20V4M16 20v-7M21 20H3')}<circle cx="16" cy="9" r="1.3" fill={stroke} stroke="none"/></g> }
    else if (key.includes('computer') || key.includes('ict')) { stroke='#4F46E5'; bg='#E0E7FF'
      body=<g stroke={stroke}>{P('M9 8l-4 4 4 4M15 8l4 4-4 4M13 5l-2 14')}</g> }
    else if (key.includes('econom')) { stroke='#B45309'; bg='#FDE68A'
      body=<g stroke={stroke}>{P('M3 17l5-5 4 3 6-7')}{P('M18 8h3v3')}</g> }
    else if (key.includes('geo')) { stroke='#0D9488'; bg='#CCFBF1'
      body=<g stroke={stroke}><circle cx="12" cy="12" r="9"/>{P('M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18')}</g> }
    else if (key.includes('hist')) { stroke='#9F1239'; bg='#FFE4E6'
      body=<g stroke={stroke}><circle cx="12" cy="12" r="9"/>{P('M12 7v5l3.5 2')}</g> }
    else { body=<g stroke={stroke}>{P('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z')}{P('M14 2v6h6M9 13h6M9 17h4')}</g> }
    return (
      <div style={{ width:size+22, height:size+22, borderRadius:14, background:bg, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' }}>
        <svg width={size} height={size} viewBox="0 0 24 24">{body}</svg>
      </div>
    )
  }

  if (active) return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, overflowY:'auto', background:TOKENS.cream }}>
      <QuizGame
        subject={config.subject}
        curriculum={user?.curriculum||''}
        topic={config.topic}
        subtopic={config.subtopic}
        grade={user?.gradeLevel||user?.grade||''}
        user={user}
        onClose={()=>setActive(false)}
      />
    </div>
  )

  const chosenTopic = spine.find(t=>t.topic===config.topic)

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div className="sec-tag">Student Game</div>
        <h2 className="serif" style={{ fontSize:26, color:TOKENS.ink, margin:'4px 0 6px' }}>
          Quiz <em style={{ fontStyle:'italic', color:TOKENS.crimson }}>Challenge</em>
        </h2>
        <div style={{ fontSize:13, color:TOKENS.s500 }}>
          Questions matched to your level{user?.gradeLevel?` (${user.gradeLevel})`:''} and your subject syllabus. Earn XP, collect badges, invite friends!
        </div>
      </div>

      {/* Subject cards with coloured SVG icons */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:14, marginBottom:24 }}>
        {subjects.map(sub => {
          const selected = config.subject === sub
          return (
            <button key={sub} onClick={()=>setConfig({ subject:sub, topic:'', subtopic:'' })} style={{
              padding:'18px 10px', borderRadius:14, border:`2px solid ${selected?TOKENS.crimson:TOKENS.s100}`,
              background:selected?'#FDE7EC':'#fff', cursor:'pointer', textAlign:'center', transition:'all .15s',
            }}>
              <SubjectIcon name={sub}/>
              <div style={{ fontSize:12.5, fontWeight:700, color:selected?TOKENS.crimson:TOKENS.ink, lineHeight:1.3, marginTop:10 }}>{sub}</div>
            </button>
          )
        })}
      </div>

      {/* Syllabus spine topic picker */}
      <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${TOKENS.s100}`, padding:'22px 26px', marginBottom:20 }}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.ink, marginBottom:4, textTransform:'uppercase', letterSpacing:'.06em' }}>
          {config.subject} — Choose a topic
        </div>
        <div style={{ fontSize:12, color:TOKENS.s400, marginBottom:14 }}>
          {spineLoading ? 'Loading your syllabus...' :
           spine.length ? 'From your subject syllabus — the same spine your lessons and live classes follow.' :
           'No syllabus spine loaded for this subject yet — the quiz will draw from all topics.'}
        </div>

        {spine.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
            <button onClick={()=>setConfig(c=>({...c, topic:'', subtopic:''}))} style={{
              padding:'8px 16px', borderRadius:99, fontSize:12.5, fontWeight:700, cursor:'pointer',
              border:`1.5px solid ${!config.topic?TOKENS.crimson:TOKENS.s100}`,
              background:!config.topic?TOKENS.crimson:'#fff', color:!config.topic?'#fff':TOKENS.s700,
            }}>All topics</button>
            {spine.map(t=>(
              <button key={t._id} onClick={()=>setConfig(c=>({...c, topic:t.topic, subtopic:''}))} style={{
                padding:'8px 16px', borderRadius:99, fontSize:12.5, fontWeight:600, cursor:'pointer',
                border:`1.5px solid ${config.topic===t.topic?TOKENS.crimson:TOKENS.s100}`,
                background:config.topic===t.topic?TOKENS.crimson:'#fff', color:config.topic===t.topic?'#fff':TOKENS.s700,
              }}>{t.code?t.code+' · ':''}{t.topic}</button>
            ))}
          </div>
        )}

        {chosenTopic && (chosenTopic.subtopics||[]).length > 0 && (
          <div style={{ borderTop:`1px solid ${TOKENS.s100}`, paddingTop:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:TOKENS.s500, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Narrow to a subtopic (optional)</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              <button onClick={()=>setConfig(c=>({...c, subtopic:''}))} style={{
                padding:'6px 12px', borderRadius:99, fontSize:11.5, fontWeight:600, cursor:'pointer',
                border:`1px solid ${!config.subtopic?TOKENS.gold:TOKENS.s100}`,
                background:!config.subtopic?TOKENS.goldPale:'#fff', color:TOKENS.s700,
              }}>Whole topic</button>
              {chosenTopic.subtopics.map((st,i)=>(
                <button key={i} onClick={()=>setConfig(c=>({...c, subtopic:st.name}))} style={{
                  padding:'6px 12px', borderRadius:99, fontSize:11.5, fontWeight:600, cursor:'pointer',
                  border:`1px solid ${config.subtopic===st.name?TOKENS.gold:TOKENS.s100}`,
                  background:config.subtopic===st.name?TOKENS.goldPale:'#fff', color:TOKENS.s700,
                }}>{st.name}</button>
              ))}
            </div>
          </div>
        )}

        <button onClick={()=>setActive(true)} disabled={!config.subject} style={{
          width:'100%', marginTop:18, padding:'16px', borderRadius:12,
          background:`linear-gradient(135deg,${TOKENS.crimson},${TOKENS.crimsonDeep})`,
          color:'#fff', border:'none', fontSize:16, fontWeight:800, cursor:'pointer', letterSpacing:'.02em',
        }}>
          Start {config.subject} Quiz{config.topic?` — ${config.topic}`:''}
        </button>
      </div>

      {/* Achievement teaser */}
      <div style={{ background:`linear-gradient(135deg,${TOKENS.accentAmber}15,${TOKENS.goldPale})`, borderRadius:14, border:`1.5px solid ${TOKENS.gold}40`, padding:'16px 20px', display:'flex', alignItems:'center', gap:16, cursor:'pointer' }}
        onClick={()=>setPage('achievements')}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={TOKENS.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21 1.18.54 2.03 2.03 2.03 4M18 2H6v7a6 6 0 0 0 12 0V2z"/>
        </svg>
        <div>
          <div style={{ fontSize:14, fontWeight:800, color:TOKENS.ink }}>View Your Achievements</div>
          <div style={{ fontSize:12, color:TOKENS.s500 }}>XP, badges, and the class leaderboard</div>
        </div>
        <div style={{ marginLeft:'auto', color:TOKENS.gold, fontWeight:800, fontSize:20 }}>→</div>
      </div>
    </div>
  )
}

function StudentRateTeacherTab({ user, toast }) {
  const [entries,  setEntries]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [teachers, setTeachers] = useState([]) // unique teachers from timetable

  useEffect(() => {
    api.get('/timetable/student')
      .then(r => {
        const ents = r.data?.data?.entries || r.data?.entries || []
        setEntries(ents)
        // Extract unique teachers
        const seen = {}
        ents.forEach(e => {
          if (e.teacherId && !seen[String(e.teacherId._id||e.teacherId)]) {
            seen[String(e.teacherId._id||e.teacherId)] = e.teacherId
          }
        })
        setTeachers(Object.values(seen))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding:'40px 0', textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Loading...</div>

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div className="sec-tag">Student Feedback</div>
        <h2 className="serif" style={{ fontSize:26, color:TOKENS.ink, margin:'4px 0 6px' }}>Rate My <em style={{ fontStyle:'italic', color:TOKENS.crimson }}>Teachers</em></h2>
        <div style={{ fontSize:13, color:TOKENS.s500 }}>Your feedback helps improve the quality of teaching at Smartious. Ratings are anonymous to teachers.</div>
      </div>
      {teachers.length === 0 ? (
        <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>No teachers assigned yet.</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
          {teachers.map(t => {
            const tid = t._id||t
            const tName = t.firstName ? t.firstName+' '+t.lastName : 'Teacher'
            const subjects = entries.filter(e=>String(e.teacherId?._id||e.teacherId)===String(tid)).map(e=>e.subject).filter(Boolean)
            const uniqueSubjects = [...new Set(subjects)]
            return (
              <div key={String(tid)} style={{ background:'#fff', border:`1px solid ${TOKENS.line}`, borderRadius:12, overflow:'hidden' }}>
                <div style={{ padding:'14px 18px', borderBottom:`1px solid ${TOKENS.s100}`, display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg,${TOKENS.crimson},${TOKENS.crimsonDeep})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ color:'#F0CC5A', fontSize:12, fontWeight:700 }}>{tName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:TOKENS.ink }}>{tName}</div>
                    <div style={{ fontSize:12, color:TOKENS.s500 }}>{uniqueSubjects.join(', ')||'Teacher'}</div>
                  </div>
                </div>
                <div style={{ padding:'14px 18px' }}>
                  <RateTeacherWidget teacherId={String(tid)} teacherName={tName} userRole="student" toast={toast}/>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


function RateTeacherWidget({ teacherId, teacherName, userRole, toast }) {
  const [score,   setScore]   = useState(0)
  const [hover,   setHover]   = useState(0)
  const [comment, setComment] = useState('')
  const [saving,  setSaving]  = useState(false)
  const [done,    setDone]    = useState(false)

  const submit = async () => {
    if (!score) { toast?.error?.('Select a star rating.'); return }
    setSaving(true)
    try {
      const r = await api.post('/ratings', { teacherId, score, comment })
      toast?.ok?.(r.data?.message||'Rating submitted!')
      setDone(true)
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setSaving(false) }
  }

  if (done) return (
    <div style={{ padding:'14px 18px', background:'#D1FAE5', borderRadius:10, textAlign:'center', fontSize:13, fontWeight:700, color:'#065F46' }}>
      ✓ Rating submitted for {teacherName}. Thank you!
    </div>
  )

  return (
    <div style={{ background:'#fff', border:'1px solid #E8E2D6', borderRadius:12, padding:'18px 20px' }}>
      <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900, marginBottom:10 }}>Rate {teacherName}</div>
      <div style={{ display:'flex', gap:4, marginBottom:12 }}>
        {[1,2,3,4,5].map(s=>(
          <svg key={s} width="28" height="28" viewBox="0 0 24 24"
            fill={s<=(hover||score)?'#C9A030':'#E8E2D6'}
            stroke={s<=(hover||score)?'#C9A030':'#CFC7C2'}
            strokeWidth="1.5" style={{ cursor:'pointer', transition:'fill .1s' }}
            onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)}
            onClick={()=>setScore(s)}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
        {score>0&&<span style={{ fontSize:13, fontWeight:700, color:TOKENS.s700, marginLeft:8, alignSelf:'center' }}>
          {['','Poor','Fair','Good','Very Good','Excellent'][score]}
        </span>}
      </div>
      <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={2}
        placeholder="Optional comment about this teacher..."
        style={{ width:'100%', padding:'8px 10px', borderRadius:7, border:`1.5px solid ${TOKENS.line}`, fontSize:13, fontFamily:'inherit', boxSizing:'border-box', resize:'vertical', color:TOKENS.ink, marginBottom:10 }}/>
      <button onClick={submit} disabled={saving||!score} style={{ background:saving||!score?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 20px', borderRadius:7, fontSize:13, fontWeight:700, cursor:saving||!score?'not-allowed':'pointer' }}>
        {saving?'Submitting...':'Submit rating'}
      </button>
    </div>
  )
}

function RealTimetableTab({ user, setPage, toast }) {
  const [entries,  setEntries]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [view,     setView]     = useState('grid')
  const [tick,     setTick]     = useState(0)
  const [teacherModal, setTeacherModal] = useState(null)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError(null)
    api.get('/timetable/me')
      .then(res => { if (!cancelled) setEntries(res.data?.data?.entries || []) })
      .catch(e => { if (!cancelled) { setError(e?.response?.data?.message || 'Failed to load.'); setEntries([]) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [user?._id])

  // ── Helpers ──
  const DAYS      = ['Mon','Tue','Wed','Thu','Fri']
  const DAYS_LONG = { Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday', Thu:'Thursday', Fri:'Friday' }
  const DAY_TYPE  = { Mon:'Lessons', Tue:'Lessons', Wed:'Lessons', Thu:'Lessons', Fri:'Assessment & Activities' }
  const FRI_COLOR = '#6D28D9'

  // School slots 09:00–15:00, lunch 13:00–14:00
  const SLOTS = [
    { label:'9 AM',  start:'09:00', end:'10:00' },
    { label:'10 AM', start:'10:00', end:'11:00' },
    { label:'11 AM', start:'11:00', end:'12:00' },
    { label:'12 PM', start:'12:00', end:'13:00' },
    { label:'Lunch', start:'13:00', end:'14:00', isBreak:true },
    { label:'2 PM',  start:'14:00', end:'15:00' },
  ]

  const toMins = hhmm => { if (!hhmm) return 0; const [h,m]=hhmm.split(':').map(Number); return h*60+m }
  const fmt    = hhmm => { if (!hhmm) return ''; const [h,m]=hhmm.split(':').map(Number); const mer=h>=12?'PM':'AM'; let hr=h%12; if(hr===0)hr=12; return `${hr}${m===0?'':':'+String(m).padStart(2,'0')} ${mer}` }
  const now    = new Date()
  const todayDayIdx = (now.getDay()+6)%7   // Mon=0
  const todayDay    = DAYS[todayDayIdx] || null
  const nowMins     = now.getHours()*60+now.getMinutes()
  const isLive  = e => e.dayOfWeek===todayDay && nowMins>=toMins(e.startTime) && nowMins<toMins(e.endTime)
  const isPast  = e => e.dayOfWeek===todayDay && nowMins>=toMins(e.endTime)

  // Colour per subject
  const SUBJ_COLS = {
    'Mathematics':'#8B1A2E','Maths':'#8B1A2E','Physics':'#1E3A8A','Chemistry':'#166534',
    'Biology':'#7C2D12','English':'#6B21A8','English Language':'#6B21A8','Literature':'#A21CAF',
    'History':'#92400E','Geography':'#0F766E','Computer Science':'#1F2937',
    'Business Studies':'#7E22CE','Economics':'#9F1239','French':'#1D4ED8','Kiswahili':'#065F46',
  }
  const colFor = s => SUBJ_COLS[s] || '#8B1A2E'

  // Group by day
  const byDay = {}
  DAYS.forEach(d => { byDay[d] = [] })
  entries.forEach(e => { if (byDay[e.dayOfWeek]) byDay[e.dayOfWeek].push(e) })
  DAYS.forEach(d => byDay[d].sort((a,b) => toMins(a.startTime)-toMins(b.startTime)))

  // Find entries that fit a grid slot
  const entryForSlot = (day, slot) => byDay[day].filter(e =>
    toMins(e.startTime) >= toMins(slot.start) && toMins(e.startTime) < toMins(slot.end)
  )

  // ── Premium student header (matches attached image) ──
  const StudentHeader = () => {
    const isFT  = /full.?time|centre|in.?person/i.test(user?.programme||user?.deliveryMode||'')
    const prog  = user?.programme || (isFT ? 'Full-Time Student' : 'Tuition Student')
    return (
      <div style={{
        background: 'linear-gradient(135deg, #7D1025 0%, #5A0B1B 60%, #3D0712 100%)',
        borderRadius: 16, overflow: 'hidden', marginBottom: 24,
        boxShadow: '0 8px 32px rgba(125,16,37,.25)',
      }}>
        <div style={{ display:'flex', alignItems:'stretch', gap:0 }}>
          {/* Photo section */}
          <div style={{ width:160, flexShrink:0, position:'relative', overflow:'hidden' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.firstName}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', minHeight:160 }}/>
            ) : (
              <div style={{ width:'100%', minHeight:160, background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            )}
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, transparent 70%, #7D1025)' }}/>
          </div>

          {/* Student info */}
          <div style={{ flex:1, padding:'22px 24px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'#C9A030', marginBottom:8 }}>
              Weekly Timetable
            </div>
            <h2 style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:28, fontWeight:400, color:'#fff', margin:'0 0 6px', letterSpacing:'-.3px' }}>
              {user?.firstName} {user?.lastName}
            </h2>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:10 }}>
              <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,.7)', textTransform:'uppercase', letterSpacing:'.08em' }}>
                {user?.curriculum || 'Cambridge IGCSE'}
              </span>
              {user?.gradeLevel && (
                <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.5)' }}>
                  {user.gradeLevel}
                </span>
              )}
              <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.5)', textTransform:'uppercase', letterSpacing:'.08em' }}>
                {prog}
              </span>
            </div>
            {/* Legend */}
            <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginTop:4 }}>
              {[
                { label:'Lesson', color:'#8B1A2E' },
                { label:'Assessment/Activities (Fri)', color:FRI_COLOR },
                { label:'Live now', color:'#C9A030' },
              ].map(l=>(
                <div key={l.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'rgba(255,255,255,.6)' }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:l.color, flexShrink:0 }}/>
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Today highlight box */}
          <div style={{ width:130, flexShrink:0, background:'rgba(0,0,0,.2)', padding:'20px 16px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', borderLeft:'1px solid rgba(255,255,255,.1)' }}>
            <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.5)', marginBottom:6 }}>Today</div>
            <div style={{ fontSize:20, fontWeight:800, color:todayDay?'#C9A030':'rgba(255,255,255,.3)' }}>
              {todayDay ? DAYS_LONG[todayDay] : 'Weekend'}
            </div>
            {todayDay && (
              <div style={{ fontSize:10.5, color:'rgba(255,255,255,.5)', marginTop:4 }}>
                {DAY_TYPE[todayDay]}
              </div>
            )}
            <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', marginTop:8 }}>
              {byDay[todayDay||'']?.length||0} class{byDay[todayDay||'']?.length===1?'':'es'} today
            </div>
            <div style={{ marginTop:10, fontSize:11, fontWeight:600, color:'rgba(255,255,255,.55)' }}>
              {fmt(now.getHours()+':'+String(now.getMinutes()).padStart(2,'0'))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div>
      <StudentHeader/>
      <div style={{ padding:'40px 0', textAlign:'center', color:'#9A9A9A', fontSize:13 }}>Loading timetable...</div>
    </div>
  )
  if (error) return (
    <div>
      <StudentHeader/>
      <div style={{ background:'#FDE7EC', border:'1px solid #F8B4C0', borderRadius:8, padding:'14px 18px', fontSize:13, color:'#7D1025' }}>
        Could not load timetable: {error}
      </div>
    </div>
  )

  return (
    <div>
      <StudentHeader/>

      {/* View switcher */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ fontSize:12.5, color:'#857973' }}>
          School hours: <strong style={{ color:'#1A0F0E' }}>9 AM – 3 PM</strong> &nbsp;·&nbsp; Lunch: <strong style={{ color:'#1A0F0E' }}>1 – 2 PM</strong> &nbsp;·&nbsp; Fri: <strong style={{ color:FRI_COLOR }}>Assessment / Activities</strong>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[['grid','Grid'],['list','List']].map(([k,l])=>(
            <button key={k} onClick={()=>setView(k)} style={{
              background:view===k?'#7D1025':'transparent', color:view===k?'#fff':'#564844',
              border:'1.5px solid '+(view===k?'#7D1025':'#E8E2D6'),
              padding:'6px 14px', borderRadius:6, fontSize:12.5, fontWeight:700, cursor:'pointer',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {entries.length===0 ? (
        <div style={{ padding:28, background:'#FBFAF5', border:'1px solid #E8E2D6', borderRadius:10, textAlign:'center' }}>
          <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:20, color:'#1A0F0E', marginBottom:6 }}>No timetable entries yet</div>
          <div style={{ fontSize:13, color:'#857973', lineHeight:1.6, maxWidth:460, margin:'0 auto' }}>
            Your teachers haven't added you to any class slots yet. Once they do, your weekly schedule will appear here.
          </div>
        </div>
      ) : view==='grid' ? (
        /* ── PREMIUM GRID VIEW ── */
        <div style={{ background:'#fff', border:'1px solid #E8E2D6', borderRadius:12, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,.06)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={{ width:60, padding:'10px 12px', background:'#1A0F0E', fontSize:10.5, fontWeight:700, color:'rgba(255,255,255,.5)', textAlign:'center', borderRight:'1px solid rgba(255,255,255,.1)' }}>Time</th>
                {DAYS.map(d=>(
                  <th key={d} style={{
                    padding:'10px 12px',
                    background: d==='Fri' ? '#3D0A4A' : '#1A0F0E',
                    fontSize:11, fontWeight:800, color:d===todayDay?'#C9A030':'rgba(255,255,255,.85)',
                    textAlign:'center', borderRight:'1px solid rgba(255,255,255,.08)',
                    letterSpacing:'.05em',
                  }}>
                    <div>{DAYS_LONG[d]}</div>
                    <div style={{ fontSize:9, fontWeight:500, color:d==='Fri'?'rgba(180,150,220,.7)':'rgba(255,255,255,.4)', marginTop:2 }}>{DAY_TYPE[d]}</div>
                    {d===todayDay&&<div style={{ fontSize:8, fontWeight:800, color:'#C9A030', marginTop:2, letterSpacing:'.1em' }}>TODAY</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((slot,si)=>(
                <tr key={slot.label} style={{ borderBottom:'1px solid #F4EFEB' }}>
                  {/* Time label */}
                  <td style={{
                    padding:'6px 10px', textAlign:'center', verticalAlign:'middle',
                    background: slot.isBreak?'#FAFAF8':'#FBFAF5',
                    borderRight:'1px solid #E8E2D6',
                    fontSize:11, fontWeight:700,
                    color: slot.isBreak?'#C9A030':'#857973',
                    whiteSpace:'nowrap',
                  }}>
                    {slot.isBreak ? (
                      <div>
                        <div style={{ fontSize:9.5, letterSpacing:'.08em', color:'#C9A030' }}>LUNCH</div>
                        <div style={{ fontSize:9, color:'#C9A030', opacity:.7 }}>1–2 PM</div>
                      </div>
                    ) : slot.label}
                  </td>
                  {/* Day cells */}
                  {DAYS.map(day=>{
                    if (slot.isBreak) return (
                      <td key={day} style={{ background:'#FFFBF0', borderRight:'1px solid #F4EFEB', padding:4, textAlign:'center' }}>
                        <div style={{ fontSize:9.5, color:'#D97706', fontWeight:600, letterSpacing:'.08em' }}>Lunch break</div>
                      </td>
                    )
                    const cellEntries = entryForSlot(day, slot)
                    const isFriday    = day==='Fri'
                    return (
                      <td key={day} style={{
                        padding:4, verticalAlign:'top',
                        background: isFriday ? '#FAF5FF' : day===todayDay?'#FDFAF5':'#fff',
                        borderRight:'1px solid #F4EFEB',
                        minWidth:120, minHeight:56,
                      }}>
                        {cellEntries.map(entry=>{
                          const live = isLive(entry)
                          const past = isPast(entry)
                          const col  = isFriday ? FRI_COLOR : colFor(entry.subject)
                          return (
                            <div key={entry._id} onClick={()=>setTeacherModal(entry.teacherId)}
                              style={{
                                background: live ? `linear-gradient(135deg,${col},${col}CC)` : col+'12',
                                border: `1.5px solid ${col}${live?'':isFriday?'50':'30'}`,
                                borderLeft: `3px solid ${col}`,
                                borderRadius:7, padding:'7px 9px', cursor:'pointer',
                                opacity:past?.6:1, marginBottom:3,
                                boxShadow: live?`0 3px 10px ${col}40`:'none',
                                transition:'transform .12s, box-shadow .12s',
                              }}
                              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow=`0 4px 12px ${col}30` }}
                              onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=live?`0 3px 10px ${col}40`:'none' }}>
                              {live&&(
                                <div style={{ fontSize:8.5, fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase', color:col, marginBottom:3, display:'flex', alignItems:'center', gap:3 }}>
                                  <span style={{ width:5, height:5, borderRadius:'50%', background:col, display:'inline-block', boxShadow:`0 0 4px ${col}` }}/>
                                  Live
                                </div>
                              )}
                              <div style={{ fontSize:12, fontWeight:700, color:live?'#fff':col, lineHeight:1.25, marginBottom:2 }}>{entry.subject}</div>
                              <div style={{ fontSize:10, color:live?'rgba(255,255,255,.8)':col+'99' }}>{fmt(entry.startTime)}–{fmt(entry.endTime)}</div>
                              {entry.teacherId&&(
                                <div style={{ fontSize:9.5, color:live?'rgba(255,255,255,.65)':col+'80', marginTop:2 }}>
                                  {entry.teacherId.firstName} {(entry.teacherId.lastName||'')[0]}.
                                </div>
                              )}
                              {entry.deliveryMode&&(
                                <div style={{ fontSize:9, color:live?'rgba(255,255,255,.5)':col+'60', marginTop:1, textTransform:'capitalize' }}>
                                  {entry.deliveryMode}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div>
          {DAYS.map((d,idx)=>{
            const items = byDay[d]
            if (!items.length) return null
            return (
              <div key={d} style={{ marginBottom:18 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, paddingBottom:6, borderBottom:'1px solid #F4EFEB' }}>
                  <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase', color:d===todayDay?'#7D1025':d==='Fri'?FRI_COLOR:'#564844' }}>
                    {DAYS_LONG[d]}
                  </div>
                  <div style={{ fontSize:10, color:'#9A9A9A' }}>— {DAY_TYPE[d]}</div>
                  {d===todayDay&&<span style={{ fontSize:9, fontWeight:800, letterSpacing:'.08em', color:'#C9A030', background:'#FDF7E2', padding:'2px 8px', borderRadius:99 }}>TODAY</span>}
                </div>
                {items.map(entry=>{
                  const live = isLive(entry)
                  const col  = d==='Fri'?FRI_COLOR:colFor(entry.subject)
                  return (
                    <div key={entry._id} onClick={()=>setTeacherModal(entry.teacherId)}
                      style={{ display:'flex', gap:12, alignItems:'center', padding:'10px 14px', background:live?col+'10':'#fff', border:`1px solid ${col}${live?'30':'20'}`, borderLeft:`3px solid ${col}`, borderRadius:8, marginBottom:7, cursor:'pointer' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:col, minWidth:90, whiteSpace:'nowrap' }}>
                        {fmt(entry.startTime)} – {fmt(entry.endTime)}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:'#1A0F0E' }}>{entry.subject}</div>
                        {entry.teacherId&&<div style={{ fontSize:11.5, color:'#857973', marginTop:1 }}>{entry.teacherId.firstName} {entry.teacherId.lastName}</div>}
                      </div>
                      {live&&<span style={{ fontSize:10, fontWeight:800, letterSpacing:'.08em', color:'#fff', background:col, padding:'3px 9px', borderRadius:99 }}>LIVE</span>}
                      <span style={{ fontSize:10, color:col+'80', textTransform:'capitalize' }}>{entry.deliveryMode}</span>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* Teacher preview modal */}
      {teacherModal&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>setTeacherModal(null)}>
          <div style={{ background:'#fff', borderRadius:14, padding:24, maxWidth:340, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:16 }}>
              {teacherModal.avatar?(
                <img src={teacherModal.avatar} alt="" style={{ width:56, height:56, borderRadius:'50%', objectFit:'cover' }}/>
              ):(
                <div style={{ width:56, height:56, borderRadius:'50%', background:'#F4EFEB', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#857973" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              )}
              <div>
                <div style={{ fontSize:15, fontWeight:800, color:'#1A0F0E' }}>{teacherModal.firstName} {teacherModal.lastName}</div>
                <div style={{ fontSize:12, color:'#857973', marginTop:2 }}>Teacher</div>
              </div>
            </div>
            <div style={{ fontSize:12.5, color:'#857973', lineHeight:1.6 }}>
              To contact this teacher, use the <strong>Communication</strong> module in your student portal.
            </div>
            <button onClick={()=>setTeacherModal(null)} style={{ width:'100%', marginTop:16, background:'#7D1025', color:'#fff', border:'none', padding:10, borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:13 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}


// ═══════════════════════════════════════════════════════════
// TeacherProfilePreview
// ═══════════════════════════════════════════════════════════
// Click-to-view card showing the teacher's display picture and
// basic info. Deliberately omits phone and email — students must
// route their communication through the Communication module
// (which goes through the school's email channel and is logged).
// ═══════════════════════════════════════════════════════════
function TeacherProfilePreview({ teacher, onClose }) {
  if (!teacher) return null

  const fullName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
  const initials = ((teacher.firstName?.[0] || '') + (teacher.lastName?.[0] || '')).toUpperCase()

  return (
    <div onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(20,15,10,0.65)', zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 14,
          maxWidth: 440, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,.35)',
          overflow: 'hidden',
        }}>
        {/* Crimson hero */}
        <div style={{
          background: 'linear-gradient(135deg, #8B1A2E 0%, #6B0F1E 100%)',
          padding: '26px 28px',
          color: '#fff',
          display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <div style={{
            width: 84, height: 84, borderRadius: '50%',
            background: teacher.avatar ? 'transparent' : 'rgba(240,204,90,.18)',
            border: '3px solid #F0CC5A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#F0CC5A',
            fontSize: 30, fontWeight: 700,
            fontFamily: "'Instrument Serif', serif",
            flexShrink: 0, overflow: 'hidden',
          }}>
            {teacher.avatar
              ? <img src={teacher.avatar} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              : (initials || 'T')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 22, fontWeight: 400, lineHeight: 1.15,
            }}>{fullName || 'Teacher'}</div>
            {teacher.jobTitle && (
              <div style={{
                fontSize: 11.5, fontWeight: 700,
                letterSpacing: '.08em', textTransform: 'uppercase',
                color: '#F0CC5A', marginTop: 4,
              }}>{teacher.jobTitle}</div>
            )}
            {!teacher.jobTitle && teacher.role && (
              <div style={{
                fontSize: 11.5, fontWeight: 700,
                letterSpacing: '.08em', textTransform: 'uppercase',
                color: '#F0CC5A', marginTop: 4,
                opacity: .85,
              }}>{teacher.role}</div>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 28px' }}>
          {teacher.bio && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 10, fontWeight: 800, color: '#7D1025',
                letterSpacing: '.12em', textTransform: 'uppercase',
                marginBottom: 6,
              }}>About</div>
              <div style={{ fontSize: 13.5, color: '#564844', lineHeight: 1.55 }}>
                {teacher.bio}
              </div>
            </div>
          )}

          {Array.isArray(teacher.qualifications) && teacher.qualifications.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 10, fontWeight: 800, color: '#7D1025',
                letterSpacing: '.12em', textTransform: 'uppercase',
                marginBottom: 6,
              }}>Qualifications</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {teacher.qualifications.map((q, i) => (
                  <span key={i} style={{
                    fontSize: 11, fontWeight: 600,
                    color: '#7D5A0F',
                    background: '#FDF7E2',
                    border: '1px solid #E8D58F',
                    padding: '4px 10px', borderRadius: 99,
                  }}>{q}</span>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(teacher.specializations) && teacher.specializations.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 10, fontWeight: 800, color: '#7D1025',
                letterSpacing: '.12em', textTransform: 'uppercase',
                marginBottom: 6,
              }}>Specialisations</div>
              <div style={{ fontSize: 12.5, color: '#564844' }}>
                {teacher.specializations.join(' · ')}
              </div>
            </div>
          )}

          {typeof teacher.yearsOfExperience === 'number' && teacher.yearsOfExperience > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 10, fontWeight: 800, color: '#7D1025',
                letterSpacing: '.12em', textTransform: 'uppercase',
                marginBottom: 6,
              }}>Experience</div>
              <div style={{ fontSize: 12.5, color: '#564844' }}>
                {teacher.yearsOfExperience} {teacher.yearsOfExperience === 1 ? 'year' : 'years'} of teaching
              </div>
            </div>
          )}

          {/* Contact note — explicitly tells the student where to send messages */}
          <div style={{
            background: '#FBFAF5',
            border: '1px solid #E8E2D6',
            borderRadius: 7,
            padding: '10px 12px',
            fontSize: 11.5, color: '#857973', lineHeight: 1.5,
            marginBottom: 14,
          }}>
            To message {teacher.firstName || 'this teacher'}, use the
            <strong style={{ color: '#1A0F0E' }}> Communication </strong>
            module from the sidebar. All messages go through the school's
            email channel.
          </div>

          <button onClick={onClose}
            style={{
              background: '#7D1025', color: '#fff', border: 'none',
              padding: '9px 20px', borderRadius: 7,
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              width: '100%',
            }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
