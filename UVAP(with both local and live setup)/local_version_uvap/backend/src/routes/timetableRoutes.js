const express = require('express');
const { createSchedule, getMyTimetable } = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin'), createSchedule);
router.get('/my', getMyTimetable);

module.exports = router;
