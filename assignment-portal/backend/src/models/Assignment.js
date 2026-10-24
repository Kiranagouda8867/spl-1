'use strict';

const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      min: [1, 'Maximum marks must be at least 1'],
      max: [1000, 'Maximum marks cannot exceed 1000'],
    },
    allowedFileTypes: {
      type: [String],
      default: ['.pdf', '.doc', '.docx', '.zip'],
    },
    maxFileSizeMB: {
      type: Number,
      default: 10,
    },
    resubmissionPolicy: {
      type: String,
      enum: ['none', 'before_deadline', 'always'],
      default: 'before_deadline',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        size: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ course: 1, status: 1 });
assignmentSchema.index({ deadline: 1 });

// Virtual: is past deadline (server-side check)
assignmentSchema.virtual('isPastDeadline').get(function () {
  return new Date() > this.deadline;
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = { Assignment };
