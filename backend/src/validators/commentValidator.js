const { body, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const addCommentRules = [
  body('commentText')
    .trim()
    .notEmpty()
    .withMessage('Comment text cannot be empty.')
    .isLength({ max: 2000 })
    .withMessage('Comment cannot exceed 2000 characters.')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  next();
};

module.exports = {
  addCommentRules,
  validate
};