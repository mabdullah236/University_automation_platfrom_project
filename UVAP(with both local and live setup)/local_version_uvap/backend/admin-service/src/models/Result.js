const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  marksObtained: {
    type: Number,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F'],
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Prevent duplicate results for same student and course
resultSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
