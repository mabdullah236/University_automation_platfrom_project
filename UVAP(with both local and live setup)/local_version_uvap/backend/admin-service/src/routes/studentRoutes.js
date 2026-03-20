const express = require('express');
const { searchStudent, updateStudent, getAllStudents, deleteStudent, getOfferedCourses, selfEnroll, promoteStudents, autoAssignSections, getSectionStats, deleteSection, mergeSections, getActiveSections, updateStudentStatus, runPromotionCycle, getStudentFilters, deleteBBA, getMyCourses } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const StudentProfile = require('../models/StudentProfile');

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getAllStudents);

router.get('/search', protect, authorize('admin', 'faculty'), searchStudent);

router.get('/offered-courses', protect, authorize('student'), getOfferedCourses);
router.get('/my-courses', protect, authorize('student'), getMyCourses);
router.post('/enroll', protect, authorize('student'), selfEnroll);
router.post('/promote', protect, authorize('admin'), promoteStudents);
router.post('/promotion/run', protect, authorize('admin'), runPromotionCycle); // New Promotion Engine
router.post('/sectioning', protect, authorize('admin'), autoAssignSections);
router.get('/sections/stats', protect, authorize('admin'), getSectionStats);
router.post('/sections/delete', protect, authorize('admin'), deleteSection);
router.post('/sections/merge', protect, authorize('admin'), mergeSections);
router.post('/sections/merge', protect, authorize('admin'), mergeSections);
router.get('/active-sections', protect, authorize('admin'), getActiveSections);
router.get('/filters', protect, authorize('admin'), getStudentFilters);
router.get('/nuke-bba', deleteBBA); // Temporary Route

router.put('/:id/status', protect, authorize('admin'), updateStudentStatus);

router.route('/:id')
  .put(protect, authorize('admin'), updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

module.exports = router;
