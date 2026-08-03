/**
 * components/LibraryViewer.jsx
 * In-portal PDF viewer. Renders the R2-hosted document inside a
 * full-screen iframe modal (no popups, so nothing to block).
 * Falls back to fetching a fresh URL from /library/:id/view.
 */
import React, { useEffect, useState } from 'react'

export default function LibraryViewer({ book, api, onClose, readOnly = false }) {
  const [url, setUrl] = useState(book?.url || book?.publicUrl || '')
  const [err, setErr] = useState('')

  useEffect(() => {
    if (url || !book?._id || !api) return
    api.get('/library/' + book._id + '/view')
      .then(r => setUrl(r.data?.data?.url || r.data?.data?.publicUrl || ''))
      .catch(() => setErr('Could not load this document. Please try again or contact support.'))
  }, [book?._id])

  if (!book) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,12,20,.85)', zIndex: 400, display: 'flex', flexDirection: 'column' }}>
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
          style={{ background: '#C9A030', color: '#7D1025', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
          Close
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
        <iframe title={book.title || 'Document'} allow="fullscreen"
          src={url + (readOnly ? '#toolbar=0&navpanes=0&view=FitH' : '#view=FitH')}
          style={{ flex: 1, border: 'none', background: '#fff' }} />
      )}
    </div>
  )
}
