/**
 * LibraryViewer.jsx
 * Opens the self-hosted PDF.js viewer at /pdfjs/index.html.
 * Passes book ID + JWT token — the viewer fetches the PDF
 * through the backend /stream endpoint (no R2 CORS issues).
 */
import React, { useState, useEffect, useRef } from 'react'

const CRIMSON = '#7D1025'
const GOLD    = '#C9A030'

function fmtBytes(n) {
  if (!n) return ''
  if (n < 1024*1024) return (n/1024).toFixed(0) + ' KB'
  return (n/(1024*1024)).toFixed(1) + ' MB'
}

export default function LibraryViewer({ book, onClose }) {
  const [loading, setLoading]     = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const containerRef = useRef(null)

  // Get JWT from localStorage
  const token   = localStorage.getItem('sm_token') || localStorage.getItem('token') || ''
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api'
  const meta    = [book.subjectName, book.curriculum, book.author, fmtBytes(book.sizeBytes)]
    .filter(Boolean).join(' · ')

  // Build viewer URL — pass id + api + token as query params
  const viewerUrl = `/pdfjs/index.html?id=${encodeURIComponent(book._id)}&api=${encodeURIComponent(apiBase)}&token=${encodeURIComponent(token)}&title=${encodeURIComponent(book.title)}&meta=${encodeURIComponent(meta)}`

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen?.(); setFullscreen(true)
      } else {
        await document.exitFullscreen?.(); setFullscreen(false)
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
    }}>
      {/* Floating close button over the iframe */}
      <div style={{ position: 'absolute', top: 10, right: 16, zIndex: 1, display: 'flex', gap: 8 }}>
        <button onClick={toggleFullscreen} style={{
          border: 'none', borderRadius: 6, padding: '7px 14px',
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          background: 'rgba(0,0,0,.5)', color: '#fff',
        }}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button>
        <button onClick={onClose} style={{
          border: 'none', borderRadius: 6, padding: '7px 14px',
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          background: GOLD, color: CRIMSON,
        }}>Close</button>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, background: '#525659',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <div style={{ width: 44, height: 44, border: '4px solid rgba(255,255,255,.15)', borderTopColor: GOLD, borderRadius: '50%', animation: 'lvSpin .75s linear infinite' }}/>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Opening {fmtBytes(book.sizeBytes) || ''} book...</div>
          <style>{`@keyframes lvSpin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

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
