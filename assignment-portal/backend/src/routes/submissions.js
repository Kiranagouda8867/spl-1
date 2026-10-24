'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, authorise } = require('../middleware/auth');
const { upload } = require('../config/upload');
const submissionsController = require('../controllers/submissionsController');

// Student — submit and view own submissions
router.post('/', authenticate, authorise('student'), upload.single('file'), submissionsController.submitAssignment);
router.get('/mine', authenticate, authorise('student'), submissionsController.getMySubmissions);
router.get('/mine/:assignmentId', authenticate, authorise('student'), submissionsController.getMySubmissionForAssignment);

// Faculty/admin — view all submissions for an assignment
router.get('/assignment/:assignmentId', authenticate, authorise('faculty', 'admin'), submissionsController.getSubmissionsForAssignment);
router.get('/:id', authenticate, submissionsController.getSubmission);
router.get('/:id/download', authenticate, submissionsController.downloadFile);

module.exports = router;
