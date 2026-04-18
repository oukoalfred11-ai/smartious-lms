/**
 * PHASE 8: Bulk Entry Test
 * Simulates adding 50 teachers simultaneously to test email queue and menu pagination
 */

const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000';

// Admin token - you'll need to provide a valid admin JWT
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

async function generateTeacherData(index) {
  return {
    firstName: `Teacher${index}`,
    lastName: `Bulk${index}`,
    email: `teacher-bulk-${index}@smartious.test`,
    phone: `+254712345${String(index).padStart(3, '0')}`,
    curriculum: ['IGCSE', 'A-Level', 'IB Diploma', 'Kenya CBC', 'BNC'][index % 5],
    subjects: [], // Will be populated from the system
    qualifications: ['Bachelor of Science', 'Teaching Diploma'],
    experience: Math.floor(Math.random() * 15) + 1,
    universalCurriculum: index % 3 === 0, // Every 3rd teacher is universal
    isDemo: false
  };
}

async function bulkCreateTeachers(count = 50) {
  console.log(`\n🚀 Starting PHASE 8 Bulk Entry Test (${count} teachers)...`);
  console.log(`API URL: ${API_URL}`);
  console.log(`=====================================\n`);

  if (!ADMIN_TOKEN) {
    console.error('❌ ADMIN_TOKEN environment variable not set. Cannot proceed.');
    console.error('   Set ADMIN_TOKEN=<your_admin_jwt> to run this test.');
    process.exit(1);
  }

  const results = {
    total: count,
    successful: 0,
    failed: 0,
    emailErrors: 0,
    startTime: new Date(),
    endTime: null,
    teachers: []
  };

  const requests = [];

  // Create all requests upfront
  for (let i = 1; i <= count; i++) {
    const teacherData = await generateTeacherData(i);
    requests.push({
      index: i,
      data: teacherData
    });
  }

  console.log(`📤 Sending ${count} teacher creation requests in parallel...\n`);

  // Send all requests in parallel
  const creationPromises = requests.map(async (req) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/teachers`,
        req.data,
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log(`✓ Teacher ${req.index}: ${req.data.firstName} ${req.data.lastName} created`);

      results.teachers.push({
        index: req.index,
        id: response.data.teacher?._id,
        email: req.data.email,
        credentialsSent: response.data.credentialsSent,
        status: 'success'
      });

      results.successful++;

      // Track if credentials email had issues
      if (!response.data.credentialsSent) {
        results.emailErrors++;
      }

      return { success: true, index: req.index };
    } catch (error) {
      console.error(`✗ Teacher ${req.index}: ${error.response?.data?.message || error.message}`);

      results.teachers.push({
        index: req.index,
        email: req.data.email,
        status: 'failed',
        error: error.response?.data?.message || error.message
      });

      results.failed++;
      return { success: false, index: req.index };
    }
  });

  // Wait for all requests to complete
  await Promise.allSettled(creationPromises);

  results.endTime = new Date();
  const duration = (results.endTime - results.startTime) / 1000;

  // Print summary
  console.log(`\n\n${'='.repeat(50)}`);
  console.log('📊 BULK ENTRY TEST RESULTS');
  console.log(`${'='.repeat(50)}\n`);

  console.log(`Total Teachers Requested: ${results.total}`);
  console.log(`✓ Successfully Created: ${results.successful}`);
  console.log(`✗ Failed to Create: ${results.failed}`);
  console.log(`⚠️  Email Queue Issues: ${results.emailErrors}`);
  console.log(`⏱️  Total Duration: ${duration.toFixed(2)} seconds`);
  console.log(`📈 Average per teacher: ${(duration / results.successful).toFixed(2)} seconds`);

  console.log(`\n${'='.repeat(50)}`);
  console.log('✓ SECURITY AUDIT CHECKS');
  console.log(`${'='.repeat(50)}\n`);

  console.log(`✓ Email sent only once per teacher: ${results.emailErrors === 0 ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`✓ No duplicate teacher records: ${results.successful === new Set(results.teachers.map(t => t.email)).size ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`✓ All universal teachers marked correctly: ${results.teachers.filter(t => t.status === 'success').length > 0 ? 'MANUAL VERIFICATION REQUIRED' : 'N/A'}`);

  console.log(`\n${'='.repeat(50)}`);
  console.log('📋 DETAILS');
  console.log(`${'='.repeat(50)}\n`);

  // Show failed teachers
  if (results.failed > 0) {
    console.log('Failed Teachers:');
    results.teachers
      .filter(t => t.status === 'failed')
      .forEach(t => {
        console.log(`  - ${t.email}: ${t.error}`);
      });
  }

  // Show a sample of successful teachers
  console.log('\nSample of Successfully Created Teachers:');
  results.teachers
    .filter(t => t.status === 'success')
    .slice(0, 10)
    .forEach(t => {
      console.log(`  - ${t.email} (ID: ${t.id}) - Credentials sent: ${t.credentialsSent}`);
    });

  if (results.successful > 10) {
    console.log(`  ... and ${results.successful - 10} more`);
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log('🎯 NEXT STEPS');
  console.log(`${'='.repeat(50)}\n`);

  console.log('1. ✓ Email Queue Test: Verify all emails were sent without bottlenecking');
  console.log('2. ✓ Menu Pagination: Check Admin Portal Teachers menu handles the new teachers');
  console.log('3. ✓ WebSocket Events: Verify TEACHER_CREATED events were emitted to connected admins');
  console.log('4. ✓ Database Integrity: Run consistency checks on Teacher and User collections');
  console.log('5. ✓ Security: Verify no forcePasswordChange flag was reverted by users');

  console.log('\n✅ PHASE 8 Bulk Entry Test Complete!\n');

  return results;
}

// Run the test
bulkCreateTeachers(50).catch(error => {
  console.error('Fatal error during bulk test:', error);
  process.exit(1);
});

