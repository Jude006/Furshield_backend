const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const OrderSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['cart', 'pending', 'completed', 'cancelled'],
    default: 'cart'
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);