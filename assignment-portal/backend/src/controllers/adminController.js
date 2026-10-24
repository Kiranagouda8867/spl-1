'use strict';

const { User } = require('../models/User');
const { Course } = require('../models/Course');
const { Assignment } = require('../models/Assignment');
const { Submission } = require('../models/Submission');

async function getDashboardStats(req, res, next) {
  try {
    const [
      totalUsers, studentCount, facultyCount, adminCount,
      totalCourses, activeCourses,
      totalAssignments, publishedAssignments,
      totalSubmissions, gradedSubmissions,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      User.countDocuments({ role: 'admin' }),
      Course.countDocuments(),
      Course.countDocuments({ isActive: true }),
      Assignment.countDocuments(),
      Assignment.countDocuments({ status: 'published' }),
      Submission.countDocuments(),
      Submission.countDocuments({ status: 'graded' }),
    ]);

    // Recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, students: studentCount, faculty: facultyCount, admins: adminCount },
        courses: { total: totalCourses, active: activeCourses },
        assignments: { total: totalAssignments, published: publishedAssignments },
        submissions: { total: totalSubmissions, graded: gradedSubmissions },
        recentUsers,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password, role, department, studentId } = req.body;
    const user = new User({ name, email, password, role, department, studentId });
    await user.save();
    res.status(201).json({ success: true, data: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboardStats, createUser };
