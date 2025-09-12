const express = require('express');
const {
  getPets,
  getPet,
  createPet,
  updatePet,
  deletePet,
  uploadPetImage,
  addMedicalRecord,
  deleteMedicalRecord,
  addVaccination,
  deleteVaccination,
  addAllergy,
  deleteAllergy,
  addMedication,
  deleteMedication,
  getPetTimeline
} = require('../controllers/petsController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  }
});

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPets)
  .post(upload.array('images', 5), createPet);

router.route('/:id')
  .get(getPet)
  .put(updatePet)
  .delete(deletePet);

router.route('/:id/upload-image')
  .post(upload.array('images', 5), uploadPetImage);

router.route('/:id/medical-records')
  .post(addMedicalRecord);

router.route('/:id/medical-records/:recordId')
  .delete(deleteMedicalRecord);

router.route('/:id/vaccinations')
  .post(addVaccination);

router.route('/:id/vaccinations/:vaccinationId')
  .delete(deleteVaccination);

router.route('/:id/allergies')
  .post(addAllergy);

router.route('/:id/allergies/:allergyId')
  .delete(deleteAllergy);

router.route('/:id/medications')
  .post(addMedication);

router.route('/:id/medications/:medicationId')
  .delete(deleteMedication);

router.route('/:id/timeline')
  .get(getPetTimeline);

module.exports = router;