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
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
