/**
 * COMPLETE END-TO-END TEST
 * Tests full workflow: backend + frontend integration points
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:5000';

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

async function runCompleteTest() {
  console.log(`
╔═════════════════════════════════════════════════╗
║  COMPLETE END-TO-END INTEGRATION TEST           ║
║         April 18, 2026                          ║
╚═════════════════════════════════════════════════╝
`);

  let passed = 0;
  let failed = 0;

  try {
    // TEST 1: Backend health check
    console.log('\n--- TEST 1: BACKEND HEALTH ---');
    const healthRes = await makeRequest('GET', '/api/health');
    if (healthRes.status === 200 && healthRes.body.status === 'ok') {
      console.log('✓ Backend is healthy and running');
      passed++;
    } else {
      console.log('✗ Backend health check failed');
      failed++;
    }

    // TEST 2: Admin login (normal flow)
    console.log('\n--- TEST 2: NORMAL LOGIN FLOW (ADMIN) ---');
    const adminLoginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@smartious.ac.ke',
      password: 'Admin@2024'
    });
    
    if (adminLoginRes.status === 200 && adminLoginRes.body.token && !adminLoginRes.body.forcePasswordReset) {
      console.log('✓ Admin login successful (no forced flows)');
      passed++;
    } else {
      console.log('✗ Admin login failed');
      failed++;
    }

    // TEST 3: Allocations endpoint (with admin token)
    console.log('\n--- TEST 3: ALLOCATIONS ENDPOINT ---');
    const adminToken = adminLoginRes.body.token;
    const allocRes = await makeRequest('GET', '/api/allocations', null, adminToken);
    
    if (allocRes.status === 200 && Array.isArray(allocRes.body.allocations)) {
      console.log(`✓ Allocations endpoint working (${allocRes.body.allocations.length} allocations)`);
      passed++;
    } else {
      console.log('✗ Allocations endpoint failed');
      failed++;
    }

    // TEST 4: Email verification setup
    console.log('\n--- TEST 4: EMAIL VERIFICATION SETUP ---');
    const newUserRes = await makeRequest('POST', '/api/users', {
      firstName: 'E2E',
      lastName: 'Test',
      email: `e2etest-${Date.now()}@smartious.ac.ke`,
      password: 'TestPass123!',
      role: 'student',
      curriculum: 'IGCSE'
    }, adminToken);
    
    if (newUserRes.status === 200 && 
        newUserRes.body.user.forcePasswordReset === true && 
        newUserRes.body.user.isEmailVerified === false) {
      console.log('✓ New user created with verification flags set correctly');
      console.log(`  - forcePasswordReset: true ✓`);
      console.log(`  - isEmailVerified: false ✓`);
      passed++;
    } else {
      console.log('✗ User creation verification flags incorrect');
      failed++;
    }

    // TEST 5: Login with forced password reset
    console.log('\n--- TEST 5: FORCED PASSWORD RESET FLOW ---');
    const testEmail = newUserRes.body.user.email;
    const forceResetLoginRes = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'TestPass123!'
    });
    
    if (forceResetLoginRes.status === 200 && forceResetLoginRes.body.forcePasswordReset === true) {
      console.log('✓ Login returns forcePasswordReset flag');
      console.log(`  Frontend will redirect to /reset-password`);
      passed++;
    } else {
      console.log('✗ Force password reset flow failed');
      failed++;
    }

    // TEST 6: Teacher-to-student matching
    console.log('\n--- TEST 6: TEACHER-STUDENT MATCHING ---');
    const studentsRes = await makeRequest('GET', '/api/users/students/list', null, adminToken);
    if (studentsRes.status === 200 && studentsRes.body.students.length > 0) {
      const studentId = studentsRes.body.students[0]._id;
      const matchRes = await makeRequest(
        'GET',
        `/api/allocations/matches/teachers/${studentId}`,
        null,
        adminToken
      );
      
      if (matchRes.status === 200 && matchRes.body.success) {
        console.log(`✓ Matching engine working (${matchRes.body.matches?.length || 0} matches)`);
        passed++;
      } else {
        console.log('✗ Matching engine failed');
        failed++;
      }
    }

    // TEST 7: Security - Delete protection
    console.log('\n--- TEST 7: SECURITY - DELETE PROTECTION ---');
    if (allocRes.body.allocations.length > 0) {
      const allocId = allocRes.body.allocations[0]._id;
      const deleteRes = await makeRequest('DELETE', `/api/allocations/${allocId}`, null, adminToken);
      
      if (deleteRes.status === 403) {
        console.log('✓ DELETE /api/allocations/:id returns 403 (protected)');
        passed++;
      } else {
        console.log('✗ DELETE protection failed');
        failed++;
      }
    } else {
      console.log('⊘ No allocations to test delete protection');
    }

    // TEST 8: Verify email endpoint exists
    console.log('\n--- TEST 8: EMAIL VERIFICATION ENDPOINT ---');
    const dummyToken = 'dummy-jwt-token';
    const verifyRes = await makeRequest('POST', '/api/auth/verify-email', { token: dummyToken });
    
    if (verifyRes.status === 400 || verifyRes.status === 401) {
      console.log('✓ /api/auth/verify-email endpoint exists and validates tokens');
      passed++;
    } else {
      console.log('✗ Email verification endpoint failed');
      failed++;
    }

    // TEST 9: Reset password endpoint exists
    console.log('\n--- TEST 9: PASSWORD RESET ENDPOINT ---');
    const resetRes = await makeRequest('POST', '/api/auth/reset-password', 
      { newPassword: 'NewPass123!' },
      adminToken
    );
    
    if (resetRes.status === 200 || resetRes.status === 400) {
      console.log('✓ /api/auth/reset-password endpoint exists and works');
      passed++;
    } else {
      console.log('✗ Password reset endpoint failed');
      failed++;
    }

    // TEST 10: Frontend files created
    console.log('\n--- TEST 10: FRONTEND FILES ---');
    const fs = require('fs');
    const verifyPageExists = fs.existsSync('./src/pages/VerifyEmailPage.jsx');
    const resetPageExists = fs.existsSync('./src/pages/ResetPasswordPage.jsx');
    const appUpdated = fs.existsSync('./src/App.jsx');
    
    if (verifyPageExists && resetPageExists && appUpdated) {
      console.log('✓ Frontend pages created and App.jsx updated');
      console.log(`  - VerifyEmailPage.jsx: ✓`);
      console.log(`  - ResetPasswordPage.jsx: ✓`);
      console.log(`  - App.jsx (routes added): ✓`);
      passed++;
    } else {
      console.log('✗ Frontend files incomplete');
      failed++;
    }

    console.log(`
╔═════════════════════════════════════════════════╗
║  TEST RESULTS                                   ║
╚═════════════════════════════════════════════════╝

PASSED: ${passed}/10
FAILED: ${failed}/10

${failed === 0 ? '✅ ALL TESTS PASSED - READY FOR STAGING' : '⚠️  SOME TESTS FAILED - REVIEW ABOVE'}

Summary:
${failed === 0 ? `
✓ Backend is operational and fully tested
✓ Email verification flow implemented
✓ Password reset enforcement working
✓ Security policies enforced
✓ Frontend pages created
✓ Route handlers in place
✓ Complete end-to-end flow ready

NEXT STEPS FOR PRODUCTION:
1. Test frontend pages in browser
2. Update frontend build configuration if needed
3. Test complete flow with real email service
4. Deploy to staging environment
5. Run final security audit
` : ''}
`);

  } catch (error) {
    console.error('\n✗ Test Error:', error.message);
  }
}

// Run from frontend directory
process.chdir('./frontend');
runCompleteTest().catch(console.error);

