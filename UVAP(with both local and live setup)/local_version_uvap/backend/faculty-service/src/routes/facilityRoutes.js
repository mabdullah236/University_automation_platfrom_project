const express = require('express');
const { getHostels, createHostel, getTransportRoutes, createTransportRoute } = require('../controllers/facilityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/hostels')
  .get(getHostels)
  .post(protect, authorize('admin'), createHostel);

router.route('/transport')
  .get(getTransportRoutes)
  .post(protect, authorize('admin'), createTransportRoute);

module.exports = router;
