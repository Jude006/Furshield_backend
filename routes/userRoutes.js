const express = require('express');
const {
  getMe,
  getVeterinarians,
  getUser,
  updateMe
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();


router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/veterinarians', protect, getVeterinarians);
router.get('/:id', protect, getUser);
module.exports = router;