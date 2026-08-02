import React, { useState } from 'react'
import { TOKENS } from './tokens.js'

export function ModuleIcon({ kind, size = 64, accent = TOKENS.crimson }) {
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

export const Av = ({ init = '?', col = '#7D1025', size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: col, color: '#FBFAF5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.4, fontWeight: 700,
    fontFamily: "system-ui, sans-serif",
    flexShrink: 0,
  }}>{init}</div>
)

export function PCard({ children, accent, padding = 22, style = {} }) {
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

export function PSection({ tag, title, em, sub, action }) {
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

export function PTile({ kind, title, sub, accent, onClick, badge }) {
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

export function PKpi({ label, value, delta, accent = TOKENS.crimson, deltaColor }) {
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

export function PlanBadge({ p }) {
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

export function DOSSpinner() {
  return (
    <div style={{ padding:'50px 0', textAlign:'center' }}>
      <div style={{ width:34, height:34, border:'3px solid #F0EBE6', borderTopColor:TOKENS.crimson, borderRadius:'50%', animation:'spin .75s linear infinite', margin:'0 auto' }}/>
    </div>
  )
}
