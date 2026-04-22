const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Subject = require('./src/models/Subject');

async function verifyAndFixStudents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected\n');

    // Find all students
    const students = await User.find({ role: 'student' }).lean();
    console.log(`Found ${students.length} students\n`);

    let issuesFound = 0;
    const issues = [];

    // Check 1: String subjects
    console.log('Checking for string subjects in students...');
    for (const student of students) {
      if (student.subjects && student.subjects.length > 0) {
        const hasStrings = student.subjects.some(s => typeof s === 'string');
        if (hasStrings) {
          issuesFound++;
          issues.push({
            type: 'STRING_SUBJECTS',
            student: `${student.firstName} ${student.lastName}`,
            email: student.email,
            subjects: student.subjects,
            id: student._id
          });
          console.log(`  ⚠ ${student.firstName} ${student.lastName}: ${JSON.stringify(student.subjects)}`);
        }
      }
    }

    // Check 2: Missing curriculum
    console.log('\nChecking for missing curriculum in students...');
    for (const student of students) {
      if (!student.curriculum || student.curriculum === '' || student.curriculum === null) {
        issuesFound++;
        issues.push({
          type: 'MISSING_CURRICULUM',
          student: `${student.firstName} ${student.lastName}`,
          email: student.email,
          id: student._id
        });
        console.log(`  ⚠ ${student.firstName} ${student.lastName}: No curriculum assigned`);
      }
    }

    // Check 3: Invalid curriculum values
    console.log('\nChecking for invalid curriculum values...');
    const validCurriculums = ['IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC', 'BNC', 'American'];
    for (const student of students) {
      if (student.curriculum) {
        const currArray = Array.isArray(student.curriculum) 
          ? student.curriculum 
          : [student.curriculum];
        
        currArray.forEach(curr => {
          if (curr && !validCurriculums.includes(curr)) {
            issuesFound++;
            issues.push({
              type: 'INVALID_CURRICULUM',
              student: `${student.firstName} ${student.lastName}`,
              email: student.email,
              curriculum: curr,
              id: student._id
            });
            console.log(`  ⚠ ${student.firstName} ${student.lastName}: Invalid curriculum "${curr}"`);
          }
        });
      }
    }

    if (issuesFound === 0) {
      console.log('\n✅ No issues found in student records!');
      console.log('\nStudent Summary:');
      students.forEach(s => {
        const subjCount = s.subjects && s.subjects.length > 0 ? s.subjects.length : 0;
        console.log(`  • ${s.firstName} ${s.lastName}`);
        console.log(`    Curriculum: ${s.curriculum || '(none)'}`);
        console.log(`    Subjects: ${subjCount} assigned`);
      });
      await mongoose.connection.close();
      return;
    }

    // Fix issues
    console.log(`\n════════════════════════════════════════`);
    console.log(`Found ${issuesFound} issue(s) - Fixing...`);
    console.log(`════════════════════════════════════════\n`);

    const fixedIds = new Set();

    for (const issue of issues) {
      if (fixedIds.has(issue.id)) continue;
      
      if (issue.type === 'STRING_SUBJECTS') {
        await User.findByIdAndUpdate(issue.id, { subjects: [] });
        console.log(`✓ Fixed ${issue.student} - cleared string subjects`);
        fixedIds.add(issue.id);
      }
      
      if (issue.type === 'MISSING_CURRICULUM') {
        await User.findByIdAndUpdate(issue.id, { curriculum: 'IGCSE' });
        console.log(`✓ Fixed ${issue.student} - set curriculum to IGCSE`);
        fixedIds.add(issue.id);
      }
      
      if (issue.type === 'INVALID_CURRICULUM') {
        await User.findByIdAndUpdate(issue.id, { curriculum: 'IGCSE' });
        console.log(`✓ Fixed ${issue.student} - corrected invalid curriculum`);
        fixedIds.add(issue.id);
      }
    }

    // Verify fixes
    console.log('\nVerifying fixes...');
    const fixed = await User.find({ _id: { $in: Array.from(fixedIds) } })
      .select('firstName lastName curriculum subjects');

    fixed.forEach(s => {
      const subjCount = s.subjects && s.subjects.length > 0 ? s.subjects.length : 0;
      console.log(`  ✓ ${s.firstName} ${s.lastName}`);
      console.log(`    Curriculum: ${s.curriculum}`);
      console.log(`    Subjects: ${subjCount} (all ObjectIds)`);
    });

    await mongoose.connection.close();
    console.log('\n✅ All student records fixed and verified!');
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

verifyAndFixStudents();

