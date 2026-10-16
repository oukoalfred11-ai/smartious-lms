/**
 * scenes.js — one 3D scene per experiment.
 *
 *   build(lab, { dispatch, onSelect }) → { update(view, state), dispose() }
 *
 * Scenes only DISPLAY the view computed by the shared engine and turn
 * clicks into the same validated actions the control panels use. A
 * cosmetic animation (a falling drop) never decides a result.
 */
import * as THREE from 'three'
import * as E from './equipment.js'

const { BENCH_Y } = E

// ── Acid–base titration ─────────────────────────────────────
function titration(lab, { dispatch, onSelect }) {
  lab.add(E.bench())
  const stand = E.retortStand(0.95); stand.position.set(0.07, BENCH_Y, -0.05); lab.add(stand)
  const tile = E.whiteTile(); tile.position.set(0, BENCH_Y, 0); lab.add(tile)
  const flask = E.conicalFlask(); flask.position.set(0, BENCH_Y + 0.008, 0); lab.add(flask, { pick: { kind: 'flask' } })
  const bur = E.burette(); bur.position.set(0, BENCH_Y + 0.2, 0); lab.add(bur, { pick: { kind: 'burette' } })
  lab.makePickable(bur.userData.tap, { kind: 'tap' })
  const naoh = E.beaker('#EEF3F8', 0.7); naoh.position.set(0.26, BENCH_Y, 0.06); lab.add(naoh, { pick: { kind: 'base' } })
  const naohTag = E.labelPlane('NaOH 0.100 M', { w: 0.07, h: 0.022, size: 30 }); naohTag.position.set(0.26, BENCH_Y + 0.04, 0.097); lab.add(naohTag)
  const acid = E.beaker('#F7F3E8', 0.7); acid.position.set(-0.26, BENCH_Y, 0.06); lab.add(acid, { pick: { kind: 'acid' } })
  const acidTag = E.labelPlane('Acid  ? M', { w: 0.07, h: 0.022, size: 30 }); acidTag.position.set(-0.26, BENCH_Y + 0.04, 0.097); lab.add(acidTag)
  const inds = [['phenolphthalein', 'Phenolphth.', '#D63384'], ['methyl_orange', 'Methyl orange', '#E67E22'], ['bromothymol_blue', 'Bromothymol', '#2F5BD2']]
  const bottles = inds.map(([id, label, cap], i) => {
    const b = E.bottle(label, cap); b.position.set(-0.46 + i * 0.075, BENCH_Y, -0.12)
    lab.add(b, { pick: { kind: 'indicator', id } }); return { id, b }
  })
  // falling drop (cosmetic)
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.003, 8, 8), E.mat.liquid('#E8F0F7', 0.9)); drop.visible = false; lab.scene.add(drop)
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const showDrop = () => {
    if (reduced) return
    drop.position.set(0, BENCH_Y + 0.195, 0); drop.visible = true
    let v = 0
    lab.animate((dt) => { v += 9.8 * dt; drop.position.y -= v * dt; if (drop.position.y < BENCH_Y + 0.06) { drop.visible = false; return false } return true })
  }
  const prevReading = { v: null }
  return {
    onPick(p) {
      if (p.kind === 'tap') { if (dispatch('addBase', { volume: 0.05 })) showDrop() }
      else if (p.kind === 'indicator') dispatch('chooseIndicator', { indicator: p.id })
      onSelect(p)
    },
    update(view) {
      bur.userData.setLevel(view.burette.reading, view.burette.filled)
      flask.userData.setLiquid(view.flask.volume, view.flask.colour)
      bottles.forEach(({ id, b }) => { b.position.y = BENCH_Y + (view.indicatorChosen === id ? 0.01 : 0) })
      bur.userData.tap.rotation.x = 0
      if (prevReading.v != null && view.burette.reading > prevReading.v + 0.06 && !lab.lowGraphics) showDrop()
      prevReading.v = view.burette.reading
      lab.invalidate()
    },
    view: { pos: [0.28, 1.32, 0.78], target: [0, 1.12, 0] },
  }
}

