import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast, useAuth } from '../context/ctx.jsx'
import { api } from '../context/ctx.jsx'

export default function ResetPasswordPage() {
  const nav = useNavigate()
  const toast = useToast()
  const { login } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validate = () => {
    setError('')
    
    if (!password || !confirmPassword) {
      setError('Both fields are required')
      return false
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    
    return true
  }

  const submit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setLoading(true)
    try {
      const response = await api.post('/auth/reset-password', {
        newPassword: password
      })
      
      if (response.status === 200) {
        setSuccess(true)
        toast.ok('Password reset successful!')
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          // Get user role from localStorage
          const user = JSON.parse(localStorage.getItem('sm_user') || '{}')
          nav(`/${user.role || 'student'}`)
        }, 2000)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Password reset failed'
      setError(errorMsg)
      toast.error(errorMsg)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Arial, sans-serif'
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
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ marginTop: 0, color: '#22C55E' }}>Password Reset Successful!</h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Your password has been updated. Redirecting to dashboard...
          </p>
        </div>
      </div>
    )
  }

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
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{
          marginTop: 0,
          marginBottom: '10px',
          color: '#333',
          fontSize: '28px',
          textAlign: 'center'
        }}>
          Set Your Password
        </h1>
        
        <p style={{
          color: '#666',
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '14px'
        }}>
          This is your first time logging in. Please set a secure password for your account.
        </p>

        <form onSubmit={submit}>
          {error && (
            <div style={{
              background: '#FEE2E2',
              color: '#991B1B',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid #FECACA'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  fontFamily: 'Arial, sans-serif'
                }}
              />
            </div>
            <p style={{
              fontSize: '12px',
              color: '#999',
              marginTop: '6px',
              margin: '6px 0 0 0'
            }}>
              Minimum 8 characters
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif'
              }}
            />
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#666'
          }}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              style={{ marginRight: '8px', cursor: 'pointer' }}
            />
            Show passwords
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.background = '#5568d3'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.background = '#667eea'
            }}
          >
            {loading ? 'Resetting...' : 'Reset Password & Continue'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #eee',
          textAlign: 'center'
        }}>
          <button
            onClick={() => nav('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

