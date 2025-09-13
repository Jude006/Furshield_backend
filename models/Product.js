const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, required: true, enum: ['food', 'grooming', 'toys', 'health', 'accessories'] },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true, maxlength: 500 },
  stockQuantity: { type: Number, required: true, min: 0 },
  images: [{ type: String, default: 'https://via.placeholder.com/300' }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);