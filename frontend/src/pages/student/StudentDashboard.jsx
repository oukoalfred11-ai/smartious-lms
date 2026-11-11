/* ═══════════════════════════════════════════════════════════════════
   StudentDashboard.jsx — the student portal's home page
   ───────────────────────────────────────────────────────────────────
   Hero: greeting on cream "exercise book" paper. With a banner video
   (an announcement flagged by admins) the video plays muted in a framed
   panel beside the greeting, with a sound button, and the next or live
   class card sits under the greeting; without one, the class card takes
   the right side.
   Then: announcements, four stat tiles, today's classes, subject
   progress rings, recent results, homework due soon, shortcuts and the
   daily affirmation.
   Data: /homework/student/list (dueAt, mySubmission, locked),
   /exams/student/list (startAt, computedStatus, mySubmission),
   /timetable/me (entries), local practice history for XP, streak and
   subject progress. Headings in Source Serif 4, body in DM Sans.
═══════════════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from 'react'
import { api } from '../../context/ctx.jsx'
import AnnouncementsStrip from '../../components/AnnouncementsStrip.jsx'

const CSS = `
.sd{font-family:'DM Sans',system-ui,sans-serif;color:#1E1418;animation:sdIn .35s ease}
.sd *{box-sizing:border-box}
@keyframes sdIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.sd-hero{position:relative;overflow:hidden;border-radius:24px;background:#FBF6EE;border:1px solid #EFE6D8;margin-bottom:18px;isolation:isolate}
.sd-hero::before{content:'';position:absolute;inset:0;z-index:-1;background-image:linear-gradient(rgba(125,16,37,.05) 1px,transparent 1px);background-size:100% 30px}
.sd-hero::after{content:'';position:absolute;top:0;bottom:0;left:30px;width:1.5px;z-index:-1;background:rgba(196,70,90,.2)}
.sd-hero-in{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:30px;align-items:center;padding:36px 36px 36px 60px;min-height:260px}
.sd-hero.has-video .sd-hero-in{grid-template-columns:minmax(0,1fr) minmax(0,1.12fr);align-items:center}
.sd-eb{font-size:13px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#7D1025;margin:0 0 10px}
.sd-h1{font-family:'Source Serif 4',Georgia,serif;font-weight:700;font-size:clamp(2.3rem,3.6vw,3.4rem);line-height:1.05;letter-spacing:-.02em;color:#1E1418;margin:0 0 14px}
.sd-h1 em{font-style:italic;font-weight:600;color:#7D1025}
.sd-chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}
.sd-chip{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:700;color:#3B2A2F;background:#fff;border:1px solid #EAE0CF;border-radius:999px;padding:7px 14px}
.sd-chip.break{color:#6B21A8;background:#F5F0FF;border-color:#E4D7FB}
.sd-sum{font-size:17px;line-height:1.6;color:#6B5A5E;margin:0}
.sd-sum b{color:#1E1418}
.sd-next{position:relative;border-radius:20px;padding:22px 22px 20px;color:#FBF6EE;background:radial-gradient(120% 120% at 100% 0%,#A3192F 0%,#7D1025 50%,#5A0B1B 100%);box-shadow:0 18px 40px rgba(125,16,37,.25);overflow:hidden}
.sd-next::after{content:'';position:absolute;right:-40px;bottom:-60px;width:180px;height:180px;border-radius:50%;border:1px solid rgba(232,186,96,.35)}
.sd-next-eb{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#E8BA60;margin:0 0 10px}
.sd-live{width:8px;height:8px;border-radius:50%;background:#4ADE80;box-shadow:0 0 0 0 rgba(74,222,128,.6);animation:sdPulse 1.6s infinite}
@keyframes sdPulse{0%{box-shadow:0 0 0 0 rgba(74,222,128,.6)}70%{box-shadow:0 0 0 9px rgba(74,222,128,0)}100%{box-shadow:0 0 0 0 rgba(74,222,128,0)}}
.sd-next h3{font-family:'Source Serif 4',Georgia,serif;font-size:2.1rem;font-weight:700;line-height:1.1;margin:0 0 6px;color:#fff}
.sd-next p{margin:0;font-size:15.5px;color:rgba(251,246,238,.8)}
.sd-next .sd-count{margin-top:14px;font-size:14.5px;font-weight:700;color:#FBF6EE;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 12px;display:inline-block}
.sd-join{margin-top:14px;display:inline-flex;align-items:center;gap:8px;border:none;border-radius:12px;background:#E8BA60;color:#3D0712;font:800 15.5px 'DM Sans',system-ui,sans-serif;padding:11px 18px;cursor:pointer}
.sd-join:hover{background:#F0C979}
.sd-left{display:flex;flex-direction:column;justify-content:center;min-width:0}
.sd-hero.has-video .sd-next{margin-top:20px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:6px 18px;padding:18px 20px}
.sd-hero.has-video .sd-next .sd-next-eb,.sd-hero.has-video .sd-next h3,.sd-hero.has-video .sd-next p{grid-column:1}
.sd-hero.has-video .sd-next h3{font-size:1.7rem;margin:0}
.sd-hero.has-video .sd-next .sd-act{grid-column:2;grid-row:1 / span 3}
.sd-hero.has-video .sd-next .sd-join,.sd-hero.has-video .sd-next .sd-count{margin-top:0}
.sd-video{position:relative;border-radius:20px;overflow:hidden;background:#1a0a0e;aspect-ratio:16/9;box-shadow:0 22px 44px rgba(60,10,20,.22);outline:1.5px solid rgba(210,162,76,.7);outline-offset:6px}
.sd-video video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.sd-vtag{position:absolute;left:14px;top:14px;display:inline-flex;align-items:center;gap:8px;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.92);color:#7D1025;font-size:12.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.sd-vtag i{width:7px;height:7px;border-radius:50%;background:#EF4444}
.sd-sound{position:absolute;right:14px;bottom:14px;display:inline-flex;align-items:center;gap:8px;border:none;border-radius:999px;padding:10px 16px;background:rgba(20,8,12,.62);color:#fff;font:800 14px 'DM Sans',system-ui,sans-serif;cursor:pointer;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.sd-sound:hover{background:rgba(125,16,37,.85)}
.sd-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:18px 0}
.sd-stat{background:#fff;border:1px solid #EFE6D8;border-radius:18px;padding:18px 20px;display:flex;gap:14px;align-items:center;transition:transform .2s,box-shadow .2s}
.sd-stat:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(70,20,30,.08)}
.sd-ic{flex-shrink:0;width:52px;height:52px;border-radius:14px;background:#7D1025;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(125,16,37,.2)}
.sd-ic.soft{background:#F6EEE2;color:#7D1025;box-shadow:none}
.sd-val{font-family:'Source Serif 4',Georgia,serif;font-size:2.15rem;font-weight:700;line-height:1;color:#1E1418}
.sd-lbl{font-size:14.5px;font-weight:700;color:#6B5A5E;margin-top:4px}
.sd-dots{display:flex;gap:4px;margin-top:7px}
.sd-dots i{width:9px;height:9px;border-radius:50%;background:#EFE6D8}
.sd-dots i.on{background:#E8A33D}
.sd-grid{display:grid;grid-template-columns:minmax(0,1fr) 390px;gap:18px;align-items:start}
.sd-col{display:flex;flex-direction:column;gap:18px;min-width:0}
.sd-card{background:#fff;border:1px solid #EFE6D8;border-radius:20px;overflow:hidden}
.sd-ch{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;padding:22px 22px 12px}
.sd-ch small{display:block;font-size:12.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#7D1025;margin-bottom:3px}
.sd-ch h4{font-family:'Source Serif 4',Georgia,serif;font-size:1.55rem;font-weight:700;margin:0;color:#1E1418}
.sd-link{border:none;background:none;padding:0;font:700 15px 'DM Sans',system-ui,sans-serif;color:#7D1025;cursor:pointer;white-space:nowrap}
.sd-link:hover{text-decoration:underline}
.sd-empty{padding:10px 22px 26px;font-size:16px;color:#8C7A7E}
.sd-tl{list-style:none;margin:0;padding:4px 20px 18px}
.sd-tl li{display:grid;grid-template-columns:86px 18px minmax(0,1fr) auto;align-items:center;gap:14px;padding:13px 0;position:relative}
.sd-tl li + li{border-top:1px dashed #EFE6D8}
.sd-t1{font-size:16px;font-weight:800;color:#1E1418;text-align:right}
.sd-t2{font-size:13.5px;color:#8C7A7E;text-align:right}
.sd-node{width:14px;height:14px;border-radius:50%;border:3px solid #E6DCCB;background:#fff;justify-self:center}
.sd-tl li.done{opacity:.55}
.sd-tl li.done .sd-node{background:#E6DCCB;border-color:#E6DCCB}
.sd-tl li.live .sd-node{border-color:#16A34A;background:#4ADE80}
.sd-tl li.next .sd-node{border-color:#7D1025}
.sd-subj{font-size:17.5px;font-weight:800;color:#1E1418;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sd-teach{font-size:14.5px;color:#8C7A7E;margin-top:1px}
.sd-tag{font-size:13px;font-weight:800;border-radius:999px;padding:6px 12px;white-space:nowrap}
.sd-tag.live{background:#16A34A;color:#fff;border:none;cursor:pointer}
.sd-tag.next{background:#FBF1F3;color:#7D1025}
.sd-tag.done{background:#F4F1EC;color:#8C7A7E}
.sd-tag.later{background:#F8F3EA;color:#6B5A5E}
.sd-rings{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding:6px 20px 22px}
.sd-ring{text-align:center;padding:14px 8px;border-radius:16px;background:#FBF6EE}
.sd-ring svg{display:block;margin:0 auto 10px}
.sd-ring b{display:block;font-size:15.5px;color:#1E1418;line-height:1.25}
.sd-ring span{display:block;font-size:13.5px;color:#8C7A7E;margin-top:2px}
.sd-res{list-style:none;margin:0;padding:0 20px 14px}
.sd-res li{display:flex;align-items:center;gap:14px;padding:12px 0}
.sd-res li + li{border-top:1px solid #F4EFE6}
.sd-badge{flex-shrink:0;width:60px;height:60px;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Source Serif 4',Georgia,serif;font-weight:700;font-size:1.2rem;line-height:1}
.sd-badge small{font-family:'DM Sans',system-ui,sans-serif;font-size:12px;font-weight:800;margin-top:3px}
.sd-badge.wait{background:#F8F3EA;color:#8C7A7E;font-family:'DM Sans',system-ui,sans-serif}
.sd-rt{flex:1;min-width:0}
.sd-rt b{display:block;font-size:17px;color:#1E1418;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sd-rt span{display:block;font-size:14px;color:#8C7A7E;margin-top:2px}
.sd-hw{list-style:none;margin:0;padding:0 16px 8px}
.sd-hw li{display:flex;gap:12px;align-items:flex-start;padding:12px 4px}
.sd-hw li + li{border-top:1px solid #F4EFE6}
.sd-hw .sd-ic{width:42px;height:42px;border-radius:12px}
.sd-due{display:inline-block;margin-top:6px;font-size:13px;font-weight:800;border-radius:999px;padding:3px 9px;background:#FBF1E3;color:#9A5B12}
.sd-due.soon{background:#FDECEC;color:#9B1C1C}
.sd-btn{display:block;width:calc(100% - 32px);margin:4px 16px 16px;border:1px solid #EAE0CF;background:#FBF6EE;border-radius:12px;padding:13px;font:800 15px 'DM Sans',system-ui,sans-serif;color:#7D1025;cursor:pointer}
.sd-btn:hover{border-color:#7D1025}
.sd-jump{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:4px 16px 18px}
.sd-jump button{display:flex;flex-direction:column;align-items:center;gap:9px;border:1px solid #F0E8DA;background:#FBF6EE;border-radius:16px;padding:16px 6px 14px;font:700 14.5px 'DM Sans',system-ui,sans-serif;color:#3B2A2F;cursor:pointer;transition:transform .18s,border-color .18s,background .18s}
.sd-jump button:hover{transform:translateY(-2px);border-color:#7D1025;background:#fff}
.sd-jump .sd-ic{width:46px;height:46px;border-radius:12px}
.sd-quote{position:relative;border-radius:20px;padding:22px 22px 20px;background:linear-gradient(135deg,#7D1025,#4E0A17);color:#FBF6EE;overflow:hidden}
.sd-quote small{font-size:12.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#E8BA60}
.sd-quote .mk{display:block;font-family:'Source Serif 4',Georgia,serif;font-size:60px;line-height:.6;height:26px;margin-top:12px;color:#E8BA60}
.sd-quote p{font-family:'Source Serif 4',Georgia,serif;font-style:italic;font-size:1.35rem;line-height:1.45;margin:0 0 10px;color:#fff}
.sd-quote span{font-size:14px;color:rgba(251,246,238,.65)}
.sd-star{position:absolute;right:20px;top:18px;width:18px;color:#E8BA60;animation:sdTw 3.6s ease-in-out infinite}
@keyframes sdTw{0%,100%{opacity:.4;transform:scale(.65) rotate(0)}45%{opacity:1;transform:scale(1.12) rotate(18deg)}}
@media (prefers-reduced-motion: reduce){.sd,.sd-live,.sd-star{animation:none}}
@media (max-width: 1180px){
  .sd-grid{grid-template-columns:minmax(0,1fr) 320px}
  .sd-rings{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width: 900px){
  .sd-hero-in,.sd-hero.has-video .sd-hero-in{grid-template-columns:1fr;padding:26px 20px 22px 40px;gap:20px}
  .sd-hero.has-video .sd-next{grid-template-columns:1fr}
  .sd-hero.has-video .sd-next .sd-act{grid-column:1;grid-row:auto}
  .sd-hero::after{left:22px}
  .sd-stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .sd-stat{padding:14px;gap:10px}
  .sd-ic{width:40px;height:40px;border-radius:12px}
  .sd-val{font-size:1.7rem}
  .sd-lbl{font-size:13.5px}
  .sd-grid{grid-template-columns:1fr}
  .sd-tl li{grid-template-columns:70px 16px minmax(0,1fr) auto;gap:10px}
  .sd-h1{font-size:2.3rem}
}
`

const P = {
  star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  flame: 'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z',
  chart: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
  homework: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z',
  practice: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  live: 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
  timetable: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm-7-8h5v5h-5z',
  exams: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1.06 13.54L7.4 11l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z',
  library: 'M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z',
}
const Icon = ({ name, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={P[name]}/></svg>
)
const STAR = <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c.7 6.4 5.6 11.3 12 12-6.4.7-11.3 5.6-12 12-.7-6.4-5.6-11.3-12-12C6.4 11.3 11.3 6.4 12 0z"/></svg>

// Grade bands as used across the portal.
const gl = s => s >= 80 ? 'A*' : s >= 70 ? 'B' : s >= 60 ? 'C' : s >= 50 ? 'D' : s >= 40 ? 'E' : 'U'
const gcol = s => s >= 80 ? ['#E7F6EC', '#166534'] : s >= 70 ? ['#E8EFFB', '#1E3A8A'] : s >= 60 ? ['#FBF1E3', '#92400E'] : ['#FDECEC', '#9B1C1C']
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many)

const QUOTES = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Education is the most powerful weapon you can use to change the world.', author: 'Nelson Mandela' },
  { text: 'Every expert was once a beginner.', author: 'Helen Hayes' },
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
]

function Ring({ pct }) {
  const r = 30, c = 2 * Math.PI * r
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" role="img" aria-label={pct + '%'}>
      <circle cx="38" cy="38" r={r} fill="none" stroke="#EFE6D8" strokeWidth="7"/>
      <circle cx="38" cy="38" r={r} fill="none" stroke="#7D1025" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 38 38)" style={{ transition: 'stroke-dashoffset .8s ease' }}/>
      <text x="38" y="43" textAnchor="middle" style={{ font: "700 17px 'Source Serif 4',Georgia,serif", fill: '#1E1418' }}>{pct}%</text>
    </svg>
  )
}

export default function StudentDashboard({ user, setPage }) {
  const [, setTick] = useState(0)
  const [homework, setHomework] = useState([])
  const [exams, setExams] = useState([])
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)

  const firstName = user?.firstName || 'there'
  const gradeLabel = user?.gradeLevel || user?.grade || ''
  const curriculum = user?.curriculum || 'Cambridge IGCSE'
  const programme = user?.programme || 'Homeschool'

  // Local practice data (XP, streak, subject progress)
  let practiceHist = [], xp = 0
  try { practiceHist = JSON.parse(localStorage.getItem('sm_practice_history') || '[]') } catch { /* noop */ }
  try { xp = parseInt(localStorage.getItem('sm_practice_xp') || '0', 10) || 0 } catch { /* noop */ }
  const practiceDays = new Set(practiceHist.map(s => new Date(s.date).toDateString()))
  const streak = (() => { let c = 0; const d = new Date(); while (practiceDays.has(d.toDateString())) { c++; d.setDate(d.getDate() - 1) } return c })()
  const week = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return practiceDays.has(d.toDateString()) })
  const bySubject = {}
  practiceHist.forEach(s => { (bySubject[s.subject] = bySubject[s.subject] || []).push(s.score) })
  const subjects = Object.entries(bySubject).map(([subject, sc]) => ({ subject, pct: Math.round(sc.reduce((a, b) => a + b, 0) / sc.length), n: sc.length }))
    .sort((a, b) => b.pct - a.pct).slice(0, 4)

  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 30000); return () => clearInterval(id) }, [])

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([api.get('/homework/student/list'), api.get('/exams/student/list'), api.get('/timetable/me')])
      .then(([hw, ex, tt]) => {
        if (hw.status === 'fulfilled') setHomework(hw.value.data?.homework || hw.value.data?.data?.homework || [])
        if (ex.status === 'fulfilled') setExams(ex.value.data?.data?.exams || ex.value.data?.exams || [])
        if (tt.status === 'fulfilled') setTimetable(tt.value.data?.data?.entries || tt.value.data?.entries || [])
      }).finally(() => setLoading(false))
  }, [user?._id])

  // ── Banner video (an announcement flagged by admins) ──
  // Plays muted in its own framed panel beside the greeting; the
  // student can turn the sound on. A video that fails to load drops the
  // hero back to the layout without it.
  const [heroVideo, setHeroVideo] = useState('')
  const [muted, setMuted] = useState(true)
  const videoRef = useRef(null)
  useEffect(() => {
    let gone = false
    api.get('/announcements/hero-video').then(r => { if (!gone && r.data?.success && r.data.data?.videoUrl) setHeroVideo(r.data.data.videoUrl) }).catch(() => {})
    return () => { gone = true }
  }, [])
  const toggleSound = () => {
    const v = videoRef.current; if (!v) return
    v.muted = !muted; if (!v.muted) v.play().catch(() => {})
    setMuted(v.muted)
  }

  // ── Today ──
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()]
  const toMins = t => { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m }
  const fmt = t => { if (!t) return ''; const [h, m] = t.split(':').map(Number); let hr = h % 12 || 12; return `${hr}${m ? ':' + String(m).padStart(2, '0') : ''} ${h >= 12 ? 'PM' : 'AM'}` }
  const todays = timetable.filter(e => e.dayOfWeek === today).sort((a, b) => toMins(a.startTime) - toMins(b.startTime))
  const liveNow = todays.find(e => nowMins >= toMins(e.startTime) && nowMins < toMins(e.endTime))
  const nextClass = todays.find(e => toMins(e.startTime) > nowMins)
  const teacherOf = e => e.teacherId && (e.teacherId.firstName || e.teacherId.lastName) ? `${e.teacherId.firstName || ''} ${e.teacherId.lastName || ''}`.trim() : (e.teacherName || '')
  const until = mins => mins < 60 ? plural(mins, 'minute', 'minutes') : `${Math.floor(mins / 60)} h ${mins % 60 ? (mins % 60) + ' min' : ''}`.trim()

  const dueList = homework.filter(h => !h.locked && !h.mySubmission)
    .sort((a, b) => new Date(a.dueAt || 8.64e15) - new Date(b.dueAt || 8.64e15))
  const dayMs = 864e5
  const dueLabel = (h) => {
    if (!h.dueAt) return null
    const d = new Date(h.dueAt), diff = Math.floor((new Date(d.toDateString()) - new Date(now.toDateString())) / dayMs)
    if (d < now) return ['Overdue', 'soon']
    if (diff === 0) return ['Due today', 'soon']
    if (diff === 1) return ['Due tomorrow', 'soon']
    if (diff < 7) return [`Due in ${diff} days`, '']
    return ['Due ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), '']
  }

  const graded = exams.filter(e => e.mySubmission && ['graded', 'returned'].includes(e.mySubmission.status) && typeof e.mySubmission.percentage === 'number')
  const avg = graded.length ? Math.round(graded.reduce((a, e) => a + e.mySubmission.percentage, 0) / graded.length) : null
  const results = exams.slice(0, 4)

  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const dayLabel = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const q = QUOTES[now.getDate() % QUOTES.length]

  // Called as a function (not <NextCard/>), so a re-render never swaps the button mid-click.
  const nextCard = () => (
    <div className="sd-next">
      {liveNow ? <>
        <p className="sd-next-eb"><span className="sd-live"/> Live now</p>
        <h3>{liveNow.subject}</h3>
        <p>{fmt(liveNow.startTime)} – {fmt(liveNow.endTime)}{teacherOf(liveNow) ? ' · ' + teacherOf(liveNow) : ''}</p>
        <div className="sd-act"><button className="sd-join" onClick={() => setPage('live')}><Icon name="live" size={19}/> Join class</button></div>
      </> : nextClass ? <>
        <p className="sd-next-eb">Up next</p>
        <h3>{nextClass.subject}</h3>
        <p>{fmt(nextClass.startTime)} – {fmt(nextClass.endTime)}{teacherOf(nextClass) ? ' · ' + teacherOf(nextClass) : ''}</p>
        <div className="sd-act"><span className="sd-count">Starts in {until(toMins(nextClass.startTime) - nowMins)}</span></div>
      </> : <>
        <p className="sd-next-eb">Today</p>
        <h3>{todays.length ? 'All classes done' : 'No classes today'}</h3>
        <p>{todays.length ? 'Great work. Take a break, then practise a topic.' : 'A good day to practise or read ahead.'}</p>
        <div className="sd-act"><button className="sd-join" onClick={() => setPage('practice')}><Icon name="practice" size={19}/> Practise now</button></div>
      </>}
    </div>
  )

  return (
    <div className="sd">
      <style>{CSS}</style>

      <section className={'sd-hero' + (heroVideo ? ' has-video' : '')}>
        <div className="sd-hero-in">
          <div className="sd-left">
            <p className="sd-eb">{dayLabel}</p>
            <h2 className="sd-h1">{greeting}, <em>{firstName}</em>.</h2>
            <div className="sd-chips">
              <span className="sd-chip">{curriculum}</span>
              {gradeLabel && <span className="sd-chip">{gradeLabel}</span>}
              <span className="sd-chip" style={{ textTransform: 'capitalize' }}>{programme}</span>
              {user?.onBreak && <span className="sd-chip break">On break</span>}
            </div>
            <p className="sd-sum">
              {loading ? 'Getting your day ready…'
                : <>Today you have <b>{plural(todays.length, 'class', 'classes')}</b> and <b>{plural(dueList.length, 'homework task', 'homework tasks')}</b> to finish.</>}
            </p>
            {heroVideo && nextCard()}
          </div>
          {heroVideo ? (
            <div className="sd-video">
              <video ref={videoRef} src={heroVideo} autoPlay muted loop playsInline preload="auto" onError={() => setHeroVideo('')}/>
              <span className="sd-vtag"><i/> From Smartious</span>
              <button type="button" className="sd-sound" onClick={toggleSound} aria-label={muted ? 'Turn the sound on' : 'Turn the sound off'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  {muted
                    ? <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    : <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>}
                </svg>
                {muted ? 'Sound on' : 'Mute'}
              </button>
            </div>
          ) : nextCard()}
        </div>
      </section>

      <AnnouncementsStrip onNavigate={(mod) => {
        const map = { timetable: 'timetable', lessons: 'lessons', homework: 'homework', exams: 'exams', results: 'results', curriculum: 'curriculum', clubs: 'clubs', library: 'library', communication: 'communication', messages: 'communication', profile: 'profile', attendance: 'attendance' }
        if (map[mod]) setPage(map[mod])
      }}/>

      <div className="sd-stats">
        <div className="sd-stat"><span className="sd-ic"><Icon name="star"/></span><div><div className="sd-val">{xp.toLocaleString()}</div><div className="sd-lbl">XP earned</div></div></div>
        <div className="sd-stat"><span className="sd-ic"><Icon name="flame"/></span><div><div className="sd-val">{plural(streak, 'day', 'days')}</div><div className="sd-lbl">Study streak</div>
          <div className="sd-dots" aria-label="Practice this week">{week.map((on, i) => <i key={i} className={on ? 'on' : ''}/>)}</div></div></div>
        <div className="sd-stat"><span className="sd-ic"><Icon name="chart"/></span><div><div className="sd-val">{avg !== null ? avg + '%' : '—'}</div><div className="sd-lbl">{avg !== null ? 'Average exam score' : 'No marked exams yet'}</div></div></div>
        <div className="sd-stat"><span className="sd-ic"><Icon name="homework"/></span><div><div className="sd-val">{dueList.length}</div><div className="sd-lbl">Homework to do</div></div></div>
      </div>

      <div className="sd-grid">
        <div className="sd-col">
          <div className="sd-card">
            <div className="sd-ch"><div><small>Today</small><h4>Your classes</h4></div><button className="sd-link" onClick={() => setPage('timetable')}>Full timetable →</button></div>
            {loading ? <p className="sd-empty">Loading your timetable…</p>
              : !todays.length ? <p className="sd-empty">{['Sat', 'Sun'].includes(today) ? 'It’s the weekend. No classes today.' : 'No classes scheduled today.'}</p>
                : <ul className="sd-tl">
                  {todays.map((e, i) => {
                    const s = toMins(e.startTime), en = toMins(e.endTime)
                    const st = nowMins >= en ? 'done' : nowMins >= s ? 'live' : e === nextClass ? 'next' : 'later'
                    return (
                      <li key={e._id || i} className={st}>
                        <div><div className="sd-t1">{fmt(e.startTime)}</div><div className="sd-t2">{fmt(e.endTime)}</div></div>
                        <span className="sd-node"/>
                        <div style={{ minWidth: 0 }}><div className="sd-subj">{e.subject}</div>{teacherOf(e) && <div className="sd-teach">{teacherOf(e)}</div>}</div>
                        {st === 'live' ? <button className="sd-tag live" onClick={() => setPage('live')}>Join now</button>
                          : <span className={'sd-tag ' + st}>{st === 'done' ? 'Done' : st === 'next' ? 'Next' : 'Later'}</span>}
                      </li>
                    )
                  })}
                </ul>}
          </div>

          {subjects.length > 0 && (
            <div className="sd-card">
              <div className="sd-ch"><div><small>From your practice</small><h4>Subject progress</h4></div><button className="sd-link" onClick={() => setPage('results')}>All results →</button></div>
              <div className="sd-rings">
                {subjects.map(s => (
                  <div key={s.subject} className="sd-ring">
                    <Ring pct={s.pct}/>
                    <b>{s.subject}</b>
                    <span>Grade {gl(s.pct)} · {plural(s.n, 'session', 'sessions')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="sd-card">
              <div className="sd-ch"><div><small>Assessments</small><h4>Recent exams</h4></div><button className="sd-link" onClick={() => setPage('exams')}>All exams →</button></div>
              <ul className="sd-res">
                {results.map(e => {
                  const sub = e.mySubmission
                  const marked = sub && ['graded', 'returned'].includes(sub.status) && typeof sub.percentage === 'number'
                  const when = e.startAt ? new Date(e.startAt) : null
                  const status = marked ? null
                    : sub && sub.status === 'submitted' ? 'Submitted · awaiting marks'
                      : e.computedStatus === 'active' ? 'Open now'
                        : e.computedStatus === 'scheduled' ? 'Upcoming' + (when ? ' · ' + when.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '')
                          : 'Closed'
                  const [bg, fg] = marked ? gcol(sub.percentage) : ['', '']
                  return (
                    <li key={e._id}>
                      {marked
                        ? <span className="sd-badge" style={{ background: bg, color: fg }}>{Math.round(sub.percentage)}%<small>{gl(sub.percentage)}</small></span>
                        : <span className="sd-badge wait"><Icon name="exams" size={22}/></span>}
                      <div className="sd-rt"><b>{e.title}</b><span>{e.subject}{status ? ' · ' + status : when ? ' · ' + when.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}</span></div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="sd-col">
          <div className="sd-card">
            <div className="sd-ch"><div><small>Homework</small><h4>Due soon</h4></div>{dueList.length > 0 && <span className="sd-tag next">{dueList.length} to do</span>}</div>
            {loading ? <p className="sd-empty">Loading…</p>
              : !dueList.length ? <p className="sd-empty">You’re all caught up. Nothing to hand in.</p>
                : <>
                  <ul className="sd-hw">
                    {dueList.slice(0, 4).map((h, i) => {
                      const d = dueLabel(h)
                      return (
                        <li key={h._id || i}>
                          <span className="sd-ic soft"><Icon name="homework" size={20}/></span>
                          <div style={{ minWidth: 0 }}>
                            <div className="sd-subj" style={{ fontSize: 14.5 }}>{h.title}</div>
                            <div className="sd-teach">{h.subject}</div>
                            {d && <span className={'sd-due ' + d[1]}>{d[0]}</span>}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                  <button className="sd-btn" onClick={() => setPage('homework')}>Open homework →</button>
                </>}
          </div>

          <div className="sd-card">
            <div className="sd-ch"><div><small>Shortcuts</small><h4>Jump to</h4></div></div>
            <div className="sd-jump">
              {[['practice', 'Practice'], ['homework', 'Homework'], ['live', 'Live class'], ['timetable', 'Timetable'], ['exams', 'Exams'], ['library', 'Library']].map(([k, label]) => (
                <button key={k} onClick={() => setPage(k)}><span className="sd-ic"><Icon name={k} size={20}/></span>{label}</button>
              ))}
            </div>
          </div>

          <div className="sd-quote">
            <span className="sd-star" aria-hidden="true">{STAR}</span>
            <small>Daily affirmation</small>
            <span className="mk" aria-hidden="true">“</span>
            <p>{q.text}</p>
            <span>— {q.author}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
