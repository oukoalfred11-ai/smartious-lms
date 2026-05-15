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
