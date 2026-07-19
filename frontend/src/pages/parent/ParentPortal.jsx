import { useState, useEffect, useRef } from 'react'
import { useToast, api, useAuth } from '../../context/ctx.jsx'
import { useStore } from '../../context/ctx.jsx'

const I = (d) => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{__html:d}}/>

const PAGES = {
  dashboard:'Dashboard', progress:'Academic Progress', lessons:'Live Lessons',
  programme:'Programme Details', messages:'Messages', tutor:'Tutor & Advisor',
  payments:'Fees & Payments', mshauri:'Mshauri AI',
}
const mCol = (pct) => pct >= 70 ? 'var(--g600)' : pct >= 50 ? 'var(--a600)' : 'var(--r500)'

// ── PROGRESS RING ─────────────────────────────────────────
function ProgressRing({ pct = 0, size = 92, stroke = 9, label, sublabel }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, pct))
  const dash = (clamped / 100) * circ
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, width:size+24 }}>
      <div style={{ position:'relative', width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1ECDD" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F5C518" strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`}
            style={{ transition:'stroke-dasharray 1s ease' }} />
        </svg>
        <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}}>
          <span className="mono" style={{ fontSize:size*0.26, fontWeight:700, color:'var(--s900)', lineHeight:1 }}>{clamped}%</span>
          {sublabel && <span style={{ fontSize:9.5, color:'var(--s400)', marginTop:2 }}>{sublabel}</span>}
        </div>
      </div>
      {label && <div style={{ fontSize:12, fontWeight:600, color:'var(--s700)', textAlign:'center', lineHeight:1.3, maxWidth:size+20 }}>{label}</div>}
    </div>
  )
}

const initials = (name) => (name || '').split(/\s+/).filter(Boolean).slice(0,2).map(w => w[0]?.toUpperCase()).join('') || '?'

// ── TEACHER CARD ──────────────────────────────────────────
function TeacherCard({ teacher, onEmail }) {
  if (!teacher) return null
  const name = teacher.name || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Teacher'
  const quals = Array.isArray(teacher.qualifications) ? teacher.qualifications : []
  const specs = Array.isArray(teacher.specializations) ? teacher.specializations : []
  return (
    <div className="card" style={{display:'flex',gap:14,alignItems:'flex-start',flexWrap:'wrap'}}>
      {teacher.avatar ? (
        <img src={teacher.avatar} alt={name}
          style={{width:72,height:72,borderRadius:'50%',objectFit:'cover',flexShrink:0,border:'2px solid var(--border)'}}/>
      ) : (
        <div style={{width:72,height:72,borderRadius:'50%',background:'#3B82F620',color:'#3B82F6',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:22,fontWeight:700,fontFamily:'JetBrains Mono,monospace',flexShrink:0}}>
          {initials(name)}
        </div>
      )}
      <div style={{flex:1,minWidth:200}}>
        <div className="serif" style={{fontSize:18,color:'var(--s900)',marginBottom:2}}>{name}</div>
        {teacher.jobTitle && (
          <div style={{fontSize:13,color:'var(--s500)',marginBottom:6}}>
            {teacher.jobTitle}
            {teacher.yearsOfExperience > 0 && ` · ${teacher.yearsOfExperience} years experience`}
          </div>
        )}
        {(specs.length > 0 || teacher.subjectName) && (
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:teacher.bio?8:0}}>
            {teacher.subjectName && (
              <span style={{background:'var(--b50)',color:'var(--b700)',fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:99}}>
                {teacher.subjectName}{teacher.curriculum ? ` · ${teacher.curriculum}` : ''}
              </span>
            )}
            {specs.slice(0,4).map((s,i) => (
              <span key={i} style={{background:'var(--bg)',color:'var(--s700)',fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:99,border:'1px solid var(--border)'}}>{s}</span>
            ))}
          </div>
        )}
        {teacher.bio && (
          <div style={{fontSize:12.5,color:'var(--s600)',lineHeight:1.6,marginBottom:8}}>{teacher.bio}</div>
        )}
        {quals.length > 0 && (
          <div style={{fontSize:11.5,color:'var(--s400)',marginBottom:10}}>
            <strong style={{color:'var(--s600)'}}>Qualifications:</strong> {quals.join(' · ')}
          </div>
        )}
        {teacher.email && (
          <button className="btn btn-p btn-sm" onClick={() => onEmail(teacher)}>
            Email {name.split(' ')[0]}
          </button>
        )}
      </div>
    </div>
  )
}

// ── PAYMENT STATUS BADGE ──────────────────────────────────
function PayBadge({ status }) {
  const s = (status || '').toLowerCase()
  const cfg = s === 'success' || s === 'confirmed' || s === 'paid'
    ? { cls:'badge-green', label:'Paid' }
    : s === 'pending'
    ? { cls:'badge-amber', label:'Pending' }
    : s === 'failed'
    ? { cls:'badge-red', label:'Failed' }
    : { cls:'badge-blue', label: status || 'Recorded' }
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
}

export default function ParentPortal() {
  const toast = useToast()
  const store = useStore()
  const { user } = useAuth()
  const [page, setPage] = useState('dashboard')

  const [aiMsgs, setAiMsgs] = useState([
    {role:'ai', text:"Habari! I am Mshauri. Ask me anything about your child's progress, the curriculum, or how to support their learning at home."}
  ])
  const [aiInp, setAiInp] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const parentName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Parent'

  // ── Children ──────────────────────────────────────────
  const [children, setChildren] = useState([])
  const [childrenLoading, setChildrenLoading] = useState(true)
  const [selectedChildId, setSelectedChildId] = useState(null)

  // Per-child data
  const [overview, setOverview] = useState(null)
  const [progress, setProgress] = useState(null)
  const [childLoading, setChildLoading] = useState(false)

  // Live classes
  const [liveClasses, setLiveClasses] = useState([])
  const [liveLoading, setLiveLoading] = useState(false)

  // Teachers
  const [teachers, setTeachers] = useState([])
  const [teachersLoading, setTeachersLoading] = useState(false)

  // Compose message
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeRecipients, setComposeRecipients] = useState([])
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [composeSending, setComposeSending] = useState(false)
  const [messageHistory, setMessageHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // ── Payment state ─────────────────────────────────────
  const [payAmount, setPayAmount] = useState('')
  const [payDescription, setPayDescription] = useState('')
  const [payLoading, setPayLoading] = useState(false)

  // Real payment history from backend
  const [payHistory, setPayHistory] = useState([])
  const [payHistoryLoading, setPayHistoryLoading] = useState(false)
  const payHistoryFetched = useRef(false)

  // Fee summary from backend
  const [feeSummary, setFeeSummary] = useState(null)

  // ── Fetch children ─────────────────────────────────────
  useEffect(() => {
    api.get('/parents/my-children')
      .then(({data}) => {
        if (data?.success) {
          const kids = data.data?.children || []
          setChildren(kids)
          if (kids.length > 0) setSelectedChildId(kids[0]._id)
        }
      })
      .catch(() => toast.error('Could not load your children.'))
      .finally(() => setChildrenLoading(false))
  }, [])

  // ── Fetch overview + progress ──────────────────────────
  useEffect(() => {
    if (!selectedChildId) { setOverview(null); setProgress(null); setLiveClasses([]); setTeachers([]); return }
    setChildLoading(true)
    Promise.all([
      api.get('/parents/child/' + selectedChildId + '/overview'),
      api.get('/parents/child/' + selectedChildId + '/progress'),
    ])
      .then(([ov, pr]) => {
        if (ov.data?.success) setOverview(ov.data.data)
        if (pr.data?.success) setProgress(pr.data.data)
      })
      .catch(() => toast.error("Could not load your child's data."))
      .finally(() => setChildLoading(false))
  }, [selectedChildId])

  // ── Fetch live classes ─────────────────────────────────
  useEffect(() => {
    if (!selectedChildId) return
    if (page !== 'lessons' && page !== 'dashboard') return
    setLiveLoading(true)
    api.get('/parents/child/' + selectedChildId + '/live-classes')
      .then(({data}) => {
        if (data?.success) setLiveClasses(data.data?.classes || data.data || [])
        else setLiveClasses([])
      })
      .catch(() => {
        api.get('/timetable/student/' + selectedChildId)
          .then(({data}) => setLiveClasses(data?.data?.entries || data?.entries || []))
          .catch(() => setLiveClasses([]))
      })
      .finally(() => setLiveLoading(false))
  }, [selectedChildId, page])

  // ── Fetch teacher profiles ────────────────────────────
  useEffect(() => {
    if (!overview || !Array.isArray(overview.allocations) || overview.allocations.length === 0) {
      setTeachers([]); return
    }
    setTeachersLoading(true)
    const teacherIds = [...new Set(overview.allocations.map(a => a.teacherId).filter(Boolean))]
    if (teacherIds.length === 0) {
      const fromAlloc = overview.allocations.map(a => ({
        _id: a.teacherId, name: a.teacher, subjectName: a.subjectName, curriculum: a.curriculum,
        email: a.teacherEmail, avatar: a.teacherAvatar, jobTitle: a.teacherJobTitle,
        bio: a.teacherBio, qualifications: a.teacherQualifications,
        specializations: a.teacherSpecializations, yearsOfExperience: a.teacherYearsOfExperience,
      }))
      setTeachers(fromAlloc); setTeachersLoading(false); return
    }
    api.post('/parents/teachers/by-ids', { ids: teacherIds })
      .then(({data}) => {
        if (data?.success) {
          const profiles = data.data?.teachers || []
          const merged = overview.allocations.map(a => {
            const p = profiles.find(t => String(t._id) === String(a.teacherId)) || {}
            return { ...p, _id: a.teacherId,
              name: p.firstName ? `${p.firstName} ${p.lastName || ''}`.trim() : (a.teacher || 'Teacher'),
              subjectName: a.subjectName, curriculum: a.curriculum }
          })
          setTeachers(merged)
        }
      })
      .catch(() => {
        setTeachers(overview.allocations.map(a => ({
          _id: a.teacherId, name: a.teacher, subjectName: a.subjectName, curriculum: a.curriculum,
        })))
      })
      .finally(() => setTeachersLoading(false))
  }, [overview])

  // ── Fetch message history ─────────────────────────────
  useEffect(() => {
    if (page !== 'messages') return
    setHistoryLoading(true)
    api.get('/communication/parent/history')
      .then(({data}) => { if (data?.success) setMessageHistory(data.data?.history || []) })
      .catch(() => setMessageHistory([]))
      .finally(() => setHistoryLoading(false))
  }, [page])

  // ── Fetch payment history + fee summary (once, on first payments visit) ──
  useEffect(() => {
    if (page !== 'payments') return
    if (!payHistoryFetched.current) {
      payHistoryFetched.current = true
      setPayHistoryLoading(true)
      // Fetch real payment records
      api.get('/payments/my-payments')
        .then(({data}) => {
          if (data?.success) setPayHistory(data.data?.payments || [])
        })
        .catch(() => {
          // Endpoint not built yet — fall back to store cache
          setPayHistory(store.payments || [])
        })
        .finally(() => setPayHistoryLoading(false))
      // Fetch fee summary (outstanding balance, next due date, etc.)
      api.get('/payments/my-fee-summary')
        .then(({data}) => { if (data?.success) setFeeSummary(data.data) })
        .catch(() => { /* no fee summary endpoint yet — use defaults */ })
    }
  }, [page])

  const selectedChild = children.find(c => c._id === selectedChildId) || null
  const subjects = (progress?.subjects || []).map(s => ({
    name: s.name, score: s.progressPct, col: s.color || '#7D1025',
    total: s.totalLessons, mastered: s.masteredLessons,
  }))
  const avgScore = progress?.overallPct || 0
  const announcements = store.getAnnouncements('parent')

  // ── Mshauri ───────────────────────────────────────────
  const sendAi = async () => {
    if (!aiInp.trim() || aiLoading) return
    const q = aiInp.trim(); setAiInp(''); setAiLoading(true)
    setAiMsgs(m => [...m, {role:'user', text:q}])
    try {
      const {data} = await api.post('/auth/mshauri', { message: q })
      setAiMsgs(m => [...m, {role:'ai', text: data.reply || 'Let me look into that for you.'}])
    } catch {
      setAiMsgs(m => [...m, {role:'ai', text:"Sorry, I couldn't reach the tutoring service just now. Please try again in a moment."}])
    }
    setAiLoading(false)
  }

  // ── Compose helpers ───────────────────────────────────
  const emailTeacher = (teacher) => {
    if (!teacher || !teacher.email) { toast.error('No email on file for this teacher.'); return }
    const tName = teacher.name || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
    setComposeRecipients([{email: teacher.email, name: tName}])
    setComposeSubject(selectedChild ? `Re: ${selectedChild.name}` : '')
    setComposeBody(`Dear ${tName.split(' ')[0] || 'Teacher'},\n\n`)
    setComposeOpen(true)
    setPage('messages')
  }

  const sendMessage = async () => {
    if (!composeSubject.trim()) { toast.error('Subject is required'); return }
    if (!composeBody.trim())    { toast.error('Message body is required'); return }
    if (composeRecipients.length === 0) { toast.error('Pick at least one recipient'); return }
    setComposeSending(true)
    try {
      const {data} = await api.post('/communication/parent/send', {
        subject: composeSubject.trim(), body: composeBody,
        recipientEmails: composeRecipients, childId: selectedChildId,
      })
      if (data?.success) {
        toast.ok(data.message || 'Message sent.')
        setComposeOpen(false); setComposeRecipients([]); setComposeSubject(''); setComposeBody('')
        api.get('/communication/parent/history')
          .then(({data}) => { if (data?.success) setMessageHistory(data.data?.history || []) })
          .catch(() => {})
      } else {
        toast.error(data?.message || 'Could not send message.')
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not send message. Please try again.')
    }
    setComposeSending(false)
  }

  // ── Paystack ──────────────────────────────────────────
  const loadPaystackScript = () => new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve(true)
    const existing = document.querySelector('script[src*="paystack"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(true))
      existing.addEventListener('error', () => reject(new Error('Paystack failed to load')))
      return
    }
    const s = document.createElement('script')
    s.src = 'https://js.paystack.co/v1/inline.js'
    s.async = true
    s.onload = () => resolve(true)
    s.onerror = () => reject(new Error('Paystack failed to load'))
    document.head.appendChild(s)
  })

  const startPaystack = async () => {
    const amt = parseInt(payAmount, 10)
    if (!amt || amt < 1) { toast.error('Enter an amount'); return }
    if (!user?.email) { toast.error('Your account has no email on file. Contact admin.'); return }
    setPayLoading(true)
    try {
      let paystackKey = ''
      let reference = ''
      try {
        const {data} = await api.post('/payments/paystack/initiate', {
          amount: amt,
          email: user.email,
          description: payDescription || 'Fee payment',
          childId: selectedChildId,
        })
        if (data?.success) {
          paystackKey = data.publicKey || ''
          reference = data.reference || ''
        }
      } catch {
        // Backend not built yet — fall back to client-only inline
        paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ''
      }

      if (!paystackKey) {
        toast.error('Payment is not yet configured. Please contact admin to enable Paystack.')
        setPayLoading(false)
        return
      }

      await loadPaystackScript()

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount: amt * 100,
        currency: 'KES',
        ref: reference || ('SM-' + Date.now()),
        metadata: {
          custom_fields: [
            { display_name: 'Parent', variable_name: 'parent_name', value: parentName },
            { display_name: 'Child',  variable_name: 'child',       value: selectedChild?.name || '' },
            { display_name: 'Description', variable_name: 'description', value: payDescription || '' },
          ],
        },
        callback: function(response) {
          api.post('/payments/paystack/verify', { reference: response.reference })
            .then(({data}) => {
              if (data?.success) {
                toast.ok('Payment confirmed! Reference: ' + response.reference)
                const newPay = {
                  _id: response.reference,
                  description: payDescription || 'Fee payment',
                  amount: amt,
                  amountDisplay: 'KES ' + amt.toLocaleString(),
                  method: 'Paystack',
                  reference: response.reference,
                  status: 'success',
                  createdAt: new Date().toISOString(),
                }
                setPayHistory(h => [newPay, ...h])
                store.addPayment({ desc: payDescription || 'Fee payment', amount: 'KES ' + amt.toLocaleString(), method: 'Paystack', ref: response.reference })
                // Update fee summary outstanding balance if present
                setFeeSummary(s => s && s.outstandingBalance != null
                  ? { ...s, outstandingBalance: Math.max(0, s.outstandingBalance - amt) }
                  : s)
                setPayAmount(''); setPayDescription('')
                // Reset so next visit to payments page re-fetches
                payHistoryFetched.current = false
              } else {
                toast.error('Payment received but verification failed. Contact admin with reference: ' + response.reference)
              }
            })
            .catch(() => {
              toast.ok('Payment ref: ' + response.reference + ' — verification pending.')
              const newPay = {
                _id: response.reference,
                description: payDescription || 'Fee payment',
                amount: amt,
                amountDisplay: 'KES ' + amt.toLocaleString(),
                method: 'Paystack',
                reference: response.reference,
                status: 'pending',
                createdAt: new Date().toISOString(),
              }
              setPayHistory(h => [newPay, ...h])
              store.addPayment({ desc: payDescription || 'Fee payment', amount: 'KES ' + amt.toLocaleString(), method: 'Paystack', ref: response.reference })
              setPayAmount(''); setPayDescription('')
            })
        },
        onClose: function() {
          toast.info('Payment cancelled.')
        },
      })
      handler.openIframe()
    } catch (e) {
      toast.error(e?.message || 'Could not start payment.')
    }
    setPayLoading(false)
  }

  // ── Format live class ─────────────────────────────────
  const formatLiveClass = (c) => ({
    id: c._id || c.id,
    title: c.title || c.subject || c.subjectName || 'Lesson',
    teacher: c.teacherName || c.teacher || (c.teacherId?.firstName ? `${c.teacherId.firstName} ${c.teacherId.lastName}` : ''),
    startTime: c.startTime || c.startsAt || c.start || '',
    endTime: c.endTime || c.endsAt || c.end || '',
    dayOfWeek: c.dayOfWeek || '',
    meetingLink: c.meetingLink || c.zoomUrl || c.joinUrl || '',
    status: c.status || (c.isLive ? 'live' : 'scheduled'),
    isLive: c.isLive || c.status === 'live',
  })

  // ── Fee summary helpers ───────────────────────────────
  const monthlyRate = feeSummary?.monthlyRate ?? store.fees?.individual_premium ?? 2999
  const outstanding = feeSummary?.outstandingBalance
  const nextDueDate = feeSummary?.nextDueDate
  const nextDueAmount = feeSummary?.nextDueAmount

  // ── Quick-fill amounts driven by fee summary ──────────
  const quickAmounts = feeSummary?.quickAmounts || [2999, 4999, 9999, 14999]

  const NAV = [
    {id:'dashboard',  label:'Dashboard',          svg:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>'},
    {id:'progress',   label:'Academic Progress',  svg:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'},
    {id:'lessons',    label:'Live Lessons',        svg:'<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>', live:true},
    {id:'programme',  label:'Programme Details',   svg:'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'},
    {id:'messages',   label:'Messages',            svg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'},
    {id:'tutor',      label:'Tutor & Advisor',     svg:'<circle cx="12" cy="8" r="4"/><path d="M6 21v-1a6 6 0 0 1 12 0v1"/>'},
    {id:'payments',   label:'Fees & Payments',     svg:'<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>'},
    {id:'mshauri',    label:'Mshauri AI',          svg:'<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>'},
  ]

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="sb-mark"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M5 11.5v4.5a7 7 0 0 0 14 0v-4.5"/></svg></div>
          <div><div className="sb-text">Smartious<span>.</span></div><div className="sb-sub">Parent Portal</div></div>
        </div>
        <nav style={{flex:1, paddingTop:8}}>
          <div className="sb-sec">Child Overview</div>
          {NAV.slice(0,6).map(item => (
            <div key={item.id} className={`nav-item${page===item.id?' active':''}`} onClick={()=>setPage(item.id)}>
              <div className="nav-icon">{I(item.svg)}</div>
              <span className="sb-lbl">{item.label}</span>
              {item.live && <div className="sb-live-dot"/>}
            </div>
          ))}
          <div className="sb-sec">Finance & AI</div>
          {NAV.slice(6).map(item => (
            <div key={item.id} className={`nav-item${page===item.id?' active':''}`} onClick={()=>setPage(item.id)}>
              <div className="nav-icon">{I(item.svg)}</div>
              <span className="sb-lbl">{item.label}</span>
            </div>
          ))}
        </nav>
        {children.length > 0 && (
          <div style={{padding:'10px 12px',borderTop:'1px solid var(--border)'}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--s400)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>
              {children.length > 1 ? 'Viewing Child' : 'Child'}
            </div>
            {children.length > 1 ? (
              <select value={selectedChildId || ''} onChange={e => setSelectedChildId(e.target.value)}
                style={{width:'100%',padding:'7px 9px',borderRadius:8,border:'1px solid var(--border)',fontSize:13,fontFamily:'inherit',fontWeight:600,color:'var(--s800)'}}>
                {children.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            ) : (
              <div style={{fontSize:13.5,fontWeight:700,color:'var(--s800)'}}>{children[0].name}</div>
            )}
          </div>
        )}
        <div className="sb-user">
          <div style={{width:36,height:36,borderRadius:'50%',background:'#8B5CF620',color:'#8B5CF6',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'JetBrains Mono,monospace',fontSize:12,fontWeight:700}}>
            {((user?.firstName?.[0]||'')+(user?.lastName?.[0]||'')).toUpperCase() || 'P'}
          </div>
          <div className="sb-uinfo">
            <div className="sb-uname">{parentName}</div>
            <div className="sb-urole">Parent{selectedChild ? ' · ' + selectedChild.name : ''}</div>
          </div>
        </div>
        <div className="sb-back" onClick={() => window.location.href='/'}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          <span className="sb-lbl">Back to Website</span>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="tb-title">{PAGES[page]}</div>
          <div className="tb-right">
            <button className="btn btn-s btn-sm" onClick={()=>setPage('messages')}>Messages</button>
          </div>
        </div>

        <div className="content" style={{animation:'fadeIn .25s ease'}}>

          {/* ── DASHBOARD ── */}
          {page==='dashboard' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Welcome back</div><h1 className="serif" style={{fontSize:28,color:'var(--s900)'}}>Hello, <em style={{color:'var(--b700)'}}>{user?.firstName || parentName}</em></h1></div>
              {childrenLoading ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s400)'}}>Loading…</div>
              ) : children.length === 0 ? (
                <div className="card" style={{padding:'48px 32px',textAlign:'center'}}>
                  <div className="serif" style={{fontSize:22,color:'var(--s900)',marginBottom:8}}>No child linked yet</div>
                  <div style={{fontSize:13.5,color:'var(--s500)',maxWidth:420,margin:'0 auto',lineHeight:1.6}}>
                    Your account isn't linked to a student yet. Please contact the Smartious administration to link your child to your account.
                  </div>
                </div>
              ) : (
                <>
                  <div style={{background:'linear-gradient(135deg,#7D1025,#5A0B1B)',borderRadius:'var(--rxl)',padding:'24px 28px',marginBottom:24,display:'flex',gap:20,flexWrap:'wrap',alignItems:'center'}}>
                    <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(255,255,255,.15)',border:'3px solid rgba(255,255,255,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700,color:'#fff',fontFamily:'JetBrains Mono,monospace',flexShrink:0}}>
                      {initials(selectedChild?.name)}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:22,fontWeight:700,color:'#fff',marginBottom:4}}>{selectedChild?.name}</div>
                      <div style={{fontSize:13.5,color:'rgba(255,255,255,.7)',marginBottom:12}}>
                        {[overview?.child?.programme, overview?.child?.deliveryMode, overview?.child?.curriculum, overview?.child?.grade].filter(Boolean).join(' · ')}
                      </div>
                      <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
                        {[
                          [`${avgScore}%`,'Overall Progress'],
                          [`${overview?.stats?.allocatedSubjects ?? 0}`,'Subjects w/ Teacher'],
                          [`${overview?.stats?.enrolledSubjects ?? 0}`,'Enrolled Subjects'],
                        ].map(([v,l]) => (
                          <div key={l}><div style={{fontSize:10,color:'rgba(255,255,255,.5)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em'}}>{l}</div><div className="mono" style={{fontSize:16,fontWeight:700,color:'#fff'}}>{v}</div></div>
                        ))}
                      </div>
                    </div>
                    <div style={{display:'flex',gap:10}}>
                      <button className="btn" style={{background:'rgba(255,255,255,.9)',color:'#7D1025',fontWeight:700,borderColor:'transparent'}} onClick={()=>setPage('progress')}>Full Progress →</button>
                    </div>
                  </div>
                  {childLoading ? (
                    <div className="card" style={{padding:30,textAlign:'center',color:'var(--s400)'}}>Loading progress…</div>
                  ) : (
                    <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20,marginTop:8}}>
                      <div className="card">
                        <div className="chdr"><div className="ctitle">Subject Progress</div><button className="btn btn-g btn-sm" onClick={()=>setPage('progress')}>Full Report</button></div>
                        {subjects.length === 0 ? (
                          <div style={{padding:'20px 0',color:'var(--s400)',fontSize:13,textAlign:'center'}}>No subjects with progress yet.</div>
                        ) : (
                          <div style={{display:'flex',flexWrap:'wrap',gap:14,justifyContent:'center',paddingTop:6}}>
                            {subjects.map(s => <ProgressRing key={s.name} pct={s.score} label={s.name} sublabel={`${s.mastered}/${s.total}`} />)}
                          </div>
                        )}
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:14}}>
                        <div className="card">
                          <div className="ctitle" style={{marginBottom:12}}>Quick Actions</div>
                          {[['Live Lessons','lessons'],['Programme & Teachers','programme'],['Ask Mshauri AI','mshauri'],['Pay Fees','payments']].map(([l,p]) => (
                            <button key={l} className="btn btn-s btn-sm" style={{width:'100%',justifyContent:'flex-start',marginBottom:6}} onClick={()=>setPage(p)}>{l}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── ACADEMIC PROGRESS ── */}
          {page==='progress' && (
            <div>
              <div style={{marginBottom:20}}>
                <div className="sec-tag">{selectedChild ? selectedChild.name + (overview?.child?.curriculum ? ' · ' + overview.child.curriculum : '') : 'Academic Progress'}</div>
                <h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Academic <em style={{color:'var(--b700)'}}>Progress</em></h2>
              </div>
              {childrenLoading || childLoading ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s400)'}}>Loading…</div>
              ) : !selectedChild ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s500)'}}>No child linked to your account yet.</div>
              ) : (
                <>
                  <div className="kpi-grid" style={{marginBottom:24}}>
                    {[
                      {v:`${avgScore}%`,l:'Overall Progress',d:'Across all subjects',dc:'var(--g600)'},
                      {v:`${(progress?.subjects||[]).length}`,l:'Subjects',d:'With an allocated teacher',dc:'var(--b700)'},
                      {v:`${(progress?.subjects||[]).reduce((s,x)=>s+x.masteredLessons,0)}`,l:'Lessons Mastered',d:'Marked by teachers',dc:'var(--g600)'},
                      {v:`${(progress?.subjects||[]).reduce((s,x)=>s+x.totalLessons,0)}`,l:'Total Lessons',d:'Published in subjects',dc:'var(--a600)'},
                    ].map((k,i) => (
                      <div key={i} className="kpi"><div className="kpi-v">{k.v}</div><div className="kpi-l">{k.l}</div><div className="kpi-d" style={{color:k.dc}}>{k.d}</div></div>
                    ))}
                  </div>
                  <div className="card">
                    <div className="ctitle" style={{marginBottom:14}}>Subject Breakdown</div>
                    {(progress?.subjects || []).length === 0 ? (
                      <div style={{padding:'20px 0',color:'var(--s400)',fontSize:13,textAlign:'center'}}>No subject progress yet.</div>
                    ) : (
                      <>
                        <div style={{display:'flex',flexWrap:'wrap',gap:16,justifyContent:'center',paddingBottom:18,marginBottom:8,borderBottom:'1px solid var(--border)'}}>
                          {(progress?.subjects || []).map((s,i) => <ProgressRing key={i} pct={s.progressPct} label={s.name} sublabel={`${s.masteredLessons}/${s.totalLessons}`} />)}
                        </div>
                        <table className="tbl">
                          <thead><tr><th>Subject</th><th>Curriculum</th><th>Lessons Mastered</th><th>Progress</th><th>Status</th></tr></thead>
                          <tbody>
                            {(progress?.subjects || []).map((s,i) => (
                              <tr key={i}>
                                <td style={{fontWeight:700}}>{s.name}</td>
                                <td style={{color:'var(--s500)',fontSize:13}}>{s.curriculum}</td>
                                <td><span className="mono">{s.masteredLessons}/{s.totalLessons}</span></td>
                                <td><span className="mono" style={{fontWeight:700,color:mCol(s.progressPct)}}>{s.progressPct}%</span></td>
                                <td><span className={`badge ${s.progressPct>=70?'badge-green':s.progressPct>=40?'badge-amber':'badge-red'}`}>{s.progressPct>=70?'On Track':s.progressPct>=40?'In Progress':'Getting Started'}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── LIVE LESSONS ── */}
          {page==='lessons' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Live Classes</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Live Lessons</h2></div>
              {!selectedChild ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s500)'}}>No child linked yet.</div>
              ) : liveLoading ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s400)'}}>Loading classes…</div>
              ) : liveClasses.length === 0 ? (
                <div className="card" style={{padding:'48px 32px',textAlign:'center'}}>
                  <div className="serif" style={{fontSize:18,color:'var(--s900)',marginBottom:8}}>No live classes scheduled yet</div>
                  <div style={{fontSize:13.5,color:'var(--s500)',maxWidth:420,margin:'0 auto',lineHeight:1.6}}>
                    Your child's teachers haven't published a live class schedule yet.
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="ctitle" style={{marginBottom:14}}>{selectedChild.name}'s Schedule</div>
                  {liveClasses.map(formatLiveClass).map((c,i) => {
                    const live = c.isLive || c.status === 'live'
                    const done = c.status === 'completed' || c.status === 'done'
                    return (
                      <div key={c.id || i} style={{display:'flex',gap:14,padding:'12px 0',borderBottom:'1px solid var(--border)',flexWrap:'wrap',alignItems:'center'}}>
                        {c.dayOfWeek && <span className="mono" style={{fontWeight:700,color:'var(--b700)',width:42,flexShrink:0}}>{c.dayOfWeek.slice(0,3)}</span>}
                        <div style={{flex:1,minWidth:200}}>
                          <div style={{fontWeight:700,fontSize:14}}>{c.title}</div>
                          <div style={{fontSize:12,color:'var(--s500)'}}>
                            {c.teacher && <>{c.teacher} · </>}
                            {c.startTime}{c.endTime ? ` – ${c.endTime}` : ''}
                          </div>
                        </div>
                        <span className={`badge ${live?'badge-red':done?'badge-green':'badge-blue'}`}>
                          {live?'● Live':done?'Done':'Upcoming'}
                        </span>
                        {live && c.meetingLink && (
                          <a href={c.meetingLink} target="_blank" rel="noopener noreferrer"
                            className="btn btn-p btn-sm" style={{textDecoration:'none'}}>
                            Join to Monitor
                          </a>
                        )}
                        {!live && c.meetingLink && (
                          <button className="btn btn-s btn-sm" onClick={()=>window.open(c.meetingLink, '_blank')}>Link</button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── PROGRAMME DETAILS ── */}
          {page==='programme' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Enrolment</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Programme Details</h2></div>
              {childrenLoading || childLoading ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s400)'}}>Loading…</div>
              ) : !selectedChild ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s500)'}}>No child linked to your account yet.</div>
              ) : (
                <>
                  <div className="card" style={{marginBottom:20}}>
                    <div className="ctitle" style={{marginBottom:14}}>{selectedChild.name.split(' ')[0]}'s Programme</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
                      {[
                        ['Programme', overview?.child?.programme || '—'],
                        ['Delivery Mode', overview?.child?.deliveryMode || '—'],
                        ['Curriculum', overview?.child?.curriculum || '—'],
                        ['Year / Grade', overview?.child?.grade || '—'],
                        ['Admission Number', overview?.child?.admissionNumber || '—'],
                        ['Enrolled Subjects', String(overview?.stats?.enrolledSubjects ?? 0)],
                      ].map(([l,v]) => (
                        <div key={l} style={{padding:'12px 14px',background:'var(--bg)',borderRadius:'var(--rmd)'}}>
                          <div style={{fontSize:10,fontWeight:700,color:'var(--s400)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{l}</div>
                          <div style={{fontSize:14,fontWeight:700,color:'var(--s800)'}}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <h3 className="serif" style={{fontSize:20,color:'var(--s900)',marginBottom:6}}>Your child's teachers</h3>
                  <div style={{fontSize:13,color:'var(--s500)',marginBottom:14}}>Each subject has an allocated teacher. Tap "Email" to send them a message.</div>
                  {teachersLoading ? (
                    <div className="card" style={{padding:30,textAlign:'center',color:'var(--s400)'}}>Loading teacher profiles…</div>
                  ) : teachers.length === 0 ? (
                    <div className="card" style={{padding:30,textAlign:'center',color:'var(--s500)'}}>No teachers allocated yet.</div>
                  ) : (
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(420px,1fr))',gap:14}}>
                      {teachers.map((t,i) => <TeacherCard key={`${t._id||i}-${t.subjectName||i}`} teacher={t} onEmail={emailTeacher}/>)}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── TUTOR & ADVISOR ── */}
          {page==='tutor' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">Support Team</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Tutor &amp; Advisor</h2></div>
              {teachersLoading || childLoading ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s400)'}}>Loading…</div>
              ) : !selectedChild ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s500)'}}>No child linked yet.</div>
              ) : teachers.length === 0 ? (
                <div className="card" style={{padding:40,textAlign:'center',color:'var(--s500)'}}>
                  No tutors assigned to {selectedChild.name} yet.
                </div>
              ) : (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(420px,1fr))',gap:14}}>
                  {teachers.map((t,i) => <TeacherCard key={`tutor-${t._id||i}-${i}`} teacher={t} onEmail={emailTeacher}/>)}
                </div>
              )}
            </div>
          )}

          {/* ── MESSAGES ── */}
          {page==='messages' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,marginBottom:20}}>
                <div><div className="sec-tag">Communication</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Messages</h2></div>
                {!composeOpen && (
                  <button className="btn btn-p btn-sm" onClick={() => { setComposeOpen(true); setComposeRecipients([]); setComposeSubject(''); setComposeBody('') }}>
                    + New Message
                  </button>
                )}
              </div>

              {composeOpen && (
                <div className="card" style={{marginBottom:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                    <div className="ctitle">New Message</div>
                    <button className="btn btn-s btn-sm" onClick={() => setComposeOpen(false)}>Cancel</button>
                  </div>
                  <div style={{marginBottom:12}}>
                    <label className="fl">To (Teachers & Admin)</label>
                    {composeRecipients.length === 0 ? (
                      <div style={{padding:'12px 14px',background:'var(--bg)',borderRadius:'var(--rmd)',fontSize:13,color:'var(--s500)'}}>
                        Pick a teacher below or click "Email" on any teacher card in Programme Details.
                      </div>
                    ) : (
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {composeRecipients.map((r,i) => (
                          <div key={i} style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--b50)',color:'var(--b700)',padding:'5px 10px',borderRadius:99,fontSize:12,fontWeight:600}}>
                            {r.name || r.email}
                            <button onClick={() => setComposeRecipients(rs => rs.filter((_,j) => j!==i))} style={{background:'transparent',border:'none',color:'inherit',cursor:'pointer',fontSize:14,lineHeight:1,padding:0}}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {teachers.length > 0 && (
                      <div style={{marginTop:10}}>
                        <div style={{fontSize:11,color:'var(--s400)',marginBottom:6}}>Pick from your child's teachers:</div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                          {teachers.filter(t => t.email).map((t,i) => {
                            const tName = t.name || `${t.firstName||''} ${t.lastName||''}`.trim()
                            const already = composeRecipients.some(r => r.email === t.email)
                            return (
                              <button key={i} className="btn btn-s btn-sm" style={{fontSize:11.5}} disabled={already}
                                onClick={() => setComposeRecipients(rs => [...rs, {email: t.email, name: tName}])}>
                                {already ? 'Added: ' : '+ '}{tName}{t.subjectName ? ` (${t.subjectName})` : ''}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{marginBottom:12}}>
                    <label className="fl">Subject</label>
                    <input className="fi" value={composeSubject} onChange={e => setComposeSubject(e.target.value)} placeholder="E.g. Question about Mathematics progress"/>
                  </div>
                  <div style={{marginBottom:14}}>
                    <label className="fl">Message</label>
                    <textarea className="fi" rows={8} value={composeBody} onChange={e => setComposeBody(e.target.value)} placeholder="Type your message…" style={{resize:'vertical',fontFamily:'inherit'}}/>
                  </div>
                  <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                    <button className="btn btn-s btn-sm" onClick={() => setComposeOpen(false)}>Cancel</button>
                    <button className="btn btn-p" onClick={sendMessage} disabled={composeSending}>
                      {composeSending ? 'Sending…' : 'Send Message'}
                    </button>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="ctitle" style={{marginBottom:14}}>Message History</div>
                {historyLoading ? (
                  <div style={{padding:20,color:'var(--s400)',fontSize:13,textAlign:'center'}}>Loading…</div>
                ) : messageHistory.length === 0 ? (
                  <div style={{padding:20,color:'var(--s400)',fontSize:13,textAlign:'center'}}>
                    No messages sent yet. Click "+ New Message" to email your child's teachers.
                  </div>
                ) : messageHistory.map((m,i) => (
                  <div key={m._id || i} style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,flexWrap:'wrap',gap:6}}>
                      <span style={{fontWeight:700,fontSize:13.5}}>{m.subject}</span>
                      <span style={{fontSize:11,color:'var(--s400)'}}>{m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</span>
                    </div>
                    <div style={{fontSize:12,color:'var(--s500)',marginBottom:6}}>
                      To: {m.recipientCount || (m.recipients?.length || 0)} recipient{(m.recipientCount||1) === 1 ? '' : 's'}
                      {m.sentCount !== undefined && <> · Delivered: {m.sentCount}</>}
                    </div>
                    <div style={{fontSize:12.5,color:'var(--s600)',lineHeight:1.5,whiteSpace:'pre-wrap',maxHeight:60,overflow:'hidden'}}>
                      {m.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              FEES & PAYMENTS — connected to real backend
              ══════════════════════════════════════════════ */}
          {page==='payments' && (
            <div>
              <div style={{marginBottom:20}}>
                <div className="sec-tag">Finance</div>
                <h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Fees &amp; Payments</h2>
              </div>

              {/* ── KPI row ── */}
              <div className="kpi-grid" style={{marginBottom:24}}>
                {[
                  {
                    v: 'KES ' + monthlyRate.toLocaleString(),
                    l: 'Monthly Plan',
                    d: 'Individual Premium',
                    dc: 'var(--b700)',
                  },
                  {
                    v: outstanding != null ? 'KES ' + outstanding.toLocaleString() : '—',
                    l: 'Outstanding Balance',
                    d: outstanding > 0 ? 'Due now' : outstanding === 0 ? 'All clear ✓' : 'Loading…',
                    dc: outstanding > 0 ? 'var(--r500)' : 'var(--g600)',
                  },
                  {
                    v: nextDueDate ? new Date(nextDueDate).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : '—',
                    l: 'Next Due Date',
                    d: nextDueAmount ? 'KES ' + nextDueAmount.toLocaleString() : 'Contact admin',
                    dc: 'var(--a600)',
                  },
                  {
                    v: String(payHistory.length || store.payments?.length || 0),
                    l: 'Payments Made',
                    d: 'All-time',
                    dc: 'var(--s500)',
                  },
                ].map((k,i) => (
                  <div key={i} className="kpi">
                    <div className="kpi-v" style={{fontSize:i===0||i===1?14:undefined}}>{k.v}</div>
                    <div className="kpi-l">{k.l}</div>
                    <div className="kpi-d" style={{color:k.dc}}>{k.d}</div>
                  </div>
                ))}
              </div>

              {/* Outstanding balance alert */}
              {outstanding > 0 && (
                <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:'var(--rmd)',padding:'12px 16px',marginBottom:20,display:'flex',gap:12,alignItems:'center'}}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:'#DC2626'}}>Outstanding balance: KES {outstanding.toLocaleString()}</div>
                    {nextDueDate && <div style={{fontSize:12,color:'#991B1B',marginTop:2}}>Due by {new Date(nextDueDate).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</div>}
                  </div>
                  <button className="btn btn-sm" style={{background:'#DC2626',color:'#fff',borderColor:'#DC2626',fontWeight:700,flexShrink:0}}
                    onClick={() => { setPayAmount(String(outstanding)); setPayDescription('Outstanding balance'); }}>
                    Pay Now
                  </button>
                </div>
              )}

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>

                {/* ── Pay Now card ── */}
                <div className="card">
                  <div className="ctitle" style={{marginBottom:6}}>Pay Fees</div>
                  <div style={{fontSize:12.5,color:'var(--s500)',marginBottom:16,lineHeight:1.6}}>
                    Pay via Paystack — Card, M-Pesa, or Bank Transfer. Enter any amount below; useful for partial payments, registration fees, or one-off charges.
                  </div>

                  <div style={{marginBottom:12}}>
                    <label className="fl">Amount (KES) *</label>
                    <input className="fi" type="number" min="1" step="1" value={payAmount}
                      onChange={e => setPayAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="E.g. 5000"/>
                  </div>

                  <div style={{marginBottom:12}}>
                    <label className="fl">What is this payment for?</label>
                    <input className="fi" value={payDescription} onChange={e => setPayDescription(e.target.value)}
                      placeholder="E.g. May fees, Registration, Exam fees"/>
                  </div>

                  {/* Quick-fill buttons — driven by feeSummary if available */}
                  <div style={{marginBottom:6,fontSize:11,color:'var(--s400)',fontWeight:600}}>Quick fill</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:14}}>
                    {quickAmounts.map(q => (
                      <button key={q} className="btn btn-s btn-sm" onClick={() => setPayAmount(String(q))}
                        style={{justifyContent:'space-between'}}>
                        <span className="mono" style={{fontWeight:700}}>KES {q.toLocaleString()}</span>
                      </button>
                    ))}
                    {/* Outstanding shortcut */}
                    {outstanding > 0 && !quickAmounts.includes(outstanding) && (
                      <button className="btn btn-sm" onClick={() => { setPayAmount(String(outstanding)); setPayDescription('Outstanding balance') }}
                        style={{gridColumn:'span 2',justifyContent:'space-between',background:'var(--r50)',borderColor:'#FECACA',color:'#DC2626'}}>
                        <span>Pay outstanding</span>
                        <span className="mono" style={{fontWeight:700}}>KES {outstanding.toLocaleString()}</span>
                      </button>
                    )}
                    {/* Next due shortcut */}
                    {nextDueAmount > 0 && !quickAmounts.includes(nextDueAmount) && nextDueAmount !== outstanding && (
                      <button className="btn btn-sm" onClick={() => { setPayAmount(String(nextDueAmount)); setPayDescription('Monthly fees') }}
                        style={{gridColumn:'span 2',justifyContent:'space-between',background:'var(--a50)',borderColor:'var(--a200)',color:'var(--a700)'}}>
                        <span>Pay next due</span>
                        <span className="mono" style={{fontWeight:700}}>KES {nextDueAmount.toLocaleString()}</span>
                      </button>
                    )}
                  </div>

                  <button className="btn btn-ok" style={{width:'100%',justifyContent:'center'}}
                    onClick={startPaystack} disabled={payLoading || !payAmount}>
                    {payLoading ? 'Starting…' : `Pay KES ${parseInt(payAmount || '0', 10).toLocaleString()} via Paystack`}
                  </button>
                  <div style={{fontSize:11,color:'var(--s400)',marginTop:8,textAlign:'center'}}>
                    Secured by Paystack · Card, M-Pesa, and Bank Transfer accepted
                  </div>
                </div>

                {/* ── Payment history card ── */}
                <div className="card">
                  <div className="ctitle" style={{marginBottom:14}}>Payment History</div>
                  {payHistoryLoading ? (
                    <div style={{padding:20,color:'var(--s400)',fontSize:13,textAlign:'center'}}>Loading…</div>
                  ) : (payHistory.length === 0 && (store.payments||[]).length === 0) ? (
                    <div style={{padding:20,color:'var(--s400)',fontSize:13,textAlign:'center'}}>No payments yet.</div>
                  ) : (
                    [...payHistory, ...(store.payments||[]).filter(sp =>
                      !payHistory.some(rp => rp.reference === sp.ref)
                    )]
                    .slice(0, 10)
                    .map((p, i) => {
                      // Normalise — backend records vs store records have different shapes
                      const date = p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})
                        : (p.date || '—')
                      const desc = p.description || (p.desc||'').split('—')[0].trim() || 'Payment'
                      const amtDisplay = p.amountDisplay || p.amount || (p.amount ? 'KES ' + Number(p.amount).toLocaleString() : '—')
                      const status = p.status || 'success'
                      const ref = p.reference || p.ref || ''
                      return (
                        <div key={p._id || p.ref || i} style={{padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:3}}>
                            <span style={{fontWeight:700,fontSize:13.5,flex:1}}>{desc}</span>
                            <span className="mono" style={{fontWeight:700,fontSize:13,flexShrink:0}}>{amtDisplay}</span>
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                            <span style={{fontSize:11,color:'var(--s400)'}}>{date}{ref ? ` · ${ref.slice(0,14)}…` : ''}</span>
                            <PayBadge status={status}/>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── MSHAURI AI ── */}
          {page==='mshauri' && (
            <div>
              <div style={{marginBottom:20}}><div className="sec-tag">AI Assistant</div><h2 className="serif" style={{fontSize:26,color:'var(--s900)'}}>Mshauri AI</h2></div>
              <div className="card" style={{display:'flex',flexDirection:'column',height:540}}>
                <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',gap:10,alignItems:'center'}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:'var(--b700)',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg></div>
                  <div><div style={{fontWeight:700,fontSize:14}}>Mshauri — Parent Assistant</div><div style={{fontSize:12,color:'var(--g600)'}}>● Online · Powered by Claude AI</div></div>
                </div>
                <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>
                  {aiMsgs.map((m,i) => (
                    <div key={i} style={{display:'flex',gap:8,flexDirection:m.role==='user'?'row-reverse':'row',alignItems:'flex-end'}}>
                      {m.role==='ai'&&<div style={{width:26,height:26,borderRadius:'50%',background:'var(--b700)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'#fff',flexShrink:0}}>M</div>}
                      <div style={{background:m.role==='user'?'var(--b700)':'var(--white)',color:m.role==='user'?'#fff':'var(--s800)',border:m.role==='ai'?'1px solid var(--border)':'none',borderRadius:m.role==='user'?'14px 14px 4px 14px':'4px 14px 14px 14px',padding:'9px 13px',maxWidth:'76%',fontSize:13.5,lineHeight:1.7}}>{m.text}</div>
                    </div>
                  ))}
                  {aiLoading&&<div style={{color:'var(--s400)',fontSize:13,paddingLeft:34}}>Mshauri is thinking…</div>}
                </div>
                <div style={{padding:'10px 14px',borderTop:'1px solid var(--border)'}}>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
                    {["How is my child doing?","Help with study plan","Explain IGCSE"].map(s => (
                      <button key={s} className="btn btn-s btn-sm" style={{fontSize:11.5,padding:'4px 10px'}} onClick={()=>{setAiInp(s);setTimeout(()=>sendAi(),50)}}>{s}</button>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <textarea className="chat-input" value={aiInp} onChange={e=>setAiInp(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAi()}}} rows={1} placeholder="Ask Mshauri about your child's education…" style={{flex:1}}/>
                    <button className="btn btn-p btn-sm" onClick={sendAi} disabled={aiLoading} style={{padding:'7px 10px'}}><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
