const express = require('express');
const { createEvent, getUpcomingEvents } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('admin'), createEvent)
  .get(getUpcomingEvents);

module.exports = router;
