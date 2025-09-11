const express = require('express');
const {
  getPets,
  getPet,
  createPet,
  updatePet,
  deletePet,
  uploadPetImage,
  addMedicalRecord,
  addVaccination,
  addAllergy,
  addMedication,
  getPetTimeline
} = require('../controllers/petsController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getPets)
  .post(createPet);

router.route('/:id')
  .get(getPet)
  .put(updatePet)
  .delete(deletePet);

router.route('/:id/upload-image')
  .post(uploadPetImage);

router.route('/:id/medical-records')
  .post(addMedicalRecord);

router.route('/:id/vaccinations')
  .post(addVaccination);

router.route('/:id/allergies')
  .post(addAllergy);

router.route('/:id/medications')
  .post(addMedication);

router.route('/:id/timeline')
  .get(getPetTimeline);

module.exports = router;