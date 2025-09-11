const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.ObjectId,
    ref: 'Pet',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide document name'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please specify document type'],
    enum: ['certificate', 'xray', 'lab_report', 'prescription', 'other']
  },
  description: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide file URL']
  },
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  tags: [String]
});

module.exports = mongoose.model('Document', DocumentSchema);