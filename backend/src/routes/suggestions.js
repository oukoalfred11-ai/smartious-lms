/**
 * routes/suggestions.js  —  Mounted at /api/suggestions
 * Suggestion Box: every signed-in user can submit; the main
 * admin reads, marks reviewed, and tracks counts.
 */
const express = require('express')
const router  = express.Router()
const mongoose = require('mongoose')
const { auth, requireRole } = require('../middleware/auth')

const suggestionSchema = new mongoose.Schema({
  from:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromName: { type: String, default: '' },
  fromRole: { type: String, default: '' },
  category: { type: String, enum: ['academics','teaching','portal','fees','wellbeing','other'], default: 'other' },
  message:  { type: String, required: true, maxlength: 2000 },
  status:   { type: String, enum: ['new','reviewed'], default: 'new', index: true },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true })
const Suggestion = mongoose.models.Suggestion || mongoose.model('Suggestion', suggestionSchema)

// Any signed-in user submits
router.post('/', auth, async (req, res) => {
  try {
    const message = String(req.body.message || '').trim()
    if (!message) return res.status(400).json({ success:false, message:'Write your suggestion first.' })
    const sug = await Suggestion.create({
      from: req.user._id,
      fromName: `${req.user.firstName} ${req.user.lastName}`.trim(),
      fromRole: req.user.role,
      category: req.body.category || 'other',
      message,
    })
    return res.status(201).json({ success:true, message:'Thank you. Your suggestion has been sent to the school administration.', data:{ sug } })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// Main admin: list with filters
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status = 'all', category = 'all' } = req.query
    const filter = {}
    if (status !== 'all') filter.status = status
    if (category !== 'all') filter.category = category
    const suggestions = await Suggestion.find(filter).sort({ createdAt: -1 }).limit(300).lean()
    const newCount = await Suggestion.countDocuments({ status: 'new' })
    return res.json({ success:true, data:{ suggestions, newCount } })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

router.patch('/:id/reviewed', auth, requireRole('admin'), async (req, res) => {
  try {
    await Suggestion.findByIdAndUpdate(req.params.id, { $set: { status:'reviewed', reviewedAt:new Date() } })
    return res.json({ success:true })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

module.exports = router
