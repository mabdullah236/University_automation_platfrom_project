const Hostel = require('../models/Hostel');
const Transport = require('../models/Transport');

// @desc    Get all hostels
// @route   GET /api/v1/facilities/hostels
// @access  Public
exports.getHostels = async (req, res, next) => {
  try {
    const hostels = await Hostel.find();
    res.status(200).json({ success: true, count: hostels.length, data: hostels });
  } catch (err) {
    next(err);
  }
};

// @desc    Create hostel
// @route   POST /api/v1/facilities/hostels
// @access  Private (Admin)
exports.createHostel = async (req, res, next) => {
  try {
    const hostel = await Hostel.create(req.body);
    res.status(201).json({ success: true, data: hostel });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all transport routes
// @route   GET /api/v1/facilities/transport
// @access  Public
exports.getTransportRoutes = async (req, res, next) => {
  try {
    const routes = await Transport.find();
    res.status(200).json({ success: true, count: routes.length, data: routes });
  } catch (err) {
    next(err);
  }
};

// @desc    Create transport route
// @route   POST /api/v1/facilities/transport
// @access  Private (Admin)
exports.createTransportRoute = async (req, res, next) => {
  try {
    const route = await Transport.create(req.body);
    res.status(201).json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
};
