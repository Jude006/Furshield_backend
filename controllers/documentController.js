const Document = require('../models/Document');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');


exports.getDocuments = asyncHandler(async (req, res, next) => {
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


exports.getDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id)
    .populate('pet', 'name species breed')
    .populate('uploadedBy', 'firstName lastName');

  if (!document) {
    return next(new ErrorResponse(`Document not found with id of ${req.params.id}`, 404));
  }

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


exports.uploadDocument = asyncHandler(async (req, res, next) => {
  const Pet = require('../models/Pet');
  const pet = await Pet.findById(req.body.pet);
  
  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.body.pet}`, 404));
  }

  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to upload documents for this pet`, 401));
  }

  req.body.uploadedBy = req.user.id;

  const document = await Document.create(req.body);

  await document.populate('pet', 'name species breed');
  await document.populate('uploadedBy', 'firstName lastName');

  res.status(201).json({
    success: true,
    data: document
  });
});


exports.updateDocument = asyncHandler(async (req, res, next) => {
  let document = await Document.findById(req.params.id);

  if (!document) {
    return next(new ErrorResponse(`Document not found with id of ${req.params.id}`, 404));
  }

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


exports.deleteDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return next(new ErrorResponse(`Document not found with id of ${req.params.id}`, 404));
  }

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