const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },
  graduationYear: {
    type: Number,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  cgpa: {
    type: Number,
    required: true,
  },
  currentJob: {
    type: String,
    default: 'Not specified',
  },
  linkedinProfile: {
    type: String,
    default: '',
  },
  email: {
    type: String,
  },
  graduatedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Alumni', alumniSchema);
