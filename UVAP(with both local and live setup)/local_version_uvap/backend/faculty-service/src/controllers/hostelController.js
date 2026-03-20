const Hostel = require('../models/Hostel');

// @desc    Get all hostels
// @route   GET /api/v1/hostels
// @access  Private/Admin
exports.getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find();
    res.status(200).json({ success: true, count: hostels.length, data: hostels });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new hostel
// @route   POST /api/v1/hostels
// @access  Private/Admin
exports.createHostel = async (req, res) => {
  try {
    const hostel = await Hostel.create(req.body);
    res.status(201).json({ success: true, data: hostel });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update hostel
// @route   PUT /api/v1/hostels/:id
// @access  Private/Admin
exports.updateHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    res.status(200).json({ success: true, data: hostel });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete hostel
// @route   DELETE /api/v1/hostels/:id
// @access  Private/Admin
exports.deleteHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndDelete(req.params.id);

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
