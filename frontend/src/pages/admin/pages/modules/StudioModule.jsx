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
import { Muxer, ArrayBufferTarget } from 'mp4-muxer'

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

// Animated version of renderCard: p 0..1 across the card's screen
// time; all text has revealed by p ~ 0.55 and holds to the end.
function renderCardMotion(ctx, W, H, card, media, p, fx = 'rise') {
  // Static base: background, photo + tint, header, footer
  renderCardBase(ctx, W, H, card, media)
  const dark = isDark(card.bg)
  const onImg = card.useImage && media
  const fg = onImg || dark ? '#FFFFFF' : INK
  const subC = onImg || dark ? 'rgba(255,255,255,.86)' : 'rgba(8,12,20,.65)'
  const M = W * 0.085
  let y = H * (card.template === 'stat' ? 0.3 : 0.28)

  // Kicker
  if (card.kicker) {
    const kp = easeOut(p / 0.14)
    if (kp > 0) {
      ctx.globalAlpha = clamp01(kp)
      ctx.fillStyle = GOLD
      ctx.font = `800 ${W * 0.028}px Arial`
      ctx.fillText(String(card.kicker).toUpperCase(), M, y + (1 - clamp01(kp)) * 20)
      ctx.globalAlpha = 1
    }
    y += W * 0.055
  }
  const hp = clamp01((p - 0.08) / 0.4)   // headline window
  const bp = clamp01((p - 0.3) / 0.35)   // body window

  if (card.template === 'stat') {
    const statFg = onImg || dark ? '#FFFFFF' : CRIMSON
    // Number pops with a scale settle
    if (hp > 0) {
      const sc = 0.7 + 0.3 * easeOut(hp)
      ctx.save()
      ctx.globalAlpha = clamp01(hp * 1.6)
      ctx.translate(M, y + W * 0.17)
      ctx.scale(sc, sc)
      ctx.fillStyle = statFg
      ctx.font = `900 ${W * 0.19}px Georgia, serif`
      ctx.fillText(card.headline || '250+', 0, 0)
      ctx.restore()
    }
    y += W * 0.22
    if (bp > 0) {
      ctx.fillStyle = subC
      ctx.font = `600 ${W * 0.042}px Arial`
      const lines = wrapText(ctx, card.body, W - 2 * M)
      lines.forEach((ln, i) => drawWordsRise(ctx, ln, M, y + W * 0.02 + i * W * 0.058, clamp01(bp - i * 0.12) , 0.06))
    }
  } else if (card.template === 'quote') {
    ctx.globalAlpha = clamp01(hp * 2)
    ctx.fillStyle = GOLD
    ctx.font = `900 ${W * 0.16}px Georgia, serif`
    ctx.fillText('\u201C', M - W * 0.01, y + W * 0.1)
    ctx.globalAlpha = 1
    ctx.fillStyle = fg
    ctx.font = `italic 600 ${W * 0.052}px Georgia, serif`
    const lines = wrapText(ctx, card.headline, W - 2 * M)
    let qy = y + W * 0.15
    lines.forEach((ln, i) => {
      if (fx === 'type') {
        const share = 1 / lines.length
        drawTypewriter(ctx, ln, M, qy, (hp - i * share) / share)
      } else {
        drawWordsRise(ctx, ln, M, qy, clamp01(hp - i * 0.14), 0.1)
      }
      qy += W * 0.072
    })
    if (card.body && bp > 0) {
      ctx.globalAlpha = clamp01(bp)
      ctx.fillStyle = GOLD
      ctx.font = `700 ${W * 0.034}px Arial`
      ctx.fillText('\u2014 ' + card.body, M, qy + W * 0.05)
      ctx.globalAlpha = 1
    }
  } else {
    // Idea / announcement
    ctx.fillStyle = fg
    ctx.font = `800 ${W * 0.064}px Georgia, serif`
    const lines = wrapText(ctx, card.headline, W - 2 * M)
    let hy = y + W * 0.06
    lines.forEach((ln, i) => {
      if (fx === 'type') {
        const share = 1 / lines.length
        drawTypewriter(ctx, ln, M, hy, (hp - i * share) / share)
      } else {
        drawWordsRise(ctx, ln, M, hy, clamp01(hp - i * 0.14), 0.1)
      }
      hy += W * 0.082
    })
    // Gold underline draws after the headline
    const up = clamp01((p - 0.32) / 0.15)
    ctx.fillStyle = GOLD
    ctx.fillRect(M, hy - W * 0.028, W * 0.14 * easeOut(up), W * 0.009)
    if (card.body && bp > 0) {
      ctx.fillStyle = subC
      ctx.font = `500 ${W * 0.038}px Arial`
      const bl = wrapText(ctx, card.body, W - 2 * M)
      bl.forEach((ln, i) => drawWordsRise(ctx, ln, M, hy + W * 0.035 + i * W * 0.056, clamp01(bp - i * 0.12), 0.05))
    }
  }
}

