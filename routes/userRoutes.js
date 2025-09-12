const express = require('express');
const {
  getMe,
  getVeterinarians,
  getUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();


router.get('/me', protect, getMe);
router.get('/veterinarians', protect, getVeterinarians);
router.get('/:id', protect, getUser);

module.exports = router;