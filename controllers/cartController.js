const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get user's cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'name price images');

  if (!cart) {
    // Create empty cart if it doesn't exist
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Add item to cart
// @route   POST /api/v1/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;

  // Check if product exists and is active
  const product = await Product.findOne({ _id: productId, isActive: true });
  
  if (!product) {
    return next(new ErrorResponse(`Product not found or unavailable`, 404));
  }

  // Check stock availability
  if (product.stock < quantity) {
    return next(new ErrorResponse(`Insufficient stock. Only ${product.stock} available`, 400));
  }

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    // Create new cart if it doesn't exist
    cart = await Cart.create({
      user: req.user.id,
      items: [{
        product: productId,
        quantity,
        price: product.price
      }]
    });
  } else {
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if product exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item if product doesn't exist
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }
  }

  await cart.save();
  await cart.populate('items.product', 'name price images');

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new ErrorResponse(`Cart not found`, 404));
  }

  const itemIndex = cart.items.findIndex(
    item => item._id.toString() === req.params.itemId
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse(`Item not found in cart`, 404));
  }

  // Check stock availability
  const product = await Product.findById(cart.items[itemIndex].product);
  if (product.stock < quantity) {
    return next(new ErrorResponse(`Insufficient stock. Only ${product.stock} available`, 400));
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  await cart.populate('items.product', 'name price images');

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/:itemId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new ErrorResponse(`Cart not found`, 404));
  }

  cart.items = cart.items.filter(
    item => item._id.toString() !== req.params.itemId
  );

  await cart.save();
  await cart.populate('items.product', 'name price images');

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Clear cart
// @route   DELETE /api/v1/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new ErrorResponse(`Cart not found`, 404));
  }

  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    data: cart
  });
});