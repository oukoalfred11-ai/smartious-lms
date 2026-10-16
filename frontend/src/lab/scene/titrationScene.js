/**
 * titrationScene.js — the hands-on acid–base titration bench.
 *
 * Everything in the practical's apparatus and materials list is on the
 * bench: retort stand and burette clamp, 50 cm³ burette, filter funnel,
 * 25.0 cm³ pipette with filler, 250 cm³ conical flask on a white tile,
 * labelled reagent bottles of sodium hydroxide and the acid, a beaker of
 * each solution and one for rinsings, three indicator dropper bottles, a
 * wash bottle of distilled water and safety goggles.
 *
 * Students use the apparatus directly:
 *   NaOH bottle / beaker / funnel → fillBurette (funnel in, pour, funnel out)
 *   pipette / acid bottle / beaker → pipetteAcid (pipette fills, delivers, returns)
 *   indicator bottle, then flask  → chooseIndicator, addIndicator (dropper, 2 drops)
 *   burette tap: click            → addBase 0.05 (one drop)
 *   burette tap: press and hold   → addBase 0.1 every 150 ms while held
 *   flask (no indicator armed)    → swirl (cosmetic)
 *
 * Animations are cosmetic and follow the engine's view: the burette level,
 * flask volume and colour always come from view. The burette reading is
 * never printed here; students read the scale close-up in the controls.
 */
import * as THREE from 'three'
import * as E from './equipment.js'
import { buildModel, plate, wrapText } from './apparatus3d.js'
import { INDICATORS } from '../../../../shared/lab/science/indicators.js'

const { BENCH_Y: B } = E
const PI = Math.PI

// ── Models built for this bench ──────────────────────────────
const std = (o) => new THREE.MeshStandardMaterial(o)
const glassMat = () => E.mat.glass()

function lathe(profile, material, seg) {
  return new THREE.Mesh(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg), material)
}

/** Retort stand, boss and burette clamp. The clamp grips at (0, clampY, reach). */
function standAndClamp(clampY, reach, seg) {
  const g = new THREE.Group()
  const iron = std({ color: '#3A3D42', metalness: 0.5, roughness: 0.6 })
  const steel = std({ color: '#C8CDD3', metalness: 0.85, roughness: 0.22 })
  const metal = std({ color: '#A3ABB4', metalness: 0.7, roughness: 0.35 })
  const cork = std({ color: '#B98A5A', roughness: 0.9 })
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.016, 0.13), iron); base.position.y = 0.008
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.86, seg), steel); rod.position.set(0, 0.016 + 0.43, -0.04)
  const boss = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.028, 0.028), metal); boss.position.set(0, clampY, -0.04)
  const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.03, 10), metal); screw.rotation.z = PI / 2; screw.position.set(0.024, clampY, -0.04)
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.006, 14), iron); knob.rotation.z = PI / 2; knob.position.set(0.04, clampY, -0.04)
  const armLen = reach + 0.04 - 0.02
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, armLen, 12), steel); arm.rotation.x = PI / 2; arm.position.set(0, clampY, -0.04 + armLen / 2)
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.016, 0.008), metal); head.position.set(0, clampY, reach - 0.016)
  g.add(base, rod, boss, screw, knob, arm, head)
  for (const s of [-1, 1]) {
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.016, 0.03), metal); jaw.position.set(s * 0.0135, clampY, reach - 0.004)
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.014, 0.022), cork); pad.position.set(s * 0.0098, clampY, reach)
    g.add(jaw, pad)
  }
  return g
}

/** Reagent bottle with a printed label; optional hazard strip. */
function reagentBottle(text, { body = '#EEF2F4', bodyOpacity = 0.85, liquid = '#E3EEF6', cap = '#1F5FAF', hazard = null, seg = 32 } = {}) {
  const g = new THREE.Group()
  const prof = [[0, 0], [0.042, 0], [0.044, 0.004], [0.044, 0.118], [0.036, 0.138], [0.017, 0.148], [0.017, 0.162]]
  g.add(lathe(prof, std({ color: body, transparent: true, opacity: bodyOpacity, roughness: 0.25, depthWrite: false, side: THREE.DoubleSide }), seg))
  const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.041, 0.041, 0.09, seg), E.mat.liquid(liquid, 0.45)); liq.position.y = 0.047
  const capM = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.024, seg), std({ color: cap, roughness: 0.45 })); capM.position.y = 0.168
  const label = plate(text, 0.072, 0.046, { bg: '#FFFFFF', fg: '#1A1A1A' }); label.position.set(0, 0.07, 0.0448)
  g.add(liq, capM, label)
  if (hazard) { const h = plate(hazard, 0.05, 0.012, { bg: '#E8731A', fg: '#FFFFFF' }); h.position.set(0, 0.038, 0.0449); g.add(h) }
  g.userData.label = label
  return g
}

