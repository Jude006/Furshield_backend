const Insurance = require('../models/Insurance');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
 const Pet = require('../models/Pets');


exports.getInsurancePolicies = asyncHandler(async (req, res, next) => {
  const userPets = await Pet.find({ owner: req.user.id }).select('_id');
  const petIds = userPets.map(pet => pet._id);

  const policies = await Insurance.find({ pet: { $in: petIds } })
    .populate('pet', 'name species breed');

  res.status(200).json({
    success: true,
    count: policies.length,
    data: policies
  });
});


exports.getInsurancePolicy = asyncHandler(async (req, res, next) => {
  const policy = await Insurance.findById(req.params.id)
    .populate('pet', 'name species breed');

  if (!policy) {
    return next(new ErrorResponse(`Insurance policy not found with id of ${req.params.id}`, 404));
  }

  const pet = await Pet.findById(policy.pet._id);
  
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to access this insurance policy`, 401));
  }

  res.status(200).json({
    success: true,
    data: policy
  });
});


exports.createInsurancePolicy = asyncHandler(async (req, res, next) => {
  const pet = await Pet.findById(req.body.pet);
  
  if (!pet) {
    return next(new ErrorResponse(`Pet not found with id of ${req.body.pet}`, 404));
  }

  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to create insurance policy for this pet`, 401));
  }

  const policy = await Insurance.create(req.body);

  res.status(201).json({
    success: true,
    data: policy
  });
});


exports.updateInsurancePolicy = asyncHandler(async (req, res, next) => {
  let policy = await Insurance.findById(req.params.id);

  if (!policy) {
    return next(new ErrorResponse(`Insurance policy not found with id of ${req.params.id}`, 404));
  }

  const pet = await Pet.findById(policy.pet);
  
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to update this insurance policy`, 401));
  }

  policy = await Insurance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('pet', 'name species breed');

  res.status(200).json({
    success: true,
    data: policy
  });
});


exports.deleteInsurancePolicy = asyncHandler(async (req, res, next) => {
  const policy = await Insurance.findById(req.params.id);

  if (!policy) {
    return next(new ErrorResponse(`Insurance policy not found with id of ${req.params.id}`, 404));
  }

  const pet = await Pet.findById(policy.pet);
  
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete this insurance policy`, 401));
  }

  await Insurance.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});


exports.addInsuranceClaim = asyncHandler(async (req, res, next) => {
  const policy = await Insurance.findById(req.params.id);

  if (!policy) {
    return next(new ErrorResponse(`Insurance policy not found with id of ${req.params.id}`, 404));
  }

  const pet = await Pet.findById(policy.pet);
  
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to add claim to this insurance policy`, 401));
  }

  policy.claims.push(req.body);
  await policy.save();

  res.status(200).json({
    success: true,
    data: policy
  });
});

exports.uploadInsuranceDocument = asyncHandler(async (req, res, next) => {
  const policy = await Insurance.findById(req.params.id);

  if (!policy) {
    return next(new ErrorResponse(`Insurance policy not found with id of ${req.params.id}`, 404));
  }

  const pet = await Pet.findById(policy.pet);
  
  if (pet.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to upload documents to this insurance policy`, 401));
  }

  policy.documents.push(req.body);
  await policy.save();

  res.status(200).json({
    success: true,
    data: policy
  });
});