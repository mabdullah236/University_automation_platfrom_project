const express = require('express');
const { createComplaint, getAllComplaints, updateStatus } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('student', 'faculty'), createComplaint)
  .get(getAllComplaints);

router.route('/:id')
  .put(authorize('admin'), updateStatus);

module.exports = router;
