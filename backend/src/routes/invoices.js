/**
 * routes/invoices.js
 * Mounted at /api/invoices
 */
const express  = require('express')
const router   = express.Router()
const nodemailer = require('nodemailer')
const { auth, requireRole } = require('../middleware/auth')
const Invoice  = require('../models/Invoice')
const User     = require('../models/User')
// Invoice creation, numbering, signatories and the email template all
// live in one place so the billing screen and the assessment workflow
// issue identical invoices.
const {
  issueInvoice, nextInvoiceNo, signatoryForRole, signatoryOf,
  getTransporter, buildInvoiceEmailHTML,
} = require('../lib/issueInvoice')
const { sendReminder, reminderKindFor, runDueReminders, studentIsOnBreak } = require('../lib/invoiceReminders')

// Guarded require: if pdfkit is missing, emails still send without PDF
// attachments instead of crashing the whole API on boot.
let buildInvoicePdfBuffer = null, buildReceiptPdfBuffer = null
try {
  ({ buildInvoicePdfBuffer, buildReceiptPdfBuffer } = require('../lib/invoicePdf'))
} catch (e) {
  console.warn('[invoices] PDF attachments disabled -', e.message)
}

const ALLOWED = requireRole('admin', 'accountant', 'sales', 'ops_manager')
// Only the admin may remove an invoice. Invoices are financial
// records: everyone else can raise and view them, but deletion
// is restricted to a single accountable role.
const CAN_DELETE = requireRole('admin')

// Roles that see the whole ledger. Sales users see only the
// invoices they themselves issued.
const FULL_LEDGER_ROLES = ['admin', 'accountant', 'ops_manager']
function ledgerScope(user) {
  return FULL_LEDGER_ROLES.includes(user.role) ? {} : { issuedBy: user._id }
}

// ── Invoice signatories ────────────────────────────────────
// Invoices raised by the admissions/sales team are signed by the
// Head of Admission Team; everything else by the Head of Finance.


// Falls back to Finance for invoices created before this field existed.



// ── GET /api/invoices/stats ────────────────────────────────
router.get('/stats', auth, ALLOWED, async (req, res) => {
  try {
    // Same scoping as the list: full ledger for admin/accountant/
    // ops, own invoices only for sales.
    const scope = ledgerScope(req.user)
    const [byCurrency, countByStatus, recentIssuers] = await Promise.all([
      Invoice.aggregate([{ $match: scope }, { $group: { _id:'$currency', total:{ $sum:'$totalDue' }, paid:{ $sum:{ $cond:[{ $eq:['$status','paid'] },'$totalDue',0] } }, count:{ $sum:1 } } }]),
      Invoice.aggregate([{ $match: scope }, { $group: { _id:'$status', count:{ $sum:1 } } }]),
      Invoice.aggregate([
        { $match: scope },
        { $group: { _id:'$issuedBy', count:{ $sum:1 }, total:{ $sum:'$totalDue' } } },
        { $sort: { count:-1 } }, { $limit:5 },
        { $lookup: { from:'users', localField:'_id', foreignField:'_id', as:'user' } },
        { $unwind:'$user' },
        { $project: { name:{ $concat:['$user.firstName',' ','$user.lastName'] }, count:1, total:1, role:'$user.role' } },
      ]),
    ])
    const statusMap = {}
    countByStatus.forEach(c => { statusMap[c._id] = c.count })
    return res.json({ success:true, data:{ byCurrency, statusMap, recentIssuers } })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── GET /api/invoices/sales-performance ────────────────────
router.get('/sales-performance', auth, requireRole('admin','sales','ops_manager'), async (req, res) => {
  try {
    const mongoose = require('mongoose')
    const { cycle, userId } = req.query

    const targetId = req.user.role === 'sales'
      ? req.user._id
      : userId ? new mongoose.Types.ObjectId(String(userId)) : req.user._id

    // Cycle dates
    let cStart, cEnd
    if (cycle) {
      const [yr, mo] = cycle.split('-').map(Number)
      cStart = new Date(yr, mo-1, 15)
      cEnd   = new Date(yr, mo,   15)
    } else {
      const n = new Date()
      if (n.getDate() >= 15) {
        cStart = new Date(n.getFullYear(), n.getMonth(),   15)
        cEnd   = new Date(n.getFullYear(), n.getMonth()+1, 15)
      } else {
        cStart = new Date(n.getFullYear(), n.getMonth()-1, 15)
        cEnd   = new Date(n.getFullYear(), n.getMonth(),   15)
      }
    }

    const cLabel = cStart.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})
      + ' – ' + new Date(cEnd.getTime()-1).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})

    // Available cycles (last 12)
    const availableCycles = []
    for (let i = 0; i < 12; i++) {
      const n = new Date()
      const s = new Date(n.getFullYear(), n.getMonth() - i + (n.getDate()>=15?0:-1), 15)
      const e = new Date(s.getFullYear(), s.getMonth()+1, 15)
      availableCycles.push({
        key:   `${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,'0')}`,
        label: s.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})
          + ' – ' + new Date(e.getTime()-1).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),
      })
    }

    // All invoices for this officer this cycle
    const allInvoices = await Invoice.find({ issuedBy:targetId, createdAt:{ $gte:cStart, $lt:cEnd } })
      .sort({ createdAt:-1 }).populate('issuedBy','firstName lastName role').lean()

    const paidInvoices = allInvoices.filter(i => i.status === 'paid')
    const salesVolume  = paidInvoices.reduce((s,i) => s+(i.totalDue||0), 0)

    // Group paid by currency
    const byCurrency = {}
    paidInvoices.forEach(i => { byCurrency[i.currency] = (byCurrency[i.currency]||0) + (i.totalDue||0) })

    // Trend — last 7 cycles (sequential)
    const trend = []
    for (let i = 0; i < 7; i++) {
      const n = new Date()
      const s = new Date(n.getFullYear(), n.getMonth()-i+(n.getDate()>=15?0:-1), 15)
      const e = new Date(s.getFullYear(), s.getMonth()+1, 15)
      const f = { issuedBy:targetId, createdAt:{ $gte:s, $lt:e } }
      const [count, paidAgg] = await Promise.all([
        Invoice.countDocuments(f),
        Invoice.aggregate([{ $match:{ ...f, status:'paid' } }, { $group:{ _id:null, total:{ $sum:'$totalDue' } } }]),
      ])
      trend.push({
        key:   `${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,'0')}`,
        cycle: s.toLocaleDateString('en-GB',{month:'short',year:'2-digit'})
          + '–' + new Date(e.getTime()-1).toLocaleDateString('en-GB',{month:'short',year:'2-digit'}),
        count,
        sales: paidAgg[0]?.total || 0,
      })
    }

    const RATE = 0.03, RETAINER = 40000
    const commissionUSD = salesVolume * RATE

    return res.json({
      success: true,
      data: {
        officer: allInvoices[0]?.issuedBy || { _id:targetId },
        cycle:   { start:cStart, end:cEnd, label:cLabel },
        summary: {
          totalInvoiced: allInvoices.length,
          totalPaid:     paidInvoices.length,
          totalPending:  allInvoices.filter(i=>['sent','draft'].includes(i.status)).length,
          salesVolume, byCurrency,
        },
        earnings: {
          retainerKES:   RETAINER,
          commissionRate: RATE,
          salesVolume,
          commissionUSD,
          note: '3% of paid invoice value + KES 40,000 retainer',
        },
        invoices:        allInvoices,
        trend,
        availableCycles,
      },
    })
  } catch(e) {
    console.error('[sales-performance]', e.message, e.stack)
    return res.status(500).json({ success:false, message:e.message })
  }
})

