const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  veterinarian: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add availability date']
  },
  timeSlots: [{
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'booked'],
      default: 'available'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

AvailabilitySchema.index({ veterinarian: 1, date: 1 });

module.exports = mongoose.model('Availability', AvailabilitySchema);