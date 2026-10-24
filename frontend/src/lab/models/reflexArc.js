// The reflex arc: a pin pricks the skin and the arm pulls away before the
// brain knows. A segment of spinal cord, cut across at the top to show its
// grey and white matter, with the nerve roots and the three neurones of the
// arc. Run it to send an impulse round: receptor → sensory neurone → relay
// neurone → motor neurone → effector (muscle). Schematic, not to scale.
import * as THREE from 'three'
import { PI, tissue, clear, glow, metal, mesh, group, tube, slab, blob2d, lumpy, smooth } from './kit.js'

const CX = -0.16                      // centre of the spinal cord
const K = 1.8                         // the cord is drawn larger than the rest, so its section can be seen
const TOP = 0.05                      // the cut face at the top of the cord
const LAYER = TOP + 0.007             // neurones drawn on the cut face
const V = (x, y, z) => new THREE.Vector3(x, y, z)

/** A cord section outline (shape x = right, shape y = towards the back) extruded upwards. */
function section(points, height, mat, raise = 0) {
  const s = slab(points.map(([x, y]) => [x * K, y * K]), height, mat, { bevel: 0.002 })
  s.rotation.x = -PI / 2             // shape y → world −z (the back), extrusion → world y
  s.position.set(CX, TOP + raise - height / 2, 0)   // top face at TOP (+ raise)
  return s
}

