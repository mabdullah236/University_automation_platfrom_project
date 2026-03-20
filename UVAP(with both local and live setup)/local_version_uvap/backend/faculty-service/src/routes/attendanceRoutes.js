const express = require('express');
const { markAttendance, getMyAttendance, getCourseAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/mark', authorize('faculty'), markAttendance);
router.get('/my', authorize('student'), getMyAttendance);
router.get('/course/:courseId', authorize('faculty', 'admin'), getCourseAttendance);

module.exports = router;
