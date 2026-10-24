/**
 * gltfModel.js — a real 3D model file (.glb / .gltf) as a labelled model.
 *
 *   fromGLTF({
 *     url,                          the file (e.g. /models/heart.glb, served from frontend/public)
 *     parts: [{ id, name, info, match?, material?, not?, anchor?, anchorFrom?, side? }],
 *                                   match: a RegExp tested on each mesh's name (and its parents'),
 *                                   or a list of exact names; material (RegExp) matches the Z-Anatomy
 *                                   material kept in the node's extras; not (RegExp) leaves names out;
 *                                   anchor (optional, root coordinates)
 *                                   overrides the automatic label point; anchorFrom (RegExp) picks
 *                                   which matched meshes the automatic point is taken from (e.g. /\.l$/
 *                                   for one of a pair, so the label does not point between them);
 *                                   side (+1 / −1) keeps only meshes on that side of the model (by position);
 *                                   centreOf (RegExp): put the label at the centre of those meshes (e.g. a socket);
 *                                   at (0…1) puts the label on the front of the part's meshes at that fraction
 *                                   of the model's height; with no match, on the model's front (for parts that
 *                                   are not separate meshes in the file, e.g. a rocket's stages)
 *     size = 0.5,                   longest side after fitting, in metres
 *     rotate = [0, 0, 0],           turn the file's own axes (radians) before fitting
 *     view, status, animateLabel,   as in kit.js
 *     cutaway: { normal, at },      optional cut: keep the side the normal points to, the fraction
 *                                   `at` (0…1) of the model's depth measured from that side
 *     materials: (mesh) => void,    optional fix-ups (e.g. make a membrane see-through)
 *     explode: [{ match, offset }   optional "pull apart" slider: meshes matching `match` slide by offset
 *               | { match, fade }],   ([x, y, z], root units after fitting) carrying their labels, or fade out
 *     explodeLabel,                 the slider's name (default "Pull apart")
 *     animations = true,            false: ignore animation clips stored in the file
 *     pose: seconds | 'end',        optional: hold the file's animations at that time (or their last frame)
 *   }) → build()                    the same contract as the models built in code (kit.js)
 *
 * Files compressed with meshopt (gltfpack -cc, or gltf-transform meshopt) or Draco load as well.
 * Every file used must come with a licence that allows it, and its credit is shown on
 * the model's page (catalogue.js: credit).
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { clipper } from './kit.js'

// three.js tidies node names (spaces → _, dots removed); the file's own name is kept in userData.name.
const nameChain = (o) => { const n = []; while (o) { if (o.userData?.name) n.push(o.userData.name); if (o.name) n.push(o.name); o = o.parent } return n }
const matches = (o, match) => {
  const names = nameChain(o)
  return Array.isArray(match) ? names.some(n => match.includes(n)) : names.some(n => match.test(n))
}
// Extra data written by tools/models/blend2glb.py (the Z-Anatomy material of each object).
const materialOf = (o) => { while (o) { if (o.userData?.material) return o.userData.material; o = o.parent } return '' }
/** A part's meshes: by name (match), by Z-Anatomy material (material), minus names matching `not`. */
const partMeshes = (meshes, p) => meshes.filter(m => (!p.match || matches(m, p.match)) && (!p.material || p.material.test(materialOf(m))) && !(p.not && matches(m, p.not)))

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

// Draco-compressed files (e.g. NASA's): the decoder (public/draco/, Apache 2.0)
// is fetched only when such a file is opened, and shared by every load.
let draco = null
const dracoLoader = () => (draco ||= new DRACOLoader().setDecoderPath('/draco/'))

// A point on the front (+z) surface at a fraction of the model's height: for
// parts that are not separate meshes in the file (e.g. a rocket's stages).
function frontPoint(meshes, root, f) {
  const box = new THREE.Box3().setFromObject(root)
  // Aim at the middle of these meshes (left to right), at that height of the whole model.
  const mid = new THREE.Box3()
  for (const m of meshes) mid.expandByObject(m)
  const x = mid.getCenter(new THREE.Vector3()).x
  const y = box.min.y + f * (box.max.y - box.min.y)
  const ray = new THREE.Raycaster(new THREE.Vector3(x, y, box.max.z + 1), new THREE.Vector3(0, 0, -1))
  const hit = ray.intersectObjects(meshes, false)[0]
  return root.worldToLocal(hit ? hit.point : new THREE.Vector3(x, y, mid.getCenter(new THREE.Vector3()).z)).toArray()
}

