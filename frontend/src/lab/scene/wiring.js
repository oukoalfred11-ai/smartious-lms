/**
 * wiring.js — connecting leads on the 3D bench, shared by every circuit.
 *
 *   const w = createWiring(lab, { dispatch, onSelect, onHover })
 *   w.addTerminal('A1.+', ammeterModel, new THREE.Vector3(...), '#C62828', 'Ammeter +')
 *   w.tray(x, z)                 a tray of red and black leads on the bench
 *   lab.setHandlers({ ...w.handlers, hover })
 *   w.onPick(p)                  → true if it was a lead or the tray
 *   w.update(view.wires, view.wireColours, maxLeads)
 *
 * Students pull a lead from one terminal and drop it on another (drag), or
 * tap one terminal and then the other (touch-friendly). Clicking a lead
 * selects it so it can be removed. Every connection is an ordinary
 * 'connect' action, checked by the engine; nothing here decides physics.
 */
import * as THREE from 'three'
import * as E from './equipment.js'
import { postsOf } from './apparatus3d.js'

const RED = '#C62828', BLACK = '#1A1A1A'

export function createWiring(lab, { dispatch, onSelect = () => {}, onHover = () => {} }) {
  const terms = {}
  let leads = [], leadsKey = '', temp = null
  let startId = null, moved = false, pending = null
  let colour = RED, trayObj = null, trayLabel = null, leftText = ''
  let selectedLead = null

  const labelOf = (id) => terms[id]?.label || id
  // matrixWorld is only refreshed when a frame renders; a bench that was just
  // built (or a lead drawn in the same tick) would otherwise use stale matrices.
  const tipOf = (id) => { const t = terms[id]; if (!t.tip) return lab.worldPos(t.obj, 0.024); t.obj.updateWorldMatrix(true, false); return t.obj.localToWorld(t.tip.clone()) }
  const highlight = (id, on) => terms[id]?.obj.userData.setHighlight?.(on)

  function addTerminal(id, parent, local, postColour, label) {
    const t = E.terminal(postColour)
    t.position.copy(local)
    parent.add(t)
    lab.makePickable(t, { kind: 'terminal', id, label, drag: true })
    terms[id] = { obj: t, label }
    return t
  }

  /** Use an existing post on an apparatus model (from postsOf) as a terminal. */
  function addPost(id, post, label) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.009, 0.0022, 8, 20), new THREE.MeshBasicMaterial({ color: '#F0B429', transparent: true, opacity: 0, depthTest: false }))
    ring.position.copy(post.tip)
    ring.rotation.x = Math.PI / 2
    post.obj.add(ring)
    post.obj.userData.setHighlight = (on) => { ring.material.opacity = on ? 1 : 0 }
    // A small invisible sphere around the tip makes the post easy to grab.
    const grab = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
    grab.position.copy(post.tip); post.obj.add(grab)
    lab.makePickable(post.obj, { kind: 'terminal', id, label, drag: true })
    terms[id] = { obj: post.obj, tip: post.tip, label }
    return post.obj
  }

  /** A shallow tray holding coiled red and black leads. Click to change colour. */
  function tray(x, z) {
    const g = new THREE.Group()
    const wood = new THREE.MeshStandardMaterial({ color: '#B58B5A', roughness: 0.8 })
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.008, 0.12), wood); base.position.y = 0.004
    g.add(base)
    for (const [w, d, px, pz] of [[0.2, 0.012, 0, 0.054], [0.2, 0.012, 0, -0.054], [0.012, 0.12, 0.094, 0], [0.012, 0.12, -0.094, 0]]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(w, 0.025, d), wood); side.position.set(px, 0.0125, pz); g.add(side)
    }
    const coil = (c, cx) => {
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03 - i * 0.004, 0.003, 8, 28), new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 }))
        ring.rotation.x = Math.PI / 2; ring.position.set(cx, 0.012 + i * 0.004, 0); g.add(ring)
      }
      const plug = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.02, 10), new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 }))
      plug.rotation.z = Math.PI / 2; plug.position.set(cx + 0.03, 0.02, 0.02); g.add(plug)
    }
    coil(RED, -0.045); coil(BLACK, 0.045)
    trayLabel = E.labelPlane('Leads', { w: 0.2, h: 0.03, size: 30 })
    trayLabel.position.set(0, 0.05, 0.062); g.add(trayLabel)
    g.position.set(x, E.BENCH_Y, z)
    trayObj = lab.add(g, { pick: { kind: 'leadtray', label: 'Connecting leads: click to change the colour of the next lead' } })
    return g
  }

  function drawTemp(to) {
    if (temp) lab.remove(temp)
    temp = E.leadBetween(tipOf(startId), to, colour)
    lab.add(temp)
  }
  const clearTemp = () => { if (temp) { lab.remove(temp); temp = null } }
  const setPending = (id) => {
    if (pending) highlight(pending, false)
    pending = id
    if (pending) {
      highlight(pending, true)
      onSelect({ kind: 'pending', id, label: labelOf(id), cancel: () => { setPending(null); onSelect(null) } })
    }
    lab.invalidate()
  }
  const connect = (a, b) => {
    const ok = dispatch('connect', { a, b, colour: colour === BLACK ? 'black' : 'red' })
    onSelect(ok ? { kind: 'connected', label: labelOf(a) + ' → ' + labelOf(b) } : null)
  }

  const handlers = {
    dragStart(p) {
      if (p.kind !== 'terminal') return false
      startId = p.id; moved = false
      highlight(startId, true)
      return true
    },
    dragMove(pt, over) {
      if (!startId) return
      const overTerm = over?.kind === 'terminal' && over.id !== startId ? over.id : null
      const to = overTerm ? tipOf(overTerm) : pt.clone()
      if (!moved && to.distanceTo(tipOf(startId)) > 0.02) moved = true
      if (moved) drawTemp(to)
      onHover(overTerm ? 'Release to connect to ' + labelOf(overTerm) : 'Drag to another terminal')
    },
    dragEnd(over) {
      const from = startId
      startId = null
      clearTemp()
      if (from !== pending) highlight(from, false)
      const end = over?.kind === 'terminal' ? over.id : null
      if (moved) {
        if (end && end !== from) { setPending(null); connect(from, end) }
        else { if (pending) setPending(null); onSelect(null) }
        lab.invalidate()
        return
      }
      // A tap: first tap selects a terminal, a second tap elsewhere connects.
      if (pending && pending !== from) { const a = pending; setPending(null); connect(a, from) }
      else if (pending === from) { setPending(null); onSelect(null) }
      else setPending(from)
      lab.invalidate()
    },
  }

  function onPick(p) {
    if (p?.kind === 'wire') {
      selectLead(p.index)
      onSelect({ kind: 'wire', index: p.index, label: p.label, clear: () => selectLead(null) })
      return true
    }
    if (p?.kind === 'leadtray') {
      colour = colour === RED ? BLACK : RED
      refreshTray()
      onSelect({ kind: 'tray', label: 'Next lead: ' + (colour === RED ? 'red' : 'black') })
      return true
    }
    return false
  }

  function selectLead(i) {
    selectedLead = i
    leads.forEach((l, k) => { const m = l.userData.visible; if (m) m.material.emissive?.set(k === i ? '#5A4500' : '#000000') })
    lab.invalidate()
  }

  let maxLeadsShown = null, wireCount = 0
  function refreshTray() {
    if (!trayLabel) return
    const left = maxLeadsShown != null ? Math.max(0, maxLeadsShown - wireCount) + ' left · ' : ''
    const t = 'Leads: ' + left + 'next ' + (colour === RED ? 'red' : 'black')
    if (t !== leftText) { trayLabel.userData.setText(t); leftText = t }
  }

  function update(wires = [], colours = [], maxLeads = null) {
    const key = JSON.stringify([wires, colours])
    if (key !== leadsKey) {
      leads.forEach(l => lab.remove(l)); leads = []
      selectedLead = null
      wires.forEach(([a, b], i) => {
        if (!terms[a] || !terms[b]) return
        const c = colours[i] === 'black' ? BLACK : colours[i] === 'red' ? RED : (a.endsWith('-') || b.endsWith('-') ? BLACK : RED)
        const g = new THREE.Group()
        const vis = E.leadBetween(tipOf(a), tipOf(b), c)
        // A thicker invisible tube along the same path makes the lead easy to click.
        const hit = new THREE.Mesh(new THREE.TubeGeometry(vis.geometry.parameters.path, 24, 0.009, 6, false),
          new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
        g.add(vis, hit)
        g.userData.visible = vis
        lab.add(g, { pick: { kind: 'wire', index: i, label: 'Lead: ' + labelOf(a) + ' → ' + labelOf(b) + ' (click to select)' } })
        leads.push(g)
      })
      leadsKey = key
    }
    maxLeadsShown = maxLeads; wireCount = wires.length
    refreshTray()
    lab.invalidate()
  }

  /** Re-route every lead (after a terminal moved, e.g. a sliding contact). */
  function refresh() { leadsKey = ''; }

  /** Remove every lead and the tray (the bench is being rebuilt). */
  function dispose() {
    clearTemp()
    leads.forEach(l => lab.remove(l)); leads = []; leadsKey = ''
    if (trayObj) { lab.remove(trayObj); trayObj = null; trayLabel = null; leftText = '' }
    pending = null; startId = null
    for (const k of Object.keys(terms)) delete terms[k]
  }

  return { addTerminal, addPost, tray, handlers, onPick, update, refresh, dispose, labelOf, terminals: terms }
}

