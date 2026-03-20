const express = require('express');
const { updateProfile, getAllFaculty, getFacultyProfile, updateFacultySettings, createFaculty, updateFaculty, deleteFaculty, getMyCourses, toggleFacultyStatus } = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getAllFaculty)
  .post(protect, authorize('admin'), createFaculty);

router.route('/:id')
  .put(protect, authorize('admin'), updateFaculty)
  .delete(protect, authorize('admin'), deleteFaculty);

router.route('/:id/status')
  .put(protect, authorize('admin'), toggleFacultyStatus);

router.route('/profile')
  .post(protect, authorize('faculty', 'admin'), updateProfile);

router.route('/me')
  .get(protect, authorize('faculty'), getFacultyProfile);

router.route('/me/settings')
  .put(protect, authorize('faculty'), updateFacultySettings);

router.route('/my-courses')
  .get(protect, authorize('faculty'), getMyCourses);

module.exports = router;
