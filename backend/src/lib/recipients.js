/**
 * lib/recipients.js
 *
 * Works out who should receive a message about a student.
 *
 * A parent can be attached to a student in three different ways, and
 * which one is used depends on how the record was created:
 *
 *   1. parentEmail    — free text, used when the parent has no portal account
 *   2. parentId       — a single linked parent User
 *   3. linkedParents  — several linked parent Users
 *
 * Earlier fee reminders only read parentEmail, so any parent who had a
 * portal account but no text entry in that field was never contacted and
 * the message went to the student alone. This resolver gathers all three,
 * de-duplicates case-insensitively, and reports where each address came
 * from so the result can be shown in the UI and logged.
 */

const User = require('../models/User')

const clean = e => String(e || '').trim().toLowerCase()
const isEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(e))

/**
 * @param {Object|String} studentOrId  a student document or its id
 * @param {Object} opts
 * @param {Boolean} opts.includeStudent  include the student's own address
 * @returns {Promise<{ to: String[], sources: Object, student: Object|null }>}
 */
async function resolveStudentRecipients(studentOrId, { includeStudent = true } = {}) {
  let student = studentOrId

  // Accept an id, or a lean document that may be missing the link fields.
  const needsLoad = !student
    || typeof student === 'string'
    || !('linkedParents' in student)
    || !('parentId' in student)

  if (needsLoad) {
    const id = typeof studentOrId === 'string' ? studentOrId : studentOrId?._id
    if (!id) return { to: [], sources: {}, student: null }
    student = await User.findById(id)
      .select('firstName lastName email parentEmail parentName parentId linkedParents onBreak')
      .lean()
  }
  if (!student) return { to: [], sources: {}, student: null }

  const sources = {}
  const add = (email, source) => {
    const e = clean(email)
    if (!isEmail(e)) return
    if (!sources[e]) sources[e] = []
    if (!sources[e].includes(source)) sources[e].push(source)
  }

  if (includeStudent) add(student.email, 'student')
  add(student.parentEmail, 'parentEmail field')

  // Collect ids from both single and multiple linkage, then load in one query.
  const parentIds = []
  if (student.parentId) parentIds.push(student.parentId)
  if (Array.isArray(student.linkedParents)) parentIds.push(...student.linkedParents)

  if (parentIds.length) {
    const unique = [...new Set(parentIds.map(String))]
    try {
      const parents = await User.find({ _id: { $in: unique } })
        .select('email firstName lastName')
        .lean()
      parents.forEach(p => add(p.email, 'linked parent account'))
    } catch (e) {
      console.error('[recipients] could not load linked parents:', e.message)
    }
  }

  return { to: Object.keys(sources), sources, student }
}

/**
 * Human-readable summary for toasts and logs, e.g.
 * "2 recipients: parent@x.com (linked parent account), amani@x.com (student)"
 */
function describeRecipients(result) {
  const { to, sources } = result
  if (!to.length) return 'no valid email addresses on file'
  return `${to.length} recipient${to.length === 1 ? '' : 's'}: ` +
    to.map(e => `${e} (${(sources[e] || []).join(', ')})`).join(', ')
}

module.exports = { resolveStudentRecipients, describeRecipients, isEmail }
