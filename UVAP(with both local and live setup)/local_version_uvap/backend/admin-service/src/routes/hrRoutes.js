const express = require('express');
const { processPayroll, getPayroll } = require('../controllers/hrController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.post('/payroll/process', processPayroll);
router.get('/payroll', getPayroll);

module.exports = router;
