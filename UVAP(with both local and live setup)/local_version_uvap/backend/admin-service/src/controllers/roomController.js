const Room = require('../models/Room');

// @desc    Add a new room
// @route   POST /api/v1/rooms
// @access  Private (Admin)
exports.addRoom = async (req, res, next) => {
  try {
    const { roomNumber, capacity, type, block } = req.body;

    // Check for duplicate roomNumber
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ success: false, error: 'Room number already exists' });
    }

    const room = await Room.create({
      roomNumber,
      capacity,
      type,
      block
    });

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all rooms
// @route   GET /api/v1/rooms
// @access  Private (Admin)
exports.getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ block: 1, roomNumber: 1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update room
// @route   PUT /api/v1/rooms/:id
// @access  Private (Admin)
exports.updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete room
// @route   DELETE /api/v1/rooms/:id
// @access  Private (Admin)
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    await room.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
