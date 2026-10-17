/* CountryVideo — the Smartious introduction video on country pages.
 * Shows the YouTube thumbnail with a play button and loads the player
 * (youtube-nocookie, no tracking until played) only when tapped, so the
 * page stays fast. Kenya has its own video and does not use this. */
import { useState } from 'react'

export const COUNTRY_VIDEO_ID = 'g7MCbI4cuUw'

export default function CountryVideo({ V, countryName, videoId = COUNTRY_VIDEO_ID }) {
  const [playing, setPlaying] = useState(false)
  return (
    <section className="sec" style={{ background: V.white, paddingTop: 56, paddingBottom: 56 }}><div className="wrap">
      <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>See Smartious in action</div>
        <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: '1.8rem', fontWeight: 400, color: V.ink, margin: '8px 0 18px', lineHeight: 1.2 }}>
          How online school with Smartious works{countryName ? ` for families in ${countryName}` : ''}
        </h2>
        <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: 14, overflow: 'hidden', background: '#000', boxShadow: '0 12px 32px rgba(0,0,0,.18)' }}>
          {playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title="Smartious Homeschool introduction video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            />
          ) : (
            <button type="button" onClick={() => setPlaying(true)} aria-label="Play the Smartious introduction video"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', padding: 0, cursor: 'pointer', background: 'transparent' }}>
              <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="Smartious Homeschool introduction video" loading="lazy" width="480" height="360"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <span aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.45) 100%)' }}>
                <span style={{ width: 76, height: 76, borderRadius: '50%', background: 'rgba(139,26,46,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div></section>
  )
}
