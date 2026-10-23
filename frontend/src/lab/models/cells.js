// Animal and plant cells, as seen with an electron microscope, cut open by a
// plane so the inside shows. Organelles that cross the cut are sliced too,
// which shows their insides (cristae in mitochondria, grana in chloroplasts).
import * as THREE from 'three'
import { PI, tissue, clear, mesh, group, tube, lumpy, clipper } from './kit.js'

// Seeded random numbers, so the cell looks the same every time.
function rand(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 } }

function roundedBox(w, h, d, r, seg = 20) {
  const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg)
  const p = g.attributes.position, v = new THREE.Vector3(), inner = new THREE.Vector3()
  const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    inner.set(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z)))
    const dir = v.clone().sub(inner)
    if (dir.lengthSq() > 1e-12) v.copy(inner).add(dir.normalize().multiplyScalar(r))
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

function mitochondrion(len, r, mats) {
  const g = new THREE.Group()
  const outer = mesh(new THREE.CapsuleGeometry(r, len, 8, 20), mats.mitoOuter)
  outer.rotation.z = PI / 2
  g.add(outer)
  // Cristae: folds of the inner membrane across the inside.
  for (let i = 0; i < 6; i++) {
    const x = -len / 2 + (i + 0.5) * len / 6
    const c = mesh(new THREE.BoxGeometry(0.0022, r * 1.5, r * 1.6), mats.cristae, x, (i % 2 ? 1 : -1) * r * 0.22, 0)
    g.add(c)
  }
  return g
}

function nucleus(r, mats, rnd) {
  const g = new THREE.Group()
  const env = lumpy(r, 0.03, mats.nucleus, { seed: 3, seg: 48 })
  const nucleolus = mesh(new THREE.SphereGeometry(r * 0.32, 24, 18), mats.nucleolus, r * 0.18, r * 0.1, -r * 0.1)
  g.add(env, nucleolus)
  // Chromatin: dark threads in the nucleus.
  for (let i = 0; i < 6; i++) {
    const pts = []
    let p = new THREE.Vector3((rnd() - 0.5) * r, (rnd() - 0.5) * r, (rnd() - 0.5) * r)
    for (let k = 0; k < 6; k++) { pts.push(p.toArray()); p = p.clone().add(new THREE.Vector3((rnd() - 0.5) * r * 0.5, (rnd() - 0.5) * r * 0.5, (rnd() - 0.5) * r * 0.5)).clampLength(0, r * 0.8) }
    g.add(tube(pts, r * 0.025, mats.chromatin, { seg: 24, radial: 5 }))
  }
  // Nuclear pores: small dimples on the envelope.
  for (let i = 0; i < 26; i++) {
    const u = rnd() * 2 - 1, a = rnd() * 2 * PI, s = Math.sqrt(1 - u * u)
    const pore = mesh(new THREE.TorusGeometry(r * 0.04, r * 0.012, 6, 12), mats.pore, s * Math.cos(a) * r * 1.01, u * r * 1.01, s * Math.sin(a) * r * 1.01)
    pore.lookAt(0, 0, 0)
    g.add(pore)
  }
  return { g, env, nucleolus }
}

function roughER(center, rIn, mats, rnd, count = 5) {
  const g = new THREE.Group()
  const ribo = []
  for (let k = 0; k < count; k++) {
    const R = rIn + 0.012 + k * 0.011, a0 = -0.9 + rnd() * 0.3, a1 = 1.1 + rnd() * 0.4, y = (rnd() - 0.5) * 0.03
    const pts = []
    for (let i = 0; i <= 12; i++) { const a = a0 + (a1 - a0) * i / 12; pts.push([center.x + R * Math.cos(a), center.y + y + 0.006 * Math.sin(i), center.z + R * Math.sin(a)]) }
    const t = tube(pts, 0.0045, mats.er, { seg: 48, radial: 10 })
    t.scale.y = 0.55
    g.add(t)
    for (let i = 0; i < 40; i++) { const a = a0 + (a1 - a0) * rnd(), side = rnd() < 0.5 ? -1 : 1; ribo.push([center.x + (R + side * 0.005) * Math.cos(a), center.y + y + (rnd() - 0.5) * 0.004, center.z + (R + side * 0.005) * Math.sin(a)]) }
  }
  return { g, ribo }
}

