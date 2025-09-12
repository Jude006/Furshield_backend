const Order = require('../models/Order');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ owner: req.user.id, status: { $ne: 'cart' } }).populate('items.product', 'name category image');
  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

exports.getCart = asyncHandler(async (req, res, next) => {
  let cart = await Order.findOne({ owner: req.user.id, status: 'cart' }).populate('items.product', 'name category image price stockQuantity');
  if (!cart) {
    cart = new Order({
      owner: req.user.id,
      items: [],
      totalAmount: 0,
      status: 'cart'
    });
    await cart.save();
  }
  res.status(200).json({
    success: true,
    data: cart
  });
});

exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;
  let cart = await Order.findOne({ owner: req.user.id, status: 'cart' });
  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (product.stockQuantity < quantity) {
    return next(new ErrorResponse('Insufficient stock', 400));
  }

  const item = {
    product: productId,
    quantity: parseInt(quantity),
    price: product.price
  };

  if (!cart) {
    cart = new Order({
      owner: req.user.id,
      items: [item],
      totalAmount: item.quantity * item.price,
      status: 'cart'
    });
  } else {
    const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += item.quantity;
    } else {
      cart.items.push(item);
    }
    cart.totalAmount = cart.items.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
  }

  await cart.save();
  await cart.populate('items.product', 'name category image price stockQuantity');
  res.status(200).json({
    success: true,
    data: cart
  });
});

exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const cart = await Order.findOne({ owner: req.user.id, status: 'cart' });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (quantity > product.stockQuantity) {
    return next(new ErrorResponse('Insufficient stock', 400));
  }

  const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
  if (itemIndex === -1) {
    return next(new ErrorResponse('Item not found in cart', 404));
  }

  if (quantity === 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = parseInt(quantity);
  }
  cart.totalAmount = cart.items.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
  await cart.save();
  await cart.populate('items.product', 'name category image price stockQuantity');
  res.status(200).json({
    success: true,
    data: cart
  });
});

exports.clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Order.findOne({ owner: req.user.id, status: 'cart' });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();
  res.status(200).json({
    success: true,
    data: cart
  });
});

exports.submitOrder = asyncHandler(async (req, res, next) => {
  const cart = await Order.findOne({ owner: req.user.id, status: 'cart' });
  if (!cart || cart.items.length === 0) {
    return next(new ErrorResponse('Cart is empty', 400));
  }

  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product || product.stockQuantity < item.quantity) {
      return next(new ErrorResponse(`Insufficient stock for ${product?.name || 'item'}`, 400));
    }
    product.stockQuantity -= item.quantity;
    await product.save();
  }

  cart.status = 'pending';
  cart.orderDate = new Date();
  await cart.save();
  await cart.populate('items.product', 'name category image price');
  res.status(200).json({
    success: true,
    data: cart
  });
});