/**
 * setupQuest.js — "set up your bench", the first part of every practical in
 * the 3D lab.
 *
 * The bench starts empty. The apparatus is in a glass-fronted cupboard at
 * the back of the bench and the reagents stand on a reagent rack; among
 * them are things this practical does not need. The student opens the
 * cupboard and carries each item to the bench (press and drag it, or tap
 * it and choose "Put it on the bench"). A needed item glides to its place
 * on the bench and the real apparatus appears there; an item that is not
 * needed is put back with a word of explanation. When everything is out,
 * "Start the practical" closes the cupboard and the bench is ready.
 *
 *   createSetupQuest(lab, { items, distractors, dispatch, say, menu, onChange })
 *     items        [{ key, name, kind: 'apparatus' | 'reagent', objects: [Object3D] }]
 *                  the scene's real objects, already in their bench places
 *     distractors  [{ key, name, kind, object }]  built for the quest only
 *   → { sync(setup), onPick(pick) → handled?, steps(), focusTarget(), finish(), dispose() }
 *
 * Progress is saved as engine actions ('setUp', see shared/lab/engine.js),
 * so a reload resumes where the student was and the teacher can see what
 * was taken out by mistake. Until an item is fetched its real objects are
 * moved to render layer 1: not drawn, not clickable, and untouched by the
 * scene's own logic (which may change their visibility).
 */
import * as THREE from 'three'
import { plate } from './apparatus3d.js'

const HIDDEN = 1
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1)
const setLayer = (root, l) => root.traverse(o => o.layers.set(l))

/** A static copy of objects' meshes, in the frame of the first object (geometry and materials shared). */
function visualCopy(objects) {
  const root = objects[0]
  root.updateMatrixWorld(true)
  const inv = root.matrixWorld.clone().invert()
  const g = new THREE.Group()
  for (const obj of objects) {
    obj.updateMatrixWorld(true)
    obj.traverse(o => {
      if (!o.isMesh || !o.visible) return
      const m = new THREE.Mesh(o.geometry, o.material)
      m.matrixAutoUpdate = false
      m.matrix.copy(inv).multiply(o.matrixWorld)
      m.castShadow = true
      g.add(m)
    })
  }
  return g
}

/** Box of an object with its own rotation and scale, as if its parent were at the origin. */
function ownBox(g) {
  const parent = g.parent, pos = g.position.clone()
  if (parent) parent.remove(g)
  g.position.set(0, 0, 0)
  g.updateMatrixWorld(true)
  const b = new THREE.Box3().setFromObject(g)
  g.position.copy(pos)
  if (parent) parent.add(g)
  return b
}

function boxOf(objects) {
  const b = new THREE.Box3()
  for (const o of objects) { o.updateMatrixWorld(true); b.expandByObject(o) }
  return b
}

const glass = () => new THREE.MeshStandardMaterial({ color: '#CFE3EE', transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0, depthWrite: false, side: THREE.DoubleSide })
const wood = (c = '#E9E4DA') => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75 })

