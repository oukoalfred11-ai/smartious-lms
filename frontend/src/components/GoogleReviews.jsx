/* Rotating Google reviews: rating badge, one quote at a time on a timer,
   dots to jump, links to the profile. Pauses on hover/focus and when the
   visitor prefers reduced motion. All quotes stay in the DOM (hidden ones
   are aria-hidden) so crawlers and screen readers can still reach them. */
import { useEffect, useState } from 'react'
import {
  GOOGLE_RATING, GOOGLE_REVIEWS, GOOGLE_PROFILE_URL, LEAVE_REVIEW_URL, reviewOffset,
} from '../data/googleReviews.js'

const INTERVAL_MS = 7000

function Stars({ n, color, size = 16 }) {
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      ))}
    </span>
  )
}

export function GoogleRatingBadge({ V, dark = false }) {
  return (
    <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer"
      aria-label={`Rated ${GOOGLE_RATING.stars} out of 5 on Google from ${GOOGLE_RATING.count}+ reviews`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 24, textDecoration: 'none', fontSize: 12.5,
        background: dark ? 'rgba(255,255,255,.08)' : V.bone, border: `1px solid ${dark ? 'rgba(255,255,255,.18)' : V.bone3}`, color: dark ? '#fff' : V.sl }}>
      <Stars n={5} color={V.gold3} size={14} />
      <span style={{ fontWeight: 700, color: dark ? '#fff' : V.ink }}>{GOOGLE_RATING.stars} / 5</span>
      <span>·</span>
      <span>{GOOGLE_RATING.count}+ Google reviews</span>
    </a>
  )
}

export default function GoogleReviews({ V, seed = '', heading, intro, showHeader = true }) {
  const n = GOOGLE_REVIEWS.length
  const [i, setI] = useState(() => reviewOffset(seed))
  const [paused, setPaused] = useState(false)

  useEffect(() => { setI(reviewOffset(seed)) }, [seed])

  useEffect(() => {
    if (paused) return
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI(x => (x + 1) % n), INTERVAL_MS)
    return () => clearInterval(t)
  }, [paused, n])

  const go = d => setI(x => (x + d + n) % n)

  return (
    <div>
      {showHeader && (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>What parents say</div>
          <h3 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: '1.6rem', fontWeight: 400, color: V.ink, marginTop: 8, marginBottom: 14, lineHeight: 1.2 }}>
            {heading || `Rated ${GOOGLE_RATING.stars} on Google by ${GOOGLE_RATING.count}+ families`}
          </h3>
          {intro && <p style={{ fontSize: 14, color: V.sl, lineHeight: 1.7, maxWidth: 680, margin: '0 auto 14px' }}>{intro}</p>}
          <GoogleRatingBadge V={V} />
        </div>
      )}

      <div
        role="region" aria-roledescription="carousel" aria-label="Parent reviews from Google"
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
        style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'grid' }}>
          {GOOGLE_REVIEWS.map((r, k) => (
            <figure key={k} aria-hidden={k !== i} style={{
              gridArea: '1 / 1', margin: 0, padding: '26px 28px', background: V.white, border: `1px solid ${V.bone3}`, borderRadius: 14,
              boxShadow: '0 10px 30px rgba(8,12,20,.06)', display: 'flex', flexDirection: 'column', gap: 12,
              opacity: k === i ? 1 : 0, visibility: k === i ? 'visible' : 'hidden', transition: 'opacity .5s ease, visibility .5s',
            }}>
              <Stars n={r.rating} color={V.gold3} />
              <blockquote style={{ margin: 0, fontFamily: "'DM Serif Display',Georgia,serif", fontStyle: 'italic', fontSize: '1.05rem', color: V.ink, lineHeight: 1.7 }}>
                &ldquo;{r.text}&rdquo;
              </blockquote>
              <figcaption style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
                <span style={{ width: 36, height: 36, borderRadius: '50%', background: V.cr, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{r.name.charAt(0)}</span>
                <span>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: V.ink }}>{r.name}</span>
                  <span style={{ display: 'block', fontSize: 11.5, color: V.sl }}>{r.context} · Google review</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 16 }}>
          <button type="button" onClick={() => go(-1)} aria-label="Previous review"
            style={{ background: 'none', border: `1px solid ${V.bone3}`, borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: V.ink }}>&lsaquo;</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {GOOGLE_REVIEWS.map((_, k) => (
              <button key={k} type="button" onClick={() => setI(k)} aria-label={`Show review ${k + 1} of ${n}`} aria-current={k === i}
                style={{ width: k === i ? 22 : 8, height: 8, borderRadius: 4, border: 'none', padding: 0, cursor: 'pointer', background: k === i ? V.cr : V.bone3, transition: 'width .3s' }} />
            ))}
          </div>
          <button type="button" onClick={() => go(1)} aria-label="Next review"
            style={{ background: 'none', border: `1px solid ${V.bone3}`, borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: V.ink }}>&rsaquo;</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 }}>
        <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="btn-o" style={{ textDecoration: 'none' }}>
          Read all reviews on Google &raquo;
        </a>
        <a href={LEAVE_REVIEW_URL} target="_blank" rel="noopener noreferrer" className="btn-p" style={{ textDecoration: 'none' }}>
          Leave us a review &raquo;
        </a>
      </div>
    </div>
  )
}
