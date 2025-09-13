const mongoose = require('mongoose');

const HealthRecordSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.ObjectId,
    ref: 'Pet',
    required: true
  },
  appointment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Appointment',
    required: true
  },
  veterinarian: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: [String],
  diagnosis: String,
  treatment: String,
  notes: String,
  labResults: String,
  prescriptions: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

HealthRecordSchema.index({ pet: 1, appointment: 1 });

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);