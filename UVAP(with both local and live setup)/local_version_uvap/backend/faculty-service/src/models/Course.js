const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  program: {
    type: String,
    required: true, // e.g., 'BSCS', 'BBA'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure unique course code per program
// Compound index to ensure unique course code per department and program
// Partial Index: Ensure unique code per Dept/Program ONLY IF code exists
courseSchema.index(
  { code: 1, department: 1, program: 1 },
  { unique: true, partialFilterExpression: { code: { $exists: true, $type: "string" } } }
);

module.exports = mongoose.model('Course', courseSchema);
