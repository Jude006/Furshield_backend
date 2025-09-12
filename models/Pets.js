const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a pet name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  species: {
    type: String,
    required: [true, 'Please specify species'],
    enum: ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other'],
  },
  breed: {
    type: String,
    required: [true, 'Please specify breed'],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, 'Please add age'],
    min: [0, 'Age cannot be negative'],
  },
  gender: {
    type: String,
    required: [true, 'Please specify gender'],
    enum: ['male', 'female'],
  },
  color: {
    type: String,
    trim: true,
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative'],
  },
  birthDate: {
    type: Date,
  },
  medicalHistory: [{
    condition: String,
    diagnosis: String,
    treatment: String,
    date: {
      type: Date,
      default: Date.now,
    },
    vet: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  }],
  vaccinations: [{
    vaccine: String,
    date: Date,
    nextDue: Date,
    administeredBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  }],
  allergies: [{
    allergen: String,
    reaction: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
    },
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  }],
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    coverage: String,
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PetSchema.index({ owner: 1, name: 1 });

module.exports = mongoose.model('Pet', PetSchema);