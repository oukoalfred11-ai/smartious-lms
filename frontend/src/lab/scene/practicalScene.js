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
 */
import * as THREE from 'three'
import * as E from './equipment.js'
import { buildModel, footprint, plate, wrapText, LCD } from './apparatus3d.js'
import { apparatusName } from '../../../../shared/lab/apparatus.js'

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

export function buildPracticalScene(lab, { def, dispatch, onSelect }) {
  const P = def?.practical || {}
  const iv = P.iv || null
  const readingDefs = [...(P.constants || []), ...(P.measures || [])]
  const defByKey = Object.fromEntries(readingDefs.map(r => [r.key, r]))
  const keysByInstrument = {}
  for (const r of readingDefs) if (r.instrument) (keysByInstrument[r.instrument] ||= []).push(r.key)
  const stock = [...new Set(P.stockroom || [])]

  // Bench width: the stockroom must fit on three rows.
  const foot = (id) => (id === IV_SLOT ? IV_FOOT : footprint(id))
  let W = 2.4
  while (W < 4.4 && packRows(stock, foot, W - 0.3).length > 3) W += 0.2
  lab.add(E.bench({ width: W, depth: DEPTH }))
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

  const add = (obj, pick) => { lab.add(obj, pick ? { pick } : {}); softenShadows(obj); objects.push(obj); return obj }
  const clear = () => {
    for (const o of objects) lab.remove(o)
    objects = []; placed = []; displays = {}; shown = {}; ivCard = null; ivText = ''; chain = []; hangAt = null; lastLevel = null
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
        chain.push({ model, wrap })
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

  function rehang() {
    if (!hangAt) return
    let top = hangAt.y
    for (const { model, wrap } of chain) {
      const t = model.userData.hangTop ? model.userData.hangTop() : measure(model).h
      wrap.position.set(hangAt.x, top - t, hangAt.z)
      top = wrap.position.y + (model.userData.hangBottom ?? 0) + 0.004
    }
  }

  function format(key, v, withSymbol) {
    const r = defByKey[key]
    if (v == null || !Number.isFinite(v)) return '----'
    const s = v.toFixed(decimalsOf(r?.resolution)) + (r?.unit ? ' ' + r.unit : '')
    return withSymbol ? (r?.symbol || r?.label || key) + ' = ' + s : s
  }

  return {
    onPick(p) {
      if (p?.kind === 'instrument') for (const key of p.keys || []) dispatch('measure', { key })
      onSelect(p)
    },
    update(view) {
      if (!view) return
      const collected = Array.isArray(view.collected) ? view.collected : null
      const key = JSON.stringify(collected)
      if (key !== layoutKey) {
        clear()
        if (collected) buildBench(collected); else buildStockroom()
        layoutKey = key
      }
      // Which reading changed last, per instrument.
      const rd = view.readings || {}
      for (const [k, v] of Object.entries(rd)) {
        if (v !== prevReadings[k] && defByKey[k]?.instrument) lastKey[defByKey[k].instrument] = k
      }
      prevReadings = { ...rd }
      for (const [id, set] of Object.entries(displays)) {
        const keys = keysByInstrument[id] || []
        let k = lastKey[id]
        if (k == null || rd[k] === undefined) k = keys.find(x => rd[x] !== undefined)
        const text = k != null && rd[k] !== undefined ? format(k, rd[k], !!set.card) : '----'
        if (shown[id] !== text) { set(text); shown[id] = text }
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
          lastLevel = f
        }
      }
      lab.invalidate()
    },
    dispose() { clear() },
    view: { pos: [0, BENCH_Y + 0.72, 0.7 + 0.5 * W], target: [0, BENCH_Y + 0.12, -0.05] },
  }
}
