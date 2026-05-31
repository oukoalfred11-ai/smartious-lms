/**
 * routes/paymentRoutes.js
 * ─────────────────────────────────────────────────────────────
 * Smartious LMS — Payment API  (v2 — model extracted to models/Payment.js)
 *
 * Mount in app.js / server.js:
 *   const paymentRoutes = require('./routes/paymentRoutes')
 *   app.use('/api/payments', paymentRoutes)
 *
 * Required env vars:
 *   PAYSTACK_SECRET_KEY          sk_live_... or sk_test_...
 *   VITE_PAYSTACK_PUBLIC_KEY     pk_live_... (returned to frontend)
 *
 * Webhook — register in Paystack dashboard:
 *   https://yourdomain.com/api/payments/webhook/paystack
 *
 * IMPORTANT: The webhook route uses express.raw() so it must be
 * mounted BEFORE any global express.json() that would parse the body.
 * In app.js, put this ABOVE your global json middleware:
 *
 *   app.use('/api/payments/webhook/paystack',
 *     express.raw({ type: 'application/json' }),
 *     (req, res, next) => { req._rawBody = req.body; next() },
 *     paymentRoutes
 *   )
 *   app.use(express.json())
 *   app.use('/api/payments', paymentRoutes)
 * ─────────────────────────────────────────────────────────────
 */

const express = require('express')
const axios   = require('axios')
const crypto  = require('crypto')
const router  = express.Router()

const { auth, requireRole } = require('../middleware/auth')
const Payment = require('../models/Payment')
const User    = require('../models/User')

const PS_BASE   = 'https://api.paystack.co'
const psHeaders = () => ({
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
})

// ─────────────────────────────────────────────────────────────
// PARENT ROUTES
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/payments/paystack/initiate
 * Body: { amount: number(KES), email, description, childId? }
 *
 * Creates a pending Payment record, returns publicKey + reference
 * so the frontend can open Paystack popup without the secret key.
 */
router.post('/paystack/initiate', auth, async (req, res) => {
  try {
    const { amount, email, description, childId } = req.body

    if (!amount || isNaN(amount) || Number(amount) < 1)
      return res.status(400).json({ success: false, message: 'Valid amount required' })
    if (!email)
      return res.status(400).json({ success: false, message: 'Email required' })

    const reference = `SM-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

    const payment = await Payment.create({
      parentId:    req.user._id,
      studentId:   childId || null,
      amount:      Number(amount),
      description: description || 'Fee payment',
      reference,
      status:      'pending',
    })

    return res.json({
      success:   true,
      publicKey: process.env.VITE_PAYSTACK_PUBLIC_KEY || '',
      reference,
      paymentId: payment._id,
    })
  } catch (err) {
    console.error('[Payment initiate]', err.message)
    return res.status(500).json({ success: false, message: 'Could not initiate payment' })
  }
})

/**
 * POST /api/payments/paystack/verify
 * Body: { reference }
 *
 * Verifies with Paystack API, marks Payment success or failed.
 */
router.post('/paystack/verify', auth, async (req, res) => {
  try {
    const { reference } = req.body
    if (!reference)
      return res.status(400).json({ success: false, message: 'Reference required' })

    let psData
    try {
      const { data } = await axios.get(
        `${PS_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: psHeaders() }
      )
      psData = data?.data
    } catch (psErr) {
      console.error('[Paystack verify API]', psErr?.response?.data || psErr.message)
      return res.status(502).json({ success: false, message: 'Could not reach Paystack' })
    }

    if (!psData || psData.status !== 'success') {
      await Payment.findOneAndUpdate({ reference }, { status: 'failed', paystackData: psData })
      return res.status(400).json({
        success: false,
        message: `Payment not successful. Paystack status: ${psData?.status || 'unknown'}`,
      })
    }

    const amountKES = Math.round(psData.amount / 100)
    const payment = await Payment.findOneAndUpdate(
      { reference },
      { status: 'success', amount: amountKES, paystackData: psData, paidAt: new Date() },
      { new: true, upsert: true }
    )

    return res.json({
      success: true,
      message: 'Payment confirmed',
      data: {
        reference,
        amount:      payment.amount,
        currency:    'KES',
        description: payment.description,
        paidAt:      payment.paidAt,
      },
    })
  } catch (err) {
    console.error('[Payment verify]', err.message)
    return res.status(500).json({ success: false, message: 'Verification error' })
  }
})

