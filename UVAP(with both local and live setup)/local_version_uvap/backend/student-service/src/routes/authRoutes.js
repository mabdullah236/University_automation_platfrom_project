const express = require('express');
const { register, login, getMe, verifyAdminPassword, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/verify-password', protect, verifyAdminPassword);
router.put('/change-password', protect, changePassword);

module.exports = router;
