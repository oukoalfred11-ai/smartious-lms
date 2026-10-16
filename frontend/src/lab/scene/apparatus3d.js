/**
 * apparatus3d.js — a procedural 3D model for every item in the stockroom
 * (shared/lab/apparatus.js). Original geometry built in code: no model
 * files, no URLs, nothing to licence.
 *
 *   MODELS[id]()  → THREE.Object3D, base at y = 0, front facing +z, metres
 *   buildModel(id) → the model, or a labelled stock box for an unknown id
 *   footprint(id) → approximate width in metres, for laying out a bench
 *
 * Optional hooks on obj.userData (all purely visual, no physics here):
 *   setDisplay(text)   numeric display (meters, balance, stopwatch, …)
 *   setLevel(f)        0…1 visual state (liquid level, slider, stretch, load)
 *   levelWith          other apparatus ids whose setting also drives setLevel
 *   hangPoint          (stand) local point other items hang from
 *   hangTop()          local y of the attachment point when hung
 *   hang(len)          (pendulum) switch to the hanging pose
 */
import * as THREE from 'three'
import { APPARATUS } from '../../../../shared/lab/apparatus.js'
import { labelPlane, knifeSwitch } from './equipment.js'

const PI = Math.PI
const MONO = '"DejaVu Sans Mono", "Courier New", monospace'
const SANS = '"Helvetica Neue", Arial, sans-serif'
export const LCD = { bg: '#14231A', fg: '#8EF08E' }

// ── Materials ──────────────────────────────────────────────
const PAL = {
  metal:  { color: '#A3ABB4', metalness: 0.7, roughness: 0.35 },
  steel:  { color: '#C8CDD3', metalness: 0.85, roughness: 0.22 },
  chrome: { color: '#E1E5EA', metalness: 0.95, roughness: 0.12 },
  alu:    { color: '#CBCFD4', metalness: 0.6, roughness: 0.4 },
  iron:   { color: '#3A3D42', metalness: 0.5, roughness: 0.6 },
  case:   { color: '#202329', roughness: 0.55 },
  caseLt: { color: '#2E333B', roughness: 0.5 },
  labGrey:{ color: '#B7BDC4', roughness: 0.55, metalness: 0.15 },
  panel:  { color: '#D9DDE2', roughness: 0.6 },
  cream:  { color: '#ECE6D6', roughness: 0.7 },
  white:  { color: '#F6F6F4', roughness: 0.6 },
  black:  { color: '#141414', roughness: 0.45 },
  rubber: { color: '#26282B', roughness: 0.9 },
  wood:   { color: '#C69C6D', roughness: 0.75 },
  woodDk: { color: '#8C6239', roughness: 0.8 },
  red:    { color: '#C62828', roughness: 0.4 },
  blue:   { color: '#1F5FAF', roughness: 0.45 },
  green:  { color: '#2E7D32', roughness: 0.5 },
  yellow: { color: '#E2B21F', roughness: 0.5 },
  brass:  { color: '#C8A04A', metalness: 0.8, roughness: 0.3 },
  copper: { color: '#B86B3A', metalness: 0.75, roughness: 0.35 },
  pcb:    { color: '#1F6B3A', roughness: 0.6 },
  card:   { color: '#C9A877', roughness: 0.9 },
  glass:  { color: '#DDEBF5', transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0, depthWrite: false, side: THREE.DoubleSide },
  plastic:{ color: '#D7E7F2', transparent: true, opacity: 0.45, roughness: 0.15, depthWrite: false, side: THREE.DoubleSide },
  water:  { color: '#BFDDF2', transparent: true, opacity: 0.5, roughness: 0.15, depthWrite: false },
  oil:    { color: '#D9A23A', transparent: true, opacity: 0.78, roughness: 0.2, depthWrite: false },
}
function M(name, over = {}) {
  const base = PAL[name] || { color: name, roughness: 0.5 }
  return new THREE.MeshStandardMaterial({ ...base, ...over })
}
const glow = (c) => M(c, { emissive: c, emissiveIntensity: 0.8, roughness: 0.3 })

// ── Geometry helpers (y argument = bottom for box/cyl, centre for others) ──
function mesh(geo, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, typeof m === 'string' ? M(m) : m)
  o.position.set(x, y, z)
  return o
}
const box = (w, h, d, m, x = 0, y = 0, z = 0) => mesh(new THREE.BoxGeometry(w, h, d), m, x, y + h / 2, z)
const cyl = (r, h, m, x = 0, y = 0, z = 0, seg = 24, rb) => mesh(new THREE.CylinderGeometry(r, rb ?? r, h, seg), m, x, y + h / 2, z)
function rod(r, len, m, axis = 'x', x = 0, y = 0, z = 0, seg = 20) {
  const o = mesh(new THREE.CylinderGeometry(r, r, len, seg), m, x, y, z)
  if (axis === 'x') o.rotation.z = PI / 2
  else if (axis === 'z') o.rotation.x = PI / 2
  return o
}
const ball = (r, m, x = 0, y = 0, z = 0, seg = 20) => mesh(new THREE.SphereGeometry(r, seg, Math.max(8, Math.round(seg * 0.7))), m, x, y, z)
const torus = (R, t, m, arc = 2 * PI, x = 0, y = 0, z = 0, ts = 24) => mesh(new THREE.TorusGeometry(R, t, 8, ts, arc), m, x, y, z)
const lathe = (pts, m, seg = 32) => mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), m)
function grp(...children) { const g = new THREE.Group(); for (const c of children) if (c) g.add(c); return g }
/** A unit-height cylinder whose base is at y = 0, for scale.y level changes. */
const column = (r, m, seg = 24) => { const o = mesh(new THREE.CylinderGeometry(r, r, 1, seg).translate(0, 0.5, 0), m); return o }
function link(a, b, r, m, seg = 8) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b)
  const d = B.clone().sub(A), L = d.length()
  const o = mesh(new THREE.CylinderGeometry(r, r, L, seg), m)
  o.position.copy(A).addScaledVector(d, 0.5)
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())
  return o
}
function cable(points, r, m, seg = 40) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)))
  return mesh(new THREE.TubeGeometry(curve, seg, r, 6, false), m)
}
class Helix extends THREE.Curve {
  constructor(radius, length, turns) { super(); this.radius = radius; this.length = length; this.turns = turns }
  getPoint(t, target = new THREE.Vector3()) {
    const a = 2 * PI * this.turns * t
    return target.set(this.radius * Math.cos(a), this.length * t, this.radius * Math.sin(a))
  }
}
/** Helix along +y from y = 0 to y = length, starting at (radius, 0, 0). */
const helix = (radius, length, turns, wire, m) => mesh(new THREE.TubeGeometry(new Helix(radius, length, turns), Math.max(32, Math.round(turns * 18)), wire, 6, false), m)

/** Move an object up so its lowest point is at y = 0. */
function rest(o) {
  o.updateMatrixWorld(true)
  const b = new THREE.Box3().setFromObject(o)
  if (Number.isFinite(b.min.y)) o.position.y -= b.min.y
  return o
}

// ── Canvas text and printed scales ─────────────────────────
function fitDraw(meshObj, text, { bg, fg = '#1A1A1A', weight = 'bold', family = SANS, pad = 0.1, align = 'center' } = {}) {
  const tex = meshObj.material.map
  const c = tex.image, ctx = c.getContext('2d')
  const W = c.width, H = c.height
  ctx.clearRect(0, 0, W, H)
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H) }
  const lines = String(text ?? '').split('\n')
  let size = (H * (1 - pad * 2)) / (lines.length * 1.12)
  ctx.font = `${weight} ${size}px ${family}`
  const widest = Math.max(1, ...lines.map(l => ctx.measureText(l).width))
  const avail = W * (1 - pad * 2)
  if (widest > avail) { size *= avail / widest; ctx.font = `${weight} ${size}px ${family}` }
  ctx.fillStyle = fg; ctx.textAlign = align; ctx.textBaseline = 'middle'
  const x = align === 'center' ? W / 2 : align === 'right' ? W * (1 - pad) : W * pad
  lines.forEach((l, i) => ctx.fillText(l, x, H / 2 + (i - (lines.length - 1) / 2) * size * 1.12))
  tex.needsUpdate = true
}
/** A printed plate (labelPlane) whose text always fits; setText(t) redraws it. */
export function plate(text, w, h, o = {}) {
  const opts = { bg: '#FFFFFF', fg: '#1A1A1A', weight: 'bold', family: SANS, pad: 0.1, ...o }
  const p = labelPlane('', { w, h, bg: opts.bg || 'rgba(0,0,0,0)', fg: opts.fg })
  p.userData.setText = (t, col = {}) => fitDraw(p, t, { ...opts, ...col })
  p.userData.setText(text)
  return p
}
export function wrapText(s, max = 15, maxLines = 3) {
  const words = String(s).split(/\s+/), lines = []
  let cur = ''
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w } else cur = cur ? cur + ' ' + w : w
  }
  if (cur) lines.push(cur)
  if (lines.length > maxLines) { const head = lines.slice(0, maxLines - 1); head.push(lines.slice(maxLines - 1).join(' ')); return head.join('\n') }
  return lines.join('\n')
}
const front = (p, x, y, zFace) => { p.position.set(x, y, zFace + 0.0008); return p }
const onTop = (p, x, yTop, z) => { p.rotation.x = -PI / 2; p.position.set(x, yTop + 0.0008, z); return p }

function canvasTex(pw, ph, draw) {
  const c = document.createElement('canvas'); c.width = pw; c.height = ph
  draw(c.getContext('2d'), pw, ph)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}
