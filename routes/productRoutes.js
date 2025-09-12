const express = require('express');
const router = express.Router();
const { getProducts, getProductById } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProducts);
router.route('/:id').get(protect, getProductById);

module.exports = router;