/**
 * GET /api/payments/my-payments
 * Query: ?limit=N  ?page=N
 *
 * Logged-in parent's own payment history.
 */
router.get('/my-payments', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100)
    const page  = Math.max(parseInt(req.query.page)  || 1,  1)
    const skip  = (page - 1) * limit

    const [payments, total] = await Promise.all([
      Payment.find({ parentId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit).lean(),
      Payment.countDocuments({ parentId: req.user._id }),
    ])

    return res.json({
      success: true,
      data: {
        payments: payments.map(p => ({
          _id:          p._id,
          description:  p.description,
          amount:       p.amount,
          amountDisplay:`KES ${Number(p.amount).toLocaleString()}`,
          currency:     p.currency || 'KES',
          method:       p.method,
          reference:    p.reference,
          status:       p.status,
          createdAt:    p.createdAt,
          paidAt:       p.paidAt,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('[my-payments]', err.message)
    return res.status(500).json({ success: false, message: 'Could not fetch payments' })
  }
})

/**
 * GET /api/payments/my-fee-summary
 *
 * Returns outstandingBalance, nextDueDate, monthlyRate, quickAmounts.
 * Adapt the billing calculation to your school's fee schedule.
 */
router.get('/my-fee-summary', auth, async (req, res) => {
  try {
    const parentId = req.user._id

    const paidAgg = await Payment.aggregate([
      { $match: { parentId, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])
    const totalPaid = paidAgg[0]?.total || 0

    const parent = await User.findById(parentId)
      .populate('children', 'feeMonthly feePlan createdAt')
      .lean()
    const children    = parent?.children || []
    const monthlyRate = children[0]?.feeMonthly || 2999

    // Months-elapsed billing (replace with your invoice schedule if needed)
    const enrolDate = children[0]?.createdAt ? new Date(children[0].createdAt) : new Date()
    const now = new Date()
    const monthsElapsed = Math.max(0,
      (now.getFullYear() - enrolDate.getFullYear()) * 12 +
      (now.getMonth()    - enrolDate.getMonth())
    )
    const outstandingBalance = Math.max(0, monthlyRate * monthsElapsed - totalPaid)
    const nextDue = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    return res.json({
      success: true,
      data: {
        monthlyRate,
        totalPaid,
        outstandingBalance,
        nextDueDate:   nextDue.toISOString(),
        nextDueAmount: monthlyRate,
        quickAmounts:  [monthlyRate, monthlyRate * 2, monthlyRate * 3, monthlyRate * 12],
      },
    })
  } catch (err) {
    console.error('[my-fee-summary]', err.message)
    return res.status(500).json({ success: false, message: 'Could not fetch fee summary' })
  }
})

// ─────────────────────────────────────────────────────────────
// PAYSTACK WEBHOOK  (no JWT — verified by HMAC signature)
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/payments/webhook/paystack
 *
 * Paystack sends this on every successful charge.
 * Body MUST be raw bytes for HMAC verification — see mount instructions above.
 */
router.post(
  '/webhook/paystack',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const sig    = req.headers['x-paystack-signature']
      const secret = process.env.PAYSTACK_SECRET_KEY || ''
      const body   = req._rawBody || req.body   // support both mount patterns

      const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')
      if (hash !== sig) {
        console.warn('[Webhook] Invalid signature — rejected')
        return res.sendStatus(400)
      }

      const event = JSON.parse(body.toString())

      if (event.event === 'charge.success') {
        const ps        = event.data
        const reference = ps.reference
        const amountKES = Math.round(ps.amount / 100)

        await Payment.findOneAndUpdate(
          { reference },
          { status: 'success', amount: amountKES, paystackData: ps, paidAt: new Date(ps.paid_at || Date.now()) },
          { upsert: true, new: true }
        )
        console.log(`[Webhook] charge.success: ${reference} KES ${amountKES}`)
      }

      return res.sendStatus(200)
    } catch (err) {
      console.error('[Webhook error]', err.message)
      return res.sendStatus(500)
    }
  }
)

// ─────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/payments/admin/all
 * Query: ?status=success|pending|failed  ?page=N  ?limit=N  ?search=<string>
 */
router.get('/admin/all', auth, requireRole('admin'), async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit) || 30, 200)
    const page   = Math.max(parseInt(req.query.page)  || 1,  1)
    const skip   = (page - 1) * limit
    const filter = {}

    if (req.query.status) filter.status = req.query.status
    if (req.query.search) {
      filter.$or = [
        { reference:   { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ]
    }

    const [payments, total, totalsAgg] = await Promise.all([
      Payment.find(filter)
        .sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('parentId',  'firstName lastName email')
        .populate('studentId', 'firstName lastName admissionNumber')
        .lean(),
      Payment.countDocuments(filter),
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ])

    const totals = totalsAgg[0] || { total: 0, count: 0 }

    return res.json({
      success: true,
      data: {
        payments,
        total,
        page,
        totalPages:     Math.ceil(total / limit),
        totalRevenue:   totals.total,
        totalConfirmed: totals.count,
      },
    })
  } catch (err) {
    console.error('[admin/all]', err.message)
    return res.status(500).json({ success: false, message: 'Could not fetch payments' })
  }
})

/**
 * GET /api/payments/admin/:id
 * Full detail including raw Paystack data.
 */
router.get('/admin/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('parentId',  'firstName lastName email phone')
      .populate('studentId', 'firstName lastName admissionNumber curriculum grade')
      .lean()
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' })
    return res.json({ success: true, data: payment })
  } catch (err) {
    console.error('[admin/detail]', err.message)
    return res.status(500).json({ success: false, message: 'Could not fetch payment' })
  }
})

