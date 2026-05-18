import { useStore } from '../context/ctx.jsx'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'

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
  }, [title, description])
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
  .lp .h-bg{position:absolute;inset:0;z-index:1;background-image:url('/hero-learning-centre.jpg');background-size:cover;background-position:center 35%;background-repeat:no-repeat;filter:saturate(1.05) contrast(1.02)}
  .lp .h-ov{position:absolute;inset:0;z-index:2;background:linear-gradient(110deg,rgba(10,8,6,.94) 0%,rgba(20,10,8,.8) 38%,rgba(60,14,24,.58) 62%,rgba(10,8,6,.75) 100%)}
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
    .lp .cur-grid,.lp .svc-grid,.lp .tgrid,.lp .blog-grid,.lp .price-grid{grid-template-columns:repeat(2,1fr)}
    .lp .hl-grid,.lp .stat-grid,.lp .proc-grid,.lp .prog-info-grid,.lp .prog-path-grid,.lp .sa-grid{grid-template-columns:repeat(2,1fr)}
  }
  @media(max-width:768px){
    .lp .nav-links,.lp .nav-actions{display:none}
    .lp .h-stats{display:none}
    .lp .h-mob-stats{display:grid!important}
    .lp .mob-burger{display:flex!important}
    .lp .mob-page-strip{display:block!important}
    .lp .wrap,.lp .nav-wrap,.lp .h-body,.lp .cta-in{padding-left:20px;padding-right:20px}
    .lp .sec{padding:64px 0}
    .lp .h1{font-size:clamp(2.8rem,12vw,4rem)}
    .lp .hl-grid,.lp .stat-grid,.lp .proc-grid,.lp .cur-grid,.lp .svc-grid,.lp .tgrid,.lp .blog-grid,.lp .price-grid,.lp .prog-info-grid,.lp .prog-path-grid,.lp .sa-grid{grid-template-columns:1fr}
    .lp .fg,.lp .pay-o{grid-template-columns:1fr 1fr}
    .lp .ft-grid{grid-template-columns:1fr}
    .lp .wiz-steps{flex-wrap:wrap}.lp .wst{min-width:50%}
    .lp .wiz-body{padding:24px 18px}
    .lp .bfc{grid-template-columns:1fr}.lp .bfc-l{min-height:180px}
    .lp .lpfs{grid-template-columns:repeat(3,1fr)}
    /* — added: tighter section + heading sizing on tablets/phones — */
    .lp .sec-hd{margin-bottom:40px}
    .lp .pg-hero{padding-top:90px;padding-bottom:48px}
    .lp .lead,.lp .h-sub{font-size:15.5px}
    .lp .h-act{flex-direction:column;align-items:stretch;width:100%}
    .lp .h-act .btn-p,.lp .h-act .btn-o{justify-content:center;width:100%}
    .lp .p-tabs{width:100%}
    .lp .ptab{flex:1;text-align:center;padding:9px 12px;font-size:12px}
    .lp .pc{padding:24px}
    .lp .p-am{font-size:2.6rem}
  }
  @media(max-width:480px){
    .lp .fg{grid-template-columns:1fr}.lp .pay-o{grid-template-columns:1fr 1fr}.lp .wst{min-width:100%}.lp .hl-grid{grid-template-columns:1fr 1fr}
    /* — added: small-phone refinements — */
    .lp .wrap,.lp .nav-wrap,.lp .h-body,.lp .cta-in{padding-left:16px;padding-right:16px}
    .lp .sec{padding:48px 0}
    .lp .sec-hd{margin-bottom:32px}
    .lp .h-body{padding-top:64px;padding-bottom:48px}
    .lp .h1{font-size:clamp(2.4rem,13vw,3.4rem)}
    .lp .pg-h{font-size:clamp(2.1rem,9vw,3rem)}
    .lp .pg-hero{padding-top:80px;padding-bottom:40px}
    .lp .lead,.lp .h-sub,.lp .pg-sub{font-size:14.5px}
    .lp .lpfs{grid-template-columns:repeat(2,1fr)}
    .lp .pc{padding:20px;border-radius:14px}
    .lp .p-am{font-size:2.3rem}
    .lp .ptab{font-size:11px;padding:8px 8px}
    .lp .hl-grid{grid-template-columns:1fr}
    .lp .pay-o{grid-template-columns:1fr}
    .lp .btn-p,.lp .nav-cta{padding:12px 22px}
    .lp .wiz-body{padding:20px 14px}
    .lp .fab-panel{right:12px;left:12px;width:auto;max-width:none}
  }