const POLAR = ['supply', 'ammeter', 'voltmeter']

/**
 * Make a circuit part's model wireable: its real posts become the part's
 * terminals ('+'/'-' for supplies and meters, 'a'/'b' otherwise). A model
 * without two posts gets two neat terminal posts on top.
 *   part = { id, type, label }
 */
export function wirePart(w, model, part, { index = 0 } = {}) {
  const names = POLAR.includes(part.type) ? ['+', '-'] : ['a', 'b']
  // Several parts on one model (e.g. a board of resistors) take successive pairs of posts.
  const posts = postsOf(model).slice(index * 2)
  let chosen
  if (names[0] === '+') {
    const red = posts.find(p => p.colour === '#C62828') || posts[0]
    const black = posts.find(p => p !== red && p.colour === '#151515') || posts.find(p => p !== red)
    chosen = [red, black]
  } else {
    const clip = posts.find(p => p.colour === 'clip')
    const red = posts.find(p => p.colour === '#C62828')
    if (clip) chosen = [posts.find(p => p.colour === '#151515') || posts.find(p => p !== clip), clip]
    else if (red && posts.length >= 3) chosen = [posts.find(p => p !== red), red]      // rheostat: end and slider
    else chosen = [posts[0], posts[1]]
  }
  const both = names.length === 2 && names.map((n, i) => (n === 'a' || n === 'b') ? (i === 0 ? 'one end' : 'other end') : (n === '+' ? '+' : '−'))
  if (chosen.every(Boolean)) {
    names.forEach((n, i) => w.addPost(part.id + '.' + n, chosen[i], part.label + ' ' + both[i]))
    return
  }
  // No posts on this model: add two on top, at the front corners.
  model.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(model)
  const corners = [new THREE.Vector3(box.min.x + 0.02, box.max.y, box.max.z - 0.015), new THREE.Vector3(box.max.x - 0.02, box.max.y, box.max.z - 0.015)]
  names.forEach((n, i) => {
    const local = model.worldToLocal(corners[i].clone())
    w.addTerminal(part.id + '.' + n, model, local, n === '-' ? '#151515' : n === '+' ? '#C62828' : '#7A7A7A', part.label + ' ' + both[i])
  })
}
