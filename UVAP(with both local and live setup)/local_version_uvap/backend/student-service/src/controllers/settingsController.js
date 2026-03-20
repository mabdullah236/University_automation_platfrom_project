const SystemConfig = require('../models/SystemConfig');
const User = require('../models/User');

// @desc    Get system settings
// @route   GET /api/v1/settings
// @access  Public (or Private depending on need, let's make it Public for some parts like admissionsOpen, but full config Private)
// Actually, for admin panel it's private. For public site checking admissions, we might need a public endpoint.
// Let's make this one Private (Admin) and maybe a separate public one or allow public access to specific fields.
// For now, Private (Admin) as requested for the Settings page.
exports.getSettings = async (req, res) => {
  try {
    // Find the one and only config doc, or create if not exists
    let config = await SystemConfig.findOne();
    
    if (!config) {
      config = await SystemConfig.create({});
    }

    res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update system settings
// @route   PUT /api/v1/settings
// @access  Private (Admin)
exports.updateSettings = async (req, res) => {
  try {
    const { currentSemester, admissionsOpen, universityName } = req.body;

    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({});
    }

    config.currentSemester = currentSemester ?? config.currentSemester;
    config.admissionsOpen = admissionsOpen ?? config.admissionsOpen;
    config.universityName = universityName ?? config.universityName;

    await config.save();

    res.status(200).json({ success: true, data: config, message: 'Settings updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Change password
// @route   PUT /api/v1/settings/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Get user (with password)
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check old password
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect old password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get public config (for admission check)
// @route   GET /api/v1/settings/public
// @access  Public
exports.getPublicSettings = async (req, res) => {
    try {
      let config = await SystemConfig.findOne();
      if (!config) config = await SystemConfig.create({});
  
      res.status(200).json({ 
          success: true, 
          data: { 
              admissionsOpen: config.admissionsOpen,
              currentSemester: config.currentSemester,
              universityName: config.universityName
          } 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  };
// @desc    Get Admin Profile
// @route   GET /api/v1/settings/profile
// @access  Private (Admin)
exports.getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const AdminProfile = require('../models/AdminProfile');
    const profile = await AdminProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Admin profile not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.uniEmail,
        phone: profile.phone,
        cnic: profile.cnic,
        address: profile.address
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update Admin Profile
// @route   PUT /api/v1/settings/profile
// @access  Private (Admin)
exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, phone, cnic, address } = req.body;

    // Update User (Name)
    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    await user.save();

    // Update Profile
    const AdminProfile = require('../models/AdminProfile');
    let profile = await AdminProfile.findOne({ user: req.user.id });

    if (!profile) {
      // Should exist from seeder, but handle just in case
      profile = await AdminProfile.create({ user: req.user.id });
    }

    if (phone) profile.phone = phone;
    if (cnic) profile.cnic = cnic;
    if (address) profile.address = address;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        name: user.name,
        email: user.uniEmail,
        phone: profile.phone,
        cnic: profile.cnic,
        address: profile.address
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
