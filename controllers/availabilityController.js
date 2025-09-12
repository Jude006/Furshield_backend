const Availability = require('../models/Availability');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getAvailability = asyncHandler(async (req, res, next) => {
  const availability = await Availability.find({ vet: req.user.id });
  res.status(200).json({
    success: true,
    data: availability
  });
});

exports.updateAvailability = asyncHandler(async (req, res, next) => {
  const { day, startTime, endTime, slots } = req.body;
  let availability = await Availability.findOne({ vet: req.user.id, day });

  if (availability) {
    availability.startTime = startTime;
    availability.endTime = endTime;
    availability.slots = slots;
  } else {
    availability = new Availability({
      vet: req.user.id,
      day,
      startTime,
      endTime,
      slots
    });
  }

  await availability.save();
  res.status(200).json({
    success: true,
    data: availability
  });
});