/** Ruler markings on a flat strip (lying on its face). cm = printed length. */
function scalePlane(len, wid, cm, { bg = null, fg = '#1A1A1A', margin = 0.005 } = {}) {
  const pw = Math.min(2048, Math.max(256, Math.round(cm * 40))), ph = Math.max(24, Math.round(pw * wid / len))
  const tex = canvasTex(pw, ph, (ctx, W, H) => {
    if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H) } else ctx.clearRect(0, 0, W, H)
    const x0 = W * margin / len, x1 = W * (1 - margin / len), perMm = (x1 - x0) / (cm * 10), perCm = perMm * 10
    ctx.strokeStyle = fg; ctx.fillStyle = fg; ctx.lineWidth = Math.max(1, perMm * 0.18)
    ctx.beginPath()
    for (let i = 0; i <= cm * 10; i++) {
      const x = x0 + i * perMm
      const l = i % 10 === 0 ? 0.45 : i % 5 === 0 ? 0.32 : 0.2
      if (perMm < 1.4 && i % 10 && i % 5) continue
      ctx.moveTo(x, 0); ctx.lineTo(x, H * l)
    }
    ctx.stroke()
    const every = perCm >= 32 ? 1 : perCm >= 14 ? 5 : 10
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    for (let c = every; c < cm; c += every) {
      ctx.font = `${c % 10 === 0 ? 'bold ' : ''}${Math.round(H * 0.3)}px ${SANS}`
      ctx.fillText(String(c), x0 + c * perCm, H * 0.7)
    }
  })
  const p = new THREE.Mesh(new THREE.PlaneGeometry(len, wid), new THREE.MeshStandardMaterial({ map: tex, transparent: !bg, roughness: 0.7 }))
  p.rotation.x = -PI / 2
  return p
}
/** Graduation marks wrapped on the front of a cylinder (glassware). */
function gradBand(r, h, majors, { label = '', fg = '#1F2A36' } = {}) {
  const tex = canvasTex(128, 512, (ctx, W, H) => {
    ctx.clearRect(0, 0, W, H); ctx.strokeStyle = fg; ctx.fillStyle = fg; ctx.lineWidth = 3
    const n = majors * 5
    ctx.beginPath()
    for (let i = 1; i <= n; i++) { const y = H - (i / n) * H * 0.98; const l = i % 5 === 0 ? 0.55 : 0.3; ctx.moveTo(W * 0.15, y); ctx.lineTo(W * (0.15 + l * 0.6), y) }
    ctx.stroke()
    ctx.font = `bold 34px ${SANS}`; ctx.textBaseline = 'middle'
    for (let i = 1; i <= majors; i++) ctx.fillText(String(i * (label ? +label : 1)), W * 0.55, H - (i / majors) * H * 0.98 + 18)
  })
  const geo = new THREE.CylinderGeometry(r, r, h, 12, 1, true, -0.45, 0.9)
  return mesh(geo, new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 0.5 }))
}
function stripeTex(c1, c2, n = 8) {
  const t = canvasTex(8, 64, (ctx, W, H) => { for (let i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? c2 : c1; ctx.fillRect(0, (i * H) / n, W, H / n) } })
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

// ── Instrument parts ───────────────────────────────────────
function postFront(colour, x, y, zFace) {
  return grp(rod(0.0055, 0.012, colour, 'z', x, y, zFace + 0.006, 16), rod(0.0032, 0.004, 'brass', 'z', x, y, zFace + 0.014, 12))
}
function postUp(colour, x, yTop, z) {
  return grp(cyl(0.0055, 0.012, colour, x, yTop, z, 16), cyl(0.0032, 0.004, 'brass', x, yTop + 0.012, z, 12))
}
function knobFront(r, x, y, zFace, colour = '#1A1A1A') {
  return grp(
    rod(r * 1.25, 0.003, '#3A3F47', 'z', x, y, zFace + 0.0015, 24),
    rod(r, 0.012, colour, 'z', x, y, zFace + 0.006, 24),
    box(0.0016, r * 0.85, 0.001, '#F2F2F2', x, y, zFace + 0.0125),
  )
}
/** LCD with a black bezel on a front face; installs g.userData.setDisplay. */
function screenOn(g, w, h, x, yc, zFace, initial = '----') {
  g.add(box(w + 0.008, h + 0.008, 0.003, '#0B0D10', x, yc - (h + 0.008) / 2, zFace + 0.0015))
  const s = plate(initial, w, h, { ...LCD, family: MONO, pad: 0.12 })
  s.position.set(x, yc, zFace + 0.0038)
  g.add(s)
  g.userData.screen = s
  g.userData.setDisplay = (t) => s.userData.setText(String(t))
  return s
}
/** Upright bench meter: black case, green LCD, terminals, range knob. */
function benchMeter({ title, unit, accent = '#C62828', w = 0.15, h = 0.1, d = 0.12, initial = '----' }) {
  const g = grp()
  g.add(box(w, h, d, 'case', 0, 0.004, 0))
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.006, 0.004, 'rubber', sx * (w / 2 - 0.012), 0, sz * (d / 2 - 0.012), 12))
  const zf = d / 2, y0 = 0.004
  screenOn(g, w * 0.72, h * 0.3, 0, y0 + h * 0.72, zf, initial)
  g.add(front(plate(title, w * 0.62, h * 0.11, { bg: '#202329', fg: '#E8EAED' }), -w * 0.1, y0 + h * 0.47, zf))
  g.add(front(plate(unit, h * 0.17, h * 0.17, { bg: accent, fg: '#FFFFFF' }), w * 0.33, y0 + h * 0.47, zf))
  g.add(box(w, 0.003, 0.0015, accent, 0, y0 + h * 0.38, zf + 0.0008))
  g.add(postFront('#C62828', w * 0.3, y0 + h * 0.18, zf), postFront('#151515', -w * 0.3, y0 + h * 0.18, zf))
  g.add(knobFront(0.011, 0, y0 + h * 0.18, zf))
  return g
}
/** Instrument box with a lighter front panel. */
function cabinet(w, h, d, body, panel) {
  const g = grp(box(w, h, d, body, 0, 0.004, 0), box(w - 0.006, h - 0.006, 0.002, panel, 0, 0.007, d / 2))
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.006, 0.004, 'rubber', sx * (w / 2 - 0.014), 0, sz * (d / 2 - 0.014), 12))
  g.userData.zf = d / 2 + 0.001
  return g
}
/** Handheld meter leaning back on its stand; screen faces up-front. */
function handheld({ w = 0.075, h = 0.15, d = 0.035, colour = 'case', holster = null, initial = '----', build }) {
  const inner = grp()
  if (holster) inner.add(box(w + 0.01, h + 0.01, d - 0.006, holster, 0, -0.005, -0.004))
  inner.add(box(w, h, d, colour, 0, 0, 0))
  const zf = d / 2
  screenOn(inner, w * 0.78, h * 0.2, 0, h * 0.8, zf, initial)
  build?.(inner, zf)
  inner.rotation.x = -0.35
  inner.add(box(w * 0.7, h * 0.5, 0.004, '#3A3F47', 0, 0, -d / 2 - 0.004))
  const g = grp(inner)
  rest(inner)
  g.userData.setDisplay = inner.userData.setDisplay
  g.userData.screen = inner.userData.screen
  return g
}
/** Round dial gauge facing +z, centred on its local origin; setNeedle(f). */
function dialGauge(r = 0.04, { unit = 'kPa', max = 400, majors = 8 } = {}) {
  const tex = canvasTex(256, 256, (ctx, W, H) => {
    const cx = W / 2, cy = H / 2, R = W * 0.47
    ctx.fillStyle = '#FAFAF7'; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#1A1A1A'; ctx.fillStyle = '#1A1A1A'
    for (let i = 0; i <= majors * 5; i++) {
      const f = i / (majors * 5), th = 3 * PI / 4 - f * 1.5 * PI
      const dx = -Math.sin(th), dy = -Math.cos(th), l = i % 5 === 0 ? 0.16 : 0.08
      ctx.lineWidth = i % 5 === 0 ? 3 : 1.5
      ctx.beginPath(); ctx.moveTo(cx + dx * R * 0.92, cy + dy * R * 0.92); ctx.lineTo(cx + dx * R * (0.92 - l), cy + dy * R * (0.92 - l)); ctx.stroke()
      if (i % 5 === 0) {
        ctx.font = `bold 20px ${SANS}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(String(Math.round(max * f)), cx + dx * R * 0.6, cy + dy * R * 0.6)
      }
    }
    ctx.font = `16px ${SANS}`; ctx.fillText(unit, cx, cy + R * 0.45)
  })
  const g = grp(rod(r, 0.02, 'chrome', 'z', 0, 0, 0, 40))
  const face = mesh(new THREE.CircleGeometry(r * 0.9, 40), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), 0, 0, 0.0102)
  const pivot = grp(box(0.0025, r * 0.78, 0.001, 'red', 0, -r * 0.1, 0), rod(0.004, 0.002, 'black', 'z', 0, 0, 0.0006, 12))
  pivot.position.z = 0.0112
  g.add(face, pivot)
  g.userData.setNeedle = (f) => { pivot.rotation.z = 3 * PI / 4 - Math.min(1, Math.max(0, f)) * 1.5 * PI }
  g.userData.setNeedle(0)
  return g
}
/** Small component board: cream base, two terminals, printed label. */
function onBoard(label, part, { w = 0.1, d = 0.06 } = {}) {
  const g = grp(box(w, 0.01, d, 'cream'))
  g.add(postUp('#C62828', -w / 2 + 0.014, 0.01, -d / 2 + 0.016), postUp('#151515', w / 2 - 0.014, 0.01, -d / 2 + 0.016))
  g.add(onTop(plate(label, w * 0.6, 0.014, { bg: '#ECE6D6', fg: '#333' }), 0, 0.01, d / 2 - 0.011))
  if (part) { part.position.y += 0.01; g.add(part) }
  return g
}
const legs = (x1, x2, y, m = 'steel') => grp(link([x1, 0, 0], [x1, y, 0], 0.0006, m, 6), link([x2, 0, 0], [x2, y, 0], 0.0006, m, 6))
function resistorBody(x, y, z, bands = ['#8B4513', '#000000', '#C62828', '#D4AF37'], len = 0.03) {
  const g = grp(rod(0.0045, len, '#C8B48A', 'x', 0, 0, 0, 14), rod(0.0006, len + 0.03, 'steel', 'x', 0, 0, 0, 6))
  bands.forEach((c, i) => g.add(rod(0.0047, 0.0025, c, 'x', -len * 0.3 + i * len * 0.2, 0, 0, 14)))
  g.position.set(x, y, z)
  return g
}
function slottedDisc(R, thick, m) {
  const w = 0.0035, rIn = 0.004
  const so = Math.asin(w / R), si = Math.asin(Math.min(0.99, w / rIn))
  const s = new THREE.Shape()
  s.absarc(0, 0, R, so, 2 * PI - so, false)
  s.absarc(0, 0, rIn, 2 * PI - si, si, true)
  s.closePath()
  const o = mesh(new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false, curveSegments: 20 }), m)
  o.rotation.x = -PI / 2
  return o
}
function spool(flange, core, r = 0.025) {
  return grp(cyl(r, 0.003, flange, 0, 0, 0, 28), cyl(r * 0.72, 0.022, core, 0, 0.003, 0, 28), cyl(r, 0.003, flange, 0, 0.025, 0, 28), cyl(0.005, 0.029, '#111', 0, 0.0005, 0, 12))
}

// ── Registry ───────────────────────────────────────────────
const FOOT = {}
const BUILD = {}
function reg(id, foot, fn) { FOOT[id] = foot; BUILD[id] = fn }

// Measuring ─────────────────────────────────────────────────
function rule(len, cm, wood = true) {
  const g = grp(box(len, 0.007, 0.028, wood ? 'wood' : '#F2F2EE'))
  const s = scalePlane(len, 0.028, cm, { bg: wood ? '#E9D3A8' : '#F7F7F3' }); s.position.y = 0.0078
  g.add(s)
  return g
}
reg('metre_rule', 1.06, () => {
  const g = rule(1.01, 100)
  const marker = grp(box(0.006, 0.012, 0.034, 'red', 0, 0, 0)); marker.visible = false
  g.add(marker)
  g.userData.setLevel = (f) => { marker.visible = true; marker.position.x = -0.5 + 0.15 + 0.8 * f }
  return g
})
reg('ruler_30cm', 0.34, () => rule(0.31, 30, false))

function callipers(digital) {
  const g = grp()
  g.add(box(0.22, 0.004, 0.016, 'steel', 0.01, 0, 0))
  g.add(box(0.012, 0.004, 0.045, 'steel', -0.094, 0, -0.03), box(0.006, 0.004, 0.016, 'steel', -0.097, 0, 0.016))
  const sc = scalePlane(0.2, 0.012, 20, { margin: 0.002 }); sc.position.set(0.015, 0.0042, 0.001); g.add(sc)
  const sx = -0.06
  g.add(box(0.045, 0.008, 0.026, digital ? 'case' : 'steel', sx, 0, 0.002))
  g.add(box(0.012, 0.004, 0.045, 'steel', sx - 0.017, 0, -0.03), box(0.006, 0.004, 0.016, 'steel', sx - 0.02, 0, 0.018))
  g.add(cyl(0.0035, 0.004, 'chrome', sx + 0.012, 0.008, -0.004, 12))
  if (digital) {
    const s = plate('0.00 mm', 0.034, 0.012, { ...LCD, family: MONO })
    onTop(s, sx - 0.002, 0.008, 0.004); g.add(s)
    g.add(cyl(0.0025, 0.002, '#C62828', sx + 0.016, 0.008, 0.009, 10))
    g.userData.screen = s
    g.userData.setDisplay = (t) => s.userData.setText(String(t))
  } else {
    const v = scalePlane(0.026, 0.008, 2.6, { margin: 0.001 }); v.position.set(sx + 0.002, 0.0088, 0.006); g.add(v)
  }
  g.add(box(0.03, 0.002, 0.003, 'steel', 0.13, 0.001, 0))
  return g
}
reg('vernier_callipers', 0.27, () => callipers(false))
reg('digital_callipers', 0.27, () => callipers(true))

reg('micrometer', 0.16, () => {
  const R = 0.022, cy = 0.039, g = grp(box(0.07, 0.012, 0.04, 'case', -0.01, 0, 0))
  const frame = torus(R, 0.005, '#59636E', PI, 0, cy, 0); frame.rotation.z = PI
  g.add(frame, cyl(0.004, 0.012, '#59636E', 0, 0.006, 0, 12))
  g.add(rod(0.0028, 0.008, 'chrome', 'x', -R + 0.004, cy, 0), rod(0.0028, 2 * R - 0.012, 'chrome', 'x', 0.006, cy, 0))
  g.add(rod(0.006, 0.01, '#59636E', 'x', R + 0.001, cy, 0))
  g.add(rod(0.0055, 0.034, 'chrome', 'x', R + 0.023, cy, 0), rod(0.0075, 0.03, 'chrome', 'x', R + 0.047, cy, 0, 24), rod(0.0045, 0.014, 'chrome', 'x', R + 0.069, cy, 0))
  g.add(box(0.03, 0.0006, 0.0008, '#111', R + 0.023, cy + 0.0052, 0.0001))
  g.position.x = -0.03
  return grp(g)
})

reg('top_pan_balance', 0.24, () => {
  const g = grp(box(0.19, 0.056, 0.22, 'panel', 0, 0.004, 0))
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.008, 0.004, 'rubber', sx * 0.08, 0, sz * 0.09, 12))
  g.add(cyl(0.01, 0.006, 'metal', 0, 0.06, -0.02), cyl(0.065, 0.005, 'steel', 0, 0.066, -0.02, 40))
  screenOn(g, 0.1, 0.024, -0.02, 0.04, 0.11, '0.00 g')
  g.add(box(0.016, 0.008, 0.004, '#3A3F47', 0.06, 0.036, 0.11), box(0.016, 0.008, 0.004, '#1F5FAF', 0.06, 0.018, 0.11))
  g.add(front(plate('TARE', 0.018, 0.006, { bg: '#D9DDE2', fg: '#333' }), 0.06, 0.012, 0.11))
  return g
})

reg('stopwatch', 0.08, () => {
  const inner = grp(rod(0.032, 0.014, 'case', 'z', 0, 0, 0, 40), torus(0.0305, 0.0018, 'metal', 2 * PI, 0, 0, 0.007, 40))
  inner.add(mesh(new THREE.CircleGeometry(0.029, 40), '#D9DDE2', 0, 0, 0.0072))
  const s = plate('0.00', 0.04, 0.016, { ...LCD, family: MONO }); s.position.set(0, 0.004, 0.0082); inner.add(s)
  const name = plate('STOPWATCH', 0.03, 0.005, { bg: '#D9DDE2', fg: '#333' }); name.position.set(0, -0.014, 0.0082); inner.add(name)
  inner.add(cyl(0.004, 0.008, 'metal', 0, 0.031, 0, 12), torus(0.007, 0.0015, 'metal', 2 * PI, 0, 0.045, 0))
  for (const a of [-0.7, 0.7]) { const b = cyl(0.003, 0.006, a < 0 ? '#C62828' : '#3A3F47', -Math.sin(a) * 0.031, Math.cos(a) * 0.031 - 0.003, 0, 10); b.rotation.z = a; inner.add(b) }
  inner.rotation.x = -1.05
  const g = grp(inner); rest(inner)
  g.userData.screen = s
  g.userData.setDisplay = (t) => s.userData.setText(String(t))
  return g
})

reg('protractor', 0.17, () => {
  const r = 0.075
  const tex = canvasTex(512, 512, (ctx, W) => {
    ctx.clearRect(0, 0, W, W); ctx.strokeStyle = '#1A1A1A'; ctx.fillStyle = '#1A1A1A'
    const cx = W / 2, cy = W / 2, R = W * 0.49
    for (let d = 0; d <= 180; d++) {
      const a = d * PI / 180, l = d % 10 === 0 ? 0.12 : d % 5 === 0 ? 0.08 : 0.05
      ctx.lineWidth = d % 10 === 0 ? 2 : 1
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R, cy - Math.sin(a) * R); ctx.lineTo(cx + Math.cos(a) * R * (1 - l), cy - Math.sin(a) * R * (1 - l)); ctx.stroke()
      if (d % 10 === 0) { ctx.font = `bold 16px ${SANS}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(d), cx + Math.cos(a) * R * 0.8, cy - Math.sin(a) * R * 0.8) }
    }
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - R, cy - 2); ctx.lineTo(cx + R, cy - 2); ctx.moveTo(cx, cy - 2); ctx.lineTo(cx, cy - 18); ctx.stroke()
  })
  const body = mesh(new THREE.CylinderGeometry(r, r, 0.002, 48, 1, false, PI / 2, PI), M('#CFE3EE', { transparent: true, opacity: 0.55, roughness: 0.15, depthWrite: false }), 0, 0.001, 0)
  const face = mesh(new THREE.CircleGeometry(r, 48, 0, PI), new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 0.4 }), 0, 0.0022, 0)
  face.rotation.x = -PI / 2
  const g = grp(body, face); g.position.z = r / 2
  return grp(g)
})

