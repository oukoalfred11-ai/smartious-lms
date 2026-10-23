/**
 * equipment.js — procedural laboratory equipment (original geometry built
 * in code; no external model files or URLs, so nothing can disappear and
 * there is no third-party licence to track). Units are metres; the bench
 * top is at y = BENCH_Y.
 */
import * as THREE from 'three'

export const BENCH_Y = 0.9

const mat = {
  bench:  () => new THREE.MeshStandardMaterial({ color: '#2B2F36', roughness: 0.75 }),
  // Dark epoxy-resin worktop, as in school labs: clear glass, white tiles,
  // labels and colour changes all stand out against it.
  top:    () => new THREE.MeshStandardMaterial({ color: '#3A4048', roughness: 0.42, metalness: 0.05 }),
  metal:  () => new THREE.MeshStandardMaterial({ color: '#9AA3AD', metalness: 0.7, roughness: 0.35 }),
  dark:   () => new THREE.MeshStandardMaterial({ color: '#1F2227', roughness: 0.6 }),
  glass:  () => new THREE.MeshStandardMaterial({ color: '#DDEBF5', transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0, depthWrite: false, side: THREE.DoubleSide }),
  liquid: (c = '#DCEBF7', o = 0.55) => new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: o, roughness: 0.2, depthWrite: false }),
  crimson:() => new THREE.MeshStandardMaterial({ color: '#8B1A2E', roughness: 0.45 }),
  white:  () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.6 }),
  red:    () => new THREE.MeshStandardMaterial({ color: '#C62828', roughness: 0.4 }),
  black:  () => new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.4 }),
  potato: () => new THREE.MeshStandardMaterial({ color: '#E9D9A6', roughness: 0.85 }),
}
export { mat }

/** Lab bench with a raised back shelf. */
export function bench({ width = 2.2, depth = 0.9 } = {}) {
  const g = new THREE.Group()
  const top = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, depth), mat.top()); top.position.y = BENCH_Y - 0.02
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, BENCH_Y - 0.04, depth - 0.04), mat.bench()); body.position.y = (BENCH_Y - 0.04) / 2
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshStandardMaterial({ color: '#D8DDE3', roughness: 0.95 })); floor.rotation.x = -Math.PI / 2
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3), new THREE.MeshStandardMaterial({ color: '#E7EBEF', roughness: 1 })); wall.position.set(0, 1.5, -depth / 2 - 0.25)
  g.add(top, body, floor, wall)
  return g
}

/** Glass vessel from a 2-D profile (radius, height) pairs, plus an optional liquid of fixed shape. */
function lathe(profile, material) {
  return new THREE.Mesh(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 40), material)
}

/** Conical flask (250 cm³). Liquid is a cone frustum whose height follows the volume. */
export function conicalFlask() {
  const g = new THREE.Group()
  const prof = [[0.0, 0], [0.065, 0], [0.068, 0.006], [0.02, 0.12], [0.02, 0.17], [0.023, 0.175]]
  const glass = lathe(prof, mat.glass()); g.add(glass)
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.066, 1, 40, 1), mat.liquid('#E8F0F7', 0.6))
  liquid.visible = false; g.add(liquid)
  g.userData.setLiquid = (volumeCm3, rgba) => {
    if (!volumeCm3) { liquid.visible = false; return }
    // Height of a cone frustum holding V (approx.; flask walls taper)
    const h = Math.min(0.11, 0.0006 * volumeCm3 + 0.004)
    const rTop = 0.066 - (0.046 * h) / 0.12
    liquid.geometry.dispose()
    liquid.geometry = new THREE.CylinderGeometry(rTop, 0.064, h, 40, 1)
    liquid.position.y = h / 2 + 0.002
    liquid.visible = true
    if (rgba) { liquid.material.color.setRGB(rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, THREE.SRGBColorSpace); liquid.material.opacity = Math.max(0.22, rgba[3] || 0.25) }
  }
  return g
}

