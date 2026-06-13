/**
 * LibraryViewer.jsx
 * ============================================================
 * Opens a PDF book in a new browser tab directly from R2.
 * No react-pdf, no worker, no iframe cross-origin issues.
 * The R2 public URL is opened directly — the browser's native
 * PDF viewer handles rendering. Fast, reliable, any file size.
 *
 * Props:
 *   book    { _id, title, url, subjectName, curriculum, author, sizeBytes }
 *   onClose function
 */

import React, { useEffect } from 'react'

export default function LibraryViewer({ book, onClose }) {
  useEffect(() => {
    if (book?.url) {
      window.open(book.url, '_blank', 'noopener,noreferrer')
    }
    // Close the modal immediately after opening the tab
    onClose()
  }, [])

  return null
}
