'use strict';

const { User } = require('../models/User');

async function getMe(req, res) {
  res.json({ success: true, data: req.user.toPublicJSON() });
}

async function updateMe(req, res, next) {
  try {
    const { name, department, studentId } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (department !== undefined) updates.department = department;
    if (studentId !== undefined) updates.studentId = studentId;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users.map((u) => u.toPublicJSON()),
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { role, isActive, name, department } = req.body;
    const updates = {};
    if (role !== undefined) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    if (name !== undefined) updates.name = name;
    if (department !== undefined) updates.department = department;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, listUsers, getUserById, updateUser };