// ── GET /api/invoices ──────────────────────────────────────
router.get('/', auth, ALLOWED, async (req, res) => {
  try {
    const { status, currency, search, page=1, limit=30, issuedBy } = req.query
    // Admin, accountant and ops see every invoice; sales sees own.
    const filter = { ...ledgerScope(req.user) }
    if (status && status!=='all') filter.status = status
    if (currency && currency!=='all') filter.currency = currency
    if (issuedBy && FULL_LEDGER_ROLES.includes(req.user.role)) filter.issuedBy = issuedBy
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i')
      filter.$or = [{ invoiceNo:re },{ billedToName:re },{ billedToEmail:re },{ studentName:re }]
    }
    const p = Math.max(1,parseInt(page)||1), lim = Math.min(100,parseInt(limit)||30)
    const [invoices, total] = await Promise.all([
      Invoice.find(filter).sort({ createdAt:-1 }).skip((p-1)*lim).limit(lim)
        .populate('issuedBy','firstName lastName role').lean(),
      Invoice.countDocuments(filter),
    ])
    return res.json({ success:true, data:{ invoices, total, page:p, totalPages:Math.ceil(total/lim) } })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── GET /api/invoices/:id ──────────────────────────────────
// ── GET /api/invoices/collections ──────────────────────────
// Everything the accountant needs to answer "who has not paid?"
router.get('/collections', auth, ALLOWED, async (req, res) => {
  try {
    const scope = ledgerScope(req.user)
    const now = new Date()
    const soon = new Date(now.getTime() + 7 * 86400000)

    const open = await Invoice.find({ ...scope, status: { $in: ['sent', 'overdue'] } })
      .select('invoiceNo billedToName billedToEmail studentName currency totalDue paidAmount dueDate servicePeriodStart servicePeriodEnd status lastReminderAt reminderCount autoRemind studentId')
      .lean()

    const outstandingOf = i => Number(i.totalDue || 0) - Number(i.paidAmount || 0)
    const isOverdue = i => i.dueDate && new Date(i.dueDate) < now
    const isDueSoon = i => {
      const ref = i.dueDate || i.servicePeriodEnd
      return ref && new Date(ref) >= now && new Date(ref) <= soon
    }

    const overdue  = open.filter(isOverdue)
    const dueSoon  = open.filter(i => !isOverdue(i) && isDueSoon(i))
    const current  = open.filter(i => !isOverdue(i) && !isDueSoon(i))

    // Aging buckets by days past due — the standard receivables view.
    const buckets = { '0-7': 0, '8-30': 0, '31-60': 0, '60+': 0 }
    overdue.forEach(i => {
      const days = Math.floor((now - new Date(i.dueDate)) / 86400000)
      const key = days <= 7 ? '0-7' : days <= 30 ? '8-30' : days <= 60 ? '31-60' : '60+'
      buckets[key] += outstandingOf(i)
    })

    // Collected this calendar month.
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const paidThisMonth = await Invoice.find({ ...scope, status: 'paid', paidAt: { $gte: monthStart } })
      .select('paidAmount totalDue currency').lean()

    const sum = arr => arr.reduce((t, i) => t + outstandingOf(i), 0)
    const collected = paidThisMonth.reduce((t, i) => t + Number(i.paidAmount || i.totalDue || 0), 0)

    // Outstanding split by currency so mixed-currency totals are honest.
    const byCurrency = {}
    open.forEach(i => {
      const c = i.currency || 'USD'
      byCurrency[c] = (byCurrency[c] || 0) + outstandingOf(i)
    })

    return res.json({
      success: true,
      data: {
        counts: { open: open.length, overdue: overdue.length, dueSoon: dueSoon.length, current: current.length },
        totals: {
          outstanding: sum(open),
          overdue:     sum(overdue),
          dueSoon:     sum(dueSoon),
          collectedThisMonth: collected,
        },
        byCurrency,
        aging: buckets,
        // The actual list of unpaid accounts, worst first.
        unpaid: open
          .map(i => ({
            ...i,
            outstanding: outstandingOf(i),
            daysPastDue: i.dueDate ? Math.floor((now - new Date(i.dueDate)) / 86400000) : null,
            bucket: isOverdue(i) ? 'overdue' : isDueSoon(i) ? 'dueSoon' : 'current',
          }))
          .sort((a, b) => (b.daysPastDue ?? -9999) - (a.daysPastDue ?? -9999)),
      },
    })
  } catch (e) {
    console.error('[invoices/collections]', e.message)
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── GET /api/invoices/reminders ────────────────────────────
// Flat history of every reminder sent, newest first.
router.get('/reminders', auth, ALLOWED, async (req, res) => {
  try {
    const { limit = 100, invoiceId } = req.query
    const scope = ledgerScope(req.user)
    const filter = { ...scope, reminderCount: { $gt: 0 } }
    if (invoiceId) filter._id = invoiceId

    const invoices = await Invoice.find(filter)
      .select('invoiceNo billedToName billedToEmail studentName currency totalDue paidAmount status dueDate reminders')
      .populate('reminders.sentBy', 'firstName lastName role')
      .lean()

    const rows = []
    invoices.forEach(inv => {
      (inv.reminders || []).forEach(r => {
        rows.push({
          invoiceId:   inv._id,
          invoiceNo:   inv.invoiceNo,
          billedToName: inv.billedToName,
          studentName: inv.studentName,
          currency:    inv.currency,
          totalDue:    inv.totalDue,
          status:      inv.status,
          sentAt:      r.sentAt,
          sentTo:      r.sentTo,
          kind:        r.kind,
          automatic:   r.automatic,
          sentByName:  r.sentBy ? `${r.sentBy.firstName || ''} ${r.sentBy.lastName || ''}`.trim() : (r.automatic ? 'Automatic' : ''),
        })
      })
    })
    rows.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))

    return res.json({ success: true, total: rows.length, reminders: rows.slice(0, parseInt(limit) || 100) })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── POST /api/invoices/reminders/run ───────────────────────
// Admin-triggered run of the nightly scan. dryRun=true previews.
router.post('/reminders/run', auth, requireRole('admin', 'accountant'), async (req, res) => {
  try {
    const summary = await runDueReminders({ dryRun: !!req.body?.dryRun })
    return res.json({ success: true, data: summary })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

router.get('/:id', auth, ALLOWED, async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id).populate('issuedBy','firstName lastName role email').lean()
    if (!inv) return res.status(404).json({ success:false, message:'Invoice not found.' })
    return res.json({ success:true, data:{ invoice:inv } })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── POST /api/invoices ─────────────────────────────────────
router.post('/', auth, ALLOWED, async (req, res) => {
  try {
    const { invoiceNo:provided, issueDate, dueDate, billedToName, billedToAddress, billedToEmail,
      studentName, studentGrade, subject, programmeLabel, lineItems, currency,
      discount, vatPct, notes, paymentNote, sendEmail,
      studentId, servicePeriodStart, servicePeriodEnd, autoRemind } = req.body

    if (!billedToName?.trim()) return res.status(400).json({ success:false, message:'Billed-to name is required.' })
    if (!lineItems?.length)    return res.status(400).json({ success:false, message:'At least one line item is required.' })

    const invNo    = provided?.trim() || await nextInvoiceNo()
    const items    = lineItems.filter(it=>it.description?.trim())
    const subtotal = items.reduce((s,it)=>s+(parseFloat(it.amount)||0),0)
    const disc     = parseFloat(discount)||0
    const vp       = parseFloat(vatPct)||0
    const vatAmt   = (subtotal-disc)*(vp/100)
    const total    = subtotal-disc+vatAmt

    const inv = await Invoice.create({
      invoiceNo:invNo, issueDate:issueDate||new Date(), dueDate:dueDate||null,
      billedToName:billedToName.trim(), billedToAddress:billedToAddress?.trim()||'',
      billedToEmail:billedToEmail?.trim()?.toLowerCase()||'',
      studentName:studentName?.trim()||'', studentGrade:studentGrade?.trim()||'',
      subject:subject?.trim()||'', programmeLabel:programmeLabel?.trim()||'',
      lineItems:items.map(it=>({ description:it.description, sessions:it.sessions||'',
        duration:it.duration||'', ratePerHr:parseFloat(it.ratePerHr)||0, amount:parseFloat(it.amount)||0 })),
      currency:currency||'USD', subtotal, discount:disc, vatPct:vp, vatAmount:vatAmt, totalDue:total,
      notes:notes?.trim()||'', paymentNote:paymentNote?.trim()||'',
      status:'sent', issuedBy:req.user._id,
      issuedByName:  signatoryForRole(req.user.role).name,
      issuedByTitle: signatoryForRole(req.user.role).title,
      studentId: studentId || null,
      servicePeriodStart: servicePeriodStart || null,
      servicePeriodEnd:   servicePeriodEnd || null,
      autoRemind: autoRemind !== undefined ? !!autoRemind : true,
    })

    if (sendEmail && billedToEmail) {
      const t = getTransporter()
      if (t) {
        const from = process.env.EMAIL_FROM||'Smartious Billing <hello@smartioushomeschool.com>'
        ;(async () => {
          let attachments = []
          try {
            const pdf = await buildInvoicePdfBuffer(inv)
            attachments = [{ filename: `${invNo}.pdf`, content: pdf, contentType: 'application/pdf' }]
          } catch (e) { console.error('[invoice pdf]', e.message) }
          await t.sendMail({ from, to:billedToEmail,
            subject:`Invoice ${invNo} — Smartious Homeschool Global`,
            html:buildInvoiceEmailHTML(inv),
            attachments,
          })
          await Invoice.findByIdAndUpdate(inv._id,{ emailSentTo:billedToEmail, emailSentAt:new Date() })
        })().catch(e=>console.error('[invoice email]',e.message))
      }
    }

    return res.status(201).json({ success:true, data:{ invoice:inv } })
  } catch(e) {
    if (e.code===11000) return res.status(400).json({ success:false, message:'Invoice number already exists.' })
    return res.status(500).json({ success:false, message:e.message })
  }
})

// ── PATCH /api/invoices/:id/status ────────────────────────
router.patch('/:id/status', auth, ALLOWED, async (req, res) => {
  try {
    const { status, paidAmount, paidAt } = req.body
    if (!['draft','sent','paid','overdue','cancelled'].includes(status))
      return res.status(400).json({ success:false, message:'Invalid status.' })
    const upd = { status }
    if (status==='paid') { upd.paidAt=paidAt||new Date(); upd.paidAmount=paidAmount||0 }
    const inv = await Invoice.findByIdAndUpdate(req.params.id,{ $set:upd },{ new:true })
    if (!inv) return res.status(404).json({ success:false, message:'Invoice not found.' })

    // Paying an invoice must also advance the STUDENT's billing clock.
    // Fee reminders are driven by User.nextDueDate, entirely separate
    // from invoice documents, so without this a parent who has paid
    // keeps receiving "fees due" nags until the next cycle rolls over
    // by itself. One payment = one cycle forward, reminder flag reset.
    if (status === 'paid' && inv.studentId) {
      try {
        const student = await User.findById(inv.studentId).select('nextDueDate billingDay')
        if (student) {
          const now = new Date()
          // Base the roll-forward on the cycle being settled: the current
          // due date if it is recent, otherwise today (very stale clocks
          // jump straight to next month rather than replaying the past).
          const base = student.nextDueDate && (now - new Date(student.nextDueDate)) < 45 * 24 * 3600 * 1000 && new Date(student.nextDueDate) > new Date(now.getTime() - 45 * 24 * 3600 * 1000)
            ? new Date(student.nextDueDate) : now
          const next = new Date(base)
          next.setMonth(next.getMonth() + 1)
          if (student.billingDay >= 1 && student.billingDay <= 28) next.setDate(student.billingDay)
          await User.updateOne({ _id: inv.studentId }, { $set: { nextDueDate: next, feeReminderSent: null } })
          console.log(`[invoices] ${inv.invoiceNo} paid; ${inv.studentName || inv.studentId} billing clock advanced to ${next.toDateString()}`)
        }
      } catch (e) { console.error('[invoices] clock advance failed:', e.message) }
    }
    if (status==='paid' && inv.billedToEmail) {
      const t = getTransporter()
      if (t) {
        const receiptNo = 'SM-RCP-'+String(inv.invoiceNo).replace('SM-INV-','')
        ;(async () => {
          let attachments = []
          try {
            const pdf = await buildReceiptPdfBuffer(inv, receiptNo)
            attachments = [{ filename: `${receiptNo}.pdf`, content: pdf, contentType: 'application/pdf' }]
          } catch (e) { console.error('[receipt pdf]', e.message) }
          await t.sendMail({ from:process.env.EMAIL_FROM||'Smartious Billing <hello@smartioushomeschool.com>',
            to:inv.billedToEmail,
            subject:`Payment receipt ${receiptNo} — Smartious Homeschool Global`,
            html:buildReceiptEmailHTML(inv, receiptNo),
            attachments,
          })
        })().catch(e=>console.error('[receipt email]',e.message))
      }
    }
    return res.json({ success:true, data:{ invoice:inv } })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── POST /api/invoices/preview-pdf ─────────────────────
// Streams a PDF preview of an UNSAVED invoice (used by the generator).
router.post('/preview-pdf', auth, ALLOWED, async (req, res) => {
  try {
    if (!buildInvoicePdfBuffer) return res.status(503).json({ success:false, message:'PDF service unavailable.' })
    const { invoiceNo, issueDate, dueDate, billedToName, billedToAddress, billedToEmail,
      studentName, studentGrade, subject, programmeLabel, lineItems, currency,
      discount, vatPct, notes, paymentNote } = req.body
    const items    = (lineItems||[]).filter(it=>it.description?.trim())
    const subtotal = items.reduce((t,it)=>t+(parseFloat(it.amount)||0),0)
    const disc     = parseFloat(discount)||0
    const vp       = parseFloat(vatPct)||0
    const vatAmt   = (subtotal-disc)*(vp/100)
    const inv = {
      invoiceNo: invoiceNo?.trim() || 'DRAFT', issueDate: issueDate||new Date(), dueDate: dueDate||null,
      billedToName: billedToName||'', billedToAddress: billedToAddress||'', billedToEmail: billedToEmail||'',
      studentName: studentName||'', studentGrade: studentGrade||'', subject: subject||'',
      programmeLabel: programmeLabel||'',
      lineItems: items.map(it=>({ description:it.description, sessions:it.sessions||'',
        duration:it.duration||'', ratePerHr:parseFloat(it.ratePerHr)||0, amount:parseFloat(it.amount)||0 })),
      currency: currency||'USD', subtotal, discount:disc, vatPct:vp, vatAmount:vatAmt,
      totalDue: subtotal-disc+vatAmt, notes: notes||'', paymentNote: paymentNote||'',
    }
    const pdf = await buildInvoicePdfBuffer(inv)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename="'+inv.invoiceNo+'.pdf"')
    return res.send(pdf)
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

const parentOrStaff = async (req, res, next) => {
  if (['admin','accountant','sales','ops_manager'].includes(req.user.role)) return next()
  if (req.user.role === 'parent') {
    const Invoice2 = require('../models/Invoice')
    const inv = await Invoice2.findById(req.params.id).select('billedToEmail').lean()
    if (inv && inv.billedToEmail && inv.billedToEmail.toLowerCase() === String(req.user.email||'').toLowerCase()) return next()
  }
  return res.status(403).json({ success:false, message:'Access denied.' })
}

// ── GET /api/invoices/:id/pdf ──────────────────────────
router.get('/:id/pdf', auth, parentOrStaff, async (req, res) => {
  try {
    if (!buildInvoicePdfBuffer) return res.status(503).json({ success:false, message:'PDF service unavailable.' })
    const inv = await Invoice.findById(req.params.id).lean()
    if (!inv) return res.status(404).json({ success:false, message:'Invoice not found.' })
    const pdf = await buildInvoicePdfBuffer(inv)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename="'+inv.invoiceNo+'.pdf"')
    return res.send(pdf)
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── GET /api/invoices/:id/receipt-pdf ──────────────────
router.get('/:id/receipt-pdf', auth, parentOrStaff, async (req, res) => {
  try {
    if (!buildReceiptPdfBuffer) return res.status(503).json({ success:false, message:'PDF service unavailable.' })
    const inv = await Invoice.findById(req.params.id).lean()
    if (!inv) return res.status(404).json({ success:false, message:'Invoice not found.' })
    if (inv.status !== 'paid') return res.status(400).json({ success:false, message:'Receipt only available for paid invoices.' })
    const receiptNo = 'SM-RCP-'+String(inv.invoiceNo).replace('SM-INV-','')
    const pdf = await buildReceiptPdfBuffer(inv, receiptNo)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename="'+receiptNo+'.pdf"')
    return res.send(pdf)
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── GET /api/invoices/:id/receipt-html ────────────────────
router.get('/:id/receipt-html', auth, ALLOWED, async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id).lean()
    if (!inv) return res.status(404).json({ success:false, message:'Invoice not found.' })
    if (inv.status!=='paid') return res.status(400).json({ success:false, message:'Receipt only available for paid invoices.' })
    return res.json({ success:true, data:{ html: buildReceiptHTML(inv) } })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── POST /api/invoices/:id/resend ─────────────────────────
router.post('/:id/resend', auth, ALLOWED, async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id).lean()
    if (!inv) return res.status(404).json({ success:false, message:'Invoice not found.' })
    const email = req.body.email||inv.billedToEmail
    if (!email) return res.status(400).json({ success:false, message:'No email address.' })
    const t = getTransporter()
    if (!t) return res.status(500).json({ success:false, message:'Email not configured.' })
    let attachments = []
    try {
      const pdf = await buildInvoicePdfBuffer(inv)
      attachments.push({ filename: `${inv.invoiceNo}.pdf`, content: pdf, contentType: 'application/pdf' })
      if (inv.status === 'paid') {
        const receiptNo = 'SM-RCP-'+String(inv.invoiceNo).replace('SM-INV-','')
        const rpdf = await buildReceiptPdfBuffer(inv, receiptNo)
        attachments.push({ filename: `${receiptNo}.pdf`, content: rpdf, contentType: 'application/pdf' })
      }
    } catch (e) { console.error('[resend pdf]', e.message) }
    await t.sendMail({ from:process.env.EMAIL_FROM||'Smartious Billing <hello@smartioushomeschool.com>',
      to:email, subject:`Invoice ${inv.invoiceNo} — Smartious Homeschool Global`,
      html:buildInvoiceEmailHTML(inv),
      attachments,
    })
    await Invoice.findByIdAndUpdate(inv._id,{ emailSentTo:email, emailSentAt:new Date() })
    return res.json({ success:true, message:`Invoice resent to ${email}.` })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── DELETE /api/invoices/:id ───────────────────────────────


// ── POST /api/invoices/:id/remind ──────────────────────────
// Manual send / send again.
router.post('/:id/remind', auth, ALLOWED, async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id)
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found.' })
    if (inv.status === 'paid')      return res.status(400).json({ success: false, message: 'This invoice is already paid.' })
    if (inv.status === 'cancelled') return res.status(400).json({ success: false, message: 'This invoice is cancelled.' })

    // A manual send overrides the break rule, but the caller is told.
    const onBreak = await studentIsOnBreak(inv)
    const kind = req.body?.kind || reminderKindFor(inv, new Date()) || 'manual'

    await sendReminder(inv, { kind, sentBy: req.user._id, automatic: false, note: req.body?.note || '' })
    return res.json({
      success: true,
      message: onBreak
        ? `Reminder sent to ${inv.billedToEmail}. Note: this student is marked as on a break.`
        : `Reminder sent to ${inv.billedToEmail}.`,
      data: { invoice: inv, studentOnBreak: onBreak },
    })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})

// ── PATCH /api/invoices/:id/auto-remind ────────────────────
router.patch('/:id/auto-remind', auth, ALLOWED, async (req, res) => {
  try {
    const inv = await Invoice.findByIdAndUpdate(
      req.params.id,
      { autoRemind: !!req.body.autoRemind },
      { new: true }
    )
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found.' })
    return res.json({ success: true, message: inv.autoRemind ? 'Automatic reminders on.' : 'Automatic reminders paused.', data: { invoice: inv } })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message })
  }
})


router.delete('/:id', auth, CAN_DELETE, async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id).lean()
    if (!inv) return res.status(404).json({ success:false, message:'Invoice not found.' })
    await Invoice.findByIdAndDelete(req.params.id)
    // Audit trail: deletions of financial records are logged.
    console.log(`[invoice deleted] ${inv.invoiceNo} (${inv.currency} ${inv.totalDue}) ` +
      `billedTo=${inv.billedToName} by admin=${req.user.email || req.user._id} at ${new Date().toISOString()}`)
    return res.json({ success:true, message:`Invoice ${inv.invoiceNo} deleted.` })
  } catch(e) { return res.status(500).json({ success:false, message:e.message }) }
})

// ── Email HTML helpers ─────────────────────────────────────

function buildReceiptEmailHTML(inv, receiptNo) {
  const m = n=>Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  const fmtDate = d=>{ try{ return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) }catch{return ''} }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F0FDF4;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#F0FDF4;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#065F46,#047857);padding:24px 32px;">
  <div style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#6EE7B7;margin-bottom:6px;">Payment Confirmed</div>
  <div style="font-size:20px;font-weight:800;color:#fff;">Receipt ${receiptNo}</div>
</td></tr>
<tr><td style="padding:28px 32px;">
  <p style="font-size:14px;color:#2c2c2c;margin:0 0 18px;">Dear ${inv.billedToName},</p>
  <p style="font-size:14px;color:#2c2c2c;margin:0 0 20px;">
    Thank you — we have received <strong>${inv.currency} ${m(inv.totalDue)}</strong> for invoice <strong>${inv.invoiceNo}</strong>${inv.studentName?' for '+inv.studentName+"'s tuition":''}.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDF4;border-radius:8px;border:1.5px solid #6EE7B7;margin-bottom:24px;">
    <tr><td style="padding:14px 12px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12.5px;color:#2c2c2c;">
        <tr><td style="padding:3px 0;color:#6B6B6B">Receipt No.</td><td style="text-align:right;font-weight:700">${receiptNo}</td></tr>
        <tr><td style="padding:3px 0;color:#6B6B6B">Paid on</td><td style="text-align:right;font-weight:700">${fmtDate(inv.paidAt||new Date())}</td></tr>
        <tr><td style="padding:6px 0 0;font-weight:800;font-size:14px">Amount received</td><td style="text-align:right;font-weight:800;font-size:14px;color:#065F46">${inv.currency} ${m(inv.totalDue)}</td></tr>
      </table>
    </td></tr>
  </table>
  <p style="font-size:12px;color:#6B6B6B;margin:0;">Questions? hello@smartioushomeschool.com</p>
</td></tr>
<tr><td style="background:#F0FDF4;padding:16px 32px;border-top:1px solid #D1FAE5;">
  <p style="font-size:11px;color:#999;margin:0;">© ${new Date().getFullYear()} Smartious Homeschool Global</p>
</td></tr>
</table></td></tr></table></body></html>`
}

function buildReceiptHTML(inv) {
  const esc  = s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const m    = n=>Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  const fmtD = d=>{ try{ return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) }catch{ return String(d||'') } }
  const cur  = esc(inv.currency||'USD')
  const rNo  = 'SM-RCP-'+String(inv.invoiceNo||'').replace('SM-INV-','')
  const items= (inv.lineItems||[]).filter(i=>(i.description||'').trim())
  const hrs  = items.reduce((s,i)=>{ const n=parseInt(String(i.sessions||'').match(/\d+/)?.[0]||'0'); return s+n },0)
  const rows = items.map(i=>`<tr><td class="desc">${esc(i.description)}</td><td class="c">${esc(i.sessions)}</td><td class="c">${esc(i.duration)}</td><td class="r">${i.ratePerHr?'$'+m(i.ratePerHr):''}</td><td class="r">$${m(i.amount)}</td></tr>`).join('')
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt ${esc(rNo)}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Helvetica Neue',Arial,sans-serif;background:#ddd}
.page{width:210mm;min-height:297mm;background:#fff;margin:60px auto 20px;display:flex;flex-direction:column;box-shadow:0 4px 24px rgba(0,0,0,.15)}
.tb{height:6mm;background:linear-gradient(90deg,#047857,#065F46)}.hd{display:flex;justify-content:space-between;align-items:flex-start;padding:10mm 20mm 0}
.brand{display:flex;align-items:center;gap:10px}.bn{font-size:22px;font-weight:800}.bn em{font-style:italic;color:#8B1A2E}
.sub{font-size:7px;letter-spacing:3px;color:#6B6B6B;font-weight:600}.title{font-size:36px;font-weight:800;color:#065F46}
.rule{height:2.5px;background:#C9A030;margin-top:5px}.stamp{display:inline-block;border:3px solid #065F46;color:#065F46;font-size:22px;font-weight:900;letter-spacing:4px;padding:4px 18px;transform:rotate(-12deg);margin-top:8px;border-radius:4px}
.mt{font-size:10px;min-width:70mm}.mt td{padding:3px 0}.mt td:first-child{color:#6B6B6B;font-size:9px;font-weight:600;text-transform:uppercase;padding-right:16px}.mt td:last-child{font-weight:700;text-align:right}
.body{padding:0 20mm;flex:1}.addr{font-size:9px;color:#6B6B6B;margin:4mm 0 2mm}
.br{display:flex;justify-content:space-between;margin-top:5mm;padding-bottom:5mm;border-bottom:1px solid #E8E2D6;gap:20px}
.bl{font-size:9px;font-weight:700;letter-spacing:1px;color:#C9A030;text-transform:uppercase;margin-bottom:5px}
.bn2{font-size:17px;font-weight:800}.bs{font-size:11px;color:#6B6B6B;margin-top:2px}
.prog{background:#F0FDF4;border-left:3px solid #065F46;padding:8px 14px;margin:5mm 0;font-size:11px;font-weight:700;color:#065F46}
.tbl{border-collapse:collapse;width:100%;margin-top:2mm}.tbl thead td{background:#065F46;color:#fff;font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;padding:8px 11px}
.tbl thead td.r{text-align:right}.tbl thead td.c{text-align:center}
.tbl tbody tr:nth-child(even){background:#F9FFF9}.tbl tbody td{border-bottom:1px solid #E8E2D6;padding:9px 11px;font-size:11px}.tbl tbody td.r{text-align:right}.tbl tbody td.c{text-align:center}.desc{font-weight:600}
.tots{margin-top:5mm;display:flex;justify-content:flex-end}.tbox{width:76mm}.tr{display:flex;justify-content:space-between;padding:5px 11px;font-size:11px}.tr .tk{color:#6B6B6B}.tr .tv{font-weight:600}
.tr.tot{background:#065F46;color:#fff;padding:10px 11px;margin-top:4px;border-radius:3px}.tr.tot .tk,.tr.tot .tv{color:#fff;font-weight:800;font-size:13px}
.pb{background:#F0FDF4;border:1.5px solid #065F46;border-radius:8px;padding:14px 16px;margin-top:6mm}
.pbh{font-size:9px;font-weight:700;letter-spacing:1px;color:#065F46;text-transform:uppercase;margin-bottom:6px}
.pbv{font-size:14px;font-weight:700;color:#065F46}.pbs{font-size:11px;color:#6B6B6B;margin-top:2px}
.ty{margin-top:7mm;font-size:12.5px;color:#1A1A1A;line-height:1.7}
.ft{margin-top:auto;border-top:1px solid #E8E2D6;padding:4mm 20mm;display:flex;justify-content:space-between;font-size:8.5px;color:#6B6B6B}
.bar{position:fixed;top:0;left:0;right:0;background:#065F46;color:#fff;padding:10px 24px;display:flex;justify-content:space-between;align-items:center;z-index:99}
.bar span{font-size:12px;opacity:.8}.bar button{background:#C9A030;color:#7D1025;border:none;padding:9px 22px;border-radius:6px;font-weight:800;font-size:13px;cursor:pointer}
@media print{body{background:#fff}.bar{display:none}.page{margin:0;box-shadow:none;width:100%}@page{size:A4;margin:0}}
</style></head><body>
<div class="bar"><span>Receipt for ${esc(inv.billedToName)} — ${esc(inv.invoiceNo)}</span><button onclick="window.print()">Download Receipt PDF</button></div>
<div class="page">
<div class="tb"></div>
<div class="hd">
  <div class="brand">
    <svg width="46" height="52" viewBox="0 0 60 66"><path d="M30 2 L56 9 V32 C56 47 44 58 30 63 C16 58 4 47 4 32 V9 Z" fill="#8A1228" stroke="#C9A030" stroke-width="1.5"/><path d="M30 13 l2.3 4.7 5.2 .75 -3.75 3.65 .9 5.15 -4.65 -2.45 -4.65 2.45 .9 -5.15 -3.75 -3.65 5.2 -.75 Z" fill="#C9A030"/></svg>
    <div><div class="bn">Smart<em>ious</em></div><div class="sub">HOMESCHOOL · GLOBAL</div></div>
  </div>
  <div style="text-align:right">
    <div style="font-size:9px;letter-spacing:2px;color:#6B6B6B;text-transform:uppercase;margin-bottom:4px">RECEIPT</div>
    <div class="title">RECEIPT</div><div class="rule"></div>
    <div class="stamp">PAID</div>
    <div style="margin-top:10px"><table class="mt">
      <tr><td>Receipt No.</td><td>${esc(rNo)}</td></tr>
      <tr><td>Invoice No.</td><td>${esc(inv.invoiceNo)}</td></tr>
      <tr><td>Issue Date</td><td>${esc(fmtD(inv.issueDate))}</td></tr>
      <tr><td>Paid On</td><td style="color:#065F46;font-weight:800">${esc(fmtD(inv.paidAt||new Date()))}</td></tr>
    </table></div>
  </div>
</div>
<div class="body">
  <div class="addr">Smartious Homeschool Global · Diamond Plaza, 4th Avenue, Parklands, Nairobi · hello@smartioushomeschool.com · +254 745 021 212</div>
  <div class="br">
    <div><div class="bl">Received From</div><div class="bn2">${esc(inv.billedToName)}</div>${inv.billedToAddress?`<div class="bs">${esc(inv.billedToAddress)}</div>`:''}</div>
    ${inv.studentName?`<div><div class="bl">Student</div><div class="bn2">${esc(inv.studentName)}</div><div class="bs">${[inv.studentGrade,inv.subject].filter(Boolean).map(s=>esc(s)).join(' · ')}</div></div>`:''}
  </div>
  ${inv.programmeLabel?`<div class="prog">${esc(inv.programmeLabel)}</div>`:'<div style="margin-top:6mm"></div>'}
  <table class="tbl"><thead><tr><td>Description</td><td class="c">Sessions</td><td class="c">Duration</td><td class="r">Rate/hr</td><td class="r">Amount</td></tr></thead>
  <tbody>${rows}</tbody></table>
  <div class="tots"><div class="tbox">
    <div class="tr"><span class="tk">Subtotal${hrs?' ('+hrs+' hours)':''}</span><span class="tv">$${m(inv.subtotal)}</span></div>
    <div class="tr"><span class="tk">Discount</span><span class="tv">${(inv.discount||0)>0?'$'+m(inv.discount):'—'}</span></div>
    <div class="tr tot"><span class="tk">AMOUNT RECEIVED (${cur})</span><span class="tv">$${m(inv.totalDue)}</span></div>
  </div></div>
  <div class="pb"><div class="pbh">Payment confirmed</div>
    <div class="pbv">${cur} ${m(inv.totalDue)} — Received in full</div>
    <div class="pbs">Paid on ${esc(fmtD(inv.paidAt||new Date()))} · Invoice ${esc(inv.invoiceNo)}</div>
  </div>
  <div class="ty">Thank you for choosing Smartious Homeschool Global${inv.studentName?' for '+esc(inv.studentName)+"'s education":''}. This receipt confirms full payment. Please retain for your records.</div>
</div>
<div class="ft"><span>smartioushomeschool.com · hello@smartioushomeschool.com · +254 745 021 212</span><span>Official Receipt</span></div>
</div></body></html>`
}

module.exports = router
