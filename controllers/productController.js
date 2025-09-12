const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build query
  let query = Product.find({ isActive: true });

  // Filter by category
  if (req.query.category) {
    query = query.where('category').equals(req.query.category);
  }

  // Filter by brand
  if (req.query.brand) {
    query = query.where('brand').equals(req.query.brand); 
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    const priceFilter = {};
    if (req.query.minPrice) priceFilter.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) priceFilter.$lte = parseFloat(req.query.maxPrice);
    query = query.where('price', priceFilter);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('name');
  }

  // Pagination
  query = query.skip(startIndex).limit(limit);

  const products = await query;

  // Get total count for pagination
  const total = await Product.countDocuments({ isActive: true });

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});


exports.searchProducts = asyncHandler(async (req, res, next) => {
  const { q, category, minPrice, maxPrice } = req.query;

  let query = Product.find({ isActive: true });

  // Text search
  if (q) {
    query = query.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } }
      ]
    });
  }

  // Filter by category
  if (category) {
    query = query.where('category').equals(category);
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = parseFloat(minPrice);
    if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
    query = query.where('price', priceFilter);
  }

  const products = await query.limit(20);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});


exports.getProductsByCategory = asyncHandler(async (req, res, next) => {
  const products = await Product.find({
    category: req.params.category,
    isActive: true
  });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});


exports.createProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product (Admin only)
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete product (Admin only)
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  // Soft delete by setting isActive to false
  product.isActive = false;
  await product.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});