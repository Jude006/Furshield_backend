const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getProducts = asyncHandler(async (req, res, next) => {
  const { category } = req.query;
  let query = {};
  if (category) query.category = category;

  const products = await Product.find(query);
  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

exports.getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }
  res.status(200).json({
    success: true,
    data: product
  });
});