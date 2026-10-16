/**
 * admissionPack.js — email the Admission Pack to new students and parents.
 *
 * The pack (assets/Smartious_Admission_Pack_2026.pdf) is built by
 * frontend/scripts/admission-pdf.py from the same policy text as the
 * website; rebuild it there and copy it here when a policy changes:
 *   OUT=backend/src/assets/Smartious_Admission_Pack_2026.pdf python3 frontend/scripts/admission-pdf.py
 *
 * Each person gets it once (User.admissionPackSentAt). An admin can resend
 * it with force, e.g. from Users → Admission pack.
 */
const fs = require('fs')
const path = require('path')
const User = require('../models/User')
const { sendAdmissionPackEmail } = require('./email')

const PACK_PATH = path.join(__dirname, '..', 'assets', 'Smartious_Admission_Pack_2026.pdf')
const PACK_ROLES = ['student', 'parent']

/**
 * Send the pack to one user. Never throws: account creation must not fail
 * because an email did. Returns { sent, reason }.
 */
async function sendAdmissionPack(user, { studentName = null, force = false } = {}) {
  try {
    if (!user || !PACK_ROLES.includes(user.role)) return { sent: false, reason: 'Only students and parents receive the admission pack.' }
    if (!user.email) return { sent: false, reason: 'No email address.' }
    if (user.admissionPackSentAt && !force) return { sent: false, reason: 'Already sent.' }
    if (!fs.existsSync(PACK_PATH)) return { sent: false, reason: 'Admission pack file is missing on the server.' }
    const r = await sendAdmissionPackEmail({
      to: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'and welcome',
      role: user.role,
      studentName,
      attachmentPath: PACK_PATH,
      attachmentName: 'Smartious_Admission_Pack_2026.pdf',
    })
    if (!r.success) return { sent: false, reason: r.message || 'Email failed.' }
    // updateOne, not save(): no other fields (password hooks) are touched.
    await User.updateOne({ _id: user._id }, { $set: { admissionPackSentAt: new Date() } })
    return { sent: true }
  } catch (err) {
    console.error('[admissionPack] send failed for', user && user.email, '—', err.message)
    return { sent: false, reason: err.message }
  }
}

module.exports = { sendAdmissionPack, PACK_PATH }
