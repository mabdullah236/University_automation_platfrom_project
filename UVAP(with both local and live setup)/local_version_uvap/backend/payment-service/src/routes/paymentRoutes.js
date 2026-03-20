const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { generateChallan, paymentWebhook, createPaymentIntent } = require('../controllers/paymentController');

const router = express.Router();

router.post('/generate-challan', protect, authorize('admin'), generateChallan);
router.post('/create-payment-intent', protect, authorize('student'), createPaymentIntent);
router.post('/webhook', paymentWebhook);

module.exports = router;
