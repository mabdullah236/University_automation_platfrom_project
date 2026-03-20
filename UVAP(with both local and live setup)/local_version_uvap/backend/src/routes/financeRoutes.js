const express = require('express');
const {
  generateVouchers,
  getAllVouchers,
  getMyVouchers,
  markPaid
} = require('../controllers/financeController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/generate', authorize('admin'), generateVouchers);
router.get('/', authorize('admin'), getAllVouchers);
router.get('/my', authorize('student'), getMyVouchers);
router.put('/:id/pay', authorize('admin'), markPaid);

module.exports = router;
