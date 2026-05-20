import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useStore, useToast, useAuth, api } from '../../../context/ctx.jsx'
import Modal from '../../../components/ui/Modal.jsx'

// ═══════════════════════════════════════════════════════════
// SMARTIOUS ADMIN DASHBOARD — PREMIUM REDESIGN
// ═══════════════════════════════════════════════════════════
// Design language: Apple Numbers / Calendar — warm, refined, generous whitespace
// Brand: Crimson #7D1025, Gold #C9A030, Cream #FBFAF5
// Module accent colors layered on top of brand
// Illustrated SVG icons for each module category
// Hybrid navigation: top nav + collapsible left rail + tile grid landings

// ──────────────────────────────────────────────────────
// DESIGN TOKENS — premium typography, spacing, accents
// ──────────────────────────────────────────────────────
const TOKENS = {
  // Brand
  crimson: '#7D1025',
  crimsonDeep: '#5A0B1B',
  crimsonLight: '#A51C2E',
  gold: '#C9A030',
  goldLight: '#F0CC5A',
  goldPale: '#FBF6E3',
  cream: '#FBFAF5',
  // Module accents (warm, refined Apple-style)
  accentTeal: '#0F766E',
  accentEmerald: '#15803D',
  accentNavy: '#1E3A8A',
  accentAmber: '#B45309',
  accentPurple: '#6B21A8',
  accentRose: '#BE123C',
  accentSlate: '#475569',
  accentOcean: '#0369A1',
  // Neutrals
  ink: '#1A0F0E',
  s900: '#231715',
  s700: '#564844',
  s500: '#857973',
  s400: '#A89E99',
  s300: '#CFC7C2',
  s200: '#E8E1DC',
  s100: '#F4EFEB',
  s50: '#FAF7F4',
  white: '#FFFFFF',
  // Spacing scale (premium = generous)
  spacing: { xs: 4, sm: 8, md: 14, lg: 22, xl: 32, xxl: 48 },
}

// ──────────────────────────────────────────────────────
// MODULE CATALOG — defines each module's identity
// ──────────────────────────────────────────────────────
const MODULES = {
  dashboard:   { label: 'Overview',     accent: TOKENS.crimson,     icon: 'home' },
  analytics:   { label: 'Analytics',    accent: TOKENS.accentNavy,  icon: 'chart' },
  users:       { label: 'Users',        accent: TOKENS.crimson,     icon: 'users' },
  teachers:    { label: 'Teachers',     accent: TOKENS.accentTeal,  icon: 'teacher' },
  allocations: { label: 'Manage Students',  accent: TOKENS.accentAmber, icon: 'allocations' },
  communication: { label: 'Communication', accent: TOKENS.crimson, icon: 'mail' },
  frontdesk:   { label: 'Front Desk',   accent: TOKENS.accentAmber, icon: 'frontdesk' },
  payroll:     { label: 'Payroll',      accent: TOKENS.accentEmerald, icon: 'payroll' },
  leave:       { label: 'Leave',        accent: TOKENS.accentSlate, icon: 'leave' },
  programmes:  { label: 'Programmes',   accent: TOKENS.accentPurple, icon: 'programmes' },
  documents:   { label: 'Documents',    accent: TOKENS.gold,        icon: 'documents' },
  livelessons: { label: 'Live Classes', accent: TOKENS.accentRose,  icon: 'live' },
  grouprooms:  { label: 'Group Rooms',  accent: TOKENS.accentOcean, icon: 'rooms' },
  curriculum:  { label: 'Curriculum',   accent: TOKENS.gold,        icon: 'curriculum' },
  billing:     { label: 'Billing',      accent: TOKENS.accentEmerald, icon: 'billing' },
  website:     { label: 'Website',      accent: TOKENS.accentNavy,  icon: 'website' },
  settings:    { label: 'Settings',     accent: TOKENS.s500,        icon: 'settings' },
  ai:          { label: 'Mshauri AI',   accent: TOKENS.crimson,     icon: 'ai' },
}

// ──────────────────────────────────────────────────────
// ILLUSTRATED MODULE ICONS — inline SVG with brand colors
// Each icon is 64x64, designed to feel warm/refined
// ──────────────────────────────────────────────────────
function ModuleIcon({ kind, size = 64, accent = TOKENS.crimson }) {
  const ink = TOKENS.s900
  const cream = TOKENS.cream
  const gold = TOKENS.gold

  const icons = {
    home: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <path d="M14 30 L32 14 L50 30 L50 48 Q50 50 48 50 L36 50 L36 38 L28 38 L28 50 L16 50 Q14 50 14 48 Z" fill={accent} opacity="0.18"/>
        <path d="M14 30 L32 14 L50 30 L50 48 Q50 50 48 50 L36 50 L36 38 L28 38 L28 50 L16 50 Q14 50 14 48 Z" stroke={accent} strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
        <circle cx="44" cy="22" r="3" fill={gold}/>
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <rect x="14" y="38" width="8" height="14" rx="1.5" fill={accent} opacity="0.3"/>
        <rect x="26" y="28" width="8" height="24" rx="1.5" fill={accent}/>
        <rect x="38" y="20" width="8" height="32" rx="1.5" fill={accent} opacity="0.6"/>
        <path d="M14 24 Q24 16 32 22 T50 14" stroke={gold} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <circle cx="50" cy="14" r="3" fill={gold}/>
      </svg>
    ),
    users: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <circle cx="24" cy="26" r="7" fill={accent} opacity="0.25"/>
        <circle cx="24" cy="26" r="7" stroke={accent} strokeWidth="2" fill="none"/>
        <path d="M12 50 Q12 38 24 38 Q36 38 36 50" stroke={accent} strokeWidth="2.5" fill={accent} fillOpacity="0.15" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="42" cy="22" r="5" fill={gold} opacity="0.3"/>
        <circle cx="42" cy="22" r="5" stroke={gold} strokeWidth="2" fill="none"/>
        <path d="M34 44 Q34 36 42 36 Q50 36 50 44" stroke={gold} strokeWidth="2" fill={gold} fillOpacity="0.15" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    teacher: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <circle cx="32" cy="22" r="8" fill={accent} opacity="0.2"/>
        <circle cx="32" cy="22" r="8" stroke={accent} strokeWidth="2.5" fill="none"/>
        <path d="M18 52 Q18 38 32 38 Q46 38 46 52" stroke={accent} strokeWidth="2.5" fill={accent} fillOpacity="0.12" strokeLinecap="round"/>
        <rect x="22" y="10" width="20" height="6" rx="1" fill={ink} opacity="0.85"/>
        <rect x="20" y="14" width="24" height="2" fill={ink} opacity="0.85"/>
        <line x1="42" y1="14" x2="46" y2="22" stroke={gold} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="46" cy="22" r="2" fill={gold}/>
      </svg>
    ),
    allocations: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <circle cx="18" cy="20" r="4" fill={accent}/>
        <circle cx="18" cy="32" r="4" fill={accent} opacity="0.7"/>
        <circle cx="18" cy="44" r="4" fill={accent} opacity="0.4"/>
        <rect x="40" y="14" width="14" height="14" rx="2" fill={gold} opacity="0.25"/>
        <rect x="40" y="14" width="14" height="14" rx="2" stroke={gold} strokeWidth="2" fill="none"/>
        <rect x="40" y="36" width="14" height="14" rx="2" fill={accent} opacity="0.2"/>
        <rect x="40" y="36" width="14" height="14" rx="2" stroke={accent} strokeWidth="2" fill="none"/>
        <path d="M22 20 L40 21" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
        <path d="M22 32 Q30 32 40 43" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.7" fill="none"/>
        <path d="M22 44 L40 43" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
    payroll: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <rect x="12" y="18" width="40" height="28" rx="3" fill={accent} opacity="0.15"/>
        <rect x="12" y="18" width="40" height="28" rx="3" stroke={accent} strokeWidth="2.5" fill="none"/>
        <circle cx="32" cy="32" r="7" fill={gold} opacity="0.3"/>
        <circle cx="32" cy="32" r="7" stroke={gold} strokeWidth="2" fill="none"/>
        <text x="32" y="36" textAnchor="middle" fontSize="11" fontWeight="800" fill={accent} fontFamily="system-ui">$</text>
        <circle cx="18" cy="24" r="2" fill={accent}/>
        <circle cx="46" cy="40" r="2" fill={accent} opacity="0.6"/>
      </svg>
    ),
    leave: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <rect x="12" y="16" width="40" height="36" rx="3" fill={cream} stroke={accent} strokeWidth="2.5"/>
        <rect x="12" y="16" width="40" height="10" rx="3" fill={accent} opacity="0.7"/>
        <line x1="20" y1="10" x2="20" y2="20" stroke={ink} strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="44" y1="10" x2="44" y2="20" stroke={ink} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="32" cy="38" r="6" fill={gold} opacity="0.3"/>
        <path d="M28 38 L31 41 L36 35" stroke={gold} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    programmes: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <path d="M16 22 L32 14 L48 22 L48 38 Q48 48 32 54 Q16 48 16 38 Z" fill={accent} opacity="0.15"/>
        <path d="M16 22 L32 14 L48 22 L48 38 Q48 48 32 54 Q16 48 16 38 Z" stroke={accent} strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
        <path d="M22 30 L32 24 L42 30" stroke={gold} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="32" cy="36" r="3" fill={gold}/>
      </svg>
    ),
    live: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <rect x="12" y="20" width="32" height="22" rx="3" fill={accent} opacity="0.18"/>
        <rect x="12" y="20" width="32" height="22" rx="3" stroke={accent} strokeWidth="2.5" fill="none"/>
        <path d="M44 26 L52 22 L52 40 L44 36 Z" fill={accent} opacity="0.18" stroke={accent} strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx="22" cy="31" r="4" fill={gold} opacity="0.85"/>
        <circle cx="22" cy="31" r="6" stroke={gold} strokeWidth="2" fill="none" opacity="0.4"/>
        <text x="32" y="50" textAnchor="middle" fontSize="6" fontWeight="800" fill={accent} fontFamily="system-ui">LIVE</text>
      </svg>
    ),
    rooms: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <rect x="14" y="14" width="16" height="16" rx="2" fill={accent} opacity="0.25"/>
        <rect x="14" y="14" width="16" height="16" rx="2" stroke={accent} strokeWidth="2" fill="none"/>
        <rect x="34" y="14" width="16" height="16" rx="2" fill={gold} opacity="0.25"/>
        <rect x="34" y="14" width="16" height="16" rx="2" stroke={gold} strokeWidth="2" fill="none"/>
        <rect x="14" y="34" width="16" height="16" rx="2" fill={accent} opacity="0.45"/>
        <rect x="14" y="34" width="16" height="16" rx="2" stroke={accent} strokeWidth="2" fill="none"/>
        <rect x="34" y="34" width="16" height="16" rx="2" fill={accent} opacity="0.18"/>
        <rect x="34" y="34" width="16" height="16" rx="2" stroke={accent} strokeWidth="2" fill="none"/>
      </svg>
    ),
    curriculum: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.1"/>
        <path d="M14 18 Q14 16 16 16 L30 16 L32 20 L30 24 L16 24 Q14 24 14 22 Z" fill={accent} opacity="0.22"/>
        <path d="M14 18 Q14 16 16 16 L30 16 L32 20 L30 24 L16 24 Q14 24 14 22 Z" stroke={accent} strokeWidth="2" fill="none" strokeLinejoin="round"/>
        <path d="M50 18 Q50 16 48 16 L34 16 L32 20 L34 24 L48 24 Q50 24 50 22 Z" fill={accent} opacity="0.4"/>
        <path d="M50 18 Q50 16 48 16 L34 16 L32 20 L34 24 L48 24 Q50 24 50 22 Z" stroke={accent} strokeWidth="2" fill="none" strokeLinejoin="round"/>
        <path d="M14 32 Q14 30 16 30 L48 30 Q50 30 50 32 L50 48 Q50 50 48 50 L16 50 Q14 50 14 48 Z" fill={cream} stroke={accent} strokeWidth="2" strokeLinejoin="round"/>
        <line x1="20" y1="38" x2="44" y2="38" stroke={ink} strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
        <line x1="20" y1="42" x2="40" y2="42" stroke={ink} strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
        <line x1="20" y1="46" x2="36" y2="46" stroke={ink} strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
      </svg>
    ),
    billing: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <rect x="16" y="14" width="32" height="40" rx="3" fill={cream} stroke={accent} strokeWidth="2.5"/>
        <line x1="22" y1="22" x2="42" y2="22" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
        <line x1="22" y1="28" x2="42" y2="28" stroke={ink} strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
        <line x1="22" y1="34" x2="38" y2="34" stroke={ink} strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
        <line x1="22" y1="40" x2="42" y2="40" stroke={ink} strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
        <circle cx="38" cy="48" r="5" fill={gold} opacity="0.3"/>
        <text x="38" y="52" textAnchor="middle" fontSize="9" fontWeight="800" fill={gold} fontFamily="system-ui">$</text>
      </svg>
    ),
    website: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <circle cx="32" cy="32" r="18" fill={accent} opacity="0.15"/>
        <circle cx="32" cy="32" r="18" stroke={accent} strokeWidth="2.5" fill="none"/>
        <ellipse cx="32" cy="32" rx="9" ry="18" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.5"/>
        <line x1="14" y1="32" x2="50" y2="32" stroke={accent} strokeWidth="1.5" opacity="0.5"/>
        <circle cx="32" cy="32" r="3" fill={gold}/>
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <path d="M32 14 L36 22 L44 22 L40 30 L44 38 L36 38 L32 46 L28 38 L20 38 L24 30 L20 22 L28 22 Z" fill={accent} opacity="0.2"/>
        <circle cx="32" cy="30" r="14" stroke={accent} strokeWidth="2.5" fill={cream}/>
        <circle cx="32" cy="30" r="6" fill={accent}/>
        <circle cx="32" cy="30" r="6" stroke={gold} strokeWidth="1.5" fill="none"/>
      </svg>
    ),
    ai: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <path d="M32 14 L40 22 L48 22 L48 30 L52 32 L48 34 L48 42 L40 42 L32 50 L24 42 L16 42 L16 34 L12 32 L16 30 L16 22 L24 22 Z" fill={accent} opacity="0.18"/>
        <circle cx="32" cy="32" r="10" fill={accent}/>
        <circle cx="29" cy="30" r="1.5" fill={gold}/>
        <circle cx="35" cy="30" r="1.5" fill={gold}/>
        <path d="M28 35 Q32 38 36 35" stroke={gold} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <circle cx="48" cy="22" r="2" fill={gold}/>
        <circle cx="16" cy="42" r="2" fill={gold}/>
      </svg>
    ),
    mail: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <rect x="14" y="20" width="36" height="24" rx="3" fill={accent} opacity="0.18"/>
        <rect x="14" y="20" width="36" height="24" rx="3" stroke={accent} strokeWidth="2.5" fill="none"/>
        <path d="M14 23 L32 36 L50 23" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="48" cy="20" r="3" fill={gold}/>
      </svg>
    ),
    frontdesk: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <path d="M14 42 V30 a18 18 0 0 1 36 0 V42" fill={accent} opacity="0.18"/>
        <path d="M14 42 V30 a18 18 0 0 1 36 0 V42" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <rect x="10" y="42" width="44" height="8" rx="2" stroke={accent} strokeWidth="2.5" fill="none"/>
        <circle cx="32" cy="26" r="5" fill={gold}/>
      </svg>
    ),
    documents: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <circle cx="32" cy="32" r="30" fill={accent} opacity="0.08"/>
        <path d="M20 12 h16 l10 10 v30 a2 2 0 0 1-2 2 H20 a2 2 0 0 1-2-2 V14 a2 2 0 0 1 2-2 Z" fill={accent} opacity="0.18"/>
        <path d="M20 12 h16 l10 10 v30 a2 2 0 0 1-2 2 H20 a2 2 0 0 1-2-2 V14 a2 2 0 0 1 2-2 Z" stroke={accent} strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
        <path d="M36 12 v10 h10" stroke={accent} strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
        <line x1="25" y1="34" x2="39" y2="34" stroke={accent} strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="25" y1="42" x2="39" y2="42" stroke={accent} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="44" cy="46" r="4" fill={gold}/>
      </svg>
    ),
  }
  return icons[kind] || icons.home
}

// ──────────────────────────────────────────────────────
// SHARED HELPERS
// ──────────────────────────────────────────────────────
const Av = ({ init = '?', col = '#7D1025', size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: col, color: '#FBFAF5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.4, fontWeight: 700,
    fontFamily: "system-ui, sans-serif",
    flexShrink: 0,
  }}>{init}</div>
)

const avColor = (name) => {
  const tokens = ['#7D1025', '#A51C2E', '#C9A030', '#15803D', '#7C2D12', '#1E3A8A']
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i)
  return tokens[Math.abs(hash) % tokens.length]
}

const initials = (firstName = '', lastName = '') => {
  const a = (firstName[0] || '?').toUpperCase()
  const b = (lastName[0] || '').toUpperCase()
  return a + b
}

const fmtKsh = (n) => 'KSh ' + Math.round(n || 0).toLocaleString('en-KE')

const fmtDate = (d) => {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const greetingText = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const DEFAULT_USER_FORM = {
  firstName: '', lastName: '', email: '', phone: '', role: 'student',
  programme: 'Homeschool', deliveryMode: 'Virtual',
  curriculum: '', grade: '', plan: 'Basic',
  subjects: [], teachingSpecialties: [],
  bio: '', linkedStudents: [],
  _id: null,
}
const resetForm = () => ({ ...DEFAULT_USER_FORM })

// ──────────────────────────────────────────────────────
// REUSABLE PRIMITIVES — premium feel
// ──────────────────────────────────────────────────────

// Card with refined shadow and warm border
function PCard({ children, accent, padding = 22, style = {} }) {
  return (
    <div style={{
      background: TOKENS.white,
      borderRadius: 16,
      padding,
      border: '1px solid ' + TOKENS.s100,
      boxShadow: '0 1px 3px rgba(35,23,21,.04), 0 4px 12px rgba(35,23,21,.03)',
      ...style,
    }}>
      {accent && (
        <div style={{ width: 36, height: 3, background: accent, borderRadius: 2, marginBottom: 14 }}/>
      )}
      {children}
    </div>
  )
}

// Section heading with subtitle (Apple Calendar style)
function PSection({ tag, title, em, sub, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
      <div>
        {tag && (
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '.16em',
            textTransform: 'uppercase', color: TOKENS.s500, marginBottom: 8,
          }}>{tag}</div>
        )}
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 32, fontWeight: 400, color: TOKENS.s900,
          margin: 0, lineHeight: 1.1,
          letterSpacing: '-.01em',
        }}>
          {title} {em && <em style={{ color: TOKENS.crimson, fontWeight: 400 }}>{em}</em>}
        </h2>
        {sub && (
          <p style={{ fontSize: 14, color: TOKENS.s500, marginTop: 6, lineHeight: 1.5 }}>{sub}</p>
        )}
      </div>
      {action}
    </div>
  )
}

// Tile-grid landing entry
function PTile({ kind, title, sub, accent, onClick, badge }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: TOKENS.white,
        borderRadius: 18,
        padding: '24px 22px',
        border: '1px solid ' + (hover ? accent + '40' : TOKENS.s100),
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
        boxShadow: hover
          ? '0 8px 32px ' + accent + '18, 0 2px 8px rgba(35,23,21,.04)'
          : '0 1px 3px rgba(35,23,21,.04)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 140, height: 140, borderRadius: '50%',
        background: accent, opacity: hover ? 0.06 : 0.03,
        transition: 'opacity 0.22s',
        pointerEvents: 'none',
      }}/>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative' }}>
        <div style={{ flexShrink: 0 }}>
          <ModuleIcon kind={kind} size={56} accent={accent}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <h3 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 19, fontWeight: 600,
              color: TOKENS.s900, margin: 0, lineHeight: 1.2,
            }}>{title}</h3>
            {badge !== undefined && badge > 0 && (
              <span style={{
                background: accent, color: TOKENS.white,
                fontSize: 11, fontWeight: 800,
                padding: '3px 8px', borderRadius: 99, letterSpacing: '.04em',
                minWidth: 22, textAlign: 'center',
              }}>{badge}</span>
            )}
          </div>
          <p style={{ fontSize: 13, color: TOKENS.s500, margin: 0, lineHeight: 1.5 }}>{sub}</p>
        </div>
      </div>
    </div>
  )
}

// KPI card with refined typography
function PKpi({ label, value, delta, accent = TOKENS.crimson, deltaColor }) {
  return (
    <div style={{
      background: TOKENS.white,
      borderRadius: 14,
      padding: '18px 20px',
      border: '1px solid ' + TOKENS.s100,
      flex: 1,
      minWidth: 160,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: TOKENS.s500, marginBottom: 8 }}>{label}</div>
      <div style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 30, fontWeight: 500,
        color: TOKENS.s900, lineHeight: 1, marginBottom: 4,
        letterSpacing: '-.01em',
      }}>{value}</div>
      {delta && (
        <div style={{ fontSize: 12, color: deltaColor || TOKENS.s500, fontWeight: 500 }}>{delta}</div>
      )}
    </div>
  )
}

function PlanBadge({ p }) {
  const styles = {
    'Basic':      { bg: TOKENS.s50, col: TOKENS.crimson, bd: TOKENS.s200 },
    'Premium':    { bg: TOKENS.goldPale, col: '#8E6B1A', bd: TOKENS.goldLight },
    'IGCSE Pack': { bg: '#FCE4E8', col: TOKENS.crimson, bd: '#F8C5CD' },
    'Staff':      { bg: '#DCFCE7', col: TOKENS.accentEmerald, bd: '#86EFAC' },
  }
  const s = styles[p] || styles['Basic']
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px',
      background: s.bg, color: s.col, border: '1px solid ' + s.bd,
      borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: '.02em',
    }}>{p}</span>
  )
}

