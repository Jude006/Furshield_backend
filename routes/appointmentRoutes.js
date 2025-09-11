const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getVetAppointments,
  updateAppointmentStatus
} = require('../controllers/appointment');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.route('/:id')
  .get(getAppointment)
  .put(updateAppointment)
  .delete(deleteAppointment);

router.route('/vet/:vetId')
  .get(getVetAppointments);

router.route('/:id/status')
  .put(updateAppointmentStatus);

module.exports = router;