/**
 * labRoom.js — a school laboratory around the bench, so the apparatus is
 * not floating in a grey void: a service ledge with gas taps and sockets, a
 * tiled splashback, a window with daylight, wall shelves of reagent bottles,
 * a sink with a swan-neck tap, a fume cupboard, safety signs, a periodic
 * table, a wall clock, a lab stool, a tiled floor and ceiling lights.
 *
 *   const room = addLabRoom(lab, { width, depth })
 *   room.setClock(minutesSinceMidnight)   show lab time (otherwise real time)
 *
 * Purely decorative: nothing here is pickable or affects a result. Subtle
 * motion (a drip from the tap, steam in the fume cupboard, the clock's
 * second hand) is throttled, skipped in low graphics and under
 * prefers-reduced-motion, and stops by itself when the viewport is
 * disposed. Every geometry, material and texture is freed with the scene.
 */
import * as THREE from 'three'
import { BENCH_Y } from './equipment.js'
import { plate } from './apparatus3d.js'

const PI = Math.PI
const std = (o) => new THREE.MeshStandardMaterial(o)
/** Box centred at (x, y, z). */
function box(w, h, d, m, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); return o }
function cyl(rt, rb, h, m, x = 0, y = 0, z = 0, seg = 16) { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); return o }
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
const picture = (tex, w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }))
const SANS = '"Helvetica Neue", Arial, sans-serif'

