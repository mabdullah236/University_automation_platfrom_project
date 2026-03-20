const FeeVoucher = require('../models/FeeVoucher');
const User = require('../models/User');

// @desc    Generate monthly vouchers for all students
// @route   POST /api/v1/finance/generate
// @access  Private (Admin)
exports.generateVouchers = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' });
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 10); // Due in 10 days

    const vouchers = [];
    
    for (const student of students) {
      // Check if voucher already exists for this month
      const exists = await FeeVoucher.findOne({ student: student._id, month: currentMonth });
      if (!exists) {
        const challanNo = `CH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        vouchers.push({
          student: student._id,
          amount: 50000, // Default fee amount
          month: currentMonth,
          dueDate: dueDate,
          challanNo: challanNo,
          status: 'Unpaid'
        });
      }
    }

    if (vouchers.length > 0) {
      await FeeVoucher.insertMany(vouchers);
    }

    res.status(201).json({
      success: true,
      message: `Generated ${vouchers.length} vouchers for ${currentMonth}`,
      count: vouchers.length
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all vouchers (Admin)
// @route   GET /api/v1/finance
// @access  Private (Admin)
exports.getAllVouchers = async (req, res, next) => {
  try {
    const vouchers = await FeeVoucher.find().populate('student', 'name rollNumber email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: vouchers.length, data: vouchers });
  } catch (err) {
    next(err);
  }
};

// @desc    Get my vouchers (Student)
// @route   GET /api/v1/finance/my
// @access  Private (Student)
exports.getMyVouchers = async (req, res, next) => {
  try {
    const vouchers = await FeeVoucher.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: vouchers.length, data: vouchers });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark voucher as paid
// @route   PUT /api/v1/finance/:id/pay
// @access  Private (Admin)
exports.markPaid = async (req, res, next) => {
  try {
    const voucher = await FeeVoucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    voucher.status = 'Paid';
    await voucher.save();

    res.status(200).json({ success: true, data: voucher });
  } catch (err) {
    next(err);
  }
};
