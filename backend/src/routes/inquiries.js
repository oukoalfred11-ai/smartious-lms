/**
 * routes/inquiries.js
 * ============================================================
 * Full CRM inquiry management.
 * Mounted at /api/inquiries
 * Accessible by: admin, sales, ops_manager
 */

const express = require('express')
const router  = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const Inquiry = require('../models/Inquiry')

const ALLOWED = requireRole('admin', 'sales', 'ops_manager')

// ── GET /api/inquiries ─────────────────────────────────────
// List with filters, search, pagination
router.get('/', auth, ALLOWED, async (req, res) => {
  try {
    const { status, source, priority, search, assignedTo,
            overdue, page = 1, limit = 30 } = req.query

    const filter = {}
    if (status && status !== 'all') filter.status = status
    if (source && source !== 'all') filter.source = source
    if (priority && priority !== 'all') filter.priority = priority
    if (assignedTo) filter.assignedTo = assignedTo
    if (overdue === 'true') {
      filter.nextCallbackDate = { $lte: new Date() }
      filter.nextCallbackDone = false
      filter.status = { $nin: ['enrolled', 'lost', 'unqualified'] }
    }
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter.$or = [
        { parentName: re }, { parentEmail: re }, { parentPhone: re },
        { studentName: re }, { city: re }, { campaignTag: re },
      ]
    }

    const pageNum  = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, parseInt(limit, 10) || 30)
    const skip     = (pageNum - 1) * limitNum

    const [inquiries, total, statusCounts, sourceCounts, overdueCount] = await Promise.all([
      Inquiry.find(filter)
        .sort({ nextCallbackDate: 1, createdAt: -1 })
        .skip(skip).limit(limitNum)
        .populate('assignedTo', 'firstName lastName')
        .populate('createdBy', 'firstName lastName')
        .lean(),
      Inquiry.countDocuments(filter),
      Inquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Inquiry.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
      Inquiry.countDocuments({
        nextCallbackDate: { $lte: new Date() },
        nextCallbackDone: false,
        status: { $nin: ['enrolled', 'lost', 'unqualified'] },
      }),
    ])

    const counts = {}
    statusCounts.forEach(c => { counts[c._id] = c.count })
    const sources = {}
    sourceCounts.forEach(c => { sources[c._id] = c.count })

    return res.json({
      success: true,
      data: { inquiries, total, page: pageNum, limit: limitNum,
              totalPages: Math.ceil(total / limitNum),
              counts, sources, overdueCount },
    })
  } catch (e) {
    console.error('[inquiries list]', e.message)
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── GET /api/inquiries/stats ───────────────────────────────
router.get('/stats', auth, ALLOWED, async (req, res) => {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)

    const [pipeline, recent, overdue, bySource] = await Promise.all([
      Inquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Inquiry.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Inquiry.countDocuments({
        nextCallbackDate: { $lte: now },
        nextCallbackDone: false,
        status: { $nin: ['enrolled','lost','unqualified'] },
      }),
      Inquiry.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
    ])

    const statusMap = {}
    pipeline.forEach(p => { statusMap[p._id] = p.count })

    return res.json({ success: true, data: { pipeline: statusMap, recent, overdue, bySource } })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── GET /api/inquiries/:id ─────────────────────────────────
router.get('/:id', auth, ALLOWED, async (req, res) => {
  try {
    const inq = await Inquiry.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('notes.recordedBy', 'firstName lastName')
      .lean()
    if (!inq) return res.status(404).json({ success: false, message: 'Inquiry not found.' })
    return res.json({ success: true, data: { inquiry: inq } })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── POST /api/inquiries ────────────────────────────────────
router.post('/', auth, ALLOWED, async (req, res) => {
  try {
    const {
      parentName, parentPhone, parentEmail, parentPhone2,
      country, city, timezone,
      studentName, studentGrade, curriculum,
      source, referredBy, campaignTag,
      status, priority, assignedTo,
      nextCallbackDate, tags, internalNote,
    } = req.body

    if (!parentName?.trim()) return res.status(400).json({ success: false, message: 'Parent/contact name is required.' })

    const inq = await Inquiry.create({
      parentName: parentName.trim(),
      parentPhone: parentPhone?.trim(),
      parentEmail: parentEmail?.trim()?.toLowerCase(),
      parentPhone2: parentPhone2?.trim(),
      country: country?.trim(),
      city: city?.trim(),
      timezone: timezone?.trim(),
      studentName: studentName?.trim(),
      studentGrade: studentGrade?.trim(),
      curriculum: curriculum?.trim(),
      source: source || 'other',
      referredBy: referredBy?.trim(),
      campaignTag: campaignTag?.trim(),
      status: status || 'new',
      priority: priority || 'medium',
      assignedTo: assignedTo || req.user._id,
      nextCallbackDate: nextCallbackDate || null,
      tags: Array.isArray(tags) ? tags : [],
      internalNote: internalNote?.trim(),
      createdBy: req.user._id,
      updatedBy: req.user._id,
    })

    return res.status(201).json({ success: true, data: { inquiry: inq } })
  } catch (e) {
    console.error('[inquiries create]', e.message)
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── PATCH /api/inquiries/:id ───────────────────────────────
// Update inquiry fields (status, priority, callback, etc.)
router.patch('/:id', auth, ALLOWED, async (req, res) => {
  try {
    const inq = await Inquiry.findById(req.params.id)
    if (!inq) return res.status(404).json({ success: false, message: 'Inquiry not found.' })

    const allowed = [
      'parentName','parentPhone','parentEmail','parentPhone2',
      'country','city','timezone',
      'studentName','studentGrade','curriculum',
      'source','referredBy','campaignTag',
      'status','priority','assignedTo',
      'nextCallbackDate','nextCallbackDone',
      'tags','internalNote',
      'assessmentRequestId','convertedStudentId',
    ]
    allowed.forEach(k => {
      if (req.body[k] !== undefined) inq[k] = req.body[k]
    })
    inq.updatedBy = req.user._id
    await inq.save()

    return res.json({ success: true, data: { inquiry: inq } })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── POST /api/inquiries/:id/notes ─────────────────────────
// Add a contact log entry
router.post('/:id/notes', auth, ALLOWED, async (req, res) => {
  try {
    const { type, summary, outcome, callbackDate } = req.body
    if (!summary?.trim()) return res.status(400).json({ success: false, message: 'Note summary is required.' })

    const inq = await Inquiry.findById(req.params.id)
    if (!inq) return res.status(404).json({ success: false, message: 'Inquiry not found.' })

    inq.notes.unshift({
      date: new Date(),
      type: type || 'call',
      summary: summary.trim(),
      outcome: outcome?.trim() || '',
      callbackDate: callbackDate || null,
      callbackDone: false,
      recordedBy: req.user._id,
    })

    // Update top-level callback if provided
    if (callbackDate) {
      inq.nextCallbackDate = callbackDate
      inq.nextCallbackDone = false
    }
    inq.updatedBy = req.user._id
    await inq.save()

    await inq.populate('notes.recordedBy', 'firstName lastName')
    return res.json({ success: true, data: { inquiry: inq } })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── PATCH /api/inquiries/:id/notes/:noteId ─────────────────
// Mark a callback as done
router.patch('/:id/notes/:noteId', auth, ALLOWED, async (req, res) => {
  try {
    const inq = await Inquiry.findById(req.params.id)
    if (!inq) return res.status(404).json({ success: false, message: 'Inquiry not found.' })

    const note = inq.notes.id(req.params.noteId)
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' })

    if (req.body.callbackDone !== undefined) note.callbackDone = req.body.callbackDone
    inq.updatedBy = req.user._id
    await inq.save()

    return res.json({ success: true, data: { inquiry: inq } })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── DELETE /api/inquiries/:id ──────────────────────────────
router.delete('/:id', auth, requireRole('admin', 'ops_manager'), async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id)
    return res.json({ success: true, message: 'Inquiry deleted.' })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})


// ── POST /api/inquiries/public ─────────────────────────────
// No-auth endpoint called by the public landing page ConsultForm.
// Creates a CRM inquiry so every consultation request lands in
// the sales team's pipeline automatically.
// Rate-limited by the global limiter in index.js (1000/15min).
router.post('/public', async (req, res) => {
  try {
    const {
      parentName, parentPhone, parentEmail,
      country, city, studentName, studentGrade,
      curriculum, source, consultFormat,
      message, campaignTag, sourcePage,
    } = req.body || {}

    if (!parentName?.trim())
      return res.status(400).json({ success: false, message: 'Name is required.' })

    // Map consultation source to CRM source enum
    const sourceMap = {
      instagram: 'instagram', facebook: 'facebook', linkedin: 'linkedin',
      whatsapp: 'whatsapp', google: 'website', tiktok: 'tiktok',
      referral: 'referral', website: 'website',
    }
    const crmSource = sourceMap[String(source || '').toLowerCase()] || 'website'

    const inq = await Inquiry.create({
      parentName:   parentName.trim(),
      parentPhone:  parentPhone?.trim() || '',
      parentEmail:  parentEmail?.trim()?.toLowerCase() || '',
      country:      country?.trim() || '',
      city:         city?.trim() || '',
      studentName:  studentName?.trim() || '',
      studentGrade: studentGrade?.trim() || '',
      curriculum:   curriculum?.trim() || '',
      source:       crmSource,
      campaignTag:  campaignTag?.trim() || sourcePage || '',
      status:       'new',
      priority:     'medium',
      internalNote: [
        consultFormat ? 'Format: ' + consultFormat : '',
        message       ? 'Message: ' + message       : '',
      ].filter(Boolean).join(' | '),
      notes: message?.trim() ? [{
        date:      new Date(),
        type:      'other',
        summary:   'Initial enquiry via consultation form',
        outcome:   message.trim(),
        callbackDone: false,
      }] : [],
    })

    console.log('[inquiries/public] New inquiry from', parentName, '| source:', crmSource)

    // Email the admissions desk immediately — fire and forget so the
    // visitor never waits on SMTP. mailPolicy adds the outbox copy;
    // replyTo is the parent, so staff answer with one click of Reply.
    ;(async () => {
      try {
        const nodemailer = require('nodemailer')
        const t = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587', 10),
          secure: parseInt(process.env.EMAIL_PORT || '587', 10) === 465,
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
        })
        const rows = [
          ['Name', parentName], ['Phone', parentPhone], ['Email', parentEmail],
          ['Country', country], ['City', city], ['Student', studentName],
          ['Grade', studentGrade], ['Curriculum', curriculum],
          ['Source', crmSource], ['Page', sourcePage || campaignTag],
          ['Message', message],
        ].filter(([, v]) => v && String(v).trim())
        await t.sendMail({
          from: process.env.EMAIL_FROM || 'Smartious Homeschool <hello@smartioushomeschool.com>',
          to: 'admissions@smartioushomeschool.com',
          replyTo: parentEmail?.trim() || undefined,
          subject: 'New website enquiry — ' + parentName + (sourcePage ? ' (' + sourcePage + ')' : ''),
          text: rows.map(([k, v]) => k + ': ' + v).join('\n'),
          html: '<div style="font-family:Georgia,serif;max-width:560px">' +
            '<h2 style="color:#8B1A2E;margin:0 0 12px">New website enquiry</h2>' +
            '<table style="border-collapse:collapse;font-size:14px">' +
            rows.map(([k, v]) => '<tr><td style="padding:6px 14px 6px 0;color:#8B1A2E;font-weight:700;vertical-align:top">' + k + '</td><td style="padding:6px 0">' + String(v).replace(/</g, '&lt;') + '</td></tr>').join('') +
            '</table><p style="color:#5A5A62;font-size:12px;margin-top:14px">Also recorded in the CRM pipeline. Reply to this email to answer the family directly.</p></div>',
        })
      } catch (e) { console.error('[inquiries/public] notify email failed:', e.message) }
    })()

    return res.json({ success: true, inquiryId: inq._id })
  } catch (e) {
    console.error('[inquiries/public]', e.message)
    // Don't surface internal errors to public users
    return res.status(500).json({ success: false, message: 'Could not record your enquiry. Please try again.' })
  }
})

module.exports = router
