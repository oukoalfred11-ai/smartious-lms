/**
 * AssessmentPaymentResult.jsx
 * ============================================================
 * Landing page after Paystack redirects back from payment.
 * Reads query params: status, ref, name, payUrl, reason
 *
 * Rendered at /assessment/payment-result
 * Add to your LandingPage.jsx router alongside /assessment.
 */

import React, { useMemo } from 'react'

const V = {
  cr: '#8B1A2E', gold3: '#C9973A', ink: '#080C14',
  bone: '#FDFAF4', sl: '#52616B', green: '#166534',
}

export default function AssessmentPaymentResult({ nav }) {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const status  = params.get('status')   || 'error'
  const ref     = params.get('ref')      || ''
  const name    = params.get('name')     || 'your child'
  const payUrl  = params.get('payUrl')   || ''
  const reason  = params.get('reason')   || ''

  const isSuccess = status === 'success'
  const isFailed  = status === 'failed'

  return (
    <div style={{ background: V.bone, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: V.ink }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
          background: isSuccess ? V.green : isFailed ? '#B91C1C' : '#6B6B6B',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isSuccess ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )}
        </div>

        {isSuccess && (<>
          <div style={{ fontSize: 11, color: V.gold3, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 10 }}>Payment confirmed</div>
          <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 'clamp(1.6rem,3.4vw,2.2rem)', margin: '0 0 16px', color: V.ink, lineHeight: 1.2 }}>
            Thank you — assessment fee received
          </h1>
          <p style={{ fontSize: 15, color: V.sl, lineHeight: 1.7, marginBottom: 28 }}>
            We've received the assessment fee for <strong style={{ color: V.ink }}>{name}</strong>. Our Head of Admissions will contact you within one business day to schedule the diagnostic assessment at a time that suits your timezone.
          </p>
          {ref && (
            <div style={{ background: '#fff', border: `1px solid #E5E0D2`, borderRadius: 10, padding: '16px 22px', marginBottom: 28, display: 'inline-block' }}>
              <div style={{ fontSize: 11, color: V.sl, marginBottom: 4 }}>Your reference number</div>
              <div style={{ fontSize: 20, fontFamily: 'monospace', color: V.cr, fontWeight: 700 }}>{ref}</div>
            </div>
          )}
          <div style={{ background: '#fff', border: `1px solid #E5E0D2`, borderRadius: 10, padding: '18px 22px', textAlign: 'left', marginBottom: 30 }}>
            <div style={{ fontSize: 11, color: V.gold3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>What to expect</div>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.8, color: V.ink }}>
              <li>Scheduling email within one business day</li>
              <li>Diagnostic assessment across English, Mathematics and Science (~90 minutes)</li>
              <li>Written report with subject-specific recommendations</li>
              <li>30-minute consultation with our Head of Academics</li>
              <li>Curriculum pathway recommendation and enrolment offer where results indicate fit</li>
            </ol>
          </div>
        </>)}

        {isFailed && (<>
          <div style={{ fontSize: 11, color: '#B91C1C', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 10 }}>Payment unsuccessful</div>
          <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 'clamp(1.6rem,3.4vw,2.2rem)', margin: '0 0 16px', color: V.ink, lineHeight: 1.2 }}>
            Your payment was not completed
          </h1>
          <p style={{ fontSize: 15, color: V.sl, lineHeight: 1.7, marginBottom: 28 }}>
            No amount was charged. You can try again using the button below, or contact us at <a href="mailto:hellosmartious@gmail.com" style={{ color: V.cr }}>hellosmartious@gmail.com</a> if you need help.
          </p>
          {payUrl && (
            <a href={payUrl} style={{
              display: 'inline-block', background: V.cr, color: '#fff',
              padding: '14px 32px', borderRadius: 8, fontWeight: 800,
              fontSize: 14, textDecoration: 'none', marginBottom: 24,
            }}>
              Try payment again
            </a>
          )}
          {ref && (
            <div style={{ fontSize: 13, color: V.sl, marginBottom: 20 }}>
              Reference: <span style={{ fontFamily: 'monospace', color: V.cr, fontWeight: 700 }}>{ref}</span>
            </div>
          )}
        </>)}

        {!isSuccess && !isFailed && (<>
          <div style={{ fontSize: 11, color: '#6B6B6B', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 10 }}>Something went wrong</div>
          <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 'clamp(1.6rem,3.4vw,2.2rem)', margin: '0 0 16px', color: V.ink }}>
            We couldn't confirm your payment
          </h1>
          <p style={{ fontSize: 15, color: V.sl, lineHeight: 1.7, marginBottom: 28 }}>
            Please email <a href="mailto:hellosmartious@gmail.com" style={{ color: V.cr }}>hellosmartious@gmail.com</a> with your reference number and we'll sort this out right away.
            {reason && <><br/><span style={{ fontSize: 12, opacity: .6, marginTop: 8, display: 'block' }}>Technical detail: {reason}</span></>}
          </p>
        </>)}

        <button onClick={() => nav('/')} style={{
          background: 'transparent', color: V.cr, border: `1.5px solid ${V.cr}`,
          padding: '11px 26px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>
          Back to Smartious
        </button>
      </div>
    </div>
  )
}
