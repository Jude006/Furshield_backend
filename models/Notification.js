const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  type: { type: String, enum: ['vaccination', 'appointment', 'new_product'], required: true },
  message: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId, refPath: 'relatedModel', required: false },
  relatedModel: { type: String, enum: ['Pet', 'Appointment', 'Product'], required: false },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);