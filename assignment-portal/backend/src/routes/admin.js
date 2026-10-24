'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, authorise } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const adminController = require('../controllers/adminController');

// All admin routes require admin role
router.use(authenticate, authorise('admin'));

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// User management
router.post('/users', 
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').isIn(['student', 'faculty', 'admin']).withMessage('Valid role required'),
    body('department').optional().trim(),
    body('studentId').optional().trim(),
  ],
  validate,
  adminController.createUser
);

module.exports = router;
