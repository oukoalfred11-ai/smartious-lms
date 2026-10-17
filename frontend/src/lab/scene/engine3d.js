/**
 * engine3d.js — the reusable 3D laboratory framework (Three.js).
 *
 *   const lab = createLabScene(container, { lowGraphics, onPick })
 *   lab.add(object, { pick: { kind, id } })   register pickable meshes
 *   lab.invalidate()                          request a re-render
 *   lab.resetView()                           default camera
 *   lab.dispose()                             free GPU memory and listeners
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

export function createLabScene(container, { lowGraphics = false, onPick = null, view = { pos: [0, 1.25, 1.35], target: [0, 0.95, 0] } } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: !lowGraphics, powerPreference: lowGraphics ? 'low-power' : 'high-performance' })
  renderer.setPixelRatio(lowGraphics ? 1 : Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = !lowGraphics
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.touchAction = 'none'
  renderer.domElement.setAttribute('aria-hidden', 'true')
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#EEF1F4')
  const camera = new THREE.PerspectiveCamera(42, 1, 0.02, 30)

  // Lighting: soft fill + key light with shadows (disabled in low graphics).
  const hemi = new THREE.HemisphereLight('#ffffff', '#b9c2cc', 1.1)
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
  controls.maxPolarAngle = Math.PI * 0.49
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
  let downAt = null, mode = null, dragPick = null, hoverPick = null
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const findPick = (o) => { while (o) { if (o.userData?.pick) return o.userData.pick; o = o.parent } return null }
  const aim = (e) => {
    const r = renderer.domElement.getBoundingClientRect()
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
  }
  const pickAt = (e) => {
    aim(e)
    const hit = raycaster.intersectObjects(pickables, true).find(h => findPick(h.object))
    return hit ? { pick: findPick(hit.object), hit } : null
  }
  const onDown = (e) => {
    if (e.button != null && e.button !== 0) return
    downAt = { x: e.clientX, y: e.clientY }
    const at = pickAt(e)
    mode = 'click'
    if (at?.pick?.drag && handlers.dragStart && handlers.dragStart(at.pick, at.hit) !== false) {
      mode = 'drag'; dragPick = at.pick
      dragPlane.set(new THREE.Vector3(0, 1, 0), -at.hit.point.y)
    } else if (at?.pick?.hold && handlers.holdStart) {
      mode = 'hold'; dragPick = at.pick
      handlers.holdStart(at.pick)
    }
    if (mode !== 'click') {
      controls.enabled = false
      try { renderer.domElement.setPointerCapture(e.pointerId) } catch {}
      e.preventDefault()
    }
  }
  const onMove = (e) => {
    if (mode === 'drag') {
      const at = pickAt(e)
      const pt = new THREE.Vector3()
      if (!raycaster.ray.intersectPlane(dragPlane, pt)) return
      handlers.dragMove?.(pt, at?.pick || null)
      invalidate()
      return
    }
    if (mode) return
    const at = pickAt(e)
    const p = at?.pick || null
    renderer.domElement.style.cursor = p ? (p.drag ? 'crosshair' : 'pointer') : 'grab'
    if (p !== hoverPick) { hoverPick = p; handlers.hover?.(p) }
  }
  const finish = (e, cancelled) => {
    const m = mode
    mode = null
    controls.enabled = true
    try { renderer.domElement.releasePointerCapture(e.pointerId) } catch {}
    if (m === 'drag') { const at = cancelled ? null : pickAt(e); handlers.dragEnd?.(at?.pick || null, dragPick); dragPick = null; invalidate(); return }
    if (m === 'hold') { handlers.holdEnd?.(dragPick); dragPick = null; invalidate(); return }
    if (m !== 'click' || cancelled || !downAt || !onPick) return
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y)
    downAt = null
    if (moved > 6) return                        // it was a drag (orbit), not a click
    const at = pickAt(e)
    if (at) onPick(at.pick, at.hit)
  }
  const onUp = (e) => finish(e, false)
  const onCancel = (e) => finish(e, true)
  const onLeave = () => { if (!mode && hoverPick) { hoverPick = null; handlers.hover?.(null) } }
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
    if (needsRender || moving) { renderer.render(scene, camera); needsRender = false }
    if (moving || animations.size) raf = requestAnimationFrame(frame)
  }
  function invalidate() {
    needsRender = true
    if (!raf && !disposed) { last = performance.now(); raf = requestAnimationFrame(frame) }
  }
  controls.addEventListener('change', invalidate)
  const animate = (fn) => { animations.add(fn); invalidate() }

  const resize = () => {
    const w = container.clientWidth || 1, h = container.clientHeight || 1
    renderer.setSize(w, h, false)
    renderer.domElement.style.width = w + 'px'; renderer.domElement.style.height = h + 'px'
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    invalidate()
  }
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
      obj.traverse(o => { if (o.isMesh) { o.castShadow = !lowGraphics; o.receiveShadow = !lowGraphics } })
      scene.add(obj); invalidate(); return obj
    },
    makePickable(obj, pick) { obj.userData.pick = pick; if (!pickables.includes(obj)) pickables.push(obj) },
    setHandlers(h) { handlers = h || {} },
    worldPos(obj, dy = 0) { const v = new THREE.Vector3(); obj.getWorldPosition(v); v.y += dy; return v },
    unpick(obj) { const i = pickables.indexOf(obj); if (i >= 0) pickables.splice(i, 1) },
    remove(obj) { if (!obj) return; obj.traverse(o => this.unpick(o)); obj.parent?.remove(obj); disposeTree(obj); invalidate() },
    invalidate, animate, resetView,
    onContextLost(fn) { onLost = fn },
    zoom(factor) { const d = camera.position.clone().sub(controls.target).multiplyScalar(factor); camera.position.copy(controls.target).add(d); controls.update(); invalidate() },
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
      disposeTree(scene)
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