function golgi(mats) {
  const g = new THREE.Group()
  for (let i = 0; i < 5; i++) {
    const d = mesh(new THREE.TorusGeometry(0.04 - i * 0.002, 0.0045, 8, 32, 1.6), mats.golgi, 0, i * 0.009, 0)
    d.rotation.x = PI / 2; d.scale.z = 0.5
    g.add(d)
  }
  for (let i = 0; i < 6; i++) g.add(mesh(new THREE.SphereGeometry(0.0055, 12, 8), mats.golgi, 0.045 * Math.cos(i * 0.4), 0.004 + (i % 3) * 0.012, 0.045 * Math.sin(i * 0.4) * 0.5))
  return g
}

function ribosomes(points, mat) {
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0022, 6, 5), mat, points.length)
  const m4 = new THREE.Matrix4()
  points.forEach((p, i) => { m4.makeTranslation(p[0], p[1], p[2]); im.setMatrixAt(i, m4) })
  return im
}

function materials() {
  return {
    membrane: tissue('#E9A1A6', { side: THREE.DoubleSide, roughness: 0.4 }),
    cytoplasm: clear('#F6D9C9', 0.18, { roughness: 0.3 }),
    nucleus: tissue('#8C6BB1', { side: THREE.DoubleSide }),
    nucleolus: tissue('#4B2F6E'),
    chromatin: tissue('#5D3F86'),
    pore: tissue('#6C4D96'),
    mitoOuter: tissue('#E58A3A', { side: THREE.DoubleSide }),
    cristae: tissue('#F2B36B'),
    er: tissue('#4FA3C7', { roughness: 0.5 }),
    ribosome: tissue('#2E3A59', { roughness: 0.6 }),
    golgi: tissue('#E8C547'),
    wall: tissue('#9BC27A', { side: THREE.DoubleSide, roughness: 0.8, clearcoat: 0.1 }),
    vacuole: clear('#B9DFF2', 0.3, { side: THREE.DoubleSide }),
    chloroOuter: tissue('#3E9A47', { side: THREE.DoubleSide }),
    grana: tissue('#1F6B2A'),
    starch: tissue('#F4F1E2'),
  }
}

function chloroplast(mats) {
  const g = new THREE.Group()
  const outer = mesh(new THREE.SphereGeometry(0.022, 24, 16), mats.chloroOuter)
  outer.scale.set(1.6, 0.75, 1)
  g.add(outer)
  // Grana: stacks of thylakoid discs.
  for (let i = 0; i < 5; i++) {
    const s = group()
    for (let k = 0; k < 4; k++) s.add(mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.0018, 14), mats.grana, 0, k * 0.0024, 0))
    s.position.set(-0.024 + i * 0.012, -0.004, (i % 2 ? 1 : -1) * 0.004)
    g.add(s)
  }
  g.add(mesh(new THREE.SphereGeometry(0.004, 10, 8), mats.starch, 0.016, 0.004, 0.006))
  return g
}

