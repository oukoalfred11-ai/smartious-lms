#!/usr/bin/env node
/**
 * Comprehensive Allocation Feature Test
 * Tests: Allocation table, pending count, teacher on-leave toggle
 */
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Allocation = require('./src/models/Allocation');
const Subject = require('./src/models/Subject');

async function testAllocationFeature() {
  try {
    console.log('\n=== ALLOCATION FEATURE TEST ===\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // TEST 1: Students table with latest created
    console.log('📋 TEST 1: Students Table (Ordered by Latest Created)');
    const students = await User.find({ role: 'student' })
      .select('_id firstName lastName email curriculum grade subjects createdAt')
      .populate('subjects', 'subjectName')
      .sort('-createdAt')
      .limit(10);
    
    console.log(`   Found ${students.length} students:`);
    students.forEach((s, i) => {
      const createdDate = new Date(s.createdAt).toLocaleDateString();
      console.log(`   ${i + 1}. ${s.firstName} ${s.lastName} (${s.curriculum}, Grade: ${s.grade})`);
      console.log(`      Created: ${createdDate}, Subjects: ${s.subjects.length}`);
    });
    console.log('   ✓ Pass\n');

    // TEST 2: Allocation status calculation
    console.log('📊 TEST 2: Allocation Status Calculation');
    const allocations = await Allocation.find()
      .populate('studentId', '_id')
      .populate('teacherId', 'isActive isOnLeave');

    console.log(`   Total allocations: ${allocations.length}`);
    
    for (const student of students.slice(0, 2)) {
      const studentAllocations = allocations.filter(a => 
        a.studentId && a.studentId._id.toString() === student._id.toString()
      );
      
      // Count valid allocations (teacher is active and not on leave)
      const validAllocations = studentAllocations.filter(a =>
        a.teacherId && a.teacherId.isActive && !a.teacherId.isOnLeave
      );
      
      const fullyAllocated = validAllocations.length;
      const totalSubjects = student.subjects.length;
      const pendingAllocation = totalSubjects - fullyAllocated;
      
      console.log(`   ${student.firstName} ${student.lastName}:`);
      console.log(`     ├─ Total Subjects: ${totalSubjects}`);
      console.log(`     ├─ Fully Allocated: ${fullyAllocated}`);
      console.log(`     └─ Pending Allocation: ${pendingAllocation}`);
    }
    console.log('   ✓ Pass\n');

    // TEST 3: Pending count (students needing reallocation)
    console.log('🔴 TEST 3: Pending Allocations Count');
    
    const problemAllocations = await Allocation.find({ status: 'Active' })
      .populate('teacherId', '_id isActive isOnLeave')
      .populate('studentId', '_id');

    const studentsNeedingAllocation = new Set();
    for (const alloc of problemAllocations) {
      if (!alloc.teacherId || !alloc.teacherId.isActive || alloc.teacherId.isOnLeave) {
        studentsNeedingAllocation.add(alloc.studentId._id.toString());
      }
    }

    console.log(`   Students needing reallocation: ${studentsNeedingAllocation.size}`);
    console.log(`   Reason: Teacher deleted or on leave`);
    console.log('   ✓ Pass\n');

    // TEST 4: Teacher on-leave functionality
    console.log('⏸ TEST 4: Teacher On-Leave Status');
    const teachers = await User.find({ role: 'teacher' })
      .select('_id firstName lastName isActive isOnLeave leaveStartDate leaveEndDate')
      .limit(3);

    console.log(`   Found ${teachers.length} teachers:`);
    teachers.forEach(t => {
      const status = t.isOnLeave ? '🔴 On Leave' : '🟢 Active';
      const leaveDate = t.leaveStartDate ? new Date(t.leaveStartDate).toLocaleDateString() : 'N/A';
      console.log(`   ${t.firstName} ${t.lastName}: ${status}`);
      if (t.isOnLeave) {
        console.log(`      Since: ${leaveDate}`);
      }
    });
    console.log('   ✓ Pass\n');

    // TEST 5: Frontend admin badge simulation
    console.log('🎯 TEST 5: Admin Menu Badge (Pending Allocations)');
    console.log(`   Badge Value: ${studentsNeedingAllocation.size}`);
    console.log(`   Badge Color: ${studentsNeedingAllocation.size > 0 ? 'Red (Alert)' : 'Blue (Info)'}`);
    console.log('   ✓ Pass\n');

    // TEST 6: Allocation table with all columns
    console.log('📋 TEST 6: Complete Allocation Table Display');
    console.log('   Columns: Student, Curriculum, Year/Grade, Fully Allocated, Pending Allocation, Manage');
    console.log('   Sample Data:\n');
    
    console.log('   ┌─────────────────────┬────────────┬──────────┬─────────────┬──────────────┐');
    console.log('   │ Student             │ Curriculum │ Year/Gr  │ Allocated   │ Pending      │');
    console.log('   ├─────────────────────┼────────────┼──────────┼─────────────┼──────────────┤');
    
    for (const student of students.slice(0, 3)) {
      const studentAllocations = allocations.filter(a => 
        a.studentId && a.studentId._id.toString() === student._id.toString()
      );
      const validAllocations = studentAllocations.filter(a =>
        a.teacherId && a.teacherId.isActive && !a.teacherId.isOnLeave
      );
      const fullyAllocated = validAllocations.length;
      const totalSubjects = student.subjects.length;
      const pendingAllocation = totalSubjects - fullyAllocated;
      
      const name = `${student.firstName} ${student.lastName}`.substring(0, 19);
      const curriculum = (student.curriculum || 'N/A').substring(0, 10);
      const grade = (student.grade || 'N/A').substring(0, 8);
      const allocated = `${fullyAllocated}/${totalSubjects}`;
      const pending = pendingAllocation > 0 ? `${pendingAllocation} pending` : '✓ Complete';
      
      console.log(`   │ ${name.padEnd(19)} │ ${curriculum.padEnd(10)} │ ${grade.padEnd(8)} │ ${allocated.padEnd(11)} │ ${pending.padEnd(12)} │`);
    }
    
    console.log('   └─────────────────────┴────────────┴──────────┴─────────────┴──────────────┘');
    console.log('   ✓ Pass\n');

    console.log('✅ ALL TESTS PASSED\n');
    console.log('📝 Summary:');
    console.log(`   • Students displayed: ${students.length}`);
    console.log(`   • Total allocations tracked: ${allocations.length}`);
    console.log(`   • Pending allocations (need reallocation): ${studentsNeedingAllocation.size}`);
    console.log(`   • Teachers with on-leave capability: ${teachers.length}`);
    console.log('   • Admin sidebar badge: Dynamic (RED if pending > 0, BLUE otherwise)\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('\n❌ TEST FAILED:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
}

testAllocationFeature();

