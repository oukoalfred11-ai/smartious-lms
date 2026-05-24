/**
 * LibraryViewer.jsx
 * ============================================================
 * Full-screen PDF viewer for library books. Used by both
 * Teacher Portal (preview an upload) and Student Portal
 * (read a coursebook).
 *
 * Props:
 *   book   { _id, title, subjectName, curriculum, author, sizeBytes }
 *          — book metadata for the header
 *   api    — axios instance for fetching the signed view URL
 *   onClose function — invoked when the user closes the viewer
 *
 * Design choices:
 *   - Renders the PDF in a <iframe> with #toolbar=0&navpanes=0&scrollbar=1
 *     URL hash params. These are honoured by Chromium-based browsers
 *     to hide the built-in PDF toolbar (download button, print button,
 *     etc.). Firefox honours them partially.
 *   - The wrapper div intercepts contextmenu (right-click), Ctrl+S,
 *     Ctrl+P, Ctrl+Shift+S, and the F12 inspector key — all common
 *     ways a casual user might try to save the file.
 *   - The signed view URL is fetched fresh each open and is valid
 *     for 1 hour. If the user keeps the viewer open longer, the
 *     URL may go stale; closing+reopening fetches a new one.
 *
 * Honest limitations:
 *   - This is DETERRENCE, not prevention. Any user with browser
 *     dev tools can open the Network tab, find the PDF request,
 *     and save the bytes. Truly preventing PDF capture is not
 *     possible in a web browser.
 *   - In Chrome the toolbar=0 hash hides the toolbar but the
 *     three-dot menu in the URL bar still exposes "Save as".
 *   - Firefox's built-in PDF viewer ignores these hash params
 *     and shows its own download UI.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react'

const TOKENS = {
  crimson: '#7D1025',
  gold:    '#C9A030',
  cream:   '#FBFAF5',
  ink:     '#1A1A1A',
  s500:    '#6B6B6B',
  s300:    '#9A9A9A',
  s100:    '#E8E2D6',
}

function fmtBytes(n) {
  if (!n || n < 1024) return (n || 0) + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
  return (n / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function LibraryViewer({ book, api, onClose }) {
  const [viewUrl, setViewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const containerRef = useRef(null)
  const iframeRef = useRef(null)

  // Fetch a signed view URL each time the viewer opens
  useEffect(() => {
    if (!book?._id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setViewUrl(null)
    ;(async () => {
      try {
        const { data } = await api.get(`/library/${book._id}/view-url`)
        if (cancelled) return
        const url = data?.data?.url
        if (!url) {
          setError('No view URL returned by server.')
          return
        }
        // Append PDF viewer hash params to hide native toolbar
        const hash = '#toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0&zoom=page-fit'
        setViewUrl(url + hash)
      } catch (e) {
        if (cancelled) return
        setError(e?.response?.data?.message || e.message || 'Failed to load book.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [book?._id, api])

  // Intercept common save/print shortcuts and right-click on the wrapper
  const handleKeyDown = useCallback((e) => {
    const ctrl = e.ctrlKey || e.metaKey
    // Ctrl+S, Ctrl+P, Ctrl+Shift+S
    if (ctrl && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }, [])

  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    return false
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('contextmenu', handleContextMenu, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('contextmenu', handleContextMenu, true)
    }
  }, [handleKeyDown, handleContextMenu])

  // Fullscreen API (browser-level)
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen?.()
        setFullscreen(true)
      } else {
        await document.exitFullscreen?.()
        setFullscreen(false)
      }
    } catch (e) {
      // Some browsers/iframes restrict fullscreen
    }
  }

  // Detect when user exits fullscreen via Esc
  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // Prevent page scroll behind modal
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(20,15,10,0.94)',
        zIndex: 99999,
        display: 'flex', flexDirection: 'column',
      }}
      onContextMenu={handleContextMenu}
    >
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 18px',
        background: TOKENS.crimson, color: '#fff',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontWeight: 700, fontSize: 14,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              maxWidth: 600,
            }}>{book.title}</div>
            <div style={{ fontSize: 11, opacity: .85, marginTop: 2 }}>
              {book.subjectName}
              {book.curriculum ? ' · ' + book.curriculum : ''}
              {book.author ? ' · ' + book.author : ''}
              {book.sizeBytes ? ' · ' + fmtBytes(book.sizeBytes) : ''}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={toggleFullscreen}
            style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '7px 14px', borderRadius: 6,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
            {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          </button>
          <button onClick={onClose}
            style={{
              background: TOKENS.gold, color: TOKENS.crimson,
              border: 'none', padding: '7px 16px', borderRadius: 6,
              fontSize: 12, fontWeight: 800, cursor: 'pointer',
            }}>
            Close
          </button>
        </div>
      </div>

      {/* Viewer area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: TOKENS.cream, fontSize: 14,
          }}>
            Loading book...
          </div>
        )}
        {error && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: TOKENS.cream, gap: 8, padding: 30, textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Could not load this book.</div>
            <div style={{ fontSize: 12.5, opacity: .8 }}>{error}</div>
          </div>
        )}
        {viewUrl && !error && (
          <iframe
            ref={iframeRef}
            src={viewUrl}
            title={book.title}
            onContextMenu={handleContextMenu}
            style={{
              width: '100%', height: '100%',
              border: 'none', background: '#525659',
              display: 'block',
            }}
          />
        )}

        {/* Tiny watermark / footer reminder — psychological deterrence */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '5px 14px',
          background: 'rgba(0,0,0,0.6)', color: '#fff',
          fontSize: 10, textAlign: 'center', letterSpacing: '.04em',
          pointerEvents: 'none',
        }}>
          For personal reading only — please do not download or share.
        </div>
      </div>
    </div>
  )
}
