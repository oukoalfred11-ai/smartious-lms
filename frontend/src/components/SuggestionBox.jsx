/**
 * components/SuggestionBox.jsx
 * Floating suggestion box available to every signed-in user.
 * Submissions go to the main administrator's Suggestions module.
 */
import React, { useState } from 'react'
import { api } from '../context/ctx.jsx'

const CATS = [['academics','Academics'],['teaching','Teaching quality'],['portal','Portal and technology'],['fees','Fees and billing'],['wellbeing','Student wellbeing'],['other','Other']]

export default function SuggestionBox() {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState('other')
  const [message, setMessage] = useState('')
  const [state, setState] = useState('')     // '', sending, sent, error text

  const send = async () => {
    if (!message.trim()) { setState('Write your suggestion first.'); return }
    setState('sending')
    try {
      await api.post('/suggestions', { category, message })
      setState('sent'); setMessage('')
      setTimeout(() => { setOpen(false); setState('') }, 2200)
    } catch (e) { setState(e?.response?.data?.message || 'Could not send. Try again.') }
  }

  return (
    <>
      <button onClick={() => { setOpen(true); setState('') }} title="Suggestion Box"
        style={{ position:'fixed', bottom:22, right:22, zIndex:250, background:'#7D1025', color:'#F0CC5A', border:'2px solid #C9A030', borderRadius:999, padding:'10px 18px', fontSize:12.5, fontWeight:800, cursor:'pointer', boxShadow:'0 6px 20px rgba(125,16,37,.35)', fontFamily:'Arial, sans-serif' }}>
        Suggestion Box
      </button>
      {open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(8,12,20,.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:16 }} onClick={() => setOpen(false)}>
          <div style={{ background:'#fff', borderRadius:14, padding:'26px 28px', width:460, maxWidth:'94vw', fontFamily:'Arial, sans-serif' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily:'Georgia, serif', fontSize:19, fontWeight:700, color:'#7D1025' }}>Suggestion Box</div>
            <div style={{ fontSize:12.5, color:'#6B7280', margin:'6px 0 14px' }}>
              Share an idea or concern with the school administration. Every suggestion is read by the Director.
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ width:'100%', padding:'9px 12px', border:'1px solid #E8E2D6', borderRadius:8, fontSize:13, marginBottom:12, boxSizing:'border-box' }}>
              {CATS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} maxLength={2000}
              placeholder="Your suggestion..."
              style={{ width:'100%', boxSizing:'border-box', padding:'12px 14px', border:'1px solid #E8E2D6', borderRadius:10, fontSize:13.5, lineHeight:1.6, resize:'vertical', background:'#FDFAF4' }} />
            {state && state !== 'sending' && (
              <div style={{ fontSize:12.5, fontWeight:700, marginTop:8, color: state==='sent' ? '#065F46' : '#B91C1C' }}>
                {state === 'sent' ? 'Thank you. Your suggestion has been delivered.' : state}
              </div>
            )}
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:14 }}>
              <button onClick={() => setOpen(false)} style={{ background:'#FDFAF4', color:'#080C14', border:'1px solid #E8E2D6', padding:'9px 16px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>Close</button>
              <button disabled={state==='sending'} onClick={send} style={{ background:'#7D1025', color:'#fff', border:'none', padding:'9px 18px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                {state==='sending' ? 'Sending...' : 'Send suggestion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
