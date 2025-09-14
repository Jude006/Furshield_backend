const asyncHandler = require('express-async-handler');
const Shelter = require('../models/Shelter');
const ShelterPet = require('../models/PetsSchema');
const CareLog = require('../models/CareLogs');
const AdoptionInterest = require('../models/Adoption');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const getDashboardData = asyncHandler(async (req, res) => {
  const shelterId = req.user._id;

  const shelter = await Shelter.findById(shelterId).select('name');
  if (!shelter) {
    res.status(404);
    throw new Error('Shelter not found');
  }

  const animalsInCare = await ShelterPet.countDocuments({ shelterId, status: 'available' });
  const adoptionApplications = await AdoptionInterest.countDocuments({
    petId: { $in: await ShelterPet.find({ shelterId }).select('_id') },
    status: 'pending',
  });
  const successfulAdoptions = await ShelterPet.countDocuments({ shelterId, status: 'adopted' });
  const medicalAppointments = await CareLog.countDocuments({
    petId: { $in: await ShelterPet.find({ shelterId }).select('_id') },
    type: 'medical',
  });

  const recentAdoptions = await ShelterPet.find({ shelterId, status: 'adopted' })
    .select('name species breed updatedAt')
    .sort({ updatedAt: -1 })
    .limit(3);

  const urgentTasks = await CareLog.find({ petId: { $in: await ShelterPet.find({ shelterId }).select('_id') } })
    .select('type details date')
    .sort({ date: 1 })
    .limit(3);

  res.json({
    success: true,
    data: {
      stats: {
        animalsInCare,
        adoptionApplications,
        successfulAdoptions,
        medicalAppointments,
      },
      recentAdoptions,
      urgentTasks,
      shelterName: shelter.name,
    },
  });
});

const getShelterPets = asyncHandler(async (req, res) => {
  const pets = await ShelterPet.find({ shelterId: req.user._id });
  res.json({ success: true, data: pets });
});

const getPet = asyncHandler(async (req, res) => {
  const pet = await ShelterPet.findById(req.params.id);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  if (pet.shelterId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }
  res.json({ success: true, data: pet });
});

const addPet = asyncHandler(async (req, res) => {
  const { name, species, breed, age, gender, description, status, location, color, weight, tags, medicalHistory, specialNeeds } = req.body;
  const images = req.files ? req.files.map(file => `/Uploads/${file.filename}`) : [];

  const pet = await ShelterPet.create({
    shelterId: req.user._id,
    name,
    species,
    breed,
    age: Number(age),
    gender,
    description,
    status,
    location,
    images,
    color,
    weight: Number(weight),
    medicalHistory,
    specialNeeds,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
  });

  res.status(201).json({ success: true, data: pet });
});

const updatePet = asyncHandler(async (req, res) => {
  const pet = await ShelterPet.findById(req.params.id);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  if (pet.shelterId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedData = { ...req.body };
  if (req.files) {
    updatedData.images = req.files.map(file => `/Uploads/${file.filename}`);
  }
  if (req.body.existingImages) {
    updatedData.images = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
  }
  if (req.body.tags) {
    updatedData.tags = req.body.tags.split(',').map(tag => tag.trim());
  }
  updatedData.age = Number(req.body.age);
  updatedData.weight = Number(req.body.weight);

  const updatedPet = await ShelterPet.findByIdAndUpdate(req.params.id, updatedData, { new: true });

  res.json({ success: true, data: updatedPet });
});

const deletePet = asyncHandler(async (req, res) => {
  const pet = await ShelterPet.findById(req.params.id);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  if (pet.shelterId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await ShelterPet.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Pet removed' });
});

const addCareLog = asyncHandler(async (req, res) => {
  const { type, details } = req.body;
  const pet = await ShelterPet.findById(req.params.petId);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  if (pet.shelterId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const careLog = await CareLog.create({
    petId: req.params.petId,
    type,
    details,
  });

  res.status(201).json({ success: true, data: careLog });
});

const getCareLogs = asyncHandler(async (req, res) => {
  const pet = await ShelterPet.findById(req.params.petId);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  if (pet.shelterId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const careLogs = await CareLog.find({ petId: req.params.petId });
  res.json({ success: true, data: careLogs });
});

const getAdoptionInterests = asyncHandler(async (req, res) => {
  const pet = await ShelterPet.findById(req.params.petId);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  if (pet.shelterId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const interests = await AdoptionInterest.find({ petId: req.params.petId }).populate('adopterId', 'name email');
  res.json({ success: true, data: interests });
});

const respondToInterest = asyncHandler(async (req, res) => {
  const { status, response } = req.body;
  const interest = await AdoptionInterest.findById(req.params.interestId);
  if (!interest) {
    res.status(404);
    throw new Error('Interest not found');
  }

  const pet = await ShelterPet.findById(interest.petId);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  if (pet.shelterId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  interest.status = status;
  interest.response = response;
  await interest.save();

  if (status === 'finalized') {
    pet.status = 'adopted';
    await pet.save();
  }

  res.json({ success: true, data: interest });
});

const updateShelterProfile = asyncHandler(async (req, res) => {
  const shelter = await Shelter.findById(req.user._id);
  if (!shelter) {
    res.status(404);
    throw new Error('Shelter not found');
  }

  const updatedData = {
    name: req.body.name || shelter.name,
    contactPerson: req.body.contactPerson || shelter.contactPerson,
    email: req.body.email || shelter.email,
    contactNumber: req.body.contactNumber || shelter.contactNumber,
    address: req.body.address || shelter.address,
  };
  if (req.file) {
    updatedData.profileImage = `/Uploads/${req.file.filename}`;
  }

  const updatedShelter = await Shelter.findByIdAndUpdate(req.user._id, updatedData, { new: true }).select('-password');

  res.json({ success: true, data: updatedShelter });
});

module.exports = {
  getDashboardData,
  getShelterPets,
  getPet,
  addPet: upload.array('images', 5),
  updatePet: upload.array('images', 5),
  deletePet,
  addCareLog,
  getCareLogs,
  getAdoptionInterests,
  respondToInterest,
  updateShelterProfile: upload.single('profileImage'),
};