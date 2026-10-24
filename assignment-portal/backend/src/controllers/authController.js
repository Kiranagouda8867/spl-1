'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { isDBConnected } = require('../config/database');

function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register(req, res, next) {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not available. Please configure MONGODB_URI in backend/.env',
      });
    }

    const { name, email, password, studentId, department } = req.body;

    // Prevent privilege escalation — role always defaults to 'student'
    const user = new User({
      name,
      email,
      password,
      role: 'student',
      studentId,
      department,
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        token,
        user: user.toPublicJSON(),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not available. Please configure MONGODB_URI in backend/.env',
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: user.toPublicJSON(),
      },
    });
  } catch (err) {
    next(err);
  }
}

function logout(_req, res) {
  // JWT is stateless — token invalidation is client-side
  res.json({ success: true, message: 'Logged out successfully.' });
}

module.exports = { register, login, logout };