reg('set_square', 0.24, () => {
  const s = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0.2, 0), new THREE.Vector2(0, 0.11)])
  s.holes.push(new THREE.Path([new THREE.Vector2(0.03, 0.02), new THREE.Vector2(0.13, 0.02), new THREE.Vector2(0.03, 0.075)]))
  const m = mesh(new THREE.ExtrudeGeometry(s, { depth: 0.0025, bevelEnabled: false }), M('#B5D8E8', { transparent: true, opacity: 0.6, roughness: 0.15, depthWrite: false }))
  m.rotation.x = -PI / 2
  m.position.set(-0.1, 0, 0.055)
  return grp(m)
})

reg('thermometer', 0.33, () => {
  const g = grp(rod(0.0035, 0.3, 'glass', 'x', 0, 0.0045, 0, 14), ball(0.0045, 'glass', -0.152, 0.0045, 0, 14))
  g.add(ball(0.0034, '#C62828', -0.152, 0.0045, 0, 12), box(0.27, 0.0004, 0.004, '#F4F4F2', 0.0, 0.0018, 0))
  const col = rod(0.0011, 1, '#C62828', 'x', 0, 0.0045, 0, 8); g.add(col)
  const sc = scalePlane(0.26, 0.005, 12, { margin: 0.004 }); sc.position.set(0.0, 0.0083, -0.0005); g.add(sc)
  g.add(rod(0.0036, 0.006, 'glass', 'x', 0.153, 0.0045, 0, 14))
  g.userData.setLevel = (f) => { const L = 0.27 * (0.08 + 0.85 * Math.min(1, Math.max(0, f))); col.scale.y = L; col.position.x = -0.148 + L / 2 }
  g.userData.setLevel(0.2)
  return g
})

reg('measuring_cylinder', 0.1, () => {
  const g = grp(cyl(0.042, 0.01, '#2E6DB4', 0, 0, 0, 6))
  const gl = lathe([[0, 0.01], [0.021, 0.01], [0.021, 0.27], [0.023, 0.275], [0.0245, 0.277]], 'glass'); g.add(gl)
  const band = gradBand(0.0213, 0.24, 5, { label: '50' }); band.position.y = 0.012 + 0.12; g.add(band)
  const liq = column(0.0198, 'water'); liq.position.y = 0.011; g.add(liq)
  g.userData.setLevel = (f) => { liq.scale.y = 0.24 * (0.05 + 0.9 * Math.min(1, Math.max(0, f))) }
  g.userData.setLevel(0.4)
  return g
})

reg('newton_meter', 0.3, () => {
  const g = grp(rod(0.011, 0.2, M('#EEF3F6', { transparent: true, opacity: 0.6, depthWrite: false }), 'x', 0, 0.012, 0, 20))
  g.add(box(0.18, 0.0005, 0.012, '#FAFAF7', 0, 0.0115, 0))
  const sc = scalePlane(0.17, 0.008, 10, { margin: 0.003 }); sc.position.set(0, 0.0235, 0); g.add(sc)
  g.add(rod(0.0115, 0.015, 'red', 'x', 0.105, 0.012, 0), rod(0.0115, 0.01, 'red', 'x', -0.1, 0.012, 0))
  const ring = torus(0.009, 0.0016, 'steel', 2 * PI, 0.123, 0.012, 0); ring.rotation.x = PI / 2
  const hookRod = rod(0.0012, 0.02, 'steel', 'x', -0.115, 0.012, 0, 8)
  const hook = torus(0.006, 0.0014, 'steel', 1.4 * PI, -0.131, 0.012, 0); hook.rotation.x = PI / 2
  g.add(ring, hookRod, hook)
  return g
})

reg('light_gate', 0.36, () => {
  const g = grp()
  const gate = (x) => grp(box(0.06, 0.012, 0.05, 'iron', x, 0, 0), box(0.066, 0.014, 0.03, 'case', x, 0.012, 0), box(0.016, 0.07, 0.03, 'case', x - 0.025, 0.026, 0), box(0.016, 0.07, 0.03, 'case', x + 0.025, 0.026, 0), ball(0.002, glow('#FF3B30'), x - 0.0168, 0.08, 0, 8))
  g.add(gate(-0.14), gate(-0.05))
  const t = cabinet(0.12, 0.06, 0.09, 'case', '#2B3038'); t.position.x = 0.1; g.add(t)
  screenOn(t, 0.085, 0.022, 0, 0.045, t.userData.zf, '0.000')
  t.add(front(plate('TIMER  s', 0.07, 0.009, { bg: '#2B3038', fg: '#E8EAED' }), 0, 0.02, t.userData.zf))
  g.add(cable([[-0.14, 0.04, -0.016], [-0.1, 0.01, -0.04], [0.06, 0.01, -0.05], [0.08, 0.03, -0.045]], 0.0015, 'black'))
  g.userData.setDisplay = t.userData.setDisplay; g.userData.screen = t.userData.screen
  return g
})

