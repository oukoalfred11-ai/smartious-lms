/**
 * HeroBackdrop.jsx
 * ============================================================
 * The one way a public website hero puts words over a photograph.
 *
 * Same recipe as the portal banner films (HeroPanelVideo): the photo
 * is DYED with a solid crimson multiplied into it, not veiled with a
 * translucent wash (a wash over a bright photo looks faded and still
 * leaves white text unreadable). A dark ink gradient then sits behind
 * the words, and the host adds className "hero-legible" for a soft
 * text shadow. The styles live in styles/global.css (.hero-backdrop*,
 * .hero-legible).
 *
 * Usage: make it the FIRST child of a hero whose style has
 * position relative and overflow hidden, and give the hero's content
 * position relative with zIndex 1 or more:
 *
 *   <section className="sec hero-legible" style={{position:'relative',overflow:'hidden',background:V.ink}}>
 *     <HeroBackdrop src={photo}/>
 *     <div className="wrap" style={{position:'relative',zIndex:2}}>...</div>
 *   </section>
 *
 * When the photo is missing or fails to load, nothing is drawn and
 * the hero keeps its own background colour.
 */
import { useState } from 'react'

// Crimson #7D1025 multiplied into the footage. Shared with
// HeroPanelVideo so every hero on the site is dyed the same way.
export const HERO_DYE = { background: '#7D1025', mixBlendMode: 'multiply', opacity: 0.82 }

export default function HeroBackdrop({ src, alt = '', position = 'center' }) {
  // Remember WHICH photo failed, so the next page's photo still loads
  // when the same hero is reused for another city or country.
  const [failedSrc, setFailedSrc] = useState(null)
  if (!src || failedSrc === src) return null
  return (
    <div className="hero-backdrop" aria-hidden={alt ? undefined : 'true'}>
      <img src={src} alt={alt} loading="eager" fetchpriority="high" decoding="async"
        onError={() => setFailedSrc(src)}
        className="hero-backdrop-media" style={{ objectPosition: position }}/>
      <div className="hero-backdrop-layer" style={HERO_DYE}/>
      <div className="hero-backdrop-layer hero-backdrop-shade"/>
    </div>
  )
}
