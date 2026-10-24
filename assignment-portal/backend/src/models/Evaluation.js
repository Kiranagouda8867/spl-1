'use strict';

const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
      unique: true,
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: [0, 'Marks cannot be negative'],
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [3000, 'Feedback cannot exceed 3000 characters'],
    },
    gradedAt: {
      type: Date,
      default: Date.now,
    },
    isReleased: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

evaluationSchema.index({ student: 1 });
evaluationSchema.index({ assignment: 1 });

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = { Evaluation };
