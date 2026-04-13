#!/usr/bin/env node
/**
 * Student Portal - Comprehensive Testing Script
 * Tests all student features systematically
 * Created: April 13, 2026
 */

const http = require('http');
const https = require('https');

// Configuration
const API_BASE = 'http://localhost:5000/api';
const STUDENT_EMAIL = 'amara.osei@student.smartious.ac.ke';
const STUDENT_PASSWORD = 'Student@2024';
let JWT_TOKEN = null;

// Test Results
const testResults = {
  phase1: { name: 'Authentication', passed: 0, failed: 0, tests: [] },
  phase2: { name: 'Dashboard', passed: 0, failed: 0, tests: [] },
  phase3: { name: 'Curriculum', passed: 0, failed: 0, tests: [] },
  phase4: { name: 'Adaptive Practice', passed: 0, failed: 0, tests: [] },
  phase5: { name: 'Lessons', passed: 0, failed: 0, tests: [] },
  phase6: { name: 'Mshauri AI', passed: 0, failed: 0, tests: [] },
  phase7: { name: 'Exams', passed: 0, failed: 0, tests: [] },
  phase8: { name: 'Study Plans', passed: 0, failed: 0, tests: [] }
};

// HTTP Request Helper
function makeRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const fullUrl = API_BASE + endpoint;
    const url = new URL(fullUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (JWT_TOKEN && !endpoint.includes('/login')) {
      options.headers['Authorization'] = `Bearer ${JWT_TOKEN}`;
    }

    const protocol = url.protocol === 'https:' ? https : http;

    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test Reporter
function recordTest(phase, testName, passed, details = '') {
  const result = { name: testName, passed, details };
  testResults[phase].tests.push(result);
  if (passed) {
    testResults[phase].passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults[phase].failed++;
    console.log(`❌ ${testName}`);
    if (details) console.log(`   ${details}`);
  }
}

// ============================================
// PHASE 1: AUTHENTICATION
// ============================================
async function testPhase1() {
  console.log('\n========================================');
  console.log('PHASE 1: AUTHENTICATION');
  console.log('========================================\n');

  try {
    // Test 1: Student Login
    console.log('Testing: POST /api/auth/login (Student)');
    const loginRes = await makeRequest('POST', '/auth/login', {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD
    });

    const loginPassed = loginRes.status === 200 && loginRes.body.token;
    recordTest('phase1', 'Student Login', loginPassed,
      loginPassed ? '' : `Status: ${loginRes.status}`);

    if (loginPassed) {
      JWT_TOKEN = loginRes.body.token;
      console.log(`   Token obtained: ${JWT_TOKEN.substring(0, 20)}...\n`);
    }

    // Test 2: Get Current User
    console.log('Testing: GET /api/auth/me');
    const meRes = await makeRequest('GET', '/auth/me');
    const mePassed = meRes.status === 200 && meRes.body.user?.email === STUDENT_EMAIL;
    recordTest('phase1', 'Get Current User', mePassed,
      mePassed ? '' : `Status: ${meRes.status}`);
    console.log(mePassed ? `   User: ${meRes.body.user.firstName} ${meRes.body.user.lastName}\n` : '\n');

  } catch (error) {
    console.error('Phase 1 Error:', error.message);
    recordTest('phase1', 'Phase 1 Execution', false, error.message);
  }
}

// ============================================
// PHASE 2: DASHBOARD
// ============================================
async function testPhase2() {
  console.log('\n========================================');
  console.log('PHASE 2: DASHBOARD');
  console.log('========================================\n');

  try {
    // Test 1: Get Mastery Profile
    console.log('Testing: GET /api/mastery/me');
    const masteryRes = await makeRequest('GET', '/mastery/me');
    const masteryPassed = masteryRes.status === 200 && masteryRes.body.mastery;
    recordTest('phase2', 'Get Mastery Profile', masteryPassed,
      masteryPassed ? `Subjects: ${Object.keys(masteryRes.body.mastery).length}` : `Status: ${masteryRes.status}`);

    // Test 2: Mshauri Context
    console.log('Testing: GET /api/adaptive/mshauri-context');
    const contextRes = await makeRequest('GET', '/adaptive/mshauri-context');
    const contextPassed = contextRes.status === 200;
    recordTest('phase2', 'Mshauri Context', contextPassed,
      contextPassed ? '' : `Status: ${contextRes.status}`);

  } catch (error) {
    console.error('Phase 2 Error:', error.message);
    recordTest('phase2', 'Phase 2 Execution', false, error.message);
  }
}

// ============================================
// PHASE 3: CURRICULUM
// ============================================
async function testPhase3() {
  console.log('\n========================================');
  console.log('PHASE 3: CURRICULUM');
  console.log('========================================\n');

  try {
    // Test 1: Get Curriculum Data
    console.log('Testing: GET /api/mastery/me (Curriculum View)');
    const curriculumRes = await makeRequest('GET', '/mastery/me');
    const curriculumPassed = curriculumRes.status === 200 && curriculumRes.body.mastery;
    recordTest('phase3', 'Curriculum Data', curriculumPassed,
      curriculumPassed ? `Topics available: ${Object.values(curriculumRes.body.mastery).reduce((sum, subj) => sum + Object.keys(subj).length, 0)}` : `Status: ${curriculumRes.status}`);

  } catch (error) {
    console.error('Phase 3 Error:', error.message);
    recordTest('phase3', 'Phase 3 Execution', false, error.message);
  }
}

// ============================================
// PHASE 4: ADAPTIVE PRACTICE
// ============================================
async function testPhase4() {
  console.log('\n========================================');
  console.log('PHASE 4: ADAPTIVE PRACTICE');
  console.log('========================================\n');

  try {
    // Test 1: Get Practice Questions
    console.log('Testing: GET /api/adaptive/practice');
    const practiceRes = await makeRequest('GET', '/adaptive/practice');
    const practicePassed = practiceRes.status === 200 && practiceRes.body.practice && practiceRes.body.practice.questions;
    recordTest('phase4', 'Get Practice Questions', practicePassed,
      practicePassed ? `Questions: ${practiceRes.body.practice.questions.length}` : `Status: ${practiceRes.status}`);

    if (practicePassed && practiceRes.body.practice.questions.length > 0) {
      // Test 2: Submit Practice Answers
      console.log('Testing: POST /api/mastery/update');
      const answers = practiceRes.body.practice.questions.map(q => ({
        questionId: q.id,
        answer: q.options ? q.options[0] : 'Test Answer',
        timeSpent: 30
      }));

      const submitRes = await makeRequest('POST', '/mastery/update', {
        sessionId: `test_${Date.now()}`,
        answers: answers,
        subject: practiceRes.body.practice.subject,
        topic: practiceRes.body.practice.topic
      });

      const submitPassed = submitRes.status === 200;
      recordTest('phase4', 'Submit Practice Answers', submitPassed,
        submitPassed ? `XP earned: ${submitRes.body.xpEarned || 0}` : `Status: ${submitRes.status}, Body: ${JSON.stringify(submitRes.body)}`);
    }

  } catch (error) {
    console.error('Phase 4 Error:', error.message);
    recordTest('phase4', 'Phase 4 Execution', false, error.message);
  }
}

// ============================================
// PHASE 5: LESSONS
// ============================================
async function testPhase5() {
  console.log('\n========================================');
  console.log('PHASE 5: LESSONS');
  console.log('========================================\n');

  try {
    // Test 1: Get Lessons
    console.log('Testing: GET /api/lessons');
    const lessonsRes = await makeRequest('GET', '/lessons');
    const lessonsPassed = lessonsRes.status === 200;
    recordTest('phase5', 'Get Lessons', lessonsPassed,
      lessonsPassed ? `Lessons found: ${lessonsRes.body.lessons?.length || 0}` : `Status: ${lessonsRes.status}`);

    // Test 2: Get Flashcards
    console.log('Testing: GET /api/adaptive/flashcards');
    const flashcardsRes = await makeRequest('GET', '/adaptive/flashcards');
    const flashcardsPassed = flashcardsRes.status === 200;
    recordTest('phase5', 'Get Flashcards', flashcardsPassed,
      flashcardsPassed ? `Cards: ${flashcardsRes.body.flashcards?.length || 0}` : `Status: ${flashcardsRes.status}`);

  } catch (error) {
    console.error('Phase 5 Error:', error.message);
    recordTest('phase5', 'Phase 5 Execution', false, error.message);
  }
}

// ============================================
// PHASE 6: MSHAURI AI
// ============================================
async function testPhase6() {
  console.log('\n========================================');
  console.log('PHASE 6: MSHAURI AI');
  console.log('========================================\n');

  try {
    // Test 1: AI Conversation
    console.log('Testing: POST /api/auth/mshauri');
    const aiRes = await makeRequest('POST', '/auth/mshauri', {
      message: 'What should I study today?',
      masteryContext: 'Weakest topics: Algebra (45%), Chemistry (55%)'
    });
    const aiPassed = aiRes.status === 200 && aiRes.body.reply;
    recordTest('phase6', 'AI Conversation', aiPassed,
      aiPassed ? `Response: ${aiRes.body.reply.substring(0, 50)}...` : `Status: ${aiRes.status}`);

  } catch (error) {
    console.error('Phase 6 Error:', error.message);
    recordTest('phase6', 'Phase 6 Execution', false, error.message);
  }
}

// ============================================
// PHASE 7: EXAMS
// ============================================
async function testPhase7() {
  console.log('\n========================================');
  console.log('PHASE 7: EXAMS');
  console.log('========================================\n');

  try {
    // Test 1: Get Exams
    console.log('Testing: GET /api/exams');
    const examsRes = await makeRequest('GET', '/exams');
    const examsPassed = examsRes.status === 200;
    recordTest('phase7', 'Get Exams', examsPassed,
      examsPassed ? `Exams found: ${examsRes.body.exams?.length || 0}` : `Status: ${examsRes.status}`);

  } catch (error) {
    console.error('Phase 7 Error:', error.message);
    recordTest('phase7', 'Phase 7 Execution', false, error.message);
  }
}

// ============================================
// PHASE 8: STUDY PLANS
// ============================================
async function testPhase8() {
  console.log('\n========================================');
  console.log('PHASE 8: STUDY PLANS');
  console.log('========================================\n');

  try {
    // Test 1: Get Study Plan
    console.log('Testing: GET /api/adaptive/study-plan');
    const planRes = await makeRequest('GET', '/adaptive/study-plan');
    const planPassed = planRes.status === 200;
    recordTest('phase8', 'Get Study Plan', planPassed,
      planPassed ? `Plan generated` : `Status: ${planRes.status}`);

  } catch (error) {
    console.error('Phase 8 Error:', error.message);
    recordTest('phase8', 'Phase 8 Execution', false, error.message);
  }
}

// ============================================
// GENERATE TEST REPORT
// ============================================
function generateReport() {
  console.log('\n========================================');
  console.log('STUDENT PORTAL TEST REPORT');
  console.log('========================================\n');

  let totalPassed = 0;
  let totalFailed = 0;

  Object.entries(testResults).forEach(([phase, data]) => {
    totalPassed += data.passed;
    totalFailed += data.failed;

    const total = data.passed + data.failed;
    const percentage = total > 0 ? Math.round((data.passed / total) * 100) : 0;

    console.log(`${data.name.toUpperCase()}`);
    console.log(`├─ Passed: ${data.passed}/${total} (${percentage}%)`);
    console.log(`├─ Failed: ${data.failed}/${total}`);
    console.log(`└─ Status: ${data.failed === 0 ? '✅ PASS' : '❌ FAIL'}\n`);
  });

  const grandTotal = totalPassed + totalFailed;
  const overallPercentage = grandTotal > 0 ? Math.round((totalPassed / grandTotal) * 100) : 0;

  console.log('========================================');
  console.log('OVERALL RESULTS');
  console.log('========================================');
  console.log(`Total Tests: ${grandTotal}`);
  console.log(`Passed: ${totalPassed} (${overallPercentage}%)`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Status: ${totalFailed === 0 ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'}\n`);

  // Success Criteria
  console.log('========================================');
  console.log('SUCCESS CRITERIA');
  console.log('========================================');
  const criteria = [
    { name: 'Authentication working', passed: testResults.phase1.failed === 0 },
    { name: 'Dashboard functional', passed: testResults.phase2.failed === 0 },
    { name: 'Curriculum accessible', passed: testResults.phase3.failed === 0 },
    { name: 'Adaptive practice working', passed: testResults.phase4.failed === 0 },
    { name: 'Lessons available', passed: testResults.phase5.failed === 0 },
    { name: 'AI tutor responsive', passed: testResults.phase6.failed === 0 },
    { name: 'Exams accessible', passed: testResults.phase7.failed === 0 },
    { name: 'Study plans generated', passed: testResults.phase8.failed === 0 }
  ];

  criteria.forEach(c => {
    console.log(`${c.passed ? '✅' : '❌'} ${c.name}`);
  });

  const allPassed = criteria.every(c => c.passed);
  console.log(`\n${allPassed ? '✅ STUDENT PORTAL READY' : '⚠️  NEEDS ATTENTION'}\n`);
}

// ============================================
// MAIN EXECUTION
// ============================================
async function runAllTests() {
  console.log('\n╔═════════════════════════════════════════╗');
  console.log('║  STUDENT PORTAL COMPREHENSIVE TEST SUITE ║');
  console.log('║         Created: April 13, 2026          ║');
  console.log('╚═════════════════════════════════════════╝');

  try {
    await testPhase1();
    await testPhase2();
    await testPhase3();
    await testPhase4();
    await testPhase5();
    await testPhase6();
    await testPhase7();
    await testPhase8();
    generateReport();
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(console.error);
