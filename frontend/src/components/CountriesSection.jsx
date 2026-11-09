/**
 * CountriesSection.jsx — home page "Online school in your country".
 * Photo plates (countries with artwork first, then the crimson plates),
 * then a searchable list of every country hub. A plate shows its photo as
 * soon as its plate images are in public/images/countries/. Data: src/data/countriesListing.js. Design from the
 * Smartious countries listing (DM Sans + Source Serif 4, crimson/gold).
 */
import { useState } from 'react'
import { COUNTRY_PLATES, ALL_COUNTRIES } from '../data/countriesListing.js'
import { imageExists } from '../data/generated/publicImages.js'

// Plates with photos first; list order kept within each group.
const hasPhoto = c => imageExists(`/images/countries/${c.slug}-plate-600.webp`)
const WITH_PHOTO = COUNTRY_PLATES.filter(hasPhoto)
const CRIMSON = COUNTRY_PLATES.filter(c => !hasPhoto(c))
// Full rows on desktop: 5 or 4 columns, whichever leaves out the fewest crimson
// plates (photo plates are never left out; a left-out country is still in the
// searchable list below). Tablet: 3 or 2 columns that divide the count, else 3.
const pick = (() => {
  let best = { cols: 4, n: COUNTRY_PLATES.length, drop: Infinity }
  for (const cols of [5, 4]) {
    const total = WITH_PHOTO.length + CRIMSON.length
    const n = Math.max(Math.floor(total / cols) * cols, WITH_PHOTO.length)
    // Fewest plates left out first; on a tie, prefer the column count that fills every row.
    const drop = total - n + (n % cols ? 0.5 : 0)
    if (drop < best.drop) best = { cols, n, drop }
  }
  return best
})()
const PLATES = [...WITH_PHOTO, ...CRIMSON].slice(0, pick.n)
const COLS = pick.cols
const COLS_MD = [3, 2].find(k => PLATES.length % k === 0) || 3

const CSS = `
.sm-countries{--crimson:#7D1025;--deep:#4A0816;--gold:#D4A64A;--ink:#2A050D;--cream:#F8F3EA;--muted:#6B5A5E;
  background:var(--cream);padding:96px 24px;font-family:'DM Sans',system-ui,sans-serif;color:var(--ink)}
.sm-countries *{box-sizing:border-box}
.sm-wrap{max-width:1240px;margin:0 auto}
.sm-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-bottom:40px}
.sm-eyebrow{font-weight:800;font-size:13px;letter-spacing:.32em;color:var(--crimson);text-transform:uppercase;margin:0 0 14px}
.sm-title{font-family:'Source Serif 4',Georgia,serif;font-weight:700;font-size:clamp(34px,4.4vw,56px);line-height:1.05;letter-spacing:-.01em;color:var(--crimson);margin:0}
.sm-sub{font-size:18px;line-height:1.6;color:var(--muted);max-width:520px;margin:14px 0 0}
.sm-link{font-weight:700;font-size:15px;color:var(--crimson);text-decoration:none;border-bottom:2px solid var(--gold);padding-bottom:4px;white-space:nowrap}
.sm-grid{display:grid;grid-template-columns:repeat(var(--cols,4),1fr);gap:22px}
.sm-plate{position:relative;display:block;aspect-ratio:4/5;border-radius:22px;overflow:hidden;text-decoration:none;
  background:var(--deep);box-shadow:0 18px 40px rgba(74,8,22,.16);transform:translateZ(0);
  transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
.sm-plate img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.sm-plate:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(74,8,22,0) 45%,rgba(74,8,22,.55) 72%,rgba(74,8,22,.95) 100%)}
.sm-plate:hover,.sm-plate:focus-visible{transform:translateY(-6px);box-shadow:0 28px 60px rgba(74,8,22,.28)}
.sm-plate:hover img{transform:scale(1.05)}
.sm-plate:focus-visible{outline:3px solid var(--gold);outline-offset:4px}
.sm-region{position:absolute;z-index:2;top:16px;left:16px;padding:7px 12px;border-radius:30px;background:rgba(255,255,255,.92);
  font-weight:800;font-size:11px;letter-spacing:.18em;color:var(--crimson);text-transform:uppercase}
.sm-info{position:absolute;z-index:2;left:22px;right:70px;bottom:20px;color:#fff}
.sm-name{font-family:'Source Serif 4',Georgia,serif;font-weight:700;font-size:34px;line-height:1;margin:0 0 8px;color:#fff}
.sm-cities{font-weight:500;font-size:14px;letter-spacing:.04em;color:#F3E2B8;margin:0}
.sm-go{position:absolute;z-index:2;right:18px;bottom:20px;width:42px;height:42px;border-radius:50%;background:var(--gold);
  display:flex;align-items:center;justify-content:center;transition:transform .35s}
.sm-plate:hover .sm-go{transform:translateX(4px)}
.sm-go svg{width:18px;height:18px}
.sm-plate.noimg{background:radial-gradient(ellipse 80% 60% at 30% 20%,#A8173A 0%,#7D1025 45%,#4A0816 100%)}
.sm-plate.noimg:before{content:attr(data-code);position:absolute;right:-10px;top:30px;font-family:'Source Serif 4',Georgia,serif;
  font-weight:800;font-size:150px;line-height:1;color:rgba(212,166,74,.18)}
.sm-all{margin-top:80px;padding-top:56px;border-top:1px solid rgba(125,16,37,.15)}
.sm-tools{display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin:24px 0 28px}
.sm-search{flex:1 1 320px;max-width:440px;height:54px;border-radius:40px;border:1.5px solid rgba(125,16,37,.25);background:#fff;
  padding:0 24px;font:500 16px 'DM Sans',sans-serif;color:var(--ink);outline:none}
.sm-search:focus{border-color:var(--crimson)}
.sm-count{font-size:14px;color:var(--muted)}
.sm-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;list-style:none;margin:0;padding:0}
.sm-list a{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-radius:12px;background:#fff;
  border:1px solid rgba(125,16,37,.1);text-decoration:none;font-weight:500;font-size:15px;color:var(--ink);transition:all .2s}
.sm-list a:after{content:"\\2192";color:var(--gold);font-weight:700;opacity:0;transform:translateX(-4px);transition:all .2s}
.sm-list a:hover{border-color:var(--crimson);color:var(--crimson)}
.sm-list a:hover:after{opacity:1;transform:none}
.sm-cityline{margin-top:36px;font-size:14px;line-height:2;color:var(--muted)}
.sm-cityline a{color:var(--crimson);font-weight:600;text-decoration:none}
@media (max-width:1024px){.sm-grid{grid-template-columns:repeat(var(--cols-md,3),1fr)}}
@media (max-width:760px){
  .sm-countries{padding:64px 18px}
  .sm-grid{grid-template-columns:none;grid-auto-flow:column;grid-auto-columns:72%;overflow-x:auto;scroll-snap-type:x mandatory;
    padding-bottom:12px;margin:0 -18px;padding-left:18px;padding-right:18px;scrollbar-width:none}
  .sm-plate{scroll-snap-align:start}
  .sm-list{grid-template-columns:repeat(2,1fr)}
}
@media (prefers-reduced-motion:reduce){.sm-plate,.sm-plate img,.sm-go{transition:none}}
`

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#4A0816" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
)