export default function build() {
  const mats = {
    white: tissue('#F1E8D6'),
    grey: tissue('#8C6F6B', { roughness: 0.7 }),
    canal: new THREE.MeshBasicMaterial({ color: '#3A2A2A' }),
    sheath: clear('#F2E3B6', 0.3, { roughness: 0.4 }),
    ganglion: clear('#EBD39A', 0.4),
    sensory: tissue('#3D7DD8'),
    relay: tissue('#3DAE6B'),
    motor: tissue('#D6453D'),
    skin: tissue('#E8B59A'),
    muscle: tissue('#B5473F'),
    tendon: tissue('#EDE3CF'),
    synapse: glow('#F2C230', 0.9),
    impulse: glow('#FFF3B0', 2.2),
  }

  // ── Spinal cord: white matter around a butterfly of grey matter ──
  const H = 0.15
  const white = section(blob2d([[0.055, 0], [0.04, 0.034], [0, 0.04], [-0.04, 0.034], [-0.055, 0], [-0.04, -0.034], [0, -0.042], [0.04, -0.034]]), H, mats.white)
  const half = [[0.004, 0.006], [0.012, 0.012], [0.018, 0.024], [0.022, 0.034], [0.027, 0.031], [0.022, 0.012], [0.03, -0.006], [0.034, -0.022], [0.024, -0.03], [0.012, -0.018], [0.004, -0.008]]
  const butterfly = blob2d([...half, ...half.slice().reverse().map(([x, y]) => [-x, y])], 160)
  const grey = section(butterfly, H, mats.grey, 0.004)   // stands a little proud of the white matter
  const canal = mesh(new THREE.CircleGeometry(0.0025 * K, 16), mats.canal, CX, TOP + 0.0052, 0); canal.rotation.x = -PI / 2

  // ── Nerve roots and the spinal nerve (see-through sheaths, so the neurones show) ──
  const Y = 0.04                                    // height of the roots and nerves
  const G = V(CX + 0.125, Y, -0.052)                // dorsal root ganglion
  const J = V(CX + 0.185, Y, -0.005)                 // where the roots join
  const N = V(0.07, Y, 0)                           // where the spinal nerve branches
  const M = V(0.22, 0.15, 0.0)                      // the muscle (effector)
  const S = V(0.24, -0.115, 0.04)                    // the receptor in the skin
  const dorsalRoot = tube([[CX + 0.07, Y, -0.06], [CX + 0.09, Y, -0.058], G.toArray(), [CX + 0.16, Y, -0.034], J.toArray()], 0.009, mats.sheath, { seg: 48 })
  const ganglion = lumpy(0.017, 0.08, mats.ganglion, { scale: [1.4, 1, 1] }); ganglion.position.copy(G)
  const ventralRoot = tube([[CX + 0.07, Y, 0.06], [CX + 0.095, Y, 0.058], [CX + 0.15, Y, 0.03], J.toArray()], 0.008, mats.sheath, { seg: 48 })
  const spinalNerve = tube([J.toArray(), [CX + 0.21, Y, 0], N.toArray()], 0.012, mats.sheath, { seg: 32 })
  const toMuscle = tube([N.toArray(), [0.12, 0.07, 0], [0.18, 0.12, 0], [M.x - 0.03, M.y - 0.01, 0]], 0.007, mats.sheath, { seg: 48 })
  const toSkin = tube([N.toArray(), [0.12, 0.0, 0.01], [0.19, -0.07, 0.03], [S.x, S.y + 0.012, S.z]], 0.007, mats.sheath, { seg: 48 })

  // ── Effector: a muscle with its tendons ──
  const muscle = lumpy(0.034, 0.05, mats.muscle, { scale: [0.75, 1.9, 0.75], seed: 3 }); muscle.position.copy(M)
  const tendons = group(
    tube([[M.x, M.y + 0.06, 0], [M.x + 0.005, M.y + 0.1, 0]], 0.006, mats.tendon, { seg: 6 }),
    tube([[M.x, M.y - 0.06, 0], [M.x - 0.005, M.y - 0.1, 0]], 0.006, mats.tendon, { seg: 6 }),
  )
  const effector = group(muscle, tendons)

  // ── Skin with a pain receptor, and the stimulus (a pin) ──
  const skin = mesh(new THREE.BoxGeometry(0.17, 0.03, 0.12), mats.skin, S.x, S.y - 0.012, S.z)
  const ending = group()
  for (let k = 0; k < 5; k++) {
    const a = k / 5 * 2 * PI
    ending.add(tube([[S.x, S.y + 0.004, S.z], [S.x + 0.012 * Math.cos(a), S.y + 0.002, S.z + 0.012 * Math.sin(a)]], 0.0012, mats.sensory, { seg: 4, radial: 5 }))
  }
  const pin = group(
    mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.09, 10), metal('#C9CED6'), 0, 0.045, 0),
    mesh(new THREE.ConeGeometry(0.0015, 0.008, 10), metal('#C9CED6'), 0, -0.004, 0),
    mesh(new THREE.SphereGeometry(0.008, 20, 16), tissue('#C0392B'), 0, 0.092, 0),
  )
  const PIN_UP = 0.03
  pin.position.set(S.x + 0.004, S.y + 0.003 + PIN_UP, S.z + 0.004)

  // ── The three neurones of the arc ──
  const D = V(CX + 0.035, LAYER, -0.045)            // synapse in the dorsal (back) horn
  const R = V(CX + 0.04, LAYER, 0.03)               // synapse in the ventral (front) horn
  const sensoryPath = [S, V(0.19, -0.068, 0.03), V(0.12, Y + 0.0015, 0.008), N.clone().setY(Y + 0.002), J.clone().setZ(-0.008), V(CX + 0.16, Y, -0.036), G, V(CX + 0.09, Y + 0.004, -0.058), V(CX + 0.06, LAYER, -0.058), D]
  const relayPath = [D, V(CX + 0.012, LAYER, -0.014), V(CX + 0.02, LAYER, 0.014), R]
  const motorBody = V(CX + 0.052, LAYER, 0.04)
  const motorPath = [R, motorBody, V(CX + 0.068, LAYER, 0.054), V(CX + 0.095, Y, 0.06), V(CX + 0.13, Y - 0.002, 0.045), V(CX + 0.16, Y - 0.002, 0.022), J.clone().setY(Y - 0.002).setZ(-0.002), N.clone().setY(Y - 0.002), V(0.12, 0.068, -0.002), V(0.18, 0.118, -0.002), V(M.x - 0.022, M.y - 0.005, 0.012)]
  const curve = (pts) => new THREE.CatmullRomCurve3(pts, false, 'centripetal')
  const curves = { sensory: curve(sensoryPath), relay: curve(relayPath), motor: curve(motorPath) }
  const axon = (c, mat, r) => new THREE.Mesh(new THREE.TubeGeometry(c, 160, r, 8, false), mat)
  const sensory = group(axon(curves.sensory, mats.sensory, 0.0024), ending, mesh(new THREE.SphereGeometry(0.0065, 20, 16), mats.sensory, G.x, G.y, G.z))
  const relay = group(axon(curves.relay, mats.relay, 0.0022))
  const motor = group(axon(curves.motor, mats.motor, 0.0024), mesh(new THREE.SphereGeometry(0.0065, 20, 16), mats.motor, motorBody.x, motorBody.y, motorBody.z))
  // Motor end plates where the motor neurone meets the muscle.
  const plates = group()
  for (const [dy, dz] of [[0.012, 0.004], [-0.004, 0.018], [-0.018, 0.006]]) plates.add(mesh(new THREE.SphereGeometry(0.0035, 12, 10), mats.motor, M.x - 0.022, M.y - 0.005 + dy, 0.012 + dz * 0.5))
  motor.add(plates)
  const synapses = group(mesh(new THREE.SphereGeometry(0.0042, 16, 12), mats.synapse, D.x, D.y + 0.001, D.z), mesh(new THREE.SphereGeometry(0.0042, 16, 12), mats.synapse, R.x, R.y + 0.001, R.z))

  // The impulse: a bright pulse that travels round the arc.
  const impulse = mesh(new THREE.SphereGeometry(0.0075, 20, 16), mats.impulse)
  impulse.visible = false

  const root = group(white, grey, canal, dorsalRoot, ganglion, ventralRoot, spinalNerve, toMuscle, toSkin, effector, skin, pin, sensory, relay, motor, synapses, impulse)

  const p = (v) => v.toArray()
  const parts = [
    { id: 'stimulus', name: 'Stimulus (a pin)', objects: [pin], anchor: [pin.position.x, pin.position.y + 0.092, pin.position.z], info: 'A change in the surroundings that the body detects, here a sharp pin pricking the skin.' },
    { id: 'receptor', name: 'Receptor (pain receptor in the skin)', objects: [ending, skin], anchor: [S.x - 0.012, S.y + 0.004, S.z + 0.01], info: 'Nerve endings in the skin that detect the stimulus and start nerve impulses (electrical signals) in the sensory neurone.' },
    { id: 'sensory', name: 'Sensory neurone', objects: [sensory], anchor: p(curves.sensory.getPointAt(0.2)), info: 'Carries impulses from the receptor to the spinal cord. Its cell body is in the dorsal root ganglion, outside the cord.' },
    { id: 'ganglion', name: 'Dorsal root ganglion', objects: [ganglion], anchor: [G.x, G.y + 0.016, G.z], info: 'A swelling on the dorsal (back) root that holds the cell bodies of the sensory neurones.' },
    { id: 'relay', name: 'Relay neurone', objects: [relay], anchor: p(curves.relay.getPointAt(0.5)), info: 'A short neurone inside the spinal cord (part of the central nervous system) that passes the impulse from the sensory neurone to the motor neurone.' },
    { id: 'synapse', name: 'Synapses', objects: [synapses], anchor: [D.x, D.y + 0.004, D.z], info: 'Tiny gaps between neurones. The impulse crosses them as a chemical (neurotransmitter) that diffuses across the gap, so impulses can only go one way.' },
    { id: 'motor', name: 'Motor neurone', objects: [motor], anchor: p(curves.motor.getPointAt(0.82)), info: 'Carries impulses from the spinal cord to the effector. Its cell body is in the ventral (front) horn of the grey matter.' },
    { id: 'effector', name: 'Effector (muscle)', objects: [effector], anchor: [M.x + 0.02, M.y + 0.02, M.z + 0.01], info: 'The muscle that responds: it contracts and pulls the hand away from the pin.' },
    { id: 'grey', name: 'Grey matter', objects: [grey], anchor: [CX - 0.047, LAYER, 0.016], info: 'The butterfly-shaped core of the spinal cord, made of nerve cell bodies, relay neurones and synapses.' },
    { id: 'white', name: 'White matter', objects: [white], anchor: [CX - 0.088, TOP, 0.006], info: 'Bundles of nerve fibres (axons) around the grey matter, carrying impulses up to the brain and down from it.' },
    { id: 'cord', name: 'Spinal cord', objects: [white, grey], anchor: [CX - 0.09, -0.04, 0.03], info: 'Part of the central nervous system, running down inside the vertebral column. Simple reflexes are coordinated here, without the brain.' },
    { id: 'dorsal', name: 'Dorsal root', objects: [dorsalRoot], anchor: [CX + 0.09, Y + 0.008, -0.058], info: 'The back root of a spinal nerve: impulses come into the cord along it.' },
    { id: 'ventral', name: 'Ventral root', objects: [ventralRoot], anchor: [CX + 0.1, Y - 0.006, 0.058], info: 'The front root of a spinal nerve: impulses leave the cord along it.' },
    { id: 'nerve', name: 'Spinal nerve', objects: [spinalNerve, toMuscle, toSkin], anchor: [CX + 0.22, Y + 0.012, 0], info: 'A nerve contains both sensory and motor neurones, bundled together.' },
  ]

  // ── The reflex in action (one cycle every 4 s) ──
  let phase = 0
  const show = (c, u) => { impulse.visible = true; impulse.position.copy(c.getPointAt(Math.min(1, Math.max(0, u)))) }
  const set = (k) => {
    phase = k
    const press = k < 0.12 ? smooth(k / 0.12) : k < 0.85 ? 1 : 1 - smooth((k - 0.85) / 0.15)
    pin.position.y = S.y + 0.003 + PIN_UP * (1 - press)
    impulse.visible = false
    if (k >= 0.12 && k < 0.45) show(curves.sensory, (k - 0.12) / 0.33)
    else if (k >= 0.45 && k < 0.55) show(curves.relay, (k - 0.45) / 0.1)
    else if (k >= 0.55 && k < 0.82) show(curves.motor, (k - 0.55) / 0.27)
    const c = k >= 0.8 && k < 0.95 ? smooth(Math.min(1, (k - 0.8) / 0.06)) : k >= 0.95 ? 1 - smooth((k - 0.95) / 0.05) : 0
    muscle.scale.set(1 + 0.22 * c, 1 - 0.18 * c, 1 + 0.22 * c)
  }
  set(0.9)
  return {
    root, parts,
    animateLabel: 'Prick the skin',
    tick: (t) => set((t % 4) / 4),
    reset: () => set(0.9),
    status: () => phase < 0.12 ? 'Stimulus: the pin pricks the skin.'
      : phase < 0.45 ? 'Receptor → sensory neurone: an impulse travels to the spinal cord.'
        : phase < 0.55 ? 'Relay neurone in the spinal cord passes the impulse on, across synapses.'
          : phase < 0.82 ? 'Motor neurone: the impulse travels to the effector.'
            : 'Response: the muscle contracts and pulls the hand away, before the brain is even aware of the pain.',
    view: { yaw: 0.3, pitch: 0.75 },
  }
}
