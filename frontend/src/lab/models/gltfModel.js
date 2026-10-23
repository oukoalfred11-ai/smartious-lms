/**
 * gltfModel.js — a real 3D model file (.glb / .gltf) as a labelled model.
 *
 *   fromGLTF({
 *     url,                          the file (e.g. /models/heart.glb, served from frontend/public)
 *     parts: [{ id, name, info, match, anchor? }],
 *                                   match: a RegExp tested on each mesh's name (and its parents'),
 *                                   or a list of exact names; anchor (optional, root coordinates)
 *                                   overrides the automatic label point
 *     size = 0.5,                   longest side after fitting, in metres
 *     rotate = [0, 0, 0],           turn the file's own axes (radians) before fitting
 *     view, status, animateLabel,   as in kit.js
 *     cutaway: { normal, at },      optional cut: keep the side the normal points to, the fraction
 *                                   `at` (0…1) of the model's depth measured from that side
 *     materials: (mesh) => void,    optional fix-ups (e.g. make a membrane see-through)
 *   }) → build()                    the same contract as the models built in code (kit.js)
 *
 * Files compressed with meshopt (gltfpack -cc, or gltf-transform meshopt) load as well.
 * Every file used must come with a licence that allows it, and its credit is shown on
 * the model's page (catalogue.js: credit).
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { clipper } from './kit.js'

const nameChain = (o) => { const n = []; while (o) { if (o.name) n.push(o.name); o = o.parent } return n }
const matches = (o, match) => {
  const names = nameChain(o)
  return Array.isArray(match) ? names.some(n => match.includes(n)) : names.some(n => match.test(n))
}

/** A point on the outside of a part, facing away from the model's centre: where its label line ends. */
function labelPoint(meshes, root, centre, plane = null) {
  const box = new THREE.Box3()
  for (const m of meshes) box.expandByObject(m)
  if (box.isEmpty()) return [0, 0, 0]
  const c = box.getCenter(new THREE.Vector3())
  const out = c.clone().sub(centre)
  if (out.lengthSq() < 1e-10) out.set(0, 0, 1)
  out.normalize()
  let best = null, bestScore = -Infinity
  const v = new THREE.Vector3()
  for (const m of meshes) {
    const pos = m.geometry?.attributes?.position
    if (!pos) continue
    const step = Math.max(1, Math.floor(pos.count / 1500))
    for (let i = 0; i < pos.count; i += step) {
      v.fromBufferAttribute(pos, i)
      m.localToWorld(v)
      if (plane && plane.distanceToPoint(v) < 0) continue          // removed by the cut-away
      // Far out in the part's own direction, but not far from the part's middle.
      const score = v.clone().sub(c).dot(out) - 0.35 * v.distanceTo(c)
      if (score > bestScore) { bestScore = score; best = v.clone() }
    }
  }
  return root.worldToLocal(best || c).toArray()
}

export function fromGLTF(spec) {
  return async function build() {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    const gltf = await loader.loadAsync(spec.url)
    const scene = gltf.scene
    const root = new THREE.Group()
    const holder = new THREE.Group()
    holder.rotation.set(...(spec.rotate || [0, 0, 0]))
    holder.add(scene)
    root.add(holder)
    root.updateMatrixWorld(true)
    // Fit: centre on the origin, longest side = size.
    const box = new THREE.Box3().setFromObject(holder)
    const dims = box.getSize(new THREE.Vector3())
    const k = (spec.size || 0.5) / Math.max(dims.x, dims.y, dims.z, 1e-9)
    holder.scale.multiplyScalar(k)
    root.updateMatrixWorld(true)
    const box2 = new THREE.Box3().setFromObject(holder)
    holder.position.sub(box2.getCenter(new THREE.Vector3()))
    root.updateMatrixWorld(true)

    const meshes = []
    scene.traverse(o => { if (o.isMesh) { meshes.push(o); spec.materials?.(o) } })
    const centre = new THREE.Box3().setFromObject(holder).getCenter(new THREE.Vector3())
    let cut = null
    if (spec.cutaway) {
      const b = new THREE.Box3().setFromObject(holder)
      const n = new THREE.Vector3(...spec.cutaway.normal).normalize()
      const lo = Math.min(b.min.dot(n), b.max.dot(n)), hi = Math.max(b.min.dot(n), b.max.dot(n))
      // Keep the part the normal points to: the fraction `at` of the model's depth, from that side.
      cut = clipper(n.toArray(), -(hi - (hi - lo) * (spec.cutaway.at ?? 0.5)))
      cut.add(holder)
      cut.set(true)
    }
    const parts = []
    for (const p of spec.parts) {
      const objects = meshes.filter(m => matches(m, p.match))
      if (!objects.length) { console.warn('[models] no mesh matches part', p.id, 'in', spec.url); continue }
      parts.push({ id: p.id, name: p.name, info: p.info, objects, anchor: p.anchor || labelPoint(objects, root, centre, cut?.plane) })
    }

    // Animation stored in the file (if any) plays with the Animate button.
    let mixer = null
    if (gltf.animations?.length) {
      mixer = new THREE.AnimationMixer(scene)
      for (const clip of gltf.animations) mixer.clipAction(clip).play()
    }
    return {
      root, parts,
      animateLabel: spec.animateLabel || (mixer ? 'Animate' : undefined),
      tick: mixer ? (t, dt = 0.016) => mixer.update(dt) : undefined,
      status: spec.status,
      cutaway: cut ? (on) => cut.set(on) : undefined,
      reset: mixer ? () => mixer.setTime(0) : undefined,
      view: spec.view || { yaw: 0.4, pitch: 0.25 },
    }
  }
}
