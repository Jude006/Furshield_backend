const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getVetAppointments,
  updateAppointmentStatus,
  logTreatment  ,
  getPetTreatments
} = require('../controllers/appointment');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getAppointments)
  .post(protect, createAppointment);

router.route('/:id')
  .get(protect, getAppointment)
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

router.route('/vet/:vetId')
  .get(protect, getVetAppointments);

router.route('/:id/status')
  .put(protect, updateAppointmentStatus);

  router.route('/:id/treatment')
  .put(protect, logTreatment);

  router.route('/pet/:petId/treatments')
  .get(protect, getPetTreatments);

module.exports = router;