// The human reproductive systems as textbook diagrams in 3D (schematic, not to
// scale): the female system seen from the front with the uterus cut open, and
// the male system seen from the front and slightly to one side.
import * as THREE from 'three'
import { PI, tissue, clear, glow, mesh, group, tube, lathe, lumpy, smooth } from './kit.js'

const V = (x, y, z = 0) => new THREE.Vector3(x, y, z)
const BACK = { phiStart: PI / 2, phiLength: PI }      // keep the back half: the front is cut away
const curveOf = (pts) => new THREE.CatmullRomCurve3(pts.map(p => (p.isVector3 ? p : V(...p))), false, 'centripetal')

export function female() {
  const mats = {
    wall: tissue('#D98A86', { side: THREE.DoubleSide }),
    lining: tissue('#B53E4E', { side: THREE.DoubleSide }),
    cervix: tissue('#E3A49B', { side: THREE.DoubleSide }),
    vagina: tissue('#D9928C', { side: THREE.DoubleSide }),
    tube: tissue('#E7A79A'),
    fimbria: tissue('#E9B2A4'),
    ovary: tissue('#EFCFB8'),
    follicle: clear('#FFF1D6', 0.6),
    egg: glow('#FFE7A8', 1.1),
  }
  // Uterus: a pear-shaped muscular organ (wall), lined with the endometrium; the front half removed.
  const outer = [[0.001, 0.07], [0.03, 0.068], [0.05, 0.055], [0.056, 0.03], [0.048, 0.0], [0.034, -0.03], [0.022, -0.05], [0.018, -0.07], [0.018, -0.09]]
  const inner = [[0.001, 0.05], [0.022, 0.048], [0.03, 0.035], [0.026, 0.015], [0.016, -0.01], [0.008, -0.03], [0.005, -0.05], [0.005, -0.07], [0.006, -0.09]]
  const wall = lathe(outer, mats.wall, { ...BACK, seg: 48 })
  const lining = lathe(inner.map(([r, y]) => [r + 0.004, y]), mats.lining, { ...BACK, seg: 48 })
  const cervix = lathe([[0.012, -0.055], [0.021, -0.06], [0.021, -0.09], [0.012, -0.095]], mats.cervix, { ...BACK, seg: 32 })
  // Vagina: a muscular tube below the cervix (also cut open).
  const vagina = lathe([[0.016, -0.09], [0.019, -0.12], [0.02, -0.16], [0.022, -0.2]], mats.vagina, { ...BACK, seg: 32 })
  // Oviducts with their funnels and fimbriae, and the ovaries.
  const sides = [-1, 1].map(s => {
    const path = [[0.045 * s, 0.05, 0], [0.09 * s, 0.065, 0], [0.14 * s, 0.055, 0], [0.17 * s, 0.025, 0.004], [0.165 * s, -0.002, 0.01]]
    const curve = curveOf(path)
    const oviduct = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.0065, 12, false), mats.tube)
    const end = curve.getPointAt(1), dir = curve.getTangentAt(1)
    const funnel = mesh(new THREE.CylinderGeometry(0.02, 0.006, 0.02, 24, 1, true), mats.fimbria)
    funnel.position.copy(end).addScaledVector(dir, 0.008); funnel.quaternion.setFromUnitVectors(V(0, -1, 0), dir.clone().negate()); funnel.material.side = THREE.DoubleSide
    const fimbriae = group(funnel)
    for (let k = 0; k < 9; k++) {
      const a = k / 9 * 2 * PI, base = end.clone().addScaledVector(dir, 0.016)
      const off = V(Math.cos(a), 0, Math.sin(a)).multiplyScalar(0.018).applyQuaternion(funnel.quaternion)
      fimbriae.add(tube([base.clone().add(off.clone().multiplyScalar(0.9)).toArray(), base.clone().add(off.clone().multiplyScalar(1.3)).addScaledVector(dir, 0.012).toArray()], 0.0022, mats.fimbria, { seg: 4, radial: 6 }))
    }
    const ovary = lumpy(0.022, 0.06, mats.ovary, { scale: [1.35, 0.85, 0.85], seed: 3 + s }); ovary.position.set(0.12 * s, -0.025, 0.006)
    const follicles = group()
    for (const [dx, dy, r] of [[-0.012, 0.008, 0.005], [0.01, -0.006, 0.006], [0.0, 0.012, 0.0045], [0.02, 0.006, s > 0 ? 0.009 : 0.005]]) {
      follicles.add(mesh(new THREE.SphereGeometry(r, 16, 12), mats.follicle, 0.12 * s + dx * s, -0.025 + dy, 0.024))
    }
    return { oviduct, fimbriae, ovary, follicles, curve }
  })
  const L = sides[0], R = sides[1]
  // The egg: released from the right ovary, swept into the oviduct and carried to the uterus.
  const egg = mesh(new THREE.SphereGeometry(0.0095, 20, 16), mats.egg)   // drawn bigger than the tube so it shows; egg.visible = false
  const eggStart = V(0.14, -0.019, 0.034)
  const toUterus = R.curve.getPoints(40).reverse()
  const eggPath = curveOf([eggStart, ...toUterus.slice(0, 1).map(p => p.clone().add(V(0, -0.01, 0.01))), ...toUterus, V(0.02, 0.035, 0)])

  const root = group(wall, lining, cervix, vagina, ...sides.flatMap(x => [x.oviduct, x.fimbriae, x.ovary, x.follicles]), egg)
  const parts = [
    { id: 'ovary', name: 'Ovary', objects: [L.ovary, R.ovary, L.follicles, R.follicles], anchor: [-0.14, -0.03, 0.026], info: 'Two ovaries make the female gametes (egg cells) and the hormones oestrogen and progesterone. About once a month an egg is released (ovulation).' },
    { id: 'follicle', name: 'Follicle', objects: [R.follicles], anchor: [0.14, -0.019, 0.034], info: 'A fluid-filled sac in the ovary where an egg matures before it is released.' },
    { id: 'oviduct', name: 'Oviduct (fallopian tube)', objects: [L.oviduct, R.oviduct], anchor: R.curve.getPointAt(0.35).toArray(), info: 'Carries the egg from the ovary to the uterus, moved along by cilia. Fertilisation, if it happens, takes place here.' },
    { id: 'funnel', name: 'Funnel and fimbriae', objects: [L.fimbriae, R.fimbriae], anchor: L.curve.getPointAt(1).toArray(), info: 'The open, fringed end of the oviduct, which sweeps the released egg into the tube.' },
    { id: 'uterus', name: 'Uterus (womb)', objects: [wall], anchor: [-0.05, 0.035, -0.005], info: 'A muscular organ where a fertilised egg implants and the fetus develops. Its strong muscle wall contracts to push the baby out at birth.' },
    { id: 'lining', name: 'Lining of the uterus (endometrium)', objects: [lining], anchor: [0.0, 0.02, -0.02], info: 'A thick lining rich in blood vessels, ready for an embryo to implant. If no egg is fertilised it breaks down and is lost (menstruation).' },
    { id: 'cervix', name: 'Cervix', objects: [cervix], anchor: [-0.021, -0.075, -0.003], info: 'The narrow neck of the uterus, a ring of muscle. It stays closed during pregnancy and widens during birth.' },
    { id: 'vagina', name: 'Vagina', objects: [vagina], anchor: [0.02, -0.17, -0.004], info: 'A muscular tube from the cervix to the outside of the body. Sperm are deposited here, and it is the birth canal.' },
    { id: 'egg', name: 'Egg cell (ovum)', objects: [egg], anchor: eggStart.toArray(), info: 'The female gamete. It has a nucleus with half the normal number of chromosomes and a store of food in its cytoplasm.' },
  ]
  let u = 0
  const set = (t) => {
    u = (t % 6) / 6
    egg.visible = u > 0.05
    egg.position.copy(eggPath.getPointAt(Math.min(1, smooth(Math.max(0, (u - 0.05) / 0.9)))))
  }
  return {
    root, parts,
    animateLabel: 'Ovulation',
    tick: (t) => set(t),
    reset: () => { u = 0; egg.visible = false },
    status: () => u < 0.05 ? 'The female reproductive system, with the uterus cut open.'
      : u < 0.2 ? 'Ovulation: an egg is released from a follicle in the ovary.'
        : u < 0.85 ? 'The egg is swept into the oviduct and moved towards the uterus. It can be fertilised here by a sperm cell.'
          : 'The egg reaches the uterus. A fertilised egg would implant in the thick lining.',
    view: { yaw: 0, pitch: 0.12 },
  }
}

