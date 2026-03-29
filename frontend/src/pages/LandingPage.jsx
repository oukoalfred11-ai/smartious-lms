import { useStore } from '../context/ctx.jsx'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

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
  .lp .h-ov{position:absolute;inset:0;z-index:2;background:linear-gradient(150deg,rgba(10,8,6,.95) 0%,rgba(50,12,20,.72) 50%,rgba(10,8,6,.88) 100%)}
  .lp .h-vig{position:absolute;bottom:0;left:0;right:0;z-index:2;height:280px;background:linear-gradient(to top,${V.bone} 0%,transparent 100%)}
  .lp .h-body{position:relative;z-index:3;flex:1;display:flex;flex-direction:column;justify-content:center;max-width:1440px;margin:0 auto;padding:80px 48px 60px;width:100%}
  .lp .h-line{display:flex;align-items:center;gap:12px;margin-bottom:30px}
  .lp .h-line-bar{width:48px;height:1px;background:${V.gold3}}
  .lp .h-line-txt{font-family:'Syne Mono',monospace;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:${V.gold3};opacity:.8}
  .lp .h1{font-family:'Playfair Display',serif;font-size:clamp(3.5rem,7.5vw,7rem);font-weight:900;line-height:.98;letter-spacing:-.04em;color:${V.white};margin-bottom:28px}
  .lp .h1 em{color:transparent;-webkit-text-stroke:1.5px ${V.gold3};font-style:italic}
  .lp .h1 span{display:block}
  .lp .h-sub{font-size:17px;color:rgba(247,243,237,.52);max-width:480px;line-height:1.8;margin-bottom:44px}
  .lp .h-act{display:flex;gap:12px;flex-wrap:wrap}
  .lp .h-stats{position:absolute;right:48px;top:50%;transform:translateY(-50%);z-index:3;display:flex;flex-direction:column;gap:12px}
  .lp .hs{background:rgba(247,243,237,.04);border:1px solid rgba(184,150,12,.16);border-radius:10px;padding:14px 16px;backdrop-filter:blur(16px);min-width:140px;max-width:200px;position:relative;overflow:hidden}
  .lp .hs::before{content:'';position:absolute;top:0;left:0;right:0;height:1.5px;background:linear-gradient(90deg,${V.gold3},transparent)}
  .lp .hs-n{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700;color:${V.white};line-height:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .lp .hs-n em{color:${V.gold3};font-style:normal}
  .lp .hs-l{font-size:11px;color:rgba(247,243,237,.38);margin-top:5px;letter-spacing:.04em}
  /* MOBILE HERO STATS — hidden by default, shown on mobile */
  .lp .h-mob-stats{display:none;grid-template-columns:1fr 1fr;gap:10px;margin-top:36px;max-width:340px}
  .lp .hms{background:rgba(247,243,237,.05);border:1px solid rgba(184,150,12,.16);border-radius:10px;padding:14px 16px;position:relative;overflow:hidden}
  .lp .hms::before{content:'';position:absolute;top:0;left:0;right:0;height:1.5px;background:linear-gradient(90deg,${V.gold3},transparent)}
  .lp .hms-n{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700;color:${V.white};line-height:1}
  .lp .hms-n em{color:${V.gold3};font-style:normal}
  .lp .hms-l{font-size:10px;color:rgba(247,243,237,.38);margin-top:4px;letter-spacing:.04em}
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
  .lp .bfc-l{background:linear-gradient(135deg,#1A0509,#4A1020);min-height:280px;display:flex;align-items:center;justify-content:center;position:relative;padding:28px}
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
  .lp .bc-img{aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;position:relative}
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
  /* FOOTER */
  .lp footer{background:${V.ink2};padding:72px 0 28px;border-top:1px solid rgba(184,150,12,.08)}
  .lp .ft-grid{display:grid;grid-template-columns:1.8fr 1fr 1fr 1fr;gap:52px;margin-bottom:52px}
  .lp .ft-h{font-family:'Playfair Display',serif;font-size:21px;font-weight:700;color:${V.white}}
  .lp .ft-h em{color:${V.gold3};font-style:italic}
  .lp .ft-tag{font-size:8.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:rgba(247,243,237,.18);margin-top:2px;margin-bottom:14px}
  .lp .ft-d{font-size:13px;color:rgba(247,243,237,.3);line-height:1.78;margin-bottom:20px;max-width:270px}
  .lp .ft-ch{font-size:9.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(247,243,237,.2);margin-bottom:16px}
  .lp .ft-lk{list-style:none;display:flex;flex-direction:column;gap:9px}
  .lp .ft-lk a{font-size:13px;color:rgba(247,243,237,.34);transition:color .15s;cursor:pointer;display:block}
  .lp .ft-lk a:hover{color:${V.white}}
  .lp .ft-ct{font-size:12.5px;color:rgba(247,243,237,.3);line-height:2.1}
  .lp .ft-bot{border-top:1px solid rgba(255,255,255,.05);padding-top:22px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
  .lp .ft-copy{font-size:11.5px;color:rgba(247,243,237,.18)}
  .lp .ft-acs{display:flex;gap:6px;flex-wrap:wrap}
  .lp .ft-ac{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:4px;padding:3px 10px;font-size:10px;font-weight:600;color:rgba(247,243,237,.22)}
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
  }
  @media(max-width:480px){
    .lp .fg{grid-template-columns:1fr}.lp .pay-o{grid-template-columns:1fr 1fr}.lp .wst{min-width:100%}.lp .hl-grid{grid-template-columns:1fr 1fr}
  }
`

const PAGES = ['home','about','curricula','services','global','pricing','programs','faq','blog','enroll','login']

const Stars = () => (
  <div style={{display:'flex',gap:2,marginBottom:16}}>
    {[...Array(5)].map((_,i) => <svg key={i} className="t-s" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
  </div>
)

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

  const [page, setPage] = useState('home')

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.12 })
    document.querySelectorAll('.lp .reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [page])
  const [faqOpen, setFaqOpen] = useState(null)
  const [priceTabs, setPriceTab] = useState('hs')
  const [blogCat, setBlogCat] = useState('all')
  const [wizStep, setWizStep] = useState(1)
  const [currentProg, setCurrentProg] = useState('homeschool')
  const [loginRole, setLoginRole] = useState('student')
  const [payMethod, setPayMethod] = useState('mpesa')
  const [toast, setToast] = useState(null)
  const [wizDone, setWizDone] = useState(false)
  const nav = useNavigate()
  const topRef = useRef(null)

  const P = (id) => {
    if (!PAGES.includes(id)) return
    setPage(id)
    setWizStep(1)
    setWizDone(false)
    window.scrollTo(0, 0)
    topRef.current?.scrollIntoView()
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3200)
  }

  const goPortal = () => nav('/login')

  const BLOG_ITEMS = [
    {cat:'igcse',img:'linear-gradient(135deg,#1A0509,#4A1020)',t:'How to Ace IGCSE Mathematics: A Complete 2026 Guide',date:'Mar 2026 · 12 min read',author:'Dr. David Maina',role:'IGCSE Mathematics Specialist',featured:true},
    {cat:'homeschool',img:'linear-gradient(135deg,#0D1525,#1B3060)',t:'Homeschooling as an Expat Family: The Complete 2026 Guide',date:'Feb 2026 · 9 min',ex:'How families in 12 countries manage curriculum continuity, exam registration and social learning.'},
    {cat:'ai',img:'linear-gradient(135deg,#0D1A0D,#1A3D1A)',t:'Meet Mshauri: The AI Tutor Built for African Students',date:'Jan 2026 · 7 min',ex:'How our Claude-powered AI uses Socratic teaching, Swahili support and exam-focused coaching 24/7.'},
    {cat:'igcse',img:'linear-gradient(135deg,#1A0500,#3D1200)',t:'IGCSE vs IB Diploma: Which is Right for Your Child?',date:'Dec 2025 · 8 min',ex:'Side-by-side comparison of workload, university recognition, assessment format and teaching style.'},
    {cat:'university',img:'linear-gradient(135deg,#1A0020,#380040)',t:'Getting Into a UK University from Africa: The Complete UCAS Guide',date:'Nov 2025 · 11 min',ex:'Everything African students need to know about UCAS choices, personal statements and the offer process.'},
    {cat:'homeschool',img:'linear-gradient(135deg,#0A1400,#1A3000)',t:'5 Myths About Homeschooling in Kenya — Debunked',date:'Oct 2025 · 6 min',ex:'We address the five most common misconceptions with facts, data and real family stories.'},
    {cat:'study-abroad',img:'linear-gradient(135deg,#08100A,#142018)',t:'Why Germany is Africa\'s Best-Kept Study Abroad Secret',date:'Sep 2025 · 9 min',ex:'Tuition-free universities, world-class engineering schools and a welcoming environment.'},
    {cat:'ib',img:'linear-gradient(135deg,#0A0A1A,#1A1A40)',t:'IB Extended Essay: How to Score a Full 34 Points',date:'Aug 2025 · 10 min',ex:'Our IB coordinator breaks down topic selection, structure and examiner expectations.'},
    {cat:'ai',img:'linear-gradient(135deg,#1A0A00,#3D2200)',t:'How AI Tutoring Improved Our Students\' Grades by 34%',date:'Jul 2025 · 8 min',ex:'An internal study of 240 Smartious students shows measurable grade improvements.'},
    {cat:'university',img:'linear-gradient(135deg,#001A10,#003020)',t:'US vs UK vs Australia: Which University System is Right for You?',date:'Jun 2025 · 7 min',ex:'Cost, duration, admission requirements, visa routes compared for East African families.'},
  ]

  const visibleBlog = blogCat === 'all' ? BLOG_ITEMS.filter(b => !b.featured) : BLOG_ITEMS.filter(b => b.cat === blogCat && !b.featured)
  const featuredBlog = BLOG_ITEMS.find(b => b.featured && (blogCat === 'all' || b.cat === blogCat))

  return (
    <div className="lp" ref={topRef}>
      <style>{styles}</style>

      {/* ── FIXED HEADER: topbar + nav ── */}
      <div className={`lp-header${scrolled?' scrolled':''}`}>
        <div id="topbar" style={{background:V.ink,color:'rgba(247,243,237,.55)',fontSize:'11.5px',fontWeight:500,letterSpacing:'.04em',padding:'9px 0',textAlign:'center'}}>
          <strong style={{color:V.gold3}}>$15 placement assessment</strong> · IGCSE · Cambridge · IB · British · American · CBC · From $85/month · 12+ countries
        </div>
        <nav>
        <div className="nav-wrap">
          <div className="logo-lockup" onClick={() => P('home')}>
            <div className="logo-emblem">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <div>
              <div className="logo-name">Smart<em>ious</em></div>
              <div className="logo-tag">Homeschool · Global</div>
            </div>
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
            <button className="nav-login" onClick={goPortal} style={{color:V.gold2,borderColor:'rgba(184,150,12,.35)'}}>Book a Demo</button>
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
            <div className="h-ov"/>
            <div className="h-vig"/>
            <div className="h-body">
              <div className="h-line">
                <div className="h-line-bar"/>
                <div className="h-line-txt">Nairobi, Kenya &nbsp;·&nbsp; Est. 2018 &nbsp;·&nbsp; 12+ Countries</div>
              </div>
              <h1 className="h1">
                <span>Where Every</span>
                <span>Child Learns</span>
                <span>to <em>Lead</em></span>
              </h1>
              <p className="h-sub">Smartious Homeschool delivers internationally accredited education — IGCSE, Cambridge, IB, British, American, CBC — to 2,000+ students across 12 countries. Expert tutors. AI-powered. Proven results.</p>
              <div className="h-act">
                <button className="btn-p" onClick={() => P('enroll')}>Begin Enrollment <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                <button className="btn-o lt" onClick={goPortal} style={{borderColor:'rgba(184,150,12,.5)',color:V.gold2}}>Book a Free Demo</button>
                <button className="btn-o lt" style={{borderColor:'rgba(139,26,46,.45)',color:V.cr}} onClick={() => showToast('Contact info@smartious.ac.ke for a free consultation.')}>Free Consultation</button>
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
                  {av:'JO',c:V.cr,q:'"My daughter went from a C to an A* in IGCSE Chemistry in one term. More focused support than in a classroom of 40."',n:'Janet Osei — London',r:'Parent · IGCSE Year 11'},
                  {av:'AM',c:'#0891B2',q:'"We relocated from Dubai mid-year. Smartious made the curriculum transition seamless — British to IGCSE — without missing a single topic."',n:'Ahmed Al-Mansouri — Dubai',r:'Parent · British → IGCSE'},
                  {av:'ZK',c:'#15803D',q:'"I scored 38 IB points and got into UCL. Smartious prepared me better than any school I had attended."',n:'Zara Kamau — Nairobi',r:'Student · IB Diploma → UCL'},
                  {av:'CA',c:'#B45309',q:'"My kids in Toronto and cousins in Lagos study the same IGCSE online together. The parent dashboard gives visibility from 9,000km away."',n:'Chioma Adeyemi — Toronto',r:'Parent · Virtual IGCSE'},
                  {av:'SM',c:'#7C3AED',q:'"My son passed 9 IGCSE subjects at a Cambridge centre. Tutor quality was outstanding."',n:'Sarah Mohale — Johannesburg',r:'Parent · IGCSE Homeschool'},
                  {av:'KM',c:V.cr,q:'"I failed KCSE Mathematics twice. Smartious enrolled me in Cambridge A-Level Maths and I finished with an A. Mshauri AI at 11pm changed my life."',n:'Kofi Mensah — Lagos',r:'Student · A-Level → University'},
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
                <button className="btn-o lt" onClick={() => showToast('WhatsApp: +254 700 000 000')}>
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
              {[
                {badge:'Cambridge International',h:'IGCSE',desc:'The world\'s most recognised qualification for ages 14–16. Our students consistently achieve above-average pass rates across 40+ subjects with full past paper libraries, marking schemes and mock exams.',tags:['Mathematics','Sciences','English','History','+35 subjects'],meta:['Year 9–11','Globally Recognised','CIE']},
                {badge:'Cambridge International',h:'Cambridge A-Level',desc:'Accepted by Oxford, Cambridge, Ivy League and universities across Africa and the Middle East. Includes university counselling, UCAS/Common App support and intensive revision programmes.',tags:['Mathematics','Further Maths','Sciences','Economics','+22 subjects'],meta:['Year 12–13','University Entry','CIE']},
                {badge:'International Baccalaureate',h:'IB Diploma (DP)',desc:'Accepted by 2,000+ universities across 90 countries. Full guidance through all 6 subject groups, Theory of Knowledge, Extended Essay and CAS.',tags:['6 Subject Groups','Theory of Knowledge','Extended Essay','CAS'],meta:['Year 12–13','2,000+ Universities','IBO']},
                {badge:'International Baccalaureate',h:'IB PYP & MYP',desc:'The IB Primary Years (ages 3–12) and Middle Years (ages 11–16) programmes. Inquiry-based education developing critical thinking from early childhood.',tags:['PYP Ages 3–12','MYP Ages 11–16','Inquiry-Based'],meta:['Ages 3–16','Global Framework','IBO']},
                {badge:'Pearson',h:'Pearson Edexcel',desc:'Fully equivalent to the English national standard — flexible, modern and globally portable. Popular with UK-based families and expats. BTEC also available.',tags:['GCSE','A-Level','BTEC','All Core Subjects'],meta:['Year 7–13','UK Recognised','Pearson']},
                {badge:'England & Wales',h:'British National Curriculum',desc:'Full English National Curriculum from Key Stage 1 through Sixth Form. SATs preparation, GCSE coursework support and A-Level.',tags:['KS1 & KS2','KS3 & KS4','SATs Prep','Sixth Form'],meta:['Ages 5–18','UK Standard','DfE']},
                {badge:'United States',h:'American Curriculum',desc:'US Common Core K–12 with Advanced Placement (AP) courses, SAT and ACT preparation, and full Common App college counselling.',tags:['K–12 Common Core','AP Courses','SAT Prep','ACT Prep'],meta:['K–12','US College Entry','College Board']},
                {badge:'Republic of Kenya',h:'CBC & KCSE',desc:'Kenya\'s Competency-Based Curriculum (Grades 1–9) and KCSE through Form 6. Taught by Kenyan-certified tutors with full KNEC-aligned marking.',tags:['CBC Grades 1–9','Form 1–6','KCSE Prep','All Subjects'],meta:['Ages 6–18','East Africa','KICD/KNEC']},
                {badge:'Smartious Exclusive',h:'Smartious Blended',desc:'Our signature in-house curriculum — designed in Nairobi over 7 years. Blends IGCSE academic rigour with CBC relevance, plus AI literacy and digital entrepreneurship.',tags:['IGCSE + CBC','STEM Focus','AI Literacy','Digital Skills','Global Citizenship'],meta:['All Ages','Designed in Nairobi','Smartious HQ'],gold:true},
              ].map((c,i) => (
                <div key={i} className={`cc${c.gold?' cc-hl':''}`}>
                  <div className="cc-top">
                    <div className="cc-bar" style={c.gold?{background:'linear-gradient(90deg,#B8960C,#8B1A2E)'}:{}}/>
                    <div className="cc-badge" style={c.gold?{background:'rgba(184,150,12,.1)',color:V.gold,borderColor:'rgba(184,150,12,.2)'}:{}}>{c.badge}</div>
                    <div className="cc-h">{c.h}</div>
                    <div className="cc-desc">{c.desc}</div>
                  </div>
                  <div className="cc-body">
                    <div className="cc-tags">{c.tags.map(t => <span key={t} className="cc-tag">{t}</span>)}</div>
                    <div className="cc-meta">{c.meta.map(m => <span key={m}>{m}</span>)}</div>
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
          SERVICES
      ══════════════════════════════════════════ */}
      {page === 'services' && (
        <>
          <div className="pg-hero" style={{background:V.ink}}><div className="wrap"><div className="eyebrow">How We Deliver</div><h1 className="pg-h">Six Ways to <em>Learn with Us</em></h1><p className="pg-sub" style={{marginTop:12}}>Every family is different. We've built six service models so Smartious works wherever you are.</p></div></div>
          <section className="sec" style={{background:V.ink}}><div className="wrap">
            <div className="svc-grid">
              {[
                {svg:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',h:'Homeschool at Home',p:'A qualified tutor visits your home (Nairobi) or connects via video. Structured, accredited curriculum in your own environment. Weekly lesson planning, monthly reports, parent portal. All 9 curricula available.',tags:['1-on-1 Tutor','Flexible Schedule','All Curricula','Written Reports'],lnk:'View pricing'},
                {svg:'<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>',h:'Smartious Learning Centre',p:'Our supervised study centre at Diamond Plaza I, Parklands, Nairobi. Professional environment with peer interaction and specialist teachers on-site. A 20% discount applies versus home visits.',tags:['20% Discount','Parklands Nairobi','Supervised','Peer Learning'],lnk:'View pricing'},
                {svg:'<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',h:'Virtual School (Online)',p:'100% online — available in all 12+ countries. Live weekly Zoom classes, full recorded library, interactive quizzes, mock exams and real-time parent dashboards. 10% discount. Mshauri AI included.',tags:['Global Access','10% Discount','Live + Recorded','Mshauri AI'],lnk:'View pricing'},
                {svg:'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',h:'Private Tuition',p:'One-on-one expert tuition for any subject, any level, any curriculum. From $8/hr online or $12/hr home visit (Nairobi). Monthly bundles of 12 hours at $85. Tutors bring all materials and submit session notes.',tags:['From $8/hr Online','Any Subject','Home Visit or Online','Session Notes'],lnk:'View pricing'},
                {svg:'<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>',h:'Mshauri AI Tutor',p:'Mshauri is built on Anthropic\'s Claude. Available 24/7 in English and Swahili. Uses the Socratic method — guiding questions, not direct answers. Creates study plans, flashcards, quizzes, lesson summaries.',tags:['24/7 Available','English & Swahili','Powered by Claude','Socratic Method'],lnk:'Included in Premium plans'},
                {svg:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',h:'Exam Preparation',p:'Intensive prep for IGCSE, Cambridge A-Level, IB, KCSE, SAT, ACT and Edexcel. Full past paper library (2015–2024), official marking schemes, weekly mock exams with expert marking.',tags:['Past Papers 2015–2024','Mock Exams','Expert Marking','Weakness Analysis'],lnk:'View pricing'},
              ].map((s,i) => (
                <div key={i} className="sc reveal">
                  <div className="sc-ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={V.cr} strokeWidth="1.8" strokeLinecap="round" dangerouslySetInnerHTML={{__html:s.svg}}/></div>
                  <div className="sc-h">{s.h}</div>
                  <div className="sc-p">{s.p}</div>
                  <div className="sc-tags">{s.tags.map(t => <span key={t} className="sc-tag">{t}</span>)}</div>
                  <div className="sc-lnk" onClick={() => P('pricing')}>
                    {s.lnk} {s.lnk !== 'Included in Premium plans' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
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
          GLOBAL
      ══════════════════════════════════════════ */}
      {page === 'global' && (
        <>
          <div className="pg-hero"><div className="wrap"><div className="eyebrow">Global Footprint</div><h1 className="pg-h">Educating Students <em>Across the World</em></h1><p className="pg-sub" style={{marginTop:12}}>From Diamond Plaza I, Parklands, Nairobi to 13 countries across 4 continents.</p></div></div>
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            <div className="map-c">
              <svg viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',display:'block',borderRadius:16}}>
                <defs><radialGradient id="bg" cx="52%" cy="56%"><stop offset="0%" stopColor="#181030"/><stop offset="100%" stopColor="#0A0A18"/></radialGradient></defs>
                <rect width="1000" height="500" fill="url(#bg)" rx="16"/>
                <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(255,255,255,.03)" strokeWidth=".8"/>
                <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(255,255,255,.03)" strokeWidth=".8"/>
                {/* Africa */}
                <path d="M455 152 L476 144 L508 150 L532 160 L548 184 L560 222 L564 263 L556 303 L542 338 L521 370 L504 390 L488 376 L470 347 L456 308 L450 268 L452 230 L450 198 Z" fill="#1A1630" stroke="#2A2448" strokeWidth=".6"/>
                <path d="M428 88 L482 80 L528 86 L548 106 L542 128 L516 138 L474 136 L446 120 Z" fill="#1A1630" stroke="#2A2448" strokeWidth=".6"/>
                {/* Middle East */}
                <path d="M537 162 L594 152 L628 168 L620 210 L586 222 L547 206 Z" fill="#1A1630" stroke="#2A2448" strokeWidth=".6"/>
                {/* Europe */}
                <path d="M102 82 L268 72 L310 114 L318 168 L286 202 L238 214 L192 204 L150 180 L108 148 Z" fill="#1A1630" stroke="#2A2448" strokeWidth=".6"/>
                {/* Australia */}
                <path d="M716 296 L810 282 L852 314 L846 374 L798 394 L744 382 L712 348 Z" fill="#1A1630" stroke="#2A2448" strokeWidth=".6"/>
                {/* Americas */}
                <path d="M216 220 L285 208 L310 258 L304 342 L270 393 L226 382 L200 332 L207 274 Z" fill="#1A1630" stroke="#2A2448" strokeWidth=".5"/>
                <path d="M590 82 L772 66 L822 116 L798 180 L726 200 L656 194 L604 172 L585 128 Z" fill="#1A1630" stroke="#2A2448" strokeWidth=".5"/>
                {/* Connection lines */}
                {[[522,290,436,96],[522,290,594,194],[522,290,208,160],[522,290,780,338]].map(([x1,y1,x2,y2],i) => (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(184,150,12,.08)" strokeWidth="1" strokeDasharray="5,6"/>
                ))}
                {[[522,290,464,260],[522,290,492,363],[522,290,505,177]].map(([x1,y1,x2,y2],i) => (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(139,26,46,.12)" strokeWidth=".8" strokeDasharray="4,5"/>
                ))}
                {/* HQ Nairobi */}
                <circle cx="522" cy="290" r="7" fill="#8B1A2E"><animate attributeName="r" values="5;12;5" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;.2;1" dur="2.2s" repeatCount="indefinite"/></circle>
                <circle cx="522" cy="290" r="3.5" fill="#E8354A"/>
                <text x="522" y="276" textAnchor="middle" fill="rgba(255,255,255,.9)" fontSize="8" fontFamily="Syne,sans-serif" fontWeight="700">Kenya &#9733; HQ</text>
                {/* Other locations */}
                {[[464,260,'Nigeria'],[492,363,'S.Africa'],[505,177,'Egypt'],[436,96,'UK'],[208,160,'USA'],[200,108,'Canada'],[780,338,'Australia'],[594,194,'UAE']].map(([cx,cy,label],i) => (
                  <g key={i}>
                    <circle cx={cx} cy={cy} r="5" fill={i < 4 ? '#8B1A2E' : '#B8960C'}><animate attributeName="r" values="3.5;8;3.5" dur={`${2.4+i*.2}s`} repeatCount="indefinite"/><animate attributeName="opacity" values="1;.25;1" dur={`${2.4+i*.2}s`} repeatCount="indefinite"/></circle>
                    <circle cx={cx} cy={cy} r="2.5" fill={i < 4 ? '#E8354A' : '#D4AF37'}/>
                    <text x={cx} y={cy-12} textAnchor="middle" fill="rgba(255,255,255,.75)" fontSize="7" fontFamily="Syne,sans-serif" fontWeight="600">{label}</text>
                  </g>
                ))}
              </svg>
              <div className="cp-row">
                {['Kenya HQ','Uganda','Tanzania','Botswana','Nigeria','South Africa','Egypt','UAE','Qatar','United Kingdom','United States','Canada','Australia'].map(c => (
                  <div key={c} className="cp" onClick={() => showToast(`${c} — Smartious virtual school & online tuition available.`)}>{c}</div>
                ))}
              </div>
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
          <div className="pg-hero"><div className="wrap"><div className="eyebrow">Global Pricing in USD</div><h1 className="pg-h">Transparent Fees, <em>No Surprises</em></h1><p className="pg-sub" style={{marginTop:12}}>All prices in US Dollars. One-time $15 placement assessment. Cancel anytime with 30 days notice. No contracts.</p></div></div>
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            <div className="p-tabs">
              {[['hs','Homeschool'],['vs','Virtual School'],['tu','Private Tuition']].map(([id,l]) => (
                <button key={id} className={`ptab${priceTabs===id?' on':''}`} onClick={() => setPriceTab(id)}>{l}</button>
              ))}
            </div>

            {priceTabs === 'hs' && (
              <div className="price-grid">
                {[
                  {lbl:'Homeschool · At Home',ti:'Primary',am:'180',pr:'per month · Grades 1–6',fs:['Full CBC, British or American curriculum','Dedicated class teacher (home or video)','Monthly written progress report','Parent portal access','Mshauri AI — 20 sessions/month'],gold:false},
                  {lbl:'Homeschool · At Home',ti:'Secondary (IGCSE)',am:'260',pr:'per month · Year 7–11',fs:['IGCSE, Edexcel, British or American','Subject specialist tutors per subject','Mock exams + full past paper library','Mshauri AI — unlimited access','Weekly parent progress calls'],gold:true,badge:'Most Popular'},
                  {lbl:'Homeschool · At Home',ti:'A-Level / IB Diploma',am:'380',pr:'per month · Year 12–13',fs:['Cambridge A-Level or IB Diploma','University counselling included','UCAS / Common App support','Unlimited Mshauri AI + live sessions','IB Extended Essay supervision'],gold:false},
                ].map((p,i) => <PriceCard key={i} {...p} P={P}/>)}
              </div>
            )}
            {priceTabs === 'vs' && (
              <div className="price-grid">
                {[
                  {lbl:'Virtual School · Online',ti:'Basic Online',am:'85',pr:'per month · All ages',fs:['Full recorded lesson library','Interactive practice quizzes','Mshauri AI — 20 sessions/month','Monthly online assessments','Parent progress dashboard'],gold:false},
                  {lbl:'Virtual School · Online',ti:'Premium Online',am:'145',pr:'per month · All ages',fs:['Live weekly Zoom group classes','Unlimited Mshauri AI Tutor','Monthly mock exams + expert marking','Bi-weekly 1-on-1 tutor check-in','Full past paper + marking scheme library'],gold:true,badge:'Best Value'},
                  {lbl:'Virtual School · Online',ti:'IGCSE Full Pack',am:'195',pr:'per month · Year 9–11',fs:['Complete IGCSE curriculum online','All Cambridge past papers 2015–2024','Official Cambridge marking schemes','Exam-focused Mshauri AI coaching','Weekly examiner tip sessions'],gold:false},
                ].map((p,i) => <PriceCard key={i} {...p} P={P}/>)}
              </div>
            )}
            {priceTabs === 'tu' && (
              <div className="price-grid">
                {[
                  {lbl:'Private Tuition · Online',ti:'Online Session',am:'8',pr:'per hour · Any subject',fs:['Video session with subject specialist','Interactive shared digital whiteboard','Session recording sent to parent','Book anytime with 24hrs notice'],gold:false,cta:'Book Now'},
                  {lbl:'Private Tuition · Nairobi',ti:'Home Visit',am:'12',pr:'per hour · Nairobi area',fs:['Tutor comes to your home in Nairobi','Background-checked, verified tutors','All teaching materials provided','Written session note sent to parent'],gold:true,badge:'Popular',cta:'Book Now'},
                  {lbl:'Private Tuition · Bundle',ti:'Monthly Bundle',am:'85',pr:'per month · 12 hours',fs:['12 hours — online or home visit','Same dedicated tutor each week','Monthly written progress report','Curriculum-aligned lesson planning'],gold:false,cta:'Get Bundle'},
                ].map((p,i) => <PriceCard key={i} {...p} P={P}/>)}
                <p style={{fontSize:'11.5px',textAlign:'center',color:V.sl2,marginTop:22,gridColumn:'1/-1'}}>All prices in USD. $15 one-time assessment fee for all new students.</p>
              </div>
            )}
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
                  {[['Duration','10–12 months full-time · 14 months part-time'],['Entry Requirements','Completed secondary school · Min. 5 IGCSE C grades or KCSE B–'],['Delivery','100% online or blended · Available globally'],['Programme Fee','From $2,400 USD full year · Payment plans available']].map(([h,v]) => (
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
                  {[['United Kingdom','linear-gradient(135deg,#0D1525,#1B2E5F)','1 term / 1 year · From $8,500/term','OFSTED-rated placements in London, Manchester and Edinburgh.'],['United States','linear-gradient(135deg,#1A0000,#3D0000)','1 semester / 1 year · From $9,200/semester','High school semester placements in New York, California and Texas.'],['Australia','linear-gradient(135deg,#0A1400,#1A3000)','1 term / 1 year · From $7,800/term','Year 10–12 placements in Sydney, Melbourne and Brisbane.'],['Germany','linear-gradient(135deg,#0A0A1A,#1A1A40)','1 year preferred · From $5,200/term','International school placements in Berlin, Munich and Hamburg.'],['UAE','linear-gradient(135deg,#1A0500,#3D1200)','1 term / 1 year · From $6,500/term','Premium international school placements in Dubai and Abu Dhabi.'],['Canada','linear-gradient(135deg,#08100A,#142018)','1 semester / 1 year · From $7,200/semester','High school placements in Toronto, Vancouver and Calgary.']].map(([country,bg,meta,desc]) => (
                    <div key={country} className="sa-d">
                      <div className="sa-dt" style={{background:bg}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        <div className="sa-dn">{country}</div>
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
                  <button className="btn-o" onClick={() => showToast('WhatsApp: +254 700 000 000 for Study Abroad details.')}>WhatsApp for Details</button>
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
                <button className="btn-p" onClick={() => showToast('WhatsApp: +254 700 000 000')}>
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
              {[['all','All Articles'],['igcse','IGCSE'],['ib','IB'],['homeschool','Homeschooling'],['ai','AI Learning'],['university','University'],['study-abroad','Study Abroad']].map(([id,l]) => (
                <button key={id} className={`bf${blogCat===id?' on':''}`} onClick={() => setBlogCat(id)}>{l}</button>
              ))}
            </div>
            {featuredBlog && (
              <div className="bfc" onClick={() => showToast('Full article coming soon.')}>
                <div className="bfc-l"><div className="bfc-badge">FEATURED · IGCSE</div><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1" strokeLinecap="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg></div>
                <div className="bfc-r">
                  <div className="bfc-date">MARCH 2026 · 12 MIN READ</div>
                  <h3 className="bfc-h">{featuredBlog.t}</h3>
                  <p className="bfc-p">Everything you need to know about Papers 1 and 2, topic weighting, mark scheme strategy and the fastest path from a C to an A*.</p>
                  <div className="bfc-au">
                    <div className="bfc-av">DM</div>
                    <div><div className="bfc-an">Dr. David Maina</div><div className="bfc-ar">IGCSE Mathematics Specialist</div></div>
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
                      <div className="bc-img" style={{background:a.img}}/>
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
                <div key={i} className="bc reveal" onClick={() => showToast('Full article coming soon.')}>
                  <div className="bc-img" style={{background:b.img}}>
                    <span className="bc-cat">{b.cat === 'study-abroad' ? 'Study Abroad' : b.cat.toUpperCase()}</span>
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
          ENROLL
      ══════════════════════════════════════════ */}
      {page === 'enroll' && (
        <>
          <div className="pg-hero"><div className="wrap">
            <div className="eyebrow">Join Smartious</div>
            <h1 className="pg-h">Start Your <em>Journey Today</em></h1>
            <p className="pg-sub" style={{marginTop:12}}>Enrollment takes less than 10 minutes. $15 placement fee. First lesson within 48 hours.</p>
          </div></div>
          <section className="sec" style={{background:V.bone}}><div className="wrap">
            <div className="wiz-shell">
              {/* Steps */}
              <div className="wiz-steps">
                {[['Programme'],['Your Details'],['Assessment Fee'],['Placement Test'],['All Done!']].map(([l],i) => (
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
                        {id:'iufp',svg:'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',h:'IUFP — University Foundation',p:'International University Foundation Programme. Direct entry to UK, US, Australian & European universities. 200+ partner universities.',from:'$2,400'},
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
                            <select className="fi-i"><option value="">Select curriculum...</option>{['IGCSE (Cambridge)','Cambridge A-Level','IB Diploma (DP)','IB PYP / MYP','Pearson Edexcel','British National Curriculum','American Curriculum','CBC / KCSE (Kenya)','Smartious Blended'].map(o => <option key={o}>{o}</option>)}</select>
                          </div>
                          <div><label className="fl">Learning Mode *</label>
                            <select className="fi-i"><option value="">Select mode...</option>{['Homeschool — Tutor Visits Home (Nairobi)','Homeschool — Online Video Sessions','Smartious Learning Centre — Parklands, Nairobi','Virtual School — 100% Online','Private Tuition — Online','Private Tuition — Home Visit (Nairobi)'].map(o => <option key={o}>{o}</option>)}</select>
                          </div>
                        </div>
                      )}
                      {currentProg === 'iufp' && (
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                          <div><label className="fl">Academic Pathway *</label>
                            <select className="fi-i"><option value="">Select pathway...</option>{['Sciences — Medicine, Pharmacy, Biology, Chemistry','Business & Economics — Finance, Accounting, Management','Engineering & Technology — Engineering, Computer Science','Arts & Humanities — Law, Politics, Literature, Psychology'].map(o => <option key={o}>{o}</option>)}</select>
                          </div>
                          <div><label className="fl">Target Country *</label>
                            <select className="fi-i"><option value="">Select destination...</option>{['United Kingdom','United States','Australia','Germany','Canada','Other'].map(o => <option key={o}>{o}</option>)}</select>
                          </div>
                        </div>
                      )}
                      {currentProg === 'studyabroad' && (
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                          <div><label className="fl">Destination *</label>
                            <select className="fi-i"><option value="">Select destination...</option>{['United Kingdom — from $8,500/term','United States — from $9,200/semester','Australia — from $7,800/term','Germany — from $5,200/term','UAE — from $6,500/term','Canada — from $7,200/semester'].map(o => <option key={o}>{o}</option>)}</select>
                          </div>
                          <div><label className="fl">Duration *</label>
                            <select className="fi-i"><option value="">Select duration...</option>{['1 Term / Semester (3–4 months)','1 Academic Year (9–10 months)','2 Academic Years'].map(o => <option key={o}>{o}</option>)}</select>
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
                      {[["Student's First Name *","",""],["Student's Last Name *","",""],["Parent / Guardian Email *","email",""],["WhatsApp Number *","tel",""],["Student's Date of Birth *","date",""],["Country of Residence *","","","select",['Kenya','Nigeria','South Africa','Uganda','Tanzania','UAE','United Kingdom','United States','Canada','Australia','Other']]].map(([l,type,ph,kind,opts]) => (
                        <div key={l} className={kind === 'select' ? '' : ''}>
                          <label className="fl">{l}</label>
                          {kind === 'select' ? (
                            <select className="fi-i"><option value="">Select country...</option>{(opts||[]).map(o => <option key={o}>{o}</option>)}</select>
                          ) : (
                            <input className="fi-i" type={type||'text'} placeholder={ph}/>
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{gridColumn:'1/-1'}}><label className="fl">How did you hear about Smartious?</label>
                      <select className="fi-i" style={{width:'100%'}}><option value="">Select...</option>{['Google Search','WhatsApp','Facebook / Instagram','Friend / Family Referral','LinkedIn','TikTok','School Recommendation','Other'].map(o => <option key={o}>{o}</option>)}</select>
                    </div>
                    <div className="wiz-nav">
                      <button className="wb wb-bk" onClick={() => setWizStep(1)}>&larr; Back</button>
                      <button className="wb wb-nx" onClick={() => setWizStep(3)}>Continue to Assessment Fee <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {wizStep === 3 && (
                  <div>
                    <div className="wiz-h">Assessment Fee — $15 USD</div>
                    <div className="wiz-sub">One-time, non-refundable. Covers your placement test, written curriculum report and tutor matching. Counts towards first month's fees.</div>
                    <div className="pay-o">
                      {[['mpesa','M-Pesa'],['card','Credit / Debit Card'],['paypal','PayPal'],['bank','Bank Transfer']].map(([id,l]) => (
                        <div key={id} className={`po${payMethod===id?' sel':''}`} onClick={() => setPayMethod(id)}>
                          <div style={{fontSize:22}}>
                            {id==='mpesa' ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg> : id==='card' ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> : id==='paypal' ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 11l2 9"/><path d="M4 7h9.5a3.5 3.5 0 0 1 0 7H7l-3 9"/></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="22" x2="21" y2="22"/><polygon points="12 2 20 7 4 7"/></svg>}
                          </div>
                          <div className="po-l">{l}</div>
                        </div>
                      ))}
                    </div>
                    {payMethod === 'mpesa' && (
                      <div style={{background:V.bone,border:`1px solid ${V.bone3}`,borderRadius:10,padding:18,marginBottom:16}}>
                        <label className="fl">M-Pesa Phone Number</label>
                        <input className="fi-i" type="tel" placeholder="+254 7XX XXX XXX" style={{marginBottom:8}}/>
                        <div style={{fontSize:12.5,color:V.sl}}>You will receive an M-Pesa STK push to confirm KES 1,950 (equivalent to $15 USD). Complete payment on your phone, then click Continue.</div>
                      </div>
                    )}
                    {payMethod === 'card' && (
                      <div style={{background:V.bone,border:`1px solid ${V.bone3}`,borderRadius:10,padding:18,marginBottom:16}}>
                        <label className="fl">Card Number</label><input className="fi-i" placeholder="1234 5678 9012 3456" style={{marginBottom:8}}/>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                          <div><label className="fl">Expiry</label><input className="fi-i" placeholder="MM / YY"/></div>
                          <div><label className="fl">CVC</label><input className="fi-i" placeholder="123"/></div>
                        </div>
                      </div>
                    )}
                    <div className="wiz-nav">
                      <button className="wb wb-bk" onClick={() => setWizStep(2)}>&larr; Back</button>
                      <button className="wb wb-nx" onClick={() => setWizStep(4)}>Pay $15 & Continue <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {wizStep === 4 && (
                  <div>
                    <div className="wiz-h">Placement Test</div>
                    <div className="wiz-sub">5 questions · 10 minutes · Results reviewed within 24 hours</div>
                    {[
                      {n:1,q:'In a right-angled triangle with legs 3 and 4, the hypotenuse is:',opts:['5','7','6','4.5'],ans:'5'},
                      {n:2,q:'Simplify: 3x + 2y − x + 5y',opts:['2x + 7y','4x + 7y','2x + 3y','4x + 3y'],ans:'2x + 7y'},
                      {n:3,q:'Choose the sentence with correct grammar:',opts:['She don\'t like apples.','She doesn\'t likes apples.','She doesn\'t like apples.','She don\'t likes apples.'],ans:'She doesn\'t like apples.'},
                    ].map((q,qi) => (
                      <div key={qi} style={{background:V.bone,border:`1px solid ${V.bone3}`,borderRadius:10,padding:20,marginBottom:12}}>
                        <div style={{fontFamily:"'Syne Mono',monospace",fontSize:'10.5px',color:V.sl3,letterSpacing:'.12em',marginBottom:10}}>Q{q.n} / 5</div>
                        <p style={{fontWeight:600,fontSize:14.5,color:V.ink,marginBottom:14,lineHeight:1.6}}>{q.q}</p>
                        <div style={{display:'flex',flexDirection:'column',gap:7}}>
                          {q.opts.map(o => <label key={o} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 13px',border:`1px solid ${V.bone3}`,borderRadius:6,cursor:'pointer',fontSize:13,background:V.white}}><input type="radio" name={`q${qi}`} style={{accentColor:V.cr}}/>{o}</label>)}
                        </div>
                      </div>
                    ))}
                    <div className="wiz-nav">
                      <button className="wb wb-bk" onClick={() => setWizStep(3)}>&larr; Back</button>
                      <button className="wb wb-nx" onClick={() => { setWizStep(5); setWizDone(true) }}>Submit & Complete <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                    </div>
                  </div>
                )}

                {/* STEP 5 */}
                {wizStep === 5 && (
                  <div style={{textAlign:'center',padding:'20px 0'}}>
                    <div style={{width:76,height:76,borderRadius:'50%',background:`linear-gradient(135deg,${V.cr},${V.cr2})`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',animation:'lp-float 3s ease-in-out infinite'}}>
                      <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.8rem',fontWeight:700,color:V.ink,marginBottom:8}}>Enrollment Submitted!</div>
                    <p style={{fontSize:14.5,color:V.sl,marginBottom:28,lineHeight:1.8,maxWidth:480,margin:'0 auto 28px'}}>Thank you! We have received your enrollment application and $15 assessment fee. Our admissions team will contact you within 2 hours to review your placement test and introduce your tutor.</p>
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

      {/* ── TOAST ── */}
      {toast && (
        <div id="lp-toast" className="show">{toast}</div>
      )}
    </div>
  )
}

// ── Price Card Component ──────────────────────────────────
function PriceCard({ lbl, ti, am, pr, fs, gold, badge, cta = 'Enroll Now', P }) {
  return (
    <div className={`pc${gold?' ft':''}`}>
      {badge && <div className="pbadge">{badge}</div>}
      <div className="p-lbl">{lbl}</div>
      <div className="p-ti">{ti}</div>
      <div className="p-am"><sup>$</sup>{am}</div>
      <div className="p-pr">{pr}</div>
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

// ── Footer ────────────────────────────────────────────────
function Footer({ P }) {
  const { siteConfig: cfg } = useStore()
  return (
    <footer>
      <div className="wrap">
        <div className="ft-grid">
          <div>
            <div className="ft-h">Smart<em>ious</em></div>
            <div className="ft-tag">Homeschool · Global</div>
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
              <div>{cfg.footerEmail || 'info@smartious.ac.ke'}</div>
              <div>{cfg.footerPhone || '+254 712 345 678'}</div>
              <div>{cfg.footerAddress || 'Diamond Plaza I, Parklands, Nairobi, Kenya'}</div>
            </div>
          </div>
        </div>
        <div className="ft-bot">
          <div className="ft-copy">{cfg.footerCopy || '© 2026 Smartious E-School Ltd. Nairobi, Kenya. All rights reserved.'}</div>
          <div className="ft-acs">
            {['Privacy Policy','Terms of Service','Cookie Policy','GDPR'].map(l => <div key={l} className="ft-ac">{l}</div>)}
          </div>
        </div>
      </div>
    </footer>
  )
}