/** Glass-fronted cupboard: body open at the front, two shelves, two doors hinged at the sides. */
function cupboard(w, h, d) {
  const g = new THREE.Group()
  // A dark slate inside, so glassware stands out.
  const body = wood('#F1EEE8'), edge = wood('#56636F')
  const t = 0.014
  const box = (bw, bh, bd, x, y, z, m = body) => { const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), m); b.position.set(x, y, z); g.add(b); return b }
  box(w, t, d, 0, t / 2, 0)                     // floor
  box(w, t, d, 0, h - t / 2, 0)                 // top
  box(t, h, d, -w / 2 + t / 2, h / 2, 0)        // sides
  box(t, h, d, w / 2 - t / 2, h / 2, 0)
  box(w, h, t, 0, h / 2, -d / 2 + t / 2, wood('#2F3B47'))   // back
  box(w - 2 * t, t * 0.6, d - t, 0, t + 0.001, t / 2, edge)  // floor lining
  const shelfY = Math.round((h * 0.48) * 1000) / 1000
  box(w - 2 * t, t * 0.8, d - t, 0, shelfY, t / 2, edge)
  const doors = []
  for (const s of [-1, 1]) {
    const hinge = new THREE.Group()
    hinge.position.set(s * (w / 2), 0, d / 2)
    const dw = w / 2 - 0.004
    const frameM = wood('#8E2234')
    const pane = new THREE.Mesh(new THREE.BoxGeometry(dw - 0.03, h - 0.04, 0.004), glass())
    pane.position.set(-s * dw / 2, h / 2, 0.006)
    const fr = new THREE.Group()
    const bar = (bw, bh, x, y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.016), frameM); b.position.set(x, y, 0.006); fr.add(b) }
    bar(dw, 0.018, -s * dw / 2, 0.009); bar(dw, 0.018, -s * dw / 2, h - 0.009)
    bar(0.018, h, -s * 0.009, h / 2); bar(0.018, h, -s * (dw - 0.009), h / 2)
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 10), new THREE.MeshStandardMaterial({ color: '#D9B44A', metalness: 0.8, roughness: 0.3 }))
    knob.position.set(-s * (dw - 0.03), h / 2, 0.02)
    hinge.add(pane, fr, knob)
    hinge.userData.side = s
    hinge.userData.pane = pane
    g.add(hinge)
    doors.push(hinge)
  }
  g.userData = { doors, shelfY, floorY: t, w, h, d }
  return g
}

/** A two-step reagent rack. */
function reagentRack(w, d) {
  const g = new THREE.Group()
  const m = wood('#B98A5A')
  const lower = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d / 2), m); lower.position.set(0, 0.01, d / 4)
  const riser = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d / 2), m); riser.position.set(0, 0.05, -d / 4)
  const back = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, 0.01), m); back.position.set(0, 0.125, -d / 2 + 0.005)
  g.add(lower, riser, back)
  g.userData = { steps: [{ y: 0.02, z: d / 4 }, { y: 0.1, z: -d / 4 }] }
  return g
}

