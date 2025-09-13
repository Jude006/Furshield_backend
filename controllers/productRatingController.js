const asyncHandler = require('express-async-handler');
const ProductRating = require('../models/ProductRating');
const Product = require('../models/Product');

exports.addProductRating = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  if (!productId || !rating) {
    res.status(400);
    throw new Error('Product ID and rating are required');
  }
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const existingRating = await ProductRating.findOne({ productId, userId: req.user._id });
  if (existingRating) {
    res.status(400);
    throw new Error('You have already rated this product');
  }
  const productRating = await ProductRating.create({
    productId,
    userId: req.user._id,
    rating,
    comment
  });
  res.status(201).json({ success: true, data: productRating });
});

exports.getProductRatings = asyncHandler(async (req, res) => {
  const ratings = await ProductRating.find({ productId: req.params.productId })
    .populate('userId', 'name');
  res.status(200).json({ success: true, data: ratings });
});