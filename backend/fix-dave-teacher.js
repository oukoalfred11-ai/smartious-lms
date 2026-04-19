#!/usr/bin/env node
/**
 * Fix Dave Teacher - Rebuild teachingSpecialties
 */
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Subject = require('./src/models/Subject');

async function fixDaveTeacher() {
  try {
    console.log('\n=== FIXING DAVE TEACHER ===\n');
    
    await mongoose.connect(process.env.MONGODB_URI);

    // Find Dave Teacher
    const teacher = await User.findOne({ 
      firstName: 'Dave',
      lastName: 'Teacher',
      role: 'teacher'
    }).populate('subjects');

    if (!teacher) {
      console.log('❌ Dave Teacher not found');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`👨‍🏫 Found: ${teacher.firstName} ${teacher.lastName}`);
    console.log(`   Email: ${teacher.email}`);
    console.log(`   Curriculum: ${teacher.curriculum}`);
    console.log(`   Subjects: ${teacher.subjects.length}\n`);

    // Build teachingSpecialties
    const teachingSpecialties = [];
    const teachingCurricula = Array.isArray(teacher.curriculum) ? teacher.curriculum : (teacher.curriculum ? [teacher.curriculum] : []);
    
    console.log(`📚 Building specialties for curricula: ${teachingCurricula.join(', ')}\n`);
    
    for (const subject of teacher.subjects) {
      const subjectId = subject._id || subject;
      for (const curr of teachingCurricula) {
        teachingSpecialties.push({
          subjectId: subjectId,
          curriculum: curr
        });
        console.log(`   ✓ Added: ${subject.subjectName} (${curr})`);
      }
    }

    // Update teacher with teachingSpecialties
    teacher.teachingSpecialties = teachingSpecialties;
    await teacher.save();

    console.log(`\n✅ Updated! ${teacher.firstName} ${teacher.lastName} now has ${teachingSpecialties.length} specialties\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  }
}

fixDaveTeacher();

