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
import { Muxer, ArrayBufferTarget } from '../../../../lib/mp4muxer.js'

// ── Brand ────────────────────────────────────────────────
const CRIMSON = '#8B1A2E'
const CRIMSON_DK = '#5E0F1F'
const GOLD = '#C9973A'
const INK = '#080C14'
const BONE = '#FDFAF4'

// Pre-rendered film grain (cheap even at 4K: tiled pattern)
let _grain = null
function grainPattern(ctx) {
  if (!_grain) {
    const c = document.createElement('canvas')
    c.width = 256; c.height = 256
    const g = c.getContext('2d')
    const img = g.createImageData(256, 256)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 118 + Math.random() * 20
      img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v
      img.data[i + 3] = Math.random() * 26
    }
    g.putImageData(img, 0, 0)
    _grain = c
  }
  return ctx.createPattern(_grain, 'repeat')
}
const vignette = (ctx, w, h, strength = 0.5) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.78)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(0,0,0,' + strength + ')')
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
}
const blob = (ctx, x, y, r, colour) => {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, colour); g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(x - r, y - r, r * 2, r * 2)
}

const BACKGROUNDS = [
  // Deep, desaturated crimson: premium instead of shouting
  { id: 'crimson', label: 'Deep crimson', paint: (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w * 0.4, h)
    g.addColorStop(0, '#5A1424'); g.addColorStop(0.55, '#3D0D19'); g.addColorStop(1, '#22070E')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    blob(ctx, w * 0.85, h * 0.12, Math.min(w, h) * 0.55, 'rgba(201,151,58,.10)')
    vignette(ctx, w, h, 0.45)
    ctx.fillStyle = grainPattern(ctx); ctx.fillRect(0, 0, w, h)
  }},
  { id: 'ink', label: 'Ink', paint: (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#10182B'); g.addColorStop(1, '#05070D')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    blob(ctx, w * 0.15, h * 0.9, Math.min(w, h) * 0.6, 'rgba(139,26,46,.14)')
    vignette(ctx, w, h, 0.35)
    ctx.fillStyle = grainPattern(ctx); ctx.fillRect(0, 0, w, h)
  }},
  { id: 'mesh', label: 'Mesh dark', paint: (ctx, w, h) => {
    ctx.fillStyle = '#0B0E16'; ctx.fillRect(0, 0, w, h)
    const m = Math.min(w, h)
    blob(ctx, w * 0.2, h * 0.18, m * 0.7, 'rgba(139,26,46,.5)')
    blob(ctx, w * 0.85, h * 0.35, m * 0.65, 'rgba(201,151,58,.28)')
    blob(ctx, w * 0.55, h * 0.9, m * 0.8, 'rgba(46,26,80,.45)')
    blob(ctx, w * 0.1, h * 0.75, m * 0.5, 'rgba(20,60,90,.4)')
    vignette(ctx, w, h, 0.4)
    ctx.fillStyle = grainPattern(ctx); ctx.fillRect(0, 0, w, h)
  }},
  { id: 'waves', label: 'Waves', paint: (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#191227'); g.addColorStop(1, '#070510')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    const cols = ['rgba(139,26,46,.35)', 'rgba(201,151,58,.22)', 'rgba(90,60,140,.25)', 'rgba(139,26,46,.18)']
    cols.forEach((c, i) => {
      const y0 = h * (0.45 + i * 0.14)
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.moveTo(0, y0)
      ctx.bezierCurveTo(w * 0.3, y0 - h * 0.12, w * 0.6, y0 + h * 0.1, w, y0 - h * 0.06)
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill()
    })
    vignette(ctx, w, h, 0.3)
    ctx.fillStyle = grainPattern(ctx); ctx.fillRect(0, 0, w, h)
  }},
  { id: 'geo', label: 'Geometric', paint: (ctx, w, h) => {
    ctx.fillStyle = '#0D1017'; ctx.fillRect(0, 0, w, h)
    const m = Math.min(w, h)
    ctx.save()
    ctx.translate(w * 0.78, h * 0.2); ctx.rotate(0.5)
    ctx.strokeStyle = 'rgba(201,151,58,.28)'; ctx.lineWidth = m * 0.004
    for (let i = 0; i < 4; i++) ctx.strokeRect(-m * (0.14 + i * 0.09), -m * (0.14 + i * 0.09), m * (0.28 + i * 0.18), m * (0.28 + i * 0.18))
    ctx.restore()
    ctx.save()
    ctx.translate(w * 0.12, h * 0.85); ctx.rotate(-0.35)
    ctx.strokeStyle = 'rgba(139,26,46,.4)'
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, m * (0.12 + i * 0.09), 0, Math.PI * 2); ctx.stroke() }
    ctx.restore()
    vignette(ctx, w, h, 0.35)
    ctx.fillStyle = grainPattern(ctx); ctx.fillRect(0, 0, w, h)
  }},
  { id: 'bone', label: 'Bone', paint: (ctx, w, h) => {
    ctx.fillStyle = BONE; ctx.fillRect(0, 0, w, h)
    blob(ctx, w * 0.9, h * 0.1, Math.min(w, h) * 0.5, 'rgba(201,151,58,.14)')
    blob(ctx, w * 0.08, h * 0.92, Math.min(w, h) * 0.45, 'rgba(139,26,46,.08)')
  }},
  { id: 'gold', label: 'Gold band', paint: (ctx, w, h) => {
    const g0 = ctx.createLinearGradient(0, 0, 0, h)
    g0.addColorStop(0, '#10131C'); g0.addColorStop(1, '#07090F')
    ctx.fillStyle = g0; ctx.fillRect(0, 0, w, h)
    const g = ctx.createLinearGradient(0, h * 0.62, 0, h)
    g.addColorStop(0, '#B0842E'); g.addColorStop(1, '#6E5418')
    ctx.fillStyle = g; ctx.fillRect(0, h * 0.66, w, h * 0.34)
    vignette(ctx, w, h, 0.3)
    ctx.fillStyle = grainPattern(ctx); ctx.fillRect(0, 0, w, h)
  }},
]

// Typography: real display fonts, loaded once from Google Fonts.
const FONTS = [
  ['Montserrat', 'Bold modern'],
  ['Bebas Neue', 'Poster caps'],
  ['Playfair Display', 'Elegant serif'],
  ['Georgia', 'Classic serif'],
]
let _fontsLoaded = false
async function loadBrandFonts() {
  if (_fontsLoaded) return
  if (!document.getElementById('sm-studio-fonts')) {
    const l = document.createElement('link')
    l.id = 'sm-studio-fonts'; l.rel = 'stylesheet'
    l.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Bebas+Neue&family=Playfair+Display:wght@700;800&display=swap'
    document.head.appendChild(l)
  }
  try {
    await Promise.all([
      document.fonts.load('900 64px Montserrat'),
      document.fonts.load('400 64px "Bebas Neue"'),
      document.fonts.load('800 64px "Playfair Display"'),
      document.fonts.ready,
    ])
  } catch (e) { /* system fallbacks still work */ }
  _fontsLoaded = true
}
const headlineFont = (px, family) => {
  if (family === 'Bebas Neue') return `400 ${px * 1.14}px "Bebas Neue", Impact, sans-serif`
  if (family === 'Montserrat') return `900 ${px}px Montserrat, Arial, sans-serif`
  if (family === 'Playfair Display') return `800 ${px}px "Playfair Display", Georgia, serif`
  return `800 ${px}px Georgia, serif`
}
const headlineText = (t, family) => family === 'Bebas Neue' ? String(t || '').toUpperCase() : t

// Colour grades applied to photo/video backgrounds
const GRADES = [
  ['none', 'None', ''],
  ['cinema', 'Cinematic', 'contrast(1.12) saturate(1.22) brightness(0.98)'],
  ['warm', 'Warm', 'sepia(0.22) saturate(1.18) contrast(1.06)'],
  ['cool', 'Cool', 'saturate(1.05) hue-rotate(-10deg) contrast(1.08) brightness(1.02)'],
  ['noir', 'Noir', 'grayscale(1) contrast(1.2) brightness(0.98)'],
]
const gradeFilter = (id) => (GRADES.find(g => g[0] === id) || GRADES[0])[2]

const bgById = (id) => BACKGROUNDS.find(b => b.id === id) || BACKGROUNDS[0]
const isDark = (id) => id !== 'bone'