/**
 * PATCH /api/payments/admin/:id/status
 * Body: { status: 'success'|'pending'|'failed', note?: string }
 *
 * Manual override — use to confirm bank/M-Pesa transfers.
 */
router.patch('/admin/:id/status', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status, note } = req.body
    if (!['success', 'pending', 'failed'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' })

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === 'success' ? { paidAt: new Date() } : {}),
        ...(note ? { adminNote: note } : {}),
        updatedBy: req.user._id,
      },
      { new: true }
    )
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' })
    return res.json({ success: true, data: payment })
  } catch (err) {
    console.error('[admin/status]', err.message)
    return res.status(500).json({ success: false, message: 'Could not update status' })
  }
})

/**
 * GET /api/payments/admin/revenue/monthly
 * Returns month-by-month confirmed revenue for the admin dashboard chart.
 * Query: ?months=12 (default)
 */
router.get('/admin/revenue/monthly', auth, requireRole('admin'), async (req, res) => {
  try {
    const months = Math.min(parseInt(req.query.months) || 12, 36)
    const since  = new Date()
    since.setMonth(since.getMonth() - months + 1)
    since.setDate(1); since.setHours(0, 0, 0, 0)

    const agg = await Payment.aggregate([
      { $match: { status: 'success', paidAt: { $gte: since } } },
      { $group: {
        _id:   { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    return res.json({ success: true, data: agg })
  } catch (err) {
    console.error('[admin/revenue/monthly]', err.message)
    return res.status(500).json({ success: false, message: 'Could not fetch revenue data' })
  }
})

module.exports = router
