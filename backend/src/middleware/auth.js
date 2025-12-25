// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET || 'devsecret';

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split?.(' ')?.[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const data = jwt.verify(token, jwtSecret);
    const user = await User.findById(data.id).select('-passwordHash');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireProvider(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Auth required' });
  if (req.user.role !== 'provider' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Provider access required' });
  }
  next();
}

module.exports = { requireAuth, requireProvider, jwtSecret };

