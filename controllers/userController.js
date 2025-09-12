const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getVeterinarians = asyncHandler(async (req, res, next) => {
  if (req.query.vets === 'true') {
    const veterinarians = await User.find({ userType: 'veterinarian' }).select(
      'firstName lastName specialization'
    );
    return res.status(200).json({
      success: true,
      count: veterinarians.length,
      data: veterinarians,
    });
  }
  return next(new ErrorResponse('Invalid query parameter', 400));
});

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.updateMe = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    contactNumber: req.body.contactNumber,
    address: req.body.address,
    specialization: req.body.specialization,
    experience: req.body.experience,
    licenseNumber: req.body.licenseNumber,
  };

  if (req.body.password) {
    fieldsToUpdate.password = req.body.password;
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  }).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});