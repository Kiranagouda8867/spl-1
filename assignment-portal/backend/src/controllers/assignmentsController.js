'use strict';

const { Assignment } = require('../models/Assignment');
const { Course } = require('../models/Course');
const { Notification } = require('../models/Notification');

async function isFacultyOfCourse(userId, courseId) {
  const course = await Course.findById(courseId);
  if (!course) return false;
  return course.faculty.some((f) => f.equals(userId));
}

async function listAssignments(req, res, next) {
  try {
    const { user } = req;
    const { courseId, status } = req.query;
    const filter = {};

    if (user.role === 'student') {
      // Get enrolled courses
      const courses = await Course.find({ students: user._id }).select('_id');
      const courseIds = courses.map((c) => c._id);
      filter.course = { $in: courseIds };
      filter.status = 'published';
    } else if (user.role === 'faculty') {
      const courses = await Course.find({ faculty: user._id }).select('_id');
      const courseIds = courses.map((c) => c._id);
      filter.course = { $in: courseIds };
    }

    if (courseId) filter.course = courseId;
    if (status && user.role !== 'student') filter.status = status;

    const assignments = await Assignment.find(filter)
      .populate('course', 'name code')
      .populate('createdBy', 'name')
      .sort({ deadline: 1 });

    res.json({ success: true, data: assignments, count: assignments.length });
  } catch (err) {
    next(err);
  }
}

async function getAssignment(req, res, next) {
  try {
    const { user } = req;
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'name code faculty students')
      .populate('createdBy', 'name');

    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });

    const course = assignment.course;
    if (user.role === 'student' && !course.students.some((s) => s.equals(user._id))) {
      return res.status(403).json({ success: false, message: 'Not enrolled in this course.' });
    }
    if (user.role === 'faculty' && !course.faculty.some((f) => f.equals(user._id))) {
      return res.status(403).json({ success: false, message: 'Not authorised for this course.' });
    }

    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

async function createAssignment(req, res, next) {
  try {
    const { user } = req;
    const { title, description, course: courseId, deadline, maxMarks, resubmissionPolicy, status } = req.body;

    if (user.role === 'faculty') {
      const authorised = await isFacultyOfCourse(user._id, courseId);
      if (!authorised) return res.status(403).json({ success: false, message: 'Not authorised for this course.' });
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return res.status(400).json({ success: false, message: 'Deadline must be in the future.' });
    }

    const assignment = await Assignment.create({
      title, description, course: courseId, deadline: deadlineDate,
      maxMarks, resubmissionPolicy, status: status || 'draft', createdBy: user._id,
    });

    // Notify enrolled students if published
    if (assignment.status === 'published') {
      const course = await Course.findById(courseId);
      if (course) {
        const notifications = course.students.map((studentId) => ({
          recipient: studentId,
          type: 'assignment_published',
          title: `New Assignment: ${title}`,
          message: `A new assignment has been published in ${course.name}. Deadline: ${deadlineDate.toDateString()}`,
          relatedEntity: { type: 'assignment', id: assignment._id },
        }));
        if (notifications.length > 0) await Notification.insertMany(notifications);
      }
    }

    await assignment.populate('course', 'name code');
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

async function updateAssignment(req, res, next) {
  try {
    const { user } = req;
    const assignment = await Assignment.findById(req.params.id).populate('course');
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });

    if (user.role === 'faculty' && !assignment.course.faculty.some((f) => f.equals(user._id))) {
      return res.status(403).json({ success: false, message: 'Not authorised for this course.' });
    }

    const allowedFields = ['title', 'description', 'deadline', 'maxMarks', 'status', 'resubmissionPolicy'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (updates.deadline) {
      updates.deadline = new Date(updates.deadline);
    }

    Object.assign(assignment, updates);
    await assignment.save();
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

async function deleteAssignment(req, res, next) {
  try {
    const { user } = req;
    const assignment = await Assignment.findById(req.params.id).populate('course');
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });

    if (user.role === 'faculty' && !assignment.course.faculty.some((f) => f.equals(user._id))) {
      return res.status(403).json({ success: false, message: 'Not authorised for this course.' });
    }

    await assignment.deleteOne();
    res.json({ success: true, message: 'Assignment deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listAssignments, getAssignment, createAssignment, updateAssignment, deleteAssignment };
