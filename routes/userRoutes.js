const express = require('express');
const {
  getVeterinarians,
  getMe,
  updateMe,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getVeterinarians);

router.route('/me')
  .get(getMe)
  .put(updateMe);

module.exports = router;