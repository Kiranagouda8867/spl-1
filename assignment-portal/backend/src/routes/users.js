'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, authorise } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const usersController = require('../controllers/usersController');

router.get('/me', authenticate, usersController.getMe);
router.put('/me', authenticate,
  [
    body('name').optional().trim().isLength({ max: 100 }),
    body('department').optional().trim(),
    body('studentId').optional().trim(),
  ],
  validate,
  usersController.updateMe
);

// Admin only — manage all users
router.get('/', authenticate, authorise('admin'), usersController.listUsers);
router.get('/:id', authenticate, authorise('admin'), usersController.getUserById);
router.put('/:id', authenticate, authorise('admin'),
  [
    body('role').optional().isIn(['student', 'faculty', 'admin']),
    body('isActive').optional().isBoolean(),
    body('name').optional().trim().isLength({ max: 100 }),
  ],
  validate,
  usersController.updateUser
);

module.exports = router;
