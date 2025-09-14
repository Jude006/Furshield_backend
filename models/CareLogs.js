const mongoose = require('mongoose');

const careLogSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShelterPet', required: true },
  type: { type: String, required: true },
  details: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CareLog', careLogSchema);