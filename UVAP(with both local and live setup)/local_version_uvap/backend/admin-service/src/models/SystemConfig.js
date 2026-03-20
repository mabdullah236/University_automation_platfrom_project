const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  currentSemester: {
    type: String,
    default: 'Fall 2025',
  },
  admissionsOpen: {
    type: Boolean,
    default: true,
  },
  universityName: {
    type: String,
    default: 'UVAP University',
  },
  activeSession: {
    type: String,
    enum: ['Fall', 'Spring'],
    default: 'Fall',
  },
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
