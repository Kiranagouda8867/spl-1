'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, authorise } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const assignmentsController = require('../controllers/assignmentsController');

// View assignments (student and faculty)
router.get('/', authenticate, assignmentsController.listAssignments);
router.get('/:id', authenticate, assignmentsController.getAssignment);

// Faculty/admin — create and manage
router.post('/', authenticate, authorise('faculty', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('description').trim().notEmpty().withMessage('Description required'),
    body('course').notEmpty().withMessage('Course ID required'),
    body('deadline').isISO8601().withMessage('Valid deadline date required'),
    body('maxMarks').isInt({ min: 1, max: 1000 }).withMessage('Max marks must be 1-1000'),
    body('resubmissionPolicy').optional().isIn(['none', 'before_deadline', 'always']),
    body('status').optional().isIn(['draft', 'published']),
  ],
  validate,
  assignmentsController.createAssignment
);

router.put('/:id', authenticate, authorise('faculty', 'admin'),
  [
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('deadline').optional().isISO8601(),
    body('maxMarks').optional().isInt({ min: 1, max: 1000 }),
    body('status').optional().isIn(['draft', 'published', 'closed']),
    body('resubmissionPolicy').optional().isIn(['none', 'before_deadline', 'always']),
  ],
  validate,
  assignmentsController.updateAssignment
);

router.delete('/:id', authenticate, authorise('faculty', 'admin'), assignmentsController.deleteAssignment);

module.exports = router;
