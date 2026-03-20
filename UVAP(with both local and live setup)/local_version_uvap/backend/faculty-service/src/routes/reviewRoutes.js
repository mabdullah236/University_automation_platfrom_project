const express = require('express');
const { submitReview, getReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authorize('student'), submitReview)
  .get(protect, authorize('admin', 'faculty'), getReviews);

module.exports = router;