/** 50 cm³ burette with tap. setLevel(reading) — 0 at the top mark, 50 at the bottom mark. */
export function burette() {
  const g = new THREE.Group()
  const L = 0.62, R = 0.0075
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(R, R, L, 24, 1, true), mat.glass()); tube.position.y = L / 2 + 0.07
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.35, R, 0.05, 16, 1, true), mat.glass()); tip.position.y = 0.025
  const tap = new THREE.Group()
  const tapBody = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 12), mat.white()); tapBody.rotation.z = Math.PI / 2
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.006, 0.008), mat.crimson()); handle.position.x = 0.025
  tap.add(tapBody, handle); tap.position.y = 0.06
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.86, R * 0.86, 1, 20), mat.liquid('#E8F0F7', 0.5))
  // scale marks every 5 cm³
  const marks = new THREE.Group()
  for (let i = 0; i <= 50; i += 1) {
    const w = i % 5 === 0 ? 0.008 : 0.004
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.0008, 0.0008), mat.black())
    m.position.set(R + w / 2 - 0.001, 0.07 + 0.04 + (L - 0.08) * (1 - i / 50), 0)
    marks.add(m)
  }
  g.add(tube, tip, tap, liquid, marks)
  g.userData.tap = tap
  g.userData.setLevel = (reading, filled) => {
    if (!filled || reading == null) { liquid.visible = false; return }
    const top = 0.07 + 0.04 + (L - 0.08) * (1 - reading / 50)
    const bottom = 0.07
    liquid.visible = true
    liquid.scale.y = Math.max(0.001, top - bottom)
    liquid.position.y = (top + bottom) / 2
  }
  return g
}

/** Retort stand with boss and clamp. */
export function retortStand(height = 0.85) {
  const g = new THREE.Group()
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.015, 0.14), mat.dark()); base.position.y = 0.0075
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, height, 12), mat.metal()); rod.position.set(-0.07, height / 2, 0)
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.012), mat.metal()); arm.position.set(-0.025, height - 0.18, 0)
  g.add(base, rod, arm)
  return g
}

export function whiteTile() { const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.008, 0.16), mat.white()); m.position.y = 0.004; return m }

/** Reagent bottle with a coloured cap and a text label. */
export function bottle(label, capColour = '#8B1A2E') {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.09, 24), new THREE.MeshStandardMaterial({ color: '#7A4A1E', transparent: true, opacity: 0.85, roughness: 0.2 })); body.position.y = 0.045
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.025, 16), new THREE.MeshStandardMaterial({ color: capColour })); cap.position.y = 0.1
  const tag = labelPlane(label, { w: 0.055, h: 0.03, size: 34 }); tag.position.set(0, 0.045, 0.0305)
  g.add(body, cap, tag)
  return g
}

/** Beaker (100 cm³). */
export function beaker(liquidColour = '#E8F0F7', fill = 0.6) {
  const g = new THREE.Group()
  g.add(lathe([[0, 0], [0.032, 0], [0.033, 0.003], [0.033, 0.09], [0.036, 0.094]], mat.glass()))
  const l = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.085 * fill, 24), mat.liquid(liquidColour, 0.5)); l.position.y = 0.0425 * fill + 0.002
  g.add(l)
  return g
}

// ── Text on a canvas texture (labels, meter screens) ─────────
export function labelPlane(text, { w = 0.1, h = 0.04, size = 40, bg = '#FFFFFF', fg = '#1A1A1A', font = 'bold' } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = 256; canvas.height = Math.round(256 * h / w)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true }))
  mesh.userData.setText = (t, colours = {}) => {
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = colours.bg || bg; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = colours.fg || fg
    // Shrink the type until the longest line fits the card, so labels never run off the edge.
    const lines = String(t).split('\n')
    let px = size
    ctx.font = `${font} ${px}px "Courier New", monospace`
    const widest = () => Math.max(0, ...lines.map(l => ctx.measureText(l).width))
    while (px > 10 && (widest() > canvas.width * 0.94 || px * 1.1 * lines.length > canvas.height * 0.98)) { px -= 1; ctx.font = `${font} ${px}px "Courier New", monospace` }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    lines.forEach((line, i, arr) => ctx.fillText(line, canvas.width / 2, canvas.height / 2 + (i - (arr.length - 1) / 2) * px * 1.1))
    tex.needsUpdate = true
  }
  mesh.userData.setText(text)
  return mesh
}

// ── Electrical equipment ─────────────────────────────────────
/** A terminal post; pick target for wiring. */
export function terminal(colour = '#C62828') {
  const g = new THREE.Group()
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.022, 16), new THREE.MeshStandardMaterial({ color: colour, roughness: 0.35 }))
  post.position.y = 0.011
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.013, 0.0025, 8, 20), new THREE.MeshBasicMaterial({ color: '#F0B429', transparent: true, opacity: 0 }))
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.023
  g.add(post, ring)
  g.userData.setHighlight = (on) => { ring.material.opacity = on ? 1 : 0 }
  return g
}

/** Box instrument (supply, meter) with a screen. */
export function instrumentBox({ w = 0.16, h = 0.09, d = 0.11, colour = '#2B2F36', screen = true, title = '' } = {}) {
  const g = new THREE.Group()
  const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: colour, roughness: 0.5 })); box.position.y = h / 2
  g.add(box)
  if (screen) {
    const s = labelPlane('---', { w: w * 0.7, h: h * 0.38, size: 64, bg: '#C9E3C3', fg: '#10290F' })
    s.position.set(0, h * 0.62, d / 2 + 0.0008)
    g.add(s); g.userData.screen = s
  }
  if (title) { const t = labelPlane(title, { w: w * 0.8, h: h * 0.18, size: 30, bg: colour, fg: '#FFFFFF' }); t.position.set(0, h * 0.2, d / 2 + 0.0008); g.add(t) }
  return g
}

