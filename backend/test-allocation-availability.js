#!/usr/bin/env node
/**
 * Diagnostic: Check if teachers are available for student allocation
 */
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Subject = require('./src/models/Subject');

async function testAllocationAvailability() {
  try {
    console.log('\n=== ALLOCATION AVAILABILITY DIAGNOSTIC ===\n');
    
    await mongoose.connect(process.env.MONGODB_URI);

    // Find Dave Student
    const student = await User.findOne({ 
      firstName: 'Dave',
      lastName: 'Student',
      role: 'student'
    }).populate('subjects');

    if (!student) {
      console.log('❌ Dave Student not found');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`📚 STUDENT: ${student.firstName} ${student.lastName}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Curriculum: ${student.curriculum}`);
    console.log(`   Total Subjects: ${student.subjects.length}\n`);

    if (!student.subjects || student.subjects.length === 0) {
      console.log('⚠️  Student has no subjects\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('📖 STUDENT SUBJECTS:');
    for (const subject of student.subjects) {
      console.log(`   - ${subject.subjectName} (${subject.curriculum})`);
    }
    console.log();

    // Get all teachers
    const allTeachers = await User.find({ role: 'teacher', isActive: true })
      .select('firstName lastName email curriculum subjects teachingSpecialties')
      .populate('subjects', 'subjectName');

    console.log(`👨‍🏫 TOTAL TEACHERS: ${allTeachers.length}\n`);

    if (allTeachers.length === 0) {
      console.log('❌ No active teachers found\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Check each subject to see if there are qualified teachers
    console.log('🔍 CHECKING SUBJECT QUALIFICATIONS:\n');

    for (const subject of student.subjects) {
      console.log(`Subject: ${subject.subjectName} (ID: ${subject._id})`);
      console.log(`  Required: ${subject.subjectName} + ${student.curriculum}\n`);

      const qualifiedTeachers = [];

      for (const teacher of allTeachers) {
        // Check if teacher has this subject + curriculum in teachingSpecialties
        const hasSpecialty = teacher.teachingSpecialties?.some(ts => 
          ts.subjectId.toString() === subject._id.toString() && 
          ts.curriculum === student.curriculum
        );

        if (hasSpecialty) {
          qualifiedTeachers.push(teacher);
          console.log(`  ✅ QUALIFIED: ${teacher.firstName} ${teacher.lastName}`);
          console.log(`     Email: ${teacher.email}`);
          console.log(`     Specialties: ${teacher.teachingSpecialties.filter(ts => ts.curriculum === student.curriculum).length} for ${student.curriculum}`);
        }
      }

      if (qualifiedTeachers.length === 0) {
        console.log(`  ❌ NO QUALIFIED TEACHERS FOUND`);
      }
      console.log();
    }

    // Summary of all teachers and their specialties
    console.log('\n=== TEACHER SPECIALTIES SUMMARY ===\n');
    for (const teacher of allTeachers) {
      console.log(`👨‍🏫 ${teacher.firstName} ${teacher.lastName}`);
      console.log(`   Email: ${teacher.email}`);
      console.log(`   Curriculum: ${Array.isArray(teacher.curriculum) ? teacher.curriculum.join(', ') : teacher.curriculum}`);
      console.log(`   Total Specialties: ${teacher.teachingSpecialties?.length || 0}`);
      
      if (teacher.teachingSpecialties && teacher.teachingSpecialties.length > 0) {
        console.log(`   Specialties:`);
        for (const specialty of teacher.teachingSpecialties) {
          console.log(`     - Subject ID: ${specialty.subjectId}, Curriculum: ${specialty.curriculum}`);
        }
      } else {
        console.log(`   ⚠️  No specialties defined`);
      }
      console.log();
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  }
}

testAllocationAvailability();

