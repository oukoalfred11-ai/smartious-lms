import { SOCIAL_LINKS } from '../data/social.js'

// Row of icon links to the official Smartious social profiles.
// `color` is the resting icon colour; icons turn gold on hover/focus.
export default function SocialLinks({ color = 'currentColor', size = 16, gap = 10, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap, flexWrap: 'wrap', ...style }}>
      {SOCIAL_LINKS.map(s => (
        <a
          key={s.id}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Smartious on ${s.name} (opens in a new tab)`}
          title={s.name}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size + 16, height: size + 16, borderRadius: '50%', border: '1px solid rgba(201,151,58,.35)', color, transition: 'color .2s, border-color .2s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#C9973A'; e.currentTarget.style.borderColor = '#C9973A' }}
          onMouseLeave={e => { e.currentTarget.style.color = color; e.currentTarget.style.borderColor = 'rgba(201,151,58,.35)' }}
          onFocus={e => { e.currentTarget.style.color = '#C9973A' }}
          onBlur={e => { e.currentTarget.style.color = color }}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d={s.path} /></svg>
        </a>
      ))}
    </div>
  )
}