/** Dropper bottle of indicator; the dropper is a child that can be lifted out. */
function dropperBottle(name, liquid, seg) {
  const g = new THREE.Group()
  const prof = [[0, 0], [0.016, 0], [0.017, 0.003], [0.017, 0.05], [0.012, 0.058], [0.0075, 0.06], [0.0075, 0.066]]
  g.add(lathe(prof, std({ color: '#7A4A1E', transparent: true, opacity: 0.82, roughness: 0.2, depthWrite: false, side: THREE.DoubleSide }), seg))
  const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.0155, 0.0155, 0.034, seg), E.mat.liquid(liquid, 0.6)); liq.position.y = 0.019
  const label = plate(wrapText(name, 10, 2), 0.028, 0.022, { bg: '#FBF6EA', fg: '#1A1A1A' }); label.position.set(0, 0.027, 0.0172)
  const dropper = new THREE.Group()
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.0024, 0.0012, 0.056, 10), glassMat()); tube.position.y = 0.028
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.0095, 0.0095, 0.012, seg), std({ color: '#1F2227', roughness: 0.5 })); collar.position.y = 0.058
  const teat = new THREE.Mesh(new THREE.SphereGeometry(0.0075, 14, 10), std({ color: '#7A1F2B', roughness: 0.8 })); teat.scale.y = 1.7; teat.position.y = 0.074
  dropper.add(tube, collar, teat)
  dropper.position.y = 0.012
  dropper.userData.home = dropper.position.clone()
  g.add(liq, label, dropper)
  g.userData.dropper = dropper
  return g
}

/** Small glass filter funnel; origin at the bottom of the stem. */
function funnel(seg) {
  return lathe([[0.0032, 0], [0.0042, 0], [0.0042, 0.05], [0.034, 0.092], [0.036, 0.095]], glassMat(), seg)
}

/** 25.0 cm³ bulb pipette with a pipette filler; origin at the tip, axis +y. */
function pipetteWithFiller(seg) {
  const g = new THREE.Group()
  const glass = glassMat()
  const add = (geo, m, y) => { const o = new THREE.Mesh(geo, m); o.position.y = y; g.add(o); return o }
  add(new THREE.CylinderGeometry(0.003, 0.0013, 0.04, 12), glass, 0.02)                      // tip
  add(new THREE.CylinderGeometry(0.003, 0.003, 0.1, 12), glass, 0.09)                          // lower stem
  const bulb = add(new THREE.SphereGeometry(0.013, seg, 14), glass, 0.175); bulb.scale.y = 2.6  // bulb
  add(new THREE.CylinderGeometry(0.003, 0.003, 0.15, 12), glass, 0.285)                        // upper stem
  add(new THREE.CylinderGeometry(0.0034, 0.0034, 0.0012, 12), E.mat.black(), 0.31)              // the 25.0 cm³ mark
  // Filler (thumb-wheel type)
  const green = std({ color: '#2E7D32', roughness: 0.5 })
  add(new THREE.CylinderGeometry(0.006, 0.0045, 0.02, 14), std({ color: '#26282B', roughness: 0.9 }), 0.365)
  add(new THREE.CylinderGeometry(0.011, 0.011, 0.07, seg), green, 0.41)
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.006, seg), std({ color: '#1B5E20', roughness: 0.5 }), 0.447)
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.006, 18), std({ color: '#1F2227', roughness: 0.6 }))
  wheel.rotation.x = PI / 2; wheel.position.set(0, 0.41, 0.012); g.add(wheel)
  // Liquid inside (shown while the pipette holds acid)
  const lm = E.mat.liquid('#E7EEF5', 0)
  const liq = new THREE.Group()
  const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.13, 10), lm); l1.position.y = 0.075
  const l2 = new THREE.Mesh(new THREE.SphereGeometry(0.0118, 16, 12), lm); l2.scale.y = 2.6; l2.position.y = 0.175
  const l3 = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.1, 10), lm); l3.position.y = 0.26
  liq.add(l1, l2, l3); liq.visible = false; g.add(liq)
  g.userData.setFill = (f) => { liq.visible = f > 0.01; lm.opacity = 0.55 * f }
  g.userData.wheel = wheel
  return g
}

