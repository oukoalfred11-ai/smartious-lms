/**
 * HeroPanelVideo.jsx
 * ============================================================
 * The flagged dashboard banner film, reusable in two shapes:
 *
 * 1. Backdrop (default): drop it as the FIRST child of any module's
 *    crimson header. It fills the panel behind the header's own text
 *    (video at zIndex -1, so the panel's content needs no changes),
 *    with a crimson scrim keeping the text readable. The host panel
 *    only needs position relative, zIndex 0 and overflow hidden.
 *
 * 2. Band (prop band): a standalone rounded video panel for pages
 *    that have no crimson header of their own.
 *
 * Self sufficient: fetches the banner URL itself (once per session,
 * shared cache) and renders NOTHING when no banner video is flagged
 * or the video cannot play - pages then look exactly as before.
 */
import { useState, useEffect } from 'react'
import { api } from '../context/ctx.jsx'

let heroUrlPromise = null
function fetchHeroUrl() {
  if (!heroUrlPromise) {
    heroUrlPromise = api.get('/announcements/hero-video')
      .then(r => (r.data?.success && r.data.data.videoUrl) || '')
      .catch(() => '')
  }
  return heroUrlPromise
}

export default function HeroPanelVideo({ band = false }) {
  const [src, setSrc] = useState('')
  const [dead, setDead] = useState(false)
  useEffect(() => {
    let gone = false
    fetchHeroUrl().then(u => { if (!gone) setSrc(u) })
    return () => { gone = true }
  }, [])
  if (!src || dead) return null

  const media = (radius) => (
    <>
      <video src={src} autoPlay muted loop playsInline preload="auto" onError={() => setDead(true)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: radius }} />
      {/* Dye, not veil: a solid crimson multiplied into the footage
          keeps the brand colour deep and vivid instead of the washed,
          faded look a translucent overlay gives over bright video. */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: radius, background: '#7D1025', mixBlendMode: 'multiply', opacity: .82 }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: radius, background: 'linear-gradient(100deg, rgba(20,2,6,.5) 0%, rgba(20,2,6,.15) 45%, rgba(20,2,6,.35) 100%)' }} />
    </>
  )

  if (band) {
    return (
      <div style={{ position: 'relative', height: 230, borderRadius: 20, overflow: 'hidden', marginBottom: 18, background: 'linear-gradient(100deg,#7D1025,#3D0712)', boxShadow: '0 8px 32px rgba(125,16,37,.22)' }}>
        {media(0)}
      </div>
    )
  }
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
      {media(0)}
    </div>
  )
}
