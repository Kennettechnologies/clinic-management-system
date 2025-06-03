const mongoose = require('mongoose');

const LabTestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testName: {
    type: String,
    required: true
  },
  lab: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['ordered', 'in_progress', 'completed', 'cancelled'],
    default: 'ordered'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  resultDate: {
    type: Date
  },
  results: {
    type: String
  },
  notes: {
    type: String
  },
  attachments: [{
    type: String // URLs to result files
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LabTest', LabTestSchema); 