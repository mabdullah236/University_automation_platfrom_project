const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  // Personal Info
  fullName: { type: String, required: true },
  cnic: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date, required: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
  religion: { type: String, required: true },
  nationality: { type: String, default: 'Pakistani', required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },

  // Guardian Info
  guardianName: { type: String, required: true },
  guardianOccupation: { type: String, required: true },
  guardianIncome: { type: Number },
  guardianContact: { type: String, required: true },

  // Academic History
  matric: {
    marks: { type: Number, required: true },
    board: { type: String, required: true },
    year: { type: Number, required: true },
    school: { type: String }
  },
  inter: {
    marks: { type: Number, required: true },
    board: { type: String, required: true },
    year: { type: Number, required: true },
    college: { type: String }
  },

  // Program
  programApplied: { type: String, required: true },
  semester: { type: Number, default: 1 },
  shift: {
    type: String,
    enum: ['Morning', 'Evening'],
    default: 'Morning',
    required: true
  },

  // Documents (Paths to uploaded files)
  documents: {
    cnicFront: { type: String, required: true },
    cnicBack: { type: String, required: true },
    matricTranscript: { type: String, required: true },
    interTranscript: { type: String, required: true }
  },

  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Admission', admissionSchema);
