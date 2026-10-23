// The human heart: a front-to-back section, as in a textbook diagram, seen
// from the front (the heart's right side is on the viewer's left). The
// chambers are cut open; the great vessels are full 3D tubes.
// Oxygenated blood is drawn red and deoxygenated blood blue, by convention.
import * as THREE from 'three'
import { PI, tissue, mesh, group, tube, slab, blob2d, lerp, smooth } from './kit.js'

const OUTER = [[-0.075, 0.105], [-0.115, 0.082], [-0.132, 0.03], [-0.13, -0.03], [-0.116, -0.09], [-0.08, -0.138], [-0.035, -0.162], [0.035, -0.172],
  [0.082, -0.14], [0.12, -0.08], [0.136, -0.02], [0.127, 0.04], [0.11, 0.085], [0.07, 0.106], [0.02, 0.1], [-0.025, 0.102]]
// The right side of the heart (viewer's left): right atrium above, right ventricle below.
const RIGHT = [[-0.08, 0.084], [-0.104, 0.062], [-0.112, 0.022], [-0.1, -0.004], [-0.106, -0.032], [-0.1, -0.072], [-0.072, -0.114], [-0.042, -0.122],
  [-0.032, -0.088], [-0.028, -0.04], [-0.032, 0.0], [-0.038, 0.032], [-0.046, 0.07], [-0.062, 0.087]]
// The left side (viewer's right): left atrium above, left ventricle below, with the thickest wall.
const LEFT = [[0.05, 0.084], [0.088, 0.074], [0.1, 0.048], [0.086, 0.014], [0.09, -0.022], [0.084, -0.07], [0.062, -0.112], [0.042, -0.124],
  [0.028, -0.098], [0.022, -0.05], [0.026, -0.006], [0.031, 0.03], [0.036, 0.068]]

