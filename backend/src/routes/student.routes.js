
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getDashboard } = require('../controllers/student.controller');

const router = express.Router();

router.use(protect, authorize('STUDENT'));

router.get('/dashboard', getDashboard);

module.exports = router;
