const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');

// GET teacher's payslips
router.get('/teacher', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Mock payslips data
    const payslips = [
      {
        month: 'January 2026',
        attendance: 22,
        offHours: 8,
        reads: 142,
        videos: 3,
        gross: 'KES 40,126',
        tax: 'KES 4,013',
        net: 'KES 36,113',
        status: 'Paid'
      },
      {
        month: 'December 2025',
        attendance: 20,
        offHours: 5,
        reads: 89,
        videos: 2,
        gross: 'KES 34,267',
        tax: 'KES 3,427',
        net: 'KES 30,840',
        status: 'Paid'
      },
      {
        month: 'November 2025',
        attendance: 21,
        offHours: 11,
        reads: 201,
        videos: 4,
        gross: 'KES 37,903',
        tax: 'KES 3,790',
        net: 'KES 34,113',
        status: 'Paid'
      }
    ];

    res.json({ success: true, payslips });
  } catch (e) {
    console.error('[payslips/teacher]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching payslips' });
  }
});

// GET payslip by ID (teacher only for their own payslips)
router.get('/:id', auth, requireRole('teacher'), async (req, res) => {
  try {
    // Mock payslip data - in production this would check ownership
    const payslip = {
      id: req.params.id,
      month: 'January 2026',
      attendance: 22,
      offHours: 8,
      reads: 142,
      videos: 3,
      gross: 'KES 40,126',
      tax: 'KES 4,013',
      net: 'KES 36,113',
      status: 'Paid',
      breakdown: {
        baseSalary: 'KES 33,000',
        attendanceBonus: 'KES 3,300',
        contentBonus: 'KES 4,513',
        tax: 'KES 4,013'
      }
    };

    res.json({ success: true, payslip });
  } catch (e) {
    console.error('[payslips GET]', e.message);
    res.status(500).json({ success: false, message: 'Server error fetching payslip' });
  }
});

// POST generate payslip (admin only)
router.post('/generate', auth, requireRole('admin'), async (req, res) => {
  try {
    const { teacherId, month, year } = req.body;

    // Mock payslip generation - in production this would calculate based on actual data
    const newPayslip = {
      id: `payslip-${Date.now()}`,
      teacherId,
      month: `${month} ${year}`,
      attendance: 22,
      offHours: 8,
      reads: 142,
      videos: 3,
      gross: 'KES 40,126',
      tax: 'KES 4,013',
      net: 'KES 36,113',
      status: 'Pending',
      generatedAt: new Date()
    };

    res.json({ success: true, payslip: newPayslip, message: 'Payslip generated successfully' });
  } catch (e) {
    console.error('[payslips/generate]', e.message);
    res.status(500).json({ success: false, message: 'Server error generating payslip' });
  }
});

module.exports = router;
