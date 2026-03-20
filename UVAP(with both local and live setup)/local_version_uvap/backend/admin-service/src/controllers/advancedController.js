const Alumni = require('../models/Alumni');
const Event = require('../models/Event');

// @desc    Get all alumni
// @route   GET /api/v1/advanced/alumni
// @access  Public
exports.getAlumni = async (req, res, next) => {
  try {
    const alumni = await Alumni.find();
    res.status(200).json({ success: true, count: alumni.length, data: alumni });
  } catch (err) {
    next(err);
  }
};

// @desc    Register alumni
// @route   POST /api/v1/advanced/alumni
// @access  Private (Admin)
exports.registerAlumni = async (req, res, next) => {
  try {
    const alumni = await Alumni.create(req.body);
    res.status(201).json({ success: true, data: alumni });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all events
// @route   GET /api/v1/advanced/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (err) {
    next(err);
  }
};

// @desc    Create event
// @route   POST /api/v1/advanced/events
// @access  Private (Admin/Faculty)
exports.createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};
