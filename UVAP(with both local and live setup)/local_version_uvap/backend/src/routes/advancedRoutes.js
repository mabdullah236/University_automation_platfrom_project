const express = require('express');
const { getAlumni, registerAlumni, getEvents, createEvent } = require('../controllers/advancedController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/alumni')
  .get(getAlumni)
  .post(protect, authorize('admin'), registerAlumni);

router.route('/events')
  .get(getEvents)
  .post(protect, authorize('admin', 'faculty'), createEvent);

module.exports = router;
