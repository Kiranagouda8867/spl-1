'use strict';

const { Evaluation } = require('../models/Evaluation');
const { Submission } = require('../models/Submission');
const { Assignment } = require('../models/Assignment');
const { Notification } = require('../models/Notification');

async function gradeSubmission(req, res, next) {
  try {
    const { user } = req;
    const { submissionId, marks, feedback } = req.body;

    const submission = await Submission.findById(submissionId)
      .populate({ path: 'assignment', populate: { path: 'course', select: 'faculty' } });

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });

    const assignment = submission.assignment;

    if (user.role === 'faculty' && !assignment.course.faculty.some((f) => f.equals(user._id))) {
      return res.status(403).json({ success: false, message: 'Not authorised for this course.' });
    }

    if (marks > assignment.maxMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks cannot exceed maximum marks (${assignment.maxMarks}).`,
      });
    }

    // Upsert evaluation
    const evaluation = await Evaluation.findOneAndUpdate(
      { submission: submissionId },
      {
        submission: submissionId,
        assignment: assignment._id,
        student: submission.student,
        gradedBy: user._id,
        marks,
        feedback,
        gradedAt: new Date(),
        isReleased: true,
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Update submission status
    await Submission.findByIdAndUpdate(submissionId, { status: 'graded' });

    // Notify student
    await Notification.create({
      recipient: submission.student,
      type: 'grade_released',
      title: `Grade Released: ${assignment.title}`,
      message: `Your submission for ${assignment.title} has been graded. Marks: ${marks}/${assignment.maxMarks}`,
      relatedEntity: { type: 'evaluation', id: evaluation._id },
    });

    await evaluation.populate([
      { path: 'gradedBy', select: 'name' },
      { path: 'assignment', select: 'title maxMarks' },
    ]);

    res.status(201).json({ success: true, data: evaluation });
  } catch (err) {
    next(err);
  }
}

async function getEvaluation(req, res, next) {
  try {
    const { user } = req;
    const evaluation = await Evaluation.findOne({ submission: req.params.submissionId })
      .populate('gradedBy', 'name')
      .populate('assignment', 'title maxMarks')
      .populate('student', 'name email');

    if (!evaluation) return res.status(404).json({ success: false, message: 'Evaluation not found.' });

    if (user.role === 'student' && !evaluation.student._id.equals(user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: evaluation });
  } catch (err) {
    next(err);
  }
}

async function getEvaluationsForAssignment(req, res, next) {
  try {
    const evaluations = await Evaluation.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email studentId')
      .populate('gradedBy', 'name')
      .sort({ gradedAt: -1 });

    res.json({ success: true, data: evaluations });
  } catch (err) {
    next(err);
  }
}

async function exportGradesCSV(req, res, next) {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId).populate('course', 'name code');
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });

    const evaluations = await Evaluation.find({ assignment: assignmentId })
      .populate('student', 'name email studentId')
      .populate('gradedBy', 'name');

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'name email studentId');

    // Build CSV
    const rows = [
      ['Student Name', 'Email', 'Student ID', 'Submitted At', 'Status', 'Marks', 'Max Marks', 'Percentage', 'Feedback', 'Graded By', 'Graded At'],
    ];

    for (const sub of submissions) {
      const eval_ = evaluations.find((e) => e.student._id.equals(sub.student._id));
      const marks = eval_ ? eval_.marks : '';
      const percentage = eval_ ? ((eval_.marks / assignment.maxMarks) * 100).toFixed(2) + '%' : '';
      rows.push([
        sub.student.name,
        sub.student.email,
        sub.student.studentId || '',
        sub.submittedAt.toISOString(),
        sub.status,
        marks,
        assignment.maxMarks,
        percentage,
        eval_ ? (eval_.feedback || '').replace(/,/g, ';') : '',
        eval_ ? eval_.gradedBy.name : '',
        eval_ ? eval_.gradedAt.toISOString() : '',
      ]);
    }

    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const filename = `grades_${assignment.course.code}_${assignment.title.replace(/\s+/g, '_')}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

async function getMyEvaluations(req, res, next) {
  try {
    const evaluations = await Evaluation.find({ student: req.user._id, isReleased: true })
      .populate('assignment', 'title maxMarks course')
      .populate({ path: 'assignment', populate: { path: 'course', select: 'name code' } })
      .populate('gradedBy', 'name')
      .sort({ gradedAt: -1 });

    res.json({ success: true, data: evaluations });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  gradeSubmission, getEvaluation, getEvaluationsForAssignment, exportGradesCSV, getMyEvaluations,
};
