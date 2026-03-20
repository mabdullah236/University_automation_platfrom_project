const Event = require('../models/Event');

// @desc    Create a new event
// @route   POST /api/v1/events
// @access  Private (Admin)
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, time, venue, organizer } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      time,
      venue,
      organizer,
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get upcoming events
// @route   GET /api/v1/events
// @access  Private (All Users)
exports.getUpcomingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } })
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    next(err);
  }
};
