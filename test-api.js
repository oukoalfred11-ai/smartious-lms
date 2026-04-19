#!/usr/bin/env node
/**
 * Test script to verify API is working and has data
 */

const jwt = require('jsonwebtoken');
const http = require('http');

const token = jwt.sign({ _id: 'admin-test', role: 'admin' }, process.env.JWT_SECRET || 'test-secret-key');

const makeRequest = (path, method = 'GET') => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

(async () => {
  try {
    console.log('🔍 Testing API endpoints...\n');

    console.log('1️⃣  Testing /users/students/list');
    const studentsRes = await makeRequest('/users/students/list');
    console.log(`   Status: ${studentsRes.status}`);
    if (studentsRes.data.students) {
      console.log(`   Students found: ${studentsRes.data.students.length}`);
      if (studentsRes.data.students.length > 0) {
        const first = studentsRes.data.students[0];
        console.log(`   Sample: ${first.firstName} ${first.lastName} (${first.email})`);
        console.log(`   Subjects: ${Array.isArray(first.subjects) ? first.subjects.length : 0}`);
      }
    }

    console.log('\n2️⃣  Testing /allocations');
    const allocRes = await makeRequest('/allocations');
    console.log(`   Status: ${allocRes.status}`);
    if (allocRes.data.allocations) {
      console.log(`   Allocations found: ${allocRes.data.allocations.length}`);
    }

    console.log('\n✅ API is responding correctly');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();

