const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

exports.markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }
  if (notification.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this notification', 403));
  }
  notification.read = true;
  await notification.save();
  res.status(200).json({
    success: true,
    data: notification
  });
});

exports.markAllNotificationsAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { read: true }
  );
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.status(200).json({
    success: true,
    data: notifications
  });
});