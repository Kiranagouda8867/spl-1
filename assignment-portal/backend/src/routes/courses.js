'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, authorise } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const coursesController = require('../controllers/coursesController');

// All authenticated users can list and view courses
router.get('/', authenticate, coursesController.listCourses);
router.get('/:id', authenticate, coursesController.getCourse);

// Admin only — create, update courses; enrol students; assign faculty
router.post('/', authenticate, authorise('admin'),
  [
    body('name').trim().notEmpty().withMessage('Course name required'),
    body('code').trim().notEmpty().withMessage('Course code required').toUpperCase(),
    body('description').optional().trim(),
    body('department').optional().trim(),
    body('semester').optional().trim(),
  ],
  validate,
  coursesController.createCourse
);

router.put('/:id', authenticate, authorise('admin'),
  [
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  coursesController.updateCourse
);

router.post('/:id/enroll', authenticate, authorise('admin'),
  [body('studentIds').isArray().withMessage('studentIds must be an array')],
  validate,
  coursesController.enrollStudents
);

router.post('/:id/faculty', authenticate, authorise('admin'),
  [body('facultyIds').isArray().withMessage('facultyIds must be an array')],
  validate,
  coursesController.assignFaculty
);

router.delete('/:id/enroll/:studentId', authenticate, authorise('admin'), coursesController.removeStudent);

module.exports = router;
