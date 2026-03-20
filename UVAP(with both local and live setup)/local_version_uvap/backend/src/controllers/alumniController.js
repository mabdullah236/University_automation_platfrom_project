const Alumni = require('../models/Alumni');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const Result = require('../models/Result');

// @desc    Get all alumni
// @route   GET /api/v1/alumni
// @access  Public
exports.getAllAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.find().sort({ graduationYear: -1 });
    res.status(200).json({ success: true, count: alumni.length, data: alumni });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Graduate a student (Move to Alumni)
// @route   POST /api/v1/alumni/graduate
// @access  Private (Admin)
exports.graduateStudent = async (req, res) => {
  const { rollNumber, cgpa } = req.body;

  if (!rollNumber) {
    return res.status(400).json({ success: false, message: 'Please provide a Roll Number' });
  }

  try {
    // 1. Find Student Profile
    const studentProfile = await StudentProfile.findOne({ studentId: rollNumber }).populate('user');

    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student not found with this Roll Number' });
    }

    const user = studentProfile.user;

    if (!user) {
      // Orphaned profile?
      await studentProfile.remove();
      return res.status(404).json({ success: false, message: 'User account associated with student not found' });
    }

    // 2. Create Alumni Record
    const alumniData = {
      name: user.name,
      rollNumber: studentProfile.studentId,
      graduationYear: new Date().getFullYear(),
      degree: studentProfile.program,
      cgpa: cgpa || 0.0, // Default to 0 if not provided
      email: user.email,
      currentJob: 'Fresh Graduate',
      linkedinProfile: ''
    };

    await Alumni.create(alumniData);

    // 3. Delete Student Data
    // Delete Profile
    await StudentProfile.findByIdAndDelete(studentProfile._id);
    
    // Delete User Account (as per requirement "Deletes from Student user list")
    await User.findByIdAndDelete(user._id);

    // Optional: Delete Results? Keeping them might be good for records but they are linked to User ID which is gone.
    // So we should probably delete them or they become orphaned. 
    // For now, I'll leave them as the requirement didn't specify cleaning up other relations.

    res.status(200).json({ success: true, message: `Student ${user.name} (${rollNumber}) has been graduated successfully.` });

  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
       return res.status(400).json({ success: false, message: 'Alumni record already exists for this Roll Number' });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
