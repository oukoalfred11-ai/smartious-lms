/**
 * LibraryViewer.jsx
 * ============================================================
 * Full-screen PDF viewer using react-pdf (pdfjs-dist).
 * Renders the PDF directly in the browser — no iframe, no
 * cross-origin issues. Works with R2 public URLs.
 *
 * Props:
 *   book    { _id, title, subjectName, curriculum, author, sizeBytes, url }
 *   onClose function
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Point pdfjs worker at the CDN version matching the installed package
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const T = {
  crimson: '#7D1025',
  gold:    '#C9A030',
  cream:   '#FBFAF5',
  s500:    '#6B6B6B',
}

function fmtBytes(n) {
  if (!n || n < 1024) return n + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
  return (n / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function LibraryViewer({ book, onClose }) {
  const [numPages, setNumPages]   = useState(null)
  const [pageNum, setPageNum]     = useState(1)
  const [scale, setScale]         = useState(1.2)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [fullscreen, setFullscreen] = useState(false)
  const containerRef = useRef(null)
  const scrollRef    = useRef(null)

  // Prevent body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Block Ctrl+S / Ctrl+P
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && ['s','S','p','P'].includes(e.key)) {
      e.preventDefault(); e.stopPropagation()
    }
  }, [])
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [handleKeyDown])

  const onDocLoaded = ({ numPages }) => {
    setNumPages(numPages)
    setLoading(false)
  }

  const onDocError = (err) => {
    console.error('[LibraryViewer] PDF load error:', err)
    setError('Could not load this PDF. ' + (err?.message || ''))
    setLoading(false)
  }

  const goTo = (n) => {
    const p = Math.max(1, Math.min(n, numPages || 1))
    setPageNum(p)
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

  // Keyboard navigation
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(pageNum + 1)
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(pageNum - 1)
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [pageNum, numPages])

  return (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#1a1a1a',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: T.crimson, color: '#fff',
        flexShrink: 0, gap: 12,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 14,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 500,
          }}>{book.title}</div>
          <div style={{ fontSize: 11, opacity: .8, marginTop: 1 }}>
            {[book.subjectName, book.curriculum, book.author, book.sizeBytes ? fmtBytes(book.sizeBytes) : '']
              .filter(Boolean).join(' · ')}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Zoom */}
          <button onClick={() => setScale(s => Math.max(0.6, +(s - 0.2).toFixed(1)))}
            title="Zoom out"
            style={{ ...btnStyle, background: 'rgba(255,255,255,.15)', minWidth: 32 }}>−</button>
          <span style={{ fontSize: 12, color: '#fff', minWidth: 38, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={() => setScale(s => Math.min(3, +(s + 0.2).toFixed(1)))}
            title="Zoom in"
            style={{ ...btnStyle, background: 'rgba(255,255,255,.15)', minWidth: 32 }}>+</button>

          {/* Page nav */}
          {numPages && (
            <>
              <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.2)', margin: '0 4px' }}/>
              <button onClick={() => goTo(pageNum - 1)} disabled={pageNum <= 1}
                style={{ ...btnStyle, background: 'rgba(255,255,255,.15)', opacity: pageNum <= 1 ? .4 : 1 }}>‹</button>
              <span style={{ fontSize: 12, color: '#fff', minWidth: 70, textAlign: 'center' }}>
                {pageNum} / {numPages}
              </span>
              <button onClick={() => goTo(pageNum + 1)} disabled={pageNum >= numPages}
                style={{ ...btnStyle, background: 'rgba(255,255,255,.15)', opacity: pageNum >= numPages ? .4 : 1 }}>›</button>
            </>
          )}

          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.2)', margin: '0 4px' }}/>
          <button onClick={toggleFullscreen}
            style={{ ...btnStyle, background: 'rgba(255,255,255,.15)' }}>
            {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          </button>
          <button onClick={onClose}
            style={{ ...btnStyle, background: T.gold, color: T.crimson, fontWeight: 800 }}>
            Close
          </button>
        </div>
      </div>

      {/* PDF canvas area */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', overflowX: 'auto',
        display: 'flex', justifyContent: 'center',
        padding: '24px 16px',
        background: '#525659',
      }}>
        {loading && !error && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            color: '#fff', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, border: '3px solid rgba(255,255,255,.2)',
              borderTopColor: T.gold, borderRadius: '50%',
              animation: 'lvspin 0.8s linear infinite',
            }}/>
            <div style={{ fontSize: 13 }}>Loading PDF...</div>
            <style>{`@keyframes lvspin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {error && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            color: '#fff', textAlign: 'center', padding: 30,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Could not load this book</div>
            <div style={{ fontSize: 12, opacity: .75, marginBottom: 16 }}>{error}</div>
            <a href={book.url} target="_blank" rel="noopener noreferrer" style={{
              background: T.gold, color: T.crimson, padding: '9px 20px',
              borderRadius: 7, fontWeight: 700, fontSize: 12.5, textDecoration: 'none',
              display: 'inline-block',
            }}>Open in new tab</a>
          </div>
        )}

        <Document
          file={book.url}
          onLoadSuccess={onDocLoaded}
          onLoadError={onDocError}
          loading=""
          options={{
            cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
            cMapPacked: true,
          }}
        >
          <Page
            pageNumber={pageNum}
            scale={scale}
            loading=""
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>

      {/* Bottom page nav bar */}
      {numPages && numPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          padding: '10px 16px', background: 'rgba(0,0,0,.7)', flexShrink: 0,
        }}>
          <button onClick={() => goTo(1)} disabled={pageNum <= 1}
            style={{ ...btnStyle, background: 'rgba(255,255,255,.12)', color: '#fff', opacity: pageNum <= 1 ? .4 : 1 }}>
            «
          </button>
          <button onClick={() => goTo(pageNum - 1)} disabled={pageNum <= 1}
            style={{ ...btnStyle, background: 'rgba(255,255,255,.12)', color: '#fff', opacity: pageNum <= 1 ? .4 : 1 }}>
            ‹ Prev
          </button>
          <span style={{ color: '#fff', fontSize: 13 }}>Page {pageNum} of {numPages}</span>
          <button onClick={() => goTo(pageNum + 1)} disabled={pageNum >= numPages}
            style={{ ...btnStyle, background: 'rgba(255,255,255,.12)', color: '#fff', opacity: pageNum >= numPages ? .4 : 1 }}>
            Next ›
          </button>
          <button onClick={() => goTo(numPages)} disabled={pageNum >= numPages}
            style={{ ...btnStyle, background: 'rgba(255,255,255,.12)', color: '#fff', opacity: pageNum >= numPages ? .4 : 1 }}>
            »
          </button>
        </div>
      )}

      {/* Watermark */}
      <div style={{
        position: 'absolute', bottom: numPages && numPages > 1 ? 52 : 8,
        left: 0, right: 0, textAlign: 'center',
        color: 'rgba(255,255,255,.35)', fontSize: 10,
        letterSpacing: '.06em', pointerEvents: 'none',
      }}>
        For personal reading only — Smartious Homeschool
      </div>
    </div>
  )
}

const btnStyle = {
  border: 'none', padding: '6px 12px', borderRadius: 6,
  fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#fff',
}
