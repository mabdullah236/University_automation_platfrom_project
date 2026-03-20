const express = require('express');
const { getForecast } = require('../controllers/planningController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/forecast', getForecast);

module.exports = router;
