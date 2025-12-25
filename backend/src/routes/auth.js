// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret } = require('../middleware/auth');

// register
router.post('/register', async (req,res) => {
  const { name, email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email & password required' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'User exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: hash, role: role || 'user' });
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '30d' });
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// login
router.post('/login', async (req,res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email & password required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '30d' });
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
