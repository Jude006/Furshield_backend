const express = require('express');
const router = express.Router();
const { getVetDashboardStats } = require('../controllers/vetController');
const { protect } = require('../middleware/authMiddleware');

router.route('/dashboard-stats').get(protect, getVetDashboardStats);

module.exports = router;