/** Plastic wash bottle with delivery tube; nozzle points along +x. */
function washBottle(seg) {
  const g = new THREE.Group()
  const body = lathe([[0, 0], [0.034, 0], [0.036, 0.004], [0.036, 0.11], [0.03, 0.125], [0.012, 0.132], [0.012, 0.14]],
    std({ color: '#EEF3F6', transparent: true, opacity: 0.8, roughness: 0.4, side: THREE.DoubleSide, depthWrite: false }), seg)
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.07, seg), E.mat.liquid('#D6E8F5', 0.4)); water.position.y = 0.037
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.016, seg), std({ color: '#F2F2F2', roughness: 0.5 })); cap.position.y = 0.142
  const curve = new THREE.CatmullRomCurve3([[0, 0.15, 0], [0, 0.182, 0], [0.012, 0.198, 0], [0.04, 0.19, 0], [0.056, 0.168, 0]].map(p => new THREE.Vector3(...p)))
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.0022, 8, false), std({ color: '#F4F4F4', roughness: 0.5 }))
  const label = plate('Distilled\nwater', 0.05, 0.03, { bg: '#FFFFFF', fg: '#1F5FAF' }); label.position.set(0, 0.07, -0.0365); label.rotation.y = PI
  const squeeze = new THREE.Group(); squeeze.add(body, water)
  g.add(squeeze, cap, tube, label)
  g.userData.squeeze = squeeze
  return g
}

/** Name tag stuck on the front of a beaker. */
function beakerWithTag(text, fill) {
  const b = E.beaker('#E8F0F7', fill)
  if (text) { const t = plate(text, 0.04, 0.016, { bg: '#FFFFFF', fg: '#1A1A1A' }); t.position.set(0, 0.06, 0.0336); b.add(t); b.userData.tag = t }
  return b
}

const INDICATOR_LIQUID = { phenolphthalein: '#F2F4F7', methyl_orange: '#E8862A', bromothymol_blue: '#3A78C9' }
const ease = (k) => k * k * (3 - 2 * k)
const v3 = (x, y, z) => new THREE.Vector3(x, y, z)

