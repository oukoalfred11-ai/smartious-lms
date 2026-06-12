/**
 * LibraryViewer.jsx
 * Full-screen PDF viewer. Loads the PDF directly from the R2
 * public URL stored in book.url — no backend round-trip needed.
 *
 * Props:
 *   book    { _id, title, subjectName, curriculum, author, sizeBytes, url }
 *   onClose function
 */

import React, { useEffect, useState, useRef, useCallback } from 'react'

const T = {
  crimson: '#7D1025',
  gold:    '#C9A030',
  cream:   '#FBFAF5',
  s500:    '#6B6B6B',
}

function fmtBytes(n) {
  if (!n || n < 1024) return (n || 0) + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
  return (n / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function LibraryViewer({ book, onClose }) {
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [fullscreen, setFullscreen] = useState(false)
  const containerRef = useRef(null)

  // book.url is the direct R2 public URL — use it straight in the iframe.
  // Append hash params to suppress the browser's PDF toolbar.
  const viewUrl = book?.url
    ? book.url + '#toolbar=0&navpanes=0&scrollbar=1&statusbar=0&zoom=page-fit'
    : null

  useEffect(() => {
    if (!viewUrl) setError('No URL available for this book.')
  }, [viewUrl])

  // Block common save/print shortcuts
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && ['s','S','p','P'].includes(e.key)) {
      e.preventDefault(); e.stopPropagation()
    }
  }, [])
  const handleContextMenu = useCallback((e) => { e.preventDefault() }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('contextmenu', handleContextMenu, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('contextmenu', handleContextMenu, true)
    }
  }, [handleKeyDown, handleContextMenu])

  // Prevent page scroll behind modal
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

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
    const onChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  return (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(20,15,10,0.96)',
      zIndex: 99999,
      display: 'flex', flexDirection: 'column',
    }} onContextMenu={handleContextMenu}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 18px', background: T.crimson, color: '#fff', flexShrink: 0,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 14,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 600,
          }}>{book.title}</div>
          <div style={{ fontSize: 11, opacity: .85, marginTop: 2 }}>
            {[book.subjectName, book.curriculum, book.author, book.sizeBytes ? fmtBytes(book.sizeBytes) : '']
              .filter(Boolean).join(' · ')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={toggleFullscreen} style={{
            background: 'rgba(255,255,255,.15)', color: '#fff',
            border: '1px solid rgba(255,255,255,.25)',
            padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
            {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          </button>
          <button onClick={onClose} style={{
            background: T.gold, color: T.crimson,
            border: 'none', padding: '7px 16px', borderRadius: 6,
            fontSize: 12, fontWeight: 800, cursor: 'pointer',
          }}>
            Close
          </button>
        </div>
      </div>

      {/* PDF area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#525659' }}>
        {loading && !error && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: T.cream, gap: 14,
          }}>
            <div style={{
              width: 36, height: 36, border: '3px solid rgba(255,255,255,.2)',
              borderTopColor: T.gold, borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}/>
            <div style={{ fontSize: 13 }}>Loading book...</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {error && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: T.cream, gap: 10, padding: 30, textAlign: 'center',
          }}>
            <div style={{ fontSize: 32 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Could not load this book</div>
            <div style={{ fontSize: 12.5, opacity: .75 }}>{error}</div>
            <a href={book.url} target="_blank" rel="noopener noreferrer" style={{
              marginTop: 8, background: T.gold, color: T.crimson,
              padding: '9px 20px', borderRadius: 7, fontWeight: 700,
              fontSize: 12.5, textDecoration: 'none',
            }}>Open in new tab</a>
          </div>
        )}

        {viewUrl && !error && (
          <iframe
            src={viewUrl}
            title={book.title}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError('Browser could not render the PDF.') }}
            onContextMenu={handleContextMenu}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        )}

        {/* Watermark */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '4px 14px', background: 'rgba(0,0,0,.55)',
          color: '#fff', fontSize: 10, textAlign: 'center',
          letterSpacing: '.04em', pointerEvents: 'none',
        }}>
          For personal reading only — Smartious Homeschool
        </div>
      </div>
    </div>
  )
}
