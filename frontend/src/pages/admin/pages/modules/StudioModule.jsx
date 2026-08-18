/**
 * StudioModule.jsx — SMARTIOUS STUDIO
 * ════════════════════════════════════════════════════════════
 * A deliberately CONSTRAINED design tool. CapCut and Canva fail
 * the school not because they lack features but because they have
 * ten thousand of them; this has only Smartious templates, so a
 * one-minute branded motion video or a flyer-card series takes
 * minutes, stays perfectly on-brand, and costs nothing.
 *
 * Two creators:
 *  1. FLYER CARDS — square (1080) or story (1080x1920) cards in
 *     branded templates, built as a numbered series ("1 of 5"),
 *     each exported as a PNG.
 *  2. MOTION VIDEO — a sequence of animated scenes (title sting,
 *     text over colour, text over an uploaded image or video clip
 *     with a brand-tint overlay, bullet reveal, stat pop, outro
 *     CTA). Rendered on canvas at 30 fps and recorded to a video
 *     file entirely in the browser.
 *
 * No backend, no uploads to the server: everything renders and
 * exports locally.
 */
import React, { useEffect, useRef, useState } from 'react'
import { TOKENS } from '../shared/tokens.js'

// ── Brand ────────────────────────────────────────────────
const CRIMSON = '#8B1A2E'
const CRIMSON_DK = '#5E0F1F'
const GOLD = '#C9973A'
const INK = '#080C14'
const BONE = '#FDFAF4'

const BACKGROUNDS = [
  { id: 'crimson', label: 'Crimson', paint: (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#A8203A'); g.addColorStop(1, CRIMSON_DK)
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  }},
  { id: 'ink', label: 'Ink', paint: (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#141B2B'); g.addColorStop(1, INK)
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  }},
  { id: 'bone', label: 'Bone', paint: (ctx, w, h) => {
    ctx.fillStyle = BONE; ctx.fillRect(0, 0, w, h)
  }},
  { id: 'gold', label: 'Gold band', paint: (ctx, w, h) => {
    ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h)
    const g = ctx.createLinearGradient(0, h * 0.62, 0, h)
    g.addColorStop(0, GOLD); g.addColorStop(1, '#8A6A1E')
    ctx.fillStyle = g; ctx.fillRect(0, h * 0.66, w, h * 0.34)
  }},
]
const bgById = (id) => BACKGROUNDS.find(b => b.id === id) || BACKGROUNDS[0]
const isDark = (id) => id !== 'bone'

// ── Shared canvas helpers ────────────────────────────────
function drawCrest(ctx, x, y, size) {
  const s = size / 80
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s, s)
  const g = ctx.createLinearGradient(0, 6, 0, 74)
  g.addColorStop(0, '#A8203A'); g.addColorStop(1, '#7A1026')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(40, 6); ctx.lineTo(68, 14)
  ctx.quadraticCurveTo(70, 14, 70, 17); ctx.lineTo(70, 44)
  ctx.quadraticCurveTo(70, 60, 40, 74)
  ctx.quadraticCurveTo(10, 60, 10, 44); ctx.lineTo(10, 17)
  ctx.quadraticCurveTo(10, 14, 12, 14); ctx.closePath(); ctx.fill()
  // star
  ctx.fillStyle = GOLD
  ctx.beginPath()
  const pts = [[40,19],[42.2,26],[49.5,26],[43.7,30.4],[45.9,37.5],[40,33],[34.1,37.5],[36.3,30.4],[30.5,26],[37.8,26]]
  pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))
  ctx.closePath(); ctx.fill()
  // open book
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.moveTo(26, 48); ctx.lineTo(26, 60); ctx.lineTo(39, 61); ctx.lineTo(39, 49)
  ctx.quadraticCurveTo(32, 47, 26, 48); ctx.closePath(); ctx.fill()
  ctx.beginPath()
  ctx.moveTo(54, 48); ctx.lineTo(54, 60); ctx.lineTo(41, 61); ctx.lineTo(41, 49)
  ctx.quadraticCurveTo(48, 47, 54, 48); ctx.closePath(); ctx.fill()
  ctx.restore()
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w }
    else line = test
  }
  if (line) lines.push(line)
  return lines
}

