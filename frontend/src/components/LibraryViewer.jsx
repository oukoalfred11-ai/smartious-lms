/**
 * LibraryViewer.jsx
 * Opens the PDF using the self-hosted PDF.js viewer at /pdfjs/index.html.
 * The viewer is served from Netlify (same origin) — no CORS, no iframe
 * blocking. Loads pdfjs from /pdfjs/pdf.min.mjs and the worker from
 * /pdfjs/pdf.worker.min.mjs — both static files in frontend/public/pdfjs/.
 *
 * Props:
 *   book    { _id, title, url, subjectName, curriculum, author, sizeBytes }
 *   onClose function
 */

import React, { useState, useEffect, useRef } from 'react'

function fmtBytes(n) {
  if (!n) return ''
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB'
  return (n / (1024 * 1024)).toFixed(1) + ' MB'
}

const CRIMSON = '#7D1025'
const GOLD    = '#C9A030'

export default function LibraryViewer({ book, onClose }) {
  const [loading,    setLoading]    = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const containerRef = useRef(null)

  // Build viewer URL — the pdfjs viewer is hosted at /pdfjs/index.html
  // on Netlify (same origin). We pass the R2 URL and metadata as query params.
  const meta = [book.subjectName, book.curriculum, book.author, fmtBytes(book.sizeBytes)]
    .filter(Boolean).join(' · ')

  const viewerUrl = `/pdfjs/index.html?file=${encodeURIComponent(book.url)}&title=${encodeURIComponent(book.title)}&meta=${encodeURIComponent(meta)}`

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

  return (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', flexDirection: 'column',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Close / fullscreen buttons — float over the iframe */}
      <div style={{
        position: 'absolute', top: 10, right: 16, zIndex: 1,
        display: 'flex', gap: 8,
      }}>
        <button onClick={toggleFullscreen} style={{
          border: 'none', borderRadius: 6, padding: '7px 14px',
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          background: 'rgba(0,0,0,.45)', color: '#fff',
        }}>
          {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        </button>
        <button onClick={onClose} style={{
          border: 'none', borderRadius: 6, padding: '7px 14px',
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          background: GOLD, color: CRIMSON,
        }}>
          Close
        </button>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: '#525659', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <div style={{
            width: 44, height: 44, border: '4px solid rgba(255,255,255,.15)',
            borderTopColor: GOLD, borderRadius: '50%',
            animation: 'lvSpin .75s linear infinite',
          }}/>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
            Opening {fmtBytes(book.sizeBytes) || ''} book...
          </div>
          <style>{`@keyframes lvSpin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* PDF.js viewer iframe — same origin, no blocking */}
      <iframe
        src={viewerUrl}
        title={book.title}
        onLoad={() => setLoading(false)}
        style={{ flex: 1, border: 'none', display: 'block', width: '100%', height: '100%' }}
        allow="fullscreen"
      />
    </div>
  )
}
