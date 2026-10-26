const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      authLog(req, 'no token sent');
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // ── Sliding session ──────────────────────────────────────
    // Tokens expire after 7 days, but nobody active should ever
    // meet that cliff (it used to log teachers out mid-class and
    // kill classroom media rejoins). Whenever a valid token is in
    // its last 3 days, a fresh one rides back on this header; the
    // frontend swaps it in silently. Only a person idle for a full
    // week re-logs in, and they meet it at the login screen.
    try {
      if (decoded.exp && decoded.exp * 1000 - Date.now() < 3 * 24 * 60 * 60 * 1000) {
        const fresh = jwt.sign({ id: decoded.id, role: decoded.role }, JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        res.set('x-renew-token', fresh);
      }
    } catch (e) { /* renewal is best effort */ }

    const user = await User.findById(decoded.id).select('-password');

    // Presence: stamp lastActive at most once per five minutes per
    // user - powers the "online now" view without write storms.
    try {
      if (user && (!user.lastActive || Date.now() - new Date(user.lastActive).getTime() > 5 * 60 * 1000)) {
        User.updateOne({ _id: user._id }, { $set: { lastActive: new Date() } }).catch(() => {});
        user.lastActive = new Date();
      }
    } catch (e) { /* presence is best effort */ }
    if (!user) {
      authLog(req, 'the account in the token no longer exists');
      return res.status(401).json({ success: false, message: 'Token is no longer valid.' });
    }
    if (!user.isActive) {
      authLog(req, 'account deactivated: ' + user.email);
      return res.status(403).json({ success: false, message: 'Account deactivated.' });
    }

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
    // Only a bad or expired token is an authentication failure (401). Any
    // other error (the database briefly unreachable, a timeout) used to be
    // reported as 401 "Unauthorized." too, and the app logs out on a 401,
    // so a short database blip signed people out and blocked every module.
    // Those now answer 503: the session is kept and the request retried.
    if (e && /^(TokenExpiredError|JsonWebTokenError|NotBeforeError)$/.test(e.name)) {
      authLog(req, e.name === 'TokenExpiredError' ? 'expired token' : 'invalid token: ' + e.message);
      return res.status(401).json({ success: false, code: e.name === 'TokenExpiredError' ? 'SESSION_EXPIRED' : 'INVALID_TOKEN',
        message: e.name === 'TokenExpiredError' ? 'Your session has expired. Please sign in again.' : 'Your session is not valid. Please sign in again.' });
    }
    if (e && e.name === 'CastError') {
      authLog(req, 'token names an invalid user id');
      return res.status(401).json({ success: false, code: 'INVALID_TOKEN', message: 'Your session is not valid. Please sign in again.' });
    }
    console.error('[auth] could not check the session (' + req.method + ' ' + req.originalUrl + '): ' + (e && (e.name + ': ' + e.message)));
    res.set('Retry-After', '2');
    return res.status(503).json({ success: false, code: 'AUTH_UNAVAILABLE', message: 'The server is busy for a moment. Please try again.' });
  }
};

// One line per rejected session, so the reason is visible in the server
// log (it used to be silent), without flooding it: at most one per
// reason and path every minute.
const seen = new Map();
function authLog(req, why) {
  const key = why + ' ' + (req.baseUrl || req.originalUrl);
  const now = Date.now();
  if (now - (seen.get(key) || 0) < 60000) return;
  seen.set(key, now);
  if (seen.size > 500) seen.clear();
  console.warn('[auth] 401 ' + req.method + ' ' + req.originalUrl + ': ' + why);
}

// Route families a QA reviewer never sees, even read only: money,
// staff pay and admissions pipelines are outside an accreditor's
// remit.
// Matched against the mount path (req.baseUrl), e.g. fee collection is /api/fees.
const QA_BLOCKED_PATHS = ['/payroll', '/invoices', '/paystack', '/fees', '/payments', '/inventory', '/crm', '/inquiries', '/frontdesk', '/assessment'];

// The Dean of Studies and the Operations Manager are one merged role:
// "Dean & Operations". Either account may do anything the other can, so
// the two people sharing the job have identical access.
const DEAN_OPS = ['dos', 'ops_manager'];

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(403).json({ success: false, message: 'Access denied.' });
  if (roles.includes(req.user.role)) return next();
  if (DEAN_OPS.includes(req.user.role) && roles.some(r => DEAN_OPS.includes(r))) return next();
  // Extra responsibilities on one account, e.g. Quality Assurance held
  // by a member of the Dean & Operations team.
  if ((req.user.additionalRoles || []).some(r => roles.includes(r))) return next();

  // QA (accreditation reviewer, e.g. Cognia or Cambridge): a
  // read-only shadow of the staff surfaces. Any GET that an internal
  // staff role may make, QA may make too; every write stays denied,
  // structurally, and the finance families above are closed even to
  // reads. One rule here beats a 'qa' edit in every route file, and
  // new routes inherit it automatically.
  if (
    req.user.role === 'qa' &&
    req.method === 'GET' &&
    !QA_BLOCKED_PATHS.some(p => (req.baseUrl || '').includes(p)) &&
    ['admin', 'dos', 'ops_manager', 'teacher', 'accountant'].some(r => roles.includes(r))
  ) return next();

  return res.status(403).json({ success: false, message: 'Access denied.' });
};

module.exports = { auth, requireRole };