function drawLines(ctx, lines, x, y, lh, align = 'left', w = 0) {
  lines.forEach((ln, i) => {
    const tx = align === 'center' ? x + w / 2 : x
    ctx.textAlign = align === 'center' ? 'center' : 'left'
    ctx.fillText(ln, tx, y + i * lh)
  })
  ctx.textAlign = 'left'
  return y + lines.length * lh
}

// Ease helpers for motion scenes
const easeOut = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3)

// ═══════════════════════════════════════════════════════════
// FLYER CARD RENDERER
// One card definition -> canvas. p (0..1) is unused for flyers
// but shared with video scenes so templates can animate.
// ═══════════════════════════════════════════════════════════
function renderCard(ctx, W, H, card, media, p = 1) {
  const bg = bgById(card.bg)
  bg.paint(ctx, W, H)
  const dark = isDark(card.bg)
  const fg = dark ? '#FFFFFF' : INK
  const sub = dark ? 'rgba(255,255,255,.72)' : 'rgba(8,12,20,.65)'
  const M = W * 0.085

  // Optional uploaded image with brand tint (the "colour layer")
  if (card.useImage && media) {
    const iw = media.videoWidth || media.width, ih = media.videoHeight || media.height
    if (iw && ih) {
      const scale = Math.max(W / iw, H / ih)
      ctx.drawImage(media, (W - iw * scale) / 2, (H - ih * scale) / 2, iw * scale, ih * scale)
      const tint = ctx.createLinearGradient(0, 0, 0, H)
      if (card.tint === 'crimson') { tint.addColorStop(0, 'rgba(139,26,46,.55)'); tint.addColorStop(1, 'rgba(60,8,18,.85)') }
      else if (card.tint === 'gold') { tint.addColorStop(0, 'rgba(30,20,4,.45)'); tint.addColorStop(1, 'rgba(140,100,20,.72)') }
      else { tint.addColorStop(0, 'rgba(8,12,20,.42)'); tint.addColorStop(1, 'rgba(8,12,20,.85)') }
      ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H)
    }
  }

  const slide = (1 - easeOut(p)) * 60

  // Header row: crest + wordmark
  const crest = W * 0.075
  drawCrest(ctx, M, M * 0.8, crest)
  ctx.fillStyle = card.useImage || dark ? '#FFFFFF' : INK
  ctx.font = `700 ${W * 0.036}px Georgia, serif`
  ctx.fillText('Smart', M + crest + W * 0.018, M * 0.8 + crest * 0.62)
  ctx.fillStyle = GOLD
  ctx.font = `italic 500 ${W * 0.036}px Georgia, serif`
  ctx.fillText('ious', M + crest + W * 0.018 + ctx.measureText('Smart').width * 1.18, M * 0.8 + crest * 0.62)

  // Series chip "2 / 5"
  if (card.seriesTotal > 1) {
    const chipTxt = card.seriesNo + ' / ' + card.seriesTotal
    ctx.font = `800 ${W * 0.03}px Arial`
    const cw = ctx.measureText(chipTxt).width + W * 0.045
    ctx.fillStyle = GOLD
    ctx.beginPath()
    ctx.roundRect ? ctx.roundRect(W - M - cw, M * 0.78, cw, W * 0.055, W * 0.028) : ctx.rect(W - M - cw, M * 0.78, cw, W * 0.055)
    ctx.fill()
    ctx.fillStyle = INK
    ctx.textAlign = 'center'
    ctx.fillText(chipTxt, W - M - cw / 2, M * 0.78 + W * 0.038)
    ctx.textAlign = 'left'
  }

  // Kicker
  let y = H * (card.template === 'stat' ? 0.3 : 0.28)
  ctx.globalAlpha = p
  if (card.kicker) {
    ctx.fillStyle = GOLD
    ctx.font = `800 ${W * 0.028}px Arial`
    ctx.fillText(String(card.kicker).toUpperCase(), M, y + slide)
    y += W * 0.055
  }

  if (card.template === 'stat') {
    // Big number template
    const statFg = card.useImage || dark ? '#FFFFFF' : CRIMSON
    ctx.fillStyle = statFg
    ctx.font = `900 ${W * 0.19}px Georgia, serif`
    ctx.fillText(card.headline || '250+', M, y + W * 0.17 + slide)
    y += W * 0.22
    ctx.fillStyle = card.useImage || dark ? 'rgba(255,255,255,.85)' : sub
    ctx.font = `600 ${W * 0.042}px Arial`
    y = drawLines(ctx, wrapText(ctx, card.body, W - 2 * M), M, y + W * 0.02 + slide, W * 0.058)
  } else if (card.template === 'quote') {
    ctx.fillStyle = GOLD
    ctx.font = `900 ${W * 0.16}px Georgia, serif`
    ctx.fillText('\u201C', M - W * 0.01, y + W * 0.1 + slide)
    ctx.fillStyle = card.useImage || dark ? '#FFFFFF' : INK
    ctx.font = `italic 600 ${W * 0.052}px Georgia, serif`
    y = drawLines(ctx, wrapText(ctx, card.headline, W - 2 * M), M, y + W * 0.15 + slide, W * 0.072)
    if (card.body) {
      ctx.fillStyle = GOLD
      ctx.font = `700 ${W * 0.034}px Arial`
      ctx.fillText('\u2014 ' + card.body, M, y + W * 0.05 + slide)
    }
  } else {
    // Idea / announcement: headline + body
    ctx.fillStyle = card.useImage || dark ? '#FFFFFF' : INK
    ctx.font = `800 ${W * 0.064}px Georgia, serif`
    y = drawLines(ctx, wrapText(ctx, card.headline, W - 2 * M), M, y + W * 0.06 + slide, W * 0.082)
    // gold underline
    ctx.fillStyle = GOLD
    ctx.fillRect(M, y - W * 0.028, W * 0.14 * easeOut(p), W * 0.009)
    if (card.body) {
      ctx.fillStyle = card.useImage || dark ? 'rgba(255,255,255,.86)' : sub
      ctx.font = `500 ${W * 0.038}px Arial`
      drawLines(ctx, wrapText(ctx, card.body, W - 2 * M), M, y + W * 0.035 + slide, W * 0.056)
    }
  }
  ctx.globalAlpha = 1

  // Footer
  ctx.fillStyle = card.useImage || dark ? 'rgba(255,255,255,.55)' : 'rgba(8,12,20,.5)'
  ctx.font = `700 ${W * 0.026}px Arial`
  ctx.fillText((card.footer || 'smartioushomeschool.com').toUpperCase(), M, H - M * 0.7)
  ctx.fillStyle = GOLD
  ctx.fillRect(M, H - M * 0.7 + W * 0.014, W * 0.055, W * 0.006)
}

