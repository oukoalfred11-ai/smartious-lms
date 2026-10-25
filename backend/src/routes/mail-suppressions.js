/**
 * routes/mail-suppressions.js — addresses the system no longer emails
 * because mail to them bounced (lib/mailSuppression.js).
 *
 *   GET    /api/mail-suppressions          the list, with whose address it is
 *   POST   /api/mail-suppressions          { email, note } add by hand
 *   DELETE /api/mail-suppressions/:email   lift (after the address is fixed)
 *   POST   /api/mail-suppressions/scan     read the inbox's failure notices now
 */
const express = require('express')
const router = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const MailSuppression = require('../models/MailSuppression')
const User = require('../models/User')
const { suppress, _cache } = require('../lib/mailSuppression')

const STAFF = requireRole('admin', 'ops_manager', 'dos')

router.get('/', auth, STAFF, async (req, res) => {
  try {
    const rows = await MailSuppression.find({}).sort({ lastAt: -1 }).limit(1000).lean()
    const emails = rows.map(r => r.email)
    // Whose address is it? Account emails and the free-text parent email field.
    const users = emails.length ? await User.find({ $or: [{ email: { $in: emails } }, { parentEmail: { $in: emails } }] })
      .select('firstName lastName role email parentEmail').lean() : []
    const owner = (e) => users.filter(u => String(u.email).toLowerCase() === e || String(u.parentEmail || '').toLowerCase() === e)
      .map(u => ({ _id: u._id, name: `${u.firstName || ''} ${u.lastName || ''}`.trim(), role: u.role, field: String(u.email).toLowerCase() === e ? 'account email' : 'parent email' }))
    res.json({ success: true, data: { rows: rows.map(r => ({ ...r, owners: owner(r.email) })) } })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

router.post('/', auth, STAFF, async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address.' })
    await suppress([email], 'manual', String(req.body?.note || 'Added by staff'))
    await MailSuppression.updateOne({ email }, { $set: { addedBy: req.user._id } })
    res.json({ success: true, message: `${email} will not be emailed.` })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

router.post('/scan', auth, STAFF, async (req, res) => {
  try {
    const r = await require('../lib/bounceScanner').scanBounces()
    if (r.skipped) return res.json({ success: true, message: 'Not scanned: ' + r.skipped + '.', data: r })
    res.json({ success: true, data: r, message: `${r.notices} failure notice(s) read, ${r.suppressed.length} address(es) suppressed, ${r.filed} filed out of the inbox.` })
  } catch (e) { res.status(500).json({ success: false, message: 'Could not read the mailbox: ' + e.message }) }
})

router.delete('/:email', auth, STAFF, async (req, res) => {
  try {
    const email = String(req.params.email || '').trim().toLowerCase()
    const r = await MailSuppression.deleteOne({ email })
    _cache.clear()
    if (!r.deletedCount) return res.status(404).json({ success: false, message: 'That address is not suppressed.' })
    res.json({ success: true, message: `${email} will be emailed again.` })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
})

module.exports = router
