/**
 * PHASE 5: Credentials Generation & Dispatch Service
 * Handles secure temporary password generation and tracking
 */

const crypto = require('crypto');

/**
 * Generate a cryptographically secure 12-character temporary password
 * @returns {string} Temporary password
 */
function generateTemporaryPassword() {
  // Generate 12 characters using secure random bytes
  // Use alphanumeric characters (A-Z, a-z, 0-9) for easier reading
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  
  const randomBytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
}

/**
 * Check if credentials email has already been sent today
 * @param {object} user - User document
 * @returns {boolean} True if credentials have been sent today
 */
function hasCredentialsBeenSentToday(user) {
  if (!user.lastCredentialsSentAt) {
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastSentDate = new Date(user.lastCredentialsSentAt);
  lastSentDate.setHours(0, 0, 0, 0);
  
  return lastSentDate.getTime() === today.getTime();
}

/**
 * Can credentials be resent? (max 3 times per day)
 * @param {object} user - User document
 * @returns {object} { canResend: boolean, remainingAttempts: number, message: string }
 */
function canResendCredentials(user) {
  const maxAttemptsPerDay = 3;
  
  if (!user.lastCredentialsSentAt) {
    return { canResend: true, remainingAttempts: maxAttemptsPerDay, message: 'Can send credentials' };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastSentDate = new Date(user.lastCredentialsSentAt);
  lastSentDate.setHours(0, 0, 0, 0);
  
  // If it's a new day, reset counter
  if (lastSentDate.getTime() < today.getTime()) {
    return { canResend: true, remainingAttempts: maxAttemptsPerDay, message: 'Can send credentials (new day)' };
  }
  
  // Same day - check attempt counter
  const sentCount = user.credentialsSentCount || 0;
  const remaining = Math.max(0, maxAttemptsPerDay - sentCount);
  
  if (remaining > 0) {
    return { canResend: true, remainingAttempts: remaining, message: `Can resend (${remaining} attempts left today)` };
  }
  
  return { canResend: false, remainingAttempts: 0, message: `Max resend attempts reached today. Try again tomorrow.` };
}

/**
 * Update user after sending credentials
 * @param {object} user - User document
 * @param {string} tempPassword - New temporary password to set
 * @returns {object} Updated user object with password hashed
 */
async function updateUserWithTemporaryPassword(user, tempPassword) {
  // Set the temporary password
  user.password = tempPassword; // Will be hashed by pre-save hook
  
  // Track credential send
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastSentDate = user.lastCredentialsSentAt ? new Date(user.lastCredentialsSentAt) : null;
  if (lastSentDate) {
    lastSentDate.setHours(0, 0, 0, 0);
  }
  
  // Reset counter if it's a new day
  if (!lastSentDate || lastSentDate.getTime() < today.getTime()) {
    user.credentialsSentCount = 1;
  } else {
    user.credentialsSentCount = (user.credentialsSentCount || 0) + 1;
  }
  
  user.lastCredentialsSentAt = new Date();
  user.forcePasswordChange = true; // Force change on next login
  
  await user.save();
  return user;
}

module.exports = {
  generateTemporaryPassword,
  hasCredentialsBeenSentToday,
  canResendCredentials,
  updateUserWithTemporaryPassword
};

