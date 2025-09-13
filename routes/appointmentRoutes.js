// const express = require('express');
// const {
//   getAppointments,
//   getAppointment,
//   createAppointment,
//   updateAppointment,
//   deleteAppointment,
//   getVetAppointments,
//   updateAppointmentStatus
// } = require('../controllers/appointment');

// const { protect } = require('../middleware/authMiddleware');

// const router = express.Router();

// router.use(protect);

// router.route('/')
//   .get(getAppointments)
//   .post(createAppointment);

// router.route('/:id')
//   .get(getAppointment)
//   .put(updateAppointment)
//   .delete(deleteAppointment);

// router.route('/vet/:vetId')
//   .get(getVetAppointments);

// router.route('/:id/status')
//   .put(updateAppointmentStatus);

// module.exports = router;

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