const express = require('express');
const { addResult, getMyResults, getCourseResults } = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', authorize('faculty'), addResult);
router.get('/my', authorize('student'), getMyResults);
router.get('/course/:courseId', authorize('faculty', 'admin'), getCourseResults);

module.exports = router;
