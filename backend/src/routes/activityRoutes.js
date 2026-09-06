const express = require('express');
const activityController = require('../controllers/activityController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

// GET /api/activity (scoped by user role)
router.get('/', activityController.getActivityLogs);

module.exports = router;