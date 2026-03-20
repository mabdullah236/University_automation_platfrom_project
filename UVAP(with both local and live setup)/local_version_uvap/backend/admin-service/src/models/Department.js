const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  programCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  shortName: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
