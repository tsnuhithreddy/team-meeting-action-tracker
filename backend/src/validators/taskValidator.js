const { body, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const createTaskRules = [
  body('meetingId')
    .notEmpty()
    .withMessage('Meeting ID is required.')
    .isInt({ min: 1 })
    .withMessage('Meeting ID must be a valid integer.'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required.')
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters.'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Priority must be LOW, MEDIUM, HIGH, or CRITICAL.'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required.')
    .isISO8601()
    .withMessage('Invalid date format. Use YYYY-MM-DD.'),
  body('assigneeId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Assignee ID must be a valid integer.')
];

// Rules for PUT /api/tasks/:id (full update). Unlike createTaskRules, this
// omits meetingId (not part of the update payload) but requires title,
// priority, status, and dueDate since TaskModel.update() writes them
// directly with no JS-level fallback, and all four are NOT NULL columns.
const updateTaskRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required.')
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters.'),
  body('description')
    .optional({ nullable: true })
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters.'),
  body('priority')
    .notEmpty()
    .withMessage('Priority is required.')
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Priority must be LOW, MEDIUM, HIGH, or CRITICAL.'),
  body('status')
    .notEmpty()
    .withMessage('Status is required.')
    .isIn(['OPEN', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'])
    .withMessage('Status must be OPEN, IN_PROGRESS, BLOCKED, or COMPLETED.'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required.')
    .isISO8601()
    .withMessage('Invalid date format. Use YYYY-MM-DD.'),
  body('assigneeId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Assignee ID must be a valid integer.')
];

const updateStatusRules = [
  body('status')
    .notEmpty()
    .withMessage('Status is required.')
    .isIn(['OPEN', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'])
    .withMessage('Status must be OPEN, IN_PROGRESS, BLOCKED, or COMPLETED.')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  next();
};

module.exports = {
  createTaskRules,
  updateTaskRules,
  updateStatusRules,
  validate
};