import React, { useEffect } from 'react'

export default function LibraryViewer({ book, onClose }) {
  useEffect(() => {
    if (book?.url) window.open(book.url, '_blank', 'noopener,noreferrer')
    onClose()
  }, [])
  return null
}
