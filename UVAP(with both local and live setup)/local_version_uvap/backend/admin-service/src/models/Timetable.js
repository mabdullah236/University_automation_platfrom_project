const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  allocationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseAllocation',
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  program: {
    type: String,
  },
  batch: {
    type: String,
  },
}, { timestamps: true });

// Compound index for efficient conflict checks
timetableSchema.index({ day: 1, startTime: 1, roomNumber: 1 }, { unique: true }); // Room conflict
timetableSchema.index({ day: 1, startTime: 1, teacher: 1 }, { unique: true }); // Teacher conflict
timetableSchema.index({ day: 1, startTime: 1, section: 1, semester: 1, program: 1 }, { unique: true }); // Section conflict

module.exports = mongoose.model('Timetable', timetableSchema);