export function male() {
  const mats = {
    bladder: clear('#F2DA8A', 0.45, { roughness: 0.4 }),
    urethra: tissue('#E9C77A'),
    prostate: tissue('#C98B6B'),
    vesicle: tissue('#D7A06E'),
    duct: tissue('#7BA7D9'),
    testis: tissue('#EFD2C0'),
    epididymis: tissue('#D99A8E'),
    scrotum: clear('#E7B9A6', 0.28),
    penis: clear('#DCA48F', 0.38),
    sperm: glow('#E8F6FF', 1.4),
  }
  const bladder = lumpy(0.045, 0.05, mats.bladder, { scale: [1.1, 0.9, 0.9], seed: 4 }); bladder.position.set(0, 0.1, 0)
  const urethraPath = curveOf([[0, 0.058, 0], [0, 0.02, 0.0], [0, -0.01, 0.012], [0, -0.04, 0.035], [0, -0.1, 0.05], [0, -0.165, 0.052]])
  const urethra = new THREE.Mesh(new THREE.TubeGeometry(urethraPath, 80, 0.005, 10, false), mats.urethra)
  const prostate = lumpy(0.022, 0.08, mats.prostate, { scale: [1.2, 0.9, 1], seed: 2 }); prostate.position.set(0, 0.03, 0.0)
  const penis = new THREE.Mesh(new THREE.TubeGeometry(curveOf([[0, -0.02, 0.03], [0, -0.06, 0.045], [0, -0.1, 0.05], [0, -0.155, 0.052]]), 40, 0.019, 20, false), mats.penis)
  const glans = mesh(new THREE.SphereGeometry(0.021, 24, 16), mats.penis, 0, -0.158, 0.052); glans.scale.set(1, 0.8, 1)
  const scrotum = lumpy(0.05, 0.05, mats.scrotum, { scale: [1.35, 1.0, 0.85], seed: 6 }); scrotum.position.set(0, -0.12, -0.012)
  const sides = [-1, 1].map(s => {
    const testis = lumpy(0.022, 0.03, mats.testis, { scale: [0.8, 1.15, 0.8], seed: 5 + s }); testis.position.set(0.032 * s, -0.125, -0.012)
    // Epididymis: a coiled tube along the back of the testis.
    const coil = []
    for (let i = 0; i <= 40; i++) { const a = i / 40; coil.push([0.032 * s + 0.004 * Math.sin(a * 30) + 0.006 * s, -0.1 - 0.05 * a, -0.03 + 0.004 * Math.cos(a * 30)]) }
    const epididymis = tube(coil, 0.0035, mats.epididymis, { seg: 120, radial: 6 })
    // Sperm duct: from the epididymis up, over the side of the bladder, round behind it to the urethra.
    const ductPath = curveOf([[0.038 * s, -0.15, -0.03], [0.05 * s, -0.11, -0.02], [0.055 * s, -0.03, 0.0], [0.065 * s, 0.07, 0.01], [0.055 * s, 0.13, -0.02], [0.03 * s, 0.11, -0.045], [0.012 * s, 0.05, -0.03], [0, 0.03, -0.005]])
    const duct = new THREE.Mesh(new THREE.TubeGeometry(ductPath, 100, 0.0038, 8, false), mats.duct)
    const vesicle = lumpy(0.013, 0.12, mats.vesicle, { scale: [1.6, 0.8, 0.8], seed: 3 }); vesicle.position.set(0.03 * s, 0.07, -0.05); vesicle.rotation.z = -0.5 * s
    return { testis, epididymis, duct, vesicle, ductPath }
  })
  const [L, R] = sides
  // Sperm cells carried along the duct and urethra.
  const route = curveOf([...R.ductPath.getPoints(60), ...urethraPath.getPoints(60).filter(p => p.y < 0.03)])
  const sperm = Array.from({ length: 6 }, () => { const m = mesh(new THREE.SphereGeometry(0.0055, 12, 10), mats.sperm); m.visible = false; return m })

  const root = group(bladder, urethra, prostate, penis, glans, scrotum, ...sides.flatMap(x => [x.testis, x.epididymis, x.duct, x.vesicle]), ...sperm)
  const parts = [
    { id: 'testis', name: 'Testis', objects: [L.testis, R.testis], anchor: [-0.05, -0.13, 0.0], info: 'Two testes make the male gametes (sperm cells) and the hormone testosterone.' },
    { id: 'scrotum', name: 'Scrotum', objects: [scrotum], anchor: [0.065, -0.14, 0.01], info: 'A sac of skin that holds the testes outside the body, where it is a little cooler: sperm develop best slightly below body temperature.' },
    { id: 'epididymis', name: 'Epididymis', objects: [L.epididymis, R.epididymis], anchor: [-0.044, -0.105, -0.032], info: 'A long coiled tube on each testis where sperm are stored and mature.' },
    { id: 'duct', name: 'Sperm duct', objects: [L.duct, R.duct], anchor: R.ductPath.getPointAt(0.35).toArray(), info: 'Carries sperm from the testis towards the urethra. Muscles in its wall push the sperm along.' },
    { id: 'vesicle', name: 'Seminal vesicle', objects: [L.vesicle, R.vesicle], anchor: [0.045, 0.06, -0.05], info: 'A gland that adds a sugary fluid to the sperm, giving them energy. With the prostate fluid this makes semen.' },
    { id: 'prostate', name: 'Prostate gland', objects: [prostate], anchor: [0.02, 0.03, 0.012], info: 'A gland around the urethra below the bladder that adds fluid to the sperm to make semen and helps them swim.' },
    { id: 'urethra', name: 'Urethra', objects: [urethra], anchor: urethraPath.getPointAt(0.55).toArray(), info: 'A tube through the penis that carries urine from the bladder, or semen, out of the body (never both at the same time).' },
    { id: 'penis', name: 'Penis', objects: [penis, glans], anchor: [0.02, -0.08, 0.05], info: 'Contains spongy tissue that fills with blood to become erect, so semen can be placed in the vagina.' },
    { id: 'bladder', name: 'Bladder', objects: [bladder], anchor: [-0.04, 0.12, 0.02], info: 'Part of the urinary system: it stores urine. The urethra is shared by the urinary and reproductive systems in males.' },
  ]
  let moving = false
  const set = (t) => {
    moving = true
    sperm.forEach((m, i) => { const u = (t * 0.12 + i / sperm.length) % 1; m.visible = true; m.position.copy(route.getPointAt(u)) })
  }
  return {
    root, parts,
    animateLabel: 'Show the path of sperm',
    tick: (t) => set(t),
    reset: () => { moving = false; sperm.forEach(m => { m.visible = false }) },
    status: () => moving ? 'Sperm made in the testis travel along the sperm duct; fluid from the seminal vesicles and prostate gland is added to make semen, which leaves through the urethra.'
      : 'The male reproductive system.',
    view: { yaw: 0.45, pitch: 0.1 },
  }
}
