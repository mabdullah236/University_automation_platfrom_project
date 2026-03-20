const Payroll = require('../models/Payroll');
const User = require('../models/User');
const FacultyProfile = require('../models/FacultyProfile');

// @desc    Process payroll for all faculty
// @route   POST /api/v1/hr/payroll/process
// @access  Private (Admin)
exports.processPayroll = async (req, res, next) => {
  try {
    const facultyMembers = await User.find({ role: 'faculty' });
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const payrollRecords = [];

    for (const faculty of facultyMembers) {
      // Check if payroll already exists for this month
      const exists = await Payroll.findOne({ staff: faculty._id, month: currentMonth });
      
      if (!exists) {
        // Fetch salary from profile or default
        const profile = await FacultyProfile.findOne({ user: faculty._id });
        const salary = profile ? profile.salary : 100000; // Default salary if profile missing

        payrollRecords.push({
          staff: faculty._id,
          salaryAmount: salary,
          month: currentMonth,
          status: 'Paid', // Auto-pay for simplicity in this demo
          paymentDate: new Date()
        });
      }
    }

    if (payrollRecords.length > 0) {
      await Payroll.insertMany(payrollRecords);
    }

    res.status(201).json({
      success: true,
      message: `Processed payroll for ${payrollRecords.length} faculty members for ${currentMonth}`,
      count: payrollRecords.length
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all payroll records
// @route   GET /api/v1/hr/payroll
// @access  Private (Admin)
exports.getPayroll = async (req, res, next) => {
  try {
    const payrolls = await Payroll.find().populate('staff', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payrolls.length, data: payrolls });
  } catch (err) {
    next(err);
  }
};
