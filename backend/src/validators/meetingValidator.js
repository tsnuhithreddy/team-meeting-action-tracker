const { body, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const meetingRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Meeting title is required.')
    .isLength({ max: 200 })
    .withMessage('Meeting title cannot exceed 200 characters.'),
  body('meetingDate')
    .notEmpty()
    .withMessage('Meeting date is required.')
    .isISO8601()
    .withMessage('Invalid date format. Use YYYY-MM-DD.'),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/)
    .withMessage('Start time must be in HH:MM or HH:MM:SS format.'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/)
    .withMessage('End time must be in HH:MM or HH:MM:SS format.'),
  body('participantIds')
    .optional()
    .isArray()
    .withMessage('participantIds must be an array of user IDs.'),
  body('participantIds.*')
    .isInt({ min: 1 })
    .withMessage('Each participant ID must be a positive integer.')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  next();
};

module.exports = {
  meetingRules,
  validate
};