const mongoose = require('mongoose');

const courseAllocationSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  section: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  program: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one teacher per course per section (optional, but good for integrity)
courseAllocationSchema.index({ course: 1, section: 1, batch: 1 }, { unique: true });

module.exports = mongoose.model('CourseAllocation', courseAllocationSchema);
