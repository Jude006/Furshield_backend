const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const Owner = require('../models/Owner');

exports.createProduct = asyncHandler(async (req, res) => {
  const { name, category, price, description, stockQuantity, images } = req.body;
  const product = await Product.create({
    name,
    category,
    price,
    description,
    stockQuantity,
    images: images || []
  });

  const owners = await Owner.find();
  const notifications = owners.map(owner => ({
    userId: owner._id,
    type: 'new_product',
    message: `New product added: ${name}`,
    relatedId: product._id,
    relatedModel: 'Product'
  }));
  await Notification.insertMany(notifications);

  res.status(201).json({ success: true, data: product });
});

exports.getProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;
  let query = {};
  if (category) query.category = category;
  const products = await Product.find(query);
  res.status(200).json({ success: true, count: products.length, data: products });
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.status(200).json({ success: true, data: product });
});