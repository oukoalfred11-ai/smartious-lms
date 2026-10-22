/**
 * lib/learningMode.js — the three ways a student learns (User.deliveryMode).
 *
 *   Virtual    every lesson online, in the Smartious classroom
 *   In-person  every lesson at a centre; the system is for management and
 *              records (timetable, homework, attendance, reports)
 *   Hybrid     some lessons online, some at a centre, decided per lesson
 *              by LiveClass.deliveryMode ('virtual' | 'physical')
 *
 * A lesson is IN PERSON for a student when the student is In-person, or
 * the lesson itself is physical. In-person lessons send the family no
 * 30-minute join reminder, no "has not joined" alert and no per-lesson
 * change emails (moved, cancelled, extra, teacher unavailable). Instead
 * the family receives tomorrow's timetable each evening
 * (lib/dailyTimetable.js) and calls the academic office for changes, and
 * the Dean marks attendance (routes/centre-register.js). Homework,
 * reports and general school communications are unchanged.
 */

/** 'virtual' | 'physical' | 'hybrid' from a student's deliveryMode. */
function learningMode(student) {
  const m = String((student && student.deliveryMode) || '').toLowerCase()
  if (/hybrid|blended/.test(m)) return 'hybrid'
  if (/in.?person|physical|centre|center|on.?site/.test(m)) return 'physical'
  return 'virtual'
}

/** Is this lesson in person for this student? */
function inPersonLesson(cls, student) {
  return learningMode(student) === 'physical' || (cls && cls.deliveryMode) === 'physical'
}

/** The Mongo filter for students who learn at a centre at least some of the time. */
const CENTRE_STUDENT_FILTER = { role: 'student', deliveryMode: { $in: ['In-person', 'Hybrid'] } }

module.exports = { learningMode, inPersonLesson, CENTRE_STUDENT_FILTER }
