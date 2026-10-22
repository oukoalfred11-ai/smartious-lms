/**
 * practicalScene.js — one generic 3D bench for every measurement practical
 * built with definePractical() (shared/lab/practical.js).
 *
 *   buildPracticalScene(lab, { def, dispatch, onSelect }) → { onPick, update, view, dispose }
 *
 * Before the student collects anything the bench shows the stockroom: every
 * item of def.practical.stockroom on a tiered shelf, pickable as
 * { kind: 'stock', id }. Afterwards only view.collected is shown, laid out
 * from footprint(id), with the reading instruments in the front row.
 * Clicking an instrument dispatches 'measure' for every reading it makes;
 * displays show the engine's latest readings. Nothing here decides a result:
 * levels and stretches are visual cues driven by the independent variable.
 *
 * Hands-on bench (view.bench === 2): scales show no number (they are read
 * from the close-ups in the controls panel; digital displays still show
 * theirs). Click the goggles to put them on, TARE by the balance, a mass
 * hanger to add one mass, the stopwatch to start it and again to stop it
 * (oscillations counted from the swing you watch). The pendulum swings at
 * its real period while it is being timed, the stopwatch ticks, a loaded
 * spring bounces until it settles, the resistance wire glows as it warms
 * and lamps light up.
 */
import * as THREE from 'three'
import * as E from './equipment.js'
import { buildModel, footprint, plate, wrapText, LCD } from './apparatus3d.js'
import { apparatusName } from '../../../../shared/lab/apparatus.js'
import { createWiring, wirePart } from './wiring.js'
import { addLabRoom } from './labRoom.js'

const { BENCH_Y } = E
const DEPTH = 0.9
const GAP = 0.05
const RISER_H = 0.1
const IV_SLOT = '__iv'
const IV_FOOT = 0.2

const decimalsOf = (res) => (res > 0 ? Math.max(0, Math.ceil(-Math.log10(res) - 1e-9)) : 2)
const clamp01 = (v) => Math.min(1, Math.max(0, v))

function measure(obj) {
  obj.updateMatrixWorld(true)
  const b = new THREE.Box3().setFromObject(obj)
  if (b.isEmpty()) return { cx: 0, cz: 0, w: 0.1, h: 0.1, d: 0.1, minY: 0 }
  return { cx: (b.min.x + b.max.x) / 2, cz: (b.min.z + b.max.z) / 2, w: b.max.x - b.min.x, h: b.max.y - b.min.y, d: b.max.z - b.min.z, minY: b.min.y }
}

/** Greedy rows of ids whose footprints fit in maxW. */
function packRows(ids, foot, maxW) {
  const rows = [[]]
  let used = 0
  for (const id of ids) {
    const w = foot(id)
    const row = rows[rows.length - 1]
    if (row.length && used + GAP + w > maxW) { rows.push([id]); used = w }
    else { row.push(id); used += (row.length > 1 ? GAP : 0) + w }
  }
  return rows.filter(r => r.length)
}

/** Glass and labels should not cast solid shadows. */
function softenShadows(root) {
  root.traverse(o => { if (o.isMesh) { const m = Array.isArray(o.material) ? o.material[0] : o.material; if (m?.transparent) o.castShadow = false } })
}

/** A small tent card on the bench; setText(t). */
function tentCard(text, w = 0.12, h = 0.04, colours = {}) {
  const g = new THREE.Group()
  const base = new THREE.Mesh(new THREE.BoxGeometry(w + 0.01, 0.006, 0.035), new THREE.MeshStandardMaterial({ color: '#2B2F36', roughness: 0.6 }))
  base.position.y = 0.003
  const back = new THREE.Mesh(new THREE.BoxGeometry(w + 0.006, h + 0.006, 0.003), new THREE.MeshStandardMaterial({ color: '#2B2F36', roughness: 0.6 }))
  const face = plate(text, w, h, { bg: '#FFFFFF', fg: '#1A1A1A', ...colours })
  const tilt = new THREE.Group()
  back.position.set(0, h / 2 + 0.003, 0)
  face.position.set(0, h / 2 + 0.003, 0.0024)
  tilt.add(back, face)
  tilt.rotation.x = -0.35
  tilt.position.set(0, 0.006, 0)
  g.add(base, tilt)
  g.userData.setText = (t) => face.userData.setText(t)
  return g
}

