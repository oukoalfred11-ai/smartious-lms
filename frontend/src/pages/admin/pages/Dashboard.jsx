import React, { useState, useEffect, useRef } from 'react'
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
  payroll:     { label: 'Payroll',      accent: TOKENS.accentEmerald, icon: 'payroll' },
  leave:       { label: 'Leave',        accent: TOKENS.accentSlate, icon: 'leave' },
  programmes:  { label: 'Programmes',   accent: TOKENS.accentPurple, icon: 'programmes' },
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
    { label: 'People', items: ['users', 'teachers', 'allocations'] },
    { label: 'Operations', items: ['payroll', 'leave', 'programmes'] },
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
        payload.curriculum = userForm.curriculum || null
        payload.gradeLevel = userForm.grade || null
        payload.plan = userForm.plan || 'Basic'
        payload.subjects = userForm.subjects || []
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
          <UserFormFields userForm={userForm} setUserForm={setUserForm} />
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
function UserFormFields({ userForm, setUserForm }) {
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

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await api.get('/users')
        setUsers(res.data.users || [])
        setLoading(false)
      } catch (e) {
        setError(e.response?.data?.message || e.message || 'Failed to load')
        setLoading(false)
      }
    }
    fetch()
  }, [refreshKey])

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
            <button className="btn btn-s btn-sm" onClick={() => toast.info('Exporting CSV...')}>Export</button>
            <button className="btn btn-p btn-sm" onClick={() => openAddUser('student')}>+ Add User</button>
          </div>
        }
      />

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
          (r.data?.subjects || []).forEach(s => {
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

// ── STATUS TAB (deactivate / reactivate / delete) ─────────
function TeacherStatusTab({ teacher, onSaved, onClose, toast }) {
  const [reason, setReason] = useState('')
  const [working, setWorking] = useState(false)
  const isActive = teacher.isActive !== false

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

      {/* Delete — deferred to Session C */}
      <div style={{
        padding: 14, borderRadius: 8,
        background: '#FEF2F2', border: '1px dashed #FCA5A5',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#B91C1C', marginBottom: 4 }}>
          Permanently delete
        </div>
        <p style={{ fontSize: 12.5, color: '#6B6B6B', margin: 0, lineHeight: 1.5 }}>
          Deleting a teacher needs their lessons, allocations, and other content
          transferred to another teacher first — otherwise students lose access.
          This safe-transfer workflow is being built separately. For now, use
          <strong> Deactivate</strong> instead of deleting.
        </p>
      </div>
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
                JSON.stringify(subjects.sort()) !== JSON.stringify((student.subjects || []).slice().sort())

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
function CurriculumModule({ refreshKey, toast }) {
  const store = useStore()
  const curricula = store.curricula || []
  return (
    <>
      <PSection tag="Academic" title="Curriculum" em="Manager" sub="Subjects, grades and academic structure"/>
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
        ]).map((c, i) => (
          <PCard key={i} accent={TOKENS.gold}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, color: TOKENS.s900, marginBottom: 8, fontWeight: 600 }}>{c.name}</h3>
            <div style={{ fontSize: 12, color: TOKENS.s500, marginBottom: 12 }}>{(c.subjects || []).length} subjects offered</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {(c.subjects || []).slice(0, 6).map((s, si) => (
                <span key={si} style={{ display: 'inline-block', padding: '3px 9px', background: TOKENS.goldPale, color: '#8E6B1A', border: '1px solid ' + TOKENS.gold, borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </PCard>
        ))}
      </div>
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
