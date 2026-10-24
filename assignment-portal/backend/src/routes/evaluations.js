'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, authorise } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const evaluationsController = require('../controllers/evaluationsController');

// Faculty — grade and view evaluations
router.post('/', authenticate, authorise('faculty', 'admin'),
  [
    body('submissionId').notEmpty().withMessage('Submission ID required'),
    body('marks').isFloat({ min: 0 }).withMessage('Marks must be non-negative'),
    body('feedback').optional().trim().isLength({ max: 3000 }),
  ],
  validate,
  evaluationsController.gradeSubmission
);

router.get('/submission/:submissionId', authenticate, evaluationsController.getEvaluation);
router.get('/assignment/:assignmentId', authenticate, authorise('faculty', 'admin'), evaluationsController.getEvaluationsForAssignment);
router.get('/assignment/:assignmentId/export', authenticate, authorise('faculty', 'admin'), evaluationsController.exportGradesCSV);

// Student — see their grades
router.get('/mine', authenticate, authorise('student'), evaluationsController.getMyEvaluations);

module.exports = router;
