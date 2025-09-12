const User = require('../models/User');
const Appointment = require('../models/Appointment');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getVetDashboardStats = asyncHandler(async (req, res, next) => {
  const appointments = await Appointment.find({ vet: req.user.id });
  const completed = appointments.filter(a => a.status === 'completed').length;
  const upcoming = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;
  const totalPatients = new Set(appointments.map(a => a.pet.toString())).size;

  res.status(200).json({
    success: true,
    data: {
      completed,
      upcoming,
      totalPatients
    }
  });
});