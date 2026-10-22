/**
 * scenes.js — one 3D scene per experiment.
 *
 *   build(lab, { dispatch, onSelect, onHover }) → { onPick(p), update(view), view }
 *
 * Scenes only DISPLAY the view computed by the shared engine and turn
 * clicks into the same validated actions the control panels use. A
 * cosmetic animation (a falling drop) never decides a result.
 */
import * as THREE from 'three'
import * as E from './equipment.js'
import { buildModel } from './apparatus3d.js'
import { createWiring, wirePart } from './wiring.js'
import { titration } from './titrationScene.js'
import { addLabRoom, analogueClock } from './labRoom.js'
import { oneClickOsmosis, osmosisBalance } from '../benchMode.js'

const { BENCH_Y } = E

// ── Acid–base titration ─────────────────────────────────────
// The hands-on bench lives in titrationScene.js.

// ── Ohm's law ───────────────────────────────────────────────
// Real apparatus on the bench: supply, switch, ammeter, voltmeter, the
// unknown resistor and a tray of leads. Students pull leads from post to
// post (or tap one post then another), click a lead to remove it, set the
// supply with its up/down buttons and click the switch to close it.
function ohms(lab, { dispatch, onSelect, onHover }) {
  lab.add(E.bench())
  const place = (obj, x, z, pick) => { obj.position.set(x, BENCH_Y, z); return lab.add(obj, pick ? { pick } : {}) }
  const w = createWiring(lab, { dispatch, onSelect, onHover })
  const ps = place(buildModel('dc_supply'), -0.4, -0.16, { kind: 'supply', label: 'Power supply: use the ▲ ▼ buttons to set the voltage' })
  const sw = place(buildModel('switch'), -0.12, 0.12, { kind: 'switch', label: 'Switch: click to open or close' })
  const am = place(buildModel('ammeter'), 0.1, -0.16, { kind: 'ammeter', label: 'Ammeter' })
  const vm = place(buildModel('voltmeter'), 0.36, -0.12, { kind: 'voltmeter', label: 'Voltmeter' })
  const rb = place(E.resistorBoard('R = ?'), 0.2, 0.13, { kind: 'resistor', label: 'Resistor of unknown resistance' })
  w.tray(-0.42, 0.17)
  wirePart(w, ps, { id: 'PS', type: 'supply', label: 'Supply' })
  wirePart(w, sw, { id: 'S1', type: 'switch', label: 'Switch' })
  wirePart(w, am, { id: 'A1', type: 'ammeter', label: 'Ammeter' })
  wirePart(w, vm, { id: 'V1', type: 'voltmeter', label: 'Voltmeter' })
  wirePart(w, rb, { id: 'R1', type: 'resistor', label: 'Resistor' })

  // Up/down buttons on the supply.
  const button = (text, x, kind) => {
    const b = E.labelPlane(text, { w: 0.026, h: 0.02, size: 40, bg: '#1F2A37', fg: '#FFFFFF' })
    b.position.set(x, 0.13, 0.07); b.rotation.x = -Math.PI / 2
    ps.add(b); lab.makePickable(b, { kind, label: kind === 'up' ? 'Increase the supply voltage by 0.5 V' : 'Decrease the supply voltage by 0.5 V' })
  }
  button('▲', 0.035, 'up'); button('▼', 0.075, 'down')
  // Hands-on bench: how warm the resistor is, and whether the bench is tidied away.
  const temp = E.labelPlane('', { w: 0.12, h: 0.026, size: 30 })
  temp.position.set(0.2, BENCH_Y + 0.002, 0.2); temp.rotation.x = -Math.PI / 2; temp.visible = false
  lab.add(temp)
  let tempText = ''
  let supplyV = 0
  lab.setHandlers({ ...w.handlers, hover: (p) => onHover(p?.label || null) })

  return {
    onPick(p) {
      if (w.onPick(p)) return
      if (p.kind === 'switch') dispatch('toggleSwitch')
      else if (p.kind === 'up') dispatch('setSupply', { volts: Math.min(12, supplyV + 0.5) })
      else if (p.kind === 'down') dispatch('setSupply', { volts: Math.max(0, supplyV - 0.5) })
      onSelect({ kind: p.kind, label: p.label })
    },
    update(view) {
      supplyV = view.supplyV
      w.update(view.wires, view.wireColours, view.maxLeads)
      sw.userData.setClosed?.(view.switchClosed)
      const trip = view.fault === 'short_circuit'
      ps.userData.setDisplay?.(trip ? 'TRIP' : view.supplyV.toFixed(1) + ' V')
      am.userData.setDisplay?.(view.meters.A1 == null ? '----' : view.meters.A1.toFixed(3))
      vm.userData.setDisplay?.(view.meters.V1 == null ? '----' : view.meters.V1.toFixed(2))
      if (view.bench === 2 && view.hands) {
        const h = view.hands
        const t = h.tidy ? 'Tidied away' : h.hot ? 'Resistor HOT' : h.heatFrac > 0.02 ? 'Resistor warm' : h.settled ? 'Readings steady' : 'Settling…'
        temp.visible = true
        if (t !== tempText) { temp.userData.setText(t, h.hot ? { bg: '#C62828', fg: '#FFFFFF' } : h.heatFrac > 0.02 ? { bg: '#FFE0B2', fg: '#7A2E00' } : {}); tempText = t }
      }
      lab.invalidate()
    },
    view: { pos: [0, 1.5, 0.8], target: [0, 0.94, 0] },
    setup: () => ({
      bench: { minX: -1.08, maxX: 1.08, minZ: -0.44, maxZ: 0.43 },
      items: [
        { key: 'dc_supply', name: 'variable d.c. power supply', objects: [ps] },
        { key: 'switch', name: 'switch', objects: [sw] },
        { key: 'ammeter', name: 'ammeter', objects: [am] },
        { key: 'voltmeter', name: 'voltmeter', objects: [vm] },
        { key: 'resistor', name: 'resistor of unknown resistance', objects: [rb] },
      ],
      distractors: [
        { key: 'thermometer', name: 'The thermometer', object: buildModel('thermometer') },
        { key: 'stopwatch', name: 'The stopwatch', object: buildModel('stopwatch') },
        { key: 'bar_magnet', name: 'The bar magnet', object: buildModel('bar_magnet') },
      ],
    }),
  }
}

