const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Please add a room number'],
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please add capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  type: {
    type: String,
    enum: ['Seminar Hall', 'Lab', 'Room', 'Library'],
    default: 'Seminar Hall'
  },
  block: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
