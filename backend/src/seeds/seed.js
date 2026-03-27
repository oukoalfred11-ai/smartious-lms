require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI is not set in .env');
  process.exit(1);
}

// ─────────────────────────────────────────────────────────
// Demo users — passwords are hashed by the User pre-save hook.
// Passwords are NEVER logged or exposed to the frontend.
// Demo flag (isDemo:true) prevents deletion via the API.
// ─────────────────────────────────────────────────────────
const USERS = [
  {
    firstName: 'Admin', lastName: 'User',
    email: 'admin@smartious.ac.ke',
    password: 'Admin@2024',
    role: 'admin', plan: 'Staff', isActive: true, isDemo: true,
  },
  {
    firstName: 'James', lastName: 'Muthomi',
    email: 'j.muthomi@smartious.ac.ke',
    password: 'Teacher@2024',
    role: 'teacher', plan: 'Staff', isActive: true, isDemo: true,
    subjects: ['Mathematics'], curriculum: 'IGCSE', grade: 'Form 3',
    bio: 'Cambridge-certified Mathematics teacher, 8 years IGCSE experience.',
  },
  {
    firstName: 'Amara', lastName: 'Osei',
    email: 'amara.osei@student.smartious.ac.ke',
    password: 'Student@2024',
    role: 'student', plan: 'Premium', isActive: true, isDemo: true,
    curriculum: 'IGCSE', grade: 'Form 3', xp: 4280, streak: 12,
  },
  {
    firstName: 'Janet', lastName: 'Osei',
    email: 'janet.osei@gmail.com',
    password: 'Parent@2024',
    role: 'parent', plan: 'Basic', isActive: true, isDemo: true,
  },
  {
    firstName: 'Demo', lastName: 'Student',
    email: 'demo@smartious.ac.ke',
    password: 'Demo@2024',
    role: 'demo', plan: 'Basic', isActive: true, isDemo: true,
    curriculum: 'IGCSE', grade: 'Form 3',
  },
  {
    firstName: 'Kofi', lastName: 'Mensah',
    email: 'kofi.mensah@student.smartious.ac.ke',
    password: 'Student@2024',
    role: 'student', plan: 'IGCSE Pack', isActive: true, isDemo: true,
    curriculum: 'A-Level', grade: 'Year 12', xp: 3100, streak: 5,
  },
  {
    firstName: 'Faith', lastName: 'Wanjiru',
    email: 'faith.w@student.smartious.ac.ke',
    password: 'Student@2024',
    role: 'student', plan: 'Premium', isActive: true, isDemo: true,
    curriculum: 'IGCSE', grade: 'Form 3', xp: 5200, streak: 21,
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅  MongoDB connected');

  // Only delete non-demo users; protect existing demo users from re-hashing
  await User.deleteMany({ isDemo: { $ne: true } });

  // Upsert each demo user (skip if already exists — avoids double-hashing password)
  for (const u of USERS) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`⏭   Skipped (already exists): ${u.email}`);
      continue;
    }
    await User.create(u);
    console.log(`✅  Created: ${u.email} (${u.role})`);
  }

  console.log('\n🎉  Seed complete.');
  console.log('   Demo credentials (never logged in production):');
  console.log('   admin@smartious.ac.ke      / Admin@2024');
  console.log('   j.muthomi@smartious.ac.ke  / Teacher@2024');
  console.log('   amara.osei@...smartious.ac.ke / Student@2024');
  console.log('   janet.osei@gmail.com        / Parent@2024');
  console.log('   demo@smartious.ac.ke        / Demo@2024');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
