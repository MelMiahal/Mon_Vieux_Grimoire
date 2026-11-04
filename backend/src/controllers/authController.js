const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function signup(req, res) {
  const { email, password } = req.body;

  if (typeof email !== 'string' || !email.trim()
    || typeof password !== 'string' || !password) {
    const error = new Error('Email and password are required');
    error.status = 400;
    throw error;
  }

  const user = new User({ email: email.trim(), password });
  await user.save();

  return res.status(201).json({ message: 'User created successfully' });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (typeof email !== 'string' || !email.trim()
    || typeof password !== 'string' || !password) {
    const error = new Error('Email and password are required');
    error.status = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const userId = user._id.toString();
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });

  return res.status(200).json({ userId, token });
}

function getAuthenticatedUser(req, res) {
  return res.status(200).json({ userId: req.auth.userId });
}

module.exports = {
  getAuthenticatedUser,
  login,
  signup,
};
