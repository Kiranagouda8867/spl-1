'use strict';

const { validationResult } = require('express-validator');

/**
 * Middleware to validate request using express-validator.
 * If validation fails, returns 422 with all error messages.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = { validate };
