'use strict';

const mongoose = require('mongoose');

const submissionVersionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String },
    submittedAt: { type: Date, default: Date.now },
    notes: { type: String, maxlength: 500 },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
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
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    // All submission versions (newest last)
    versions: {
      type: [submissionVersionSchema],
      default: [],
    },
    // Current active version number
    currentVersion: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['submitted', 'late', 'graded', 'returned'],
      default: 'submitted',
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Unique: one submission record per student per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1, status: 1 });
submissionSchema.index({ course: 1 });

// Current file (latest version)
submissionSchema.virtual('currentFile').get(function () {
  if (!this.versions || this.versions.length === 0) return null;
  return this.versions[this.versions.length - 1];
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = { Submission };