// ── Shared canvas helpers ────────────────────────────────
// The EXACT crest from LoginPage.jsx, rasterized once at high
// resolution and drawn as an image — identical to the site's mark,
// including the three book lines and inner shield stroke the old
// hand-drawn approximation missed.
const CREST_SVG = `<svg width="480" height="480" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="stu-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#A8203A"/>
      <stop offset="100%" stop-color="#7A1026"/>
    </linearGradient>
  </defs>
  <path d="M40 6 L68 14 Q70 14 70 17 L70 44 Q70 60 40 74 Q10 60 10 44 L10 17 Q10 14 12 14 Z"
        fill="url(#stu-grad)" stroke="#6A0E20" stroke-width="0.6"/>
  <path d="M40 10 L64 17 Q65.5 17 65.5 19 L65.5 44 Q65.5 57 40 69 Q14.5 57 14.5 44 L14.5 19 Q14.5 17 16 17 Z"
        fill="none" stroke="rgba(255,255,255,.14)" stroke-width="0.8"/>
  <polygon points="40,19 42.2,26 49.5,26 43.7,30.4 45.9,37.5 40,33 34.1,37.5 36.3,30.4 30.5,26 37.8,26"
           fill="#C9973A" stroke="#C89A28" stroke-width="0.4"/>
  <g transform="translate(40 52)">
    <path d="M-14 -4 L-14 8 L-1 9 L-1 -3 Q-8 -5 -14 -4 Z" fill="#FFFFFF" stroke="#FDFAF4" stroke-width=".4"/>
    <path d="M14 -4 L14 8 L1 9 L1 -3 Q8 -5 14 -4 Z" fill="#FFFFFF" stroke="#FDFAF4" stroke-width=".4"/>
    <line x1="-10" y1="-0.5" x2="-4" y2="-0.5" stroke="#A8203A" stroke-width=".5" stroke-linecap="round"/>
    <line x1="-10" y1="2" x2="-4" y2="2" stroke="#A8203A" stroke-width=".5" stroke-linecap="round"/>
    <line x1="-10" y1="4.5" x2="-4" y2="4.5" stroke="#A8203A" stroke-width=".5" stroke-linecap="round"/>
    <line x1="4" y1="-0.5" x2="10" y2="-0.5" stroke="#A8203A" stroke-width=".5" stroke-linecap="round"/>
    <line x1="4" y1="2" x2="10" y2="2" stroke="#A8203A" stroke-width=".5" stroke-linecap="round"/>
    <line x1="4" y1="4.5" x2="10" y2="4.5" stroke="#A8203A" stroke-width=".5" stroke-linecap="round"/>
  </g>
</svg>`

let _crestImg = null
function ensureCrest() {
  if (_crestImg) return Promise.resolve(_crestImg)
  return new Promise((res) => {
    const img = new Image()
    img.onload = () => { _crestImg = img; res(img) }
    img.onerror = () => res(null)
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(CREST_SVG)
  })
}

