/**
 * PHASE 6: Cross-Board Subject Matcher
 * Refactored allocation service that filters by subject name across all boards
 */

const Subject = require('../models/Subject');
const User = require('../models/User');
const Teacher = require('../models/Teacher');

/**
 * Get all unique subject names across all curriculums
 * PHASE 6: Subject-centric filtering
 * @returns {Promise<array>} Array of unique subject names
 */
async function getAllUniqueSubjectNames() {
  try {
    const subjects = await Subject.aggregate([
      {
        $group: {
          _id: '$subjectName',
          count: { $sum: 1 },
          curriculums: { $push: '$curriculum' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return subjects.map(s => ({
      name: s._id,
      curriculumCount: s.count,
      curriculums: s.curriculums
    }));
  } catch (error) {
    console.error('Error getting unique subject names:', error.message);
    throw error;
  }
}

/**
 * Find all teachers by subject name across all boards
 * PHASE 6: Cross-board matching
 * @param {string} subjectName - Subject name to search for
 * @param {boolean} universalOnly - If true, only return universal teachers
 * @returns {Promise<array>} Array of teachers matching the subject
 */
async function findTeachersBySubjectName(subjectName, universalOnly = false) {
  try {
    // First, find all Subject IDs that match this name across all boards
    const matchingSubjects = await Subject.find(
      { subjectName: new RegExp(`^${subjectName}$`, 'i') },
      '_id'
    );

    if (matchingSubjects.length === 0) {
      return [];
    }

    const subjectIds = matchingSubjects.map(s => s._id);

    // Build query for teachers
    const query = {
      status: 'Active',
      subjects: { $in: subjectIds }
    };

    // If universalOnly, only return universal teachers
    if (universalOnly) {
      query.universalCurriculum = true;
    }

    // Find teachers with these subjects
    const teachers = await Teacher.find(query)
      .populate('subjects', 'subjectName curriculum')
      .populate('userId', 'firstName lastName email')
      .lean();

    return teachers.map(teacher => ({
      teacherId: teacher._id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      email: teacher.email,
      phone: teacher.phone,
      curriculum: teacher.curriculum,
      universalCurriculum: teacher.universalCurriculum,
      subjects: teacher.subjects || [],
      matchedSubjects: (teacher.subjects || []).filter(s =>
        subjectIds.some(id => id.toString() === s._id.toString())
      ),
      rating: teacher.rating || 0,
      totalStudents: teacher.totalStudents || 0
    }));
  } catch (error) {
    console.error('Error finding teachers by subject name:', error.message);
    throw error;
  }
}

/**
 * Find all students by subject name across all boards
 * PHASE 6: For reverse matching (teacher finding students)
 * @param {string} subjectName - Subject name to search for
 * @returns {Promise<array>} Array of students needing this subject
 */
async function findStudentsBySubjectName(subjectName) {
  try {
    // First, find all Subject IDs that match this name across all boards
    const matchingSubjects = await Subject.find(
      { subjectName: new RegExp(`^${subjectName}$`, 'i') },
      '_id'
    );

    if (matchingSubjects.length === 0) {
      return [];
    }

    const subjectIds = matchingSubjects.map(s => s._id);

    // Find students with these subjects
    const students = await User.find({
      role: 'student',
      subjects: { $in: subjectIds }
    })
      .populate('subjects', 'subjectName curriculum')
      .lean();

    return students.map(student => ({
      studentId: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      email: student.email,
      curriculum: student.curriculum,
      grade: student.grade,
      plan: student.plan,
      subjects: student.subjects || [],
      matchedSubjects: (student.subjects || []).filter(s =>
        subjectIds.some(id => id.toString() === s._id.toString())
      )
    }));
  } catch (error) {
    console.error('Error finding students by subject name:', error.message);
    throw error;
  }
}

/**
 * Get cross-board statistics for a subject
 * @param {string} subjectName - Subject name
 * @returns {Promise<object>} Statistics about the subject across boards
 */
async function getSubjectStatistics(subjectName) {
  try {
    // Get all versions of this subject across curriculums
    const subjects = await Subject.find(
      { subjectName: new RegExp(`^${subjectName}$`, 'i') }
    );

    // Count teachers by curriculum
    const teachersPerCurriculum = {};
    for (const subject of subjects) {
      const count = await Teacher.countDocuments({
        status: 'Active',
        subjects: subject._id
      });
      teachersPerCurriculum[subject.curriculum] = count;
    }

    // Count students by curriculum
    const studentsPerCurriculum = {};
    for (const subject of subjects) {
      const count = await User.countDocuments({
        role: 'student',
        subjects: subject._id
      });
      studentsPerCurriculum[subject.curriculum] = count;
    }

    // Count universal teachers who can teach this subject
    const universalTeachers = await Teacher.countDocuments({
      status: 'Active',
      universalCurriculum: true,
      subjects: { $in: subjects.map(s => s._id) }
    });

    return {
      subjectName,
      totalCurriculums: subjects.length,
      curriculums: subjects.map(s => s.curriculum),
      teachersPerCurriculum,
      studentsPerCurriculum,
      universalTeachers,
      totalTeachers: Object.values(teachersPerCurriculum).reduce((a, b) => a + b, 0),
      totalStudents: Object.values(studentsPerCurriculum).reduce((a, b) => a + b, 0)
    };
  } catch (error) {
    console.error('Error getting subject statistics:', error.message);
    throw error;
  }
}

module.exports = {
  getAllUniqueSubjectNames,
  findTeachersBySubjectName,
  findStudentsBySubjectName,
  getSubjectStatistics
};

