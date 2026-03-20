const express = require('express');
const { scheduleExam, getExams } = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin'), scheduleExam);
router.get('/', getExams);

module.exports = router;