function drawCrest(ctx, x, y, size) {
  if (_crestImg) ctx.drawImage(_crestImg, x, y, size, size)
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
const clamp01 = (t) => Math.min(1, Math.max(0, t))

// Draw a line of text word by word, each word rising and fading in,
// staggered left to right. p covers THIS line's reveal window.
function drawWordsRise(ctx, text, x, y, p, gap = 0.12) {
  const words = String(text || '').split(' ')
  let cx = x
  words.forEach((w, i) => {
    const wp = easeOut((p - i * gap) / (1 - Math.min(0.9, i * gap)))
    if (wp > 0) {
      ctx.save()
      ctx.globalAlpha *= clamp01(wp)
      ctx.fillText(w, cx, y + (1 - clamp01(wp)) * 26)
      ctx.restore()
    }
    cx += ctx.measureText(w + ' ').width
  })
}

// Typewriter: characters appear in sequence with a gold caret.
function drawTypewriter(ctx, text, x, y, p) {
  const s = String(text || '')
  const n = Math.floor(clamp01(p) * s.length + 0.999)
  const shown = s.slice(0, n)
  ctx.fillText(shown, x, y)
  if (n < s.length) {
    const w = ctx.measureText(shown).width
    const fs = parseFloat(ctx.font) || 40
    ctx.save()
    ctx.fillStyle = GOLD
    ctx.fillRect(x + w + fs * 0.08, y - fs * 0.78, fs * 0.09, fs * 0.9)
    ctx.restore()
  }
}

// Word-pop: each word scales in from small with alternating corner
// drift — the "pop from different corners" text energy.
function drawWordsPop(ctx, text, x, y, p, gap = 0.1) {
  const words = String(text || '').split(' ')
  let cx = x
  const fs = parseFloat(ctx.font) || 40
  words.forEach((w, i) => {
    const wp = easeOut(clamp01((p - i * gap) / Math.max(0.15, 1 - i * gap)))
    const ww = ctx.measureText(w + ' ').width
    if (wp > 0) {
      const dx = (i % 2 ? 1 : -1) * (1 - wp) * fs * 0.7
      const dy = ((i % 3) - 1) * (1 - wp) * fs * 0.55
      ctx.save()
      ctx.globalAlpha *= wp
      ctx.translate(cx + ww / 2 + dx, y - fs * 0.35 + dy)
      ctx.scale(0.4 + 0.6 * wp, 0.4 + 0.6 * wp)
      ctx.fillText(w, -ww / 2, fs * 0.35)
      ctx.restore()
    }
    cx += ww
  })
}

// Animated version of renderCard: p 0..1 across the card's screen
// time; all text has revealed by p ~ 0.55 and holds to the end.
function renderCardMotion(ctx, W, H, card, media, p, fx = 'rise') {
  renderCardBase(ctx, W, H, card, media, p)
  const B = Math.min(W, H)
  const dark = isDark(card.bg)
  const onImg = card.useImage && media
  const fg = onImg || dark ? '#FFFFFF' : INK
  const subC = onImg || dark ? 'rgba(255,255,255,.86)' : 'rgba(8,12,20,.65)'
  const fam = card.font || 'Montserrat'
  const M = W * 0.085
  let y = H * (card.template === 'stat' ? 0.3 : 0.28)

  const drawHeadLine = (ln, x, yy, pp, lines) => {
    if (fx === 'type') drawTypewriter(ctx, ln.text, x, yy, ln.share ? (pp - ln.i * ln.share) / ln.share : pp)
    else if (fx === 'pop') drawWordsPop(ctx, ln.text, x, yy, clamp01(pp - ln.i * 0.14))
    else drawWordsRise(ctx, ln.text, x, yy, clamp01(pp - ln.i * 0.14), 0.1)
  }

  if (card.kicker) {
    const kp = easeOut(p / 0.14)
    if (kp > 0) {
      ctx.globalAlpha = clamp01(kp)
      ctx.fillStyle = GOLD
      ctx.font = `800 ${B * 0.028}px Montserrat, Arial, sans-serif`
      ctx.fillText(String(card.kicker).toUpperCase(), M, y + (1 - clamp01(kp)) * 20)
      ctx.globalAlpha = 1
    }
    y += B * 0.055
  }
  const hp = clamp01((p - 0.08) / 0.4)
  const bp = clamp01((p - 0.3) / 0.35)

  if (card.template === 'stat') {
    const statFg = onImg || dark ? '#FFFFFF' : '#5A1424'
    if (hp > 0) {
      const sc = 0.7 + 0.3 * easeOut(hp)
      ctx.save()
      ctx.globalAlpha = clamp01(hp * 1.6)
      ctx.translate(M, y + B * 0.17)
      ctx.scale(sc, sc)
      ctx.fillStyle = statFg
      ctx.font = headlineFont(B * 0.19, fam)
      ctx.fillText(headlineText(card.headline || '250+', fam), 0, 0)
      ctx.restore()
    }
    y += B * 0.22
    if (bp > 0) {
      ctx.fillStyle = subC
      ctx.font = `600 ${B * 0.042}px Arial`
      const lines = wrapText(ctx, card.body, W - 2 * M)
      lines.forEach((ln, i) => drawWordsRise(ctx, ln, M, y + B * 0.02 + i * B * 0.058, clamp01(bp - i * 0.12), 0.06))
    }
  } else if (card.template === 'quote') {
    ctx.globalAlpha = clamp01(hp * 2)
    ctx.fillStyle = GOLD
    ctx.font = `900 ${B * 0.16}px Georgia, serif`
    ctx.fillText('\u201C', M - B * 0.01, y + B * 0.1)
    ctx.globalAlpha = 1
    ctx.fillStyle = fg
    const qSize = fx === 'type' ? B * 0.044 : B * 0.052
    ctx.font = fam === 'Playfair Display' || fam === 'Georgia'
      ? `italic 700 ${qSize}px ${fam === 'Georgia' ? 'Georgia' : '"Playfair Display", Georgia'}, serif`
      : headlineFont(qSize, fam)
    const lines = wrapText(ctx, headlineText(card.headline, fam), W - 2 * M)
    let qy = y + B * 0.15
    lines.forEach((ln, i) => {
      drawHeadLine({ text: ln, i, share: fx === 'type' ? 1 / lines.length : 0 }, M, qy, hp, lines)
      qy += qSize * 1.38
    })
    if (card.body && bp > 0) {
      ctx.globalAlpha = clamp01(bp)
      ctx.fillStyle = GOLD
      ctx.font = `700 ${B * 0.034}px Arial`
      ctx.fillText('\u2014 ' + card.body, M, qy + B * 0.05)
      ctx.globalAlpha = 1
    }
  } else {
    ctx.fillStyle = fg
    const hSize = fx === 'type' ? B * 0.05 : B * 0.064
    ctx.font = headlineFont(hSize, fam)
    const lines = wrapText(ctx, headlineText(card.headline, fam), W - 2 * M)
    let hy = y + B * 0.06
    lines.forEach((ln, i) => {
      drawHeadLine({ text: ln, i, share: fx === 'type' ? 1 / lines.length : 0 }, M, hy, hp, lines)
      hy += hSize * 1.28
    })
    const up = clamp01((p - 0.32) / 0.15)
    ctx.fillStyle = GOLD
    ctx.fillRect(M, hy - B * 0.02, B * 0.14 * easeOut(up), B * 0.009)
    if (card.body && bp > 0) {
      ctx.fillStyle = subC
      ctx.font = `500 ${B * 0.038}px Arial`
      const bl = wrapText(ctx, card.body, W - 2 * M)
      bl.forEach((ln, i) => drawWordsRise(ctx, ln, M, hy + B * 0.045 + i * B * 0.056, clamp01(bp - i * 0.12), 0.05))
    }
  }
}

// The non-text parts of a card, shared by static and motion renders.
// pAnim (0..1) drives the media corner-pop entrance; static callers
// pass 1. Type sizes scale from B = min(W, H) so 4K landscape and
// portrait both set correctly.
function renderCardBase(ctx, W, H, card, media, pAnim = 1) {
  const B = Math.min(W, H)
  bgById(card.bg).paint(ctx, W, H)
  const dark = isDark(card.bg)
  const M = W * 0.085
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  if (card.useImage && media) {
    const iw = media.videoWidth || media.width, ih = media.videoHeight || media.height
    if (iw && ih) {
      // Corner-pop entrance: the picture arrives from one corner,
      // settling from a slight over-zoom.
      const ep = easeOut(Math.min(1, pAnim / 0.28))
      const corner = card.popCorner || 0
      const cdx = [ -1, 1, -1, 1 ][corner], cdy = [ -1, -1, 1, 1 ][corner]
      const ox = (1 - ep) * cdx * W * 0.1
      const oy = (1 - ep) * cdy * H * 0.1
      const zoom = 1 + (1 - ep) * 0.12

      ctx.save()
      ctx.globalAlpha = Math.min(1, ep * 1.6)
      const filt = gradeFilter(card.grade)
      if (card.fitMode === 'fit') {
        // Sharp contained picture over a blurred cover backdrop —
        // small phone videos keep their true resolution instead of
        // being blown up and smeared.
        const cover = Math.max(W / iw, H / ih)
        try { ctx.filter = (filt ? filt + ' ' : '') + 'blur(' + Math.round(B * 0.03) + 'px) brightness(0.6)' } catch (e) { /* old browser */ }
        ctx.drawImage(media, (W - iw * cover) / 2, (H - ih * cover) / 2, iw * cover, ih * cover)
        ctx.filter = filt || 'none'
        const fit = Math.min(W / iw, H / ih)
        ctx.translate(ox, oy)
        ctx.drawImage(media, (W - iw * fit * zoom) / 2, (H - ih * fit * zoom) / 2, iw * fit * zoom, ih * fit * zoom)
      } else {
        ctx.filter = filt || 'none'
        const scale = Math.max(W / iw, H / ih) * zoom
        ctx.drawImage(media, (W - iw * scale) / 2 + ox, (H - ih * scale) / 2 + oy, iw * scale, ih * scale)
      }
      ctx.filter = 'none'
      ctx.restore()

      const tint = ctx.createLinearGradient(0, 0, 0, H)
      if (card.tint === 'crimson') { tint.addColorStop(0, 'rgba(90,20,36,.5)'); tint.addColorStop(1, 'rgba(34,7,14,.85)') }
      else if (card.tint === 'gold') { tint.addColorStop(0, 'rgba(30,20,4,.42)'); tint.addColorStop(1, 'rgba(120,88,24,.7)') }
      else { tint.addColorStop(0, 'rgba(8,12,20,.4)'); tint.addColorStop(1, 'rgba(5,7,13,.85)') }
      ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H)
      if (card.grade === 'cinema') vignette(ctx, W, H, 0.4)
    }
  }

  // Branding header: crest lockup, bold wordmark, or clean
  const onDark = card.useImage || dark
  if (card.brand !== 'none') {
    if (card.brand === 'word') {
      ctx.fillStyle = onDark ? '#FFFFFF' : INK
      ctx.font = `900 ${B * 0.034}px Montserrat, Arial, sans-serif`
      ctx.fillText('SMARTIOUS', M, M * 0.8 + B * 0.03)
      const ww = ctx.measureText('SMARTIOUS').width
      ctx.fillStyle = GOLD
      ctx.fillRect(M + ww + B * 0.014, M * 0.8 + B * 0.006, B * 0.016, B * 0.016)
    } else {
      const crest = B * 0.075
      drawCrest(ctx, M, M * 0.8, crest)
      ctx.fillStyle = onDark ? '#FFFFFF' : INK
      ctx.font = `700 ${B * 0.036}px Georgia, serif`
      ctx.fillText('Smart', M + crest + B * 0.018, M * 0.8 + crest * 0.62)
      const smW = ctx.measureText('Smart').width
      ctx.fillStyle = GOLD
      ctx.font = `italic 500 ${B * 0.036}px Georgia, serif`
      ctx.fillText('ious', M + crest + B * 0.018 + smW, M * 0.8 + crest * 0.62)
    }
  }
  if (card.seriesTotal > 1) {
    const chipTxt = card.seriesNo + ' / ' + card.seriesTotal
    ctx.font = `800 ${B * 0.03}px Arial`
    const cw = ctx.measureText(chipTxt).width + B * 0.045
    ctx.fillStyle = GOLD
    ctx.beginPath()
    ctx.roundRect ? ctx.roundRect(W - M - cw, M * 0.78, cw, B * 0.055, B * 0.028) : ctx.rect(W - M - cw, M * 0.78, cw, B * 0.055)
    ctx.fill()
    ctx.fillStyle = INK
    ctx.textAlign = 'center'
    ctx.fillText(chipTxt, W - M - cw / 2, M * 0.78 + B * 0.038)
    ctx.textAlign = 'left'
  }
  ctx.fillStyle = onDark ? 'rgba(255,255,255,.55)' : 'rgba(8,12,20,.5)'
  ctx.font = `700 ${B * 0.026}px Arial`
  ctx.fillText((card.footer || 'smartioushomeschool.com').toUpperCase(), M, H - M * 0.7)
  ctx.fillStyle = GOLD
  ctx.fillRect(M, H - M * 0.7 + B * 0.014, B * 0.055, B * 0.006)
}

// Static card render: the motion renderer at its final frame — one
// code path, so fonts, grading and fit look identical in PNG and video.
function renderCard(ctx, W, H, card, media, p = 1) {
  renderCardMotion(ctx, W, H, card, media, p >= 1 ? 1 : p, card.textFx || 'rise')
}

