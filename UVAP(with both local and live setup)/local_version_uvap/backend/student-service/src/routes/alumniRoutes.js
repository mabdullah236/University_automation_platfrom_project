const express = require('express');
const { getAllAlumni, graduateStudent } = require('../controllers/alumniController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getAllAlumni);

router.route('/graduate')
  .post(protect, authorize('admin'), graduateStudent);

module.exports = router;