export function fromGLTF(spec) {
  return async function build({ onProgress } = {}) {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    loader.setDRACOLoader(dracoLoader())
    const gltf = await loader.loadAsync(spec.url, (e) => { if (onProgress && e.total) onProgress(e.loaded / e.total, e.total) })
    const scene = gltf.scene
    if (spec.pose != null && gltf.animations?.length) {
      // Hold the file's animations at one moment (e.g. a rover with its mast raised).
      const mx = new THREE.AnimationMixer(scene)
      for (const clip of gltf.animations) { const a = mx.clipAction(clip); a.setLoop(THREE.LoopOnce); a.clampWhenFinished = true; a.play() }
      mx.update(spec.pose === 'end' ? Math.max(...gltf.animations.map(c => c.duration)) : spec.pose)
    }
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
      if (p.at != null && !p.match && !p.material) {
        // Placed only by height (not separate meshes in the file): nothing to highlight.
        parts.push({ id: p.id, name: p.name, info: p.info, objects: [], anchor: p.anchor || frontPoint(meshes, root, p.at) })
        continue
      }
      const objects = partMeshes(meshes, p)
      if (!objects.length) { console.warn('[models] no mesh matches part', p.id, 'in', spec.url); continue }
      let from = p.anchorFrom ? objects.filter(m => matches(m, p.anchorFrom)) : objects
      if (p.side) {
        // Of a left–right pair, point at the one on this side (+1: the viewer's right in the front view).
        const onSide = from.filter(m => new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3()).x * p.side > 0)
        if (onSide.length) from = onSide
      }
      const pick = from.length ? from : objects
      const centreOf = p.centreOf && meshes.filter(m => matches(m, p.centreOf))
      const anchor = p.anchor
        || (centreOf?.length ? root.worldToLocal(centreOf.reduce((b, m) => b.expandByObject(m), new THREE.Box3()).getCenter(new THREE.Vector3())).toArray() : null)
        || (p.at != null ? frontPoint(pick, root, p.at) : labelPoint(pick, root, centre, cut?.plane))
      parts.push({ id: p.id, name: p.name, info: p.info, objects, anchor })
    }

    // Pull apart (the page's slider): groups of meshes slide by an offset (root units, after
    // fitting), carrying their labels; others fade out of the way.
    let explode
    if (spec.explode) {
      const k = holder.scale.x
      const moves = spec.explode.filter(g => g.offset).map(g => ({ meshes: meshes.filter(m => matches(m, g.match)), offset: new THREE.Vector3(...g.offset) }))
      const fades = meshes.filter(m => spec.explode.some(g => g.fade && matches(m, g.match)))
      moves.forEach(g => g.meshes.forEach(m => { m.userData.home = m.position.clone() }))
      fades.forEach(m => { m.material = m.material.clone(); m.userData.opacity = m.material.transparent ? m.material.opacity : 1 })
      parts.forEach(pt => {
        const g = moves.find(g => pt.objects.length && pt.objects.every(o => g.meshes.includes(o)))
        if (g) { pt.home = [...pt.anchor]; pt.move = g.offset }
      })
      explode = (f) => {
        moves.forEach(g => g.meshes.forEach(m => m.position.copy(m.userData.home).addScaledVector(g.offset, f / k)))
        fades.forEach(m => {
          const o = m.userData.opacity * (1 - f)
          m.material.transparent = o < 1; m.material.opacity = o; m.material.depthWrite = o >= 1; m.visible = o > 0.02
        })
        parts.forEach(pt => {
          if (pt.move) pt.anchor = pt.home.map((v, i) => v + pt.move.getComponent(i) * f)
          if (pt.objects.length && pt.objects.every(o => fades.includes(o))) pt.hidden = f > 0.6   // its label goes too
        })
      }
    }

    // Animation stored in the file (if any) plays with the Animate button.
    let mixer = null
    if (gltf.animations?.length && spec.animations !== false && spec.pose == null) {
      mixer = new THREE.AnimationMixer(scene)
      for (const clip of gltf.animations) mixer.clipAction(clip).play()
    }
    return {
      root, parts,
      animateLabel: spec.animateLabel || (mixer ? 'Animate' : undefined),
      tick: mixer ? (t, dt = 0.016) => mixer.update(dt) : undefined,
      status: spec.status,
      cutaway: cut ? (on) => cut.set(on) : undefined,
      explode, explodeLabel: spec.explodeLabel,
      reset: mixer ? () => mixer.setTime(0) : undefined,
      view: spec.view || { yaw: 0.4, pitch: 0.25 },
    }
  }
}
