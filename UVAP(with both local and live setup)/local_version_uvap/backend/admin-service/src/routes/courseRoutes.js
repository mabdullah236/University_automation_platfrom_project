const express = require('express');
const {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getAllocationData,
  autoAllocate,
  getAllocationReport,
  getTeacherAllocations,
  autoAssignAllCourses,
  cleanupMalformedCourses
} = require('../controllers/courseController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/allocations/data', protect, authorize('admin'), getAllocationData);
router.post('/allocations/auto', protect, authorize('admin'), autoAllocate);
router.post('/allocations/auto-assign', protect, authorize('admin'), autoAssignAllCourses);
router.delete('/allocations/cleanup', protect, authorize('admin'), cleanupMalformedCourses);
router.get('/allocations/report', protect, authorize('admin'), getAllocationReport);
router.get('/allocations/teacher/:teacherId', protect, authorize('admin'), getTeacherAllocations);

router.route('/')
  .get(getCourses)
  .post(protect, authorize('admin', 'faculty'), createCourse);

router.route('/:id')
  .put(protect, authorize('admin'), updateCourse)
  .delete(protect, authorize('admin'), deleteCourse);

module.exports = router;
