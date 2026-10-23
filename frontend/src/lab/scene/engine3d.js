/**
 * engine3d.js — the reusable 3D laboratory framework (Three.js).
 *
 *   const lab = createLabScene(container, { lowGraphics, onPick, freeOrbit, background })
 *   (freeOrbit: orbit all round a model, with clipping for cut-aways)
 *   lab.add(object, { pick: { kind, id } })   register pickable meshes
 *   lab.invalidate()                          request a re-render
 *   lab.resetView()                           default camera
 *   lab.dispose()                             free GPU memory and listeners
 *
 * Hands-on additions:
 *   pick.move = true        the object can be picked up and carried: press
 *                           and drag it (a plain click still uses it). It is
 *                           carried just above the bench plane and set down
 *                           on release; H().moved(pick, obj, point) is
 *                           told, and H().moveBounds(pick) may limit
 *                           where it goes. A carried object is lifted and a
 *                           ring shows where it will land.
 *   lab.focusOn(obj)        fly the camera to look closely at an object
 *   lab.fitTo(box3)         frame a work area (Box3) so it fills the view
 *   lab.ring(name, obj, colour)  a ring on the bench under obj (hover,
 *                           the quest's target); obj null removes it
 *   lab.project(vec3)       screen position in CSS px, for HTML name tags
 *   lab.onRendered(fn)      called after each drawn frame (tags follow)
 *
 * Rendering is on demand: a frame is drawn only when something changed
 * (camera moved, state updated, an animation is running). The loop stops
 * when the tab is hidden or the viewport is off screen. Every geometry,
 * material and texture created through the scene is disposed on unmount.
 * Nothing here decides a scientific result; scenes only display the view
 * computed by the shared engine.
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch { return false }
}

/**
 * A small room for reflections: grey walls, a bright ceiling panel (the lab
 * lights) and a window on one side. Built from core three.js, so there is no
 * environment file to download.
 */
function studioRoom() {
  const room = new THREE.Scene()
  const shell = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 10), new THREE.MeshStandardMaterial({ color: '#8C939B', side: THREE.BackSide, roughness: 1 }))
  shell.position.y = 2.5
  room.add(shell)
  const glow = (c, i) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i) })
  const panel = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); room.add(o) }
  panel(4, 0.05, 1.2, glow('#FFFFFF', 6), 0, 4.95, 0)              // ceiling lights
  panel(2.5, 0.05, 0.6, glow('#FFFFFF', 4), -2.5, 4.95, 2)
  panel(0.05, 2.2, 3.5, glow('#EAF3FF', 3.2), -4.95, 2.4, -0.5)     // window
  panel(10, 0.02, 10, new THREE.MeshStandardMaterial({ color: '#4A4F56', roughness: 1 }), 0, 0.01, 0)   // floor
  panel(6, 1, 0.05, new THREE.MeshStandardMaterial({ color: '#D8DCE0', roughness: 1 }), 0, 1.6, -4.95)  // tiled wall
  return room
}

