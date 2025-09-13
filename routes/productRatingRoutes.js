const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { addProductRating, getProductRatings } = require('../controllers/productRatingController');

router.post('/', protect, addProductRating);
router.get('/product/:productId', getProductRatings);

module.exports = router;