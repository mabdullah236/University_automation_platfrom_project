const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
  },
  cnic: {
    type: String,
    required: true,
    unique: true,
  },
  program: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    default: 'A',
  },
  shift: {
    type: String,
    enum: ['Morning', 'Evening'],
    default: 'Morning',
  },
  currentSemester: {
    type: Number,
    required: true,
    default: 1,
  },
  dob: {
    type: Date,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  guardianName: {
    type: String,
    required: true,
  },
  guardianPhone: {
    type: String,
    required: true,
  },
  guardianOccupation: {
    type: String,
  },
  admissionDate: {
    type: Date,
    default: Date.now,
  },
  promotionStatus: {
    type: String,
    enum: ['Promoted', 'Probation', 'Detained'],
    default: 'Promoted',
  },
  studentStatus: {
    type: String,
    enum: ['Active', 'Archived', 'Alumni'],
    default: 'Active',
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  }],
  cgpa: {
    type: Number,
    default: 0.0,
  },
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