// ── Painted textures ──────────────────────────────────────────
const tiles = (px, colour, grout) => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = colour; g.fillRect(0, 0, w, h)
  g.strokeStyle = grout; g.lineWidth = 3
  for (let v = 0; v <= w; v += px) { g.beginPath(); g.moveTo(v, 0); g.lineTo(v, h); g.stroke(); g.beginPath(); g.moveTo(0, v); g.lineTo(w, v); g.stroke() }
})
const windowView = () => canvasTex(256, 256, (g, w, h) => {
  const sky = g.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#9CC8EE'); sky.addColorStop(0.62, '#DCEEFA'); sky.addColorStop(1, '#EAF4E4')
  g.fillStyle = sky; g.fillRect(0, 0, w, h)
  g.fillStyle = '#FFFFFF'; g.globalAlpha = 0.75
  for (const [x, y, r] of [[60, 50, 16], [80, 46, 20], [102, 52, 14], [190, 80, 12], [206, 76, 16]]) { g.beginPath(); g.arc(x, y, r, 0, 2 * PI); g.fill() }
  g.globalAlpha = 1
  g.fillStyle = '#8DB27A'; g.beginPath(); g.moveTo(0, 190); g.quadraticCurveTo(80, 160, 150, 182); g.quadraticCurveTo(210, 168, 256, 178); g.lineTo(256, 256); g.lineTo(0, 256); g.fill()
  g.fillStyle = '#5E8A4E'
  for (const [x, r] of [[30, 26], [70, 18], [175, 30], [228, 20]]) { g.fillRect(x - 3, 170, 6, 40); g.beginPath(); g.arc(x, 165, r, 0, 2 * PI); g.fill() }
  g.fillStyle = '#C9B79C'; g.fillRect(110, 175, 46, 40); g.fillStyle = '#9E5B45'; g.beginPath(); g.moveTo(104, 177); g.lineTo(133, 154); g.lineTo(162, 177); g.fill()
})
function signEye() {
  return canvasTex(200, 256, (g, w, h) => {
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h)
    g.fillStyle = '#1F5FAF'; g.beginPath(); g.arc(w / 2, 92, 74, 0, 2 * PI); g.fill()
    // goggles pictogram
    g.fillStyle = '#FFFFFF'
    g.beginPath(); g.ellipse(w / 2 - 28, 92, 24, 18, 0, 0, 2 * PI); g.fill()
    g.beginPath(); g.ellipse(w / 2 + 28, 92, 24, 18, 0, 0, 2 * PI); g.fill()
    g.fillRect(w / 2 - 70, 86, 140, 8)
    g.fillStyle = '#1F5FAF'; g.beginPath(); g.ellipse(w / 2 - 28, 92, 14, 9, 0, 0, 2 * PI); g.fill(); g.beginPath(); g.ellipse(w / 2 + 28, 92, 14, 9, 0, 0, 2 * PI); g.fill()
    g.fillStyle = '#1F5FAF'; g.fillRect(0, 182, w, 74)
    g.fillStyle = '#FFFFFF'; g.font = `bold 21px ${SANS}`; g.textAlign = 'center'
    g.fillText('Eye protection', w / 2, 212); g.fillText('must be worn', w / 2, 238)
  })
}
function signHazard(line1, line2) {
  return canvasTex(200, 230, (g, w, h) => {
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h)
    g.fillStyle = '#F2C200'; g.strokeStyle = '#111'; g.lineWidth = 9
    g.beginPath(); g.moveTo(w / 2, 14); g.lineTo(w - 22, 150); g.lineTo(22, 150); g.closePath(); g.fill(); g.stroke()
    g.fillStyle = '#111'; g.font = `bold 70px ${SANS}`; g.textAlign = 'center'; g.fillText('!', w / 2, 132)
    g.font = `bold 22px ${SANS}`; g.fillText(line1, w / 2, 186); g.fillText(line2, w / 2, 212)
  })
}
function signText(lines, bg = '#2E7D32') {
  return canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h)
    g.fillStyle = '#FFFFFF'; g.font = `bold 26px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'
    lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * 32))
  })
}
function periodicTable() {
  return canvasTex(512, 300, (g, w, h) => {
    g.fillStyle = '#FBFBF7'; g.fillRect(0, 0, w, h)
    g.fillStyle = '#1A1A1A'; g.font = `bold 22px ${SANS}`; g.textAlign = 'center'; g.fillText('The Periodic Table', w / 2, 28)
    const rows = [[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]]
    for (let r = 3; r < 7; r++) rows.push(Array(18).fill(1))
    const cw = 26, ch = 30, x0 = (w - 18 * cw) / 2, y0 = 44
    const col = (c) => (c < 2 ? '#F4A7A7' : c < 12 ? '#F7D79A' : c < 17 ? '#A9D6A4' : '#A9C9EC')
    rows.forEach((row, r) => row.forEach((on, c) => {
      if (!on) return
      g.fillStyle = col(c); g.fillRect(x0 + c * cw + 1, y0 + r * ch + 1, cw - 2, ch - 2)
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(x0 + c * cw + 7, y0 + r * ch + 12, cw - 14, 4)
    }))
    for (let k = 0; k < 2; k++) for (let c = 0; c < 15; c++) { g.fillStyle = '#D8C3E8'; g.fillRect(x0 + (c + 2.5) * cw + 1, y0 + (7.4 + k) * ch + 1, cw - 2, ch - 2) }
  })
}
function clockFace() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(128, 128, 124, 0, 2 * PI); g.fill()
    g.strokeStyle = '#1A1A1A'
    for (let k = 0; k < 60; k++) {
      const a = k * PI / 30, big = k % 5 === 0
      g.lineWidth = big ? 6 : 2
      g.beginPath(); g.moveTo(128 + Math.sin(a) * (big ? 96 : 106), 128 - Math.cos(a) * (big ? 96 : 106)); g.lineTo(128 + Math.sin(a) * 114, 128 - Math.cos(a) * 114); g.stroke()
    }
    g.fillStyle = '#1A1A1A'; g.font = `bold 26px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'
    for (let n = 1; n <= 12; n++) { const a = n * PI / 6; g.fillText(String(n), 128 + Math.sin(a) * 76, 128 - Math.cos(a) * 76) }
  })
}

