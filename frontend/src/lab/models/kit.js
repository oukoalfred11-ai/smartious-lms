/**
 * kit.js — shared building blocks for the labelled 3D models.
 *
 * Every model is original geometry built in code (no model files, nothing to
 * licence). A model module exports build(THREE) and returns:
 *
 *   {
 *     root,                      Object3D, centred on the origin, about 0.5 m across
 *     parts: [{ id, name, info, objects: [Object3D], anchor: [x, y, z] }],
 *                                what can be labelled, clicked and quizzed
 *     tick?(t, dt),              animation (heartbeat, motor turning, engine cycle)
 *     animateLabel?,             e.g. 'Beat', 'Run the motor'
 *     status?(),                 one line about the moment shown (the engine's stroke)
 *     cutaway?(on),              show or hide the cut-away
 *     explode?(f),               0…1 pull the parts apart
 *     view?: { yaw, pitch }      the best first view
 *   }
 *
 * Anchors are in root coordinates: where the label's leader line points.
 */
import * as THREE from 'three'

export const PI = Math.PI

/** Moist tissue: soft sheen and a clear coat, like a wet specimen. */
export function tissue(color, o = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.55, clearcoat: 0.6, clearcoatRoughness: 0.35, sheen: 0.4, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#FFFFFF'), 0.4), ...o })
}
export function plastic(color, o = {}) { return new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.05, ...o }) }
export function metal(color = '#B9C0C8', o = {}) { return new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.85, ...o }) }
export function clear(color = '#DDEBF5', opacity = 0.25, o = {}) {
  return new THREE.MeshPhysicalMaterial({ color, transparent: true, opacity, roughness: 0.08, metalness: 0, depthWrite: false, side: THREE.DoubleSide, ...o })
}
export function glow(color, i = 1.2) { return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: i, roughness: 0.4 }) }

export function mesh(geo, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m }
export function group(...children) { const g = new THREE.Group(); for (const c of children) if (c) g.add(c); return g }

/** Surface of revolution about +y from [radius, y] points; phi limits make a cut-away. */
export function lathe(points, mat, { seg = 48, phiStart = 0, phiLength = 2 * PI } = {}) {
  return new THREE.Mesh(new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), seg, phiStart, phiLength), mat)
}
/** Points on an ellipse arc (for lathe profiles): centre (cx, cy), radii (rx, ry), angles a0→a1 from +y. */
export function arc(cx, cy, rx, ry, a0, a1, n = 24) {
  const out = []
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([cx + rx * Math.sin(a), cy + ry * Math.cos(a)]) }
  return out
}
/** A tube along a smooth curve through points. */
export function tube(points, radius, mat, { seg = 64, radial = 16, closed = false, taper = null } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), closed)
  const geo = new THREE.TubeGeometry(curve, seg, radius, radial, closed)
  if (taper) {
    // Narrow the tube along its length: taper(u) scales the radius at u ∈ [0, 1].
    const pos = geo.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3()
    for (let i = 0; i <= seg; i++) {
      const u = i / seg, k = taper(u)
      curve.getPointAt(u, c)
      for (let j = 0; j <= radial; j++) {
        const idx = i * (radial + 1) + j
        v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(k).add(c)
        pos.setXYZ(idx, v.x, v.y, v.z)
      }
    }
    geo.computeVertexNormals()
  }
  return new THREE.Mesh(geo, mat)
}
/** A flat 2D outline extruded into a slab with rounded edges (for sections). */
export function slab(points, depth, mat, { bevel = 0.006, holes = [] } = {}) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)))
  for (const h of holes) shape.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))))
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 24 })
  geo.translate(0, 0, -depth / 2)
  return new THREE.Mesh(geo, mat)
}
/** Smooth closed outline through control points (Catmull-Rom), as 2D points. */
export function blob2d(points, n = 120) {
  const c = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, 0)), true, 'centripetal')
  return c.getSpacedPoints(n).slice(0, n).map(v => [v.x, v.y])
}
/** A sphere pushed in and out by a smooth bumpiness (for organelles and membranes). */
export function lumpy(radius, amount, mat, { seed = 1, seg = 48, scale = [1, 1, 1] } = {}) {
  const geo = new THREE.SphereGeometry(radius, seg, Math.round(seg * 0.75))
  const pos = geo.attributes.position, v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize()
    const k = 1 + amount * (Math.sin(v.x * 3.1 + seed) * Math.sin(v.y * 2.7 + seed * 2) + 0.6 * Math.sin(v.z * 4.3 + seed * 3))
    pos.setXYZ(i, v.x * radius * k * scale[0], v.y * radius * k * scale[1], v.z * radius * k * scale[2])
  }
  geo.computeVertexNormals()
  return new THREE.Mesh(geo, mat)
}
/** An arrow from a to b (for forces, current, flow). */
export function arrow(a, b, color, r = 0.004) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = d.length()
  const m = glow(color, 0.6)
  const shaft = mesh(new THREE.CylinderGeometry(r, r, L * 0.75, 12), m)
  const head = mesh(new THREE.ConeGeometry(r * 2.6, L * 0.25, 16), m)
  shaft.position.y = L * 0.375; head.position.y = L * 0.875
  const g = group(shaft, head)
  g.position.copy(A)
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())
  return g
}
/** Cut-away: clip the given materials with a plane (normal points to the part kept). */
export function clipper(normal, constant = 0) {
  const plane = new THREE.Plane(new THREE.Vector3(...normal).normalize(), constant)
  const roots = []
  // Materials are looked up each time: the viewer may have replaced them with its own copies.
  return {
    plane,
    add(...objects) { roots.push(...objects) },
    set(on) {
      for (const o of roots) o.traverse(x => {
        if (!x.isMesh) return
        for (const m of Array.isArray(x.material) ? x.material : [x.material]) { m.clippingPlanes = on ? [plane] : []; m.clipShadows = true; m.needsUpdate = true }
      })
    },
  }
}
/** Linear interpolation helpers for animation. */
export const lerp = (a, b, t) => a + (b - a) * t
export const smooth = (t) => t * t * (3 - 2 * t)
