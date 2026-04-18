/**
 * PHASE 7: Auth Guard Component
 * Redirects users who need to reset their password to the secure reset page
 * Disables navigation except for logout and change password
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function AuthGuard({ user, children }) {
  const navigate = useNavigate();

  useEffect(() => {
    // PHASE 7: Check if user needs to reset password
    if (user && user.forcePasswordChange === true) {
      // Redirect to secure password reset page
      navigate('/account/secure-reset', { replace: true });
    }
  }, [user, navigate]);

  // If user needs password change, don't render any content
  // (they'll be redirected by the effect above)
  if (user && user.forcePasswordChange === true) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2>Redirecting...</h2>
          <p>Please set a new password to continue.</p>
        </div>
      </div>
    );
  }

  return children;
}

