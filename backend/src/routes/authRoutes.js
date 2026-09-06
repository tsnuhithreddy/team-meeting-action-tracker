const express = require('express');
const authController = require('../controllers/authController');
const { loginRules, validate } = require('../validators/authValidator');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Public route: Login
router.post('/login', loginRules, validate, authController.login);

// Protected route: Get profile of logged-in user
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;