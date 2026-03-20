const mongoose = require('mongoose');

const facultyProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  cnic: {
    type: String,
    required: true,
    unique: true,
  },
  personalEmail: {
    type: String,
    sparse: true, // Allow null/unique
  },
  address: {
    type: String,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
  },
  dob: {
    type: Date,
  },
  department: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  specialization: {
    type: String,
  },
  experience: {
    type: Number, // In years
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
});

module.exports = mongoose.model('FacultyProfile', facultyProfileSchema);
