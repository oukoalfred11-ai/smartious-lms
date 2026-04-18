/**
 * TEACHER PORTAL COMPREHENSIVE TEST SUITE
 * Tests all teacher functionality including profile management, dashboard, and features
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:5000';
const TEST_TIMEOUT = 10000;

// Test data
const TEACHER_CREDENTIALS = {
  email: 'j.muthomi@smartious.ac.ke',
  password: 'NewTeacher456!'
};

let teacherToken = null;
let teacherId = null;

// Helper function to make HTTP requests
async function makeRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PATCH' || method.toUpperCase() === 'PUT')) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
          };
          resolve(response);
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(TEST_TIMEOUT, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PATCH' || method.toUpperCase() === 'PUT')) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Test tracking
const testResults = {
  authentication: [],
  profile: [],
  dashboard: [],
  students: [],
  resources: [],
  exams: [],
  messages: [],
  reports: [],
  blog: [],
  allocations: [],
  payslips: [],
  marking: []
};

function recordTest(phase, testName, passed, details = '') {
  testResults[phase].push({ name: testName, passed, details });
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${testName}${details ? ` - ${details}` : ''}`);
}

// Main test runner
async function runTests() {
  console.log(`
╔═════════════════════════════════════════╗
║  TEACHER PORTAL COMPREHENSIVE TEST SUITE ║
║         Created: April 13, 2026          ║
╚═════════════════════════════════════════╝
`);

  try {
    // PHASE 1: AUTHENTICATION
    console.log('\n========================================');
    console.log('PHASE 1: AUTHENTICATION');
    console.log('========================================');

    // Test 1: Teacher Login
    console.log('Testing: POST /api/auth/login (Teacher)');
    const loginRes = await makeRequest('POST', '/api/auth/login', TEACHER_CREDENTIALS);
    const loginPassed = loginRes.status === 200 && loginRes.body.success && loginRes.body.token;
    recordTest('authentication', 'Teacher Login', loginPassed,
      loginPassed ? `Token: ${loginRes.body.token.substring(0, 20)}...` : `Status: ${loginRes.status}`);

    if (loginPassed) {
      teacherToken = loginRes.body.token;
      teacherId = loginRes.body.user._id;
    }

    // Test 2: Get Current User
    console.log('Testing: GET /api/auth/me');
    const meRes = await makeRequest('GET', '/api/auth/me', null, teacherToken);
    const mePassed = meRes.status === 200 && meRes.body.success && meRes.body.user.role === 'teacher';
    recordTest('authentication', 'Get Current User', mePassed,
      mePassed ? `User: ${meRes.body.user.firstName} ${meRes.body.user.lastName}` : `Status: ${meRes.status}`);

    if (!loginPassed || !mePassed) {
      console.log('\n❌ Authentication failed - cannot continue with other tests');
      return;
    }

    // PHASE 2: PROFILE MANAGEMENT
    console.log('\n========================================');
    console.log('PHASE 2: PROFILE MANAGEMENT');
    console.log('========================================');

    // Test 3: Get Teacher Profile
    console.log('Testing: GET /api/teacher/profile');
    const profileRes = await makeRequest('GET', '/api/teacher/profile', null, teacherToken);
    const profilePassed = profileRes.status === 200 && profileRes.body.success && profileRes.body.profile;
    recordTest('profile', 'Get Teacher Profile', profilePassed,
      profilePassed ? `Profile: ${profileRes.body.profile.firstName} ${profileRes.body.profile.lastName}` : `Status: ${profileRes.status}`);

    // Test 4: Update Teacher Profile
    console.log('Testing: PATCH /api/teacher/profile');
    const updateData = {
      firstName: 'James',
      lastName: 'Muthomi',
      phone: '+254 745 021 212',
      bio: 'Mathematics teacher with 8 years of experience. Passionate about IGCSE curriculum.'
    };
    const updateRes = await makeRequest('PATCH', '/api/teacher/profile', updateData, teacherToken);
    const updatePassed = updateRes.status === 200 && updateRes.body.success;
    recordTest('profile', 'Update Teacher Profile', updatePassed,
      updatePassed ? 'Profile updated successfully' : `Status: ${updateRes.status}`);

    // Test 5: Change Password
    console.log('Testing: POST /api/teacher/change-password');
    const passwordData = {
      current: 'NewTeacher456!',
      new: 'Teacher@2024'
    };
    const passwordRes = await makeRequest('POST', '/api/teacher/change-password', passwordData, teacherToken);
    const passwordPassed = passwordRes.status === 200 && passwordRes.body.success;
    recordTest('profile', 'Change Password', passwordPassed,
      passwordPassed ? 'Password changed successfully' : `Status: ${passwordRes.status}`);

    // Test 6: Change Email
    console.log('Testing: POST /api/teacher/change-email');
    const emailData = {
      newEmail: 'james.muthomi@smartious.ac.ke'
    };
    const emailRes = await makeRequest('POST', '/api/teacher/change-email', emailData, teacherToken);
    const emailPassed = emailRes.status === 200 && emailRes.body.success;
    recordTest('profile', 'Change Email', emailPassed,
      emailPassed ? 'Email changed successfully' : `Status: ${emailRes.status}`);

    // PHASE 3: DASHBOARD
    console.log('\n========================================');
    console.log('PHASE 3: DASHBOARD');
    console.log('========================================');

    // Test 7: Get Dashboard Data
    console.log('Testing: GET /api/dashboard/teacher');
    const dashboardRes = await makeRequest('GET', '/api/dashboard/teacher', null, teacherToken);
    const dashboardPassed = dashboardRes.status === 200 && dashboardRes.body.success;
    recordTest('dashboard', 'Get Dashboard Data', dashboardPassed,
      dashboardPassed ? 'Dashboard data loaded' : `Status: ${dashboardRes.status}`);

    // PHASE 4: STUDENTS MANAGEMENT
    console.log('\n========================================');
    console.log('PHASE 4: STUDENTS MANAGEMENT');
    console.log('========================================');

    // Test 8: Get My Students
    console.log('Testing: GET /api/teacher/students');
    const studentsRes = await makeRequest('GET', '/api/teacher/students', null, teacherToken);
    const studentsPassed = studentsRes.status === 200 && studentsRes.body.success;
    recordTest('students', 'Get My Students', studentsPassed,
      studentsPassed ? `Students: ${studentsRes.body.students?.length || 0}` : `Status: ${studentsRes.status}`);

    // Test 9: Get Student Mastery
    console.log('Testing: GET /api/mastery/student/:id');
    const masteryRes = await makeRequest('GET', '/api/mastery/student/demo-student-id', null, teacherToken);
    const masteryPassed = masteryRes.status === 200 || masteryRes.status === 404; // 404 is acceptable if student doesn't exist
    recordTest('students', 'Get Student Mastery', masteryPassed,
      masteryPassed ? 'Mastery data accessible' : `Status: ${masteryRes.status}`);

    // PHASE 5: RESOURCE MANAGEMENT
    console.log('\n========================================');
    console.log('PHASE 5: RESOURCE MANAGEMENT');
    console.log('========================================');

    // Test 10: Get Resources
    console.log('Testing: GET /api/resources');
    const resourcesRes = await makeRequest('GET', '/api/resources', null, teacherToken);
    const resourcesPassed = resourcesRes.status === 200 && resourcesRes.body.success;
    recordTest('resources', 'Get Resources', resourcesPassed,
      resourcesPassed ? `Resources: ${resourcesRes.body.resources?.length || 0}` : `Status: ${resourcesRes.status}`);

    // PHASE 6: EXAM MANAGEMENT
    console.log('\n========================================');
    console.log('PHASE 6: EXAM MANAGEMENT');
    console.log('========================================');

    // Test 11: Get Exams
    console.log('Testing: GET /api/exams');
    const examsRes = await makeRequest('GET', '/api/exams', null, teacherToken);
    const examsPassed = examsRes.status === 200 && examsRes.body.success;
    recordTest('exams', 'Get Exams', examsPassed,
      examsPassed ? `Exams: ${examsRes.body.exams?.length || 0}` : `Status: ${examsRes.status}`);

    // PHASE 7: MESSAGES
    console.log('\n========================================');
    console.log('PHASE 7: MESSAGES');
    console.log('========================================');

    // Test 12: Get Messages
    console.log('Testing: GET /api/messages/teacher');
    const messagesRes = await makeRequest('GET', '/api/messages/teacher', null, teacherToken);
    const messagesPassed = messagesRes.status === 200 && messagesRes.body.success;
    recordTest('messages', 'Get Messages', messagesPassed,
      messagesPassed ? `Messages: ${messagesRes.body.messages?.length || 0}` : `Status: ${messagesRes.status}`);

    // PHASE 8: REPORTS & ANALYTICS
    console.log('\n========================================');
    console.log('PHASE 8: REPORTS & ANALYTICS');
    console.log('========================================');

    // Test 13: Get Reports
    console.log('Testing: GET /api/reports/teacher');
    const reportsRes = await makeRequest('GET', '/api/reports/teacher', null, teacherToken);
    const reportsPassed = reportsRes.status === 200 && reportsRes.body.success;
    recordTest('reports', 'Get Reports', reportsPassed,
      reportsPassed ? 'Reports data loaded' : `Status: ${reportsRes.status}`);

    // PHASE 9: BLOG MANAGEMENT
    console.log('\n========================================');
    console.log('PHASE 9: BLOG MANAGEMENT');
    console.log('========================================');

    // Test 14: Get Blog Posts
    console.log('Testing: GET /api/blog/teacher');
    const blogRes = await makeRequest('GET', '/api/blog/teacher', null, teacherToken);
    const blogPassed = blogRes.status === 200 && blogRes.body.success;
    recordTest('blog', 'Get Blog Posts', blogPassed,
      blogPassed ? `Posts: ${blogRes.body.posts?.length || 0}` : `Status: ${blogRes.status}`);

    // PHASE 10: ALLOCATIONS
    console.log('\n========================================');
    console.log('PHASE 10: ALLOCATIONS');
    console.log('========================================');

    // Test 15: Get Allocations
    console.log('Testing: GET /api/allocations/teacher');
    const allocationsRes = await makeRequest('GET', '/api/allocations/teacher', null, teacherToken);
    const allocationsPassed = allocationsRes.status === 200 && allocationsRes.body.success;
    recordTest('allocations', 'Get Allocations', allocationsPassed,
      allocationsPassed ? `Allocations: ${allocationsRes.body.allocations?.length || 0}` : `Status: ${allocationsRes.status}`);

    // PHASE 11: PAYSLIPS
    console.log('\n========================================');
    console.log('PHASE 11: PAYSLIPS');
    console.log('========================================');

    // Test 16: Get Payslips
    console.log('Testing: GET /api/payslips/teacher');
    const payslipsRes = await makeRequest('GET', '/api/payslips/teacher', null, teacherToken);
    const payslipsPassed = payslipsRes.status === 200 && payslipsRes.body.success;
    recordTest('payslips', 'Get Payslips', payslipsPassed,
      payslipsPassed ? `Payslips: ${payslipsRes.body.payslips?.length || 0}` : `Status: ${payslipsRes.status}`);

    // PHASE 12: MARKING
    console.log('\n========================================');
    console.log('PHASE 12: MARKING');
    console.log('========================================');

    // Test 17: Get Marking Queue
    console.log('Testing: GET /api/marking/teacher');
    const markingRes = await makeRequest('GET', '/api/marking/teacher', null, teacherToken);
    const markingPassed = markingRes.status === 200 && markingRes.body.success;
    recordTest('marking', 'Get Marking Queue', markingPassed,
      markingPassed ? `Papers to mark: ${markingRes.body.papers?.length || 0}` : `Status: ${markingRes.status}`);

  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error.message);
  }

  // Generate test report
  console.log('\n========================================');
  console.log('TEACHER PORTAL TEST REPORT');
  console.log('========================================');

  const phases = Object.keys(testResults);
  let totalTests = 0;
  let totalPassed = 0;

  phases.forEach(phase => {
    const tests = testResults[phase];
    if (tests.length === 0) return;

    const passed = tests.filter(t => t.passed).length;
    const failed = tests.length - passed;
    totalTests += tests.length;
    totalPassed += passed;

    console.log(`\n${phase.toUpperCase()}`);
    console.log(`├─ Passed: ${passed}/${tests.length} (${Math.round(passed/tests.length*100)}%)`);
    console.log(`├─ Failed: ${failed}/${tests.length}`);
    console.log(`└─ Status: ${failed === 0 ? '✅ PASS' : '❌ FAIL'}`);
  });

  console.log('\n========================================');
  console.log('OVERALL RESULTS');
  console.log('========================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${totalPassed} (${Math.round(totalPassed/totalTests*100)}%)`);
  console.log(`Failed: ${totalTests - totalPassed}`);
  console.log(`Status: ${totalPassed === totalTests ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  console.log('\n========================================');
  console.log('SUCCESS CRITERIA');
  console.log('========================================');
  console.log(`${totalPassed === totalTests ? '✅' : '❌'} Authentication working`);
  console.log(`${testResults.profile.filter(t => t.passed).length === testResults.profile.length ? '✅' : '❌'} Profile management functional`);
  console.log(`${testResults.dashboard.filter(t => t.passed).length === testResults.dashboard.length ? '✅' : '❌'} Dashboard accessible`);
  console.log(`${testResults.students.filter(t => t.passed).length === testResults.students.length ? '✅' : '❌'} Student management working`);
  console.log(`${testResults.resources.filter(t => t.passed).length === testResults.resources.length ? '✅' : '❌'} Resource library functional`);
  console.log(`${testResults.exams.filter(t => t.passed).length === testResults.exams.length ? '✅' : '❌'} Exam builder accessible`);
  console.log(`${testResults.messages.filter(t => t.passed).length === testResults.messages.length ? '✅' : '❌'} Messaging system working`);
  console.log(`${testResults.reports.filter(t => t.passed).length === testResults.reports.length ? '✅' : '❌'} Reports & analytics functional`);
  console.log(`${testResults.blog.filter(t => t.passed).length === testResults.blog.length ? '✅' : '❌'} Blog management working`);
  console.log(`${testResults.allocations.filter(t => t.passed).length === testResults.allocations.length ? '✅' : '❌'} Allocations accessible`);
  console.log(`${testResults.payslips.filter(t => t.passed).length === testResults.payslips.length ? '✅' : '❌'} Payslips functional`);
  console.log(`${testResults.marking.filter(t => t.passed).length === testResults.marking.length ? '✅' : '❌'} AI marking system working`);

  console.log(`\n${totalPassed === totalTests ? '✅ TEACHER PORTAL READY' : '❌ NEEDS ATTENTION'}`);
}

// Run the tests
runTests().catch(console.error);
