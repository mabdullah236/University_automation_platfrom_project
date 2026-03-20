const express = require('express');
const { getForecast } = require('../controllers/planningController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/forecast', protect, authorize('admin'), getForecast);

module.exports = router;
