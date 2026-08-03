/**
 * LibraryUpload.jsx
 * ============================================================
 * Teacher/admin component for uploading coursebook PDFs to R2.
 *
 * Upload flow (file never touches the backend server):
 *   1. Fill form (subject, title, file) → click Upload
 *   2. POST /api/library/presign  → get a presigned PUT URL from backend
 *   3. PUT file directly to R2 from the browser (progress tracked)
 *   4. POST /api/library/confirm  → backend saves metadata to MongoDB
 *   5. onUploaded() callback fires — parent refreshes the book list
 *
 * Props:
 *   api        — axios instance from ctx.jsx
 *   toast      — toast helper from ctx.jsx
 *   subjects   — array of { _id, subjectName, curriculum } for the dropdown
 *   onUploaded — callback fired after successful confirm
 *   onClose    — callback to close/hide this form
 */

import React, { useState, useRef } from 'react'
import axios from 'axios'

export default function LibraryUpload({ api, toast, subjects = [], onUploaded, onClose }) {
  const [subjectId,    setSubjectId]    = useState('')
  const [title,        setTitle]        = useState('')
  const [author,       setAuthor]       = useState('')
  const [description,  setDescription]  = useState('')
  const [grades,       setGrades]       = useState('')
  const [file,         setFile]         = useState(null)
  const [stage,        setStage]        = useState('idle') // idle | presigning | uploading | confirming | done | error
  const [progress,     setProgress]     = useState(0)      // 0–100
  const [cover,        setCover]        = useState(null)   // optional cover image file
  const [coverPreview, setCoverPreview] = useState('')
  const [errorMsg,     setErrorMsg]     = useState('')
  const fileInputRef = useRef(null)

  const reset = () => {
    setSubjectId(''); setTitle(''); setAuthor(''); setDescription('')
    setGrades(''); setFile(null); setStage('idle'); setProgress(0); setErrorMsg('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted.')
      e.target.value = ''
      return
    }
    setFile(f)
    // Pre-fill title from filename if blank
    if (!title.trim()) {
      setTitle(f.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' '))
    }
  }

  const upload = async () => {
    if (!subjectId)        return toast.error('Select a subject.')
    if (!title.trim())     return toast.error('Title is required.')
    if (!file)             return toast.error('Select a PDF file.')

    setErrorMsg('')

    try {
      // ── Step 1: get presigned URL ──────────────────────────
      setStage('presigning')
      setProgress(0)

      const presignRes = await api.post('/library/presign', {
        subjectId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/pdf',
      })
      const { uploadUrl, r2Key, publicUrl } = presignRes.data.data

      // ── Step 2: PUT file directly to R2 ───────────────────
      // Use plain axios (not the api instance) so we don't send
      // the Authorization header to R2 — it confuses the signature.
      setStage('uploading')
      setProgress(0)

      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type || 'application/pdf',
        },
        onUploadProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded / evt.total) * 100))
          }
        },
      })

      setProgress(100)

      // Optional cover image upload (small, direct to R2)
      let uploadedCoverUrl = ''
      if (cover) {
        try {
          const cp = await api.post('/library/presign-cover', { fileName: cover.name, mimeType: cover.type || 'image/jpeg' })
          const cd = cp.data?.data || cp.data
          if (cd?.uploadUrl) {
            await fetch(cd.uploadUrl, { method: 'PUT', headers: { 'Content-Type': cover.type || 'image/jpeg' }, body: cover })
            uploadedCoverUrl = cd.publicUrl || ''
          }
        } catch { /* cover is optional; book proceeds without it */ }
      }

      // ── Step 3: confirm — save metadata to MongoDB ─────────
      setStage('confirming')

      await api.post('/library/confirm', {
        r2Key,
        publicUrl,
        subjectId,
        title:       title.trim(),
        author:      author.trim(),
        description: description.trim(),
        grades:      grades.trim(),
        fileName:    file.name,
        fileSize:    file.size,
        mimeType:    file.type || 'application/pdf',
        coverUrl:    uploadedCoverUrl,
      })

      setStage('done')
      toast.ok(`"${title.trim()}" uploaded successfully.`)
      onUploaded?.()

    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Upload failed.'
      setErrorMsg(msg)
      setStage('error')
      toast.error(msg)
    }
  }

  const busy = ['presigning', 'uploading', 'confirming'].includes(stage)

  const stageLabel = {
    idle:       '',
    presigning: 'Preparing upload...',
    uploading:  `Uploading to storage — ${progress}%`,
    confirming: 'Saving to library...',
    done:       'Upload complete.',
    error:      'Upload failed.',
  }[stage]

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', borderRadius: 7,
    border: '1.5px solid #E8E2D6',
    fontSize: 13, fontFamily: 'inherit', background: '#fff',
  }
  const lbl = {
    display: 'block', fontSize: 11, fontWeight: 700,
    letterSpacing: '.05em', textTransform: 'uppercase',
    color: '#7D1025', marginBottom: 5,
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: '1px solid #E8E2D6',
      padding: 24, maxWidth: 560,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#1A1A1A' }}>Upload Coursebook</div>
          <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>
            PDF · any size · uploads directly to cloud storage
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#6B6B6B', cursor: 'pointer' }}>×</button>
        )}
      </div>

      {/* Subject */}
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Subject *</label>
        <select value={subjectId} onChange={e => setSubjectId(e.target.value)} style={inp} disabled={busy}>
          <option value=''>— Select subject —</option>
          {subjects.map(s => (
            <option key={s._id} value={s._id}>
              {s.subjectName} {s.curriculum ? `(${s.curriculum})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Book Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder='e.g. Cambridge IGCSE Biology Coursebook (5th Ed.)'
          style={inp} disabled={busy}/>
      </div>

      {/* Author + Grades row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Author / Publisher</label>
          <input value={author} onChange={e => setAuthor(e.target.value)}
            placeholder='e.g. Cambridge University Press'
            style={inp} disabled={busy}/>
        </div>
        <div style={{ flex: 1 }}>
          <label style={lbl}>Grades (optional)</label>
          <input value={grades} onChange={e => setGrades(e.target.value)}
            placeholder='e.g. Year 10, Year 11'
            style={inp} disabled={busy}/>

        <div>
          <label style={lbl}>Cover image (optional)</label>
          <input type='file' accept='image/*' onChange={e => {
            const f = e.target.files?.[0] || null
            setCover(f)
            setCoverPreview(f ? URL.createObjectURL(f) : '')
          }} style={{ fontSize: 13 }} />
          {coverPreview && (
            <img src={coverPreview} alt='Cover preview'
              style={{ display: 'block', marginTop: 8, width: 90, borderRadius: 6, border: '2px solid #C9A030' }} />
          )}
        </div>
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Description (optional)</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          rows={2} placeholder='Brief description of what this book covers...'
          style={{ ...inp, resize: 'vertical' }} disabled={busy}/>
      </div>

      {/* File picker */}
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>PDF File *</label>
        <div style={{
          border: '2px dashed ' + (file ? '#15803D' : '#E8E2D6'),
          borderRadius: 8, padding: '18px 16px', textAlign: 'center',
          background: file ? '#DCFCE7' : '#FBFAF5',
          cursor: busy ? 'not-allowed' : 'pointer',
          transition: 'all .15s',
        }}
          onClick={() => !busy && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type='file'
            accept='application/pdf,.pdf'
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={busy}
          />
          {file ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#15803D' }}>{file.name}</div>
              <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 3 }}>
                {(file.size / (1024 * 1024)).toFixed(1)} MB
                {' · '}
                <span onClick={e => { e.stopPropagation(); if (!busy) { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' } }}
                  style={{ color: '#B91C1C', cursor: 'pointer', textDecoration: 'underline' }}>
                  Remove
                </span>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 4 }}>
                Click to select a PDF
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                Any size — uploads directly to cloud storage, not through the server
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {stage === 'uploading' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            height: 6, background: '#E8E2D6', borderRadius: 99, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: progress + '%',
              background: '#7D1025', borderRadius: 99,
              transition: 'width .2s',
            }}/>
          </div>
          <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 4, textAlign: 'right' }}>
            {progress}%
          </div>
        </div>
      )}

      {/* Stage label */}
      {stageLabel && (
        <div style={{
          fontSize: 12.5, fontWeight: 600, marginBottom: 14,
          color: stage === 'error' ? '#B91C1C' : stage === 'done' ? '#15803D' : '#7D1025',
        }}>
          {stageLabel}
        </div>
      )}

      {/* Error detail */}
      {stage === 'error' && errorMsg && (
        <div style={{
          background: '#FEE2E2', border: '1px solid #FCA5A5',
          borderRadius: 8, padding: '10px 14px',
          fontSize: 12.5, color: '#991B1B', marginBottom: 14,
        }}>
          {errorMsg}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        {stage === 'done' ? (
          <>
            <button onClick={reset} style={{
              background: '#fff', color: '#7D1025',
              border: '1.5px solid #E8E2D6', borderRadius: 7,
              padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>Upload Another</button>
            {onClose && (
              <button onClick={onClose} style={{
                background: '#7D1025', color: '#fff', border: 'none',
                borderRadius: 7, padding: '9px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>Done</button>
            )}
          </>
        ) : (
          <>
            {onClose && (
              <button onClick={onClose} disabled={busy} style={{
                background: '#fff', color: '#6B6B6B',
                border: '1.5px solid #E8E2D6', borderRadius: 7,
                padding: '9px 18px', fontSize: 13, fontWeight: 700,
                cursor: busy ? 'not-allowed' : 'pointer',
              }}>Cancel</button>
            )}
            {stage === 'error' && (
              <button onClick={reset} style={{
                background: '#fff', color: '#7D1025',
                border: '1.5px solid #7D1025', borderRadius: 7,
                padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>Try Again</button>
            )}
            <button onClick={upload} disabled={busy || !file || !subjectId || !title.trim()} style={{
              background: busy || !file || !subjectId || !title.trim() ? '#9CA3AF' : '#7D1025',
              color: '#fff', border: 'none', borderRadius: 7,
              padding: '9px 22px', fontSize: 13, fontWeight: 700,
              cursor: busy || !file || !subjectId || !title.trim() ? 'not-allowed' : 'pointer',
            }}>
              {busy ? stageLabel : 'Upload Book'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