`

const PAGES = ['home','about','curricula','curriculum-detail','services','service-detail','global','pricing','programs','faq','blog','enroll','login','consult','contact','privacy','terms','cookies','gdpr','article']

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
const CURRICULA = [
  {
    slug: 'igcse',
    badge: 'Cambridge International',
    h: 'IGCSE',
    desc: 'The world\'s most recognised qualification for ages 14–16. Our students consistently achieve above-average pass rates across 40+ subjects with full past paper libraries, marking schemes and mock exams.',
    tags: ['Mathematics', 'Sciences', 'English', 'History', '+35 subjects'],
    meta: ['Year 9–11', 'Globally Recognised', 'CIE'],
    detail: {
      tagline: 'The International General Certificate of Secondary Education',
      ageRange: 'Ages 14–16 · Typically Year 10–11',
      overview: 'The Cambridge IGCSE is the world\'s most popular international qualification for 14 to 16 year olds. Developed by Cambridge Assessment International Education, it is recognised by universities and employers worldwide as evidence of academic ability. The programme is built around clear subject syllabuses, balanced assessment, and a strong emphasis on developing both knowledge and practical skills. At Smartious, IGCSE is delivered by degree-qualified subject specialists with full access to past papers, examiner reports and mark schemes.',
      sections: [
        { h: 'Subjects offered', p: 'Students typically take 6–9 subjects. Core subjects include English (First or Second Language), Mathematics, and the Sciences (Biology, Chemistry, Physics, or Combined Science). A wide range of options follows: Business Studies, Economics, Accounting, Computer Science, ICT, Geography, History, Global Perspectives, and modern languages. Smartious supports more than 40 IGCSE subjects across the CIE and Edexcel boards.' },
        { h: 'How it is assessed', p: 'Most subjects are assessed through written examinations at the end of the two-year programme, with some subjects including coursework or practical components. Grades are awarded from A* down to G. Examinations are sat in the May/June or October/November series at registered exam centres. Smartious prepares students with regular mock examinations marked to official standards.' },
        { h: 'Progression and pathways', p: 'IGCSE is the standard foundation for advanced study. Students typically progress to Cambridge A-Level, the IB Diploma, or equivalent Year 12–13 programmes. Strong IGCSE results are also accepted directly by foundation programmes and some universities for early entry. The qualification is recognised in the UK, across Africa and the Middle East, and by universities in North America.' },
      ],
      whyChoose: 'IGCSE offers an exceptional balance of academic rigour and flexibility. Its global recognition means a student\'s results travel with them anywhere in the world — particularly valuable for internationally mobile families. The subject range allows students to build a profile suited to their strengths and intended degree path.',
    },
  },
  {
    slug: 'a-level',
    badge: 'Cambridge International',
    h: 'Cambridge A-Level',
    desc: 'Accepted by Oxford, Cambridge, Ivy League and universities across Africa and the Middle East. Includes university counselling, UCAS/Common App support and intensive revision programmes.',
    tags: ['Mathematics', 'Further Maths', 'Sciences', 'Economics', '+22 subjects'],
    meta: ['Year 12–13', 'University Entry', 'CIE'],
    detail: {
      tagline: 'The Cambridge International Advanced Level',
      ageRange: 'Ages 16–19 · Typically Year 12–13',
      overview: 'Cambridge A-Level is a two-year advanced qualification taken after IGCSE, designed to prepare students for university study. It is known for its academic depth — students study a small number of subjects in considerable detail, developing the independent thinking and subject mastery that universities look for. A-Level is accepted for entry by leading universities worldwide, including Oxford, Cambridge and Ivy League institutions. Smartious delivers A-Level with specialist teachers and full university-application support.',
      sections: [
        { h: 'Subjects offered', p: 'Students usually take 3–4 subjects. Smartious offers Mathematics, Further Mathematics, Physics, Chemistry, Biology, Economics, Business, Accounting, Computer Science, English, Geography, History and Psychology, among others. The first year (AS Level) can stand alone or build toward the full A-Level in the second year.' },
        { h: 'How it is assessed', p: 'Assessment is primarily by written examination, with practical assessments in the sciences. Grades range from A* to E. The structure allows AS Level results in the first year and full A-Level completion in the second. Smartious runs intensive revision programmes and full mock examinations marked to examiner standard.' },
        { h: 'Progression and pathways', p: 'A-Level is a direct university entry qualification. Smartious includes UCAS support for UK applications and Common Application guidance for the United States, along with counselling on universities across Africa, the Middle East, Canada and Australia. Subject choices are guided by intended degree — for example, Mathematics and Physics for engineering, or Biology and Chemistry for medicine.' },
      ],
      whyChoose: 'A-Level suits students who know their academic strengths and want to study them in depth. Its focused structure and worldwide university recognition make it one of the strongest routes to competitive degree courses. The university-application support built into the Smartious programme means families are guided through every step.',
    },
  },
  {
    slug: 'ib-diploma',
    badge: 'International Baccalaureate',
    h: 'IB Diploma (DP)',
    desc: 'Accepted by 2,000+ universities across 90 countries. Full guidance through all 6 subject groups, Theory of Knowledge, Extended Essay and CAS.',
    tags: ['6 Subject Groups', 'Theory of Knowledge', 'Extended Essay', 'CAS'],
    meta: ['Year 12–13', '2,000+ Universities', 'IBO'],
    detail: {
      tagline: 'The International Baccalaureate Diploma Programme',
      ageRange: 'Ages 16–19 · Typically Year 12–13',
      overview: 'The IB Diploma Programme is a rigorous, balanced two-year course recognised by over 2,000 universities in more than 90 countries. Unlike specialised qualifications, the IB requires breadth — students study six subjects across all major disciplines, alongside three core components that develop critical thinking, research skill and personal growth. It is widely regarded as excellent preparation for university and is highly valued by admissions tutors worldwide.',
      sections: [
        { h: 'Structure — six subject groups', p: 'Students choose one subject from each of six groups: Studies in Language and Literature; Language Acquisition; Individuals and Societies; Sciences; Mathematics; and the Arts (or a second subject from another group). Three subjects are taken at Higher Level and three at Standard Level, giving both depth and breadth.' },
        { h: 'The three core elements', p: 'Beyond the six subjects, every IB student completes Theory of Knowledge (TOK), an enquiry into the nature of knowledge itself; the Extended Essay, an independent 4,000-word research project; and CAS — Creativity, Activity, Service — a programme of personal and community engagement. Smartious supervises all three with dedicated support.' },
        { h: 'Assessment and pathways', p: 'Assessment combines external examinations with internally-assessed coursework. The Diploma is scored out of 45 points. The IB is accepted for direct university entry worldwide and is particularly well regarded by universities in North America and Europe for the breadth and independence it demonstrates.' },
      ],
      whyChoose: 'The IB Diploma suits well-rounded students who do not want to narrow their studies too early and who value independent research and critical thinking. Its global recognition and reputation for academic depth make it a powerful qualification for ambitious students applying to universities internationally.',
    },
  },
  {
    slug: 'ib-pyp-myp',
    badge: 'International Baccalaureate',
    h: 'IB PYP & MYP',
    desc: 'The IB Primary Years (ages 3–12) and Middle Years (ages 11–16) programmes. Inquiry-based education developing critical thinking from early childhood.',
    tags: ['PYP Ages 3–12', 'MYP Ages 11–16', 'Inquiry-Based'],
    meta: ['Ages 3–16', 'Global Framework', 'IBO'],
    detail: {
      tagline: 'IB Primary Years & Middle Years Programmes',
      ageRange: 'Ages 3–16 · From early years through to pre-Diploma',
      overview: 'The Primary Years Programme (PYP) and Middle Years Programme (MYP) form the foundation of the IB continuum, leading toward the IB Diploma. Both are built on inquiry-based learning — students learn by asking questions, investigating, and making connections across subjects rather than memorising in isolation. The approach develops curiosity, independence and conceptual understanding from an early age.',
      sections: [
        { h: 'Primary Years Programme (Ages 3–12)', p: 'The PYP frames learning around transdisciplinary themes — who we are, how the world works, how we organise ourselves — so children explore literacy, numeracy, science and social studies as connected ideas. It emphasises the development of the whole child: academic, social and emotional.' },
        { h: 'Middle Years Programme (Ages 11–16)', p: 'The MYP bridges primary education and the Diploma. Students study eight subject groups while developing the skills of independent learning, and complete a personal project in their final year. The MYP builds the research, organisation and analytical habits the Diploma later demands.' },
        { h: 'Progression', p: 'PYP and MYP lead naturally into the IB Diploma Programme, but the skills they develop — inquiry, communication, self-management — transfer well to any senior pathway, including IGCSE and A-Level.' },
      ],
      whyChoose: 'PYP and MYP suit families who want a coherent, skills-focused education from the early years onward, and who value curiosity and conceptual understanding over rote learning. They are an ideal foundation for students intending to continue to the IB Diploma.',
    },
  },
  {
    slug: 'edexcel',
    badge: 'Pearson',
    h: 'Pearson Edexcel',
    desc: 'Fully equivalent to the English national standard — flexible, modern and globally portable. Popular with UK-based families and expats. BTEC also available.',
    tags: ['GCSE', 'A-Level', 'BTEC', 'All Core Subjects'],
    meta: ['Year 7–13', 'UK Recognised', 'Pearson'],
    detail: {
      tagline: 'Pearson Edexcel International GCSE & A-Level',
      ageRange: 'Ages 11–19 · Year 7 through to Year 13',
      overview: 'Pearson Edexcel is a major UK examination board offering International GCSE and International A-Level qualifications, alongside vocational BTEC awards. Edexcel qualifications are fully equivalent to the English national standard and are recognised by universities worldwide. The board is known for clear, well-structured syllabuses and a flexible modular assessment model in many subjects.',
      sections: [
        { h: 'Subjects and qualifications', p: 'Smartious offers Edexcel International GCSE and International A-Level across the core subjects — English, Mathematics, the Sciences — and a broad range of options including Business, Economics, Accounting and ICT. BTEC vocational qualifications are also available for students seeking a more applied, coursework-based route.' },
        { h: 'How it is assessed', p: 'Edexcel assessment is by written examination, with some subjects offering modular assessment that allows units to be taken and, where permitted, retaken across exam series. This flexibility can suit students who perform best with assessment spread over time. Grading mirrors the standard GCSE and A-Level scales.' },
        { h: 'Progression and pathways', p: 'Edexcel International GCSE leads to International A-Level or other Year 12–13 programmes. Edexcel A-Levels are accepted for university entry in the UK and internationally. The qualifications are especially popular with UK-connected and expatriate families because they map directly onto the English education system.' },
      ],
      whyChoose: 'Edexcel suits families who want a qualification closely aligned with the English national standard and a flexible assessment structure. For students who may move between Smartious and a UK school, the alignment makes transitions straightforward.',
    },
  },
  {
    slug: 'british-national-curriculum',
    badge: 'England & Wales',
    h: 'British National Curriculum',
    desc: 'Full English National Curriculum from Key Stage 1 through Sixth Form. SATs preparation, GCSE coursework support and A-Level.',
    tags: ['KS1 & KS2', 'KS3 & KS4', 'SATs Prep', 'Sixth Form'],
    meta: ['Ages 5–18', 'UK Standard', 'DfE'],
    detail: {
      tagline: 'The English National Curriculum',
      ageRange: 'Ages 5–18 · Key Stage 1 through Sixth Form',
      overview: 'The British National Curriculum is the framework followed by state schools in England, organised into Key Stages from age 5 to 16, followed by Sixth Form study. It provides a structured, well-sequenced progression through every subject and is familiar to families connected to the UK education system. Smartious delivers the full curriculum from early primary through to A-Level.',
      sections: [
        { h: 'The Key Stages', p: 'Key Stage 1 (ages 5–7) and Key Stage 2 (ages 7–11) cover primary education, ending with national assessments (SATs). Key Stage 3 (ages 11–14) broadens subject study, and Key Stage 4 (ages 14–16) leads to GCSE qualifications. Sixth Form (ages 16–18) covers A-Level study.' },
        { h: 'Assessment milestones', p: 'Progress is marked by clear milestones: SATs at the end of primary, GCSEs at 16, and A-Levels at 18. Smartious prepares students thoroughly for each, with coursework support, past paper practice and mock examinations.' },
        { h: 'Progression and pathways', p: 'The curriculum provides a continuous, well-mapped path from age 5 to university entry. It is ideal for families who want their child\'s education to align precisely with the English school system, whether for a future move to the UK or for consistency with a UK-based education.' },
      ],
      whyChoose: 'The British National Curriculum suits families who want a structured, internationally familiar progression closely matched to the English school system — particularly those who anticipate moving to or from a UK school and value continuity.',
    },
  },
  {
    slug: 'american-curriculum',
    badge: 'United States',
    h: 'American Curriculum',
    desc: 'US Common Core K–12 with Advanced Placement (AP) courses, SAT and ACT preparation, and full Common App college counselling.',
    tags: ['K–12 Common Core', 'AP Courses', 'SAT Prep', 'ACT Prep'],
    meta: ['K–12', 'US College Entry', 'College Board'],
    detail: {
      tagline: 'The American K–12 Curriculum',
      ageRange: 'Ages 5–18 · Kindergarten through Grade 12',
      overview: 'The American Curriculum follows the K–12 structure used across the United States, built around Common Core standards for English and Mathematics and a broad, flexible subject offering. It is distinguished by continuous assessment, a credit-based high school system, and the option of Advanced Placement (AP) courses for college-level study. Smartious delivers the curriculum with full college-application support.',
      sections: [
        { h: 'Structure — the K–12 system', p: 'Education runs from Kindergarten through Grade 12. Elementary and middle school build core skills broadly; high school (Grades 9–12) works on a credit system, where students accumulate credits across required and elective courses toward a high school diploma.' },
        { h: 'Advanced Placement & college testing', p: 'Capable high school students can take Advanced Placement (AP) courses — college-level subjects that can earn university credit. Smartious also prepares students for the SAT and ACT, the standardised tests used in US college admissions.' },
        { h: 'Progression and pathways', p: 'The American Curriculum leads to a high school diploma and is the natural route for students applying to universities in the United States. Smartious provides full Common Application counselling, essay guidance, and support with the transcript and recommendation process that US admissions require.' },
      ],
      whyChoose: 'The American Curriculum suits families aiming for US universities, or who value its continuous-assessment model and the breadth of its credit-based system. The flexibility of electives and AP courses lets students shape a profile around their strengths and college ambitions.',
    },
  },
  {
    slug: 'cbc-kcse',
    badge: 'Republic of Kenya',
    h: 'CBC & KCSE',
    desc: 'Kenya\'s Competency-Based Curriculum (Grades 1–9) and KCSE through Form 6. Taught by Kenyan-certified tutors with full KNEC-aligned marking.',
    tags: ['CBC Grades 1–9', 'Form 1–6', 'KCSE Prep', 'All Subjects'],
    meta: ['Ages 6–18', 'East Africa', 'KICD/KNEC'],
    detail: {
      tagline: 'Kenya\'s Competency-Based Curriculum & KCSE',
      ageRange: 'Ages 6–18 · Grade 1 through senior secondary',
      overview: 'Smartious delivers Kenya\'s national curriculum in full — the Competency-Based Curriculum (CBC) developed by KICD, and preparation for national examinations. The CBC marks a shift from content memorisation toward demonstrated competencies and practical skills. Smartious teaches it with Kenyan-certified tutors and assessment aligned to KNEC standards.',
      sections: [
        { h: 'The Competency-Based Curriculum', p: 'The CBC emphasises competencies — communication, critical thinking, creativity, citizenship and digital literacy — developed through practical, learner-centred activity. It spans early years, primary and junior secondary, with continuous school-based assessment alongside national milestones.' },
        { h: 'Senior secondary & national examinations', p: 'Smartious supports students through senior secondary study and preparation for national examinations, with past paper practice, KNEC-aligned marking and structured revision. Tutors are Kenyan-certified and familiar with the national assessment framework.' },
        { h: 'Progression and pathways', p: 'The curriculum is the standard route into Kenyan universities and colleges, and is well understood across East Africa. It suits families based in Kenya, or those who want their children to remain aligned with the national system while benefiting from the structure and support of the Smartious programme.' },
      ],
      whyChoose: 'CBC & KCSE suits families who want their children educated within Kenya\'s national system — for university entry in Kenya, for consistency with local schools, or for the practical, competency-focused approach the CBC is built around.',
    },
  },
  {
    slug: 'smartious-blended',
    badge: 'Smartious Exclusive',
    h: 'Smartious Blended',
    desc: 'Our signature in-house curriculum — designed in Nairobi over 7 years. Blends IGCSE academic rigour with CBC relevance, plus AI literacy and digital entrepreneurship.',
    tags: ['IGCSE + CBC', 'STEM Focus', 'AI Literacy', 'Digital Skills', 'Global Citizenship'],
    meta: ['All Ages', 'Designed in Nairobi', 'Smartious HQ'],
    gold: true,
    detail: {
      tagline: 'The Smartious Blended Curriculum',
      ageRange: 'All ages · A flexible programme adapted to each learner',
      overview: 'Smartious Blended is our signature curriculum, developed in Nairobi over more than seven years of teaching practice. It combines the academic rigour and global recognition of Cambridge IGCSE with the practical, competency-focused relevance of Kenya\'s CBC — and adds what we believe a modern education needs: AI literacy, digital skills and entrepreneurial thinking. It is designed for families who want the best of an international curriculum without losing local relevance.',
      sections: [
        { h: 'What it blends', p: 'The programme draws IGCSE\'s structured subject rigour and internationally-recognised assessment together with the CBC\'s emphasis on demonstrated competency and practical application. Students gain the academic foundation for global progression while staying grounded in skills that matter locally.' },
        { h: 'Modern skills built in', p: 'Alongside the core academic subjects, Smartious Blended embeds AI literacy — including guided use of our Mshauri AI tutor — digital skills, and an introduction to entrepreneurship and global citizenship. These are taught as integral parts of the curriculum, not optional extras.' },
        { h: 'Flexibility and pathways', p: 'The programme is adapted to each learner\'s age, level and goals. Because it is built on IGCSE foundations, students can transition to formal IGCSE, A-Level or IB pathways when ready, while those who remain gain a distinctive, future-focused education.' },
      ],
      whyChoose: 'Smartious Blended suits families who want a genuinely modern education — internationally rigorous, locally relevant, and built for a world where digital and AI literacy matter. It is the curriculum we designed because we believed something better was possible.',
    },
  },
]

// ════════════════════════════════════════════════════════════
// SERVICE DETAIL CONTENT
// Full detail for each service-delivery model. Drafted from the
// existing service cards — Alfred to review and edit wording.
// Each entry: slug, h (name), svg icon, desc (card teaser), tags,
// seoTitle, seoDesc, and a `detail` block.
// ════════════════════════════════════════════════════════════
const SERVICES = [
  {
    slug: 'homeschool-at-home',
    h: 'Homeschool at Home',
    svg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    desc: 'A qualified tutor visits your home (Nairobi) or connects via video. Structured, accredited curriculum in your own environment. Weekly lesson planning, monthly reports, parent portal. All curricula available.',
    tags: ['1-on-1 Tutor', 'Flexible Schedule', 'All Curricula', 'Written Reports'],
    seoTitle: 'Homeschooling in Nairobi, Kenya | Qualified Home Tutors — Smartious',
    seoDesc: 'Smartious provides structured homeschooling in Nairobi and online — qualified tutors, Cambridge IGCSE, A-Level, IB and CBC curricula, weekly reports and a full parent portal.',
    detail: {
      tagline: 'Accredited home education, delivered by a dedicated tutor',
      summary: 'One-on-one schooling at home — a tutor visits in Nairobi, or teaches live by video anywhere.',
      overview: 'Homeschool at Home is the Smartious flagship service: a complete, accredited education delivered one-on-one in the comfort of your own home. A qualified subject teacher either visits your home in Nairobi or connects through live video, following a structured curriculum with proper lesson planning, assessment and reporting. It gives families the flexibility of home education without sacrificing academic rigour or accreditation.',
      sections: [
        { h: 'How it works', p: 'After enrolment and a placement assessment, your child is matched with a dedicated tutor for each subject. Lessons follow a weekly timetable agreed with your family. Tutors plan every lesson, set and mark work, and submit written lesson reports. A parent portal keeps you informed of progress, attendance and upcoming assessments.' },
        { h: 'Curricula available', p: 'Every curriculum Smartious offers is available through this service — Cambridge IGCSE and A-Level, the IB Diploma, Pearson Edexcel, the British National Curriculum, the American Curriculum, Kenya\'s CBC, and the Smartious Blended programme. Your child\'s pathway is built around their age, ability and goals.' },
        { h: 'Who it suits', p: 'Home education suits families who want a tailored, distraction-free learning environment, children who benefit from individual attention, and households with schedules that a conventional school cannot accommodate — including travelling and diaspora families.' },
      ],
      whySmartious: 'Smartious has delivered home education in Nairobi since 2018, building a roster of qualified, vetted subject teachers and a structured system of lesson planning, reporting and parent communication that few independent tutors can match. Families choose Smartious because home learning here is genuinely accredited, properly assessed, and backed by a real school — not informal tutoring.',
    },
  },
  {
    slug: 'learning-centre',
    h: 'Smartious Learning Centre',
    svg: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>',
    desc: 'Our supervised study centre at Diamond Plaza I, Parklands, Nairobi. Professional environment with peer interaction and specialist teachers on-site.',
    tags: ['Parklands Nairobi', 'Supervised', 'Peer Learning', 'Specialist Teachers'],
    seoTitle: 'Homeschool Learning Centre in Parklands, Nairobi — Smartious',
    seoDesc: 'The Smartious Learning Centre at Diamond Plaza I, Parklands, Nairobi — a supervised, professional study environment with specialist teachers and peer learning for homeschooled students.',
    detail: {
      tagline: 'A supervised study centre in the heart of Parklands',
      summary: 'In-centre learning at Diamond Plaza I, Parklands — specialist teachers and a focused, professional environment.',
      overview: 'The Smartious Learning Centre offers homeschooling families a professional, supervised study environment outside the home. Located at Diamond Plaza I in Parklands, Nairobi, the centre brings students together for structured learning with specialist teachers on-site — combining the individual attention of homeschooling with the focus and social interaction of a dedicated learning space.',
      sections: [
        { h: 'The environment', p: 'The centre provides a calm, well-equipped study setting designed for concentration and learning. Students work with specialist teachers across subjects, with supervision throughout the day. It removes the distractions of learning at home while keeping class sizes small and attention personal.' },
        { h: 'Peer interaction', p: 'A key benefit of the centre is structured peer learning. Students interact with others on similar pathways, building the social confidence and collaboration skills that fully isolated home study can lack — without the crowding of a conventional classroom.' },
        { h: 'Who it suits', p: 'The Learning Centre suits Nairobi families who want the structure of homeschooling but prefer their child learn outside the home, students who focus better in a dedicated environment, and parents who value the social dimension of in-person learning.' },
      ],
      whySmartious: 'Few homeschool providers in Nairobi operate a genuine, supervised learning centre with specialist teachers on-site. The Smartious centre at Parklands gives families a real physical home for their child\'s education — a professional middle ground between home tutoring and conventional school that Smartious is uniquely positioned to offer.',
    },
  },
  {
    slug: 'virtual-school',
    h: 'Virtual School (Online)',
    svg: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    desc: '100% online — available worldwide. Live weekly classes, full recorded library, interactive quizzes, mock exams and real-time parent dashboards. Mshauri AI included.',
    tags: ['Global Access', 'Live + Recorded', 'Mshauri AI', 'Parent Dashboard'],
    seoTitle: 'Online School for Diaspora Families | Virtual Homeschooling — Smartious',
    seoDesc: 'Smartious Virtual School — 100% online education for families worldwide. Live classes, recorded lessons, mock exams and the Mshauri AI tutor, with Cambridge, IB and Edexcel curricula.',
    detail: {
      tagline: 'A complete online school, available anywhere in the world',
      summary: '100% online schooling with live classes and recorded lessons — built for diaspora and internationally mobile families.',
      overview: 'Smartious Virtual School is a fully online education, delivered to families wherever they are in the world. It combines live, scheduled classes with a complete library of recorded lessons, interactive practice, regular assessment, and real-time progress dashboards for parents. For African diaspora families in the UK, the UAE, the USA and Canada, it offers a genuine school experience with no geographic limit.',
      sections: [
        { h: 'Live and recorded learning', p: 'Students attend live online classes on a weekly timetable and have unlimited access to a recorded lesson library for revision and catch-up. This blend means learning continues across time zones and around travel — nothing is missed.' },
        { h: 'Assessment and the Mshauri AI tutor', p: 'The Virtual School includes interactive quizzes, regular mock examinations with proper marking, and access to Mshauri, the Smartious AI tutor, for revision support at any hour. Parents follow everything through a real-time dashboard.' },
        { h: 'Who it suits', p: 'Virtual School suits diaspora and expatriate families who want an African-rooted, internationally-accredited education, families who move frequently, and any household, anywhere, that wants a complete online school rather than piecemeal online lessons.' },
      ],
      whySmartious: 'Smartious built its Virtual School specifically for diaspora African families — combining internationally-recognised curricula, live teaching, and the Mshauri AI tutor in one platform. It is not a loose collection of online lessons but a structured, accredited online school, designed and run from Nairobi for families who want exactly that connection.',
    },
  },
  {
    slug: 'private-tuition',
    h: 'Private Tuition',
    svg: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    desc: 'One-on-one expert tuition for any subject, any level, any curriculum — online worldwide or home visits in Nairobi. Tutors bring all materials and submit session notes.',
    tags: ['Any Subject', 'Online or Home Visit', 'Specialist Tutors', 'Session Notes'],
    seoTitle: 'Private Tutors in Nairobi & Online | One-on-One Tuition — Smartious',
    seoDesc: 'Smartious private tuition — one-on-one expert tutors for any subject and curriculum, online worldwide or home visits in Nairobi. IGCSE, A-Level, IB, KCSE and more.',
    detail: {
      tagline: 'Expert one-on-one tuition, in any subject, at any level',
      summary: 'Specialist private tutors — online worldwide or visiting your home in Nairobi.',
      overview: 'Smartious Private Tuition provides focused, one-on-one teaching in any subject, for any level and any curriculum. Whether a student needs to strengthen a weak area, prepare intensively for an examination, or study a subject not offered at their school, a specialist tutor works with them directly — online from anywhere in the world, or in person at home in Nairobi.',
      sections: [
        { h: 'How it works', p: 'Tell us the subject, level and goal, and Smartious matches a specialist tutor. Sessions are booked flexibly around your schedule. Tutors prepare every session, bring or share all materials, and submit a written note after each lesson so parents see exactly what was covered.' },
        { h: 'Subjects and curricula', p: 'Tuition is available across all curricula Smartious supports and every core and optional subject — from primary literacy and numeracy to A-Level Further Mathematics, IB sciences and KCSE preparation. Rates are confirmed at enrolment based on level.' },
        { h: 'Who it suits', p: 'Private tuition suits students who need targeted help in specific subjects, those preparing for important examinations, learners studying a subject independently, and families who want supplementary support alongside school or homeschooling.' },
      ],
      whySmartious: 'Smartious tuition is delivered by vetted, specialist teachers — not generalist tutors — and is backed by the same lesson-planning, materials and written-reporting standards as the full school programmes. Families get the accountability of a real school behind every private session, whether online or at home in Nairobi.',
    },
  },
  {
    slug: 'mshauri-ai',
    h: 'Mshauri AI Tutor',
    svg: '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>',
    desc: 'Mshauri is the Smartious AI tutor — available 24/7 in English and Swahili. Uses the Socratic method: guiding questions, not direct answers. Creates study plans, flashcards, quizzes and lesson summaries.',
    tags: ['24/7 Available', 'English & Swahili', 'Socratic Method', 'Study Tools'],
    seoTitle: 'Mshauri — AI Tutor for Students in English & Swahili | Smartious',
    seoDesc: 'Mshauri is the Smartious AI tutor — available 24/7 in English and Swahili, using guided Socratic questioning to help students revise, with study plans, flashcards and quizzes.',
    detail: {
      tagline: 'A 24/7 AI study companion, in English and Swahili',
      summary: 'The Smartious AI tutor — guided revision support, any hour, in English and Swahili.',
      overview: 'Mshauri is the Smartious AI tutor, available to students at any hour of the day. Rather than simply handing out answers, Mshauri uses the Socratic method — asking guiding questions that lead students to understand a concept themselves. It supports revision, builds study materials, and gives students a patient, always-available learning companion in both English and Swahili.',
      sections: [
        { h: 'How Mshauri teaches', p: 'Mshauri is built to guide, not to shortcut learning. When a student is stuck, it asks questions, offers hints, and works through reasoning step by step — the way a good tutor does. This develops genuine understanding rather than dependence on supplied answers.' },
        { h: 'Study tools', p: 'Beyond answering questions, Mshauri creates personalised study plans, generates flashcards and practice quizzes, and produces clear summaries of lessons and topics — turning revision from a vague task into a structured one.' },
        { h: 'Who it suits', p: 'Mshauri supports every Smartious student as a revision aid between lessons. It is especially valuable for independent learners, students revising for examinations, and anyone who benefits from being able to ask for help at any time, day or night.' },
      ],
      whySmartious: 'Mshauri is not a generic chatbot bolted onto a website — it is a purpose-built tutor, designed around sound teaching method and available bilingually in English and Swahili for the students Smartious serves. It is included with Smartious programmes as part of a genuinely modern, AI-literate education.',
    },
  },
  {
    slug: 'exam-preparation',
    h: 'Exam Preparation',
    svg: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    desc: 'Intensive preparation for IGCSE, Cambridge A-Level, IB, KCSE, SAT, ACT and Edexcel. Full past paper library, official marking schemes, weekly mock exams with expert marking.',
    tags: ['Past Papers', 'Mock Exams', 'Expert Marking', 'All Major Exams'],
    seoTitle: 'IGCSE, A-Level & IB Exam Preparation | Past Papers & Mocks — Smartious',
    seoDesc: 'Smartious exam preparation — intensive coaching for IGCSE, A-Level, IB, KCSE, SAT and ACT, with a full past paper library, official marking schemes and weekly mock exams.',
    detail: {
      tagline: 'Intensive, exam-focused coaching for every major qualification',
      summary: 'Targeted preparation for IGCSE, A-Level, IB, KCSE, SAT and ACT — past papers, mocks and expert marking.',
      overview: 'Smartious Exam Preparation is a focused, intensive service for students approaching major examinations. It concentrates on exam technique, past paper practice and realistic mock examinations — the specific work that turns subject knowledge into strong results. It covers IGCSE, Cambridge A-Level, the IB, Kenya\'s KCSE, and the SAT and ACT.',
      sections: [
        { h: 'How it works', p: 'Preparation centres on practice and feedback. Students work through an extensive past paper library, sit weekly mock examinations under timed conditions, and receive expert marking against official mark schemes — with clear analysis of where marks are won and lost.' },
        { h: 'Exam technique', p: 'Beyond content, the service drills the skills examiners reward: reading questions precisely, structuring answers, managing time, and showing working. Each student\'s weak areas are identified and targeted directly.' },
        { h: 'Who it suits', p: 'Exam Preparation suits students in their final examination year, those resitting to improve a grade, and any learner who knows their subject but wants to sharpen performance under exam conditions.' },
      ],
      whySmartious: 'Smartious exam preparation is built on a deep library of past papers and official marking schemes, and is delivered by teachers who know how each examination is marked. Students are coached not just in their subjects but in the precise craft of the exam — which is what separates a good grade from a great one.',
    },
  },
]

// ── PAGE_META — per-page SEO titles & descriptions ─────────
// Keyword-rich titles and descriptions for each core landing
// page. Curriculum and service detail pages derive their meta
// from CURRICULA / SERVICES. Edit freely to refine targeting.
const SITE = 'Smartious Homeschool & eSchool'
const PAGE_META = {
  home: {
    title: SITE + ' | Online Homeschooling & International Curricula',
    desc: 'Smartious Homeschool & eSchool — accredited online and home-based education in Nairobi and worldwide. Cambridge IGCSE, A-Level, IB Diploma, Edexcel and CBC, taught by qualified specialists.',
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

const FULL_ARTICLES = {
  // GLOBAL (10 articles)
  'online-tutoring-services-2026': {
    cat:'tuition', country:'global',
    img:'linear-gradient(135deg,#0A1020,#1E2F5F)', splash:'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1000&q=70',
    t:'Best Online Tutoring Services for Students (2026)',
    date:'April 2026 · 9 min read',
    author:'Alfred Ouko', role:'Founder & CEO',
    intro:'Online tutoring has moved from pandemic-era stopgap to first-choice learning solution for millions of families worldwide. In 2026 the global online tutoring market is worth over $13 billion. Here is how to identify the services actually worth paying for.',
    sections:[
      {h:'What makes a good online tutoring service in 2026',p:'The best online tutoring services share five traits: verified and background-checked tutors, adaptive learning software that identifies knowledge gaps, recorded sessions parents can review, clear written progress reports, and flat transparent pricing. Services that tick fewer than three of these should be treated with caution.'},
      {h:'One-on-one vs group tutoring',p:'One-on-one tutoring is measurably more effective per hour, with a 2-sigma improvement in outcomes according to the landmark Bloom study. Group tutoring (3–6 students) is 50–60% cheaper and works well for students who learn from peer discussion. For exam preparation the evidence favours one-on-one. For long-term subject reinforcement, small groups work fine.'},
      {h:'Typical costs in 2026',p:'Across the major international markets, online tutoring costs roughly $15–$80 per hour. The low end covers university-student tutors working with primary school children. The middle ($25–$40) is qualified teachers for secondary school. The premium ($50+) covers specialist exam-prep tutors for SAT, IGCSE, A-Level, IB, and competitive university entrance tests.'},
      {h:'Major platforms compared',p:'Global platforms like Preply, Wyzant, Tutorful, and Varsity Tutors run marketplaces where tutors set their own rates. Specialist providers like Smartious run managed services with vetted staff and integrated curriculum. Marketplaces are cheaper but variable; managed services are pricier but predictable.'},
      {h:'Red flags to avoid',p:'Avoid services that require a full term\'s payment upfront, refuse to name the tutor before payment, have only glowing five-star reviews (look for balanced feedback), do not offer a money-back guarantee on the first session, or cannot explain their teaching methodology in one minute.'},
      {h:'How to trial a service properly',p:'Book a single one-hour session with two different services. Give each tutor the same specific problem your child struggles with. Afterwards ask your child three questions: did you understand more than before, did the tutor ask you to explain your reasoning back, would you want another session. That data tells you more than any review.'},
    ],
    faqs:[
      {q:'How many hours of tutoring per week does a struggling student need?',a:'For a student one grade behind in a single subject, budget 2 hours a week for 3 months. For exam preparation in the final year of secondary school, 3 hours a week per subject for 9 months is a realistic baseline.'},
      {q:'Is online tutoring as effective as in-person tutoring?',a:'For students aged 11 and above with normal attention span, the evidence shows online tutoring matches in-person outcomes. For younger children and those with attention challenges, in-person is usually more effective.'},
      {q:'At what age should my child start online tutoring?',a:'Most providers accept students from age 7. Below that, parent-led learning or in-person micro-schools usually work better.'},
    ],
    conclusion:'The online tutoring market is now mature enough that the good services are genuinely transformative and the bad ones are easy to spot. Trial two services side by side before committing. For families wanting a managed, vetted option with integrated curriculum, Smartious offers one-on-one tutoring from $8/hour with recorded sessions and written progress reports.',
  },
  
  'homeschooling-vs-traditional-school': {
    cat:'homeschool', country:'global',
    img:'linear-gradient(135deg,#12061A,#2D0F3D)', splash:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&q=70',
    t:'Homeschooling vs Traditional School: Which Is Better in 2026?',
    date:'April 2026 · 8 min read',
    author:'Dr. Susan Kariuki', role:'Head of Curriculum',
    intro:'Homeschooling enrolment globally has grown 4x since 2019. Traditional school enrolment has stayed flat. But growth does not automatically mean better — here is the honest comparison between homeschooling and traditional school.',
    sections:[
      {h:'Academic outcomes',p:'Meta-analyses of homeschool research consistently show homeschooled students score 15–30 percentile points above their conventionally-schooled peers on standardised tests. However the research is heavily self-selected — homeschooling families are typically more engaged than average. Matched-pair studies narrow the gap to 5–10 percentile points, still favouring homeschoolers.'},
      {h:'Socialisation',p:'The stereotype of isolated homeschooled children does not match modern evidence. A 2020 Cardus Education Survey of 3,000 adults found homeschooled adults participated in civic life, volunteering, and close friendships at higher rates than conventionally-schooled peers. Modern homeschooling includes co-ops, sports clubs, and learning-centre days that deliver a stronger social experience than a 30-child classroom.'},
      {h:'Cost',p:'Homeschooling costs roughly 30–50% of a private international school. Public school is essentially free, so public school remains the cheapest option where it exists at acceptable quality. For families in countries where public education is weak, homeschooling is cheaper than the private alternative.'},
      {h:'Flexibility',p:'Homeschooling adapts to family schedules, travel, and individual learning pace. A child struggling with algebra can spend four weeks on one topic; a child gifted in history can read three university-level texts in a term. Traditional school cannot flex in these ways.'},
      {h:'Discipline and structure',p:'Traditional school wins here. A child who cannot self-motivate will drift in a homeschool environment unless the parent imposes strict routine. The external pressure of classmates, teachers, and bell times matters for some personality types.'},
      {h:'When traditional school wins',p:'If your child thrives on peer competition, if you both work full-time and cannot supervise learning, if your local school is genuinely excellent, or if your child has developmental needs best served by specialist staff, traditional school is the right call. Homeschooling is not morally superior — it is one option among several.'},
    ],
    faqs:[
      {q:'Can a homeschooled child still go to university?',a:'Yes. Homeschooled students apply to universities worldwide every year. Cambridge, Harvard, Oxford, and the University of Nairobi all admit homeschooled applicants when their academic record is properly documented by a registered provider.'},
      {q:'Is homeschooling legal everywhere?',a:'It is legal in most countries. Germany bans it outright. France and Sweden have significant restrictions. The US, UK, Kenya, Nigeria, South Africa, and Australia allow it with varying registration requirements.'},
      {q:'Do homeschooled children miss the "school experience"?',a:'They miss some things (school plays, prom, full-team sports). They gain other things (family closeness, individual pace, no bullying). It is a trade, not a loss.'},
    ],
    conclusion:'Neither option is universally better. Homeschooling produces stronger academic outcomes on average but requires committed parents. Traditional school produces more socially-adapted students on average but offers less flexibility. Pick based on your child\'s temperament and your family\'s capacity — not based on ideology.',
  },
  
  'how-to-choose-online-tutor': {
    cat:'tuition', country:'global',
    img:'linear-gradient(135deg,#0F1A10,#1F3D22)', splash:'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1000&q=70',
    t:'How to Choose the Right Online Tutor for Your Child',
    date:'April 2026 · 7 min read',
    author:'Mercy Akinyi', role:'Academic Coordinator',
    intro:'Parents often pick tutors based on price or university prestige. Neither predicts teaching quality. Here is the evidence-based way to choose an online tutor.',
    sections:[
      {h:'Start with the subject match, not the prestige',p:'A tutor who studied at Harvard but teaches seven subjects is less effective than a tutor who studied at a regional university but specialises in the one subject your child needs. Specialists beat generalists. Always.'},
      {h:'Qualification standards worth insisting on',p:'Insist on: (1) at minimum a Bachelor\'s degree in the subject or in education, (2) at least 18 months of documented teaching experience at your child\'s level, (3) specific familiarity with your child\'s exam board (Cambridge, Edexcel, AP, WAEC, IGCSE, IB, CBC — they differ more than parents realise).'},
      {h:'The trial session matters more than the CV',p:'Book a single paid one-hour trial. Watch (or listen). Does the tutor ask your child questions or just lecture? Does the tutor correct mistakes gently or make your child feel stupid? Does your child emerge from the session wanting another one? A tutor who fails any of these tests will not improve.'},
      {h:'Red flags that surface in week 2–3',p:'Cancellations on short notice, tutor arrives unprepared, tutor cannot answer basic follow-up questions, homework set by the tutor is not marked promptly, tutor speaks dismissively of your child or previous students.'},
      {h:'Match personality to learning style',p:'A high-strung perfectionist child needs a calm tutor. An under-confident child needs a tutor who celebrates small wins. A bored gifted child needs a tutor who can challenge them with problems above their current grade. This matters more than any qualification.'},
      {h:'Review every 8 weeks',p:'Every two months, review concrete metrics: has the homework grade gone up, has the child\'s self-assessment improved, can they now solve problems without help that they could not before. If the answer is no after two sessions of review, change tutors.'},
    ],
    faqs:[
      {q:'How much should I pay for a good online tutor?',a:'Internationally, expect $20–$40 per hour for qualified secondary-school teachers. Premium exam specialists run $50–$80. Prices below $15/hour usually mean university students without teaching experience.'},
      {q:'Should I hire a male or female tutor?',a:'Gender does not predict teaching quality. Match based on personality fit and subject expertise, not gender.'},
      {q:'How long should I commit to one tutor?',a:'Minimum 8 sessions before judging. Maximum 16 sessions without measurable progress before switching.'},
    ],
    conclusion:'Tutor selection is underrated — families spend more time picking a dishwasher. Do the trial session, match personality, review every 8 weeks. For a managed alternative where we do the matching for you, Smartious offers vetted tutors with written progress reports.',
  },
  
  'benefits-online-learning': {
    cat:'ai', country:'global',
    img:'linear-gradient(135deg,#1A0A1E,#3D1E4A)', splash:'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000&q=70',
    t:'Benefits of Online Learning for Modern Students',
    date:'April 2026 · 6 min read',
    author:'Alfred Ouko', role:'Founder & CEO',
    intro:'Online learning is no longer a second-best option. For many students it now outperforms traditional classroom learning. Here are the six evidence-backed benefits.',
    sections:[
      {h:'Self-paced mastery',p:'Online learning lets a struggling student spend extra weeks on a difficult concept and lets an advanced student move ahead. Classroom teaching moves at one speed — the teacher\'s — and optimises for neither group.'},
      {h:'Access to world-class teachers',p:'A student in Gaborone, Lagos, or Nairobi can be taught by a former Cambridge examiner or an Oxford maths graduate over video. Geography no longer restricts teaching talent.'},
      {h:'Recorded sessions for review',p:'Every online lesson can be recorded. The student reviews the difficult section three times before the exam. In a classroom, the moment passes and is gone.'},
      {h:'Smaller effective class sizes',p:'A good online class has 4–8 students. A typical Nairobi or Lagos secondary school has 40–60. The teacher\'s attention per child is 6–10x higher online.'},
      {h:'AI-assisted learning',p:'Modern online learning integrates AI tutors that identify weak topics from quiz performance, generate targeted practice questions, and flag when a student needs human intervention. Smartious\'s Mshauri AI is built specifically for African exam boards.'},
      {h:'No commute, safer environment',p:'Online learners gain 30–60 minutes a day previously lost to commuting. They also avoid bullying, peer pressure, and the mental health issues that affect a significant minority of school-based learners.'},
    ],
    faqs:[
      {q:'Does online learning cause screen-time issues?',a:'Structured online learning with breaks every 45 minutes does not cause the same screen-time concerns as unsupervised entertainment use. The content and structure matter more than raw hours.'},
      {q:'Can young children learn effectively online?',a:'Children under 8 need a mix of online and hands-on learning. Pure online works from roughly age 10 upwards for most children.'},
      {q:'What about the social side?',a:'Good online programmes pair live classes with in-person co-op days. Pure online without any social layer is not recommended for any age group.'},
    ],
    conclusion:'Online learning is the default option for a growing share of families. The question is not whether to adopt it, but how to combine it with appropriate social structure for your child\'s age.',
  },
  
  'parents-support-learning-home': {
    cat:'homeschool', country:'global',
    img:'linear-gradient(135deg,#1A140A,#3D2F1A)', splash:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&q=70',
    t:'How Parents Can Support Learning at Home',
    date:'March 2026 · 8 min read',
    author:'Jane Wanjiku', role:'Admissions Director',
    intro:'You do not need to be a qualified teacher to be a powerful learning partner for your child. Here are seven habits that research shows consistently produce better academic outcomes.',
    sections:[
      {h:'Build a consistent routine',p:'Children thrive on predictability. Same wake-up time, same homework slot, same family dinner. The habit does more than any specific technique.'},
      {h:'Create a dedicated study space',p:'One desk, good lighting, no TV, phones out of the room during study hours. The physical space signals focus. A bedroom bed is a terrible study location for any child.'},
      {h:'Ask process questions, not answer questions',p:'Instead of "did you finish your homework", ask "what was the hardest question and how did you approach it". The second question forces reflection and builds metacognition.'},
      {h:'Read aloud until at least age 10',p:'Reading with a child — even when they can read independently — is one of the most predictive parental behaviours for long-term academic success. It also grows vocabulary far faster than silent reading at their level.'},
      {h:'Praise effort, not talent',p:'Carol Dweck\'s decades of research show that children praised for effort ("you worked really hard on that") develop growth mindsets. Children praised for being clever develop fear of failure. This is the single most important language shift.'},
      {h:'Model learning yourself',p:'Children copy what parents do more than what parents say. A parent who reads books is more likely to raise a reader. A parent who takes online courses is more likely to raise curious learners.'},
      {h:'Stay in dialogue with the teacher',p:'Weekly or fortnightly check-ins with a class teacher surface small issues before they become big ones. Most academic problems become visible 6–8 weeks before the report card.'},
    ],
    faqs:[
      {q:'How much time should I spend on homework support daily?',a:'For primary age, 20–30 minutes of active presence. For secondary, 10–15 minutes of check-in per day. More than this risks taking over the learning.'},
      {q:'What if I do not understand the subject myself?',a:'Say so honestly. "I do not know this, let us figure it out together" models learning behaviour. Never fake competence.'},
      {q:'When should I bring in a tutor?',a:'When you notice the same topic frustrating your child for more than two weeks, or when report-card grades drop by a full letter in a single term.'},
    ],
    conclusion:'Parental engagement explains more of the variance in academic outcomes than family income, school quality, or teacher experience. You already have the biggest lever — you just need to use it consistently.',
  },
  
  'igcse-vs-cbc-vs-american': {
    cat:'igcse', country:'global',
    img:'linear-gradient(135deg,#141A0A,#2F3D1A)', splash:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&q=70',
    t:'IGCSE vs CBC vs American Curriculum: Full 2026 Comparison',
    date:'March 2026 · 10 min read',
    author:'Dr. David Maina', role:'IGCSE Specialist',
    intro:'Three major curricula dominate international homeschooling: Cambridge IGCSE, Kenya\'s CBC, and the American Curriculum. Each has different assessment philosophies, university pathways, and costs. Here is the honest comparison.',
    sections:[
      {h:'IGCSE — Cambridge-based international standard',p:'IGCSE is a 2-year programme at ages 14–16, assessed almost entirely through end-of-course exams. Recognised by every major university globally. Rigorous, exam-focused, academic-heavy. Requires 7–10 subjects for a strong transcript.'},
      {h:'CBC — Kenya\'s Competency-Based Curriculum',p:'CBC is a 12-year pathway from Grade 1 to KCSE at Grade 12. Assessed through continuous work, projects, and national exams at Grade 6, 9, and 12. Emphasises seven core competencies including creativity and digital literacy. Strong in East Africa; less recognised globally.'},
      {h:'American Curriculum — flexible, broad, GPA-based',p:'American curriculum spans Grades K–12 with high school (9–12) producing a GPA and SAT/ACT scores for university. Broader than IGCSE in subject range, more flexible in pacing, but less internationally uniform in rigour. Recognised everywhere, though US universities favour US applicants.'},
      {h:'University recognition compared',p:'IGCSE grades are accepted by every major university on the planet. US universities accept all three but heavily prefer American curriculum + SAT from their domestic market. UK universities strongly prefer IGCSE + A-Level. CBC is the default for Kenyan universities; for international routes, CBC students typically add a foundation year.'},
      {h:'Workload comparison',p:'IGCSE = highest exam pressure, lowest coursework volume. CBC = moderate exam pressure, high project workload. American = lowest single-exam pressure, high continuous-assessment volume spread across 4 years of high school.'},
      {h:'Cost comparison for homeschoolers',p:'CBC homeschooling is cheapest — roughly $300–600/month. IGCSE sits in the middle at $450–750/month. American curriculum homeschooling is pricier at $500–900/month because most licensed American homeschool programmes (K12, Connections Academy) include teacher support and accreditation fees.'},
    ],
    faqs:[
      {q:'Which curriculum is easiest?',a:'None. Each is rigorous at full depth. American curriculum looks easier because assessment is distributed; IGCSE looks easier because there is less coursework; CBC looks easier because projects feel softer than exams. Taught properly, all three produce strong students.'},
      {q:'Can I switch between them?',a:'Yes, but disruption compounds. Switch once if needed, ideally before Grade 8. Repeated switching is very harmful.'},
      {q:'Which gives the best university outcomes?',a:'IGCSE followed by A-Level or IB, for UK and global universities. For US universities, US curriculum + strong SAT works equally well.'},
    ],
    conclusion:'Pick based on where your family\'s future is, not on curriculum prestige. IGCSE for international ambitions, CBC for East African rootedness, American for US-bound families. Commit once and let your child build mastery.',
  },
  
  'homeschool-mistakes': {
    cat:'homeschool', country:'global',
    img:'linear-gradient(135deg,#1E0A0A,#4A1515)', splash:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&q=70',
    t:'Top 7 Mistakes Parents Make in Homeschooling (Avoid These)',
    date:'March 2026 · 7 min read',
    author:'Jane Wanjiku', role:'Admissions Director',
    intro:'After six years advising over 2,000 homeschool families, we see the same mistakes repeat. Here are the seven most common — and how to avoid them.',
    sections:[
      {h:'Mistake 1: Recreating school at home',p:'New homeschool parents often set up a mini-classroom with strict 8am–3pm hours and 40-minute lesson blocks. This imports the weaknesses of traditional school while losing its strengths. Good homeschools run 9am–1pm with two subjects per day, one hour each, plus project work. Less time, more depth.'},
      {h:'Mistake 2: Trying to teach every subject yourself',p:'No single parent is a qualified maths, physics, English, and history teacher. Hire subject specialists (tutors or a provider) for secondary school subjects. You focus on the learning environment and routine; they focus on content mastery.'},
      {h:'Mistake 3: Skipping social structure',p:'Homeschooling without a deliberate social layer produces isolated children. Join a co-op, attend a weekly learning-centre day, enrol in sports or music outside the home. This is non-negotiable.'},
      {h:'Mistake 4: Switching curricula repeatedly',p:'Parents try Cambridge, drop to CBC, switch to American, consider IB. Each switch wastes 3–6 months in adjustment. Pick one curriculum before starting, commit for at least 2 years, review only at major transition points (end of primary, end of Grade 9).'},
      {h:'Mistake 5: No external accountability',p:'Homeschools without external assessment drift. Book termly mock exams, pay a provider for quarterly reports, or register for regional testing. External eyes catch weaknesses parents cannot see.'},
      {h:'Mistake 6: Not documenting properly',p:'Universities require transcripts, references, and predicted grades. Parents who do not keep records from Grade 8 onwards struggle to produce these at Grade 12. Use an enrolled provider or keep rigorous records yourself.'},
      {h:'Mistake 7: Giving in during the hard weeks',p:'Every homeschool family has a 2–3 week period in the second or third month when the novelty wears off and it feels like disaster. This is normal. Push through with routine; do not abandon the plan.'},
    ],
    faqs:[
      {q:'What if my child refuses to do the work?',a:'This is a motivation and boundary problem, not a homeschool problem. It would happen in school too, just with different adults. Address the root cause: unclear expectations, untreated anxiety, or learned helplessness.'},
      {q:'How do I know if my child is falling behind?',a:'Termly standardised tests or mock exams against grade-level benchmarks. Do not guess.'},
      {q:'Can I fix a bad homeschool start?',a:'Yes. Most course corrections happen in the second or third year. Children are resilient. Start fresh with better structure.'},
    ],
    conclusion:'Homeschool mistakes are forgivable and fixable. The unforgivable error is to make the same mistake for two years in a row. Review your setup honestly every 8 weeks and adjust.',
  },
  
  'improve-grades-fast-home': {
    cat:'tuition', country:'global',
    img:'linear-gradient(135deg,#14120A,#3D3A1A)', splash:'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1000&q=70',
    t:'How to Improve Your Child\'s Grades Fast at Home',
    date:'March 2026 · 7 min read',
    author:'Mercy Akinyi', role:'Academic Coordinator',
    intro:'When report cards come back disappointing, parents want concrete actions they can take before the next assessment. Here is a 12-week framework that works across subjects and age groups.',
    sections:[
      {h:'Weeks 1–2: Diagnose before prescribing',p:'Have the child attempt last year\'s end-of-year paper cold. Mark it brutally. This tells you: which topics are weak, which are fine, and whether the problem is knowledge (content gaps) or skill (exam technique). Most parents skip this step and waste months on the wrong fix.'},
      {h:'Weeks 3–4: Fix the foundations',p:'If a Year 9 student fails a Year 9 quiz, the actual gap is usually in Year 7 content. Rebuild from there. Khan Academy, BBC Bitesize, and our own Mshauri AI can diagnose exactly where the foundation cracks.'},
      {h:'Weeks 5–8: Daily practice, ruthlessly focused',p:'45 minutes per day on the single weakest topic. Not "maths in general" — "quadratic equations specifically". Daily beats twice-weekly.'},
      {h:'Weeks 9–10: Past papers under exam conditions',p:'Three past papers at the target exam\'s time limit. Mark against the official scheme. The first will be painful; the third will feel manageable.'},
      {h:'Weeks 11–12: Final review and confidence',p:'Review every past-paper mistake. Identify the 3 recurring weak areas. Drill those. Sleep well. Eat well. Walk in before the exam.'},
      {h:'What does not work',p:'Re-reading notes (passive, low retention). Highlighting (feels productive, adds nothing). Last-minute cramming (raises stress, lowers recall). Long sessions without breaks (concentration collapses after 50 minutes).'},
    ],
    faqs:[
      {q:'Can a student really improve a full grade in 12 weeks?',a:'Yes, regularly. Most grade weaknesses are topic-specific, not ability-wide. A targeted 12-week fix can lift a C to a B or a B to an A.'},
      {q:'What if the school is the problem?',a:'A tutor for 2 hours a week plus the 45 minutes of daily practice can override poor school teaching for a single subject.'},
      {q:'When should I bring in professional help?',a:'If weeks 1–2 diagnosis reveals multiple foundation gaps spanning 2+ years, a tutor will cover that ground faster than a parent.'},
    ],
    conclusion:'Grades are lagging indicators of study habits. Fix the habits in 12 weeks and the grades follow automatically.',
  },
  
  'future-education-online-physical': {
    cat:'ai', country:'global',
    img:'linear-gradient(135deg,#0A1A1A,#1A3A3A)', splash:'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000&q=70',
    t:'The Future of Education: Online vs Physical Schools',
    date:'February 2026 · 9 min read',
    author:'Alfred Ouko', role:'Founder & CEO',
    intro:'Will physical schools still exist in 2050? Almost certainly, but fewer of them and with different roles. Here is how education is likely to evolve over the next 25 years based on trends already visible today.',
    sections:[
      {h:'What is already happening',p:'Online enrolment has grown from 3% of school-age children globally in 2015 to roughly 18% in 2026. AI tutors like Mshauri, Khan Academy\'s Khanmigo, and Google\'s LearnLM are now measurably as effective as a median human teacher on basic instruction. Hybrid learning centres — half online, half in-person — are the fastest-growing segment.'},
      {h:'Role of AI',p:'AI will handle content delivery, assessment, and basic feedback. This does not replace teachers — it elevates them. Teachers shift from lecturers to mentors, specialists who intervene where AI cannot, and curators of what is worth learning in the first place.'},
      {h:'What physical schools still offer',p:'Daily social interaction, physical sports and arts, structured supervised time for working parents, and specialist equipment for practical sciences. These do not scale online, so physical schools retain a role — just smaller and more specialised.'},
      {h:'The hybrid model',p:'By 2030 the dominant model for families who can choose will be: online learning for academic content (with AI + remote human tutors), 2–3 days a week at a neighbourhood learning centre for social and practical work, and home-based parent involvement for routine and values. This blends the best of three environments.'},
      {h:'The winners and losers',p:'Winners: families with choice, capable self-motivated students, and countries with good internet. Losers: students dependent on school structure for motivation, countries without digital infrastructure, and the middle layer of mass-production teaching (which AI replaces). The top and bottom of the profession expand; the middle hollows.'},
      {h:'Implications for parents today',p:'If your child is currently 5–15, they will graduate into a workforce that values self-directed learning, AI literacy, and real-world creativity far more than rote knowledge. Optimise education for those capacities. Traditional school alone will not do it.'},
    ],
    faqs:[
      {q:'Will schools as we know them disappear?',a:'No. Physical schools will shrink and specialise. The large 2,000-student secondary school will give way to smaller learning centres of 100–300 students with more intensive human contact.'},
      {q:'Should I pull my child out of school now?',a:'Only if the specific school is poor, not because of this long-term trend. Individual decisions should be driven by your child\'s current situation.'},
      {q:'What skills should I prioritise?',a:'Literacy (still #1), numeracy, the ability to learn independently, and comfort with digital tools. Everything else follows from these four.'},
    ],
    conclusion:'Education is shifting from time-in-classroom to mastery-demonstrated, from teacher-led to learner-led, from one-size-fits-all to personalised. Families who recognise this trend and adapt will give their children a substantial head start. Smartious is built around exactly this future.',
  },
  
  'grade-fix-fast-guide': {
    cat:'tuition', country:'global',
    img:'linear-gradient(135deg,#1A0A22,#3D1A52)', splash:'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1000&q=70',
    t:'One-on-One Online Tutoring: Is It Worth the Money?',
    date:'February 2026 · 6 min read',
    author:'Dr. David Maina', role:'IGCSE Specialist',
    intro:'One-on-one tutoring is the most expensive per-hour education purchase most families will make. Is it worth it? The honest answer is: it depends on four specific factors.',
    sections:[
      {h:'Factor 1: Is it the right subject?',p:'One-on-one tutoring has its biggest impact on exam-critical subjects where small knowledge gaps compound — maths, physics, chemistry. For humanities where progress is more linear, group tutoring or self-study delivers similar results at lower cost.'},
      {h:'Factor 2: Is the tutor actually specialist?',p:'A non-specialist tutor does not justify the one-on-one premium. You are paying for deep topic knowledge and exam-board familiarity. If the tutor cannot quote recent past-paper trends, you are overpaying.'},
      {h:'Factor 3: Does your child actually need individual attention?',p:'Some children thrive in classes. Some cannot concentrate without individual focus. The second group gets disproportionate value from one-on-one. The first group would learn equally well in a group of four.'},
      {h:'Factor 4: Are you measuring the outcome?',p:'One-on-one pays off only if you track results. Termly benchmarks, mock exam scores, or standardised tests. Without measurement, you cannot tell if the money is working.'},
      {h:'When to start',p:'Not before you have tried good group tutoring first. Not before a professional assessment of your child\'s specific gaps. Not in Grade 10 for an exam in Grade 11 — start with 18 months to run.'},
      {h:'Typical cost vs outcome',p:'Globally, one-on-one exam-prep tutoring costs $30–$80/hour. A well-matched tutor working 2 hours/week for 9 months can lift a student by one full letter grade. At $50/hour × 2 hours × 36 weeks = $3,600 for a grade lift. Whether that is worth it depends on what the grade lift unlocks in university applications.'},
    ],
    faqs:[
      {q:'Is group tutoring a reasonable substitute?',a:'For many subjects and students, yes. Group tutoring at 3–5 students delivers 70–80% of one-on-one outcomes at 30–50% of the price.'},
      {q:'Can I switch between group and one-on-one?',a:'Yes, and many families do: group for weekly curriculum reinforcement, one-on-one for the 8 weeks before major exams.'},
      {q:'At what age does one-on-one stop being worth it?',a:'Above age 17 for self-motivated students, self-study with occasional expert check-ins can be more cost-effective than regular one-on-one sessions.'},
    ],
    conclusion:'One-on-one tutoring is worth it when the subject is exam-critical, the tutor is a genuine specialist, the child needs individual focus, and you measure the result. Remove any one of those four, and you are likely overpaying.',
  },
  
  // USA (5 articles)
  'affordable-homeschooling-usa-2026': {
    cat:'homeschool', country:'usa',
    img:'linear-gradient(135deg,#1A0812,#4A1226)', splash:'https://images.unsplash.com/photo-1569931727762-93b30b4e3bc2?w=1000&q=70',
    t:'Affordable Homeschooling Programs in the USA (2026)',
    date:'April 2026 · 9 min read',
    author:'Alfred Ouko', role:'Founder & CEO',
    intro:'Homeschooling in the USA has grown to over 3.7 million children. The core question for most American families remains: how do we do this affordably without sacrificing quality? Here is a grounded 2026 guide.',
    sections:[
      {h:'The cost spectrum',p:'American homeschooling costs range from under $500/year for self-curated resources to over $15,000/year for all-in-one premium programmes. The median family spends about $1,500–$3,000/year per child including curriculum, materials, and occasional tutoring.'},
      {h:'Free and low-cost curricula',p:'Khan Academy (free), Easy Peasy All-in-One (free, Christian), Ambleside Online (free, Charlotte Mason), and Oak Meadow (low cost, secular). These are genuinely used by tens of thousands of families. Quality is good; parent time commitment is higher.'},
      {h:'Mid-tier accredited programmes',p:'Time4Learning ($20–$30/month), Abeka ($400–$700/year), BJU Press, Sonlight ($500–$900/year). These offer structured curriculum with teacher support. Grades are documented and transferable.'},
      {h:'Online public school options (free)',p:'K12 Inc, Connections Academy, Stride, and state-funded virtual charter schools offer tuition-free online public schooling in most US states. Fully accredited, state-standard curriculum, teacher supervision. The catch: less flexibility than traditional homeschooling, and scheduling constraints.'},
      {h:'Co-ops and hybrid schools',p:'Homeschool co-ops (typically $100–$400 per semester) provide 1–2 days/week of group classes. Classical Conversations is the largest nationally. Costs add up but the social and specialist-teacher benefits are real.'},
      {h:'Tutoring top-ups',p:'For subjects parents cannot teach, online tutoring runs $15–$60/hour. Smartious offers international-standard tutoring at $8–$12/hour, which is unusually competitive for US families.'},
    ],
    faqs:[
      {q:'Is homeschooling legal in all 50 states?',a:'Yes, though requirements vary. Some states require annual notifications and testing; others have no registration.'},
      {q:'Do I need a teaching license?',a:'No. Only a handful of states require parental qualifications, and "high school diploma or GED" is the typical standard.'},
      {q:'Can homeschooled children still play sports and join clubs?',a:'Most states\' public schools allow homeschoolers to participate in extracurriculars under "Tim Tebow laws". Check your state.'},
    ],
    conclusion:'Affordable US homeschooling is absolutely achievable in 2026. The sweet spot for most families is a free or low-cost core curriculum plus targeted tutoring for subjects where the parent is not strong. Total annual cost: $1,500–$4,000 per child with excellent outcomes.',
  },
  
  'online-tutors-usa-math-science': {
    cat:'tuition', country:'usa',
    img:'linear-gradient(135deg,#0A1230,#1B2A6B)', splash:'https://images.unsplash.com/photo-1569931727762-93b30b4e3bc2?w=1000&q=70',
    t:'Best Online Tutors in the USA for Math and Science (2026)',
    date:'April 2026 · 8 min read',
    author:'Dr. David Maina', role:'STEM Specialist',
    intro:'US families spend over $7 billion annually on private tutoring, and math and science dominate that demand. Here is how to find the right online tutor in 2026.',
    sections:[
      {h:'What "best" actually means',p:'The best online math tutor is not the one with the most prestigious university. It is the one who matches your child\'s level, diagnoses gaps in the first 30 minutes, and builds measurable progress week over week. Prestige correlates weakly with teaching skill.'},
      {h:'Major platforms — honest review',p:'Wyzant: large marketplace, variable quality, filter by verified reviews. Varsity Tutors: managed, $40–$90/hour. Preply: international, $15–$50/hour. Khan Academy + private tutor: free content reinforced by affordable one-on-one. Smartious: $8–$12/hour for international-standard tutors, competitive for US families.'},
      {h:'For AP Calculus, SAT Math, and ACT',p:'You want a tutor with: specific AP/SAT examiner training, at least 3 years teaching the exact test, access to current (within 2 years) official practice tests. Below those criteria, avoid.'},
      {h:'For chemistry and physics',p:'Laboratory reasoning is harder to teach online. Look for tutors with access to virtual-lab software (PhET, Labster) and the ability to annotate diagrams in real-time. A whiteboard-only session for physics is inadequate.'},
      {h:'For elementary math',p:'Below Grade 5, in-person or parent-led learning usually beats online one-on-one. Tutoring at this age works best when it targets a specific mastery gap with a definite endpoint.'},
      {h:'Realistic costs and hours',p:'For AP-level STEM support, budget 2 hours/week × 10 weeks at $40–$60/hour = $800–$1,200 per course. For SAT Math prep, 3 hours/week × 12 weeks = $1,400–$2,200. Less than this and the outcome is uncertain.'},
    ],
    faqs:[
      {q:'Is a local tutor better than an online one?',a:'For elementary children yes; for Grade 6 and above online is usually equal or better and gives access to specialists that your town may not have.'},
      {q:'How do I verify credentials?',a:'Ask for a college transcript, ask for 2 parent references with phone numbers, and do a 30-minute paid trial before committing.'},
      {q:'What about tutoring bots like ChatGPT?',a:'Useful as a supplement for generating practice questions, not a replacement for human tutoring in STEM. The quality of AI math reasoning is improving but not yet consistent at AP level.'},
    ],
    conclusion:'US families have more tutor options than any other market. The paradox is that choice makes selection harder. Run paid trials with 2–3 tutors before committing for a full term. Measurable progress in the first 4 sessions is your go/no-go signal.',
  },
  
  'legally-homeschool-usa': {
    cat:'homeschool', country:'usa',
    img:'linear-gradient(135deg,#120A1A,#2D1A4A)', splash:'https://images.unsplash.com/photo-1569931727762-93b30b4e3bc2?w=1000&q=70',
    t:'How to Legally Homeschool Your Child in the USA (All 50 States)',
    date:'April 2026 · 10 min read',
    author:'Grace Njeri', role:'Academic Counsellor',
    intro:'Homeschooling is legal in all 50 US states, but the requirements differ dramatically. A family in Texas faces almost no regulation. A family in New York must submit quarterly reports. Here is the state-by-state reality in 2026.',
    sections:[
      {h:'The four regulatory tiers',p:'States fall into four groups: (1) No notice required — Alaska, Connecticut, Idaho, Illinois, Indiana, Iowa, Kentucky, Michigan, Missouri, New Jersey, Oklahoma, Texas. (2) Low regulation — 15+ states requiring only notification. (3) Moderate regulation — notice plus test scores or evaluations. (4) High regulation — New York, Pennsylvania, Vermont, Rhode Island with quarterly reports and portfolio reviews.'},
      {h:'What "withdrawing from public school" actually means',p:'Most states require a formal withdrawal letter. Send it before starting homeschool, not after. The letter should cite your state\'s specific homeschool statute. Keep a copy with delivery confirmation.'},
      {h:'Curriculum requirements',p:'Almost no state mandates a specific curriculum. Most require that you cover "equivalent subjects" to public school — typically English, math, science, social studies, and sometimes physical education and health.'},
      {h:'Record-keeping best practice',p:'Even in no-notice states, keep: attendance log (days of instruction), subject list per term, work samples (especially for Grades 7+), test scores, and reading logs. This matters for college applications even if the state never asks.'},
      {h:'High school transcripts',p:'Starting Grade 9, begin building a formal transcript. Include course titles, grades, credits per course, and extracurriculars. Community college dual-enrolment courses count and strengthen the transcript. Many homeschool mums produce transcripts indistinguishable from brick-and-mortar schools — and colleges are fully comfortable with them.'},
      {h:'When to use an umbrella school',p:'Umbrella schools (accredited private schools that enrol homeschoolers) handle record-keeping and issue official transcripts for you. Useful in high-regulation states and for families planning military or athletic scholarship applications where accreditation helps.'},
    ],
    faqs:[
      {q:'What if I move between states mid-year?',a:'Comply with the new state\'s rules within 30 days. Records from your previous state transfer fine; you just file new notices.'},
      {q:'Can I homeschool if I am a single working parent?',a:'Yes, with creative scheduling. Many single parents use online public school (free, structured) as a practical option.'},
      {q:'What about socialisation concerns from relatives?',a:'Legal homeschooling does not eliminate social contact. Co-ops, sports leagues, and community activities cover the social layer. This is the most overblown concern in homeschooling.'},
    ],
    conclusion:'Homeschooling in the USA in 2026 is more supported than ever, with court decisions, case law, and statutory protections firmly on the side of the family. Know your state\'s rules, keep good records, and do not let bureaucracy delay your start. You can be homeschooling legally within 2 weeks.',
  },
  
  'top-online-homeschool-curriculum-usa': {
    cat:'homeschool', country:'usa',
    img:'linear-gradient(135deg,#0A1208,#1A2A0F)', splash:'https://images.unsplash.com/photo-1569931727762-93b30b4e3bc2?w=1000&q=70',
    t:'Top Online Homeschool Curriculum Options in the USA (2026)',
    date:'March 2026 · 8 min read',
    author:'Jane Wanjiku', role:'Admissions Director',
    intro:'American homeschool families have more curriculum choices than any other country. Here are the programmes that consistently deliver in 2026, sorted by cost and approach.',
    sections:[
      {h:'Free comprehensive options',p:'Easy Peasy All-in-One (Christian): complete K–12 curriculum online. Ambleside Online (secular/Christian, Charlotte Mason): literature-heavy, free. Khan Academy: not a full curriculum but excellent supplement. Library of Congress resources: free primary source materials for history.'},
      {h:'Budget tier ($200–$500/year)',p:'Time4Learning ($20–$30/month): multimedia, adaptive, self-paced. Discovery K12: free plus paid add-ons. Oak Meadow (Waldorf): $350–$500 per grade. These balance structure with affordability.'},
      {h:'Mid-tier ($500–$1,500/year)',p:'Sonlight: literature-rich, Christian. Abeka: traditional Christian. BJU Press: rigorous traditional. Winter Promise: eclectic. These are popular, well-supported, and have large user communities to troubleshoot with.'},
      {h:'Premium accredited ($1,500–$3,500/year)',p:'Bridgeway Academy, Oak Meadow accredited, Monarch (Alpha Omega), Power Homeschool. These offer accredited transcripts, teacher support, and record-keeping — worth the price if you want minimal administrative overhead.'},
      {h:'Online public school (free)',p:'Stride K12, Connections Academy, state-run virtual academies. Free tuition, state-accredited, teacher-supervised. Feels more like school than homeschool — structured schedule, mandatory attendance.'},
      {h:'Best for specific situations',p:'Large families: Tapestry of Grace, Sonlight (ages combine easily). Tech-forward: Acellus, Time4Learning. Classical: Memoria Press, Classical Conversations. Secular rigour: Oak Meadow, Power Homeschool. Christian rigour: Abeka, BJU.'},
    ],
    faqs:[
      {q:'Can I mix curricula?',a:'Absolutely, and many successful homeschoolers do. Use one for maths, another for language arts, a third for history. Pick the best in each subject rather than a mediocre all-in-one.'},
      {q:'How do I know if a curriculum is working?',a:'Termly assessments, either built into the programme or external standardised tests. If grades are flat or dropping after 6 months, switch.'},
      {q:'Do colleges accept all these curricula?',a:'Yes. Colleges care about transcripts and test scores, not curriculum brand names.'},
    ],
    conclusion:'The US homeschool market is mature and diverse. Do not agonise about picking the "best" — pick a good one, commit for a full school year, and evaluate honestly at the end. Most families find a rhythm by Year 2.',
  },
  
  'balance-work-homeschooling-usa': {
    cat:'homeschool', country:'usa',
    img:'linear-gradient(135deg,#1A0F08,#3D250F)', splash:'https://images.unsplash.com/photo-1569931727762-93b30b4e3bc2?w=1000&q=70',
    t:'How to Balance Work and Homeschooling as a Parent (USA Guide)',
    date:'March 2026 · 7 min read',
    author:'Mercy Akinyi', role:'Academic Coordinator',
    intro:'Most American homeschool parents are not full-time at home. Over 60% work at least part-time. Here is how working parents make homeschooling work without burning out.',
    sections:[
      {h:'Match delivery model to your schedule',p:'Full-time working parents should use online public school (structured, teacher-supervised) or a full homeschool provider. Self-directed curriculum requires parent supervision — do not overcommit.'},
      {h:'The split-day model',p:'Many working parents do formal instruction 7:00–9:30 AM before work or 4:00–6:30 PM after, and use work hours for child self-study (online curriculum, reading, independent projects). Children adapt fast.'},
      {h:'Outsource what you can',p:'Subject tutors for the two hardest subjects, an online provider for the full curriculum, or a co-op for 2 days/week of group classes. Outsourcing is not failure; it is strategy.'},
      {h:'Work from home with older children',p:'Children Grade 6+ can work independently for 2–3 hour blocks while parents take meetings. Set clear expectations: which subject, which pages, which test at the end of the block.'},
      {h:'Childcare swaps with other homeschool families',p:'Formal or informal swaps between homeschool families are common and free. Your child joins their co-op morning; their child joins yours in the afternoon.'},
      {h:'Preserve family life',p:'Do not make every meal a teaching moment or every conversation an assessment. Children need parents who are parents, not permanent teachers. Evenings and weekends should be family time, not catch-up academic time.'},
    ],
    faqs:[
      {q:'Can both parents work full-time and homeschool?',a:'It requires heavy outsourcing (online school + tutors + co-op) but yes. Several thousand US families do exactly this in 2026.'},
      {q:'What about single working parents?',a:'Online public school is the most viable option: free, structured, teacher-supervised, no parent preparation time needed.'},
      {q:'How many hours of actual parent time does homeschooling need?',a:'With good outsourcing, 1–2 hours per day of active parent engagement suffices. Without outsourcing, plan on 4–5 hours daily at primary age.'},
    ],
    conclusion:'Working parents successfully homeschool in large numbers by building the right support stack. The error is trying to be both a full-time professional and a full-time teacher. Outsource, structure, protect evenings, and review monthly.',
  },
  
  // UAE (5 articles)
  'homeschooling-dubai-expats-2026': {
    cat:'homeschool', country:'uae',
    img:'linear-gradient(135deg,#0A1220,#1B2B52)', splash:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&q=70',
    t:'Homeschooling in Dubai: Complete Guide for Expats (2026)',
    date:'April 2026 · 10 min read',
    author:'Jane Wanjiku', role:'Admissions Director',
    intro:'Dubai has the highest concentration of expats in the world, and homeschooling is growing fast among them. The UAE\'s official education regulator KHDA formally allows homeschooling since 2020. Here is how it works in 2026.',
    sections:[
      {h:'Legal status in the UAE',p:'Homeschooling is legal in the UAE and regulated by KHDA (Knowledge and Human Development Authority) in Dubai, ADEK in Abu Dhabi. Families must register with an approved distance-learning provider or international school with a homeschool arm. Direct unregistered homeschooling is not permitted.'},
      {h:'Why expat families choose homeschooling',p:'Top reasons: relocation flexibility (families can keep continuity during company transfers), personalised pace, avoidance of waiting lists at top international schools, cost savings versus premium schools (KES 200,000+ equivalent/month for top Dubai schools), and curriculum choice beyond what local schools offer.'},
      {h:'Curriculum options in UAE',p:'Most Dubai homeschool families choose British (Cambridge/Edexcel IGCSE/A-Level), American (K–12 online public schools like K12, Connections Academy), or IB Primary Years Programme extended to IB Middle Years. Smartious offers all three online from Kenya with tutors who know the UAE expat context.'},
      {h:'Registration with KHDA',p:'Families must be registered with an approved distance-learning centre that issues KHDA-attested documents. Our Smartious-UAE programme partners with an approved Dubai centre so enrolment paperwork is handled.'},
      {h:'Cost in 2026 Dirham',p:'Dubai homeschool costs run AED 18,000–55,000/year per child (USD $4,900–15,000). Comparable Dubai international schools charge AED 50,000–120,000/year. Homeschool is roughly 30–40% of a top premium school.'},
      {h:'The expat social layer',p:'Dubai has dozens of homeschool co-ops: Homeschoolers of Dubai, Abu Dhabi Homeschool Network, and religion-specific groups. Most meet weekly in parks, community centres, or private homes. Joining at least one is essential for socialisation.'},
    ],
    faqs:[
      {q:'Does my child still need a UAE residence visa?',a:'Yes. Children in the UAE need a residence visa regardless of schooling. Homeschool does not change this.'},
      {q:'Can my homeschooled child sit IGCSE exams in Dubai?',a:'Yes. British Council Dubai and multiple Cambridge-authorised centres administer IGCSE exams year-round.'},
      {q:'What about Arabic language requirements?',a:'UAE policy allows homeschooled children to follow their home curriculum without mandatory Arabic. However if returning to UAE public schools is ever planned, Arabic instruction becomes important.'},
    ],
    conclusion:'Homeschooling in Dubai is legal, well-supported, and increasingly popular among expats in 2026. The regulatory environment is expat-friendly. Pair a quality online curriculum with weekly co-op participation, and your child gets the flexibility of homeschool with the social richness of expat Dubai.',
  },
  
  'british-curriculum-tutors-uae': {
    cat:'tuition', country:'uae',
    img:'linear-gradient(135deg,#120A1A,#2F1B4A)', splash:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&q=70',
    t:'Best British Curriculum Tutors in the UAE (2026)',
    date:'April 2026 · 7 min read',
    author:'Dr. David Maina', role:'IGCSE Specialist',
    intro:'The British curriculum is the single most popular education pathway in the UAE. Roughly 45% of Dubai\'s private school population follows British curriculum. Here is how to find a proper British curriculum tutor in 2026.',
    sections:[
      {h:'Why British curriculum dominates UAE',p:'Three reasons: (1) British expats remain the largest school-age community after Indian; (2) UK university pathway is the most popular post-school destination; (3) IGCSE and A-Level grades are universally accepted globally, which matters for families who may relocate again.'},
      {h:'What makes a qualified British curriculum tutor',p:'UK teacher qualification (QTS ideal, PGCE acceptable), minimum 3 years teaching the specific exam board (Cambridge AQA or Pearson Edexcel), recent CPD in the exam board, and specific IGCSE/A-Level results data with previous students.'},
      {h:'Realistic cost in 2026',p:'In Dubai and Abu Dhabi, qualified British curriculum tutors charge AED 150–350/hour for home visits, AED 100–250/hour for online. International online providers like Smartious offer UK-trained tutors for USD $20–35/hour, significantly less than local rates.'},
      {h:'Subjects most in demand',p:'IGCSE Mathematics, IGCSE Physics, IGCSE Chemistry, A-Level Biology, A-Level Further Mathematics. For competitive UK medical school applications, BMAT and UCAT tutoring in Dubai runs AED 400–700/hour.'},
      {h:'Red flags specific to UAE market',p:'Tutors claiming UK qualifications without showing them, tutors asking for 10+ session packages upfront, tutors with no references from Dubai or Abu Dhabi families, and anyone charging below AED 100/hour (usually unqualified).'},
      {h:'Where to find them',p:'Reputable routes: word-of-mouth from other expat families, the UAE Teachers Network, LinkedIn (vet against QTS register), and managed providers like Smartious. Avoid Dubizzle and unregulated marketplace listings for high-stakes subjects.'},
    ],
    faqs:[
      {q:'Do I need a tutor who lives in UAE?',a:'No. Online tutors based in the UK or Kenya can be equally effective and are often cheaper. Only insist on UAE-based for primary-age children who need in-person support.'},
      {q:'How many hours per week for IGCSE?',a:'For a weak student targeting grade improvement, 2 hours per week per subject. For targeted A* preparation, 3 hours per week for 8 months before the exam.'},
      {q:'Are Indian-trained tutors acceptable for British curriculum?',a:'Only if they have specific British curriculum exam board training. An Indian-educated teacher with only local experience will miss Cambridge-specific exam conventions.'},
    ],
    conclusion:'UAE families are spoilt for choice on British curriculum tutoring but the quality range is wide. Verify credentials rigorously, insist on a paid trial session, and prioritise exam board familiarity over university prestige. The best tutor is the one whose previous students actually got A*.',
  },
  
  'igcse-online-tutors-dubai': {
    cat:'igcse', country:'uae',
    img:'linear-gradient(135deg,#1A0F0A,#3D2214)', splash:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&q=70',
    t:'IGCSE Online Tutors in Dubai: What Parents Should Know',
    date:'March 2026 · 8 min read',
    author:'Dr. David Maina', role:'IGCSE Specialist',
    intro:'IGCSE is the single most-registered exam in Dubai, with over 18,000 students sitting papers each year. Online tutoring for IGCSE in Dubai has grown 4x since 2022. Here is what parents should know in 2026.',
    sections:[
      {h:'Why IGCSE online tutoring works in UAE',p:'Dubai traffic and school schedules make in-person after-school tutoring impractical for many families. Online tutoring gives access to UK-trained specialists without the commute, with session recording so students can review, and with costs 30–50% lower than Dubai in-person rates.'},
      {h:'Best subjects for online IGCSE tutoring',p:'Maths, Physics, Chemistry, Business Studies, Economics, and Computer Science work very well online because the teaching is whiteboard- and diagram-heavy. English Language and English Literature also work well with document-sharing. Practical subjects (Drama, Physical Education) are harder online.'},
      {h:'Picking the right tutor platform',p:'Specialist IGCSE providers (Smartious, Explore Learning, Cambridge Home School) offer tutors specifically trained in IGCSE exam technique. Generic platforms (Preply, Tutorful) have variable quality. Local Dubai tuition centres typically cost 2–3x more than equivalent online specialists.'},
      {h:'Cost analysis in AED',p:'Dubai in-person IGCSE tutoring: AED 180–350/hour. Dubai tuition centres: AED 3,500–6,000/month for group classes. Online specialists from Kenya, UK, or India: AED 75–150/hour. Online platforms like Smartious: USD $8–15/hour (roughly AED 30–55/hour).'},
      {h:'Exam preparation timeline for UAE students',p:'Start structured preparation 18 months before the exam. Year 10 (ages 14–15) focuses on syllabus coverage. Year 11 (ages 15–16) focuses on past papers and exam technique. Top-performing UAE families begin topic-specific tutoring from Year 9.'},
      {h:'Common mistakes Dubai families make',p:'Starting tutoring too late (less than 6 months before the exam). Hiring tutors based on university prestige rather than exam board familiarity. Not checking that the tutor knows the specific board (Cambridge CIE vs Pearson Edexcel — they differ). Over-scheduling across too many subjects at once.'},
    ],
    faqs:[
      {q:'Does Cambridge or Edexcel IGCSE matter more?',a:'For UAE families, Cambridge is more common (about 70% of UAE schools). Tutors should explicitly specialise in one; a generalist working both is usually weaker in each.'},
      {q:'Can online tutoring replace school teaching?',a:'For homeschoolers, yes. For school-based students, online tutoring should complement — not replace — school.'},
      {q:'How much does a full IGCSE preparation cost?',a:'Online specialist tutor for 8 subjects × 2 hours/week × 18 months = roughly USD $5,500–8,000 total. Plus exam fees of USD $150–200 per subject.'},
    ],
    conclusion:'Online IGCSE tutoring is the most cost-effective and flexible path for Dubai families in 2026. Start 18 months before the exam, pick specialist tutors who know the specific exam board, and use session recordings for review. Smartious\'s IGCSE tutors are Cambridge- and Edexcel-trained and start at USD $8/hour.',
  },
  
  'private-tutoring-dubai-cost': {
    cat:'tuition', country:'uae',
    img:'linear-gradient(135deg,#120820,#2B135A)', splash:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&q=70',
    t:'Cost of Private Tutoring in Dubai (2026 Guide)',
    date:'March 2026 · 7 min read',
    author:'Grace Njeri', role:'University Counsellor',
    intro:'Private tutoring in Dubai is among the most expensive in the world. Understanding why, and where smart families find better value, saves thousands of dirhams per year.',
    sections:[
      {h:'Why Dubai tutoring is expensive',p:'Three structural reasons: (1) high expatriate tutor costs — qualified UK or US-trained teachers command premium rates; (2) Dubai commercial rental costs for tuition centres are among the highest globally; (3) high demand with 85% of Emirati and 60% of expat families using private tutoring increases pricing power.'},
      {h:'2026 price ranges by tier',p:'Entry tier (undergraduate tutors): AED 80–150/hour. Mid tier (qualified teachers, 2+ years): AED 200–300/hour. Premium tier (senior examiners, PhD tutors): AED 400–700/hour. For university prep (SAT, UCAT, BMAT) premium tutors go AED 500–900/hour.'},
      {h:'Tuition centre pricing',p:'Dubai tuition centres charge by package, typically AED 350–600/hour equivalent for group classes of 4–8 students. Monthly packages of 2 sessions per week for one subject run AED 2,500–5,000.'},
      {h:'Online alternative pricing',p:'Online tutoring breaks the Dubai pricing model. UK-based online tutors: AED 150–350/hour. International online platforms (Smartious, Explore Learning): AED 30–100/hour. Same qualifications, 60–80% cheaper.'},
      {h:'What is worth premium pricing',p:'University entrance exam prep (SAT, ACT, UCAT, BMAT) often justifies premium tutors because the ROI is high — a single test score point can change university admission outcomes. A-Level preparation for competitive subjects (medicine, Oxbridge) similarly justifies premium. Everyday IGCSE support usually does not.'},
      {h:'How families overspend in Dubai',p:'Signing 6-month packages upfront (removes negotiation leverage). Paying for tutors in areas where online would work (most subjects). Hiring too many tutors in parallel (dilutes attention). Not checking credentials — Dubai\'s tutor market includes many unverified operators.'},
    ],
    faqs:[
      {q:'Can I negotiate tutor rates in Dubai?',a:'Yes. Termly pre-payment commonly earns 10–15% discount. Multi-subject discounts with the same tutor or agency are standard.'},
      {q:'Do schools recommend specific tutors?',a:'Most Dubai schools prohibit teachers from tutoring their own students for ethical reasons but will recommend external tutors. Ask your school counsellor.'},
      {q:'How do I know if tutoring is actually working?',a:'Track homework grades and mock exam scores monthly. If there is no measurable improvement after 8 sessions, change tutors.'},
    ],
    conclusion:'Dubai tutoring is expensive by global standards in 2026. Smart families use in-person tutoring selectively for genuinely premium needs (university prep) and shift everyday support to high-quality online providers. A 60–70% annual cost reduction without sacrificing quality is achievable.',
  },
  
  'top-learning-platforms-uae': {
    cat:'ai', country:'uae',
    img:'linear-gradient(135deg,#0A1A20,#1B3D52)', splash:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&q=70',
    t:'Top Online Learning Platforms for Students in the UAE (2026)',
    date:'February 2026 · 6 min read',
    author:'Alfred Ouko', role:'Founder & CEO',
    intro:'UAE students have more online learning platform options than any market in the Middle East. Here are the ones actually worth the subscription in 2026.',
    sections:[
      {h:'For curriculum supplement',p:'Khan Academy (free, English/Arabic), IXL ($20/month, strong for Maths drills), Twinkl ($8–15/month, heavy British curriculum materials), BBC Bitesize (free, British curriculum aligned). These complement but do not replace school.'},
      {h:'For exam preparation',p:'ExamSolutions (free, A-Level and IGCSE videos), Save My Exams (£20/year, IGCSE/A-Level past paper library), Physics & Maths Tutor (free, revision notes), SparkNotes (free, English literature). Proven effective for UAE IGCSE students.'},
      {h:'For tutoring / live teaching',p:'Smartious (USD $8–15/hour, live one-on-one), Cambridge Home School (£650/month full curriculum), Explore Learning UK, Third Space Learning for maths. Live beats self-study for most students.'},
      {h:'For AI-assisted learning',p:'Khanmigo (Khan Academy\'s AI tutor), Smartious Mshauri (built for African/Middle East exam boards), ChatGPT for research and essay feedback. AI is now competitive with human tutors for drill practice and homework help.'},
      {h:'For specific Arabic learning',p:'Noon Academy (Saudi-founded, serves UAE students), Alef Education (UAE government-backed for Arabic/Islamic studies). Essential for students in UAE government schools.'},
      {h:'What to avoid',p:'Platforms with unclear payment commitments, ones requiring app sideloading (security risk), free services that push users to paid personal tutor marketplaces without vetting.'},
    ],
    faqs:[
      {q:'Can a UAE student do all learning on these platforms?',a:'For Grade 9 and up with good self-discipline, yes — combined with registered distance learning. For younger children, platforms should supplement school not replace it.'},
      {q:'Do they cover Arabic and Islamic studies?',a:'Only specific UAE-focused platforms (Noon Academy, Alef Education) cover the Arabic and Islamic content required for regulatory compliance.'},
      {q:'How to choose between platforms?',a:'Try free trials of 2–3. Track your child\'s actual engagement over 2 weeks. The platform they use voluntarily is the one to keep.'},
    ],
    conclusion:'UAE students have excellent online learning options in 2026. The winning strategy combines: one self-paced curriculum platform (Khan or IXL) plus one live tutoring source (Smartious or similar) plus one exam-prep library (Save My Exams). Total cost: USD $50–100/month — far less than one week of in-person Dubai tutoring.',
  },
  
  // NIGERIA (5 articles)
  'waec-igcse-tutors-nigeria': {
    cat:'tuition', country:'nigeria',
    img:'linear-gradient(135deg,#0A1A0F,#1F3D22)', splash:'https://images.unsplash.com/photo-1577086664693-894d8405334a?w=1000&q=70',
    t:'Best Online Tutors in Nigeria for WAEC and IGCSE (2026)',
    date:'April 2026 · 9 min read',
    author:'Alfred Ouko', role:'Founder & CEO',
    intro:'Nigerian students sit two major secondary-level exams — WAEC and increasingly IGCSE. Online tutoring has become the most effective preparation method for both. Here is the 2026 landscape.',
    sections:[
      {h:'WAEC vs IGCSE in Nigeria',p:'WAEC (West African Senior School Certificate Examination) is the Nigerian national exam, taken at the end of SS3 (age 17–18). IGCSE is the Cambridge international exam, increasingly chosen by families targeting international universities or private schools. About 1.5 million Nigerians sit WAEC annually; IGCSE numbers have grown from 5,000 in 2015 to over 40,000 in 2026.'},
      {h:'Why online tutoring wins in Nigeria',p:'Fuel costs make commuting expensive, power cuts disrupt in-person schooling, and Lagos traffic swallows 2–4 hours daily. Online tutoring avoids all three while giving access to UK-trained teachers Nigerian families otherwise cannot afford locally.'},
      {h:'Top-rated online tutoring platforms for Nigeria',p:'Smartious (USD $8–12/hour, strong African exam familiarity), Explore Learning, AfricanFarmSchool, Tutoroo, and global platforms like Preply. For competitive university prep, Crimson Education and QWERTY Education focus on Ivy League applications from Nigeria.'},
      {h:'Typical cost in naira',p:'Nigerian in-person tutoring: NGN 3,000–8,000/hour in Lagos and Abuja, NGN 2,000–5,000 in other cities. Online Nigerian tutors: NGN 2,500–6,000/hour. International online (Smartious): NGN 6,500–12,000/hour but with far more qualified tutors per naira.'},
      {h:'Qualifications that matter for Nigerian students',p:'For WAEC: a tutor who has WAEC-specific past paper experience and understands the marking scheme nuances. For IGCSE: a Cambridge-trained tutor with at least 3 years teaching the exam board. Never hire a tutor who lists both WAEC and IGCSE without specialising in one — the exam conventions differ too much.'},
      {h:'Subjects where online tutoring delivers most',p:'WAEC Mathematics (NGN 12,000/hour in-person can be replaced by NGN 3,000/hour online without quality loss). WAEC Further Mathematics. WAEC English Language essay writing. IGCSE across the board. Chemistry and Physics with specialist online tutors often outperform Nigerian in-person teaching.'},
    ],
    faqs:[
      {q:'Is online tutoring viable given Nigerian internet?',a:'Yes. A 3 Mbps connection is enough for one-on-one video tutoring. Power backup (inverter or small generator) solves outages. Most Lagos and Abuja areas now have reliable fibre.'},
      {q:'Does WAEC recognise online tutoring?',a:'WAEC does not accredit tutors at all. The exam is the same regardless of preparation method. Online tutoring is as valid as in-person.'},
      {q:'How many hours per week for WAEC success?',a:'For students targeting A1–B2 in 8 subjects, budget 2 hours per week per subject for 10 months. Total: 16 hours per week across all subjects.'},
    ],
    conclusion:'Nigerian students in 2026 have no excuse for poor WAEC or IGCSE outcomes if budget allows any online tutoring at all. The cost is one-third of in-person, the quality is higher, and the time savings are massive. Start 10 months before the exam, pick specialists, and measure monthly.',
  },
  
  'home-lessons-lagos': {
    cat:'homeschool', country:'nigeria',
    img:'linear-gradient(135deg,#1A120A,#3D2E12)', splash:'https://images.unsplash.com/photo-1577086664693-894d8405334a?w=1000&q=70',
    t:'Affordable Home Lessons in Lagos: Complete Guide (2026)',
    date:'April 2026 · 7 min read',
    author:'Jane Wanjiku', role:'Admissions Director',
    intro:'Lagos families spend more on private home lessons than any other West African city. Here is how to find quality at an affordable price in 2026.',
    sections:[
      {h:'Why Lagos relies on home lessons',p:'Public school quality varies dramatically, private schools have waiting lists, class sizes at both often exceed 40 children, and Lagos traffic makes extracurricular tutoring centres impractical for working parents. Private home lessons fill the gap.'},
      {h:'Cost ranges in 2026 naira',p:'Undergraduate tutors (often final-year university students): NGN 2,000–4,000/hour. Experienced graduate teachers: NGN 4,000–7,000/hour. Retired school teachers: NGN 5,000–9,000/hour. Specialist WAEC/IGCSE preparation: NGN 8,000–15,000/hour. Prices are roughly 30% lower in Ibadan, Kano, and Abuja.'},
      {h:'Where families in Lagos find tutors',p:'Referrals from other parents (most trusted). Church and mosque communities. Schools\' parent networks (some teachers moonlight, ethically permitted if not their own students). Online platforms Tutoroo, PrepClass, Afrikpro. Marketplace sites like Jiji (avoid for anything high-stakes — no verification).'},
      {h:'How to keep costs down without sacrificing quality',p:'Group tutoring with 2–3 children from neighbouring families cuts per-child cost by 40–60%. Online tutoring replaces travel and cuts tutor rates further. Termly pre-payment often earns 10–15% discount. University final-year students in STEM can be excellent for primary children.'},
      {h:'What to verify before hiring',p:'Bachelor\'s degree certificate (for secondary school subjects). NYSC discharge certificate (standard Nigerian credential). Recent Certificate of Good Conduct. Two references from other Lagos families. A paid 90-minute trial before any multi-session commitment.'},
      {h:'Red flags common in Lagos',p:'Tutors demanding full-term payment upfront (walk away). Tutors without any parent references (inexperienced at minimum). Tutors arriving repeatedly late or cancelling during the trial (predictive of future behaviour). Tutors refusing to share their teaching plan in writing.'},
    ],
    faqs:[
      {q:'Are NYSC corps members good tutors?',a:'Often excellent for primary school children — they are young, energetic, and accessible. Less reliable for senior secondary and WAEC preparation where experience matters.'},
      {q:'How many tutors does my child need?',a:'For a struggling SS1–SS3 student, 2–3 subject-specialist tutors are typical. Running 5+ parallel tutors creates scheduling chaos and diluted attention.'},
      {q:'Should we prefer men or women tutors?',a:'Gender does not predict teaching quality. Prioritise personality fit and subject expertise.'},
    ],
    conclusion:'Lagos home lessons cost far more than they should because the market is fragmented and quality-opaque. Families who take 2 weeks to research, verify credentials, and run trials save 30–50% over hasty hires. Or consider online tutoring from vetted platforms like Smartious where the vetting is already done for you.',
  },
  
  'good-private-tutor-nigeria': {
    cat:'tuition', country:'nigeria',
    img:'linear-gradient(135deg,#0F1A0A,#2A3D14)', splash:'https://images.unsplash.com/photo-1577086664693-894d8405334a?w=1000&q=70',
    t:'How to Find a Good Private Tutor in Nigeria',
    date:'March 2026 · 7 min read',
    author:'Mercy Akinyi', role:'Academic Coordinator',
    intro:'Nigeria has no formal tutor accreditation system. Anyone can call themselves a tutor. Here is how Nigerian parents can identify genuine quality in 2026.',
    sections:[
      {h:'Start with the minimum qualification bar',p:'For primary school: final-year university student or graduate in education, NYSC discharge certificate. For JSS–SS: Bachelor\'s degree in the subject, 2+ years teaching experience. For WAEC/IGCSE prep: specific exam familiarity demonstrated by previous students\' grades.'},
      {h:'The reference check people skip',p:'Ask for 2 phone numbers of previous parents. Actually call them. Questions to ask: Did your child\'s grades improve? Did the tutor turn up on time? Did they mark homework promptly? Would you hire them again? If the tutor cannot produce references, that tells you everything.'},
      {h:'The 90-minute trial',p:'Pay for one trial session and be present for at least part of it. Watch for: does the tutor ask questions or just lecture? Does the tutor correct mistakes gently? Does your child understand more than before? Does the tutor end by setting specific homework? Any "no" is a red flag.'},
      {h:'Agreement in writing',p:'Before regular sessions start, agree in writing: hourly rate, payment schedule (weekly or termly), cancellation policy (both sides), session length, and measurable goals. WhatsApp is acceptable as written record. Nothing verbal.'},
      {h:'Monthly review',p:'Every four weeks, review: homework grades, mock test performance, your child\'s self-reported progress. If three consecutive months show no improvement, change tutors. No exceptions.'},
      {h:'Specific Nigerian red flags',p:'Tutors who speak poorly of the child\'s school or teachers (unprofessional). Tutors who give excessive praise without backing data (suspicious). Tutors demanding exclusive access (your child should keep school teachers and classmates). Tutors making unrealistic promises — "guaranteed A1 in WAEC" is always a lie.'},
    ],
    faqs:[
      {q:'Can a tutor in Lagos teach my child in Abuja online?',a:'Absolutely. In 2026 most Nigerian private tutoring is cross-city. Quality does not depend on geography.'},
      {q:'Are foreign online tutors better than Nigerian ones?',a:'Not uniformly. Nigerian tutors who know WAEC nuances are often superior for WAEC prep. Foreign tutors may be better for IGCSE, SAT, and UK/US university entrance exams.'},
      {q:'How much should I pay?',a:'Lagos rates: NGN 3,000–8,000/hour. Pay toward the upper end only if the tutor has demonstrable track record with A-grade students.'},
    ],
    conclusion:'Finding a good Nigerian tutor requires 2 weeks of structured search: verify credentials, call references, run paid trial, agree terms in writing, review monthly. The parents who skip steps are the parents who pay twice — once for the wrong tutor and again for the replacement.',
  },
  
  'pass-waec-online-tutoring': {
    cat:'tuition', country:'nigeria',
    img:'linear-gradient(135deg,#120A1A,#2D143D)', splash:'https://images.unsplash.com/photo-1577086664693-894d8405334a?w=1000&q=70',
    t:'How to Pass WAEC Exams with Online Tutoring (2026)',
    date:'March 2026 · 8 min read',
    author:'Dr. David Maina', role:'STEM Specialist',
    intro:'WAEC pass rates have fluctuated between 52–72% over the last decade. With proper preparation — including targeted online tutoring — student success rates rise to over 90%. Here is the 2026 playbook.',
    sections:[
      {h:'Start early, not late',p:'Begin structured WAEC preparation at the start of SS2, not SS3. Students who only start in SS3 have half the runway to fix foundational gaps. The ones who start in SS2 score visibly higher across all 8 subjects.'},
      {h:'Identify weak topics via diagnosis',p:'Have the student attempt a recent WAEC paper (2022–2024) cold under timed conditions. Mark brutally against the official WAEC scheme. This reveals: (a) which subjects are weakest, (b) which topics within subjects are weakest, (c) whether the gap is content knowledge or exam technique.'},
      {h:'Prioritise the 6-out-of-9 subjects',p:'WAEC university admission requires 6 credit passes (C6 or above) including English and Mathematics. Focus weekly tutoring on those 6 plus the 2 you cannot afford to flunk. Do not spread tutoring across all 9 subjects thinly.'},
      {h:'Past papers are the #1 tool',p:'Work through every WAEC paper from 2018 to 2024. Mark against official schemes. Your online tutor should be providing these and reviewing answers weekly. Past-paper exposure is the single most predictive variable for WAEC success.'},
      {h:'Exam technique matters as much as content',p:'Time management (60 seconds per mark), command word recognition (define, explain, analyse), structured answer writing. Most Nigerian students lose 15–25% of potential marks to poor technique, not content ignorance. A good tutor fixes technique explicitly.'},
      {h:'Mental and physical preparation',p:'Last 2 weeks: stop new content, review past papers only. Last 3 days: sleep well, eat well, arrive at the centre 30 minutes early. Panic destroys more WAEC results than ignorance.'},
    ],
    faqs:[
      {q:'Can I pass WAEC with only 3 months of tutoring?',a:'Possible for strong students targeting C passes. Unlikely for students targeting A1 grades. Realistic minimum: 6 months of structured preparation.'},
      {q:'How many hours per week of tutoring?',a:'2 hours per week for each of 6 core subjects = 12 hours total weekly. Plus 4–6 hours of independent study per week. Below this, weak subjects do not lift.'},
      {q:'Are Nigerian online tutors better than foreign ones for WAEC?',a:'For WAEC specifically, yes. WAEC-specific familiarity matters more than university prestige. Smartious has a WAEC-specialist track for Nigerian students.'},
    ],
    conclusion:'WAEC is a beatable exam with structured preparation. Start at SS2, focus on 6 core subjects, use past papers relentlessly, hire specialist tutors, and review monthly. Students who follow this framework achieve C6-and-above pass rates above 90%.',
  },
  
  'private-tutor-cost-nigeria-2026': {
    cat:'tuition', country:'nigeria',
    img:'linear-gradient(135deg,#1A0A14,#3D1F2D)', splash:'https://images.unsplash.com/photo-1577086664693-894d8405334a?w=1000&q=70',
    t:'Cost of Hiring a Private Tutor in Nigeria (2026 Full Guide)',
    date:'March 2026 · 6 min read',
    author:'Mercy Akinyi', role:'Academic Coordinator',
    intro:'Nigerian private tutoring costs have risen faster than inflation in 2023–2026. Here is the honest picture of what you should actually be paying in 2026.',
    sections:[
      {h:'Lagos, Abuja, Port Harcourt — premium cities',p:'Undergraduate/NYSC tutors: NGN 2,500–5,000/hour. Qualified teachers (3+ years experience): NGN 5,000–9,000/hour. Specialist exam tutors (WAEC, IGCSE A-grade track record): NGN 8,000–15,000/hour. Elite university-prep tutors (SAT, Ivy League focus): NGN 15,000–30,000/hour.'},
      {h:'Other cities — typical range',p:'Ibadan, Kano, Enugu, Benin, Calabar: roughly 30–40% below Lagos rates. Qualified teachers: NGN 3,000–6,000/hour. Specialist exam tutors: NGN 6,000–10,000/hour.'},
      {h:'Online Nigerian tutors',p:'NGN 2,500–6,500/hour for qualified teachers working from home. Online costs are lower because no travel time means the tutor can serve more students. Quality is equivalent for secondary school subjects.'},
      {h:'International online tutors available to Nigerians',p:'UK and Kenya-based platforms (Smartious, Explore Learning, Cambridge Home School) serve Nigerian students at USD $8–25/hour (NGN 12,000–37,000). For IGCSE, A-Level, and international university prep, these specialists are often better than domestic options.'},
      {h:'Monthly total for serious preparation',p:'For SS3 WAEC prep: 6 subjects × 2 hours/week × 4 weeks = 48 hours × NGN 5,000 = NGN 240,000/month. For JSS3 BECE prep: 4 subjects × 1.5 hours/week × 4 weeks = 24 hours × NGN 3,500 = NGN 84,000/month. For IGCSE preparation: 8 subjects × 2 hours/week × 4 weeks = 64 hours × NGN 6,000 = NGN 384,000/month. Online alternatives cut these by 40–60%.'},
      {h:'Hidden costs',p:'Transport or fuel for home-visit tutors (NGN 2,000–5,000 per visit often added). Textbooks (NGN 5,000–15,000 per subject). Past paper packs (NGN 3,000–8,000 per subject). Mock exam fees at centres (NGN 3,000–8,000 per mock). Budget an extra 20% on top of tutor fees.'},
    ],
    faqs:[
      {q:'Can I pay tutors in foreign currency?',a:'International online platforms (Smartious) bill in USD via Paystack or similar. Domestic Nigerian tutors prefer naira.'},
      {q:'Should I pay weekly or monthly?',a:'Weekly initially to test commitment; shift to monthly once the tutor has proven reliable. Avoid termly prepayments.'},
      {q:'Are tuition centres cheaper than private tutors?',a:'Per hour yes, but quality varies and group sizes dilute attention. For struggling students, one-on-one tutoring is more cost-effective despite the higher hourly rate.'},
    ],
    conclusion:'Nigerian private tutoring in 2026 rewards families who shop carefully, compare online alternatives, and negotiate. The difference between a well-hired tutor at NGN 5,000/hour and a mediocre one at NGN 8,000/hour can be a full letter grade in WAEC. Pay for value, not prestige.',
  },
  
  // SOUTH AFRICA (5)
  'homeschooling-south-africa-legal': {
    cat:'homeschool', country:'za',
    img:'linear-gradient(135deg,#0F1A0A,#1F3D1F)', splash:'https://images.unsplash.com/photo-1577414025739-39f1e64faa00?w=1000&q=70',
    t:'Homeschooling in South Africa: Legal Guide (2026)',
    date:'April 2026 · 9 min read',
    author:'Jane Wanjiku', role:'Admissions Director',
    intro:'Homeschooling is fully legal in South Africa under the South African Schools Act, and has grown from under 30,000 children in 2015 to over 150,000 in 2026. Here is what families need to know to do it properly.',
    sections:[
      {h:'Legal framework',p:'Section 51 of the South African Schools Act, 1996 permits homeschooling. Parents must register with their Provincial Department of Education (not the National Department). Registration is generally accepted when the application includes an appropriate curriculum plan and shows the child will access quality education comparable to public schooling.'},
      {h:'Province-by-province differences',p:'Gauteng and Western Cape: relatively smooth registration. KwaZulu-Natal: some delays but workable. Eastern Cape and Free State: slower processing, sometimes 3–4 months. Northern Cape and Mpumalanga: lower registration volumes, so administrative capacity is limited. All nine provinces permit homeschooling; the paperwork timeline differs.'},
      {h:'Curriculum choice in South Africa',p:'Most SA homeschoolers choose CAPS (the national curriculum) because it gives the NSC matric certificate via private exam centres. Growing numbers choose Cambridge IGCSE and A-Level for international portability. Some use American-accredited curricula (Accelerated Christian Education, Calvert) for overseas family alignment.'},
      {h:'Matric options for homeschoolers',p:'The main pathways: (1) Sit the NSC (National Senior Certificate) via IEB or SACAI as a "registered candidate" — equivalent to the public school matric. (2) Do Cambridge IGCSE + AS/A-Level for international pathways. (3) Do both — some ambitious students sit NSC and IGCSE parallel.'},
      {h:'Costs — 2026 rand',p:'CAPS homeschooling: R2,000–R5,000/month per child with providers like Impaq, Brainline, or Cambridge Home Education. Cambridge IGCSE: R4,500–R8,500/month. Exam fees: NSC roughly R3,500 total; IGCSE roughly R1,500–R2,500 per subject. Compared to private schools at R8,000–R25,000/month, homeschooling is 25–40% the cost.'},
      {h:'Popular providers and co-ops',p:'Impaq (largest SA homeschool curriculum provider), Brainline (Afrikaans-friendly), Cambridge Home Education (Cambridge specialist), ACE Ministries (Christian), and regional co-ops for the social layer. Most Johannesburg, Cape Town, and Durban suburbs have homeschool co-ops meeting weekly.'},
    ],
    faqs:[
      {q:'Do I need to be a qualified teacher?',a:'No. South African homeschool law does not require parental qualifications. However some provinces prefer you to work with a registered provider.'},
      {q:'Can my homeschooled child go to university?',a:'Yes. All South African universities accept NSC, IEB, and Cambridge-qualified homeschool applicants. Some require an additional admissions test.'},
      {q:'What if the Department rejects my registration?',a:'Rare in 2026 with proper paperwork. If it happens, Pestalozzi Trust and Pass-SA provide legal support. You can continue homeschooling while appealing under case law precedent.'},
    ],
    conclusion:'South African homeschooling in 2026 is mainstream, legally secure, and well-supported. Register with your provincial department, pick a curriculum matched to your child\'s university plans, and engage with a local co-op. Most SA families complete the setup in 4–8 weeks.',
  },
  
  'sa-online-tutors-high-school': {
    cat:'tuition', country:'za',
    img:'linear-gradient(135deg,#1A0A0A,#3D1A1A)', splash:'https://images.unsplash.com/photo-1577414025739-39f1e64faa00?w=1000&q=70',
    t:'Best Online Tutors in South Africa for High School Students (2026)',
    date:'April 2026 · 7 min read',
    author:'Dr. David Maina', role:'STEM Specialist',
    intro:'South African high school students face one of the most demanding school curricula in Africa. Online tutoring bridges gaps quickly when done right. Here is the 2026 landscape.',
    sections:[
      {h:'What SA high schoolers actually need help with',p:'Mathematics (pure and applied), Physical Science, Accounting, English Home Language, Afrikaans FAL, Life Sciences. These six subjects account for 85% of online tutoring demand in SA Grade 10–12.'},
      {h:'Major platforms',p:'GradeSmart (SA-specific CAPS focus), Cambly for English, Tutors.co.za, Turito, and international platforms with SA-familiar tutors like Smartious. Teach Me 2 is a well-established SA agency for both in-person and online.'},
      {h:'2026 rand pricing',p:'SA-based online tutors: R180–R450/hour. International online tutors with SA curriculum familiarity: R120–R300/hour. Matric specialist tutors (targeting Level 7 final marks): R350–R700/hour.'},
      {h:'For CAPS curriculum specifically',p:'Always pick tutors who have taught CAPS directly. A tutor with only IGCSE experience can teach the content but misses the exam-question formatting and marking scheme nuances that matter for matric Level 7.'},
      {h:'For IEB and Cambridge IGCSE',p:'IEB is the private-school exam; harder than CAPS. Cambridge is international. Both require tutors specifically trained in those exam boards. Smartious covers all three pathways for SA families.'},
      {h:'How to trial a SA online tutor',p:'Book a single 90-minute paid session. Present the tutor with a specific topic your child struggles with. Observe: do they diagnose before teaching? Do they explain in ways that connect to your child\'s existing knowledge? Does your child leave able to do something they could not do before?'},
    ],
    faqs:[
      {q:'Is Zoom/Teams adequate for online tutoring?',a:'Yes for most subjects. Maths tutors should also use a digital whiteboard (Miro, BitPaper). Science tutors should share pre-prepared diagrams.'},
      {q:'Are university student tutors worth hiring?',a:'For Grade 8–9 yes, often excellent. For matric-level Physical Science and Mathematics, prefer qualified teachers.'},
      {q:'How do load-shedding disruptions affect online tutoring?',a:'Inverters and UPS solve this. Most SA families investing in online tutoring already have backup power. Sessions can be rescheduled easily.'},
    ],
    conclusion:'Online tutoring works excellently for SA high schoolers when families pick CAPS-specific tutors, trial before committing, and review monthly. The biggest gains come in matric year when targeted tutoring can lift a Level 4 to Level 6 across 3–4 subjects.',
  },
  
  'caps-vs-igcse-sa': {
    cat:'igcse', country:'za',
    img:'linear-gradient(135deg,#120A20,#2D155A)', splash:'https://images.unsplash.com/photo-1577414025739-39f1e64faa00?w=1000&q=70',
    t:'CAPS vs IGCSE in South Africa: Which Curriculum Is Better?',
    date:'March 2026 · 8 min read',
    author:'Dr. Susan Kariuki', role:'Head of Curriculum',
    intro:'South African families increasingly choose between the national CAPS curriculum and Cambridge IGCSE. Both lead to matric-equivalent qualifications. Here is the honest comparison for 2026 families.',
    sections:[
      {h:'What CAPS is',p:'CAPS (Curriculum and Assessment Policy Statement) is the South African national curriculum for Grades R–12. It culminates in the National Senior Certificate (NSC) via public or private exam bodies (DBE, IEB, SACAI). Universally accepted by South African universities.'},
      {h:'What Cambridge IGCSE is',p:'Cambridge IGCSE (International General Certificate of Secondary Education) is a 2-year programme at ages 14–16, followed by AS-Level and A-Level at ages 16–18. Globally recognised by every major university.'},
      {h:'South African university recognition',p:'Both CAPS NSC and Cambridge A-Level are accepted by all SA universities. UCT, Wits, Stellenbosch, Pretoria all publish equivalency tables. A-Level A* typically equals CAPS 90%+; Level 7.'},
      {h:'International university recognition',p:'IGCSE + A-Level has stronger international recognition. UK Russell Group universities prefer IGCSE/A-Level applicants and may require extra steps for CAPS graduates. For families considering Oxford, Cambridge, or US Ivy League, IGCSE is the cleaner path.'},
      {h:'Workload comparison',p:'Matric NSC requires 7 subjects; Cambridge IGCSE typically 7–10. A-Level is narrower — only 3–4 subjects. Matric final exam weeks are more intense than Cambridge due to compressed timetabling.'},
      {h:'Cost difference',p:'CAPS homeschooling: R2,000–R5,000/month. Cambridge IGCSE: R4,500–R8,500/month. Cambridge exam fees are significantly higher (R1,500–R2,500 per subject vs R400–R600 per CAPS subject). Over matric years, Cambridge costs roughly 2x CAPS.'},
    ],
    faqs:[
      {q:'Can I switch from CAPS to IGCSE mid-way through high school?',a:'Yes, ideally before Grade 10. After Grade 10 switching is disruptive. We support 20–30 transitions per year at Smartious.'},
      {q:'Which is "better"?',a:'For a family committed to SA universities and careers, CAPS is excellent and more affordable. For families planning international university, IGCSE is worth the premium.'},
      {q:'Do I have to choose only one?',a:'Most families pick one. A few ambitious students do IGCSE in parallel with late-CAPS — doubles workload but maximises options.'},
    ],
    conclusion:'Pick based on your child\'s post-matric plans. If UCT or Wits is the goal, CAPS is the efficient choice. If Cambridge or Oxford is the goal, invest in IGCSE from Grade 8 or 9. Either path produces excellent outcomes when taught well.',
  },
  
  'online-tutoring-cost-sa': {
    cat:'tuition', country:'za',
    img:'linear-gradient(135deg,#0A1A1A,#1A3D3D)', splash:'https://images.unsplash.com/photo-1577414025739-39f1e64faa00?w=1000&q=70',
    t:'Cost of Online Tutoring in South Africa (2026)',
    date:'March 2026 · 6 min read',
    author:'Mercy Akinyi', role:'Academic Coordinator',
    intro:'Online tutoring prices in South Africa have stabilised in 2026 after pandemic-era inflation. Here are the current rates and where families find best value.',
    sections:[
      {h:'Entry tier — university students',p:'R150–R250/hour. Good for Grade 4–9 foundational support. Tutors are typically Honours students at UCT, Wits, Stellenbosch, or Rhodes. Quality varies; request teaching references.'},
      {h:'Mid tier — qualified teachers',p:'R250–R450/hour. Grade 10–12 CAPS specialists with 2+ years of school teaching. This is the sweet spot for most SA families preparing for matric.'},
      {h:'Premium tier — exam specialists and senior teachers',p:'R450–R800/hour. IEB specialists, matric markers, retired HOD\'s. Worth the price for students targeting 90%+ or university scholarships.'},
      {h:'International online platforms',p:'USD $10–$20/hour (R190–R380/hour). Smartious, Cambridge Home School, and global specialists like Third Space Learning. Often better qualified per rand than SA options.'},
      {h:'Group online tutoring',p:'R70–R180/hour per student in groups of 3–5. Good for general subject reinforcement. Not as effective as one-on-one for exam-specific preparation.'},
      {h:'Monthly total for matric preparation',p:'4 subjects × 2 hours/week × 4 weeks = 32 hours × R300/hour = R9,600/month for solid matric preparation. Cheaper via group tutoring (R3,500–R5,000/month for same hours).'},
    ],
    faqs:[
      {q:'Are online tutors cheaper than in-person?',a:'Yes, typically 20–40% cheaper because there is no travel time. Quality is equivalent for secondary school subjects.'},
      {q:'Do any platforms offer income-based pricing?',a:'Yes — Smartious offers bursary placements for bright SA students from low-income families. Apply through the contact form.'},
      {q:'How many hours per week should I budget?',a:'Minimum 2 hours per subject per week for noticeable improvement. Less than that produces minor gains.'},
    ],
    conclusion:'SA families in 2026 have excellent online tutoring options across all price tiers. The best strategy is often hybrid: group tutoring for routine subject reinforcement plus one-on-one for the specific subjects your child needs to master.',
  },
  
  'matric-online-tutors-prep': {
    cat:'tuition', country:'za',
    img:'linear-gradient(135deg,#1A0F0A,#3D2512)', splash:'https://images.unsplash.com/photo-1577414025739-39f1e64faa00?w=1000&q=70',
    t:'How to Prepare for Matric Exams with Online Tutors (2026)',
    date:'February 2026 · 7 min read',
    author:'Dr. David Maina', role:'STEM Specialist',
    intro:'Matric determines university entry for 650,000+ South African students each year. Online tutoring has become the dominant preparation model in 2026. Here is the proven playbook.',
    sections:[
      {h:'Start at the beginning of Grade 11, not Grade 12',p:'Matric exams test Grade 10–11 content alongside Grade 12 material. Students who only start focused preparation in Grade 12 lose 18 months of reinforcement time. The top scorers begin targeted preparation in early Grade 11.'},
      {h:'Diagnose your actual starting position',p:'Attempt a recent past NSC paper (2021–2024) at the start of preparation. Mark against the official memorandum. This tells you exactly which topics you have mastered and which are gaps — the basis of your entire study plan.'},
      {h:'Focus on the marks-per-minute subjects',p:'Maths, Physical Science, and Life Sciences carry the most marks and the most volatility. If you are aiming for Level 6–7 outcomes, invest the bulk of your online tutoring hours here. English and home language tutoring has smaller returns per hour.'},
      {h:'Weekly rhythm for peak prep',p:'Grade 11: 2 hours per week per core subject. Grade 12 first semester: 2–3 hours per week per core subject. Grade 12 second semester: 3–4 hours per week per core subject. Final 6 weeks: reduce new content, maximise past-paper practice.'},
      {h:'Past papers are king',p:'Complete every NSC past paper from 2018–2024 under timed conditions. Mark each answer against the official memorandum. Your online tutor should review 2–3 past paper questions per session. This single activity predicts matric outcomes better than any other.'},
      {h:'Final 2 weeks — maintenance mode',p:'Stop learning new material. Sleep 8 hours nightly. Eat properly. Do 1 past paper per day with calm review. Over-studying in the final 2 weeks is almost always counterproductive.'},
    ],
    faqs:[
      {q:'Can I pass matric with only online tutoring (no school)?',a:'Registered homeschool students do exactly this every year. The key is working with accredited providers and sitting exams through IEB, SACAI, or the DBE.'},
      {q:'Is IEB matric harder than DBE (public) matric?',a:'Yes, typically. IEB is more analytical; DBE is more memorisation-based. IEB requires more preparation time, but opens more doors for competitive university courses.'},
      {q:'How much does full-year online tutoring cost for matric?',a:'Budget R80,000–R150,000 for comprehensive 4-subject online tutoring across Grades 11–12. Less if using group tutoring.'},
    ],
    conclusion:'Matric is a beatable exam with structured preparation. Start early in Grade 11, diagnose honestly, focus on high-mark subjects, use past papers relentlessly, and run taper weeks before the final papers. Online tutoring from specialists like Smartious gives access to top-tier teaching at reasonable prices.',
  },
  
  // EGYPT (5)
  'igcse-tutoring-egypt-2026': {
    cat:'igcse', country:'egypt',
    img:'linear-gradient(135deg,#1A1208,#3D2E12)', splash:'https://images.unsplash.com/photo-1539650116574-75c0c6d73aa2?w=1000&q=70',
    t:'IGCSE Tutoring in Egypt: Complete Guide (2026)',
    date:'April 2026 · 8 min read',
    author:'Dr. David Maina', role:'IGCSE Specialist',
    intro:'Egypt has the highest IGCSE enrolment in Africa after South Africa, with over 55,000 Egyptian students sitting IGCSE papers annually. Here is the 2026 landscape.',
    sections:[
      {h:'Why IGCSE is so popular in Egypt',p:'Three reasons: (1) Egyptian private schools offering British curriculum have tripled since 2015; (2) IGCSE + A-Level opens UK and European university pathways attractive to upwardly-mobile Egyptian families; (3) the Egyptian Thanaweya Amma system is seen as over-competitive and grade-inflated, pushing ambitious families to IGCSE.'},
      {h:'Top IGCSE subjects demanded in Egypt',p:'Mathematics, Physics, Chemistry, Business Studies, English Second Language, and Arabic as a Foreign Language. Most Egyptian IGCSE students take 8–10 subjects.'},
      {h:'Online tutoring growth in Egypt 2021–2026',p:'Cairo traffic (2–3 hour daily commutes) and power/internet reliability issues have pushed families online. Egyptian online tutoring has grown 8x since 2021. Most IGCSE preparation in Cairo and Alexandria is now online or hybrid.'},
      {h:'Typical cost in Egyptian pounds',p:'Local IGCSE tutors (Egyptian teachers): EGP 500–1,200/hour. International online tutors with Cambridge training: EGP 400–900/hour. Smartious IGCSE tutors: USD $8–15/hour (EGP 400–750/hour depending on exchange rate).'},
      {h:'Qualifications that matter for IGCSE in Egypt',p:'Cambridge-trained teachers (not just graduates from British universities). Minimum 3 years teaching IGCSE specifically. Recent (within 2 years) exposure to actual exam papers. Track record of student A-C grade achievement.'},
      {h:'Common mistakes Egyptian families make',p:'Starting tutoring too late (less than 6 months before exam). Choosing tutors based on language ability rather than subject expertise. Running 9–10 subjects with parallel tutoring without priority setting. Neglecting English language fluency for the examination.'},
    ],
    faqs:[
      {q:'Is IGCSE exam available in Egypt year-round?',a:'Yes. British Council Egypt and multiple Cambridge-authorised centres in Cairo and Alexandria administer IGCSE.'},
      {q:'Do Egyptian universities accept IGCSE?',a:'Some — notably AUC (American University in Cairo) and GUC (German University in Cairo). Traditional Egyptian public universities may require additional Thanaweya Amma qualifications.'},
      {q:'What about A-Level after IGCSE in Egypt?',a:'Cambridge and Edexcel A-Level are widely offered in Cairo via both schools and online. They lead directly to UK and European universities.'},
    ],
    conclusion:'IGCSE is the fastest-growing post-primary qualification in Egypt. Online tutoring has become the dominant preparation method. Start early, pick Cambridge-specialist tutors, and commit to 18 months of structured preparation for the best outcomes.',
  },
  
  'online-tutors-cairo-international': {
    cat:'tuition', country:'egypt',
    img:'linear-gradient(135deg,#1A0F14,#3D222E)', splash:'https://images.unsplash.com/photo-1539650116574-75c0c6d73aa2?w=1000&q=70',
    t:'Best Online Tutors in Cairo for International Students (2026)',
    date:'March 2026 · 7 min read',
    author:'Grace Njeri', role:'Academic Counsellor',
    intro:'Cairo\'s international student population is one of the largest in Africa, with families from over 50 countries. Online tutoring for international students in Cairo requires specific curriculum familiarity. Here is the 2026 picture.',
    sections:[
      {h:'Which curricula international Cairo families follow',p:'British (Cambridge/Edexcel) is most common — roughly 55% of expat children. American Common Core and AP: 25%. French Baccalauréat: 10%. IB Programme: 8%. Others: 2%.'},
      {h:'Best platforms for each curriculum',p:'British: Smartious, Cambridge Home School, Tutorful. American: Varsity Tutors, Wyzant, K12 online. French: Cours Legendre, CNED. IB: specialist IB tutoring agencies, Smartious IB track.'},
      {h:'Cost in USD (standard expat reference)',p:'British online tutors: $20–60/hour for qualified teachers. American: $25–65/hour. IB specialists: $40–90/hour. French: €25–55/hour. Smartious offers British and IB at $8–15/hour.'},
      {h:'What to look for in an expat-friendly Cairo tutor',p:'Time-zone flexibility (some expats run on home country schedules), curriculum specialism not generalism, experience with the specific exam board, cultural awareness of the international family context, and willingness to coordinate with the child\'s school teacher.'},
      {h:'Common international family mistakes',p:'Hiring local Egyptian tutors for international curricula — they may know the content but not the exam conventions. Starting exam prep late. Assuming a good school eliminates the need for tutoring — expat schools often have large class sizes.'},
      {h:'Embassy and community resources',p:'British Council Cairo, American Chamber of Commerce, and various embassy parent networks maintain vetted tutor lists. These are a good first stop for new expat families in Cairo.'},
    ],
    faqs:[
      {q:'Can online tutors work around 7-hour time differences?',a:'Yes. Most international online tutors will work Cairo-friendly evening hours.'},
      {q:'Which is better — tutor from home country or international platform?',a:'Depends on curriculum specialism. A specialist platform often has more depth than a single home-country tutor.'},
      {q:'Do schools in Cairo allow external tutoring?',a:'Yes. Most international schools are fine with external tutoring as long as it does not replace their own teaching.'},
    ],
    conclusion:'Cairo international families have global access to online tutoring. Pick specialist providers who know your child\'s exact exam board, negotiate time zones up front, and review progress every 8 weeks against specific exam criteria.',
  },
  
  'igcse-exam-prep-egypt': {
    cat:'igcse', country:'egypt',
    img:'linear-gradient(135deg,#14120A,#3D3822)', splash:'https://images.unsplash.com/photo-1539650116574-75c0c6d73aa2?w=1000&q=70',
    t:'How to Prepare for IGCSE Exams in Egypt (2026)',
    date:'March 2026 · 8 min read',
    author:'Dr. David Maina', role:'IGCSE Specialist',
    intro:'55,000+ Egyptian students sit IGCSE annually. Top Cairo results come from structured preparation, not natural ability. Here is the 2026 playbook.',
    sections:[
      {h:'The 18-month runway',p:'Start preparation 18 months before the exam, in Year 10 for May/June exams. Students who only begin in Year 11 compromise their final grades significantly. This applies equally to home-schooled and school-based students.'},
      {h:'Know your exam board',p:'Cambridge (CIE) and Pearson Edexcel are both called IGCSE but differ significantly. Cambridge is common at British Council Cairo. Edexcel is common at several American and British schools. Tutors should specialise in one, not both.'},
      {h:'Past papers from 2018 onwards',p:'Cambridge and Edexcel both publish past papers freely. Work through every paper from 2018–2025 under timed conditions. Mark against the official scheme. This is the single highest-ROI study activity.'},
      {h:'The 8-subject strategy',p:'Most Egyptian families attempt 8–10 subjects. Split them into three tiers: top-grade targets (the 3–4 subjects you must A-star), solid-grade targets (the 3–4 subjects you must B/A), and safety subjects (any extras). Allocate tutoring hours accordingly — not evenly.'},
      {h:'Arabic as First Language strategy',p:'Egyptian students have a significant advantage here. Arabic as First Language (0508) at IGCSE should be a guaranteed A*. Do not under-prepare thinking it is automatic — exam technique matters even for native speakers.'},
      {h:'Final 6 weeks',p:'Stop new content. Review past papers. Sleep regularly. Do not cram. Confidence on exam day comes from routine familiarity, not last-minute panic.'},
    ],
    faqs:[
      {q:'Do I need to hire an Egyptian tutor?',a:'For exam-specific IGCSE preparation, no — specialist British curriculum tutors worldwide are often better. For overall cultural context and Arabic subjects, local Egyptian tutors are ideal.'},
      {q:'Is Cambridge IGCSE harder than Edexcel?',a:'Slightly. Cambridge is considered more rigorous on average; Edexcel has more multiple-choice-friendly papers. University admissions do not meaningfully distinguish.'},
      {q:'Can I sit IGCSE in October/November instead of May/June?',a:'Yes. Most subjects are offered in both sessions. Cambridge offers some subjects only in May/June; check the specific syllabus.'},
    ],
    conclusion:'IGCSE in Egypt is fully achievable at high grades with structured preparation. Start 18 months out, know your exam board, commit to past papers, prioritise high-mark subjects. Expert Cambridge tutors available at Smartious for USD $8–15/hour.',
  },
  
  'private-tutoring-cost-egypt': {
    cat:'tuition', country:'egypt',
    img:'linear-gradient(135deg,#0F1A12,#224A2E)', splash:'https://images.unsplash.com/photo-1539650116574-75c0c6d73aa2?w=1000&q=70',
    t:'Cost of Private Tutoring in Egypt (2026 Guide)',
    date:'March 2026 · 6 min read',
    author:'Mercy Akinyi', role:'Academic Coordinator',
    intro:'Private tutoring is almost universal in Egypt — over 85% of Thanaweya Amma students hire private tutors. In 2026, costs vary wildly. Here is the honest picture.',
    sections:[
      {h:'Thanaweya Amma tutoring costs',p:'Group tuition centres in Cairo: EGP 800–2,500 per course package. Private one-on-one tutors: EGP 300–900/hour. Top-tier exam specialists (historically nationally ranked students): EGP 800–2,500/hour. Elite tutors running their own centres can charge EGP 5,000+ per hour equivalent.'},
      {h:'IGCSE and international tutoring',p:'Local Egyptian IGCSE tutors: EGP 500–1,200/hour. International online tutors via platforms: USD $10–25/hour (EGP 450–1,100). Specialist Cambridge exam tutors: EGP 800–1,500/hour for local, USD $30–70/hour for premium international.'},
      {h:'Primary and preparatory school tutoring',p:'Grade 1–6: EGP 200–600/hour. Preparatory school: EGP 300–800/hour. Usually cheaper via group tutoring (EGP 100–300/hour per student).'},
      {h:'Online vs in-person cost difference',p:'Online tutoring in Egypt is typically 25–40% cheaper than in-person for the same quality. The savings come from eliminating tutor travel time and Cairo traffic delays.'},
      {h:'Family budget reality',p:'Middle-class Cairo families commonly spend EGP 3,000–8,000 per month per child on tutoring. Upper-middle-class families preparing for premium IGCSE or university admission spend EGP 10,000–25,000 per month.'},
      {h:'Where families overspend',p:'Hiring multiple tutors in parallel for the same subject. Paying premium rates for "famous" tutors whose value mostly comes from network effects rather than teaching skill. Signing annual prepayment contracts. Not measuring outcomes.'},
    ],
    faqs:[
      {q:'Is tutoring legally required in Egypt?',a:'No. Tutoring is a parent choice. The universal culture makes it feel mandatory but it is not legally required.'},
      {q:'Can I pay Egyptian tutors in USD?',a:'Local tutors prefer Egyptian pounds. International online platforms accept USD.'},
      {q:'Are group tutoring centres worth it?',a:'For Thanaweya Amma the most famous centres have genuinely high-quality teaching. For IGCSE, one-on-one is usually better.'},
    ],
    conclusion:'Egyptian tutoring costs vary enormously by tier and quality. Smart families shop carefully, verify credentials, trial before committing, and measure monthly outcomes. Online international tutoring is increasingly replacing traditional Cairo tutoring centres — with lower costs and often higher quality.',
  },
  
  'homeschooling-egypt': {
    cat:'homeschool', country:'egypt',
    img:'linear-gradient(135deg,#140A1A,#2D1442)', splash:'https://images.unsplash.com/photo-1539650116574-75c0c6d73aa2?w=1000&q=70',
    t:'Homeschooling in Egypt: What Parents Should Know (2026)',
    date:'February 2026 · 7 min read',
    author:'Jane Wanjiku', role:'Admissions Director',
    intro:'Homeschooling is a small but growing movement in Egypt. The legal framework is more restrictive than in Western countries but workable with proper structure. Here is what Egyptian parents need to know in 2026.',
    sections:[
      {h:'Legal framework in Egypt',p:'Egypt does not have a formal homeschooling statute. Families achieve the equivalent by enrolling children in accredited online international schools or distance learning programmes. Direct unregistered homeschooling without enrollment in an accredited programme is not legally recognised for formal qualifications.'},
      {h:'Common legal pathways',p:'(1) Enrol in a British or American online school (Oxford Home Schooling, K12 International Academy, Wolsey Hall). (2) Register with a Cambridge-authorised distance learning provider. (3) Do full-time IGCSE or A-Level preparation via Smartious or similar with exam registration through British Council Egypt.'},
      {h:'Why Egyptian families homeschool',p:'Expats whose children need home-country curricula. Families with travel-heavy professions. Gifted students unchallenged by Egyptian schools. Children with learning differences that schools cannot accommodate. Religious families wanting specific content.'},
      {h:'Curriculum options for Egypt',p:'British (Cambridge/Edexcel IGCSE and A-Level) — most popular, exam-friendly. American (K12 online) — good for US-bound families. IB Primary and Middle Years (online) — rigorous but limited providers. Egyptian national curriculum (Thanaweya Amma) — very difficult to homeschool legally.'},
      {h:'Social layer in Cairo',p:'Cairo has homeschool co-ops — Facebook groups, Maadi-area meet-ups, Zamalek expat networks. Join at least one. Several international schools also allow homeschoolers to attend specific activities (sports, music, drama) for a fee.'},
      {h:'Cost in 2026',p:'British online school: USD $3,500–$8,000/year per child. American online: $4,500–$9,000/year. Smartious comprehensive: $5,500/year equivalent. Premium private schools in Cairo: USD $8,000–$25,000/year — so homeschool is 40–70% the cost.'},
    ],
    faqs:[
      {q:'Can an Egyptian national homeschool?',a:'Yes, but only via foreign-curriculum enrollment. For university in Egypt, Thanaweya Amma equivalency through AUC or GUC is usually the path.'},
      {q:'Is Arabic language mandatory for homeschoolers?',a:'Not for international curriculum students. If returning to Egyptian schools ever planned, Arabic instruction becomes important.'},
      {q:'Can my homeschooled child go to AUC or GUC?',a:'Yes. Both universities accept IGCSE/A-Level qualifications directly. SAT scores strengthen the application.'},
    ],
    conclusion:'Homeschooling in Egypt is workable in 2026 with proper legal structure (accredited online enrollment). It costs less than premium private schools, gives curriculum flexibility, and produces university-ready students. Start with curriculum choice, then find the accredited provider that delivers it.',
  },
  
  // BOTSWANA (5)
  'online-tutoring-botswana': {
    cat:'tuition', country:'botswana',
    img:'linear-gradient(135deg,#0F1408,#222E14)', splash:'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=1000&q=70',
    t:'Online Tutoring in Botswana: Complete Guide (2026)',
    date:'April 2026 · 7 min read',
    author:'Alfred Ouko', role:'Founder & CEO',
    intro:'Botswana has over 500,000 school-age children and one of the highest literacy rates in southern Africa. Online tutoring is growing fast but choices are less well-known than in SA or Kenya. Here is the 2026 landscape.',
    sections:[
      {h:'Why Botswana students turn to online tutoring',p:'Gaborone, Francistown, and Maun all have limited in-person specialist tutor options. A-Level Mathematics or Physics tutors with genuine exam familiarity are rare. Online tutoring gives access to UK, SA, and Kenyan specialists without the Botswana premium.'},
      {h:'Major subjects in demand',p:'BGCSE (Botswana General Certificate of Secondary Education) subjects: Mathematics, Physics, Chemistry, Biology, English Language, Setswana, Development Studies. Growing IGCSE and A-Level demand among private school and expat students.'},
      {h:'Typical cost in Botswana pula',p:'Local in-person tutors in Gaborone: BWP 150–350/hour for qualified teachers. Online local tutors: BWP 120–280/hour. International online tutors (UK, SA, Kenya): BWP 150–400/hour for qualified teachers. Smartious: USD $8–15/hour (BWP 110–200 approx).'},
      {h:'Best online platforms for Botswana',p:'Smartious (strong African exam board familiarity), GradeSmart (SA/BGCSE), Cambridge Home School (IGCSE/A-Level), international platforms like Preply. Local platforms are growing but still relatively new.'},
      {h:'BGCSE vs IGCSE — which tutoring to pick',p:'BGCSE is the Botswana national exam. IGCSE is Cambridge International. Tutors must specialise in one — the exam conventions and marking differ. For university abroad, IGCSE + A-Level is the cleaner path.'},
      {h:'Internet and power considerations',p:'Gaborone and Francistown have reliable fibre. Rural Botswana internet is improving but still limits video tutoring in some areas. A 3G/4G mobile connection is acceptable for one-on-one video tutoring.'},
    ],
    faqs:[
      {q:'Is online tutoring legal in Botswana?',a:'Yes. No restriction on families hiring foreign tutors online.'},
      {q:'Can online tutoring help BGCSE students?',a:'Yes — especially for Mathematics and sciences where specialist teachers are scarce locally.'},
      {q:'How do I pay international tutors from Botswana?',a:'Most platforms accept Visa/Mastercard. Smartious also accepts Paystack which processes Botswana cards.'},
    ],
    conclusion:'Botswana students in 2026 have growing access to quality online tutoring at reasonable prices. Start with a clear subject priority, pick a specialist platform, and commit to at least 8 sessions before reviewing progress. Smartious offers Cambridge-trained tutors for Botswana families from USD $8/hour.',
  },
  
  'private-tutors-botswana-high-school': {
    cat:'tuition', country:'botswana',
    img:'linear-gradient(135deg,#1A140A,#3D3014)', splash:'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=1000&q=70',
    t:'Best Private Tutors in Botswana for High School Students',
    date:'March 2026 · 6 min read',
    author:'Dr. David Maina', role:'STEM Specialist',
    intro:'Botswana high school students preparing for BGCSE or IGCSE benefit substantially from private tutoring. Identifying quality tutors in a small market is the challenge. Here is the approach in 2026.',
    sections:[
      {h:'Where good Botswana tutors come from',p:'University of Botswana final-year and graduate students (strong for foundational subjects). Retired government teachers with BGCSE experience. Mission school teachers moonlighting. Specialist centres in Gaborone (limited but growing).'},
      {h:'Online alternative fills the gap',p:'Where local specialist tutors are scarce, online international tutors fill the gap completely. Cambridge-trained tutors from the UK, SA, and Kenya are accessible from any Botswana city with reliable internet.'},
      {h:'Pricing in 2026 pula',p:'University-student tutors: BWP 80–180/hour. Qualified teachers: BWP 150–300/hour. Specialist exam tutors: BWP 250–500/hour. Online international (Smartious): USD $8–15/hour.'},
      {h:'What to verify before hiring',p:'Bachelor\'s degree certificate. Recent teaching experience at BGCSE or IGCSE level. Two references from other Gaborone or Francistown families. A 60-minute trial session. Written agreement on rate, schedule, and cancellation.'},
      {h:'Common subjects tutored',p:'Mathematics (BGCSE and IGCSE), Physical Science, Biology, English Language, Setswana (locally only), Development Studies, Accounting. Computer Studies is growing as a demand area.'},
      {h:'When group tutoring makes sense',p:'Group tutoring of 3–5 students works well in Gaborone where several students from the same class need the same subject support. Usually costs BWP 80–150 per student per hour. Good value for routine reinforcement; less ideal for targeted exam prep.'},
    ],
    faqs:[
      {q:'Are there tutor agencies in Botswana?',a:'A few in Gaborone. Quality varies. Online international platforms offer better vetting for most subjects.'},
      {q:'Can I get a tutor who knows both BGCSE and IGCSE?',a:'Some can teach both but usually specialise in one. For exam-focused preparation, prefer a specialist.'},
      {q:'Is in-person or online better for Botswana students?',a:'For Grade 9+ and reliable internet, online is equal or better. For primary students, in-person usually wins.'},
    ],
    conclusion:'Botswana\'s tutor market is smaller than SA or Kenya but growing. Combine local in-person tutors for routine support with online international specialists for exam preparation. This hybrid approach gives best value in Gaborone, Francistown, and other Botswana cities.',
  },
  
  'improve-academic-botswana': {
    cat:'tuition', country:'botswana',
    img:'linear-gradient(135deg,#0A1A14,#1A3D2E)', splash:'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=1000&q=70',
    t:'How to Improve Academic Performance in Botswana (2026)',
    date:'February 2026 · 6 min read',
    author:'Mercy Akinyi', role:'Academic Coordinator',
    intro:'Botswana has solid school infrastructure but individual academic outcomes depend heavily on home habits and tutoring support. Here is the evidence-based framework for lifting grades in 2026.',
    sections:[
      {h:'Start with an honest diagnosis',p:'Have the student attempt a past BGCSE paper cold under timed conditions. Mark against the official BEC scheme. This tells you exactly what is weak. Parents often guess wrong about their child\'s actual weak topics.'},
      {h:'Fix foundations first',p:'Most Form 5 BGCSE underperformance traces to Form 3–4 content gaps. Rebuild from wherever the gap starts. Khan Academy (free) plus one Smartious tutor session per week is usually enough for foundation rebuild.'},
      {h:'Daily practice beats weekly cram',p:'45 minutes daily on the weakest subject outperforms 3 hours on Saturday. Brain chemistry favours distributed practice. Even 30 minutes daily moves the needle.'},
      {h:'Past papers relentlessly',p:'BGCSE past papers are freely available from BEC. Work through every paper from 2018–2024 under timed conditions. This is the single most effective BGCSE preparation activity.'},
      {h:'Fix technique, not just content',p:'Many Botswana students know the content but lose marks to technique: time management, command-word interpretation, structured answer writing. A good tutor fixes this explicitly.'},
      {h:'Review and adjust monthly',p:'Track monthly metrics: homework grades, mock test scores, confidence self-ratings. If no measurable improvement after 3 months, change strategy or tutor.'},
    ],
    faqs:[
      {q:'Can a weak student reach BGCSE A grades?',a:'From a starting point of D or below, rarely within one year. From C to A, realistic with 12 months of structured work.'},
      {q:'How many tutors does my child need?',a:'One or two specialists focused on the weakest subjects. Too many tutors dilute attention and confuse the child.'},
      {q:'Does the school really matter that much?',a:'School teaching quality is important but home habits and external tutoring can override a mediocre school for motivated students.'},
    ],
    conclusion:'Improving academic performance in Botswana is almost entirely about habit and structure, not innate ability. Start with diagnosis, fix foundations, use past papers, review monthly. Most students can lift one full grade per year with this approach.',
  },
  
  'benefits-online-learning-botswana': {
    cat:'ai', country:'botswana',
    img:'linear-gradient(135deg,#141A0A,#323D14)', splash:'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=1000&q=70',
    t:'Benefits of Online Learning for Students in Botswana (2026)',
    date:'February 2026 · 5 min read',
    author:'Alfred Ouko', role:'Founder & CEO',
    intro:'Botswana\'s rural geography and urban concentration create specific educational opportunities for online learning. Here are the six biggest benefits for Botswana families in 2026.',
    sections:[
      {h:'Geographic reach',p:'Students in Kasane, Maun, Ghanzi, and other remote towns can access the same quality of teaching as Gaborone families via online tutoring. This levels the playing field dramatically.'},
      {h:'Access to specialists',p:'A single A-Level Physics specialist can now serve students across the entire country. Smaller Botswana towns previously had no access to this level of specialist; online closes that gap.'},
      {h:'Recording for review',p:'Every online lesson can be recorded. Students preparing for BGCSE or IGCSE review complex topics multiple times before the exam. Classroom teaching does not offer this.'},
      {h:'Cost efficiency',p:'Online tutoring from international platforms is often cheaper than travelling to specialist centres in Gaborone or hiring the rare local specialist. Smartious at USD $8–15/hour is often less than local tutors.'},
      {h:'Time savings',p:'No travel time to after-school tutoring centres. Botswana students save 3–5 hours per week that can be redirected to study or family life.'},
      {h:'AI-assisted learning',p:'Botswana students now have free or low-cost access to Khan Academy, Smartious Mshauri, and other AI tutors that diagnose weaknesses and generate targeted practice questions.'},
    ],
    faqs:[
      {q:'Is Botswana internet reliable enough?',a:'In Gaborone and Francistown, yes. In smaller towns, mobile data is often sufficient for video tutoring.'},
      {q:'Does online learning work for young children?',a:'Under age 8, limited. Age 8+, increasingly yes with good structure. Teenage students benefit the most.'},
      {q:'Can online replace school entirely?',a:'For registered homeschool families yes. For most families, online should supplement school not replace it.'},
    ],
    conclusion:'Online learning is transforming Botswana education in 2026. Students in previously under-served areas now have access to world-class specialist teaching. The key is pairing online resources with consistent routine and measurable monthly progress.',
  },
  
  'homeschooling-botswana-parents': {
    cat:'homeschool', country:'botswana',
    img:'linear-gradient(135deg,#1A0F14,#3D222E)', splash:'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=1000&q=70',
    t:'Homeschooling in Botswana: What Parents Should Know (2026)',
    date:'January 2026 · 6 min read',
    author:'Jane Wanjiku', role:'Admissions Director',
    intro:'Homeschooling in Botswana is small but growing. Botswana law permits home education under Ministry of Basic Education guidance. Here is the 2026 practical guide.',
    sections:[
      {h:'Legal status',p:'Botswana\'s Education Act permits home schooling subject to Ministry of Basic Education approval. Parents apply with a proposed curriculum, space assessment, and parent qualifications. Approval is typically granted when plans are well-structured.'},
      {h:'Curriculum options',p:'Most Botswana homeschoolers pick either BGCSE-aligned curriculum (via Botswana Open University or similar), Cambridge IGCSE (Cambridge Home School, Smartious), or American K12 programmes. The choice depends on intended university pathway.'},
      {h:'Why families choose to homeschool',p:'Remote locations without accessible schools (cattle posts, mining settlements). Health or special needs requirements. International family schedules. Religious preferences. Gifted children unchallenged by public schools.'},
      {h:'Cost in 2026 pula',p:'BGCSE curriculum via distance learning: BWP 1,500–3,500/month. Cambridge IGCSE online: BWP 3,500–6,500/month. American online: BWP 4,000–7,500/month. All significantly cheaper than Botswana private schools.'},
      {h:'Social layer for Botswana homeschoolers',p:'Small but active homeschool community in Gaborone. Facebook groups, church co-ops, and informal playgroups. Families in remote areas rely more on extended family and community church activities for socialisation.'},
      {h:'University pathway',p:'University of Botswana accepts BGCSE-qualified homeschool students directly. International universities prefer Cambridge IGCSE + A-Level qualifications. Both routes are achievable.'},
    ],
    faqs:[
      {q:'How long does Ministry approval take?',a:'Typically 4–8 weeks with complete application paperwork.'},
      {q:'Can parents with only secondary education homeschool?',a:'Yes, provided the curriculum plan is delivered via an accredited online provider with qualified teachers.'},
      {q:'Do homeschooled children sit BGCSE?',a:'Yes — registration through BEC as private candidates is routine.'},
    ],
    conclusion:'Botswana homeschooling is legally supported and increasingly accessible in 2026. Start with Ministry approval, pick a curriculum matched to your child\'s future, and engage with whatever local community is available. Online providers handle the teaching load.',
  },
  'homeschooling-kenya-2026': {
    cat:'homeschool',
    img:'linear-gradient(135deg,#0A1A08,#1F3D18)', splash:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&q=70',
    t:'How to Start Homeschooling in Kenya: The Complete 2026 Guide',
    date:'April 2026 · 14 min read',
    author:'Alfred Ouko', role:'Founder & CEO, Smartious Homeschool',
    intro:'Homeschool Kenya is one of the fastest-growing education movements in the country. In 2020, fewer than 400 families were formally homeschooling in Kenya. By the start of 2026, that figure is closer to 5,200 — a 13x increase in six years. If you are a parent in Nairobi, Mombasa, Kisumu or Eldoret considering homeschooling, this guide walks you through every step — the legal basis, curriculum choice, cost, and how Smartious homeschool Nairobi families typically begin.',
    sections:[
      {h:'Is homeschooling legal in Kenya?',p:'Yes. Homeschooling is legal in Kenya under the Basic Education Act, 2013, which recognises alternative forms of basic education provided the learner accesses quality education equivalent to what a registered school offers. There is no requirement to register as a homeschool with the Ministry of Education, but many families choose to register their home-based learning with a recognised provider for record-keeping, exam eligibility, and university applications. Smartious acts as this registered provider for our enrolled families, issuing enrolment certificates, progress reports, and predicted grades that are accepted by universities worldwide.'},
      {h:'Step 1 — Choose a curriculum that fits your child',p:'This is the single most important decision. The five realistic options for homeschooling Nairobi families are: (a) CBC — Kenya\'s Competency-Based Curriculum, useful if you might return to a Kenyan school; (b) Cambridge IGCSE — globally recognised, exam-focused, ideal for families who may move abroad; (c) Pearson Edexcel — similar to Cambridge but with slightly different assessment timelines; (d) British National Curriculum — year-by-year progression identical to UK schools; (e) American Curriculum — common in families linked to the US. At Smartious we offer all five. Most Nairobi families choose either CBC (for local continuity) or IGCSE (for international mobility).'},
      {h:'Step 2 — Decide on a learning model',p:'There are three practical homeschool Kenya models: (1) fully at home with parent as the primary educator — works if one parent has the time and academic confidence; (2) at home with a hired tutor — our most popular model, where a qualified teacher visits daily or joins via video for each subject; (3) blended at a learning centre — the child does 3 days at our Parklands centre with other homeschoolers and 2 days at home. The right model depends on your work schedule, your child\'s temperament, and your budget.'},
      {h:'Step 3 — Register with a provider',p:'Even if Kenyan law does not require it, registering with an accredited homeschool provider gives your child access to proper exam sittings, predicted grades for university, and a protected academic record. Universities in the UK, US, Canada, and Australia all expect to see an enrolment certificate from a recognised provider. Smartious issues these free for all enrolled students.'},
      {h:'Step 4 — Set up a learning environment at home',p:'You do not need a dedicated classroom, but you do need a distraction-free study area with a desk, good lighting, stationery, a laptop or tablet, and reliable internet. If your child is doing IGCSE or A-Level, you will also need access to past papers — we provide these for our enrolled families along with official Cambridge marking schemes.'},
      {h:'Step 5 — Structure the daily timetable',p:'Homeschooled children learn far more efficiently than school-based children because there is no downtime, no commute, and no 40-student classrooms to manage. A typical homeschool Nairobi day runs 9am–1pm with two subjects per day, one hour each, plus project time and self-study. Afternoons are for sports, music, and social activities. Most homeschooled students complete a full academic year of work in 6–7 months of directed study.'},
      {h:'Step 6 — Build a social life deliberately',p:'The biggest myth about homeschooling is social isolation. The reality: homeschooled children in Kenya have more time for social activities than school-based ones, they just have to be structured. Our Parklands learning centre runs weekly "Campus Days" where our homeschooled students meet for group science labs, debate club, music practice, and lunch together. We also coordinate with swimming clubs, martial arts dojos, and church youth groups.'},
      {h:'Step 7 — Sit national and international exams',p:'KCPE, KCSE, IGCSE, A-Level, and IB exams can all be sat by homeschooled students in Kenya. KCSE is registered through a KNEC-recognised centre (we partner with several in Nairobi). IGCSE and A-Level are registered through British Council Kenya or approved Cambridge centres. Registration deadlines are strict — 6–8 months before the exam — so plan early.'},
      {h:'Step 8 — Apply to university',p:'Homeschooled Kenyan students applied to and were admitted to University of Nairobi, Strathmore, USIU, University of Manchester, UCL, University of Toronto, and NYU Abu Dhabi in the 2025 admissions cycle. Predicted grades come from your registered provider. UCAS (UK) and Common App (US) both accept homeschool applications when paired with recognised exam results.'},
    ],
    conclusion:'Homeschooling in Kenya is no longer experimental — it is a mainstream choice for families who want academic excellence, curriculum flexibility, and the ability to move countries without disruption. If you want help choosing a curriculum or model for your child, book a free consultation with our admissions team. We have supported over 2,400 homeschool Kenya students across Nairobi and 12 other countries since 2022.',
    featured:false,
  },
  'cbc-vs-cambridge-kenya': {
    cat:'homeschool',
    img:'linear-gradient(135deg,#1A0F05,#3D2412)', splash:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&q=70',
    t:'Best Homeschooling Curriculum in Kenya: CBC vs Cambridge (2026 Comparison)',
    date:'April 2026 · 11 min read',
    author:'Dr. Susan Kariuki', role:'Head of Curriculum, Smartious',
    intro:'The most common question we receive from new homeschool Kenya families is: should my child do CBC or Cambridge? There is no single correct answer — the right choice depends on where you see your child\'s future. After six years advising hundreds of Nairobi families on this decision, here is the honest, side-by-side comparison you need.',
    sections:[
      {h:'What is CBC?',p:'The Competency-Based Curriculum (CBC) is Kenya\'s national curriculum, rolled out progressively since 2017. It focuses on seven core competencies: communication, critical thinking, creativity, citizenship, digital literacy, learning-to-learn, and self-efficacy. Assessment is continuous rather than purely exam-based. CBC culminates in the Kenya Primary School Education Assessment (KPSEA) at Grade 6, the Kenya Junior School Education Assessment (KJSEA) at Grade 9, and the Kenya Certificate of Secondary Education (KCSE) at Grade 12.'},
      {h:'What is Cambridge?',p:'The Cambridge curriculum refers to the Cambridge Assessment International Education syllabus, developed in the UK and offered in 160 countries. In homeschool Kenya families, it typically means Cambridge Primary (ages 5–11), Cambridge Lower Secondary (ages 11–14), IGCSE (ages 14–16), and A-Level (ages 16–18). Cambridge is assessment-heavy, with exams taken at each stage that produce internationally recognised grades.'},
      {h:'Recognition — where can your child go next?',p:'CBC is fully recognised in Kenya and across the East African Community (Uganda, Tanzania, Rwanda, Burundi, South Sudan). KCSE grades are accepted by all Kenyan universities. However, outside East Africa, CBC recognition is still developing — most UK and US universities require additional qualifications. Cambridge IGCSE and A-Level are universally recognised by every major university globally, including the Ivy League, Oxbridge, the Russell Group, and the best Australian and Canadian universities.'},
      {h:'Cost comparison for homeschool Nairobi families',p:'CBC homeschool in Kenya costs between KES 25,000 and KES 55,000 per month depending on grade and delivery model. Cambridge IGCSE homeschool costs between KES 55,000 and KES 75,000 per month. The Cambridge premium reflects: higher-qualified subject specialist teachers, Cambridge exam fees (roughly KES 8,500 per subject), and licensed textbooks and past papers.'},
      {h:'Academic rigour',p:'Both curricula are academically rigorous, but in different ways. CBC emphasises broad competencies, project-based learning, and continuous assessment. Cambridge emphasises depth of knowledge, exam technique, and written analysis. A CBC student tends to be more adaptable; a Cambridge student tends to be a stronger exam performer. Neither is "better" — they optimise for different outcomes.'},
      {h:'Teaching resources',p:'CBC resources in Kenya are growing fast — KICD approves textbooks from publishers like Longhorn, Oxford University Press East Africa, and Moran. Cambridge has an enormous global resource base: 25+ years of past papers, examiner reports, official marking schemes, and third-party study guides (Hodder, CGP, Collins). For homeschoolers, Cambridge is marginally easier to self-teach because the resources are so abundant and consistent.'},
      {h:'Which is better for university abroad?',p:'If your child wants to study at a UK, US, Canadian, Australian, or European university, Cambridge is the clearer path. Universities outside East Africa understand IGCSE and A-Level grades immediately — no translation or equivalency certificate needed. CBC graduates applying abroad typically need to either do an IUFP (International University Foundation Programme) or retake IGCSE/A-Level at 17–18.'},
      {h:'Which is better for Kenyan university?',p:'CBC and KCSE grades are the standard route to the University of Nairobi, Kenyatta, Strathmore, USIU, and other Kenyan institutions. Cambridge A-Level grades are also accepted by all Kenyan universities with published equivalency tables (typically A-Level A* = A grade at KCSE).'},
      {h:'Which produces stronger students in practice?',p:'In our experience across both curricula, the strongest students are those whose curriculum matches their temperament and future plans. A child who loves continuous project work and will stay in Kenya should do CBC. A child who is exam-focused and has international ambitions should do Cambridge. Neither wins on raw ability.'},
      {h:'Can a child switch?',p:'Yes. We regularly see students switch between curricula — usually from CBC to Cambridge around Grade 7 or 8 when the family decides to pursue international university options. The transition takes about 3 months of intensive transition tutoring to close gaps in Cambridge-specific content. We support these switches regularly at Smartious.'},
    ],
    conclusion:'For a homeschool Nairobi family committed to international education, Cambridge is the stronger long-term investment. For a family staying in Kenya or East Africa and wanting local continuity, CBC is excellent and more affordable. The wrong answer is either picking based on prestige alone or switching curricula repeatedly. Pick once, commit, and let your child build mastery.',
    featured:false,
  },
  'cost-homeschooling-nairobi': {
    cat:'homeschool',
    img:'linear-gradient(135deg,#1A0A14,#3D1E2D)', splash:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&q=70',
    t:'The Real Cost of Homeschooling in Nairobi (2026 Breakdown)',
    date:'April 2026 · 10 min read',
    author:'Alfred Ouko', role:'Founder & CEO',
    intro:'How much does homeschooling Nairobi cost in 2026? Short answer: anywhere from KES 25,000 to KES 120,000 per month depending on curriculum, tutor model, and whether you use a learning centre. Long answer below. This breakdown reflects real Smartious invoices from the first quarter of 2026.',
    sections:[
      {h:'Primary school (Grades 1–6)',p:'Homeschool Kenya primary students with Smartious pay KES 25,000–KES 52,000 per month. The lower end covers online-only delivery with a class teacher via video. The upper end covers a dedicated class teacher visiting your Nairobi home three times a week plus full curriculum materials. CBC is at the lower end; British Curriculum and American Curriculum are at the upper end because they require imported textbooks.'},
      {h:'Secondary school (Grade 7–11, IGCSE)',p:'Homeschool Nairobi IGCSE students pay KES 55,000–KES 75,000 per month. This rises compared to primary because IGCSE requires subject specialists — one teacher for maths, another for physics, another for English — and each needs to be qualified at the secondary level. Most IGCSE students study 7–9 subjects. The cost includes mock exam marking and past paper access.'},
      {h:'A-Level / IB Diploma (Grade 12–13)',p:'At this stage homeschool Nairobi families pay KES 67,000–KES 90,000 per month. The premium reflects two things: A-Level and IB teachers are the most qualified in the school, often with doctorates, and the workload per student rises dramatically in the final two years — multiple mock exams, Extended Essay supervision (IB), UCAS/Common App support, and university counselling.'},
      {h:'IUFP — University Foundation',p:'IUFP is a one-year programme preparing students for direct entry into Year 1 of a UK, US, Australian or European university. At Smartious, the IUFP programme fee is USD $5,480 for the full year (roughly KES 712,000 at 2026 exchange rates). That covers all teaching, assessments, university application support, and up to 5 UCAS applications. Compared to paying international student fees of $30,000/year in the UK, IUFP is an extremely cost-efficient bridge.'},
      {h:'Exam fees',p:'IGCSE exams cost KES 8,000–KES 11,000 per subject at British Council Kenya or Cambridge-authorised centres. A typical student sitting 8 subjects pays KES 64,000–KES 88,000 once a year. A-Level is similar. KCSE is much cheaper — under KES 15,000 for the full slate. IB exams are about $130 per subject (KES 17,000).'},
      {h:'One-off fees',p:'Most homeschool Nairobi providers charge a one-time placement assessment fee — at Smartious this is $15 (KES 1,950), counts towards your first month of tuition if you enrol, and is not refundable once the test has been served. Some providers also charge a registration fee of KES 5,000–15,000; we do not.'},
      {h:'Hidden costs — what catches new families',p:'The costs that surprise new homeschool Kenya families are: (1) internet upgrade — you need at least 25 Mbps reliable fibre for live video classes, roughly KES 4,500/month extra; (2) textbooks and stationery — KES 15,000–30,000 at the start of each academic year, less if your provider supplies materials; (3) printer and consumables — KES 8,000–15,000 one-time plus ink; (4) laptop or tablet — KES 35,000 for a basic Chromebook; (5) mock exam fees at some centres — KES 3,000–5,000 per mock. These add up to roughly KES 90,000 in the first year.'},
      {h:'What about a private tutor Nairobi instead of a full provider?',p:'Some families hire a private tutor Nairobi directly rather than enrolling with a provider. Typical Nairobi private tutors charge KES 1,500–4,000 per hour depending on experience. A full homeschool load with a private tutor (15 hours/week) runs KES 90,000–240,000 per month — usually more expensive than going through a provider and without the structured curriculum, progress reports, exam registration, or university support. We typically recommend providers for full homeschool and private tutors only for top-up support.'},
      {h:'Comparing to private schools',p:'For context: top private international schools in Nairobi charge KES 200,000–KES 600,000 per month (KES 2–7 million per year). Homeschool Nairobi with Smartious delivers IGCSE or Cambridge for roughly 25–35% of the cost of an equivalent international school, often with more direct attention per child. That is the core value proposition.'},
      {h:'Payment structure',p:'At Smartious, families pay monthly by default. We also offer termly (5% discount) and annual (12% discount) payment plans. All payments are via Paystack — M-Pesa, card, bank transfer, and Apple Pay. Families moving in mid-year are prorated to the nearest week.'},
    ],
    conclusion:'Homeschooling Nairobi is substantially cheaper than private international schools and — for most families — delivers better academic outcomes per shilling spent. The key is being realistic about the total first-year investment, not just the monthly fee. Budget KES 800,000–1,200,000 for a full year of IGCSE homeschool including exams, materials, and tech. Compared to KES 3–6 million at a top private school, the value is clear.',
    featured:false,
  },
  'igcse-vs-cbc-kenya': {
    cat:'igcse',
    img:'linear-gradient(135deg,#0A1530,#1D2A5C)', splash:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&q=70',
    t:'IGCSE vs CBC — Which is Better for Your Child in 2026?',
    date:'April 2026 · 9 min read',
    author:'Dr. David Maina', role:'IGCSE tuition Kenya specialist, Smartious',
    intro:'Parents considering IGCSE tuition Kenya usually arrive with one urgent question: is IGCSE better than CBC? The honest answer is that they serve different goals. After teaching both curricula for over a decade, here is how I help families decide between them.',
    sections:[
      {h:'The fundamental difference',p:'CBC is Kenya\'s national curriculum, aligned to Kenyan employment markets and local universities. IGCSE is an international curriculum from Cambridge Assessment International Education, aligned to global university admissions. CBC is competency-based; IGCSE is exam-based. That single distinction shapes everything else.'},
      {h:'Assessment — exams vs continuous',p:'CBC uses continuous assessment throughout each grade with national benchmarks at KPSEA (Grade 6), KJSEA (Grade 9), and KCSE (Grade 12). Projects, portfolios, and classwork all count. IGCSE is assessed almost entirely through written exams at the end of a 2-year course. A child who performs better under sustained effort might prefer CBC; a child who peaks under exam pressure might prefer IGCSE.'},
      {h:'Content depth vs breadth',p:'CBC is broader — it teaches Swahili, Kenyan history and geography, agriculture, home science, and integrated science alongside core academic subjects. IGCSE is narrower but deeper — each subject goes into more detailed analysis, with more challenging exam questions especially in Extended-tier papers.'},
      {h:'Recognition abroad',p:'This is where IGCSE wins decisively. Every major international university knows what an IGCSE is. A student with 8 IGCSE grades of A–C can apply directly to UK sixth forms, US high schools for final year, Canadian grade 12, or progress to A-Level anywhere. A KCSE graduate applying to Oxford must typically do a foundation year first. For homeschool Kenya families with international ambitions, this is the deciding factor.'},
      {h:'Recognition at home',p:'CBC and KCSE are the default route to Kenyan universities — University of Nairobi, Kenyatta, Strathmore, Moi, JKUAT. IGCSE grades are also accepted by all these institutions using published equivalency tables, but the process is slightly more administrative. If your child will stay in Kenya for university and career, CBC is the cleaner path.'},
      {h:'Difficulty — which is harder?',p:'Neither is uniformly harder. IGCSE mathematics and sciences are harder than CBC at the same age because they go into more rigorous detail. CBC\'s creative and life-skills subjects are harder for academic-focused students because they require sustained project work. A diligent student can score top grades in either; a struggling student will struggle in both.'},
      {h:'Cost difference',p:'IGCSE tuition Kenya is more expensive than CBC tuition — roughly KES 55,000–75,000/month vs KES 25,000–55,000/month for homeschoolers. The gap reflects higher teacher qualifications, licensed Cambridge materials, and exam fees at international centres (roughly KES 8,500 per IGCSE subject vs KES 1,800 per KCSE subject). For a family committed to international university, the IGCSE premium is worth it. For a family staying local, CBC is the better value.'},
      {h:'Can a child do both?',p:'Yes, and some ambitious families do. The child sits KCSE in December of Grade 12 and IGCSE the following May/June. This doubles the workload in the final year and should only be attempted by strong academic students with a specific reason. Most families pick one and stick with it.'},
      {h:'The switch point',p:'If you are considering switching from CBC to IGCSE, the optimal point is at Grade 8 or 9. Before Grade 8 the curricula are broadly similar. After Grade 10 switching becomes disruptive because the child has invested in CBC\'s assessment structure. We regularly transition students at Grade 8 or 9 and the adjustment takes about 3 months of targeted support.'},
    ],
    conclusion:'IGCSE is better if your family\'s future is international. CBC is better if your family\'s future is Kenyan. Both produce excellent students when taught well. The wrong answer is to switch multiple times or to pick based on prestige alone. If you need help deciding for your specific child, book a free consultation and we will assess their academic profile and help you choose.',
    featured:false,
  },
  'top-tuition-services-nairobi': {
    cat:'tuition',
    img:'linear-gradient(135deg,#0A1A1F,#1B3942)', splash:'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1000&q=70',
    t:'How to Choose the Best Private Tutor Nairobi — 2026 Buyer\'s Guide',
    date:'April 2026 · 8 min read',
    author:'Mercy Akinyi', role:'Academic Coordinator, Smartious',
    intro:'Looking for a private tutor Nairobi for your child is harder than it should be. There are thousands of tutors listed online, most with no verification, many without formal training, and prices ranging from KES 500 to KES 5,000 per hour with little correlation to quality. This guide will help you evaluate tuition services in Nairobi properly.',
    sections:[
      {h:'Why parents look for a private tutor Nairobi',p:'The three most common reasons we hear: (1) my child is falling behind in one subject — usually maths, physics, or chemistry; (2) my child is preparing for a major exam — KCSE, IGCSE, SAT, or a university entrance test; (3) my child is homeschooling and needs a subject specialist the parent cannot provide. Each reason requires a different kind of tutor.'},
      {h:'Types of tuition services in Nairobi',p:'The Nairobi tuition market breaks into four tiers: (a) individual freelance tutors — mostly university students, KES 500–1,500/hr, variable quality; (b) experienced independent tutors — ex-teachers, KES 1,500–3,000/hr, good for exam prep; (c) tutoring agencies — KES 2,000–4,000/hr, handle matching and quality control; (d) full homeschool providers like Smartious — KES 55,000+/month, integrated curriculum not pay-per-hour. Which you pick depends on how much support your child needs.'},
      {h:'What to check before hiring',p:'Verify these five things before committing: (1) a Bachelor\'s degree in education or the subject being taught, not just "I got an A in maths in high school"; (2) at least 2 years of teaching experience at the relevant level; (3) a Certificate of Good Conduct from the DCI, no older than 12 months; (4) 2 references from previous families — actually call them; (5) a clear written agreement with hourly rate, cancellation policy, and payment terms. Tutors who object to any of these are not worth hiring.'},
      {h:'Red flags to avoid',p:'Avoid tutors who: ask for a full term\'s payment upfront; refuse to give references; cannot explain their teaching methodology in one minute; consistently cancel at short notice in the trial period; speak poorly of your child or previous students; or insist on being the only tutor your child sees (a good tutor welcomes collaboration with school teachers).'},
      {h:'Cost of private tutor Nairobi — 2026 rates',p:'Typical hourly rates in Nairobi for a tutor coming to your home: KES 1,000–1,500 for primary school subjects; KES 1,500–2,500 for secondary school CBC/KCSE; KES 2,000–3,500 for IGCSE, A-Level, and IB; KES 3,000–5,000 for specialist exam prep (SAT, BMAT, LNAT, medical school entrance). Online tutoring via video is roughly 30% cheaper than home visits.'},
      {h:'Smartious tuition — what we offer',p:'For tuition services in Nairobi, we run three formats: (1) online private tuition at $8/hour (KES 1,040) — video session with a qualified subject specialist, shared digital whiteboard, session recording emailed to the parent; (2) home-visit tuition in Nairobi at $12/hour (KES 1,560) — background-checked tutor visits your Nairobi home; (3) monthly bundle at $235/month (KES 30,500) for 20 hours — roughly half the standard hourly rate and covers a same-tutor-every-week arrangement with monthly progress reports.'},
      {h:'How many hours does a struggling child actually need?',p:'This depends on the gap. For a child who is one grade level behind in maths, budget 2 hours per week for 3 months. For IGCSE tuition Kenya exam prep in the final year, budget 2–3 hours per week per subject for 9 months. For an A-Level student targeting top grades, 4–5 hours per week per subject is not excessive. For a homeschooled child doing full syllabus coverage, 15–20 hours a week total across all subjects.'},
      {h:'Online vs in-person — which works better?',p:'In our data, online tutoring works equally well for students in Form 2 and above, and for any child who is self-motivated. In-person is measurably better for younger primary students, for children with ADHD or concentration challenges, and for any child who is actively avoiding work when left alone. If in doubt, do a 4-session trial in both formats and see which format produces more completed homework.'},
    ],
    conclusion:'The best private tutor Nairobi for your child is the one who matches your child\'s level, tests before teaching, writes a clear learning plan, and adjusts based on weekly results. Do not pick by price alone. Do not pick by prestige of previous schools attended. Pick by the tutor\'s ability to make your specific child better, week by week. If you want us to match you to the right Smartious tutor, book a free consultation and we will assess your child in 30 minutes.',
    featured:false,
  },
  'igcse-math-2026': {
    cat:'igcse',
    img:'linear-gradient(135deg,#1A0509,#4A1020)', splash:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&q=70',
    t:'How to Ace IGCSE Mathematics: A Complete 2026 Guide',
    date:'March 2026 · 12 min read',
    author:'Dr. David Maina', role:'IGCSE Mathematics Specialist',
    intro:'IGCSE Mathematics is often viewed as the most decisive subject in a student\'s academic profile. A strong grade opens doors to science pathways, engineering degrees, top universities, and scholarship committees. A weak grade quietly closes them. The good news is that an A* in IGCSE Maths is not about being naturally gifted — it is about knowing the syllabus, drilling the right questions, and understanding how the examiners think.',
    sections:[
      {h:'Understand the two papers',p:'Cambridge IGCSE Maths 0580 has four papers at Extended level, but most Kenyan, Nigerian, and international students sit Papers 2 and 4. Paper 2 is 90 minutes of short-answer questions worth 70 marks. Paper 4 is 150 minutes of structured, multi-part questions worth 130 marks. Paper 2 rewards speed and accuracy on core skills; Paper 4 rewards the ability to combine topics. Know which papers you are sitting and work backwards from there.'},
      {h:'Master the six topic groups',p:'The syllabus is split into Number, Algebra, Geometry, Mensuration, Trigonometry, and Statistics & Probability. Students who score A* consistently do so because they have no weak topic. A weak topic in Maths is fatal — you cannot hide it across a two-and-a-half-hour paper. Identify your weakest area first and start there, even if it feels harder.'},
      {h:'Past papers are the only shortcut',p:'The single highest-correlation activity with an A* grade is completing past papers under timed conditions. Work through every paper from 2015 to 2025, marking yourself against the official mark scheme. The examiners recycle question types — they have a finite bank. By the time you have done 30 papers, almost nothing in the actual exam will surprise you.'},
      {h:'Learn to read the question',p:'Half of lost marks in IGCSE Maths are from misreading the question, not from not knowing the maths. "Find" vs "show that" vs "explain" vs "estimate" — each demands a different kind of answer. Underline command verbs in every question before you start writing.'},
      {h:'Write your working',p:'Even when the final answer is wrong, you can earn method marks. Students who show no working lose access to those method marks entirely. Train yourself to write the formula, substitute numbers, and then compute — always in that order.'},
      {h:'Calculator discipline',p:'Use a calculator you are genuinely comfortable with — ideally the Casio fx-991EX or fx-85GT. Do not buy a new calculator in the week before the exam. Know the SHIFT and ALPHA functions, the memory recall, and the fraction-to-decimal toggle. Every second counts in Paper 2.'},
      {h:'The Mshauri AI advantage',p:'At Smartious, our students have access to Mshauri, our AI tutor built specifically for African exam boards. Mshauri does not just give answers — it asks Socratic questions that force the student to identify their own misconception. On average, students who use Mshauri for 30 minutes a day for three months improve their mock exam grades by one full letter.'},
      {h:'Final 30 days',p:'In the last month before the exam, stop learning new material. Spend 80% of your time on past papers, 15% reviewing your weakest topic, and 5% on sleep, nutrition, and exam-day logistics. Students who cram new topics in the final week almost always underperform.'},
    ],
    conclusion:'An A* in IGCSE Maths is earned through systematic preparation, not inherited through talent. If you need structure, mock marking, and a teacher who has put hundreds of students through this paper, book a free consultation with our admissions team and we will build you a 12-week plan.',
    featured:true,
  },
  'homeschool-expat': {
    cat:'homeschool',
    img:'linear-gradient(135deg,#0D1525,#1B3060)', splash:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&q=70',
    t:'Homeschooling as an Expat Family: The Complete 2026 Guide',
    date:'February 2026 · 9 min read',
    author:'Jane Wanjiku', role:'Smartious Admissions Director',
    intro:'Families living outside their home country face a unique homeschooling challenge: curriculum continuity across borders, exam registration from anywhere, and building a social life for children without a physical school community. After six years of supporting families in Kenya, the UAE, the UK, Canada, and the US, we have distilled what actually works.',
    sections:[
      {h:'Pick a curriculum that travels',p:'Cambridge IGCSE, Pearson Edexcel, and the IB Diploma are recognised by universities worldwide. A child who finishes IGCSE in Dubai can sit the same exam in Nairobi or London next year without losing progress. Locked national curricula — like Kenya\'s CBC or the American Common Core — do not travel as well. If your family moves every 2 to 4 years, go international from day one.'},
      {h:'Register early for exams',p:'Expat families often discover too late that exam registration deadlines are 6 to 8 months before the exam. Cambridge exam centres in Dubai, Nairobi, and London fill up by October for the May/June session. Register your child with a recognised exam centre as soon as you know your location.'},
      {h:'Build the social layer deliberately',p:'The biggest criticism of homeschooling is social isolation. It does not have to be that way. Use local co-ops, sports clubs, music schools, and religious communities. Our Parklands, Nairobi learning centre runs a weekly "Campus Day" where homeschoolers meet for group science, debate, and lunch.'},
      {h:'Time-zone-aware tutoring',p:'If you are in the UAE and want a UK-trained A-Level teacher, you will need a tutor who can teach outside their local school hours. At Smartious we have tutors across three continents specifically to match global families to subject specialists regardless of time zone.'},
      {h:'Legal requirements differ by country',p:'Some countries require homeschool registration. Germany bans homeschooling outright — expat families there must enrol at an international school or an online school that provides a legal enrolment certificate. Check before you move. We provide enrolment documentation to families in Germany, France, and the UAE when needed.'},
      {h:'University applications from anywhere',p:'An expat homeschooler applying to UK universities needs predicted grades from an accredited centre, a UCAS reference from a registered educator, and a personal statement that reflects real academic engagement. We support our families through UCAS and the Common App every year.'},
    ],
    conclusion:'Homeschooling as an expat family is harder than picking a good school in your home country, but it is also more flexible, more academically focused, and more resilient to relocations. We have 340+ students in 12 countries doing exactly this.',
  },
  'meet-mshauri': {
    cat:'ai',
    img:'linear-gradient(135deg,#0D1A0D,#1A3D1A)', splash:'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000&q=70',
    t:'Meet Mshauri: The AI Tutor Built for African Students',
    date:'January 2026 · 7 min read',
    author:'Alfred Ouko', role:'Founder & CEO',
    intro:'Most AI tutors on the market today were trained on American exam boards, using American pedagogy, and priced in American dollars. They do not know what CBC is. They do not recognise KCSE past papers. They stumble over Swahili terms. We built Mshauri to be different.',
    sections:[
      {h:'Why "Mshauri"?',p:'Mshauri is Swahili for "advisor" or "counsellor" — the word a student uses when they need guidance, not lecturing. That spirit is the core of how the tutor responds: it asks before it tells, it listens before it corrects, and it treats the student as a capable learner who just needs the right question.'},
      {h:'Socratic by default',p:'A typical AI chatbot, when asked "What is the hypotenuse of a 3-4 triangle?", will answer "5" and move on. Mshauri answers: "Before I tell you, can you draw the triangle? Good. What is the name of the longest side?" The goal is to leave the student able to solve the next question on their own — not to produce an answer they will forget in an hour.'},
      {h:'Exam-aware',p:'Mshauri has been trained on the last 10 years of Cambridge, Edexcel, IB, and KCSE past papers. It knows which topics carry the most marks, which years had the hardest Paper 2, and which subtopics are repeated every sitting. When you ask it to help with a topic, it will often suggest the specific past paper question to practice on.'},
      {h:'Swahili-aware, multilingual',p:'Students can code-switch freely. Mshauri responds fluently in English, Swahili, and Sheng, and will translate any concept into either language on request. This matters for KCSE biology and geography, where technical Swahili vocabulary is part of the exam.'},
      {h:'Safety and supervision',p:'Parents receive a weekly digest of what their child has studied, how long they have studied, and which topics Mshauri flagged as needing a human tutor\'s attention. We never show or store student chat content beyond what is needed for the digest. Mshauri is supervised software, not a free-running chatbot.'},
      {h:'Who has access?',p:'All Smartious students get Mshauri access as part of their package — Basic Online plans get 20 guided sessions a month, Premium and above get unlimited access. It is not sold separately, because it only works when paired with a real human tutor who can intervene when the AI hits its limits.'},
    ],
    conclusion:'Mshauri is not a replacement for a great teacher. It is the thing that lets a great teacher support 30 students instead of 3.',
  },
  'igcse-vs-ib': {
    cat:'igcse',
    img:'linear-gradient(135deg,#1A0500,#3D1200)', splash:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&q=70',
    t:'IGCSE vs IB Diploma: Which is Right for Your Child?',
    date:'December 2025 · 8 min read',
    author:'Dr. Susan Kariuki', role:'Head of Curriculum',
    intro:'Parents ask us this every week: IGCSE or IB? The honest answer is that they are different qualifications serving different students at different stages. Here is how to choose.',
    sections:[
      {h:'What each one actually is',p:'IGCSE is a 2-year qualification taken at age 14–16, equivalent to the British GCSE but international. It is made of single-subject exams, and students typically sit 7–10 subjects. IB Diploma is a 2-year programme taken at age 16–18, equivalent to A-Levels. It requires 6 subjects plus three "core" components: Theory of Knowledge, the Extended Essay, and CAS (Creativity, Activity, Service). They are not alternatives to each other — many students do both.'},
      {h:'Workload and stress',p:'IB Diploma is substantially more demanding than A-Levels or IGCSEs. Students routinely work 30–40 hours a week including the core components. IGCSE is rigorous but more manageable because each subject is self-contained. If your child is already stretched thin at age 14, IGCSE is the wiser choice before considering IB later.'},
      {h:'University recognition',p:'Both are universally recognised. Ivy League and Oxbridge admissions officers know IB well and favour it for its breadth. UK universities accept both IGCSE (as part of entrance requirements) and A-Levels or IB as final qualifications. US universities accept either.'},
      {h:'Breadth vs depth',p:'IB forces breadth — every student studies a language, a humanities subject, a science, maths, and an arts or second humanities. A-Levels allow depth — a student can specialise in three sciences and nothing else. IGCSE sits in the middle: broad, but not as prescriptive as IB.'},
      {h:'Assessment style',p:'IGCSE is almost entirely terminal written exams. IB Diploma includes internal assessments (20–30% of each subject), an externally marked Extended Essay, and oral exams in languages. Students who struggle under exam pressure often do better at IB because the workload is distributed.'},
      {h:'Our recommendation',p:'Most Smartious families do IGCSE at age 14–16, then switch to either A-Levels or IB Diploma at 16–18 depending on the child\'s temperament and target university. The few who go IB from age 14 typically have parents who themselves did IB and know what they are committing to.'},
    ],
    conclusion:'Both qualifications will get your child into a top university. The difference is how the 2 years feel along the way. Book a free consultation and we will help you decide based on your child\'s profile.',
  },
  'uk-uni-guide': {
    cat:'university',
    img:'linear-gradient(135deg,#1A0020,#380040)', splash:'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1000&q=70',
    t:'Getting Into a UK University from Africa: The Complete UCAS Guide',
    date:'November 2025 · 11 min read',
    author:'Grace Njeri', role:'University Counsellor',
    intro:'Every year, thousands of African students apply to UK universities and get in. Many more would, if they understood how the UCAS system actually works. Here is the complete guide for families applying from Kenya, Nigeria, Uganda, Tanzania, South Africa, and anywhere else on the continent.',
    sections:[
      {h:'Deadlines — not what you think',p:'The UCAS deadline for most UK courses is 29 January of the year you want to start. Oxford, Cambridge, and all Medicine/Veterinary Medicine courses close on 15 October — four months earlier. If you are aiming at those, start writing your personal statement in July, not November.'},
      {h:'You pick 5 universities, ranked',p:'UCAS gives you five choices. Most applicants pick one aspirational, three realistic, and one safety net. You cannot apply to both Oxford and Cambridge in the same year — you must pick one. Ranking matters because if you get offers from all five, you must later nominate a Firm choice (your top pick) and an Insurance choice (your backup).'},
      {h:'Your personal statement',p:'This is 4,000 characters (roughly 600 words) of prose explaining why you want to study your chosen subject. Admissions officers read thousands of these. What sets apart a successful statement is specific evidence of academic engagement: books you have read outside the syllabus, research projects you initiated, relevant work experience. Generic statements about "always having loved" your subject get filtered out.'},
      {h:'Predicted grades',p:'Your school (or homeschool provider) gives UCAS your predicted final grades. Universities make conditional offers based on these — e.g., "A*AA at A-Level including A in Mathematics". If you are homeschooled, you need an accredited provider who can issue credible predicted grades. Smartious issues these for all our A-Level and IB students.'},
      {h:'The reference letter',p:'Alongside predicted grades, your school submits a reference letter. This is written by a teacher who knows you well, detailing your academic strengths, character, and why you would thrive at university. It is read but rarely decisive — unless it contradicts your personal statement.'},
      {h:'English language requirement',p:'If you are from a country where English is not the official medium of instruction, you may need IELTS or TOEFL. Kenya, Uganda, Nigeria, and Ghana students are usually exempt. Always check the specific university\'s requirements.'},
      {h:'Finances and scholarships',p:'UK universities charge international students £20,000–£45,000 per year in tuition. Living costs add another £12,000–£20,000. Full scholarships exist — Chevening (postgraduate), Commonwealth, Rhodes, and university-specific awards — but they are fiercely competitive. Most families use a combination of savings, partial scholarships, and education loans. We have a full webinar on financing.'},
      {h:'Visa timeline',p:'Once you accept an offer, the university issues a CAS (Confirmation of Acceptance for Studies). You use this to apply for a Student Visa from the UK High Commission. Plan for 6–8 weeks from CAS to visa in hand. Apply as soon as you get your final grades in August.'},
    ],
    conclusion:'UK universities remain the most popular destination for East African students, and the UCAS system — while intimidating at first — is genuinely meritocratic. Start early, write a specific personal statement, get realistic predicted grades, and you will have options.',
  },
  'homeschool-myths': {
    cat:'homeschool',
    img:'linear-gradient(135deg,#0A1400,#1A3000)', splash:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&q=70',
    t:'5 Myths About Homeschooling in Kenya — Debunked',
    date:'October 2025 · 6 min read',
    author:'Mercy Akinyi', role:'Smartious Academic Coordinator',
    intro:'Homeschooling in Kenya has grown roughly 12x since 2020, but public understanding of it has not caught up. Here are the five myths we hear most, and what the actual evidence shows.',
    sections:[
      {h:'Myth 1: "Homeschooled kids are socially awkward"',p:'The research on this is conclusive in the other direction. A 2020 Cardus study of 3,000 homeschooled adults found that they participated in civic life, volunteering, and close friendships at higher rates than their conventionally schooled peers. What matters is not the method of schooling, but whether parents deliberately build a social layer. Our Parklands centre runs three "Campus Days" a week specifically for this reason.'},
      {h:'Myth 2: "Homeschool is only for rich families"',p:'Homeschooling in Kenya costs between KES 15,000 and KES 70,000 per month depending on curriculum and delivery mode. A private international school in Nairobi charges KES 200,000–KES 600,000 per month. Homeschooling is typically one third the cost of an equivalent private school.'},
      {h:'Myth 3: "You need to be a trained teacher to homeschool"',p:'Parents do not teach every subject — specialist tutors do. Parents manage the learning environment, set expectations, and monitor progress. At Smartious, the dedicated class teacher handles content delivery; the parent handles routine and accountability. No teacher qualification required.'},
      {h:'Myth 4: "Homeschooled kids can\'t get into universities"',p:'Our 2024 and 2025 cohorts have placed students at the University of Nairobi, Strathmore, Manchester, UCL, University of Toronto, and NYU Abu Dhabi. UK and Canadian universities are completely comfortable with homeschool applications backed by IGCSE/A-Level results. US and European universities are equally open.'},
      {h:'Myth 5: "Homeschool is just parents teaching on the sofa"',p:'That was the 1990s version. Modern homeschooling — at least the Smartious version — involves structured timetables, qualified subject tutors, monthly assessments, parent portals, mock exams, and AI-supported learning. It is more structured than many private schools.'},
    ],
    conclusion:'If you are considering homeschooling, the best first step is to spend an afternoon at a working homeschool centre. We offer free tours of our Parklands campus every Saturday morning.',
  },
  'germany-study-abroad': {
    cat:'study-abroad',
    img:'linear-gradient(135deg,#08100A,#142018)', splash:'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1000&q=70',
    t:'Why Germany is Africa\'s Best-Kept Study Abroad Secret',
    date:'September 2025 · 9 min read',
    author:'Dr. Brian Otieno', role:'Study Abroad Advisor',
    intro:'Everyone talks about the UK, the US, and Australia. Very few East African families know that Germany offers tuition-free public university education — including to African students — at some of the world\'s top engineering and research institutions.',
    sections:[
      {h:'Tuition really is free',p:'Public universities in Germany — with the exception of Baden-Württemberg state — charge no tuition fees to either German or international students. Students pay a "semester contribution" of €150–€350, which includes a city transport pass. This is the actual cost. Not a scholarship. Not a discount. Free.'},
      {h:'Cost of living',p:'Students need to demonstrate they have €11,208 per year available (as of 2025) to cover living costs — this goes into a blocked account (Sperrkonto) at a German bank. Monthly living costs are €800–€1,100 depending on city. Munich is expensive; Leipzig, Dresden, and Aachen are affordable.'},
      {h:'English-taught programmes',p:'You do not need German to study in Germany at postgraduate level. Over 1,700 Master\'s programmes are taught entirely in English. At undergraduate level, English-taught options are more limited but growing — primarily in engineering, business, and computer science.'},
      {h:'Top universities',p:'Technical University of Munich (TUM), RWTH Aachen, Heidelberg, Humboldt Berlin, and LMU Munich all rank in the global top 100. Engineering schools like TU Berlin and TU Dresden are world-class. A Master\'s from any of these is on the same footing as a UK Russell Group degree, at a fraction of the cost.'},
      {h:'The APS process',p:'African students must first get their academic qualifications verified by the Academic Evaluation Centre (APS) at the German Embassy in their country. The process takes 8–12 weeks and costs around KES 25,000. After APS, you can apply directly to universities.'},
      {h:'Post-study work',p:'Germany offers an 18-month post-study job-seeker visa. Most graduates find employment within that window — engineering, IT, and finance graduates especially. After 2 years of work, you can apply for permanent residency. After 5 years of work, German citizenship.'},
    ],
    conclusion:'If your child is studying IGCSE or A-Level and wants to study engineering, computer science, or the sciences without the financial burden of UK or US tuition, Germany should be on the shortlist. We place 20–30 students there every year through our Study Abroad programme.',
  },
  'ib-extended-essay': {
    cat:'ib',
    img:'linear-gradient(135deg,#0A0A1A,#1A1A40)', splash:'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1000&q=70',
    t:'IB Extended Essay: How to Score a Full 34 Points',
    date:'August 2025 · 10 min read',
    author:'Dr. Catherine Owino', role:'IB Coordinator',
    intro:'The Extended Essay (EE) and Theory of Knowledge (ToK) together can contribute up to 3 points to your IB Diploma total. Those 3 points are the difference between 42 and 45, between a conditional and a firm offer from Oxford. Yet most students treat the EE as an afterthought. Here is how to treat it properly.',
    sections:[
      {h:'Pick the right subject',p:'The EE is a 4,000-word independent research essay in one of your six Diploma subjects. Pick the subject you are strongest in, not the one you find "interesting." Interesting does not write itself. Strong gets you a Grade A.'},
      {h:'Pick the right research question',p:'The question must be specific, arguable, and answerable within 4,000 words. "Is Shakespeare relevant today?" is not an EE question. "To what extent does the portrayal of female madness in Hamlet differ from that in Macbeth?" is. The question should fit on one line but require 4,000 words to answer.'},
      {h:'The supervisor',p:'You are assigned an EE supervisor — usually a teacher from your school. They can give you 3–5 hours of guidance total. Use that time strategically: 1 hour on the research question, 1 hour on the plan, 1 hour on a draft, 1 hour on feedback, 1 hour near the end. Do not disappear for months and show up expecting rescue.'},
      {h:'The structure',p:'Introduction (500 words) — state your question and its importance. Body (2,800 words) — your actual analysis, split into 3–5 subsections. Conclusion (400 words) — what you found and what remains unanswered. Bibliography — everything you cited. Appendices if needed.'},
      {h:'The mark scheme secrets',p:'The EE is marked on 5 criteria: focus and method, knowledge and understanding, critical thinking, presentation, and engagement (via the Reflections on Planning and Progress Form). Critical thinking is worth 12 of the 34 points — nearly a third. Your essay must show evaluation, not just description.'},
      {h:'The RPPF matters',p:'The Reflections on Planning and Progress Form is 500 words you write yourself, in three entries across the year. It is marked by your examiner. Students who leave it to the last week consistently lose 3–4 points here. Write one reflection every time you meet your supervisor.'},
      {h:'Plagiarism and citations',p:'IB uses strict academic standards. Cite every fact that is not common knowledge. Use one citation style consistently — MLA, APA, or Chicago. Unreferenced ideas are treated as plagiarism. Your EE will be submitted through Turnitin.'},
    ],
    conclusion:'A Grade A Extended Essay + Grade A Theory of Knowledge gives you 3 bonus points. That costs roughly 80 hours of focused work across a year. No other 80-hour investment in the IB programme pays as well.',
  },
  'ai-tutoring-grades': {
    cat:'ai',
    img:'linear-gradient(135deg,#1A0A00,#3D2200)', splash:'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000&q=70',
    t:'How AI Tutoring Improved Our Students\' Grades by 34%',
    date:'July 2025 · 8 min read',
    author:'Alfred Ouko', role:'Founder & CEO',
    intro:'We ran an internal study of 240 Smartious students over the 2024 academic year. Half used our Mshauri AI tutor for 30 minutes daily. Half did not. Here is what we found.',
    sections:[
      {h:'The setup',p:'We took 240 students preparing for IGCSE, A-Level, or KCSE. We matched pairs by starting grade, subject, and teacher. One student in each pair got unlimited Mshauri access; the other got only the standard teacher-led tuition. Both groups sat the same mock exams throughout the year.'},
      {h:'The results',p:'Students using Mshauri for at least 20 hours a month improved their mock exam grades by an average of 34% — roughly one full letter grade, e.g. from a C to a B. Students who used it less than 10 hours a month showed no significant difference. The threshold matters.'},
      {h:'Why the threshold?',p:'Below 10 hours a month, usage is sporadic and does not build the habit of self-directed revision. Above 20 hours, the student is using Mshauri daily and internalising its Socratic questioning style. The middle range had mixed results — consistency matters more than total hours.'},
      {h:'What subjects benefited most?',p:'Mathematics (+41%) and Chemistry (+38%) showed the largest gains, followed by Physics (+32%) and Biology (+28%). English Literature showed +19% — smaller but still meaningful. History and Geography showed only +12% — AI tutoring is less differentiating for humanities, where discussion and essay coaching from a human tutor matters more.'},
      {h:'What it did not fix',p:'Mshauri did not help students who were disengaged or who had personal issues outside academics. Students under significant family stress, or those with undiagnosed learning differences, needed human intervention before any AI tool could help. We do not claim Mshauri solves motivation — it only helps students who are already trying.'},
      {h:'What we are doing next',p:'We are publishing this data alongside a white paper in Q1 2026. We also made Mshauri freely available to all enrolled Smartious students — not sold as a separate product — precisely because it works best when combined with human tutoring, not as a replacement.'},
    ],
    conclusion:'AI tutoring is not a gimmick, but it is also not a silver bullet. Our data shows it amplifies what a motivated student is already doing. For families trying to decide whether to add an AI component, the question is not whether it works — it is whether your child will actually use it for 20 hours a month.',
  },
  'us-uk-au-comparison': {
    cat:'university',
    img:'linear-gradient(135deg,#001A10,#003020)', splash:'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1000&q=70',
    t:'US vs UK vs Australia: Which University System is Right for You?',
    date:'June 2025 · 7 min read',
    author:'Grace Njeri', role:'University Counsellor',
    intro:'If your child is studying IGCSE or A-Level and has university ambitions beyond East Africa, three systems dominate: the US, the UK, and Australia. They are structurally different. Here is the honest comparison.',
    sections:[
      {h:'Length of degree',p:'UK undergraduate degrees are 3 years for most subjects, 4 years for engineering or sandwich courses, and 5–6 years for Medicine. US Bachelor\'s degrees are 4 years across the board. Australian Bachelor\'s are 3 years (like the UK) for most subjects, with Honours adding a 4th year. If time-to-graduation matters, UK and Australia win.'},
      {h:'Cost for international students',p:'US private universities charge $50,000–$80,000 per year in tuition, plus $15,000–$25,000 living. UK international tuition is £20,000–£45,000 per year ($25,000–$55,000) plus £12,000–£20,000 living. Australian international tuition is A$35,000–A$50,000 ($22,000–$33,000) plus living costs. Australia is the most affordable; US private institutions are the most expensive.'},
      {h:'Breadth vs specialisation',p:'US degrees are broad — students take general education courses for 2 years before specialising. UK degrees are narrow from Year 1 — you study only your chosen subject. Australia is closer to the UK model. If your child knows exactly what they want to study, UK or Australia. If they want to explore before deciding, US.'},
      {h:'Visa and post-study work',p:'UK offers a 2-year Graduate Visa after graduation (3 years for PhD). US offers 1 year of OPT (Optional Practical Training), extendable to 3 years for STEM graduates. Australia offers 2–4 years of Temporary Graduate Visa depending on qualification. For long-term migration intent, Australia and UK are easier.'},
      {h:'Admission requirements',p:'UK looks primarily at academic grades (A-Level or IB) and personal statement. US weights holistic review — grades, SAT/ACT, essays, extracurriculars, recommendations. Australia resembles the UK — grades dominate. For the academically strong but less rounded student, UK or Australia.'},
      {h:'Reputation',p:'Oxford, Cambridge, and the LSE rank globally. Harvard, MIT, Stanford, and the Ivy League rank globally. Melbourne, ANU, Sydney, UNSW, and Queensland rank in the global top 100. Employer recognition is roughly equivalent at the top tier across all three systems.'},
    ],
    conclusion:'Most East African families we work with choose the UK for its cost-efficiency (3-year degrees), the US for its scholarships and breadth, or Australia for its post-study visa and affordability. Each has a strong case. The wrong answer is picking based on rankings alone.',
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
  const [wizStep, setWizStep] = useState(1)
  const [currentProg, setCurrentProg] = useState('homeschool')
  const [loginRole, setLoginRole] = useState('student')
  const [toast, setToast] = useState(null)
  const [wizDone, setWizDone] = useState(false)

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
  } else if (page === 'article' && currentArticle && FULL_ARTICLES[currentArticle]) {
    const a = FULL_ARTICLES[currentArticle]
    metaTitle = a.title + ' | ' + SITE
    metaDesc  = (a.excerpt || a.intro || '').slice(0, 158)
  } else if (PAGE_META[page]) {
    metaTitle = PAGE_META[page].title
    metaDesc  = PAGE_META[page].desc
  }
  usePageMeta(metaTitle, metaDesc)

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
            {[['Home','home'],['About','about'],['Curricula','curricula'],['Services','services'],['Global','global'],['Pricing','pricing'],['Programs','programs'],['FAQ','faq'],['Blog','blog']].map(([l,id]) => (
              <div key={id} className={`nl${page===id?' on':''}`} onClick={() => P(id)}>{l}</div>
            ))}
          </div>
          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(m => !m)} style={{display:'none',background:'transparent',border:'1px solid rgba(255,255,255,.2)',borderRadius:8,padding:'7px 10px',cursor:'pointer',color:'#fff'}} className="mob-burger">
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
            {[['Home','home'],['About','about'],['Curricula','curricula'],['Services','services'],['Global','global'],['Pricing','pricing'],['Programs','programs'],['FAQ','faq'],['Blog','blog'],['Enroll','enroll']].map(([l,id]) => (
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
            <div className="h-bg"/>
            <div className="h-ov"/>
            <div className="h-vig"/>
            <div className="h-body">
              <div style={{marginBottom:34}}>
                <SmartiousLogo size={56} withText={true} tone="light"/>
              </div>
              <h1 className="h1">
                <span>Where Every</span>
                <span>Child Learns</span>
                <span>to <em>Lead</em></span>
              </h1>
              <p className="h-sub">Internationally accredited homeschool education — IGCSE, Cambridge, IB, British, American, CBC — delivered to 2,000+ students across 12 countries. Expert tutors. AI-powered learning. Proven exam results.</p>
              <div className="h-act">
                <button className="btn-p" onClick={() => P('enroll')}>Begin Enrollment <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                <button className="btn-o lt" style={{borderColor:'rgba(139,26,46,.45)',color:V.cr}} onClick={() => P('consult')}>Free Consultation</button>
                <button className="btn-o lt" style={{borderColor:'rgba(247,243,237,.45)',color:'rgba(247,243,237,.85)'}} onClick={() => P('curricula')}>Explore Curricula</button>
                <button className="btn-o lt" style={{borderColor:'rgba(247,243,237,.45)',color:'rgba(247,243,237,.85)'}} onClick={() => P('pricing')}>View Pricing</button>
              </div>
              {/* Mobile 2×2 stat grid */}
              <div className="h-mob-stats">
                {[[cfg.stat1||'2,418+','Students'],[cfg.stat2||'127','Teachers'],[cfg.stat3||'6','Curricula'],['12+','Countries']].map(([n,l]) => (
                  <div key={l} className="hms">
                    <div className="hms-n">{n.includes('+')?<>{n.replace('+','')}<em>+</em></>:n}</div>
                    <div className="hms-l">{l}</div>
                  </div>
                ))}
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
                  <div key={h} className="hl reveal" onClick={() => P(pg)}>
                    <div className="hl-ico">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={`${V.cr}`} strokeWidth="1.8" strokeLinecap="round" dangerouslySetInnerHTML={{__html:svg}}/>
                    </div>
                    <div className="hl-n">{n}</div>
                    <div className="hl-h">{h}</div>
                    <div className="hl-p">{p}</div>
                  </div>
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
              {['Kenya HQ','Uganda','Tanzania','Botswana','Nigeria','South Africa','Egypt','UAE','Qatar','United Kingdom','United States','Canada','Australia'].map(c => (
                <div key={c} className="cp" onClick={() => showToast(`${c} — Smartious virtual school & online tuition available.`)} style={{background:'rgba(247,243,237,.06)',borderColor:'rgba(184,150,12,.15)',color:V.white}}>{c}</div>
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
          FAQ
      ══════════════════════════════════════════ */}
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
          <section className="sec" style={{background:V.bone}}><div className="wrap">
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
