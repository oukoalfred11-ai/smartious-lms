/**
 * PHASE 7: Auth Guard Service
 * Handles authentication checks and forcePasswordChange redirects
 */

/**
 * Check if user needs to reset password
 * @param {object} user - User document
 * @returns {boolean} True if user must reset password
 */
function needsPasswordReset(user) {
  return user && user.forcePasswordChange === true;
}

/**
 * Get auth guard data for frontend
 * @param {object} user - Authenticated user
 * @returns {object} Guard data with redirect info
 */
function getAuthGuardData(user) {
  if (!user) {
    return {
      isAuthenticated: false,
      needsPasswordReset: false,
      redirectTo: '/login'
    };
  }

  return {
    isAuthenticated: true,
    needsPasswordReset: needsPasswordReset(user),
    redirectTo: needsPasswordReset(user) ? '/account/secure-reset' : null,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    }
  };
}

module.exports = {
  needsPasswordReset,
  getAuthGuardData
};

