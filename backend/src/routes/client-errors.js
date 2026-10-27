/**
 * routes/client-errors.js — POST /api/client-errors
 *
 * Browsers report a page that failed to start or crashed (a blank
 * portal), so the cause shows in the server log instead of being
 * invisible: the error, the page, the browser (user agent) and, when
 * known, which signed-in user. Sent with navigator.sendBeacon as
 * text/plain (no CORS preflight, works while the page is failing). No
 * sign-in needed; rate-limited and size-capped; nothing is stored.
 */
const router = require('express').Router()
const express = require('express')
const rateLimit = require('express-rate-limit')

const cut = (v, n) => String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').slice(0, n)

router.post('/',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false }),
  express.text({ type: '*/*', limit: '16kb' }),
  (req, res) => {
    let b = req.body
    if (typeof b === 'string') { try { b = JSON.parse(b) } catch { b = { message: b } } }
    b = b || {}
    console.error(`[client error] ${cut(b.kind, 30) || 'error'} · ${cut(b.message, 400)}` +
      ` · page ${cut(b.path, 120)} · user ${cut(b.user, 80) || 'signed out'} · ${cut(b.ua, 220)}` +
      (b.stack ? ` · at ${cut(b.stack, 400)}` : ''))
    res.status(204).end()
  })

module.exports = router
