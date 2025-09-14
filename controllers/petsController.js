const Pet = require('../models/Pets');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const fs = require('fs');
const path = require('path');

const ensureUploadsDir = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};



exports.getPets = asyncHandler(async (req, res, next) => {
  let pets;
  if (req.user.userType === 'veterinarian') {
    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find({ 
      veterinarian: req.user.id,
      status: { $in: ['scheduled', 'confirmed', 'completed'] }
    }).distinct('pet');
    pets = await Pet.find({ _id: { $in: appointments } })
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 });
  } else {
    pets = await Pet.find({ owner: req.user.id })
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }
  
  console.log('Returning pets with images:', pets.map(pet => ({
    name: pet.name,
    imageCount: pet.images ? pet.images.length : 0,
    images: pet.images
  })));
  
  res.status(200).json({
    success: true,
    count: pets.length,
    data: pets
  });
});

exports.getPet = asyncHandler(async (req, res, next) => {
  console.log('=== PET ACCESS DEBUG ===');
  console.log('Pet ID:', req.params.id);
  console.log('User ID:', req.user.id);
  console.log('User Type:', req.user.userType);
  
  const pet = await Pet.findById(req.params.id)
    .populate('owner', 'firstName lastName email')
    .populate('medicalHistory.vet', 'firstName lastName')
    .populate('vaccinations.administeredBy', 'firstName lastName')
    .populate('medications.prescribedBy', 'firstName lastName');
  
  if (!pet) {
    console.log('Pet not found');
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }
  
  console.log('Pet Owner ID:', pet.owner._id.toString());
  console.log('Owner matches user:', pet.owner._id.toString() === req.user.id);
  console.log('Pet images:', pet.images);
  
  if (pet.owner._id.toString() !== req.user.id && req.user.userType !== 'veterinarian') {
    console.log('ACCESS DENIED');
    return next(new ErrorResponse(`Not authorized to access this pet`, 401));
  }
  
  console.log('ACCESS GRANTED');
  res.status(200).json({
    success: true,
    data: pet
  });
});

exports.createPet = asyncHandler(async (req, res, next) => {
  ensureUploadsDir();
  
  req.body.owner = req.user.id;
  
  console.log('Creating pet with files:', req.files);
  console.log('Request body:', req.body);
  
  if (req.files && req.files.images) {
    const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    req.body.images = images.map(file => ({
      url: `/uploads/${file.filename}`,
      caption: req.body.caption || '',
      uploadedAt: new Date()
    }));
    
    console.log('Processed images:', req.body.images);
  }
  
  if (req.body.medicalHistory) {
    try {
      let medicalHistoryData;
      
      if (typeof req.body.medicalHistory === 'string') {
        medicalHistoryData = JSON.parse(req.body.medicalHistory);
      } else {
        medicalHistoryData = req.body.medicalHistory;
      }
      
      req.body.medicalHistory = medicalHistoryData.filter(record =>
        record.condition || record.diagnosis || record.treatment || record.date
      );
    } catch (error) {
      console.error('Error parsing medical history:', error);
      req.body.medicalHistory = [];
    }
  }
  
  const pet = await Pet.create(req.body);
  
  const populatedPet = await Pet.findById(pet._id)
    .populate('owner', 'firstName lastName email');
  
  console.log('Pet created successfully:', populatedPet);
  
  res.status(201).json({
    success: true,
    data: populatedPet
  });
});

exports.updatePet = asyncHandler(async (req, res, next) => {
  let pet = await Pet.findById(req.params.id);
  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }
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

exports.deletePet = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete this pet`, 401));
  }
  await Pet.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: {}
  });
});

exports.uploadPetImage = asyncHandler(async (req, res, next) => {
  ensureUploadsDir();
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to upload image for this pet`, 401));
  }
  if (!req.files || !req.files.images) {
    return next(new ErrorResponse('Please upload an image', 400));
  }
  
  const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
  const newImages = images.map(file => ({
    url: `/uploads/${file.filename}`,
    caption: req.body.caption || '',
    uploadedAt: new Date()
  }));
  
  pet.images.push(...newImages);
  await pet.save();
  
  res.status(200).json({
    success: true,
    data: pet
  });
});

exports.addMedicalRecord = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }
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

exports.deleteMedicalRecord = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete medical record for this pet`, 401));
  }
  pet.medicalHistory = pet.medicalHistory.filter(record => record._id.toString() !== req.params.recordId);
  await pet.save();
  res.status(200).json({
    success: true,
    data: pet
  });
});

exports.addVaccination = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }
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

exports.deleteVaccination = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete vaccination for this pet`, 401));
  }
  pet.vaccinations = pet.vaccinations.filter(vaccine => vaccine._id.toString() !== req.params.vaccinationId);
  await pet.save();
  res.status(200).json({
    success: true,
    data: pet
  });
});

exports.addAllergy = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }
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

exports.deleteAllergy = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete allergy for this pet`, 401));
  }
  pet.allergies = pet.allergies.filter(allergy => allergy._id.toString() !== req.params.allergyId);
  await pet.save();
  res.status(200).json({
    success: true,
    data: pet
  });
});

exports.addMedication = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }
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

exports.deleteMedication = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete medication for this pet`, 401));
  }
  pet.medications = pet.medications.filter(med => med._id.toString() !== req.params.medicationId);
  await pet.save();
  res.status(200).json({
    success: true,
    data: pet
  });
});

exports.getPetTimeline = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.params.id}`, 404));
  }
  if (pet.owner.toString() !== req.user.id && req.user.userType !== 'veterinarian') {
    return next(new ErrorResponse(`Not authorized to access this pet's timeline`, 401));
  }
  const Appointment = require('../models/Appointment');
  const appointments = await Appointment.find({ pet: req.params.id })
    .populate('veterinarian', 'firstName lastName specialization')
    .sort({ date: -1 });
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
      title: `Appointment with Dr. ${appt.veterinarian?.lastName || 'Unknown'}`,
      description: appt.reason,
      data: appt
    }))
  ];
  timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.status(200).json({
    success: true,
    data: timeline
  });
});