export default function CountriesSection({ nav, cityLinks = [] }) {
  const [q, setQ] = useState('')
  const go = (href) => (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
    e.preventDefault(); nav(href); window.scrollTo(0, 0)
  }
  const v = q.trim().toLowerCase()
  const shown = ALL_COUNTRIES.filter(c => !v || c.name.toLowerCase().includes(v))
  return (
    <section id="countries" className="sm-countries" aria-labelledby="sm-countries-title">
      <style>{CSS}</style>
      <div className="sm-wrap">
        <div className="sm-head">
          <div>
            <p className="sm-eyebrow">Where our families learn</p>
            <h2 className="sm-title" id="sm-countries-title">Online school in your country</h2>
            <p className="sm-sub">Live classes with expert teachers, timed for your timezone. Choose your country to see curricula, class times and fees.</p>
          </div>
          <a className="sm-link" href="#sm-all">See all countries</a>
        </div>

        <div className="sm-grid" style={{'--cols': COLS, '--cols-md': COLS_MD}}>
          {PLATES.map(c => {
            const img = hasPhoto(c)
            const href = '/online-school/' + c.slug
            return (
              <a key={c.slug} className={'sm-plate' + (img ? '' : ' noimg')} data-code={c.code} href={href} onClick={go(href)}>
                {img && (
                  <img src={`/images/countries/${c.slug}-plate-600.webp`}
                    srcSet={`/images/countries/${c.slug}-plate-600.webp 600w, /images/countries/${c.slug}-plate-1200.webp 1200w`}
                    sizes="(max-width:760px) 72vw, (max-width:1024px) 50vw, 300px" width="600" height="750"
                    alt={`Children learning online in ${c.name}`} loading="lazy" decoding="async"/>
                )}
                <span className="sm-region">{c.region}</span>
                <div className="sm-info"><h3 className="sm-name">{c.name}</h3><p className="sm-cities">{c.cities}</p></div>
                <span className="sm-go"><Arrow/></span>
              </a>
            )
          })}
        </div>

        <div className="sm-all" id="sm-all">
          <p className="sm-eyebrow">All countries</p>
          <h2 className="sm-title">Online school by country</h2>
          <div className="sm-tools">
            <input className="sm-search" type="search" placeholder="Search your country" aria-label="Search your country" autoComplete="off"
              value={q} onChange={e => setQ(e.target.value)}/>
            <span className="sm-count" aria-live="polite">{shown.length} of {ALL_COUNTRIES.length} countries</span>
          </div>
          <ul className="sm-list">
            {shown.map(c => {
              const href = '/online-school/' + c.slug
              return <li key={c.slug}><a href={href} onClick={go(href)}>{c.name}</a></li>
            })}
          </ul>
          {cityLinks.length > 0 && (
            <p className="sm-cityline">
              <strong style={{ color: 'var(--ink)' }}>Online school &amp; homeschool by city:</strong>{' '}
              {cityLinks.map(([href, label], i) => (
                <span key={href}>{i ? ' · ' : ''}<a href={href} onClick={go(href)}>{label}</a></span>
              ))}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