export function createSetupQuest(lab, { items, distractors = [], dispatch, say, menu, onChange = () => {}, benchY = 0.9, bench = { minX: -1.05, maxX: 1.05, minZ: -0.43, maxZ: 0.43 } }) {
  const scene = lab.scene
  const all = []                    // { key, name, kind, need, real?, copy, home: {parent, pos, scale}, fit }
  let open = false, fetched = new Set(), wrong = [], finished = false, busy = 0

  // Where everything goes on the bench.
  const target = new THREE.Box3()
  for (const it of items) target.union(boxOf(it.objects))

  // ── Furniture at the back of the bench, where it covers the fewest places ──
  const nApp = items.filter(i => i.kind !== 'reagent').length + distractors.filter(d => d.kind !== 'reagent').length
  const nRea = items.filter(i => i.kind === 'reagent').length + distractors.filter(d => d.kind === 'reagent').length
  const CW = Math.min(1.0, Math.max(0.6, 0.11 * Math.ceil(nApp / 2) + 0.06)), CH = 0.6, CD = 0.3
  const RW = Math.min(0.9, Math.max(0.36, 0.1 * Math.ceil(nRea / 2) + 0.06)), RD = 0.26
  const backZ = bench.minZ
  const itemBoxes = items.map(it => boxOf(it.objects))
  const overlap = (x, w, z0, z1) => itemBoxes.reduce((a, b) => a + Math.max(0, Math.min(x + w / 2, b.max.x) - Math.max(x - w / 2, b.min.x)) * (b.max.z > z0 && b.min.z < z1 ? 1 : 0), 0)
  const spot = (w, d, avoid) => {
    let best = null
    for (let x = bench.minX + w / 2 + 0.02; x <= bench.maxX - w / 2 - 0.02; x += 0.05) {
      if (avoid && Math.abs(x - avoid.x) < (w + avoid.w) / 2 + 0.04) continue
      const cost = overlap(x, w, backZ, backZ + d) + Math.abs(x) * 0.002
      if (!best || cost < best.cost) best = { x, cost }
    }
    return best ? best.x : 0
  }
  // Cupboard and rack side by side (one place to look), where they cover the fewest places.
  const hasRack = nRea > 0
  const pairW = hasRack ? CW + 0.06 + RW : CW
  const px = spot(pairW, Math.max(CD, RD))
  const cx = px - pairW / 2 + CW / 2
  const rx = px + pairW / 2 - RW / 2
  const cab = cupboard(CW, CH, CD)
  cab.position.set(cx, benchY, backZ + CD / 2 + 0.01)
  lab.add(cab)
  for (const door of cab.userData.doors) lab.makePickable(door, { kind: 'cupboard', name: 'Apparatus cupboard', label: 'Apparatus cupboard: click to open it' })
  const sign = plate('APPARATUS', Math.min(0.36, CW * 0.6), 0.05, { bg: '#1F2A37', fg: '#FFFFFF' })
  sign.position.set(0, CH + 0.03, CD / 2 - 0.02); cab.add(sign)
  // The reagent rack, when the practical has reagents.
  const rack = hasRack ? reagentRack(RW, RD) : null
  if (rack) {
    rack.position.set(rx, benchY, backZ + RD / 2 + 0.01)
    lab.add(rack)
    const rsign = plate('REAGENTS', Math.min(0.3, RW * 0.7), 0.045, { bg: '#2E7D32', fg: '#FFFFFF' })
    rsign.position.set(0, 0.2, -RD / 2 + 0.012); rack.add(rsign)
  }

  // ── Copies in the cupboard and on the rack ──
  const slotFor = (list, i, n, kind) => {
    if (kind === 'reagent') {
      const per = Math.ceil(n / 2), row = i < per ? 0 : 1, col = row ? i - per : i, cols = row ? n - per : per
      const st = rack.userData.steps[row]
      const sw = (RW - 0.04) / Math.max(1, cols)
      return { parent: rack, x: -RW / 2 + 0.02 + sw * (col + 0.5), y: st.y, z: st.z, w: sw - 0.008, h: 0.22, d: RD / 2 - 0.02 }
    }
    const per = Math.ceil(n / 2), row = i < per ? 0 : 1, col = row ? i - per : i, cols = row ? n - per : per
    const sw = (CW - 0.04) / Math.max(1, cols)
    const y = row === 0 ? cab.userData.shelfY + 0.006 : cab.userData.floorY
    const h = row === 0 ? CH - cab.userData.shelfY - 0.03 : cab.userData.shelfY - 0.03
    return { parent: cab, x: -CW / 2 + 0.02 + sw * (col + 0.5), y, z: 0.01, w: sw - 0.01, h, d: CD - 0.06 }
  }
  const entries = [
    ...items.map(it => ({ key: it.key, name: it.name, kind: it.kind || 'apparatus', need: true, real: it.objects, src: it.objects })),
    ...distractors.map(d => ({ key: d.key, name: d.name, kind: d.kind || 'apparatus', need: false, src: [d.object], built: d.object })),
  ]
  // Mix the needed items and the distractors so the right one has to be found.
  const order = (k) => { let h = 0; for (const c of k) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h }
  const byKind = { apparatus: [], reagent: [] }
  for (const e of [...entries].sort((a, b) => order(a.key) - order(b.key))) (e.kind === 'reagent' ? byKind.reagent : byKind.apparatus).push(e)
  for (const [kind, list] of Object.entries(byKind)) {
    list.forEach((e, i) => {
      if (e.built) { e.built.position.set(0, 0, 0); e.built.updateMatrixWorld(true) }
      const copy = visualCopy(e.src)
      // Keep the real thing's turn and size; fit it into its slot.
      if (e.real) { const q = new THREE.Quaternion(); const sc = new THREE.Vector3(); e.real[0].matrixWorld.decompose(new THREE.Vector3(), q, sc); copy.quaternion.copy(q); copy.scale.copy(sc) }
      const lb = ownBox(copy)                               // full size, as it stands on the bench
      const sz = lb.getSize(new THREE.Vector3())
      const slot = slotFor(list, i, list.length, kind)
      const fit = Math.min(1, slot.w / Math.max(0.01, sz.x), slot.h / Math.max(0.01, sz.y), slot.d / Math.max(0.01, sz.z))
      const base = copy.scale.clone()
      copy.scale.multiplyScalar(fit)
      const lb2 = ownBox(copy)
      copy.position.set(slot.x - (lb2.min.x + lb2.max.x) / 2, slot.y - lb2.min.y, slot.z - (lb2.min.z + lb2.max.z) / 2)
      slot.parent.add(copy)
      copy.userData.restY = -lb.min.y                       // bottom on the bench when carried at full size
      e.copy = copy
      e.home = { parent: slot.parent, pos: copy.position.clone(), scale: copy.scale.clone() }
      e.full = base
      e.pick = { kind: 'fetch', key: e.key, name: e.name, move: false, label: e.name }
      lab.makePickable(copy, e.pick)
      all.push(e)
    })
  }
  for (const e of all) if (e.real) for (const o of e.real) setLayer(o, HIDDEN)

  // ── Doors ──
  function setDoors(to, animate = true) {
    open = to
    for (const e of all) e.pick.move = to && !fetched.has(e.key)
    const doors = cab.userData.doors
    // An open door's glass must not catch clicks meant for what is behind it.
    for (const d of doors) d.userData.pane.raycast = to ? () => {} : THREE.Mesh.prototype.raycast
    const goal = to ? 1.9 : 0
    if (!animate) { for (const d of doors) d.rotation.y = d.userData.side * goal; lab.invalidate(); return }
    const from = doors[0].rotation.y * doors[0].userData.side
    let t = 0
    lab.animate((dt) => {
      t = Math.min(1, t + dt / 0.45)
      const v = from + (goal - from) * (1 - Math.pow(1 - t, 3))
      for (const d of doors) d.rotation.y = d.userData.side * v
      return t < 1
    })
    onChange()
  }

  // ── Fetching ──
  const onBench = (p) => p.x > bench.minX && p.x < bench.maxX && p.z > backZ + (hasRack ? Math.max(CD, RD) : CD) + 0.01 && p.z < bench.maxZ + 0.05
  function returnHome(e) {
    e.home.parent.add(e.copy)
    e.copy.position.copy(e.home.pos)
    e.copy.scale.copy(e.home.scale)
    lab.invalidate()
  }
  function placeReal(e, from) {
    // Glide the copy to the real item's place, then show the real thing.
    const q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3()
    e.real[0].updateMatrixWorld(true)
    e.real[0].matrixWorld.decompose(p, q, sc)
    scene.attach(e.copy)
    const p0 = from ? from.clone() : e.copy.position.clone(), q0 = e.copy.quaternion.clone(), s0 = e.copy.scale.clone()
    busy++
    let t = 0
    lab.animate((dt) => {
      t = Math.min(1, t + dt / 0.4)
      const k = 1 - Math.pow(1 - t, 3)
      e.copy.position.lerpVectors(p0, p, k)
      e.copy.position.y += Math.sin(Math.PI * k) * 0.05
      e.copy.quaternion.slerpQuaternions(q0, q, k)
      e.copy.scale.lerpVectors(s0, sc, k)
      if (t < 1) return true
      lab.unpick(e.copy); e.copy.parent?.remove(e.copy)
      for (const o of e.real) setLayer(o, 0)
      busy--
      lab.invalidate()
      return false
    })
  }
  function take(e, at) {
    if (finished || fetched.has(e.key)) return false
    if (!open) { say('Open the cupboard first: click its doors.'); return false }
    if (!e.need) {
      dispatch('setUp', { item: e.key, wrong: true })
      wrong.push(e.key)
      say(`${e.name} is not needed for this practical. Put it back and read the method again.`)
      returnHome(e)
      onChange()
      return false
    }
    if (dispatch('setUp', { item: e.key }) === false) { returnHome(e); return false }
    fetched.add(e.key)
    e.pick.move = false
    placeReal(e, at)
    const left = all.filter(x => x.need && !fetched.has(x.key)).length
    say(left ? `${cap(e.name)} is on the bench. ${left} more to fetch.` : 'Everything is on the bench. Press “Start the practical”.')
    onChange()
    return true
  }

  lab.overlay({
    moveBounds: (p) => (p?.kind === 'fetch' ? { minX: bench.minX + 0.03, maxX: bench.maxX - 0.03, minZ: backZ, maxZ: bench.maxZ - 0.02 } : null),
    carryStart: (p, obj) => { const e = all.find(x => x.pick === p); if (e) { obj.scale.copy(e.full) } },
    moved: (p, obj, point) => {
      const e = all.find(x => x.pick === p)
      if (!e) return undefined
      if (!onBench(point)) { returnHome(e); say('Put it down on the bench in front of you.'); return true }
      return take(e, obj.position) ? true : true      // take() puts back a wrong item itself
    },
  })

  function sync(setup) {
    if (finished) return
    const s = setup || { fetched: [], wrong: [], done: false }
    wrong = [...(s.wrong || [])]
    for (const k of s.fetched || []) {
      if (fetched.has(k)) continue
      const e = all.find(x => x.key === k)
      if (!e) continue
      fetched.add(k)
      lab.unpick(e.copy); e.copy.parent?.remove(e.copy)
      for (const o of e.real || []) setLayer(o, 0)
    }
    if (!open && (s.fetched?.length || s.wrong?.length)) setDoors(true, false)
    else for (const e of all) e.pick.move = open && !fetched.has(e.key)
    if (s.done) finish(false)
    onChange()
  }

  function finish(record = true) {
    if (finished) return
    if (record && all.some(e => e.need && !fetched.has(e.key))) { say('Fetch everything the practical needs first.'); return }
    if (record && dispatch('setUp', { done: true }) === false) return
    finished = true
    lab.overlay(null)
    lab.ring('target', null)
    for (const e of all) { lab.unpick(e.copy); e.copy.parent?.remove(e.copy); for (const o of e.real || []) setLayer(o, 0) }
    for (const d of cab.userData.doors) lab.unpick(d)
    lab.remove(cab); if (rack) lab.remove(rack)
    for (const d of distractors) d.object.traverse(o => { o.geometry?.dispose?.() })
    onChange()
  }

  const remaining = () => entries.filter(e => e.need && !fetched.has(e.key))
  function steps() {
    const out = [{ id: 'open', text: 'Open the apparatus cupboard (click its glass doors).', done: open }]
    for (const e of entries.filter(x => x.need)) {
      out.push({ id: e.key, done: fetched.has(e.key), text: e.kind === 'reagent' ? `Take the ${e.name} from the reagent rack to the bench.` : `Take the ${e.name} out of the cupboard and put it on the bench.` })
    }
    out.push({ id: 'start', text: 'Your bench is ready. Press “Start the practical”.', done: finished })
    return out
  }
  /** The object the current step is about (for the pulsing ring and "Show me"). */
  function focusTarget() {
    if (finished) return null
    if (!open) return cab
    const next = remaining()[0]
    return next ? next.copy : null
  }

  return {
    sync,
    steps,
    focusTarget,
    finish: () => finish(true),
    get done() { return finished },
    get busy() { return busy > 0 },
    wrongCount: () => wrong.length,
    /** The cupboard, the rack and the strip of bench in front of them: where the set-up happens. */
    workArea: () => {
      const b = new THREE.Box3().setFromObject(cab)
      if (rack) b.union(new THREE.Box3().setFromObject(rack))
      b.max.z = Math.min(bench.maxZ, backZ + (hasRack ? Math.max(CD, RD) : CD) + 0.5)
      b.min.y = benchY
      return b
    },
    /** The copy the current step is about (its name tag is always shown). */
    targetPick: () => { const t = focusTarget(); return t?.userData?.pick || null },
    onPick(p) {
      if (finished || !p) return false
      if (p.kind === 'cupboard') { setDoors(!open); say(open ? 'The cupboard is open. Carry what you need to the bench.' : 'The cupboard is closed.'); return true }
      if (p.kind === 'fetch') {
        const e = all.find(x => x.pick === p)
        if (!e) return true
        if (!open) { say('Open the cupboard first: click its glass doors.'); return true }
        menu(e.name, [
          { label: 'Put it on the bench', run: () => take(e, null) },
          { label: 'Look closer', run: () => lab.focusOn(e.copy) },
        ])
        return true
      }
      // The bench is not set up yet: nothing else can be used.
      say('Set up your bench first: fetch the apparatus and reagents.')
      return true
    },
    dispose() {
      if (!finished) {
        lab.overlay(null)
        for (const e of all) for (const o of e.real || []) setLayer(o, 0)
      }
    },
  }
}
