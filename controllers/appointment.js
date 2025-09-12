// const Appointment = require('../models/Appointment');
// const ErrorResponse = require('../utils/errorResponse');
// const asyncHandler = require('../middleware/async');

// // @desc    Get all appointments for logged in user
// // @route   GET /api/v1/appointments
// // @access  Private
// exports.getAppointments = asyncHandler(async (req, res, next) => {
//   let query;
  
//   if (req.user.userType === 'veterinarian') {
//     // Veterinarians see their own appointments
//     query = Appointment.find({ veterinarian: req.user.id });
//   } else {
//     // Pet owners see their pets' appointments
//     query = Appointment.find({ owner: req.user.id });
//   }

//   const appointments = await query
//     .populate('pet', 'name species breed')
//     .populate('owner', 'firstName lastName email')
//     .populate('veterinarian', 'firstName lastName specialization')
//     .sort({ date: 1 });

//   res.status(200).json({
//     success: true,
//     count: appointments.length,
//     data: appointments
//   });
// });

// // @desc    Get single appointment
// // @route   GET /api/v1/appointments/:id
// // @access  Private
// exports.getAppointment = asyncHandler(async (req, res, next) => {
//   const appointment = await Appointment.findById(req.params.id)
//     .populate('pet', 'name species breed')
//     .populate('owner', 'firstName lastName email')
//     .populate('veterinarian', 'firstName lastName specialization');

//   if (!appointment) {
//     return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
//   }

//   // Make sure user is owner or veterinarian
//   if (appointment.owner._id.toString() !== req.user.id && 
//       appointment.veterinarian._id.toString() !== req.user.id) {
//     return next(new ErrorResponse(`Not authorized to access this appointment`, 401));
//   }

//   res.status(200).json({
//     success: true,
//     data: appointment
//   });
// });

// // @desc    Create new appointment
// // @route   POST /api/v1/appointments
// // @access  Private
// exports.createAppointment = asyncHandler(async (req, res, next) => {
//   // Add owner to req.body
//   req.body.owner = req.user.id;

//   const appointment = await Appointment.create(req.body);

//   // Populate the created appointment
//   await appointment.populate('pet', 'name species breed');
//   await appointment.populate('veterinarian', 'firstName lastName specialization');

//   res.status(201).json({
//     success: true,
//     data: appointment
//   });
// });

// // @desc    Update appointment
// // @route   PUT /api/v1/appointments/:id
// // @access  Private
// exports.updateAppointment = asyncHandler(async (req, res, next) => {
//   let appointment = await Appointment.findById(req.params.id);

//   if (!appointment) {
//     return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
//   }

//   // Make sure user is owner or veterinarian
//   if (appointment.owner.toString() !== req.user.id && 
//       appointment.veterinarian.toString() !== req.user.id) {
//     return next(new ErrorResponse(`Not authorized to update this appointment`, 401));
//   }

//   appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   })
//     .populate('pet', 'name species breed')
//     .populate('veterinarian', 'firstName lastName specialization');

//   res.status(200).json({
//     success: true,
//     data: appointment
//   });
// });

// // @desc    Delete appointment
// // @route   DELETE /api/v1/appointments/:id
// // @access  Private
// exports.deleteAppointment = asyncHandler(async (req, res, next) => {
//   const appointment = await Appointment.findById(req.params.id);

//   if (!appointment) {
//     return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
//   }

//   // Make sure user is owner
//   if (appointment.owner.toString() !== req.user.id) {
//     return next(new ErrorResponse(`Not authorized to delete this appointment`, 401));
//   }

//   await Appointment.findByIdAndDelete(req.params.id);

//   res.status(200).json({
//     success: true,
//     data: {}
//   });
// });

// // @desc    Get appointments for specific veterinarian
// // @route   GET /api/v1/appointments/vet/:vetId
// // @access  Private
// exports.getVetAppointments = asyncHandler(async (req, res, next) => {
//   // Check if user is the veterinarian or has access
//   if (req.params.vetId !== req.user.id && req.user.userType !== 'veterinarian') {
//     return next(new ErrorResponse(`Not authorized to access these appointments`, 401));
//   }

