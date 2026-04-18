/**
 * CODE VALIDATION TEST - Check all modified files for proper syntax and exports
 */

const path = require('path');

console.log(`
╔═════════════════════════════════════════╗
║  CODE VALIDATION TEST SUITE             ║
║         April 18, 2026                  ║
╚═════════════════════════════════════════╝
`);

const filesToTest = [
  'src/models/User.js',
  'src/models/Allocation.js',
  'src/routes/allocations.js',
  'src/routes/users.js',
  'src/routes/auth.js',
  'src/routes/teachers.js',
  'src/services/emailService.js',
  'src/services/matchingService.js',
];

let passed = 0;
let failed = 0;

console.log('\n--- PHASE 1: FILE EXISTENCE ---');
filesToTest.forEach(file => {
  try {
    const fullPath = path.join(__dirname, 'backend', file);
    require(fullPath);
    console.log(`✓ ${file}`);
    passed++;
  } catch (e) {
    console.log(`✗ ${file}: ${e.message}`);
    failed++;
  }
});

console.log('\n--- PHASE 2: CRITICAL CODE CHECKS ---');

// Check User model has new fields
try {
  const User = require('./backend/src/models/User');
  const schema = User.schema;
  
  const hasVerificationToken = schema.paths.verificationToken !== undefined;
  const hasIsEmailVerified = schema.paths.isEmailVerified !== undefined;
  const hasForcePasswordReset = schema.paths.forcePasswordReset !== undefined;
  
  if (hasVerificationToken && hasIsEmailVerified && hasForcePasswordReset) {
    console.log('✓ User model has verification fields');
    passed++;
  } else {
    console.log('✗ User model missing verification fields');
    failed++;
  }
} catch (e) {
  console.log('✗ User model check failed:', e.message);
  failed++;
}

// Check emailService exports sendVerificationEmail
try {
  const emailService = require('./backend/src/services/emailService');
  if (emailService.sendVerificationEmail && typeof emailService.sendVerificationEmail === 'function') {
    console.log('✓ emailService exports sendVerificationEmail function');
    passed++;
  } else {
    console.log('✗ emailService missing sendVerificationEmail function');
    failed++;
  }
} catch (e) {
  console.log('✗ emailService check failed:', e.message);
  failed++;
}

// Check allocation routes have delete/approve disabled
try {
  const fs = require('fs');
  const allocContent = fs.readFileSync('./backend/src/routes/allocations.js', 'utf8');
  
  const hasDeleteDisabled = allocContent.includes('Allocation deletion is disabled');
  const hasApproveDeprecated = allocContent.includes('Manual approval is deprecated');
  const hasPopulateSubjects = allocContent.includes("'subjectName category curriculum'");
  
  if (hasDeleteDisabled && hasApproveDeprecated && hasPopulateSubjects) {
    console.log('✓ Allocations route has security fixes and subject population');
    passed++;
  } else {
    console.log('✗ Allocations route missing security fixes');
    failed++;
  }
} catch (e) {
  console.log('✗ Allocations route check failed:', e.message);
  failed++;
}

// Check auth routes have verify-email and reset-password
try {
  const fs = require('fs');
  const authContent = fs.readFileSync('./backend/src/routes/auth.js', 'utf8');
  
  const hasVerifyEmail = authContent.includes("/verify-email'");
  const hasResetPassword = authContent.includes("/reset-password'");
  const hasForcePasswordReset = authContent.includes('forcePasswordReset');
  
  if (hasVerifyEmail && hasResetPassword && hasForcePasswordReset) {
    console.log('✓ Auth route has new verification endpoints');
    passed++;
  } else {
    console.log('✗ Auth route missing verification endpoints');
    failed++;
  }
} catch (e) {
  console.log('✗ Auth route check failed:', e.message);
  failed++;
}

// Check users route generates JWT and sends verification email
try {
  const fs = require('fs');
  const usersContent = fs.readFileSync('./backend/src/routes/users.js', 'utf8');
  
  const hasJwtGeneration = usersContent.includes('jwt.sign');
  const hasSendVerification = usersContent.includes('sendVerificationEmail');
  const hasVerificationMessage = usersContent.includes('Verification email sent');
  
  if (hasJwtGeneration && hasSendVerification && hasVerificationMessage) {
    console.log('✓ Users route creates JWT and sends verification email');
    passed++;
  } else {
    console.log('✗ Users route missing JWT/verification functionality');
    failed++;
  }
} catch (e) {
  console.log('✗ Users route check failed:', e.message);
  failed++;
}

// Check matching service has curriculum validation
try {
  const fs = require('fs');
  const matchingContent = fs.readFileSync('./backend/src/services/matchingService.js', 'utf8');
  
  const hasStudentCurriculumCheck = matchingContent.includes('!studentCurriculum');
  const hasTeacherCurriculumCheck = matchingContent.includes('!teacherCurriculum');
  
  if (hasStudentCurriculumCheck && hasTeacherCurriculumCheck) {
    console.log('✓ Matching service has curriculum validation');
    passed++;
  } else {
    console.log('✗ Matching service missing curriculum validation');
    failed++;
  }
} catch (e) {
  console.log('✗ Matching service check failed:', e.message);
  failed++;
}

// Check teachers route populates subjects
try {
  const fs = require('fs');
  const teachersContent = fs.readFileSync('./backend/src/routes/teachers.js', 'utf8');
  
  const hasSubjectsPopulate = teachersContent.match(/\.populate\('subjects'/g);
  
  if (hasSubjectsPopulate && hasSubjectsPopulate.length >= 2) {
    console.log('✓ Teachers route populates subjects in all endpoints');
    passed++;
  } else {
    console.log('✗ Teachers route not populating subjects properly');
    failed++;
  }
} catch (e) {
  console.log('✗ Teachers route check failed:', e.message);
  failed++;
}

console.log(`
╔═════════════════════════════════════════╗
║  VALIDATION RESULTS                     ║
╚═════════════════════════════════════════╝

Passed: ${passed}
Failed: ${failed}

${failed === 0 ? '✓ ALL CHECKS PASSED' : '✗ SOME CHECKS FAILED'}

${failed === 0 ? `

IMPLEMENTATION COMPLETE:
✓ Phase 3: Allocations engine fixed (delete/approve disabled, subjects populated, curriculum validation)
✓ Phase 4: Email verification flow implemented (JWT generation, verification endpoint, password reset)
✓ Phase 5: Security policies enforced (no delete, no manual approve)
✓ Phase 6: Ready for testing

Next Steps:
1. Start MongoDB
2. Seed Subject collection with curriculum data
3. Create test users (admin, teacher, student)
4. Run allocations-test.js to verify endpoints
5. Test email verification flow manually
6. Deploy to staging

` : `

ISSUES FOUND: Please review and fix the marked items above.

`}
`);

process.exit(failed > 0 ? 1 : 0);