// ═══════════════════════════════════════════════════════════
// MOTION SCENE RENDERER — p runs 0..1 over the scene duration.
// ═══════════════════════════════════════════════════════════
function renderScene(ctx, W, H, scene, media, p) {
  const B = Math.min(W, H)
  if (scene.type === 'title') {
    bgById(scene.bg || 'crimson').paint(ctx, W, H)
    const cp = easeOut(p * 1.6)
    const tp = easeOut((p - 0.25) * 2)
    if (scene.brand === 'word') {
      // Bold wordmark sting: SMARTIOUS settles in from a slam
      if (cp > 0) {
        ctx.save()
        ctx.globalAlpha = clamp01(cp)
        ctx.textAlign = 'center'
        const sc = 1.25 - 0.25 * cp
        ctx.translate(W / 2, H * 0.44)
        ctx.scale(sc, sc)
        ctx.fillStyle = '#FFFFFF'
        ctx.font = `900 ${B * 0.105}px Montserrat, Arial, sans-serif`
        ctx.fillText('SMARTIOUS', 0, 0)
        ctx.restore()
        ctx.textAlign = 'left'
        if (cp > 0.85) {
          ctx.fillStyle = GOLD
          ctx.fillRect(W / 2 + B * 0.29, H * 0.44 - B * 0.032, B * 0.032, B * 0.032)
        }
      }
      if (tp > 0) {
        ctx.globalAlpha = clamp01(tp)
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(255,255,255,.78)'
        ctx.font = `800 ${B * 0.03}px Montserrat, Arial, sans-serif`
        ctx.fillText(String(scene.headline || 'HOMESCHOOL GLOBAL').toUpperCase(), W / 2, H * 0.44 + B * 0.072)
        ctx.textAlign = 'left'
        ctx.globalAlpha = 1
        ctx.fillStyle = GOLD
        const uw = B * 0.24 * easeOut((p - 0.4) * 2)
        ctx.fillRect(W / 2 - uw / 2, H * 0.44 + B * 0.1, uw, B * 0.007)
      }
    } else {
      const cs = B * 0.24
      ctx.globalAlpha = cp
      drawCrest(ctx, W / 2 - cs / 2, H * 0.28 - (1 - cp) * 40, cs)
      ctx.globalAlpha = 1
      if (tp > 0) {
        ctx.globalAlpha = tp
        ctx.textAlign = 'center'
        ctx.fillStyle = '#FFFFFF'
        ctx.font = `700 ${B * 0.085}px Georgia, serif`
        ctx.fillText('Smartious', W / 2 - B * 0.028, H * 0.28 + cs + B * 0.09)
        ctx.fillStyle = GOLD
        ctx.font = `italic 500 ${B * 0.05}px Georgia, serif`
        ctx.fillText(scene.headline || 'Homeschool Global', W / 2, H * 0.28 + cs + B * 0.155)
        ctx.textAlign = 'left'
        ctx.globalAlpha = 1
        ctx.fillStyle = GOLD
        const uw = B * 0.24 * easeOut((p - 0.4) * 2)
        ctx.fillRect(W / 2 - uw / 2, H * 0.28 + cs + B * 0.185, uw, B * 0.008)
      }
    }
    ctx.globalAlpha = 1
  } else if (scene.type === 'outro') {
    bgById(scene.bg || 'ink').paint(ctx, W, H)
    const cs = B * 0.17
    if (scene.brand === 'word') {
      ctx.textAlign = 'center'
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `900 ${B * 0.06}px Montserrat, Arial, sans-serif`
      ctx.fillText('SMARTIOUS', W / 2, H * 0.34)
      ctx.textAlign = 'left'
    } else {
      drawCrest(ctx, W / 2 - cs / 2, H * 0.3, cs)
    }
    ctx.textAlign = 'center'
    ctx.globalAlpha = easeOut(p * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = headlineFont(B * 0.06, scene.font || 'Montserrat')
    const lines = wrapText(ctx, headlineText(scene.headline || 'Enrol today', scene.font), W * 0.8)
    drawLines(ctx, lines, W * 0.1, H * 0.3 + cs + B * 0.1, B * 0.078, 'center', W * 0.8)
    ctx.fillStyle = GOLD
    ctx.font = `700 ${B * 0.042}px Arial`
    ctx.fillText(scene.body || 'smartioushomeschool.com', W / 2, H * 0.3 + cs + B * 0.1 + lines.length * B * 0.078 + B * 0.04)
    ctx.textAlign = 'left'
    ctx.globalAlpha = 1
  } else if (scene.type === 'bullets') {
    bgById(scene.bg || 'ink').paint(ctx, W, H)
    const M = W * 0.09
    ctx.fillStyle = GOLD
    ctx.font = `800 ${B * 0.03}px Montserrat, Arial, sans-serif`
    ctx.fillText((scene.kicker || 'WHY SMARTIOUS').toUpperCase(), M, H * 0.16)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = headlineFont(B * 0.058, scene.font || 'Montserrat')
    let y = drawLines(ctx, wrapText(ctx, headlineText(scene.headline, scene.font), W - 2 * M), M, H * 0.16 + B * 0.075, B * 0.075)
    const items = String(scene.body || '').split('\n').filter(Boolean).slice(0, 5)
    items.forEach((it, i) => {
      const ip = easeOut((p - 0.15 - i * 0.14) * 4)
      if (ip <= 0) return
      ctx.globalAlpha = ip
      const iy = y + B * 0.05 + i * B * 0.095 - (1 - ip) * 30
      ctx.fillStyle = GOLD
      ctx.beginPath(); ctx.arc(M + B * 0.014, iy - B * 0.014, B * 0.014, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,.92)'
      ctx.font = `600 ${B * 0.04}px Arial`
      const ls = wrapText(ctx, it, W - 2 * M - B * 0.06)
      drawLines(ctx, ls, M + B * 0.05, iy, B * 0.052)
      ctx.globalAlpha = 1
    })
  } else if (scene.type === 'stat') {
    renderCardMotion(ctx, W, H, { ...scene, template: 'stat', seriesTotal: 0 }, media, Math.min(1, p * 1.4), scene.textFx || 'rise')
  } else {
    renderCardMotion(ctx, W, H, { ...scene, template: 'idea', seriesTotal: 0 }, media, Math.min(1, p * 1.4), scene.textFx || 'rise')
  }
}

// ═══════════════════════════════════════════════════════════
// SOUND ENGINE
// Music + narration are mixed with Web Audio and recorded INTO the
// exported video. The built-in track is a soft ambient pad composed
// right here (warm chords, gentle plucks) so there is always
// royalty-free music available with zero uploads.
// ═══════════════════════════════════════════════════════════
async function makeBuiltinMusic() {
  const DUR = 16, SR = 44100
  const oac = new OfflineAudioContext(2, SR * DUR, SR)
  const master = oac.createGain(); master.gain.value = 0.5; master.connect(oac.destination)
  const lp = oac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.connect(master)
  const CHORDS = [
    [261.63, 329.63, 392.0, 493.88],   // Cmaj7
    [220.0, 261.63, 329.63, 392.0],    // Am7
    [174.61, 220.0, 261.63, 329.63],   // Fmaj7
    [196.0, 246.94, 293.66, 349.23],   // G7-ish
  ]
  CHORDS.forEach((chord, ci) => {
    const t0 = ci * 4
    chord.forEach(f => {
      for (const det of [-2, 2]) {
        const o = oac.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.detune.value = det
        const g = oac.createGain()
        g.gain.setValueAtTime(0.0001, t0)
        g.gain.linearRampToValueAtTime(0.045, t0 + 1.4)
        g.gain.setValueAtTime(0.045, t0 + 2.8)
        g.gain.linearRampToValueAtTime(0.0001, t0 + 4.1)
        o.connect(g); g.connect(lp)
        o.start(t0); o.stop(t0 + 4.2)
      }
    })
    // Gentle pluck on beats 1 and 3, up an octave, pentatonic-safe
    ;[0, 2].forEach((beat, bi) => {
      const f = chord[(ci + bi) % chord.length] * 2
      const o = oac.createOscillator(); o.type = 'triangle'; o.frequency.value = f
      const g = oac.createGain()
      const tp = t0 + beat + 0.5
      g.gain.setValueAtTime(0.0001, tp)
      g.gain.linearRampToValueAtTime(0.05, tp + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, tp + 1.6)
      o.connect(g); g.connect(lp)
      o.start(tp); o.stop(tp + 1.7)
    })
  })
  return oac.startRendering()
}

// Builds the full audio graph for a render/preview run.
// Returns { audioTracks, start, stop } — tracks go into the
// MediaRecorder stream; sound is also monitored on the speakers.
function createMixer({ totalDur, musicBuffer, musicVol, voBuffer, voVol, record }) {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC || (!musicBuffer && !voBuffer)) return { audioTracks: [], start: () => {}, stop: () => {} }
  const ac = new AC()
  const dest = record ? ac.createMediaStreamDestination() : null
  const master = ac.createGain(); master.gain.value = 1
  master.connect(ac.destination)
  if (dest) master.connect(dest)
  const sources = []
  if (musicBuffer) {
    const s = ac.createBufferSource()
    s.buffer = musicBuffer; s.loop = true
    const g = ac.createGain()
    // Duck the music under the narration
    const level = (voBuffer ? 0.35 : 1) * (musicVol ?? 0.6)
    g.gain.setValueAtTime(0.0001, ac.currentTime)
    g.gain.linearRampToValueAtTime(level, ac.currentTime + 1.2)
    // Fade out over the last 1.6 s
    g.gain.setValueAtTime(level, ac.currentTime + Math.max(1.3, totalDur - 1.6))
    g.gain.linearRampToValueAtTime(0.0001, ac.currentTime + totalDur)
    s.connect(g); g.connect(master)
    sources.push(s)
  }
  if (voBuffer) {
    const s = ac.createBufferSource()
    s.buffer = voBuffer
    const g = ac.createGain(); g.gain.value = voVol ?? 1
    s.connect(g); g.connect(master)
    sources.push({ src: s, at: 0.5 })
  }
  return {
    audioTracks: dest ? dest.stream.getAudioTracks() : [],
    start: () => sources.forEach(s => s.at != null ? s.src.start(ac.currentTime + s.at) : s.start()),
    stop: () => { try { ac.close() } catch (e) { /* closed */ } },
  }
}

