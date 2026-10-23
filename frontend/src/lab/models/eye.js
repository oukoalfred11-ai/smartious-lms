// The human eye: a cut-away with a quarter removed, so the inside can be seen.
// Built along the optical axis (+y in eye space = towards the front), then
// turned as in a textbook: light enters from the left; the top front quarter is cut away.
import * as THREE from 'three'
import { PI, tissue, clear, mesh, group, lathe, arc, tube, lerp, smooth } from './kit.js'

const R = 0.12                       // eyeball radius (about 12 mm, drawn ten times life size)
const CUT = { phiStart: PI / 2, phiLength: 1.5 * PI }   // the quarter facing up and towards the viewer is removed
const CUT_PHIS = [PI / 2, 2 * PI]

/** Eye space (optical axis +y) → root space (front of the eye towards −x). */
const toRoot = ([x, y, z]) => [-y, x, z]
const at = (r, a, phi = 1.75 * PI) => [r * Math.sin(a) * Math.sin(phi), r * Math.cos(a), r * Math.sin(a) * Math.cos(phi)]

/** A flat face where the wedge was cut: the region between two profiles, in the plane at angle phi. */
function cutFace(outer, inner, mat, phi) {
  const pts = [...outer, ...[...inner].reverse()].map(([u, v]) => new THREE.Vector2(u, v))
  const geo = new THREE.ShapeGeometry(new THREE.Shape(pts), 1)
  geo.rotateY(phi - PI / 2)
  return new THREE.Mesh(geo, mat)
}

