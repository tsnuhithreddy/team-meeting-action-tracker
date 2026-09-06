const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

// GET /api/dashboard
router.get('/', dashboardController.getDashboard);

module.exports = router;