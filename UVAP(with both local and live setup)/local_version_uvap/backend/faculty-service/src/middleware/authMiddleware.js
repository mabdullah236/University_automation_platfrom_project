const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }

    // Auto-Logout Logic: Check Status
    if (req.user.role === 'faculty') {
      const FacultyProfile = require('../models/FacultyProfile');
      const profile = await FacultyProfile.findOne({ user: req.user._id });
      if (profile && profile.status === 'Inactive') {
        return res.status(401).json({ success: false, error: 'Session expired. Account is inactive.' });
      }
    }

    if (req.user.role === 'student') {
      const StudentProfile = require('../models/StudentProfile');
      const profile = await StudentProfile.findOne({ user: req.user._id });
      if (profile && profile.studentStatus === 'Archived') {
        return res.status(401).json({ success: false, error: 'Session expired. Account is archived.' });
      }
    }

    if (req.user.role === 'admin') {
      const AdminProfile = require('../models/AdminProfile');
      const profile = await AdminProfile.findOne({ user: req.user._id });
      if (profile && profile.status !== 'Active') {
        return res.status(401).json({ success: false, error: 'Session expired. Account is inactive.' });
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
