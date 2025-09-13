const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/async');
const HealthRecord = require('../models/HealthRecords');
const Appointment = require('../models/Appointment');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

router.get('/pet/:petId', protect, asyncHandler(async (req, res, next) => {
  if (req.user.userType !== 'veterinarian') {
    return next(new ErrorResponse('Only veterinarians can view health records', 401));
  }

  const appointment = await Appointment.findOne({
    pet: req.params.petId,
    veterinarian: req.user.id,
    status: { $in: ['scheduled', 'confirmed', 'completed'] }
  });

  if (!appointment) {
    return next(new ErrorResponse('Not authorized to view this pet\'s records', 401));
  }

  const records = await HealthRecord.find({ pet: req.params.petId })
    .populate('appointment', 'date time reason')
    .populate('pet', 'name species breed')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: records.length,
    data: records
  });
}));

router.post('/', protect, asyncHandler(async (req, res, next) => {
  if (req.user.userType !== 'veterinarian') {
    return next(new ErrorResponse('Only veterinarians can create health records', 401));
  }

  const appointment = await Appointment.findById(req.body.appointment);
  if (!appointment) {
    return next(new ErrorResponse('Appointment not found', 404));
  }

  if (appointment.veterinarian.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to create record for this appointment', 401));
  }

  req.body.veterinarian = req.user.id;
  const healthRecord = await HealthRecord.create(req.body);

  await Appointment.findByIdAndUpdate(req.body.appointment, {
    symptoms: req.body.symptoms,
    diagnosis: req.body.diagnosis,
    treatment: req.body.treatment,
    notes: req.body.notes,
    status: 'completed'
  });

  res.status(201).json({
    success: true,
    data: healthRecord
  });
}));

module.exports = router;