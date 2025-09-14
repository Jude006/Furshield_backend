const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { submitInterest } = require('../controllers/adoptionController');

const router = express.Router();

router.post('/interests', protect, submitInterest);

module.exports = router;