const express = require('express');
const { getSettings, updateSettings, changePassword, getPublicSettings, getAdminProfile, updateAdminProfile } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/public', getPublicSettings);

router.route('/')
  .get(protect, authorize('admin'), getSettings)
  .put(protect, authorize('admin'), updateSettings);

router.route('/profile')
  .get(protect, authorize('admin'), getAdminProfile)
  .put(protect, authorize('admin'), updateAdminProfile);

router.put('/password', protect, changePassword);

module.exports = router;