/** Analogue clock (face towards +z); setTime(minutes, seconds?). */
export function analogueClock(r = 0.12, { seconds = true } = {}) {
  const g = new THREE.Group()
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.07, 8, 40), std({ color: '#2B2F36', roughness: 0.5 }))
  const face = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshBasicMaterial({ map: clockFace() }))
  g.add(rim, face)
  const hand = (len, wid, colour, z) => {
    const p = new THREE.Group()
    const m = new THREE.Mesh(new THREE.BoxGeometry(wid, len, 0.002), new THREE.MeshBasicMaterial({ color: colour }))
    m.position.y = len / 2 - len * 0.12
    p.add(m); p.position.z = z; g.add(p)
    return p
  }
  const hr = hand(r * 0.55, r * 0.07, '#1A1A1A', 0.003), mn = hand(r * 0.82, r * 0.045, '#1A1A1A', 0.005)
  const sc = seconds ? hand(r * 0.88, r * 0.018, '#C62828', 0.007) : null
  g.userData.setTime = (minutes, secs = 0) => {
    hr.rotation.z = -((minutes / 60) % 12) * PI / 6
    mn.rotation.z = -(minutes % 60) * PI / 30
    if (sc) sc.rotation.z = -secs * PI / 30
  }
  return g
}

/** Plain reagent bottle for the shelves. */
function shelfBottle(text, { glass = '#7A4A1E', cap = '#1F2227', h = 0.12, r = 0.028, label = true } = {}) {
  const g = new THREE.Group()
  g.add(cyl(r, r, h, std({ color: glass, transparent: true, opacity: 0.85, roughness: 0.2 }), 0, h / 2, 0, 18))
  g.add(cyl(r * 0.55, r * 0.55, h * 0.18, std({ color: cap, roughness: 0.5 }), 0, h + h * 0.09, 0, 14))
  if (label) { const l = plate(text, r * 1.5, h * 0.42, { bg: '#FBF8EE', fg: '#1A1A1A' }); l.position.set(0, h * 0.48, r + 0.0008); g.add(l) }
  return g
}

