// A four-stroke petrol engine, one cylinder, cut away at the front so the
// piston, valves and crankshaft can be watched through the cycle:
// induction, compression, power, exhaust (two turns of the crankshaft).
import * as THREE from 'three'
import { PI, plastic, metal, clear, glow, mesh, group, lathe, tube, clipper, smooth } from './kit.js'

const CRANK_Y = -0.15, THROW = 0.045, ROD = 0.135, BORE = 0.052
const PIN_ABOVE_CROWN = 0.032             // gudgeon pin below the piston crown
const HEAD_Y = 0.105                      // underside of the cylinder head

export default function build() {
  const m = {
    block: metal('#B4BCC5', { roughness: 0.5, metalness: 0.45, side: THREE.DoubleSide }),
    blockCut: plastic('#B9C0C7', { roughness: 0.7 }),
    head: metal('#A3ABB4', { roughness: 0.45, metalness: 0.5, side: THREE.DoubleSide }),
    piston: metal('#D2D6DB', { roughness: 0.25 }),
    ring: metal('#3A3E44', { roughness: 0.4 }),
    rod: metal('#9EA6AF', { roughness: 0.3 }),
    crank: metal('#9AA1A9', { roughness: 0.3 }),
    valve: metal('#C8CDD3', { roughness: 0.25 }),
    spring: metal('#5F8F6F', { roughness: 0.4 }),
    plugBody: plastic('#F4F1EA', { roughness: 0.3 }),
    plugMetal: metal('#B9C0C8'),
    intake: clear('#7FB2FF', 0.28),
    exhaust: clear('#9A9A9A', 0.32),
    fly: metal('#767D85', { roughness: 0.4 }),
  }
  const root = new THREE.Group()
  const cut = clipper([0, 0, -1], 0.0)

  // Cylinder (cut in half at the front) and crankcase.
  const cylinder = lathe([[BORE, -0.06], [BORE + 0.022, -0.06], [BORE + 0.022, HEAD_Y], [BORE, HEAD_Y]], m.block, { seg: 64 })
  const fins = group()
  for (let i = 0; i < 6; i++) fins.add(lathe([[BORE + 0.022, 0.0 + i * 0.019], [BORE + 0.045, 0.002 + i * 0.019], [BORE + 0.045, 0.008 + i * 0.019], [BORE + 0.022, 0.01 + i * 0.019]], m.block, { seg: 64 }))
  const crankcase = mesh(new THREE.BoxGeometry(0.26, 0.15, 0.16), m.block, 0, CRANK_Y + 0.0, 0)
  const crankcaseInside = mesh(new THREE.BoxGeometry(0.24, 0.13, 0.14), plastic('#7A828C', { roughness: 0.8, side: THREE.BackSide }), 0, CRANK_Y + 0.0, 0)
  // Cylinder head with the inlet and exhaust ports.
  const head = mesh(new THREE.BoxGeometry(0.2, 0.06, 0.14), m.head, 0, HEAD_Y + 0.03, 0)
  const chamber = lathe([[0, HEAD_Y + 0.012], [BORE * 0.95, HEAD_Y + 0.004], [BORE, HEAD_Y]], m.blockCut, { seg: 48 })
  const inletPort = tube([[-0.024, HEAD_Y + 0.004, 0], [-0.04, HEAD_Y + 0.03, 0], [-0.08, HEAD_Y + 0.045, 0], [-0.15, HEAD_Y + 0.05, 0]], 0.014, m.head, { seg: 30, radial: 18 })
  const exhaustPort = tube([[0.024, HEAD_Y + 0.004, 0], [0.04, HEAD_Y + 0.03, 0], [0.08, HEAD_Y + 0.045, 0], [0.15, HEAD_Y + 0.05, 0]], 0.014, m.head, { seg: 30, radial: 18 })
  root.add(cylinder, fins, crankcase, crankcaseInside, head, chamber, inletPort, exhaustPort)
  cut.add(cylinder, fins, crankcase, crankcaseInside, head, inletPort, exhaustPort, chamber)

  // Gas in the cylinder above the piston, coloured by stroke.
  const gasMat = new THREE.MeshStandardMaterial({ color: '#7FB2FF', transparent: true, opacity: 0.35, depthWrite: false, emissive: '#000000' })
  const gas = mesh(new THREE.CylinderGeometry(BORE * 0.985, BORE * 0.985, 1, 40), gasMat)
  root.add(gas)

  // Piston with rings, connecting rod, crankshaft with counterweights, flywheel.
  const piston = group(mesh(new THREE.CylinderGeometry(BORE * 0.98, BORE * 0.98, 0.055, 40), m.piston, 0, -0.0275, 0))
  for (const y of [-0.008, -0.016, -0.024]) { const r = mesh(new THREE.TorusGeometry(BORE * 0.985, 0.0018, 8, 40), m.ring, 0, y, 0); r.rotation.x = PI / 2; piston.add(r) }
  const pin = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 16), m.rod); pin.rotation.x = PI / 2; pin.position.y = -PIN_ABOVE_CROWN
  piston.add(pin)
  const rod = group(mesh(new THREE.BoxGeometry(0.018, 1, 0.012), m.rod), mesh(new THREE.TorusGeometry(0.012, 0.005, 10, 20), m.rod), mesh(new THREE.TorusGeometry(0.019, 0.007, 10, 24), m.rod))
  const crankshaft = new THREE.Group()
  crankshaft.position.set(0, CRANK_Y, 0)
  const journal = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.3, 20), m.crank); journal.rotation.x = PI / 2
  const crankPin = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 18), m.crank, 0, THROW, 0); crankPin.rotation.x = PI / 2
  const web = (z) => { const sh = new THREE.Shape(); sh.absarc(0, 0, 0.042, PI * 1.1, PI * 1.9, false); sh.lineTo(0.016, THROW); sh.absarc(0, THROW, 0.018, 0, PI, false); sh.lineTo(-0.016, 0); const g = new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false, curveSegments: 24 }); g.translate(0, 0, z - 0.006); return new THREE.Mesh(g, m.crank) }
  crankshaft.add(journal, crankPin, web(0.031), web(-0.031))
  const flywheel = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.022, 48), m.fly); flywheel.rotation.x = PI / 2; flywheel.position.z = -0.14
  const flyHub = mesh(new THREE.TorusGeometry(0.075, 0.006, 8, 48), m.crank, 0, 0, -0.128)
  crankshaft.add(flywheel, flyHub)
  root.add(piston, rod, crankshaft)

  // Valves (poppet valves with springs) and the spark plug.
  const valve = (x) => {
    const g = new THREE.Group()
    g.add(lathe([[0, 0], [0.019, 0], [0.019, 0.003], [0.005, 0.012], [0.004, 0.012]], m.valve, { seg: 32 }))
    g.add(mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.09, 12), m.valve, 0, 0.055, 0))
    const coil = tube(Array.from({ length: 50 }, (_, i) => [0.01 * Math.cos(i * 0.9), 0.06 + i * 0.0007, 0.01 * Math.sin(i * 0.9)]), 0.0016, m.spring, { seg: 120, radial: 6 })
    g.add(coil)
    g.position.set(x, HEAD_Y + 0.001, 0)
    return g
  }
  const inlet = valve(-0.024), exhaustV = valve(0.024)
  const plug = group(
    mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.03, 16), m.plugMetal, 0, HEAD_Y + 0.015, 0),
    mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.045, 16), m.plugBody, 0, HEAD_Y + 0.06, 0),
    mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.012, 10), m.plugMetal, 0, HEAD_Y + 0.088, 0),
  )
  const spark = mesh(new THREE.SphereGeometry(0.01, 16, 12), glow('#FFE680', 3), 0, HEAD_Y - 0.006, 0); spark.visible = false
  root.add(inlet, exhaustV, plug, spark)
  // Fuel–air mixture coming in and exhaust gases going out, shown in the ports.
  const inFlow = tube([[-0.15, HEAD_Y + 0.05, 0], [-0.08, HEAD_Y + 0.045, 0], [-0.04, HEAD_Y + 0.03, 0]], 0.011, m.intake, { seg: 20, radial: 12 })
  const outFlow = tube([[0.04, HEAD_Y + 0.03, 0], [0.08, HEAD_Y + 0.045, 0], [0.15, HEAD_Y + 0.05, 0]], 0.011, m.exhaust, { seg: 20, radial: 12 })
  root.add(inFlow, outFlow)
  cut.set(true)

  // Kinematics: crank angle a (0 = piston at the top), the cycle takes two turns (0 → 4π).
  let a = 0, stroke = 'induction'
  const pinY = (ang) => CRANK_Y + THROW * Math.cos(ang) + Math.sqrt(ROD * ROD - Math.pow(THROW * Math.sin(ang), 2))
  const lift = (u) => (u <= 0 || u >= 1 ? 0 : 0.011 * Math.sin(u * PI))
  const colours = { induction: ['#7FB2FF', 0.32, 0], compression: ['#4E7FE0', 0.5, 0], power: ['#FF8A2B', 0.75, 1.2], exhaust: ['#8D8D8D', 0.45, 0] }
  function setAngle(ang) {
    a = ((ang % (4 * PI)) + 4 * PI) % (4 * PI)
    const py = pinY(a), crown = py + PIN_ABOVE_CROWN
    piston.position.y = crown
    const cp = new THREE.Vector3(THROW * Math.sin(a), CRANK_Y + THROW * Math.cos(a), 0)
    const pp = new THREE.Vector3(0, py, 0)
    const mid = cp.clone().add(pp).multiplyScalar(0.5), len = cp.distanceTo(pp)
    rod.position.copy(mid)
    rod.children[0].scale.y = len - 0.02
    rod.children[1].position.y = len / 2; rod.children[2].position.y = -len / 2
    rod.rotation.z = Math.atan2(-(pp.x - cp.x), pp.y - cp.y)
    crankshaft.rotation.z = -a
    stroke = a < PI ? 'induction' : a < 2 * PI ? 'compression' : a < 3 * PI ? 'power' : 'exhaust'
    inlet.position.y = HEAD_Y + 0.001 - lift(a / PI)
    exhaustV.position.y = HEAD_Y + 0.001 - lift((a - 3 * PI) / PI)
    const gh = HEAD_Y - crown
    gas.scale.y = Math.max(0.001, gh); gas.position.y = crown + gh / 2
    const [c, op, em] = colours[stroke]
    gasMat.color.set(c); gasMat.opacity = op
    const burn = stroke === 'power' ? Math.max(0, 1 - (a - 2 * PI) / PI) : 0
    gasMat.emissive.set(stroke === 'power' ? '#FF6A00' : '#000000'); gasMat.emissiveIntensity = em * burn
    spark.visible = a > 2 * PI - 0.08 && a < 2 * PI + 0.18
    inFlow.visible = stroke === 'induction'; outFlow.visible = stroke === 'exhaust'
  }
  setAngle(0.6)

  const parts = [
    { id: 'piston', name: 'Piston', objects: [piston], anchor: [0, 0.0, BORE * 0.6], info: 'Slides up and down in the cylinder. The expanding hot gases push it down in the power stroke; piston rings seal it against the cylinder wall.' },
    { id: 'cylinder', name: 'Cylinder', objects: [cylinder, fins], anchor: [-(BORE + 0.03), 0.03, -0.012], info: 'The tube the piston moves in. The fins on the outside give a large surface area so the engine loses heat to the air.' },
    { id: 'rod', name: 'Connecting rod', objects: [rod], anchor: [0.008, CRANK_Y + 0.09, 0.006], info: 'Joins the piston to the crankshaft, changing the up-and-down motion of the piston into turning motion.' },
    { id: 'crank', name: 'Crankshaft', objects: [crankshaft], anchor: [0.05, CRANK_Y - 0.02, 0.03], info: 'Turned by the connecting rod. It turns twice in each four-stroke cycle and drives the wheels through the gearbox.' },
    { id: 'flywheel', name: 'Flywheel', objects: [flywheel, flyHub], anchor: [0.08, CRANK_Y + 0.05, -0.13], info: 'A heavy wheel on the crankshaft. Its inertia keeps the engine turning smoothly through the three strokes that do not produce power.' },
    { id: 'inlet', name: 'Inlet valve', objects: [inlet], anchor: [-0.024, HEAD_Y + 0.04, 0.004], info: 'Opens in the induction stroke to let the fuel–air mixture into the cylinder; closed in the other three strokes.' },
    { id: 'exhaust', name: 'Exhaust valve', objects: [exhaustV], anchor: [0.024, HEAD_Y + 0.04, 0.004], info: 'Opens in the exhaust stroke so the rising piston pushes the burnt gases out.' },
    { id: 'plug', name: 'Spark plug', objects: [plug], anchor: [0, HEAD_Y + 0.07, 0.006], info: 'Makes a spark at the end of the compression stroke that ignites the compressed fuel–air mixture.' },
    { id: 'gas', name: 'Combustion chamber (gas)', objects: [gas], anchor: [0.03, HEAD_Y - 0.01, 0.0], info: 'The space above the piston. Blue: fuel–air mixture; orange: burning gas expanding; grey: exhaust gases (mainly carbon dioxide and water vapour).' },
    { id: 'inport', name: 'Inlet port (fuel–air in)', objects: [inletPort, inFlow], anchor: [-0.13, HEAD_Y + 0.05, 0.0], info: 'Carries the fuel–air mixture to the inlet valve.' },
    { id: 'outport', name: 'Exhaust port (gases out)', objects: [exhaustPort, outFlow], anchor: [0.13, HEAD_Y + 0.05, 0.0], info: 'Carries the exhaust gases away to the exhaust pipe.' },
  ]
  const words = {
    induction: '1. Induction: the inlet valve is open and the piston moves down, drawing fuel–air mixture into the cylinder.',
    compression: '2. Compression: both valves are closed and the piston moves up, squeezing the mixture into a small volume.',
    power: '3. Power: a spark ignites the mixture; the hot gases expand and push the piston down, turning the crankshaft (the only stroke that does work).',
    exhaust: '4. Exhaust: the exhaust valve opens and the piston moves up, pushing the burnt gases out.',
  }
  return {
    root, parts,
    animateLabel: 'Run the engine',
    tick: (t, dt = 0.016) => setAngle(a + dt * 2.2),
    status: () => words[stroke],
    cutaway: (on) => cut.set(on),
    reset: () => setAngle(0.6),
    view: { yaw: 0.35, pitch: 0.25 },
  }
}
