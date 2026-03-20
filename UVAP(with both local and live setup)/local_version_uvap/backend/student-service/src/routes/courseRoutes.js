const express = require('express');
const { getCourses, createCourse, updateCourse, deleteCourse, getStudentCourses, assignTeacher, getAllocations } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-courses', protect, authorize('student'), getStudentCourses);

router.route('/allocations')
  .post(protect, authorize('admin'), assignTeacher)
  .get(protect, authorize('admin'), getAllocations);

router.route('/')
  .get(getCourses)
  .post(protect, authorize('admin', 'faculty'), createCourse);

router.route('/:id')
  .put(protect, authorize('admin'), updateCourse)
  .delete(protect, authorize('admin'), deleteCourse);

module.exports = router;