// ── Osmosis ─────────────────────────────────────────────────
// Step-by-step bench (every new session): a potato and cork borer on a
// white tile, a ruler and scalpel, a paper towel, a balance with a weighing
// boat, a rack of labelled boiling tubes and a lab clock on the back ledge.
//   potato / cork borer → cutCylinders
//   cylinder            → select, then a menu: trim (scalpel), blot, weigh
//   balance             → menu: tare, put the selected cylinder on, take it off
//   tube                → placeInTube (before the timer) / remove (after)
//   lab clock           → menu: start the timer, fast-forward
// The selected cylinder lies against the ruler, so its length can be read.
// Sessions on the original bench (ready-cut cylinders) keep their old layout.
function scalpel() {
  const g = new THREE.Group()
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.006, 0.012), new THREE.MeshStandardMaterial({ color: '#C8CDD3', metalness: 0.8, roughness: 0.3 })); handle.position.set(-0.03, 0.003, 0)
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.002, 0.009), new THREE.MeshStandardMaterial({ color: '#E1E5EA', metalness: 0.95, roughness: 0.1 })); blade.position.set(0.03, 0.003, 0)
  g.add(handle, blade)
  return g
}
function potatoAndBorer() {
  const g = new THREE.Group()
  const potato = new THREE.Mesh(new THREE.SphereGeometry(0.04, 20, 14), new THREE.MeshStandardMaterial({ color: '#B98E55', roughness: 0.95 }))
  potato.scale.set(1.3, 0.75, 1); potato.position.y = 0.03
  const borer = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.09, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#C8A04A', metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide }))
  borer.position.set(0.07, 0.045, 0)
  const ringTop = new THREE.Mesh(new THREE.TorusGeometry(0.009, 0.003, 8, 18), new THREE.MeshStandardMaterial({ color: '#C8A04A', metalness: 0.8, roughness: 0.3 }))
  ringTop.position.set(0.07, 0.092, 0); ringTop.rotation.x = Math.PI / 2
  g.add(potato, borer, ringTop)
  g.userData.potato = potato
  return g
}

