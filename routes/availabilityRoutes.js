const express = require('express');
const router = express.Router();
const { getAvailability, updateAvailability } = require('../controllers/availabilityController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getAvailability).put(protect, updateAvailability);

module.exports = router;