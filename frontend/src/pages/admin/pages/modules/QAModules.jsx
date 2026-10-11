/**
 * QAModules.jsx — the QA portal.
 * ============================================================
 *   QAOverviewModule      — the QA dashboard: staff-file completeness,
 *     expiring documents, training reach, accreditation health and a
 *     printable evidence pack for accreditation visits.
 *   TeamProfilesModule    — every staff member's profile (the Principal,
 *                           leadership, operations and every kind of
 *                           teacher), personnel file
 *     (required documents with expiry and QA verification), teaching
 *     documents and professional development, one click deep.
 *   TDPModule             — Teacher Development Programme: trainings
 *     with photos, outcomes and attendance; hours per teacher.
 *   AccreditationsModule  — the school's accreditations, licences,
 *     memberships and registrations with their certificates.
 * Teacher files are oversight only (admin, ops, dos, qa); writes are
 * enforced on the server.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { PCard, PSection } from '../shared/ui.jsx'

const CR = TOKENS.crimson
const GOLD = TOKENS.gold
const LINE = TOKENS.line
const OK = '#15803D', WARN = '#B45309', BAD = '#B91C1C'

const inp = { width: '100%', boxSizing: 'border-box', border: '1.5px solid ' + LINE, borderRadius: 8, padding: '9px 11px', fontSize: 12.5, outline: 'none', fontFamily: 'inherit', background: '#fff', color: TOKENS.ink }
const btnP = { background: CR, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }
const btnG = { background: '#fff', color: TOKENS.s700, border: '1.5px solid ' + LINE, borderRadius: 9, padding: '9px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }
const btnS = { ...btnG, padding: '5px 11px', fontSize: 11.5 }
const chip = (bg, fg) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 10.5, fontWeight: 800, background: bg, color: fg, letterSpacing: '.03em', whiteSpace: 'nowrap' })
const lbl = { fontSize: 10.5, fontWeight: 800, color: TOKENS.s500, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }
const h3 = { fontSize: 12.5, fontWeight: 800, color: CR, letterSpacing: '.1em', textTransform: 'uppercase', margin: '0 0 12px' }

const DAY = 86400000
const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
const daysUntil = (d) => Math.ceil((new Date(d).getTime() - Date.now()) / DAY)
const fullName = (u) => [u?.firstName, u?.lastName].filter(Boolean).join(' ')
const isImage = (url = '', mime = '') => /^image\//.test(mime) || /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url)
const pctColor = (p) => p >= 100 ? OK : p >= 60 ? WARN : BAD
const errMsg = (e, fallback) => e?.response?.data?.message || fallback

const TRAINING_CATEGORIES = ['Pedagogy', 'Curriculum', 'Assessment', 'Subject knowledge', 'ICT & digital', 'Safeguarding', 'Inclusion & SEN', 'Leadership', 'Wellbeing', 'Other']
const ACC_TYPES = ['Accreditation', 'License', 'Membership', 'Registration', 'Other']

// ── Uploads (presigned straight to R2) ─────────────────────
async function putToR2(uploadUrl, file) {
  const put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file })
  if (!put.ok) throw new Error('Upload failed (' + put.status + ').')
}

// TDP photos/files and accreditation certificates.
async function uploadEvidence(file, kind, toast) {
  try {
    const { data } = await api.post('/qa/uploads/presign', { fileName: file.name, mimeType: file.type, fileSize: file.size, kind })
    if (!data?.success) { toast?.error?.(data?.message || 'Upload refused.'); return null }
    await putToR2(data.data.uploadUrl, file)
    return { url: data.data.publicUrl, key: data.data.r2Key, name: file.name }
  } catch (e) {
    toast?.error?.(errMsg(e, e?.message || 'Upload failed.'))
    return null
  }
}

// A document filed into a teacher's file by QA / oversight staff.
async function uploadTeacherDoc(teacherId, file, meta) {
  const pre = await api.post('/teacher-documents/presign', { fileName: file.name, mimeType: file.type, fileSize: file.size, forTeacherId: teacherId })
  if (!pre.data?.success) throw new Error(pre.data?.message || 'Upload refused.')
  await putToR2(pre.data.data.uploadUrl, file)
  const { data } = await api.post('/teacher-documents/confirm', {
    r2Key: pre.data.data.r2Key, fileName: file.name, mimeType: file.type, fileSize: file.size, ...meta,
  })
  if (!data?.success) throw new Error(data?.message || 'Could not save the document.')
  return data.data.document
}

// ── Small building blocks ──────────────────────────────────
function Ring({ pct = 0, size = 46, stroke = 5 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const p = Math.max(0, Math.min(100, pct))
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }} aria-label={p + '% complete'}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TOKENS.s100} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={pctColor(p)} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${(p / 100) * c} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize={size * 0.26} fontWeight="800" fill={TOKENS.s900}>{p}%</text>
    </svg>
  )
}

function Avatar({ user, size = 52, radius = 13 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden', background: `linear-gradient(135deg,${CR},#3D0712)`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, fontSize: size * 0.36, fontWeight: 800 }}>
      {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ((user?.firstName || '?')[0] || '?')}
    </div>
  )
}

function Stat({ label, value, sub, color = TOKENS.s900 }) {
  return (
    <div style={{ background: '#fff', border: '1px solid ' + TOKENS.s100, borderRadius: 14, padding: '14px 18px', flex: '1 1 160px', minWidth: 150 }}>
      <div style={lbl}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 500, color, lineHeight: 1.05 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function Empty({ children }) {
  return <PCard><div style={{ padding: 18, textAlign: 'center', color: TOKENS.s500, fontSize: 13 }}>{children}</div></PCard>
}

function Loading() {
  return <div style={{ color: TOKENS.s500, fontSize: 13, padding: '12px 0' }}>Loading...</div>
}

function Modal({ title, onClose, width = 620, children, footer }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-label={title}
        style={{ background: '#fff', borderRadius: 14, width: `min(${width}px,100%)`, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid ' + LINE, display: 'flex', alignItems: 'center', gap: 10 }}>
          <b style={{ fontSize: 15, color: TOKENS.s900, flex: 1 }}>{title}</b>
          <button onClick={onClose} aria-label="Close" style={{ ...btnS, padding: '3px 9px' }}>✕</button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', display: 'grid', gap: 12 }}>{children}</div>
        {footer && <div style={{ padding: '12px 20px', borderTop: '1px solid ' + LINE, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  )
}

function Field({ label, children, hint }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={lbl}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 4 }}>{hint}</div>}
    </label>
  )
}

// Full-screen photo viewer with captions and arrow-key navigation.
function Lightbox({ items, index, onClose }) {
  const [i, setI] = useState(index)
  const n = items.length
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI(x => (x + 1) % n)
      if (e.key === 'ArrowLeft') setI(x => (x - 1 + n) % n)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [n, onClose])
  const it = items[i]
  if (!it) return null
  const nav = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: 99, width: 44, height: 44, fontSize: 22, cursor: 'pointer' }
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,6,6,.92)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <img src={it.url} alt={it.caption || ''} onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 10, objectFit: 'contain' }} />
      <div style={{ color: '#fff', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{it.caption || ''}{n > 1 ? `  ·  ${i + 1} / ${n}` : ''}</div>
      {n > 1 && <>
        <button aria-label="Previous" onClick={e => { e.stopPropagation(); setI((i - 1 + n) % n) }} style={{ ...nav, left: 16 }}>‹</button>
        <button aria-label="Next" onClick={e => { e.stopPropagation(); setI((i + 1) % n) }} style={{ ...nav, right: 16 }}>›</button>
      </>}
    </div>
  )
}

function FileTile({ url, name, mime, onClick }) {
  if (isImage(url, mime)) {
    return <img src={url} alt={name || ''} onClick={onClick} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: onClick ? 'zoom-in' : 'default' }} />
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: TOKENS.goldPale, color: CR, textDecoration: 'none', gap: 4 }}>
      <span style={{ fontSize: 20, fontWeight: 900 }}>{(String(name || url).split('.').pop() || 'FILE').slice(0, 4).toUpperCase()}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: TOKENS.s700 }}>Open</span>
    </a>
  )
}

// ═══════════════════════════════════════════════════════════
// EVIDENCE PACK — a printable summary for accreditation visits
// ═══════════════════════════════════════════════════════════
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export async function printEvidencePack(toast) {
  // Open the window first: browsers block pop-ups opened after an await.
  const w = window.open('', '_blank')
  if (!w) { toast?.error?.('Allow pop-ups for this site to print the evidence pack.'); return }
  w.document.write('<p style="font-family:sans-serif;padding:24px">Preparing the evidence pack...</p>')
  try {
    const [s, t, tr, ac] = await Promise.all([
      api.get('/qa/summary'), api.get('/qa/team'), api.get('/qa/trainings'), api.get('/qa/accreditations'),
    ])
    const sum = s.data?.data || {}
    const teachers = t.data?.data?.team || t.data?.data?.teachers || []
    const meta = t.data?.data?.categoryMeta || []
    const required = t.data?.data?.required || []
    const trainings = tr.data?.data?.trainings || []
    const accs = ac.data?.data?.accreditations || []
    const label = Object.fromEntries(meta.map(c => [c.key, c.label]))
    const accState = (a) => !a.expiresAt ? 'No expiry' : daysUntil(a.expiresAt) < 0 ? 'EXPIRED ' + fmtD(a.expiresAt) : 'Valid until ' + fmtD(a.expiresAt)
    const totalHours = trainings.reduce((x, y) => x + (y.durationHours || 0), 0)

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>QA Evidence Pack — Smartious</title>
<style>
  body{font-family:Georgia,'Times New Roman',serif;color:#1A0F0E;margin:32px;font-size:12px}
  h1{font-size:26px;margin:0;color:#7D1025} h2{font-size:16px;color:#7D1025;border-bottom:2px solid #C9A030;padding-bottom:4px;margin:28px 0 10px;page-break-after:avoid}
  .sub{color:#6B6B6B;font-family:sans-serif;font-size:11px} table{width:100%;border-collapse:collapse;font-family:sans-serif;font-size:10.5px}
  th,td{border:1px solid #E0D6CC;padding:5px 6px;text-align:left;vertical-align:top} th{background:#FBF6E3}
  .ok{color:#15803D;font-weight:700} .bad{color:#B91C1C;font-weight:700} .kpis{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
  .kpi{border:1px solid #E0D6CC;border-radius:8px;padding:8px 12px;font-family:sans-serif;min-width:120px} .kpi b{display:block;font-size:18px}
  @media print{body{margin:12mm}}
</style></head><body>
<h1>Quality Assurance Evidence Pack</h1>
<div class="sub">Smartious Homeschool Global · generated ${esc(fmtD(new Date()))}</div>
<div class="kpis">
  <div class="kpi"><b>${esc(sum.team?.complete ?? 0)} / ${esc(sum.team?.total ?? 0)}</b>complete staff files</div>
  <div class="kpi"><b>${esc(sum.team?.avgCompleteness ?? 0)}%</b>average file completeness</div>
  <div class="kpi"><b>${esc(trainings.length)}</b>trainings on record</div>
  <div class="kpi"><b>${esc(totalHours)}</b>training hours</div>
  <div class="kpi"><b>${esc(sum.training?.coveragePct ?? 0)}%</b>teachers trained this year</div>
  <div class="kpi"><b>${esc(accs.length)}</b>accreditations &amp; licences</div>
</div>

<h2>1. Accreditations, licences and registrations</h2>
<table><tr><th>Name</th><th>Type</th><th>Issuing body</th><th>Certificate no.</th><th>Issued</th><th>Status</th><th>Scope</th><th>Certificates</th></tr>
${accs.map(a => `<tr><td>${esc(a.name)}</td><td>${esc(a.type)}</td><td>${esc(a.body)}</td><td>${esc(a.certificateNumber)}</td><td>${esc(fmtD(a.issuedAt))}</td><td class="${a.expiresAt && daysUntil(a.expiresAt) < 0 ? 'bad' : 'ok'}">${esc(accState(a))}</td><td>${esc((a.scope || []).join(', '))}</td><td>${(a.documents || []).length ? (a.documents || []).map(d => `<a href="${esc(d.url)}">${esc(d.name || 'Certificate')}</a>`).join('<br>') : '<span class="bad">None uploaded</span>'}</td></tr>`).join('') || '<tr><td colspan="8">None recorded.</td></tr>'}
</table>

<h2>2. Staff file register</h2>
<table><tr><th>Name</th><th>Role</th><th>Experience</th>${required.map(k => `<th>${esc(label[k] || k)}</th>`).join('')}<th>Complete</th><th>Training hrs</th></tr>
${teachers.map(x => `<tr><td>${esc(fullName(x))}</td><td>${esc(x.teamTitle || x.jobTitle || 'Teacher')}</td><td>${esc(x.yearsOfExperience ? x.yearsOfExperience + ' yrs' : '')}</td>${required.map(k => !(x.file?.requiredKeys || required).includes(k) ? '<td>n/a</td>' : (x.file?.missing || []).includes(k) ? '<td class="bad">✕</td>' : '<td class="ok">✓</td>').join('')}<td>${esc(x.file?.have ?? 0)}/${esc(x.file?.required ?? required.length)}</td><td>${esc(x.training?.hours || 0)}</td></tr>`).join('')}
</table>

<h2>3. Teacher Development Programme</h2>
<table><tr><th>Date</th><th>Training</th><th>Category</th><th>Provider</th><th>Mode</th><th>Hours</th><th>Attendees</th><th>Outcomes</th></tr>
${trainings.map(x => `<tr><td>${esc(fmtD(x.trainingDate))}</td><td>${esc(x.title)}</td><td>${esc(x.category || '')}</td><td>${esc(x.provider)}</td><td>${esc(x.mode)}</td><td>${esc(x.durationHours || 0)}</td><td>${esc((x.attendees || []).map(fullName).join(', '))}</td><td>${esc(x.outcomes || x.description || '')}</td></tr>`).join('') || '<tr><td colspan="8">No trainings recorded.</td></tr>'}
</table>
<script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>
</body></html>`
    w.document.open(); w.document.write(html); w.document.close()
  } catch (e) {
    w.document.body.innerHTML = '<p style="font-family:sans-serif;padding:24px;color:#B91C1C">Could not build the evidence pack: ' + esc(errMsg(e, e?.message || 'error')) + '</p>'
  }
}

// One teacher's profile, staff file and training record.
function printTeacherProfile(p) {
  const w = window.open('', '_blank')
  if (!w) return
  const t = p.member || p.teacher
  const req = new Set(p.required || p.file.requiredKeys || [])
  const meta = (p.categoryMeta || []).map(c => ({ ...c, required: req.size ? req.has(c.key) : c.required }))
  const byCat = {}
  for (const d of p.documents) (byCat[d.category] = byCat[d.category] || []).push(d)
  const rows = meta.filter(c => c.group === 'personnel').map(c => {
    const docs = byCat[c.key] || []
    const missing = (p.file.missing || []).includes(c.key)
    const status = docs.length === 0 ? (c.required ? '<span class="bad">Missing</span>' : '—') : missing ? '<span class="bad">Expired</span>' : '<span class="ok">On file</span>'
    const detail = docs.map(d => esc(d.title) + (d.expiresAt ? ' (expires ' + esc(fmtD(d.expiresAt)) + ')' : '') + (d.verifiedAt ? ' ✓ verified ' + esc(fmtD(d.verifiedAt)) : '')).join('<br>')
    return `<tr><td>${esc(c.label)}${c.required ? ' *' : ''}</td><td>${status}</td><td>${detail}</td></tr>`
  }).join('')
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(fullName(t))} — Team profile</title>
<style>body{font-family:Georgia,serif;color:#1A0F0E;margin:32px;font-size:12px}h1{color:#7D1025;margin:0;font-size:24px}
h2{font-size:15px;color:#7D1025;border-bottom:2px solid #C9A030;padding-bottom:3px;margin:22px 0 8px}
table{width:100%;border-collapse:collapse;font-family:sans-serif;font-size:11px}th,td{border:1px solid #E0D6CC;padding:5px 6px;text-align:left;vertical-align:top}th{background:#FBF6E3}
.ok{color:#15803D;font-weight:700}.bad{color:#B91C1C;font-weight:700}.sub{font-family:sans-serif;color:#6B6B6B}</style></head><body>
<h1>${esc(fullName(t))}</h1>
<div class="sub">${esc(t.teamTitle || t.jobTitle || 'Teacher')}${t.jobTitle && t.jobTitle !== t.teamTitle ? ' · ' + esc(t.jobTitle) : ''}${t.yearsOfExperience ? ' · ' + esc(t.yearsOfExperience) + ' years experience' : ''} · ${esc([t.email, t.phone].filter(Boolean).join(' · '))}</div>
${t.bio ? `<p>${esc(t.bio)}</p>` : ''}
${(t.qualifications || []).length ? `<h2>Qualifications</h2>${t.qualifications.map(q => `<div>${esc(q)}</div>`).join('')}` : ''}
${(t.certifications || []).length ? `<h2>Certifications</h2>${t.certifications.map(q => `<div>${esc(q)}</div>`).join('')}` : ''}
<h2>Staff file — ${esc(p.file.have)}/${esc(p.file.required)} required documents (${esc(p.file.pct)}%)</h2>
<table><tr><th>Document</th><th>Status</th><th>Detail</th></tr>${rows}</table>
<h2>Professional development — ${esc(p.trainingHours)} hours</h2>
<table><tr><th>Date</th><th>Training</th><th>Category</th><th>Provider</th><th>Hours</th></tr>
${p.trainings.map(x => `<tr><td>${esc(fmtD(x.trainingDate))}</td><td>${esc(x.title)}</td><td>${esc(x.category || '')}</td><td>${esc(x.provider || '')}</td><td>${esc(x.durationHours || 0)}</td></tr>`).join('') || '<tr><td colspan="5">None recorded.</td></tr>'}</table>
<p class="sub">Printed ${esc(fmtD(new Date()))} · Smartious Homeschool Global</p>
<script>window.onload=function(){setTimeout(function(){window.print()},300)}</script></body></html>`)
  w.document.close()
}

// ═══════════════════════════════════════════════════════════
// 0. QA OVERVIEW (dashboard)
// ═══════════════════════════════════════════════════════════
export function QAOverviewModule({ toast, setPage }) {
  const [s, setS] = useState(null)
  const [err, setErr] = useState('')
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    api.get('/qa/summary')
      .then(r => setS(r.data?.data || null))
      .catch(e => setErr(errMsg(e, 'Could not load the QA summary.')))
  }, [])

  const go = (p) => setPage && setPage(p)
  const t = s?.team || s?.teachers, d = s?.documents, tr = s?.training, ac = s?.accreditations

  return (
    <>
      <PSection tag="QA Portal" title="Quality" em="Assurance"
        sub="Staff files, teacher development and accreditation evidence — ready for any inspection."
        action={<button style={btnP} onClick={() => printEvidencePack(toast)}>Print evidence pack</button>} />
      {err && <Empty>{err}</Empty>}
      {!s && !err && <Loading />}
      {s && <>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
          <Stat label="Complete staff files" value={`${t.complete}/${t.total}`} sub={`${t.avgCompleteness}% average completeness`} color={pctColor(t.avgCompleteness)} />
          <Stat label="Documents verified" value={`${d.verified}/${d.total}`} sub={d.expiringCount ? `${d.expiringCount} expired or expiring` : 'none expiring'} color={d.expiringCount ? WARN : TOKENS.s900} />
          <Stat label="Trainings this year" value={tr.thisYear} sub={`${tr.hoursThisYear} hours · ${tr.total} on record`} />
          <Stat label="Teachers trained" value={`${tr.coveragePct}%`} sub={`${tr.teachersReachedThisYear} of ${t.teachers ?? t.total} this year`} color={pctColor(tr.coveragePct)} />
          <Stat label="Accreditations" value={`${ac.valid + ac.permanent}/${ac.total}`} sub={ac.expired ? `${ac.expired} expired` : ac.expiring ? `${ac.expiring} expiring soon` : 'all in date'} color={ac.expired ? BAD : ac.expiring ? WARN : OK} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginBottom: 14 }}>
          <PCard padding={18}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ ...h3, margin: 0, flex: 1 }}>Staff files needing attention</h3>
              <button style={btnS} onClick={() => go('teacherprofiles')}>Team profiles</button>
            </div>
            {t.attention.length === 0 ? <div style={{ fontSize: 13, color: OK, fontWeight: 700 }}>Every staff file is complete.</div> :
              t.attention.map(x => (
                <div key={x._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '1px solid ' + TOKENS.s100 }}>
                  <Avatar user={{ avatar: x.avatar, firstName: x.name }} size={30} radius={8} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: TOKENS.s900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.name}{x.title ? <span style={{ fontWeight: 500, color: TOKENS.s500 }}> · {x.title}</span> : null}</div>
                    <div style={{ height: 5, background: TOKENS.s100, borderRadius: 9, marginTop: 4 }}>
                      <div style={{ width: x.pct + '%', height: '100%', background: pctColor(x.pct), borderRadius: 9 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: TOKENS.s500, whiteSpace: 'nowrap' }}>{x.missing} missing</span>
                </div>
              ))}
          </PCard>

          <PCard padding={18}>
            <h3 style={h3}>Expired &amp; expiring documents</h3>
            {d.expiring.length === 0 ? <div style={{ fontSize: 13, color: OK, fontWeight: 700 }}>Nothing expiring in the next 60 days.</div> :
              d.expiring.map((x, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0', borderTop: '1px solid ' + TOKENS.s100 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: TOKENS.s900 }}>{x.teacher}</div>
                    <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>{x.label}</div>
                  </div>
                  <span style={chip(x.expired ? '#FEE2E2' : '#FEF3C7', x.expired ? BAD : WARN)}>
                    {x.expired ? 'Expired ' + fmtD(x.expiresAt) : 'Expires in ' + daysUntil(x.expiresAt) + 'd'}
                  </span>
                </div>
              ))}
          </PCard>

          <PCard padding={18}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ ...h3, margin: 0, flex: 1 }}>Accreditation alerts</h3>
              <button style={btnS} onClick={() => go('accreditations')}>Open</button>
            </div>
            {ac.total === 0 ? <div style={{ fontSize: 13, color: TOKENS.s500 }}>No accreditations recorded yet.</div> :
              ac.alerts.length === 0 ? <div style={{ fontSize: 13, color: OK, fontWeight: 700 }}>All accreditations are in date with certificates on file.</div> :
                ac.alerts.map((x, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0', borderTop: '1px solid ' + TOKENS.s100 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: TOKENS.s900 }}>{x.name}</div>
                      <div style={{ fontSize: 11.5, color: TOKENS.s500 }}>{x.body || x.type}</div>
                    </div>
                    <span style={chip(x.status === 'expired' ? '#FEE2E2' : '#FEF3C7', x.status === 'expired' ? BAD : WARN)}>
                      {x.status === 'no-certificate' ? 'No certificate' : x.status === 'expired' ? 'Expired' : 'Expires in ' + daysUntil(x.expiresAt) + 'd'}
                    </span>
                  </div>
                ))}
          </PCard>
        </div>

        <PCard padding={18}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ ...h3, margin: 0, flex: 1 }}>Recent teacher development</h3>
            <button style={btnS} onClick={() => go('tdp')}>Teacher Development</button>
          </div>
          {tr.recent.length === 0 ? <div style={{ fontSize: 13, color: TOKENS.s500 }}>No trainings recorded yet.</div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {tr.recent.map(x => (
                <div key={x._id} style={{ border: '1px solid ' + LINE, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ height: 120, background: TOKENS.goldPale }}>
                    {x.photos?.[0] ? <img src={x.photos[0].url} alt="" onClick={() => setLightbox({ items: x.photos, index: 0 })} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }} />
                      : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, fontWeight: 800, fontSize: 12 }}>No photos</div>}
                  </div>
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: TOKENS.s900 }}>{x.title}</div>
                    <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 2 }}>{fmtD(x.trainingDate)} · {x.durationHours || 0}h · {(x.attendees || []).length} teachers</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PCard>

        <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 12 }}>
          Required in every staff file: {t.requiredCategories.map(c => c.label).join(' · ')}.
        </div>
      </>}
      {lightbox && <Lightbox items={lightbox.items} index={lightbox.index} onClose={() => setLightbox(null)} />}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// 1. TEACHER PROFILES
// ═══════════════════════════════════════════════════════════
const TEACHER_CATS = [
  { key: 'teacher', label: 'Teacher', short: 'Teachers' },
  { key: 'trainee', label: 'Teacher in training', short: 'In training' },
  { key: 'support', label: 'Support teacher', short: 'Support teachers' },
]
const CAT_STYLE = {
  teacher: [TOKENS.goldPale, '#92400E'],
  trainee: ['#E0F2FE', '#0369A1'],
  support: ['#EDE9FE', '#5B21B6'],
}
const titleOf = (u) => u.teamTitle || (u.role === 'teacher' ? 'Teacher' : u.role === 'admin' ? 'Principal' : 'Staff')
const TitleChip = ({ u }) => {
  if (u.role === 'admin') return <span style={{ ...chip('linear-gradient(135deg,#7D1025,#5A0B1B)', '#F0CC5A'), border: '1px solid #C9A030' }}>★ Principal</span>
  if (u.role === 'teacher') { const [bg, fg] = CAT_STYLE[u.teacherCategory || 'teacher']; return <span style={chip(bg, fg)}>{titleOf(u)}</span> }
  return <span style={chip(TOKENS.s50, TOKENS.s700)}>{titleOf(u)}</span>
}

export function TeamProfilesModule({ toast }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('all')     // all | leadership | teaching | teacher | trainee | support | operations
  const [show, setShow] = useState('all')       // all | incomplete | complete | attention
  const [sort, setSort] = useState('team')      // team | name | file | training
  const [selId, setSelId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/qa/team')
      .then(r => setRows(r.data?.data?.team || r.data?.data?.teachers || []))
      .catch(e => toast?.error?.(errMsg(e, 'Could not load the team.')))
      .finally(() => setLoading(false))
  }, [toast])
  useEffect(() => { load() }, [load])

  const inGroup = (t) => group === 'all' ? true
    : ['teacher', 'trainee', 'support'].includes(group) ? t.role === 'teacher' && (t.teacherCategory || 'teacher') === group
      : t.group === group

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    let out = rows.filter(t => inGroup(t) && (!q || (fullName(t) + ' ' + titleOf(t) + ' ' + (t.jobTitle || '') + ' ' + (t.subjects || []).join(' ')).toLowerCase().includes(q)))
    if (show === 'incomplete') out = out.filter(t => t.file.have < t.file.required)
    if (show === 'complete') out = out.filter(t => t.file.have === t.file.required)
    if (show === 'attention') out = out.filter(t => t.file.expired.length || t.file.expiring.length)
    if (sort === 'team') return out   // server order: Principal, leadership, teaching, operations
    const by = { name: (a, b) => fullName(a).localeCompare(fullName(b)), file: (a, b) => a.file.pct - b.file.pct, training: (a, b) => b.training.hours - a.training.hours }
    return [...out].sort(by[sort])
  }, [rows, search, group, show, sort])   // eslint-disable-line react-hooks/exhaustive-deps

  if (selId) return <MemberProfile id={selId} toast={toast} onBack={() => { setSelId(null); load() }} />

  const teachers = rows.filter(t => t.role === 'teacher')
  const count = (k) => teachers.filter(t => (t.teacherCategory || 'teacher') === k).length
  const complete = rows.filter(t => t.file.have === t.file.required).length
  const avg = rows.length ? Math.round(rows.reduce((s, t) => s + t.file.pct, 0) / rows.length) : 0
  const hours = rows.reduce((s, t) => s + (t.training.hours || 0), 0)
  const groups = [
    ['all', 'Everyone', rows.length],
    ['leadership', 'Leadership', rows.filter(t => t.group === 'leadership').length],
    ['teaching', 'All teaching staff', teachers.length],
    ...TEACHER_CATS.map(c => [c.key, c.short, count(c.key)]),
    ['operations', 'Operations', rows.filter(t => t.group === 'operations').length],
  ]

  return (
    <>
      <PSection tag="QA Portal" title="Team" em="Profiles"
        sub="Everyone at Smartious: the Principal, leadership, operations and every teacher. Each profile holds the staff file their role requires and their professional development." />
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <Stat label="Team members" value={rows.length} sub={`${teachers.length} teaching · ${rows.length - teachers.length} leadership & operations`} />
        <Stat label="Teachers" value={count('teacher')} sub={`${count('trainee')} in training · ${count('support')} support`} />
        <Stat label="Complete files" value={`${complete}/${rows.length}`} color={pctColor(rows.length ? (complete / rows.length) * 100 : 0)} />
        <Stat label="Average completeness" value={avg + '%'} color={pctColor(avg)} />
        <Stat label="Training hours" value={hours} sub="whole team, all time" />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {groups.map(([k, l, n]) => (
          <button key={k} onClick={() => setGroup(k)} style={{ ...btnS, borderRadius: 99, ...(group === k ? { borderColor: CR, color: '#fff', background: CR } : {}) }}>
            {l} <span style={{ opacity: .7, fontWeight: 600 }}>{n}</span>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <input style={{ ...inp, maxWidth: 280 }} placeholder="Search name, title or subject..." value={search} onChange={e => setSearch(e.target.value)} />
        {[['all', 'All files'], ['incomplete', 'Incomplete'], ['attention', 'Expired / expiring'], ['complete', 'Complete']].map(([k, l]) => (
          <button key={k} onClick={() => setShow(k)} style={{ ...btnS, ...(show === k ? { borderColor: CR, color: CR, background: '#FDF2F4' } : {}) }}>{l}</button>
        ))}
        <select style={{ ...inp, width: 'auto' }} value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort">
          <option value="team">Sort: by role</option><option value="name">Sort: name</option><option value="file">Sort: least complete first</option><option value="training">Sort: most trained</option>
        </select>
      </div>
      {loading ? <Loading /> : list.length === 0 ? <Empty>No one matches.</Empty> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {list.map(t => (
            <button key={t._id} onClick={() => setSelId(t._id)} className="qa-team-card"
              style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', padding: 0, cursor: 'pointer', fontFamily: 'inherit', background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid ' + (t.role === 'admin' ? GOLD : LINE), boxShadow: t.role === 'admin' ? '0 0 0 1px ' + GOLD : '0 1px 3px rgba(26,15,14,.05)' }}>
              <div style={{ position: 'relative', height: 210, background: `linear-gradient(135deg,${CR},#3D0712)` }}>
                {t.avatar
                  ? <img src={t.avatar} alt="" className="qa-team-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 64 }}>{((t.firstName || '?')[0] || '') + ((t.lastName || '')[0] || '')}</div>}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(20,8,6,.78))' }} />
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,.94)', borderRadius: 99, padding: 3 }}><Ring pct={t.file.pct} size={44} stroke={5} /></div>
                <div style={{ position: 'absolute', left: 16, right: 16, bottom: 14, color: '#fff' }}>
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 21, lineHeight: 1.15, textShadow: '0 1px 8px rgba(0,0,0,.35)' }}>{fullName(t)}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#F0CC5A', marginTop: 3, letterSpacing: '.03em' }}>
                    {t.jobTitle && t.jobTitle !== titleOf(t) ? t.jobTitle : titleOf(t)}
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <TitleChip u={t} />
                  {t.yearsOfExperience ? <span style={chip(TOKENS.s50, TOKENS.s700)}>{t.yearsOfExperience} yrs experience</span> : null}
                </div>
                {t.bio && <div style={{ fontSize: 12.5, color: TOKENS.s600 || TOKENS.s700, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.bio}</div>}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                  <span style={chip(TOKENS.s50, TOKENS.s700)}>File {t.file.have}/{t.file.required}</span>
                  {(t.training.hours || 0) > 0 && <span style={chip(TOKENS.goldPale, '#92400E')}>{t.training.hours}h training</span>}
                  {t.file.expired.length > 0 && <span style={chip('#FEE2E2', BAD)}>{t.file.expired.length} expired</span>}
                  {t.file.expiring.length > 0 && <span style={chip('#FEF3C7', WARN)}>{t.file.expiring.length} expiring</span>}
                  {t.isOnLeave && <span style={chip('#E0E7FF', '#3730A3')}>On leave</span>}
                </div>
              </div>
            </button>
          ))}
          <style>{`.qa-team-card{transition:transform .25s,box-shadow .25s}.qa-team-card:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(26,15,14,.14)!important}.qa-team-img{transition:transform .5s}.qa-team-card:hover .qa-team-img{transform:scale(1.04)}`}</style>
        </div>
      )}
    </>
  )
}
// Older import name.
export const TeacherProfilesModule = TeamProfilesModule

function docState(d) {
  if (d.expiresAt) {
    const n = daysUntil(d.expiresAt)
    if (n < 0) return { text: 'Expired ' + fmtD(d.expiresAt), bg: '#FEE2E2', fg: BAD }
    if (n <= 60) return { text: 'Expires in ' + n + 'd', bg: '#FEF3C7', fg: WARN }
    return { text: 'Valid to ' + fmtD(d.expiresAt), bg: '#DCFCE7', fg: OK }
  }
  return null
}

function MemberProfile({ id, toast, onBack }) {
  const [p, setP] = useState(null)
  const [upload, setUpload] = useState(null)     // { category } when open
  const [busy, setBusy] = useState('')
  const [titleDraft, setTitleDraft] = useState(null)

  const load = useCallback(() => {
    api.get('/qa/team/' + id)
      .then(r => setP(r.data?.data || null))
      .catch(e => toast?.error?.(errMsg(e, 'Could not load this profile.')))
  }, [id, toast])

  const saveRole = async (patch) => {
    setBusy('role')
    try {
      const { data } = await api.patch('/qa/team/' + id, patch)
      toast?.ok?.(data?.message || 'Saved.'); setTitleDraft(null); load()
    } catch (e) { toast?.error?.(errMsg(e, 'Could not save.')) }
    setBusy('')
  }
  useEffect(() => { load() }, [load])

  const verify = async (d) => {
    setBusy(d._id)
    try {
      const { data } = await api.patch('/teacher-documents/' + d._id + '/verify', { verified: !d.verifiedAt })
      toast?.ok?.(data?.message || 'Updated.'); load()
    } catch (e) { toast?.error?.(errMsg(e, 'Could not update verification.')) }
    setBusy('')
  }
  const remove = async (d) => {
    if (!window.confirm('Delete "' + d.title + '" from this staff file?')) return
    setBusy(d._id)
    try { await api.delete('/teacher-documents/' + d._id); toast?.ok?.('Deleted.'); load() }
    catch (e) { toast?.error?.(errMsg(e, 'Could not delete. Only the uploader or an admin can delete.')) }
    setBusy('')
  }

  if (!p) return (<><button onClick={onBack} style={{ ...btnG, marginBottom: 14 }}>← Team</button><Loading /></>)

  const t = p.member || p.teacher
  const isTeacher = t.role === 'teacher'
  const req = new Set(p.required || p.file.requiredKeys || [])
  const meta = (p.categoryMeta || []).map(c => ({ ...c, required: req.size ? req.has(c.key) : c.required }))
  const byCat = {}
  for (const d of p.documents) (byCat[d.category] = byCat[d.category] || []).push(d)
  const personnel = meta.filter(c => c.group === 'personnel')
  const teaching = meta.filter(c => c.group === 'teaching' && byCat[c.key]?.length)

  const DocRow = ({ d }) => {
    const st = docState(d)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: '1px solid ' + LINE, borderRadius: 9, marginTop: 6, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: TOKENS.s900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
          <div style={{ fontSize: 11, color: TOKENS.s500 }}>
            {fmtD(d.createdAt)}{d.uploadedBy && String(d.uploadedBy) !== String(t._id) && d.uploadedByName ? ' · filed by ' + d.uploadedByName : ''}
          </div>
        </div>
        {st && <span style={chip(st.bg, st.fg)}>{st.text}</span>}
        {d.verifiedAt && <span style={chip('#DCFCE7', OK)} title={'Verified by ' + (d.verifiedByName || 'QA') + ' on ' + fmtD(d.verifiedAt)}>✓ Verified</span>}
        <a href={d.file?.url} target="_blank" rel="noreferrer" style={btnS}>Open</a>
        <button style={btnS} disabled={busy === d._id} onClick={() => verify(d)}>{d.verifiedAt ? 'Unverify' : 'Verify'}</button>
        <button style={{ ...btnS, color: BAD, borderColor: '#FCA5A5' }} disabled={busy === d._id} onClick={() => remove(d)}>Delete</button>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={btnG}>← Team</button>
        <span style={{ flex: 1 }} />
        <button style={btnG} onClick={() => printTeacherProfile(p)}>Print profile</button>
        <button style={btnP} onClick={() => setUpload({ category: p.file.missing[0] || 'cv' })}>+ Add document</button>
      </div>

      {/* Subject and curriculum specialities are an internal allocation
          tool (admin → Teachers); they are not part of the profile. */}
      <div style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid ' + (t.role === 'admin' ? GOLD : LINE), background: '#fff' }}>
        <div style={{ height: 120, background: 'radial-gradient(circle at 15% 0%, #9A1B33, #6E1022 55%, #3E0712)' }} />
        <div style={{ padding: '0 26px 24px', display: 'flex', gap: 22, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: -78 }}>
          <div style={{ borderRadius: 26, padding: 5, background: '#fff', boxShadow: '0 10px 30px rgba(26,15,14,.18)' }}>
            <Avatar user={t} size={150} radius={22} />
          </div>
          <div style={{ flex: 1, minWidth: 240, paddingBottom: 4 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, color: TOKENS.s900, lineHeight: 1.1 }}>{fullName(t)}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
              <TitleChip u={t} />
              {t.jobTitle && t.jobTitle !== titleOf(t) && <span style={{ fontSize: 13.5, fontWeight: 700, color: CR }}>{t.jobTitle}</span>}
            </div>
            <div style={{ fontSize: 12.5, color: TOKENS.s500, marginTop: 6 }}>
              {[t.yearsOfExperience ? t.yearsOfExperience + ' years experience' : '', t.createdAt ? 'with Smartious since ' + fmtD(t.createdAt) : '', t.email, t.phone].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, paddingBottom: 4 }}>
            <div style={{ textAlign: 'center' }}>
              <Ring pct={p.file.pct} size={86} stroke={8} />
              <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 4 }}>Staff file {p.file.have}/{p.file.required}</div>
            </div>
            <div style={{ textAlign: 'center', alignSelf: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 34, color: GOLD, lineHeight: 1 }}>{p.trainingHours}</div>
              <div style={{ fontSize: 11, color: TOKENS.s500, marginTop: 4 }}>training hours</div>
            </div>
          </div>
        </div>
        {(t.bio || (t.qualifications || []).length || (t.certifications || []).length) ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 24, padding: '20px 26px 24px', borderTop: '1px solid ' + LINE }} className="qa-prof-grid">
            <div>
              <div style={{ ...lbl, color: GOLD }}>About</div>
              <div style={{ fontSize: 14, color: TOKENS.s700, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{t.bio || <span style={{ color: TOKENS.s400 }}>No bio yet.</span>}</div>
            </div>
            <div>
              {[['Qualifications', t.qualifications], ['Certifications', t.certifications]].map(([k, v]) => v?.length ? (
                <div key={k} style={{ marginBottom: 14 }}>
                  <div style={{ ...lbl, color: GOLD }}>{k}</div>
                  {v.map((q, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: TOKENS.s700, padding: '3px 0' }}>
                      <span style={{ color: GOLD }}>◆</span><span>{q}</span>
                    </div>
                  ))}
                </div>
              ) : null)}
            </div>
            <style>{`@media (max-width: 760px){.qa-prof-grid{grid-template-columns:1fr!important}}`}</style>
          </div>
        ) : null}
      </div>

      {p.canEdit && (
        <>
          <div style={{ height: 14 }} />
          <PCard padding={20}>
            <h3 style={h3}>Role at Smartious</h3>
            {isTeacher && (
              <div style={{ marginBottom: 14 }}>
                <div style={lbl}>Teacher category</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                  {(p.teacherCategories || TEACHER_CATS).map(c => {
                    const on = (t.teacherCategory || 'teacher') === c.key
                    return (
                      <button key={c.key} disabled={busy === 'role' || on} onClick={() => saveRole({ teacherCategory: c.key })}
                        style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: on ? 'default' : 'pointer', border: '2px solid ' + (on ? CR : LINE), background: on ? '#FDF2F4' : '#fff', fontFamily: 'inherit' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: on ? CR : TOKENS.s900 }}>{on ? '● ' : ''}{c.label}</div>
                        {c.desc && <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 2 }}>{c.desc}</div>}
                      </button>
                    )
                  })}
                </div>
                <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 6 }}>
                  Qualified teachers need 8 documents on file, including the teaching qualification and licence; teachers in training and support teachers need 6.
                </div>
              </div>
            )}
            {p.canAssignQA && (
              <div style={{ marginBottom: 14, padding: '12px 14px', border: '1.5px solid ' + (t.alsoQA ? GOLD : LINE), borderRadius: 12, background: t.alsoQA ? TOKENS.goldPale : '#fff', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: TOKENS.s900 }}>Also handles Quality Assurance</div>
                  <div style={{ fontSize: 11.5, color: TOKENS.s500, marginTop: 2 }}>
                    Adds the Quality section (Team Profiles, Teacher Development, Accreditations) to this Dean &amp; Operations account. Title becomes "Dean &amp; Quality Assurance".
                  </div>
                </div>
                <button disabled={busy === 'role'} onClick={() => saveRole({ alsoQA: !t.alsoQA })}
                  style={{ width: 52, height: 30, borderRadius: 99, border: 'none', cursor: 'pointer', position: 'relative', background: t.alsoQA ? CR : '#D6D0C4', flexShrink: 0 }}
                  aria-label="Also handles Quality Assurance">
                  <span style={{ position: 'absolute', top: 4, left: t.alsoQA ? 26 : 4, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left .16s', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
                </button>
              </div>
            )}
            <div style={lbl}>Job title shown on the profile</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input style={{ ...inp, maxWidth: 320 }} value={titleDraft ?? (t.jobTitle || '')} placeholder={titleOf(t)}
                onChange={e => setTitleDraft(e.target.value)} />
              <button style={btnP} disabled={busy === 'role' || titleDraft === null} onClick={() => saveRole({ jobTitle: titleDraft })}>Save title</button>
            </div>
          </PCard>
        </>
      )}

      <div style={{ height: 14 }} />
      <PCard padding={20}>
        <h3 style={h3}>Personnel file</h3>
        <div style={{ display: 'grid', gap: 10 }}>
          {personnel.map(c => {
            const docs = byCat[c.key] || []
            const missing = p.file.missing.includes(c.key)
            const expired = docs.length > 0 && missing
            const state = docs.length === 0
              ? (c.required ? { t: 'Missing', bg: '#FEE2E2', fg: BAD } : { t: 'None', bg: TOKENS.s50, fg: TOKENS.s500 })
              : expired ? { t: 'Expired', bg: '#FEE2E2', fg: BAD }
                : docs.every(d => d.verifiedAt) ? { t: 'Verified', bg: '#DCFCE7', fg: OK }
                  : { t: 'On file', bg: '#E0F2FE', fg: '#0369A1' }
            return (
              <div key={c.key} style={{ padding: '10px 12px', background: TOKENS.s50, borderRadius: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: TOKENS.s900, flex: 1 }}>{c.label}{c.required ? '' : <span style={{ fontWeight: 600, color: TOKENS.s500 }}> (optional)</span>}</span>
                  <span style={chip(state.bg, state.fg)}>{state.t}</span>
                  <button style={btnS} onClick={() => setUpload({ category: c.key })}>+ Upload</button>
                </div>
                {docs.map(d => <DocRow key={d._id} d={d} />)}
              </div>
            )
          })}
        </div>
      </PCard>

      {isTeacher && <div style={{ height: 14 }} />}
      {isTeacher && <PCard padding={20}>
        <h3 style={h3}>Teaching documents</h3>
        {teaching.length === 0 ? <div style={{ fontSize: 13, color: TOKENS.s500 }}>No schemes of work, lesson plans or records filed yet.</div> :
          teaching.map(c => (
            <div key={c.key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: TOKENS.s700 }}>{c.label} <span style={{ color: TOKENS.s400, fontWeight: 600 }}>({byCat[c.key].length})</span></div>
              {byCat[c.key].map(d => <DocRow key={d._id} d={d} />)}
            </div>
          ))}
      </PCard>}

      <div style={{ height: 14 }} />
      <PCard padding={20}>
        <h3 style={h3}>Professional development · {p.trainingHours} hours</h3>
        {p.trainings.length === 0 ? <div style={{ fontSize: 13, color: TOKENS.s500 }}>No trainings recorded yet.</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 520 }}>
              <thead><tr>{['Date', 'Training', 'Category', 'Provider', 'Hours'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', ...lbl, borderBottom: '1px solid ' + LINE }}>{h}</th>)}</tr></thead>
              <tbody>
                {p.trainings.map(x => (
                  <tr key={x._id} style={{ borderBottom: '1px solid ' + TOKENS.s100 }}>
                    <td style={{ padding: '7px 8px', whiteSpace: 'nowrap' }}>{fmtD(x.trainingDate)}</td>
                    <td style={{ padding: '7px 8px', fontWeight: 700 }}>{x.title}</td>
                    <td style={{ padding: '7px 8px' }}>{x.category || ''}</td>
                    <td style={{ padding: '7px 8px' }}>{x.provider || ''}</td>
                    <td style={{ padding: '7px 8px' }}>{x.durationHours || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PCard>

      {upload && <UploadDocModal teacher={t} meta={meta} initialCategory={upload.category} toast={toast}
        onClose={() => setUpload(null)} onDone={() => { setUpload(null); load() }} />}
    </>
  )
}

function UploadDocModal({ teacher, meta, initialCategory, toast, onClose, onDone }) {
  const [f, setF] = useState({ category: initialCategory, title: '', expiresAt: '', description: '', file: null })
  const [busy, setBusy] = useState(false)
  const cat = meta.find(c => c.key === f.category) || {}

  const save = async () => {
    if (!f.file) { toast?.error?.('Choose a file to upload.'); return }
    const title = f.title.trim() || cat.label || f.file.name
    setBusy(true)
    try {
      await uploadTeacherDoc(teacher._id, f.file, { category: f.category, title, description: f.description, expiresAt: f.expiresAt || null })
      toast?.ok?.('Filed in ' + fullName(teacher) + "'s file.")
      onDone()
    } catch (e) { toast?.error?.(errMsg(e, e?.message || 'Upload failed.')) }
    setBusy(false)
  }

  return (
    <Modal title={'Add to ' + fullName(teacher) + "'s file"} onClose={onClose}
      footer={<><button style={btnG} onClick={onClose}>Cancel</button><button style={btnP} disabled={busy} onClick={save}>{busy ? 'Uploading...' : 'Upload'}</button></>}>
      <Field label="Category">
        <select style={inp} value={f.category} onChange={e => setF(x => ({ ...x, category: e.target.value }))}>
          <optgroup label="Personnel file">{meta.filter(c => c.group === 'personnel').map(c => <option key={c.key} value={c.key}>{c.label}{c.required ? ' *' : ''}</option>)}</optgroup>
          <optgroup label="Teaching documents">{meta.filter(c => c.group === 'teaching').map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</optgroup>
        </select>
      </Field>
      <Field label="Title" hint="Leave blank to use the category name.">
        <input style={inp} value={f.title} placeholder={cat.label || ''} onChange={e => setF(x => ({ ...x, title: e.target.value }))} />
      </Field>
      <Field label={cat.expires ? 'Expiry date' : 'Expiry date (if any)'} hint={cat.expires ? 'This document lapses; QA is alerted 60 days before.' : ''}>
        <input style={inp} type="date" value={f.expiresAt} onChange={e => setF(x => ({ ...x, expiresAt: e.target.value }))} />
      </Field>
      <Field label="Notes">
        <textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={f.description} onChange={e => setF(x => ({ ...x, description: e.target.value }))} />
      </Field>
      <Field label="File" hint="PDF, Word, Excel, PowerPoint or image, up to 50 MB.">
        <input type="file" accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={e => setF(x => ({ ...x, file: e.target.files?.[0] || null }))} />
      </Field>
    </Modal>
  )
}

// ═══════════════════════════════════════════════════════════
// 2. TEACHER DEVELOPMENT PROGRAMME (TDP)
// ═══════════════════════════════════════════════════════════
const emptyTraining = { title: '', provider: '', trainingDate: '', durationHours: '', mode: 'In person', category: 'Pedagogy', location: '', description: '', outcomes: '', attendees: [], photos: [], files: [] }

export function TDPModule({ toast }) {
  const [rows, setRows] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('trainings')   // trainings | hours
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('')
  const [cat, setCat] = useState('')
  const [modal, setModal] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [open, setOpen] = useState({})           // expanded outcome text per training

  const load = useCallback(() => api.get('/qa/trainings')
    .then(r => setRows(r.data?.data?.trainings || []))
    .catch(e => toast?.error?.(errMsg(e, 'Could not load trainings.')))
    .finally(() => setLoading(false)), [toast])
  useEffect(() => {
    load()
    api.get('/users', { params: { role: 'teacher' } })
      .then(r => setTeachers((r.data?.users || []).filter(u => u.role === 'teacher' && u.isActive !== false && u.teacherStatus !== 'Left')))
      .catch(() => {})
  }, [load])

  const remove = async (t) => {
    if (!window.confirm('Delete the training "' + t.title + '" and its photos?')) return
    try { await api.delete('/qa/trainings/' + t._id); toast?.ok?.('Deleted.'); load() }
    catch (e) { toast?.error?.(errMsg(e, 'Could not delete.')) }
  }

  const years = useMemo(() => [...new Set(rows.map(r => new Date(r.trainingDate).getFullYear()))].sort((a, b) => b - a), [rows])
  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter(r =>
      (!year || new Date(r.trainingDate).getFullYear() === Number(year)) &&
      (!cat || r.category === cat) &&
      (!q || [r.title, r.provider, r.location, r.description, ...(r.attendees || []).map(fullName)].join(' ').toLowerCase().includes(q)))
  }, [rows, search, year, cat])

  const stats = useMemo(() => {
    const reached = new Set()
    let hours = 0, photos = 0
    for (const r of list) { hours += r.durationHours || 0; photos += (r.photos || []).length; (r.attendees || []).forEach(a => reached.add(String(a._id || a))) }
    const active = new Set(teachers.map(t => String(t._id)))
    const reachedActive = [...reached].filter(id => active.has(id)).length
    return { hours, photos, reached: reached.size, coverage: active.size ? Math.round((reachedActive / active.size) * 100) : 0 }
  }, [list, teachers])

  const perTeacher = useMemo(() => {
    const m = {}
    for (const t of teachers) m[String(t._id)] = { t, count: 0, hours: 0, last: null }
    for (const r of list) for (const a of r.attendees || []) {
      const id = String(a._id || a)
      if (!m[id]) m[id] = { t: a, count: 0, hours: 0, last: null }
      m[id].count += 1; m[id].hours += r.durationHours || 0
      if (!m[id].last || new Date(r.trainingDate) > new Date(m[id].last)) m[id].last = r.trainingDate
    }
    return Object.values(m).sort((a, b) => b.hours - a.hours || fullName(a.t).localeCompare(fullName(b.t)))
  }, [list, teachers])

  return (
    <>
      <PSection tag="QA Portal" title="Teacher Development" em="Programme"
        sub="Every training delivered to our teachers — photos, outcomes and attendance."
        action={<button style={btnP} onClick={() => setModal({ ...emptyTraining })}>+ Record a training</button>} />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <Stat label="Trainings" value={list.length} sub={year ? 'in ' + year : 'all time'} />
        <Stat label="Training hours" value={stats.hours} />
        <Stat label="Teachers reached" value={stats.reached} sub={stats.coverage + '% of current teachers'} color={pctColor(stats.coverage)} />
        <Stat label="Photos" value={stats.photos} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        {[['trainings', 'Trainings'], ['hours', 'Hours per teacher']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ ...btnS, ...(tab === k ? { borderColor: CR, color: CR, background: '#FDF2F4' } : {}) }}>{l}</button>
        ))}
        <span style={{ width: 8 }} />
        <input style={{ ...inp, maxWidth: 240 }} placeholder="Search trainings or teachers..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...inp, width: 'auto' }} value={year} onChange={e => setYear(e.target.value)} aria-label="Year">
          <option value="">All years</option>{years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select style={{ ...inp, width: 'auto' }} value={cat} onChange={e => setCat(e.target.value)} aria-label="Category">
          <option value="">All categories</option>{TRAINING_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <Loading /> : tab === 'hours' ? (
        <PCard padding={0} style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 520 }}>
            <thead><tr>{['Teacher', 'Trainings', 'Hours', 'Last training'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 14px', ...lbl, borderBottom: '1px solid ' + LINE }}>{h}</th>)}</tr></thead>
            <tbody>
              {perTeacher.map(({ t, count, hours, last }) => (
                <tr key={String(t._id)} style={{ borderBottom: '1px solid ' + TOKENS.s100 }}>
                  <td style={{ padding: '9px 14px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar user={t} size={28} radius={7} /><b>{fullName(t)}</b></div></td>
                  <td style={{ padding: '9px 14px' }}>{count}</td>
                  <td style={{ padding: '9px 14px' }}>
                    <span style={chip(hours ? TOKENS.goldPale : '#FEE2E2', hours ? '#92400E' : BAD)}>{hours}h</span>
                  </td>
                  <td style={{ padding: '9px 14px', color: TOKENS.s500 }}>{last ? fmtD(last) : 'None yet'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PCard>
      ) : list.length === 0 ? <Empty>{rows.length ? 'No trainings match these filters.' : 'No trainings recorded yet. Record the first one.'}</Empty> : (
        <div style={{ display: 'grid', gap: 14 }}>
          {list.map(t => (
            <PCard key={t._id} padding={0} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <div style={{ flex: '0 0 260px', maxWidth: '100%', minHeight: 180, background: TOKENS.goldPale, position: 'relative' }}>
                  {t.photos?.[0]
                    ? <img src={t.photos[0].url} alt={t.photos[0].caption || t.title} onClick={() => setLightbox({ items: t.photos, index: 0 })} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in', position: 'absolute', inset: 0 }} />
                    : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, fontWeight: 800, fontSize: 12 }}>No photos yet</div>}
                  {(t.photos || []).length > 1 && <span style={{ ...chip('rgba(0,0,0,.6)', '#fff'), position: 'absolute', right: 8, bottom: 8 }}>{t.photos.length} photos</span>}
                </div>
                <div style={{ flex: '1 1 320px', padding: 16, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: TOKENS.s900 }}>{t.title}</div>
                      <div style={{ fontSize: 12, color: TOKENS.s500, marginTop: 3 }}>
                        {fmtD(t.trainingDate)}{t.provider ? ' · ' + t.provider : ''}{t.location ? ' · ' + t.location : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={btnS} onClick={() => setModal({ ...emptyTraining, ...t, trainingDate: t.trainingDate ? String(t.trainingDate).slice(0, 10) : '', attendees: (t.attendees || []).map(a => a._id || a) })}>Edit</button>
                      <button style={{ ...btnS, color: BAD, borderColor: '#FCA5A5' }} onClick={() => remove(t)}>Delete</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                    {t.category && <span style={chip('#FDF2F4', CR)}>{t.category}</span>}
                    <span style={chip(TOKENS.s50, TOKENS.s700)}>{t.mode}</span>
                    <span style={chip(TOKENS.goldPale, '#92400E')}>{t.durationHours || 0} hours</span>
                    <span style={chip(TOKENS.s50, TOKENS.s700)}>{(t.attendees || []).length} teachers</span>
                  </div>
                  {t.description && <div style={{ fontSize: 12.5, color: TOKENS.s700, marginTop: 10, lineHeight: 1.6 }}>{t.description}</div>}
                  {t.outcomes && (
                    <div style={{ marginTop: 10, padding: '10px 12px', background: TOKENS.s50, borderRadius: 9 }}>
                      <div style={{ ...lbl, color: GOLD, marginBottom: 4 }}>Outcomes</div>
                      <div style={{ fontSize: 12.5, color: TOKENS.s700, lineHeight: 1.6, whiteSpace: 'pre-wrap', ...(open[t._id] ? {} : { maxHeight: 64, overflow: 'hidden' }) }}>{t.outcomes}</div>
                      {t.outcomes.length > 220 && <button style={{ ...btnS, marginTop: 6 }} onClick={() => setOpen(o => ({ ...o, [t._id]: !o[t._id] }))}>{open[t._id] ? 'Less' : 'More'}</button>}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 10 }}>
                    {(t.attendees || []).map(a => <span key={a._id || a} style={chip(TOKENS.s50, TOKENS.s700)}>{fullName(a) || 'Teacher'}</span>)}
                  </div>
                  {(t.files || []).length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                      {t.files.map((f, i) => <a key={i} href={f.url} target="_blank" rel="noreferrer" style={btnS}>📎 {f.name || 'File ' + (i + 1)}</a>)}
                    </div>
                  )}
                  {(t.photos || []).length > 1 && (
                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 12 }}>
                      {t.photos.map((ph, i) => (
                        <img key={i} src={ph.url} alt={ph.caption || ''} title={ph.caption || ''} onClick={() => setLightbox({ items: t.photos, index: i })}
                          style={{ width: 92, height: 66, objectFit: 'cover', borderRadius: 8, border: '1px solid ' + LINE, cursor: 'zoom-in', flexShrink: 0 }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </PCard>
          ))}
        </div>
      )}

      {modal && <TrainingForm initial={modal} teachers={teachers} toast={toast} onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }} />}
      {lightbox && <Lightbox items={lightbox.items} index={lightbox.index} onClose={() => setLightbox(null)} />}
    </>
  )
}

function TrainingForm({ initial, teachers, toast, onClose, onSaved }) {
  const [m, setM] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(0)
  const [who, setWho] = useState('')
  const set = (k, v) => setM(x => ({ ...x, [k]: v }))

  const addMedia = async (files, field) => {
    const list = Array.from(files).slice(0, 15)
    setUploading(n => n + list.length)
    for (const f of list) {
      const rec = await uploadEvidence(f, 'training', toast)
      if (rec) setM(x => ({ ...x, [field]: [...x[field], field === 'photos' ? { url: rec.url, key: rec.key, caption: '' } : rec] }))
      setUploading(n => n - 1)
    }
  }

  const save = async () => {
    if (!m.title.trim() || !m.trainingDate) { toast?.error?.('Title and date are required.'); return }
    setSaving(true)
    try {
      const payload = { ...m, durationHours: Number(m.durationHours) || 0 }
      const { data } = m._id ? await api.patch('/qa/trainings/' + m._id, payload) : await api.post('/qa/trainings', payload)
      if (data?.success) { toast?.ok?.('Training saved.'); onSaved() }
      else toast?.error?.(data?.message || 'Save failed.')
    } catch (e) { toast?.error?.(errMsg(e, 'Save failed.')) }
    setSaving(false)
  }

  const shown = teachers.filter(t => !who.trim() || fullName(t).toLowerCase().includes(who.trim().toLowerCase()))
  const toggle = (id) => set('attendees', m.attendees.includes(id) ? m.attendees.filter(x => x !== id) : [...m.attendees, id])

  return (
    <Modal title={m._id ? 'Edit training' : 'Record a training'} onClose={onClose} width={720}
      footer={<><span style={{ flex: 1, fontSize: 11.5, color: TOKENS.s500 }}>{uploading ? `Uploading ${uploading}...` : `${m.photos.length} photo(s), ${m.files.length} file(s), ${m.attendees.length} teacher(s)`}</span>
        <button style={btnG} onClick={onClose}>Cancel</button>
        <button style={btnP} disabled={saving || uploading > 0} onClick={save}>{saving ? 'Saving...' : 'Save training'}</button></>}>
      <Field label="Training title *"><input style={inp} value={m.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Assessment for Learning workshop" /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        <Field label="Date *"><input style={inp} type="date" value={m.trainingDate} onChange={e => set('trainingDate', e.target.value)} /></Field>
        <Field label="Duration (hours)"><input style={inp} type="number" min="0" step="0.5" value={m.durationHours} onChange={e => set('durationHours', e.target.value)} /></Field>
        <Field label="Category"><select style={inp} value={m.category} onChange={e => set('category', e.target.value)}>{TRAINING_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Mode"><select style={inp} value={m.mode} onChange={e => set('mode', e.target.value)}><option>In person</option><option>Online</option><option>Blended</option></select></Field>
        <Field label="Provider / facilitator"><input style={inp} value={m.provider} onChange={e => set('provider', e.target.value)} /></Field>
        <Field label="Location"><input style={inp} value={m.location} onChange={e => set('location', e.target.value)} placeholder="Venue or platform" /></Field>
      </div>
      <Field label="What the training covered"><textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={m.description} onChange={e => set('description', e.target.value)} /></Field>
      <Field label="Outcomes" hint="What teachers took away and how classroom practice changes. Accreditors read this.">
        <textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={m.outcomes} onChange={e => set('outcomes', e.target.value)} />
      </Field>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <div style={{ ...lbl, marginBottom: 0, flex: 1 }}>Teachers who attended ({m.attendees.length})</div>
          <input style={{ ...inp, width: 180, padding: '5px 9px' }} placeholder="Find teacher..." value={who} onChange={e => setWho(e.target.value)} />
          <button type="button" style={btnS} onClick={() => set('attendees', [...new Set([...m.attendees, ...shown.map(t => t._id)])])}>Select shown</button>
          <button type="button" style={btnS} onClick={() => set('attendees', [])}>Clear</button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 150, overflowY: 'auto', padding: 2 }}>
          {shown.map(t => {
            const on = m.attendees.includes(t._id)
            return (
              <button type="button" key={t._id} onClick={() => toggle(t._id)} aria-pressed={on}
                style={{ ...chip(on ? CR : '#F3F4F6', on ? '#fff' : TOKENS.s700), border: 'none', cursor: 'pointer', padding: '6px 12px' }}>
                {on ? '✓ ' : ''}{fullName(t)}
              </button>
            )
          })}
          {shown.length === 0 && <span style={{ fontSize: 12, color: TOKENS.s500 }}>No teachers match.</span>}
        </div>
      </div>

      <div>
        <div style={lbl}>Photos</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
          {m.photos.map((p, i) => (
            <div key={i} style={{ border: '1px solid ' + LINE, borderRadius: 9, overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: 90 }}>
                <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" aria-label="Remove photo" onClick={() => set('photos', m.photos.filter((_, j) => j !== i))}
                  style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', border: 'none', background: BAD, color: '#fff', fontSize: 11, cursor: 'pointer', padding: 0 }}>✕</button>
              </div>
              <input style={{ ...inp, border: 'none', borderTop: '1px solid ' + LINE, borderRadius: 0, fontSize: 11.5 }} placeholder="Caption"
                value={p.caption || ''} onChange={e => set('photos', m.photos.map((x, j) => j === i ? { ...x, caption: e.target.value } : x))} />
            </div>
          ))}
          <label style={{ ...btnG, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 90, borderStyle: 'dashed' }}>
            + Add photos
            <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { addMedia(e.target.files, 'photos'); e.target.value = '' }} />
          </label>
        </div>
      </div>

      <div>
        <div style={lbl}>Files (programme, attendance register, certificates)</div>
        {m.files.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '4px 0' }}>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📎 {f.name}</span>
            <button type="button" style={{ ...btnS, color: BAD }} onClick={() => set('files', m.files.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <label style={{ ...btnS, display: 'inline-block', marginTop: 4 }}>
          + Add files
          <input type="file" accept="application/pdf,image/*,.doc,.docx" multiple style={{ display: 'none' }} onChange={e => { addMedia(e.target.files, 'files'); e.target.value = '' }} />
        </label>
      </div>
    </Modal>
  )
}

// ═══════════════════════════════════════════════════════════
// 3. SCHOOL ACCREDITATIONS
// ═══════════════════════════════════════════════════════════
const emptyAcc = { name: '', body: '', type: 'Accreditation', certificateNumber: '', issuedAt: '', expiresAt: '', notes: '', scope: [], verifyUrl: '', documents: [] }

const accStatus = (a) => {
  if (!a.expiresAt) return { key: 'permanent', label: 'No expiry', bg: TOKENS.s50, fg: TOKENS.s700 }
  const days = daysUntil(a.expiresAt)
  if (days < 0) return { key: 'expired', label: 'Expired ' + fmtD(a.expiresAt), bg: '#FEE2E2', fg: BAD }
  if (days <= 90) return { key: 'expiring', label: 'Expires in ' + days + ' days', bg: '#FEF3C7', fg: WARN }
  return { key: 'valid', label: 'Valid until ' + fmtD(a.expiresAt), bg: '#DCFCE7', fg: OK }
}

function ValidityBar({ a }) {
  if (!a.expiresAt || !a.issuedAt) return null
  const start = new Date(a.issuedAt).getTime(), end = new Date(a.expiresAt).getTime()
  if (!(end > start)) return null
  const used = Math.max(0, Math.min(100, ((Date.now() - start) / (end - start)) * 100))
  const st = accStatus(a)
  return (
    <div style={{ marginTop: 10 }} title={Math.round(used) + '% of the validity period used'}>
      <div style={{ height: 6, background: TOKENS.s100, borderRadius: 9 }}>
        <div style={{ width: used + '%', height: '100%', background: st.fg, borderRadius: 9 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: TOKENS.s500, marginTop: 3 }}>
        <span>{fmtD(a.issuedAt)}</span><span>{fmtD(a.expiresAt)}</span>
      </div>
    </div>
  )
}

export function AccreditationsModule({ toast }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [lightbox, setLightbox] = useState(null)

  const load = useCallback(() => api.get('/qa/accreditations')
    .then(r => setRows(r.data?.data?.accreditations || []))
    .catch(e => toast?.error?.(errMsg(e, 'Could not load accreditations.')))
    .finally(() => setLoading(false)), [toast])
  useEffect(() => { load() }, [load])

  const remove = async (a) => {
    if (!window.confirm('Delete "' + a.name + '" and its certificate files?')) return
    try { await api.delete('/qa/accreditations/' + a._id); toast?.ok?.('Deleted.'); load() }
    catch (e) { toast?.error?.(errMsg(e, 'Could not delete.')) }
  }

  const counts = useMemo(() => {
    const c = { valid: 0, expiring: 0, expired: 0, permanent: 0, noCert: 0 }
    for (const a of rows) { c[accStatus(a).key] += 1; if (!(a.documents || []).length) c.noCert += 1 }
    return c
  }, [rows])

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase()
    const order = { expired: 0, expiring: 1, valid: 2, permanent: 3 }
    const g = {}
    rows.filter(a => (!type || a.type === type) &&
      (!q || [a.name, a.body, a.certificateNumber, ...(a.scope || [])].join(' ').toLowerCase().includes(q)))
      .sort((a, b) => order[accStatus(a).key] - order[accStatus(b).key] || a.name.localeCompare(b.name))
      .forEach(a => (g[a.type || 'Other'] = g[a.type || 'Other'] || []).push(a))
    return ACC_TYPES.filter(t => g[t]).map(t => [t, g[t]])
  }, [rows, search, type])

  return (
    <>
      <PSection tag="QA Portal" title="School" em="Accreditations"
        sub="Accreditations, licences, memberships and registrations with their certificates."
        action={<button style={btnP} onClick={() => setModal({ ...emptyAcc })}>+ Add accreditation or licence</button>} />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <Stat label="On record" value={rows.length} />
        <Stat label="In date" value={counts.valid + counts.permanent} color={OK} />
        <Stat label="Expiring ≤ 90 days" value={counts.expiring} color={counts.expiring ? WARN : TOKENS.s900} />
        <Stat label="Expired" value={counts.expired} color={counts.expired ? BAD : TOKENS.s900} />
        <Stat label="Missing certificate" value={counts.noCert} color={counts.noCert ? WARN : TOKENS.s900} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <input style={{ ...inp, maxWidth: 260 }} placeholder="Search name, body, number or scope..." value={search} onChange={e => setSearch(e.target.value)} />
        {['', ...ACC_TYPES].map(t => (
          <button key={t || 'all'} onClick={() => setType(t)} style={{ ...btnS, ...(type === t ? { borderColor: CR, color: CR, background: '#FDF2F4' } : {}) }}>{t ? t + 's' : 'All'}</button>
        ))}
      </div>

      {loading ? <Loading /> : rows.length === 0 ? <Empty>Nothing recorded yet. Add the school's first accreditation or licence.</Empty> :
        groups.length === 0 ? <Empty>Nothing matches.</Empty> :
          groups.map(([t, items]) => (
            <div key={t} style={{ marginBottom: 20 }}>
              <div style={{ ...h3 }}>{t}s <span style={{ color: TOKENS.s400 }}>({items.length})</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                {items.map(a => {
                  const st = accStatus(a)
                  const docs = a.documents || []
                  const images = docs.filter(d => isImage(d.url)).map(d => ({ url: d.url, caption: d.name }))
                  const cover = docs[0]
                  return (
                    <PCard key={a._id} padding={0} style={{ overflow: 'hidden', borderTop: '4px solid ' + st.fg }}>
                      <div style={{ height: 150, background: TOKENS.goldPale }}>
                        {cover ? <FileTile url={cover.url} name={cover.name} onClick={images.length ? () => setLightbox({ items: images, index: 0 }) : undefined} />
                          : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: WARN, fontWeight: 800, fontSize: 12 }}>No certificate uploaded</div>}
                      </div>
                      <div style={{ padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: TOKENS.s900 }}>{a.name}</div>
                          <span style={chip(st.bg, st.fg)}>{st.label}</span>
                        </div>
                        <div style={{ fontSize: 12, color: TOKENS.s500, marginTop: 4 }}>
                          {a.body || 'Issuing body not set'}{a.certificateNumber ? ' · No. ' + a.certificateNumber : ''}
                        </div>
                        {a.issuedAt && !a.expiresAt && <div style={{ fontSize: 11.5, color: TOKENS.s400, marginTop: 3 }}>Issued {fmtD(a.issuedAt)}</div>}
                        <ValidityBar a={a} />
                        {(a.scope || []).length > 0 && (
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 10 }}>
                            {a.scope.map((s, i) => <span key={i} style={chip('#FDF2F4', CR)}>{s}</span>)}
                          </div>
                        )}
                        {a.notes && <div style={{ fontSize: 12, color: TOKENS.s700, marginTop: 10, lineHeight: 1.55 }}>{a.notes}</div>}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                          {docs.map((d, i) => <a key={i} href={d.url} target="_blank" rel="noreferrer" style={btnS}>📄 {d.name || 'Certificate ' + (i + 1)}</a>)}
                          {a.verifyUrl && <a href={a.verifyUrl} target="_blank" rel="noreferrer" style={{ ...btnS, color: OK, borderColor: '#86EFAC' }}>Verify online ↗</a>}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                          <button style={btnS} onClick={() => setModal({ ...emptyAcc, ...a, issuedAt: a.issuedAt ? String(a.issuedAt).slice(0, 10) : '', expiresAt: a.expiresAt ? String(a.expiresAt).slice(0, 10) : '', scope: a.scope || [] })}>Edit</button>
                          <button style={{ ...btnS, color: BAD, borderColor: '#FCA5A5' }} onClick={() => remove(a)}>Delete</button>
                        </div>
                      </div>
                    </PCard>
                  )
                })}
              </div>
            </div>
          ))}

      {modal && <AccreditationForm initial={modal} toast={toast} onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }} />}
      {lightbox && <Lightbox items={lightbox.items} index={lightbox.index} onClose={() => setLightbox(null)} />}
    </>
  )
}

