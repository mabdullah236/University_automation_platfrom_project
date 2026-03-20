const FacultyProfile = require('../models/FacultyProfile');
const User = require('../models/User');
const CourseAllocation = require('../models/CourseAllocation');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService');

// @desc    Create or update faculty profile
// @route   POST /api/v1/faculty/profile
// @access  Private (Faculty/Admin)
exports.updateProfile = async (req, res, next) => {
  try {
    const { department, designation, specialization, qualifications } = req.body;
    
    // If admin is updating, they must provide user ID, else use logged in user
    let userId = req.user.id;
    if (req.user.role === 'admin' && req.body.userId) {
      userId = req.body.userId;
    }

    let profile = await FacultyProfile.findOne({ user: userId });

    if (profile) {
      // Update
      profile = await FacultyProfile.findOneAndUpdate(
        { user: userId },
        { department, designation, specialization, qualifications },
        { new: true }
      );
    } else {
      // Create
      profile = await FacultyProfile.create({
        user: userId,
        department,
        designation,
        specialization,
        qualifications
      });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all faculty profiles (with Search)
// @route   GET /api/v1/faculty
// @access  Public
exports.getAllFaculty = async (req, res, next) => {
  try {
    const keyword = req.query.keyword ? {
      $or: [
        { name: { $regex: req.query.keyword, $options: 'i' } },
        { uniEmail: { $regex: req.query.keyword, $options: 'i' } }
      ]
    } : {};

    let query = {};

    // If keyword exists, first find matching users
    if (req.query.keyword) {
      const users = await User.find({ ...keyword, role: 'faculty' }).select('_id');
      const userIds = users.map(u => u._id);
      
      // Find profiles belonging to these users OR matching department
      query = {
        $or: [
          { user: { $in: userIds } },
          { department: { $regex: req.query.keyword, $options: 'i' } }
        ]
      };
    }

    const faculty = await FacultyProfile.find(query).populate('user', 'name uniEmail personalEmail phone');
    res.status(200).json({ success: true, count: faculty.length, data: faculty });
  } catch (err) {
    next(err);
  }
};

// @desc    Update faculty profile (Admin)
// @route   PUT /api/v1/faculty/:id
// @access  Private (Admin)
exports.updateFaculty = async (req, res, next) => {
  try {
    const { name, email, phone, department, designation, salary, qualification, joiningDate, cnic, address, gender, dob, specialization, experience } = req.body;
    
    let profile = await FacultyProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    // Update User details
    const user = await User.findById(profile.user);
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      await user.save();
    }

    // Update Profile details
    profile.department = department || profile.department;
    profile.designation = designation || profile.designation;
    profile.salary = salary || profile.salary;
    if (qualification) {
        profile.qualifications = [{ degree: qualification }];
    }
    profile.joiningDate = joiningDate || profile.joiningDate;
    profile.cnic = cnic || profile.cnic;
    profile.address = address || profile.address;
    profile.gender = gender || profile.gender;
    profile.dob = dob || profile.dob;
    profile.specialization = specialization || profile.specialization;
    profile.experience = experience || profile.experience;
    
    await profile.save();

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete faculty (User + Profile)
// @route   DELETE /api/v1/faculty/:id
// @access  Private (Admin)
exports.deleteFaculty = async (req, res, next) => {
  try {
    const profile = await FacultyProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    // Delete User
    await User.findByIdAndDelete(profile.user);
    
    // Delete Profile
    await profile.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current faculty profile
// @route   GET /api/v1/faculty/me
// @access  Private (Faculty)
exports.getFacultyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const profile = await FacultyProfile.findOne({ user: req.user.id });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Merge data
    const data = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: profile ? profile.department : 'Not Assigned',
      designation: profile ? profile.designation : 'Not Assigned',
      salary: profile ? profile.salary : 0,
      specialization: profile ? profile.specialization : '',
      joiningDate: profile ? profile.joiningDate : user.createdAt,
      qualifications: profile ? profile.qualifications : [],
      employeeId: profile ? profile.employeeId : 'N/A',
    };

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// @desc    Update faculty settings (Phone, Password)
// @route   PUT /api/v1/faculty/me/settings
// @access  Private (Faculty)
exports.updateFacultySettings = async (req, res, next) => {
  try {
    const { phone, password, oldPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (phone) user.phone = phone;

    if (password && oldPassword) {
      const isMatch = await user.matchPassword(oldPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect old password' });
      }
      user.password = password;
    }

    await user.save();

    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Helper to generate unique institutional email
const generateUniqueEmail = async (name) => {
  const parts = name.trim().split(/\s+/);
  const lastName = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : parts[0].toLowerCase();
  const firstInitial = parts[0][0].toLowerCase();
  
  const baseEmail = `${firstInitial}.${lastName}@uvap.com`;
  let email = baseEmail;
  let counter = 1;

  while (await User.findOne({ uniEmail: email })) {
    email = `${firstInitial}.${lastName}${counter}@uvap.com`;
    counter++;
  }
  return email;
};

// @desc    Create new faculty (User + Profile)
// @route   POST /api/v1/faculty
// @access  Private (Admin)
exports.createFaculty = async (req, res, next) => {
  try {
    const { name, email: personalEmail, phone, department, designation, salary, qualification, joiningDate, cnic, address, gender, dob, specialization, experience } = req.body;

    // 0. Validate Required Fields
    if (!phone) return res.status(400).json({ field: 'phone', message: 'Phone number is required' });
    if (!salary) return res.status(400).json({ field: 'salary', message: 'Salary is required' });
    if (!cnic) return res.status(400).json({ field: 'cnic', message: 'CNIC is required' });
    if (!department) return res.status(400).json({ field: 'department', message: 'Department is required' });
    if (!designation) return res.status(400).json({ field: 'designation', message: 'Designation is required' });
    if (!qualification) return res.status(400).json({ field: 'qualification', message: 'Qualification is required' });

    // 1. Pre-Check Validation (CNIC & Phone)
    // Check User Collection (Phone & Email)
    const existingUser = await User.findOne({ 
      $or: [{ phone }, { personalEmail }] 
    });

    if (existingUser) {
      let field = existingUser.phone === phone ? 'Phone Number' : 'Personal Email';
      let role = existingUser.role.charAt(0).toUpperCase() + existingUser.role.slice(1);
      return res.status(400).json({ field: field.toLowerCase().includes('phone') ? 'phone' : 'email', message: `This ${field} is already registered by a ${role}.` });
    }

    // Check Profiles for CNIC
    const existingStudentProfile = await require('../models/StudentProfile').findOne({ cnic });
    if (existingStudentProfile) {
      return res.status(400).json({ field: 'cnic', message: 'This CNIC is already registered by a Student.' });
    }

    const existingFacultyProfile = await FacultyProfile.findOne({ cnic });
    if (existingFacultyProfile) {
      return res.status(400).json({ field: 'cnic', message: 'This CNIC is already registered by a Faculty Member.' });
    }

    // 2. Generate Institutional Email
    const institutionalEmail = await generateUniqueEmail(name);
    
    // 3. Create User
    const generatedPassword = crypto.randomBytes(4).toString('hex'); // 8 chars
    
    const user = await User.create({
      name,
      uniEmail: institutionalEmail, // Login ID
      personalEmail, // Notification Email
      password: generatedPassword,
      role: 'faculty',
      phone,
      isVerified: true,
      isFirstLogin: true
    });

    // 4. Create Profile
    const profile = await FacultyProfile.create({
      user: user._id,
      department,
      designation,
      salary,
      qualifications: [{ degree: qualification }], // Map string to object
      joiningDate: joiningDate || Date.now(),
      employeeId: `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
      cnic,
      address,
      gender,
      dob,
      specialization,
      experience
    });

    // 5. Send Email to PERSONAL Email
    try {
      const message = `
        <p>Welcome to UVAP Faculty! Your account has been created.</p>
        <p><strong>Your Login Credentials:</strong></p>
        <p>Login ID: <strong>${institutionalEmail}</strong></p>
        <p>Password: <strong>${generatedPassword}</strong></p>
        <p>Please login and change your password immediately.</p>
        <p><a href="http://localhost:5173/login" style="background-color: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Dashboard</a></p>
      `;

      await sendEmail({
        email: personalEmail, // Send to personal email
        subject: 'Welcome to UVAP Faculty - Your Login Credentials',
        message: message,
        name: name // Pass name for greeting
      });

      res.status(201).json({ success: true, data: { user, profile } });
    } catch (emailError) {
      console.error("EMAIL FAILED:", emailError);
      
      // Rollback
      await User.findByIdAndDelete(user._id);
      await FacultyProfile.findOneAndDelete({ user: user._id });

      return res.status(500).json({ 
        success: false, 
        message: "User creation rolled back: Failed to send email. Check SMTP settings." 
      });
    }
  } catch (err) {
    next(err);
  }
};
// @desc    Get courses for logged-in faculty
// @route   GET /api/v1/faculty/my-courses
// @access  Private (Faculty)
exports.getMyCourses = async (req, res, next) => {
  try {
    const allocations = await CourseAllocation.find({ teacher: req.user.id })
      .populate('course', 'title code credits')
      .sort({ semester: 1, section: 1 });

    res.status(200).json({ success: true, count: allocations.length, data: allocations });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle Faculty Status (Active/Inactive)
// @route   PUT /api/v1/faculty/:id/status
// @access  Private (Admin)
exports.toggleFacultyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Use Active or Inactive.' });
    }

    const profile = await FacultyProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    profile.status = status;
    await profile.save();

    res.status(200).json({ success: true, data: profile, message: `Faculty marked as ${status}` });
  } catch (err) {
    next(err);
  }
};
