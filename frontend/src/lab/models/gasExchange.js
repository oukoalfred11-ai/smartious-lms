// The breathing system and gas exchange. On the left, the airways: the
// trachea with its rings of cartilage, the two bronchi branching into
// bronchioles inside see-through lungs, and the diaphragm. On the right, the
// end of one bronchiole magnified: a cluster of alveoli wrapped in a
// capillary, where oxygen diffuses into the blood and carbon dioxide out.
// Run it to breathe. Schematic, not to scale.
import * as THREE from 'three'
import { PI, tissue, clear, glow, mesh, group, tube, lathe, arc, lumpy, smooth } from './kit.js'

const V = (x, y, z = 0) => new THREE.Vector3(x, y, z)

export default function build() {
  const mats = {
    airway: tissue('#EAD9C6'),
    ring: tissue('#F6EEE2', { roughness: 0.45 }),
    lung: clear('#F2A7A7', 0.22, { roughness: 0.6 }),
    diaphragm: tissue('#C9625A', { side: THREE.DoubleSide }),
    alveolus: clear('#F4B6B0', 0.42, { roughness: 0.5, side: THREE.DoubleSide }),
    deoxy: tissue('#4C5FB3'),
    oxy: tissue('#D23A3A'),
    oxygen: glow('#9FE7FF', 1.4),
    co2: glow('#BBBBBB', 0.6),
    lens: clear('#FFFFFF', 0.06),
    guide: new THREE.LineBasicMaterial({ color: '#8FA3B8', transparent: true, opacity: 0.6 }),
  }

  // ── Airways: trachea, bronchi and branching bronchioles ──
  const TX = -0.14, SPLIT = V(TX, 0.08)
  const trachea = tube([[TX, 0.27, 0], [TX, 0.17, 0], SPLIT.toArray()], 0.016, mats.airway, { seg: 24 })
  const rings = group()
  for (let y = 0.25; y > 0.095; y -= 0.018) {
    const r = mesh(new THREE.TorusGeometry(0.0168, 0.0032, 8, 32, 1.65 * PI), mats.ring, TX, y, 0)
    r.rotation.x = PI / 2; r.rotation.z = -0.82 * PI / 2   // C-shaped: open at the back
    rings.add(r)
  }
  const bronchi = group(), bronchioles = group(), tips = []
  // A seeded branching tree: each branch splits in two, thinner and shorter.
  let seed = 7
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  function branch(from, dir, len, r, depth, side) {
    const to = from.clone().addScaledVector(dir, len)
    const mid = from.clone().lerp(to, 0.5).add(V((rnd() - 0.5) * 0.01, (rnd() - 0.5) * 0.01, (rnd() - 0.5) * 0.02))
    const t = tube([from.toArray(), mid.toArray(), to.toArray()], r, mats.airway, { seg: 10, radial: 8 })
    ;(depth === 0 ? bronchi : bronchioles).add(t)
    if (depth >= 4) { tips.push(to); return }
    for (const turn of [-1, 1]) {
      const a = 0.42 + rnd() * 0.25
      const d = dir.clone().applyAxisAngle(V(0, 0, 1), turn * a).applyAxisAngle(V(0, 1, 0), (rnd() - 0.5) * 1.2).normalize()
      if (d.y > 0.35) d.y = 0.35 - rnd() * 0.3                  // keep the tree growing down and out
      branch(to, d.normalize(), len * 0.72, r * 0.68, depth + 1, side)
    }
  }
  branch(SPLIT, V(-0.75, -0.66).normalize(), 0.06, 0.011, 0, -1)
  branch(SPLIT, V(0.75, -0.66).normalize(), 0.06, 0.011, 0, 1)
  // See-through lungs around the tree.
  const lungL = lumpy(0.08, 0.04, mats.lung, { scale: [0.82, 1.3, 0.7], seed: 2 }); lungL.position.set(TX - 0.085, 0.0, 0)
  const lungR = lumpy(0.08, 0.04, mats.lung, { scale: [0.86, 1.32, 0.72], seed: 5 }); lungR.position.set(TX + 0.088, 0.0, 0)
  const lungs = group(lungL, lungR)
  // Diaphragm: a dome of muscle under the lungs.
  const diaphragm = lathe(arc(0, 0, 0.14, 0.035, 0, PI / 2, 24), mats.diaphragm, { seg: 48 })
  diaphragm.scale.z = 0.55                         // shallower front to back
  diaphragm.position.set(TX, -0.13, 0)

  // ── Magnified: alveoli and their capillary ──
  const C = V(0.22, -0.01)                          // centre of the alveolar sac
  const tip = tips.reduce((a, b) => (b.x > a.x ? b : a), tips[0])    // the bronchiole being magnified
  const duct = tube([[0.09, 0.12, 0], [0.15, 0.085, 0], [C.x - 0.03, C.y + 0.035, 0]], 0.012, mats.airway, { seg: 16 })
  const sacs = [], alveoli = group()
  const RA = 0.03
  const spots = [[0, 0, 0], [0.045, 0.02, 0.01], [-0.04, -0.02, 0.015], [0.03, -0.045, 0.01], [-0.02, 0.04, -0.01], [0.055, -0.02, -0.025], [-0.05, 0.02, -0.02], [0.01, -0.02, 0.04], [0.0, 0.02, -0.045]]
  for (const [x, y, z] of spots) {
    const a = mesh(new THREE.SphereGeometry(RA, 32, 24), mats.alveolus, C.x + x, C.y + y, z)
    alveoli.add(a); sacs.push(a.position.clone())
  }
  // The capillary: in from the pulmonary artery (deoxygenated), over the alveoli, out oxygenated.
  const over = (p, k) => p.clone().add(V(0, 0, RA * 0.95 + 0.006 * k))
  const capPath = [V(C.x - 0.11, C.y - 0.09, 0.03), over(sacs[2], 1), over(sacs[0], 1.4), over(sacs[1], 1), over(sacs[5], 0.6), V(C.x + 0.12, C.y - 0.08, 0.02)]
  const capCurve = new THREE.CatmullRomCurve3(capPath, false, 'centripetal')
  const half = (u0, u1) => new THREE.CatmullRomCurve3(Array.from({ length: 17 }, (_, i) => capCurve.getPointAt(u0 + (u1 - u0) * i / 16)), false)
  const capIn = new THREE.Mesh(new THREE.TubeGeometry(half(0, 0.5), 60, 0.007, 10, false), mats.deoxy)
  const capOut = new THREE.Mesh(new THREE.TubeGeometry(half(0.5, 1), 60, 0.007, 10, false), mats.oxy)
  const capillary = group(capIn, capOut)
  // A lens ring around the magnified view, and lines back to the bronchiole it shows.
  const lensRing = mesh(new THREE.TorusGeometry(0.135, 0.0025, 8, 96), mats.guide.clone(), C.x, C.y, -0.02)
  const guides = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([tip, V(C.x - 0.1, C.y + 0.09, -0.02), tip, V(C.x - 0.1, C.y - 0.09, -0.02)]), mats.guide)

  // Gas molecules: oxygen out of the alveoli into the blood, carbon dioxide the other way.
  const N = 10
  const o2 = [], co2 = []
  for (let i = 0; i < N; i++) {
    const s = sacs[i % 4], c = capCurve.getPointAt(0.25 + 0.5 * (i / N))
    o2.push({ m: mesh(new THREE.SphereGeometry(0.0045, 12, 10), mats.oxygen), a: s.clone().add(V(0, 0, 0.006)), b: c, off: i / N })
    co2.push({ m: mesh(new THREE.SphereGeometry(0.004, 12, 10), mats.co2), a: capCurve.getPointAt(0.2 + 0.5 * (i / N)), b: sacs[(i + 1) % 4].clone().add(V(0, 0, 0.006)), off: (i + 0.5) / N })
  }
  const gases = group(...o2.map(g => g.m), ...co2.map(g => g.m))

  const root = group(trachea, rings, bronchi, bronchioles, lungs, diaphragm, duct, alveoli, capillary, lensRing, guides, gases)

  const capMid = capCurve.getPointAt(0.3), capEnd = capCurve.getPointAt(0.9)
  const parts = [
    { id: 'trachea', name: 'Trachea (windpipe)', objects: [trachea], anchor: [TX + 0.012, 0.205, 0.012], info: 'Carries air down to the lungs. It is lined with cells with cilia and mucus that trap dust and microorganisms and sweep them up.' },
    { id: 'rings', name: 'Rings of cartilage', objects: [rings], anchor: [TX - 0.012, 0.232, 0.016], info: 'C-shaped rings that keep the trachea open, so it does not collapse when the air pressure inside falls.' },
    { id: 'bronchi', name: 'Bronchi', objects: [bronchi], anchor: [TX + 0.04, 0.055, 0.012], info: 'The trachea divides into two bronchi, one to each lung.' },
    { id: 'bronchioles', name: 'Bronchioles', objects: [bronchioles], anchor: tips[3].toArray(), info: 'Smaller and smaller tubes branching through the lungs. Each ends in a cluster of air sacs (alveoli).' },
    { id: 'lungs', name: 'Lungs', objects: [lungs], anchor: [TX - 0.11, 0.05, 0.05], info: 'Spongy organs made of millions of alveoli, giving a huge surface area for gas exchange.' },
    { id: 'diaphragm', name: 'Diaphragm', objects: [diaphragm], anchor: [TX + 0.1, -0.11, 0.035], info: 'A sheet of muscle under the lungs. When it contracts it flattens, the chest gets bigger, the pressure falls and air flows in.' },
    { id: 'alveoli', name: 'Alveoli (air sacs)', objects: [alveoli], anchor: [C.x + 0.05, C.y + 0.035, 0.03], info: 'Tiny air sacs where gas exchange happens. Their walls are one cell thick and moist, and there are millions of them, so gases diffuse in and out quickly.' },
    { id: 'capillary', name: 'Capillary', objects: [capillary], anchor: capMid.toArray(), info: 'A blood vessel one cell thick wrapped round the alveoli, so the gases have only a very short distance to diffuse.' },
    { id: 'deoxy', name: 'Deoxygenated blood in', objects: [capIn], anchor: capPath[0].toArray(), info: 'Blood from the heart (pulmonary artery), low in oxygen and high in carbon dioxide.' },
    { id: 'oxy', name: 'Oxygenated blood out', objects: [capOut], anchor: capEnd.toArray(), info: 'Blood going back to the heart (pulmonary vein), now rich in oxygen.' },
    { id: 'o2', name: 'Oxygen diffuses into the blood', objects: o2.map(g => g.m), anchor: [C.x - 0.02, C.y + 0.055, 0.04], info: 'Oxygen moves from the air in the alveolus, where it is concentrated, into the blood, where it is less concentrated: diffusion down a concentration gradient.' },
    { id: 'co2', name: 'Carbon dioxide diffuses out', objects: co2.map(g => g.m), anchor: [C.x + 0.06, C.y - 0.05, 0.04], info: 'Carbon dioxide diffuses the other way, out of the blood into the alveolus, and is breathed out.' },
  ]

  // ── Breathing and diffusion ──
  let inhale = 0
  const set = (t) => {
    inhale = (Math.sin(t * 1.4 - PI / 2) + 1) / 2
    const k = smooth(inhale)
    lungs.scale.set(1 + 0.08 * k, 1 + 0.07 * k, 1 + 0.08 * k)
    diaphragm.scale.set(1, 1 - 0.55 * k, 1)
    diaphragm.position.y = -0.13 - 0.018 * k
    for (const list of [o2, co2]) for (const g of list) {
      const u = (t * 0.45 + g.off) % 1
      g.m.position.copy(g.a).lerp(g.b, smooth(u))
      g.m.visible = u < 0.95
    }
  }
  set(0)
  return {
    root, parts,
    animateLabel: 'Breathe',
    tick: (t) => set(t),
    reset: () => set(0),
    status: () => inhale > 0.55 ? 'Breathing in: the diaphragm contracts and flattens, the chest volume increases, the pressure falls and air flows in.'
      : inhale < 0.45 ? 'Breathing out: the diaphragm relaxes and domes up, the chest volume decreases, the pressure rises and air is pushed out.'
        : 'Gas exchange: oxygen diffuses into the blood, carbon dioxide diffuses out.',
    view: { yaw: 0.15, pitch: 0.12 },
  }
}
