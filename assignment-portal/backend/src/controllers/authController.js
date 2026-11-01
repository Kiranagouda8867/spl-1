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

    const { name, email, password, role = 'student', studentId, department, inviteCode } = req.body;

    const targetRole = (role || 'student').toLowerCase().trim();

    // Enforce role security on backend: verify authorization keys for elevated roles
    if (targetRole === 'faculty') {
      const expectedKey = process.env.FACULTY_INVITE_CODE || 'FACULTY2024';
      if (!inviteCode || inviteCode.trim() !== expectedKey) {
        return res.status(403).json({
          success: false,
          message: 'Faculty registration requires a valid Faculty Authorization Key.',
        });
      }
    } else if (targetRole === 'admin') {
      const expectedKey = process.env.ADMIN_INVITE_CODE || 'ADMIN2024';
      if (!inviteCode || inviteCode.trim() !== expectedKey) {
        return res.status(403).json({
          success: false,
          message: 'Admin self-registration is restricted. A valid Admin Security Key is required.',
        });
      }
    } else if (targetRole !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Must be student, faculty, or admin.',
      });
    }

    const user = new User({
      name,
      email,
      password,
      role: targetRole,
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
