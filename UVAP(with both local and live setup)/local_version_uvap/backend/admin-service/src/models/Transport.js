const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
  },
  driverName: {
    type: String,
    required: true,
  },
  routeName: {
    type: String,
    required: true,
  },
  routeNumber: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  stops: [{
    name: String,
    time: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Transport', transportSchema);
