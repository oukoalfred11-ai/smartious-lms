import { useEffect, useRef, useState } from 'react'

/**
 * MobileTabBar — the bottom tab bar of the phone layouts and the apps.
 * Frosted glass, a pill behind the active icon, haptic tick on tap
 * (via the .sm-tab class, see lib/appShell.js), safe-area aware.
 *
 * tabs: [{ id, label, shortLabel?, icon (svg path d, '|'-separated for
 *          several paths) or svg (inner markup string), badge?, live? }]
 * A tab with id '__more' calls onMore instead of setPage.
 */
export default function MobileTabBar({ tabs, page, setPage, onMore }) {
  return (
    <nav className="sm-tabbar" aria-label="Main">
      {tabs.map(tab => {
        const on = tab.id === '__more' ? false : page === tab.id
        return (
          <button key={tab.id} type="button" className={`sm-tab${on ? ' on' : ''}`}
            aria-current={on ? 'page' : undefined}
            onClick={() => (tab.id === '__more' ? onMore?.() : setPage(tab.id))}>
            <span className="sm-tab-ico">
              {tab.svg
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={on ? 2.1 : 1.8}
                    strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: tab.svg }} />
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={on ? 2.1 : 1.8}
                    strokeLinecap="round" strokeLinejoin="round">
                    <IconParts icon={tab.icon} />
                  </svg>}
            </span>
            <span style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tab.shortLabel || tab.label}
            </span>
            {tab.badge ? <span className="sm-tab-badge">{tab.badge}</span> : null}
            {tab.live ? <span className="sm-tab-dot" /> : null}
          </button>
        )
      })}
    </nav>
  )
}

/**
 * Draws the portals' compact icon notation: path data separated by '|',
 * where a 'circle:cx:cy:r' segment is a circle.
 */
export function IconParts({ icon }) {
  return String(icon || 'M3 12h18').split('|').map((d, i) => {
    if (d.startsWith('circle:')) {
      const [cx, cy, r] = d.slice(7).split(':')
      return <circle key={i} cx={cx} cy={cy} r={r} />
    }
    return <path key={i} d={d} />
  })
}

export const MORE_TAB = {
  id: '__more', label: 'More',
  icon: 'M4 6h16|M4 12h16|M4 18h16',
}

/** Phone-width breakpoint shared by the portals' mobile layouts. */
export function useIsPhone(max = 768) {
  const q = `(max-width: ${max - 0.02}px)`
  const [phone, setPhone] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const fn = () => setPhone(mq.matches)
    fn()
    mq.addEventListener?.('change', fn)
    return () => mq.removeEventListener?.('change', fn)
  }, [q])
  return phone
}

/**
 * Android back button (and the Windows app's mouse back button) inside a
 * portal: `handler` returns true when it consumed the press — closed a
 * drawer, went back to the dashboard — otherwise the app navigates back
 * or minimises. See lib/appShell.js.
 */
export function useBackHandler(handler) {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    const fn = (e) => { if (ref.current?.()) e.preventDefault() }
    window.addEventListener('sm-back', fn)
    return () => window.removeEventListener('sm-back', fn)
  }, [])
}
