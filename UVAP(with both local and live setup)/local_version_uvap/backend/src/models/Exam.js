const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  type: {
    type: String,
    enum: ['Midterm', 'Final', 'Quiz'],
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