/** Resistor on a small board. */
export function resistorBoard(label = 'R') {
  const g = new THREE.Group()
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.07), new THREE.MeshStandardMaterial({ color: '#E9E2D0', roughness: 0.8 })); board.position.y = 0.006
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 16), new THREE.MeshStandardMaterial({ color: '#C8B48A' })); body.rotation.z = Math.PI / 2; body.position.y = 0.025
  const bands = ['#8B4513', '#000000', '#C62828', '#D4AF37'].map((c, i) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.0085, 0.0085, 0.004, 16), new THREE.MeshStandardMaterial({ color: c })); b.rotation.z = Math.PI / 2; b.position.set(-0.015 + i * 0.01, 0.025, 0); return b })
  const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.001, 0.1, 6), mat.metal()); lead.rotation.z = Math.PI / 2; lead.position.y = 0.025
  const tag = labelPlane(label, { w: 0.05, h: 0.02, size: 40 }); tag.rotation.x = -Math.PI / 2; tag.position.set(0, 0.0125, 0.025)
  g.add(board, body, lead, tag, ...bands)
  return g
}

/** Knife switch on a board; setClosed(bool) rotates the blade. */
export function knifeSwitch() {
  const g = new THREE.Group()
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.012, 0.06), new THREE.MeshStandardMaterial({ color: '#E9E2D0', roughness: 0.8 })); board.position.y = 0.006
  const pivot = new THREE.Group(); pivot.position.set(-0.035, 0.03, 0)
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.004, 0.012), mat.metal()); blade.position.x = 0.035
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 12), mat.black()); knob.position.x = 0.07
  pivot.add(blade, knob)
  g.add(board, pivot)
  g.userData.setClosed = (c) => { pivot.rotation.z = c ? 0 : 0.6 }
  g.userData.setClosed(false)
  return g
}

/** Flexible lead between two points (sagging curve). */
export function leadBetween(a, b, colour = '#C62828') {
  const mid = a.clone().add(b).multiplyScalar(0.5); mid.y += 0.05 + a.distanceTo(b) * 0.15
  const curve = new THREE.CatmullRomCurve3([a, a.clone().add(new THREE.Vector3(0, 0.03, 0)), mid, b.clone().add(new THREE.Vector3(0, 0.03, 0)), b])
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.0028, 8, false), new THREE.MeshStandardMaterial({ color: colour, roughness: 0.5 }))
}

// ── Biology ──────────────────────────────────────────────────
export function boilingTube(liquidColour = '#EAF2F8') {
  const g = new THREE.Group()
  g.add(lathe([[0, 0.006], [0.006, 0.0005], [0.0125, 0.008], [0.0125, 0.15], [0.0135, 0.153]], mat.glass()))
  const l = new THREE.Mesh(new THREE.CylinderGeometry(0.0115, 0.0115, 0.09, 20), mat.liquid(liquidColour, 0.45)); l.position.y = 0.055
  g.add(l)
  return g
}

export function rack(n = 6, spacing = 0.05) {
  const g = new THREE.Group()
  const w = n * spacing + 0.04
  const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.01, 0.05), mat.white()); top.position.y = 0.08
  const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.01, 0.06), mat.white()); base.position.y = 0.005
  const sides = [-1, 1].map(s => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.08, 0.05), mat.white()); m.position.set(s * (w / 2 - 0.005), 0.045, 0); return m })
  g.add(top, base, ...sides)
  return g
}

/** Potato cylinder; setSwell(%) changes its size (visual cue only). */
export function potatoCylinder() {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.04, 16), mat.potato())
  m.userData.setSwell = (pc) => { const k = Math.cbrt(1 + (pc || 0) / 100); m.scale.set(k, k, k) }
  return m
}

/** Top-pan balance with a display. */
export function balance() {
  const g = instrumentBox({ w: 0.18, h: 0.05, d: 0.2, colour: '#E6E9ED', screen: false })
  const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.006, 32), mat.metal()); pan.position.set(0, 0.056, -0.02)
  const screen = labelPlane('0.00 g', { w: 0.1, h: 0.03, size: 56, bg: '#1B2B1A', fg: '#9BF59B' }); screen.position.set(0, 0.025, 0.1008)
  g.add(pan, screen)
  g.userData.screen = screen
  g.userData.panY = 0.06
  return g
}
