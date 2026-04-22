import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ctx.jsx'
import { api } from '../context/ctx.jsx'

export default function VerifyEmailPage() {
  const nav = useNavigate()
  const toast = useToast()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Get token from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search)
        const tokenFromUrl = urlParams.get('token')
        const tokenFromStorage = localStorage.getItem('sm_verify_token')
        const token = tokenFromUrl || tokenFromStorage

        if (!token) {
          setStatus('error')
          setMessage('No verification token provided. Please check your email link.')
          return
        }

        // Send verification request
        const response = await api.post('/auth/verify-email', { token })

        if (response.status === 200) {
          setStatus('success')
          setMessage(response.data.message || 'Email verified successfully!')
          toast.ok('Email verified! Redirecting to password reset...')
          
          // Redirect to password reset after 3 seconds
          setTimeout(() => {
            nav('/reset-password')
          }, 3000)
        }
      } catch (error) {
        setStatus('error')
        const errorMsg = error.response?.data?.message || error.message
        setMessage(errorMsg)
        toast.error(errorMsg)
      }
    }

    verifyToken()
  }, [nav, toast])

  // Countdown timer
  useEffect(() => {
    if (status !== 'success') return
    
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer)
          return 0
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        textAlign: 'center'
      }}>
        {status === 'verifying' && (
          <>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              animation: 'spin 2s linear infinite'
            }}>⏳</div>
            <h1 style={{ marginTop: 0, color: '#333' }}>Verifying Email...</h1>
            <p style={{ color: '#666', fontSize: '16px' }}>
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>✅</div>
            <h1 style={{ marginTop: 0, color: '#22C55E' }}>Email Verified!</h1>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>
              {message}
            </p>
            <p style={{ color: '#999', fontSize: '14px' }}>
              Redirecting in {countdown} seconds...
            </p>
            <button
              onClick={() => nav('/reset-password')}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Continue to Password Reset
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>❌</div>
            <h1 style={{ marginTop: 0, color: '#EF4444' }}>Verification Failed</h1>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>
              {message}
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => nav('/login')}
                style={{
                  flex: 1,
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

