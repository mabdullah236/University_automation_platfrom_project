const User = require('../models/User');
const Course = require('../models/Course');
const Admission = require('../models/Admission');
// const Finance = require('../models/Finance'); // Assuming a Finance model exists or we mock it

// @desc    Get dashboard stats
// @route   GET /api/v1/stats/counts
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const studentCount = await User.countDocuments({ role: 'student' });
    const facultyCount = await User.countDocuments({ role: 'faculty' });
    const courseCount = await Course.countDocuments();
    const admissionCount = await Admission.countDocuments({ status: 'Pending' });
    
    // Calculate revenue dynamically: 20,000 per student (Example fee)
    // In a real system, this would sum up paid FeeVouchers
    const revenue = studentCount * 20000; 

    res.status(200).json({
      success: true,
      data: {
        students: studentCount,
        faculty: facultyCount,
        courses: courseCount,
        pendingAdmissions: admissionCount,
        revenue: revenue
      }
    });
  } catch (err) {
    next(err);
  }
};