export function addLabRoom(lab, { width = 2.2, depth = 0.9 } = {}) {
  const low = !!lab.lowGraphics
  const reduced = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const room = new THREE.Group(); room.name = 'lab-room'
  const B = BENCH_Y
  const backZ = -depth / 2 - 0.25 + 0.003          // the bench's back wall (equipment.bench) is at -depth/2 - 0.25
  const halfW = width / 2
  const shade = (o, cast = false) => { o.traverse(m => { if (m.isMesh) { m.receiveShadow = !low; m.castShadow = cast && !low } }); return o }

  // Floor tiles and ceiling with light panels.
  if (!low) {
    const ft = tiles(64, '#D4D8DC', '#BDC3C9'); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(10, 10)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), std({ map: ft, roughness: 0.9 })); floor.rotation.x = -PI / 2; floor.position.y = 0.001
    room.add(shade(floor))
  }
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), std({ color: '#F2F3F4', roughness: 1 })); ceiling.rotation.x = PI / 2; ceiling.position.y = 2.9
  room.add(ceiling)
  for (const x of [-0.9, 0.9]) {
    const panel = box(0.6, 0.02, 0.3, new THREE.MeshBasicMaterial({ color: '#FFFDF5' }), x, 2.885, 0.1)
    room.add(panel)
  }
  // Side walls.
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), std({ color: '#E3E7EB', roughness: 1 }))
    w.position.set(s * 2.15, 1.5, 1.3); w.rotation.y = -s * PI / 2
    room.add(shade(w))
  }

  // Service ledge behind the bench: fills the gap to the wall; gas taps on top, sockets in front.
  const ledgeH = B + 0.1, ledgeD = -backZ - depth / 2
  const ledge = box(width, ledgeH, ledgeD, std({ color: '#2B2F36', roughness: 0.75 }), 0, ledgeH / 2, -depth / 2 - ledgeD / 2)
  const ledgeTop = box(width, 0.02, ledgeD, std({ color: '#E9EBEE', roughness: 0.55 }), 0, ledgeH - 0.01, -depth / 2 - ledgeD / 2)
  room.add(shade(ledge), shade(ledgeTop))
  const brass = std({ color: '#C8A04A', metalness: 0.8, roughness: 0.3 })
  for (const x of [-0.75, 0.45]) {
    const tap = new THREE.Group()
    tap.add(cyl(0.008, 0.01, 0.05, brass, 0, 0.025, 0, 12))
    const nozzle = cyl(0.004, 0.005, 0.05, brass, 0, 0.045, 0.02, 10); nozzle.rotation.x = PI / 2; tap.add(nozzle)
    tap.add(box(0.03, 0.006, 0.008, std({ color: '#E2B21F', roughness: 0.5 }), 0, 0.055, 0))
    tap.position.set(x, ledgeH, -depth / 2 - 0.1)
    room.add(shade(tap))
  }
  for (const x of [-0.3, 0.75]) {
    const sock = box(0.08, 0.05, 0.006, std({ color: '#F4F4F2', roughness: 0.6 }), x, B + 0.05, -depth / 2 + 0.003)
    room.add(sock)
    for (const dx of [-0.017, 0.017]) room.add(box(0.012, 0.016, 0.002, std({ color: '#3A3D42' }), x + dx, B + 0.052, -depth / 2 + 0.0066))
  }

  // Tiled splashback above the ledge.
  const spH = 0.2
  const spMat = low ? std({ color: '#F1F3F5', roughness: 0.4 }) : (() => { const t = tiles(64, '#F4F6F7', '#C9D0D6'); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(width / 0.4, spH / 0.4); return std({ map: t, roughness: 0.35 }) })()
  const splash = new THREE.Mesh(new THREE.PlaneGeometry(width, spH), spMat); splash.position.set(0, ledgeH + spH / 2, backZ)
  room.add(shade(splash))

  // Window on the left of the back wall, with daylight coming in.
  const winW = 0.7, winH = 0.62, winX = -0.68, winY = ledgeH + spH + 0.04 + winH / 2
  const frameM = std({ color: '#F7F7F5', roughness: 0.5 })
  const pane = picture(windowView(), winW, winH); pane.position.set(winX, winY, backZ + 0.002)
  room.add(pane)
  for (const [w, h, x, y] of [[winW + 0.06, 0.04, winX, winY + winH / 2 + 0.02], [winW + 0.06, 0.04, winX, winY - winH / 2 - 0.02], [0.04, winH, winX - winW / 2 - 0.01, winY], [0.04, winH, winX + winW / 2 + 0.01, winY], [0.025, winH, winX, winY], [winW, 0.02, winX, winY + 0.06]]) {
    room.add(box(w, h, 0.03, frameM, x, y, backZ + 0.012))
  }
  room.add(shade(box(winW + 0.12, 0.025, 0.08, frameM, winX, winY - winH / 2 - 0.045, backZ + 0.04)))
  const plant = new THREE.Group()
  plant.add(cyl(0.035, 0.026, 0.06, std({ color: '#B5653A', roughness: 0.8 }), 0, 0.03, 0, 14))
  for (let k = 0; k < (low ? 3 : 7); k++) { const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), std({ color: k % 2 ? '#4E8A3E' : '#3E7432', roughness: 0.8 })); leaf.scale.set(1, 1.6, 0.5); leaf.position.set(Math.cos(k * 2.4) * 0.025, 0.08 + (k % 3) * 0.018, Math.sin(k * 2.4) * 0.015); leaf.rotation.z = Math.cos(k * 2.4) * 0.6; plant.add(leaf) }
  plant.position.set(winX + 0.22, winY - winH / 2 - 0.032, backZ + 0.045)
  room.add(shade(plant))
  const daylight = new THREE.DirectionalLight('#FFF6E8', low ? 0.25 : 0.4)
  daylight.position.set(winX - 0.4, winY + 0.6, backZ - 0.8)
  daylight.target.position.set(0.1, B, 0.2)
  room.add(daylight, daylight.target)

  // Safety signs between the window and the shelves.
  const eye = picture(signEye(), 0.13, 0.166); eye.position.set(-0.17, winY + 0.05, backZ + 0.002); room.add(eye)
  const haz = picture(signHazard('Corrosive', 'chemicals'), 0.11, 0.126); haz.position.set(-0.17, winY - 0.16, backZ + 0.002); room.add(haz)

  // Wall shelves of reagent bottles.
  const shelfX0 = 0.08, shelfX1 = 0.68, shelfW = shelfX1 - shelfX0, shelfCx = (shelfX0 + shelfX1) / 2
  const wood = std({ color: '#C69C6D', roughness: 0.75 })
  const REAGENTS = [
    ['Copper(II)\nsulfate', '#3D7CC9', '#1F2227'], ['Sodium\nchloride', '#EEF2F4', '#1F5FAF'], ['Ethanol', '#EEF2F4', '#C62828'], ['Iodine\nsolution', '#7A4A1E', '#1F2227'],
    ['Silver\nnitrate', '#4A3020', '#1F2227'], ['Potassium\nmanganate', '#7A4A1E', '#6A1B9A'], ['Limewater', '#EEF2F4', '#2E7D32'], ['Universal\nindicator', '#7A4A1E', '#E2B21F'],
    ['Hydrochloric\nacid 2 M', '#EEF2F4', '#8B1A2E'], ['Benedict’s\nreagent', '#3D7CC9', '#1F2227'],
  ]
  let ri = 0
  for (const [k, y] of [[0, ledgeH + 0.36], [1, ledgeH + 0.62]]) {
    room.add(shade(box(shelfW, 0.018, 0.17, wood, shelfCx, y, backZ + 0.085)))
    for (const x of [shelfX0 + 0.04, shelfX1 - 0.04]) room.add(box(0.012, 0.06, 0.12, std({ color: '#8A8F96', metalness: 0.5, roughness: 0.5 }), x, y - 0.04, backZ + 0.06))
    const n = low ? 3 : 5
    for (let i = 0; i < n; i++) {
      const [name, glass, cap] = REAGENTS[ri++ % REAGENTS.length]
      const bt = shelfBottle(name, { glass, cap, h: 0.1 + ((i + k) % 3) * 0.015, label: !low })
      bt.position.set(shelfX0 + 0.06 + i * (shelfW - 0.12) / Math.max(1, n - 1), y + 0.009, backZ + 0.09)
      room.add(shade(bt, true))
    }
  }

  // Sink with a swan-neck tap at the right end of the bench.
  const sinkX = Math.min(halfW - 0.22, 0.88), sinkZ = -depth / 2 + 0.17
  const steel = std({ color: '#C8CDD3', metalness: 0.85, roughness: 0.25 })
  room.add(shade(box(0.32, 0.012, 0.26, steel, sinkX, B + 0.006, sinkZ)))
  const basin = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.21), std({ color: '#6E767F', metalness: 0.7, roughness: 0.35 }))
  basin.rotation.x = -PI / 2; basin.position.set(sinkX, B + 0.0125, sinkZ); room.add(basin)
  room.add(cyl(0.012, 0.012, 0.002, std({ color: '#3A3D42' }), sinkX, B + 0.0135, sinkZ, 16))
  const spout = new THREE.Vector3(sinkX, B + 0.27, sinkZ - 0.02)
  const neck = new THREE.CatmullRomCurve3([[sinkX, ledgeH, -depth / 2 - 0.06], [sinkX, B + 0.3, -depth / 2 - 0.06], [sinkX, B + 0.34, -depth / 2 + 0.03], [sinkX, B + 0.3, sinkZ - 0.02], [spout.x, spout.y, spout.z]].map(p => new THREE.Vector3(...p)))
  room.add(shade(new THREE.Mesh(new THREE.TubeGeometry(neck, low ? 12 : 28, 0.009, low ? 6 : 10, false), steel), true))
  for (const dx of [-0.05, 0.05]) {
    const lever = box(0.012, 0.012, 0.07, std({ color: dx < 0 ? '#1F5FAF' : '#C62828', roughness: 0.5 }), sinkX + dx, ledgeH + 0.02, -depth / 2 - 0.05)
    lever.rotation.x = -0.3; room.add(lever)
  }
  const wash = picture(signText(['Wash your hands', 'before leaving'], '#2E7D32'), 0.16, 0.08); wash.position.set(sinkX, ledgeH + 0.2, backZ + 0.002); room.add(wash)

  // Wall clock (real time unless a scene shows lab time).
  const clock = analogueClock(0.1); clock.position.set(sinkX, ledgeH + 0.5, backZ + 0.01); room.add(clock)

  // Periodic table poster beyond the bench end.
  const pt = picture(periodicTable(), 0.6, 0.35); pt.position.set(halfW + 0.42, ledgeH + 0.46, backZ + 0.002); room.add(pt)

  // Fume cupboard to the left of the bench.
  const fc = new THREE.Group()
  const fcW = 0.9, fcD = 0.66, white = std({ color: '#ECEEF0', roughness: 0.6 })
  fc.add(box(fcW, B, fcD, std({ color: '#2B2F36', roughness: 0.75 }), 0, B / 2, 0))
  fc.add(box(fcW, 0.03, fcD, std({ color: '#E9EBEE', roughness: 0.5 }), 0, B + 0.015, 0))
  for (const s of [-1, 1]) fc.add(box(0.04, 1.05, fcD, white, s * (fcW / 2 - 0.02), B + 0.03 + 0.525, 0))
  fc.add(box(fcW, 1.05, 0.03, std({ color: '#D9DDE2', roughness: 0.7 }), 0, B + 0.555, -fcD / 2 + 0.015))
  fc.add(box(fcW, 0.3, fcD, white, 0, B + 1.23, 0))
  const fcLabel = plate('FUME CUPBOARD', 0.36, 0.06, { bg: '#ECEEF0', fg: '#1A1A1A' }); fcLabel.position.set(-0.12, B + 1.23, fcD / 2 + 0.001); fc.add(fcLabel)
  const ok = box(0.025, 0.025, 0.004, new THREE.MeshBasicMaterial({ color: '#3CCB5A' }), 0.3, B + 1.23, fcD / 2 + 0.002); fc.add(ok)
  const sash = box(fcW - 0.08, 0.5, 0.008, std({ color: '#DDEBF5', transparent: true, opacity: 0.25, roughness: 0.05, depthWrite: false }), 0, B + 0.78, fcD / 2 - 0.03)
  fc.add(sash, box(fcW - 0.08, 0.03, 0.02, std({ color: '#B7BDC4', metalness: 0.4 }), 0, B + 0.54, fcD / 2 - 0.03))
  fc.add(box(fcW - 0.1, 0.012, 0.05, new THREE.MeshBasicMaterial({ color: '#FFFDF0' }), 0, B + 1.07, -0.05))
  // a hot plate with a beaker of water steaming gently
  fc.add(box(0.16, 0.05, 0.16, std({ color: '#E6E9ED', roughness: 0.5 }), 0.12, B + 0.055, -0.05))
  fc.add(cyl(0.06, 0.06, 0.006, std({ color: '#2B2F36' }), 0.12, B + 0.083, -0.05, 24))
  fc.add(cyl(0.036, 0.036, 0.09, std({ color: '#DDEBF5', transparent: true, opacity: 0.3, depthWrite: false }), 0.12, B + 0.131, -0.05, 20))
  fc.add(cyl(0.034, 0.034, 0.06, std({ color: '#BFDDF2', transparent: true, opacity: 0.5, depthWrite: false }), 0.12, B + 0.116, -0.05, 20))
  fc.position.set(-halfW - 0.08 - fcW / 2, 0, backZ + fcD / 2 + 0.005)
  room.add(shade(fc))
  const steamAt = new THREE.Vector3(fc.position.x + 0.12, B + 0.18, fc.position.z - 0.05)

  // Lab stool in front of the bench.
  const stool = new THREE.Group()
  const metal = std({ color: '#3A3D42', metalness: 0.5, roughness: 0.5 })
  stool.add(cyl(0.17, 0.17, 0.04, std({ color: '#3C4650', roughness: 0.7 }), 0, 0.66, 0, low ? 16 : 28))
  for (let k = 0; k < 4; k++) {
    const a = k * PI / 2 + PI / 4
    const leg = cyl(0.012, 0.012, 0.66, metal, Math.cos(a) * 0.15, 0.32, Math.sin(a) * 0.15, 10)
    leg.rotation.set(Math.sin(a) * 0.16, 0, -Math.cos(a) * 0.16)
    stool.add(leg)
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.008, 6, 28), metal); ring.rotation.x = PI / 2; ring.position.y = 0.24; stool.add(ring)
  stool.position.set(-0.62, 0, depth / 2 + 0.35)
  room.add(shade(stool, true))

  lab.scene.add(room)
  // Light: a warmer room, finer and cleaner shadows from the key light (high graphics only).
  const L = lab.lights
  if (L) {
    L.hemi.color.set('#FFFDF8'); L.hemi.groundColor.set('#B4ADA2'); L.hemi.intensity = low ? 1.15 : 0.95
    if (!low && L.key.castShadow) { L.key.shadow.mapSize.set(2048, 2048); L.key.shadow.bias = -0.0004; L.key.shadow.normalBias = 0.01; L.key.shadow.map?.dispose(); L.key.shadow.map = null }
  }
  lab.scene.background = new THREE.Color('#DDE2E7')
  lab.invalidate()

  // ── Subtle motion (throttled) ─────────────────────────────
  let labMinutes = null
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 6), std({ color: '#BFDDF2', transparent: true, opacity: 0.8, roughness: 0.1 }))
  drop.visible = false; room.add(drop)
  const puffs = low ? [] : Array.from({ length: 3 }, () => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, depthWrite: false }))
    m.visible = false; room.add(m); return m
  })
  const animateDrip = () => {
    let v = 0
    drop.position.copy(spout); drop.position.y -= 0.01; drop.visible = true
    lab.animate((dt) => {
      v += 9.8 * dt; drop.position.y -= v * dt
      if (drop.position.y <= B + 0.014) { drop.visible = false; return false }
      return true
    })
  }
  const animateSteam = () => {
    let t = 0
    puffs.forEach(p => { p.visible = true })
    lab.animate((dt) => {
      t += dt
      puffs.forEach((p, k) => {
        const u = ((t / 2.4) + k / puffs.length) % 1
        p.position.set(steamAt.x + Math.sin((t + k) * 1.7) * 0.012, steamAt.y + u * 0.22, steamAt.z)
        p.scale.setScalar(0.6 + u * 1.4)
        p.material.opacity = 0.22 * Math.sin(PI * u)
      })
      if (t >= 2.4) { puffs.forEach(p => { p.visible = false }); return false }
      return true
    })
  }
  const showClock = () => {
    if (labMinutes != null) { clock.userData.setTime(labMinutes, 0); return }
    const d = new Date()
    clock.userData.setTime(d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60, d.getSeconds())
  }
  showClock()
  let ticks = 0
  const timer = setInterval(() => {
    if (!lab.renderer.domElement.isConnected) { clearInterval(timer); return }
    ticks++
    if (low) { if (ticks % 30 === 0) { showClock(); lab.invalidate() } return }   // low graphics: the clock moves twice a minute, nothing else
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
    showClock()
    if (!reduced) {
      if (ticks % 5 === 0) animateDrip()
      if (puffs.length && ticks % 7 === 0) animateSteam()
    }
    lab.invalidate()
  }, 1000)

  return {
    group: room,
    clock,
    /** Show lab time on the wall clock (minutes since midnight); null returns to real time. */
    setClock(minutes) { labMinutes = minutes; showClock(); lab.invalidate() },
  }
}
