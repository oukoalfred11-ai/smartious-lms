import React, { useState, useEffect } from 'react'
import { api } from '../../../../context/ctx.jsx'
import Modal from '../../../../components/ui/Modal.jsx'
import { TOKENS } from '../shared/tokens.js'
import { PCard } from '../shared/ui.jsx'

function QuestionBankModule({ toast }) {
  const [questions, setQuestions] = useState([])
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [page,      setPage]      = useState(1)
  const [modal,     setModal]     = useState(false)
  const [editQ,     setEditQ]     = useState(null)
  const [seeding,   setSeeding]   = useState(false)
  const [bulkOpen,  setBulkOpen]  = useState(false)
  const [artQueue,  setArtQueue]  = useState(null)
  const [importOpen,setImportOpen]= useState(false)
  const [diag,      setDiag]      = useState(null)
  const [diagBusy,  setDiagBusy]  = useState(false)
  const [importTxt, setImportTxt] = useState('')
  const [importing, setImporting] = useState(false)
  const [cov,       setCov]       = useState(null)
  const [covSubj,   setCovSubj]   = useState({ subject:'Biology', curriculum:'EdexcelIGCSE' })
  const [filter,    setFilter]    = useState({ subject:'', curriculum:'', difficulty:'', search:'' })

  const SUBJECTS   = ['Mathematics','Physics','Chemistry','Biology','Business Studies','Computer Science','Economics','History','Geography','English Language','English Literature']
  const CURRICULA  = ['EdexcelIGCSE','CambridgeIGCSE','CambridgeALevel','EdexcelALevel','IB','KenyaCBC','American','BNC']
  const DIFFICULTY = ['easy','medium','hard']

  const BLANK = { subject:'Mathematics', topic:'', subtopic:'', lessonCode:'', curriculum:'EdexcelIGCSE', grade:'Year 10', difficulty:'medium', type:'mcq', questionText:'', options:['','','',''], correctAnswer:'', explanation:'', marks:2, markScheme:{ modelAnswer:'', points:[], acceptableAnswers:[], commonErrors:[] }, imageUrl:'', imageCaption:'' }

  const load = async (p=1) => {
    setLoading(true)
    try {
      const params = { page:p, limit:20, ...filter }
      const r = await api.get('/questions', { params })
      setQuestions(r.data?.data?.questions||[])
      setTotal(r.data?.data?.total||0)
      setPage(p)
    } catch(e) { toast?.error?.('Failed to load questions.') }
    setLoading(false)
  }

  useEffect(() => { load(1) }, [filter])



  const seed = async () => {
    setSeeding(true)
    try {
      const r = await api.post('/questions/seed')
      toast?.ok?.(r.data?.message||'Seeded!')
      load(1)
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Seed failed.') }
    setSeeding(false)
  }

  const loadCoverage = async () => {
    try {
      const r = await api.get('/questions/coverage', { params: covSubj })
      setCov(r.data?.data||null)
    } catch(e) { toast?.error?.('Could not load coverage.') }
  }

  const loadArtQueue = async () => {
    try {
      const r = await api.get('/questions/awaiting-images')
      setArtQueue(r.data?.data?.questions || [])
    } catch(e) { toast?.error?.('Could not load the artwork queue.'); setArtQueue([]) }
  }

  const runDiagnose = async () => {
    setDiagBusy(true)
    try {
      const [selfRes, aiRes] = await Promise.allSettled([
        api.get('/questions/selftest'),
        api.get('/questions/ai-marking/status'),
      ])
      const base = selfRes.status==='fulfilled' ? (selfRes.value.data?.data||null) : null
      const ai   = aiRes.status==='fulfilled'   ? (aiRes.value.data?.data||null)   : null
      setDiag(base ? { ...base, aiMarking: ai } : (ai ? { checks:[], classes:[], aiMarking:ai } : null))
      const r = { data: selfRes.status==='fulfilled' ? selfRes.value.data : {} }
      toast?.ok?.(r.data?.message || 'Diagnosis complete.')
    } catch(e) {
      toast?.error?.(e?.response?.data?.message || 'Diagnose failed — is the backend deployed?')
      setDiag({ checks:[{ name:'Endpoint reachable', pass:false, detail:'GET /api/questions/selftest failed — the updated question-bank.js route is not deployed.' }], classes:[] })
    }
    setDiagBusy(false)
  }

  const runSweep = async () => {
    setDiagBusy(true)
    try {
      const r = await api.post('/questions/run-auto-homework', { force:true })
      const d = r.data?.data || {}
      toast?.ok?.(r.data?.message || 'Sweep complete.')
      if (d.skipped?.length) console.warn('[auto-homework skipped]', d.skipped)
      await runDiagnose()
    } catch(e) {
      toast?.error?.(e?.response?.data?.message || 'Sweep failed.')
    }
    setDiagBusy(false)
  }

  const runImport = async () => {
    let payload
    try {
      const parsed = JSON.parse(importTxt)
      payload = Array.isArray(parsed) ? parsed : parsed.questions
      if (!Array.isArray(payload)) throw new Error('Expected an array, or { questions: [...] }')
    } catch(e) { toast?.error?.('Invalid JSON: ' + e.message); return }
    setImporting(true)
    try {
      const r = await api.post('/questions/bulk', { questions: payload })
      toast?.ok?.(r.data?.message || 'Imported.')
      const errs = r.data?.data?.errors || []
      if (errs.length) console.warn('[import errors]', errs)
      setImportOpen(false); setImportTxt(''); load(1)
    } catch(e) { toast?.error?.(e?.response?.data?.message || 'Import failed.') }
    setImporting(false)
  }

  const save = async (form) => {
    try {
      if (form._id) {
        await api.patch('/questions/'+form._id, form)
        toast?.ok?.('Question updated.')
      } else {
        await api.post('/questions', form)
        toast?.ok?.('Question created.')
      }
      setModal(false); load(page)
    } catch(e) { toast?.error?.(e?.response?.data?.message||'Save failed.') }
  }

  const del = async (id) => {
    if (!confirm('Delete this question permanently?')) return
    try { await api.delete('/questions/'+id); toast?.ok?.('Deleted.'); load(page) }
    catch(e) { toast?.error?.('Delete failed.') }
  }

  const diffColor = d => d==='easy'?TOKENS.accentEmerald:d==='medium'?'#D97706':TOKENS.crimson

  return (
    <div>
      {/* Header */}
      <PCard style={{ marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <div style={{ flex:1 }}>
            <div className="sec-tag">Admin</div>
            <h2 className="serif" style={{ fontSize:26, color:TOKENS.ink, margin:'4px 0 2px' }}>
              Question <em style={{ fontStyle:'italic', color:TOKENS.crimson }}>Bank</em>
            </h2>
            <div style={{ fontSize:13, color:TOKENS.s500 }}>{total.toLocaleString()} questions across all subjects and curricula</div>
          </div>
          <button onClick={seed} disabled={seeding} style={{ background:seeding?TOKENS.s300:TOKENS.accentEmerald, color:'#fff', border:'none', padding:'10px 18px', borderRadius:8, fontWeight:700, fontSize:13, cursor:seeding?'not-allowed':'pointer' }}>
            {seeding?'Seeding...':'⬇ Load Built-in Questions'}
          </button>
          <button onClick={()=>setBulkOpen(true)}
            style={{ background:'#fff', color:'#9A7B16', border:'1.5px dashed '+TOKENS.gold, padding:'10px 18px', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' }}>
            Bulk import
          </button>
          <button onClick={loadArtQueue}
            style={{ background:'#fff', color:'#9A7B16', border:'1.5px dashed '+TOKENS.gold, padding:'10px 18px', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' }}>
            Artwork queue
          </button>
          <button onClick={runDiagnose} disabled={diagBusy}
            style={{ background:'#fff', color:'#1E40AF', border:'1.5px dashed #3B82F6', padding:'10px 18px', borderRadius:8, fontWeight:700, fontSize:13, cursor:diagBusy?'wait':'pointer' }}>
            {diagBusy?'Checking...':'Diagnose auto-homework'}
          </button>
          <button onClick={()=>setImportOpen(true)}
            style={{ background:'#fff', color:TOKENS.crimson, border:`1.5px dashed ${TOKENS.crimson}`, padding:'10px 18px', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' }}>
            Bulk import (JSON)
          </button>
          <button onClick={()=>{ setEditQ({...BLANK}); setModal(true) }}
            style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'10px 20px', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' }}>
            + Add Question
          </button>
        </div>
      </PCard>

      {artQueue && (
        <PCard style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontWeight:800, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.08em' }}>Artwork queue</div>
              <div style={{ fontSize:12.5, color:TOKENS.s500, marginTop:2 }}>
                {artQueue.length
                  ? `${artQueue.length} question(s) need a diagram. They are held back from homework until one is attached.`
                  : 'Nothing waiting. Every diagram question has its artwork.'}
              </div>
            </div>
            <button onClick={()=>setArtQueue(null)} style={{ background:'transparent', border:'none', color:TOKENS.s400, fontSize:20, cursor:'pointer', lineHeight:1 }}>×</button>
          </div>

          {artQueue.map(q => (
            <ArtworkRow key={q._id} q={q} toast={toast} onDone={()=>{ loadArtQueue(); load(page) }}/>
          ))}
        </PCard>
      )}

      {diag && (
        <PCard style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontWeight:800, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.08em' }}>Auto-homework diagnosis</div>
              <div style={{ fontSize:12.5, color:TOKENS.s500, marginTop:2 }}>Every precondition, checked in order. Red is what to fix.</div>
            </div>
            <button onClick={runSweep} disabled={diagBusy} style={{ background:TOKENS.accentEmerald, color:'#fff', border:'none', padding:'8px 16px', borderRadius:7, fontWeight:700, fontSize:12.5, cursor:diagBusy?'wait':'pointer' }}>
              {diagBusy?'Running...':'Force run now'}
            </button>
            <button onClick={()=>setDiag(null)} style={{ background:'transparent', border:'none', color:TOKENS.s400, fontSize:20, cursor:'pointer', lineHeight:1 }}>×</button>
          </div>

          {(diag.checks||[]).map((ck,i)=>(
            <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'8px 0', borderTop:i?`1px solid ${TOKENS.s100}`:'none' }}>
              <div style={{ width:20, height:20, borderRadius:'50%', flexShrink:0, marginTop:1, display:'flex', alignItems:'center', justifyContent:'center',
                background: ck.pass?TOKENS.accentEmerald:'#DC2626', color:'#fff', fontSize:12, fontWeight:800 }}>{ck.pass?'✓':'!'}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:ck.pass?TOKENS.ink:'#991B1B' }}>{ck.name}</div>
                <div style={{ fontSize:12, color:TOKENS.s500, marginTop:1 }}>{ck.detail}</div>
              </div>
            </div>
          ))}

          {diag.aiMarking && (
            <div style={{ marginTop:14, padding:'11px 15px', borderRadius:8, display:'flex', alignItems:'center', gap:12,
              background: diag.aiMarking.ready ? '#F0FDF4' : TOKENS.s100,
              border:`1px solid ${diag.aiMarking.ready ? TOKENS.accentEmerald+'55' : TOKENS.line}` }}>
              <div style={{ width:9, height:9, borderRadius:'50%', background: diag.aiMarking.ready?TOKENS.accentEmerald:TOKENS.s400, flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12.5, fontWeight:800, color:TOKENS.ink }}>
                  AI marking: {diag.aiMarking.ready ? 'ACTIVE' : 'OFF — teachers mark by hand'}
                </div>
                <div style={{ fontSize:11.5, color:TOKENS.s500, marginTop:1 }}>{diag.aiMarking.note}</div>
              </div>
              {diag.aiMarking.ready && (
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:14, fontWeight:900, color:TOKENS.crimson }}>${(diag.aiMarking.stats?.estCostUSD||0).toFixed(2)}</div>
                  <div style={{ fontSize:10, color:TOKENS.s400 }}>{diag.aiMarking.usedToday||0} / {diag.aiMarking.dailyCap} today</div>
                </div>
              )}
            </div>
          )}

          {(diag.classes||[]).length>0 && (
            <div style={{ marginTop:16, borderTop:`1.5px solid ${TOKENS.line}`, paddingTop:14 }}>
              <div style={{ fontSize:11, fontWeight:800, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>Recent live classes</div>
              {diag.classes.map(cl=>(
                <div key={cl._id} style={{ border:`1px solid ${cl.result==='OK'?TOKENS.accentEmerald+'55':'#FCA5A5'}`, background:cl.result==='OK'?'#F0FDF4':'#FEF2F2', borderRadius:8, padding:'11px 14px', marginBottom:8 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <span style={{ fontSize:13, fontWeight:800, color:TOKENS.ink }}>{cl.title}</span>
                    <span style={{ fontSize:10.5, fontWeight:700, padding:'2px 7px', borderRadius:99, background:TOKENS.s100, color:TOKENS.s700 }}>{cl.status}</span>
                    <span style={{ fontSize:11.5, color:TOKENS.s500 }}>{cl.subject} · {cl.curriculum}</span>
                  </div>
                  <div style={{ display:'flex', gap:16, marginTop:7, flexWrap:'wrap', fontSize:11.5, color:TOKENS.s600 }}>
                    <span><strong>{cl.students}</strong> students</span>
                    <span><strong>{cl.questionsForSubject}</strong> qns for subject</span>
                    <span><strong>{cl.questionsForLesson===null?'—':cl.questionsForLesson}</strong> qns for lesson</span>
                    <span><strong>{cl.homeworkCreated}</strong> homework created</span>
                  </div>
                  <div style={{ fontSize:11.5, color:TOKENS.s500, marginTop:5 }}>Lesson: {cl.lesson}</div>
                  {cl.blocker && <div style={{ fontSize:12, fontWeight:700, color:'#991B1B', marginTop:6 }}>{cl.blocker}</div>}
                </div>
              ))}
            </div>
          )}
        </PCard>
      )}

      {/* Filters */}
      <PCard style={{ marginBottom:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
          <input className="fi" placeholder="Search questions..." value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))} style={{ gridColumn:'1/-1' }}/>
          <select className="fsel" value={filter.subject} onChange={e=>setFilter(f=>({...f,subject:e.target.value}))}>
            <option value="">All subjects</option>
            {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select className="fsel" value={filter.curriculum} onChange={e=>setFilter(f=>({...f,curriculum:e.target.value}))}>
            <option value="">All curricula</option>
            {CURRICULA.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select className="fsel" value={filter.difficulty} onChange={e=>setFilter(f=>({...f,difficulty:e.target.value}))}>
            <option value="">Any difficulty</option>
            {DIFFICULTY.map(d=><option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
          </select>
        </div>
      </PCard>

      {/* Table */}
      <PCard style={{ overflow:'hidden', padding:0 }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:TOKENS.s400, fontSize:13 }}>Loading...</div>
        ) : questions.length === 0 ? (
          <div style={{ padding:40, textAlign:'center', color:TOKENS.s400 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>✎</div>
            <div style={{ fontSize:16, fontWeight:700, color:TOKENS.s700, marginBottom:8 }}>No questions yet</div>
            <div style={{ fontSize:13, marginBottom:16 }}>Click "Load Built-in Questions" to seed 100+ questions, or add your own.</div>
            <button onClick={seed} style={{ background:TOKENS.crimson, color:'#fff', border:'none', padding:'10px 20px', borderRadius:8, fontWeight:700, cursor:'pointer' }}>Load Built-in Questions</button>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>{['Subject','Topic','Curriculum','Difficulty','Marks','Question (preview)',''].map(h=><th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {questions.map(q=>(
                <tr key={q._id}>
                  <td style={{ whiteSpace:'nowrap' }}>
                    <div style={{ fontWeight:700, color:TOKENS.ink }}>{q.subject}</div>
                    {q.type && q.type!=='mcq' && (
                      <span style={{ fontSize:9.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'.05em',
                        background:'#EEF2FF', color:'#4338CA', padding:'1px 6px', borderRadius:99 }}>{q.type}</span>
                    )}
                  </td>
                  <td style={{ fontSize:12, color:TOKENS.s500 }}>{q.topic||'—'}</td>
                  <td style={{ fontSize:12, color:TOKENS.s500 }}>{q.curriculum||'—'}</td>
                  <td><span style={{ background:diffColor(q.difficulty)+'22', color:diffColor(q.difficulty), fontWeight:700, fontSize:11, padding:'3px 8px', borderRadius:99, textTransform:'capitalize' }}>{q.difficulty}</span></td>
                  <td style={{ textAlign:'center', fontWeight:700 }}>{q.marks}</td>
                  <td style={{ fontSize:12, color:TOKENS.s700, maxWidth:280 }}>
                    <div style={{ overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{q.questionText}</div>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={()=>{ setEditQ({...q, options:[...q.options]}); setModal(true) }} style={{ background:TOKENS.s100, border:'none', padding:'5px 10px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', color:TOKENS.s700 }}>Edit</button>
                      <button onClick={()=>del(q._id)} style={{ background:'#FEE2E2', border:'none', padding:'5px 10px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', color:'#991B1B' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Pagination */}
        {total > 20 && (
          <div style={{ padding:'12px 20px', borderTop:`1px solid ${TOKENS.s100}`, display:'flex', gap:8, alignItems:'center', justifyContent:'center' }}>
            <button onClick={()=>load(page-1)} disabled={page<=1} style={{ padding:'6px 14px', borderRadius:6, border:`1px solid ${TOKENS.s100}`, background:page<=1?TOKENS.s100:'#fff', cursor:page<=1?'not-allowed':'pointer', fontWeight:600, fontSize:13 }}>← Prev</button>
            <span style={{ fontSize:13, color:TOKENS.s500 }}>Page {page} of {Math.ceil(total/20)}</span>
            <button onClick={()=>load(page+1)} disabled={page>=Math.ceil(total/20)} style={{ padding:'6px 14px', borderRadius:6, border:`1px solid ${TOKENS.s100}`, background:page>=Math.ceil(total/20)?TOKENS.s100:'#fff', cursor:page>=Math.ceil(total/20)?'not-allowed':'pointer', fontWeight:600, fontSize:13 }}>Next →</button>
          </div>
        )}
      </PCard>

      {/* Bulk import */}
      {bulkOpen && (
        <BulkImportModal
          onClose={()=>setBulkOpen(false)}
          onDone={()=>{ setBulkOpen(false); load(page); }}
          toast={toast}
          subjects={SUBJECTS} curricula={CURRICULA}
        />
      )}

      {/* Bulk import modal */}
      {importOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={e=>e.target===e.currentTarget&&setImportOpen(false)}>
          <div style={{ background:'#fff', borderRadius:16, maxWidth:760, width:'100%', maxHeight:'90vh', overflow:'auto' }}>
            <div style={{ background:`linear-gradient(135deg,${TOKENS.crimson},${TOKENS.crimsonDeep})`, padding:'20px 28px', color:'#fff' }}>
              <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:22 }}>Bulk import questions</div>
              <div style={{ fontSize:12.5, opacity:.8, marginTop:4 }}>Paste a JSON array. Duplicates (same text + subject + curriculum) are skipped.</div>
            </div>
            <div style={{ padding:'20px 28px' }}>
              <div style={{ background:TOKENS.cream, border:`1px solid ${TOKENS.s100}`, borderRadius:8, padding:'12px 14px', marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:800, color:TOKENS.crimson, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>Format — one object per question</div>
                <pre style={{ margin:0, fontSize:11.5, lineHeight:1.65, color:TOKENS.s700, whiteSpace:'pre-wrap', fontFamily:'ui-monospace,monospace' }}>{`[{
  "subject": "Biology",
  "curriculum": "EdexcelIGCSE",
  "grade": "Year 10",
  "topic": "Unit 1 \u00b7 Enzymes",
  "subtopic": "Enzyme Action & The Lock-and-Key Model",
  "difficulty": "medium",
  "questionText": "Which model best describes enzyme specificity?",
  "options": ["Lock-and-key", "Random collision", "Osmotic", "Diffusion gradient"],
  "correctAnswer": "Lock-and-key",
  "explanation": "The active site is complementary in shape to the substrate.",
  "marks": 2
}]`}</pre>
                <div style={{ fontSize:11.5, color:TOKENS.s500, marginTop:8, lineHeight:1.6 }}>
                  <strong>subtopic</strong> must match a syllabus-spine lesson name exactly — that is what links the question to the lesson, the quiz game and auto-homework.
                </div>
              </div>
              <textarea value={importTxt} onChange={e=>setImportTxt(e.target.value)} rows={14}
                placeholder='[ { "subject": "Biology", ... } ]'
                style={{ width:'100%', padding:'12px 14px', borderRadius:8, border:`1.5px solid ${TOKENS.s100}`, fontSize:12.5, fontFamily:'ui-monospace,monospace', boxSizing:'border-box', resize:'vertical', color:TOKENS.ink }}/>
              <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:14 }}>
                <button onClick={()=>setImportOpen(false)} style={{ padding:'10px 20px', borderRadius:8, border:`1px solid ${TOKENS.s100}`, background:'transparent', color:TOKENS.s700, fontWeight:600, cursor:'pointer' }}>Cancel</button>
                <button onClick={runImport} disabled={importing||!importTxt.trim()} style={{ padding:'10px 24px', borderRadius:8, background:importing||!importTxt.trim()?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', fontWeight:700, cursor:importing?'not-allowed':'pointer' }}>
                  {importing ? 'Importing...' : 'Import questions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Question Editor Modal */}
      {modal && editQ && (
        <QuestionEditorModal
          q={editQ}
          onClose={()=>setModal(false)}
          onSave={save}
          subjects={SUBJECTS}
          curricula={CURRICULA}
        />
      )}
    </div>
  )
}

function ArtworkRow({ q, toast, onDone }) {
  const [busy, setBusy] = useState(false)
  const [url,  setUrl]  = useState('')
  const [cap,  setCap]  = useState(q.imageCaption || '')
  const [err,  setErr]  = useState('')

  const upload = async (file) => {
    if (!file) return
    setBusy(true); setErr('')
    try {
      const fd = new FormData(); fd.append('file', file)
      const r = await api.post('/questions/upload', fd, { headers:{ 'Content-Type':'multipart/form-data' } })
      const u = r.data?.attachment?.url
      if (u) setUrl(u)
      else setErr('Upload returned no URL.')
    } catch(e) {
      setErr(e?.response?.data?.message || 'Upload failed — paste a /question-images/... path instead.')
    }
    setBusy(false)
  }

  const attach = async () => {
    if (!url) { setErr('Upload a file or type a path first.'); return }
    setBusy(true)
    try {
      await api.patch('/questions/'+q._id+'/image', { imageUrl:url, imageCaption:cap })
      toast?.ok?.('Artwork attached — question is now live.')
      onDone?.()
    } catch(e) { setErr(e?.response?.data?.message || 'Could not attach.') }
    setBusy(false)
  }

  return (
    <div style={{ border:`1px solid ${TOKENS.line}`, borderRadius:10, padding:'14px 16px', marginBottom:10, background:'#FBFAF5' }}>
      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:6 }}>
        <span style={{ fontSize:10, fontWeight:800, background:'#EEF2FF', color:'#4338CA', padding:'2px 7px', borderRadius:99 }}>
          {q.lessonCode || '—'}
        </span>
        <span style={{ fontSize:12, fontWeight:700, color:TOKENS.ink }}>{q.subtopic || q.subject}</span>
        <span style={{ fontSize:11.5, color:TOKENS.s400 }}>{q.marks} marks</span>
      </div>
      <div style={{ fontSize:13, color:TOKENS.s700, lineHeight:1.6, marginBottom:8 }}>{q.questionText}</div>

      {q.imageDescription && (
        <div style={{ background:'#fff', border:`1px dashed ${TOKENS.gold}`, borderRadius:7, padding:'10px 13px', marginBottom:10 }}>
          <div style={{ fontSize:10, fontWeight:800, color:'#9A7B16', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>Diagram needed</div>
          <div style={{ fontSize:12.5, color:TOKENS.s700, lineHeight:1.65 }}>{q.imageDescription}</div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
        <input className="fi" value={url} onChange={e=>setUrl(e.target.value)} placeholder="Upload below, or type /question-images/name.png"/>
        <input className="fi" value={cap} onChange={e=>setCap(e.target.value)} placeholder="Caption, e.g. Fig 1: leaf cross-section"/>
      </div>

      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <input type="file" accept="image/*" disabled={busy}
          onChange={e=>upload(e.target.files?.[0])} style={{ fontSize:12 }}/>
        <button onClick={attach} disabled={busy||!url} style={{
          background: busy||!url ? TOKENS.s300 : TOKENS.accentEmerald, color:'#fff', border:'none',
          padding:'8px 16px', borderRadius:7, fontWeight:700, fontSize:12.5, cursor: busy||!url?'not-allowed':'pointer' }}>
          {busy ? 'Working...' : 'Attach & publish'}
        </button>
        {url && <img src={url} alt="" style={{ height:44, borderRadius:4, border:`1px solid ${TOKENS.line}` }}
          onError={e=>{ e.currentTarget.style.display='none' }}/>}
      </div>

      {err && <div style={{ marginTop:8, fontSize:12, color:'#991B1B' }}>{err}</div>}
    </div>
  )
}

function BulkImportModal({ onClose, onDone, toast, subjects, curricula }) {
  const [defs, setDefs] = useState({ subject:'Biology', curriculum:'EdexcelIGCSE', grade:'Year 10', topic:'', subtopic:'', difficulty:'medium' })
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [spine, setSpine] = useState([])

  useEffect(() => {
    if (!defs.subject) return
    api.get('/questions/spine', { params:{ subject:defs.subject, curriculum:defs.curriculum } })
      .then(r=>setSpine(r.data?.data?.topics||[])).catch(()=>setSpine([]))
  }, [defs.subject, defs.curriculum])

  const chosen = spine.find(t=>t.topic===defs.topic)
  const lineCount = text.split(/\r?\n/).filter(l=>l.trim()).length

  const submit = async () => {
    if (!text.trim()) { toast?.error?.('Paste some questions first.'); return }
    setBusy(true)
    try {
      const r = await api.post('/questions/bulk', { text, defaults: defs })
      const d = r.data?.data
      toast?.ok?.(r.data?.message || 'Imported.')
      if (d?.errors?.length) console.warn('[bulk import] errors:', d.errors)
      if (d?.inserted > 0) onDone()
    } catch(e) { toast?.error?.(e?.response?.data?.message || 'Import failed.') }
    setBusy(false)
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#fff', borderRadius:16, maxWidth:820, width:'100%', maxHeight:'92vh', overflow:'auto' }}>
        <div style={{ background:`linear-gradient(135deg,${TOKENS.crimson},${TOKENS.crimsonDeep})`, padding:'20px 28px', color:'#fff' }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'rgba(255,255,255,.55)' }}>Question Bank</div>
          <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:23, marginTop:2 }}>Bulk import questions</div>
        </div>
        <div style={{ padding:'22px 28px' }}>

          <div style={{ background:'#FBFAF5', border:`1px solid ${TOKENS.s100}`, borderRadius:10, padding:'14px 16px', marginBottom:18 }}>
            <div style={{ fontSize:12, fontWeight:800, color:TOKENS.ink, marginBottom:6 }}>Format — one question per line, fields separated by <code style={{ background:'#fff', padding:'1px 5px', borderRadius:4 }}>|</code> or a tab</div>
            <div style={{ fontSize:12, color:TOKENS.s600, fontFamily:'monospace', lineHeight:1.7, whiteSpace:'pre-wrap' }}>
{`Question text | Option A | Option B | Option C | Option D | Correct | Explanation | Marks | Difficulty`}
            </div>
            <div style={{ fontSize:12, color:TOKENS.s500, marginTop:8, lineHeight:1.6 }}>
              <strong>Correct</strong> can be the letter (A/B/C/D) or the full option text. Marks and Difficulty are optional.
              Spreadsheet users: copy straight from Excel/Sheets — tabs are handled.
            </div>
            <div style={{ fontSize:11.5, color:TOKENS.s500, marginTop:8, fontFamily:'monospace', background:'#fff', padding:'8px 10px', borderRadius:6, border:`1px solid ${TOKENS.s100}` }}>
              Which organelle is the site of aerobic respiration? | Mitochondria | Ribosome | Nucleus | Chloroplast | A | Mitochondria carry out aerobic respiration, producing ATP. | 1 | easy
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12, marginBottom:16 }}>
            <div className="fg"><label className="fl">Subject</label>
              <select className="fsel" value={defs.subject} onChange={e=>setDefs(d=>({...d,subject:e.target.value,topic:'',subtopic:''}))}>
                {subjects.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl">Curriculum</label>
              <select className="fsel" value={defs.curriculum} onChange={e=>setDefs(d=>({...d,curriculum:e.target.value,topic:'',subtopic:''}))}>
                {curricula.map(x=><option key={x} value={x}>{x}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl">Grade / Year</label>
              <input className="fi" value={defs.grade} onChange={e=>setDefs(d=>({...d,grade:e.target.value}))}/>
            </div>
            <div className="fg"><label className="fl">Default difficulty</label>
              <select className="fsel" value={defs.difficulty} onChange={e=>setDefs(d=>({...d,difficulty:e.target.value}))}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            <div className="fg"><label className="fl">Topic {spine.length>0?'(from spine)':''}</label>
              {spine.length>0 ? (
                <select className="fsel" value={defs.topic} onChange={e=>setDefs(d=>({...d,topic:e.target.value,subtopic:''}))}>
                  <option value="">— all / none —</option>
                  {spine.map(t=><option key={t._id} value={t.topic}>{t.code?t.code+' · ':''}{t.topic}</option>)}
                </select>
              ) : <input className="fi" value={defs.topic} onChange={e=>setDefs(d=>({...d,topic:e.target.value}))} placeholder="Topic"/>}
            </div>
            <div className="fg"><label className="fl">Lesson / subtopic</label>
              {chosen && (chosen.subtopics||[]).length>0 ? (
                <select className="fsel" value={defs.subtopic} onChange={e=>setDefs(d=>({...d,subtopic:e.target.value}))}>
                  <option value="">— whole topic —</option>
                  {chosen.subtopics.map((s,i)=><option key={i} value={s.name}>{s.code?s.code+' · ':''}{s.name}</option>)}
                </select>
              ) : <input className="fi" value={defs.subtopic} onChange={e=>setDefs(d=>({...d,subtopic:e.target.value}))} placeholder="Subtopic (lesson)"/>}
            </div>
          </div>

          <div className="fg"><label className="fl">Questions ({lineCount} line{lineCount===1?'':'s'})</label>
            <textarea className="fi" rows={12} value={text} onChange={e=>setText(e.target.value)}
              style={{ fontFamily:'monospace', fontSize:12.5, lineHeight:1.6 }}
              placeholder="Paste your questions here, one per line..."/>
          </div>

          <div style={{ display:'flex', gap:12, justifyContent:'flex-end', paddingTop:10 }}>
            <button onClick={onClose} style={{ padding:'10px 20px', borderRadius:8, border:`1px solid ${TOKENS.s100}`, background:'transparent', color:TOKENS.s700, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            <button onClick={submit} disabled={busy||!lineCount} style={{ padding:'10px 24px', borderRadius:8, background:busy||!lineCount?TOKENS.s300:TOKENS.crimson, color:'#fff', border:'none', fontWeight:700, cursor:busy||!lineCount?'not-allowed':'pointer' }}>
              {busy?'Importing...':`Import ${lineCount} question${lineCount===1?'':'s'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuestionEditorModal({ q, onClose, onSave, subjects, curricula }) {
  const [form, setForm] = useState(() => ({
    type:'mcq', options:['','','',''],
    markScheme:{ modelAnswer:'', points:[], acceptableAnswers:[], commonErrors:[] },
    ...q,
    markScheme: { modelAnswer:'', points:[], acceptableAnswers:[], commonErrors:[], ...(q.markScheme||{}) },
  }))
  const upd    = (k,v) => setForm(f=>({...f,[k]:v}))
  const updOpt = (i,v) => { const o=[...form.options]; o[i]=v; setForm(f=>({...f,options:o})) }
  const updMS  = (k,v) => setForm(f=>({...f, markScheme:{...f.markScheme,[k]:v}}))

  const [uploading, setUploading] = useState(false)
  const [upErr,     setUpErr]     = useState('')
  const isMCQ = form.type === 'mcq'
  const pts   = form.markScheme.points || []
  const schemeTotal = pts.reduce((s,p)=>s+(Number(p.marks)||0),0)

  const addPoint = () => updMS('points', [...pts, { text:'', marks:1, keywords:[] }])
  const setPoint = (i,k,v) => { const n=pts.map((p,j)=> j===i?{...p,[k]:v}:p); updMS('points', n) }
  const delPoint = (i) => updMS('points', pts.filter((_,j)=>j!==i))

  const TYPES = [
    ['mcq',     'Multiple choice', 'Marks itself instantly'],
    ['short',   'Short answer',    'Typed, 1-3 marks'],
    ['long',    'Long answer',     'Typed, 4-8 marks'],
    ['essay',   'Essay',           'Extended writing'],
    ['drawing', 'Diagram',         'Student draws or labels'],
  ]

  const canSave = form.questionText && (
    isMCQ ? (form.correctAnswer && form.options.filter(Boolean).length >= 2)
          : (form.markScheme.modelAnswer || pts.length || (form.markScheme.acceptableAnswers||[]).length)
  )

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#fff', borderRadius:16, maxWidth:720, width:'100%', maxHeight:'92vh', overflow:'auto' }}>
        <div style={{ background:`linear-gradient(135deg,${TOKENS.crimson},${TOKENS.crimsonDeep})`, padding:'20px 28px', color:'#fff' }}>
          <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontSize:22 }}>{form._id?'Edit Question':'New Question'}</div>
        </div>
        <div style={{ padding:'22px 28px', display:'grid', gap:16 }}>

          {/* Type selector */}
          <div className="fg"><label className="fl">Question type</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:8 }}>
              {TYPES.map(([id,label,hint])=>(
                <button key={id} onClick={()=>upd('type',id)} style={{
                  padding:'10px 8px', borderRadius:9, cursor:'pointer', textAlign:'center',
                  border:`2px solid ${form.type===id?TOKENS.crimson:TOKENS.s100}`,
                  background:form.type===id?'#FDE7EC':'#fff',
                }}>
                  <div style={{ fontSize:12.5, fontWeight:700, color:form.type===id?TOKENS.crimson:TOKENS.ink }}>{label}</div>
                  <div style={{ fontSize:10, color:TOKENS.s400, marginTop:2 }}>{hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="fr2">
            <div className="fg"><label className="fl">Subject</label>
              <select className="fsel" value={form.subject||''} onChange={e=>upd('subject',e.target.value)}>
                {(subjects||[]).map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl">Curriculum</label>
              <select className="fsel" value={form.curriculum||''} onChange={e=>upd('curriculum',e.target.value)}>
                <option value="">All curricula</option>
                {(curricula||[]).map(x=><option key={x} value={x}>{x}</option>)}
              </select>
            </div>
          </div>

          <div className="fr2">
            <div className="fg"><label className="fl">Topic (spine unit)</label>
              <input className="fi" value={form.topic||''} onChange={e=>upd('topic',e.target.value)} placeholder="e.g. Unit 1 · Enzymes"/>
            </div>
            <div className="fg"><label className="fl">Subtopic — must match the spine lesson exactly</label>
              <input className="fi" value={form.subtopic||''} onChange={e=>upd('subtopic',e.target.value)} placeholder="e.g. Enzyme Action & The Lock-and-Key Model"/>
            </div>
          </div>

          <div className="fr2">
            <div className="fg"><label className="fl">Grade / Year</label>
              <input className="fi" value={form.grade||''} onChange={e=>upd('grade',e.target.value)} placeholder="Year 10"/>
            </div>
            <div className="fg"><label className="fl">Difficulty</label>
              <select className="fsel" value={form.difficulty||'medium'} onChange={e=>upd('difficulty',e.target.value)}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="fg"><label className="fl">Question text</label>
            <textarea className="fi" rows={3} value={form.questionText||''} onChange={e=>upd('questionText',e.target.value)}
              placeholder="Use plain text: x^2, sqrt(50), 3/4, pi, 37 degrees Celsius"/>
          </div>

          {/* MCQ branch */}
          {isMCQ && (
            <>
              <div className="fg"><label className="fl">Options — click Set correct on the right answer</label>
                {[0,1,2,3].map(i=>(
                  <div key={i} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12,
                      background: form.options[i] && form.options[i]===form.correctAnswer ? TOKENS.accentEmerald : TOKENS.s100,
                      color: form.options[i] && form.options[i]===form.correctAnswer ? '#fff' : TOKENS.s500 }}>{['A','B','C','D'][i]}</div>
                    <input className="fi" value={form.options[i]||''} onChange={e=>updOpt(i,e.target.value)} placeholder={`Option ${['A','B','C','D'][i]}`} style={{ flex:1 }}/>
                    <button onClick={()=>upd('correctAnswer',form.options[i])} disabled={!form.options[i]} style={{ padding:'6px 12px', borderRadius:6, whiteSpace:'nowrap', fontSize:11, fontWeight:700, cursor:form.options[i]?'pointer':'not-allowed',
                      border:`1.5px solid ${form.options[i]===form.correctAnswer?TOKENS.accentEmerald:TOKENS.s100}`,
                      background:form.options[i]===form.correctAnswer?TOKENS.accentEmerald+'20':'transparent',
                      color:form.options[i]===form.correctAnswer?TOKENS.accentEmerald:TOKENS.s500 }}>
                      {form.options[i]===form.correctAnswer?'✓ Correct':'Set correct'}
                    </button>
                  </div>
                ))}
              </div>
              <div className="fg"><label className="fl">Explanation shown after answering</label>
                <textarea className="fi" rows={2} value={form.explanation||''} onChange={e=>upd('explanation',e.target.value)}
                  placeholder="Why the answer is right, and why the tempting wrong option is wrong."/>
              </div>
            </>
          )}

          {/* Mark scheme branch */}
          {!isMCQ && (
            <>
              <div style={{ background:TOKENS.goldPale, border:`1px solid ${TOKENS.gold}55`, borderRadius:8, padding:'11px 15px', fontSize:12.5, color:TOKENS.s700, lineHeight:1.6 }}>
                This type cannot mark itself. The mark scheme below is what a teacher marks against — and what AI marking would use if you switch it on later. A question without one cannot be saved.
              </div>

              <div className="fg"><label className="fl">Model answer — full marks response</label>
                <textarea className="fi" rows={3} value={form.markScheme.modelAnswer||''} onChange={e=>updMS('modelAnswer',e.target.value)}
                  placeholder="Write the answer a student would give to earn every mark."/>
              </div>

              <div className="fg">
                <label className="fl">Mark points — one per mark available</label>
                {pts.map((p,i)=>(
                  <div key={i} style={{ border:`1px solid ${TOKENS.s100}`, borderRadius:8, padding:'10px 12px', marginBottom:8, background:'#FBFAF5' }}>
                    <div style={{ display:'flex', gap:8, marginBottom:6 }}>
                      <input className="fi" value={p.text||''} onChange={e=>setPoint(i,'text',e.target.value)} placeholder={`Point ${i+1} — what earns this mark`} style={{ flex:1 }}/>
                      <input className="fi" type="number" min="1" value={p.marks||1} onChange={e=>setPoint(i,'marks',parseInt(e.target.value)||1)} style={{ width:64 }}/>
                      <button onClick={()=>delPoint(i)} style={{ padding:'0 11px', borderRadius:6, border:'1px solid #FCA5A5', background:'#fff', color:'#991B1B', cursor:'pointer' }}>×</button>
                    </div>
                    <input className="fi" value={(p.keywords||[]).join(', ')} onChange={e=>setPoint(i,'keywords',e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
                      placeholder="Accept any of these words, comma separated — e.g. osmosis, water moves in"/>
                  </div>
                ))}
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <button onClick={addPoint} style={{ fontSize:12, color:TOKENS.crimson, background:'transparent', border:`1px solid ${TOKENS.s100}`, padding:'6px 13px', borderRadius:6, cursor:'pointer', fontWeight:700 }}>+ Add mark point</button>
                  <span style={{ fontSize:12, fontWeight:700, color: schemeTotal===form.marks?TOKENS.accentEmerald:TOKENS.s500 }}>
                    Scheme totals {schemeTotal} / question worth {form.marks}
                    {schemeTotal!==form.marks && schemeTotal>0 ? ' — these should match' : ''}
                  </span>
                </div>
              </div>

              {(form.type==='short') && (
                <div className="fg"><label className="fl">Accepted alternative answers, comma separated</label>
                  <input className="fi" value={(form.markScheme.acceptableAnswers||[]).join(', ')}
                    onChange={e=>updMS('acceptableAnswers', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
                    placeholder="magnesium, magnesium ions, magnesium deficiency"/>
                </div>
              )}

              <div className="fg"><label className="fl">Common errors not to credit, comma separated</label>
                <input className="fi" value={(form.markScheme.commonErrors||[]).join(', ')}
                  onChange={e=>updMS('commonErrors', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
                  placeholder="Saying the plant cell bursts, Confusing excretion with egestion"/>
              </div>

              {form.type==='drawing' && (
                <>
                  <div style={{ background:'#EEF2FF', border:'1px solid #C7D2FE', borderRadius:8, padding:'11px 15px', fontSize:12.5, color:'#3730A3', lineHeight:1.7 }}>
                    <strong>No image needed</strong> if the student does the drawing. Only add one when the student must read a diagram you supply.
                  </div>
                  <div className="fg"><label className="fl">Upload an image</label>
                    <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                      <input type="file" accept="image/*" onChange={async e=>{
                        const f = e.target.files?.[0]; if(!f) return
                        setUploading(true); setUpErr('')
                        try {
                          const fd = new FormData(); fd.append('file', f)
                          const r = await api.post('/questions/upload', fd, { headers:{ 'Content-Type':'multipart/form-data' } })
                          const url = r.data?.attachment?.url
                          if (url) upd('imageUrl', url)
                          else setUpErr('Upload succeeded but returned no URL.')
                        } catch(err) {
                          setUpErr(err?.response?.data?.message || 'Upload failed. Use the manual path below instead.')
                        }
                        setUploading(false)
                      }} style={{ fontSize:12.5 }}/>
                      {uploading && <span style={{ fontSize:12, color:TOKENS.s500 }}>Uploading...</span>}
                    </div>
                    {upErr && (
                      <div style={{ marginTop:8, fontSize:12, color:'#991B1B', background:'#FEF2F2', border:'1px solid #FCA5A5', borderRadius:6, padding:'8px 11px', lineHeight:1.6 }}>
                        {upErr}
                        <br/>Fallback: commit the file to <code>frontend/public/question-images/</code> and type <code>/question-images/name.png</code> below.
                      </div>
                    )}
                  </div>
                  <div className="fr2">
                    <div className="fg"><label className="fl">Image path or URL</label>
                      <input className="fi" value={form.imageUrl||''} onChange={e=>upd('imageUrl',e.target.value)} placeholder="/question-images/leaf-cross-section.png"/>
                    </div>
                    <div className="fg"><label className="fl">Caption</label>
                      <input className="fi" value={form.imageCaption||''} onChange={e=>upd('imageCaption',e.target.value)} placeholder="Fig 1: cross-section through a leaf"/>
                    </div>
                  </div>
                  {form.imageUrl && (
                    <div className="fg"><label className="fl">Preview — if this is blank the path is wrong</label>
                      <div style={{ border:`1.5px dashed ${TOKENS.line}`, borderRadius:8, padding:12, textAlign:'center', background:'#FBFAF5', minHeight:80 }}>
                        <img src={form.imageUrl} alt="" style={{ maxWidth:'100%', maxHeight:220, borderRadius:4 }}
                          onError={e=>{ e.currentTarget.style.display='none'; const n=e.currentTarget.nextSibling; if(n) n.style.display='block' }}
                          onLoad={e=>{ e.currentTarget.style.display='block'; const n=e.currentTarget.nextSibling; if(n) n.style.display='none' }}/>
                        <div style={{ display:'none', fontSize:12.5, color:'#991B1B', fontWeight:700, padding:'20px 0' }}>
                          Image not found at this path — check the file is committed and the name matches exactly, including capitals.
                        </div>
                        {form.imageCaption && <div style={{ fontSize:11.5, color:TOKENS.s500, marginTop:8, fontStyle:'italic' }}>{form.imageCaption}</div>}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          <div className="fg" style={{ maxWidth:150 }}><label className="fl">Marks</label>
            <input className="fi" type="number" min="1" max="30" value={form.marks||1} onChange={e=>upd('marks',parseInt(e.target.value)||1)}/>
          </div>

          <div style={{ display:'flex', gap:12, justifyContent:'flex-end', paddingTop:6 }}>
            <button onClick={onClose} style={{ padding:'10px 20px', borderRadius:8, border:`1px solid ${TOKENS.s100}`, background:'transparent', color:TOKENS.s700, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            <button onClick={()=>onSave(form)} disabled={!canSave} style={{ padding:'10px 24px', borderRadius:8, background:canSave?TOKENS.crimson:TOKENS.s300, color:'#fff', border:'none', fontWeight:700, cursor:canSave?'pointer':'not-allowed' }}>
              {form._id?'Update Question':'Add Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionBankModule
