const { body, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const createUserRules = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ max: 100 }),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  body('roleId')
    .isInt({ min: 1, max: 3 })
    .withMessage('Role ID must be 1 (ADMIN), 2 (MANAGER), or 3 (EMPLOYEE).')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  next();
};

module.exports = {
  createUserRules,
  validate
};