// The non-text parts of a card, shared by static and motion renders.
function renderCardBase(ctx, W, H, card, media) {
  bgById(card.bg).paint(ctx, W, H)
  const dark = isDark(card.bg)
  const M = W * 0.085
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
  const crest = W * 0.075
  drawCrest(ctx, M, M * 0.8, crest)
  ctx.fillStyle = card.useImage || dark ? '#FFFFFF' : INK
  ctx.font = `700 ${W * 0.036}px Georgia, serif`
  ctx.fillText('Smart', M + crest + W * 0.018, M * 0.8 + crest * 0.62)
  const smW = ctx.measureText('Smart').width
  ctx.fillStyle = GOLD
  ctx.font = `italic 500 ${W * 0.036}px Georgia, serif`
  ctx.fillText('ious', M + crest + W * 0.018 + smW * 1.18, M * 0.8 + crest * 0.62)
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
  ctx.fillStyle = card.useImage || dark ? 'rgba(255,255,255,.55)' : 'rgba(8,12,20,.5)'
  ctx.font = `700 ${W * 0.026}px Arial`
  ctx.fillText((card.footer || 'smartioushomeschool.com').toUpperCase(), M, H - M * 0.7)
  ctx.fillStyle = GOLD
  ctx.fillRect(M, H - M * 0.7 + W * 0.014, W * 0.055, W * 0.006)
}

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
  const vConfig = { codec: 'avc1.640028', width: W, height: H, bitrate: 7_000_000, framerate: FPS }
  const support = await VideoEncoder.isConfigSupported(vConfig).catch(() => null)
  if (!support?.supported) return null
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

const TRANSITIONS = [
  ['morph', 'Morph (zoom-fade)'],
  ['push', 'Push (slide)'],
  ['wipe', 'Gold wipe'],
]

function CardMaker({ toast }) {
  const [format, setFormat] = useState('square')   // square | story
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
  const W = 1080, H = format === 'story' ? 1920 : 1080
  const card = cards[cur]
  const mediaEl = medias[cur]

  const upd = (patch) => setCards(cs => cs.map((c, i) => i === cur ? { ...c, ...patch } : c))

  useEffect(() => {
    if (playing || rendering) return
    const cv = cvRef.current
    if (!cv) return
    cv.width = W; cv.height = H
    renderCard(cv.getContext('2d'), W, H, card, mediaEl, 1)
  }, [cards, cur, format, medias, playing, rendering])

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
    renderCard(off.getContext('2d'), W, H, { ...cards[idx], seriesTotal: cards.length, seriesNo: idx + 1 }, medias[idx], 1)
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
    const cardAt = (idx) => ({ ...cards[idx], seriesTotal: n, seriesNo: idx + 1 })
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
      recorder = new MediaRecorder(combined, { mimeType: mime, videoBitsPerSecond: 6_000_000 })
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
            Photo / video background
            <input type="file" accept="image/*,video/*" onChange={onImage} style={{ display: 'none' }} />
          </label>
          {card.useImage && (<>
            {[['crimson', 'Crimson tint'], ['ink', 'Dark tint'], ['gold', 'Gold tint']].map(([k, l]) => (
              <button key={k} onClick={() => upd({ tint: k })} style={{ ...btn(card.tint === k), padding: '7px 11px', fontSize: 11.5 }}>{l}</button>
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
            {[['rise', 'Words rise in'], ['type', 'Typewriter']].map(([k, l]) => (
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
  const [sound, setSound] = useState({ musicMode: 'none', musicBuffer: null, musicVol: 0.6, voBuffer: null, voVol: 1, script: null })
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
    const mixer = createMixer({ totalDur, musicBuffer: sound.musicBuffer, musicVol: sound.musicVol, voBuffer: sound.voBuffer, voVol: sound.voVol, record })
    let recorder = null, chunks = []
    if (record) {
      const stream = cv.captureStream(30)
      const combined = new MediaStream([...stream.getVideoTracks(), ...mixer.audioTracks])
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
      recorder = new MediaRecorder(combined, { mimeType: mime, videoBitsPerSecond: 6_000_000 })
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
        renderScene(ctx, W, H, scenes[i], medias[i], Math.min(1, (t - acc) / d))
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
