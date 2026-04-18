/**
 * Teacher-Student Matching Service
 * Finds compatible teachers for students based on curriculum and subjects
 */

const User = require('../models/User');
const Teacher = require('../models/Teacher');

/**
 * Find compatible teachers for a student
 * Supports both curriculum-based matching and universal teachers (PHASE 4)
 * @param {string} studentId - Student user ID
 * @returns {Promise<array>} Array of matching teachers with score
 */
async function findCompatibleTeachers(studentId) {
  try {
    // Get student details with populated subjects
    const student = await User.findById(studentId)
      .populate('subjects', '_id subjectName curriculum')
      .lean();

    if (!student) {
      throw new Error('Student not found');
    }

    if (student.role !== 'student') {
      throw new Error('User is not a student');
    }

    // Get student's subject IDs
    const studentSubjectIds = (student.subjects || []).map(s => s._id.toString());
    const studentCurriculum = student.curriculum;

    // Validate curriculum is set
    if (!studentCurriculum) {
      console.warn(`Student ${studentId} has no curriculum set - cannot find matches`);
      return [];
    }

    if (studentSubjectIds.length === 0) {
      // PHASE 4: Return all teachers with that curriculum OR universal teachers
      const allTeachers = await Teacher.find({
        status: 'Active',
        $or: [
          { curriculum: studentCurriculum },
          { universalCurriculum: true }
        ]
      })
        .populate('subjects', '_id subjectName')
        .lean();

      return allTeachers.map(teacher => ({
        teacherId: teacher._id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        email: teacher.email,
        curriculum: teacher.curriculum,
        universalCurriculum: teacher.universalCurriculum,
        subjects: teacher.subjects || [],
        matchedSubjects: [],
        matchScore: 50, // Partial match
        matchType: teacher.universalCurriculum ? 'Universal Teacher' : 'Curriculum Match'
      }));
    }

    // PHASE 6: Find teachers with matching subjects OR universal teachers
    const matchingTeachers = await Teacher.find({
      status: 'Active',
      $or: [
        { curriculum: studentCurriculum, subjects: { $in: studentSubjectIds } },
        { universalCurriculum: true, subjects: { $in: studentSubjectIds } }
      ]
    })
      .populate('subjects', '_id subjectName')
      .lean();

    // Calculate match scores
    const results = matchingTeachers.map(teacher => {
      const teacherSubjectIds = (teacher.subjects || []).map(s => s._id.toString());
      
      // Find matching subjects
      const matchedSubjectIds = studentSubjectIds.filter(id =>
        teacherSubjectIds.includes(id)
      );

      // Calculate match score (0-100)
      const matchPercentage = (matchedSubjectIds.length / studentSubjectIds.length) * 100;

      return {
        teacherId: teacher._id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        email: teacher.email,
        phone: teacher.phone,
        curriculum: teacher.curriculum,
        universalCurriculum: teacher.universalCurriculum,
        subjects: teacher.subjects || [],
        matchedSubjects: (teacher.subjects || []).filter(s =>
          matchedSubjectIds.includes(s._id.toString())
        ),
        matchScore: Math.round(matchPercentage),
        matchType: matchPercentage === 100 ? 'Perfect Match' : 'Partial Match',
        rating: teacher.rating || 0,
        totalStudents: teacher.totalStudents || 0
      };
    });

    // Sort by match score (highest first), then by rating
    return results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return b.rating - a.rating;
    });
  } catch (error) {
    console.error('Error finding compatible teachers:', error.message);
    throw error;
  }
}

/**
 * Find compatible students for a teacher
 * Supports PHASE 4: universalCurriculum teachers match students from any board
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<array>} Array of matching students with score
 */
async function findCompatibleStudents(teacherId) {
  try {
    // Get teacher details with populated subjects
    const teacher = await Teacher.findById(teacherId)
      .populate('subjects', '_id subjectName curriculum')
      .lean();

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    const teacherSubjectIds = (teacher.subjects || []).map(s => s._id.toString());
    const teacherCurriculum = teacher.curriculum;
    const isUniversal = teacher.universalCurriculum || false; // PHASE 4

    // For universal teachers, find students from any curriculum
    // For regular teachers, require matching curriculum
    const curriculumQuery = isUniversal ? {} : { curriculum: teacherCurriculum };

    if (teacherSubjectIds.length === 0) {
      // Return all students with matching curriculum (or any if universal) if teacher has no subjects
      const allStudents = await User.find({
        role: 'student',
        ...curriculumQuery
      })
        .populate('subjects', '_id subjectName')
        .lean();

      return allStudents.map(student => ({
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
        email: student.email,
        curriculum: student.curriculum,
        subjects: student.subjects || [],
        matchedSubjects: [],
        matchScore: 50, // Partial match
        matchType: isUniversal ? 'Universal Teacher' : 'Curriculum Match'
      }));
    }

    // PHASE 4: Find students with matching subjects (respecting universal curriculum flag)
    const matchingStudents = await User.find({
      role: 'student',
      ...curriculumQuery,
      subjects: { $in: teacherSubjectIds }
    })
      .populate('subjects', '_id subjectName')
      .lean();

    // Calculate match scores
    const results = matchingStudents.map(student => {
      const studentSubjectIds = (student.subjects || []).map(s => s._id.toString());

      // Find matching subjects
      const matchedSubjectIds = studentSubjectIds.filter(id =>
        teacherSubjectIds.includes(id)
      );

      // Calculate match score
      const matchPercentage = studentSubjectIds.length > 0
        ? (matchedSubjectIds.length / studentSubjectIds.length) * 100
        : 50;

      return {
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
        email: student.email,
        curriculum: student.curriculum,
        grade: student.grade,
        plan: student.plan,
        subjects: student.subjects || [],
        matchedSubjects: (student.subjects || []).filter(s =>
          matchedSubjectIds.includes(s._id.toString())
        ),
        matchScore: Math.round(matchPercentage),
        matchType: matchPercentage === 100 ? 'Perfect Match' : 'Partial Match',
        teacherIsUniversal: isUniversal
      };
    });

    // Sort by match score (highest first)
    return results.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Error finding compatible students:', error.message);
    throw error;
  }
}

/**
 * Get match statistics
 * @param {array} matches - Array of match results
 * @returns {object} Statistics object
 */
function getMatchStatistics(matches) {
  if (!matches || matches.length === 0) {
    return {
      totalMatches: 0,
      perfectMatches: 0,
      partialMatches: 0,
      averageScore: 0
    };
  }

  const perfectMatches = matches.filter(m => m.matchScore === 100).length;
  const partialMatches = matches.filter(m => m.matchScore < 100).length;
  const averageScore = Math.round(
    matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length
  );

  return {
    totalMatches: matches.length,
    perfectMatches,
    partialMatches,
    averageScore
  };
}

module.exports = {
  findCompatibleTeachers,
  findCompatibleStudents,
  getMatchStatistics
};

