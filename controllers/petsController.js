const Pet = require('../models/Pets');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all pets for logged in user
// @route   GET /api/v1/pets
// @access  Private
exports.getPets = asyncHandler(async (req, res, next) => {
  const pets = await Pet.find({ owner: req.user.id }).populate('owner', 'firstName lastName email');

  res.status(200).json({
    success: true,
    count: pets.length,
    data: pets
  });
});

// @desc    Get single pet
// @route   GET /api/v1/pets/:id
// @access  Private
exports.getPet = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id).populate('owner', 'firstName lastName email');

  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the pet
  if (pet.owner._id.toString() !== req.user.id && req.user.userType !== 'veterinarian') {
    return next(new ErrorResponse(`Not authorized to access this pet`, 401));
  }

  res.status(200).json({
    success: true,
    data: pet
  });
});

// @desc    Create new pet
// @route   POST /api/v1/pets
// @access  Private
exports.createPet = asyncHandler(async (req, res, next) => {
  // Add owner to req.body
  req.body.owner = req.user.id;

  const pet = await Pet.create(req.body);

  res.status(201).json({
    success: true,
    data: pet
  });
});

// @desc    Update pet
// @route   PUT /api/v1/pets/:id
// @access  Private
exports.updatePet = asyncHandler(async (req, res, next) => {
  let pet = await Pet.findById(req.params.id);

  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the pet
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to update this pet`, 401));
  }

  pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: pet
  });
});

// @desc    Delete pet
// @route   DELETE /api/v1/pets/:id
// @access  Private
exports.deletePet = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the pet
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete this pet`, 401));
  }

  await Pet.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload pet image
// @route   POST /api/v1/pets/:id/upload-image
// @access  Private
exports.uploadPetImage = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the pet
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to upload image for this pet`, 401));
  }

  // Here you would typically handle file upload using multer or similar
  // For now, we'll assume the image URL is passed in the request body
  const { imageUrl, caption } = req.body;

  pet.images.push({
    url: imageUrl,
    caption: caption || ''
  });

  await pet.save();

  res.status(200).json({
    success: true,
    data: pet
  });
});

// @desc    Add medical record
// @route   POST /api/v1/pets/:id/medical-records
// @access  Private
exports.addMedicalRecord = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the pet or is a veterinarian
  if (pet.owner.toString() !== req.user.id && req.user.userType !== 'veterinarian') {
    return next(new ErrorResponse(`Not authorized to add medical record for this pet`, 401));
  }

  pet.medicalHistory.push(req.body);
  await pet.save();

  res.status(200).json({
    success: true,
    data: pet
  });
});

// @desc    Add vaccination
// @route   POST /api/v1/pets/:id/vaccinations
// @access  Private
exports.addVaccination = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the pet or is a veterinarian
  if (pet.owner.toString() !== req.user.id && req.user.userType !== 'veterinarian') {
    return next(new ErrorResponse(`Not authorized to add vaccination for this pet`, 401));
  }

  pet.vaccinations.push(req.body);
  await pet.save();

  res.status(200).json({
    success: true,
    data: pet
  });
});

// @desc    Add allergy
// @route   POST /api/v1/pets/:id/allergies
// @access  Private
exports.addAllergy = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the pet or is a veterinarian
  if (pet.owner.toString() !== req.user.id && req.user.userType !== 'veterinarian') {
    return next(new ErrorResponse(`Not authorized to add allergy for this pet`, 401));
  }

  pet.allergies.push(req.body);
  await pet.save();

  res.status(200).json({
    success: true,
    data: pet
  });
});

// @desc    Add medication
// @route   POST /api/v1/pets/:id/medications
// @access  Private
exports.addMedication = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the pet or is a veterinarian
  if (pet.owner.toString() !== req.user.id && req.user.userType !== 'veterinarian') {
    return next(new ErrorResponse(`Not authorized to add medication for this pet`, 401));
  }

  pet.medications.push(req.body);
  await pet.save();

  res.status(200).json({
    success: true,
    data: pet
  });
});

// @desc    Get pet timeline (combined medical history, vaccinations, appointments)
// @route   GET /api/v1/pets/:id/timeline
// @access  Private
exports.getPetTimeline = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the pet
  if (pet.owner.toString() !== req.user.id && req.user.userType !== 'veterinarian') {
    return next(new ErrorResponse(`Not authorized to access this pet's timeline`, 401));
  }

  // Get appointments for this pet
  const Appointment = require('../models/Appointment');
  const appointments = await Appointment.find({ pet: req.params.id })
    .populate('veterinarian', 'firstName lastName specialization')
    .sort({ date: -1 });

  // Combine all timeline events
  const timeline = [
    ...pet.medicalHistory.map(record => ({
      type: 'medical',
      date: record.date,
      title: record.condition,
      description: record.diagnosis,
      data: record
    })),
    ...pet.vaccinations.map(vaccine => ({
      type: 'vaccination',
      date: vaccine.date,
      title: `${vaccine.vaccine} Vaccine`,
      description: `Administered on ${vaccine.date.toLocaleDateString()}`,
      data: vaccine
    })),
    ...appointments.map(appt => ({
      type: 'appointment',
      date: appt.date,
      title: `Appointment with Dr. ${appt.veterinarian.lastName}`,
      description: appt.reason,
      data: appt
    }))
  ];

  // Sort timeline by date (newest first)
  timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.status(200).json({
    success: true,
    data: timeline
  });
});