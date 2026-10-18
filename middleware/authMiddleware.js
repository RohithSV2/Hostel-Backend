const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'hostelmate_jwt_secret_key_2026_xyz';
      const decoded = jwt.verify(token, secret);
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        return res.status(401).json({ message: 'User not found for token' });
      }

      return next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // Fallback for simple direct userId in body/params in legacy prototype calls
  if (req.body?.userId || req.params?.userId || req.query?.userId) {
    const fallbackId = req.body.userId || req.params.userId || req.query.userId;
    try {
      req.user = await User.findByPk(fallbackId, {
        attributes: { exclude: ['password'] }
      });
      if (req.user) return next();
    } catch (e) {}
  }

  return res.status(401).json({ message: 'Not authorized, no token provided' });
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Admin role required' });
};

module.exports = protect;
module.exports.protect = protect;
module.exports.adminOnly = adminOnly;
