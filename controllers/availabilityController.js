const Availability = require('../models/Availability');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

exports.getAvailability = asyncHandler(async (req, res, next) => {
  if (req.user.userType !== 'veterinarian' || req.user.id !== req.params.vetId) {
    return next(new ErrorResponse('Not authorized to access this availability', 401));
  }

  const availability = await Availability.find({ veterinarian: req.params.vetId })
    .sort({ date: 1 });

  res.status(200).json({
    success: true,
    count: availability.length,
    data: availability
  });
});

exports.createAvailability = asyncHandler(async (req, res, next) => {
  if (req.user.userType !== 'veterinarian') {
    return next(new ErrorResponse('Only veterinarians can set availability', 401));
  }

  req.body.veterinarian = req.user.id;
  const availability = await Availability.create(req.body);

  res.status(201).json({
    success: true,
    data: availability
  });
});

exports.updateAvailability = asyncHandler(async (req, res, next) => {
  let availability = await Availability.findById(req.params.id);

  if (!availability) {
    return next(new ErrorResponse(`Availability not found with id of ${req.params.id}`, 404));
  }

  if (availability.veterinarian.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this availability', 401));
  }

  availability = await Availability.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: availability
  });
});

exports.deleteAvailability = asyncHandler(async (req, res, next) => {
  const availability = await Availability.findById(req.params.id);

  if (!availability) {
    return next(new ErrorResponse(`Availability not found with id of ${req.params.id}`, 404));
  }

  if (availability.veterinarian.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this availability', 401));
  }

  await Availability.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});