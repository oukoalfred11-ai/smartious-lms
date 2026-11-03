/**
 * lib/teachers.js — who counts as a teacher.
 *
 * A teacher account (role 'teacher'), or a staff account that also
 * teaches: additionalRoles includes 'teacher' (for example an accountant
 * who teaches a subject). Use these wherever teachers are listed, picked
 * or checked, so such a person can be allocated students, given timetable
 * slots and appear in teacher reports.
 */
const TEACHERS = { $or: [{ role: 'teacher' }, { additionalRoles: 'teacher' }] }
const isTeacher = (u) => !!u && (u.role === 'teacher' || (u.additionalRoles || []).includes('teacher'))
/** A filter for teachers plus other conditions (keeps any $or of their own). */
const teachersWhere = (extra = {}) => (extra.$or ? { $and: [TEACHERS, extra] } : { ...TEACHERS, ...extra })

module.exports = { TEACHERS, isTeacher, teachersWhere }
