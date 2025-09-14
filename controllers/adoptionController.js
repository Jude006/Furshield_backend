const asyncHandler = require('express-async-handler');
const AdoptionInterest = require('../models/Adoption');
const ShelterPet = require('../models/PetsSchema');

const submitInterest = asyncHandler(async (req, res) => {
  const { petId, query } = req.body;

  const pet = await ShelterPet.findById(petId);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  const interest = await AdoptionInterest.create({
    petId,
    adopterId: req.user._id,
    query,
  });

  res.status(201).json({ success: true, data: interest });
});

module.exports = { submitInterest };