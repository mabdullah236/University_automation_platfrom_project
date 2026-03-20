const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, rollNumber } = req.body;

    // Create user
    const user = await User.create({
      name,
      uniEmail: email, // Map request email to uniEmail
      password,
      role,
      phone,
      rollNumber,
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ uniEmail: email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if Faculty is Inactive
    if (user.role === 'faculty') {
      const FacultyProfile = require('../models/FacultyProfile');
      const profile = await FacultyProfile.findOne({ user: user._id });
      if (profile && profile.status === 'Inactive') {
        return res.status(403).json({ success: false, error: 'Your account has been deactivated. Contact Admin.' });
      }
    }

    // Check if Student is Archived
    if (user.role === 'student') {
      const StudentProfile = require('../models/StudentProfile');
      const profile = await StudentProfile.findOne({ user: user._id });
      if (profile && profile.studentStatus === 'Archived') {
        return res.status(403).json({ success: false, error: 'Your account is archived. Contact Admin.' });
      }
    }

    // Check if Admin is Inactive
    if (user.role === 'admin') {
      const AdminProfile = require('../models/AdminProfile');
      const profile = await AdminProfile.findOne({ user: user._id });
      if (profile && profile.status !== 'Active') {
        return res.status(403).json({ success: false, error: 'Your account is inactive. Contact Super Admin.' });
      }
    }

    // Check Lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({ 
        success: false, 
        error: 'Account is locked due to multiple failed attempts.',
        lockUntil: user.lockUntil 
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;
      
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 24 * 60 * 60 * 1000; // Lock for 24 hours
        user.loginAttempts = 0; // Reset attempts after locking
        await user.save();
        return res.status(403).json({ 
          success: false, 
          error: 'Account is locked due to multiple failed attempts.',
          lockUntil: user.lockUntil 
        });
      }

      await user.save();
      const remaining = 5 - user.loginAttempts;
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Email or Password',
        attemptsRemaining: remaining
      });
    }

    // Reset login attempts on success
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    let profile = null;
    if (user.role === 'student') {
      const StudentProfile = require('../models/StudentProfile');
      profile = await StudentProfile.findOne({ user: req.user.id });
    } else if (user.role === 'faculty') {
      const FacultyProfile = require('../models/FacultyProfile');
      profile = await FacultyProfile.findOne({ user: req.user.id });
    } else if (user.role === 'admin') {
      const AdminProfile = require('../models/AdminProfile');
      profile = await AdminProfile.findOne({ user: req.user.id });
    }

    res.status(200).json({
      success: true,
      data: user,
      profile: profile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change Password (Force on First Login)
// @route   PUT /api/v1/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    // Check Lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({ 
        success: false, 
        error: 'Account is locked due to multiple failed attempts.',
        lockUntil: user.lockUntil 
      });
    }

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      // Increment login attempts
      user.loginAttempts += 1;
      
      if (user.loginAttempts >= 4) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
        user.loginAttempts = 0; // Reset attempts after locking
        await user.save();
        return res.status(403).json({ 
          success: false, 
          error: 'Account is locked due to multiple failed attempts.',
          lockUntil: user.lockUntil 
        });
      }

      await user.save();
      const remaining = 4 - user.loginAttempts;
      return res.status(400).json({ 
        success: false, 
        error: 'Incorrect password. Logging out for security.',
        attemptsRemaining: remaining
      });
    }

    // Reset login attempts on success
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    // Update password
    user.password = newPassword;
    user.isFirstLogin = false; // Disable first login flag
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.uniEmail, // Send back as email for frontend compatibility
      role: user.role,
      isFirstLogin: user.isFirstLogin // Send flag to frontend
    },
  });
};
// @desc    Verify admin password for sensitive actions
// @route   POST /api/v1/auth/verify-password
// @access  Private (Admin)
exports.verifyAdminPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    console.log('Verify Password Request:', { body: req.body, userId: req.user?.id });
    
    if (!password) {
      return res.status(400).json({ success: false, error: 'Please provide a password' });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect password' });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
