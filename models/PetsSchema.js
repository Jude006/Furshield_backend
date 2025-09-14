const mongoose = require('mongoose');

const shelterPetSchema = new mongoose.Schema({
  shelterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter', required: true },
  name: { type: String, required: true },
  species: { type: String, required: true, enum: ['dog', 'cat', 'other'] },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['male', 'female'] },
  description: { type: String, required: true },
  status: { type: String, default: 'available', enum: ['available', 'pending', 'adopted'] },
  location: { type: String, required: true },
  images: [{ type: String }],
  color: { type: String },
  weight: { type: Number },
  medicalHistory: { type: String },
  specialNeeds: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

shelterPetSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ShelterPet', shelterPetSchema);