// ═══════════════════════════════════════════════════════════
// FAST EXPORT — offline rendering.
// The realtime recorder is bound to the wall clock: a 50 s video
// costs 50 s. This path instead feeds frames to the browser's
// hardware encoder (WebCodecs) as fast as they can be drawn and
// muxes a real MP4 — typically 3-8x faster, and the MP4 posts
// straight to WhatsApp with no conversion.
// ═══════════════════════════════════════════════════════════

// Render the entire soundtrack (music loop + ducking + fades + the
// narration) offline into one stereo buffer.
async function renderMixOffline({ totalDur, musicBuffer, musicVol, voBuffer, voVol }) {
  if (!musicBuffer && !voBuffer) return null
  const SR = 44100
  const oac = new OfflineAudioContext(2, Math.ceil(SR * totalDur), SR)
  const master = oac.createGain(); master.gain.value = 1; master.connect(oac.destination)
  if (musicBuffer) {
    const s = oac.createBufferSource(); s.buffer = musicBuffer; s.loop = true
    const g = oac.createGain()
    const level = (voBuffer ? 0.35 : 1) * (musicVol ?? 0.6)
    g.gain.setValueAtTime(0.0001, 0)
    g.gain.linearRampToValueAtTime(level, 1.2)
    g.gain.setValueAtTime(level, Math.max(1.3, totalDur - 1.6))
    g.gain.linearRampToValueAtTime(0.0001, totalDur)
    s.connect(g); g.connect(master)
    s.start(0)
  }
  if (voBuffer) {
    const s = oac.createBufferSource(); s.buffer = voBuffer
    const g = oac.createGain(); g.gain.value = voVol ?? 1
    s.connect(g); g.connect(master)
    s.start(0.5)
  }
  return oac.startRendering()
}

// Seek a background <video> to an exact time and wait for the frame.
const seekVideo = (v, t) => new Promise((res) => {
  const target = (v.duration && isFinite(v.duration)) ? t % v.duration : t
  if (Math.abs(v.currentTime - target) < 0.001) return res()
  const done = () => { v.removeEventListener('seeked', done); res() }
  v.addEventListener('seeked', done)
  try { v.currentTime = target } catch (e) { res() }
  setTimeout(done, 400)   // never wedge on a stubborn seek
})

// drawFrame(ctx, t) draws one timeline frame; mediaAt(t) returns the
// video elements that must show the correct frame at time t.
async function exportMp4Fast({ canvas, W, H, totalDur, drawFrame, mediaAt, sound, onProgress }) {
  if (typeof VideoEncoder === 'undefined') return null   // caller falls back to realtime
  const FPS = 30
  const audioBuf = await renderMixOffline({ totalDur, ...sound })

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width: W, height: H },
    ...(audioBuf ? { audio: { codec: 'aac', sampleRate: 44100, numberOfChannels: 2 } } : {}),
    fastStart: 'in-memory',
  })

  let vErr = null
  const vEnc = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => { vErr = e },
  })
  // 4K needs High Level 5.1 and real bitrate; 1080p keeps Level 4.0.
  const px = W * H
  const bitrate = px >= 3840 * 2160 ? 34_000_000 : px >= 2160 * 2160 ? 24_000_000 : 8_000_000
  let vConfig = null
  for (const codec of (px > 1920 * 1080 ? ['avc1.640033', 'avc1.640032', 'avc1.640028'] : ['avc1.640028'])) {
    const c = { codec, width: W, height: H, bitrate, framerate: FPS }
    const s = await VideoEncoder.isConfigSupported(c).catch(() => null)
    if (s?.supported) { vConfig = c; break }
  }
  if (!vConfig) return null
  vEnc.configure(vConfig)

  let aEnc = null
  if (audioBuf) {
    const aConfig = { codec: 'mp4a.40.2', sampleRate: 44100, numberOfChannels: 2, bitrate: 128_000 }
    const aSupport = typeof AudioEncoder !== 'undefined'
      ? await AudioEncoder.isConfigSupported(aConfig).catch(() => null) : null
    if (aSupport?.supported) {
      aEnc = new AudioEncoder({
        output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
        error: (e) => { vErr = e },
      })
      aEnc.configure(aConfig)
    }
  }

  const ctx = canvas.getContext('2d')
  const totalFrames = Math.ceil(totalDur * FPS)
  for (let f = 0; f < totalFrames; f++) {
    const t = f / FPS
    const vids = mediaAt ? mediaAt(t) : []
    for (const v of vids) if (v && v.play) await seekVideo(v, t)
    drawFrame(ctx, t)
    const frame = new VideoFrame(canvas, { timestamp: Math.round(t * 1e6), duration: Math.round(1e6 / FPS) })
    vEnc.encode(frame, { keyFrame: f % 60 === 0 })
    frame.close()
    while (vEnc.encodeQueueSize > 6) await new Promise(r => setTimeout(r, 2))
    if (f % 12 === 0) { onProgress?.(f / totalFrames); await new Promise(r => setTimeout(r, 0)) }
    if (vErr) throw vErr
  }

  if (aEnc && audioBuf) {
    // Interleave the offline mix into planar AudioData chunks.
    const CH = 2, CHUNK = 4096
    const L = audioBuf.getChannelData(0)
    const R = audioBuf.numberOfChannels > 1 ? audioBuf.getChannelData(1) : L
    for (let off = 0; off < L.length; off += CHUNK) {
      const n = Math.min(CHUNK, L.length - off)
      const data = new Float32Array(n * CH)
      data.set(L.subarray(off, off + n), 0)
      data.set(R.subarray(off, off + n), n)
      const ad = new AudioData({
        format: 'f32-planar', sampleRate: 44100, numberOfFrames: n,
        numberOfChannels: CH, timestamp: Math.round((off / 44100) * 1e6), data,
      })
      aEnc.encode(ad)
      ad.close()
      while (aEnc.encodeQueueSize > 8) await new Promise(r => setTimeout(r, 2))
    }
    await aEnc.flush()
  }
  await vEnc.flush()
  muxer.finalize()
  onProgress?.(1)
  return new Blob([muxer.target.buffer], { type: 'video/mp4' })
}

// Narrator script: turns each card's text into worry -> solution
// narration a parent actually hears themselves in.
function buildNarration(cards) {
  const lines = []
  lines.push("As a parent, you want to be certain before you trust anyone with your child's education. So let us answer the questions you are really asking.")
  cards.forEach((c, i) => {
    const head = (c.headline || '').trim()
    const body = (c.body || '').trim()
    if (!head && !body) return
    if (i === cards.length - 1) {
      lines.push(`${head}. ${body}. Smartious Homeschool — the school that travels with your family.`)
    } else if (c.template === 'stat') {
      lines.push(`The numbers speak for themselves: ${head}. ${body}`)
    } else if (c.template === 'quote') {
      lines.push(`One of our parents put it best: ${head} — ${body}.`)
    } else {
      lines.push(`Maybe you have wondered: ${head.replace(/[.?!]$/, '')}? Here is the honest answer. ${body}`)
    }
  })
  return lines.join('\n\n')
}

