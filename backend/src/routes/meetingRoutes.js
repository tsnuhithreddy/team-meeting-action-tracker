const express = require('express');
const meetingController = require('../controllers/meetingController');
const { meetingRules, validate } = require('../validators/meetingValidator');
const authenticateToken = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// All meeting routes require a logged-in user
router.use(authenticateToken);

// GET all meetings (scoped by user role)
router.get('/', meetingController.getAllMeetings);

// POST create a meeting (ADMIN & MANAGER only)
router.post(
  '/',
  authorizeRoles('ADMIN', 'MANAGER'),
  meetingRules,
  validate,
  meetingController.createMeeting
);

// GET single meeting details
router.get('/:id', meetingController.getMeetingById);

// PUT update meeting (ADMIN & MANAGER only)
router.put(
  '/:id',
  authorizeRoles('ADMIN', 'MANAGER'),
  meetingRules,
  validate,
  meetingController.updateMeeting
);

// DELETE meeting (ADMIN & MANAGER only)
router.delete(
  '/:id',
  authorizeRoles('ADMIN', 'MANAGER'),
  meetingController.deleteMeeting
);

module.exports = router;