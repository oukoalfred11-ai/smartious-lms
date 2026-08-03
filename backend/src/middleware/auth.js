const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided.' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user)
      return res.status(401).json({ success: false, message: 'Token is no longer valid.' });
    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated.' });

    // ── Pause enforcement (session layer) ───────────────────
    // A paused student, and any parent ALL of whose linked
    // students are paused, is not recognised by the system
    // until marked Report Back. Having valid logins is not
    // enough — access itself is suspended.
    if (user.role === 'student' && user.onBreak && user.breakBlocksAccess) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_PAUSED',
        message: 'This student account is temporarily paused.',
        pause: {
          role: 'student',
          type: user.breakType || 'other',
          note: user.breakNote || '',
          startAt: user.breakStart || null,
          expectedEnd: user.breakEnd || null,
        },
      });
    }
    if (user.role === 'parent') {
      const childIds = [ ...(user.linkedStudents || []), ...(user.children || []) ]
        .map(String)
      const uniqueIds = [...new Set(childIds)]
      if (uniqueIds.length) {
        const kids = await User.find({ _id: { $in: uniqueIds }, role: 'student' })
          .select('firstName lastName onBreak breakType breakNote breakStart breakEnd breakBlocksAccess').lean()
        if (kids.length && kids.every(k => k.onBreak && k.breakBlocksAccess)) {
          const first = kids[0]
          return res.status(403).json({
            success: false,
            code: 'ACCOUNT_PAUSED',
            message: 'Access is paused while your student account is on hold.',
            pause: {
              role: 'parent',
              type: first.breakType || 'other',
              note: first.breakNote || '',
              startAt: first.breakStart || null,
              expectedEnd: first.breakEnd || null,
              students: kids.map(k => (k.firstName + ' ' + k.lastName).trim()),
            },
          });
        }
      }
    }

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: 'Access denied.' });
  next();
};

module.exports = { auth, requireRole };
