const Pet = require('../models/Pets');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getHealthRecords = asyncHandler(async (req, res, next) => {
  const { petId } = req.query;
  const user = req.user;

  let query = { owner: user.id };
  if (petId) {
    query._id = petId;
  }

  const pets = await Pet.find(query);

  if (petId && pets.length === 0) {
    return next(new ErrorResponse('Pet not found', 404));
  }

  const records = petId ? pets[0] : pets;

  res.status(200).json({
    success: true,
    data: records
  });
});

exports.addMedicalRecord = asyncHandler(async (req, res, next) => {
  const { petId } = req.params;
  const { condition, diagnosis, treatment } = req.body;

  const pet = await Pet.findById(petId);

  if (!pet) {
    return next(new ErrorResponse('Pet not found', 404));
  }

  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this pet', 401));
  }

  pet.medicalHistory.push({
    date: new Date(),
    condition,
    diagnosis,
    treatment
  });

  await pet.save();

  res.status(201).json({
    success: true,
    data: pet.medicalHistory[pet.medicalHistory.length - 1]
  });
});

exports.addVaccination = asyncHandler(async (req, res, next) => {
  const { petId } = req.params;
  const { vaccine, date, nextDue } = req.body;

  const pet = await Pet.findById(petId);

  if (!pet) {
    return next(new ErrorResponse('Pet not found', 404));
  }

  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this pet', 401));
  }

  pet.vaccinations.push({
    vaccine,
    date: new Date(date),
    nextDue: new Date(nextDue)
  });

  await pet.save();

  res.status(201).json({
    success: true,
    data: pet.vaccinations[pet.vaccinations.length - 1]
  });
});

exports.addAllergy = asyncHandler(async (req, res, next) => {
  const { petId } = req.params;
  const { allergen, reaction, severity } = req.body;

  const pet = await Pet.findById(petId);

  if (!pet) {
    return next(new ErrorResponse('Pet not found', 404));
  }

  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this pet', 401));
  }

  pet.allergies.push({
    allergen,
    reaction,
    severity
  });

  await pet.save();

  res.status(201).json({
    success: true,
    data: pet.allergies[pet.allergies.length - 1]
  });
});

exports.addMedication = asyncHandler(async (req, res, next) => {
  const { petId } = req.params;
  const { name, dosage, frequency, startDate, endDate } = req.body;

  const pet = await Pet.findById(petId);

  if (!pet) {
    return next(new ErrorResponse('Pet not found', 404));
  }

  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this pet', 401));
  }

  pet.medications.push({
    name,
    dosage,
    frequency,
    startDate: new Date(startDate),
    endDate: new Date(endDate)
  });

  await pet.save();

  res.status(201).json({
    success: true,
    data: pet.medications[pet.medications.length - 1]
  });
});

exports.uploadDocument = asyncHandler(async (req, res, next) => {
  const { petId } = req.params;
  const { type, description } = req.body;
  const file = req.file;

  const pet = await Pet.findById(petId);

  if (!pet) {
    return next(new ErrorResponse('Pet not found', 404));
  }

  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this pet', 401));
  }

  const document = {
    type,
    url: `/uploads/${file.filename}`,
    description,
    uploadDate: new Date()
  };

  pet.documents.push(document);

  await pet.save();

  res.status(201).json({
    success: true,
    data: document
  });
});

exports.addInsurance = asyncHandler(async (req, res, next) => {
  const { petId } = req.params;
  const { policyNumber, provider, coverage, startDate, endDate } = req.body;

  const pet = await Pet.findById(petId);

  if (!pet) {
    return next(new ErrorResponse('Pet not found', 404));
  }

  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this pet', 401));
  }

  pet.insurance.push({
    policyNumber,
    provider,
    coverage,
    startDate: new Date(startDate),
    endDate: new Date(endDate)
  });

  await pet.save();

  res.status(201).json({
    success: true,
    data: pet.insurance[pet.insurance.length - 1]
  });
});

exports.getPetHealthRecordsForVet = asyncHandler(async (req, res, next) => {
  const { petId } = req.params;

  const appointment = await Appointment.findOne({
    pet: petId,
    veterinarian: req.user.id,
    status: { $in: ['scheduled', 'confirmed', 'completed'] }
  });

  if (!appointment) {
    return next(new ErrorResponse('Not authorized to view this pet\'s records', 401));
  }

  const pet = await Pet.findById(petId)
    .select('medicalHistory vaccinations allergies medications documents insurance');

  res.status(200).json({
    success: true,
    data: pet
  });
});

exports.logTreatment = asyncHandler(async (req, res, next) => {
  const { appointmentId } = req.params;
  const { symptoms, diagnosis, treatment, followUpRequired, followUpDate } = req.body;

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return next(new ErrorResponse('Appointment not found', 404));
  }

  if (appointment.veterinarian.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to log treatment for this appointment', 401));
  }

  appointment.symptoms = symptoms;
  appointment.diagnosis = diagnosis;
  treatment.treatment = treatment;
  appointment.followUpRequired = followUpRequired;
  appointment.followUpDate = followUpDate ? new Date(followUpDate) : undefined;
  appointment.status = 'completed';

  await appointment.save();

  const pet = await Pet.findById(appointment.pet);

  pet.medicalHistory.push({
    date: appointment.date,
    condition: diagnosis, 
    diagnosis,
    treatment,
    veterinarian: req.user.id
  });

  await pet.save();

  res.status(200).json({
    success: true,
    data: appointment
  });
});