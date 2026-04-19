const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Teacher = require('./src/models/Teacher');
const Subject = require('./src/models/Subject');

async function verifyDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected\n');

    // ==========================================
    // 1. VERIFY SUBJECT COLLECTION
    // ==========================================
    console.log('═══════════════════════════════════════════');
    console.log('📚 SUBJECT COLLECTION VERIFICATION');
    console.log('═══════════════════════════════════════════\n');

    const subjectCount = await Subject.countDocuments();
    console.log(`Total subjects in database: ${subjectCount}`);

    const subjectsByCurriculum = await Subject.aggregate([
      { $group: { _id: '$curriculum', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\nSubjects by curriculum:');
    subjectsByCurriculum.forEach(item => {
      console.log(`  • ${item._id}: ${item.count} subjects`);
    });

    // Sample 3 subjects
    const sampleSubjects = await Subject.find().limit(3);
    console.log('\nSample subjects from database:');
    sampleSubjects.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.subjectName}`);
      console.log(`     - ID: ${s._id}`);
      console.log(`     - Curriculum: ${s.curriculum}`);
      console.log(`     - Category: ${s.category}`);
    });

    // ==========================================
    // 2. VERIFY USER COLLECTION - STUDENTS
    // ==========================================
    console.log('\n═══════════════════════════════════════════');
    console.log('👤 USER COLLECTION - STUDENTS');
    console.log('═══════════════════════════════════════════\n');

    const studentCount = await User.countDocuments({ role: 'student' });
    console.log(`Total students: ${studentCount}`);

    const students = await User.find({ role: 'student' })
      .select('firstName lastName email curriculum subjects')
      .populate('subjects', 'subjectName curriculum')
      .limit(5);

    console.log('\nSample students:');
    students.forEach((s, i) => {
      console.log(`\n  ${i + 1}. ${s.firstName} ${s.lastName}`);
      console.log(`     Email: ${s.email}`);
      console.log(`     Curriculum (stored): ${s.curriculum || '(empty)'}`);
      console.log(`     Subjects (stored as ObjectIds):`);
      if (s.subjects && s.subjects.length > 0) {
        s.subjects.forEach(subj => {
          console.log(`       - ${subj._id} → ${subj.subjectName}`);
        });
      } else {
        console.log(`       (none assigned)`);
      }
    });

    // ==========================================
    // 3. VERIFY USER COLLECTION - TEACHERS
    // ==========================================
    console.log('\n═══════════════════════════════════════════');
    console.log('👨‍🏫 USER COLLECTION - TEACHERS');
    console.log('═══════════════════════════════════════════\n');

    const teacherCount = await User.countDocuments({ role: 'teacher' });
    console.log(`Total teachers in User collection: ${teacherCount}`);

    const teachers = await User.find({ role: 'teacher' })
      .select('firstName lastName email curriculum subjects isDemo')
      .populate('subjects', 'subjectName curriculum')
      .sort('firstName');

    console.log('\nAll teachers:');
    teachers.forEach((t, i) => {
      console.log(`\n  ${i + 1}. ${t.firstName} ${t.lastName}`);
      console.log(`     Email: ${t.email}`);
      console.log(`     Demo: ${t.isDemo ? '✓ Yes (demo account)' : '✗ No (real account)'}`);
      console.log(`     Curriculum (stored): ${t.curriculum || '(empty)'}`);
      console.log(`     Subjects (stored as ObjectIds):`);
      if (t.subjects && t.subjects.length > 0) {
        t.subjects.forEach(subj => {
          console.log(`       - ${subj._id} → ${subj.subjectName} (${subj.curriculum})`);
        });
      } else {
        console.log(`       (none assigned)`);
      }
    });

    // ==========================================
    // 4. VERIFY TEACHER COLLECTION
    // ==========================================
    console.log('\n═══════════════════════════════════════════');
    console.log('📋 TEACHER COLLECTION');
    console.log('═══════════════════════════════════════════\n');

    const teacherCollectionCount = await Teacher.countDocuments();
    console.log(`Total teachers in Teacher collection: ${teacherCollectionCount}`);

    const teacherRecords = await Teacher.find()
      .select('firstName lastName email curriculum subjects')
      .populate('subjects', 'subjectName curriculum')
      .sort('firstName');

    console.log('\nAll teacher records:');
    teacherRecords.forEach((t, i) => {
      console.log(`\n  ${i + 1}. ${t.firstName} ${t.lastName}`);
      console.log(`     Email: ${t.email}`);
      console.log(`     Curriculum (stored): ${t.curriculum || '(empty)'}`);
      console.log(`     Subjects (stored as ObjectIds):`);
      if (t.subjects && t.subjects.length > 0) {
        t.subjects.forEach(subj => {
          console.log(`       - ${subj._id} → ${subj.subjectName}`);
        });
      } else {
        console.log(`       (none assigned)`);
      }
    });

    // ==========================================
    // 5. DATA INTEGRITY CHECKS
    // ==========================================
    console.log('\n═══════════════════════════════════════════');
    console.log('✓ DATA INTEGRITY CHECKS');
    console.log('═══════════════════════════════════════════\n');

    // Check 1: Users with invalid subject ObjectIds
    console.log('Check 1: Validating subject ObjectId references...');
    const allUsersWithSubjects = await User.find({ 
      subjects: { $exists: true, $ne: [] }
    }).lean();

    let invalidSubjectsCount = 0;
    const usersWithStringSubjects = [];
    
    for (const user of allUsersWithSubjects) {
      for (const subjectId of user.subjects) {
        // Check if it's a valid ObjectId or a string
        if (typeof subjectId === 'string' && subjectId.length !== 24) {
          invalidSubjectsCount++;
          usersWithStringSubjects.push({
            user: `${user.firstName} ${user.lastName}`,
            email: user.email,
            subject: subjectId
          });
        } else if (typeof subjectId === 'object') {
          const subject = await Subject.findById(subjectId);
          if (!subject) {
            invalidSubjectsCount++;
            console.log(`  ⚠ User ${user.firstName} has invalid subject ID: ${subjectId}`);
          }
        }
      }
    }
    
    if (invalidSubjectsCount === 0) {
      console.log('  ✓ All subject ObjectIds are valid');
    } else {
      console.log(`  ❌ Found ${invalidSubjectsCount} invalid subject references!`);
      if (usersWithStringSubjects.length > 0) {
        console.log('\n  Users with STRING subjects (should be ObjectIds):');
        usersWithStringSubjects.forEach(item => {
          console.log(`    - ${item.user} (${item.email})`);
          console.log(`      Subject stored as: "${item.subject}"`);
        });
      }
    }

    // Check 2: Curriculum enum validation
    console.log('\nCheck 2: Validating curriculum values...');
    const validCurriculums = ['IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC', 'BNC', 'American'];
    
    const usersWithInvalidCurr = await User.find({
      role: { $in: ['teacher', 'student'] },
      curriculum: { $exists: true, $ne: '', $ne: null }
    }).lean();

    let invalidCurrCount = 0;
    usersWithInvalidCurr.forEach(user => {
      // Handle both string (single curriculum) and array
      const currArray = Array.isArray(user.curriculum) 
        ? user.curriculum 
        : [user.curriculum];
      
      currArray.forEach(curr => {
        if (curr && !validCurriculums.includes(curr)) {
          invalidCurrCount++;
          console.log(`  ⚠ User ${user.firstName} has invalid curriculum: "${curr}"`);
        }
      });
    });
    if (invalidCurrCount === 0) {
      console.log('  ✓ All curriculum values are valid');
    }

    // Check 3: Record count comparison
    console.log('\nCheck 3: User vs Teacher collection comparison...');
    const userTeachers = await User.countDocuments({ role: 'teacher' });
    const teacherRecords2 = await Teacher.countDocuments();
    console.log(`  User collection (teachers): ${userTeachers}`);
    console.log(`  Teacher collection: ${teacherRecords2}`);
    if (teacherRecords2 <= userTeachers) {
      console.log(`  ✓ Teacher records are in sync (or User has more due to new records)`);
    }

    // ==========================================
    // 6. SAMPLE DATA DUMP (RAW JSON)
    // ==========================================
    console.log('\n═══════════════════════════════════════════');
    console.log('📊 SAMPLE RAW DATA DUMP');
    console.log('═══════════════════════════════════════════\n');

    // Get one student with subjects
    const sampleStudent = await User.findOne({ role: 'student', subjects: { $ne: [] } })
      .populate('subjects', 'subjectName curriculum category');
    
    if (sampleStudent) {
      console.log('Sample Student (JSON):');
      console.log(JSON.stringify({
        firstName: sampleStudent.firstName,
        lastName: sampleStudent.lastName,
        email: sampleStudent.email,
        curriculum: sampleStudent.curriculum,
        subjects: sampleStudent.subjects.map(s => ({
          _id: s._id,
          subjectName: s.subjectName,
          curriculum: s.curriculum,
          category: s.category
        }))
      }, null, 2));
    }

    // Get one teacher with subjects
    const sampleTeacher = await User.findOne({ role: 'teacher', subjects: { $ne: [] } })
      .populate('subjects', 'subjectName curriculum category');
    
    if (sampleTeacher) {
      console.log('\nSample Teacher (JSON):');
      console.log(JSON.stringify({
        firstName: sampleTeacher.firstName,
        lastName: sampleTeacher.lastName,
        email: sampleTeacher.email,
        curriculum: sampleTeacher.curriculum,
        subjects: sampleTeacher.subjects.map(s => ({
          _id: s._id,
          subjectName: s.subjectName,
          curriculum: s.curriculum,
          category: s.category
        }))
      }, null, 2));
    }

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('\n═══════════════════════════════════════════');
    console.log('✅ DATABASE VERIFICATION COMPLETE');
    console.log('═══════════════════════════════════════════');
    console.log(`
Summary:
  • Subjects in database: ${subjectCount}
  • Students: ${studentCount}
  • Teachers (User collection): ${userTeachers}
  • Teachers (Teacher collection): ${teacherRecords2}
  • Subject references: ${invalidSubjectsCount === 0 ? '✓ Valid' : '✗ Invalid'}
  • Curriculum values: ${invalidCurrCount === 0 ? '✓ Valid' : '✗ Invalid'}
    `);

    await mongoose.connection.close();
    console.log('Database connection closed.\n');
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error(e);
    process.exit(1);
  }
}

verifyDatabase();

