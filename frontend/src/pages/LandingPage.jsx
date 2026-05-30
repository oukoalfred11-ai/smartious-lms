import { useStore } from '../context/ctx.jsx'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'

/* Data — extracted from this file for maintainability. Edit src/data/*.js to update. */
import { COUNTRIES } from '../data/countries.js'
import { CURRICULA } from '../data/curricula.js'
import { SERVICES } from '../data/services.js'
import { FULL_ARTICLES } from '../data/fullArticles.js'


/* ── Front Desk capture ───────────────────────────────────
 * Landing-page forms post here so submissions land in the
 * admin Front Desk module (not just an email inbox). This is
 * best-effort: if it fails, the form's existing email send
 * still runs, so a lead is never lost.
 * Override the backend origin with VITE_API_URL if needed.
 */
const FRONTDESK_API = (import.meta.env?.VITE_API_URL || 'https://smartious-backend.onrender.com')
  .replace(/\/$/, '') + '/api/frontdesk/submit'

async function captureFrontDesk(payload) {
  try {
    await fetch(FRONTDESK_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    // Non-fatal — the email send is the safety net.
    console.error('[front desk capture] failed:', e?.message)
  }
}

/* ── usePageMeta — per-page SEO ────────────────────────────
 * Sets document.title and meta description / OG tags for the
 * current page, so each landing page, curriculum and service
 * page is individually search-friendly. SPA-safe — updates as
 * the user navigates between pages.
 */
function setMetaTag(key, content, attr) {
  if (!content) return
  let el = document.head.querySelector('meta[' + attr + '="' + key + '"]')
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// setCanonical — writes/updates the <link rel="canonical"> tag.
// One per document. SPA-safe: updates on navigation.
function setCanonical(url) {
  if (!url) return
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', url)
}

function usePageMeta(title, description) {
  useEffect(() => {
    if (title) document.title = title
    if (description) {
      setMetaTag('description', description, 'name')
      setMetaTag('og:title', title, 'property')
      setMetaTag('og:description', description, 'property')
      setMetaTag('twitter:title', title, 'name')
      setMetaTag('twitter:description', description, 'name')
    }
    // Canonical + og:url — strip query string and trailing slash
    // so URL variants don't fragment SEO authority.
    try {
      const origin = window.location.origin
      let path = window.location.pathname || '/'
      // Normalise trailing slash (keep root '/')
      if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
      const canonical = origin + path
      setCanonical(canonical)
      setMetaTag('og:url', canonical, 'property')
    } catch {}
  }, [title, description])
}

/* ── useHeroPreload — LCP optimization ─────────────────────
 * Hero video on the home page is the LCP element. Inject a
 * <link rel="preload" as="video" fetchpriority="high"> so
 * the browser starts fetching it in parallel with CSS / JS.
 * We pick the mobile-sized Cloudinary encode for narrow
 * viewports and the full-size one elsewhere.
 */
function useHeroPreload(active) {
  useEffect(() => {
    if (!active) return
    const linkId = 'sm-hero-preload'
    if (document.getElementById(linkId)) return
    const link = document.createElement('link')
    link.id = linkId
    link.rel = 'preload'
    link.as = 'video'
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
    link.href = isMobile
      ? 'https://res.cloudinary.com/dae99gz1m/video/upload/f_auto,q_auto,vc_auto,w_1080,h_1920,c_fill,g_auto/hero_mhhwhf.mp4'
      : 'https://res.cloudinary.com/dae99gz1m/video/upload/f_auto,q_auto,vc_auto,w_1920,c_limit/hero_mhhwhf.mp4'
    link.setAttribute('type', 'video/mp4')
    link.setAttribute('fetchpriority', 'high')
    document.head.appendChild(link)
    return () => {
      const el = document.getElementById(linkId)
      if (el) el.remove()
    }
  }, [active])
}


/* ── CSS variables matching smartious-global.html exactly ── */
const V = {
  cr:'#8B1A2E', cr2:'#A8203A', gold:'#B8960C', gold2:'#D4AF37', gold3:'#F0CC5A',
  bone:'#F7F3ED', bone2:'#EDE7DC', bone3:'#DDD5C6',
  ink:'#0A0806', ink2:'#1A1510', ink3:'#2D261E',
  sl:'#6B5E52', sl2:'#8A7B6E', sl3:'#ADA094', white:'#FEFDFB',
}

const styles = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  .lp{font-family:'Syne',sans-serif;background:${V.bone};color:${V.ink};overflow-x:hidden;line-height:1.6}
  .lp a{color:inherit;text-decoration:none}
  .lp button{font-family:'Syne',sans-serif;cursor:pointer;border:none;background:none;outline:none}
  .lp ::-webkit-scrollbar{width:4px}
  .lp ::-webkit-scrollbar-thumb{background:${V.cr};border-radius:2px}
  /* SCROLL REVEAL ANIMATIONS */
  .lp .reveal{opacity:0;transform:translateY(28px);transition:opacity .7s cubic-bezier(.23,1,.32,1),transform .7s cubic-bezier(.23,1,.32,1)}
  .lp .reveal.visible{opacity:1;transform:none}
  .lp .reveal.delay-1{transition-delay:.1s}
  .lp .reveal.delay-2{transition-delay:.2s}
  .lp .reveal.delay-3{transition-delay:.3s}
  .lp .reveal.delay-4{transition-delay:.4s}
  .lp .reveal.delay-5{transition-delay:.5s}
  /* SHARED */
  .lp .sec{padding:96px 0}
  .lp .wrap{max-width:1440px;margin:0 auto;padding:0 48px}
  .lp .eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:'Syne Mono',monospace;font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:${V.gold2};margin-bottom:14px}
  .lp .eyebrow::before{content:'';width:24px;height:1px;background:${V.gold2};flex-shrink:0}
  .lp .display{font-family:'Playfair Display',serif;font-size:clamp(2.4rem,4vw,4rem);font-weight:700;line-height:1.08;letter-spacing:-.03em;color:${V.ink}}
  .lp .display em{color:${V.cr};font-style:italic}
  .lp .lead{font-size:17px;color:${V.sl};line-height:1.8;max-width:520px}
  .lp .sec-hd{margin-bottom:60px}
  .lp .btn-p{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:6px;font-size:13.5px;font-weight:700;background:${V.cr};color:${V.white};box-shadow:0 4px 14px rgba(139,26,46,.3);transition:all .2s;cursor:pointer;border:none;font-family:'Syne',sans-serif}
  .lp .btn-p:hover{background:${V.cr2};transform:translateY(-2px)}
  .lp .btn-o{display:inline-flex;align-items:center;gap:8px;padding:14px 26px;border-radius:6px;font-size:13.5px;font-weight:700;background:transparent;color:${V.ink};border:1.5px solid ${V.bone3};transition:all .2s;cursor:pointer;font-family:'Syne',sans-serif}
  .lp .btn-o:hover{border-color:${V.cr};color:${V.cr}}
  .lp .btn-o.lt{color:${V.white};border-color:rgba(255,255,255,.22)}
  .lp .btn-o.lt:hover{border-color:${V.gold3};color:${V.gold3}}
  .lp .chip{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:.06em;background:rgba(139,26,46,.08);color:${V.cr};border:1px solid rgba(139,26,46,.15)}
  /* NAV */
  .lp .lp-header{position:fixed;top:0;left:0;right:0;z-index:800;transition:box-shadow .3s}
  .lp nav{background:rgba(10,8,6,.96);border-bottom:1px solid rgba(184,150,12,.12);backdrop-filter:blur(24px)}
  .lp .lp-header.scrolled{box-shadow:0 4px 30px rgba(0,0,0,.5)}
  .lp .lp-header.scrolled #topbar{display:none}
  .lp #hero{padding-top:36px}
  .lp .nav-wrap{max-width:1440px;margin:0 auto;padding:0 48px;height:64px;display:flex;align-items:center;gap:0}
  .lp .logo-lockup{display:flex;align-items:center;gap:13px;cursor:pointer;flex-shrink:0}
  .lp .logo-emblem{width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,${V.cr},${V.cr2});display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(139,26,46,.4)}
  .lp .logo-name{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:${V.white}}
  .lp .logo-name em{color:${V.gold3};font-style:italic}
  .lp .logo-tag{font-size:8px;font-weight:600;letter-spacing:.14em;color:rgba(247,243,237,.28);text-transform:uppercase;margin-top:-2px}
  .lp .nav-links{display:flex;align-items:center;margin-left:40px;gap:0;flex:1}
  .lp .nl{position:relative;padding:8px 12px;font-size:12.5px;font-weight:600;letter-spacing:.02em;color:rgba(247,243,237,.5);cursor:pointer;transition:color .2s;white-space:nowrap}
  .lp .nl:hover{color:${V.white}}.lp .nl.on{color:${V.white}}
  .lp .nl.on::after{content:'';position:absolute;bottom:-1px;left:12px;right:12px;height:1.5px;background:${V.gold3};border-radius:2px}
  .lp .nav-actions{display:flex;align-items:center;gap:10px;margin-left:auto}

  .lp .nav-login{display:flex;align-items:center;gap:7px;padding:8px 16px;border-radius:6px;font-size:12.5px;font-weight:600;color:rgba(247,243,237,.55);border:1px solid rgba(247,243,237,.12);transition:all .2s;cursor:pointer;background:none;font-family:'Syne',sans-serif}
  .lp .nav-login:hover{color:${V.white};border-color:rgba(247,243,237,.28)}
  .lp .nav-cta{display:flex;align-items:center;gap:7px;padding:9px 20px;border-radius:6px;font-size:12.5px;font-weight:700;background:${V.cr};color:${V.white};box-shadow:0 4px 14px rgba(139,26,46,.35);transition:all .2s;cursor:pointer;font-family:'Syne',sans-serif}
  .lp .nav-cta:hover{background:${V.cr2};transform:translateY(-1px)}
  /* HERO */
  .lp #hero{position:relative;min-height:calc(100vh - 64px);background:${V.ink};display:flex;flex-direction:column;overflow:hidden}
  .lp .h-bg{position:absolute;inset:0;z-index:1;width:100%;height:100%;object-fit:cover;object-position:center 35%;filter:brightness(1.32) saturate(1.15) contrast(1.04);pointer-events:none;background:${V.ink}}
  .lp .h-ov{position:absolute;inset:0;z-index:2;background:linear-gradient(110deg,rgba(10,8,6,.55) 0%,rgba(20,10,8,.35) 38%,rgba(60,14,24,.22) 62%,rgba(10,8,6,.4) 100%)}
  .lp .h-vig{position:absolute;bottom:0;left:0;right:0;z-index:2;height:280px;background:linear-gradient(to top,${V.bone} 0%,transparent 100%)}
  .lp .h-body{position:relative;z-index:3;flex:1;display:flex;flex-direction:column;justify-content:center;max-width:1440px;margin:0 auto;padding:80px 48px 60px;width:100%}
  .lp .h1{font-family:'Playfair Display',serif;font-size:clamp(3.5rem,7.5vw,7rem);font-weight:900;line-height:.98;letter-spacing:-.04em;color:${V.white};margin-bottom:28px;text-shadow:0 4px 24px rgba(10,8,6,.4)}
  .lp .h1 em{color:transparent;-webkit-text-stroke:1.5px ${V.gold3};font-style:italic}
  .lp .h1 span{display:block}
  .lp .h-sub{font-size:17px;color:rgba(247,243,237,.85);max-width:520px;line-height:1.8;margin-bottom:44px;text-shadow:0 2px 12px rgba(10,8,6,.5)}
  .lp .h-act{display:flex;gap:12px;flex-wrap:wrap}
  .lp .h-stats{position:absolute;right:48px;top:50%;transform:translateY(-50%);z-index:3;display:flex;flex-direction:column;gap:12px}
  .lp .hs{background:rgba(10,8,6,.55);border:1px solid rgba(184,150,12,.22);border-radius:10px;padding:14px 16px;backdrop-filter:blur(16px);min-width:140px;max-width:210px;position:relative;overflow:hidden}
  .lp .hs::before{content:'';position:absolute;top:0;left:0;right:0;height:1.5px;background:linear-gradient(90deg,${V.gold3},transparent)}
  .lp .hs-n{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;color:${V.white};line-height:1.2;word-break:break-word;white-space:normal}
  .lp .hs-n em{color:${V.gold3};font-style:normal}
  .lp .hs-l{font-size:10.5px;color:rgba(247,243,237,.65);margin-top:5px;letter-spacing:.04em;line-height:1.4}
  /* MOBILE HERO STATS — hidden by default, shown on mobile */
  .lp .h-mob-stats{display:none;grid-template-columns:1fr 1fr;gap:10px;margin-top:36px;max-width:340px}
  .lp .hms{background:rgba(10,8,6,.55);border:1px solid rgba(184,150,12,.22);border-radius:10px;padding:14px 16px;position:relative;overflow:hidden;backdrop-filter:blur(10px)}
  .lp .hms::before{content:'';position:absolute;top:0;left:0;right:0;height:1.5px;background:linear-gradient(90deg,${V.gold3},transparent)}
  .lp .hms-n{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700;color:${V.white};line-height:1}
  .lp .hms-n em{color:${V.gold3};font-style:normal}
  .lp .hms-l{font-size:10px;color:rgba(247,243,237,.68);margin-top:4px;letter-spacing:.04em}
  /* MOBILE HERO STATS STRIP — sits directly below the hero on phones */
  .lp .h-stats-strip{display:none;background:${V.ink};padding:28px 20px 32px;border-bottom:1px solid rgba(184,150,12,.18);border-top:1px solid rgba(184,150,12,.12)}
  .lp .h-stats-strip-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:480px;margin:0 auto}
  /* KENYA COUNTRY PAGE — responsive rules for new rich sections */
  @media(max-width:900px){
    .lp .kenya-centre-grid{grid-template-columns:1fr!important;gap:28px!important}
    .lp .kenya-uni-grid{grid-template-columns:1fr!important}
    .lp .kenya-video-grid{grid-template-columns:1fr!important;gap:28px!important;text-align:center}
    .lp .kenya-video-grid .eyebrow{justify-content:center}
    .lp .kenya-cmp-head{display:none!important}
    .lp .kenya-cmp-row{grid-template-columns:1fr!important;padding:8px 0!important}
    .lp .kenya-cmp-row > div:nth-child(1){background:${V.ink}!important;color:#fff!important;padding:8px 14px!important;font-size:12px!important}
    .lp .kenya-cmp-row > div:nth-child(2){padding:10px 14px 4px!important}
    .lp .kenya-cmp-row > div:nth-child(2)::before{content:'Traditional school: ';font-weight:700;color:${V.sl3};font-size:11px;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:3px}
    .lp .kenya-cmp-row > div:nth-child(3){padding:6px 14px 14px!important}
    .lp .kenya-cmp-row > div:nth-child(3)::before{content:'Smartious: ';font-weight:700;color:${V.cr};font-size:11px;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:3px}
  }
  /* FLOATING ASSISTANCE + WHATSAPP */
  .lp .fab-stack{position:fixed;right:20px;bottom:20px;z-index:9998;display:flex;flex-direction:column;gap:12px;align-items:flex-end;pointer-events:none}
  .lp .fab-stack > *{pointer-events:auto}
  .lp .fab-wa{display:flex;align-items:center;gap:10px;background:#25D366;color:#fff;border:none;border-radius:50px;padding:13px 18px 13px 15px;font-size:13.5px;font-weight:700;cursor:pointer;box-shadow:0 10px 30px rgba(37,211,102,.45),0 4px 10px rgba(37,211,102,.35);transition:all .25s;font-family:'Syne',sans-serif;text-decoration:none}
  .lp .fab-wa:hover{background:#1FB855;transform:translateY(-2px) scale(1.02);box-shadow:0 14px 40px rgba(37,211,102,.55),0 6px 14px rgba(37,211,102,.4)}
  .lp .fab-wa-ic{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;flex-shrink:0;animation:lp-pulse 2.4s ease-in-out infinite}
  .lp .fab-help{display:flex;align-items:center;gap:10px;background:${V.cr};color:#fff;border:none;border-radius:50px;padding:13px 18px 13px 15px;font-size:13.5px;font-weight:700;cursor:pointer;box-shadow:0 10px 30px rgba(139,26,46,.45),0 4px 10px rgba(139,26,46,.35);transition:all .25s;font-family:'Syne',sans-serif}
  .lp .fab-help:hover{background:${V.cr2};transform:translateY(-2px) scale(1.02);box-shadow:0 14px 40px rgba(139,26,46,.55),0 6px 14px rgba(139,26,46,.4)}
  .lp .fab-help-ic{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .lp .fab-help-ic::after{content:'';position:absolute;width:10px;height:10px;border-radius:50%;background:#F0CC5A;top:8px;right:8px;box-shadow:0 0 0 2px ${V.cr};animation:lp-pulse 1.8s ease-in-out infinite}
  .lp .fab-help{position:relative}
  /* Assistance popup panel */
  .lp .fab-panel{position:fixed;right:20px;bottom:92px;width:340px;max-width:calc(100vw - 40px);background:${V.white};border-radius:18px;box-shadow:0 24px 60px rgba(10,8,6,.28),0 6px 18px rgba(10,8,6,.12);z-index:9999;overflow:hidden;border:1px solid ${V.bone3};animation:lp-fadeUp .25s cubic-bezier(.23,1,.32,1);font-family:'Syne',sans-serif}
  .lp .fab-panel-hd{background:linear-gradient(135deg,${V.cr},${V.cr2});padding:20px 22px;color:#fff;position:relative}
  .lp .fab-panel-hd-row{display:flex;align-items:center;gap:12px}
  .lp .fab-panel-av{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.18);border:2px solid rgba(240,204,90,.6);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Playfair Display',serif;font-weight:700;font-size:17px;color:${V.gold3}}
  .lp .fab-panel-ti{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;line-height:1.2}
  .lp .fab-panel-sb{font-size:11.5px;color:rgba(255,255,255,.75);margin-top:2px;display:flex;align-items:center;gap:5px}
  .lp .fab-panel-dot{width:7px;height:7px;border-radius:50%;background:#4ADE80;box-shadow:0 0 0 2px rgba(74,222,128,.3)}
  .lp .fab-panel-cl{position:absolute;top:14px;right:14px;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;transition:background .2s}
  .lp .fab-panel-cl:hover{background:rgba(255,255,255,.28)}
  .lp .fab-panel-body{padding:22px}
  .lp .fab-panel-msg{background:${V.bone};border:1px solid ${V.bone3};border-radius:12px;padding:14px 16px;font-size:13.5px;color:${V.ink2};line-height:1.6;margin-bottom:16px}
  .lp .fab-panel-msg strong{color:${V.cr}}
  .lp .fab-opts{display:flex;flex-direction:column;gap:8px;margin-bottom:14px}
  .lp .fab-opt{display:flex;align-items:center;gap:11px;width:100%;padding:11px 14px;background:${V.white};border:1px solid ${V.bone3};border-radius:10px;cursor:pointer;transition:all .2s;text-align:left;font-family:'Syne',sans-serif;color:${V.ink2};font-size:13px;font-weight:600}
  .lp .fab-opt:hover{border-color:${V.cr};background:rgba(139,26,46,.04);transform:translateX(2px)}
  .lp .fab-opt-ic{width:30px;height:30px;border-radius:8px;background:rgba(139,26,46,.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:${V.cr}}
  .lp .fab-panel-ft{padding:12px 22px 16px;background:${V.bone};border-top:1px solid ${V.bone3};font-size:11px;color:${V.sl2};text-align:center;line-height:1.6}
  .lp .fab-panel-ft strong{color:${V.ink2}}
  @media(max-width:480px){
    .lp .fab-wa span.fab-lbl,.lp .fab-help span.fab-lbl{display:none}
    .lp .fab-wa,.lp .fab-help{padding:13px 14px}
    .lp .fab-stack{right:14px;bottom:14px;gap:10px}
    .lp .fab-panel{right:14px;bottom:86px;width:calc(100vw - 28px)}
  }
  /* TOPBAR MARQUEE — why us */
  .lp .topbar-marq{display:flex;overflow:hidden;width:100%}
  .lp .topbar-marq-in{display:flex;white-space:nowrap;animation:lp-topbar-marq 60s linear infinite;gap:0}
  .lp .topbar-mi{display:inline-flex;align-items:center;gap:10px;padding:0 28px;font-size:11.5px;font-weight:500;letter-spacing:.04em;color:'rgba(247,243,237,.72)';color:rgba(247,243,237,.72);flex-shrink:0;border-right:1px solid rgba(184,150,12,.12)}
  /* MARQUEE */
  .lp .marq{background:${V.cr};padding:13px 0;overflow:hidden;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)}
  .lp .marq-in{display:flex;white-space:nowrap;animation:lp-marq 30s linear infinite}
  .lp .mi{display:inline-flex;align-items:center;gap:16px;padding:0 32px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(247,243,237,.75);flex-shrink:0}
  .lp .md{width:3px;height:3px;border-radius:50%;background:${V.gold3}}
  /* HIGHLIGHTS */
  .lp .hl-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:${V.bone3};border-radius:16px;overflow:hidden}
  .lp .hl{background:${V.white};padding:36px 28px;cursor:pointer;transition:all .25s;display:flex;flex-direction:column}
  .lp .hl:hover{background:${V.ink}}
  .lp .hl:hover .hl-n,.lp .hl:hover .hl-h{color:${V.white}}
  .lp .hl:hover .hl-p{color:rgba(247,243,237,.44)}
  .lp .hl:hover .hl-ico{border-color:rgba(184,150,12,.3);background:rgba(139,26,46,.18)}
  .lp .hl:hover .hl-ico svg{stroke:${V.gold3}}
  .lp .hl-ico{width:44px;height:44px;border-radius:6px;background:rgba(139,26,46,.07);border:1px solid rgba(139,26,46,.1);display:flex;align-items:center;justify-content:center;margin-bottom:22px;transition:all .25s}
  .lp .hl-n{font-family:'Playfair Display',serif;font-size:2.4rem;font-weight:700;color:${V.ink};line-height:1;transition:color .25s}
  .lp .hl-h{font-size:12px;font-weight:700;color:${V.ink};margin-top:6px;letter-spacing:.03em;transition:color .25s}
  .lp .hl-p{font-size:12px;color:${V.sl2};line-height:1.6;margin-top:4px;transition:color .25s}
  /* TESTIMONIALS */
  .lp .tgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:60px}
  .lp .tc{background:${V.bone};border-radius:24px;padding:32px;border:1px solid ${V.bone3};transition:all .28s;display:flex;flex-direction:column}
  .lp .tc:hover{background:${V.white};box-shadow:0 12px 40px rgba(10,8,6,.14);border-color:transparent;transform:translateY(-4px)}
  .lp .t-stars{display:flex;gap:2px;margin-bottom:16px}
  .lp .t-s{width:13px;height:13px;fill:${V.gold2}}
  .lp .t-q{font-family:'Playfair Display',serif;font-style:italic;font-size:1.05rem;color:${V.ink2};line-height:1.75;flex:1;margin-bottom:24px}
  .lp .t-au{display:flex;align-items:center;gap:12px;margin-top:auto}
  .lp .t-av{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:${V.white};flex-shrink:0}
  .lp .t-nm{font-size:13.5px;font-weight:700;color:${V.ink}}
  .lp .t-rl{font-size:11.5px;color:${V.sl2};margin-top:1px}
  /* CTA BAND */
  .lp .cta-band{background:${V.ink};padding:96px 0;position:relative;overflow:hidden;text-align:center}
  .lp .cta-band::before{content:'';position:absolute;top:-40%;left:-10%;width:60%;height:200%;border-radius:50%;background:radial-gradient(ellipse,rgba(139,26,46,.18) 0%,transparent 70%)}
  .lp .cta-in{position:relative;z-index:1;max-width:760px;margin:0 auto;padding:0 48px}
  .lp .cta-h{font-family:'Playfair Display',serif;font-size:clamp(2.4rem,5vw,4rem);font-weight:700;color:${V.white};line-height:1.1;letter-spacing:-.02em;margin-bottom:18px}
  .lp .cta-h em{color:${V.gold3};font-style:italic}
  .lp .cta-sub{font-size:17px;color:rgba(247,243,237,.48);line-height:1.75;margin-bottom:40px}
  .lp .cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  /* PAGE HERO */
  .lp .pg-hero{background:${V.ink};padding:80px 0 60px;border-bottom:1px solid rgba(255,255,255,.06)}
  .lp .pg-h{font-family:'Playfair Display',serif;font-size:clamp(2.8rem,5vw,4.5rem);font-weight:700;color:${V.white};line-height:1.05;letter-spacing:-.03em;margin-bottom:14px}
  .lp .pg-h em{color:${V.gold3};font-style:italic}
  .lp .pg-sub{font-size:17px;color:rgba(247,243,237,.5);max-width:560px;line-height:1.75}
  /* STATS */
  .lp .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:${V.bone3};border-radius:16px;overflow:hidden;margin-top:60px}
  .lp .sg{background:${V.white};padding:36px 28px;text-align:center;position:relative;transition:background .25s}
  .lp .sg::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${V.cr},${V.gold2});opacity:0;transition:.3s}
  .lp .sg:hover::before{opacity:1}.lp .sg:hover{background:${V.bone}}
  .lp .sg-n{font-family:'Playfair Display',serif;font-size:3rem;font-weight:700;color:${V.ink};line-height:1}
  .lp .sg-n em{color:${V.cr};font-style:normal}
  .lp .sg-l{font-size:12px;color:${V.sl2};margin-top:8px;font-weight:500;letter-spacing:.05em;line-height:1.5}
  /* PROCESS */
  .lp .proc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:${V.bone3};border-radius:16px;overflow:hidden;margin-top:60px}
  .lp .ps{background:${V.white};padding:36px 26px;position:relative;transition:background .25s}
  .lp .ps:hover{background:${V.bone}}
  .lp .ps-n{font-family:'Syne Mono',monospace;font-size:10.5px;color:${V.sl3};letter-spacing:.12em;margin-bottom:14px}
  .lp .ps-ico{width:40px;height:40px;border-radius:6px;background:rgba(139,26,46,.07);border:1px solid rgba(139,26,46,.1);display:flex;align-items:center;justify-content:center;margin-bottom:14px}
  .lp .ps-h{font-family:'Playfair Display',serif;font-size:1.15rem;font-weight:700;color:${V.ink};margin-bottom:8px}
  .lp .ps-p{font-size:13px;color:${V.sl};line-height:1.72}
  .lp .ps-arr{position:absolute;top:36px;right:-11px;width:22px;height:22px;background:${V.cr};border-radius:50%;display:flex;align-items:center;justify-content:center;z-index:2}
  .lp .ps:last-child .ps-arr{display:none}
  /* CURRICULA */
  .lp .cur-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:60px}
  /* ── Meet Our Team grid ── */
  .lp .team-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:48px}
  .lp .tm-card{background:${V.white};border:1px solid ${V.bone3};border-radius:18px;overflow:hidden;cursor:pointer;transition:transform .25s,box-shadow .25s,border-color .25s;display:flex;flex-direction:column;position:relative}
  .lp .tm-card:hover{transform:translateY(-4px);box-shadow:0 14px 38px rgba(10,8,6,.14);border-color:transparent}
  .lp .tm-open{grid-column:1/-1}
  .lp .tm-photo{position:relative;width:100%;aspect-ratio:1/1;background:linear-gradient(135deg,${V.cr},${V.cr2});overflow:hidden;flex-shrink:0}
  .lp .tm-open .tm-photo{aspect-ratio:auto;height:240px;max-width:240px}
  .lp .tm-img{width:100%;height:100%;object-fit:cover;display:block}
  .lp .tm-initials{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:3.4rem;font-weight:700;color:${V.gold3}}
  .lp .tm-scrim{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 55%,rgba(10,8,6,.55));pointer-events:none}
  .lp .tm-plate{padding:14px 16px 8px;text-align:center}
  .lp .tm-name{font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:${V.ink};line-height:1.25}
  .lp .tm-role{font-size:11.5px;color:${V.gold};font-weight:700;letter-spacing:.04em;margin-top:3px}
  .lp .tm-hint{padding:0 16px 14px;text-align:center;font-size:10.5px;color:${V.sl3};font-weight:600;letter-spacing:.05em;text-transform:uppercase}
  .lp .tm-detail{padding:4px 22px 18px;text-align:left}
  .lp .tm-open{flex-direction:row;flex-wrap:wrap;align-items:flex-start}
  .lp .tm-open .tm-plate{flex:0 0 240px;text-align:left;padding-left:0;padding-right:0}
  .lp .tm-open .tm-detail{flex:1;min-width:280px}
  .lp .tm-open .tm-hint{position:absolute;top:14px;right:18px;padding:0}
  .lp .tm-exp{display:inline-block;background:rgba(184,150,12,.12);color:${V.gold};font-size:12px;font-weight:700;padding:5px 12px;border-radius:20px;margin-bottom:12px}
  .lp .tm-exp strong{font-size:14px}
  .lp .tm-bio{font-size:13.5px;color:${V.sl};line-height:1.75;margin:0 0 14px}
  .lp .tm-block{margin-bottom:12px}
  .lp .tm-lbl{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${V.sl3};margin-bottom:6px}
  .lp .tm-chips{display:flex;flex-wrap:wrap;gap:6px}
  .lp .tm-chip{background:${V.bone};border:1px solid ${V.bone3};border-radius:20px;padding:4px 11px;font-size:11.5px;font-weight:600;color:${V.ink2}}
  .lp .tm-list{margin:0;padding-left:18px}
  .lp .tm-list li{font-size:12.5px;color:${V.sl};line-height:1.7}
  .lp .cc{background:${V.white};border:1px solid ${V.bone3};border-radius:24px;overflow:hidden;transition:all .3s;display:flex;flex-direction:column}
  .lp .cc:hover{transform:translateY(-5px);box-shadow:0 12px 40px rgba(10,8,6,.14);border-color:transparent}
  .lp .cc-top{padding:24px 24px 0}
  .lp .cc-bar{height:3px;background:linear-gradient(90deg,${V.cr},${V.gold2});border-radius:2px;margin-bottom:18px}
  .lp .cc-badge{display:inline-flex;align-items:center;padding:3px 11px;border-radius:99px;font-size:10.5px;font-weight:700;color:${V.cr};margin-bottom:11px;background:rgba(139,26,46,.07);border:1px solid rgba(139,26,46,.12)}
  .lp .cc-h{font-family:'Playfair Display',serif;font-size:1.35rem;font-weight:700;color:${V.ink};margin-bottom:9px}
  .lp .cc-desc{font-size:13px;color:${V.sl};line-height:1.72;margin-bottom:14px}
  .lp .cc-body{padding:0 24px 22px;flex:1;display:flex;flex-direction:column;justify-content:flex-end}
  .lp .cc-tags{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px}
  .lp .cc-tag{background:${V.bone2};border-radius:4px;padding:2px 9px;font-size:11px;font-weight:600;color:${V.sl}}
  .lp .cc-meta{display:flex;gap:12px;font-size:11px;color:${V.sl3};padding-top:12px;border-top:1px solid ${V.bone3};flex-wrap:wrap}
  .lp .cc-hl{background:linear-gradient(135deg,rgba(184,150,12,.05),${V.bone});border-color:rgba(184,150,12,.2)}
  /* SERVICES */
  .lp .svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:rgba(255,255,255,.04);border-radius:24px;overflow:hidden;margin-top:60px}
  .lp .sc{background:${V.ink2};padding:42px 30px;transition:background .25s;display:flex;flex-direction:column}
  .lp .sc:hover{background:rgba(139,26,46,.065)}
  .lp .sc-ico{width:50px;height:50px;border-radius:10px;background:rgba(139,26,46,.13);border:1px solid rgba(139,26,46,.2);display:flex;align-items:center;justify-content:center;margin-bottom:20px}
  .lp .sc-h{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;color:${V.white};margin-bottom:10px}
  .lp .sc-p{font-size:13px;color:rgba(247,243,237,.44);line-height:1.78;flex:1;margin-bottom:16px}
  .lp .sc-tags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:16px}
  .lp .sc-tag{background:rgba(255,255,255,.05);border-radius:4px;padding:2px 8px;font-size:10.5px;font-weight:600;color:rgba(247,243,237,.38)}
  .lp .sc-lnk{font-size:12.5px;font-weight:700;color:${V.gold3};display:inline-flex;align-items:center;gap:5px;transition:gap .2s;margin-top:auto;cursor:pointer}
  .lp .sc:hover .sc-lnk{gap:10px}
  /* PRICING */
  .lp .p-tabs{display:flex;background:${V.bone2};border:1px solid ${V.bone3};border-radius:6px;padding:4px;width:fit-content;margin-bottom:44px;flex-wrap:wrap}
  .lp .ptab{padding:9px 22px;border-radius:7px;font-size:13px;font-weight:700;color:${V.sl};cursor:pointer;transition:all .2s;border:none;background:transparent;font-family:'Syne',sans-serif}
  .lp .ptab.on{background:${V.white};color:${V.cr};box-shadow:0 4px 16px rgba(10,8,6,.10)}
  .lp .ppanel{display:none}.lp .ppanel.on{display:block}
  .lp .price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .lp .pc{background:${V.white};border:1px solid ${V.bone3};border-radius:20px;padding:32px;position:relative;transition:all .28s}
  .lp .pc:hover{box-shadow:0 12px 40px rgba(10,8,6,.14);transform:translateY(-3px)}
  .lp .pc.ft{border-color:${V.gold2};background:linear-gradient(135deg,${V.ink} 0%,${V.ink2} 100%)}
  .lp .pbadge{background:linear-gradient(90deg,${V.gold},${V.gold2});color:${V.ink};font-size:10px;font-weight:700;padding:3px 12px;border-radius:99px;letter-spacing:.06em;display:inline-block;margin-bottom:14px}
  .lp .p-lbl{font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${V.sl3};margin-bottom:6px}
  .lp .pc.ft .p-lbl{color:rgba(247,243,237,.35)}
  .lp .p-ti{font-family:'Playfair Display',serif;font-size:1.35rem;font-weight:700;color:${V.ink};margin-bottom:10px}
  .lp .pc.ft .p-ti{color:${V.white}}
  .lp .p-am{font-family:'Playfair Display',serif;font-size:3.2rem;font-weight:700;color:${V.cr};line-height:1}
  .lp .pc.ft .p-am{color:${V.gold3}}
  .lp .p-am sup{font-size:1.4rem;vertical-align:super}
  .lp .p-pr{font-size:12.5px;color:${V.sl2};margin-bottom:22px}
  .lp .pc.ft .p-pr{color:rgba(247,243,237,.38)}
  .lp .p-fs{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:28px}
  .lp .p-f{display:flex;align-items:flex-start;gap:10px;font-size:13.5px;color:${V.sl}}
  .lp .pc.ft .p-f{color:rgba(247,243,237,.6)}
  .lp .p-ck{width:18px;height:18px;border-radius:50%;background:rgba(139,26,46,.07);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
  .lp .pc.ft .p-ck{background:rgba(184,150,12,.15)}
  .lp .p-btn{display:block;width:100%;padding:13px;border-radius:6px;font-weight:700;font-size:13.5px;cursor:pointer;text-align:center;font-family:'Syne',sans-serif;transition:all .2s;border:none}
  .lp .p-ol{background:transparent;color:${V.cr};border:1.5px solid ${V.cr}}
  .lp .p-ol:hover{background:${V.cr};color:${V.white}}
  .lp .p-gd{background:linear-gradient(90deg,${V.gold},${V.gold2});color:${V.ink}}
  .lp .p-gd:hover{transform:translateY(-2px);box-shadow:0 4px 14px rgba(184,150,12,.3)}
  /* GLOBAL */
  .lp .map-c{position:relative}
  .lp .cp-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:24px}
  .lp .cp{background:${V.white};border:1px solid ${V.bone3};border-radius:6px;padding:6px 16px;font-size:12px;font-weight:700;color:${V.sl};cursor:pointer;transition:all .2s;font-family:'Syne',sans-serif}
  .lp .cp:hover{background:${V.cr};color:${V.white};border-color:${V.cr}}
  /* FAQ */
  .lp .faq-list{display:flex;flex-direction:column;gap:8px;margin-top:60px}
  .lp .fqi{background:${V.white};border:1px solid ${V.bone3};border-radius:16px;overflow:hidden}
  .lp .fqq{padding:20px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;cursor:pointer;font-weight:700;font-size:14.5px;color:${V.ink};transition:background .2s;border:none;background:transparent;width:100%;text-align:left;font-family:'Syne',sans-serif}
  .lp .fqq:hover{background:${V.bone}}
  .lp .fqi-ico{width:24px;height:24px;border-radius:50%;background:rgba(139,26,46,.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;color:${V.cr};transition:transform .3s,background .3s;line-height:1}
  .lp .fqi.open .fqi-ico{transform:rotate(45deg);background:${V.cr};color:${V.white}}
  .lp .fqa{max-height:0;overflow:hidden;transition:max-height .4s ease}
  .lp .fqa-in{padding:0 24px 20px;font-size:13.5px;color:${V.sl};line-height:1.78}
  .lp .fqi.open .fqa{max-height:400px}
  /* BLOG */
  .lp .bf-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:36px}
  .lp .bf{padding:7px 18px;border-radius:99px;font-size:12.5px;font-weight:700;color:${V.sl};cursor:pointer;border:1.5px solid ${V.bone3};background:${V.white};transition:all .2s;font-family:'Syne',sans-serif}
  .lp .bf:hover{border-color:${V.cr};color:${V.cr}}.lp .bf.on{background:${V.cr};color:${V.white};border-color:${V.cr}}
  .lp .bfc{background:${V.ink2};border-radius:24px;overflow:hidden;margin-bottom:24px;cursor:pointer;display:grid;grid-template-columns:1fr 1.3fr;transition:all .3s;border:1px solid rgba(255,255,255,.05)}
  .lp .bfc:hover{box-shadow:0 32px 80px rgba(10,8,6,.20);transform:translateY(-4px)}
  .lp .bfc-l{background:linear-gradient(135deg,#1A0509,#4A1020);min-height:280px;display:flex;align-items:center;justify-content:center;position:relative;padding:28px;overflow:hidden}
  .lp .bfc-badge{position:absolute;top:18px;left:18px;background:${V.cr};color:${V.white};font-size:10px;font-weight:700;padding:4px 12px;border-radius:99px;letter-spacing:.07em;text-transform:uppercase}
  .lp .bfc-r{padding:40px;display:flex;flex-direction:column;justify-content:center}
  .lp .bfc-date{font-size:11px;color:rgba(247,243,237,.35);margin-bottom:12px;font-weight:500;letter-spacing:.05em}
  .lp .bfc-h{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700;color:${V.white};line-height:1.25;margin-bottom:14px}
  .lp .bfc-p{font-size:14px;color:rgba(247,243,237,.5);line-height:1.75;margin-bottom:24px}
  .lp .bfc-au{display:flex;align-items:center;gap:12px}
  .lp .bfc-av{width:36px;height:36px;border-radius:50%;background:${V.cr};display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:700;color:${V.white}}
  .lp .bfc-an{font-size:13px;font-weight:700;color:${V.white}}
  .lp .bfc-ar{font-size:11px;color:rgba(247,243,237,.4)}
  .lp .blog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .lp .bc{background:${V.white};border-radius:24px;overflow:hidden;border:1px solid ${V.bone3};transition:all .28s;display:flex;flex-direction:column;cursor:pointer}
  .lp .bc:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(10,8,6,.14);border-color:transparent}
  .lp .bc-img{width:100%;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;flex-shrink:0}
  /* Premium splash image — the photo itself */
  .lp .bc-splash{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s cubic-bezier(.2,.6,.3,1),filter .4s ease}
  .lp .bc:hover .bc-splash{transform:scale(1.06);filter:saturate(1.15) brightness(1.03)}
  /* Gradient scrim that guarantees category pill readability on any image */
  .lp .bc-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,8,6,.15) 0%,rgba(10,8,6,.0) 40%,rgba(10,8,6,.55) 100%);pointer-events:none;transition:opacity .3s ease}
  .lp .bc:hover .bc-scrim{opacity:.85}
  /* Crimson accent wash on hover for premium feel */
  .lp .bc-wash{position:absolute;inset:0;background:linear-gradient(135deg,rgba(139,26,46,.0) 0%,rgba(139,26,46,.25) 100%);opacity:0;transition:opacity .3s ease;pointer-events:none;mix-blend-mode:multiply}
  .lp .bc:hover .bc-wash{opacity:1}
  /* Featured card splash rules */
  .lp .bfc-splash{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.85;transition:transform .6s cubic-bezier(.2,.6,.3,1),opacity .4s ease}
  .lp .bfc:hover .bfc-splash{transform:scale(1.04);opacity:.95}
  .lp .bfc-scrim{position:absolute;inset:0;background:linear-gradient(135deg,rgba(10,8,6,.35) 0%,rgba(139,26,46,.45) 60%,rgba(10,8,6,.7) 100%);pointer-events:none}
  .lp .bc-cat{position:absolute;bottom:11px;left:13px;background:${V.cr};color:${V.white};font-size:9px;font-weight:700;padding:3px 10px;border-radius:99px;letter-spacing:.07em;text-transform:uppercase}
  .lp .bc-body{padding:22px;flex:1;display:flex;flex-direction:column}
  .lp .bc-date{font-size:11px;color:${V.sl3};margin-bottom:7px;font-weight:500;letter-spacing:.04em}
  .lp .bc-h{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:${V.ink};margin-bottom:8px;line-height:1.35}
  .lp .bc-ex{font-size:13px;color:${V.sl};line-height:1.65;flex:1}
  .lp .bc-rd{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:${V.cr};margin-top:13px;transition:gap .2s}
  .lp .bc:hover .bc-rd{gap:9px}
  .lp .bc.hidden{display:none}
  .lp .nl-strip{background:${V.bone2};border:1px solid ${V.bone3};border-radius:24px;padding:40px;margin-top:40px;text-align:center}
  /* WIZARD */
  .lp .wiz-shell{background:${V.white};border-radius:24px;box-shadow:0 32px 80px rgba(10,8,6,.20);overflow:hidden;margin-top:60px}
  .lp .wiz-steps{display:flex;background:${V.ink}}
  .lp .wst{flex:1;padding:18px 14px;display:flex;align-items:center;gap:9px;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;min-width:0}
  .lp .wst.on{background:rgba(139,26,46,.12);border-color:${V.cr}}
  .lp .ws-n{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:rgba(247,243,237,.33);flex-shrink:0;transition:all .2s}
  .lp .wst.on .ws-n{background:${V.cr};color:${V.white}}
  .lp .ws-l{font-size:11.5px;font-weight:700;color:rgba(247,243,237,.33);transition:color .2s;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .lp .wst.on .ws-l{color:${V.white}}
  .lp .wiz-body{padding:48px}
  .lp .wiz-h{font-family:'Playfair Display',serif;font-size:1.7rem;font-weight:700;color:${V.ink};margin-bottom:5px}
  .lp .wiz-sub{font-size:14px;color:${V.sl};margin-bottom:28px;line-height:1.65}
  .lp .fg{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .lp .fgg{grid-column:1/-1}
  .lp .fl{font-size:11px;font-weight:700;color:${V.sl};letter-spacing:.06em;text-transform:uppercase;margin-bottom:5px;display:block}
  .lp .fi-i{padding:11px 14px;border:1.5px solid ${V.bone3};border-radius:6px;font-size:14px;color:${V.ink};outline:none;transition:all .2s;background:${V.bone};width:100%;font-family:'Syne',sans-serif}
  .lp .fi-i:focus{border-color:${V.cr};background:${V.white}}
  .lp select.fi-i{appearance:none;padding-right:32px}
  .lp .wiz-nav{display:flex;justify-content:space-between;align-items:center;margin-top:32px;padding-top:24px;border-top:1px solid ${V.bone3}}
  .lp .wb{padding:13px 26px;border-radius:6px;font-weight:700;font-size:13.5px;cursor:pointer;border:none;transition:all .2s;font-family:'Syne',sans-serif;display:inline-flex;align-items:center;gap:7px}
  .lp .wb-nx{background:${V.cr};color:${V.white}}.lp .wb-nx:hover{background:${V.cr2}}
  .lp .wb-bk{background:transparent;color:${V.sl};border:1px solid ${V.bone3}}.lp .wb-bk:hover{border-color:${V.sl}}
  .lp .pay-o{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:22px}
  .lp .po{border:1.5px solid ${V.bone3};border-radius:10px;padding:14px 8px;text-align:center;cursor:pointer;transition:all .2s;background:${V.bone}}
  .lp .po.sel{border-color:${V.cr};background:rgba(139,26,46,.04)}
  .lp .po-l{font-size:11px;font-weight:700;color:${V.sl};margin-top:6px}
  /* LOGIN */
  .lp .login-bg{min-height:100vh;background:${V.ink};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;position:relative;overflow:hidden}
  .lp .login-card{background:rgba(26,21,16,.96);border:1px solid rgba(184,150,12,.12);border-radius:24px;padding:44px;width:100%;max-width:440px;box-shadow:0 60px 120px rgba(10,8,6,.28);position:relative;z-index:1;backdrop-filter:blur(20px)}
  .lp .lrt-wrap{display:flex;background:rgba(255,255,255,.05);border-radius:6px;padding:3px;margin-bottom:26px}
  .lp .lrt{flex:1;padding:8px;border-radius:7px;font-size:12.5px;font-weight:700;cursor:pointer;border:none;transition:all .2s;font-family:'Syne',sans-serif;color:rgba(247,243,237,.4);background:transparent;display:flex;align-items:center;justify-content:center;gap:6px}
  .lp .lrt.on{background:${V.cr};color:${V.white};box-shadow:0 2px 8px rgba(139,26,46,.4)}
  .lp .login-h{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:${V.white};margin-bottom:4px}
  .lp .login-sub{font-size:13px;color:rgba(247,243,237,.38);margin-bottom:24px;line-height:1.6}
  .lp .login-fl{font-size:11px;font-weight:700;color:rgba(247,243,237,.32);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;display:block}
  .lp .login-inp{padding:12px 14px;border:1.5px solid rgba(255,255,255,.1);border-radius:6px;font-size:14px;color:${V.white};outline:none;transition:all .2s;background:rgba(255,255,255,.05);width:100%;font-family:'Syne',sans-serif;margin-bottom:14px}
  .lp .login-inp:focus{border-color:${V.gold3};background:rgba(255,255,255,.08)}
  .lp .login-inp::placeholder{color:rgba(247,243,237,.2)}
  .lp .login-btn{width:100%;padding:14px;background:${V.cr};color:${V.white};border:none;border-radius:6px;font-weight:700;font-size:14px;cursor:pointer;transition:all .2s;font-family:'Syne',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px}
  .lp .login-btn:hover{background:${V.cr2}}
  .lp .lpfs{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:440px;margin-top:20px;position:relative;z-index:1}
  .lp .lpf{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:16px;text-align:center}
  .lp .lpf-l{font-size:11.5px;font-weight:700;color:rgba(247,243,237,.6);margin-top:8px}
  .lp .lpf-s{font-size:10.5px;color:rgba(247,243,237,.28);margin-top:2px}
  /* CONSULTATION PAGE */
  .lp .consult-wrap{max-width:760px;margin:0 auto}
  .lp .consult-card{background:${V.white};border:1px solid ${V.bone3};border-radius:24px;padding:48px;box-shadow:0 8px 40px rgba(10,8,6,.08)}
  .lp .consult-field{margin-bottom:20px}
  .lp .consult-label{display:block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${V.sl};margin-bottom:7px}
  .lp .consult-input{width:100%;padding:12px 16px;border:1.5px solid ${V.bone3};border-radius:8px;font-size:14px;color:${V.ink};background:${V.bone};font-family:'Syne',sans-serif;outline:none;transition:border-color .2s}
  .lp .consult-input:focus{border-color:${V.cr};background:${V.white}}
  .lp .consult-select{width:100%;padding:12px 16px;border:1.5px solid ${V.bone3};border-radius:8px;font-size:14px;color:${V.ink};background:${V.bone};font-family:'Syne',sans-serif;outline:none;appearance:none;cursor:pointer;transition:border-color .2s}
  .lp .consult-select:focus{border-color:${V.cr}}
  .lp .consult-textarea{width:100%;padding:12px 16px;border:1.5px solid ${V.bone3};border-radius:8px;font-size:14px;color:${V.ink};background:${V.bone};font-family:'Syne',sans-serif;outline:none;resize:vertical;min-height:120px;line-height:1.65;transition:border-color .2s}
  .lp .consult-textarea:focus{border-color:${V.cr};background:${V.white}}
  .lp .consult-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .lp .consult-success{text-align:center;padding:48px 32px}
  .lp .consult-success-icon{width:72px;height:72px;border-radius:50%;background:rgba(139,26,46,.08);border:2px solid rgba(139,26,46,.2);display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
  /* CONTACT PAGE */
  .lp .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:48px}
  .lp .contact-info-card{background:${V.ink};border-radius:20px;padding:40px;display:flex;flex-direction:column;gap:28px}
  .lp .contact-method{display:flex;align-items:flex-start;gap:16px}
  .lp .contact-icon{width:44px;height:44px;border-radius:10px;background:rgba(139,26,46,.25);border:1px solid rgba(139,26,46,.4);display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .lp .contact-method-label{font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(247,243,237,.3);margin-bottom:5px}
  .lp .contact-method-value{font-size:14.5px;color:${V.white};font-weight:600;line-height:1.5}
  .lp .contact-method-sub{font-size:12px;color:rgba(247,243,237,.4);margin-top:3px}
  .lp .contact-email-card{background:${V.white};border:1px solid ${V.bone3};border-radius:20px;padding:40px}
  /* FOOTER */
  .lp footer{background:${V.ink2};padding:72px 0 28px;border-top:1px solid rgba(184,150,12,.08)}
  .lp .ft-grid{display:grid;grid-template-columns:1.8fr 1fr 1fr 1fr;gap:52px;margin-bottom:52px}
  .lp .ft-h{font-family:'Playfair Display',serif;font-size:21px;font-weight:700;color:#FEFDFB}
  .lp .ft-h em{color:${V.gold3};font-style:italic}
  .lp .ft-tag{font-size:8.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#A89F94;margin-top:2px;margin-bottom:14px}
  .lp .ft-d{font-size:13px;color:#C0B5A8;line-height:1.78;margin-bottom:20px;max-width:270px}
  .lp .ft-ch{font-size:9.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#C8BFB4;margin-bottom:16px}
  .lp .ft-lk{list-style:none;display:flex;flex-direction:column;gap:9px}
  .lp .ft-lk a{font-size:13px;color:#C0B5A8;transition:color .15s;cursor:pointer;display:block}
  .lp .ft-lk a:hover{color:${V.white}}
  .lp .ft-ct{font-size:12.5px;color:#C0B5A8;line-height:2.1}
  .lp .ft-bot{border-top:1px solid rgba(255,255,255,.05);padding-top:22px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
  .lp .ft-copy{font-size:11.5px;color:#A89F94}
  .lp .ft-acs{display:flex;gap:6px;flex-wrap:wrap}
  .lp .ft-ac{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:4px;padding:3px 10px;font-size:10px;font-weight:600;color:#A89F94}
  /* PROG CARDS */
  .lp .prog-card{background:${V.white};border:1px solid ${V.bone3};border-radius:24px;overflow:hidden;margin-bottom:28px}
  .lp .prog-bar{height:4px;background:linear-gradient(90deg,${V.cr},${V.gold2})}
  .lp .prog-body{padding:40px}
  .lp .prog-info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:28px}
  .lp .prog-info{background:${V.bone};border-radius:10px;padding:18px;display:flex;flex-direction:column;gap:6px}
  .lp .prog-info-h{font-weight:700;font-size:13.5px;color:${V.ink}}
  .lp .prog-info-v{font-size:13px;color:${V.sl}}
  .lp .prog-path-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:28px}
  .lp .prog-path{border:1px solid ${V.bone3};border-radius:10px;padding:16px}
  .lp .prog-path-h{font-weight:700;font-size:13px;color:${V.cr};margin-bottom:6px}
  .lp .prog-path-p{font-size:12.5px;color:${V.sl};line-height:1.65}
  .lp .prog-unis{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px}
  .lp .prog-uni{background:${V.bone2};border-radius:6px;padding:5px 12px;font-size:12px;font-weight:600;color:${V.sl}}
  .lp .sa-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px}
  .lp .sa-d{border:1px solid ${V.bone3};border-radius:16px;overflow:hidden}
  .lp .sa-dt{padding:20px;text-align:center}
  .lp .sa-dn{font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:${V.white};margin-top:8px}
  .lp .sa-db{padding:16px}
  .lp .sa-dp{font-size:12.5px;color:${V.sl};line-height:1.65;margin-bottom:8px}
  .lp .sa-dm{font-size:11.5px;color:${V.sl2}}
  /* PROG SELECTION */
  .lp .prog-sel-card{border:2px solid ${V.bone3};border-radius:16px;padding:24px 20px;cursor:pointer;transition:all .25s;background:${V.white};display:flex;flex-direction:column;gap:0;position:relative;overflow:hidden}
  .lp .prog-sel-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,${V.cr},${V.gold2});transform:scaleX(0);transform-origin:left;transition:transform .3s}
  .lp .prog-sel-card:hover{box-shadow:0 12px 40px rgba(10,8,6,.14);transform:translateY(-3px)}
  .lp .prog-sel-card.on{border-color:${V.cr};background:rgba(139,26,46,.03)}
  .lp .prog-sel-card.on::before{transform:scaleX(1)}
  .lp .psc-ico{width:52px;height:52px;border-radius:10px;background:rgba(139,26,46,.07);border:1px solid rgba(139,26,46,.1);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
  .lp .psc-h{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:${V.ink};margin-bottom:8px;line-height:1.2}
  .lp .psc-p{font-size:12.5px;color:${V.sl};line-height:1.68;font-weight:400;flex:1;margin-bottom:14px}
  .lp .psc-from{font-size:12px;font-weight:700;color:${V.cr};letter-spacing:.02em}
  .lp .prog-sub-panel{background:${V.bone};border-radius:10px;border:1px solid ${V.bone3};padding:22px;margin-bottom:4px;transition:all .3s;animation:lp-fadeUp .3s ease}
  /* TOAST */
  #lp-toast{position:fixed;bottom:22px;right:22px;background:${V.ink2};color:${V.white};padding:14px 18px;border-radius:10px;font-size:13.5px;font-weight:500;box-shadow:0 20px 50px rgba(10,8,6,.28);z-index:9999;border-left:3px solid ${V.cr};display:none;max-width:340px;line-height:1.5;font-family:'Syne',sans-serif}
  #lp-toast.show{display:block;animation:lp-fadeUp .3s ease}
  /* ANIMATIONS */
  @keyframes lp-marq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes lp-topbar-marq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes lp-fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
  @keyframes lp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
  @keyframes lp-pulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.18);opacity:1}}
  /* MEDIA */
  @media(max-width:1200px){
    .lp .h-stats{display:none}
    .lp .ft-grid{grid-template-columns:1fr 1fr;gap:36px}
    .lp .cur-grid,.lp .svc-grid,.lp .tgrid,.lp .blog-grid,.lp .price-grid,.lp .team-grid{grid-template-columns:repeat(2,1fr)}
    .lp .hl-grid,.lp .stat-grid,.lp .proc-grid,.lp .prog-info-grid,.lp .prog-path-grid,.lp .sa-grid{grid-template-columns:repeat(2,1fr)}
  }
  @media(max-width:768px){
    .lp .nav-links,.lp .nav-actions{display:none}
    .lp .h-stats{display:none}
    .lp .h-mob-stats{display:none!important}
    .lp .h-stats-strip{display:block}
    .lp #hero{min-height:0;height:auto;max-height:720px}
    .lp .h-bg{object-position:center center;filter:brightness(1.08) saturate(1.05) contrast(1.02)}
    .lp .h-vig{height:140px}
    .lp .h-body{min-height:60vh;max-height:640px;padding-top:48px;padding-bottom:56px}
    .lp .mob-burger{display:flex!important}
    .lp .mob-page-strip{display:block!important}
    .lp .wrap,.lp .nav-wrap,.lp .h-body,.lp .cta-in{padding-left:20px;padding-right:20px}
    .lp .sec{padding:64px 0}
    .lp .h1{font-size:clamp(2.4rem,10vw,3.4rem)}
    .lp .hl-grid,.lp .stat-grid,.lp .proc-grid,.lp .cur-grid,.lp .svc-grid,.lp .tgrid,.lp .blog-grid,.lp .price-grid,.lp .prog-info-grid,.lp .prog-path-grid,.lp .sa-grid,.lp .team-grid{grid-template-columns:1fr}
    .lp .fg,.lp .pay-o{grid-template-columns:1fr 1fr}
    .lp .ft-grid{grid-template-columns:1fr}
    /* WIZARD / ENROLMENT FORM — slim down on mobile */
    .lp .wiz-shell{margin-top:36px;border-radius:18px}
    .lp .wiz-steps{flex-wrap:wrap}
    .lp .wst{min-width:50%;padding:12px 10px;gap:7px}
    .lp .ws-n{width:22px;height:22px;font-size:10px}
    .lp .ws-l{font-size:10.5px}
    .lp .wiz-body{padding:22px 16px}
    .lp .wiz-h{font-size:1.25rem;margin-bottom:4px}
    .lp .wiz-sub{font-size:12.5px;margin-bottom:20px;line-height:1.55}
    .lp .fl{font-size:10px;margin-bottom:4px}
    .lp .fi-i{padding:10px 12px;font-size:16px;border-radius:6px}
    .lp .fg{gap:12px}
    .lp .wiz-nav{margin-top:22px;padding-top:18px}
    .lp .wb{padding:11px 20px;font-size:12.5px}
    /* CONSULT FORM — same slim treatment */
    .lp .consult-label{font-size:10px;margin-bottom:5px}
    .lp .consult-input{padding:10px 12px;font-size:16px}
    .lp .bfc{grid-template-columns:1fr}.lp .bfc-l{min-height:180px}
    .lp .lpfs{grid-template-columns:repeat(3,1fr)}
    /* tighter section + heading sizing on tablets/phones */
    .lp .sec-hd{margin-bottom:36px}
    .lp .display{font-size:clamp(1.9rem,7.5vw,2.8rem)}
    .lp .pg-hero{padding-top:90px;padding-bottom:48px}
    .lp .pg-h{font-size:clamp(2rem,8.5vw,2.8rem)}
    .lp .pg-sub{font-size:14.5px}
    .lp .lead,.lp .h-sub{font-size:14.5px;line-height:1.65}
    .lp .h-act{flex-direction:column;align-items:stretch;width:100%}
    .lp .h-act .btn-p,.lp .h-act .btn-o{justify-content:center;width:100%;padding:12px 22px;font-size:13px}
    .lp .p-tabs{width:100%}
    .lp .ptab{flex:1;text-align:center;padding:9px 12px;font-size:12px}
    .lp .pc{padding:22px}
    .lp .p-am{font-size:2.4rem}
  }
  @media(max-width:480px){
    .lp .fg{grid-template-columns:1fr}.lp .pay-o{grid-template-columns:1fr 1fr}.lp .wst{min-width:100%}.lp .hl-grid{grid-template-columns:1fr 1fr}
    /* small-phone refinements */
    .lp .wrap,.lp .nav-wrap,.lp .h-body,.lp .cta-in{padding-left:16px;padding-right:16px}
    .lp .sec{padding:48px 0}
    .lp .sec-hd{margin-bottom:32px}
    .lp .h-body{padding-top:64px;padding-bottom:48px;min-height:55vh}
    .lp #hero{max-height:680px}
    .lp .h-body{max-height:600px}
    .lp .h1{font-size:clamp(2.1rem,11vw,2.9rem);margin-bottom:20px}
    .lp .pg-h{font-size:clamp(1.85rem,8.5vw,2.5rem)}
    .lp .pg-hero{padding-top:80px;padding-bottom:36px}
    .lp .lead,.lp .h-sub,.lp .pg-sub{font-size:14px;line-height:1.6}
    .lp .display{font-size:clamp(1.75rem,7.5vw,2.4rem)}
    .lp .lpfs{grid-template-columns:repeat(2,1fr)}
    .lp .pc{padding:18px;border-radius:14px}
    .lp .p-am{font-size:2.1rem}
    .lp .ptab{font-size:11px;padding:8px 8px}
    .lp .hl-grid{grid-template-columns:1fr}
    .lp .pay-o{grid-template-columns:1fr}
    .lp .btn-p,.lp .nav-cta{padding:12px 22px;font-size:12.5px}
    /* WIZARD — even tighter on small phones */
    .lp .wiz-body{padding:18px 14px}
    .lp .wiz-h{font-size:1.15rem}
    .lp .wiz-sub{font-size:12px;margin-bottom:18px}
    .lp .wst{padding:10px 8px}
    .lp .ws-l{font-size:10px}
    .lp .ws-n{width:20px;height:20px;font-size:9.5px}
    .lp .fab-panel{right:12px;left:12px;width:auto;max-width:none}
    /* H-STATS-STRIP smaller numbers on tiny screens */
    .lp .h-stats-strip{padding:22px 16px 26px}
    .lp .hms{padding:11px 13px}
    .lp .hms-n{font-size:1.35rem}
    .lp .hms-l{font-size:9.5px}
  }

  /* ═══════════════════════════════════════════════════════
     COMPREHENSIVE MOBILE FIXES — applied to all newer sections
     (country pages, comparison pages, homepage extras, forms)
     Two breakpoints: ≤768px (tablet+phone), ≤480px (phone).
     ═══════════════════════════════════════════════════════ */
  @media(max-width:768px){
    /* — display heading ('Playfair Display' large headings) — */
    .lp .display{font-size:clamp(1.7rem,7vw,2.4rem) !important;line-height:1.15 !important}

    /* — wizard form scaling — */
    .lp .wiz-h{font-size:1.3rem;line-height:1.3}
    .lp .wiz-sub{font-size:13.5px;margin-bottom:20px}
    .lp .fi-i{font-size:16px;padding:12px 14px}
    /* Important: input font-size MUST be ≥16px on iOS to
       prevent Safari from auto-zooming on focus. */

    /* — consult / contact form inputs — */
    .lp .consult-input{font-size:16px;padding:13px 14px}

    /* — section paddings reduced — */
    .lp .sec{padding:48px 0}

    /* — explicit 16px font reset for all native inputs as a safety net — */
    .lp input,.lp select,.lp textarea{font-size:16px}
  }

  @media(max-width:480px){
    /* — Hero subtitle on country/compare pages — */
    .lp .pg-sub{font-size:13.5px;line-height:1.7}
    .lp .pg-h{font-size:clamp(1.9rem,8vw,2.6rem) !important}

    /* — display heading further reduction on phones — */
    .lp .display{font-size:clamp(1.5rem,8vw,2rem) !important}

    /* — wizard tighter on small phones — */
    .lp .wiz-h{font-size:1.15rem}
    .lp .wiz-sub{font-size:12.5px;margin-bottom:16px}
    .lp .wiz-shell{margin-top:32px;border-radius:16px}

    /* — make sure touch targets are at least 44px tall — */
    .lp .btn-p,.lp .btn-o,.lp button.btn-p,.lp button.btn-o{min-height:44px;font-size:13.5px;padding:11px 20px}

    /* — comparison table allows horizontal scroll on tiny screens — */
    .lp table{font-size:12.5px}
    .lp table th,.lp table td{padding:10px 12px !important;white-space:normal;word-break:break-word}

    /* — section header (eyebrow + subheading) tighter — */
    .lp .eyebrow{font-size:9.5px;margin-bottom:10px}
    .lp .lead{font-size:13.5px;line-height:1.7}
    .lp .sec{padding:40px 0}
    .lp .sec-hd{margin-bottom:24px}
  }
`

const PAGES = ['home','about','curricula','curriculum-detail','services','service-detail','global','pricing','programs','activities','country-detail','compare-detail','faq','blog','teachers','enroll','login','consult','contact','privacy','terms','cookies','gdpr','article']

const Stars = () => (
  <div style={{display:'flex',gap:2,marginBottom:16}}>
    {[...Array(5)].map((_,i) => <svg key={i} className="t-s" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
  </div>
)

// ─── Smartious Logo (redrawn in SVG so no white background, scales perfectly) ───
// Crimson shield · gold star · white open-book device
const SmartiousLogo = ({ size = 40, withText = false, tone = 'light' }) => {
  const textColor = tone === 'light' ? '#FEFDFB' : '#0A0806'
  const iousColor = tone === 'light' ? '#F0CC5A' : '#8B1A2E'
  return (
    <div style={{display:'inline-flex',alignItems:'center',gap:12}}>
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Smartious Homeschool">
        <defs>
          <linearGradient id="sh-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A8203A"/>
            <stop offset="100%" stopColor="#7A1026"/>
          </linearGradient>
        </defs>
        {/* Shield body */}
        <path d="M40 6 L68 14 Q70 14 70 17 L70 44 Q70 60 40 74 Q10 60 10 44 L10 17 Q10 14 12 14 Z" fill="url(#sh-grad)" stroke="#6A0E20" strokeWidth="0.6"/>
        {/* Inner frame */}
        <path d="M40 10 L64 17 Q65.5 17 65.5 19 L65.5 44 Q65.5 57 40 69 Q14.5 57 14.5 44 L14.5 19 Q14.5 17 16 17 Z" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="0.8"/>
        {/* Gold star top */}
        <polygon points="40,19 42.2,26 49.5,26 43.7,30.4 45.9,37.5 40,33 34.1,37.5 36.3,30.4 30.5,26 37.8,26" fill="#F0CC5A" stroke="#C89A28" strokeWidth="0.4"/>
        {/* Open book */}
        <g transform="translate(40 52)">
          <path d="M-14 -4 L-14 8 L-1 9 L-1 -3 Q-8 -5 -14 -4 Z" fill="#FEFDFB" stroke="#F7F3ED" strokeWidth=".4"/>
          <path d="M14 -4 L14 8 L1 9 L1 -3 Q8 -5 14 -4 Z" fill="#FEFDFB" stroke="#F7F3ED" strokeWidth=".4"/>
          <line x1="-10" y1="-0.5" x2="-4" y2="-0.5" stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
          <line x1="-10" y1="2" x2="-4" y2="2" stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
          <line x1="-10" y1="4.5" x2="-4" y2="4.5" stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
          <line x1="4" y1="-0.5" x2="10" y2="-0.5" stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
          <line x1="4" y1="2" x2="10" y2="2" stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
          <line x1="4" y1="4.5" x2="10" y2="4.5" stroke="#A8203A" strokeWidth=".5" strokeLinecap="round"/>
        </g>
      </svg>
      {withText && (
        <div style={{display:'flex',flexDirection:'column',lineHeight:1.1}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize: size*0.55, fontWeight:700, color:textColor}}>
            Smart<em style={{fontStyle:'italic', color:iousColor, fontWeight:500}}>ious</em>
          </div>
          <div style={{fontSize: size*0.2, fontWeight:600, letterSpacing:'.16em', color:tone==='light'?'rgba(247,243,237,.45)':'rgba(10,8,6,.42)', textTransform:'uppercase', marginTop:2}}>
            Homeschool · Global
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// PLACEMENT ASSESSMENT QUESTION BANK
// Organised by academic level × subject. Questions are picked
// randomly from the appropriate bucket so each student gets
// a fresh assessment worth the $15 fee.
// ═══════════════════════════════════════════════════════════
const LEVELS = [
  {id:'primary-lower', label:'Primary Lower (Grade 1–3 · Year 2–4)'},
  {id:'primary-upper', label:'Primary Upper (Grade 4–6 · Year 5–7)'},
  {id:'lower-sec',     label:'Lower Secondary (Grade 7–8 · Year 8–9)'},
  {id:'igcse',         label:'IGCSE / Grade 9–10 (Year 10–11)'},
  {id:'upper-sec',     label:'A-Level / IB Diploma (Grade 11–12 · Year 12–13)'},
  {id:'foundation',    label:'University Foundation (IUFP · Gap Year)'},
]

// Answer key: the CORRECT option is always the first item in `opts`.
// We shuffle per-render so position carries no signal.
const QUESTION_BANK = {
  'primary-lower': {
    math: [
      {id:'pl-m-1', q:'What is 4 + 5?',                         opts:['9','8','10','7']},
      {id:'pl-m-2', q:'How many sides does a triangle have?',   opts:['3','4','5','6']},
      {id:'pl-m-3', q:'What comes next: 2, 4, 6, __ ?',         opts:['8','7','9','10']},
      {id:'pl-m-4', q:'Which is the biggest number?',           opts:['23','17','9','12']},
      {id:'pl-m-5', q:'15 − 7 = ?',                             opts:['8','9','7','6']},
      {id:'pl-m-6', q:'How many tens are in 30?',               opts:['3','30','10','0']},
      {id:'pl-m-7', q:'A pencil costs KES 20. Two pencils cost?', opts:['KES 40','KES 22','KES 30','KES 200']},
      {id:'pl-m-8', q:'What time does the clock show if the hour hand is on 3 and minute hand on 12?', opts:['3 o\u2019clock','12 o\u2019clock','3:30','3:12']},
    ],
    english: [
      {id:'pl-e-1', q:'Choose the correct word: "I ___ a student."',  opts:['am','is','are','be']},
      {id:'pl-e-2', q:'What is the plural of "book"?',                opts:['books','bookes','book\u2019s','bookies']},
      {id:'pl-e-3', q:'Which word is an animal?',                     opts:['Lion','Chair','Cup','Tree']},
      {id:'pl-e-4', q:'Pick the correct spelling:',                   opts:['Friend','Freind','Frend','Frendd']},
      {id:'pl-e-5', q:'Opposite of "hot":',                           opts:['cold','warm','sunny','dry']},
      {id:'pl-e-6', q:'Which one is a question?',                     opts:['Where is my bag?','My bag is red.','I like my bag.','Open the bag!']},
      {id:'pl-e-7', q:'Choose the naming word (noun):',               opts:['Teacher','Quickly','Run','Blue']},
      {id:'pl-e-8', q:'Finish the rhyme: "The cat sat on the ___"',   opts:['mat','dog','roof','mug']},
    ],
  },
  'primary-upper': {
    math: [
      {id:'pu-m-1', q:'What is 125 \u00F7 5?',                        opts:['25','20','30','15']},
      {id:'pu-m-2', q:'The perimeter of a square with side 6 cm is:', opts:['24 cm','12 cm','36 cm','18 cm']},
      {id:'pu-m-3', q:'Convert 3/4 to a decimal:',                    opts:['0.75','0.34','0.43','0.075']},
      {id:'pu-m-4', q:'What is 15% of 200?',                          opts:['30','15','20','45']},
      {id:'pu-m-5', q:'If a train travels 120 km in 2 hours, its speed is:', opts:['60 km/h','120 km/h','240 km/h','30 km/h']},
      {id:'pu-m-6', q:'The area of a rectangle 8 m \u00D7 5 m is:',   opts:['40 m\u00B2','13 m\u00B2','26 m\u00B2','80 m\u00B2']},
      {id:'pu-m-7', q:'Round 4,678 to the nearest hundred:',          opts:['4,700','4,600','4,680','5,000']},
      {id:'pu-m-8', q:'What is the smallest prime number?',           opts:['2','1','3','5']},
      {id:'pu-m-9', q:'A pizza is cut into 8 equal slices. If you eat 3, what fraction is left?', opts:['5/8','3/8','3/5','5/3']},
    ],
    english: [
      {id:'pu-e-1', q:'Choose the correct sentence:', opts:['She doesn\u2019t like apples.','She don\u2019t like apples.','She doesn\u2019t likes apples.','She don\u2019t likes apples.']},
      {id:'pu-e-2', q:'What is a synonym for "happy"?', opts:['joyful','angry','tired','empty']},
      {id:'pu-e-3', q:'Identify the verb: "The girl runs quickly."', opts:['runs','girl','quickly','the']},
      {id:'pu-e-4', q:'Pick the correct spelling:', opts:['Necessary','Neccessary','Necesary','Nessecary']},
      {id:'pu-e-5', q:'Punctuate: "where are you going"', opts:['Where are you going?','Where are you going.','where are you going?','Where Are You Going!']},
      {id:'pu-e-6', q:'The opposite of "generous" is:', opts:['stingy','kind','loud','quiet']},
      {id:'pu-e-7', q:'Which is a complete sentence?', opts:['The dog barked loudly.','Running down the street.','Because it was raining.','In the morning.']},
      {id:'pu-e-8', q:'Choose the adjective: "The tall building shook."', opts:['tall','building','shook','the']},
      {id:'pu-e-9', q:'"I saw ___ elephant at the zoo." Fill in the blank:', opts:['an','a','the','one']},
    ],
  },
  'lower-sec': {
    math: [
      {id:'ls-m-1', q:'Simplify: 3x + 2y \u2212 x + 5y',                   opts:['2x + 7y','4x + 7y','2x + 3y','4x + 3y']},
      {id:'ls-m-2', q:'In a right-angled triangle with legs 3 and 4, the hypotenuse is:', opts:['5','7','6','4.5']},
      {id:'ls-m-3', q:'Solve for x: 2x + 6 = 18',                          opts:['6','12','9','3']},
      {id:'ls-m-4', q:'What is (\u22125) + 8?',                            opts:['3','\u221213','13','\u22123']},
      {id:'ls-m-5', q:'The mean of 4, 7, 9, 12 is:',                       opts:['8','7','9','10']},
      {id:'ls-m-6', q:'Express 0.6 as a fraction in lowest terms:',        opts:['3/5','6/10','2/3','1/6']},
      {id:'ls-m-7', q:'The sum of angles in a triangle is:',               opts:['180\u00B0','90\u00B0','360\u00B0','270\u00B0']},
      {id:'ls-m-8', q:'What is 2\u00B3 \u00D7 2\u00B2?',                   opts:['32','16','64','10']},
      {id:'ls-m-9', q:'If y = 3x \u2212 4 and x = 5, find y:',             opts:['11','15','19','\u221211']},
      {id:'ls-m-10',q:'The probability of rolling a 3 on a fair die is:',  opts:['1/6','1/3','1/2','3/6']},
    ],
    english: [
      {id:'ls-e-1', q:'Identify the correct sentence:', opts:['Neither of the boys is here.','Neither of the boys are here.','Neither of the boys were here.','Neither of the boys be here.']},
      {id:'ls-e-2', q:'What is the main idea of a paragraph usually found in?', opts:['The topic sentence','The last word','The middle sentence','The punctuation']},
      {id:'ls-e-3', q:'Choose the correct punctuation: "I asked \u2018Where is my book"', opts:['I asked, "Where is my book?"','I asked where is my book','I asked. "where is my book?"','I asked "where is my book"']},
      {id:'ls-e-4', q:'Which word is a conjunction?', opts:['although','quickly','beautiful','run']},
      {id:'ls-e-5', q:'A metaphor is:', opts:['A direct comparison without "like" or "as"','An exaggeration','A sound word','A repeated letter']},
      {id:'ls-e-6', q:'Pick the correct past tense: "Yesterday she ___ home."', opts:['went','goes','go','going']},
      {id:'ls-e-7', q:'Identify the subject: "The loud bell rang suddenly."', opts:['The loud bell','rang','suddenly','bell rang']},
      {id:'ls-e-8', q:'Which word means "to make shorter"?', opts:['abbreviate','elongate','dilate','irritate']},
      {id:'ls-e-9', q:'Choose correct spelling:', opts:['Accommodate','Accomodate','Acommodate','Accomadate']},
      {id:'ls-e-10',q:'Select the adverb: "She sang beautifully."', opts:['beautifully','sang','she','the']},
    ],
  },
  'igcse': {
    math: [
      {id:'ig-m-1', q:'Solve: 3(x \u2212 2) = 15',                             opts:['x = 7','x = 5','x = 3','x = 9']},
      {id:'ig-m-2', q:'Factorise fully: x\u00B2 \u2212 9',                     opts:['(x \u2212 3)(x + 3)','(x \u2212 3)\u00B2','(x + 3)\u00B2','x(x \u2212 9)']},
      {id:'ig-m-3', q:'The gradient of the line y = 4x \u2212 7 is:',          opts:['4','\u22127','\u22124','7']},
      {id:'ig-m-4', q:'Solve the simultaneous equations: x + y = 10, x \u2212 y = 2', opts:['x = 6, y = 4','x = 4, y = 6','x = 5, y = 5','x = 8, y = 2']},
      {id:'ig-m-5', q:'The area of a circle with radius 7 cm is (take \u03C0 = 22/7):', opts:['154 cm\u00B2','44 cm\u00B2','22 cm\u00B2','49 cm\u00B2']},
      {id:'ig-m-6', q:'Simplify: (x\u00B2y\u00B3)(x\u00B3y)',                  opts:['x\u2075y\u2074','x\u2076y\u00B3','x\u2075y\u00B3','x\u2076y\u2074']},
      {id:'ig-m-7', q:'sin(30\u00B0) = ?',                                     opts:['0.5','1','0','\u221A3/2']},
      {id:'ig-m-8', q:'In similar triangles, corresponding sides are:',        opts:['proportional','equal','perpendicular','unrelated']},
      {id:'ig-m-9', q:'If y \u221D x and y = 12 when x = 3, find y when x = 7:', opts:['28','21','17','35']},
      {id:'ig-m-10',q:'Simplify: \u221A50',                                    opts:['5\u221A2','2\u221A5','25\u221A2','10\u221A5']},
      {id:'ig-m-11',q:'The median of 3, 7, 8, 12, 15, 21 is:',                opts:['10','8','12','11']},
      {id:'ig-m-12',q:'Solve: 2x\u00B2 \u2212 8 = 0',                          opts:['x = \u00B12','x = 4','x = \u22122','x = 0']},
    ],
    english: [
      {id:'ig-e-1', q:'Identify the figure of speech in "Time is a thief":', opts:['Metaphor','Simile','Personification','Hyperbole']},
      {id:'ig-e-2', q:'Which sentence uses the semicolon correctly?', opts:['She loves reading; her favourite genre is mystery.','She loves reading, her favourite genre; is mystery.','She; loves reading her favourite genre is mystery.','She loves; reading her favourite genre is mystery.']},
      {id:'ig-e-3', q:'What is the tone of a text that mocks its subject?', opts:['Satirical','Nostalgic','Formal','Sympathetic']},
      {id:'ig-e-4', q:'Choose the correct passive voice of "The chef cooked the meal":', opts:['The meal was cooked by the chef.','The meal is cooked by the chef.','The meal cooks by the chef.','The meal had cook by the chef.']},
      {id:'ig-e-5', q:'The word "ambiguous" means:', opts:['having more than one possible meaning','very clear','loud and angry','completely true']},
      {id:'ig-e-6', q:'In persuasive writing, a rhetorical question is used to:', opts:['engage the reader and provoke thought','state a fact','request actual information','insult the reader']},
      {id:'ig-e-7', q:'Identify the subordinate clause: "Although it rained, we played outside."', opts:['Although it rained','we played outside','Although','outside']},
      {id:'ig-e-8', q:'Which is an example of alliteration?', opts:['Peter Piper picked a peck','The bells rang loudly','She was as quiet as a mouse','He shouted with joy']},
      {id:'ig-e-9', q:'A "protagonist" is:', opts:['the main character','the villain','the setting','the narrator only']},
      {id:'ig-e-10',q:'Correct the sentence: "Me and him went to the shop."', opts:['He and I went to the shop.','Him and me went to the shop.','I and he went to the shop.','Me and he went to the shop.']},
      {id:'ig-e-11',q:'What does "juxtaposition" create in a text?', opts:['a contrast between two ideas placed side by side','a chronological order','a rhyme scheme','a climax']},
      {id:'ig-e-12',q:'Choose the correct spelling:', opts:['Conscientious','Consientious','Conscientous','Concientious']},
    ],
  },
  'upper-sec': {
    math: [
      {id:'us-m-1', q:'Differentiate: f(x) = 3x\u2074 \u2212 5x\u00B2 + 7',     opts:['12x\u00B3 \u2212 10x','12x\u00B3 \u2212 5x','4x\u00B3 \u2212 10x','12x\u00B4 \u2212 10x']},
      {id:'us-m-2', q:'\u222B (2x + 3) dx =',                                   opts:['x\u00B2 + 3x + C','2x\u00B2 + 3x + C','x\u00B2 + 3 + C','2 + C']},
      {id:'us-m-3', q:'If log\u2081\u2080(x) = 3, then x =',                    opts:['1000','30','100','10\u00B3\u2080']},
      {id:'us-m-4', q:'The discriminant of x\u00B2 \u2212 4x + 4 = 0 is:',      opts:['0','16','8','\u22124']},
      {id:'us-m-5', q:'lim (x\u21920) sin(x)/x =',                              opts:['1','0','\u221E','undefined']},
      {id:'us-m-6', q:'Solve: e\u02E3 = 7. Then x =',                           opts:['ln 7','log 7','7\u1D49','1/7']},
      {id:'us-m-7', q:'The derivative of ln(x) is:',                            opts:['1/x','ln(x) + 1','e\u02E3','x ln(x)']},
      {id:'us-m-8', q:'In a binomial distribution n=10, p=0.5, the mean is:',  opts:['5','10','0.5','2.5']},
      {id:'us-m-9', q:'The magnitude of vector (3, 4) is:',                    opts:['5','7','\u221A7','25']},
      {id:'us-m-10',q:'cos(60\u00B0) + sin(30\u00B0) =',                        opts:['1','0','\u221A3','0.5']},
      {id:'us-m-11',q:'Solve: |2x \u2212 3| = 5',                               opts:['x = 4 or x = \u22121','x = 4 only','x = \u22121 only','x = 2.5']},
      {id:'us-m-12',q:'A matrix has det = 0 when it is:',                       opts:['singular (non-invertible)','orthogonal','symmetric','identity']},
    ],
    english: [
      {id:'us-e-1', q:'Which literary device is at play in "She was drowning in paperwork"?', opts:['Metaphor','Simile','Oxymoron','Allusion']},
      {id:'us-e-2', q:'A Shakespearean sonnet has how many lines?', opts:['14','12','16','10']},
      {id:'us-e-3', q:'The term "unreliable narrator" means:', opts:['a storyteller whose credibility is compromised','a narrator who speaks in verse','an author who writes anonymously','a character who never speaks']},
      {id:'us-e-4', q:'Which is an example of dramatic irony?', opts:['The audience knows something characters do not','Two characters argue loudly','A play within a play','A sudden plot twist']},
      {id:'us-e-5', q:'The word "ephemeral" most closely means:', opts:['lasting for a very short time','extremely heavy','spiritually uplifting','widely spread']},
      {id:'us-e-6', q:'In an argumentative essay, a counter-argument:', opts:['acknowledges the opposing view before refuting it','restates the thesis','provides a summary','lists sources']},
      {id:'us-e-7', q:'"Stream of consciousness" is most associated with which author?', opts:['Virginia Woolf','Charles Dickens','Jane Austen','Ernest Hemingway']},
      {id:'us-e-8', q:'Identify the correct use of the subjunctive:', opts:['If I were rich, I would travel.','If I was rich, I would travel.','If I am rich, I would travel.','If I be rich, I will travel.']},
      {id:'us-e-9', q:'A "pathetic fallacy" is when:', opts:['the weather or nature reflects human emotion','an argument uses weak evidence','a character feels sorry for themselves','a metaphor fails']},
      {id:'us-e-10',q:'Which is the correct plural possessive?', opts:['The children\u2019s books','The childrens\u2019 books','The children\u2019 books','The childrens books']},
      {id:'us-e-11',q:'In rhetoric, "ethos" appeals to:', opts:['credibility and character','emotion','logic','time and place']},
      {id:'us-e-12',q:'The structural device where a narrative starts at the climax is called:', opts:['in medias res','denouement','exposition','epilogue']},
    ],
  },
  'foundation': {
    math: [
      {id:'fd-m-1', q:'Solve: log\u2082(32) =',                                 opts:['5','4','6','32']},
      {id:'fd-m-2', q:'The integral \u222B x e\u02E3 dx (by parts) gives:',     opts:['xe\u02E3 \u2212 e\u02E3 + C','xe\u02E3 + C','e\u02E3 + C','x\u00B2e\u02E3/2 + C']},
      {id:'fd-m-3', q:'Compound interest at 5% p.a. on $1000 for 2 years (annually compounded) ends at:', opts:['$1102.50','$1100.00','$1050.00','$1105.00']},
      {id:'fd-m-4', q:'The inverse of the function f(x) = 2x + 3 is:',          opts:['(x \u2212 3)/2','(x + 3)/2','2x \u2212 3','1/(2x + 3)']},
      {id:'fd-m-5', q:'The derivative of sin(2x) is:',                          opts:['2cos(2x)','cos(2x)','\u22122cos(2x)','2sin(2x)']},
      {id:'fd-m-6', q:'A data set has mean 50 and standard deviation 5. A value of 60 is how many standard deviations above the mean?', opts:['2','1','10','0.2']},
      {id:'fd-m-7', q:'If P(A)=0.3 and P(B)=0.5 and events are independent, P(A and B) =', opts:['0.15','0.8','0.2','0.35']},
      {id:'fd-m-8', q:'The roots of x\u00B2 \u2212 5x + 6 = 0 are:',            opts:['2 and 3','\u22122 and \u22123','1 and 6','\u22121 and 6']},
    ],
    english: [
      {id:'fd-e-1', q:'In academic writing, "citation" serves to:', opts:['credit sources and avoid plagiarism','make text longer','add decoration','replace your own argument']},
      {id:'fd-e-2', q:'A "thesis statement" in an essay is:', opts:['the central claim the essay argues for','the concluding line','a list of sources','the opening anecdote']},
      {id:'fd-e-3', q:'Choose the most formal register:', opts:['The research indicates a significant correlation.','The data kinda shows they\u2019re linked.','Stuff suggests they\u2019re connected.','Seems linked to me.']},
      {id:'fd-e-4', q:'The word "empirical" refers to knowledge based on:', opts:['observation and evidence','belief','tradition','intuition']},
      {id:'fd-e-5', q:'"Plagiarism" is:', opts:['presenting someone else\u2019s work as your own','quoting a source correctly','paraphrasing with attribution','disagreeing with a source']},
      {id:'fd-e-6', q:'In a literature review, one should primarily:', opts:['synthesise and critique existing research','repeat your thesis','insert personal anecdotes','summarise each source in isolation only']},
      {id:'fd-e-7', q:'The tone of an effective personal statement is typically:', opts:['reflective and authentic','boastful','apologetic','informal']},
      {id:'fd-e-8', q:'"Analyse" as a command verb asks you to:', opts:['break something into parts to examine it','give an opinion','describe briefly','list without detail']},
    ],
  },
}

// Detect academic level from user's selections — gradeLevel takes priority,
// then we infer from curriculum / programme as a fallback.
function detectLevel(enrollForm, currentProg) {
  if (enrollForm.gradeLevel && QUESTION_BANK[enrollForm.gradeLevel]) return enrollForm.gradeLevel
  if (currentProg === 'iufp') return 'foundation'
  const c = (enrollForm.curriculum || '').toLowerCase()
  if (c.includes('a-level') || c.includes('a level') || c.includes('ib diploma')) return 'upper-sec'
  if (c.includes('igcse') || c.includes('edexcel')) return 'igcse'
  if (c.includes('pyp') || c.includes('myp')) return 'lower-sec'
  if (c.includes('cbc') || c.includes('kcse')) return 'lower-sec'
  if (c.includes('british') || c.includes('american')) return 'igcse'
  return 'igcse' // sensible default
}

// Fisher-Yates shuffle — returns a new array, does not mutate input
function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build the 6-question assessment: 3 Math + 3 English from the detected level,
// with options shuffled. Correct answer is always opts[0] in the bank — we
// record the correct answer before shuffling so we can mark it later.
function buildAssessment(level) {
  const bank = QUESTION_BANK[level] || QUESTION_BANK['igcse']
  const mathPicks    = shuffle(bank.math).slice(0, 3)
  const englishPicks = shuffle(bank.english).slice(0, 3)
  const merged = shuffle([
    ...mathPicks.map(q    => ({...q, subject:'Mathematics', correct:q.opts[0]})),
    ...englishPicks.map(q => ({...q, subject:'English',     correct:q.opts[0]})),
  ])
  // Shuffle each question's options so correct answer isn't always first
  return merged.map(q => ({...q, opts: shuffle(q.opts)}))
}

// ═══════════════════════════════════════════════════════════
// BLOG ARTICLES — full content for each of the 10 posts
// ═══════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════
// CURRICULUM DETAIL CONTENT
// Full detail for each curriculum. Drafted from general knowledge
// of each curriculum — Alfred to review and edit wording.
// Each entry: slug, badge, h (name), desc (card teaser), tags,
// meta, gold (Smartious flag), and a `detail` block.
// ════════════════════════════════════════════════════════════
/* ── COUNTRIES — country-specific landing pages ─────────────
 * Each country has a dedicated SEO-optimized page targeting
 * search intent for that market. URL pattern: /online-school/<slug>.
 * Pages are designed to rank for queries like
 * "online school UAE", "homeschooling in Canada", etc.
 *
 * Data shape:
 *   slug         — URL segment (matches search keyword)
 *   country      — full country name
 *   flag         — emoji flag (used only for visual chip, decorative)
 *   h            — H1 headline
 *   tagline      — short subtitle for hero
 *   seoTitle     — <title> tag (≤60 chars ideal)
 *   seoDesc      — meta description (≤158 chars ideal)
 *   localFacts   — array of trust/local facts shown as chips
 *   pains        — pain points the page addresses
 *   curricula    — recommended curricula for that market
 *   regulation   — local homeschooling legality / authority info
 *   examCentres  — where students sit their exams locally
 *   testimonial  — local testimonial quote
 *   testimonialAuthor — author + city
 *   faqs         — country-specific FAQs (used by FAQ schema)
 *   cities       — top cities (helps with local SEO)
 */
/* ── COMPARES — head-to-head comparison pages ──────────────
 * Pages structured to capture "Smartious vs <competitor>"
 * search intent. URL pattern: /compare/<slug>.
 *
 * Each entry contains factual, sourced information about the
 * competitor (drawn from their own public website + verified
 * third-party listings). Comparison is honest — acknowledges
 * competitor strengths before differentiating Smartious.
 *
 * Data shape:
 *   slug          — URL segment
 *   competitor    — competitor name (used in headlines)
 *   seoTitle      — <title> tag
 *   seoDesc       — meta description
 *   intro         — hero subtitle paragraph
 *   competitorSummary — neutral factual paragraph about the competitor
 *   table         — feature-by-feature comparison rows
 *   keyDifference — the "main thing" sentence
 *   competitorStrengths — what the competitor genuinely does well
 *   smartiousAdvantages — what we offer differently (with reasons)
 *   testimonial   — { videoId, title, summary }  YouTube short id
 *   faqs          — comparison-specific FAQs
 *
 * Data sources logged in /competitor-analysis.md notes.
 */
const COMPARES = [
  {
    slug: 'wolsey-hall',
    competitor: 'Wolsey Hall Oxford',
    seoTitle: 'Smartious vs Wolsey Hall Oxford | Live vs Self-Paced Online School',
    seoDesc: 'Honest comparison: Smartious Homeschool vs Wolsey Hall Oxford. Live classes versus self-paced courseware, curricula offered, fees, accreditations and student support — for families choosing an online school.',
    intro: 'A factual comparison of two respected online schools — what each offers, what each does well, and which model suits which family.',
    competitorSummary: 'Wolsey Hall Oxford is a UK-based distance learning school founded in 1894. They are Cambridge-approved and serve students worldwide with self-paced courseware, tutor feedback by email, and a 1:1 assigned-tutor model. Their alumni include Nelson Mandela. They state on their own website that they have no live lessons, no set timetables, and no fixed classroom sessions — their pupil-led approach is designed around complete student-set scheduling.',
    keyDifference: 'Wolsey Hall is self-paced. Smartious is live. Both models work — for different children, different family situations, and different learning styles.',
    table: [
      { feature: 'Founded',           wolsey: '1894',                                        smartious: '2018' },
      { feature: 'Headquarters',      wolsey: 'Oxford, UK',                                  smartious: 'Nairobi, Kenya' },
      { feature: 'Learning model',    wolsey: 'Self-paced courseware',                       smartious: 'Live daily classes' },
      { feature: 'Live lessons',      wolsey: 'No',                                          smartious: 'Yes — every school day' },
      { feature: 'Teacher access',    wolsey: 'Assigned tutor, email feedback',              smartious: 'Live teachers + real-time chat' },
      { feature: 'Class rhythm',      wolsey: 'Student sets own schedule',                   smartious: 'Structured weekly timetable' },
      { feature: 'Peer interaction',  wolsey: 'Community areas, virtual library',            smartious: 'Live classmates, group activities' },
      { feature: 'Curricula',         wolsey: 'Cambridge IGCSE, A-Level, Primary',           smartious: 'Cambridge, Edexcel, IB Diploma, American, BNC' },
      { feature: 'Annual tuition',    wolsey: 'From ~USD 1,300 to USD 2,700',                smartious: 'USD 4,000 to USD 6,000 full programme' },
      { feature: 'Sibling discount',  wolsey: 'Yes — 10%',                                   smartious: 'Yes' },
      { feature: 'Enrichment activities', wolsey: 'Clubs, virtual library',                  smartious: 'Wednesday programme (2–4 PM) — sports, clubs, arts' },
      { feature: 'Physical centre',   wolsey: 'No',                                          smartious: 'Yes — Parklands, Nairobi' },
      { feature: 'University support',wolsey: 'A-Level tutor feedback',                      smartious: 'IUFP + Study Abroad + UCAS/Common App' },
      { feature: 'Africa diaspora focus', wolsey: 'No specific focus',                       smartious: 'Yes — built in Nairobi for global African families' },
      { feature: 'Course books included', wolsey: 'Yes',                                     smartious: 'Digital + recommended texts' },
    ],
    competitorStrengths: [
      ['130 years of heritage',     'One of the longest-established distance learning schools in the world. Cambridge-approved status carries weight.'],
      ['1:1 assigned tutor model',  'A dedicated tutor reviews and feeds back on every assignment. Strong for self-directed learners.'],
      ['Course books included',     'Physical textbooks shipped to UK students (other destinations quoted) — a unique inclusion.'],
      ['Special educational needs', 'Their Learning Support Manager is qualified to write exam-board SEN reports.'],
      ['Notable alumni',            'Nelson Mandela and 750,000+ enrolled students across their history.'],
    ],
    smartiousAdvantages: [
      ['Live, every school day',    'Children join real classes with real teachers and real classmates — not pre-recorded videos. The rhythm of live teaching is how most children actually learn best.'],
      ['Wider curriculum range',    'Cambridge IGCSE and A-Level, plus IB Diploma, Pearson Edexcel, American High School Diploma, BNC and KE CBC. Wolsey Hall is Cambridge-only.'],
      ['Same-day teacher access',   'Smartious teachers are available during live lessons and through the platform every day — not just by email with 24-72 hour turnaround.'],
      ['Wednesday enrichment',      'Two protected hours every week for sports, music, coding, debate, leadership. The kind of holistic education premium private schools charge a fortune to provide.'],
      ['African diaspora identity', 'Built in Nairobi for families across Kenya, the UAE, UK, Canada, Australia, Nigeria, South Africa and beyond. Cultural relevance the heritage British options can\'t match.'],
      ['Physical learning centre',  'Hybrid option for Nairobi-based families: our Parklands centre offers supervised study with on-site teachers, in addition to the online programme.'],
      ['Real-time progress reports','Weekly written parent reports plus a live dashboard. You see what your child is doing, when they do it.'],
    ],
    whichForWho: [
      { who: 'Wolsey Hall suits',     reasons: ['Older, naturally self-motivated learners who thrive working independently', 'Families wanting the heritage prestige and Cambridge-approved status', 'Adult learners returning to qualifications', 'Children with very specific scheduling constraints (elite athletes, travelling families) who need full flexibility'] },
      { who: 'Smartious suits',       reasons: ['Children who learn best with the rhythm of live classes and peers', 'Families who want enrichment activities included (sports, clubs, leadership)', 'African and diaspora families wanting an internationally recognised online school with cultural relevance', 'Families seeking IGCSE through to university admissions, not just Cambridge', 'Parents who want real-time visibility on what their child is studying and how'] },
    ],
    testimonial: {
      videoId: 'sBOgk274_eQ',
      title: 'A Smartious family story',
      summary: 'Hear directly from a Smartious family about their experience with live online learning. Tap to watch.',
    },
    faqs: [
      { q: 'Is Smartious accredited like Wolsey Hall?',
        a: 'Yes. Smartious students sit Cambridge International, Pearson Edexcel, IB Diploma and American High School Diploma examinations at registered British Council and Cambridge International centres worldwide. The qualifications earned are identical to those from any other school using the same exam boards.' },
      { q: 'How can Smartious offer live classes at this price?',
        a: 'Our model is built for global delivery from day one — qualified specialists teaching live across multiple time zones with shared cohorts. We don\'t pay for physical buildings (beyond our Parklands centre), uniforms, transport or admin overhead that traditional schools carry. That efficiency is passed to families through lower fees.' },
      { q: 'Can my child join Smartious if they\'re used to Wolsey Hall\'s self-paced model?',
        a: 'Yes. Many of our students have transferred from self-paced online schools. Our admissions team assesses where your child is in their curriculum and places them at the right point. The shift from solo self-paced to live cohort learning takes most students a week or two to adjust, and outcomes typically improve.' },
      { q: 'Does Smartious work for families with travelling schedules like Wolsey Hall does?',
        a: 'Yes. Live classes are recorded for asynchronous catch-up when family schedules don\'t allow attendance. Most live classes are scheduled at times that suit students across our main regions (East Africa, Middle East, UK, Canada, Australia). Travelling families maintain continuity by joining live where possible and reviewing recordings otherwise.' },
      { q: 'Which is better for IGCSE — Smartious or Wolsey Hall?',
        a: 'Both deliver Cambridge IGCSE qualifications. Wolsey Hall is better if you have a highly self-motivated child who learns well alone and you value the heritage brand. Smartious is better if you want live classes, peer interaction, a wider curriculum range (IB, American, Edexcel beyond Cambridge), and a structured weekly rhythm. Many families choose by curriculum + learning style fit rather than brand alone.' },
      { q: 'What about Wolsey Hall\'s 130-year history?',
        a: 'It\'s real and impressive. We don\'t compete on heritage — we compete on the live-class model, the breadth of curricula, the Wednesday enrichment programme, and our African diaspora positioning. If 130 years of brand matters most to your family, Wolsey Hall has that. If live teaching and a vibrant student community matter more, Smartious is the better fit.' },
    ],
  },
]



// ════════════════════════════════════════════════════════════
// SERVICE DETAIL CONTENT
// Full detail for each service-delivery model. Drafted from the
// existing service cards — Alfred to review and edit wording.
// Each entry: slug, h (name), svg icon, desc (card teaser), tags,
// seoTitle, seoDesc, and a `detail` block.
// ════════════════════════════════════════════════════════════

// ── PAGE_META — per-page SEO titles & descriptions ─────────
// Keyword-rich titles and descriptions for each core landing
// page. Curriculum and service detail pages derive their meta
// from CURRICULA / SERVICES. Edit freely to refine targeting.
const SITE = 'Smartious Homeschool & eSchool'
const PAGE_META = {
  home: {
    title: 'Online Homeschool | IGCSE, A-Level, IB & American — Smartious',
    desc: 'Accredited online homeschool serving UAE, UK, Canada, Australia, Nigeria and Kenya. Cambridge IGCSE, A-Level, IB Diploma, Edexcel and American curricula. Live classes, qualified teachers, from USD 85/month.',
  },
  about: {
    title: 'About Smartious | Homeschooling & eSchool in Nairobi, Kenya',
    desc: 'Learn about Smartious Homeschool & eSchool — an international online school founded in Nairobi, delivering accredited curricula to families across Kenya and the diaspora since 2018.',
  },
  curricula: {
    title: 'Curricula | IGCSE, A-Level, IB, Edexcel & CBC — Smartious',
    desc: 'Explore the curricula offered by Smartious — Cambridge IGCSE and A-Level, IB Diploma, Pearson Edexcel, the British and American curricula, and Kenya\'s CBC. Taught by degree-qualified specialists.',
  },
  services: {
    title: 'Our Services | Homeschooling, Online School & Tuition — Smartious',
    desc: 'Smartious services — homeschooling at home, the Parklands learning centre, the online Virtual School, private tuition, the Mshauri AI tutor, and intensive exam preparation.',
  },
  pricing: {
    title: 'Fee Structure 2026 | Homeschool & Tuition Fees — Smartious',
    desc: 'Smartious 2026 fee structure — transparent monthly, termly and annual fees for homeschool programmes, A-Level, IB, single subjects and private tuition.',
  },
  programs: {
    title: 'Programmes | Homeschool, Tuition, IUFP & Study Abroad — Smartious',
    desc: 'Smartious programmes — full homeschooling, private tuition, the International University Foundation Programme (IUFP) and study-abroad placement support.',
  },
  activities: {
    title: 'Student Activities, Sports & Enrichment — Smartious Homeschool',
    desc: 'Beyond academics — Smartious students join weekly Wednesday activities including swimming, basketball, football, badminton, tennis, archery, coding, robotics, debate, music, art and leadership clubs. Premium enrichment for global learners.',
  },
  global: {
    title: 'Global Online School for Diaspora Families — Smartious',
    desc: 'Smartious delivers accredited online education to African diaspora families in the UK, UAE, USA and Canada — internationally recognised curricula, taught live from Nairobi.',
  },
  faq: {
    title: 'Frequently Asked Questions | Homeschooling — Smartious',
    desc: 'Answers to common questions about homeschooling with Smartious — curricula, fees, enrolment, the online school, tutors and examinations.',
  },
  blog: {
    title: 'Blog & Resources | Homeschooling & Curricula — Smartious',
    desc: 'Expert articles from Smartious on homeschooling, choosing a curriculum, exam preparation and AI-supported learning for families in Kenya and worldwide.',
  },
  teachers: {
    title: 'Meet Our Teachers | Qualified Homeschool Tutors — Smartious',
    desc: 'Meet the Smartious teaching team — qualified, experienced subject specialists delivering Cambridge IGCSE, A-Level, IB and CBC education to students in Kenya and worldwide.',
  },
  enroll: {
    title: 'Enroll Now | Begin Homeschooling with Smartious',
    desc: 'Enroll with Smartious Homeschool & eSchool. Start your child\'s accredited home or online education — Cambridge, IB, Edexcel or CBC — with qualified specialist teachers.',
  },
  consult: {
    title: 'Book a Free Consultation — Smartious Homeschool & eSchool',
    desc: 'Book a free consultation with Smartious to discuss homeschooling, curricula and the right programme for your child — online or at our Parklands, Nairobi centre.',
  },
  contact: {
    title: 'Contact Smartious Homeschool & eSchool — Nairobi, Kenya',
    desc: 'Contact Smartious Homeschool & eSchool. Reach our Parklands, Nairobi team by phone, email or WhatsApp for enrolment, curricula and programme enquiries.',
  },
}


// ═══════════════════════════════════════════════════════════
// LEGAL POLICIES — Kenya DPA 2019 + EU GDPR compliant
// ═══════════════════════════════════════════════════════════
const PRIVACY_POLICY = [
  {h:'1. Who we are',p:'Smartious E-School Ltd ("Smartious", "we", "us", "our") is a private limited company registered in Kenya, with its principal place of business at Diamond Plaza I, Parklands, Nairobi. We operate the website smartioushomeschool.com and deliver homeschool, online and private tuition services to students worldwide. For the purposes of Kenya\'s Data Protection Act, 2019 and the EU General Data Protection Regulation (GDPR), Smartious is the Data Controller of the personal data you share with us.'},
  {h:'2. What personal data we collect',p:'We collect only the data we genuinely need to deliver education and communicate with families. This includes: (a) contact and identification data — student and parent names, email addresses, WhatsApp numbers, student date of birth, country of residence; (b) academic data — curriculum selection, current school, grade level, placement assessment answers and scores, progress reports; (c) payment data — we do not store full card numbers; Paystack processes all payments and we receive only the transaction reference and amount; (d) technical data — IP address, browser type, device type, pages visited, collected via cookies and analytics; (e) communication records — messages you send us by email, WhatsApp, contact form, or during consultation calls.'},
  {h:'3. How we use your data',p:'We use personal data only for: (i) delivering the programme you have enrolled in — matching tutors, scheduling lessons, issuing progress reports, sitting exams; (ii) communicating with you about your account, lessons, payments, and service updates; (iii) processing payments via Paystack; (iv) improving our website and teaching methods through anonymised analytics; (v) complying with Kenyan tax, education, and regulatory obligations. We do not sell personal data to third parties. Ever.'},
  {h:'4. Lawful basis for processing',p:'Under Article 6 of the GDPR and Section 30 of the Kenya Data Protection Act, we process your data on one of the following lawful bases: (a) Contract — to deliver the services you have enrolled in; (b) Consent — for marketing communications, which you can withdraw at any time; (c) Legitimate interests — for securing our systems, preventing fraud, and improving our services; (d) Legal obligation — for tax records, accounting, and regulatory compliance.'},
  {h:'5. Who we share your data with',p:'We share data only with parties essential to service delivery: (i) our assigned tutors and assessment teachers, who see only the data needed to teach your child; (ii) Paystack (Paystack Payments Limited, Lagos & Nairobi) for payment processing; (iii) Google (Firebase, Gmail, Drive) for our backend infrastructure, subject to Google\'s Cloud Data Processing Addendum; (iv) FormSubmit.co for form delivery; (v) MongoDB Atlas for database hosting; (vi) Netlify and Render for website and API hosting. All processors are bound by data processing agreements. We require them to meet or exceed our own data protection standards.'},
  {h:'6. International transfers',p:'Some of our processors (Google, MongoDB Atlas, Netlify, Render) store data in the US or EU. Where data is transferred outside Kenya or the European Economic Area, we rely on appropriate safeguards — Standard Contractual Clauses approved by the European Commission, or equivalent mechanisms under the Kenya DPA — to ensure your data receives equivalent protection.'},
  {h:'7. How long we keep your data',p:'We keep data only as long as needed: (a) active student records — for the duration of enrolment plus 7 years after the last lesson, to comply with Kenyan tax law and academic record-keeping standards; (b) enquiry and consultation records — 24 months from last contact; (c) marketing subscribers — until you unsubscribe; (d) website analytics — 26 months (Google Analytics default). After these periods, data is securely deleted or anonymised.'},
  {h:'8. Your rights',p:'Both the Kenya Data Protection Act and the GDPR give you the following rights: (i) Access — request a copy of all personal data we hold about you; (ii) Rectification — correct inaccurate data; (iii) Erasure — request deletion of your data, subject to our legal retention obligations; (iv) Restriction — limit how we process your data; (v) Portability — receive your data in a machine-readable format; (vi) Objection — object to specific types of processing, especially marketing; (vii) Withdraw consent at any time. To exercise any right, email hellosmartious@gmail.com. We respond within 30 days as required by law.'},
  {h:'9. Data of minors',p:'Because many of our students are under 18, parental consent is required before any child is enrolled or assessed. The parent is the primary account holder and the primary contact. We do not knowingly collect personal data directly from children under 13 without parental involvement. If you believe we have done so inadvertently, contact us and we will delete the data immediately.'},
  {h:'10. Security',p:'We use industry-standard safeguards: HTTPS (TLS 1.3) across the entire site, password hashing (bcrypt) for all accounts, role-based access control in our backend, encrypted database backups, and quarterly security reviews. Paystack handles payment data to PCI-DSS Level 1 standards — we never see or store full card details. No system is perfectly secure, but we work continuously to reduce risk.'},
  {h:'11. Breach notification',p:'In the unlikely event of a personal data breach affecting your rights, we will notify the Office of the Data Protection Commissioner (Kenya) within 72 hours as required by Section 43 of the Kenya DPA, and the affected individuals without undue delay, describing what happened, what data was affected, and the steps we are taking.'},
  {h:'12. Changes to this policy',p:'We may update this policy to reflect changes in law, our services, or our processors. When we make material changes we will notify active students and parents by email and update the "Effective" date at the top of this page. The most current version is always the one published here.'},
  {h:'13. Contact & complaints',p:'For any privacy question, data subject request, or complaint, email our Data Protection point of contact: hellosmartious@gmail.com, phone +254 745 021 212, or write to Smartious E-School Ltd, Diamond Plaza I, Parklands, Nairobi, Kenya. You also have the right to lodge a complaint with the Office of the Data Protection Commissioner of Kenya (odpc.go.ke) or, if you are in the EU, with your national data protection authority.'},
]

const TERMS_OF_SERVICE = [
  {h:'1. About these terms',p:'These Terms of Service ("Terms") govern your use of smartioushomeschool.com and any educational services provided by Smartious E-School Ltd ("Smartious"). By enrolling a student, creating an account, or using any part of our website or services, you agree to these Terms. If you do not agree, please do not use our services.'},
  {h:'2. Eligibility',p:'To enrol a student, you must be the student\'s parent or legal guardian and at least 18 years old. Students under 18 cannot create an account without parental consent. We reserve the right to verify identity at any stage, particularly before releasing academic records or issuing predicted grades.'},
  {h:'3. Enrolment and assessment',p:'Enrolment begins when you submit the enrolment form and pay the $15 placement assessment fee. The assessment fee is non-refundable once the placement test has been served, but counts towards your first month of tuition if you proceed to enrol. We aim to match a tutor within 48 working hours of a completed assessment.'},
  {h:'4. Fees and payment',p:'All fees are stated in US Dollars. Local currency equivalents (e.g. KES for Kenyan families) are shown for convenience but the dollar price is the contractual amount. Fees are payable in advance — monthly, termly, or annually as selected. Termly payments attract a 5% discount; annual payments attract a 12% discount. Payments are processed via Paystack. We accept M-Pesa, Visa, Mastercard, bank transfer, and Apple Pay.'},
  {h:'5. Cancellation and refunds',p:'You may cancel your enrolment with 30 days\' written notice. Within the first 14 days of enrolment, you may cancel for any reason and receive a full refund of any unused tuition. After 14 days, refunds are prorated to the next billing period minus any assessment or setup fees already delivered. Termly and annual payments are refunded for the unused balance only. The $15 placement fee is not refundable once the assessment has been served.'},
  {h:'6. Your obligations',p:'You agree to: (i) provide accurate information when enrolling; (ii) ensure your child attends scheduled lessons or gives reasonable notice for cancellations; (iii) provide a safe, supervised environment for home-visit tuition in Nairobi; (iv) treat Smartious staff, tutors, and our digital platforms with respect; (v) not share your portal login credentials with anyone outside your household; (vi) not record, reproduce, or redistribute our teaching materials or live lessons without written permission.'},
  {h:'7. Our obligations',p:'Smartious will: (i) deliver lessons, materials, and assessments as described in your enrolment package; (ii) provide qualified, background-checked tutors; (iii) keep academic records for at least 7 years; (iv) issue progress reports as specified in your plan; (v) communicate any material changes at least 30 days in advance; (vi) act in the student\'s best academic interests at all times.'},
  {h:'8. Intellectual property',p:'All content published by Smartious — teaching materials, lesson recordings, assessment banks, software, the Mshauri AI tutor, and the website itself — is the intellectual property of Smartious E-School Ltd or our licensors. You may use this content only within your own household for the enrolled student\'s education. Commercial use, redistribution, or resale is strictly prohibited and may result in termination of services and legal action. Past papers and marking schemes are the property of their respective exam boards (Cambridge, Edexcel, IB) and are reproduced under licence or fair-dealing provisions.'},
  {h:'9. Tutor availability and substitution',p:'We strive to match each student to the same dedicated tutor for the duration of enrolment. Where a tutor becomes unavailable (illness, relocation, resignation), we will provide a qualified substitute and notify you as soon as reasonably possible. No refunds are issued for minor, temporary substitutions; extended changes may entitle you to a prorated refund or free rematching.'},
  {h:'10. Code of conduct',p:'We reserve the right to suspend or terminate services — without refund — if a parent or student engages in abusive, discriminatory, or harassing behaviour towards our staff or tutors; attempts to defraud or deceive Smartious; or repeatedly breaches these Terms after written warning. This is rare, but necessary to protect our team.'},
  {h:'11. Limitation of liability',p:'To the maximum extent permitted by Kenyan law, Smartious is not liable for: (i) exam results or university admissions — our role is to teach and prepare; outcomes depend on many factors including the student\'s effort and the decisions of exam boards and universities; (ii) indirect, consequential, or punitive damages; (iii) delays or outages caused by third-party services (Paystack, Google, Netlify). Our total liability for any claim is limited to the fees you have paid us in the 12 months preceding the claim.'},
  {h:'12. Governing law',p:'These Terms are governed by the laws of Kenya. Any dispute arising from these Terms or our services will be resolved first by good-faith negotiation, then by mediation in Nairobi under the Mediation (Court-Annexed) Rules, and only then by the courts of Kenya, which have exclusive jurisdiction.'},
  {h:'13. Changes to these terms',p:'We may update these Terms from time to time. Material changes will be communicated to active students and parents at least 30 days in advance by email. Minor clarifications (typos, reformatting) may be made without notice. The current version is always published here with its effective date.'},
  {h:'14. Contact',p:'Questions about these Terms: hellosmartious@gmail.com, +254 745 021 212, or Diamond Plaza I, Parklands, Nairobi, Kenya.'},
]

const COOKIE_POLICY = [
  {h:'1. What are cookies?',p:'Cookies are small text files placed on your device when you visit a website. They allow the site to remember actions and preferences (such as login, language, font size, and other display preferences) over time, so you don\'t have to re-enter them every time you return. Cookies may be "session" cookies (deleted when you close your browser) or "persistent" cookies (stored until they expire or you delete them).'},
  {h:'2. Cookies we use',p:'Smartious uses a small number of carefully chosen cookies in four categories: (a) strictly necessary — authentication tokens, CSRF protection, session state. These cannot be switched off as the site will not work without them; (b) functional — remembers your preferences such as billing cycle selection, blog category filters; (c) analytics — Google Analytics 4 collects anonymous, aggregated data about how visitors use the site so we can improve it. We have IP anonymisation enabled; (d) payment — Paystack sets cookies during checkout to prevent fraud and maintain the payment session. These are set only on the payment step.'},
  {h:'3. Third-party cookies',p:'When you load pages that embed third-party content — the Paystack checkout iframe, a YouTube video on the blog, a Google Map of our Nairobi centre — those third parties may set their own cookies. We do not control these. You can review their policies at paystack.com/privacy, policies.google.com, and similar.'},
  {h:'4. Your choices',p:'You can control cookies three ways: (i) in your browser settings — most browsers let you block all cookies, block third-party cookies, or delete cookies on exit; (ii) through our cookie banner (for EU/UK visitors) — you can accept all, accept only essential, or customise by category; (iii) by opting out of Google Analytics at tools.google.com/dlpage/gaoptout. Blocking strictly necessary cookies will prevent you from logging into the portal or completing enrolment.'},
  {h:'5. Do Not Track',p:'Our site respects the "Do Not Track" browser signal for analytics cookies. If your browser sends a DNT signal, Google Analytics does not fire.'},
  {h:'6. Changes to this policy',p:'If we add or remove cookies, we will update this page and, for EU/UK visitors, re-request consent via our cookie banner. The effective date at the top of this page reflects the most recent revision.'},
  {h:'7. Questions',p:'For any cookie-related question, email hellosmartious@gmail.com.'},
]

const GDPR_COMPLIANCE = [
  {h:'1. GDPR in plain English',p:'The EU General Data Protection Regulation (GDPR) is the world\'s strictest privacy law. It applies to Smartious whenever we process personal data of people in the European Union — for example, a family who moves to Germany while their child is enrolled with us, or a parent in France enquiring about IUFP. Kenya\'s own Data Protection Act, 2019 is closely modelled on the GDPR, so the rights described here apply to all our students regardless of country.'},
  {h:'2. Your rights under GDPR',p:'As a data subject, you have eight specific rights: (i) the right to be informed — which is what this page is for; (ii) the right of access — you can request a copy of everything we hold about you; (iii) the right to rectification — correct inaccurate data; (iv) the right to erasure ("right to be forgotten") — ask us to delete your data, subject to legal retention obligations like tax records; (v) the right to restrict processing — pause our use of your data while a dispute is resolved; (vi) the right to data portability — receive your data in a machine-readable format to transfer to another provider; (vii) the right to object — to direct marketing or to processing based on legitimate interests; (viii) rights related to automated decision-making — we do not make any decision about your child based solely on automated processing, so this right does not currently come into play.'},
  {h:'3. Our lawful bases',p:'We process personal data on one of four lawful bases under Article 6 GDPR: (a) Contract — processing necessary to deliver the educational services you have enrolled in; (b) Consent — for optional marketing emails and analytics cookies, which you can withdraw at any time; (c) Legitimate interests — for preventing fraud, securing our systems, and improving our services, where our interests do not override your rights; (d) Legal obligation — for tax and regulatory record-keeping.'},
  {h:'4. Data Protection Officer',p:'Because Smartious is not a large-scale processor of special-category data, we are not legally required to appoint a formal Data Protection Officer. We have instead designated a Data Protection Point of Contact: Alfred Ouko (Founder), reachable at hellosmartious@gmail.com or +254 745 021 212. All data subject requests are handled by this contact.'},
  {h:'5. Transfers outside the EEA',p:'We are based in Kenya. Data you share with us crosses the EU–Kenya border. Kenya does not yet have a formal adequacy decision from the European Commission. We rely on the European Commission\'s Standard Contractual Clauses (SCCs) as the lawful safeguard for transfers. Our third-party processors (Google, MongoDB, Netlify, Render, Paystack) are all bound by SCCs or equivalent frameworks and meet or exceed EU data protection standards.'},
  {h:'6. Data minimisation',p:'We collect the minimum data necessary for each purpose. For example, we ask for a student\'s date of birth to assign the correct academic level, but we do not ask for national ID numbers or passport details unless required for university applications. We routinely delete data we no longer need.'},
  {h:'7. Breach notification',p:'Under Article 33 GDPR, we will notify the competent supervisory authority of a personal data breach within 72 hours of becoming aware of it, unless the breach is unlikely to result in a risk to the rights and freedoms of individuals. Under Article 34, we will notify affected individuals without undue delay if the breach is likely to result in a high risk. We will describe what happened, what data was affected, the likely consequences, and the steps we are taking.'},
  {h:'8. Exercising your rights',p:'To exercise any GDPR right — access, rectification, erasure, restriction, portability, objection — email hellosmartious@gmail.com. Include: (a) the right you wish to exercise; (b) enough information for us to verify your identity (email associated with your Smartious account, plus one recent transaction reference if applicable); (c) any specific details about the request. We respond within 30 days. This service is free unless requests are manifestly unfounded or excessive, in which case we may charge a reasonable fee or refuse to act.'},
  {h:'9. Complaints',p:'If you believe we have not handled your personal data properly, we want to hear first and put it right. Email hellosmartious@gmail.com. If you remain dissatisfied, you have the right to lodge a complaint with: (i) the Office of the Data Protection Commissioner of Kenya at odpc.go.ke; (ii) the data protection authority of your EU country of residence — a list is maintained at edpb.europa.eu/about-edpb/board/members.'},
  {h:'10. Effective date & reviews',p:'This page was last reviewed on 20 April 2026. We review our GDPR compliance at least once every 12 months and whenever we materially change how we process data.'},
]

// Reusable legal page shell — consistent design, readable typography, back button
// ═══════════════════════════════════════════════════════════
// COUNTRY DIALLING CODES (for phone / WhatsApp input)
// Kenya first (default), then the markets we serve most, then the rest alphabetical.
// ═══════════════════════════════════════════════════════════
const COUNTRY_CODES = [
  {code:'+254', flag:'🇰🇪', name:'Kenya'},
  {code:'+256', flag:'🇺🇬', name:'Uganda'},
  {code:'+255', flag:'🇹🇿', name:'Tanzania'},
  {code:'+250', flag:'🇷🇼', name:'Rwanda'},
  {code:'+251', flag:'🇪🇹', name:'Ethiopia'},
  {code:'+234', flag:'🇳🇬', name:'Nigeria'},
  {code:'+233', flag:'🇬🇭', name:'Ghana'},
  {code:'+27',  flag:'🇿🇦', name:'South Africa'},
  {code:'+20',  flag:'🇪🇬', name:'Egypt'},
  {code:'+971', flag:'🇦🇪', name:'United Arab Emirates'},
  {code:'+966', flag:'🇸🇦', name:'Saudi Arabia'},
  {code:'+974', flag:'🇶🇦', name:'Qatar'},
  {code:'+44',  flag:'🇬🇧', name:'United Kingdom'},
  {code:'+1',   flag:'🇺🇸', name:'United States / Canada'},
  {code:'+61',  flag:'🇦🇺', name:'Australia'},
  {code:'+49',  flag:'🇩🇪', name:'Germany'},
  {code:'+33',  flag:'🇫🇷', name:'France'},
  {code:'+31',  flag:'🇳🇱', name:'Netherlands'},
  {code:'+353', flag:'🇮🇪', name:'Ireland'},
  {code:'+34',  flag:'🇪🇸', name:'Spain'},
  {code:'+39',  flag:'🇮🇹', name:'Italy'},
  {code:'+86',  flag:'🇨🇳', name:'China'},
  {code:'+91',  flag:'🇮🇳', name:'India'},
  {code:'+81',  flag:'🇯🇵', name:'Japan'},
  {code:'+82',  flag:'🇰🇷', name:'South Korea'},
  {code:'+65',  flag:'🇸🇬', name:'Singapore'},
  {code:'+60',  flag:'🇲🇾', name:'Malaysia'},
  {code:'+62',  flag:'🇮🇩', name:'Indonesia'},
  {code:'+63',  flag:'🇵🇭', name:'Philippines'},
  {code:'+66',  flag:'🇹🇭', name:'Thailand'},
  {code:'+90',  flag:'🇹🇷', name:'Türkiye'},
  {code:'+7',   flag:'🇷🇺', name:'Russia'},
  {code:'+55',  flag:'🇧🇷', name:'Brazil'},
  {code:'+52',  flag:'🇲🇽', name:'Mexico'},
  {code:'+64',  flag:'🇳🇿', name:'New Zealand'},
]

// Reusable phone-with-country-code input.
// `value` is the full E.164-style string (e.g. "+254745021212"),
// onChange receives the combined string.
function PhoneInput({ value, onChange, placeholder = '7XX XXX XXX', tone = 'light' }) {
  // Parse incoming value into code + local so the initial render is correct
  const initialParsed = (() => {
    const v = value || ''
    if (!v) return { code: '+254', local: '' }
    const match = COUNTRY_CODES
      .map(c => c.code)
      .sort((a,b) => b.length - a.length)
      .find(c => v.startsWith(c))
    if (match) return { code: match, local: v.slice(match.length).trimStart() }
    return { code: '+254', local: v }
  })()

  // Use local state for the input so typing is never blocked by the parent's regex
  const [code,  setCode]  = useState(initialParsed.code)
  const [local, setLocal] = useState(initialParsed.local)

  // Sync to parent — keep the local value exactly as typed, just prepend the code on output
  const emit = (nextCode, nextLocal) => {
    setCode(nextCode)
    setLocal(nextLocal)
    const trimmed = (nextLocal || '').trim()
    onChange(trimmed ? `${nextCode} ${trimmed}` : nextCode)
  }

  const isLight = tone === 'light'
  const baseBg      = isLight ? '#FEFDFB' : 'rgba(255,255,255,.05)'
  const baseBorder  = isLight ? '#DDD5C6' : 'rgba(255,255,255,.1)'
  const textColor   = isLight ? '#0A0806' : '#FFFFFF'
  const placeColor  = isLight ? '#8A7B6E' : 'rgba(255,255,255,.4)'
  const baseSepBg   = isLight ? '#F7F3ED' : 'rgba(10,8,6,.3)'

  return (
    <div style={{display:'flex',border:`1.5px solid ${baseBorder}`,borderRadius:8,overflow:'hidden',background:baseBg,fontFamily:"'Syne',sans-serif"}}>
      <select
        value={code}
        onChange={e => emit(e.target.value, local)}
        style={{padding:'11px 10px',border:'none',background:baseSepBg,color:textColor,fontSize:13.5,fontWeight:600,cursor:'pointer',outline:'none',borderRight:`1px solid ${baseBorder}`,minWidth:110,fontFamily:"'Syne',sans-serif"}}
      >
        {COUNTRY_CODES.map(c => (
          <option key={c.code + c.name} value={c.code} style={{background:'#FEFDFB',color:'#0A0806'}}>
            {c.flag} {c.code} {c.name}
          </option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={local}
        onChange={e => emit(code, e.target.value)}
        placeholder={placeholder}
        style={{flex:1,padding:'11px 14px',border:'none',background:'transparent',color:textColor,caretColor:textColor,fontSize:14,outline:'none',fontFamily:"'Syne',sans-serif",minWidth:0,WebkitTextFillColor:textColor}}
      />
    </div>
  )
}

function LegalPage({ P, title, em, subtitle, effective, sections }) {
  return (
    <>
      <div className="pg-hero">
        <div className="wrap">
          <div className="eyebrow">Legal</div>
          <h1 className="pg-h">{title} <em>{em}</em></h1>
          <p className="pg-sub" style={{marginTop:12}}>{subtitle}</p>
          <div style={{marginTop:18,fontSize:12,color:'rgba(247,243,237,.45)',fontFamily:"'Syne Mono',monospace",letterSpacing:'.08em'}}>
            Effective: {effective} &nbsp;·&nbsp; Smartious E-School Ltd &nbsp;·&nbsp; Diamond Plaza I, Parklands, Nairobi
          </div>
        </div>
      </div>
      <section className="sec" style={{background:'#F7F3ED',padding:'72px 20px'}}>
        <div style={{maxWidth:820,margin:'0 auto',background:'#FEFDFB',border:'1px solid #DDD5C6',borderRadius:16,padding:'48px 44px',boxShadow:'0 4px 24px rgba(10,8,6,.04)'}}>
          {/* Quick-jump TOC */}
          <div style={{background:'#F7F3ED',border:'1px solid #DDD5C6',borderRadius:10,padding:'18px 20px',marginBottom:36}}>
            <div style={{fontSize:11,fontWeight:700,color:'#8B1A2E',letterSpacing:'.14em',textTransform:'uppercase',marginBottom:10}}>On this page</div>
            <ol style={{margin:0,paddingLeft:18,columns:2,columnGap:24,fontSize:13,lineHeight:1.9,color:'#2D261E',fontFamily:"'Syne',sans-serif"}}>
              {sections.map((s, i) => (
                <li key={i} style={{breakInside:'avoid',listStyleType:'decimal'}}>
                  <a href={`#sec-${i}`} style={{color:'#2D261E',textDecoration:'none',transition:'color .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.color='#8B1A2E'}
                    onMouseLeave={e=>e.currentTarget.style.color='#2D261E'}>
                    {s.h.replace(/^\d+\.\s*/, '')}
                  </a>
                </li>
              ))}
            </ol>
          </div>

          {sections.map((s, i) => (
            <section key={i} id={`sec-${i}`} style={{marginBottom:32,scrollMarginTop:96}}>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',fontWeight:700,color:'#0A0806',marginBottom:12,letterSpacing:'-.005em'}}>
                {s.h}
              </h2>
              <p style={{fontSize:14.5,color:'#2D261E',lineHeight:1.85,fontFamily:"'Syne',sans-serif",margin:0}}>
                {s.p}
              </p>
            </section>
          ))}

          <div style={{marginTop:48,paddingTop:24,borderTop:'1px solid #DDD5C6',textAlign:'center'}}>
            <div style={{fontSize:12,color:'#8A7B6E',marginBottom:14}}>
              Have a question about this policy? We'd rather hear from you than have you worry.
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
              <button className="btn-p" onClick={() => P('contact')}>Contact Us</button>
              <a className="btn-o" href="mailto:hellosmartious@gmail.com" style={{textDecoration:'none'}}>Email Privacy Team</a>
            </div>
          </div>
        </div>

        {/* Other legal pages navigation */}
        <div style={{maxWidth:820,margin:'32px auto 0',display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
          {[['privacy','Privacy Policy'],['terms','Terms of Service'],['cookies','Cookie Policy'],['gdpr','GDPR']].map(([id,lbl]) => (
            <button key={id} onClick={() => P(id)} style={{padding:'8px 16px',border:'1px solid #DDD5C6',background:'#FEFDFB',color:'#2D261E',fontSize:12.5,fontWeight:600,borderRadius:20,cursor:'pointer',fontFamily:"'Syne',sans-serif",transition:'all .2s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#8B1A2E';e.currentTarget.style.color='#8B1A2E'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#DDD5C6';e.currentTarget.style.color='#2D261E'}}>
              {lbl}
            </button>
          ))}
        </div>
      </section>
      <Footer P={P}/>
    </>
  )
}

export default function LandingPage() {
  const store = useStore()
  const cfg   = store.siteConfig  // live site config from admin editor
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Preload Paystack inline.js so the payment modal opens instantly when user reaches Step 3
  useEffect(() => {
    if (window.PaystackPop) return
    if (document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) return
    const s = document.createElement('script')
    s.src = 'https://js.paystack.co/v1/inline.js'
    s.async = true
    document.body.appendChild(s)
  }, [])

  const [page, setPage] = useState('home')

  useEffect(() => {
    let observer
    // Wait for React to paint the new page's elements before observing,
    // otherwise querySelectorAll runs before the .reveal nodes exist and
    // above-the-fold cards never get the .visible class.
    const raf = requestAnimationFrame(() => {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
      }, { threshold: 0.12 })
      const els = document.querySelectorAll('.lp .reveal')
      els.forEach(el => {
        // Reveal anything already within the viewport immediately —
        // an IntersectionObserver will not fire for elements that are
        // already on screen and never scrolled into view.
        const r = el.getBoundingClientRect()
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add('visible')
        }
        observer.observe(el)
      })
    })
    return () => {
      cancelAnimationFrame(raf)
      if (observer) observer.disconnect()
    }
  }, [page])
  const [faqOpen, setFaqOpen] = useState(null)
  const [priceTabs, setPriceTab] = useState('full')
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [blogCat, setBlogCat] = useState('all')
  const [blogCountry, setBlogCountry] = useState('all')
  const [currentArticle, setCurrentArticle] = useState(null)
  const [currentCurriculum, setCurrentCurriculum] = useState(null)
  const [currentService, setCurrentService] = useState(null)
  const [currentCountry, setCurrentCountry] = useState(null)
  const [currentCompare, setCurrentCompare] = useState(null)
  const [publicTeachers, setPublicTeachers] = useState([])
  const [teachersLoading, setTeachersLoading] = useState(false)
  const [teachersLoaded, setTeachersLoaded] = useState(false)
  const [expandedTeacher, setExpandedTeacher] = useState(null)
  const [wizStep, setWizStep] = useState(1)
  const [currentProg, setCurrentProg] = useState('homeschool')
  const [loginRole, setLoginRole] = useState('student')
  const [toast, setToast] = useState(null)
  const [wizDone, setWizDone] = useState(false)

  // Malaysia Trip 2026 — application form state
  const [malaysiaTripForm, setMalaysiaTripForm] = useState({
    studentName: '',
    studentAge: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '+254 ',
    city: '',
    notes: '',
  })
  const [malaysiaTripSubmitted, setMalaysiaTripSubmitted] = useState(false)
  const [malaysiaTripSubmitting, setMalaysiaTripSubmitting] = useState(false)

  // Enrollment wizard form data — collected across steps 1, 2, 4
  const [enrollForm, setEnrollForm] = useState({
    // Step 1 — Programme
    programme: '',
    curriculum: '',
    learningMode: '',
    pathway: '',
    targetCountry: '',
    destination: '',
    duration: '',
    // Step 2 — Details
    firstName: '',
    lastName: '',
    parentEmail: '',
    whatsapp: '+254 ',
    dob: '',
    country: '',
    currentSchool: '',
    gradeLevel: '',
    heardFrom: '',
    // Step 4 — Placement test answers (keyed by question id, built dynamically)
    answers: {},
    // Step 3.5 — Assessment mode chosen after payment
    assessmentMode: '',        // 'online' | 'centre' | 'home'
    assessmentAddress: '',     // only used when assessmentMode === 'home'
  })
  const setEF = (k, v) => setEnrollForm(f => ({...f, [k]: v}))
  const setAnswer = (qid, val) => setEnrollForm(f => ({...f, answers: {...f.answers, [qid]: val}}))

  // Placement assessment — built when user reaches Step 4, held in state so
  // answers persist if they navigate back/forward. Rebuilds if they change
  // their level/curriculum selections.
  const [assessment, setAssessment] = useState([])
  const [assessmentLevel, setAssessmentLevel] = useState('')
  const [enrollSending, setEnrollSending] = useState(false)
  const [enrollError, setEnrollError] = useState('')
  const [fabOpen, setFabOpen] = useState(false)

  // Build a fresh placement test when user reaches Step 4.
  // Also rebuilds if they go back and change their level/curriculum.
  useEffect(() => {
    if (wizStep !== 4) return
    const lvl = detectLevel(enrollForm, currentProg)
    if (assessment.length === 0 || lvl !== assessmentLevel) {
      setAssessment(buildAssessment(lvl))
      setAssessmentLevel(lvl)
      // Clear any old answers so the new question IDs start blank
      setEnrollForm(f => ({...f, answers: {}}))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizStep, enrollForm.gradeLevel, enrollForm.curriculum, currentProg])

  // ── Paystack payment state ──────────────────────────────
  const PAYSTACK_PUBLIC_KEY = 'pk_live_a1608f5c5f71946ca1357afa673cd53ce4057af8'
  const [payProcessing, setPayProcessing] = useState(false)
  const [paySuccess, setPaySuccess]       = useState('')   // stores reference on success
  const [payError, setPayError]           = useState('')

  // Lazy-load Paystack inline script on demand
  const loadPaystack = () => new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve(window.PaystackPop)
    const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.PaystackPop))
      existing.addEventListener('error', reject)
      return
    }
    const s = document.createElement('script')
    s.src = 'https://js.paystack.co/v1/inline.js'
    s.async = true
    s.onload  = () => resolve(window.PaystackPop)
    s.onerror = () => reject(new Error('Failed to load Paystack'))
    document.body.appendChild(s)
  })

  const payWithPaystack = async () => {
    setPayError('')
    if (!enrollForm.parentEmail) {
      setPayError('Email is missing. Please go back to Your Details.')
      return
    }
    setPayProcessing(true)
    try {
      const PaystackPop = await loadPaystack()
      // Convert USD → KES. ~130 KES/USD as of Apr 2026. Paystack expects kobo (×100).
      // $15 ≈ KES 1,950 → 195000 kobo
      const amountKobo = 195000
      const ref = `SMART-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`

      const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: enrollForm.parentEmail,
        amount: amountKobo,
        currency: 'KES',
        ref,
        firstname: enrollForm.firstName || 'Smartious',
        lastname:  enrollForm.lastName  || 'Applicant',
        metadata: {
          custom_fields: [
            { display_name: 'Student Name', variable_name: 'student_name',
              value: `${enrollForm.firstName} ${enrollForm.lastName}`.trim() },
            { display_name: 'WhatsApp', variable_name: 'whatsapp',
              value: enrollForm.whatsapp || '—' },
            { display_name: 'Programme', variable_name: 'programme',
              value: currentProg },
            { display_name: 'Curriculum', variable_name: 'curriculum',
              value: enrollForm.curriculum || '—' },
            { display_name: 'Country', variable_name: 'country',
              value: enrollForm.country || '—' },
          ]
        },
        callback: (response) => {
          // Paystack returns from its own thread — use setTimeout to ensure state updates
          setTimeout(() => {
            setPaySuccess(response.reference)
            setPayProcessing(false)
          }, 0)
        },
        onClose: () => {
          setTimeout(() => {
            setPayProcessing(false)
            if (!paySuccess) setPayError('Payment window was closed before completing payment. Please try again.')
          }, 0)
        },
      })
      handler.openIframe()
    } catch (e) {
      setPayError('Could not open Paystack. Please check your internet connection and try again.')
      setPayProcessing(false)
    }
  }

  // Submit enrollment to hellosmartious@gmail.com via FormSubmit
  const submitEnrollment = async () => {
    setEnrollSending(true)
    setEnrollError('')
    const progLabel = {homeschool:'Homeschool & Tutoring',iufp:'IUFP — University Foundation',studyabroad:'Study Abroad Placement'}[currentProg] || currentProg
    const levelLabel = (LEVELS.find(l => l.id === assessmentLevel) || {}).label || assessmentLevel || '—'

    // Assessment mode — affects how the admin sees the result
    const modeLabel = enrollForm.assessmentMode === 'online'
      ? 'Online — completed here'
      : enrollForm.assessmentMode === 'centre'
        ? 'In-person at Smartious centre (Diamond Plaza I, Parklands, Nairobi)'
        : enrollForm.assessmentMode === 'home'
          ? `In-person home visit — ${enrollForm.assessmentAddress}`
          : '— not chosen —'

    const isOnline = enrollForm.assessmentMode === 'online'

    // Assessment is no longer taken on the landing page — it is
    // completed in the student portal after enrolment.
    let correctCount = 0, mathCorrect = 0, mathTotal = 0, engCorrect = 0, engTotal = 0
    let assessmentLines = '— Placement assessment to be completed in the student portal after enrolment —'
    let scorePct = 0, scoreBand = 'Pending — student portal assessment'
    if (isOnline && assessment.length > 0) {
      assessmentLines = assessment.map((q, i) => {
        const ans = enrollForm.answers[q.id] || '— not answered —'
        const isCorrect = ans === q.correct
        if (isCorrect) correctCount++
        if (q.subject === 'Mathematics') { mathTotal++; if (isCorrect) mathCorrect++ }
        else                             { engTotal++;  if (isCorrect) engCorrect++ }
        return `Q${i+1} [${q.subject}] ${q.q}\n   Student answer: ${ans}\n   Correct answer: ${q.correct}\n   Result: ${isCorrect ? '✓ CORRECT' : '✗ Incorrect'}`
      }).join('\n\n')
      scorePct  = Math.round((correctCount / assessment.length) * 100)
      scoreBand = scorePct >= 80 ? 'Strong' : scorePct >= 50 ? 'On track' : 'Needs support'
    }

    const scoreSummary = isOnline
      ? `${correctCount}/${assessment.length} (${scorePct}%) — ${scoreBand}`
      : 'To be scored after in-person assessment'

    const payload = {
      _subject: isOnline
        ? `NEW ENROLMENT — ${enrollForm.firstName} ${enrollForm.lastName} (${progLabel}) — PAID — Score ${scorePct}%`
        : `NEW ENROLMENT — ${enrollForm.firstName} ${enrollForm.lastName} (${progLabel}) — PAID — IN-PERSON ASSESSMENT`,
      _template: 'table',
      _captcha: 'false',
      'Payment Status': paySuccess ? '✅ PAID — $15 via Paystack' : '⚠️ Not paid',
      'Paystack Reference': paySuccess || '—',
      'Assessment Mode': modeLabel,
      'Assessment Score': scoreSummary,
      'Maths Score': isOnline ? `${mathCorrect}/${mathTotal}` : '—',
      'English Score': isOnline ? `${engCorrect}/${engTotal}` : '—',
      'Assessment Level': levelLabel,
      'Programme Selected': progLabel,
      'Curriculum': enrollForm.curriculum || '—',
      'Learning Mode': enrollForm.learningMode || '—',
      'Academic Pathway': enrollForm.pathway || '—',
      'Target Country': enrollForm.targetCountry || '—',
      'Study Abroad Destination': enrollForm.destination || '—',
      'Study Abroad Duration': enrollForm.duration || '—',
      'Student First Name': enrollForm.firstName,
      'Student Last Name': enrollForm.lastName,
      'Parent/Guardian Email': enrollForm.parentEmail,
      'WhatsApp Number': enrollForm.whatsapp,
      'Date of Birth': enrollForm.dob,
      'Country of Residence': enrollForm.country,
      'Current School': enrollForm.currentSchool || '—',
      'Heard From': enrollForm.heardFrom || '—',
      'Full Assessment Transcript': assessmentLines,
      'Submitted At': new Date().toLocaleString('en-GB', {timeZone:'Africa/Nairobi'}) + ' EAT',
    }
    // Submit. The Front Desk database is the primary store; the
    // formsubmit.co email is a secondary copy. The enrolment
    // succeeds as long as the Front Desk capture goes through.
    let frontDeskOk = false
    try {
      const fdRes = await fetch(FRONTDESK_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'registration',
          name: `${enrollForm.firstName || ''} ${enrollForm.lastName || ''}`.trim(),
          email: enrollForm.parentEmail,
          phone: enrollForm.whatsapp,
          studentFirstName: enrollForm.firstName,
          studentLastName: enrollForm.lastName,
          studentDob: enrollForm.dob,
          currentSchool: enrollForm.currentSchool,
          country: enrollForm.country,
          programme: enrollForm.learningMode,
          curriculum: enrollForm.curriculum,
          learningMode: enrollForm.learningMode,
          pathway: enrollForm.pathway,
          destination: enrollForm.destination,
          duration: enrollForm.duration,
          heardFrom: enrollForm.heardFrom,
          sourcePage: 'enroll-wizard',
          extra: { assessmentTranscript: assessmentLines },
        }),
      })
      frontDeskOk = fdRes.ok
    } catch (e) {
      console.error('[enroll] front desk capture failed:', e?.message)
    }

    // Secondary: email copy via formsubmit.co — best-effort, never blocks
    let emailOk = false
    try {
      const res = await fetch('https://formsubmit.co/ajax/hellosmartious@gmail.com', {
        method: 'POST',
        headers: {'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify(payload),
      })
      emailOk = res.ok
    } catch (e) {
      console.error('[enroll] email copy failed:', e?.message)
    }

    if (frontDeskOk || emailOk) {
      setWizStep(3); setWizDone(true)
      // Google Ads conversion event — fires only on real lead
      // submission so the campaign attribution is accurate. Safe
      // no-op if gtag.js hasn't loaded.
      try {
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'ads_conversion_Submit_lead_form_1', {})
        }
      } catch (e) {
        // Never let analytics break the user flow
        console.error('[gtag] conversion event failed:', e?.message)
      }
    } else {
      setEnrollError('Submission failed. Please check your connection and try again, or WhatsApp us at +254 745 021 212.')
    }
    setEnrollSending(false)
  }

  const nav = useNavigate()
  const location = useLocation()
  const routeParams = useParams()
  const topRef = useRef(null)

  // ── URL ⇄ page-state sync ──────────────────────────────
  // Map a URL pathname to a landing-page id. '/' → 'home',
  // '/curricula' → 'curricula', '/blog/:slug' → 'article'.
  const pageToPath = (id) => (id === 'home' ? '/' : '/' + id)

  // Apply the URL to internal page state. Driven by a useEffect
  // so browser back/forward and direct links all work.
  useEffect(() => {
    const path = location.pathname.replace(/\/+$/, '') || '/'
    if (path.startsWith('/blog/')) {
      const slug = decodeURIComponent(path.slice('/blog/'.length))
      if (slug && FULL_ARTICLES[slug]) {
        setCurrentArticle(slug)
        setPage('article')
      } else {
        // Unknown article slug — fall back to the blog index
        setPage('blog')
      }
      return
    }
    if (path.startsWith('/curricula/')) {
      const slug = decodeURIComponent(path.slice('/curricula/'.length))
      const cur = CURRICULA.find(c => c.slug === slug)
      if (cur) {
        setCurrentCurriculum(slug)
        setPage('curriculum-detail')
      } else {
        // Unknown curriculum slug — fall back to the curricula index
        setPage('curricula')
      }
      return
    }
    if (path.startsWith('/services/')) {
      const slug = decodeURIComponent(path.slice('/services/'.length))
      const svc = SERVICES.find(s => s.slug === slug)
      if (svc) {
        setCurrentService(slug)
        setPage('service-detail')
      } else {
        // Unknown service slug — fall back to the services index
        setPage('services')
      }
      return
    }
    if (path.startsWith('/online-school/')) {
      const slug = decodeURIComponent(path.slice('/online-school/'.length))
      const country = COUNTRIES.find(c => c.slug === slug)
      if (country) {
        setCurrentCountry(slug)
        setPage('country-detail')
      } else {
        // Unknown country slug — fall back to the global page
        setPage('global')
      }
      return
    }
    if (path.startsWith('/compare/')) {
      const slug = decodeURIComponent(path.slice('/compare/'.length))
      const cmp = COMPARES.find(c => c.slug === slug)
      if (cmp) {
        setCurrentCompare(slug)
        setPage('compare-detail')
      } else {
        // Unknown comparison slug — fall back to home
        setPage('home')
      }
      return
    }
    const id = path === '/' ? 'home' : path.slice(1)
    if (PAGES.includes(id) && id !== 'article') {
      setPage(id)
    } else {
      setPage('home')
    }
  }, [location.pathname])

  // ── Per-page SEO meta ──────────────────────────────────
  // Derive the title + description for the current page and
  // apply them. Curriculum and service detail pages use their
  // own seoTitle/seoDesc; other pages use PAGE_META.
  let metaTitle = PAGE_META.home.title
  let metaDesc  = PAGE_META.home.desc
  if (page === 'curriculum-detail' && currentCurriculum) {
    const c = CURRICULA.find(x => x.slug === currentCurriculum)
    if (c) {
      metaTitle = c.h + ' Curriculum | Homeschooling & Online — ' + SITE
      metaDesc  = c.detail?.overview ? c.detail.overview.slice(0, 158) : c.desc.slice(0, 158)
    }
  } else if (page === 'service-detail' && currentService) {
    const s = SERVICES.find(x => x.slug === currentService)
    if (s) {
      metaTitle = s.seoTitle || (s.h + ' — ' + SITE)
      metaDesc  = s.seoDesc || s.desc.slice(0, 158)
    }
  } else if (page === 'country-detail' && currentCountry) {
    const ctry = COUNTRIES.find(x => x.slug === currentCountry)
    if (ctry) {
      metaTitle = ctry.seoTitle
      metaDesc  = ctry.seoDesc
    }
  } else if (page === 'compare-detail' && currentCompare) {
    const cmp = COMPARES.find(x => x.slug === currentCompare)
    if (cmp) {
      metaTitle = cmp.seoTitle
      metaDesc  = cmp.seoDesc
    }
  } else if (page === 'article' && currentArticle && FULL_ARTICLES[currentArticle]) {
    const a = FULL_ARTICLES[currentArticle]
    metaTitle = a.metaTitle || ((a.t || 'Article') + ' | ' + SITE)
    metaDesc  = a.metaDesc || (a.intro || '').slice(0, 158)
  } else if (PAGE_META[page]) {
    metaTitle = PAGE_META[page].title
    metaDesc  = PAGE_META[page].desc
  }
  usePageMeta(metaTitle, metaDesc)
  useHeroPreload(page === 'home')

  // Load public teacher profiles when the Teachers page is opened.
  // Fetched once, from the public (no-auth) endpoint.
  useEffect(() => {
    if (page !== 'teachers' || teachersLoaded) return
    setTeachersLoading(true)
    const base = (import.meta.env?.VITE_API_URL || 'https://smartious-backend.onrender.com').replace(/\/$/, '')
    fetch(base + '/api/users/public-teachers')
      .then(r => r.json())
      .then(d => { if (d?.success) setPublicTeachers(d.data?.teachers || []) })
      .catch(e => console.error('[teachers] load failed:', e?.message))
      .finally(() => { setTeachersLoading(false); setTeachersLoaded(true) })
  }, [page, teachersLoaded])

  // P(id) — navigate to a landing page by URL. The useEffect
  // above then syncs `page` state. Resets per-page form state.
  const P = (id) => {
    if (!PAGES.includes(id)) return
    setWizStep(1)
    setWizDone(false)
    setPaySuccess('')
    setPayError('')
    setPayProcessing(false)
    setEnrollError('')
    setAssessment([])
    setAssessmentLevel('')
    if (id === 'article') {
      // Article navigation handled by openArticle(); ignore here
      return
    }
    nav(pageToPath(id))
    window.scrollTo(0, 0)
    topRef.current?.scrollIntoView()
  }

  // openArticle(slug) — navigate to an individual blog post URL
  const openArticle = (slug) => {
    if (!slug) return
    nav('/blog/' + encodeURIComponent(slug))
    window.scrollTo(0, 0)
    topRef.current?.scrollIntoView()
  }

  // openCurriculum(slug) — navigate to a curriculum detail page URL
  const openCurriculum = (slug) => {
    if (!slug) return
    nav('/curricula/' + encodeURIComponent(slug))
    window.scrollTo(0, 0)
    topRef.current?.scrollIntoView()
  }

  // openService(slug) — navigate to a service detail page URL
  const openService = (slug) => {
    if (!slug) return
    nav('/services/' + encodeURIComponent(slug))
    window.scrollTo(0, 0)
    topRef.current?.scrollIntoView()
  }

  // openCountry(slug) — navigate to a country detail page URL
  const openCountry = (slug) => {
    if (!slug) return
    nav('/online-school/' + encodeURIComponent(slug))
    window.scrollTo(0, 0)
    topRef.current?.scrollIntoView()
  }

  // openCompare(slug) — navigate to a competitor-comparison page URL
  const openCompare = (slug) => {
    if (!slug) return
    nav('/compare/' + encodeURIComponent(slug))
    window.scrollTo(0, 0)
    topRef.current?.scrollIntoView()
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3200)
  }

  const goPortal = () => nav('/login')

  // Blog items are derived from FULL_ARTICLES — same content, same slugs
  const BLOG_ITEMS = Object.entries(FULL_ARTICLES).map(([slug, a]) => ({
    slug,
    cat: a.cat,
    country: a.country || 'kenya',
    img: a.img,
    splash: a.splash || null,
    t: a.t,
    date: a.date,
    author: a.author,
    role: a.role,
    ex: a.intro.length > 150 ? a.intro.slice(0, 147) + '…' : a.intro,
    featured: !!a.featured,
  }))

  const filtered = BLOG_ITEMS.filter(b =>
    (blogCat === 'all' || b.cat === blogCat) &&
    (blogCountry === 'all' || b.country === blogCountry)
  )
  const visibleBlog = filtered.filter(b => !b.featured)
  const featuredBlog = filtered.find(b => b.featured)

  return (
    <div className="lp" ref={topRef}>
      <style>{styles}</style>

      {/* ── FIXED HEADER: topbar + nav ── */}
      <div className={`lp-header${scrolled?' scrolled':''}`}>
        <div id="topbar" style={{background:V.ink,borderBottom:'1px solid rgba(184,150,12,.12)',overflow:'hidden',padding:'9px 0'}}>
          <div className="topbar-marq">
            <div className="topbar-marq-in">
              {[
                ['★','Internationally Accredited — IGCSE · Cambridge · IB · Edexcel · CBC'],
                ['◆','Expert Tutors — Hand-picked, degree-qualified, exam specialists'],
                ['●','Mshauri AI Tutor — 24/7 personalised learning support'],
                ['◆','Serving 2,000+ Students across 12+ Countries'],
                ['★','Flexible Learning — Home visits, learning centre, or 100% online'],
                ['●','University Placement — 200+ partner universities worldwide'],
                ['◆','From $85/month — $15 placement assessment · First lesson within 48 hours'],
                ['★','Proven Results — 94% A*/A pass rate at IGCSE and A-Level'],
              ].concat([
                ['★','Internationally Accredited — IGCSE · Cambridge · IB · Edexcel · CBC'],
                ['◆','Expert Tutors — Hand-picked, degree-qualified, exam specialists'],
                ['●','Mshauri AI Tutor — 24/7 personalised learning support'],
                ['◆','Serving 2,000+ Students across 12+ Countries'],
                ['★','Flexible Learning — Home visits, learning centre, or 100% online'],
                ['●','University Placement — 200+ partner universities worldwide'],
                ['◆','From $85/month — $15 placement assessment · First lesson within 48 hours'],
                ['★','Proven Results — 94% A*/A pass rate at IGCSE and A-Level'],
              ]).map(([ico,t],i) => (
                <div key={i} className="topbar-mi">
                  <span style={{color:V.gold3,fontSize:10}}>{ico}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <nav>
        <div className="nav-wrap">
          <div className="logo-lockup" onClick={() => P('home')}>
            <SmartiousLogo size={36} withText={true} tone="light"/>
          </div>
          <div className="nav-links">
            {[['Home','home'],['About','about'],['Curricula','curricula'],['Services','services'],['Global','global'],['Pricing','pricing'],['Programs','programs'],['Activities','activities'],['Teachers','teachers'],['FAQ','faq'],['Blog','blog']].map(([l,id]) => (
              <div key={id} className={`nl${page===id?' on':''}`} onClick={() => P(id)}>{l}</div>
            ))}
          </div>
          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(m => !m)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            style={{display:'none',background:'transparent',border:'1px solid rgba(255,255,255,.2)',borderRadius:8,padding:'7px 10px',cursor:'pointer',color:'#fff'}} className="mob-burger">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="nav-actions">
            <button className="nav-login" onClick={goPortal}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Portal Login
            </button>
            <div className="nav-cta" onClick={() => P('enroll')}>
              Enroll Now
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>
        </nav>
      </div>{/* /lp-header */}

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
        <div style={{position:'fixed',top:64,left:0,right:0,background:'#0F172A',zIndex:9998,padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,.1)',boxShadow:'0 8px 32px rgba(0,0,0,.4)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
            {[['Home','home'],['About','about'],['Curricula','curricula'],['Services','services'],['Global','global'],['Pricing','pricing'],['Programs','programs'],['Activities','activities'],['FAQ','faq'],['Blog','blog'],['Enroll','enroll']].map(([l,id]) => (
              <button key={id} onClick={()=>{P(id);setMobileMenuOpen(false)}} style={{background:page===id?'rgba(96,165,250,.15)':'transparent',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,padding:'10px 14px',color:page===id?'#60A5FA':'rgba(255,255,255,.8)',fontWeight:page===id?700:400,fontSize:14,textAlign:'left',cursor:'pointer'}}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={()=>{goPortal();setMobileMenuOpen(false)}} style={{width:'100%',background:'#60A5FA',border:'none',borderRadius:10,padding:'12px',color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer'}}>
            Portal Login
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          HOME
      ══════════════════════════════════════════ */}
      {page === 'home' && (
        <>
          <section id="hero">
            <video
              className="h-bg"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/hero-learning-centre.jpg"
              aria-hidden="true"
            >
              <source
                src="https://res.cloudinary.com/dae99gz1m/video/upload/f_auto,q_auto,vc_auto,w_1080,h_1920,c_fill,g_auto/hero_mhhwhf.mp4"
                media="(max-width: 768px)"
              />
              <source
                src="https://res.cloudinary.com/dae99gz1m/video/upload/f_auto,q_auto,vc_auto,w_1920,c_limit/hero_mhhwhf.mp4"
              />
            </video>
            <div className="h-ov"/>
            <div className="h-vig"/>
            <div className="h-body">
              <div style={{marginBottom:34}}>
                <SmartiousLogo size={56} withText={true} tone="light"/>
              </div>
              <h1 className="h1">
                <span>The Online</span>
                <span>Homeschool That</span>
                <span>Travels with <em>You</em></span>
              </h1>
              <p className="h-sub">Accredited Cambridge IGCSE, A-Level, IB Diploma, Edexcel and American curricula — taught live, online, by qualified specialists. Serving 2,000+ students across the UAE, UK, Canada, Australia, Nigeria and Kenya. From USD 85/month.</p>
              <div className="h-act">
                <button className="btn-p" onClick={() => P('enroll')}>Begin Enrollment <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                <button className="btn-o lt" style={{borderColor:'rgba(139,26,46,.45)',color:V.cr}} onClick={() => P('consult')}>Free Consultation</button>
                <button className="btn-o lt" style={{borderColor:'rgba(247,243,237,.45)',color:'rgba(247,243,237,.85)'}} onClick={() => P('curricula')}>Explore Curricula</button>
                <button className="btn-o lt" style={{borderColor:'rgba(247,243,237,.45)',color:'rgba(247,243,237,.85)'}} onClick={() => P('pricing')}>View Pricing</button>
              </div>
            </div>
            <div className="h-stats">
              {[[cfg.stat1||'2,418+','Students Worldwide'],[cfg.stat2||'127','Teachers'],[cfg.stat3||'6','Curricula'],[cfg.stat4||'Kenya · UAE · UK','Served']].map(([n,l]) => (
                <div key={l} className="hs">
                  <div className="hs-n"><em>{n}</em></div>
                  <div className="hs-l">{l}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Mobile-only stats strip — sits below the hero so it doesn't block the video */}
          <div className="h-stats-strip">
            <div className="h-stats-strip-grid">
              {[[cfg.stat1||'2,418+','Students'],[cfg.stat2||'127','Teachers'],[cfg.stat3||'6','Curricula'],['12+','Countries']].map(([n,l]) => (
                <div key={l} className="hms">
                  <div className="hms-n">{n.includes('+')?<>{n.replace('+','')}<em>+</em></>:n}</div>
                  <div className="hms-l">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile page summary strip */}
          <div style={{display:'none'}} className="mob-page-strip">
            <div style={{background:'rgba(255,255,255,.04)',borderBottom:'1px solid rgba(255,255,255,.08)',padding:'10px 20px',overflowX:'auto',whiteSpace:'nowrap'}}>
              {[['Home','home'],['About','about'],['Curricula','curricula'],['Services','services'],['Pricing','pricing'],['Blog','blog'],['Enroll','enroll']].map(([l,id]) => (
                <button key={id} onClick={() => P(id)} style={{display:'inline-block',marginRight:8,padding:'6px 14px',borderRadius:99,border:'1px solid rgba(255,255,255,.15)',background:page===id?'rgba(96,165,250,.2)':'transparent',color:page===id?'#60A5FA':'rgba(255,255,255,.55)',fontSize:13,fontWeight:page===id?700:400,cursor:'pointer',whiteSpace:'nowrap'}}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {/* MARQUEE */}
          <div className="marq">
            <div className="marq-in">
              {[...Array(2)].map((_,ri) => ['IGCSE Excellence','Cambridge A-Level','IB Diploma','British Curriculum','American Curriculum','CBC Kenya','Pearson Edexcel','12+ Countries','AI-Powered Learning','98% Pass Rate 2024','Study Abroad','IUFP Programme'].map((t,i) => (
                <div key={ri+'-'+i} className="mi"><div className="md"/>{t}</div>
              )))}
            </div>
          </div>

          {/* ═══════════════════════════════════════════
              HOMEPAGE FAQ SCHEMA (for AI Overviews)
              Injected as JSON-LD so Google AI Overviews,
              Gemini, ChatGPT and Perplexity have direct
              answers to common homeschool questions.
          ═══════════════════════════════════════════ */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
              { '@type': 'Question', 'name': 'What is Smartious Homeschool?',
                'acceptedAnswer': { '@type': 'Answer', 'text': 'Smartious Homeschool & eSchool is an accredited international online school founded in Nairobi in 2018. We deliver Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel and American High School curricula to over 2,000 students across Kenya, the UAE, UK, USA, Canada, Australia, Nigeria, South Africa, Qatar and Egypt. All classes are taught live by degree-qualified specialists.' } },
              { '@type': 'Question', 'name': 'How much does Smartious cost?',
                'acceptedAnswer': { '@type': 'Answer', 'text': 'Smartious tuition starts from USD 85 per month for single subjects and ranges from USD 4,000 to USD 6,000 per year for full homeschool programmes. This is a fraction of private international school fees (typically USD 15,000 to USD 45,000 per year). Payment plans, sibling discounts and termly billing are available.' } },
              { '@type': 'Question', 'name': 'Which countries does Smartious serve?',
                'acceptedAnswer': { '@type': 'Answer', 'text': 'Smartious serves students worldwide with dedicated country support for the United Arab Emirates (Dubai, Abu Dhabi, Sharjah), United Kingdom, United States, Canada, Australia, Nigeria, South Africa, Qatar, Egypt, and Kenya. Live classes are scheduled to suit multiple time zones with full recording access for asynchronous review.' } },
              { '@type': 'Question', 'name': 'Will my child get a real qualification through Smartious?',
                'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. Smartious students sit official Cambridge International (IGCSE, A-Level), Pearson Edexcel, IB Diploma and American High School Diploma examinations at registered British Council and Cambridge International centres worldwide. The qualifications earned are identical to those from any other school using the same boards and are accepted by universities globally.' } },
              { '@type': 'Question', 'name': 'How do online students at Smartious socialise?',
                'acceptedAnswer': { '@type': 'Answer', 'text': 'Smartious students join live virtual classes daily with classmates across multiple countries. Every Wednesday from 2:00 PM to 4:00 PM students participate in the enrichment programme covering sports, clubs, leadership and arts. Online clubs include debate, coding, AI, Model UN, journalism and entrepreneurship.' } },
              { '@type': 'Question', 'name': 'Can my child join Smartious mid-year?',
                'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. Smartious accepts enrolments year-round. Mid-year transfers are common, especially for families relocating internationally. Our admissions team assesses where your child is in their curriculum and places them at the right point with no loss of progress.' } },
            ],
          })}}/>

          {/* ═══════════════════════════════════════════
              TRUST BAND — directly under hero
              Above-the-fold credibility before scroll.
          ═══════════════════════════════════════════ */}
          <section style={{background:V.bone,borderBottom:'1px solid '+V.bone3}}>
            <div className="wrap" style={{padding:'32px 48px'}}>
              <div style={{
                display:'grid',
                gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))',
                gap:24,
                textAlign:'center',
              }}>
                {[
                  ['Since 2018', 'Founded in Nairobi'],
                  ['Cambridge & Edexcel', 'Officially registered exam pathway'],
                  ['IB Diploma', 'Full Diploma Programme'],
                  ['British Council', 'Exam centres worldwide'],
                  ['98% pass rate', '2024 IGCSE & A-Level cohort'],
                ].map(([h, sub]) => (
                  <div key={h}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700,color:V.ink,lineHeight:1.25}}>{h}</div>
                    <div style={{fontSize:11.5,color:V.sl,marginTop:4,letterSpacing:'.02em'}}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              COUNTRY ROUTER — links to the 10 country pages
              Big SEO win: surfaces all country pages from
              homepage so they get internal-link authority.
          ═══════════════════════════════════════════ */}
          <section className="sec" style={{background:V.white}}><div className="wrap">
            <div className="sec-hd reveal" style={{textAlign:'center'}}>
              <div className="eyebrow" style={{justifyContent:'center'}}>Built for global families</div>
              <h2 className="display">An Online School That <em>Travels With You</em></h2>
              <p className="lead" style={{marginTop:14,maxWidth:680,margin:'14px auto 0'}}>Same curriculum, same teachers, same friends — wherever life takes you. Click your country for local exam centres, fee guidance and regulatory information.</p>
            </div>
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',
              gap:12,
              marginTop:36,
            }}>
              {[
                {country:'UAE', slug:'uae', href:'/online-school/uae', sub:'Dubai · Abu Dhabi'},
                {country:'Qatar', slug:'qatar', href:'/online-school/qatar', sub:'Doha'},
                {country:'Bahrain', slug:'bahrain', href:'/online-school/bahrain', sub:'Manama · Riffa'},
                {country:'Pakistan', slug:'pakistan', href:'/online-school/pakistan', sub:'Karachi · Lahore · Islamabad'},
                {country:'United Kingdom', slug:'uk', href:'/online-school/uk', sub:'London · Manchester'},
                {country:'United States', slug:'usa', href:'/online-school/usa', sub:'Coast to coast'},
                {country:'Canada', slug:'canada', href:'/online-school/canada', sub:'Toronto · Vancouver'},
                {country:'Australia', slug:'australia', href:'/online-school/australia', sub:'Sydney · Melbourne'},
                {country:'Nigeria', slug:'nigeria', href:'/online-school/nigeria', sub:'Lagos · Abuja'},
                {country:'South Africa', slug:'south-africa', href:'/online-school/south-africa', sub:'Johannesburg · Cape Town'},
                {country:'Egypt', slug:'egypt', href:'/online-school/egypt', sub:'Cairo · Alexandria'},
                {country:'Kenya', slug:'kenya', href:'/online-school/kenya', sub:'Nairobi HQ · Diamond Plaza'},
                {country:'Uganda', slug:'uganda', href:'/online-school/uganda', sub:'Kampala · Entebbe · Wakiso'},
                {country:'Somalia', slug:'somalia', href:'/online-school/somalia', sub:'Mogadishu · Hargeisa · Garowe'},
                {country:'Tanzania', slug:'tanzania', href:'/online-school/tanzania', sub:'Dar es Salaam · Arusha · Zanzibar'},
              ].map(c => (
                <a key={c.country}
                  href={c.href}
                  onClick={e => {
                    e.preventDefault()
                    if (c.slug) openCountry(c.slug)
                    else P('global')
                  }}
                  style={{
                    display:'block',
                    padding:'14px 16px',
                    background:V.bone,
                    border:'1px solid '+V.line,
                    borderRadius:8,
                    cursor:'pointer',
                    textDecoration:'none',
                    color:'inherit',
                    transition:'transform .15s, border-color .15s, box-shadow .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor=V.cr+'60'; e.currentTarget.style.boxShadow='0 6px 18px rgba(139,26,46,.10)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor=V.line; e.currentTarget.style.boxShadow='none' }}>
                  <div style={{fontSize:13.5,fontWeight:700,color:V.ink,marginBottom:2}}>{c.country}</div>
                  <div style={{fontSize:11,color:V.sl}}>{c.sub}</div>
                </a>
              ))}
            </div>
          </div></section>

          {/* ═══════════════════════════════════════════
              HOW IT WORKS — 4 steps
              Demystifies the model so first-time visitors
              understand before being asked to enrol.
          ═══════════════════════════════════════════ */}
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            <div className="sec-hd reveal" style={{textAlign:'center'}}>
              <div className="eyebrow" style={{justifyContent:'center'}}>How Smartious works</div>
              <h2 className="display">From Enquiry to <em>University Offer</em></h2>
              <p className="lead" style={{marginTop:14,maxWidth:640,margin:'14px auto 0'}}>A clear, four-step path. Most families complete steps 1–2 in under a week.</p>
            </div>

            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',
              gap:16,
              marginTop:36,
            }}>
              {[
                ['01', 'Free consultation', 'Speak with our admissions team. We review your child\'s current academic level, family goals, and the curriculum that best fits. No commitment.'],
                ['02', 'Personalised plan', 'We map a study plan: subjects, weekly timetable, exam pathway and teacher allocation. Year-round enrolment — start within days.'],
                ['03', 'Live online classes', 'Daily live lessons with degree-qualified specialists. Recordings available. Weekly progress reports for parents. Wednesday enrichment programme included.'],
                ['04', 'Exams & university', 'Sit Cambridge, Edexcel, IB or American exams at registered centres locally. Full UCAS, Common App and university application support.'],
              ].map(([n, h, p]) => (
                <div key={n} style={{
                  background:V.white,
                  border:'1px solid '+V.line,
                  borderRadius:10,
                  padding:'24px 22px',
                  position:'relative',
                }}>
                  <div style={{
                    fontFamily:"'Playfair Display',serif",
                    fontSize:'2.2rem',
                    fontWeight:400,
                    color:V.gold2,
                    lineHeight:1,
                    marginBottom:12,
                    fontStyle:'italic',
                  }}>{n}</div>
                  <h3 style={{
                    fontSize:15,
                    fontWeight:700,
                    color:V.ink,
                    marginBottom:8,
                    lineHeight:1.3,
                  }}>{h}</h3>
                  <p style={{
                    fontSize:13,
                    color:V.sl,
                    lineHeight:1.65,
                  }}>{p}</p>
                </div>
              ))}
            </div>

            <div style={{textAlign:'center',marginTop:32}}>
              <button className="btn-p" onClick={() => P('consult')}>
                Book Free Consultation
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div></section>

          {/* ═══════════════════════════════════════════
              WHY SMARTIOUS — comparison-intent capture
              Targets "Smartious vs Wolsey Hall", "vs
              CambriLearn", "vs international school"
              search intent without naming competitors
              directly.
          ═══════════════════════════════════════════ */}
          <section className="sec" style={{background:V.ink, color:'#fff'}}><div className="wrap">
            <div className="sec-hd reveal" style={{textAlign:'center'}}>
              <div className="eyebrow" style={{justifyContent:'center',color:V.gold2}}>Why Smartious</div>
              <h2 className="display" style={{color:'#fff'}}>The Smartious <em style={{color:V.gold3}}>Advantage</em></h2>
              <p className="lead" style={{marginTop:14,maxWidth:680,margin:'14px auto 0',color:'rgba(255,255,255,.7)'}}>What separates Smartious from a typical online school or a high-fee international school.</p>
            </div>

            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',
              gap:18,
              marginTop:36,
            }}>
              {[
                ['Live, not self-paced','Every Smartious class is taught live by a qualified teacher in real time. Recordings are a supplement, not the product. This is how children actually learn — not watching videos alone.'],
                ['Fraction of private fees','USD 4,000–6,000 per year for a full programme. Private international schools in Dubai, Lagos and Cairo charge 5–25× more for the same Cambridge or American curriculum.'],
                ['Real exam credentials','Students sit Cambridge IGCSE, A-Level, IB, Edexcel and AP examinations at official British Council and Cambridge centres. Qualifications are identical to brick-and-mortar school graduates.'],
                ['Continuity across moves','One school that follows your family from Nairobi to Dubai to London. Same teachers, same curriculum, same friends — no disruption when life changes.'],
                ['Wednesday enrichment','Every week, 2-hour reserved window for sports, clubs, leadership and music. The kind of holistic education premium private schools charge a fortune to provide.'],
                ['AI-augmented, human-led','Mshauri AI tutor reinforces concepts between live lessons. Adaptive practice, instant feedback. AI accelerates the human teacher rather than replacing them.'],
              ].map(([h, p]) => (
                <div key={h} style={{
                  background:'rgba(255,255,255,.03)',
                  border:'1px solid rgba(255,255,255,.08)',
                  borderRadius:10,
                  padding:'20px 18px',
                }}>
                  <div style={{
                    width:32, height:32, borderRadius:6,
                    background:'rgba(212,175,55,.15)',
                    border:'1px solid rgba(212,175,55,.35)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    marginBottom:14,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={V.gold2} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <h3 style={{
                    fontSize:14.5, fontWeight:700, color:'#fff',
                    marginBottom:8, lineHeight:1.3,
                  }}>{h}</h3>
                  <p style={{fontSize:12.5, color:'rgba(255,255,255,.65)', lineHeight:1.65}}>{p}</p>
                </div>
              ))}
            </div>
          </div></section>

          {/* ═══════════════════════════════════════════
              HOMEPAGE FAQ — fast intent capture
              Visible accordion answers common questions
              on the homepage itself. Schema injected above.
          ═══════════════════════════════════════════ */}
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            <div className="sec-hd reveal" style={{textAlign:'center'}}>
              <div className="eyebrow" style={{justifyContent:'center'}}>Common questions</div>
              <h2 className="display">Quick <em>Answers</em></h2>
              <p className="lead" style={{marginTop:14,maxWidth:580,margin:'14px auto 0'}}>The most common questions, answered briefly. See the FAQ page for more.</p>
            </div>
            <div style={{maxWidth:780, margin:'36px auto 0'}}>
              {[
                ['What is Smartious Homeschool?', 'Smartious Homeschool & eSchool is an accredited international online school founded in Nairobi in 2018. We deliver Cambridge IGCSE, A-Level, IB Diploma, Edexcel and American curricula to over 2,000 students worldwide. All classes are live, taught by degree-qualified specialists.'],
                ['How much does Smartious cost?', 'From USD 85 per month for single subjects. Full-year programmes are USD 4,000–6,000 — a fraction of private international school fees. Payment plans and sibling discounts available.'],
                ['Will my child get a real qualification?', 'Yes. Students sit official Cambridge International, Pearson Edexcel, IB Diploma or American High School Diploma exams at British Council and Cambridge centres worldwide. Qualifications are identical to those from any other school.'],
                ['Which countries do you serve?', 'Dedicated country pages and support for the UAE, UK, USA, Canada, Australia, Nigeria, South Africa, Qatar, Egypt and Kenya. Live classes scheduled across time zones with recordings for asynchronous catch-up.'],
                ['How do online students socialise?', 'Daily live classes with international classmates. Wednesday enrichment programme (2–4 PM) with sports, clubs, leadership and arts. Active online clubs in debate, coding, AI, Model UN and journalism.'],
                ['Can my child join mid-year?', 'Yes. We accept enrolments year-round. Mid-year transfers are common for relocating families. We assess current academic level and place students at the right point with no loss of progress.'],
              ].map(([q, a], i) => (
                <details key={i} style={{
                  padding:'18px 22px', marginBottom:10,
                  background:V.white,
                  border:'1px solid '+V.line,
                  borderRadius:8, cursor:'pointer',
                }}>
                  <summary style={{
                    fontSize:15, fontWeight:700, color:V.ink,
                    listStyle:'none', outline:'none',
                  }}>{q}</summary>
                  <p style={{
                    fontSize:13.5, color:V.sl,
                    lineHeight:1.75, marginTop:12,
                  }}>{a}</p>
                </details>
              ))}
              <div style={{textAlign:'center', marginTop:24}}>
                <button className="btn-o" onClick={() => P('faq')}>
                  Full FAQ
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          </div></section>

          {/* HIGHLIGHTS */}
          <section className="sec" style={{background:V.bone}}>
            <div className="wrap">
              <div className="sec-hd reveal">
                <div className="eyebrow">Everything You Need</div>
                <h2 className="display">Explore <em>Smartious</em></h2>
                <p className="lead" style={{marginTop:14}}>A world-class education platform for ambitious families across 12+ countries. Tap any card to explore in full.</p>
              </div>
              <div className="hl-grid">
                {[
                  {n:'2,000+',h:'About Us',p:'98% pass rate · Est. 2018 · Our story & team',pg:'about',svg:'<circle cx="12" cy="8" r="4"/><path d="M6 21v-1a6 6 0 0 1 12 0v1"/>'},
                  {n:'9',h:'Curricula',p:'IGCSE · Cambridge · IB · British · American · CBC · Blended',pg:'curricula',svg:'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>'},
                  {n:'6',h:'Services',p:'Homeschool · Virtual · Centre · Tuition · Mshauri AI',pg:'services',svg:'<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>'},
                  {n:'12+',h:'Global Presence',p:'Kenya · UAE · UK · USA · Canada · Australia · +7 more',pg:'global',svg:'<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'},
                  {n:'$85',h:'Pricing',p:'Transparent USD pricing · No contracts · Cancel anytime',pg:'pricing',svg:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'},
                  {n:'2',h:'IUFP & Study Abroad',p:'University foundation · Placements in UK · USA · AU · DE · UAE',pg:'programs',svg:'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>'},
                  {n:'10',h:'FAQ',p:'Enrolment, exams, pricing & Mshauri AI answered',pg:'faq',svg:'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>'},
                  {n:'9',h:'Blog',p:'IGCSE guides · IB tips · Study abroad · AI learning',pg:'blog',svg:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'},
                ].map(({n,h,p,pg,svg}) => (
                  <a key={h}
                    href={'/' + pg}
                    onClick={e => { e.preventDefault(); P(pg) }}
                    className="hl reveal"
                    style={{textDecoration:'none', color:'inherit', display:'block'}}>
                    <div className="hl-ico">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={`${V.cr}`} strokeWidth="1.8" strokeLinecap="round" dangerouslySetInnerHTML={{__html:svg}}/>
                    </div>
                    <div className="hl-n">{n}</div>
                    <div className="hl-h">{h}</div>
                    <div className="hl-p">{p}</div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="sec" style={{background:V.white}}>
            <div className="wrap">
              <div className="sec-hd reveal">
                <div className="eyebrow">Student & Parent Voices</div>
                <h2 className="display">Stories That <em>Inspire</em></h2>
                <p className="lead" style={{marginTop:14}}>From London to Lagos, Nairobi to Toronto — real families, real results.</p>
              </div>
              <div className="tgrid">
                {[
                  {av:'JO',c:V.cr,q:'"My daughter moved from a C to an A* in IGCSE Chemistry in one term. The one-on-one attention she gets is something no classroom of 40 could ever offer."',n:'Janet Osei — London, UK',r:'Parent · IGCSE Year 11'},
                  {av:'AM',c:'#0891B2',q:'"We relocated from Dubai mid-year and I was worried about continuity. Smartious handled the British to IGCSE transition without my son missing a single topic."',n:'Ahmed Al-Mansouri — Dubai, UAE',r:'Parent · British Curriculum → IGCSE'},
                  {av:'ZK',c:'#15803D',q:'"I scored 38 IB points and received an offer from UCL. My Smartious tutors knew the syllabus inside out and pushed me further than I thought I could go."',n:'Zara Kamau — Nairobi, Kenya',r:'Student · IB Diploma Graduate'},
                  {av:'CA',c:'#B45309',q:'"My son struggled with the Nigerian curriculum and we needed a globally recognised qualification. IGCSE through Smartious gave him exactly that — he now studies Engineering in the UK."',n:'Chioma Adeyemi — Lagos, Nigeria',r:'Parent · IGCSE → UK University'},
                  {av:'SM',c:'#7C3AED',q:'"My daughter sat her Cambridge IGCSE examinations at a registered centre in Johannesburg and passed all eight subjects. Smartious made homeschooling feel completely professional."',n:'Sarah Mohale — Johannesburg, South Africa',r:'Parent · IGCSE Homeschool'},
                  {av:'BN',c:'#0E7490',q:'"I completed my A-Level Mathematics through Smartious while working full time in Nairobi. The flexible schedule and Mshauri AI tutor at night made it possible. I got a B and I am proud of it."',n:'Brian Njoroge — Nairobi, Kenya',r:'Adult Learner · Cambridge A-Level'},
                ].map((t,i) => (
                  <div key={i} className="tc reveal">
                    <Stars/>
                    <p className="t-q">{t.q}</p>
                    <div className="t-au">
                      <div className="t-av" style={{background:t.c}}>{t.av}</div>
                      <div><div className="t-nm">{t.n}</div><div className="t-rl">{t.r}</div></div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{textAlign:'center',marginTop:36}}>
                <button className="btn-o" onClick={() => P('about')}>More Stories <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
              </div>
            </div>
          </section>

          {/* CTA BAND */}
          <section className="cta-band">
            <div className="wrap"><div className="cta-in">
              <div className="eyebrow" style={{color:V.gold3,justifyContent:'center',marginBottom:18}}>Start Today</div>
              <h2 className="cta-h">Your Child's Best Education <em>Starts Here</em></h2>
              <p className="cta-sub">Join 2,000+ students across 12 countries. Flexible. International. Proven. From $85/month USD.</p>
              <div className="cta-btns">
                <button className="btn-p" onClick={() => P('enroll')}>Begin Enrollment <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                <button className="btn-o lt" onClick={() => P('pricing')}>View Pricing</button>
                <button className="btn-o lt" onClick={() => window.open('https://wa.me/254745021212?text=Hi%20Smartious%2C%20I%27d%20like%20more%20information%20about%20enrollment.','_blank')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.64 4.46 2 2 0 0 1 3.62 2.26h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.08 6.08l.97-.97a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.72 16.92z"/></svg>WhatsApp
                </button>
              </div>
            </div></div>
          </section>
          <Footer P={P}/>
        </>
      )}

      {/* ══════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════ */}
      {page === 'about' && (
        <>
          <div className="pg-hero"><div className="wrap"><div className="eyebrow">Proven Track Record</div><h1 className="pg-h">Results That Speak <em>For Themselves</em></h1><p className="pg-sub" style={{marginTop:12}}>Since 2018, Smartious has transformed how African and global families access world-class education.</p></div></div>
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            <div className="stat-grid">
              {[['2,000+','Students Graduated\nacross all programmes'],['98%','IGCSE Pass Rate\n2024 examinations'],['12+','Countries Served\nacross 4 continents'],['4.9','Parent Rating\naverage out of 5.0'],['150+','Certified Tutors\ndegree-level specialists'],['9','Curricula Offered\ninternationally recognised'],['50k+','AI Tutor Sessions\nvia Mshauri'],['340%','Enrolment Growth\nsince founding 2018']].map(([n,l]) => (
                <div key={n} className="sg">
                  <div className="sg-n"><em>{n}</em></div>
                  <div className="sg-l">{l.split('\n').map((line,i) => <span key={i}>{line}{i===0?<br/>:null}</span>)}</div>
                </div>
              ))}
            </div>
          </div></section>
          <section className="sec" style={{background:V.white}}><div className="wrap">
            <div className="sec-hd reveal"><div className="eyebrow">Simple Process</div><h2 className="display">From First Inquiry to <em>First Lesson</em></h2><p className="lead" style={{marginTop:12}}>Getting started with Smartious takes less than 48 hours.</p></div>
            <div className="proc-grid">
              {[
                {n:'01 / 04',svg:'<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',h:'Enroll & Choose',p:'Complete our 4-step form in 10 minutes. Select curriculum, learning mode and subjects. A $15 assessment fee secures your slot.',arr:true},
                {n:'02 / 04',svg:'<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4"/>',h:'Placement Assessment',p:'Your child takes a short adaptive test — 5 questions, 10 minutes. Results reviewed within 24 hours by our academic team.',arr:true},
                {n:'03 / 04',svg:'<circle cx="12" cy="8" r="4"/><path d="M6 21v-1a6 6 0 0 1 12 0v1"/>',h:'Meet Your Tutor',p:'We match your child to a qualified specialist. You receive a full tutor profile before committing to a single session.',arr:true},
                {n:'04 / 04',svg:'<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',h:'Learn & Track',p:'Learning starts within 48 hours. Full parent portal — attendance, scores, reports, direct tutor messaging. Mshauri AI 24/7.',arr:false},
              ].map((p,i) => (
                <div key={i} className="ps">
                  <div className="ps-n">{p.n}</div>
                  <div className="ps-ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={V.cr} strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html:p.svg}}/></div>
                  <div className="ps-h">{p.h}</div>
                  <div className="ps-p">{p.p}</div>
                  {p.arr && <div className="ps-arr"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>}
                </div>
              ))}
            </div>
          </div></section>
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            <div className="sec-hd reveal"><div className="eyebrow">Student & Parent Voices</div><h2 className="display">Stories That <em>Inspire</em></h2></div>
            <div className="tgrid">
              {[{av:'JO',c:V.cr,q:'"My daughter went from a C to an A* in IGCSE Chemistry in one term."',n:'Janet Osei — London',r:'Parent · IGCSE Year 11'},{av:'AM',c:'#0891B2',q:'"Smartious made the curriculum transition seamless — British to IGCSE."',n:'Ahmed Al-Mansouri — Dubai',r:'Parent · British → IGCSE'},{av:'ZK',c:'#15803D',q:'"I scored 38 IB points and got into UCL."',n:'Zara Kamau — Nairobi',r:'Student · IB → UCL'},{av:'CA',c:'#B45309',q:'"My kids in Toronto and cousins in Lagos study the same IGCSE online."',n:'Chioma Adeyemi — Toronto',r:'Parent · Virtual IGCSE'}].map((t,i) => (
                <div key={i} className="tc reveal"><Stars/><p className="t-q">{t.q}</p><div className="t-au"><div className="t-av" style={{background:t.c}}>{t.av}</div><div><div className="t-nm">{t.n}</div><div className="t-rl">{t.r}</div></div></div></div>
              ))}
            </div>
          </div></section>
          <section className="cta-band"><div className="wrap"><div className="cta-in"><h2 className="cta-h">Ready to Join <em>Smartious?</em></h2><p className="cta-sub">$15 placement · First lesson within 48 hours · Cancel anytime</p><div className="cta-btns"><button className="btn-p" onClick={() => P('enroll')}>Begin Enrollment <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button><button className="btn-o lt" onClick={() => P('pricing')}>View Pricing</button></div></div></div></section>
          <Footer P={P}/>
        </>
      )}

      {/* ══════════════════════════════════════════
          CURRICULA
      ══════════════════════════════════════════ */}
      {page === 'curricula' && (
        <>
          <div className="pg-hero"><div className="wrap"><div className="eyebrow">Internationally Recognised</div><h1 className="pg-h">Every Curriculum, <em>Fully Mastered</em></h1><p className="pg-sub" style={{marginTop:12}}>9 internationally accredited curricula, each taught by degree-qualified specialists.</p></div></div>
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            <div className="cur-grid">
              {CURRICULA.map((c,i) => (
                <div key={c.slug} className={`cc${c.gold?' cc-hl':''}`} onClick={() => openCurriculum(c.slug)}
                  style={{cursor:'pointer'}}>
                  <div className="cc-top">
                    <div className="cc-bar" style={c.gold?{background:'linear-gradient(90deg,#B8960C,#8B1A2E)'}:{}}/>
                    <div className="cc-badge" style={c.gold?{background:'rgba(184,150,12,.1)',color:V.gold,borderColor:'rgba(184,150,12,.2)'}:{}}>{c.badge}</div>
                    <div className="cc-h">{c.h}</div>
                    <div className="cc-desc">{c.desc}</div>
                  </div>
                  <div className="cc-body">
                    <div className="cc-tags">{c.tags.map(t => <span key={t} className="cc-tag">{t}</span>)}</div>
                    <div className="cc-meta">{c.meta.map(m => <span key={m}>{m}</span>)}</div>
                    <div style={{marginTop:14,display:'flex',alignItems:'center',gap:6,color:c.gold?V.gold:V.cr,fontWeight:700,fontSize:13,fontFamily:"'Syne',sans-serif"}}>
                      View full details
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center',marginTop:48}}>
              <button className="btn-p" onClick={() => P('enroll')}>Enroll in Any Curriculum <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
            </div>
          </div></section>

          {/* ═══════════════════════════════════════════════════════
              CURRICULUM PATHWAY DIAGRAM — visual SVG timeline
              Shows ages 6→18 with each curriculum tier mapped onto it.
              Replaces a chunk of plain-text explanation with a quick
              visual that parents can scan in 5 seconds.
          ═══════════════════════════════════════════════════════ */}
          <section className="sec" style={{background:'#fff'}}><div className="wrap">
            <div style={{textAlign:'center',maxWidth:780,margin:'0 auto 40px'}}>
              <div className="eyebrow" style={{justifyContent:'center'}}>How the curricula map together</div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                Your child's pathway, <em style={{color:V.cr}}>from age 6 to university</em>
              </h2>
              <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>Every curriculum we offer fits into a recognised global pathway. Here is how the eight pathways line up against your child's age, and which qualifications they earn at each stage.</p>
            </div>
            <div style={{maxWidth:1000,margin:'0 auto',background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'28px 22px 22px',overflowX:'auto'}}>
              <svg viewBox="0 0 960 410" style={{width:'100%',maxWidth:920,height:'auto',display:'block',margin:'0 auto',minWidth:560}} xmlns="http://www.w3.org/2000/svg" aria-label="Curriculum pathway from age 6 to university">
                <defs>
                  <linearGradient id="blendedGrad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#8B1A2E"/>
                    <stop offset="100%" stopColor="#B8960C"/>
                  </linearGradient>
                </defs>
                <line x1="60" y1="56" x2="900" y2="56" stroke="#0A0806" strokeWidth="1.5" opacity="0.4"/>
                {[6,8,10,12,14,16,18].map((age,i) => {
                  const x = 60 + (i * 140)
                  return (
                    <g key={age}>
                      <line x1={x} y1="52" x2={x} y2="60" stroke="#0A0806" strokeWidth="1.5" opacity="0.5"/>
                      <text x={x} y="40" textAnchor="middle" fontFamily="'Syne', sans-serif" fontWeight="700" fontSize="13" fill="#0A0806">Age {age}</text>
                    </g>
                  )
                })}
                <rect x="60" y="78" width="840" height="42" rx="6" fill="#8B1A2E" opacity="0.92"/>
                <text x="78" y="105" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="14" fill="#FEFDFB">Kenya CBC · KCSE</text>
                <text x="78" y="118" fontFamily="'Syne Mono', monospace" fontSize="10" letterSpacing="0.06em" fill="#F0CC5A" opacity="0.9">PRIMARY → JUNIOR → SENIOR SECONDARY</text>
                <rect x="60" y="130" width="560" height="42" rx="6" fill="#6B5E52" opacity="0.85"/>
                <text x="78" y="157" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="14" fill="#FEFDFB">British National Curriculum</text>
                <text x="78" y="170" fontFamily="'Syne Mono', monospace" fontSize="10" letterSpacing="0.06em" fill="#FEFDFB" opacity="0.75">YEAR 1 → YEAR 9</text>
                <rect x="620" y="130" width="140" height="42" rx="6" fill="#B8960C" opacity="0.95"/>
                <text x="638" y="157" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="13" fill="#0A0806">IGCSE / Edexcel</text>
                <text x="638" y="170" fontFamily="'Syne Mono', monospace" fontSize="10" letterSpacing="0.06em" fill="#0A0806" opacity="0.65">YEAR 10–11</text>
                <rect x="760" y="130" width="140" height="42" rx="6" fill="#8B1A2E"/>
                <text x="778" y="157" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="13" fill="#FEFDFB">A-Level</text>
                <text x="778" y="170" fontFamily="'Syne Mono', monospace" fontSize="10" letterSpacing="0.06em" fill="#F0CC5A">YEAR 12–13</text>
                <rect x="410" y="182" width="350" height="42" rx="6" fill="#2D261E" opacity="0.92"/>
                <text x="428" y="209" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="14" fill="#FEFDFB">IB Middle Years Programme</text>
                <text x="428" y="222" fontFamily="'Syne Mono', monospace" fontSize="10" letterSpacing="0.06em" fill="#F0CC5A" opacity="0.85">AGES 11–16</text>
                <rect x="760" y="182" width="140" height="42" rx="6" fill="#8B1A2E"/>
                <text x="778" y="209" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="13" fill="#FEFDFB">IB Diploma</text>
                <text x="778" y="222" fontFamily="'Syne Mono', monospace" fontSize="10" letterSpacing="0.06em" fill="#F0CC5A">AGES 16–19</text>
                <rect x="60" y="234" width="840" height="42" rx="6" fill="#1A1510" opacity="0.85"/>
                <text x="78" y="261" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="14" fill="#FEFDFB">American Curriculum</text>
                <text x="78" y="274" fontFamily="'Syne Mono', monospace" fontSize="10" letterSpacing="0.06em" fill="#F0CC5A" opacity="0.85">K → GRADE 12 · HIGH SCHOOL DIPLOMA</text>
                <rect x="410" y="286" width="490" height="42" rx="6" fill="url(#blendedGrad)"/>
                <text x="428" y="313" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="14" fill="#FEFDFB">Smartious Blended <tspan fontFamily="'Syne Mono', monospace" fontSize="9" letterSpacing="0.08em" fill="#F0CC5A" opacity="0.9">  ★ OUR SIGNATURE</tspan></text>
                <text x="428" y="326" fontFamily="'Syne Mono', monospace" fontSize="10" letterSpacing="0.06em" fill="#FEFDFB" opacity="0.8">CAMBRIDGE + CBC + AI LITERACY · AGES 11–18</text>
                <path d="M 900 348 L 920 348 M 916 344 L 920 348 L 916 352" stroke="#8B1A2E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <text x="850" y="370" textAnchor="end" fontFamily="'Playfair Display', serif" fontStyle="italic" fontWeight="700" fontSize="15" fill="#8B1A2E">University worldwide →</text>
                <text x="850" y="388" textAnchor="end" fontFamily="'Syne Mono', monospace" fontSize="9.5" letterSpacing="0.08em" fill="#6B5E52">UoN · STRATHMORE · USIU · OXFORD · MIT · TORONTO</text>
              </svg>
            </div>
            <p style={{textAlign:'center',marginTop:20,fontSize:13,color:V.sl3,maxWidth:680,margin:'20px auto 0',lineHeight:1.6}}>
              All pathways lead to recognised university entry. Children can switch curricula at natural transition points — we guide families through each decision.
            </p>
          </div></section>

          <Footer P={P}/>
        </>
      )}

      {/* ══════════════════════════════════════════
          CURRICULUM DETAIL PAGE
      ══════════════════════════════════════════ */}
      {page === 'curriculum-detail' && (() => {
        const c = currentCurriculum && CURRICULA.find(x => x.slug === currentCurriculum)
        if (!c) {
          return (
            <>
              <div className="pg-hero"><div className="wrap">
                <h1 className="pg-h">Curriculum not found</h1>
                <p className="pg-sub" style={{marginTop:12}}>This curriculum page could not be found.</p>
                <button className="btn-p" style={{marginTop:24}} onClick={() => P('curricula')}>← All Curricula</button>
              </div></div>
              <Footer P={P}/>
            </>
          )
        }
        const d = c.detail
        return (
          <>
            <div className="pg-hero" style={c.gold?{background:V.ink}:{}}>
              <div className="wrap">
                <button onClick={() => P('curricula')}
                  style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',color:'rgba(255,255,255,.85)',padding:'7px 14px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:"'Syne',sans-serif",marginBottom:22,display:'inline-flex',alignItems:'center',gap:6}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  All Curricula
                </button>
                <div className="eyebrow">{c.badge}</div>
                <h1 className="pg-h">{c.h}</h1>
                <p className="pg-sub" style={{marginTop:12}}>{d.tagline}</p>
                <div style={{marginTop:16,display:'inline-flex',alignItems:'center',gap:8,padding:'7px 14px',background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.14)',borderRadius:20,fontSize:13,color:'rgba(255,255,255,.9)'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {d.ageRange}
                </div>
              </div>
            </div>

            <section className="sec" style={{background:V.bone}}><div className="wrap" style={{maxWidth:860}}>
              {/* Overview */}
              <div style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:16,padding:'30px 32px',marginBottom:20}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',fontWeight:700,color:V.ink,marginBottom:12}}>Overview</h2>
                <p style={{fontSize:15,color:V.sl,lineHeight:1.85,margin:0}}>{d.overview}</p>
              </div>

              {/* Detail sections */}
              {d.sections.map((s,i) => (
                <div key={i} style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:16,padding:'26px 32px',marginBottom:16}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.25rem',fontWeight:700,color:V.cr,marginBottom:10}}>{s.h}</h3>
                  <p style={{fontSize:14.5,color:V.sl,lineHeight:1.85,margin:0}}>{s.p}</p>
                </div>
              ))}

              {/* Subjects / tags */}
              <div style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:16,padding:'26px 32px',marginBottom:16}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.25rem',fontWeight:700,color:V.cr,marginBottom:14}}>At a glance</h3>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {c.tags.map(t => (
                    <span key={t} style={{padding:'6px 13px',background:V.bone,border:`1px solid ${V.bone3}`,borderRadius:20,fontSize:12.5,fontWeight:600,color:V.ink2}}>{t}</span>
                  ))}
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:18,marginTop:16}}>
                  {c.meta.map(m => (
                    <div key={m} style={{fontSize:12.5,color:V.sl2,display:'flex',alignItems:'center',gap:6}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={V.gold} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Why choose this curriculum */}
              <div style={{background:c.gold?'linear-gradient(135deg,#2D261E,#1A1510)':V.cr,borderRadius:16,padding:'30px 32px',marginBottom:16}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',fontWeight:700,color:c.gold?V.gold3:V.white,marginBottom:10}}>Why choose {c.h}?</h3>
                <p style={{fontSize:14.5,color:'rgba(255,255,255,.85)',lineHeight:1.85,margin:0}}>{d.whyChoose}</p>
              </div>

              {/* Why Smartious for this curriculum */}
              <div style={{background:V.white,border:`2px solid ${V.gold}`,borderRadius:16,padding:'30px 32px',marginBottom:24}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',fontWeight:700,color:V.cr,marginBottom:10}}>Why Smartious is a top {c.h} provider</h3>
                <p style={{fontSize:14.5,color:V.sl,lineHeight:1.85,margin:0}}>
                  {d.whySmartious || `Smartious has taught the ${c.h} curriculum since 2018, with degree-qualified subject specialists, a full library of past papers and marking schemes, and a structured system of lesson planning, assessment and parent reporting. Families across Kenya and the diaspora choose Smartious for ${c.h} because it is delivered as a genuine, accredited school programme — online or at our Parklands, Nairobi centre — not informal tutoring. Every student is supported by the Mshauri AI tutor and a dedicated teacher, and prepared thoroughly for ${c.h} examinations.`}
                </p>
              </div>

              {/* CTA */}
              <div style={{textAlign:'center',display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
                <button className="btn-p" onClick={() => P('enroll')}>Enroll in {c.h} <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                <button className="btn-o" onClick={() => P('consult')}>Book a Free Consultation</button>
              </div>
            </div></section>
            <Footer P={P}/>
          </>
        )
      })()}

      {/* ══════════════════════════════════════════
          SERVICES
      ══════════════════════════════════════════ */}
      {page === 'services' && (
        <>
          <div className="pg-hero" style={{background:V.ink}}><div className="wrap"><div className="eyebrow">How We Deliver</div><h1 className="pg-h">Six Ways to <em>Learn with Us</em></h1><p className="pg-sub" style={{marginTop:12}}>Every family is different. We've built six service models so Smartious works wherever you are.</p></div></div>
          <section className="sec" style={{background:V.ink}}><div className="wrap">
            <div className="svc-grid">
              {SERVICES.map((s,i) => (
                <div key={s.slug} className="sc reveal" onClick={() => openService(s.slug)} style={{cursor:'pointer'}}>
                  <div className="sc-ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={V.cr} strokeWidth="1.8" strokeLinecap="round" dangerouslySetInnerHTML={{__html:s.svg}}/></div>
                  <div className="sc-h">{s.h}</div>
                  <div className="sc-p">{s.desc}</div>
                  <div className="sc-tags">{s.tags.map(t => <span key={t} className="sc-tag">{t}</span>)}</div>
                  <div className="sc-lnk">
                    View full details <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center',marginTop:48,display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
              <button className="btn-p" onClick={() => P('enroll')}>Enroll Now <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
              <button className="btn-o lt" onClick={() => P('pricing')}>Compare Prices</button>
            </div>
          </div></section>
          <Footer P={P}/>
        </>
      )}

      {/* ══════════════════════════════════════════
          SERVICE DETAIL PAGE
      ══════════════════════════════════════════ */}
      {page === 'service-detail' && (() => {
        const s = currentService && SERVICES.find(x => x.slug === currentService)
        if (!s) {
          return (
            <>
              <div className="pg-hero" style={{background:V.ink}}><div className="wrap">
                <h1 className="pg-h">Service not found</h1>
                <p className="pg-sub" style={{marginTop:12}}>This service page could not be found.</p>
                <button className="btn-p" style={{marginTop:24}} onClick={() => P('services')}>← All Services</button>
              </div></div>
              <Footer P={P}/>
            </>
          )
        }
        const d = s.detail
        return (
          <>
            <div className="pg-hero" style={{background:V.ink}}>
              <div className="wrap">
                <button onClick={() => P('services')}
                  style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',color:'rgba(255,255,255,.85)',padding:'7px 14px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:"'Syne',sans-serif",marginBottom:22,display:'inline-flex',alignItems:'center',gap:6}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  All Services
                </button>
                <div style={{width:48,height:48,borderRadius:12,background:'rgba(184,150,12,.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={V.gold3} strokeWidth="1.8" strokeLinecap="round" dangerouslySetInnerHTML={{__html:s.svg}}/>
                </div>
                <h1 className="pg-h">{s.h}</h1>
                <p className="pg-sub" style={{marginTop:12}}>{d.tagline}</p>
              </div>
            </div>

            <section className="sec" style={{background:V.bone}}><div className="wrap" style={{maxWidth:860}}>
              {/* Overview */}
              <div style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:16,padding:'30px 32px',marginBottom:20}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',fontWeight:700,color:V.ink,marginBottom:12}}>Overview</h2>
                <p style={{fontSize:15,color:V.sl,lineHeight:1.85,margin:0}}>{d.overview}</p>
              </div>

              {/* Detail sections */}
              {d.sections.map((sec,i) => (
                <div key={i} style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:16,padding:'26px 32px',marginBottom:16}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.25rem',fontWeight:700,color:V.cr,marginBottom:10}}>{sec.h}</h3>
                  <p style={{fontSize:14.5,color:V.sl,lineHeight:1.85,margin:0}}>{sec.p}</p>
                </div>
              ))}

              {/* At a glance */}
              <div style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:16,padding:'26px 32px',marginBottom:16}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.25rem',fontWeight:700,color:V.cr,marginBottom:14}}>At a glance</h3>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {s.tags.map(t => (
                    <span key={t} style={{padding:'6px 13px',background:V.bone,border:`1px solid ${V.bone3}`,borderRadius:20,fontSize:12.5,fontWeight:600,color:V.ink2}}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Why Smartious */}
              <div style={{background:V.cr,borderRadius:16,padding:'30px 32px',marginBottom:24}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',fontWeight:700,color:V.white,marginBottom:10}}>Why choose Smartious?</h3>
                <p style={{fontSize:14.5,color:'rgba(255,255,255,.85)',lineHeight:1.85,margin:0}}>{d.whySmartious}</p>
              </div>

              {/* CTA */}
              <div style={{textAlign:'center',display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
                <button className="btn-p" onClick={() => P('enroll')}>Enroll Now <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                <button className="btn-o" onClick={() => P('pricing')}>View Pricing</button>
              </div>
            </div></section>
            <Footer P={P}/>
          </>
        )
      })()}


      {/* ══════════════════════════════════════════
          COUNTRY-DETAIL — Country-specific landing pages
          One template renders all 10 countries from the COUNTRIES
          data array. URL pattern: /online-school/<slug>.
          FAQ schema injected per-page for Google AI Overviews.
      ══════════════════════════════════════════ */}
      {page === 'country-detail' && (() => {
        const ctry = COUNTRIES.find(c => c.slug === currentCountry)
        if (!ctry) return null
        return (
          <>
            {/* FAQ schema for this country */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              'mainEntity': ctry.faqs.map(f => ({
                '@type': 'Question',
                'name': f.q,
                'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
              })),
            })}}/>

            {/* Kenya-only structured data: LocalBusiness, Breadcrumb, Course */}
            {ctry.isKenya && (
              <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': ['EducationalOrganization', 'LocalBusiness'],
                  '@id': 'https://smartioushomeschool.com/online-school/kenya#org',
                  'name': 'Smartious Homeschool & eSchool',
                  'alternateName': 'Smartious eSchool',
                  'url': 'https://smartioushomeschool.com/online-school/kenya',
                  'logo': 'https://smartioushomeschool.com/logo.png',
                  'image': 'https://smartioushomeschool.com/og-kenya.jpg',
                  'description': 'Accredited international homeschool and online school based in Nairobi, Kenya. Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel, American curriculum and Kenya CBC. Founded 2018. 2,400+ students across 13 countries.',
                  'foundingDate': '2018',
                  'telephone': '+254745021212',
                  'email': 'hellosmartious@gmail.com',
                  'address': {
                    '@type': 'PostalAddress',
                    'streetAddress': 'Diamond Plaza I Annex, 3rd Floor, Office 20, Fourth Parklands Avenue',
                    'addressLocality': 'Parklands, Nairobi',
                    'addressRegion': 'Nairobi County',
                    'addressCountry': 'KE',
                  },
                  'geo': {
                    '@type': 'GeoCoordinates',
                    'latitude': ctry.address.lat,
                    'longitude': ctry.address.lng,
                  },
                  'areaServed': [
                    { '@type': 'Country', 'name': 'Kenya' },
                    { '@type': 'City', 'name': 'Nairobi' },
                    { '@type': 'City', 'name': 'Mombasa' },
                    { '@type': 'City', 'name': 'Kisumu' },
                    { '@type': 'City', 'name': 'Nakuru' },
                    { '@type': 'City', 'name': 'Eldoret' },
                  ],
                  'sameAs': [
                    'https://www.facebook.com/smartioushomeschool',
                    'https://www.instagram.com/smartioushomeschool',
                    'https://www.tiktok.com/@smartioushomeschool',
                  ],
                  'aggregateRating': {
                    '@type': 'AggregateRating',
                    'ratingValue': '5',
                    'reviewCount': '4',
                    'bestRating': '5',
                    'worstRating': '1',
                  },
                  'review': ctry.googleReviews.reviews.map(r => ({
                    '@type': 'Review',
                    'author': { '@type': 'Person', 'name': r.name },
                    'reviewRating': { '@type': 'Rating', 'ratingValue': r.rating, 'bestRating': '5' },
                    'reviewBody': r.text,
                  })),
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BreadcrumbList',
                  'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://smartioushomeschool.com/' },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Online School', 'item': 'https://smartioushomeschool.com/global' },
                    { '@type': 'ListItem', 'position': 3, 'name': 'Kenya', 'item': 'https://smartioushomeschool.com/online-school/kenya' },
                  ],
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'Cambridge IGCSE Online — Kenya',
                  'description': 'Live, online Cambridge IGCSE programme delivered to students in Kenya by degree-qualified specialists. Mathematics, Sciences, English, Business Studies and more. Exams sat at British Council Nairobi.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Secondary',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '360', 'category': 'Monthly tuition' },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'Cambridge A-Level & IB Diploma Online — Kenya',
                  'description': 'Sixth-form online programme for Kenyan students preparing for UK, US, Canadian and Kenyan universities. Cambridge A-Level and IB Diploma pathways available.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Pre-University',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '515', 'category': 'Monthly tuition' },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'Kenya CBC & KCSE Homeschool',
                  'description': 'Kenya\'s Competency-Based Curriculum (Grades 1-12) and KCSE preparation, taught by KICD/KNEC-aligned specialists. For families remaining in the Kenyan national pathway.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Primary & Secondary',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '180', 'category': 'Monthly tuition' },
                })}}/>
              </>
            )}

            {/* UAE-only structured data: Breadcrumb, Course, Service */}
            {ctry.isUae && (
              <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BreadcrumbList',
                  'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://smartioushomeschool.com/' },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Online School', 'item': 'https://smartioushomeschool.com/global' },
                    { '@type': 'ListItem', 'position': 3, 'name': 'United Arab Emirates', 'item': 'https://smartioushomeschool.com/online-school/uae' },
                  ],
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Service',
                  'serviceType': 'Online International Homeschool & Virtual School',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'areaServed': [
                    { '@type': 'Country', 'name': 'United Arab Emirates', '@id': 'https://www.wikidata.org/wiki/Q878' },
                    { '@type': 'City', 'name': 'Dubai' },
                    { '@type': 'City', 'name': 'Abu Dhabi' },
                    { '@type': 'City', 'name': 'Sharjah' },
                    { '@type': 'City', 'name': 'Ajman' },
                    { '@type': 'City', 'name': 'Ras Al Khaimah' },
                  ],
                  'description': 'Live online international homeschool serving expat and Emirati families across the UAE. Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel and American curricula on GST timezone.',
                  'offers': { '@type': 'AggregateOffer', 'priceCurrency': 'USD', 'lowPrice': '180', 'highPrice': '515', 'priceSpecification': { '@type': 'UnitPriceSpecification', 'unitText': 'MONTH' } },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'Cambridge IGCSE Online — UAE',
                  'description': 'Live, online Cambridge IGCSE programme for UAE-based students, taught on GST timezone by degree-qualified specialists. Exams sat at British Council Dubai and Abu Dhabi.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Secondary',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '360', 'category': 'Monthly tuition' },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'IB Diploma & A-Level Online — UAE',
                  'description': 'Sixth-form online programme for UAE students preparing for UAE private universities, UK, US, Canadian and Australian universities. Cambridge A-Level and IB Diploma pathways available, both delivered live on GST timezone.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Pre-University',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '515', 'category': 'Monthly tuition' },
                })}}/>
              </>
            )}

            {/* UK-only structured data: Breadcrumb, Course, Service */}
            {ctry.isUk && (
              <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BreadcrumbList',
                  'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://smartioushomeschool.com/' },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Online School', 'item': 'https://smartioushomeschool.com/global' },
                    { '@type': 'ListItem', 'position': 3, 'name': 'United Kingdom', 'item': 'https://smartioushomeschool.com/online-school/uk' },
                  ],
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Service',
                  'serviceType': 'Online Home Education & International Online School',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'areaServed': [
                    { '@type': 'Country', 'name': 'United Kingdom' },
                    { '@type': 'AdministrativeArea', 'name': 'England' },
                    { '@type': 'AdministrativeArea', 'name': 'Scotland' },
                    { '@type': 'AdministrativeArea', 'name': 'Wales' },
                    { '@type': 'AdministrativeArea', 'name': 'Northern Ireland' },
                    { '@type': 'City', 'name': 'London' },
                    { '@type': 'City', 'name': 'Manchester' },
                    { '@type': 'City', 'name': 'Birmingham' },
                    { '@type': 'City', 'name': 'Edinburgh' },
                  ],
                  'description': 'Live online international school accepting home education students from across the United Kingdom. Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel and AQA GCSE pathways. GMT/BST scheduling. Full UCAS application support.',
                  'offers': { '@type': 'AggregateOffer', 'priceCurrency': 'USD', 'lowPrice': '180', 'highPrice': '515', 'priceSpecification': { '@type': 'UnitPriceSpecification', 'unitText': 'MONTH' } },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'Cambridge IGCSE & GCSE Online — UK',
                  'description': 'Live, online IGCSE and AQA GCSE programmes for UK home-educating families. Taught on GMT/BST timezone by degree-qualified specialists. Examinations sat at Cambridge International, Pearson Edexcel and AQA private-candidate centres across the UK.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Secondary',
                  'inLanguage': 'en-GB',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '360', 'category': 'Monthly tuition' },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'A-Level & IB Diploma Online — UK with UCAS Support',
                  'description': 'A-Level and IB Diploma online programme for UK Year 12 and 13 students preparing for UCAS applications to Oxford, Cambridge, Russell Group and international universities. Full personal statement support, predicted grades, admissions test preparation (BMAT, UCAT, LNAT, TSA, TMUA).',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Pre-University',
                  'inLanguage': 'en-GB',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '515', 'category': 'Monthly tuition' },
                })}}/>
              </>
            )}

            {/* Nigeria-only structured data: Breadcrumb, Service, Course */}
            {ctry.isNigeria && (
              <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BreadcrumbList',
                  'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://smartioushomeschool.com/' },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Online School', 'item': 'https://smartioushomeschool.com/global' },
                    { '@type': 'ListItem', 'position': 3, 'name': 'Nigeria', 'item': 'https://smartioushomeschool.com/online-school/nigeria' },
                  ],
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Service',
                  'serviceType': 'Online International Homeschool & Virtual School',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'areaServed': [
                    { '@type': 'Country', 'name': 'Nigeria' },
                    { '@type': 'City', 'name': 'Lagos' },
                    { '@type': 'City', 'name': 'Abuja' },
                    { '@type': 'City', 'name': 'Port Harcourt' },
                    { '@type': 'City', 'name': 'Ibadan' },
                    { '@type': 'City', 'name': 'Kano' },
                  ],
                  'description': 'Live online international school serving families across Nigeria. Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel, American curriculum and WAEC preparation on WAT timezone. Affordable USD pricing with Naira payment support.',
                  'offers': { '@type': 'AggregateOffer', 'priceCurrency': 'USD', 'lowPrice': '180', 'highPrice': '515', 'priceSpecification': { '@type': 'UnitPriceSpecification', 'unitText': 'MONTH' } },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'WAEC SSCE Preparation Online — Nigeria',
                  'description': 'Live online West African Senior School Certificate Examination (WASSCE/WAEC) preparation programme for Nigerian students, taught by Nigerian-experienced subject specialists. Covers Mathematics, English Language, Sciences, Economics, Government, Literature and other WAEC subjects.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Senior Secondary',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '260', 'category': 'Monthly tuition' },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'Cambridge IGCSE Online — Nigeria',
                  'description': 'Live online Cambridge IGCSE programme for Nigerian students, taught on WAT timezone by degree-qualified specialists. Examinations sat at British Council Lagos, Abuja and Port Harcourt. JAMB Direct Entry eligible.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Secondary',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '360', 'category': 'Monthly tuition' },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'A-Level & IB Diploma Online — Nigeria',
                  'description': 'Sixth-form online programme for Nigerian students preparing for Nigerian universities (UNILAG, Covenant, ABU, OAU) via JAMB Direct Entry, and for UK, US, Canadian and Australian universities.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Pre-University',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '515', 'category': 'Monthly tuition' },
                })}}/>
              </>
            )}

            {/* USA-only structured data: Breadcrumb, Service, Course */}
            {ctry.isUsa && (
              <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BreadcrumbList',
                  'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://smartioushomeschool.com/' },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Online School', 'item': 'https://smartioushomeschool.com/global' },
                    { '@type': 'ListItem', 'position': 3, 'name': 'United States', 'item': 'https://smartioushomeschool.com/online-school/usa' },
                  ],
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Service',
                  'serviceType': 'International Online School for Globally Connected Families',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'areaServed': [
                    { '@type': 'Country', 'name': 'United States' },
                    { '@type': 'City', 'name': 'Houston' },
                    { '@type': 'City', 'name': 'Atlanta' },
                    { '@type': 'City', 'name': 'Washington' },
                    { '@type': 'City', 'name': 'New York' },
                    { '@type': 'City', 'name': 'Dallas' },
                    { '@type': 'City', 'name': 'Minneapolis' },
                    { '@type': 'City', 'name': 'Boston' },
                  ],
                  'audience': [
                    { '@type': 'EducationalAudience', 'audienceType': 'African diaspora families in the United States' },
                    { '@type': 'EducationalAudience', 'audienceType': 'Globally mobile families' },
                    { '@type': 'EducationalAudience', 'audienceType': 'Homeschoolers seeking international curriculum' },
                    { '@type': 'EducationalAudience', 'audienceType': 'Cambridge IGCSE and IB-track students' },
                  ],
                  'description': 'Live online international school for African diaspora families, globally mobile families, and homeschoolers across the United States. Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel and British curriculum. US-friendly live and recorded learning options.',
                  'offers': { '@type': 'AggregateOffer', 'priceCurrency': 'USD', 'lowPrice': '180', 'highPrice': '515', 'priceSpecification': { '@type': 'UnitPriceSpecification', 'unitText': 'MONTH' } },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'Cambridge IGCSE Online — USA',
                  'description': 'Live online Cambridge IGCSE programme for US-based students, with mid-morning Eastern Time class blocks and unlimited recordings. Exams sat at private-candidate centres across the United States. Suitable for African diaspora families, globally mobile families and US homeschoolers seeking international qualifications.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Secondary',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '360', 'category': 'Monthly tuition' },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'A-Level & IB Diploma Online — USA',
                  'description': 'Sixth-form online programme for US-based students preparing for Ivy League, state universities, UK Russell Group, Canadian U15 and African university applications. Cambridge A-Level and IB Diploma pathways with Common App and UCAS support.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Pre-University',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '515', 'category': 'Monthly tuition' },
                })}}/>
              </>
            )}

            {/* Canada-only structured data: Breadcrumb, Service, Course */}
            {ctry.isCanada && (
              <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BreadcrumbList',
                  'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://smartioushomeschool.com/' },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Online School', 'item': 'https://smartioushomeschool.com/global' },
                    { '@type': 'ListItem', 'position': 3, 'name': 'Canada', 'item': 'https://smartioushomeschool.com/online-school/canada' },
                  ],
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Service',
                  'serviceType': 'International Online School for Globally Connected Families',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'areaServed': [
                    { '@type': 'Country', 'name': 'Canada' },
                    { '@type': 'AdministrativeArea', 'name': 'Ontario' },
                    { '@type': 'AdministrativeArea', 'name': 'British Columbia' },
                    { '@type': 'AdministrativeArea', 'name': 'Alberta' },
                    { '@type': 'AdministrativeArea', 'name': 'Quebec' },
                    { '@type': 'City', 'name': 'Toronto' },
                    { '@type': 'City', 'name': 'Calgary' },
                    { '@type': 'City', 'name': 'Edmonton' },
                    { '@type': 'City', 'name': 'Ottawa' },
                    { '@type': 'City', 'name': 'Vancouver' },
                    { '@type': 'City', 'name': 'Montreal' },
                  ],
                  'audience': [
                    { '@type': 'EducationalAudience', 'audienceType': 'African and Caribbean diaspora families in Canada' },
                    { '@type': 'EducationalAudience', 'audienceType': 'South Asian families in Canada seeking Cambridge IGCSE and A-Level' },
                    { '@type': 'EducationalAudience', 'audienceType': 'Globally mobile Canadian families' },
                    { '@type': 'EducationalAudience', 'audienceType': 'Canadian homeschoolers seeking international curriculum' },
                  ],
                  'description': 'Live online international school for African and Caribbean diaspora families, South Asian families, globally mobile families and Cambridge-track homeschoolers across Canada. Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel. Canadian-friendly live and recorded learning options.',
                  'offers': { '@type': 'AggregateOffer', 'priceCurrency': 'USD', 'lowPrice': '180', 'highPrice': '515', 'priceSpecification': { '@type': 'UnitPriceSpecification', 'unitText': 'MONTH' } },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'Cambridge IGCSE Online — Canada',
                  'description': 'Live online Cambridge IGCSE programme for Canadian students, with mid-morning Eastern Time class blocks and unlimited recordings. Exams sat at Cambridge-authorised centres in Toronto, Calgary, Edmonton, Ottawa, Vancouver and Montreal. Suitable for African and Caribbean diaspora families, South Asian families, globally mobile families and Canadian homeschoolers.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Secondary',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '360', 'category': 'Monthly tuition' },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'A-Level & IB Diploma Online — Canada',
                  'description': 'Sixth-form online programme for Canadian students preparing for University of Toronto, McGill, UBC, Waterloo and other Canadian U15 universities, plus UK Russell Group, African and Caribbean universities. Cambridge A-Levels often earn first-year university credit at Canadian universities.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Pre-University',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '515', 'category': 'Monthly tuition' },
                })}}/>
              </>
            )}

            {/* Australia-only structured data: Breadcrumb, Service, Course */}
            {ctry.isAustralia && (
              <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BreadcrumbList',
                  'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://smartioushomeschool.com/' },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Online School', 'item': 'https://smartioushomeschool.com/global' },
                    { '@type': 'ListItem', 'position': 3, 'name': 'Australia', 'item': 'https://smartioushomeschool.com/online-school/australia' },
                  ],
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Service',
                  'serviceType': 'International Online School for Globally Connected Families',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'areaServed': [
                    { '@type': 'Country', 'name': 'Australia' },
                    { '@type': 'AdministrativeArea', 'name': 'New South Wales' },
                    { '@type': 'AdministrativeArea', 'name': 'Victoria' },
                    { '@type': 'AdministrativeArea', 'name': 'Queensland' },
                    { '@type': 'AdministrativeArea', 'name': 'Western Australia' },
                    { '@type': 'AdministrativeArea', 'name': 'South Australia' },
                    { '@type': 'City', 'name': 'Sydney' },
                    { '@type': 'City', 'name': 'Melbourne' },
                    { '@type': 'City', 'name': 'Brisbane' },
                    { '@type': 'City', 'name': 'Perth' },
                    { '@type': 'City', 'name': 'Adelaide' },
                  ],
                  'audience': [
                    { '@type': 'EducationalAudience', 'audienceType': 'South Asian families in Australia seeking Cambridge IGCSE and A-Level' },
                    { '@type': 'EducationalAudience', 'audienceType': 'African and Caribbean diaspora families in Australia' },
                    { '@type': 'EducationalAudience', 'audienceType': 'Returning expat Australian families' },
                    { '@type': 'EducationalAudience', 'audienceType': 'Regional and rural Australian homeschoolers' },
                  ],
                  'description': 'Live online international school for South Asian families, African diaspora families, returning expat Australians and Cambridge-pathway homeschoolers across Australia. Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel. Recordings-led delivery model designed for Australian time zones.',
                  'offers': { '@type': 'AggregateOffer', 'priceCurrency': 'USD', 'lowPrice': '180', 'highPrice': '515', 'priceSpecification': { '@type': 'UnitPriceSpecification', 'unitText': 'MONTH' } },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'Cambridge IGCSE Online — Australia',
                  'description': 'Live and recorded online Cambridge IGCSE programme for Australian students, delivered through recordings (primary), selected live sessions, and one-on-one tuition scheduled in Australian evening hours. Exams sat at Cambridge-authorised centres in Sydney, Melbourne, Brisbane, Perth, Adelaide and Canberra. Suitable for South Asian families, African diaspora families, returning expats and Australian homeschoolers.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Secondary',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '360', 'category': 'Monthly tuition' },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'A-Level & IB Diploma Online — Australia',
                  'description': 'Sixth-form online programme for Australian students preparing for the Group of Eight (Melbourne, Sydney, ANU, UNSW, UQ, Monash, Adelaide, UWA) plus UK Russell Group, Indian, US and African universities. Cambridge A-Level results convert to ATAR equivalents through UAC, VTAC, QTAC.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Pre-University',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '515', 'category': 'Monthly tuition' },
                })}}/>
              </>
            )}

            {/* Bahrain-only structured data: Breadcrumb, Service, Course */}
            {ctry.isBahrain && (
              <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BreadcrumbList',
                  'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://smartioushomeschool.com/' },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Online School', 'item': 'https://smartioushomeschool.com/global' },
                    { '@type': 'ListItem', 'position': 3, 'name': 'Bahrain', 'item': 'https://smartioushomeschool.com/online-school/bahrain' },
                  ],
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Service',
                  'serviceType': 'Online International Homeschool & Virtual School',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'areaServed': [
                    { '@type': 'Country', 'name': 'Bahrain' },
                    { '@type': 'City', 'name': 'Manama' },
                    { '@type': 'City', 'name': 'Riffa' },
                    { '@type': 'City', 'name': 'Muharraq' },
                    { '@type': 'City', 'name': 'Isa Town' },
                    { '@type': 'City', 'name': 'Hamad Town' },
                  ],
                  'description': 'Live online international school serving Bahraini families and expat residents across the Kingdom of Bahrain. Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel and British curriculum pathways on Bahrain-friendly time zone. Exams at British Council Manama.',
                  'offers': { '@type': 'AggregateOffer', 'priceCurrency': 'USD', 'lowPrice': '180', 'highPrice': '515', 'priceSpecification': { '@type': 'UnitPriceSpecification', 'unitText': 'MONTH' } },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'Cambridge IGCSE Online — Bahrain',
                  'description': 'Live online Cambridge IGCSE programme for Bahraini and expat families, taught in the UK & Africa time-zone band that aligns with Bahrain daytime hours. Examinations sat at British Council Manama. Suitable for Bahraini citizens, Indian, Pakistani, Filipino and Western expat families resident in Bahrain.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Secondary',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '360', 'category': 'Monthly tuition' },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'A-Level & IB Diploma Online — Bahrain',
                  'description': 'Sixth-form online programme for Bahrain-based students preparing for University of Bahrain, Gulf universities, UK Russell Group, US Ivy League, Canadian and Australian universities. Cambridge A-Level and IB Diploma pathways with UCAS and Common App support.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Pre-University',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '515', 'category': 'Monthly tuition' },
                })}}/>
              </>
            )}

            {/* Pakistan-only structured data: Breadcrumb, Service, Course */}
            {ctry.isPakistan && (
              <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BreadcrumbList',
                  'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://smartioushomeschool.com/' },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Online School', 'item': 'https://smartioushomeschool.com/global' },
                    { '@type': 'ListItem', 'position': 3, 'name': 'Pakistan', 'item': 'https://smartioushomeschool.com/online-school/pakistan' },
                  ],
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Service',
                  'serviceType': 'Online International Homeschool & Virtual School',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'areaServed': [
                    { '@type': 'Country', 'name': 'Pakistan' },
                    { '@type': 'City', 'name': 'Karachi' },
                    { '@type': 'City', 'name': 'Lahore' },
                    { '@type': 'City', 'name': 'Islamabad' },
                    { '@type': 'City', 'name': 'Rawalpindi' },
                    { '@type': 'City', 'name': 'Faisalabad' },
                    { '@type': 'City', 'name': 'Multan' },
                  ],
                  'description': 'Live online international school serving ambitious Pakistani families. Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel and British curriculum pathways. Exams sat at British Council Pakistan centres in Karachi, Lahore, Islamabad and Rawalpindi. Live UK & Africa-band classes during Pakistani afternoon hours.',
                  'offers': { '@type': 'AggregateOffer', 'priceCurrency': 'USD', 'lowPrice': '180', 'highPrice': '515', 'priceSpecification': { '@type': 'UnitPriceSpecification', 'unitText': 'MONTH' } },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'Cambridge IGCSE Online — Pakistan',
                  'description': 'Live online Cambridge IGCSE programme for Pakistani students, taught in the UK & Africa time-zone band during Pakistani afternoon hours. Examinations sat at British Council Pakistan centres in Karachi, Lahore, Islamabad and Rawalpindi. Pakistan was unaffected by the 2026 Cambridge UAE examination cancellations.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Secondary',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '360', 'category': 'Monthly tuition' },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'A-Level & IB Diploma Online — Pakistan',
                  'description': 'Sixth-form online programme for Pakistani students preparing for LUMS, IBA Karachi, NUST, Habib University, AKU and other Pakistani universities, plus UK Russell Group, US Ivy League, Canadian and Australian universities. Cambridge A-Level and IB Diploma pathways with UCAS and Common App support.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Pre-University',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '515', 'category': 'Monthly tuition' },
                })}}/>
              </>
            )}

            {/* South Africa-only structured data: Breadcrumb, Service, Course */}
            {ctry.isSouthAfrica && (
              <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BreadcrumbList',
                  'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://smartioushomeschool.com/' },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Online School', 'item': 'https://smartioushomeschool.com/global' },
                    { '@type': 'ListItem', 'position': 3, 'name': 'South Africa', 'item': 'https://smartioushomeschool.com/online-school/south-africa' },
                  ],
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Service',
                  'serviceType': 'Online International Homeschool & Virtual School',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'areaServed': [
                    { '@type': 'Country', 'name': 'South Africa' },
                    { '@type': 'AdministrativeArea', 'name': 'Gauteng' },
                    { '@type': 'AdministrativeArea', 'name': 'Western Cape' },
                    { '@type': 'AdministrativeArea', 'name': 'KwaZulu-Natal' },
                    { '@type': 'City', 'name': 'Johannesburg' },
                    { '@type': 'City', 'name': 'Sandton' },
                    { '@type': 'City', 'name': 'Cape Town' },
                    { '@type': 'City', 'name': 'Pretoria' },
                    { '@type': 'City', 'name': 'Durban' },
                  ],
                  'description': 'Live online international school serving South African families. Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel and British curriculum pathways. Exams sat at British Council South Africa centres in Johannesburg, Cape Town, Pretoria, Durban. Live UK & Africa-band classes during SA school hours. Compliant with the BELA Act 2024 framework for online schooling.',
                  'offers': { '@type': 'AggregateOffer', 'priceCurrency': 'USD', 'lowPrice': '180', 'highPrice': '515', 'priceSpecification': { '@type': 'UnitPriceSpecification', 'unitText': 'MONTH' } },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'Cambridge IGCSE Online — South Africa',
                  'description': 'Live online Cambridge IGCSE programme for South African students, taught in the UK & Africa time-zone band during SA school hours. Examinations sat at British Council South Africa centres and Cambridge-authorised centres across Johannesburg, Cape Town, Pretoria, Durban and Stellenbosch.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Secondary',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '360', 'category': 'Monthly tuition' },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'A-Level & IB Diploma Online — South Africa',
                  'description': 'Sixth-form online programme for South African students preparing for UCT, Wits, Stellenbosch, UP, UJ and other SA universities, plus UK Russell Group, US Ivy League, Canadian U15 and Australian Group of Eight universities. Cambridge A-Level often grants first-year credit at SA universities.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Pre-University',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '515', 'category': 'Monthly tuition' },
                })}}/>
              </>
            )}

            {/* Uganda-only structured data: Breadcrumb, Service, Course */}
            {ctry.isUganda && (
              <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BreadcrumbList',
                  'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://smartioushomeschool.com/' },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Online School', 'item': 'https://smartioushomeschool.com/global' },
                    { '@type': 'ListItem', 'position': 3, 'name': 'Uganda', 'item': 'https://smartioushomeschool.com/online-school/uganda' },
                  ],
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Service',
                  'serviceType': 'Online International School & Cambridge Curriculum Provider',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'areaServed': [
                    { '@type': 'Country', 'name': 'Uganda' },
                    { '@type': 'City', 'name': 'Kampala' },
                    { '@type': 'City', 'name': 'Entebbe' },
                    { '@type': 'City', 'name': 'Wakiso' },
                    { '@type': 'City', 'name': 'Mukono' },
                    { '@type': 'City', 'name': 'Jinja' },
                    { '@type': 'City', 'name': 'Mbarara' },
                  ],
                  'description': 'Live online international school serving Ugandan families. Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel and British curriculum pathways. Exams sat at British Council Uganda and authorised international school centres in Kampala. Live East Africa Time classes. Dual setup recommended for Ugandan citizen families pending NCDC homeschool policy.',
                  'offers': { '@type': 'AggregateOffer', 'priceCurrency': 'USD', 'lowPrice': '180', 'highPrice': '515', 'priceSpecification': { '@type': 'UnitPriceSpecification', 'unitText': 'MONTH' } },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'Cambridge IGCSE Online — Uganda',
                  'description': 'Live online Cambridge IGCSE programme for Ugandan students, taught in East Africa Time during Kampala school hours. Examinations sat at British Council Uganda exam centres and authorised international school centres in Kampala. Suitable as primary programme for expat families or as the substantive academic programme alongside local school registration for Ugandan citizen families.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Secondary',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '360', 'category': 'Monthly tuition' },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'A-Level & IB Diploma Online — Uganda',
                  'description': 'Sixth-form online programme for Ugandan students preparing for Makerere, Kyambogo, UCU, MUST and other Ugandan universities, plus UK Russell Group, US Ivy League, South African, Canadian and Australian universities. Cambridge A-Level accepted as equivalent to UACE for Ugandan university entry.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Pre-University',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '515', 'category': 'Monthly tuition' },
                })}}/>
              </>
            )}

            {/* Somalia-only structured data: Breadcrumb, Service, Course */}
            {ctry.isSomalia && (
              <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BreadcrumbList',
                  'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://smartioushomeschool.com/' },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Online School', 'item': 'https://smartioushomeschool.com/global' },
                    { '@type': 'ListItem', 'position': 3, 'name': 'Somalia', 'item': 'https://smartioushomeschool.com/online-school/somalia' },
                  ],
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Service',
                  'serviceType': 'Online International School & Cambridge Curriculum Provider',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'areaServed': [
                    { '@type': 'Country', 'name': 'Somalia' },
                    { '@type': 'City', 'name': 'Mogadishu' },
                    { '@type': 'City', 'name': 'Hargeisa' },
                    { '@type': 'City', 'name': 'Garowe' },
                    { '@type': 'City', 'name': 'Bosaso' },
                    { '@type': 'City', 'name': 'Kismayo' },
                  ],
                  'description': 'Live online international school serving Somali families. Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel and British curriculum pathways. Live East Africa Time classes. Exams sat at Mogadishu Cambridge-authorised centres or British Council Nairobi. USD pricing for dollarised Somali market.',
                  'offers': { '@type': 'AggregateOffer', 'priceCurrency': 'USD', 'lowPrice': '180', 'highPrice': '515', 'priceSpecification': { '@type': 'UnitPriceSpecification', 'unitText': 'MONTH' } },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'Cambridge IGCSE Online — Somalia',
                  'description': 'Live online Cambridge IGCSE programme for Somali students, taught in East Africa Time during Mogadishu school hours. Examinations sat at Cambridge-authorised Mogadishu schools (DIAS, Sunrise International Academy, others) or British Council Nairobi as backup. Suitable for Mogadishu-resident families, returning diaspora families, and globally mobile Somali families.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Secondary',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '360', 'category': 'Monthly tuition' },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'A-Level & IB Diploma Online — Somalia',
                  'description': 'Sixth-form online programme for Somali students preparing for Mogadishu University, SIMAD, Benadir, University of Hargeisa and other Somali universities, plus Turkish universities (popular for Somali students), Malaysian, Gulf, UK Russell Group, US, Canadian and Australian institutions.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Pre-University',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '515', 'category': 'Monthly tuition' },
                })}}/>
              </>
            )}

            {/* Tanzania-only structured data: Breadcrumb, Service, Course */}
            {ctry.isTanzania && (
              <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BreadcrumbList',
                  'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://smartioushomeschool.com/' },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Online School', 'item': 'https://smartioushomeschool.com/global' },
                    { '@type': 'ListItem', 'position': 3, 'name': 'Tanzania', 'item': 'https://smartioushomeschool.com/online-school/tanzania' },
                  ],
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Service',
                  'serviceType': 'Online International School & Cambridge Curriculum Provider',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'areaServed': [
                    { '@type': 'Country', 'name': 'Tanzania' },
                    { '@type': 'City', 'name': 'Dar es Salaam' },
                    { '@type': 'City', 'name': 'Arusha' },
                    { '@type': 'City', 'name': 'Mwanza' },
                    { '@type': 'City', 'name': 'Dodoma' },
                    { '@type': 'City', 'name': 'Zanzibar City' },
                    { '@type': 'City', 'name': 'Moshi' },
                  ],
                  'description': 'Live online international school serving Tanzanian families. Cambridge IGCSE, A-Level, IB Diploma, Pearson Edexcel and British curriculum pathways. Live East Africa Time classes. Exams sat at British Council Tanzania and authorised international school centres in Dar es Salaam. Cambridge pathway for families outside NECTA-registered schools.',
                  'offers': { '@type': 'AggregateOffer', 'priceCurrency': 'USD', 'lowPrice': '180', 'highPrice': '515', 'priceSpecification': { '@type': 'UnitPriceSpecification', 'unitText': 'MONTH' } },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'Cambridge IGCSE Online — Tanzania',
                  'description': 'Live online Cambridge IGCSE programme for Tanzanian students, taught in East Africa Time during Tanzanian school hours. Examinations sat at British Council Tanzania exam centres and authorised international school centres (IST, Braeburn Dar, HOPAC, St Constantine\'s, Aga Khan Mzizima) in Dar es Salaam and Arusha. The Cambridge pathway is the standard route for Tanzanian families educating outside NECTA-registered schools.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Secondary',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '360', 'category': 'Monthly tuition' },
                })}}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Course',
                  'name': 'A-Level & IB Diploma Online — Tanzania',
                  'description': 'Sixth-form online programme for Tanzanian students preparing for University of Dar es Salaam, Sokoine, Muhimbili, Mzumbe, UDOM and other Tanzanian universities, plus UK Russell Group, US Ivy League, South African, Canadian and Australian universities. Cambridge A-Level accepted as equivalent to ACSEE by the Tanzania Commission for Universities.',
                  'provider': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'sameAs': 'https://smartioushomeschool.com/' },
                  'educationalLevel': 'Pre-University',
                  'inLanguage': 'en',
                  'offers': { '@type': 'Offer', 'priceCurrency': 'USD', 'price': '515', 'category': 'Monthly tuition' },
                })}}/>
              </>
            )}

            {/* HERO */}
            <div className="pg-hero"><div className="wrap">
              <div className="eyebrow">{ctry.country}</div>
              <h1 className="pg-h">{ctry.h.split(' ').slice(0, -2).join(' ')} <em>{ctry.h.split(' ').slice(-2).join(' ')}</em></h1>
              <p className="pg-sub" style={{marginTop:12}}>{ctry.tagline}</p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:18}}>
                {ctry.localFacts.map(f => (
                  <span key={f} style={{
                    fontSize:11.5, fontWeight:600,
                    color:V.gold3,
                    background:'rgba(240,204,90,.1)',
                    border:'1px solid rgba(240,204,90,.25)',
                    padding:'5px 12px', borderRadius:99,
                  }}>{f}</span>
                ))}
              </div>
              <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:24}}>
                <button className="btn-p" onClick={() => P('enroll')}>Enroll Now <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                <button className="btn-o lt" onClick={() => P('consult')}>Book Consultation</button>
                <a href={'https://wa.me/254745021212?text=' + encodeURIComponent('Hi Smartious, I would like more information about online school for families in ' + ctry.country + '.')}
                  target="_blank" rel="noopener noreferrer"
                  className="btn-o lt" style={{textDecoration:'none'}}>
                  WhatsApp Us
                </a>
              </div>
            </div></div>

            {/* WHY SMARTIOUS — PAIN POINTS */}
            <section className="sec" style={{background:V.bone}}><div className="wrap">
              <div style={{maxWidth:780}}>
                <div className="eyebrow">Why families in {ctry.country} choose Smartious</div>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.2}}>
                  Real curriculum continuity. <em style={{color:V.cr}}>Real exam credentials.</em>
                </h2>
                <p style={{fontSize:15,color:V.sl,lineHeight:1.8}}>{ctry.pains}</p>
              </div>
            </div></section>

            {/* CURRICULA OFFERED */}
            <section className="sec" style={{background:'#fff'}}><div className="wrap">
              <div style={{textAlign:'center',marginBottom:32}}>
                <div className="eyebrow" style={{justifyContent:'center'}}>Curricula in {ctry.country}</div>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:8}}>
                  Globally recognised, <em style={{color:V.cr}}>locally available</em>
                </h2>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'center'}}>
                {ctry.curricula.map(c => (
                  <div key={c} style={{
                    background:V.bone, border:'1px solid '+V.line,
                    borderRadius:99, padding:'10px 22px',
                    fontSize:14, fontWeight:600, color:V.ink,
                  }}>{c}</div>
                ))}
              </div>
              <p style={{textAlign:'center',marginTop:24,fontSize:13.5,color:V.sl,maxWidth:580,margin:'24px auto 0',lineHeight:1.7}}>
                All curricula are taught live by degree-qualified subject specialists, with full past paper access, mock exam programmes and university application support.
              </p>
            </div></section>

            {/* REGULATION / LEGAL */}
            <section className="sec" style={{background:V.bone}}><div className="wrap">
              <div style={{maxWidth:780,margin:'0 auto'}}>
                <div className="eyebrow">Legal &amp; Regulatory</div>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.8rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.25}}>
                  Homeschooling in {ctry.country}
                </h2>
                <p style={{fontSize:14.5,color:V.sl,lineHeight:1.8,marginBottom:24}}>{ctry.regulation}</p>

                <div className="eyebrow">Examination centres</div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.4rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14}}>
                  Where students sit their exams
                </h3>
                <p style={{fontSize:14.5,color:V.sl,lineHeight:1.8}}>{ctry.examCentres}</p>
              </div>
            </div></section>

            {/* TESTIMONIAL — only show if a testimonial is supplied */}
            {ctry.testimonial && (
              <section className="sec" style={{background:V.ink,color:'#fff'}}><div className="wrap">
                <div style={{maxWidth:780,margin:'0 auto',textAlign:'center'}}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill={V.gold2} style={{opacity:.7,marginBottom:18}}>
                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                  </svg>
                  <p style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',fontStyle:'italic',lineHeight:1.5,color:'#fff',marginBottom:20}}>
                    "{ctry.testimonial}"
                  </p>
                  <div style={{fontSize:12,color:V.gold3,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase'}}>
                    {ctry.testimonialAuthor}
                  </div>
                </div>
              </div></section>
            )}

            {/* FAQ */}
            <section className="sec" style={{background:'#fff'}}><div className="wrap">
              <div style={{maxWidth:780,margin:'0 auto'}}>
                <div style={{textAlign:'center',marginBottom:32}}>
                  <div className="eyebrow" style={{justifyContent:'center'}}>Frequently asked</div>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8}}>
                    Questions from {ctry.country} <em style={{color:V.cr}}>families</em>
                  </h2>
                </div>
                {ctry.faqs.map((f, i) => (
                  <details key={i} style={{
                    padding:'18px 20px', marginBottom:10,
                    background:V.bone,
                    border:'1px solid '+V.line,
                    borderRadius:8, cursor:'pointer',
                  }}>
                    <summary style={{fontSize:15,fontWeight:700,color:V.ink,listStyle:'none',outline:'none'}}>
                      {f.q}
                    </summary>
                    <p style={{fontSize:14,color:V.sl,lineHeight:1.75,marginTop:12}}>
                      {f.a}
                    </p>
                  </details>
                ))}
              </div>
            </div></section>

            {/* CITIES (local SEO) */}
            <section className="sec" style={{background:V.bone}}><div className="wrap">
              <div style={{textAlign:'center',marginBottom:24}}>
                <div className="eyebrow" style={{justifyContent:'center'}}>Cities we serve in {ctry.country}</div>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8}}>
                  Online learning, available <em style={{color:V.cr}}>everywhere</em>
                </h2>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',maxWidth:680,margin:'0 auto'}}>
                {ctry.cities.map(city => (
                  <div key={city} style={{
                    background:'#fff', border:'1px solid '+V.line,
                    padding:'8px 16px', borderRadius:99,
                    fontSize:13, fontWeight:600, color:V.sl,
                  }}>{city}</div>
                ))}
              </div>
            </div></section>


            {/* KENYA-ONLY RICH SECTIONS — only render when ctry.isKenya is true */}
            {ctry.isKenya && (
              <>
                {/* WHY KENYANS SWITCH */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:44,maxWidth:780,margin:'0 auto 44px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>What we hear from parents</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.whyKenyans.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8}}>{ctry.whyKenyans.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.whyKenyans.points.map((pt,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'24px 22px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:700,color:V.cr,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:14,color:V.sl,lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* NAIROBI LEARNING CENTRE */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,alignItems:'center',maxWidth:1100,margin:'0 auto'}} className="kenya-centre-grid">
                    <div>
                      <div className="eyebrow">Nairobi · Parklands</div>
                      <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.25}}>
                        {ctry.learningCentre.heading}
                      </h2>
                      <p style={{fontSize:14.5,color:V.sl,lineHeight:1.8,marginBottom:18}}>{ctry.learningCentre.intro}</p>
                      <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:10,padding:'16px 18px',marginBottom:18}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold2,marginBottom:8}}>Visit us</div>
                        <div style={{fontSize:14.5,color:V.ink,fontWeight:600,lineHeight:1.6}}>
                          {ctry.address.building}<br/>
                          {ctry.address.floor}<br/>
                          {ctry.address.street}<br/>
                          {ctry.address.area}, {ctry.address.city}<br/>
                          {ctry.address.country}
                        </div>
                      </div>
                      <a href="https://www.google.com/maps/place/Smartious+Homeschool+and+Tuition,+Diamond+Plaza,+Fourth+Parklands+Ave,+Nairobi/@-1.2573424,36.8182174,17z"
                         target="_blank" rel="noopener noreferrer"
                         style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 22px',borderRadius:8,background:V.cr,color:'#fff',textDecoration:'none',fontSize:13.5,fontWeight:700}}>
                        Open in Google Maps
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 17l10-10M17 17V7H7"/></svg>
                      </a>
                    </div>
                    <div style={{borderRadius:14,overflow:'hidden',border:'1px solid '+V.line,boxShadow:'0 12px 40px rgba(10,8,6,.10)',minHeight:340}}>
                      <iframe
                        src={ctry.learningCentre.mapEmbed}
                        width="100%" height="380"
                        style={{border:0,display:'block'}}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Smartious Nairobi Learning Centre — Diamond Plaza I Annex, Parklands"
                      />
                    </div>
                  </div>
                </div></section>

                {/* ACTIVITIES TEASER */}
                <section className="sec" style={{background:'#fff',padding:'56px 0'}}><div className="wrap">
                  <div style={{maxWidth:760,margin:'0 auto',textAlign:'center'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Wednesday enrichment</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.3}}>
                      {ctry.activitiesTeaser.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8,marginBottom:22}}>{ctry.activitiesTeaser.body}</p>
                    <a href={ctry.activitiesTeaser.linkHref}
                       onClick={(e) => { e.preventDefault(); P('activities') }}
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 24px',borderRadius:8,background:'transparent',color:V.cr,border:'1.5px solid '+V.cr,textDecoration:'none',fontSize:13.5,fontWeight:700,cursor:'pointer'}}>
                      {ctry.activitiesTeaser.linkLabel}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                </div></section>

                {/* COMPARISON TABLE */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>How we compare</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.comparison.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.comparison.intro}</p>
                  </div>
                  <div style={{maxWidth:1000,margin:'0 auto',background:'#fff',border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>&nbsp;</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>Traditional Nairobi school</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Smartious</div>
                    </div>
                    {ctry.comparison.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 18px',fontSize:13.5,fontWeight:700,color:V.ink,background:V.bone}}>{r.feature}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.sl,lineHeight:1.5}}>{r.traditional}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.ink,lineHeight:1.5,fontWeight:600}}>{r.smartious}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* UNIVERSITY PATHWAYS */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>University pathways</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.universities.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.universities.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:1000,margin:'0 auto'}} className="kenya-uni-grid">
                    <div style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:10}}>Kenya</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>Local universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.universities.local.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold2,marginBottom:10}}>Worldwide</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>International universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.universities.international.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div></section>

                {/* PRICING TABLE */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Fees in Kenya</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.pricingTable.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.pricingTable.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:18,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.pricingTable.modes.map((m,i) => (
                      <div key={i} style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'22px 22px 24px'}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:12,paddingBottom:12,borderBottom:'1px solid '+V.line}}>{m.mode}</div>
                        {m.plans.map((p,j) => (
                          <div key={j} style={{paddingBottom:14,marginBottom:14,borderBottom:j===m.plans.length-1?'none':'1px solid '+V.line}}>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700,color:V.ink,marginBottom:3}}>{p.name}</div>
                            <div style={{fontSize:12,color:V.sl3,marginBottom:6}}>{p.who}</div>
                            <div style={{fontSize:18,fontWeight:800,color:V.cr,letterSpacing:'-.01em'}}>USD {p.usd}</div>
                            {p.kes && <div style={{fontSize:12,color:V.sl3,marginTop:2}}>{p.kes}</div>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl,maxWidth:680,margin:'24px auto 0',lineHeight:1.7}}>{ctry.pricingTable.note}</p>
                  <div style={{textAlign:'center',marginTop:24}}>
                    <button className="btn-p" onClick={() => P('enroll')}>Begin Enrolment
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div></section>

                {/* STUDENT VOICE — YouTube Shorts testimonial video */}
                <section className="sec" style={{background:V.ink,color:'#fff',paddingTop:64,paddingBottom:64}}><div className="wrap">
                  <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:48,alignItems:'center',maxWidth:1000,margin:'0 auto'}} className="kenya-video-grid">
                    <div>
                      <div className="eyebrow" style={{color:V.gold3}}>Student voice</div>
                      <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,marginTop:8,marginBottom:14,lineHeight:1.25,color:'#fff'}}>
                        Hear from a <em style={{color:V.gold3}}>Smartious student</em>
                      </h2>
                      <p style={{fontSize:14.5,color:'rgba(255,255,255,.78)',lineHeight:1.75,marginBottom:18}}>
                        The most honest review of a school comes from the student. Real students, real lessons, real progress — captured on camera. Press play to hear what learning at Smartious actually feels like.
                      </p>
                      <p style={{fontSize:13,color:'rgba(255,255,255,.55)',lineHeight:1.6}}>
                        For more student stories, follow us on YouTube, TikTok and Instagram.
                      </p>
                    </div>
                    <div style={{borderRadius:18,overflow:'hidden',border:'2px solid rgba(184,150,12,.3)',boxShadow:'0 20px 60px rgba(0,0,0,.5)',background:'#000',aspectRatio:'9/16',maxWidth:320,margin:'0 auto'}}>
                      <iframe
                        src="https://www.youtube.com/embed/sBOgk274_eQ?rel=0&modestbranding=1&playsinline=1"
                        title="Smartious student testimonial"
                        style={{width:'100%',height:'100%',border:0,display:'block'}}
                        loading="lazy"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div></section>

                {/* GOOGLE REVIEWS */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Verified Google reviews</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.googleReviews.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.googleReviews.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:18,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.googleReviews.reviews.map((r,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'22px 22px 24px',display:'flex',flexDirection:'column'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                          <div style={{width:38,height:38,borderRadius:'50%',background:V.cr,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:15}}>{r.name.charAt(0)}</div>
                          <div>
                            <div style={{fontSize:14,fontWeight:700,color:V.ink}}>{r.name}</div>
                            <div style={{fontSize:11.5,color:V.sl3}}>{r.context}</div>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:2,marginBottom:10}}>
                          {Array.from({length:r.rating}).map((_,j) => (
                            <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill={V.gold2}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          ))}
                          <span style={{fontSize:11.5,color:V.sl3,marginLeft:6}}>{r.date}</span>
                        </div>
                        <p style={{fontSize:13.5,color:V.sl,lineHeight:1.65,flex:1}}>&ldquo;{r.text}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                  <div style={{textAlign:'center',marginTop:24}}>
                    <a href={ctry.googleReviews.profileLink} target="_blank" rel="noopener noreferrer"
                       style={{fontSize:13,color:V.sl,textDecoration:'underline'}}>See all reviews on Google →</a>
                  </div>
                </div></section>
              </>
            )}

            {/* /KENYA-ONLY RICH SECTIONS */}

            {/* UAE-ONLY RICH SECTIONS — only render when ctry.isUae is true */}
            {ctry.isUae && (
              <>
                {/* WHY UAE FAMILIES SWITCH */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:44,maxWidth:780,margin:'0 auto 44px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>What we hear from UAE parents</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.whyExpats.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8}}>{ctry.whyExpats.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.whyExpats.points.map((pt,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'24px 22px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:700,color:V.cr,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:14,color:V.sl,lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* ACTIVITIES TEASER */}
                <section className="sec" style={{background:V.bone,padding:'56px 0'}}><div className="wrap">
                  <div style={{maxWidth:760,margin:'0 auto',textAlign:'center'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Wednesday enrichment</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.3}}>
                      {ctry.activitiesTeaser.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8,marginBottom:22}}>{ctry.activitiesTeaser.body}</p>
                    <a href={ctry.activitiesTeaser.linkHref}
                       onClick={(e) => { e.preventDefault(); P('activities') }}
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 24px',borderRadius:8,background:'transparent',color:V.cr,border:'1.5px solid '+V.cr,textDecoration:'none',fontSize:13.5,fontWeight:700,cursor:'pointer'}}>
                      {ctry.activitiesTeaser.linkLabel}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                </div></section>

                {/* COMPARISON TABLE */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>How we compare</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.uaeComparison.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.uaeComparison.intro}</p>
                  </div>
                  <div style={{maxWidth:1000,margin:'0 auto',background:V.bone,border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>&nbsp;</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>Typical Dubai school</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Smartious</div>
                    </div>
                    {ctry.uaeComparison.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 18px',fontSize:13.5,fontWeight:700,color:V.ink,background:'#fff'}}>{r.feature}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.sl,lineHeight:1.5}}>{r.traditional}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.ink,lineHeight:1.5,fontWeight:600}}>{r.smartious}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* UNIVERSITY PATHWAYS */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>University pathways</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.uaeUniversities.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.uaeUniversities.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:1000,margin:'0 auto'}} className="kenya-uni-grid">
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:10}}>UAE & Region</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>Regional universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.uaeUniversities.regional.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold2,marginBottom:10}}>Worldwide</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>International universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.uaeUniversities.international.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl3,maxWidth:780,margin:'24px auto 0',lineHeight:1.6,fontStyle:'italic'}}>{ctry.uaeUniversities.caveat}</p>
                </div></section>

                {/* PRICING TABLE — UAE */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Fees in the UAE</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.uaePricing.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.uaePricing.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:18,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.uaePricing.modes.map((m,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'22px 22px 24px'}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:12,paddingBottom:12,borderBottom:'1px solid '+V.line}}>{m.mode}</div>
                        {m.plans.map((p,j) => (
                          <div key={j} style={{paddingBottom:14,marginBottom:14,borderBottom:j===m.plans.length-1?'none':'1px solid '+V.line}}>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700,color:V.ink,marginBottom:3}}>{p.name}</div>
                            <div style={{fontSize:12,color:V.sl3,marginBottom:6}}>{p.who}</div>
                            <div style={{fontSize:18,fontWeight:800,color:V.cr,letterSpacing:'-.01em'}}>USD {p.usd}</div>
                            {p.aed && <div style={{fontSize:12,color:V.sl3,marginTop:2}}>{p.aed}</div>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl,maxWidth:680,margin:'24px auto 0',lineHeight:1.7}}>{ctry.uaePricing.note}</p>
                  <div style={{textAlign:'center',marginTop:24,display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    <button className="btn-p" onClick={() => P('enroll')}>Begin Enrolment
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <a href={'https://wa.me/254745021212?text=' + encodeURIComponent('Hi Smartious, I would like to enrol my child from the UAE.')}
                       target="_blank" rel="noopener noreferrer"
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'13px 26px',borderRadius:8,background:'#25D366',color:'#fff',textDecoration:'none',fontSize:13.5,fontWeight:700}}>
                      WhatsApp Inquiry
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.4-1.2c-.3-.2-.7-.1-.9.1l-.7.8c-.2.2-.5.3-.7.1-.9-.4-1.9-1.1-2.6-1.9-.7-.8-1.4-1.7-1.7-2.7-.1-.3 0-.5.2-.7l.8-.7c.3-.2.4-.6.1-.9L8.4 4.7c-.2-.4-.7-.5-1-.2L5.6 6.3c-.6.6-.8 1.5-.6 2.4.7 2.7 2.2 5 4.4 6.8 2.1 1.7 4.6 2.8 7.3 3.1.9.1 1.7-.2 2.3-.9l1.6-1.7c.3-.3.2-.8-.2-1l-2.9-1.8z"/></svg>
                    </a>
                  </div>
                </div></section>
              </>
            )}
            {/* /UAE-ONLY RICH SECTIONS */}

            {/* UK-ONLY RICH SECTIONS — only render when ctry.isUk is true */}
            {ctry.isUk && (
              <>
                {/* WHY UK FAMILIES SWITCH */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:44,maxWidth:780,margin:'0 auto 44px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>What we hear from UK parents</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.whyUk.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8}}>{ctry.whyUk.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.whyUk.points.map((pt,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'24px 22px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:700,color:V.cr,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:14,color:V.sl,lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* ACTIVITIES TEASER */}
                <section className="sec" style={{background:V.bone,padding:'56px 0'}}><div className="wrap">
                  <div style={{maxWidth:760,margin:'0 auto',textAlign:'center'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Wednesday enrichment</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.3}}>
                      {ctry.activitiesTeaser.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8,marginBottom:22}}>{ctry.activitiesTeaser.body}</p>
                    <a href={ctry.activitiesTeaser.linkHref}
                       onClick={(e) => { e.preventDefault(); P('activities') }}
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 24px',borderRadius:8,background:'transparent',color:V.cr,border:'1.5px solid '+V.cr,textDecoration:'none',fontSize:13.5,fontWeight:700,cursor:'pointer'}}>
                      {ctry.activitiesTeaser.linkLabel}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                </div></section>

                {/* COMPARISON TABLE */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>How we compare</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.ukComparison.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.ukComparison.intro}</p>
                  </div>
                  <div style={{maxWidth:1000,margin:'0 auto',background:V.bone,border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>&nbsp;</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>UK independent school</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Smartious</div>
                    </div>
                    {ctry.ukComparison.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 18px',fontSize:13.5,fontWeight:700,color:V.ink,background:'#fff'}}>{r.feature}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.sl,lineHeight:1.5}}>{r.traditional}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.ink,lineHeight:1.5,fontWeight:600}}>{r.smartious}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* UNIVERSITY PATHWAYS */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>University pathways</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.ukUniversities.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.ukUniversities.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:1000,margin:'0 auto'}} className="kenya-uni-grid">
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:10}}>United Kingdom</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>UK universities (UCAS)</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.ukUniversities.domestic.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold2,marginBottom:10}}>International</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>International universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.ukUniversities.international.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div></section>

                {/* PRICING TABLE — UK */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Fees in the UK</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.ukPricing.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.ukPricing.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:18,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.ukPricing.modes.map((m,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'22px 22px 24px'}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:12,paddingBottom:12,borderBottom:'1px solid '+V.line}}>{m.mode}</div>
                        {m.plans.map((p,j) => (
                          <div key={j} style={{paddingBottom:14,marginBottom:14,borderBottom:j===m.plans.length-1?'none':'1px solid '+V.line}}>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700,color:V.ink,marginBottom:3}}>{p.name}</div>
                            <div style={{fontSize:12,color:V.sl3,marginBottom:6}}>{p.who}</div>
                            <div style={{fontSize:18,fontWeight:800,color:V.cr,letterSpacing:'-.01em'}}>USD {p.usd}</div>
                            {p.gbp && <div style={{fontSize:12,color:V.sl3,marginTop:2}}>{p.gbp}</div>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl,maxWidth:680,margin:'24px auto 0',lineHeight:1.7}}>{ctry.ukPricing.note}</p>
                  <div style={{textAlign:'center',marginTop:24,display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    <button className="btn-p" onClick={() => P('enroll')}>Begin Enrolment
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <button className="btn-o" style={{borderColor:V.cr,color:V.cr}} onClick={() => P('consult')}>Book Free Consultation</button>
                  </div>
                </div></section>
              </>
            )}
            {/* /UK-ONLY RICH SECTIONS */}

            {/* NIGERIA-ONLY RICH SECTIONS — only render when ctry.isNigeria is true */}
            {ctry.isNigeria && (
              <>
                {/* WHY NIGERIAN FAMILIES SWITCH */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:44,maxWidth:780,margin:'0 auto 44px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>What we hear from Nigerian parents</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.whyNigerians.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8}}>{ctry.whyNigerians.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.whyNigerians.points.map((pt,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'24px 22px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:700,color:V.cr,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:14,color:V.sl,lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* ACTIVITIES TEASER */}
                <section className="sec" style={{background:V.bone,padding:'56px 0'}}><div className="wrap">
                  <div style={{maxWidth:760,margin:'0 auto',textAlign:'center'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Wednesday enrichment</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.3}}>
                      {ctry.activitiesTeaser.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8,marginBottom:22}}>{ctry.activitiesTeaser.body}</p>
                    <a href={ctry.activitiesTeaser.linkHref}
                       onClick={(e) => { e.preventDefault(); P('activities') }}
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 24px',borderRadius:8,background:'transparent',color:V.cr,border:'1.5px solid '+V.cr,textDecoration:'none',fontSize:13.5,fontWeight:700,cursor:'pointer'}}>
                      {ctry.activitiesTeaser.linkLabel}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                </div></section>

                {/* COMPARISON TABLE */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>How we compare</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.nigeriaComparison.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.nigeriaComparison.intro}</p>
                  </div>
                  <div style={{maxWidth:1000,margin:'0 auto',background:V.bone,border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>&nbsp;</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>Premium Lagos school</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Smartious</div>
                    </div>
                    {ctry.nigeriaComparison.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 18px',fontSize:13.5,fontWeight:700,color:V.ink,background:'#fff'}}>{r.feature}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.sl,lineHeight:1.5}}>{r.traditional}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.ink,lineHeight:1.5,fontWeight:600}}>{r.smartious}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* UNIVERSITY PATHWAYS */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>University pathways</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.nigeriaUniversities.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.nigeriaUniversities.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:1000,margin:'0 auto'}} className="kenya-uni-grid">
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:10}}>Nigeria</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>Nigerian universities (JAMB)</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.nigeriaUniversities.domestic.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold2,marginBottom:10}}>Worldwide</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>International universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.nigeriaUniversities.international.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13.5,color:V.sl,maxWidth:840,margin:'24px auto 0',lineHeight:1.7,fontStyle:'italic'}}>{ctry.nigeriaUniversities.pathways}</p>
                </div></section>

                {/* PRICING TABLE — NIGERIA */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Fees in Nigeria</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.nigeriaPricing.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.nigeriaPricing.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:18,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.nigeriaPricing.modes.map((m,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'22px 22px 24px'}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:12,paddingBottom:12,borderBottom:'1px solid '+V.line}}>{m.mode}</div>
                        {m.plans.map((p,j) => (
                          <div key={j} style={{paddingBottom:14,marginBottom:14,borderBottom:j===m.plans.length-1?'none':'1px solid '+V.line}}>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700,color:V.ink,marginBottom:3}}>{p.name}</div>
                            <div style={{fontSize:12,color:V.sl3,marginBottom:6}}>{p.who}</div>
                            <div style={{fontSize:18,fontWeight:800,color:V.cr,letterSpacing:'-.01em'}}>USD {p.usd}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl,maxWidth:760,margin:'24px auto 0',lineHeight:1.7}}>{ctry.nigeriaPricing.note}</p>
                  <div style={{textAlign:'center',marginTop:24,display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    <button className="btn-p" onClick={() => P('enroll')}>Begin Enrolment
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <a href={'https://wa.me/254745021212?text=' + encodeURIComponent('Hi Smartious, I would like to enrol my child from Nigeria.')}
                       target="_blank" rel="noopener noreferrer"
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'13px 26px',borderRadius:8,background:'#25D366',color:'#fff',textDecoration:'none',fontSize:13.5,fontWeight:700}}>
                      WhatsApp Inquiry
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.4-1.2c-.3-.2-.7-.1-.9.1l-.7.8c-.2.2-.5.3-.7.1-.9-.4-1.9-1.1-2.6-1.9-.7-.8-1.4-1.7-1.7-2.7-.1-.3 0-.5.2-.7l.8-.7c.3-.2.4-.6.1-.9L8.4 4.7c-.2-.4-.7-.5-1-.2L5.6 6.3c-.6.6-.8 1.5-.6 2.4.7 2.7 2.2 5 4.4 6.8 2.1 1.7 4.6 2.8 7.3 3.1.9.1 1.7-.2 2.3-.9l1.6-1.7c.3-.3.2-.8-.2-1l-2.9-1.8z"/></svg>
                    </a>
                  </div>
                </div></section>
              </>
            )}
            {/* /NIGERIA-ONLY RICH SECTIONS */}

            {/* USA-ONLY RICH SECTIONS — only render when ctry.isUsa is true */}
            {ctry.isUsa && (
              <>
                {/* WHO SMARTIOUS IS BUILT FOR */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:44,maxWidth:780,margin:'0 auto 44px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Who Smartious is for in the USA</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.whyUs.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8}}>{ctry.whyUs.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.whyUs.points.map((pt,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'24px 22px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:700,color:V.cr,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:14,color:V.sl,lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* DIASPORA SECTION — USA-specific */}
                <section className="sec" style={{background:`linear-gradient(135deg, ${V.ink} 0%, ${V.cr} 100%)`,color:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center',color:V.gold3}}>African diaspora · The bridge between two worlds</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:'#fff',marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.diasporaSection.heading}
                    </h2>
                    <p style={{fontSize:15,color:'rgba(255,255,255,.85)',lineHeight:1.8}}>{ctry.diasporaSection.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:18,maxWidth:1000,margin:'0 auto'}}>
                    {ctry.diasporaSection.points.map((pt,i) => (
                      <div key={i} style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(240,204,90,.25)',borderRadius:14,padding:'22px 20px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',fontWeight:700,color:V.gold3,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:13.5,color:'rgba(255,255,255,.82)',lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* ACTIVITIES TEASER */}
                <section className="sec" style={{background:V.bone,padding:'56px 0'}}><div className="wrap">
                  <div style={{maxWidth:760,margin:'0 auto',textAlign:'center'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Wednesday enrichment</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.3}}>
                      {ctry.activitiesTeaser.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8,marginBottom:22}}>{ctry.activitiesTeaser.body}</p>
                    <a href={ctry.activitiesTeaser.linkHref}
                       onClick={(e) => { e.preventDefault(); P('activities') }}
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 24px',borderRadius:8,background:'transparent',color:V.cr,border:'1.5px solid '+V.cr,textDecoration:'none',fontSize:13.5,fontWeight:700,cursor:'pointer'}}>
                      {ctry.activitiesTeaser.linkLabel}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                </div></section>

                {/* COMPARISON TABLE */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>How we compare</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.usaComparison.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.usaComparison.intro}</p>
                  </div>
                  <div style={{maxWidth:1000,margin:'0 auto',background:V.bone,border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>&nbsp;</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>Typical US online private school</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Smartious</div>
                    </div>
                    {ctry.usaComparison.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 18px',fontSize:13.5,fontWeight:700,color:V.ink,background:'#fff'}}>{r.feature}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.sl,lineHeight:1.5}}>{r.traditional}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.ink,lineHeight:1.5,fontWeight:600}}>{r.smartious}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* PRICING TABLE — USA */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Fees in the USA</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.usaPricing.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.usaPricing.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:18,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.usaPricing.modes.map((m,i) => (
                      <div key={i} style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'22px 22px 24px'}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:12,paddingBottom:12,borderBottom:'1px solid '+V.line}}>{m.mode}</div>
                        {m.plans.map((p,j) => (
                          <div key={j} style={{paddingBottom:14,marginBottom:14,borderBottom:j===m.plans.length-1?'none':'1px solid '+V.line}}>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700,color:V.ink,marginBottom:3}}>{p.name}</div>
                            <div style={{fontSize:12,color:V.sl3,marginBottom:6}}>{p.who}</div>
                            <div style={{fontSize:18,fontWeight:800,color:V.cr,letterSpacing:'-.01em'}}>USD {p.usd}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl,maxWidth:760,margin:'24px auto 0',lineHeight:1.7}}>{ctry.usaPricing.note}</p>
                  <div style={{textAlign:'center',marginTop:24,display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    <button className="btn-p" onClick={() => P('enroll')}>Begin Enrolment
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <button className="btn-o" style={{borderColor:V.cr,color:V.cr}} onClick={() => P('consult')}>Book Free Consultation</button>
                  </div>
                </div></section>
              </>
            )}
            {/* /USA-ONLY RICH SECTIONS */}

            {/* CANADA-ONLY RICH SECTIONS — only render when ctry.isCanada is true */}
            {ctry.isCanada && (
              <>
                {/* WHO SMARTIOUS IS BUILT FOR */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:44,maxWidth:780,margin:'0 auto 44px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Who Smartious is for in Canada</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.whyCanada.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8}}>{ctry.whyCanada.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.whyCanada.points.map((pt,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'24px 22px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:700,color:V.cr,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:14,color:V.sl,lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* DIASPORA SECTION — Canada gets the same gradient treatment as USA */}
                <section className="sec" style={{background:`linear-gradient(135deg, ${V.ink} 0%, ${V.cr} 100%)`,color:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:820,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center',color:V.gold3}}>African & Caribbean diaspora · The bridge between two worlds</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:'#fff',marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.diasporaSection.heading}
                    </h2>
                    <p style={{fontSize:15,color:'rgba(255,255,255,.85)',lineHeight:1.8}}>{ctry.diasporaSection.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:18,maxWidth:1000,margin:'0 auto'}}>
                    {ctry.diasporaSection.points.map((pt,i) => (
                      <div key={i} style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(240,204,90,.25)',borderRadius:14,padding:'22px 20px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',fontWeight:700,color:V.gold3,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:13.5,color:'rgba(255,255,255,.82)',lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* PROVINCE TABLE — UNIQUE TO CANADA */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Provincial homeschool guide</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.provinceTable.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.provinceTable.intro}</p>
                  </div>
                  <div style={{maxWidth:1000,margin:'0 auto',background:V.bone,border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1.4fr 1.4fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Province</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>Regulation</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>How Smartious fits</div>
                    </div>
                    {ctry.provinceTable.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1.4fr 1.4fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 18px',fontSize:13.5,fontWeight:700,color:V.ink,background:'#fff'}}>{r.province}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.sl,lineHeight:1.5}}>{r.regulation}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.ink,lineHeight:1.5,fontWeight:500}}>{r.smartious}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* ACTIVITIES TEASER */}
                <section className="sec" style={{background:V.bone,padding:'56px 0'}}><div className="wrap">
                  <div style={{maxWidth:760,margin:'0 auto',textAlign:'center'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Wednesday enrichment</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.3}}>
                      {ctry.activitiesTeaser.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8,marginBottom:22}}>{ctry.activitiesTeaser.body}</p>
                    <a href={ctry.activitiesTeaser.linkHref}
                       onClick={(e) => { e.preventDefault(); P('activities') }}
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 24px',borderRadius:8,background:'transparent',color:V.cr,border:'1.5px solid '+V.cr,textDecoration:'none',fontSize:13.5,fontWeight:700,cursor:'pointer'}}>
                      {ctry.activitiesTeaser.linkLabel}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                </div></section>

                {/* COMPARISON TABLE */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>How we compare</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.canadaComparison.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.canadaComparison.intro}</p>
                  </div>
                  <div style={{maxWidth:1000,margin:'0 auto',background:V.bone,border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>&nbsp;</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>Canadian private school</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Smartious</div>
                    </div>
                    {ctry.canadaComparison.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 18px',fontSize:13.5,fontWeight:700,color:V.ink,background:'#fff'}}>{r.feature}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.sl,lineHeight:1.5}}>{r.traditional}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.ink,lineHeight:1.5,fontWeight:600}}>{r.smartious}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* UNIVERSITY PATHWAYS */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>University pathways</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.canadaUniversities.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.canadaUniversities.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:1000,margin:'0 auto'}} className="kenya-uni-grid">
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:10}}>Canada</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>Canadian universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.canadaUniversities.domestic.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold2,marginBottom:10}}>Worldwide</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>International universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.canadaUniversities.international.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div></section>

                {/* PRICING TABLE — CANADA */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Fees in Canada</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.canadaPricing.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.canadaPricing.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:18,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.canadaPricing.modes.map((m,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'22px 22px 24px'}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:12,paddingBottom:12,borderBottom:'1px solid '+V.line}}>{m.mode}</div>
                        {m.plans.map((p,j) => (
                          <div key={j} style={{paddingBottom:14,marginBottom:14,borderBottom:j===m.plans.length-1?'none':'1px solid '+V.line}}>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700,color:V.ink,marginBottom:3}}>{p.name}</div>
                            <div style={{fontSize:12,color:V.sl3,marginBottom:6}}>{p.who}</div>
                            <div style={{fontSize:18,fontWeight:800,color:V.cr,letterSpacing:'-.01em'}}>USD {p.usd}</div>
                            {p.cad && <div style={{fontSize:12,color:V.sl3,marginTop:2}}>{p.cad}</div>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl,maxWidth:760,margin:'24px auto 0',lineHeight:1.7}}>{ctry.canadaPricing.note}</p>
                  <div style={{textAlign:'center',marginTop:24,display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    <button className="btn-p" onClick={() => P('enroll')}>Begin Enrolment
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <button className="btn-o" style={{borderColor:V.cr,color:V.cr}} onClick={() => P('consult')}>Book Free Consultation</button>
                  </div>
                </div></section>
              </>
            )}
            {/* /CANADA-ONLY RICH SECTIONS */}

            {/* AUSTRALIA-ONLY RICH SECTIONS — only render when ctry.isAustralia is true */}
            {ctry.isAustralia && (
              <>
                {/* WHO SMARTIOUS IS BUILT FOR */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:44,maxWidth:780,margin:'0 auto 44px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Who Smartious is for in Australia</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.whyAustralia.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8}}>{ctry.whyAustralia.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.whyAustralia.points.map((pt,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'24px 22px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:700,color:V.cr,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:14,color:V.sl,lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* DIASPORA SECTION — Australia gets the same gradient treatment as USA/Canada */}
                <section className="sec" style={{background:`linear-gradient(135deg, ${V.ink} 0%, ${V.cr} 100%)`,color:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:820,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center',color:V.gold3}}>South Asian & African diaspora · The bridge between two worlds</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:'#fff',marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.diasporaSection.heading}
                    </h2>
                    <p style={{fontSize:15,color:'rgba(255,255,255,.85)',lineHeight:1.8}}>{ctry.diasporaSection.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:18,maxWidth:1000,margin:'0 auto'}}>
                    {ctry.diasporaSection.points.map((pt,i) => (
                      <div key={i} style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(240,204,90,.25)',borderRadius:14,padding:'22px 20px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',fontWeight:700,color:V.gold3,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:13.5,color:'rgba(255,255,255,.82)',lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* STATE TABLE — UNIQUE TO AUSTRALIA */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>State homeschool guide</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.stateTable.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.stateTable.intro}</p>
                  </div>
                  <div style={{maxWidth:1100,margin:'0 auto',background:V.bone,border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1.5fr 1.4fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 16px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>State</div>
                      <div style={{padding:'14px 16px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>Regulator</div>
                      <div style={{padding:'14px 16px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>Regulation</div>
                      <div style={{padding:'14px 16px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>How Smartious fits</div>
                    </div>
                    {ctry.stateTable.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1.5fr 1.4fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 16px',fontSize:13.5,fontWeight:700,color:V.ink,background:'#fff'}}>{r.state}</div>
                        <div style={{padding:'14px 16px',fontSize:13,color:V.sl,lineHeight:1.5}}>{r.regulator}</div>
                        <div style={{padding:'14px 16px',fontSize:13,color:V.sl,lineHeight:1.5}}>{r.regulation}</div>
                        <div style={{padding:'14px 16px',fontSize:13,color:V.ink,lineHeight:1.5,fontWeight:500}}>{r.smartious}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* ACTIVITIES TEASER */}
                <section className="sec" style={{background:V.bone,padding:'56px 0'}}><div className="wrap">
                  <div style={{maxWidth:760,margin:'0 auto',textAlign:'center'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Wednesday enrichment</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.3}}>
                      {ctry.activitiesTeaser.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8,marginBottom:22}}>{ctry.activitiesTeaser.body}</p>
                    <a href={ctry.activitiesTeaser.linkHref}
                       onClick={(e) => { e.preventDefault(); P('activities') }}
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 24px',borderRadius:8,background:'transparent',color:V.cr,border:'1.5px solid '+V.cr,textDecoration:'none',fontSize:13.5,fontWeight:700,cursor:'pointer'}}>
                      {ctry.activitiesTeaser.linkLabel}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                </div></section>

                {/* COMPARISON TABLE */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>How we compare</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.australiaComparison.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.australiaComparison.intro}</p>
                  </div>
                  <div style={{maxWidth:1000,margin:'0 auto',background:V.bone,border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>&nbsp;</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>Australian private school</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Smartious</div>
                    </div>
                    {ctry.australiaComparison.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 18px',fontSize:13.5,fontWeight:700,color:V.ink,background:'#fff'}}>{r.feature}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.sl,lineHeight:1.5}}>{r.traditional}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.ink,lineHeight:1.5,fontWeight:600}}>{r.smartious}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* UNIVERSITY PATHWAYS */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>University pathways</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.australiaUniversities.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.australiaUniversities.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:1000,margin:'0 auto'}} className="kenya-uni-grid">
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:10}}>Australia · Group of Eight</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>Australian universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.australiaUniversities.domestic.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold2,marginBottom:10}}>Worldwide</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>International universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.australiaUniversities.international.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div></section>

                {/* PRICING TABLE — AUSTRALIA */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Fees in Australia</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.australiaPricing.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.australiaPricing.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:18,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.australiaPricing.modes.map((m,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'22px 22px 24px'}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:12,paddingBottom:12,borderBottom:'1px solid '+V.line}}>{m.mode}</div>
                        {m.plans.map((p,j) => (
                          <div key={j} style={{paddingBottom:14,marginBottom:14,borderBottom:j===m.plans.length-1?'none':'1px solid '+V.line}}>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700,color:V.ink,marginBottom:3}}>{p.name}</div>
                            <div style={{fontSize:12,color:V.sl3,marginBottom:6}}>{p.who}</div>
                            <div style={{fontSize:18,fontWeight:800,color:V.cr,letterSpacing:'-.01em'}}>USD {p.usd}</div>
                            {p.aud && <div style={{fontSize:12,color:V.sl3,marginTop:2}}>{p.aud}</div>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl,maxWidth:760,margin:'24px auto 0',lineHeight:1.7}}>{ctry.australiaPricing.note}</p>
                  <div style={{textAlign:'center',marginTop:24,display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    <button className="btn-p" onClick={() => P('enroll')}>Begin Enrolment
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <button className="btn-o" style={{borderColor:V.cr,color:V.cr}} onClick={() => P('consult')}>Book Free Consultation</button>
                  </div>
                </div></section>
              </>
            )}
            {/* /AUSTRALIA-ONLY RICH SECTIONS */}

            {/* BAHRAIN-ONLY RICH SECTIONS — only render when ctry.isBahrain is true */}
            {ctry.isBahrain && (
              <>
                {/* WHY BAHRAIN FAMILIES SWITCH */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:44,maxWidth:780,margin:'0 auto 44px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>What we hear from Bahrain parents</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.whyBahrain.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8}}>{ctry.whyBahrain.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.whyBahrain.points.map((pt,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'24px 22px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:700,color:V.cr,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:14,color:V.sl,lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* ACTIVITIES TEASER */}
                <section className="sec" style={{background:V.bone,padding:'56px 0'}}><div className="wrap">
                  <div style={{maxWidth:760,margin:'0 auto',textAlign:'center'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Wednesday enrichment</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.3}}>
                      {ctry.activitiesTeaser.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8,marginBottom:22}}>{ctry.activitiesTeaser.body}</p>
                    <a href={ctry.activitiesTeaser.linkHref}
                       onClick={(e) => { e.preventDefault(); P('activities') }}
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 24px',borderRadius:8,background:'transparent',color:V.cr,border:'1.5px solid '+V.cr,textDecoration:'none',fontSize:13.5,fontWeight:700,cursor:'pointer'}}>
                      {ctry.activitiesTeaser.linkLabel}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                </div></section>

                {/* COMPARISON TABLE */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>How we compare</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.bahrainComparison.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.bahrainComparison.intro}</p>
                  </div>
                  <div style={{maxWidth:1000,margin:'0 auto',background:V.bone,border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>&nbsp;</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>Bahrain international school</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Smartious</div>
                    </div>
                    {ctry.bahrainComparison.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 18px',fontSize:13.5,fontWeight:700,color:V.ink,background:'#fff'}}>{r.feature}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.sl,lineHeight:1.5}}>{r.traditional}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.ink,lineHeight:1.5,fontWeight:600}}>{r.smartious}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* UNIVERSITY PATHWAYS */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>University pathways</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.bahrainUniversities.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.bahrainUniversities.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:1000,margin:'0 auto'}} className="kenya-uni-grid">
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:10}}>Bahrain & Gulf</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>Regional universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.bahrainUniversities.regional.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold2,marginBottom:10}}>Worldwide</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>International universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.bahrainUniversities.international.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div></section>

                {/* PRICING TABLE — BAHRAIN */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Fees in Bahrain</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.bahrainPricing.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.bahrainPricing.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:18,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.bahrainPricing.modes.map((m,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'22px 22px 24px'}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:12,paddingBottom:12,borderBottom:'1px solid '+V.line}}>{m.mode}</div>
                        {m.plans.map((p,j) => (
                          <div key={j} style={{paddingBottom:14,marginBottom:14,borderBottom:j===m.plans.length-1?'none':'1px solid '+V.line}}>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700,color:V.ink,marginBottom:3}}>{p.name}</div>
                            <div style={{fontSize:12,color:V.sl3,marginBottom:6}}>{p.who}</div>
                            <div style={{fontSize:18,fontWeight:800,color:V.cr,letterSpacing:'-.01em'}}>USD {p.usd}</div>
                            {p.bhd && <div style={{fontSize:12,color:V.sl3,marginTop:2}}>{p.bhd}</div>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl,maxWidth:760,margin:'24px auto 0',lineHeight:1.7}}>{ctry.bahrainPricing.note}</p>
                  <div style={{textAlign:'center',marginTop:24,display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    <button className="btn-p" onClick={() => P('enroll')}>Begin Enrolment
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <a href={'https://wa.me/254745021212?text=' + encodeURIComponent('Hi Smartious, I would like to enrol my child from Bahrain.')}
                       target="_blank" rel="noopener noreferrer"
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'13px 26px',borderRadius:8,background:'#25D366',color:'#fff',textDecoration:'none',fontSize:13.5,fontWeight:700}}>
                      WhatsApp Inquiry
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.4-1.2c-.3-.2-.7-.1-.9.1l-.7.8c-.2.2-.5.3-.7.1-.9-.4-1.9-1.1-2.6-1.9-.7-.8-1.4-1.7-1.7-2.7-.1-.3 0-.5.2-.7l.8-.7c.3-.2.4-.6.1-.9L8.4 4.7c-.2-.4-.7-.5-1-.2L5.6 6.3c-.6.6-.8 1.5-.6 2.4.7 2.7 2.2 5 4.4 6.8 2.1 1.7 4.6 2.8 7.3 3.1.9.1 1.7-.2 2.3-.9l1.6-1.7c.3-.3.2-.8-.2-1l-2.9-1.8z"/></svg>
                    </a>
                  </div>
                </div></section>
              </>
            )}
            {/* /BAHRAIN-ONLY RICH SECTIONS */}

            {/* PAKISTAN-ONLY RICH SECTIONS — only render when ctry.isPakistan is true */}
            {ctry.isPakistan && (
              <>
                {/* WHY PAKISTANI FAMILIES LOOK BEYOND TRADITIONAL */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:44,maxWidth:780,margin:'0 auto 44px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>What we hear from Pakistani parents</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.whyPakistan.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8}}>{ctry.whyPakistan.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.whyPakistan.points.map((pt,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'24px 22px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:700,color:V.cr,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:14,color:V.sl,lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* ACTIVITIES TEASER */}
                <section className="sec" style={{background:V.bone,padding:'56px 0'}}><div className="wrap">
                  <div style={{maxWidth:760,margin:'0 auto',textAlign:'center'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Wednesday enrichment</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.3}}>
                      {ctry.activitiesTeaser.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8,marginBottom:22}}>{ctry.activitiesTeaser.body}</p>
                    <a href={ctry.activitiesTeaser.linkHref}
                       onClick={(e) => { e.preventDefault(); P('activities') }}
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 24px',borderRadius:8,background:'transparent',color:V.cr,border:'1.5px solid '+V.cr,textDecoration:'none',fontSize:13.5,fontWeight:700,cursor:'pointer'}}>
                      {ctry.activitiesTeaser.linkLabel}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                </div></section>

                {/* COMPARISON TABLE */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>How we compare</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.pakistanComparison.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.pakistanComparison.intro}</p>
                  </div>
                  <div style={{maxWidth:1000,margin:'0 auto',background:V.bone,border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>&nbsp;</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>Pakistani Cambridge school</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Smartious</div>
                    </div>
                    {ctry.pakistanComparison.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 18px',fontSize:13.5,fontWeight:700,color:V.ink,background:'#fff'}}>{r.feature}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.sl,lineHeight:1.5}}>{r.traditional}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.ink,lineHeight:1.5,fontWeight:600}}>{r.smartious}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* UNIVERSITY PATHWAYS */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>University pathways</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.pakistanUniversities.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.pakistanUniversities.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:1000,margin:'0 auto'}} className="kenya-uni-grid">
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:10}}>Pakistan</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>Pakistani universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.pakistanUniversities.domestic.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold2,marginBottom:10}}>Worldwide</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>International universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.pakistanUniversities.international.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div></section>

                {/* PRICING TABLE — PAKISTAN */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Fees in Pakistan</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.pakistanPricing.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.pakistanPricing.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:18,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.pakistanPricing.modes.map((m,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'22px 22px 24px'}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:12,paddingBottom:12,borderBottom:'1px solid '+V.line}}>{m.mode}</div>
                        {m.plans.map((p,j) => (
                          <div key={j} style={{paddingBottom:14,marginBottom:14,borderBottom:j===m.plans.length-1?'none':'1px solid '+V.line}}>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700,color:V.ink,marginBottom:3}}>{p.name}</div>
                            <div style={{fontSize:12,color:V.sl3,marginBottom:6}}>{p.who}</div>
                            <div style={{fontSize:18,fontWeight:800,color:V.cr,letterSpacing:'-.01em'}}>USD {p.usd}</div>
                            {p.pkr && <div style={{fontSize:12,color:V.sl3,marginTop:2}}>{p.pkr}</div>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl,maxWidth:760,margin:'24px auto 0',lineHeight:1.7}}>{ctry.pakistanPricing.note}</p>
                  <div style={{textAlign:'center',marginTop:24,display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    <button className="btn-p" onClick={() => P('enroll')}>Begin Enrolment
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <a href={'https://wa.me/254745021212?text=' + encodeURIComponent('Hi Smartious, I would like to enrol my child from Pakistan.')}
                       target="_blank" rel="noopener noreferrer"
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'13px 26px',borderRadius:8,background:'#25D366',color:'#fff',textDecoration:'none',fontSize:13.5,fontWeight:700}}>
                      WhatsApp Inquiry
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.4-1.2c-.3-.2-.7-.1-.9.1l-.7.8c-.2.2-.5.3-.7.1-.9-.4-1.9-1.1-2.6-1.9-.7-.8-1.4-1.7-1.7-2.7-.1-.3 0-.5.2-.7l.8-.7c.3-.2.4-.6.1-.9L8.4 4.7c-.2-.4-.7-.5-1-.2L5.6 6.3c-.6.6-.8 1.5-.6 2.4.7 2.7 2.2 5 4.4 6.8 2.1 1.7 4.6 2.8 7.3 3.1.9.1 1.7-.2 2.3-.9l1.6-1.7c.3-.3.2-.8-.2-1l-2.9-1.8z"/></svg>
                    </a>
                  </div>
                </div></section>
              </>
            )}
            {/* /PAKISTAN-ONLY RICH SECTIONS */}

            {/* SOUTH AFRICA-ONLY RICH SECTIONS — only render when ctry.isSouthAfrica is true */}
            {ctry.isSouthAfrica && (
              <>
                {/* WHY SA FAMILIES LOOK BEYOND */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:44,maxWidth:780,margin:'0 auto 44px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>What we hear from SA parents</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.whySouthAfrica.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8}}>{ctry.whySouthAfrica.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.whySouthAfrica.points.map((pt,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'24px 22px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:700,color:V.cr,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:14,color:V.sl,lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* MATRIC PATHWAY TABLE — UNIQUE TO SA */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Matric pathways</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.saMatricTable.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.saMatricTable.intro}</p>
                  </div>
                  <div style={{maxWidth:1100,margin:'0 auto',background:'#fff',border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1.4fr 1.3fr 1.3fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 16px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Pathway</div>
                      <div style={{padding:'14px 16px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>Who delivers</div>
                      <div style={{padding:'14px 16px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>SA Universities</div>
                      <div style={{padding:'14px 16px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Global recognition</div>
                    </div>
                    {ctry.saMatricTable.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1.4fr 1.3fr 1.3fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 16px',fontSize:13.5,fontWeight:700,color:V.ink,background:V.bone}}>{r.pathway}</div>
                        <div style={{padding:'14px 16px',fontSize:13,color:V.sl,lineHeight:1.5}}>{r.delivers}</div>
                        <div style={{padding:'14px 16px',fontSize:13,color:V.sl,lineHeight:1.5}}>{r.sa}</div>
                        <div style={{padding:'14px 16px',fontSize:13,color:V.ink,lineHeight:1.5,fontWeight:500}}>{r.global}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* ACTIVITIES TEASER */}
                <section className="sec" style={{background:'#fff',padding:'56px 0'}}><div className="wrap">
                  <div style={{maxWidth:760,margin:'0 auto',textAlign:'center'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Wednesday enrichment</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.3}}>
                      {ctry.activitiesTeaser.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8,marginBottom:22}}>{ctry.activitiesTeaser.body}</p>
                    <a href={ctry.activitiesTeaser.linkHref}
                       onClick={(e) => { e.preventDefault(); P('activities') }}
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 24px',borderRadius:8,background:'transparent',color:V.cr,border:'1.5px solid '+V.cr,textDecoration:'none',fontSize:13.5,fontWeight:700,cursor:'pointer'}}>
                      {ctry.activitiesTeaser.linkLabel}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                </div></section>

                {/* COMPARISON TABLE */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>How we compare</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.saComparison.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.saComparison.intro}</p>
                  </div>
                  <div style={{maxWidth:1000,margin:'0 auto',background:'#fff',border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>&nbsp;</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>SA private school</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Smartious</div>
                    </div>
                    {ctry.saComparison.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 18px',fontSize:13.5,fontWeight:700,color:V.ink,background:V.bone}}>{r.feature}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.sl,lineHeight:1.5}}>{r.traditional}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.ink,lineHeight:1.5,fontWeight:600}}>{r.smartious}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* UNIVERSITY PATHWAYS */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>University pathways</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.saUniversities.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.saUniversities.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:1000,margin:'0 auto'}} className="kenya-uni-grid">
                    <div style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:10}}>South Africa</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>SA universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.saUniversities.domestic.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold2,marginBottom:10}}>Worldwide</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>International universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.saUniversities.international.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div></section>

                {/* PRICING TABLE — SA */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Fees in South Africa</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.saPricing.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.saPricing.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:18,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.saPricing.modes.map((m,i) => (
                      <div key={i} style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'22px 22px 24px'}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:12,paddingBottom:12,borderBottom:'1px solid '+V.line}}>{m.mode}</div>
                        {m.plans.map((p,j) => (
                          <div key={j} style={{paddingBottom:14,marginBottom:14,borderBottom:j===m.plans.length-1?'none':'1px solid '+V.line}}>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700,color:V.ink,marginBottom:3}}>{p.name}</div>
                            <div style={{fontSize:12,color:V.sl3,marginBottom:6}}>{p.who}</div>
                            <div style={{fontSize:18,fontWeight:800,color:V.cr,letterSpacing:'-.01em'}}>USD {p.usd}</div>
                            {p.zar && <div style={{fontSize:12,color:V.sl3,marginTop:2}}>{p.zar}</div>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl,maxWidth:760,margin:'24px auto 0',lineHeight:1.7}}>{ctry.saPricing.note}</p>
                  <div style={{textAlign:'center',marginTop:24,display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    <button className="btn-p" onClick={() => P('enroll')}>Begin Enrolment
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <a href={'https://wa.me/254745021212?text=' + encodeURIComponent('Hi Smartious, I would like to enrol my child from South Africa.')}
                       target="_blank" rel="noopener noreferrer"
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'13px 26px',borderRadius:8,background:'#25D366',color:'#fff',textDecoration:'none',fontSize:13.5,fontWeight:700}}>
                      WhatsApp Inquiry
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.4-1.2c-.3-.2-.7-.1-.9.1l-.7.8c-.2.2-.5.3-.7.1-.9-.4-1.9-1.1-2.6-1.9-.7-.8-1.4-1.7-1.7-2.7-.1-.3 0-.5.2-.7l.8-.7c.3-.2.4-.6.1-.9L8.4 4.7c-.2-.4-.7-.5-1-.2L5.6 6.3c-.6.6-.8 1.5-.6 2.4.7 2.7 2.2 5 4.4 6.8 2.1 1.7 4.6 2.8 7.3 3.1.9.1 1.7-.2 2.3-.9l1.6-1.7c.3-.3.2-.8-.2-1l-2.9-1.8z"/></svg>
                    </a>
                  </div>
                </div></section>
              </>
            )}
            {/* /SOUTH AFRICA-ONLY RICH SECTIONS */}

            {/* UGANDA-ONLY RICH SECTIONS — only render when ctry.isUganda is true */}
            {ctry.isUganda && (
              <>
                {/* WHY UGANDA FAMILIES LOOK BEYOND */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:44,maxWidth:780,margin:'0 auto 44px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>What we hear from Kampala parents</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.whyUganda.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8}}>{ctry.whyUganda.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.whyUganda.points.map((pt,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'24px 22px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:700,color:V.cr,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:14,color:V.sl,lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* DUAL SETUP EXPLAINER — UNIQUE TO UGANDA */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:820,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Honest regulatory framing</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      Two setups for Ugandan families
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>
                      Uganda&apos;s homeschool policy is in transition. The National Curriculum Development Centre is actively drafting a homeschool framework, but pure homeschooling without local school registration is not yet provided for under existing law. Here are the two setups that work cleanly today:
                    </p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,maxWidth:1000,margin:'0 auto'}} className="kenya-uni-grid">
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:10}}>Setup 1 · Ugandan citizen families</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>Dual enrolment</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0,fontSize:14,color:V.sl,lineHeight:1.7}}>
                        <li style={{paddingBottom:10}}>Child enrolled at a local Ugandan or international school for formal registration with the Ministry of Education</li>
                        <li style={{paddingBottom:10}}>Local school handles UNEB or international exam pathway compliance</li>
                        <li style={{paddingBottom:10}}>Smartious delivers the substantive Cambridge, A-Level or IB academic programme — live classes, recordings, global cohort</li>
                        <li style={{paddingTop:6,fontWeight:600,color:V.ink}}>Best for families wanting top-tier international academics with regulatory clarity</li>
                      </ul>
                    </div>
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold2,marginBottom:10}}>Setup 2 · Expat & globally mobile families</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>Primary online enrolment</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0,fontSize:14,color:V.sl,lineHeight:1.7}}>
                        <li style={{paddingBottom:10}}>Expat children resident in Uganda or Ugandan families with international plans</li>
                        <li style={{paddingBottom:10}}>Smartious is the primary school — Cambridge, A-Level, IB or Edexcel pathway</li>
                        <li style={{paddingBottom:10}}>International curriculum context separate from Ugandan citizen homeschool regulation</li>
                        <li style={{paddingTop:6,fontWeight:600,color:V.ink}}>Best for families with international or expat status, frequent travel, or planned relocation</li>
                      </ul>
                    </div>
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl3,maxWidth:760,margin:'24px auto 0',lineHeight:1.6,fontStyle:'italic'}}>
                    We discuss the right setup for your specific family during admissions. For Ugandan citizen families considering pure homeschooling, we recommend connecting with the Home-Scholars Uganda Group (HUG) and monitoring the upcoming NCDC policy.
                  </p>
                </div></section>

                {/* ACTIVITIES TEASER */}
                <section className="sec" style={{background:'#fff',padding:'56px 0'}}><div className="wrap">
                  <div style={{maxWidth:760,margin:'0 auto',textAlign:'center'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Wednesday enrichment</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.3}}>
                      {ctry.activitiesTeaser.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8,marginBottom:22}}>{ctry.activitiesTeaser.body}</p>
                    <a href={ctry.activitiesTeaser.linkHref}
                       onClick={(e) => { e.preventDefault(); P('activities') }}
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 24px',borderRadius:8,background:'transparent',color:V.cr,border:'1.5px solid '+V.cr,textDecoration:'none',fontSize:13.5,fontWeight:700,cursor:'pointer'}}>
                      {ctry.activitiesTeaser.linkLabel}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                </div></section>

                {/* COMPARISON TABLE */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>How we compare</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.ugandaComparison.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.ugandaComparison.intro}</p>
                  </div>
                  <div style={{maxWidth:1000,margin:'0 auto',background:'#fff',border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>&nbsp;</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>Kampala international school</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Smartious</div>
                    </div>
                    {ctry.ugandaComparison.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 18px',fontSize:13.5,fontWeight:700,color:V.ink,background:V.bone}}>{r.feature}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.sl,lineHeight:1.5}}>{r.traditional}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.ink,lineHeight:1.5,fontWeight:600}}>{r.smartious}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* UNIVERSITY PATHWAYS */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>University pathways</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.ugandaUniversities.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.ugandaUniversities.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:1000,margin:'0 auto'}} className="kenya-uni-grid">
                    <div style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:10}}>Uganda</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>Ugandan universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.ugandaUniversities.domestic.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold2,marginBottom:10}}>Worldwide</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>International universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.ugandaUniversities.international.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div></section>

                {/* PRICING TABLE — UGANDA */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Fees in Uganda</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.ugandaPricing.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.ugandaPricing.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:18,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.ugandaPricing.modes.map((m,i) => (
                      <div key={i} style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'22px 22px 24px'}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:12,paddingBottom:12,borderBottom:'1px solid '+V.line}}>{m.mode}</div>
                        {m.plans.map((p,j) => (
                          <div key={j} style={{paddingBottom:14,marginBottom:14,borderBottom:j===m.plans.length-1?'none':'1px solid '+V.line}}>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700,color:V.ink,marginBottom:3}}>{p.name}</div>
                            <div style={{fontSize:12,color:V.sl3,marginBottom:6}}>{p.who}</div>
                            <div style={{fontSize:18,fontWeight:800,color:V.cr,letterSpacing:'-.01em'}}>USD {p.usd}</div>
                            {p.ugx && <div style={{fontSize:12,color:V.sl3,marginTop:2}}>{p.ugx}</div>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl,maxWidth:760,margin:'24px auto 0',lineHeight:1.7}}>{ctry.ugandaPricing.note}</p>
                  <div style={{textAlign:'center',marginTop:24,display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    <button className="btn-p" onClick={() => P('enroll')}>Begin Enrolment
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <a href={'https://wa.me/254745021212?text=' + encodeURIComponent('Hi Smartious, I would like to enrol my child from Uganda.')}
                       target="_blank" rel="noopener noreferrer"
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'13px 26px',borderRadius:8,background:'#25D366',color:'#fff',textDecoration:'none',fontSize:13.5,fontWeight:700}}>
                      WhatsApp Inquiry
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.4-1.2c-.3-.2-.7-.1-.9.1l-.7.8c-.2.2-.5.3-.7.1-.9-.4-1.9-1.1-2.6-1.9-.7-.8-1.4-1.7-1.7-2.7-.1-.3 0-.5.2-.7l.8-.7c.3-.2.4-.6.1-.9L8.4 4.7c-.2-.4-.7-.5-1-.2L5.6 6.3c-.6.6-.8 1.5-.6 2.4.7 2.7 2.2 5 4.4 6.8 2.1 1.7 4.6 2.8 7.3 3.1.9.1 1.7-.2 2.3-.9l1.6-1.7c.3-.3.2-.8-.2-1l-2.9-1.8z"/></svg>
                    </a>
                  </div>
                </div></section>
              </>
            )}
            {/* /UGANDA-ONLY RICH SECTIONS */}

            {/* SOMALIA-ONLY RICH SECTIONS — only render when ctry.isSomalia is true */}
            {ctry.isSomalia && (
              <>
                {/* WHY SOMALIA FAMILIES LOOK BEYOND */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:44,maxWidth:780,margin:'0 auto 44px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>What we hear from Mogadishu parents</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.whySomalia.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8}}>{ctry.whySomalia.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.whySomalia.points.map((pt,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'24px 22px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:700,color:V.cr,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:14,color:V.sl,lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* ACTIVITIES TEASER */}
                <section className="sec" style={{background:V.bone,padding:'56px 0'}}><div className="wrap">
                  <div style={{maxWidth:760,margin:'0 auto',textAlign:'center'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Wednesday enrichment</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.3}}>
                      {ctry.activitiesTeaser.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8,marginBottom:22}}>{ctry.activitiesTeaser.body}</p>
                    <a href={ctry.activitiesTeaser.linkHref}
                       onClick={(e) => { e.preventDefault(); P('activities') }}
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 24px',borderRadius:8,background:'transparent',color:V.cr,border:'1.5px solid '+V.cr,textDecoration:'none',fontSize:13.5,fontWeight:700,cursor:'pointer'}}>
                      {ctry.activitiesTeaser.linkLabel}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                </div></section>

                {/* COMPARISON TABLE */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>How we compare</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.somaliaComparison.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.somaliaComparison.intro}</p>
                  </div>
                  <div style={{maxWidth:1000,margin:'0 auto',background:V.bone,border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>&nbsp;</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>Mogadishu international school</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Smartious</div>
                    </div>
                    {ctry.somaliaComparison.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 18px',fontSize:13.5,fontWeight:700,color:V.ink,background:'#fff'}}>{r.feature}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.sl,lineHeight:1.5}}>{r.traditional}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.ink,lineHeight:1.5,fontWeight:600}}>{r.smartious}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* UNIVERSITY PATHWAYS */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>University pathways</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.somaliaUniversities.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.somaliaUniversities.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:1000,margin:'0 auto'}} className="kenya-uni-grid">
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:10}}>Somalia</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>Somali universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.somaliaUniversities.domestic.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold2,marginBottom:10}}>Worldwide</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>International universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.somaliaUniversities.international.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div></section>

                {/* PRICING TABLE — SOMALIA (USD only) */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Fees in Somalia</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.somaliaPricing.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.somaliaPricing.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:18,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.somaliaPricing.modes.map((m,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'22px 22px 24px'}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:12,paddingBottom:12,borderBottom:'1px solid '+V.line}}>{m.mode}</div>
                        {m.plans.map((p,j) => (
                          <div key={j} style={{paddingBottom:14,marginBottom:14,borderBottom:j===m.plans.length-1?'none':'1px solid '+V.line}}>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700,color:V.ink,marginBottom:3}}>{p.name}</div>
                            <div style={{fontSize:12,color:V.sl3,marginBottom:6}}>{p.who}</div>
                            <div style={{fontSize:18,fontWeight:800,color:V.cr,letterSpacing:'-.01em'}}>USD {p.usd}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl,maxWidth:760,margin:'24px auto 0',lineHeight:1.7}}>{ctry.somaliaPricing.note}</p>
                  <div style={{textAlign:'center',marginTop:24,display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    <button className="btn-p" onClick={() => P('enroll')}>Begin Enrolment
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <a href={'https://wa.me/254745021212?text=' + encodeURIComponent('Hi Smartious, I would like to enrol my child from Somalia.')}
                       target="_blank" rel="noopener noreferrer"
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'13px 26px',borderRadius:8,background:'#25D366',color:'#fff',textDecoration:'none',fontSize:13.5,fontWeight:700}}>
                      WhatsApp Inquiry
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.4-1.2c-.3-.2-.7-.1-.9.1l-.7.8c-.2.2-.5.3-.7.1-.9-.4-1.9-1.1-2.6-1.9-.7-.8-1.4-1.7-1.7-2.7-.1-.3 0-.5.2-.7l.8-.7c.3-.2.4-.6.1-.9L8.4 4.7c-.2-.4-.7-.5-1-.2L5.6 6.3c-.6.6-.8 1.5-.6 2.4.7 2.7 2.2 5 4.4 6.8 2.1 1.7 4.6 2.8 7.3 3.1.9.1 1.7-.2 2.3-.9l1.6-1.7c.3-.3.2-.8-.2-1l-2.9-1.8z"/></svg>
                    </a>
                  </div>
                </div></section>
              </>
            )}
            {/* /SOMALIA-ONLY RICH SECTIONS */}

            {/* TANZANIA-ONLY RICH SECTIONS — only render when ctry.isTanzania is true */}
            {ctry.isTanzania && (
              <>
                {/* WHY TANZANIA FAMILIES LOOK BEYOND */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:44,maxWidth:780,margin:'0 auto 44px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>What we hear from Dar es Salaam parents</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.whyTanzania.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8}}>{ctry.whyTanzania.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.whyTanzania.points.map((pt,i) => (
                      <div key={i} style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'24px 22px'}}>
                        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:700,color:V.cr,marginBottom:10,lineHeight:1.3}}>
                          {pt.h}
                        </h3>
                        <p style={{fontSize:14,color:V.sl,lineHeight:1.7}}>{pt.p}</p>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* NECTA & CAMBRIDGE PATHWAY EXPLAINER — UNIQUE TO TANZANIA */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:820,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Honest pathway framing</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      NECTA, Cambridge and the Tanzanian pathway choice
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>
                      Tanzania has two parallel examination pathways for senior secondary. Here is what each opens up and which one Smartious delivers.
                    </p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,maxWidth:1000,margin:'0 auto'}} className="kenya-uni-grid">
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:10}}>NECTA pathway · Not Smartious</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>Tanzanian national examinations</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0,fontSize:14,color:V.sl,lineHeight:1.7}}>
                        <li style={{paddingBottom:10}}>PSLE (Primary), CSEE (O-Level), ACSEE (A-Level)</li>
                        <li style={{paddingBottom:10}}>Delivered only at NECTA-registered Tanzanian schools</li>
                        <li style={{paddingBottom:10}}>NECTA does not accept homeschooled or online-only candidates</li>
                        <li style={{paddingTop:6,fontWeight:600,color:V.ink}}>Required only if your child must follow the Tanzanian national pathway. Choose a NECTA-registered Tanzanian school for this.</li>
                      </ul>
                    </div>
                    <div style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold2,marginBottom:10}}>Cambridge pathway · Smartious delivers</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>International qualifications</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0,fontSize:14,color:V.sl,lineHeight:1.7}}>
                        <li style={{paddingBottom:10}}>Cambridge IGCSE (O-Level equivalent) and Cambridge A-Level</li>
                        <li style={{paddingBottom:10}}>Or Pearson Edexcel International or IB Diploma</li>
                        <li style={{paddingBottom:10}}>Exams sat as private candidate at British Council Tanzania or authorised international school centres</li>
                        <li style={{paddingTop:6,fontWeight:600,color:V.ink}}>Accepted at every Tanzanian university (via TCU equivalence) and globally in 160+ countries.</li>
                      </ul>
                    </div>
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl3,maxWidth:760,margin:'24px auto 0',lineHeight:1.6,fontStyle:'italic'}}>
                    Tanzanian citizen families with school-age children below 16 are typically advised to dual-enrol: a local Tanzanian school for formal registration plus Smartious for the substantive Cambridge or IB academic programme. We discuss the right setup during admissions.
                  </p>
                </div></section>

                {/* ACTIVITIES TEASER */}
                <section className="sec" style={{background:'#fff',padding:'56px 0'}}><div className="wrap">
                  <div style={{maxWidth:760,margin:'0 auto',textAlign:'center'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Wednesday enrichment</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.3}}>
                      {ctry.activitiesTeaser.heading}
                    </h2>
                    <p style={{fontSize:15,color:V.sl,lineHeight:1.8,marginBottom:22}}>{ctry.activitiesTeaser.body}</p>
                    <a href={ctry.activitiesTeaser.linkHref}
                       onClick={(e) => { e.preventDefault(); P('activities') }}
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'11px 24px',borderRadius:8,background:'transparent',color:V.cr,border:'1.5px solid '+V.cr,textDecoration:'none',fontSize:13.5,fontWeight:700,cursor:'pointer'}}>
                      {ctry.activitiesTeaser.linkLabel}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                </div></section>

                {/* COMPARISON TABLE */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>How we compare</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.tanzaniaComparison.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.tanzaniaComparison.intro}</p>
                  </div>
                  <div style={{maxWidth:1000,margin:'0 auto',background:'#fff',border:'1px solid '+V.line,borderRadius:14,overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',background:V.ink,color:'#fff'}} className="kenya-cmp-head">
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>&nbsp;</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.7)'}}>Tanzania international school</div>
                      <div style={{padding:'14px 18px',fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:V.gold3}}>Smartious</div>
                    </div>
                    {ctry.tanzaniaComparison.rows.map((r,i) => (
                      <div key={i} style={{display:'grid',gridTemplateColumns:'1.2fr 1.4fr 1.4fr',borderTop:i===0?'none':'1px solid '+V.line}} className="kenya-cmp-row">
                        <div style={{padding:'14px 18px',fontSize:13.5,fontWeight:700,color:V.ink,background:V.bone}}>{r.feature}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.sl,lineHeight:1.5}}>{r.traditional}</div>
                        <div style={{padding:'14px 18px',fontSize:13.5,color:V.ink,lineHeight:1.5,fontWeight:600}}>{r.smartious}</div>
                      </div>
                    ))}
                  </div>
                </div></section>

                {/* UNIVERSITY PATHWAYS */}
                <section className="sec" style={{background:'#fff'}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>University pathways</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.tanzaniaUniversities.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.tanzaniaUniversities.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:1000,margin:'0 auto'}} className="kenya-uni-grid">
                    <div style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:10}}>Tanzania</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>Tanzanian universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.tanzaniaUniversities.domestic.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{background:V.bone,border:'1px solid '+V.line,borderRadius:14,padding:'26px 24px'}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.gold2,marginBottom:10}}>Worldwide</div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:14}}>International universities</h3>
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {ctry.tanzaniaUniversities.international.map((u,i) => (
                          <li key={i} style={{padding:'7px 0',fontSize:14,color:V.sl,borderTop:i===0?'none':'1px solid '+V.line}}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div></section>

                {/* PRICING TABLE — TANZANIA */}
                <section className="sec" style={{background:V.bone}}><div className="wrap">
                  <div style={{textAlign:'center',marginBottom:36,maxWidth:780,margin:'0 auto 36px'}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Fees in Tanzania</div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:12,lineHeight:1.2}}>
                      {ctry.tanzaniaPricing.heading}
                    </h2>
                    <p style={{fontSize:14.5,color:V.sl,lineHeight:1.7}}>{ctry.tanzaniaPricing.intro}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:18,maxWidth:1100,margin:'0 auto'}}>
                    {ctry.tanzaniaPricing.modes.map((m,i) => (
                      <div key={i} style={{background:'#fff',border:'1px solid '+V.line,borderRadius:14,padding:'22px 22px 24px'}}>
                        <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:V.cr,marginBottom:12,paddingBottom:12,borderBottom:'1px solid '+V.line}}>{m.mode}</div>
                        {m.plans.map((p,j) => (
                          <div key={j} style={{paddingBottom:14,marginBottom:14,borderBottom:j===m.plans.length-1?'none':'1px solid '+V.line}}>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.05rem',fontWeight:700,color:V.ink,marginBottom:3}}>{p.name}</div>
                            <div style={{fontSize:12,color:V.sl3,marginBottom:6}}>{p.who}</div>
                            <div style={{fontSize:18,fontWeight:800,color:V.cr,letterSpacing:'-.01em'}}>USD {p.usd}</div>
                            {p.tzs && <div style={{fontSize:12,color:V.sl3,marginTop:2}}>{p.tzs}</div>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p style={{textAlign:'center',marginTop:24,fontSize:13,color:V.sl,maxWidth:760,margin:'24px auto 0',lineHeight:1.7}}>{ctry.tanzaniaPricing.note}</p>
                  <div style={{textAlign:'center',marginTop:24,display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    <button className="btn-p" onClick={() => P('enroll')}>Begin Enrolment
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <a href={'https://wa.me/254745021212?text=' + encodeURIComponent('Hi Smartious, I would like to enrol my child from Tanzania.')}
                       target="_blank" rel="noopener noreferrer"
                       style={{display:'inline-flex',alignItems:'center',gap:8,padding:'13px 26px',borderRadius:8,background:'#25D366',color:'#fff',textDecoration:'none',fontSize:13.5,fontWeight:700}}>
                      WhatsApp Inquiry
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.4-1.2c-.3-.2-.7-.1-.9.1l-.7.8c-.2.2-.5.3-.7.1-.9-.4-1.9-1.1-2.6-1.9-.7-.8-1.4-1.7-1.7-2.7-.1-.3 0-.5.2-.7l.8-.7c.3-.2.4-.6.1-.9L8.4 4.7c-.2-.4-.7-.5-1-.2L5.6 6.3c-.6.6-.8 1.5-.6 2.4.7 2.7 2.2 5 4.4 6.8 2.1 1.7 4.6 2.8 7.3 3.1.9.1 1.7-.2 2.3-.9l1.6-1.7c.3-.3.2-.8-.2-1l-2.9-1.8z"/></svg>
                    </a>
                  </div>
                </div></section>
              </>
            )}
            {/* /TANZANIA-ONLY RICH SECTIONS */}

            {/* CTA */}
            <section className="sec" style={{background:`linear-gradient(135deg, ${V.ink} 0%, ${V.cr} 100%)`,color:'#fff'}}><div className="wrap" style={{textAlign:'center',maxWidth:720,margin:'0 auto'}}>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2.2rem',fontWeight:700,marginBottom:14,lineHeight:1.2}}>
                Ready to enrol your child in <em style={{color:V.gold2}}>{ctry.country}?</em>
              </h2>
              <p style={{fontSize:15,color:'rgba(255,255,255,.85)',marginBottom:28,lineHeight:1.7}}>
                Speak with our admissions team. We'll guide you through the right curriculum, exam pathway and enrolment process for your family.
              </p>
              <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
                <button onClick={() => P('enroll')}
                  style={{background:V.gold2,color:V.ink,border:'none',padding:'13px 28px',borderRadius:8,fontSize:14,fontWeight:800,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:8}}>
                  Enroll Now
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button onClick={() => P('consult')}
                  style={{background:'transparent',color:'#fff',border:'2px solid rgba(255,255,255,.4)',padding:'11px 26px',borderRadius:8,fontSize:14,fontWeight:700,cursor:'pointer'}}>
                  Book Free Consultation
                </button>
                <a href={'https://wa.me/254745021212?text=' + encodeURIComponent('Hi Smartious, I would like to enrol my child from ' + ctry.country + '.')}
                  target="_blank" rel="noopener noreferrer"
                  style={{background:'#25D366',color:'#fff',textDecoration:'none',padding:'13px 26px',borderRadius:8,fontSize:14,fontWeight:700,display:'inline-flex',alignItems:'center',gap:8}}>
                  WhatsApp
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.4-1.2c-.3-.2-.7-.1-.9.1l-.7.8c-.2.2-.5.3-.7.1-.9-.4-1.9-1.1-2.6-1.9-.7-.8-1.4-1.7-1.7-2.7-.1-.3 0-.5.2-.7l.8-.7c.3-.2.4-.6.1-.9L8.4 4.7c-.2-.4-.7-.5-1-.2L5.6 6.3c-.6.6-.8 1.5-.6 2.4.7 2.7 2.2 5 4.4 6.8 2.1 1.7 4.6 2.8 7.3 3.1.9.1 1.7-.2 2.3-.9l1.6-1.7c.3-.3.2-.8-.2-1l-2.9-1.8z"/></svg>
                </a>
              </div>
            </div></section>

            <Footer P={P}/>
          </>
        )
      })()}


      {/* ══════════════════════════════════════════
          COMPARE-DETAIL — Smartious vs <competitor>
          One template renders all comparison pages from
          the COMPARES data array. URL pattern: /compare/<slug>.
          FAQ schema injected per-page for AI Overviews.
      ══════════════════════════════════════════ */}
      {page === 'compare-detail' && (() => {
        const cmp = COMPARES.find(c => c.slug === currentCompare)
        if (!cmp) return null
        return (
          <>
            {/* FAQ schema for this comparison */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              'mainEntity': cmp.faqs.map(f => ({
                '@type': 'Question',
                'name': f.q,
                'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
              })),
            })}}/>

            {/* HERO */}
            <div className="pg-hero"><div className="wrap">
              <div className="eyebrow">Honest comparison</div>
              <h1 className="pg-h">Smartious vs <em>{cmp.competitor}</em></h1>
              <p className="pg-sub" style={{marginTop:12}}>{cmp.intro}</p>
              <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:24}}>
                <button className="btn-p" onClick={() => P('enroll')}>Enroll with Smartious <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                <button className="btn-o lt" onClick={() => P('consult')}>Book Free Consultation</button>
              </div>
            </div></div>

            {/* KEY DIFFERENCE */}
            <section className="sec" style={{background:V.bone}}><div className="wrap">
              <div style={{maxWidth:780,margin:'0 auto',textAlign:'center'}}>
                <div className="eyebrow" style={{justifyContent:'center'}}>The key difference</div>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:14,lineHeight:1.25}}>
                  {cmp.keyDifference.split('.')[0]}.
                  {cmp.keyDifference.includes('.') && (
                    <em style={{color:V.cr,display:'block',marginTop:6}}>{cmp.keyDifference.split('.').slice(1).join('.').trim()}</em>
                  )}
                </h2>
                <p style={{fontSize:14.5,color:V.sl,lineHeight:1.8,marginTop:16}}>{cmp.competitorSummary}</p>
              </div>
            </div></section>

            {/* VIDEO TESTIMONIAL */}
            {cmp.testimonial && cmp.testimonial.videoId && (
              <section className="sec" style={{background:'#fff'}}><div className="wrap">
                <div style={{textAlign:'center',marginBottom:24}}>
                  <div className="eyebrow" style={{justifyContent:'center'}}>From our community</div>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:8}}>
                    {cmp.testimonial.title}
                  </h2>
                  <p style={{fontSize:13.5,color:V.sl,maxWidth:540,margin:'10px auto 0',lineHeight:1.7}}>
                    {cmp.testimonial.summary}
                  </p>
                </div>
                {/* Vertical YouTube Short embed — facade pattern: thumbnail + click-to-load iframe */}
                <CompareVideoEmbed videoId={cmp.testimonial.videoId}/>
              </div></section>
            )}

            {/* FEATURE TABLE */}
            <section className="sec" style={{background:V.bone}}><div className="wrap">
              <div style={{textAlign:'center',marginBottom:32}}>
                <div className="eyebrow" style={{justifyContent:'center'}}>Side by side</div>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8}}>
                  Feature <em style={{color:V.cr}}>comparison</em>
                </h2>
              </div>
              <div style={{maxWidth:920,margin:'0 auto',overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',border:'1px solid '+V.line,borderRadius:8,overflow:'hidden'}}>
                  <thead>
                    <tr style={{background:V.ink,color:'#fff'}}>
                      <th style={{padding:'14px 16px',textAlign:'left',fontSize:12,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>Feature</th>
                      <th style={{padding:'14px 16px',textAlign:'left',fontSize:12,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>{cmp.competitor}</th>
                      <th style={{padding:'14px 16px',textAlign:'left',fontSize:12,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:V.gold3}}>Smartious</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cmp.table.map((row, i) => (
                      <tr key={i} style={{borderTop:'1px solid '+V.line, background: i%2===0?'#fff':'#FBFAF5'}}>
                        <td style={{padding:'12px 16px',fontSize:13,fontWeight:700,color:V.ink,verticalAlign:'top'}}>{row.feature}</td>
                        <td style={{padding:'12px 16px',fontSize:13,color:V.sl,verticalAlign:'top'}}>{row.wolsey}</td>
                        <td style={{padding:'12px 16px',fontSize:13,color:V.ink,verticalAlign:'top',fontWeight:600,background:'rgba(212,175,55,.08)'}}>{row.smartious}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p style={{fontSize:11,color:V.sl2,textAlign:'center',marginTop:14,fontStyle:'italic'}}>
                  Comparison based on public information from each provider's website (May 2026). Fees and offerings may change — verify directly before final decision.
                </p>
              </div>
            </div></section>

            {/* COMPETITOR STRENGTHS — acknowledge what they do well */}
            <section className="sec" style={{background:'#fff'}}><div className="wrap">
              <div style={{maxWidth:780,margin:'0 auto'}}>
                <div className="eyebrow">What {cmp.competitor} does well</div>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:24}}>
                  Genuine strengths to consider
                </h2>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:14}}>
                  {cmp.competitorStrengths.map(([h, p], i) => (
                    <div key={i} style={{padding:'16px 18px',background:V.bone,border:'1px solid '+V.line,borderRadius:7}}>
                      <div style={{fontSize:14,fontWeight:700,color:V.ink,marginBottom:6}}>{h}</div>
                      <p style={{fontSize:12.5,color:V.sl,lineHeight:1.65}}>{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div></section>

            {/* SMARTIOUS ADVANTAGES */}
            <section className="sec" style={{background:V.ink,color:'#fff'}}><div className="wrap">
              <div style={{maxWidth:780,margin:'0 auto'}}>
                <div className="eyebrow" style={{color:V.gold2}}>Where Smartious differs</div>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:'#fff',marginTop:8,marginBottom:24}}>
                  What you get with <em style={{color:V.gold3}}>Smartious</em>
                </h2>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:14}}>
                  {cmp.smartiousAdvantages.map(([h, p], i) => (
                    <div key={i} style={{padding:'16px 18px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8}}>
                      <div style={{
                        width:24,height:24,borderRadius:5,
                        background:'rgba(212,175,55,.15)',
                        border:'1px solid rgba(212,175,55,.35)',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        marginBottom:10,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={V.gold2} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <div style={{fontSize:14,fontWeight:700,color:'#fff',marginBottom:6,lineHeight:1.3}}>{h}</div>
                      <p style={{fontSize:12.5,color:'rgba(255,255,255,.7)',lineHeight:1.65}}>{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div></section>

            {/* WHICH FOR WHO */}
            <section className="sec" style={{background:V.bone}}><div className="wrap">
              <div style={{textAlign:'center',marginBottom:32}}>
                <div className="eyebrow" style={{justifyContent:'center'}}>Which is right for you</div>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8}}>
                  Honest <em style={{color:V.cr}}>recommendations</em>
                </h2>
                <p style={{fontSize:13.5,color:V.sl,maxWidth:580,margin:'10px auto 0',lineHeight:1.7}}>
                  Both schools serve real families well. The question is fit.
                </p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:18,maxWidth:920,margin:'0 auto'}}>
                {cmp.whichForWho.map((b, i) => (
                  <div key={i} style={{
                    padding:'22px 24px',background:'#fff',border:'1px solid '+V.line,
                    borderTop:'4px solid '+(i===0?V.sl2:V.cr),
                    borderRadius:8,
                  }}>
                    <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:V.ink,marginBottom:12}}>
                      {b.who}
                    </h3>
                    <ul style={{listStyle:'none',padding:0,margin:0}}>
                      {b.reasons.map((r, j) => (
                        <li key={j} style={{
                          fontSize:13,color:V.sl,lineHeight:1.65,
                          paddingLeft:22,marginBottom:8,position:'relative',
                        }}>
                          <span style={{
                            position:'absolute',left:0,top:6,
                            width:6,height:6,borderRadius:'50%',
                            background:i===0?V.sl2:V.cr,
                          }}/>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div></section>

            {/* FAQs */}
            <section className="sec" style={{background:'#fff'}}><div className="wrap">
              <div style={{maxWidth:780,margin:'0 auto'}}>
                <div style={{textAlign:'center',marginBottom:32}}>
                  <div className="eyebrow" style={{justifyContent:'center'}}>Common questions</div>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8}}>
                    Smartious vs {cmp.competitor} <em style={{color:V.cr}}>FAQs</em>
                  </h2>
                </div>
                {cmp.faqs.map((f, i) => (
                  <details key={i} style={{
                    padding:'18px 22px',marginBottom:10,
                    background:V.bone,border:'1px solid '+V.line,
                    borderRadius:8,cursor:'pointer',
                  }}>
                    <summary style={{fontSize:15,fontWeight:700,color:V.ink,listStyle:'none',outline:'none'}}>
                      {f.q}
                    </summary>
                    <p style={{fontSize:13.5,color:V.sl,lineHeight:1.75,marginTop:12}}>
                      {f.a}
                    </p>
                  </details>
                ))}
              </div>
            </div></section>

            {/* CTA */}
            <section className="sec" style={{background:`linear-gradient(135deg, ${V.ink} 0%, ${V.cr} 100%)`,color:'#fff'}}><div className="wrap" style={{textAlign:'center',maxWidth:720,margin:'0 auto'}}>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2.2rem',fontWeight:700,marginBottom:14,lineHeight:1.2}}>
                Ready to see Smartious in <em style={{color:V.gold2}}>action?</em>
              </h2>
              <p style={{fontSize:15,color:'rgba(255,255,255,.85)',marginBottom:28,lineHeight:1.7}}>
                Book a free consultation. We'll walk you through a live class, review your child's current level, and help you decide whether Smartious fits.
              </p>
              <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
                <button onClick={() => P('consult')}
                  style={{background:V.gold2,color:V.ink,border:'none',padding:'13px 28px',borderRadius:8,fontSize:14,fontWeight:800,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:8}}>
                  Book Free Consultation
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button onClick={() => P('enroll')}
                  style={{background:'transparent',color:'#fff',border:'2px solid rgba(255,255,255,.4)',padding:'11px 26px',borderRadius:8,fontSize:14,fontWeight:700,cursor:'pointer'}}>
                  Begin Enrollment
                </button>
                <a href={'https://wa.me/254745021212?text=' + encodeURIComponent('Hi Smartious, I was comparing you against ' + cmp.competitor + ' and have some questions.')}
                  target="_blank" rel="noopener noreferrer"
                  style={{background:'#25D366',color:'#fff',textDecoration:'none',padding:'13px 26px',borderRadius:8,fontSize:14,fontWeight:700,display:'inline-flex',alignItems:'center',gap:8}}>
                  WhatsApp
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.4-1.2c-.3-.2-.7-.1-.9.1l-.7.8c-.2.2-.5.3-.7.1-.9-.4-1.9-1.1-2.6-1.9-.7-.8-1.4-1.7-1.7-2.7-.1-.3 0-.5.2-.7l.8-.7c.3-.2.4-.6.1-.9L8.4 4.7c-.2-.4-.7-.5-1-.2L5.6 6.3c-.6.6-.8 1.5-.6 2.4.7 2.7 2.2 5 4.4 6.8 2.1 1.7 4.6 2.8 7.3 3.1.9.1 1.7-.2 2.3-.9l1.6-1.7c.3-.3.2-.8-.2-1l-2.9-1.8z"/></svg>
                </a>
              </div>
            </div></section>

            <Footer P={P}/>
          </>
        )
      })()}


      {/* ══════════════════════════════════════════
          GLOBAL
      ══════════════════════════════════════════ */}
      {page === 'global' && (
        <>
          <div className="pg-hero"><div className="wrap"><div className="eyebrow">Global Footprint</div><h1 className="pg-h">Educating Students <em>Across the World</em></h1><p className="pg-sub" style={{marginTop:12}}>From Diamond Plaza I, Parklands, Nairobi to 13 countries across 4 continents.</p></div></div>
          <section className="sec" style={{background:V.ink,padding:'80px 0'}}><div className="wrap">
            <div style={{position:'relative',borderRadius:24,overflow:'hidden',background:'radial-gradient(ellipse at 55% 50%,#1a1028 0%,#0a0812 70%,#050309 100%)',border:'1px solid rgba(184,150,12,.08)',padding:'48px 24px'}}>
              {/* Star field */}
              <div style={{position:'absolute',inset:0,backgroundImage:`radial-gradient(1px 1px at 20% 30%,rgba(255,255,255,.3),transparent),radial-gradient(1px 1px at 60% 70%,rgba(255,255,255,.2),transparent),radial-gradient(1px 1px at 80% 20%,rgba(255,255,255,.25),transparent),radial-gradient(1px 1px at 35% 80%,rgba(255,255,255,.2),transparent),radial-gradient(1px 1px at 90% 60%,rgba(255,255,255,.15),transparent),radial-gradient(1px 1px at 10% 90%,rgba(255,255,255,.2),transparent)`,backgroundSize:'100% 100%',pointerEvents:'none'}}/>

              <svg viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',display:'block',maxWidth:1100,margin:'0 auto',position:'relative'}}>
                <defs>
                  <radialGradient id="glow-cr" cx="50%" cy="50%">
                    <stop offset="0%"  stopColor="#E8354A" stopOpacity="1"/>
                    <stop offset="40%" stopColor="#8B1A2E" stopOpacity=".6"/>
                    <stop offset="100%" stopColor="#8B1A2E" stopOpacity="0"/>
                  </radialGradient>
                  <radialGradient id="glow-gd" cx="50%" cy="50%">
                    <stop offset="0%"  stopColor="#F0CC5A" stopOpacity="1"/>
                    <stop offset="40%" stopColor="#B8960C" stopOpacity=".55"/>
                    <stop offset="100%" stopColor="#B8960C" stopOpacity="0"/>
                  </radialGradient>
                  <filter id="soft-blur"><feGaussianBlur stdDeviation="1.2"/></filter>
                  <filter id="strong-glow"><feGaussianBlur stdDeviation="4"/></filter>
                </defs>

                {/* Dotted world-map continents — Paystack-style stippled silhouette */}
                {/* Africa */}
                {[
                  // rows of dots forming Africa
                  [450,140],[465,140],[480,140],[495,144],[508,148],[520,156],[530,166],
                  [445,155],[460,155],[475,155],[490,155],[505,160],[518,170],[528,180],[538,190],
                  [448,170],[462,170],[478,170],[492,172],[506,178],[520,186],[534,196],[544,208],
                  [452,185],[466,185],[480,187],[494,190],[508,196],[522,204],[536,214],[548,224],[556,234],
                  [454,200],[468,200],[482,204],[496,208],[510,214],[524,222],[538,232],[550,244],[560,256],
                  [456,215],[470,218],[484,222],[498,228],[512,236],[526,244],[540,254],[550,266],[558,278],
                  [458,230],[472,234],[486,240],[500,248],[514,256],[528,264],[540,274],[548,284],[554,294],
                  [462,250],[476,254],[490,260],[504,266],[516,274],[528,282],[538,292],[546,302],
                  [468,272],[482,276],[496,280],[508,286],[520,292],[530,300],[538,310],
                  [476,292],[490,294],[502,298],[514,304],[524,312],[532,320],
                  [484,312],[498,314],[510,318],[520,324],[528,332],
                  [494,332],[506,334],[516,338],[524,344],
                  [504,352],[512,356],[520,362],
                  // North Africa (Egypt, Morocco strip)
                  [420,110],[435,112],[450,114],[465,116],[480,118],[495,122],[510,126],[525,132],[540,138],[555,144],[568,150],
                  [415,125],[430,128],[445,130],[460,132],[475,136],[490,140],
                ].map(([x,y],i) => <circle key={'af'+i} cx={x} cy={y} r="2" fill="#3A2A4A" opacity=".85"/>)}

                {/* Middle East */}
                {[
                  [540,150],[555,146],[570,144],[585,148],[598,154],[610,162],[618,172],[622,184],
                  [548,160],[562,158],[576,160],[590,166],[604,176],[616,188],
                  [558,172],[572,174],[586,180],[600,190],
                ].map(([x,y],i) => <circle key={'me'+i} cx={x} cy={y} r="2" fill="#3A2A4A" opacity=".85"/>)}

                {/* Europe */}
                {[
                  [140,70],[160,68],[180,66],[200,66],[220,66],[240,68],[260,70],[280,74],
                  [130,85],[150,82],[170,80],[190,80],[210,82],[230,84],[250,88],[270,92],[290,96],[308,100],
                  [120,100],[140,98],[160,98],[180,100],[200,102],[220,106],[240,110],[260,114],[280,118],[300,122],
                  [115,115],[135,115],[155,118],[175,122],[195,126],[215,130],[235,134],[255,138],[275,142],[295,146],
                  [125,132],[145,136],[165,140],[185,144],[205,148],[225,152],[245,156],[265,160],
                  [150,156],[170,160],[190,164],[210,168],[230,172],
                ].map(([x,y],i) => <circle key={'eu'+i} cx={x} cy={y} r="2" fill="#3A2A4A" opacity=".8"/>)}

                {/* Asia */}
                {[
                  [620,80],[640,78],[660,76],[680,76],[700,76],[720,78],[740,80],[760,84],[780,88],[800,92],[820,96],[840,102],[860,110],
                  [610,98],[630,96],[650,96],[670,96],[690,98],[710,100],[730,102],[750,104],[770,108],[790,112],[810,116],[830,122],[850,130],[868,140],
                  [615,115],[635,115],[655,116],[675,118],[695,120],[715,122],[735,124],[755,126],[775,130],[795,134],[815,138],[835,144],[850,152],
                  [625,132],[645,134],[665,136],[685,138],[705,140],[725,142],[745,144],[765,146],[785,150],[805,156],[825,162],
                  [640,150],[660,152],[680,154],[700,156],[720,158],[740,160],[760,164],[780,168],[800,174],[820,180],
                  [650,170],[670,172],[690,174],[710,176],[730,180],[750,184],[770,190],[788,196],
                  [660,190],[680,192],[700,196],[720,200],[740,206],[758,214],
                  [670,210],[690,214],[710,220],[728,228],
                ].map(([x,y],i) => <circle key={'as'+i} cx={x} cy={y} r="2" fill="#3A2A4A" opacity=".8"/>)}

                {/* Australia */}
                {[
                  [760,320],[780,318],[800,318],[820,320],[840,324],[855,330],
                  [755,338],[775,338],[795,340],[815,344],[835,350],[852,358],
                  [760,358],[780,360],[800,364],[820,370],[838,378],
                  [770,378],[790,380],[808,386],
                ].map(([x,y],i) => <circle key={'au'+i} cx={x} cy={y} r="2" fill="#3A2A4A" opacity=".8"/>)}

                {/* North America */}
                {[
                  [90,90],[110,88],[130,86],[150,86],[170,88],[190,90],[210,94],[230,98],[250,104],
                  [80,108],[100,106],[120,104],[140,104],[160,106],[180,110],[200,114],[220,120],[240,126],[258,132],
                  [85,126],[105,124],[125,124],[145,126],[165,130],[185,134],[205,140],[225,146],[243,152],
                  [95,144],[115,144],[135,146],[155,150],[175,154],[195,160],[215,166],[233,174],
                  [110,162],[130,164],[150,168],[170,172],[190,180],[208,188],[224,198],
                  [130,180],[150,184],[170,190],[188,198],[204,208],
                  [150,198],[170,204],[188,214],[202,224],
                  [170,218],[186,228],[200,240],
                  [186,242],[200,252],[210,264],
                  [200,270],[210,282],[218,294],
                  [210,300],[218,314],[226,326],
                  [218,332],[226,346],[232,358],
                  [226,362],[232,374],
                ].map(([x,y],i) => <circle key={'na'+i} cx={x} cy={y} r="2" fill="#3A2A4A" opacity=".8"/>)}

                {/* South America */}
                {[
                  [250,280],[270,278],[288,282],
                  [245,298],[265,300],[285,304],[300,310],
                  [248,318],[268,322],[286,328],[300,336],
                  [254,338],[274,342],[290,350],[302,360],
                  [260,360],[278,366],[292,376],
                  [266,380],[282,388],[294,398],
                  [272,400],[286,410],
                  [274,420],[286,430],
                  [276,440],
                ].map(([x,y],i) => <circle key={'sa'+i} cx={x} cy={y} r="2" fill="#3A2A4A" opacity=".8"/>)}

                {/* Animated flight arcs from Nairobi HQ */}
                {[
                  {to:[200,115],label:'UK'},
                  {to:[160,160],label:'USA'},
                  {to:[140,100],label:'Canada'},
                  {to:[600,170],label:'UAE'},
                  {to:[790,340],label:'Australia'},
                  {to:[490,135],label:'Egypt'},
                  {to:[470,280],label:'Nigeria'},
                  {to:[510,360],label:'S.Africa'},
                ].map((t, i) => {
                  const [x1,y1] = [522, 282]
                  const [x2,y2] = t.to
                  const mx = (x1+x2)/2
                  const my = Math.min(y1,y2) - 50 - i*6
                  const d = `M${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`
                  return (
                    <g key={'arc'+i}>
                      <path d={d} stroke="rgba(240,204,90,.15)" strokeWidth="0.8" fill="none" strokeDasharray="4,5"/>
                      <circle r="2.2" fill="#F0CC5A">
                        <animateMotion dur={`${6+i*0.4}s`} repeatCount="indefinite" path={d}/>
                        <animate attributeName="opacity" values="0;1;1;0" dur={`${6+i*0.4}s`} repeatCount="indefinite"/>
                      </circle>
                    </g>
                  )
                })}

                {/* Country location markers with pulses — Paystack-style */}
                {[
                  {cx:200,cy:115,label:'United Kingdom',tone:'cr',sub:'London · Manchester'},
                  {cx:160,cy:160,label:'United States',tone:'cr',sub:'New York · California'},
                  {cx:140,cy:100,label:'Canada',tone:'cr',sub:'Toronto · Vancouver'},
                  {cx:600,cy:170,label:'UAE',tone:'gd',sub:'Dubai · Abu Dhabi'},
                  {cx:790,cy:340,label:'Australia',tone:'gd',sub:'Sydney · Melbourne'},
                  {cx:490,cy:135,label:'Egypt',tone:'gd',sub:'Cairo'},
                  {cx:470,cy:280,label:'Nigeria',tone:'gd',sub:'Lagos · Abuja'},
                  {cx:510,cy:360,label:'South Africa',tone:'gd',sub:'Cape Town · Joburg'},
                  {cx:545,cy:290,label:'Tanzania',tone:'gd',sub:''},
                  {cx:545,cy:260,label:'Uganda',tone:'gd',sub:''},
                ].map((p, i) => (
                  <g key={'pt'+i}>
                    {/* Outer glow halo */}
                    <circle cx={p.cx} cy={p.cy} r="14" fill={`url(#glow-${p.tone})`} opacity=".6">
                      <animate attributeName="r" values="8;18;8" dur={`${2.6+i*.15}s`} repeatCount="indefinite"/>
                      <animate attributeName="opacity" values=".7;.15;.7" dur={`${2.6+i*.15}s`} repeatCount="indefinite"/>
                    </circle>
                    {/* Pulse ring */}
                    <circle cx={p.cx} cy={p.cy} r="4" fill="none" stroke={p.tone==='cr'?'#E8354A':'#F0CC5A'} strokeWidth="1" opacity=".8">
                      <animate attributeName="r"       values="4;14;4"     dur={`${2.4+i*.18}s`} repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.9;0;0.9"  dur={`${2.4+i*.18}s`} repeatCount="indefinite"/>
                    </circle>
                    {/* Dot core */}
                    <circle cx={p.cx} cy={p.cy} r="3" fill={p.tone==='cr'?'#E8354A':'#F0CC5A'} stroke="#fff" strokeWidth=".6"/>
                  </g>
                ))}

                {/* Nairobi HQ — star beacon */}
                <g>
                  <circle cx="522" cy="282" r="22" fill="url(#glow-cr)" opacity=".8">
                    <animate attributeName="r" values="16;28;16" dur="2.4s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="522" cy="282" r="9" fill="#8B1A2E" stroke="#E8354A" strokeWidth="1.2"/>
                  <polygon points="522,276 524,281 529,281 525,285 527,290 522,287 517,290 519,285 515,281 520,281" fill="#F0CC5A" stroke="#C89A28" strokeWidth=".3"/>
                  <text x="522" y="262" textAnchor="middle" fill="#F0CC5A" fontSize="10" fontFamily="Syne,sans-serif" fontWeight="700" letterSpacing=".1em">NAIROBI · HQ</text>
                  <text x="522" y="305" textAnchor="middle" fill="rgba(240,204,90,.7)" fontSize="7" fontFamily="Syne,sans-serif" fontWeight="600">Diamond Plaza · Parklands</text>
                </g>

                {/* Country labels */}
                {[
                  {cx:200,cy:115,label:'UK',dy:-22},
                  {cx:160,cy:160,label:'USA',dy:-22},
                  {cx:140,cy:100,label:'Canada',dy:-22},
                  {cx:600,cy:170,label:'UAE',dy:-22},
                  {cx:790,cy:340,label:'Australia',dy:-22},
                  {cx:490,cy:135,label:'Egypt',dy:-22},
                  {cx:470,cy:280,label:'Nigeria',dy:22},
                  {cx:510,cy:360,label:'S.Africa',dy:22},
                ].map((p, i) => (
                  <text key={'lbl'+i} x={p.cx} y={p.cy + p.dy} textAnchor="middle" fill="rgba(255,255,255,.85)" fontSize="9" fontFamily="Syne,sans-serif" fontWeight="600">{p.label}</text>
                ))}
              </svg>

              {/* Live stats bar */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20,marginTop:48,paddingTop:32,borderTop:'1px solid rgba(184,150,12,.12)'}}>
                {[
                  ['2,418+','Students'],
                  ['13','Countries'],
                  ['4','Continents'],
                  ['127','Expert Tutors'],
                ].map(([n,l]) => (
                  <div key={l} style={{textAlign:'center'}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.white,lineHeight:1}}>
                      {n.includes('+')?<>{n.replace('+','')}<em style={{color:V.gold3,fontStyle:'normal'}}>+</em></>:n}
                    </div>
                    <div style={{fontSize:11,color:'rgba(247,243,237,.5)',marginTop:6,letterSpacing:'.08em',textTransform:'uppercase'}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cp-row" style={{marginTop:40,justifyContent:'center'}}>
              {[
                ['Kenya HQ', null],
                ['Uganda', null],
                ['Tanzania', null],
                ['Botswana', null],
                ['Nigeria', 'nigeria'],
                ['South Africa', 'south-africa'],
                ['Egypt', 'egypt'],
                ['UAE', 'uae'],
                ['Dubai', 'dubai'],
                ['Qatar', 'qatar'],
                ['United Kingdom', 'uk'],
                ['United States', 'usa'],
                ['Canada', 'canada'],
                ['Australia', 'australia'],
              ].map(([label, slug]) => (
                <div key={label} className="cp"
                  onClick={() => slug ? openCountry(slug) : showToast(`${label} — Smartious virtual school & online tuition available.`)}
                  style={{background:'rgba(247,243,237,.06)',borderColor:'rgba(184,150,12,.15)',color:V.white,cursor:'pointer'}}>{label}</div>
              ))}
            </div>
          </div></section>
          <Footer P={P}/>
        </>
      )}

      {/* ══════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════ */}
      {page === 'pricing' && (
        <>
          <div className="pg-hero"><div className="wrap"><div className="eyebrow">Fee Structure 2026</div><h1 className="pg-h">Transparent Fees, <em>No Surprises</em></h1><p className="pg-sub" style={{marginTop:12}}>Per student. A one-time registration fee of $38 applies on enrolment. 10% sibling discount on every additional child.</p></div></div>
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            <div className="p-tabs">
              {[['full','Full Homeschool Programmes'],['senior','A-Level & IB Diploma'],['tuition','Single Subject & Tuition']].map(([id,l]) => (
                <button key={id} className={`ptab${priceTabs===id?' on':''}`} onClick={() => setPriceTab(id)}>{l}</button>
              ))}
            </div>

            {/* Billing cycle toggle — hidden on the hourly tuition tab */}
            {priceTabs !== 'tuition' && (
              <>
                <div style={{display:'flex',justifyContent:'center',marginTop:24,marginBottom:8}}>
                  <div style={{display:'inline-flex',background:V.white,border:`1px solid ${V.bone3}`,borderRadius:10,padding:4,gap:2,boxShadow:'0 2px 10px rgba(10,8,6,.05)'}}>
                    {[
                      ['monthly','Monthly'],
                      ['termly','Termly'],
                      ['annually','Annually'],
                    ].map(([id,lbl]) => (
                      <button key={id} onClick={() => setBillingCycle(id)} style={{padding:'10px 18px',border:'none',borderRadius:7,background:billingCycle===id?V.cr:'transparent',color:billingCycle===id?V.white:V.ink2,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:"'Syne',sans-serif",transition:'all .2s'}}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{textAlign:'center',fontSize:12,color:V.sl2,marginTop:8,marginBottom:32,fontStyle:'italic'}}>
                  {billingCycle === 'monthly'  && 'Billed monthly · Due 1st–5th of each month'}
                  {billingCycle === 'termly'   && 'Billed every 3 months · Save ~10% · 60% deposit before term, 40% by the 5th of next month'}
                  {billingCycle === 'annually' && 'Full year paid in advance · Best value'}
                </div>
              </>
            )}

            {priceTabs === 'full' && (
              <div className="price-grid">
                {[
                  {lbl:'Year 1–6 · Ages 5–11',ti:'Primary Homeschool',pr:'Cambridge Primary / CBC',base:423,term:1142,annual:4062,kes:'55,000 / month',kesTerm:'148,500 / term',kesAnnual:'528,000 / year',
                    fs:['Cambridge Primary or CBC, Grade 1–6','All subjects · per student','Dedicated, TSC-registered class teacher','All textbooks, workbooks & materials','Weekly lesson reports to parents','Termly progress reports with grades','Smartious LMS + Mshauri AI tutor'],gold:false},
                  {lbl:'Year 7–9 · Ages 11–14',ti:'Junior Secondary',pr:'Cambridge Lower Secondary / CBC',base:538,term:1454,annual:5169,kes:'70,000 / month',kesTerm:'189,000 / term',kesAnnual:'672,000 / year',
                    fs:['Cambridge Lower Secondary or CBC, Grade 7–9','All subjects · per student','Subject-specialist teachers','All teaching materials & past papers','Weekly lesson reports to parents','Mid-term & end-of-term assessments','Smartious LMS + Mshauri AI tutor'],gold:false},
                  {lbl:'Year 10–11 · Ages 14–16',ti:'Cambridge IGCSE',pr:'CIE / Edexcel · Full Programme',base:654,term:1765,annual:6277,kes:'85,000 / month',kesTerm:'229,500 / term',kesAnnual:'816,000 / year',
                    fs:['Full IGCSE programme · CIE or Edexcel','All subjects · per student','Specialist subject tutors','Complete past paper & marking scheme library','Mock exams with examiner-style feedback','Exam technique coaching','Smartious LMS + unlimited Mshauri AI'],gold:true,badge:'Most Popular'},
                ].map((p,i) => <PriceCard key={i} {...p} P={P} cycle={billingCycle}/>)}
              </div>
            )}

            {priceTabs === 'senior' && (
              <div className="price-grid">
                {[
                  {lbl:'Senior · Year 12–13 · Ages 16–19',ti:'Cambridge A-Level',pr:'CIE / Edexcel · up to 4 subjects',base:769,term:2077,annual:7385,kes:'100,000 / month',kesTerm:'270,000 / term',kesAnnual:'960,000 / year',
                    fs:['Complete A-Level homeschool programme','Up to 4 subjects · CIE or Edexcel','Specialist subject teachers','University counselling & UCAS support','Full past paper library + mock exams','Smartious LMS + unlimited Mshauri AI'],gold:true,badge:'Most Popular'},
                  {lbl:'Senior · Year 12–13 · Ages 16–19',ti:'IB Diploma',pr:'IBO · Full Diploma Programme',base:923,term:2492,annual:8862,kes:'120,000 / month',kesTerm:'324,000 / term',kesAnnual:'1,152,000 / year',
                    fs:['Full IB Diploma Programme','6 subjects + TOK / EE / CAS support','Extended Essay & Internal Assessment supervision','University & application guidance','Specialist IB-trained teachers','Smartious LMS + unlimited Mshauri AI'],gold:false},
                  {lbl:'Single Subject',ti:'A-Level — Single Subject',pr:'CIE / Edexcel · one subject',base:231,term:623,annual:2215,kes:'30,000 / month',kesTerm:'81,000 / term',kesAnnual:'288,000 / year',
                    fs:['One A-Level subject','Specialist subject teacher','Past papers & exam technique','Ideal for resits or supplementary study'],gold:false},
                  {lbl:'Single Subject',ti:'IB — Single Subject',pr:'IBO · HL or SL · one subject',base:269,term:727,annual:2585,kes:'35,000 / month',kesTerm:'94,500 / term',kesAnnual:'336,000 / year',
                    fs:['One IB subject · Higher or Standard Level','Specialist IB-trained teacher','Internal Assessment support','Ideal for supplementary study'],gold:false},
                ].map((p,i) => <PriceCard key={i} {...p} P={P} cycle={billingCycle}/>)}
              </div>
            )}

            {priceTabs === 'tuition' && (
              <>
                <div style={{textAlign:'center',marginTop:24,marginBottom:28,fontSize:13,color:V.sl,fontStyle:'italic'}}>
                  One-on-one tuition · in-centre at Parklands or online worldwide. Rate confirmed at enrolment based on level.
                </div>
                <div className="price-grid">
                  {[
                    {lbl:'Primary · Year 1–6',ti:'Primary Tuition',base:8,pr:'per hour · 1-on-1',kes:'≈ KES 1,000 – 1,300 / hr',
                      fs:['One-on-one · in-centre or online','USD 8 – 10 per hour','Qualified primary teachers','All materials provided'],gold:false,cta:'Book Now',hourly:true},
                    {lbl:'Junior Secondary · Year 7–9',ti:'Junior Secondary Tuition',base:10,pr:'per hour · 1-on-1',kes:'≈ KES 1,300 – 1,560 / hr',
                      fs:['One-on-one · in-centre or online','USD 10 – 12 per hour','Subject-specialist tutors','Curriculum-aligned sessions'],gold:false,cta:'Book Now',hourly:true},
                    {lbl:'IGCSE · Year 10–11',ti:'IGCSE Tuition',base:12,pr:'per hour · 1-on-1',kes:'≈ KES 1,560 – 1,820 / hr',
                      fs:['One-on-one · in-centre or online','USD 12 – 14 per hour','Specialist subject tutors','Exam-focused coaching'],gold:true,badge:'Popular',cta:'Book Now',hourly:true},
                    {lbl:'A-Level / IB · Year 12–13',ti:'A-Level / IB Tuition',base:15,pr:'per hour · 1-on-1',kes:'≈ KES 1,950 – 2,000 / hr',
                      fs:['One-on-one · in-centre or online','USD 15 per hour · maximum rate','Expert subject tutors','University-level exam preparation'],gold:false,cta:'Book Now',hourly:true},
                  ].map((p,i) => <PriceCard key={i} {...p} P={P} cycle={billingCycle}/>)}
                </div>

                {/* Supplementary services */}
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',fontWeight:700,color:V.ink,margin:'44px 0 18px',textAlign:'center'}}>Supplementary &amp; Specialist Services</h3>
                <div style={{maxWidth:760,margin:'0 auto',background:V.white,border:`1px solid ${V.bone3}`,borderRadius:14,overflow:'hidden'}}>
                  {[
                    ['Computer Packages & ICT','MS Office · Basic Computing · Digital Literacy · 2 hrs/session','$15 / session'],
                    ['Accounting Introduction','Book-keeping · Financial literacy basics · 1 hr/session','$12 / session'],
                    ['Languages — French, English, Kiswahili','Beginner to advanced · 1 hr/session','$10 / session'],
                    ['Exam Preparation Intensive','Past paper coaching · IGCSE / A-Level / IB · 2 hrs/session','$30 / session'],
                    ['International Online Tuition','Diaspora students · UK / UAE / USA / Canada','$8 – 15 / hr'],
                  ].map(([s,d,r],i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 20px',borderBottom:i<4?`1px solid ${V.bone2}`:'none',flexWrap:'wrap'}}>
                      <div style={{flex:1,minWidth:200}}>
                        <div style={{fontWeight:700,fontSize:14,color:V.ink}}>{s}</div>
                        <div style={{fontSize:12,color:V.sl2,marginTop:2}}>{d}</div>
                      </div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:V.cr,whiteSpace:'nowrap'}}>{r}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Registration & one-off fees */}
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',fontWeight:700,color:V.ink,margin:'48px 0 18px',textAlign:'center'}}>Registration &amp; One-Off Fees</h3>
            <div style={{maxWidth:760,margin:'0 auto',background:V.white,border:`1px solid ${V.bone3}`,borderRadius:14,overflow:'hidden'}}>
              {[
                ['Enrolment / Registration Fee','One-time per student · non-refundable','$38'],
                ['Curriculum & Learning Materials','Books · workbooks · past papers · quoted at enrolment','$62 – 154'],
                ['Cambridge / IB Exam Entry','Payable directly to the exam board','As invoiced'],
                ['Termly Progress Reports','Full programme students','Included'],
              ].map(([s,d,r],i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 20px',borderBottom:i<3?`1px solid ${V.bone2}`:'none',flexWrap:'wrap'}}>
                  <div style={{flex:1,minWidth:200}}>
                    <div style={{fontWeight:700,fontSize:14,color:V.ink}}>{s}</div>
                    <div style={{fontSize:12,color:V.sl2,marginTop:2}}>{d}</div>
                  </div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:V.cr,whiteSpace:'nowrap'}}>{r}</div>
                </div>
              ))}
            </div>

            {/* Payment terms */}
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',fontWeight:700,color:V.ink,margin:'48px 0 18px',textAlign:'center'}}>Payment Terms</h3>
            <div className="price-grid" style={{maxWidth:920,margin:'0 auto'}}>
              {[
                ['Monthly Payment','Fee due on or before the 5th of each month. A 3-day grace period applies. Sessions may be suspended after 8 days of non-payment without prior arrangement.'],
                ['Termly / Instalment','60% deposit required before the term begins to confirm enrolment. The remaining 40% is due by the 5th of the following month.'],
                ['Annual','Full annual fee payable in advance for maximum saving.'],
              ].map(([h,d],i) => (
                <div key={i} style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:14,padding:'20px 22px'}}>
                  <div style={{fontWeight:700,fontSize:14.5,color:V.cr,marginBottom:8}}>{h}</div>
                  <div style={{fontSize:13,color:V.sl,lineHeight:1.7}}>{d}</div>
                </div>
              ))}
            </div>

            <div style={{maxWidth:760,margin:'28px auto 0',background:V.white,border:`1px solid ${V.bone3}`,borderRadius:14,padding:'20px 24px'}}>
              <div style={{fontWeight:700,fontSize:14,color:V.ink,marginBottom:10}}>Payment Details</div>
              <div style={{fontSize:13,color:V.sl,lineHeight:1.9}}>
                M-Pesa Paybill: <strong style={{color:V.ink}}>247247</strong> · Account No: <strong style={{color:V.ink}}>745021</strong><br/>
                Account Name: <strong style={{color:V.ink}}>Smartious Edtech</strong> · Bank transfer available on request<br/>
                Always quote your invoice number when paying.
              </div>
            </div>

            <p style={{fontSize:'11.5px',textAlign:'center',color:V.sl2,marginTop:28,maxWidth:760,marginLeft:'auto',marginRight:'auto',lineHeight:1.7}}>
              10% sibling discount on the second and any subsequent sibling enrolled in a full programme. Cambridge, Edexcel and IB examination entry fees are quoted separately and are not included in tuition. Fees may be revised annually with 30 days&rsquo; written notice to existing families. Registration fees are non-refundable; advance tuition for unused sessions is refunded pro-rata with 14 days&rsquo; written notice.
            </p>
          </div></section>
          <Footer P={P}/>
        </>
      )}

      {/* ══════════════════════════════════════════
          PROGRAMS
      ══════════════════════════════════════════ */}
      {page === 'programs' && (
        <>
          <div className="pg-hero"><div className="wrap"><div className="eyebrow">Special Programmes</div><h1 className="pg-h">IUFP & <em>Study Abroad</em></h1><p className="pg-sub" style={{marginTop:12}}>Two transformative programmes designed to open doors to the world's best universities.</p></div></div>
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            {/* IUFP */}
            <div className="prog-card">
              <div className="prog-bar"/>
              <div className="prog-body">
                <span className="chip" style={{marginBottom:16}}>University Pathway</span>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginBottom:14}}>International University Foundation Programme (IUFP)</h2>
                <p style={{fontSize:14,color:V.sl,lineHeight:1.8,marginBottom:14}}>The IUFP is a one-year intensive programme for students who have completed secondary school and want direct entry into Year 1 of a UK, US, Australian or European university. Accepted by 200+ partner universities worldwide.</p>
                <p style={{fontSize:14,color:V.sl,lineHeight:1.8,marginBottom:28}}>Students study 4 core academic modules alongside Academic English, Critical Thinking, Research Methods and Digital Literacy, concluding with a Capstone Project and full university application support.</p>
                <div className="prog-info-grid">
                  {[['Duration','10–12 months full-time · 14 months part-time'],['Entry Requirements','Completed secondary school · Min. 5 IGCSE C grades or KCSE B–'],['Delivery','100% online or blended · Available globally'],['Programme Fee','$5,480 USD full year · Payment plans available']].map(([h,v]) => (
                    <div key={h} className="prog-info">
                      <div className="prog-info-h">{h}</div>
                      <div className="prog-info-v">{v}</div>
                    </div>
                  ))}
                </div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',fontWeight:700,color:V.ink,marginBottom:14}}>Four Academic Pathways</h3>
                <div className="prog-path-grid">
                  {[['Sciences Pathway','For Medicine, Pharmacy, Biology, Chemistry, Environmental Science. Includes lab report writing and scientific methodology.'],['Business & Economics Pathway','For Finance, Accounting, Management, Economics. Includes financial modelling and business case analysis.'],['Engineering & Technology Pathway','For Engineering, Computer Science, Architecture. Includes mathematics, physics and technical drawing fundamentals.'],['Arts & Humanities Pathway','For Law, Politics, Literature, Psychology, Media. Includes essay structure, argumentation and academic citation.']].map(([h,p]) => (
                    <div key={h} className="prog-path"><div className="prog-path-h">{h}</div><div className="prog-path-p">{p}</div></div>
                  ))}
                </div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',fontWeight:700,color:V.ink,marginBottom:14}}>Sample Partner Universities</h3>
                <div className="prog-unis">
                  {['University of Birmingham','Coventry University','University of Manchester','Purdue Global','Northeastern University','Deakin University','Griffith University','RWTH Aachen','Maastricht University','+ 190 more'].map(u => <span key={u} className="prog-uni">{u}</span>)}
                </div>
                <button className="btn-p" onClick={() => P('enroll')}>Apply for IUFP <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
              </div>
            </div>

            {/* Study Abroad */}
            <div className="prog-card">
              <div className="prog-bar" style={{background:`linear-gradient(90deg,${V.gold2},${V.cr})`}}/>
              <div className="prog-body">
                <span className="chip" style={{marginBottom:16}}>International Experience</span>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',fontWeight:700,color:V.ink,marginBottom:14}}>Study Abroad Programme</h2>
                <p style={{fontSize:14,color:V.sl,lineHeight:1.8,marginBottom:28}}>Placements at partner schools in 6 countries — UK, USA, Australia, Germany, UAE and Canada. We handle school placement, visa guidance, accommodation, airport transfers and 24/7 pastoral support throughout.</p>
                <div className="sa-grid">
                  {[
                    {country:'United Kingdom', meta:'1 term / 1 year · From $8,500/term', desc:'OFSTED-rated placements in London, Manchester and Edinburgh.',
                     img:'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=70',
                     fallback:'linear-gradient(180deg,#ffe3a1 0%,#e9abb8 40%,#27416d 100%)'},
                    {country:'United States', meta:'1 semester / 1 year · From $9,200/semester', desc:'High school semester placements in New York, California and Texas.',
                     img:'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=800&q=70',
                     fallback:'linear-gradient(180deg,#f8c57a 0%,#e06b6b 45%,#1d2540 100%)'},
                    {country:'Australia', meta:'1 term / 1 year · From $7,800/term', desc:'Year 10–12 placements in Sydney, Melbourne and Brisbane.',
                     img:'https://images.unsplash.com/photo-1523428096881-5bd79d043006?auto=format&fit=crop&w=800&q=70',
                     fallback:'linear-gradient(180deg,#ffc07a 0%,#ff7b6a 40%,#1a3a52 100%)'},
                    {country:'Germany', meta:'1 year preferred · From $5,200/term', desc:'International school placements in Berlin, Munich and Hamburg.',
                     img:'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=800&q=70',
                     fallback:'linear-gradient(180deg,#f0c27a 0%,#c18a8a 45%,#1d2a40 100%)'},
                    {country:'UAE', meta:'1 term / 1 year · From $6,500/term', desc:'Premium international school placements in Dubai and Abu Dhabi.',
                     img:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=70',
                     fallback:'linear-gradient(180deg,#ffd89e 0%,#e8a388 40%,#3d2a4a 100%)'},
                    {country:'Canada', meta:'1 semester / 1 year · From $7,200/semester', desc:'High school placements in Toronto, Vancouver and Calgary.',
                     img:'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=70',
                     fallback:'linear-gradient(180deg,#e1d4ff 0%,#9faec9 45%,#1a2035 100%)'},
                  ].map(({country,meta,desc,img,fallback}) => (
                    <div key={country} className="sa-d">
                      <div className="sa-dt" style={{
                        backgroundImage:`linear-gradient(180deg, rgba(10,8,6,0) 0%, rgba(10,8,6,0) 40%, rgba(10,8,6,.65) 100%), url('${img}'), ${fallback}`,
                        backgroundSize:'cover',
                        backgroundPosition:'center',
                        backgroundRepeat:'no-repeat',
                        position:'relative',height:150,padding:0,overflow:'hidden'
                      }}>
                        <div style={{position:'absolute',bottom:10,left:0,right:0,textAlign:'center',color:V.white,fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',fontWeight:700,textShadow:'0 2px 10px rgba(10,8,6,.85)'}}>{country}</div>
                      </div>
                      <div className="sa-db">
                        <div className="sa-dp">{desc}</div>
                        <div className="sa-dm">{meta}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                  <button className="btn-p" onClick={() => P('enroll')}>Apply for Study Abroad <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                  <button className="btn-o" onClick={() => window.open('https://wa.me/254745021212?text=Hi%20Smartious%2C%20I%27d%20like%20Study%20Abroad%20details.','_blank')}>WhatsApp for Details</button>
                </div>
              </div>
            </div>
          </div></section>
          <Footer P={P}/>
        </>
      )}

      {/* ══════════════════════════════════════════
          ACTIVITIES — Sports, Clubs & Student Life
          Premium enrichment page. Hero + Wednesday timetable +
          sports showcase + clubs + parent trust + gallery + CTAs.
          FAQ schema embedded for Google AI Overviews.
      ══════════════════════════════════════════ */}
      {page === 'activities' && (
        <>
          {/* FAQ schema — picked up by Google's structured-data parser
              for rich snippets and AI Overview answers. */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Event',
            'name': 'Smartious Academic Trip to Malaysia 2026',
            'description': 'Four-day academic trip to Kuala Lumpur, Malaysia for Smartious students aged 10–18. Includes Petronas Twin Towers visit, top Malaysian university campus tour, STEM workshop, Sunway Lagoon theme park, Batu Caves cultural visit. Fully supervised by Smartious teachers (1:10 ratio). Departing from Nairobi.',
            'startDate': '2026-07-27',
            'endDate': '2026-07-30',
            'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
            'eventStatus': 'https://schema.org/EventScheduled',
            'location': [
              { '@type': 'Place', 'name': 'Kuala Lumpur', 'address': { '@type': 'PostalAddress', 'addressCountry': 'MY', 'addressLocality': 'Kuala Lumpur' } },
              { '@type': 'Place', 'name': 'Petronas Twin Towers', 'address': { '@type': 'PostalAddress', 'addressCountry': 'MY', 'addressLocality': 'Kuala Lumpur' } },
              { '@type': 'Place', 'name': 'Batu Caves', 'address': { '@type': 'PostalAddress', 'addressCountry': 'MY', 'addressLocality': 'Selangor' } },
            ],
            'organizer': { '@type': 'EducationalOrganization', 'name': 'Smartious Homeschool & eSchool', 'url': 'https://smartioushomeschool.com/' },
            'offers': {
              '@type': 'Offer',
              'price': '1950',
              'priceCurrency': 'USD',
              'priceValidUntil': '2026-06-30',
              'availability': 'https://schema.org/LimitedAvailability',
              'url': 'https://smartioushomeschool.com/activities',
              'validFrom': '2026-04-01',
            },
            'audience': { '@type': 'EducationalAudience', 'audienceType': 'Students aged 10-18' },
            'image': 'https://smartioushomeschool.com/smartious-logo.png',
          })}}/>
          <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
              { '@type': 'Question', 'name': 'Do online homeschool students at Smartious get extracurricular activities?',
                'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. Every Wednesday from 2:00 PM to 4:00 PM, Smartious students participate in a structured enrichment programme covering sports, clubs, leadership, music, art and wellness. Activities are supervised, age-appropriate and run alongside the academic timetable.' } },
              { '@type': 'Question', 'name': 'What sports are available to homeschool students?',
                'acceptedAnswer': { '@type': 'Answer', 'text': 'Swimming, football, basketball, badminton, tennis, table tennis, pickleball, archery, volleyball, athletics, squash, and dedicated fitness training. Sports take place at our Parklands learning centre and partner facilities, with qualified coaches.' } },
              { '@type': 'Question', 'name': 'Can my child join the coding or robotics club without a tech background?',
                'acceptedAnswer': { '@type': 'Answer', 'text': 'Absolutely. Our coding, AI and robotics clubs are designed for beginners and accelerate to advanced level. Students progress at their own pace under guidance from STEM-qualified instructors.' } },
              { '@type': 'Question', 'name': 'How do online and diaspora students join activities?',
                'acceptedAnswer': { '@type': 'Answer', 'text': 'Many clubs run virtually — debate, public speaking, coding, AI, entrepreneurship, book club, journalism and Model United Nations are fully online. Diaspora students join live sessions over video. In-person sports are available to students physically in Nairobi.' } },
              { '@type': 'Question', 'name': 'Are activities included in the tuition fee?',
                'acceptedAnswer': { '@type': 'Answer', 'text': 'Most enrichment clubs are included for full-time homeschool students at no additional cost. Sports requiring specialised facilities (swimming, tennis, squash, archery) carry a modest activity fee to cover venue and coaching. Contact admissions for a full breakdown.' } },
              { '@type': 'Question', 'name': 'How does Smartious ensure student safety during activities?',
                'acceptedAnswer': { '@type': 'Answer', 'text': 'All in-person activities are supervised by vetted Smartious staff and qualified coaches. Venues are inspected, parental consent is required, and we maintain a strict 1:8 supervisor-to-student ratio for sports. Online clubs are moderated by teachers throughout.' } },
            ],
          })}}/>

          <div className="pg-hero"><div className="wrap">
            <div className="eyebrow">Student Life</div>
            <h1 className="pg-h">Beyond Academics: Sports, Leadership &amp; <em>Student Enrichment</em></h1>
            <p className="pg-sub" style={{marginTop:12}}>Smartious students participate in engaging weekly activities designed to build confidence, teamwork, creativity, wellness and global exposure. A world-class enrichment ecosystem alongside an internationally recognised academic programme.</p>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:24}}>
              <button className="btn-p" onClick={() => { const el = document.getElementById('malaysia-application'); if (el) el.scrollIntoView({behavior:'smooth'}); }}>Apply: Malaysia Trip 2026 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
              <button className="btn-o lt" onClick={() => P('enroll')}>Join Smartious</button>
              <button className="btn-o lt" onClick={() => { const el = document.getElementById('student-life'); if (el) el.scrollIntoView({behavior:'smooth'}); }}>Explore Student Life</button>
            </div>
          </div></div>


          {/* ====================================================== */}
          {/* MALAYSIA ACADEMIC TRIP 2026 — FEATURED TRIP             */}
          {/* ====================================================== */}
          <section
            aria-label="Smartious Academic Trip to Malaysia 2026"
            style={{
              position:'relative',
              width:'100%',
              background:V.ink,
              overflow:'hidden',
              lineHeight:0,
            }}>
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="https://res.cloudinary.com/dae99gz1m/video/upload/so_0/0528_1_fb8yz8.jpg"
              aria-label="Smartious Malaysia academic trip — promotional video"
              style={{
                width:'100%',
                height:'auto',
                display:'block',
                aspectRatio:'16 / 9',
                objectFit:'cover',
                background:V.ink,
              }}>
              <source src="https://res.cloudinary.com/dae99gz1m/video/upload/0528_1_fb8yz8.mp4" type="video/mp4" />
              {/* Fallback for browsers without video support */}
              Your browser does not support embedded video.
              View the Smartious Malaysia Trip 2026 details below.
            </video>
            {/* Soft bottom fade so the video transitions cleanly into the itinerary section */}
            <div style={{
              position:'absolute',
              left:0,
              right:0,
              bottom:0,
              height:80,
              pointerEvents:'none',
              background:'linear-gradient(to bottom, rgba(10,8,6,0) 0%, #fff 100%)',
            }}/>
          </section>
          {/* 4-DAY ITINERARY */}
          <section id="malaysia-itinerary" className="sec" style={{background:'#fff'}}><div className="wrap">
            <div style={{textAlign:'center',marginBottom:44,maxWidth:760,margin:'0 auto 44px'}}>
              <div className="eyebrow" style={{justifyContent:'center'}}>Day by day</div>
              <h2 style={{
                fontFamily:"'Playfair Display',serif",
                fontSize:'2rem',
                fontWeight:700,
                color:V.ink,
                marginTop:8,
                marginBottom:12,
              }}>
                4 Days of <em style={{color:V.cr}}>Learning, Discovery & Fun</em>
              </h2>
              <p style={{fontSize:15,color:V.sl,lineHeight:1.7}}>
                Every day balances academic discovery, cultural immersion and shared experience — purposefully sequenced to take students from arrival excitement through campus visits, cultural depth and a final adventure together.
              </p>
            </div>

            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',
              gap:20,
              maxWidth:1180,
              margin:'0 auto',
            }}>
              {[
                {
                  day:'01',
                  title:'Arrival & Kuala Lumpur City Tour',
                  theme:'twin-towers',
                  gradient:'linear-gradient(135deg, #1a2849 0%, #8B1A2E 100%)',
                  videoMp4:'https://res.cloudinary.com/dae99gz1m/video/upload/f_auto,q_auto,vc_auto,w_700/5.4-invideo-seedance_2_0_2_dvswlp.mp4',
                  videoPoster:'https://res.cloudinary.com/dae99gz1m/video/upload/so_0/5.4-invideo-seedance_2_0_2_dvswlp.jpg',
                  items:[
                    'Arrival in Kuala Lumpur',
                    'Petronas Twin Towers (photo stop)',
                    'KLCC Park & Suria KLCC',
                    'Welcome dinner with the group',
                  ],
                },
                {
                  day:'02',
                  title:'STEM & University Experience',
                  theme:'university',
                  gradient:'linear-gradient(135deg, #0F766E 0%, #1E3A8A 100%)',
                  videoMp4:'https://res.cloudinary.com/dae99gz1m/video/upload/f_auto,q_auto,vc_auto,w_700/0528_2_welzb9.mp4',
                  videoPoster:'https://res.cloudinary.com/dae99gz1m/video/upload/so_0/0528_2_welzb9.jpg',
                  items:[
                    'Visit to a top Malaysian university',
                    'Campus tour & student interaction',
                    'STEM workshop / Science Centre visit',
                    'Evening at Pavilion Bukit Bintang',
                  ],
                },
                {
                  day:'03',
                  title:'Theme Park Adventure',
                  theme:'theme-park',
                  gradient:'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                  videoMp4:'https://res.cloudinary.com/dae99gz1m/video/upload/f_auto,q_auto,vc_auto,w_700/0530_qboxw3.mp4',
                  videoPoster:'https://res.cloudinary.com/dae99gz1m/video/upload/so_0/0530_qboxw3.jpg',
                  items:[
                    'Full day at Sunway Lagoon or Genting SkyWorlds',
                    'Rides, attractions & water park',
                    'Fun, games & team bonding',
                    'Group dinner',
                  ],
                },
                {
                  day:'04',
                  title:'Cultural Experience & Departure',
                  theme:'batu-caves',
                  gradient:'linear-gradient(135deg, #FFA502 0%, #5352ED 50%, #A55EEA 100%)',
                  items:[
                    'Cultural visit — Batu Caves',
                    'Central Market & local handicrafts',
                    'Souvenir shopping',
                    'Group departure',
                  ],
                },
              ].map(d => (
                <div key={d.day} style={{
                  background:'#fff',
                  border:'1px solid '+V.line,
                  borderRadius:16,
                  overflow:'hidden',
                  transition:'transform .25s, box-shadow .25s',
                  cursor:'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform='translateY(-6px)'
                  e.currentTarget.style.boxShadow='0 24px 50px rgba(139,26,46,.15)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform='translateY(0)'
                  e.currentTarget.style.boxShadow='none'
                }}>
                  {/* day header — themed gradient with iconic illustration OR video */}
                  <div style={{position:'relative',height:170,overflow:'hidden',background:d.gradient}}>
                    {d.videoMp4 ? (
                      /* Real footage — Day 1 arrival video */
                      <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        poster={d.videoPoster}
                        aria-label={`Day ${d.day}: ${d.title} — preview video`}
                        style={{
                          width:'100%',
                          height:'100%',
                          objectFit:'cover',
                          display:'block',
                          background:V.ink,
                        }}>
                        <source src={d.videoMp4} type="video/mp4" />
                      </video>
                    ) : (
                      /* themed SVG icon overlay */
                      <svg viewBox="0 0 300 170" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block',opacity:0.85}} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                      {d.theme === 'twin-towers' && (
                        <g>
                          {/* Stars */}
                          {[[30,25],[80,15],[140,30],[200,18],[260,28]].map(([x,y],i) => (
                            <circle key={i} cx={x} cy={y} r="1" fill="#F0CC5A" opacity="0.7"/>
                          ))}
                          {/* Twin towers silhouette */}
                          <g fill="#F0CC5A" opacity="0.95">
                            <polygon points="128,35 132,35 130,18"/>
                            <rect x="129" y="35" width="2" height="8"/>
                            <ellipse cx="130" cy="48" rx="12" ry="3"/>
                            <rect x="118" y="51" width="24" height="24"/>
                            <rect x="115" y="75" width="30" height="32"/>
                            <rect x="111" y="107" width="38" height="55"/>
                            
                            <polygon points="168,35 172,35 170,18"/>
                            <rect x="169" y="35" width="2" height="8"/>
                            <ellipse cx="170" cy="48" rx="12" ry="3"/>
                            <rect x="158" y="51" width="24" height="24"/>
                            <rect x="155" y="75" width="30" height="32"/>
                            <rect x="151" y="107" width="38" height="55"/>
                          </g>
                          {/* Sky bridge */}
                          <rect x="142" y="77" width="16" height="6" fill="#F0CC5A" opacity="0.85"/>
                        </g>
                      )}
                      {d.theme === 'university' && (
                        <g fill="#F0CC5A" opacity="0.92">
                          {/* University building — neoclassical */}
                          {/* Steps */}
                          <rect x="60" y="135" width="180" height="6"/>
                          <rect x="70" y="128" width="160" height="7"/>
                          {/* Columns */}
                          {[85,110,135,160,185,210].map((x,i) => (
                            <g key={i}>
                              <rect x={x-3} y="75" width="6" height="53"/>
                              <rect x={x-5} y="70" width="10" height="6"/>
                              <rect x={x-5} y="125" width="10" height="4"/>
                            </g>
                          ))}
                          {/* Pediment (triangle roof) */}
                          <polygon points="55,70 245,70 150,30"/>
                          {/* Star/symbol on pediment */}
                          <polygon points="150,42 153,50 161,50 154,55 157,63 150,58 143,63 146,55 139,50 147,50" fill="#fff" opacity="0.9"/>
                        </g>
                      )}
                      {d.theme === 'theme-park' && (
                        <g>
                          {/* Ferris wheel */}
                          <g fill="#fff" opacity="0.92">
                            <circle cx="150" cy="80" r="45" fill="none" stroke="#fff" strokeWidth="3"/>
                            <circle cx="150" cy="80" r="5"/>
                            {/* Spokes */}
                            {[0,45,90,135,180,225,270,315].map((deg,i) => {
                              const rad = deg * Math.PI / 180
                              const x2 = 150 + Math.cos(rad) * 45
                              const y2 = 80 + Math.sin(rad) * 45
                              return <line key={i} x1="150" y1="80" x2={x2} y2={y2} stroke="#fff" strokeWidth="2" opacity="0.7"/>
                            })}
                            {/* Cabins */}
                            {[0,45,90,135,180,225,270,315].map((deg,i) => {
                              const rad = deg * Math.PI / 180
                              const cx = 150 + Math.cos(rad) * 45
                              const cy = 80 + Math.sin(rad) * 45
                              return <circle key={i} cx={cx} cy={cy} r="6" fill="#F0CC5A"/>
                            })}
                          </g>
                          {/* Base */}
                          <rect x="145" y="125" width="10" height="35" fill="#fff" opacity="0.92"/>
                          <polygon points="120,160 180,160 175,150 125,150" fill="#fff" opacity="0.92"/>
                        </g>
                      )}
                      {d.theme === 'batu-caves' && (
                        <g>
                          {/* Cave entrance arch */}
                          <ellipse cx="150" cy="60" rx="40" ry="28" fill="#1a0e0a" opacity="0.65"/>
                          {/* Murugan statue */}
                          <ellipse cx="80" cy="90" rx="9" ry="28" fill="#F0CC5A" opacity="0.95"/>
                          <circle cx="80" cy="63" r="7" fill="#F0CC5A" opacity="0.95"/>
                          {/* Rainbow stairs */}
                          {[
                            ['#FF4757', 0],
                            ['#FFA502', 1],
                            ['#FFDD59', 2],
                            ['#2ED573', 3],
                            ['#1E90FF', 4],
                            ['#5352ED', 5],
                            ['#A55EEA', 6],
                            ['#FF4757', 7],
                            ['#FFA502', 8],
                            ['#FFDD59', 9],
                            ['#2ED573', 10],
                            ['#1E90FF', 11],
                          ].map(([color, i]) => {
                            const y = 88 + i * 6
                            const w = 38 + i * 10
                            return <rect key={i} x={150 - w/2} y={y} width={w} height="5" fill={color} opacity="0.95"/>
                          })}
                        </g>
                      )}
                    </svg>
                    )}
                    <div style={{
                      position:'absolute',
                      top:14,
                      left:14,
                      background:V.gold3,
                      color:V.ink,
                      borderRadius:8,
                      padding:'4px 12px',
                      fontSize:10,
                      fontWeight:800,
                      letterSpacing:'.14em',
                      textTransform:'uppercase',
                    }}>Day {d.day}</div>
                  </div>
                  
                  {/* day content */}
                  <div style={{padding:'22px 22px 24px'}}>
                    <h3 style={{
                      fontFamily:"'Playfair Display',serif",
                      fontSize:'1.15rem',
                      fontWeight:700,
                      color:V.ink,
                      marginBottom:14,
                      lineHeight:1.3,
                    }}>{d.title}</h3>
                    <ul style={{listStyle:'none',padding:0,margin:0}}>
                      {d.items.map((it,i) => (
                        <li key={i} style={{
                          fontSize:13.5,
                          color:V.sl,
                          padding:'6px 0',
                          lineHeight:1.5,
                          display:'flex',
                          gap:10,
                          alignItems:'flex-start',
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={V.gold2} strokeWidth="3" strokeLinecap="round" style={{flexShrink:0,marginTop:4}}><path d="M5 12l5 5L20 7"/></svg>
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div></section>

          {/* TRIP HIGHLIGHTS + WHAT'S INCLUDED */}
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            <div style={{
              display:'grid',
              gridTemplateColumns:'1fr 1fr',
              gap:32,
              maxWidth:1100,
              margin:'0 auto',
            }} className="malaysia-incl-grid">
              {/* Highlights */}
              <div>
                <div className="eyebrow" style={{marginBottom:10}}>Trip Highlights</div>
                <h3 style={{
                  fontFamily:"'Playfair Display',serif",
                  fontSize:'1.5rem',
                  fontWeight:700,
                  color:V.ink,
                  marginBottom:22,
                }}>What students experience</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                  {[
                    'University Visits',
                    'STEM Workshops',
                    'Science Centre',
                    'Theme Park Adventure',
                    'Cultural Exploration',
                    'Global Friendships',
                  ].map(h => (
                    <div key={h} style={{
                      background:'#fff',
                      border:'1px solid '+V.line,
                      borderRadius:10,
                      padding:'14px 16px',
                      fontSize:13.5,
                      fontWeight:600,
                      color:V.ink,
                      display:'flex',
                      alignItems:'center',
                      gap:10,
                    }}>
                      <div style={{
                        width:8,
                        height:8,
                        borderRadius:'50%',
                        background:V.cr,
                        flexShrink:0,
                      }}/>
                      {h}
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop:24,
                  padding:'16px 18px',
                  background:V.gold3+'18',
                  border:'1px solid '+V.gold3,
                  borderRadius:10,
                  fontSize:13,
                  color:V.ink,
                  lineHeight:1.6,
                }}>
                  <strong style={{color:V.cr}}>Safety · Learning · Fun</strong> — our promise to every family. Every student is supervised by Smartious teachers throughout, with a 1:10 staff ratio and 24-hour adult presence.
                </div>
              </div>

              {/* What's included */}
              <div>
                <div className="eyebrow" style={{marginBottom:10}}>Package Includes</div>
                <h3 style={{
                  fontFamily:"'Playfair Display',serif",
                  fontSize:'1.5rem',
                  fontWeight:700,
                  color:V.ink,
                  marginBottom:22,
                }}>Everything is taken care of</h3>
                <ul style={{listStyle:'none',padding:0,margin:0}}>
                  {[
                    'Return air tickets (Nairobi ↔ Kuala Lumpur)',
                    'Accommodation (twin-share)',
                    'All meals (breakfast, lunch, dinner)',
                    'Airport transfers & local transport',
                    'University & industry visits',
                    'Entrance fees & all activities',
                    'STEM workshops & Science Centre visit',
                    'Travel insurance',
                    'Smartious trip T-shirt',
                    'Professional tour guide',
                    'Smartious teachers (1:10 ratio)',
                  ].map(item => (
                    <li key={item} style={{
                      padding:'8px 0',
                      fontSize:13.5,
                      color:V.sl,
                      lineHeight:1.5,
                      display:'flex',
                      gap:10,
                      alignItems:'flex-start',
                      borderBottom:'1px solid '+V.line,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={V.cr} strokeWidth="3" strokeLinecap="round" style={{flexShrink:0,marginTop:4}}><path d="M5 12l5 5L20 7"/></svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <style>{`
              @media (max-width: 800px) {
                .malaysia-incl-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
              }
            `}</style>
          </div></section>

          {/* INVESTMENT & PAYMENT SCHEDULE */}
          <section className="sec" style={{background:'#fff'}}><div className="wrap">
            <div style={{
              maxWidth:920,
              margin:'0 auto',
              background:V.bone,
              border:'1px solid '+V.line,
              borderRadius:18,
              overflow:'hidden',
            }}>
              <div style={{
                background:V.ink,
                padding:'28px 32px',
                color:'#fff',
                display:'grid',
                gridTemplateColumns:'1fr auto',
                gap:24,
                alignItems:'center',
              }} className="malaysia-pay-head">
                <div>
                  <div className="eyebrow" style={{color:V.gold3,marginBottom:6}}>Investment</div>
                  <h3 style={{
                    fontFamily:"'Playfair Display',serif",
                    fontSize:'1.6rem',
                    fontWeight:700,
                    color:'#fff',
                    margin:0,
                    lineHeight:1.3,
                  }}>Transparent pricing & flexible payment</h3>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:V.gold3,marginBottom:4}}>Per Student</div>
                  <div style={{
                    fontFamily:"'Playfair Display',serif",
                    fontSize:'2.2rem',
                    fontWeight:800,
                    color:'#fff',
                    lineHeight:1,
                  }}>KSh 280,000</div>
                  <div style={{fontSize:13,color:'rgba(255,255,255,.7)',marginTop:4}}>≈ USD 1,950</div>
                </div>
              </div>

              {/* Payment schedule rows */}
              <div style={{padding:'8px 32px 28px'}}>
                <div style={{fontSize:13,color:V.sl,fontWeight:600,marginTop:18,marginBottom:14,textTransform:'uppercase',letterSpacing:'.06em'}}>Payment schedule · Twin room</div>
                {[
                  {label:'Registration (non-refundable)',  amt:'KSh 3,000',   date:'On application'},
                  {label:'1st instalment',                  amt:'KSh 80,000',  date:'30 April 2026'},
                  {label:'2nd instalment',                  amt:'KSh 100,000', date:'31 May 2026'},
                  {label:'3rd instalment',                  amt:'KSh 100,000', date:'30 June 2026'},
                ].map((p,i) => (
                  <div key={i} style={{
                    display:'grid',
                    gridTemplateColumns:'1.5fr 1fr 1fr',
                    gap:14,
                    padding:'14px 0',
                    borderTop:i===0?'1px solid '+V.line:'1px solid '+V.line,
                    borderBottom:i===3?'1px solid '+V.line:'none',
                    fontSize:13.5,
                    alignItems:'center',
                  }}>
                    <div style={{color:V.ink,fontWeight:600}}>{p.label}</div>
                    <div style={{color:V.cr,fontWeight:700}}>{p.amt}</div>
                    <div style={{color:V.sl3,fontSize:12.5}}>{p.date}</div>
                  </div>
                ))}
              </div>

              {/* Requirements footer */}
              <div style={{padding:'20px 32px 28px',borderTop:'1px solid '+V.line,background:'#fff'}}>
                <div style={{fontSize:13,color:V.sl,fontWeight:600,marginBottom:14,textTransform:'uppercase',letterSpacing:'.06em'}}>Requirements</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
                  {[
                    'Valid passport (apply early if needed)',
                    'COVID-19 vaccine certificate',
                    'Yellow Fever certificate',
                    'Visa (we assist with the process)',
                  ].map(r => (
                    <div key={r} style={{
                      display:'flex',
                      gap:10,
                      alignItems:'flex-start',
                      fontSize:13,
                      color:V.sl,
                      lineHeight:1.5,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={V.gold2} strokeWidth="3" strokeLinecap="round" style={{flexShrink:0,marginTop:3}}><path d="M5 12l5 5L20 7"/></svg>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <style>{`
              @media (max-width: 700px) {
                .malaysia-pay-head { grid-template-columns: 1fr !important; text-align: left !important; }
                .malaysia-pay-head > div:last-child { text-align: left !important; }
              }
            `}</style>
          </div></section>

          {/* APPLICATION FORM */}
          <section id="malaysia-application" className="sec" style={{background:V.bone}}><div className="wrap">
            <div style={{
              maxWidth:680,
              margin:'0 auto',
              background:'#fff',
              border:'1px solid '+V.line,
              borderRadius:18,
              padding:'36px 38px 40px',
            }} className="malaysia-form-card">
              {!malaysiaTripSubmitted ? (
                <>
                  <div style={{textAlign:'center',marginBottom:28}}>
                    <div className="eyebrow" style={{justifyContent:'center'}}>Apply now · Limited spaces</div>
                    <h3 style={{
                      fontFamily:"'Playfair Display',serif",
                      fontSize:'1.7rem',
                      fontWeight:700,
                      color:V.ink,
                      marginTop:8,
                      marginBottom:10,
                      lineHeight:1.2,
                    }}>
                      Reserve your child's place
                    </h3>
                    <p style={{fontSize:14,color:V.sl,lineHeight:1.7,margin:0}}>
                      Complete this short application and our team will contact you within one working day to confirm details and arrange the KSh 3,000 registration payment.
                    </p>
                  </div>

                  <div style={{display:'grid',gap:16}}>
                    {/* Student name + age */}
                    <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:12}} className="malaysia-form-row">
                      <div>
                        <label style={{display:'block',fontSize:12,fontWeight:600,color:V.ink,marginBottom:6,letterSpacing:'.02em'}}>Student name *</label>
                        <input
                          type="text"
                          placeholder="Full name"
                          value={malaysiaTripForm.studentName}
                          onChange={e => setMalaysiaTripForm({...malaysiaTripForm, studentName: e.target.value})}
                          style={{
                            width:'100%',
                            padding:'12px 14px',
                            fontSize:14,
                            border:'1px solid '+V.line,
                            borderRadius:9,
                            background:'#fff',
                            color:V.ink,
                            outline:'none',
                            transition:'border-color .15s',
                          }}
                          onFocus={e => e.target.style.borderColor=V.cr}
                          onBlur={e => e.target.style.borderColor=V.line}
                        />
                      </div>
                      <div>
                        <label style={{display:'block',fontSize:12,fontWeight:600,color:V.ink,marginBottom:6,letterSpacing:'.02em'}}>Age *</label>
                        <input
                          type="number"
                          placeholder="10–18"
                          min="10"
                          max="18"
                          value={malaysiaTripForm.studentAge}
                          onChange={e => setMalaysiaTripForm({...malaysiaTripForm, studentAge: e.target.value})}
                          style={{
                            width:'100%',
                            padding:'12px 14px',
                            fontSize:14,
                            border:'1px solid '+V.line,
                            borderRadius:9,
                            background:'#fff',
                            color:V.ink,
                            outline:'none',
                            transition:'border-color .15s',
                          }}
                          onFocus={e => e.target.style.borderColor=V.cr}
                          onBlur={e => e.target.style.borderColor=V.line}
                        />
                      </div>
                    </div>

                    {/* Parent name */}
                    <div>
                      <label style={{display:'block',fontSize:12,fontWeight:600,color:V.ink,marginBottom:6,letterSpacing:'.02em'}}>Parent / Guardian name *</label>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={malaysiaTripForm.parentName}
                        onChange={e => setMalaysiaTripForm({...malaysiaTripForm, parentName: e.target.value})}
                        style={{
                          width:'100%',
                          padding:'12px 14px',
                          fontSize:14,
                          border:'1px solid '+V.line,
                          borderRadius:9,
                          background:'#fff',
                          color:V.ink,
                          outline:'none',
                          transition:'border-color .15s',
                        }}
                        onFocus={e => e.target.style.borderColor=V.cr}
                        onBlur={e => e.target.style.borderColor=V.line}
                      />
                    </div>

                    {/* Parent email + phone */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}} className="malaysia-form-row">
                      <div>
                        <label style={{display:'block',fontSize:12,fontWeight:600,color:V.ink,marginBottom:6,letterSpacing:'.02em'}}>Parent email *</label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={malaysiaTripForm.parentEmail}
                          onChange={e => setMalaysiaTripForm({...malaysiaTripForm, parentEmail: e.target.value})}
                          style={{
                            width:'100%',
                            padding:'12px 14px',
                            fontSize:14,
                            border:'1px solid '+V.line,
                            borderRadius:9,
                            background:'#fff',
                            color:V.ink,
                            outline:'none',
                            transition:'border-color .15s',
                          }}
                          onFocus={e => e.target.style.borderColor=V.cr}
                          onBlur={e => e.target.style.borderColor=V.line}
                        />
                      </div>
                      <div>
                        <label style={{display:'block',fontSize:12,fontWeight:600,color:V.ink,marginBottom:6,letterSpacing:'.02em'}}>Parent WhatsApp *</label>
                        <input
                          type="tel"
                          placeholder="+254 700 000 000"
                          value={malaysiaTripForm.parentPhone}
                          onChange={e => setMalaysiaTripForm({...malaysiaTripForm, parentPhone: e.target.value})}
                          style={{
                            width:'100%',
                            padding:'12px 14px',
                            fontSize:14,
                            border:'1px solid '+V.line,
                            borderRadius:9,
                            background:'#fff',
                            color:V.ink,
                            outline:'none',
                            transition:'border-color .15s',
                          }}
                          onFocus={e => e.target.style.borderColor=V.cr}
                          onBlur={e => e.target.style.borderColor=V.line}
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <label style={{display:'block',fontSize:12,fontWeight:600,color:V.ink,marginBottom:6,letterSpacing:'.02em'}}>City / Country</label>
                      <input
                        type="text"
                        placeholder="e.g. Nairobi · Mombasa · Kampala · Dar es Salaam"
                        value={malaysiaTripForm.city}
                        onChange={e => setMalaysiaTripForm({...malaysiaTripForm, city: e.target.value})}
                        style={{
                          width:'100%',
                          padding:'12px 14px',
                          fontSize:14,
                          border:'1px solid '+V.line,
                          borderRadius:9,
                          background:'#fff',
                          color:V.ink,
                          outline:'none',
                          transition:'border-color .15s',
                        }}
                        onFocus={e => e.target.style.borderColor=V.cr}
                        onBlur={e => e.target.style.borderColor=V.line}
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label style={{display:'block',fontSize:12,fontWeight:600,color:V.ink,marginBottom:6,letterSpacing:'.02em'}}>Notes (allergies, dietary, anything else)</label>
                      <textarea
                        rows="3"
                        placeholder="Optional"
                        value={malaysiaTripForm.notes}
                        onChange={e => setMalaysiaTripForm({...malaysiaTripForm, notes: e.target.value})}
                        style={{
                          width:'100%',
                          padding:'12px 14px',
                          fontSize:14,
                          border:'1px solid '+V.line,
                          borderRadius:9,
                          background:'#fff',
                          color:V.ink,
                          outline:'none',
                          transition:'border-color .15s',
                          resize:'vertical',
                          fontFamily:'inherit',
                        }}
                        onFocus={e => e.target.style.borderColor=V.cr}
                        onBlur={e => e.target.style.borderColor=V.line}
                      />
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      // Basic validation
                      if (!malaysiaTripForm.studentName || !malaysiaTripForm.studentAge ||
                          !malaysiaTripForm.parentName || !malaysiaTripForm.parentEmail ||
                          !malaysiaTripForm.parentPhone) {
                        setToast('Please complete all required fields (marked *).')
                        setTimeout(() => setToast(null), 3200)
                        return
                      }
                      if (malaysiaTripSubmitting) return
                      setMalaysiaTripSubmitting(true)

                      // POST to FormSubmit — delivers email to hellosmartious@gmail.com
                      // First-ever submission triggers a one-time confirmation email
                      // from FormSubmit to hellosmartious@gmail.com. Click the link
                      // in that email once to activate. Every submission after that
                      // arrives directly in your inbox.
                      try {
                        const payload = new FormData()
                        payload.append('_subject', `Malaysia Trip 2026 — Application from ${malaysiaTripForm.parentName}`)
                        payload.append('_template', 'table')
                        payload.append('_captcha', 'false')
                        payload.append('_replyto', malaysiaTripForm.parentEmail)
                        payload.append('Student Name', malaysiaTripForm.studentName)
                        payload.append('Student Age', malaysiaTripForm.studentAge)
                        payload.append('Parent / Guardian Name', malaysiaTripForm.parentName)
                        payload.append('Parent Email', malaysiaTripForm.parentEmail)
                        payload.append('Parent WhatsApp', malaysiaTripForm.parentPhone)
                        payload.append('City / Country', malaysiaTripForm.city || '—')
                        payload.append('Notes', malaysiaTripForm.notes || '—')
                        payload.append('Submitted from', 'smartioushomeschool.com/activities')

                        const resp = await fetch('https://formsubmit.co/ajax/hellosmartious@gmail.com', {
                          method: 'POST',
                          headers: { 'Accept': 'application/json' },
                          body: payload,
                        })

                        if (resp.ok) {
                          setMalaysiaTripSubmitted(true)
                          setToast('Application sent. We will contact you within one working day.')
                          setTimeout(() => setToast(null), 3500)
                        } else {
                          throw new Error('Form submission failed')
                        }
                      } catch (err) {
                        setToast('Submission failed. Please WhatsApp us at +254 745 021 212 instead.')
                        setTimeout(() => setToast(null), 4500)
                      } finally {
                        setMalaysiaTripSubmitting(false)
                      }
                    }}
                    disabled={malaysiaTripSubmitting}
                    style={{
                      marginTop:24,
                      width:'100%',
                      padding:'15px 28px',
                      borderRadius:10,
                      background: malaysiaTripSubmitting ? V.sl3 : V.cr,
                      color:'#fff',
                      border:'none',
                      fontSize:15,
                      fontWeight:800,
                      letterSpacing:'.02em',
                      cursor: malaysiaTripSubmitting ? 'wait' : 'pointer',
                      display:'inline-flex',
                      alignItems:'center',
                      justifyContent:'center',
                      gap:10,
                      transition:'background .2s',
                    }}>
                    {malaysiaTripSubmitting ? 'Sending application…' : 'Submit Application'}
                    {!malaysiaTripSubmitting && (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    )}
                  </button>
                  <p style={{textAlign:'center',marginTop:14,fontSize:12,color:V.sl3,lineHeight:1.6}}>
                    By submitting you consent to Smartious contacting you about this trip on the details you provide. Your application is emailed directly to <strong style={{color:V.cr}}>hellosmartious@gmail.com</strong>. We never share your details. KSh 3,000 registration is paid only after we confirm availability.
                  </p>
                  <div style={{textAlign:'center',marginTop:18,paddingTop:18,borderTop:'1px solid '+V.line}}>
                    <p style={{fontSize:12,color:V.sl3,marginBottom:10}}>Prefer to message us directly?</p>
                    <a
                      href={'https://wa.me/254745021212?text=' + encodeURIComponent('Hi Smartious, I would like to enquire about the Malaysia Trip 2026.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display:'inline-flex',
                        alignItems:'center',
                        gap:8,
                        padding:'10px 18px',
                        borderRadius:8,
                        background:'#25D366',
                        color:'#fff',
                        textDecoration:'none',
                        fontSize:13,
                        fontWeight:700,
                      }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.4-1.2c-.3-.2-.7-.1-.9.1l-.7.8c-.2.2-.5.3-.7.1-.9-.4-1.9-1.1-2.6-1.9-.7-.8-1.4-1.7-1.7-2.7-.1-.3 0-.5.2-.7l.8-.7c.3-.2.4-.6.1-.9L8.4 4.7c-.2-.4-.7-.5-1-.2L5.6 6.3c-.6.6-.8 1.5-.6 2.4.7 2.7 2.2 5 4.4 6.8 2.1 1.7 4.6 2.8 7.3 3.1.9.1 1.7-.2 2.3-.9l1.6-1.7c.3-.3.2-.8-.2-1l-2.9-1.8z"/></svg>
                      WhatsApp: +254 745 021 212
                    </a>
                  </div>
                </>
              ) : (
                <div style={{textAlign:'center',padding:'20px 0'}}>
                  <div style={{
                    width:64,
                    height:64,
                    borderRadius:'50%',
                    background:V.cr+'15',
                    margin:'0 auto 18px',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={V.cr} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                  </div>
                  <h3 style={{
                    fontFamily:"'Playfair Display',serif",
                    fontSize:'1.5rem',
                    fontWeight:700,
                    color:V.ink,
                    marginBottom:12,
                  }}>Application received</h3>
                  <p style={{fontSize:14,color:V.sl,lineHeight:1.7,maxWidth:420,margin:'0 auto'}}>
                    Thank you, {malaysiaTripForm.parentName}. Our trips team will contact you on {malaysiaTripForm.parentPhone} within one working day to confirm availability and walk you through the next steps.
                  </p>
                  <p style={{fontSize:13,color:V.sl3,marginTop:16}}>
                    Any urgent questions? WhatsApp us at <a href="https://wa.me/254745021212" target="_blank" rel="noopener noreferrer" style={{color:V.cr,fontWeight:700}}>+254 745 021 212</a> or email <a href="mailto:hellosmartious@gmail.com" style={{color:V.cr,fontWeight:700}}>hellosmartious@gmail.com</a>.
                  </p>
                </div>
              )}
            </div>

            <style>{`
              @media (max-width: 560px) {
                .malaysia-form-row { grid-template-columns: 1fr !important; }
                .malaysia-form-card { padding: 28px 24px 32px !important; }
              }
            `}</style>
          </div></section>

          {/* ====================================================== */}
          {/* END MALAYSIA TRIP                                       */}
          {/* ====================================================== */}


          {/* WEEKLY ACTIVITIES — WEDNESDAY 2–4 PM */}
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            <div style={{textAlign:'center',marginBottom:36}}>
              <div className="eyebrow" style={{justifyContent:'center'}}>Weekly Enrichment Programme</div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:8}}>Every Wednesday <em style={{color:V.cr}}>2:00 PM – 4:00 PM</em></h2>
              <p style={{fontSize:14,color:V.sl,maxWidth:640,margin:'0 auto',lineHeight:1.7}}>A protected two-hour window every week reserved for activities. No homework, no exams — just discovery, skill-building and friendship.</p>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:14}}>
              {[
                {n:'Swimming',         c:'#0EA5E9', d:'Stroke technique, water safety, fitness.'},
                {n:'Basketball',       c:'#F97316', d:'Team play, ball handling, fundamentals.'},
                {n:'Football',         c:'#15803D', d:'Skills, tactics, matches, league play.'},
                {n:'Badminton',        c:'#A21CAF', d:'Footwork, technique, doubles play.'},
                {n:'Tennis',           c:'#CA8A04', d:'Strokes, rallies, match practice.'},
                {n:'Table Tennis',     c:'#1E40AF', d:'Spin, speed, tournament play.'},
                {n:'Pickleball',       c:'#0F766E', d:'Fast-growing racquet sport, beginner-friendly.'},
                {n:'Archery',          c:'#7E22CE', d:'Focus, form, target shooting.'},
                {n:'Volleyball',       c:'#BE123C', d:'Team play, serves, blocks, rallies.'},
                {n:'Chess Club',       c:'#1F2937', d:'Strategy, tactics, tournaments.'},
                {n:'Coding Club',      c:'#0369A1', d:'Python, web, games, real projects.'},
                {n:'Robotics',         c:'#92400E', d:'Build, code, control real robots.'},
                {n:'Debate Club',      c:'#7D1025', d:'Argument, research, public speaking.'},
                {n:'Public Speaking',  c:'#9F1239', d:'Confidence, presentation, voice.'},
                {n:'STEM Lab',         c:'#166534', d:'Hands-on science experiments.'},
                {n:'Music & Piano',    c:'#7C2D12', d:'Theory, performance, ensembles.'},
                {n:'Art & Design',     c:'#A21CAF', d:'Drawing, painting, digital design.'},
                {n:'Dance',            c:'#DB2777', d:'Choreography, expression, fitness.'},
                {n:'Yoga & Wellness',  c:'#0F766E', d:'Mindfulness, flexibility, balance.'},
                {n:'Fitness Training', c:'#DC2626', d:'Strength, cardio, conditioning.'},
                {n:'Leadership & Entrepreneurship', c:'#1E3A8A', d:'Real projects, pitches, business plans.'},
              ].map(a => (
                <div key={a.n} style={{
                  background:'#fff', borderRadius:12, padding:'18px 16px',
                  border:'1px solid '+V.line, position:'relative',
                  transition:'transform .2s, box-shadow .2s, border-color .2s',
                  cursor:'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 28px '+a.c+'25'; e.currentTarget.style.borderColor=a.c+'60' }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor=V.line }}>
                  <div style={{
                    width:36, height:36, borderRadius:9,
                    background:a.c+'18', display:'flex', alignItems:'center', justifyContent:'center',
                    marginBottom:12,
                  }}>
                    <div style={{width:18, height:18, borderRadius:'50%', background:a.c}}/>
                  </div>
                  <div style={{fontSize:14, fontWeight:700, color:V.ink, marginBottom:4}}>{a.n}</div>
                  <div style={{fontSize:11.5, color:V.sl, lineHeight:1.55}}>{a.d}</div>
                </div>
              ))}
            </div>
          </div></section>

          {/* SPORTS SHOWCASE */}
          <section id="student-life" className="sec" style={{background:V.ink, color:'#fff'}}><div className="wrap">
            <div style={{textAlign:'center',marginBottom:36}}>
              <div className="eyebrow" style={{justifyContent:'center', color:V.gold2}}>Premium Sports</div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:'#fff',marginTop:8,marginBottom:8}}>Sport at the <em style={{color:V.gold2}}>Heart of Student Life</em></h2>
              <p style={{fontSize:14,color:'rgba(255,255,255,.7)',maxWidth:640,margin:'0 auto',lineHeight:1.7}}>Coached by qualified instructors at our Parklands centre and partner facilities. Every term ends with inter-house competitions, friendly matches and skills assessments.</p>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:18,marginBottom:32}}>
              {[
                ['Swimming',       '4', 'lanes weekly'],
                ['Football',       '2', 'leagues termly'],
                ['Tennis',         '8', 'court hours weekly'],
                ['Badminton',      '6', 'courts available'],
                ['Athletics',      '12','events tracked'],
                ['Squash',         '3', 'courts available'],
                ['Volleyball',     '2', 'teams per grade'],
                ['Table Tennis',   '10','tables available'],
                ['Fitness',        '5', 'sessions weekly'],
              ].map(([sport, stat, label]) => (
                <div key={sport} style={{
                  background:'rgba(255,255,255,.04)', borderRadius:12, padding:'20px 18px',
                  border:'1px solid rgba(255,255,255,.08)',
                  transition:'background .2s, border-color .2s, transform .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(201,160,48,.08)'; e.currentTarget.style.borderColor='rgba(201,160,48,.3)'; e.currentTarget.style.transform='translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,.08)'; e.currentTarget.style.transform='translateY(0)' }}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:'2.4rem',fontWeight:700,color:V.gold2,lineHeight:1,marginBottom:4}}>{stat}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.55)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>{label}</div>
                  <div style={{fontSize:15,fontWeight:700,color:'#fff'}}>{sport}</div>
                </div>
              ))}
            </div>

            <div style={{textAlign:'center',padding:'24px 16px',background:'rgba(201,160,48,.08)',border:'1px solid rgba(201,160,48,.2)',borderRadius:12}}>
              <div style={{fontSize:13,color:V.gold2,fontWeight:700,letterSpacing:'.04em',textTransform:'uppercase',marginBottom:6}}>Inter-house competitions every term</div>
              <div style={{fontSize:14,color:'rgba(255,255,255,.75)',maxWidth:580,margin:'0 auto',lineHeight:1.7}}>Students compete across athletic, intellectual and creative disciplines. Awards, trophies and a healthy sense of belonging.</div>
            </div>
          </div></section>

          {/* CLUBS & ENRICHMENT */}
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            <div style={{textAlign:'center',marginBottom:36}}>
              <div className="eyebrow" style={{justifyContent:'center'}}>Clubs &amp; Enrichment</div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:8}}>Build <em style={{color:V.cr}}>Skills That Matter</em></h2>
              <p style={{fontSize:14,color:V.sl,maxWidth:640,margin:'0 auto',lineHeight:1.7}}>Clubs run weekly online and in person. Many produce real outputs — published articles, working code, environmental campaigns, business plans.</p>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
              {[
                {n:'Coding Club',        sub:'Beginner → Advanced', d:'Build websites, games, and apps in Python and JavaScript. Quarterly hackathons.'},
                {n:'AI Club',            sub:'Future-ready skills', d:'Learn machine learning, prompt engineering, ethical AI. Build small AI projects.'},
                {n:'Robotics',           sub:'Hands-on engineering', d:'Design, build and code real robots. Compete in regional competitions.'},
                {n:'Entrepreneurship',   sub:'Real business plans', d:'Pitch real ideas. Term ends with a Shark-Tank-style pitch night.'},
                {n:'Debate Club',        sub:'Critical thinking',   d:'Weekly debates on world affairs. Inter-school debate tournaments.'},
                {n:'Model United Nations', sub:'Diplomacy & policy', d:'Represent countries, draft resolutions, negotiate solutions to global issues.'},
                {n:'Journalism',         sub:'Smartious newsletter', d:'Write, edit, publish. Real articles published in the student magazine.'},
                {n:'Environmental Club', sub:'Real impact',         d:'Tree-planting drives, climate campaigns, sustainability projects.'},
                {n:'Public Speaking',    sub:'Confidence on stage', d:'Speech writing, presentation skills, weekly practice sessions.'},
                {n:'Book Club',          sub:'Read, discuss, grow', d:'Monthly book picks across genres. Author Q&A sessions over Zoom.'},
              ].map(c => (
                <div key={c.n} style={{
                  background:'#fff', borderRadius:12, padding:'22px 20px',
                  border:'1px solid '+V.line,
                  borderLeft:'4px solid '+V.cr,
                  transition:'transform .2s, box-shadow .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 10px 24px rgba(125,16,37,.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}>
                  <div style={{fontSize:15,fontWeight:700,color:V.ink,marginBottom:3}}>{c.n}</div>
                  <div style={{fontSize:11,color:V.cr,fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase',marginBottom:10}}>{c.sub}</div>
                  <div style={{fontSize:12.5,color:V.sl,lineHeight:1.6}}>{c.d}</div>
                </div>
              ))}
            </div>
          </div></section>

          {/* PARENT TRUST SECTION */}
          <section className="sec" style={{background:'#fff'}}><div className="wrap">
            <div style={{textAlign:'center',marginBottom:36}}>
              <div className="eyebrow" style={{justifyContent:'center'}}>Parent Trust</div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:8}}>Holistic Growth in a <em style={{color:V.cr}}>Safe, Supervised Environment</em></h2>
              <p style={{fontSize:14,color:V.sl,maxWidth:640,margin:'0 auto',lineHeight:1.7}}>Every activity is designed with safety, age-appropriateness, and meaningful development at its core.</p>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
              {[
                ['Vetted Supervision',   'All in-person activities are run by trained Smartious staff and qualified coaches. 1:8 supervisor ratio for sports.'],
                ['Holistic Development', 'Academic, physical, social, emotional and creative growth — woven into the weekly rhythm.'],
                ['Confidence Building',  'Public speaking, performance, leadership roles. Students gradually take on more visible challenges.'],
                ['Teamwork',             'Team sports, group projects, debate teams. Real collaboration with real outcomes.'],
                ['Leadership Growth',    'Club officer roles, peer mentoring, captain positions. Students learn to lead each other.'],
                ['International Exposure','Mixed cohorts of local and diaspora students. Real cross-cultural friendships form naturally.'],
              ].map(([h, p]) => (
                <div key={h} style={{
                  padding:'20px 18px', borderRadius:11,
                  background:V.bone, border:'1px solid '+V.line,
                }}>
                  <div style={{
                    width:36, height:36, borderRadius:9,
                    background:V.cr+'12', display:'flex', alignItems:'center', justifyContent:'center',
                    marginBottom:12,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={V.cr} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div style={{fontSize:15,fontWeight:700,color:V.ink,marginBottom:6}}>{h}</div>
                  <div style={{fontSize:13,color:V.sl,lineHeight:1.6}}>{p}</div>
                </div>
              ))}
            </div>
          </div></section>

          {/* GALLERY — VISUAL ATMOSPHERE */}
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            <div style={{textAlign:'center',marginBottom:32}}>
              <div className="eyebrow" style={{justifyContent:'center'}}>Student Life Gallery</div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:8}}>Moments from <em style={{color:V.cr}}>Wednesdays at Smartious</em></h2>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:14}}>
              {[
                {label:'Swimming',     img:'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=70', alt:'Smartious homeschool students swimming during weekly enrichment'},
                {label:'Football',     img:'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=70', alt:'Smartious students playing football during student life activities'},
                {label:'Tennis',       img:'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=70', alt:'Smartious online school students learning tennis at Parklands centre'},
                {label:'Robotics Lab', img:'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=70', alt:'Smartious homeschool students building robots in STEM enrichment club'},
                {label:'Debate',       img:'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=800&q=70', alt:'Smartious students competing in debate club'},
                {label:'Music',        img:'https://images.unsplash.com/photo-1466428996289-fb355538da1b?auto=format&fit=crop&w=800&q=70', alt:'Smartious students learning piano during music enrichment'},
                {label:'Art Studio',   img:'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=70', alt:'Smartious homeschool art and design studio'},
                {label:'Coding Club',  img:'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=70', alt:'Smartious students learning to code during enrichment'},
              ].map(g => (
                <div key={g.label} style={{
                  position:'relative', borderRadius:12, overflow:'hidden',
                  aspectRatio:'4/3', cursor:'pointer',
                  transition:'transform .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform='scale(1.02)' }}
                onMouseLeave={e => { e.currentTarget.style.transform='scale(1)' }}>
                  <img src={g.img} alt={g.alt}
                    loading="lazy"
                    style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                  <div style={{
                    position:'absolute', inset:0,
                    background:'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0) 50%)',
                    display:'flex', alignItems:'flex-end', padding:'14px 16px',
                  }}>
                    <div style={{fontSize:14, fontWeight:700, color:'#fff', textShadow:'0 1px 3px rgba(0,0,0,.5)'}}>{g.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div></section>

          {/* CALL TO ACTION */}
          <section className="sec" style={{background:`linear-gradient(135deg, ${V.ink} 0%, ${V.cr} 100%)`, color:'#fff'}}><div className="wrap" style={{textAlign:'center',maxWidth:720,margin:'0 auto'}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2.2rem',fontWeight:700,marginBottom:14,lineHeight:1.2}}>
              Give Your Child More Than <em style={{color:V.gold2}}>Just Academics</em>
            </h2>
            <p style={{fontSize:15,color:'rgba(255,255,255,.85)',marginBottom:28,lineHeight:1.7}}>
              Sports. Music. Code. Leadership. Friendship. Every Wednesday, 2–4 PM, your child is somewhere they want to be — building skills no exam paper can measure.
            </p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
              <button onClick={() => P('enroll')}
                style={{
                  background:V.gold2, color:V.ink, border:'none',
                  padding:'13px 28px', borderRadius:8,
                  fontSize:14, fontWeight:800, cursor:'pointer',
                  display:'inline-flex', alignItems:'center', gap:8,
                }}>
                Enroll Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button onClick={() => P('consult')}
                style={{
                  background:'transparent', color:'#fff',
                  border:'2px solid rgba(255,255,255,.4)',
                  padding:'11px 26px', borderRadius:8,
                  fontSize:14, fontWeight:700, cursor:'pointer',
                }}>
                Book Free Consultation
              </button>
              <a href="https://wa.me/254745021212?text=Hi%20Smartious%2C%20I%27d%20like%20to%20know%20more%20about%20the%20Wednesday%20activities%20programme."
                target="_blank" rel="noopener noreferrer"
                style={{
                  background:'#25D366', color:'#fff', textDecoration:'none',
                  padding:'13px 26px', borderRadius:8,
                  fontSize:14, fontWeight:700,
                  display:'inline-flex', alignItems:'center', gap:8,
                }}>
                WhatsApp
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.4-1.2c-.3-.2-.7-.1-.9.1l-.7.8c-.2.2-.5.3-.7.1-.9-.4-1.9-1.1-2.6-1.9-.7-.8-1.4-1.7-1.7-2.7-.1-.3 0-.5.2-.7l.8-.7c.3-.2.4-.6.1-.9L8.4 4.7c-.2-.4-.7-.5-1-.2L5.6 6.3c-.6.6-.8 1.5-.6 2.4.7 2.7 2.2 5 4.4 6.8 2.1 1.7 4.6 2.8 7.3 3.1.9.1 1.7-.2 2.3-.9l1.6-1.7c.3-.3.2-.8-.2-1l-2.9-1.8z"/></svg>
              </a>
            </div>

            <div style={{marginTop:32,paddingTop:24,borderTop:'1px solid rgba(255,255,255,.15)',fontSize:12,color:'rgba(255,255,255,.6)',letterSpacing:'.04em'}}>
              Trial activity sessions available · Sibling discount · Diaspora and local families welcome
            </div>
          </div></section>
        </>
      )}

      {/* ══════════════════════════════════════════
          TEACHERS
      ══════════════════════════════════════════ */}
      {page === 'teachers' && (
        <>
          <div className="pg-hero"><div className="wrap">
            <div className="eyebrow">Our People</div>
            <h1 className="pg-h">Meet Our <em>Teachers</em></h1>
            <p className="pg-sub" style={{marginTop:12}}>Qualified, experienced subject specialists — the people behind every Smartious lesson. Tap any teacher to read their full profile.</p>
          </div></div>
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            {teachersLoading ? (
              <div style={{textAlign:'center',padding:'60px 0',color:V.sl2,fontSize:14}}>Loading our teaching team…</div>
            ) : publicTeachers.length === 0 ? (
              <div style={{textAlign:'center',padding:'60px 0',color:V.sl2,fontSize:14}}>
                Our teaching team will be listed here shortly.
              </div>
            ) : (
              <div className="team-grid">
                {publicTeachers.map(t => {
                  const open = expandedTeacher === t.id
                  const initials = t.name.split(/\s+/).map(w => w[0]).filter(Boolean).slice(0,2).join('').toUpperCase()
                  return (
                    <div key={t.id} className={`tm-card${open?' tm-open':''}`}
                      onClick={() => setExpandedTeacher(open ? null : t.id)}>
                      {/* Portrait */}
                      <div className="tm-photo">
                        {t.avatar
                          ? <img src={t.avatar} alt={t.name} className="tm-img" loading="lazy"/>
                          : <div className="tm-initials">{initials || 'S'}</div>}
                        <div className="tm-scrim"/>
                      </div>
                      {/* Name plate */}
                      <div className="tm-plate">
                        <div className="tm-name">{t.name}</div>
                        <div className="tm-role">{t.jobTitle}</div>
                      </div>
                      {/* Expandable detail */}
                      {open && (
                        <div className="tm-detail" onClick={e => e.stopPropagation()}>
                          {t.yearsOfExperience > 0 && (
                            <div className="tm-exp">
                              <strong>{t.yearsOfExperience}</strong> year{t.yearsOfExperience === 1 ? '' : 's'} of teaching experience
                            </div>
                          )}
                          {t.bio && <p className="tm-bio">{t.bio}</p>}
                          {t.subjects && t.subjects.length > 0 && (
                            <div className="tm-block">
                              <div className="tm-lbl">Subjects</div>
                              <div className="tm-chips">{t.subjects.map((s,i) => <span key={i} className="tm-chip">{s}</span>)}</div>
                            </div>
                          )}
                          {t.curriculum && t.curriculum.length > 0 && (
                            <div className="tm-block">
                              <div className="tm-lbl">Curricula</div>
                              <div className="tm-chips">{t.curriculum.map((c,i) => <span key={i} className="tm-chip">{c}</span>)}</div>
                            </div>
                          )}
                          {t.qualifications && t.qualifications.length > 0 && (
                            <div className="tm-block">
                              <div className="tm-lbl">Qualifications</div>
                              <ul className="tm-list">{t.qualifications.map((q,i) => <li key={i}>{q}</li>)}</ul>
                            </div>
                          )}
                          {t.certifications && t.certifications.length > 0 && (
                            <div className="tm-block">
                              <div className="tm-lbl">Certifications</div>
                              <ul className="tm-list">{t.certifications.map((c,i) => <li key={i}>{c}</li>)}</ul>
                            </div>
                          )}
                          {t.specializations && t.specializations.length > 0 && (
                            <div className="tm-block">
                              <div className="tm-lbl">Specialisations</div>
                              <div className="tm-chips">{t.specializations.map((s,i) => <span key={i} className="tm-chip">{s}</span>)}</div>
                            </div>
                          )}
                        </div>
                      )}
                      {/* Tap hint */}
                      <div className="tm-hint">{open ? 'Tap to close' : 'Tap for full profile'}</div>
                    </div>
                  )
                })}
              </div>
            )}
            <div style={{textAlign:'center',marginTop:48}}>
              <button className="btn-p" onClick={() => P('enroll')}>Learn With Our Teachers <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
            </div>
          </div></section>
          <Footer P={P}/>
        </>
      )}

      {page === 'faq' && (
        <>
          <div className="pg-hero"><div className="wrap"><div className="eyebrow">Common Questions</div><h1 className="pg-h">Everything You <em>Need to Know</em></h1><p className="pg-sub" style={{marginTop:12}}>Browse our most common questions — or WhatsApp us for an answer within 2 hours.</p></div></div>
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            <div className="faq-list">
              {[
                ['Is Smartious recognised internationally?','Yes. We deliver Cambridge International (CIE), IB, Pearson Edexcel and American College Board curricula — all globally recognised. Students sit exams at registered centres in their country of residence.'],
                ['Where do students sit their exams?','Students sit official Cambridge, IB or Edexcel examinations at accredited examination centres in their home country. We maintain a directory of approved centres across all 12+ countries and assist families with registration typically 6 months before the exam window.'],
                ['How does virtual school work outside Kenya?','Our virtual school is fully online and timezone-flexible. Live classes are scheduled around your timezone, all sessions are recorded for catch-up, and Mshauri AI is available 24/7. All you need is a reliable internet connection and a laptop or tablet.'],
                ['What is the $15 assessment fee for?','The $15 fee covers your child\'s diagnostic placement test, a written curriculum alignment report and the initial tutor matching process. It is a one-time, non-refundable charge that counts towards your first month\'s tuition.'],
                ['Can I switch curricula mid-year?','Yes. We conduct a fresh placement assessment at no additional cost, prepare a topic bridge plan and assign a tutor with dual-curriculum expertise.'],
                ['How is Mshauri AI different from ChatGPT?','Mshauri is built on Anthropic\'s Claude and uses the Socratic method — asking guiding questions rather than giving direct answers. It operates in English and Swahili and knows the specific curricula and exam formats our students prepare for.'],
                ['What is the minimum age for enrolment?','We accept students from age 3 (IB PYP) through to adults resitting qualifications. Our primary programmes begin at Grade 1 (age 6). There is no upper age limit.'],
                ['Can I cancel my subscription anytime?','Yes. All Smartious subscriptions can be cancelled with 30 days written notice — no penalties, no contracts.'],
                ['Do you offer sibling discounts?','Yes. A 10% sibling discount from the second child, and a 15% family rate for three or more children.'],
                ['What technology do students need?','A laptop, tablet or desktop with stable internet (minimum 5 Mbps), camera, microphone and a free Zoom account. All learning materials are provided digitally.'],
              ].map(([q,a],i) => (
                <div key={i} className={`fqi${faqOpen===i?' open':''}`}>
                  <button className="fqq" onClick={() => setFaqOpen(faqOpen===i?null:i)}>
                    {q}
                    <span className="fqi-ico">+</span>
                  </button>
                  <div className="fqa"><div className="fqa-in">{a}</div></div>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center',marginTop:44}}>
              <p style={{fontSize:15,color:V.sl,marginBottom:18}}>Still have questions? We answer within 2 hours.</p>
              <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
                <button className="btn-p" onClick={() => window.open('https://wa.me/254745021212?text=Hi%20Smartious%2C%20I%20have%20a%20question.','_blank')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.64 4.46 2 2 0 0 1 3.62 2.26h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.08 6.08l.97-.97a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.72 16.92z"/></svg>WhatsApp Us
                </button>
                <button className="btn-o" onClick={() => P('enroll')}>Enroll Now</button>
              </div>
            </div>
          </div></section>
          <Footer P={P}/>
        </>
      )}

      {/* ══════════════════════════════════════════
          BLOG
      ══════════════════════════════════════════ */}
      {page === 'blog' && (
        <>
          <div className="pg-hero"><div className="wrap"><div className="eyebrow">Knowledge Hub</div><h1 className="pg-h">Resources for <em>Global Families</em></h1><p className="pg-sub" style={{marginTop:12}}>Expert articles on homeschooling, curricula, exam preparation and AI-powered learning.</p></div></div>
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            <div className="bf-tabs">
              {[['all','All Articles'],['igcse','IGCSE'],['ib','IB'],['homeschool','Homeschooling'],['tuition','Tuition'],['ai','AI Learning'],['university','University'],['study-abroad','Study Abroad']].map(([id,l]) => (
                <button key={id} className={`bf${blogCat===id?' on':''}`} onClick={() => setBlogCat(id)}>{l}</button>
              ))}
            </div>

            {/* Country filter — second row, lighter visual weight */}
            <div style={{display:'flex',gap:7,flexWrap:'wrap',justifyContent:'center',marginTop:14,marginBottom:28}}>
              <div style={{fontSize:11,color:V.sl2,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:700,marginRight:6,padding:'8px 0',fontFamily:"'Syne',sans-serif"}}>Country:</div>
              {[
                ['all','🌍 All'],
                ['global','🌐 Global'],
                ['kenya','🇰🇪 Kenya'],
                ['usa','🇺🇸 USA'],
                ['uae','🇦🇪 UAE'],
                ['nigeria','🇳🇬 Nigeria'],
                ['za','🇿🇦 South Africa'],
                ['egypt','🇪🇬 Egypt'],
                ['botswana','🇧🇼 Botswana'],
              ].map(([id, l]) => {
                const on = blogCountry === id
                return (
                  <button key={id} onClick={() => setBlogCountry(id)}
                    style={{padding:'6px 13px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',border:`1px solid ${on?V.cr:V.bone3}`,background:on?V.cr:V.white,color:on?V.white:V.sl,transition:'all .2s',fontFamily:"'Syne',sans-serif"}}>
                    {l}
                  </button>
                )
              })}
            </div>
            {featuredBlog && (
              <div className="bfc" onClick={() => openArticle(featuredBlog.slug)}>
                <div className="bfc-l" style={{background: featuredBlog.img}}>
                  {featuredBlog.splash && (
                    <img
                      src={featuredBlog.splash}
                      alt=""
                      className="bfc-splash"
                      loading="lazy"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                  )}
                  <div className="bfc-scrim"/>
                  <div className="bfc-badge" style={{position:'absolute',top:18,left:18,zIndex:2}}>FEATURED · {(featuredBlog.cat || 'IGCSE').toUpperCase()}</div>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.38)" strokeWidth="1" strokeLinecap="round" style={{position:'relative',zIndex:1}}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                </div>
                <div className="bfc-r">
                  <div className="bfc-date">{featuredBlog.date.toUpperCase()}</div>
                  <h3 className="bfc-h">{featuredBlog.t}</h3>
                  <p className="bfc-p">{featuredBlog.ex}</p>
                  <div className="bfc-au">
                    <div className="bfc-av">{(featuredBlog.author||'SM').split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                    <div><div className="bfc-an">{featuredBlog.author}</div><div className="bfc-ar">{featuredBlog.role}</div></div>
                    <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:5,fontSize:'12.5px',fontWeight:700,color:V.gold3}}>Read <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={V.gold3} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
                  </div>
                </div>
              </div>
            )}
            {/* Teacher-published articles appear here automatically */}
            {store.articles.filter(a => a.status === 'Published').length > 0 && (
              <div style={{marginBottom:28}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:700,color:'#fff',opacity:.6,marginBottom:14,letterSpacing:'.05em',textTransform:'uppercase'}}>From Our Teachers</h3>
                <div className="blog-grid">
                  {store.articles.filter(a => a.status === 'Published').map((a) => (
                    <div key={a.id} className="bc reveal" onClick={() => showToast('Article: ' + a.title)}>
                      <div className="bc-img" style={{background:a.img || 'linear-gradient(135deg,#8B1A2E,#5A0B1B)'}}/>
                      <div className="bc-body">
                        <span className="bc-tag">{a.cat || 'IGCSE'}</span>
                        <h3 className="bc-t">{a.title}</h3>
                        <div className="bc-m">{a.author} · {a.date}</div>
                        {a.url && <div style={{fontSize:11,opacity:.5,marginTop:4,fontFamily:'monospace'}}>smartioushomeschool.com{a.url}</div>}
                        <div className="bc-rd">Read Article <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="blog-grid">
              {visibleBlog.map((b,i) => (
                <div key={i} className="bc reveal" onClick={() => openArticle(b.slug)}>
                  <div className="bc-img" style={{background:b.img}}>
                    {b.splash && (
                      <img
                        src={b.splash}
                        alt=""
                        className="bc-splash"
                        loading="lazy"
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />
                    )}
                    <div className="bc-scrim"/>
                    <div className="bc-wash"/>
                    <span className="bc-cat" style={{position:'relative',zIndex:2}}>{b.cat === 'study-abroad' ? 'Study Abroad' : b.cat.toUpperCase()}</span>
                  </div>
                  <div className="bc-body">
                    <div className="bc-date">{b.date}</div>
                    <div className="bc-h">{b.t}</div>
                    <div className="bc-ex">{b.ex}</div>
                    <div className="bc-rd">Read Article <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="nl-strip">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={V.cr} strokeWidth="1.5" strokeLinecap="round" style={{margin:'0 auto 12px',display:'block'}}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',fontWeight:700,color:V.ink,marginBottom:8}}>Get New Articles in Your Inbox</h3>
              <p style={{fontSize:14,color:V.sl,marginBottom:20}}>Join 4,000+ parents and students who receive our weekly education insights.</p>
              <div style={{display:'flex',gap:10,maxWidth:440,margin:'0 auto',flexWrap:'wrap'}}>
                <input style={{flex:1,minWidth:200,padding:'11px 14px',border:`1.5px solid ${V.bone3}`,borderRadius:6,fontSize:14,color:V.ink,background:V.white,fontFamily:"'Syne',sans-serif",outline:'none'}} placeholder="your@email.com" type="email"/>
                <button className="btn-p" onClick={() => showToast('Subscribed! Check your inbox.')}>Subscribe <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
              </div>
            </div>
          </div></section>
          <Footer P={P}/>
        </>
      )}

      {/* ══════════════════════════════════════════
          ARTICLE (single blog post)
      ══════════════════════════════════════════ */}
      {page === 'article' && (() => {
        const a = currentArticle && FULL_ARTICLES[currentArticle]
        if (!a) {
          return (
            <>
              <div className="pg-hero"><div className="wrap">
                <div className="eyebrow">Article Not Found</div>
                <h1 className="pg-h">That article <em>isn't available</em></h1>
                <p className="pg-sub" style={{marginTop:12}}>The article you're looking for may have been moved. Browse all our articles below.</p>
                <button className="btn-p" style={{marginTop:24}} onClick={() => P('blog')}>← Back to Blog</button>
              </div></div>
              <Footer P={P}/>
            </>
          )
        }
        const related = Object.entries(FULL_ARTICLES).filter(([s, x]) => s !== currentArticle && x.cat === a.cat).slice(0, 3)
        return (
          <>
            {/* Article hero with splash image + gradient-matched banner */}
            <div style={{background:a.img,padding:'120px 20px 80px',position:'relative',borderBottom:`1px solid ${V.bone3}`,overflow:'hidden'}}>
              {a.splash && (
                <img
                  src={a.splash}
                  alt=""
                  loading="eager"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                  style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',display:'block',zIndex:0}}
                />
              )}
              {/* Double-gradient scrim: crimson wash + readability fade */}
              <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(10,8,6,.55) 0%,rgba(139,26,46,.35) 60%,rgba(10,8,6,.75) 100%)',zIndex:1}}/>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(10,8,6,.15) 0%,rgba(10,8,6,.5) 100%)',zIndex:1}}/>
              {/* Gold accent bar at the very top */}
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent 0%,${V.gold3} 50%,transparent 100%)`,zIndex:3}}/>
              <div style={{maxWidth:860,margin:'0 auto',position:'relative',zIndex:2}}>
                <button onClick={() => P('blog')} style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',color:'rgba(255,255,255,.85)',padding:'7px 14px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:"'Syne',sans-serif",marginBottom:22,display:'inline-flex',alignItems:'center',gap:6,transition:'all .2s',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)'}}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.14)';e.currentTarget.style.borderColor='rgba(255,255,255,.28)'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.08)';e.currentTarget.style.borderColor='rgba(255,255,255,.15)'}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Back to Blog
                </button>
                <div style={{display:'inline-block',padding:'4px 12px',background:'rgba(240,204,90,.15)',border:'1px solid rgba(240,204,90,.3)',color:V.gold3,fontSize:10.5,fontWeight:700,letterSpacing:'.1em',borderRadius:20,marginBottom:18,textTransform:'uppercase',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)'}}>
                  {a.cat === 'study-abroad' ? 'Study Abroad' : a.cat}
                </div>
                <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(2rem,4.2vw,3.2rem)',fontWeight:800,color:V.white,lineHeight:1.15,letterSpacing:'-.02em',marginBottom:20,textShadow:'0 2px 24px rgba(10,8,6,.7)'}}>{a.t}</h1>
                <div style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                  <div style={{width:44,height:44,borderRadius:'50%',background:`linear-gradient(135deg,${V.cr},${V.gold2})`,display:'flex',alignItems:'center',justifyContent:'center',color:V.white,fontWeight:700,fontSize:14,fontFamily:"'Playfair Display',serif",boxShadow:'0 4px 12px rgba(10,8,6,.4)'}}>
                    {(a.author||'SM').split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <div style={{color:V.white,fontSize:14,fontWeight:600}}>{a.author}</div>
                    <div style={{color:'rgba(255,255,255,.65)',fontSize:12}}>{a.role}</div>
                  </div>
                  <div style={{color:'rgba(255,255,255,.55)',fontSize:12,marginLeft:'auto',fontFamily:"'Syne Mono',monospace",letterSpacing:'.05em'}}>{a.date}</div>
                </div>
              </div>
            </div>

            {/* Article body */}
            <article style={{background:V.bone,padding:'72px 20px'}}>
              <div style={{maxWidth:760,margin:'0 auto'}}>
                {/* Intro */}
                <p style={{fontFamily:"'Playfair Display',serif",fontSize:'1.35rem',fontStyle:'italic',color:V.ink2,lineHeight:1.7,marginBottom:48,paddingLeft:20,borderLeft:`3px solid ${V.cr}`,fontWeight:400}}>
                  {a.intro}
                </p>

                {/* Sections */}
                {a.sections.map((s, i) => (
                  <section key={i} style={{marginBottom:44}}>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:700,color:V.ink,marginBottom:16,letterSpacing:'-.01em',position:'relative',paddingLeft:18}}>
                      <span style={{position:'absolute',left:0,top:14,width:8,height:8,borderRadius:'50%',background:V.cr}}/>
                      {s.h}
                    </h2>
                    <p style={{fontSize:16.5,color:V.ink2,lineHeight:1.85,fontFamily:"'Syne',sans-serif"}}>{s.p}</p>
                  </section>
                ))}

                {/* Conclusion */}
                <div style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:14,padding:'28px 32px',marginTop:48,position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,width:6,height:'100%',background:`linear-gradient(180deg,${V.cr},${V.gold2})`}}/>
                  <div style={{fontSize:11,fontWeight:700,color:V.cr,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:10}}>Conclusion</div>
                  <p style={{fontSize:16,color:V.ink2,lineHeight:1.8,margin:0,fontFamily:"'Syne',sans-serif"}}>{a.conclusion}</p>
                </div>

                {/* FAQs — only rendered if the article has them */}
                {a.faqs && a.faqs.length > 0 && (
                  <div style={{marginTop:48}}>
                    <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',fontWeight:700,color:V.ink,marginBottom:18,letterSpacing:'-.01em'}}>
                      Frequently Asked <em style={{color:V.cr,fontStyle:'italic'}}>Questions</em>
                    </h3>
                    <div style={{display:'flex',flexDirection:'column',gap:12}}>
                      {a.faqs.map((f, i) => (
                        <details key={i} style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:10,padding:'16px 20px',cursor:'pointer',transition:'border-color .2s'}}>
                          <summary style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:V.ink,listStyle:'none',position:'relative',paddingRight:28,cursor:'pointer'}}>
                            {f.q}
                            <span style={{position:'absolute',right:0,top:2,color:V.cr,fontSize:18,fontWeight:400,transition:'transform .2s'}}>+</span>
                          </summary>
                          <p style={{fontSize:14.5,color:V.ink2,lineHeight:1.75,marginTop:12,marginBottom:0,fontFamily:"'Syne',sans-serif"}}>{f.a}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA strip */}
                <div style={{background:V.ink,borderRadius:16,padding:'36px 32px',marginTop:48,textAlign:'center',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${V.gold3},transparent)`}}/>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.55rem',color:V.white,marginBottom:10,fontWeight:700}}>
                    Ready to put this into practice?
                  </h3>
                  <p style={{fontSize:14,color:'rgba(247,243,237,.55)',marginBottom:22,maxWidth:440,margin:'0 auto 22px',lineHeight:1.6}}>
                    Book a free consultation with our admissions team. We'll review your child's profile and build a personalised learning plan.
                  </p>
                  <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
                    <button className="btn-p" onClick={() => P('consult')}>Book Free Consultation <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                    <button className="btn-o lt" onClick={() => P('enroll')} style={{borderColor:'rgba(184,150,12,.4)',color:V.gold2}}>Begin Enrollment</button>
                  </div>
                </div>

                {/* Author card */}
                <div style={{background:V.white,border:`1px solid ${V.bone3}`,borderRadius:14,padding:'24px',marginTop:32,display:'flex',alignItems:'center',gap:18,flexWrap:'wrap'}}>
                  <div style={{width:64,height:64,borderRadius:'50%',background:`linear-gradient(135deg,${V.cr},${V.gold2})`,display:'flex',alignItems:'center',justifyContent:'center',color:V.white,fontWeight:700,fontSize:20,fontFamily:"'Playfair Display',serif",flexShrink:0}}>
                    {(a.author||'SM').split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div style={{flex:1,minWidth:200}}>
                    <div style={{fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',color:V.sl2,fontWeight:700,marginBottom:4}}>Written by</div>
                    <div style={{fontSize:17,fontWeight:700,color:V.ink,fontFamily:"'Playfair Display',serif"}}>{a.author}</div>
                    <div style={{fontSize:13,color:V.sl,marginTop:2}}>{a.role} · Smartious Homeschool</div>
                  </div>
                </div>

                {/* Related articles */}
                {related.length > 0 && (
                  <div style={{marginTop:60}}>
                    <div style={{fontSize:11,fontWeight:700,color:V.cr,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:16}}>Related Articles</div>
                    <div className="blog-grid">
                      {related.map(([slug, r]) => (
                        <div key={slug} className="bc" onClick={() => openArticle(slug)} style={{cursor:'pointer'}}>
                          <div className="bc-img" style={{background:r.img}}>
                            {r.splash && (
                              <img
                                src={r.splash}
                                alt=""
                                className="bc-splash"
                                loading="lazy"
                                onError={e => { e.currentTarget.style.display = 'none' }}
                              />
                            )}
                            <div className="bc-scrim"/>
                            <div className="bc-wash"/>
                            <span className="bc-cat" style={{position:'relative',zIndex:2}}>{r.cat === 'study-abroad' ? 'Study Abroad' : r.cat.toUpperCase()}</span>
                          </div>
                          <div className="bc-body">
                            <div className="bc-date">{r.date}</div>
                            <div className="bc-h">{r.t}</div>
                            <div className="bc-ex">{r.intro.slice(0, 120) + '…'}</div>
                            <div className="bc-rd">Read Article <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
            <Footer P={P}/>
          </>
        )
      })()}

      {/* ══════════════════════════════════════════
          LEGAL PAGES — Privacy, Terms, Cookies, GDPR
      ══════════════════════════════════════════ */}
      {page === 'privacy' && <LegalPage P={P} title="Privacy" em="Policy" subtitle="How Smartious Homeschool collects, uses, and protects your personal data." effective="20 April 2026" sections={PRIVACY_POLICY}/>}
      {page === 'terms'   && <LegalPage P={P} title="Terms" em="of Service"  subtitle="The agreement between you and Smartious E-School Ltd when you use our website, portals, and services." effective="20 April 2026" sections={TERMS_OF_SERVICE}/>}
      {page === 'cookies' && <LegalPage P={P} title="Cookie" em="Policy" subtitle="How we use cookies and similar technologies on smartioushomeschool.com." effective="20 April 2026" sections={COOKIE_POLICY}/>}
      {page === 'gdpr'    && <LegalPage P={P} title="GDPR" em="Compliance" subtitle="Your rights under the EU General Data Protection Regulation and Kenya's Data Protection Act, 2019." effective="20 April 2026" sections={GDPR_COMPLIANCE}/>}

      {/* ══════════════════════════════════════════
          ENROLL
      ══════════════════════════════════════════ */}
      {page === 'enroll' && (
        <>
          <div className="pg-hero"><div className="wrap">
            <div className="eyebrow">Join Smartious</div>
            <h1 className="pg-h">Start Your <em>Journey Today</em></h1>
            <p className="pg-sub" style={{marginTop:12}}>Enrollment takes less than 5 minutes. Our team contacts you within 48 hours.</p>
          </div></div>
          <section className="sec" style={{background:V.bone,paddingTop:48,paddingBottom:0}}><div className="wrap">
            {/* Enrolment timeline SVG */}
            <div style={{maxWidth:1000,margin:'0 auto 24px',padding:'0 20px'}}>
              <div style={{textAlign:'center',marginBottom:16}}>
                <div className="eyebrow" style={{justifyContent:'center'}}>How enrolment works</div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',fontWeight:700,color:V.ink,marginTop:8,marginBottom:6,lineHeight:1.3}}>
                  Four steps. Most families <em style={{color:V.cr}}>start within a week.</em>
                </h3>
              </div>
              <svg viewBox="0 0 920 180" style={{width:'100%',maxWidth:920,height:'auto',display:'block',margin:'0 auto'}} xmlns="http://www.w3.org/2000/svg" aria-label="Four-step enrollment process">
                <line x1="100" y1="56" x2="820" y2="56" stroke="#DDD5C6" strokeWidth="3"/>
                <line x1="100" y1="56" x2="640" y2="56" stroke="#8B1A2E" strokeWidth="3" opacity="0.85"/>
                <circle cx="100" cy="56" r="22" fill="#8B1A2E"/>
                <text x="100" y="62" textAnchor="middle" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="16" fill="#FEFDFB">1</text>
                <text x="100" y="100" textAnchor="middle" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="14" fill="#0A0806">Free consult</text>
                <text x="100" y="118" textAnchor="middle" fontFamily="'Syne', sans-serif" fontSize="11" fill="#6B5E52">15 minutes</text>
                <text x="100" y="132" textAnchor="middle" fontFamily="'Syne', sans-serif" fontSize="11" fill="#6B5E52">WhatsApp or Zoom</text>
                <circle cx="370" cy="56" r="22" fill="#8B1A2E"/>
                <text x="370" y="62" textAnchor="middle" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="16" fill="#FEFDFB">2</text>
                <text x="370" y="100" textAnchor="middle" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="14" fill="#0A0806">Placement</text>
                <text x="370" y="118" textAnchor="middle" fontFamily="'Syne', sans-serif" fontSize="11" fill="#6B5E52">Short assessment</text>
                <text x="370" y="132" textAnchor="middle" fontFamily="'Syne', sans-serif" fontSize="11" fill="#6B5E52">to set the right level</text>
                <circle cx="640" cy="56" r="22" fill="#8B1A2E"/>
                <text x="640" y="62" textAnchor="middle" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="16" fill="#FEFDFB">3</text>
                <text x="640" y="100" textAnchor="middle" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="14" fill="#0A0806">Class &amp; teacher</text>
                <text x="640" y="118" textAnchor="middle" fontFamily="'Syne', sans-serif" fontSize="11" fill="#6B5E52">Curriculum chosen</text>
                <text x="640" y="132" textAnchor="middle" fontFamily="'Syne', sans-serif" fontSize="11" fill="#6B5E52">Timetable set</text>
                <circle cx="820" cy="56" r="22" fill="#B8960C"/>
                <text x="820" y="62" textAnchor="middle" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="16" fill="#0A0806">4</text>
                <text x="820" y="100" textAnchor="middle" fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="14" fill="#0A0806">First class</text>
                <text x="820" y="118" textAnchor="middle" fontFamily="'Syne', sans-serif" fontSize="11" fill="#6B5E52">Live with</text>
                <text x="820" y="132" textAnchor="middle" fontFamily="'Syne', sans-serif" fontSize="11" fill="#6B5E52">your teacher</text>
              </svg>
            </div>
          </div></section>
          <section className="sec" style={{background:V.bone,paddingTop:24}}><div className="wrap">
            <div className="wiz-shell">
              {/* Steps */}
              <div className="wiz-steps">
                {[['Programme'],['Your Details'],['All Done!']].map(([l],i) => (
                  <div key={i} className={`wst${wizStep===i+1?' on':''}`} id={`wst${i+1}`} onClick={() => i < wizStep - 1 && setWizStep(i+1)}>
                    <div className="ws-n">{wizStep > i+1 ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> : i+1}</div>
                    <div className="ws-l">{l}</div>
                  </div>
                ))}
              </div>

              <div className="wiz-body">
                {/* STEP 1 */}
                {wizStep === 1 && (
                  <div>
                    <div className="wiz-h">Choose Your Programme</div>
                    <div className="wiz-sub">Select the programme that best fits your goals.</div>
                    <div id="progCards" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:28}}>
                      {[
                        {id:'homeschool',svg:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',h:'Homeschool & Tutoring',p:'IGCSE · Cambridge A-Level · IB · British · American · CBC · Smartious Blended. Home visits, learning centre or virtual school.',from:'$85'},
                        {id:'iufp',svg:'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',h:'IUFP — University Foundation',p:'International University Foundation Programme. Direct entry to UK, US, Australian & European universities. 200+ partner universities.',from:'$5,480'},
                        {id:'studyabroad',svg:'<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',h:'Study Abroad Placement',p:'School & university placements in UK, USA, Australia, Germany, UAE & Canada. Includes visa guidance & pastoral support.',from:'$5,200'},
                      ].map(c => (
                        <div key={c.id} className={`prog-sel-card${currentProg===c.id?' on':''}`} onClick={() => setCurrentProg(c.id)}>
                          <div className="psc-ico"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" dangerouslySetInnerHTML={{__html:c.svg}}/></div>
                          <div className="psc-h">{c.h}</div>
                          <div className="psc-p">{c.p}</div>
                          <div className="psc-from">From <strong>{c.from}</strong>{c.id==='iufp'?'/year':c.id==='studyabroad'?'/term':'/month'}</div>
                        </div>
                      ))}
                    </div>
                    <div className="prog-sub-panel">
                      {currentProg === 'homeschool' && (
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                          <div><label className="fl">Preferred Curriculum *</label>
                            <select className="fi-i" value={enrollForm.curriculum} onChange={e=>setEF('curriculum',e.target.value)}><option value="">Select curriculum...</option>{['IGCSE (Cambridge)','Cambridge A-Level','IB Diploma (DP)','IB PYP / MYP','Pearson Edexcel','British National Curriculum','American Curriculum','CBC / KCSE (Kenya)','Smartious Blended'].map(o => <option key={o}>{o}</option>)}</select>
                          </div>
                          <div><label className="fl">Learning Mode *</label>
                            <select className="fi-i" value={enrollForm.learningMode} onChange={e=>setEF('learningMode',e.target.value)}><option value="">Select mode...</option>{['Homeschool — Tutor Visits Home (Nairobi)','Homeschool — Online Video Sessions','Smartious Learning Centre — Parklands, Nairobi','Virtual School — 100% Online','Private Tuition — Online','Private Tuition — Home Visit (Nairobi)'].map(o => <option key={o}>{o}</option>)}</select>
                          </div>
                        </div>
                      )}
                      {currentProg === 'iufp' && (
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                          <div><label className="fl">Academic Pathway *</label>
                            <select className="fi-i" value={enrollForm.pathway} onChange={e=>setEF('pathway',e.target.value)}><option value="">Select pathway...</option>{['Sciences — Medicine, Pharmacy, Biology, Chemistry','Business & Economics — Finance, Accounting, Management','Engineering & Technology — Engineering, Computer Science','Arts & Humanities — Law, Politics, Literature, Psychology'].map(o => <option key={o}>{o}</option>)}</select>
                          </div>
                          <div><label className="fl">Target Country *</label>
                            <select className="fi-i" value={enrollForm.targetCountry} onChange={e=>setEF('targetCountry',e.target.value)}><option value="">Select destination...</option>{['United Kingdom','United States','Australia','Germany','Canada','Other'].map(o => <option key={o}>{o}</option>)}</select>
                          </div>
                        </div>
                      )}
                      {currentProg === 'studyabroad' && (
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                          <div><label className="fl">Destination *</label>
                            <select className="fi-i" value={enrollForm.destination} onChange={e=>setEF('destination',e.target.value)}><option value="">Select destination...</option>{['United Kingdom — from $8,500/term','United States — from $9,200/semester','Australia — from $7,800/term','Germany — from $5,200/term','UAE — from $6,500/term','Canada — from $7,200/semester'].map(o => <option key={o}>{o}</option>)}</select>
                          </div>
                          <div><label className="fl">Duration *</label>
                            <select className="fi-i" value={enrollForm.duration} onChange={e=>setEF('duration',e.target.value)}><option value="">Select duration...</option>{['1 Term / Semester (3–4 months)','1 Academic Year (9–10 months)','2 Academic Years'].map(o => <option key={o}>{o}</option>)}</select>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="wiz-nav">
                      <span/>
                      <button className="wb wb-nx" onClick={() => setWizStep(2)}>Continue to Your Details <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {wizStep === 2 && (
                  <div>
                    <div className="wiz-h">Your Details</div>
                    <div className="wiz-sub">Tell us about the student and parent / guardian.</div>
                    <div className="fg" style={{marginBottom:16}}>
                      <div>
                        <label className="fl">Student's First Name *</label>
                        <input className="fi-i" type="text" value={enrollForm.firstName} onChange={e=>setEF('firstName',e.target.value)}/>
                      </div>
                      <div>
                        <label className="fl">Student's Last Name *</label>
                        <input className="fi-i" type="text" value={enrollForm.lastName} onChange={e=>setEF('lastName',e.target.value)}/>
                      </div>
                      <div>
                        <label className="fl">Parent / Guardian Email *</label>
                        <input className="fi-i" type="email" value={enrollForm.parentEmail} onChange={e=>setEF('parentEmail',e.target.value)}/>
                      </div>
                      <div>
                        <label className="fl">WhatsApp Number *</label>
                        <PhoneInput value={enrollForm.whatsapp} onChange={v => setEF('whatsapp', v)} placeholder="7XX XXX XXX" />
                      </div>
                      <div>
                        <label className="fl">Student's Date of Birth *</label>
                        <input className="fi-i" type="date" value={enrollForm.dob} onChange={e=>setEF('dob',e.target.value)}/>
                      </div>
                      <div>
                        <label className="fl">Country of Residence *</label>
                        <select className="fi-i" value={enrollForm.country} onChange={e=>setEF('country',e.target.value)}>
                          <option value="">Select country...</option>
                          {['Kenya','Nigeria','South Africa','Uganda','Tanzania','UAE','United Kingdom','United States','Canada','Australia','Other'].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="fl">Current School (Optional)</label>
                        <input className="fi-i" type="text" placeholder="e.g. Brookhouse School" value={enrollForm.currentSchool} onChange={e=>setEF('currentSchool',e.target.value)}/>
                      </div>
                      <div>
                        <label className="fl">Current Academic Level (for placement test)</label>
                        <select className="fi-i" value={enrollForm.gradeLevel} onChange={e=>setEF('gradeLevel',e.target.value)}>
                          <option value="">Auto-detect from curriculum</option>
                          {LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{gridColumn:'1/-1'}}>
                      <label className="fl">How did you hear about Smartious?</label>
                      <select className="fi-i" style={{width:'100%'}} value={enrollForm.heardFrom} onChange={e=>setEF('heardFrom',e.target.value)}>
                        <option value="">Select...</option>
                        {['Google Search','WhatsApp','Facebook / Instagram','Friend / Family Referral','LinkedIn','TikTok','School Recommendation','Other'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    {enrollError && <div style={{marginTop:14,color:'#8B1A2E',fontSize:13,padding:'10px 14px',background:'rgba(139,26,46,.06)',borderRadius:6,border:'1px solid rgba(139,26,46,.15)'}}>{enrollError}</div>}
                    <div className="wiz-nav">
                      <button className="wb wb-bk" onClick={() => setWizStep(1)}>&larr; Back</button>
                      <button className="wb wb-nx" disabled={enrollSending} onClick={() => {
                        const phoneDigits = (enrollForm.whatsapp || '').replace(/\D/g,'')
                        if (!enrollForm.firstName || !enrollForm.lastName || !enrollForm.parentEmail || !enrollForm.dob || !enrollForm.country) {
                          setEnrollError('Please fill in all required fields marked with *'); return
                        }
                        if (phoneDigits.length < 9) {
                          setEnrollError('Please enter your full WhatsApp number, including area code.'); return
                        }
                        if (!/^\S+@\S+\.\S+$/.test(enrollForm.parentEmail)) {
                          setEnrollError('Please enter a valid email address'); return
                        }
                        setEnrollError('')
                        submitEnrollment()
                      }}>
                        {enrollSending ? 'Submitting…' : <>Submit Enrollment <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3 — CONFIRMATION */}
                {wizStep === 3 && (
                  <div style={{textAlign:'center',padding:'20px 0'}}>
                    <div style={{width:76,height:76,borderRadius:'50%',background:`linear-gradient(135deg,${V.cr},${V.cr2})`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',animation:'lp-float 3s ease-in-out infinite'}}>
                      <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.8rem',fontWeight:700,color:V.ink,marginBottom:8}}>Enrollment Submitted!</div>
                    <p style={{fontSize:14.5,color:V.sl,marginBottom:14,lineHeight:1.8,maxWidth:520,margin:'0 auto 14px'}}>
                      Thank you, {enrollForm.firstName || 'there'}! We have received your enrollment application. Our admissions team will contact you at <strong>{enrollForm.parentEmail}</strong> within 48 hours to guide you through the next steps, including your child&rsquo;s placement assessment in the student portal.
                    </p>

                    {/* Assessment mode summary */}
                    {enrollForm.assessmentMode && (
                      <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'8px 14px',background:'rgba(139,26,46,.06)',border:'1px solid rgba(139,26,46,.18)',borderRadius:20,fontSize:12,color:V.cr,marginBottom:14,fontFamily:"'Syne',sans-serif",fontWeight:600}}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          {enrollForm.assessmentMode === 'online'
                            ? <><rect x="2" y="4" width="20" height="14" rx="2"/><polyline points="7 22 12 18 17 22"/></>
                            : enrollForm.assessmentMode === 'centre'
                              ? <><path d="M3 21h18M5 21V7l7-5 7 5v14"/><rect x="9" y="10" width="6" height="11"/></>
                              : <><path d="M3 10l9-7 9 7M5 10v10h14V10"/></>}
                        </svg>
                        Assessment:&nbsp;
                        {enrollForm.assessmentMode === 'online' && 'Completed online'}
                        {enrollForm.assessmentMode === 'centre' && 'In-person at centre'}
                        {enrollForm.assessmentMode === 'home'   && 'In-person home visit'}
                      </div>
                    )}
                    <div style={{height:6}}/>
                    {paySuccess && <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'8px 14px',background:'rgba(10,125,50,.08)',border:'1px solid rgba(10,125,50,.2)',borderRadius:20,fontSize:12,color:'#0A7D32',marginBottom:28,fontFamily:"'Syne Mono',monospace"}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0A7D32" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Paystack Ref: {paySuccess}
                    </div>}
                    <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
                      <button className="btn-p" onClick={goPortal}>Go to Your Portal <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                      <button className="btn-o" onClick={() => { setWizStep(1); P('home') }}>Back to Home</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div></section>
          <Footer P={P}/>
        </>
      )}

      {/* ══════════════════════════════════════════
          LOGIN
      ══════════════════════════════════════════ */}
      {/* ══ CONSULTATION PAGE ══ */}
      {page === 'consult' && (
        <div>
          <div className="pg-hero"><div className="wrap">
            <div className="eyebrow">Free Consultation</div>
            <h1 className="pg-h">Book a Free <em>Consultation</em></h1>
            <p className="pg-sub">Speak with our admissions team about the right curriculum and learning plan for your child. No commitment required.</p>
          </div></div>
          <section className="sec"><div className="wrap"><div className="consult-wrap">
            <ConsultForm P={P} />
          </div></div></section>
          <Footer P={P}/>
        </div>
      )}

      {/* ══ CONTACT PAGE ══ */}
      {page === 'contact' && (
        <div>
          <div className="pg-hero"><div className="wrap">
            <div className="eyebrow">Get in Touch</div>
            <h1 className="pg-h">Contact <em>Smartious</em></h1>
            <p className="pg-sub">We are here to help. Reach out by email, phone, WhatsApp or visit us in Nairobi.</p>
          </div></div>
          <section className="sec"><div className="wrap">
            <div className="contact-grid">
              {/* Left — contact info */}
              <div className="contact-info-card">
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',color:'#FEFDFB',marginBottom:8}}>Our <em style={{color:'#F0CC5A',fontStyle:'italic'}}>Details</em></div>
                {[
                  {icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F0CC5A" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label:'Email', value:'hellosmartious@gmail.com', sub:'Response within 2 hours', href:'mailto:hellosmartious@gmail.com'},
                  {icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F0CC5A" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42C1.6 2.34 2.33 1.4 3.41 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>, label:'Phone', value:'+254 745 021 212', sub:'Mon–Fri, 8am–6pm EAT', href:'tel:+254745021212'},
                  {icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F0CC5A" strokeWidth="2" strokeLinecap="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>, label:'WhatsApp', value:'+254 745 021 212', sub:'Quick responses · Tap to chat', href:'https://wa.me/254745021212'},
                  {icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F0CC5A" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, label:'Office', value:'Diamond Plaza I, Parklands', sub:'Nairobi, Kenya · 4th Avenue', href:'https://maps.google.com/?q=Diamond+Plaza+Parklands+Nairobi'},
                ].map(({icon,label,value,sub,href}) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" style={{textDecoration:'none'}} className="contact-method">
                    <div className="contact-icon">{icon}</div>
                    <div>
                      <div className="contact-method-label">{label}</div>
                      <div className="contact-method-value">{value}</div>
                      <div className="contact-method-sub">{sub}</div>
                    </div>
                  </a>
                ))}
              </div>
              {/* Right — email form */}
              <div className="contact-email-card">
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.4rem',color:'#0A0806',marginBottom:6}}>Send us a <em style={{color:'#8B1A2E',fontStyle:'italic'}}>Message</em></div>
                <p style={{fontSize:13.5,color:'#6B5E52',marginBottom:28,lineHeight:1.7}}>Fill in the form below and we will respond within 2 working hours.</p>
                <ContactForm />
              </div>
            </div>
          </div></section>
          <Footer P={P}/>
        </div>
      )}

      {page === 'login' && (
        <div className="login-bg">
          <div style={{position:'absolute',top:'-20%',left:'-10%',width:'60%',height:'120%',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(139,26,46,.14) 0%,transparent 70%)'}}/>
          <div style={{position:'absolute',bottom:'-20%',right:'-10%',width:'50%',height:'100%',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(184,150,12,.05) 0%,transparent 70%)'}}/>
          <div className="login-card">
            {/* Logo */}
            <div style={{textAlign:'center',marginBottom:30}}>
              <div style={{width:52,height:52,borderRadius:14,background:V.cr,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:V.white}}>Smart<em style={{color:V.gold3,fontStyle:'italic'}}>ious</em></div>
              <div style={{fontSize:'8.5px',fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(247,243,237,.2)',marginTop:2}}>HOMESCHOOL · GLOBAL</div>
            </div>

            <div className="login-h">Welcome back</div>
            <div className="login-sub">Sign in to your portal to continue learning.</div>

            <label className="login-fl">Email</label>
            <input className="login-inp" type="email" placeholder="your@email.com"/>
            <label className="login-fl">Password</label>
            <input className="login-inp" type="password" placeholder="••••••••"/>
            <button className="login-btn" onClick={goPortal}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Sign In to Portal
            </button>
            <div style={{display:'flex',alignItems:'center',gap:12,margin:'20px 0'}}>
              <div style={{flex:1,height:1,background:'rgba(255,255,255,.07)'}}/>
              <span style={{fontSize:12,color:'rgba(247,243,237,.2)',whiteSpace:'nowrap'}}>Or use demo access</span>
              <div style={{flex:1,height:1,background:'rgba(255,255,255,.07)'}}/>
            </div>
            <button style={{width:'100%',padding:12,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,color:V.white,fontWeight:700,fontSize:13.5,cursor:'pointer',fontFamily:"'Syne',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:8}} onClick={goPortal}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Go to Full Login Page
            </button>
          </div>

          {/* Quick demo card — Demo only */}
          <div style={{display:'flex',justifyContent:'center',marginTop:8}}>
            <div className="lpf" style={{cursor:'pointer',minWidth:200,textAlign:'center'}} onClick={goPortal}>
              <div style={{display:'flex',justifyContent:'center',marginBottom:8}}>
                <div style={{width:40,height:40,borderRadius:10,background:'rgba(139,26,46,.3)',border:'1px solid rgba(139,26,46,.5)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={V.cr} strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </div>
              <div style={{fontWeight:700,fontSize:14,color:V.white,marginBottom:4}}>Try Demo</div>
              <div className="lpf-l">demo@smartious.ac.ke</div>
              <div className="lpf-s">One-click access · No sign up needed</div>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING ASSISTANCE + WHATSAPP ── */}
      <div className="fab-stack">
        <a
          className="fab-wa"
          href="https://wa.me/254745021212?text=Hi%20Smartious%2C%20I%27d%20like%20more%20information."
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
        >
          <span className="fab-wa-ic">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </span>
          <span className="fab-lbl">Chat on WhatsApp</span>
        </a>
        <button
          className="fab-help"
          onClick={() => setFabOpen(o => !o)}
          aria-label="Get assistance"
          aria-expanded={fabOpen}
        >
          <span className="fab-help-ic">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </span>
          <span className="fab-lbl">{fabOpen ? 'Close' : 'Need Help?'}</span>
        </button>
      </div>

      {fabOpen && (
        <div className="fab-panel" role="dialog" aria-label="Smartious assistance">
          <div className="fab-panel-hd">
            <button className="fab-panel-cl" onClick={() => setFabOpen(false)} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="fab-panel-hd-row">
              <div className="fab-panel-av">S</div>
              <div>
                <div className="fab-panel-ti">Hello! I'm here to help</div>
                <div className="fab-panel-sb"><span className="fab-panel-dot"/> Admissions team · Typically replies in 2 hours</div>
              </div>
            </div>
          </div>
          <div className="fab-panel-body">
            <div className="fab-panel-msg">
              Welcome to <strong>Smartious Homeschool</strong>! How can we help you today? Choose an option below or message us directly.
            </div>
            <div className="fab-opts">
              <button className="fab-opt" onClick={() => { setFabOpen(false); P('enroll') }}>
                <span className="fab-opt-ic">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </span>
                Start enrollment application
              </button>
              <button className="fab-opt" onClick={() => { setFabOpen(false); P('consult') }}>
                <span className="fab-opt-ic">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </span>
                Book a free consultation
              </button>
              <button className="fab-opt" onClick={() => { setFabOpen(false); P('pricing') }}>
                <span className="fab-opt-ic">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </span>
                View pricing & plans
              </button>
              <button className="fab-opt" onClick={() => { setFabOpen(false); P('curricula') }}>
                <span className="fab-opt-ic">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </span>
                Explore curricula
              </button>
              <a
                className="fab-opt"
                href="https://wa.me/254745021212?text=Hi%20Smartious%2C%20I%27d%20like%20to%20speak%20to%20your%20admissions%20team."
                target="_blank"
                rel="noreferrer"
                onClick={() => setFabOpen(false)}
                style={{textDecoration:'none'}}
              >
                <span className="fab-opt-ic" style={{background:'rgba(37,211,102,.12)',color:'#25D366'}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                </span>
                Chat on WhatsApp
              </a>
              <a
                className="fab-opt"
                href="mailto:hellosmartious@gmail.com?subject=Smartious%20Enquiry"
                onClick={() => setFabOpen(false)}
                style={{textDecoration:'none'}}
              >
                <span className="fab-opt-ic">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                Send us an email
              </a>
              <a
                className="fab-opt"
                href="tel:+254745021212"
                onClick={() => setFabOpen(false)}
                style={{textDecoration:'none'}}
              >
                <span className="fab-opt-ic">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42C1.6 2.34 2.33 1.4 3.41 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </span>
                Call +254 745 021 212
              </a>
            </div>
          </div>
          <div className="fab-panel-ft">
            <strong>Smartious Homeschool · Nairobi, Kenya</strong><br/>
            Mon–Fri 8am–6pm EAT · We reply within 2 hours
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div id="lp-toast" className="show">{toast}</div>
      )}
    </div>
  )
}

// ── Price Card Component ──────────────────────────────────
function PriceCard({ lbl, ti, base, am, pr, fs, gold, badge, cta = 'Enroll Now', P, cycle = 'monthly', kes, kesTerm, kesAnnual, term, annual, hourly }) {
  // If old-style `am` was passed, use it as the base
  const baseAmt = typeof base === 'number' ? base : Number(am) || 0
  // For hourly pricing (private tuition per-hour rates), don't apply the cycle discount
  let amt, periodLabel, kesShown
  if (hourly) {
    amt = baseAmt
    periodLabel = pr  // e.g. "per hour · Any subject"
    kesShown = kes
  } else if (cycle === 'termly') {
    // Use the explicit term price when supplied; otherwise fall back to a computed estimate
    amt = (typeof term === 'number') ? term : Math.round(baseAmt * 3 * 0.95)
    periodLabel = `per term · ${pr}`
    kesShown = kesTerm
  } else if (cycle === 'annually') {
    amt = (typeof annual === 'number') ? annual : Math.round(baseAmt * 12 * 0.88)
    periodLabel = `per year · ${pr}`
    kesShown = kesAnnual
  } else {
    amt = baseAmt
    periodLabel = `per month · ${pr}`
    kesShown = kes
  }
  // Savings vs paying monthly across the same span
  const savings = !hourly && cycle === 'termly' && typeof term === 'number'
    ? Math.round(baseAmt * 3 - term)
    : !hourly && cycle === 'annually' && typeof annual === 'number'
      ? Math.round(baseAmt * 12 - annual)
      : !hourly && cycle === 'termly'
        ? Math.round(baseAmt * 3 - amt)
        : !hourly && cycle === 'annually'
          ? Math.round(baseAmt * 12 - amt)
          : 0

  return (
    <div className={`pc${gold?' ft':''}`}>
      {badge && <div className="pbadge">{badge}</div>}
      <div className="p-lbl">{lbl}</div>
      <div className="p-ti">{ti}</div>
      <div className="p-am"><sup>$</sup>{amt.toLocaleString()}</div>
      <div className="p-pr">{periodLabel}</div>
      {kesShown && !hourly && (
        <div style={{fontSize:'11.5px',color:gold?'rgba(247,243,237,.6)':'#8A7B6E',marginTop:2,marginBottom:6,fontStyle:'italic'}}>
          ≈ KES {kesShown.toLocaleString()}
        </div>
      )}
      {savings > 0 && (
        <div style={{display:'inline-block',padding:'3px 9px',background:gold?'rgba(240,204,90,.18)':'rgba(139,26,46,.08)',color:gold?'#F0CC5A':'#8B1A2E',fontSize:10.5,fontWeight:700,letterSpacing:'.04em',borderRadius:20,marginTop:4,marginBottom:6}}>
          You save ${savings.toLocaleString()}
        </div>
      )}
      <ul className="p-fs">
        {fs.map((f,i) => (
          <li key={i} className="p-f">
            <div className="p-ck">
              <svg viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke={gold ? '#F0CC5A' : '#8B1A2E'} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            {f}
          </li>
        ))}
      </ul>
      <button className={`p-btn ${gold?'p-gd':'p-ol'}`} onClick={() => P('enroll')}>{cta}</button>
    </div>
  )
}

// ── Consultation Form ─────────────────────────────────────
function ConsultForm({ P }) {
  const [form, setForm] = useState({name:'',email:'',phone:'+254 ',country:'',curriculum:'',message:'',mode:'online',venue:'office',address:''})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const submit = async () => {
    if (!form.name || !form.email || !form.phone) { setErr('Please fill in all required fields.'); return }
    if (form.mode === 'inperson' && form.venue === 'home' && !form.address.trim()) {
      setErr('Please provide your home visit address for the consultation.')
      return
    }
    setSending(true); setErr('')
    // Build a human-readable consultation format string for the email
    const formatLabel = form.mode === 'online'
      ? 'Online via Google Meet'
      : form.venue === 'office'
        ? 'In-person at Smartious Office (Diamond Plaza I, Parklands, Nairobi)'
        : `In-person home visit — ${form.address}`
    // Primary store: Front Desk database. Secondary: email copy.
    // The request succeeds if either path goes through.
    let fdOk = false, emailOk = false
    try {
      const fd = await fetch(FRONTDESK_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'consultation',
          name: form.name,
          email: form.email,
          phone: form.phone,
          country: form.country,
          curriculum: form.curriculum,
          consultFormat: formatLabel,
          address: form.mode === 'inperson' && form.venue === 'home' ? form.address : '',
          message: form.message,
          sourcePage: 'consult-form',
        }),
      })
      fdOk = fd.ok
    } catch (e) {
      console.error('[consult] front desk capture failed:', e?.message)
    }
    try {
      const res = await fetch(`https://formsubmit.co/ajax/hellosmartious@gmail.com`, {
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify({
          _subject: `Free Consultation Request — ${form.name}`,
          _template: 'table',
          _captcha: 'false',
          Name: form.name,
          Email: form.email,
          Phone: form.phone,
          Country: form.country,
          Curriculum: form.curriculum,
          'Consultation Format': formatLabel,
          Message: form.message || 'No additional message provided.',
        })
      })
      emailOk = res.ok
    } catch (e) {
      console.error('[consult] email copy failed:', e?.message)
    }
    if (fdOk || emailOk) {
      setSent(true)
      try {
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'ads_conversion_Submit_lead_form_1', {})
        }
      } catch (e) {
        console.error('[gtag] conversion event failed:', e?.message)
      }
    } else {
      setErr('Could not send your request. Please check your connection and try again, or WhatsApp us at +254 745 021 212.')
    }
    setSending(false)
  }

  if (sent) return (
    <div className="consult-card consult-success">
      <div className="consult-success-icon">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#8B1A2E" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.8rem',color:'#0A0806',marginBottom:12}}>Request <em style={{color:'#8B1A2E',fontStyle:'italic'}}>Received!</em></div>
      <p style={{fontSize:15,color:'#6B5E52',lineHeight:1.8,marginBottom:12,maxWidth:440,margin:'0 auto 12px'}}>Thank you {form.name}. Our admissions team will reach you at <strong>{form.email}</strong> within 2 working hours to schedule your free consultation.</p>
      <p style={{fontSize:13,color:'#8A7B6E',marginBottom:32,maxWidth:440,margin:'0 auto 32px'}}>
        <strong>Preferred format:</strong>{' '}
        {form.mode === 'online'
          ? 'Online via Google Meet'
          : form.venue === 'office'
            ? 'In-person at our Nairobi office'
            : 'In-person home visit'}
      </p>
      <button className="btn-p" onClick={() => P('home')}>Back to Home</button>
    </div>
  )

  return (
    <div className="consult-card">
      <div style={{marginBottom:32}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',color:'#0A0806',marginBottom:8}}>Tell us about <em style={{color:'#8B1A2E',fontStyle:'italic'}}>your child</em></div>
        <p style={{fontSize:14,color:'#6B5E52',lineHeight:1.7}}>Fill in the form below. Our team will contact you within 2 working hours to schedule a free 30-minute consultation call.</p>
      </div>
      <div className="consult-grid">
        <div className="consult-field">
          <label className="consult-label">Your Full Name *</label>
          <input className="consult-input" placeholder="Jane Osei" value={form.name} onChange={e=>set('name',e.target.value)}/>
        </div>
        <div className="consult-field">
          <label className="consult-label">Email Address *</label>
          <input className="consult-input" type="email" placeholder="jane@email.com" value={form.email} onChange={e=>set('email',e.target.value)}/>
        </div>
        <div className="consult-field">
          <label className="consult-label">WhatsApp / Phone *</label>
          <PhoneInput value={form.phone} onChange={v => set('phone', v)} placeholder="7XX XXX XXX" />
        </div>
        <div className="consult-field">
          <label className="consult-label">Country of Residence</label>
          <select className="consult-select" value={form.country} onChange={e=>set('country',e.target.value)}>
            <option value="">Select country…</option>
            {['Kenya','Nigeria','South Africa','Uganda','Tanzania','UAE','United Kingdom','United States','Canada','Australia','Other'].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Consultation format — Online via Google Meet vs In-person */}
      <div className="consult-field">
        <label className="consult-label">How would you like to meet? *</label>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginTop:4}}>
          {[
            {id:'online',   title:'Online via Google Meet', sub:'Video call · Anywhere in the world', icon:'<rect x="2" y="4" width="20" height="14" rx="2"/><polyline points="7 22 12 18 17 22"/>'},
            {id:'inperson', title:'In-person consultation', sub:'Meet our team face to face',          icon:'<path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>'},
          ].map(o => {
            const on = form.mode === o.id
            return (
              <button key={o.id} type="button" onClick={() => set('mode', o.id)}
                style={{textAlign:'left',padding:'14px 14px',border:`1.5px solid ${on?'#8B1A2E':'#DDD5C6'}`,borderRadius:10,background:on?'rgba(139,26,46,.04)':'#FEFDFB',cursor:'pointer',fontFamily:"'Syne',sans-serif",transition:'all .2s',display:'flex',alignItems:'flex-start',gap:11}}>
                <div style={{width:32,height:32,borderRadius:8,background:on?'#8B1A2E':'#F7F3ED',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={on?'#fff':'#8B1A2E'} strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html:o.icon}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13.5,color:'#0A0806',marginBottom:2}}>{o.title}</div>
                  <div style={{fontSize:11.5,color:'#8A7B6E',lineHeight:1.4}}>{o.sub}</div>
                </div>
                {on && <div style={{width:16,height:16,borderRadius:'50%',background:'#8B1A2E',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:4}}>
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>
                </div>}
              </button>
            )
          })}
        </div>
      </div>

      {/* If in-person — pick Office vs Home */}
      {form.mode === 'inperson' && (
        <div className="consult-field" style={{background:'rgba(139,26,46,.025)',border:'1px dashed rgba(139,26,46,.2)',borderRadius:10,padding:'16px 18px'}}>
          <label className="consult-label" style={{marginBottom:10}}>Where should we meet? *</label>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
            {[
              {id:'office', title:'At our office', sub:'Diamond Plaza I · Parklands · Nairobi', icon:'<path d="M3 21h18M5 21V7l7-5 7 5v14"/><rect x="9" y="10" width="6" height="11"/>'},
              {id:'home',   title:'Home visit',    sub:'We come to you (Nairobi metro)',       icon:'<path d="M3 10l9-7 9 7M5 10v10h14V10"/>'},
            ].map(v => {
              const on = form.venue === v.id
              return (
                <button key={v.id} type="button" onClick={() => set('venue', v.id)}
                  style={{textAlign:'left',padding:'12px 14px',border:`1.5px solid ${on?'#8B1A2E':'#DDD5C6'}`,borderRadius:8,background:on?'#fff':'#FEFDFB',cursor:'pointer',fontFamily:"'Syne',sans-serif",display:'flex',alignItems:'flex-start',gap:10,transition:'all .2s'}}>
                  <div style={{width:28,height:28,borderRadius:6,background:on?'#8B1A2E':'#F7F3ED',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={on?'#fff':'#8B1A2E'} strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html:v.icon}}/>
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:'#0A0806',marginBottom:2}}>{v.title}</div>
                    <div style={{fontSize:11,color:'#8A7B6E',lineHeight:1.4}}>{v.sub}</div>
                  </div>
                </button>
              )
            })}
          </div>
          {form.venue === 'home' && (
            <div style={{marginTop:14}}>
              <label className="consult-label">Home visit address *</label>
              <input className="consult-input" placeholder="Estate, street, house number, nearest landmark…" value={form.address} onChange={e=>set('address',e.target.value)}/>
              <div style={{fontSize:11.5,color:'#8A7B6E',marginTop:6,lineHeight:1.5}}>
                Home visits are available within the Nairobi metro area. We'll confirm feasibility when we call you back.
              </div>
            </div>
          )}
        </div>
      )}

      <div className="consult-field">
        <label className="consult-label">Curriculum of Interest</label>
        <select className="consult-select" value={form.curriculum} onChange={e=>set('curriculum',e.target.value)}>
          <option value="">Select curriculum…</option>
          {['IGCSE (Cambridge)','Cambridge A-Level','IB Diploma','CBC / KCSE','British National Curriculum','American Curriculum','Not sure — need guidance'].map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="consult-field">
        <label className="consult-label">Any questions or context? (Optional)</label>
        <textarea className="consult-textarea" placeholder="Tell us about your child's age, current grade, learning goals, or any specific needs…" value={form.message} onChange={e=>set('message',e.target.value)}/>
      </div>
      {err && <div style={{color:'#8B1A2E',fontSize:13,marginBottom:16,padding:'10px 14px',background:'rgba(139,26,46,.06)',borderRadius:6,border:'1px solid rgba(139,26,46,.15)'}}>{err}</div>}
      <button className="btn-p" style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:14.5}} onClick={submit} disabled={sending}>
        {sending ? 'Sending…' : <>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Book Free Consultation
        </>}
      </button>
      <p style={{fontSize:12,color:'#ADA094',textAlign:'center',marginTop:14}}>No commitment · Our team contacts you within 2 hours · 100% free</p>
    </div>
  )
}

// ── Contact Form ───────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({name:'',email:'',subject:'',message:''})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const submit = async () => {
    if (!form.name || !form.email || !form.message) { setErr('Please fill in all required fields.'); return }
    setSending(true); setErr('')
    let fdOk = false, emailOk = false
    try {
      const fd = await fetch(FRONTDESK_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          name: form.name,
          email: form.email,
          subject: form.subject || 'General Enquiry',
          message: form.message,
          sourcePage: 'contact-form',
        }),
      })
      fdOk = fd.ok
    } catch (e) {
      console.error('[contact] front desk capture failed:', e?.message)
    }
    try {
      const res = await fetch(`https://formsubmit.co/ajax/hellosmartious@gmail.com`, {
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify({
          _subject: `Website Message — ${form.subject || 'General Enquiry'}`,
          _template: 'table',
          _captcha: 'false',
          Name: form.name,
          Email: form.email,
          Subject: form.subject || 'General Enquiry',
          Message: form.message,
        })
      })
      emailOk = res.ok
    } catch (e) {
      console.error('[contact] email copy failed:', e?.message)
    }
    if (fdOk || emailOk) {
      setSent(true)
      try {
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'ads_conversion_Submit_lead_form_1', {})
        }
      } catch (e) {
        console.error('[gtag] conversion event failed:', e?.message)
      }
    } else {
      setErr('Could not send your message. Please check your connection and try again, or email hellosmartious@gmail.com directly.')
    }
    setSending(false)
  }

  if (sent) return (
    <div style={{textAlign:'center',padding:'32px 0'}}>
      <div style={{width:56,height:56,borderRadius:'50%',background:'rgba(139,26,46,.08)',border:'2px solid rgba(139,26,46,.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#8B1A2E" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.4rem',color:'#0A0806',marginBottom:8}}>Message Sent!</div>
      <p style={{fontSize:14,color:'#6B5E52',lineHeight:1.7}}>We will reply to <strong>{form.email}</strong> within 2 working hours.</p>
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div className="consult-grid">
        <div className="consult-field" style={{marginBottom:0}}>
          <label className="consult-label">Full Name *</label>
          <input className="consult-input" placeholder="Your name" value={form.name} onChange={e=>set('name',e.target.value)}/>
        </div>
        <div className="consult-field" style={{marginBottom:0}}>
          <label className="consult-label">Email *</label>
          <input className="consult-input" type="email" placeholder="your@email.com" value={form.email} onChange={e=>set('email',e.target.value)}/>
        </div>
      </div>
      <div className="consult-field" style={{marginBottom:0}}>
        <label className="consult-label">Subject</label>
        <input className="consult-input" placeholder="e.g. IGCSE enquiry, pricing, tutor availability…" value={form.subject} onChange={e=>set('subject',e.target.value)}/>
      </div>
      <div className="consult-field" style={{marginBottom:0}}>
        <label className="consult-label">Message *</label>
        <textarea className="consult-textarea" placeholder="How can we help you?" value={form.message} onChange={e=>set('message',e.target.value)}/>
      </div>
      {err && <div style={{color:'#8B1A2E',fontSize:13,padding:'10px 14px',background:'rgba(139,26,46,.06)',borderRadius:6,border:'1px solid rgba(139,26,46,.15)'}}>{err}</div>}
      <button className="btn-p" style={{width:'100%',justifyContent:'center',padding:13,fontSize:14}} onClick={submit} disabled={sending}>
        {sending ? 'Sending…' : <>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Send Message
        </>}
      </button>
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────
function Footer({ P }) {
  const { siteConfig: cfg } = useStore()
  const footerNav = useNavigate()
  return (
    <footer>
      <div className="wrap">
        <div className="ft-grid">
          <div>
            <div style={{marginBottom:18}}><SmartiousLogo size={44} withText={true} tone="light"/></div>
            <div className="ft-d">Kenya's leading homeschool education provider. IGCSE, Cambridge, IB, British, American and CBC curricula. Expert tutors. AI-powered. 12+ countries.</div>
          </div>
          <div>
            <div className="ft-ch">Programmes</div>
            <ul className="ft-lk">{['IGCSE','Cambridge A-Level','IB Diploma','CBC / KCSE','British Curriculum','American Curriculum','Smartious Blended'].map(l => <li key={l}><a onClick={() => P('curricula')}>{l}</a></li>)}</ul>
          </div>
          <div>
            <div className="ft-ch">Services</div>
            <ul className="ft-lk">{['Homeschool at Home','Learning Centre Nairobi','Virtual School','Private Tuition','Mshauri AI Tutor','IUFP Programme','Study Abroad'].map(l => <li key={l}><a onClick={() => P('services')}>{l}</a></li>)}</ul>
          </div>
          <div>
            <div className="ft-ch">Contact</div>
            <div className="ft-ct">
              <a href="mailto:hellosmartious@gmail.com" style={{color:'inherit',textDecoration:'none',display:'flex',alignItems:'center',gap:7,transition:'color .2s'}} onMouseEnter={e=>e.currentTarget.style.color='#F0CC5A'} onMouseLeave={e=>e.currentTarget.style.color='inherit'}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                hellosmartious@gmail.com
              </a>
              <a href="tel:+254745021212" style={{color:'inherit',textDecoration:'none',display:'flex',alignItems:'center',gap:7,transition:'color .2s'}} onMouseEnter={e=>e.currentTarget.style.color='#F0CC5A'} onMouseLeave={e=>e.currentTarget.style.color='inherit'}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42C1.6 2.34 2.33 1.4 3.41 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +254 745 021 212
              </a>
              <a href="https://wa.me/254745021212" target="_blank" rel="noreferrer" style={{color:'inherit',textDecoration:'none',display:'flex',alignItems:'center',gap:7,transition:'color .2s'}} onMouseEnter={e=>e.currentTarget.style.color='#25D366'} onMouseLeave={e=>e.currentTarget.style.color='inherit'}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                WhatsApp Chat
              </a>
              <div style={{display:'flex',alignItems:'center',gap:7}}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Diamond Plaza I, Parklands, Nairobi, Kenya
              </div>
            </div>
          </div>
        </div>
        <div className="ft-bot">
          <div className="ft-copy">{cfg.footerCopy || '© 2026 Smartious E-School Ltd. Nairobi, Kenya. All rights reserved.'}</div>
          <div className="ft-acs">
            {[['privacy','Privacy Policy'],['terms','Terms of Service'],['cookies','Cookie Policy'],['gdpr','GDPR']].map(([id, l]) => (
              <div key={id} className="ft-ac" onClick={() => P(id)} style={{cursor:'pointer'}}>{l}</div>
            ))}
            <div
              className="ft-ac"
              onClick={() => footerNav('/admin-login')}
              style={{
                cursor:'pointer',
                color:'rgba(247,243,237,.22)',
                borderLeft:'1px solid rgba(247,243,237,.08)',
                paddingLeft:14,
                marginLeft:4,
                display:'flex',
                alignItems:'center',
                gap:6,
                transition:'color .2s'
              }}
              onMouseEnter={e=>e.currentTarget.style.color='rgba(184,150,12,.55)'}
              onMouseLeave={e=>e.currentTarget.style.color='rgba(247,243,237,.22)'}
              aria-label="Staff and administrator login"
              title="Staff & Administrator Access"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Admin Login
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── CompareVideoEmbed — YouTube facade ────────────────────
 * Loads only a thumbnail by default. The YouTube iframe (~500
 * KB of JS + cookies) loads only after the user clicks Play.
 *
 * Designed for vertical YouTube Shorts (9:16 aspect ratio).
 * The container is capped at a phone-sized width so the video
 * doesn't dominate the page on desktop.
 *
 * Privacy: uses youtube-nocookie.com domain so no tracking
 * cookies are set until the user explicitly plays.
 */
function CompareVideoEmbed({ videoId }) {
  const [playing, setPlaying] = useState(false)
  if (!videoId) return null

  return (
    <div style={{
      maxWidth: 360,
      margin: '0 auto',
      aspectRatio: '9 / 16',
      borderRadius: 14,
      overflow: 'hidden',
      position: 'relative',
      background: '#000',
      boxShadow: '0 12px 32px rgba(0,0,0,.25)',
    }}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title="Smartious student story"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
      ) : (
        <button
          onClick={() => setPlaying(true)}
          aria-label="Play video testimonial"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            background: 'transparent', border: 'none',
            cursor: 'pointer', padding: 0,
          }}>
          {/* Thumbnail */}
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt="Smartious student testimonial — tap to play video"
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Play overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,.55) 100%)',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(139,26,46,.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,.4)',
              transition: 'transform .15s',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <polygon points="8,5 19,12 8,19"/>
              </svg>
            </div>
          </div>
          {/* Caption */}
          <div style={{
            position: 'absolute', left: 14, right: 14, bottom: 14,
            color: '#fff',
            fontSize: 12, fontWeight: 600,
            textShadow: '0 1px 4px rgba(0,0,0,.6)',
            letterSpacing: '.02em',
          }}>
            Tap to play · Watch on YouTube
          </div>
        </button>
      )}
    </div>
  )
}
