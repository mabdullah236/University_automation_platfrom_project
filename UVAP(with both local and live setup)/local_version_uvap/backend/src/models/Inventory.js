const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Electronics', 'Furniture', 'Stationery', 'Lab Equipment', 'Other'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  condition: {
    type: String,
    enum: ['New', 'Good', 'Damaged', 'Repairable'],
    default: 'New',
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