export function createLabScene(container, { lowGraphics = false, onPick = null, onHoverPick = null, view = { pos: [0, 1.25, 1.35], target: [0, 0.95, 0] }, freeOrbit = false, background = '#EEF1F4' } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: !lowGraphics, powerPreference: lowGraphics ? 'low-power' : 'high-performance' })
  renderer.setPixelRatio(lowGraphics ? 1 : Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  // Filmic tone mapping keeps white glassware and labels from washing out.
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  const maxAniso = renderer.capabilities.getMaxAnisotropy?.() || 1
  renderer.shadowMap.enabled = !lowGraphics
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.touchAction = 'none'
  renderer.domElement.setAttribute('aria-hidden', 'true')
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(background)
  const camera = new THREE.PerspectiveCamera(42, 1, 0.02, 30)

  // Reflections: glass, metal and liquids reflect a soft laboratory room
  // (baked once into an environment map; skipped in low graphics).
  let envTex = null
  if (!lowGraphics) {
    const pm = new THREE.PMREMGenerator(renderer)
    const room = studioRoom()
    envTex = pm.fromScene(room, 0.03).texture
    scene.environment = envTex
    scene.environmentIntensity = 0.55
    disposeTree(room); pm.dispose()
  }

  // Lighting: soft fill + key light with shadows (disabled in low graphics).
  const hemi = new THREE.HemisphereLight('#ffffff', '#b9c2cc', lowGraphics ? 1.1 : 0.8)
  scene.add(hemi)
  const key = new THREE.DirectionalLight('#ffffff', 1.6)
  key.position.set(1.4, 2.6, 1.6)
  key.castShadow = !lowGraphics
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.near = 0.5; key.shadow.camera.far = 6
  Object.assign(key.shadow.camera, { left: -1.4, right: 1.4, top: 1.4, bottom: -1.4 })
  scene.add(key)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = !lowGraphics
  controls.dampingFactor = 0.12
  controls.minDistance = 0.35
  controls.maxDistance = 3.2
  if (freeOrbit) {
    // A model on a stand: walk all the way round it, close up or from afar.
    controls.minPolarAngle = 0.05; controls.maxPolarAngle = Math.PI - 0.05
    controls.minDistance = 0.12; controls.maxDistance = 4
    renderer.localClippingEnabled = true            // cut-away views
  } else {
    // Stay standing at the bench: no looking from under it or behind it.
    controls.minPolarAngle = Math.PI * 0.12
    controls.maxPolarAngle = Math.PI * 0.47
    controls.minAzimuthAngle = -1.15
    controls.maxAzimuthAngle = 1.15
  }
  controls.listenToKeyEvents?.(container)       // arrow keys pan when the viewport has focus
  controls.keyPanSpeed = 14

  const resetView = () => {
    camera.position.set(...view.pos)
    controls.target.set(...view.target)
    controls.update()
    invalidate()
  }

  // ── Picking, dragging, press-and-hold and hover ─────────
  // Scenes register handlers with lab.setHandlers({ dragStart, dragMove,
  // dragEnd, holdStart, holdEnd, hover }). A press on an object whose pick
  // has drag: true starts a drag (e.g. pulling a lead from a terminal);
  // hold: true calls holdStart/holdEnd (e.g. holding a burette tap open).
  // Anything else is a click, unless the pointer moved (then it orbited).
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const pickables = []
  let handlers = {}
  // A second set of handlers layered over the scene's (the set-up quest).
  let overlayH = null
  const H = () => (overlayH ? { ...handlers, ...overlayH } : handlers)
  let downAt = null, mode = null, dragPick = null, hoverPick = null
  // Carrying an object (pick.move): the object, where it was, the offset
  // between the grab point and its origin, and the height of the bench.
  let carry = null
  const LIFT = 0.035
  const carryPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const pickRoot = (o) => { while (o) { if (o.userData?.pick) return o; o = o.parent } return null }
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const findPick = (o) => { while (o) { if (o.userData?.pick) return o.userData.pick; o = o.parent } return null }
  // The raycaster also hits hidden meshes (worn goggles, apparatus of the
  // other bench mode, cylinders not cut yet); they must not take clicks.
  const shown = (o) => { while (o) { if (!o.visible) return false; o = o.parent } return true }
  const aim = (e) => {
    const r = renderer.domElement.getBoundingClientRect()
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
  }
  const pickAt = (e) => {
    aim(e)
    const hit = raycaster.intersectObjects(pickables, true).find(h => shown(h.object) && findPick(h.object))
    return hit ? { pick: findPick(hit.object), hit } : null
  }
  const onDown = (e) => {
    if (e.button != null && e.button !== 0) return
    downAt = { x: e.clientX, y: e.clientY }
    const at = pickAt(e)
    mode = 'click'
    if (at?.pick?.move && !at.pick.drag && !at.pick.hold) {
      // Press on a movable object: a click unless the pointer moves, then carry it.
      mode = 'press'; dragPick = at.pick
      carry = { obj: pickRoot(at.hit.object), hit: at.hit.point.clone() }
      controls.enabled = false
      try { renderer.domElement.setPointerCapture(e.pointerId) } catch {}
      e.preventDefault()
      return
    }
    if (at?.pick?.drag && H().dragStart && H().dragStart(at.pick, at.hit) !== false) {
      mode = 'drag'; dragPick = at.pick
      dragPlane.set(new THREE.Vector3(0, 1, 0), -at.hit.point.y)
    } else if (at?.pick?.hold && H().holdStart) {
      mode = 'hold'; dragPick = at.pick
      H().holdStart(at.pick)
    }
    if (mode !== 'click') {
      controls.enabled = false
      try { renderer.domElement.setPointerCapture(e.pointerId) } catch {}
      e.preventDefault()
    }
  }
  const benchY = () => (H().benchY ?? 0.9)
  const onMove = (e) => {
    if (mode === 'press' && carry?.obj && downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 6) {
      const o = carry.obj
      carry.from = o.position.clone()
      carry.parent = o.parent
      // Carry in world space (it may come out of a cupboard).
      const wp = new THREE.Vector3(); o.getWorldPosition(wp)
      if (o.parent !== scene) { scene.attach(o) }
      carryPlane.set(new THREE.Vector3(0, 1, 0), -benchY())
      aim(e)
      const pt = new THREE.Vector3()
      raycaster.ray.intersectPlane(carryPlane, pt)
      carry.offset = new THREE.Vector3(o.position.x - (pt?.x ?? o.position.x), 0, o.position.z - (pt?.z ?? o.position.z))
      // An object lifted from a shelf comes to the pointer, not its old offset.
      if (Math.abs(wp.y - benchY()) > 0.05) carry.offset.set(0, 0, 0)
      carry.baseY = benchY() + (o.userData.restY ?? 0)
      mode = 'carry'
      H().carryStart?.(dragPick, o)
      renderer.domElement.style.cursor = 'grabbing'
    }
    if (mode === 'carry') {
      aim(e)
      const pt = new THREE.Vector3()
      if (!raycaster.ray.intersectPlane(carryPlane, pt)) return
      const o = carry.obj
      let x = pt.x + carry.offset.x, z = pt.z + carry.offset.z
      const b = H().moveBounds?.(dragPick, o)
      if (b) { x = Math.min(b.maxX, Math.max(b.minX, x)); z = Math.min(b.maxZ, Math.max(b.minZ, z)) }
      o.position.set(x, carry.baseY + LIFT, z)
      setRing('carry', o, '#F2B705')
      H().carryMove?.(dragPick, o)
      invalidate()
      return
    }
    if (mode === 'press') return
    if (mode === 'drag') {
      const at = pickAt(e)
      const pt = new THREE.Vector3()
      if (!raycaster.ray.intersectPlane(dragPlane, pt)) return
      H().dragMove?.(pt, at?.pick || null)
      invalidate()
      return
    }
    if (mode) return
    const at = pickAt(e)
    const p = at?.pick || null
    renderer.domElement.style.cursor = p ? (p.drag ? 'crosshair' : 'pointer') : 'grab'
    if (p !== hoverPick) { hoverPick = p; H().hover?.(p); onHoverPick?.(p) }
  }
  const finish = (e, cancelled) => {
    const m = mode
    mode = null
    controls.enabled = true
    try { renderer.domElement.releasePointerCapture(e.pointerId) } catch {}
    if (m === 'carry') {
      const o = carry.obj
      o.position.y = carry.baseY
      setRing('carry', null)
      const p = dragPick; dragPick = null
      const c = carry; carry = null; downAt = null
      // The handler may put it back (returns false) or snap it somewhere.
      const kept = cancelled ? false : H().moved?.(p, o, o.position.clone())
      if (kept === false && c.from) { c.parent?.attach ? c.parent.attach(o) : scene.add(o); o.position.copy(c.from) }
      renderer.domElement.style.cursor = 'grab'
      invalidate(); return
    }
    if (m === 'press') {
      const p = dragPick; dragPick = null; carry = null; downAt = null
      if (!cancelled && onPick) { const at = pickAt(e); if (at) onPick(at.pick, at.hit); else onPick(p, null) }
      return
    }
    if (m === 'drag') { const at = cancelled ? null : pickAt(e); H().dragEnd?.(at?.pick || null, dragPick); dragPick = null; invalidate(); return }
    if (m === 'hold') { H().holdEnd?.(dragPick); dragPick = null; invalidate(); return }
    if (m !== 'click' || cancelled || !downAt || !onPick) return
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y)
    downAt = null
    if (moved > 6) return                        // it was a drag (orbit), not a click
    const at = pickAt(e)
    if (at) onPick(at.pick, at.hit)
  }
  const onUp = (e) => finish(e, false)
  const onCancel = (e) => finish(e, true)
  const onLeave = () => { if (!mode && hoverPick) { hoverPick = null; H().hover?.(null); onHoverPick?.(null) } }
  renderer.domElement.addEventListener('pointerdown', onDown)
  renderer.domElement.addEventListener('pointerup', onUp)
  renderer.domElement.addEventListener('pointercancel', onCancel)
  renderer.domElement.addEventListener('pointermove', onMove)
  renderer.domElement.addEventListener('pointerleave', onLeave)

  // ── On-demand render loop ────────────────────────────────
  let needsRender = true, raf = 0, visible = true, onscreen = true, disposed = false
  const animations = new Set()                   // fn(dt) → true while still running
  let last = performance.now()
  function frame(now) {
    raf = 0
    if (disposed || !visible || !onscreen) return
    const dt = Math.min(0.05, (now - last) / 1000); last = now
    let moving = controls.update()
    for (const a of [...animations]) { if (!a(dt)) animations.delete(a); else moving = true }
    if (needsRender || moving) { renderer.render(scene, camera); needsRender = false; for (const fn of renderedFns) fn() }
    // An animation or the controls' 'change' event may already have queued
    // the next frame through invalidate(); never queue a second one.
    if ((moving || animations.size) && !raf) raf = requestAnimationFrame(frame)
  }
  const renderedFns = new Set()
  function invalidate() {
    needsRender = true
    if (!raf && !disposed) { last = performance.now(); raf = requestAnimationFrame(frame) }
  }
  controls.addEventListener('change', invalidate)
  const animate = (fn) => { animations.add(fn); invalidate() }

  // ── Rings on the bench (hover, carrying, the quest's target) ─────
  const rings = {}
  const footOf = (o) => {
    o.updateMatrixWorld(true)
    const b = new THREE.Box3().setFromObject(o)
    return b.isEmpty() ? null : b
  }
  function setRing(name, obj, colour = '#FFFFFF') {
    let r = rings[name]
    if (!obj) { if (r) r.mesh.visible = false; invalidate(); return }
    if (!r) {
      const mesh = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 48), new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }))
      mesh.rotation.x = -Math.PI / 2
      mesh.renderOrder = 2
      scene.add(mesh)
      r = rings[name] = { mesh, t: 0, anim: false }
    }
    const b = footOf(obj)
    if (!b) return
    const size = Math.max(0.05, Math.max(b.max.x - b.min.x, b.max.z - b.min.z) * 0.62)
    r.size = size
    r.mesh.material.color.set(colour)
    r.mesh.scale.set(size, size, 1)
    r.mesh.position.set((b.min.x + b.max.x) / 2, (name === 'carry' ? benchY() : b.min.y) + 0.002, (b.min.z + b.max.z) / 2)
    r.mesh.visible = true
    // The quest's target pulses (only while it is shown, so the scene can rest).
    if (name === 'target' && !r.anim && !lowGraphics) {
      r.anim = true
      animate((dt) => {
        r.t += dt
        const k = 1 + 0.08 * Math.sin(r.t * 5)
        r.mesh.scale.set(r.size * k, r.size * k, 1)
        if (!r.mesh.visible || disposed) { r.anim = false; return false }
        return true
      })
    }
    invalidate()
  }

  // ── Camera moves ─────────────────────────────────────────
  let flight = null
  function flyTo(pos, target, secs = 0.6) {
    const p0 = camera.position.clone(), t0 = controls.target.clone()
    const p1 = new THREE.Vector3(...pos), t1 = new THREE.Vector3(...target)
    flight = { k: 0 }
    const f = flight
    animate((dt) => {
      if (flight !== f) return false
      f.k = Math.min(1, f.k + dt / secs)
      const e = f.k < 0.5 ? 2 * f.k * f.k : 1 - Math.pow(-2 * f.k + 2, 2) / 2
      camera.position.lerpVectors(p0, p1, e)
      controls.target.lerpVectors(t0, t1, e)
      return f.k < 1
    })
  }
  /** Camera position that frames box b from direction dir (unit, target → camera): the
   *  nearest distance at which all eight corners fit inside the view, with a margin. */
  const probe = new THREE.PerspectiveCamera()
  function framing(b, dir, margin = 1.08) {
    const c = new THREE.Vector3(); b.getCenter(c)
    const corners = []
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) corners.push(new THREE.Vector3(x, y, z))
    probe.fov = camera.fov; probe.aspect = camera.aspect; probe.near = 0.01; probe.far = 100; probe.updateProjectionMatrix()
    const lim = 1 / margin
    const fits = (d) => {
      probe.position.copy(c).addScaledVector(dir, d); probe.lookAt(c); probe.updateMatrixWorld(true)
      return corners.every(k => { const p = k.clone().project(probe); return p.z < 1 && Math.abs(p.x) <= lim && Math.abs(p.y) <= lim })
    }
    let lo = 0.05, hi = 30
    for (let i = 0; i < 32; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid }
    return { pos: c.clone().addScaledVector(dir, hi).toArray(), target: c.toArray() }
  }

  const resize = () => {
    const w = container.clientWidth || 1, h = container.clientHeight || 1
    renderer.setSize(w, h, false)
    renderer.domElement.style.width = w + 'px'; renderer.domElement.style.height = h + 'px'
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    for (const fn of resizeFns) fn(w, h)
    invalidate()
  }
  const resizeFns = new Set()
  // Did the person move the camera themselves? (Then a resize keeps their view.)
  let userMoved = false
  controls.addEventListener('start', () => { userMoved = true })
  const ro = new ResizeObserver(resize); ro.observe(container)
  const onVis = () => { visible = document.visibilityState === 'visible'; if (visible) invalidate() }
  document.addEventListener('visibilitychange', onVis)
  const io = new IntersectionObserver((es) => { onscreen = es.some(e => e.isIntersecting); if (onscreen) invalidate() })
  io.observe(container)

  // Context loss (e.g. GPU reset on a low-memory device): tell the caller.
  let onLost = null
  const lost = (e) => { e.preventDefault(); onLost && onLost() }
  renderer.domElement.addEventListener('webglcontextlost', lost)

  resize(); resetView()

  return {
    THREE, scene, camera, renderer, controls, lowGraphics,
    lights: { hemi, key },                       // scenes may tune these (e.g. the lab room)
    add(obj, { pick } = {}) {
      if (pick) { obj.userData.pick = pick; pickables.push(obj) }
      obj.traverse(o => {
        if (o.isMesh) {
          o.castShadow = !lowGraphics; o.receiveShadow = !lowGraphics
          // Sharper labels seen at an angle.
          const m = o.material
          if (m && m.map && maxAniso > 1) { m.map.anisotropy = Math.min(8, maxAniso); m.map.needsUpdate = true }
        }
      })
      scene.add(obj); invalidate(); return obj
    },
    pickables,
    ring: setRing,
    flyTo,
    /** Look closely at one object (fills about half the view). */
    focusOn(obj, { closeness = 1 } = {}) {
      const b = footOf(obj); if (!b) return
      userMoved = true
      const dir = camera.position.clone().sub(controls.target).normalize()
      dir.y = Math.max(dir.y, 0.45); dir.normalize()
      const f = framing(b, dir, 2.2 * closeness)
      flyTo(f.pos, f.target)
    },
    /** Frame a work area so it fills the view, seen from the front and above. */
    fitTo(box, { pitch = 0.62, yaw = 0, margin = 1.08, fly = false } = {}) {
      if (!box || box.isEmpty()) return null
      const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).normalize()
      const f = framing(box, dir, margin)
      if (fly) flyTo(f.pos, f.target); else { camera.position.set(...f.pos); controls.target.set(...f.target); controls.update(); invalidate() }
      return f
    },
    project(v) {
      camera.updateMatrixWorld()
      const p = v.clone().project(camera)
      const w = container.clientWidth, h = container.clientHeight
      return { x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h, behind: p.z > 1 || p.z < -1 }
    },
    onRendered(fn) { renderedFns.add(fn); return () => renderedFns.delete(fn) },
    onResize(fn) { resizeFns.add(fn); return () => resizeFns.delete(fn) },
    get userMoved() { return userMoved },
    set userMoved(v) { userMoved = !!v },
    get carrying() { return mode === 'carry' },
    makePickable(obj, pick) { obj.userData.pick = pick; if (!pickables.includes(obj)) pickables.push(obj) },
    setHandlers(h) { handlers = h || {} },
    overlay(h) { overlayH = h || null },
    worldPos(obj, dy = 0) { const v = new THREE.Vector3(); obj.getWorldPosition(v); v.y += dy; return v },
    unpick(obj) { const i = pickables.indexOf(obj); if (i >= 0) pickables.splice(i, 1) },
    remove(obj) { if (!obj) return; obj.traverse(o => this.unpick(o)); obj.parent?.remove(obj); disposeTree(obj); invalidate() },
    invalidate, animate, resetView,
    onContextLost(fn) { onLost = fn },
    zoom(factor) { userMoved = true; const d = camera.position.clone().sub(controls.target).multiplyScalar(factor); camera.position.copy(controls.target).add(d); controls.update(); invalidate() },
    dispose() {
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect(); io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointerup', onUp)
      renderer.domElement.removeEventListener('pointercancel', onCancel)
      renderer.domElement.removeEventListener('pointerleave', onLeave)
      renderer.domElement.removeEventListener('pointermove', onMove)
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      controls.dispose()
      renderedFns.clear()
      disposeTree(scene)
      envTex?.dispose()
      renderer.dispose()
      renderer.forceContextLoss?.()
      renderer.domElement.remove()
    },
  }
}

/** Free every geometry, material and texture under an object. */
export function disposeTree(root) {
  root.traverse(o => {
    if (o.geometry) o.geometry.dispose()
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
    for (const m of mats) {
      for (const k of Object.keys(m)) { const v = m[k]; if (v && v.isTexture) v.dispose() }
      m.dispose()
    }
  })
}
