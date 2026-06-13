/**
 * LibraryViewer.jsx
 * ============================================================
 * Full-screen PDF viewer using react-pdf.
 * All pages rendered in a continuous scroll (no page-flip wait).
 * PDF bytes fetched directly from R2 CDN.
 *
 * Props:
 *   book    { _id, title, subjectName, curriculum, author, sizeBytes, url }
 *   onClose function
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// react-pdf v9 + Vite: set workerSrc to the node_modules copy via Vite's ?url import
// This avoids CDN version mismatches and the sendWithPromise error
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const CRIMSON = '#7D1025'
const GOLD    = '#C9A030'

function fmtBytes(n) {
  if (!n) return ''
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB'
  return (n / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function LibraryViewer({ book, onClose }) {
  const [numPages, setNumPages] = useState(null)
  const [scale, setScale]       = useState(1.2)
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [fullscreen, setFullscreen]   = useState(false)
  const containerRef = useRef(null)
  const scrollRef    = useRef(null)
  const pageRefs     = useRef({})

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Block save/print shortcuts
  useEffect(() => {
    const fn = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['s','S','p','P'].includes(e.key)) {
        e.preventDefault(); e.stopPropagation()
      }
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', fn, true)
    return () => document.removeEventListener('keydown', fn, true)
  }, [onClose])

  // Track which page is visible using IntersectionObserver
  useEffect(() => {
    if (!numPages) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const p = Number(e.target.dataset.page)
          if (p) setCurrentPage(p)
        }
      })
    }, { threshold: 0.4, root: scrollRef.current })

    Object.values(pageRefs.current).forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [numPages])

  const scrollToPage = (n) => {
    const el = pageRefs.current[n]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  const onDocLoaded = ({ numPages: n }) => { setNumPages(n); setLoading(false) }
  const onDocError  = (err) => { setError(err?.message || 'Failed to load PDF.'); setLoading(false) }

  const btn = (onClick, label, extra = {}) => (
    <button onClick={onClick} style={{
      border: 'none', borderRadius: 6, padding: '6px 12px',
      fontSize: 12, fontWeight: 700, cursor: 'pointer',
      background: 'rgba(255,255,255,.15)', color: '#fff',
      ...extra,
    }}>{label}</button>
  )

  return (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#1a1a1a', display: 'flex', flexDirection: 'column',
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', background: CRIMSON, flexShrink: 0,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {book.title}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', marginTop: 1 }}>
            {[book.subjectName, book.curriculum, book.author, fmtBytes(book.sizeBytes)].filter(Boolean).join(' · ')}
          </div>
        </div>

        {/* Zoom */}
        {btn(() => setScale(s => Math.max(0.5, +(s - 0.2).toFixed(1))), '−')}
        <span style={{ color: '#fff', fontSize: 12, minWidth: 42, textAlign: 'center' }}>
          {Math.round(scale * 100)}%
        </span>
        {btn(() => setScale(s => Math.min(3.0, +(s + 0.2).toFixed(1))), '+')}

        {/* Page nav */}
        {numPages && (<>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.25)', margin: '0 4px' }}/>
          {btn(() => scrollToPage(Math.max(1, currentPage - 1)), '‹', { opacity: currentPage <= 1 ? .4 : 1 })}
          <span style={{ color: '#fff', fontSize: 12, minWidth: 72, textAlign: 'center' }}>
            {currentPage} / {numPages}
          </span>
          {btn(() => scrollToPage(Math.min(numPages, currentPage + 1)), '›', { opacity: currentPage >= numPages ? .4 : 1 })}
        </>)}

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.25)', margin: '0 4px' }}/>
        {btn(toggleFullscreen, fullscreen ? 'Exit full' : 'Fullscreen')}
        {btn(onClose, 'Close', { background: GOLD, color: CRIMSON, fontWeight: 800 })}
      </div>

      {/* ── PDF scroll area — all pages rendered continuously ── */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', overflowX: 'auto',
        background: '#525659', padding: '20px 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>

        {/* Loading spinner */}
        {loading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#fff', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,.2)', borderTopColor: GOLD, borderRadius: '50%', animation: 'lvspin .8s linear infinite', margin: '0 auto 12px' }}/>
            <div style={{ fontSize: 13 }}>Loading book...</div>
            <style>{`@keyframes lvspin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ color: '#fff', textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Could not load this PDF</div>
            <div style={{ fontSize: 12, opacity: .7, marginBottom: 16 }}>{error}</div>
            <a href={book.url} target="_blank" rel="noopener noreferrer" style={{
              background: GOLD, color: CRIMSON, padding: '9px 20px',
              borderRadius: 7, fontWeight: 700, fontSize: 12.5, textDecoration: 'none',
            }}>Open directly in browser</a>
          </div>
        )}

        {/* All pages in one Document — continuous scroll, no page flipping */}
        <Document
          file={book.url}
          onLoadSuccess={onDocLoaded}
          onLoadError={onDocError}
          loading=""
          options={{
            cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/',
            cMapPacked: true,
          }}
        >
          {numPages && Array.from({ length: numPages }, (_, i) => i + 1).map(p => (
            <div
              key={p}
              data-page={p}
              ref={el => { pageRefs.current[p] = el }}
              style={{ marginBottom: 8, boxShadow: '0 2px 12px rgba(0,0,0,.4)' }}
            >
              <Page
                pageNumber={p}
                scale={scale}
                loading={
                  <div style={{
                    width: Math.round(595 * scale), height: Math.round(842 * scale),
                    background: '#fff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#9A9A9A', fontSize: 12,
                  }}>
                    Loading page {p}...
                  </div>
                }
                renderTextLayer={true}
                renderAnnotationLayer={false}
              />
            </div>
          ))}
        </Document>
      </div>

      {/* Watermark */}
      <div style={{
        position: 'absolute', bottom: 8, left: 0, right: 0,
        textAlign: 'center', color: 'rgba(255,255,255,.3)',
        fontSize: 10, letterSpacing: '.06em', pointerEvents: 'none',
      }}>
        For personal reading only — Smartious Homeschool
      </div>
    </div>
  )
}
