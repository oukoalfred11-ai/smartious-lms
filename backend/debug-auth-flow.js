#!/usr/bin/env node
/**
 * COMPREHENSIVE AUTH FLOW DEBUG
 * This script tests the entire login -> reset password -> dashboard flow
 */

require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');
const jwt = require('jsonwebtoken');

const API = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(type, msg, data = null) {
  const prefix = {
    '✅': `${colors.green}✅${colors.reset}`,
    '❌': `${colors.red}❌${colors.reset}`,
    '⚠️ ': `${colors.yellow}⚠️ ${colors.reset}`,
    '🔍': `${colors.cyan}🔍${colors.reset}`,
    '📋': `${colors.blue}📋${colors.reset}`,
  };
  console.log(`${prefix[type]} ${msg}`);
  if (data) console.log(`   ${JSON.stringify(data, null, 2)}`);
}

async function debug() {
  console.log('\n' + '='.repeat(80));
  console.log('DEBUG: COMPLETE AUTH FLOW');
  console.log('='.repeat(80) + '\n');

  let token = '';
  let user = {};

  try {
    // STEP 1: Login
    log('🔍', 'STEP 1: Attempting login...');
    const loginRes = await axios.post(`${API}/auth/login`, {
      email: 'admin@smartious.ac.ke',
      password: 'Admin@2024'
    });

    log('✅', 'Login successful');
    token = loginRes.data.token;
    user = loginRes.data.user;
    
    log('📋', 'Response Data:', {
      token: token.substring(0, 20) + '...',
      user: {
        email: user.email,
        role: user.role,
        requirePasswordChange: user.requirePasswordChange,
        mustChangePassword: user.mustChangePassword
      }
    });

    if (!user.requirePasswordChange) {
      log('❌', 'ERROR: requirePasswordChange is FALSE, should be TRUE for first login!');
      process.exit(1);
    }
    log('✅', 'Correct: requirePasswordChange = true');

    // STEP 2: Verify token
    log('🔍', 'STEP 2: Verifying JWT token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    log('✅', 'Token is valid', { userId: decoded.id });

    // STEP 3: Call /auth/me with the token
    log('🔍', 'STEP 3: Calling /auth/me endpoint...');
    const meRes = await axios.get(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    log('✅', '/auth/me successful');
    log('📋', '/auth/me Response:', {
      email: meRes.data.user.email,
      requirePasswordChange: meRes.data.user.requirePasswordChange
    });

    // STEP 4: Reset password
    log('🔍', 'STEP 4: Resetting password...');
    const resetRes = await axios.post(`${API}/auth/reset-password`, 
      { newPassword: 'NewAdmin@2024' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    log('✅', 'Password reset successful');
    log('📋', 'Reset Response:', resetRes.data);

    // STEP 5: Try calling /auth/me again AFTER reset
    log('🔍', 'STEP 5: Calling /auth/me AFTER password reset...');
    try {
      const meRes2 = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      log('✅', '/auth/me after reset successful');
      log('📋', '/auth/me After Reset:', {
        email: meRes2.data.user.email,
        requirePasswordChange: meRes2.data.user.requirePasswordChange
      });

      if (meRes2.data.user.requirePasswordChange === true) {
        log('⚠️ ', 'WARNING: requirePasswordChange is STILL true after reset!');
        log('⚠️ ', 'The backend did NOT update the mustChangePassword flag');
      } else {
        log('✅', 'Correct: requirePasswordChange = false after reset');
      }
    } catch (e) {
      log('❌', 'ERROR calling /auth/me after reset:', e.response?.data?.message || e.message);
    }

    // STEP 6: Login again with new password
    log('🔍', 'STEP 6: Logging in with new password...');
    try {
      const login2Res = await axios.post(`${API}/auth/login`, {
        email: 'admin@smartious.ac.ke',
        password: 'NewAdmin@2024'
      });

      log('✅', 'Login with new password successful');
      log('📋', 'New Login Response:', {
        email: login2Res.data.user.email,
        requirePasswordChange: login2Res.data.user.requirePasswordChange
      });

      token = login2Res.data.token;
      user = login2Res.data.user;

      if (user.requirePasswordChange === true) {
        log('⚠️ ', 'WARNING: Still asking for password change!');
        log('⚠️ ', 'This will cause infinite redirect loop');
      }
    } catch (e) {
      log('❌', 'ERROR logging in with new password:', e.response?.data?.message || e.message);
    }

    console.log('\n' + '='.repeat(80));
    log('📋', 'SUMMARY');
    console.log('='.repeat(80));
    log('✅', 'All steps completed. Check warnings above for issues.');
    
  } catch (e) {
    log('❌', 'FATAL ERROR:', e.response?.data || e.message);
    process.exit(1);
  }
}

debug();