export default function build() {
  const eye = new THREE.Group()
  const mats = {
    sclera: tissue('#F3EEE6', { roughness: 0.6 }),
    choroid: tissue('#5A2A26', { side: THREE.DoubleSide }),
    retina: tissue('#E38B6E', { side: THREE.DoubleSide }),
    cornea: clear('#CFE6F5', 0.28, { clearcoat: 1 }),
    aqueous: clear('#BFE3F7', 0.12),
    vitreous: clear('#E7F2F8', 0.1),
    iris: tissue('#4F7A9C', { side: THREE.DoubleSide, roughness: 0.7 }),
    lens: clear('#FFF6D5', 0.55, { roughness: 0.02, clearcoat: 1, transmission: 0 }),
    ciliary: tissue('#7A3B34'),
    ligament: tissue('#E9DCCB', { roughness: 0.8 }),
    nerve: tissue('#F2E3B6'),
    disc: tissue('#FFE8B8', { side: THREE.DoubleSide }),
    fovea: tissue('#E3B23C', { side: THREE.DoubleSide }),
    vessel: tissue('#B3262D'),
  }
  const junction = 0.2 * PI                          // where the cornea meets the sclera (limbus)
  const ora = 0.3 * PI                               // front edge of the retina (ora serrata)
  const shell = (r, a0, a1) => arc(0, 0, r, r, a0, a1, 40)

  // Sclera, choroid and retina: three shells, each a little smaller.
  const sclera = lathe(shell(R, junction, PI), mats.sclera, CUT)
  const choroid = lathe(shell(R * 0.965, junction + 0.03, PI), mats.choroid, CUT)
  const retina = lathe(shell(R * 0.94, ora, PI), mats.retina, CUT)
  const faces = []
  for (const phi of CUT_PHIS) {
    faces.push(cutFace(shell(R, junction, PI), shell(R * 0.965, junction, PI), mats.sclera, phi))
    faces.push(cutFace(shell(R * 0.965, junction + 0.03, PI), shell(R * 0.94, junction + 0.03, PI), mats.choroid, phi))
    faces.push(cutFace(shell(R * 0.94, ora, PI), shell(R * 0.925, ora, PI), mats.retina, phi))
  }

  // Cornea: a clear dome bulging in front of the sclera.
  const yJ = R * Math.cos(junction), rJ = R * Math.sin(junction)
  const cornea = lathe([[0, R + 0.012], ...arc(0, yJ - 0.004, rJ, R + 0.012 - (yJ - 0.004), 0.02, PI / 2, 20).map(([x, y]) => [x, y])].concat([[rJ, yJ]]), mats.cornea, CUT)
  // Iris (a coloured ring) in front of the lens; the pupil is the hole in it.
  const irisY = 0.086
  let pupil = 0.024
  const irisGeo = (p) => new THREE.LatheGeometry([[p, irisY + 0.002], [0.05, irisY + 0.004], [rJ - 0.002, irisY - 0.004], [rJ - 0.002, irisY - 0.008], [0.05, irisY - 0.004], [p, irisY - 0.002]].map(([r, y]) => new THREE.Vector2(r, y)), 64, CUT.phiStart, CUT.phiLength)
  const iris = new THREE.Mesh(irisGeo(pupil), mats.iris)
  const pupilMark = mesh(new THREE.CircleGeometry(0.004, 12), new THREE.MeshBasicMaterial({ color: '#111' }), 0, irisY, 0); pupilMark.visible = false
  // Aqueous humour: between the cornea and the lens.
  const aqueous = lathe([[0, R + 0.008], ...arc(0, irisY - 0.03, rJ - 0.006, R + 0.008 - (irisY - 0.03), 0.05, PI / 2, 14), [0.04, irisY - 0.02], [0, irisY - 0.03]], mats.aqueous, CUT)
  // Lens: biconvex, held by the suspensory ligaments from the ciliary body.
  const lensY = 0.062
  const lens = lathe(arc(0, 0, 0.045, 0.022, 0, PI, 32), mats.lens, CUT)
  lens.position.y = lensY
  const ciliaryR = 0.07
  const ciliary = lathe(arc(ciliaryR, lensY, 0.009, 0.013, 0, 2 * PI, 24), mats.ciliary, { ...CUT, seg: 64 })
  const ligaments = group()
  for (let i = 0; i < 36; i++) {
    const phi = CUT.phiStart + (i + 0.5) / 36 * CUT.phiLength
    for (const dy of [-0.008, 0.008]) {
      const a = [0.044 * Math.sin(phi), lensY + dy * 0.4, 0.044 * Math.cos(phi)], b = [(ciliaryR - 0.009) * Math.sin(phi), lensY + dy, (ciliaryR - 0.009) * Math.cos(phi)]
      ligaments.add(tube([a, b], 0.0007, mats.ligament, { seg: 2, radial: 4 }))
    }
  }
  // Vitreous humour: the clear jelly filling the space behind the lens.
  const vitreous = lathe([[0, lensY - 0.02], ...shell(R * 0.92, ora + 0.04, PI).map(([x, y]) => [x * 0.99, y])].reverse(), mats.vitreous, CUT)

  // Optic nerve leaves the back of the eye, a little to the nose side of the axis.
  const nerveA = PI - 0.27, nervePhi = 1.8 * PI
  const nerveStart = at(R * 0.93, nerveA, nervePhi), nerveEnd = at(R * 1.75, nerveA - 0.06, nervePhi)
  const nerve = tube([nerveStart, at(R * 1.2, nerveA, nervePhi), at(R * 1.5, nerveA - 0.03, nervePhi), nerveEnd], 0.017, mats.nerve, { seg: 24, radial: 20 })
  const discPos = new THREE.Vector3(...at(R * 0.918, nerveA, nervePhi))
  const disc = mesh(new THREE.CircleGeometry(0.012, 24), mats.disc); disc.position.copy(discPos); disc.lookAt(0, 0, 0)
  const foveaPos = new THREE.Vector3(0, -R * 0.918, 0)
  const fovea = mesh(new THREE.CircleGeometry(0.009, 24), mats.fovea); fovea.position.copy(foveaPos); fovea.lookAt(0, 0, 0)
  // Blood vessels spreading over the retina from the optic disc.
  const vessels = group()
  for (let k = 0; k < 5; k++) {
    const pts = []
    for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push(at(R * 0.912, nerveA - t * (0.5 + 0.12 * k) * (k % 2 ? 1 : 0.8), nervePhi + (k - 2) * t * 0.35)) }
    vessels.add(tube(pts, 0.0016 * (1 - 0.1 * k), mats.vessel, { seg: 24, radial: 6 }))
  }

  eye.add(sclera, choroid, retina, ...faces, cornea, iris, pupilMark, aqueous, lens, ciliary, ligaments, vitreous, nerve, disc, fovea, vessels)
  const root = new THREE.Group()
  eye.rotation.z = PI / 2          // eye +y (front) → root −x
  root.add(eye)

  const A = (p) => toRoot(p)
  const parts = [
    { id: 'cornea', name: 'Cornea', objects: [cornea], anchor: A(at(R + 0.011, 0.14, 1.8 * PI)), info: 'The clear, curved window at the front of the eye. It does most of the refracting (bending) of light that enters the eye.' },
    { id: 'iris', name: 'Iris', objects: [iris], anchor: A([0.062 * Math.sin(1.9 * PI), irisY + 0.004, 0.062 * Math.cos(1.9 * PI)]), info: 'The coloured ring of muscle. It changes the size of the pupil to control how much light enters: smaller in bright light, larger in dim light.' },
    { id: 'pupil', name: 'Pupil', objects: [iris], anchor: A([0.012, irisY + 0.003, 0.0005]), info: 'The hole in the centre of the iris that lets light into the eye. It looks black because light that enters is absorbed inside.' },
    { id: 'aqueous', name: 'Aqueous humour', objects: [aqueous], anchor: A([0.02, 0.108, 0.0005]), info: 'Watery fluid between the cornea and the lens. It keeps the front of the eye in shape and nourishes the cornea and lens.' },
    { id: 'lens', name: 'Lens', objects: [lens], anchor: A([0.03, lensY + 0.012, 0.0005]), info: 'A clear, flexible, biconvex lens. It changes shape to fine-tune the focus so that a sharp image forms on the retina (accommodation).' },
    { id: 'ciliary', name: 'Ciliary muscle (ciliary body)', objects: [ciliary], anchor: A([ciliaryR * Math.sin(1.72 * PI), lensY + 0.012, ciliaryR * Math.cos(1.72 * PI)]), info: 'A ring of muscle around the lens. It contracts to focus on near objects (the lens becomes fatter) and relaxes to focus on distant objects.' },
    { id: 'ligaments', name: 'Suspensory ligaments', objects: [ligaments], anchor: A([0.056, lensY, 0.0005]), info: 'Fibres that hold the lens in place. When they are pulled tight the lens is stretched thinner; when they slacken it becomes fatter.' },
    { id: 'vitreous', name: 'Vitreous humour', objects: [vitreous], anchor: A([0.03, -0.03, 0.0005]), info: 'A clear jelly that fills most of the eyeball. It keeps the eye’s round shape and lets light pass through to the retina.' },
    { id: 'retina', name: 'Retina', objects: [retina], anchor: A(at(R * 0.925, 0.62 * PI, 1.05 * PI)), info: 'The light-sensitive layer at the back of the eye. Its rods (dim light) and cones (colour) turn light into nerve impulses.' },
    { id: 'fovea', name: 'Fovea', objects: [fovea], anchor: A(foveaPos.toArray()), info: 'A small pit in the retina packed with cones. The image is sharpest here, so it is where light from the object you look at is focused.' },
    { id: 'blindspot', name: 'Blind spot (optic disc)', objects: [disc], anchor: A(discPos.toArray()), info: 'Where the optic nerve leaves the retina. There are no rods or cones here, so light falling on it is not detected.' },
    { id: 'nerve', name: 'Optic nerve', objects: [nerve], anchor: A(at(R * 1.55, nerveA - 0.035, nervePhi)), info: 'Carries nerve impulses from the retina to the brain, which interprets them as an image.' },
    { id: 'choroid', name: 'Choroid', objects: [choroid], anchor: A(at(R * 0.952, 0.7 * PI, 0.003)), info: 'A dark layer full of blood vessels. It supplies the retina with oxygen and nutrients, and its dark pigment absorbs light so it is not reflected inside the eye.' },
    { id: 'sclera', name: 'Sclera', objects: [sclera], anchor: A(at(R, 0.62 * PI, 1.75 * PI)), info: 'The tough white outer coat. It protects the eye and keeps its shape; the eye muscles are attached to it.' },
  ]

  // Accommodation: near focus = ciliary muscle contracts, ligaments slacken, lens fatter; pupil narrows.
  let near = 0
  const setNear = (k) => {
    near = k
    lens.scale.set(1 - 0.06 * k, 1 + 0.35 * k, 1 - 0.06 * k)
    ciliary.scale.setScalar(1 - 0.05 * k)
    const p = lerp(0.024, 0.015, k)
    if (Math.abs(p - pupil) > 1e-4) { pupil = p; iris.geometry.dispose(); iris.geometry = irisGeo(p) }
  }
  return {
    root, parts,
    animateLabel: 'Focus near and far',
    tick: (t) => { const c = (Math.sin(t * 0.9) + 1) / 2; setNear(smooth(c)) },
    status: () => near > 0.6 ? 'Near object: ciliary muscle contracts, suspensory ligaments slacken, the lens becomes fatter and refracts light more.'
      : near < 0.4 ? 'Distant object: ciliary muscle relaxes, suspensory ligaments are pulled tight, the lens is thinner and refracts light less.'
        : 'Changing focus (accommodation)…',
    reset: () => setNear(0),
    view: { yaw: 0.25, pitch: 0.5 },
  }
}