export function buildPracticalScene(lab, { def, dispatch, onSelect, onHover = () => {} }) {
  const P = def?.practical || {}
  const iv = P.iv || null
  const readingDefs = [...(P.constants || []), ...(P.measures || [])]
  const defByKey = Object.fromEntries(readingDefs.map(r => [r.key, r]))
  const keysByInstrument = {}
  for (const r of readingDefs) if (r.instrument) (keysByInstrument[r.instrument] ||= []).push(r.key)
  const stock = [...new Set(P.stockroom || [])]
  const circuit = P.circuit || null
  let wiring = null
  const hoverLabel = (p) => p?.label || (p?.kind === 'instrument' ? apparatusName(p.id) + ': click to take a reading' : p?.kind === 'stock' ? apparatusName(p.id) : p?.id === 'switch' && circuit ? 'Switch: click to open or close' : p?.id ? apparatusName(p.id) : null)
  const setHandlers = () => lab.setHandlers({ ...(wiring?.handlers || {}), hover: (p) => onHover(hoverLabel(p)) })
  setHandlers()

  // Bench width: the stockroom must fit on three rows.
  const foot = (id) => (id === IV_SLOT ? IV_FOOT : footprint(id))
  let W = 2.4
  while (W < 4.4 && packRows(stock, foot, W - 0.3).length > 3) W += 0.2
  lab.add(E.bench({ width: W, depth: DEPTH }))
  addLabRoom(lab, { width: W, depth: DEPTH })     // the school laboratory around the bench
  const wallZ = -DEPTH / 2 - 0.25

  let objects = []                 // everything added for the current layout
  let placed = []                  // { id, model, wrap }
  let displays = {}                // instrument id → (text) => void
  let shown = {}                   // instrument id → text last drawn
  let ivCard = null, ivText = ''
  let chain = []                   // hung items: [{ model, wrap }]
  let hangAt = null                // world point the chain hangs from
  let layoutKey = null
  let lastLevel = null
  let prevReadings = {}
  const lastKey = {}
  // Hands-on bench state (view.bench === 2).
  let lastView = null, hands = null
  let extrasBuilt = false, goggles = null, statusCard = null, statusText = ''
  let materials = [], tareCards = {}           // for the set-up quest
  let timerStartedAt = null, animating = false, lastTick = ''
  const timedKey = (P.measures || []).find(m => m.instrument === 'stopwatch')?.key || null

  const add = (obj, pick) => { lab.add(obj, pick ? { pick } : {}); softenShadows(obj); objects.push(obj); return obj }
  const clear = () => {
    if (wiring) { wiring.dispose(); wiring = null; setHandlers() }
    for (const o of objects) lab.remove(o)
    objects = []; placed = []; displays = {}; shown = {}; ivCard = null; ivText = ''; chain = []; hangAt = null; lastLevel = null
    extrasBuilt = false; goggles = null; statusCard = null; statusText = ''
    materials = []; tareCards = {}
  }

  /** Put a model into a wrapper so its footprint centre is at (x, y, z). */
  function placeModel(id, model, x, y, z, pick) {
    const m = measure(model)
    model.position.x -= m.cx
    model.position.z -= m.cz
    const wrap = new THREE.Group()
    wrap.add(model)
    wrap.position.set(x, y, z)
    add(wrap, pick)
    placed.push({ id, model, wrap })
    return { wrap, m }
  }

  function placeRow(ids, rowZ, rowY, each) {
    const total = ids.reduce((s, id) => s + foot(id), 0) + GAP * Math.max(0, ids.length - 1)
    let x = -total / 2
    for (const id of ids) { const w = foot(id); each(id, x + w / 2, rowZ, rowY); x += w + GAP }
  }

  // ── Stockroom ──────────────────────────────────────────
  function buildStockroom() {
    const riser = new THREE.Mesh(new THREE.BoxGeometry(W - 0.1, RISER_H, 0.28), new THREE.MeshStandardMaterial({ color: '#DADFE5', roughness: 0.7 }))
    riser.position.set(0, BENCH_Y + RISER_H / 2, -0.29)
    add(riser)
    const sign = plate('STOCKROOM  ·  choose your apparatus', 0.6, 0.06, { bg: '#1F2A37', fg: '#FFFFFF' })
    sign.position.set(0, BENCH_Y + 0.75, wallZ + 0.002)
    add(sign)
    // Build every model once, tallest to the back.
    const models = Object.fromEntries(stock.map(id => [id, buildModel(id)]))
    const heights = Object.fromEntries(stock.map(id => [id, measure(models[id]).h]))
    const order = [...stock].sort((a, b) => heights[b] - heights[a])
    const rows = packRows(order, foot, W - 0.3)
    const rowDefs = [{ z: -0.29, y: RISER_H, shelf: true }, { z: -0.01, y: 0 }, { z: 0.25, y: 0 }]
    rows.forEach((ids, r) => {
      const rd = rowDefs[Math.min(r, rowDefs.length - 1)]
      const z = rd.z + Math.max(0, r - rowDefs.length + 1) * 0.2
      placeRow(ids, z, rd.y, (id, x) => {
        const pick = { kind: 'stock', id }
        const { wrap, m } = placeModel(id, models[id], x, BENCH_Y + rd.y, z, pick)
        const name = wrapText(apparatusName(id), 16, 2)
        if (rd.shelf) {
          const tag = plate(name, Math.min(foot(id) - 0.01, 0.2), 0.036, { bg: '#FFFFFF', fg: '#1F2A37' })
          tag.position.set(x, BENCH_Y + RISER_H / 2, -0.29 + 0.14 + 0.0008)
          add(tag, pick)
        } else {
          const card = tentCard(name, Math.min(foot(id) - 0.01, 0.16), 0.032)
          card.position.set(0, -rd.y, Math.min(m.d / 2 + 0.03, 0.14))
          wrap.add(card); softenShadows(card)
        }
      })
    })
  }

  // ── Collected apparatus ────────────────────────────────
  function buildBench(collected) {
    const have = new Set(collected)
    const isInstrument = (id) => !!keysByInstrument[id]?.length
    // Hanging chain from the stand.
    const hung = []
    if (have.has('stand_clamp')) {
      if (have.has('spring')) { hung.push('spring'); if (have.has('slotted_masses')) hung.push('slotted_masses') }
      else if (have.has('pendulum_bob')) hung.push('pendulum_bob')
    }
    const frontIds = collected.filter(id => isInstrument(id) || id === iv?.instrument).filter(id => !hung.includes(id))
    const rest = collected.filter(id => !frontIds.includes(id) && !hung.includes(id))
    const models = Object.fromEntries(collected.map(id => [id, buildModel(id)]))
    const heightOf = (id) => measure(models[id]).h
    const maxW = W - 0.3
    const packedFront = packRows(iv ? [...frontIds, IV_SLOT] : frontIds, foot, maxW)
    const backIds = [...rest].sort((a, b) => heightOf(b) - heightOf(a))
    // Front to back: instruments, any instruments that did not fit, then the
    // remaining apparatus with the tallest row furthest back.
    const rows = [...packedFront, ...packRows(backIds, foot, maxW).reverse()]
    const zs = [0.2, -0.06, -0.3]
    rows.forEach((ids, r) => {
      const z = zs[Math.min(r, zs.length - 1)] - Math.max(0, r - zs.length + 1) * 0.12
      placeRow(ids, z, 0, (id, x) => {
        if (id === IV_SLOT) {
          ivCard = tentCard('', 0.17, 0.06, { bg: '#1F2A37', fg: '#FFFFFF' })
          ivCard.position.set(x, BENCH_Y, z + 0.04)
          add(ivCard)
          return
        }
        const keys = keysByInstrument[id] || []
        const pick = keys.length ? { kind: 'instrument', id, keys: [...keys] } : { kind: 'apparatus', id }
        const { wrap, m } = placeModel(id, models[id], x, BENCH_Y, z, pick)
        if (keys.length) {
          if (models[id].userData.setDisplay) displays[id] = models[id].userData.setDisplay
          else {
            const card = tentCard('----', 0.11, 0.034, { ...LCD, family: '"DejaVu Sans Mono", "Courier New", monospace' })
            card.position.set(0, 0, Math.min(m.d / 2 + 0.03, 0.2))
            wrap.add(card); softenShadows(card)
            displays[id] = card.userData.setText
            displays[id].card = true
          }
        }
      })
    })
    // Hang the chain from the stand's clamp.
    const stand = placed.find(p => p.id === 'stand_clamp')
    if (stand && hung.length && stand.model.userData.hangPoint) {
      stand.wrap.updateMatrixWorld(true)
      hangAt = stand.model.localToWorld(stand.model.userData.hangPoint.clone())
      for (const id of hung) {
        const model = models[id]
        model.userData.hang?.(0.38)
        const keys = keysByInstrument[id] || []
        const pick = keys.length ? { kind: 'instrument', id, keys: [...keys] } : { kind: 'apparatus', id }
        const wrap = new THREE.Group(); wrap.add(model)
        add(wrap, pick)
        placed.push({ id, model, wrap })
        chain.push({ id, model, wrap })
        if (keys.length) {
          if (model.userData.setDisplay) displays[id] = model.userData.setDisplay
          else {
            const card = tentCard('----', 0.11, 0.034, { ...LCD, family: '"DejaVu Sans Mono", "Courier New", monospace' })
            card.position.set(hangAt.x, BENCH_Y, hangAt.z + 0.12)
            add(card, pick)
            displays[id] = card.userData.setText
            displays[id].card = true
          }
        }
      }
      rehang()
    }
  }

  /** Reagents and materials listed in the practical, as labelled bottles at the back of the bench. */
  function placeMaterials() {
    const list = (def.materials || []).slice(0, 10)
    if (!list.length) return
    const caps = ['#1F5FAF', '#C62828', '#2E7D32', '#E2B21F', '#6A1B9A', '#00838F', '#5D4037', '#AD1457', '#455A64', '#EF6C00']
    const step = Math.min(0.11, (W - 0.4) / list.length)
    list.forEach((name, i) => {
      const b = E.bottle(wrapText(name, 14, 2), caps[i % caps.length])
      b.position.set(-((list.length - 1) * step) / 2 + i * step, BENCH_Y, -DEPTH / 2 + 0.08)
      add(b, { kind: 'material', label: name, name })
      materials.push({ name, b })
    })
  }

  /** Make the circuit parts on the bench wireable and add a tray of leads. */
  function wireBench() {
    if (!circuit) return
    wiring = createWiring(lab, { dispatch, onSelect, onHover })
    const used = {}
    for (const part of circuit.parts) {
      const at = placed.find(p => p.id === part.apparatus)
      if (!at) continue
      const k = used[part.apparatus] = (used[part.apparatus] ?? -1) + 1
      wirePart(wiring, at.model, part, { index: k })
    }
    wiring.tray(-W / 2 + 0.2, 0.36)
    setHandlers()
  }

  function rehang() {
    if (!hangAt) return
    let top = hangAt.y
    for (const c of chain) {
      const { model, wrap } = c
      const t = model.userData.hangTop ? model.userData.hangTop() : measure(model).h
      wrap.position.set(hangAt.x, top - t, hangAt.z)
      wrap.rotation.z = 0
      c.baseY = wrap.position.y                    // rest position, for the swing
      top = wrap.position.y + (model.userData.hangBottom ?? 0) + 0.004
    }
  }

  // ── Hands-on bench extras ─────────────────────────────
  function buildExtras(H) {
    extrasBuilt = true
    if (H.needsGoggles) {
      const have = placed.find(p => p.id === 'goggles')
      if (have) goggles = have.wrap
      else {
        goggles = buildModel('goggles')
        goggles.position.set(W / 2 - 0.22, BENCH_Y, 0.34)
        add(goggles, { kind: 'goggles', label: 'Safety goggles: click to put them on' })
      }
    }
    statusCard = tentCard('', 0.2, 0.05, { bg: '#1F2A37', fg: '#FFFFFF' })
    statusCard.position.set(W / 2 - 0.5, BENCH_Y, 0.36)
    add(statusCard)
    for (const id of H.tareInstruments || []) {
      const at = placed.find(p => p.id === id)
      if (!at) continue
      const card = tentCard('TARE', 0.05, 0.022, { bg: '#C62828', fg: '#FFFFFF' })
      card.position.set(at.wrap.position.x + 0.09, BENCH_Y, at.wrap.position.z + 0.12)
      add(card, { kind: 'tare', id, label: 'TARE: zero the balance with the pan empty' })
      tareCards[id] = card
    }
  }

  const swTime = (t) => (t < 60 ? t.toFixed(1) + '0' : Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0') + '.' + Math.floor((t % 1) * 10) + '0')
  /** One animation frame: ticking stopwatch, swinging pendulum, bouncing load. Returns true while still moving. */
  function frame() {
    if (!hands) return false
    const running = !!hands.timer?.running
    const t = running && timerStartedAt != null ? (performance.now() - timerStartedAt) / 1000 : 0
    if (running && displays.stopwatch) {
      const txt = swTime((hands.timer.acc || 0) + t)
      if (txt !== lastTick) { displays.stopwatch(txt); shown.stopwatch = txt; lastTick = txt }
    }
    const motion = hands.motion
    const bob = chain.find(c => c.id === 'pendulum_bob')
    if (bob && hangAt && motion?.period && running) {
      const a = 0.16 * Math.cos(2 * Math.PI * t / motion.period)
      const L = hangAt.y - bob.baseY
      bob.wrap.rotation.z = a
      bob.wrap.position.x = hangAt.x + L * Math.sin(a)
      bob.wrap.position.y = hangAt.y - L * Math.cos(a)
    }
    const bouncing = !hands.settled && chain.length && iv?.instrument === 'slotted_masses'
    if (bouncing) {
      const dy = 0.006 * Math.sin(2 * Math.PI * performance.now() / 650)
      rehang()
      for (const c of chain) c.wrap.position.y += dy
    }
    return running || !!bouncing
  }
  function animateHands() {
    if (animating) return
    animating = true
    lab.animate(() => {
      const go = frame()
      if (!go) { animating = false; rehang(); lastTick = '' }
      return go
    })
  }
  function updateHands(view) {
    const H = view.hands
    hands = H
    if (!extrasBuilt) buildExtras(H)
    if (goggles) goggles.visible = !H.goggles
    const st = H.tidy ? 'Bench tidied away' : H.needsGoggles && !H.goggles ? 'Put on your goggles' : H.timer?.running ? 'Stopwatch running' : H.settled ? 'Readings steady' : 'Wait: still settling'
    if (statusCard && st !== statusText) { statusCard.userData.setText(st); statusText = st }
    for (const { id, model } of placed) {
      if (id === 'resistance_wire') model.userData.setHeat?.(H.heatFrac || 0)
      if (H.glow && H.glow[id] != null) model.userData.setGlow?.(H.glow[id])
    }
    if (H.timer?.running && timerStartedAt == null) timerStartedAt = performance.now()
    if (!H.timer?.running) timerStartedAt = null
    if (H.timer?.running || !H.settled) animateHands()
  }

  function format(key, v, withSymbol) {
    const r = defByKey[key]
    if (v == null || !Number.isFinite(v)) return '----'
    const s = v.toFixed(decimalsOf(r?.resolution)) + (r?.unit ? ' ' + r.unit : '')
    return withSymbol ? (r?.symbol || r?.label || key) + ' = ' + s : s
  }

  return {
    onPick(p) {
      if (wiring?.onPick(p)) return
      if (hands) {
        // Hands-on bench: the physical steps.
        if (p?.kind === 'goggles' || p?.id === 'goggles') { if (!hands.goggles) dispatch('wearGoggles'); onSelect({ ...p, label: 'Safety goggles' }); return }
        if (p?.kind === 'tare') { dispatch('tare', { instrument: p.id }); onSelect({ ...p, label: 'Balance tared' }); return }
        if (p?.id === 'stopwatch' && timedKey) {
          if (!hands.timer?.running) dispatch('startTimer')
          else {
            const T = hands.motion?.period, el = timerStartedAt != null ? (performance.now() - timerStartedAt) / 1000 : 0
            dispatch('measure', T ? { key: timedKey, cycles: Math.max(1, Math.min(200, Math.round(el / T))) } : { key: timedKey })
          }
          onSelect({ ...p, label: 'Stopwatch' })
          return
        }
        if (p?.id === 'slotted_masses' && iv?.instrument === 'slotted_masses' && lastView) {
          dispatch('setIV', { value: Number(lastView.x) + iv.step })
          onSelect({ ...p, label: 'Added one mass' })
          return
        }
      }
      if (p?.kind === 'instrument') for (const key of p.keys || []) dispatch('measure', { key })
      if (p?.id === 'switch' && circuit?.parts.some(x => x.type === 'switch')) dispatch('toggleSwitch')
      onSelect({ ...p, label: hoverLabel(p) })
    },
    update(view) {
      if (!view) return
      const collected = Array.isArray(view.collected) ? view.collected : null
      const key = JSON.stringify(collected)
      if (key !== layoutKey) {
        clear()
        if (collected) { buildBench(collected); placeMaterials(); wireBench() } else buildStockroom()
        layoutKey = key
      }
      // Which reading changed last, per instrument.
      const rd = view.readings || {}
      for (const [k, v] of Object.entries(rd)) {
        if (v !== prevReadings[k] && defByKey[k]?.instrument) lastKey[defByKey[k].instrument] = k
      }
      prevReadings = { ...rd }
      lastView = view
      const H = view.bench === 2 ? view.hands : null
      for (const [id, set] of Object.entries(displays)) {
        const keys = keysByInstrument[id] || []
        let k = lastKey[id]
        if (k == null || rd[k] === undefined) k = keys.find(x => rd[x] !== undefined)
        let text = k != null && rd[k] !== undefined ? format(k, rd[k], !!set.card) : '----'
        if (H) {
          // Scales are read from the close-up; only real displays show a number.
          const kind = k != null ? H.kinds?.[k]?.kind : H.kinds?.[keys[0]]?.kind
          if (kind === 'stopwatch') { if (H.timer?.running) continue; text = rd[k] !== undefined ? format(k, rd[k], false) : swTime(H.timer?.acc || 0) }
          else if (kind && kind !== 'digital' && rd[k] !== undefined) text = 'see close-up'
        }
        if (shown[id] !== text) { set(text); shown[id] = text }
      }
      if (wiring) {
        wiring.update(view.wires, view.wireColours, view.maxLeads)
        placed.find(p => p.id === 'switch')?.model.userData.setClosed?.(view.switchClosed)
      }
      // Independent variable: label stand and visual level hooks.
      if (iv && collected) {
        const x = Number(view.x)
        const sym = iv.symbol ? iv.symbol + ' = ' : ''
        const t = wrapText(iv.label, 24, 1) + '\n' + sym + (Number.isFinite(x) ? x.toFixed(decimalsOf(iv.step)) : '—') + (iv.unit ? ' ' + iv.unit : '')
        if (ivCard && t !== ivText) { ivCard.userData.setText(t); ivText = t }
        const f = iv.max > iv.min && Number.isFinite(x) ? clamp01((x - iv.min) / (iv.max - iv.min)) : 0
        if (f !== lastLevel) {
          for (const { id, model } of placed) {
            const ud = model.userData
            if (ud.setLevel && (id === iv.instrument || ud.levelWith?.includes(iv.instrument))) ud.setLevel(f)
          }
          rehang()
          if (wiring) { wiring.refresh(); wiring.update(view.wires, view.wireColours, view.maxLeads) }   // a sliding contact may have moved
          lastLevel = f
        }
      }
      if (view.bench === 2 && collected) updateHands(view)
      else hands = null
      lab.invalidate()
    },
    dispose() { clear() },
    /** Set-up quest (setupQuest.js): the collected apparatus is fetched from the
     *  cupboard, the materials from the reagent rack; stockroom extras are the
     *  things to leave behind. Not used when students choose from the stockroom. */
    setup: () => {
      if (!placed.length) return null
      const seen = {}
      const items = placed.map(({ id, wrap }) => {
        const n = seen[id] = (seen[id] || 0) + 1
        return { key: n > 1 ? id + '_' + n : id, name: apparatusName(id).toLowerCase(), objects: [wrap, ...(tareCards[id] && n === 1 ? [tareCards[id]] : [])] }
      })
      if (goggles && !placed.some(p => p.id === 'goggles')) items.push({ key: 'goggles', name: 'safety goggles', objects: [goggles] })
      materials.forEach(({ name, b }, i) => items.push({ key: 'material_' + i, name: name.toLowerCase(), kind: 'reagent', objects: [b] }))
      const have = new Set(placed.map(p => p.id))
      const distractors = stock.filter(id => !have.has(id)).slice(0, 4)
        .map(id => ({ key: id, name: 'The ' + apparatusName(id).toLowerCase(), object: buildModel(id) }))
      return { bench: { minX: -W / 2 + 0.05, maxX: W / 2 - 0.05, minZ: -DEPTH / 2 + 0.01, maxZ: DEPTH / 2 - 0.02 }, items, distractors }
    },
    view: { pos: [0, BENCH_Y + 0.72, 0.7 + 0.5 * W], target: [0, BENCH_Y + 0.12, -0.05] },
  }
}