reg('pressure_gauge', 0.13, () => {
  const g = grp(box(0.07, 0.016, 0.05, 'iron'), cyl(0.006, 0.04, 'brass', 0, 0.016, 0, 12), cyl(0.009, 0.008, 'brass', 0, 0.03, 0, 6))
  const d = dialGauge(0.045); d.position.set(0, 0.056 + 0.045, 0); g.add(d)
  g.userData.setLevel = d.userData.setNeedle
  return g
})

reg('light_meter', 0.1, () => handheld({ w: 0.065, h: 0.12, d: 0.025, colour: '#2B3A55', initial: '0 lx', build: (inner, zf) => {
  inner.add(cyl(0.012, 0.006, '#F4F4F2', 0, 0.12, 0, 24), ball(0.011, M('#FAFAF7', { roughness: 0.3 }), 0, 0.126, 0, 16))
  inner.add(front(plate('LUX', 0.03, 0.01, { bg: '#2B3A55', fg: '#FFF' }), 0, 0.06, zf))
  inner.add(box(0.012, 0.008, 0.004, '#C62828', -0.015, 0.03, zf), box(0.012, 0.008, 0.004, '#3A3F47', 0.015, 0.03, zf))
} }))

reg('gm_tube', 0.34, () => {
  const g = grp()
  const c = cabinet(0.16, 0.075, 0.12, '#2D3E50', '#D9DDE2'); c.position.x = 0.07; g.add(c)
  screenOn(c, 0.11, 0.026, 0, 0.055, c.userData.zf, '0000')
  c.add(front(plate('COUNTER', 0.08, 0.01, { bg: '#D9DDE2', fg: '#2D3E50' }), -0.02, 0.026, c.userData.zf), knobFront(0.008, 0.05, 0.022, c.userData.zf))
  g.add(box(0.05, 0.01, 0.05, 'iron', -0.11, 0, 0), cyl(0.004, 0.05, 'steel', -0.11, 0.01, 0, 12), box(0.02, 0.016, 0.026, 'case', -0.11, 0.054, 0))
  g.add(rod(0.011, 0.11, 'chrome', 'x', -0.11, 0.075, 0, 24), rod(0.0115, 0.02, 'case', 'x', -0.06, 0.075, 0, 24))
  g.add(mesh(new THREE.CircleGeometry(0.009, 24), '#3A2A1A', -0.1652, 0.075, 0)); g.children[g.children.length - 1].rotation.y = -PI / 2
  g.add(cable([[-0.05, 0.075, 0], [-0.03, 0.03, -0.02], [0.0, 0.01, -0.06], [0.07, 0.04, -0.062]], 0.0018, 'black'))
  g.userData.setDisplay = c.userData.setDisplay; g.userData.screen = c.userData.screen
  return g
})

reg('hall_probe', 0.31, () => {
  const m = benchMeter({ title: 'TESLAMETER', unit: 'mT', accent: '#6A3FA0', w: 0.12, h: 0.08, d: 0.09 })
  m.position.x = 0.07
  const g = grp(m)
  g.add(rod(0.005, 0.12, '#3A3F47', 'x', -0.08, 0.005, 0.04, 16), box(0.03, 0.002, 0.008, '#C8A04A', -0.155, 0.004, 0.04))
  g.add(cable([[-0.02, 0.005, 0.04], [0.0, 0.01, 0.05], [0.04, 0.02, 0.06], [0.07, 0.03, 0.05]], 0.0016, 'black'))
  g.userData.setDisplay = m.userData.setDisplay; g.userData.screen = m.userData.screen
  return g
})

reg('datalogger', 0.2, () => {
  const g = grp(box(0.17, 0.045, 0.12, '#E3E6EA', 0, 0, 0))
  const s = plate('----', 0.1, 0.05, { ...LCD, family: MONO }); onTop(s, 0, 0.045, -0.015); g.add(s)
  g.add(box(0.108, 0.0006, 0.058, '#0B0D10', 0, 0.045, -0.015))
  for (let i = 0; i < 4; i++) g.add(postFront(['#C62828', '#1F5FAF', '#2E7D32', '#E2B21F'][i], -0.06 + i * 0.04, 0.022, 0.06))
  for (let i = 0; i < 3; i++) g.add(box(0.016, 0.003, 0.01, '#3A3F47', -0.04 + i * 0.04, 0.045, 0.035))
  g.userData.screen = s
  g.userData.setDisplay = (t) => s.userData.setText(String(t))
  return g
})

// Electrical ────────────────────────────────────────────────
reg('ammeter', 0.19, () => benchMeter({ title: 'AMMETER', unit: 'A', accent: '#C62828' }))
reg('milliammeter', 0.19, () => benchMeter({ title: 'MILLIAMMETER', unit: 'mA', accent: '#C62828' }))
reg('voltmeter', 0.19, () => benchMeter({ title: 'VOLTMETER', unit: 'V', accent: '#1F5FAF' }))
reg('millivoltmeter', 0.19, () => benchMeter({ title: 'MILLIVOLTMETER', unit: 'mV', accent: '#1F5FAF' }))
reg('joulemeter', 0.22, () => benchMeter({ title: 'JOULEMETER', unit: 'J', accent: '#E2B21F', w: 0.18, initial: '00000' }))

reg('multimeter', 0.14, () => {
  const g = handheld({ w: 0.075, h: 0.155, d: 0.04, colour: 'case', holster: 'yellow', build: (inner, zf) => {
    inner.add(rod(0.02, 0.008, '#3A3F47', 'z', 0, 0.075, zf + 0.004, 32), box(0.004, 0.02, 0.003, '#F2F2F2', 0, 0.075, zf + 0.0085))
    inner.add(front(plate('V  Ω  A', 0.05, 0.008, { bg: '#202329', fg: '#E2B21F' }), 0, 0.104, zf))
    inner.add(rod(0.004, 0.004, '#C62828', 'z', 0.024, 0.022, zf + 0.002, 12), rod(0.004, 0.004, '#111', 'z', 0, 0.022, zf + 0.002, 12), rod(0.004, 0.004, '#111', 'z', -0.024, 0.022, zf + 0.002, 12))
  } })
  g.add(rod(0.004, 0.1, 'red', 'x', 0.0, 0.004, 0.075, 12), rod(0.004, 0.1, 'black', 'x', 0.0, 0.004, 0.088, 12))
  return g
})

reg('dc_supply', 0.27, () => {
  const g = cabinet(0.23, 0.12, 0.2, '#3B4654', '#C9CED4'), zf = g.userData.zf
  screenOn(g, 0.085, 0.03, -0.055, 0.095, zf, '0.0 V')
  g.add(front(plate('D.C. POWER SUPPLY  0–12 V', 0.12, 0.012, { bg: '#C9CED4', fg: '#1F2A37' }), -0.045, 0.06, zf))
  g.add(knobFront(0.012, 0.045, 0.095, zf), knobFront(0.012, 0.085, 0.095, zf))
  g.add(postFront('#C62828', 0.085, 0.035, zf), postFront('#151515', 0.045, 0.035, zf))
  g.add(box(0.016, 0.01, 0.006, '#C62828', -0.085, 0.028, zf))
  return g
})

reg('ac_supply', 0.25, () => {
  const g = cabinet(0.22, 0.1, 0.17, '#D8D2C4', '#EFEAE0'), zf = g.userData.zf
  g.add(front(plate('A.C. SUPPLY  2–12 V', 0.12, 0.014, { bg: '#EFEAE0', fg: '#5A3B1A' }), -0.04, 0.083, zf))
  g.add(knobFront(0.016, -0.04, 0.045, zf, '#2B2B2B'))
  g.add(front(plate('2  4  6  8  10  12', 0.07, 0.009, { bg: '#EFEAE0', fg: '#333' }), -0.04, 0.069, zf))
  g.add(postFront('#E2B21F', 0.06, 0.04, zf), postFront('#E2B21F', 0.09, 0.04, zf), ball(0.003, glow('#E53935'), 0.075, 0.08, zf + 0.001, 10))
  return g
})

reg('signal_generator', 0.28, () => {
  const g = cabinet(0.26, 0.11, 0.2, 'labGrey', '#2A2F36'), zf = g.userData.zf
  screenOn(g, 0.1, 0.028, -0.06, 0.085, zf, '1000 Hz')
  g.add(front(plate('SIGNAL GENERATOR', 0.09, 0.01, { bg: '#2A2F36', fg: '#E8EAED' }), -0.06, 0.055, zf))
  g.add(knobFront(0.017, 0.05, 0.07, zf), knobFront(0.01, 0.1, 0.07, zf))
  for (let i = 0; i < 4; i++) g.add(box(0.014, 0.008, 0.004, i === 1 ? '#E2B21F' : '#B7BDC4', -0.095 + i * 0.022, 0.025, zf))
  g.add(rod(0.006, 0.012, 'chrome', 'z', 0.03, 0.03, zf + 0.006, 16), postFront('#C62828', 0.075, 0.03, zf), postFront('#151515', 0.105, 0.03, zf))
  return g
})