// ── Ohm's law ───────────────────────────────────────────────
function ohms(lab, { dispatch, onSelect }) {
  lab.add(E.bench())
  const terms = {}            // 'PS.+' → { obj, pos }
  const place = (obj, x, z) => { obj.position.set(x, BENCH_Y, z); return obj }
  const addTerm = (id, parent, local, colour) => {
    const t = E.terminal(colour); t.position.copy(local); parent.add(t)
    lab.makePickable(t, { kind: 'terminal', id })
    terms[id] = { obj: t }
  }
  const ps = place(E.instrumentBox({ w: 0.2, h: 0.1, d: 0.13, colour: '#1F2A37', title: 'D.C. SUPPLY' }), -0.42, -0.12); lab.add(ps, { pick: { kind: 'supply' } })
  addTerm('PS.+', ps, new THREE.Vector3(0.06, 0.1, 0.03), '#C62828'); addTerm('PS.-', ps, new THREE.Vector3(-0.06, 0.1, 0.03), '#111111')
  const sw = place(E.knifeSwitch(), -0.14, 0.12); lab.add(sw, { pick: { kind: 'switch' } })
  addTerm('S1.a', sw, new THREE.Vector3(-0.05, 0.012, 0.018), '#7A7A7A'); addTerm('S1.b', sw, new THREE.Vector3(0.05, 0.012, 0.018), '#7A7A7A')
  const am = place(E.instrumentBox({ w: 0.14, h: 0.08, d: 0.1, colour: '#33415C', title: 'AMMETER (A)' }), 0.1, -0.14); lab.add(am, { pick: { kind: 'ammeter' } })
  addTerm('A1.+', am, new THREE.Vector3(0.04, 0.08, 0.025), '#C62828'); addTerm('A1.-', am, new THREE.Vector3(-0.04, 0.08, 0.025), '#111111')
  const vm = place(E.instrumentBox({ w: 0.14, h: 0.08, d: 0.1, colour: '#3B5B3B', title: 'VOLTMETER (V)' }), 0.38, -0.1); lab.add(vm, { pick: { kind: 'voltmeter' } })
  addTerm('V1.+', vm, new THREE.Vector3(0.04, 0.08, 0.025), '#C62828'); addTerm('V1.-', vm, new THREE.Vector3(-0.04, 0.08, 0.025), '#111111')
  const rb = place(E.resistorBoard('R ?'), 0.18, 0.14); lab.add(rb, { pick: { kind: 'resistor' } })
  addTerm('R1.a', rb, new THREE.Vector3(-0.06, 0.012, -0.018), '#7A7A7A'); addTerm('R1.b', rb, new THREE.Vector3(0.06, 0.012, -0.018), '#7A7A7A')

  let pending = null
  let leads = []
  let wireKey = ''
  const worldPos = (id) => { const v = new THREE.Vector3(); terms[id].obj.getWorldPosition(v); v.y += 0.02; return v }
  const setPending = (id) => {
    if (pending) terms[pending].obj.userData.setHighlight(false)
    pending = id
    if (pending) terms[pending].obj.userData.setHighlight(true)
    lab.invalidate()
  }
  return {
    onPick(p) {
      if (p.kind === 'terminal') {
        if (!pending) setPending(p.id)
        else if (pending === p.id) setPending(null)
        else { dispatch('connect', { a: pending, b: p.id }); setPending(null) }
        onSelect({ kind: 'terminal', id: p.id, pending })
        return
      }
      if (p.kind === 'switch') dispatch('toggleSwitch')
      setPending(null)
      onSelect(p)
    },
    update(view) {
      const key = JSON.stringify(view.wires)
      if (key !== wireKey) {
        leads.forEach(l => lab.remove(l)); leads = []
        view.wires.forEach(([a, b], i) => {
          const colour = a.endsWith('-') || b.endsWith('-') ? '#1A1A1A' : '#C62828'
          const l = E.leadBetween(worldPos(a), worldPos(b), colour)
          lab.add(l, { pick: { kind: 'wire', index: i } }); leads.push(l)
        })
        wireKey = key
      }
      sw.userData.setClosed(view.switchClosed)
      const fault = view.fault === 'short_circuit'
      ps.userData.screen.userData.setText(fault ? 'TRIP' : view.supplyV.toFixed(1) + ' V', fault ? { bg: '#F5C6C6', fg: '#7A0000' } : {})
      am.userData.screen.userData.setText(view.meters.A1 == null ? '----' : view.meters.A1.toFixed(3))
      vm.userData.screen.userData.setText(view.meters.V1 == null ? '----' : view.meters.V1.toFixed(2))
      lab.invalidate()
    },
    view: { pos: [0, 1.55, 0.85], target: [0, 0.93, 0] },
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
