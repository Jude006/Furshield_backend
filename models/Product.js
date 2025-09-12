const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['food', 'grooming', 'toys', 'health', 'accessories']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: 0
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);