function osmosis(lab, { dispatch, onSelect }) {
  lab.add(E.bench())
  const room = addLabRoom(lab)
  const SP = 0.055
  const say = (label, kind = 'notice') => onSelect({ kind, label })
  const menu = (label, actions) => onSelect({ kind: 'menu', label, actions })
  const reduced = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const rk = E.rack(6, SP); rk.position.set(-0.12, BENCH_Y, -0.04); lab.add(rk)
  const tubes = [], cyls = [], tubeTags = []
  const concs = ['0.0', '0.2', '0.4', '0.6', '0.8', '1.0']
  for (let i = 0; i < 6; i++) {
    const x = -0.12 + (i - 2.5) * SP
    const t = E.boilingTube(); t.position.set(x, BENCH_Y + 0.01, -0.04); lab.add(t, { pick: { kind: 'tube', index: i } }); tubes.push(t)
    const tag = E.labelPlane(concs[i] + ' M', { w: 0.045, h: 0.018, size: 34 }); tag.position.set(x, BENCH_Y + 0.07, -0.012); lab.add(tag); tubeTags.push(tag)
    const c = E.potatoCylinder(); lab.add(c, { pick: { kind: 'cyl', index: i } }); cyls.push(c)
  }
  const towel = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.002, 0.08), new THREE.MeshStandardMaterial({ color: '#FAFAF5', roughness: 1 })); towel.position.set(-0.12, BENCH_Y + 0.001, 0.12); lab.add(towel, { pick: { kind: 'towel' } })
  const bal = E.balance(); bal.position.set(0.32, BENCH_Y, 0.04); lab.add(bal, { pick: { kind: 'balance' } })
  const boat = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.008, 0.045), new THREE.MeshStandardMaterial({ color: '#F2F4F7', roughness: 0.4 }))
  boat.position.set(0.32, BENCH_Y + bal.userData.panY + 0.007, 0.02); lab.add(boat, { pick: { kind: 'balance' } })
  // Preparation tile at the front left: potato, cork borer, ruler and scalpel.
  const TILE = new THREE.Vector3(-0.47, BENCH_Y, 0.15)
  const tile = E.whiteTile(); tile.scale.set(1.5, 1, 1); tile.position.copy(TILE); lab.add(tile, { pick: { kind: 'prep' } })
  const pb = potatoAndBorer(); pb.position.set(TILE.x - 0.06, BENCH_Y + 0.008, TILE.z - 0.035); lab.add(pb, { pick: { kind: 'potato' } })
  const ruler = buildModel('ruler_30cm'); ruler.position.set(TILE.x + 0.04, BENCH_Y + 0.008, TILE.z + 0.05); lab.add(ruler, { pick: { kind: 'prep' } })
  const knife = scalpel(); knife.position.set(TILE.x + 0.06, BENCH_Y + 0.008, TILE.z - 0.06); knife.rotation.y = 0.3; lab.add(knife, { pick: { kind: 'prep' } })
  const RULER_ZERO = new THREE.Vector3(ruler.position.x - 0.15, BENCH_Y + 0.008 + 0.0068, ruler.position.z - 0.021)
  // The lab clock stands on the back ledge.
  const clock = analogueClock(0.075, { seconds: false })
  const clockStand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.04), new THREE.MeshStandardMaterial({ color: '#2B2F36', roughness: 0.6 }))
  clockStand.position.set(0.2, BENCH_Y + 0.1 + 0.015, -0.56); lab.add(clockStand, { pick: { kind: 'clock' } })
  clock.position.set(0.2, BENCH_Y + 0.1 + 0.11, -0.55); lab.add(clock, { pick: { kind: 'clock' } })
  const legacyClock = E.labelPlane('0 min', { w: 0.1, h: 0.035, size: 44, bg: '#111', fg: '#FFF' }); legacyClock.position.set(0.32, BENCH_Y + 0.2, -0.3); lab.add(legacyClock)
  let last = null, shownMin = null

  const minutesOf = (hhmm) => { const [h, m] = String(hhmm || '09:00').split(':').map(Number); return h * 60 + m }
  function showTime(mins) {
    if (shownMin == null || reduced || Math.abs(mins - shownMin) < 1) { shownMin = mins; clock.userData.setTime(mins); room.setClock(mins); lab.invalidate(); return }
    const from = shownMin, to = mins
    shownMin = mins
    let t = 0
    lab.animate((dt) => {          // the hands sweep round as time is fast-forwarded
      t += dt
      const k = Math.min(1, t / 0.9), m = from + (to - from) * k * k * (3 - 2 * k)
      clock.userData.setTime(m); room.setClock(m)
      return k < 1
    })
  }
  const towelX = (i) => -0.12 + (i - 2.5) * SP

  function cylMenu(i) {
    const v = last, c = v.cylinders[i], t = v.tubes[i]
    menu('Cylinder for ' + t.C.toFixed(1) + ' M', [
      ...[30, 35, 40, 45].map(L => ({ label: 'Trim to ' + L + ' mm', disabled: t.m0 != null || c.inSolution, run: () => { if (dispatch('trimCylinder', { index: i, length: L })) say('Trimmed against the ruler with the scalpel.') } })),
      { label: 'Blot dry', disabled: c.inSolution, run: () => { if (dispatch('blot', { index: i })) say('Blotted dry on the paper towel.') } },
      { label: 'Put on the balance', disabled: c.inSolution, run: () => dispatch('putOnPan', { index: i }) },
    ])
  }

  return {
    onPick(p) {
      const v = last
      if (!v || oneClickOsmosis(v)) {
        if (p.kind === 'tube' || p.kind === 'cyl') dispatch('select', { index: p.index })
        onSelect(p); return
      }
      switch (p.kind) {
        case 'potato': case 'prep':
          if (!v.cut) { if (dispatch('cutCylinders')) say('Six cylinders cut with the cork borer. Measure each against the ruler and trim them to the same length.') }
          else say('Click a cylinder to trim, blot or weigh it. The selected cylinder lies against the ruler.')
          return
        case 'cyl':
          if (!v.cut) { say('Cut the cylinders with the cork borer first: click the potato.'); return }
          if (v.cylinders[p.index].inSolution) { if (v.immersed) { if (dispatch('remove', { index: p.index })) say('Cylinder taken out of its tube. Blot it before weighing.') } else say('The cylinder is in its tube.'); return }
          if (v.selected !== p.index) dispatch('select', { index: p.index })
          cylMenu(p.index)
          return
        case 'towel':
          if (v.cut) { if (dispatch('blot', { index: v.selected })) say('Blotted dry on the paper towel.') }
          return
        case 'balance':
          menu('Balance (reads ' + (osmosisBalance(v) == null ? '-.--' : osmosisBalance(v).toFixed(2)) + ' g)', [
            { label: 'Tare (zero)', disabled: v.onPan != null, run: () => dispatch('tareBalance') },
            { label: 'Put the selected cylinder on', disabled: !v.cut || v.cylinders[v.selected].inSolution, run: () => dispatch('putOnPan', { index: v.selected }) },
            { label: 'Take it off', disabled: v.onPan == null, run: () => dispatch('clearPan') },
          ])
          return
        case 'tube': {
          const owner = v.cylinders.findIndex(c => c.tube === p.index)
          if (v.immersed) { if (owner >= 0 && v.cylinders[owner].inSolution && dispatch('remove', { index: owner })) say('Cylinder taken out of the ' + v.tubes[p.index].C.toFixed(1) + ' M tube. Blot it before weighing.') }
          else if (dispatch('placeInTube', { index: v.selected, tube: p.index })) say('Cylinder placed in the ' + v.tubes[p.index].C.toFixed(1) + ' M tube.')
          return
        }
        case 'clock':
          menu('Lab clock ' + v.clockTime, v.immersed
            ? [10, 30, 60, 120].map(m => ({ label: '+' + m + ' min', run: () => dispatch('wait', { minutes: m }) }))
            : [{ label: 'Start the timer', run: () => dispatch('startTimer') }])
          return
        default: onSelect(p)
      }
    },
    update(view) {
      last = view
      const ho = !oneClickOsmosis(view)
      pb.visible = ho; ruler.visible = ho; knife.visible = ho; tile.visible = ho; clock.visible = ho; clockStand.visible = ho; boat.visible = ho
      legacyClock.visible = !ho
      if (ho) pb.userData.potato.scale.set(view.cut ? 1.1 : 1.3, 0.75, view.cut ? 0.85 : 1)
      view.tubes.forEach((t, i) => {
        const c = cyls[i]
        const cy = view.cylinders?.[i]
        if (!ho || !cy) {
          c.visible = true
          c.userData.setSwell(t.visual)
          if (view.selected === i && (!view.immersed || t.removed)) c.position.set(0.32, BENCH_Y + bal.userData.panY + 0.007, 0.02)  // on the balance
          else if (!view.immersed || t.removed) c.position.set(towelX(i), BENCH_Y + 0.008, 0.12)                                      // on the paper towel
          else c.position.set(towelX(i), BENCH_Y + 0.05, -0.04)                                                                       // in the solution
          c.rotation.set(0, 0, (!view.immersed || t.removed) ? Math.PI / 2 : 0)
          tubes[i].position.y = BENCH_Y + 0.01 + (view.selected === i ? 0.008 : 0)
          return
        }
        c.visible = !!view.cut
        const k = Math.cbrt(1 + (t.visual || 0) / 100)
        const len = cy.length || 40
        c.scale.set(k, k * len / 40, k)
        c.material.roughness = cy.wet ? 0.25 : 0.9                         // a wet surface glistens
        c.material.color.set(cy.wet ? '#E2CF92' : '#E9D9A6')
        const half = 0.02 * k * len / 40
        if (cy.inSolution) { c.position.set(towelX(cy.tube), BENCH_Y + 0.03 + half, -0.04); c.rotation.set(0, 0, 0) }
        else if (cy.onPan) { c.position.set(0.32, BENCH_Y + bal.userData.panY + 0.018, 0.02); c.rotation.set(0, 0, Math.PI / 2) }
        else if (view.selected === i) { c.position.set(RULER_ZERO.x + half, RULER_ZERO.y, RULER_ZERO.z); c.rotation.set(0, 0, Math.PI / 2) }   // against the ruler
        else { c.position.set(towelX(i), BENCH_Y + 0.008, 0.12); c.rotation.set(0, Math.PI / 2, Math.PI / 2) }
        tubes[i].position.y = BENCH_Y + 0.01
      })
      bal.userData.screen.userData.setText(osmosisBalance(view) == null ? '-.-- g' : osmosisBalance(view).toFixed(2) + ' g')
      if (ho) showTime(minutesOf(view.clockTime))
      else legacyClock.userData.setText(view.immersed ? view.elapsed + ' min' : 'not started')
      lab.invalidate()
    },
    view: { pos: [0.05, 1.3, 0.7], target: [0.02, 0.98, 0] },
    /** Set-up quest (setupQuest.js): what the student fetches, and what they should leave. */
    setup: () => ({
      bench: { minX: -1.08, maxX: 1.08, minZ: -0.44, maxZ: 0.43 },
      items: [
        { key: 'balance', name: 'electronic balance and weighing boat', objects: [bal, boat] },
        { key: 'tube_rack', name: 'rack of six labelled boiling tubes of sucrose solution', kind: 'reagent', objects: [rk, ...tubes, ...tubeTags] },
        { key: 'potato', name: 'potato and cork borer', objects: [pb] },
        { key: 'white_tile', name: 'white tile', objects: [tile] },
        { key: 'ruler', name: '30 cm ruler', objects: [ruler] },
        { key: 'scalpel', name: 'scalpel', objects: [knife] },
        { key: 'towel', name: 'paper towel', objects: [towel] },
        { key: 'lab_clock', name: 'lab clock', objects: [clockStand, clock] },
      ],
      distractors: [
        { key: 'thermometer', name: 'The thermometer', object: buildModel('thermometer') },
        { key: 'measuring_cylinder', name: 'The measuring cylinder', object: buildModel('measuring_cylinder') },
        { key: 'tongs', name: 'The tongs', object: buildModel('tongs') },
        { key: 'iodine', name: 'Iodine solution', kind: 'reagent', object: E.bottle('Iodine\nsolution', '#5D4037') },
        { key: 'benedicts', name: 'Benedict’s reagent', kind: 'reagent', object: E.bottle('Benedict’s\nreagent', '#1F5FAF') },
      ],
    }),
  }
}

export const SCENES = { 'chem-titration': titration, 'phys-ohms-law': ohms, 'bio-osmosis': osmosis }
