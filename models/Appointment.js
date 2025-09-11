const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.ObjectId,
    ref: 'Pet',
    required: true
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  veterinarian: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add appointment date']
  },
  time: {
    type: String,
    required: [true, 'Please add appointment time']
  },
  reason: {
    type: String,
    required: [true, 'Please specify reason for appointment'],
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    trim: true
  },
  symptoms: [String],
  diagnosis: String,
  treatment: String,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
AppointmentSchema.index({ owner: 1, date: 1 });
AppointmentSchema.index({ veterinarian: 1, date: 1 });
AppointmentSchema.index({ pet: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);