export default function build() {
  const m = {
    wall: tissue('#A9343A'),
    cut: tissue('#C8545A', { roughness: 0.7, clearcoat: 0.3 }),
    cavity: tissue('#5E171D', { roughness: 0.75 }),
    red: tissue('#C42B33'),
    blue: tissue('#3F5DA8'),
    valve: tissue('#F0E1C6', { side: THREE.DoubleSide, roughness: 0.6 }),
    chord: tissue('#F6EEDF', { roughness: 0.7 }),
    coronary: tissue('#D9363E'),
    fat: tissue('#E9CF7E', { roughness: 0.8 }),
  }
  const heart = new THREE.Group()
  const D = 0.11                                    // front-to-back thickness of the heart
  // The back of the heart (whole, rounded); its front face, behind the cut, is the back wall of each chamber.
  const back = slab(blob2d(OUTER), D * 0.4, [m.cavity, m.wall], { bevel: 0.03 })
  back.position.z = -0.053
  // The front layer: the cut muscle, with the chambers open.
  const front = slab(blob2d(OUTER), 0.022, [m.cut, m.wall], { bevel: 0.004, holes: [blob2d(RIGHT, 90), blob2d(LEFT, 90)] })
  front.position.z = 0.013
  heart.add(back, front)
  // Each chamber's back wall and the septum, as their own surfaces (so each can be picked and highlighted).
  const flat = (pts, mat, z) => { const g = new THREE.ShapeGeometry(new THREE.Shape(blob2d(pts, 80).map(([x, y]) => new THREE.Vector2(x, y)))); const o = new THREE.Mesh(g, mat); o.position.z = z; return o }
  const raFloor = flat([[-0.08, 0.084], [-0.104, 0.062], [-0.112, 0.022], [-0.1, -0.004], [-0.066, -0.002], [-0.032, 0.0], [-0.038, 0.032], [-0.046, 0.07], [-0.062, 0.087]], m.cavity, -0.0004)
  const rvFloor = flat([[-0.1, -0.004], [-0.106, -0.032], [-0.1, -0.072], [-0.072, -0.114], [-0.042, -0.122], [-0.032, -0.088], [-0.028, -0.04], [-0.032, 0.0], [-0.066, -0.002]], m.cavity, -0.0004)
  const laFloor = flat([[0.05, 0.084], [0.088, 0.074], [0.1, 0.048], [0.086, 0.014], [0.056, 0.004], [0.026, -0.006], [0.031, 0.03], [0.036, 0.068]], m.cavity, -0.0004)
  const lvFloor = flat([[0.086, 0.014], [0.09, -0.022], [0.084, -0.07], [0.062, -0.112], [0.042, -0.124], [0.028, -0.098], [0.022, -0.05], [0.026, -0.006], [0.056, 0.004]], m.cavity, -0.0004)
  const septum = flat([[-0.03, 0.0], [-0.026, -0.04], [-0.029, -0.088], [-0.03, -0.112], [0.0, -0.118], [0.028, -0.112], [0.025, -0.098], [0.019, -0.05], [0.023, -0.006], [0.0, 0.0]], m.cut, 0.0285)
  heart.add(raFloor, rvFloor, laFloor, lvFloor, septum)

  // Valves: two flaps at each atrium–ventricle opening, held by tendons to papillary muscles.
  const flap = (ax, ay, bx, by, tx, ty) => { const s = new THREE.Shape([new THREE.Vector2(ax, ay), new THREE.Vector2(bx, by), new THREE.Vector2(tx, ty)]); const g = new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.0015, bevelSegments: 2 }); g.translate(0, 0, -0.004); return new THREE.Mesh(g, m.valve) }
  const hinge = (x, y) => { const g = new THREE.Group(); g.position.set(x, y, 0); return g }
  function avValve(left, right, papilla) {
    const hl = hinge(...left), hr = hinge(...right)
    const midX = (left[0] + right[0]) / 2
    hl.add(flap(0, 0, 0.004, 0.004, midX - left[0] - 0.004, -0.03)); hr.add(flap(0, 0, -0.004, 0.004, midX - right[0] + 0.004, -0.03))
    const pap = mesh(new THREE.SphereGeometry(0.009, 16, 12), m.wall, papilla[0], papilla[1], 0.004); pap.scale.set(1, 1.6, 0.8)
    const chords = group()
    for (const [h, sx] of [[hl, left[0]], [hr, right[0]]]) for (const k of [0.3, 0.6, 0.9]) {
      chords.add(tube([[sx + (midX - sx) * k * 0.9, left[1] - 0.028 * k - 0.004, 0.006], [papilla[0], papilla[1] + 0.012, 0.006]], 0.0007, m.chord, { seg: 2, radial: 4 }))
    }
    return { hl, hr, pap, chords, g: group(hl, hr, pap, chords) }
  }
  const tricuspid = avValve([-0.1, -0.004], [-0.032, 0.0], [-0.072, -0.085])
  const bicuspid = avValve([0.026, -0.006], [0.086, 0.014], [0.056, -0.088])
  heart.add(tricuspid.g, bicuspid.g)

  // Great vessels.
  const aortaPts = [[0.004, 0.06, -0.012], [0.0, 0.16, -0.012], [0.012, 0.225, -0.02], [0.048, 0.252, -0.034], [0.085, 0.232, -0.05], [0.098, 0.18, -0.058], [0.1, 0.09, -0.062], [0.1, -0.05, -0.068]]
  const aorta = tube(aortaPts, 0.022, m.red, { seg: 96, radial: 28 })
  const branches = group(...[[0.02, 0.24], [0.045, 0.255], [0.07, 0.25]].map(([x, y], i) => tube([[x, y - 0.01, -0.028 - i * 0.008], [x - 0.008 + i * 0.006, y + 0.06, -0.03 - i * 0.008]], 0.0075 - i * 0.0008, m.red, { seg: 12, radial: 12 })))
  const pulmonary = tube([[-0.036, 0.07, 0.024], [-0.03, 0.14, 0.03], [-0.008, 0.18, 0.028], [0.03, 0.19, 0.018]], 0.019, m.blue, { seg: 48, radial: 24 })
  const pulmBranches = group(
    tube([[0.025, 0.19, 0.018], [0.07, 0.186, 0.01], [0.13, 0.176, -0.006], [0.18, 0.16, -0.02]], 0.012, m.blue, { seg: 40, radial: 16 }),
    tube([[-0.0, 0.188, 0.02], [-0.02, 0.2, -0.03], [-0.08, 0.19, -0.06], [-0.16, 0.17, -0.07]], 0.012, m.blue, { seg: 40, radial: 16 }),
  )
  const superior = tube([[-0.092, 0.3, -0.012], [-0.09, 0.2, -0.008], [-0.085, 0.11, -0.004], [-0.082, 0.07, 0.0]], 0.019, m.blue, { seg: 40, radial: 22 })
  const inferior = tube([[-0.11, -0.28, -0.05], [-0.112, -0.17, -0.06], [-0.105, -0.06, -0.05], [-0.095, 0.0, -0.02]], 0.02, m.blue, { seg: 40, radial: 22 })
  const pulmVeins = group(
    tube([[0.2, 0.08, -0.03], [0.14, 0.072, -0.02], [0.095, 0.06, -0.012]], 0.009, m.red, { seg: 20, radial: 14 }),
    tube([[0.2, 0.035, -0.04], [0.14, 0.04, -0.025], [0.095, 0.045, -0.014]], 0.009, m.red, { seg: 20, radial: 14 }),
    tube([[-0.16, 0.075, -0.075], [-0.04, 0.072, -0.07], [0.04, 0.066, -0.05]], 0.009, m.red, { seg: 24, radial: 14 }),
    tube([[-0.16, 0.035, -0.085], [-0.04, 0.04, -0.075], [0.045, 0.05, -0.052]], 0.009, m.red, { seg: 24, radial: 14 }),
  )
  // Semilunar valves: three small cusps at the base of the aorta and the pulmonary artery.
  const cusps = (x, y, z, r, tilt = 0) => {
    const g = new THREE.Group()
    for (let i = 0; i < 3; i++) { const c = mesh(new THREE.SphereGeometry(r * 0.55, 16, 10, 0, PI * 2, 0, PI / 2), m.valve); c.rotation.x = PI; c.position.set(Math.cos(i * 2.1) * r * 0.45, 0, Math.sin(i * 2.1) * r * 0.45); c.scale.set(1, 0.7, 1); g.add(c) }
    g.position.set(x, y, z); g.rotation.z = tilt
    return g
  }
  const aorticValve = cusps(0.002, 0.1, -0.012, 0.022), pulmValve = cusps(-0.034, 0.1, 0.025, 0.019)
  // Coronary arteries running over the outside of the heart muscle.
  const coronary = group(
    tube([[0.0, 0.1, 0.03], [-0.06, 0.098, 0.045], [-0.118, 0.04, 0.04], [-0.124, -0.05, 0.03], [-0.09, -0.12, 0.03], [-0.045, -0.15, 0.03]], 0.0042, m.coronary, { seg: 60, radial: 8 }),
    tube([[0.012, 0.1, 0.03], [0.07, 0.1, 0.045], [0.122, 0.04, 0.042], [0.128, -0.04, 0.034], [0.1, -0.11, 0.032], [0.05, -0.16, 0.03]], 0.0042, m.coronary, { seg: 60, radial: 8 }),
  )
  coronary.children.forEach(c => { c.position.z = -0.006 })
  heart.add(aorta, branches, pulmonary, pulmBranches, superior, inferior, pulmVeins, aorticValve, pulmValve, coronary)

  // Blood on its way through: deoxygenated (blue) on the right, oxygenated (red) on the left.
  const flowPaths = [
    { mat: m.blue, pts: [[-0.092, 0.3, -0.01], [-0.085, 0.12, 0.0], [-0.08, 0.04, 0.012], [-0.068, -0.03, 0.012], [-0.06, -0.09, 0.012], [-0.045, -0.04, 0.012], [-0.036, 0.06, 0.018], [-0.03, 0.14, 0.03], [0.02, 0.19, 0.02], [0.17, 0.162, -0.02]] },
    { mat: m.blue, pts: [[-0.11, -0.27, -0.05], [-0.108, -0.1, -0.055], [-0.09, 0.02, 0.0], [-0.075, 0.03, 0.012], [-0.064, -0.05, 0.012], [-0.05, -0.1, 0.012], [-0.04, -0.03, 0.012], [-0.036, 0.07, 0.022], [-0.01, 0.185, 0.02], [-0.15, 0.172, -0.068]] },
    { mat: m.red, pts: [[0.2, 0.08, -0.03], [0.095, 0.06, -0.008], [0.065, 0.045, 0.012], [0.06, -0.03, 0.012], [0.055, -0.1, 0.012], [0.035, -0.06, 0.012], [0.01, 0.03, 0.0], [0.002, 0.16, -0.012], [0.05, 0.25, -0.034], [0.098, 0.17, -0.058], [0.1, -0.05, -0.068]] },
  ].map(f => ({ curve: new THREE.CatmullRomCurve3(f.pts.map(p => new THREE.Vector3(...p))), dots: Array.from({ length: 9 }, (_, i) => { const d = mesh(new THREE.SphereGeometry(0.0055, 10, 8), f.mat); d.visible = false; heart.add(d); return { d, u: i / 9 } }) }))

  const root = new THREE.Group()
  root.add(heart)
  root.position.y = -0.03

  const parts = [
    { id: 'ra', name: 'Right atrium', objects: [raFloor], anchor: [-0.075, 0.045, 0.006], info: 'Receives deoxygenated blood from the body through the venae cavae, then pumps it down into the right ventricle.' },
    { id: 'rv', name: 'Right ventricle', objects: [rvFloor], anchor: [-0.066, -0.07, 0.006], info: 'Pumps deoxygenated blood to the lungs through the pulmonary artery. Its wall is thinner than the left ventricle’s because the lungs are close by.' },
    { id: 'la', name: 'Left atrium', objects: [laFloor], anchor: [0.066, 0.05, 0.006], info: 'Receives oxygenated blood from the lungs through the pulmonary veins, then pumps it into the left ventricle.' },
    { id: 'lv', name: 'Left ventricle', objects: [lvFloor], anchor: [0.056, -0.075, 0.006], info: 'Pumps oxygenated blood to the whole body through the aorta. It has the thickest muscular wall, to produce the high pressure needed.' },
    { id: 'septum', name: 'Septum', objects: [septum], anchor: [-0.003, -0.07, 0.035], info: 'The wall of muscle between the left and right sides. It keeps oxygenated and deoxygenated blood apart.' },
    { id: 'muscle', name: 'Cardiac muscle', objects: [front], anchor: [0.112, -0.06, 0.035], info: 'The wall of the heart, thickest around the left ventricle. Heart muscle contracts and relaxes rhythmically without tiring. It gets its own oxygen and glucose from the coronary arteries.' },
    { id: 'tricuspid', name: 'Tricuspid valve', objects: [tricuspid.hl, tricuspid.hr], anchor: [-0.066, -0.016, 0.01], info: 'The atrioventricular valve on the right. It closes when the right ventricle contracts, so blood cannot flow back into the right atrium.' },
    { id: 'bicuspid', name: 'Bicuspid (mitral) valve', objects: [bicuspid.hl, bicuspid.hr], anchor: [0.055, -0.012, 0.01], info: 'The atrioventricular valve on the left, with two flaps. It stops blood flowing back into the left atrium when the left ventricle contracts.' },
    { id: 'tendons', name: 'Tendons (chordae tendineae)', objects: [tricuspid.chords, bicuspid.chords], anchor: [0.05, -0.06, 0.008], info: 'Strong cords that hold the valve flaps, so the valves do not turn inside out when the ventricles contract.' },
    { id: 'semilunar', name: 'Semilunar valves', objects: [aorticValve, pulmValve], anchor: [-0.034, 0.1, 0.04], info: 'Pocket-shaped valves at the start of the aorta and the pulmonary artery. They stop blood flowing back into the ventricles when the ventricles relax.' },
    { id: 'aorta', name: 'Aorta', objects: [aorta, branches], anchor: aortaPts[3], info: 'The largest artery. It carries oxygenated blood at high pressure from the left ventricle to the body.' },
    { id: 'pulmart', name: 'Pulmonary artery', objects: [pulmonary, pulmBranches], anchor: [0.12, 0.178, -0.004], info: 'Carries deoxygenated blood from the right ventricle to the lungs. It is the only artery that carries deoxygenated blood.' },
    { id: 'pulmvein', name: 'Pulmonary veins', objects: [pulmVeins], anchor: [0.17, 0.075, -0.028], info: 'Bring oxygenated blood back from the lungs to the left atrium. They are the only veins that carry oxygenated blood.' },
    { id: 'svc', name: 'Vena cava (superior)', objects: [superior], anchor: [-0.091, 0.24, -0.01], info: 'Brings deoxygenated blood from the head and arms back to the right atrium.' },
    { id: 'ivc', name: 'Vena cava (inferior)', objects: [inferior], anchor: [-0.111, -0.22, -0.055], info: 'Brings deoxygenated blood from the lower body back to the right atrium.' },
    { id: 'coronary', name: 'Coronary arteries', objects: [coronary], anchor: [0.128, -0.02, 0.028], info: 'Supply the heart muscle itself with oxygenated blood. If they are narrowed by fatty deposits, the result is coronary heart disease.' },
  ]

  // One heartbeat: atria contract, then the ventricles, then the whole heart relaxes and fills.
  let phase = 'rest'
  const PERIOD = 1.6
  const setValves = (av, sl) => {      // av: 0 closed → 1 open (into the ventricles); sl: 0 closed → 1 open
    tricuspid.hl.rotation.z = -0.5 * av; tricuspid.hr.rotation.z = 0.5 * av
    bicuspid.hl.rotation.z = -0.5 * av; bicuspid.hr.rotation.z = 0.5 * av
    for (const v of [aorticValve, pulmValve]) v.children.forEach((c, i) => { c.scale.set(1 - 0.55 * sl, 0.7, 1 - 0.55 * sl); c.position.set(Math.cos(i * 2.1) * 0.012 * (1 + sl), 0, Math.sin(i * 2.1) * 0.012 * (1 + sl)) })
  }
  const tick = (t, dt = 0.016) => {
    const c = (t % PERIOD) / PERIOD
    let squeeze = 0, av = 1, sl = 0
    if (c < 0.15) { phase = 'atria'; squeeze = 0.3 * Math.sin(c / 0.15 * PI) }
    else if (c < 0.5) { phase = 'ventricles'; const k = (c - 0.15) / 0.35; squeeze = Math.sin(k * PI); av = 0; sl = smooth(Math.min(1, k * 3)) * (k < 0.85 ? 1 : (1 - k) / 0.15) }
    else { phase = 'diastole'; av = smooth(Math.min(1, (c - 0.5) / 0.15)) }
    heart.scale.set(1 - 0.035 * squeeze, 1 - 0.025 * squeeze, 1 - 0.03 * squeeze)
    setValves(av, sl)
    for (const f of flowPaths) for (const d of f.dots) {
      d.u = (d.u + dt * 0.18 * (phase === 'ventricles' ? 1.6 : 0.7)) % 1
      d.d.visible = true
      d.d.position.copy(f.curve.getPointAt(d.u))
    }
  }
  return {
    root, parts,
    animateLabel: 'Heartbeat and blood flow',
    tick,
    status: () => phase === 'atria' ? 'Atria contract: blood is pushed through the open tricuspid and bicuspid valves into the ventricles.'
      : phase === 'ventricles' ? 'Ventricles contract: the tricuspid and bicuspid valves close (“lub”) and blood is forced out through the semilunar valves into the arteries.'
        : phase === 'diastole' ? 'The heart relaxes: the semilunar valves close (“dub”), and blood flows from the veins into the atria and ventricles.'
          : 'Deoxygenated blood (blue) flows through the right side to the lungs; oxygenated blood (red) through the left side to the body.',
    reset: () => { phase = 'rest'; heart.scale.set(1, 1, 1); setValves(1, 0); for (const f of flowPaths) for (const d of f.dots) d.d.visible = false },
    view: { yaw: 0.3, pitch: 0.2 },
  }
}
