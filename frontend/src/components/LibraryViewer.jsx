/**
 * LibraryViewer.jsx
 * ============================================================
 * Full-screen PDF viewer. Uses react-pdf loaded dynamically
 * inside a useEffect — NOT as a top-level import — so pdfjs
 * never touches the worker until a user actually opens a book.
 * This is the only pattern that avoids the sendWithPromise /
 * sendWithStream crash on app boot.
 *
 * Props:
 *   book    { _id, title, url, subjectName, curriculum, author, sizeBytes }
 *   onClose function
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'

const CRIMSON = '#7D1025'
const GOLD    = '#C9A030'

function fmtBytes(n) {
  if (!n) return ''
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB'
  return (n / (1024 * 1024)).toFixed(1) + ' MB'
}

const Btn = ({ onClick, children, disabled, gold }) => (
  <button onClick={onClick} disabled={disabled} style={{
    border: 'none', borderRadius: 6, padding: '7px 14px',
    fontSize: 12, fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: gold ? GOLD : 'rgba(255,255,255,.15)',
    color: gold ? CRIMSON : '#fff',
    opacity: disabled ? .4 : 1,
  }}>{children}</button>
)

export default function GooglePDFViewer({ book, onClose }) {
  // Dynamic component refs — populated after dynamic import resolves
  const [PDFComponents, setPDFComponents] = useState(null)
  const [numPages,    setNumPages]    = useState(null)
  const [scale,       setScale]       = useState(1.2)
  const [currentPage, setCurrentPage] = useState(1)
  const [loadError,   setLoadError]   = useState(null)
  const [docLoading,  setDocLoading]  = useState(true)
  const [fullscreen,  setFullscreen]  = useState(false)
  const containerRef = useRef(null)
  const scrollRef    = useRef(null)
  const pageRefs     = useRef({})
  const observerRef  = useRef(null)

  // ── Dynamically load react-pdf AFTER mount ──────────────
  // This prevents pdfjs from initialising at app startup which
  // causes the sendWithPromise / sendWithStream crash.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const mod = await import('react-pdf')
        if (cancelled) return

        // Set worker — must happen before any Document renders
        mod.pdfjs.GlobalWorkerOptions.workerSrc =
          `https://unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`

        // Also import CSS
        await import('react-pdf/dist/Page/AnnotationLayer.css').catch(() => {})
        await import('react-pdf/dist/Page/TextLayer.css').catch(() => {})

        if (!cancelled) setPDFComponents({ Document: mod.Document, Page: mod.Page })
      } catch (e) {
        if (!cancelled) setLoadError('Failed to load PDF reader: ' + e.message)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // ── Lock body scroll ────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // ── Keyboard shortcuts ──────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['s','S','p','P'].includes(e.key)) {
        e.preventDefault(); e.stopPropagation()
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', fn, true)
    return () => window.removeEventListener('keydown', fn, true)
  }, [onClose])

  // ── IntersectionObserver — track current page ───────────
  const setupObserver = useCallback(() => {
    observerRef.current?.disconnect()
    const obs = new IntersectionObserver((entries) => {
      let best = null, bestRatio = 0
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio > bestRatio) {
          bestRatio = e.intersectionRatio; best = e.target
        }
      })
      if (best) setCurrentPage(Number(best.dataset.page))
    }, { root: scrollRef.current, threshold: [0.1, 0.5] })
    Object.values(pageRefs.current).forEach(el => el && obs.observe(el))
    observerRef.current = obs
  }, [])

  useEffect(() => {
    if (numPages) setupObserver()
    return () => observerRef.current?.disconnect()
  }, [numPages, scale, setupObserver])

  // ── Fullscreen ──────────────────────────────────────────
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

  const scrollToPage = (n) => {
    const p = Math.max(1, Math.min(n, numPages || 1))
    pageRefs.current[p]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const pgW = Math.round(595 * scale)
  const pgH = Math.round(842 * scale)

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

        <Btn onClick={() => setScale(s => Math.max(0.5, +(s - 0.2).toFixed(1)))}>−</Btn>
        <span style={{ color: '#fff', fontSize: 12, minWidth: 42, textAlign: 'center' }}>
          {Math.round(scale * 100)}%
        </span>
        <Btn onClick={() => setScale(s => Math.min(3.0, +(s + 0.2).toFixed(1)))}>+</Btn>

        {numPages && (<>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.25)', margin: '0 4px' }}/>
          <Btn disabled={currentPage <= 1} onClick={() => scrollToPage(currentPage - 1)}>‹</Btn>
          <span style={{ color: '#fff', fontSize: 12, minWidth: 72, textAlign: 'center' }}>
            {currentPage} / {numPages}
          </span>
          <Btn disabled={currentPage >= numPages} onClick={() => scrollToPage(currentPage + 1)}>›</Btn>
        </>)}

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.25)', margin: '0 4px' }}/>
        <Btn onClick={toggleFullscreen}>{fullscreen ? 'Exit full' : 'Fullscreen'}</Btn>
        <Btn gold onClick={onClose}>Close</Btn>
      </div>

      {/* PDF area */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', overflowX: 'auto',
        background: '#525659', display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '24px 16px', gap: 12, position: 'relative',
      }}>
        {/* Loading pdfjs */}
        {!PDFComponents && !loadError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, border: '4px solid rgba(255,255,255,.15)', borderTopColor: GOLD, borderRadius: '50%', animation: 'lvSpin .75s linear infinite' }}/>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Loading reader...</div>
            <style>{`@keyframes lvSpin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Error */}
        {loadError && (
          <div style={{ color: '#fff', textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Could not load PDF reader</div>
            <div style={{ fontSize: 12, opacity: .7, marginBottom: 20 }}>{loadError}</div>
            <a href={book.url} target="_blank" rel="noopener noreferrer" style={{
              background: GOLD, color: CRIMSON, padding: '10px 24px',
              borderRadius: 8, fontWeight: 800, fontSize: 13, textDecoration: 'none', display: 'inline-block',
            }}>Open in browser tab</a>
          </div>
        )}

        {/* PDF document — renders once pdfjs is loaded */}
        {PDFComponents && (() => {
          const { Document, Page } = PDFComponents
          return (
            <Document
              file={book.url}
              onLoadSuccess={({ numPages: n }) => { setNumPages(n); setDocLoading(false) }}
              onLoadError={(err) => { setLoadError(err?.message || 'Failed to load PDF.'); setDocLoading(false) }}
              loading=""
              options={{ cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/', cMapPacked: true }}
            >
              {/* Loading spinner while doc loads */}
              {docLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 60 }}>
                  <div style={{ width: 44, height: 44, border: '4px solid rgba(255,255,255,.15)', borderTopColor: GOLD, borderRadius: '50%', animation: 'lvSpin .75s linear infinite' }}/>
                  <div style={{ color: '#fff', fontSize: 14 }}>Loading {fmtBytes(book.sizeBytes)} book...</div>
                </div>
              )}

              {/* All pages — continuous scroll */}
              {numPages && Array.from({ length: numPages }, (_, i) => i + 1).map(p => (
                <div key={p} data-page={p} ref={el => { pageRefs.current[p] = el }}
                  style={{ marginBottom: 8, boxShadow: '0 4px 24px rgba(0,0,0,.5)', borderRadius: 2, overflow: 'hidden', background: '#fff' }}>
                  <Page
                    pageNumber={p}
                    scale={scale}
                    renderTextLayer
                    renderAnnotationLayer={false}
                    loading={
                      <div style={{ width: pgW, height: pgH, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 28, height: 28, border: `3px solid #e0e0e0`, borderTopColor: CRIMSON, borderRadius: '50%', animation: 'lvSpin .75s linear infinite' }}/>
                      </div>
                    }
                  />
                </div>
              ))}
            </Document>
          )
        })()}
      </div>

      {/* Bottom page nav */}
      {numPages && numPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '10px 16px', background: 'rgba(0,0,0,.6)', flexShrink: 0 }}>
          <Btn disabled={currentPage <= 1} onClick={() => scrollToPage(1)}>«</Btn>
          <Btn disabled={currentPage <= 1} onClick={() => scrollToPage(currentPage - 1)}>‹ Prev</Btn>
          <span style={{ color: '#fff', fontSize: 13, minWidth: 100, textAlign: 'center' }}>
            Page {currentPage} of {numPages}
          </span>
          <Btn disabled={currentPage >= numPages} onClick={() => scrollToPage(currentPage + 1)}>Next ›</Btn>
          <Btn disabled={currentPage >= numPages} onClick={() => scrollToPage(numPages)}>»</Btn>
        </div>
      )}

      {/* Watermark */}
      <div style={{
        position: 'absolute', bottom: numPages && numPages > 1 ? 54 : 8,
        left: 0, right: 0, textAlign: 'center',
        color: 'rgba(255,255,255,.25)', fontSize: 10,
        letterSpacing: '.08em', pointerEvents: 'none',
      }}>
        For personal reading only — Smartious Homeschool
      </div>
    </div>
  )
}
