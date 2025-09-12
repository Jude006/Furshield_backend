const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  vet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  slots: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Availability', AvailabilitySchema);