//   const appointments = await Appointment.find({ veterinarian: req.params.vetId })
//     .populate('pet', 'name species breed')
//     .populate('owner', 'firstName lastName email')
//     .sort({ date: 1 });

//   res.status(200).json({
//     success: true,
//     count: appointments.length,
//     data: appointments
//   });
// });

// // @desc    Update appointment status
// // @route   PUT /api/v1/appointments/:id/status
// // @access  Private
// exports.updateAppointmentStatus = asyncHandler(async (req, res, next) => {
//   const { status } = req.body;
  
//   let appointment = await Appointment.findById(req.params.id);

//   if (!appointment) {
//     return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
//   }

//   // Make sure user is veterinarian or owner
//   if (appointment.veterinarian.toString() !== req.user.id && 
//       appointment.owner.toString() !== req.user.id) {
//     return next(new ErrorResponse(`Not authorized to update this appointment status`, 401));
//   }

//   appointment.status = status;
//   await appointment.save();

//   // Populate the updated appointment
//   await appointment.populate('pet', 'name species breed');
//   await appointment.populate('veterinarian', 'firstName lastName specialization');

//   res.status(200).json({
//     success: true,
//     data: appointment
//   });
// });
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getAppointments = asyncHandler(async (req, res, next) => {
  let query;
  
  if (req.user.userType === 'veterinarian') {
    query = Appointment.find({ veterinarian: req.user.id });
  } else {
    query = Appointment.find({ owner: req.user.id });
  }

  const appointments = await query
    .populate('pet', 'name species breed')
    .populate('owner', 'firstName lastName email')
    .populate('veterinarian', 'firstName lastName specialization')
    .sort({ date: 1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

exports.getAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('pet', 'name species breed')
    .populate('owner', 'firstName lastName email')
    .populate('veterinarian', 'firstName lastName specialization');

  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
  }

  if (appointment.owner._id.toString() !== req.user.id && 
      appointment.veterinarian._id.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to access this appointment`, 401));
  }

  res.status(200).json({
    success: true,
    data: appointment
  });
});

exports.createAppointment = asyncHandler(async (req, res, next) => {
  req.body.owner = req.user.id;

  if (!req.body.veterinarian) {
    return next(new ErrorResponse('Veterinarian is required', 400));
  }

  const vet = await User.findOne({ _id: req.body.veterinarian, userType: 'veterinarian' });
  if (!vet) {
    return next(new ErrorResponse('Invalid veterinarian ID', 400));
  }

  const appointment = await Appointment.create(req.body);

  await appointment.populate('pet', 'name species breed');
  await appointment.populate('veterinarian', 'firstName lastName specialization');

  res.status(201).json({
    success: true,
    data: appointment
  });
});

exports.updateAppointment = asyncHandler(async (req, res, next) => {
  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
  }

  if (appointment.owner.toString() !== req.user.id && 
      appointment.veterinarian.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to update this appointment`, 401));
  }

  if (req.body.veterinarian) {
    const vet = await User.findOne({ _id: req.body.veterinarian, userType: 'veterinarian' });
    if (!vet) {
      return next(new ErrorResponse('Invalid veterinarian ID', 400));
    }
  }

  appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('pet', 'name species breed')
    .populate('veterinarian', 'firstName lastName specialization');

  res.status(200).json({
    success: true,
    data: appointment
  });
});

exports.deleteAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
  }

  if (appointment.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete this appointment`, 401));
  }

  await Appointment.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

exports.getVetAppointments = asyncHandler(async (req, res, next) => {
  if (req.params.vetId !== req.user.id && req.user.userType !== 'veterinarian') {
    return next(new ErrorResponse(`Not authorized to access these appointments`, 401));
  }

  const appointments = await Appointment.find({ veterinarian: req.params.vetId })
    .populate('pet', 'name species breed')
    .populate('owner', 'firstName lastName email')
    .sort({ date: 1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

exports.updateAppointmentStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  
  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404));
  }

  if (appointment.veterinarian.toString() !== req.user.id && 
      appointment.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to update this appointment status`, 401));
  }

  appointment.status = status;
  await appointment.save();

  await appointment.populate('pet', 'name species breed');
  await appointment.populate('veterinarian', 'firstName lastName specialization');

  res.status(200).json({
    success: true,
    data: appointment
  });
});