export function animalCell() {
  const mats = materials(), rnd = rand(7)
  const root = new THREE.Group()
  const membrane = lumpy(0.2, 0.035, mats.membrane, { seed: 1.3, seg: 72, scale: [1.12, 0.82, 0.95] })
  const cyto = lumpy(0.194, 0.035, mats.cytoplasm, { seed: 1.3, seg: 48, scale: [1.12, 0.82, 0.95] })
  const nuc = nucleus(0.062, mats, rnd)
  nuc.g.position.set(-0.025, 0.005, -0.02)
  const er = roughER(nuc.g.position, 0.062, mats, rnd, 5)
  const mitos = group()
  const mitoAt = [[0.12, 0.06, -0.02, 0.4], [0.09, -0.08, 0.04, -0.6], [-0.15, -0.06, 0.01, 1.2], [-0.13, 0.08, -0.05, -0.3], [0.03, -0.1, -0.07, 0.2], [0.15, -0.01, 0.06, 1.0]]
  for (const [x, y, z, rot] of mitoAt) { const mi = mitochondrion(0.04, 0.014, mats); mi.position.set(x, y, z); mi.rotation.set(rot, rot * 0.7, rot * 0.4); mitos.add(mi) }
  const gol = golgi(mats); gol.position.set(0.075, 0.035, 0.03); gol.rotation.set(0.3, -0.6, 0.2)
  const free = []
  for (let i = 0; i < 220; i++) { const u = rnd() * 2 - 1, a = rnd() * 2 * PI, r = 0.08 + rnd() * 0.12, s = Math.sqrt(1 - u * u); free.push([s * Math.cos(a) * r * 1.05, u * r * 0.75, s * Math.sin(a) * r * 0.85]) }
  // Only ribosomes behind the cut (the cut-away removes the rest of the cell).
  const ribo = ribosomes([...free, ...er.ribo].filter(p => p[2] < 0.028), mats.ribosome)
  root.add(membrane, cyto, nuc.g, er.g, mitos, gol, ribo)
  const cut = clipper([0, 0, -1], 0.03)
  cut.add(membrane, cyto, nuc.g, mitos)
  cut.set(true)

  const parts = [
    { id: 'membrane', name: 'Cell membrane', objects: [membrane], anchor: [-0.205, 0.07, -0.02], info: 'A thin, partially permeable layer around the cell. It controls which substances enter and leave the cell.' },
    { id: 'cytoplasm', name: 'Cytoplasm', objects: [cyto], anchor: [0.05, -0.04, 0.0], info: 'A jelly-like fluid where most chemical reactions of the cell take place. The organelles are suspended in it.' },
    { id: 'nucleus', name: 'Nucleus', objects: [nuc.env], anchor: [-0.06, 0.04, 0.02], info: 'Contains the genetic material (DNA in chromosomes), which controls the activities of the cell.' },
    { id: 'nucleolus', name: 'Nucleolus', objects: [nuc.nucleolus], anchor: [-0.014, 0.011, -0.026], info: 'A dense region inside the nucleus where ribosomes are made.' },
    { id: 'mito', name: 'Mitochondrion', objects: [mitos], anchor: [0.12, 0.06, -0.02], info: 'The site of aerobic respiration, which releases energy from glucose for the cell. The folded inner membrane (cristae) gives a large surface area.' },
    { id: 'rer', name: 'Rough endoplasmic reticulum', objects: [er.g], anchor: [0.05, 0.0, -0.035], info: 'A network of flattened membrane sacs studded with ribosomes. Proteins made by the ribosomes are folded and transported in it.' },
    { id: 'ribosome', name: 'Ribosomes', objects: [ribo], anchor: free.find(p => p[2] < 0.0), info: 'Tiny structures, free in the cytoplasm or on the rough ER, where proteins are made (protein synthesis).' },
    { id: 'golgi', name: 'Golgi apparatus', objects: [gol], anchor: [0.075, 0.05, 0.03], info: 'Stacks of membranes that modify proteins and package them into vesicles to be sent where they are needed or out of the cell.' },
  ]
  const t0 = mitos.children.map(m => m.position.clone())
  return {
    root, parts,
    animateLabel: 'Living cell (cytoplasm moving)',
    tick: (t) => { mitos.children.forEach((m, i) => { m.position.copy(t0[i]).add(new THREE.Vector3(Math.sin(t * 0.7 + i) * 0.006, Math.cos(t * 0.5 + i * 2) * 0.005, 0)); m.rotation.y += 0.002 }); membrane.scale.setScalar(1 + 0.006 * Math.sin(t * 1.3)) },
    status: () => 'An animal cell has no cell wall, no chloroplasts and no large permanent vacuole.',
    cutaway: (on) => cut.set(on),
    view: { yaw: 0.35, pitch: 0.42 },
  }
}

