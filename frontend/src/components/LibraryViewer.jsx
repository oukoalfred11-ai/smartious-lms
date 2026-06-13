/**
 * LibraryViewer.jsx
 * ============================================================
 * Full-screen in-app PDF reader using react-pdf v9.
 * Worker served from /public/pdf.worker.min.mjs (copied at
 * build time by vite.config.js — no CDN, no version mismatch).
 *
 * Features:
 *   - Continuous scroll — all pages rendered at once
 *   - Zoom in/out (50% – 300%)
 *   - Page tracking via IntersectionObserver
 *   - Keyboard shortcuts (arrows = scroll, Escape = close)
 *   - Fullscreen mode
 *   - Per-page loading placeholders
 *
 * Props:
 *   book    { _id, title, url, subjectName, curriculum, author, sizeBytes }
 *   onClose function
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Worker served from /public — copied there by vite.config.js at build time.
// No CDN dependency, guaranteed version match with the installed pdfjs-dist.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

const CRIMSON = '#7D1025'
const GOLD    = '#C9A030'

function fmtBytes(n) {
  if (!n) return ''
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB'
  return (n / (1024 * 1024)).toFixed(1) + ' MB'
}

const Btn = ({ onClick, children, disabled, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      border: 'none', borderRadius: 6, padding: '6px 13px',
      fontSize: 12, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      background: 'rgba(255,255,255,.15)', color: '#fff',
      opacity: disabled ? .4 : 1, transition: 'opacity .15s',
      ...style,
    }}
  >{children}</button>
)

export default function LibraryViewer({ book, onClose }) {
  const [numPages,     setNumPages]     = useState(null)
  const [scale,        setScale]        = useState(1.2)
  const [currentPage,  setCurrentPage]  = useState(1)
  const [error,        setError]        = useState(null)
  const [docLoading,   setDocLoading]   = useState(true)
  const [fullscreen,   setFullscreen]   = useState(false)
  const containerRef = useRef(null)
  const scrollRef    = useRef(null)
  const pageRefs     = useRef({})
  const observerRef  = useRef(null)

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Keyboard shortcuts
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

  // IntersectionObserver — track current page as user scrolls
  const setupObserver = useCallback(() => {
    observerRef.current?.disconnect()
    const obs = new IntersectionObserver((entries) => {
      let best = null; let bestRatio = 0
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio > bestRatio) {
          bestRatio = e.intersectionRatio
          best = e.target
        }
      })
      if (best) setCurrentPage(Number(best.dataset.page))
    }, { root: scrollRef.current, threshold: [0.1, 0.5, 0.9] })
    Object.values(pageRefs.current).forEach(el => el && obs.observe(el))
    observerRef.current = obs
  }, [])

  useEffect(() => {
    if (numPages) setupObserver()
    return () => observerRef.current?.disconnect()
  }, [numPages, scale, setupObserver])

  const scrollToPage = (n) => {
    const p = Math.max(1, Math.min(n, numPages || 1))
    pageRefs.current[p]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen?.()
      } else {
        await document.exitFullscreen?.()
      }
    } catch {}
  }
  useEffect(() => {
    const fn = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', fn)
    return () => document.removeEventListener('fullscreenchange', fn)
  }, [])

  const onDocLoaded = ({ numPages: n }) => {
    setNumPages(n)
    setDocLoading(false)
  }
  const onDocError = (err) => {
    console.error('[LibraryViewer]', err)
    setError(err?.message || 'Failed to load PDF.')
    setDocLoading(false)
  }

  // Placeholder size while page renders
  const pgWidth  = Math.round(595 * scale)
  const pgHeight = Math.round(842 * scale)

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#1C1C1C',
        display: 'flex', flexDirection: 'column',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* ─── HEADER ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        padding: '10px 16px',
        background: `linear-gradient(135deg, ${CRIMSON} 0%, #5A0B1B 100%)`,
      }}>
        {/* Book info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 14, color: '#fff',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{book.title}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', marginTop: 1 }}>
            {[book.subjectName, book.curriculum, book.author, fmtBytes(book.sizeBytes)]
              .filter(Boolean).join(' · ')}
          </div>
        </div>

        {/* Zoom */}
        <Btn onClick={() => setScale(s => Math.max(0.5, +(s - 0.2).toFixed(1)))}>−</Btn>
        <span style={{ color: '#fff', fontSize: 12, minWidth: 42, textAlign: 'center', userSelect: 'none' }}>
          {Math.round(scale * 100)}%
        </span>
        <Btn onClick={() => setScale(s => Math.min(3.0, +(s + 0.2).toFixed(1)))}>+</Btn>

        {/* Page nav */}
        {numPages && (<>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.2)', margin: '0 4px' }}/>
          <Btn disabled={currentPage <= 1} onClick={() => scrollToPage(currentPage - 1)}>‹</Btn>
          <span style={{ color: '#fff', fontSize: 12, minWidth: 72, textAlign: 'center', userSelect: 'none' }}>
            {currentPage} / {numPages}
          </span>
          <Btn disabled={currentPage >= numPages} onClick={() => scrollToPage(currentPage + 1)}>›</Btn>
        </>)}

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.2)', margin: '0 4px' }}/>
        <Btn onClick={toggleFullscreen}>{fullscreen ? 'Exit full' : 'Fullscreen'}</Btn>
        <Btn onClick={onClose} style={{ background: GOLD, color: CRIMSON, fontWeight: 800 }}>Close</Btn>
      </div>

      {/* ─── PDF SCROLL AREA ────────────────────────────────── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: 'auto', overflowX: 'auto',
          background: '#525659',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '24px 16px', gap: 12,
          position: 'relative',
        }}
      >
        {/* Loading state */}
        {docLoading && !error && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            <div style={{
              width: 44, height: 44,
              border: '4px solid rgba(255,255,255,.15)',
              borderTopColor: GOLD, borderRadius: '50%',
              animation: 'lvSpin .75s linear infinite',
            }}/>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Loading book...</div>
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 12 }}>
              {fmtBytes(book.sizeBytes) && `${fmtBytes(book.sizeBytes)} PDF`}
            </div>
            <style>{`@keyframes lvSpin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{
            color: '#fff', textAlign: 'center', padding: 40, maxWidth: 400,
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              Could not load this book
            </div>
            <div style={{ fontSize: 13, opacity: .65, marginBottom: 24, lineHeight: 1.6 }}>
              {error}
            </div>
            <a
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: GOLD, color: CRIMSON,
                padding: '10px 24px', borderRadius: 8,
                fontWeight: 800, fontSize: 13, textDecoration: 'none',
              }}
            >
              Open in browser tab
            </a>
          </div>
        )}

        {/* All pages — continuous scroll */}
        <Document
          file={book.url}
          onLoadSuccess={onDocLoaded}
          onLoadError={onDocError}
          loading=""
          options={{ cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/', cMapPacked: true }}
        >
          {numPages && Array.from({ length: numPages }, (_, i) => i + 1).map(p => (
            <div
              key={p}
              data-page={p}
              ref={el => { pageRefs.current[p] = el }}
              style={{
                boxShadow: '0 4px 24px rgba(0,0,0,.5)',
                borderRadius: 2, overflow: 'hidden',
                background: '#fff',
              }}
            >
              <Page
                pageNumber={p}
                scale={scale}
                renderTextLayer
                renderAnnotationLayer={false}
                loading={
                  <div style={{
                    width: pgWidth, height: pgHeight,
                    background: '#f5f5f5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: 28, height: 28,
                      border: '3px solid #e0e0e0', borderTopColor: CRIMSON,
                      borderRadius: '50%', animation: 'lvSpin .75s linear infinite',
                    }}/>
                  </div>
                }
              />
            </div>
          ))}
        </Document>
      </div>

      {/* ─── BOTTOM NAV BAR (only if multi-page) ────────────── */}
      {numPages && numPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '10px 16px', background: 'rgba(0,0,0,.6)', flexShrink: 0,
        }}>
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
        position: 'absolute',
        bottom: numPages && numPages > 1 ? 54 : 8,
        left: 0, right: 0, textAlign: 'center',
        color: 'rgba(255,255,255,.25)', fontSize: 10,
        letterSpacing: '.08em', pointerEvents: 'none', userSelect: 'none',
      }}>
        For personal reading only — Smartious Homeschool
      </div>
    </div>
  )
}
