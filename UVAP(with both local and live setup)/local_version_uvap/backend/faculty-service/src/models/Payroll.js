const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  salaryAmount: {
    type: Number,
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending',
  },
  paymentDate: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
