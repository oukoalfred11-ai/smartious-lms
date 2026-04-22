#!/usr/bin/env node
/**
 * Updated Allocation Feature Test - With Fixed Pending Count Logic
 */
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Allocation = require('./src/models/Allocation');
const Subject = require('./src/models/Subject');

async function testPendingCount() {
  try {
    console.log('\n=== UPDATED PENDING COUNT TEST ===\n');
    
    await mongoose.connect(process.env.MONGODB_URI);

    // Get all students with subjects
    const students = await User.find({ role: 'student' })
      .select('_id firstName lastName subjects')
      .populate('subjects', '_id');

    console.log(`📊 Total students: ${students.length}\n`);

    // Get all active allocations with valid teachers
    const allocations = await Allocation.find({ status: 'Active' })
      .populate('teacherId', '_id isActive isOnLeave')
      .populate('studentId', '_id');

    console.log(`📋 Total allocations: ${allocations.length}\n`);

    // Calculate pending count
    const studentsNeedingAllocation = new Set();

    for (const student of students) {
      if (!student.subjects || student.subjects.length === 0) {
        console.log(`⏭ ${student.firstName} ${student.lastName}: No subjects enrolled`);
        continue;
      }

      const studentSubjectIds = student.subjects.map(s => s._id.toString());

      // Get valid allocations for this student
      const validAllocations = allocations.filter(a => 
        a.studentId && a.studentId._id.toString() === student._id.toString() &&
        a.teacherId && a.teacherId.isActive && !a.teacherId.isOnLeave
      );

      const allocatedSubjectIds = new Set(validAllocations.map(a => a.subjectId.toString()));
      const unallocatedCount = studentSubjectIds.length - allocatedSubjectIds.size;

      console.log(`📌 ${student.firstName} ${student.lastName}:`);
      console.log(`   Total subjects: ${studentSubjectIds.length}`);
      console.log(`   Valid allocations: ${allocatedSubjectIds.size}`);
      console.log(`   Unallocated: ${unallocatedCount}`);

      if (unallocatedCount > 0) {
        studentsNeedingAllocation.add(student._id.toString());
        console.log(`   ⚠️  NEEDS ALLOCATION\n`);
      } else {
        console.log(`   ✓ Complete\n`);
      }
    }

    console.log(`\n📊 RESULT:`);
    console.log(`   Students needing allocation: ${studentsNeedingAllocation.size}`);
    console.log(`   Badge should show: ${studentsNeedingAllocation.size > 0 ? studentsNeedingAllocation.size : 'empty'}`);
    console.log(`   Badge color: ${studentsNeedingAllocation.size > 0 ? '🔴 RED' : '🔵 BLUE'}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  }
}

testPendingCount();

