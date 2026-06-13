/**
 * LibraryViewer.jsx
 * ============================================================
 * Full-screen PDF viewer using the browser's native PDF engine.
 * The PDF is proxied through the backend so it's served from
 * the same origin — no CORS, no worker, no pdfjs version issues.
 * Works with any file size. No dependencies beyond React.
 *
 * Props:
 *   book    { _id, title, url, subjectName, curriculum, author, sizeBytes }
 *   onClose function
 *   api     axios instance (from ctx.jsx)
 */

import React, { useState, useEffect, useRef } from 'react'

const CRIMSON = '#7D1025'
const GOLD    = '#C9A030'

function fmtBytes(n) {
  if (!n) return ''
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB'
  return (n / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function LibraryViewer({ book, onClose }) {
  const [loading,    setLoading]    = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const containerRef = useRef(null)
  const iframeRef    = useRef(null)

  // Build proxy URL — backend streams the PDF from R2 with
  // correct Content-Type and no CORS issues, same origin as app.
  const token    = typeof window !== 'undefined' ? (localStorage.getItem('sm_token') || localStorage.getItem('token') || '') : ''
  const base     = window.__API_BASE__ || (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  const proxyUrl = `${base}/library/${book._id}/stream?token=${encodeURIComponent(token)}`

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Escape to close
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  // Fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen?.()
        setFullscreen(true)
      } else {
        await document.exitFullscreen?.()
        setFullscreen(false)
      }
    } catch {}
  }
  useEffect(() => {
    const fn = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', fn)
    return () => document.removeEventListener('fullscreenchange', fn)
  }, [])

  const btnStyle = {
    border: 'none', borderRadius: 6, padding: '7px 14px',
    fontSize: 12, fontWeight: 700, cursor: 'pointer',
    background: 'rgba(255,255,255,.15)', color: '#fff',
  }

  return (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#1C1C1C', display: 'flex', flexDirection: 'column',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        padding: '10px 16px',
        background: `linear-gradient(135deg, ${CRIMSON} 0%, #5A0B1B 100%)`,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {book.title}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', marginTop: 1 }}>
            {[book.subjectName, book.curriculum, book.author, fmtBytes(book.sizeBytes)].filter(Boolean).join(' · ')}
          </div>
        </div>
        <button onClick={toggleFullscreen} style={btnStyle}>
          {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        </button>
        <button onClick={onClose} style={{ ...btnStyle, background: GOLD, color: CRIMSON, fontWeight: 800 }}>
          Close
        </button>
      </div>

      {/* PDF iframe */}
      <div style={{ flex: 1, position: 'relative', background: '#525659' }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
            background: '#525659', zIndex: 2,
          }}>
            <div style={{
              width: 44, height: 44,
              border: '4px solid rgba(255,255,255,.15)',
              borderTopColor: GOLD, borderRadius: '50%',
              animation: 'lvSpin .75s linear infinite',
            }}/>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
              Opening {fmtBytes(book.sizeBytes)} book...
            </div>
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 12 }}>
              Large files may take 10–20 seconds
            </div>
            <style>{`@keyframes lvSpin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={proxyUrl}
          title={book.title}
          onLoad={() => setLoading(false)}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          allow="fullscreen"
        />
      </div>

      {/* Watermark */}
      <div style={{
        position: 'absolute', bottom: 8, left: 0, right: 0,
        textAlign: 'center', color: 'rgba(255,255,255,.2)',
        fontSize: 10, letterSpacing: '.08em', pointerEvents: 'none',
      }}>
        For personal reading only — Smartious Homeschool
      </div>
    </div>
  )
}