// ── The scene ────────────────────────────────────────────────
export function titration(lab, { dispatch, onSelect, onHover }) {
  const low = !!lab.lowGraphics
  const seg = low ? 16 : 32
  const reduced = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const say = (label, kind = 'notice') => onSelect({ kind, label })

  lab.add(E.bench())

  // Positions (x, z) on the bench. Flask under the burette at the centre.
  const BUR_Y = B + 0.2                       // burette tip
  const BUR_TOP = BUR_Y + 0.69                // open top of the burette
  const FLASK_HOME = v3(0, B + 0.008, 0)      // on the white tile
  const FLASK_FRONT = v3(0, B, 0.17)          // in front, for pipetting and indicator

  const stand = standAndClamp(BUR_Y + 0.5 - B, 0.15, seg); stand.position.set(0, B, -0.15)
  lab.add(stand, { pick: { kind: 'stand', label: 'Retort stand with boss and burette clamp' } })
  const tile = E.whiteTile(); tile.position.set(0, B, 0)
  lab.add(tile, { pick: { kind: 'tile', label: 'White tile: makes the colour change easy to see' } })
  const flask = E.conicalFlask(); flask.position.copy(FLASK_HOME)
  lab.add(flask, { pick: { kind: 'flask' } })
  const bur = E.burette(); bur.position.set(0, BUR_Y, 0)
  lab.add(bur, { pick: { kind: 'burette' } })

  // Tap: a T-grip shows whether it is open; a larger invisible target is easier to press.
  const tap = bur.userData.tap
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.005, 0.026), E.mat.crimson()); grip.position.x = 0.047; tap.add(grip)
  const tapTarget = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.03, 0.04), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }))
  tapTarget.position.x = 0.015; tap.add(tapTarget)
  lab.makePickable(tap, { kind: 'tap', hold: true, label: 'Burette tap: click for one drop, hold to run' })
  const setTap = (open) => { tap.rotation.x = open ? PI / 2 : 0; lab.invalidate() }

  // Sodium hydroxide side (right)
  const naohBottle = reagentBottle('Sodium hydroxide\n0.100 M', { cap: '#1F5FAF', hazard: 'IRRITANT', seg })
  naohBottle.position.set(0.31, B, -0.12)
  lab.add(naohBottle, { pick: { kind: 'naoh', label: 'Sodium hydroxide 0.100 M: click to fill the burette through the funnel' } })
  const naohBeaker = beakerWithTag('NaOH', 0.6); naohBeaker.position.set(0.2, B, 0.07)
  naohBeaker.userData.home = naohBeaker.position.clone()
  lab.add(naohBeaker, { pick: { kind: 'naoh', label: 'Beaker of sodium hydroxide: click to fill the burette through the funnel' } })
  const rinse = beakerWithTag('Rinsings', 0.08); rinse.position.set(0.17, B, -0.12)
  lab.add(rinse, { pick: { kind: 'rinse', label: 'Beaker for rinsings; the funnel rests in it' } })
  const fun = funnel(seg)
  const FUNNEL_HOME = v3(0.17, B + 0.055, -0.12)
  fun.position.copy(FUNNEL_HOME)
  lab.add(fun, { pick: { kind: 'funnel', label: 'Filter funnel: click to fill the burette with sodium hydroxide' } })
  const wash = washBottle(seg); wash.position.set(0.42, B, 0.12); wash.rotation.y = PI
  lab.add(wash, { pick: { kind: 'wash', label: 'Wash bottle of distilled water: click to rinse the inside of the flask' } })
  const goggles = buildModel('goggles'); goggles.position.set(0.3, B, 0.3); goggles.rotation.y = -0.5
  lab.add(goggles, { pick: { kind: 'goggles', label: 'Safety goggles: wear them throughout the practical' } })

  // Acid side (left)
  const acidBottle = reagentBottle('Acid\n? M', { body: '#F1F5F7', bodyOpacity: 0.55, cap: '#8B1A2E', seg })
  acidBottle.position.set(-0.3, B, -0.12)
  lab.add(acidBottle, { pick: { kind: 'acid' } })
  const acidBeaker = beakerWithTag('Acid', 0.6); acidBeaker.position.set(-0.2, B, 0.07)
  lab.add(acidBeaker, { pick: { kind: 'acid' } })
  const pip = pipetteWithFiller(seg)
  const PIP_HOME = { p: v3(-0.44, B + 0.014, 0.3), r: { z: -PI / 2 } }
  pip.position.copy(PIP_HOME.p); pip.rotation.z = PIP_HOME.r.z
  lab.add(pip, { pick: { kind: 'pipette', label: '25.0 cm³ pipette with filler: click to transfer 25.0 cm³ of acid to the flask' } })

  // Indicators (left, in a row)
  const bottles = Object.keys(INDICATOR_LIQUID).map((id, i) => {
    const b = dropperBottle(INDICATORS[id].name, INDICATOR_LIQUID[id], seg)
    b.position.set(-0.5 + i * 0.05, B, 0.06)
    lab.add(b, { pick: { kind: 'indicator', id } })
    return { id, b }
  })
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.0018, 8, 32), new THREE.MeshBasicMaterial({ color: '#F0B429' }))
  ring.rotation.x = PI / 2; ring.visible = false; lab.scene.add(ring)

  // Falling drops (cosmetic): a small pool of meshes reused.
  const dropGeo = new THREE.SphereGeometry(0.0028, 8, 6)
  const drops = Array.from({ length: low ? 2 : 8 }, () => {
    const m = new THREE.Mesh(dropGeo, E.mat.liquid('#E8F0F7', 0.9)); m.visible = false; m.scale.y = 1.25
    lab.scene.add(m); return m
  })
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 1, 8), E.mat.liquid('#E3EEF6', 0.75))
  stream.visible = false; lab.scene.add(stream)

  // ── State ─────────────────────────────────────────────
  let last = null, prev = null
  let busy = false            // a move animation (fill, pipette, dropper) is playing
  let deferFlask = 0          // hold the flask contents until an animation delivers them
  let fillAnimating = false
  let armed = null            // indicator chosen by clicking its bottle, waiting for a flask click
  let running = false         // tap held open
  let hold = null
  let swirling = false
  let queued = 0, dropT = 0, dropLoop = false

  const liquidHeight = (vol) => (vol ? Math.min(0.11, 0.0006 * vol + 0.004) : 0)
  const flaskSurfaceY = () => flask.position.y + 0.002 + Math.max(0.006, liquidHeight(last?.flask.volume || 0))
  const applyFlask = (v) => { if (v) flask.userData.setLiquid(v.flask.volume, v.flask.colour); lab.invalidate() }

  function spawnDrop(pos, endY, colour) {
    const d = drops.find(m => !m.visible)
    if (!d) return false
    d.position.copy(pos); d.userData.v = 0; d.userData.endY = endY
    d.material.color.set(colour)
    d.visible = true
    return true
  }
  function kickDrops() {
    if (dropLoop || reduced) return
    dropLoop = true; dropT = 1
    lab.animate((dt) => {
      dropT += dt
      const gap = running ? (low ? 0.12 : 0.05) : 0.08
      const underBurette = flask.position.distanceTo(FLASK_HOME) < 0.01
      if ((running || queued > 0) && dropT >= gap) {
        dropT = 0
        const endY = underBurette ? flaskSurfaceY() : B + 0.008
        if (spawnDrop(v3(0, BUR_Y - 0.004, 0), endY, '#E8F0F7') && !running) queued--
      }
      let any = false
      for (const d of drops) {
        if (!d.visible) continue
        d.userData.v += 9.8 * dt
        d.position.y -= d.userData.v * dt
        if (d.position.y <= d.userData.endY) d.visible = false
        else any = true
      }
      if (!running && queued <= 0 && !any) { queued = 0; dropLoop = false; return false }
      return true
    })
  }

  // ── Animation sequencer ───────────────────────────────
  // steps: { d (s), begin(), run(k 0..1), end() }; under reduced motion each
  // step jumps to its end state at once.
  function play(steps, done) {
    busy = true
    const finish = () => { busy = false; done?.(); lab.invalidate() }
    if (reduced) { for (const s of steps) { s.begin?.(); s.run?.(1); s.end?.() } finish(); return }
    let i = -1, t = 0, cur = null
    const next = () => { i++; t = 0; cur = steps[i] || null; cur?.begin?.() }
    next()
    lab.animate((dt) => {
      while (cur) {
        t += dt; dt = 0
        const k = cur.d > 0 ? Math.min(1, t / cur.d) : 1
        cur.run?.(ease(k))
        if (k < 1) return true
        cur.end?.(); next()
      }
      finish(); return false
    })
  }
  /** Move obj to { p, r } (r: partial Euler angles); either may be a function evaluated when the step starts. */
  const move = (obj, to, d, extra) => {
    let fp, fr, tp, tr
    return {
      d,
      begin() {
        const T = typeof to === 'function' ? to() : to
        fp = obj.position.clone(); fr = { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z }
        tp = T.p || fp; tr = { ...fr, ...(T.r || {}) }
      },
      run(k) {
        obj.position.lerpVectors(fp, tp, k)
        obj.rotation.set(fr.x + (tr.x - fr.x) * k, fr.y + (tr.y - fr.y) * k, fr.z + (tr.z - fr.z) * k)
        extra?.(k)
      },
    }
  }
  const wait = (d, run) => ({ d, run })
  const now = (fn) => ({ d: 0, end: fn })
  // The flask is lifted off the tile and set down in front (or back), with a small arc.
  const flaskTo = (target) => {
    let from
    return { d: 0.6, begin() { from = flask.position.clone() }, run(k) { flask.position.lerpVectors(from, target, k); flask.position.y += Math.sin(PI * k) * 0.025 } }
  }

  // Filling the burette: funnel in, pour the NaOH from its beaker, funnel out.
  function playFill(fromReading, toReading) {
    fillAnimating = true
    const rest = naohBeaker.userData.home
    const liq = naohBeaker.children[1]
    const lipX = 0.02, lipY = BUR_TOP + 0.085, cupY = BUR_TOP + 0.055
    play([
      move(fun, { p: v3(FUNNEL_HOME.x, BUR_TOP + 0.12, FUNNEL_HOME.z) }, 0.45),
      move(fun, { p: v3(0, BUR_TOP + 0.12, 0) }, 0.45),
      move(fun, { p: v3(0, BUR_TOP - 0.035, 0) }, 0.3),
      move(naohBeaker, { p: v3(0.16, BUR_TOP + 0.12, 0) }, 0.7),
      move(naohBeaker, { p: v3(0.097, BUR_TOP + 0.15, 0), r: { z: 1.9 } }, 0.45),
      now(() => {
        if (liq) liq.visible = false
        stream.scale.y = lipY - cupY; stream.position.set(lipX, (lipY + cupY) / 2, 0); stream.visible = true
      }),
      wait(1.4, (k) => bur.userData.setLevel(fromReading + (toReading - fromReading) * k, true)),
      now(() => { stream.visible = false; if (liq) liq.visible = true }),
      move(naohBeaker, { p: v3(0.16, BUR_TOP + 0.12, 0), r: { z: 0 } }, 0.4),
      move(naohBeaker, { p: rest }, 0.7),
      // Remove the funnel before titrating (drips from it would change the reading).
      move(fun, { p: v3(0, BUR_TOP + 0.12, 0) }, 0.3),
      move(fun, { p: v3(FUNNEL_HOME.x, BUR_TOP + 0.12, FUNNEL_HOME.z) }, 0.45),
      move(fun, { p: FUNNEL_HOME }, 0.45),
    ], () => {
      fillAnimating = false
      stream.visible = false
      if (last) bur.userData.setLevel(last.burette.reading, last.burette.filled)
    })
  }

  // Pipetting 25.0 cm³ of acid into the flask.
  function playPipette() {
    deferFlask++
    const bx = acidBeaker.position.x, bz = acidBeaker.position.z
    const fz = FLASK_FRONT.z
    const wheel = pip.userData.wheel
    play([
      flaskTo(FLASK_FRONT),
      move(pip, { p: v3(-0.3, B + 0.22, 0.2), r: { z: 0 } }, 0.7),
      move(pip, { p: v3(bx, B + 0.16, bz) }, 0.45),
      move(pip, { p: v3(bx, B + 0.012, bz) }, 0.45),
      wait(0.9, (k) => { pip.userData.setFill(k); wheel.rotation.y = k * 6 }),       // turn the filler wheel: acid rises to the mark
      move(pip, { p: v3(bx, B + 0.24, bz) }, 0.5),
      move(pip, { p: v3(0, B + 0.24, fz) }, 0.6),
      move(pip, { p: v3(0, B + 0.12, fz) }, 0.4),
      wait(1.0, (k) => { pip.userData.setFill(1 - k); if (k > 0.25 && deferFlask) { deferFlask--; applyFlask(last) } }),
      wait(0.35),                                                                    // touch the tip on the inside of the flask
      move(pip, { p: v3(0, B + 0.24, fz) }, 0.4),
      move(pip, { p: v3(-0.3, B + 0.22, 0.2) }, 0.6),
      move(pip, PIP_HOME, 0.7),
      flaskTo(FLASK_HOME),
    ], () => {
      pip.userData.setFill(0)
      if (deferFlask) { deferFlask--; applyFlask(last) }
    })
  }

  // Two drops of indicator from the dropper of the chosen bottle.
  function playDropper(id) {
    const entry = bottles.find(x => x.id === id)
    if (!entry) { if (deferFlask) deferFlask--; busy = false; applyFlask(last); return }
    const { b } = entry
    const dr = b.userData.dropper, home = dr.userData.home
    const aboveFlask = () => ({ p: v3(FLASK_FRONT.x, B + 0.215, FLASK_FRONT.z).sub(b.position) })
    const drip = () => now(() => spawnDrop(lab.worldPos(dr, -0.003), FLASK_FRONT.y + 0.002 + Math.max(0.006, liquidHeight(last?.flask.volume || 25)), INDICATOR_LIQUID[id]) && kickDrops())
    play([
      flaskTo(FLASK_FRONT),
      move(dr, { p: home.clone().add(v3(0, 0.1, 0)) }, 0.4),
      move(dr, aboveFlask, 0.6),
      drip(), wait(0.45), drip(), wait(0.5),
      now(() => { if (deferFlask) { deferFlask--; applyFlask(last) } }),
      wait(0.3),
      move(dr, () => ({ p: home.clone().add(v3(0, 0.1, 0)) }), 0.6),
      move(dr, { p: home }, 0.35),
      flaskTo(FLASK_HOME),
    ], () => { if (deferFlask) { deferFlask--; applyFlask(last) } })
  }

  function swirl() {
    if (reduced || swirling || busy) return
    swirling = true
    let t = 0
    lab.animate((dt) => {
      t += dt
      const k = Math.min(1, t / 1.1), a = 0.07 * Math.sin(PI * k), phi = 2 * PI * 2.5 * k
      flask.rotation.x = a * Math.sin(phi); flask.rotation.z = a * Math.cos(phi)
      if (k >= 1) { flask.rotation.set(0, 0, 0); swirling = false; return false }
      return true
    })
  }

  function squeezeWash() {
    if (reduced) return
    const sq = wash.userData.squeeze
    let t = 0
    lab.animate((dt) => {
      t += dt
      const k = Math.min(1, t / 0.6), s = 1 - 0.1 * Math.sin(PI * k)
      sq.scale.set(s, 1, s)
      return k < 1
    })
  }

  // ── Press and hold the tap ────────────────────────────
  const stopRun = () => {
    if (!hold) return
    clearTimeout(hold.timer); clearInterval(hold.interval)
    hold.stopped = true
    running = false
    setTap(false)
  }
  const handlers = {
    holdStart(p) {
      if (p.kind !== 'tap') return
      if (busy) { say('Wait until the flask is back under the burette.'); hold = null; return }
      hold = { ticks: 0, stopped: false, failed: false }
      const h = hold
      setTap(true)
      h.timer = setTimeout(() => {
        if (hold !== h || h.stopped) return
        running = true; kickDrops()
        const tick = () => {
          if (hold !== h || h.stopped) return
          if (!lab.renderer.domElement.isConnected) { stopRun(); return }
          if (dispatch('addBase', { volume: 0.1 })) h.ticks++
          else { h.failed = true; stopRun(); say('Tap closed.', 'tap') }
        }
        tick()
        if (!h.stopped) h.interval = setInterval(tick, 150)
      }, 250)
    },
    holdEnd() {
      const h = hold
      if (!h) return
      stopRun(); hold = null
      if (!h.ticks && !h.failed) dispatch('addBase', { volume: 0.05 })     // a short press is one drop
    },
    hover(p) { onHover(p ? hintFor(p) : null) },
  }
  lab.setHandlers(handlers)

  const indName = (id) => INDICATORS[id]?.name || id
  const acidName = () => last?.acid?.name || 'Acid'
  function hintFor(p) {
    switch (p.kind) {
      case 'flask': {
        const f = last?.flask
        const what = f?.hasAcid ? 'Conical flask: ' + f.colourName : 'Conical flask (250 cm³): empty'
        return what + (armed ? '. Click to add 2 drops of ' + indName(armed).toLowerCase() : '. Click to swirl')
      }
      case 'burette':
        return last?.burette.filled
          ? 'Burette (50 cm³) of sodium hydroxide. Read the scale close-up in the controls panel'
          : 'Burette (50 cm³): empty. Click the sodium hydroxide or the funnel to fill it'
      case 'acid': return acidName() + ', ? M: click to pipette 25.0 cm³ into the flask'
      case 'indicator': return indName(p.id) + ' indicator: click to choose it, then click the flask to add 2 drops' + (last?.indicatorChosen === p.id ? ' (chosen)' : '')
      default: return p.label || null
    }
  }

  let shownAcid = null
  const setAcidLabel = (acid) => {
    const key = acid?.id || ''
    if (key === shownAcid) return
    shownAcid = key
    acidBottle.userData.label.userData.setText((acid?.name || 'Acid') + '\n? M')
    acidBeaker.userData.tag?.userData.setText(acid?.id === 'CH3COOH' ? 'CH₃COOH' : acid?.id || 'Acid')
  }

  return {
    onPick(p) {
      switch (p.kind) {
        case 'naoh': case 'funnel':
          if (busy) { say('Wait for the apparatus to be put down.'); return }
          if (dispatch('fillBurette')) say('Filling the burette with sodium hydroxide through the funnel; the funnel is removed afterwards.', p.kind)
          return
        case 'acid': case 'pipette':
          if (busy) { say('Wait for the apparatus to be put down.'); return }
          if (dispatch('pipetteAcid')) say('Pipetting 25.0 cm³ of ' + acidName().toLowerCase() + ' into the conical flask.', p.kind)
          return
        case 'indicator':
          if (last?.indicatorChosen === p.id || dispatch('chooseIndicator', { indicator: p.id })) {
            armed = p.id
            say(indName(p.id) + ' chosen: click the flask to add 2 drops.', 'indicator')
          }
          return
        case 'flask':
          if (armed) {
            if (busy) { say('Wait for the apparatus to be put down.'); return }
            const id = armed
            armed = null
            busy = true; deferFlask++
            if (!dispatch('addIndicator')) { busy = false; deferFlask--; return }
            say('2 drops of ' + indName(id).toLowerCase() + ' added.', 'indicator')
            playDropper(id)
          } else { swirl(); say(last?.flask.hasAcid ? 'Swirling the flask: ' + last.flask.colourName + '.' : 'The flask is empty.', 'flask') }
          return
        case 'wash':
          squeezeWash()
          say('Rinse the inside of the flask with distilled water from the wash bottle; this does not change the amount of acid.', 'wash')
          return
        default:
          if (p.label || hintFor(p)) say(p.label || hintFor(p), p.kind)
      }
    },
    update(view) {
      last = view
      setAcidLabel(view.acid)
      const sameRun = prev && prev.run === view.run
      const fills = view.burette.fills ?? 0, prevFills = prev?.burette.fills ?? 0

      // Burette: animate a fill, otherwise follow the reading.
      if (prev && fills > prevFills && view.burette.filled && !busy && !reduced) {
        playFill(prev.burette.filled && prev.burette.reading != null ? prev.burette.reading : 50, view.burette.reading)
      } else if (!fillAnimating) bur.userData.setLevel(view.burette.reading, view.burette.filled)
      // Drops for alkali added from the controls panel or a single tap click.
      if (sameRun && fills === prevFills && prev.burette.reading != null && view.burette.reading > prev.burette.reading + 1e-6 && !running && !low) {
        queued = Math.min(6, queued + Math.max(1, Math.round((view.burette.reading - prev.burette.reading) / 0.1)))
        kickDrops()
      } else if (sameRun && running) kickDrops()

      // Flask: pipetting and the first indicator drops are animated.
      if (sameRun && !prev.flask.hasAcid && view.flask.hasAcid && !busy && !reduced) playPipette()
      else if (sameRun && view.flask.hasAcid && !prev.flask.indicator && view.flask.indicator && !busy && !reduced) { busy = true; deferFlask++; playDropper(view.flask.indicator) }
      if (!sameRun) { if (!busy) { flask.position.copy(FLASK_HOME); deferFlask = 0 } }
      if (!deferFlask) applyFlask(view)

      // Chosen indicator: raised slightly with a ring.
      bottles.forEach(({ id, b }) => { b.position.y = B + (view.indicatorChosen === id ? 0.006 : 0) })
      const ch = bottles.find(x => x.id === view.indicatorChosen)
      ring.visible = !!ch
      if (ch) ring.position.set(ch.b.position.x, B + 0.002, ch.b.position.z)
      if (armed && view.indicatorChosen !== armed) armed = null

      prev = view
      lab.invalidate()
    },
    view: { pos: [0.12, 1.4, 1.12], target: [-0.02, 1.08, 0.02] },
  }
}
