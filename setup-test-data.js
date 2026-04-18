/**
 * SETUP TEST DATA
 * Creates test users (admin, teacher, student) for testing
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:5000';

async function makeRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

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
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function setup() {
  console.log(`
╔═════════════════════════════════════════╗
║  TEST DATA SETUP                        ║
║         April 18, 2026                  ║
╚═════════════════════════════════════════╝
`);

  let adminToken = null;

  try {
    // Step 1: Create Admin User
    console.log('\n--- STEP 1: CREATE ADMIN USER ---');
    const adminRes = await makeRequest('POST', '/api/users', {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@smartious.ac.ke',
      password: 'AdminPass123!',
      role: 'admin',
      plan: 'Staff'
    });

    if (adminRes.status === 200 && adminRes.body.success) {
      console.log('✓ Admin user created');
      console.log(`  Email: admin@smartious.ac.ke`);
      console.log(`  ID: ${adminRes.body.user._id}`);
    } else if (adminRes.status === 400 && adminRes.body.message.includes('duplicate')) {
      console.log('✓ Admin user already exists (using existing)');
    } else {
      console.log('✗ Failed to create admin:', adminRes.body.message);
    }

    // Step 2: Login as Admin
    console.log('\n--- STEP 2: LOGIN AS ADMIN ---');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@smartious.ac.ke',
      password: 'AdminPass123!'
    });

    if (loginRes.status === 200 && loginRes.body.token) {
      adminToken = loginRes.body.token;
      console.log('✓ Admin logged in successfully');
    } else {
      console.log('✗ Login failed:', loginRes.body.message);
      return;
    }

    // Step 3: Get Subjects
    console.log('\n--- STEP 3: FETCH SUBJECTS ---');
    const subjectsRes = await makeRequest('GET', '/api/subjects?curriculum=IGCSE', null, adminToken);
    let subjectIds = [];
    
    if (subjectsRes.status === 200 && Array.isArray(subjectsRes.body.subjects)) {
      subjectIds = subjectsRes.body.subjects.slice(0, 3).map(s => s._id);
      console.log(`✓ Found ${subjectsRes.body.subjects.length} IGCSE subjects`);
      console.log(`  Using subjects: ${subjectIds.length > 0 ? 'Yes' : 'No'}`);
    } else {
      console.log('⚠ Could not fetch subjects (may not be seeded yet)');
    }

    // Step 4: Create Student
    console.log('\n--- STEP 4: CREATE STUDENT USER ---');
    const studentRes = await makeRequest('POST', '/api/users', {
      firstName: 'Test',
      lastName: 'Student',
      email: 'student@smartious.ac.ke',
      password: 'StudentPass123!',
      role: 'student',
      curriculum: 'IGCSE',
      subjects: subjectIds.length > 0 ? subjectIds : [],
      grade: '10',
      plan: 'Premium'
    }, adminToken);

    if (studentRes.status === 200 && studentRes.body.success) {
      console.log('✓ Student created');
      console.log(`  Email: student@smartious.ac.ke`);
      console.log(`  ID: ${studentRes.body.user._id}`);
    } else if (studentRes.status === 400 && studentRes.body.message.includes('duplicate')) {
      console.log('✓ Student already exists');
    } else {
      console.log('✗ Failed to create student:', studentRes.body.message);
    }

    // Step 5: Create Teacher
    console.log('\n--- STEP 5: CREATE TEACHER USER ---');
    const teacherRes = await makeRequest('POST', '/api/users', {
      firstName: 'Mr.',
      lastName: 'Teacher',
      email: 'teacher@smartious.ac.ke',
      password: 'TeacherPass123!',
      role: 'teacher',
      curriculum: 'IGCSE',
      subjects: subjectIds.length > 0 ? subjectIds : [],
      phone: '+254123456789',
      plan: 'Staff'
    }, adminToken);

    if (teacherRes.status === 200 && teacherRes.body.success) {
      console.log('✓ Teacher created');
      console.log(`  Email: teacher@smartious.ac.ke`);
      console.log(`  ID: ${teacherRes.body.user._id}`);
    } else if (teacherRes.status === 400 && teacherRes.body.message.includes('duplicate')) {
      console.log('✓ Teacher already exists');
    } else {
      console.log('✗ Failed to create teacher:', teacherRes.body.message);
    }

    // Step 6: Verify API Health
    console.log('\n--- STEP 6: VERIFY API ENDPOINTS ---');
    const healthRes = await makeRequest('GET', '/api/health');
    console.log(healthRes.status === 200 ? '✓ API is healthy' : '✗ API health check failed');

    console.log(`
╔═════════════════════════════════════════╗
║  SETUP COMPLETE                         ║
╚═════════════════════════════════════════╝

Test Accounts Created:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Admin:
  Email: admin@smartious.ac.ke
  Password: AdminPass123!
  Role: Admin

Teacher:
  Email: teacher@smartious.ac.ke
  Password: TeacherPass123!
  Role: Teacher

Student:
  Email: student@smartious.ac.ke
  Password: StudentPass123!
  Role: Student

Now run: node allocations-test.js
`);

  } catch (error) {
    console.error('\n✗ Setup Error:', error.message);
  }
}

setup();