reg('oscilloscope', 0.37, () => {
  const g = cabinet(0.34, 0.19, 0.28, '#C9CED4', '#3A4049'), zf = g.userData.zf
  const scr = labelPlane('', { w: 0.17, h: 0.13, bg: '#08130C' })
  const draw = (text) => {
    const c = scr.material.map.image, ctx = c.getContext('2d'), W = c.width, H = c.height
    ctx.fillStyle = '#08130C'; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(120,200,140,0.35)'; ctx.lineWidth = 1; ctx.beginPath()
    for (let i = 0; i <= 10; i++) { ctx.moveTo((i * W) / 10, 0); ctx.lineTo((i * W) / 10, H) }
    for (let j = 0; j <= 8; j++) { ctx.moveTo(0, (j * H) / 8); ctx.lineTo(W, (j * H) / 8) }
    ctx.stroke()
    ctx.strokeStyle = '#7CFF9A'; ctx.lineWidth = 2.5; ctx.beginPath()
    for (let x = 0; x <= W; x += 2) { const y = H / 2 - Math.sin((x / W) * 4 * PI) * H * 0.28; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y) }
    ctx.stroke()
    if (text) { ctx.fillStyle = '#B8FFC8'; ctx.font = `bold ${Math.round(H * 0.11)}px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(String(text), W * 0.04, H * 0.04) }
    scr.material.map.needsUpdate = true
  }
  draw('')
  g.add(box(0.185, 0.145, 0.004, '#0B0D10', -0.065, 0.032, zf))
  scr.position.set(-0.065, 0.1045, zf + 0.0048); g.add(scr)
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g.add(knobFront(0.009, 0.06 + i * 0.035, 0.15 - j * 0.04, zf))
  g.add(rod(0.006, 0.012, 'chrome', 'z', 0.06, 0.03, zf + 0.006, 16), rod(0.006, 0.012, 'chrome', 'z', 0.1, 0.03, zf + 0.006, 16))
  g.add(front(plate('OSCILLOSCOPE', 0.1, 0.012, { bg: '#3A4049', fg: '#E8EAED' }), -0.065, 0.02, zf))
  g.add(rod(0.005, 0.2, 'case', 'x', 0, 0.21, 0, 12), box(0.008, 0.02, 0.008, 'case', -0.1, 0.194, 0), box(0.008, 0.02, 0.008, 'case', 0.1, 0.194, 0))
  g.userData.screen = scr
  g.userData.setDisplay = (t) => draw(t)
  return g
})

reg('dry_cell', 0.12, () => {
  const g = grp(box(0.075, 0.006, 0.03, 'case'), box(0.006, 0.026, 0.03, 'case', -0.036, 0, 0), box(0.006, 0.026, 0.03, 'case', 0.036, 0, 0))
  g.add(rod(0.0085, 0.05, '#1E1E1E', 'x', -0.003, 0.0145, 0, 20), rod(0.0087, 0.012, '#B87333', 'x', -0.022, 0.0145, 0, 20), rod(0.003, 0.004, 'metal', 'x', 0.024, 0.0145, 0, 12))
  g.add(postUp('#C62828', 0.036, 0.026, 0), postUp('#151515', -0.036, 0.026, 0))
  g.add(front(plate('1.5 V', 0.03, 0.01, { bg: '#1E1E1E', fg: '#E2B21F' }), -0.002, 0.0145, 0.0087))
  return g
})

reg('resistors', 0.2, () => {
  const g = grp(box(0.18, 0.01, 0.11, 'cream'))
  const sets = [['#8B4513', '#000000', '#000000', '#D4AF37'], ['#C62828', '#C62828', '#000000', '#D4AF37'], ['#E6B800', '#7B1FA2', '#000000', '#D4AF37'], ['#8B4513', '#000000', '#8B4513', '#D4AF37']]
  sets.forEach((b, i) => {
    const z = -0.04 + i * 0.026
    g.add(resistorBody(0, 0.018, z, b), postUp('#7A7A7A', -0.07, 0.01, z), postUp('#7A7A7A', 0.07, 0.01, z))
    g.add(link([-0.025, 0.018, z], [-0.064, 0.016, z], 0.0006, 'steel'), link([0.025, 0.018, z], [0.064, 0.016, z], 0.0006, 'steel'))
  })
  return g
})

reg('rheostat', 0.36, () => {
  const g = grp(box(0.03, 0.075, 0.06, 'case', -0.15, 0, 0), box(0.03, 0.075, 0.06, 'case', 0.15, 0, 0))
  const t = stripeTex('#B87333', '#7A4A22'); t.repeat.set(1, 50)
  g.add(rod(0.022, 0.27, new THREE.MeshStandardMaterial({ map: t, metalness: 0.5, roughness: 0.4 }), 'x', 0, 0.042, 0, 32))
  g.add(box(0.3, 0.008, 0.008, 'steel', 0, 0.083, 0))
  const slider = grp(box(0.028, 0.02, 0.026, 'case', 0, 0.072, 0), box(0.004, 0.012, 0.012, 'brass', 0, 0.062, 0), cyl(0.006, 0.008, '#C62828', 0, 0.092, 0, 16))
  g.add(slider)
  g.add(postUp('#7A7A7A', -0.15, 0.075, 0.015), postUp('#7A7A7A', 0.15, 0.075, 0.015), postUp('#C62828', 0.15, 0.075, -0.015))
  g.userData.setLevel = (f) => { slider.position.x = -0.12 + 0.24 * Math.min(1, Math.max(0, f)) }
  g.userData.setLevel(0.5)
  return g
})

reg('resistance_wire', 1.1, () => {
  const g = rule(1.01, 100)
  g.add(box(0.03, 0.03, 0.03, 'case', -0.52, 0, -0.03), box(0.03, 0.03, 0.03, 'case', 0.52, 0, -0.03))
  g.add(postUp('#151515', -0.52, 0.03, -0.03), postUp('#C62828', 0.52, 0.03, -0.03))
  g.add(rod(0.0005, 1.04, '#D7D9DC', 'x', 0, 0.022, -0.012, 6))
  g.add(link([-0.52, 0.03, -0.03], [-0.505, 0.022, -0.012], 0.0006, 'steel', 6), link([0.52, 0.03, -0.03], [0.505, 0.022, -0.012], 0.0006, 'steel', 6))
  const clip = (c) => grp(box(0.008, 0.008, 0.026, c, 0, 0.018, -0.006), box(0.006, 0.004, 0.012, 'steel', 0, 0.016, -0.018))
  const fixed = clip('black'); fixed.position.x = -0.5; g.add(fixed)
  const moving = clip('red'); g.add(moving)
  g.userData.setLevel = (f) => { moving.position.x = -0.5 + 0.1 + 0.8 * Math.min(1, Math.max(0, f)) }
  g.userData.setLevel(0)
  return g
})

reg('switch', 0.14, () => knifeSwitch())

reg('leads', 0.18, () => {
  const g = grp()
  const cols = ['red', 'black', 'red', 'black']
  cols.forEach((c, i) => {
    const t = torus(0.04 - i * 0.004, 0.0024, c, 2 * PI, (i - 1.5) * 0.008, 0.003 + i * 0.0045, 0, 32); t.rotation.x = PI / 2; t.scale.y = 0.7
    g.add(t, box(0.012, 0.005, 0.006, c === 'red' ? '#D84343' : '#2A2A2A', 0.045 + i * 0.002, 0.001 + i * 0.0045, -0.02 + i * 0.012))
  })
  g.add(box(0.016, 0.006, 0.008, 'steel', -0.055, 0, 0.03), box(0.016, 0.006, 0.008, 'steel', -0.058, 0, 0.012))
  return g
})

reg('filament_lamp', 0.12, () => {
  const bulb = grp(cyl(0.016, 0.02, 'case', 0, 0, 0, 24), cyl(0.006, 0.008, 'brass', 0, 0.02, 0, 16))
  const glassB = lathe([[0.006, 0], [0.012, 0.012], [0.013, 0.02], [0.01, 0.032], [0.0, 0.036]], 'glass', 24); glassB.position.y = 0.028
  const fil = cable([[-0.004, 0.035, 0], [-0.002, 0.044, 0], [0, 0.046, 0], [0.002, 0.044, 0], [0.004, 0.035, 0]], 0.0004, glow('#FFB74D'), 12)
  bulb.add(glassB, fil)
  return onBoard('LAMP 2.5 V', bulb, { w: 0.1, d: 0.07 })
})

reg('ldr', 0.12, () => {
  const tex = canvasTex(64, 64, (ctx, W) => {
    ctx.fillStyle = '#B5402A'; ctx.fillRect(0, 0, W, W); ctx.strokeStyle = '#EDE7DA'; ctx.lineWidth = 4; ctx.beginPath()
    for (let i = 0; i < 6; i++) { const y = 12 + i * 8; ctx.moveTo(i % 2 ? 50 : 14, y); ctx.lineTo(i % 2 ? 14 : 50, y + 8) }
    ctx.stroke()
  })
  const head = grp(cyl(0.009, 0.004, '#9C3524', 0, 0.022, 0, 24))
  const face = mesh(new THREE.CircleGeometry(0.0088, 24), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 }), 0, 0.0262, 0); face.rotation.x = -PI / 2
  head.add(face, legs(-0.003, 0.003, 0.022))
  return onBoard('LDR', head)
})
reg('thermistor', 0.12, () => onBoard('THERMISTOR', grp(ball(0.0045, '#3B2A20', 0, 0.026, 0, 14), legs(-0.002, 0.002, 0.024))))
reg('capacitor', 0.12, () => {
  const c = grp(cyl(0.009, 0.026, '#25408F', 0, 0.008, 0, 24), cyl(0.0085, 0.0008, 'metal', 0, 0.034, 0, 24), box(0.004, 0.026, 0.0012, '#C9CED4', 0, 0.008, 0.0088), legs(-0.003, 0.003, 0.008))
  return onBoard('CAPACITOR', c)
})
reg('diodes', 0.12, () => {
  const g = grp()
  for (let i = 0; i < 3; i++) { const z = -0.012 + i * 0.012; g.add(rod(0.0032, 0.012, '#151515', 'x', 0, 0.006, z, 14), rod(0.0034, 0.002, '#C9CED4', 'x', 0.004, 0.006, z, 14), rod(0.0005, 0.04, 'steel', 'x', 0, 0.006, z, 6)) }
  return onBoard('DIODES', g)
})
reg('leds', 0.13, () => {
  const g = grp()
  ;['#E53935', '#FFB300', '#43A047', '#1E88E5'].forEach((c, i) => {
    const x = -0.027 + i * 0.018, m = M(c, { emissive: c, emissiveIntensity: 0.35, transparent: true, opacity: 0.9, roughness: 0.2 })
    g.add(cyl(0.0034, 0.002, m, x, 0.012, 0, 16), cyl(0.0028, 0.005, m, x, 0.014, 0, 16), ball(0.0028, m, x, 0.019, 0, 14), link([x - 0.001, 0, 0], [x - 0.001, 0.012, 0], 0.0005, 'steel', 6), link([x + 0.001, 0, 0], [x + 0.001, 0.012, 0], 0.0005, 'steel', 6))
  })
  return onBoard('LEDs', g, { w: 0.11 })
})
reg('op_amp_board', 0.17, () => {
  const g = grp()
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.003, 0.008, 'brass', sx * 0.062, 0, sz * 0.042, 8))
  g.add(box(0.14, 0.003, 0.1, 'pcb', 0, 0.008, 0))
  g.add(box(0.022, 0.005, 0.01, 'black', 0, 0.011, 0))
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) g.add(box(0.0012, 0.004, 0.003, 'steel', -0.0075 + i * 0.005, 0.009, s * 0.0062))
  g.add(onTop(plate('741', 0.012, 0.005, { bg: '#111', fg: '#DDD' }), 0, 0.016, 0))
  g.add(resistorBody(-0.035, 0.016, 0.025), resistorBody(0.035, 0.016, 0.025, ['#C62828', '#C62828', '#E65100', '#D4AF37']), resistorBody(0.035, 0.016, -0.025, ['#8B4513', '#000000', '#E65100', '#D4AF37']))
  for (let i = 0; i < 4; i++) g.add(postUp(i === 0 ? '#C62828' : i === 3 ? '#151515' : '#7A7A7A', -0.05 + i * 0.033, 0.011, -0.04))
  return g
})
reg('photovoltaic_cell', 0.17, () => {
  const tex = canvasTex(256, 192, (ctx, W, H) => {
    ctx.fillStyle = '#C9CED4'; ctx.fillRect(0, 0, W, H)
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { ctx.fillStyle = '#1C3F7A'; ctx.fillRect(8 + i * 61, 8 + j * 61, 56, 56); ctx.strokeStyle = '#8FA6C8'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 5; k++) { ctx.moveTo(8 + i * 61, 8 + j * 61 + k * 11); ctx.lineTo(64 + i * 61, 8 + j * 61 + k * 11) } ctx.stroke() }
  })
  const panel = grp(box(0.14, 0.005, 0.1, '#9AA3AD'))
  const face = mesh(new THREE.PlaneGeometry(0.135, 0.095), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.25, metalness: 0.3 }), 0, 0.0058, 0); face.rotation.x = -PI / 2
  panel.add(face); panel.rotation.x = 0.55; panel.position.set(0, 0.03, 0)
  const g = grp(panel, box(0.1, 0.008, 0.07, 'case', 0, 0, -0.01), box(0.006, 0.04, 0.006, 'case', -0.04, 0, -0.035), box(0.006, 0.04, 0.006, 'case', 0.04, 0, -0.035))
  g.add(postUp('#C62828', 0.03, 0.008, 0.012), postUp('#151515', -0.03, 0.008, 0.012))
  return g
})
reg('thermocouple', 0.2, () => grp(
  cable([[-0.085, 0.003, 0.02], [-0.04, 0.003, 0.03], [0.0, 0.003, 0.0], [0.05, 0.004, -0.02]], 0.0016, 'red'),
  cable([[-0.085, 0.003, 0.02], [-0.04, 0.003, 0.012], [0.0, 0.003, -0.016], [0.05, 0.004, -0.03]], 0.0016, 'blue'),
  ball(0.0028, 'steel', -0.087, 0.003, 0.02, 10),
  box(0.03, 0.012, 0.022, 'yellow', 0.065, 0, -0.025), box(0.008, 0.002, 0.004, 'steel', 0.083, 0.005, -0.03), box(0.008, 0.002, 0.004, 'steel', 0.083, 0.005, -0.02),
))
reg('coaxial_cable', 0.22, () => {
  const a = spool('#3A3F47', '#111111', 0.042); a.position.x = -0.05
  const b = spool('#3A3F47', '#111111', 0.042); b.position.x = 0.05
  return grp(a, b, rod(0.0045, 0.014, 'chrome', 'x', -0.002, 0.004, 0.05, 12))
})

// Magnetism ─────────────────────────────────────────────────
reg('magnets', 0.1, () => grp(
  box(0.05, 0.004, 0.025, 'steel'), box(0.004, 0.034, 0.025, 'steel', -0.023, 0, 0), box(0.004, 0.034, 0.025, 'steel', 0.023, 0, 0),
  box(0.005, 0.022, 0.02, 'red', -0.0185, 0.008, 0), box(0.005, 0.022, 0.02, 'blue', 0.0185, 0.008, 0),
))
reg('bar_magnet', 0.13, () => {
  const g = grp(box(0.05, 0.012, 0.02, 'red', -0.025, 0, 0), box(0.05, 0.012, 0.02, 'blue', 0.025, 0, 0))
  g.add(onTop(plate('N', 0.012, 0.012, { bg: '#C62828', fg: '#FFF' }), -0.04, 0.012, 0), onTop(plate('S', 0.012, 0.012, { bg: '#1F5FAF', fg: '#FFF' }), 0.04, 0.012, 0))
  return g
})
reg('coil', 0.16, () => {
  const g = grp(rod(0.0175, 0.1, 'cream', 'x', 0, 0.027, 0, 28), rod(0.027, 0.004, 'case', 'x', -0.05, 0.027, 0, 32), rod(0.027, 0.004, 'case', 'x', 0.05, 0.027, 0, 32))
  const h = helix(0.0198, 0.094, 24, 0.0017, 'copper'); h.rotation.z = -PI / 2; h.position.set(-0.047, 0.027, 0)
  g.add(h, postUp('#C62828', -0.05, 0.054, 0), postUp('#151515', 0.05, 0.054, 0))
  return g
})
function uCore() {
  return grp(box(0.1, 0.02, 0.03, 'iron'), box(0.02, 0.06, 0.03, 'iron', -0.04, 0.02, 0), box(0.02, 0.06, 0.03, 'iron', 0.04, 0.02, 0),
    box(0.1005, 0.0008, 0.0305, '#5A5E64', 0, 0.01, 0))
}
reg('iron_core', 0.2, () => { const u = uCore(); u.position.x = -0.035; return grp(u, box(0.1, 0.02, 0.03, 'iron', 0.04, 0, 0.05)) })
reg('transformer_kit', 0.2, () => {
  const g = grp(uCore(), box(0.1, 0.02, 0.03, 'iron', 0, 0.08, 0))
  for (const [x, c] of [[-0.04, '#C62828'], [0.04, '#1F5FAF']]) {
    g.add(box(0.044, 0.004, 0.05, c, x, 0.024, 0), box(0.044, 0.004, 0.05, c, x, 0.072, 0), box(0.036, 0.044, 0.042, 'copper', x, 0.028, 0))
    g.add(postUp('#C62828', x - 0.012, 0.076, 0.016), postUp('#151515', x + 0.012, 0.076, 0.016))
  }
  return g
})
reg('metal_ring', 0.08, () => { const t = torus(0.03, 0.006, 'alu', 2 * PI, 0, 0.006, 0, 40); t.rotation.x = PI / 2; return grp(t) })
reg('aluminium_foil', 0.15, () => {
  const g = grp()
  for (let i = 0; i < 3; i++) { const s = box(0.12, 0.0004, 0.02, 'alu', 0, i * 0.0005, -0.025 + i * 0.025); s.rotation.y = (i - 1) * 0.08; g.add(s) }
  return g
})
reg('copper_plate', 0.17, () => grp(box(0.075, 0.002, 0.06, 'copper', -0.04, 0, 0), box(0.075, 0.002, 0.06, 'alu', 0.04, 0, 0)))
reg('electron_tube', 0.32, () => {
  const g = grp(box(0.26, 0.02, 0.12, 'case'))
  g.add(box(0.012, 0.07, 0.03, 'case', -0.07, 0.02, 0), box(0.012, 0.03, 0.03, 'case', 0.06, 0.02, 0))
  g.add(ball(0.065, 'glass', 0.03, 0.115, 0, 32), rod(0.018, 0.1, 'glass', 'x', -0.07, 0.115, 0, 20), rod(0.02, 0.03, 'case', 'x', -0.125, 0.115, 0, 20))
  g.add(box(0.09, 0.06, 0.001, M('#7FE0C8', { emissive: '#3FA890', emissiveIntensity: 0.3, transparent: true, opacity: 0.7 }), 0.03, 0.085, 0))
  g.add(box(0.07, 0.002, 0.03, 'metal', 0.025, 0.148, 0), box(0.07, 0.002, 0.03, 'metal', 0.025, 0.08, 0))
  g.add(front(plate('TEACHER DEMONSTRATION', 0.16, 0.012, { bg: '#202329', fg: '#E2B21F' }), 0, 0.01, 0.06))
  return g
})
reg('helmholtz_coils', 0.32, () => {
  const inner = grp(box(0.26, 0.015, 0.12, 'woodDk'))
  for (const x of [-0.05, 0.05]) {
    const c = torus(0.1, 0.012, 'copper', 2 * PI, x, 0.127, 0, 48); c.rotation.y = PI / 2
    inner.add(c, box(0.02, 0.02, 0.03, 'case', x, 0.012, 0), postUp('#C62828', x, 0.015, 0.045))
  }
  inner.rotation.y = -0.5
  return grp(inner)
})

// Mechanics ─────────────────────────────────────────────────
reg('stand_clamp', 0.3, () => {
  const g = grp(box(0.2, 0.018, 0.13, 'iron'), cyl(0.0065, 0.62, 'steel', -0.07, 0.018, -0.02, 16))
  g.add(box(0.03, 0.03, 0.03, 'metal', -0.07, 0.53, -0.02), rod(0.004, 0.025, 'metal', 'z', -0.07, 0.545, 0.008, 10), rod(0.007, 0.006, 'case', 'z', -0.07, 0.545, 0.022, 14))
  g.add(rod(0.005, 0.17, 'steel', 'x', 0.03, 0.545, -0.02, 12))
  g.add(box(0.03, 0.012, 0.02, 'metal', 0.1, 0.539, -0.02), box(0.026, 0.004, 0.022, '#B98A5A', 0.1, 0.535, -0.02))
  const hook = torus(0.005, 0.0014, 'steel', 2 * PI, 0.1, 0.53, -0.02, 16); g.add(hook)
  g.userData.hangPoint = new THREE.Vector3(0.1, 0.527, -0.02)
  return g
})
reg('g_clamp', 0.12, () => {
  const inner = grp()
  const frame = torus(0.03, 0.006, 'blue', 1.5 * PI, 0, 0, 0, 32); frame.rotation.z = 0.25 * PI
  const sx = 0.0212
  inner.add(frame, rod(0.003, 0.06, 'steel', 'y', sx, 0.012, 0, 10), rod(0.0025, 0.03, 'steel', 'x', sx, 0.042, 0, 10), cyl(0.006, 0.003, 'steel', sx, -0.019, 0, 14))
  inner.rotation.x = -PI / 2
  const g = grp(inner); rest(inner)
  return g
})
reg('spring', 0.08, () => {
  const g = grp(), Lc = 0.06, r = 0.012, hk = 0.014
  const bottom = torus(0.006, 0.0012, 'steel', 2 * PI, 0, 0.007, 0, 16)
  const coil = grp(helix(r, Lc, 18, 0.0012, 'steel')); coil.position.y = hk
  const top = grp(torus(0.006, 0.0012, 'steel', 2 * PI, 0, 0.0072, 0, 16), link([r, 0, 0], [0, 0.0012, 0], 0.0011, 'steel', 6))
  g.add(bottom, link([0, 0.0128, 0], [r, hk, 0], 0.0011, 'steel', 6), coil, top)
  let s = 1
  const place = () => { coil.scale.y = s; top.position.y = hk + Lc * s }
  place()
  g.userData.levelWith = ['slotted_masses']
  g.userData.setLevel = (f) => { s = 1 + 1.6 * Math.min(1, Math.max(0, f)); place() }
  g.userData.hangTop = () => hk + Lc * s + 0.0138
  g.userData.hangBottom = 0.001
  return g
})
reg('slotted_masses', 0.1, () => {
  const g = grp(cyl(0.022, 0.004, 'steel', 0, 0, 0, 28), cyl(0.0025, 0.13, 'steel', 0, 0.004, 0, 10))
  const hook = torus(0.006, 0.0016, 'steel', 1.3 * PI, 0.0, 0.136, 0, 16); hook.rotation.z = -0.15 * PI
  g.add(hook)
  const discs = []
  for (let i = 0; i < 8; i++) { const d = slottedDisc(0.024, 0.0058, 'brass'); d.position.y = 0.004 + i * 0.006; d.rotation.z = i * 0.35; g.add(d); discs.push(d) }
  const show = (n) => discs.forEach((d, i) => { d.visible = i < n })
  show(4)
  g.userData.setLevel = (f) => show(1 + Math.round(Math.min(1, Math.max(0, f)) * 7))
  g.userData.hangTop = () => 0.141
  return g
})
reg('pulley', 0.12, () => {
  const g = grp(box(0.05, 0.03, 0.06, 'iron'), box(0.012, 0.06, 0.012, 'iron', 0, 0.03, 0.022), rod(0.008, 0.02, 'case', 'x', 0.032, 0.015, 0, 14))
  const wheel = lathe([[0.006, -0.005], [0.025, -0.005], [0.025, -0.0035], [0.019, 0], [0.025, 0.0035], [0.025, 0.005], [0.006, 0.005]], 'alu', 36)
  wheel.rotation.x = PI / 2; wheel.position.set(0, 0.085, 0.034)
  g.add(wheel, rod(0.006, 0.012, 'steel', 'z', 0, 0.085, 0.034, 14), rod(0.0025, 0.03, 'steel', 'z', 0, 0.085, 0.03, 10))
  return g
})
reg('string', 0.1, () => {
  const g = grp()
  for (let i = 0; i < 3; i++) { const t = torus(0.03 - i * 0.003, 0.0012, '#E8DCC0', 2 * PI, i * 0.004, 0.0012 + i * 0.0024, i * 0.002, 32); t.rotation.x = PI / 2; g.add(t) }
  g.add(cable([[0.03, 0.002, 0], [0.04, 0.002, 0.02], [0.045, 0.002, 0.04]], 0.0012, '#E8DCC0', 10))
  return g
})
reg('rubber_band', 0.08, () => {
  const a = torus(0.022, 0.0018, '#B5651D', 2 * PI, 0, 0.0018, 0, 32); a.rotation.x = PI / 2; a.scale.y = 0.6
  const b = torus(0.02, 0.0018, '#A0521A', 2 * PI, 0.008, 0.005, 0.006, 32); b.rotation.x = PI / 2; b.scale.y = 0.6
  return grp(a, b)
})
reg('nylon_line', 0.08, () => spool('blue', M('#EAF4F8', { transparent: true, opacity: 0.85, roughness: 0.2 })))
reg('steel_wire', 0.08, () => spool('woodDk', 'steel'))
reg('ramp', 1.24, () => grp(box(1.2, 0.018, 0.12, 'wood'), box(1.2, 0.012, 0.008, 'woodDk', 0, 0.018, -0.056), box(1.2, 0.012, 0.008, 'woodDk', 0, 0.018, 0.056), box(0.02, 0.03, 0.104, 'woodDk', 0.59, 0.018, 0)))
reg('wooden_blocks', 0.24, () => grp(box(0.1, 0.03, 0.06, 'wood', -0.055, 0, 0), box(0.1, 0.03, 0.06, '#B98C5E', -0.055, 0.03, 0), box(0.1, 0.03, 0.06, '#D2AB7E', 0.06, 0, 0)))
reg('cylinder', 0.08, () => grp(rod(0.025, 0.07, 'steel', 'z', 0, 0.025, 0, 36)))
reg('trolley', 0.24, () => {
  const g = grp(box(0.2, 0.035, 0.1, 'red', 0, 0.012, 0), box(0.19, 0.004, 0.09, '#9E1F1F', 0, 0.047, 0))
  for (const x of [-0.07, 0.07]) for (const z of [-0.056, 0.056]) g.add(rod(0.016, 0.012, 'black', 'z', x, 0.016, z, 20), rod(0.005, 0.0125, 'steel', 'z', x, 0.016, z, 10))
  g.add(rod(0.004, 0.03, 'steel', 'x', 0.115, 0.03, 0, 10), cyl(0.007, 0.004, 'case', 0.13, 0.026, 0, 12)); g.children[g.children.length - 1].rotation.z = PI / 2
  return g
})
reg('ball_bearing', 0.1, () => {
  const g = grp(lathe([[0, 0], [0.04, 0], [0.041, 0.012], [0.042, 0.0125]], 'glass', 36))
  ;[[0, 0], [0.014, 0.006], [-0.012, 0.01], [0.006, -0.016], [-0.018, -0.008], [0.022, -0.01]].forEach(([x, z]) => g.add(ball(0.006, 'chrome', x, 0.006, z, 16)))
  return g
})
reg('tall_tube', 0.14, () => {
  const g = grp(box(0.12, 0.02, 0.12, 'woodDk'))
  const t = lathe([[0, 0], [0.022, 0], [0.022, 1.0], [0.0235, 1.004]], 'glass', 28); t.position.y = 0.02
  const liq = cyl(0.0205, 0.94, M('#E9D9A0', { transparent: true, opacity: 0.45, depthWrite: false, roughness: 0.15 }), 0, 0.021, 0, 24)
  g.add(t, liq)
  for (const y of [0.32, 0.82]) { const b = torus(0.0228, 0.0018, 'rubber', 2 * PI, 0, y, 0, 28); b.rotation.x = PI / 2; g.add(b) }
  return g
})
reg('pendulum_bob', 0.08, () => {
  const g = grp(ball(0.0125, 'brass', 0, 0.0125, 0, 24), torus(0.0035, 0.001, 'steel', 2 * PI, 0, 0.028, 0, 12))
  const coilS = torus(0.02, 0.0007, '#E8DCC0', 2 * PI, 0.035, 0.0008, 0, 28); coilS.rotation.x = PI / 2
  const line = column(0.0006, '#E8DCC0', 6); line.position.y = 0.031; line.visible = false
  g.add(coilS, line)
  g.userData.hang = (len = 0.38) => { coilS.visible = false; line.visible = true; line.scale.y = len }
  g.userData.hangTop = () => (line.visible ? 0.031 + line.scale.y : 0.031)
  return g
})
reg('knife_edge', 0.14, () => {
  const p = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 3), 'steel', 0, 0.02 + 0.0075, 0); p.rotation.x = -PI / 2
  return grp(box(0.12, 0.02, 0.06, 'woodDk'), p)
})
reg('wooden_strip', 0.62, () => {
  const tex = canvasTex(1024, 52, (ctx, W, H) => { ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#2A1C10'; for (let i = 0; i < 11; i++) { ctx.beginPath(); ctx.arc(W * (0.05 + i * 0.09), H / 2, H * 0.22, 0, 2 * PI); ctx.fill() } })
  const top = mesh(new THREE.PlaneGeometry(0.6, 0.03), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.8 }), 0, 0.0088, 0); top.rotation.x = -PI / 2
  return grp(box(0.6, 0.008, 0.03, 'wood'), top)
})
reg('launcher', 0.22, () => {
  const g = grp(box(0.16, 0.02, 0.08, 'case'), box(0.012, 0.04, 0.04, 'metal', -0.05, 0.02, 0))
  const arm = grp(rod(0.012, 0.12, 'red', 'x', 0.06, 0, 0, 20), ball(0.0095, 'chrome', 0.122, 0, 0, 16), rod(0.004, 0.03, 'steel', 'x', -0.01, 0, 0, 10))
  arm.position.set(-0.05, 0.055, 0); arm.rotation.z = 0.5
  const q = mesh(new THREE.CircleGeometry(0.035, 24, 0, PI / 2), M('#F4F4F2', { side: THREE.DoubleSide }), -0.05, 0.055, 0.0225)
  g.add(arm, q)
  return g
})
reg('plasticine', 0.1, () => {
  const g = grp()
  ;[['#3E7CB1', -0.025, 0], ['#D9534F', 0.012, -0.01], ['#5CB85C', 0.03, 0.02]].forEach(([c, x, z]) => { const b = ball(0.016, M(c, { roughness: 0.95 }), x, 0.0095, z, 16); b.scale.set(1, 0.6, 0.85); g.add(b) })
  return g
})
reg('steel_blade', 0.32, () => grp(box(0.3, 0.0008, 0.012, M('#3A6EA5', { metalness: 0.6, roughness: 0.35 })), cyl(0.002, 0.001, '#111', -0.14, 0.0002, 0, 10), cyl(0.002, 0.001, '#111', 0.14, 0.0002, 0, 10)))
reg('card', 0.22, () => grp(box(0.2, 0.0015, 0.15, '#F4F1E8'), box(0.2, 0.0015, 0.15, '#EDE8DA', 0.006, 0.0015, 0.008)))
reg('rubber_bung', 0.24, () => grp(
  rod(0.006, 0.1, M('#EEF3F6', { transparent: true, opacity: 0.55, depthWrite: false }), 'x', 0, 0.006, 0, 16),
  rod(0.0006, 0.2, '#EDE3C8', 'x', 0.0, 0.006, 0, 6),
  mesh(new THREE.CylinderGeometry(0.009, 0.012, 0.02, 20), '#7A2E2A', -0.105, 0.012, 0),
  cyl(0.008, 0.012, 'brass', 0.104, 0, 0, 16),
))
reg('sand_tray', 0.32, () => grp(box(0.3, 0.004, 0.22, 'alu'), box(0.3, 0.04, 0.004, 'alu', 0, 0, -0.108), box(0.3, 0.04, 0.004, 'alu', 0, 0, 0.108), box(0.004, 0.04, 0.22, 'alu', -0.148, 0, 0), box(0.004, 0.04, 0.22, 'alu', 0.148, 0, 0), box(0.292, 0.03, 0.212, M('#D8C08C', { roughness: 1 }), 0, 0.004, 0)))

// Heat and fluids ───────────────────────────────────────────
reg('beaker_250', 0.1, () => {
  const g = grp(lathe([[0, 0], [0.035, 0], [0.036, 0.002], [0.036, 0.098], [0.0385, 0.102]], 'glass', 36))
  const band = gradBand(0.0362, 0.075, 4, { label: '50' }); band.position.y = 0.0435; g.add(band)
  const liq = column(0.0348, 'water', 32); liq.position.y = 0.002; liq.visible = false; g.add(liq)
  g.userData.levelWith = ['water_jug', 'measuring_cylinder', 'kettle']
  g.userData.setLevel = (f) => { liq.visible = true; liq.scale.y = 0.09 * (0.15 + 0.8 * Math.min(1, Math.max(0, f))) }
  return g
})
reg('water_jug', 0.18, () => {
  const g = grp(lathe([[0, 0], [0.05, 0], [0.052, 0.004], [0.055, 0.12], [0.058, 0.15]], 'plastic', 32))
  const h = torus(0.04, 0.007, M('#D7E7F2', { roughness: 0.3 }), PI, 0.052, 0.08, 0, 20); h.rotation.z = -PI / 2
  const spout = box(0.02, 0.004, 0.03, 'plastic', -0.06, 0.146, 0)
  const liq = column(0.0505, 'water', 28); liq.position.y = 0.003
  g.add(h, spout, liq)
  g.userData.setLevel = (f) => { liq.scale.y = 0.13 * (0.85 - 0.6 * Math.min(1, Math.max(0, f))) }
  g.userData.setLevel(0)
  return g
})
reg('polystyrene_cup', 0.1, () => {
  const cup = lathe([[0, 0], [0.026, 0], [0.028, 0.002], [0.04, 0.095], [0.042, 0.098], [0.039, 0.098], [0.0375, 0.094]], M('#FAFAF7', { roughness: 0.95, side: THREE.DoubleSide }), 36)
  const liq = mesh(new THREE.CylinderGeometry(0.0355, 0.027, 0.06, 32), 'water', 0, 0.033, 0)
  return grp(cup, liq)
})
reg('kettle', 0.27, () => {
  const g = grp(cyl(0.085, 0.012, 'case', 0, 0, 0, 36))
  const body = lathe([[0, 0], [0.07, 0], [0.075, 0.01], [0.075, 0.16], [0.06, 0.2], [0.03, 0.205], [0, 0.205]], 'white', 36); body.position.y = 0.012
  const h = torus(0.06, 0.01, 'case', PI, -0.075, 0.11, 0, 20); h.rotation.z = PI / 2
  const spout = mesh(new THREE.CylinderGeometry(0.012, 0.022, 0.06, 16), 'white', 0.085, 0.18, 0); spout.rotation.z = -0.9
  g.add(body, h, spout, cyl(0.012, 0.012, 'case', 0, 0.215, 0, 16), box(0.012, 0.09, 0.004, M('#9CC8EA', { transparent: true, opacity: 0.8 }), 0.0, 0.05, 0.0745))
  g.add(cable([[-0.06, 0.004, -0.06], [-0.1, 0.004, -0.04], [-0.1, 0.004, 0.02]], 0.003, 'case', 12))
  return g
})
reg('immersion_heater', 0.08, () => grp(
  cyl(0.0065, 0.13, 'chrome', 0, 0, 0, 20), cyl(0.011, 0.04, 'case', 0, 0.13, 0, 20), cyl(0.008, 0.006, 'case', 0, 0.17, 0, 16),
  cable([[-0.003, 0.176, 0], [-0.01, 0.2, 0], [-0.03, 0.08, 0.01], [-0.04, 0.004, 0.03]], 0.0022, 'red', 20),
  cable([[0.003, 0.176, 0], [0.01, 0.2, 0], [0.03, 0.08, 0.01], [0.04, 0.004, 0.03]], 0.0022, 'black', 20),
))
reg('water_bath', 0.34, () => {
  const g = grp(box(0.3, 0.006, 0.22, 'steel'), box(0.3, 0.15, 0.006, 'steel', 0, 0, -0.107), box(0.3, 0.15, 0.006, 'steel', 0, 0, 0.107), box(0.006, 0.15, 0.22, 'steel', -0.147, 0, 0), box(0.006, 0.15, 0.22, 'steel', 0.147, 0, 0))
  g.add(box(0.288, 0.12, 0.208, 'water', 0, 0.006, 0))
  const p = box(0.3, 0.06, 0.04, 'case', 0, 0, 0.13); g.add(p)
  screenOn(g, 0.08, 0.026, -0.06, 0.032, 0.15, '25.0 °C')
  g.add(knobFront(0.011, 0.06, 0.03, 0.15), ball(0.003, glow('#43A047'), 0.1, 0.03, 0.151, 10))
  return g
})
reg('ice', 0.1, () => {
  const g = grp(lathe([[0, 0], [0.035, 0], [0.036, 0.002], [0.036, 0.098], [0.0385, 0.102]], 'glass', 36))
  const m = M('#F2F8FC', { transparent: true, opacity: 0.85, roughness: 0.1 })
  for (let i = 0; i < 16; i++) {
    const a = i * 2.4, r = 0.008 + (i % 3) * 0.008
    const c = box(0.012, 0.012, 0.012, m, Math.cos(a) * r, 0.002 + Math.floor(i / 6) * 0.011, Math.sin(a) * r)
    c.rotation.set(i * 0.7, i * 1.3, i * 0.4); g.add(c)
  }
  return g
})
reg('bottle_outlet', 0.16, () => {
  const g = grp(lathe([[0, 0], [0.045, 0], [0.046, 0.004], [0.046, 0.2], [0.03, 0.235], [0.013, 0.25], [0.013, 0.27]], 'plastic', 32))
  g.add(rod(0.004, 0.05, 'plastic', 'x', 0.068, 0.02, 0, 12), rod(0.005, 0.012, 'red', 'x', 0.095, 0.02, 0, 12))
  const liq = column(0.0445, 'water', 28); liq.position.y = 0.003; g.add(liq)
  g.userData.setLevel = (f) => { liq.scale.y = 0.19 * (0.9 - 0.75 * Math.min(1, Math.max(0, f))) }
  g.userData.setLevel(0)
  return g
})
reg('boyle_apparatus', 0.24, () => {
  const g = grp(box(0.2, 0.02, 0.12, 'case'), box(0.14, 0.48, 0.012, 'wood', -0.02, 0.02, -0.035))
  const sc = scalePlane(0.36, 0.03, 36, { bg: '#F4F1E8', margin: 0.002 }); sc.rotation.set(0, 0, PI / 2); sc.position.set(-0.05, 0.24, -0.0284); g.add(sc)
  g.add(lathe([[0.009, 0], [0.009, 0.36], [0.006, 0.366], [0, 0.368]], 'glass', 24)); g.children[g.children.length - 1].position.set(-0.02, 0.06, -0.012)
  const oil = column(0.0078, 'oil', 20); oil.position.set(-0.02, 0.06, -0.012); g.add(oil)
  g.add(cyl(0.025, 0.06, 'metal', 0.06, 0.02, 0.0, 28), link([-0.02, 0.062, -0.012], [0.035, 0.04, 0], 0.003, 'steel'), cyl(0.004, 0.035, 'brass', 0.06, 0.08, 0, 10), rod(0.004, 0.02, 'black', 'x', 0.093, 0.05, 0, 10))
  const d = dialGauge(0.035); d.position.set(0.06, 0.15, 0.0); g.add(d)
  g.userData.setLevel = (f) => { const k = Math.min(1, Math.max(0, f)); oil.scale.y = 0.36 * (0.15 + 0.6 * k); d.userData.setNeedle(0.15 + 0.8 * k) }
  g.userData.setLevel(0)
  return g
})
reg('metal_block', 0.1, () => {
  const g = grp(cyl(0.038, 0.075, 'alu', 0, 0, 0, 36))
  for (const [x, r] of [[-0.013, 0.0065], [0.016, 0.004]]) { const h = mesh(new THREE.CircleGeometry(r, 20), '#111', x, 0.0758, 0); h.rotation.x = -PI / 2; g.add(h) }
  return g
})

// Optics ────────────────────────────────────────────────────
reg('lens', 0.1, () => {
  const g = grp(cyl(0.03, 0.01, 'case', 0, 0, 0, 28), cyl(0.004, 0.08, 'steel', 0, 0.01, 0, 12), torus(0.03, 0.004, 'case', 2 * PI, 0, 0.122, 0, 36))
  const l = lathe([[0, -0.005], [0.01, -0.0045], [0.02, -0.0028], [0.028, 0], [0.02, 0.0028], [0.01, 0.0045], [0, 0.005]], M('#DDEBF5', { transparent: true, opacity: 0.4, roughness: 0.03, depthWrite: false }), 32)
  l.rotation.x = PI / 2; l.position.y = 0.122
  g.add(l, box(0.012, 0.012, 0.008, 'case', 0, 0.086, 0))
  return g
})
reg('screen', 0.2, () => grp(box(0.18, 0.012, 0.05, 'case'), box(0.008, 0.13, 0.012, 'case', -0.084, 0.012, 0), box(0.008, 0.13, 0.012, 'case', 0.084, 0.012, 0), box(0.16, 0.12, 0.003, M('#FBFBF8', { roughness: 0.95 }), 0, 0.016, 0)))
reg('ray_box', 0.18, () => {
  const g = grp(box(0.14, 0.08, 0.1, 'case', 0, 0.006, 0))
  for (const x of [-0.06, 0.06]) g.add(box(0.012, 0.006, 0.09, 'rubber', x, 0, 0))
  const obj = plate('', 0.05, 0.05, { bg: '#FFF2B0' })
  const ctx = obj.material.map.image.getContext('2d'), W = obj.material.map.image.width
  ctx.strokeStyle = '#3A2A00'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(W / 2, W * 0.8); ctx.lineTo(W / 2, W * 0.2); ctx.lineTo(W * 0.35, W * 0.38); ctx.moveTo(W / 2, W * 0.2); ctx.lineTo(W * 0.65, W * 0.38); ctx.stroke(); obj.material.map.needsUpdate = true
  g.add(box(0.06, 0.06, 0.003, '#0B0D10', 0, 0.016, 0.05), front(obj, 0, 0.046, 0.0532))
  for (let i = 0; i < 4; i++) g.add(box(0.08, 0.002, 0.006, '#0B0D10', 0, 0.086, -0.03 + i * 0.016))
  g.add(cable([[0, 0.03, -0.05], [0.02, 0.006, -0.08], [0.06, 0.004, -0.09]], 0.0025, 'black', 12))
  return g
})
reg('lamp_point', 0.08, () => grp(cyl(0.03, 0.012, 'case', 0, 0, 0, 28), cyl(0.004, 0.1, 'steel', 0, 0.012, 0, 12), cyl(0.008, 0.012, 'case', 0, 0.112, 0, 16), ball(0.008, M('#FFE9A8', { emissive: '#FFD27A', emissiveIntensity: 1.1 }), 0, 0.13, 0, 16)))
reg('filter_sheets', 0.16, () => {
  const g = grp()
  for (let i = 0; i < 4; i++) { const s = box(0.12, 0.001, 0.09, M('#8F969E', { transparent: true, opacity: 0.45, depthWrite: false }), i * 0.006, i * 0.0012, i * 0.004); s.rotation.y = i * 0.05; g.add(s) }
  return g
})

// Safety ────────────────────────────────────────────────────
reg('goggles', 0.18, () => {
  const visor = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 28, 1, true, -1.1, 2.2), M('#CFE6F2', { transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide, roughness: 0.1 }), 0, 0.027, 0)
  const rim = (y) => mesh(new THREE.CylinderGeometry(0.0705, 0.0705, 0.005, 28, 1, true, -1.12, 2.24), M('#2F6E4F', { side: THREE.DoubleSide }), 0, y, 0)
  const strap = mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.014, 28, 1, true, 1.1, 2 * PI - 2.2), M('#3A3A3A', { side: THREE.DoubleSide, roughness: 0.9 }), 0, 0.027, 0)
  return grp(visor, rim(0.0025), rim(0.0515), strap)
})
reg('heat_mat', 0.28, () => grp(box(0.25, 0.008, 0.25, M('#D9D4C7', { roughness: 1 })), onTop(plate('HEAT RESISTANT', 0.12, 0.018, { bg: '#D9D4C7', fg: '#8A8476' }), 0, 0.008, 0.08)))
reg('tongs', 0.24, () => {
  const a = box(0.2, 0.003, 0.008, 'steel', 0, 0, 0.012); a.rotation.y = 0.07
  const b = box(0.2, 0.003, 0.008, 'steel', 0, 0.003, -0.012); b.rotation.y = -0.07
  return grp(a, b, cyl(0.004, 0.008, 'steel', -0.098, 0, 0, 12))
})

// ── Fallback and exports ───────────────────────────────────
function stockBox(name) {
  const g = grp(box(0.14, 0.09, 0.11, 'card'), box(0.142, 0.001, 0.03, '#B08A55', 0, 0.09, 0))
  g.add(front(plate(wrapText(name, 14), 0.12, 0.06, { bg: '#F4F1E8', fg: '#333' }), 0, 0.045, 0.055))
  return g
}

export const MODELS = {}
export const FALLBACK_IDS = []
for (const id of Object.keys(APPARATUS)) {
  if (BUILD[id]) MODELS[id] = () => { const o = BUILD[id](); o.userData.apparatusId = id; return o }
  else { FALLBACK_IDS.push(id); MODELS[id] = () => { const o = stockBox(APPARATUS[id].name); o.userData.apparatusId = id; return o } }
}

/** A model for any id; unknown ids get a labelled stock box. */
export function buildModel(id) {
  if (MODELS[id]) return MODELS[id]()
  const o = stockBox(APPARATUS[id]?.name || String(id)); o.userData.apparatusId = id
  return o
}

/** Approximate width in metres, for laying out a bench. */
export function footprint(id) { return FOOT[id] ?? 0.16 }
