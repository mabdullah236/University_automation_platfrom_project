const FeeVoucher = require('../models/FeeVoucher');
const StudentProfile = require('../models/StudentProfile');

// @desc    Generate Fee Challan
// @route   POST /api/v1/payments/generate-challan
// @access  Private (Admin/System)
exports.generateChallan = async (req, res) => {
  try {
    const { studentId, amount, dueDate, type, description } = req.body;

    // Validate Student
    const student = await StudentProfile.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const challanNo = `CH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const voucher = await FeeVoucher.create({
      student: student._id,
      challanNo,
      amount,
      dueDate,
      type: type || 'Tuition Fee',
      description,
      status: 'Unpaid'
    });

    res.status(201).json({ success: true, data: voucher });
  } catch (error) {
    console.error('Generate Challan Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create Stripe Payment Intent
// @route   POST /api/v1/payments/create-payment-intent
// @access  Private (Student)
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'pkr' } = req.body;

    // Mock Stripe for now if no key
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_mock') {
         return res.status(200).json({
            success: true,
            clientSecret: 'mock_client_secret_' + Date.now(),
            mock: true
         });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount in cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Payment Webhook (Mock)
// @route   POST /api/v1/payments/webhook
// @access  Public (Stripe/Payment Gateway)
exports.paymentWebhook = async (req, res) => {
  try {
    const { challanNo, status, transactionId } = req.body;

    if (!challanNo || !status) {
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }

    const voucher = await FeeVoucher.findOne({ challanNo });
    if (!voucher) {
      return res.status(404).json({ success: false, error: 'Voucher not found' });
    }

    voucher.status = status === 'success' ? 'Paid' : 'Failed';
    if (transactionId) voucher.transactionId = transactionId;
    if (status === 'success') voucher.paidDate = Date.now();

    await voucher.save();

    res.status(200).json({ success: true, message: 'Payment status updated' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