export function plantCell() {
  const mats = materials(), rnd = rand(11)
  const root = new THREE.Group()
  const W = 0.4, H = 0.26, D = 0.26
  const wall = mesh(roundedBox(W, H, D, 0.04), mats.wall)
  const wallIn = mesh(roundedBox(W - 0.024, H - 0.024, D - 0.024, 0.03), mats.wall)
  const membrane = mesh(roundedBox(W - 0.03, H - 0.03, D - 0.03, 0.028), mats.membrane)
  const cyto = mesh(roundedBox(W - 0.034, H - 0.034, D - 0.034, 0.026), mats.cytoplasm)
  const vacuole = mesh(roundedBox(W - 0.12, H - 0.085, D - 0.085, 0.05), mats.vacuole)
  vacuole.position.x = 0.02
  const nuc = nucleus(0.045, mats, rnd)
  nuc.g.position.set(-0.14, -0.03, 0.0)
  const chloros = group()
  const ring = []
  for (let i = 0; i < 22; i++) {
    const a = i / 22 * 2 * PI
    const c = chloroplast(mats)
    const p = new THREE.Vector3(Math.cos(a) * 0.165, (i % 3 - 1) * 0.06, Math.sin(a) * 0.095)
    c.position.copy(p); c.rotation.set(rnd() * PI, a, rnd())
    chloros.add(c); ring.push({ a, y: p.y })
  }
  const mitos = group()
  for (const [x, y, z, r] of [[-0.12, 0.08, 0.06, 0.3], [0.16, -0.08, -0.05, 1.1], [-0.1, -0.09, -0.07, -0.5]]) { const mi = mitochondrion(0.03, 0.011, mats); mi.position.set(x, y, z); mi.rotation.set(r, r, 0); mitos.add(mi) }
  const er = roughER(nuc.g.position, 0.045, mats, rnd, 3)
  const free = []
  for (let i = 0; i < 160; i++) { const sx = rnd() < 0.5 ? -1 : 1; free.push([sx * (0.15 + rnd() * 0.025), (rnd() - 0.5) * 0.2, (rnd() - 0.5) * 0.2]) }
  const ribo = ribosomes([...free, ...er.ribo].filter(p => p[2] < 0.018), mats.ribosome)
  root.add(wall, wallIn, membrane, cyto, vacuole, nuc.g, chloros, mitos, er.g, ribo)
  const cut = clipper([0, 0, -1], 0.02)
  cut.add(wall, wallIn, membrane, cyto, vacuole, nuc.g, chloros, mitos)
  cut.set(true)

  const parts = [
    { id: 'wall', name: 'Cell wall', objects: [wall, wallIn], anchor: [-0.2, 0.1, -0.05], info: 'A strong layer of cellulose outside the membrane. It supports the cell and stops it bursting when it takes in water.' },
    { id: 'membrane', name: 'Cell membrane', objects: [membrane], anchor: [-0.185, -0.1, 0.02], info: 'Pressed against the inside of the cell wall. It controls which substances enter and leave the cell.' },
    { id: 'vacuole', name: 'Large permanent vacuole', objects: [vacuole], anchor: [0.05, 0.0, 0.0], info: 'Filled with cell sap (water, sugars and salts). It pushes the cytoplasm against the wall, keeping the cell firm (turgid).' },
    { id: 'chloro', name: 'Chloroplast', objects: [chloros], anchor: [0.165, 0.0, 0.0], info: 'Contains chlorophyll, which absorbs light energy for photosynthesis. The stacks of membranes inside are called grana.' },
    { id: 'nucleus', name: 'Nucleus', objects: [nuc.env], anchor: [-0.15, -0.02, 0.02], info: 'Contains the genetic material that controls the cell. In a plant cell it is pushed to the side by the vacuole.' },
    { id: 'cytoplasm', name: 'Cytoplasm', objects: [cyto], anchor: [-0.16, 0.06, 0.0], info: 'A thin layer of jelly between the vacuole and the membrane, where most of the cell’s chemical reactions take place.' },
    { id: 'mito', name: 'Mitochondrion', objects: [mitos], anchor: [0.16, -0.08, -0.05], info: 'The site of aerobic respiration. Plant cells respire all the time, day and night.' },
    { id: 'rer', name: 'Rough endoplasmic reticulum', objects: [er.g], anchor: [-0.1, -0.03, -0.04], info: 'Membrane sacs with ribosomes on them, where proteins are made and transported.' },
    { id: 'ribosome', name: 'Ribosomes', objects: [ribo], anchor: free.find(p => p[2] < 0.0), info: 'Tiny structures where proteins are made.' },
  ]
  return {
    root, parts,
    animateLabel: 'Cytoplasm streaming (cyclosis)',
    tick: (t) => { chloros.children.forEach((c, i) => { const a = ring[i].a + t * 0.12; c.position.set(Math.cos(a) * 0.165, ring[i].y, Math.sin(a) * 0.095); c.rotation.y = a }) },
    status: () => 'Only plant cells have a cellulose cell wall, chloroplasts and a large permanent vacuole.',
    cutaway: (on) => cut.set(on),
    view: { yaw: 0.35, pitch: 0.42 },
  }
}
