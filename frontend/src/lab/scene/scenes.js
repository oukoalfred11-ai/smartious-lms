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
      lab.invalidate()
    },
    view: { pos: [0, 1.5, 0.8], target: [0, 0.94, 0] },
  }
}

// ── Osmosis ─────────────────────────────────────────────────
function osmosis(lab, { dispatch, onSelect }) {
  lab.add(E.bench())
  const SP = 0.055
  const rk = E.rack(6, SP); rk.position.set(-0.12, BENCH_Y, -0.04); lab.add(rk)
  const tubes = [], cyls = []
  const concs = ['0.0', '0.2', '0.4', '0.6', '0.8', '1.0']
  for (let i = 0; i < 6; i++) {
    const x = -0.12 + (i - 2.5) * SP
    const t = E.boilingTube(); t.position.set(x, BENCH_Y + 0.01, -0.04); lab.add(t, { pick: { kind: 'tube', index: i } }); tubes.push(t)
    const tag = E.labelPlane(concs[i] + ' M', { w: 0.045, h: 0.018, size: 34 }); tag.position.set(x, BENCH_Y + 0.07, -0.012); lab.add(tag)
    const c = E.potatoCylinder(); lab.add(c, { pick: { kind: 'tube', index: i } }); cyls.push(c)
  }
  const towel = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.002, 0.08), new THREE.MeshStandardMaterial({ color: '#FAFAF5', roughness: 1 })); towel.position.set(-0.12, BENCH_Y + 0.001, 0.12); lab.add(towel)
  const bal = E.balance(); bal.position.set(0.32, BENCH_Y, 0.04); lab.add(bal, { pick: { kind: 'balance' } })
  const clock = E.labelPlane('0 min', { w: 0.1, h: 0.035, size: 44, bg: '#111', fg: '#FFF' }); clock.position.set(0.32, BENCH_Y + 0.2, -0.3); lab.add(clock)
  return {
    onPick(p) { if (p.kind === 'tube') dispatch('select', { index: p.index }); onSelect(p) },
    update(view) {
      view.tubes.forEach((t, i) => {
        const c = cyls[i]
        c.userData.setSwell(t.visual)
        const x = -0.12 + (i - 2.5) * SP
        if (view.selected === i && (!view.immersed || t.removed)) c.position.set(0.32, BENCH_Y + bal.userData.panY + 0.007, 0.02)  // on the balance
        else if (!view.immersed || t.removed) c.position.set(x, BENCH_Y + 0.008, 0.12)                                            // on the paper towel
        else c.position.set(x, BENCH_Y + 0.05, -0.04)                                                                             // in the solution
        c.rotation.z = (!view.immersed || t.removed) ? Math.PI / 2 : 0
        tubes[i].position.y = BENCH_Y + 0.01 + (view.selected === i ? 0.008 : 0)
      })
      bal.userData.screen.userData.setText(view.balance == null ? '-.-- g' : view.balance.toFixed(2) + ' g')
      clock.userData.setText(view.immersed ? view.elapsed + ' min' : 'not started')
      lab.invalidate()
    },
    view: { pos: [0.05, 1.3, 0.7], target: [0.02, 0.98, 0] },
  }
}

export const SCENES = { 'chem-titration': titration, 'phys-ohms-law': ohms, 'bio-osmosis': osmosis }
