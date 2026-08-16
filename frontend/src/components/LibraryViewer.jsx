/**
 * components/LibraryViewer.jsx
 * In-portal PDF viewer. Renders the R2-hosted document inside an
 * iframe (no popups, so nothing to block). Falls back to fetching
 * a fresh URL from /library/:id/view.
 *
 * Two display modes:
 *  - overlay (default): full-screen fixed modal covering everything.
 *  - inline={true}:     a card that lives INSIDE the portal content
 *    area, so the sidebar and topbar stay visible and the page keeps
 *    scrolling normally. The reader area is sized to the viewport
 *    minus the portal chrome so the book still gets real height.
 */
import React, { useEffect, useState } from 'react'

export default function LibraryViewer({ book, api, onClose, readOnly = false, inline = false }) {
  const [url, setUrl] = useState(book?.url || book?.publicUrl || '')
  const [err, setErr] = useState('')
  const [frameLoaded, setFrameLoaded] = useState(false)

  useEffect(() => {
    if (url || !book?._id || !api) return
    api.get('/library/' + book._id + '/view')
      .then(r => setUrl(r.data?.data?.url || r.data?.data?.publicUrl || ''))
      .catch(() => setErr('Could not load this document. Please try again or contact support.'))
  }, [book?._id])

  if (!book) return null
  const rootStyle = inline
    ? { position: 'relative', display: 'flex', flexDirection: 'column',
        borderRadius: 14, overflow: 'hidden', border: '1px solid #E8E2D6',
        background: '#0E1420', boxShadow: '0 14px 44px rgba(0,0,0,.14)',
        height: 'calc(100vh - 150px)', minHeight: 520 }
    : { position: 'fixed', inset: 0, background: 'rgba(8,12,20,.85)', zIndex: 400,
        display: 'flex', flexDirection: 'column' }
  return (
    <div style={rootStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: '#7D1025' }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Arial, sans-serif' }}>
          {book.title || book.fileName}
        </div>
        {url && !readOnly && (
          <a href={url} target="_blank" rel="noopener noreferrer"
            style={{ color: '#F0CC5A', fontSize: 12.5, fontWeight: 700, textDecoration: 'none', border: '1.5px solid #C9A030', borderRadius: 7, padding: '6px 12px', fontFamily: 'Arial, sans-serif' }}>
            Open in new tab
          </a>
        )}
        <button onClick={onClose}
          style={{ background: '#C9A030', color: '#7D1025', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
          {inline ? '\u2190 Back to Library' : 'Close'}
        </button>
      </div>
      {err ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontFamily: 'Arial, sans-serif' }}>
          {err}
          <button onClick={() => { setErr(''); setUrl(''); api.get('/library/' + book._id + '/view').then(r => setUrl(r.data?.data?.url || r.data?.data?.publicUrl || '')).catch(() => setErr('Still unavailable. Contact your teacher or support.')) }}
            style={{ background: '#C9A030', color: '#7D1025', border: 'none', borderRadius: 7, padding: '8px 18px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>Retry</button>
        </div>
      ) : !url ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0CC5A', fontSize: 14, fontFamily: 'Arial, sans-serif' }}>Loading document...</div>
      ) : (
        <div style={{ flex: 1, position: 'relative' }}>
          {!frameLoaded && (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(150deg, #7D1025, #3E0712)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 1, fontFamily: 'Arial, sans-serif' }}>
              {(book.coverUrl || book.cover || book.coverImage) && (
                <img src={book.coverUrl || book.cover || book.coverImage} alt=""
                  style={{ width: 120, borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,.45)', border: '2px solid #C9A030' }} />
              )}
              <div style={{ color: '#fff', fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, textAlign: 'center', padding: '0 24px' }}>
                {book.title || 'Your book'}
              </div>
              <div style={{ color: '#F0CC5A', fontSize: 13.5, fontWeight: 700 }}>
                Loading your book<span className="lv-dots"/>
              </div>
              <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 11.5, textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
                Larger coursebooks can take a few moments the first time. Your pages are on the way.
              </div>
              <style>{'@keyframes lvd{0%{content:\"\"}33%{content:\".\"}66%{content:\"..\"}100%{content:\"...\"}}.lv-dots::after{display:inline-block;width:18px;text-align:left;content:\"\";animation:lvd 1.2s steps(1) infinite}'}</style>
            </div>
          )}
          <iframe title={book.title || 'Document'} allow="fullscreen"
            onLoad={() => setFrameLoaded(true)}
            src={url + (readOnly ? '#toolbar=0&navpanes=0&view=FitH' : '#view=FitH')}
            style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }} />
        </div>
      )}
    </div>
  )
}
