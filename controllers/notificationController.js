const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .populate('relatedId')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: notifications });
});

exports.markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification || notification.userId.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Notification not found or unauthorized');
  }
  notification.isRead = true;
  await notification.save();
  res.status(200).json({ success: true, data: notification });
});

exports.markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});