/**
 * ALLOCATIONS ENGINE TEST SUITE
 * Quick validation of allocations matching and creation
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:5000';
const TEST_TIMEOUT = 5000;

let adminToken = null;
let studentId = null;
let teacherId = null;
let allocationId = null;

async function makeRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : {},
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: { raw: data },
          });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(TEST_TIMEOUT, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function log(test, passed, details = '') {
  const status = passed ? '✓' : '✗';
  console.log(`${status} ${test}${details ? ': ' + details : ''}`);
}

async function runTests() {
  console.log(`
╔═════════════════════════════════════════╗
║  ALLOCATIONS ENGINE TEST SUITE          ║
║         April 18, 2026                  ║
╚═════════════════════════════════════════╝
`);

  try {
    // Test 1: Admin Login
    console.log('\n--- PHASE 1: AUTHENTICATION ---');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@smartious.ac.ke',
      password: 'AdminPass123!'
    });

    const loginPassed = loginRes.status === 200 && loginRes.body.success && loginRes.body.token;
    log('Admin Login', loginPassed, loginRes.body.message);

    if (!loginPassed) {
      console.log('Cannot continue without admin token. Exiting.');
      return;
    }

    adminToken = loginRes.body.token;

    // Test 2: Get Students List
    console.log('\n--- PHASE 2: FETCH TEST DATA ---');
    const studentsRes = await makeRequest('GET', '/api/users/students/list', null, adminToken);
    const studentsPassed = studentsRes.status === 200 && Array.isArray(studentsRes.body.students) && studentsRes.body.students.length > 0;
    log('Fetch Students', studentsPassed, `Found ${studentsRes.body.students?.length || 0} students`);

    if (studentsPassed) {
      studentId = studentsRes.body.students[0]._id;
      log('Selected Student', true, studentsRes.body.students[0].firstName);
    }

    // Test 3: Get Teachers List
    const teachersRes = await makeRequest('GET', '/api/teachers', null, adminToken);
    const teachersPassed = teachersRes.status === 200 && Array.isArray(teachersRes.body.teachers) && teachersRes.body.teachers.length > 0;
    log('Fetch Teachers', teachersPassed, `Found ${teachersRes.body.teachers?.length || 0} teachers`);

    if (teachersPassed) {
      teacherId = teachersRes.body.teachers[0]._id;
      log('Selected Teacher', true, teachersRes.body.teachers[0].firstName);
    }

    if (!studentId || !teacherId) {
      console.log('\nWarning: Need both student and teacher for allocation tests.');
      console.log('Skipping allocation tests.');
      return;
    }

    // Test 4: Find Compatible Teachers for Student
    console.log('\n--- PHASE 3: MATCHING ENGINE ---');
    const matchRes = await makeRequest(
      'GET',
      `/api/allocations/matches/teachers/${studentId}`,
      null,
      adminToken
    );
    const matchPassed = matchRes.status === 200 && matchRes.body.success;
    log('Find Compatible Teachers', matchPassed, `Found ${matchRes.body.matches?.length || 0} matches`);

    if (matchPassed && matchRes.body.matches?.length > 0) {
      const topMatch = matchRes.body.matches[0];
      log('Top Match', true, `${topMatch.teacherName} (${topMatch.matchScore}%)`);
      log('Match Type', true, topMatch.matchType);
    }

    // Test 5: Create Allocation
    console.log('\n--- PHASE 4: ALLOCATION CREATION ---');
    const allocRes = await makeRequest('POST', '/api/allocations', {
      studentId,
      teacherId,
      sendEmails: false // Don't send real emails during test
    }, adminToken);

    const allocPassed = allocRes.status === 201 && allocRes.body.success;
    log('Create Allocation', allocPassed);

    if (allocPassed) {
      allocationId = allocRes.body.allocation._id;
      log('Allocation ID', true, allocationId);
      log('Status', true, allocRes.body.allocation.status);
      log('Match Score', true, `${allocRes.body.allocation.matchScore}%`);
    }

    // Test 6: List All Allocations
    console.log('\n--- PHASE 5: LIST ALLOCATIONS ---');
    const listRes = await makeRequest('GET', '/api/allocations', null, adminToken);
    const listPassed = listRes.status === 200 && listRes.body.success && Array.isArray(listRes.body.allocations);
    log('List Allocations', listPassed, `Found ${listRes.body.allocations?.length || 0} allocations`);

    // Test 7: Update Allocation
    if (allocationId) {
      console.log('\n--- PHASE 6: UPDATE ALLOCATION ---');
      const updateRes = await makeRequest('PATCH', `/api/allocations/${allocationId}`, {
        status: 'Active'
      }, adminToken);

      const updatePassed = updateRes.status === 200 && updateRes.body.success;
      log('Update Allocation Status', updatePassed, updateRes.body.allocation?.status);
    }

    // Test 8: Delete Allocation (Should Fail)
    if (allocationId) {
      console.log('\n--- PHASE 7: SECURITY TESTS ---');
      const deleteRes = await makeRequest('DELETE', `/api/allocations/${allocationId}`, null, adminToken);
      const deleteFailed = deleteRes.status === 403;
      log('Delete Allocation (Should Fail)', deleteFailed, 'Correctly returns 403');

      // Test 9: Approve Allocation (Should Fail - Deprecated)
      const approveRes = await makeRequest('POST', `/api/allocations/${allocationId}/approve`, {}, adminToken);
      const approveFailed = approveRes.status === 405;
      log('Approve Allocation (Should Fail)', approveFailed, 'Correctly returns 405');
    }

    // Test 10: Email Service Check
    console.log('\n--- PHASE 8: EMAIL SERVICE ---');
    const emailRes = await makeRequest('POST', '/api/allocations', {
      studentId,
      teacherId,
      sendEmails: true // Send emails on this test
    }, adminToken);

    const emailPassed = emailRes.status === 201 && emailRes.body.emailsSent === true;
    log('Email Notifications', emailPassed, 'Emails sent flag set');

    console.log(`
╔═════════════════════════════════════════╗
║  TEST SUITE COMPLETE                    ║
╚═════════════════════════════════════════╝
`);

  } catch (error) {
    console.error('\n✗ Test Suite Error:', error.message);
  }
}

runTests();