function AccreditationForm({ initial, toast, onClose, onSaved }) {
  const [m, setM] = useState({ ...initial, scopeText: (initial.scope || []).join(', ') })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(0)
  const set = (k, v) => setM(x => ({ ...x, [k]: v }))

  const addDocs = async (files) => {
    const list = Array.from(files).slice(0, 10)
    setUploading(n => n + list.length)
    for (const f of list) {
      const rec = await uploadEvidence(f, 'accreditation', toast)
      if (rec) setM(x => ({ ...x, documents: [...x.documents, rec] }))
      setUploading(n => n - 1)
    }
  }

  const save = async () => {
    if (!m.name.trim()) { toast?.error?.('Name is required.'); return }
    if (m.issuedAt && m.expiresAt && m.expiresAt < m.issuedAt) { toast?.error?.('The expiry date is before the issue date.'); return }
    setSaving(true)
    try {
      const { scopeText, ...rest } = m
      const payload = { ...rest, scope: scopeText.split(',').map(s => s.trim()).filter(Boolean) }
      const { data } = m._id ? await api.patch('/qa/accreditations/' + m._id, payload) : await api.post('/qa/accreditations', payload)
      if (data?.success) { toast?.ok?.('Saved.'); onSaved() }
      else toast?.error?.(data?.message || 'Save failed.')
    } catch (e) { toast?.error?.(errMsg(e, 'Save failed.')) }
    setSaving(false)
  }

  return (
    <Modal title={(m._id ? 'Edit' : 'Add') + ' accreditation / licence'} onClose={onClose}
      footer={<><span style={{ flex: 1, fontSize: 11.5, color: TOKENS.s500 }}>{uploading ? `Uploading ${uploading}...` : `${m.documents.length} file(s)`}</span>
        <button style={btnG} onClick={onClose}>Cancel</button>
        <button style={btnP} disabled={saving || uploading > 0} onClick={save}>{saving ? 'Saving...' : 'Save'}</button></>}>
      <Field label="Name *"><input style={inp} placeholder="e.g. Cognia Accreditation" value={m.name} onChange={e => set('name', e.target.value)} /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        <Field label="Type"><select style={inp} value={m.type} onChange={e => set('type', e.target.value)}>{ACC_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Issuing body"><input style={inp} value={m.body} onChange={e => set('body', e.target.value)} placeholder="e.g. Cognia, Cambridge International" /></Field>
        <Field label="Certificate / registration no."><input style={inp} value={m.certificateNumber} onChange={e => set('certificateNumber', e.target.value)} /></Field>
        <Field label="Verification link"><input style={inp} value={m.verifyUrl} onChange={e => set('verifyUrl', e.target.value)} placeholder="https://..." /></Field>
        <Field label="Issued"><input style={inp} type="date" value={m.issuedAt} onChange={e => set('issuedAt', e.target.value)} /></Field>
        <Field label="Expires" hint="Leave empty if permanent."><input style={inp} type="date" value={m.expiresAt} onChange={e => set('expiresAt', e.target.value)} /></Field>
      </div>
      <Field label="Scope" hint="Programmes or curricula it covers, separated by commas.">
        <input style={inp} value={m.scopeText} onChange={e => set('scopeText', e.target.value)} placeholder="Cambridge IGCSE, Cambridge A Level" />
      </Field>
      <Field label="Notes"><textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={m.notes} onChange={e => set('notes', e.target.value)} /></Field>
      <div>
        <div style={lbl}>Certificates / licence documents</div>
        {m.documents.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '4px 0' }}>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📄 {d.name}</span>
            <button type="button" style={{ ...btnS, color: BAD }} onClick={() => set('documents', m.documents.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <label style={{ ...btnS, display: 'inline-block', marginTop: 4 }}>
          + Upload certificate / licence
          <input type="file" accept="application/pdf,image/*" multiple style={{ display: 'none' }} onChange={e => { addDocs(e.target.files); e.target.value = '' }} />
        </label>
      </div>
    </Modal>
  )
}
