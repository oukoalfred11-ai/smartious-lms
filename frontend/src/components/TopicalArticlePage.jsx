/* ═══════════════════════════════════════════════════════════════════
   TopicalArticlePage.jsx — Shared renderer for topical cluster pages.
   
   Data-driven from `article` prop (from topicalArticles.js). Renders
   a Malaysia-style long-form landing page: hero + key stats band +
   sectioned body + related links + hub back-link + Final CTA.
   
   Registered by URL slug in LandingPage.jsx. Each article lives at
   its own URL (/online-igcse-malaysia, /ossd-malaysia, etc.), and
   internal links from the country hub's topicalClusterLinks field
   point to these URLs.
   
   Design tokens (V), navigation (nav), Footer, meta helpers are
   passed via props to keep this component decoupled.
   ═══════════════════════════════════════════════════════════════════ */
import React from 'react'

export default function TopicalArticlePage({ article, V, nav, Footer }) {
  if (!article) return null

  return (
    <>
      {/* JSON-LD Article schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.headline,
            description: article.metaDesc,
            author: { '@type': 'Organization', name: 'Smartious Homeschool & eSchool' },
            publisher: { '@type': 'Organization', name: 'Smartious Homeschool & eSchool' },
            about: article.country,
          }),
        }}
      />

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="sec" style={{background:V.ink,color:'#fff',paddingTop:64,paddingBottom:56}}>
        <div className="wrap">
          <div style={{maxWidth:840,margin:'0 auto'}}>
            <a href={article.hubSlug}
              onClick={e => { e.preventDefault(); if (typeof nav === 'function') nav(article.hubSlug) }}
              style={{color:'rgba(255,255,255,.62)',fontSize:12,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6,marginBottom:22}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to {article.hubTitle}
            </a>
            <div style={{fontSize:11,color:V.gold3,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:10}}>
              {article.eyebrow}
            </div>
            <h1 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'clamp(1.9rem,4vw,2.8rem)',lineHeight:1.15,margin:'0 0 18px',color:'#fff',fontWeight:400}}>
              {article.headline}
            </h1>
            <p style={{fontSize:15,color:'rgba(255,255,255,.82)',lineHeight:1.65,margin:0}}>
              {article.subhead}
            </p>
          </div>
        </div>
      </section>

      {/* ── KEY STATS BAND (if provided) ─────────────────────── */}
      {Array.isArray(article.keyStats) && article.keyStats.length > 0 && (
        <section className="sec" style={{background:V.bone,paddingTop:36,paddingBottom:36,borderBottom:`1px solid ${V.bone3}`}}>
          <div className="wrap">
            <div style={{maxWidth:960,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
              {article.keyStats.map((s,i) => (
                <div key={i} style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:8,padding:'16px 18px'}}>
                  <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:22,color:V.cr,lineHeight:1.15,marginBottom:6,fontWeight:400}}>{s.number}</div>
                  <div style={{fontSize:12,color:V.ink,lineHeight:1.5,fontWeight:600}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ARTICLE SECTIONS ────────────────────────────────── */}
      <section className="sec" style={{background:V.white,paddingTop:56,paddingBottom:56}}>
        <div className="wrap">
          <div style={{maxWidth:800,margin:'0 auto'}}>
            {article.sections.map((sec,i) => (
              <div key={i} style={{marginBottom:i === article.sections.length - 1 ? 0 : 44}}>
                <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.7rem',color:V.ink,margin:'0 0 20px',lineHeight:1.25,fontWeight:400}}>
                  {sec.h}
                </h2>
                {sec.ps.map((p,j) => (
                  <p key={j} style={{fontSize:15,color:V.ink,lineHeight:1.75,margin:'0 0 16px'}}>
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RELATED LINKS ───────────────────────────────────── */}
      {Array.isArray(article.relatedLinks) && article.relatedLinks.length > 0 && (
        <section className="sec" style={{background:V.bone,paddingTop:48,paddingBottom:48,borderTop:`1px solid ${V.bone3}`}}>
          <div className="wrap">
            <div style={{maxWidth:800,margin:'0 auto'}}>
              <div style={{fontSize:11,color:V.gold3,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:14}}>
                Related for {article.country} families
              </div>
              <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'1.4rem',color:V.ink,margin:'0 0 22px',lineHeight:1.25,fontWeight:400}}>
                More on the {article.country} homeschool journey
              </h2>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12}}>
                {article.relatedLinks.map((link,i) => (
                  <a key={i} href={link.href}
                    onClick={e => { e.preventDefault(); if (typeof nav === 'function') nav(link.href) }}
                    style={{textDecoration:'none',background:V.white,border:`1px solid ${V.bone3}`,borderRadius:8,padding:'14px 16px',display:'block'}}>
                    <div style={{fontSize:13.5,color:V.ink,fontWeight:600,lineHeight:1.4}}>{link.title} →</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FINAL CTA + HUB BACKLINK ────────────────────────── */}
      <section className="sec" style={{background:V.ink,color:'#fff',paddingTop:60,paddingBottom:60}}>
        <div className="wrap">
          <div style={{maxWidth:720,margin:'0 auto',textAlign:'center'}}>
            <div style={{fontSize:11,color:V.gold3,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:12}}>
              Ready to start?
            </div>
            <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:'clamp(1.5rem,3vw,2rem)',color:'#fff',margin:'0 0 16px',lineHeight:1.25,fontWeight:400}}>
              Request an academic assessment for your child
            </h2>
            <p style={{fontSize:14,color:'rgba(255,255,255,.75)',lineHeight:1.65,margin:'0 0 26px'}}>
              Our Head of Admissions reviews every request within three business days. If accepted, the assessment fee is invoiced before the diagnostic is scheduled.
            </p>
            <button onClick={() => { if (typeof nav === 'function') nav('/assessment') }}
              style={{background:V.gold3,color:V.ink,border:'none',padding:'15px 32px',borderRadius:8,fontSize:14,fontWeight:800,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:8,letterSpacing:'.01em'}}>
              Book assessment
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <div style={{marginTop:22}}>
              <a href={article.hubSlug}
                onClick={e => { e.preventDefault(); if (typeof nav === 'function') nav(article.hubSlug) }}
                style={{color:'rgba(255,255,255,.72)',fontSize:12.5,textDecoration:'underline',textUnderlineOffset:3}}>
                Or read the full {article.hubTitle} guide
              </a>
            </div>
          </div>
        </div>
      </section>

      {Footer && <Footer/>}
    </>
  )
}
