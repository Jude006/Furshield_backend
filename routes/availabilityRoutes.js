const express = require('express');
const {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability
} = require('../controllers/availabilityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/vet/:vetId')
  .get(protect, getAvailability);

router.route('/')
  .post(protect, createAvailability);

router.route('/:id')
  .put(protect, updateAvailability)
  .delete(protect, deleteAvailability);

module.exports = router;