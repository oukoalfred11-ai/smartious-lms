/**
 * PHASE 7: Secure Password Reset Page
 * Users with temporary credentials must reset their password here first login
 * Only "Logout" and "Change Password" buttons are active
 */

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SecureResetPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/secure-reset`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess(true);
        
        // Show success message
        const message = response.data.message || 'Password changed successfully!';
        console.log('✓', message);

        // Update local user data to clear forcePasswordChange flag
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.forcePasswordChange = false;
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      console.error('✗', errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '32px 24px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>
            🔒 Secure Password Reset
          </h1>
          <p style={{ margin: '0', fontSize: '14px', opacity: 0.9 }}>
            Your account requires a password change for security
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '32px 24px' }}>
          {success && (
            <div style={{
              background: '#d4edda',
              color: '#155724',
              padding: '16px',
              borderRadius: '4px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <strong>✓ Success!</strong>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                Your password has been changed. Redirecting to dashboard...
              </p>
            </div>
          )}

          {errors.submit && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '16px',
              borderRadius: '4px',
              marginBottom: '24px'
            }}>
              <strong>✗ Error</strong>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                {errors.submit}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Current Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Current Password (Temporary)
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter your temporary password"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.currentPassword ? '2px solid #dc3545' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
              />
              {errors.currentPassword && (
                <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Create a new secure password"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.newPassword ? '2px solid #dc3545' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {errors.newPassword && (
                <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.newPassword}
                </p>
              )}
              <p style={{
                fontSize: '12px',
                color: '#666',
                margin: '4px 0 0 0'
              }}>
                At least 8 characters recommended
              </p>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.confirmPassword ? '2px solid #dc3545' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {errors.confirmPassword && (
                <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* PHASE 7: Only Change Password button is active */}
            <button
              type="submit"
              disabled={isLoading || success}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isLoading || success ? 'not-allowed' : 'pointer',
                opacity: isLoading || success ? 0.6 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              {isLoading ? 'Updating Password...' : 'Change Password & Continue'}
            </button>
          </form>

          <hr style={{
            margin: '24px 0',
            border: 'none',
            borderTop: '1px solid #eee'
          }} />

          {/* PHASE 7: Logout button is the only other active button */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#5a6268'}
            onMouseOut={(e) => e.target.style.background = '#6c757d'}
          >
            🚪 Logout
          </button>

          {/* Info Box */}
          <div style={{
            background: '#e7f3ff',
            border: '1px solid #b3d9ff',
            borderRadius: '4px',
            padding: '12px',
            marginTop: '20px',
            fontSize: '13px',
            color: '#004085'
          }}>
            <strong>ℹ️ Security Info:</strong>
            <p style={{ margin: '8px 0 0 0' }}>
              You must set a new password before accessing the dashboard. This is a one-time requirement for account security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

