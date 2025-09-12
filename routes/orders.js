const express = require('express');
const router = express.Router();
const { getOrders, getCart, addToCart, updateCartItem, clearCart, submitOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getOrders).post(protect, addToCart);
router.route('/cart').get(protect, getCart);
router.route('/cart/update').put(protect, updateCartItem);
router.route('/cart/clear').delete(protect, clearCart);
router.route('/submit').put(protect, submitOrder);

module.exports = router;