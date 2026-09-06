const express = require('express');
const userController = require('../controllers/userController');
const { createUserRules, validate } = require('../validators/userValidator');
const authenticateToken = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticateToken);

// GET /api/users (Admin & Manager can list users for assignment)
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), userController.getAllUsers);

// POST /api/users (Admin only)
router.post('/', authorizeRoles('ADMIN'), createUserRules, validate, userController.createUser);

// DELETE /api/users/:id (Admin only)
router.delete('/:id', authorizeRoles('ADMIN'), userController.deactivateUser);

module.exports = router;