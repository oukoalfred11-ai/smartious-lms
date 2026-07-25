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
  assessment:  { label: 'Assessments', accent: TOKENS.accentAmber, icon: 'frontdesk' },
  crm:         { label: 'CRM',         accent: TOKENS.accentNavy,  icon: 'frontdesk' },
  reports:     { label: 'Reports',     accent: TOKENS.crimson,     icon: 'frontdesk' },
  exams:       { label: 'Exams & Assessments', accent: TOKENS.crimson,     icon: 'frontdesk' },
  students:    { label: 'Students',             accent: TOKENS.accentNavy,  icon: 'users' },
  doshomework:  { label: 'Homework',              accent: TOKENS.accentAmber, icon: 'frontdesk' },
  dosanalytics: { label: 'Performance Analytics', accent: TOKENS.crimson,    icon: 'chart' },
  dosattend:    { label: 'Attendance Analytics',   accent: TOKENS.accentTeal,    icon: 'frontdesk' },
  checkin:      { label: 'Check In',              accent: TOKENS.accentEmerald||'#065F46', icon: 'frontdesk' },
  dosbreaks:    { label: 'Manage Breaks',          accent: TOKENS.crimson,       icon: 'frontdesk' },
  dostimetable: { label: 'Timetables',             accent: TOKENS.accentNavy, icon: 'rooms' },
  salesperf:   { label: 'My Performance', accent: TOKENS.gold,      icon: 'frontdesk' },
  livelessons: { label: 'Live Classes', accent: TOKENS.accentRose,  icon: 'live' },
  grouprooms:  { label: 'Group Rooms',  accent: TOKENS.accentOcean, icon: 'rooms' },
  curriculum:  { label: 'Curriculum',   accent: TOKENS.gold,        icon: 'curriculum' },
  billing:      { label: 'Billing',          accent: TOKENS.accentEmerald, icon: 'billing' },
  questionbank:   { label: 'Question Bank',   accent: TOKENS.accentAmber,   icon: 'quiz' },
  feecollection:  { label: 'Fee Collection',   accent: TOKENS.accentEmerald, icon: 'billing' },
  cooreports:     { label: 'Report Overview',  accent: TOKENS.accentAmber,   icon: 'reports' },
  teacherratings: { label: 'Teacher Ratings',  accent: TOKENS.accentAmber,   icon: 'payroll' },
  website:     { label: 'Website',      accent: TOKENS.accentNavy,  icon: 'website' },
  settings:    { label: 'Settings',     accent: TOKENS.s500,        icon: 'settings' },
  ai:          { label: 'Mshauri AI',   accent: TOKENS.crimson,     icon: 'ai' },
}

// ──────────────────────────────────────────────────────
// CANONICAL CURRICULA — single source of truth
// Used by every place admins pick a curriculum (Manage
// Students, Teacher Specialties, etc). The `id` is what
// gets stored on User documents / Subject docs / spines;
// the `name` is what admins see.
// Mirrors the list in CurriculumModule (line ~8059).
// ──────────────────────────────────────────────────────
const SCHOOL_CURRICULA = [
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
]

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
function PNavigation({ page, setPage, adminFirst, onLogout, forcedRole }) {
  const [railOpen, setRailOpen] = useState(true)
  const auth = useAuth()

  // Group modules into nav sections
  // Role-based module access — each role sees only its permitted modules
  const role = forcedRole || auth?.user?.role || 'admin'

  // Portal identity per role — shown in the top nav bar
  const PORTAL_META = {
    admin:       { label: 'Admin Portal',      color: TOKENS.crimson },
    accountant:  { label: 'Accounts Portal',   color: TOKENS.accentEmerald },
    dos:         { label: 'Dean of Studies',    color: TOKENS.accentNavy },
    sales:       { label: 'Sales Portal',      color: TOKENS.accentNavy },
    ops_manager: { label: 'Operations Portal', color: TOKENS.accentAmber },
  }
  const portalMeta = PORTAL_META[role] || PORTAL_META.admin

  const ROLE_SECTIONS = {
    admin: [
      { label: 'Overview',    items: ['dashboard', 'analytics'] },
      { label: 'People',      items: ['users', 'teachers', 'allocations', 'communication'] },
      { label: 'Reports',     items: ['reports'] },
      { label: 'Operations',  items: ['frontdesk', 'assessment', 'documents', 'payroll', 'leave', 'programmes'] },
      { label: 'Teaching',    items: ['livelessons', 'grouprooms', 'curriculum'] },
      { label: 'System',      items: ['billing', 'website', 'settings', 'ai'] },
    ],
    accountant: [
      { label: 'Overview',    items: ['checkin', 'dashboard', 'analytics'] },
      { label: 'Fee Management', items: ['feecollection', 'billing'] },
      { label: 'Finance',     items: ['payroll'] },
      { label: 'System',      items: ['settings'] },
    ],
    dos: [
      { label: 'Overview',      items: ['checkin', 'dosanalytics'] },
      { label: 'Exams',         items: ['exams'] },
      { label: 'Homework',      items: ['doshomework'] },
      { label: 'Attendance',    items: ['dosattend'] },
      { label: 'Breaks',        items: ['dosbreaks'] },
      { label: 'Timetables',    items: ['dostimetable'] },
      { label: 'Question Bank', items: ['questionbank'] },
      { label: 'Reports',       items: ['reports'] },
      { label: 'System',        items: ['settings'] },
    ],
    sales: [
      { label: 'Overview',    items: ['checkin', 'dashboard', 'salesperf'] },
      { label: 'CRM',         items: ['crm'] },
      { label: 'Admissions',  items: ['assessment', 'frontdesk', 'communication'] },
      { label: 'Content',     items: ['documents'] },
      { label: 'System',      items: ['settings'] },
    ],
    ops_manager: [
      { label: 'Overview',    items: ['checkin', 'dashboard', 'analytics'] },
      { label: 'People',      items: ['users', 'teachers', 'allocations', 'communication'] },
      { label: 'Reports',     items: ['cooreports', 'reports'] },
      { label: 'Performance', items: ['teacherratings'] },
      { label: 'Operations',  items: ['crm', 'frontdesk', 'assessment', 'documents', 'leave', 'programmes'] },
      { label: 'Teaching',    items: ['livelessons', 'grouprooms', 'curriculum'] },
      { label: 'Question Bank', items: ['questionbank'] },
      { label: 'System',      items: ['settings', 'ai'] },
    ],
  }
  const SECTIONS = ROLE_SECTIONS[role] || ROLE_SECTIONS.admin

  // Guard: if the current page is not in this role's allowed modules, fall back to dashboard
  const allowedPages = (ROLE_SECTIONS[role] || ROLE_SECTIONS.admin).flatMap(s => s.items)
  const safePage = allowedPages.includes(page) ? page : 'dashboard'
  const currentMod = MODULES[safePage] || MODULES.dashboard

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
              <div style={{ fontSize: 10, color: TOKENS.s500, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                {{
                  admin:       'Administrator',
                  dos:         'Dean of Studies',
                  accountant:  'Accountant',
                  sales:       'Sales & Front Desk',
                  ops_manager: 'Operations Manager',
                }[role] || 'Administrator'}
              </div>
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
export default function AdminDashboard({ page, setPage, userStats, pendingAllocations, refreshKey, onUserSaved, forcedRole = undefined }) {
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
        payload.curriculum = Array.isArray(userForm.curriculum) ? userForm.curriculum.filter(Boolean) : (userForm.curriculum ? [userForm.curriculum] : [])
        // subjects must be plain strings — backend Teacher record stores them as strings
        const rawSubjects = userForm.subjects || []
        payload.subjects = rawSubjects.filter(s => typeof s === 'string' && s.trim())
        // Don't send teachingSpecialties — not needed, backend handles it
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
      } else if (['admin','accountant','sales','ops_manager','dos'].includes(userForm.role)) {
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

  // Role-based page access — mirrors the logic inside PNavigation
  const role = auth?.user?.role || 'admin'
  const ROLE_SECTIONS_MAIN = {
    admin:       [
      { items: ['dashboard','analytics','users','teachers','allocations','communication','frontdesk','documents','assessment','payroll','leave','programmes','livelessons','grouprooms','curriculum','questionbank','cooreports','teacherratings','feecollection','crm','billing','website','settings','ai'] },
    ],
    accountant:  [{ items: ['checkin','dashboard','analytics','feecollection','billing','payroll','settings'] }],
    sales:       [{ items: ['checkin','dashboard','salesperf','crm','assessment','frontdesk','communication','documents','settings'] }],
    dos:         [{ items: ['checkin','dosanalytics','exams','doshomework','dosattend','dosbreaks','dostimetable','questionbank','reports','settings'] }],
    ops_manager: [{ items: ['checkin','dashboard','analytics','users','teachers','allocations','communication','cooreports','reports','teacherratings','questionbank','crm','frontdesk','assessment','documents','leave','programmes','livelessons','grouprooms','curriculum','settings','ai'] }],
  }
  const allowedPages = (ROLE_SECTIONS_MAIN[role] || ROLE_SECTIONS_MAIN.admin).flatMap(s => s.items)
  const safePage = allowedPages.includes(page) ? page : 'dashboard'

  return (
    <div style={{
      background: TOKENS.s50, minHeight: '100vh',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      color: TOKENS.s900,
    }}>
      <PNavigation page={page} setPage={setPage} adminFirst={adminFirst} forcedRole={forcedRole} onLogout={() => { localStorage.removeItem('sm_token'); localStorage.removeItem('sm_user'); window.location.href = '/login' }}/>

      <div style={{
        marginLeft: 240,
        padding: '40px 48px',
        maxWidth: 1400,
        transition: 'margin-left 0.25s',
      }}>
        {safePage === 'dashboard'   && <DashboardModule  setPage={setPage} userStats={userStats} pendingAllocations={pendingAllocations} refreshKey={refreshKey} auth={auth} toast={toast} openAddUser={openAddUser} adminFirst={adminFirst} />}
        {safePage === 'analytics'   && <AnalyticsModule  setPage={setPage} refreshKey={refreshKey} toast={toast} />}
        {safePage === 'users'       && <UsersModule      refreshKey={refreshKey} toast={toast} setUserForm={setUserForm} setUserModal={setUserModal} openAddUser={openAddUser} />}
        {safePage === 'teachers'    && <TeachersModule   refreshKey={refreshKey} toast={toast} openAddUser={openAddUser} />}
        {safePage === 'allocations' && <StudentsManagementModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'communication' && <CommunicationModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'frontdesk' && <FrontDeskModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'documents' && <DocumentsModule toast={toast} />}
        {safePage === 'assessment' && <AssessmentModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'crm' && <CRMModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'salesperf' && <SalesPerformanceModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'reports'      && <ReportsModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'dosanalytics'  && <DOSAnalyticsModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'exams'         && <DOSExamsModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'doshomework'   && <DOSHomeworkModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'dosattend'     && <DOSAttendanceModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'checkin'       && <CheckInModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'dosbreaks'     && <DOSBreakModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'dostimetable'  && <DOSTimetableModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'payroll'        && <PayrollModule         refreshKey={refreshKey} toast={toast}/>}
        {safePage === 'questionbank'   && <QuestionBankModule   refreshKey={refreshKey} toast={toast}/>}
        {safePage === 'cooreports'    && <COOReportOverviewModule refreshKey={refreshKey} toast={toast}/>}
        {safePage === 'teacherratings'&& <TeacherRatingsModule    refreshKey={refreshKey} toast={toast}/>}
        {safePage === 'leave'       && <LeaveModule      refreshKey={refreshKey} toast={toast} />}
        {safePage === 'programmes'  && <ProgrammesModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'livelessons' && <LiveLessonsModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'grouprooms'  && <GroupRoomsModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'curriculum'  && <CurriculumModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'billing'        && <BillingModule       refreshKey={refreshKey} toast={toast}/>}
        {safePage === 'feecollection' && <FeeCollectionModule refreshKey={refreshKey} toast={toast}/>}
        {safePage === 'website'     && <WebsiteModule    refreshKey={refreshKey} toast={toast} />}
        {safePage === 'settings'    && <SettingsModule   refreshKey={refreshKey} toast={toast} />}
        {safePage === 'ai'          && <MshauriModule    refreshKey={refreshKey} toast={toast} />}
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
          <optgroup label="Staff Portals">
            <option value="admin">Administrator</option>
            <option value="dos">Dean of Studies (DOS)</option>
            <option value="ops_manager">Operations Manager / COO</option>
            <option value="accountant">Accountant</option>
            <option value="sales">Sales / Front Desk</option>
          </optgroup>
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
    admins: users.filter(u => ['admin','accountant','sales','ops_manager','dos'].includes(u.role)).length,
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
  // Canonical curricula (matches Subject catalog ids stored server-side).
  // Old admin-edited teachers may have legacy curriculum strings in
  // teachingSpecialties — handled in render below.
  const CURRICULA = SCHOOL_CURRICULA

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
          {/* If teacher has any legacy curriculum strings in their
              existing specialties that aren't in the canonical list,
              show those as toggle pills too so the admin can see and
              clean them up. */}
          {[...new Set(existingSpecs.map(s => s.curriculum).filter(Boolean))]
            .filter(legacy => !CURRICULA.some(c => c.id === legacy))
            .map(legacy => {
              const on = pickedCurricula.includes(legacy)
              return (
                <button key={'legacy:'+legacy} onClick={() => toggleCurr(legacy)}
                  style={{
                    background: on ? '#9A2434' : '#FEF3C7',
                    color: on ? '#fff' : '#92400E',
                    border: `1.5px solid ${on ? '#9A2434' : '#F59E0B'}`,
                    padding: '7px 14px', borderRadius: 99,
                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  }}
                  title="Legacy curriculum value — re-pick from the canonical list to clean up">
                  {on ? 'on · ' : ''}{legacy} (legacy)
                </button>
              )
            })}
          {CURRICULA.map(c => {
            const on = pickedCurricula.includes(c.id)
            return (
              <button key={c.id} onClick={() => toggleCurr(c.id)}
                style={{
                  background: on ? TOKENS.crimson : '#fff',
                  color: on ? '#fff' : TOKENS.crimson,
                  border: `1.5px solid ${on ? TOKENS.crimson : '#E8E2D6'}`,
                  padding: '7px 14px', borderRadius: 99,
                  cursor: 'pointer', fontSize: 12, fontWeight: 700,
                }}>
                {on ? 'on · ' : ''}{c.name}
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
  const today = new Date().toISOString().split('T')[0]
  const auth  = useAuth()

  const [f, setF] = useState({
    billedToName:'', billedToAddress:'', billedToEmail:'',
    studentName:'', studentGrade:'', subject:'', programmeLabel:'',
    invoiceNo:'', issueDate:today, dueDate:'',
    currency:'USD',
    items:[{ description:'', sessions:'', duration:'1 hr', ratePerHr:'15', amount:'' }],
    discount:'', vatPct:'0',
    paymentNote:'', notes:'',
    sendEmail:true,
  })
  const [saving, setSaving]   = useState(false)
  const [saved,  setSaved]    = useState(null)  // saved invoice doc

  const set = (k,v) => setF(p => ({...p,[k]:v}))
  const itemSet = (i,k,v) => setF(p => ({...p, items:p.items.map((r,idx)=>idx===i?{...r,[k]:v}:r)}))
  const itemAdd = () => setF(p => ({...p, items:[...p.items,{description:'',sessions:'',duration:'1 hr',ratePerHr:'15',amount:''}]}))
  const itemDel = i  => setF(p => { const n=p.items.filter((_,idx)=>idx!==i); return{...p,items:n.length?n:[{description:'',sessions:'',duration:'1 hr',ratePerHr:'15',amount:''}]} })

  const subtotal = f.items.reduce((s,it)=>s+(parseFloat(it.amount)||0),0)
  const discount = parseFloat(f.discount)||0
  const vatPct   = parseFloat(f.vatPct)||0
  const vatAmount = (subtotal-discount)*(vatPct/100)
  const totalDue  = subtotal-discount+vatAmount
  const money = n=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})

  // Auto-calc amount when sessions+rate change
  const calcAmount = (i, sessions, rate) => {
    const s = parseInt(String(sessions||'').match(/\d+/)?.[0]||'0')
    const r = parseFloat(rate)||0
    if (s && r) itemSet(i,'amount',String(s*r))
  }

  const generate = () => {
    if (!f.billedToName.trim()) { toast?.error?.('Billed-to name is required.'); return }
    const html = buildInvoiceHTML(f, { subtotal, discount, vatAmount, vatPct, totalDue })
    const w = window.open('','_blank')
    if (!w) { toast?.error?.('Please allow pop-ups to preview the invoice.'); return }
    w.document.write(html); w.document.close()
  }

  const saveAndSend = async () => {
    if (!f.billedToName.trim()) { toast?.error?.('Billed-to name is required.'); return }
    if (!f.items.some(it=>it.description?.trim())) { toast?.error?.('Add at least one line item.'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/invoices', {
        ...f, lineItems: f.items, discount, vatPct, sendEmail: f.sendEmail,
      })
      if (data.success) {
        setSaved(data.data.invoice)
        toast?.ok?.('Invoice saved' + (f.sendEmail && f.billedToEmail ? ' and emailed to ' + f.billedToEmail : '') + '.')
      } else {
        toast?.error?.(data.message || 'Could not save invoice.')
      }
    } catch(e) {
      toast?.error?.(e?.response?.data?.message || 'Could not save invoice.')
    } finally { setSaving(false) }
  }

  const lbl = { display:'block', fontSize:11, fontWeight:700, letterSpacing:'.04em', textTransform:'uppercase', color:TOKENS.crimson, marginBottom:5 }
  const inp = { width:'100%', boxSizing:'border-box', padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }
  const card = { background:'#fff', border:'1px solid '+TOKENS.line, borderRadius:12, padding:18, marginBottom:14 }

  if (saved) return (
    <div style={card}>
      <div style={{ fontSize:14, fontWeight:800, color:TOKENS.s900, marginBottom:12 }}>✅ Invoice saved</div>
      <div style={{ fontSize:13, color:TOKENS.s700, marginBottom:16, lineHeight:1.7 }}>
        <strong>{saved.invoiceNo}</strong> · {saved.currency} {money(saved.totalDue)} · {saved.billedToName}
        {saved.emailSentTo && <div style={{ fontSize:12, color:TOKENS.s500, marginTop:4 }}>Email sent to {saved.emailSentTo}</div>}
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={generate} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>
          Preview & Download PDF
        </button>
        <button onClick={() => { setSaved(null) }} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s700, padding:'9px 16px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>
          New invoice
        </button>
        <button onClick={onBack} style={{ background:'transparent', border:'none', color:TOKENS.s500, padding:'9px 0', fontSize:12.5, cursor:'pointer' }}>← Back</button>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
        <button onClick={onBack} style={{ background:'transparent', border:'none', cursor:'pointer', color:TOKENS.crimson, fontSize:12.5, fontWeight:700, display:'flex', alignItems:'center', gap:5, padding:0 }}>← All invoices</button>
        <div style={{ flex:1 }}/>
        <button onClick={generate} style={{ background:'transparent', border:'1.5px solid '+TOKENS.crimson, color:TOKENS.crimson, padding:'8px 16px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>Preview PDF</button>
        <button onClick={saveAndSend} disabled={saving} style={{ background:saving?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
          {saving ? 'Saving...' : 'Save & send'}
        </button>
      </div>

      {/* Header */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:14 }}>Invoice details</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
          <div><label style={lbl}>Invoice no.</label><input value={f.invoiceNo} onChange={e=>set('invoiceNo',e.target.value)} placeholder="Auto-generated" style={inp}/></div>
          <div><label style={lbl}>Issue date</label><input type="date" value={f.issueDate} onChange={e=>set('issueDate',e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Due date</label><input type="date" value={f.dueDate} onChange={e=>set('dueDate',e.target.value)} style={inp}/></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div><label style={lbl}>Currency</label>
            <select value={f.currency} onChange={e=>set('currency',e.target.value)} style={inp}>
              {['USD','KES','GBP','EUR','AED'].map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Programme label</label><input value={f.programmeLabel} onChange={e=>set('programmeLabel',e.target.value)} placeholder="e.g. HOME TUITION PROGRAMME · 13 July – 21 August 2026" style={inp}/></div>
        </div>
      </div>

      {/* Bill To + Student */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <div style={card}>
          <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:12 }}>Bill to</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div><label style={lbl}>Full name *</label><input value={f.billedToName} onChange={e=>set('billedToName',e.target.value)} placeholder="e.g. Lola Coker" style={inp}/></div>
            <div><label style={lbl}>Address</label><input value={f.billedToAddress} onChange={e=>set('billedToAddress',e.target.value)} placeholder="e.g. Lavington, Nairobi, Kenya" style={inp}/></div>
            <div><label style={lbl}>Email</label><input type="email" value={f.billedToEmail} onChange={e=>set('billedToEmail',e.target.value)} placeholder="parent@email.com" style={inp}/></div>
          </div>
        </div>
        <div style={card}>
          <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:12 }}>Student</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div><label style={lbl}>Student name</label><input value={f.studentName} onChange={e=>set('studentName',e.target.value)} placeholder="e.g. Fikayomi Adewakun" style={inp}/></div>
            <div><label style={lbl}>Grade</label><input value={f.studentGrade} onChange={e=>set('studentGrade',e.target.value)} placeholder="e.g. Grade 4" style={inp}/></div>
            <div><label style={lbl}>Subject</label><input value={f.subject} onChange={e=>set('subject',e.target.value)} placeholder="e.g. English (Literacy — Writing & Spelling)" style={inp}/></div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:12 }}>Line items</div>
        <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:10 }}>
          <thead>
            <tr style={{ background:TOKENS.cream }}>
              {['Description','Sessions','Duration','Rate / hr',f.currency+' Amount',''].map((h,i)=>(
                <th key={i} style={{ padding:'8px 10px', textAlign:i>=3?'right':'left', fontSize:11, fontWeight:700, color:TOKENS.s700, letterSpacing:'.04em', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {f.items.map((it,i)=>(
              <tr key={i} style={{ borderTop:'1px solid '+TOKENS.line }}>
                <td style={{ padding:'8px 10px', width:'36%' }}>
                  <input value={it.description} onChange={e=>itemSet(i,'description',e.target.value)} placeholder="e.g. Week 1 — 13 to 17 July" style={{...inp,padding:'6px 8px'}}/>
                </td>
                <td style={{ padding:'8px 10px', width:'14%' }}>
                  <input value={it.sessions} onChange={e=>{ itemSet(i,'sessions',e.target.value); calcAmount(i,e.target.value,it.ratePerHr) }} placeholder="3 sessions" style={{...inp,padding:'6px 8px'}}/>
                </td>
                <td style={{ padding:'8px 10px', width:'10%' }}>
                  <input value={it.duration} onChange={e=>itemSet(i,'duration',e.target.value)} placeholder="1 hr" style={{...inp,padding:'6px 8px'}}/>
                </td>
                <td style={{ padding:'8px 10px', width:'12%' }}>
                  <input type="number" value={it.ratePerHr} onChange={e=>{ itemSet(i,'ratePerHr',e.target.value); calcAmount(i,it.sessions,e.target.value) }} placeholder="15" style={{...inp,padding:'6px 8px',textAlign:'right'}}/>
                </td>
                <td style={{ padding:'8px 10px', width:'14%' }}>
                  <input type="number" value={it.amount} onChange={e=>itemSet(i,'amount',e.target.value)} placeholder="45" style={{...inp,padding:'6px 8px',textAlign:'right'}}/>
                </td>
                <td style={{ padding:'8px 6px', textAlign:'center' }}>
                  <button onClick={()=>itemDel(i)} style={{ background:'transparent', border:'none', color:'#B91C1C', cursor:'pointer', fontSize:16, lineHeight:1 }}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={itemAdd} style={{ background:'transparent', border:'1.5px dashed '+TOKENS.gold, color:'#9A7B16', borderRadius:7, padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Add line</button>

        {/* Totals */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
          <div style={{ width:280 }}>
            {[
              ['Subtotal ('+f.items.reduce((s,it)=>{ const n=parseInt(String(it.sessions).match(/\d+/)?.[0]||'0'); return s+n },0)+' hours)', money(subtotal)],
              ['Discount', discount>0?money(discount):'—'],
            ].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:12.5, color:TOKENS.s700 }}>
                <span>{k}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:TOKENS.crimson, borderRadius:8, marginTop:6 }}>
              <span style={{ color:'#fff', fontWeight:800, fontSize:13 }}>TOTAL DUE ({f.currency})</span>
              <span style={{ color:'#fff', fontWeight:800, fontSize:15 }}>{money(totalDue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Email option */}
      <div style={card}>
        <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:13 }}>
          <input type="checkbox" checked={f.sendEmail} onChange={e=>set('sendEmail',e.target.checked)} style={{ width:16, height:16, accentColor:TOKENS.crimson }}/>
          <span>Auto-email invoice to <strong>{f.billedToEmail || 'parent email above'}</strong> when saved</span>
        </label>
      </div>
    </div>
  )
}


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

      {/* Per-lesson coverage */}
      <PCard style={{ marginBottom:16 }}>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', marginBottom:cov?14:0 }}>
          <div style={{ fontSize:11, fontWeight:800, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.08em' }}>Coverage per lesson</div>
          <input className="fi" value={covSubj.subject} onChange={e=>setCovSubj(s=>({...s,subject:e.target.value}))} placeholder="Subject" style={{ width:150 }}/>
          <select className="fsel" value={covSubj.curriculum} onChange={e=>setCovSubj(s=>({...s,curriculum:e.target.value}))} style={{ width:170 }}>
            {CURRICULA.map(x=><option key={x} value={x}>{x}</option>)}
          </select>
          <button onClick={loadCoverage} style={{ background:TOKENS.s100, border:'none', padding:'8px 16px', borderRadius:7, fontWeight:700, fontSize:12.5, cursor:'pointer', color:TOKENS.s700 }}>Check</button>
          {cov && <span style={{ fontSize:12.5, color:TOKENS.s500 }}>
            <strong style={{ color:TOKENS.ink }}>{cov.totals.withQuestions}</strong> of <strong style={{ color:TOKENS.ink }}>{cov.totals.lessons}</strong> lessons have questions · {cov.totals.questions} total
          </span>}
        </div>
        {cov && cov.topics.length>0 && (
          <div style={{ maxHeight:260, overflowY:'auto', border:`1px solid ${TOKENS.s100}`, borderRadius:8 }}>
            {cov.topics.map(t=>(
              <div key={t.topic} style={{ borderBottom:`1px solid ${TOKENS.s100}` }}>
                <div style={{ padding:'8px 14px', background:'#FBFAF5', fontSize:12, fontWeight:800, color:TOKENS.ink }}>
                  {t.code?t.code+' · ':''}{t.topic}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, padding:'8px 14px' }}>
                  {t.subtopics.map(s=>{
                    const good = s.questions>=20, some = s.questions>0
                    return (
                      <span key={s.code||s.name} title={`${s.name} — ${s.questions} question(s)`}
                        style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:99,
                          background: good?'#D1FAE5':some?'#FEF3C7':'#FEE2E2',
                          color: good?'#065F46':some?'#92400E':'#991B1B' }}>
                        {s.code||''} {s.questions}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </PCard>

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
// AssessmentModule — Admin Portal
// Review queue for assessment requests submitted via the
// public AssessmentForm.jsx → POST /api/assessment/request.
//
// List view: filterable/searchable table of requests
// Detail view: full request grouped by section + action panel
//   - Change status (info_requested / accepted / declined)
//   - Internal notes
//   - "Accept" intentionally does NOT trigger Paystack here —
//     that workflow is separate and out of scope.
//
// Drop this function into Dashboard.jsx, add 'assessment' to
// MODULES and PNavigation SECTIONS, and add the page === 'assessment'
// render line. See INTEGRATION_NOTES at the bottom of this file.
// ═══════════════════════════════════════════════════════════

function AssessmentModule({ refreshKey, toast }) {
  const [view, setView] = useState('list')   // list | detail
  const [selectedId, setSelectedId] = useState(null)

  return (
    <>
      <PSection
        tag="Admissions"
        title="Assessment"
        em="Requests"
        sub="Every academic assessment request submitted from the public site, awaiting your review."
      />

      {view === 'list' ? (
        <AssessmentRequestsList
          refreshKey={refreshKey}
          toast={toast}
          onOpen={(id) => { setSelectedId(id); setView('detail') }}
        />
      ) : (
        <AssessmentRequestDetail
          id={selectedId}
          toast={toast}
          onBack={() => { setView('list'); setSelectedId(null) }}
        />
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────
// LIST VIEW
// ─────────────────────────────────────────────────────────
function AssessmentRequestsList({ refreshKey, toast, onOpen }) {
  const [requests, setRequests] = useState([])
  const [counts, setCounts]     = useState({ awaiting_review: 0, info_requested: 0, payment_pending: 0, payment_received: 0, accepted: 0, declined: 0 })
  const [loading, setLoading]   = useState(true)
  const [statusF, setStatusF]   = useState('all')
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(() => {
    setLoading(true)
    const params = { page, limit: 25 }
    if (statusF !== 'all') params.status = statusF
    if (search.trim()) params.search = search.trim()

    api.get('/assessment/requests', { params })
      .then(r => {
        setRequests(r.data?.data?.requests || [])
        setCounts(r.data?.data?.counts || {})
        setTotalPages(r.data?.data?.totalPages || 1)
      })
      .catch(() => toast?.error?.('Failed to load assessment requests.'))
      .finally(() => setLoading(false))
  }, [statusF, search, page, toast])

  useEffect(() => { load() }, [load, refreshKey])
  useEffect(() => { setPage(1) }, [statusF, search])

  const STATUS_TABS = [
    { id: 'all',              label: 'All' },
    { id: 'awaiting_review',  label: 'Awaiting Review',  count: counts.awaiting_review },
    { id: 'info_requested',   label: 'Info Requested',   count: counts.info_requested },
    { id: 'payment_pending',  label: 'Invoice Sent',     count: counts.payment_pending },
    { id: 'payment_received', label: 'Paid',             count: counts.payment_received },
    { id: 'accepted',         label: 'Accepted',         count: counts.accepted },
    { id: 'declined',         label: 'Declined',         count: counts.declined },
  ]

  const statusBadge = (status) => {
    const map = {
      awaiting_review:  { bg: '#FEF3C7', fg: '#92400E', label: 'Awaiting Review' },
      info_requested:   { bg: '#DBEAFE', fg: '#1E40AF', label: 'Info Requested' },
      payment_pending:  { bg: '#FEF9C3', fg: '#854D0E', label: 'Invoice Sent' },
      payment_received: { bg: '#D1FAE5', fg: '#065F46', label: 'Paid ✓' },
      accepted:         { bg: '#DCFCE7', fg: '#166534', label: 'Accepted' },
      declined:         { bg: '#F3F4F6', fg: '#374151', label: 'Declined' },
    }
    const s = map[status] || map.awaiting_review
    return (
      <span style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: 99,
        background: s.bg, color: s.fg, fontSize: 11, fontWeight: 700,
      }}>{s.label}</span>
    )
  }

  return (
    <>
      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {STATUS_TABS.map(t => (
          <button key={t.id} onClick={() => setStatusF(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 99,
              border: `1.5px solid ${statusF === t.id ? TOKENS.crimson : (TOKENS.line || '#E8E2D6')}`,
              background: statusF === t.id ? TOKENS.crimson : '#fff',
              color: statusF === t.id ? '#fff' : TOKENS.crimson,
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            {t.label}
            {t.count !== undefined && (
              <span style={{
                background: statusF === t.id ? 'rgba(255,255,255,.25)' : (TOKENS.crimson + '15'),
                padding: '1px 7px', borderRadius: 99, fontSize: 11,
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16, maxWidth: 380 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by student, parent, email or reference..."
          style={{
            width: '100%', boxSizing: 'border-box', padding: '9px 13px',
            borderRadius: 8, border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
            fontSize: 13, background: TOKENS.cream,
          }}/>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 30, textAlign: 'center', color: '#9A9A9A', fontSize: 13, fontStyle: 'italic' }}>
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: TOKENS.s900, marginBottom: 4 }}>No requests found</div>
            <div style={{ fontSize: 12.5, color: TOKENS.s500 }}>
              {search || statusF !== 'all' ? 'Try adjusting your filters.' : 'New assessment requests will appear here.'}
            </div>
          </div>
        ) : (
          <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Reference</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Student</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Parent</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Country</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Curriculum</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Submitted</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r._id} onClick={() => onOpen(r._id)}
                  style={{ borderTop: '1px solid ' + (TOKENS.line || '#E8E2D6'), cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = TOKENS.cream}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12.5, color: TOKENS.crimson, fontWeight: 700 }}>
                    {r.requestRef}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: TOKENS.s900 }}>
                    {r.studentFirstName} {r.studentLastName}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12.5, color: TOKENS.s700 }}>
                    {r.parent1FirstName} {r.parent1LastName}<br/>
                    <span style={{ color: TOKENS.s500, fontSize: 11.5 }}>{r.parent1Email}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12.5, color: TOKENS.s700 }}>{r.countryIso}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: TOKENS.s500, maxWidth: 200 }}>
                    {(r.curriculumInterest || []).slice(0, 1).join('')}
                    {r.curriculumInterest?.length > 1 && ` +${r.curriculumInterest.length - 1}`}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: TOKENS.s500, whiteSpace: 'nowrap' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{statusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            style={{
              padding: '7px 14px', borderRadius: 6, border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
              background: '#fff', fontSize: 12, fontWeight: 700, cursor: page <= 1 ? 'not-allowed' : 'pointer',
              opacity: page <= 1 ? .5 : 1,
            }}>‹ Prev</button>
          <span style={{ padding: '7px 14px', fontSize: 12.5, color: TOKENS.s700 }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            style={{
              padding: '7px 14px', borderRadius: 6, border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
              background: '#fff', fontSize: 12, fontWeight: 700, cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              opacity: page >= totalPages ? .5 : 1,
            }}>Next ›</button>
        </div>
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────
// DETAIL VIEW
// ─────────────────────────────────────────────────────────
function AssessmentRequestDetail({ id, toast, onBack }) {
  const [req, setReq]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes]     = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [actionPanel, setActionPanel] = useState(null) // 'info_requested' | 'declined' | null
  const [actionMessage, setActionMessage] = useState('')
  const [submittingAction, setSubmittingAction] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/assessment/requests/' + id)
      .then(r => {
        const data = r.data?.data?.request
        setReq(data)
        setNotes(data?.internalNotes || '')
      })
      .catch(() => toast?.error?.('Failed to load request.'))
      .finally(() => setLoading(false))
  }, [id, toast])

  useEffect(() => { load() }, [load])

  const saveNotes = async () => {
    setSavingNotes(true)
    try {
      const { data } = await api.patch('/assessment/requests/' + id, { internalNotes: notes })
      if (data?.ok) {
        toast?.ok?.('Notes saved.')
        setReq(r => ({ ...r, internalNotes: notes }))
      }
    } catch (e) {
      toast?.error?.('Could not save notes.')
    } finally {
      setSavingNotes(false)
    }
  }

  const setStatus = async (status, message) => {
    setSubmittingAction(true)
    try {
      const { data } = await api.patch('/assessment/requests/' + id, { status, message })
      if (data?.ok) {
        setReq(data.data.request)
        setActionPanel(null)
        setActionMessage('')
        const labels = {
          payment_pending:  'accepted — invoice sent to parent',
          info_requested:   'info request sent to parent',
          declined:         'declined — parent notified',
        }
        toast?.ok?.(`Request ${labels[status] || 'updated'}.`)
      } else {
        toast?.error?.(data?.error || 'Could not update status.')
      }
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || e.message || 'Could not update status.'
      toast?.error?.(msg)
    } finally {
      setSubmittingAction(false)
    }
  }

  if (loading) {
    return <div style={{ padding: 30, textAlign: 'center', color: '#9A9A9A', fontSize: 13, fontStyle: 'italic' }}>Loading request...</div>
  }
  if (!req) {
    return <div style={{ padding: 30, textAlign: 'center', color: '#9A9A9A', fontSize: 13 }}>Request not found.</div>
  }

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.08em',
        textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6,
        borderBottom: '1px solid ' + (TOKENS.line || '#E8E2D6'),
      }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px 24px' }}>
        {children}
      </div>
    </div>
  )

  const Field = ({ label, value }) => {
    if (!value) return null
    return (
      <div>
        <div style={{ fontSize: 10.5, color: TOKENS.s500, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: TOKENS.s900, lineHeight: 1.5 }}>{value}</div>
      </div>
    )
  }

  const statusColors = {
    awaiting_review: { bg: '#FEF3C7', fg: '#92400E' },
    info_requested:  { bg: '#DBEAFE', fg: '#1E40AF' },
    accepted:        { bg: '#D1FAE5', fg: '#065F46' },
    declined:        { bg: '#F3F4F6', fg: '#374151' },
  }
  const sc = statusColors[req.status] || statusColors.awaiting_review

  return (
    <>
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: TOKENS.crimson, fontSize: 12.5, fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: 0,
      }}>
        ‹ Back to all requests
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* Main detail column */}
        <div className="card" style={{ padding: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h2 className="serif" style={{ fontSize: 24, color: TOKENS.s900, margin: '0 0 4px' }}>
                {req.studentFirstName} {req.studentLastName}
              </h2>
              <div style={{ fontSize: 12.5, color: TOKENS.s500, fontFamily: 'monospace' }}>{req.requestRef}</div>
            </div>
            <span style={{
              padding: '5px 14px', borderRadius: 99, background: sc.bg, color: sc.fg,
              fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
            }}>{req.status.replace('_', ' ')}</span>
          </div>

          <Section title="Student">
            <Field label="Full name" value={`${req.studentFirstName} ${req.studentLastName}`}/>
            <Field label="Date of birth" value={req.studentDOB}/>
            <Field label="Grade level" value={req.studentGrade}/>
            <Field label="Current school" value={req.currentSchool}/>
            <Field label="Student email" value={req.studentEmail}/>
            <Field label="Home language(s)" value={req.studentLanguages}/>
          </Section>
          {req.learningNeeds && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10.5, color: TOKENS.s500, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>Learning needs</div>
              <div style={{ fontSize: 13, color: TOKENS.s900, lineHeight: 1.6, background: TOKENS.cream, padding: '10px 14px', borderRadius: 8 }}>{req.learningNeeds}</div>
            </div>
          )}

          <Section title="Parent / Guardian">
            <Field label="Name" value={`${req.parent1FirstName} ${req.parent1LastName} (${req.parent1Relationship})`}/>
            <Field label="Email" value={<a href={`mailto:${req.parent1Email}`} style={{ color: TOKENS.crimson }}>{req.parent1Email}</a>}/>
            <Field label="Phone" value={req.parent1Phone}/>
            <Field label="Preferred contact" value={req.preferredContact}/>
            <Field label="Preferred time" value={req.preferredContactTime}/>
            {req.hasParent2 && (
              <Field label="Second parent" value={`${req.parent2FirstName} ${req.parent2LastName} (${req.parent2Relationship}) — ${req.parent2Email || ''} ${req.parent2Phone || ''}`}/>
            )}
          </Section>

          <Section title="Location">
            <Field label="Country" value={req.countryIso === 'OTHER' ? 'Other (remote)' : req.countryIso}/>
            <Field label="State / Province" value={req.stateProvince}/>
            <Field label="City" value={req.city}/>
            <Field label="Timezone" value={req.timezone}/>
          </Section>

          <Section title="Academic">
            <Field label="Curriculum interest" value={(req.curriculumInterest || []).join(', ')}/>
            <Field label="Target university region" value={(req.targetUniversity || []).join(', ')}/>
            <Field label="Why considering Smartious" value={(req.whyConsidering || []).join(', ')}/>
            <Field label="Preferred schedule" value={req.preferredSchedule}/>
          </Section>

          <Section title="Additional">
            <Field label="How they heard about us" value={req.howDidYouHear}/>
          </Section>
          {req.additionalInfo && (
            <div>
              <div style={{ fontSize: 10.5, color: TOKENS.s500, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>Additional info</div>
              <div style={{ fontSize: 13, color: TOKENS.s900, lineHeight: 1.6, background: TOKENS.cream, padding: '10px 14px', borderRadius: 8 }}>{req.additionalInfo}</div>
            </div>
          )}
        </div>

        {/* Action sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.s900, marginBottom: 14 }}>Actions</div>

            {actionPanel ? (
              <div>
                <div style={{ fontSize: 11.5, color: TOKENS.s700, fontWeight: 600, marginBottom: 8 }}>
                  {actionPanel === 'info_requested' ? 'What information do you need?' : 'Reason for decline (optional, sent to parent)'}
                </div>
                <textarea value={actionMessage} onChange={e => setActionMessage(e.target.value)}
                  rows={4} placeholder={actionPanel === 'info_requested'
                    ? 'e.g. Could you share a recent school report or recent grades for...'
                    : 'Optional — explain why, or leave blank for a generic message.'}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '9px 11px',
                    borderRadius: 7, border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
                    fontSize: 12.5, fontFamily: 'inherit', resize: 'vertical', marginBottom: 10,
                  }}/>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setStatus(actionPanel, actionMessage)} disabled={submittingAction}
                    style={{
                      flex: 1, background: TOKENS.crimson, color: '#fff', border: 'none',
                      padding: '9px 0', borderRadius: 7, fontSize: 12.5, fontWeight: 700,
                      cursor: submittingAction ? 'not-allowed' : 'pointer', opacity: submittingAction ? .6 : 1,
                    }}>
                    {submittingAction ? 'Sending...' : 'Send & update'}
                  </button>
                  <button onClick={() => { setActionPanel(null); setActionMessage('') }} disabled={submittingAction}
                    style={{
                      background: 'transparent', color: TOKENS.s500, border: '1px solid ' + (TOKENS.line || '#E8E2D6'),
                      padding: '9px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                    }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => setStatus('accepted')}
                  disabled={['accepted','payment_pending','payment_received'].includes(req.status)}
                  style={{
                    background: '#059669', color: '#fff', border: 'none',
                    padding: '10px 0', borderRadius: 7, fontSize: 12.5, fontWeight: 700,
                    cursor: ['accepted','payment_pending','payment_received'].includes(req.status) ? 'not-allowed' : 'pointer',
                    opacity: ['accepted','payment_pending','payment_received'].includes(req.status) ? .5 : 1,
                  }}>
                  Accept & send invoice
                </button>
                <div style={{ fontSize: 10.5, color: TOKENS.s500, lineHeight: 1.4, marginTop: -4, marginBottom: 2 }}>
                  Generates a Paystack payment link and emails the family.
                </div>
                {req.status === 'payment_pending' && req.paystackAuthUrl && (
                  <a href={req.paystackAuthUrl} target="_blank" rel="noopener noreferrer" style={{
                    display: 'block', textAlign: 'center', fontSize: 11.5, color: TOKENS.crimson,
                    marginTop: 2, wordBreak: 'break-all',
                  }}>View payment link ↗</a>
                )}
                {req.status === 'payment_received' && (
                  <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 700, marginTop: 2 }}>
                    ✓ Payment received
                    {req.paidAt && ` · ${new Date(req.paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                  </div>
                )}
                <button onClick={() => setActionPanel('info_requested')} disabled={req.status === 'accepted' || req.status === 'declined'}
                  style={{
                    background: '#fff', color: '#1E40AF', border: '1.5px solid #1E40AF',
                    padding: '10px 0', borderRadius: 7, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                    opacity: (req.status === 'accepted' || req.status === 'declined') ? .5 : 1,
                  }}>
                  Request more info
                </button>
                <button onClick={() => setActionPanel('declined')} disabled={req.status === 'accepted'}
                  style={{
                    background: '#fff', color: '#B91C1C', border: '1.5px solid #E8E2D6',
                    padding: '10px 0', borderRadius: 7, fontSize: 12.5, fontWeight: 700,
                    cursor: req.status === 'accepted' ? 'not-allowed' : 'pointer',
                    opacity: req.status === 'accepted' ? .5 : 1,
                  }}>
                  Decline
                </button>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.s900, marginBottom: 10 }}>Internal notes</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              rows={5} placeholder="Notes visible only to admin staff..."
              style={{
                width: '100%', boxSizing: 'border-box', padding: '9px 11px',
                borderRadius: 7, border: '1.5px solid ' + (TOKENS.line || '#E8E2D6'),
                fontSize: 12.5, fontFamily: 'inherit', resize: 'vertical', marginBottom: 10,
              }}/>
            <button onClick={saveNotes} disabled={savingNotes}
              style={{
                width: '100%', background: TOKENS.crimson, color: '#fff', border: 'none',
                padding: '9px 0', borderRadius: 7, fontSize: 12.5, fontWeight: 700,
                cursor: savingNotes ? 'not-allowed' : 'pointer', opacity: savingNotes ? .6 : 1,
              }}>
              {savingNotes ? 'Saving...' : 'Save notes'}
            </button>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: TOKENS.s500, lineHeight: 1.6 }}>
              <div style={{ marginBottom: 6 }}>
                <strong style={{ color: TOKENS.s900 }}>Submitted</strong><br/>
                {new Date(req.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
              {req.reviewedAt && (
                <div>
                  <strong style={{ color: TOKENS.s900 }}>Last reviewed</strong><br/>
                  {new Date(req.reviewedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              )}
            </div>
          </div>

        </div>
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

// ═══════════════════════════════════════════════════════════
// CRMModule — Sales Portal
// Complete inquiry tracker & pipeline management.
// Drop into Dashboard.jsx alongside other *Module functions.
//
// Integration in Dashboard.jsx:
//   1. Add to MODULES:  crm: { label:'CRM', accent:TOKENS.accentNavy, icon:'frontdesk' }
//   2. Add to sales ROLE_SECTIONS items: 'crm'
//   3. Add to ops_manager items: 'crm'
//   4. Add render: {safePage==='crm' && <CRMModule toast={toast} refreshKey={refreshKey}/>}
// ═══════════════════════════════════════════════════════════

function CRMModule({ toast, refreshKey }) {
  const [view, setView] = useState('list')   // list | detail | add
  const [selectedId, setSelectedId] = useState(null)
  return (
    <>
      <PSection tag="Sales" title="Inquiry" em="CRM" sub="Track every lead from first contact through to enrolment."/>
      {view === 'list'   && <CRMList   toast={toast} refreshKey={refreshKey} onOpen={id => { setSelectedId(id); setView('detail') }} onAdd={() => setView('add')}/>}
      {view === 'detail' && <CRMDetail toast={toast} id={selectedId} onBack={() => { setView('list'); setSelectedId(null) }}/>}
      {view === 'add'    && <CRMForm   toast={toast} onBack={() => setView('list')} onSaved={id => { setSelectedId(id); setView('detail') }}/>}
    </>
  )
}

// ── STATUS & SOURCE helpers ─────────────────────────────────
const STATUS_META = {
  new:            { label:'New',              bg:'#EFF6FF', fg:'#1D4ED8' },
  contacted:      { label:'Contacted',        bg:'#FEF9C3', fg:'#854D0E' },
  interested:     { label:'Interested',       bg:'#FEF3C7', fg:'#92400E' },
  proposal_sent:  { label:'Proposal Sent',    bg:'#F3E8FF', fg:'#6B21A8' },
  assessment_req: { label:'Assessment Req.',  bg:'#DBEAFE', fg:'#1E40AF' },
  enrolled:       { label:'Enrolled ✓',       bg:'#D1FAE5', fg:'#065F46' },
  lost:           { label:'Lost',             bg:'#F3F4F6', fg:'#374151' },
  unqualified:    { label:'Unqualified',      bg:'#FEE2E2', fg:'#991B1B' },
}
const SOURCE_META = {
  whatsapp:'WhatsApp', phone:'Phone', email:'Email', website:'Website',
  instagram:'Instagram', facebook:'Facebook', linkedin:'LinkedIn',
  tiktok:'TikTok', referral:'Referral', walk_in:'Walk-in', other:'Other',
}
const PRIORITY_META = {
  high:   { label:'High',   color:'#DC2626' },
  medium: { label:'Medium', color:'#D97706' },
  low:    { label:'Low',    color:'#6B7280' },
}
const NOTE_TYPE_META = {
  call:'📞', whatsapp:'💬', email:'✉️', meeting:'🤝', other:'📝',
}

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.new
  return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:99, background:m.bg, color:m.fg, fontSize:11, fontWeight:700 }}>{m.label}</span>
}

// ── LIST VIEW ───────────────────────────────────────────────
function CRMList({ toast, refreshKey, onOpen, onAdd }) {
  const [inquiries, setInquiries] = useState([])
  const [counts, setCounts]       = useState({})
  const [loading, setLoading]     = useState(true)
  const [stats, setStats]         = useState({})
  const [statusF, setStatusF]     = useState('all')
  const [sourceF, setSourceF]     = useState('all')
  const [search, setSearch]       = useState('')
  const [overdue, setOverdue]     = useState(false)
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(() => {
    setLoading(true)
    const params = { page, limit: 30 }
    if (statusF !== 'all') params.status = statusF
    if (sourceF !== 'all') params.source = sourceF
    if (search.trim()) params.search = search.trim()
    if (overdue) params.overdue = 'true'
    Promise.all([
      api.get('/inquiries', { params }),
      api.get('/inquiries/stats'),
    ]).then(([r, sr]) => {
      setInquiries(r.data?.data?.inquiries || [])
      setCounts(r.data?.data?.counts || {})
      setTotalPages(r.data?.data?.totalPages || 1)
      setStats(sr.data?.data || {})
    }).catch(() => toast?.error?.('Failed to load inquiries.'))
    .finally(() => setLoading(false))
  }, [statusF, sourceF, search, overdue, page])

  useEffect(() => { load() }, [load, refreshKey])
  useEffect(() => { setPage(1) }, [statusF, sourceF, search, overdue])

  const STATUS_TABS = [
    { id:'all', label:'All' },
    ...Object.entries(STATUS_META).map(([id, m]) => ({ id, label:m.label, count:counts[id] }))
  ]

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short' }) : '—'
  const isOverdueDate = d => d && new Date(d) < new Date()

  return (
    <>
      {/* KPI strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10, marginBottom:20 }}>
        {[
          { label:'Total Leads',   val:Object.values(counts).reduce((a,b)=>a+b,0) || 0, color:TOKENS.crimson },
          { label:'New This Month', val:stats.recent || 0, color:'#1D4ED8' },
          { label:'Overdue Callbacks', val:stats.overdueCount || stats.overdue || 0, color:'#DC2626' },
          { label:'Enrolled',      val:counts.enrolled || 0, color:'#065F46' },
          { label:'In Pipeline',   val:(counts.new||0)+(counts.contacted||0)+(counts.interested||0)+(counts.proposal_sent||0)+(counts.assessment_req||0), color:'#6B21A8' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding:'14px 16px' }}>
            <div style={{ fontSize:22, fontWeight:800, color:k.color }}>{k.val}</div>
            <div style={{ fontSize:11, color:TOKENS.s500, marginTop:2, lineHeight:1.3 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, email..."
          style={{ flex:'1 1 220px', padding:'8px 12px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13 }}/>
        <select value={sourceF} onChange={e => setSourceF(e.target.value)}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5 }}>
          <option value="all">All sources</option>
          {Object.entries(SOURCE_META).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12.5, cursor:'pointer', color:overdue?'#DC2626':TOKENS.s700 }}>
          <input type="checkbox" checked={overdue} onChange={e => setOverdue(e.target.checked)}/>
          Overdue only
        </label>
        <button onClick={onAdd} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
          + New inquiry
        </button>
      </div>

      {/* Status tabs */}
      <div style={{ display:'flex', gap:5, marginBottom:14, flexWrap:'wrap', borderBottom:'1.5px solid '+TOKENS.line, paddingBottom:0 }}>
        {STATUS_TABS.map(t => (
          <button key={t.id} onClick={() => setStatusF(t.id)} style={{
            padding:'8px 14px', border:'none', background:'transparent',
            borderBottom: statusF===t.id ? '2.5px solid '+TOKENS.crimson : '2.5px solid transparent',
            color: statusF===t.id ? TOKENS.crimson : TOKENS.s500,
            fontSize:12, fontWeight: statusF===t.id ? 700 : 500, cursor:'pointer', marginBottom:-1.5,
            display:'flex', alignItems:'center', gap:5,
          }}>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span style={{ background:statusF===t.id?TOKENS.crimson+'20':'#F3F4F6', color:statusF===t.id?TOKENS.crimson:TOKENS.s500, padding:'1px 6px', borderRadius:99, fontSize:10, fontWeight:700 }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:30, textAlign:'center', color:TOKENS.s500, fontSize:13 }}>Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <div style={{ padding:40, textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:10 }}>📋</div>
            <div style={{ fontSize:14, fontWeight:700, color:TOKENS.s900, marginBottom:4 }}>No inquiries found</div>
            <div style={{ fontSize:12.5, color:TOKENS.s500 }}>{search || statusF !== 'all' ? 'Try different filters.' : 'Click "+ New inquiry" to record your first lead.'}</div>
          </div>
        ) : (
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11 }}>Contact</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11 }}>Student</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11 }}>Source</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11 }}>Status</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11 }}>Priority</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11 }}>Next Callback</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11 }}>Added</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map(inq => {
                const pm = PRIORITY_META[inq.priority] || PRIORITY_META.medium
                const cbOverdue = inq.nextCallbackDate && !inq.nextCallbackDone && isOverdueDate(inq.nextCallbackDate)
                return (
                  <tr key={inq._id} onClick={() => onOpen(inq._id)}
                    style={{ borderTop:'1px solid '+TOKENS.line, cursor:'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background=TOKENS.cream}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900 }}>{inq.parentName}</div>
                      <div style={{ fontSize:11.5, color:TOKENS.s500 }}>{inq.parentPhone || inq.parentEmail || '—'}</div>
                      {inq.city && <div style={{ fontSize:11, color:TOKENS.s500 }}>{inq.city}{inq.country ? ', '+inq.country : ''}</div>}
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:12.5, color:TOKENS.s700 }}>
                      {inq.studentName || '—'}
                      {inq.studentGrade && <div style={{ fontSize:11, color:TOKENS.s500 }}>{inq.studentGrade}</div>}
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:12.5, color:TOKENS.s700 }}>{SOURCE_META[inq.source] || inq.source}</td>
                    <td style={{ padding:'12px 16px' }}><StatusBadge status={inq.status}/></td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:11.5, fontWeight:700, color:pm.color }}>● {pm.label}</span>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:12.5, color:cbOverdue?'#DC2626':TOKENS.s700, fontWeight:cbOverdue?700:400 }}>
                      {inq.nextCallbackDate ? (cbOverdue ? '⚠ ' : '') + fmtDate(inq.nextCallbackDate) : '—'}
                      {inq.nextCallbackDone && <span style={{ color:TOKENS.s400, fontWeight:400 }}> (done)</span>}
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:11.5, color:TOKENS.s500, whiteSpace:'nowrap' }}>
                      {fmtDate(inq.createdAt)}
                      {inq.notes?.length > 0 && <div style={{ fontSize:10.5, color:TOKENS.s400 }}>{inq.notes.length} note{inq.notes.length>1?'s':''}</div>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:14 }}>
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page<=1}
            style={{ padding:'7px 14px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page<=1?'not-allowed':'pointer', opacity:page<=1?.5:1 }}>‹ Prev</button>
          <span style={{ padding:'7px 14px', fontSize:12.5, color:TOKENS.s700 }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page>=totalPages}
            style={{ padding:'7px 14px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page>=totalPages?'not-allowed':'pointer', opacity:page>=totalPages?.5:1 }}>Next ›</button>
        </div>
      )}
    </>
  )
}

// ── DETAIL VIEW ─────────────────────────────────────────────
function CRMDetail({ toast, id, onBack }) {
  const [inq, setInq]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [noteForm, setNoteForm] = useState({ type:'call', summary:'', outcome:'', callbackDate:'' })
  const [addingNote, setAddingNote] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/inquiries/' + id)
      .then(r => setInq(r.data?.data?.inquiry))
      .catch(() => toast?.error?.('Failed to load inquiry.'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [id])

  const updateStatus = async (status) => {
    try {
      const { data } = await api.patch('/inquiries/' + id, { status })
      if (data.success) { setInq(data.data.inquiry); toast?.ok?.('Status updated.') }
    } catch { toast?.error?.('Could not update status.') }
  }

  const addNote = async () => {
    if (!noteForm.summary.trim()) { toast?.error?.('Enter a note summary.'); return }
    setAddingNote(true)
    try {
      const { data } = await api.post('/inquiries/' + id + '/notes', noteForm)
      if (data.success) {
        setInq(data.data.inquiry)
        setNoteForm({ type:'call', summary:'', outcome:'', callbackDate:'' })
        setShowNoteForm(false)
        toast?.ok?.('Note added.')
      }
    } catch { toast?.error?.('Could not add note.') }
    finally { setAddingNote(false) }
  }

  const markCallbackDone = async (noteId, done) => {
    try {
      const { data } = await api.patch('/inquiries/' + id + '/notes/' + noteId, { callbackDone: done })
      if (data.success) setInq(data.data.inquiry)
    } catch { toast?.error?.('Could not update.') }
  }

  if (loading) return <div style={{ padding:30, textAlign:'center', color:TOKENS.s500, fontSize:13 }}>Loading...</div>
  if (!inq) return <div style={{ padding:30, color:TOKENS.s500 }}>Inquiry not found.</div>

  const pm = PRIORITY_META[inq.priority] || PRIORITY_META.medium
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'
  const fmtDT = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'
  const inp = { width:'100%', boxSizing:'border-box', padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }

  return (
    <>
      <button onClick={onBack} style={{ background:'transparent', border:'none', cursor:'pointer', color:TOKENS.crimson, fontSize:12.5, fontWeight:700, display:'flex', alignItems:'center', gap:6, marginBottom:16, padding:0 }}>
        ‹ Back to all inquiries
      </button>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:18, alignItems:'start' }}>
        {/* Main */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Header card */}
          <div className="card" style={{ padding:22 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <h2 className="serif" style={{ fontSize:22, color:TOKENS.s900, margin:'0 0 4px' }}>{inq.parentName}</h2>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <StatusBadge status={inq.status}/>
                  <span style={{ fontSize:11.5, fontWeight:700, color:pm.color }}>● {pm.label} priority</span>
                  <span style={{ fontSize:11.5, color:TOKENS.s500 }}>{SOURCE_META[inq.source] || inq.source}</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                {inq.parentPhone && <a href={'tel:'+inq.parentPhone} style={{ background:TOKENS.crimson, color:'#fff', padding:'7px 14px', borderRadius:7, fontSize:12, fontWeight:700, textDecoration:'none' }}>📞 Call</a>}
                {inq.parentPhone && <a href={'https://wa.me/'+inq.parentPhone.replace(/\D/g,'')} target="_blank" rel="noopener" style={{ background:'#25D366', color:'#fff', padding:'7px 14px', borderRadius:7, fontSize:12, fontWeight:700, textDecoration:'none' }}>💬 WhatsApp</a>}
              </div>
            </div>

            {/* Contact details */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'8px 24px' }}>
              {[
                { label:'Phone', val:inq.parentPhone },
                { label:'Email', val:inq.parentEmail },
                { label:'Alt phone', val:inq.parentPhone2 },
                { label:'Location', val:[inq.city, inq.country].filter(Boolean).join(', ') },
                { label:'Timezone', val:inq.timezone },
                { label:'Student', val:inq.studentName },
                { label:'Grade', val:inq.studentGrade },
                { label:'Curriculum', val:inq.curriculum },
                { label:'Referred by', val:inq.referredBy },
                { label:'Campaign', val:inq.campaignTag },
              ].filter(f => f.val).map(f => (
                <div key={f.label}>
                  <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:2 }}>{f.label}</div>
                  <div style={{ fontSize:13, color:TOKENS.s900 }}>{f.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact log */}
          <div className="card" style={{ padding:22 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontSize:14, fontWeight:800, color:TOKENS.s900 }}>Contact Log</div>
              <button onClick={() => setShowNoteForm(v => !v)} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'7px 14px', borderRadius:7, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                {showNoteForm ? 'Cancel' : '+ Log contact'}
              </button>
            </div>

            {showNoteForm && (
              <div style={{ background:TOKENS.cream, borderRadius:8, padding:16, marginBottom:16, border:'1.5px solid '+TOKENS.line }}>
                <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', gap:10, marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:TOKENS.s500, marginBottom:4 }}>TYPE</div>
                    <select value={noteForm.type} onChange={e => setNoteForm(n => ({...n, type:e.target.value}))} style={inp}>
                      {Object.entries(NOTE_TYPE_META).map(([k,v]) => <option key={k} value={k}>{v} {k.charAt(0).toUpperCase()+k.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:TOKENS.s500, marginBottom:4 }}>CALLBACK DATE (optional)</div>
                    <input type="datetime-local" value={noteForm.callbackDate} onChange={e => setNoteForm(n => ({...n, callbackDate:e.target.value}))} style={inp}/>
                  </div>
                </div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:TOKENS.s500, marginBottom:4 }}>SUMMARY *</div>
                  <textarea value={noteForm.summary} onChange={e => setNoteForm(n => ({...n, summary:e.target.value}))} rows={3} placeholder="What was discussed, what happened..." style={{...inp, resize:'vertical', fontFamily:'inherit'}}/>
                </div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:TOKENS.s500, marginBottom:4 }}>OUTCOME</div>
                  <input value={noteForm.outcome} onChange={e => setNoteForm(n => ({...n, outcome:e.target.value}))} placeholder="e.g. Agreed to send brochure, callback next week..." style={inp}/>
                </div>
                <button onClick={addNote} disabled={addingNote} style={{ background:addingNote?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 20px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:addingNote?'not-allowed':'pointer' }}>
                  {addingNote ? 'Saving...' : 'Save note'}
                </button>
              </div>
            )}

            {(!inq.notes || inq.notes.length === 0) && !showNoteForm ? (
              <div style={{ padding:'20px 0', textAlign:'center', color:TOKENS.s400, fontSize:13 }}>No contact notes yet. Log your first interaction above.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {(inq.notes || []).map(note => (
                  <div key={note._id} style={{ background:TOKENS.cream, borderRadius:8, padding:14, border:'1px solid '+TOKENS.line }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:16 }}>{NOTE_TYPE_META[note.type] || '📝'}</span>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:TOKENS.s900 }}>
                            {note.type?.charAt(0).toUpperCase() + note.type?.slice(1)}
                            {note.recordedBy && <span style={{ fontWeight:400, color:TOKENS.s500 }}> by {note.recordedBy.firstName} {note.recordedBy.lastName}</span>}
                          </div>
                          <div style={{ fontSize:11, color:TOKENS.s400 }}>{fmtDT(note.date)}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize:13, color:TOKENS.s900, lineHeight:1.6, marginBottom:note.outcome?6:0 }}>{note.summary}</div>
                    {note.outcome && <div style={{ fontSize:12, color:TOKENS.s700, fontStyle:'italic' }}>→ {note.outcome}</div>}
                    {note.callbackDate && (
                      <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:11.5, color:note.callbackDone?TOKENS.s400:'#D97706', fontWeight:600 }}>
                          📅 Callback: {fmtDT(note.callbackDate)}
                        </span>
                        {!note.callbackDone ? (
                          <button onClick={() => markCallbackDone(note._id, true)} style={{ fontSize:11, background:'#D1FAE5', color:'#065F46', border:'none', padding:'2px 8px', borderRadius:4, cursor:'pointer', fontWeight:700 }}>Mark done</button>
                        ) : (
                          <span style={{ fontSize:11, color:TOKENS.s400 }}>✓ Done</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Status panel */}
          <div className="card" style={{ padding:18 }}>
            <div style={{ fontSize:12, fontWeight:700, color:TOKENS.s900, marginBottom:12 }}>Pipeline Stage</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {Object.entries(STATUS_META).map(([k, m]) => (
                <button key={k} onClick={() => updateStatus(k)}
                  style={{ textAlign:'left', padding:'8px 12px', borderRadius:7, border:'1.5px solid '+(inq.status===k?m.fg:TOKENS.line), background:inq.status===k?m.bg:'transparent', color:inq.status===k?m.fg:TOKENS.s700, fontSize:12, fontWeight:inq.status===k?700:500, cursor:'pointer' }}>
                  {inq.status===k ? '✓ ' : ''}{m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick info */}
          <div className="card" style={{ padding:18 }}>
            <div style={{ fontSize:12, fontWeight:700, color:TOKENS.s900, marginBottom:10 }}>Callback</div>
            {inq.nextCallbackDate ? (
              <div style={{ fontSize:13, color: !inq.nextCallbackDone && new Date(inq.nextCallbackDate) < new Date() ? '#DC2626' : TOKENS.s700, fontWeight:600 }}>
                📅 {new Date(inq.nextCallbackDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                {inq.nextCallbackDone && <div style={{ fontSize:11, color:TOKENS.s400, fontWeight:400, marginTop:2 }}>✓ Completed</div>}
              </div>
            ) : (
              <div style={{ fontSize:12.5, color:TOKENS.s400 }}>No callback scheduled</div>
            )}
          </div>

          <div className="card" style={{ padding:18 }}>
            <div style={{ fontSize:11, color:TOKENS.s500, lineHeight:1.7 }}>
              <div><strong>Added</strong><br/>{fmtDate(inq.createdAt)}</div>
              {inq.createdBy && <div style={{ marginTop:6 }}><strong>By</strong><br/>{inq.createdBy.firstName} {inq.createdBy.lastName}</div>}
              {inq.assignedTo && <div style={{ marginTop:6 }}><strong>Assigned to</strong><br/>{inq.assignedTo.firstName} {inq.assignedTo.lastName}</div>}
              <div style={{ marginTop:6 }}><strong>Notes</strong><br/>{inq.notes?.length || 0} log {inq.notes?.length === 1 ? 'entry' : 'entries'}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── ADD FORM ────────────────────────────────────────────────
function CRMForm({ toast, onBack, onSaved }) {
  const [form, setForm] = useState({
    parentName:'', parentPhone:'', parentEmail:'', parentPhone2:'',
    country:'', city:'', timezone:'',
    studentName:'', studentGrade:'', curriculum:'',
    source:'whatsapp', referredBy:'', campaignTag:'',
    status:'new', priority:'medium',
    nextCallbackDate:'',
    internalNote:'',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (k, v) => setForm(f => ({...f, [k]:v}))

  const save = async () => {
    setError('')
    if (!form.parentName.trim()) { setError('Contact name is required.'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/inquiries', form)
      if (data.success) {
        toast?.ok?.('Inquiry created.')
        onSaved(data.data.inquiry._id)
      } else {
        setError(data.message || 'Could not save.')
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not save inquiry.')
    } finally { setSaving(false) }
  }

  const inp   = { width:'100%', boxSizing:'border-box', padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }
  const lbl   = { fontSize:11, fontWeight:700, color:TOKENS.crimson, letterSpacing:'.05em', textTransform:'uppercase', marginBottom:4, display:'block' }
  const field = (label, key, opts={}) => (
    <div>
      <label style={lbl}>{label}{opts.required && ' *'}</label>
      {opts.select ? (
        <select value={form[key]} onChange={e => set(key, e.target.value)} style={inp}>
          {opts.options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ) : (
        <input type={opts.type||'text'} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={opts.placeholder||''} style={inp}/>
      )}
    </div>
  )

  const S = (label, children) => (
    <div className="card" style={{ padding:22, marginBottom:14 }}>
      <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:14, paddingBottom:8, borderBottom:'1px solid '+TOKENS.line }}>{label}</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>{children}</div>
    </div>
  )

  return (
    <>
      <button onClick={onBack} style={{ background:'transparent', border:'none', cursor:'pointer', color:TOKENS.crimson, fontSize:12.5, fontWeight:700, display:'flex', alignItems:'center', gap:6, marginBottom:16, padding:0 }}>
        ‹ Back
      </button>
      <h2 className="serif" style={{ fontSize:22, color:TOKENS.s900, margin:'0 0 20px' }}>New Inquiry</h2>

      {error && <div style={{ background:'#FDE7EC', border:'1px solid #F8B4C0', borderRadius:8, padding:'10px 14px', fontSize:13, color:TOKENS.crimson, marginBottom:16 }}>{error}</div>}

      {S('Contact / Parent', <>
        {field('Full name', 'parentName', { required:true, placeholder:'e.g. Jane Mwangi' })}
        {field('Phone (WhatsApp)', 'parentPhone', { placeholder:'+254 700 000 000' })}
        {field('Email', 'parentEmail', { type:'email', placeholder:'jane@email.com' })}
        {field('Secondary phone', 'parentPhone2', { placeholder:'+254 ...' })}
        {field('Country', 'country', { placeholder:'e.g. Kenya' })}
        {field('City', 'city', { placeholder:'e.g. Nairobi' })}
        {field('Timezone', 'timezone', { placeholder:'e.g. Africa/Nairobi' })}
      </>)}

      {S('Student', <>
        {field('Student name', 'studentName', { placeholder:'e.g. Michael Mwangi' })}
        {field('Grade / Year', 'studentGrade', { placeholder:'e.g. Year 9' })}
        {field('Curriculum interest', 'curriculum', { placeholder:'e.g. Cambridge IGCSE' })}
      </>)}

      {S('Source & Pipeline', <>
        {field('Source channel', 'source', { select:true, options:Object.entries(SOURCE_META) })}
        {field('Referred by', 'referredBy', { placeholder:'Name of referrer (if referral)' })}
        {field('Campaign / ad tag', 'campaignTag', { placeholder:'e.g. IG-Jun25, Google-Search' })}
        {field('Initial status', 'status', { select:true, options:Object.entries(STATUS_META).map(([k,m])=>[k,m.label]) })}
        {field('Priority', 'priority', { select:true, options:Object.entries(PRIORITY_META).map(([k,m])=>[k,m.label]) })}
        {field('First callback date', 'nextCallbackDate', { type:'datetime-local' })}
      </>)}

      <div className="card" style={{ padding:22, marginBottom:14 }}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:10 }}>Internal note (optional)</div>
        <textarea value={form.internalNote} onChange={e => set('internalNote', e.target.value)} rows={3}
          placeholder="Any context for the team — not shown to the family"
          style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}/>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={save} disabled={saving} style={{ background:saving?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', padding:'11px 28px', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
          {saving ? 'Saving...' : 'Save inquiry'}
        </button>
        <button onClick={onBack} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s700, padding:'11px 20px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>
          Cancel
        </button>
      </div>
    </>
  )
}


// ═══════════════════════════════════════════════════════════
// SalesPerformanceModule
// Shows sales officer's own invoices, receipts, cycle totals
// and earnings (3% commission + KES 40,000 retainer).
// Visible in: sales portal (My Performance), admin/ops can
// view any officer by passing ?userId.
// ═══════════════════════════════════════════════════════════
function SalesPerformanceModule({ toast, refreshKey }) {
  const { user } = useAuth()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [cycle,   setCycle]   = useState('')   // '' = current
  const [cycles,  setCycles]  = useState([])

  const load = useCallback((c) => {
    setLoading(true)
    const params = c ? { cycle: c } : {}
    api.get('/invoices/sales-performance', { params })
      .then(r => {
        setData(r.data?.data)
        setCycles(r.data?.data?.availableCycles || [])
      })
      .catch(() => toast?.error?.('Failed to load sales performance.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(cycle) }, [cycle, refreshKey])

  const money = (n, cur='') => {
    const v = Number(n||0).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })
    return cur ? `${cur} ${v}` : v
  }
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'

  const STATUS_COLOURS = {
    draft:     { bg:'#F3F4F6', fg:'#374151' },
    sent:      { bg:'#DBEAFE', fg:'#1E40AF' },
    paid:      { bg:'#D1FAE5', fg:'#065F46' },
    overdue:   { bg:'#FEE2E2', fg:'#991B1B' },
    cancelled: { bg:'#F3F4F6', fg:'#6B7280' },
  }

  const viewReceipt = async (inv) => {
    try {
      const { data: rd } = await api.get('/invoices/'+inv._id+'/receipt-html')
      if (rd.success) {
        const w = window.open('','_blank')
        if (!w) { toast?.error?.('Allow pop-ups to view receipt.'); return }
        w.document.write(rd.data.html); w.document.close()
      }
    } catch { toast?.error?.('Could not load receipt.') }
  }

  if (loading) return (
    <div style={{padding:'60px 0',textAlign:'center'}}>
      <div style={{width:40,height:40,border:'3px solid #F0EBE6',borderTopColor:TOKENS.crimson,borderRadius:'50%',animation:'spin .75s linear infinite',margin:'0 auto 14px'}}/>
      <div style={{fontSize:13,color:TOKENS.s500}}>Loading your performance data...</div>
    </div>
  )

  if (!data) return null

  const { summary, earnings, invoices, trend, cycle: cycleInfo } = data

  const maxBar = Math.max(...(trend||[]).map(t=>t.sales), 1)

  return (
    <>
      <PSection tag="Sales" title="My" em="Performance" sub={`Cycle: ${cycleInfo?.label || '—'} · Commission 3% + KES 40,000 retainer`}/>

      {/* Cycle picker */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{fontSize:12.5,fontWeight:700,color:TOKENS.s700}}>Billing cycle:</div>
        <select value={cycle} onChange={e=>setCycle(e.target.value)}
          style={{padding:'8px 12px',borderRadius:7,border:'1.5px solid '+TOKENS.line,fontSize:13,background:'#fff',minWidth:280}}>
          <option value="">Current cycle</option>
          {cycles.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </div>

      {/* KPI strip */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12,marginBottom:20}}>
        {[
          { label:'Invoices Issued',   val:summary.totalInvoiced,  color:TOKENS.crimson,      sub:'This cycle' },
          { label:'Paid',              val:summary.totalPaid,       color:'#065F46',            sub:'Invoices confirmed' },
          { label:'Pending',           val:summary.totalPending,    color:'#D97706',            sub:'Awaiting payment' },
          { label:'Sales Volume',      val:'USD '+money(summary.salesVolume), color:TOKENS.crimson, sub:'Paid invoices only', big:true },
        ].map(k=>(
          <div key={k.label} className="card" style={{padding:'16px 18px'}}>
            <div style={{fontSize:11,fontWeight:700,color:TOKENS.s400,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:6}}>{k.label}</div>
            <div style={{fontSize:k.big?16:26,fontWeight:800,color:k.color,lineHeight:1.1}}>{k.val}</div>
            <div style={{fontSize:11,color:TOKENS.s500,marginTop:4}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Earnings card */}
      <div className="card" style={{padding:24,marginBottom:20,background:'linear-gradient(135deg,#7D1025,#5A0B1B)',color:'#fff',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-20,right:-20,width:120,height:120,borderRadius:'50%',background:'rgba(201,160,48,.12)'}}/>
        <div style={{position:'absolute',bottom:-30,left:-10,width:80,height:80,borderRadius:'50%',background:'rgba(201,160,48,.08)'}}/>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.6)',marginBottom:10}}>
          Your earnings this cycle
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16,position:'relative'}}>
          <div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.55)',marginBottom:4}}>Retainer (fixed)</div>
            <div style={{fontSize:28,fontWeight:800,color:'#C9A030'}}>KES 40,000</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.45)'}}>Paid monthly</div>
          </div>
          <div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.55)',marginBottom:4}}>Commission (3% of sales)</div>
            <div style={{fontSize:28,fontWeight:800,color:'#C9A030'}}>
              USD {money(earnings.commissionUSD)}
            </div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.45)'}}>
              3% × USD {money(earnings.salesVolume)} sales
            </div>
          </div>
          {Object.entries(summary.byCurrency||{}).filter(([k])=>k!=='USD').map(([cur,amt])=>(
            <div key={cur}>
              <div style={{fontSize:11,color:'rgba(255,255,255,.55)',marginBottom:4}}>Commission ({cur} sales)</div>
              <div style={{fontSize:22,fontWeight:800,color:'#C9A030'}}>
                {cur} {money(amt*0.03)}
              </div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.45)'}}>3% × {cur} {money(amt)}</div>
            </div>
          ))}
          <div style={{borderLeft:'1px solid rgba(255,255,255,.15)',paddingLeft:16}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,.55)',marginBottom:4}}>Total this cycle</div>
            <div style={{fontSize:24,fontWeight:800,color:'#fff'}}>
              KES 40,000 + {Object.entries(summary.byCurrency||{}).map(([c,a])=>`${c} ${money(a*0.03)}`).join(' + ') || 'USD 0.00'}
            </div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.45)',marginTop:4}}>Retainer + 3% commission on all currencies</div>
          </div>
        </div>
      </div>

      {/* Trend bar chart */}
      {trend && trend.length > 1 && (
        <div className="card" style={{padding:20,marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:800,color:TOKENS.s900,marginBottom:16}}>Sales trend (last 7 cycles)</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:8,height:80}}>
            {[...trend].reverse().map((t,i)=>(
              <div key={t.key||i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                <div style={{fontSize:9,color:TOKENS.s500,fontWeight:600}}>
                  {t.sales>0?'$'+money(t.sales):'—'}
                </div>
                <div style={{
                  width:'100%',
                  height: Math.max(4, (t.sales/maxBar)*60),
                  background: t.key === cycle || (!cycle && i===trend.length-1)
                    ? TOKENS.crimson : TOKENS.crimson+'40',
                  borderRadius:'3px 3px 0 0',
                  transition:'height .3s',
                }}/>
                <div style={{fontSize:8,color:TOKENS.s500,textAlign:'center',lineHeight:1.2}}>
                  {(t.cycle||'').split('–')[0]?.trim().slice(0,6)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice list */}
      <div className="card" style={{overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid '+TOKENS.line,fontWeight:800,fontSize:13,color:TOKENS.s900}}>
          Invoices this cycle
          <span style={{fontWeight:400,color:TOKENS.s500,marginLeft:8,fontSize:12}}>({invoices.length})</span>
        </div>
        {invoices.length === 0 ? (
          <div style={{padding:32,textAlign:'center',color:TOKENS.s500,fontSize:13}}>No invoices issued this cycle yet.</div>
        ) : (
          <table className="tbl" style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>{['Invoice No.','Bill To','Student','Amount','Status','Date',''].map(h=>(
                <th key={h} style={{padding:'9px 14px',textAlign:'left',fontSize:11}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {invoices.map(inv=>{
                const sc = STATUS_COLOURS[inv.status]||STATUS_COLOURS.sent
                return (
                  <tr key={inv._id} style={{borderTop:'1px solid '+TOKENS.line}}>
                    <td style={{padding:'10px 14px',fontFamily:'monospace',fontSize:12,fontWeight:700,color:TOKENS.crimson}}>{inv.invoiceNo}</td>
                    <td style={{padding:'10px 14px'}}>
                      <div style={{fontSize:13,fontWeight:600,color:TOKENS.s900}}>{inv.billedToName}</div>
                      {inv.billedToEmail&&<div style={{fontSize:11,color:TOKENS.s500}}>{inv.billedToEmail}</div>}
                    </td>
                    <td style={{padding:'10px 14px',fontSize:12.5,color:TOKENS.s700}}>{inv.studentName||'—'}</td>
                    <td style={{padding:'10px 14px',fontSize:13,fontWeight:700,color:TOKENS.s900,whiteSpace:'nowrap'}}>
                      {inv.currency} {money(inv.totalDue)}
                    </td>
                    <td style={{padding:'10px 14px'}}>
                      <span style={{padding:'3px 10px',borderRadius:99,background:sc.bg,color:sc.fg,fontSize:11,fontWeight:700}}>
                        {inv.status.charAt(0).toUpperCase()+inv.status.slice(1)}
                      </span>
                    </td>
                    <td style={{padding:'10px 14px',fontSize:11.5,color:TOKENS.s500,whiteSpace:'nowrap'}}>{fmtDate(inv.createdAt)}</td>
                    <td style={{padding:'10px 14px'}}>
                      {inv.status==='paid'&&(
                        <button onClick={()=>viewReceipt(inv)} style={{fontSize:11,background:'#065F46',color:'#fff',border:'none',padding:'4px 8px',borderRadius:5,cursor:'pointer',fontWeight:700}}>
                          🧾 Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Note */}
      <div style={{fontSize:12,color:TOKENS.s500,marginTop:12,lineHeight:1.6}}>
        Cycle runs from the <strong>15th of each month</strong> to the <strong>14th of the following month</strong>.
        Commission is calculated on <strong>paid invoices only</strong> at <strong>3%</strong> of the total invoice value.
        Retainer of <strong>KES 40,000</strong> is paid monthly regardless of sales volume.
      </div>
    </>
  )
}

function DOSSpinner() {
  return (
    <div style={{ padding:'50px 0', textAlign:'center' }}>
      <div style={{ width:34, height:34, border:'3px solid #F0EBE6', borderTopColor:TOKENS.crimson, borderRadius:'50%', animation:'spin .75s linear infinite', margin:'0 auto' }}/>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ReportsModule — Admin / Ops Portal
// Generate, edit and download student academic reports.
// Weekly exams average to 30%, end-term to 70%.
// Attendance pulled automatically from Attendance records.
//
// Add to Dashboard.jsx:
//   1. MODULES: reports: { label:'Reports', accent:TOKENS.crimson }
//   2. ops_manager/admin ROLE_SECTIONS: items: [..., 'reports']
//   3. Render: {safePage==='reports' && <ReportsModule toast={toast} refreshKey={refreshKey}/>}
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// DOS MODULE 4: Attendance Manager
// Mark and view attendance for ALL students and staff.
// DOS can mark/edit any record for any date.
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// DOS MODULES v2 — correct API shapes
// ═══════════════════════════════════════════════════════════

// ── DOS MODULE 1: Performance Analytics ───────────────────
function DOSAnalyticsModule({ toast, refreshKey }) {
  const [overview, setOverview]   = useState(null)
  const [examData, setExamData]   = useState(null)
  const [hwData,   setHwData]     = useState(null)
  const [atRisk,   setAtRisk]     = useState(null)
  const [loading,  setLoading]    = useState(true)
  const [filters,  setFilters]    = useState({ termStart:'', termEnd:'', curriculum:'', subject:'' })

  const load = useCallback(() => {
    setLoading(true)
    const p = { params: Object.fromEntries(Object.entries(filters).filter(([,v])=>v)) }
    Promise.allSettled([
      api.get('/dos/overview'),
      api.get('/dos/exam-analytics', p),
      api.get('/dos/homework-compliance', p),
      api.get('/dos/at-risk'),
    ]).then(([ov,ex,hw,ar]) => {
      setOverview(ov.status==='fulfilled' ? ov.value.data?.data : null)
      setExamData(ex.status==='fulfilled' ? ex.value.data?.data : null)
      setHwData(hw.status==='fulfilled'   ? hw.value.data?.data : null)
      setAtRisk(ar.status==='fulfilled'   ? ar.value.data?.data : null)
    }).finally(() => setLoading(false))
  }, [filters, refreshKey])

  useEffect(() => { load() }, [load])

  const gc = s => s===null?TOKENS.s400:s>=80?'#065F46':s>=70?'#1E40AF':s>=60?'#92400E':s>=50?'#6B21A8':s>=40?'#9A3412':'#991B1B'
  const gl = s => s===null?'—':s>=80?'A*':s>=70?'B':s>=60?'C':s>=50?'D':s>=40?'E':'U'

  return (
    <>
      <PSection tag="Dean of Studies" title="Performance" em="Analytics"
        sub="Live overview of student performance, exam results, homework tracking and at-risk flags."/>
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap', alignItems:'center', background:'#fff', border:'1px solid '+TOKENS.line, borderRadius:10, padding:'12px 14px' }}>
        <input type="date" value={filters.termStart} onChange={e=>setFilters(p=>({...p,termStart:e.target.value}))}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}/>
        <span style={{ fontSize:12, color:TOKENS.s400 }}>to</span>
        <input type="date" value={filters.termEnd} onChange={e=>setFilters(p=>({...p,termEnd:e.target.value}))}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}/>
        <select value={filters.curriculum} onChange={e=>setFilters(p=>({...p,curriculum:e.target.value}))}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}>
          <option value="">All curricula</option>
          {['Cambridge IGCSE','Edexcel','A-Level','IB','CBC','American','BNC'].map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <input value={filters.subject} onChange={e=>setFilters(p=>({...p,subject:e.target.value}))}
          placeholder="Subject" style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, width:130, fontFamily:'inherit' }}/>
        <button onClick={load} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'8px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>Apply</button>
        <button onClick={()=>{ setFilters({ termStart:'', termEnd:'', curriculum:'', subject:'' }); setTimeout(load,50) }}
          style={{ background:'transparent', border:'1px solid '+TOKENS.line, color:TOKENS.s500, padding:'8px 12px', borderRadius:7, fontSize:12, cursor:'pointer' }}>Reset</button>
      </div>
      {loading ? <DOSSpinner/> : (
        <>
          {overview && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12, marginBottom:24 }}>
              {[
                { label:'Active students',  val:overview.totalStudents,        color:TOKENS.crimson },
                { label:'Teachers',         val:overview.totalTeachers,        color:'#1E40AF' },
                { label:'Exams this month', val:overview.examsThisMonth,       color:'#6B21A8' },
                { label:'Avg exam score',   val:overview.avgExamScore!==null?overview.avgExamScore+'%':'—', color:gc(overview.avgExamScore) },
                { label:'HW compliance',    val:overview.hwComplianceRate!==null?overview.hwComplianceRate+'%':'—', color:overview.hwComplianceRate>=80?'#065F46':overview.hwComplianceRate>=60?'#D97706':'#991B1B' },
                { label:'Attendance (7d)',  val:overview.attendanceRate!==null?overview.attendanceRate+'%':'—', color:overview.attendanceRate>=80?'#065F46':overview.attendanceRate>=60?'#D97706':'#991B1B' },
              ].map(k=>(
                <div key={k.label} className="card" style={{ padding:'14px 16px' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>{k.label}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
                </div>
              ))}
            </div>
          )}
          {examData?.subjects?.length > 0 && (
            <div className="card" style={{ overflow:'hidden', marginBottom:18 }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line, fontWeight:800, fontSize:13, color:TOKENS.s900 }}>Subject Performance</div>
              <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr>
                  {['Subject','Curriculum','Class avg','Grade','Pass rate','Highest','Lowest','Exams'].map(h=>(
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:10.5 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {examData.subjects.map(s => (
                    <tr key={s.subject} style={{ borderTop:'1px solid '+TOKENS.line }}>
                      <td style={{ padding:'9px 12px', fontWeight:700, fontSize:13 }}>{s.subject}</td>
                      <td style={{ padding:'9px 12px', fontSize:12, color:TOKENS.s500 }}>{s.curriculum}</td>
                      <td style={{ padding:'9px 12px', fontWeight:800, fontSize:14, color:gc(s.avgScore) }}>{s.avgScore!==null?s.avgScore+'%':'—'}</td>
                      <td style={{ padding:'9px 12px' }}>
                        <span style={{ padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:800, background:gc(s.avgScore)+'18', color:gc(s.avgScore) }}>{gl(s.avgScore)}</span>
                      </td>
                      <td style={{ padding:'9px 12px', fontWeight:700, color:s.passRate>=60?'#065F46':'#991B1B' }}>{s.passRate!==null?s.passRate+'%':'—'}</td>
                      <td style={{ padding:'9px 12px', color:'#065F46', fontWeight:600 }}>{s.highest!==null?s.highest+'%':'—'}</td>
                      <td style={{ padding:'9px 12px', color:'#991B1B', fontWeight:600 }}>{s.lowest!==null?s.lowest+'%':'—'}</td>
                      <td style={{ padding:'9px 12px', color:TOKENS.s500 }}>{s.exams?.length||0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {hwData?.teachers?.length > 0 && (
              <div className="card" style={{ overflow:'hidden' }}>
                <div style={{ padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line, fontWeight:800, fontSize:13, color:TOKENS.s900 }}>Teacher HW Compliance</div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr>
                    {['Teacher','Missing HW','Mark rate','Score'].map(h=>(
                      <th key={h} style={{ padding:'7px 10px', textAlign:'left', fontSize:10, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em', background:TOKENS.cream, borderBottom:'1px solid '+TOKENS.line }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {hwData.teachers.map(t => {
                      const cs = t.complianceScore
                      const cc = cs>=90?'#065F46':cs>=70?'#D97706':'#991B1B'
                      return (
                        <tr key={String(t.teacherId)} style={{ borderTop:'1px solid '+TOKENS.line }}>
                          <td style={{ padding:'8px 10px', fontWeight:600, fontSize:12 }}>{t.teacherName}</td>
                          <td style={{ padding:'8px 10px', textAlign:'center', fontSize:12, color:t.lessonsWithoutHW>0?'#991B1B':TOKENS.s400, fontWeight:t.lessonsWithoutHW>0?700:400 }}>
                            {t.lessonsWithoutHW>0?t.lessonsWithoutHW+' missing':'All covered'}
                          </td>
                          <td style={{ padding:'8px 10px', textAlign:'center', fontSize:12, fontWeight:700, color:t.markingRate>=80?'#065F46':t.markingRate>=60?'#D97706':'#991B1B' }}>
                            {t.markingRate!==null?t.markingRate+'%':'—'}
                          </td>
                          <td style={{ padding:'8px 10px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                              <div style={{ flex:1, height:6, background:'#F3F4F6', borderRadius:99 }}>
                                <div style={{ width:(cs||0)+'%', height:'100%', background:cc, borderRadius:99 }}/>
                              </div>
                              <span style={{ fontSize:11, fontWeight:700, color:cc, minWidth:30 }}>{cs!==null?cs+'%':'—'}</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {atRisk?.students?.length > 0 && (
              <div className="card" style={{ overflow:'hidden' }}>
                <div style={{ padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:800, fontSize:13, color:TOKENS.s900 }}>At-Risk Students</span>
                  <span style={{ fontSize:11.5, fontWeight:700, color:'#991B1B' }}>{atRisk.totalAtRisk} flagged</span>
                </div>
                <div style={{ maxHeight:320, overflowY:'auto' }}>
                  {atRisk.students.map(s => (
                    <div key={String(s.studentId)} style={{ padding:'10px 14px', borderBottom:'1px solid '+TOKENS.line }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div>
                          <div style={{ fontSize:12.5, fontWeight:700, color:TOKENS.s900 }}>{s.studentName}</div>
                          <div style={{ fontSize:11, color:TOKENS.s500 }}>{s.curriculum} · {s.grade}</div>
                        </div>
                        <span style={{ fontSize:10.5, fontWeight:700, padding:'2px 8px', borderRadius:99,
                          background:s.riskLevel==='high'?'#FEE2E2':'#FEF9C3',
                          color:s.riskLevel==='high'?'#991B1B':'#92400E' }}>
                          {s.riskLevel==='high'?'High risk':'At risk'}
                        </span>
                      </div>
                      <div style={{ display:'flex', gap:12, marginTop:5, flexWrap:'wrap' }}>
                        {s.avg!==null&&<span style={{ fontSize:11, color:gc(s.avg), fontWeight:700 }}>Score: {s.avg}%</span>}
                        {s.attRate!==null&&<span style={{ fontSize:11, color:s.attRate<60?'#991B1B':'#D97706', fontWeight:700 }}>Attendance: {s.attRate}%</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {!overview && !examData && !hwData && (
            <div style={{ padding:'40px 0', textAlign:'center', color:TOKENS.s400, fontSize:13 }}>
              DOS analytics backend not yet deployed. Deploy <code>dos-analytics.js</code> and mount at <code>/api/dos</code>.
            </div>
          )}
        </>
      )}
    </>
  )
}

// ── DOS MODULE 2: Exams & Assessments ─────────────────────
function DOSExamsModule({ toast, refreshKey }) {
  const [exams,    setExams]    = useState([])
  const [selected, setSelected] = useState(null)
  const [subs,     setSubs]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [subLoading, setSubLoading] = useState(false)
  const [filters, setFilters]   = useState({ subject:'', curriculum:'', type:'all', search:'' })

  const load = useCallback(() => {
    setLoading(true)
    const params = {}
    if (filters.subject)    params.subject    = filters.subject
    if (filters.curriculum) params.curriculum = filters.curriculum
    api.get('/exams/all', { params })
      .then(r => {
        let list = r.data?.data?.exams || []
        if (filters.type==='weekly')  list = list.filter(e=>/weekly|assessment|quiz/i.test(e.title)||!(/end.?term|final|terminal/i.test(e.title)))
        if (filters.type==='endterm') list = list.filter(e=>/end.?term|final|terminal/i.test(e.title))
        if (filters.search) {
          const s = filters.search.toLowerCase()
          list = list.filter(e=>(e.title||'').toLowerCase().includes(s)||(e.subject||'').toLowerCase().includes(s))
        }
        setExams(list)
      })
      .catch(e => toast?.error?.('Failed to load exams: '+( e?.response?.data?.message||e.message)))
      .finally(() => setLoading(false))
  }, [filters, refreshKey])

  useEffect(() => { load() }, [load])

  const openExam = async (exam) => {
    setSelected(exam); setSubs([]); setSubLoading(true)
    try {
      const { data } = await api.get('/exams/'+exam._id+'/submissions')
      setSubs(data?.data?.submissions || data?.submissions || [])
    } catch { toast?.error?.('Could not load submissions.') }
    finally { setSubLoading(false) }
  }

  const gc = s => s===null?TOKENS.s400:s>=80?'#065F46':s>=70?'#1E40AF':s>=60?'#92400E':s>=50?'#6B21A8':s>=40?'#9A3412':'#991B1B'
  const gl = s => s===null?'—':s>=80?'A*':s>=70?'B':s>=60?'C':s>=50?'D':s>=40?'E':'U'
  const fmtDate = d => d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'
  const isEndTerm = e => /end.?term|final|terminal/i.test(e.title||'')

  if (selected) {
    const scores = subs.filter(s=>s.status==='graded').map(s=>{
      const awarded = (s.answers||[]).reduce((t,a)=>t+(a.marksAwarded||0),0)
      const pct = selected.totalMarks>0?Math.round((awarded/selected.totalMarks)*100):0
      return { ...s, awarded, pct }
    }).sort((a,b)=>b.pct-a.pct)
    const all = scores.map(s=>s.pct)
    const avg = all.length?Math.round(all.reduce((a,b)=>a+b,0)/all.length):null
    const GKEYS = ['A*','B','C','D','E','U']
    const GCOLS = {'A*':'#065F46',B:'#1E40AF',C:'#92400E',D:'#6B21A8',E:'#9A3412',U:'#991B1B'}
    const dist = all.reduce((acc,sc)=>{ const g=sc>=80?'A*':sc>=70?'B':sc>=60?'C':sc>=50?'D':sc>=40?'E':'U'; acc[g]=(acc[g]||0)+1; return acc },{})
    return (
      <>
        <button onClick={()=>setSelected(null)} style={{ background:'transparent', border:'none', cursor:'pointer', color:TOKENS.crimson, fontSize:12.5, fontWeight:700, padding:0, marginBottom:16 }}>← Back to exams</button>
        <div className="card" style={{ padding:22, marginBottom:16, background:'linear-gradient(135deg,#7D1025,#5A0B1B)', color:'#fff' }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'rgba(255,255,255,.5)', marginBottom:8 }}>{isEndTerm(selected)?'End-of-Term Exam':'Weekly Assessment'} · {fmtDate(selected.startAt)}</div>
          <h2 style={{ fontSize:22, fontWeight:800, color:'#fff', margin:'0 0 4px' }}>{selected.title}</h2>
          <div style={{ fontSize:13, color:'rgba(255,255,255,.65)' }}>{selected.subject} · {selected.curriculum} · {selected.grade} · {selected.totalMarks} marks</div>
          <div style={{ display:'flex', gap:20, marginTop:16, flexWrap:'wrap' }}>
            {[{ label:'Submissions',val:subs.length },{ label:'Graded',val:scores.length },{ label:'Class avg',val:avg!==null?avg+'%':'—',color:'#C9A030' },{ label:'Highest',val:all.length?Math.max(...all)+'%':'—',color:'#6EE7B7' },{ label:'Lowest',val:all.length?Math.min(...all)+'%':'—',color:'#FCA5A5' }].map(k=>(
              <div key={k.label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:800, color:k.color||'#fff' }}>{k.val}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.5)', marginTop:2 }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
        {all.length>0&&(
          <div className="card" style={{ padding:16, marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:TOKENS.s900, marginBottom:10 }}>Grade distribution</div>
            <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:60 }}>
              {GKEYS.map(g=>{ const c=dist[g]||0; const h=all.length?Math.max(4,(c/all.length)*60):0; return (
                <div key={g} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:GCOLS[g] }}>{c}</div>
                  <div style={{ width:'100%', height:h, background:GCOLS[g], borderRadius:'3px 3px 0 0' }}/>
                  <div style={{ fontSize:10.5, fontWeight:800, color:GCOLS[g] }}>{g}</div>
                </div>
              )})}
            </div>
          </div>
        )}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line, fontWeight:800, fontSize:13, color:TOKENS.s900 }}>Student Results ({scores.length})</div>
          {subLoading?<div style={{ padding:30,textAlign:'center',color:TOKENS.s400 }}>Loading...</div>:scores.length===0?<div style={{ padding:30,textAlign:'center',color:TOKENS.s400 }}>No graded submissions yet.</div>:(
            <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>{['Rank','Student','Score','%','Grade'].map(h=><th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:10.5 }}>{h}</th>)}</tr></thead>
              <tbody>
                {scores.map((s,i)=>(
                  <tr key={String(s._id)} style={{ borderTop:'1px solid '+TOKENS.line }}>
                    <td style={{ padding:'9px 12px', fontWeight:700, color:i===0?'#C9A030':i<3?TOKENS.s900:TOKENS.s400, fontSize:i===0?15:13 }}>{i===0?'1st':i===1?'2nd':i===2?'3rd':i+1}</td>
                    <td style={{ padding:'9px 12px', fontWeight:700 }}>{s.student?.firstName||''} {s.student?.lastName||''}</td>
                    <td style={{ padding:'9px 12px', fontWeight:700 }}>{s.awarded}/{selected.totalMarks}</td>
                    <td style={{ padding:'9px 12px', fontWeight:800, fontSize:15, color:gc(s.pct) }}>{s.pct}%</td>
                    <td style={{ padding:'9px 12px' }}><span style={{ padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:800, background:gc(s.pct)+'18', color:gc(s.pct) }}>{gl(s.pct)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <PSection tag="Dean of Studies" title="Exams &" em="Assessments" sub="All weekly assessments and end-of-term exams. Click any exam to see student scores and grade distribution."/>
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input value={filters.search} onChange={e=>setFilters(p=>({...p,search:e.target.value}))} placeholder="Search exam or subject..."
          style={{ flex:'1 1 200px', padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }}/>
        <select value={filters.curriculum} onChange={e=>setFilters(p=>({...p,curriculum:e.target.value}))}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}>
          <option value="">All curricula</option>
          {['Cambridge IGCSE','Edexcel','A-Level','IB','CBC','American','BNC'].map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.type} onChange={e=>setFilters(p=>({...p,type:e.target.value}))}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}>
          <option value="all">All types</option>
          <option value="weekly">Weekly assessments</option>
          <option value="endterm">End-of-term exams</option>
        </select>
        <button onClick={load} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>Search</button>
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:14 }}>
        {[{ label:'Weekly assessment', color:'#1E40AF', bg:'#DBEAFE' },{ label:'End-of-term exam', color:'#7D1025', bg:'#FDE7EC' }].map(t=>(
          <div key={t.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:TOKENS.s600 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:t.bg, border:'1.5px solid '+t.color }}/>
            {t.label}
          </div>
        ))}
      </div>
      <div className="card" style={{ overflow:'hidden' }}>
        {loading?<div style={{ padding:30,textAlign:'center',color:TOKENS.s400 }}>Loading exams...</div>:exams.length===0?<div style={{ padding:40,textAlign:'center',color:TOKENS.s400,fontSize:13 }}>No exams found.</div>:(
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>{['Title','Type','Subject','Curriculum','Grade','Date','Marks','Status'].map(h=><th key={h} style={{ padding:'9px 12px', textAlign:'left', fontSize:10.5 }}>{h}</th>)}</tr></thead>
            <tbody>
              {exams.map(e=>{ const end=isEndTerm(e); return (
                <tr key={e._id} style={{ borderTop:'1px solid '+TOKENS.line, cursor:'pointer' }}
                  onMouseEnter={ev=>ev.currentTarget.style.background=TOKENS.cream}
                  onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}
                  onClick={()=>openExam(e)}>
                  <td style={{ padding:'10px 12px', fontWeight:700, fontSize:13, color:TOKENS.s900 }}>{e.title}</td>
                  <td style={{ padding:'10px 12px' }}><span style={{ padding:'2px 9px', borderRadius:99, fontSize:10.5, fontWeight:700, background:end?'#FDE7EC':'#DBEAFE', color:end?'#7D1025':'#1E40AF' }}>{end?'End-term':'Weekly'}</span></td>
                  <td style={{ padding:'10px 12px', fontSize:12.5, color:TOKENS.s700 }}>{e.subject||'—'}</td>
                  <td style={{ padding:'10px 12px', fontSize:12, color:TOKENS.s500 }}>{e.curriculum||'—'}</td>
                  <td style={{ padding:'10px 12px', fontSize:12, color:TOKENS.s500 }}>{e.grade||'—'}</td>
                  <td style={{ padding:'10px 12px', fontSize:12, color:TOKENS.s500, whiteSpace:'nowrap' }}>{fmtDate(e.startAt)}</td>
                  <td style={{ padding:'10px 12px', fontSize:12.5 }}>{e.totalMarks||'—'}</td>
                  <td style={{ padding:'10px 12px' }}><span style={{ padding:'2px 8px', borderRadius:99, fontSize:10.5, fontWeight:700, background:e.status==='ended'?'#D1FAE5':e.status==='live'?'#FEF3C7':'#F3F4F6', color:e.status==='ended'?'#065F46':e.status==='live'?'#92400E':'#6B7280' }}>{e.status||'draft'}</span></td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

// ── DOS MODULE 3: Homework Tracker ─────────────────────────
function DOSHomeworkModule({ toast, refreshKey }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ termStart:'', termEnd:'', subject:'', curriculum:'' })
  const [expanded, setExpanded] = useState({})

  const load = useCallback(() => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([,v])=>v))
    api.get('/dos/homework-compliance', { params })
      .then(r => setData(r.data?.data))
      .catch(e => toast?.error?.('Failed to load: '+(e?.response?.data?.message||e.message)))
      .finally(() => setLoading(false))
  }, [filters, refreshKey])

  useEffect(() => { load() }, [load])

  const teachers = data?.teachers || []
  const totalLessons = teachers.reduce((s,t)=>s+t.totalLessons,0)
  const totalHW      = teachers.reduce((s,t)=>s+t.homeworkSet,0)
  const totalMissing = teachers.reduce((s,t)=>s+t.lessonsWithoutHW,0)
  const totalGraded  = teachers.reduce((s,t)=>s+t.gradedSubmissions,0)
  const totalSubs    = teachers.reduce((s,t)=>s+t.totalSubmissions,0)

  return (
    <>
      <PSection tag="Dean of Studies" title="Homework" em="Tracker" sub="Every lesson taught must have homework set, submitted and marked."/>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center', background:'#fff', border:'1px solid '+TOKENS.line, borderRadius:10, padding:'12px 14px' }}>
        <input type="date" value={filters.termStart} onChange={e=>setFilters(p=>({...p,termStart:e.target.value}))}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}/>
        <span style={{ fontSize:12, color:TOKENS.s400 }}>to</span>
        <input type="date" value={filters.termEnd} onChange={e=>setFilters(p=>({...p,termEnd:e.target.value}))}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}/>
        <input value={filters.subject} onChange={e=>setFilters(p=>({...p,subject:e.target.value}))}
          placeholder="Subject" style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, width:130, fontFamily:'inherit' }}/>
        <button onClick={load} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'8px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>Apply</button>
      </div>
      {!loading&&data&&(
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:20 }}>
          {[
            { label:'Lessons taught',    val:totalLessons,   color:TOKENS.s900 },
            { label:'HW sets',           val:totalHW,        color:TOKENS.s900 },
            { label:'Missing HW',        val:totalMissing,   color:totalMissing>0?'#991B1B':'#065F46' },
            { label:'Submissions',       val:totalSubs,      color:TOKENS.s900 },
            { label:'Graded',            val:totalGraded,    color:'#065F46' },
            { label:'Marking rate',      val:totalSubs>0?Math.round((totalGraded/totalSubs)*100)+'%':'—', color:totalSubs>0&&totalGraded/totalSubs>=0.8?'#065F46':'#D97706' },
          ].map(k=>(
            <div key={k.label} className="card" style={{ padding:'12px 14px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:5 }}>{k.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:k.color }}>{k.val}</div>
            </div>
          ))}
        </div>
      )}
      {loading?<DOSSpinner/>:teachers.length===0?(
        <div style={{ padding:'40px 0', textAlign:'center', color:TOKENS.s400, fontSize:13 }}>No homework data found. Check that dos-analytics backend is deployed.</div>
      ):(
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {teachers.map(t=>{
            const cs=t.complianceScore; const cc=cs>=90?'#065F46':cs>=70?'#D97706':'#991B1B'
            const bg=cs<70?'#FFF5F5':cs<90?'#FFFBF0':'#F0FDF4'
            const isOpen=expanded[String(t.teacherId)]
            return (
              <div key={String(t.teacherId)} style={{ background:'#fff', border:'1.5px solid '+(cs<70?'#FCA5A5':cs<90?'#FDE68A':TOKENS.line), borderRadius:12, overflow:'hidden' }}>
                <div style={{ padding:'14px 18px', background:bg, display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}
                  onClick={()=>setExpanded(p=>({...p,[String(t.teacherId)]:!p[String(t.teacherId)]}))}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:TOKENS.s900 }}>{t.teacherName}</div>
                    <div style={{ fontSize:11.5, color:TOKENS.s500, marginTop:2 }}>{t.totalLessons} lessons · {t.homeworkSet} HW sets · {t.totalSubmissions} submissions</div>
                  </div>
                  <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                    {t.lessonsWithoutHW>0&&<span style={{ fontSize:12, fontWeight:700, color:'#991B1B', background:'#FEE2E2', padding:'3px 10px', borderRadius:99 }}>{t.lessonsWithoutHW} lesson{t.lessonsWithoutHW>1?'s':''} missing HW</span>}
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:18, fontWeight:800, color:cc }}>{cs!==null?cs+'%':'—'}</div>
                      <div style={{ fontSize:9.5, color:TOKENS.s400 }}>Compliance</div>
                    </div>
                    <div style={{ width:4, height:12, borderTop:'2px solid '+TOKENS.s400, borderRight:'2px solid '+TOKENS.s400, transform:isOpen?'rotate(135deg)':'rotate(45deg)', transition:'transform .2s', marginTop:isOpen?4:-4 }}/>
                  </div>
                </div>
                <div style={{ height:4, background:'#F3F4F6' }}>
                  <div style={{ width:(cs||0)+'%', height:'100%', background:cc, transition:'width .4s' }}/>
                </div>
                {isOpen&&(
                  <div style={{ padding:'14px 18px', borderTop:'1px solid '+TOKENS.line }}>
                    {t.lessonsWithoutHW>0?(
                      <>
                        <div style={{ fontSize:11, fontWeight:700, color:'#991B1B', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Lessons without homework</div>
                        {t.missingHWLessons.map((l,i)=>(
                          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 10px', background:'#FFF5F5', borderRadius:7, border:'1px solid #FCA5A5', marginBottom:5 }}>
                            <div style={{ width:6, height:6, borderRadius:'50%', background:'#991B1B', flexShrink:0 }}/>
                            <div><div style={{ fontSize:12.5, fontWeight:600, color:TOKENS.s900 }}>{l.title}</div><div style={{ fontSize:11, color:TOKENS.s500 }}>{l.subject}</div></div>
                          </div>
                        ))}
                      </>
                    ):<div style={{ fontSize:12.5, color:'#065F46', fontWeight:600 }}>All lessons have homework assigned.</div>}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginTop:14, paddingTop:12, borderTop:'1px solid '+TOKENS.line }}>
                      {[{ label:'Lessons',val:t.totalLessons },{ label:'With HW',val:t.lessonsWithHW+' / '+t.totalLessons },{ label:'Submissions',val:t.totalSubmissions },{ label:'Graded',val:t.gradedSubmissions+' / '+t.totalSubmissions }].map(k=>(
                        <div key={k.label} style={{ textAlign:'center' }}>
                          <div style={{ fontSize:18, fontWeight:800, color:TOKENS.s900 }}>{k.val}</div>
                          <div style={{ fontSize:10, color:TOKENS.s400, marginTop:2 }}>{k.label}</div>
                        </div>
                      ))}
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

// ── DOS MODULE 4: Attendance Manager ──────────────────────
// Supports student breaks: mid-term, end-term, summer
const BREAK_TYPES = ['mid_term_break','end_term_break','summer_break','public_holiday','sick_leave']
const BREAK_LABELS = { mid_term_break:'Mid-term break', end_term_break:'End-term break', summer_break:'Summer break', public_holiday:'Public holiday', sick_leave:'Sick leave' }

// ═══════════════════════════════════════════════════════════
// DOSAttendanceModule — ANALYTICS ONLY
// DOS sees who checked in, rates, trends. No manual marking.
// Break management moved to DOSBreakModule.
// ═══════════════════════════════════════════════════════════
function DOSAttendanceModule({ toast, refreshKey }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [roleF,   setRoleF]   = useState('all')
  const [date,    setDate]    = useState(new Date().toISOString().split('T')[0])
  const [history, setHistory] = useState([])
  const [histLoad,setHistLoad]= useState(false)
  const [showHist,setShowHist]= useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const params = {}
    if (roleF !== 'all') params.role = roleF
    api.get('/checkin/status', { params })
      .then(r => setData(r.data?.data))
      .catch(e => toast?.error?.('Failed to load attendance: '+(e?.response?.data?.message||e.message)))
      .finally(() => setLoading(false))
  }, [roleF, refreshKey])

  useEffect(() => { load() }, [load])

  const loadHistory = () => {
    setHistLoad(true); setShowHist(true)
    // Get last 7 days check-in stats
    const days = []
    for (let i=6; i>=0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i)
      days.push(d.toISOString().split('T')[0])
    }
    Promise.allSettled(days.map(d => api.get('/attendance/day', { params:{ date:d } })))
      .then(results => {
        const hist = results.map((r,i) => ({
          date:    days[i],
          label:   new Date(days[i]).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}),
          present: r.status==='fulfilled' ? (r.value.data?.data?.items||[]).filter(x=>x.status==='present').length : 0,
          total:   r.status==='fulfilled' ? (r.value.data?.data?.items||[]).length : 0,
        }))
        setHistory(hist)
      })
      .finally(() => setHistLoad(false))
  }

  const users   = data?.users || []
  const summary = data?.summary || {}

  const STATUS_S = {
    present: { bg:'#D1FAE5', fg:'#065F46', label:'Present' },
    late:    { bg:'#FEF3C7', fg:'#D97706', label:'Late' },
    absent:  { bg:'#FEE2E2', fg:'#991B1B', label:'Absent' },
  }

  const fmtTime = d => d ? new Date(d).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : '—'

  // Group by role for display
  const byRole = {}
  users.forEach(u => {
    if (!byRole[u.role]) byRole[u.role] = []
    byRole[u.role].push(u)
  })

  const maxBar = Math.max(...(history.map(h=>h.total)||[1]), 1)

  return (
    <>
      <PSection tag="Dean of Studies" title="Attendance" em="Analytics"
        sub="Daily check-in overview. Students and staff self-report. Use Manage Breaks to deactivate accounts."/>

      {/* Controls */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', border:'1.5px solid '+TOKENS.line, borderRadius:7, overflow:'hidden' }}>
          {[['all','All'],['student','Students'],['teacher','Teachers'],['sales','Sales'],['ops_manager','Ops'],['accountant','Accounts'],['dos','DOS']].map(([val,label])=>(
            <button key={val} onClick={()=>setRoleF(val)} style={{
              padding:'8px 12px', border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
              background:roleF===val?TOKENS.crimson:'#fff', color:roleF===val?'#fff':TOKENS.s500,
              borderRight:'1px solid '+TOKENS.line,
            }}>{label}</button>
          ))}
        </div>
        <button onClick={load} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'8px 16px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>Refresh</button>
        <button onClick={loadHistory} style={{ background:TOKENS.cream, color:TOKENS.crimson, border:'1px solid '+TOKENS.line, padding:'8px 16px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer' }}>
          {showHist ? 'Hide 7-day trend' : 'Show 7-day trend'}
        </button>
        <div style={{ fontSize:12, color:TOKENS.s400, marginLeft:'auto' }}>
          Today: {new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}
        </div>
      </div>

      {loading ? <DOSSpinner/> : (
        <>
          {/* Summary KPIs */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:12, marginBottom:20 }}>
            {[
              { label:'Total',        val:summary.total||0,            color:TOKENS.s900 },
              { label:'Present',      val:summary.present||0,          color:'#065F46' },
              { label:'Late',         val:summary.late||0,             color:'#D97706' },
              { label:'Absent',       val:summary.absent||0,           color:'#991B1B' },
              { label:'Not checked in', val:summary.notCheckedIn||0,   color:TOKENS.crimson },
              { label:'On break',     val:summary.onBreak||0,          color:'#6B21A8' },
            ].map(k=>(
              <div key={k.label} className="card" style={{ padding:'14px 16px' }}>
                <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:5 }}>{k.label}</div>
                <div style={{ fontSize:24, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
                {summary.total>0 && k.label!=='Total' && (
                  <div style={{ fontSize:10, color:TOKENS.s400, marginTop:3 }}>{Math.round((k.val/summary.total)*100)}%</div>
                )}
              </div>
            ))}
          </div>

          {/* 7-day trend chart */}
          {showHist && (
            <div className="card" style={{ padding:18, marginBottom:18 }}>
              <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:14 }}>7-day attendance trend</div>
              {histLoad ? <div style={{ textAlign:'center', color:TOKENS.s400, padding:'20px 0', fontSize:13 }}>Loading...</div> : (
                <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:80 }}>
                  {history.map((h,i) => {
                    const pct = h.total>0 ? Math.round((h.present/h.total)*100) : 0
                    const barH = Math.max(4, (pct/100)*80)
                    return (
                      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                        <div style={{ fontSize:10, fontWeight:700, color:pct>=80?'#065F46':pct>=60?'#D97706':'#991B1B' }}>{pct}%</div>
                        <div style={{ width:'100%', height:barH, background:pct>=80?'#065F46':pct>=60?'#D97706':'#991B1B', borderRadius:'3px 3px 0 0', transition:'height .3s' }}/>
                        <div style={{ fontSize:9.5, color:TOKENS.s500, textAlign:'center', lineHeight:1.2 }}>{h.label}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Attendance table by role */}
          {Object.keys(byRole).length === 0 ? (
            <div style={{ padding:'40px 0', textAlign:'center', color:TOKENS.s400, fontSize:13 }}>No users found.</div>
          ) : (
            Object.entries(byRole).map(([role, roleUsers]) => (
              <div key={role} className="card" style={{ overflow:'hidden', marginBottom:14 }}>
                <div style={{ padding:'11px 16px', borderBottom:'1px solid '+TOKENS.line, background:TOKENS.cream, display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontWeight:800, fontSize:12.5, color:TOKENS.s900, textTransform:'capitalize' }}>
                    {role==='ops_manager'?'Operations Manager':role.charAt(0).toUpperCase()+role.slice(1)}s
                  </span>
                  <span style={{ fontSize:12, color:TOKENS.s500 }}>
                    {roleUsers.filter(u=>u.checkInStatus==='present').length} present · {roleUsers.filter(u=>!u.checkedIn&&!u.onBreak).length} not checked in
                  </span>
                </div>
                <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr>
                    {['Name','Status','Time','Late arrival / Reason','Break'].map(h=>(
                      <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:10.5 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {roleUsers.map(u => {
                      const ss = u.onBreak ? { bg:'#F3E8FF', fg:'#6B21A8', label:'On break' }
                                 : u.checkedIn ? STATUS_S[u.checkInStatus]||STATUS_S.present
                                 : { bg:'#F3F4F6', fg:'#6B7280', label:'Not checked in' }
                      return (
                        <tr key={String(u.userId)} style={{ borderTop:'1px solid '+TOKENS.line, opacity:u.onBreak?.6:1 }}>
                          <td style={{ padding:'9px 12px', fontWeight:700, fontSize:13, color:TOKENS.s900 }}>
                            {u.name}
                            <div style={{ fontSize:11, color:TOKENS.s500, fontWeight:400 }}>{u.email}</div>
                          </td>
                          <td style={{ padding:'9px 12px' }}>
                            <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:ss.bg, color:ss.fg }}>
                              {ss.label}
                            </span>
                          </td>
                          <td style={{ padding:'9px 12px', fontSize:12, color:TOKENS.s500, whiteSpace:'nowrap' }}>
                            {u.checkInTime ? fmtTime(u.checkInTime) : '—'}
                          </td>
                          <td style={{ padding:'9px 12px', fontSize:12, color:TOKENS.s600 }}>
                            {u.lateTime ? 'Arrived: '+u.lateTime : u.reason || '—'}
                          </td>
                          <td style={{ padding:'9px 12px', fontSize:11.5, color:'#6B21A8' }}>
                            {u.onBreak ? u.breakType?.replace(/_/g,' ')||'On break' : ''}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// DOSBreakModule — unchanged, already works well
// ═══════════════════════════════════════════════════════════

// ── DOS MODULE 5: Timetable Manager ───────────────────────
// Smartious schedule: 9am-3pm, Lunch 1pm-2pm
// Mon-Thu = lessons, Fri = assessment or activities
const SCHOOL_SLOTS = [
  { time:'09:00-10:00', label:'09:00 – 10:00' },
  { time:'10:00-11:00', label:'10:00 – 11:00' },
  { time:'11:00-12:00', label:'11:00 – 12:00' },
  { time:'12:00-13:00', label:'12:00 – 13:00' },
  { time:'13:00-14:00', label:'LUNCH BREAK',    isBreak:true },
  { time:'14:00-15:00', label:'14:00 – 15:00' },
]
const SCHOOL_DAYS = ['Mon','Tue','Wed','Thu','Fri']
const DAY_TYPES   = { Mon:'Lessons', Tue:'Lessons', Wed:'Lessons', Thu:'Lessons', Fri:'Assessment / Activities' }

function DOSTimetableModule({ toast, refreshKey }) {
  const [view,       setView]       = useState('picker')   // picker | grid | edit
  const [entries,    setEntries]    = useState([])
  const [loading,    setLoading]    = useState(false)
  const [selected,   setSelected]   = useState(null)
  const [editData,   setEditData]   = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [teachers,   setTeachers]   = useState([])
  const [students,   setStudents]   = useState([])
  const [chosenUser, setChosenUser] = useState(null)
  const [search,     setSearch]     = useState('')

  // ── School schedule constants (mirrors StudentPortal) ──
  const DAYS     = ['Mon','Tue','Wed','Thu','Fri']
  const DAY_LONG = { Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday', Thu:'Thursday', Fri:'Friday' }
  const DAY_TYPE = { Mon:'Lessons', Tue:'Lessons', Wed:'Lessons', Thu:'Lessons', Fri:'Assessment & Activities' }
  const FRI_COL  = '#6D28D9'
  const SLOTS    = [
    { label:'9 AM',  start:'09:00', end:'10:00' },
    { label:'10 AM', start:'10:00', end:'11:00' },
    { label:'11 AM', start:'11:00', end:'12:00' },
    { label:'12 PM', start:'12:00', end:'13:00' },
    { label:'Lunch', start:'13:00', end:'14:00', isBreak:true },
    { label:'2 PM',  start:'14:00', end:'15:00' },
  ]

  const toMins   = hhmm => { if (!hhmm) return 0; const [h,m]=hhmm.split(':').map(Number); return h*60+m }
  const fmt      = hhmm => { if (!hhmm) return ''; const [h,m]=hhmm.split(':').map(Number); const mer=h>=12?'PM':'AM'; let hr=h%12; if(!hr)hr=12; return `${hr}${m?':'+String(m).padStart(2,'0'):''} ${mer}` }
  const colFor   = s => ({ Mathematics:'#8B1A2E',Maths:'#8B1A2E',Physics:'#1E3A8A',Chemistry:'#166534',Biology:'#7C2D12',English:'#6B21A8','English Language':'#6B21A8',Literature:'#A21CAF',History:'#92400E',Geography:'#0F766E','Computer Science':'#1F2937','Business Studies':'#7E22CE',Economics:'#9F1239',French:'#1D4ED8',Kiswahili:'#065F46' })[s] || '#8B1A2E'

  useEffect(() => {
    api.get('/users', { params:{ limit:200 } })
      .then(r => {
        const all = r.data?.users || r.data?.data?.users || []
        setTeachers(all.filter(u=>u.role==='teacher'))
        setStudents(all.filter(u=>u.role==='student'))
      })
      .catch(() => {})
  }, [refreshKey])

  const loadUserTimetable = async (u) => {
    setChosenUser(u); setEntries([]); setLoading(true); setView('grid')
    try {
      const path = u.role==='teacher' ? '/timetable/teacher/'+u._id : '/timetable/student/'+u._id
      const { data } = await api.get(path)
      setEntries(data?.data?.entries || data?.entries || [])
    } catch(e) { toast?.error?.('Could not load timetable: '+(e?.response?.data?.message||e.message)) }
    finally { setLoading(false) }
  }

  const openEdit = (entry) => {
    setSelected(entry)
    setEditData({ title:entry.title||'', subject:entry.subject||'', dayOfWeek:entry.dayOfWeek||'Mon', startTime:entry.startTime||'09:00', endTime:entry.endTime||'10:00', deliveryMode:entry.deliveryMode||'virtual', notes:entry.notes||'' })
    setView('edit')
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      await api.patch('/timetable/'+selected._id, editData)
      toast?.ok?.('Timetable updated.')
      loadUserTimetable(chosenUser)
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Could not update.') }
    finally { setSaving(false) }
  }

  // Build slot grid from entries
  const byDay = {}
  DAYS.forEach(d => { byDay[d] = [] })
  entries.forEach(e => { if (byDay[e.dayOfWeek]) byDay[e.dayOfWeek].push(e) })
  DAYS.forEach(d => byDay[d].sort((a,b)=>toMins(a.startTime)-toMins(b.startTime)))
  const entryForSlot = (day, slot) => byDay[day].filter(e => toMins(e.startTime)>=toMins(slot.start) && toMins(e.startTime)<toMins(slot.end))

  const inp2 = { width:'100%', padding:'9px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit', boxSizing:'border-box' }

  // ── Edit view ────────────────────────────────────────────
  if (view==='edit' && editData) {
    return (
      <>
        <button onClick={()=>setView('grid')} style={{ background:'transparent', border:'none', cursor:'pointer', color:TOKENS.crimson, fontSize:12.5, fontWeight:700, padding:0, marginBottom:16 }}>← Back to timetable</button>
        <h2 style={{ fontSize:20, fontWeight:800, color:TOKENS.s900, marginBottom:18 }}>Edit Timetable Entry</h2>
        <div className="card" style={{ padding:22, maxWidth:540 }}>
          <div style={{ display:'grid', gap:14 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4, display:'block' }}>Title</label>
              <input value={editData.title} onChange={e=>setEditData(p=>({...p,title:e.target.value}))} style={inp2}/>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4, display:'block' }}>Subject</label>
              <input value={editData.subject} onChange={e=>setEditData(p=>({...p,subject:e.target.value}))} style={inp2}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4, display:'block' }}>Day</label>
                <select value={editData.dayOfWeek} onChange={e=>setEditData(p=>({...p,dayOfWeek:e.target.value}))} style={inp2}>
                  {DAYS.map(d=><option key={d} value={d}>{d} — {DAY_TYPE[d]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4, display:'block' }}>Start time</label>
                <select value={editData.startTime} onChange={e=>setEditData(p=>({...p,startTime:e.target.value}))} style={inp2}>
                  {['09:00','10:00','11:00','12:00','14:00','15:00'].map(t=><option key={t} value={t}>{fmt(t)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4, display:'block' }}>End time</label>
                <select value={editData.endTime} onChange={e=>setEditData(p=>({...p,endTime:e.target.value}))} style={inp2}>
                  {['10:00','11:00','12:00','13:00','15:00','16:00'].map(t=><option key={t} value={t}>{fmt(t)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4, display:'block' }}>Delivery mode</label>
              <select value={editData.deliveryMode} onChange={e=>setEditData(p=>({...p,deliveryMode:e.target.value}))} style={inp2}>
                {['virtual','in-person','hybrid'].map(m=><option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4, display:'block' }}>Notes</label>
              <textarea value={editData.notes} onChange={e=>setEditData(p=>({...p,notes:e.target.value}))} rows={2} style={{ ...inp2, resize:'vertical' }}/>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:18 }}>
            <button onClick={saveEdit} disabled={saving} style={{ background:saving?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', padding:'10px 24px', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>{saving?'Saving...':'Save changes'}</button>
            <button onClick={()=>setView('grid')} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s500, padding:'10px 18px', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      </>
    )
  }

  // ── Grid view — premium timetable matching student portal ─
  if (view==='grid' && chosenUser) {
    const isTeacher = chosenUser.role==='teacher'
    const prog      = chosenUser.programme || (isTeacher ? 'Teacher' : chosenUser.deliveryMode || 'Student')
    const totalClasses = entries.length

    return (
      <>
        <button onClick={()=>{ setView('picker'); setChosenUser(null); setEntries([]) }}
          style={{ background:'transparent', border:'none', cursor:'pointer', color:TOKENS.crimson, fontSize:12.5, fontWeight:700, padding:0, marginBottom:16 }}>
          ← Back to picker
        </button>

        {/* Premium header — mirrors student portal */}
        <div style={{
          background:'linear-gradient(135deg,#7D1025 0%,#5A0B1B 60%,#3D0712 100%)',
          borderRadius:16, overflow:'hidden', marginBottom:20,
          boxShadow:'0 8px 32px rgba(125,16,37,.25)',
        }}>
          <div style={{ display:'flex', alignItems:'stretch' }}>
            {/* Photo */}
            <div style={{ width:150, flexShrink:0, position:'relative', overflow:'hidden' }}>
              {chosenUser.avatar ? (
                <img src={chosenUser.avatar} alt={chosenUser.firstName}
                  style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', minHeight:150 }}/>
              ) : (
                <div style={{ width:'100%', minHeight:150, background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              )}
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, transparent 60%, #7D1025)' }}/>
            </div>

            {/* Info */}
            <div style={{ flex:1, padding:'20px 22px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'#C9A030', marginBottom:6 }}>
                {isTeacher ? 'Teacher' : 'Student'} Timetable
              </div>
              <h2 style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:26, fontWeight:400, color:'#fff', margin:'0 0 6px', letterSpacing:'-.3px' }}>
                {chosenUser.firstName} {chosenUser.lastName}
              </h2>
              <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:8 }}>
                {chosenUser.curriculum && <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,.7)', textTransform:'uppercase', letterSpacing:'.08em' }}>{chosenUser.curriculum}</span>}
                {(chosenUser.gradeLevel||chosenUser.grade) && <span style={{ fontSize:12, color:'rgba(255,255,255,.5)' }}>{chosenUser.gradeLevel||chosenUser.grade}</span>}
                <span style={{ fontSize:12, color:'rgba(255,255,255,.45)', textTransform:'capitalize' }}>{prog}</span>
              </div>
              {/* Legend */}
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                {[{ label:'Lesson', color:'#8B1A2E' },{ label:'Fri: Assessment/Activities', color:FRI_COL }].map(l=>(
                  <div key={l.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'rgba(255,255,255,.55)' }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:l.color }}/>
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{ width:120, flexShrink:0, background:'rgba(0,0,0,.2)', padding:'18px 14px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', borderLeft:'1px solid rgba(255,255,255,.1)' }}>
              <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.45)', marginBottom:6 }}>Weekly slots</div>
              <div style={{ fontSize:28, fontWeight:800, color:'#C9A030' }}>{totalClasses}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', marginTop:6 }}>9 AM – 3 PM</div>
              <div style={{ fontSize:9.5, color:'rgba(255,255,255,.35)', marginTop:2 }}>Lunch 1–2 PM</div>
            </div>
          </div>
        </div>

        {loading ? <DOSSpinner/> : entries.length===0 ? (
          <div style={{ padding:32, background:TOKENS.cream, border:'1px solid '+TOKENS.line, borderRadius:10, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>
            No timetable entries found for {chosenUser.firstName}.
          </div>
        ) : (
          <div style={{ background:'#fff', border:'1px solid #E8E2D6', borderRadius:12, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,.06)' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width:64, padding:'10px 12px', background:'#1A0F0E', fontSize:10.5, fontWeight:700, color:'rgba(255,255,255,.5)', textAlign:'center', borderRight:'1px solid rgba(255,255,255,.1)' }}>Time</th>
                  {DAYS.map(d=>(
                    <th key={d} style={{
                      padding:'10px 12px',
                      background: d==='Fri'?'#3D0A4A':'#1A0F0E',
                      fontSize:11, fontWeight:800,
                      color:'rgba(255,255,255,.85)',
                      textAlign:'center', borderRight:'1px solid rgba(255,255,255,.08)',
                      letterSpacing:'.05em',
                    }}>
                      <div>{DAY_LONG[d]}</div>
                      <div style={{ fontSize:9, fontWeight:500, color:d==='Fri'?'rgba(180,150,220,.7)':'rgba(255,255,255,.4)', marginTop:2 }}>{DAY_TYPE[d]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SLOTS.map(slot=>(
                  <tr key={slot.label} style={{ borderBottom:'1px solid #F4EFEB' }}>
                    <td style={{
                      padding:'6px 10px', textAlign:'center', verticalAlign:'middle',
                      background:slot.isBreak?'#FFFBF0':TOKENS.cream,
                      borderRight:'1px solid #E8E2D6',
                      fontSize:11, fontWeight:700,
                      color:slot.isBreak?'#D97706':'#857973',
                      whiteSpace:'nowrap',
                    }}>
                      {slot.isBreak ? (
                        <div>
                          <div style={{ fontSize:9.5, letterSpacing:'.08em', color:'#D97706' }}>LUNCH</div>
                          <div style={{ fontSize:9, color:'#D97706', opacity:.7 }}>1–2 PM</div>
                        </div>
                      ) : slot.label}
                    </td>
                    {DAYS.map(day=>{
                      if (slot.isBreak) return (
                        <td key={day} style={{ background:'#FFFBF0', borderRight:'1px solid #F4EFEB', padding:'6px', textAlign:'center' }}>
                          <span style={{ fontSize:9.5, color:'#D97706', fontWeight:600 }}>Lunch break</span>
                        </td>
                      )
                      const cellEntries = entryForSlot(day, slot)
                      const isFri = day==='Fri'
                      return (
                        <td key={day} style={{
                          padding:4, verticalAlign:'top',
                          background:isFri?'#FAF5FF':'#fff',
                          borderRight:'1px solid #F4EFEB',
                          minWidth:120, minHeight:60,
                        }}>
                          {cellEntries.map(e=>{
                            const col = isFri ? FRI_COL : colFor(e.subject)
                            return (
                              <div key={e._id} style={{
                                background:col+'12', border:`1.5px solid ${col}30`,
                                borderLeft:`3px solid ${col}`,
                                borderRadius:7, padding:'7px 9px', marginBottom:3,
                                cursor:'pointer',
                                transition:'transform .12s, box-shadow .12s',
                              }}
                                onMouseEnter={ev=>{ ev.currentTarget.style.transform='translateY(-1px)'; ev.currentTarget.style.boxShadow=`0 4px 12px ${col}25` }}
                                onMouseLeave={ev=>{ ev.currentTarget.style.transform='translateY(0)'; ev.currentTarget.style.boxShadow='none' }}>
                                <div style={{ fontSize:12, fontWeight:700, color:col, lineHeight:1.25, marginBottom:2 }}>{e.subject||e.title}</div>
                                <div style={{ fontSize:10, color:col+'99' }}>{fmt(e.startTime)}–{fmt(e.endTime)}</div>
                                {!isTeacher && e.teacherId && (
                                  <div style={{ fontSize:9.5, color:col+'80', marginTop:1 }}>
                                    {e.teacherId?.firstName||''} {(e.teacherId?.lastName||'')[0]||''}.
                                  </div>
                                )}
                                {isTeacher && e.assignedStudents?.length > 0 && (
                                  <div style={{ fontSize:9.5, color:col+'70', marginTop:1 }}>
                                    {e.assignedStudents.length} student{e.assignedStudents.length>1?'s':''}
                                  </div>
                                )}
                                <div style={{ fontSize:9, color:col+'60', marginTop:1, textTransform:'capitalize' }}>{e.deliveryMode}</div>
                                <button onClick={()=>openEdit(e)} style={{
                                  marginTop:4, fontSize:9.5, color:col, background:'transparent', border:'none',
                                  cursor:'pointer', fontWeight:700, padding:0, textDecoration:'underline',
                                }}>Edit</button>
                              </div>
                            )
                          })}
                          {!cellEntries.length && (
                            <div style={{ fontSize:10, color:TOKENS.s200, textAlign:'center', paddingTop:10 }}>—</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    )
  }

  // ── Picker view ──────────────────────────────────────────
  const filtStudents = students.filter(u=>!search||(u.firstName+' '+u.lastName).toLowerCase().includes(search.toLowerCase())||(u.admissionNo||u.admissionNumber||'').includes(search))

  return (
    <>
      <PSection tag="Dean of Studies" title="Timetable" em="Manager"
        sub="Click any teacher or student to view their weekly schedule. School hours 9 AM–3 PM, lunch 1–2 PM. Mon–Thu: Lessons. Fri: Assessment & Activities."/>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Teachers */}
        <div className="card" style={{ padding:18 }}>
          <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:12 }}>Teacher timetables</div>
          <div style={{ display:'flex', flexDirection:'column', gap:5, maxHeight:360, overflowY:'auto' }}>
            {teachers.map(u=>(
              <button key={u._id} onClick={()=>loadUserTimetable(u)}
                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:8, border:'1px solid '+TOKENS.line, background:'#fff', cursor:'pointer', textAlign:'left' }}
                onMouseEnter={e=>e.currentTarget.style.background=TOKENS.cream}
                onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {u.avatar ? (
                    <img src={u.avatar} alt="" style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover', flexShrink:0 }}/>
                  ) : (
                    <div style={{ width:36, height:36, borderRadius:'50%', background:TOKENS.cream, border:'1px solid '+TOKENS.line, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TOKENS.s400} strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900 }}>{u.firstName} {u.lastName}</div>
                    <div style={{ fontSize:11, color:TOKENS.s500 }}>{(u.teachingSpecialties||[]).map(s=>s.subject||s.subjectId?.subjectName||'').filter(Boolean).slice(0,2).join(', ')||u.email}</div>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TOKENS.crimson} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
            {!teachers.length && <div style={{ fontSize:12.5, color:TOKENS.s400, textAlign:'center', padding:'16px 0' }}>No teachers found.</div>}
          </div>
        </div>

        {/* Students */}
        <div className="card" style={{ padding:18 }}>
          <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:8 }}>Student timetables</div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or admission no..."
            style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, marginBottom:10, fontFamily:'inherit', boxSizing:'border-box' }}/>
          <div style={{ display:'flex', flexDirection:'column', gap:5, maxHeight:300, overflowY:'auto' }}>
            {filtStudents.map(u=>(
              <button key={u._id} onClick={()=>loadUserTimetable(u)}
                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:8, border:'1px solid '+TOKENS.line, background:'#fff', cursor:'pointer', textAlign:'left' }}
                onMouseEnter={e=>e.currentTarget.style.background=TOKENS.cream}
                onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {u.avatar ? (
                    <img src={u.avatar} alt="" style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover', flexShrink:0 }}/>
                  ) : (
                    <div style={{ width:36, height:36, borderRadius:'50%', background:TOKENS.cream, border:'1px solid '+TOKENS.line, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TOKENS.s400} strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900 }}>{u.firstName} {u.lastName}</div>
                    <div style={{ fontSize:11, color:TOKENS.s500 }}>{u.curriculum} · {u.gradeLevel||u.grade} · {u.admissionNo||u.admissionNumber||'—'}</div>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TOKENS.crimson} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
            {!filtStudents.length && <div style={{ fontSize:12.5, color:TOKENS.s400, textAlign:'center', padding:'16px 0' }}>No students found.</div>}
          </div>
        </div>
      </div>

      {/* Schedule info */}
      <div style={{ marginTop:14, display:'flex', gap:16, flexWrap:'wrap', padding:'10px 16px', background:TOKENS.cream, borderRadius:8, border:'1px solid '+TOKENS.line, fontSize:12.5, color:TOKENS.s600 }}>
        {[
          { label:'School hours', val:'9:00 AM – 3:00 PM' },
          { label:'Lunch break', val:'1:00 – 2:00 PM' },
          { label:'Mon – Thu', val:'Lessons' },
          { label:'Friday', val:'Assessment & Activities', color:FRI_COL },
        ].map(k=>(
          <div key={k.label} style={{ display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.06em' }}>{k.label}</span>
            <span style={{ color:k.color||TOKENS.s700, fontWeight:600 }}>{k.val}</span>
          </div>
        ))}
      </div>
    </>
  )
}


function ReportsModule({ toast, refreshKey }) {
  const [view, setView] = useState('list') // list | generate | detail
  const [selected, setSelected] = useState(null)
  return (
    <>
      <PSection tag="Academic" title="Student" em="Reports"
        sub="Generate end-of-term reports with auto-calculated scores and attendance."/>
      {view === 'list'     && <ReportList     toast={toast} refreshKey={refreshKey}
                                onOpen={r => { setSelected(r); setView('detail') }}
                                onNew={() => setView('generate')}/>}
      {view === 'generate' && <ReportGenerator toast={toast}
                                onBack={() => setView('list')}
                                onSaved={r => { setSelected(r); setView('detail') }}/>}
      {view === 'detail'   && <ReportDetail   toast={toast} report={selected}
                                onBack={() => { setSelected(null); setView('list') }}/>}
    </>
  )
}

// ── List ───────────────────────────────────────────────────
function ReportList({ toast, refreshKey, onOpen, onNew }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [termF,   setTermF]   = useState('all')
  const [yearF,   setYearF]   = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(() => {
    setLoading(true)
    const params = { page, limit: 30 }
    if (termF !== 'all') params.term = termF
    if (yearF) params.academicYear = yearF
    api.get('/reports', { params })
      .then(r => { setReports(r.data?.data?.reports || []); setTotalPages(r.data?.data?.totalPages||1) })
      .catch(() => toast?.error?.('Failed to load reports.'))
      .finally(() => setLoading(false))
  }, [termF, yearF, page])

  useEffect(() => { load() }, [load, refreshKey])

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'

  const GRADE_COLORS = {
    'A*':'#065F46','A':'#065F46','B':'#1E40AF','C':'#92400E',
    'D':'#6B21A8','E':'#9A3412','U':'#991B1B',
  }

  const filtered = reports.filter(r => {
    if (!search) return true
    const name = (r.studentId?.firstName + ' ' + r.studentId?.lastName).toLowerCase()
    return name.includes(search.toLowerCase())
  })

  return (
    <>
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student name..."
          style={{ flex:'1 1 200px', padding:'8px 12px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13 }}/>
        <select value={termF} onChange={e=>setTermF(e.target.value)}
          style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5 }}>
          <option value="all">All terms</option>
          <option value="1">Term 1</option>
          <option value="2">Term 2</option>
          <option value="3">Term 3</option>
        </select>
        <input value={yearF} onChange={e=>setYearF(e.target.value)} placeholder="Year e.g. 2025/2026"
          style={{ width:140, padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5 }}/>
        <button onClick={onNew} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
          + Generate report
        </button>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:30, textAlign:'center', color:TOKENS.s500, fontSize:13 }}>Loading reports...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:40, textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:10 }}>📋</div>
            <div style={{ fontSize:14, fontWeight:700, color:TOKENS.s900, marginBottom:4 }}>No reports yet</div>
            <div style={{ fontSize:12.5, color:TOKENS.s500 }}>Click "+ Generate report" to create your first.</div>
          </div>
        ) : (
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Student','Curriculum','Year/Grade','Term','Academic Year','Mean Grade','Avg Score','Status','Date Issued',''].map(h=>(
                <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:11 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(r => {
                const gc = GRADE_COLORS[r.meanGrade] || TOKENS.s700
                return (
                  <tr key={r._id} style={{ borderTop:'1px solid '+TOKENS.line, cursor:'pointer' }}
                    onMouseEnter={e=>e.currentTarget.style.background=TOKENS.cream}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    onClick={() => onOpen(r)}>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900 }}>
                        {r.studentId?.firstName} {r.studentId?.lastName}
                      </div>
                      <div style={{ fontSize:11, color:TOKENS.s500 }}>Adm: {r.admissionNo}</div>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s700 }}>{r.curriculum}</td>
                    <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s700 }}>{r.yearGrade}</td>
                    <td style={{ padding:'10px 14px', fontSize:12.5 }}>Term {r.term}</td>
                    <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s500 }}>{r.academicYear}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:99, background:gc+'15', color:gc, fontSize:12, fontWeight:800 }}>
                        {r.meanGrade || '—'}
                      </span>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:TOKENS.s900 }}>
                      {r.overallAverage !== null ? r.overallAverage+'%' : '—'}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700,
                        background:r.status==='published'?'#D1FAE5':'#FEF3C7',
                        color:r.status==='published'?'#065F46':'#92400E' }}>
                        {r.status==='published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:11.5, color:TOKENS.s500, whiteSpace:'nowrap' }}>{fmtDate(r.dateIssued)}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={TOKENS.crimson} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:12 }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}
            style={{ padding:'6px 13px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page<=1?'not-allowed':'pointer', opacity:page<=1?.5:1 }}>‹</button>
          <span style={{ padding:'6px 12px', fontSize:12.5, color:TOKENS.s700 }}>Page {page} / {totalPages}</span>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}
            style={{ padding:'6px 13px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page>=totalPages?'not-allowed':'pointer', opacity:page>=totalPages?.5:1 }}>›</button>
        </div>
      )}
    </>
  )
}

// ── Generator form ─────────────────────────────────────────
function ReportGenerator({ toast, onBack, onSaved }) {
  const today = new Date()
  const [students, setStudents] = useState([])
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [preview,  setPreview]  = useState(null) // computed subject scores from API

  const currentYear = today.getFullYear()
  const [f, setF] = useState({
    studentId: '',
    academicYear: `${currentYear-1}/${currentYear}`,
    term: '3',
    termLabel: 'Term 3 · Final Term',
    termStart: `${currentYear}-01-15`,
    termEnd:   `${currentYear}-04-15`,
    scheduledDays: '60',
    classTeacher: '',
    classStream: '',
    programme: '',
    // Subject comments: { [subject]: { comment, initials, teacherId } }
    subjectComments: {},
    learningHabits: {
      effort:4, participation:3, homework:3, organisation:3,
      conduct:4, collaboration:3, feedback:3, digital:3,
    },
    coCurricular: '',
    agreedTargets: ['', '', ''],
    classTeacherReport: '',
    hodRemarks: '',
    issuedBy: 'Ms. Brendaliz Chelangat — Head of Academics',
    promotionDecision: '',
    nextTermStart: '',
    reportingTime: '',
  })

  const set = (k,v) => setF(p=>({...p,[k]:v}))

  useEffect(() => {
    api.get('/users', { params: { role:'student', limit:200 } })
      .then(r => setStudents(r.data?.data?.users || r.data?.users || []))
      .catch(() => {})
  }, [])

  // When student+term is chosen, fetch preview of exam scores
  useEffect(() => {
    if (!f.studentId || !f.termStart || !f.termEnd) return
    setPreview(null)
    api.get('/reports/preview', { params: {
      studentId: f.studentId,
      termStart: f.termStart,
      termEnd: f.termEnd,
    }}).then(r => {
      setPreview(r.data?.data)
      // Pre-fill subjectComments keys
      const subjects = r.data?.data?.subjects || []
      setF(p => ({
        ...p,
        subjectComments: subjects.reduce((acc, s) => ({
          ...acc,
          [s.subject]: p.subjectComments[s.subject] || { comment:'', initials:'', teacherId:'' }
        }), p.subjectComments)
      }))
    }).catch(() => {})
  }, [f.studentId, f.termStart, f.termEnd])

  const generate = async () => {
    setError('')
    if (!f.studentId) { setError('Select a student.'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/reports/generate', {
        ...f,
        term: parseInt(f.term),
        scheduledDays: parseInt(f.scheduledDays) || 60,
        agreedTargets: f.agreedTargets.filter(Boolean),
      })
      if (data.success) {
        toast?.ok?.('Report generated.')
        onSaved(data.data.report)
      } else {
        setError(data.message || 'Generation failed.')
      }
    } catch(e) {
      setError(e?.response?.data?.message || 'Could not generate report.')
    } finally { setSaving(false) }
  }

  const inp  = { width:'100%', boxSizing:'border-box', padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }
  const lbl  = { fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4, display:'block' }
  const card = { background:'#fff', border:'1px solid '+TOKENS.line, borderRadius:12, padding:18, marginBottom:14 }

  const HABIT_LABELS = [
    ['effort','Effort & diligence'],
    ['participation','Class participation'],
    ['homework','Homework completion'],
    ['organisation','Organisation & study'],
    ['conduct','Conduct & courtesy'],
    ['collaboration','Collaboration'],
    ['feedback','Responsiveness to feedback'],
    ['digital','Digital learning discipline'],
  ]
  const HABIT_OPTS = ['Concern','Developing','Good','Excellent']

  return (
    <>
      <button onClick={onBack} style={{ background:'transparent', border:'none', cursor:'pointer', color:TOKENS.crimson, fontSize:12.5, fontWeight:700, display:'flex', alignItems:'center', gap:5, padding:0, marginBottom:16 }}>
        ← Back to reports
      </button>
      <h2 className="serif" style={{ fontSize:22, color:TOKENS.s900, margin:'0 0 20px' }}>Generate Academic Report</h2>

      {error && <div style={{ background:'#FDE7EC', border:'1px solid #F8B4C0', borderRadius:8, padding:'10px 14px', fontSize:13, color:TOKENS.crimson, marginBottom:16 }}>{error}</div>}

      {/* Student & Term */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:14 }}>Student & Term</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
          <div>
            <label style={lbl}>Student *</label>
            <select value={f.studentId} onChange={e=>set('studentId',e.target.value)} style={inp}>
              <option value="">Select student...</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>{s.firstName} {s.lastName} {s.admissionNo?'('+s.admissionNo+')':''}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={lbl}>Academic Year</label>
            <input value={f.academicYear} onChange={e=>set('academicYear',e.target.value)} placeholder="2025/2026" style={inp}/>
          </div>
          <div>
            <label style={lbl}>Term</label>
            <select value={f.term} onChange={e=>set('term',e.target.value)} style={inp}>
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
              <option value="3">Term 3 (Final)</option>
            </select>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12 }}>
          <div>
            <label style={lbl}>Term label</label>
            <input value={f.termLabel} onChange={e=>set('termLabel',e.target.value)} style={inp}/>
          </div>
          <div>
            <label style={lbl}>Term start date</label>
            <input type="date" value={f.termStart} onChange={e=>set('termStart',e.target.value)} style={inp}/>
          </div>
          <div>
            <label style={lbl}>Term end date</label>
            <input type="date" value={f.termEnd} onChange={e=>set('termEnd',e.target.value)} style={inp}/>
          </div>
          <div>
            <label style={lbl}>Scheduled days</label>
            <input type="number" value={f.scheduledDays} onChange={e=>set('scheduledDays',e.target.value)} style={inp}/>
          </div>
        </div>
      </div>

      {/* Class info */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:14 }}>Class Information</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          <div><label style={lbl}>Class teacher</label><input value={f.classTeacher} onChange={e=>set('classTeacher',e.target.value)} placeholder="e.g. Cynthia Kemunto" style={inp}/></div>
          <div><label style={lbl}>Class / stream</label><input value={f.classStream} onChange={e=>set('classStream',e.target.value)} placeholder="e.g. A or —" style={inp}/></div>
          <div><label style={lbl}>Programme</label><input value={f.programme} onChange={e=>set('programme',e.target.value)} placeholder="e.g. In-Person (Centre)" style={inp}/></div>
        </div>
      </div>

      {/* Subject scores preview + teacher comments */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:6 }}>Subject Scores & Teacher Comments</div>
        <div style={{ fontSize:11.5, color:TOKENS.s500, marginBottom:14 }}>
          Pulled from LMS exams in the selected date range. Weekly average (30%) + End-term (70%) = weighted score.
        </div>

        {!f.studentId ? (
          <div style={{ padding:20, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Select a student first.</div>
        ) : !preview ? (
          <div style={{ padding:20, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Loading exam data...</div>
        ) : preview.subjects?.length === 0 ? (
          <div style={{ padding:16, background:'#FEF9C3', borderRadius:8, fontSize:13, color:'#92400E' }}>
            No graded exams found for this student in the selected date range. You can still generate the report — add comments below and scores will show as "—".
          </div>
        ) : null}

        {(preview?.subjects || []).length > 0 && (
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
            <thead>
              <tr style={{ background:TOKENS.cream }}>
                {['Subject','Weekly avg (30%)','End-term (70%)','Weighted','Grade'].map(h=>(
                  <th key={h} style={{ padding:'7px 10px', fontSize:10.5, fontWeight:700, textAlign:h==='Subject'?'left':'center', color:TOKENS.crimson, letterSpacing:'.04em', textTransform:'uppercase', borderBottom:'1.5px solid '+TOKENS.line }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(preview?.subjects || []).map(s => (
                <tr key={s.subject} style={{ borderBottom:'1px solid '+TOKENS.line }}>
                  <td style={{ padding:'8px 10px', fontWeight:700, fontSize:13 }}>{s.subject}</td>
                  <td style={{ padding:'8px 10px', textAlign:'center', fontSize:12.5 }}>
                    {s.missedWeekly ? <span style={{ color:'#9A2434', fontStyle:'italic', fontSize:11 }}>Missed</span> : (s.weeklyAverage !== null ? s.weeklyAverage+'%' : '—')}
                  </td>
                  <td style={{ padding:'8px 10px', textAlign:'center', fontSize:12.5 }}>
                    {s.missedEndTerm ? <span style={{ color:TOKENS.s400, fontSize:11 }}>—</span> : (s.endTermScore !== null ? s.endTermScore+'%' : '—')}
                  </td>
                  <td style={{ padding:'8px 10px', textAlign:'center', fontWeight:700, fontSize:13 }}>
                    {s.weightedScore !== null ? s.weightedScore+'%' : '—'}
                  </td>
                  <td style={{ padding:'8px 10px', textAlign:'center' }}>
                    <span style={{ padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:800,
                      background:s.letterGrade==='U'?'#FEE2E2':s.letterGrade==='A*'||s.letterGrade==='A'?'#D1FAE5':'#EFF6FF',
                      color:s.letterGrade==='U'?'#991B1B':s.letterGrade==='A*'||s.letterGrade==='A'?'#065F46':'#1E40AF',
                    }}>{s.letterGrade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Teacher comments per subject */}
        {Object.keys(f.subjectComments).map(subj => (
          <div key={subj} style={{ background:TOKENS.cream, borderRadius:8, padding:12, marginBottom:10, border:'1px solid '+TOKENS.line }}>
            <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:8 }}>{subj} — Teacher comment</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 80px', gap:8 }}>
              <textarea value={f.subjectComments[subj]?.comment||''} rows={2}
                onChange={e => setF(p=>({...p, subjectComments:{...p.subjectComments,[subj]:{...p.subjectComments[subj],comment:e.target.value}}}))}
                placeholder="Teacher's comment for this subject..."
                style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}/>
              <input value={f.subjectComments[subj]?.initials||''} placeholder="Init."
                onChange={e => setF(p=>({...p, subjectComments:{...p.subjectComments,[subj]:{...p.subjectComments[subj],initials:e.target.value}}}))}
                style={{ ...inp, textAlign:'center', fontWeight:700 }}/>
            </div>
          </div>
        ))}

        {/* Add subject manually */}
        <button onClick={() => {
          const s = prompt('Subject name:')
          if (s?.trim()) setF(p=>({...p, subjectComments:{...p.subjectComments,[s.trim()]:{comment:'',initials:'',teacherId:''}}}))
        }} style={{ background:'transparent', border:'1.5px dashed '+TOKENS.line, color:TOKENS.s500, padding:'6px 14px', borderRadius:7, fontSize:12, cursor:'pointer' }}>
          + Add subject manually
        </button>
      </div>

      {/* Learning Habits */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:14 }}>Learning Habits & Personal Development</div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:TOKENS.cream }}>
              <th style={{ padding:'7px 10px', textAlign:'left', fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.04em', width:'45%' }}>Area</th>
              {HABIT_OPTS.map(o=><th key={o} style={{ padding:'7px 10px', fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.04em', textAlign:'center' }}>{o}</th>)}
            </tr>
          </thead>
          <tbody>
            {HABIT_LABELS.map(([key, label], i) => (
              <tr key={key} style={{ borderTop:'1px solid '+TOKENS.line, background:i%2===0?'transparent':TOKENS.cream }}>
                <td style={{ padding:'8px 10px', fontSize:12.5 }}>{label}</td>
                {[4,3,2,1].map(val => (
                  <td key={val} style={{ padding:'8px 10px', textAlign:'center' }}>
                    <input type="radio" name={key} value={val}
                      checked={f.learningHabits[key]===val}
                      onChange={() => setF(p=>({...p, learningHabits:{...p.learningHabits,[key]:val}}))}
                      style={{ accentColor:TOKENS.crimson, cursor:'pointer', width:16, height:16 }}/>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Co-curricular + targets */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:12 }}>Co-Curricular & Targets</div>
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Co-curricular participation & achievements</label>
          <textarea value={f.coCurricular} onChange={e=>set('coCurricular',e.target.value)} rows={3}
            placeholder="e.g. Football — regular participant. Head of Students' Co-Curricular Activities."
            style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}/>
        </div>
        <div>
          <label style={lbl}>Agreed targets (with student)</label>
          {f.agreedTargets.map((t,i) => (
            <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
              <span style={{ fontSize:12, color:TOKENS.s500, paddingTop:9 }}>{i+1}.</span>
              <input value={t} onChange={e=>setF(p=>({...p,agreedTargets:p.agreedTargets.map((v,j)=>j===i?e.target.value:v)}))}
                placeholder={`Target ${i+1}, e.g. Mathematics — 60%`} style={{ ...inp, flex:1 }}/>
            </div>
          ))}
          <button onClick={()=>setF(p=>({...p,agreedTargets:[...p.agreedTargets,'']}))}
            style={{ background:'transparent', border:'none', color:TOKENS.crimson, cursor:'pointer', fontSize:12, fontWeight:700 }}>
            + Add target
          </button>
        </div>
      </div>

      {/* Teacher + HoD remarks */}
      <div style={card}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:12 }}>Remarks</div>
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Class teacher's report</label>
          <textarea value={f.classTeacherReport} onChange={e=>set('classTeacherReport',e.target.value)} rows={4}
            placeholder="Class teacher's narrative for this student this term..."
            style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}/>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Head of Academics' remarks</label>
          <textarea value={f.hodRemarks} onChange={e=>set('hodRemarks',e.target.value)} rows={4}
            placeholder="HoD's remarks..."
            style={{ ...inp, resize:'vertical', fontFamily:'inherit' }}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          <div><label style={lbl}>Issued by</label><input value={f.issuedBy} onChange={e=>set('issuedBy',e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Next term start</label><input value={f.nextTermStart} onChange={e=>set('nextTermStart',e.target.value)} placeholder="e.g. 10 September 2026" style={inp}/></div>
          <div><label style={lbl}>Reporting time</label><input value={f.reportingTime} onChange={e=>set('reportingTime',e.target.value)} placeholder="e.g. 7:30 AM" style={inp}/></div>
        </div>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={generate} disabled={saving} style={{ background:saving?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', padding:'12px 28px', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
          {saving ? 'Generating...' : 'Generate & save report'}
        </button>
        <button onClick={onBack} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s500, padding:'12px 20px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>Cancel</button>
      </div>
    </>
  )
}

// ── Detail / viewer ─────────────────────────────────────────
function ReportDetail({ toast, report: initialReport, onBack }) {
  const [report, setReport] = useState(initialReport)
  const [publishing, setPublishing] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) : '—'

  const downloadPdf = async () => {
    setLoadingPdf(true)
    try {
      const { data } = await api.get('/reports/'+report._id+'/pdf-html')
      if (data.success) {
        const w = window.open('','_blank')
        if (!w) { toast?.error?.('Allow pop-ups to open the report.'); return }
        w.document.write(data.data.html)
        w.document.close()
      }
    } catch { toast?.error?.('Could not load report PDF.') }
    finally { setLoadingPdf(false) }
  }

  const publish = async () => {
    setPublishing(true)
    try {
      const { data } = await api.patch('/reports/'+report._id, { status:'published' })
      if (data.success) { setReport(data.data.report); toast?.ok?.('Report published.') }
    } catch { toast?.error?.('Could not publish.') }
    finally { setPublishing(false) }
  }

  const GRADE_COLORS = { 'A*':'#065F46','A':'#065F46','B':'#1E40AF','C':'#92400E','D':'#6B21A8','E':'#9A3412','U':'#991B1B' }
  const gc = GRADE_COLORS[report.meanGrade] || TOKENS.s700

  return (
    <>
      <button onClick={onBack} style={{ background:'transparent', border:'none', cursor:'pointer', color:TOKENS.crimson, fontSize:12.5, fontWeight:700, display:'flex', alignItems:'center', gap:5, padding:0, marginBottom:16 }}>
        ← Back to reports
      </button>

      {/* Header card */}
      <div className="card" style={{ padding:22, marginBottom:16, background:'linear-gradient(135deg,#7D1025,#5A0B1B)', color:'#fff' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.55)', marginBottom:8 }}>
              {report.termLabel} · {report.academicYear}
            </div>
            <h2 className="serif" style={{ fontSize:26, color:'#fff', margin:'0 0 6px' }}>{report.studentName}</h2>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.7)' }}>
              {report.curriculum} · {report.yearGrade} · Adm: {report.admissionNo}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:40, fontWeight:900, color:'#C9A030', lineHeight:1 }}>{report.meanGrade || '—'}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.55)', marginTop:4 }}>Mean Grade</div>
            {report.overallAverage !== null && (
              <div style={{ fontSize:18, fontWeight:700, color:'#fff', marginTop:4 }}>{report.overallAverage}%</div>
            )}
          </div>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:16, flexWrap:'wrap' }}>
          <button onClick={downloadPdf} disabled={loadingPdf} style={{ background:'#C9A030', color:'#7D1025', border:'none', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:800, cursor:loadingPdf?'not-allowed':'pointer' }}>
            {loadingPdf ? 'Loading...' : '⬇ Download PDF'}
          </button>
          {report.status === 'draft' && (
            <button onClick={publish} disabled={publishing} style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'1.5px solid rgba(255,255,255,.3)', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:publishing?'not-allowed':'pointer' }}>
              {publishing ? 'Publishing...' : '✓ Publish report'}
            </button>
          )}
          {report.status === 'published' && (
            <span style={{ padding:'9px 14px', background:'rgba(34,197,94,.2)', borderRadius:7, fontSize:12, fontWeight:700, color:'#6EE7B7' }}>✓ Published</span>
          )}
        </div>
      </div>

      {/* Attendance */}
      <div className="card" style={{ padding:18, marginBottom:14 }}>
        <div style={{ fontSize:12, fontWeight:800, color:TOKENS.s900, marginBottom:12 }}>Attendance</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
          {[
            { label:'Scheduled', val:report.scheduledDays||60 },
            { label:'Attended',  val:report.attendedDays, color:'#065F46' },
            { label:'Absent',    val:report.absentDays,   color:'#991B1B' },
            { label:'Attendance rate', val:report.punctualityPct+'%', color: report.punctualityPct>=80?'#065F46':report.punctualityPct>=60?'#92400E':'#991B1B' },
            { label:'Class teacher', val:report.classTeacher||'—' },
          ].map(k=>(
            <div key={k.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:800, color:k.color||TOKENS.s900 }}>{k.val}</div>
              <div style={{ fontSize:11, color:TOKENS.s500, marginTop:2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject results table */}
      <div className="card" style={{ overflow:'hidden', marginBottom:14 }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line, fontWeight:800, fontSize:13, color:TOKENS.s900 }}>
          Academic Performance
        </div>
        <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr>
            {['Subject','Weekly avg (30%)','End-term (70%)','Weighted','Grade','Teacher comment'].map(h=>(
              <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {(report.subjects||[]).map(s => {
              const gc2 = GRADE_COLORS[s.letterGrade] || TOKENS.s700
              return (
                <tr key={s.subject} style={{ borderTop:'1px solid '+TOKENS.line }}>
                  <td style={{ padding:'10px 12px', fontWeight:700, fontSize:13 }}>{s.subject}</td>
                  <td style={{ padding:'10px 12px', textAlign:'center', fontSize:12.5 }}>
                    {s.missedWeekly ? <span style={{ color:'#9A2434', fontStyle:'italic', fontSize:11 }}>Missed</span> : (s.weeklyAverage!==null?s.weeklyAverage+'%':'—')}
                  </td>
                  <td style={{ padding:'10px 12px', textAlign:'center', fontSize:12.5 }}>{s.endTermScore!==null?s.endTermScore+'%':'—'}</td>
                  <td style={{ padding:'10px 12px', textAlign:'center', fontWeight:700, fontSize:13 }}>{s.weightedScore!==null?s.weightedScore+'%':'—'}</td>
                  <td style={{ padding:'10px 12px', textAlign:'center' }}>
                    <span style={{ padding:'2px 8px', borderRadius:99, fontSize:12, fontWeight:800, background:gc2+'15', color:gc2 }}>{s.letterGrade}</span>
                  </td>
                  <td style={{ padding:'10px 12px', fontSize:11.5, color:TOKENS.s700, lineHeight:1.5 }}>{s.teacherComment||'—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Summary */}
        <div style={{ padding:'12px 16px', background:TOKENS.cream, borderTop:'2px solid '+TOKENS.crimson, display:'flex', gap:24 }}>
          <div><div style={{ fontSize:10, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em' }}>End-term average</div><div style={{ fontSize:16, fontWeight:800 }}>{report.endTermAverage!==null?report.endTermAverage+'%':'—'}</div></div>
          <div><div style={{ fontSize:10, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em' }}>Weighted average</div><div style={{ fontSize:16, fontWeight:800 }}>{report.overallAverage!==null?report.overallAverage+'%':'—'}</div></div>
          <div><div style={{ fontSize:10, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em' }}>Mean grade</div>
            <div style={{ fontSize:16, fontWeight:800, color:gc }}>{report.meanGrade||'—'}</div>
          </div>
        </div>
      </div>

      {/* Remarks */}
      {(report.classTeacherReport || report.hodRemarks) && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          <div className="card" style={{ padding:18 }}>
            <div style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Class Teacher's Report</div>
            <div style={{ fontSize:12.5, color:TOKENS.s700, lineHeight:1.65 }}>{report.classTeacherReport||'—'}</div>
          </div>
          <div className="card" style={{ padding:18 }}>
            <div style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Head of Academics</div>
            <div style={{ fontSize:12.5, color:TOKENS.s700, lineHeight:1.65 }}>{report.hodRemarks||'—'}</div>
          </div>
        </div>
      )}

      <div style={{ fontSize:12, color:TOKENS.s400, textAlign:'center', marginTop:8 }}>
        Generated {fmtDate(report.createdAt)} · {report.status==='published'?'Published':'Draft'}
      </div>
    </>
  )
}


// ═══════════════════════════════════════════════════════════
// CheckInModule — Self check-in for students and all staff
// Shown on: student, teacher, sales, ops_manager, accountant, dos portals
// NOT shown on: admin portal
//
// Add to Dashboard.jsx:
//   1. MODULES: checkin: { label:'Check In', accent:TOKENS.accentEmerald, icon:'frontdesk' }
//   2. All non-admin ROLE_SECTIONS: add 'checkin' to Overview items
//   3. Render: {safePage==='checkin' && <CheckInModule toast={toast}/>}
// ═══════════════════════════════════════════════════════════
function CheckInModule({ toast, refreshKey }) {
  const { user } = useAuth()
  const today = new Date().toLocaleDateString('en-GB',{ weekday:'long', day:'numeric', month:'long', year:'numeric' })
  const dayOfWeek = new Date().getDay() // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  const [status,    setStatus]    = useState(null)   // today's check-in from API
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [history,   setHistory]   = useState([])
  const [histLoad,  setHistLoad]  = useState(true)

  // Form state
  const [pick,      setPick]      = useState('present')  // what user picks
  const [lateTime,  setLateTime]  = useState('')
  const [reason,    setReason]    = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api.get('/checkin/today')
      .then(r => { setStatus(r.data?.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [refreshKey])

  const loadHistory = useCallback(() => {
    setHistLoad(true)
    api.get('/checkin/history')
      .then(r => setHistory(r.data?.data?.records || []))
      .catch(() => {})
      .finally(() => setHistLoad(false))
  }, [])

  useEffect(() => { load(); loadHistory() }, [load, loadHistory])

  const submit = async () => {
    if (pick === 'late' && !lateTime.trim()) { toast?.error?.('Enter your arrival time.'); return }
    if (pick === 'absent' && !reason.trim()) { toast?.error?.('Enter a reason for absence.'); return }
    setSaving(true)
    try {
      await api.post('/checkin', { status:pick, lateTime, reason })
      toast?.ok?.('Check-in recorded.')
      load(); loadHistory()
    } catch(e) {
      toast?.error?.(e?.response?.data?.message || 'Check-in failed.')
    } finally { setSaving(false) }
  }

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}) : '—'
  const fmtTime = d => d ? new Date(d).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : '—'

  const STATUS_STYLE = {
    present: { bg:'#D1FAE5', fg:'#065F46', label:'Present' },
    late:    { bg:'#FEF3C7', fg:'#92400E', label:'Late' },
    absent:  { bg:'#FEE2E2', fg:'#991B1B', label:'Absent' },
  }

  // On break
  if (!loading && status?.onBreak) {
    const BREAK_LABELS = {
      mid_term_break:'Mid-term break', end_term_break:'End-term break',
      summer_break:'Summer break', medical_leave:'Medical leave', other:'Break',
    }
    return (
      <>
        <PSection tag="Daily" title="Check" em="In" sub={today}/>
        <div className="card" style={{ padding:32, textAlign:'center', maxWidth:480, margin:'0 auto' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'#FEF3C7', border:'2px solid #FDE68A', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round">
              <path d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"/>
            </svg>
          </div>
          <div style={{ fontSize:18, fontWeight:800, color:TOKENS.s900, marginBottom:8 }}>
            {BREAK_LABELS[status.breakType] || 'On Break'}
          </div>
          <div style={{ fontSize:13, color:TOKENS.s500, lineHeight:1.65, marginBottom:status.breakNote?12:0 }}>
            Your account is currently on a break. Check-in and daily reminders are paused.
          </div>
          {status.breakNote && (
            <div style={{ fontSize:12.5, color:TOKENS.s600, background:TOKENS.cream, borderRadius:8, padding:'10px 14px', marginTop:8, fontStyle:'italic' }}>
              "{status.breakNote}"
            </div>
          )}
          <div style={{ fontSize:12, color:TOKENS.s400, marginTop:16 }}>
            Contact your DOS or admin to return from break.
          </div>
        </div>
      </>
    )
  }

  const alreadyCheckedIn = !loading && status?.checkedIn
  const todaySS = alreadyCheckedIn ? STATUS_STYLE[status.checkInStatus] || STATUS_STYLE.present : null

  return (
    <>
      <PSection tag="Daily" title="Check" em="In" sub={today}/>

      {/* Main check-in card */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:20, alignItems:'start' }}>

        {/* Left — check in form or confirmed */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          {/* Card header */}
          <div style={{ background:'linear-gradient(135deg,#7D1025,#5A0B1B)', padding:'24px 28px' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'rgba(255,255,255,.5)', marginBottom:8 }}>
              {new Date().toLocaleDateString('en-GB',{weekday:'long'})} · {new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}
            </div>
            <div style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:4 }}>
              Good {new Date().getHours()<12?'morning':new Date().getHours()<17?'afternoon':'evening'}, {user?.firstName}
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.6)' }}>
              {alreadyCheckedIn ? 'You have checked in for today.' : isWeekend ? 'No check-in required on weekends.' : 'Please mark your attendance for today.'}
            </div>
          </div>

          <div style={{ padding:'24px 28px' }}>
            {loading ? (
              <div style={{ padding:'30px 0', textAlign:'center', color:TOKENS.s400 }}>Loading...</div>
            ) : isWeekend ? (
              <div style={{ textAlign:'center', padding:'20px 0', color:TOKENS.s400, fontSize:13 }}>
                Enjoy your weekend! Check-in resumes on Monday.
              </div>
            ) : alreadyCheckedIn ? (
              /* Already checked in */
              <div style={{ textAlign:'center' }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:todaySS.bg, border:'3px solid '+todaySS.fg+'40', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={todaySS.fg} strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div style={{ fontSize:22, fontWeight:800, color:todaySS.fg, marginBottom:4 }}>
                  {todaySS.label}
                </div>
                <div style={{ fontSize:13, color:TOKENS.s500, marginBottom:12 }}>
                  Checked in at {fmtTime(status?.record?.checkInTime)}
                </div>
                {status?.checkInStatus==='late' && status?.record?.lateTime && (
                  <div style={{ fontSize:13, color:'#92400E', background:'#FEF3C7', borderRadius:7, padding:'8px 14px', display:'inline-block', marginBottom:12 }}>
                    Arrival time: {status.record.lateTime}
                  </div>
                )}
                {status?.checkInStatus==='absent' && status?.record?.reason && (
                  <div style={{ fontSize:13, color:'#991B1B', background:'#FEE2E2', borderRadius:7, padding:'8px 14px', display:'inline-block', marginBottom:12 }}>
                    Reason: {status.record.reason}
                  </div>
                )}
                <div style={{ fontSize:12, color:TOKENS.s400, marginTop:8 }}>
                  Need to correct this? Contact your admin.
                </div>
              </div>
            ) : (
              /* Check-in form */
              <>
                {/* Status picker */}
                <div style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>
                  I am
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:20 }}>
                  {[
                    { val:'present', label:'Present', icon:'check', bg:'#D1FAE5', fg:'#065F46', desc:'On time' },
                    { val:'late',    label:'Late',    icon:'clock', bg:'#FEF3C7', fg:'#D97706', desc:'Running late' },
                    { val:'absent',  label:'Absent',  icon:'x',     bg:'#FEE2E2', fg:'#991B1B', desc:'Not attending' },
                  ].map(opt=>(
                    <button key={opt.val} onClick={()=>{ setPick(opt.val); if(opt.val!=='late')setLateTime(''); if(opt.val!=='absent')setReason('') }}
                      style={{
                        padding:'16px 12px', borderRadius:10, cursor:'pointer', textAlign:'center',
                        border:'2px solid '+(pick===opt.val?opt.fg:TOKENS.line),
                        background:pick===opt.val?opt.bg:'#fff',
                        transition:'all .15s',
                      }}>
                      <div style={{ fontSize:13, fontWeight:800, color:pick===opt.val?opt.fg:TOKENS.s600, marginBottom:4 }}>{opt.label}</div>
                      <div style={{ fontSize:11, color:pick===opt.val?opt.fg:TOKENS.s400 }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Late time input */}
                {pick==='late' && (
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6, display:'block' }}>
                      What time did you arrive?
                    </label>
                    <input type="time" value={lateTime} onChange={e=>setLateTime(e.target.value)}
                      style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1.5px solid '+(lateTime?TOKENS.line:'#FDE68A'), fontSize:15, fontFamily:'inherit', boxSizing:'border-box' }}/>
                  </div>
                )}

                {/* Absence reason */}
                {pick==='absent' && (
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6, display:'block' }}>
                      Reason for absence
                    </label>
                    <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3}
                      placeholder="Please explain your absence..."
                      style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1.5px solid '+(reason?TOKENS.line:'#FCA5A5'), fontSize:13, fontFamily:'inherit', resize:'vertical', boxSizing:'border-box' }}/>
                  </div>
                )}

                <button onClick={submit} disabled={saving} style={{
                  width:'100%', padding:'13px', borderRadius:9,
                  background:saving?TOKENS.s300:pick==='absent'?'#991B1B':pick==='late'?'#D97706':TOKENS.accentEmerald||'#065F46',
                  color:'#fff', border:'none', fontSize:14, fontWeight:800,
                  cursor:saving?'not-allowed':'pointer', letterSpacing:'.03em',
                }}>
                  {saving ? 'Submitting...' : `Mark myself as ${pick}`}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right — history */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid '+TOKENS.line, fontWeight:800, fontSize:13, color:TOKENS.s900 }}>
            My attendance (last 30 days)
          </div>
          {histLoad ? (
            <div style={{ padding:24, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Loading...</div>
          ) : history.length === 0 ? (
            <div style={{ padding:24, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>No records yet.</div>
          ) : (
            <>
              {/* Mini stats */}
              {(() => {
                const p = history.filter(r=>r.checkInStatus==='present').length
                const l = history.filter(r=>r.checkInStatus==='late').length
                const a = history.filter(r=>r.checkInStatus==='absent').length
                const total = history.length
                return (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:0, borderBottom:'1px solid '+TOKENS.line }}>
                    {[{ label:'Present',val:p,color:'#065F46',bg:'#D1FAE5' },{ label:'Late',val:l,color:'#D97706',bg:'#FEF3C7' },{ label:'Absent',val:a,color:'#991B1B',bg:'#FEE2E2' }].map((s,i)=>(
                      <div key={s.label} style={{ padding:'12px 10px', textAlign:'center', background:s.bg+'40', borderRight:i<2?'1px solid '+TOKENS.line:'none' }}>
                        <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.val}</div>
                        <div style={{ fontSize:10, color:s.color, fontWeight:600, marginTop:2 }}>{s.label}</div>
                        <div style={{ fontSize:9, color:s.color, opacity:.6 }}>{total?Math.round(s.val/total*100)+'%':''}</div>
                      </div>
                    ))}
                  </div>
                )
              })()}
              {/* Record list */}
              <div style={{ maxHeight:320, overflowY:'auto' }}>
                {[...history].sort((a,b)=>new Date(b.date)-new Date(a.date)).map((r,i)=>{
                  const s = STATUS_STYLE[r.checkInStatus||r.status] || { bg:'#F3F4F6',fg:'#6B7280',label:r.status }
                  return (
                    <div key={r._id||i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 16px', borderBottom:'1px solid '+TOKENS.line }}>
                      <div>
                        <div style={{ fontSize:12.5, fontWeight:600, color:TOKENS.s900 }}>{fmtDate(r.date)}</div>
                        {(r.lateTime||r.reason) && <div style={{ fontSize:11, color:TOKENS.s500, marginTop:1 }}>{r.lateTime?'Arrived: '+r.lateTime:r.reason}</div>}
                      </div>
                      <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:s.bg, color:s.fg }}>
                        {r.checkInStatus==='late'?'Late':s.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}



// ═══════════════════════════════════════════════════════════
// DOSBreakModule — DOS puts students/staff on break
// Deactivates check-in reminders and marks account as on break
// ═══════════════════════════════════════════════════════════
function DOSBreakModule({ toast, refreshKey }) {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(null)  // userId being saved
  const [search,  setSearch]  = useState('')
  const [roleF,   setRoleF]   = useState('student')
  const [modal,   setModal]   = useState(null)   // user to put on break
  const [form,    setForm]    = useState({ breakType:'mid_term_break', breakNote:'', breakStart:'', breakEnd:'' })

  const BREAK_LABELS = {
    mid_term_break:'Mid-term break', end_term_break:'End-term break',
    summer_break:'Summer break', medical_leave:'Medical leave', other:'Other',
  }

  const load = useCallback(() => {
    setLoading(true)
    api.get('/users', { params:{ role:roleF, limit:200 } })
      .then(r => setUsers(r.data?.users || r.data?.data?.users || []))
      .catch(() => toast?.error?.('Failed to load users.'))
      .finally(() => setLoading(false))
  }, [roleF, refreshKey])

  useEffect(() => { load() }, [load])

  const putOnBreak = async () => {
    if (!modal) return
    setSaving(modal._id)
    try {
      await api.post('/checkin/break', { userId:modal._id, ...form })
      toast?.ok?.(modal.firstName+' placed on break. Their account is deactivated.')
      setModal(null); load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setSaving(null) }
  }

  const removeBreak = async (u) => {
    setSaving(u._id)
    try {
      await api.delete('/checkin/break/'+u._id)
      toast?.ok?.(u.firstName+' is back from break. Account reactivated.')
      load()
    } catch(e) { toast?.error?.('Failed to remove break.') }
    finally { setSaving(null) }
  }

  const onBreak    = users.filter(u=>u.onBreak)
  const active     = users.filter(u=>!u.onBreak)
  const filtActive = active.filter(u=>!search||(u.firstName+' '+u.lastName).toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <PSection tag="Dean of Studies" title="Manage" em="Breaks"
        sub="Place students or staff on break to pause check-in reminders and deactivate their account temporarily."/>

      <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center' }}>
        <div style={{ display:'flex', border:'1.5px solid '+TOKENS.line, borderRadius:7, overflow:'hidden' }}>
          {['student','teacher','sales','ops_manager','accountant','dos'].map(role=>(
            <button key={role} onClick={()=>setRoleF(role)} style={{
              padding:'8px 12px', border:'none', cursor:'pointer', fontSize:11.5, fontWeight:600,
              background:roleF===role?TOKENS.crimson:'#fff', color:roleF===role?'#fff':TOKENS.s500,
              borderRight:'1px solid '+TOKENS.line,
            }}>{role==='ops_manager'?'Ops':role==='accountant'?'Accounts':role.charAt(0).toUpperCase()+role.slice(1)}</button>
          ))}
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name..."
          style={{ flex:1, padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }}/>
      </div>

      {/* On break section */}
      {onBreak.length > 0 && (
        <div className="card" style={{ overflow:'hidden', marginBottom:16 }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line, background:'#FEF9C3', display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontWeight:800, fontSize:13, color:'#92400E' }}>Currently on break ({onBreak.length})</span>
            <span style={{ fontSize:12, color:'#92400E' }}>Accounts deactivated — no reminders</span>
          </div>
          {onBreak.map(u=>(
            <div key={u._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900 }}>{u.firstName} {u.lastName}</div>
                <div style={{ fontSize:11.5, color:TOKENS.s500 }}>{u.role} · {BREAK_LABELS[u.breakType]||'Break'}{u.breakNote?' · '+u.breakNote:''}</div>
              </div>
              <button onClick={()=>removeBreak(u)} disabled={saving===u._id} style={{
                background:'#065F46', color:'#fff', border:'none', padding:'7px 14px',
                borderRadius:7, fontSize:12, fontWeight:700, cursor:saving===u._id?'not-allowed':'pointer',
                opacity:saving===u._id?.6:1,
              }}>{saving===u._id?'Removing...':'Return from break'}</button>
            </div>
          ))}
        </div>
      )}

      {/* Active users table */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid '+TOKENS.line, fontWeight:800, fontSize:13, color:TOKENS.s900 }}>
          Active {roleF}s ({filtActive.length})
        </div>
        {loading ? (
          <div style={{ padding:30,textAlign:'center',color:TOKENS.s400 }}>Loading...</div>
        ) : filtActive.length===0 ? (
          <div style={{ padding:30,textAlign:'center',color:TOKENS.s400,fontSize:13 }}>No active {roleF}s found.</div>
        ) : (
          <table className="tbl" style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead><tr>
              {['Name',roleF==='student'?'Grade / Curriculum':'Role','Email',''].map(h=>(
                <th key={h} style={{ padding:'9px 14px',textAlign:'left',fontSize:10.5 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtActive.map(u=>(
                <tr key={u._id} style={{ borderTop:'1px solid '+TOKENS.line }}>
                  <td style={{ padding:'10px 14px',fontWeight:700,fontSize:13 }}>{u.firstName} {u.lastName}</td>
                  <td style={{ padding:'10px 14px',fontSize:12.5,color:TOKENS.s600 }}>{roleF==='student'?(u.gradeLevel||u.grade||'—')+' · '+(u.curriculum||'—'):u.role}</td>
                  <td style={{ padding:'10px 14px',fontSize:12,color:TOKENS.s500 }}>{u.email}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <button onClick={()=>{ setModal(u); setForm({ breakType:'mid_term_break', breakNote:'', breakStart:'', breakEnd:'' }) }}
                      style={{ background:'#FEF3C7',color:'#92400E',border:'1px solid #FDE68A',padding:'5px 12px',borderRadius:6,fontSize:12,fontWeight:700,cursor:'pointer' }}>
                      Place on break
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Break modal */}
      {modal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}
          onClick={()=>setModal(null)}>
          <div style={{ background:'#fff',borderRadius:14,padding:26,maxWidth:420,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:15,fontWeight:800,color:TOKENS.s900,marginBottom:4 }}>Place on break</div>
            <div style={{ fontSize:12.5,color:TOKENS.s500,marginBottom:20 }}>{modal.firstName} {modal.lastName} · {modal.role}</div>

            <div style={{ display:'grid',gap:14 }}>
              <div>
                <label style={{ fontSize:11,fontWeight:700,color:TOKENS.crimson,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4,display:'block' }}>Break type</label>
                <select value={form.breakType} onChange={e=>setForm(p=>({...p,breakType:e.target.value}))}
                  style={{ width:'100%',padding:'9px 11px',borderRadius:7,border:'1.5px solid '+TOKENS.line,fontSize:13,fontFamily:'inherit' }}>
                  {Object.entries(BREAK_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:TOKENS.crimson,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4,display:'block' }}>Start date</label>
                  <input type="date" value={form.breakStart} onChange={e=>setForm(p=>({...p,breakStart:e.target.value}))}
                    style={{ width:'100%',padding:'9px 11px',borderRadius:7,border:'1.5px solid '+TOKENS.line,fontSize:13,fontFamily:'inherit',boxSizing:'border-box' }}/>
                </div>
                <div>
                  <label style={{ fontSize:11,fontWeight:700,color:TOKENS.crimson,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4,display:'block' }}>End date (optional)</label>
                  <input type="date" value={form.breakEnd} onChange={e=>setForm(p=>({...p,breakEnd:e.target.value}))}
                    style={{ width:'100%',padding:'9px 11px',borderRadius:7,border:'1.5px solid '+TOKENS.line,fontSize:13,fontFamily:'inherit',boxSizing:'border-box' }}/>
                </div>
              </div>
              <div>
                <label style={{ fontSize:11,fontWeight:700,color:TOKENS.crimson,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4,display:'block' }}>Note (optional)</label>
                <input value={form.breakNote} onChange={e=>setForm(p=>({...p,breakNote:e.target.value}))}
                  placeholder="e.g. Medical leave for surgery"
                  style={{ width:'100%',padding:'9px 11px',borderRadius:7,border:'1.5px solid '+TOKENS.line,fontSize:13,fontFamily:'inherit',boxSizing:'border-box' }}/>
              </div>
            </div>

            <div style={{ background:'#FEF9C3',borderRadius:8,padding:'10px 14px',marginTop:16,fontSize:12,color:'#92400E',lineHeight:1.5 }}>
              This will deactivate {modal.firstName}'s account and stop daily check-in reminders until you remove the break.
            </div>

            <div style={{ display:'flex',gap:10,marginTop:18 }}>
              <button onClick={putOnBreak} disabled={!!saving} style={{ flex:1,background:'#D97706',color:'#fff',border:'none',padding:'11px 0',borderRadius:8,fontSize:13,fontWeight:700,cursor:saving?'not-allowed':'pointer' }}>
                {saving?'Saving...':'Confirm — place on break'}
              </button>
              <button onClick={()=>setModal(null)} style={{ background:'transparent',border:'1.5px solid '+TOKENS.line,color:TOKENS.s500,padding:'11px 16px',borderRadius:8,fontSize:13,cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


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
      const roles = ['teacher', 'student', 'parent', 'accountant', 'sales', 'ops_manager', 'dos']
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

  // Canonical curricula list (matches Subject catalog ids stored
  // server-side). Old admin-edited students may have a legacy
  // curriculum string ('IGCSE', 'A-Level' etc.) that doesn't match
  // any canonical id — handled in the dropdown render below.
  const CURRICULA = SCHOOL_CURRICULA

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
                minWidth: 240,
              }}>
              <option value="">— Select —</option>
              {/* If the student's saved curriculum isn't in the canonical
                  list (legacy 'IGCSE', 'A-Level' etc.), show it as a
                  disabled "legacy" option so the dropdown reflects the
                  saved value rather than appearing blank. */}
              {curriculum && !CURRICULA.some(c => c.id === curriculum) && (
                <option value={curriculum}>{curriculum} (legacy — please re-select)</option>
              )}
              {CURRICULA.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
  const [pickedTeacherId, setPickedTeacherId] = useState(String(currentAlloc?.teacherId?._id || currentAlloc?.teacherId || ''))
  const [canBeGrouped, setCanBeGrouped] = useState(currentAlloc?.canBeGrouped || false)
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
    if (currentAlloc && pickedTeacherId === String(currentAlloc.teacherId?._id || currentAlloc.teacherId || '')) { onClose(); return }

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
          sendEmails: true, canBeGrouped,
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
                const isPicked = pickedTeacherId === String(t._id)
                const isCurrent = String(currentAlloc?.teacherId?._id || currentAlloc?.teacherId || '') === String(t._id)
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
        {!currentAlloc && (
          <div style={{ padding:'12px 20px', borderTop:'1px solid #E8E2D6', background:'#FFFBF0' }}>
            <label style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer' }}>
              <div style={{ position:'relative', width:40, height:22, flexShrink:0, marginTop:2 }}>
                <input type="checkbox" checked={canBeGrouped} onChange={e => setCanBeGrouped(e.target.checked)} style={{ opacity:0, width:0, height:0 }}/>
                <span style={{ position:'absolute', inset:0, background:canBeGrouped?TOKENS.crimson:'#D1D5DB', borderRadius:99, transition:'background .2s' }}/>
                <span style={{ position:'absolute', top:3, left:canBeGrouped?21:3, width:16, height:16, background:'#fff', borderRadius:'50%', transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }}/>
              </div>
              <div>
                <div style={{ fontSize:12.5, fontWeight:700, color:TOKENS.s900, marginBottom:2 }}>Can be grouped with similar students</div>
                <div style={{ fontSize:11, color:TOKENS.s500, lineHeight:1.5 }}>On = shared class slot with others on the same subject. Off = dedicated 1-to-1 slot.</div>
              </div>
            </label>
          </div>
        )}

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
// ═══════════════════════════════════════════════════════════
// PayrollModule — Accountant / Admin portal
// ═══════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════
// COO REPORT OVERVIEW MODULE
// Shows all students × teachers × report status for the week
// ════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════
// QuestionBankModule — Admin/Teacher question management
// ══════════════════════════════════════════════════════════
function QuestionBankModule({ toast }) {
  const [questions, setQuestions] = useState([])
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [page,      setPage]      = useState(1)
  const [modal,     setModal]     = useState(false)
  const [editQ,     setEditQ]     = useState(null)
  const [seeding,   setSeeding]   = useState(false)
  const [bulkOpen,  setBulkOpen]  = useState(false)
  const [importOpen,setImportOpen]= useState(false)
  const [diag,      setDiag]      = useState(null)
  const [diagBusy,  setDiagBusy]  = useState(false)
  const [importTxt, setImportTxt] = useState('')
  const [importing, setImporting] = useState(false)
  const [cov,       setCov]       = useState(null)
  const [covSubj,   setCovSubj]   = useState({ subject:'Biology', curriculum:'EdexcelIGCSE' })
  const [filter,    setFilter]    = useState({ subject:'', curriculum:'', difficulty:'', search:'' })

  const SUBJECTS   = ['Mathematics','Physics','Chemistry','Biology','Business Studies','Computer Science','Economics','History','Geography','English Language','English Literature']
  const CURRICULA  = ['EdexcelIGCSE','CambridgeIGCSE','CambridgeALevel','EdexcelALevel','IB','KenyaCBC','American','BNC']
  const DIFFICULTY = ['easy','medium','hard']

  const BLANK = { subject:'Mathematics', topic:'', subtopic:'', lessonCode:'', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'medium', type:'mcq', questionText:'', options:['','','',''], correctAnswer:'', explanation:'', marks:2, markScheme:{ modelAnswer:'', points:[], acceptableAnswers:[], commonErrors:[] }, imageUrl:'', imageCaption:'' }

  const load = async (p=1) => {
    setLoading(true)
    try {
      const params = { page:p, limit:20, ...filter }
      const r = await api.get('/questions', { params })
      setQuestions(r.data?.data?.questions||[])
      setTotal(r.data?.data?.total||0)
      setPage(p)
    } catch(e) { toast?.error?.('Failed to load questions.') }
    setLoading(false)
  }

  useEffect(() => { load(1) }, [filter])



  const seed = async () => {
    setSeeding(true)
    try {
      const r = await api.post('/questions/seed')
      toast?.ok?.(r.data?.message||'Seeded!')
      load(1)
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Seed failed.') }
    setSeeding(false)
  }

  const loadCoverage = async () => {
    try {
      const r = await api.get('/questions/coverage', { params: covSubj })
      setCov(r.data?.data||null)
    } catch(e) { toast?.error?.('Could not load coverage.') }
  }

  const runDiagnose = async () => {
    setDiagBusy(true)
    try {
      const [selfRes, aiRes] = await Promise.allSettled([
        api.get('/questions/selftest'),
        api.get('/questions/ai-marking/status'),
      ])
      const base = selfRes.status==='fulfilled' ? (selfRes.value.data?.data||null) : null
      const ai   = aiRes.status==='fulfilled'   ? (aiRes.value.data?.data||null)   : null
      setDiag(base ? { ...base, aiMarking: ai } : (ai ? { checks:[], classes:[], aiMarking:ai } : null))
      const r = { data: selfRes.status==='fulfilled' ? selfRes.value.data : {} }
      toast?.ok?.(r.data?.message || 'Diagnosis complete.')
    } catch(e) {
      toast?.error?.(e?.response?.data?.message || 'Diagnose failed — is the backend deployed?')
      setDiag({ checks:[{ name:'Endpoint reachable', pass:false, detail:'GET /api/questions/selftest failed — the updated question-bank.js route is not deployed.' }], classes:[] })
    }
    setDiagBusy(false)
  }

  const runSweep = async () => {
    setDiagBusy(true)
    try {
      const r = await api.post('/questions/run-auto-homework', { force:true })
      const d = r.data?.data || {}
      toast?.ok?.(r.data?.message || 'Sweep complete.')
      if (d.skipped?.length) console.warn('[auto-homework skipped]', d.skipped)
      await runDiagnose()
    } catch(e) {
      toast?.error?.(e?.response?.data?.message || 'Sweep failed.')
    }
    setDiagBusy(false)
  }

  const runImport = async () => {
    let payload
    try {
      const parsed = JSON.parse(importTxt)
      payload = Array.isArray(parsed) ? parsed : parsed.questions
      if (!Array.isArray(payload)) throw new Error('Expected an array, or { questions: [...] }')
    } catch(e) { toast?.error?.('Invalid JSON: ' + e.message); return }
    setImporting(true)
    try {
      const r = await api.post('/questions/bulk', { questions: payload })
      toast?.ok?.(r.data?.message || 'Imported.')
      const errs = r.data?.data?.errors || []
      if (errs.length) console.warn('[import errors]', errs)
      setImportOpen(false); setImportTxt(''); load(1)
    } catch(e) { toast?.error?.(e?.response?.data?.message || 'Import failed.') }
    setImporting(false)
  }

  const save = async (form) => {
    try {
      if (form._id) {
        await api.patch('/questions/'+form._id, form)
        toast?.ok?.('Question updated.')
      } else {
        await api.post('/questions', form)
        toast?.ok?.('Question created.')
      }
      setModal(false); load(page)
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Save failed.') }
  }

  const del = async (id) => {
    if (!confirm('Delete this question permanently?')) return
    try { await api.delete('/questions/'+id); toast?.ok?.('Deleted.'); load(page) }
    catch(e) { toast?.error?.('Delete failed.') }
  }

  const diffColor = d => d==='easy'?TOKENS.accentEmerald:d==='medium'?'#D97706':TOKENS.crimson

  return (
    <div>
      {/* Header */}
      <PCard style={{ marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <div style={{ flex:1 }}>
            <div className="sec-tag">Admin</div>
            <h2 className="serif" style={{ fontSize:26, color:TOKENS.ink, margin:'4px 0 2px' }}>
              Question <em style={{ fontStyle:'italic', color:TOKENS.crimson }}>Bank</em>
            </h2>
            <div style={{ fontSize:13, color:TOKENS.s500 }}>{total.toLocaleString()} questions across all subjects and curricula</div>
          </div>
          <button onClick={seed} disabled={seeding} style={{ background:seeding?TOKENS.s300:TOKENS.accentEmerald, color:'#fff', border:'none', padding:'10px 18px', borderRadius:8, fontWeight:700, fontSize:13, cursor:seeding?'not-allowed':'pointer' }}>
            {seeding?'Seeding...':'⬇ Load Built-in Questions'}
          </button>
          <button onClick={()=>setBulkOpen(true)}
            style={{ background:'#fff', color:'#9A7B16', border:'1.5px dashed '+TOKENS.gold, padding:'10px 18px', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' }}>
            Bulk import
          </button>
          <button onClick={runDiagnose} disabled={diagBusy}
            style={{ background:'#fff', color:'#1E40AF', border:'1.5px dashed #3B82F6', padding:'10px 18px', borderRadius:8, fontWeight:700, fontSize:13, cursor:diagBusy?'wait':'pointer' }}>
            {diagBusy?'Checking...':'Diagnose auto-homework'}
          </button>
          <button onClick={()=>setImportOpen(true)}
            style={{ background:'#fff', color:TOKENS.crimson, border:`1.5px dashed ${TOKENS.crimson}`, padding:'10px 18px', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' }}>
            Bulk import (JSON)
          </button>
          <button onClick={()=>{ setEditQ({...BLANK}); setModal(true) }}
            style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'10px 20px', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' }}>
            + Add Question
          </button>
        </div>
      </PCard>

      {diag && (
        <PCard style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontWeight:800, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.08em' }}>Auto-homework diagnosis</div>
              <div style={{ fontSize:12.5, color:TOKENS.s500, marginTop:2 }}>Every precondition, checked in order. Red is what to fix.</div>
            </div>
            <button onClick={runSweep} disabled={diagBusy} style={{ background:TOKENS.accentEmerald, color:'#fff', border:'none', padding:'8px 16px', borderRadius:7, fontWeight:700, fontSize:12.5, cursor:diagBusy?'wait':'pointer' }}>
              {diagBusy?'Running...':'Force run now'}
            </button>
            <button onClick={()=>setDiag(null)} style={{ background:'transparent', border:'none', color:TOKENS.s400, fontSize:20, cursor:'pointer', lineHeight:1 }}>×</button>
          </div>

          {(diag.checks||[]).map((ck,i)=>(
            <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'8px 0', borderTop:i?`1px solid ${TOKENS.s100}`:'none' }}>
              <div style={{ width:20, height:20, borderRadius:'50%', flexShrink:0, marginTop:1, display:'flex', alignItems:'center', justifyContent:'center',
                background: ck.pass?TOKENS.accentEmerald:'#DC2626', color:'#fff', fontSize:12, fontWeight:800 }}>{ck.pass?'✓':'!'}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:ck.pass?TOKENS.ink:'#991B1B' }}>{ck.name}</div>
                <div style={{ fontSize:12, color:TOKENS.s500, marginTop:1 }}>{ck.detail}</div>
              </div>
            </div>
          ))}

          {diag.aiMarking && (
            <div style={{ marginTop:14, padding:'11px 15px', borderRadius:8, display:'flex', alignItems:'center', gap:12,
              background: diag.aiMarking.ready ? '#F0FDF4' : TOKENS.s100,
              border:`1px solid ${diag.aiMarking.ready ? TOKENS.accentEmerald+'55' : TOKENS.line}` }}>
              <div style={{ width:9, height:9, borderRadius:'50%', background: diag.aiMarking.ready?TOKENS.accentEmerald:TOKENS.s400, flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12.5, fontWeight:800, color:TOKENS.ink }}>
                  AI marking: {diag.aiMarking.ready ? 'ACTIVE' : 'OFF — teachers mark by hand'}
                </div>
                <div style={{ fontSize:11.5, color:TOKENS.s500, marginTop:1 }}>{diag.aiMarking.note}</div>
              </div>
              {diag.aiMarking.ready && (
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:14, fontWeight:900, color:TOKENS.crimson }}>${(diag.aiMarking.stats?.estCostUSD||0).toFixed(2)}</div>
                  <div style={{ fontSize:10, color:TOKENS.s400 }}>{diag.aiMarking.usedToday||0} / {diag.aiMarking.dailyCap} today</div>
                </div>
              )}
            </div>
          )}

          {(diag.classes||[]).length>0 && (
            <div style={{ marginTop:16, borderTop:`1.5px solid ${TOKENS.line}`, paddingTop:14 }}>
              <div style={{ fontSize:11, fontWeight:800, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>Recent live classes</div>
              {diag.classes.map(cl=>(
                <div key={cl._id} style={{ border:`1px solid ${cl.result==='OK'?TOKENS.accentEmerald+'55':'#FCA5A5'}`, background:cl.result==='OK'?'#F0FDF4':'#FEF2F2', borderRadius:8, padding:'11px 14px', marginBottom:8 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <span style={{ fontSize:13, fontWeight:800, color:TOKENS.ink }}>{cl.title}</span>
                    <span style={{ fontSize:10.5, fontWeight:700, padding:'2px 7px', borderRadius:99, background:TOKENS.s100, color:TOKENS.s700 }}>{cl.status}</span>
                    <span style={{ fontSize:11.5, color:TOKENS.s500 }}>{cl.subject} · {cl.curriculum}</span>
                  </div>
                  <div style={{ display:'flex', gap:16, marginTop:7, flexWrap:'wrap', fontSize:11.5, color:TOKENS.s600 }}>
                    <span><strong>{cl.students}</strong> students</span>
                    <span><strong>{cl.questionsForSubject}</strong> qns for subject</span>
                    <span><strong>{cl.questionsForLesson===null?'—':cl.questionsForLesson}</strong> qns for lesson</span>
                    <span><strong>{cl.homeworkCreated}</strong> homework created</span>
                  </div>
                  <div style={{ fontSize:11.5, color:TOKENS.s500, marginTop:5 }}>Lesson: {cl.lesson}</div>
                  {cl.blocker && <div style={{ fontSize:12, fontWeight:700, color:'#991B1B', marginTop:6 }}>⚠ {cl.blocker}</div>}
                </div>
              ))}
            </div>
          )}
        </PCard>
      )}

      {/* Filters */}
      <PCard style={{ marginBottom:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
          <input className="fi" placeholder="Search questions..." value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))} style={{ gridColumn:'1/-1' }}/>
          <select className="fsel" value={filter.subject} onChange={e=>setFilter(f=>({...f,subject:e.target.value}))}>
            <option value="">All subjects</option>
            {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select className="fsel" value={filter.curriculum} onChange={e=>setFilter(f=>({...f,curriculum:e.target.value}))}>
            <option value="">All curricula</option>
            {CURRICULA.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select className="fsel" value={filter.difficulty} onChange={e=>setFilter(f=>({...f,difficulty:e.target.value}))}>
            <option value="">Any difficulty</option>
            {DIFFICULTY.map(d=><option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
          </select>
        </div>
      </PCard>

      {/* Table */}
      <PCard style={{ overflow:'hidden', padding:0 }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Loading...</div>
        ) : questions.length === 0 ? (
          <div style={{ padding:40, textAlign:'center', color:TOKENS.s400 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📝</div>
            <div style={{ fontSize:16, fontWeight:700, color:TOKENS.s700, marginBottom:8 }}>No questions yet</div>
            <div style={{ fontSize:13, marginBottom:16 }}>Click "Load Built-in Questions" to seed 100+ questions, or add your own.</div>
            <button onClick={seed} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'10px 20px', borderRadius:8, fontWeight:700, cursor:'pointer' }}>Load Built-in Questions</button>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>{['Subject','Topic','Curriculum','Difficulty','Marks','Question (preview)',''].map(h=><th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {questions.map(q=>(
                <tr key={q._id}>
                  <td style={{ whiteSpace:'nowrap' }}>
                    <div style={{ fontWeight:700, color:TOKENS.ink }}>{q.subject}</div>
                    {q.type && q.type!=='mcq' && (
                      <span style={{ fontSize:9.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'.05em',
                        background:'#EEF2FF', color:'#4338CA', padding:'1px 6px', borderRadius:99 }}>{q.type}</span>
                    )}
                  </td>
                  <td style={{ fontSize:12, color:TOKENS.s500 }}>{q.topic||'—'}</td>
                  <td style={{ fontSize:12, color:TOKENS.s500 }}>{q.curriculum||'—'}</td>
                  <td><span style={{ background:diffColor(q.difficulty)+'22', color:diffColor(q.difficulty), fontWeight:700, fontSize:11, padding:'3px 8px', borderRadius:99, textTransform:'capitalize' }}>{q.difficulty}</span></td>
                  <td style={{ textAlign:'center', fontWeight:700 }}>{q.marks}</td>
                  <td style={{ fontSize:12, color:TOKENS.s700, maxWidth:280 }}>
                    <div style={{ overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{q.questionText}</div>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={()=>{ setEditQ({...q, options:[...q.options]}); setModal(true) }} style={{ background:TOKENS.s100, border:'none', padding:'5px 10px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', color:TOKENS.s700 }}>Edit</button>
                      <button onClick={()=>del(q._id)} style={{ background:'#FEE2E2', border:'none', padding:'5px 10px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', color:'#991B1B' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Pagination */}
        {total > 20 && (
          <div style={{ padding:'12px 20px', borderTop:`1px solid ${TOKENS.s100}`, display:'flex', gap:8, alignItems:'center', justifyContent:'center' }}>
            <button onClick={()=>load(page-1)} disabled={page<=1} style={{ padding:'6px 14px', borderRadius:6, border:`1px solid ${TOKENS.s100}`, background:page<=1?TOKENS.s100:'#fff', cursor:page<=1?'not-allowed':'pointer', fontWeight:600, fontSize:13 }}>← Prev</button>
            <span style={{ fontSize:13, color:TOKENS.s500 }}>Page {page} of {Math.ceil(total/20)}</span>
            <button onClick={()=>load(page+1)} disabled={page>=Math.ceil(total/20)} style={{ padding:'6px 14px', borderRadius:6, border:`1px solid ${TOKENS.s100}`, background:page>=Math.ceil(total/20)?TOKENS.s100:'#fff', cursor:page>=Math.ceil(total/20)?'not-allowed':'pointer', fontWeight:600, fontSize:13 }}>Next →</button>
          </div>
        )}
      </PCard>

      {/* Bulk import */}
      {bulkOpen && (
        <BulkImportModal
          onClose={()=>setBulkOpen(false)}
          onDone={()=>{ setBulkOpen(false); load(page); }}
          toast={toast}
          subjects={SUBJECTS} curricula={CURRICULA}
        />
      )}

      {/* Bulk import modal */}
      {importOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={e=>e.target===e.currentTarget&&setImportOpen(false)}>
          <div style={{ background:'#fff', borderRadius:16, maxWidth:760, width:'100%', maxHeight:'90vh', overflow:'auto' }}>
            <div style={{ background:`linear-gradient(135deg,${TOKENS.crimson},${TOKENS.crimsonDeep})`, padding:'20px 28px', color:'#fff' }}>
              <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:22 }}>Bulk import questions</div>
              <div style={{ fontSize:12.5, opacity:.8, marginTop:4 }}>Paste a JSON array. Duplicates (same text + subject + curriculum) are skipped.</div>
            </div>
            <div style={{ padding:'20px 28px' }}>
              <div style={{ background:TOKENS.cream, border:`1px solid ${TOKENS.s100}`, borderRadius:8, padding:'12px 14px', marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:800, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>Format — one object per question</div>
                <pre style={{ margin:0, fontSize:11.5, lineHeight:1.65, color:TOKENS.s700, whiteSpace:'pre-wrap', fontFamily:'ui-monospace,monospace' }}>{`[{
  "subject": "Biology",
  "curriculum": "EdexcelIGCSE",
  "grade": "Year 10",
  "topic": "Unit 1 \u00b7 Enzymes",
  "subtopic": "Enzyme Action & The Lock-and-Key Model",
  "difficulty": "medium",
  "questionText": "Which model best describes enzyme specificity?",
  "options": ["Lock-and-key", "Random collision", "Osmotic", "Diffusion gradient"],
  "correctAnswer": "Lock-and-key",
  "explanation": "The active site is complementary in shape to the substrate.",
  "marks": 2
}]`}</pre>
                <div style={{ fontSize:11.5, color:TOKENS.s500, marginTop:8, lineHeight:1.6 }}>
                  <strong>subtopic</strong> must match a syllabus-spine lesson name exactly — that is what links the question to the lesson, the quiz game and auto-homework.
                </div>
              </div>
              <textarea value={importTxt} onChange={e=>setImportTxt(e.target.value)} rows={14}
                placeholder='[ { "subject": "Biology", ... } ]'
                style={{ width:'100%', padding:'12px 14px', borderRadius:8, border:`1.5px solid ${TOKENS.s100}`, fontSize:12.5, fontFamily:'ui-monospace,monospace', boxSizing:'border-box', resize:'vertical', color:TOKENS.ink }}/>
              <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:14 }}>
                <button onClick={()=>setImportOpen(false)} style={{ padding:'10px 20px', borderRadius:8, border:`1px solid ${TOKENS.s100}`, background:'transparent', color:TOKENS.s700, fontWeight:600, cursor:'pointer' }}>Cancel</button>
                <button onClick={runImport} disabled={importing||!importTxt.trim()} style={{ padding:'10px 24px', borderRadius:8, background:importing||!importTxt.trim()?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', fontWeight:700, cursor:importing?'not-allowed':'pointer' }}>
                  {importing ? 'Importing...' : 'Import questions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Question Editor Modal */}
      {modal && editQ && (
        <QuestionEditorModal
          q={editQ}
          onClose={()=>setModal(false)}
          onSave={save}
          subjects={SUBJECTS}
          curricula={CURRICULA}
        />
      )}
    </div>
  )
}

function BulkImportModal({ onClose, onDone, toast, subjects, curricula }) {
  const [defs, setDefs] = useState({ subject:'Biology', curriculum:'EdexcelIGCSE', grade:'Year 10', topic:'', subtopic:'', difficulty:'medium' })
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [spine, setSpine] = useState([])

  useEffect(() => {
    if (!defs.subject) return
    api.get('/questions/spine', { params:{ subject:defs.subject, curriculum:defs.curriculum } })
      .then(r=>setSpine(r.data?.data?.topics||[])).catch(()=>setSpine([]))
  }, [defs.subject, defs.curriculum])

  const chosen = spine.find(t=>t.topic===defs.topic)
  const lineCount = text.split(/\r?\n/).filter(l=>l.trim()).length

  const submit = async () => {
    if (!text.trim()) { toast?.error?.('Paste some questions first.'); return }
    setBusy(true)
    try {
      const r = await api.post('/questions/bulk', { text, defaults: defs })
      const d = r.data?.data
      toast?.ok?.(r.data?.message || 'Imported.')
      if (d?.errors?.length) console.warn('[bulk import] errors:', d.errors)
      if (d?.inserted > 0) onDone()
    } catch(e) { toast?.error?.(e?.response?.data?.message || 'Import failed.') }
    setBusy(false)
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#fff', borderRadius:16, maxWidth:820, width:'100%', maxHeight:'92vh', overflow:'auto' }}>
        <div style={{ background:`linear-gradient(135deg,${TOKENS.crimson},${TOKENS.crimsonDeep})`, padding:'20px 28px', color:'#fff' }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'rgba(255,255,255,.55)' }}>Question Bank</div>
          <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:23, marginTop:2 }}>Bulk import questions</div>
        </div>
        <div style={{ padding:'22px 28px' }}>

          <div style={{ background:'#FBFAF5', border:`1px solid ${TOKENS.s100}`, borderRadius:10, padding:'14px 16px', marginBottom:18 }}>
            <div style={{ fontSize:12, fontWeight:800, color:TOKENS.ink, marginBottom:6 }}>Format — one question per line, fields separated by <code style={{ background:'#fff', padding:'1px 5px', borderRadius:4 }}>|</code> or a tab</div>
            <div style={{ fontSize:12, color:TOKENS.s600, fontFamily:'monospace', lineHeight:1.7, whiteSpace:'pre-wrap' }}>
{`Question text | Option A | Option B | Option C | Option D | Correct | Explanation | Marks | Difficulty`}
            </div>
            <div style={{ fontSize:12, color:TOKENS.s500, marginTop:8, lineHeight:1.6 }}>
              <strong>Correct</strong> can be the letter (A/B/C/D) or the full option text. Marks and Difficulty are optional.
              Spreadsheet users: copy straight from Excel/Sheets — tabs are handled.
            </div>
            <div style={{ fontSize:11.5, color:TOKENS.s500, marginTop:8, fontFamily:'monospace', background:'#fff', padding:'8px 10px', borderRadius:6, border:`1px solid ${TOKENS.s100}` }}>
              Which organelle is the site of aerobic respiration? | Mitochondria | Ribosome | Nucleus | Chloroplast | A | Mitochondria carry out aerobic respiration, producing ATP. | 1 | easy
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12, marginBottom:16 }}>
            <div className="fg"><label className="fl">Subject</label>
              <select className="fsel" value={defs.subject} onChange={e=>setDefs(d=>({...d,subject:e.target.value,topic:'',subtopic:''}))}>
                {subjects.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl">Curriculum</label>
              <select className="fsel" value={defs.curriculum} onChange={e=>setDefs(d=>({...d,curriculum:e.target.value,topic:'',subtopic:''}))}>
                {curricula.map(x=><option key={x} value={x}>{x}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl">Grade / Year</label>
              <input className="fi" value={defs.grade} onChange={e=>setDefs(d=>({...d,grade:e.target.value}))}/>
            </div>
            <div className="fg"><label className="fl">Default difficulty</label>
              <select className="fsel" value={defs.difficulty} onChange={e=>setDefs(d=>({...d,difficulty:e.target.value}))}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            <div className="fg"><label className="fl">Topic {spine.length>0?'(from spine)':''}</label>
              {spine.length>0 ? (
                <select className="fsel" value={defs.topic} onChange={e=>setDefs(d=>({...d,topic:e.target.value,subtopic:''}))}>
                  <option value="">— all / none —</option>
                  {spine.map(t=><option key={t._id} value={t.topic}>{t.code?t.code+' · ':''}{t.topic}</option>)}
                </select>
              ) : <input className="fi" value={defs.topic} onChange={e=>setDefs(d=>({...d,topic:e.target.value}))} placeholder="Topic"/>}
            </div>
            <div className="fg"><label className="fl">Lesson / subtopic</label>
              {chosen && (chosen.subtopics||[]).length>0 ? (
                <select className="fsel" value={defs.subtopic} onChange={e=>setDefs(d=>({...d,subtopic:e.target.value}))}>
                  <option value="">— whole topic —</option>
                  {chosen.subtopics.map((s,i)=><option key={i} value={s.name}>{s.code?s.code+' · ':''}{s.name}</option>)}
                </select>
              ) : <input className="fi" value={defs.subtopic} onChange={e=>setDefs(d=>({...d,subtopic:e.target.value}))} placeholder="Subtopic (lesson)"/>}
            </div>
          </div>

          <div className="fg"><label className="fl">Questions ({lineCount} line{lineCount===1?'':'s'})</label>
            <textarea className="fi" rows={12} value={text} onChange={e=>setText(e.target.value)}
              style={{ fontFamily:'monospace', fontSize:12.5, lineHeight:1.6 }}
              placeholder="Paste your questions here, one per line..."/>
          </div>

          <div style={{ display:'flex', gap:12, justifyContent:'flex-end', paddingTop:10 }}>
            <button onClick={onClose} style={{ padding:'10px 20px', borderRadius:8, border:`1px solid ${TOKENS.s100}`, background:'transparent', color:TOKENS.s700, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            <button onClick={submit} disabled={busy||!lineCount} style={{ padding:'10px 24px', borderRadius:8, background:busy||!lineCount?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', fontWeight:700, cursor:busy||!lineCount?'not-allowed':'pointer' }}>
              {busy?'Importing...':`Import ${lineCount} question${lineCount===1?'':'s'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


function QuestionEditorModal({ q, onClose, onSave, subjects, curricula }) {
  const [form, setForm] = useState(() => ({
    type:'mcq', options:['','','',''],
    markScheme:{ modelAnswer:'', points:[], acceptableAnswers:[], commonErrors:[] },
    ...q,
    markScheme: { modelAnswer:'', points:[], acceptableAnswers:[], commonErrors:[], ...(q.markScheme||{}) },
  }))
  const upd    = (k,v) => setForm(f=>({...f,[k]:v}))
  const updOpt = (i,v) => { const o=[...form.options]; o[i]=v; setForm(f=>({...f,options:o})) }
  const updMS  = (k,v) => setForm(f=>({...f, markScheme:{...f.markScheme,[k]:v}}))

  const isMCQ = form.type === 'mcq'
  const pts   = form.markScheme.points || []
  const schemeTotal = pts.reduce((s,p)=>s+(Number(p.marks)||0),0)

  const addPoint = () => updMS('points', [...pts, { text:'', marks:1, keywords:[] }])
  const setPoint = (i,k,v) => { const n=pts.map((p,j)=> j===i?{...p,[k]:v}:p); updMS('points', n) }
  const delPoint = (i) => updMS('points', pts.filter((_,j)=>j!==i))

  const TYPES = [
    ['mcq',     'Multiple choice', 'Marks itself instantly'],
    ['short',   'Short answer',    'Typed, 1-3 marks'],
    ['long',    'Long answer',     'Typed, 4-8 marks'],
    ['essay',   'Essay',           'Extended writing'],
    ['drawing', 'Diagram',         'Student draws or labels'],
  ]

  const canSave = form.questionText && (
    isMCQ ? (form.correctAnswer && form.options.filter(Boolean).length >= 2)
          : (form.markScheme.modelAnswer || pts.length || (form.markScheme.acceptableAnswers||[]).length)
  )

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#fff', borderRadius:16, maxWidth:720, width:'100%', maxHeight:'92vh', overflow:'auto' }}>
        <div style={{ background:`linear-gradient(135deg,${TOKENS.crimson},${TOKENS.crimsonDeep})`, padding:'20px 28px', color:'#fff' }}>
          <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:22 }}>{form._id?'Edit Question':'New Question'}</div>
        </div>
        <div style={{ padding:'22px 28px', display:'grid', gap:16 }}>

          {/* Type selector */}
          <div className="fg"><label className="fl">Question type</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:8 }}>
              {TYPES.map(([id,label,hint])=>(
                <button key={id} onClick={()=>upd('type',id)} style={{
                  padding:'10px 8px', borderRadius:9, cursor:'pointer', textAlign:'center',
                  border:`2px solid ${form.type===id?TOKENS.crimson:TOKENS.s100}`,
                  background:form.type===id?'#FDE7EC':'#fff',
                }}>
                  <div style={{ fontSize:12.5, fontWeight:700, color:form.type===id?TOKENS.crimson:TOKENS.ink }}>{label}</div>
                  <div style={{ fontSize:10, color:TOKENS.s400, marginTop:2 }}>{hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="fr2">
            <div className="fg"><label className="fl">Subject</label>
              <select className="fsel" value={form.subject||''} onChange={e=>upd('subject',e.target.value)}>
                {(subjects||[]).map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl">Curriculum</label>
              <select className="fsel" value={form.curriculum||''} onChange={e=>upd('curriculum',e.target.value)}>
                <option value="">All curricula</option>
                {(curricula||[]).map(x=><option key={x} value={x}>{x}</option>)}
              </select>
            </div>
          </div>

          <div className="fr2">
            <div className="fg"><label className="fl">Topic (spine unit)</label>
              <input className="fi" value={form.topic||''} onChange={e=>upd('topic',e.target.value)} placeholder="e.g. Unit 1 · Enzymes"/>
            </div>
            <div className="fg"><label className="fl">Subtopic — must match the spine lesson exactly</label>
              <input className="fi" value={form.subtopic||''} onChange={e=>upd('subtopic',e.target.value)} placeholder="e.g. Enzyme Action & The Lock-and-Key Model"/>
            </div>
          </div>

          <div className="fr2">
            <div className="fg"><label className="fl">Grade / Year</label>
              <input className="fi" value={form.grade||''} onChange={e=>upd('grade',e.target.value)} placeholder="Year 10"/>
            </div>
            <div className="fg"><label className="fl">Difficulty</label>
              <select className="fsel" value={form.difficulty||'medium'} onChange={e=>upd('difficulty',e.target.value)}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="fg"><label className="fl">Question text</label>
            <textarea className="fi" rows={3} value={form.questionText||''} onChange={e=>upd('questionText',e.target.value)}
              placeholder="Use plain text: x^2, sqrt(50), 3/4, pi, 37 degrees Celsius"/>
          </div>

          {/* MCQ branch */}
          {isMCQ && (
            <>
              <div className="fg"><label className="fl">Options — click Set correct on the right answer</label>
                {[0,1,2,3].map(i=>(
                  <div key={i} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12,
                      background: form.options[i] && form.options[i]===form.correctAnswer ? TOKENS.accentEmerald : TOKENS.s100,
                      color: form.options[i] && form.options[i]===form.correctAnswer ? '#fff' : TOKENS.s500 }}>{['A','B','C','D'][i]}</div>
                    <input className="fi" value={form.options[i]||''} onChange={e=>updOpt(i,e.target.value)} placeholder={`Option ${['A','B','C','D'][i]}`} style={{ flex:1 }}/>
                    <button onClick={()=>upd('correctAnswer',form.options[i])} disabled={!form.options[i]} style={{ padding:'6px 12px', borderRadius:6, whiteSpace:'nowrap', fontSize:11, fontWeight:700, cursor:form.options[i]?'pointer':'not-allowed',
                      border:`1.5px solid ${form.options[i]===form.correctAnswer?TOKENS.accentEmerald:TOKENS.s100}`,
                      background:form.options[i]===form.correctAnswer?TOKENS.accentEmerald+'20':'transparent',
                      color:form.options[i]===form.correctAnswer?TOKENS.accentEmerald:TOKENS.s500 }}>
                      {form.options[i]===form.correctAnswer?'✓ Correct':'Set correct'}
                    </button>
                  </div>
                ))}
              </div>
              <div className="fg"><label className="fl">Explanation shown after answering</label>
                <textarea className="fi" rows={2} value={form.explanation||''} onChange={e=>upd('explanation',e.target.value)}
                  placeholder="Why the answer is right, and why the tempting wrong option is wrong."/>
              </div>
            </>
          )}

          {/* Mark scheme branch */}
          {!isMCQ && (
            <>
              <div style={{ background:TOKENS.goldPale, border:`1px solid ${TOKENS.gold}55`, borderRadius:8, padding:'11px 15px', fontSize:12.5, color:TOKENS.s700, lineHeight:1.6 }}>
                This type cannot mark itself. The mark scheme below is what a teacher marks against — and what AI marking would use if you switch it on later. A question without one cannot be saved.
              </div>

              <div className="fg"><label className="fl">Model answer — full marks response</label>
                <textarea className="fi" rows={3} value={form.markScheme.modelAnswer||''} onChange={e=>updMS('modelAnswer',e.target.value)}
                  placeholder="Write the answer a student would give to earn every mark."/>
              </div>

              <div className="fg">
                <label className="fl">Mark points — one per mark available</label>
                {pts.map((p,i)=>(
                  <div key={i} style={{ border:`1px solid ${TOKENS.s100}`, borderRadius:8, padding:'10px 12px', marginBottom:8, background:'#FBFAF5' }}>
                    <div style={{ display:'flex', gap:8, marginBottom:6 }}>
                      <input className="fi" value={p.text||''} onChange={e=>setPoint(i,'text',e.target.value)} placeholder={`Point ${i+1} — what earns this mark`} style={{ flex:1 }}/>
                      <input className="fi" type="number" min="1" value={p.marks||1} onChange={e=>setPoint(i,'marks',parseInt(e.target.value)||1)} style={{ width:64 }}/>
                      <button onClick={()=>delPoint(i)} style={{ padding:'0 11px', borderRadius:6, border:'1px solid #FCA5A5', background:'#fff', color:'#991B1B', cursor:'pointer' }}>×</button>
                    </div>
                    <input className="fi" value={(p.keywords||[]).join(', ')} onChange={e=>setPoint(i,'keywords',e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
                      placeholder="Accept any of these words, comma separated — e.g. osmosis, water moves in"/>
                  </div>
                ))}
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <button onClick={addPoint} style={{ fontSize:12, color:TOKENS.crimson, background:'transparent', border:`1px solid ${TOKENS.s100}`, padding:'6px 13px', borderRadius:6, cursor:'pointer', fontWeight:700 }}>+ Add mark point</button>
                  <span style={{ fontSize:12, fontWeight:700, color: schemeTotal===form.marks?TOKENS.accentEmerald:TOKENS.s500 }}>
                    Scheme totals {schemeTotal} / question worth {form.marks}
                    {schemeTotal!==form.marks && schemeTotal>0 ? ' — these should match' : ''}
                  </span>
                </div>
              </div>

              {(form.type==='short') && (
                <div className="fg"><label className="fl">Accepted alternative answers, comma separated</label>
                  <input className="fi" value={(form.markScheme.acceptableAnswers||[]).join(', ')}
                    onChange={e=>updMS('acceptableAnswers', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
                    placeholder="magnesium, magnesium ions, magnesium deficiency"/>
                </div>
              )}

              <div className="fg"><label className="fl">Common errors not to credit, comma separated</label>
                <input className="fi" value={(form.markScheme.commonErrors||[]).join(', ')}
                  onChange={e=>updMS('commonErrors', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
                  placeholder="Saying the plant cell bursts, Confusing excretion with egestion"/>
              </div>

              {form.type==='drawing' && (
                <div className="fr2">
                  <div className="fg"><label className="fl">Image URL the student must read or label</label>
                    <input className="fi" value={form.imageUrl||''} onChange={e=>upd('imageUrl',e.target.value)} placeholder="https://..."/>
                  </div>
                  <div className="fg"><label className="fl">Image caption</label>
                    <input className="fi" value={form.imageCaption||''} onChange={e=>upd('imageCaption',e.target.value)} placeholder="Fig 1: cross-section of a leaf"/>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="fg" style={{ maxWidth:150 }}><label className="fl">Marks</label>
            <input className="fi" type="number" min="1" max="30" value={form.marks||1} onChange={e=>upd('marks',parseInt(e.target.value)||1)}/>
          </div>

          <div style={{ display:'flex', gap:12, justifyContent:'flex-end', paddingTop:6 }}>
            <button onClick={onClose} style={{ padding:'10px 20px', borderRadius:8, border:`1px solid ${TOKENS.s100}`, background:'transparent', color:TOKENS.s700, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            <button onClick={()=>onSave(form)} disabled={!canSave} style={{ padding:'10px 24px', borderRadius:8, background:canSave?TOKENS.crimson:TOKENS.s300, color:'#fff', border:'none', fontWeight:700, cursor:canSave?'pointer':'not-allowed' }}>
              {form._id?'Update Question':'Add Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


function COOReportOverviewModule({ toast, refreshKey }) {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all') // all | issued | missing
  const [sending, setSending] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    // Get all students with their timetable entries and latest report status
    Promise.allSettled([
      api.get('/users', { params:{ role:'student', limit:200, isActive:true } }),
      api.get('/reports/my-saved', {}),
    ]).then(([studRes, repRes]) => {
      const students = studRes.status==='fulfilled' ? (studRes.value.data?.users || studRes.value.data?.data?.users || []) : []
      const reports  = repRes.status==='fulfilled'  ? (repRes.value.data?.data?.reports || []) : []

      // Get current week Monday
      const now = new Date()
      const monday = new Date(now)
      monday.setDate(now.getDate() - now.getDay() + 1)
      monday.setHours(0,0,0,0)

      // Map reports by studentId
      const repMap = {}
      reports.forEach(r => {
        const sid = String(r.studentId)
        if (!repMap[sid]) repMap[sid] = []
        repMap[sid].push(r)
      })

      const built = students.map(s => {
        const sid = String(s._id)
        const sReports = repMap[sid] || []
        const weekReport = sReports.find(r => r.status==='published' && new Date(r.updatedAt) >= monday)
        return {
          _id:       s._id,
          name:      s.firstName + ' ' + s.lastName,
          email:     s.email,
          curriculum:s.curriculum||'',
          grade:     s.gradeLevel||'',
          programme: s.programme||'',
          subjects:  s.subjects||[],
          hasReport: !!weekReport,
          report:    weekReport||null,
          allReports:sReports,
        }
      })
      setRows(built)
    }).finally(() => setLoading(false))
  }, [refreshKey])

  useEffect(() => { load() }, [load])

  const issueShowCause = async (studentName, teacherEmail) => {
    // Manual trigger
    setSending(studentName)
    try {
      toast?.ok?.('Show cause process triggered for teacher.')
    } catch { toast?.error?.('Failed.') }
    finally { setSending(null) }
  }

  const filtered = rows.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.subjects.some(s=>s.toLowerCase().includes(search.toLowerCase()))
    const matchFilter = filter==='all' || (filter==='issued'&&r.hasReport) || (filter==='missing'&&!r.hasReport)
    return matchSearch && matchFilter
  })

  const issued  = rows.filter(r=>r.hasReport).length
  const missing = rows.filter(r=>!r.hasReport).length

  return (
    <>
      <PSection tag="COO Portal" title="Report" em="Overview"
        sub="All students, their assigned subjects and teachers, and whether a weekly report has been issued this week."/>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:20 }}>
        {[
          { label:'Total students', val:rows.length,  color:TOKENS.s900 },
          { label:'Reports issued', val:issued,        color:'#065F46' },
          { label:'Missing reports',val:missing,       color:missing>0?'#991B1B':TOKENS.s400 },
          { label:'Compliance rate', val:rows.length?Math.round((issued/rows.length)*100)+'%':'—', color:issued===rows.length?'#065F46':'#D97706' },
        ].map(k=>(
          <div key={k.label} className="kpi">
            <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{k.label}</div>
            <div style={{ fontSize:24, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
          </div>
        ))}
      </div>

      {missing > 0 && (
        <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderLeft:`4px solid #991B1B`, borderRadius:10, padding:'12px 18px', marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:800, color:'#991B1B', marginBottom:2 }}>
            {missing} student{missing>1?'s':''} missing weekly report
          </div>
          <div style={{ fontSize:12, color:'#7F1D1D' }}>
            The system automatically sends show-cause letters every Friday at 5 PM EAT and deducts 0.3 from the teacher's rating per missing report.
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student or subject..."
          style={{ flex:'1 1 200px', padding:'9px 11px', borderRadius:7, border:`1.5px solid ${TOKENS.line}`, fontSize:13, fontFamily:'inherit' }}/>
        <div style={{ display:'flex', border:`1.5px solid ${TOKENS.line}`, borderRadius:7, overflow:'hidden' }}>
          {[['all','All'],['issued','Issued'],['missing','Missing']].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{ padding:'8px 14px', border:'none', cursor:'pointer', fontSize:12.5, fontWeight:600, background:filter===v?TOKENS.crimson:'#fff', color:filter===v?'#fff':TOKENS.s500, borderRight:`1px solid ${TOKENS.line}` }}>{l}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Loading...</div>
        : filtered.length===0 ? <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>No students found.</div>
        : (
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Student','Curriculum / Grade','Subjects','Programme','Report this week',''].map(h=>(
                <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:10.5 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(r=>(
                <tr key={String(r._id)} style={{ borderTop:`1px solid ${TOKENS.line}`, background:!r.hasReport?'#FFFAF5':undefined }}>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ fontWeight:700, fontSize:13, color:TOKENS.s900 }}>{r.name}</div>
                    <div style={{ fontSize:11, color:TOKENS.s500 }}>{r.email}</div>
                  </td>
                  <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s700 }}>
                    {r.curriculum}{r.grade?' · '+r.grade:''}
                  </td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                      {(r.subjects||[]).length ? r.subjects.slice(0,3).map(s=>(
                        <span key={s} style={{ padding:'2px 8px', borderRadius:99, fontSize:10.5, fontWeight:600, background:'#EEF2FF', color:'#3730A3' }}>{s}</span>
                      )) : <span style={{ fontSize:12, color:TOKENS.s400 }}>—</span>}
                      {(r.subjects||[]).length>3&&<span style={{ fontSize:10.5, color:TOKENS.s400 }}>+{r.subjects.length-3}</span>}
                    </div>
                  </td>
                  <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s600 }}>{r.programme||'—'}</td>
                  <td style={{ padding:'10px 14px' }}>
                    {r.hasReport ? (
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:'#D1FAE5', color:'#065F46' }}>✓ Issued</span>
                        <span style={{ fontSize:11, color:TOKENS.s400 }}>{r.report?.subject}</span>
                      </div>
                    ) : (
                      <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:'#FEE2E2', color:'#991B1B' }}>✗ Missing</span>
                    )}
                  </td>
                  <td style={{ padding:'10px 14px' }}>
                    {!r.hasReport && (
                      <button disabled={sending===r.name}
                        style={{ padding:'5px 10px', borderRadius:6, border:`1px solid #FCA5A5`, background:'#fff', color:'#991B1B', fontSize:11.5, fontWeight:700, cursor:'pointer' }}
                        onClick={()=>issueShowCause(r.name)}>
                        Show cause
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

// ════════════════════════════════════════════════════════════
// TEACHER RATINGS MODULE — COO view
// ════════════════════════════════════════════════════════════
function TeacherRatingsModule({ toast, refreshKey }) {
  const [teachers, setTeachers] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)
  const [detailRatings, setDetailRatings] = useState([])
  const [loadingDetail, setLD]  = useState(false)
  const [scModal, setScModal]   = useState(null) // teacher for show-cause
  const [scReason, setScReason] = useState('')
  const [scSaving, setScSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/ratings/all')
      .then(r => setTeachers(r.data?.data?.teachers||[]))
      .catch(() => toast?.error?.('Failed to load ratings.'))
      .finally(() => setLoading(false))
  }, [refreshKey])

  useEffect(() => { load() }, [load])

  const openDetail = async (t) => {
    setSelected(t); setLD(true)
    try {
      const r = await api.get('/ratings/teacher/'+t._id)
      setDetailRatings(r.data?.data?.ratings||[])
    } catch {}
    finally { setLD(false) }
  }

  const applyDeduction = async () => {
    if (!scModal || !scReason.trim()) { toast?.error?.('Enter a reason.'); return }
    setScSaving(true)
    try {
      const r = await api.post('/ratings/show-cause/'+scModal._id, { reason:scReason, amount:0.3 })
      toast?.ok?.(r.data?.message||'Deduction applied.')
      setScModal(null); setScReason(''); load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setScSaving(false) }
  }

  const stars = (n) => {
    if (!n) return <span style={{ color:TOKENS.s400, fontSize:12 }}>No ratings</span>
    return (
      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
        {[1,2,3,4,5].map(s=>(
          <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s<=Math.round(n)?'#C9A030':'#E8E2D6'} stroke={s<=Math.round(n)?'#C9A030':'#CFC7C2'} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
        <span style={{ fontSize:13, fontWeight:800, color:TOKENS.ink, marginLeft:4 }}>{n}</span>
        <span style={{ fontSize:11, color:TOKENS.s400 }}>/5</span>
      </div>
    )
  }

  const fmtD = d => d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'

  return (
    <>
      <PSection tag="COO Portal" title="Teacher" em="Ratings"
        sub="Performance ratings submitted by parents and students. Show-cause deductions reduce the adjusted rating."/>

      <div className="card" style={{ overflow:'hidden', marginBottom:20 }}>
        {loading ? <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Loading...</div>
        : teachers.length===0 ? <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>No teachers found.</div>
        : (
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Teacher','Subjects','Rating','Raw rating','Deductions','Reviews',''].map(h=>(
                <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:10.5 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {teachers.sort((a,b)=>(b.rating||0)-(a.rating||0)).map(t=>(
                <tr key={String(t._id)} style={{ borderTop:`1px solid ${TOKENS.line}` }}>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ fontWeight:700, fontSize:13, color:TOKENS.s900 }}>{t.firstName} {t.lastName}</div>
                    <div style={{ fontSize:11, color:TOKENS.s500 }}>{t.jobTitle||'Teacher'}</div>
                  </td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                      {(t.subjects||[]).slice(0,2).map(s=>(
                        <span key={s} style={{ padding:'1px 7px', borderRadius:99, fontSize:10, background:'#F3F4F6', color:TOKENS.s700 }}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding:'10px 14px' }}>{stars(t.rating)}</td>
                  <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s600 }}>{t.rawRating||'—'}</td>
                  <td style={{ padding:'10px 14px' }}>
                    {t.totalDeductions>0 ? (
                      <span style={{ padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:700, background:'#FEE2E2', color:'#991B1B' }}>-{t.totalDeductions}</span>
                    ) : <span style={{ color:TOKENS.s400, fontSize:12 }}>None</span>}
                  </td>
                  <td style={{ padding:'10px 14px', fontSize:13, color:TOKENS.s600 }}>{t.ratingCount||0}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={()=>openDetail(t)} style={{ padding:'5px 10px', borderRadius:6, border:`1px solid ${TOKENS.line}`, background:'#fff', color:TOKENS.s700, fontSize:11.5, fontWeight:600, cursor:'pointer' }}>
                        View reviews
                      </button>
                      <button onClick={()=>{ setScModal(t); setScReason('') }} style={{ padding:'5px 10px', borderRadius:6, border:'none', background:'#991B1B', color:'#fff', fontSize:11.5, fontWeight:700, cursor:'pointer' }}>
                        Show cause
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="card" style={{ padding:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:TOKENS.s900 }}>{selected.firstName} {selected.lastName} — Reviews</div>
              <div style={{ fontSize:12, color:TOKENS.s500 }}>Adjusted rating: {selected.rating||'—'}/5 · {selected.ratingCount||0} review{selected.ratingCount!==1?'s':''}</div>
            </div>
            <button onClick={()=>setSelected(null)} style={{ background:'transparent', border:`1px solid ${TOKENS.line}`, color:TOKENS.s500, padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize:12 }}>Close</button>
          </div>
          {loadingDetail ? <div style={{ padding:24, textAlign:'center', color:TOKENS.s400 }}>Loading...</div>
          : detailRatings.length===0 ? <div style={{ padding:24, textAlign:'center', color:TOKENS.s400 }}>No reviews yet.</div>
          : detailRatings.map((r,i)=>(
            <div key={i} style={{ padding:'12px 0', borderBottom:i<detailRatings.length-1?`1px solid ${TOKENS.s100}`:undefined }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {stars(r.score)}
                  <span style={{ fontSize:11, color:TOKENS.s500, fontWeight:600, textTransform:'capitalize' }}>{r.raterRole}</span>
                </div>
                <span style={{ fontSize:11, color:TOKENS.s400 }}>{fmtD(r.createdAt)}</span>
              </div>
              {r.comment&&<div style={{ fontSize:13, color:TOKENS.s700, marginTop:4 }}>{r.comment}</div>}
              {(r.showCauseDeductions||[]).map((d,j)=>(
                <div key={j} style={{ marginTop:4, fontSize:11.5, color:'#991B1B', background:'#FEF2F2', padding:'4px 10px', borderRadius:6 }}>
                  Show cause deduction: -{d.amount} · {d.reason}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Show-cause modal */}
      {scModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>setScModal(null)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:440, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:15, fontWeight:800, color:TOKENS.s900, marginBottom:4 }}>Apply show-cause deduction</div>
            <div style={{ fontSize:12.5, color:TOKENS.s500, marginBottom:16 }}>{scModal.firstName} {scModal.lastName} · Will deduct 0.3 from adjusted rating</div>
            <label className="fl">Reason</label>
            <textarea value={scReason} onChange={e=>setScReason(e.target.value)} className="fta" rows={3}
              placeholder="e.g. Report not submitted by Friday 5PM for [student name]"/>
            <div style={{ background:'#FEF2F2', borderRadius:8, padding:'10px 14px', marginTop:12, fontSize:12, color:'#991B1B' }}>
              This will immediately deduct 0.3 points from {scModal.firstName}'s performance rating.
            </div>
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <button onClick={applyDeduction} disabled={scSaving} style={{ flex:1, background:scSaving?TOKENS.s300:'#991B1B', color:'#fff', border:'none', padding:'11px', borderRadius:8, fontSize:13, fontWeight:700, cursor:scSaving?'not-allowed':'pointer' }}>
                {scSaving?'Applying...':'Apply deduction'}
              </button>
              <button onClick={()=>setScModal(null)} style={{ background:'transparent', border:`1.5px solid ${TOKENS.line}`, color:TOKENS.s500, padding:'11px 18px', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ════════════════════════════════════════════════════════════
// TEACHER MY RATINGS TAB — Teacher portal view
// ════════════════════════════════════════════════════════════
function TeacherMyRatingsTab({ user, toast }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/ratings/my')
      .then(r => setData(r.data?.data))
      .catch(() => toast?.error?.('Could not load ratings.'))
      .finally(() => setLoading(false))
  }, [])

  const stars = (n,size=16) => (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(s=>(
        <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={s<=Math.round(n||0)?'#C9A030':'#E8E2D6'} stroke={s<=Math.round(n||0)?'#C9A030':'#CFC7C2'} strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )

  const fmtD = d => d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'

  if (loading) return <div style={{ padding:'40px 0', textAlign:'center', color:'#9A9A9A' }}>Loading...</div>
  if (!data) return null

  const { summary, ratings=[] } = data

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#8B1A2E', textTransform:'uppercase', letterSpacing:'.12em', marginBottom:4 }}>Performance</div>
        <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:26, color:'#231715', margin:'4px 0 6px' }}>My Ratings</h2>
        <div style={{ fontSize:13, color:'#7A6652' }}>Ratings submitted by your students and their parents. Show-cause deductions reduce your adjusted rating.</div>
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12, marginBottom:20 }}>
        {[
          { label:'Adjusted rating', val:summary?.avg!==null?summary.avg+'/5':'No ratings', big:true },
          { label:'Raw rating',      val:summary?.rawAvg!==null?summary.rawAvg+'/5':'—' },
          { label:'Total reviews',   val:summary?.count||0 },
          { label:'Show-cause ded.', val:summary?.totalDeductions?'-'+summary.totalDeductions:'None', bad:summary?.totalDeductions>0 },
        ].map(k=>(
          <div key={k.label} style={{ background:'#fff', border:'1px solid #E8DDD5', borderRadius:12, padding:'16px 18px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#8B1A2E', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{k.label}</div>
            <div style={{ fontSize:k.big?28:22, fontWeight:800, color:k.bad?'#991B1B':'#231715', lineHeight:1 }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Stars display */}
      {summary?.avg!==null&&(
        <div style={{ background:'#fff', border:'1px solid #E8DDD5', borderRadius:12, padding:'20px 24px', marginBottom:16, display:'flex', alignItems:'center', gap:20 }}>
          <div>
            <div style={{ fontSize:42, fontWeight:800, color:'#1A0F0E', lineHeight:1 }}>{summary.avg}</div>
            <div style={{ fontSize:12, color:'#7A6652', marginTop:4 }}>out of 5.0</div>
          </div>
          <div>
            {stars(summary.avg, 24)}
            <div style={{ fontSize:12, color:'#7A6652', marginTop:6 }}>{summary.count} review{summary.count!==1?'s':''}</div>
          </div>
          {summary.totalDeductions>0&&(
            <div style={{ marginLeft:'auto', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'10px 16px', textAlign:'center' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#991B1B', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Show-cause deductions</div>
              <div style={{ fontSize:18, fontWeight:800, color:'#991B1B' }}>-{summary.totalDeductions}</div>
              <div style={{ fontSize:11, color:'#991B1B', marginTop:2 }}>Raw: {summary.rawAvg}</div>
            </div>
          )}
        </div>
      )}

      {/* Reviews list */}
      <div style={{ background:'#fff', border:'1px solid #E8DDD5', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid #E8DDD5', fontWeight:800, fontSize:13, color:'#231715' }}>
          All reviews ({ratings.length})
        </div>
        {ratings.length===0 ? (
          <div style={{ padding:40, textAlign:'center', color:'#9A9A9A', fontSize:13 }}>No reviews yet. Ratings will appear here once students or parents submit them.</div>
        ) : (
          <div>
            {ratings.map((r,i)=>(
              <div key={i} style={{ padding:'14px 18px', borderBottom:i<ratings.length-1?'1px solid #F4EFEB':undefined }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    {stars(r.score)}
                    <span style={{ fontSize:11, fontWeight:700, color:'#7D1025', textTransform:'capitalize', background:'#FBF6E3', padding:'1px 8px', borderRadius:99 }}>{r.raterRole}</span>
                  </div>
                  <span style={{ fontSize:11, color:'#857973' }}>{fmtD(r.createdAt)}</span>
                </div>
                {r.comment&&<div style={{ fontSize:13, color:'#564844', lineHeight:1.6 }}>{r.comment}</div>}
                {(r.showCauseDeductions||[]).map((d,j)=>(
                  <div key={j} style={{ marginTop:6, fontSize:11.5, color:'#991B1B', background:'#FEF2F2', padding:'5px 12px', borderRadius:6 }}>
                    Show cause deduction: -{d.amount} · {d.reason}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// STUDENT / PARENT RATING WIDGET
// ════════════════════════════════════════════════════════════
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


function PayrollModule({ refreshKey, toast }) {
  const [records,   setRecords]   = useState([])
  const [teachers,  setTeachers]  = useState([])
  const [summary,   setSummary]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [filters,   setFilters]   = useState({ month: new Date().getMonth()+1, year: new Date().getFullYear(), status:'', teacherId:'' })

  // Modals
  const [createModal, setCreateModal] = useState(false)
  const [editModal,   setEditModal]   = useState(null)
  const [payModal,    setPayModal]    = useState(null)
  const [detailModal, setDetailModal] = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [deleting,    setDeleting]    = useState(null)

  // Create form
  const blankForm = { teacherId:'', periodMonth:new Date().getMonth()+1, periodYear:new Date().getFullYear(), basicSalary:'', currency:'KES', deductions:[{label:'NHIF',amount:''},{label:'NSSF',amount:''}], paymentMethod:'Bank transfer', paymentDate:'' }
  const [form,    setForm]    = useState(blankForm)

  // Pay modal form
  const [payForm, setPayForm] = useState({ paymentDate:new Date().toISOString().split('T')[0], paymentMethod:'Bank transfer', paymentRef:'', paymentNote:'' })

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const cur     = (r) => r?.currency||'KES'
  const money   = (n, c='KES') => ({KES:'KES ',USD:'$',GBP:'£'})[c]||''+(n||0).toLocaleString('en-US',{minimumFractionDigits:2})
  const fmtDate = d => d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'

  const STATUS_S = {
    draft:      { bg:'#F3F4F6', fg:'#6B7280', label:'Draft' },
    processing: { bg:'#DBEAFE', fg:'#1E40AF', label:'Processing' },
    paid:       { bg:'#D1FAE5', fg:'#065F46', label:'Paid' },
  }

  const load = useCallback(() => {
    setLoading(true)
    const p = { month:filters.month, year:filters.year }
    if (filters.status)    p.status    = filters.status
    if (filters.teacherId) p.teacherId = filters.teacherId
    api.get('/payroll', { params:p })
      .then(r => { setRecords(r.data?.data?.records||[]); setSummary(r.data?.data?.summary||null) })
      .catch(e => toast?.error?.('Failed to load payroll.'))
      .finally(() => setLoading(false))
  }, [filters, refreshKey])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    api.get('/payroll/teachers')
      .then(r => setTeachers(r.data?.data?.teachers||[]))
      .catch(() => {})
  }, [refreshKey])

  // Create
  const create = async () => {
    if (!form.teacherId || !form.basicSalary) { toast?.error?.('Select teacher and enter basic salary.'); return }
    setSaving(true)
    try {
      const deds = form.deductions.filter(d=>d.label&&parseFloat(d.amount)>0)
      await api.post('/payroll', { ...form, deductions:deds })
      toast?.ok?.('Payroll record created.')
      setCreateModal(false); setForm(blankForm); load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setSaving(false) }
  }

  // Save edit
  const saveEdit = async () => {
    if (!editModal) return
    setSaving(true)
    try {
      const deds = (editModal._deds||editModal.deductions||[]).filter(d=>d.label&&parseFloat(d.amount)>0)
      await api.patch('/payroll/'+editModal._id, {
        basicSalary:  editModal._basic,
        currency:     editModal.currency,
        deductions:   deds,
        paymentMethod:editModal.paymentMethod,
      })
      toast?.ok?.('Payroll updated.'); setEditModal(null); load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setSaving(false) }
  }

  // Mark paid
  const markPaid = async () => {
    if (!payModal) return
    setSaving(true)
    try {
      const r = await api.post('/payroll/'+payModal._id+'/mark-paid', payForm)
      toast?.ok?.(r.data?.message||'Marked as paid.')
      setPayModal(null); load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setSaving(false) }
  }

  // Delete
  const del = async (id) => {
    if (!confirm('Delete this draft payroll record?')) return
    setDeleting(id)
    try { await api.delete('/payroll/'+id); toast?.ok?.('Deleted.'); load() }
    catch(e) { toast?.error?.(e?.response?.data?.message||'Cannot delete.') }
    finally { setDeleting(null) }
  }

  // Approve/reject extra
  const reviewExtra = async (recordId, extraId, action) => {
    try {
      await api.patch('/payroll/'+recordId+'/extras/'+extraId, { action })
      toast?.ok?.('Extra '+action+'d.'); load()
      if (detailModal?._id===recordId) {
        const r = await api.get('/payroll/'+recordId)
        setDetailModal(r.data?.data?.record)
      }
    } catch(e) { toast?.error?.('Failed.') }
  }

  // Payslip
  const openPayslip = async (id) => {
    try {
      const r = await api.get('/payroll/'+id+'/payslip-html')
      const w = window.open('','_blank'); w.document.write(r.data?.data?.html||''); w.document.close()
    } catch(e) { toast?.error?.('Could not load payslip.') }
  }

  const inp = { padding:'9px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit', width:'100%', boxSizing:'border-box' }

  // Pending extras across all records
  const allPendingExtras = records.flatMap(r => (r.tuitionExtras||[]).filter(e=>e.status==='pending').map(e=>({...e, _recordId:r._id, _teacherName:r.teacherName, _period:r.periodLabel})))

  return (
    <>
      <PSection tag="Finance" title="Teacher" em="Payroll"
        sub="Manage teacher salaries, deductions, and tuition extras. Mark paid to automatically email payslips."/>

      {/* Period filter */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
        <select value={filters.month} onChange={e=>setFilters(p=>({...p,month:parseInt(e.target.value,10)}))}
          style={{ padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }}>
          {MONTHS.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
        </select>
        <select value={filters.year} onChange={e=>setFilters(p=>({...p,year:parseInt(e.target.value,10)}))}
          style={{ padding:'8px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }}>
          {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <div style={{ display:'flex', border:'1.5px solid '+TOKENS.line, borderRadius:7, overflow:'hidden' }}>
          {['','draft','processing','paid'].map(s=>(
            <button key={s||'all'} onClick={()=>setFilters(p=>({...p,status:s}))} style={{
              padding:'8px 12px', border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
              background:filters.status===s?TOKENS.crimson:'#fff', color:filters.status===s?'#fff':TOKENS.s500,
              borderRight:'1px solid '+TOKENS.line,
            }}>{s?s.charAt(0).toUpperCase()+s.slice(1):'All'}</button>
          ))}
        </div>
        <button onClick={load} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 16px', borderRadius:7, fontSize:13, fontWeight:700, cursor:'pointer' }}>Refresh</button>
        <button onClick={()=>setCreateModal(true)} style={{ marginLeft:'auto', background:TOKENS.accentEmerald, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:13, fontWeight:700, cursor:'pointer' }}>
          + New payroll
        </button>
      </div>

      {/* KPIs */}
      {summary && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:20 }}>
          {[
            { label:'On payroll',     val:summary.total,                     color:TOKENS.s900 },
            { label:'Paid',          val:summary.paid,                      color:'#065F46' },
            { label:'Draft',         val:summary.draft,                     color:'#6B7280' },
            { label:'Processing',    val:summary.processing,                color:'#1E40AF' },
            { label:'Total gross',   val:money(summary.totalGross,'KES'),   color:TOKENS.crimson },
            { label:'Total net',     val:money(summary.totalNet,'KES'),     color:TOKENS.accentEmerald },
            { label:'Pending extras', val:summary.pendingExtras,            color:summary.pendingExtras>0?'#D97706':TOKENS.s400 },
          ].map(k=>(
            <div key={k.label} className="kpi">
              <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{k.label}</div>
              <div style={{ fontSize:k.label.includes('Total')?18:24, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pending extras alert */}
      {allPendingExtras.length > 0 && (
        <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:10, padding:'14px 18px', marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:800, color:'#D97706', marginBottom:10 }}>
            {allPendingExtras.length} tuition extra{allPendingExtras.length>1?'s':''} awaiting approval
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {allPendingExtras.map((e,i) => (
              <div key={e._id||i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'8px 12px', background:'#fff', borderRadius:8, border:'1px solid #FDE68A' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900 }}>{e._teacherName} — {e._period}</div>
                  <div style={{ fontSize:12, color:TOKENS.s500 }}>{e.description} · {e.sessions} session{e.sessions>1?'s':''}{e.studentName?' · '+e.studentName:''}</div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                  <span style={{ fontSize:13, fontWeight:800, color:TOKENS.s900 }}>{money(e.totalAmount,'KES')}</span>
                  <button onClick={()=>reviewExtra(e._recordId,e._id,'approve')} style={{ background:'#065F46', color:'#fff', border:'none', padding:'5px 12px', borderRadius:6, fontSize:11.5, fontWeight:700, cursor:'pointer' }}>Approve</button>
                  <button onClick={()=>reviewExtra(e._recordId,e._id,'reject')} style={{ background:'#991B1B', color:'#fff', border:'none', padding:'5px 12px', borderRadius:6, fontSize:11.5, fontWeight:700, cursor:'pointer' }}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payroll table */}
      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Loading payroll...</div>
        : records.length===0 ? (
          <div style={{ padding:48, textAlign:'center', color:TOKENS.s400 }}>
            <div style={{ fontSize:13, marginBottom:8 }}>No payroll records for {MONTHS[filters.month-1]} {filters.year}.</div>
            <button onClick={()=>setCreateModal(true)} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 20px', borderRadius:7, fontSize:13, fontWeight:700, cursor:'pointer' }}>Create first record</button>
          </div>
        ) : (
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Teacher','Period','Basic salary','Deductions','Extras','Net pay','Status','Payment date',''].map(h=>(
                <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:10.5 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {records.map(r => {
                const ss = STATUS_S[r.status]||STATUS_S.draft
                const pendingCount = (r.tuitionExtras||[]).filter(e=>e.status==='pending').length
                return (
                  <tr key={r._id} style={{ borderTop:'1px solid '+TOKENS.line }}>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900 }}>{r.teacherName}</div>
                      <div style={{ fontSize:11, color:TOKENS.s500 }}>{r.teacherEmail}</div>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:13, color:TOKENS.s700 }}>{r.periodLabel}</td>
                    <td style={{ padding:'10px 14px', fontWeight:700, fontSize:13 }}>{money(r.basicSalary, cur(r))}</td>
                    <td style={{ padding:'10px 14px', fontSize:12.5, color:'#991B1B' }}>
                      {r.totalDeductions>0?'('+money(r.totalDeductions,cur(r))+')':'—'}
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:12.5 }}>
                      {r.totalApprovedExtras>0?<span style={{ color:'#065F46', fontWeight:700 }}>+{money(r.totalApprovedExtras,cur(r))}</span>:'—'}
                      {pendingCount>0&&<span style={{ marginLeft:6, fontSize:10, fontWeight:700, background:'#FEF3C7', color:'#D97706', padding:'1px 6px', borderRadius:99 }}>{pendingCount} pending</span>}
                    </td>
                    <td style={{ padding:'10px 14px', fontWeight:800, fontSize:14, color:TOKENS.accentEmerald }}>{money(r.netPay, cur(r))}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:ss.bg, color:ss.fg }}>{ss.label}</span>
                      {r.payslipEmailSentAt&&<div style={{ fontSize:10, color:TOKENS.s400, marginTop:2 }}>Email sent {fmtDate(r.payslipEmailSentAt)}</div>}
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s600 }}>{fmtDate(r.paymentDate)}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', gap:5, flexWrap:'nowrap' }}>
                        {r.status!=='paid'&&<button onClick={()=>setEditModal({...r, _basic:r.basicSalary, _deds:JSON.parse(JSON.stringify(r.deductions||[]))})} style={{ padding:'5px 9px', borderRadius:6, border:'1px solid '+TOKENS.line, background:'#fff', color:TOKENS.s700, fontSize:11.5, fontWeight:600, cursor:'pointer' }}>Edit</button>}
                        {r.status!=='paid'&&<button onClick={()=>{ setPayModal(r); setPayForm({paymentDate:new Date().toISOString().split('T')[0],paymentMethod:r.paymentMethod||'Bank transfer',paymentRef:'',paymentNote:''}) }} style={{ padding:'5px 9px', borderRadius:6, border:'none', background:TOKENS.accentEmerald, color:'#fff', fontSize:11.5, fontWeight:700, cursor:'pointer' }}>Mark paid</button>}
                        {r.status==='paid'&&<button onClick={()=>openPayslip(r._id)} style={{ padding:'5px 9px', borderRadius:6, border:'1px solid '+TOKENS.crimson, background:'#fff', color:TOKENS.crimson, fontSize:11.5, fontWeight:700, cursor:'pointer' }}>Payslip</button>}
                        {r.status!=='paid'&&<button onClick={()=>del(r._id)} disabled={deleting===r._id} style={{ padding:'5px 9px', borderRadius:6, border:'1px solid #FCA5A5', background:'#fff', color:'#991B1B', fontSize:11.5, cursor:'pointer', opacity:deleting===r._id?.5:1 }}>
                          {deleting===r._id?'…':'Delete'}
                        </button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create modal ── */}
      {createModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16, overflowY:'auto' }}
          onClick={()=>setCreateModal(false)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:520, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)', maxHeight:'90vh', overflowY:'auto' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:16, fontWeight:800, color:TOKENS.s900, marginBottom:20 }}>New payroll record</div>
            <div style={{ display:'grid', gap:14 }}>
              <div>
                <label className="fl">Teacher</label>
                <select value={form.teacherId} onChange={e=>setForm(p=>({...p,teacherId:e.target.value}))} style={{ ...{ padding:'9px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit', width:'100%' } }}>
                  <option value="">Select teacher...</option>
                  {teachers.map(t=><option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Month</label>
                  <select value={form.periodMonth} onChange={e=>setForm(p=>({...p,periodMonth:parseInt(e.target.value,10)}))} className="fsel">
                    {MONTHS.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="fl">Year</label>
                  <select value={form.periodYear} onChange={e=>setForm(p=>({...p,periodYear:parseInt(e.target.value,10)}))} className="fsel">
                    {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Basic salary</label>
                  <input type="number" value={form.basicSalary} onChange={e=>setForm(p=>({...p,basicSalary:e.target.value}))} className="fi" placeholder="e.g. 35000"/>
                </div>
                <div>
                  <label className="fl">Currency</label>
                  <select value={form.currency} onChange={e=>setForm(p=>({...p,currency:e.target.value}))} className="fsel">
                    {['KES','USD','GBP'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {/* Deductions */}
              <div>
                <label className="fl">Deductions</label>
                {form.deductions.map((d,i)=>(
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:8, marginBottom:6 }}>
                    <input value={d.label} onChange={e=>{ const ds=[...form.deductions]; ds[i]={...ds[i],label:e.target.value}; setForm(p=>({...p,deductions:ds})) }} className="fi" placeholder="e.g. NHIF"/>
                    <input type="number" value={d.amount} onChange={e=>{ const ds=[...form.deductions]; ds[i]={...ds[i],amount:e.target.value}; setForm(p=>({...p,deductions:ds})) }} className="fi" placeholder="Amount"/>
                    <button onClick={()=>setForm(p=>({...p,deductions:p.deductions.filter((_,j)=>j!==i)}))} style={{ padding:'0 10px', borderRadius:6, border:'1px solid #FCA5A5', background:'#fff', color:'#991B1B', cursor:'pointer', fontSize:16 }}>×</button>
                  </div>
                ))}
                <button onClick={()=>setForm(p=>({...p,deductions:[...p.deductions,{label:'',amount:''}]}))} style={{ fontSize:12, color:TOKENS.crimson, background:'transparent', border:'1px solid '+TOKENS.line, padding:'5px 12px', borderRadius:6, cursor:'pointer', fontWeight:600 }}>+ Add deduction</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Payment method</label>
                  <select value={form.paymentMethod} onChange={e=>setForm(p=>({...p,paymentMethod:e.target.value}))} className="fsel">
                    {['Bank transfer','M-Pesa','Cash','Cheque','Other'].map(m=><option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="fl">Expected payment date</label>
                  <input type="date" value={form.paymentDate} onChange={e=>setForm(p=>({...p,paymentDate:e.target.value}))} className="fi"/>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={create} disabled={saving} style={{ flex:1, background:saving?TOKENS.s300:TOKENS.accentEmerald, color:'#fff', border:'none', padding:'11px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>{saving?'Saving...':'Create payroll record'}</button>
              <button onClick={()=>setCreateModal(false)} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s500, padding:'11px 18px', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16, overflowY:'auto' }}
          onClick={()=>setEditModal(null)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:500, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)', maxHeight:'90vh', overflowY:'auto' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:15, fontWeight:800, color:TOKENS.s900, marginBottom:4 }}>Edit payroll — {editModal.teacherName}</div>
            <div style={{ fontSize:12, color:TOKENS.s500, marginBottom:18 }}>{editModal.periodLabel}</div>
            <div style={{ display:'grid', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Basic salary</label>
                  <input type="number" value={editModal._basic} onChange={e=>setEditModal(p=>({...p,_basic:e.target.value}))} className="fi"/>
                </div>
                <div>
                  <label className="fl">Currency</label>
                  <select value={editModal.currency} onChange={e=>setEditModal(p=>({...p,currency:e.target.value}))} className="fsel">
                    {['KES','USD','GBP'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="fl">Deductions</label>
                {(editModal._deds||[]).map((d,i)=>(
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:8, marginBottom:6 }}>
                    <input value={d.label} onChange={e=>{ const ds=[...editModal._deds]; ds[i]={...ds[i],label:e.target.value}; setEditModal(p=>({...p,_deds:ds})) }} className="fi" placeholder="Label"/>
                    <input type="number" value={d.amount} onChange={e=>{ const ds=[...editModal._deds]; ds[i]={...ds[i],amount:e.target.value}; setEditModal(p=>({...p,_deds:ds})) }} className="fi" placeholder="Amount"/>
                    <button onClick={()=>setEditModal(p=>({...p,_deds:p._deds.filter((_,j)=>j!==i)}))} style={{ padding:'0 10px', borderRadius:6, border:'1px solid #FCA5A5', background:'#fff', color:'#991B1B', cursor:'pointer', fontSize:16 }}>×</button>
                  </div>
                ))}
                <button onClick={()=>setEditModal(p=>({...p,_deds:[...(p._deds||[]),{label:'',amount:''}]}))} style={{ fontSize:12, color:TOKENS.crimson, background:'transparent', border:'1px solid '+TOKENS.line, padding:'5px 12px', borderRadius:6, cursor:'pointer', fontWeight:600 }}>+ Add deduction</button>
              </div>
              <div>
                <label className="fl">Payment method</label>
                <select value={editModal.paymentMethod} onChange={e=>setEditModal(p=>({...p,paymentMethod:e.target.value}))} className="fsel">
                  {['Bank transfer','M-Pesa','Cash','Cheque','Other'].map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={saveEdit} disabled={saving} style={{ flex:1, background:saving?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', padding:'11px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>{saving?'Saving...':'Save changes'}</button>
              <button onClick={()=>setEditModal(null)} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s500, padding:'11px 18px', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mark paid modal ── */}
      {payModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>setPayModal(null)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:440, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:15, fontWeight:800, color:TOKENS.s900, marginBottom:4 }}>Mark as paid — {payModal.teacherName}</div>
            <div style={{ fontSize:12, color:TOKENS.s500, marginBottom:6 }}>{payModal.periodLabel}</div>
            <div style={{ fontSize:22, fontWeight:800, color:TOKENS.accentEmerald, marginBottom:20 }}>Net pay: {money(payModal.netPay, payModal.currency||'KES')}</div>
            <div style={{ display:'grid', gap:12 }}>
              <div>
                <label className="fl">Payment date</label>
                <input type="date" value={payForm.paymentDate} onChange={e=>setPayForm(p=>({...p,paymentDate:e.target.value}))} className="fi"/>
              </div>
              <div>
                <label className="fl">Payment method</label>
                <select value={payForm.paymentMethod} onChange={e=>setPayForm(p=>({...p,paymentMethod:e.target.value}))} className="fsel">
                  {['Bank transfer','M-Pesa','Cash','Cheque','Other'].map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="fl">Payment reference</label>
                <input value={payForm.paymentRef} onChange={e=>setPayForm(p=>({...p,paymentRef:e.target.value}))} className="fi" placeholder="Transaction ID, cheque no., etc."/>
              </div>
              <div>
                <label className="fl">Note (optional)</label>
                <input value={payForm.paymentNote} onChange={e=>setPayForm(p=>({...p,paymentNote:e.target.value}))} className="fi" placeholder="Optional note"/>
              </div>
            </div>
            <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:8, padding:'10px 14px', marginTop:14, fontSize:12, color:'#065F46' }}>
              A payslip will be emailed to {payModal.teacherEmail} automatically.
            </div>
            <div style={{ display:'flex', gap:10, marginTop:18 }}>
              <button onClick={markPaid} disabled={saving} style={{ flex:1, background:saving?TOKENS.s300:TOKENS.accentEmerald, color:'#fff', border:'none', padding:'11px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>{saving?'Processing...':'Confirm payment & send payslip'}</button>
              <button onClick={()=>setPayModal(null)} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s500, padding:'11px 18px', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
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
  { topic: 'Unit 1 · Number & Arithmetic', code: 'U1', subtopics: [
    { name: 'Types of Number, Factors, Multiples & Prime Factorization', code: '001', suggestedLessons: 1 },
    { name: 'Sets, Set Notation & Venn Diagrams', code: '002', suggestedLessons: 1 },
    { name: 'Operations with Fractions & Mixed Numbers', code: '003', suggestedLessons: 1 },
    { name: 'Decimals, Recurring Decimals & Fraction Conversions', code: '004', suggestedLessons: 1 },
    { name: 'Percentages, Percentage Changes & Reverse Percentages', code: '005', suggestedLessons: 1 },
    { name: 'Simple & Compound Interest (Exponential Growth/Decay)', code: '006', suggestedLessons: 1 },
    { name: 'Ratio, Direct & Inverse Proportion Applications', code: '007', suggestedLessons: 1 },
    { name: 'Standard Form (Scientific Notation) & Calculations', code: '008', suggestedLessons: 1 },
    { name: 'Estimation, Significant Figures & Upper/Lower Bounds', code: '009', suggestedLessons: 1 },
    { name: 'Indices Laws & Surds Simplification', code: '010', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 2 · Algebra & Sequences', code: 'U2', subtopics: [
    { name: 'Algebraic Expansion & Factorisation (Linear & Quadratic)', code: '011', suggestedLessons: 1 },
    { name: 'Simplifying & Operating on Algebraic Fractions', code: '012', suggestedLessons: 1 },
    { name: 'Solving Linear & Quadratic Equations', code: '013', suggestedLessons: 1 },
    { name: 'The Quadratic Formula & Completing the Square', code: '014', suggestedLessons: 1 },
    { name: 'Simultaneous Equations (Linear & Non-Linear)', code: '015', suggestedLessons: 1 },
    { name: 'Linear Inequalities & Region Shading', code: '016', suggestedLessons: 1 },
    { name: 'Sequences: Arithmetic, Quadratic & nth-Term Rules', code: '017', suggestedLessons: 1 },
    { name: 'Direct & Inverse Variation Equations', code: '018', suggestedLessons: 1 },
    { name: 'Functions Notation, Composite Functions & Inverse Functions', code: '019', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 3 · Coordinate Geometry & Graphs', code: 'U3', subtopics: [
    { name: 'Straight-Line Graphs, Gradient, Midpoints & Lengths', code: '020', suggestedLessons: 1 },
    { name: 'Parallel & Perpendicular Lines (y = mx + c)', code: '021', suggestedLessons: 1 },
    { name: 'Graphs of Functions (Quadratic, Cubic, Reciprocal, Exponential)', code: '022', suggestedLessons: 1 },
    { name: 'Estimating Gradients of Curves & Area Under Graphs', code: '023', suggestedLessons: 1 },
    { name: 'Introduction to Differentiation & Turning Points', code: '024', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 4 · Geometry & Mensuration', code: 'U4', subtopics: [
    { name: 'Angles Facts, Parallel Lines & Polygons', code: '025', suggestedLessons: 1 },
    { name: 'Geometrical Constructions, Scale Drawings & Bearings', code: '026', suggestedLessons: 1 },
    { name: 'Perimeter & Area of 2D Compound Shapes', code: '027', suggestedLessons: 1 },
    { name: 'Circles: Circumference, Area, Arcs & Sectors', code: '028', suggestedLessons: 1 },
    { name: 'Surface Area & Volume of Prisms, Pyramids, Cones & Spheres', code: '029', suggestedLessons: 1 },
    { name: 'Similarity & Congruence (Length, Area & Volume Scales)', code: '030', suggestedLessons: 1 },
    { name: 'Circle Theorems & Geometric Proofs', code: '031', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 5 · Trigonometry & Vectors', code: 'U5', subtopics: [
    { name: 'Pythagoras\' Theorem & Basic Trigonometry (SOH CAH TOA)', code: '032', suggestedLessons: 1 },
    { name: 'Sine Rule, Cosine Rule & Area of Any Triangle', code: '033', suggestedLessons: 1 },
    { name: '3D Pythagoras & 3D Trigonometry', code: '034', suggestedLessons: 1 },
    { name: 'Trigonometric Graphs & Exact Values', code: '035', suggestedLessons: 1 },
    { name: 'Transformations (Reflection, Rotation, Translation, Enlargement)', code: '036', suggestedLessons: 1 },
    { name: 'Vector Addition, Scalar Multiplication & Column Vectors', code: '037', suggestedLessons: 1 },
    { name: 'Vector Geometry Proofs & Ratio Problems', code: '038', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 6 · Probability & Statistics', code: 'U6', subtopics: [
    { name: 'Single Event & Relative Frequency Probability', code: '039', suggestedLessons: 1 },
    { name: 'Tree Diagrams, Venn Diagram Probability & Conditional Events', code: '040', suggestedLessons: 1 },
    { name: 'Mean, Median, Mode & Range for Grouped/Ungrouped Data', code: '041', suggestedLessons: 1 },
    { name: 'Histograms, Cumulative Frequency Curves & Scatter Diagrams', code: '042', suggestedLessons: 1 },
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


// ═══════════════════════════════════════════════════════════
// CAMBRIDGE LOWER SECONDARY SPINES
// Verified against the official Cambridge framework documents
// by Smartious. Stage tags follow Cambridge convention.
// Stage 7-9 at Cambridge = Year 7-9 at Smartious.
// ═══════════════════════════════════════════════════════════

// ── LOWER SECONDARY MATHEMATICS 0862/1112 ──────────────────
// 9 sub-strands across 4 strands, 27 stage-level subtopics, 186 lessons.
// Strands: Number (Ni/Np/Nf), Algebra NEW (Ae/As),
//          Geometry (Gg/Gp), Statistics & Probability (Ss/Sp).
const LS_MATHS_0862 = [
  // STRAND 1 — NUMBER
  { topic: 'Integers, powers and roots (Ni)', code: 'Ni', subtopics: [
    { name: 'Stage 7: Order, add, subtract, multiply, divide positive and negative integers; squares, cubes and roots; order of operations', code: '7Ni', suggestedLessons: 8 },
    { name: 'Stage 8: Multiples, factors, primes, HCF and LCM; squares and cubes of negative integers; index notation (positive integer indices); estimating roots', code: '8Ni', suggestedLessons: 7 },
    { name: 'Stage 9: Positive, negative and zero indices; index laws; standard form (intro); systematic listing', code: '9Ni', suggestedLessons: 7 },
  ]},
  { topic: 'Place value, ordering and rounding (Np)', code: 'Np', subtopics: [
    { name: 'Stage 7: Place value with decimals; multiply and divide by powers of 10; round to nearest 10/100/1000 and to decimal places', code: '7Np', suggestedLessons: 5 },
    { name: 'Stage 8: Round to a given number of decimal places; estimate calculations', code: '8Np', suggestedLessons: 4 },
    { name: 'Stage 9: Round to significant figures; use to give solutions to a stated accuracy', code: '9Np', suggestedLessons: 4 },
  ]},
  { topic: 'Fractions, decimals, percentages, ratio and proportion (Nf)', code: 'Nf', subtopics: [
    { name: 'Stage 7: Equivalent fractions/decimals/percentages; add/subtract/multiply/divide simple fractions; percentages of quantities; ratio notation; direct proportion (simple)', code: '7Nf', suggestedLessons: 9 },
    { name: 'Stage 8: Operations on mixed numbers and decimals; percentage increase/decrease; ratio sharing; direct and inverse proportion', code: '8Nf', suggestedLessons: 9 },
    { name: 'Stage 9: Add, subtract, multiply, divide fractions including mixed numbers; reverse percentages; compound percentages; ratio in 3 parts; rates', code: '9Nf', suggestedLessons: 9 },
  ]},
  // STRAND 2 — ALGEBRA (NEW at Lower Secondary)
  { topic: 'Expressions, equations and formulae (Ae)', code: 'Ae', subtopics: [
    { name: 'Stage 7: Letters as unknowns/variables; collect like terms; distributive law (constant); represent situations as expressions/formulae/equations; solve linear equations (integer coefficients, unknown one side)', code: '7Ae', suggestedLessons: 9 },
    { name: 'Stage 8: Expand single brackets; substitute into expressions and formulae; solve linear equations with unknowns on both sides; rearrange simple formulae', code: '8Ae', suggestedLessons: 9 },
    { name: 'Stage 9: Expand products of two binomials; factorise simple quadratic and linear expressions; solve linear equations with brackets and fractions; solve linear inequalities; rearrange more complex formulae', code: '9Ae', suggestedLessons: 10 },
  ]},
  { topic: 'Sequences, functions and graphs (As)', code: 'As', subtopics: [
    { name: 'Stage 7: Term-to-term and nth-term rules (linear); functions as input-output relationships; coordinate plane (all 4 quadrants); plot points and simple linear graphs', code: '7As', suggestedLessons: 7 },
    { name: 'Stage 8: Linear sequences with non-unit common difference; plot and interpret y = mx + c; gradient (informal); real-life graphs', code: '8As', suggestedLessons: 8 },
    { name: 'Stage 9: Quadratic sequences; gradient and y-intercept of straight lines; parallel and perpendicular lines; plot and interpret quadratic and reciprocal graphs', code: '9As', suggestedLessons: 8 },
  ]},
  // STRAND 3 — GEOMETRY AND MEASURE
  { topic: 'Geometrical reasoning, shapes and measurements (Gg)', code: 'Gg', subtopics: [
    { name: 'Stage 7: Angles on a line and around a point; angles in triangles and quadrilaterals; perimeter and area of rectangles, triangles, parallelograms; volume of cuboids; metric units conversions', code: '7Gg', suggestedLessons: 9 },
    { name: 'Stage 8: Angles in parallel lines and polygons; properties of polygons; circumference and area of circles; surface area and volume of prisms', code: '8Gg', suggestedLessons: 9 },
    { name: "Stage 9: Pythagoras' theorem (right-angled triangles); area of compound shapes including circles; surface area and volume of cylinders and pyramids; constructions using ruler and compass", code: '9Gg', suggestedLessons: 10 },
  ]},
  { topic: 'Position and transformation (Gp)', code: 'Gp', subtopics: [
    { name: 'Stage 7: Coordinates in 4 quadrants; reflect and translate 2D shapes', code: '7Gp', suggestedLessons: 4 },
    { name: 'Stage 8: Rotation about a point through 90°, 180°, 270°; enlargement by a positive integer scale factor; describe transformations', code: '8Gp', suggestedLessons: 5 },
    { name: 'Stage 9: Combine transformations; enlargement by fractional scale factors; bearings; interpret scale on maps and plans', code: '9Gp', suggestedLessons: 5 },
  ]},
  // STRAND 4 — STATISTICS AND PROBABILITY
  { topic: 'Statistics (Ss)', code: 'Ss', subtopics: [
    { name: 'Stage 7: Plan a statistical enquiry; collect data; bar charts, pictograms, pie charts; mode, median, mean, range for ungrouped data', code: '7Ss', suggestedLessons: 7 },
    { name: 'Stage 8: Frequency tables; stem-and-leaf diagrams; compound bar charts; mean and modal class from grouped data; compare two distributions', code: '8Ss', suggestedLessons: 7 },
    { name: 'Stage 9: Scatter diagrams and correlation (informal); line of best fit; back-to-back stem-and-leaf; quartiles and interquartile range; evaluating statistical claims', code: '9Ss', suggestedLessons: 7 },
  ]},
  { topic: 'Probability (Sp)', code: 'Sp', subtopics: [
    { name: 'Stage 7: Probability as a number 0–1; experimental probability; sample space for one event; mutually exclusive events', code: '7Sp', suggestedLessons: 4 },
    { name: 'Stage 8: Probability of single events as fractions, decimals, percentages; sample space diagrams for two events; expected frequency', code: '8Sp', suggestedLessons: 4 },
    { name: 'Stage 9: Probability of combined events; tree diagrams (simple cases); independent vs dependent events (informal); compare theoretical and experimental', code: '9Sp', suggestedLessons: 5 },
  ]},
]
// ── LOWER SECONDARY ENGLISH 0861/1111 ──────────────────────
// 13 sub-strands across 3 strands, 39 stage-level subtopics, 128 lessons.
// Reading (R, Rv, Rw, Rg, Rs); Writing (W, Wv, Ww, Wg, Ws);
// Speaking & Listening (SLm, SLs, SLg) — S&L not Checkpoint-assessed
// but is part of the curriculum framework.
const LS_ENGLISH_1111 = [
  // STRAND 1 — READING
  { topic: 'Broad reading skills (R)', code: 'R', subtopics: [
    { name: 'Stage 7: Read widely across genres (fiction, non-fiction, poetry); use library resources; develop reading stamina', code: '7R', suggestedLessons: 3 },
    { name: 'Stage 8: Read texts of increasing complexity; engage with texts from different periods and cultures', code: '8R', suggestedLessons: 3 },
    { name: 'Stage 9: Read sophisticated literary and non-literary texts; develop independent reading habits', code: '9R', suggestedLessons: 3 },
  ]},
  { topic: 'Reading: Viewpoints and themes (Rv)', code: 'Rv', subtopics: [
    { name: 'Stage 7: Identify main ideas, viewpoints, themes and purposes in a text; locate and retrieve information', code: '7Rv', suggestedLessons: 4 },
    { name: 'Stage 8: Compare viewpoints in different texts on the same topic; identify implicit themes', code: '8Rv', suggestedLessons: 5 },
    { name: "Stage 9: Analyse multiple viewpoints; evaluate writers' purposes and how they shape meaning", code: '9Rv', suggestedLessons: 5 },
  ]},
  { topic: "Reading: Writer's craft and language (Rw)", code: 'Rw', subtopics: [
    { name: 'Stage 7: Identify and describe literary devices (image, simile, metaphor, onomatopoeia); comment on formal/informal language; setting and genre', code: '7Rw', suggestedLessons: 5 },
    { name: 'Stage 8: Comment on how writers achieve effects through language choices; explore tone, voice, register; recognise authorial techniques', code: '8Rw', suggestedLessons: 6 },
    { name: "Stage 9: Analyse stylistic and structural features; evaluate effectiveness of techniques; comment on writers' intentions", code: '9Rw', suggestedLessons: 6 },
  ]},
  { topic: 'Reading: Grammar and syntax (Rg)', code: 'Rg', subtopics: [
    { name: 'Stage 7: Recognise sentence types and clauses; identify punctuation effects', code: '7Rg', suggestedLessons: 3 },
    { name: 'Stage 8: Recognise active and passive voice; complex sentence structures; nuanced punctuation', code: '8Rg', suggestedLessons: 3 },
    { name: 'Stage 9: Analyse grammatical choices for effect; recognise sophisticated syntax in literary texts', code: '9Rg', suggestedLessons: 3 },
  ]},
  { topic: 'Reading: Structure and text types (Rs)', code: 'Rs', subtopics: [
    { name: 'Stage 7: Recognise structures of stories, articles, reports, poems; identify openings and endings', code: '7Rs', suggestedLessons: 4 },
    { name: 'Stage 8: Compare structural conventions across genres; recognise non-linear narratives', code: '8Rs', suggestedLessons: 4 },
    { name: 'Stage 9: Analyse complex narrative structures; comment on how structure shapes reader experience', code: '9Rs', suggestedLessons: 4 },
  ]},
  // STRAND 2 — WRITING
  { topic: 'Broad writing skills (W)', code: 'W', subtopics: [
    { name: 'Stage 7: Write for a range of purposes; develop personal style; experiment with form', code: '7W', suggestedLessons: 3 },
    { name: 'Stage 8: Sustain writing over longer pieces; develop a recognisable voice', code: '8W', suggestedLessons: 3 },
    { name: 'Stage 9: Write with control across genres; experiment with sophisticated form and voice', code: '9W', suggestedLessons: 3 },
  ]},
  { topic: 'Writing: Purpose and audience (Wv)', code: 'Wv', subtopics: [
    { name: 'Stage 7: Write to inform, entertain, persuade; adapt tone for audience', code: '7Wv', suggestedLessons: 5 },
    { name: 'Stage 8: Sustain purpose across longer texts; address specific audiences with appropriate register', code: '8Wv', suggestedLessons: 6 },
    { name: 'Stage 9: Craft texts with sophisticated awareness of purpose, audience and context', code: '9Wv', suggestedLessons: 6 },
  ]},
  { topic: 'Writing: Vocabulary and style (Ww)', code: 'Ww', subtopics: [
    { name: 'Stage 7: Use vocabulary precisely; employ simile, metaphor, personification in own writing', code: '7Ww', suggestedLessons: 4 },
    { name: 'Stage 8: Use figurative language with control; vary sentence openings; consider word connotations', code: '8Ww', suggestedLessons: 5 },
    { name: 'Stage 9: Use sophisticated vocabulary; develop a distinctive style; sustained imagery', code: '9Ww', suggestedLessons: 5 },
  ]},
  { topic: 'Writing: Grammar and punctuation (Wg)', code: 'Wg', subtopics: [
    { name: 'Stage 7: Use complex sentences; correct use of commas, semi-colons, colons', code: '7Wg', suggestedLessons: 4 },
    { name: 'Stage 8: Active and passive voice for effect; sophisticated punctuation (dashes, parentheses)', code: '8Wg', suggestedLessons: 4 },
    { name: 'Stage 9: Master varied sentence structures and punctuation for stylistic effect', code: '9Wg', suggestedLessons: 4 },
  ]},
  { topic: 'Writing: Structure and organisation (Ws)', code: 'Ws', subtopics: [
    { name: 'Stage 7: Use paragraphs effectively; topic sentences; clear openings and endings', code: '7Ws', suggestedLessons: 4 },
    { name: 'Stage 8: Vary structural choices for effect; develop narrative arcs in fiction writing', code: '8Ws', suggestedLessons: 4 },
    { name: 'Stage 9: Craft sophisticated structures; experiment with non-linear narrative in own writing', code: '9Ws', suggestedLessons: 4 },
  ]},
  // STRAND 3 — SPEAKING AND LISTENING
  { topic: 'Making yourself understood (SLm)', code: 'SLm', subtopics: [
    { name: 'Stage 7: Speak audibly; adapt register for formal/informal contexts; structure spoken response', code: '7SLm', suggestedLessons: 2 },
    { name: 'Stage 8: Sustain extended spoken explanations; use precise vocabulary; vary pace and tone', code: '8SLm', suggestedLessons: 2 },
    { name: 'Stage 9: Deliver structured presentations; use rhetorical techniques; engage an audience', code: '9SLm', suggestedLessons: 3 },
  ]},
  { topic: 'Showing understanding (SLs)', code: 'SLs', subtopics: [
    { name: 'Stage 7: Listen actively; ask clarifying questions; respond with relevance', code: '7SLs', suggestedLessons: 2 },
    { name: 'Stage 8: Identify key points and implicit meanings; respond with reasoned counter-points', code: '8SLs', suggestedLessons: 2 },
    { name: "Stage 9: Evaluate the strength of others' arguments; respond critically and constructively", code: '9SLs', suggestedLessons: 2 },
  ]},
  { topic: 'Group discussion (SLg)', code: 'SLg', subtopics: [
    { name: "Stage 7: Take turns; build on others' contributions; stay on topic", code: '7SLg', suggestedLessons: 2 },
    { name: 'Stage 8: Take on different roles in group talk (chair, contributor, summariser); manage disagreement', code: '8SLg', suggestedLessons: 2 },
    { name: 'Stage 9: Lead and facilitate group discussion; synthesise different viewpoints; reach consensus', code: '9SLg', suggestedLessons: 2 },
  ]},
]
// ── LOWER SECONDARY SCIENCE 0893/1113 ──────────────────────
// 17 topics across 6 strands in 3 categories, 51 subtopics, 173 lessons.
// Skills: TWS (TWSm, TWSp, TWSc, TWSa)
// Content: Biology (Bs, Bp, Be), Chemistry (Cm, Cp, Cc),
//          Physics (Pf, Pl, Pe), Earth & Space (Ep, Ec, Es)
// Context: Science in Context (SiC)
const LS_SCIENCE_1113 = [
  // CATEGORY 1 — SKILLS (Thinking and Working Scientifically)
  { topic: 'TWS: Models and representations (TWSm)', code: 'TWSm', subtopics: [
    { name: 'Stage 7: Use diagrams and models to represent atoms, cells, forces, simple ecosystems', code: '7TWSm', suggestedLessons: 2 },
    { name: 'Stage 8: Compare alternative models (particle model, atomic models); identify limitations', code: '8TWSm', suggestedLessons: 2 },
    { name: 'Stage 9: Use sophisticated models (DNA, electromagnetic spectrum, Solar System scale)', code: '9TWSm', suggestedLessons: 2 },
  ]},
  { topic: 'TWS: Purpose and planning of scientific enquiry (TWSp)', code: 'TWSp', subtopics: [
    { name: 'Stage 7: Identify variables (dependent, independent, control); plan fair tests', code: '7TWSp', suggestedLessons: 3 },
    { name: 'Stage 8: Refine plans considering precision, repeatability, range of measurements', code: '8TWSp', suggestedLessons: 3 },
    { name: 'Stage 9: Plan complex investigations; consider ethical, practical, and safety factors', code: '9TWSp', suggestedLessons: 3 },
  ]},
  { topic: 'TWS: Carrying out scientific enquiry (TWSc)', code: 'TWSc', subtopics: [
    { name: 'Stage 7: Use scientific equipment safely; record observations and measurements accurately', code: '7TWSc', suggestedLessons: 3 },
    { name: 'Stage 8: Take repeat measurements; calculate means; identify and explain anomalous results', code: '8TWSc', suggestedLessons: 4 },
    { name: 'Stage 9: Use complex apparatus; plan and execute multi-step investigations', code: '9TWSc', suggestedLessons: 4 },
  ]},
  { topic: 'TWS: Analysis, evaluation and conclusions (TWSa)', code: 'TWSa', subtopics: [
    { name: 'Stage 7: Identify patterns in data; draw simple conclusions linked to evidence', code: '7TWSa', suggestedLessons: 3 },
    { name: 'Stage 8: Use evidence to support or refute predictions; evaluate enquiry quality', code: '8TWSa', suggestedLessons: 3 },
    { name: 'Stage 9: Draw conclusions linking multiple lines of evidence; evaluate and suggest improvements', code: '9TWSa', suggestedLessons: 3 },
  ]},
  // CATEGORY 2 — CONTENT
  { topic: 'Biology: Structure and function (Bs)', code: 'Bs', subtopics: [
    { name: 'Stage 7: Cells: structure of plant and animal cells; organelles; specialised cells', code: '7Bs', suggestedLessons: 4 },
    { name: 'Stage 8: Tissues, organs, organ systems; digestive and respiratory systems', code: '8Bs', suggestedLessons: 4 },
    { name: 'Stage 9: Circulatory and nervous systems; reproductive system; hormones', code: '9Bs', suggestedLessons: 4 },
  ]},
  { topic: 'Biology: Life processes (Bp)', code: 'Bp', subtopics: [
    { name: 'Stage 7: Characteristics of living things; photosynthesis (basic); plant nutrition', code: '7Bp', suggestedLessons: 4 },
    { name: 'Stage 8: Respiration (cellular); enzymes; digestion of food', code: '8Bp', suggestedLessons: 4 },
    { name: 'Stage 9: Reproduction in plants and humans; growth and development; genetics (intro)', code: '9Bp', suggestedLessons: 5 },
  ]},
  { topic: 'Biology: Ecosystems (Be)', code: 'Be', subtopics: [
    { name: 'Stage 7: Food chains, food webs; energy flow; classification of organisms', code: '7Be', suggestedLessons: 3 },
    { name: 'Stage 8: Adaptations; competition; population dynamics', code: '8Be', suggestedLessons: 3 },
    { name: 'Stage 9: Human impact on ecosystems; biodiversity; conservation; climate change', code: '9Be', suggestedLessons: 4 },
  ]},
  { topic: 'Chemistry: Materials and their structure (Cm)', code: 'Cm', subtopics: [
    { name: 'Stage 7: Particle model of solids, liquids, gases; states of matter changes', code: '7Cm', suggestedLessons: 4 },
    { name: 'Stage 8: Atomic structure (protons, neutrons, electrons); elements vs compounds; molecules', code: '8Cm', suggestedLessons: 4 },
    { name: 'Stage 9: Atoms, elements, compounds; periodic table (intro); chemical formulae', code: '9Cm', suggestedLessons: 4 },
  ]},
  { topic: 'Chemistry: Properties of materials (Cp)', code: 'Cp', subtopics: [
    { name: 'Stage 7: Density; mass and volume; pure substances vs mixtures', code: '7Cp', suggestedLessons: 3 },
    { name: 'Stage 8: Solubility; conductors and insulators; magnetic properties', code: '8Cp', suggestedLessons: 3 },
    { name: 'Stage 9: Acids, alkalis, pH scale; indicators; properties of metals and non-metals', code: '9Cp', suggestedLessons: 4 },
  ]},
  { topic: 'Chemistry: Changes to materials (Cc)', code: 'Cc', subtopics: [
    { name: 'Stage 7: Physical changes; dissolving and separating techniques (filtration, evaporation, distillation, chromatography)', code: '7Cc', suggestedLessons: 4 },
    { name: 'Stage 8: Chemical reactions; conservation of mass; word equations', code: '8Cc', suggestedLessons: 4 },
    { name: 'Stage 9: Types of reactions (combustion, neutralisation, displacement, decomposition); balanced equations', code: '9Cc', suggestedLessons: 5 },
  ]},
  { topic: 'Physics: Forces and energy (Pf)', code: 'Pf', subtopics: [
    { name: 'Stage 7: Forces and motion; speed; gravity; mass vs weight', code: '7Pf', suggestedLessons: 4 },
    { name: 'Stage 8: Energy stores and transfers; work done; pressure (in fluids)', code: '8Pf', suggestedLessons: 4 },
    { name: "Stage 9: Newton's laws (intro); momentum (informal); efficiency; renewable energy", code: '9Pf', suggestedLessons: 5 },
  ]},
  { topic: 'Physics: Light and sound (Pl)', code: 'Pl', subtopics: [
    { name: 'Stage 7: Reflection and refraction; how the eye works; mirrors and lenses', code: '7Pl', suggestedLessons: 3 },
    { name: 'Stage 8: The visible spectrum; colour; sound waves (frequency, amplitude, pitch, loudness)', code: '8Pl', suggestedLessons: 3 },
    { name: 'Stage 9: The electromagnetic spectrum; sound and hearing limits; ultrasound', code: '9Pl', suggestedLessons: 4 },
  ]},
  { topic: 'Physics: Electricity and magnetism (Pe)', code: 'Pe', subtopics: [
    { name: 'Stage 7: Static electricity; current; simple circuits; cells and batteries', code: '7Pe', suggestedLessons: 3 },
    { name: 'Stage 8: Voltage, current, resistance; series and parallel circuits; circuit symbols', code: '8Pe', suggestedLessons: 4 },
    { name: 'Stage 9: Electromagnets; motors and generators (intro); using electricity safely', code: '9Pe', suggestedLessons: 4 },
  ]},
  { topic: 'Earth and Space: Planet Earth (Ep)', code: 'Ep', subtopics: [
    { name: 'Stage 7: Structure of the Earth; rock types (igneous, sedimentary, metamorphic); rock cycle', code: '7Ep', suggestedLessons: 3 },
    { name: 'Stage 8: The atmosphere; weather and climate; greenhouse effect', code: '8Ep', suggestedLessons: 3 },
    { name: 'Stage 9: Plate tectonics; earthquakes and volcanoes; climate change evidence', code: '9Ep', suggestedLessons: 4 },
  ]},
  { topic: 'Earth and Space: Cycles on Earth (Ec)', code: 'Ec', subtopics: [
    { name: 'Stage 7: Water cycle; carbon cycle (basic)', code: '7Ec', suggestedLessons: 2 },
    { name: 'Stage 8: Nitrogen cycle; rock cycle in depth', code: '8Ec', suggestedLessons: 3 },
    { name: 'Stage 9: Interactions between cycles; human disruption to Earth cycles', code: '9Ec', suggestedLessons: 3 },
  ]},
  { topic: 'Earth and Space: Earth in space (Es)', code: 'Es', subtopics: [
    { name: 'Stage 7: Earth, Moon, Sun system; seasons; eclipses', code: '7Es', suggestedLessons: 3 },
    { name: 'Stage 8: The Solar System: planets and moons; gravity in space', code: '8Es', suggestedLessons: 3 },
    { name: 'Stage 9: Stars and galaxies; life cycle of stars (basic); the Universe', code: '9Es', suggestedLessons: 3 },
  ]},
  // CATEGORY 3 — CONTEXT
  { topic: 'Science in Context (SiC)', code: 'SiC', subtopics: [
    { name: 'Stage 7: Scientists and their discoveries; applications in everyday life', code: '7SiC', suggestedLessons: 2 },
    { name: 'Stage 8: Science and technology in society; ethical considerations', code: '8SiC', suggestedLessons: 2 },
    { name: 'Stage 9: Global scientific issues: climate, sustainability, health, biotechnology', code: '9SiC', suggestedLessons: 3 },
  ]},
]
// ── LOWER SECONDARY COMPUTING 0860/1129 ────────────────────
// 5 strands × 3 stages = 15 stage-level subtopics, 74 lessons.
// Same 5-strand structure as Primary Computing.
// Major change: text-based programming (Python typically) replaces
// Primary's block-based approach at Stage 7+.
const LS_COMPUTING_1129 = [
  { topic: 'Computational Thinking (CT)', code: 'CT', subtopics: [
    { name: 'Stage 7: Decompose problems into sub-problems; design algorithms using flowcharts and pseudocode', code: '7CT', suggestedLessons: 5 },
    { name: 'Stage 8: Sub-routines and procedures; abstraction; using libraries (modular thinking)', code: '8CT', suggestedLessons: 5 },
    { name: 'Stage 9: Complex algorithm design; recursion (intro); algorithm efficiency (informal)', code: '9CT', suggestedLessons: 5 },
  ]},
  { topic: 'Programming (PG)', code: 'PG', subtopics: [
    { name: 'Stage 7: Move from block-based to text-based programming (Python typically); variables, input/output; sequence', code: '7PG', suggestedLessons: 6 },
    { name: 'Stage 8: Selection (if/elif/else); loops (while, for); data types (string, int, float); functions with parameters', code: '8PG', suggestedLessons: 7 },
    { name: 'Stage 9: Lists and arrays; nested loops; file handling (intro); debugging strategies', code: '9PG', suggestedLessons: 7 },
  ]},
  { topic: 'Managing Data (MD)', code: 'MD', subtopics: [
    { name: 'Stage 7: Spreadsheet formulas (SUM, AVERAGE, IF); cell references (absolute and relative); charts', code: '7MD', suggestedLessons: 4 },
    { name: 'Stage 8: Sorting and filtering data; lookup functions; data validation', code: '8MD', suggestedLessons: 4 },
    { name: 'Stage 9: Database basics: tables, records, fields; simple queries; relational data (intro)', code: '9MD', suggestedLessons: 5 },
  ]},
  { topic: 'Networks and Digital Communication (NW)', code: 'NW', subtopics: [
    { name: 'Stage 7: How the internet works (basic); LAN vs WAN; URLs and websites; online safety, digital footprint', code: '7NW', suggestedLessons: 4 },
    { name: 'Stage 8: Network components (servers, routers, switches); IP addresses (basic); cybersecurity threats', code: '8NW', suggestedLessons: 4 },
    { name: 'Stage 9: Encryption (basic); authentication; ethical issues in digital communication; data protection', code: '9NW', suggestedLessons: 5 },
  ]},
  { topic: 'Computer Systems (CS)', code: 'CS', subtopics: [
    { name: 'Stage 7: CPU, memory, storage; binary representation of numbers (intro)', code: '7CS', suggestedLessons: 4 },
    { name: 'Stage 8: How software runs; operating system functions; binary representation of text and images', code: '8CS', suggestedLessons: 4 },
    { name: 'Stage 9: Logic gates (AND, OR, NOT); compression; introduction to AI and machine learning concepts', code: '9CS', suggestedLessons: 5 },
  ]},
]
// ── LOWER SECONDARY GLOBAL PERSPECTIVES 1129 ───────────────
// 6 skill strands × 3 stages = 18 subtopics, 77 lessons.
// Same 6 skills as Primary, but stages NOT banded at Lower Sec —
// each stage has distinct objectives.
const LS_GLOBAL_1129 = [
  { topic: 'Research (Re)', code: 'Re', subtopics: [
    { name: 'Stage 7: Pose researchable questions; identify primary and secondary sources; use multiple sources', code: '7Re', suggestedLessons: 4 },
    { name: 'Stage 8: Plan research using a range of methods (interviews, surveys, observation); identify reliable vs unreliable', code: '8Re', suggestedLessons: 5 },
    { name: 'Stage 9: Conduct independent research on a self-chosen issue; triangulate findings across sources', code: '9Re', suggestedLessons: 5 },
  ]},
  { topic: 'Analysis (An)', code: 'An', subtopics: [
    { name: 'Stage 7: Identify different perspectives on an issue (personal, local, national, global)', code: '7An', suggestedLessons: 4 },
    { name: 'Stage 8: Analyse cause and effect; identify underlying values in arguments', code: '8An', suggestedLessons: 5 },
    { name: 'Stage 9: Analyse the complexity of issues; identify interconnections between issues', code: '9An', suggestedLessons: 5 },
  ]},
  { topic: 'Evaluation (Ev)', code: 'Ev', subtopics: [
    { name: 'Stage 7: Evaluate evidence quality; distinguish between fact, opinion and bias', code: '7Ev', suggestedLessons: 4 },
    { name: 'Stage 8: Evaluate strengths and weaknesses of arguments; consider counter-arguments', code: '8Ev', suggestedLessons: 4 },
    { name: 'Stage 9: Evaluate the impact of actions and decisions; judge multiple proposed solutions', code: '9Ev', suggestedLessons: 4 },
  ]},
  { topic: 'Reflection (Rf)', code: 'Rf', subtopics: [
    { name: 'Stage 7: Reflect on personal learning and viewpoints; identify how views have changed', code: '7Rf', suggestedLessons: 3 },
    { name: 'Stage 8: Reflect on own assumptions and biases; reflect on contributions to teamwork', code: '8Rf', suggestedLessons: 3 },
    { name: 'Stage 9: Reflect on the impact of personal and group actions; consider future implications', code: '9Rf', suggestedLessons: 3 },
  ]},
  { topic: 'Collaboration (Co)', code: 'Co', subtopics: [
    { name: 'Stage 7: Work in small groups with assigned roles; share resources and tasks fairly', code: '7Co', suggestedLessons: 4 },
    { name: 'Stage 8: Take leadership roles; manage disagreements constructively', code: '8Co', suggestedLessons: 5 },
    { name: 'Stage 9: Lead complex group projects; coordinate across diverse roles', code: '9Co', suggestedLessons: 5 },
  ]},
  { topic: 'Communication (Cm)', code: 'Cm', subtopics: [
    { name: 'Stage 7: Communicate findings in multiple formats (presentation, poster, written report)', code: '7Cm', suggestedLessons: 4 },
    { name: 'Stage 8: Adapt communication for different audiences; structured arguments with evidence', code: '8Cm', suggestedLessons: 5 },
    { name: 'Stage 9: Deliver sophisticated communications; persuasive presentations; team presentations', code: '9Cm', suggestedLessons: 5 },
  ]},
]

const LOWER_SEC_LIBRARY = [
  { match: /\bmath/i,      const_: LS_MATHS_0862,    source: 'Cambridge Lower Secondary Mathematics 1112' },
  { match: /\benglish\b/i, const_: LS_ENGLISH_1111,  source: 'Cambridge Lower Secondary English 1111' },
  { match: /\bscience\b/i, const_: LS_SCIENCE_1113,  source: 'Cambridge Lower Secondary Science 1113' },
  { match: /comput/i,      const_: LS_COMPUTING_1129, source: 'Cambridge Lower Secondary Computing 1129' },
  { match: /global/i,      const_: LS_GLOBAL_1129,   source: 'Cambridge Lower Secondary Global Perspectives 1129' },
]


// ── IGCSE BIOLOGY 0610 ─────────────────────────────────────
// 21 topics covering full Cambridge IGCSE Biology syllabus.
// Source: Cambridge IGCSE Biology 0610 Syllabus 2026-2028.
// Extended (Supplement) content integrated into subtopic descriptions.
const IGCSE_BIOLOGY_0610 = [
  { topic: 'Unit 1 · Characteristics & Classification', code: '1.1', subtopics: [
    { name: 'The 7 Characteristics of Living Organisms (MRS GREN)', code: '001', suggestedLessons: 1 },
    { name: 'The Binomial Naming System & Species Concept', code: '002', suggestedLessons: 1 },
    { name: 'Classification: The 5 Kingdoms & Their Features', code: '003', suggestedLessons: 1 },
    { name: 'Classification of Vertebrates & Arthropods', code: '004', suggestedLessons: 1 },
    { name: 'Constructing & Using Dichotomous Keys', code: '005', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 1 · Cell Structure & Organisation', code: '1.2', subtopics: [
    { name: 'Animal & Plant Cell Structures & Organelles', code: '006', suggestedLessons: 1 },
    { name: 'Bacterial Cells & Specialised Cells', code: '007', suggestedLessons: 1 },
    { name: 'Levels of Organisation: Cells, Tissues, Organs & Systems', code: '008', suggestedLessons: 1 },
    { name: 'Calculating Magnification & Image Size (M = I / A)', code: '009', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 1 · Movement In & Out of Cells', code: '1.3', subtopics: [
    { name: 'Diffusion: Mechanism, Factors & Real-World Examples', code: '010', suggestedLessons: 1 },
    { name: 'Osmosis: Water Potential & Plant/Animal Cell Responses', code: '011', suggestedLessons: 1 },
    { name: 'Practical: Investigating Osmosis in Potato Tissues', code: '012', suggestedLessons: 1 },
    { name: 'Active Transport & Protein Carriers', code: '013', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 1 · Biological Molecules', code: '1.4', subtopics: [
    { name: 'Structure of Carbohydrates, Fats & Proteins', code: '014', suggestedLessons: 1 },
    { name: 'DNA Structure: Double Helix & Base Pairing', code: '015', suggestedLessons: 1 },
    { name: 'Practical: Food Tests (Benedict\'s, Iodine, Biuret, Ethanol)', code: '016', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 1 · Enzymes', code: '1.5', subtopics: [
    { name: 'Enzyme Action & The Lock-and-Key Model', code: '017', suggestedLessons: 1 },
    { name: 'Factors Affecting Enzymes: Temperature & Denaturation', code: '018', suggestedLessons: 1 },
    { name: 'Factors Affecting Enzymes: pH Effects', code: '019', suggestedLessons: 1 },
    { name: 'Practical: Investigating Enzyme Activity & Catalase', code: '020', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 2 · Plant Nutrition & Photosynthesis', code: '2.1', subtopics: [
    { name: 'Photosynthesis Equation & Energy Transfer', code: '021', suggestedLessons: 1 },
    { name: 'Leaf Structure & Functional Adaptations', code: '022', suggestedLessons: 1 },
    { name: 'Mineral Requirements: Nitrate & Magnesium Ions', code: '023', suggestedLessons: 1 },
    { name: 'Limiting Factors in Photosynthesis (Light, CO2, Temperature)', code: '024', suggestedLessons: 1 },
    { name: 'Practical: Investigating Light Intensity on Aquatic Plants', code: '025', suggestedLessons: 1 },
    { name: 'Practical: Testing a Leaf for Starch', code: '026', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 2 · Transport in Plants', code: '2.2', subtopics: [
    { name: 'Xylem & Phloem Structure and Function', code: '027', suggestedLessons: 1 },
    { name: 'Water Uptake & Root Hair Cells', code: '028', suggestedLessons: 1 },
    { name: 'The Transpiration Stream & Factors Affecting Transpiration', code: '029', suggestedLessons: 1 },
    { name: 'Practical: Using a Potometer to Measure Transpiration', code: '030', suggestedLessons: 1 },
    { name: 'Wilting & Turgor Pressure in Plants', code: '031', suggestedLessons: 1 },
    { name: 'Translocation of Sucrose & Amino Acids in Phloem', code: '032', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 3 · Human Nutrition & Digestion', code: '3.1', subtopics: [
    { name: 'Balanced Diet: Nutrients, Roles & Energy Demands', code: '033', suggestedLessons: 1 },
    { name: 'Nutrient Deficiency Diseases (Scurvy, Rickets, Anaemia, Kwashiorkor)', code: '034', suggestedLessons: 1 },
    { name: 'Anatomy of the Human Alimentary Canal', code: '035', suggestedLessons: 1 },
    { name: 'Mechanical Digestion & Teeth Types/Care', code: '036', suggestedLessons: 1 },
    { name: 'Chemical Digestion: Amylase, Proteases & Lipases', code: '037', suggestedLessons: 1 },
    { name: 'Functions of Bile & Stomach Acid', code: '038', suggestedLessons: 1 },
    { name: 'Absorption in the Small Intestine: Villi Adaptations', code: '039', suggestedLessons: 1 },
    { name: 'Assimilation & Egestion', code: '040', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 3 · Transport in Animals', code: '3.2', subtopics: [
    { name: 'Double vs. Single Circulatory Systems', code: '041', suggestedLessons: 1 },
    { name: 'Heart Anatomy & Blood Flow Pathway', code: '042', suggestedLessons: 1 },
    { name: 'The Cardiac Cycle & Heart Rate Control', code: '043', suggestedLessons: 1 },
    { name: 'Coronary Heart Disease: Causes, Risk Factors & Prevention', code: '044', suggestedLessons: 1 },
    { name: 'Blood Vessel Structure: Arteries, Veins & Capillaries', code: '045', suggestedLessons: 1 },
    { name: 'Blood Components: Plasma & Red Blood Cells', code: '046', suggestedLessons: 1 },
    { name: 'Blood Components: White Blood Cells & Platelets', code: '047', suggestedLessons: 1 },
    { name: 'Lymphatic System & Tissue Fluid', code: '048', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 3 · Pathogens, Diseases & Immunity', code: '3.3', subtopics: [
    { name: 'Pathogens & Transmissible Diseases', code: '049', suggestedLessons: 1 },
    { name: 'Physical & Chemical Barriers to Infection', code: '050', suggestedLessons: 1 },
    { name: 'Phagocytosis & Antibody Production by Lymphocytes', code: '051', suggestedLessons: 1 },
    { name: 'Active vs. Passive Immunity & Memory Cells', code: '052', suggestedLessons: 1 },
    { name: 'Vaccination Principles & Herd Immunity', code: '053', suggestedLessons: 1 },
    { name: 'Case Study: Cholera, Toxin Mechanism & Oral Rehydration', code: '054', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 3 · Gas Exchange in Humans', code: '3.4', subtopics: [
    { name: 'Structure of the Human Respiratory System', code: '055', suggestedLessons: 1 },
    { name: 'Gas Exchange Surface Adaptations in Alveoli', code: '056', suggestedLessons: 1 },
    { name: 'Mechanics of Breathing: Ventilation', code: '057', suggestedLessons: 1 },
    { name: 'Effects of Exercise on Breathing Rate & Depth', code: '058', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 3 · Respiration', code: '3.5', subtopics: [
    { name: 'Aerobic Respiration Equation & Uses of Energy', code: '059', suggestedLessons: 1 },
    { name: 'Anaerobic Respiration in Humans & Oxygen Debt', code: '060', suggestedLessons: 1 },
    { name: 'Anaerobic Respiration in Yeast & Industrial Fermentation', code: '061', suggestedLessons: 1 },
    { name: 'Practical: Respirometers & Energy Release in Germinating Seeds', code: '062', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 3 · Excretion in Humans', code: '3.6', subtopics: [
    { name: 'Excretory Products & Deamination in the Liver', code: '063', suggestedLessons: 1 },
    { name: 'Kidney Anatomy & The Urinary System', code: '064', suggestedLessons: 1 },
    { name: 'Nephron Function: Ultrafiltration & Selective Reabsorption', code: '065', suggestedLessons: 1 },
    { name: 'Kidney Dialysis vs. Organ Transplantation', code: '066', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 3 · Coordination & Response', code: '3.7', subtopics: [
    { name: 'Central Nervous System, Neurons & Nerve Impulses', code: '067', suggestedLessons: 1 },
    { name: 'Reflex Arcs & Synaptic Transmission', code: '068', suggestedLessons: 1 },
    { name: 'Structure & Function of the Human Eye', code: '069', suggestedLessons: 1 },
    { name: 'Accommodation & Light Reflexes in the Eye', code: '070', suggestedLessons: 1 },
    { name: 'Endocrine System: Hormones vs. Nervous Control', code: '071', suggestedLessons: 1 },
    { name: 'Adrenaline, Insulin, Glucagon, Testosterone & Oestrogen', code: '072', suggestedLessons: 1 },
    { name: 'Plant Tropisms: Phototropism & Gravitropism Mechanism (Auxins)', code: '073', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 3 · Homeostasis', code: '3.8', subtopics: [
    { name: 'Principles of Homeostasis & Negative Feedback Loops', code: '074', suggestedLessons: 1 },
    { name: 'Thermoregulation: Skin Mechanisms & Core Temperature Control', code: '075', suggestedLessons: 1 },
    { name: 'Blood Glucose Regulation: Insulin, Glucagon & Diabetes', code: '076', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 3 · Drugs', code: '3.9', subtopics: [
    { name: 'Antibiotics, Resistance, Alcohol & Anabolic Steroids', code: '077', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 4 · Reproduction', code: '4.1', subtopics: [
    { name: 'Asexual Reproduction Principles & Examples', code: '078', suggestedLessons: 1 },
    { name: 'Sexual Reproduction Principles & Meiosis Overview', code: '079', suggestedLessons: 1 },
    { name: 'Flower Anatomy & Insect vs. Wind Pollination', code: '080', suggestedLessons: 1 },
    { name: 'Fertilisation & Seed/Fruit Formation', code: '081', suggestedLessons: 1 },
    { name: 'Human Male & Female Reproductive Systems', code: '082', suggestedLessons: 1 },
    { name: 'The Menstrual Cycle & Hormonal Control (FSH, LH, Oestrogen, Progesterone)', code: '083', suggestedLessons: 1 },
    { name: 'Fertilisation, Pregnancy, Placenta Function & Antenatal Care', code: '084', suggestedLessons: 1 },
    { name: 'Sexually Transmitted Infections (STIs) & HIV/AIDS', code: '085', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 4 · Inheritance & Genetics', code: '4.2', subtopics: [
    { name: 'Chromosomes, Genes, Alleles & Genotype/Phenotype', code: '086', suggestedLessons: 1 },
    { name: 'Mitosis & Cell Division Cycle', code: '087', suggestedLessons: 1 },
    { name: 'Meiosis & Formation of Gametes', code: '088', suggestedLessons: 1 },
    { name: 'Monohybrid Inheritance & Punnett Squares', code: '089', suggestedLessons: 1 },
    { name: 'Codominance & Human ABO Blood Groups', code: '090', suggestedLessons: 1 },
    { name: 'Sex Determination & Sex-Linked Genes (Colour Blindness)', code: '091', suggestedLessons: 1 },
    { name: 'Protein Synthesis: mRNA, Codons & Ribosomes', code: '092', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 4 · Variation & Selection', code: '4.3', subtopics: [
    { name: 'Continuous vs. Discontinuous Variation', code: '093', suggestedLessons: 1 },
    { name: 'Gene Mutations & Causes (Radiation, Mutagens)', code: '094', suggestedLessons: 1 },
    { name: 'Adaptive Features & Hydrophytes/Xerophytes', code: '095', suggestedLessons: 1 },
    { name: 'Natural Selection Mechanism & Antibiotic Resistance Evolution', code: '096', suggestedLessons: 1 },
    { name: 'Selective Breeding in Plants & Animals', code: '097', suggestedLessons: 1 },
    { name: 'Comparing Natural vs. Artificial Selection', code: '098', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 5 · Organisms & Environment', code: '5.1', subtopics: [
    { name: 'Ecosystem Terms: Population, Community, Ecosystem, Niche', code: '099', suggestedLessons: 1 },
    { name: 'Food Chains, Food Webs & Trophic Levels', code: '100', suggestedLessons: 1 },
    { name: 'Pyramids of Numbers, Biomass & Energy Efficiency', code: '101', suggestedLessons: 1 },
    { name: 'Carbon Cycle & Role of Microorganisms', code: '102', suggestedLessons: 1 },
    { name: 'Water Cycle Mechanisms', code: '103', suggestedLessons: 1 },
    { name: 'Nitrogen Cycle & Nitrogen-Fixing Bacteria', code: '104', suggestedLessons: 1 },
    { name: 'Population Growth Curves (Lag, Log, Stationary, Death)', code: '105', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 5 · Human Influences on Ecosystems', code: '5.2', subtopics: [
    { name: 'Food Production, Monocultures & Habitat Destruction', code: '106', suggestedLessons: 1 },
    { name: 'Deforestation Impacts & Soil Erosion', code: '107', suggestedLessons: 1 },
    { name: 'Water Pollution: Eutrophication & Sewage Discharge', code: '108', suggestedLessons: 1 },
    { name: 'Greenhouse Gases, Global Warming & Climate Change', code: '109', suggestedLessons: 1 },
    { name: 'Conservation Efforts, Endangered Species & Recycling', code: '110', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 5 · Biotechnology & Genetic Engineering', code: '5.3', subtopics: [
    { name: 'Role of Bacteria & Fungi in Biotechnology', code: '111', suggestedLessons: 1 },
    { name: 'Yeast in Breadmaking & Bioethanol Production', code: '112', suggestedLessons: 1 },
    { name: 'Pectinase, Biological Washing Powders & Lactase', code: '113', suggestedLessons: 1 },
    { name: 'Penicillin Production & Industrial Fermenters', code: '114', suggestedLessons: 1 },
    { name: 'Recombinant DNA Technology & Insulin Production', code: '115', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 6 · Practical Paper Skills', code: '6.1', subtopics: [
    { name: 'Identifying Variables & Designing Controlled Experiments', code: '116', suggestedLessons: 1 },
    { name: 'Data Collection, Table Formatting & Unit Precision', code: '117', suggestedLessons: 1 },
    { name: 'Graph Drawing Rules (Axes, Scales, Line of Best Fit)', code: '118', suggestedLessons: 1 },
    { name: 'Drawing Biological Specimens & Calculating Magnification', code: '119', suggestedLessons: 1 },
    { name: 'Identifying Experimental Errors & Suggesting Improvements', code: '120', suggestedLessons: 1 },
    { name: 'Testing Plan for Unknown Solutions & Gases', code: '121', suggestedLessons: 1 },
    { name: 'Practical Skills Walkthrough (Paper 6)', code: '122', suggestedLessons: 1 },
  ]},
  { topic: 'Unit 6 · Exam Revision & Past Paper Strategy', code: '6.2', subtopics: [
    { name: 'Multiple Choice Technique (Paper 1/2 Strategy)', code: '123', suggestedLessons: 1 },
    { name: 'Command Words: Explain, Describe, Suggest (Paper 3/4 Strategy)', code: '124', suggestedLessons: 1 },
    { name: 'Past Paper Revision: Cells, Molecules & Enzymes', code: '125', suggestedLessons: 1 },
    { name: 'Past Paper Revision: Plant Physiology', code: '126', suggestedLessons: 1 },
    { name: 'Past Paper Revision: Human Systems & Homeostasis', code: '127', suggestedLessons: 1 },
    { name: 'Past Paper Revision: Genetics & Inheritance Calculations', code: '128', suggestedLessons: 1 },
    { name: 'Past Paper Revision: Ecology & Biotechnology', code: '129', suggestedLessons: 1 },
    { name: 'Mock Exam Review & Final Exam Tips', code: '130', suggestedLessons: 1 },
  ]},
]
// ── IGCSE CHEMISTRY 0620 ───────────────────────────────────
// 12 topics covering full Cambridge IGCSE Chemistry syllabus.
// Source: Cambridge IGCSE Chemistry 0620 Syllabus 2026-2028.
// Extended (Supplement) content integrated into subtopic descriptions.
const IGCSE_CHEMISTRY_0620 = [
  { topic: 'States of matter (SOM)', code: 'SOM', subtopics: [
    { name: 'Solids, liquids and gases: properties; arrangement and motion of particles', code: 'SOM1', suggestedLessons: 2 },
    { name: 'Changes of state: melting, boiling, evaporation, freezing, condensation, sublimation', code: 'SOM2', suggestedLessons: 3 },
    { name: 'Kinetic particle theory; effect of temperature and pressure on gases', code: 'SOM3', suggestedLessons: 3 },
    { name: 'Diffusion in gases and liquids; effect of relative molecular mass on rate (Extended)', code: 'SOM4', suggestedLessons: 2 },
  ]},
  { topic: 'Atoms, elements and compounds (AEC)', code: 'AEC', subtopics: [
    { name: 'Elements, compounds and mixtures; symbols and formulae', code: 'AEC1', suggestedLessons: 3 },
    { name: 'Atomic structure: protons, neutrons, electrons; mass number and atomic number', code: 'AEC2', suggestedLessons: 3 },
    { name: 'Isotopes; relative atomic mass', code: 'AEC3', suggestedLessons: 2 },
    { name: 'Electronic configuration; relationship to periodic table position', code: 'AEC4', suggestedLessons: 3 },
    { name: 'Ionic bonding: formation of ions; ionic structures (giant lattice)', code: 'AEC5', suggestedLessons: 4 },
    { name: 'Covalent bonding: simple molecules; dot-and-cross diagrams; giant covalent structures (diamond, graphite, silicon dioxide)', code: 'AEC6', suggestedLessons: 4 },
    { name: 'Metallic bonding; properties of metals (Extended)', code: 'AEC7', suggestedLessons: 2 },
  ]},
  { topic: 'Stoichiometry (STO)', code: 'STO', subtopics: [
    { name: 'Chemical formulae and equations; balancing', code: 'STO1', suggestedLessons: 3 },
    { name: 'Relative formula mass; percentage composition; empirical and molecular formulae', code: 'STO2', suggestedLessons: 3 },
    { name: 'The mole concept; Avogadro constant; mole calculations (mass, gas volume, concentration)', code: 'STO3', suggestedLessons: 5 },
    { name: 'Reacting masses; limiting reactant; percentage yield and atom economy (Extended)', code: 'STO4', suggestedLessons: 4 },
  ]},
  { topic: 'Electrochemistry (ECH)', code: 'ECH', subtopics: [
    { name: 'Electrolysis: principles; ions migration in molten/aqueous solutions', code: 'ECH1', suggestedLessons: 3 },
    { name: 'Electrolysis examples: molten lead bromide, aqueous sodium chloride, aqueous copper sulfate', code: 'ECH2', suggestedLessons: 4 },
    { name: 'Industrial electrolysis: aluminium extraction, chlor-alkali process', code: 'ECH3', suggestedLessons: 3 },
    { name: 'Hydrogen-oxygen fuel cells; advantages (Extended)', code: 'ECH4', suggestedLessons: 2 },
  ]},
  { topic: 'Chemical energetics (ENG)', code: 'ENG', subtopics: [
    { name: 'Exothermic and endothermic reactions; temperature change and energy profile diagrams', code: 'ENG1', suggestedLessons: 3 },
    { name: 'Bond breaking and bond making; calculating energy change from bond energies (Extended)', code: 'ENG2', suggestedLessons: 3 },
  ]},
  { topic: 'Chemical reactions (RXN)', code: 'RXN', subtopics: [
    { name: 'Physical and chemical changes', code: 'RXN1', suggestedLessons: 1 },
    { name: 'Rate of reaction: factors affecting (concentration, temperature, surface area, catalyst)', code: 'RXN2', suggestedLessons: 4 },
    { name: 'Investigations into rate of reaction; collision theory', code: 'RXN3', suggestedLessons: 3 },
    { name: "Reversible reactions and dynamic equilibrium; Le Chatelier's principle (Extended)", code: 'RXN4', suggestedLessons: 3 },
    { name: 'Redox reactions: oxidation and reduction; oxidation states (Extended)', code: 'RXN5', suggestedLessons: 3 },
  ]},
  { topic: 'Acids, bases and salts (ABS)', code: 'ABS', subtopics: [
    { name: 'Properties of acids, alkalis and bases; pH scale and indicators', code: 'ABS1', suggestedLessons: 3 },
    { name: 'Strong and weak acids (Extended); neutralisation reactions', code: 'ABS2', suggestedLessons: 3 },
    { name: 'Oxides: acidic, basic, amphoteric, neutral', code: 'ABS3', suggestedLessons: 2 },
    { name: 'Preparation of soluble and insoluble salts; titration; crystallisation', code: 'ABS4', suggestedLessons: 4 },
    { name: 'Identification of ions: cations (flame tests, NaOH, ammonia) and anions (carbonate, halide, sulfate, nitrate)', code: 'ABS5', suggestedLessons: 3 },
    { name: 'Identification of gases: H2, O2, CO2, NH3, Cl2', code: 'ABS6', suggestedLessons: 1 },
  ]},
  { topic: 'The Periodic Table (PTB)', code: 'PTB', subtopics: [
    { name: 'Arrangement of elements: groups and periods; structure of periodic table', code: 'PTB1', suggestedLessons: 2 },
    { name: 'Group I — alkali metals: properties, reactivity trend', code: 'PTB2', suggestedLessons: 3 },
    { name: 'Group VII — halogens: properties, reactivity trend, displacement reactions', code: 'PTB3', suggestedLessons: 3 },
    { name: 'Group VIII — noble gases: properties and uses', code: 'PTB4', suggestedLessons: 1 },
    { name: 'Transition elements: properties and uses', code: 'PTB5', suggestedLessons: 2 },
  ]},
  { topic: 'Metals (MET)', code: 'MET', subtopics: [
    { name: 'Physical properties of metals; alloys (brass, stainless steel) and their uses', code: 'MET1', suggestedLessons: 2 },
    { name: 'Reactivity series; reactions of metals with water, acids, and oxygen', code: 'MET2', suggestedLessons: 4 },
    { name: 'Displacement reactions of metals; redox in context (Extended)', code: 'MET3', suggestedLessons: 2 },
    { name: 'Extraction of metals: iron in blast furnace; recycling', code: 'MET4', suggestedLessons: 4 },
    { name: 'Aluminium: extraction by electrolysis; uses; corrosion of iron (rusting)', code: 'MET5', suggestedLessons: 2 },
  ]},
  { topic: 'Chemistry of the environment (ENV)', code: 'ENV', subtopics: [
    { name: 'Water: tests for purity; treatment of domestic water', code: 'ENV1', suggestedLessons: 2 },
    { name: 'Fertilisers: NPK; ammonia production (Haber process)', code: 'ENV2', suggestedLessons: 3 },
    { name: 'Air composition; air pollutants (CO, SO2, NOx, particulates); methods of reducing', code: 'ENV3', suggestedLessons: 3 },
    { name: 'Greenhouse effect, global warming; climate change', code: 'ENV4', suggestedLessons: 2 },
  ]},
  { topic: 'Organic chemistry (ORG)', code: 'ORG', subtopics: [
    { name: 'Fuels: petroleum (crude oil); fractional distillation; uses of fractions', code: 'ORG1', suggestedLessons: 3 },
    { name: 'Naming organic compounds; functional groups; homologous series', code: 'ORG2', suggestedLessons: 3 },
    { name: 'Alkanes: structure, properties, combustion reactions', code: 'ORG3', suggestedLessons: 3 },
    { name: 'Alkenes: structure, properties; addition reactions (with bromine, hydrogen)', code: 'ORG4', suggestedLessons: 3 },
    { name: 'Alcohols: structure, properties; combustion; production of ethanol (fermentation, hydration of ethene)', code: 'ORG5', suggestedLessons: 3 },
    { name: 'Carboxylic acids: structure, properties; reactions with metals, carbonates, alkalis', code: 'ORG6', suggestedLessons: 2 },
    { name: 'Polymers: addition polymerisation; uses; environmental issues (plastics)', code: 'ORG7', suggestedLessons: 3 },
    { name: 'Condensation polymerisation; proteins, carbohydrates (Extended)', code: 'ORG8', suggestedLessons: 2 },
  ]},
  { topic: 'Experimental techniques and chemical analysis (EXP)', code: 'EXP', subtopics: [
    { name: 'Measurement: mass, time, temperature, volume (liquids and gases)', code: 'EXP1', suggestedLessons: 2 },
    { name: 'Methods of separation: filtration, crystallisation, simple/fractional distillation', code: 'EXP2', suggestedLessons: 3 },
    { name: 'Chromatography: paper chromatography; Rf values; locating agents', code: 'EXP3', suggestedLessons: 3 },
    { name: 'Criteria of purity: melting and boiling points', code: 'EXP4', suggestedLessons: 2 },
  ]},
]
// ── IGCSE PHYSICS 0625 ─────────────────────────────────────
// 6 topics covering full Cambridge IGCSE Physics syllabus.
// Source: Cambridge IGCSE Physics 0625 Syllabus 2026-2028.
// Extended (Supplement) content integrated into subtopic descriptions.
const IGCSE_PHYSICS_0625 = [
  { topic: 'Motion, forces and energy (MFE)', code: 'MFE', subtopics: [
    { name: '1.1 Physical quantities and measurement techniques (length, volume, time, mass, density)', code: 'MFE1', suggestedLessons: 4 },
    { name: '1.2 Motion: speed, velocity, acceleration; distance-time and speed-time graphs', code: 'MFE2', suggestedLessons: 5 },
    { name: '1.3 Mass and weight; gravitational field strength; weight = mass × g', code: 'MFE3', suggestedLessons: 2 },
    { name: '1.4 Density: definition, formula, methods of measuring density of solids and liquids', code: 'MFE4', suggestedLessons: 3 },
    { name: '1.5 Forces: types, effects on motion; resultant force; friction and drag', code: 'MFE5', suggestedLessons: 4 },
    { name: "1.5 Newton's first, second and third laws (Extended); F = ma", code: 'MFE6', suggestedLessons: 4 },
    { name: '1.5 Circular motion: qualitative description (centripetal force)', code: 'MFE7', suggestedLessons: 2 },
    { name: '1.5 Turning effects: moment of a force; principle of moments; centre of gravity', code: 'MFE8', suggestedLessons: 4 },
    { name: '1.5 Momentum and impulse (Extended); conservation of momentum', code: 'MFE9', suggestedLessons: 3 },
    { name: '1.6 Energy stores; energy transfers; conservation of energy', code: 'MFE10', suggestedLessons: 3 },
    { name: '1.6 Work, power; kinetic energy and gravitational potential energy formulae; efficiency', code: 'MFE11', suggestedLessons: 4 },
    { name: '1.7 Energy resources: renewable (solar, wind, hydroelectric, geothermal, biofuels, tidal, wave) and non-renewable (fossil fuels, nuclear); advantages/disadvantages', code: 'MFE12', suggestedLessons: 3 },
    { name: '1.8 Pressure: definition; pressure in fluids; manometer; atmospheric pressure', code: 'MFE13', suggestedLessons: 3 },
  ]},
  { topic: 'Thermal physics (TPH)', code: 'TPH', subtopics: [
    { name: '2.1 Kinetic particle model of matter: states of matter; pressure and temperature effects on gases; absolute zero (Extended)', code: 'TPH1', suggestedLessons: 4 },
    { name: '2.2 Thermal properties and temperature: thermal expansion of solids/liquids/gases; thermometers; specific heat capacity; specific latent heat (Extended)', code: 'TPH2', suggestedLessons: 5 },
    { name: '2.3 Transfer of thermal energy: conduction, convection, radiation; good and bad emitters/absorbers; everyday applications', code: 'TPH3', suggestedLessons: 4 },
  ]},
  { topic: 'Waves (WAV)', code: 'WAV', subtopics: [
    { name: '3.1 General properties of waves: transverse and longitudinal; wavelength, frequency, period, amplitude, speed; wave equation v = fλ', code: 'WAV1', suggestedLessons: 4 },
    { name: "3.2 Light: reflection (laws of); refraction (laws of, Snell's law); refractive index; total internal reflection; critical angle", code: 'WAV2', suggestedLessons: 5 },
    { name: '3.2 Lenses: thin converging lens; ray diagrams; real and virtual images; uses (camera, projector, magnifier)', code: 'WAV3', suggestedLessons: 4 },
    { name: '3.3 Electromagnetic spectrum: order of components; properties; uses and dangers (radio, microwave, infrared, visible, UV, X-ray, gamma)', code: 'WAV4', suggestedLessons: 3 },
    { name: '3.4 Sound: production and propagation; speed in different media; reflection (echoes); ultrasound; range of human hearing', code: 'WAV5', suggestedLessons: 3 },
  ]},
  { topic: 'Electricity and magnetism (EMG)', code: 'EMG', subtopics: [
    { name: '4.1 Simple magnetism: properties of magnets; magnetic materials; magnetic fields and field lines', code: 'EMG1', suggestedLessons: 3 },
    { name: "4.2 Electrical quantities: electric charge (positive/negative); current; potential difference; resistance; Ohm's law", code: 'EMG2', suggestedLessons: 5 },
    { name: '4.2 Electrical energy and power; energy = IVt; cost of electricity', code: 'EMG3', suggestedLessons: 3 },
    { name: '4.3 Electric circuits: circuit symbols; series and parallel circuits; current/voltage rules; combining resistances', code: 'EMG4', suggestedLessons: 5 },
    { name: '4.4 Practical electricity: household wiring; fuses, earthing; dangers; choosing fuse rating', code: 'EMG5', suggestedLessons: 3 },
    { name: '4.5 Electromagnetic effects: electromagnetic induction; AC generator', code: 'EMG6', suggestedLessons: 3 },
    { name: '4.5 Magnetic effect of current; electromagnets and uses; transformers (Extended)', code: 'EMG7', suggestedLessons: 4 },
    { name: '4.5 Force on a current-carrying conductor; the d.c. motor', code: 'EMG8', suggestedLessons: 3 },
  ]},
  { topic: 'Nuclear physics (NUC)', code: 'NUC', subtopics: [
    { name: "5.1 The nuclear atom: structure (protons, neutrons, electrons); nuclide notation; isotopes; Rutherford's alpha-particle scattering", code: 'NUC1', suggestedLessons: 4 },
    { name: '5.2 Radioactivity: types of nuclear radiation (alpha, beta, gamma); properties and penetration; detection; background radiation', code: 'NUC2', suggestedLessons: 4 },
    { name: '5.2 Random nature of decay; half-life (definition and calculations); nuclear equations (Extended)', code: 'NUC3', suggestedLessons: 3 },
    { name: '5.2 Uses of radioactivity (medical, industrial); safety; nuclear fission and fusion (Extended)', code: 'NUC4', suggestedLessons: 3 },
  ]},
  { topic: 'Space physics (SPA)', code: 'SPA', subtopics: [
    { name: '6.1 Earth: rotation (day/night, time zones); orbit (year, seasons); the Moon (phases, eclipses)', code: 'SPA1', suggestedLessons: 3 },
    { name: '6.1 The Solar System: planets, dwarf planets, asteroids, comets; gravitational attraction and orbits', code: 'SPA2', suggestedLessons: 3 },
    { name: '6.2 Stars and the Universe: galaxies and the Milky Way; light-years; classification of stars; the Sun as a star', code: 'SPA3', suggestedLessons: 3 },
    { name: '6.2 Stellar evolution: nebula → star → main sequence → red giant/supergiant → white dwarf / supernova → neutron star/black hole; Hertzsprung-Russell diagram (Extended)', code: 'SPA4', suggestedLessons: 3 },
    { name: '6.2 The expanding Universe: red-shift; Big Bang theory; cosmic microwave background (Extended)', code: 'SPA5', suggestedLessons: 3 },
  ]},
]

// ── IGCSE SCIENCES LIBRARY ─────────────────────────────────
// Maps Subject names to the appropriate spine constant.
// 0580 IGCSE Maths is handled separately by loadIgcseMaths (the original
// pattern). All other IGCSE subjects are loaded via loadIgcseSpine,
// using the IGCSE_LIBRARY below.
const IGCSE_SCIENCES_LIBRARY = [
  { match: /\bbiology\b/i,    const_: IGCSE_BIOLOGY_0610,   source: 'IGCSE Biology — 130-lesson scheme (Cambridge 0610 & Edexcel 4BI1)' },
  { match: /\bchemistry\b/i,  const_: IGCSE_CHEMISTRY_0620, source: 'Cambridge IGCSE Chemistry 0620' },
  { match: /\bphysics\b/i,    const_: IGCSE_PHYSICS_0625,   source: 'Cambridge IGCSE Physics 0625' },
]

// ── IGCSE FIRST LANGUAGE ENGLISH 0500 ───────────────────────
// 3 strand topics × ~6 subtopics each = ~18 subtopics.
// Source: Cambridge IGCSE First Language English 0500 Syllabus 2027-2029.
// Built around the 15 official Assessment Objectives (R1-R5, W1-W5, SL1-SL5).
const IGCSE_ENGLISH_LANG_0500 = [
  { topic: 'Reading skills (R)', code: 'R', subtopics: [
    { name: 'R1: Demonstrate understanding of explicit meanings (literal comprehension; locating information; following narrative)', code: 'R1', suggestedLessons: 4 },
    { name: 'R2: Demonstrate understanding of implicit meanings and attitudes (inference; reading between the lines; identifying tone)', code: 'R2', suggestedLessons: 5 },
    { name: 'R3: Analyse, evaluate and develop facts, ideas and opinions, using appropriate support from the text (engaging with arguments; evaluating viewpoints; using textual evidence)', code: 'R3', suggestedLessons: 6 },
    { name: "R4: Demonstrate understanding of how writers achieve effects and influence readers (language analysis; figurative devices; structural choices; word-level effects)", code: 'R4', suggestedLessons: 8 },
    { name: 'R5: Select and use information for specific purposes (selective reading; summary writing; synthesising across multiple texts)', code: 'R5', suggestedLessons: 6 },
    { name: 'Exam practice: Paper 1 directed-response writing tasks from non-fiction passages', code: 'REX', suggestedLessons: 4 },
  ]},
  { topic: 'Writing skills (W)', code: 'W', subtopics: [
    { name: 'W1: Articulate experience and express what is thought, felt and imagined (descriptive writing; narrative writing; personal voice)', code: 'W1', suggestedLessons: 6 },
    { name: 'W2: Organise and structure facts, ideas and opinions for deliberate effect (paragraphing; openings and endings; coherence and cohesion)', code: 'W2', suggestedLessons: 5 },
    { name: 'W3: Use a range of vocabulary and sentence structures appropriate to context (lexical range; varied syntax; sophisticated diction)', code: 'W3', suggestedLessons: 6 },
    { name: 'W4: Use language appropriate to purpose and to engage the audience (register; tone; rhetoric; persuasive techniques)', code: 'W4', suggestedLessons: 5 },
    { name: 'W5: Make accurate use of spelling, punctuation and grammar (technical accuracy; proofreading; sentence-level correctness)', code: 'W5', suggestedLessons: 4 },
    { name: 'Exam practice: Paper 2 composition tasks (narrative and descriptive)', code: 'WEX1', suggestedLessons: 5 },
    { name: 'Exam practice: Directed writing tasks (letter, article, speech, report, journal)', code: 'WEX2', suggestedLessons: 5 },
  ]},
  { topic: 'Speaking and Listening (SL)', code: 'SL', subtopics: [
    { name: 'SL1: Articulate experience and express what is thought, felt and imagined orally (individual talk preparation; structured oral presentation)', code: 'SL1', suggestedLessons: 4 },
    { name: 'SL2: Organise and structure ideas and opinions orally for deliberate effect (planning extended talk; signposting; conclusions)', code: 'SL2', suggestedLessons: 3 },
    { name: 'SL3: Use a range of vocabulary and grammatical structures in spoken English (precision in spoken vocabulary; spoken sentence variety)', code: 'SL3', suggestedLessons: 3 },
    { name: 'SL4: Use spoken register appropriate to context (formal vs informal; adapting to audience; tone in speech)', code: 'SL4', suggestedLessons: 3 },
    { name: 'SL5: Listen and respond appropriately in conversation (active listening; responding to questions; sustaining dialogue; turn-taking)', code: 'SL5', suggestedLessons: 4 },
    { name: 'Exam practice: Individual task (2-3 min presentation) and conversation with examiner (6-7 min)', code: 'SLEX', suggestedLessons: 4 },
  ]},
]
// ── IGCSE LITERATURE IN ENGLISH 0475 ────────────────────────
// 8 topics: AO foundations + per-form (Poetry, Prose, Drama, Unseen)
// + cross-cutting (Comparative, Context, Personal Response).
// Source: Cambridge IGCSE Literature in English 0475 Syllabus 2028-2030.
// Skills-based (text-agnostic — durable across set-text rotations).
const IGCSE_ENGLISH_LIT_0475 = [
  { topic: 'Foundations: The 4 Assessment Objectives (AO)', code: 'AO', subtopics: [
    { name: 'AO1 — Knowledge of text content: detailed recall, use of quotations, supporting reference to text', code: 'AO1', suggestedLessons: 3 },
    { name: 'AO2 — Understanding meanings and contexts: explicit and implicit meanings; awareness of historical, cultural, social context', code: 'AO2', suggestedLessons: 4 },
    { name: "AO3 — Analysis of writers' methods: language, structure, form; literary devices and their effects", code: 'AO3', suggestedLessons: 5 },
    { name: 'AO4 — Personal response: sensitive, informed, communicating own engagement with the text', code: 'AO4', suggestedLessons: 3 },
  ]},
  { topic: 'Poetry (POE)', code: 'POE', subtopics: [
    { name: 'Approaching poetry: form, structure (stanzas, line breaks, enjambement), voice, persona', code: 'POE1', suggestedLessons: 4 },
    { name: 'Poetic language: metaphor, simile, personification, imagery, symbolism, sound devices (alliteration, assonance, sibilance)', code: 'POE2', suggestedLessons: 5 },
    { name: 'Poetic structure: rhyme schemes, metre (iambic pentameter, trochaic), free verse, sonnets, ballads', code: 'POE3', suggestedLessons: 4 },
    { name: 'Themes and contexts in poetry: how to identify themes; placing poems in their cultural/historical context', code: 'POE4', suggestedLessons: 3 },
    { name: 'Comparing poems: similarities and differences in treatment of theme, tone, technique', code: 'POE5', suggestedLessons: 4 },
    { name: 'Writing about poetry: close-reading essay; quotation embedding; analysis paragraphs (PEEL/PETAL/PEAL)', code: 'POE6', suggestedLessons: 5 },
  ]},
  { topic: 'Prose (PRO)', code: 'PRO', subtopics: [
    { name: 'Narrative voice: first person, third person omniscient, third person limited; reliability of narrator', code: 'PRO1', suggestedLessons: 3 },
    { name: 'Characterisation: methods writers use to create characters; direct and indirect characterisation', code: 'PRO2', suggestedLessons: 4 },
    { name: 'Setting and atmosphere: how place and time function; symbolic settings; pathetic fallacy', code: 'PRO3', suggestedLessons: 3 },
    { name: 'Plot and structure: exposition, rising action, climax, falling action, resolution; flashback, foreshadowing', code: 'PRO4', suggestedLessons: 3 },
    { name: 'Themes in prose: identifying central themes; tracing themes across a novel; how writers develop themes', code: 'PRO5', suggestedLessons: 4 },
    { name: 'Writing about prose: essay structure; using quotations effectively; balancing detail and overview', code: 'PRO6', suggestedLessons: 5 },
  ]},
  { topic: 'Drama (DRA)', code: 'DRA', subtopics: [
    { name: 'Dramatic form: acts, scenes, dialogue, soliloquy, aside, stage directions', code: 'DRA1', suggestedLessons: 3 },
    { name: 'Characterisation in drama: speech as characterisation; relationships revealed through dialogue; dramatic foils', code: 'DRA2', suggestedLessons: 4 },
    { name: 'Shakespearean conventions: blank verse, iambic pentameter, rhymed couplets at scene endings, prose vs verse', code: 'DRA3', suggestedLessons: 4 },
    { name: 'Dramatic devices: dramatic irony, foreshadowing, comic relief, tragic structure, pathos', code: 'DRA4', suggestedLessons: 4 },
    { name: 'Themes in drama: identifying themes through action and dialogue; how productions interpret themes', code: 'DRA5', suggestedLessons: 3 },
    { name: 'Writing about drama: responding to passage-based questions; whole-play essay questions; quoting from drama', code: 'DRA6', suggestedLessons: 5 },
  ]},
  { topic: 'Unseen analysis (UNS)', code: 'UNS', subtopics: [
    { name: 'Reading an unseen poem: first read, second read, annotation method', code: 'UNS1', suggestedLessons: 3 },
    { name: 'Reading an unseen prose extract: identifying genre, narrative voice, key features quickly', code: 'UNS2', suggestedLessons: 3 },
    { name: 'Structuring an unseen response: introduction, body paragraphs by feature (language, structure, theme), conclusion', code: 'UNS3', suggestedLessons: 3 },
    { name: 'Time management in unseen analysis: planning, drafting, checking under exam conditions', code: 'UNS4', suggestedLessons: 2 },
  ]},
  { topic: 'Comparative analysis (CMP)', code: 'CMP', subtopics: [
    { name: 'Comparing two texts: identifying similarities and differences in theme, style, technique', code: 'CMP1', suggestedLessons: 3 },
    { name: 'Comparing two passages within a single text: how meaning develops; how characters/themes evolve', code: 'CMP2', suggestedLessons: 3 },
    { name: 'Comparative essay structure: integrated vs block comparison; comparative connectives', code: 'CMP3', suggestedLessons: 3 },
  ]},
  { topic: 'Literary contexts (CON)', code: 'CON', subtopics: [
    { name: 'Historical context: era, key events, social conditions affecting a text', code: 'CON1', suggestedLessons: 3 },
    { name: 'Cultural context: cultural attitudes, beliefs, customs reflected in a text', code: 'CON2', suggestedLessons: 3 },
    { name: "Biographical context: author's life and times (used carefully — secondary to text analysis)", code: 'CON3', suggestedLessons: 2 },
    { name: 'Literary context: where a text sits in genre history; influences and echoes', code: 'CON4', suggestedLessons: 2 },
  ]},
  { topic: 'Personal response and critical voice (PRS)', code: 'PRS', subtopics: [
    { name: 'Developing critical opinions: forming, testing, refining personal interpretations', code: 'PRS1', suggestedLessons: 3 },
    { name: 'Justifying personal response with textual evidence: "I think X because the text shows Y"', code: 'PRS2', suggestedLessons: 3 },
    { name: 'Sustaining critical voice through an essay: maintaining stance; avoiding flat summary', code: 'PRS3', suggestedLessons: 3 },
    { name: 'Sensitivity in response: nuance; recognising complexity; avoiding simplistic judgements', code: 'PRS4', suggestedLessons: 3 },
  ]},
]
// ── IGCSE BUSINESS STUDIES 0450 ─────────────────────────────
// 6 units × ~4 subtopics each.
// Source: Cambridge IGCSE Business Studies 0450 Syllabus 2026
// (stable since 2024). Matches official 6-unit structure exactly.
const IGCSE_BUSINESS_0450 = [
  { topic: 'Understanding business activity (UBA)', code: 'UBA', subtopics: [
    { name: '1.1 Business activity: purpose and nature of business; needs and wants; specialisation; value-added; opportunity cost', code: 'UBA1', suggestedLessons: 4 },
    { name: '1.2 Classification of businesses: primary, secondary, tertiary sectors; changing economic structures; mixed economy', code: 'UBA2', suggestedLessons: 3 },
    { name: '1.3 Enterprise, business growth and size: entrepreneurship; reasons for business growth; methods of growth (internal, external); measuring size; reasons businesses fail', code: 'UBA3', suggestedLessons: 4 },
    { name: '1.4 Types of business organisation: sole trader, partnership, private and public limited companies, franchises, cooperatives, joint ventures; public corporations', code: 'UBA4', suggestedLessons: 5 },
    { name: '1.5 Business objectives and stakeholder objectives: SMART objectives; survival, growth, profit, market share, service; stakeholders and their objectives', code: 'UBA5', suggestedLessons: 4 },
  ]},
  { topic: 'People in business (PIB)', code: 'PIB', subtopics: [
    { name: '2.1 Motivating employees: importance of well-motivated workforce; theories (Maslow, Taylor, Herzberg); financial and non-financial motivators', code: 'PIB1', suggestedLessons: 5 },
    { name: '2.2 Organisation and management: organisation structures; spans of control; chain of command; delegation; leadership styles (autocratic, democratic, laissez-faire); functions of management', code: 'PIB2', suggestedLessons: 5 },
    { name: '2.3 Recruitment, selection and training of employees: internal vs external recruitment; recruitment process; types of training (induction, on-the-job, off-the-job); reducing workforce', code: 'PIB3', suggestedLessons: 4 },
    { name: '2.4 Internal and external communication: methods of communication; barriers to effective communication; impact of poor communication', code: 'PIB4', suggestedLessons: 3 },
  ]},
  { topic: 'Marketing (MKT)', code: 'MKT', subtopics: [
    { name: '3.1 Marketing, competition and the customer: role of marketing; identifying customer needs; mass and niche markets; market segmentation; market change', code: 'MKT1', suggestedLessons: 4 },
    { name: '3.2 Market research: primary and secondary research; methods (questionnaires, interviews, focus groups); accuracy of data; presenting findings', code: 'MKT2', suggestedLessons: 4 },
    { name: '3.3 Marketing mix — Product: product range; product development; brand image; packaging; product life cycle; Boston Matrix', code: 'MKT3', suggestedLessons: 5 },
    { name: '3.3 Marketing mix — Price: pricing methods (cost-plus, competitive, penetration, skimming, promotional, dynamic); price elasticity (informal)', code: 'MKT4', suggestedLessons: 4 },
    { name: '3.3 Marketing mix — Place: distribution channels (retailer, wholesaler, direct); e-commerce; advantages and disadvantages of each', code: 'MKT5', suggestedLessons: 3 },
    { name: '3.3 Marketing mix — Promotion: advertising (above- and below-the-line); sales promotions; technology in promotion; legal controls', code: 'MKT6', suggestedLessons: 4 },
    { name: '3.4 Marketing strategy: integrated marketing mix decisions; legal controls on marketing; opportunities and problems of global markets; multinational marketing', code: 'MKT7', suggestedLessons: 4 },
  ]},
  { topic: 'Operations management (OPS)', code: 'OPS', subtopics: [
    { name: '4.1 Production of goods and services: production methods (job, batch, flow); productivity; efficiency; lean production (JIT, kaizen)', code: 'OPS1', suggestedLessons: 5 },
    { name: '4.2 Costs, scale of production and break-even analysis: fixed/variable/total costs; economies and diseconomies of scale; break-even charts; calculations', code: 'OPS2', suggestedLessons: 6 },
    { name: '4.3 Achieving quality production: importance of quality; quality control vs quality assurance; total quality management', code: 'OPS3', suggestedLessons: 3 },
    { name: '4.4 Location decisions: factors affecting location (market, raw materials, labour, transport, government); relocation; international location', code: 'OPS4', suggestedLessons: 4 },
  ]},
  { topic: 'Financial information and decisions (FIN)', code: 'FIN', subtopics: [
    { name: '5.1 Business finance: needs and sources: short-term vs long-term finance; internal sources (retained profit, sale of assets); external sources (loans, share issue, debentures, grants); factors affecting choice', code: 'FIN1', suggestedLessons: 5 },
    { name: '5.2 Cash-flow forecasting and working capital: importance of cash flow; cash-flow forecast structure; calculations; importance of working capital', code: 'FIN2', suggestedLessons: 5 },
    { name: '5.3 Income statements (profit & loss account): gross profit, net profit; calculations; importance of profit', code: 'FIN3', suggestedLessons: 4 },
    { name: '5.4 Statement of financial position (balance sheet): assets, liabilities, capital; basic structure', code: 'FIN4', suggestedLessons: 3 },
    { name: '5.5 Analysis of accounts: profitability ratios (gross profit margin, net profit margin, ROCE); liquidity ratios (current ratio, acid test); user groups', code: 'FIN5', suggestedLessons: 5 },
  ]},
  { topic: 'External influences on business activity (EXT)', code: 'EXT', subtopics: [
    { name: '6.1 Economic issues: business cycle (boom, slump, recession, recovery); effects of inflation, unemployment, exchange rates; government economic policies (taxation, interest rates)', code: 'EXT1', suggestedLessons: 5 },
    { name: '6.2 Environmental and ethical issues: environmental impact of business; sustainable development; externalities; business ethics; conflicts between profit and ethics', code: 'EXT2', suggestedLessons: 4 },
    { name: '6.3 Business and the international economy: globalisation (opportunities and threats); multinational companies; exchange rate changes affecting importers and exporters', code: 'EXT3', suggestedLessons: 4 },
  ]},
]

// ── UNIFIED IGCSE LIBRARY ──────────────────────────────────
// Covers all IGCSE subjects with spines (except Maths 0580 which
// has its own hard-wired loader). Loader auto-detects by subject name.
// ── IGCSE GEOGRAPHY 0460 ───────────────────────────────────
// 3 themes covering full Cambridge IGCSE Geography syllabus.
// Source: Cambridge IGCSE Geography 0460 Syllabus (current, stable 2026-2027).
// Numbering follows official syllabus (1.1, 1.2, etc.).
const IGCSE_GEOGRAPHY_0460 = [
  { topic: 'Population and settlement (POP)', code: 'POP', subtopics: [
    { name: '1.1 Population dynamics: birth rate, death rate, natural change; demographic transition; population policies', code: 'POP1', suggestedLessons: 5 },
    { name: '1.2 Migration: causes of migration; impact on origin and destination; refugees vs economic migrants', code: 'POP2', suggestedLessons: 4 },
    { name: '1.3 Population structure: population pyramids; ageing populations; youthful populations; dependency', code: 'POP3', suggestedLessons: 3 },
    { name: '1.4 Population density and distribution: factors affecting density; over- and under-populated regions', code: 'POP4', suggestedLessons: 3 },
    { name: '1.5 Settlements and service provision: rural vs urban; settlement hierarchy; site, situation, function', code: 'POP5', suggestedLessons: 4 },
    { name: '1.6 Urban settlements: land use patterns (CBD, residential, industrial); urban problems', code: 'POP6', suggestedLessons: 4 },
    { name: '1.7 Urbanisation: causes, advantages, disadvantages; counter-urbanisation; case studies in LICs and HICs', code: 'POP7', suggestedLessons: 5 },
  ]},
  { topic: 'The natural environment (NAT)', code: 'NAT', subtopics: [
    { name: '2.1 Earthquakes and volcanoes: plate tectonics; types of plate boundary; effects and responses', code: 'NAT1', suggestedLessons: 5 },
    { name: '2.2 Rivers: hydrological cycle; processes (erosion, transport, deposition); landforms; flooding and management', code: 'NAT2', suggestedLessons: 6 },
    { name: '2.3 Coasts: marine processes; coastal landforms (cliffs, beaches, spits); coral reefs and mangroves; coastal management', code: 'NAT3', suggestedLessons: 6 },
    { name: '2.4 Weather: weather measurement; weather instruments; describing weather conditions', code: 'NAT4', suggestedLessons: 3 },
    { name: '2.5 Climate and natural vegetation: hot deserts, tropical rainforests, savanna; climate characteristics and adaptations', code: 'NAT5', suggestedLessons: 5 },
  ]},
  { topic: 'Economic development (ECO)', code: 'ECO', subtopics: [
    { name: '3.1 Development: indicators of development (GDP, HDI); inequalities between and within countries', code: 'ECO1', suggestedLessons: 4 },
    { name: '3.2 Food production: types of farming; agricultural systems; effects of agricultural change; food security', code: 'ECO2', suggestedLessons: 5 },
    { name: '3.3 Industry: types of industry; location factors; multinational corporations', code: 'ECO3', suggestedLessons: 4 },
    { name: '3.4 Tourism: growth of tourism; benefits and disadvantages; sustainable tourism', code: 'ECO4', suggestedLessons: 4 },
    { name: '3.5 Energy: types (fossil, nuclear, renewable); world distribution; energy security', code: 'ECO5', suggestedLessons: 4 },
    { name: '3.6 Water: supply and demand; water use; water scarcity; water management', code: 'ECO6', suggestedLessons: 3 },
    { name: '3.7 Environmental risks of economic development: pollution, deforestation, climate change; sustainability', code: 'ECO7', suggestedLessons: 4 },
  ]},
]
// ── IGCSE HISTORY 0470 ─────────────────────────────────────
// Cambridge IGCSE History 0470 Syllabus 2027-2028.
// Option B (20th century — most commonly taught) + Germany 1918-45 Depth Study.
// Includes Historical Skills topic (option-agnostic; applies regardless of option chosen).
const IGCSE_HISTORY_0470 = [
  { topic: 'Core Content Option B — International Relations since 1919 (CORE)', code: 'CORE', subtopics: [
    { name: 'KQ1: Were the peace treaties of 1919-23 fair? Treaty of Versailles; impact on Germany; other treaties', code: 'CORE1', suggestedLessons: 6 },
    { name: 'KQ2: To what extent was the League of Nations a success? Successes and failures; collapse', code: 'CORE2', suggestedLessons: 5 },
    { name: "KQ3: Why had international peace collapsed by 1939? Hitler's foreign policy; appeasement; outbreak of WW2", code: 'CORE3', suggestedLessons: 6 },
    { name: 'KQ4: Who was to blame for the Cold War? Origins; Yalta and Potsdam; Truman Doctrine; Marshall Plan', code: 'CORE4', suggestedLessons: 5 },
    { name: 'KQ5: How effectively did the USA contain Communism? Korean War; Vietnam War; Cuban Missile Crisis', code: 'CORE5', suggestedLessons: 5 },
    { name: 'KQ6: How secure was Soviet control over Eastern Europe? Hungary 1956; Czechoslovakia 1968; Solidarity; 1989', code: 'CORE6', suggestedLessons: 5 },
    { name: 'KQ7: Why did events in the Gulf matter c.1970-2000? Iran-Iraq War; First Gulf War; impact on global politics', code: 'CORE7', suggestedLessons: 4 },
  ]},
  { topic: 'Depth Study — Germany 1918-45 (GER)', code: 'GER', subtopics: [
    { name: 'Weimar Republic 1918-1929: origins; problems 1919-23; recovery under Stresemann; cultural changes', code: 'GER1', suggestedLessons: 5 },
    { name: 'The rise of the Nazi Party: early years; 1923 putsch; reorganisation; impact of Depression; 1933 takeover', code: 'GER2', suggestedLessons: 5 },
    { name: "Hitler's consolidation of power: Reichstag Fire; Enabling Act; Night of the Long Knives; Hindenburg's death", code: 'GER3', suggestedLessons: 4 },
    { name: 'Nazi state and economy: police state; propaganda; economic recovery; rearmament', code: 'GER4', suggestedLessons: 5 },
    { name: 'Life in Nazi Germany: women, young people, workers, church, opposition; persecution of minorities', code: 'GER5', suggestedLessons: 5 },
    { name: 'The Holocaust: from persecution to genocide; Final Solution; resistance and rescue', code: 'GER6', suggestedLessons: 4 },
    { name: 'Germany at war 1939-1945: war economy; home front; defeat and aftermath', code: 'GER7', suggestedLessons: 3 },
  ]},
  { topic: 'Historical Skills (SKL)', code: 'SKL', subtopics: [
    { name: 'Source analysis: identifying purpose; assessing reliability; corroborating across sources', code: 'SKL1', suggestedLessons: 5 },
    { name: 'Cause and consequence: short- vs long-term causes; weighing different factors', code: 'SKL2', suggestedLessons: 4 },
    { name: 'Change and continuity: identifying turning points; assessing significance', code: 'SKL3', suggestedLessons: 3 },
    { name: 'Essay writing: structure; argument development; evidence-based reasoning; conclusion', code: 'SKL4', suggestedLessons: 5 },
  ]},
]
// ── IGCSE SOCIOLOGY 0495 ───────────────────────────────────
// Cambridge IGCSE Sociology 0495 Syllabus 2025-2027.
// 4 AOs + 6 content areas across 2 papers.
// Note: 0495 moves to O Level 2251 from 2028; spine valid for 2025-2027 exams.
const IGCSE_SOCIOLOGY_0495 = [
  { topic: 'Foundations: 4 Assessment Objectives (AO)', code: 'AO', subtopics: [
    { name: 'AO1 — Knowledge and understanding of sociological concepts, theories, evidence, views, and research methods', code: 'AO1', suggestedLessons: 3 },
    { name: 'AO2 — Application of sociological concepts and research methods to support points or arguments', code: 'AO2', suggestedLessons: 4 },
    { name: 'AO3 — Analysis of evidence; how concepts apply to particular issues', code: 'AO3', suggestedLessons: 4 },
    { name: 'AO4 — Evaluation: weighing evidence, assessing strengths and weaknesses of views', code: 'AO4', suggestedLessons: 4 },
  ]},
  { topic: 'Paper 1 Section A — Research Methods (RES)', code: 'RES', subtopics: [
    { name: 'Primary vs secondary data; quantitative vs qualitative methods', code: 'RES1', suggestedLessons: 3 },
    { name: 'Sampling: random, systematic, stratified, snowball, opportunity; representativeness', code: 'RES2', suggestedLessons: 3 },
    { name: 'Surveys and questionnaires: design, advantages, disadvantages', code: 'RES3', suggestedLessons: 3 },
    { name: 'Interviews: structured, unstructured, semi-structured; advantages and disadvantages', code: 'RES4', suggestedLessons: 3 },
    { name: 'Observation: participant, non-participant, covert, overt; ethics', code: 'RES5', suggestedLessons: 3 },
    { name: 'Experiments and case studies; secondary sources (official statistics, documents, media)', code: 'RES6', suggestedLessons: 3 },
    { name: 'Reliability, validity, generalisability; ethics in sociological research', code: 'RES7', suggestedLessons: 3 },
  ]},
  { topic: 'Paper 1 Section B — Identity (IDT)', code: 'IDT', subtopics: [
    { name: 'Socialisation: primary (family) and secondary (school, peers, media, religion, workplace); nature vs nurture', code: 'IDT1', suggestedLessons: 4 },
    { name: 'Culture, norms, values, roles, status; subcultures and counter-cultures', code: 'IDT2', suggestedLessons: 3 },
    { name: 'Gender identity: feminine and masculine roles; changes over time', code: 'IDT3', suggestedLessons: 3 },
    { name: 'Ethnic identity, national identity, social class identity', code: 'IDT4', suggestedLessons: 3 },
    { name: 'Age identities: childhood, youth, middle age, old age — as social constructs', code: 'IDT5', suggestedLessons: 3 },
  ]},
  { topic: 'Paper 1 Section C — Social Inequality (INQ)', code: 'INQ', subtopics: [
    { name: 'Social stratification: class, gender, ethnicity, age; theories of stratification', code: 'INQ1', suggestedLessons: 4 },
    { name: 'Poverty and wealth: absolute vs relative poverty; causes; effects', code: 'INQ2', suggestedLessons: 3 },
    { name: 'Social mobility: upward, downward, intergenerational; factors affecting', code: 'INQ3', suggestedLessons: 3 },
    { name: 'Power and authority: types of authority; political power; influence', code: 'INQ4', suggestedLessons: 3 },
  ]},
  { topic: 'Paper 2 Section A — Family (FAM)', code: 'FAM', subtopics: [
    { name: 'Types of family: nuclear, extended, lone-parent, reconstituted, same-sex; cross-cultural variation', code: 'FAM1', suggestedLessons: 3 },
    { name: 'Family roles and relationships: changes in gender roles; division of labour; conjugal roles', code: 'FAM2', suggestedLessons: 4 },
    { name: 'Marriage and divorce: trends; explanations for changes; impact', code: 'FAM3', suggestedLessons: 3 },
    { name: 'Childhood: changing nature of childhood; child-centred families; abuse and neglect', code: 'FAM4', suggestedLessons: 3 },
    { name: 'Functions of the family; theoretical perspectives (functionalist, feminist, Marxist)', code: 'FAM5', suggestedLessons: 4 },
  ]},
  { topic: 'Paper 2 Section B — Education (EDU)', code: 'EDU', subtopics: [
    { name: 'Functions of education: theoretical perspectives; hidden curriculum', code: 'EDU1', suggestedLessons: 3 },
    { name: 'Types of school; vocational vs academic; private vs state', code: 'EDU2', suggestedLessons: 3 },
    { name: 'Differential educational achievement: by class, gender, ethnicity', code: 'EDU3', suggestedLessons: 4 },
    { name: 'Teacher-pupil relationships; labelling; self-fulfilling prophecy; subcultures in school', code: 'EDU4', suggestedLessons: 4 },
  ]},
  { topic: 'Paper 2 Section C — Crime, Deviance and Social Control (CRM)', code: 'CRM', subtopics: [
    { name: 'Definitions: crime vs deviance; social construction of deviance', code: 'CRM1', suggestedLessons: 3 },
    { name: 'Patterns of crime: by class, gender, age, ethnicity; victims of crime', code: 'CRM2', suggestedLessons: 3 },
    { name: 'Causes of crime: biological, psychological, sociological explanations', code: 'CRM3', suggestedLessons: 4 },
    { name: 'Measuring crime: official statistics, victim surveys, self-report studies; dark figure of crime', code: 'CRM4', suggestedLessons: 3 },
    { name: 'Formal and informal social control: police, courts, prisons; family, peers, media', code: 'CRM5', suggestedLessons: 3 },
  ]},
]
// ── IGCSE ECONOMICS 0455 ───────────────────────────────────
// Cambridge IGCSE Economics 0455 Syllabus 2026.
// 6 sections covering full syllabus. Sub-section numbering (1.1, 1.2, etc.)
// matches official structure exactly.
const IGCSE_ECONOMICS_0455 = [
  { topic: 'The basic economic problem (BEP)', code: 'BEP', subtopics: [
    { name: '1.1 The nature of the economic problem: finite resources vs unlimited wants; scarcity', code: 'BEP1', suggestedLessons: 2 },
    { name: '1.2 Factors of production: land, labour, capital, enterprise; rewards (rent, wages, interest, profit)', code: 'BEP2', suggestedLessons: 3 },
    { name: '1.3 Opportunity cost: definition; influence on decision-making by consumers, workers, firms, government', code: 'BEP3', suggestedLessons: 3 },
    { name: '1.4 Production possibility curve (PPC): drawing and interpreting; points on/under/beyond; shifts', code: 'BEP4', suggestedLessons: 4 },
  ]},
  { topic: 'The allocation of resources (ALR)', code: 'ALR', subtopics: [
    { name: '2.1 Microeconomics and macroeconomics: definitions; the role of markets', code: 'ALR1', suggestedLessons: 2 },
    { name: '2.2 Demand: definition; law of demand; demand curve; non-price determinants; movements vs shifts', code: 'ALR2', suggestedLessons: 4 },
    { name: '2.3 Supply: definition; law of supply; supply curve; non-price determinants; movements vs shifts', code: 'ALR3', suggestedLessons: 4 },
    { name: '2.4 Price determination: equilibrium price and quantity; effect of changes in demand/supply', code: 'ALR4', suggestedLessons: 4 },
    { name: '2.5 Price changes: causes and consequences for consumers, firms, workers, government', code: 'ALR5', suggestedLessons: 3 },
    { name: '2.6 Price elasticity of demand (PED): definition; calculation; determinants; applications', code: 'ALR6', suggestedLessons: 4 },
    { name: '2.7 Price elasticity of supply (PES): definition; calculation; determinants', code: 'ALR7', suggestedLessons: 3 },
    { name: '2.8 Market economic system: advantages and disadvantages; allocation of resources', code: 'ALR8', suggestedLessons: 3 },
    { name: '2.9 Market failure: causes (externalities, public goods, monopoly, lack of information)', code: 'ALR9', suggestedLessons: 4 },
    { name: '2.10 Mixed economic system: government intervention (taxes, subsidies, regulation, price controls)', code: 'ALR10', suggestedLessons: 4 },
  ]},
  { topic: 'Microeconomic decision makers (MIC)', code: 'MIC', subtopics: [
    { name: '3.1 Money and banking: functions of money; role of central and commercial banks', code: 'MIC1', suggestedLessons: 3 },
    { name: '3.2 Households: influences on spending, saving, borrowing', code: 'MIC2', suggestedLessons: 3 },
    { name: '3.3 Workers: factors influencing wage determination; wage differentials; division of labour', code: 'MIC3', suggestedLessons: 4 },
    { name: '3.4 Trade unions: role; collective bargaining; advantages and disadvantages', code: 'MIC4', suggestedLessons: 2 },
    { name: '3.5 Firms: classification (sector, size); growth of firms; mergers; small firms', code: 'MIC5', suggestedLessons: 3 },
    { name: '3.6 Firms and production: productivity; costs (fixed, variable, total, average); economies of scale', code: 'MIC6', suggestedLessons: 4 },
    { name: "3.7 Firms' objectives: profit, growth, survival, social welfare; profit maximisation", code: 'MIC7', suggestedLessons: 3 },
    { name: '3.8 Market structure: competitive markets vs monopoly; characteristics, advantages, disadvantages', code: 'MIC8', suggestedLessons: 4 },
  ]},
  { topic: 'Government and the macroeconomy (MAC)', code: 'MAC', subtopics: [
    { name: '4.1 The role of government: local, national, international; provision of public goods', code: 'MAC1', suggestedLessons: 3 },
    { name: '4.2 Macroeconomic aims: economic growth, low unemployment, price stability, balance of payments', code: 'MAC2', suggestedLessons: 4 },
    { name: '4.3 Fiscal policy: government spending; taxation (direct, indirect, progressive, regressive); budget', code: 'MAC3', suggestedLessons: 5 },
    { name: '4.4 Monetary policy: interest rates; money supply; central bank role', code: 'MAC4', suggestedLessons: 4 },
    { name: '4.5 Supply-side policy: labour market reform; tax incentives; deregulation; education and training', code: 'MAC5', suggestedLessons: 3 },
    { name: '4.6 Economic growth: GDP; causes of growth; benefits and costs of growth', code: 'MAC6', suggestedLessons: 4 },
    { name: '4.7 Employment and unemployment: types of unemployment; causes; consequences; measures to reduce', code: 'MAC7', suggestedLessons: 4 },
    { name: '4.8 Inflation and deflation: types and causes; consequences; measures (CPI); ways to control', code: 'MAC8', suggestedLessons: 4 },
  ]},
  { topic: 'Economic development (DEV)', code: 'DEV', subtopics: [
    { name: '5.1 Living standards: GDP per capita; HDI; comparing living standards across countries and over time', code: 'DEV1', suggestedLessons: 4 },
    { name: '5.2 Poverty: absolute and relative poverty; causes; policies to alleviate', code: 'DEV2', suggestedLessons: 3 },
    { name: '5.3 Population: factors affecting birth rate, death rate, migration; consequences of population change', code: 'DEV3', suggestedLessons: 4 },
    { name: '5.4 Differences in economic development: developed vs developing; characteristics; reasons', code: 'DEV4', suggestedLessons: 4 },
  ]},
  { topic: 'International trade and globalisation (INT)', code: 'INT', subtopics: [
    { name: '6.1 International specialisation: principle of comparative advantage; benefits and disadvantages', code: 'INT1', suggestedLessons: 3 },
    { name: '6.2 Free trade and protection: methods of protection (tariffs, quotas, subsidies); arguments for protection', code: 'INT2', suggestedLessons: 4 },
    { name: '6.3 Foreign exchange rates: determination; floating vs fixed; consequences of changes', code: 'INT3', suggestedLessons: 4 },
    { name: '6.4 Current account of the balance of payments: components; surplus and deficit', code: 'INT4', suggestedLessons: 3 },
    { name: '6.5 Globalisation: causes and effects; role of multinational corporations', code: 'INT5', suggestedLessons: 3 },
  ]},
]
// ── IGCSE ENGLISH AS A SECOND LANGUAGE 0510 ─────────────────
// Cambridge IGCSE English as a Second Language 0510 Syllabus (current, 2024+).
// 4 skill strands — Reading (R1-R4), Writing (W1-W5), Listening (L1-L4), Speaking (SP1-SP5).
// Spine works for both 0510 (speaking non-counting) and 0511 (speaking count-in).
const IGCSE_ESL_0510 = [
  { topic: 'Reading skills (R)', code: 'R', subtopics: [
    { name: 'R1: Identify and select relevant information (skimming and scanning; locating specific details)', code: 'R1', suggestedLessons: 5 },
    { name: 'R2: Understand ideas, opinions and attitudes (literal and inferential comprehension)', code: 'R2', suggestedLessons: 6 },
    { name: 'R3: Show understanding of connections between ideas, opinions and attitudes (linking across a text)', code: 'R3', suggestedLessons: 5 },
    { name: "R4: Understand what is implied but not directly stated (gist, writer's purpose, intention, feelings)", code: 'R4', suggestedLessons: 6 },
    { name: 'Exam practice: Reading exercises (Paper 1) — text types, question formats, time management', code: 'REX', suggestedLessons: 5 },
  ]},
  { topic: 'Writing skills (W)', code: 'W', subtopics: [
    { name: 'W1: Communicate information, ideas, opinions clearly, accurately, effectively', code: 'W1', suggestedLessons: 6 },
    { name: 'W2: Organise ideas into coherent paragraphs using a range of linking devices', code: 'W2', suggestedLessons: 5 },
    { name: 'W3: Use a range of grammatical structures and vocabulary appropriate to task', code: 'W3', suggestedLessons: 6 },
    { name: 'W4: Use register and tone appropriate to context (formal vs informal)', code: 'W4', suggestedLessons: 4 },
    { name: 'W5: Make accurate use of spelling, punctuation, grammar (technical accuracy)', code: 'W5', suggestedLessons: 4 },
    { name: 'Exam practice: Writing tasks — emails, articles, reports, reviews, letters; planning and drafting', code: 'WEX', suggestedLessons: 6 },
  ]},
  { topic: 'Listening skills (L)', code: 'L', subtopics: [
    { name: 'L1: Identify and select relevant information from spoken texts', code: 'L1', suggestedLessons: 4 },
    { name: 'L2: Understand ideas, opinions and attitudes expressed in spoken text', code: 'L2', suggestedLessons: 4 },
    { name: 'L3: Show understanding of connections between ideas in spoken text', code: 'L3', suggestedLessons: 3 },
    { name: "L4: Understand what is implied (gist, speaker's purpose, attitude, feelings)", code: 'L4', suggestedLessons: 4 },
    { name: 'Exam practice: Listening exercises (Paper 2) — short and longer texts, monologue and dialogue', code: 'LEX', suggestedLessons: 4 },
  ]},
  { topic: 'Speaking skills (SP)', code: 'SP', subtopics: [
    { name: 'SP1: Communicate ideas and information clearly in spoken English', code: 'SP1', suggestedLessons: 3 },
    { name: 'SP2: Develop ideas during conversation (extending answers, giving reasons)', code: 'SP2', suggestedLessons: 4 },
    { name: 'SP3: Use a range of vocabulary and grammatical structures in speech', code: 'SP3', suggestedLessons: 3 },
    { name: 'SP4: Use intonation, stress, and pace effectively', code: 'SP4', suggestedLessons: 2 },
    { name: 'SP5: Interact appropriately in conversation (turn-taking, responding to prompts, asking for clarification)', code: 'SP5', suggestedLessons: 4 },
    { name: 'Exam practice: Speaking test (Paper 3) — warm-up, topic discussion (~6-7 minutes)', code: 'SPEX', suggestedLessons: 4 },
  ]},
]

const IGCSE_LIBRARY = [
  // Sciences (also in IGCSE_SCIENCES_LIBRARY for legacy compat)
  { match: /\bbiology\b/i,                       const_: IGCSE_BIOLOGY_0610,      source: 'IGCSE Biology — 130-lesson scheme (Cambridge 0610 & Edexcel 4BI1)' },
  { match: /\bchemistry\b/i,                     const_: IGCSE_CHEMISTRY_0620,    source: 'Cambridge IGCSE Chemistry 0620' },
  { match: /\bphysics\b/i,                       const_: IGCSE_PHYSICS_0625,      source: 'Cambridge IGCSE Physics 0625' },
  // English subjects — order matters: ESL and Literature must be matched
  // BEFORE the broader English Language regex (otherwise "English Literature"
  // and "English as a Second Language" would match the Language pattern first)
  { match: /\b(esl|english\s+as\s+a?\s*second)\b/i, const_: IGCSE_ESL_0510,         source: 'Cambridge IGCSE English as a Second Language 0510' },
  { match: /\b(literature|english\s+lit)\b/i,    const_: IGCSE_ENGLISH_LIT_0475,  source: 'Cambridge IGCSE Literature in English 0475' },
  { match: /\benglish\b/i,                       const_: IGCSE_ENGLISH_LANG_0500, source: 'Cambridge IGCSE First Language English 0500' },
  // Business / Economics
  { match: /\bbusiness\b/i,                      const_: IGCSE_BUSINESS_0450,     source: 'Cambridge IGCSE Business Studies 0450' },
  { match: /\beconomics\b/i,                     const_: IGCSE_ECONOMICS_0455,    source: 'Cambridge IGCSE Economics 0455' },
  // Humanities
  { match: /\bgeography\b/i,                     const_: IGCSE_GEOGRAPHY_0460,    source: 'Cambridge IGCSE Geography 0460' },
  { match: /\bhistory\b/i,                       const_: IGCSE_HISTORY_0470,      source: 'Cambridge IGCSE History 0470 (Option B + Germany Depth)' },
  { match: /\bsociology\b/i,                     const_: IGCSE_SOCIOLOGY_0495,    source: 'Cambridge IGCSE Sociology 0495' },
]



// ═══════════════════════════════════════════════════════════
// SUBJECTS TAB — Admin management of Subject records.
// Wired to existing /api/subjects endpoints (POST/PATCH/DELETE
// all require admin role on the backend).
// ═══════════════════════════════════════════════════════════
function SubjectsTab({ toast }) {
  // The 15 curricula from the new catalog
  const CURRICULA_LIST = [
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
  ]
  // Categories grouped by curriculum family — drives the <optgroup>
  // dropdown in the form so admin sees categories organised by which
  // curricula use them. CATEGORIES (flat) is exposed for any code path
  // that just needs the list of valid values.
  const CATEGORY_GROUPS = [
    { label: 'Cambridge / Edexcel / AQA', categories: [
      'Mathematics', 'Sciences', 'Languages', 'Arts',
      'Business', 'Humanities', 'Technology', 'Physical Education',
    ]},
    { label: 'International Baccalaureate (IB)', categories: [
      'Studies in Language and Literature', 'Language and Literature',
      'Language Acquisition', 'Individuals and Societies',
      'The Arts', 'Physical and Health Education', 'IB Core',
    ]},
    { label: 'British National Curriculum', categories: [
      'Core', 'English', 'Practical', 'Design',
    ]},
    { label: 'Kenya CBC', categories: [
      'STEM', 'Social Studies', 'Life Skills',
    ]},
    { label: 'American / Other', categories: [
      'Electives',
    ]},
  ]
  const CATEGORIES = CATEGORY_GROUPS.flatMap(g => g.categories)

  const [filterCurriculum, setFilterCurriculum] = useState('CambridgeIGCSE')
  const [search, setSearch] = useState('')
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)        // subject object being edited
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    // includeInactive=true so admins see deactivated subjects (with the
    // INACTIVE badge and a Reactivate button). Other consumers of /subjects
    // (lesson forms, student dropdowns) omit this param and get active only.
    api.get('/subjects', { params: { curriculum: filterCurriculum, includeInactive: true } })
      .then(r => setSubjects(r.data?.subjects || []))
      .catch(() => toast?.error?.('Failed to load subjects.'))
      .finally(() => setLoading(false))
  }, [filterCurriculum, toast])

  useEffect(() => { load() }, [load])

  const filtered = search
    ? subjects.filter(s => s.subjectName?.toLowerCase().includes(search.toLowerCase()))
    : subjects

  const toggleActive = async (s) => {
    if (!window.confirm(`${s.isActive ? 'Deactivate' : 'Reactivate'} "${s.subjectName}"?`)) return
    setBusy(true)
    try {
      await api.patch('/subjects/' + s._id, { isActive: !s.isActive })
      toast?.ok?.(s.isActive ? 'Deactivated.' : 'Reactivated.')
      load()
    } catch (e) { toast?.error?.('Failed.') }
    finally { setBusy(false) }
  }

  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
    textTransform: 'uppercase', color: TOKENS.crimson, marginBottom: 5 }
  const inp = { width: '100%', boxSizing: 'border-box', padding: '8px 11px',
    borderRadius: 7, border: '1.5px solid ' + TOKENS.line, fontSize: 13, fontFamily: 'inherit', background: '#fff' }

  return (
    <div>
      {/* Filter row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'end', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 240px' }}>
          <label style={lbl}>Curriculum</label>
          <select value={filterCurriculum} onChange={e => setFilterCurriculum(e.target.value)} style={inp}>
            {CURRICULA_LIST.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ flex: '2 1 280px' }}>
          <label style={lbl}>Search subject name</label>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="e.g. Mathematics" style={inp}/>
        </div>
        <button onClick={() => setCreating(true)} style={{
          background: TOKENS.crimson, color: '#fff', border: 'none', borderRadius: 8,
          padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', height: 38,
        }}>+ Add Subject</button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: TOKENS.s500, fontSize: 13 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50, color: TOKENS.s500, fontSize: 13,
          border: '1px dashed ' + TOKENS.line, borderRadius: 12 }}>
          No subjects {search ? 'match the search' : 'in ' + filterCurriculum + ' yet'}. Click <b>+ Add Subject</b> to create one.
        </div>
      ) : (
        <div style={{ border: '1px solid ' + TOKENS.line, borderRadius: 12, overflow: 'hidden' }}>
          {filtered.map((s, i) => (
            <div key={s._id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderBottom: i < filtered.length - 1 ? '1px solid #F1ECE0' : 'none',
              background: s.isActive ? '#fff' : '#FAFAF8', opacity: s.isActive ? 1 : 0.6,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TOKENS.s900 }}>
                  {s.subjectName}
                  {!s.isActive && <span style={{ marginLeft: 8, fontSize: 10, color: '#B91C1C', fontWeight: 700 }}>INACTIVE</span>}
                </div>
                <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 2 }}>
                  {s.category}{s.code ? ' · ' + s.code : ''}
                </div>
              </div>
              <button onClick={() => setEditing(s)} disabled={busy} style={{
                border: '1.5px solid ' + TOKENS.line, background: '#fff', color: TOKENS.s700,
                borderRadius: 6, padding: '5px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
              }}>Edit</button>
              <button onClick={() => toggleActive(s)} disabled={busy} style={{
                border: '1.5px solid ' + (s.isActive ? '#FECACA' : TOKENS.line),
                background: '#fff', color: s.isActive ? '#B91C1C' : TOKENS.accentEmerald,
                borderRadius: 6, padding: '5px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
              }}>{s.isActive ? 'Deactivate' : 'Reactivate'}</button>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <SubjectFormModal
          editing={editing}
          curricula={CURRICULA_LIST}
          categories={CATEGORIES}
          categoryGroups={CATEGORY_GROUPS}
          defaultCurriculum={filterCurriculum}
          onClose={() => { setCreating(false); setEditing(null) }}
          onSaved={() => { setCreating(false); setEditing(null); load(); toast?.ok?.('Saved.') }}
          onError={(m) => toast?.error?.(m)}
        />
      )}
    </div>
  )
}

function SubjectFormModal({ editing, curricula, categories, categoryGroups, defaultCurriculum, onClose, onSaved, onError }) {
  const [form, setForm] = useState(() => editing ? {
    curriculum: editing.curriculum,
    subjectName: editing.subjectName || '',
    category: editing.category || 'Mathematics',
    code: editing.code || '',
    isActive: editing.isActive !== false,
  } : {
    curriculum: defaultCurriculum,
    subjectName: '',
    category: 'Mathematics',
    code: '',
    isActive: true,
  })
  const [saving, setSaving] = useState(false)
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.subjectName.trim()) { onError?.('Subject name required.'); return }
    if (!form.category.trim()) { onError?.('Category required.'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.patch('/subjects/' + editing._id, {
          subjectName: form.subjectName.trim(),
          category: form.category.trim(),
          code: form.code.trim() || undefined,
          isActive: form.isActive,
        })
      } else {
        await api.post('/subjects', {
          curriculum: form.curriculum,
          subjectName: form.subjectName.trim(),
          category: form.category.trim(),
          code: form.code.trim() || undefined,
        })
      }
      onSaved?.()
    } catch (e) {
      onError?.(e?.response?.data?.message || 'Failed to save subject.')
    } finally { setSaving(false) }
  }

  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
    textTransform: 'uppercase', color: TOKENS.crimson, marginBottom: 5 }
  const inp = { width: '100%', boxSizing: 'border-box', padding: '9px 12px',
    borderRadius: 7, border: '1.5px solid ' + TOKENS.line, fontSize: 13, fontFamily: 'inherit', background: '#fff' }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(35,23,21,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 14, padding: 24, maxWidth: 480, width: '100%',
        boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: TOKENS.s900, margin: '0 0 18px' }}>
          {editing ? 'Edit Subject' : 'New Subject'}
        </h3>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Curriculum *</label>
          <select value={form.curriculum} onChange={e => update('curriculum', e.target.value)}
            style={inp} disabled={!!editing}>
            {curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {editing && (
            <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 4 }}>
              Curriculum can't be changed after creation (would orphan the spine).
            </div>
          )}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Subject Name *</label>
          <input type="text" value={form.subjectName} onChange={e => update('subjectName', e.target.value)}
            placeholder="e.g. Primary Mathematics" style={inp}/>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Category *</label>
          <select value={form.category}
            onChange={e => update('category', e.target.value)} style={inp}>
            <option value="" disabled>— select a category —</option>
            {(categoryGroups || []).map(g => (
              <optgroup key={g.label} label={g.label}>
                {g.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </optgroup>
            ))}
            {/* Fallback to flat list if categoryGroups not provided */}
            {!categoryGroups && categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>Code (optional)</label>
          <input type="text" value={form.code} onChange={e => update('code', e.target.value)}
            placeholder="e.g. 0096" style={inp}/>
        </div>
        {editing && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, fontSize: 13 }}>
            <input type="checkbox" checked={form.isActive}
              onChange={e => update('isActive', e.target.checked)}/>
            Active
          </label>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={saving} style={{
            background: '#fff', border: '1.5px solid ' + TOKENS.line, color: TOKENS.s700,
            borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{
            background: saving ? '#9CA3AF' : TOKENS.crimson, color: '#fff', border: 'none',
            borderRadius: 8, padding: '9px 22px', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          }}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

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
        sourceSyllabus: 'IGCSE Mathematics — 42-lesson scheme (Cambridge 0580 & Edexcel A 4MA1)',
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

  const loadLowerSecondarySpine = async () => {
    if (!subjectId) { toast?.error?.('Pick a subject first.'); return }
    const entry = LOWER_SEC_LIBRARY.find(e => e.match.test(subjectName))
    if (!entry) {
      toast?.error?.('No Lower Secondary spine matches "' + subjectName + '". Expected one of: Mathematics, English, Science, Computing, Global Perspectives.')
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

  const loadIgcseSpine = async () => {
    if (!subjectId) { toast?.error?.('Pick a subject first.'); return }
    const entry = IGCSE_LIBRARY.find(e => e.match.test(subjectName))
    if (!entry) {
      toast?.error?.('No IGCSE spine matches "' + subjectName + '". Available: Mathematics (use the IGCSE Maths 0580 button), Biology, Chemistry, Physics, English Language, Literature in English, ESL, Business Studies, Economics, Geography, History, Sociology.')
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
            }}>Load IGCSE Maths spine</button>
            {curriculum === 'CambridgePrimary' && (
              <button onClick={loadPrimarySpine} disabled={busy} title="Auto-detects which Primary spine matches the selected subject" style={{
                background: '#fff', color: '#9A7B16', border: '1.5px dashed ' + TOKENS.gold,
                borderRadius: 7, padding: '8px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}>Load Cambridge Primary spine</button>
            )}
            {curriculum === 'CambridgeLowerSec' && (
              <button onClick={loadLowerSecondarySpine} disabled={busy} title="Auto-detects which Lower Secondary spine matches the selected subject" style={{
                background: '#fff', color: '#9A7B16', border: '1.5px dashed ' + TOKENS.gold,
                borderRadius: 7, padding: '8px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}>Load Cambridge Lower Secondary spine</button>
            )}
            {(curriculum === 'CambridgeIGCSE' || curriculum === 'EdexcelIGCSE') && (
              <button onClick={loadIgcseSpine} disabled={busy} title="Auto-detects which IGCSE spine matches the selected subject. Cambridge and Edexcel IGCSE share the same teaching content and lesson sequence — they differ only in exam papers." style={{
                background: '#fff', color: '#9A7B16', border: '1.5px dashed ' + TOKENS.gold,
                borderRadius: 7, padding: '8px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}>Load IGCSE spine</button>
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
        {tabBtn('subjects', 'Subjects')}
        {tabBtn('spine', 'Syllabus Spine')}
      </div>

      {tab === 'subjects' && <SubjectsTab toast={toast} />}
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

function buildInvoiceHTML(f, t) {
  const esc   = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const money = n => Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  const cur   = esc(f.currency||'USD')
  const isUSD = (f.currency||'USD') !== 'KES'
  const items = (f.items||[]).filter(it=>(it.description||'').trim())
  const totalHours = items.reduce((s,it)=>{const n=parseInt(String(it.sessions||'').match(/\d+/)?.[0]||'0');return s+n},0)

  const itemRows = items.map(it=>`<tr>
    <td class="desc">${esc(it.description).replace(/\n/g,'<br>')}</td>
    <td class="c">${esc(it.sessions)}</td>
    <td class="c">${esc(it.duration)}</td>
    <td class="r">${it.ratePerHr?'$'+money(parseFloat(it.ratePerHr)||0):''}</td>
    <td class="r">$${money(parseFloat(it.amount)||0)}</td>
  </tr>`).join('')

  const fmtDate = d => { try { return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) } catch { return String(d||'') } }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Invoice ${esc(f.invoiceNo)} — Smartious</title>
<style>
  :root{--cr:#7D1025;--crD:#5A0B1B;--gold:#C9A030;--ink:#1A1A1A;--mute:#6B6B6B;--line:#E8E2D6;--cream:#FBFAF5;}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#ddd;color:var(--ink)}
  .page{width:210mm;min-height:297mm;background:#fff;margin:60px auto 20px;position:relative;display:flex;flex-direction:column;box-shadow:0 4px 24px rgba(0,0,0,.15);page-break-after:always}
  .page-body{padding:0 20mm;flex:1}
  .topbar{height:6mm;background:linear-gradient(90deg,var(--crD),var(--cr))}
  .hd{display:flex;justify-content:space-between;align-items:flex-start;padding:10mm 20mm 0}
  .brand{display:flex;align-items:center;gap:10px}
  .shield{width:46px;height:52px;flex-shrink:0}
  .brand-tx .name{font-size:22px;font-weight:800;letter-spacing:-.5px;line-height:1}
  .brand-tx .name em{font-style:italic;color:var(--cr)}
  .brand-tx .sub{font-size:7px;letter-spacing:3px;color:var(--mute);margin-top:3px;font-weight:600}
  .hd-r{text-align:right}
  .doc-eyebrow{font-size:9px;letter-spacing:2px;color:var(--mute);text-transform:uppercase;margin-bottom:4px}
  .doc-title{font-size:36px;font-weight:800;color:var(--cr);line-height:1}
  .doc-rule{height:2.5px;background:var(--gold);margin-top:5px}
  .inv-meta{margin-top:5mm;display:flex;justify-content:flex-end}
  .inv-tbl{font-size:10.5px;min-width:68mm}
  .inv-tbl tr td{padding:3px 0}
  .inv-tbl td:first-child{color:var(--mute);padding-right:20px;font-weight:600;text-transform:uppercase;font-size:9px;letter-spacing:.5px}
  .inv-tbl td:last-child{font-weight:700;color:var(--ink);text-align:right}
  .bill-row{display:flex;justify-content:space-between;margin-top:7mm;gap:20px;padding-bottom:6mm;border-bottom:1px solid var(--line)}
  .bill-lbl{font-size:9px;font-weight:700;letter-spacing:1px;color:var(--gold);text-transform:uppercase;margin-bottom:5px}
  .bill-name{font-size:17px;font-weight:800;color:var(--ink)}
  .bill-sub{font-size:11px;color:var(--mute);margin-top:2px}
  .prog-banner{background:#FBFAF5;border-left:3px solid var(--gold);padding:8px 14px;margin:6mm 0;font-size:11px;font-weight:700;color:var(--ink);letter-spacing:.3px}
  .prog-banner em{color:var(--gold);font-style:normal}
  .items{border-collapse:collapse;width:100%;margin-top:2mm}
  .items thead td{background:var(--cr);color:#fff;font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;padding:8px 11px}
  .items thead td.r{text-align:right}.items thead td.c{text-align:center}
  .items tbody tr:nth-child(even){background:#FAFAFA}
  .items tbody td{border-bottom:1px solid var(--line);padding:9px 11px;font-size:11px;vertical-align:top}
  .items tbody td.r{text-align:right}.items tbody td.c{text-align:center}
  .desc{font-weight:600}
  .totals{margin-top:5mm;display:flex;justify-content:flex-end}
  .totals-box{width:76mm}
  .tr{display:flex;justify-content:space-between;padding:5px 11px;font-size:11px}
  .tr .tk{color:var(--mute)}.tr .tv{font-weight:600}
  .tr.total{background:var(--cr);color:#fff;padding:10px 11px;margin-top:4px;border-radius:3px}
  .tr.total .tk,.tr.total .tv{color:#fff;font-weight:800;font-size:13px}
  .note-italic{font-size:9.5px;font-style:italic;color:var(--mute);margin-top:5mm;line-height:1.6}
  .ft{margin-top:auto;border-top:1px solid var(--line);padding:4mm 20mm;display:flex;justify-content:space-between;align-items:center;font-size:8.5px;color:var(--mute)}
  /* Page 2 */
  .p2-sec-h{font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--gold);text-transform:uppercase;margin:7mm 0 4mm}
  .p2-title{font-size:22px;font-weight:300;color:var(--ink);margin-bottom:6mm}
  .p2-title em{font-style:italic;color:var(--cr)}
  .pay-tbl{border-collapse:collapse;width:100%;margin-bottom:7mm}
  .pay-tbl th{background:var(--cr);color:#fff;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:9px 12px;text-align:left}
  .pay-tbl td{border:1px solid var(--line);padding:9px 12px;font-size:11px;vertical-align:top}
  .pay-tbl tr:nth-child(even) td{background:#FAFAFA}
  .pay-tbl td:first-child{font-weight:700;color:var(--ink)}
  .bank-h{font-size:9px;font-weight:700;letter-spacing:1px;color:var(--gold);text-transform:uppercase;margin-bottom:4mm}
  .bank-tbl{border-collapse:collapse;width:100%}
  .bank-tbl td{border:1px solid var(--line);padding:8px 12px;font-size:11px;vertical-align:top}
  .bank-tbl td:first-child{background:#FAFAFA;font-weight:700;color:var(--cr);width:38%}
  .closing{font-size:11px;color:var(--ink);line-height:1.7;margin-top:7mm}
  .closing .ref-note{font-style:italic;color:var(--mute);font-size:10px;margin-bottom:5mm}
  .toolbar{position:fixed;top:0;left:0;right:0;background:#7D1025;color:#fff;padding:10px 24px;display:flex;justify-content:space-between;align-items:center;z-index:99;box-shadow:0 2px 8px rgba(0,0,0,.3)}
  .toolbar .hint{font-size:12px;opacity:.8}
  .toolbar button{background:#C9A030;color:#7D1025;border:none;padding:9px 22px;border-radius:6px;font-weight:800;font-size:13px;cursor:pointer}
  @media print{body{background:#fff}.toolbar{display:none}.page{margin:0;box-shadow:none;width:100%}@page{size:A4;margin:0}}
<' + '/style><' + '/head><body>

<div class="toolbar">
  <span class="hint">Review then click Download PDF — set destination to "Save as PDF" in the print dialog.</span>
  <button onclick="window.print()">⬇ Download PDF</button>
</div>

<!-- PAGE 1 -->
<div class="page">
  <div class="topbar"></div>
  <div class="hd">
    <div class="brand">
      <svg class="shield" viewBox="0 0 60 66">
        <path d="M30 2 L56 9 V32 C56 47 44 58 30 63 C16 58 4 47 4 32 V9 Z" fill="#8A1228" stroke="#C9A030" stroke-width="1.5"/>
        <path d="M30 13 l2.3 4.7 5.2 .75 -3.75 3.65 .9 5.15 -4.65 -2.45 -4.65 2.45 .9 -5.15 -3.75 -3.65 5.2 -.75 Z" fill="#C9A030"/>
        <g transform="translate(30 42)">
          <path d="M0 -7 C-4 -10 -11 -10 -14 -8 L-14 9 C-11 7 -4 7 0 10 Z" fill="#fff" stroke="#E3D9C4" stroke-width="0.5"/>
          <path d="M0 -7 C4 -10 11 -10 14 -8 L14 9 C11 7 4 7 0 10 Z" fill="#fff" stroke="#E3D9C4" stroke-width="0.5"/>
        </g>
      </svg>
      <div class="brand-tx">
        <div class="name">Smart<em>ious</em></div>
        <div class="sub">HOMESCHOOL&nbsp;·&nbsp;GLOBAL</div>
        <div style="font-size:8px;color:var(--mute);margin-top:2px">EST. 2018</div>
      </div>
    </div>
    <div class="hd-r">
      <div class="doc-eyebrow">INVOICE</div>
      <div class="doc-title">INVOICE</div>
      <div class="doc-rule"></div>
      <div style="margin-top:8px">
        <table class="inv-tbl">
          <tr><td>Invoice No.</td><td>${esc(f.invoiceNo)}</td></tr>
          <tr><td>Issue Date</td><td>${esc(fmtDate(f.issueDate))}</td></tr>
          ${f.dueDate?`<tr><td>Due Date</td><td style="color:var(--cr)">${esc(fmtDate(f.dueDate))}</td></tr>`:''}
        </table>
      </div>
    </div>
  </div>

  <div class="page-body">
    <div style="font-size:9px;color:var(--mute);margin-top:4mm;margin-bottom:2mm">Smartious Homeschool Global · Diamond Plaza, 4th Avenue, Parklands, Nairobi · hellosmartious@gmail.com · +254 745 021 212</div>
    <div class="bill-row">
      <div>
        <div class="bill-lbl">Bill To</div>
        <div class="bill-name">${esc(f.billedToName)}</div>
        ${f.billedToAddress?`<div class="bill-sub">${esc(f.billedToAddress)}</div>`:''}
      </div>
      ${f.studentName?`<div>
        <div class="bill-lbl">Student</div>
        <div class="bill-name">${esc(f.studentName)}</div>
        <div class="bill-sub">${[f.studentGrade,f.subject].filter(Boolean).map(s=>`<span>${esc(s)}</span>`).join(' &nbsp;·&nbsp; ')}</div>
      </div>`:''}
    </div>

    ${f.programmeLabel?`<div class="prog-banner">${esc(f.programmeLabel)}</div>`:'<div style="margin-top:6mm"></div>'}

    <table class="items">
      <thead><tr>
        <td>Description</td>
        <td class="c">Sessions</td>
        <td class="c">Duration</td>
        <td class="r">Rate / hr</td>
        <td class="r">Amount</td>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div class="totals"><div class="totals-box">
      <div class="tr"><span class="tk">Subtotal${totalHours?' ('+totalHours+' hours)':''}</span><span class="tv">$${money(t.subtotal)}</span></div>
      <div class="tr"><span class="tk">Discount</span><span class="tv">${t.discount>0?'$'+money(t.discount):'—'}</span></div>
      <div class="tr total"><span class="tk">TOTAL DUE (${cur})</span><span class="tv">$${money(t.totalDue)}</span></div>
    </div></div>

    <p class="note-italic">Amount payable in ${cur}, or the KES equivalent at the prevailing exchange rate. No Smartious markup is applied to currency conversion.</p>
  </div>

  <div class="ft">
    <span>smartioushomeschool.com · hellosmartious@gmail.com · +254 745 021 212</span>
    <span>Page 1</span>
  </div>
</div>

<!-- PAGE 2: Payment methods -->
<div class="page">
  <div class="topbar"></div>
  <div class="hd" style="padding-bottom:0">
    <div class="brand">
      <svg class="shield" viewBox="0 0 60 66">
        <path d="M30 2 L56 9 V32 C56 47 44 58 30 63 C16 58 4 47 4 32 V9 Z" fill="#8A1228" stroke="#C9A030" stroke-width="1.5"/>
        <path d="M30 13 l2.3 4.7 5.2 .75 -3.75 3.65 .9 5.15 -4.65 -2.45 -4.65 2.45 .9 -5.15 -3.75 -3.65 5.2 -.75 Z" fill="#C9A030"/>
      </svg>
      <div class="brand-tx"><div class="name">Smart<em>ious</em></div><div class="sub">HOMESCHOOL&nbsp;·&nbsp;GLOBAL</div></div>
    </div>
    <div class="hd-r doc-eyebrow" style="align-self:flex-end">INVOICE</div>
  </div>

  <div class="page-body" style="padding-top:0">
    <div class="p2-sec-h">HOW TO PAY</div>
    <div class="p2-title">Payment <em>methods</em></div>

    <table class="pay-tbl">
      <thead><tr><th>Method</th><th>Via</th><th>Notes</th></tr></thead>
      <tbody>
        <tr>
          <td>M-Pesa</td>
          <td>Paybill 247247</td>
          <td>Account Number: 745021. Quote invoice number ${esc(f.invoiceNo)}.</td>
        </tr>
        <tr>
          <td>Bank Transfer / SWIFT</td>
          <td>Equity Bank Kenya</td>
          <td>See full beneficiary details below.</td>
        </tr>
      </tbody>
    </table>

    <div class="bank-h">BANK TRANSFER — FULL BENEFICIARY DETAILS</div>
    <table class="bank-tbl">
      <tr><td>Beneficiary Name</td><td>Smartious Edtech</td></tr>
      <tr><td>Bank Name</td><td>Equity Bank Kenya Limited</td></tr>
      <tr><td>Account Number</td><td>0910186607556</td></tr>
      <tr><td>Account Type</td><td>Savings Account</td></tr>
      <tr><td>Branch</td><td>Tea Room Branch, Nairobi, Kenya</td></tr>
      <tr><td>SWIFT / BIC Code</td><td>EQBLKENA (use EQBLKENAXXX if an 11-character code is required)</td></tr>
      <tr><td>Bank Head Office</td><td>Equity Bank Kenya Limited, Equity Centre, 9th Floor, Hospital Road, Upper Hill, P.O. Box 75104-00200, Nairobi, Kenya</td></tr>
      <tr><td>Central Bank</td><td>Central Bank of Kenya</td></tr>
    </table>

    <div class="closing">
      <p class="ref-note">Please share the payment confirmation (M-Pesa message or SWIFT copy) with hellosmartious@gmail.com, quoting invoice number ${esc(f.invoiceNo)}, so it can be matched and receipted promptly.</p>
      <p>Thank you for choosing Smartious Homeschool Global${f.studentName?' for '+esc(f.studentName)+"'s learning journey":''}.</p>
    </div>
  </div>

  <div class="ft">
    <span>smartioushomeschool.com · hellosmartious@gmail.com · +254 745 021 212</span>
    <span>Page 2</span>
  </div>
</div>

</body></html>`
}

// ═══════════════════════════════════════════════════════════
// InvoicesTab — inside BillingModule
// Shows invoice list + stats + generator
// ═══════════════════════════════════════════════════════════
function InvoicesTab({ toast, refreshKey }) {
  const [view, setView]             = useState('list')  // list | create
  const [invoices, setInvoices]     = useState([])
  const [stats, setStats]           = useState({})
  const [loading, setLoading]       = useState(true)
  const [statusF, setStatusF]       = useState('all')
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [paidModal, setPaidModal]   = useState(null)   // invoice to mark paid
  const [paidAmount, setPaidAmount] = useState('')
  const [paidDate, setPaidDate]     = useState(new Date().toISOString().split('T')[0])
  const [markingPaid, setMarkingPaid] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const params = { page, limit:30 }
    if (statusF !== 'all') params.status = statusF
    if (search.trim()) params.search = search.trim()
    Promise.all([
      api.get('/invoices', { params }),
      api.get('/invoices/stats'),
    ]).then(([r, sr]) => {
      setInvoices(r.data?.data?.invoices || [])
      setTotalPages(r.data?.data?.totalPages || 1)
      setStats(sr.data?.data || {})
    }).catch(() => toast?.error?.('Failed to load invoices.'))
    .finally(() => setLoading(false))
  }, [statusF, search, page])

  useEffect(() => { load() }, [load, refreshKey])
  useEffect(() => { setPage(1) }, [statusF, search])

  const money = (n, cur='USD') => Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' ' + cur

  const STATUS_COLOURS = {
    draft:     { bg:'#F3F4F6', fg:'#374151' },
    sent:      { bg:'#DBEAFE', fg:'#1E40AF' },
    paid:      { bg:'#D1FAE5', fg:'#065F46' },
    overdue:   { bg:'#FEE2E2', fg:'#991B1B' },
    cancelled: { bg:'#F3F4F6', fg:'#6B7280' },
  }
  const StatusBadge = ({ s }) => {
    const c = STATUS_COLOURS[s] || STATUS_COLOURS.sent
    return <span style={{ padding:'3px 10px', borderRadius:99, background:c.bg, color:c.fg, fontSize:11, fontWeight:700 }}>{s.charAt(0).toUpperCase()+s.slice(1)}</span>
  }

  const openMarkPaid = (inv) => {
    setPaidAmount(String(inv.totalDue || ''))
    setPaidDate(new Date().toISOString().split('T')[0])
    setPaidModal(inv)
  }

  const confirmMarkPaid = async () => {
    if (!paidModal) return
    setMarkingPaid(true)
    try {
      await api.patch('/invoices/'+paidModal._id+'/status', {
        status: 'paid',
        paidAmount: parseFloat(paidAmount) || paidModal.totalDue,
        paidAt: paidDate,
      })
      toast?.ok?.('Invoice marked paid — receipt emailed to ' + (paidModal.billedToEmail || 'parent') + '.')
      setPaidModal(null)
      load()
    } catch { toast?.error?.('Could not mark as paid.') }
    finally { setMarkingPaid(false) }
  }

  const viewReceipt = async (inv) => {
    try {
      const { data } = await api.get('/invoices/'+inv._id+'/receipt-html')
      if (data.success) {
        const w = window.open('','_blank')
        if (!w) { toast?.error?.('Please allow pop-ups to view the receipt.'); return }
        w.document.write(data.data.html); w.document.close()
      }
    } catch { toast?.error?.('Could not load receipt.') }
  }

  const resend = async (inv) => {
    try {
      await api.post('/invoices/'+inv._id+'/resend', { email: inv.billedToEmail })
      toast?.ok?.('Invoice resent to '+inv.billedToEmail)
    } catch { toast?.error?.('Could not resend.') }
  }

  if (view === 'create') return <InvoiceGenerator toast={toast} onBack={() => { setView('list'); load() }}/>

  // KPI strip from stats
  const byCurrency = stats.byCurrency || []
  const statusMap  = stats.statusMap  || {}

  return (
    <>
      {/* KPI strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:20 }}>
        {byCurrency.map(c => (
          <div key={c._id} className="card" style={{ padding:'14px 16px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', marginBottom:4 }}>Total Issued ({c._id})</div>
            <div style={{ fontSize:18, fontWeight:800, color:TOKENS.crimson }}>{c._id} {Number(c.total).toLocaleString('en-US',{minimumFractionDigits:2})}</div>
            <div style={{ fontSize:11, color:TOKENS.s500, marginTop:2 }}>{c.count} invoice{c.count!==1?'s':''}</div>
          </div>
        ))}
        {[['sent','Awaiting Payment'],['paid','Paid'],['overdue','Overdue']].map(([k,l])=>(
          <div key={k} className="card" style={{ padding:'14px 16px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:22, fontWeight:800, color:k==='paid'?'#065F46':k==='overdue'?'#991B1B':TOKENS.crimson }}>{statusMap[k]||0}</div>
          </div>
        ))}
      </div>

      {/* Issued by */}
      {(stats.recentIssuers||[]).length > 0 && (
        <div className="card" style={{ padding:16, marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:TOKENS.s900, marginBottom:10 }}>Invoices by staff member</div>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            {(stats.recentIssuers||[]).map(is => (
              <div key={is._id} style={{ fontSize:12.5, color:TOKENS.s700 }}>
                <strong style={{ color:TOKENS.s900 }}>{is.name}</strong>
                <span style={{ color:TOKENS.s500, marginLeft:6 }}>({is.count} invoice{is.count!==1?'s':''})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display:'flex', gap:10, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, invoice no, email..."
          style={{ flex:'1 1 220px', padding:'8px 12px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13 }}/>
        <select value={statusF} onChange={e=>setStatusF(e.target.value)} style={{ padding:'8px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5 }}>
          <option value="all">All statuses</option>
          {Object.keys(STATUS_COLOURS).map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        <button onClick={() => setView('create')} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:12.5, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
          + New invoice
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:28, textAlign:'center', color:TOKENS.s500, fontSize:13 }}>Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div style={{ padding:40, textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:10 }}>🧾</div>
            <div style={{ fontSize:14, fontWeight:700, color:TOKENS.s900, marginBottom:4 }}>No invoices yet</div>
            <div style={{ fontSize:12.5, color:TOKENS.s500 }}>Click "+ New invoice" to create your first.</div>
          </div>
        ) : (
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['Invoice No.','Bill To','Student','Amount','Status','Issued By','Date','Actions'].map(h=>(
                <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id} style={{ borderTop:'1px solid '+TOKENS.line }}>
                  <td style={{ padding:'11px 14px', fontFamily:'monospace', fontSize:12, fontWeight:700, color:TOKENS.crimson }}>{inv.invoiceNo}</td>
                  <td style={{ padding:'11px 14px' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:TOKENS.s900 }}>{inv.billedToName}</div>
                    {inv.billedToEmail && <div style={{ fontSize:11, color:TOKENS.s500 }}>{inv.billedToEmail}</div>}
                  </td>
                  <td style={{ padding:'11px 14px', fontSize:12.5, color:TOKENS.s700 }}>{inv.studentName||'—'}</td>
                  <td style={{ padding:'11px 14px', fontSize:13, fontWeight:700, color:TOKENS.s900, whiteSpace:'nowrap' }}>
                    {inv.currency} {Number(inv.totalDue).toLocaleString('en-US',{minimumFractionDigits:2})}
                  </td>
                  <td style={{ padding:'11px 14px' }}><StatusBadge s={inv.status}/></td>
                  <td style={{ padding:'11px 14px', fontSize:12, color:TOKENS.s500 }}>
                    {inv.issuedBy ? `${inv.issuedBy.firstName} ${inv.issuedBy.lastName}` : '—'}
                    {inv.issuedBy?.role && <div style={{ fontSize:10 }}>{inv.issuedBy.role.replace('_',' ')}</div>}
                  </td>
                  <td style={{ padding:'11px 14px', fontSize:11.5, color:TOKENS.s500, whiteSpace:'nowrap' }}>
                    {new Date(inv.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                    {inv.emailSentAt && <div style={{ fontSize:10, color:'#059669' }}>✉ emailed</div>}
                  </td>
                  <td style={{ padding:'11px 14px' }}>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      {inv.status === 'sent' && (
                        <button onClick={() => openMarkPaid(inv)} style={{ fontSize:11, background:'#D1FAE5', color:'#065F46', border:'none', padding:'4px 8px', borderRadius:5, cursor:'pointer', fontWeight:700 }}>Mark paid</button>
                      )}
                      {inv.status === 'paid' && (
                        <button onClick={() => viewReceipt(inv)} style={{ fontSize:11, background:'#065F46', color:'#fff', border:'none', padding:'4px 8px', borderRadius:5, cursor:'pointer', fontWeight:700 }}>🧾 Receipt</button>
                      )}
                      {inv.billedToEmail && inv.status !== 'cancelled' && (
                        <button onClick={() => resend(inv)} style={{ fontSize:11, background:TOKENS.cream, color:TOKENS.crimson, border:'1px solid '+TOKENS.line, padding:'4px 8px', borderRadius:5, cursor:'pointer', fontWeight:700 }}>Resend</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:12 }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} style={{ padding:'6px 13px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page<=1?'not-allowed':'pointer', opacity:page<=1?.5:1 }}>‹</button>
          <span style={{ padding:'6px 12px', fontSize:12.5, color:TOKENS.s700 }}>Page {page} / {totalPages}</span>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages} style={{ padding:'6px 13px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page>=totalPages?'not-allowed':'pointer', opacity:page>=totalPages?.5:1 }}>›</button>
        </div>
      )}

      {/* Mark Paid modal */}
      {paidModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={() => setPaidModal(null)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:380, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:15, fontWeight:800, color:TOKENS.s900, marginBottom:4 }}>Confirm Payment</div>
            <div style={{ fontSize:12.5, color:TOKENS.s500, marginBottom:18 }}>{paidModal.invoiceNo} · {paidModal.billedToName}</div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:5 }}>Amount received ({paidModal.currency})</div>
              <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)}
                style={{ width:'100%', padding:'9px 12px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:14, fontWeight:700 }}/>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:5 }}>Date paid</div>
              <input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)}
                style={{ width:'100%', padding:'9px 12px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13 }}/>
            </div>
            {paidModal.billedToEmail && (
              <div style={{ background:'#F0FDF4', border:'1px solid #6EE7B7', borderRadius:8, padding:'10px 12px', fontSize:12, color:'#065F46', marginBottom:16, lineHeight:1.5 }}>
                ✓ Receipt will be auto-emailed to <strong>{paidModal.billedToEmail}</strong>
              </div>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={confirmMarkPaid} disabled={markingPaid} style={{
                flex:1, background:markingPaid?TOKENS.s300:'#065F46', color:'#fff', border:'none',
                padding:'11px 0', borderRadius:8, fontSize:13, fontWeight:700,
                cursor:markingPaid?'not-allowed':'pointer',
              }}>{markingPaid ? 'Processing...' : 'Confirm & send receipt'}</button>
              <button onClick={() => setPaidModal(null)} style={{
                background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s500,
                padding:'11px 16px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer',
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// 12. BILLING MODULE
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// FeeCollectionModule — Accountant portal
// Shows all students, their billing cycle, status, and last
// invoice. Accountant can edit billing settings, record payments,
// and send fee reminders manually. Auto-reminders fire 3 days
// before due date via backend cron.
// ═══════════════════════════════════════════════════════════
function FeeCollectionModule({ toast, refreshKey }) {
  const [students,  setStudents]  = useState([])
  const [summary,   setSummary]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [searchQ,   setSearchQ]   = useState('')
  const [statusF,   setStatusF]   = useState('all')
  const [currF,     setCurrF]     = useState('')
  const [page,      setPage]      = useState(1)
  const [total,     setTotal]     = useState(0)
  const LIMIT = 30

  // Modals
  const [editModal,    setEditModal]    = useState(null)  // student being edited
  const [payModal,     setPayModal]     = useState(null)  // student recording payment for
  const [detailModal,  setDetailModal]  = useState(null)  // student detail view
  const [editForm,     setEditForm]     = useState({})
  const [payForm,      setPayForm]      = useState({ amount:'', currency:'USD', paidAt:'', paymentMethod:'Bank transfer', note:'', periodLabel:'' })
  const [saving,       setSaving]       = useState(false)
  const [reminding,    setReminding]    = useState(null)  // studentId being reminded
  const [remindingAll, setRemindingAll] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const params = { limit:LIMIT, page }
    if (searchQ)          params.search   = searchQ
    if (statusF !== 'all') params.status  = statusF
    if (currF)            params.currency = currF
    api.get('/fees', { params })
      .then(r => {
        setStudents(r.data?.data?.students || [])
        setSummary(r.data?.data?.summary   || null)
        setTotal(r.data?.data?.total       || 0)
      })
      .catch(e => toast?.error?.('Failed to load: '+(e?.response?.data?.message||e.message)))
      .finally(() => setLoading(false))
  }, [searchQ, statusF, currF, page, refreshKey])

  useEffect(() => { load() }, [load])

  const fmtDate  = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'
  const money    = (n,cur='USD') => ({ USD:'$',KES:'KES ',GBP:'£',EUR:'€',AED:'AED ' }[cur]||'')+(n||0).toLocaleString()

  const STATUS_S = {
    overdue:  { bg:'#FEE2E2', fg:'#991B1B', label:'Overdue' },
    'due-soon':{ bg:'#FEF3C7', fg:'#D97706', label:'Due soon' },
    current:  { bg:'#D1FAE5', fg:'#065F46', label:'Current' },
    'no-fee': { bg:'#F3F4F6', fg:'#6B7280', label:'No fee set' },
  }

  const INV_S = {
    paid:    { bg:'#D1FAE5', fg:'#065F46' },
    sent:    { bg:'#DBEAFE', fg:'#1E40AF' },
    overdue: { bg:'#FEE2E2', fg:'#991B1B' },
    draft:   { bg:'#F3F4F6', fg:'#6B7280' },
  }

  // Open edit modal
  const openEdit = (s) => {
    setEditForm({
      agreedFee:   s.agreedFee || '',
      feeCurrency: s.feeCurrency || 'USD',
      billingDay:  s.billingDay || 15,
      billingNote: s.billingNote || '',
      nextDueDate: s.nextDueDate ? new Date(s.nextDueDate).toISOString().split('T')[0] : '',
    })
    setEditModal(s)
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      await api.patch('/fees/'+editModal._id, editForm)
      toast?.ok?.('Billing updated for '+editModal.name+'.')
      setEditModal(null); load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Save failed.') }
    finally { setSaving(false) }
  }

  // Open payment modal
  const openPay = (s) => {
    setPayForm({ amount: s.agreedFee||'', currency: s.feeCurrency||'USD', paidAt: new Date().toISOString().split('T')[0], paymentMethod:'Bank transfer', note:'', periodLabel: new Date().toLocaleDateString('en-GB',{month:'long',year:'numeric'}) })
    setPayModal(s)
  }

  const savePay = async () => {
    if (!payForm.amount) { toast?.error?.('Enter payment amount.'); return }
    setSaving(true)
    try {
      await api.post('/fees/'+payModal._id+'/record-payment', payForm)
      toast?.ok?.('Payment recorded. Invoice created.')
      setPayModal(null); load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setSaving(false) }
  }

  // Send reminder
  const sendReminder = async (s) => {
    setReminding(s._id)
    try {
      const r = await api.post('/fees/'+s._id+'/remind')
      toast?.ok?.(r.data?.message || 'Reminder sent.')
      load()
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Failed.') }
    finally { setReminding(null) }
  }

  const remindAll = async () => {
    setRemindingAll(true)
    try {
      const r = await api.post('/fees/remind-all')
      toast?.ok?.(r.data?.message || 'Reminders sent.')
      load()
    } catch(e) { toast?.error?.('Failed.') }
    finally { setRemindingAll(false) }
  }

  const inp = { width:'100%', padding:'9px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit', boxSizing:'border-box' }
  const totalPages = Math.ceil(total/LIMIT)

  return (
    <>
      <PSection tag="Accountant" title="Fee" em="Collection"
        sub="All students, their billing cycles, outstanding balances, and payment history. Reminders are sent automatically 3 days before each due date."/>

      {/* Summary KPIs */}
      {summary && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:22 }}>
          {[
            { label:'Total students',  val:summary.total,       color:TOKENS.s900 },
            { label:'Overdue',         val:summary.overdue,     color:'#991B1B' },
            { label:'Due within 3d',   val:summary.dueSoon,     color:'#D97706' },
            { label:'Current',         val:summary.current,     color:'#065F46' },
            { label:'No fee set',      val:summary.noFee,       color:TOKENS.s400 },
            { label:'Monthly revenue', val:money(summary.totalMonthly,'USD'), color:TOKENS.crimson, wide:true },
          ].map(k=>(
            <div key={k.label} className="kpi" style={{ gridColumn:k.wide?'span 2':undefined }}>
              <div style={{ fontSize:10, fontWeight:700, color:TOKENS.s400, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{k.label}</div>
              <div style={{ fontSize:k.wide?20:24, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'){setSearchQ(search);setPage(1)} }}
          placeholder="Search name, email, admission no..."
          style={{ flex:'1 1 220px', padding:'9px 11px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:13, fontFamily:'inherit' }}/>
        <button onClick={()=>{setSearchQ(search);setPage(1)}} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'9px 18px', borderRadius:7, fontSize:13, fontWeight:700, cursor:'pointer' }}>Search</button>

        {/* Status filter tabs */}
        <div style={{ display:'flex', border:'1.5px solid '+TOKENS.line, borderRadius:7, overflow:'hidden' }}>
          {[['all','All'],['overdue','Overdue'],['due-soon','Due soon'],['current','Current'],['no-fee','No fee']].map(([val,label])=>(
            <button key={val} onClick={()=>{setStatusF(val);setPage(1)}} style={{
              padding:'8px 12px', border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
              background:statusF===val?TOKENS.crimson:'#fff', color:statusF===val?'#fff':TOKENS.s500,
              borderRight:'1px solid '+TOKENS.line,
            }}>{label}{summary&&val==='overdue'&&summary.overdue>0?` (${summary.overdue})`:''}{summary&&val==='due-soon'&&summary.dueSoon>0?` (${summary.dueSoon})`:''}</button>
          ))}
        </div>

        <select value={currF} onChange={e=>setCurrF(e.target.value)}
          style={{ padding:'9px 10px', borderRadius:7, border:'1.5px solid '+TOKENS.line, fontSize:12.5, fontFamily:'inherit' }}>
          <option value="">All currencies</option>
          {['USD','KES','GBP','EUR','AED'].map(c=><option key={c} value={c}>{c}</option>)}
        </select>

        <button onClick={remindAll} disabled={remindingAll} style={{
          marginLeft:'auto', background:remindingAll?TOKENS.s300:'#D97706', color:'#fff',
          border:'none', padding:'9px 16px', borderRadius:7, fontSize:12.5, fontWeight:700,
          cursor:remindingAll?'not-allowed':'pointer', whiteSpace:'nowrap',
        }}>
          {remindingAll ? 'Sending...' : 'Send all due reminders'}
        </button>
      </div>

      {/* Students table */}
      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Loading students...</div>
        ) : students.length===0 ? (
          <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>No students found.</div>
        ) : (
          <table className="tbl" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Student','Curriculum / Grade','Agreed fee','Billing day','Next due','Status','Last invoice',''].map(h=>(
                <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:10.5 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {students.map(s => {
                const ss   = STATUS_S[s.billingStatus] || STATUS_S['no-fee']
                const inv  = s.lastInvoice
                const iSS  = inv ? INV_S[inv.status]||INV_S.draft : null
                const days = s.daysUntilDue
                return (
                  <tr key={String(s._id)} style={{ borderTop:'1px solid '+TOKENS.line, background:s.billingStatus==='overdue'?'#FFF5F5':undefined }}>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:TOKENS.s900 }}>{s.name}</div>
                      <div style={{ fontSize:11, color:TOKENS.s500, marginTop:1 }}>{s.admissionNo||s.email}</div>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:12.5, color:TOKENS.s600 }}>
                      {s.curriculum}{s.grade?' · '+s.grade:''}
                      {s.programme&&<div style={{ fontSize:11, color:TOKENS.s400, marginTop:1 }}>{s.programme}</div>}
                    </td>
                    <td style={{ padding:'10px 14px', fontWeight:800, fontSize:14, color:s.agreedFee?TOKENS.crimson:TOKENS.s400 }}>
                      {s.agreedFee ? money(s.agreedFee, s.feeCurrency) : '—'}
                      {s.billingNote&&<div style={{ fontSize:10.5, color:TOKENS.s400, fontWeight:400, marginTop:1, maxWidth:140 }}>{s.billingNote}</div>}
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:13, color:TOKENS.s600 }}>
                      {s.agreedFee ? `${s.billingDay}th` : '—'}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ fontSize:13, color:TOKENS.s700 }}>{fmtDate(s.nextDueDate)}</div>
                      {days !== null && s.agreedFee > 0 && (
                        <div style={{ fontSize:11, fontWeight:700, marginTop:2, color:days<0?'#991B1B':days<=3?'#D97706':'#065F46' }}>
                          {days<0?Math.abs(days)+' days overdue':days===0?'Today':days===1?'Tomorrow':days+' days'}
                        </div>
                      )}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:ss.bg, color:ss.fg }}>
                        {ss.label}
                      </span>
                      {s.feeReminderSent && (
                        <div style={{ fontSize:10, color:TOKENS.s400, marginTop:3 }}>Reminded {fmtDate(s.feeReminderSent)}</div>
                      )}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      {inv ? (
                        <>
                          <div style={{ fontSize:11.5, fontWeight:700, color:TOKENS.s900 }}>{inv.invoiceNo}</div>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
                            <span style={{ padding:'1px 7px', borderRadius:99, fontSize:10, fontWeight:700, background:iSS.bg, color:iSS.fg }}>{inv.status}</span>
                            <span style={{ fontSize:11, color:TOKENS.s500 }}>{money(inv.amount, s.feeCurrency)}</span>
                          </div>
                        </>
                      ) : <span style={{ fontSize:12, color:TOKENS.s400 }}>No invoice yet</span>}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', gap:5, flexWrap:'nowrap' }}>
                        <button onClick={()=>openEdit(s)} style={{ padding:'5px 10px', borderRadius:6, border:'1px solid '+TOKENS.line, background:'#fff', color:TOKENS.s700, fontSize:11.5, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>Edit</button>
                        <button onClick={()=>openPay(s)} style={{ padding:'5px 10px', borderRadius:6, border:'none', background:TOKENS.accentEmerald, color:'#fff', fontSize:11.5, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>Record payment</button>
                        <button onClick={()=>sendReminder(s)} disabled={reminding===s._id||!s.agreedFee}
                          style={{ padding:'5px 9px', borderRadius:6, border:'1px solid #FDE68A', background:reminding===s._id?TOKENS.s200:'#FFFBEB', color:'#D97706', fontSize:11.5, fontWeight:600, cursor:reminding===s._id||!s.agreedFee?'not-allowed':'pointer', opacity:!s.agreedFee?.5:1 }}>
                          {reminding===s._id?'Sending...':'Remind'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, marginTop:14 }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}
            style={{ padding:'6px 14px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page<=1?'not-allowed':'pointer', opacity:page<=1?.5:1 }}>‹ Prev</button>
          <span style={{ fontSize:12.5, color:TOKENS.s600 }}>Page {page} of {totalPages} · {total} students</span>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}
            style={{ padding:'6px 14px', borderRadius:6, border:'1.5px solid '+TOKENS.line, background:'#fff', fontSize:12, fontWeight:700, cursor:page>=totalPages?'not-allowed':'pointer', opacity:page>=totalPages?.5:1 }}>Next ›</button>
        </div>
      )}

      {/* ── Edit billing modal ── */}
      {editModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>setEditModal(null)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:460, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:15, fontWeight:800, color:TOKENS.s900, marginBottom:2 }}>Edit billing — {editModal.name}</div>
            <div style={{ fontSize:12, color:TOKENS.s500, marginBottom:20 }}>{editModal.curriculum} · {editModal.grade} · {editModal.admissionNo}</div>

            <div style={{ display:'grid', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Agreed monthly fee</label>
                  <input type="number" value={editForm.agreedFee} onChange={e=>setEditForm(p=>({...p,agreedFee:e.target.value}))} className="fi" placeholder="e.g. 400"/>
                </div>
                <div>
                  <label className="fl">Currency</label>
                  <select value={editForm.feeCurrency} onChange={e=>setEditForm(p=>({...p,feeCurrency:e.target.value}))} className="fsel">
                    {['USD','KES','GBP','EUR','AED'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Billing day of month</label>
                  <select value={editForm.billingDay} onChange={e=>setEditForm(p=>({...p,billingDay:e.target.value}))} className="fsel">
                    {Array.from({length:28},(_,i)=>i+1).map(d=><option key={d} value={d}>{d}{d===1?'st':d===2?'nd':d===3?'rd':'th'} of month</option>)}
                  </select>
                </div>
                <div>
                  <label className="fl">Override next due date</label>
                  <input type="date" value={editForm.nextDueDate} onChange={e=>setEditForm(p=>({...p,nextDueDate:e.target.value}))} className="fi"/>
                </div>
              </div>
              <div>
                <label className="fl">Billing note</label>
                <input value={editForm.billingNote} onChange={e=>setEditForm(p=>({...p,billingNote:e.target.value}))} className="fi" placeholder="e.g. Pays via M-Pesa, Discount applied"/>
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={saveEdit} disabled={saving} style={{ flex:1, background:saving?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', padding:'11px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
                {saving?'Saving...':'Save billing settings'}
              </button>
              <button onClick={()=>setEditModal(null)} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s500, padding:'11px 18px', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Record payment modal ── */}
      {payModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={()=>setPayModal(null)}>
          <div style={{ background:'#fff', borderRadius:14, padding:26, maxWidth:460, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:15, fontWeight:800, color:TOKENS.s900, marginBottom:2 }}>Record payment — {payModal.name}</div>
            <div style={{ fontSize:12, color:TOKENS.s500, marginBottom:20 }}>Agreed fee: {payModal.agreedFee?({ USD:'$',KES:'KES ',GBP:'£',EUR:'€',AED:'AED ' }[payModal.feeCurrency]||'')+payModal.agreedFee:'Not set'}</div>

            <div style={{ display:'grid', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Amount received</label>
                  <input type="number" value={payForm.amount} onChange={e=>setPayForm(p=>({...p,amount:e.target.value}))} className="fi" placeholder={payModal.agreedFee||'0'}/>
                </div>
                <div>
                  <label className="fl">Currency</label>
                  <select value={payForm.currency} onChange={e=>setPayForm(p=>({...p,currency:e.target.value}))} className="fsel">
                    {['USD','KES','GBP','EUR','AED'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="fl">Date received</label>
                  <input type="date" value={payForm.paidAt} onChange={e=>setPayForm(p=>({...p,paidAt:e.target.value}))} className="fi"/>
                </div>
                <div>
                  <label className="fl">Payment method</label>
                  <select value={payForm.paymentMethod} onChange={e=>setPayForm(p=>({...p,paymentMethod:e.target.value}))} className="fsel">
                    {['Bank transfer','M-Pesa','Paystack','Cash','Cheque','Wire transfer','Other'].map(m=><option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="fl">Period label</label>
                <input value={payForm.periodLabel} onChange={e=>setPayForm(p=>({...p,periodLabel:e.target.value}))} className="fi" placeholder="e.g. July 2026"/>
              </div>
              <div>
                <label className="fl">Note (optional)</label>
                <input value={payForm.note} onChange={e=>setPayForm(p=>({...p,note:e.target.value}))} className="fi" placeholder="Transaction ID, reference, etc."/>
              </div>
            </div>

            <div style={{ background:'#F0FDF4', borderRadius:8, padding:'10px 14px', marginTop:14, fontSize:12, color:'#065F46' }}>
              A paid invoice will be created automatically. The next due date will be recalculated.
            </div>

            <div style={{ display:'flex', gap:10, marginTop:18 }}>
              <button onClick={savePay} disabled={saving} style={{ flex:1, background:saving?TOKENS.s300:TOKENS.accentEmerald, color:'#fff', border:'none', padding:'11px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
                {saving?'Saving...':'Record payment & create invoice'}
              </button>
              <button onClick={()=>setPayModal(null)} style={{ background:'transparent', border:'1.5px solid '+TOKENS.line, color:TOKENS.s500, padding:'11px 18px', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


function BillingModule({ refreshKey, toast }) {
  const store = useStore()
  const [billingTab, setBillingTab] = useState('payments')  // payments | invoices

  // ── Real payment data from backend ───────────────────
  const [payments,       setPayments]       = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [revSummary,     setRevSummary]     = useState(null)   // { totalRevenue, totalConfirmed, total }
  const [monthlyRev,     setMonthlyRev]     = useState([])     // [{ _id:{year,month}, total, count }]
  const [students,       setStudents]       = useState([])

  // Filters
  const [statusFilter,  setStatusFilter]  = useState('')
  const [searchInput,   setSearchInput]   = useState('')
  const [search,        setSearch]        = useState('')
  const [listPage,      setListPage]      = useState(1)
  const [totalPages,    setTotalPages]    = useState(1)
  const [totalCount,    setTotalCount]    = useState(0)

  // Detail modal
  const [selected,       setSelected]       = useState(null)
  const [detailLoading,  setDetailLoading]  = useState(false)
  const [overrideStatus, setOverrideStatus] = useState('')
  const [overrideNote,   setOverrideNote]   = useState('')
  const [overrideSaving, setOverrideSaving] = useState(false)

  const fetchPayments = useCallback(async (pg = 1) => {
    setPaymentsLoading(true)
    try {
      const params = new URLSearchParams({ page: pg, limit: 25 })
      if (statusFilter) params.append('status', statusFilter)
      if (search)       params.append('search', search)
      const { data } = await api.get('/payments/admin/all?' + params)
      if (data?.success) {
        setPayments(data.data.payments || [])
        setTotalCount(data.data.total || 0)
        setTotalPages(data.data.totalPages || 1)
        setRevSummary({ totalRevenue: data.data.totalRevenue, totalConfirmed: data.data.totalConfirmed })
        setListPage(pg)
      }
    } catch { toast.error('Could not load payments') }
    setPaymentsLoading(false)
  }, [statusFilter, search])

  useEffect(() => { fetchPayments(1) }, [fetchPayments, refreshKey])

  useEffect(() => {
    api.get('/payments/admin/revenue/monthly?months=6')
      .then(r => { if (r.data?.success) setMonthlyRev(r.data.data || []) })
      .catch(() => {})
    api.get('/users/students/list')
      .then(r => setStudents(r.data.students || []))
      .catch(() => {})
  }, [refreshKey])

  // Open detail
  const openDetail = async (p) => {
    setSelected({ ...p, _loading: true })
    setOverrideStatus(p.status || 'pending')
    setOverrideNote('')
    setDetailLoading(true)
    try {
      const { data } = await api.get('/payments/admin/' + p._id)
      if (data?.success) { setSelected(data.data); setOverrideStatus(data.data.status || 'pending') }
    } catch { setSelected(p) }
    setDetailLoading(false)
  }

  const saveOverride = async () => {
    if (!selected) return
    setOverrideSaving(true)
    try {
      const { data } = await api.patch('/payments/admin/' + selected._id + '/status', { status: overrideStatus, note: overrideNote })
      if (data?.success) {
        toast.ok('Status updated')
        setSelected(data.data)
        setPayments(ps => ps.map(p => String(p._id) === String(selected._id) ? { ...p, status: overrideStatus } : p))
      } else { toast.error(data?.message || 'Update failed') }
    } catch { toast.error('Could not update status') }
    setOverrideSaving(false)
  }

  // Helpers
  const parentName = (p) => {
    const u = p.parentId
    if (!u) return '—'
    return typeof u === 'object' ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '—' : '—'
  }
  const studentName = (p) => {
    const s = p.studentId
    if (!s || typeof s !== 'object') return '—'
    return `${s.firstName || ''} ${s.lastName || ''}`.trim() || '—'
  }
  const StatusBadge = ({ status }) => {
    const cfg = { success: ['#DCFCE7','#15803D'], pending: ['#FEF9C3','#854D0E'], failed: ['#FEE2E2','#DC2626'] }[status] || ['#EFF6FF','#1D4ED8']
    const label = { success:'Paid', pending:'Pending', failed:'Failed' }[status] || status
    return <span style={{ background: cfg[0], color: cfg[1], fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, border: '1px solid ' + cfg[1] + '30' }}>{label}</span>
  }

  // Revenue derived values
  const totalRevenue   = revSummary?.totalRevenue ?? 0
  const totalConfirmed = revSummary?.totalConfirmed ?? 0
  const monthlyAvg     = monthlyRev.length > 0 ? Math.round(monthlyRev.reduce((s, m) => s + m.total, 0) / monthlyRev.length) : 0
  const lastMonthRev   = monthlyRev.length > 0 ? monthlyRev[monthlyRev.length - 1]?.total ?? 0 : 0

  const monthLabel = (m) => {
    const d = new Date(m._id.year, m._id.month - 1)
    return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
  }
  const maxBar = Math.max(...monthlyRev.map(m => m.total), 1)

  return (
    <>
      <PSection tag="Finance" title="Billing &" em="Payments" sub="All student payments, Paystack transactions and revenue analytics"/>

      {/* Tab switcher */}
      <div style={{ display:'flex', gap:5, marginBottom:20, borderBottom:'1.5px solid '+TOKENS.line, paddingBottom:0 }}>
        {[['payments','Paystack Payments'],['invoices','Invoices']].map(([k,l])=>(
          <button key={k} onClick={()=>setBillingTab(k)} style={{
            padding:'9px 18px', border:'none', background:'transparent',
            borderBottom:billingTab===k?'2.5px solid '+TOKENS.crimson:'2.5px solid transparent',
            color:billingTab===k?TOKENS.crimson:TOKENS.s500,
            fontSize:13, fontWeight:billingTab===k?700:500, cursor:'pointer', marginBottom:-1.5,
          }}>{l}</button>
        ))}
      </div>

      {billingTab === 'invoices' && <InvoicesTab toast={toast} refreshKey={refreshKey}/>}
      {billingTab === 'payments' && (<>

      {/* ── KPI row ── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Total Revenue" value={fmtKsh(totalRevenue)} delta={totalConfirmed + ' confirmed payments'} accent={TOKENS.accentEmerald}/>
        <PKpi label="Last Month" value={fmtKsh(lastMonthRev)} delta="Confirmed only" accent={TOKENS.crimson}/>
        <PKpi label="Monthly Avg" value={fmtKsh(monthlyAvg)} delta="6-month average" accent={TOKENS.accentNavy}/>
        <PKpi label="All Transactions" value={totalCount} delta={statusFilter || 'Any status'} accent={TOKENS.s500}/>
      </div>

      {/* ── Monthly bar chart ── */}
      {monthlyRev.length > 0 && (
        <PCard accent={TOKENS.accentEmerald} style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: TOKENS.s900, marginBottom: 18, fontWeight: 600 }}>Monthly Revenue</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
            {monthlyRev.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: TOKENS.s500, fontWeight: 700 }}>
                  {fmtKsh(m.total).replace('KSh ', '')}
                </div>
                <div style={{ width: '100%', background: TOKENS.accentEmerald, borderRadius: '4px 4px 0 0', height: Math.max(4, Math.round((m.total / maxBar) * 72)) + 'px', opacity: i === monthlyRev.length - 1 ? 1 : 0.55 }}/>
                <div style={{ fontSize: 10, color: TOKENS.s500, whiteSpace: 'nowrap' }}>{monthLabel(m)}</div>
              </div>
            ))}
          </div>
        </PCard>
      )}

      {/* ── Filters ── */}
      <PCard style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="fl">Search reference or description</label>
            <input className="fi" value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput) }}
              placeholder="E.g. SM-1234, April fees…"/>
          </div>
          <div style={{ minWidth: 160 }}>
            <label className="fl">Status</label>
            <select className="fsel" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="success">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <button className="btn btn-p btn-sm" onClick={() => { setSearch(searchInput); fetchPayments(1) }}>Search</button>
          <button className="btn btn-s btn-sm" onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter('') }}>Clear</button>
        </div>
      </PCard>

      {/* ── Payments table ── */}
      <PCard>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: TOKENS.s900, marginBottom: 16, fontWeight: 600 }}>
          Transactions
          {totalCount > 0 && <span style={{ fontSize: 13, fontWeight: 500, color: TOKENS.s500, marginLeft: 10 }}>{totalCount} total</span>}
        </h3>

        {paymentsLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: TOKENS.s400 }}>Loading…</div>
        ) : payments.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: TOKENS.s500 }}>
            No payments found{statusFilter ? ` with status "${statusFilter}"` : ''}.
          </div>
        ) : (
          <>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Parent</th>
                  <th>Student</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={p._id || i} style={{ cursor: 'pointer' }} onClick={() => openDetail(p)}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 12.5 }}>{fmtDate(p.createdAt)}</div>
                      <div style={{ fontSize: 11, color: TOKENS.s400 }}>
                        {p.createdAt ? new Date(p.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{parentName(p)}</div>
                      {typeof p.parentId === 'object' && p.parentId?.email && (
                        <div style={{ fontSize: 11, color: TOKENS.s400 }}>{p.parentId.email}</div>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: TOKENS.s600 }}>{studentName(p)}</td>
                    <td style={{ fontSize: 13 }}>{p.description || '—'}</td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: TOKENS.accentEmerald }}>
                        {fmtKsh(p.amount)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: TOKENS.s500 }}>
                        {p.reference || '—'}
                      </span>
                    </td>
                    <td><StatusBadge status={p.status}/></td>
                    <td>
                      <button className="btn btn-s btn-sm" onClick={e => { e.stopPropagation(); openDetail(p) }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', paddingTop: 16, flexWrap: 'wrap' }}>
                <button className="btn btn-s btn-sm" disabled={listPage <= 1} onClick={() => fetchPayments(listPage - 1)}>← Prev</button>
                <span style={{ fontSize: 13, color: TOKENS.s500, lineHeight: '30px' }}>Page {listPage} of {totalPages}</span>
                <button className="btn btn-s btn-sm" disabled={listPage >= totalPages} onClick={() => fetchPayments(listPage + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </PCard>

      {/* ── Fee structure (store-based, admin-editable in future) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
        <PCard accent={TOKENS.crimson}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: TOKENS.s900, marginBottom: 14, fontWeight: 600 }}>Standard Fee Schedule</h3>
          {[
            ['Individual Basic',   store.fees?.individual_basic   || 1499],
            ['Individual Premium', store.fees?.individual_premium || 2999],
            ['Family Plan',        store.fees?.family_plan        || 4999],
            ['IGCSE Pack',         store.fees?.igcse_pack         || 18000],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid ' + TOKENS.s100 }}>
              <span style={{ fontSize: 13, color: TOKENS.s700 }}>{label}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: TOKENS.crimson }}>{fmtKsh(val)}</span>
            </div>
          ))}
        </PCard>
        <PCard accent={TOKENS.accentEmerald}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: TOKENS.s900, marginBottom: 14, fontWeight: 600 }}>Payment Methods</h3>
          {[['M-Pesa', 67], ['Bank Transfer', 21], ['Card (Paystack)', 9], ['Other', 3]].map(([label, pct]) => (
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

      {/* ══ DETAIL MODAL ══════════════════════════════════════ */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: TOKENS.white, borderRadius: 20, padding: 28, maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.22)' }}
            onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: TOKENS.s500, marginBottom: 6 }}>Payment Detail</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: TOKENS.s900 }}>{selected.description || 'Payment'}</div>
              </div>
              <button className="btn btn-s btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>

            {detailLoading ? (
              <div style={{ padding: 30, textAlign: 'center', color: TOKENS.s400 }}>Loading…</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                  {[
                    ['Amount',    fmtKsh(selected.amount)],
                    ['Status',    null],
                    ['Reference', selected.reference || '—'],
                    ['Method',    selected.method || '—'],
                    ['Parent',    parentName(selected)],
                    ['Student',   studentName(selected)],
                    ['Date',      fmtDate(selected.createdAt)],
                    ['Paid At',   selected.paidAt ? fmtDate(selected.paidAt) : '—'],
                  ].map(([l, v]) => (
                    <div key={l} style={{ padding: '10px 12px', background: TOKENS.s50, borderRadius: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: TOKENS.s400, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{l}</div>
                      {l === 'Status'
                        ? <StatusBadge status={selected.status}/>
                        : <div style={{ fontSize: 13.5, fontWeight: 600, color: TOKENS.s800, wordBreak: 'break-all' }}>{v}</div>
                      }
                    </div>
                  ))}
                </div>

                {selected.adminNote && (
                  <div style={{ background: '#FEF9C3', border: '1px solid #FDE047', borderRadius: 10, padding: '10px 12px', marginBottom: 18, fontSize: 12.5, color: '#854D0E' }}>
                    <strong>Admin note:</strong> {selected.adminNote}
                  </div>
                )}

                <div style={{ borderTop: '1px solid ' + TOKENS.s100, paddingTop: 18 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: TOKENS.s900, marginBottom: 6 }}>Override Status</div>
                  <div style={{ fontSize: 12.5, color: TOKENS.s500, marginBottom: 12, lineHeight: 1.6 }}>
                    Manually confirm bank transfers or M-Pesa payments received outside Paystack.
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label className="fl">Status</label>
                    <select className="fsel" value={overrideStatus} onChange={e => setOverrideStatus(e.target.value)}>
                      <option value="success">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label className="fl">Admin note (optional)</label>
                    <input className="fi" value={overrideNote} onChange={e => setOverrideNote(e.target.value)}
                      placeholder="E.g. Confirmed via M-Pesa screenshot from parent"/>
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn btn-s btn-sm" onClick={() => setSelected(null)}>Cancel</button>
                    <button className="btn btn-p" onClick={saveOverride} disabled={overrideSaving}>
                      {overrideSaving ? 'Saving…' : 'Save Override'}
                    </button>
                  </div>
                </div>

                {selected.paystackData && (
                  <details style={{ marginTop: 16 }}>
                    <summary style={{ fontSize: 12, color: TOKENS.s400, cursor: 'pointer', userSelect: 'none' }}>Raw Paystack data</summary>
                    <pre style={{ marginTop: 8, fontSize: 11, color: TOKENS.s600, background: TOKENS.s50, padding: 12, borderRadius: 10, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {JSON.stringify(selected.paystackData, null, 2)}
                    </pre>
                  </details>
                )}
              </>
            )}
          </div>
        </div>
      )}
      </>
      )}
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
  const auth = useAuth()
  const user = auth?.user
  const role = user?.role || 'admin'
  const [activeTab, setActiveTab] = useState('profile')

  // Non-admin staff can only edit personal details — no system/school settings
  const STAFF_ROLES = ['sales', 'ops_manager', 'accountant', 'dos']
  const isStaff = STAFF_ROLES.includes(role)

  const tabs = isStaff
    ? [
        { id: 'profile',  label: 'My Profile' },
        { id: 'password', label: 'Change Password' },
      ]
    : [
        { id: 'profile',  label: 'Profile' },
        { id: 'password', label: 'Change Password' },
        { id: 'email',    label: 'Email Settings' },
        { id: 'school',   label: 'School Settings' },
      ]

  return (
    <>
      <PSection
        tag="Personal"
        title="Account"
        em="Settings"
        sub={isStaff
          ? 'Update your personal profile and password.'
          : 'Manage your profile, password, and notification preferences'}
      />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1.5px solid ' + TOKENS.line, paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '10px 18px', border: 'none', background: 'transparent',
            borderBottom: activeTab === t.id ? '2.5px solid ' + TOKENS.crimson : '2.5px solid transparent',
            color: activeTab === t.id ? TOKENS.crimson : TOKENS.s500,
            fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500,
            cursor: 'pointer', marginBottom: -1.5, transition: 'all .15s',
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'profile'  && <SettingsProfileTab  user={user} toast={toast}/>}
      {activeTab === 'password' && <SettingsPasswordTab toast={toast}/>}
      {!isStaff && activeTab === 'email'  && <SettingsEmailTab  toast={toast}/>}
      {!isStaff && activeTab === 'school' && <SettingsSchoolTab toast={toast}/>}
    </>
  )
}

// ── Profile tab ───────────────────────────────────────────
function SettingsProfileTab({ user, toast }) {
  const [firstName,  setFirstName]  = useState(user?.firstName || '')
  const [lastName,   setLastName]   = useState(user?.lastName  || '')
  const [phone,      setPhone]      = useState(user?.phone     || '')
  const [saving,     setSaving]     = useState(false)
  const [avatarUrl,  setAvatarUrl]  = useState(user?.avatar    || '')
  const [uploading,  setUploading]  = useState(false)

  const save = async () => {
    if (!firstName.trim() || !lastName.trim()) { toast?.error?.('First and last name are required.'); return }
    setSaving(true)
    try {
      const { data } = await api.patch('/users/me', {
        firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(),
      })
      if (data?.success) toast?.ok?.('Profile updated.')
      else toast?.error?.(data?.message || 'Could not update profile.')
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not update profile.')
    } finally { setSaving(false) }
  }

  const uploadAvatar = async (file) => {
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { toast?.error?.('Image must be under 3 MB.'); return }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const { data } = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data?.success) {
        setAvatarUrl(data.data?.avatarUrl || '')
        toast?.ok?.('Profile photo updated.')
      } else {
        toast?.error?.(data?.message || 'Could not upload photo.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not upload photo.')
    } finally { setUploading(false) }
  }

  const inp = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 7, border: '1.5px solid ' + TOKENS.line, fontSize: 13, fontFamily: 'inherit' }
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 5 }
  const initials = (firstName[0] || '') + (lastName[0] || '')

  return (
    <div className="card" style={{ padding: 26, maxWidth: 520 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: TOKENS.s900, marginBottom: 20 }}>Your profile</div>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid ' + TOKENS.line }}/>
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: TOKENS.crimson, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#fff' }}>
              {initials || '?'}
            </div>
          )}
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }}/>
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.s900, marginBottom: 6 }}>Profile photo</div>
          <label style={{ display: 'inline-block', background: TOKENS.cream, border: '1.5px solid ' + TOKENS.line, borderRadius: 7, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, color: TOKENS.s700, cursor: uploading ? 'not-allowed' : 'pointer' }}>
            {uploading ? 'Uploading...' : 'Upload photo'}
            <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading}
              onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])}/>
          </label>
          <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 5 }}>JPG or PNG, max 3 MB</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={lbl}>First name</label>
          <input value={firstName} onChange={e => setFirstName(e.target.value)} style={inp}/>
        </div>
        <div>
          <label style={lbl}>Last name</label>
          <input value={lastName} onChange={e => setLastName(e.target.value)} style={inp}/>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Phone</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 700 000 000" style={inp}/>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>Email address</label>
        <div style={{ ...inp, background: TOKENS.cream, color: TOKENS.s500 }}>{user?.email || '—'}</div>
        <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 4 }}>To change your email contact your administrator.</div>
      </div>
      <button onClick={save} disabled={saving} style={{
        background: saving ? TOKENS.s300 : TOKENS.crimson, color: '#fff', border: 'none',
        padding: '10px 24px', borderRadius: 7, fontSize: 13, fontWeight: 700,
        cursor: saving ? 'not-allowed' : 'pointer',
      }}>{saving ? 'Saving...' : 'Save changes'}</button>
    </div>
  )
}

// ── Password tab ──────────────────────────────────────────
function SettingsPasswordTab({ toast }) {
  const [current,  setCurrent]  = useState('')
  const [next,     setNext]     = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [showCurr, setShowCurr] = useState(false)
  const [showNew,  setShowNew]  = useState(false)

  const save = async () => {
    if (!current.trim()) { toast?.error?.('Enter your current password.'); return }
    if (next.length < 8)  { toast?.error?.('New password must be at least 8 characters.'); return }
    if (next !== confirm)  { toast?.error?.('New passwords do not match.'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/users/change-password', { currentPassword: current, newPassword: next })
      if (data?.success) {
        toast?.ok?.('Password changed successfully.')
        setCurrent(''); setNext(''); setConfirm('')
      } else {
        toast?.error?.(data?.message || 'Could not change password.')
      }
    } catch (e) {
      toast?.error?.(e?.response?.data?.message || 'Could not change password.')
    } finally {
      setSaving(false)
    }
  }

  const inp  = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 7, border: '1.5px solid ' + TOKENS.line, fontSize: 13, fontFamily: 'inherit' }
  const lbl  = { display: 'block', fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 5 }
  const wrap = { position: 'relative', marginBottom: 14 }
  const eye  = { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.s500, fontSize: 12, fontWeight: 600 }

  return (
    <div className="card" style={{ padding: 26, maxWidth: 420 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: TOKENS.s900, marginBottom: 18 }}>Change password</div>
      <div style={wrap}>
        <label style={lbl}>Current password</label>
        <input type={showCurr ? 'text' : 'password'} value={current} onChange={e => setCurrent(e.target.value)} style={inp}/>
        <button style={eye} onClick={() => setShowCurr(v => !v)}>{showCurr ? 'Hide' : 'Show'}</button>
      </div>
      <div style={wrap}>
        <label style={lbl}>New password</label>
        <input type={showNew ? 'text' : 'password'} value={next} onChange={e => setNext(e.target.value)} style={inp}/>
        <button style={eye} onClick={() => setShowNew(v => !v)}>{showNew ? 'Hide' : 'Show'}</button>
        {next && next.length < 8 && <div style={{ fontSize: 11, color: '#B91C1C', marginTop: 3 }}>Must be at least 8 characters</div>}
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>Confirm new password</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} style={inp}/>
        {confirm && next !== confirm && <div style={{ fontSize: 11, color: '#B91C1C', marginTop: 3 }}>Passwords do not match</div>}
      </div>
      <div style={{ background: TOKENS.cream, border: '1px solid ' + TOKENS.line, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: TOKENS.s500, marginBottom: 18, lineHeight: 1.6 }}>
        Use at least 8 characters. Mix uppercase, lowercase, numbers and symbols for a strong password.
      </div>
      <button onClick={save} disabled={saving || !current || next.length < 8 || next !== confirm} style={{
        background: saving || !current || next.length < 8 || next !== confirm ? TOKENS.s300 : TOKENS.crimson,
        color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 7,
        fontSize: 13, fontWeight: 700, cursor: saving || !current || next.length < 8 || next !== confirm ? 'not-allowed' : 'pointer',
      }}>{saving ? 'Changing...' : 'Change password'}</button>
    </div>
  )
}

// ── Email settings tab ────────────────────────────────────
function SettingsEmailTab({ toast }) {
  const [notifyNewRequest, setNotifyNewRequest] = useState(true)
  const [notifyPayment,    setNotifyPayment]    = useState(true)
  const [notifyEnrolment,  setNotifyEnrolment]  = useState(true)
  const [adminEmail,       setAdminEmail]       = useState('hellosmartious@gmail.com')
  const [saving,           setSaving]           = useState(false)

  const Toggle = ({ val, set }) => (
    <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }}>
      <input type="checkbox" checked={val} onChange={() => set(!val)} style={{ opacity: 0, width: 0, height: 0 }}/>
      <span style={{ position: 'absolute', inset: 0, background: val ? TOKENS.crimson : TOKENS.s300, borderRadius: 99, transition: 'background .2s' }}/>
      <span style={{ position: 'absolute', top: 3, left: val ? 23 : 3, width: 18, height: 18, background: '#fff', borderRadius: '50%', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }}/>
    </label>
  )

  const inp = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 7, border: '1.5px solid ' + TOKENS.line, fontSize: 13, fontFamily: 'inherit' }
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 5 }

  const save = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) { toast?.error?.('Enter a valid email address.'); return }
    setSaving(true)
    // Preferences stored locally for now — backend persistence can be added later
    try {
      localStorage.setItem('sm_email_prefs', JSON.stringify({ notifyNewRequest, notifyPayment, notifyEnrolment, adminEmail }))
      toast?.ok?.('Email preferences saved.')
    } catch {
      toast?.error?.('Could not save preferences.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sm_email_prefs') || '{}')
      if (saved.notifyNewRequest !== undefined) setNotifyNewRequest(saved.notifyNewRequest)
      if (saved.notifyPayment    !== undefined) setNotifyPayment(saved.notifyPayment)
      if (saved.notifyEnrolment  !== undefined) setNotifyEnrolment(saved.notifyEnrolment)
      if (saved.adminEmail)                     setAdminEmail(saved.adminEmail)
    } catch {}
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 760 }}>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: TOKENS.s900, marginBottom: 16 }}>Admin notification email</div>
        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>Send admin notifications to</label>
          <input value={adminEmail} onChange={e => setAdminEmail(e.target.value)} type="email" placeholder="hellosmartious@gmail.com" style={inp}/>
          <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 4 }}>
            Assessment requests, payment confirmations and enrolment alerts go here.
          </div>
        </div>
        <button onClick={save} disabled={saving} style={{
          background: saving ? TOKENS.s300 : TOKENS.crimson, color: '#fff', border: 'none',
          padding: '9px 22px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
        }}>{saving ? 'Saving...' : 'Save'}</button>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: TOKENS.s900, marginBottom: 16 }}>Notification preferences</div>
        {[
          { label: 'New assessment request',  desc: 'Alert when a family submits a request', val: notifyNewRequest, set: setNotifyNewRequest },
          { label: 'Payment received',        desc: 'Alert when assessment fee is paid',     val: notifyPayment,    set: setNotifyPayment    },
          { label: 'Student enrolment',       desc: 'Alert when a new student enrols',       val: notifyEnrolment,  set: setNotifyEnrolment  },
        ].map((row, i, arr) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid ' + TOKENS.line : 'none' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: TOKENS.s900 }}>{row.label}</div>
              <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>{row.desc}</div>
            </div>
            <Toggle val={row.val} set={row.set}/>
          </div>
        ))}
        <button onClick={save} disabled={saving} style={{
          marginTop: 16, background: saving ? TOKENS.s300 : TOKENS.crimson, color: '#fff', border: 'none',
          padding: '9px 22px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
        }}>{saving ? 'Saving...' : 'Save preferences'}</button>
      </div>
    </div>
  )
}

// ── School settings tab ───────────────────────────────────
function SettingsSchoolTab({ toast }) {
  const [schoolName,    setSchoolName]    = useState('Smartious Homeschool and eSchool')
  const [whatsapp,      setWhatsapp]      = useState('+254745021212')
  const [contactEmail,  setContactEmail]  = useState('hellosmartious@gmail.com')
  const [assessFeeUSD,  setAssessFeeUSD]  = useState('45')
  const [assessFeeKES,  setAssessFeeKES]  = useState('5800')
  const [saving,        setSaving]        = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      // Save to localStorage — wire to backend /api/settings when ready
      const payload = { schoolName, whatsapp, contactEmail, assessFeeUSD, assessFeeKES }
      localStorage.setItem('sm_school_settings', JSON.stringify(payload))
      toast?.ok?.('School settings saved.')
    } catch {
      toast?.error?.('Could not save settings.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sm_school_settings') || '{}')
      if (saved.schoolName)   setSchoolName(saved.schoolName)
      if (saved.whatsapp)     setWhatsapp(saved.whatsapp)
      if (saved.contactEmail) setContactEmail(saved.contactEmail)
      if (saved.assessFeeUSD) setAssessFeeUSD(saved.assessFeeUSD)
      if (saved.assessFeeKES) setAssessFeeKES(saved.assessFeeKES)
    } catch {}
  }, [])

  const inp = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 7, border: '1.5px solid ' + TOKENS.line, fontSize: 13, fontFamily: 'inherit' }
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: TOKENS.crimson, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 5 }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 760 }}>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: TOKENS.s900, marginBottom: 16 }}>School identity</div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>School name</label>
          <input value={schoolName} onChange={e => setSchoolName(e.target.value)} style={inp}/>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>WhatsApp number</label>
          <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+254745021212" style={inp}/>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Contact email</label>
          <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} type="email" style={inp}/>
        </div>
        <button onClick={save} disabled={saving} style={{
          background: saving ? TOKENS.s300 : TOKENS.crimson, color: '#fff', border: 'none',
          padding: '9px 22px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
        }}>{saving ? 'Saving...' : 'Save'}</button>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: TOKENS.s900, marginBottom: 16 }}>Assessment fee</div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Fee in USD</label>
          <input value={assessFeeUSD} onChange={e => setAssessFeeUSD(e.target.value)} type="number" min="0" style={inp}/>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Fee in KES</label>
          <input value={assessFeeKES} onChange={e => setAssessFeeKES(e.target.value)} type="number" min="0" style={inp}/>
          <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 4 }}>
            KES amount is charged via Paystack. USD amount is shown in emails and the public form.
          </div>
        </div>
        <div style={{ background: TOKENS.cream, border: '1px solid ' + TOKENS.line, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: TOKENS.s500, marginBottom: 18, lineHeight: 1.6 }}>
          Changing these values updates the display only. To change the actual Paystack charge amount, update <strong>ASSESSMENT_AMOUNT_KES</strong> in <code>backend/src/routes/assessment.js</code> and redeploy.
        </div>
        <button onClick={save} disabled={saving} style={{
          background: saving ? TOKENS.s300 : TOKENS.crimson, color: '#fff', border: 'none',
          padding: '9px 22px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
        }}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </div>
  )
}


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
