/**
 * lib/examApproval.js — Dean verification rules for online exams
 * (routes/exams.js, models/Exam.js approval). Pure, so it is unit-tested.
 *
 * A teacher's exam starts 'pending'; students see nothing until the Dean,
 * the Operations Manager or an admin approves it. 'returned' sends it back
 * to the teacher with a note. Staff exams, and exams made before the rule
 * (no approval field), count as published.
 */
const REVIEWERS = ['admin', 'dos', 'ops_manager']

const isPublished = (exam) => !exam?.approval?.status || exam.approval.status === 'approved'

// Mongo filter: published exams only (matches a missing field too).
const PUBLISHED = { 'approval.status': { $nin: ['pending', 'returned'] } }

const initialApproval = (role, userId, now = new Date()) => REVIEWERS.includes(role)
  ? { status: 'approved', reviewedBy: userId || null, reviewedAt: now }
  : { status: 'pending', submittedAt: now }

// Does this edit by this user send the exam back to the Dean?
const needsReverification = (role, body, startAt, now = Date.now()) => {
  if (REVIEWERS.includes(role)) return false
  const contentKeys = ['title', 'instructions', 'subject', 'curriculum', 'grade', 'startAt', 'durationMins',
    'paperNumber', 'syllabusRef', 'questionIds', 'customQuestions', 'assignedStudents', 'groupRoomIds']
  return contentKeys.some(k => body && k in body) && new Date(startAt).getTime() > now
}

module.exports = { REVIEWERS, isPublished, PUBLISHED, initialApproval, needsReverification }
