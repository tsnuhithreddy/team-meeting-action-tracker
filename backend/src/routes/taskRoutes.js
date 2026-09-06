const express = require('express');
const taskController = require('../controllers/taskController');
const commentController = require('../controllers/commentController'); // <-- Add this
const { createTaskRules, updateStatusRules, validate } = require('../validators/taskValidator');
const { addCommentRules, validate: validateComment } = require('../validators/commentValidator'); // <-- Add this
const authenticateToken = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticateToken);

// Task Routes
router.get('/my-tasks', taskController.getMyTasks);
router.get('/', taskController.getAllTasks);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createTaskRules, validate, taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), taskController.updateTask);
router.patch('/:id/status', updateStatusRules, validate, taskController.updateTaskStatus);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), taskController.deleteTask);

// Comments Endpoints for a specific Task
router.get('/:id/comments', commentController.getCommentsByTask);
router.post('/:id/comments', addCommentRules, validateComment, commentController.addComment);

module.exports = router;