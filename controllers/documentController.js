const Document = require('../models/Document');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all documents for user's pets
// @route   GET /api/v1/documents
// @access  Private
exports.getDocuments = asyncHandler(async (req, res, next) => {
  // Get all pets owned by user
  const Pet = require('../models/Pet');
  const userPets = await Pet.find({ owner: req.user.id }).select('_id');
  const petIds = userPets.map(pet => pet._id);

  const documents = await Document.find({ pet: { $in: petIds } })
    .populate('pet', 'name species breed')
    .populate('uploadedBy', 'firstName lastName')
    .sort({ uploadDate: -1 });

  res.status(200).json({
    success: true,
    count: documents.length,
    data: documents
  });
});

// @desc    Get single document
// @route   GET /api/v1/documents/:id
// @access  Private
exports.getDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id)
    .populate('pet', 'name species breed')
    .populate('uploadedBy', 'firstName lastName');

  if (!document) {
    return next(new ErrorResponse(`Document not found with id of ${req.params.id}`, 404));
  }

  // Verify user owns the pet
  const Pet = require('../models/Pet');
  const pet = await Pet.findById(document.pet._id);
  
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to access this document`, 401));
  }

  res.status(200).json({
    success: true,
    data: document
  });
});

// @desc    Upload document
// @route   POST /api/v1/documents
// @access  Private
exports.uploadDocument = asyncHandler(async (req, res, next) => {
  // Verify user owns the pet
  const Pet = require('../models/Pet');
  const pet = await Pet.findById(req.body.pet);
  
  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.body.pet}`, 404));
  }

  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to upload documents for this pet`, 401));
  }

  // Add uploadedBy to req.body
  req.body.uploadedBy = req.user.id;

  const document = await Document.create(req.body);

  await document.populate('pet', 'name species breed');
  await document.populate('uploadedBy', 'firstName lastName');

  res.status(201).json({
    success: true,
    data: document
  });
});

// @desc    Update document
// @route   PUT /api/v1/documents/:id
// @access  Private
exports.updateDocument = asyncHandler(async (req, res, next) => {
  let document = await Document.findById(req.params.id);

  if (!document) {
    return next(new ErrorResponse(`Document not found with id of ${req.params.id}`, 404));
  }

  // Verify user owns the pet
  const Pet = require('../models/Pet');
  const pet = await Pet.findById(document.pet);
  
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to update this document`, 401));
  }

  document = await Document.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('pet', 'name species breed')
    .populate('uploadedBy', 'firstName lastName');

  res.status(200).json({
    success: true,
    data: document
  });
});

// @desc    Delete document
// @route   DELETE /api/v1/documents/:id
// @access  Private
exports.deleteDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return next(new ErrorResponse(`Document not found with id of ${req.params.id}`, 404));
  }

  // Verify user owns the pet
  const Pet = require('../models/Pet');
  const pet = await Pet.findById(document.pet);
  
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete this document`, 401));
  }

  await Document.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});