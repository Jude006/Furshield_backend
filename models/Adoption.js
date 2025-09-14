const mongoose = require('mongoose');

const adoptionInterestSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShelterPet', required: true },
  adopterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  query: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'finalized'], default: 'pending' },
  response: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AdoptionInterest', adoptionInterestSchema);