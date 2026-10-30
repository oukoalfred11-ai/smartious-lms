/**
 * LibraryShelf.jsx — the library as students see it: hero, search and
 * shelf filters, coursebooks grouped by subject (the reader's own
 * subjects first), and past papers and mocks in Subject › Year folders.
 * An open book reads inline (LibraryViewer).
 *
 * Used by the Student portal and, with the same view, by the Teacher
 * portal, which adds its upload button (toolbar) and edit/delete
 * buttons on each book (cardActions).
 *
 *   user         the signed-in user
 *   mySubjects   subject names shown under "My subjects" (default: user.subjects)
 *   reloadKey    change it to reload the books (after an upload, edit or delete)
 *   toolbar      node shown beside the search box
 *   cardActions  (book) => node shown on each book
 *   readOnly     LibraryViewer without download (default true)
 */
import { useState, useEffect } from 'react'
import { api } from '../../context/ctx.jsx'
import LibraryViewer from '../LibraryViewer.jsx'

export default function LibraryShelf({ user, toast, mySubjects: mySubjectNames, reloadKey = 0, toolbar = null, cardActions = null, readOnly = true }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  // Quick filters. A search box alone means a student has to already know
  // what they are looking for, which is the opposite of browsing a library.
  const [shelfF, setShelfF] = useState('all')     // all | mine | academic | general
  const [genreF, setGenreF] = useState('all')
  const [viewerBook, setViewerBook] = useState(null)
  const [openFolders, setOpenFolders] = useState({})
  const toggleFolder = (key) => setOpenFolders(f => ({ ...f, [key]: !f[key] }))

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const { data } = await api.get('/library')
        if (cancelled) return
        setBooks(data?.data?.books || [])
      } catch (e) {
        if (!cancelled) toast?.error?.('Failed to load library: ' + (e?.response?.data?.message || e.message))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey])

  // Filter by search term
  const mySubjects = new Set(
    (mySubjectNames || user?.subjects || []).map(x => String(x).trim().toLowerCase()).filter(Boolean))
  const isMine = (b) => mySubjects.has(String(b.subjectName || '').trim().toLowerCase())

  const filtered = (() => {
    const q = search.trim().toLowerCase()
    return books.filter(b => {
      if (shelfF === 'mine'     && !isMine(b)) return false
      if (shelfF === 'academic' && (b.shelf || 'academic') !== 'academic') return false
      if (shelfF === 'general'  && (b.shelf || 'academic') !== 'general')  return false
      if (genreF !== 'all' && (b.genre || '') !== genreF) return false
      if (!q) return true
      return (b.title || '').toLowerCase().includes(q)
          || (b.description || '').toLowerCase().includes(q)
          || (b.author || '').toLowerCase().includes(q)
          || (b.subjectName || '').toLowerCase().includes(q)
          || (b.genre || '').toLowerCase().includes(q)
    })
  })()

  // Genres actually present, so the chip row never offers an empty filter.
  const genresAvailable = [...new Set(
    books.filter(b => (b.shelf || 'academic') === 'general' && b.genre).map(b => b.genre)
  )].sort()

  // Coursebooks grouped by subject, with the student's OWN subjects first.
  //
  // The library now returns every book rather than only the student's
  // enrolled subjects, which is the point — reading should not stop at
  // the syllabus. But a flat alphabetical list would bury a student's own
  // coursebooks under everything else, so their subjects are labelled and
  // sorted to the top and the rest sits under "Explore".
  const grouped = (() => {
    const mine = {}
    const other = {}
    for (const b of filtered) {
      if (b.section === 'mock' || b.section === 'past_paper') continue
      const general = (b.shelf || 'academic') === 'general'
      const label = general
        ? 'Reading for pleasure  \u2014  ' + (b.genre || 'Other')
        : (isMine(b) ? 'Your subjects  \u2014  ' : 'Explore  \u2014  ') + (b.subjectName || 'Other')
      const target = (!general && isMine(b)) ? mine : other
      if (!target[label]) target[label] = []
      target[label].push(b)
    }
    const out = {}
    Object.keys(mine).sort().forEach(k => { out[k] = mine[k] })
    Object.keys(other).sort().forEach(k => { out[k] = other[k] })
    return out
  })()

  // Paper folders: Section -> Subject -> Year -> [papers sorted Paper 1..6]
  const paperTree = (() => {
    const SEC = { past_paper: 'Past Papers \u00B7 Exam Body', mock: 'Mock Exams' }
    const tree = {}
    for (const b of filtered) {
      if (b.section !== 'mock' && b.section !== 'past_paper') continue
      const sec = SEC[b.section]
      const subj = b.subjectName || 'Other'
      const yr = b.examYear ? String(b.examYear) : 'Unsorted'
      tree[sec] = tree[sec] || {}
      tree[sec][subj] = tree[sec][subj] || {}
      tree[sec][subj][yr] = tree[sec][subj][yr] || []
      tree[sec][subj][yr].push(b)
    }
    for (const sec of Object.keys(tree))
      for (const subj of Object.keys(tree[sec]))
        for (const yr of Object.keys(tree[sec][subj]))
          tree[sec][subj][yr].sort((a, b2) => (a.paperNumber || 99) - (b2.paperNumber || 99)
            || String(a.session || '').localeCompare(String(b2.session || ''))
            || String(a.title || '').localeCompare(String(b2.title || '')))
    return tree
  })()
  const hasPapers = Object.keys(paperTree).length > 0

  // ── READER VIEW ─────────────────────────────────────────
  // An open book renders INLINE in the content area rather than as a
  // full-screen overlay, so the sidebar and topbar stay visible and
  // the page scrolls normally. Back to Library returns to the shelf.
  if (viewerBook) {
    return (
      <div>
        <LibraryViewer book={viewerBook} api={api} readOnly={readOnly} inline onClose={() => setViewerBook(null)}/>
      </div>
    )
  }

  return (
    <div>
      {/* ── Hero banner ────────────────────────────────────────
          Same treatment as Exams and Homework: artwork untouched, a
          slightly narrower card, and a glowing gold stat footer. */}
      <div className="card" style={{
        padding: 0, marginBottom: 18, overflow: 'hidden',
        maxWidth: 1180, marginLeft: 'auto', marginRight: 'auto',
      }}>
        <img
          src="/banners/library-hero.jpg"
          alt="Digital library — read, learn, grow"
          style={{ width: '100%', display: 'block', height: 'auto' }}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          background: '#6B0F1E',
        }}>
          {[
            ['Books',    books.length || '\u2014'],
            ['Subjects', Object.keys(grouped).length || '\u2014'],
            ['Showing',  filtered.length || '\u2014'],
          ].map(([l, v]) => (
            <div key={l} style={{ padding: '13px 18px', borderRight: '1px solid rgba(201,160,48,.18)' }}>
              <div style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
                color: '#E8C97A', opacity: .85, marginBottom: 3,
                textShadow: '0 0 10px rgba(201,160,48,.45)',
              }}>{l}</div>
              <div style={{
                fontSize: 17, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace',
                color: '#F5D98B',
                textShadow: '0 0 12px rgba(245,217,139,.65), 0 0 26px rgba(201,160,48,.35)',
              }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 16 }}>
        Read your coursebooks inline. Books open in full-screen mode and cannot be downloaded.
      </div>

      {/* ── Search + quick filters ──────────────────────────────
          A search box alone requires a student to already know what
          they want. Chips let them browse: their own subjects, the
          wider curriculum shelf, or reading for pleasure by genre. */}
      <div style={{ marginBottom: 16 }}>
        {toolbar && <div style={{ float: 'right', marginLeft: 12 }}>{toolbar}</div>}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, author, subject or genre..."
          style={{
            width: '100%', maxWidth: 420, boxSizing: 'border-box',
            padding: '10px 14px', borderRadius: 8,
            border: '1.5px solid #E8E2D6',
            fontSize: 13, background: '#FBFAF5', marginBottom: 12,
          }}/>

        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            ['all',      'All books'],
            ['mine',     'My subjects'],
            ['academic', 'Curriculum'],
            ['general',  'Reading for pleasure'],
          ].map(([id, label]) => (
            <button key={id}
              onClick={() => { setShelfF(id); if (id !== 'general') setGenreF('all') }}
              style={{
                background: shelfF === id ? '#7D1025' : '#fff',
                color:      shelfF === id ? '#fff' : 'var(--s600)',
                border: '1.5px solid ' + (shelfF === id ? '#7D1025' : 'var(--border)'),
                padding: '6px 14px', borderRadius: 99,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>{label}</button>
          ))}

          {/* Genre chips only appear once there is a general shelf to browse. */}
          {(shelfF === 'general' || shelfF === 'all') && genresAvailable.length > 0 && (
            <>
              <span style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }}/>
              <button onClick={() => setGenreF('all')} style={{
                background: genreF === 'all' ? 'var(--s200)' : 'transparent',
                color: 'var(--s600)', border: 'none',
                padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>All genres</button>
              {genresAvailable.map(g => (
                <button key={g} onClick={() => { setGenreF(g); setShelfF('general') }} style={{
                  background: genreF === g ? '#C9A030' : 'transparent',
                  color: genreF === g ? '#1A0F0E' : 'var(--s600)',
                  border: 'none', padding: '6px 12px', borderRadius: 99,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>{g}</button>
              ))}
            </>
          )}

          {(shelfF !== 'all' || genreF !== 'all' || search) && (
            <button onClick={() => { setShelfF('all'); setGenreF('all'); setSearch('') }}
              style={{
                background: 'transparent', color: 'var(--s500)', border: 'none',
                padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                textDecoration: 'underline',
              }}>Clear</button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ fontSize: 13, color: '#9A9A9A', fontStyle: 'italic', padding: 20 }}>
          Loading library...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <h3>{books.length === 0 ? 'No books in your library yet' : 'No books match your search'}</h3>
          <p>{books.length === 0
            ? 'Your teachers will upload coursebook PDFs here as they become available.'
            : 'Try a different search term, or clear the search to see all books.'}</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap: 22 }}>
          {/* NOT re-sorted: grouped is already ordered with the
              student's own subjects first, then Explore. */}
          {Object.keys(grouped).map(subj => (
            <div key={subj}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#7D1025',
                letterSpacing: '.08em', textTransform: 'uppercase',
                marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #E8E2D6',
              }}>
                {subj}
                <span style={{ color: '#9A9A9A', fontWeight: 600, marginLeft: 8 }}>
                  ({grouped[subj].length})
                </span>
              </div>
              <div style={{
                display:'grid',
                gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 12,
              }}>
                {grouped[subj].map(book => (
                  <StudentBookCard key={book._id} book={book}
                    onOpen={() => setViewerBook(book)} actions={cardActions ? cardActions(book) : null}/>
                ))}
              </div>
            </div>
          ))}

          {/* Past papers and mock exams: folder view by Subject, then Year, then Paper 1-6 */}
          {hasPapers && Object.keys(paperTree).sort().map(sec => (
            <div key={sec}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#7D1025',
                letterSpacing: '.08em', textTransform: 'uppercase',
                marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #E8E2D6',
              }}>
                {sec}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
                {Object.keys(paperTree[sec]).sort().map(subj => (
                  <div key={subj} style={{ background:'#fff', border:'1px solid #E8E2D6', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontFamily:'Georgia, serif', fontSize: 15, fontWeight: 700, color:'#1A1A1A', marginBottom: 10 }}>
                      {subj}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
                      {Object.keys(paperTree[sec][subj]).sort((a, b2) => {
                        if (a === 'Unsorted') return 1
                        if (b2 === 'Unsorted') return -1
                        return parseInt(b2, 10) - parseInt(a, 10)
                      }).map(yr => {
                        const fkey = sec + '|' + subj + '|' + yr
                        const open = !!openFolders[fkey]
                        const papers = paperTree[sec][subj][yr]
                        return (
                          <div key={yr} style={{ border:'1px solid #EFE9DD', borderRadius: 9, overflow:'hidden' }}>
                            <button onClick={() => toggleFolder(fkey)} style={{
                              width:'100%', display:'flex', alignItems:'center', gap: 10,
                              background: open ? '#FBF7EC' : '#FDFAF4', border:'none',
                              padding:'10px 14px', cursor:'pointer', textAlign:'left',
                            }}>
                              <span style={{
                                width: 30, height: 24, borderRadius: 5, flexShrink: 0,
                                background: 'linear-gradient(135deg, #C9A030, #A8821F)',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                color:'#fff', fontSize: 11, fontWeight: 800,
                              }}>{open ? '\u2212' : '+'}</span>
                              <span style={{ fontSize: 13.5, fontWeight: 800, color:'#3A2E1E' }}>{yr}</span>
                              <span style={{ fontSize: 11.5, color:'#9A9A9A', fontWeight: 600 }}>
                                {papers.length} paper{papers.length === 1 ? '' : 's'}
                              </span>
                            </button>
                            {open && (
                              <div style={{ padding:'6px 10px 10px', display:'flex', flexDirection:'column', gap: 6 }}>
                                {papers.map(bk => (
                                  <div key={bk._id} style={{
                                    display:'flex', alignItems:'center', gap: 10,
                                    background:'#fff', border:'1px solid #EFE9DD', borderRadius: 8,
                                    padding:'8px 12px',
                                  }}>
                                    <span style={{
                                      fontSize: 10, fontWeight: 800, color:'#7D1025',
                                      background:'#F7E9EC', border:'1px solid #E4C3CB',
                                      borderRadius: 99, padding:'3px 10px', letterSpacing:'.04em',
                                      flexShrink: 0, whiteSpace:'nowrap',
                                    }}>
                                      {bk.paperNumber ? 'PAPER ' + bk.paperNumber : 'PDF'}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 12.5, fontWeight: 700, color:'#1A1A1A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                        {bk.title}
                                      </div>
                                      {bk.session && (
                                        <div style={{ fontSize: 10.5, color:'#7D5A0F', fontWeight: 700 }}>{bk.session}</div>
                                      )}
                                    </div>
                                    <button onClick={() => setViewerBook(bk)} style={{
                                      background:'#7D1025', color:'#fff', border:'none',
                                      borderRadius: 7, padding:'7px 14px', fontSize: 11.5,
                                      fontWeight: 700, cursor:'pointer', flexShrink: 0,
                                    }}>Open</button>
                                    {cardActions && cardActions(bk)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

// ─────────────────────────────────────────────────────────
// StudentBookCard
// Compact book card for the student library. Read-only,
// no delete button.
// ─────────────────────────────────────────────────────────
function StudentBookCard({ book, onOpen, actions }) {
  const sizeMB = book.sizeBytes ? (book.sizeBytes / (1024 * 1024)).toFixed(1) + ' MB' : ''
  return (
    <div className="sm-glow sm-glow-card" style={{
      background: '#fff', border: 'none', borderRadius: 10,
      padding: 14, display: 'flex', flexDirection: 'column',
    }}>
      {book.coverUrl ? (
        <img src={book.coverUrl} alt="" loading="lazy" style={{
          width: '100%', height: 150, borderRadius: 8, objectFit: 'cover',
          objectPosition: 'top', marginBottom: 10, border: '1px solid #E8E2D6',
        }} />
      ) : (
        <div style={{
          width: '100%', height: 150, borderRadius: 8, marginBottom: 10,
          background: 'linear-gradient(150deg, #7D1025 0%, #5C0B1B 60%, #3E0712 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <div style={{
            width: 44, height: 56, borderRadius: 4, border: '2px solid #C9A030',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#C9A030', fontSize: 10, fontWeight: 800, letterSpacing: '.05em',
          }}>PDF</div>
          <div style={{
            color: '#F0CC5A', fontSize: 11, fontWeight: 700, textAlign: 'center',
            padding: '0 14px', fontFamily: 'Georgia, serif', fontStyle: 'italic',
            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{book.subjectName || 'Coursebook'}</div>
        </div>
      )}
      <div style={{ display:'flex', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 13.5, color: '#1A1A1A',
            lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{book.title}</div>
          {book.author && (
            <div style={{ fontSize: 11.5, color: '#6B6B6B', marginTop: 3 }}>{book.author}</div>
          )}
        </div>
      </div>

      {book.description && (
        <div style={{
          fontSize: 11.5, color: '#6B6B6B', marginBottom: 8,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', lineHeight: 1.4,
        }}>
          {book.description}
        </div>
      )}

      <div style={{ fontSize: 10.5, color: '#9A9A9A', marginBottom: 10 }}>
        {sizeMB}
        {book.grades?.length ? ' · ' + book.grades.join(', ') : ''}
      </div>

      <button onClick={onOpen}
        style={{
          background: '#7D1025', color: '#fff', border: 'none',
          padding: '8px 14px', borderRadius: 6,
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          marginTop: 'auto',
        }}>
        Open book
      </button>
      {actions && <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>{actions}</div>}
    </div>
  )
}
