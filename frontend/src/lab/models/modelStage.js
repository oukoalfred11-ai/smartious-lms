/**
 * modelStage.js — shows one labelled 3D model (no React here; the page wraps it).
 *
 *   const stage = createModelStage(container, { onSelect, low })
 *   await stage.load(buildFn)        build and frame a model (see kit.js for the contract)
 *   stage.select(id | null)          highlight a part (and its label)
 *   stage.setLabels(on) / setAnimate(on) / setCutaway(on) / setQuiz(on)
 *   stage.status()                   the model's line about what is shown now
 *   stage.dispose()
 *
 * Labels are HTML callouts in two columns beside the model, joined to their
 * point on the model by leader lines. They are re-laid out after every
 * drawn frame, so they follow the model as it turns. A label whose point is
 * hidden behind the model is dimmed.
 */
import * as THREE from 'three'
import { createLabScene } from '../scene/engine3d.js'

const HIGHLIGHT = new THREE.Color('#FFB020')

export function createModelStage(container, { onSelect = () => {}, low = false } = {}) {
  const lab = createLabScene(container, { lowGraphics: low, freeOrbit: true, background: '#141C26', view: { pos: [0, 0.2, 1.4], target: [0, 0, 0] }, onPick: (p) => { if (p?.kind === 'part') pick(p.id) } })
  lab.lights.key.intensity = 1.9
  lab.lights.hemi.intensity = low ? 1.3 : 0.9
  const rim = new THREE.DirectionalLight('#9FC4FF', 0.8); rim.position.set(-1.5, 0.8, -1.2); lab.scene.add(rim)
  // A soft floor disc so the model does not float in nothing.
  const floor = new THREE.Mesh(new THREE.CircleGeometry(0.7, 64), new THREE.ShadowMaterial({ opacity: 0.45 }))
  floor.rotation.x = -Math.PI / 2
  lab.scene.add(floor)
  floor.receiveShadow = !low

  const overlay = document.createElement('div')
  overlay.className = 'm3d-overlay'
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('class', 'm3d-lines')
  overlay.appendChild(svg)
  container.style.position = container.style.position || 'relative'
  container.appendChild(overlay)

  let model = null, labels = [], showLabels = true, quiz = false, selected = null, animating = false, animToken = 0, t0 = 0
  const raycaster = new THREE.Raycaster()

  function pick(id) { onSelect(id) }

  function clearModel() {
    if (!model) return
    lab.remove(model.root)
    for (const l of labels) l.el.remove()
    labels = []; model = null; selected = null
  }

  async function load(build) {
    clearModel()
    const m = await build()
    model = m
    // Every mesh gets its own material, so highlighting one part leaves the others alone.
    m.root.traverse(o => { if (o.isMesh) o.material = Array.isArray(o.material) ? o.material.map(x => x.clone()) : o.material.clone() })
    lab.add(m.root)
    for (const part of m.parts) for (const o of part.objects) {
      lab.makePickable(o, { kind: 'part', id: part.id, label: part.name })
    }
    // Stand the model on the floor disc.
    const box = new THREE.Box3().setFromObject(m.root)
    floor.position.y = box.min.y - 0.004
    const r = box.getSize(new THREE.Vector3()).length() / 2
    floor.scale.setScalar(Math.max(0.25, r * 1.15) / 0.7)
    labels = m.parts.map(part => {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'm3d-label'
      el.textContent = part.name
      el.addEventListener('click', () => pick(part.id))
      overlay.appendChild(el)
      return { part, el, line: null, dot: null }
    })
    frame()
    m.reset?.()
    t0 = performance.now()
    lab.invalidate()
    return m
  }

  function frame() {
    if (!model) return
    const box = new THREE.Box3().setFromObject(model.root)
    const { yaw = 0.4, pitch = 0.3 } = model.view || {}
    // Leave room either side for the label columns.
    lab.fitTo(box, { yaw, pitch, margin: showLabels ? 1.25 : 1.05 })
  }

  // ── Label layout ────────────────────────────────────────
  const worldOf = (p) => model.root.localToWorld(new THREE.Vector3(...p))
  function hiddenBehind(part, w) {
    const cam = lab.camera.position
    const dir = w.clone().sub(cam), dist = dir.length()
    raycaster.set(cam, dir.normalize())
    raycaster.far = dist - 0.004
    // Rays ignore clipping, so skip hits on parts of a surface the cut-away has removed.
    const cutAway = (h) => (h.object.material?.clippingPlanes || []).some(pl => pl.distanceToPoint(h.point) < 0)
    const hits = raycaster.intersectObject(model.root, true).filter(h => h.object.visible && !(h.object.material?.transparent && h.object.material.opacity < 0.5) && !cutAway(h))
    if (!hits.length) return false
    const mine = new Set(); for (const o of part.objects) o.traverse(x => mine.add(x))
    return !mine.has(hits[0].object)
  }
  function layout() {
    while (svg.firstChild) svg.removeChild(svg.firstChild)
    if (!model) return
    const W = container.clientWidth, H = container.clientHeight
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H)
    const on = showLabels && !quiz
    // Screen box of the model, to put the columns beside it.
    const box = new THREE.Box3().setFromObject(model.root)
    let minX = Infinity, maxX = -Infinity
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      const p = lab.project(new THREE.Vector3(x, y, z)); minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x)
    }
    const cx = (minX + maxX) / 2
    const items = labels.map(l => {
      const w = worldOf(l.part.anchor), p = lab.project(w)
      return { l, x: p.x, y: p.y, behind: p.behind, hidden: !p.behind && hiddenBehind(l.part, w) }
    })
    const colW = Math.min(210, Math.max(120, W * 0.2))
    const sides = { left: items.filter(i => i.x < cx), right: items.filter(i => i.x >= cx) }
    const narrow = W < 640
    for (const [side, list] of Object.entries(sides)) {
      list.sort((a, b) => a.y - b.y)
      const gap = narrow ? 22 : 26
      let y = 14
      for (const it of list) { it.ly = Math.max(y, it.y); y = it.ly + gap }
      // Too low: push the column back up from the bottom.
      let bottom = H - 14
      for (let i = list.length - 1; i >= 0; i--) { if (list[i].ly > bottom) list[i].ly = bottom; bottom = list[i].ly - gap }
      const edge = side === 'left' ? Math.max(colW + 8, Math.min(minX - 18, cx - 40)) : Math.min(W - colW - 8, Math.max(maxX + 18, cx + 40))
      for (const it of list) {
        const { el, part } = it.l
        el.style.display = on && !it.behind ? '' : 'none'
        if (!on || it.behind) continue
        el.classList.toggle('sel', selected === part.id)
        el.classList.toggle('dim', it.hidden && selected !== part.id)
        el.classList.toggle('left', side === 'left')
        el.style.top = it.ly + 'px'
        if (side === 'left') { el.style.left = ''; el.style.right = (W - edge) + 'px' } else { el.style.right = ''; el.style.left = edge + 'px' }
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
        const lx = side === 'left' ? edge + 2 : edge - 2
        const knee = side === 'left' ? Math.min(lx + 14, it.x) : Math.max(lx - 14, it.x)
        line.setAttribute('points', `${lx},${it.ly} ${knee},${it.ly} ${it.x},${it.y}`)
        line.setAttribute('class', 'm3d-line' + (selected === part.id ? ' sel' : '') + (it.hidden && selected !== part.id ? ' dim' : ''))
        svg.appendChild(line)
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        dot.setAttribute('cx', it.x); dot.setAttribute('cy', it.y); dot.setAttribute('r', selected === part.id ? 4.5 : 3)
        dot.setAttribute('class', 'm3d-dot' + (selected === part.id ? ' sel' : '') + (it.hidden && selected !== part.id ? ' dim' : ''))
        svg.appendChild(dot)
      }
    }
  }
  const offRendered = lab.onRendered(layout)
  lab.onResize?.(() => { frame(); lab.invalidate() })

  function highlight(id) {
    if (!model) return
    for (const part of model.parts) for (const o of part.objects) o.traverse(x => {
      if (!x.isMesh || !x.material?.emissive) return
      if (x.userData.baseEmissive == null) { x.userData.baseEmissive = x.material.emissive.clone(); x.userData.baseEI = x.material.emissiveIntensity }
      const on = part.id === id || (id && model.parts.find(p => p.id === id)?.objects.includes(o))
      if (on) { x.material.emissive.copy(HIGHLIGHT); x.material.emissiveIntensity = 0.45 } else { x.material.emissive.copy(x.userData.baseEmissive); x.material.emissiveIntensity = x.userData.baseEI }
    })
    lab.invalidate()
  }

  function setAnimate(on) {
    if (!model?.tick) return
    animating = !!on
    const token = ++animToken
    if (!animating) { lab.invalidate(); return }
    const start = performance.now() - (t0 ? 0 : 0)
    lab.animate((dt) => {
      if (token !== animToken || !model) return false
      model.tick((performance.now() - start) / 1000, dt)
      return true
    })
  }

  return {
    lab,
    load,
    select(id) { selected = id; highlight(id); lab.invalidate() },
    setLabels(on) { showLabels = !!on; frame(); lab.invalidate() },
    setQuiz(on) { quiz = !!on; lab.invalidate() },
    setAnimate,
    setCutaway(on) { model?.cutaway?.(on); lab.invalidate() },
    explode(f) { model?.explode?.(f); lab.invalidate() },
    status: () => model?.status?.() || '',
    resetView() { frame(); lab.invalidate() },
    get model() { return model },
    dispose() { animToken++; offRendered(); clearModel(); overlay.remove(); lab.dispose() },
  }
}
