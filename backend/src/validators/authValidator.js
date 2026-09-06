const { body, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

// Validation rules for login
const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
];

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return next(new AppError(firstError, 400));
  }
  next();
};

module.exports = {
  loginRules,
  validate
};