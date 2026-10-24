'use strict';

const { Course } = require('../models/Course');

async function listCourses(req, res, next) {
  try {
    const { user } = req;
    const filter = { isActive: true };

    if (user.role === 'student') {
      filter.students = user._id;
    } else if (user.role === 'faculty') {
      filter.faculty = user._id;
    }
    // admin sees all courses

    const courses = await Course.find(filter)
      .populate('faculty', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: courses, count: courses.length });
  } catch (err) {
    next(err);
  }
}

async function getCourse(req, res, next) {
  try {
    const { user } = req;
    const course = await Course.findById(req.params.id)
      .populate('faculty', 'name email department')
      .populate('students', 'name email studentId')
      .populate('createdBy', 'name');

    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    // Access control
    if (user.role === 'student' && !course.students.some((s) => s._id.equals(user._id))) {
      return res.status(403).json({ success: false, message: 'Not enrolled in this course.' });
    }
    if (user.role === 'faculty' && !course.faculty.some((f) => f._id.equals(user._id))) {
      return res.status(403).json({ success: false, message: 'Not assigned to this course.' });
    }

    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
}

async function createCourse(req, res, next) {
  try {
    const { name, code, description, department, semester } = req.body;
    const course = await Course.create({
      name,
      code,
      description,
      department,
      semester,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
}

async function updateCourse(req, res, next) {
  try {
    const { name, description, isActive, semester, department } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.isActive = isActive;
    if (semester !== undefined) updates.semester = semester;
    if (department !== undefined) updates.department = department;

    const course = await Course.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true,
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
}

async function enrollStudents(req, res, next) {
  try {
    const { studentIds } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { students: { $each: studentIds } } },
      { new: true }
    ).populate('students', 'name email');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
}

async function assignFaculty(req, res, next) {
  try {
    const { facultyIds } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { faculty: { $each: facultyIds } } },
      { new: true }
    ).populate('faculty', 'name email');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
}

async function removeStudent(req, res, next) {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $pull: { students: req.params.studentId } },
      { new: true }
    );
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCourses, getCourse, createCourse, updateCourse,
  enrollStudents, assignFaculty, removeStudent,
};
