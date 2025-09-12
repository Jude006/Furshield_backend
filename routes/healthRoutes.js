const express = require('express');
const multer = require('multer');
const {
  getHealthRecords,
  addMedicalRecord,
  addVaccination,
  addAllergy,
  addMedication,
  uploadDocument,
  addInsurance,
  getPetHealthRecordsForVet,
  logTreatment
} = require('../controllers/healthController');

const { protect } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.use(protect);

router.get('/', getHealthRecords);
router.post('/:petId/medical-records', addMedicalRecord);
router.post('/:petId/vaccinations', addVaccination);
router.post('/:petId/allergies', addAllergy);
router.post('/:petId/medications', addMedication);
router.post('/:petId/documents', upload.single('file'), uploadDocument);
router.post('/:petId/insurance', addInsurance);
router.get('/vet/:petId', getPetHealthRecordsForVet);
router.put('/vet/log-treatment/:appointmentId', logTreatment);

module.exports = router;