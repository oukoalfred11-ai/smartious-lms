// A simple d.c. electric motor: a coil on an axle between two magnetic poles,
// with a split-ring commutator and carbon brushes. The field runs from the
// N pole (left) to the S pole (right); the axle points towards the viewer.
import * as THREE from 'three'
import { PI, plastic, metal, mesh, group, tube, arrow } from './kit.js'

export default function build() {
  const m = {
    wood: plastic('#B98A57', { roughness: 0.8 }),
    north: plastic('#C93A3A', { roughness: 0.35 }),
    south: plastic('#2F5FB0', { roughness: 0.35 }),
    yoke: metal('#6E747C', { roughness: 0.45 }),
    copper: metal('#C9783F', { roughness: 0.3 }),
    enamel: plastic('#B4572B', { roughness: 0.35, metalness: 0.4 }),
    steel: metal('#C8CDD3'),
    carbon: plastic('#2B2D31', { roughness: 0.9 }),
    insul: plastic('#F1E9D0', { roughness: 0.6 }),
    cellBody: plastic('#1F2A44', { roughness: 0.4 }),
    cellTop: metal('#D7DCE2'),
    wireRed: plastic('#D23B3B'), wireBlack: plastic('#222428'),
    label: new THREE.MeshBasicMaterial({ color: '#FFFFFF' }),
  }
  const root = new THREE.Group()
  const base = mesh(new THREE.BoxGeometry(0.5, 0.02, 0.36), m.wood, 0, -0.13, 0)
  root.add(base)

  // Magnets: curved pole faces on a steel yoke.
  const pole = (side, mat) => {
    const g = new THREE.Group()
    // A curved pole piece: the face is concave, wrapped round the coil.
    const c0 = side < 0 ? PI * 0.75 : -PI * 0.25, sh = new THREE.Shape()
    sh.absarc(0, 0, 0.11, c0, c0 + PI * 0.5, false); sh.absarc(0, 0, 0.072, c0 + PI * 0.5, c0, true)
    const fg = new THREE.ExtrudeGeometry(sh, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2, curveSegments: 32 }); fg.translate(0, 0, -0.09)
    const face = new THREE.Mesh(fg, mat)
    const block = mesh(new THREE.BoxGeometry(0.04, 0.1, 0.18), mat, side * 0.13, 0, 0)
    const yoke = mesh(new THREE.BoxGeometry(0.03, 0.2, 0.18), m.yoke, side * 0.165, -0.03, 0)
    const foot = mesh(new THREE.BoxGeometry(0.07, 0.03, 0.18), m.yoke, side * 0.155, -0.105, 0)
    g.add(face, block, yoke, foot)
    // Letter on the pole.
    const c = document.createElement('canvas'); c.width = c.height = 128
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.font = 'bold 96px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(side < 0 ? 'N' : 'S', 64, 70)
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace
    const tag = mesh(new THREE.PlaneGeometry(0.045, 0.045), new THREE.MeshBasicMaterial({ map: tex, transparent: true }), side * 0.125, 0.0, 0.0905)
    g.add(tag)
    return g
  }
  const north = pole(-1, m.north), south = pole(1, m.south)
  root.add(north, south)

  // Rotor: coil, commutator and axle turn together about z.
  const rotor = new THREE.Group()
  const axle = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.34, 16), m.steel); axle.rotation.x = PI / 2; axle.position.z = 0.03
  const coil = new THREE.Group()
  const W = 0.055, L = 0.075            // half-width (radius of the sides) and half-length along z
  for (let k = 0; k < 4; k++) {
    const w = W - k * 0.003, l = L - k * 0.002, z0 = 0
    const pts = [[-w, 0, -l], [-w, 0, l], [-0.012, 0, l + 0.02], [-0.006, 0, l + 0.045], [0.006, 0, l + 0.045], [0.012, 0, l + 0.02], [w, 0, l], [w, 0, -l], [0, 0, -l - 0.012], [-w, 0, -l]]
    coil.add(tube(pts.map(([x, y, z]) => [x, y + (k - 1.5) * 0.004, z + z0]), 0.0032, m.enamel, { seg: 120, radial: 8, closed: false }))
  }
  // Split-ring commutator: two copper halves with gaps, on an insulating sleeve.
  const commutator = new THREE.Group()
  commutator.add(mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.034, 20), m.insul))
  for (const s of [0, PI]) {
    const half = mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.03, 24, 1, true, s + 0.16, PI - 0.32), m.copper)
    commutator.add(half, mesh(new THREE.CylinderGeometry(0.0185, 0.0185, 0.03, 24, 1, false, s + 0.16, PI - 0.32), m.copper))
  }
  commutator.rotation.x = PI / 2; commutator.position.z = 0.15
  rotor.add(axle, coil, commutator)
  root.add(rotor)

  // Bearings holding the axle.
  const bearing = (z) => group(mesh(new THREE.BoxGeometry(0.03, 0.12, 0.016), m.yoke, 0, -0.06, z), mesh(new THREE.TorusGeometry(0.01, 0.004, 8, 20), m.steel, 0, 0, z))
  root.add(bearing(-0.115), bearing(0.19))

  // Carbon brushes pressing on the commutator from either side.
  const brush = (side) => group(
    mesh(new THREE.BoxGeometry(0.022, 0.014, 0.022), m.carbon, side * 0.03, 0, 0.15),
    mesh(new THREE.BoxGeometry(0.028, 0.006, 0.018), m.steel, side * 0.055, -0.004, 0.15),
    mesh(new THREE.BoxGeometry(0.006, 0.12, 0.018), m.steel, side * 0.072, -0.065, 0.15),
  )
  const brushes = group(brush(-1), brush(1))
  root.add(brushes)
  // The cell (battery) and its leads to the brushes.
  const cell = group(mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.09, 24), m.cellBody), mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 16), m.cellTop, 0, 0.049, 0), mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 24), m.cellTop, 0, -0.046, 0))
  cell.rotation.z = PI / 2; cell.position.set(0, -0.098, 0.25)
  const leads = group(
    tube([[-0.074, -0.12, 0.15], [-0.08, -0.12, 0.2], [-0.06, -0.11, 0.25], [-0.05, -0.098, 0.25]], 0.003, m.wireBlack, { seg: 24, radial: 8 }),
    tube([[0.074, -0.12, 0.15], [0.08, -0.12, 0.2], [0.065, -0.11, 0.25], [0.055, -0.098, 0.25]], 0.003, m.wireRed, { seg: 24, radial: 8 }),
  )
  root.add(cell, leads)

  // Field lines (N → S), current along the coil sides and the force on them.
  const field = group()
  for (const y of [-0.04, 0, 0.04]) for (const z of [-0.06, 0.0, 0.06]) field.add(arrow([-0.088, y, z], [-0.064, y, z], '#9BE37B', 0.0016), arrow([0.064, y, z], [0.088, y, z], '#9BE37B', 0.0016))
  // Built once, pointing along +y from their tail; re-aimed every frame.
  const forceArrows = [arrow([0, 0, 0], [0, 0.06, 0], '#FF7AD9', 0.0035), arrow([0, 0, 0], [0, 0.06, 0], '#FF7AD9', 0.0035)]
  const currentArrows = [arrow([0, 0, 0], [0, 0.08, 0], '#FFD54A', 0.0022), arrow([0, 0, 0], [0, 0.08, 0], '#FFD54A', 0.0022)]
  const forces = group(...forceArrows), currents = group(...currentArrows)
  root.add(field, forces, currents)
  const Y = new THREE.Vector3(0, 1, 0), aim = (g, at, dir) => { g.position.copy(at); g.quaternion.setFromUnitVectors(Y, dir) }
  const sideWorld = new THREE.Vector3()
  function showArrows(theta) {
    ;[-W, W].forEach((sx, i) => {
      sideWorld.set(sx * Math.cos(theta), sx * Math.sin(theta), 0)
      // The commutator makes the current flow +z in whichever side is on the left: force up there, down on the right.
      const dir = sideWorld.x < 0 ? 1 : -1
      aim(currentArrows[i], new THREE.Vector3(sideWorld.x, sideWorld.y + 0.012, -0.04 * dir), new THREE.Vector3(0, 0, dir))
      aim(forceArrows[i], sideWorld, new THREE.Vector3(0, dir, 0))
    })
  }
  let theta = 0.35, omega = -2.4
  const setTheta = (t) => { theta = t; rotor.rotation.z = t; showArrows(t) }
  setTheta(theta)

  const parts = [
    { id: 'north', name: 'North pole (magnet)', objects: [north], anchor: [-0.13, 0.06, 0.09], info: 'One pole of the permanent magnet. Magnetic field lines leave the north pole and go across the gap to the south pole.' },
    { id: 'south', name: 'South pole (magnet)', objects: [south], anchor: [0.13, 0.06, 0.09], info: 'The other pole. The field between the poles is roughly uniform, running from N to S.' },
    { id: 'coil', name: 'Coil (armature)', objects: [coil], anchor: [-W, 0.0, -0.04], info: 'Many turns of insulated copper wire on the axle. A current in the field makes forces on the two sides in opposite directions, so the coil turns. More turns, a larger current or a stronger magnet make it turn faster.' },
    { id: 'commutator', name: 'Split-ring commutator', objects: [commutator], anchor: [0.0, 0.02, 0.15], info: 'Two halves of a copper ring. Every half turn (when the coil is vertical) it swaps the connections, reversing the current in the coil so it keeps turning the same way.' },
    { id: 'brushes', name: 'Carbon brushes', objects: [brushes], anchor: [0.03, 0.008, 0.162], info: 'Carbon blocks pressed against the commutator. They let current flow into the turning coil while sliding on the ring.' },
    { id: 'axle', name: 'Axle', objects: [axle], anchor: [0, 0, -0.1], info: 'The shaft the coil turns on, held in bearings. It can drive a load such as a fan or wheel.' },
    { id: 'cell', name: 'Cell (d.c. supply)', objects: [cell], anchor: [0.03, -0.09, 0.27], info: 'Provides the direct current. Reversing the cell (or the magnets) reverses the direction of rotation.' },
    { id: 'field', name: 'Magnetic field', objects: [field], anchor: [0.08, 0.04, 0.06], info: 'Shown by green arrows from N to S. The force on a wire is greatest when the current is at right angles to the field.' },
    { id: 'force', name: 'Force on the coil', objects: [forces], anchor: [-0.03, 0.08, 0.0], info: 'Pink arrows: up on one side, down on the other (Fleming’s left-hand rule). Together they make a turning effect (moment) on the coil.' },
    { id: 'current', name: 'Current in the coil', objects: [currents], anchor: [0.05, -0.02, 0.05], info: 'Yellow arrows show the current in each side, in opposite directions. The commutator reverses it every half turn.' },
  ]
  return {
    root, parts,
    animateLabel: 'Run the motor',
    tick: (t, dt = 0.016) => setTheta(theta + omega * dt),
    status: () => {
      const a = ((theta % (2 * PI)) + 2 * PI) % (2 * PI)
      const vertical = Math.abs(Math.cos(a)) < 0.12
      return vertical ? 'The coil is vertical: the commutator gaps pass the brushes and the current in the coil reverses, so the coil keeps turning the same way.'
        : 'Current flows in opposite directions in the two sides of the coil, so the forces are up on one side and down on the other: the coil turns.'
    },
    reset: () => setTheta(0.35),
    view: { yaw: 0.28, pitch: 0.75 },
  }
}
