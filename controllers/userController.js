const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

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

  try {
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => ({
        field: e.path,
        msg: e.message,
      }));
      return next(new ErrorResponse('Validation failed', 400, errors));
    }
    return next(new ErrorResponse(err.message || 'Failed to update user', 400));
  }
});

exports.getVeterinarians = asyncHandler(async (req, res, next) => {
  const veterinarians = await User.find({
    userType: 'veterinarian',
    isActive: true,
  }).select('firstName lastName email specialization contactNumber address');

  res.status(200).json({
    success: true,
    count: veterinarians.length,
    data: veterinarians,
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});