// ──────────────────────────────────────────────────────
// HYBRID NAVIGATION — top bar + collapsible left rail
// ──────────────────────────────────────────────────────
function PNavigation({ page, setPage, adminFirst, onLogout }) {
  const [railOpen, setRailOpen] = useState(true)

  // Group modules into nav sections
  const SECTIONS = [
    { label: 'Overview', items: ['dashboard', 'analytics'] },
    { label: 'People', items: ['users', 'teachers', 'allocations', 'communication'] },
    { label: 'Operations', items: ['frontdesk', 'documents', 'payroll', 'leave', 'programmes'] },
    { label: 'Teaching', items: ['livelessons', 'grouprooms', 'curriculum'] },
    { label: 'System', items: ['billing', 'website', 'settings', 'ai'] },
  ]

  const currentMod = MODULES[page] || MODULES.dashboard

  return (
    <>
      {/* TOP NAV BAR */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid ' + TOKENS.s100,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '12px 28px', maxWidth: 1600, margin: '0 auto',
        }}>
          {/* Sidebar toggle */}
          <button onClick={() => setRailOpen(v => !v)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 8, borderRadius: 8, color: TOKENS.s700,
            display: 'flex', alignItems: 'center',
          }} title={railOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, ' + TOKENS.crimson + ' 0%, ' + TOKENS.crimsonDeep + ' 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px ' + TOKENS.crimson + '40',
            }}>
              <span style={{ color: TOKENS.goldLight, fontSize: 16, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>S</span>
            </div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 20, fontWeight: 600, color: TOKENS.s900,
              letterSpacing: '-.01em',
            }}>
              Smart<em style={{ color: TOKENS.gold, fontStyle: 'italic', fontWeight: 500 }}>ious</em>
            </div>
          </div>

          {/* Current module breadcrumb */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 99,
            background: currentMod.accent + '10',
            border: '1px solid ' + currentMod.accent + '20',
          }}>
            <ModuleIcon kind={currentMod.icon} size={20} accent={currentMod.accent}/>
            <span style={{ fontSize: 13, fontWeight: 600, color: currentMod.accent }}>
              {currentMod.label}
            </span>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }}/>

          {/* Right: admin info + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: TOKENS.s900 }}>{adminFirst}</div>
              <div style={{ fontSize: 10, color: TOKENS.s500, letterSpacing: '.06em', textTransform: 'uppercase' }}>Administrator</div>
            </div>
            <button onClick={onLogout} title="Sign out" style={{
              width: 36, height: 36, borderRadius: 10,
              background: TOKENS.s50, border: '1px solid ' + TOKENS.s200,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: TOKENS.s700,
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* SIDE RAIL */}
      <div style={{
        position: 'fixed', top: 60, left: 0, bottom: 0,
        width: railOpen ? 240 : 0,
        background: TOKENS.cream,
        borderRight: railOpen ? '1px solid ' + TOKENS.s100 : 'none',
        overflow: 'hidden',
        transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
        zIndex: 40,
      }}>
        <div style={{ width: 240, padding: '20px 12px', overflowY: 'auto', height: '100%' }}>
          {SECTIONS.map(section => (
            <div key={section.label} style={{ marginBottom: 18 }}>
              <div style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '.14em',
                textTransform: 'uppercase', color: TOKENS.s400,
                padding: '0 12px', marginBottom: 8,
              }}>{section.label}</div>
              {section.items.map(modKey => {
                const mod = MODULES[modKey]
                const active = page === modKey
                return (
                  <button
                    key={modKey}
                    onClick={() => setPage(modKey)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 10,
                      background: active ? TOKENS.white : 'transparent',
                      border: 'none', cursor: 'pointer',
                      color: active ? mod.accent : TOKENS.s700,
                      fontWeight: active ? 700 : 500, fontSize: 13.5,
                      textAlign: 'left', marginBottom: 2,
                      boxShadow: active ? '0 1px 3px rgba(0,0,0,.04), 0 0 0 1px ' + mod.accent + '20' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.6)' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <ModuleIcon kind={mod.icon} size={22} accent={active ? mod.accent : TOKENS.s500}/>
                    <span>{mod.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function AdminDashboard({ page, setPage, userStats, pendingAllocations, refreshKey, onUserSaved }) {
  const toast = useToast()
  const auth = useAuth()

  const [userModal, setUserModal] = useState(false)
  const [userForm, setUserForm] = useState(resetForm())
  const [credentialsOverlay, setCredentialsOverlay] = useState(null)

  const openAddUser = (defaultRole = 'student') => {
    setUserForm({ ...resetForm(), role: defaultRole })
    setUserModal(true)
  }

  const closeUserModal = () => {
    setUserModal(false)
    setUserForm(resetForm())
  }

  const saveUser = async () => {
    if (!userForm.firstName.trim() || !userForm.lastName.trim() || !userForm.email.trim()) {
      toast.error('First name, last name, and email are required')
      return
    }
    if (!/\S+@\S+\.\S+/.test(userForm.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      const payload = {
        firstName: userForm.firstName.trim(),
        lastName: userForm.lastName.trim(),
        email: userForm.email.trim().toLowerCase(),
        phone: userForm.phone || '',
        role: userForm.role,
        isActive: true,
      }

      if (userForm.role === 'student') {
        const ACADEMIC = ['Homeschool', 'Tuition', 'IUFP']
        payload.programme = userForm.programme || 'Homeschool'
        payload.deliveryMode = userForm.deliveryMode || 'Virtual'
        // Advisory programmes (Study Abroad, Pre-University) carry no
        // curriculum / subjects — only academic programmes do.
        const isAcademic = ACADEMIC.includes(payload.programme)
        payload.curriculum = isAcademic ? (userForm.curriculum || null) : null
        payload.gradeLevel = isAcademic ? (userForm.grade || null) : null
        payload.plan = userForm.plan || 'Basic'
        payload.subjects = isAcademic ? (userForm.subjects || []) : []
        payload.dateOfBirth = userForm.dateOfBirth || null
        payload.homeAddress = userForm.homeAddress || ''
        payload.medicalNotes = userForm.medicalNotes || ''
        payload.avatar = userForm.avatar || ''
      } else if (userForm.role === 'teacher') {
        payload.curriculum = Array.isArray(userForm.curriculum) ? userForm.curriculum : (userForm.curriculum ? [userForm.curriculum] : [])
        payload.subjects = userForm.subjects || []
        payload.teachingSpecialties = userForm.teachingSpecialties || []
        payload.plan = 'Staff'
        payload.bio = userForm.bio || ''
        payload.qualifications = userForm.qualifications || []
        payload.certifications = userForm.certifications || []
        payload.specializations = userForm.specializations || []
        payload.yearsOfExperience = userForm.yearsOfExperience || 0
        payload.avatar = userForm.avatar || ''
      } else if (userForm.role === 'parent') {
        payload.bio = userForm.bio || ''
        payload.linkedStudents = userForm.linkedStudents || []
        payload.plan = 'Basic'
        payload.avatar = userForm.avatar || ''
      } else if (userForm.role === 'admin') {
        payload.plan = 'Staff'
      }

      if (userForm._id) {
        await api.patch('/users/' + userForm._id, payload)
        toast.ok(userForm.firstName + ' updated')
      } else {
        const res = await api.post('/users', payload)
        if (res.data.credentials) {
          setCredentialsOverlay(res.data.credentials)
        }
        toast.ok(userForm.firstName + ' created successfully')
      }

      closeUserModal()
      if (onUserSaved) onUserSaved()
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Could not save user'
      toast.error('Save failed: ' + msg)
    }
  }

  const adminFirst = auth?.user?.firstName || 'Alfred'

  return (
    <div style={{
      background: TOKENS.s50, minHeight: '100vh',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      color: TOKENS.s900,
    }}>
      <PNavigation page={page} setPage={setPage} adminFirst={adminFirst} onLogout={() => { localStorage.removeItem('sm_token'); localStorage.removeItem('sm_user'); window.location.href = '/login' }}/>

      <div style={{
        marginLeft: 240,
        padding: '40px 48px',
        maxWidth: 1400,
        transition: 'margin-left 0.25s',
      }}>
        {page === 'dashboard'   && <DashboardModule  setPage={setPage} userStats={userStats} pendingAllocations={pendingAllocations} refreshKey={refreshKey} auth={auth} toast={toast} openAddUser={openAddUser} adminFirst={adminFirst} />}
        {page === 'analytics'   && <AnalyticsModule  setPage={setPage} refreshKey={refreshKey} toast={toast} />}
        {page === 'users'       && <UsersModule      refreshKey={refreshKey} toast={toast} setUserForm={setUserForm} setUserModal={setUserModal} openAddUser={openAddUser} />}
        {page === 'teachers'    && <TeachersModule   refreshKey={refreshKey} toast={toast} openAddUser={openAddUser} />}
        {page === 'allocations' && <StudentsManagementModule refreshKey={refreshKey} toast={toast} />}
        {page === 'communication' && <CommunicationModule refreshKey={refreshKey} toast={toast} />}
        {page === 'frontdesk' && <FrontDeskModule refreshKey={refreshKey} toast={toast} />}
        {page === 'documents' && <DocumentsModule toast={toast} />}
        {page === 'payroll'     && <PayrollModule    refreshKey={refreshKey} toast={toast} />}
        {page === 'leave'       && <LeaveModule      refreshKey={refreshKey} toast={toast} />}
        {page === 'programmes'  && <ProgrammesModule refreshKey={refreshKey} toast={toast} />}
        {page === 'livelessons' && <LiveLessonsModule refreshKey={refreshKey} toast={toast} />}
        {page === 'grouprooms'  && <GroupRoomsModule refreshKey={refreshKey} toast={toast} />}
        {page === 'curriculum'  && <CurriculumModule refreshKey={refreshKey} toast={toast} />}
        {page === 'billing'     && <BillingModule    refreshKey={refreshKey} toast={toast} />}
        {page === 'website'     && <WebsiteModule    refreshKey={refreshKey} toast={toast} />}
        {page === 'settings'    && <SettingsModule   refreshKey={refreshKey} toast={toast} />}
        {page === 'ai'          && <MshauriModule    refreshKey={refreshKey} toast={toast} />}
      </div>

      {userModal && (
        <Modal
          open={userModal}
          onClose={closeUserModal}
          title={userForm._id ? 'Edit User' : 'Add New User'}
          size="lg"
          footer={
            <>
              <button className="btn btn-s" onClick={closeUserModal}>Cancel</button>
              <button className="btn btn-p" onClick={saveUser}>
                {userForm._id ? 'Update User' : 'Create User'}
              </button>
            </>
          }
        >
          <UserFormFields userForm={userForm} setUserForm={setUserForm} toast={toast} />
        </Modal>
      )}

      {credentialsOverlay && (
        <Modal
          open={!!credentialsOverlay}
          onClose={() => setCredentialsOverlay(null)}
          title="User Created — Login Credentials"
          size="md"
          footer={<button className="btn btn-p" onClick={() => setCredentialsOverlay(null)}>Done</button>}
        >
          <div style={{ padding: '4px 0' }}>
            <div style={{ background: TOKENS.goldPale, border: '1px solid ' + TOKENS.gold, padding: 14, borderRadius: 10, marginBottom: 14, fontSize: 13, color: TOKENS.s700, lineHeight: 1.6 }}>
              <strong>Important:</strong> Share these credentials. The user must change their password on first login. A welcome email has been sent automatically.
            </div>
            <div className="fg">
              <label className="fl">Email</label>
              <input className="fi mono" readOnly value={credentialsOverlay.email || ''} />
            </div>
            <div className="fg">
              <label className="fl">Temporary Password</label>
              <input className="fi mono" readOnly value={credentialsOverlay.tempPassword || credentialsOverlay.password || ''} />
            </div>
            <button
              className="btn btn-g btn-sm"
              onClick={() => {
                const pw = credentialsOverlay.tempPassword || credentialsOverlay.password || ''
                navigator.clipboard?.writeText('Email: ' + credentialsOverlay.email + '\nPassword: ' + pw)
                toast.ok('Copied to clipboard')
              }}
            >Copy Both</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────
// USER FORM FIELDS — Phase: profiles + admission lookup
// ──────────────────────────────────────────────────────
// ── PARENT / GUARDIAN LINK (student edit form) ────────────
// Shows the student's currently linked parent and lets admin
// link an existing parent, create one inline, or unlink.
// One parent per student. Only rendered when editing a saved
// student (a studentId is required for the link endpoints).
function ParentLinkSection({ studentId, toast }) {
  const [linked, setLinked]   = useState(null)   // { _id, name, email } | null
  const [loading, setLoading] = useState(true)
  const [mode, setMode]       = useState('view') // view | pickExisting | createNew
  const [working, setWorking] = useState(false)

  // pick-existing state
  const [parents, setParents] = useState([])
  const [search, setSearch]   = useState('')
  const [parentsLoaded, setParentsLoaded] = useState(false)

  // create-new state
  const [np, setNp] = useState({ firstName: '', lastName: '', email: '', phone: '' })

  // Load the student's current parent
  const loadCurrent = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/users/' + studentId)
      const student = data.user || data.data?.user || data
      const pid = (student.linkedParents && student.linkedParents[0]) || student.parentId
      if (pid) {
        // pid may be an object (populated) or an id
        if (typeof pid === 'object' && pid.firstName !== undefined) {
          setLinked({
            _id: pid._id,
            name: `${pid.firstName || ''} ${pid.lastName || ''}`.trim() || pid.email,
            email: pid.email || '',
          })
        } else {
          const pRes = await api.get('/users/' + (pid._id || pid))
          const p = pRes.data.user || pRes.data.data?.user || pRes.data
          setLinked({
            _id: p._id,
            name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email,
            email: p.email || '',
          })
        }
      } else {
        setLinked(null)
      }
    } catch (e) {
      // non-fatal
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { if (studentId) loadCurrent() }, [studentId])

  const loadParents = async () => {
    if (parentsLoaded) return
    try {
      const { data } = await api.get('/users', { params: { role: 'parent' } })
      setParents(data.users || data.data?.users || [])
      setParentsLoaded(true)
    } catch (e) {
      toast?.error?.('Failed to load parents.')
    }
  }

  const linkExisting = async (parentId) => {
    setWorking(true)
    try {
      const { data } = await api.post('/users/' + studentId + '/link-parent', { parentId })
      if (data?.success) {
        setLinked(data.data.parent)
        setMode('view')
        toast?.ok?.('Parent linked.')
      } else {
        toast?.error?.(data?.message || 'Link failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Link failed.')
    } finally {
      setWorking(false)
    }
  }

  const createAndLink = async () => {
    if (!np.firstName.trim() || !np.email.trim()) {
      toast?.error?.('Parent first name and email are required.')
      return
    }
    setWorking(true)
    try {
      const { data } = await api.post('/users/' + studentId + '/create-and-link-parent', np)
      if (data?.success) {
        setLinked(data.data.parent)
        setMode('view')
        setNp({ firstName: '', lastName: '', email: '', phone: '' })
        toast?.ok?.(data.message || 'Parent linked.')
      } else {
        toast?.error?.(data?.message || 'Failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Failed.')
    } finally {
      setWorking(false)
    }
  }

  const unlink = async () => {
    if (!window.confirm('Unlink this parent from the student?')) return
    setWorking(true)
    try {
      const { data } = await api.delete('/users/' + studentId + '/parent')
      if (data?.success) {
        setLinked(null)
        toast?.ok?.('Parent unlinked.')
      } else {
        toast?.error?.(data?.message || 'Failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Failed.')
    } finally {
      setWorking(false)
    }
  }

  const filteredParents = parents.filter(p => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const name = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase()
    return name.includes(q) || (p.email || '').toLowerCase().includes(q)
  })

  const fi = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 11px', borderRadius: 6,
    border: '1.5px solid ' + TOKENS.s100, fontSize: 13, fontFamily: 'inherit',
  }

  return (
    <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid ' + TOKENS.s100 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        Parent / Guardian
      </div>

      {loading ? (
        <div style={{ fontSize: 12.5, color: TOKENS.s400 }}>Loading…</div>
      ) : (
        <>
          {/* Current parent */}
          {linked ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', background: TOKENS.goldPale,
              border: '1px solid ' + TOKENS.gold, borderRadius: 8,
              marginBottom: mode === 'view' ? 0 : 10,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.crimson }}>{linked.name}</div>
                <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>{linked.email}</div>
              </div>
              <button type="button" onClick={unlink} disabled={working}
                style={{
                  background: 'transparent', color: '#B91C1C',
                  border: '1px solid #FCA5A5', borderRadius: 5,
                  padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}>
                Unlink
              </button>
            </div>
          ) : (
            mode === 'view' && (
              <div style={{ fontSize: 12.5, color: TOKENS.s500, marginBottom: 10 }}>
                No parent linked. Link one so they receive teacher reports and updates.
              </div>
            )
          )}

          {/* Mode switch buttons */}
          {mode === 'view' && (
            <div style={{ display: 'flex', gap: 8, marginTop: linked ? 10 : 0 }}>
              <button type="button" onClick={() => { setMode('pickExisting'); loadParents() }}
                style={{
                  background: '#fff', color: TOKENS.crimson,
                  border: '1.5px solid ' + TOKENS.crimson, borderRadius: 6,
                  padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                {linked ? 'Change Parent' : 'Link Existing Parent'}
              </button>
              <button type="button" onClick={() => setMode('createNew')}
                style={{
                  background: TOKENS.crimson, color: '#fff', border: 'none', borderRadius: 6,
                  padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                + Create New Parent
              </button>
            </div>
          )}

          {/* Pick existing */}
          {mode === 'pickExisting' && (
            <div>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search parents by name or email…" style={{ ...fi, marginBottom: 8 }}/>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid ' + TOKENS.s100, borderRadius: 6, padding: 5 }}>
                {!parentsLoaded ? (
                  <div style={{ padding: 12, fontSize: 12, color: TOKENS.s400, textAlign: 'center' }}>Loading…</div>
                ) : filteredParents.length === 0 ? (
                  <div style={{ padding: 12, fontSize: 12, color: TOKENS.s400, textAlign: 'center' }}>
                    No parent accounts found. Use "Create New Parent" instead.
                  </div>
                ) : filteredParents.map(p => (
                  <div key={p._id} onClick={() => !working && linkExisting(p._id)}
                    style={{
                      padding: '7px 10px', cursor: working ? 'wait' : 'pointer',
                      borderRadius: 4, marginBottom: 2,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = TOKENS.goldPale}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: TOKENS.s900 }}>
                      {`${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email}
                    </div>
                    <div style={{ fontSize: 11, color: TOKENS.s500 }}>{p.email}</div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setMode('view')}
                style={{
                  marginTop: 8, background: 'transparent', color: TOKENS.s500,
                  border: '1px solid ' + TOKENS.s100, borderRadius: 6,
                  padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                Cancel
              </button>
            </div>
          )}

          {/* Create new */}
          {mode === 'createNew' && (
            <div>
              <div className="fr2">
                <div className="fg">
                  <label className="fl">First Name *</label>
                  <input style={fi} value={np.firstName} onChange={e => setNp(s => ({ ...s, firstName: e.target.value }))}/>
                </div>
                <div className="fg">
                  <label className="fl">Last Name</label>
                  <input style={fi} value={np.lastName} onChange={e => setNp(s => ({ ...s, lastName: e.target.value }))}/>
                </div>
              </div>
              <div className="fr2">
                <div className="fg">
                  <label className="fl">Email *</label>
                  <input style={fi} value={np.email} onChange={e => setNp(s => ({ ...s, email: e.target.value }))}/>
                </div>
                <div className="fg">
                  <label className="fl">Phone</label>
                  <input style={fi} value={np.phone} onChange={e => setNp(s => ({ ...s, phone: e.target.value }))}/>
                </div>
              </div>
              <div style={{ fontSize: 11, color: TOKENS.s400, margin: '2px 0 10px' }}>
                A parent account is created with a temporary password, and a welcome email is sent.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setMode('view')} disabled={working}
                  style={{
                    background: 'transparent', color: TOKENS.s500,
                    border: '1px solid ' + TOKENS.s100, borderRadius: 6,
                    padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>
                  Cancel
                </button>
                <button type="button" onClick={createAndLink} disabled={working}
                  style={{
                    background: working ? '#9CA3AF' : TOKENS.crimson, color: '#fff',
                    border: 'none', borderRadius: 6,
                    padding: '7px 16px', fontSize: 12, fontWeight: 700,
                    cursor: working ? 'not-allowed' : 'pointer',
                  }}>
                  {working ? 'Saving…' : 'Create & Link'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function UserFormFields({ userForm, setUserForm, toast }) {
  const upd = (k, v) => setUserForm(f => ({ ...f, [k]: v }))

  const [catalog, setCatalog] = useState({ curricula: [], gradesByCurriculum: {}, subjects: [] })
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [qualInput, setQualInput] = useState('')
  const [certInput, setCertInput] = useState('')
  const [specInput, setSpecInput] = useState('')
  const [admissionInput, setAdmissionInput] = useState('')
  const [admissionLooking, setAdmissionLooking] = useState(false)
  const [linkedStudentDetails, setLinkedStudentDetails] = useState([])

  useEffect(() => {
    api.get('/curriculum/options')
      .then(res => {
        if (res.data?.success) {
          setCatalog({
            curricula: res.data.curricula || [],
            gradesByCurriculum: res.data.gradesByCurriculum || {},
            subjects: res.data.subjects || [],
          })
        }
      })
      .catch(err => console.error('[catalog] load failed:', err))
      .finally(() => setCatalogLoading(false))
  }, [])

  useEffect(() => {
    if (userForm.role !== 'parent') return
    const ids = userForm.linkedStudents || []
    if (ids.length === 0) { setLinkedStudentDetails([]); return }
    api.get('/users/students/list')
      .then(res => {
        if (res.data?.success) {
          const all = res.data.students || []
          const matched = ids.map(id => {
            const idStr = typeof id === 'object' ? id._id : id
            return all.find(s => s._id === idStr || s._id?.toString() === idStr?.toString())
          }).filter(Boolean)
          setLinkedStudentDetails(matched)
        }
      })
      .catch(() => {})
  }, [userForm.role, JSON.stringify(userForm.linkedStudents)])

  const studentCurriculum = userForm.curriculum
  const availableSubjects = catalog.subjects.filter(s =>
    s.availableIn === 'all' || (Array.isArray(s.availableIn) && s.availableIn.includes(studentCurriculum))
  )
  const subjectsByCategory = availableSubjects.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})
  const availableGrades = catalog.gradesByCurriculum[studentCurriculum] || []

  const toggleSubject = (subjectName) => {
    const current = userForm.subjects || []
    if (current.includes(subjectName)) upd('subjects', current.filter(s => s !== subjectName))
    else upd('subjects', [...current, subjectName])
  }

  const handleCurriculumChange = (newCurriculum) => {
    upd('curriculum', newCurriculum)
    upd('grade', '')
    const stillValid = (userForm.subjects || []).filter(subjName => {
      const subj = catalog.subjects.find(s => s.name === subjName)
      if (!subj) return false
      return subj.availableIn === 'all' || (Array.isArray(subj.availableIn) && subj.availableIn.includes(newCurriculum))
    })
    upd('subjects', stillValid)
  }

  const addChip = (field, inputValue, setInput) => {
    const val = inputValue.trim()
    if (!val) return
    const current = userForm[field] || []
    if (current.includes(val)) { setInput(''); return }
    upd(field, [...current, val])
    setInput('')
  }
  const removeChip = (field, idx) => {
    const current = userForm[field] || []
    upd(field, current.filter((_, i) => i !== idx))
  }

  const handleAddStudent = async () => {
    const num = admissionInput.trim()
    if (!num) return
    setAdmissionLooking(true)
    try {
      const res = await api.get('/users/students/by-admission/' + encodeURIComponent(num))
      if (res.data?.success && res.data.student) {
        const student = res.data.student
        const currentIds = userForm.linkedStudents || []
        const exists = currentIds.some(id => {
          const idStr = typeof id === 'object' ? id._id : id
          return idStr?.toString() === student._id?.toString()
        })
        if (exists) {
          alert('Student is already linked')
        } else {
          upd('linkedStudents', [...currentIds, student._id])
          setLinkedStudentDetails(prev => [...prev, student])
        }
        setAdmissionInput('')
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Student not found with that admission number')
    } finally {
      setAdmissionLooking(false)
    }
  }
  const removeLinkedStudent = (studentId) => {
    const currentIds = userForm.linkedStudents || []
    upd('linkedStudents', currentIds.filter(id => {
      const idStr = typeof id === 'object' ? id._id : id
      return idStr?.toString() !== studentId?.toString()
    }))
    setLinkedStudentDetails(prev => prev.filter(s => s._id !== studentId))
  }

  const chipStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', background: '#FBE8E8', color: TOKENS.crimson,
    borderRadius: 999, fontSize: 12.5, fontWeight: 600, border: '1px solid #F4C5C5',
  }
  const chipRemoveStyle = {
    background: 'transparent', border: 'none', color: TOKENS.crimson,
    cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1, fontWeight: 700,
  }

  return (
    <div>
      <div className="fr2">
        <div className="fg">
          <label className="fl">First Name *</label>
          <input className="fi" value={userForm.firstName} onChange={e => upd('firstName', e.target.value)} placeholder="First name" autoFocus />
        </div>
        <div className="fg">
          <label className="fl">Last Name *</label>
          <input className="fi" value={userForm.lastName} onChange={e => upd('lastName', e.target.value)} placeholder="Last name" />
        </div>
      </div>

      <div className="fg">
        <label className="fl">Email Address *</label>
        <input className="fi" type="email" value={userForm.email} onChange={e => upd('email', e.target.value)} placeholder="user@example.com" />
      </div>

      <div className="fg">
        <label className="fl">Phone Number</label>
        <input className="fi" value={userForm.phone} onChange={e => upd('phone', e.target.value)} placeholder="+254 700 000000" />
      </div>

      <div className="fg">
        <label className="fl">Role *</label>
        <select className="fsel" value={userForm.role} onChange={e => upd('role', e.target.value)}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {userForm.role === 'student' && (
        <>
          {userForm._id && userForm.admissionNumber && (
            <div className="fg">
              <label className="fl">Admission Number</label>
              <div style={{
                padding: '10px 14px', background: TOKENS.goldPale,
                border: '1px solid ' + TOKENS.gold, borderRadius: 8,
                fontFamily: 'JetBrains Mono, monospace', fontSize: 14,
                fontWeight: 700, color: TOKENS.crimson, letterSpacing: '0.04em',
              }}>{userForm.admissionNumber}</div>
              <div style={{ fontSize: 11, color: TOKENS.s400, marginTop: 4 }}>Auto-generated. Cannot be changed.</div>
            </div>
          )}

          {/* Programme + delivery mode */}
          <div className="fr2">
            <div className="fg">
              <label className="fl">Programme</label>
              <select className="fsel" value={userForm.programme || 'Homeschool'}
                onChange={e => {
                  const p = e.target.value
                  upd('programme', p)
                  // Advisory programmes carry no curriculum/subjects — clear them
                  if (!['Homeschool', 'Tuition', 'IUFP'].includes(p)) {
                    upd('curriculum', ''); upd('grade', ''); upd('subjects', [])
                  }
                }}>
                <option value="Homeschool">Homeschool</option>
                <option value="Tuition">Tuition</option>
                <option value="IUFP">IUFP (Foundation Programme)</option>
                <option value="Study Abroad">Study Abroad</option>
                <option value="Pre-University">Pre-University</option>
              </select>
            </div>
            <div className="fg">
              <label className="fl">Delivery Mode</label>
              <select className="fsel" value={userForm.deliveryMode || 'Virtual'}
                onChange={e => upd('deliveryMode', e.target.value)}>
                <option value="Virtual">Virtual</option>
                <option value="In-person">In-person</option>
              </select>
            </div>
          </div>

          {/* Advisory programmes need no academic fields */}
          {!['Homeschool', 'Tuition', 'IUFP'].includes(userForm.programme || 'Homeschool') ? (
            <div style={{
              padding: 12, background: TOKENS.goldPale,
              border: '1px solid ' + TOKENS.gold, borderRadius: 8,
              fontSize: 12.5, color: TOKENS.crimson, lineHeight: 1.5,
            }}>
              {userForm.programme} is an advisory programme — no curriculum or
              subjects are required. The student will be supported by an advisor.
            </div>
          ) : (
            <>
          <div className="fr2">
            <div className="fg">
              <label className="fl">Curriculum</label>
              <select className="fsel" value={userForm.curriculum || ''} onChange={e => handleCurriculumChange(e.target.value)} disabled={catalogLoading}>
                <option value="">Select curriculum...</option>
                {catalog.curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="fg">
              <label className="fl">Grade / Year</label>
              <select className="fsel" value={userForm.grade || ''} onChange={e => upd('grade', e.target.value)} disabled={!studentCurriculum}>
                <option value="">{studentCurriculum ? 'Select grade...' : 'Select curriculum first'}</option>
                {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="fg">
            <label className="fl">Plan</label>
            <select className="fsel" value={userForm.plan || 'Basic'} onChange={e => upd('plan', e.target.value)}>
              <option>Basic</option><option>Premium</option><option>IGCSE Pack</option>
            </select>
          </div>

          {studentCurriculum && (
            <div className="fg">
              <label className="fl">Subjects ({(userForm.subjects || []).length} selected)</label>
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, maxHeight: 280, overflowY: 'auto', background: '#FFF' }}>
                {availableSubjects.length === 0 ? (
                  <div style={{ fontSize: 12, color: TOKENS.s500, textAlign: 'center', padding: 12 }}>No subjects available for this curriculum</div>
                ) : (
                  Object.entries(subjectsByCategory).map(([category, subjects]) => (
                    <div key={category} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: TOKENS.crimson, marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid ' + TOKENS.s100 }}>{category}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 4 }}>
                        {subjects.map(s => {
                          const checked = (userForm.subjects || []).includes(s.name)
                          return (
                            <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', fontSize: 12.5, cursor: 'pointer', borderRadius: 4, background: checked ? TOKENS.goldPale : 'transparent' }}>
                              <input type="checkbox" checked={checked} onChange={() => toggleSubject(s.name)} style={{ cursor: 'pointer', accentColor: TOKENS.crimson }} />
                              <span style={{ color: checked ? TOKENS.crimson : TOKENS.s700, fontWeight: checked ? 600 : 400 }}>{s.name}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
            </>
          )}

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid ' + TOKENS.s100 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>Personal Profile</div>
            <div className="fr2">
              <div className="fg">
                <label className="fl">Date of Birth</label>
                <input className="fi" type="date" value={userForm.dateOfBirth ? userForm.dateOfBirth.slice(0, 10) : ''} onChange={e => upd('dateOfBirth', e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Photo URL (optional)</label>
                <input className="fi" value={userForm.avatar || ''} onChange={e => upd('avatar', e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="fg">
              <label className="fl">Home Address</label>
              <textarea className="fi" rows={2} value={userForm.homeAddress || ''} onChange={e => upd('homeAddress', e.target.value)} placeholder="Street, city, country..." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div className="fg">
              <label className="fl">Medical Notes (optional)</label>
              <textarea className="fi" rows={2} value={userForm.medicalNotes || ''} onChange={e => upd('medicalNotes', e.target.value)} placeholder="Allergies, conditions, emergency info..." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              <div style={{ fontSize: 11, color: TOKENS.s400, marginTop: 4 }}>Confidential. Only visible to admin and assigned teachers.</div>
            </div>
          </div>

          {/* Parent / Guardian — only for an already-saved student */}
          {userForm._id ? (
            <ParentLinkSection studentId={userForm._id} toast={toast} />
          ) : (
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid ' + TOKENS.s100 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                Parent / Guardian
              </div>
              <div style={{ fontSize: 12.5, color: TOKENS.s500 }}>
                Save the student first, then reopen to link a parent or guardian.
              </div>
            </div>
          )}
        </>
      )}

      {userForm.role === 'teacher' && (
        <>
          <div className="fg">
            <label className="fl">Curricula (select all that apply)</label>
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, background: '#FFF', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 4 }}>
              {catalog.curricula.length === 0 ? (
                <div style={{ fontSize: 12, color: TOKENS.s500 }}>{catalogLoading ? 'Loading...' : 'No curricula available'}</div>
              ) : (
                catalog.curricula.map(c => {
                  const teacherCurricula = Array.isArray(userForm.curriculum) ? userForm.curriculum : (userForm.curriculum ? [userForm.curriculum] : [])
                  const checked = teacherCurricula.includes(c.id)
                  return (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', fontSize: 12.5, cursor: 'pointer', borderRadius: 4, background: checked ? TOKENS.goldPale : 'transparent' }}>
                      <input type="checkbox" checked={checked}
                        onChange={() => {
                          const current = Array.isArray(userForm.curriculum) ? [...userForm.curriculum] : (userForm.curriculum ? [userForm.curriculum] : [])
                          if (checked) {
                            const next = current.filter(x => x !== c.id)
                            upd('curriculum', next)
                            const stillValid = (userForm.subjects || []).filter(subjName => {
                              const subj = catalog.subjects.find(s => s.name === subjName)
                              if (!subj) return false
                              if (subj.availableIn === 'all') return true
                              return Array.isArray(subj.availableIn) && subj.availableIn.some(currId => next.includes(currId))
                            })
                            upd('subjects', stillValid)
                          } else { upd('curriculum', [...current, c.id]) }
                        }} style={{ cursor: 'pointer', accentColor: TOKENS.crimson }} />
                      <span style={{ color: checked ? TOKENS.crimson : TOKENS.s700, fontWeight: checked ? 600 : 400 }}>{c.name}</span>
                    </label>
                  )
                })
              )}
            </div>
          </div>

          {(() => {
            const teacherCurricula = Array.isArray(userForm.curriculum) ? userForm.curriculum : (userForm.curriculum ? [userForm.curriculum] : [])
            if (teacherCurricula.length === 0) {
              return (
                <div className="fg">
                  <label className="fl">Subjects</label>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, background: TOKENS.cream, fontSize: 12.5, color: TOKENS.s500, textAlign: 'center' }}>
                    Select at least one curriculum above to see available subjects
                  </div>
                </div>
              )
            }
            const teacherSubjects = catalog.subjects.filter(s => s.availableIn === 'all' || (Array.isArray(s.availableIn) && s.availableIn.some(currId => teacherCurricula.includes(currId))))
            const teacherSubjectsByCategory = teacherSubjects.reduce((acc, s) => { if (!acc[s.category]) acc[s.category] = []; acc[s.category].push(s); return acc }, {})
            const selectedSubjects = Array.isArray(userForm.subjects) ? userForm.subjects.filter(s => typeof s === 'string') : []
            const toggle = (subjectName) => {
              if (selectedSubjects.includes(subjectName)) upd('subjects', selectedSubjects.filter(s => s !== subjectName))
              else upd('subjects', [...selectedSubjects, subjectName])
            }
            return (
              <div className="fg">
                <label className="fl">Subjects ({selectedSubjects.length} selected)</label>
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, maxHeight: 320, overflowY: 'auto', background: '#FFF' }}>
                  {teacherSubjects.length === 0 ? (
                    <div style={{ fontSize: 12, color: TOKENS.s500, textAlign: 'center', padding: 12 }}>No subjects available for selected curricula</div>
                  ) : (
                    Object.entries(teacherSubjectsByCategory).map(([category, subs]) => (
                      <div key={category} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: TOKENS.crimson, marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid ' + TOKENS.s100 }}>{category}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 4 }}>
                          {subs.map(s => {
                            const checked = selectedSubjects.includes(s.name)
                            return (
                              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', fontSize: 12.5, cursor: 'pointer', borderRadius: 4, background: checked ? TOKENS.goldPale : 'transparent' }}>
                                <input type="checkbox" checked={checked} onChange={() => toggle(s.name)} style={{ cursor: 'pointer', accentColor: TOKENS.crimson }} />
                                <span style={{ color: checked ? TOKENS.crimson : TOKENS.s700, fontWeight: checked ? 600 : 400 }}>{s.name}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })()}

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid ' + TOKENS.s100 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>Teaching Profile</div>
            <div className="fr2">
              <div className="fg">
                <label className="fl">Years of Experience</label>
                <input className="fi" type="number" min="0" max="70" value={userForm.yearsOfExperience || 0} onChange={e => upd('yearsOfExperience', parseInt(e.target.value) || 0)} />
              </div>
              <div className="fg">
                <label className="fl">Photo URL (optional)</label>
                <input className="fi" value={userForm.avatar || ''} onChange={e => upd('avatar', e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="fg">
              <label className="fl">Bio</label>
              <textarea className="fi" rows={3} value={userForm.bio || ''} onChange={e => upd('bio', e.target.value)} placeholder="Brief intro shown to students and parents..." maxLength={1000} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              <div style={{ fontSize: 11, color: TOKENS.s400, marginTop: 4 }}>{(userForm.bio || '').length}/1000 characters</div>
            </div>

            <div className="fg">
              <label className="fl">Qualifications ({(userForm.qualifications || []).length})</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input className="fi" value={qualInput} onChange={e => setQualInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip('qualifications', qualInput, setQualInput) } }} placeholder="e.g. B.Ed. Mathematics, University of Nairobi 2022" style={{ flex: 1 }} />
                <button type="button" onClick={() => addChip('qualifications', qualInput, setQualInput)} className="btn btn-s btn-sm" style={{ flexShrink: 0 }}>+ Add</button>
              </div>
              {(userForm.qualifications || []).length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(userForm.qualifications || []).map((q, i) => (
                    <span key={i} style={chipStyle}>{q}<button type="button" onClick={() => removeChip('qualifications', i)} style={chipRemoveStyle} aria-label="Remove">×</button></span>
                  ))}
                </div>
              )}
            </div>

            <div className="fg">
              <label className="fl">Certifications ({(userForm.certifications || []).length})</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input className="fi" value={certInput} onChange={e => setCertInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip('certifications', certInput, setCertInput) } }} placeholder="e.g. Cambridge IGCSE Mathematics certified" style={{ flex: 1 }} />
                <button type="button" onClick={() => addChip('certifications', certInput, setCertInput)} className="btn btn-s btn-sm" style={{ flexShrink: 0 }}>+ Add</button>
              </div>
              {(userForm.certifications || []).length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(userForm.certifications || []).map((c, i) => (
                    <span key={i} style={chipStyle}>{c}<button type="button" onClick={() => removeChip('certifications', i)} style={chipRemoveStyle}>×</button></span>
                  ))}
                </div>
              )}
            </div>

            <div className="fg">
              <label className="fl">Specializations ({(userForm.specializations || []).length})</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input className="fi" value={specInput} onChange={e => setSpecInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip('specializations', specInput, setSpecInput) } }} placeholder="e.g. Calculus, Mechanics, Past paper exam coaching" style={{ flex: 1 }} />
                <button type="button" onClick={() => addChip('specializations', specInput, setSpecInput)} className="btn btn-s btn-sm" style={{ flexShrink: 0 }}>+ Add</button>
              </div>
              {(userForm.specializations || []).length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(userForm.specializations || []).map((s, i) => (
                    <span key={i} style={chipStyle}>{s}<button type="button" onClick={() => removeChip('specializations', i)} style={chipRemoveStyle}>×</button></span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {userForm.role === 'parent' && (
        <>
          <div className="fg">
            <label className="fl">Brief Bio</label>
            <textarea className="fi" rows={3} value={userForm.bio || ''} onChange={e => upd('bio', e.target.value)} placeholder="Optional notes..." style={{ resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <div className="fg">
            <label className="fl">Photo URL (optional)</label>
            <input className="fi" value={userForm.avatar || ''} onChange={e => upd('avatar', e.target.value)} placeholder="https://..." />
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid ' + TOKENS.s100 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>Linked Children</div>
            <div className="fg">
              <label className="fl">Add a student by admission number</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="fi" value={admissionInput} onChange={e => setAdmissionInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddStudent() } }} placeholder="e.g. SH/2026/001" style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace' }} />
                <button type="button" onClick={handleAddStudent} disabled={admissionLooking || !admissionInput.trim()} className="btn btn-p btn-sm" style={{ flexShrink: 0 }}>{admissionLooking ? '...' : '+ Add'}</button>
              </div>
              <div style={{ fontSize: 11, color: TOKENS.s400, marginTop: 4 }}>Find a student's admission number on their user profile.</div>
            </div>

            {linkedStudentDetails.length > 0 && (
              <div className="fg">
                <label className="fl">Linked children ({linkedStudentDetails.length})</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {linkedStudentDetails.map(s => (
                    <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: TOKENS.goldPale, border: '1px solid ' + TOKENS.gold, borderRadius: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.s900 }}>{s.firstName} {s.lastName}</div>
                        <div style={{ fontSize: 11, color: TOKENS.s500, fontFamily: 'JetBrains Mono, monospace' }}>{s.admissionNumber || 'No admission number'}{s.gradeLevel && ' · ' + s.gradeLevel}</div>
                      </div>
                      <button type="button" onClick={() => removeLinkedStudent(s._id)} style={{ background: 'transparent', border: '1px solid #FCA5A5', color: '#DC2626', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div style={{ background: TOKENS.cream, border: '1px solid ' + TOKENS.s100, padding: 12, borderRadius: 10, fontSize: 12, color: TOKENS.s700, lineHeight: 1.6, marginTop: 12 }}>
        {userForm._id ? 'Changes will apply immediately when you click Update.' : 'A temporary password will be generated automatically and emailed to the user. They will be required to change it on first login.'}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// 1. DASHBOARD MODULE — Premium overview with hero + tile grid
// ═══════════════════════════════════════════════════════════
function DashboardModule({ setPage, userStats, pendingAllocations, refreshKey, auth, toast, openAddUser, adminFirst }) {
  const [now, setNow] = useState(new Date())
  const [stats, setStats] = useState({ loading: true, students: 0, teachers: 0, parents: 0 })

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    api.get('/users/stats')
      .then(res => {
        const d = res.data || {}
        setStats({ loading: false, students: d.students || d.totalStudents || 0, teachers: d.teachers || d.totalTeachers || 0, parents: d.parents || d.totalParents || 0 })
      })
      .catch(() => setStats({ loading: false, students: 0, teachers: 0, parents: 0 }))
  }, [refreshKey])

  const greeting = greetingText()

  // Tile grid for module navigation — Apple-style
  const tiles = [
    { kind: 'analytics',   page: 'analytics',   accent: MODULES.analytics.accent,   title: 'Analytics',     sub: 'Real-time platform metrics and student insights' },
    { kind: 'users',       page: 'users',       accent: MODULES.users.accent,       title: 'Users',         sub: stats.students + ' students · ' + stats.teachers + ' teachers · ' + stats.parents + ' parents' },
    { kind: 'teacher',     page: 'teachers',    accent: MODULES.teachers.accent,    title: 'Teachers',      sub: stats.teachers + ' faculty members on the roster' },
    { kind: 'allocations', page: 'allocations', accent: MODULES.allocations.accent, title: 'Manage Students',   sub: pendingAllocations > 0 ? pendingAllocations + ' pending allocations' : 'Subjects & teacher allocations', badge: pendingAllocations },
    { kind: 'curriculum',  page: 'curriculum',  accent: MODULES.curriculum.accent,  title: 'Curriculum',    sub: 'Manage subjects, grades and academic structure' },
    { kind: 'rooms',       page: 'grouprooms',  accent: MODULES.grouprooms.accent,  title: 'Group Rooms',   sub: 'Persistent classrooms with auto-enrollment' },
    { kind: 'live',        page: 'livelessons', accent: MODULES.livelessons.accent, title: 'Live Classes',  sub: 'Real-time classroom sessions in progress' },
    { kind: 'billing',     page: 'billing',     accent: MODULES.billing.accent,     title: 'Billing',       sub: 'Revenue, payments and fee structure' },
    { kind: 'website',     page: 'website',     accent: MODULES.website.accent,     title: 'Website',       sub: 'Edit landing page content and SEO' },
  ]

  return (
    <>
      {/* HERO HEADER */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: TOKENS.s500, marginBottom: 10 }}>
          {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 44, fontWeight: 400, color: TOKENS.s900,
          margin: 0, lineHeight: 1.1, letterSpacing: '-.02em',
        }}>
          {greeting}, <em style={{ color: TOKENS.crimson, fontWeight: 400 }}>{adminFirst}</em>.
        </h1>
        <p style={{ fontSize: 16, color: TOKENS.s500, marginTop: 8, lineHeight: 1.5, maxWidth: 600 }}>
          Here's what's happening at Smartious today. Choose a module below to dive in.
        </p>
      </div>

      {/* KPI ROW */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 36, flexWrap: 'wrap' }}>
        <PKpi label="Total Students" value={stats.loading ? '—' : stats.students.toLocaleString()} delta={stats.parents + ' parents linked'} accent={TOKENS.crimson}/>
        <PKpi label="Active Teachers" value={stats.loading ? '—' : stats.teachers} delta="On roster" accent={TOKENS.accentTeal}/>
        <PKpi label="Monthly Revenue" value={'KSh ' + Math.round(stats.students * 18000 / 1000) + 'k'} delta="Estimated"/>
        <PKpi label="Pending" value={pendingAllocations} delta={pendingAllocations === 0 ? 'All caught up' : 'Need review'} deltaColor={pendingAllocations > 0 ? TOKENS.accentAmber : TOKENS.accentEmerald}/>
      </div>

      {/* MODULE TILE GRID */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 22, fontWeight: 500, color: TOKENS.s900,
          margin: '0 0 16px', letterSpacing: '-.005em',
        }}>Modules</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {tiles.map(t => (
            <PTile key={t.page} kind={t.kind} title={t.title} sub={t.sub} accent={t.accent} onClick={() => setPage(t.page)} badge={t.badge}/>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <PCard accent={TOKENS.gold}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: TOKENS.s900, margin: '0 0 14px', fontWeight: 600 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => openAddUser('student')} className="btn btn-p btn-sm">+ Add Student</button>
          <button onClick={() => openAddUser('teacher')} className="btn btn-s btn-sm">+ Add Teacher</button>
          <button onClick={() => openAddUser('parent')} className="btn btn-s btn-sm">+ Add Parent</button>
          <button onClick={() => setPage('ai')} className="btn btn-s btn-sm">Open Mshauri AI</button>
        </div>
      </PCard>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// 2. ANALYTICS MODULE — refined, original logic preserved
// ═══════════════════════════════════════════════════════════
function AnalyticsModule({ setPage, refreshKey, toast }) {
  const [stats, setStats] = useState({ loading: true, students: 0, teachers: 0 })
  const [students, setStudents] = useState([])

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, studsRes] = await Promise.all([
          api.get('/users/stats').catch(() => ({ data: {} })),
          api.get('/users/students/list').catch(() => ({ data: { students: [] } })),
        ])
        const d = statsRes.data || {}
        setStats({ loading: false, students: d.students || 0, teachers: d.teachers || 0 })
        setStudents(studsRes.data.students || [])
      } catch (e) {
        setStats({ loading: false, students: 0, teachers: 0 })
      }
    }
    fetch()
  }, [refreshKey])

  return (
    <>
      <PSection
        tag="Platform Intelligence"
        title="Analytics &"
        em="Reports"
        sub="Live platform metrics from your backend"
      />

      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Total Students" value={stats.students.toLocaleString()} delta="Live count"/>
        <PKpi label="Total Teachers" value={stats.teachers} delta="Active roster"/>
        <PKpi label="Avg Pass Rate" value="78%" delta="YTD"/>
        <PKpi label="Avg Attendance" value="91%" delta="Last 30 days"/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <PCard accent={TOKENS.accentNavy}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: TOKENS.s900, margin: '0 0 16px', fontWeight: 600 }}>Student Growth</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
            {[{k:'Sep',v:1180},{k:'Oct',v:1320},{k:'Nov',v:1410},{k:'Dec',v:1530},{k:'Jan',v:1840},{k:'Feb',v:stats.students || 2010, hi:true}].map((d, i) => {
              const max = 2010
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: '100%', height: Math.max(6, (d.v/max)*120) + 'px', background: d.hi ? TOKENS.gold : TOKENS.accentNavy, borderRadius: '6px 6px 0 0', opacity: d.hi ? 1 : 0.6 }}/>
                  <div style={{ fontSize: 11, color: TOKENS.s500, fontWeight: 600 }}>{d.k}</div>
                </div>
              )
            })}
          </div>
        </PCard>

        <PCard accent={TOKENS.crimson}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: TOKENS.s900, margin: '0 0 16px', fontWeight: 600 }}>By Curriculum</h3>
          {(() => {
            const c = {}
            students.forEach(s => { const k = s.curriculum || 'Unspecified'; c[k] = (c[k] || 0) + 1 })
            const sorted = Object.entries(c).sort((a,b) => b[1] - a[1]).slice(0, 6)
            const max = sorted[0]?.[1] || 1
            if (sorted.length === 0) return <div style={{ padding: 24, textAlign: 'center', fontSize: 12, color: TOKENS.s400 }}>Add students to see breakdown</div>
            return sorted.map(([label, count]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid ' + TOKENS.s100 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.s700, flex: 1 }}>{label}</span>
                <div style={{ flex: 2, height: 6, background: TOKENS.s100, borderRadius: 99 }}>
                  <div style={{ width: (count/max*100) + '%', height: '100%', background: TOKENS.crimson, borderRadius: 99 }}/>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: TOKENS.s900, width: 50, textAlign: 'right' }}>{count}</span>
              </div>
            ))
          })()}
        </PCard>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// 3. USERS MODULE — fully redesigned, premium
// ═══════════════════════════════════════════════════════════
function UsersModule({ refreshKey, toast, setUserForm, setUserModal, openAddUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [showImportFD, setShowImportFD] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/users')
      setUsers(res.data.users || [])
      setLoading(false)
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load')
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [refreshKey, loadUsers])

  const counts = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    parents: users.filter(u => u.role === 'parent').length,
    admins: users.filter(u => u.role === 'admin').length,
    pending: users.filter(u => u.mustChangePassword).length,
  }

  const filtered = users.filter(u => {
    if (search) {
      const q = search.toLowerCase()
      const fullName = ((u.firstName || '') + ' ' + (u.lastName || '')).toLowerCase()
      const email = (u.email || '').toLowerCase()
      const adm = (u.admissionNumber || '').toLowerCase()
      if (!fullName.includes(q) && !email.includes(q) && !adm.includes(q)) return false
    }
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (statusFilter === 'active' && (u.isActive === false || u.mustChangePassword)) return false
    if (statusFilter === 'pending' && !u.mustChangePassword) return false
    if (statusFilter === 'suspended' && u.isActive !== false) return false
    return true
  })

  const handleEdit = (u) => {
    setUserForm({
      firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '',
      phone: u.phone || '', role: u.role || 'student',
      curriculum: u.curriculum || '',
      grade: u.gradeLevel || u.grade || '',
      plan: u.plan || 'Basic',
      subjects: Array.isArray(u.subjects) ? u.subjects.filter(s => typeof s === 'string') : [],
      teachingSpecialties: u.teachingSpecialties || [],
      bio: u.bio || '',
      avatar: u.avatar || '',
      qualifications: Array.isArray(u.qualifications) ? u.qualifications : [],
      certifications: Array.isArray(u.certifications) ? u.certifications : [],
      specializations: Array.isArray(u.specializations) ? u.specializations : [],
      yearsOfExperience: u.yearsOfExperience || 0,
      admissionNumber: u.admissionNumber || '',
      dateOfBirth: u.dateOfBirth || '',
      homeAddress: u.homeAddress || '',
      medicalNotes: u.medicalNotes || '',
      linkedStudents: Array.isArray(u.linkedStudents) ? u.linkedStudents.map(s => typeof s === 'object' ? s._id : s) : [],
      _id: u._id,
    })
    setUserModal(true)
  }

  const handleDelete = async (u) => {
    if (!confirm('Delete ' + u.firstName + ' ' + u.lastName + ' permanently?')) return
    try {
      await api.delete('/users/' + u._id)
      setUsers(prev => prev.filter(x => x._id !== u._id))
      toast.ok(u.firstName + ' deleted')
    } catch (e) {
      toast.error('Delete failed: ' + (e.response?.data?.message || e.message))
    }
  }

  if (loading) return (
    <PCard><div style={{ padding: 40, textAlign: 'center', color: TOKENS.s500 }}>Loading users...</div></PCard>
  )
  if (error) return (
    <PCard><div style={{ padding: 24, color: '#991B1B' }}>Failed to load users: {error}</div></PCard>
  )

  return (
    <>
      <PSection
        tag="Accounts"
        title="User"
        em="Management"
        sub={'Manage students, teachers, parents and admins · ' + counts.total + ' total'}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-s btn-sm" onClick={() => setShowImportFD(true)}>Import from Front Desk</button>
            <button className="btn btn-s btn-sm" onClick={() => toast.info('Exporting CSV...')}>Export</button>
            <button className="btn btn-p btn-sm" onClick={() => openAddUser('student')}>+ Add User</button>
          </div>
        }
      />

      {showImportFD && (
        <ImportFromFrontDesk
          toast={toast}
          onClose={() => setShowImportFD(false)}
          onImported={() => { loadUsers() }}
        />
      )}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Total" value={counts.total} delta="All accounts"/>
        <PKpi label="Students" value={counts.students} delta="Active learners"/>
        <PKpi label="Teachers" value={counts.teachers} delta="Faculty"/>
        <PKpi label="Parents" value={counts.parents} delta="Guardians"/>
        <PKpi label="Pending" value={counts.pending} delta={counts.pending > 0 ? 'Login required' : 'All set'} deltaColor={counts.pending > 0 ? TOKENS.accentAmber : TOKENS.accentEmerald}/>
      </div>

      {/* FILTERS */}
      <PCard padding={16} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { id: 'all',     label: 'All',      count: counts.total },
            { id: 'student', label: 'Students', count: counts.students },
            { id: 'teacher', label: 'Teachers', count: counts.teachers },
            { id: 'parent',  label: 'Parents',  count: counts.parents },
            { id: 'admin',   label: 'Admins',   count: counts.admins },
          ].map(c => (
            <button key={c.id} onClick={() => setRoleFilter(c.id)} style={{
              background: roleFilter === c.id ? TOKENS.crimson : TOKENS.s50,
              color: roleFilter === c.id ? TOKENS.white : TOKENS.s700,
              border: '1px solid ' + (roleFilter === c.id ? 'transparent' : TOKENS.s200),
              padding: '8px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {c.label}
              <span style={{ background: roleFilter === c.id ? 'rgba(255,255,255,.22)' : TOKENS.s100, padding: '2px 7px', borderRadius: 99, fontSize: 11 }}>{c.count}</span>
            </button>
          ))}
          <select className="fsel" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto', padding: '8px 12px', fontSize: 12.5 }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending Login</option>
            <option value="suspended">Suspended</option>
          </select>
          <input className="fi" placeholder="Search name, email, admission #..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 280, marginLeft: 'auto' }} />
        </div>
      </PCard>

      {/* USER LIST */}
      {users.length === 0 ? (
        <PCard><div style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: TOKENS.s700, marginBottom: 8 }}>No users yet</div>
          <div style={{ fontSize: 13, color: TOKENS.s500, marginBottom: 18 }}>Click "+ Add User" to create the first account</div>
          <button className="btn btn-p btn-sm" onClick={() => openAddUser('student')}>+ Add First User</button>
        </div></PCard>
      ) : filtered.length === 0 ? (
        <PCard><div style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: TOKENS.s500 }}>No users match your filters</div>
        </div></PCard>
      ) : (
        <PCard padding={0} style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: TOKENS.s50, borderBottom: '1px solid ' + TOKENS.s100 }}>
                  {['User', 'Role', 'Admission #', 'Curriculum', 'Plan', 'Status', 'Actions'].map((h, i) => (
                    <th key={i} style={{ padding: '14px 16px', textAlign: i === 6 ? 'center' : 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: TOKENS.s500, width: i === 6 ? 140 : undefined }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const fullName = (u.firstName || '') + ' ' + (u.lastName || '')
                  const init = initials(u.firstName, u.lastName)
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid ' + TOKENS.s100 }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Av init={init} col={avColor(fullName)} size={38}/>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: TOKENS.s900 }}>{fullName.trim() || 'Unnamed'}</div>
                            <div style={{ fontSize: 12, color: TOKENS.s500 }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', background: TOKENS.s50, color: TOKENS.crimson, border: '1px solid ' + TOKENS.s200, borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: u.admissionNumber ? TOKENS.crimson : TOKENS.s400, fontWeight: 600 }}>
                        {u.admissionNumber || (u.role === 'student' ? '—' : '')}
                      </td>
                      <td style={{ padding: '14px 16px', color: TOKENS.s600, fontSize: 13 }}>
                        {Array.isArray(u.curriculum) ? u.curriculum.join(', ') : (u.curriculum || 'N/A')}
                      </td>
                      <td style={{ padding: '14px 16px' }}><PlanBadge p={u.plan || 'Basic'} /></td>
                      <td style={{ padding: '14px 16px' }}>
                        {u.isActive === false ? <span style={{ display: 'inline-block', padding: '3px 10px', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>Suspended</span> :
                          u.mustChangePassword ? <span style={{ display: 'inline-block', padding: '3px 10px', background: '#FEF3C7', color: TOKENS.accentAmber, border: '1px solid #FDE68A', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>Pending Login</span> :
                          <span style={{ display: 'inline-block', padding: '3px 10px', background: '#DCFCE7', color: TOKENS.accentEmerald, border: '1px solid #86EFAC', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>Active</span>
                        }
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button className="btn btn-g btn-sm" onClick={() => handleEdit(u)}>Edit</button>
                          <button className="btn btn-d btn-sm" onClick={() => handleDelete(u)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </PCard>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// IMPORT FROM FRONT DESK — turn registration leads into accounts
// ═══════════════════════════════════════════════════════════
// Lists registration-type Front Desk submissions. Importing one
// creates a Student account + a linked Parent account, emails
// temp credentials to both, and marks the lead converted.
// ═══════════════════════════════════════════════════════════
function ImportFromFrontDesk({ toast, onClose, onImported }) {
  const [leads, setLeads]     = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId]   = useState(null)
  const [editEmail, setEditEmail] = useState({})   // leadId -> custom student email

  const load = useCallback(() => {
    setLoading(true)
    api.get('/frontdesk/submissions?type=registration')
      .then(r => setLeads(r.data.data?.submissions || []))
      .catch(() => toast?.error?.('Failed to load registration leads.'))
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => { load() }, [load])

  const importLead = async (lead) => {
    setBusyId(lead._id)
    try {
      const body = {}
      const customEmail = (editEmail[lead._id] || '').trim()
      if (customEmail) body.studentEmail = customEmail
      const { data } = await api.post('/frontdesk/' + lead._id + '/import', body)
      if (data?.success) {
        toast?.ok?.(data.message || 'Lead imported.')
        // Reflect import locally
        setLeads(list => list.map(l => l._id === lead._id
          ? { ...l, status: 'converted', importedUserId: data.data?.studentId || 'done' }
          : l))
        onImported && onImported()
      } else {
        toast?.error?.(data?.message || 'Import failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Import failed.')
    } finally {
      setBusyId(null)
    }
  }

  const importable = leads.filter(l => !l.importedUserId)
  const done       = leads.filter(l => l.importedUserId)

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(10,8,6,.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 720,
        maxHeight: '86vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid ' + (TOKENS.line || '#E8E2D6') }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: TOKENS.ink || '#1A1A1A' }}>
                Import from Front Desk
              </div>
              <div style={{ fontSize: 12, color: TOKENS.s500, marginTop: 2 }}>
                Registration enquiries from the website. Importing creates a student account and a linked parent account.
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'transparent', border: 'none', fontSize: 22,
              color: TOKENS.s400, cursor: 'pointer', lineHeight: 1,
            }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 18, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: TOKENS.s500, padding: 30 }}>Loading registration leads…</div>
          ) : leads.length === 0 ? (
            <div style={{ textAlign: 'center', color: TOKENS.s500, padding: 30 }}>
              No registration leads yet. They appear here when families register via the website.
            </div>
          ) : (
            <>
              {importable.length === 0 && (
                <div style={{ fontSize: 13, color: TOKENS.s500, marginBottom: 12 }}>
                  All registration leads have been imported.
                </div>
              )}

              {importable.map(lead => (
                <div key={lead._id} style={{
                  border: '1px solid ' + (TOKENS.line || '#E8E2D6'), borderRadius: 10,
                  padding: 14, marginBottom: 10,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TOKENS.ink || '#1A1A1A' }}>
                        {[lead.studentFirstName, lead.studentLastName].filter(Boolean).join(' ') || lead.name || 'Unnamed student'}
                      </div>
                      <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 2 }}>
                        {[
                          lead.curriculum,
                          lead.programme,
                          lead.country,
                          lead.studentDob ? 'DOB ' + lead.studentDob : '',
                        ].filter(Boolean).join(' · ')}
                      </div>
                      <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 2 }}>
                        Parent: {lead.name || '—'} · {lead.email || 'no email'} · {lead.phone || 'no phone'}
                      </div>
                    </div>
                  </div>

                  {/* Optional custom student email */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: TOKENS.s400, marginBottom: 3 }}>
                      Student login email <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional — leave blank to derive from the parent email)</span>
                    </div>
                    <input
                      value={editEmail[lead._id] || ''}
                      onChange={e => setEditEmail(m => ({ ...m, [lead._id]: e.target.value }))}
                      placeholder="e.g. student.name@email.com"
                      style={{
                        width: '100%', boxSizing: 'border-box', padding: '7px 10px',
                        borderRadius: 6, fontSize: 12.5,
                        border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
                      }}/>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <button
                      onClick={() => importLead(lead)}
                      disabled={busyId === lead._id || !lead.email}
                      style={{
                        background: !lead.email ? '#9CA3AF' : TOKENS.crimson,
                        color: '#fff', border: 'none', borderRadius: 6,
                        padding: '8px 18px', fontSize: 12.5, fontWeight: 700,
                        cursor: (busyId === lead._id || !lead.email) ? 'not-allowed' : 'pointer',
                      }}>
                      {busyId === lead._id ? 'Importing…' : 'Import as Student + Parent'}
                    </button>
                  </div>
                </div>
              ))}

              {done.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: TOKENS.s400, marginBottom: 6 }}>
                    Already imported ({done.length})
                  </div>
                  {done.map(lead => (
                    <div key={lead._id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', fontSize: 12.5, color: TOKENS.s500,
                      background: '#FBFAF5', borderRadius: 6, marginBottom: 4,
                    }}>
                      <span style={{ color: '#15803D', fontWeight: 700 }}>✓</span>
                      {[lead.studentFirstName, lead.studentLastName].filter(Boolean).join(' ') || lead.name}
                      <span style={{ color: TOKENS.s400 }}>· {lead.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// TEACHERS MODULE — full faculty management
// ═══════════════════════════════════════════════════════════
// Roster grid + per-teacher detail modal with tabs:
//   Profile    — name, email, phone, bio, job title, avatar upload
//   Specialties — subjects × curricula (writes teachingSpecialties)
//   Students   — read-only view of this teacher's allocations
//   Status     — deactivate / reactivate, delete
//
// Email (memo / warning / etc.) and safe-delete-with-transfer are
// deliberately NOT here — they are Sessions B and C.
// ═══════════════════════════════════════════════════════════

function TeachersModule({ refreshKey, toast, openAddUser }) {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [localRefresh, setLocalRefresh] = useState(0)

  const loadTeachers = () => {
    setLoading(true)
    api.get('/users/teachers/list')
      .then(r => { setTeachers(r.data.teachers || []); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { loadTeachers() }, [refreshKey, localRefresh])

  const filtered = teachers.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return ((t.firstName || '') + ' ' + (t.lastName || '')).toLowerCase().includes(q) ||
           (t.email || '').toLowerCase().includes(q) ||
           (t.jobTitle || '').toLowerCase().includes(q)
  })

  const activeCount = teachers.filter(t => t.isActive !== false && !t.isOnLeave).length
  const inactiveCount = teachers.filter(t => t.isActive === false).length

  return (
    <>
      <PSection
        tag="Faculty"
        title="Teacher"
        em="Management"
        sub={teachers.length + ' teachers on staff'}
        action={<button className="btn btn-p btn-sm" onClick={() => openAddUser('teacher')}>+ Add Teacher</button>}
      />

      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Total" value={teachers.length} delta="On staff"/>
        <PKpi label="Active" value={activeCount} delta="Available now" deltaColor={TOKENS.accentEmerald}/>
        <PKpi label="On Leave" value={teachers.filter(t => t.isOnLeave).length} delta="Approved leave" deltaColor={TOKENS.accentAmber}/>
        <PKpi label="Deactivated" value={inactiveCount} delta={inactiveCount > 0 ? 'Suspended' : 'None'} deltaColor={inactiveCount > 0 ? TOKENS.accentRose : TOKENS.accentEmerald}/>
      </div>

      <PCard padding={16} style={{ marginBottom: 16 }}>
        <input className="fi" placeholder="Search teachers by name, email, or title..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 420 }} />
      </PCard>

      {loading ? (
        <PCard><div style={{ padding: 48, textAlign: 'center', color: TOKENS.s500 }}>Loading teachers...</div></PCard>
      ) : filtered.length === 0 ? (
        <PCard><div style={{ padding: 48, textAlign: 'center', color: TOKENS.s500 }}>{teachers.length === 0 ? 'No teachers yet. Click + Add Teacher to create one.' : 'No teachers match your search.'}</div></PCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(t => {
            const name = ((t.firstName || '') + ' ' + (t.lastName || '')).trim()
            const specialtyCount = Array.isArray(t.teachingSpecialties) ? t.teachingSpecialties.length : 0
            const isDeactivated = t.isActive === false
            return (
              <PCard key={t._id} accent={isDeactivated ? TOKENS.accentRose : TOKENS.accentTeal}
                style={{ cursor: 'pointer', opacity: isDeactivated ? 0.7 : 1 }}>
                <div onClick={() => setSelected(t)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                    {t.avatar ? (
                      <img src={t.avatar} alt={name}
                        style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}/>
                    ) : (
                      <Av init={initials(t.firstName, t.lastName)} col={avColor(name)} size={52}/>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 17, color: TOKENS.s900, marginBottom: 2 }}>
                        {name || 'Unnamed'}
                      </div>
                      {t.jobTitle && (
                        <div style={{ fontSize: 11.5, color: TOKENS.crimson, fontWeight: 700, marginBottom: 2 }}>
                          {t.jobTitle}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: TOKENS.s500 }}>{t.email}</div>
                    </div>
                    {isDeactivated ? (
                      <span style={{ display: 'inline-block', padding: '3px 8px', background: '#FEE2E2', color: TOKENS.accentRose, border: '1px solid #FCA5A5', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>Deactivated</span>
                    ) : t.isOnLeave ? (
                      <span style={{ display: 'inline-block', padding: '3px 8px', background: '#FEF3C7', color: TOKENS.accentAmber, border: '1px solid #FDE68A', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>On Leave</span>
                    ) : null}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TOKENS.s500, paddingTop: 12, borderTop: '1px solid ' + TOKENS.s100 }}>
                    <span>{specialtyCount} specialt{specialtyCount === 1 ? 'y' : 'ies'}</span>
                    <span>{t.createdAt ? 'Joined ' + fmtDate(t.createdAt) : ''}</span>
                  </div>
                </div>
              </PCard>
            )
          })}
        </div>
      )}

      {selected && (
        <TeacherDetailModal
          teacher={selected}
          onClose={() => setSelected(null)}
          onChanged={() => { setLocalRefresh(v => v + 1) }}
          toast={toast}
        />
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// TEACHER DETAIL MODAL
// ═══════════════════════════════════════════════════════════
function TeacherDetailModal({ teacher, onClose, onChanged, toast }) {
  const [tab, setTab] = useState('profile')
  const [tch, setTch] = useState(teacher)   // local copy, updated as we save

  const refreshTeacher = async () => {
    try {
      const { data } = await api.get('/users/teachers/list')
      const fresh = (data.teachers || []).find(t => t._id === teacher._id)
      if (fresh) setTch(fresh)
      onChanged?.()
    } catch (e) { /* silent */ }
  }

  const TABS = [
    { id: 'profile',     label: 'Profile' },
    { id: 'specialties', label: 'Specialties' },
    { id: 'students',    label: 'Students' },
    { id: 'email',       label: 'Email' },
    { id: 'status',      label: 'Status' },
  ]

  const name = ((tch.firstName || '') + ' ' + (tch.lastName || '')).trim()

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
        background: '#fff', borderRadius: 12,
        maxWidth: 720, width: '100%', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: `linear-gradient(135deg, ${TOKENS.crimson} 0%, ${TOKENS.crimsonDeep} 100%)`,
          color: TOKENS.cream,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          {tch.avatar ? (
            <img src={tch.avatar} alt={name}
              style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,.3)' }}/>
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(255,255,255,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700,
            }}>
              {initials(tch.firstName, tch.lastName)}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#F0CC5A' }}>
              {tch.jobTitle || 'Teacher'}
            </div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, marginTop: 2 }}>
              {name || 'Unnamed Teacher'}
            </div>
            <div style={{ fontSize: 12, opacity: .85 }}>{tch.email}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 2,
          borderBottom: '1px solid #E8E2D6',
          padding: '0 16px', background: '#FBFAF5',
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '12px 16px',
                background: 'transparent', border: 'none',
                borderBottom: `2.5px solid ${tab === t.id ? TOKENS.crimson : 'transparent'}`,
                color: tab === t.id ? TOKENS.crimson : '#6B6B6B',
                fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflow: 'auto', flex: 1 }}>
          {tab === 'profile' && (
            <TeacherProfileTab teacher={tch} onSaved={refreshTeacher} toast={toast} />
          )}
          {tab === 'specialties' && (
            <TeacherSpecialtiesTab teacher={tch} onSaved={refreshTeacher} toast={toast} />
          )}
          {tab === 'students' && (
            <TeacherStudentsTab teacher={tch} toast={toast} />
          )}
          {tab === 'email' && (
            <TeacherEmailTab teacher={tch} onSent={refreshTeacher} toast={toast} />
          )}
          {tab === 'status' && (
            <TeacherStatusTab teacher={tch} onSaved={refreshTeacher} onClose={onClose} toast={toast} />
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          background: '#FBFAF5', borderTop: '1px solid #E8E2D6',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button onClick={onClose}
            style={{
              background: '#fff', color: TOKENS.crimson,
              border: '1.5px solid #E8E2D6',
              padding: '9px 20px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── PROFILE TAB ───────────────────────────────────────────
function TeacherProfileTab({ teacher, onSaved, toast }) {
  const [form, setForm] = useState({
    firstName: teacher.firstName || '',
    lastName:  teacher.lastName || '',
    email:     teacher.email || '',
    phone:     teacher.phone || '',
    jobTitle:  teacher.jobTitle || '',
    bio:       teacher.bio || '',
    yearsOfExperience: teacher.yearsOfExperience || 0,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatar, setAvatar] = useState(teacher.avatar || '')

  const TITLE_PRESETS = [
    'Subject Teacher', 'Senior Teacher', 'Lead Tutor',
    'Head of Department', 'Head of Sciences', 'Head of Languages',
    'Academic Coordinator', 'Examinations Officer',
  ]

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const uploadImg = async (file) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      toast?.error?.('Image must be JPG, PNG, or WebP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast?.error?.('Image is larger than 5 MB.')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/users/' + teacher._id + '/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data?.success) {
        setAvatar(data.data.avatar)
        toast?.ok?.('Profile image updated.')
        onSaved?.()
      } else {
        toast?.error?.(data?.message || 'Upload failed.')
      }
    } catch (e) {
      toast?.error?.('Could not upload image: ' + (e?.response?.data?.message || e.message))
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast?.error?.('First and last name are required.')
      return
    }
    setSaving(true)
    try {
      const { data } = await api.patch('/users/' + teacher._id, {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        phone:     form.phone.trim(),
        jobTitle:  form.jobTitle.trim(),
        bio:       form.bio.trim(),
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
      })
      if (data?.success || data?.user) {
        toast?.ok?.('Profile saved.')
        onSaved?.()
      } else {
        toast?.error?.(data?.message || 'Save failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 12px', borderRadius: 6,
    border: '1.5px solid #E8E2D6', fontSize: 13, fontFamily: 'inherit',
  }
  const lbl = {
    display: 'block', fontSize: 10.5, fontWeight: 700,
    letterSpacing: '.06em', textTransform: 'uppercase',
    color: TOKENS.crimson, marginBottom: 4,
  }

  return (
    <div>
      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        {avatar ? (
          <img src={avatar} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E8E2D6' }}/>
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#FBF6E3', border: '2px solid #C9A030',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: TOKENS.crimson, fontSize: 24, fontWeight: 700,
          }}>
            {initials(form.firstName, form.lastName)}
          </div>
        )}
        <label style={{
          background: '#fff', color: TOKENS.crimson,
          border: `1.5px solid ${TOKENS.crimson}`,
          padding: '8px 16px', borderRadius: 6,
          cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
        }}>
          <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
            onChange={e => uploadImg(e.target.files?.[0])}/>
          {uploading ? 'Uploading...' : (avatar ? 'Change Photo' : 'Upload Photo')}
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={lbl}>First Name *</label>
          <input value={form.firstName} onChange={e => update('firstName', e.target.value)} style={inp}/>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={lbl}>Last Name *</label>
          <input value={form.lastName} onChange={e => update('lastName', e.target.value)} style={inp}/>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={lbl}>Email (read-only)</label>
        <input value={form.email} disabled style={{ ...inp, background: '#F4F4F4', color: '#6B6B6B' }}/>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={lbl}>Phone</label>
          <input value={form.phone} onChange={e => update('phone', e.target.value)} style={inp}/>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <label style={lbl}>Years of Experience</label>
          <input type="number" min={0} max={70} value={form.yearsOfExperience}
            onChange={e => update('yearsOfExperience', e.target.value)} style={inp}/>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={lbl}>Job Title</label>
        <input value={form.jobTitle} onChange={e => update('jobTitle', e.target.value)}
          placeholder="e.g. Senior Mathematics Teacher" style={inp} list="title-presets"/>
        <datalist id="title-presets">
          {TITLE_PRESETS.map(t => <option key={t} value={t}/>)}
        </datalist>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
          {TITLE_PRESETS.slice(0, 5).map(t => (
            <button key={t} onClick={() => update('jobTitle', t)}
              style={{
                background: '#FBF6E3', color: TOKENS.crimson,
                border: '1px solid #E8E2D6', borderRadius: 99,
                padding: '3px 9px', fontSize: 10.5, fontWeight: 600, cursor: 'pointer',
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>Bio</label>
        <textarea value={form.bio} onChange={e => update('bio', e.target.value)}
          rows={3} placeholder="Short professional bio..."
          style={{ ...inp, resize: 'vertical' }}/>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={save} disabled={saving}
          style={{
            background: saving ? '#9CA3AF' : TOKENS.crimson,
            color: '#fff', border: 'none',
            padding: '9px 22px', borderRadius: 6,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 700,
          }}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}

// ── SPECIALTIES TAB ───────────────────────────────────────
function TeacherSpecialtiesTab({ teacher, onSaved, toast }) {
  const CURRICULA = ['IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC', 'BNC', 'American']

  // Derive current curricula + subjectIds from teachingSpecialties
  const existingSpecs = Array.isArray(teacher.teachingSpecialties) ? teacher.teachingSpecialties : []
  const [pickedCurricula, setPickedCurricula] = useState(
    [...new Set(existingSpecs.map(s => s.curriculum).filter(Boolean))]
  )
  const [pickedSubjects, setPickedSubjects] = useState(
    [...new Set(existingSpecs.map(s => String(s.subjectId)).filter(Boolean))]
  )
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (pickedCurricula.length === 0) { setCatalog([]); return }
      setLoading(true)
      try {
        const results = await Promise.all(
          pickedCurricula.map(c => api.get('/subjects', { params: { curriculum: c } }))
        )
        if (cancelled) return
        const merged = []
        results.forEach(r => {
          const list = Array.isArray(r.data?.subjects) ? r.data.subjects : []
          list.forEach(s => {
            if (!merged.find(m => String(m._id) === String(s._id))) merged.push(s)
          })
        })
        setCatalog(merged)
      } catch (e) {
        toast?.error?.('Failed to load subjects.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [pickedCurricula, toast])

  const toggleCurr = (c) => {
    setPickedCurricula(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])
  }
  const toggleSubj = (id) => {
    setPickedSubjects(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  const filtered = catalog.filter(s =>
    !search.trim() || s.subjectName.toLowerCase().includes(search.toLowerCase())
  )

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch('/users/teachers/' + teacher._id + '/specialties', {
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
      toast?.error?.(e?.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 12px', borderRadius: 6,
    border: '1.5px solid #E8E2D6', fontSize: 13, fontFamily: 'inherit',
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Step 1 — Curricula
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CURRICULA.map(c => {
            const on = pickedCurricula.includes(c)
            return (
              <button key={c} onClick={() => toggleCurr(c)}
                style={{
                  background: on ? TOKENS.crimson : '#fff',
                  color: on ? '#fff' : TOKENS.crimson,
                  border: `1.5px solid ${on ? TOKENS.crimson : '#E8E2D6'}`,
                  padding: '7px 14px', borderRadius: 99,
                  cursor: 'pointer', fontSize: 12, fontWeight: 700,
                }}>
                {on ? '✓ ' : ''}{c}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Step 2 — Subjects ({pickedSubjects.length} selected)
        </div>
        {pickedCurricula.length === 0 ? (
          <div style={{ padding: 18, background: '#FBFAF5', borderRadius: 6, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>
            Pick at least one curriculum first.
          </div>
        ) : loading ? (
          <div style={{ padding: 18, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>Loading subjects...</div>
        ) : (
          <>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search subjects..." style={{ ...inp, marginBottom: 8 }}/>
            <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #E8E2D6', borderRadius: 6, padding: 8 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 14, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>No subjects match.</div>
              ) : filtered.map(s => {
                const on = pickedSubjects.includes(String(s._id))
                return (
                  <div key={s._id} onClick={() => toggleSubj(String(s._id))}
                    style={{
                      padding: '7px 10px', cursor: 'pointer',
                      background: on ? '#FBF6E3' : 'transparent',
                      borderRadius: 4, marginBottom: 2,
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 3,
                      border: `1.5px solid ${on ? TOKENS.crimson : '#E8E2D6'}`,
                      background: on ? TOKENS.crimson : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {on && (
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, fontSize: 13 }}>
                      <strong>{s.subjectName}</strong>{' '}
                      <span style={{ color: '#6B6B6B', fontSize: 11.5 }}>({s.curriculum})</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {pickedCurricula.length > 0 && pickedSubjects.length > 0 && (
        <div style={{
          padding: 10, marginTop: 12,
          background: '#FBF6E3', border: '1px solid #C9A030', borderRadius: 6,
          fontSize: 12, color: TOKENS.crimson,
        }}>
          This produces <strong>{pickedCurricula.length * pickedSubjects.length}</strong> specialty pair{pickedCurricula.length * pickedSubjects.length === 1 ? '' : 's'}.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
        <button onClick={save} disabled={saving}
          style={{
            background: saving ? '#9CA3AF' : TOKENS.crimson,
            color: '#fff', border: 'none',
            padding: '9px 22px', borderRadius: 6,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 700,
          }}>
          {saving ? 'Saving...' : 'Save Specialties'}
        </button>
      </div>
    </div>
  )
}

// ── STUDENTS TAB (read-only allocations view) ─────────────
function TeacherStudentsTab({ teacher, toast }) {
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const { data } = await api.get('/allocations')
        if (cancelled) return
        const mine = (data.allocations || []).filter(a =>
          (a.teacherId?._id || a.teacherId) === teacher._id && a.status === 'Active'
        )
        setAllocations(mine)
      } catch (e) {
        toast?.error?.('Failed to load allocations.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [teacher._id, toast])

  if (loading) {
    return <div style={{ padding: 18, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>Loading students...</div>
  }

  if (allocations.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, color: '#1A1A1A', marginBottom: 4 }}>
          No students yet
        </div>
        <div style={{ fontSize: 12.5, color: '#6B6B6B' }}>
          This teacher has no active student allocations. Allocate students from the Manage Students module.
        </div>
      </div>
    )
  }

  // Group allocations by subject
  const bySubject = {}
  allocations.forEach(a => {
    const subj = a.subjectId?.subjectName || 'Unknown subject'
    if (!bySubject[subj]) bySubject[subj] = []
    bySubject[subj].push(a)
  })

  return (
    <div>
      <div style={{ fontSize: 12.5, color: '#6B6B6B', marginBottom: 12 }}>
        {allocations.length} active allocation{allocations.length === 1 ? '' : 's'} across {Object.keys(bySubject).length} subject{Object.keys(bySubject).length === 1 ? '' : 's'}.
      </div>
      {Object.entries(bySubject).map(([subj, allocs]) => (
        <div key={subj} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            {subj} · {allocs.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {allocs.map(a => (
              <div key={a._id} style={{
                padding: '8px 12px',
                background: '#fff', border: '1px solid #E8E2D6', borderRadius: 6,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: TOKENS.crimson, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {(a.studentId?.firstName?.[0] || '') + (a.studentId?.lastName?.[0] || '')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>
                    {a.studentId?.firstName} {a.studentId?.lastName}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B6B6B' }}>{a.studentId?.email}</div>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700,
                  background: '#FBF6E3', color: TOKENS.crimson,
                  padding: '3px 8px', borderRadius: 99,
                }}>
                  {a.curriculum}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── EMAIL TAB (admin → teacher branded emails) ────────────
function TeacherEmailTab({ teacher, onSent, toast }) {
  // Templates — starting points the admin edits before sending.
  const TEMPLATES = {
    memo: {
      label: 'Internal Memo',
      subject: 'Internal Memo from Smartious Administration',
      body: 'This memo is to inform you of the following:\n\n[Write the announcement or information here.]\n\nPlease take note accordingly.',
    },
    meeting: {
      label: 'Meeting Request',
      subject: 'Request for a Meeting',
      body: 'We would like to schedule a meeting with you to discuss the following:\n\n[State the purpose of the meeting.]\n\nProposed date and time: [date / time]\nLocation / link: [venue or video link]\n\nKindly confirm your availability.',
    },
    commendation: {
      label: 'Letter of Commendation',
      subject: 'Recognition of Your Work',
      body: 'We would like to formally recognise and commend you for:\n\n[Describe the achievement or contribution.]\n\nYour effort makes a real difference at Smartious. Thank you.',
    },
    notice: {
      label: 'Formal Notice',
      subject: 'Formal Notice',
      body: 'This letter is to formally bring the following matter to your attention:\n\n[Describe the matter clearly and factually.]\n\nWe would like to discuss this with you. Please respond by [date], or contact the administration to arrange a meeting.\n\nThis notice is part of our standard process and a copy is retained on file.',
    },
    custom: {
      label: 'Custom Message',
      subject: '',
      body: '',
    },
  }

  const [kind, setKind] = useState('memo')
  const [subject, setSubject] = useState(TEMPLATES.memo.subject)
  const [body, setBody] = useState(TEMPLATES.memo.body)
  const [sending, setSending] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const applyTemplate = (k) => {
    setKind(k)
    setSubject(TEMPLATES[k].subject)
    setBody(TEMPLATES[k].body)
    setConfirm(false)
  }

  const send = async () => {
    if (!subject.trim()) { toast?.error?.('Subject is required.'); return }
    if (!body.trim())    { toast?.error?.('Message body is required.'); return }
    setSending(true)
    try {
      const { data } = await api.post('/users/' + teacher._id + '/send-email', {
        subject: subject.trim(), body, kind,
      })
      if (data?.success) {
        toast?.ok?.(data.message || 'Email sent.')
        setConfirm(false)
        onSent?.()
      } else {
        toast?.error?.(data?.message || 'Send failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Send failed.')
    } finally {
      setSending(false)
    }
  }

  const history = Array.isArray(teacher.sentEmails)
    ? [...teacher.sentEmails].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
    : []

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 12px', borderRadius: 6,
    border: '1.5px solid #E8E2D6', fontSize: 13, fontFamily: 'inherit',
  }
  const lbl = {
    display: 'block', fontSize: 10.5, fontWeight: 700,
    letterSpacing: '.06em', textTransform: 'uppercase',
    color: TOKENS.crimson, marginBottom: 4,
  }

  return (
    <div>
      <div style={{ fontSize: 12.5, color: '#6B6B6B', marginBottom: 14, lineHeight: 1.5 }}>
        Compose an email to <strong>{teacher.firstName} {teacher.lastName}</strong> ({teacher.email}).
        Pick a template as a starting point, then edit the wording before sending.
      </div>

      {/* Template picker */}
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Template</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.entries(TEMPLATES).map(([k, t]) => (
            <button key={k} onClick={() => applyTemplate(k)}
              style={{
                background: kind === k ? TOKENS.crimson : '#fff',
                color: kind === k ? '#fff' : TOKENS.crimson,
                border: `1.5px solid ${kind === k ? TOKENS.crimson : '#E8E2D6'}`,
                padding: '6px 12px', borderRadius: 99,
                cursor: 'pointer', fontSize: 11.5, fontWeight: 700,
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {kind === 'notice' && (
        <div style={{
          padding: 10, marginBottom: 12,
          background: '#FEF3C7', border: '1px solid #F59E0B',
          borderRadius: 6, fontSize: 11.5, color: '#92400E', lineHeight: 1.5,
        }}>
          A formal notice is a sensitive document. Write it factually and
          specifically. Review every line before sending — this is recorded
          in the teacher's email history.
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label style={lbl}>Subject</label>
        <input value={subject} onChange={e => { setSubject(e.target.value); setConfirm(false) }}
          placeholder="Email subject" style={inp}/>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Message</label>
        <textarea value={body} onChange={e => { setBody(e.target.value); setConfirm(false) }}
          rows={10} placeholder="Write your message. Leave a blank line between paragraphs."
          style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}/>
        <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 4 }}>
          The message is wrapped in the Smartious branded template, addressed to the teacher, and signed with your name. Blank lines become paragraph breaks.
        </div>
      </div>

      {/* Send with two-step confirm */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 22 }}>
        {!confirm ? (
          <button onClick={() => setConfirm(true)}
            style={{
              background: TOKENS.crimson, color: '#fff', border: 'none',
              padding: '9px 22px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            Review &amp; Send
          </button>
        ) : (
          <>
            <span style={{ fontSize: 12, color: '#6B6B6B', alignSelf: 'center' }}>
              Send this email to {teacher.email}?
            </span>
            <button onClick={() => setConfirm(false)} disabled={sending}
              style={{
                background: '#fff', color: '#6B6B6B',
                border: '1.5px solid #E8E2D6',
                padding: '9px 16px', borderRadius: 6,
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}>
              Cancel
            </button>
            <button onClick={send} disabled={sending}
              style={{
                background: sending ? '#9CA3AF' : '#15803D',
                color: '#fff', border: 'none',
                padding: '9px 22px', borderRadius: 6,
                cursor: sending ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 700,
              }}>
              {sending ? 'Sending...' : 'Confirm Send'}
            </button>
          </>
        )}
      </div>

      {/* History */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Email History ({history.length})
        </div>
        {history.length === 0 ? (
          <div style={{ padding: 14, background: '#FBFAF5', borderRadius: 6, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>
            No emails sent to this teacher yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {history.map((h, i) => (
              <div key={i} style={{
                padding: '8px 12px',
                background: '#fff', border: '1px solid #E8E2D6', borderRadius: 6,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1A1A' }}>
                    {h.subject}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B6B6B' }}>
                    {h.sentByName || 'Admin'} · {h.sentAt ? new Date(h.sentAt).toLocaleDateString() : ''}
                  </div>
                </div>
                <div style={{
                  fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
                  background: '#FBF6E3', color: TOKENS.crimson,
                  padding: '3px 8px', borderRadius: 99,
                }}>
                  {h.kind || 'memo'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── STATUS TAB (deactivate / reactivate / delete) ─────────
function TeacherStatusTab({ teacher, onSaved, onClose, toast }) {
  const [reason, setReason] = useState('')
  const [working, setWorking] = useState(false)
  const isActive = teacher.isActive !== false

  // Delete flow state
  const [deleteImpact, setDeleteImpact] = useState(null)   // null | {...} | 'loading'
  const [deleteConfirm, setDeleteConfirm] = useState('')   // typed confirmation
  const [deleting, setDeleting] = useState(false)

  const loadDeleteImpact = async () => {
    setDeleteImpact('loading')
    try {
      const { data } = await api.get('/users/' + teacher._id + '/delete-impact')
      if (data?.success) setDeleteImpact(data.data)
      else { setDeleteImpact(null); toast?.error?.(data?.message || 'Could not check impact.') }
    } catch (e) {
      setDeleteImpact(null)
      toast?.error?.(e?.response?.data?.message || 'Could not check impact.')
    }
  }

  const doDelete = async () => {
    setDeleting(true)
    try {
      const { data } = await api.delete('/users/' + teacher._id)
      if (data?.success) {
        toast?.ok?.(`Teacher deleted. ${data.data?.deactivatedAllocations || 0} allocation(s) deactivated.`)
        onSaved?.()
        onClose?.()
      } else {
        toast?.error?.(data?.message || 'Delete failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  const setActive = async (makeActive) => {
    if (!makeActive && !reason.trim()) {
      toast?.error?.('Please give a reason for deactivation.')
      return
    }
    setWorking(true)
    try {
      const { data } = await api.patch('/users/' + teacher._id, {
        isActive: makeActive,
        ...(makeActive ? {} : { statusReason: reason.trim() }),
      })
      if (data?.success || data?.user) {
        toast?.ok?.(makeActive ? 'Teacher reactivated.' : 'Teacher deactivated.')
        onSaved?.()
      } else {
        toast?.error?.(data?.message || 'Failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Failed.')
    } finally {
      setWorking(false)
    }
  }

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 12px', borderRadius: 6,
    border: '1.5px solid #E8E2D6', fontSize: 13, fontFamily: 'inherit',
  }

  return (
    <div>
      {/* Current status */}
      <div style={{
        padding: 14, borderRadius: 8, marginBottom: 18,
        background: isActive ? '#DCFCE7' : '#FEE2E2',
        border: `1px solid ${isActive ? '#86EFAC' : '#FCA5A5'}`,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: isActive ? '#15803D' : '#B91C1C' }}>
          Current Status
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: isActive ? '#15803D' : '#B91C1C', marginTop: 2 }}>
          {isActive ? 'Active' : 'Deactivated'}
        </div>
        {!isActive && teacher.statusReason && (
          <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4 }}>
            Reason: {teacher.statusReason}
          </div>
        )}
      </div>

      {/* Deactivate / Reactivate */}
      {isActive ? (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
            Temporarily deactivate
          </div>
          <p style={{ fontSize: 12.5, color: '#6B6B6B', margin: '0 0 10px', lineHeight: 1.5 }}>
            The teacher keeps their account and data but cannot log in. Their allocations stay intact and can be restored by reactivating. Use this for suspensions or leave that isn't a formal leave request.
          </p>
          <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: TOKENS.crimson, display: 'block', marginBottom: 4 }}>
            Reason for deactivation
          </label>
          <input value={reason} onChange={e => setReason(e.target.value)}
            placeholder="e.g. Suspended pending review" style={{ ...inp, marginBottom: 10 }}/>
          <button onClick={() => setActive(false)} disabled={working}
            style={{
              background: working ? '#9CA3AF' : '#B45309',
              color: '#fff', border: 'none',
              padding: '9px 18px', borderRadius: 6,
              cursor: working ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
            }}>
            {working ? 'Working...' : 'Deactivate Account'}
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
            Reactivate
          </div>
          <p style={{ fontSize: 12.5, color: '#6B6B6B', margin: '0 0 10px', lineHeight: 1.5 }}>
            Restores login access. Allocations and data are unchanged.
          </p>
          <button onClick={() => setActive(true)} disabled={working}
            style={{
              background: working ? '#9CA3AF' : '#15803D',
              color: '#fff', border: 'none',
              padding: '9px 18px', borderRadius: 6,
              cursor: working ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
            }}>
            {working ? 'Working...' : 'Reactivate Account'}
          </button>
        </div>
      )}

      {/* Permanently delete — MODEL A: content stays with the subject */}
      <div style={{
        padding: 14, borderRadius: 8,
        background: '#FEF2F2', border: '1px solid #FCA5A5',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#B91C1C', marginBottom: 4 }}>
          Permanently delete
        </div>
        <p style={{ fontSize: 12.5, color: '#6B6B6B', margin: '0 0 10px', lineHeight: 1.5 }}>
          Lessons and other teaching content belong to the subject — they are
          kept and pass to whoever teaches the subject next. Deleting this
          teacher only removes their account and deactivates their student
          allocations (which you can then reassign).
        </p>

        {deleteImpact === null && (
          <button onClick={loadDeleteImpact}
            style={{
              background: '#fff', color: '#B91C1C',
              border: '1.5px solid #B91C1C',
              padding: '8px 16px', borderRadius: 6,
              cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
            }}>
            Delete this teacher...
          </button>
        )}

        {deleteImpact === 'loading' && (
          <div style={{ fontSize: 12.5, color: '#6B6B6B' }}>Checking impact...</div>
        )}

        {deleteImpact && deleteImpact !== 'loading' && (
          <div>
            {deleteImpact.blocked ? (
              <div style={{ fontSize: 12.5, color: '#B91C1C', fontWeight: 600 }}>
                This account is protected and cannot be deleted.
              </div>
            ) : (
              <>
                <div style={{
                  background: '#fff', border: '1px solid #FCA5A5',
                  borderRadius: 6, padding: 12, marginBottom: 10,
                  fontSize: 12.5, color: '#1A1A1A',
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Deleting {deleteImpact.teacherName} will:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div>• Deactivate <strong>{deleteImpact.activeAllocations}</strong> active student allocation{deleteImpact.activeAllocations === 1 ? '' : 's'} — reassign these to another teacher afterwards</div>
                    <div>• <strong>Keep</strong> all {deleteImpact.authoredLessons} lesson{deleteImpact.authoredLessons === 1 ? '' : 's'} they authored — these stay with the subject</div>
                    <div>• Remove the teacher's login and account permanently</div>
                  </div>
                </div>
                <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#B91C1C', display: 'block', marginBottom: 4 }}>
                  Type DELETE to confirm
                </label>
                <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '8px 12px', borderRadius: 6,
                    border: '1.5px solid #FCA5A5', fontSize: 13,
                    fontFamily: 'inherit', marginBottom: 10,
                  }}/>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setDeleteImpact(null); setDeleteConfirm('') }}
                    disabled={deleting}
                    style={{
                      background: '#fff', color: '#6B6B6B',
                      border: '1.5px solid #E8E2D6',
                      padding: '8px 16px', borderRadius: 6,
                      cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                    }}>
                    Cancel
                  </button>
                  <button onClick={doDelete}
                    disabled={deleting || deleteConfirm !== 'DELETE'}
                    style={{
                      background: (deleting || deleteConfirm !== 'DELETE') ? '#9CA3AF' : '#B91C1C',
                      color: '#fff', border: 'none',
                      padding: '8px 18px', borderRadius: 6,
                      cursor: (deleting || deleteConfirm !== 'DELETE') ? 'not-allowed' : 'pointer',
                      fontSize: 12.5, fontWeight: 700,
                    }}>
                    {deleting ? 'Deleting...' : 'Permanently Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════
// FRONT DESK MODULE — landing-page lead capture & analysis
// ═══════════════════════════════════════════════════════════
// Two views:
//   Leads   — every website submission, filterable, workable
//             (new → contacted → converted → closed)
//   Insights — market analysis: country, programme, curriculum,
//             source channel, 30-day trend
// ═══════════════════════════════════════════════════════════

const FD_STATUS = {
  new:       { label: 'New',       bg: '#FEF3C7', fg: '#92400E' },
  contacted: { label: 'Contacted', bg: '#DBEAFE', fg: '#1E40AF' },
  converted: { label: 'Converted', bg: '#DCFCE7', fg: '#15803D' },
  closed:    { label: 'Closed',    bg: '#F1F1F1', fg: '#6B6B6B' },
}
const FD_TYPE = {
  registration: { label: 'Registration', bg: '#7B0D0D', fg: '#fff' },
  consultation: { label: 'Consultation', bg: '#C9A030', fg: '#3A2A00' },
  contact:      { label: 'Message',      bg: '#E8E2D6', fg: '#3A3A3A' },
}

// ═══════════════════════════════════════════════════════════
// DOCUMENTS MODULE — financial document generators (Admin)
// First generator: Invoice. Fills a form, then generates the
// branded invoice and opens it for PDF download.
// ═══════════════════════════════════════════════════════════
function DocumentsModule({ toast }) {
  const [docType, setDocType] = useState(null)

  if (docType === 'invoice') {
    return <InvoiceGenerator toast={toast} onBack={() => setDocType(null)} />
  }
  if (docType === 'receipt') {
    return <ReceiptGenerator toast={toast} onBack={() => setDocType(null)} />
  }

  const card = {
    background: '#fff', border: '1px solid ' + TOKENS.line, borderRadius: 14,
    padding: 22, cursor: 'pointer', transition: 'all .18s',
  }
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: TOKENS.s900, margin: 0 }}>
          Documents
        </h1>
        <div style={{ fontSize: 13, color: TOKENS.s500, marginTop: 2 }}>
          Generate branded financial documents.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        <div style={card} onClick={() => setDocType('invoice')}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, background: 'rgba(125,16,37,.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TOKENS.crimson} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: TOKENS.s900 }}>Invoice</div>
          <div style={{ fontSize: 12, color: TOKENS.s500, marginTop: 4, lineHeight: 1.5 }}>
            A branded invoice — billed-to details, line items, auto-calculated totals and payment instructions.
          </div>
        </div>
        <div style={card} onClick={() => setDocType('receipt')}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, background: 'rgba(125,16,37,.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TOKENS.crimson} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: TOKENS.s900 }}>Receipt</div>
          <div style={{ fontSize: 12, color: TOKENS.s500, marginTop: 4, lineHeight: 1.5 }}>
            An official payment receipt — amount, reference, payment method and authorisation.
          </div>
        </div>
      </div>
    </div>
  )
}

// ── INVOICE GENERATOR ──────────────────────────────────────
function InvoiceGenerator({ toast, onBack }) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  const [f, setF] = useState({
    billedTo: '', studentName: '',
    invoiceNo: '', dateIssued: today, dueDate: '', period: '',
    currency: 'KES',
    items: [{ desc: '', period: '', amount: '' }],
    discount: '', vatPct: '0',
    paymentNote: 'Please use the invoice number as the payment reference.',
    notes: 'This invoice is computer-generated and valid without a signature.\nLate payment may result in suspension of tuition sessions.',
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const itemAdd = () => setF(p => ({ ...p, items: [...p.items, { desc: '', period: '', amount: '' }] }))
  const itemSet = (i, key, v) => setF(p => ({ ...p, items: p.items.map((r, idx) => idx === i ? { ...r, [key]: v } : r) }))
  const itemDel = (i) => setF(p => {
    const next = p.items.filter((_, idx) => idx !== i)
    return { ...p, items: next.length ? next : [{ desc: '', period: '', amount: '' }] }
  })

  // ── live totals ──
  const subTotal = f.items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0)
  const discount = parseFloat(f.discount) || 0
  const vatPct = parseFloat(f.vatPct) || 0
  const vatAmount = (subTotal - discount) * (vatPct / 100)
  const totalDue = subTotal - discount + vatAmount

  const generate = () => {
    if (!f.billedTo.trim())  { toast?.error?.('Billed-to name is required.'); return }
    if (!f.invoiceNo.trim()) { toast?.error?.('Invoice number is required.'); return }
    if (!f.items.some(it => (it.desc || '').trim() && (parseFloat(it.amount) || 0) > 0)) {
      toast?.error?.('Add at least one line item with an amount.'); return
    }
    const html = buildInvoiceHTML(f, { subTotal, discount, vatAmount, vatPct, totalDue })
    const w = window.open('', '_blank')
    if (!w) { toast?.error?.('Please allow pop-ups to generate the invoice.'); return }
    w.document.write(html); w.document.close()
  }

  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
    textTransform: 'uppercase', color: TOKENS.crimson, marginBottom: 5 }
  const inp = { width: '100%', boxSizing: 'border-box', padding: '8px 11px',
    borderRadius: 7, border: '1.5px solid ' + TOKENS.line, fontSize: 13, fontFamily: 'inherit' }
  const card = { background: '#fff', border: '1px solid ' + TOKENS.line, borderRadius: 12,
    padding: 18, marginBottom: 14 }
  const addBtn = { background: 'transparent', border: '1.5px dashed ' + TOKENS.gold,
    color: '#9A7B16', borderRadius: 7, padding: '6px 12px', fontSize: 12,
    fontWeight: 700, cursor: 'pointer', marginTop: 6 }
  const delBtn = { background: 'transparent', border: 'none', color: '#B91C1C',
    cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px', flexShrink: 0 }
  const money = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button onClick={onBack} style={{
          background: '#fff', border: '1.5px solid ' + TOKENS.line, borderRadius: 8,
          padding: '7px 13px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: TOKENS.crimson,
        }}>← Documents</button>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: TOKENS.s900, margin: 0 }}>Invoice</h1>
          <div style={{ fontSize: 12, color: TOKENS.s500 }}>Fill the invoice, then generate the branded PDF.</div>
        </div>
      </div>

      {/* Billed-to + meta */}
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div><label style={lbl}>Billed To *</label>
            <input value={f.billedTo} onChange={e => set('billedTo', e.target.value)} placeholder="Client / parent name" style={inp}/></div>
          <div><label style={lbl}>Student Name</label>
            <input value={f.studentName} onChange={e => set('studentName', e.target.value)} placeholder="Student name" style={inp}/></div>
          <div><label style={lbl}>Invoice No. *</label>
            <input value={f.invoiceNo} onChange={e => set('invoiceNo', e.target.value)} placeholder="e.g. SMT-2026-0515" style={inp}/></div>
          <div><label style={lbl}>Date Issued</label>
            <input value={f.dateIssued} onChange={e => set('dateIssued', e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Due Date</label>
            <input value={f.dueDate} onChange={e => set('dueDate', e.target.value)} placeholder="e.g. 16 May 2026" style={inp}/></div>
          <div><label style={lbl}>Period</label>
            <input value={f.period} onChange={e => set('period', e.target.value)} placeholder="e.g. May 2026" style={inp}/></div>
          <div><label style={lbl}>Currency</label>
            <select value={f.currency} onChange={e => set('currency', e.target.value)} style={inp}>
              <option value="KES">KES</option><option value="USD">USD</option>
            </select></div>
        </div>
      </div>

      {/* Line items */}
      <div style={card}>
        <label style={lbl}>Line Items</label>
        <div style={{ fontSize: 11, color: TOKENS.s500, marginBottom: 8 }}>
          Sub-total and total are calculated automatically from the amounts below.
        </div>
        {f.items.map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <input value={row.desc} onChange={e => itemSet(i, 'desc', e.target.value)}
              placeholder="Description" style={{ ...inp, flex: '1 1 240px' }}/>
            <input value={row.period} onChange={e => itemSet(i, 'period', e.target.value)}
              placeholder="Period" style={{ ...inp, width: 120, flex: '0 0 120px' }}/>
            <input value={row.amount} onChange={e => itemSet(i, 'amount', e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="Amount" style={{ ...inp, width: 110, flex: '0 0 110px', textAlign: 'right' }}/>
            <button onClick={() => itemDel(i)} style={delBtn} title="Remove">×</button>
          </div>
        ))}
        <button onClick={itemAdd} style={addBtn}>+ Add Line Item</button>
      </div>

      {/* Discount / VAT + live totals */}
      <div style={card}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '0 0 150px' }}><label style={lbl}>Discount ({f.currency})</label>
            <input value={f.discount} onChange={e => set('discount', e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00" style={inp}/></div>
          <div style={{ flex: '0 0 110px' }}><label style={lbl}>VAT %</label>
            <input value={f.vatPct} onChange={e => set('vatPct', e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0" style={inp}/></div>
          <div style={{ flex: 1, minWidth: 200, background: TOKENS.cream, borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TOKENS.s500, padding: '2px 0' }}>
              <span>Sub-total</span><span>{f.currency} {money(subTotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TOKENS.s500, padding: '2px 0' }}>
              <span>Discount</span><span>− {money(discount)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TOKENS.s500, padding: '2px 0' }}>
              <span>VAT ({vatPct}%)</span><span>{money(vatAmount)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: TOKENS.crimson, padding: '4px 0 0', borderTop: '1px solid ' + TOKENS.line, marginTop: 4 }}>
              <span>TOTAL DUE</span><span>{f.currency} {money(totalDue)}</span></div>
          </div>
        </div>
      </div>

      {/* Payment + notes */}
      <div style={card}>
        <div style={{ marginBottom: 12 }}><label style={lbl}>Payment Note</label>
          <textarea value={f.paymentNote} onChange={e => set('paymentNote', e.target.value)} rows={2}
            style={{ ...inp, resize: 'vertical' }}/></div>
        <div><label style={lbl}>Notes</label>
          <textarea value={f.notes} onChange={e => set('notes', e.target.value)} rows={3}
            style={{ ...inp, resize: 'vertical' }}/></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 30 }}>
        <button onClick={generate} style={{
          background: TOKENS.crimson, color: '#fff', border: 'none', borderRadius: 8,
          padding: '12px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>Generate Invoice</button>
      </div>
    </div>
  )
}

// ── Build the branded invoice HTML ─────────────────────────
function buildInvoiceHTML(f, t) {
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const money = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const cur = esc(f.currency || 'KES')
  const items = (f.items || []).filter(it => (it.desc || '').trim())

  const itemRows = items.map(it => `<tr>
    <td class="desc">${esc(it.desc).replace(/\n/g, '<br>')}</td>
    <td>${esc(it.period)}</td>
    <td class="r">${money(parseFloat(it.amount) || 0)}</td>
  </tr>`).join('')

  const notesHtml = esc(f.notes).split('\n').map(l => l.trim()).filter(Boolean)
    .map(l => `${l}<br>`).join('')
  const payHtml = esc(f.paymentNote).split('\n').map(l => l.trim()).filter(Boolean)
    .map(l => `${l}<br>`).join('')

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Invoice ${esc(f.invoiceNo)} — Smartious</title>
<style>
  :root{--crimson:#7D1025;--crimsonD:#5A0B1B;--gold:#C9A030;--ink:#1A1A1A;--mute:#6B6B6B;--line:#E8E2D6;--cream:#FBFAF5;}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#e9e6df;color:var(--ink)}
  .page{width:210mm;min-height:297mm;background:#fff;margin:18px auto;position:relative;display:flex;flex-direction:column;box-shadow:0 4px 24px rgba(0,0,0,.13)}
  .page-body{padding:0 22mm;flex:1}
  .topbar{height:8mm;background:linear-gradient(90deg,var(--crimsonD),var(--crimson))}
  .hd{display:flex;justify-content:space-between;align-items:flex-start;padding:11mm 22mm 0}
  .brand{display:flex;align-items:center;gap:10px}
  .shield{width:50px;height:55px;flex-shrink:0}
  .brand-tx .name{font-size:22px;font-weight:800;letter-spacing:-.5px;line-height:1}
  .brand-tx .name em{font-style:italic;color:var(--crimson)}
  .brand-tx .tag{font-size:7px;letter-spacing:3px;color:var(--mute);margin-top:3px;font-weight:600}
  .hd-r{text-align:right}
  .doc-title{font-size:32px;font-weight:800;letter-spacing:1px;color:var(--ink);line-height:1}
  .doc-underline{height:3px;width:100%;background:var(--gold);margin-top:5px}
  .meta-row{display:flex;justify-content:space-between;margin-top:9mm;gap:20px}
  .billed .lbl{font-size:9px;font-weight:700;letter-spacing:1px;color:var(--mute);text-transform:uppercase}
  .billed .who{font-size:17px;font-weight:800;color:var(--ink);margin-top:5px}
  .billed .sub{font-size:11px;color:var(--mute);margin-top:2px}
  .inv-meta{font-size:10.5px;min-width:62mm}
  .inv-meta .mr{display:flex;justify-content:space-between;padding:3px 0}
  .inv-meta .mk{color:var(--mute)}
  .inv-meta .mv{font-weight:700;color:var(--ink)}
  .items{margin-top:8mm;border-collapse:collapse;width:100%}
  .items thead td{background:var(--crimson);color:#fff;font-size:9.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;padding:9px 12px}
  .items thead td.r{text-align:right}
  .items tbody td{border-bottom:1px solid var(--line);padding:11px 12px;font-size:11px;vertical-align:top}
  .items tbody td.r{text-align:right}
  .items .desc{font-weight:600;color:var(--ink)}
  .totals{margin-top:6mm;display:flex;justify-content:flex-end}
  .totals-box{width:72mm}
  .tr{display:flex;justify-content:space-between;padding:6px 12px;font-size:11px}
  .tr .tk{color:var(--mute)}
  .tr .tv{font-weight:600}
  .tr.total{background:var(--crimson);color:#fff;padding:11px 12px;margin-top:5px}
  .tr.total .tk{color:#fff;font-weight:700;font-size:11px;letter-spacing:.5px}
  .tr.total .tv{color:#fff;font-weight:800;font-size:15px}
  .sec{margin-top:9mm}
  .sec-h{font-size:9.5px;font-weight:700;letter-spacing:1px;color:var(--mute);text-transform:uppercase;margin-bottom:6px}
  .sec p{font-size:10.5px;line-height:1.7;color:#2c2c2c}
  .notes p{font-style:italic;color:var(--mute)}
  .ft{margin-top:auto;border-top:1px solid var(--line);padding:5mm 22mm;text-align:center;font-size:8.5px;color:var(--mute);line-height:1.6}
  .ft b{color:var(--crimson);font-size:9.5px;letter-spacing:.5px}
  .toolbar{position:fixed;top:0;left:0;right:0;background:#7D1025;color:#fff;padding:10px 20px;display:flex;justify-content:space-between;align-items:center;z-index:99}
  .toolbar button{background:#fff;color:#7D1025;border:none;padding:8px 18px;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer}
  .toolbar .hint{font-size:12px;opacity:.85}
  @media print{
    body{background:#fff}.toolbar{display:none}
    .page{margin:0;box-shadow:none;width:100%;min-height:auto}
    @page{size:A4;margin:0}
  }
</style></head><body>
<div class="toolbar">
  <span class="hint">Review the invoice, then download. Use "Save as PDF" as the destination.</span>
  <button onclick="window.print()">Download PDF</button>
</div>
<div style="height:48px"></div>

<div class="page">
  <div class="topbar"></div>
  <div class="hd">
    <div class="brand">
      <svg class="shield" viewBox="0 0 60 66">
        <path d="M30 2 L56 9 V32 C56 47 44 58 30 63 C16 58 4 47 4 32 V9 Z" fill="#8A1228" stroke="#C9A030" stroke-width="2"/>
        <path d="M30 13 l2.3 4.7 5.2 .75 -3.75 3.65 .9 5.15 -4.65 -2.45 -4.65 2.45 .9 -5.15 -3.75 -3.65 5.2 -.75 Z" fill="#C9A030"/>
        <g transform="translate(30 40)">
          <path d="M0 -6 C-4 -9 -11 -9 -14 -7 L-14 9 C-11 7 -4 7 0 10 Z" fill="#FFFFFF" stroke="#E3D9C4" stroke-width="0.6"/>
          <path d="M0 -6 C4 -9 11 -9 14 -7 L14 9 C11 7 4 7 0 10 Z" fill="#FFFFFF" stroke="#E3D9C4" stroke-width="0.6"/>
          <line x1="-10" y1="-3.5" x2="-3.5" y2="-2" stroke="#E7B7C0" stroke-width="0.8"/>
          <line x1="-10" y1="0" x2="-3.5" y2="1.5" stroke="#E7B7C0" stroke-width="0.8"/>
          <line x1="-10" y1="3.5" x2="-3.5" y2="5" stroke="#E7B7C0" stroke-width="0.8"/>
          <line x1="3.5" y1="-2" x2="10" y2="-3.5" stroke="#E7B7C0" stroke-width="0.8"/>
          <line x1="3.5" y1="1.5" x2="10" y2="0" stroke="#E7B7C0" stroke-width="0.8"/>
          <line x1="3.5" y1="5" x2="10" y2="3.5" stroke="#E7B7C0" stroke-width="0.8"/>
        </g>
      </svg>
      <div class="brand-tx"><div class="name">Smart<em>ious</em></div>
        <div class="tag">HOMESCHOOL&nbsp;·&nbsp;GLOBAL</div></div>
    </div>
    <div class="hd-r"><div class="doc-title">INVOICE</div><div class="doc-underline"></div></div>
  </div>

  <div class="page-body">
    <div class="meta-row">
      <div class="billed">
        <div class="lbl">Billed To</div>
        <div class="who">${esc(f.billedTo)}</div>
        ${f.studentName ? `<div class="sub">Student: ${esc(f.studentName)}</div>` : ''}
      </div>
      <div class="inv-meta">
        <div class="mr"><span class="mk">Invoice No.</span><span class="mv">${esc(f.invoiceNo)}</span></div>
        <div class="mr"><span class="mk">Date Issued</span><span class="mv">${esc(f.dateIssued)}</span></div>
        <div class="mr"><span class="mk">Due Date</span><span class="mv">${esc(f.dueDate) || '—'}</span></div>
        <div class="mr"><span class="mk">Period</span><span class="mv">${esc(f.period) || '—'}</span></div>
      </div>
    </div>

    <table class="items">
      <thead><tr><td>Description</td><td>Period</td><td class="r">Amount (${cur})</td></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div class="totals"><div class="totals-box">
      <div class="tr"><span class="tk">Sub-total</span><span class="tv">${cur} ${money(t.subTotal)}</span></div>
      <div class="tr"><span class="tk">Discount</span><span class="tv">${money(t.discount)}</span></div>
      <div class="tr"><span class="tk">VAT (${t.vatPct}%)</span><span class="tv">${money(t.vatAmount)}</span></div>
      <div class="tr total"><span class="tk">TOTAL DUE</span><span class="tv">${cur} ${money(t.totalDue)}</span></div>
    </div></div>

    <div class="sec">
      <div class="sec-h">Payment Instructions</div>
      <p>M-Pesa Paybill No: <b style="color:var(--ink)">247247</b><br>
         Account Number: <b style="color:var(--ink)">745021</b><br>
         ${payHtml}</p>
    </div>
    <div class="sec notes">
      <div class="sec-h">Notes</div>
      <p>${notesHtml}</p>
    </div>
  </div>

  <div class="ft">
    <b>Smartious Homeschool Global</b><br>
    Diamond Plaza I, Parklands, Nairobi, Kenya<br>
    +254 745 021 212 &nbsp;|&nbsp; hellosmartious@gmail.com &nbsp;|&nbsp; smartioushomeschool.com
  </div>
</div>
</body></html>`
}

// ── RECEIPT GENERATOR ──────────────────────────────────────
function ReceiptGenerator({ toast, onBack }) {
  const now = new Date()
  const today = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  const timeNow = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

  const [f, setF] = useState({
    currency: 'KES',
    amount: '',
    receivedBy: 'Smartious Edtech',
    mpesaAccount: '745021',
    referenceNo: '',
    paymentMethod: 'M-Pesa Paybill — 247247',
    dateTime: today + ' | ' + timeNow + ' hrs',
    status: 'Confirmed',
    paidFor: '',
    authName: '',
    authRole: 'Principal, Smartious Homeschool Global',
    paidDate: today,
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const generate = () => {
    if (!f.amount || !(parseFloat(f.amount) > 0)) { toast?.error?.('A valid amount is required.'); return }
    if (!f.referenceNo.trim()) { toast?.error?.('Reference number is required.'); return }
    if (!f.authName.trim())    { toast?.error?.('Authoriser name is required.'); return }
    const html = buildReceiptHTML(f)
    const w = window.open('', '_blank')
    if (!w) { toast?.error?.('Please allow pop-ups to generate the receipt.'); return }
    w.document.write(html); w.document.close()
  }

  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
    textTransform: 'uppercase', color: TOKENS.crimson, marginBottom: 5 }
  const inp = { width: '100%', boxSizing: 'border-box', padding: '8px 11px',
    borderRadius: 7, border: '1.5px solid ' + TOKENS.line, fontSize: 13, fontFamily: 'inherit' }
  const card = { background: '#fff', border: '1px solid ' + TOKENS.line, borderRadius: 12,
    padding: 18, marginBottom: 14 }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button onClick={onBack} style={{
          background: '#fff', border: '1.5px solid ' + TOKENS.line, borderRadius: 8,
          padding: '7px 13px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: TOKENS.crimson,
        }}>← Documents</button>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: TOKENS.s900, margin: 0 }}>Official Receipt</h1>
          <div style={{ fontSize: 12, color: TOKENS.s500 }}>Confirm a payment received, then generate the branded PDF.</div>
        </div>
      </div>

      {/* Amount + payment details */}
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div><label style={lbl}>Currency</label>
            <select value={f.currency} onChange={e => set('currency', e.target.value)} style={inp}>
              <option value="KES">KES</option><option value="USD">USD</option>
            </select></div>
          <div><label style={lbl}>Amount Paid *</label>
            <input value={f.amount} onChange={e => set('amount', e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="e.g. 158200" style={inp}/></div>
          <div><label style={lbl}>Reference No. *</label>
            <input value={f.referenceNo} onChange={e => set('referenceNo', e.target.value)}
              placeholder="e.g. UE5S8BDTRX" style={inp}/></div>
          <div><label style={lbl}>Received By</label>
            <input value={f.receivedBy} onChange={e => set('receivedBy', e.target.value)} style={inp}/></div>
          <div><label style={lbl}>M-Pesa Account</label>
            <input value={f.mpesaAccount} onChange={e => set('mpesaAccount', e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Payment Method</label>
            <input value={f.paymentMethod} onChange={e => set('paymentMethod', e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Date &amp; Time</label>
            <input value={f.dateTime} onChange={e => set('dateTime', e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Status</label>
            <select value={f.status} onChange={e => set('status', e.target.value)} style={inp}>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cleared">Cleared</option>
            </select></div>
        </div>
        <div style={{ marginTop: 12 }}><label style={lbl}>Payment For (optional)</label>
          <input value={f.paidFor} onChange={e => set('paidFor', e.target.value)}
            placeholder="e.g. A-Level Mathematics Tuition — May 2026" style={inp}/></div>
      </div>

      {/* Authorisation */}
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div><label style={lbl}>Authorised By (Name) *</label>
            <input value={f.authName} onChange={e => set('authName', e.target.value)}
              placeholder="e.g. Alfred Ouko" style={inp}/></div>
          <div><label style={lbl}>Role / Title</label>
            <input value={f.authRole} onChange={e => set('authRole', e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Paid Date (stamp)</label>
            <input value={f.paidDate} onChange={e => set('paidDate', e.target.value)} style={inp}/></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 30 }}>
        <button onClick={generate} style={{
          background: TOKENS.crimson, color: '#fff', border: 'none', borderRadius: 8,
          padding: '12px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>Generate Receipt</button>
      </div>
    </div>
  )
}

// ── Build the branded receipt HTML ─────────────────────────
function buildReceiptHTML(f) {
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const cur = esc(f.currency || 'KES')
  const amt = Number(parseFloat(f.amount) || 0)
    .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Receipt ${esc(f.referenceNo)} — Smartious</title>
<style>
  :root{--crimson:#7D1025;--crimsonD:#5A0B1B;--gold:#C9A030;--ink:#1A1A1A;--mute:#6B6B6B;--line:#E8E2D6;--cream:#FBFAF5;--green:#15803D;}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#e9e6df;color:var(--ink)}
  .page{width:210mm;min-height:297mm;background:#fff;margin:18px auto;position:relative;display:flex;flex-direction:column;box-shadow:0 4px 24px rgba(0,0,0,.13)}
  .page-body{padding:0 22mm;flex:1}
  .topbar{height:8mm;background:linear-gradient(90deg,var(--crimsonD),var(--crimson))}
  .hd{display:flex;justify-content:space-between;align-items:flex-start;padding:11mm 22mm 0}
  .brand{display:flex;align-items:center;gap:10px}
  .shield{width:50px;height:55px;flex-shrink:0}
  .brand-tx .name{font-size:22px;font-weight:800;letter-spacing:-.5px;line-height:1}
  .brand-tx .name em{font-style:italic;color:var(--crimson)}
  .brand-tx .tag{font-size:7px;letter-spacing:3px;color:var(--mute);margin-top:3px;font-weight:600}
  .hd-r{text-align:right}
  .doc-title{font-size:26px;font-weight:800;letter-spacing:.5px;color:var(--ink);line-height:1}
  .doc-sub{font-size:9px;color:var(--mute);margin-top:4px;letter-spacing:.5px}
  .gold-rule{height:2px;background:var(--gold);margin:9mm 22mm 0}
  .badge-wrap{text-align:center;margin-top:9mm}
  .badge{display:inline-block;background:var(--green);color:#fff;font-size:11px;font-weight:800;letter-spacing:.6px;padding:8px 20px;border-radius:6px}
  .amount-box{background:var(--cream);border:1px solid var(--line);border-radius:10px;text-align:center;padding:18px;margin-top:6mm}
  .amount-lbl{font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--mute);text-transform:uppercase}
  .amount-val{font-size:34px;font-weight:800;color:var(--crimson);margin-top:4px;letter-spacing:-.5px}
  .amount-for{font-size:10px;color:var(--mute);margin-top:6px}
  .details{margin:7mm 0 0;border-collapse:collapse;width:100%}
  .details tr td{padding:9px 13px;font-size:11px}
  .details .k{background:var(--crimson);color:#fff;font-weight:700;width:34%;font-size:10px;letter-spacing:.3px}
  .details .v{border:1px solid var(--line);color:var(--ink)}
  .details tr:nth-child(even) .v{background:var(--cream)}
  .details .v.accent{color:var(--crimson);font-weight:700}
  .details .v.green{color:var(--green);font-weight:700}
  .auth-row{display:flex;justify-content:space-between;align-items:flex-end;margin-top:11mm;gap:24px}
  .auth-by{flex:1}
  .auth-lbl{font-size:9px;font-weight:700;letter-spacing:1px;color:var(--mute);text-transform:uppercase;margin-bottom:14px}
  .sig{font-family:'Brush Script MT','Segoe Script','Snell Roundhand',cursive;font-size:26px;color:var(--ink);line-height:1;margin-bottom:3px;padding-left:6px}
  .sig-line{border-bottom:1px solid var(--ink);width:62mm}
  .auth-name{font-size:11px;font-weight:800;color:var(--ink);margin-top:5px}
  .auth-role{font-size:9.5px;color:var(--mute)}
  .paid-stamp{border:1.5px solid var(--line);border-radius:7px;padding:11px 18px;text-align:center;min-width:50mm}
  .paid-stamp .org{font-size:8.5px;font-weight:800;color:var(--ink);letter-spacing:.4px}
  .paid-stamp .addr{font-size:7.5px;color:var(--mute);margin-top:2px}
  .paid-stamp .paid{font-size:15px;font-weight:800;color:var(--green);letter-spacing:1px;margin-top:6px}
  .paid-stamp .pdate{font-size:8px;color:var(--mute);margin-top:1px}
  .note{margin-top:9mm;background:var(--cream);border:1px solid var(--line);border-radius:6px;padding:10px 14px;text-align:center;font-size:9.5px;font-style:italic;color:var(--mute)}
  .ft{margin-top:auto;border-top:1px solid var(--line);padding:5mm 22mm;text-align:center;font-size:8.5px;color:var(--mute);line-height:1.6}
  .ft b{color:var(--crimson);font-size:9.5px;letter-spacing:.5px}
  .toolbar{position:fixed;top:0;left:0;right:0;background:#7D1025;color:#fff;padding:10px 20px;display:flex;justify-content:space-between;align-items:center;z-index:99}
  .toolbar button{background:#fff;color:#7D1025;border:none;padding:8px 18px;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer}
  .toolbar .hint{font-size:12px;opacity:.85}
  @media print{
    body{background:#fff}.toolbar{display:none}
    .page{margin:0;box-shadow:none;width:100%;min-height:auto}
    @page{size:A4;margin:0}
  }
</style></head><body>
<div class="toolbar">
  <span class="hint">Review the receipt, then download. Use "Save as PDF" as the destination.</span>
  <button onclick="window.print()">Download PDF</button>
</div>
<div style="height:48px"></div>

<div class="page">
  <div class="topbar"></div>
  <div class="hd">
    <div class="brand">
      <svg class="shield" viewBox="0 0 60 66">
        <path d="M30 2 L56 9 V32 C56 47 44 58 30 63 C16 58 4 47 4 32 V9 Z" fill="#8A1228" stroke="#C9A030" stroke-width="2"/>
        <path d="M30 13 l2.3 4.7 5.2 .75 -3.75 3.65 .9 5.15 -4.65 -2.45 -4.65 2.45 .9 -5.15 -3.75 -3.65 5.2 -.75 Z" fill="#C9A030"/>
        <g transform="translate(30 40)">
          <path d="M0 -6 C-4 -9 -11 -9 -14 -7 L-14 9 C-11 7 -4 7 0 10 Z" fill="#FFFFFF" stroke="#E3D9C4" stroke-width="0.6"/>
          <path d="M0 -6 C4 -9 11 -9 14 -7 L14 9 C11 7 4 7 0 10 Z" fill="#FFFFFF" stroke="#E3D9C4" stroke-width="0.6"/>
          <line x1="-10" y1="-3.5" x2="-3.5" y2="-2" stroke="#E7B7C0" stroke-width="0.8"/>
          <line x1="-10" y1="0" x2="-3.5" y2="1.5" stroke="#E7B7C0" stroke-width="0.8"/>
          <line x1="-10" y1="3.5" x2="-3.5" y2="5" stroke="#E7B7C0" stroke-width="0.8"/>
          <line x1="3.5" y1="-2" x2="10" y2="-3.5" stroke="#E7B7C0" stroke-width="0.8"/>
          <line x1="3.5" y1="1.5" x2="10" y2="0" stroke="#E7B7C0" stroke-width="0.8"/>
          <line x1="3.5" y1="5" x2="10" y2="3.5" stroke="#E7B7C0" stroke-width="0.8"/>
        </g>
      </svg>
      <div class="brand-tx"><div class="name">Smart<em>ious</em></div>
        <div class="tag">HOMESCHOOL&nbsp;·&nbsp;GLOBAL</div></div>
    </div>
    <div class="hd-r"><div class="doc-title">OFFICIAL RECEIPT</div>
      <div class="doc-sub">Payment Confirmation</div></div>
  </div>
  <div class="gold-rule"></div>

  <div class="page-body">
    <div class="badge-wrap"><span class="badge">&#10003;&nbsp;&nbsp;PAYMENT RECEIVED</span></div>

    <div class="amount-box">
      <div class="amount-lbl">Amount Paid</div>
      <div class="amount-val">${cur} ${amt}</div>
      ${f.paidFor ? `<div class="amount-for">${esc(f.paidFor)}</div>` : ''}
    </div>

    <table class="details">
      <tr><td class="k">Received By</td><td class="v">${esc(f.receivedBy)}</td></tr>
      <tr><td class="k">M-Pesa Account</td><td class="v">${esc(f.mpesaAccount)}</td></tr>
      <tr><td class="k">Reference No.</td><td class="v accent">${esc(f.referenceNo)}</td></tr>
      <tr><td class="k">Payment Method</td><td class="v">${esc(f.paymentMethod)}</td></tr>
      <tr><td class="k">Date &amp; Time</td><td class="v">${esc(f.dateTime)}</td></tr>
      <tr><td class="k">Amount</td><td class="v accent">${cur} ${amt}</td></tr>
      <tr><td class="k">Status</td><td class="v green">${esc(f.status)}</td></tr>
    </table>

    <div class="auth-row">
      <div class="auth-by">
        <div class="auth-lbl">Authorised By</div>
        <div class="sig">${esc(f.authName)}</div>
        <div class="sig-line"></div>
        <div class="auth-name">${esc(f.authName)}</div>
        <div class="auth-role">${esc(f.authRole)}</div>
      </div>
      <div class="paid-stamp">
        <div class="org">SMARTIOUS HOMESCHOOL GLOBAL</div>
        <div class="addr">Diamond Plaza I, Parklands</div>
        <div class="addr">Nairobi, Kenya</div>
        <div class="paid">PAID</div>
        <div class="pdate">${esc(f.paidDate)}</div>
      </div>
    </div>

    <div class="note">
      This is an official computer-generated receipt and is valid without a wet signature. Please retain for your records.
    </div>
  </div>

  <div class="ft">
    <b>Smartious Homeschool Global</b><br>
    Diamond Plaza I, Parklands, Nairobi, Kenya<br>
    +254 745 021 212 &nbsp;|&nbsp; hellosmartious@gmail.com &nbsp;|&nbsp; smartioushomeschool.com
  </div>
</div>
</body></html>`
}

function FrontDeskModule({ refreshKey, toast }) {
  const [view, setView] = useState('leads')   // leads | insights

  return (
    <>
      <PSection
        tag="Front Desk"
        title="Website"
        em="Leads"
        sub="Every consultation, registration and message captured from the landing page."
      />

      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {[
          { id: 'leads',    label: 'Leads' },
          { id: 'insights', label: 'Insights' },
        ].map(t => (
          <button key={t.id} onClick={() => setView(t.id)}
            style={{
              padding: '8px 18px', borderRadius: 99,
              border: `1.5px solid ${view === t.id ? TOKENS.crimson : (TOKENS.line || '#E8E2D6')}`,
              background: view === t.id ? TOKENS.crimson : '#fff',
              color: view === t.id ? '#fff' : TOKENS.crimson,
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {view === 'leads'
        ? <FrontDeskLeads refreshKey={refreshKey} toast={toast} />
        : <FrontDeskInsights refreshKey={refreshKey} toast={toast} />}
    </>
  )
}

// ── LEADS ─────────────────────────────────────────────────
function FrontDeskLeads({ refreshKey, toast }) {
  const [subs, setSubs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [typeF, setTypeF]     = useState('all')
  const [statusF, setStatusF] = useState('all')
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState(null)   // expanded lead

  const load = useCallback(() => {
    setLoading(true)
    api.get('/frontdesk/submissions')
      .then(r => setSubs(r.data.data?.submissions || []))
      .catch(() => toast?.error?.('Failed to load leads.'))
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => { load() }, [load, refreshKey])

  const filtered = subs.filter(s => {
    if (typeF !== 'all' && s.type !== typeF) return false
    if (statusF !== 'all' && s.status !== statusF) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const hay = `${s.name || ''} ${s.email || ''} ${s.phone || ''} ${s.message || ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const setStatus = async (id, status) => {
    try {
      const { data } = await api.patch('/frontdesk/' + id, { status })
      if (data?.success) {
        setSubs(list => list.map(s => s._id === id ? { ...s, status } : s))
        if (selected && selected._id === id) setSelected(s => ({ ...s, status }))
        toast?.ok?.('Status updated.')
      }
    } catch (e) {
      toast?.error?.('Update failed.')
    }
  }

  const saveNotes = async (id, adminNotes) => {
    try {
      const { data } = await api.patch('/frontdesk/' + id, { adminNotes })
      if (data?.success) {
        setSubs(list => list.map(s => s._id === id ? { ...s, adminNotes } : s))
        toast?.ok?.('Notes saved.')
      }
    } catch (e) {
      toast?.error?.('Could not save notes.')
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this lead permanently?')) return
    try {
      const { data } = await api.delete('/frontdesk/' + id)
      if (data?.success) {
        setSubs(list => list.filter(s => s._id !== id))
        if (selected && selected._id === id) setSelected(null)
        toast?.ok?.('Lead deleted.')
      }
    } catch (e) {
      toast?.error?.('Delete failed.')
    }
  }

  const counts = {
    all: subs.length,
    new: subs.filter(s => s.status === 'new').length,
    contacted: subs.filter(s => s.status === 'contacted').length,
    converted: subs.filter(s => s.status === 'converted').length,
  }

  const pill = (active) => ({
    padding: '5px 12px', borderRadius: 99,
    border: `1.5px solid ${active ? TOKENS.crimson : (TOKENS.line || '#E8E2D6')}`,
    background: active ? TOKENS.crimson : '#fff',
    color: active ? '#fff' : TOKENS.s600 || '#555',
    fontSize: 11.5, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
  })

  if (loading) {
    return <PCard padding={40}><div style={{ textAlign: 'center', color: TOKENS.s500 }}>Loading leads…</div></PCard>
  }

  return (
    <>
      {/* Snapshot row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {[
          ['Total leads', counts.all, TOKENS.crimson],
          ['New', counts.new, '#B45309'],
          ['Contacted', counts.contacted, '#1E40AF'],
          ['Converted', counts.converted, '#15803D'],
        ].map(([label, val, col]) => (
          <div key={label} style={{
            flex: '1 1 130px', background: '#fff',
            border: '1px solid ' + (TOKENS.line || '#E8E2D6'),
            borderRadius: 10, padding: '12px 16px',
          }}>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, color: col, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: TOKENS.s500, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
        {['all', 'registration', 'consultation', 'contact'].map(t => (
          <button key={t} onClick={() => setTypeF(t)} style={pill(typeF === t)}>
            {t === 'all' ? 'All types' : (FD_TYPE[t]?.label || t)}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {['all', 'new', 'contacted', 'converted', 'closed'].map(s => (
          <button key={s} onClick={() => setStatusF(s)} style={pill(statusF === s)}>
            {s === 'all' ? 'All statuses' : s}
          </button>
        ))}
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search name, email, phone, message…"
        style={{
          width: '100%', boxSizing: 'border-box', marginBottom: 14,
          padding: '9px 12px', borderRadius: 8,
          border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'), fontSize: 13,
        }}/>

      {filtered.length === 0 ? (
        <PCard padding={36}><div style={{ textAlign: 'center', color: TOKENS.s500 }}>
          {subs.length === 0 ? 'No leads captured yet.' : 'No leads match these filters.'}
        </div></PCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(s => {
            const open = selected && selected._id === s._id
            const t = FD_TYPE[s.type] || FD_TYPE.contact
            const st = FD_STATUS[s.status] || FD_STATUS.new
            return (
              <div key={s._id} style={{
                background: '#fff', border: '1px solid ' + (TOKENS.line || '#E8E2D6'),
                borderRadius: 10, overflow: 'hidden',
              }}>
                {/* Row header */}
                <div onClick={() => setSelected(open ? null : s)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: TOKENS.ink || '#1A1A1A' }}>
                      {s.name || s.email || 'Unnamed lead'}
                    </div>
                    <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 1 }}>
                      {[s.email, s.phone, s.country].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: t.bg, color: t.fg }}>
                    {t.label}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: st.bg, color: st.fg }}>
                    {st.label}
                  </span>
                  <span style={{ fontSize: 11, color: TOKENS.s400, minWidth: 78, textAlign: 'right' }}>
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>

                {/* Expanded detail */}
                {open && (
                  <div style={{ borderTop: '1px solid ' + (TOKENS.line || '#E8E2D6'), padding: 16, background: '#FCFBF8' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px 18px', marginBottom: 14 }}>
                      {[
                        ['Programme', s.programme],
                        ['Curriculum', s.curriculum],
                        ['Learning mode', s.learningMode],
                        ['Country', s.country],
                        ['Pathway', s.pathway],
                        ['Destination', s.destination],
                        ['Student', [s.studentFirstName, s.studentLastName].filter(Boolean).join(' ')],
                        ['Student DOB', s.studentDob],
                        ['Current school', s.currentSchool],
                        ['Heard from', s.heardFrom],
                        ['Consultation format', s.consultFormat],
                        ['Address', s.address],
                        ['Source page', s.sourcePage],
                      ].filter(([, v]) => v).map(([k, v]) => (
                        <div key={k}>
                          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: TOKENS.s400 }}>{k}</div>
                          <div style={{ fontSize: 12.5, color: TOKENS.ink || '#1A1A1A' }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {s.subject && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: TOKENS.s400 }}>Subject</div>
                        <div style={{ fontSize: 12.5, color: TOKENS.ink || '#1A1A1A' }}>{s.subject}</div>
                      </div>
                    )}
                    {s.message && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: TOKENS.s400, marginBottom: 3 }}>Message</div>
                        <div style={{ fontSize: 12.5, color: TOKENS.ink || '#1A1A1A', background: '#fff', border: '1px solid ' + (TOKENS.line || '#E8E2D6'), borderRadius: 6, padding: '8px 11px', lineHeight: 1.55 }}>
                          {s.message}
                        </div>
                      </div>
                    )}

                    {/* Status workflow */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {Object.keys(FD_STATUS).map(k => (
                        <button key={k} onClick={() => setStatus(s._id, k)}
                          style={{
                            padding: '5px 12px', borderRadius: 6,
                            border: `1.5px solid ${s.status === k ? FD_STATUS[k].fg : (TOKENS.line || '#E8E2D6')}`,
                            background: s.status === k ? FD_STATUS[k].bg : '#fff',
                            color: s.status === k ? FD_STATUS[k].fg : (TOKENS.s500 || '#777'),
                            fontSize: 11, fontWeight: 700, cursor: 'pointer',
                          }}>
                          {FD_STATUS[k].label}
                        </button>
                      ))}
                    </div>

                    {/* Admin notes */}
                    <NotesEditor
                      initial={s.adminNotes || ''}
                      onSave={(txt) => saveNotes(s._id, txt)}
                    />

                    {/* Emails already sent to this lead */}
                    {Array.isArray(s.emailsSent) && s.emailsSent.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: TOKENS.s400, marginBottom: 4 }}>
                          Emails sent ({s.emailsSent.length})
                        </div>
                        {s.emailsSent.slice().reverse().map((em, i) => (
                          <div key={i} style={{ fontSize: 11.5, color: TOKENS.s500, padding: '2px 0' }}>
                            {em.subject} · {em.sentAt ? new Date(em.sentAt).toLocaleDateString() : ''}
                            {em.delivered === false && <span style={{ color: '#B91C1C', fontWeight: 700 }}> · failed</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Email composer */}
                    {s.email ? (
                      <LeadEmailComposer lead={s} toast={toast}
                        onSent={(updated) => {
                          setSubs(list => list.map(x => x._id === s._id
                            ? { ...x, status: updated.status, emailsSent: updated.emailsSent }
                            : x))
                          if (selected && selected._id === s._id)
                            setSelected(x => ({ ...x, status: updated.status, emailsSent: updated.emailsSent }))
                        }}/>
                    ) : (
                      <div style={{ marginTop: 12, fontSize: 12, color: TOKENS.s400, fontStyle: 'italic' }}>
                        This lead has no email address — cannot send email.
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                      <button onClick={() => remove(s._id)}
                        style={{
                          background: 'transparent', color: '#B91C1C',
                          border: '1px solid #FCA5A5', borderRadius: 6,
                          padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        }}>
                        Delete lead
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

// Small notes editor with explicit save
function NotesEditor({ initial, onSave }) {
  const [val, setVal] = useState(initial)
  const [dirty, setDirty] = useState(false)
  useEffect(() => { setVal(initial); setDirty(false) }, [initial])
  return (
    <div>
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: TOKENS.s400, marginBottom: 4 }}>
        Admin notes
      </div>
      <textarea value={val}
        onChange={e => { setVal(e.target.value); setDirty(true) }}
        rows={2} placeholder="Internal notes about this lead…"
        style={{
          width: '100%', boxSizing: 'border-box', resize: 'vertical',
          padding: '8px 11px', borderRadius: 6, fontSize: 12.5, fontFamily: 'inherit',
          border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
        }}/>
      {dirty && (
        <button onClick={() => { onSave(val); setDirty(false) }}
          style={{
            marginTop: 6, background: TOKENS.crimson, color: '#fff', border: 'none',
            borderRadius: 6, padding: '6px 14px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
          }}>
          Save notes
        </button>
      )}
    </div>
  )
}

// ── LEAD EMAIL COMPOSER — tap a template, edit, send ──────
// Templates pre-fill subject + body. Admin can edit before
// sending. The registration template supports a manually
// uploaded invoice attachment.
function leadEmailTemplates(lead) {
  const first = (lead.name || '').split(/\s+/)[0] || 'there'
  const prog  = lead.programme || lead.curriculum || 'your chosen programme'
  return {
    registration: {
      label: 'Registration Successful',
      subject: 'Your Smartious Registration — Next Steps',
      body:
`Dear ${first},

Thank you for registering with Smartious Homeschool & eSchool. We are delighted to welcome ${lead.studentFirstName || 'your child'} to the Smartious family.

Your registration for ${prog} has been received successfully.

NEXT STEPS

1. Invoice — Please find your registration invoice attached to this email.

2. Fee Payment — Kindly complete payment using the details on the invoice.

3. Portal Access — Once your payment is confirmed, you will receive a follow-up email containing:
   • A one-time password to log in to the Student Portal
   • Your child's placement assessment, which will already be set up and ready in the exam module

4. Begin Learning — After the placement assessment, our team will match a tutor and your child's learning journey begins.

If you have any questions, simply reply to this email or reach us on WhatsApp at +254 745 021 212.

Warm regards,`,
    },
    consultation: {
      label: 'Consultation Follow-up',
      subject: 'Your Smartious Consultation',
      body:
`Dear ${first},

Thank you for requesting a consultation with Smartious Homeschool & eSchool.

We would be glad to discuss ${prog} and how we can support ${lead.studentFirstName || 'your child'}'s learning.

Please let us know a date and time that suits you, and whether you would prefer an online call or an in-person meeting. We will confirm the appointment and send you everything you need beforehand.

You can also reach us directly on WhatsApp at +254 745 021 212.

Warm regards,`,
    },
    welcome: {
      label: 'General Reply',
      subject: 'Thank You for Contacting Smartious',
      body:
`Dear ${first},

Thank you for getting in touch with Smartious Homeschool & eSchool.

We have received your message and a member of our team will respond to you shortly with the information you need.

If your enquiry is urgent, please reach us on WhatsApp at +254 745 021 212.

Warm regards,`,
    },
    custom: {
      label: 'Blank',
      subject: '',
      body: '',
    },
  }
}

function LeadEmailComposer({ lead, toast, onSent }) {
  const [open, setOpen]       = useState(false)
  const [kind, setKind]       = useState(lead.type === 'registration' ? 'registration'
                                       : lead.type === 'consultation' ? 'consultation' : 'welcome')
  const templates             = leadEmailTemplates(lead)
  const [subject, setSubject] = useState(templates[kind].subject)
  const [body, setBody]       = useState(templates[kind].body)
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading]     = useState(false)
  const [sending, setSending]         = useState(false)
  const [confirm, setConfirm]         = useState(false)

  const applyTemplate = (k) => {
    setKind(k)
    setSubject(templates[k].subject)
    setBody(templates[k].body)
    setConfirm(false)
  }

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
    if (!subject.trim() || !body.trim()) { toast?.error?.('Subject and message are required.'); return }
    setSending(true)
    try {
      const { data } = await api.post('/frontdesk/' + lead._id + '/email', {
        subject: subject.trim(),
        body,
        template: kind,
        attachments,
      })
      if (data?.success) {
        toast?.ok?.(data.message || 'Email sent.')
        onSent?.(data.data)
        setOpen(false); setConfirm(false); setAttachments([])
      } else {
        toast?.error?.(data?.message || 'Send failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Send failed.')
    } finally {
      setSending(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        style={{
          marginTop: 12, background: TOKENS.crimson, color: '#fff', border: 'none',
          borderRadius: 6, padding: '8px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
        }}>
        Send Email to Lead
      </button>
    )
  }

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 11px', borderRadius: 6, fontSize: 12.5, fontFamily: 'inherit',
    border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
  }

  return (
    <div style={{ marginTop: 12, background: '#fff', border: '1px solid ' + (TOKENS.line || '#E8E2D6'), borderRadius: 8, padding: 14 }}>
      {/* Template chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {Object.entries(templates).map(([k, t]) => (
          <button key={k} onClick={() => applyTemplate(k)}
            style={{
              padding: '5px 11px', borderRadius: 99,
              border: `1.5px solid ${kind === k ? TOKENS.crimson : (TOKENS.line || '#E8E2D6')}`,
              background: kind === k ? TOKENS.crimson : '#fff',
              color: kind === k ? '#fff' : TOKENS.crimson,
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 11, color: TOKENS.s500, marginBottom: 8 }}>
        To: <strong style={{ color: TOKENS.ink || '#1A1A1A' }}>{lead.email}</strong>
      </div>

      <input value={subject} onChange={e => { setSubject(e.target.value); setConfirm(false) }}
        placeholder="Subject" style={{ ...inp, marginBottom: 8 }}/>
      <textarea value={body} onChange={e => { setBody(e.target.value); setConfirm(false) }}
        rows={10} placeholder="Message" style={{ ...inp, resize: 'vertical', lineHeight: 1.5, marginBottom: 8 }}/>

      {/* Attachments — invoice etc. */}
      {attachments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
          {attachments.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 9px', background: '#FBFAF5',
              border: '1px solid ' + (TOKENS.line || '#E8E2D6'), borderRadius: 6, fontSize: 11.5,
            }}>
              <span style={{ flex: 1, color: TOKENS.ink || '#1A1A1A' }}>{a.name}</span>
              <button onClick={() => setAttachments(list => list.filter((_, idx) => idx !== i))}
                style={{ background: 'transparent', border: 'none', color: '#B91C1C', cursor: 'pointer', fontSize: 10.5, fontWeight: 700 }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <label style={{
        display: 'inline-block', marginBottom: 10,
        background: '#fff', color: TOKENS.crimson,
        border: '1.5px solid ' + TOKENS.crimson,
        padding: '6px 12px', borderRadius: 6,
        cursor: uploading ? 'wait' : 'pointer', fontSize: 11.5, fontWeight: 700,
      }}>
        <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ display: 'none' }}
          onChange={e => { uploadFile(e.target.files?.[0]); e.target.value = '' }}/>
        {uploading ? 'Uploading…' : '+ Attach Invoice / File'}
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
        <button onClick={() => { setOpen(false); setConfirm(false) }} disabled={sending}
          style={{
            background: 'transparent', color: TOKENS.s500,
            border: '1px solid ' + (TOKENS.line || '#E8E2D6'), borderRadius: 6,
            padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
          Cancel
        </button>
        {!confirm ? (
          <button onClick={() => {
            if (!subject.trim() || !body.trim()) { toast?.error?.('Subject and message are required.'); return }
            setConfirm(true)
          }}
            style={{
              background: TOKENS.crimson, color: '#fff', border: 'none',
              borderRadius: 6, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
            Review &amp; Send
          </button>
        ) : (
          <button onClick={send} disabled={sending}
            style={{
              background: sending ? '#9CA3AF' : '#15803D', color: '#fff', border: 'none',
              borderRadius: 6, padding: '7px 18px', fontSize: 12, fontWeight: 700,
              cursor: sending ? 'not-allowed' : 'pointer',
            }}>
            {sending ? 'Sending…' : 'Confirm Send'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── INSIGHTS ──────────────────────────────────────────────
function FrontDeskInsights({ refreshKey, toast }) {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/frontdesk/stats')
      .then(r => setStats(r.data.data))
      .catch(() => toast?.error?.('Failed to load insights.'))
      .finally(() => setLoading(false))
  }, [refreshKey, toast])

  if (loading) {
    return <PCard padding={40}><div style={{ textAlign: 'center', color: TOKENS.s500 }}>Loading insights…</div></PCard>
  }
  if (!stats || stats.total === 0) {
    return <PCard padding={40}><div style={{ textAlign: 'center', color: TOKENS.s500 }}>
      No leads yet — insights appear once submissions come in.
    </div></PCard>
  }

  const BarList = ({ title, rows }) => {
    const max = Math.max(1, ...rows.map(r => r.count))
    return (
      <PCard padding={18}>
        <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          {title}
        </div>
        {rows.length === 0 ? (
          <div style={{ fontSize: 12, color: TOKENS.s400 }}>No data.</div>
        ) : rows.slice(0, 8).map(r => (
          <div key={r.label} style={{ marginBottom: 9 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
              <span style={{ color: TOKENS.ink || '#1A1A1A', fontWeight: 600 }}>{r.label}</span>
              <span className="mono" style={{ color: TOKENS.s500, fontWeight: 700 }}>{r.count}</span>
            </div>
            <div style={{ height: 7, background: '#F1ECDD', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: (r.count / max * 100) + '%', height: '100%', background: TOKENS.gold || '#C9A030', borderRadius: 99 }}/>
            </div>
          </div>
        ))}
      </PCard>
    )
  }

  // 30-day trend — simple sparkline-ish bar row
  const trendMax = Math.max(1, ...stats.trend.map(t => t.count))

  return (
    <>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {[
          ['Total leads', stats.total],
          ['Registrations', (stats.byType.find(t => t.label === 'registration') || {}).count || 0],
          ['Consultations', (stats.byType.find(t => t.label === 'consultation') || {}).count || 0],
          ['Messages', (stats.byType.find(t => t.label === 'contact') || {}).count || 0],
        ].map(([label, val]) => (
          <div key={label} style={{
            flex: '1 1 130px', background: '#fff',
            border: '1px solid ' + (TOKENS.line || '#E8E2D6'), borderRadius: 10, padding: '12px 16px',
          }}>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, color: TOKENS.crimson, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: TOKENS.s500, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* 30-day trend */}
      <PCard padding={18} style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          Last 30 days
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 70 }}>
          {stats.trend.map((d, i) => (
            <div key={i} title={`${d.date}: ${d.count}`}
              style={{
                flex: 1,
                height: Math.max(2, d.count / trendMax * 70),
                background: d.count > 0 ? (TOKENS.gold || '#C9A030') : '#F1ECDD',
                borderRadius: 2,
              }}/>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: TOKENS.s400, marginTop: 6 }}>
          <span>{stats.trend[0]?.date}</span>
          <span>{stats.trend[stats.trend.length - 1]?.date}</span>
        </div>
      </PCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        <BarList title="By Country" rows={stats.byCountry} />
        <BarList title="By Source Channel" rows={stats.bySource} />
        <BarList title="By Programme" rows={stats.byProgramme} />
        <BarList title="By Curriculum" rows={stats.byCurriculum} />
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// COMMUNICATION MODULE — admin email to the school community
// ═══════════════════════════════════════════════════════════
// Compose + send branded emails to teachers / students / parents
// (quick groups or individuals) plus typed external addresses.
// Multiple PDF/doc attachments. Two-step send. Campaign history.
// ═══════════════════════════════════════════════════════════

function CommunicationModule({ refreshKey, toast }) {
  const [view, setView] = useState('compose')   // compose | history

  return (
    <>
      <PSection
        tag="Communication"
        title="Reach the"
        em="Community"
        sub="Send branded emails to teachers, students, parents — or any address."
      />

      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {[
          { id: 'compose', label: 'Compose' },
          { id: 'history', label: 'History' },
        ].map(t => (
          <button key={t.id} onClick={() => setView(t.id)}
            style={{
              padding: '8px 18px', borderRadius: 99,
              border: `1.5px solid ${view === t.id ? TOKENS.crimson : (TOKENS.line || '#E8E2D6')}`,
              background: view === t.id ? TOKENS.crimson : '#fff',
              color: view === t.id ? '#fff' : TOKENS.crimson,
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {view === 'compose' ? <ComposeView toast={toast} /> : <HistoryView refreshKey={refreshKey} toast={toast} />}
    </>
  )
}

// ── COMPOSE ───────────────────────────────────────────────
function ComposeView({ toast }) {
  const [recipients, setRecipients] = useState([])      // full community
  const [loading, setLoading] = useState(true)

  const [pickedIds, setPickedIds] = useState(new Set()) // selected user _ids
  const [externalText, setExternalText] = useState('')  // typed addresses, comma/newline separated
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const [attachments, setAttachments] = useState([])    // [{ name, url }]
  const [uploading, setUploading] = useState(false)

  const [sending, setSending] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    api.get('/communication/recipients')
      .then(r => setRecipients(r.data.data?.recipients || []))
      .catch(() => toast?.error?.('Failed to load recipients.'))
      .finally(() => setLoading(false))
  }, [toast])

  const filtered = recipients.filter(r => {
    if (roleFilter !== 'all' && r.role !== roleFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!r.name.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q)) return false
    }
    return true
  })

  const toggle = (id) => {
    setPickedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setConfirm(false)
  }

  // Quick group selection — adds everyone of a role to the picked set
  const pickGroup = (role) => {
    const ids = recipients.filter(r => r.role === role).map(r => r._id)
    setPickedIds(prev => {
      const next = new Set(prev)
      const allIn = ids.every(id => next.has(id))
      ids.forEach(id => allIn ? next.delete(id) : next.add(id))
      return next
    })
    setConfirm(false)
  }

  const externalList = externalText
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(Boolean)

  const totalCount = pickedIds.size + externalList.length

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
    if (totalCount === 0) { toast?.error?.('Pick at least one recipient.'); return }

    setSending(true)
    try {
      // Build an audience label
      let audience = ''
      const roles = ['teacher', 'student', 'parent']
      const groupLabels = []
      for (const role of roles) {
        const roleIds = recipients.filter(r => r.role === role).map(r => r._id)
        if (roleIds.length > 0 && roleIds.every(id => pickedIds.has(id))) {
          groupLabels.push('All ' + role.charAt(0).toUpperCase() + role.slice(1) + 's')
        }
      }
      audience = groupLabels.length > 0
        ? groupLabels.join(', ') + (externalList.length ? ' + external' : '')
        : `${totalCount} recipient${totalCount === 1 ? '' : 's'}`

      const { data } = await api.post('/communication/send', {
        subject: subject.trim(),
        body,
        userIds: [...pickedIds],
        externalEmails: externalList,
        attachments,
        audience,
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
    setPickedIds(new Set()); setExternalText(''); setSubject(''); setBody('')
    setAttachments([]); setConfirm(false); setResult(null)
  }

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', borderRadius: 6,
    border: '1.5px solid #E8E2D6', fontSize: 13, fontFamily: 'inherit',
  }
  const lbl = {
    display: 'block', fontSize: 10.5, fontWeight: 700,
    letterSpacing: '.06em', textTransform: 'uppercase',
    color: TOKENS.crimson, marginBottom: 5,
  }

  // Sent — show result summary
  if (result) {
    return (
      <PCard padding={28}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#DCFCE7', color: '#15803D',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: TOKENS.ink || '#1A1A1A' }}>
            Campaign sent
          </div>
          <div style={{ fontSize: 13.5, color: '#6B6B6B', marginTop: 6 }}>
            {result.sentCount} delivered{result.failedCount > 0 ? ` · ${result.failedCount} failed` : ''}
          </div>
          {result.failedCount > 0 && (
            <div style={{
              marginTop: 14, textAlign: 'left',
              background: '#FEF2F2', border: '1px solid #FCA5A5',
              borderRadius: 8, padding: 12, fontSize: 12, color: '#991B1B',
              maxHeight: 160, overflowY: 'auto',
            }}>
              <strong>Failed:</strong>
              {(result.results || []).filter(r => r.status === 'failed').map((r, i) => (
                <div key={i}>{r.email} — {r.error || 'unknown error'}</div>
              ))}
            </div>
          )}
          <button onClick={resetAll}
            style={{
              marginTop: 18, background: TOKENS.crimson, color: '#fff',
              border: 'none', padding: '10px 24px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            New Campaign
          </button>
        </div>
      </PCard>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 340px)', gap: 14 }}>
      {/* LEFT — compose */}
      <PCard padding={20}>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Subject</label>
          <input value={subject} onChange={e => { setSubject(e.target.value); setConfirm(false) }}
            placeholder="Email subject" style={inp}/>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Message</label>
          <textarea value={body} onChange={e => { setBody(e.target.value); setConfirm(false) }}
            rows={11} placeholder="Write your message. Leave a blank line between paragraphs."
            style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}/>
          <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 4 }}>
            Wrapped in the Smartious branded template. Blank lines become paragraphs.
          </div>
        </div>

        {/* Attachments */}
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Attachments</label>
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
              {attachments.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', background: '#FBFAF5',
                  border: '1px solid #E8E2D6', borderRadius: 6, fontSize: 12,
                }}>
                  <span style={{ flex: 1, color: '#1A1A1A' }}>{a.name}</span>
                  <button onClick={() => setAttachments(list => list.filter((_, idx) => idx !== i))}
                    style={{ background: 'transparent', border: 'none', color: '#B91C1C', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          <label style={{
            display: 'inline-block',
            background: '#fff', color: TOKENS.crimson,
            border: `1.5px solid ${TOKENS.crimson}`,
            padding: '7px 14px', borderRadius: 6,
            cursor: uploading ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700,
          }}>
            <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ display: 'none' }}
              onChange={e => { uploadFile(e.target.files?.[0]); e.target.value = '' }}/>
            {uploading ? 'Uploading...' : '+ Add Attachment (PDF, max 10 MB)'}
          </label>
        </div>

        {/* Send */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
          {!confirm ? (
            <button onClick={() => {
              if (!subject.trim() || !body.trim()) { toast?.error?.('Subject and message are required.'); return }
              if (totalCount === 0) { toast?.error?.('Pick at least one recipient.'); return }
              setConfirm(true)
            }}
              style={{
                background: TOKENS.crimson, color: '#fff', border: 'none',
                padding: '10px 22px', borderRadius: 6,
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}>
              Review &amp; Send
            </button>
          ) : (
            <>
              <span style={{ fontSize: 12, color: '#6B6B6B' }}>
                Send to {totalCount} recipient{totalCount === 1 ? '' : 's'}?
              </span>
              <button onClick={() => setConfirm(false)} disabled={sending}
                style={{
                  background: '#fff', color: '#6B6B6B', border: '1.5px solid #E8E2D6',
                  padding: '10px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                }}>
                Cancel
              </button>
              <button onClick={send} disabled={sending}
                style={{
                  background: sending ? '#9CA3AF' : '#15803D', color: '#fff', border: 'none',
                  padding: '10px 22px', borderRadius: 6,
                  cursor: sending ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700,
                }}>
                {sending ? 'Sending...' : 'Confirm Send'}
              </button>
            </>
          )}
        </div>
      </PCard>

      {/* RIGHT — recipients */}
      <PCard padding={16}>
        <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Recipients ({pickedIds.size + externalList.length})
        </div>

        {/* Quick groups */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {[
            { role: 'teacher', label: 'All Teachers' },
            { role: 'student', label: 'All Students' },
            { role: 'parent',  label: 'All Parents' },
          ].map(g => (
            <button key={g.role} onClick={() => pickGroup(g.role)}
              style={{
                background: '#FBF6E3', color: TOKENS.crimson,
                border: '1px solid #E8E2D6', borderRadius: 99,
                padding: '5px 10px', fontSize: 10.5, fontWeight: 700, cursor: 'pointer',
              }}>
              {g.label}
            </button>
          ))}
        </div>

        {/* Search + role filter */}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search community..."
          style={{ ...inp, marginBottom: 6 }}/>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {['all', 'teacher', 'student', 'parent'].map(rf => (
            <button key={rf} onClick={() => setRoleFilter(rf)}
              style={{
                flex: 1, padding: '5px 4px', borderRadius: 5,
                border: `1px solid ${roleFilter === rf ? TOKENS.crimson : '#E8E2D6'}`,
                background: roleFilter === rf ? TOKENS.crimson : '#fff',
                color: roleFilter === rf ? '#fff' : '#6B6B6B',
                fontSize: 10, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
              }}>
              {rf}
            </button>
          ))}
        </div>

        {/* Community list */}
        <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #E8E2D6', borderRadius: 6, padding: 5, marginBottom: 10 }}>
          {loading ? (
            <div style={{ padding: 14, fontSize: 12, color: '#6B6B6B', textAlign: 'center' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 14, fontSize: 12, color: '#6B6B6B', textAlign: 'center' }}>No matches.</div>
          ) : filtered.map(r => {
            const on = pickedIds.has(r._id)
            return (
              <div key={r._id} onClick={() => toggle(r._id)}
                style={{
                  padding: '6px 8px', cursor: 'pointer',
                  background: on ? '#FBF6E3' : 'transparent',
                  borderRadius: 4, marginBottom: 2,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                <div style={{
                  width: 15, height: 15, borderRadius: 3, flexShrink: 0,
                  border: `1.5px solid ${on ? TOKENS.crimson : '#E8E2D6'}`,
                  background: on ? TOKENS.crimson : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {on && (
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#6B6B6B' }}>{r.role}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* External addresses */}
        <label style={lbl}>External Addresses</label>
        <textarea value={externalText} onChange={e => setExternalText(e.target.value)}
          rows={3} placeholder="prospect@email.com, another@email.com"
          style={{ ...inp, resize: 'vertical', fontSize: 12 }}/>
        <div style={{ fontSize: 10.5, color: '#6B6B6B', marginTop: 4 }}>
          Comma or line separated. Admin only — for marketing and outreach beyond the school.
        </div>
      </PCard>
    </div>
  )
}

// ── HISTORY ───────────────────────────────────────────────
function HistoryView({ refreshKey, toast }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/communication/history')
      .then(r => setHistory(r.data.data?.history || []))
      .catch(() => toast?.error?.('Failed to load history.'))
      .finally(() => setLoading(false))
  }, [refreshKey, toast])

  if (loading) {
    return <PCard padding={40}><div style={{ textAlign: 'center', color: '#6B6B6B' }}>Loading history...</div></PCard>
  }
  if (history.length === 0) {
    return <PCard padding={40}><div style={{ textAlign: 'center', color: '#6B6B6B' }}>No campaigns sent yet.</div></PCard>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {history.map(c => (
        <PCard key={c._id} padding={14}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: TOKENS.ink || '#1A1A1A' }}>
                {c.subject}
              </div>
              <div style={{ fontSize: 11.5, color: '#6B6B6B', marginTop: 2 }}>
                {c.audience} · {c.sentByName || 'Admin'} · {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                {Array.isArray(c.attachments) && c.attachments.length > 0 && ` · ${c.attachments.length} attachment${c.attachments.length === 1 ? '' : 's'}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{
                fontSize: 10.5, fontWeight: 700,
                background: '#DCFCE7', color: '#15803D',
                padding: '3px 9px', borderRadius: 99,
              }}>
                {c.sentCount} sent
              </span>
              {c.failedCount > 0 && (
                <span style={{
                  fontSize: 10.5, fontWeight: 700,
                  background: '#FEE2E2', color: '#B91C1C',
                  padding: '3px 9px', borderRadius: 99,
                }}>
                  {c.failedCount} failed
                </span>
              )}
            </div>
          </div>
        </PCard>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// STUDENTS MANAGEMENT MODULE — replaces the old AllocationsModule
// ═══════════════════════════════════════════════════════════
// One place for admin to manage every student: see them, edit their
// subjects, allocate teachers per subject, view allocation status.
//
// Data shape note (the reason this rewrite exists):
//   User.subjects is an ARRAY OF NAME STRINGS, not refs. We never
//   populate it. To list/edit subjects we use the Subject collection
//   keyed by (curriculum, subjectName).
//
// Endpoints used:
//   GET  /api/users/students/list                — all students
//   GET  /api/allocations                        — all active allocations
//   PATCH /api/users/:id                         — update student subjects/curriculum
//   GET  /api/subjects?curriculum=...            — subject catalog by curriculum
//   GET  /api/users/teachers/qualified?subjectId=...&curriculum=...
//        — teachers with matching specialty
//   POST /api/allocations                        — create allocation
//   PATCH /api/allocations/:id                   — reassign teacher OR set status
// ═══════════════════════════════════════════════════════════

function StudentsManagementModule({ refreshKey, toast }) {
  const [students, setStudents]       = useState([])
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filterStatus, setFilterStatus] = useState('all')   // all | unallocated | partial | full
  const [selectedStudent, setSelectedStudent] = useState(null)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [studs, allocs] = await Promise.all([
        api.get('/users/students/list'),
        api.get('/allocations'),
      ])
      setStudents(studs.data.students || studs.data.data?.students || [])
      setAllocations(allocs.data.allocations || allocs.data.data?.allocations || [])
    } catch (e) {
      toast?.error?.('Failed to load students: ' + (e?.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { loadAll() }, [refreshKey])

  // Build student summaries — count subjects vs. allocated subjects.
  // Since student.subjects is name strings, we count distinct teachers per
  // student rather than trying to map names → subjectIds here. The detail
  // panel does the proper Subject lookup.
  const summaries = students.map(s => {
    const subjectNames = Array.isArray(s.subjects) ? s.subjects : []
    const myAllocs = allocations.filter(a =>
      a.studentId?._id === s._id && a.status === 'Active' && a.teacherId
    )
    return {
      ...s,
      subjectCount:   subjectNames.length,
      allocatedCount: myAllocs.length,
      pendingCount:   Math.max(0, subjectNames.length - myAllocs.length),
      myAllocations:  myAllocs,
    }
  })

  const totalPending = summaries.reduce((sum, s) => sum + s.pendingCount, 0)
  const totalAllocated = summaries.reduce((sum, s) => sum + s.allocatedCount, 0)
  const fullyAllocated = summaries.filter(s => s.subjectCount > 0 && s.pendingCount === 0).length

  const filtered = summaries.filter(s => {
    // Search
    if (search) {
      const q = search.toLowerCase()
      const name = ((s.firstName || '') + ' ' + (s.lastName || '')).toLowerCase()
      if (!name.includes(q) && !(s.email || '').toLowerCase().includes(q) && !(s.admissionNumber || '').toLowerCase().includes(q))
        return false
    }
    // Status filter
    if (filterStatus === 'unallocated' && s.allocatedCount > 0) return false
    if (filterStatus === 'partial' && (s.pendingCount === 0 || s.allocatedCount === 0)) return false
    if (filterStatus === 'full' && (s.pendingCount > 0 || s.subjectCount === 0)) return false
    return true
  })

  const statusOf = (s) => {
    if (s.subjectCount === 0)   return { label: 'No subjects', color: TOKENS.accentSlate }
    if (s.allocatedCount === 0) return { label: 'No allocations', color: TOKENS.accentRose }
    if (s.pendingCount > 0)     return { label: `${s.pendingCount} pending`, color: TOKENS.accentAmber }
    return { label: 'All allocated', color: TOKENS.accentEmerald }
  }

  return (
    <>
      <PSection
        tag="Student Management"
        title="Manage"
        em="Students"
        sub="Curriculum, subjects, and teacher allocations — all in one place."
      />

      <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <PKpi label="Students" value={students.length}/>
        <PKpi label="Fully Allocated" value={fullyAllocated} delta={`${students.length > 0 ? Math.round(fullyAllocated / students.length * 100) : 0}% of cohort`} deltaColor={TOKENS.accentEmerald}/>
        <PKpi label="Active Allocations" value={totalAllocated}/>
        <PKpi label="Pending" value={totalPending} delta={totalPending > 0 ? 'Need teachers' : 'All caught up'} deltaColor={totalPending > 0 ? TOKENS.accentAmber : TOKENS.accentEmerald}/>
      </div>

      <PCard padding={16} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="fi"
            placeholder="Search by name, email, or admission #..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 240, maxWidth: 420 }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'all',         label: 'All' },
              { id: 'unallocated', label: 'Unallocated' },
              { id: 'partial',     label: 'Partial' },
              { id: 'full',        label: 'Fully allocated' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setFilterStatus(opt.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 99,
                  border: `1.5px solid ${filterStatus === opt.id ? TOKENS.crimson : TOKENS.line || '#E8E2D6'}`,
                  background: filterStatus === opt.id ? TOKENS.crimson : '#fff',
                  color: filterStatus === opt.id ? '#fff' : TOKENS.crimson,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </PCard>

      {loading ? (
        <PCard padding={60}>
          <div style={{ textAlign: 'center', color: '#6B6B6B' }}>Loading students...</div>
        </PCard>
      ) : filtered.length === 0 ? (
        <PCard padding={60}>
          <div style={{ textAlign: 'center', color: '#6B6B6B' }}>No students match.</div>
        </PCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(s => {
            const stat = statusOf(s)
            return (
              <PCard key={s._id} padding={14} style={{ cursor: 'pointer' }}>
                <div onClick={() => setSelectedStudent(s)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: TOKENS.crimson, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {(s.firstName?.[0] || '') + (s.lastName?.[0] || '')}
                  </div>
                  {/* Name + email */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: TOKENS.ink || '#1A1A1A' }}>
                      {s.firstName} {s.lastName}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>
                      {s.email}
                      {s.admissionNumber && <> · {s.admissionNumber}</>}
                    </div>
                  </div>
                  {/* Curriculum */}
                  <div style={{
                    background: TOKENS.goldPale, color: TOKENS.crimson,
                    fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em',
                    padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase',
                    minWidth: 70, textAlign: 'center',
                  }}>
                    {s.curriculum || 'No curr'}
                  </div>
                  {/* Subject count */}
                  <div style={{ minWidth: 90, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 700, color: TOKENS.ink || '#1A1A1A' }}>
                      {s.allocatedCount}/{s.subjectCount}
                    </div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#6B6B6B', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                      Allocated
                    </div>
                  </div>
                  {/* Status pill */}
                  <div style={{
                    background: stat.color + '15', color: stat.color,
                    fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em',
                    padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase',
                  }}>
                    {stat.label}
                  </div>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6B6B6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </PCard>
            )
          })}
        </div>
      )}

      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          allocations={selectedStudent.myAllocations}
          onClose={() => setSelectedStudent(null)}
          onChanged={() => { loadAll() }}
          toast={toast}
        />
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// STUDENT DETAIL MODAL
// ═══════════════════════════════════════════════════════════
function StudentDetailModal({ student, allocations: initialAllocs, onClose, onChanged, toast }) {
  const [curriculum, setCurriculum] = useState(student.curriculum || '')
  const [subjects, setSubjects]     = useState(Array.isArray(student.subjects) ? [...student.subjects] : [])
  const [subjectCatalog, setSubjectCatalog] = useState([])     // Subject docs for current curriculum
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [allocs, setAllocs] = useState(initialAllocs || [])
  const [allocateFor, setAllocateFor] = useState(null)         // { subjectName, subjectId }
  const [showSubjectPicker, setShowSubjectPicker] = useState(false)
  const [saving, setSaving] = useState(false)

  const CURRICULA = ['IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC', 'BNC', 'American']

  // Load Subject catalog for the chosen curriculum so we can resolve names→IDs
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!curriculum) { setSubjectCatalog([]); return }
      setCatalogLoading(true)
      try {
        const { data } = await api.get('/subjects', { params: { curriculum } })
        if (cancelled) return
        setSubjectCatalog(data.subjects || [])
      } catch (e) {
        toast?.error?.('Failed to load subject catalog.')
      } finally {
        if (!cancelled) setCatalogLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [curriculum, toast])

  // Resolve student.subjects (names) into Subject documents for the picker UI
  const enrolledSubjectDocs = subjects
    .map(name => subjectCatalog.find(s => s.subjectName === name))
    .filter(Boolean)

  // For each enrolled subject, find its allocation (if any)
  const allocationFor = (subjectId) => {
    return allocs.find(a =>
      (a.subjectId?._id || a.subjectId) === subjectId && a.status === 'Active'
    )
  }

  // Save curriculum + subjects changes
  const saveBasics = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch('/users/' + student._id, {
        curriculum,
        subjects,
      })
      if (data?.success || data?.user) {
        toast?.ok?.('Saved.')
        onChanged?.()
      } else {
        toast?.error?.(data?.message || 'Save failed.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  // Removing a subject. If allocated, also deactivate the allocation.
  const removeSubject = async (subjectName) => {
    if (!window.confirm(`Remove ${subjectName} from this student? Any teacher allocation for this subject will be deactivated.`)) return
    const subj = subjectCatalog.find(s => s.subjectName === subjectName)
    const alloc = subj ? allocationFor(subj._id) : null

    if (alloc) {
      try {
        await api.patch('/allocations/' + alloc._id, { status: 'Inactive' })
      } catch (e) {
        toast?.error?.('Failed to deactivate allocation: ' + (e?.response?.data?.message || e.message))
        return
      }
    }

    // Now remove from subjects list and save
    const newSubjects = subjects.filter(s => s !== subjectName)
    setSubjects(newSubjects)
    try {
      await api.patch('/users/' + student._id, { subjects: newSubjects })
      // Refresh allocations
      const { data } = await api.get('/allocations/student/' + student._id)
      setAllocs(data.allocations || [])
      toast?.ok?.('Subject removed.')
      onChanged?.()
    } catch (e) {
      toast?.error?.('Failed to remove subject.')
    }
  }

  // After allocate or reallocate succeeds, refetch allocs
  const refetchAllocs = async () => {
    try {
      const { data } = await api.get('/allocations/student/' + student._id)
      setAllocs(data.allocations || [])
      onChanged?.()
    } catch (e) { /* silent */ }
  }

  // Unassign a teacher (deactivate)
  const unassignTeacher = async (alloc) => {
    if (!window.confirm('Unassign this teacher? The student will lose access to lessons for this subject until reallocated.')) return
    try {
      await api.patch('/allocations/' + alloc._id, { status: 'Inactive' })
      toast?.ok?.('Teacher unassigned.')
      refetchAllocs()
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Failed to unassign.')
    }
  }

  const dirty = curriculum !== (student.curriculum || '') ||
                JSON.stringify(subjects.sort()) !== JSON.stringify((Array.isArray(student.subjects) ? student.subjects : []).slice().sort())

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
        background: '#fff', borderRadius: 12,
        maxWidth: 760, width: '100%', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: `linear-gradient(135deg, ${TOKENS.crimson} 0%, ${TOKENS.crimsonDeep} 100%)`,
          color: TOKENS.cream,
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#F0CC5A' }}>
            Manage Student
          </div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, marginTop: 2 }}>
            {student.firstName} {student.lastName}
          </div>
          <div style={{ fontSize: 12, opacity: .85, marginTop: 4 }}>
            {student.email}{student.admissionNumber && <> · {student.admissionNumber}</>}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflow: 'auto', flex: 1 }}>
          {/* Curriculum + actions */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: TOKENS.crimson, marginBottom: 6 }}>
              Curriculum
            </label>
            <select value={curriculum} onChange={e => setCurriculum(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: 6,
                border: '1.5px solid #E8E2D6',
                fontSize: 13, fontFamily: 'inherit',
                minWidth: 200,
              }}>
              <option value="">— Select —</option>
              {CURRICULA.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {curriculum && curriculum !== student.curriculum && (
              <div style={{
                marginTop: 8, padding: 10,
                background: '#FEF3C7', border: '1px solid #F59E0B',
                borderRadius: 6, fontSize: 12, color: '#92400E',
              }}>
                Changing curriculum will keep existing subject names, but most won't match the new curriculum's catalog. You'll likely need to re-pick subjects.
              </div>
            )}
          </div>

          {/* Subjects + Allocations */}
          <div style={{ marginBottom: 14 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 8,
            }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: TOKENS.crimson }}>
                Subjects &amp; Teachers ({subjects.length})
              </label>
              <button onClick={() => setShowSubjectPicker(true)}
                disabled={!curriculum || catalogLoading}
                style={{
                  background: '#fff', color: TOKENS.crimson,
                  border: `1.5px solid ${TOKENS.crimson}`,
                  padding: '5px 12px', borderRadius: 6,
                  cursor: !curriculum || catalogLoading ? 'not-allowed' : 'pointer',
                  fontSize: 11.5, fontWeight: 700,
                  opacity: !curriculum || catalogLoading ? .5 : 1,
                }}>
                + Edit Subjects
              </button>
            </div>

            {subjects.length === 0 ? (
              <div style={{ padding: 18, background: '#FBFAF5', borderRadius: 6, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>
                No subjects yet. Click "Edit Subjects" to enrol.
              </div>
            ) : catalogLoading ? (
              <div style={{ padding: 18, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>
                Loading catalog...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {subjects.map(name => {
                  const subj = subjectCatalog.find(s => s.subjectName === name)
                  if (!subj) {
                    return (
                      <div key={name} style={{
                        padding: '10px 12px',
                        background: '#FEE2E2', border: '1px solid #FCA5A5',
                        borderRadius: 6, fontSize: 12.5, color: '#991B1B',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                      }}>
                        <span><strong>{name}</strong> — not in {curriculum} catalog</span>
                        <button onClick={() => removeSubject(name)}
                          style={{
                            background: 'transparent', color: '#991B1B',
                            border: '1px solid #991B1B',
                            padding: '3px 8px', borderRadius: 4,
                            cursor: 'pointer', fontSize: 11, fontWeight: 700,
                          }}>
                          Remove
                        </button>
                      </div>
                    )
                  }
                  const alloc = allocationFor(subj._id)
                  return (
                    <div key={name} style={{
                      padding: '10px 12px',
                      background: '#fff', border: '1px solid #E8E2D6',
                      borderRadius: 6,
                      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                    }}>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>
                          {subj.subjectName}
                        </div>
                        <div style={{ fontSize: 11, color: '#6B6B6B' }}>
                          {subj.category}
                        </div>
                      </div>
                      {alloc ? (
                        <>
                          <div style={{
                            background: '#DCFCE7', color: '#15803D',
                            fontSize: 11, fontWeight: 700,
                            padding: '4px 10px', borderRadius: 99,
                          }}>
                            ✓ {alloc.teacherId?.firstName} {alloc.teacherId?.lastName}
                          </div>
                          <button onClick={() => setAllocateFor({ subjectId: subj._id, subjectName: subj.subjectName, currentAlloc: alloc })}
                            style={{
                              background: 'transparent', color: TOKENS.crimson,
                              border: '1px solid #E8E2D6',
                              padding: '4px 10px', borderRadius: 4,
                              cursor: 'pointer', fontSize: 11, fontWeight: 700,
                            }}>
                            Reassign
                          </button>
                          <button onClick={() => unassignTeacher(alloc)}
                            style={{
                              background: '#FEE2E2', color: '#B91C1C',
                              border: 'none',
                              padding: '4px 8px', borderRadius: 4,
                              cursor: 'pointer', fontSize: 11, fontWeight: 700,
                            }}>
                            Unassign
                          </button>
                        </>
                      ) : (
                        <>
                          <div style={{
                            background: '#FEF3C7', color: '#92400E',
                            fontSize: 11, fontWeight: 700,
                            padding: '4px 10px', borderRadius: 99,
                          }}>
                            No teacher
                          </div>
                          <button onClick={() => setAllocateFor({ subjectId: subj._id, subjectName: subj.subjectName })}
                            style={{
                              background: TOKENS.crimson, color: '#fff',
                              border: 'none',
                              padding: '5px 12px', borderRadius: 4,
                              cursor: 'pointer', fontSize: 11, fontWeight: 700,
                            }}>
                            Allocate
                          </button>
                        </>
                      )}
                      <button onClick={() => removeSubject(name)} title="Remove subject"
                        style={{
                          background: 'transparent', border: 'none',
                          color: '#6B6B6B', cursor: 'pointer',
                          padding: 4,
                        }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          background: '#FBFAF5', borderTop: '1px solid #E8E2D6',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose} disabled={saving}
            style={{
              background: '#fff', color: TOKENS.crimson,
              border: '1.5px solid #E8E2D6',
              padding: '9px 18px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            Close
          </button>
          <button onClick={saveBasics} disabled={saving || !dirty}
            style={{
              background: saving || !dirty ? '#9CA3AF' : TOKENS.crimson,
              color: '#fff', border: 'none',
              padding: '9px 22px', borderRadius: 6,
              cursor: saving || !dirty ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
            }}>
            {saving ? 'Saving...' : (dirty ? 'Save Changes' : 'No changes')}
          </button>
        </div>
      </div>

      {/* SUBJECT PICKER */}
      {showSubjectPicker && (
        <SubjectPickerModal
          curriculum={curriculum}
          catalog={subjectCatalog}
          initial={subjects}
          onClose={() => setShowSubjectPicker(false)}
          onSave={(newList) => { setSubjects(newList); setShowSubjectPicker(false) }}
        />
      )}

      {/* ALLOCATE TEACHER */}
      {allocateFor && (
        <AllocateTeacherModal
          studentId={student._id}
          studentName={`${student.firstName} ${student.lastName}`}
          curriculum={curriculum}
          subjectId={allocateFor.subjectId}
          subjectName={allocateFor.subjectName}
          currentAlloc={allocateFor.currentAlloc}
          onClose={() => setAllocateFor(null)}
          onSaved={() => { setAllocateFor(null); refetchAllocs() }}
          toast={toast}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// SUBJECT PICKER MODAL (for editing student's enrolled subjects)
// ═══════════════════════════════════════════════════════════
function SubjectPickerModal({ curriculum, catalog, initial, onClose, onSave }) {
  const [picked, setPicked] = useState(new Set(initial))
  const [search, setSearch] = useState('')

  const toggle = (name) => {
    setPicked(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const filtered = catalog.filter(s =>
    !search.trim() || s.subjectName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'rgba(0,0,0,.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 12,
        maxWidth: 620, width: '100%', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        <div style={{
          padding: '16px 24px',
          background: `linear-gradient(135deg, ${TOKENS.crimson} 0%, ${TOKENS.crimsonDeep} 100%)`,
          color: TOKENS.cream,
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#F0CC5A' }}>
            Subjects
          </div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, marginTop: 2 }}>
            Edit Enrolled Subjects · {curriculum}
          </div>
          <div style={{ fontSize: 12, opacity: .85, marginTop: 4 }}>
            {picked.size} selected of {catalog.length} available
          </div>
        </div>
        <div style={{ padding: '16px 24px', flex: 1, overflow: 'auto' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search subjects..."
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px', borderRadius: 6,
              border: '1.5px solid #E8E2D6',
              fontSize: 13, marginBottom: 10, fontFamily: 'inherit',
            }}/>
          {filtered.length === 0 ? (
            <div style={{ padding: 14, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>
              No subjects match.
            </div>
          ) : (
            <div style={{
              maxHeight: '50vh', overflowY: 'auto',
              border: '1px solid #E8E2D6', borderRadius: 6, padding: 6,
            }}>
              {filtered.map(s => {
                const isPicked = picked.has(s.subjectName)
                return (
                  <div key={s._id}
                    onClick={() => toggle(s.subjectName)}
                    style={{
                      padding: '7px 10px', cursor: 'pointer',
                      background: isPicked ? '#FBF6E3' : 'transparent',
                      borderRadius: 4,
                      display: 'flex', alignItems: 'center', gap: 10,
                      marginBottom: 2,
                    }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 3,
                      border: `1.5px solid ${isPicked ? TOKENS.crimson : '#E8E2D6'}`,
                      background: isPicked ? TOKENS.crimson : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {isPicked && (
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, fontSize: 13 }}>
                      <strong>{s.subjectName}</strong>{' '}
                      <span style={{ color: '#6B6B6B', fontSize: 11.5 }}>({s.category})</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div style={{
          padding: '12px 24px',
          background: '#FBFAF5', borderTop: '1px solid #E8E2D6',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose}
            style={{
              background: '#fff', color: TOKENS.crimson,
              border: '1.5px solid #E8E2D6',
              padding: '9px 18px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            Cancel
          </button>
          <button onClick={() => onSave([...picked])}
            style={{
              background: TOKENS.crimson, color: '#fff', border: 'none',
              padding: '9px 22px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            Use {picked.size} Subject{picked.size === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ALLOCATE TEACHER MODAL
// ═══════════════════════════════════════════════════════════
function AllocateTeacherModal({ studentId, studentName, curriculum, subjectId, subjectName, currentAlloc, onClose, onSaved, toast }) {
  const [qualifiedTeachers, setQualifiedTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pickedTeacherId, setPickedTeacherId] = useState(currentAlloc?.teacherId?._id || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const { data } = await api.get('/users/teachers/qualified', {
          params: { subjectId, curriculum },
        })
        if (cancelled) return
        setQualifiedTeachers(data.teachers || [])
      } catch (e) {
        toast?.error?.('Failed to load teachers: ' + (e?.response?.data?.message || e.message))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [subjectId, curriculum, toast])

  const save = async () => {
    if (!pickedTeacherId) { toast?.error?.('Pick a teacher.'); return }
    if (currentAlloc && pickedTeacherId === currentAlloc.teacherId?._id) { onClose(); return }

    setSaving(true)
    try {
      if (currentAlloc) {
        // Reassign existing allocation
        const { data } = await api.patch('/allocations/' + currentAlloc._id, {
          teacherId: pickedTeacherId,
        })
        if (data?.success) {
          toast?.ok?.('Teacher reassigned.')
          onSaved?.()
        } else {
          toast?.error?.(data?.message || 'Failed to reassign.')
        }
      } else {
        // Create new allocation
        const { data } = await api.post('/allocations', {
          studentId, subjectId, teacherId: pickedTeacherId,
          sendEmails: true,
        })
        if (data?.success) {
          toast?.ok?.('Teacher allocated.')
          onSaved?.()
        } else {
          toast?.error?.(data?.message || 'Failed to allocate.')
        }
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'rgba(0,0,0,.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 12,
        maxWidth: 540, width: '100%', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        <div style={{
          padding: '16px 24px',
          background: `linear-gradient(135deg, ${TOKENS.crimson} 0%, ${TOKENS.crimsonDeep} 100%)`,
          color: TOKENS.cream,
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#F0CC5A' }}>
            {currentAlloc ? 'Reassign Teacher' : 'Allocate Teacher'}
          </div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, marginTop: 2 }}>
            {subjectName} · {curriculum}
          </div>
          <div style={{ fontSize: 12, opacity: .85, marginTop: 4 }}>
            For {studentName}
          </div>
        </div>
        <div style={{ padding: '16px 24px', flex: 1, overflow: 'auto' }}>
          {loading ? (
            <div style={{ padding: 18, fontSize: 12.5, color: '#6B6B6B', textAlign: 'center' }}>
              Finding qualified teachers...
            </div>
          ) : qualifiedTeachers.length === 0 ? (
            <div style={{
              padding: 18, background: '#FEE2E2',
              border: '1px solid #FCA5A5', borderRadius: 6,
              fontSize: 12.5, color: '#991B1B',
            }}>
              <strong>No qualified teachers found.</strong>
              <div style={{ marginTop: 4 }}>
                No active teacher has <strong>{subjectName}</strong> for <strong>{curriculum}</strong> in their teaching specialties.
                Ask a teacher to add this pair in Manage My Subject → My Specialties.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {qualifiedTeachers.map(t => {
                const isPicked = pickedTeacherId === t._id
                const isCurrent = currentAlloc?.teacherId?._id === t._id
                return (
                  <div key={t._id}
                    onClick={() => setPickedTeacherId(t._id)}
                    style={{
                      padding: '10px 12px', cursor: 'pointer',
                      border: `1.5px solid ${isPicked ? TOKENS.crimson : '#E8E2D6'}`,
                      background: isPicked ? '#FBF6E3' : '#fff',
                      borderRadius: 6,
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: `1.5px solid ${isPicked ? TOKENS.crimson : '#E8E2D6'}`,
                      background: isPicked ? TOKENS.crimson : '#fff',
                      flexShrink: 0,
                    }}/>
                    <div style={{ flex: 1, fontSize: 13 }}>
                      <strong>{t.firstName} {t.lastName}</strong>
                      <div style={{ fontSize: 11, color: '#6B6B6B' }}>{t.email}</div>
                    </div>
                    {isCurrent && (
                      <div style={{
                        background: '#DCFCE7', color: '#15803D',
                        fontSize: 10, fontWeight: 700, letterSpacing: '.05em',
                        padding: '3px 8px', borderRadius: 99, textTransform: 'uppercase',
                      }}>
                        Current
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div style={{
          padding: '12px 24px',
          background: '#FBFAF5', borderTop: '1px solid #E8E2D6',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose} disabled={saving}
            style={{
              background: '#fff', color: TOKENS.crimson,
              border: '1.5px solid #E8E2D6',
              padding: '9px 18px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving || loading || !pickedTeacherId}
            style={{
              background: saving || !pickedTeacherId ? '#9CA3AF' : TOKENS.crimson,
              color: '#fff', border: 'none',
              padding: '9px 22px', borderRadius: 6,
              cursor: saving || !pickedTeacherId ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
            }}>
            {saving ? 'Saving...' : (currentAlloc ? 'Reassign' : 'Allocate')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// 6. PAYROLL MODULE
// ═══════════════════════════════════════════════════════════
function PayrollModule({ refreshKey, toast }) {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/users/teachers/list').then(r => { setTeachers(r.data.teachers || []); setLoading(false) }).catch(() => setLoading(false))
  }, [refreshKey])
  const totalPayroll = teachers.reduce((sum, t) => sum + ((t.totalStudents || 0) * 1500), 0)

  return (
    <>
      <PSection tag="Compensation" title="Teacher" em="Payroll" sub="Estimated monthly compensation based on student load"/>
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="On Payroll" value={teachers.length}/>
        <PKpi label="Est. Monthly" value={fmtKsh(totalPayroll)}/>
        <PKpi label="Student-Hours" value={teachers.reduce((s, t) => s + (t.totalStudents || 0), 0)}/>
        <PKpi label="Rate / Hour" value="KSh 1,500"/>
      </div>
      {loading ? <PCard><div style={{ padding: 48, textAlign: 'center', color: TOKENS.s500 }}>Loading...</div></PCard> : teachers.length === 0 ? (
        <PCard><div style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: TOKENS.s600, fontWeight: 600 }}>No teachers on payroll</div>
        </div></PCard>
      ) : (
        <PCard padding={0} style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: TOKENS.s50, borderBottom: '1px solid ' + TOKENS.s100 }}>
              {['Teacher', 'Students', 'Hours/Mo', 'Rate', 'Estimated Pay'].map((h, i) => (
                <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: TOKENS.s500 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {teachers.map(t => {
                const hours = (t.totalStudents || 0) * 4
                const pay = hours * 1500
                return (
                  <tr key={t._id} style={{ borderBottom: '1px solid ' + TOKENS.s100 }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Av init={initials(t.firstName, t.lastName)} col={avColor(t.firstName + t.lastName)} size={32}/>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{t.firstName} {t.lastName}</div>
                          <div style={{ fontSize: 11, color: TOKENS.s400 }}>{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace' }}>{t.totalStudents || 0}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace' }}>{hours}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace' }}>KSh 1,500</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: TOKENS.accentEmerald }}>{fmtKsh(pay)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </PCard>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// 7. LEAVE MODULE
// ═══════════════════════════════════════════════════════════
function LeaveModule({ refreshKey, toast }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/leave-requests').then(r => { setRequests(r.data.requests || r.data || []); setLoading(false) }).catch(() => setLoading(false))
  }, [refreshKey])

  const updateStatus = async (id, status) => {
    try {
      await api.patch('/leave-requests/' + id, { status })
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r))
      toast.ok('Marked as ' + status)
    } catch (e) { toast.error('Update failed: ' + (e.response?.data?.message || e.message)) }
  }
  const pending = requests.filter(r => r.status === 'pending' || !r.status).length

  return (
    <>
      <PSection tag="Time Off" title="Leave" em="Requests" sub="Manage teacher leave applications"/>
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Total" value={requests.length}/>
        <PKpi label="Pending" value={pending} deltaColor={pending > 0 ? TOKENS.accentAmber : TOKENS.accentEmerald}/>
        <PKpi label="Approved" value={requests.filter(r => r.status === 'approved').length}/>
        <PKpi label="Rejected" value={requests.filter(r => r.status === 'rejected').length}/>
      </div>
      {loading ? <PCard><div style={{ padding: 48, textAlign: 'center', color: TOKENS.s500 }}>Loading...</div></PCard> : requests.length === 0 ? (
        <PCard><div style={{ padding: 48, textAlign: 'center', color: TOKENS.s500 }}>No leave requests yet</div></PCard>
      ) : (
        <PCard padding={0} style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: TOKENS.s50, borderBottom: '1px solid ' + TOKENS.s100 }}>
              {['Teacher', 'Type', 'Dates', 'Reason', 'Status', 'Actions'].map((h, i) => (
                <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: TOKENS.s500 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {requests.map(r => (
                <tr key={r._id} style={{ borderBottom: '1px solid ' + TOKENS.s100 }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{r.teacherId?.firstName} {r.teacherId?.lastName}</td>
                  <td style={{ padding: '14px 16px' }}><span style={{ display: 'inline-block', padding: '3px 10px', background: TOKENS.s50, color: TOKENS.s700, border: '1px solid ' + TOKENS.s200, borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{r.type || 'Annual'}</span></td>
                  <td style={{ padding: '14px 16px', fontSize: 12 }}>{fmtDate(r.startDate)} → {fmtDate(r.endDate)}</td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: TOKENS.s600 }}>{r.reason || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                      ...(r.status === 'approved' ? { color: TOKENS.accentEmerald, background: '#DCFCE7', border: '1px solid #86EFAC' } :
                         r.status === 'rejected' ? { color: '#991B1B', background: '#FEE2E2', border: '1px solid #FECACA' } :
                         { color: TOKENS.accentAmber, background: '#FEF3C7', border: '1px solid #FDE68A' }) }}>
                      {r.status || 'pending'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {(!r.status || r.status === 'pending') && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ok btn-sm" onClick={() => updateStatus(r._id, 'approved')}>Approve</button>
                        <button className="btn btn-d btn-sm" onClick={() => updateStatus(r._id, 'rejected')}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PCard>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// 8. PROGRAMMES MODULE
// ═══════════════════════════════════════════════════════════
function ProgrammesModule({ refreshKey, toast }) {
  return (
    <>
      <PSection tag="Programmes" title="IUFP &" em="Study Abroad" sub="International foundation pathways and university preparation"/>
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Programmes" value="3"/>
        <PKpi label="Enrolled" value="42"/>
        <PKpi label="Partner Universities" value="12"/>
        <PKpi label="Placement Rate" value="87%"/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {[
          { name: 'IUFP — UK Pathway', desc: 'University foundation for UK universities', enrolled: 18, fee: 250000 },
          { name: 'IUFP — North America', desc: 'College prep for US/Canada admissions', enrolled: 14, fee: 280000 },
          { name: 'IUFP — Australia/NZ', desc: 'Foundation pathway to Aus/NZ', enrolled: 10, fee: 230000 },
        ].map(p => (
          <PCard key={p.name} accent={TOKENS.accentPurple}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TOKENS.gold, letterSpacing: '.08em', marginBottom: 6, textTransform: 'uppercase' }}>Programme</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, color: TOKENS.s900, marginBottom: 6, fontWeight: 600 }}>{p.name}</h3>
            <div style={{ fontSize: 13, color: TOKENS.s500, lineHeight: 1.6, marginBottom: 14 }}>{p.desc}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid ' + TOKENS.s100 }}>
              <div>
                <div style={{ fontSize: 10, color: TOKENS.s500, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Enrolled</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: TOKENS.s900 }}>{p.enrolled}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: TOKENS.s500, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Annual Fee</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: TOKENS.crimson, fontFamily: 'JetBrains Mono, monospace' }}>{fmtKsh(p.fee)}</div>
              </div>
            </div>
          </PCard>
        ))}
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// 9. LIVE LESSONS MODULE
// ═══════════════════════════════════════════════════════════
function LiveLessonsModule({ refreshKey, toast }) {
  return (
    <>
      <PSection tag="Real-Time Teaching" title="Live" em="Lessons" sub="Monitor active classroom sessions across the platform"/>
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Live Now" value="0"/>
        <PKpi label="Today's Classes" value="12"/>
        <PKpi label="Sessions (Month)" value="847"/>
        <PKpi label="Uptime" value="99.4%"/>
      </div>
      <PCard><div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: TOKENS.s700, marginBottom: 6 }}>No live sessions right now</div>
        <div style={{ fontSize: 13, color: TOKENS.s500 }}>Active classes appear here in real time as teachers go live</div>
      </div></PCard>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// 10. GROUP ROOMS MODULE
// ═══════════════════════════════════════════════════════════
function GroupRoomsModule({ refreshKey, toast }) {
  const store = useStore()
  const [backendRooms, setBackendRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [catalog, setCatalog] = useState({ curricula: [], gradesByCurriculum: {}, subjects: [] })
  const [teachers, setTeachers] = useState([])
  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadBackendRooms() }, [refreshKey])
  useEffect(() => {
    api.get('/curriculum/options').then(res => {
      if (res.data?.success) setCatalog({ curricula: res.data.curricula || [], gradesByCurriculum: res.data.gradesByCurriculum || {}, subjects: res.data.subjects || [] })
    }).catch(() => {})
    api.get('/users?role=teacher').then(res => { if (res.data?.users) setTeachers(res.data.users) }).catch(() => {})
  }, [])

  const loadBackendRooms = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/grouprooms')
      if (data.success) setBackendRooms(data.rooms || [])
    } catch (e) {}
    setLoading(false)
  }

  const openCreate = () => {
    setEditForm({ _id: null, name: '', subject: '', curriculum: '', grade: '', capacity: 10, schedule: '', status: 'Active', teacher: '' })
    setEditModal(true)
  }
  const openEdit = (room) => {
    setEditForm({ _id: room._id, name: room.name || '', subject: room.subject || '', curriculum: room.curriculum || '', grade: room.grade || '', capacity: room.capacity || 10, schedule: room.schedule || '', status: room.status || 'Active', teacher: typeof room.teacher === 'object' && room.teacher !== null ? room.teacher._id : (room.teacher || '') })
    setEditModal(true)
  }
  const closeEdit = () => { setEditModal(false); setEditForm(null) }
  const updateForm = (k, v) => setEditForm(f => ({ ...f, [k]: v }))

  const saveRoom = async () => {
    if (!editForm.name?.trim()) { toast?.error?.('Room name is required'); return }
    if (!editForm.subject) { toast?.error?.('Subject is required'); return }
    if (!editForm.curriculum) { toast?.error?.('Curriculum is required'); return }
    if (!editForm.grade) { toast?.error?.('Grade is required'); return }
    const payload = { name: editForm.name.trim(), subject: editForm.subject, curriculum: editForm.curriculum, grade: editForm.grade, capacity: parseInt(editForm.capacity) || 10, schedule: editForm.schedule || '', status: editForm.status || 'Active', teacher: editForm.teacher || null }
    setSaving(true)
    try {
      let result
      if (editForm._id) result = await api.patch('/grouprooms/' + editForm._id, payload)
      else result = await api.post('/grouprooms', payload)
      if (result.data?.success) { toast?.ok?.(result.data.message || 'Room saved'); await loadBackendRooms(); closeEdit() }
    } catch (e) { toast?.error?.(e.response?.data?.message || 'Save failed') }
    setSaving(false)
  }

  const handleDelete = async (room) => {
    if (!confirm('Delete "' + room.name + '"?')) return
    try {
      const { data } = await api.delete('/grouprooms/' + room._id)
      if (data.success) { toast?.ok?.('Room deleted'); await loadBackendRooms() }
    } catch (e) { toast?.error?.('Delete failed') }
  }

  const availableGrades = editForm ? (catalog.gradesByCurriculum[editForm.curriculum] || []) : []
  const availableSubjects = editForm ? catalog.subjects.filter(s => s.availableIn === 'all' || (Array.isArray(s.availableIn) && s.availableIn.includes(editForm.curriculum))) : []
  const subjectsByCategory = availableSubjects.reduce((acc, s) => { if (!acc[s.category]) acc[s.category] = []; acc[s.category].push(s); return acc }, {})
  const matchingTeachers = editForm ? teachers.filter(t => {
    if (!t.curriculum || !t.subjects) return true
    const teacherCurricula = Array.isArray(t.curriculum) ? t.curriculum : [t.curriculum]
    const matchCurr = teacherCurricula.includes(editForm.curriculum)
    const matchSubj = !editForm.subject || (Array.isArray(t.subjects) && t.subjects.includes(editForm.subject))
    return matchCurr && matchSubj
  }) : []

  return (
    <>
      <PSection tag="Cohort Spaces" title="Group" em="Rooms" sub="Persistent classrooms · Auto-enrollment based on curriculum + grade + subjects"
        action={<button onClick={openCreate} className="btn btn-p btn-sm">+ New Room</button>}
      />
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Total Rooms" value={backendRooms.length}/>
        <PKpi label="Members" value={backendRooms.reduce((sum, r) => sum + (r.students?.length || 0), 0)}/>
        <PKpi label="Subjects" value={new Set(backendRooms.map(r => r.subject)).size}/>
        <PKpi label="Live Now" value={backendRooms.filter(r => r.zoomLink && r.zoomStartedAt).length} deltaColor={TOKENS.accentRose}/>
      </div>

      {loading ? <PCard><div style={{ padding: 48, textAlign: 'center', color: TOKENS.s500 }}>Loading rooms...</div></PCard> : backendRooms.length === 0 ? (
        <PCard><div style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: TOKENS.s700 }}>No group rooms yet</div>
          <div style={{ fontSize: 13, color: TOKENS.s500, marginTop: 6 }}>Click + New Room to create one</div>
        </div></PCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {backendRooms.map(room => {
            const enrolled = room.students?.length || 0
            const capacity = room.capacity || 10
            const isLive = room.zoomLink && room.zoomStartedAt
            return (
              <PCard key={room._id} accent={isLive ? TOKENS.accentRose : TOKENS.accentOcean}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 17, color: TOKENS.s900, margin: 0 }}>{room.name}</h3>
                    <div style={{ fontSize: 12, color: TOKENS.s500, marginTop: 2 }}>{room.subject} · {room.curriculum || '—'} {room.grade ? '· ' + room.grade : ''}</div>
                  </div>
                  {isLive && <span style={{ background: TOKENS.accentRose, color: TOKENS.white, fontSize: 9, fontWeight: 800, padding: '3px 9px', borderRadius: 99, letterSpacing: '.08em' }}>● LIVE</span>}
                </div>
                <div style={{ fontSize: 12, color: TOKENS.s500, marginBottom: 12 }}>{room.schedule || 'No schedule set'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: TOKENS.s500, marginBottom: 14 }}>
                  <span>{enrolled}/{capacity} students</span>
                  <div style={{ flex: 1, height: 4, background: TOKENS.s100, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: Math.min(100, (enrolled / capacity) * 100) + '%', background: enrolled >= capacity ? '#DC2626' : TOKENS.accentEmerald, borderRadius: 99 }}/>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, paddingTop: 12, borderTop: '1px solid ' + TOKENS.s100 }}>
                  <button onClick={() => openEdit(room)} className="btn btn-s btn-sm" style={{ flex: 1 }}>Edit</button>
                  <button onClick={() => handleDelete(room)} className="btn btn-d btn-sm" style={{ flex: 1 }}>Delete</button>
                </div>
              </PCard>
            )
          })}
        </div>
      )}

      {editModal && editForm && (
        <Modal open={editModal} onClose={closeEdit} title={editForm._id ? 'Edit Room' : 'Create New Room'} size="lg"
          footer={<><button className="btn btn-s" onClick={closeEdit} disabled={saving}>Cancel</button><button className="btn btn-p" onClick={saveRoom} disabled={saving}>{saving ? 'Saving...' : (editForm._id ? 'Update' : 'Create')}</button></>}>
          <div>
            <div className="fg"><label className="fl">Room Name *</label>
              <input className="fi" value={editForm.name} onChange={e => updateForm('name', e.target.value)} placeholder="e.g. Mathematics A" autoFocus/></div>
            <div className="fr2">
              <div className="fg"><label className="fl">Curriculum *</label>
                <select className="fsel" value={editForm.curriculum} onChange={e => { updateForm('curriculum', e.target.value); updateForm('grade', ''); updateForm('subject', '') }}>
                  <option value="">Select...</option>
                  {catalog.curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select></div>
              <div className="fg"><label className="fl">Grade *</label>
                <select className="fsel" value={editForm.grade} onChange={e => updateForm('grade', e.target.value)} disabled={!editForm.curriculum}>
                  <option value="">{editForm.curriculum ? 'Select grade...' : 'Select curriculum first'}</option>
                  {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select></div>
            </div>
            <div className="fg"><label className="fl">Subject *</label>
              <select className="fsel" value={editForm.subject} onChange={e => updateForm('subject', e.target.value)} disabled={!editForm.curriculum}>
                <option value="">{editForm.curriculum ? 'Select subject...' : 'Select curriculum first'}</option>
                {Object.entries(subjectsByCategory).map(([cat, subs]) => (
                  <optgroup key={cat} label={cat}>{subs.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</optgroup>
                ))}
              </select></div>
            <div className="fg"><label className="fl">Teacher</label>
              <select className="fsel" value={editForm.teacher} onChange={e => updateForm('teacher', e.target.value)}>
                <option value="">No teacher assigned</option>
                {matchingTeachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
              </select></div>
            <div className="fr2">
              <div className="fg"><label className="fl">Capacity</label>
                <input className="fi" type="number" min="1" max="100" value={editForm.capacity} onChange={e => updateForm('capacity', e.target.value)}/></div>
              <div className="fg"><label className="fl">Status</label>
                <select className="fsel" value={editForm.status} onChange={e => updateForm('status', e.target.value)}><option>Active</option><option>Inactive</option></select></div>
            </div>
            <div className="fg"><label className="fl">Schedule</label>
              <input className="fi" value={editForm.schedule} onChange={e => updateForm('schedule', e.target.value)} placeholder="e.g. Mon/Wed 10:00–11:00 AM"/></div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// 11. CURRICULUM MODULE
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// SYLLABUS SPINE TAB — manage the curriculum spine per subject
// Pick a subject → view/add/edit/delete/reorder topics and their
// subtopics. Topics drive the question bank, lesson setting and
// lesson player. Includes a one-click loader for the verified
// IGCSE Mathematics 0580 structure.
// ═══════════════════════════════════════════════════════════

// Verified IGCSE Mathematics 0580 structure (2025–2027), confirmed
// by Smartious. Used by the "Load IGCSE Maths" action.
const IGCSE_MATHS_0580 = [
  { topic: 'Number', code: '1', subtopics: [
    { name: 'Types of number (integers, primes, squares, cubes, factors, multiples, HCF, LCM)', code: '1.1', suggestedLessons: 2 },
    { name: 'Sets and Venn diagrams', code: '1.2', suggestedLessons: 2 },
    { name: 'Powers and roots', code: '1.3', suggestedLessons: 1 },
    { name: 'Fractions, decimals and percentages', code: '1.4', suggestedLessons: 2 },
    { name: 'Ordering and the four operations', code: '1.5', suggestedLessons: 1 },
    { name: 'Indices, standard form and estimation', code: '1.6', suggestedLessons: 2 },
    { name: 'Ratio, proportion and rates', code: '1.7', suggestedLessons: 2 },
    { name: 'Percentages, money and finance (interest, exchange)', code: '1.8', suggestedLessons: 2 },
    { name: 'Surds, bounds and exponential growth & decay', code: '1.9', suggestedLessons: 2 },
  ]},
  { topic: 'Algebra and graphs', code: '2', subtopics: [
    { name: 'Introduction to algebra (notation, substitution)', code: '2.1', suggestedLessons: 1 },
    { name: 'Algebraic manipulation (simplifying, expanding, factorising)', code: '2.2', suggestedLessons: 3 },
    { name: 'Algebraic fractions', code: '2.3', suggestedLessons: 2 },
    { name: 'Indices II (rules of indices)', code: '2.4', suggestedLessons: 1 },
    { name: 'Equations (linear, simultaneous, quadratic)', code: '2.5', suggestedLessons: 4 },
    { name: 'Inequalities', code: '2.6', suggestedLessons: 2 },
    { name: 'Sequences (linear, quadratic, geometric)', code: '2.7', suggestedLessons: 2 },
    { name: 'Proportion (direct and inverse)', code: '2.8', suggestedLessons: 1 },
    { name: 'Graphs in practical situations', code: '2.9', suggestedLessons: 1 },
    { name: 'Graphs of functions', code: '2.10', suggestedLessons: 2 },
    { name: 'Sketching curves', code: '2.11', suggestedLessons: 1 },
    { name: 'Differentiation', code: '2.12', suggestedLessons: 1 },
    { name: 'Functions (notation, composite, inverse)', code: '2.13', suggestedLessons: 1 },
  ]},
  { topic: 'Coordinate geometry', code: '3', subtopics: [
    { name: 'Coordinates', code: '3.1', suggestedLessons: 1 },
    { name: 'Drawing linear graphs', code: '3.2', suggestedLessons: 1 },
    { name: 'Gradient of linear graphs', code: '3.3', suggestedLessons: 1 },
    { name: 'Length and midpoint', code: '3.4', suggestedLessons: 1 },
    { name: 'Equations of linear graphs', code: '3.5', suggestedLessons: 2 },
    { name: 'Parallel lines', code: '3.6', suggestedLessons: 1 },
    { name: 'Perpendicular lines', code: '3.7', suggestedLessons: 1 },
  ]},
  { topic: 'Geometry', code: '4', subtopics: [
    { name: 'Geometrical terms', code: '4.1', suggestedLessons: 1 },
    { name: 'Geometrical constructions', code: '4.2', suggestedLessons: 2 },
    { name: 'Scale drawings', code: '4.3', suggestedLessons: 1 },
    { name: 'Similarity', code: '4.4', suggestedLessons: 2 },
    { name: 'Symmetry', code: '4.5', suggestedLessons: 1 },
    { name: 'Angles', code: '4.6', suggestedLessons: 2 },
    { name: 'Circle theorems I', code: '4.7', suggestedLessons: 2 },
    { name: 'Circle theorems II', code: '4.8', suggestedLessons: 2 },
  ]},
  { topic: 'Mensuration', code: '5', subtopics: [
    { name: 'Units of measure', code: '5.1', suggestedLessons: 1 },
    { name: 'Area and perimeter', code: '5.2', suggestedLessons: 2 },
    { name: 'Circles, arcs and sectors', code: '5.3', suggestedLessons: 2 },
    { name: 'Surface area and volume', code: '5.4', suggestedLessons: 2 },
    { name: 'Compound shapes and parts of shapes', code: '5.5', suggestedLessons: 2 },
  ]},
  { topic: 'Trigonometry', code: '6', subtopics: [
    { name: "Pythagoras' theorem", code: '6.1', suggestedLessons: 2 },
    { name: 'Right-angled triangle trigonometry', code: '6.2', suggestedLessons: 3 },
    { name: 'Exact trigonometric values', code: '6.3', suggestedLessons: 1 },
    { name: 'Trigonometric functions (graphs)', code: '6.4', suggestedLessons: 1 },
    { name: 'Non-right-angled trigonometry (sine & cosine rules)', code: '6.5', suggestedLessons: 2 },
    { name: 'Three-dimensional trigonometry', code: '6.6', suggestedLessons: 2 },
  ]},
  { topic: 'Transformations and vectors', code: '7', subtopics: [
    { name: 'Transformations (reflection, rotation, translation, enlargement)', code: '7.1', suggestedLessons: 3 },
    { name: 'Vectors in two dimensions', code: '7.2', suggestedLessons: 2 },
    { name: 'Magnitude of a vector', code: '7.3', suggestedLessons: 1 },
    { name: 'Vector geometry', code: '7.4', suggestedLessons: 2 },
  ]},
  { topic: 'Probability', code: '8', subtopics: [
    { name: 'Introduction to probability', code: '8.1', suggestedLessons: 1 },
    { name: 'Relative and expected frequency', code: '8.2', suggestedLessons: 1 },
    { name: 'Probability of combined events', code: '8.3', suggestedLessons: 2 },
    { name: 'Conditional probability', code: '8.4', suggestedLessons: 2 },
    { name: 'Tree diagrams and Venn diagrams in probability', code: '8.5', suggestedLessons: 2 },
  ]},
  { topic: 'Statistics', code: '9', subtopics: [
    { name: 'Classifying statistical data', code: '9.1', suggestedLessons: 1 },
    { name: 'Interpreting statistical data', code: '9.2', suggestedLessons: 1 },
    { name: 'Averages and measures of spread', code: '9.3', suggestedLessons: 2 },
    { name: 'Statistical charts and diagrams', code: '9.4', suggestedLessons: 2 },
    { name: 'Scatter diagrams', code: '9.5', suggestedLessons: 2 },
    { name: 'Cumulative frequency diagrams', code: '9.6', suggestedLessons: 3 },
  ]},
]

// ═══════════════════════════════════════════════════════════
// CAMBRIDGE PRIMARY SPINES
// Verified against the official Cambridge framework documents
// by Smartious. Stage tags follow Cambridge convention.
// Stage N at Cambridge = Year N at Smartious.
// ═══════════════════════════════════════════════════════════

// ── PRIMARY MATHEMATICS 0096 ───────────────────────────────
// 10 topics (sub-strands), 60 stage-level subtopics, 155 lessons.
const PRIMARY_MATHS_0096 = [
  { topic: 'Counting and sequences (Nc)', code: 'Nc', subtopics: [
    { name: 'Stage 1: Counting to 20; counting in 1s, 2s, 10s; recognising sequences', code: 'Nc.1', suggestedLessons: 4 },
    { name: 'Stage 2: Counting to 100; counting in 2s, 5s, 10s; odd/even', code: 'Nc.2', suggestedLessons: 3 },
    { name: 'Stage 3: Counting in 4s, 8s, 50s, 100s; linear sequences', code: 'Nc.3', suggestedLessons: 3 },
    { name: 'Stage 4: Counting forwards/backwards in steps; non-unit fractions in sequence', code: 'Nc.4', suggestedLessons: 3 },
    { name: 'Stage 5: Sequences with whole numbers, fractions, decimals; term-to-term rules', code: 'Nc.5', suggestedLessons: 3 },
    { name: 'Stage 6: Sequences involving negatives, fractions, decimals; nth-term thinking', code: 'Nc.6', suggestedLessons: 3 },
  ]},
  { topic: 'Place value, ordering and rounding (Np)', code: 'Np', subtopics: [
    { name: 'Stage 1: Numbers to 20; tens and ones; ordering small numbers', code: 'Np.1', suggestedLessons: 3 },
    { name: 'Stage 2: Numbers to 100; place value tens and ones; ordering and comparing', code: 'Np.2', suggestedLessons: 3 },
    { name: 'Stage 3: Numbers to 1000; place value HTO; rounding to nearest 10', code: 'Np.3', suggestedLessons: 3 },
    { name: 'Stage 4: Numbers to 10 000; rounding to nearest 10/100; decimals to tenths', code: 'Np.4', suggestedLessons: 4 },
    { name: 'Stage 5: Numbers to 1 000 000; decimals to hundredths; rounding decimals', code: 'Np.5', suggestedLessons: 4 },
    { name: 'Stage 6: Decimals to thousandths; rounding to nearest 10/100/1000 and decimal places', code: 'Np.6', suggestedLessons: 4 },
  ]},
  { topic: 'Integers and powers (Ni)', code: 'Ni', subtopics: [
    { name: 'Stage 1: Addition and subtraction within 10; doubles to 10; halving', code: 'Ni.1', suggestedLessons: 4 },
    { name: 'Stage 2: Addition/subtraction within 100; multiplication as repeated addition; division by sharing', code: 'Ni.2', suggestedLessons: 5 },
    { name: 'Stage 3: Multiplication tables 2, 3, 4, 5, 10; written addition/subtraction HTO', code: 'Ni.3', suggestedLessons: 5 },
    { name: 'Stage 4: Tables to 10×10; column addition/subtraction; short multiplication and division; multiples and factors', code: 'Ni.4', suggestedLessons: 6 },
    { name: 'Stage 5: Long multiplication and short division; primes; squares; order of operations', code: 'Ni.5', suggestedLessons: 6 },
    { name: 'Stage 6: Long division; squares, cubes and roots; negative numbers in context; BODMAS', code: 'Ni.6', suggestedLessons: 5 },
  ]},
  { topic: 'Money (Nm)', code: 'Nm', subtopics: [
    { name: 'Stage 1: Recognising coins and notes; small totals', code: 'Nm.1', suggestedLessons: 1 },
    { name: 'Stage 2: Adding/subtracting amounts of money; change', code: 'Nm.2', suggestedLessons: 1 },
    { name: 'Stage 3: Money in real-life contexts; converting pounds and pence (or local equivalent)', code: 'Nm.3', suggestedLessons: 2 },
    { name: 'Stage 4: Word problems involving money calculations', code: 'Nm.4', suggestedLessons: 2 },
    { name: 'Stage 5: Budgeting; percentage discounts (simple cases)', code: 'Nm.5', suggestedLessons: 2 },
    { name: 'Stage 6: Profit and loss; percentage change in money contexts', code: 'Nm.6', suggestedLessons: 2 },
  ]},
  { topic: 'Fractions, decimals, percentages, ratio and proportion (Nf)', code: 'Nf', subtopics: [
    { name: 'Stage 1: Halves of shapes and small quantities', code: 'Nf.1', suggestedLessons: 1 },
    { name: 'Stage 2: Halves and quarters; equivalence of halves and quarters', code: 'Nf.2', suggestedLessons: 2 },
    { name: 'Stage 3: Unit fractions; equivalent fractions; comparing fractions', code: 'Nf.3', suggestedLessons: 3 },
    { name: 'Stage 4: Tenths and hundredths; mixed numbers; decimals to tenths; fraction-decimal links', code: 'Nf.4', suggestedLessons: 4 },
    { name: 'Stage 5: Adding/subtracting fractions with same denominator; decimals to hundredths; simple percentages', code: 'Nf.5', suggestedLessons: 5 },
    { name: 'Stage 6: Operations with fractions and decimals; percentage of a quantity; ratio and direct proportion', code: 'Nf.6', suggestedLessons: 6 },
  ]},
  { topic: 'Geometrical reasoning, shapes and measurements (Gg)', code: 'Gg', subtopics: [
    { name: 'Stage 1: Naming 2D shapes (circle, square, triangle, rectangle) and 3D shapes; non-standard measurement', code: 'Gg.1', suggestedLessons: 3 },
    { name: 'Stage 2: Properties of 2D shapes; standard units of length, mass, capacity', code: 'Gg.2', suggestedLessons: 4 },
    { name: 'Stage 3: Right angles; symmetry; perimeter of rectangles; mm, cm, m, g, kg, ml, l', code: 'Gg.3', suggestedLessons: 4 },
    { name: 'Stage 4: Acute, right, obtuse angles; area of rectangles by counting squares; converting units', code: 'Gg.4', suggestedLessons: 5 },
    { name: 'Stage 5: Angles on a straight line; area and perimeter; volume of cuboids by counting cubes; circles (parts)', code: 'Gg.5', suggestedLessons: 5 },
    { name: 'Stage 6: Angles in shapes; sum of angles; compound shapes; area and volume formulae; nets of 3D shapes', code: 'Gg.6', suggestedLessons: 6 },
  ]},
  { topic: 'Position and transformation (Gp)', code: 'Gp', subtopics: [
    { name: 'Stage 1: Positional language: above/below, left/right, behind/in front', code: 'Gp.1', suggestedLessons: 1 },
    { name: 'Stage 2: Following directions; quarter, half, three-quarter turns', code: 'Gp.2', suggestedLessons: 2 },
    { name: 'Stage 3: Coordinates of a grid (first quadrant); reflection in a line', code: 'Gp.3', suggestedLessons: 2 },
    { name: 'Stage 4: Coordinates; reflection in horizontal and vertical lines; translation', code: 'Gp.4', suggestedLessons: 3 },
    { name: 'Stage 5: Coordinates in four quadrants; rotation about a point', code: 'Gp.5', suggestedLessons: 3 },
    { name: 'Stage 6: Combinations of reflections, rotations, translations; bearings (intro)', code: 'Gp.6', suggestedLessons: 3 },
  ]},
  { topic: 'Time (Gt)', code: 'Gt', subtopics: [
    { name: 'Stage 1: Days of the week; o\u2019clock and half past', code: 'Gt.1', suggestedLessons: 1 },
    { name: 'Stage 2: Quarter past/to; minutes; reading analogue clocks', code: 'Gt.2', suggestedLessons: 2 },
    { name: 'Stage 3: Digital and analogue time; intervals; reading timetables', code: 'Gt.3', suggestedLessons: 2 },
    { name: 'Stage 4: 12- and 24-hour time; time intervals across hours', code: 'Gt.4', suggestedLessons: 3 },
    { name: 'Stage 5: Time-zone problems; converting time units', code: 'Gt.5', suggestedLessons: 2 },
    { name: 'Stage 6: Compound time problems; timetables and schedules', code: 'Gt.6', suggestedLessons: 2 },
  ]},
  { topic: 'Statistics (Ss)', code: 'Ss', subtopics: [
    { name: 'Stage 1: Sorting objects into groups; simple pictograms', code: 'Ss.1', suggestedLessons: 1 },
    { name: 'Stage 2: Pictograms and block diagrams; Carroll and Venn diagrams (one criterion)', code: 'Ss.2', suggestedLessons: 2 },
    { name: 'Stage 3: Bar charts; tally charts; mode (informally)', code: 'Ss.3', suggestedLessons: 2 },
    { name: 'Stage 4: Bar charts with scaled axes; mode; range', code: 'Ss.4', suggestedLessons: 3 },
    { name: 'Stage 5: Line graphs; mode, median and range', code: 'Ss.5', suggestedLessons: 3 },
    { name: 'Stage 6: Pie charts; mean, median, mode and range; the statistical enquiry cycle', code: 'Ss.6', suggestedLessons: 4 },
  ]},
  { topic: 'Probability (Sp)', code: 'Sp', subtopics: [
    { name: 'Stage 1: Likelihood: certain, possible, impossible', code: 'Sp.1', suggestedLessons: 1 },
    { name: 'Stage 2: More likely / less likely / equally likely', code: 'Sp.2', suggestedLessons: 1 },
    { name: 'Stage 3: Listing outcomes of simple events', code: 'Sp.3', suggestedLessons: 1 },
    { name: 'Stage 4: Likelihood scale (0 \u2013 certain); fairness of games', code: 'Sp.4', suggestedLessons: 2 },
    { name: 'Stage 5: Probability as a fraction; experimental probability', code: 'Sp.5', suggestedLessons: 2 },
    { name: 'Stage 6: Probability of combined simple events; expected vs experimental outcomes', code: 'Sp.6', suggestedLessons: 2 },
  ]},
]
// ── PRIMARY ENGLISH 0058 ───────────────────────────────────
// 19 topics (sub-strands), 110 stage-level subtopics, 261 lessons.
// Reading: Rp, Rw, Rv, Rg, Rs, Rc, Re (Rp Stages 1-4 only).
// Writing: Wp, Ww, Wv, Wg, Ws, Wc, We (Wp Stages 1-4 only).
// Speaking & Listening: SLm, SLs, SLg, SLp, SLr.
const PRIMARY_ENGLISH_0058 = [
  // ─── READING ────────────────────────────────────────────
  { topic: 'Reading: Word structure / phonics (Rp)', code: 'Rp', subtopics: [
    { name: 'Stage 1: Phonemic awareness; letter-sound correspondences; blending simple CVC words', code: '1Rp', suggestedLessons: 4 },
    { name: 'Stage 2: Consonant clusters, digraphs, trigraphs; reading multi-syllable words', code: '2Rp', suggestedLessons: 3 },
    { name: 'Stage 3: Less common letter-sound correspondences; reading words with prefixes/suffixes', code: '3Rp', suggestedLessons: 2 },
    { name: 'Stage 4: Reading complex multi-syllable words; alternative spellings of phonemes', code: '4Rp', suggestedLessons: 2 },
  ]},
  { topic: 'Reading: Word structure / spelling (Rw)', code: 'Rw', subtopics: [
    { name: 'Stage 1: High-frequency words; simple word families', code: '1Rw', suggestedLessons: 2 },
    { name: 'Stage 2: Common prefixes and suffixes; spelling patterns in known words', code: '2Rw', suggestedLessons: 2 },
    { name: 'Stage 3: Root words; compound words; common affixes', code: '3Rw', suggestedLessons: 2 },
    { name: 'Stage 4: Less common affixes; spelling rules in reading', code: '4Rw', suggestedLessons: 2 },
    { name: 'Stage 5: Word origins; word families across languages', code: '5Rw', suggestedLessons: 2 },
    { name: 'Stage 6: Etymology; complex word families', code: '6Rw', suggestedLessons: 2 },
  ]},
  { topic: 'Reading: Vocabulary and language (Rv)', code: 'Rv', subtopics: [
    { name: 'Stage 1: Vocabulary in familiar texts; talking about word meanings', code: '1Rv', suggestedLessons: 2 },
    { name: 'Stage 2: Inferring word meanings from context; simple synonyms', code: '2Rv', suggestedLessons: 3 },
    { name: 'Stage 3: Word choice for effect; basic figurative language (similes)', code: '3Rv', suggestedLessons: 3 },
    { name: 'Stage 4: Connotations; idiomatic phrases; metaphors', code: '4Rv', suggestedLessons: 3 },
    { name: 'Stage 5: Figurative language: metaphor, personification; commenting on writer\u2019s choices', code: '5Rv', suggestedLessons: 4 },
    { name: 'Stage 6: Subtle vocabulary effects; figurative imagery beyond literal', code: '6Rv', suggestedLessons: 4 },
  ]},
  { topic: 'Reading: Grammar and punctuation (Rg)', code: 'Rg', subtopics: [
    { name: 'Stage 1: Simple sentences; full stops, capital letters, question marks', code: '1Rg', suggestedLessons: 2 },
    { name: 'Stage 2: Conjunctions (and, but, because, if, when); commands and questions', code: '2Rg', suggestedLessons: 3 },
    { name: 'Stage 3: Tense in texts; speech punctuation; apostrophes', code: '3Rg', suggestedLessons: 3 },
    { name: 'Stage 4: Clauses; commas in lists; possessive apostrophes', code: '4Rg', suggestedLessons: 3 },
    { name: 'Stage 5: Complex sentences; punctuation for clarity; relative clauses', code: '5Rg', suggestedLessons: 3 },
    { name: 'Stage 6: Colons, semicolons, parenthetic commas, dashes, brackets; active/passive', code: '6Rg', suggestedLessons: 4 },
  ]},
  { topic: 'Reading: Structure of texts (Rs)', code: 'Rs', subtopics: [
    { name: 'Stage 1: Beginning, middle, end of simple stories', code: '1Rs', suggestedLessons: 2 },
    { name: 'Stage 2: Features of fiction vs non-fiction; simple poems', code: '2Rs', suggestedLessons: 3 },
    { name: 'Stage 3: Chapters; headings; paragraphs; story structures', code: '3Rs', suggestedLessons: 3 },
    { name: 'Stage 4: Compare structures across text types; narrative arcs', code: '4Rs', suggestedLessons: 3 },
    { name: 'Stage 5: Identifying organisational features in complex texts', code: '5Rs', suggestedLessons: 3 },
    { name: 'Stage 6: Effects of structural choices; sophisticated narrative structures', code: '6Rs', suggestedLessons: 3 },
  ]},
  { topic: 'Reading for comprehension (Rc)', code: 'Rc', subtopics: [
    { name: 'Stage 1: Retrieving information from simple texts; predicting', code: '1Rc', suggestedLessons: 3 },
    { name: 'Stage 2: Inferring feelings and reasons; making simple predictions', code: '2Rc', suggestedLessons: 4 },
    { name: 'Stage 3: Comprehension across fiction and non-fiction; summarising', code: '3Rc', suggestedLessons: 4 },
    { name: 'Stage 4: Inference using evidence; tracing ideas through a text', code: '4Rc', suggestedLessons: 4 },
    { name: 'Stage 5: Theme; viewpoint; comparing texts', code: '5Rc', suggestedLessons: 4 },
    { name: 'Stage 6: Multi-text comparison; evaluating reliability of sources', code: '6Rc', suggestedLessons: 5 },
  ]},
  { topic: 'Reading: Reflection and evaluation (Re)', code: 'Re', subtopics: [
    { name: 'Stage 1: Talking about likes/dislikes in texts', code: '1Re', suggestedLessons: 1 },
    { name: 'Stage 2: Talking about characters and events', code: '2Re', suggestedLessons: 2 },
    { name: 'Stage 3: Reflecting on writer\u2019s intention; preferences', code: '3Re', suggestedLessons: 2 },
    { name: 'Stage 4: Comparing own response to others\u2019', code: '4Re', suggestedLessons: 2 },
    { name: 'Stage 5: Evaluating a writer\u2019s effectiveness', code: '5Re', suggestedLessons: 3 },
    { name: 'Stage 6: Critical evaluation; judging reliability and bias', code: '6Re', suggestedLessons: 3 },
  ]},
  // ─── WRITING ────────────────────────────────────────────
  { topic: 'Writing: Word structure / phonics (Wp)', code: 'Wp', subtopics: [
    { name: 'Stage 1: Forming letters; writing CVC words using phonics', code: '1Wp', suggestedLessons: 4 },
    { name: 'Stage 2: Segmenting and writing words with digraphs and clusters', code: '2Wp', suggestedLessons: 3 },
    { name: 'Stage 3: Spelling words using known phonic patterns', code: '3Wp', suggestedLessons: 2 },
    { name: 'Stage 4: Applying phonics to complex words', code: '4Wp', suggestedLessons: 2 },
  ]},
  { topic: 'Writing: Word structure / spelling (Ww)', code: 'Ww', subtopics: [
    { name: 'Stage 1: Spelling common high-frequency words; own name', code: '1Ww', suggestedLessons: 2 },
    { name: 'Stage 2: Common prefixes and suffixes in writing', code: '2Ww', suggestedLessons: 2 },
    { name: 'Stage 3: Compound words; common spelling patterns', code: '3Ww', suggestedLessons: 3 },
    { name: 'Stage 4: Spelling rules: doubling, dropping e, adding suffixes', code: '4Ww', suggestedLessons: 3 },
    { name: 'Stage 5: Less common spelling patterns; homophones', code: '5Ww', suggestedLessons: 3 },
    { name: 'Stage 6: Complex spelling; etymology-informed spelling', code: '6Ww', suggestedLessons: 3 },
  ]},
  { topic: 'Writing: Vocabulary and language (Wv)', code: 'Wv', subtopics: [
    { name: 'Stage 1: Using simple descriptive words in own writing', code: '1Wv', suggestedLessons: 2 },
    { name: 'Stage 2: Choosing adjectives, verbs, adverbs; word banks', code: '2Wv', suggestedLessons: 3 },
    { name: 'Stage 3: Synonyms in own writing; alternatives to "said"', code: '3Wv', suggestedLessons: 3 },
    { name: 'Stage 4: Using thesaurus; precise word choice', code: '4Wv', suggestedLessons: 3 },
    { name: 'Stage 5: Using figurative language: simile, metaphor in writing', code: '5Wv', suggestedLessons: 4 },
    { name: 'Stage 6: Sustained figurative imagery; controlled language for effect', code: '6Wv', suggestedLessons: 4 },
  ]},
  { topic: 'Writing: Grammar and punctuation (Wg)', code: 'Wg', subtopics: [
    { name: 'Stage 1: Writing simple sentences with capital letters and full stops', code: '1Wg', suggestedLessons: 2 },
    { name: 'Stage 2: Using conjunctions; punctuating commands and questions', code: '2Wg', suggestedLessons: 3 },
    { name: 'Stage 3: Using past, present, future tense; speech punctuation', code: '3Wg', suggestedLessons: 3 },
    { name: 'Stage 4: Compound sentences; commas in lists; possessive apostrophes', code: '4Wg', suggestedLessons: 4 },
    { name: 'Stage 5: Complex sentences; punctuation for clarity', code: '5Wg', suggestedLessons: 4 },
    { name: 'Stage 6: Sophisticated punctuation: colons, semicolons, brackets, dashes; active/passive', code: '6Wg', suggestedLessons: 4 },
  ]},
  { topic: 'Writing: Structure of texts (Ws)', code: 'Ws', subtopics: [
    { name: 'Stage 1: Writing a simple sequence of events', code: '1Ws', suggestedLessons: 2 },
    { name: 'Stage 2: Writing stories with beginning/middle/end; grouping related ideas', code: '2Ws', suggestedLessons: 3 },
    { name: 'Stage 3: Paragraphs; headings; organising non-fiction', code: '3Ws', suggestedLessons: 3 },
    { name: 'Stage 4: Linking paragraphs; topic sentences', code: '4Ws', suggestedLessons: 4 },
    { name: 'Stage 5: Structuring extended texts; planning a narrative arc', code: '5Ws', suggestedLessons: 4 },
    { name: 'Stage 6: Crafted structural choices; cohesive devices across a text', code: '6Ws', suggestedLessons: 4 },
  ]},
  { topic: 'Writing for purpose (Wc)', code: 'Wc', subtopics: [
    { name: 'Stage 1: Writing labels, captions, simple sentences for a reason', code: '1Wc', suggestedLessons: 2 },
    { name: 'Stage 2: Writing simple stories, recounts, letters', code: '2Wc', suggestedLessons: 4 },
    { name: 'Stage 3: Writing for different text types (instructions, reports, narratives)', code: '3Wc', suggestedLessons: 4 },
    { name: 'Stage 4: Adapting tone for audience; persuasive writing', code: '4Wc', suggestedLessons: 4 },
    { name: 'Stage 5: Sustained writing for varied purposes', code: '5Wc', suggestedLessons: 5 },
    { name: 'Stage 6: Writing with deliberate authorial voice for chosen audiences', code: '6Wc', suggestedLessons: 5 },
  ]},
  { topic: 'Writing: Reflection and evaluation (We)', code: 'We', subtopics: [
    { name: 'Stage 1: Talking about own writing; simple corrections', code: '1We', suggestedLessons: 1 },
    { name: 'Stage 2: Re-reading and correcting own writing', code: '2We', suggestedLessons: 2 },
    { name: 'Stage 3: Editing for clarity and accuracy', code: '3We', suggestedLessons: 2 },
    { name: 'Stage 4: Self- and peer-editing for content and grammar', code: '4We', suggestedLessons: 3 },
    { name: 'Stage 5: Evaluating own writing against criteria', code: '5We', suggestedLessons: 3 },
    { name: 'Stage 6: Critical self-evaluation; redrafting for effect', code: '6We', suggestedLessons: 3 },
  ]},
  // ─── SPEAKING & LISTENING ───────────────────────────────
  { topic: 'Speaking & Listening: Making yourself understood (SLm)', code: 'SLm', subtopics: [
    { name: 'Stage 1: Speaking audibly; sharing news about self', code: '1SLm', suggestedLessons: 1 },
    { name: 'Stage 2: Sequencing speech; using vocabulary clearly', code: '2SLm', suggestedLessons: 2 },
    { name: 'Stage 3: Speaking to inform; pacing and volume', code: '3SLm', suggestedLessons: 2 },
    { name: 'Stage 4: Adapting language to audience; clarity of explanation', code: '4SLm', suggestedLessons: 2 },
    { name: 'Stage 5: Organising spoken information; using register', code: '5SLm', suggestedLessons: 3 },
    { name: 'Stage 6: Formal and informal registers; structuring main and supporting points', code: '6SLm', suggestedLessons: 3 },
  ]},
  { topic: 'Speaking & Listening: Showing understanding (SLs)', code: 'SLs', subtopics: [
    { name: 'Stage 1: Listening to instructions; responding to simple questions', code: '1SLs', suggestedLessons: 1 },
    { name: 'Stage 2: Listening to stories and explanations; responding with relevance', code: '2SLs', suggestedLessons: 2 },
    { name: 'Stage 3: Listening for key information; recall and questioning', code: '3SLs', suggestedLessons: 2 },
    { name: 'Stage 4: Active listening; clarifying and confirming understanding', code: '4SLs', suggestedLessons: 2 },
    { name: 'Stage 5: Responding with reasoned ideas; building on others\u2019 contributions', code: '5SLs', suggestedLessons: 2 },
    { name: 'Stage 6: Reflective listening; reasoned response with reference to specific points', code: '6SLs', suggestedLessons: 3 },
  ]},
  { topic: 'Speaking & Listening: Group work and discussion (SLg)', code: 'SLg', subtopics: [
    { name: 'Stage 1: Taking turns in talk; simple paired conversation', code: '1SLg', suggestedLessons: 1 },
    { name: 'Stage 2: Small-group talk; staying on topic', code: '2SLg', suggestedLessons: 2 },
    { name: 'Stage 3: Group roles; agreeing and disagreeing politely', code: '3SLg', suggestedLessons: 2 },
    { name: 'Stage 4: Cooperative talk; building on others\u2019 ideas', code: '4SLg', suggestedLessons: 2 },
    { name: 'Stage 5: Leading and following in discussions; reaching consensus', code: '5SLg', suggestedLessons: 3 },
    { name: 'Stage 6: Taking assigned roles; helping assign roles in groups', code: '6SLg', suggestedLessons: 3 },
  ]},
  { topic: 'Speaking & Listening: Performance (SLp)', code: 'SLp', subtopics: [
    { name: 'Stage 1: Reading aloud familiar texts; simple recitation', code: '1SLp', suggestedLessons: 1 },
    { name: 'Stage 2: Reading with expression; short rehearsed presentations', code: '2SLp', suggestedLessons: 2 },
    { name: 'Stage 3: Performing poetry and short drama', code: '3SLp', suggestedLessons: 2 },
    { name: 'Stage 4: Giving short prepared presentations', code: '4SLp', suggestedLessons: 2 },
    { name: 'Stage 5: Performing with control of voice and gesture', code: '5SLp', suggestedLessons: 2 },
    { name: 'Stage 6: Extended presentations; engaging an audience', code: '6SLp', suggestedLessons: 3 },
  ]},
  { topic: 'Speaking & Listening: Reflection and evaluation (SLr)', code: 'SLr', subtopics: [
    { name: 'Stage 1: Saying what was enjoyable; noticing non-verbal communication', code: '1SLr', suggestedLessons: 1 },
    { name: 'Stage 2: Reflecting on own contributions in group talk', code: '2SLr', suggestedLessons: 1 },
    { name: 'Stage 3: Reviewing what worked in a presentation', code: '3SLr', suggestedLessons: 2 },
    { name: 'Stage 4: Self- and peer-feedback on speaking', code: '4SLr', suggestedLessons: 2 },
    { name: 'Stage 5: Evaluating effectiveness of speaking against criteria', code: '5SLr', suggestedLessons: 2 },
    { name: 'Stage 6: Critical reflection on talk; suggesting improvements', code: '6SLr', suggestedLessons: 2 },
  ]},
]
// ── PRIMARY SCIENCE 0097 ───────────────────────────────────
// 17 topics, 97 stage-level subtopics, 266 lessons.
// Skills: TWSm, TWSp, TWSc, TWSa (Thinking & Working Scientifically).
// Content: Bs/Bp/Be (Biology, Be starts Stage 2);
//          Cm/Cp/Cc (Chemistry); Pf/Pl/Pe (Physics);
//          Ep/Ec/Es (Earth & Space, Ec only Stages 5-6).
// Context: SiC (Science in Context).
const PRIMARY_SCIENCE_0097 = [
  // ─── SKILLS — THINKING & WORKING SCIENTIFICALLY ─────────
  { topic: 'TWS: Models and representations (TWSm)', code: 'TWSm', subtopics: [
    { name: 'Stage 1: Use simple drawings and models to show ideas', code: '1TWSm', suggestedLessons: 1 },
    { name: 'Stage 2: Use diagrams and labelled drawings to represent observations', code: '2TWSm', suggestedLessons: 1 },
    { name: 'Stage 3: Describe how models help us understand simple phenomena', code: '3TWSm', suggestedLessons: 2 },
    { name: 'Stage 4: Identify the limitations of simple models', code: '4TWSm', suggestedLessons: 2 },
    { name: 'Stage 5: Use models to explain scientific ideas; compare alternative models', code: '5TWSm', suggestedLessons: 2 },
    { name: 'Stage 6: Describe how a model helps us understand a phenomenon; recognise model limitations', code: '6TWSm', suggestedLessons: 2 },
  ]},
  { topic: 'TWS: Purpose and planning of scientific enquiry (TWSp)', code: 'TWSp', subtopics: [
    { name: 'Stage 1: Ask simple "what" and "how" questions; make simple predictions', code: '1TWSp', suggestedLessons: 2 },
    { name: 'Stage 2: Make predictions about what they think will happen', code: '2TWSp', suggestedLessons: 2 },
    { name: 'Stage 3: Plan a simple enquiry; identify what to change and what to measure', code: '3TWSp', suggestedLessons: 2 },
    { name: 'Stage 4: Describe possible outcomes; identify variables informally', code: '4TWSp', suggestedLessons: 3 },
    { name: 'Stage 5: Plan a fair test; predict using scientific knowledge', code: '5TWSp', suggestedLessons: 3 },
    { name: 'Stage 6: Plan investigations with control of variables; refer to relevant knowledge in predictions', code: '6TWSp', suggestedLessons: 3 },
  ]},
  { topic: 'TWS: Carrying out scientific enquiry (TWSc)', code: 'TWSc', subtopics: [
    { name: 'Stage 1: Observe and describe; sort and group objects', code: '1TWSc', suggestedLessons: 2 },
    { name: 'Stage 2: Make and record observations; sort by simple criteria', code: '2TWSc', suggestedLessons: 2 },
    { name: 'Stage 3: Take measurements using simple equipment; record in tables', code: '3TWSc', suggestedLessons: 3 },
    { name: 'Stage 4: Record results in tables and simple charts; classify using keys', code: '4TWSc', suggestedLessons: 3 },
    { name: 'Stage 5: Take repeat measurements; record accurately; identify anomalies', code: '5TWSc', suggestedLessons: 3 },
    { name: 'Stage 6: Sort, group and classify using testing, observation and secondary information', code: '6TWSc', suggestedLessons: 4 },
  ]},
  { topic: 'TWS: Analysis, evaluation and conclusions (TWSa)', code: 'TWSa', subtopics: [
    { name: 'Stage 1: Describe what was found; say what surprised them', code: '1TWSa', suggestedLessons: 1 },
    { name: 'Stage 2: Compare what they found with their predictions', code: '2TWSa', suggestedLessons: 2 },
    { name: 'Stage 3: Look for patterns in simple results; describe what they show', code: '3TWSa', suggestedLessons: 2 },
    { name: 'Stage 4: Identify trends; suggest reasons for results', code: '4TWSa', suggestedLessons: 3 },
    { name: 'Stage 5: Draw conclusions supported by evidence; suggest improvements', code: '5TWSa', suggestedLessons: 3 },
    { name: 'Stage 6: Evaluate enquiries; identify limitations; suggest further investigation', code: '6TWSa', suggestedLessons: 3 },
  ]},
  // ─── CONTENT — BIOLOGY ──────────────────────────────────
  { topic: 'Biology: Structure and function (Bs)', code: 'Bs', subtopics: [
    { name: 'Stage 1: Identify the senses and body parts that detect them; main external body parts', code: '1Bs', suggestedLessons: 3 },
    { name: 'Stage 2: Parts of plants; basic functions (roots, stems, leaves)', code: '2Bs', suggestedLessons: 3 },
    { name: 'Stage 3: Skeletons and muscles; how they work together', code: '3Bs', suggestedLessons: 3 },
    { name: 'Stage 4: Teeth and digestion; basic structure of the digestive system', code: '4Bs', suggestedLessons: 4 },
    { name: 'Stage 5: Circulatory system: heart, blood vessels, blood; lungs and breathing', code: '5Bs', suggestedLessons: 4 },
    { name: 'Stage 6: Reproduction in plants and animals; flower parts; pollination', code: '6Bs', suggestedLessons: 4 },
  ]},
  { topic: 'Biology: Life processes (Bp)', code: 'Bp', subtopics: [
    { name: 'Stage 1: Living vs non-living; needs of living things (water, food, air)', code: '1Bp', suggestedLessons: 2 },
    { name: 'Stage 2: Life cycles of familiar animals and plants', code: '2Bp', suggestedLessons: 3 },
    { name: 'Stage 3: What plants need to grow; basic photosynthesis idea', code: '3Bp', suggestedLessons: 3 },
    { name: 'Stage 4: Healthy diet; food groups; effects of exercise', code: '4Bp', suggestedLessons: 3 },
    { name: 'Stage 5: Reproduction and growth in humans; life cycles compared', code: '5Bp', suggestedLessons: 4 },
    { name: 'Stage 6: Effect of diet, exercise, drugs and lifestyle on the body', code: '6Bp', suggestedLessons: 4 },
  ]},
  { topic: 'Biology: Ecosystems (Be) — Stages 2-6', code: 'Be', subtopics: [
    { name: 'Stage 2: Different habitats; what lives where', code: '2Be', suggestedLessons: 2 },
    { name: 'Stage 3: Simple food chains; producers and consumers', code: '3Be', suggestedLessons: 3 },
    { name: 'Stage 4: Food webs; predators and prey; habitat adaptations', code: '4Be', suggestedLessons: 3 },
    { name: 'Stage 5: Classification of living things; environmental change effects', code: '5Be', suggestedLessons: 3 },
    { name: 'Stage 6: Interdependence; effect of human activity on ecosystems; conservation', code: '6Be', suggestedLessons: 4 },
  ]},
  // ─── CONTENT — CHEMISTRY ────────────────────────────────
  { topic: 'Chemistry: Materials and their structure (Cm)', code: 'Cm', subtopics: [
    { name: 'Stage 1: Identify common materials; group simple objects by material', code: '1Cm', suggestedLessons: 2 },
    { name: 'Stage 2: Materials in everyday use; natural vs human-made', code: '2Cm', suggestedLessons: 2 },
    { name: 'Stage 3: Solids, liquids and gases — basic identification', code: '3Cm', suggestedLessons: 3 },
    { name: 'Stage 4: Differences between solids, liquids and gases (particle idea informal)', code: '4Cm', suggestedLessons: 3 },
    { name: 'Stage 5: Pure substances vs mixtures; element/compound idea (intro)', code: '5Cm', suggestedLessons: 3 },
    { name: 'Stage 6: Particle model of matter applied to states', code: '6Cm', suggestedLessons: 3 },
  ]},
  { topic: 'Chemistry: Properties of materials (Cp)', code: 'Cp', subtopics: [
    { name: 'Stage 1: Describe materials: hard/soft, rough/smooth, waterproof', code: '1Cp', suggestedLessons: 2 },
    { name: 'Stage 2: Magnetic and non-magnetic; transparent / opaque', code: '2Cp', suggestedLessons: 2 },
    { name: 'Stage 3: Properties and uses: hardness, flexibility, absorbency', code: '3Cp', suggestedLessons: 3 },
    { name: 'Stage 4: Conductors and insulators (heat and electricity, basic)', code: '4Cp', suggestedLessons: 3 },
    { name: 'Stage 5: Solubility and floating/sinking; density (informal)', code: '5Cp', suggestedLessons: 3 },
    { name: 'Stage 6: Properties used to choose materials for specific purposes', code: '6Cp', suggestedLessons: 3 },
  ]},
  { topic: 'Chemistry: Changes to materials (Cc)', code: 'Cc', subtopics: [
    { name: 'Stage 1: Simple changes by squashing, bending, stretching, twisting', code: '1Cc', suggestedLessons: 2 },
    { name: 'Stage 2: Reversible changes: melting and freezing, simple cases', code: '2Cc', suggestedLessons: 2 },
    { name: 'Stage 3: Changes of state: melting, freezing, evaporation, condensation', code: '3Cc', suggestedLessons: 3 },
    { name: 'Stage 4: Heating and cooling effects on materials', code: '4Cc', suggestedLessons: 3 },
    { name: 'Stage 5: Mixtures: dissolving; separating mixtures (filtering, evaporation)', code: '5Cc', suggestedLessons: 4 },
    { name: 'Stage 6: Reversible vs irreversible changes; burning, rusting', code: '6Cc', suggestedLessons: 3 },
  ]},
  // ─── CONTENT — PHYSICS ──────────────────────────────────
  { topic: 'Physics: Forces and energy (Pf)', code: 'Pf', subtopics: [
    { name: 'Stage 1: Pushes and pulls; how forces make things move, slow down or change direction', code: '1Pf', suggestedLessons: 2 },
    { name: 'Stage 2: Floating and sinking; effects of gravity (objects fall down)', code: '2Pf', suggestedLessons: 2 },
    { name: 'Stage 3: Friction in everyday contexts; surfaces and movement', code: '3Pf', suggestedLessons: 3 },
    { name: 'Stage 4: Forces in opposition; simple energy stores and transfers (informal)', code: '4Pf', suggestedLessons: 3 },
    { name: 'Stage 5: Energy in food and fuel; gravity, weight (informal); levers (intro)', code: '5Pf', suggestedLessons: 3 },
    { name: 'Stage 6: Mass vs weight; effect of gravity on weight; renewable and non-renewable energy', code: '6Pf', suggestedLessons: 4 },
  ]},
  { topic: 'Physics: Light and sound (Pl)', code: 'Pl', subtopics: [
    { name: 'Stage 1: Sources of light; dark as absence of light; sources of sound', code: '1Pl', suggestedLessons: 2 },
    { name: 'Stage 2: Day and night; light from the Sun; loud and soft sounds', code: '2Pl', suggestedLessons: 2 },
    { name: 'Stage 3: Shadows: formation and size; reflection of light (basic)', code: '3Pl', suggestedLessons: 3 },
    { name: 'Stage 4: How we see (light enters the eye); pitch of sounds', code: '4Pl', suggestedLessons: 3 },
    { name: 'Stage 5: Light travels in straight lines; refraction (intro); how the ear works', code: '5Pl', suggestedLessons: 4 },
    { name: 'Stage 6: Reflection in mirrors; spectrum and colour; sound travel through materials', code: '6Pl', suggestedLessons: 4 },
  ]},
  { topic: 'Physics: Electricity and magnetism (Pe)', code: 'Pe', subtopics: [
    { name: 'Stage 1: Safety with electricity; everyday electrical appliances', code: '1Pe', suggestedLessons: 1 },
    { name: 'Stage 2: Magnets attract and repel; magnetic materials', code: '2Pe', suggestedLessons: 2 },
    { name: 'Stage 3: Simple electric circuits; switches; what makes a circuit work', code: '3Pe', suggestedLessons: 3 },
    { name: 'Stage 4: Conductors and insulators in circuits; series circuits', code: '4Pe', suggestedLessons: 3 },
    { name: 'Stage 5: Parallel circuits (intro); circuit diagrams using symbols', code: '5Pe', suggestedLessons: 4 },
    { name: 'Stage 6: Effect of changing components on current; uses of electromagnets', code: '6Pe', suggestedLessons: 3 },
  ]},
  // ─── CONTENT — EARTH & SPACE ────────────────────────────
  { topic: 'Earth and Space: Planet Earth (Ep)', code: 'Ep', subtopics: [
    { name: 'Stage 1: Weather and seasons; describing the weather', code: '1Ep', suggestedLessons: 2 },
    { name: 'Stage 2: Rocks and soils — observe and describe', code: '2Ep', suggestedLessons: 2 },
    { name: 'Stage 3: Properties of rocks; uses of rocks', code: '3Ep', suggestedLessons: 3 },
    { name: 'Stage 4: Soil formation and uses; the water cycle (intro)', code: '4Ep', suggestedLessons: 3 },
    { name: 'Stage 5: Volcanoes, earthquakes and tectonic processes (introductory)', code: '5Ep', suggestedLessons: 3 },
    { name: 'Stage 6: Climate vs weather; climate change basics', code: '6Ep', suggestedLessons: 3 },
  ]},
  { topic: 'Earth and Space: Cycles on Earth (Ec) — Stages 5-6', code: 'Ec', subtopics: [
    { name: 'Stage 5: The water cycle; states of water in the cycle', code: '5Ec', suggestedLessons: 3 },
    { name: 'Stage 6: Rock cycle (introductory); links between cycles on Earth', code: '6Ec', suggestedLessons: 3 },
  ]},
  { topic: 'Earth and Space: Earth in space (Es)', code: 'Es', subtopics: [
    { name: 'Stage 1: The Sun, Moon and stars — describing what we see', code: '1Es', suggestedLessons: 1 },
    { name: 'Stage 2: Day and night; the Sun in the sky', code: '2Es', suggestedLessons: 2 },
    { name: 'Stage 3: Phases of the Moon (observational)', code: '3Es', suggestedLessons: 2 },
    { name: 'Stage 4: Earth\u2019s rotation causes day and night', code: '4Es', suggestedLessons: 2 },
    { name: 'Stage 5: The Solar System: planets in order from the Sun', code: '5Es', suggestedLessons: 3 },
    { name: 'Stage 6: Orbits and moons; movement of planets and moons (informal)', code: '6Es', suggestedLessons: 3 },
  ]},
  // ─── CONTEXT — SCIENCE IN CONTEXT ───────────────────────
  { topic: 'Science in Context (SiC)', code: 'SiC', subtopics: [
    { name: 'Stage 1: Science in everyday life: home, school, surroundings', code: '1SiC', suggestedLessons: 1 },
    { name: 'Stage 2: People who use science in their work', code: '2SiC', suggestedLessons: 1 },
    { name: 'Stage 3: Science in local contexts: weather, food, water', code: '3SiC', suggestedLessons: 1 },
    { name: 'Stage 4: Scientists and their discoveries (simple stories)', code: '4SiC', suggestedLessons: 2 },
    { name: 'Stage 5: Applications of science: medicine, technology, environment', code: '5SiC', suggestedLessons: 2 },
    { name: 'Stage 6: Science, ethics and global issues (intro): climate, conservation', code: '6SiC', suggestedLessons: 2 },
  ]},
]
// ── PRIMARY COMPUTING 0059 ─────────────────────────────────
// 5 strands (no internal sub-strands), 30 stage-level
// subtopics, 116 lessons. Codes: CT, PG, MD, NW, CS.
const PRIMARY_COMPUTING_0059 = [
  { topic: 'Computational Thinking (CT)', code: 'CT', subtopics: [
    { name: 'Stage 1: Following and creating simple sequences of instructions (e.g. how to brush teeth)', code: '1CT', suggestedLessons: 4 },
    { name: 'Stage 2: Sequence of instructions matters; predicting outcomes of simple instruction sets', code: '2CT', suggestedLessons: 4 },
    { name: 'Stage 3: Decomposing tasks into smaller parts; spotting repeated steps', code: '3CT', suggestedLessons: 5 },
    { name: 'Stage 4: Identifying patterns; introduction to algorithms as a formal idea', code: '4CT', suggestedLessons: 5 },
    { name: 'Stage 5: Algorithmic thinking with branching choices (IF\u2026); flowchart basics', code: '5CT', suggestedLessons: 5 },
    { name: 'Stage 6: More complex algorithms; combining sequence, selection and repetition logically', code: '6CT', suggestedLessons: 5 },
  ]},
  { topic: 'Programming (PG)', code: 'PG', subtopics: [
    { name: 'Stage 1: Move a character on screen with simple commands; floor robot / Bee-Bot programs', code: '1PG', suggestedLessons: 4 },
    { name: 'Stage 2: Sequence multiple commands; predict the output of a short program', code: '2PG', suggestedLessons: 4 },
    { name: 'Stage 3: Use of events (e.g. "when key pressed"); simple animations in a block language', code: '3PG', suggestedLessons: 5 },
    { name: 'Stage 4: Repetition / iteration introduced (loops); fixing a program that doesn\u2019t work (debugging)', code: '4PG', suggestedLessons: 6 },
    { name: 'Stage 5: Selection (IF statements); variables in programs (basic)', code: '5PG', suggestedLessons: 6 },
    { name: 'Stage 6: Combining loops, selection and variables; planning and testing a small project', code: '6PG', suggestedLessons: 6 },
  ]},
  { topic: 'Managing Data (MD)', code: 'MD', subtopics: [
    { name: 'Stage 1: Sorting objects and information into groups', code: '1MD', suggestedLessons: 2 },
    { name: 'Stage 2: Collecting simple data (e.g. tallying favourites); pictograms', code: '2MD', suggestedLessons: 3 },
    { name: 'Stage 3: Recording data in tables; simple bar charts on a computer', code: '3MD', suggestedLessons: 3 },
    { name: 'Stage 4: Sorting and filtering data; searching for information', code: '4MD', suggestedLessons: 4 },
    { name: 'Stage 5: Spreadsheet basics: rows, columns, simple formulas (SUM, AVG)', code: '5MD', suggestedLessons: 4 },
    { name: 'Stage 6: Interpreting datasets; introduction to databases (records and fields)', code: '6MD', suggestedLessons: 4 },
  ]},
  { topic: 'Networks and Digital Communication (NW)', code: 'NW', subtopics: [
    { name: 'Stage 1: What devices we use; rules for using devices safely; trusted adults', code: '1NW', suggestedLessons: 2 },
    { name: 'Stage 2: Sending and receiving messages (email idea); keeping personal info safe', code: '2NW', suggestedLessons: 2 },
    { name: 'Stage 3: What the internet is (informally); searching for information; reliable vs unreliable', code: '3NW', suggestedLessons: 3 },
    { name: 'Stage 4: Networks: how devices connect (basic); responsible communication online', code: '4NW', suggestedLessons: 3 },
    { name: 'Stage 5: How information moves across networks (high level); digital footprint', code: '5NW', suggestedLessons: 4 },
    { name: 'Stage 6: Cyberbullying and how to respond; security: passwords, suspicious messages', code: '6NW', suggestedLessons: 4 },
  ]},
  { topic: 'Computer Systems (CS)', code: 'CS', subtopics: [
    { name: 'Stage 1: Identifying everyday computing devices; parts you can see (screen, keyboard)', code: '1CS', suggestedLessons: 2 },
    { name: 'Stage 2: Inputs and outputs (mouse, keyboard, speakers, screen)', code: '2CS', suggestedLessons: 3 },
    { name: 'Stage 3: Hardware vs software (basic difference); operating system idea (informal)', code: '3CS', suggestedLessons: 3 },
    { name: 'Stage 4: Storage devices; what RAM does (very basic intro)', code: '4CS', suggestedLessons: 3 },
    { name: 'Stage 5: Robotics: sensors and outputs; simple robotic behaviour', code: '5CS', suggestedLessons: 4 },
    { name: 'Stage 6: Benefits of robotics in industry; introduction to AI ideas', code: '6CS', suggestedLessons: 4 },
  ]},
]
// ── PRIMARY GLOBAL PERSPECTIVES 0838 ───────────────────────
// 6 skill strands, 24 stage-band subtopics (4 per skill —
// Stage 1, Stage 2, Stage 3-4 shared, Stage 5-6 shared),
// 92 lessons. Codes: Re (Research), An (Analysis), Ev (Evaluation),
// Rf (Reflection), Co (Collaboration), Cm (Communication).
const PRIMARY_GLOBAL_0838 = [
  { topic: 'Research', code: 'Re', subtopics: [
    { name: 'Stage 1: Asking simple questions about familiar topics; using pictures and simple texts as sources', code: '1Re', suggestedLessons: 3 },
    { name: 'Stage 2: Asking "who/what/where" questions; identifying simple sources in books and online', code: '2Re', suggestedLessons: 3 },
    { name: 'Stage 3-4: Planning a small research task; identifying suitable sources; gathering information through observation, interviews or simple questionnaires', code: '34Re', suggestedLessons: 6 },
    { name: 'Stage 5-6: Conducting structured investigations; using multiple sources; distinguishing between fact and opinion; identifying reliable information', code: '56Re', suggestedLessons: 6 },
  ]},
  { topic: 'Analysis', code: 'An', subtopics: [
    { name: 'Stage 1: Talking about what they notice in a picture or story; simple sorting', code: '1An', suggestedLessons: 2 },
    { name: 'Stage 2: Comparing two things; identifying simple similarities and differences', code: '2An', suggestedLessons: 3 },
    { name: 'Stage 3-4: Identifying patterns in information; recognising different perspectives on an issue; spotting bias informally', code: '34An', suggestedLessons: 5 },
    { name: 'Stage 5-6: Analysing perspectives in depth: personal, local/national, global; identifying causes and effects of issues', code: '56An', suggestedLessons: 6 },
  ]},
  { topic: 'Evaluation', code: 'Ev', subtopics: [
    { name: 'Stage 1: Saying what they like / don\u2019t like and why; simple "good idea / bad idea" judgements', code: '1Ev', suggestedLessons: 2 },
    { name: 'Stage 2: Giving simple reasons for opinions; saying whether a story / source is interesting and why', code: '2Ev', suggestedLessons: 3 },
    { name: 'Stage 3-4: Comparing sources; saying which is more helpful/reliable and why; evaluating own and others\u2019 suggestions', code: '34Ev', suggestedLessons: 5 },
    { name: 'Stage 5-6: Evaluating evidence for an argument; judging strengths/weaknesses of different solutions to an issue', code: '56Ev', suggestedLessons: 5 },
  ]},
  { topic: 'Reflection', code: 'Rf', subtopics: [
    { name: 'Stage 1: Talking about what they\u2019ve done and enjoyed', code: '1Rf', suggestedLessons: 1 },
    { name: 'Stage 2: Saying what they\u2019ve learned; what they found easy / hard', code: '2Rf', suggestedLessons: 2 },
    { name: 'Stage 3-4: Reflecting on what they\u2019ve learned about a topic AND about themselves; identifying changes in their own thinking', code: '34Rf', suggestedLessons: 4 },
    { name: 'Stage 5-6: Reflecting on impact of their actions; how perspectives changed; what they would do differently next time', code: '56Rf', suggestedLessons: 4 },
  ]},
  { topic: 'Collaboration', code: 'Co', subtopics: [
    { name: 'Stage 1: Taking turns; working in pairs on simple tasks', code: '1Co', suggestedLessons: 2 },
    { name: 'Stage 2: Working in small groups; sharing resources fairly', code: '2Co', suggestedLessons: 3 },
    { name: 'Stage 3-4: Taking on simple roles in a team; helping each other complete a shared task', code: '34Co', suggestedLessons: 5 },
    { name: 'Stage 5-6: Planning team work; dividing tasks fairly considering team members\u2019 skills; resolving disagreements constructively', code: '56Co', suggestedLessons: 6 },
  ]},
  { topic: 'Communication', code: 'Cm', subtopics: [
    { name: 'Stage 1: Speaking simply about own ideas and findings; drawing pictures to explain', code: '1Cm', suggestedLessons: 2 },
    { name: 'Stage 2: Presenting findings to a small group; using pictures and labels', code: '2Cm', suggestedLessons: 3 },
    { name: 'Stage 3-4: Giving short presentations; choosing appropriate ways to communicate (poster, talk, drawing) for different audiences', code: '34Cm', suggestedLessons: 5 },
    { name: 'Stage 5-6: Adapting communication for purpose and audience; structuring an argument with evidence; team presentation skills', code: '56Cm', suggestedLessons: 6 },
  ]},
]
// ── PRIMARY SPINE LIBRARY — used by the loader ──────────────
// Maps a subject-name regex to its verified spine constant.
// The loader auto-detects which spine fits the selected subject.
const PRIMARY_LIBRARY = [
  { match: /\bmath/i,        const_: PRIMARY_MATHS_0096,    source: 'Cambridge Primary Mathematics 0096' },
  { match: /\benglish\b/i,   const_: PRIMARY_ENGLISH_0058,  source: 'Cambridge Primary English 0058' },
  { match: /\bscience\b/i,   const_: PRIMARY_SCIENCE_0097,  source: 'Cambridge Primary Science 0097' },
  { match: /comput/i,        const_: PRIMARY_COMPUTING_0059, source: 'Cambridge Primary Computing 0059' },
  { match: /global/i,        const_: PRIMARY_GLOBAL_0838,   source: 'Cambridge Primary Global Perspectives 0838' },
]

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
    { id: 'IB',                 name: 'International Baccalaureate (IB)' },
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
        sourceSyllabus: 'Cambridge IGCSE Mathematics 0580 (2025–2027)',
      })
      if (data?.success) { toast?.ok?.(data.message || 'Loaded.'); loadSpine(subjectId) }
      else toast?.error?.(data?.message || 'Failed.')
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Failed to load structure.') }
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
    } catch (e) { toast?.error?.(e?.response?.data?.message || 'Failed to load structure.') }
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
            }}>Load IGCSE Maths 0580</button>
            {curriculum === 'CambridgePrimary' && (
              <button onClick={loadPrimarySpine} disabled={busy} title="Auto-detects which Primary spine matches the selected subject" style={{
                background: '#fff', color: '#9A7B16', border: '1.5px dashed ' + TOKENS.gold,
                borderRadius: 7, padding: '8px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}>Load Cambridge Primary spine</button>
            )}
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
        {tabBtn('spine', 'Syllabus Spine')}
      </div>

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

// ═══════════════════════════════════════════════════════════
// 12. BILLING MODULE
// ═══════════════════════════════════════════════════════════
function BillingModule({ refreshKey, toast }) {
  const store = useStore()
  const [students, setStudents] = useState([])
  useEffect(() => { api.get('/users/students/list').then(r => setStudents(r.data.students || [])).catch(() => {}) }, [refreshKey])
  const monthlyRevenue = students.length * 18000

  return (
    <>
      <PSection tag="Finance" title="Billing &" em="Payments" sub="Revenue, fee structure and collection rates"/>
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Monthly Revenue" value={fmtKsh(monthlyRevenue)}/>
        <PKpi label="Paying Students" value={students.length}/>
        <PKpi label="Annualised" value={fmtKsh(monthlyRevenue * 12)}/>
        <PKpi label="Collection Rate" value="94%"/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <PCard accent={TOKENS.crimson}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: TOKENS.s900, marginBottom: 14, fontWeight: 600 }}>Standard Fees</h3>
          {[['Individual Basic', store.fees?.individual_basic || 1499], ['Individual Premium', store.fees?.individual_premium || 2999], ['Family Plan', store.fees?.family_plan || 4999], ['IGCSE Pack', store.fees?.igcse_pack || 18000]].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid ' + TOKENS.s100 }}>
              <span style={{ fontSize: 13, color: TOKENS.s700 }}>{label}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: TOKENS.crimson }}>{fmtKsh(val)}</span>
            </div>
          ))}
        </PCard>
        <PCard accent={TOKENS.accentEmerald}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: TOKENS.s900, marginBottom: 14, fontWeight: 600 }}>Payment Methods</h3>
          {[['M-Pesa', 67], ['Bank Transfer', 21], ['Card', 9], ['Other', 3]].map(([label, pct]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid ' + TOKENS.s100 }}>
              <span style={{ fontSize: 13, color: TOKENS.s700, flex: 1 }}>{label}</span>
              <div style={{ flex: 2, height: 6, background: TOKENS.s100, borderRadius: 99 }}>
                <div style={{ width: pct + '%', height: '100%', background: TOKENS.accentEmerald, borderRadius: 99 }}/>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: TOKENS.s900, width: 50, textAlign: 'right' }}>{pct}%</span>
            </div>
          ))}
        </PCard>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// 13. WEBSITE MODULE
// ═══════════════════════════════════════════════════════════
function WebsiteModule({ refreshKey, toast }) {
  const store = useStore()
  const [site, setSite] = useState({ ...store.siteConfig })
  const [tab, setTab] = useState('content')
  const [saving, setSaving] = useState(false)
  const upd = (k, v) => setSite(p => ({ ...p, [k]: v }))
  const save = () => { setSaving(true); setTimeout(() => { store.updateSiteConfig(site); setSaving(false); toast.ok('Saved') }, 500) }

  return (
    <>
      <PSection tag="CMS" title="Website" em="Editor" sub="Edit landing page content · click Open Live Site to verify"
        action={<><button className="btn btn-s btn-sm" onClick={() => window.open('https://smartioushomeschool.com', '_blank', 'noopener')}>Open Live Site</button>{' '}<button className="btn btn-p btn-sm" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}
      />
      <PCard>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: TOKENS.s50, borderRadius: 8, marginBottom: 18, maxWidth: 400 }}>
          {[['content', 'Content'], ['stats', 'Stats'], ['contact', 'Contact']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: '8px 12px', borderRadius: 6,
              background: tab === id ? TOKENS.white : 'transparent',
              border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
              color: tab === id ? TOKENS.crimson : TOKENS.s500,
              boxShadow: tab === id ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
            }}>{label}</button>
          ))}
        </div>
        {tab === 'content' && (
          <>
            <div className="fg"><label className="fl">School Name</label><input className="fi" value={site.schoolName || ''} onChange={e => upd('schoolName', e.target.value)}/></div>
            <div className="fg"><label className="fl">Headline</label><input className="fi" value={site.headline || ''} onChange={e => upd('headline', e.target.value)}/></div>
            <div className="fg"><label className="fl">Subheadline</label><textarea className="fi" rows={3} value={site.subheadline || ''} onChange={e => upd('subheadline', e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }}/></div>
            <div className="fg"><label className="fl">About Text</label><textarea className="fi" rows={5} value={site.aboutText || ''} onChange={e => upd('aboutText', e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }}/></div>
          </>
        )}
        {tab === 'stats' && [1, 2, 3, 4].map(n => (
          <div key={n} className="fg"><label className="fl">Stat {n}</label><input className="fi" value={site['stat' + n] || ''} onChange={e => upd('stat' + n, e.target.value)}/></div>
        ))}
        {tab === 'contact' && (
          <>
            <div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={site.footerEmail || ''} onChange={e => upd('footerEmail', e.target.value)}/></div>
            <div className="fg"><label className="fl">Phone</label><input className="fi" type="tel" value={site.footerPhone || ''} onChange={e => upd('footerPhone', e.target.value)}/></div>
            <div className="fg"><label className="fl">WhatsApp</label><input className="fi" type="tel" value={site.whatsapp || ''} onChange={e => upd('whatsapp', e.target.value)}/></div>
            <div className="fg"><label className="fl">Address</label><textarea className="fi" rows={2} value={site.footerAddress || ''} onChange={e => upd('footerAddress', e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }}/></div>
          </>
        )}
      </PCard>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// 14. SETTINGS MODULE
// ═══════════════════════════════════════════════════════════
function SettingsModule({ refreshKey, toast }) {
  const [signupsOpen, setSignupsOpen] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)
  const [emailNotifs, setEmailNotifs] = useState(true)

  const Toggle = ({ val, set }) => (
    <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }}>
      <input type="checkbox" checked={val} onChange={() => set(!val)} style={{ opacity: 0, width: 0, height: 0 }}/>
      <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: val ? TOKENS.crimson : TOKENS.s300, borderRadius: 99, transition: 'background .2s' }}/>
      <span style={{ position: 'absolute', top: 3, left: val ? 23 : 3, width: 18, height: 18, background: TOKENS.white, borderRadius: '50%', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.15)' }}/>
    </label>
  )

  return (
    <>
      <PSection tag="System" title="System" em="Settings" sub="Security, notifications and school configuration"/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <PCard accent={TOKENS.s500}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: TOKENS.s900, marginBottom: 14, fontWeight: 600 }}>Security & Access</h3>
          {[
            { label: '2-Factor Authentication', desc: 'Require OTP for admin login', val: twoFactor, set: setTwoFactor },
            { label: 'Public Sign-ups', desc: 'Allow students to register without invitation', val: signupsOpen, set: setSignupsOpen },
            { label: 'Maintenance Mode', desc: 'Lock platform · admin-only access', val: maintenanceMode, set: setMaintenanceMode },
          ].map((row, i, arr) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid ' + TOKENS.s100 : 'none' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: TOKENS.s900 }}>{row.label}</div>
                <div style={{ fontSize: 12, color: TOKENS.s500 }}>{row.desc}</div>
              </div>
              <Toggle val={row.val} set={row.set}/>
            </div>
          ))}
        </PCard>
        <PCard accent={TOKENS.accentNavy}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: TOKENS.s900, marginBottom: 14, fontWeight: 600 }}>Notifications</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: TOKENS.s900 }}>Email Notifications</div>
              <div style={{ fontSize: 12, color: TOKENS.s500 }}>Send alerts via email</div>
            </div>
            <Toggle val={emailNotifs} set={setEmailNotifs}/>
          </div>
        </PCard>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// 15. MSHAURI AI MODULE
// ═══════════════════════════════════════════════════════════
function MshauriModule({ refreshKey, toast }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm Mshauri, your Smartious teaching assistant. Ask me to generate questions, explain concepts, draft messages, or help plan lessons. What would you like to do?" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    try {
      const pending = localStorage.getItem('sm_mshauri_pending_prompt')
      if (pending && pending.trim()) { setInput(pending); localStorage.removeItem('sm_mshauri_pending_prompt') }
    } catch {}
  }, [])

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setInput('')
    setLoading(true)
    const endpoints = ['/mshauri', '/auth/mshauri', '/ai/mshauri', '/admin/mshauri']
    let success = false
    let lastError = null
    for (const ep of endpoints) {
      try {
        const res = await api.post(ep, { message: userMsg, prompt: userMsg })
        const reply = res.data.reply || res.data.message || res.data.response || res.data.text || 'No response'
        setMessages(m => [...m, { role: 'assistant', text: reply }])
        success = true
        break
      } catch (e) { lastError = e; if (e.response?.status !== 404) break }
    }
    if (!success) {
      const status = lastError?.response?.status
      const msg = status === 404 ? 'Mshauri AI is not yet wired to the backend. The frontend is ready, but no /api/mshauri endpoint exists yet.' : 'Could not reach Mshauri AI.'
      setMessages(m => [...m, { role: 'assistant', text: msg }])
    }
    setLoading(false)
  }

  return (
    <>
      <PSection tag="AI Assistant" title="" em="Mshauri AI" sub="Powered by Claude · ask anything about teaching, curriculum, or operations"/>
      <PCard style={{ background: 'linear-gradient(135deg, ' + TOKENS.crimson + ' 0%, ' + TOKENS.crimsonDeep + ' 100%)', color: TOKENS.white, border: 'none', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 540 }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <ModuleIcon kind="ai" size={40} accent={TOKENS.goldLight}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Mshauri AI Console</div>
            <div style={{ fontSize: 11, opacity: .7 }}>Model: claude-sonnet-4 · {messages.filter(m => m.role === 'user').length} messages this session</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: TOKENS.goldLight }}>● ONLINE</span>
        </div>
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: m.role === 'user' ? 'rgba(201,160,48,.25)' : 'rgba(255,255,255,.08)', fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.text}</div>
            </div>
          ))}
          {loading && <div style={{ padding: '10px 14px', color: 'rgba(255,255,255,.6)', fontSize: 12 }}>Mshauri is thinking...</div>}
        </div>
        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,.1)', display: 'flex', gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder="Ask Mshauri anything..." disabled={loading}
            style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, color: TOKENS.white, fontSize: 14, outline: 'none' }}/>
          <button onClick={send} disabled={loading || !input.trim()} style={{ background: TOKENS.gold, color: TOKENS.crimsonDeep, border: 'none', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', opacity: loading || !input.trim() ? .5 : 1 }}>Send</button>
        </div>
      </PCard>
    </>
  )
}
