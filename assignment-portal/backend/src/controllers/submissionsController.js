'use strict';

const path = require('path');
const fs = require('fs');
const { Assignment } = require('../models/Assignment');
const { Submission } = require('../models/Submission');
const { Notification } = require('../models/Notification');

async function submitAssignment(req, res, next) {
  try {
    const { user } = req;
    const { assignmentId, notes } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const assignment = await Assignment.findById(assignmentId).populate('course');
    if (!assignment) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (assignment.status !== 'published') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Assignment is not open for submissions.' });
    }

    // Check student is enrolled in the course
    if (!assignment.course.students.some((s) => s.equals(user._id))) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, message: 'Not enrolled in this course.' });
    }

    const now = new Date();
    const isLate = now > assignment.deadline;

    // Check existing submission
    let submission = await Submission.findOne({ assignment: assignmentId, student: user._id });

    if (submission) {
      // Resubmission check
      if (assignment.resubmissionPolicy === 'none') {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Resubmission is not allowed for this assignment.' });
      }
      if (assignment.resubmissionPolicy === 'before_deadline' && isLate) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Deadline has passed. Resubmission not allowed.' });
      }

      const newVersion = submission.currentVersion + 1;
      submission.versions.push({
        version: newVersion,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        submittedAt: now,
        notes,
      });
      submission.currentVersion = newVersion;
      submission.lastUpdatedAt = now;
      if (isLate) submission.status = 'late';
      else submission.status = 'submitted';
      await submission.save();
    } else {
      // Check initial submission deadline (soft enforcement — late is allowed but marked)
      submission = await Submission.create({
        assignment: assignmentId,
        student: user._id,
        course: assignment.course._id,
        currentVersion: 1,
        versions: [
          {
            version: 1,
            filename: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            submittedAt: now,
            notes,
          },
        ],
        status: isLate ? 'late' : 'submitted',
        isLate,
        submittedAt: now,
      });

      // Notify faculty
      const facultyIds = assignment.course.faculty;
      const notifications = facultyIds.map((fId) => ({
        recipient: fId,
        type: 'submission_received',
        title: `New Submission: ${assignment.title}`,
        message: `${user.name} submitted ${assignment.title}`,
        relatedEntity: { type: 'submission', id: submission._id },
      }));
      if (notifications.length > 0) await Notification.insertMany(notifications);
    }

    await submission.populate([
      { path: 'assignment', select: 'title deadline maxMarks' },
      { path: 'course', select: 'name code' },
    ]);

    res.status(201).json({ success: true, data: submission, message: isLate ? 'Submitted late.' : 'Submitted successfully.' });
  } catch (err) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
}

async function getMySubmissions(req, res, next) {
  try {
    const { courseId } = req.query;
    const filter = { student: req.user._id };
    if (courseId) filter.course = courseId;

    const submissions = await Submission.find(filter)
      .populate('assignment', 'title deadline maxMarks status')
      .populate('course', 'name code')
      .sort({ lastUpdatedAt: -1 });

    res.json({ success: true, data: submissions });
  } catch (err) {
    next(err);
  }
}

async function getMySubmissionForAssignment(req, res, next) {
  try {
    const submission = await Submission.findOne({
      assignment: req.params.assignmentId,
      student: req.user._id,
    })
      .populate('assignment', 'title deadline maxMarks resubmissionPolicy')
      .populate('course', 'name code');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'No submission found.' });
    }

    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
}

async function getSubmissionsForAssignment(req, res, next) {
  try {
    const { user } = req;
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId).populate('course');
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });

    if (user.role === 'faculty' && !assignment.course.faculty.some((f) => f.equals(user._id))) {
      return res.status(403).json({ success: false, message: 'Not authorised for this course.' });
    }

    const { status, page = 1, limit = 50 } = req.query;
    const filter = { assignment: assignmentId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .populate('student', 'name email studentId')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ submittedAt: -1 }),
      Submission.countDocuments(filter),
    ]);

    res.json({ success: true, data: submissions, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    next(err);
  }
}

async function getSubmission(req, res, next) {
  try {
    const { user } = req;
    const submission = await Submission.findById(req.params.id)
      .populate('assignment', 'title deadline maxMarks course')
      .populate('student', 'name email studentId')
      .populate('course', 'name code');

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });

    // Students can only see their own
    if (user.role === 'student' && !submission.student._id.equals(user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
}

async function downloadFile(req, res, next) {
  try {
    const { user } = req;
    const submission = await Submission.findById(req.params.id)
      .populate('assignment')
      .populate({ path: 'assignment', populate: { path: 'course', select: 'faculty' } });

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });

    // Access control
    if (user.role === 'student' && !submission.student.equals(user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (user.role === 'faculty' && !submission.assignment.course.faculty.some((f) => f.equals(user._id))) {
      return res.status(403).json({ success: false, message: 'Not authorised for this course.' });
    }

    const currentFile = submission.versions[submission.versions.length - 1];
    if (!currentFile) return res.status(404).json({ success: false, message: 'No file found.' });

    const filePath = currentFile.filePath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server.' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${currentFile.originalName}"`);
    res.setHeader('Content-Type', currentFile.mimeType || 'application/octet-stream');
    res.sendFile(path.resolve(filePath));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitAssignment, getMySubmissions, getMySubmissionForAssignment,
  getSubmissionsForAssignment, getSubmission, downloadFile,
};