// ═══════════════════════════════════════════════════════════
// MOTION SCENE RENDERER — p runs 0..1 over the scene duration.
// ═══════════════════════════════════════════════════════════
function renderScene(ctx, W, H, scene, media, p) {
  if (scene.type === 'title') {
    bgById(scene.bg || 'crimson').paint(ctx, W, H)
    const cs = W * 0.24
    const cp = easeOut(p * 1.6)
    ctx.globalAlpha = cp
    drawCrest(ctx, W / 2 - cs / 2, H * 0.28 - (1 - cp) * 40, cs)
    ctx.globalAlpha = 1
    const tp = easeOut((p - 0.25) * 2)
    if (tp > 0) {
      ctx.globalAlpha = tp
      ctx.textAlign = 'center'
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `700 ${W * 0.085}px Georgia, serif`
      ctx.fillText('Smartious', W / 2 - W * 0.028, H * 0.28 + cs + W * 0.09)
      ctx.fillStyle = GOLD
      ctx.font = `italic 500 ${W * 0.05}px Georgia, serif`
      ctx.fillText(scene.headline || 'Homeschool Global', W / 2, H * 0.28 + cs + W * 0.155)
      ctx.textAlign = 'left'
      ctx.globalAlpha = 1
      ctx.fillStyle = GOLD
      const uw = W * 0.24 * easeOut((p - 0.4) * 2)
      ctx.fillRect(W / 2 - uw / 2, H * 0.28 + cs + W * 0.185, uw, W * 0.008)
    }
    ctx.globalAlpha = 1
  } else if (scene.type === 'outro') {
    bgById(scene.bg || 'ink').paint(ctx, W, H)
    const cs = W * 0.17
    drawCrest(ctx, W / 2 - cs / 2, H * 0.3, cs)
    ctx.textAlign = 'center'
    ctx.globalAlpha = easeOut(p * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `800 ${W * 0.06}px Georgia, serif`
    const lines = wrapText(ctx, scene.headline || 'Enrol today', W * 0.8)
    drawLines(ctx, lines, W * 0.1, H * 0.3 + cs + W * 0.1, W * 0.078, 'center', W * 0.8)
    ctx.fillStyle = GOLD
    ctx.font = `700 ${W * 0.042}px Arial`
    ctx.fillText(scene.body || 'smartioushomeschool.com', W / 2, H * 0.3 + cs + W * 0.1 + lines.length * W * 0.078 + W * 0.04)
    ctx.textAlign = 'left'
    ctx.globalAlpha = 1
  } else if (scene.type === 'bullets') {
    bgById(scene.bg || 'ink').paint(ctx, W, H)
    const M = W * 0.09
    ctx.fillStyle = GOLD
    ctx.font = `800 ${W * 0.03}px Arial`
    ctx.fillText((scene.kicker || 'WHY SMARTIOUS').toUpperCase(), M, H * 0.16)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `800 ${W * 0.058}px Georgia, serif`
    let y = drawLines(ctx, wrapText(ctx, scene.headline, W - 2 * M), M, H * 0.16 + W * 0.075, W * 0.075)
    const items = String(scene.body || '').split('\n').filter(Boolean).slice(0, 5)
    items.forEach((it, i) => {
      const ip = easeOut((p - 0.15 - i * 0.14) * 4)
      if (ip <= 0) return
      ctx.globalAlpha = ip
      const iy = y + W * 0.05 + i * W * 0.095 - (1 - ip) * 30
      ctx.fillStyle = GOLD
      ctx.beginPath(); ctx.arc(M + W * 0.014, iy - W * 0.014, W * 0.014, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,.92)'
      ctx.font = `600 ${W * 0.04}px Arial`
      const ls = wrapText(ctx, it, W - 2 * M - W * 0.06)
      drawLines(ctx, ls, M + W * 0.05, iy, W * 0.052)
      ctx.globalAlpha = 1
    })
  } else if (scene.type === 'stat') {
    renderCard(ctx, W, H, { ...scene, template: 'stat', seriesTotal: 0 }, media, Math.min(1, p * 2.2))
  } else {
    // 'text' — text over colour, or over uploaded image/video with tint
    renderCard(ctx, W, H, { ...scene, template: 'idea', seriesTotal: 0 }, media, Math.min(1, p * 2.2))
  }
}

const SCENE_TYPES = [
  ['title', 'Title sting (crest)'],
  ['text', 'Text over colour / photo / video'],
  ['bullets', 'Bullet reveal'],
  ['stat', 'Big number'],
  ['outro', 'Outro + CTA'],
]

const inputStyle = { width: '100%', boxSizing: 'border-box', border: '1.5px solid ' + TOKENS.line, borderRadius: 8, padding: '9px 11px', fontSize: 12.5, outline: 'none', fontFamily: 'inherit' }
const btn = (primary) => ({ background: primary ? TOKENS.crimson : '#fff', color: primary ? '#fff' : TOKENS.s700, border: primary ? 'none' : '1.5px solid ' + TOKENS.line, borderRadius: 9, padding: '9px 15px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' })

// ═══════════════════════════════════════════════════════════
export default function StudioModule({ toast }) {
  const [tab, setTab] = useState('cards')
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['cards', 'Flyer cards'], ['video', 'Motion video']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            ...btn(tab === k), borderRadius: 99, padding: '9px 20px',
          }}>{l}</button>
        ))}
      </div>
      {tab === 'cards' ? <CardMaker toast={toast} /> : <VideoMaker toast={toast} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// FLYER CARD MAKER
// ═══════════════════════════════════════════════════════════
const newCard = (i, total) => ({
  template: 'idea', bg: 'crimson', tint: 'crimson', useImage: false,
  kicker: 'Study tip ' + (i + 1), headline: 'Your idea headline here',
  body: 'Explain the idea in one or two clear sentences. Keep it short — the card does the talking.',
  footer: 'smartioushomeschool.com', seriesNo: i + 1, seriesTotal: total,
})

function CardMaker({ toast }) {
  const [format, setFormat] = useState('square')   // square | story
  const [cards, setCards] = useState([newCard(0, 1)])
  const [cur, setCur] = useState(0)
  const [mediaEl, setMediaEl] = useState(null)
  const cvRef = useRef(null)
  const W = 1080, H = format === 'story' ? 1920 : 1080
  const card = cards[cur]

  const upd = (patch) => setCards(cs => cs.map((c, i) => i === cur ? { ...c, ...patch } : c))

  useEffect(() => {
    const cv = cvRef.current
    if (!cv) return
    cv.width = W; cv.height = H
    renderCard(cv.getContext('2d'), W, H, card, mediaEl, 1)
  }, [cards, cur, format, mediaEl])

  const onImage = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const img = new Image()
    img.onload = () => { setMediaEl(img); upd({ useImage: true }) }
    img.src = URL.createObjectURL(f)
  }

  const download = (idx) => {
    const off = document.createElement('canvas')
    off.width = W; off.height = H
    renderCard(off.getContext('2d'), W, H, { ...cards[idx], seriesTotal: cards.length, seriesNo: idx + 1 }, mediaEl, 1)
    const a = document.createElement('a')
    a.download = 'smartious-card-' + (idx + 1) + '.png'
    a.href = off.toDataURL('image/png')
    a.click()
  }
  const downloadAll = () => { cards.forEach((_, i) => setTimeout(() => download(i), i * 350)); toast?.('Downloading ' + cards.length + ' card(s)...') }

  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
      {/* Controls */}
      <div style={{ flex: '1 1 320px', minWidth: 300, maxWidth: 430, display: 'flex', flexDirection: 'column', gap: 11 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['square', 'Square 1080'], ['story', 'Story 1080\u00d71920']].map(([k, l]) => (
            <button key={k} onClick={() => setFormat(k)} style={btn(format === k)}>{l}</button>
          ))}
        </div>

        {/* Series strip */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {cards.map((_, i) => (
            <button key={i} onClick={() => setCur(i)} style={{
              ...btn(cur === i), padding: '7px 13px', borderRadius: 99,
            }}>{i + 1}</button>
          ))}
          <button onClick={() => { setCards(cs => [...cs.map(c => ({ ...c, seriesTotal: cs.length + 1 })), newCard(cards.length, cards.length + 1)]); setCur(cards.length) }}
            style={{ ...btn(false), borderRadius: 99, padding: '7px 13px' }}>+ Add card</button>
          {cards.length > 1 && (
            <button onClick={() => { const nc = cards.filter((_, i) => i !== cur).map((c, i, arr) => ({ ...c, seriesNo: i + 1, seriesTotal: arr.length })); setCards(nc); setCur(Math.max(0, cur - 1)) }}
              style={{ ...btn(false), color: '#B91C1C', borderRadius: 99, padding: '7px 13px' }}>Remove</button>
          )}
        </div>

        <select value={card.template} onChange={e => upd({ template: e.target.value })} style={inputStyle}>
          <option value="idea">Idea card (headline + explanation)</option>
          <option value="stat">Big number card</option>
          <option value="quote">Quote card</option>
        </select>

        <div style={{ display: 'flex', gap: 6 }}>
          {BACKGROUNDS.map(b => (
            <button key={b.id} onClick={() => upd({ bg: b.id, useImage: false })} style={{
              ...btn(card.bg === b.id && !card.useImage), padding: '7px 12px', fontSize: 11.5,
            }}>{b.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ ...btn(card.useImage), display: 'inline-block' }}>
            Photo background
            <input type="file" accept="image/*" onChange={onImage} style={{ display: 'none' }} />
          </label>
          {card.useImage && (<>
            {[['crimson', 'Crimson tint'], ['ink', 'Dark tint'], ['gold', 'Gold tint']].map(([k, l]) => (
              <button key={k} onClick={() => upd({ tint: k })} style={{ ...btn(card.tint === k), padding: '7px 11px', fontSize: 11.5 }}>{l}</button>
            ))}
            <button onClick={() => upd({ useImage: false })} style={{ ...btn(false), fontSize: 11.5, padding: '7px 11px' }}>Remove photo</button>
          </>)}
        </div>

        <input value={card.kicker} onChange={e => upd({ kicker: e.target.value })} placeholder="Kicker (small gold label)" style={inputStyle} />
        <input value={card.headline} onChange={e => upd({ headline: e.target.value })} placeholder={card.template === 'stat' ? 'The number, e.g. 250+' : 'Headline'} style={inputStyle} />
        <textarea value={card.body} onChange={e => upd({ body: e.target.value })} rows={3}
          placeholder={card.template === 'quote' ? 'Who said it (attribution)' : 'Body text'} style={{ ...inputStyle, resize: 'vertical' }} />
        <input value={card.footer} onChange={e => upd({ footer: e.target.value })} placeholder="Footer" style={inputStyle} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => download(cur)} style={btn(true)}>Download this card</button>
          {cards.length > 1 && <button onClick={downloadAll} style={btn(false)}>Download all {cards.length}</button>}
        </div>
      </div>

      {/* Preview */}
      <div style={{ flex: '1 1 340px', minWidth: 280 }}>
        <canvas ref={cvRef} style={{ width: '100%', maxWidth: format === 'story' ? 320 : 480, borderRadius: 14, boxShadow: '0 10px 30px rgba(0,0,0,.15)', display: 'block' }} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MOTION VIDEO MAKER
// ═══════════════════════════════════════════════════════════
const newScene = (type = 'text') => ({
  type, bg: type === 'title' ? 'crimson' : 'ink', tint: 'crimson',
  useImage: false, duration: type === 'title' ? 3 : 5,
  kicker: type === 'bullets' ? 'Why Smartious' : 'Smartious Homeschool',
  headline: type === 'title' ? 'Homeschool Global' : type === 'outro' ? 'Enrol for 2026' : type === 'stat' ? '250+' : 'Your message here',
  body: type === 'bullets' ? 'Cambridge, IGCSE, IB and CBC\nLive classes with real teachers\nLearn from anywhere in the world' : type === 'outro' ? 'smartioushomeschool.com' : 'One clear supporting sentence goes here.',
  footer: 'smartioushomeschool.com',
})

function VideoMaker({ toast }) {
  const [format, setFormat] = useState('story')    // story 1080x1920 | square
  const [scenes, setScenes] = useState([newScene('title'), newScene('text'), newScene('bullets'), newScene('outro')])
  const [cur, setCur] = useState(0)
  const [medias, setMedias] = useState({})         // sceneIndex -> Image|HTMLVideoElement
  const [playing, setPlaying] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const cvRef = useRef(null)
  const rafRef = useRef(null)
  const W = 1080, H = format === 'story' ? 1920 : 1080
  const scene = scenes[cur]
  const totalDur = scenes.reduce((s, x) => s + (+x.duration || 4), 0)

  const upd = (patch) => setScenes(ss => ss.map((s, i) => i === cur ? { ...s, ...patch } : s))

  // Static preview of the current scene at its final frame
  useEffect(() => {
    if (playing || rendering) return
    const cv = cvRef.current
    if (!cv) return
    cv.width = W; cv.height = H
    renderScene(cv.getContext('2d'), W, H, scene, medias[cur], 1)
  }, [scenes, cur, format, medias, playing, rendering])

  const onMedia = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    if (f.type.startsWith('video/')) {
      const v = document.createElement('video')
      v.src = url; v.muted = true; v.loop = true; v.playsInline = true
      v.onloadeddata = () => { setMedias(m => ({ ...m, [cur]: v })); upd({ useImage: true }) }
    } else {
      const img = new Image()
      img.onload = () => { setMedias(m => ({ ...m, [cur]: img })); upd({ useImage: true }) }
      img.src = url
    }
  }

  // Play the whole sequence on the preview canvas; when recording,
  // capture the canvas stream while the same loop runs.
  const runSequence = (record) => new Promise((resolve) => {
    const cv = cvRef.current
    cv.width = W; cv.height = H
    const ctx = cv.getContext('2d')
    let recorder = null, chunks = []
    if (record) {
      const stream = cv.captureStream(30)
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
      recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 })
      recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
      recorder.start(500)
    }
    // start any video backgrounds
    Object.values(medias).forEach(m => { if (m && m.play) { m.currentTime = 0; m.play().catch(() => {}) } })

    const t0 = performance.now()
    const step = (now) => {
      const t = (now - t0) / 1000
      let acc = 0, drawn = false
      for (let i = 0; i < scenes.length; i++) {
        const d = +scenes[i].duration || 4
        if (t < acc + d) {
          renderScene(ctx, W, H, scenes[i], medias[i], (t - acc) / d)
          setProgress(t / totalDur)
          drawn = true
          break
        }
        acc += d
      }
      if (!drawn) {
        // finished
        Object.values(medias).forEach(m => { if (m && m.pause) m.pause() })
        if (recorder) {
          recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }))
          recorder.stop()
        } else resolve(null)
        return
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  })

  const preview = async () => {
    if (playing || rendering) return
    setPlaying(true)
    await runSequence(false)
    setPlaying(false)
  }

  const exportVideo = async () => {
    if (playing || rendering) return
    if (typeof MediaRecorder === 'undefined') { toast?.('This browser cannot record video — use Chrome on a computer.'); return }
    setRendering(true)
    toast?.('Rendering ' + Math.round(totalDur) + 's video — keep this tab open...')
    const blob = await runSequence(true)
    setRendering(false)
    setProgress(0)
    if (blob) {
      const a = document.createElement('a')
      a.download = 'smartious-video.webm'
      a.href = URL.createObjectURL(blob)
      a.click()
      toast?.('Video downloaded. It uploads directly to YouTube, Facebook and Instagram; for WhatsApp status, convert to MP4 first (any free converter).')
    }
  }

  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 320px', minWidth: 300, maxWidth: 430, display: 'flex', flexDirection: 'column', gap: 11 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {[['story', 'Vertical 9:16'], ['square', 'Square 1:1']].map(([k, l]) => (
            <button key={k} onClick={() => setFormat(k)} style={btn(format === k)}>{l}</button>
          ))}
          <span style={{ fontSize: 11.5, color: TOKENS.s500, fontWeight: 700, marginLeft: 'auto' }}>{Math.round(totalDur)}s total</span>
        </div>

        {/* Scene strip */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {scenes.map((s, i) => (
            <button key={i} onClick={() => setCur(i)} title={SCENE_TYPES.find(t => t[0] === s.type)?.[1]} style={{
              ...btn(cur === i), padding: '7px 12px', borderRadius: 99, fontSize: 11.5,
            }}>{(i + 1) + ' \u00b7 ' + s.type}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <select onChange={e => { if (!e.target.value) return; setScenes(ss => [...ss, newScene(e.target.value)]); setCur(scenes.length); e.target.value = '' }} defaultValue="" style={{ ...inputStyle, width: 'auto', flex: 1 }}>
            <option value="" disabled>+ Add a scene...</option>
            {SCENE_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          {scenes.length > 1 && (
            <button onClick={() => { setScenes(ss => ss.filter((_, i) => i !== cur)); setMedias(m => { const n = { ...m }; delete n[cur]; return n }); setCur(Math.max(0, cur - 1)) }}
              style={{ ...btn(false), color: '#B91C1C' }}>Remove scene</button>
          )}
        </div>

        {/* Scene editor */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: TOKENS.s600 }}>Duration</label>
          <input type="range" min="2" max="12" value={scene.duration} onChange={e => upd({ duration: +e.target.value })} style={{ flex: 1 }} />
          <span style={{ fontSize: 12, fontWeight: 800, width: 30 }}>{scene.duration}s</span>
        </div>

        {scene.type !== 'title' && scene.type !== 'outro' && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {BACKGROUNDS.map(b => (
              <button key={b.id} onClick={() => upd({ bg: b.id, useImage: false })} style={{ ...btn(scene.bg === b.id && !scene.useImage), padding: '7px 11px', fontSize: 11.5 }}>{b.label}</button>
            ))}
            {scene.type === 'text' && (
              <label style={{ ...btn(scene.useImage), display: 'inline-block', fontSize: 11.5, padding: '7px 11px' }}>
                Photo / video clip
                <input type="file" accept="image/*,video/*" onChange={onMedia} style={{ display: 'none' }} />
              </label>
            )}
            {scene.useImage && [['crimson', 'Crimson tint'], ['ink', 'Dark tint'], ['gold', 'Gold tint']].map(([k, l]) => (
              <button key={k} onClick={() => upd({ tint: k })} style={{ ...btn(scene.tint === k), padding: '7px 11px', fontSize: 11.5 }}>{l}</button>
            ))}
          </div>
        )}

        {scene.type !== 'title' && scene.type !== 'outro' && (
          <input value={scene.kicker} onChange={e => upd({ kicker: e.target.value })} placeholder="Kicker (small gold label)" style={inputStyle} />
        )}
        <input value={scene.headline} onChange={e => upd({ headline: e.target.value })}
          placeholder={scene.type === 'stat' ? 'The number, e.g. 250+' : scene.type === 'title' ? 'Sub-line under the crest' : 'Headline'} style={inputStyle} />
        <textarea value={scene.body} onChange={e => upd({ body: e.target.value })} rows={scene.type === 'bullets' ? 4 : 2}
          placeholder={scene.type === 'bullets' ? 'One bullet per line (up to 5)' : scene.type === 'outro' ? 'CTA line, e.g. smartioushomeschool.com' : 'Supporting sentence'}
          style={{ ...inputStyle, resize: 'vertical' }} />

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={preview} disabled={playing || rendering} style={btn(false)}>{playing ? 'Playing...' : 'Preview all'}</button>
          <button onClick={exportVideo} disabled={playing || rendering} style={btn(true)}>{rendering ? 'Rendering ' + Math.round(progress * 100) + '%' : 'Export video'}</button>
        </div>
        <div style={{ fontSize: 10.5, color: TOKENS.s500, lineHeight: 1.55 }}>
          The export downloads a video file rendered on this computer — nothing is uploaded anywhere. It posts directly to YouTube, Facebook, Instagram and TikTok; for WhatsApp status convert to MP4 with any free converter.
        </div>
      </div>

      {/* Preview */}
      <div style={{ flex: '1 1 340px', minWidth: 280 }}>
        <canvas ref={cvRef} style={{ width: '100%', maxWidth: format === 'story' ? 300 : 440, borderRadius: 14, boxShadow: '0 10px 30px rgba(0,0,0,.2)', display: 'block', background: '#000' }} />
        {(playing || rendering) && (
          <div style={{ marginTop: 8, height: 5, background: 'rgba(0,0,0,.08)', borderRadius: 99, maxWidth: format === 'story' ? 300 : 440 }}>
            <div style={{ width: (progress * 100) + '%', height: '100%', background: GOLD, borderRadius: 99 }} />
          </div>
        )}
      </div>
    </div>
  )
}