// ── Shared sound panel used by both tabs ──
function SoundPanel({ sound, setSound, cards, toast }) {
  const [voices, setVoices] = useState([])
  const [voiceIdx, setVoiceIdx] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  useEffect(() => {
    const load = () => {
      const v = (window.speechSynthesis?.getVoices() || []).filter(x => x.lang.startsWith('en'))
      if (v.length) setVoices(v)
    }
    load()
    window.speechSynthesis?.addEventListener?.('voiceschanged', load)
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', load)
  }, [])

  const decodeFile = (file, key) => {
    const AC = window.AudioContext || window.webkitAudioContext
    const ac = new AC()
    file.arrayBuffer().then(ab => ac.decodeAudioData(ab)).then(buf => {
      setSound(s => ({ ...s, [key]: buf }))
      toast?.((key === 'voBuffer' ? 'Narration' : 'Music') + ' loaded: ' + Math.round(buf.duration) + 's')
      ac.close()
    }).catch(() => toast?.('Could not read that audio file.'))
  }

  const listen = () => {
    const synth = window.speechSynthesis
    if (!synth) { toast?.('This browser has no preview voices.'); return }
    if (speaking) { synth.cancel(); setSpeaking(false); return }
    const u = new SpeechSynthesisUtterance(sound.script || '')
    if (voices[voiceIdx]) u.voice = voices[voiceIdx]
    u.rate = 0.96; u.pitch = 1
    u.onend = () => setSpeaking(false)
    setSpeaking(true)
    synth.speak(u)
  }

  return (
    <div style={{ borderTop: '1.5px solid ' + TOKENS.line, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: TOKENS.crimson }}>Sound: music + narrator</div>

      {/* Music */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={async () => {
          if (sound.musicBuffer && sound.musicMode === 'builtin') { setSound(s => ({ ...s, musicBuffer: null, musicMode: 'none' })); return }
          toast?.('Composing the Smartious pad...')
          const buf = await makeBuiltinMusic()
          setSound(s => ({ ...s, musicBuffer: buf, musicMode: 'builtin' }))
        }} style={{ ...btn(sound.musicMode === 'builtin'), fontSize: 11.5, padding: '7px 11px' }}>
          Soft Smartious music (built in)
        </button>
        <label style={{ ...btn(sound.musicMode === 'upload'), fontSize: 11.5, padding: '7px 11px', display: 'inline-block' }}>
          Upload music
          <input type="file" accept="audio/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) { decodeFile(f, 'musicBuffer'); setSound(s => ({ ...s, musicMode: 'upload' })) } }} />
        </label>
        {sound.musicBuffer && (
          <input type="range" min="0" max="1" step="0.05" value={sound.musicVol}
            onChange={e => setSound(s => ({ ...s, musicVol: +e.target.value }))}
            title="Music volume" style={{ width: 90 }} />
        )}
      </div>

      {/* Narration */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setSound(s => ({ ...s, script: buildNarration(cards) }))}
          style={{ ...btn(false), fontSize: 11.5, padding: '7px 11px' }}>
          Write narrator script from my cards
        </button>
        {voices.length > 0 && (
          <select value={voiceIdx} onChange={e => setVoiceIdx(+e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '7px 9px', fontSize: 11.5 }}>
            {voices.map((v, i) => <option key={i} value={i}>{v.name}</option>)}
          </select>
        )}
        <button onClick={listen} disabled={!sound.script} style={{ ...btn(false), fontSize: 11.5, padding: '7px 11px', opacity: sound.script ? 1 : 0.5 }}>
          {speaking ? 'Stop' : 'Listen (preview)'}
        </button>
      </div>
      {sound.script != null && (
        <textarea value={sound.script} onChange={e => setSound(s => ({ ...s, script: e.target.value }))} rows={5}
          style={{ ...inputStyle, resize: 'vertical', fontSize: 12, lineHeight: 1.6 }} />
      )}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ ...btn(!!sound.voBuffer), fontSize: 11.5, padding: '7px 11px', display: 'inline-block' }}>
          {sound.voBuffer ? 'Narration loaded — replace' : 'Upload narration recording'}
          <input type="file" accept="audio/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) decodeFile(f, 'voBuffer') }} />
        </label>
        {sound.voBuffer && (
          <button onClick={() => setSound(s => ({ ...s, voBuffer: null }))} style={{ ...btn(false), fontSize: 11.5, padding: '7px 11px', color: '#B91C1C' }}>Remove</button>
        )}
      </div>
      <div style={{ fontSize: 10.5, color: TOKENS.s500, lineHeight: 1.55 }}>
        Browsers cannot record their preview voices into the file — that is a platform limit, not a missing button. Two real routes: read the script yourself on your phone in a quiet room (parents trust the founder's voice most), or paste the script into a free AI voice site, download the MP3, and upload it here. Music ducks automatically under the narration.
      </div>
    </div>
  )
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
  const [crestReady, setCrestReady] = useState(!!_crestImg)
  useEffect(() => { Promise.all([ensureCrest(), loadBrandFonts()]).then(() => setCrestReady(true)) }, [])
  if (!crestReady) return null
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
  fitMode: 'cover', grade: 'cinema', popCorner: i % 4, textFx: 'rise',
  kicker: 'Study tip ' + (i + 1), headline: 'Your idea headline here',
  body: 'Explain the idea in one or two clear sentences. Keep it short — the card does the talking.',
  footer: 'smartioushomeschool.com', seriesNo: i + 1, seriesTotal: total,
})

const TRANSITIONS = [
  ['morph', 'Morph (zoom-fade)'],
  ['push', 'Push (slide)'],
  ['wipe', 'Gold wipe'],
]

const FORMATS = {
  story: { W: 2160, H: 3840, label: 'Story 4K 9:16' },
  square: { W: 2160, H: 2160, label: 'Square 4K 1:1' },
  youtube: { W: 3840, H: 2160, label: 'YouTube 4K 16:9' },
}

