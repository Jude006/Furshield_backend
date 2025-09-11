const mongoose = require('mongoose');

const InsuranceSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.ObjectId,
    ref: 'Pet',
    required: true
  },
  provider: {
    type: String,
    required: [true, 'Please provide insurance provider name'],
    trim: true
  },
  policyNumber: {
    type: String,
    required: [true, 'Please provide policy number'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please provide expiry date']
  },
  coverage: {
    type: String,
    required: [true, 'Please describe coverage details'],
    trim: true
  },
  premium: {
    type: Number,
    required: [true, 'Please provide premium amount']
  },
  deductible: {
    type: Number,
    required: [true, 'Please provide deductible amount']
  },
  claims: [{
    claimNumber: String,
    date: Date,
    amount: Number,
    status: {
      type: String,
      enum: ['submitted', 'approved', 'rejected', 'paid'],
      default: 'submitted'
    },
    description: String,
    documents: [String] // URLs to claim documents
  }],
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Insurance', InsuranceSchema);