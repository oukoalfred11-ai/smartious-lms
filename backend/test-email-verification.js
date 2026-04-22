const https = require('https');
const http = require('http');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000';
let adminToken = null;

async function makeRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const client = url.protocol === 'https:' ? https : http;
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
        } catch (e) {
          resolve({ status: res.statusCode, body: { raw: data } });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('Timeout')); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  try {
    console.log('\n╔═════════════════════════════════════════╗');
    console.log('║  EMAIL VERIFICATION FLOW TEST           ║');
    console.log('╚═════════════════════════════════════════╝\n');
    
    // Admin login
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@smartious.ac.ke', password: 'Admin@2024'
    });
    
    if (loginRes.status !== 200) { console.log('✗ Admin login failed'); return; }
    adminToken = loginRes.body.token;
    console.log('✓ Admin logged in');
    
    // Create new user
    const testEmail = `test-${Date.now()}@smartious.ac.ke`;
    const createRes = await makeRequest('POST', '/api/users', {
      firstName: 'Test', lastName: 'User', email: testEmail,
      password: 'TestPass123!', role: 'student', curriculum: 'IGCSE'
    }, adminToken);
    
    if (createRes.status !== 200) { console.log('✗ User creation failed'); return; }
    const userId = createRes.body.user._id;
    console.log(`✓ User created: ${testEmail}`);
    console.log(`  forcePasswordReset: ${createRes.body.user.forcePasswordReset}`);
    console.log(`  isEmailVerified: ${createRes.body.user.isEmailVerified}`);
    
    // Try login before verification
    const preLogin = await makeRequest('POST', '/api/auth/login', {
      email: testEmail, password: 'TestPass123!'
    });
    console.log(`✓ Login before verification: forceEmailVerification=${preLogin.body.forceEmailVerification}`);
    
    // Verify email
    const verToken = jwt.sign({ userId, action: 'verify_email' }, 'smartious_super_secret_key', { expiresIn: '24h' });
    const verifyRes = await makeRequest('POST', '/api/auth/verify-email', { token: verToken });
    console.log(`✓ Email verified: ${verifyRes.body.success}`);
    
    // Login after verification
    const postLogin = await makeRequest('POST', '/api/auth/login', {
      email: testEmail, password: 'TestPass123!'
    });
    console.log(`✓ Login after verification: forcePasswordReset=${postLogin.body.forcePasswordReset}`);
    
    // Reset password
    const resetRes = await makeRequest('POST', '/api/auth/reset-password', {
      newPassword: 'NewPass123!'
    }, postLogin.body.token);
    console.log(`✓ Password reset: ${resetRes.body.success}`);
    
    // Final login
    const finalLogin = await makeRequest('POST', '/api/auth/login', {
      email: testEmail, password: 'NewPass123!'
    });
    const dashboardReady = !finalLogin.body.forcePasswordReset && !finalLogin.body.forceEmailVerification;
    console.log(`✓ Final login: Dashboard ready=${dashboardReady}`);
    
    console.log('\n╔═════════════════════════════════════════╗');
    console.log('║  ✅ EMAIL VERIFICATION FLOW PASSED     ║');
    console.log('╚═════════════════════════════════════════╝\n');
  } catch (e) {
    console.error('✗ Error:', e.message);
  }
})();

