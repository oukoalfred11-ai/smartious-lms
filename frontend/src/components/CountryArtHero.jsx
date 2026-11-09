/* ═══════════════════════════════════════════════════════════════════
   CountryArtHero.jsx — the hero for country pages that have artwork
   ───────────────────────────────────────────────────────────────────
   Artwork: public/images/countries/<slug>-art-1920.webp and -3840.webp
   (city and cut-outs, no lettering). The heading, cities and buttons are
   real text, so they stay sharp and readable at every width.
     Desktop: text in a cream column on the left, artwork on the right.
     Mobile:  artwork on top, text below.
   The value proposition sits in a quiet strip under the hero.
   padding-top clears the fixed site header (.lp-header, 103px).
   Headings in Source Serif 4, body in DM Sans; one colour per sentence.
═══════════════════════════════════════════════════════════════════ */

const CSS = `
.cah{position:relative;background:#F8F3EA;color:#7D1025;overflow:hidden;padding-top:103px}
.cah-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.18fr);min-height:clamp(520px,40vw,760px)}
.cah-text{display:flex;align-items:center;justify-content:flex-end;padding:clamp(40px,5vw,88px) clamp(24px,3vw,48px) clamp(40px,5vw,88px) 24px;position:relative;z-index:2}
.cah-box{width:100%;max-width:560px}
.cah-media{position:relative;min-height:100%}
.cah-media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:right center;display:block}
.cah-media::before{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,#F8F3EA 0%,rgba(248,243,234,.82) 10%,rgba(248,243,234,0) 32%)}
.cah-eb{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;font-size:12px;line-height:1.5;letter-spacing:.18em;text-transform:uppercase;color:#7D1025;margin:0 0 16px}
.cah h1{margin:0 0 20px;color:#7D1025;font-family:'Source Serif 4',Georgia,serif;font-weight:700;line-height:1}
.cah-l1{display:block;font-style:italic;font-weight:600;font-size:clamp(1.45rem,2.3vw,2.3rem);line-height:1.15;margin-bottom:8px}
.cah-l2{display:block;font-size:clamp(3rem,6vw,5.6rem);letter-spacing:-.02em;line-height:.98}
.cah-l2.long{font-size:clamp(2.4rem,4.2vw,4rem)}
.cah-sub{font-family:'DM Sans',system-ui,sans-serif;font-size:17px;line-height:1.65;color:#3B2A2F;margin:0 0 22px;max-width:520px}
.cah-chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 28px;padding:0;list-style:none}
.cah-chips li{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:#7D1025;background:#fff;border:1.5px solid rgba(125,16,37,.22);border-radius:999px;padding:7px 13px}
.cah-btns{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.cah-b1,.cah-b2{font-family:'DM Sans',system-ui,sans-serif;display:inline-flex;align-items:center;gap:10px;text-decoration:none;border-radius:10px;font-size:16px;font-weight:800;padding:16px 28px;transition:transform .18s ease,box-shadow .18s ease,background .18s ease}
.cah a.cah-b1{background:#7D1025;color:#fff !important;box-shadow:0 10px 26px rgba(125,16,37,.28)}
.cah a.cah-b1:hover{transform:translateY(-2px);background:#5E0B1C}
.cah a.cah-b2{background:transparent;color:#7D1025 !important;border:2px solid rgba(125,16,37,.35);padding:14px 24px}
.cah a.cah-b2:hover{transform:translateY(-2px);border-color:#7D1025}
.cah-note{font-family:'DM Sans',system-ui,sans-serif;font-size:13px;color:#6B5A5E;margin:16px 0 0}
.cah-also{font-family:'DM Sans',system-ui,sans-serif;font-size:14px;margin:0 0 18px}
.cah-also a{color:#7D1025;font-weight:700}
.cah-vp{background:#fff;border-bottom:1px solid #EFE6D8}
.cah-vp p{font-family:'DM Sans',system-ui,sans-serif;max-width:860px;margin:0 auto;padding:30px 24px;font-size:16px;line-height:1.7;color:#3B2A2F;text-align:center}
@media (max-width: 960px){
  .cah-grid{grid-template-columns:1fr;min-height:0}
  .cah-media{order:-1;min-height:0;aspect-ratio:4/3;max-height:62vh}
  .cah-media::before{background:linear-gradient(180deg,rgba(248,243,234,0) 62%,#F8F3EA 100%)}
  .cah-text{justify-content:flex-start;padding:4px 20px 40px}
  .cah-box{max-width:640px}
  .cah-eb{font-size:11px;letter-spacing:.14em;margin-bottom:12px}
  .cah-l1{font-size:1.45rem}
  .cah-l2{font-size:clamp(2.7rem,12vw,3.6rem)}
  .cah-l2.long{font-size:clamp(2.1rem,9vw,2.8rem)}
  .cah-sub{font-size:16px}
  .cah-b1,.cah-b2{flex:1 1 auto;justify-content:center}
  .cah-vp p{font-size:15px;text-align:left;padding:24px 20px}
}
`

const go = (nav, href, onClick) => (e) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
  e.preventDefault()
  if (onClick) onClick(); else nav(href)
  window.scrollTo(0, 0)
}

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
)

/**
 * slug      — artwork file prefix (/images/countries/<slug>-art-*.webp)
 * lead      — first line of the H1, e.g. "Online school & homeschool in"
 * name      — the large second line of the H1, e.g. "Kenya"
 * eyebrow, subhead, valueProp — copy from the country data
 * cities    — city names for the chips
 * primary   — { label, href, onClick? }   secondary — same, optional
 * seeAlso   — [{ label, href }] links shown above the buttons
 */
export default function CountryArtHero({ slug, lead, name, eyebrow, subhead, valueProp, cities = [], primary, secondary, note, seeAlso = [], nav, alt }) {
  const art = `/images/countries/${slug}-art-1920.webp`
  return (
    <>
      <style>{CSS}</style>
      <section className="cah">
        <div className="cah-grid">
          <div className="cah-text">
            <div className="cah-box">
              {eyebrow && <p className="cah-eb">{eyebrow}</p>}
              <h1>
                <span className="cah-l1">{lead}</span>{' '}
                <span className={'cah-l2' + (name.length > 9 ? ' long' : '')}>{name}</span>
              </h1>
              {subhead && <p className="cah-sub">{subhead}</p>}
              {cities.length > 0 && (
                <ul className="cah-chips" aria-label="Cities we serve">
                  {cities.map(c => <li key={c}>{c}</li>)}
                </ul>
              )}
              {seeAlso.map(l => (
                <p key={l.href} className="cah-also"><a href={l.href} onClick={go(nav, l.href)}>{l.label} →</a></p>
              ))}
              <div className="cah-btns">
                {primary && <a className="cah-b1" href={primary.href} onClick={go(nav, primary.href, primary.onClick)}>{primary.label} <Arrow/></a>}
                {secondary && <a className="cah-b2" href={secondary.href} onClick={go(nav, secondary.href, secondary.onClick)}>{secondary.label}</a>}
              </div>
              {note && <p className="cah-note">{note}</p>}
            </div>
          </div>
          <div className="cah-media">
            <img src={art} srcSet={`${art} 1920w, ${art.replace('-1920.', '-3840.')} 3840w`}
              sizes="(max-width: 960px) 100vw, 55vw" width="1920" height="800"
              alt={alt || `Online school in ${name}`} loading="eager" fetchPriority="high" decoding="async"/>
          </div>
        </div>
      </section>
      {valueProp && <div className="cah-vp"><p>{valueProp}</p></div>}
    </>
  )
}