function CardMaker({ toast }) {
  const [format, setFormat] = useState('square')   // square | story | youtube
  const [cards, setCards] = useState([newCard(0, 1)])
  const [cur, setCur] = useState(0)
  const [medias, setMedias] = useState({})         // card index -> Image
  const cvRef = useRef(null)
  const rafRef = useRef(null)
  const [textFx, setTextFx] = useState('rise')     // rise | type
  const [transition, setTransition] = useState('morph')
  const [cardDur, setCardDur] = useState(4)
  const [playing, setPlaying] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sound, setSound] = useState({ musicMode: 'none', musicBuffer: null, musicVol: 0.6, voBuffer: null, voVol: 1, script: null })
  const [showNumbers, setShowNumbers] = useState(false)   // "2 / 5" chip: off unless asked for
  const [fontId, setFontId] = useState(0)                  // Montserrat default: bold
  const [brandMode, setBrandMode] = useState('word')       // word | crest | none
  const { W, H } = FORMATS[format] || FORMATS.square
  const card = cards[cur]
  const mediaEl = medias[cur]

  const upd = (patch) => setCards(cs => cs.map((c, i) => i === cur ? { ...c, ...patch } : c))
  // Everything project-wide (font, branding) merges into each card at
  // render time so PNG, preview and video all agree.
  const deck = (c, extra = {}) => ({ ...c, font: FONTS[fontId][0], brand: brandMode, ...extra })

  useEffect(() => {
    if (playing || rendering) return
    const cv = cvRef.current
    if (!cv) return
    cv.width = W; cv.height = H
    renderCard(cv.getContext('2d'), W, H, deck(card, { seriesTotal: showNumbers ? cards.length : 0 }), mediaEl, 1)
  }, [cards, cur, format, medias, playing, rendering, showNumbers, fontId, brandMode])

  const onImage = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    if (f.type.startsWith('video/')) {
      // Short clip as the card background: loops muted under the
      // brand tint; the motion export records it playing.
      const v = document.createElement('video')
      v.src = url; v.muted = true; v.loop = true; v.playsInline = true
      v.onloadeddata = () => {
        v.currentTime = 0.1   // land on a real frame for the still preview
        setMedias(m => ({ ...m, [cur]: v }))
        upd({ useImage: true })
      }
      v.onseeked = () => setMedias(m => ({ ...m }))   // repaint preview with the frame
    } else {
      const img = new Image()
      img.onload = () => { setMedias(m => ({ ...m, [cur]: img })); upd({ useImage: true }) }
      img.src = url
    }
  }

  const download = (idx) => {
    const off = document.createElement('canvas')
    off.width = W; off.height = H
    renderCard(off.getContext('2d'), W, H, deck(cards[idx], { seriesTotal: showNumbers ? cards.length : 0, seriesNo: idx + 1 }), medias[idx], 1)
    const a = document.createElement('a')
    a.download = 'smartious-card-' + (idx + 1) + '.png'
    a.href = off.toDataURL('image/png')
    a.click()
  }
  const downloadAll = () => { cards.forEach((_, i) => setTimeout(() => download(i), i * 350)); toast?.('Downloading ' + cards.length + ' card(s)...') }

  // ── Motion export: each card animates in, then hands over via the
  // chosen transition. Prev/next are composited from offscreen
  // canvases so morphs and wipes stay pixel-clean.
  const TRANS_DUR = 0.7
  const offA = useRef(null), offB = useRef(null)
  const getOff = (ref) => {
    if (!ref.current) ref.current = document.createElement('canvas')
    ref.current.width = W; ref.current.height = H
    return ref.current
  }

  const drawTimeline = (ctx, t) => {
    const n = cards.length
    const seg = cardDur
    const total = n * seg
    const i = Math.min(n - 1, Math.floor(t / seg))
    const local = t - i * seg
    const cardAt = (idx) => deck(cards[idx], { seriesTotal: showNumbers ? n : 0, seriesNo: idx + 1 })
    const inTransition = i < n - 1 && local > seg - TRANS_DUR
    if (!inTransition) {
      renderCardMotion(ctx, W, H, cardAt(i), medias[i], clamp01(local / (seg * 0.75)), textFx)
    } else {
      const q = easeOut((local - (seg - TRANS_DUR)) / TRANS_DUR)
      const A = getOff(offA), B = getOff(offB)
      renderCardMotion(A.getContext('2d'), W, H, cardAt(i), medias[i], 1, textFx)
      // The next card's intro starts DURING the handover so text is
      // already moving as it arrives.
      renderCardMotion(B.getContext('2d'), W, H, cardAt(i + 1), medias[i + 1], q * (TRANS_DUR / (seg * 0.75)), textFx)
      ctx.clearRect(0, 0, W, H)
      if (transition === 'push') {
        ctx.drawImage(A, -q * W, 0)
        ctx.drawImage(B, (1 - q) * W, 0)
      } else if (transition === 'wipe') {
        ctx.drawImage(A, 0, 0)
        const wx = q * (W + 60)
        ctx.save()
        ctx.beginPath(); ctx.rect(0, 0, wx, H); ctx.clip()
        ctx.drawImage(B, 0, 0)
        ctx.restore()
        ctx.fillStyle = GOLD
        ctx.fillRect(wx - 14, 0, 14, H)
      } else {
        // morph: incoming settles down from a slight zoom while the
        // outgoing enlarges and dissolves through it
        ctx.save()
        const sB = 1.08 - 0.08 * q
        ctx.translate(W / 2, H / 2); ctx.scale(sB, sB); ctx.translate(-W / 2, -H / 2)
        ctx.drawImage(B, 0, 0)
        ctx.restore()
        ctx.save()
        ctx.globalAlpha = 1 - q
        const sA = 1 + 0.1 * q
        ctx.translate(W / 2, H / 2); ctx.scale(sA, sA); ctx.translate(-W / 2, -H / 2)
        ctx.drawImage(A, 0, 0)
        ctx.restore()
      }
    }
    return t < total
  }

  const runCards = (record) => new Promise((resolve) => {
    const cv = cvRef.current
    cv.width = W; cv.height = H
    const ctx = cv.getContext('2d')
    const totalD = cards.length * cardDur
    const mixer = createMixer({ totalDur: totalD, musicBuffer: sound.musicBuffer, musicVol: sound.musicVol, voBuffer: sound.voBuffer, voVol: sound.voVol, record })
    let recorder = null, chunks = []
    if (record) {
      const stream = cv.captureStream(30)
      const combined = new MediaStream([...stream.getVideoTracks(), ...mixer.audioTracks])
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
      recorder = new MediaRecorder(combined, { mimeType: mime, videoBitsPerSecond: W * H >= 3840 * 2160 ? 30_000_000 : W * H >= 2160 * 2160 ? 20_000_000 : 8_000_000 })
      recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
      recorder.start(500)
    }
    mixer.start()
    // Start every video background rolling; stop them at the end.
    Object.values(medias).forEach(m => { if (m && m.play) { m.currentTime = 0; m.play().catch(() => {}) } })
    const total = cards.length * cardDur
    const t0 = performance.now()
    const step = (now) => {
      const t = (now - t0) / 1000
      setProgress(Math.min(1, t / total))
      if (drawTimeline(ctx, t)) { rafRef.current = requestAnimationFrame(step); return }
      Object.values(medias).forEach(m => { if (m && m.pause) m.pause() })
      mixer.stop()
      if (recorder) { recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' })); recorder.stop() }
      else resolve(null)
    }
    rafRef.current = requestAnimationFrame(step)
  })

  const previewMotion = async () => {
    if (playing || rendering) return
    setPlaying(true); await runCards(false); setPlaying(false); setProgress(0)
  }
  const exportMotion = async () => {
    if (playing || rendering) return
    setRendering(true)
    const totalD = cards.length * cardDur
    const t0 = performance.now()
    // Fast path: offline WebCodecs encode straight to MP4 — renders
    // as fast as the machine can draw, not at playback speed.
    try {
      const mediaAt = (t) => {
        const i = Math.min(cards.length - 1, Math.floor(t / cardDur))
        return [medias[i], medias[i + 1]].filter(Boolean)
      }
      const blob = await exportMp4Fast({
        canvas: cvRef.current, W, H, totalDur: totalD,
        drawFrame: (ctx, t) => drawTimeline(ctx, t),
        mediaAt, sound, onProgress: setProgress,
      })
      if (blob) {
        setRendering(false); setProgress(0)
        const a = document.createElement('a')
        a.download = 'smartious-cards.mp4'
        a.href = URL.createObjectURL(blob)
        a.click()
        const speed = totalD / ((performance.now() - t0) / 1000)
        toast?.('MP4 ready in ' + Math.round((performance.now() - t0) / 1000) + 's (' + speed.toFixed(1) + 'x speed) — posts straight to WhatsApp, Reels, TikTok and YouTube.')
        return
      }
    } catch (e) { console.error('[fast export]', e) }
    // Fallback: realtime WebM recording (older browsers).
    if (typeof MediaRecorder === 'undefined') { setRendering(false); toast?.('This browser cannot export video — use Chrome on a computer.'); return }
    toast?.('Fast export unavailable here — rendering in real time (' + Math.round(totalD) + 's)...')
    const blob = await runCards(true)
    setRendering(false); setProgress(0)
    if (blob) {
      const a = document.createElement('a')
      a.download = 'smartious-cards.webm'
      a.href = URL.createObjectURL(blob)
      a.click()
      toast?.('Video downloaded (WebM) — for WhatsApp, convert to MP4 first.')
    }
  }

  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
      {/* Controls */}
      <div style={{ flex: '1 1 320px', minWidth: 300, maxWidth: 430, display: 'flex', flexDirection: 'column', gap: 11 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.entries(FORMATS).map(([k, f]) => (
            <button key={k} onClick={() => setFormat(k)} style={{ ...btn(format === k), fontSize: 11.5, padding: '7px 11px' }}>{f.label}</button>
          ))}
        </div>

        {/* Typography + branding */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={fontId} onChange={e => setFontId(+e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '7px 9px', fontSize: 11.5 }}>
            {FONTS.map((f, i) => <option key={f[0]} value={i}>{f[1]} ({f[0]})</option>)}
          </select>
          {[['word', 'Bold wordmark'], ['crest', 'Crest'], ['none', 'No logo']].map(([k, l]) => (
            <button key={k} onClick={() => setBrandMode(k)} style={{ ...btn(brandMode === k), padding: '7px 10px', fontSize: 11.5 }}>{l}</button>
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
          {cards.length > 1 && (
            <button onClick={() => setShowNumbers(v => !v)} title="Show the small 2 / 5 chip on each card"
              style={{ ...btn(showNumbers), borderRadius: 99, padding: '7px 13px', fontSize: 11.5 }}>
              {showNumbers ? 'Numbered' : 'No numbers'}
            </button>
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
            Photo / video background
            <input type="file" accept="image/*,video/*" onChange={onImage} style={{ display: 'none' }} />
          </label>
          {card.useImage && (<>
            {[['crimson', 'Crimson tint'], ['ink', 'Dark tint'], ['gold', 'Gold tint']].map(([k, l]) => (
              <button key={k} onClick={() => upd({ tint: k })} style={{ ...btn(card.tint === k), padding: '7px 11px', fontSize: 11.5 }}>{l}</button>
            ))}
            {[['cover', 'Fill'], ['fit', 'Fit (no zoom blur)']].map(([k, l]) => (
              <button key={k} onClick={() => upd({ fitMode: k })} style={{ ...btn((card.fitMode || 'cover') === k), padding: '7px 11px', fontSize: 11.5 }}>{l}</button>
            ))}
            {GRADES.map(([k, l]) => (
              <button key={k} onClick={() => upd({ grade: k })} style={{ ...btn((card.grade || 'none') === k), padding: '7px 10px', fontSize: 11 }}>{l}</button>
            ))}
            <button onClick={() => { upd({ useImage: false }); setMedias(m => { const n = { ...m }; const old = n[cur]; if (old && old.pause) old.pause(); delete n[cur]; return n }) }} style={{ ...btn(false), fontSize: 11.5, padding: '7px 11px' }}>Remove</button>
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

        {/* ── Motion export ── */}
        <div style={{ borderTop: '1.5px solid ' + TOKENS.line, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: TOKENS.crimson }}>Export the series as a VIDEO</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TRANSITIONS.map(([k, l]) => (
              <button key={k} onClick={() => setTransition(k)} style={{ ...btn(transition === k), padding: '7px 11px', fontSize: 11.5 }}>{l}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['rise', 'Words rise in'], ['pop', 'Corner pop'], ['type', 'Typewriter']].map(([k, l]) => (
              <button key={k} onClick={() => setTextFx(k)} style={{ ...btn(textFx === k), padding: '7px 11px', fontSize: 11.5 }}>{l}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: TOKENS.s600 }}>Seconds per card</label>
            <input type="range" min="3" max="8" value={cardDur} onChange={e => setCardDur(+e.target.value)} style={{ flex: 1 }} />
            <span style={{ fontSize: 12, fontWeight: 800, width: 26 }}>{cardDur}s</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={previewMotion} disabled={playing || rendering} style={btn(false)}>{playing ? 'Playing...' : 'Preview motion'}</button>
            <button onClick={exportMotion} disabled={playing || rendering} style={btn(true)}>
              {rendering ? 'Rendering ' + Math.round(progress * 100) + '%' : 'Export video (' + Math.round(cards.length * cardDur) + 's)'}
            </button>
          </div>
          <SoundPanel sound={sound} setSound={setSound} cards={cards} toast={toast} />
        </div>
      </div>

      {/* Preview */}
      <div style={{ flex: '1 1 340px', minWidth: 280 }}>
        <canvas ref={cvRef} style={{ width: '100%', maxWidth: format === 'story' ? 320 : 480, borderRadius: 14, boxShadow: '0 10px 30px rgba(0,0,0,.15)', display: 'block' }} />
        {(playing || rendering) && (
          <div style={{ marginTop: 8, height: 5, background: 'rgba(0,0,0,.08)', borderRadius: 99, maxWidth: format === 'story' ? 320 : 480 }}>
            <div style={{ width: (progress * 100) + '%', height: '100%', background: GOLD, borderRadius: 99 }} />
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MOTION VIDEO MAKER
// ═══════════════════════════════════════════════════════════
const newScene = (type = 'text') => ({
  type, bg: type === 'title' ? 'crimson' : 'mesh', tint: 'crimson',
  useImage: false, duration: type === 'title' ? 3 : 5,
  fitMode: 'cover', grade: 'cinema', popCorner: Math.floor(Math.random() * 4), textFx: 'rise',
  kicker: type === 'bullets' ? 'Why Smartious' : 'Smartious Homeschool',
  headline: type === 'title' ? 'Homeschool Global' : type === 'outro' ? 'Enrol for 2026' : type === 'stat' ? '250+' : 'Your message here',
  body: type === 'bullets' ? 'Cambridge, IGCSE, IB and CBC\nLive classes with real teachers\nLearn from anywhere in the world' : type === 'outro' ? 'smartioushomeschool.com' : 'One clear supporting sentence goes here.',
  footer: 'smartioushomeschool.com',
})

function VideoMaker({ toast }) {
  const [format, setFormat] = useState('youtube')  // story | square | youtube
  const [scenes, setScenes] = useState([newScene('title'), newScene('text'), newScene('bullets'), newScene('outro')])
  const [cur, setCur] = useState(0)
  const [medias, setMedias] = useState({})         // sceneIndex -> Image|HTMLVideoElement
  const [playing, setPlaying] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sound, setSound] = useState({ musicMode: 'none', musicBuffer: null, musicVol: 0.6, voBuffer: null, voVol: 1, script: null })
  const [fontId, setFontId] = useState(0)
  const [brandMode, setBrandMode] = useState('word')
  const cvRef = useRef(null)
  const rafRef = useRef(null)
  const { W, H } = FORMATS[format] || FORMATS.youtube
  const scene = scenes[cur]
  const totalDur = scenes.reduce((s, x) => s + (+x.duration || 4), 0)

  const upd = (patch) => setScenes(ss => ss.map((s, i) => i === cur ? { ...s, ...patch } : s))
  const deck = (s) => ({ ...s, font: FONTS[fontId][0], brand: brandMode })

  // Static preview of the current scene at its final frame
  useEffect(() => {
    if (playing || rendering) return
    const cv = cvRef.current
    if (!cv) return
    cv.width = W; cv.height = H
    renderScene(cv.getContext('2d'), W, H, deck(scene), medias[cur], 1)
  }, [scenes, cur, format, medias, playing, rendering, fontId, brandMode])

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
    const mixer = createMixer({ totalDur, musicBuffer: sound.musicBuffer, musicVol: sound.musicVol, voBuffer: sound.voBuffer, voVol: sound.voVol, record })
    let recorder = null, chunks = []
    if (record) {
      const stream = cv.captureStream(30)
      const combined = new MediaStream([...stream.getVideoTracks(), ...mixer.audioTracks])
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
      recorder = new MediaRecorder(combined, { mimeType: mime, videoBitsPerSecond: W * H >= 3840 * 2160 ? 30_000_000 : W * H >= 2160 * 2160 ? 20_000_000 : 8_000_000 })
      recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
      recorder.start(500)
    }
    mixer.start()
    // start any video backgrounds
    Object.values(medias).forEach(m => { if (m && m.play) { m.currentTime = 0; m.play().catch(() => {}) } })

    const t0 = performance.now()
    const step = (now) => {
      const t = (now - t0) / 1000
      let acc = 0, drawn = false
      for (let i = 0; i < scenes.length; i++) {
        const d = +scenes[i].duration || 4
        if (t < acc + d) {
          renderScene(ctx, W, H, deck(scenes[i]), medias[i], (t - acc) / d)
          setProgress(t / totalDur)
          drawn = true
          break
        }
        acc += d
      }
      if (!drawn) {
        // finished
        Object.values(medias).forEach(m => { if (m && m.pause) m.pause() })
        mixer.stop()
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

  const drawSceneAt = (ctx, t) => {
    let acc = 0
    for (let i = 0; i < scenes.length; i++) {
      const d = +scenes[i].duration || 4
      if (t < acc + d || i === scenes.length - 1) {
        renderScene(ctx, W, H, deck(scenes[i]), medias[i], Math.min(1, (t - acc) / d))
        return
      }
      acc += d
    }
  }
  const sceneMediaAt = (t) => {
    let acc = 0
    for (let i = 0; i < scenes.length; i++) {
      const d = +scenes[i].duration || 4
      if (t < acc + d) return [medias[i]].filter(Boolean)
      acc += d
    }
    return []
  }

  const exportVideo = async () => {
    if (playing || rendering) return
    setRendering(true)
    const t0 = performance.now()
    try {
      const blob = await exportMp4Fast({
        canvas: cvRef.current, W, H, totalDur,
        drawFrame: drawSceneAt, mediaAt: sceneMediaAt, sound, onProgress: setProgress,
      })
      if (blob) {
        setRendering(false); setProgress(0)
        const a = document.createElement('a')
        a.download = 'smartious-video.mp4'
        a.href = URL.createObjectURL(blob)
        a.click()
        const secs = Math.round((performance.now() - t0) / 1000)
        toast?.('MP4 ready in ' + secs + 's (' + (totalDur / Math.max(1, secs)).toFixed(1) + 'x speed) — posts straight to WhatsApp, Reels, TikTok and YouTube.')
        return
      }
    } catch (e) { console.error('[fast export]', e) }
    if (typeof MediaRecorder === 'undefined') { setRendering(false); toast?.('This browser cannot export video — use Chrome on a computer.'); return }
    toast?.('Fast export unavailable here — rendering in real time (' + Math.round(totalDur) + 's)...')
    const blob = await runSequence(true)
    setRendering(false)
    setProgress(0)
    if (blob) {
      const a = document.createElement('a')
      a.download = 'smartious-video.webm'
      a.href = URL.createObjectURL(blob)
      a.click()
      toast?.('Video downloaded (WebM) — for WhatsApp, convert to MP4 first.')
    }
  }

  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 320px', minWidth: 300, maxWidth: 430, display: 'flex', flexDirection: 'column', gap: 11 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {Object.entries(FORMATS).map(([k, f]) => (
            <button key={k} onClick={() => setFormat(k)} style={{ ...btn(format === k), fontSize: 11.5, padding: '7px 11px' }}>{f.label}</button>
          ))}
          <span style={{ fontSize: 11.5, color: TOKENS.s500, fontWeight: 700, marginLeft: 'auto' }}>{Math.round(totalDur)}s total</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={fontId} onChange={e => setFontId(+e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '7px 9px', fontSize: 11.5 }}>
            {FONTS.map((f, i) => <option key={f[0]} value={i}>{f[1]} ({f[0]})</option>)}
          </select>
          {[['word', 'Bold wordmark'], ['crest', 'Crest'], ['none', 'No logo']].map(([k, l]) => (
            <button key={k} onClick={() => setBrandMode(k)} style={{ ...btn(brandMode === k), padding: '7px 10px', fontSize: 11.5 }}>{l}</button>
          ))}
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
            {scene.useImage && [['cover', 'Fill'], ['fit', 'Fit (no zoom blur)']].map(([k, l]) => (
              <button key={k} onClick={() => upd({ fitMode: k })} style={{ ...btn((scene.fitMode || 'cover') === k), padding: '7px 11px', fontSize: 11.5 }}>{l}</button>
            ))}
            {scene.useImage && GRADES.map(([k, l]) => (
              <button key={k} onClick={() => upd({ grade: k })} style={{ ...btn((scene.grade || 'none') === k), padding: '7px 10px', fontSize: 11 }}>{l}</button>
            ))}
            {(scene.type === 'text' || scene.type === 'stat') && [['rise', 'Rise'], ['pop', 'Pop'], ['type', 'Type']].map(([k, l]) => (
              <button key={k} onClick={() => upd({ textFx: k })} style={{ ...btn((scene.textFx || 'rise') === k), padding: '7px 10px', fontSize: 11 }}>{l}</button>
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
        <SoundPanel sound={sound} setSound={setSound}
          cards={scenes.map(s => ({ template: s.type === 'stat' ? 'stat' : 'idea', headline: s.headline, body: s.body }))}
          toast={toast} />
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
